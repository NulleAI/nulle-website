(function () {
  'use strict';

  // ── Nav scroll ────────────────────────────────────
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ── Mobile menu ───────────────────────────────────
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('mobileMenu');

  toggle.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    toggle.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ── Smooth scroll ────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ── Reveal on scroll (skip hero — hero uses pure CSS animation) ──
  const reveals = document.querySelectorAll('.reveal');
  const heroSection = document.querySelector('.hero');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => {
    // Hero elements animate via CSS @keyframes — don't double-observe
    if (heroSection && heroSection.contains(el)) return;
    revealObserver.observe(el);
  });

  // ── Word-by-word reveal for big statements ────────
  document.querySelectorAll('[data-reveal="words"]').forEach(container => {
    const p = container.querySelector('p');
    if (!p) return;

    const html = p.innerHTML;

    // Wrap text nodes in word spans, pass HTML tags through
    const wrapped = html.replace(
      /(<[^>]+>)|(\S+)/g,
      (match, tag, word) => {
        if (tag) return tag;
        return '<span class="word">' + word + '</span> ';
      }
    );
    p.innerHTML = wrapped;

    // Fix: apply gradient per-word for spans inside .text-gradient
    // (parent background-clip breaks on inline-block children)
    p.querySelectorAll('.text-gradient .word').forEach(w => {
      w.classList.add('word-gradient');
    });

    const words = p.querySelectorAll('.word');

    const wordObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            words.forEach((w, i) => {
              setTimeout(() => w.classList.add('visible'), i * 30);
            });
            wordObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    wordObserver.observe(container);
  });

  // ── Active nav link on scroll ───────────────────
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const section = document.querySelector(id);
    if (section) sections.push({ el: section, id: id });
  });

  const navObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const match = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
          if (match) match.classList.add('active');
        }
      });
    },
    { threshold: 0, rootMargin: '-50% 0px -50% 0px' }
  );

  sections.forEach(s => navObserver.observe(s.el));

  // ── Stagger siblings ─────────────────────────────
  document.querySelectorAll('.beliefs, .services-grid, .contrast-grid, .journey, .builders-grid, .product-features').forEach(group => {
    const items = group.querySelectorAll('.reveal');
    items.forEach((item, i) => {
      item.style.transitionDelay = (i * 0.12) + 's';
    });
  });

})();
