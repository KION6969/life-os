/* ============================================================
   LIFE OS â€” core: data, helpers, navigation, home
   ============================================================ */
window.LOS = window.LOS || {};
(function () {
  'use strict';
  const LOS = window.LOS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  LOS.$ = $; LOS.$$ = $$;
  LOS.pages = {};

  const KEY = 'lifeos.v1';
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  LOS.WEEKDAYS = WEEKDAYS;
  LOS.WEEKDAYS_SHORT = WEEKDAYS_SHORT;

  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  LOS.pad = pad; LOS.clamp = clamp;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  LOS.esc = esc;
  LOS.icon = (name, cls = 'ic') => `<svg class="${cls}"><use href="#i-${name}"/></svg>`;
  LOS.uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));

  const todayKey = (d = new Date()) => {
    const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return x.toISOString().slice(0, 10);
  };
  const dateKey = (d) => todayKey(d);
  LOS.todayKey = todayKey; LOS.dateKey = dateKey;

  const fromKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  LOS.fromKey = fromKey;

  const addDays = (key, n) => {
    const d = fromKey(key);
    d.setDate(d.getDate() + n);
    return dateKey(d);
  };
  LOS.addDays = addDays;

  const daysBetween = (a, b) => {
    const da = fromKey(a), db = fromKey(b);
    return Math.round((db - da) / 86400000);
  };
  LOS.daysBetween = daysBetween;

  const parseHM = (t) => {
    const [h, m] = String(t).split(':').map(Number);
    return h * 60 + (m || 0);
  };
  LOS.parseHM = parseHM;

  const fmtTime = (t) => {
    const m = parseHM(t);
    let h = Math.floor(m / 60) % 24;
    const min = m % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return min ? `${h}:${pad(min)} ${ap}` : `${h}:00 ${ap}`;
  };
  LOS.fmtTime = fmtTime;

  const minutesNow = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };
  LOS.minutesNow = minutesNow;

  const dateLabel = (key) => {
    const d = fromKey(key);
    return `${WEEKDAYS[d.getDay()]} Â· ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  LOS.dateLabel = dateLabel;

  const fmtClock = (sec) => {
    const s = Math.max(0, Math.round(sec));
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  };
  LOS.fmtClock = fmtClock;

  const fmtDateLong = (key) => {
    const d = fromKey(key);
    return `${WEEKDAYS[d.getDay()]} Â· ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };
  LOS.fmtDateLong = fmtDateLong;

  const dateShort = (key) => {
    const d = fromKey(key);
    return `${WEEKDAYS_SHORT[d.getDay()]} Â· ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  LOS.dateShort = dateShort;

  /* ---------------------------------------------------------- *
   * DEFAULT DATA
   * ---------------------------------------------------------- */
  const DEFAULT_SCHEDULE = [
    { id: 'wake', start: '07:00', end: '07:30', label: 'Wake up', type: 'routine' },
    { id: 'study1', start: '08:00', end: '10:00', label: 'Study session 1', type: 'study' },
    { id: 'pre', start: '10:00', end: '10:30', label: 'Pre-workout prep', type: 'fuel' },
    { id: 'gym', start: '11:00', end: '12:00', label: 'Gym', type: 'gym' },
    { id: 'lunch', start: '12:00', end: '13:00', label: 'Lunch + shower', type: 'fuel' },
    { id: 'rest', start: '13:00', end: '14:00', label: 'Rest', type: 'rest' },
    { id: 'study2', start: '14:00', end: '16:00', label: 'Study session 2', type: 'study' },
    { id: 'break', start: '16:00', end: '17:00', label: 'Break', type: 'rest' },
    { id: 'code', start: '17:00', end: '18:00', label: 'Coding & projects', type: 'study' },
    { id: 'personal', start: '18:00', end: '19:00', label: 'Personal time', type: 'rest' },
    { id: 'dinner', start: '19:00', end: '20:00', label: 'Dinner', type: 'fuel' },
    { id: 'revise', start: '20:00', end: '21:00', label: 'Revision', type: 'study' }
  ];
  LOS.defaults = defaults;

  LOS.SCHEDULE_TYPES = [
    { id: 'study', label: 'Study / focus' },
    { id: 'gym', label: 'Gym' },
    { id: 'fuel', label: 'Food' },
    { id: 'routine', label: 'Routine' },
    { id: 'rest', label: 'Rest / break' }
  ];

  const MEAL_CATS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'pre', label: 'Pre-workout' },
    { id: 'post', label: 'Post-workout' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snacks' }
  ];
  LOS.MEAL_CATS = MEAL_CATS;

  const DEFAULT_TASKS = [
    { id: 't1', text: 'Finish the calculus problem set', done: false },
    { id: 't2', text: 'Review biology notes â€” chapters 4â€“6', done: false },
    { id: 't3', text: 'Ship the car configurator UI', done: false },
    { id: 't4', text: 'Read 20 pages before bed', done: false }
  ];

  function defaults() {
    const key = todayKey();
    return {
      version: 1,
      profile: {
        name: 'Life OS User', age: 20, sex: 'male', height: 183, weight: 78,
        activity: 1.55, goal: 'recomp', diet: 'omnivore', cuisine: 'any',
        proteinPerKg: 2.0, fatPerKg: 0.85, meals: 4
      },
      prefs: { accent: 'mint', motion: true, theme: 'dark', compact: false, notifications: false, chef: { pantry: '', dislikes: '' }, cloud: { provider: 'none', token: '', gistId: '', binId: '' }, favourites: [] },
      schedule: DEFAULT_SCHEDULE.map((s) => ({ ...s })),
      days: {},
      measurements: [],
      weightHistory: [],
      gymPlans: {},
      gymHistory: [],
      studyTasks: DEFAULT_TASKS.map((t) => ({ ...t })),
      studySessions: 0,
      studyHistory: {},
      habitStreaks: {},
      streak: { count: 0, last: key },
      createdAt: key
    };
  }

  function load() {
    let data = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = JSON.parse(raw);
    } catch (err) { console.warn('Life OS: could not read storage', err); }
    if (!data || typeof data !== 'object') data = defaults();
    data = migrate(data);
    return data;
  }

  function migrate(data) {
    const base = defaults();
    const out = { ...base, ...data };
    out.profile = { ...base.profile, ...(data.profile || {}) };
    out.prefs = { ...base.prefs, ...(data.prefs || {}) };
    out.prefs.chef = { ...base.prefs.chef, ...((data.prefs && data.prefs.chef) || {}) };
    out.prefs.cloud = { ...base.prefs.cloud, ...((data.prefs && data.prefs.cloud) || {}) };
    out.prefs.favourites = Array.isArray(data.prefs && data.prefs.favourites) ? data.prefs.favourites : base.prefs.favourites;
    if (!Array.isArray(out.schedule)) out.schedule = base.schedule;
    out.days = out.days && typeof out.days === 'object' ? out.days : {};
    out.gymHistory = Array.isArray(out.gymHistory) ? out.gymHistory : [];
    out.gymPlans = (out.gymPlans && typeof out.gymPlans === 'object') ? out.gymPlans : {};
    out.habitStreaks = (out.habitStreaks && typeof out.habitStreaks === 'object') ? out.habitStreaks : {};
    out.prefs.prs = out.prefs.prs || {};
    out.weightHistory = Array.isArray(out.weightHistory) ? out.weightHistory : [];
    out.measurements = Array.isArray(out.measurements) ? out.measurements : [];
    out.studyTasks = Array.isArray(out.studyTasks) ? out.studyTasks : base.studyTasks;
    out.studyHistory = out.studyHistory && typeof out.studyHistory === 'object' ? out.studyHistory : {};
    out.studySessions = Number(out.studySessions) || 0;
    out.streak = { ...base.streak, ...(out.streak || {}) };
    const gap = out.streak.last ? daysBetween(out.streak.last, todayKey()) : 99;
    if (gap > 1) out.streak.count = 0;
    return out;
  }

  let db = load();
  LOS.db = db;
  LOS.KEY = KEY;
  LOS.save = function save() {
    LOS.db = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (err) { toast('Storage is full â€” export and reset.', 'danger'); }
  };
  LOS.reload = function reload() {
    db = load(); LOS.db = db; return db;
  };

  /* ---------------------------------------------------------- *
   * DERIVED DATA
   * ---------------------------------------------------------- */
  function dayData(key) {
    if (!db.days[key]) {
      db.days[key] = { meals: [], water: 0, done: {}, habits: {}, workout: null, studyMin: 0 };
    }
    const d = db.days[key];
    d.meals = Array.isArray(d.meals) ? d.meals : [];
    d.done = d.done || {};
    d.habits = d.habits || {};
    d.studyMin = Number(d.studyMin) || 0;
    d.water = Number(d.water) || 0;
    return d;
  }
  LOS.dayData = dayData;

  function goalsFor(profile) {
    const p = profile || db.profile;
    const age = Number(p.age) || 20;
    const h = Number(p.height) || 175;
    const w = Number(p.weight) || 75;
    const sex = p.sex === 'female' ? 'female' : 'male';
    const activity = Number(p.activity) || 1.55;
    const goal = p.goal || 'recomp';

    const bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161);
    const tdee = bmr * activity;
    const offset = goal === 'cut' ? -500 : goal === 'recomp' ? -350 : goal === 'bulk' ? 300 : 0;
    const kcal = Math.round((tdee + offset) / 10) * 10;
    const proteinPerKg = Number(p.proteinPerKg) || (goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 2.0);
    const fatPerKg = Number(p.fatPerKg) || 0.85;
    const meals = clamp(Math.round(Number(p.meals) || 4), 2, 6);
    const protein = Math.round(w * proteinPerKg);
    const fat = Math.round(w * fatPerKg);
    const carbs = Math.max(70, Math.round((kcal - protein * 4 - fat * 9) / 4));
    const fibre = Math.round(kcal / 100);
    const water = Math.round(clamp(w * 0.04, 2.2, 4.2) * 10) / 10;

    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee), kcal,
      protein, carbs, fat, fibre, water, goal,
      proteinPerKg, fatPerKg, meals,
      perMeal: {
        kcal: Math.round(kcal / meals),
        p: Math.round(protein / meals),
        c: Math.round(carbs / meals),
        f: Math.round(fat / meals)
      }
    };
  }
  LOS.goalsFor = goalsFor;

  function totalsFor(day) {
    const t = { kcal: 0, p: 0, c: 0, f: 0, fib: 0, water: Number(day && day.water) || 0, meals: 0 };
    (day && day.meals ? day.meals : []).forEach((m) => {
      t.kcal += Number(m.kcal) || 0;
      t.p += Number(m.p) || 0;
      t.c += Number(m.c) || 0;
      t.f += Number(m.f) || 0;
      t.fib += Number(m.fib) || 0;
      t.meals += 1;
    });
    return t;
  }
  LOS.totalsFor = totalsFor;

  function habitList(day, key) {
    const t = totalsFor(day);
    const g = goalsFor();
    const studyMin = Number(day.studyMin) || 0;
    return [
      { id: 'water', label: 'Hydration goal', sub: `${t.water.toFixed(1)} / ${g.water.toFixed(1)} L`, done: t.water >= g.water * 0.99 },
      { id: 'protein', label: 'Protein target', sub: `${Math.round(t.p)} / ${g.protein} g`, done: t.p >= g.protein * 0.95 },
      { id: 'study', label: 'Deep study', sub: `${Math.round(studyMin)} / 120 min`, done: studyMin >= 120 },
      { id: 'workout', label: 'Training', sub: day.workout ? day.workout.title : 'Not logged yet', done: !!day.workout },
      { id: 'sleep', label: 'Screens off by 22:00', sub: 'Evening discipline â€” tap to mark', done: !!(day.habits && day.habits.sleep), manual: true }
    ];
  }
  function updateHabitStreaks(day, key) {
    const habits = habitList(day, key);
    if (!db.habitStreaks) db.habitStreaks = {};
    habits.forEach((h) => {
      const st = db.habitStreaks[h.id] || { count: 0, last: null };
      if (h.done) {
        if (st.last === key) return;
        const gap = st.last ? daysBetween(st.last, key) : 0;
        if (gap === 1) st.count = (st.count || 0) + 1;
        else if (gap === 0) { /* same day, already counted */ }
        else st.count = 1;
        st.last = key;
      } else {
        // if not done today, leave streak as is (don't reset until a gap)
      }
      db.habitStreaks[h.id] = st;
    });
    LOS.save();
  }
  LOS.updateHabitStreaks = updateHabitStreaks;

  function scoreFor(key) {
    const day = dayData(key);
    const g = goalsFor();
    const t = totalsFor(day);
    const totalBlocks = db.schedule.length || 1;
    const doneBlocks = db.schedule.filter((s) => day.done[s.id]).length;
    const habits = habitList(day, key);
    const doneHabits = habits.filter((h) => h.done).length;
    const kcalRatio = clamp(t.kcal / Math.max(1, g.kcal), 0, 1);
    const raw = (doneBlocks / totalBlocks) * 40 + (doneHabits / habits.length) * 30 + kcalRatio * 30;
    return Math.round(clamp(raw, 0, 100));
  }
  LOS.scoreFor = scoreFor;

  function maybeStreak() {
    const key = todayKey();
    if (db.streak.last === key) return;
    const score = scoreFor(key);
    if (score < 40) return;
    const gap = db.streak.last ? daysBetween(db.streak.last, key) : 0;
    if (gap < 0) { db.streak.count = 1; }
    else if (gap === 1) { db.streak.count = (Number(db.streak.count) || 0) + 1; }
    else if (gap === 0) { return; }
    else { db.streak.count = 1; }
    db.streak.last = key;
    LOS.save();
    renderTop();
  }
  LOS.maybeStreak = maybeStreak;

  /* ---------------------------------------------------------- *
   * UI PRIMITIVES
   * ---------------------------------------------------------- */
  function lockBody() {
    const anyOpen = $$('.modal-backdrop:not([hidden]), .workout:not([hidden])').length > 0;
    document.body.classList.toggle('lock', anyOpen);
  }
  LOS.lockBody = lockBody;

  function openModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return null;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('open'));
    lockBody();
    const focusable = el.querySelector('input, select, textarea, button');
    if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 60);
    return el;
  }
  LOS.openModal = openModal;

  function closeModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    el.classList.remove('open');
    setTimeout(() => {
      if (!el.classList.contains('open')) el.hidden = true;
      lockBody();
    }, 170);
  }
  LOS.closeModal = closeModal;

  function toast(message, type = 'ok', ms = 3200) {
    const wrap = document.getElementById('toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type !== 'ok' ? ' ' + type : '');
    const icon = type === 'danger' ? 'close' : type === 'warn' ? 'bolt' : 'check';
    el.innerHTML = `<svg class="ic"><use href="#i-${icon}"/></svg><span>${esc(message)}</span>`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 260);
    }, ms);
  }
  function celebrate(msg) {
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch (e) {}
    toast(msg, 'ok', 3200);
    /* confetti burst */
    const layer = document.createElement('div');
    layer.className = 'confetti';
    const colors = ['#00ffa3', '#22d3ee', '#a78bfa', '#ffb020', '#ff5ea8'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1600);
  }
  LOS.celebrate = celebrate;

  let confirmCallback = null;
  function confirmAction(title, text, okLabel, cb) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    document.getElementById('confirmOk').textContent = okLabel || 'Confirm';
    confirmCallback = cb;
    openModal(modal);
  }
  LOS.confirmAction = confirmAction;
  LOS.runConfirm = function runConfirm() {
    const cb = confirmCallback;
    confirmCallback = null;
    closeModal('confirmModal');
    if (typeof cb === 'function') setTimeout(cb, 120);
  };

  let audioCtx = null;
  function chime(sequence) {
    if (!db.prefs.motion) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const notes = sequence || [660, 880, 1180];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const t0 = audioCtx.currentTime + i * 0.12;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      });
    } catch (err) { /* audio is optional */ }
  }
  LOS.chime = chime;

  /* ---------------------------------------------------------- *
   * THEME + TOP
   * ---------------------------------------------------------- */
  function applyTheme() {
    document.documentElement.dataset.theme = db.prefs.accent || 'mint';
    document.documentElement.dataset.mode = db.prefs.theme || 'dark';
    document.documentElement.dataset.compact = db.prefs.compact ? 'on' : 'off';
    document.documentElement.dataset.motion = db.prefs.motion === false ? 'off' : 'on';
    try { window.dispatchEvent(new Event('lifeos:motion')); } catch (err) {}
  }
  LOS.applyTheme = applyTheme;

  function renderTop() {
    const streak = Number(db.streak.count) || 0;
    const el = document.getElementById('topStreak');
    if (el) el.textContent = streak;
  }
  LOS.renderTop = renderTop;

  function updateClock() {
    const d = new Date();
    const el = document.getElementById('clock');
    if (el) el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  LOS.updateClock = updateClock;

  /* ---------------------------------------------------------- *
   * NAVIGATION
   * ---------------------------------------------------------- */
  const PAGE_TITLES = { home: 'Home', food: 'Food', gym: 'Gym', study: 'Study', profile: 'Profile' };
  LOS.PAGE_TITLES = PAGE_TITLES;
  LOS.currentPage = 'home';

  function go(page, push = true) {
    if (!LOS.pages[page]) page = 'home';
    LOS.currentPage = page;
    $$('.page').forEach((p) => p.classList.toggle('active', p.dataset.page === page));
    $$('[data-nav]').forEach((b) => b.classList.toggle('active', b.dataset.nav === page));
    document.body.dataset.page = page;
    const crumb = document.getElementById('crumbPage');
    if (crumb) crumb.textContent = PAGE_TITLES[page] || page;
    if (push && location.hash.slice(1) !== page) {
      history.pushState(null, '', '#' + page);
    }
    try { LOS.pages[page](); } catch (err) { console.error('Life OS: render failed for ' + page, err); }
    window.scrollTo({ top: 0, behavior: db.prefs.motion === false ? 'auto' : 'smooth' });
  }
  LOS.go = go;
  LOS.renderCurrent = function renderCurrent() {
    const fn = LOS.pages[LOS.currentPage];
    if (fn) fn();
  };

  /* ---------------------------------------------------------- *
   * HOME
   * ---------------------------------------------------------- */
  function nextBlock(day) {
    const now = minutesNow();
    const open = db.schedule.filter((s) => !day.done[s.id]);
    const current = open.find((s) => now >= parseHM(s.start) && now < parseHM(s.end));
    const next = open.find((s) => parseHM(s.start) > now);
    return { current, next };
  }
  LOS.nextBlock = nextBlock;

  function renderHome() {
    const key = todayKey();
    const day = dayData(key);
    const g = goalsFor();
    const t = totalsFor(day);
    const score = scoreFor(key);
    const first = (db.profile.name || 'Operator').trim() || 'Operator';
    const hour = new Date().getHours();
    const greet = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const { current, next } = nextBlock(day);
    const streak = Number(db.streak.count) || 0;

    const heroDate = document.getElementById('heroDate');
    if (heroDate) heroDate.textContent = fmtDateLong(key).toUpperCase();
    const heroGreeting = document.getElementById('heroGreeting');
    if (heroGreeting) heroGreeting.innerHTML = `${greet}, <span>${esc(first)}</span>`;
    const heroLine = document.getElementById('heroLine');
    if (heroLine) {
      if (!db.schedule.length) heroLine.textContent = 'No blocks scheduled yet â€” tap Edit to build your day.';
      else if (current) heroLine.textContent = `${current.label} is live until ${fmtTime(current.end)}. ${streak}-day streak on the line.`;
      else if (next) heroLine.textContent = `Next up: ${next.label} at ${fmtTime(next.start)}. You're on a ${streak}-day streak.`;
      else heroLine.textContent = `Today's protocol is complete. ${streak}-day streak secured â€” recover well.`;
    }

    const ring = document.getElementById('scoreRing');
    if (ring) ring.style.strokeDashoffset = String(326.7 * (1 - score / 100));
    const scoreVal = document.getElementById('scoreVal');
    if (scoreVal) scoreVal.textContent = score;

    /* next card */
    const nc = document.getElementById('nextCard');
    if (nc) {
      if (current) {
        const start = parseHM(current.start), end = parseHM(current.end);
        const now = minutesNow();
        const pct = clamp(((now - start) / Math.max(1, end - start)) * 100, 0, 100);
        const left = Math.max(0, end - now);
        nc.innerHTML = `
          <div class="next-top"><span class="live-pill"><i></i>Live now</span><span class="mono muted" style="font-size:9px">${fmtTime(current.start)} â€“ ${fmtTime(current.end)}</span></div>
          <div>
            <div class="next-title">${esc(current.label)}</div>
            <div class="next-sub">${current.type === 'study' ? 'Deep work block' : current.type === 'gym' ? 'Training block' : current.type === 'fuel' ? 'Nutrition window' : 'Recovery window'}</div>
            <div class="next-count"><b>${left}</b><span>min left</span></div>
          </div>
          <div><div class="next-bar"><i style="width:${pct}%"></i></div>
          <div class="next-foot"><span>${Math.round(pct)}% elapsed</span><span>${esc(current.type)}</span></div></div>`;
      } else if (next) {
        const now = minutesNow();
        const until = Math.max(0, parseHM(next.start) - now);
        nc.innerHTML = `
          <div class="next-top"><span class="live-pill"><i></i>Next up</span><span class="mono muted" style="font-size:9px">${fmtTime(next.start)} â€“ ${fmtTime(next.end)}</span></div>
          <div>
            <div class="next-title">${esc(next.label)}</div>
            <div class="next-sub">Starts in ${until >= 60 ? Math.floor(until / 60) + 'h ' + (until % 60) + 'm' : until + 'm'} Â· ${esc(next.type)}</div>
            <div class="next-count"><b>${until}</b><span>min to start</span></div>
          </div>
          <div><div class="next-bar"><i style="width:6%"></i></div>
          <div class="next-foot"><span>Up next</span><span>${esc(next.type)}</span></div></div>`;
      } else if (!db.schedule.length) {
        nc.innerHTML = `
          <div class="next-top"><span class="live-pill"><i></i>Open day</span></div>
          <div>
            <div class="next-title">No blocks yet</div>
            <div class="next-sub">Use Edit on Today's protocol to add study, gym or meal blocks that fit your day.</div>
            <div class="next-count"><b>${score}</b><span>daily score</span></div>
          </div>
          <div><div class="next-bar"><i style="width:${score}%"></i></div>
          <div class="next-foot"><span>${streak}-day streak</span><span>plan</span></div></div>`;
      } else {
        nc.innerHTML = `
          <div class="next-top"><span class="live-pill"><i></i>Clear</span></div>
          <div>
            <div class="next-title">Protocol complete</div>
            <div class="next-sub">Nothing left on today's schedule. Log a meal or bank a focus block to push the score.</div>
            <div class="next-count"><b>${score}</b><span>daily score</span></div>
          </div>
          <div><div class="next-bar"><i style="width:${score}%"></i></div>
          <div class="next-foot"><span>${streak}-day streak</span><span>recover</span></div></div>`;
      }
    }

    /* stats */
    const stats = document.getElementById('homeStats');
    if (stats) {
      const cards = [
        { icon: 'flame', label: 'Calories left', value: Math.max(0, Math.round(g.kcal - t.kcal)), unit: 'kcal', sub: `${Math.round(t.kcal)} of ${g.kcal} logged`, pct: (t.kcal / g.kcal) * 100 },
        { icon: 'bolt', label: 'Protein left', value: Math.max(0, Math.round(g.protein - t.p)), unit: 'g', sub: `${Math.round(t.p)} of ${g.protein} g`, pct: (t.p / g.protein) * 100 },
        { icon: 'study', label: 'Study today', value: Math.round(day.studyMin), unit: 'min', sub: `${Math.max(0, 120 - Math.round(day.studyMin))} min to target`, pct: (day.studyMin / 120) * 100 },
        { icon: 'drop', label: 'Water', value: t.water.toFixed(1), unit: 'L', sub: `of ${g.water.toFixed(1)} L goal`, pct: (t.water / g.water) * 100 }
      ];
      stats.innerHTML = cards.map((c) => {
        const pct = clamp(c.pct, 0, 100);
        const over = c.pct > 108;
        return `<div class="card stat-card${over ? ' over' : ''}">
          <div class="stat-top"><span>${c.label}</span>${LOS.icon(c.icon)}</div>
          <b>${c.value}<em>${c.unit}</em></b>
          <div class="stat-meter"><i style="width:${pct}%"></i></div>
          <div class="stat-sub">${c.sub}</div>
        </div>`;
      }).join('');
    }

    /* timeline */
    const tl = document.getElementById('timeline');
    const doneCount = db.schedule.filter((s) => day.done[s.id]).length;
    const meta = document.getElementById('timelineMeta');
    if (meta) meta.textContent = `${doneCount} / ${db.schedule.length} done`;
    if (tl) {
      const now = minutesNow();
      let nextMarked = false;
      tl.innerHTML = db.schedule.map((s) => {
        const done = !!day.done[s.id];
        const isNow = !done && now >= parseHM(s.start) && now < parseHM(s.end);
        const isNext = !done && !isNow && !nextMarked && parseHM(s.start) > now;
        if (isNext) nextMarked = true;
        return `<div class="tl-item${done ? ' done' : ''}${isNow ? ' now' : ''}${isNext ? ' next' : ''}" data-type="${esc(s.type)}">
          <div class="tl-time"><b>${fmtTime(s.start)}</b>${fmtTime(s.end)}</div>
          <div class="tl-line"><span class="tl-dot"></span>
            <div style="min-width:0"><div class="tl-title">${esc(s.label)}</div></div>
          </div>
          <button class="tl-check" data-done="${esc(s.id)}" aria-label="${done ? 'Mark not done' : 'Mark done'}: ${esc(s.label)}" aria-pressed="${done}">
            ${LOS.icon('check')}
          </button>
        </div>`;
      }).join('');
    }

    /* habits */
    const habits = habitList(day, key);
    try { updateHabitStreaks(day, key); } catch (e) {}
    const doneHabits = habits.filter((h) => h.done).length;
    const hm = document.getElementById('habitMeta');
    if (hm) hm.textContent = `${doneHabits} / ${habits.length}`;
    const hw = document.getElementById('habits');
    if (hw) {
      hw.innerHTML = habits.map((h) => `<div class="habit${h.done ? ' done' : ''}">
        <button class="habit-check" data-habit="${esc(h.id)}" aria-pressed="${h.done}" aria-label="${esc(h.label)}"><svg class="ic"><use href="#i-check"/></svg></button>
        <div class="habit-copy"><b>${esc(h.label)}</b><span class="habit-sub">${esc(h.sub)}</span></div>
      </div>`).join('');
    }

    /* momentum */
    const chart = document.getElementById('momentum');
    if (chart) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const k = addDays(key, -i);
        days.push({ key: k, score: scoreFor(k), today: i === 0 });
      }
      chart.innerHTML = days.map((d) => {
        const pct = Math.max(3, Math.min(88, d.score * 0.9));
        const wd = fromKey(d.key).getDay();
        return `<div class="bar${d.today ? ' today' : ''}">
          <span class="bar-val">${d.score}</span>
          <i class="bar-fill" style="height:${pct}%"></i>
          <span class="bar-label">${WEEKDAYS_SHORT[wd].slice(0, 2)}</span>
        </div>`;
      }).join('');
    }

    /* weekly review */
    const wr = document.getElementById('weekReview');
    if (wr) {
      const days = [];
      for (let i = 6; i >= 0; i--) days.push(addDays(key, -i));
      const data = days.map((k) => LOS.dayData(k));
      const avgKcal = Math.round(data.reduce((n, d) => n + LOS.totalsFor(d).kcal, 0) / 7);
      const avgProtein = Math.round(data.reduce((n, d) => n + LOS.totalsFor(d).p, 0) / 7);
      const avgWater = (data.reduce((n, d) => n + LOS.totalsFor(d).water, 0) / 7).toFixed(1);
      const studyMin = data.reduce((n, d) => n + (d.studyMin || 0), 0);
      const workouts = data.reduce((n, d) => n + (d.workout ? 1 : 0), 0);
      const avgScore = Math.round(days.reduce((n, k) => n + scoreFor(k), 0) / 7);
      wr.innerHTML = [
        { label: 'Avg kcal', value: avgKcal, unit: 'kcal' },
        { label: 'Avg protein', value: avgProtein, unit: 'g' },
        { label: 'Avg water', value: avgWater, unit: 'L' },
        { label: 'Study', value: studyMin, unit: 'min' },
        { label: 'Workouts', value: workouts, unit: '/7' },
        { label: 'Avg score', value: avgScore, unit: '/100' }
      ].map((c) => `<div class=\"mini\"><span>${c.label}</span><b>${c.value}<em>${c.unit}</em></b></div>`).join('');
    }

    /* tip of the day */
    const tipText = document.getElementById('tipText');
    const tipTag = document.getElementById('tipTag');
    if (tipText) {
      const g = LOS.goalsFor();
      const tips = [
        { tag: 'Protein', text: `Hit ${g.protein}g protein today by anchoring every meal with a protein source first.` },
        { tag: 'Hydration', text: `Drink a glass of water before each meal — that's ${g.water.toFixed(1)}L across the day.` },
        { tag: 'Recovery', text: 'Sleep 7-9 hours; it drives muscle repair and next-day performance more than any supplement.' },
        { tag: 'Consistency', text: 'A 80% day beats a 0% day. Show up, log something, keep the streak alive.' },
        { tag: 'Study', text: 'Use 25-minute focus blocks with 5-minute breaks; four blocks beat one marathon session.' },
        { tag: 'Training', text: 'Progressive overload: add 2.5 kg or one rep when every set lands in the top of the range.' },
        { tag: 'Nutrition', text: 'Front-load protein at breakfast — it improves satiety and makes hitting your target easier.' },
        { tag: 'Mindset', text: 'Track the trend, not the day. Weekly averages matter more than any single weigh-in.' }
      ];
      const idx = new Date().getDate() % tips.length;
      const tip = tips[idx];
      tipText.textContent = tip.text;
      if (tipTag) tipTag.textContent = tip.tag;
    }

    renderTop();
  }
  LOS.renderHome = renderHome;
  LOS.pages.home = renderHome;

  /* home interaction */
  LOS.toggleBlock = function toggleBlock(id) {
    const day = dayData(todayKey());
    day.done[id] = !day.done[id];
    LOS.save();
    maybeStreak();
    renderHome();
    if (day.done[id]) {
      const item = db.schedule.find((s) => s.id === id);
      if (item) toast(`${item.label} â€” logged`, 'ok', 1800);
    }
  };
  LOS.toggleHabit = function toggleHabit(id) {
    const targets = { water: 'food', protein: 'food', study: 'study', workout: 'gym' };
    if (targets[id]) {
      LOS.go(targets[id]);
      toast(id === 'workout' ? 'Log today\'s session here' : `Update ${id} on this screen`, 'ok', 2000);
      return;
    }
    const day = dayData(todayKey());
    day.habits.sleep = !day.habits.sleep;
    LOS.save();
    maybeStreak();
    renderHome();
  };

  LOS.addWater = function addWater(ml) {
    const day = dayData(todayKey());
    day.water = Math.round((day.water + ml / 1000) * 1000) / 1000;
    LOS.save();
    maybeStreak();
    if (LOS.currentPage === 'food' && LOS.renderFood) LOS.renderFood();
    if (LOS.currentPage === 'home') renderHome();
    const g = goalsFor();
    toast(`Water ${ml > 0 ? '+' : ''}${ml} ml · ${day.water.toFixed(2)} / ${g.water.toFixed(1)} L`, 'ok', 1800);
    if (day.water >= g.water * 0.99) {
      celebrate('Hydration goal reached — great job!');
    }
  };

  /* apply persisted theme on load */
  applyTheme();
})();






