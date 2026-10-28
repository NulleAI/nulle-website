/* Nulle home page interactions. No third-party scripts. */
(function () {
  var CHECK = '<svg class="ic"><use href="#i-check"/></svg>';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function $(id) { return document.getElementById(id); }

  // Hero: two futures
  var fut = $('fut');
  fut.querySelectorAll('button[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      fut.setAttribute('data-mode', b.getAttribute('data-mode'));
      fut.querySelectorAll('button[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });
  if (REDUCED) document.querySelectorAll('.fut-svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  // Stack
  var LAY = [
    { k: 'The ground it all stands on', t: 'Private infrastructure', d: 'Hardware you buy or lease, or a private cloud in your name. Your data, models, settings, and logins belong to you.',
      b: ['Runs in your office or your private cloud', 'Keeps working with the internet off', 'You hold the master keys'] },
    { k: 'Rules your AI can’t break', t: 'Guardrails', d: 'Your rules for what AI can see, say, and do. Secrets are blocked from leaving, and requests to public AI platforms are cleaned first.',
      b: ['Blocks passwords, client data, and designs from leaving', 'Cleans requests to public AI', 'Screens files for hidden instructions'] },
    { k: 'A person decides what matters', t: 'Human gates', d: 'Before AI sends, pays, deletes, or publishes anything important, the right person approves it. You choose where the gates go.',
      b: ['Approval before anything leaves the company', 'Limits on what each agent can touch', 'A named owner for every decision'] },
    { k: 'Nothing happens in the dark', t: 'Monitoring and audit', d: 'Every request and action is recorded in plain English, with alerts in real time. Hand the record to an auditor, a regulator, or a client.',
      b: ['Live alerts on leaks and risky actions', 'A searchable record of everything AI did', 'Reports ready for audits and security reviews'] },
    { k: 'Where you go on offense', t: 'Tools for your team', d: 'Ethical AI tools, skills training, agents, and custom software your people use every day, all running on the layers below.',
      b: ['Private chat, search, and drafting', 'Agents that finish multi-step work', 'Custom software and training for every team'] }
  ];
  var lays = Array.prototype.slice.call(document.querySelectorAll('.iso .lay'));
  var lyBtns = Array.prototype.slice.call(document.querySelectorAll('.ly'));
  function pickLayer(i) {
    var L = LAY[i];
    lays.forEach(function (g) {
      var j = +g.getAttribute('data-i');
      g.classList.toggle('on', j === i);
      g.style.transform = j > i ? 'translateY(-64px)' : 'none';
    });
    lyBtns.forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-i') === i ? 'true' : 'false'); });
    $('ld-n').textContent = 'Layer 0' + (i + 1) + ' · ' + L.k;
    $('ld-t').textContent = L.t;
    $('ld-d').textContent = L.d;
    $('ld-b').innerHTML = L.b.map(function (x) { return '<li>' + CHECK + esc(x) + '</li>'; }).join('');
  }
  lyBtns.forEach(function (b) { b.addEventListener('click', function () { pickLayer(+b.getAttribute('data-i')); }); });
  lays.forEach(function (g) { g.addEventListener('click', function () { pickLayer(+g.getAttribute('data-i')); }); });
  pickLayer(0);

  // Advocate demo
  var ADV = {
    health: {
      i: 'Summarize treatment options for <mark class="pii">Maria Lopez</mark>, born <mark class="pii">03/14/1961</mark>, record <mark class="pii">448812</mark>, newly diagnosed with stage 2 breast cancer, and draft an appeal to her insurer.',
      o: 'Summarize treatment options for <span class="ph">PATIENT_1</span>, a woman in her 60s, newly diagnosed with stage 2 breast cancer, and draft an appeal to her insurer.',
      a: [['ok', 'Removed a name'], ['ok', 'Removed a birth date and record number'], ['ok', 'Sent through your business account'], ['ok', 'Logged what left']],
      r: 'The answer comes back with Maria Lopez’s details put back in, ready for her doctor to review.',
      l: 'Like a patient advocate, it speaks up for your patients when you’re not in the room.' },
    law: {
      i: 'Draft a reply to opposing counsel in <mark class="pii">Harlow Properties v. Whitfield</mark> about the early termination clause. <mark class="pii">Our client admits she missed the March payment.</mark>',
      o: 'Draft a reply to opposing counsel in <span class="ph">CASE_1</span> about an early termination clause in a residential lease.',
      a: [['ok', 'Removed the case and party names'], ['block', 'Held back a client admission'], ['ok', 'Sent through your business account'], ['ok', 'Logged what left']],
      r: 'The draft comes back with the names put back in. The admission never left the firm.',
      l: 'Like good counsel, it shares only what helps your client, and nothing that could hurt them.' },
    fin: {
      i: 'Suggest a tax-loss harvesting plan before year end for the <mark class="pii">Thompson family</mark> portfolio, account <mark class="pii">4471-9920</mark>, about $2.4M. Custodian login: <mark class="pii">jthompson / Spring2026!</mark>',
      o: 'Suggest a tax-loss harvesting plan before year end for a <span class="ph">CLIENT_1</span> portfolio of about $2.4M.',
      a: [['ok', 'Removed a family name'], ['ok', 'Removed an account number'], ['block', 'Blocked a password and flagged it to change'], ['ok', 'Logged what left']],
      r: 'The plan comes back with the Thompson name put back in, plus an alert to change that password.',
      l: 'Like a fiduciary, it acts in your clients’ interest every time it acts.' }
  };
  document.querySelectorAll('[data-ind-seg] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-k'), d = ADV[k];
      document.querySelectorAll('[data-ind-seg] button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $('adv-in').innerHTML = d.i;
      $('adv-out').innerHTML = d.o;
      $('adv-acts').innerHTML = d.a.map(function (a) {
        var bl = a[0] === 'block';
        return '<li' + (bl ? ' class="block"' : '') + '><svg class="ic"><use href="#i-' + (bl ? 'x' : 'check') + '"/></svg>' + esc(a[1]) + '</li>';
      }).join('');
      $('adv-back').textContent = d.r;
      $('adv-like').textContent = d.l;
      var sel = $('f-ind'); if (sel) sel.value = k;
    });
  });

  // Monitoring console
  var EV = [
    ['held', 'An agent drafted a price change for 400 customers. Waiting for approval.', 'Finance'],
    ['blocked', 'Product designs were uploaded to an unapproved AI tool. Upload stopped and owner notified.', 'Design'],
    ['cleaned', 'A market question went to ChatGPT with the client’s name and deal size removed.', 'Sales'],
    ['logged', 'The weekly audit report is ready for your compliance lead.', 'Admin'],
    ['caught', 'A new browser extension tried to read the CRM. Access denied and IT notified.', 'IT'],
    ['held', 'An agent asked to delete 2,000 old records. Waiting for approval.', 'Operations'],
    ['blocked', 'A client list was attached to a personal email bound for an AI app. Stopped before it left.', 'Marketing'],
    ['cleaned', 'A coding question went to a public AI model with the database password stripped out.', 'Engineering']
  ];
  var KN = { blocked: 'Blocked', held: 'Held', caught: 'Caught', cleaned: 'Cleaned', logged: 'Logged' };
  var list = $('con-list'), ei = 0, req = 1284, held = 6, blk = 3, clock = 10 * 60 + 42;
  function fmt(n) { return n.toLocaleString('en-US'); }
  function tick() {
    var e = EV[ei % EV.length]; ei++;
    clock += 2 + (ei % 4); req += 7 + (ei * 5) % 13;
    if (e[0] === 'held') held++;
    if (e[0] === 'blocked' || e[0] === 'caught') blk++;
    var t = String(Math.floor(clock / 60) % 24).padStart(2, '0') + ':' + String(clock % 60).padStart(2, '0');
    var li = document.createElement('li');
    li.className = 'new';
    li.innerHTML = '<span class="ev-t">' + t + '</span><span class="ev-k k-' + e[0] + '">' + KN[e[0]] + '</span><span class="ev-x">' + esc(e[1]) + '</span><span class="ev-tm">' + esc(e[2]) + '</span>';
    list.insertBefore(li, list.firstChild);
    while (list.children.length > 5) list.removeChild(list.lastChild);
    $('cs-req').textContent = fmt(req); $('cs-held').textContent = held; $('cs-blk').textContent = blk;
  }
  if (!REDUCED) {
    var timer = null;
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting && !timer) timer = setInterval(tick, 3200);
        if (!x.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }) : null;
    if (io) io.observe($('watch')); else timer = setInterval(tick, 3200);
  }
  $('con-exp').addEventListener('click', function () {
    $('con-msg').textContent = 'This is a demo. In your system, this exports the full record for the period you choose.';
  });

  // Plan stepper
  var STEPS = [
    { t: 'Find your exposure', d: 'We map where AI is used across your company, what’s leaking, and what your teams are building on public AI.',
      h: ['Conversations with leaders and teams', 'A review of AI tools, accounts, agents, and code', 'A check for exposed passwords, keys, and client data'],
      g: ['A plain-English exposure report', 'A ranked plan, biggest risks first', 'A draft AI policy your people can follow'] },
    { t: 'Build your stack', d: 'We custom fit every layer to how your company works: private infrastructure, guardrails, human gates, and monitoring.',
      h: ['Choose to buy or lease hardware, or a private cloud in your name', 'Set your guardrails and decide where the human gates go', 'Turn on monitoring and the audit record'],
      g: ['A private AI stack you own', 'Rules that match your risks and regulations', 'An AI Facts label for your system'] },
    { t: 'Go on offense', d: 'We put AI to work across your teams, train your people, and keep watch as you grow.',
      h: ['Roll out tools and agents team by team', 'Hands-on training and playbooks', 'Ongoing monitoring, updates, and support'],
      g: ['Teams shipping faster with approved AI', 'Regular reviews and new uses as you grow', 'A partner who stays after launch'] }
  ];
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function li(x) { return '<li>' + CHECK + esc(x) + '</li>'; }
  function pick(i, focus) {
    var s = STEPS[i];
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.setAttribute('tabindex', j === i ? '0' : '-1'); });
    $('stage').setAttribute('aria-labelledby', 'tab-' + i);
    $('st-n').textContent = 'Step 0' + (i + 1) + ' / 03';
    $('st-t').textContent = s.t; $('st-d').textContent = s.d;
    $('st-h').innerHTML = s.h.map(li).join(''); $('st-g').innerHTML = s.g.map(li).join('');
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick((i + tabs.length - 1) % tabs.length, true); }
    });
  });

  // Mobile menu
  var burger = $('burger'), menu = $('menu');
  function setMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  // Forms. Both post to the DigitalOcean Function at /api/contact/submit.
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
  $('ck-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = this, m = $('ck-msg'), v = $('ck-email').value.trim();
    if (!okEmail(v)) { m.className = 'f-msg err'; m.textContent = 'Enter a work email like you@yourcompany.com.'; return; }
    send({ kind: 'checklist', email: v, website: $('ck-website').value }, $('ck-send'), m, function () {
      form.reset();
      m.className = 'f-msg'; m.textContent = 'Thanks. We’ll send the checklist to ' + v + '.';
    });
  });
  $('ct-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('ct-msg'), miss = [];
    if (!$('f-name').value.trim()) miss.push('your name');
    if (!okEmail($('f-email').value.trim())) miss.push('a valid work email');
    if (!$('f-ind').value) miss.push('your industry');
    if (!$('f-help').value) miss.push('where to start');
    if (miss.length) { m.className = 'f-msg err'; m.textContent = 'Add ' + miss.join(', ') + ' to continue.'; return; }
    var form = this, email = $('f-email').value.trim();
    send({
      kind: 'review', name: $('f-name').value.trim(), email: email, company: $('f-co').value.trim(), role: $('f-role').value.trim(),
      industry: $('f-ind').value, help: $('f-help').value, message: $('f-msg').value.trim(), website: $('f-website').value
    }, $('ct-send'), m, function () {
      form.reset();
      m.className = 'f-msg'; m.textContent = 'Thanks. Your request is in, and we’ll reply to ' + email + '.';
    });
  });
})();
