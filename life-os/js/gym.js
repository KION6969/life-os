/* ============================================================
   LIFE OS — gym: split, plan, live workout, history
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  /* ----------------------------------------------------------
     PLAN
     ---------------------------------------------------------- */
  const SPLIT = [
    {
      id: 'mon', short: 'Mon', name: 'Push', tag: 'Chest · Shoulders · Triceps',
      focus: 'Heavy pressing, controlled tempo. Add 2.5 kg when every set lands in the top of the rep range.',
      exercises: [
        { name: 'Barbell bench press', sets: 4, reps: '6–8', rest: 150, note: 'Shoulder blades tucked, bar to lower chest. Leave one rep in reserve on the first set.' },
        { name: 'Incline dumbbell press', sets: 3, reps: '8–10', rest: 120, note: '30° incline. Stretch at the bottom, squeeze hard at the top.' },
        { name: 'Seated overhead press', sets: 3, reps: '8–10', rest: 120, note: 'Brace the core, don’t flare the ribs. Press slightly in front of the ear.' },
        { name: 'Cable lateral raise', sets: 3, reps: '12–15', rest: 60, note: 'Lead with the elbow, pause at shoulder height. Keep the cable behind your body.' },
        { name: 'Rope triceps pushdown', sets: 3, reps: '10–12', rest: 60, note: 'Elbows pinned. Spread the rope at the bottom and hold for a beat.' },
        { name: 'Overhead cable extension', sets: 3, reps: '12–15', rest: 60, note: 'Deep stretch behind the head — this is the growth driver for the long head.' }
      ]
    },
    {
      id: 'tue', short: 'Tue', name: 'Pull', tag: 'Back · Biceps · Rear delts',
      focus: 'Pull with the elbows, not the hands. Every rep starts by setting the shoulder blade.',
      exercises: [
        { name: 'Weighted pull-up', sets: 4, reps: '5–8', rest: 180, note: 'Full hang to chin over bar. If bodyweight is easy, add 5 kg.' },
        { name: 'Chest-supported row', sets: 4, reps: '8–10', rest: 120, note: 'Drive elbows to the hips. No torso English.' },
        { name: 'Half-kneeling lat pulldown', sets: 3, reps: '10–12', rest: 90, note: 'Single-arm. Let the lat stretch fully before each pull.' },
        { name: 'Face pull', sets: 3, reps: '15–20', rest: 60, note: 'Rope at eye level, pull to the forehead, thumbs back. Rear delts + external rotators.' },
        { name: 'Incline dumbbell curl', sets: 3, reps: '10–12', rest: 75, note: 'Arms hang behind the body for a full biceps stretch.' },
        { name: 'Hammer curl', sets: 3, reps: '12–15', rest: 60, note: 'Neutral grip, no swing. Last set can be a drop set.' }
      ]
    },
    {
      id: 'wed', short: 'Wed', name: 'Legs', tag: 'Quads · Hamstrings · Calves',
      focus: 'Depth and control beat load. If your lower back takes over, the set is over.',
      exercises: [
        { name: 'Back squat', sets: 4, reps: '6–8', rest: 180, note: 'Brace, break at the hips and knees together, drive through mid-foot.' },
        { name: 'Romanian deadlift', sets: 3, reps: '8–10', rest: 150, note: 'Hips back, bar shaving the thighs, stop where the hamstring stretch peaks.' },
        { name: 'Leg press', sets: 3, reps: '10–12', rest: 120, note: 'Feet mid-platform. Full range without the pelvis tucking under.' },
        { name: 'Leg curl', sets: 3, reps: '12–15', rest: 75, note: 'Slow 3-second lower. Point the toes up to bias the hamstrings.' },
        { name: 'Standing calf raise', sets: 4, reps: '12–15', rest: 60, note: 'Pause 1 second at the bottom stretch and 1 second at the top.' },
        { name: 'Hanging leg raise', sets: 3, reps: '10–15', rest: 60, note: 'Curl the pelvis, don’t just swing the legs.' }
      ]
    },
    {
      id: 'thu', short: 'Thu', name: 'Upper', tag: 'Push + pull volume',
      focus: 'Volume day. Keep 2 reps in reserve and chase quality contractions over numbers.',
      exercises: [
        { name: 'Incline barbell press', sets: 4, reps: '8–10', rest: 150, note: 'Slightly narrower grip. Touch the upper chest, not the collarbone.' },
        { name: 'Single-arm cable row', sets: 4, reps: '10–12', rest: 90, note: 'Let the shoulder travel forward, then pull past the ribs.' },
        { name: 'Machine chest press', sets: 3, reps: '10–12', rest: 90, note: 'Constant tension — stop just short of lockout.' },
        { name: 'Wide-grip pulldown', sets: 3, reps: '10–12', rest: 90, note: 'Slight lean back, drive elbows down and in.' },
        { name: 'Dumbbell lateral raise', sets: 3, reps: '12–15', rest: 60, note: 'Light, strict, tiny pause at the top. No momentum.' },
        { name: 'Cable curl + pushdown superset', sets: 3, reps: '12–15', rest: 60, note: 'Alternate arms. Pump-focused finisher.' }
      ]
    },
    {
      id: 'fri', short: 'Fri', name: 'Lower', tag: 'Posterior chain · Core',
      focus: 'Hinge-focused session. Grip and trunk stability are the limiters — train them.',
      exercises: [
        { name: 'Trap-bar deadlift', sets: 4, reps: '5–6', rest: 210, note: 'Neutral spine, push the floor away. Reset every rep.' },
        { name: 'Bulgarian split squat', sets: 3, reps: '8–10 / leg', rest: 120, note: 'Front shin vertical for quads, torso leaned for glutes.' },
        { name: 'Hip thrust', sets: 3, reps: '10–12', rest: 90, note: 'Chin tucked, ribs down, squeeze at the top for a full second.' },
        { name: 'Seated leg curl', sets: 3, reps: '12–15', rest: 75, note: 'Control the eccentric. Slow negatives are the point.' },
        { name: 'Farmer carry', sets: 3, reps: '40 m', rest: 90, note: 'Tall posture, no leaning. Walk heavy and quiet.' },
        { name: 'Ab wheel rollout', sets: 3, reps: '8–12', rest: 60, note: 'Ribs down, don’t let the lower back arch. Knee version is fine.' }
      ]
    },
    {
      id: 'sat', short: 'Sat', name: 'Conditioning', tag: 'Zone 2 + mobility',
      focus: 'Low intensity, high consistency. Keep the heart rate conversational and the joints happy.',
      exercises: [
        { name: 'Incline treadmill walk', sets: 1, reps: '35–45 min', rest: 0, note: '10–12% incline at 4.5–5.5 km/h. Nose breathing only.' },
        { name: 'Hip flexor stretch', sets: 2, reps: '45 s / side', rest: 0, note: 'Rear foot elevated, tuck the pelvis before leaning forward.' },
        { name: 'Thoracic open book', sets: 2, reps: '8 / side', rest: 0, note: 'Exhale into the rotation. Follow the hand with the eyes.' },
        { name: 'Deep squat hold', sets: 3, reps: '45 s', rest: 30, note: 'Hold a light plate as a counterweight if the ankles are tight.' },
        { name: 'Couch stretch', sets: 2, reps: '60 s / side', rest: 0, note: 'Squeeze the glute of the working side to protect the knee.' }
      ]
    },
    {
      id: 'sun', short: 'Sun', name: 'Recovery', tag: 'Rest · Walk · Reset',
      focus: 'No training debt today. Walk, eat protein, sleep early and let the adaptation happen.',
      exercises: [
        { name: 'Easy walk', sets: 1, reps: '30–60 min', rest: 0, note: 'Outdoors if possible. Morning light anchors the circadian rhythm.' },
        { name: 'Full-body foam roll', sets: 1, reps: '8–10 min', rest: 0, note: 'Quads, adductors, lats, upper back. Breathe, don’t brace.' },
        { name: 'Box breathing', sets: 1, reps: '5 min', rest: 0, note: 'In 4, hold 4, out 4, hold 4. Down-regulate before the week starts.' },
        { name: 'Meal prep', sets: 1, reps: '45 min', rest: 0, note: 'Protein anchor + two carb sources. Future you says thanks.' }
      ]
    }
  ];
  LOS.GYM_SPLIT = SPLIT;

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const todayId = () => SPLIT[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id;
  const dayFor = (id) => SPLIT.find((s) => s.id === id) || SPLIT[0];
  const planOf = (id) => {
    const base = SPLIT.find((s) => s.id === id) || SPLIT[0];
    const custom = LOS.db.gymPlans && LOS.db.gymPlans[base.id];
    return custom ? { ...base, exercises: custom.map((e) => ({ ...e })) } : base;
  };
  const totalSets = (plan) => plan.exercises.reduce((n, e) => n + (Number(e.sets) || 0), 0);
  const estMinutes = (plan) => plan.exercises.reduce((n, e) => n + (Number(e.sets) || 0) * ((Number(e.rest) || 0) + 40) / 60, 0);

  const equipOf = (name) => {
    const n = String(name).toLowerCase();
    if (n.includes('dumbbell') || n.includes('db ')) return 'dumbbell';
    if (n.includes('barbell') || n.includes('squat') || n.includes('deadlift') || n.includes('bench press')) return 'barbell';
    if (n.includes('cable') || n.includes('machine') || n.includes('leg press') || n.includes('pulldown') || n.includes('pushdown')) return 'gym';
    if (n.includes('pull-up') || n.includes('push-up') || n.includes('bodyweight') || n.includes('plank') || n.includes('raise') === false) return 'bodyweight';
    return 'bodyweight';
  };

  const filteredExercises = (plan) => {
    if (equipFilter === 'all') return plan.exercises;
    if (equipFilter === 'dumbbell') return plan.exercises.filter((e) => equipOf(e.name) === 'dumbbell');
    if (equipFilter === 'bodyweight') return plan.exercises.filter((e) => equipOf(e.name) === 'bodyweight');
    if (equipFilter === 'gym') return plan.exercises.filter((e) => equipOf(e.name) !== 'bodyweight' && equipOf(e.name) !== 'dumbbell');
    return plan.exercises;
  };

  let selected = (LOS.db.prefs.gymDay && SPLIT.some((s) => s.id === LOS.db.prefs.gymDay))
    ? LOS.db.prefs.gymDay
    : todayId();
  let openExercise = 0;
  let equipFilter = (LOS.db.prefs.gymEquip) || 'all';

  let session = null;
  let tickHandle = null;
  let restHandle = null;

  function loggedToday() {
    const day = LOS.dayData(LOS.todayKey());
    return day.workout || null;
  }

  /* ----------------------------------------------------------
     RENDER
     ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     GYM PLAN EDITOR
     ---------------------------------------------------------- */
  function currentExercises() {
    const plan = planOf(selected);
    return (plan.exercises || []).map((e) => ({ ...e }));
  }
  function persistExercises(list) {
    if (!LOS.db.gymPlans) LOS.db.gymPlans = {};
    LOS.db.gymPlans[selected] = list.map((e) => ({ ...e }));
    LOS.save();
  }
  function resetGymExForm() {
    const f = document.getElementById('gymExForm');
    if (!f) return;
    f.reset();
    f.elements.idx.value = '';
    const cancel = document.getElementById('gymCancelEdit');
    if (cancel) cancel.hidden = true;
    const label = document.getElementById('gymExSubmit');
    if (label) label.textContent = 'Add exercise';
    const title = document.getElementById('gymEditTitle');
    if (title) title.textContent = `${planOf(selected).name} plan`;
  }
  function renderGymExList() {
    const box = document.getElementById('gymExList');
    if (!box) return;
    const list = currentExercises();
    if (!list.length) {
      box.innerHTML = `<div class="empty" style="padding:18px 12px"><b>No exercises</b><p>Add one above.</p></div>`;
      return;
    }
    box.innerHTML = list.map((ex, i) => `
      <div class="sched-row" data-gymex="${i}">
        <span class="sched-time">${ex.sets}×<em>${ex.rest ? ex.rest + 's' : '—'}</em></span>
        <span class="sched-copy"><b>${esc(ex.name)}</b><small>${esc(ex.reps)}${ex.note ? ' · ' + esc(ex.note) : ''}</small></span>
        <button class="icon-btn" data-edit-gymex="${i}" aria-label="Edit">${icon('chevron')}</button>
        <button class="icon-btn danger-ghost" data-del-gymex="${i}" aria-label="Delete">${icon('trash')}</button>
      </div>`).join('');
  }
  function openGymEdit() {
    renderGymExList();
    resetGymExForm();
    LOS.openModal('gymEditModal');
  }
  function editGymEx(idx) {
    const list = currentExercises();
    const ex = list[idx];
    if (!ex) return;
    const f = document.getElementById('gymExForm');
    if (!f) return;
    f.elements.idx.value = idx;
    f.elements.name.value = ex.name;
    f.elements.sets.value = ex.sets;
    f.elements.reps.value = ex.reps;
    f.elements.rest.value = ex.rest;
    f.elements.note.value = ex.note || '';
    const cancel = document.getElementById('gymCancelEdit');
    if (cancel) cancel.hidden = false;
    const label = document.getElementById('gymExSubmit');
    if (label) label.textContent = 'Save changes';
    f.elements.name.focus();
  }
  function saveGymEx(e) {
    e.preventDefault();
    const f = document.getElementById('gymExForm');
    if (!f) return;
    const data = {
      idx: f.elements.idx.value,
      name: String(f.elements.name.value || '').trim().slice(0, 60),
      sets: Math.min(10, Math.max(1, Number(f.elements.sets.value) || 3)),
      reps: String(f.elements.reps.value || '').trim().slice(0, 12),
      rest: Math.min(600, Math.max(0, Number(f.elements.rest.value) || 0)),
      note: String(f.elements.note.value || '').trim().slice(0, 160)
    };
    if (!data.name) { LOS.toast('Give the exercise a name', 'warn'); return; }
    if (!data.reps) { LOS.toast('Set a rep range', 'warn'); return; }
    const list = currentExercises();
    if (data.idx !== '') {
      const i = Number(data.idx);
      if (list[i]) {
        list[i].name = data.name;
        list[i].sets = data.sets;
        list[i].reps = data.reps;
        list[i].rest = data.rest;
        list[i].note = data.note;
      }
      LOS.toast(`Saved ${data.name}`, 'ok', 1800);
    } else {
      list.push({ name: data.name, sets: data.sets, reps: data.reps, rest: data.rest, note: data.note });
      LOS.toast(`Added ${data.name}`, 'ok', 2000);
    }
    persistExercises(list);
    renderGymExList();
    resetGymExForm();
    renderGym();
  }
  function deleteGymEx(idx) {
    const list = currentExercises();
    const ex = list[idx];
    if (!ex) return;
    LOS.confirmAction('Delete this exercise?', `"${ex.name}" will be removed from this day's plan.`, 'Delete', () => {
      list.splice(idx, 1);
      persistExercises(list);
      renderGymExList();
      resetGymExForm();
      renderGym();
      LOS.toast(`${ex.name} removed`, 'warn', 2000);
    });
  }
  function resetGymDay() {
    LOS.confirmAction('Reset this day?', 'Your custom exercises will be replaced by the built-in plan.', 'Reset', () => {
      if (LOS.db.gymPlans) delete LOS.db.gymPlans[selected];
      LOS.save();
      renderGymExList();
      resetGymExForm();
      renderGym();
      LOS.toast('Day reset to default', 'ok', 2200);
    });
  }

  function renderGym() {
    const plan = planOf(selected);
    const done = loggedToday();
    const filtered = filteredExercises(plan);
    const viewPlan = filtered.length ? { ...plan, exercises: filtered } : plan;

    const tabs = document.getElementById('gymTabs');
    if (tabs) {
      tabs.innerHTML = SPLIT.map((s) => {
        const isToday = s.id === todayId();
        return `<button class="day-tab${s.id === selected ? ' active' : ''}${isToday ? ' today' : ''}" data-gym-day="${s.id}" role="tab" aria-selected="${s.id === selected}">
          <span>${s.short}</span><b>${s.name}</b>
        </button>`;
      }).join('');
    }

    const hero = document.getElementById('workoutHero');
    if (hero) {
      const sets = totalSets(viewPlan);
      const mins = Math.round(estMinutes(viewPlan));
      const complete = done && selected === todayId();
      hero.innerHTML = `
        <div>
          <span class="plan-tag">${icon('bolt')}${esc(viewPlan.tag)}</span>
          <div class="plan-title">${esc(viewPlan.name)}</div>
          <p class="plan-meta">${esc(viewPlan.focus)}</p>
          <div class="hero-metrics">
            <div><span>Exercises</span><b>${viewPlan.exercises.length}</b></div>
            <div><span>Working sets</span><b>${sets}</b></div>
            <div><span>Est. time</span><b>${mins}<em>min</em></b></div>
            <div><span>Rest avg</span><b>${Math.round(viewPlan.exercises.reduce((n, e) => n + e.rest, 0) / viewPlan.exercises.length)}<em>s</em></b></div>
          </div>
        </div>
        <div class="wo-hero-actions">
          ${complete
            ? `<span class="done-flag">${icon('check')}Logged today</span>
               <button class="btn" data-gym-start="${plan.id}">${icon('reset')}Train again</button>`
            : `<button class="btn primary" data-gym-start="${plan.id}">${icon('play')}Start session</button>`}
          <button class="btn" data-gym-day-jump="${plan.id}">${icon('calendar')}${plan.short} plan</button>
        </div>`;
    }

    const exCount = document.getElementById('exCount');
    if (exCount) exCount.textContent = `${viewPlan.exercises.length} movements · ${totalSets(viewPlan)} sets`;

    const list = document.getElementById('exercises');
    if (list) {
      list.innerHTML = viewPlan.exercises.map((ex, i) => {
        const open = i === openExercise;
        return `<div class="exercise${open ? ' open' : ''}">
          <button class="ex-head" data-ex="${i}" aria-expanded="${open}">
            <span class="ex-index">${String(i + 1).padStart(2, '0')}</span>
            <span class="ex-name">${esc(ex.name)}</span>
            <span class="ex-meta">${ex.sets} × ${esc(ex.reps)} · ${ex.rest ? ex.rest + 's' : '—'}</span>
            <span class="ex-chev">${icon('chevron')}</span>
          </button>
          <div class="ex-body">
            <p class="ex-note">${esc(ex.note)}</p>
            <div class="set-preview">${Array.from({ length: Math.min(8, ex.sets) }, (_, s) => `<span class="set-pill">Set ${s + 1}</span>`).join('')}</div>
          </div>
        </div>`;
      }).join('');
    }

    renderGymStats();
    renderGymHistory();
  }
  LOS.renderGym = renderGym;
  LOS.pages.gym = renderGym;

  function renderGymStats() {
    const box = document.getElementById('gymStats');
    if (!box) return;
    const today = LOS.todayKey();
    const weekStart = LOS.addDays(today, -6);
    const week = LOS.db.gymHistory.filter((h) => h.date >= weekStart && h.date <= today);
    const sets = week.reduce((n, h) => n + (Number(h.sets) || 0), 0);
    const minutes = week.reduce((n, h) => n + (Number(h.minutes) || 0), 0);
    const weekStreak = (() => {
      let n = 0;
      for (let i = 0; i < 7; i++) {
        const k = LOS.addDays(today, -i);
        if (LOS.db.gymHistory.some((h) => h.date === k)) n++;
        else if (i > 0) break;
      }
      return n;
    })();
    box.innerHTML = `
      <div class="mini"><span>Sessions</span><b>${week.length}<em>/ 7d</em></b></div>
      <div class="mini"><span>Working sets</span><b>${sets}</b></div>
      <div class="mini"><span>Minutes</span><b>${minutes}</b></div>
      <div class="mini"><span>Day streak</span><b>${weekStreak}</b></div>
      <div class="mini"><span>Avg session</span><b>${week.length ? Math.round(minutes / week.length) : 0}<em>min</em></b></div>
      <div class="mini"><span>All time</span><b>${LOS.db.gymHistory.length}<em>sessions</em></b></div>`;
  }

  function renderGymHistory() {
    const box = document.getElementById('gymHistory');
    if (!box) return;
    const items = LOS.db.gymHistory.slice(-5).reverse();
    if (!items.length) {
      box.innerHTML = `<div class="empty" style="padding:22px 12px">${icon('gym')}<b>No sessions yet</b><p>Run your first workout and it will land here with sets, time and date.</p></div>`;
      return;
    }
    box.innerHTML = items.map((h) => `
      <div class="hist-item">
        <div class="hist-main"><b>${esc(h.title)}</b><span>${esc(h.date)} · ${h.sets} sets</span></div>
        <span class="hist-meta">${h.minutes} min</span>
      </div>`).join('');
  }

  /* ----------------------------------------------------------
     LIVE SESSION
     ---------------------------------------------------------- */
  function startSession(id) {
    const base = planOf(id);
    const filtered = filteredExercises(base);
    const plan = filtered.length ? { ...base, exercises: filtered } : base;
    const done = loggedToday();
    if (done) {
      LOS.confirmAction('Session already logged', `You already logged "${done.title}" today. Start another session anyway?`, 'Start again', () => openSession(plan));
      return;
    }
    openSession(plan);
  }

  function openSession(plan) {
    session = {
      plan,
      startedAt: Date.now(),
      sets: {},
      restEnd: 0
    };
    const overlay = document.getElementById('workoutOverlay');
    if (overlay) overlay.hidden = false;
    document.body.classList.add('lock');
    const title = document.getElementById('woTitle');
    if (title) title.textContent = plan.name + ' session';
    const eyebrow = document.getElementById('woEyebrow');
    if (eyebrow) eyebrow.textContent = plan.tag;
    renderSessionBody();
    updateSessionChrome();
    clearInterval(tickHandle);
    tickHandle = setInterval(updateSessionChrome, 1000);
    LOS.chime([520, 700]);
  }

  function renderSessionBody() {
    const body = document.getElementById('woBody');
    if (!body || !session) return;
    body.innerHTML = session.plan.exercises.map((ex, i) => {
      const logged = session.sets[i] || [];
      const complete = logged.filter(Boolean).length >= ex.sets;
      return `<div class="wo-ex${complete ? ' complete' : ''}">
        <div class="wo-ex-head">
          <b>${esc(ex.name)}</b>
          <span>${ex.sets} × ${esc(ex.reps)} · rest ${ex.rest || 0}s</span>
        </div>
        <div class="wo-sets">
          ${Array.from({ length: ex.sets }, (_, s) => `<button class="set-btn${logged[s] ? ' done' : ''}" data-set="${i}-${s}" aria-pressed="${!!logged[s]}" aria-label="Toggle set ${s + 1} of ${esc(ex.name)}">${s + 1}</button>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function loggedSetCount() {
    if (!session) return 0;
    return Object.values(session.sets).reduce((n, arr) => n + arr.filter(Boolean).length, 0);
  }

  function updateSessionChrome() {
    if (!session) return;
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const timer = document.getElementById('woTimer');
    if (timer) timer.textContent = LOS.fmtClock(elapsed);
    const total = totalSets(session.plan);
    const logged = loggedSetCount();
    const setsEl = document.getElementById('woSets');
    if (setsEl) setsEl.textContent = `${logged} / ${total} sets logged`;
    const progress = document.getElementById('woProgress');
    if (progress) progress.style.width = `${Math.min(100, (logged / Math.max(1, total)) * 100)}%`;

    if (session.restEnd) {
      const left = Math.max(0, Math.ceil((session.restEnd - Date.now()) / 1000));
      const restEl = document.getElementById('woRest');
      if (restEl) restEl.textContent = LOS.fmtClock(left);
      if (left <= 0) {
        session.restEnd = 0;
        clearInterval(restHandle);
        restHandle = null;
        const btn = document.getElementById('woRestBtn');
        if (btn) btn.textContent = 'Start 60s';
        LOS.chime([880, 660, 880]);
        LOS.toast('Rest over — next set', 'ok', 1800);
      }
    }
  }

  function toggleSet(i, s) {
    if (!session) return;
    const arr = session.sets[i] || (session.sets[i] = []);
    arr[s] = !arr[s];
    const ex = session.plan.exercises[i];
    const complete = arr.filter(Boolean).length >= ex.sets;
    renderSessionBody();
    updateSessionChrome();
    if (arr[s]) {
      LOS.chime([760]);
      if (complete) LOS.toast(`${ex.name} — all sets done`, 'ok', 1800);
      if (ex.rest) startRest(ex.rest);
    } else {
      clearInterval(restHandle);
      restHandle = null;
      session.restEnd = 0;
      const restEl = document.getElementById('woRest');
      if (restEl) restEl.textContent = '—';
    }
  }

  function startRest(seconds) {
    if (!session) return;
    session.restEnd = Date.now() + seconds * 1000;
    const btn = document.getElementById('woRestBtn');
    if (btn) btn.textContent = 'Restart';
    clearInterval(restHandle);
    restHandle = setInterval(updateSessionChrome, 500);
    updateSessionChrome();
  }

  function closeSession(force) {
    if (!session) return;
    if (!force && loggedSetCount() > 0) {
      LOS.confirmAction('Discard session?', 'You have logged sets that are not saved yet. Close and lose them?', 'Discard', () => teardown());
      return;
    }
    teardown();
  }

  function teardown() {
    const overlay = document.getElementById('workoutOverlay');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('lock');
    clearInterval(tickHandle);
    clearInterval(restHandle);
    tickHandle = null;
    restHandle = null;
    session = null;
  }

  function finishSession() {
    if (!session) return;
    const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const sets = loggedSetCount();
    if (!sets) {
      LOS.toast('Log at least one set before finishing', 'warn');
      return;
    }
    const plan = session.plan;
    const key = LOS.todayKey();
    const day = LOS.dayData(key);
    const entry = {
      id: LOS.uid(),
      date: key,
      title: plan.name,
      sets,
      minutes: elapsed,
      at: new Date().toISOString()
    };
    day.workout = entry;
    LOS.db.gymHistory.push(entry);
    if (LOS.db.gymHistory.length > 300) LOS.db.gymHistory = LOS.db.gymHistory.slice(-300);
    LOS.save();
    LOS.maybeStreak();
    teardown();
    renderGym();
    LOS.renderTop();
    LOS.chime([660, 880, 1180]);
    LOS.toast(`${plan.name} saved · ${sets} sets · ${elapsed} min`, 'ok', 3200);
  }

  /* ----------------------------------------------------------
     WIRING
     ---------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-gym-day]');
    if (tab) {
      selected = tab.dataset.gymDay;
      openExercise = 0;
      LOS.db.prefs.gymDay = selected;
      LOS.save();
      renderGym();
      return;
    }

    const exBtn = e.target.closest('[data-ex]');
    if (exBtn) {
      const i = Number(exBtn.dataset.ex);
      openExercise = openExercise === i ? -1 : i;
      renderGym();
      return;
    }

    const start = e.target.closest('[data-gym-start]');
    if (start) { startSession(start.dataset.gymStart); return; }

    const jump = e.target.closest('[data-gym-day-jump]');
    if (jump) { selected = jump.dataset.gymDayJump; renderGym(); return; }

    if (e.target.closest('#startWorkoutTop')) { startSession(selected); return; }

    if (e.target.closest('#editGymPlan')) { openGymEdit(); return; }

    const editEx = e.target.closest('[data-edit-gymex]');
    if (editEx) { editGymEx(Number(editEx.dataset.editGymex)); return; }

    const delEx = e.target.closest('[data-del-gymex]');
    if (delEx) { deleteGymEx(Number(delEx.dataset.delGymex)); return; }

    const setBtn = e.target.closest('[data-set]');
    if (setBtn) {
      const [i, s] = setBtn.dataset.set.split('-').map(Number);
      toggleSet(i, s);
      return;
    }

    if (e.target.closest('#woRestBtn')) { startRest(60); return; }
    if (e.target.closest('#woFinish')) { finishSession(); return; }
    if (e.target.closest('#woClose')) { closeSession(false); return; }
  });

  const gymExForm = document.getElementById('gymExForm');
  if (gymExForm) gymExForm.addEventListener('submit', saveGymEx);

  const gymCancelEdit = document.getElementById('gymCancelEdit');
  if (gymCancelEdit) gymCancelEdit.addEventListener('click', resetGymExForm);

  const gymResetDay = document.getElementById('gymResetDay');
  if (gymResetDay) gymResetDay.addEventListener('click', resetGymDay);
  const equipSel = document.getElementById('gymEquip');
  if (equipSel) {
    equipSel.value = equipFilter;
    equipSel.addEventListener('change', () => {
      equipFilter = equipSel.value;
      LOS.db.prefs.gymEquip = equipFilter;
      LOS.save();
      openExercise = 0;
      renderGym();
    });
  }

  window.addEventListener('beforeunload', (e) => {
    if (session && loggedSetCount() > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
