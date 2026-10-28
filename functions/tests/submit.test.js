'use strict';
// Unit tests for the contact form function. Run: node --test functions/tests/submit.test.js
// Resend is mocked; no network calls are made.
const test = require('node:test');
const assert = require('node:assert');
const { main, _internal } = require('../packages/contact/submit.js');

const ORIGIN = 'https://nulle.ai';
let calls;

function env() {
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.CONTACT_TO = 'connect@nulle.ai';
  process.env.CONTACT_FROM = 'Nulle Website <website@nulle.ai>';
  process.env.ALLOWED_ORIGINS = 'https://nulle.ai,https://www.nulle.ai';
}

function mockResend(status = 200) {
  calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    return { ok: status >= 200 && status < 300, status, json: async () => ({ id: 'email_123' }) };
  };
}

function form(over = {}) {
  return Object.assign({
    name: 'Dana Reyes',
    email: 'Dana@Example.com',
    company: 'Harlow Clinic',
    role: 'COO',
    industry: 'health',
    help: 'AI exposure review',
    message: 'We use ChatGPT for drafts.\r\nOur developer uses an AI coding tool.',
    website: '',
    started: Date.now() - 20000
  }, over);
}

// DigitalOcean web function shape: JSON body fields merged into args, plus `http`.
function req(data, { method = 'POST', origin = ORIGIN, ip = '203.0.113.7', raw = false } = {}) {
  const headers = { 'Content-Type': 'application/json', 'DO-Connecting-IP': ip };
  if (origin) headers.Origin = origin;
  if (raw) return { http: { method, headers, body: JSON.stringify(data) } };
  return Object.assign({ http: { method, headers } }, data);
}

test.beforeEach(() => { env(); mockResend(); _internal.recent.clear(); });

test('sends one plain-text email to the team with reply-to set to the visitor', async () => {
  const res = await main(req(form()));
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(calls.length, 1);
  const c = calls[0];
  assert.strictEqual(c.url, 'https://api.resend.com/emails');
  assert.strictEqual(c.opts.method, 'POST');
  assert.strictEqual(c.opts.headers.Authorization, 'Bearer re_test_key');
  assert.deepStrictEqual(c.body.to, ['connect@nulle.ai']);
  assert.strictEqual(c.body.from, 'Nulle Website <website@nulle.ai>');
  assert.strictEqual(c.body.reply_to, 'dana@example.com');
  assert.strictEqual(c.body.subject, 'Website: AI exposure review request from Dana Reyes (Harlow Clinic)');
  assert.ok(!('html' in c.body), 'no HTML body');
  assert.match(c.body.text, /Industry: Healthcare/);
  assert.match(c.body.text, /We use ChatGPT for drafts\.\nOur developer/);
});

test('accepts a raw JSON body in http.body', async () => {
  const res = await main(req(form(), { raw: true }));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(calls.length, 1);
});

test('rejects other origins and missing origin', async () => {
  assert.strictEqual((await main(req(form(), { origin: 'https://evil.example' }))).statusCode, 403);
  assert.strictEqual((await main(req(form(), { origin: null }))).statusCode, 403);
  assert.strictEqual(calls.length, 0);
});

test('fails closed when ALLOWED_ORIGINS is not configured', async () => {
  delete process.env.ALLOWED_ORIGINS;
  assert.strictEqual((await main(req(form()))).statusCode, 403);
  assert.strictEqual(calls.length, 0);
});

test('only POST is accepted', async () => {
  assert.strictEqual((await main(req(form(), { method: 'GET' }))).statusCode, 405);
  assert.strictEqual((await main(req({}, { method: 'OPTIONS' }))).statusCode, 204);
  assert.strictEqual(calls.length, 0);
});

test('honeypot and too-fast submissions get a quiet success and send nothing', async () => {
  assert.deepStrictEqual((await main(req(form({ website: 'http://spam.example' })))).body, { ok: true });
  assert.deepStrictEqual((await main(req(form({ started: Date.now() - 500 })))).body, { ok: true });
  assert.deepStrictEqual((await main(req(form({ started: 'nope' })))).body, { ok: true });
  assert.strictEqual(calls.length, 0);
});

test('validates required fields, allowed values, and lengths', async () => {
  const res = await main(req(form({ name: '', email: 'not-an-email', industry: 'crypto', help: 'Anything', message: 'x'.repeat(5001) })));
  assert.strictEqual(res.statusCode, 400);
  assert.deepStrictEqual(res.body.fields.sort(), ['email', 'help', 'industry', 'message', 'name']);
  assert.strictEqual(calls.length, 0);
});

test('header injection attempts are flattened to one line', async () => {
  await main(req(form({ name: 'Dana\r\nBcc: victim@example.com', company: '' })));
  assert.strictEqual(calls[0].body.subject, 'Website: AI exposure review request from Dana Bcc: victim@example.com');
  assert.ok(!/[\r\n]/.test(calls[0].body.subject));
  const bad = await main(req(form({ email: 'a@b.co\r\nBcc: x@y.z' })));
  assert.strictEqual(bad.statusCode, 400);
});

test('rate limits a single IP after five submissions in the window', async () => {
  for (let i = 0; i < 5; i++) assert.strictEqual((await main(req(form()))).statusCode, 200);
  assert.strictEqual((await main(req(form()))).statusCode, 429);
  assert.strictEqual((await main(req(form(), { ip: '198.51.100.9' }))).statusCode, 200);
});

test('reports a send failure without leaking details', async () => {
  mockResend(422);
  const res = await main(req(form()));
  assert.strictEqual(res.statusCode, 502);
  assert.deepStrictEqual(res.body, { ok: false, error: 'send_failed' });
});

test('reports unavailable when the API key is missing', async () => {
  delete process.env.RESEND_API_KEY;
  const res = await main(req(form()));
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(calls.length, 0);
});

// Checklist requests (kind: "checklist")
function checklist(over = {}) {
  return Object.assign({ kind: 'checklist', email: 'Lee@Example.com', website: '', started: Date.now() - 20000 }, over);
}

test('the contact form is the default kind and keeps its tag', async () => {
  await main(req(form()));
  assert.deepStrictEqual(calls[0].body.tags, [{ name: 'source', value: 'website_contact' }]);
});

test('checklist requests need only a work email and notify the team', async () => {
  const res = await main(req(checklist()));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(calls.length, 1);
  const b = calls[0].body;
  assert.deepStrictEqual(b.to, ['connect@nulle.ai']);
  assert.strictEqual(b.reply_to, 'lee@example.com');
  assert.strictEqual(b.subject, 'Website: AI leak checklist request from lee@example.com');
  assert.match(b.text, /Send it to: lee@example\.com/);
  assert.deepStrictEqual(b.tags, [{ name: 'source', value: 'website_checklist' }]);
  assert.ok(!('html' in b));
});

test('checklist rejects a bad email, and unknown kinds are rejected', async () => {
  assert.deepStrictEqual((await main(req(checklist({ email: 'nope' })))).body.fields, ['email']);
  assert.deepStrictEqual((await main(req(checklist({ email: 'a@b.co\nBcc: x@y.z' })))).body.fields, ['email']);
  assert.deepStrictEqual((await main(req(checklist({ kind: 'newsletter' })))).body.fields, ['kind']);
  assert.deepStrictEqual((await main(req(checklist({ kind: '__proto__' })))).body.fields, ['kind']);
  assert.strictEqual(calls.length, 0);
});

test('checklist bot signals get a quiet success and send nothing', async () => {
  assert.deepStrictEqual((await main(req(checklist({ website: 'x' })))).body, { ok: true });
  assert.deepStrictEqual((await main(req(checklist({ started: Date.now() })))).body, { ok: true });
  assert.strictEqual(calls.length, 0);
});
