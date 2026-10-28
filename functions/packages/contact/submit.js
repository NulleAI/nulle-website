'use strict';
/*
 * Form handler for nulle.ai (DigitalOcean Functions, web: true).
 *
 * Handles the two homepage forms, chosen by `kind`:
 *   "review"     the contact form (default when kind is missing)
 *   "checklist"  a request for the AI leak checklist (work email only)
 *
 * Validates a submission, applies basic abuse checks, and sends one plain-text
 * email to the Nulle team through Resend. It never emails the visitor. No
 * dependencies: it uses the runtime's built-in fetch. Submitter details are
 * never logged.
 *
 * Environment (set in project.yml from App Platform / .env):
 *   RESEND_API_KEY   Resend API key with sending access only (secret)
 *   CONTACT_TO       inbox that receives submissions, e.g. connect@nulle.ai
 *   CONTACT_FROM     verified sender, e.g. "Nulle Website <website@nulle.ai>"
 *   ALLOWED_ORIGINS  comma-separated origins allowed to post, e.g. https://nulle.ai
 */
const RESEND_URL = 'https://api.resend.com/emails';
const LIMITS = { name: 120, email: 254, company: 160, role: 120, message: 5000 };
const INDUSTRIES = { health: 'Healthcare', law: 'Law firm', fin: 'Finance', other: 'Something else' };
const HELP = [
  'AI exposure review',
  'Private AI infrastructure',
  'Guardrails and human gates',
  'Monitoring and audit',
  'AI tools, agents, and training for our team',
  'Custom AI software',
  'Not sure yet'
];
const MIN_FILL_MS = 1500;               // faster than this is almost certainly a bot; autofill-friendly
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;                     // per IP per window, per warm instance (best effort)
const EMAIL_RE = /^[^\s@<>()",;:\\]+@[^\s@<>()",;:\\]+\.[^\s@<>()",;:\\]{2,}$/;

const recent = new Map();               // ip -> [timestamps]; in memory only, never logged

function config(args) {
  const get = (k) => String(process.env[k] || (args && typeof args[k] === 'string' ? args[k] : '') || '').trim();
  return {
    key: get('RESEND_API_KEY'),
    to: get('CONTACT_TO'),
    from: get('CONTACT_FROM'),
    origins: get('ALLOWED_ORIGINS').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
  };
}

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    body
  };
}

// Supports both DigitalOcean's `http` object and OpenWhisk-style __ow_* fields.
function readRequest(args) {
  const http = args.http || {};
  const raw = http.headers || args.__ow_headers || {};
  const headers = {};
  for (const k of Object.keys(raw)) headers[k.toLowerCase()] = String(raw[k]);
  const method = String(http.method || args.__ow_method || '').toUpperCase();
  let data = args;
  if (typeof http.body === 'string' && http.body.length) {
    try {
      data = JSON.parse(http.isBase64Encoded ? Buffer.from(http.body, 'base64').toString('utf8') : http.body);
    } catch (e) {
      data = {};
    }
  }
  return { headers, method, data: data && typeof data === 'object' ? data : {} };
}

function originOf(headers) {
  if (headers.origin) return headers.origin.replace(/\/$/, '');
  try { return new URL(headers.referer).origin; } catch (e) { return ''; }
}

function clientIp(headers) {
  return headers['do-connecting-ip'] || (headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function rateLimited(ip, now) {
  for (const [k, list] of recent) {
    const kept = list.filter((t) => now - t < RATE_WINDOW_MS);
    if (kept.length) recent.set(k, kept); else recent.delete(k);
  }
  const list = recent.get(ip) || [];
  if (list.length >= RATE_MAX) return true;
  list.push(now);
  recent.set(ip, list);
  return false;
}

// Strip control characters (keep tabs and newlines for the message), trim.
function text(v) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : '';
}
function oneLine(v) {
  return v.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
}

function validate(data) {
  const f = {
    name: oneLine(text(data.name)),
    email: oneLine(text(data.email)).toLowerCase(),
    company: oneLine(text(data.company)),
    role: oneLine(text(data.role)),
    industry: text(data.industry),
    help: text(data.help),
    message: text(data.message).replace(/\r\n?/g, '\n')
  };
  const bad = [];
  if (!f.name || f.name.length > LIMITS.name) bad.push('name');
  if (!f.email || f.email.length > LIMITS.email || !EMAIL_RE.test(f.email)) bad.push('email');
  if (f.company.length > LIMITS.company) bad.push('company');
  if (f.role.length > LIMITS.role) bad.push('role');
  if (!Object.prototype.hasOwnProperty.call(INDUSTRIES, f.industry)) bad.push('industry');
  if (HELP.indexOf(f.help) === -1) bad.push('help');
  if (f.message.length > LIMITS.message) bad.push('message');
  return { fields: f, bad };
}

function compose(f) {
  const subject = oneLine(`Website: AI exposure review request from ${f.name}${f.company ? ` (${f.company})` : ''}`).slice(0, 200);
  const body = [
    'New request from the nulle.ai contact form.',
    '',
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    `Company: ${f.company || '(not provided)'}`,
    `Role: ${f.role || '(not provided)'}`,
    `Industry: ${INDUSTRIES[f.industry]}`,
    `Where to start: ${f.help}`,
    '',
    'How they use AI today:',
    f.message || '(not provided)',
    '',
    '---',
    'Reply to this email to answer them directly.'
  ].join('\n');
  return { subject, body };
}

function validateChecklist(data) {
  const f = { email: oneLine(text(data.email)).toLowerCase() };
  const bad = [];
  if (!f.email || f.email.length > LIMITS.email || !EMAIL_RE.test(f.email)) bad.push('email');
  return { fields: f, bad };
}

function composeChecklist(f) {
  const subject = `Website: AI leak checklist request from ${f.email}`.slice(0, 200);
  const body = [
    'New request for the AI leak checklist from the nulle.ai homepage.',
    '',
    `Send it to: ${f.email}`,
    '',
    '---',
    'Reply to this email to send the checklist directly.'
  ].join('\n');
  return { subject, body };
}

const FORMS = {
  review: { validate, compose, tag: 'website_contact' },
  checklist: { validate: validateChecklist, compose: composeChecklist, tag: 'website_checklist' }
};

async function main(args) {
  args = args || {};
  const { headers, method, data } = readRequest(args);
  if (method === 'OPTIONS') return { statusCode: 204, headers: { Allow: 'POST, OPTIONS' }, body: '' };
  if (method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' });

  const cfg = config(args);
  if (!cfg.origins.length || cfg.origins.indexOf(originOf(headers)) === -1) {
    return reply(403, { ok: false, error: 'forbidden' });
  }

  // Bot signals get a quiet success so they learn nothing. Nothing is sent.
  const started = Number(data.started);
  const age = Date.now() - started;
  if (text(data.website) || !Number.isFinite(started) || age < MIN_FILL_MS) {
    return reply(200, { ok: true });
  }

  if (rateLimited(clientIp(headers), Date.now())) return reply(429, { ok: false, error: 'rate_limited' });

  const kind = text(data.kind) || 'review';
  const form = Object.prototype.hasOwnProperty.call(FORMS, kind) ? FORMS[kind] : null;
  if (!form) return reply(400, { ok: false, error: 'invalid', fields: ['kind'] });
  const { fields, bad } = form.validate(data);
  if (bad.length) return reply(400, { ok: false, error: 'invalid', fields: bad });

  if (!cfg.key || !cfg.to || !cfg.from) {
    console.error('contact_submit: missing configuration');
    return reply(500, { ok: false, error: 'unavailable' });
  }

  const { subject, body } = form.compose(fields);
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: cfg.from,
        to: [cfg.to],
        reply_to: fields.email,
        subject,
        text: body,
        tags: [{ name: 'source', value: form.tag }]
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      console.error('contact_submit: resend responded', res.status);
      return reply(502, { ok: false, error: 'send_failed' });
    }
  } catch (e) {
    console.error('contact_submit: resend request failed', e && e.name);
    return reply(502, { ok: false, error: 'send_failed' });
  }
  return reply(200, { ok: true });
}

exports.main = main;
exports._internal = { validate, compose, validateChecklist, composeChecklist, readRequest, recent };
