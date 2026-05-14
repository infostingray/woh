/* =========================================================
   World of Hospitality — Behavior
   Editorial luxury interactions, GSAP + ScrollTrigger + Lenis
   ========================================================= */

(() => {
  'use strict';

  // Lock body during preload
  document.documentElement.classList.add('is-loading');

  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';
  if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopPointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============================================================
     0) [Lenis removed — using native scroll for responsiveness]
     ============================================================ */
  // ScrollTrigger uses native scroll; no proxy needed

  /* ============================================================
     0a) PRELOADER — 4-second cinematic GSAP timeline
     ============================================================ */
  const preloader  = document.getElementById('preloader');
  const preCounter = document.getElementById('preCounter');

  const hidePreloader = () => {
    if (!preloader) {
      document.documentElement.classList.remove('is-loading');
      return;
    }
    if (!hasGSAP) {
      preloader.style.transition = 'opacity 0.8s';
      preloader.style.opacity = 0;
      setTimeout(() => preloader.remove(), 800);
      document.documentElement.classList.remove('is-loading');
      return;
    }
    const gsap = window.gsap;
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        document.documentElement.classList.remove('is-loading');
        if (hasST) window.ScrollTrigger.refresh();
      }
    });
    tl.to('.preloader__veil', { y: '0%', duration: 1.0, ease: 'expo.inOut' })
      .to(preloader, { opacity: 0, duration: 0.4, ease: 'power1.in' }, '-=0.05');
  };

  if (preloader && hasGSAP) {
    const gsap = window.gsap;
    // Inline opacity so nothing flashes pre-tween
    gsap.set('.preloader__top', { opacity: 0, y: -10 });
    gsap.set('.preloader__bottom', { opacity: 0, y: 10 });
    gsap.set('.preloader__logo', { opacity: 0, y: 20 });

    const intro = gsap.timeline({
      onComplete: () => {
        // Wait minimum total ~4 seconds (intro is ~3.4s); then add a brief pause and reveal
        gsap.delayedCall(0.35, hidePreloader);
      }
    });

    const brandEls = document.querySelectorAll('.pre-brand');
    const revealBrandAt = (idx) => {
      brandEls.forEach((b, i) => {
        if (i <= idx) b.classList.add('is-shown');
        b.classList.toggle('is-active', i === idx);
      });
    };

    intro
      .to('.preloader__top', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.15)
      .to('.preloader__logo', { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' }, 0.3)
      .to('.preloader__bottom', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.6)
      .to('.preloader__bar-fill', { scaleX: 1, duration: 2.5, ease: 'power2.inOut' }, 0.9)
      .to(preCounter, {
        innerText: 100,
        duration: 2.5,
        snap: { innerText: 1 },
        ease: 'power2.inOut',
        onUpdate: function () {
          const v = Math.floor(this.targets()[0].innerText || 0);
          if (preCounter) preCounter.textContent = String(v).padStart(2, '0');
          // Reveal brands at quarter milestones
          if (v >= 25 && !brandEls[0]?.classList.contains('is-shown')) revealBrandAt(0);
          if (v >= 50) revealBrandAt(1);
          if (v >= 75) revealBrandAt(2);
          if (v >= 95) revealBrandAt(3);
          if (v >= 100) {
            // Reveal the "+ more concepts" line too, but keep Al Beiruti as the visually active one
            const moreEl = document.querySelector('.pre-brand--more');
            if (moreEl) moreEl.classList.add('is-shown');
            revealBrandAt(3);
          }
        }
      }, 0.9)
      .to('.preloader__logo', { y: -6, duration: 0.45, ease: 'power2.out' }, 3.0);
  } else if (preloader) {
    // No GSAP fallback — hide after 4s
    setTimeout(() => {
      preloader.style.transition = 'opacity 0.8s';
      preloader.style.opacity = 0;
      setTimeout(() => preloader.remove(), 800);
      document.documentElement.classList.remove('is-loading');
    }, 4000);
  } else {
    document.documentElement.classList.remove('is-loading');
  }

  /* ============================================================
     0b) [Cursor removed — using system cursor]
     ============================================================ */

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
     4a) [Split-text removed — hero uses CSS-only fade-up now]
     ============================================================ */

  /* ============================================================
     4b) HERO — Sequential cinematic video cycle (GSAP)
            + scroll-driven letterbox effect
            + marker progress bars
     ============================================================ */
  const heroStage   = document.getElementById('heroStage');
  const heroMarkers = document.getElementById('heroMarkers');
  const focusName   = document.getElementById('focusName');
  const focusCount  = document.getElementById('focusCount');

  if (heroStage && heroMarkers && hasGSAP) {
    const gsap = window.gsap;
    const wraps   = Array.from(heroStage.querySelectorAll('.hero__video-wrap'));
    const videos  = wraps.map(w => w.querySelector('video'));
    const markers = Array.from(heroMarkers.querySelectorAll('.marker'));
    const fills   = markers.map(m => m.querySelector('.marker__bar-fill'));
    const BRAND_NAMES = {
      gunaydin: 'Günaydın',
      kumar: 'Kumar',
      'eleven-green': 'Eleven Green',
      'al-beiruti': 'Al Beiruti'
    };

    const CYCLE_MS = 6000;
    let currentIdx = 0;
    let cycleTimer = null;
    let progressTween = null;
    let paused = false;
    let transitioning = false;

    const updateMeta = (idx) => {
      const brand = wraps[idx].dataset.brand;
      if (focusName)  focusName.textContent = BRAND_NAMES[brand] || brand;
      if (focusCount) focusCount.textContent = `0${idx + 1} / 0${wraps.length}`;
      markers.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    };

    const startProgress = (idx) => {
      // Reset all marker bars
      fills.forEach((f, i) => { if (f) gsap.set(f, { scaleX: i < idx ? 0 : 0 }); });
      // Animate active marker
      if (fills[idx]) {
        if (progressTween) progressTween.kill();
        progressTween = gsap.fromTo(fills[idx],
          { scaleX: 0 },
          { scaleX: 1, duration: CYCLE_MS / 1000, ease: 'none', transformOrigin: 'left' }
        );
      }
    };

    const transitionTo = (nextIdx) => {
      if (transitioning || nextIdx === currentIdx) return;
      transitioning = true;
      const fromIdx = currentIdx;
      const fromWrap = wraps[fromIdx], toWrap = wraps[nextIdx];
      const toVideo = videos[nextIdx];

      // Preload + play the next video
      if (toVideo) {
        toVideo.preload = 'auto';
        try { toVideo.currentTime = 0; } catch (e) {}
        toVideo.play().catch(() => {});
      }

      // Cinematic crossfade: outgoing scales up & fades; incoming zooms in from 0.96
      gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          fromWrap.classList.remove('is-active');
          toWrap.classList.add('is-active');
          if (videos[fromIdx]) {
            videos[fromIdx].pause();
            try { videos[fromIdx].currentTime = 0; } catch (e) {}
          }
          currentIdx = nextIdx;
          transitioning = false;
        }
      })
      .fromTo(toWrap,   { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.5 }, 0)
      .to(fromWrap,     { opacity: 0, scale: 1.08, duration: 1.4 }, 0);

      updateMeta(nextIdx);
      startProgress(nextIdx);
    };

    const cycleNext = () => {
      if (paused) return;
      transitionTo((currentIdx + 1) % wraps.length);
    };

    const startCycle = () => {
      stopCycle();
      cycleTimer = setInterval(cycleNext, CYCLE_MS);
    };
    const stopCycle = () => {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
      if (progressTween) progressTween.pause();
    };

    // Markers — click to jump
    markers.forEach((m, i) => {
      m.addEventListener('click', () => {
        transitionTo(i);
        stopCycle();
        startCycle();
      });
      m.addEventListener('mouseenter', () => { paused = true; });
      m.addEventListener('mouseleave', () => { paused = false; });
    });

    // Pause cycle when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCycle();
      else startCycle();
    });

    // Kick off — play first video, start progress + cycle after preloader
    const initialPlay = () => {
      if (videos[0]) {
        videos[0].preload = 'auto';
        videos[0].play().catch(() => {});
      }
      updateMeta(0);
      startProgress(0);
      startCycle();
    };
    setTimeout(initialPlay, 4400);
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
     7.5) GALLERY STRIP — drag-to-scroll
     ============================================================ */
  const gw = document.querySelector('.gallery-strip__track-wrap');
  if (gw) {
    let isDown = false, startX = 0, scrollStart = 0;
    gw.addEventListener('pointerdown', (e) => {
      isDown = true;
      gw.classList.add('is-dragging');
      startX = e.pageX - gw.offsetLeft;
      scrollStart = gw.scrollLeft;
      gw.setPointerCapture(e.pointerId);
    });
    gw.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const dx = (e.pageX - gw.offsetLeft) - startX;
      gw.scrollLeft = scrollStart - dx * 1.4;
    });
    const endDrag = () => {
      isDown = false;
      gw.classList.remove('is-dragging');
    };
    gw.addEventListener('pointerup', endDrag);
    gw.addEventListener('pointerleave', endDrag);
    gw.addEventListener('pointercancel', endDrag);
  }

  /* ============================================================
     4c) BRANDS — Horizontal drag-to-scroll (no pin, no scroll-jack)
     ============================================================ */
  const brandsH = document.getElementById('brandsH');
  const brandsHTrack = document.getElementById('brandsHTrack');
  const brandsHTrackWrap = document.querySelector('.brands-h__track-wrap');
  const brandsHIdx = document.getElementById('brandsHIdx');
  const brandsHint = document.getElementById('brandsHint');

  if (brandsHTrackWrap && brandsHTrack) {
    const slides = Array.from(brandsHTrack.querySelectorAll('.brand-slide'));

    // Drag-to-scroll on the track wrapper — desktop pointer only (mouse/pen).
    // On touch devices, native overflow-x scroll + scroll-snap handles swipe natively.
    let isDown = false, startX = 0, scrollStart = 0, moved = false;
    let velocity = 0, lastX = 0, lastT = 0;
    brandsHTrackWrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;  // skip touch — browser handles it
      isDown = true;
      moved = false;
      velocity = 0;
      brandsHTrackWrap.classList.add('is-dragging');
      startX = e.pageX - brandsHTrackWrap.offsetLeft;
      scrollStart = brandsHTrackWrap.scrollLeft;
      lastX = e.pageX;
      lastT = performance.now();
      try { brandsHTrackWrap.setPointerCapture(e.pointerId); } catch (_) {}
    });
    brandsHTrackWrap.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = (e.pageX - brandsHTrackWrap.offsetLeft) - startX;
      if (Math.abs(dx) > 4) moved = true;
      brandsHTrackWrap.scrollLeft = scrollStart - dx * 2.2; /* was 1.4 — lighter, easier */
      // Track velocity for momentum
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocity = (e.pageX - lastX) / dt;
        lastX = e.pageX;
        lastT = now;
      }
    });
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      brandsHTrackWrap.classList.remove('is-dragging');
      // Momentum flick — continue scrolling for a moment based on release velocity
      if (Math.abs(velocity) > 0.3) {
        const startScroll = brandsHTrackWrap.scrollLeft;
        const targetDelta = -velocity * 380; /* multiplier tuned for natural feel */
        const startTime = performance.now();
        const duration = Math.min(900, Math.abs(targetDelta) * 1.5);
        const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          brandsHTrackWrap.scrollLeft = startScroll + targetDelta * ease(progress);
          if (progress < 1 && !isDown) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    };
    brandsHTrackWrap.addEventListener('pointerup', endDrag);
    brandsHTrackWrap.addEventListener('pointerleave', endDrag);
    brandsHTrackWrap.addEventListener('pointercancel', endDrag);
    // Prevent click-through if we dragged
    brandsHTrack.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // Mouse wheel — vertical/horizontal wheel scrolls the houses horizontally.
    // Uses capture phase + bounds escape: when at scroll limit, release to native vertical scroll
    // so the user can continue past the section instead of feeling stuck.
    const wheelTarget = brandsH || brandsHTrackWrap;
    let wheelTimer = null;
    wheelTarget.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 1) return;

      const maxScroll = brandsHTrackWrap.scrollWidth - brandsHTrackWrap.clientWidth;
      const current = brandsHTrackWrap.scrollLeft;

      // Bounds escape — if user is trying to scroll past either end, let the page scroll naturally
      const scrollingForward = delta > 0;
      if (scrollingForward && current >= maxScroll - 1) return;   // at right edge, let page advance
      if (!scrollingForward && current <= 1) return;              // at left edge, let page retreat

      // Otherwise, intercept and convert vertical wheel → horizontal scroll
      e.preventDefault();
      brandsHTrackWrap.style.scrollBehavior = 'auto';
      brandsHTrackWrap.scrollLeft = Math.max(0, Math.min(maxScroll, current + delta * 1.8));
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        brandsHTrackWrap.style.scrollBehavior = '';
      }, 80);
    }, { passive: false, capture: true });

    // Counter + hint fade based on horizontal scroll position
    const updateProgress = () => {
      const maxScroll = brandsHTrackWrap.scrollWidth - brandsHTrackWrap.clientWidth;
      const ratio = maxScroll > 0 ? brandsHTrackWrap.scrollLeft / maxScroll : 0;
      const activeIdx = Math.min(slides.length - 1, Math.round(ratio * (slides.length - 1)));
      if (brandsHIdx) brandsHIdx.innerHTML = `<strong>0${activeIdx + 1}</strong>`;
      if (brandsHint) brandsHint.classList.toggle('is-faded', ratio > 0.1);
    };
    brandsHTrackWrap.addEventListener('scroll', () => {
      requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  /* ============================================================
     4d) HOW WE WORK — hover-activated steps (no scroll-jacking)
     ============================================================ */
  const hwSection = document.getElementById('howwework');
  if (hwSection) {
    const steps  = Array.from(hwSection.querySelectorAll('.hw-step'));
    const words  = Array.from(hwSection.querySelectorAll('.hw-word'));
    const fillEl = document.getElementById('hwProgressFill');
    const idxEl  = document.getElementById('hwIdx');
    const STEP_COUNT = steps.length;

    const setActive = (idx) => {
      const clamped = Math.max(0, Math.min(STEP_COUNT - 1, idx));
      steps.forEach((s, i)  => s.classList.toggle('is-active', i === clamped));
      words.forEach((w, i)  => w.classList.toggle('is-active', i === clamped));
      if (idxEl)  idxEl.textContent = '0' + (clamped + 1);
      if (fillEl) fillEl.style.transform = `scaleX(${(clamped + 1) / STEP_COUNT})`;
    };

    steps.forEach((step, i) => {
      step.addEventListener('mouseenter', () => setActive(i));
      step.addEventListener('focus', () => setActive(i));
      step.addEventListener('click', () => {
        // On mobile/touch, allow clicking the active step to close it (accordion)
        const isTouch = matchMedia('(hover: none)').matches;
        const alreadyActive = step.classList.contains('is-active');
        if (isTouch && alreadyActive) {
          steps.forEach(s => s.classList.remove('is-active'));
          words.forEach(w => w.classList.remove('is-active'));
          if (idxEl) idxEl.textContent = '00';
          if (fillEl) fillEl.style.transform = 'scaleX(0)';
        } else {
          setActive(i);
        }
      });
      step.setAttribute('tabindex', '0');
    });

    // Initialize first as active
    setActive(0);
  }

  /* ============================================================
     4e) STATS — counters animate up when scrolled into view
     ============================================================ */
  const statValues = document.querySelectorAll('.stat__value[data-count]');
  if (statValues.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const startTime = performance.now();
      // Reveal the parent .stat at the same moment the count starts
      const parent = el.closest('.stat');
      if (parent) parent.classList.add('is-counting');
      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(target * eased);
        el.textContent = value + (progress >= 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    statValues.forEach(el => obs.observe(el));
    // Reveal the symbol-only stats (∞) immediately when they enter view
    document.querySelectorAll('.stat__value--symbol').forEach(el => {
      const parent = el.closest('.stat');
      const symObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && parent) {
            parent.classList.add('is-counting');
            symObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      symObs.observe(el);
    });
  }

  /* ============================================================
     4f) HOVER PILLARS — about page interactive cards
     ============================================================ */
  const hpCards = document.querySelectorAll('.hp-card');
  if (hpCards.length) {
    hpCards.forEach((card, i) => {
      card.addEventListener('mouseenter', () => {
        hpCards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        // Apply this card's brand color
        const bc = card.dataset.bc;
        if (bc) card.style.setProperty('--bc', bc);
      });
    });
  }

  /* ============================================================
     4g) CAPABILITIES — Accordion toggle (one open at a time)
     ============================================================ */
  const capabilities = document.querySelectorAll('[data-cap]');
  if (capabilities.length) {
    capabilities.forEach((cap) => {
      const button = cap.querySelector('.capability__row');
      if (!button) return;
      button.addEventListener('click', () => {
        const wasOpen = cap.classList.contains('is-open');
        // Close all others
        capabilities.forEach((c) => {
          c.classList.remove('is-open');
          const btn = c.querySelector('.capability__row');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        // Toggle this one
        if (!wasOpen) {
          cap.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================================
     4h) BRAND NAV — sticky scroll-spy on brands.html
     ============================================================ */
  const brandNav = document.getElementById('brandNav');
  if (brandNav) {
    const navDots = Array.from(brandNav.querySelectorAll('.brand-nav__dot'));
    const sections = navDots.map(d => document.querySelector(d.getAttribute('href'))).filter(Boolean);
    const pageHeader = document.querySelector('.page-header');

    // Show/hide nav based on whether user has scrolled past the page header
    if (pageHeader && 'IntersectionObserver' in window) {
      const headerObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          // When page-header is NOT intersecting (scrolled past), show the brand-nav
          brandNav.classList.toggle('is-visible', !e.isIntersecting);
        });
      }, { threshold: 0, rootMargin: '-60% 0px 0px 0px' });
      headerObs.observe(pageHeader);
    } else {
      brandNav.classList.add('is-visible');
    }

    if (sections.length && 'IntersectionObserver' in window) {
      const navObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = sections.indexOf(e.target);
            navDots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
          }
        });
      }, { threshold: 0.4, rootMargin: '-20% 0px -40% 0px' });
      sections.forEach(s => navObs.observe(s));
    }
    // Smooth scroll on click
    navDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(dot.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ============================================================
     4i) BRAND SPREADS — trigger brand-color stripe on view
     ============================================================ */
  const brandSpreads = document.querySelectorAll('.brand-spread');
  if (brandSpreads.length && 'IntersectionObserver' in window) {
    const bsObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in-view');
          bsObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    brandSpreads.forEach(s => bsObs.observe(s));
  }

  /* ============================================================
     4j) BRAND SLIDESHOWS — auto-rotate with pause-on-hover
     ============================================================ */
  document.querySelectorAll('[data-slideshow]').forEach((slideshow) => {
    const slides = Array.from(slideshow.querySelectorAll('.bs-slide'));
    const dots   = Array.from(slideshow.querySelectorAll('.bs-slideshow__dot'));
    if (slides.length < 2) return;
    const interval = parseInt(slideshow.dataset.interval, 10) || 5000;
    let current = 0;
    let timer = null;
    let isPaused = false;
    let isInView = false;

    const go = (idx) => {
      current = ((idx % slides.length) + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i)   => d.classList.toggle('is-active', i === current));
      // If slide contains a video, play it; pause others
      slides.forEach((s, i) => {
        const v = s.querySelector('video');
        if (!v) return;
        if (i === current) v.play?.().catch(() => {});
        else { try { v.pause(); } catch (_) {} }
      });
    };
    const next = () => go(current + 1);
    const start = () => {
      stop();
      if (!isPaused && isInView) timer = setInterval(next, interval);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    // Dot click — jump and reset timer
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        go(i);
        start();
      });
    });

    // Pause on hover (desktop), resume on leave
    slideshow.addEventListener('mouseenter', () => { isPaused = true;  stop(); });
    slideshow.addEventListener('mouseleave', () => { isPaused = false; start(); });

    // Only run when in viewport — pause when off-screen for performance
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          isInView = e.isIntersecting;
          if (isInView) start(); else stop();
        });
      }, { threshold: 0.2 });
      obs.observe(slideshow);
    } else {
      isInView = true;
      start();
    }
  });

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
  /* ============================================================
     9) APPLY FORM — file UX, drag-drop, async submit, role prefill
     ============================================================ */
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    const fileInput = document.getElementById('appCv');
    const dropzone  = document.getElementById('appDropzone');
    const fileInfo  = document.getElementById('appFileInfo');
    const fileName  = fileInfo.querySelector('.dropzone__file-name');
    const removeBtn = fileInfo.querySelector('.dropzone__remove');
    const statusBox = document.getElementById('applyStatus');
    const roleSel   = document.getElementById('appRole');
    const applySect = document.getElementById('apply');

    const ALLOWED = ['pdf','doc','docx','rtf'];
    const MAX_BYTES = 5 * 1024 * 1024;

    const showStatus = (msg, kind) => {
      statusBox.innerHTML = msg;
      statusBox.className = 'apply-form__status';
      statusBox.classList.add(kind === 'success' ? 'is-success' : 'is-error');
      statusBox.hidden = false;
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const validateFile = (f) => {
      if (!f) return 'Please attach a CV.';
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED.includes(ext)) return 'CV must be PDF, DOC, DOCX, or RTF.';
      if (f.size > MAX_BYTES) return 'CV is larger than 5 MB.';
      return null;
    };

    const updateFileUI = () => {
      if (fileInput.files && fileInput.files[0]) {
        const f = fileInput.files[0];
        fileName.textContent = `${f.name}  ·  ${(f.size/1024/1024).toFixed(2)} MB`;
        fileInfo.hidden = false;
        dropzone.classList.add('is-filled');
      } else {
        fileInfo.hidden = true;
        dropzone.classList.remove('is-filled');
      }
    };

    fileInput.addEventListener('change', () => {
      const err = validateFile(fileInput.files[0]);
      if (err) {
        showStatus(err, 'error');
        fileInput.value = '';
      } else {
        statusBox.hidden = true;
      }
      updateFileUI();
    });
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.value = '';
      updateFileUI();
    });

    // Drag-and-drop
    ['dragenter', 'dragover'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragging');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragging');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        const f = e.dataTransfer.files[0];
        const err = validateFile(f);
        if (err) { showStatus(err, 'error'); return; }
        // Assign via DataTransfer for file input compatibility
        const dt = new DataTransfer();
        dt.items.add(f);
        fileInput.files = dt.files;
        statusBox.hidden = true;
        updateFileUI();
      }
    });

    // Prefill role from ?role= query
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && roleSel) {
      const match = Array.from(roleSel.options).find(o => o.value === roleParam || o.textContent.trim() === roleParam);
      if (match) match.selected = true;
    }
    // Pulse highlight if we landed via #apply hash
    if (window.location.hash === '#apply' && applySect) {
      applySect.classList.add('is-highlighted');
      setTimeout(() => applySect.classList.remove('is-highlighted'), 2400);
    }

    // Intercept "Apply" buttons on job cards — smooth scroll instead of page reload
    document.querySelectorAll('a[href*="?role="][href*="#apply"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Extract role from the link's href
        try {
          const url = new URL(link.href, window.location.origin);
          const role = url.searchParams.get('role');
          if (role && roleSel) {
            const match = Array.from(roleSel.options).find(o => o.value === role || o.textContent.trim() === role);
            if (match) match.selected = true;
          }
        } catch (_) {}
        // Smooth scroll to apply section
        if (applySect) {
          applySect.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Trigger the highlight pulse
          applySect.classList.add('is-highlighted');
          setTimeout(() => applySect.classList.remove('is-highlighted'), 2400);
          // Focus the first input after scroll completes
          setTimeout(() => {
            const firstInput = applyForm.querySelector('input[name="name"]');
            if (firstInput) firstInput.focus({ preventScroll: true });
          }, 700);
        }
      });
    });

    // Async submit
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusBox.hidden = true;

      // Client-side guards
      const required = ['name', 'phone', 'email', 'role'];
      for (const n of required) {
        const el = applyForm.elements[n];
        if (!el.value.trim()) {
          showStatus(`Please fill in ${el.previousElementSibling ? el.previousElementSibling.firstChild.textContent.toLowerCase() : n}.`, 'error');
          el.focus();
          return;
        }
      }
      const fErr = validateFile(fileInput.files[0]);
      if (fErr) { showStatus(fErr, 'error'); return; }

      applyForm.classList.add('is-submitting');

      try {
        const res = await fetch(applyForm.action, {
          method: 'POST',
          body: new FormData(applyForm),
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}

        if (!res.ok || data.ok === false) {
          const msg = data.error
            || `Server returned ${res.status}. Please email <a href="mailto:careers@worldofhospitality.com.qa">careers@worldofhospitality.com.qa</a> with your CV attached.`;
          showStatus(msg, 'error');
        } else {
          showStatus('✓  Thank you. Your application is in. We respond within two working days.', 'success');
          applyForm.reset();
          updateFileUI();
        }
      } catch (err) {
        showStatus(
          `Could not send. Please email <a href="mailto:careers@worldofhospitality.com.qa">careers@worldofhospitality.com.qa</a> with your CV attached.`,
          'error'
        );
      } finally {
        applyForm.classList.remove('is-submitting');
      }
    });
  }

})();
