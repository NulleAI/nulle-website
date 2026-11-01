/* Nulle forms: the homepage contact form and the checklist requests (homepage and Free checklists page). No third-party scripts. */
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
    window.location.href = 'mailto:connect@nulle.ai?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    msg.className = 'f-msg';
    msg.textContent = 'Your email app should open with this ready to send. If it doesn’t, email connect@nulle.ai.';
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
  function checklistForm(ids, subject, line, kind) {
    var form = $(ids + '-form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = $(ids + '-msg'), v = $(ids + '-email').value.trim();
      if (!okEmail(v)) { m.className = 'f-msg err'; m.textContent = 'Enter a work email like you@yourcompany.com.'; return; }
      if (USE_EMAIL_APP) {
        openDraft(subject + v, ['Hi Nulle team,', '', line + v], m);
        return;
      }
      send({ kind: kind, email: v, website: $(ids + '-website').value }, $(ids + '-send'), m, function () {
        form.reset();
        m.className = 'f-msg'; m.textContent = 'Thanks. We’ll send the checklist to ' + v + '.';
      });
    });
  }
  checklistForm('ck', 'Website: AI leak checklist request from ', 'Please send the AI leak checklist to: ', 'checklist');
  checklistForm('ship', 'Website: AI app launch checklist request from ', 'Please send the AI app launch checklist to: ', 'app-checklist');
  var ct = $('ct-form');
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
      var name = $('f-name').value.trim(), co = $('f-co').value.trim(), ind = $('f-ind');
      openDraft('Website: AI exposure review request from ' + name + (co ? ' (' + co + ')' : ''), [
        'Hi Nulle team,', '',
        'Name: ' + name,
        'Email: ' + email,
        'Company: ' + (co || '(not provided)'),
        'Role: ' + ($('f-role').value.trim() || '(not provided)'),
        'Industry: ' + ind.options[ind.selectedIndex].text,
        'Where to start: ' + $('f-help').value,
        '', 'How we use AI today:', $('f-msg').value.trim() || '(not provided)'
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
