/* World of Hospitality: shared choreography for house and inner pages. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
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

  /* ---------- Wall component: hover widens a house ---------- */
  document.querySelectorAll('.wall').forEach(wall => {
    if (window.matchMedia('(max-width: 900px)').matches) return;
    const panels = Array.from(wall.querySelectorAll('.wall__panel'));
    panels.forEach(p => p.addEventListener('mouseenter', () => { wall.classList.add('is-hover'); panels.forEach(q => q.classList.toggle('is-on', q === p)); }));
    wall.addEventListener('mouseleave', () => { wall.classList.remove('is-hover'); panels.forEach(q => q.classList.remove('is-on')); });
  });

  /* ---------- Split the house name into characters ---------- */
  const name = document.querySelector('[data-chars]');
  if (name) {
    name.innerHTML = name.textContent.trim().split(/\s+/).map(w =>
      '<span class="wd">' + Array.from(w).map(c => `<span class="ch">${c === '&' ? '&amp;' : c}</span>`).join('') + '</span>').join(' ');
  }
  document.querySelectorAll('[data-split]').forEach(p => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- Entry: quick veil, then the hero ---------- */
  const veil = document.getElementById('veil');
  const nav = document.getElementById('nav');
  function reveal() {
    document.body.classList.remove('is-loading');
    if (!hasGsap || reduce) {
      document.body.classList.add('no-motion');
      if (veil) veil.remove();
      if (nav) nav.style.opacity = 1, nav.style.transform = 'none';
      return;
    }
    const tl = gsap.timeline();
    tl.to('.veil__panel--left', { xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, 0)
      .to('.veil__panel--right', { xPercent: 100, duration: 1.1, ease: 'power4.inOut' }, 0)
      .set(veil, { display: 'none' });
    if (document.querySelector('.hero__film')) tl.fromTo('.hero__film', { scale: 1.16 }, { scale: 1.08, duration: 2.4, ease: 'power2.out' }, 0.1);
    if (name) tl.to('.hero__name .ch', { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: 'power3.out' }, 0.45);
    if (document.querySelector('.hero__line')) tl.to('.hero__line .line > span, .hero__meta .line > span', { y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, 0.9);
    if (document.querySelector('.hero__mark')) tl.to('.hero__mark', { opacity: 1, duration: 0.8 }, 1.1);
    if (document.querySelector('.open')) tl.to('.open .line > span', { y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.4)
      .to('.open__lede', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 1.0);
    tl.to(nav, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.1);
    if (document.querySelector('.hero__cue')) tl.to('.hero__cue', { opacity: 1, duration: 0.6 }, 1.6);
  }
  if (document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal, { once: true });

  if (!hasGsap || reduce) return;

  /* ---------- Nav hides on scroll down ---------- */
  ScrollTrigger.create({
    start: 'top -80', end: 99999,
    onUpdate: self => { nav.classList.toggle('is-hidden', self.direction === 1); nav.classList.toggle('is-solid', self.scroll() > 120); }
  });

  /* ---------- Hero parallax and dissolve ---------- */
  if (document.querySelector('.hero')) {
    gsap.to('.hero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__copy', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
  }
  if (document.querySelector('.open__media')) {
    gsap.to('.open__media img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.open', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Story: words light up as you read ---------- */
  const words = gsap.utils.toArray('.story__lead .w, .lit .w');
  const litHost = document.querySelector('.story, .lit');
  if (words.length && litHost) {
    ScrollTrigger.create({
      trigger: litHost, start: 'top 70%', end: 'bottom 45%', scrub: true,
      onUpdate(self) {
        const n = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-on', i < n));
      }
    });
  }

  /* ---------- Gallery: images settle as they arrive ---------- */
  gsap.utils.toArray('.gal__cell img, .story__media img, .plate img').forEach(img => {
    gsap.to(img, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top 95%', end: 'bottom 30%', scrub: true } });
  });

  /* ---------- Section reveals ---------- */
  const revealEls = gsap.utils.toArray('.route__head, .story__more, .story__facts, .visit__col, [data-reveal], .wall--mini .wall__panel');
  gsap.set(revealEls, { opacity: 0, y: 24 });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      gsap.to(en.target, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => io.observe(el));
  const askLines = document.querySelectorAll('.ask__lines .line > span');
  if (askLines.length) {
    const io2 = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      gsap.to(askLines, { y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' });
      io2.disconnect();
    }, { rootMargin: '0px 0px -15% 0px' });
    io2.observe(document.querySelector('.ask__lines'));
  }

  /* ---------- Forms ---------- */
  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(contact);
      if (f.get('website')) return;
      const body = ['Name: ' + f.get('name'), 'Company: ' + (f.get('company') || ''), 'Email: ' + f.get('email'), 'Phone: ' + (f.get('phone') || ''), 'About: ' + f.get('topic'), '', f.get('message')].join('\n');
      window.location.href = 'mailto:info@worldofhospitality.com.qa?subject=' + encodeURIComponent('Enquiry: ' + f.get('topic')) + '&body=' + encodeURIComponent(body);
      contact.querySelector('.form__status').textContent = 'Your email app should open with the message ready to send.';
    });
  }
  const apply = document.getElementById('applyForm');
  if (apply) {
    const status = apply.querySelector('.form__status');
    const file = apply.querySelector('input[type=file]');
    const fileLab = apply.querySelector('.form__file-name');
    if (file && fileLab) file.addEventListener('change', () => { fileLab.textContent = file.files[0] ? file.files[0].name : 'Choose a file'; });
    apply.addEventListener('submit', async e => {
      e.preventDefault();
      if (!apply.reportValidity()) return;
      const f = new FormData(apply);
      if (f.get('website')) return;
      status.textContent = 'Sending.';
      try {
        const res = await fetch(apply.action, { method: 'POST', body: f });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) { status.textContent = 'Received. We reply within two working days.'; apply.reset(); if (fileLab) fileLab.textContent = 'Choose a file'; }
        else throw new Error(data.error || 'Server error');
      } catch (err) {
        status.innerHTML = 'Could not send from here. Email your CV to <a href="mailto:careers@worldofhospitality.com.qa">careers@worldofhospitality.com.qa</a> instead.';
      }
    });
  }
  document.querySelectorAll('[data-prefill-role]').forEach(a => a.addEventListener('click', () => {
    const sel = document.getElementById('appRole'); if (sel) sel.value = a.dataset.prefillRole;
  }));

  /* ---------- Leaving: close the veil, then go ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href) || a.hasAttribute('download')) return;
    e.preventDefault();
    sessionStorage.setItem('woh-seen', '1');
    if (lenis) lenis.stop();
    veil.style.display = '';
    gsap.set('.veil__panel--left', { xPercent: -100 });
    gsap.set('.veil__panel--right', { xPercent: 100 });
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .to('.veil__panel--left', { xPercent: 0, duration: 0.7, ease: 'power4.inOut' }, 0)
      .to('.veil__panel--right', { xPercent: 0, duration: 0.7, ease: 'power4.inOut' }, 0);
  });
  window.addEventListener('pageshow', e => { if (e.persisted) reveal(); });
})();
