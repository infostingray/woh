/* World of Hospitality: homepage choreography. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const isPhone = window.matchMedia('(max-width: 900px)').matches;
  if (isPhone) document.querySelectorAll('.atlas__house video:not([autoplay])').forEach(v => v.preload = 'none');
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

  /* ---------- Atlas ---------- */
  const houses = Array.from(document.querySelectorAll('.atlas__house'));
  const names = Array.from(document.querySelectorAll('.atlas__name'));
  const marks = Array.from(document.querySelectorAll('.atlas__mark'));
  const index = Array.from(document.querySelectorAll('#atlasIndex li'));
  const intro = document.getElementById('atlasIntro');
  const scrollCue = document.getElementById('atlasScroll');
  const N = houses.length;
  names.forEach(n => {
    const t = n.querySelector('.atlas__name-text');
    t.innerHTML = t.textContent.trim().split(/\s+/).map(w =>
      '<span class="wd">' + Array.from(w).map(c => `<span class="ch">${c}</span>`).join('') + '</span>').join(' ');
  });
  let current = -1;

  function playOnly(i) {
    houses.forEach((h, k) => {
      const v = h.querySelector('video');
      if (!v) return;
      if (k === i) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); }
      else if (Math.abs(k - i) > 1) { v.pause(); }
    });
  }

  function setHouse(i, fromIntro) {
    if (i === current) return;
    const prev = current;
    current = i;
    houses.forEach((h, k) => h.classList.toggle('is-active', k === i));
    index.forEach((li, k) => li.classList.toggle('is-active', k === i));
    playOnly(i);
    if (!hasGsap || reduce) {
      names.forEach((n, k) => n.style.opacity = k === i && !fromIntro ? 1 : 0);
      marks.forEach((m, k) => m.style.opacity = k === i && !fromIntro ? 1 : 0);
      return;
    }
    marks.forEach((m, k) => {
      if (k === i && !fromIntro) gsap.fromTo(m, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.25, ease: 'power3.out', overwrite: true });
      else gsap.to(m, { opacity: 0, duration: 0.35, overwrite: true });
    });
    houses.forEach((h, k) => {
      if (k === i) gsap.fromTo(h, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out', overwrite: true });
      else if (k === prev) gsap.to(h, { opacity: 0, duration: 1.1, ease: 'power2.out', overwrite: true });
    });
    names.forEach((n, k) => {
      const t = n.querySelector('.atlas__name-text');
      const m = n.querySelector('.atlas__name-meta');
      if (k === i && !fromIntro) {
        gsap.set(n, { opacity: 1 });
        gsap.set(t, { y: 0, opacity: 1 });
        gsap.fromTo(t.querySelectorAll('.ch'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.035, ease: 'power3.out', overwrite: true });
        gsap.fromTo(m, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power3.out', overwrite: true });
      } else if (n.style.opacity !== '0') {
        gsap.to([t, m], { y: -20, opacity: 0, duration: 0.45, ease: 'power2.in', overwrite: true, onComplete: () => gsap.set(n, { opacity: 0 }) });
      }
    });
  }

  if (hasGsap && N) {
    // Act 0 is the headline; acts 1..N are houses. Split the pinned scroll into N+1 bands.
    ScrollTrigger.create({
      trigger: '#atlas',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        const bands = N + 1;
        const p = self.progress * bands;
        const act = Math.min(bands - 1, Math.floor(p));
        const inIntro = act === 0;
        if (intro) {
          const fade = Math.min(1, Math.max(0, (p - 0.55) / 0.35)); // headline dissolves in the last part of act 0
          gsap.set(intro, { opacity: 1 - fade, y: -30 * fade });
        }
        if (scrollCue) gsap.set(scrollCue, { opacity: inIntro ? 1 - Math.min(1, p / 0.6) : 0 });
        gsap.set('#atlasIndex', { opacity: inIntro ? Math.min(1, p / 0.6) : 1 });
        if (inIntro) {
          if (current !== 0) setHouse(0, true);
          else { names.forEach(n => gsap.set(n, { opacity: 0 })); marks.forEach(m => gsap.set(m, { opacity: 0 })); }
        } else {
          setHouse(act - 1, false);
        }
      }
    });

    // Index click: jump to that house's band
    index.forEach((li, k) => li.querySelector('button').addEventListener('click', () => {
      const atlas = document.getElementById('atlas');
      const total = atlas.offsetHeight - window.innerHeight;
      const y = atlas.offsetTop + total * ((k + 1) / (N + 1) + 0.02);
      lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' });
    }));
  } else {
    houses[0] && houses[0].classList.add('is-active');
    if (intro) intro.style.opacity = 1;
  }

  /* ---------- Load sequence ---------- */
  const veil = document.getElementById('veil');
  const nav = document.getElementById('nav');
  function reveal() {
    document.body.classList.remove('is-loading');
    if (!hasGsap || reduce) {
      if (veil) veil.remove();
      if (nav) { nav.style.opacity = 1; nav.style.transform = 'none'; }
      document.querySelectorAll('.atlas__intro .line > span, .atlas__lede span').forEach(s => s.style.transform = 'none');
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.veil__line', { scaleX: 1, duration: 1.0, ease: 'power3.inOut' }, 0.2)
      .to('.veil__mark', { clipPath: 'inset(0% 0 0% 0)', duration: 1.0, ease: 'power3.inOut' }, '-=0.45')
      .to('.veil__mark', { opacity: 0, duration: 0.45, delay: 0.55 })
      .to('.veil__line', { scaleX: 1.6, opacity: 0, duration: 0.7, ease: 'power2.in' }, '-=0.3')
      .to('.veil__panel--top', { yPercent: -100, duration: 1.15, ease: 'power4.inOut' }, '-=0.2')
      .to('.veil__panel--bottom', { yPercent: 100, duration: 1.15, ease: 'power4.inOut' }, '<')
      .to('.atlas__house.is-active video, .atlas__house.is-active img', { scale: 1.0, duration: 2.4, ease: 'power2.out' }, '-=0.9')
      .to('.atlas__intro .line > span', { y: 0, duration: 1.1, stagger: 0.09 }, '-=2.0')
      .to('.atlas__lede span', { y: 0, duration: 0.9 }, '-=0.7')
      .to(nav, { opacity: 1, y: 0, duration: 0.9 }, '-=0.8')
      .to(scrollCue, { opacity: 1, duration: 0.8 }, '-=0.6')
      .set(veil, { display: 'none' });
  }
  if (document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal, { once: true });

  /* ---------- Statement: words light as you read ---------- */
  const st = document.querySelector('[data-split]');
  if (st) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    const ws = st.querySelectorAll('.w');
    if (hasGsap && !reduce) {
      ScrollTrigger.create({
        trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate(self) {
          const n = Math.round(self.progress * ws.length);
          ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
        }
      });
    } else ws.forEach(w => w.classList.add('is-lit'));
  }

  /* ---------- Journey: stages light as they pass centre, frame swaps ---------- */
  const stages = document.querySelectorAll('.journey__stage');
  const frames = document.querySelectorAll('.journey__frame img');
  const showFrame = i => frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
  showFrame(0);
  if (hasGsap && !reduce) {
    stages.forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 40%',
      onToggle: self => { s.classList.toggle('is-lit', self.isActive); if (self.isActive) showFrame(i); }
    }));
  } else stages.forEach(s => s.classList.add('is-lit'));

  /* ---------- Gallery: pinned horizontal scrub ---------- */
  const track = document.getElementById('galleryTrack');
  if (track && hasGsap && !reduce && window.innerWidth > 900) {
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    gsap.utils.toArray('.gallery__cell img').forEach(img => {
      gsap.to(img, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top top', end: 'bottom bottom', scrub: true } });
    });
  }

  /* ---------- Houses: image follows the cursor ---------- */
  const peek = document.getElementById('housesPeek');
  const housesWrap = document.querySelector('.houses');
  if (peek && housesWrap && hasGsap && !reduce && window.matchMedia('(hover: hover)').matches) {
    const pimg = peek.querySelector('img');
    const qx = gsap.quickTo(peek, 'left', { duration: 0.5, ease: 'power3' });
    const qy = gsap.quickTo(peek, 'top', { duration: 0.5, ease: 'power3' });
    housesWrap.addEventListener('mousemove', e => {
      const r = housesWrap.getBoundingClientRect();
      qx(e.clientX - r.left); qy(e.clientY - r.top);
    });
    document.querySelectorAll('.houses__row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        if (row.dataset.peek) { pimg.src = row.dataset.peek; gsap.to(peek, { opacity: 1, rotate: 0, duration: 0.5, ease: 'power3.out' }); }
        else gsap.to(peek, { opacity: 0, duration: 0.3 });
      });
    });
    housesWrap.addEventListener('mouseleave', () => gsap.to(peek, { opacity: 0, rotate: -3, duration: 0.4 }));
  }

  /* ---------- Cursor ---------- */
  const cur = document.getElementById('cursor');
  if (cur && hasGsap && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cx = gsap.quickTo(cur, 'x', { duration: 0.18, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.18, ease: 'power3' });
    window.addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); cur.classList.add('is-on'); });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('mouseover', e => cur.classList.toggle('is-link', !!e.target.closest('a, button')));
  }

  /* ---------- Nav hides on scroll down, returns on scroll up ---------- */
  if (nav && hasGsap) {
    ScrollTrigger.create({
      start: 'top -80', end: 99999,
      onUpdate: self => nav.classList.toggle('is-hidden', self.direction === 1)
    });
  }

  /* ---------- Ledger: count up once ---------- */
  document.querySelectorAll('.ledger__num').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (!hasGsap || reduce) { el.textContent = target; return; }
    const o = { v: parseInt(el.textContent, 10) || 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) })
    });
  });

  /* ---------- Parallax on the Al Beiruti image ---------- */
  const opened = document.querySelector('.opened__media img');
  if (opened && hasGsap && !reduce) {
    gsap.fromTo(opened, { yPercent: -6 }, { yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.opened', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Close: lines rise once ---------- */
  const closeLines = document.querySelectorAll('.close__lines .line > span');
  if (closeLines.length && hasGsap && !reduce) {
    gsap.to(closeLines, { y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.close', start: 'top 70%', once: true } });
  } else closeLines.forEach(s => s.style.transform = 'none');
})();
