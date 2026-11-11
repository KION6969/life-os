/* ============================================================
   LIFE OS â€” init: boot, routing, palette, particles, PWA
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */
  function dismissBoot() {
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.classList.add('gone');
    setTimeout(() => { boot.hidden = true; }, 800);
  }

  /* ----------------------------------------------------------
     NAV + ROUTING
     ---------------------------------------------------------- */
  function currentHash() {
    const raw = location.hash.replace(/^#\/?/, '').split('?')[0];
    return LOS.pages[raw] ? raw : null;
  }

  function navigate(page, push) {
    LOS.go(page, push);
  }

  function wireNav() {
    document.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        e.preventDefault();
        navigate(nav.dataset.nav, true);
        return;
      }
      const quick = e.target.closest('[data-quick]');
      if (quick) {
        const action = quick.dataset.quick;
        if (action === 'meal') { LOS.openMealModal(); return; }
        if (action === 'water') { LOS.addWater(250); return; }
        if (action === 'focus') {
          navigate('study', true);
          const toggle = document.getElementById('timerToggle');
          if (toggle) setTimeout(() => toggle.click(), 260);
          return;
        }
      }
      if (e.target.closest('#themeBtn')) {
        const order = ['mint', 'cyan', 'violet', 'amber'];
        const i = order.indexOf(LOS.db.prefs.accent);
        LOS.db.prefs.accent = order[(i + 1) % order.length];
        LOS.save();
        LOS.applyTheme();
        LOS.toast(`Accent Â· ${LOS.db.prefs.accent}`, 'ok', 1400);
      }
    });

    const logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', (e) => { e.preventDefault(); navigate('home', true); });

    window.addEventListener('hashchange', () => {
      const page = currentHash();
      if (page && page !== LOS.currentPage) navigate(page, false);
    });
    window.addEventListener('popstate', () => {
      const page = currentHash();
      if (page) navigate(page, false);
    });
  }

  /* ----------------------------------------------------------
     MODALS
     ---------------------------------------------------------- */
  function wireModals() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) {
        const backdrop = e.target.closest('.modal-backdrop');
        if (backdrop) LOS.closeModal(backdrop);
        return;
      }
      if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
        LOS.closeModal(e.target);
        return;
      }
      if (e.target.closest('#confirmOk')) {
        LOS.runConfirm();
        return;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const palette = document.getElementById('palette');
      if (palette && !palette.hidden) { closePalette(); return; }
      const open = $$('.modal-backdrop:not([hidden])');
      if (open.length) LOS.closeModal(open[open.length - 1]);
    });
  }

  /* ----------------------------------------------------------
     CLOCK
     ---------------------------------------------------------- */
  function wireClock() {
    LOS.updateClock();
    setInterval(LOS.updateClock, 1000);
    /* refresh "now" markers across the app every minute */
    let minute = new Date().getMinutes();
    setInterval(() => {
      const now = new Date().getMinutes();
      if (now === minute) return;
      minute = now;
      if (LOS.currentPage === 'home') LOS.renderHome();
      if (LOS.currentPage === 'gym') LOS.renderGym();
    }, 15000);
  }

  /* ----------------------------------------------------------
     COMMAND PALETTE
     ---------------------------------------------------------- */
  let paletteItems = [];
  let paletteIndex = 0;

  function commands() {
    const list = [
      { label: 'Go to Home', hint: 'screen', iconName: 'home', run: () => navigate('home', true) },
      { label: 'Go to Food', hint: 'screen', iconName: 'food', run: () => navigate('food', true) },
      { label: 'Go to Gym', hint: 'screen', iconName: 'gym', run: () => navigate('gym', true) },
      { label: 'Go to Study', hint: 'screen', iconName: 'study', run: () => navigate('study', true) },
      { label: 'Go to Profile', hint: 'screen', iconName: 'user', run: () => navigate('profile', true) },
      { label: 'Log a meal', hint: 'action', iconName: 'plus', run: () => LOS.openMealModal() },
      { label: 'Ask the AI Chef', hint: 'action', iconName: 'spark', run: () => document.getElementById('chefBtn') ? document.getElementById('chefBtn').click() : (navigate('food', true), setTimeout(() => { const b = document.getElementById('chefBtn'); if (b) b.click(); }, 200)) },
      { label: 'Add 250 ml water', hint: 'action', iconName: 'drop', run: () => LOS.addWater(250) },
      { label: 'Start a focus timer', hint: 'action', iconName: 'play', run: () => { navigate('study', true); setTimeout(() => { const t = document.getElementById('timerToggle'); if (t) t.click(); }, 220); } },
      { label: 'Start today\'s workout', hint: 'action', iconName: 'bolt', run: () => { navigate('gym', true); setTimeout(() => { const b = document.getElementById('startWorkoutTop'); if (b) b.click(); }, 200); } },
      { label: 'Add a study task', hint: 'action', iconName: 'study', run: () => { navigate('study', true); setTimeout(() => { const i = document.getElementById('taskInput'); if (i) i.focus(); }, 220); } },
      { label: 'Export a snapshot', hint: 'data', iconName: 'download', run: () => { const b = document.getElementById('exportBtn'); if (b) b.click(); } },
      { label: 'Install Life OS', hint: 'app', iconName: 'install', run: () => { const b = document.getElementById('installBtn'); if (b && !b.hidden) b.click(); else LOS.toast('Install from the launcher on localhost', 'warn'); } },
      { label: 'Cycle accent colour', hint: 'appearance', iconName: 'palette', run: () => { const b = document.getElementById('themeBtn'); if (b) b.click(); } }
    ];
    return list;
  }

  function renderPalette(query) {
    const box = document.getElementById('paletteList');
    if (!box) return;
    const q = String(query || '').trim().toLowerCase();
    paletteItems = commands().filter((c) => !q || c.label.toLowerCase().includes(q) || c.hint.includes(q));
    paletteIndex = 0;
    if (!paletteItems.length) {
      box.innerHTML = '<div class="palette-empty">No matching command</div>';
      return;
    }
    box.innerHTML = paletteItems.map((c, i) => `<button class="palette-item${i === 0 ? ' active' : ''}" data-palette="${i}">
      ${icon(c.iconName)}
      <span>${esc(c.label)}</span>
      <small>${esc(c.hint)}</small>
    </button>`).join('');
  }

  function openPalette() {
    const box = document.getElementById('palette');
    if (!box) return;
    box.hidden = false;
    document.body.classList.add('lock');
    const input = document.getElementById('paletteInput');
    if (input) input.value = '';
    renderPalette('');
    requestAnimationFrame(() => { if (input) input.focus(); });
  }

  function closePalette() {
    const box = document.getElementById('palette');
    if (!box) return;
    box.hidden = true;
    LOS.lockBody();
  }

  function runPaletteIndex(i) {
    const item = paletteItems[i];
    if (!item) return;
    closePalette();
    setTimeout(item.run, 60);
  }

  function wirePalette() {
    const btn = document.getElementById('paletteBtn');
    if (btn) btn.addEventListener('click', openPalette);

    const input = document.getElementById('paletteInput');
    if (input) {
      input.addEventListener('input', () => renderPalette(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!paletteItems.length) return;
          paletteIndex = (paletteIndex + (e.key === 'ArrowDown' ? 1 : -1) + paletteItems.length) % paletteItems.length;
          $$('.palette-item').forEach((el, i) => el.classList.toggle('active', i === paletteIndex));
          const active = $$('.palette-item')[paletteIndex];
          if (active) active.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          runPaletteIndex(paletteIndex);
        }
      });
    }

    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-palette]');
      if (item) { runPaletteIndex(Number(item.dataset.palette)); return; }
      const palette = document.getElementById('palette');
      if (palette && !palette.hidden && e.target === palette) closePalette();
    });

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '').toUpperCase()) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const palette = document.getElementById('palette');
        if (palette && !palette.hidden) closePalette(); else openPalette();
        return;
      }
      if (typing) return;
      if (e.key === '/' || e.key === '?') { e.preventDefault(); openPalette(); return; }
      if (e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        navigate(['home', 'food', 'gym', 'study', 'profile'][Number(e.key) - 1], true);
        return;
      }
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); LOS.openModal('shortcutsModal'); return; }
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); LOS.openMealModal(); }
    });
  }

  /* ----------------------------------------------------------
     PARTICLE FIELD
     ---------------------------------------------------------- */
  function wireParticles() {
    const canvas = document.getElementById('fx');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = null;
    let dots = [];
    let w = 0, h = 0, dpr = 1;

    const accent = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
      return raw || '0,255,163';
    };

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const count = Math.min(64, Math.round(window.innerWidth / 26));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.4) * dpr,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: (Math.random() - 0.5) * 0.12 * dpr,
        a: Math.random() * 0.4 + 0.12
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const rgb = accent();
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${d.a})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      /* faint constellation lines */
      ctx.lineWidth = 0.6 * dpr;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          const limit = 118 * dpr;
          if (dist < limit) {
            ctx.strokeStyle = `rgba(${rgb},${0.075 * (1 - dist / limit)})`;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      const off = LOS.db.prefs.motion === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      stop();
      canvas.style.display = off ? 'none' : '';
      if (off) return;
      resize();
      frame();
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    window.addEventListener('resize', () => {
      if (raf) { resize(); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (LOS.db.prefs.motion !== false) { resize(); if (!raf) frame(); }
    });
    window.addEventListener('lifeos:motion', start);

    start();
  }

  /* ----------------------------------------------------------
     PWA
     ---------------------------------------------------------- */
  function wirePWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.LOS.installPrompt = e;
      window.dispatchEvent(new Event('lifeos:installable'));
    });
    window.addEventListener('appinstalled', () => {
      window.LOS.installPrompt = null;
      window.dispatchEvent(new Event('lifeos:installed'));
    });

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                LOS.toast('Update ready â€” reload to load the new build', 'ok', 6000);
              }
            });
          });
        }).catch((err) => console.warn('Life OS: service worker failed', err));
      });
    }
  }

  /* ----------------------------------------------------------
     CROSS-TAB SYNC
     ---------------------------------------------------------- */
  function wireSync() {
    window.addEventListener('storage', (e) => {
      if (e.key !== LOS.KEY) return;
      LOS.reload();
      LOS.applyTheme();
      LOS.renderTop();
      LOS.renderCurrent();
      LOS.toast('Synced from another tab', 'ok', 1800);
    });
  }

  /* ----------------------------------------------------------
     START
     ---------------------------------------------------------- */
  function bootApp() {
    wireNav();
    wireModals();
    wireClock();
    wirePalette();
    wireParticles();
    wirePWA();
    wireSync();

    const page = currentHash() || 'home';
    LOS.go(page, false);
    LOS.renderTop();
    /* notification scheduler */
    if (LOS.db.prefs.notifications && 'Notification' in window && Notification.permission === 'granted') {
      let lastNotified = null;
      setInterval(() => {
        if (!LOS.db.prefs.notifications) return;
        const now = LOS.minutesNow();
        const blocks = (LOS.db.schedule || []).slice().sort((a,b) => LOS.parseHM(a.start) - LOS.parseHM(b.start));
        const next = blocks.find((b) => LOS.parseHM(b.start) > now && LOS.parseHM(b.start) - now <= 5);
        if (next && next.id !== lastNotified) {
          lastNotified = next.id;
          try { new Notification('Life OS', { body: `${next.label} starts in ${LOS.parseHM(next.start) - now} min`, icon: './icon-192.png' }); } catch (e) {}
        }
      }, 60000);
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.documentElement.dataset.standalone = 'true';
    }

    const bootDelay = LOS.db.prefs.motion === false ? 120 : 700;
    setTimeout(dismissBoot, bootDelay);
  }

  function start() {
    if (!localStorage.getItem(LOS.KEY)) {
      const modal = document.getElementById('onboardModal');
      if (modal) {
        modal.hidden = false;
        document.body.classList.add('lock');
        const form = document.getElementById('onboardForm');
        if (form) {
          const first = form.querySelector('input');
          if (first) setTimeout(() => first.focus({ preventScroll: true }), 120);
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = form.elements;
            const nameEl = form.querySelector('[name="name"]');
            const ageEl = form.querySelector('[name="age"]');
            const sexEl = form.querySelector('[name="sex"]');
            const heightEl = form.querySelector('[name="height"]');
            const weightEl = form.querySelector('[name="weight"]');
            const goalEl = form.querySelector('[name="goal"]');
            const dietEl = form.querySelector('[name="diet"]');
            const db = LOS.defaults();
            db.profile.name = String(nameEl.value || '').trim().slice(0, 40) || 'Life OS User';
            db.profile.age = Math.min(100, Math.max(13, Number(ageEl.value) || 20));
            db.profile.sex = sexEl.value === 'female' ? 'female' : 'male';
            db.profile.height = Math.min(230, Math.max(120, Number(heightEl.value) || 175));
            db.profile.weight = Math.min(250, Math.max(35, Number(weightEl.value) || 70));
            db.profile.goal = goalEl.value || 'recomp';
            db.profile.diet = dietEl.value || 'omnivore';
            db.streak = { count: 0, last: LOS.todayKey() };
            localStorage.setItem(LOS.KEY, JSON.stringify(db));
            LOS.reload();
            modal.hidden = true;
            document.body.classList.remove('lock');
            bootApp();
          }, { once: true });
          return;
        }
      }
    }
    bootApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('load', () => setTimeout(dismissBoot, 2200), { once: true });
})();
