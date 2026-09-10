/* World of Hospitality: homepage choreography. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const isPhone = window.matchMedia('(max-width: 900px)').matches;
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined' && hasGsap) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Menu ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  /* ---------- Wall: hover widens a house and plays its film ---------- */
  const wall = document.getElementById('wall');
  const panels = Array.from(document.querySelectorAll('.wall__panel'));
  const caption = document.getElementById('wallCaption');
  function playVideo(p) { const v = p.querySelector('video'); if (v) { if (v.preload === 'none') v.load(); v.play().catch(() => {}); } }
  function stopVideo(p) { const v = p.querySelector('video'); if (v) v.pause(); }
  if (wall && !isPhone) {
    panels.forEach(p => {
      p.addEventListener('mouseenter', () => {
        wall.classList.add('is-hover');
        panels.forEach(q => { q.classList.toggle('is-on', q === p); if (q !== p) stopVideo(q); });
        playVideo(p);
        if (caption) caption.innerHTML = p.querySelector('.wall__name').textContent + ' <span>· ' + p.querySelector('.wall__meta').textContent + '</span>';
      });
    });
    wall.addEventListener('mouseleave', () => {
      wall.classList.remove('is-hover');
      panels.forEach(q => { q.classList.remove('is-on'); stopVideo(q); });
      if (caption) caption.innerHTML = 'Five houses in Doha <span>· Choose one</span>';
    });
  } else if (wall) {
    const io = new IntersectionObserver(en => en.forEach(e => { e.isIntersecting ? playVideo(e.target) : stopVideo(e.target); }), { threshold: 0.6 });
    panels.forEach(p => io.observe(p));
  }

  /* ---------- Split the intro into words ---------- */
  const st = document.querySelector('[data-split]');
  if (st) st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');

  /* ---------- Load sequence ---------- */
  const veil = document.getElementById('veil');
  const nav = document.getElementById('nav');
  function reveal() {
    document.body.classList.remove('is-loading');
    if (!hasGsap || reduce) {
      document.body.classList.add('no-motion');
      if (veil) veil.remove();
      if (nav) { nav.style.opacity = 1; nav.style.transform = 'none'; }
      return;
    }
    const quick = sessionStorage.getItem('woh-seen') === '1';
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const open = (at) => tl
      .to('.veil__panel--left', { xPercent: -100, duration: 1.2, ease: 'power4.inOut' }, at)
      .to('.veil__panel--right', { xPercent: 100, duration: 1.2, ease: 'power4.inOut' }, at)
      .fromTo('.wall__panel', { opacity: 0 }, { opacity: 1, duration: 1.2, stagger: 0.08 }, at + 0.35)
      .to('.wall__caption', { opacity: 1, duration: 0.8 }, at + 1.0)
      .to(nav, { opacity: 1, y: 0, duration: 0.9 }, at + 0.8)
      .set(veil, { display: 'none' });
    if (quick) { gsap.set('.veil__centre, .veil__frame', { opacity: 0 }); open(0); return; }
    tl.to('.veil__corner', { strokeDashoffset: 0, duration: 1.1, stagger: 0.08 }, 0.15)
      .set('.veil__sweep', { opacity: 1 }, 0.5)
      .to('.veil__mark', { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'power2.inOut' }, 0.5)
      .to('.veil__sweep', { left: '100%', duration: 1.3, ease: 'power2.inOut' }, 0.5)
      .to('.veil__sweep', { opacity: 0, duration: 0.3 }, 1.7)
      .to('.veil__rule', { width: 'min(60vw, 520px)', duration: 0.9, ease: 'power3.inOut' }, 1.2)
      .to('.veil__houses span', { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: 'power2.out' }, 1.5)
      .to('.veil__centre', { opacity: 0, y: -10, duration: 0.5, ease: 'power2.in' }, 2.8)
      .to('.veil__corner', { opacity: 0, duration: 0.4 }, 2.8);
    open(3.0);
  }
  if (document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal, { once: true });

  if (!hasGsap || reduce) return;

  /* ---------- Nav: hides scrolling down, solid past the wall ---------- */
  ScrollTrigger.create({
    start: 'top -80', end: 99999,
    onUpdate: self => { nav.classList.toggle('is-hidden', self.direction === 1); nav.classList.toggle('is-solid', self.scroll() > window.innerHeight * 0.9); }
  });

  /* ---------- Intro: words light as you read ---------- */
  const words = gsap.utils.toArray('.intro__text .w');
  if (words.length) ScrollTrigger.create({
    trigger: '.intro', start: 'top 70%', end: 'bottom 50%', scrub: true,
    onUpdate(self) { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle('is-on', i < n)); }
  });

  /* ---------- Reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      gsap.to(en.target, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      const v = en.target.querySelector('video'); if (v) { v.load(); v.play().catch(() => {}); }
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  gsap.utils.toArray('.house__media img, .house__media video').forEach(m => {
    gsap.to(m, { scale: 1, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top 95%', end: 'bottom 30%', scrub: true } });
  });

  /* ---------- The World: routes draw into Doha ---------- */
  if (document.querySelector('.world')) {
    gsap.timeline({ scrollTrigger: { trigger: '.world__map', start: 'top 75%', end: 'bottom 40%', scrub: 0.6 } })
      .to('.world .route__pt', { opacity: 1, duration: 0.1, stagger: 0.03 }, 0)
      .to('.world .route__lab, .world .route__logo', { opacity: 1, duration: 0.15, stagger: 0.03 }, 0.05)
      .to('.world .route__path', { strokeDashoffset: 0, duration: 0.8, ease: 'none', stagger: 0.04 }, 0.1)
      .fromTo('.world .route__pt--doha', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, 0.9);
  }

  /* ---------- Ledger: numbers count up once ---------- */
  document.querySelectorAll('.ledger__num').forEach(n => {
    const to = +n.dataset.count, o = { v: +n.textContent };
    const pad = String(to).length === 1 ? 2 : 1;
    ScrollTrigger.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', onUpdate: () => n.textContent = String(Math.round(o.v)).padStart(pad, '0') }) });
  });

  /* ---------- Close lines ---------- */
  const closeLines = document.querySelectorAll('.close__lines .line > span');
  if (closeLines.length) {
    const io2 = new IntersectionObserver(en => { if (!en[0].isIntersecting) return; gsap.to(closeLines, { y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' }); io2.disconnect(); }, { rootMargin: '0px 0px -15% 0px' });
    io2.observe(document.querySelector('.close__lines'));
  }

  /* ---------- Leaving: close the veil, then go ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href)) return;
    sessionStorage.setItem('woh-seen', '1');
    if (!veil) return;
    e.preventDefault();
    if (lenis) lenis.stop();
    gsap.set(veil, { display: 'block' });
    gsap.set('.veil__centre, .veil__frame', { opacity: 0 });
    gsap.set('.veil__panel--left', { xPercent: -100 });
    gsap.set('.veil__panel--right', { xPercent: 100 });
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .to('.veil__panel--left', { xPercent: 0, duration: 0.7, ease: 'power4.inOut' }, 0)
      .to('.veil__panel--right', { xPercent: 0, duration: 0.7, ease: 'power4.inOut' }, 0);
  });
  window.addEventListener('pageshow', e => { if (e.persisted && veil) { gsap.set(veil, { display: 'none' }); if (lenis) lenis.start(); } });
})();
