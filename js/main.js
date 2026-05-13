/* =========================================================
   World of Hospitality — Behavior
   Editorial luxury interactions
   ========================================================= */

(() => {
  'use strict';

  /* ============================================================
     0) PRELOADER — hide after page settles
     ============================================================ */
  const hidePreloader = () => {
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('is-hidden');
  };
  const MIN_PRELOAD_MS = 1600;
  const startedAt = (window.performance && performance.timing && performance.timing.navigationStart)
    ? performance.timing.navigationStart
    : Date.now();
  const elapsed = Date.now() - startedAt;
  const showFor = Math.max(0, MIN_PRELOAD_MS - elapsed);

  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, showFor);
  } else {
    window.addEventListener('load', () => setTimeout(hidePreloader, showFor));
  }
  // Safety: hide no matter what after 4s
  setTimeout(hidePreloader, 4200);

  /* ============================================================
     0b) SCROLL PROGRESS BAR
     ============================================================ */
  const scrollProg = document.getElementById('scrollProgress');
  if (scrollProg) {
    let rafScroll = null;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      scrollProg.style.width = pct + '%';
    };
    window.addEventListener('scroll', () => {
      if (rafScroll) cancelAnimationFrame(rafScroll);
      rafScroll = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============================================================
     0c) PAGE HEADER PARALLAX (inner pages)
     ============================================================ */
  const pageHeaderBg = document.querySelector('.page-header__bg');
  if (pageHeaderBg) {
    let rafPHB = null;
    window.addEventListener('scroll', () => {
      if (rafPHB) cancelAnimationFrame(rafPHB);
      rafPHB = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600);
        pageHeaderBg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${(1 + y * 0.00012).toFixed(3)})`;
      });
    }, { passive: true });
  }

  /* ============================================================
     1) NAV — scroll state + mobile toggle + active link
     ============================================================ */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = nav.querySelector('.nav__toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('.nav__panel a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav a[data-page]').forEach(a => {
      if (a.getAttribute('data-page').toLowerCase() === path) a.classList.add('is-active');
    });
  }

  /* ============================================================
     2) REVEAL — IntersectionObserver
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
  }

  /* ============================================================
     3) YEAR STAMP
     ============================================================ */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     4) HERO TRIPTYCH — auto-rotating spotlight + hover override
                       + 3D parallax tilt
     ============================================================ */
  const triptych = document.getElementById('triptych');
  if (triptych) {
    const panels = Array.from(triptych.querySelectorAll('.thumb'));
    const progressBar = document.getElementById('heroProgress');
    const focusName = document.getElementById('focusName');
    const focusCount = document.getElementById('focusCount');
    const readoutEls = document.querySelectorAll('#readout [data-readout]');
    const readoutCta = document.getElementById('readoutCta');

    const BRAND_DATA = {
      gunaydin: {
        name: 'Günaydın',
        cuisine: 'Turkish Steakhouse',
        status: 'Open in Doha',
        link: 'brands.html#gunaydin'
      },
      kumar: {
        name: 'Kumar',
        cuisine: 'Modern Indian',
        status: 'Open in Doha',
        link: 'brands.html#kumar'
      },
      'eleven-green': {
        name: 'Eleven Green',
        cuisine: 'Burger Bistro',
        status: 'Coming to Doha',
        link: 'brands.html#eleven-green'
      },
      'al-beiruti': {
        name: 'Al Beiruti',
        cuisine: 'Lebanese · Levantine',
        status: 'Opening late 2026',
        link: 'brands.html#al-beiruti'
      }
    };

    let activeIdx = 0;
    let progress = 0;
    let paused = false;
    let progressTimer = null;
    const ROTATE_MS = 5500;

    const updateReadout = (brandKey) => {
      const data = BRAND_DATA[brandKey];
      if (!data) return;
      readoutEls.forEach(el => {
        const key = el.getAttribute('data-readout');
        if (key && data[key]) {
          el.parentElement.classList.add('is-swapping');
          setTimeout(() => {
            el.textContent = data[key];
            el.parentElement.classList.remove('is-swapping');
          }, 200);
        }
      });
      if (focusName) focusName.textContent = data.name;
      if (readoutCta) readoutCta.href = data.link;
    };

    const heroSlides = Array.from(document.querySelectorAll('.hero__slide'));

    const setActive = (idx, opts = {}) => {
      activeIdx = (idx + panels.length) % panels.length;
      panels.forEach((p, i) => p.classList.toggle('is-active', i === activeIdx));
      heroSlides.forEach((s, i) => s.classList.toggle('is-active', i === activeIdx));
      const brandKey = panels[activeIdx].getAttribute('data-brand');
      updateReadout(brandKey);
      if (focusCount) {
        focusCount.textContent = `0${activeIdx + 1} / 0${panels.length}`;
      }
      if (!opts.skipReset) {
        progress = 0;
        if (progressBar) progressBar.style.width = '0%';
      }
    };

    const tick = () => {
      if (paused) return;
      progress += 100 / (ROTATE_MS / 50);
      if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
      if (progress >= 100) {
        progress = 0;
        setActive(activeIdx + 1);
      }
    };

    const startRotation = () => {
      stopRotation();
      progressTimer = setInterval(tick, 50);
    };
    const stopRotation = () => {
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
    };

    // Hover override
    panels.forEach((panel, i) => {
      panel.addEventListener('mouseenter', () => {
        paused = true;
        progress = 0;
        if (progressBar) progressBar.style.width = '0%';
        setActive(i, { skipReset: true });
      });
      panel.addEventListener('mouseleave', () => { paused = false; });
      panel.addEventListener('click', (e) => {
        const isTouch = matchMedia('(hover: none)').matches;
        if (isTouch) {
          // Touch: every tap activates only. The readout "Visit →" handles navigation.
          e.preventDefault();
          setActive(i);
          paused = true;
          setTimeout(() => { paused = false; }, 4000);
          return;
        }
        // Desktop: tap an active panel to navigate; otherwise activate.
        if (panel.classList.contains('is-active')) {
          window.location.href = `brands.html#${panel.getAttribute('data-brand')}`;
        } else {
          e.preventDefault();
          setActive(i);
        }
      });
    });

    triptych.addEventListener('touchstart', () => { paused = true; }, { passive: true });

    // 3D parallax
    let rafId = null;
    const onMove = (e) => {
      const r = triptych.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        triptych.style.setProperty('--px', px.toFixed(3));
        triptych.style.setProperty('--py', py.toFixed(3));
      });
    };
    const onLeave = () => {
      triptych.style.setProperty('--px', '0');
      triptych.style.setProperty('--py', '0');
    };
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      triptych.addEventListener('mousemove', onMove);
      triptych.addEventListener('mouseleave', onLeave);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopRotation(); else startRotation();
    });

    setTimeout(startRotation, 1800);
  }

  /* ============================================================
     5) HERO SPOTLIGHT + HEADLINE + GHOST PARALLAX
     ============================================================ */
  const hero = document.getElementById('hero');
  const heroHeadline = document.getElementById('heroHeadline');
  const heroGhost = hero ? hero.querySelector('.hero__ghost') : null;
  if (hero && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let rafSpot = null;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (rafSpot) cancelAnimationFrame(rafSpot);
      rafSpot = requestAnimationFrame(() => {
        hero.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`);
        hero.style.setProperty('--my', `${(y * 100).toFixed(2)}%`);
        const px = x - 0.5;
        const py = y - 0.5;
        if (heroHeadline) {
          heroHeadline.style.transform = `translate3d(${(px * 10).toFixed(2)}px, ${(py * 7).toFixed(2)}px, 0)`;
        }
        if (heroGhost) {
          // Counter-direction, slightly slower — creates depth
          heroGhost.style.transform = `translate3d(${(-px * 22).toFixed(2)}px, ${(-py * 14).toFixed(2)}px, 0)`;
        }
      });
    });
    hero.addEventListener('mouseleave', () => {
      if (heroHeadline) heroHeadline.style.transform = '';
      if (heroGhost) heroGhost.style.transform = '';
      hero.style.setProperty('--mx', '50%');
      hero.style.setProperty('--my', '30%');
    });
  }

  /* ============================================================
     6) 3D TILT — brand cards + gallery cells
     ============================================================ */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const attachTilt = (el, max) => {
      let rafTilt = null;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (rafTilt) cancelAnimationFrame(rafTilt);
        rafTilt = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateY(${(x * max).toFixed(2)}deg) rotateX(${(-y * max).toFixed(2)}deg) translateZ(0)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    };
    document.querySelectorAll('.brand-card').forEach(el => attachTilt(el, 5));
    document.querySelectorAll('.gallery__cell').forEach(el => attachTilt(el, 8));
    document.querySelectorAll('.brand-spread__media').forEach(el => attachTilt(el, 4));
  }

  /* ============================================================
     7) LIVE CLOCK (Doha)
     ============================================================ */
  const clock = document.getElementById('clock');
  if (clock) {
    const renderClock = () => {
      try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit', minute: '2-digit', hour12: false,
          timeZone: 'Asia/Qatar'
        });
        clock.textContent = fmt.format(new Date()) + ' AST';
      } catch (e) { clock.textContent = ''; }
    };
    renderClock();
    setInterval(renderClock, 30000);
  }

  /* ============================================================
     8) MAGNETIC BUTTONS — subtle pull toward cursor
     ============================================================ */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const STRENGTH = 0.25;
    const RADIUS = 80;
    document.querySelectorAll('.btn, .nav__cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS + Math.max(r.width, r.height) / 2) {
          btn.classList.add('is-magnetic');
          btn.style.setProperty('--mx', (dx * STRENGTH).toFixed(2));
          btn.style.setProperty('--my', (dy * STRENGTH).toFixed(2));
        }
      });
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('is-magnetic');
        btn.style.setProperty('--mx', '0');
        btn.style.setProperty('--my', '0');
      });
    });
  }
})();
