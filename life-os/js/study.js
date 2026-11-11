/* ============================================================
   LIFE OS — study: focus timer, queue, week chart
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  const MODES = {
    focus: { label: 'Focus', minutes: 25, hint: 'One task. No tabs.' },
    deep: { label: 'Deep work', minutes: 50, hint: 'Long block. Phone out of reach.' },
    break: { label: 'Break', minutes: 5, hint: 'Stand up, water, eyes off screen.' }
  };

  const MODE_KEYS = Object.keys(MODES);
  let mode = 'focus';
  let remaining = MODES.focus.minutes * 60;
  let elapsed = 0;
  let running = false;
  let built = false;
  let tickHandle = null;
  let lastTick = 0;

  const durationOf = (m) => MODES[m].minutes * 60;

  function todayMinutes() {
    return Math.round(Number(LOS.dayData(LOS.todayKey()).studyMin) || 0);
  }

  function addStudyMinutes(minutes) {
    const rounded = Math.round(minutes);
    if (rounded < 1) return 0;
    const key = LOS.todayKey();
    const day = LOS.dayData(key);
    day.studyMin = Math.round((Number(day.studyMin) || 0) + rounded);
    LOS.db.studyHistory[key] = Math.round((Number(LOS.db.studyHistory[key]) || 0) + rounded);
    LOS.save();
    LOS.maybeStreak();
    LOS.renderTop();
    return rounded;
  }

  /* ----------------------------------------------------------
     TIMER
     ---------------------------------------------------------- */
  function buildFocusCard() {
    const card = document.getElementById('focusCard');
    if (!card || built) return;
    built = true;
    card.innerHTML = `
      <div class="eyebrow">Deep work protocol</div>
      <div class="timer-wrap">
        <svg class="timer-ring" viewBox="0 0 206 206" aria-hidden="true">
          <circle class="ring-bg" cx="103" cy="103" r="85"/>
          <circle class="ring-fg" id="timerRing" cx="103" cy="103" r="85"/>
        </svg>
        <div class="timer-center">
          <span class="timer-text" id="timerText">25:00</span>
          <span class="timer-state" id="timerState">Ready</span>
        </div>
      </div>
      <div class="timer-modes" role="tablist" aria-label="Timer mode">
        ${MODE_KEYS.map((k) => `<button class="mode-btn${k === mode ? ' active' : ''}" data-mode="${k}" role="tab" aria-selected="${k === mode}">${MODES[k].label} ${MODES[k].minutes}</button>`).join('')}
      </div>
      <div class="timer-actions">
        <button class="btn primary" id="timerToggle">${icon('play')}<span id="timerToggleLabel">Start focus</span></button>
        <button class="btn" id="timerReset" aria-label="Reset timer">${icon('reset')}Reset</button>
      </div>
      <p class="fine" id="timerHint" style="margin-top:10px">${MODES.focus.hint}</p>
      <div class="timer-foot">
        <div><span>Logged today</span><b id="timerLogged">0 min</b></div>
        <div><span>Sessions</span><b id="timerSessions">0</b></div>
        <div><span>Next break</span><b id="timerBreak">—</b></div>
      </div>`;
    paint();
  }

  function paint() {
    const ring = document.getElementById('timerRing');
    const total = durationOf(mode);
    const frac = Math.max(0, Math.min(1, remaining / total));
    if (ring) ring.style.strokeDashoffset = String(534.1 * (1 - frac));
    const text = document.getElementById('timerText');
    if (text) text.textContent = LOS.fmtClock(remaining);
    const state = document.getElementById('timerState');
    if (state) {
      state.textContent = running
        ? (mode === 'break' ? 'Recovering' : 'In session')
        : remaining < total ? 'Paused' : 'Ready';
    }
    const toggle = document.getElementById('timerToggle');
    if (toggle) toggle.classList.toggle('primary', !running);
    const label = document.getElementById('timerToggleLabel');
    if (label) label.textContent = running ? 'Pause' : remaining < total ? 'Resume' : `Start ${MODES[mode].label.toLowerCase()}`;
    const toggleIcon = toggle && toggle.querySelector('use');
    if (toggleIcon) toggleIcon.setAttribute('href', running ? '#i-pause' : '#i-play');
    const logged = document.getElementById('timerLogged');
    if (logged) logged.textContent = `${todayMinutes()} min`;
    const sessions = document.getElementById('timerSessions');
    if (sessions) sessions.textContent = LOS.db.studySessions || 0;
    const nextBreak = document.getElementById('timerBreak');
    if (nextBreak) nextBreak.textContent = mode === 'break' ? 'Now' : `${MODES.break.minutes}:00`;
  }

  function startTick() {
    clearInterval(tickHandle);
    lastTick = Date.now();
    tickHandle = setInterval(() => {
      const now = Date.now();
      const delta = Math.round((now - lastTick) / 1000);
      if (delta < 1) return;
      lastTick += delta * 1000;
      remaining -= delta;
      elapsed += delta;
      if (remaining <= 0) {
        remaining = 0;
        paint();
        complete();
        return;
      }
      paint();
    }, 250);
  }

  function bankElapsed() {
    if (mode === 'break' || elapsed < 60) { elapsed = 0; return 0; }
    const minutes = Math.floor(elapsed / 60);
    elapsed -= minutes * 60;
    return addStudyMinutes(minutes);
  }

  function complete() {
    running = false;
    clearInterval(tickHandle);
    tickHandle = null;
    const total = durationOf(mode);
    elapsed = 0;
    LOS.chime(mode === 'break' ? [520, 660] : [660, 880, 1180]);
    if (mode === 'break') {
      LOS.toast('Break finished — back into it', 'ok', 2600);
    } else {
      const mins = addStudyMinutes(MODES[mode].minutes);
      LOS.db.studySessions = (Number(LOS.db.studySessions) || 0) + 1;
      LOS.save();
      LOS.toast(`${MODES[mode].label} complete · ${mins} min banked`, 'ok', 3200);
    }
    remaining = total;
    paint();
    renderStudyExtras();
  }

  function toggleTimer() {
    if (running) {
      running = false;
      clearInterval(tickHandle);
      tickHandle = null;
      const banked = bankElapsed();
      if (banked) LOS.toast(`Paused · ${banked} min logged`, 'ok', 1800);
      paint();
      renderStudyExtras();
      return;
    }
    running = true;
    startTick();
    LOS.chime([620]);
    paint();
  }

  function resetTimer() {
    const banked = bankElapsed();
    running = false;
    clearInterval(tickHandle);
    tickHandle = null;
    remaining = durationOf(mode);
    elapsed = 0;
    if (banked) LOS.toast(`Timer reset · ${banked} min logged`, 'ok', 1800);
    paint();
    renderStudyExtras();
  }

  function setMode(next) {
    if (!MODES[next] || next === mode) return;
    const banked = bankElapsed();
    running = false;
    clearInterval(tickHandle);
    tickHandle = null;
    mode = next;
    remaining = durationOf(mode);
    elapsed = 0;
    $$('.mode-btn').forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
    const hint = document.getElementById('timerHint');
    if (hint) hint.textContent = MODES[mode].hint;
    if (banked) LOS.toast(`${banked} min logged`, 'ok', 1600);
    paint();
  }

  /* ----------------------------------------------------------
     TASKS
     ---------------------------------------------------------- */
  function renderTasks() {
    const box = document.getElementById('tasks');
    const meta = document.getElementById('taskMeta');
    if (!box) return;
    const tasks = LOS.db.studyTasks;
    const open = tasks.filter((t) => !t.done).length;
    if (meta) meta.textContent = `${open} open · ${tasks.length - open} done`;
    if (!tasks.length) {
      box.innerHTML = `<div class="empty" style="padding:24px 12px">${icon('study')}<b>Queue is empty</b><p>Add the next concrete task — “read chapter 4”, not “study”.</p></div>`;
      return;
    }
    box.innerHTML = tasks.map((t) => `
      <div class="task${t.done ? ' done' : ''}">
        <button class="task-check" data-task-toggle="${esc(t.id)}" aria-pressed="${t.done}" aria-label="${t.done ? 'Reopen' : 'Complete'}: ${esc(t.text)}">${icon('check')}</button>
        <span class="task-text">${esc(t.text)}</span>
        <button class="task-del" data-task-del="${esc(t.id)}" aria-label="Delete task">${icon('close')}</button>
      </div>`).join('');
  }

  function addTask(text) {
    const clean = String(text || '').trim().slice(0, 120);
    if (!clean) return;
    LOS.db.studyTasks.push({ id: LOS.uid(), text: clean, done: false });
    LOS.save();
    renderTasks();
    LOS.toast('Task added', 'ok', 1500);
  }

  /* ----------------------------------------------------------
     CHART + STATS
     ---------------------------------------------------------- */
  function renderStudyChart() {
    const chart = document.getElementById('studyChart');
    if (!chart) return;
    const key = LOS.todayKey();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const k = LOS.addDays(key, -i);
      const mins = Number(LOS.db.studyHistory[k]) || (k === key ? Number(LOS.dayData(k).studyMin) || 0 : 0);
      days.push({ key: k, mins, today: i === 0 });
    }
    const max = Math.max(60, ...days.map((d) => d.mins));
    chart.innerHTML = days.map((d) => {
      const pct = Math.max(3, Math.min(92, (d.mins / max) * 100));
      const wd = LOS.fromKey(d.key).getDay();
      return `<div class="bar${d.today ? ' today' : ''}" title="${LOS.dateLabel(d.key)} · ${d.mins} min">
        <span class="bar-val">${d.mins}</span>
        <i class="bar-fill" style="height:${pct}%"></i>
        <span class="bar-label">${LOS.WEEKDAYS_SHORT[wd].slice(0, 2)}</span>
      </div>`;
    }).join('');
  }

  function renderStudyStats() {
    const box = document.getElementById('studyStats');
    if (!box) return;
    const hist = LOS.db.studyHistory || {};
    const entries = Object.entries(hist);
    const total = entries.reduce((n, [, v]) => n + (Number(v) || 0), 0);
    const days = entries.filter(([, v]) => Number(v) > 0).length;
    const best = entries.reduce((m, [k, v]) => (Number(v) > Number(m[1] || 0) ? [k, v] : m), ['—', 0]);
    const avg = days ? Math.round(total / days) : 0;
    const today = todayMinutes();
    box.innerHTML = `
      <div class="mini"><span>Today</span><b>${today}<em>min</em></b></div>
      <div class="mini"><span>All time</span><b>${total}<em>min</em></b></div>
      <div class="mini"><span>Sessions</span><b>${LOS.db.studySessions || 0}</b></div>
      <div class="mini"><span>Avg / active day</span><b>${avg}<em>min</em></b></div>
      <div class="mini"><span>Best day</span><b>${Math.round(Number(best[1]) || 0)}<em>min</em></b></div>
      <div class="mini"><span>Active days</span><b>${days}</b></div>`;
  }

  function renderStudyExtras() {
    renderTasks();
    renderStudyChart();
    renderStudyStats();
    paint();
  }

  function renderStudy() {
    buildFocusCard();
    paint();
    renderStudyExtras();
  }
  LOS.renderStudy = renderStudy;
  LOS.pages.study = renderStudy;

  /* ----------------------------------------------------------
     WIRING
     ---------------------------------------------------------- */
  const form = document.getElementById('taskForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('taskInput');
      if (!input) return;
      addTask(input.value);
      input.value = '';
      input.focus();
    });
  }

  document.addEventListener('click', (e) => {
    const modeBtn = e.target.closest('[data-mode]');
    if (modeBtn) { setMode(modeBtn.dataset.mode); return; }

    if (e.target.closest('#timerToggle')) { toggleTimer(); return; }
    if (e.target.closest('#timerReset')) { resetTimer(); return; }

    const toggle = e.target.closest('[data-task-toggle]');
    if (toggle) {
      const task = LOS.db.studyTasks.find((t) => t.id === toggle.dataset.taskToggle);
      if (!task) return;
      task.done = !task.done;
      LOS.save();
      renderTasks();
      if (task.done) {
        LOS.chime([780]);
        if (LOS.db.studyTasks.every((t) => t.done)) LOS.toast('Queue cleared — nice work', 'ok', 2400);
      }
      return;
    }

    const del = e.target.closest('[data-task-del]');
    if (del) {
      LOS.db.studyTasks = LOS.db.studyTasks.filter((t) => t.id !== del.dataset.taskDel);
      LOS.save();
      renderTasks();
      return;
    }

    if (e.target.closest('#studyJump')) {
      const day = LOS.dayData(LOS.todayKey());
      const now = LOS.minutesNow();
      const block = LOS.db.schedule.find((s) => s.type === 'study' && !day.done[s.id] && LOS.parseHM(s.end) > now)
        || LOS.db.schedule.find((s) => s.type === 'study' && !day.done[s.id]);
      if (!block) { LOS.toast('No study blocks left today — add a focus session instead', 'warn'); return; }
      const offset = LOS.parseHM(block.start) - now;
      const when = offset > 0 ? `starts in ${offset} min` : 'in progress';
      LOS.toast(`${block.label} · ${when}`, 'ok', 2800);
      if (offset <= 0 && !running) {
        setMode(LOS.parseHM(block.end) - LOS.parseHM(block.start) >= 40 ? 'deep' : 'focus');
        setTimeout(toggleTimer, 120);
      }
      const card = document.getElementById('focusCard');
      if (card) card.scrollIntoView({ behavior: LOS.db.prefs.motion === false ? 'auto' : 'smooth', block: 'center' });
      return;
    }
  });

  /* keep the ring honest if the tab was backgrounded */
  document.addEventListener('visibilitychange', () => {
    if (!running) return;
    if (document.hidden) return;
    const now = Date.now();
    const delta = Math.round((now - lastTick) / 1000);
    if (delta > 1) {
      remaining = Math.max(0, remaining - delta);
      elapsed += delta;
      lastTick = now;
      if (remaining <= 0) complete(); else paint();
    }
  });
})();
