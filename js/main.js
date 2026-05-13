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
     0) LENIS — buttery smooth scroll
     ============================================================ */
  let lenis = null;
  if (hasLenis && !reducedMotion) {
    lenis = new window.Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.1,
    });
    const lenisLoop = (time) => { lenis.raf(time); requestAnimationFrame(lenisLoop); };
    requestAnimationFrame(lenisLoop);
    if (hasST) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          return arguments.length ? lenis.scrollTo(value, { immediate: true }) : window.scrollY;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
      });
    }
  }

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
          if (preCounter) preCounter.textContent = String(Math.floor(this.targets()[0].innerText || 0)).padStart(2, '0');
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

    // Scroll-driven letterbox — bars appear at top/bottom as you scroll
    if (hasST) {
      window.ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => {
          const bar = Math.round(self.progress * 80); // 0–80px bars
          heroStage.style.setProperty('--bar', bar + 'px');
        }
      });
    }
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
