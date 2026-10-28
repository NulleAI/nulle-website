/* Nulle subpage interactions (Labs, Founders): mobile menu and email panels. No third-party scripts. */
(function () {
  document.querySelectorAll('.burger').forEach(function (burger) {
    var menu = document.getElementById(burger.getAttribute('aria-controls'));
    if (!menu) return;
    function setMenu(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    }
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
    });
  });

  // Email panels: show the address with copy and email-app options, so the action
  // still works for visitors without a desktop email app.
  document.querySelectorAll('[data-mail-toggle]').forEach(function (btn) {
    var pop = document.getElementById(btn.getAttribute('aria-controls'));
    if (!pop) return;
    btn.addEventListener('click', function () {
      var open = pop.hidden;
      pop.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) pop.querySelector('[data-copy]').focus();
    });
  });
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var pop = b.closest('.mail-pop'), msg = pop.querySelector('.mail-msg'), addr = pop.querySelector('.mail-addr');
      var value = b.getAttribute('data-copy');
      function selectAddr() {
        var r = document.createRange(); r.selectNodeContents(addr);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        msg.textContent = 'Address selected. Press Ctrl+C or Cmd+C to copy it.';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { msg.textContent = 'Copied ' + value + ' to your clipboard.'; }, selectAddr);
      } else {
        selectAddr();
      }
    });
  });
})();
