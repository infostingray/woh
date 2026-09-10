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


  /* ---------- Reel: the slide underneath settles back as the next covers it ---------- */
  const slides = gsap.utils.toArray('.reel__slide');
  slides.forEach((s, i) => {
    const next = slides[i + 1];
    if (next) gsap.to(s.querySelector('.reel__media'), { scale: 0.94, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.to(s.querySelector('.reel__copy'), { y: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: next || s, start: next ? 'top 60%' : 'bottom 40%', end: next ? 'top top' : 'bottom top', scrub: true } });
  });
  const reelIO = new IntersectionObserver(en => en.forEach(e => { const v = e.target.querySelector('video'); if (!v) return; if (e.isIntersecting) { if (v.preload === 'none') v.load(); v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.35 });
  slides.forEach(s => reelIO.observe(s));
  const fin = document.querySelector('.finale video');
  if (fin) new IntersectionObserver(en => { if (en[0].isIntersecting) { fin.load(); fin.play().catch(() => {}); } else fin.pause(); }, { threshold: 0.2 }).observe(fin);

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


  /* ---------- Ledger: numbers count up once ---------- */
  document.querySelectorAll('.numbers__num').forEach(n => {
    const to = +n.dataset.count, o = { v: +n.textContent };
    const pad = String(to).length === 1 ? 2 : 1;
    ScrollTrigger.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', onUpdate: () => n.textContent = String(Math.round(o.v)).padStart(pad, '0') }) });
  });


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
