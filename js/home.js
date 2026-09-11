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


  /* ---------- Load sequence: five cuts, then the frame splits into the wall ---------- */
  const veil = document.getElementById('veil');
  const nav = document.getElementById('nav');
  const navLogo = document.querySelector('.nav__logo');
  function headerIn() {
    gsap.set(nav, { opacity: 1, y: 0 });
    gsap.timeline()
      .fromTo('.nav__rule', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, 0)
      .fromTo('.nav__logo', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
      .fromTo('.nav__links a', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.35)
      .fromTo('.nav__cta', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.7)
      .fromTo('.nav__toggle', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.4);
  }
  function reveal() {
    if (!hasGsap || reduce) {
      document.body.classList.remove('is-loading');
      document.body.classList.add('no-motion');
      if (veil) veil.remove();
      if (nav) { nav.style.opacity = 1; nav.style.transform = 'none'; }
      return;
    }
    const quick = sessionStorage.getItem('woh-seen') === '1';
    const mark = veil.querySelector('.veil__mark');
    const cuts = gsap.utils.toArray('.veil__cut');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Final act: the frame splits into five columns; the mark punches out, the header draws itself in.
    const split = (at) => {
      tl.to(mark, { opacity: 0, scale: 1.12, duration: 0.35, ease: 'power3.in' }, at - 0.05)
        .fromTo('.veil__flash', { opacity: 0 }, { opacity: 0.22, duration: 0.06, ease: 'none' }, at - 0.02)
        .to('.veil__flash', { opacity: 0, duration: 0.4 }, at + 0.04)
        .to('.wall__panel', { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, stagger: { each: 0.07, from: 'center' }, ease: 'power4.inOut' }, at)
        .to(veil, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, at + 0.25)
        .fromTo('.wall__logo', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, stagger: { each: 0.06, from: 'center' }, ease: 'power3.out' }, at + 0.55)
        .add(() => { document.body.classList.remove('is-loading'); veil.remove(); }, at + 0.9)
        .add(headerIn, at + 0.7);
    };
    if (quick) { gsap.set(mark, { opacity: 1 }); split(0.3); return; }

    // Act one: the mark, with a brass flash.
    tl.fromTo(mark, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power4.out' }, 0.15)
      .fromTo('.veil__flash', { opacity: 0 }, { opacity: 0.35, duration: 0.08, ease: 'none' }, 0.15)
      .to('.veil__flash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.23)
      .to(mark, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' }, 1.15);

    // Act two: five hard cuts, one per house.
    let t = 1.35; const hold = 0.42;
    cuts.forEach((cut, i) => {
      const logo = cut.querySelector('.veil__cutlogo');
      tl.set(cut, { opacity: 1 }, t)
        .fromTo(cut.querySelector('img'), { scale: 1.12 }, { scale: 1.04, duration: hold + 0.1, ease: 'none' }, t)
        .fromTo(logo, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power4.out' }, t + 0.02)
        .fromTo('.veil__flash', { opacity: 0 }, { opacity: 0.18, duration: 0.05, ease: 'none' }, t)
        .to('.veil__flash', { opacity: 0, duration: 0.3 }, t + 0.05);
      if (i < cuts.length - 1) tl.set(cut, { opacity: 0 }, t + hold);
      t += hold;
    });
    // The mark returns over the last cut, then everything splits.
    tl.to(mark, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, t + 0.1)
      .to('.veil__cut:last-child .veil__cutlogo', { opacity: 0, duration: 0.3 }, t + 0.1);
    split(t + 0.75);
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


  /* ---------- The road: scroll scrubs the timeline, hover or tap jumps ---------- */
  const road = document.getElementById('road');
  if (road) {
    const nodes = gsap.utils.toArray('.road__node');
    const yr = document.getElementById('roadYear'), kicker = document.getElementById('roadKicker'), note = document.getElementById('roadNote'), fill = document.getElementById('roadFill'), cursor = document.getElementById('roadCursor'), strip = document.getElementById('roadStrip');
    const pct = nodes.map(n => +n.dataset.pct);
    let active = -1, hovering = false;
    function show(i) {
      if (i === active) return; active = i;
      const n = nodes[i];
      nodes.forEach((el, k) => { el.classList.toggle('is-on', k <= i); el.classList.toggle('is-active', k === i); });
      gsap.fromTo(yr, { y: 14, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', overwrite: true }); yr.textContent = n.dataset.big;
      kicker.textContent = n.querySelector('.road__stop').textContent + ' · ' + n.dataset.city;
      gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, overwrite: true }); note.innerHTML = n.dataset.note;
    }
    function place(p) {
      // Continuous position along the rail: the cursor and the fill glide, the stops snap.
      const seg = p * (nodes.length - 1), i = Math.min(nodes.length - 2, Math.floor(seg)), f = seg - i;
      const x = pct[i] + (pct[i + 1] - pct[i]) * f;
      gsap.set(fill, { width: x + '%' }); gsap.set(cursor, { left: x + '%' });
      const img = strip.firstElementChild, over = Math.max(0, img.getBoundingClientRect().width - strip.getBoundingClientRect().width);
      gsap.set(strip, { x: -p * over });
    }
    ScrollTrigger.create({
      trigger: road, start: 'top top', end: 'bottom bottom', scrub: 0.4,
      onUpdate(self) { if (hovering) return; place(self.progress); show(Math.round(self.progress * (nodes.length - 1))); }
    });
    nodes.forEach((n, i) => {
      n.addEventListener('mouseenter', () => { hovering = true; show(i); gsap.to(fill, { width: pct[i] + '%', duration: 0.6, ease: 'power3.out' }); gsap.to(cursor, { left: pct[i] + '%', duration: 0.6, ease: 'power3.out' }); });
      n.addEventListener('mouseleave', () => { hovering = false; });
    });
    show(0); place(0);
  }

  /* ---------- Leaving: close the veil, then go ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href) || a.hasAttribute('download')) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.hash) {
      const target = document.querySelector(url.hash);
      if (target) { e.preventDefault(); if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 }); else target.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', url.hash); }
      return;
    }
    if (href.startsWith('#')) return;
    sessionStorage.setItem('woh-seen', '1');
    e.preventDefault();
    if (lenis) lenis.stop();
    const out = document.createElement('div'); out.className = 'veil veil--out'; document.body.appendChild(out);
    gsap.fromTo(out, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.inOut', onComplete: () => { window.location.href = href; } });
  });
  window.addEventListener('pageshow', e => { if (e.persisted) { document.querySelectorAll('.veil--out').forEach(v => v.remove()); if (lenis) lenis.start(); } });
})();
