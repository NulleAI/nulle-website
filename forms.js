/* Nulle forms: the homepage contact form, and the checklist buttons on the Free checklists page, which hand off to it. No third-party scripts. */
(function () {
  function $(id) { return document.getElementById(id); }

  // Forms post to the DigitalOcean Function at /api/contact/submit.
  // Until nulle.ai is verified in Resend, they open the visitor's email app
  // instead, with the request filled in and addressed to connect@nulle.ai.
  // Set USE_EMAIL_APP to false to send through the function again.
  var USE_EMAIL_APP = true;
  function openDraft(subject, lines, msg) {
    var body = lines.join('\n');
    if (body.length > 1500) body = body.slice(0, 1500) + '…';  // long mailto links fail in some email apps
    // Show the message first, so the button still answers if the browser blocks email links.
    msg.className = 'f-msg';
    msg.textContent = 'Your email app should open with this ready to send. If it doesn’t, email connect@nulle.ai.';
    try {
      window.location.href = 'mailto:connect@nulle.ai?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    } catch (err) {
      msg.textContent = 'Your browser didn’t open an email app. Email connect@nulle.ai and we’ll reply.';
    }
  }
  function okEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  var formStarted = Date.now();
  var FALLBACK = 'We couldn’t send that just now. Please email connect@nulle.ai, or try again in a few minutes.';
  function send(payload, btn, msg, onOk) {
    var label = btn.firstChild.textContent;
    btn.disabled = true; btn.firstChild.textContent = 'Sending… ';
    msg.className = 'f-msg'; msg.textContent = '';
    payload.started = formStarted;
    fetch('/api/contact/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.ok === true, status: r.status }; });
    }).then(function (res) {
      if (res.ok) { onOk(); return; }
      msg.className = 'f-msg err';
      if (res.status === 400) msg.textContent = 'Please check your details and try again.';
      else if (res.status === 429) msg.textContent = 'Too many requests from this connection. Please try again later, or email connect@nulle.ai.';
      else msg.textContent = FALLBACK;
    }, function () {
      msg.className = 'f-msg err'; msg.textContent = FALLBACK;
    }).then(function () {
      btn.disabled = false; btn.firstChild.textContent = label;
    });
  }
  // Checklist buttons hand off to the contact form with "Send me a checklist" chosen.
  // The checklist name goes in the URL; the email goes in sessionStorage (this tab
  // only), so it never lands in browser history or server logs.
  var CHECKLIST_OPTION = 'Send me a checklist';
  var CHECKLISTS = { leaks: '10 places your secrets are leaking into AI', ship: 'Before you ship an AI-built app: 10 checks' };
  var STORE = 'nulle-checklist-request';
  function isChecklist(key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(CHECKLISTS, key); }
  var CONTACT_PAGE = 'index.html';  // the homepage, where the contact form lives
  // The destination and checklist names are fixed here, never read from the page.
  function checklistForm(ids, key) {
    var form = $(ids + '-form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = $(ids + '-msg'), v = $(ids + '-email').value.trim();
      if (!okEmail(v)) { m.className = 'f-msg err'; m.textContent = 'Enter a work email like you@yourcompany.com.'; return; }
      try { sessionStorage.setItem(STORE, JSON.stringify({ list: key, email: v })); } catch (err) { /* storage blocked: the form still opens with the checklist chosen */ }
      window.location.href = CONTACT_PAGE + '?checklist=' + key + '#contact';
    });
  }
  checklistForm('ck', 'leaks');
  checklistForm('ship', 'ship');

  var ct = $('ct-form');
  if (ct) {
    var key = null, saved = null;
    try { key = new URLSearchParams(window.location.search).get('checklist'); } catch (err) {}
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); sessionStorage.removeItem(STORE); } catch (err) {}
    if (!isChecklist(key) && saved) key = saved.list;
    if (isChecklist(key)) {
      $('f-help').value = CHECKLIST_OPTION;
      if (saved && typeof saved.email === 'string' && okEmail(saved.email) && !$('f-email').value) $('f-email').value = saved.email;
      if (!$('f-msg').value) $('f-msg').value = 'Please send me the checklist: ' + CHECKLISTS[key] + '.';
      $('ct-msg').className = 'f-msg';
      $('ct-msg').textContent = 'Add your name and industry, then send. We’ll email you the checklist.';
      try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch (err) {}
      try { $('contact').scrollIntoView({ behavior: 'instant', block: 'start' }); } catch (err) {}  // jump, don't smooth-scroll the whole page
    }
  }
  if (ct) ct.addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('ct-msg'), miss = [];
    if (!$('f-name').value.trim()) miss.push('your name');
    if (!okEmail($('f-email').value.trim())) miss.push('a valid work email');
    if (!$('f-ind').value) miss.push('your industry');
    if (!$('f-help').value) miss.push('where to start');
    if (miss.length) { m.className = 'f-msg err'; m.textContent = 'Add ' + miss.join(', ') + ' to continue.'; return; }
    var form = this, email = $('f-email').value.trim();
    if (USE_EMAIL_APP) {
      var name = $('f-name').value.trim(), co = $('f-co').value.trim(), ind = $('f-ind'), wantsList = $('f-help').value === CHECKLIST_OPTION;
      openDraft((wantsList ? 'Website: checklist request from ' : 'Website: AI exposure review request from ') + name + (co ? ' (' + co + ')' : ''), [
        'Hi Nulle team,', '',
        'Name: ' + name,
        'Email: ' + email,
        'Company: ' + (co || '(not provided)'),
        'Role: ' + ($('f-role').value.trim() || '(not provided)'),
        'Industry: ' + ind.options[ind.selectedIndex].text,
        'Where to start: ' + $('f-help').value,
        '', wantsList ? 'Message:' : 'How we use AI today:', $('f-msg').value.trim() || '(not provided)'
      ], m);
      return;
    }
    send({
      kind: 'review', name: $('f-name').value.trim(), email: email, company: $('f-co').value.trim(), role: $('f-role').value.trim(),
      industry: $('f-ind').value, help: $('f-help').value, message: $('f-msg').value.trim(), website: $('f-website').value
    }, $('ct-send'), m, function () {
      form.reset();
      m.className = 'f-msg'; m.textContent = 'Thanks. Your request is in, and we’ll reply to ' + email + '.';
    });
  });
})();
