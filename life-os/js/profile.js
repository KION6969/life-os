/* ============================================================
   LIFE OS â€” profile: identity, energy model, prefs, data
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  const GOAL_LABELS = { cut: 'Cut', recomp: 'Recomp', maintain: 'Maintain', bulk: 'Bulk' };
  const GOAL_NOTES = {
    cut: 'A 500 kcal deficit (~0.45 kg fat/week). Protein 2.2 g/kg to preserve muscle (ACSM/ISSN).',
    recomp: 'A small 250 kcal deficit with high protein (2.0 g/kg) + resistance training (body recomposition research).',
    maintain: 'Eat at maintenance. Performance and recovery first.',
    bulk: 'A 300 kcal surplus (lean bulk, ~0.25-0.5 kg/wk). Protein 1.8 g/kg (ISSN bodybuilding review).'
  };

  /* ----------------------------------------------------------
     FORM <-> DATA
     ---------------------------------------------------------- */
  function fillForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    const p = LOS.db.profile;
    const f = form.elements;
    if (f.name && document.activeElement !== f.name) f.name.value = p.name || '';
    if (f.age && document.activeElement !== f.age) f.age.value = p.age;
    if (f.sex) f.sex.value = p.sex === 'female' ? 'female' : 'male';
    if (f.height && document.activeElement !== f.height) f.height.value = p.height;
    if (f.weight && document.activeElement !== f.weight) f.weight.value = p.weight;
    if (f.activity) f.activity.value = String(p.activity || 1.55);
    if (f.goal) f.goal.value = p.goal || 'recomp';
    if (f.diet) f.diet.value = p.diet || 'omnivore';
    if (f.cuisine) f.cuisine.value = p.cuisine || 'any';
    if (f.proteinPerKg && document.activeElement !== f.proteinPerKg) f.proteinPerKg.value = p.proteinPerKg || 2.0;
    if (f.fatPerKg && document.activeElement !== f.fatPerKg) f.fatPerKg.value = p.fatPerKg || 0.85;
    if (f.meals) f.meals.value = String(p.meals || 4);
  }

  function readForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    const f = form.elements;
    const p = LOS.db.profile;
    if (f.name && String(f.name.value).trim()) p.name = String(f.name.value).trim().slice(0, 40);
    if (f.age && Number(f.age.value)) p.age = Math.min(100, Math.max(13, Number(f.age.value)));
    if (f.sex) p.sex = f.sex.value === 'female' ? 'female' : 'male';
    if (f.height && Number(f.height.value)) p.height = Math.min(230, Math.max(120, Number(f.height.value)));
    if (f.weight && Number(f.weight.value)) p.weight = Math.min(250, Math.max(35, Number(f.weight.value)));
    if (f.activity) p.activity = Number(f.activity.value) || 1.55;
    if (f.goal) p.goal = f.goal.value || 'recomp';
    if (f.diet) p.diet = f.diet.value || 'omnivore';
    if (f.cuisine) p.cuisine = f.cuisine.value || 'any';
    if (f.proteinPerKg && Number(f.proteinPerKg.value)) p.proteinPerKg = Math.min(3, Math.max(1.2, Number(f.proteinPerKg.value)));
    if (f.fatPerKg && Number(f.fatPerKg.value)) p.fatPerKg = Math.min(1.5, Math.max(0.5, Number(f.fatPerKg.value)));
    if (f.meals) p.meals = Math.min(6, Math.max(2, Number(f.meals.value) || 4));
    LOS.save();
  }

  /* ----------------------------------------------------------
     DERIVED VIEW
     ---------------------------------------------------------- */
  function renderIdentity() {
    const p = LOS.db.profile;
    const name = p.name || 'Life OS User';
    const initial = (name.trim()[0] || 'L').toUpperCase();
    const avatar = document.getElementById('avatar');
    if (avatar) avatar.textContent = initial;
    const idName = document.getElementById('identityName');
    if (idName) idName.textContent = name;
    const idSub = document.getElementById('identitySub');
    if (idSub) idSub.textContent = `${p.age} Â· ${p.sex === 'female' ? 'Female' : 'Male'} Â· ${p.height} cm Â· ${p.weight} kg`;
    const streak = document.getElementById('streakBadge');
    if (streak) streak.textContent = LOS.db.streak.count || 0;
    const goal = document.getElementById('goalBadge');
    if (goal) goal.textContent = GOAL_LABELS[p.goal] || 'Recomp';
    const member = document.getElementById('profileMember');
    if (member) {
      const since = LOS.db.createdAt ? LOS.fromKey(LOS.db.createdAt) : new Date();
      member.textContent = `MEMBER Â· ${since.getFullYear()}`;
    }
  }

  function renderEnergy() {
    const g = LOS.goalsFor();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('bmrVal', Math.round(g.bmr));
    set('tdeeVal', Math.round(g.tdee));
    set('kcalTarget', Math.round(g.kcal));
    const label = document.getElementById('goalLabel');
    if (label) label.textContent = g.goal;

    const list = document.getElementById('targetList');
    if (list) {
      const rows = [
        ['Calories', g.kcal, 'kcal'],
        ['Protein', g.protein, 'g'],
        ['Carbs', g.carbs, 'g'],
        ['Fat', g.fat, 'g'],
        ['Fibre', g.fibre, 'g'],
        ['Water', g.water.toFixed(1), 'L'],
        [`Per meal Ã— ${g.meals}`, g.perMeal.kcal, 'kcal']
      ];
      list.innerHTML = rows.map(([name, value, unit]) => `<div class="target-row"><span>${name}</span><b>${value}<em>${unit}</em></b></div>`).join('');
    }
    const form = document.getElementById('profileForm');
    if (form) form.dataset.goal = g.goal;
  }

  function refreshDerived() {
    renderIdentity();
    renderEnergy();
    LOS.renderTop();
    if (LOS.currentPage === 'home') LOS.renderHome();
    if (LOS.currentPage === 'food') LOS.renderFood();
  }

  function renderPreferences() {
    $$('#accentRow .accent').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.accent === (LOS.db.prefs.accent || 'mint')));
    });
    const motion = document.getElementById('motionToggle');
    if (motion) motion.setAttribute('aria-pressed', String(LOS.db.prefs.motion !== false));
    const themeToggle = document.getElementById('themeModeToggle');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(LOS.db.prefs.theme === 'light'));
    const notifToggle = document.getElementById('notifToggle');
    if (notifToggle) notifToggle.setAttribute('aria-pressed', String(LOS.db.prefs.notifications === true));
    const compactToggle = document.getElementById('compactToggle');
    if (compactToggle) compactToggle.setAttribute('aria-pressed', String(LOS.db.prefs.compact === true));
  }

  function renderStorage() {
    const el = document.getElementById('storageInfo');
    if (!el) return;
    const used = (() => {
      try { return new Blob([localStorage.getItem(LOS.KEY) || '']).size; } catch (err) { return 0; }
    })();
    const kb = (used / 1024).toFixed(1);
    const days = Object.keys(LOS.db.days || {}).length;
    el.textContent = `${kb} KB stored Â· ${days} day${days === 1 ? '' : 's'} of history Â· local only`;
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (!el.isConnected) return;
        const quota = est.quota ? `${(est.quota / 1048576).toFixed(0)} MB quota` : '';
        el.textContent = `${kb} KB used${quota ? ' of ' + quota : ''} Â· ${days} day${days === 1 ? '' : 's'} of history Â· local only`;
      }).catch(() => {});
    }
  }

  function renderProfile() {
    fillForm();
    renderIdentity();
    renderEnergy();
    renderPreferences();
    renderStorage();
    renderMeasurements();
    syncInstall();
  }
  LOS.renderProfile = renderProfile;
  LOS.pages.profile = renderProfile;

  /* ----------------------------------------------------------
     EXPORT / IMPORT / RESET
     ---------------------------------------------------------- */
  function exportSnapshot() {
    try {
      const payload = JSON.stringify(LOS.db, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-os-${LOS.todayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      LOS.toast('Snapshot exported', 'ok', 2400);
    } catch (err) {
      LOS.toast('Export failed â€” try again', 'danger');
    }
  }

  function importSnapshot(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object' || !data.profile || !data.days) throw new Error('bad shape');
        localStorage.setItem(LOS.KEY, JSON.stringify(data));
        LOS.toast('Snapshot imported â€” reloading', 'ok', 1600);
        setTimeout(() => location.reload(), 700);
      } catch (err) {
        LOS.toast('That file is not a Life OS snapshot', 'danger', 3600);
      }
    };
    reader.onerror = () => LOS.toast('Could not read that file', 'danger');
    reader.readAsText(file);
  }

  function resetAll() {
    LOS.confirmAction(
      'Reset everything?',
      'Your profile, meals, workouts, study history and streak will be erased from this browser. Export a snapshot first if you want a copy.',
      'Erase all data',
      () => {
        try { localStorage.removeItem(LOS.KEY); } catch (err) {}
        LOS.toast('Data cleared â€” restarting', 'warn', 1400);
        setTimeout(() => location.reload(), 600);
      }
    );
  }

  /* ----------------------------------------------------------
     INSTALL
     ---------------------------------------------------------- */
  function syncInstall() {
    const prompt = window.LOS.installPrompt;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    [document.getElementById('installBtn'), document.getElementById('installBtn2')].forEach((btn) => {
      if (!btn) return;
      if (standalone) { btn.hidden = true; return; }
      btn.hidden = !prompt;
    });
    const hint = document.getElementById('installHint');
    if (hint) {
      hint.textContent = standalone
        ? 'Running as an installed app.'
        : prompt
          ? 'Installable now â€” works offline after the first load.'
          : 'Installable when served over localhost or HTTPS. Use the launcher.';
    }
  }
  LOS.syncInstall = syncInstall;

  async function triggerInstall() {
    const prompt = window.LOS.installPrompt;
    if (!prompt) {
      LOS.toast('Use the launcher (localhost) to install the app', 'warn', 3200);
      return;
    }
    prompt.prompt();
    try {
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        LOS.toast('Life OS installed', 'ok', 2600);
        window.LOS.installPrompt = null;
        syncInstall();
      }
    } catch (err) { /* dismissed */ }
  }

  /* ----------------------------------------------------------
     MEASUREMENTS
     ---------------------------------------------------------- */
  function renderMeasurements() {
    const box = document.getElementById('measureList');
    if (!box) return;
    const list = (LOS.db.measurements || []).slice().sort((a, b) => a.date < b.date ? -1 : 1);
    if (!list.length) { box.innerHTML = ''; return; }
    box.innerHTML = list.slice(-8).reverse().map((m) => `<div class="measure-row"><span class="mono muted">${esc(m.date)}</span><b>${m.waist || '—'} / ${m.chest || '—'} / ${m.arms || '—'} cm</b></div>`).join('');
  }
  function saveMeasurement() {
    const w = document.getElementById('mWaist');
    const c = document.getElementById('mChest');
    const a = document.getElementById('mArms');
    const d = document.getElementById('mDate');
    const date = d && d.value ? d.value : LOS.todayKey();
    const entry = { date, waist: w && w.value ? Number(w.value) : null, chest: c && c.value ? Number(c.value) : null, arms: a && a.value ? Number(a.value) : null };
    if (!entry.waist && !entry.chest && !entry.arms) { LOS.toast('Enter at least one measurement', 'warn'); return; }
    if (!LOS.db.measurements) LOS.db.measurements = [];
    LOS.db.measurements.push(entry);
    LOS.db.measurements.sort((x, y) => x.date < y.date ? -1 : 1);
    LOS.save();
    renderMeasurements();
    LOS.toast('Measurement logged', 'ok', 2000);
    if (w) w.value = ''; if (c) c.value = ''; if (a) a.value = '';
  }
  LOS.saveMeasurement = saveMeasurement;
  LOS.renderMeasurements = renderMeasurements;

  const saveMeasBtn = document.getElementById('saveMeasurement');
  if (saveMeasBtn) saveMeasBtn.addEventListener('click', saveMeasurement);
  const mDate = document.getElementById('mDate');
  if (mDate && !mDate.value) mDate.value = LOS.todayKey();
  renderMeasurements();

  /* ----------------------------------------------------------
     WIRING
     ---------------------------------------------------------- */
  const form = document.getElementById('profileForm');
  if (form) {
    const onChange = () => {
      readForm();
      refreshDerived();
      renderStorage();
    };
    form.addEventListener('input', onChange);
    form.addEventListener('change', onChange);
    form.addEventListener('submit', (e) => { e.preventDefault(); onChange(); LOS.toast('Metrics saved', 'ok', 1800); });
  }

  document.addEventListener('click', (e) => {
    const accent = e.target.closest('[data-accent]');
    if (accent) {
      LOS.db.prefs.accent = accent.dataset.accent;
      LOS.save();
      LOS.applyTheme();
      renderPreferences();
      LOS.toast(`Accent Â· ${accent.dataset.accent}`, 'ok', 1400);
      return;
    }

    if (e.target.closest('#motionToggle')) {
      LOS.db.prefs.motion = LOS.db.prefs.motion === false;
      LOS.save();
      LOS.applyTheme();
      renderPreferences();
      LOS.toast(`Ambient motion ${LOS.db.prefs.motion ? 'on' : 'off'}`, 'ok', 1600);
      return;
    }

    if (e.target.closest('#themeModeToggle')) {
      LOS.db.prefs.theme = LOS.db.prefs.theme === 'light' ? 'dark' : 'light';
      LOS.save();
      LOS.applyTheme();
      renderPreferences();
      LOS.toast(`Theme Â· ${LOS.db.prefs.theme}`, 'ok', 1600);
      return;
    }

    if (e.target.closest('#notifToggle')) {
      (async () => {
        if (!('Notification' in window)) { LOS.toast('Notifications not supported', 'warn'); return; }
        if (Notification.permission === 'default') await Notification.requestPermission();
        if (Notification.permission !== 'granted') { LOS.toast('Permission denied', 'danger'); return; }
        LOS.db.prefs.notifications = !LOS.db.prefs.notifications;
        LOS.save();
        renderPreferences();
        LOS.toast(`Notifications ${LOS.db.prefs.notifications ? 'on' : 'off'}`, 'ok', 1800);
      })();
      return;
    }

    if (e.target.closest('#compactToggle')) {
      LOS.db.prefs.compact = !LOS.db.prefs.compact;
      LOS.save();
      LOS.applyTheme();
      renderPreferences();
      LOS.toast(`Compact mode ${LOS.db.prefs.compact ? 'on' : 'off'}`, 'ok', 1600);
      return;
    }

    if (e.target.closest('#exportBtn') || e.target.closest('#exportBtn2')) { exportSnapshot(); return; }
    if (e.target.closest('#importBtn') || e.target.closest('#importBtn2')) {
      const input = document.getElementById('importFile');
      if (input) input.click();
      return;
    }
    if (e.target.closest('#resetBtn')) { resetAll(); return; }
    if (e.target.closest('#installBtn') || e.target.closest('#installBtn2')) { triggerInstall(); return; }
  });

  const importFile = document.getElementById('importFile');
  if (importFile) {
    importFile.addEventListener('change', () => {
      const file = importFile.files && importFile.files[0];
      importSnapshot(file);
      importFile.value = '';
    });
  }

  window.addEventListener('lifeos:installable', () => { syncInstall(); renderStorage(); });
  window.addEventListener('lifeos:installed', syncInstall);

  /* ----------------------------------------------------------
     CLOUD SYNC
     ---------------------------------------------------------- */
  function cloudPrefs() {
    const c = (LOS.db.prefs && LOS.db.prefs.cloud) || {};
    return { provider: c.provider || 'none', token: c.token || '', gistId: c.gistId || '', binId: c.binId || '' };
  }
  function setCloudStatus(msg, kind) {
    const el = document.getElementById('cloudStatus');
    if (el) { el.textContent = msg; el.dataset.kind = kind || ''; }
    const note = document.getElementById('cloudNote');
    if (note && msg) note.textContent = msg;
  }
  function fillCloud() {
    const c = cloudPrefs();
    const prov = document.getElementById('cloudProvider');
    const tok = document.getElementById('cloudToken');
    const gist = document.getElementById('cloudGistId');
    const gistField = document.getElementById('cloudGistField');
    if (prov) prov.value = c.provider;
    if (tok) tok.value = c.token;
    if (gist) gist.value = c.gistId;
    if (gistField) gistField.hidden = c.provider !== 'gist';
    setCloudStatus(c.provider === 'none' ? 'not configured' : c.provider, c.provider === 'none' ? '' : 'ok');
  }
  function saveCloudPrefs() {
    const prov = document.getElementById('cloudProvider');
    const tok = document.getElementById('cloudToken');
    const gist = document.getElementById('cloudGistId');
    LOS.db.prefs.cloud = {
      provider: prov ? prov.value : 'none',
      token: tok ? String(tok.value).trim() : '',
      gistId: gist ? String(gist.value).trim() : '',
      binId: (LOS.db.prefs.cloud && LOS.db.prefs.cloud.binId) || ''
    };
    LOS.save();
  }
  async function pushCloud() {
    saveCloudPrefs();
    const c = cloudPrefs();
    if (c.provider === 'none' || !c.token) { setCloudStatus('add a token first', 'warn'); return; }
    setCloudStatus('pushingâ€¦', '');
    try {
      const payload = JSON.stringify(LOS.db);
      if (c.provider === 'gist') {
        const url = c.gistId ? `https://api.github.com/gists/${c.gistId}` : 'https://api.github.com/gists';
        const method = c.gistId ? 'PATCH' : 'POST';
        const res = await fetch(url, { method, headers: { Authorization: `token ${c.token}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' }, body: JSON.stringify({ description: 'Life OS snapshot', public: false, files: { 'life-os.json': { content: payload } } }) });
        if (!res.ok) throw new Error(`gist ${res.status}`);
        const data = await res.json();
        if (data.id) { LOS.db.prefs.cloud.gistId = data.id; LOS.save(); const g = document.getElementById('cloudGistId'); if (g) g.value = data.id; }
        setCloudStatus(`pushed Â· gist ${data.id}`, 'ok');
      } else if (c.provider === 'jsonbin') {
        const url = c.binId ? `https://api.jsonbin.io/v3/b/${c.binId}` : 'https://api.jsonbin.io/v3/b';
        const method = c.binId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'X-Master-Key': c.token, 'Content-Type': 'application/json', 'X-Bin-Private': 'true' }, body: payload });
        if (!res.ok) throw new Error(`jsonbin ${res.status}`);
        const data = await res.json();
        const id = data.metadata && data.metadata.id;
        if (id) { LOS.db.prefs.cloud.binId = id; LOS.save(); }
        setCloudStatus(`pushed Â· bin ${id || 'ok'}`, 'ok');
      }
    } catch (err) {
      setCloudStatus(`push failed: ${err.message}`, 'danger');
    }
  }
  async function pullCloud() {
    saveCloudPrefs();
    const c = cloudPrefs();
    if (c.provider === 'none' || !c.token) { setCloudStatus('add a token first', 'warn'); return; }
    setCloudStatus('pullingâ€¦', '');
    try {
      let raw = null;
      if (c.provider === 'gist') {
        if (!c.gistId) throw new Error('no gist id');
        const res = await fetch(`https://api.github.com/gists/${c.gistId}`, { headers: { Authorization: `token ${c.token}`, Accept: 'application/vnd.github+json' } });
        if (!res.ok) throw new Error(`gist ${res.status}`);
        const data = await res.json();
        const file = data.files && data.files['life-os.json'];
        if (!file || !file.content) throw new Error('no snapshot');
        raw = file.content;
      } else if (c.provider === 'jsonbin') {
        if (!c.binId) throw new Error('no bin id');
        const res = await fetch(`https://api.jsonbin.io/v3/b/${c.binId}/latest`, { headers: { 'X-Master-Key': c.token } });
        if (!res.ok) throw new Error(`jsonbin ${res.status}`);
        const data = await res.json();
        raw = JSON.stringify(data.record || data);
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.profile || !parsed.days) throw new Error('bad snapshot');
      localStorage.setItem(LOS.KEY, JSON.stringify(parsed));
      setCloudStatus('pulled Â· reloading', 'ok');
      setTimeout(() => location.reload(), 900);
    } catch (err) {
      setCloudStatus(`pull failed: ${err.message}`, 'danger');
    }
  }
  LOS.pushCloud = pushCloud;
  LOS.pullCloud = pullCloud;

  /* auto-sync: debounced push on save when configured */
  let cloudPushTimer = null;
  function scheduleCloudPush() {
    const c = cloudPrefs();
    if (c.provider === 'none' || !c.token) return;
    if (cloudPushTimer) clearTimeout(cloudPushTimer);
    cloudPushTimer = setTimeout(() => { cloudPushTimer = null; pushCloud(); }, 2500);
  }
  LOS.scheduleCloudPush = scheduleCloudPush;

  const _origSave = LOS.save;
  LOS.save = function () {
    _origSave();
    try { scheduleCloudPush(); } catch (e) {}
  };

  const cloudProvider = document.getElementById('cloudProvider');
  if (cloudProvider) {
    cloudProvider.addEventListener('change', () => {
      saveCloudPrefs();
      const gistField = document.getElementById('cloudGistField');
      if (gistField) gistField.hidden = cloudProvider.value !== 'gist';
      setCloudStatus(cloudProvider.value === 'none' ? 'not configured' : cloudProvider.value, cloudProvider.value === 'none' ? '' : 'ok');
    });
  }
  const cloudToken = document.getElementById('cloudToken');
  if (cloudToken) cloudToken.addEventListener('change', saveCloudPrefs);
  const cloudGistId = document.getElementById('cloudGistId');
  if (cloudGistId) cloudGistId.addEventListener('change', saveCloudPrefs);
  const cloudPush = document.getElementById('cloudPush');
  if (cloudPush) cloudPush.addEventListener('click', pushCloud);
  const cloudPull = document.getElementById('cloudPull');
  if (cloudPull) cloudPull.addEventListener('click', pullCloud);

  fillCloud();
  const csvFile = document.getElementById('csvFile');
  if (csvFile) {
    csvFile.addEventListener('change', () => {
      const file = csvFile.files && csvFile.files[0];
      if (file) importCsv(file);
      csvFile.value = '';
    });
  }
  const csvBtn = document.getElementById('csvImportBtn');
  if (csvBtn) csvBtn.addEventListener('click', () => { if (csvFile) csvFile.click(); });

  function importCsv(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const lines = String(reader.result).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        let count = 0;
        const history = LOS.db.weightHistory || [];
        lines.forEach((line, i) => {
          if (i === 0 && /date/i.test(line)) return;
          const parts = line.split(/[;,]/);
          if (parts.length < 2) return;
          const date = parts[0].trim();
          const w = Number(parts[1]);
          if (!date || !w || w < 20 || w > 400) return;
          history.push({ date, weight: w });
          count++;
        });
        if (!count) throw new Error('no rows');
        history.sort((a, b) => a.date < b.date ? -1 : 1);
        LOS.db.weightHistory = history;
        const last = history[history.length - 1];
        if (last) LOS.db.profile.weight = last.weight;
        LOS.save();
        refreshDerived();
        renderStorage();
        LOS.toast(`Imported ${count} weight entries`, 'ok', 2600);
      } catch (err) {
        LOS.toast('CSV must have date,weight rows', 'danger', 3600);
      }
    };
    reader.readAsText(file);
  }

  LOS.bestSet = function (name, weight, reps) {
    const prs = LOS.db.prefs.prs || {};
    const cur = prs[name];
    if (!cur || weight > cur.weight || (weight === cur.weight && reps > cur.reps)) {
      prs[name] = { weight, reps, date: LOS.todayKey() };
      LOS.db.prefs.prs = prs;
      LOS.save();
      return true;
    }
    return false;
  };
})();
