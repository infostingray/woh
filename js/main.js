/* =========================================================
   World of Hospitality — Behavior
   Editorial luxury interactions
   ========================================================= */

(() => {
  'use strict';

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
    const panels = Array.from(triptych.querySelectorAll('.panel'));
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

    const setActive = (idx, opts = {}) => {
      activeIdx = (idx + panels.length) % panels.length;
      panels.forEach((p, i) => p.classList.toggle('is-active', i === activeIdx));
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
        if (panel.classList.contains('is-active')) {
          const brand = panel.getAttribute('data-brand');
          window.location.href = `brands.html#${brand}`;
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
     5) LIVE CLOCK (Doha)
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
     6) MAGNETIC BUTTONS — subtle pull toward cursor
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
