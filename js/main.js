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
     4a) HEADLINE LETTER SPLIT + REVEAL
     ============================================================ */
  document.querySelectorAll('[data-split]').forEach(el => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const raw = el.innerHTML;
    // Wrap each character of plain text in a span; preserve <em> tags
    const tmp = document.createElement('div');
    tmp.innerHTML = raw;
    const wrapChars = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          const span = document.createElement('span');
          span.className = c === ' ' ? 'char space' : 'char';
          span.textContent = c === ' ' ? '\u00A0' : c;
          frag.appendChild(span);
        }
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapChars);
      }
    };
    Array.from(tmp.childNodes).forEach(wrapChars);
    el.innerHTML = tmp.innerHTML;
    // Stagger animation delays
    el.querySelectorAll('.char').forEach((c, i) => {
      c.style.animationDelay = `${0.7 + i * 0.028}s`;
    });
  });

  /* ============================================================
     4b) HERO CANVAS — gold dust constellation
     ============================================================ */
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = heroCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let particles = [];
    let mouse = { x: -9999, y: -9999, active: false };
    const COUNT_BASE = 56;
    let count = COUNT_BASE;

    const resize = () => {
      const rect = heroCanvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      heroCanvas.width = w * dpr;
      heroCanvas.height = h * dpr;
      heroCanvas.style.width = w + 'px';
      heroCanvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.min(COUNT_BASE, Math.round(w * h / 18000));
    };

    const seed = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.4 + Math.random() * 0.6,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.5 + Math.random() * 1.4,
        });
      }
    };

    resize();
    seed();
    window.addEventListener('resize', () => { resize(); seed(); });

    const hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = heroCanvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.active = true;
      });
      hero.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -9999; mouse.y = -9999;
      });
    }

    const CONNECT = 130;
    const MOUSE_PULL = 170;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Drift
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        // Mouse attraction
        if (mouse.active) {
          const dxm = mouse.x - p.x;
          const dym = mouse.y - p.y;
          const dm = Math.hypot(dxm, dym);
          if (dm < MOUSE_PULL) {
            const force = (1 - dm / MOUSE_PULL) * 0.06;
            p.vx += dxm / dm * force;
            p.vy += dym / dm * force;
          }
        }
        // Damping + cap
        p.vx *= 0.985; p.vy *= 0.985;
        const maxV = 0.6;
        if (p.vx > maxV) p.vx = maxV; if (p.vx < -maxV) p.vx = -maxV;
        if (p.vy > maxV) p.vy = maxV; if (p.vy < -maxV) p.vy = -maxV;

        // Wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,129,74,${0.45 + p.z * 0.35})`;
        ctx.fill();
      }

      // Lines: each particle to nearby particles
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < CONNECT) {
            const o = (1 - d / CONNECT) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(168,129,74,${o})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
        // Lines to mouse
        if (mouse.active) {
          const dxm = a.x - mouse.x;
          const dym = a.y - mouse.y;
          const dm = Math.hypot(dxm, dym);
          if (dm < MOUSE_PULL) {
            const o = (1 - dm / MOUSE_PULL) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(212,168,108,${o})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    };

    setTimeout(() => heroCanvas.classList.add('is-on'), 600);
    tick();
  }

  /* ============================================================
     4c) CURSOR-FOLLOWING GLOW (dark sections)
     ============================================================ */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let cgRaf = null;
    let cgX = -9999, cgY = -9999;
    document.addEventListener('mousemove', (e) => {
      cgX = e.clientX; cgY = e.clientY;
      if (cgRaf) cancelAnimationFrame(cgRaf);
      cgRaf = requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate3d(${cgX - 240}px, ${cgY - 240}px, 0)`;
      });
    });
    // Only show on dark sections (hero, marquee, upcoming, partner — bg ink)
    const darkSelectors = ['.hero', '.marquee', '.upcoming', '.partner', '.foot', '.page-header'];
    const checkDark = () => {
      const ey = window.innerHeight / 2;
      let inDark = false;
      for (const sel of darkSelectors) {
        document.querySelectorAll(sel).forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < ey && r.bottom > ey) inDark = true;
        });
      }
      cursorGlow.classList.toggle('is-active', inDark);
    };
    window.addEventListener('scroll', checkDark, { passive: true });
    checkDark();
  }

  /* ============================================================
     4) HERO PANELS — auto-cycle "active" highlight (visual only)
        Panels are <a> links: hover highlights, click navigates.
     ============================================================ */
  const triptych = document.getElementById('triptych');
  if (triptych) {
    const panels = Array.from(triptych.querySelectorAll('.panel'));
    const progressBar = document.getElementById('heroProgress');
    const focusName = document.getElementById('focusName');
    const focusCount = document.getElementById('focusCount');

    const BRAND_NAMES = {
      gunaydin: 'Günaydın',
      kumar: 'Kumar',
      'eleven-green': 'Eleven Green',
      'al-beiruti': 'Al Beiruti'
    };

    let activeIdx = 0;
    let progress = 0;
    let paused = false;
    let progressTimer = null;
    const ROTATE_MS = 5500;

    const setActive = (idx, opts = {}) => {
      activeIdx = (idx + panels.length) % panels.length;
      panels.forEach((p, i) => p.classList.toggle('is-active', i === activeIdx));
      const brandKey = panels[activeIdx].getAttribute('data-brand');
      if (focusName) focusName.textContent = BRAND_NAMES[brandKey] || brandKey;
      if (focusCount) {
        focusCount.textContent = `0${activeIdx + 1} / 0${panels.length}`;
      }
      if (!opts.skipReset) {
        progress = 0;
        if (progressBar) progressBar.style.width = '0%';
      }
    };

    const tick2 = () => {
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
      progressTimer = setInterval(tick2, 50);
    };
    const stopRotation = () => {
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
    };

    panels.forEach((panel, i) => {
      panel.addEventListener('mouseenter', () => {
        paused = true;
        progress = 0;
        if (progressBar) progressBar.style.width = '0%';
        setActive(i, { skipReset: true });
      });
      panel.addEventListener('mouseleave', () => { paused = false; });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopRotation(); else startRotation();
    });

    setTimeout(startRotation, 1800);
  }

  /* ============================================================
     5) HERO SPOTLIGHT + HEADLINE PARALLAX
     ============================================================ */
  const hero = document.getElementById('hero');
  const heroHeadline = document.getElementById('heroHeadline');
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
          heroHeadline.style.transform = `translate3d(${(px * 8).toFixed(2)}px, ${(py * 5).toFixed(2)}px, 0)`;
        }
      });
    });
    hero.addEventListener('mouseleave', () => {
      if (heroHeadline) heroHeadline.style.transform = '';
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
