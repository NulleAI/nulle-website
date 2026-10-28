/* Nulle subpage interactions (Labs, Founders): mobile menu only. No third-party scripts. */
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
})();
