/* ============================================================
   LIFE OS â€” food: macros, meals, hydration, AI chef
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  let foodDate = LOS.todayKey();
  let chefItems = [];

  const PREMADE_MEALS = [
    { name: 'Scrambled eggs on toast', cat: 'breakfast', kcal: 320, p: 22, c: 28, f: 14, fib: 2 },
    { name: 'Oatmeal with banana and honey', cat: 'breakfast', kcal: 380, p: 12, c: 62, f: 9, fib: 7 },
    { name: 'Greek yoghurt parfait', cat: 'breakfast', kcal: 290, p: 20, c: 34, f: 8, fib: 4 },
    { name: 'Idli with sambar', cat: 'breakfast', kcal: 340, p: 12, c: 58, f: 6, fib: 6 },
    { name: 'Poha with peanuts', cat: 'breakfast', kcal: 360, p: 10, c: 52, f: 12, fib: 5 },
    { name: 'Avocado toast with egg', cat: 'breakfast', kcal: 410, p: 18, c: 34, f: 22, fib: 6 },
    { name: 'Chicken rice bowl', cat: 'lunch', kcal: 520, p: 45, c: 55, f: 12, fib: 5 },
    { name: 'Dal tadka with rice', cat: 'lunch', kcal: 480, p: 18, c: 72, f: 10, fib: 10 },
    { name: 'Paneer bhurji with roti', cat: 'lunch', kcal: 460, p: 24, c: 40, f: 22, fib: 5 },
    { name: 'Rajma chawal', cat: 'lunch', kcal: 560, p: 24, c: 92, f: 9, fib: 14 },
    { name: 'Tuna salad sandwich', cat: 'lunch', kcal: 420, p: 34, c: 42, f: 12, fib: 4 },
    { name: 'Caesar salad with chicken', cat: 'lunch', kcal: 450, p: 40, c: 18, f: 24, fib: 4 },
    { name: 'Grilled salmon with veggies', cat: 'dinner', kcal: 520, p: 42, c: 24, f: 26, fib: 6 },
    { name: 'Chicken tikka with roti', cat: 'dinner', kcal: 580, p: 46, c: 48, f: 22, fib: 4 },
    { name: 'Tofu stir-fry with noodles', cat: 'dinner', kcal: 480, p: 28, c: 58, f: 14, fib: 7 },
    { name: 'Chickpea curry with rice', cat: 'dinner', kcal: 540, p: 22, c: 70, f: 16, fib: 10 },
    { name: 'Protein shake', cat: 'post', kcal: 220, p: 30, c: 18, f: 4, fib: 2 },
    { name: 'Banana with peanut butter', cat: 'snack', kcal: 280, p: 8, c: 34, f: 14, fib: 4 },
    { name: 'Apple and almonds', cat: 'snack', kcal: 220, p: 6, c: 22, f: 12, fib: 5 },
    { name: 'Protein bar', cat: 'snack', kcal: 210, p: 20, c: 22, f: 7, fib: 3 }
  ];
    const CHEF_POOL = [
    { name: 'Grilled chicken rice bowl', kcal: 520, p: 45, c: 55, f: 12, fib: 5, cuisine: 'western', tags: ['meat'], ings: ['chicken', 'rice', 'yoghurt', 'spices'] },
    { name: 'Salmon + sweet potato', kcal: 560, p: 38, c: 44, f: 22, fib: 6, cuisine: 'western', tags: ['fish'], ings: ['salmon', 'sweet potato', 'olive oil', 'broccoli'] },
    { name: 'Greek yoghurt + berries', kcal: 240, p: 22, c: 24, f: 6, fib: 4, cuisine: 'western', tags: ['dairy'], ings: ['yoghurt', 'berries', 'oats', 'honey'] },
    { name: 'Tofu stir-fry + noodles', kcal: 480, p: 28, c: 58, f: 14, fib: 7, cuisine: 'asian', tags: ['soy'], ings: ['tofu', 'noodles', 'soy sauce', 'vegetables'] },
    { name: 'Turkey wrap + salad', kcal: 380, p: 32, c: 38, f: 10, fib: 4, cuisine: 'western', tags: ['meat'], ings: ['turkey', 'tortilla', 'lettuce', 'tomato'] },
    { name: 'Protein shake + banana', kcal: 300, p: 30, c: 36, f: 4, fib: 3, cuisine: 'any', tags: ['dairy'], ings: ['whey', 'milk', 'banana'] },
    { name: 'Egg omelette + toast', kcal: 420, p: 26, c: 32, f: 20, fib: 3, cuisine: 'western', tags: ['egg', 'dairy'], ings: ['eggs', 'bread', 'butter', 'cheese'] },
    { name: 'Cottage cheese + pineapple', kcal: 220, p: 24, c: 18, f: 4, fib: 2, cuisine: 'western', tags: ['dairy'], ings: ['cottage cheese', 'pineapple'] },
    { name: 'Chickpea curry + rice', kcal: 540, p: 22, c: 70, f: 16, fib: 10, cuisine: 'indian', tags: ['plant'], ings: ['chickpeas', 'rice', 'tomato', 'onion', 'spices'] },
    { name: 'Prawn rice paper rolls', kcal: 330, p: 24, c: 42, f: 6, fib: 5, cuisine: 'asian', tags: ['fish'], ings: ['prawns', 'rice paper', 'vegetables', 'herbs'] },
    { name: 'Steak + roast vegetables', kcal: 610, p: 48, c: 34, f: 30, fib: 7, cuisine: 'western', tags: ['meat'], ings: ['steak', 'potato', 'carrot', 'olive oil'] },
    { name: 'Paneer bhurji with roti', kcal: 480, p: 26, c: 42, f: 22, fib: 6, cuisine: 'indian', tags: ['dairy'], ings: ['paneer', 'onion', 'tomato', 'roti'] },
    { name: 'Dal tadka with rice and salad', kcal: 520, p: 22, c: 82, f: 10, fib: 12, cuisine: 'indian', tags: ['plant'], ings: ['dal', 'rice', 'ghee', 'cucumber'] },
    { name: 'Rajma chawal', kcal: 560, p: 24, c: 92, f: 9, fib: 14, cuisine: 'indian', tags: ['plant'], ings: ['kidney beans', 'rice', 'tomato', 'onion'] },
    { name: 'Chicken tikka with jeera rice', kcal: 590, p: 48, c: 58, f: 16, fib: 5, cuisine: 'indian', tags: ['meat', 'dairy'], ings: ['chicken', 'yoghurt', 'rice', 'spices'] },
    { name: 'Egg bhurji with two rotis', kcal: 450, p: 24, c: 40, f: 22, fib: 5, cuisine: 'indian', tags: ['egg'], ings: ['eggs', 'onion', 'tomato', 'roti'] },
    { name: 'Soya chunk curry with rice', kcal: 500, p: 32, c: 62, f: 10, fib: 9, cuisine: 'indian', tags: ['soy'], ings: ['soya chunks', 'rice', 'tomato', 'onion'] },
    { name: 'Curd rice with peanuts', kcal: 430, p: 16, c: 62, f: 12, fib: 4, cuisine: 'indian', tags: ['dairy'], ings: ['rice', 'curd', 'peanuts', 'mustard seeds'] },
    { name: 'Chana chaat bowl', kcal: 360, p: 18, c: 52, f: 8, fib: 11, cuisine: 'indian', tags: ['plant'], ings: ['chickpeas', 'onion', 'tomato', 'lemon'] },
    { name: 'Teriyaki chicken with rice', kcal: 600, p: 44, c: 70, f: 14, fib: 3, cuisine: 'asian', tags: ['meat'], ings: ['chicken', 'rice', 'soy sauce', 'ginger'] },
    { name: 'Miso tofu bowl', kcal: 460, p: 26, c: 52, f: 16, fib: 6, cuisine: 'asian', tags: ['soy'], ings: ['tofu', 'rice', 'miso', 'vegetables'] },
    { name: 'Falafel hummus plate', kcal: 520, p: 20, c: 66, f: 20, fib: 13, cuisine: 'mediterranean', tags: ['plant'], ings: ['chickpeas', 'tahini', 'pita', 'vegetables'] },
    { name: 'Greek chicken souvlaki', kcal: 540, p: 46, c: 44, f: 18, fib: 4, cuisine: 'mediterranean', tags: ['meat', 'dairy'], ings: ['chicken', 'yoghurt', 'pita', 'cucumber'] },
    { name: 'Tuna white bean salad', kcal: 410, p: 36, c: 34, f: 14, fib: 9, cuisine: 'mediterranean', tags: ['fish'], ings: ['tuna', 'white beans', 'tomato', 'olive oil'] },
    { name: 'Lentil soup with bread', kcal: 380, p: 20, c: 58, f: 8, fib: 12, cuisine: 'mediterranean', tags: ['plant'], ings: ['lentils', 'carrot', 'bread', 'olive oil'] }
  ];

  const DIET_LABEL = {
    omnivore: 'omnivore', vegetarian: 'vegetarian', eggetarian: 'vegetarian + eggs',
    vegan: 'vegan', pescatarian: 'pescatarian'
  };

  function chefPrefs() {
    const p = LOS.db.profile || {};
    const c = (LOS.db.prefs && LOS.db.prefs.chef) || {};
    return {
      diet: p.diet || 'omnivore',
      cuisine: p.cuisine || 'any',
      pantry: c.pantry || '',
      dislikes: c.dislikes || ''
    };
  }

  const terms = (s) => String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);

  function dietOk(item, diet) {
    const tags = item.tags || [];
    if (diet === 'vegan') return !tags.includes('meat') && !tags.includes('fish') && !tags.includes('egg') && !tags.includes('dairy');
    if (diet === 'vegetarian') return !tags.includes('meat') && !tags.includes('fish') && !tags.includes('egg');
    if (diet === 'eggetarian') return !tags.includes('meat') && !tags.includes('fish');
    if (diet === 'pescatarian') return !tags.includes('meat');
    return true;
  }

  function dislikesHit(item, words) {
    if (!words.length) return false;
    const hay = (item.name + ' ' + (item.ings || []).join(' ')).toLowerCase();
    return words.some((w) => hay.includes(w));
  }

  function pantryMatch(item, words) {
    if (!words.length) return 0;
    return (item.ings || []).reduce((n, ing) => (words.some((w) => ing.includes(w) || w.includes(ing)) ? n + 1 : n), 0);
  }

  function fillChefPrefs() {
    const prefs = chefPrefs();
    const diet = document.getElementById('chefDiet');
    const cuisine = document.getElementById('chefCuisine');
    const pantry = document.getElementById('chefPantry');
    const dislikes = document.getElementById('chefDislikes');
    if (diet) diet.value = prefs.diet;
    if (cuisine) cuisine.value = prefs.cuisine;
    if (pantry) pantry.value = prefs.pantry;
    if (dislikes) dislikes.value = prefs.dislikes;
  }

  function saveChefPrefs() {
    const diet = document.getElementById('chefDiet');
    const cuisine = document.getElementById('chefCuisine');
    const pantry = document.getElementById('chefPantry');
    const dislikes = document.getElementById('chefDislikes');
    if (diet) LOS.db.profile.diet = diet.value;
    if (cuisine) LOS.db.profile.cuisine = cuisine.value;
    LOS.db.prefs.chef = {
      pantry: pantry ? String(pantry.value).trim().slice(0, 160) : '',
      dislikes: dislikes ? String(dislikes.value).trim().slice(0, 120) : ''
    };
    LOS.save();
  }

  function guessCat() {
    const h = new Date().getHours();
    if (h < 10) return 'breakfast';
    if (h < 12) return 'snack';
    if (h < 15) return 'lunch';
    if (h < 18) return 'pre';
    if (h < 21) return 'dinner';
    return 'snack';
  }

  function openMealModal(prefill) {
    const form = document.getElementById('mealForm');
    if (!form) return;
    form.reset();
    const sel = form.elements.cat;
    if (sel) sel.value = prefill && prefill.cat ? prefill.cat : guessCat();
    if (prefill) {
      ['name', 'kcal', 'p', 'c', 'f', 'fib'].forEach((k) => {
        if (prefill[k] != null && form.elements[k]) form.elements[k].value = prefill[k];
      });
    }
    const title = document.getElementById('mealModalTitle');
    if (title) title.textContent = prefill ? 'Log suggested meal' : 'Log a meal';
    LOS.openModal('mealModal');
  }
  LOS.openMealModal = openMealModal;

  function addMeal(payload) {
    const day = LOS.dayData(foodDate);
    const meal = {
      id: LOS.uid(),
      name: String(payload.name).trim().slice(0, 80),
      cat: payload.cat || guessCat(),
      kcal: Math.max(0, Number(payload.kcal) || 0),
      p: Math.max(0, Number(payload.p) || 0),
      c: Math.max(0, Number(payload.c) || 0),
      f: Math.max(0, Number(payload.f) || 0),
      fib: Math.max(0, Number(payload.fib) || 0),
      time: new Date().toTimeString().slice(0, 5)
    };
    if (!meal.name) return;
    day.meals.push(meal);
    LOS.save();
    LOS.maybeStreak();
    LOS.closeModal('mealModal');
    renderFood();
    LOS.renderTop();
    LOS.toast(`${meal.name} Â· ${Math.round(meal.kcal)} kcal logged`, 'ok', 2400);
    const dayAfter = LOS.dayData(foodDate);
    const t = LOS.totalsFor(dayAfter);
    const g = LOS.goalsFor();
    if (t.kcal >= g.kcal * 0.98 && t.kcal <= g.kcal * 1.05) LOS.celebrate('Calorie target hit â€” nailed it!');
    else if (t.p >= g.protein * 0.98) LOS.celebrate('Protein target hit â€” strong work!');
  }

  function remainingFor(day) {
    const g = LOS.goalsFor();
    const t = LOS.totalsFor(day);
    return {
      kcal: Math.max(0, g.kcal - t.kcal),
      p: Math.max(0, g.protein - t.p),
      c: Math.max(0, g.carbs - t.c),
      f: Math.max(0, g.fat - t.f),
      fib: Math.max(0, g.fibre - t.fib),
      water: Math.max(0, g.water - t.water)
    };
  }

  function localSuggestions(rem) {
    const prefs = chefPrefs();
    const diet = prefs.diet;
    const cuisine = prefs.cuisine;
    const pantry = terms(prefs.pantry);
    const avoid = terms(prefs.dislikes);
    const goals = LOS.goalsFor();
    const targetKcal = goals.perMeal ? goals.perMeal.kcal : (rem.kcal > 0 ? rem.kcal : 500);
    const targetP = goals.perMeal ? goals.perMeal.p : (rem.p > 0 ? rem.p : 30);

    const dietPool = CHEF_POOL.filter((item) => dietOk(item, diet) && !dislikesHit(item, avoid));
    const pool = dietPool.length ? dietPool : CHEF_POOL.filter((item) => dietOk(item, diet));
    const usable = pool.length ? pool : CHEF_POOL;

    const scored = usable.map((item) => {
      const kcalFit = 1 - Math.min(1, Math.abs(item.kcal - targetKcal) / Math.max(340, targetKcal));
      const proteinFit = Math.min(1, item.p / Math.max(1, targetP));
      const fibreFit = Math.min(1, item.fib / Math.max(1, rem.fib || 8));
      const cuisineHit = cuisine && cuisine !== 'any' && item.cuisine === cuisine ? 1 : 0;
      const pantryHits = pantryMatch(item, pantry);
      const usesPantry = pantryHits >= 2;
      return {
        ...item,
        score: kcalFit * 0.46 + proteinFit * 0.28 + fibreFit * 0.08 + cuisineHit * 0.12 + (usesPantry ? 0.18 : 0) + Math.min(0.12, pantryHits * 0.03),
        why: `${usesPantry ? 'Uses what you have. ' : ''}Covers ${Math.round(item.p)}g protein at ${item.kcal} kcal â€” about a quarter of your remaining gap.`,
        ingredients: (item.ings || []).map((n) => ({ name: n, grams: 100 }))
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  function normalizeSuggestions(items) {
    return items.map((s) => {
      const ings = Array.isArray(s.ingredients) ? s.ingredients : [];
      return {
        name: String(s.name || s.title || 'Suggested meal').slice(0, 80),
        kcal: Math.max(0, Math.round(Number(s.kcal || s.calories) || 0)),
        p: Math.max(0, Math.round(Number(s.p || s.protein) || 0)),
        c: Math.max(0, Math.round(Number(s.c || s.carbs) || 0)),
        f: Math.max(0, Math.round(Number(s.f || s.fat) || 0)),
        fib: Math.max(0, Math.round(Number(s.fib || s.fibre || s.fiber) || 0)),
        why: String(s.why || s.reason || 'Balanced against what you have left today.').slice(0, 220),
        ingredients: ings
          .map((i) => ({ name: String(i.name || i.ingredient || '').slice(0, 40), grams: Math.max(0, Math.round(Number(i.grams || i.amount || i.weight) || 0)) }))
          .filter((i) => i.name)
      };
    }).filter((s) => s.name && s.kcal > 0);
  }

  function renderChefList(items, powered) {
    const list = document.getElementById('chefList');
    const intro = document.getElementById('chefIntro');
    if (!list) return;
    chefItems = items;
    if (intro) {
      intro.textContent = powered
        ? 'Ranked by the local router model against what you have left today.'
        : 'Ranked locally against what you have left today. The router model upgrades this when the launcher is running.';
    }
    list.innerHTML = items.map((s, i) => `
      <div class="chef-item">
        <div class="chef-top">
          <div style="min-width:0">
            <div class="chef-name">${esc(s.name)}</div>
            <div class="chef-macros">${Math.round(s.kcal)} kcal Â· P ${Math.round(s.p)} Â· C ${Math.round(s.c)} Â· F ${Math.round(s.f)} Â· Fib ${Math.round(s.fib)}</div>
            ${s.ingredients && s.ingredients.length ? `<div class="chef-ings">${s.ingredients.map((ing) => `<span>${esc(ing.name)} <b>${ing.grams}g</b></span>`).join('')}</div>` : ''}
          </div>
          <button class="btn tiny primary" data-chef-log="${i}">Log</button>
        </div>
        <div class="chef-why">${esc(s.why)}</div>
        <div class="fine" style="margin-top:6px">${powered ? 'Macros are calculated from the listed gram amounts â€” adjust in the log form if your portions differ.' : 'Ingredient weights are estimates (100 g each) â€” adjust in the log form to match your actual portions.'}</div>
      </div>`).join('');
  }

  async function askChef() {
    const day = LOS.dayData(foodDate);
    const rem = remainingFor(day);
    const local = localSuggestions(rem);
    LOS.openModal('chefModal');
    fillChefPrefs();
    renderChefList(local, false);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const prefs = chefPrefs();
      const res = await fetch('./api/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remaining: rem,
          profile: LOS.db.profile,
          totals: LOS.totalsFor(day),
          goals: LOS.goalsFor(),
          chef: prefs,
          perMeal: LOS.goalsFor().perMeal,
          recent: day.meals.map((m) => m.name).slice(-6)
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) return;
      const data = await res.json();
      const suggestions = normalizeSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      if (suggestions.length) renderChefList(suggestions.slice(0, 3), true);
    } catch (err) {
      clearTimeout(timer);
      /* local ranking already on screen */
    }
  }

  function bar(label, value, max, cls, unit) {
    const pct = Math.min(100, (value / Math.max(1, max)) * 100);
    return `<div class="mbar ${cls}">
      <div class="mbar-head"><span>${label}</span><b>${Math.round(value)}<em> / ${Math.round(max)} ${unit}</em></b></div>
      <div class="mbar-track"><div class="mbar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  function renderFood() {
    if (foodDate > LOS.todayKey()) foodDate = LOS.todayKey();
    const key = foodDate;
    const day = LOS.dayData(key);
    const g = LOS.goalsFor();
    const t = LOS.totalsFor(day);
    const rem = remainingFor(day);
    const isToday = key === LOS.todayKey();

    const dateLabel = document.getElementById('foodDateLabel');
    if (dateLabel) dateLabel.textContent = LOS.dateShort(key).toUpperCase();
    const todayBtn = document.getElementById('foodToday');
    if (todayBtn) {
      todayBtn.textContent = isToday ? 'Today' : 'Jump to today';
      todayBtn.title = isToday ? 'You are viewing today' : 'Back to today';
    }
    const nextBtn = document.getElementById('foodNext');
    if (nextBtn) nextBtn.disabled = key >= LOS.todayKey();

    const macro = document.getElementById('macroCard');
    if (macro) {
      const kcalPct = Math.min(100, (t.kcal / Math.max(1, g.kcal)) * 100);
      const drops = Array.from({ length: 8 }, (_, i) => {
        const threshold = (g.water / 8) * (i + 1);
        return `<span class="water-drop${t.water >= threshold - 0.001 ? ' on' : ''}"></span>`;
      }).join('');
      macro.innerHTML = `
        <div class="macro-top">
          <div class="macro-ring-wrap">
            <svg class="macro-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="ring-bg" cx="60" cy="60" r="52"/>
              <circle class="ring-fg" cx="60" cy="60" r="52" style="stroke-dashoffset:${326.7 * (1 - kcalPct / 100)}"/>
            </svg>
            <div class="macro-center">
              <b>${Math.round(t.kcal)}</b>
              <span>of ${g.kcal} kcal</span>
              <em>${Math.round(kcalPct)}%</em>
            </div>
          </div>
          <div class="macro-bars">
            ${bar('Protein', t.p, g.protein, 'p', 'g')}
            ${bar('Carbs', t.c, g.carbs, 'c', 'g')}
            ${bar('Fat', t.f, g.fat, 'f', 'g')}
            ${bar('Fibre', t.fib, g.fibre, 'fib', 'g')}
          </div>
        </div>
        <div class="macro-foot">
          <div class="water-block">
            <div class="water-drops" aria-hidden="true">${drops}</div>
            <span class="water-val"><b>${t.water.toFixed(1)}</b> / ${g.water.toFixed(1)} L</span>
          </div>
          <div class="water-actions">
            <button class="btn tiny" data-water="250">+250 ml</button>
            <button class="btn tiny" data-water="500">+500 ml</button>
          </div>
        </div>`;
    }

    const remaining = document.getElementById('remaining');
    if (remaining) {
      const over = t.kcal > g.kcal * 1.05;
      remaining.innerHTML = `
        <div>
          <div class="eyebrow">Remaining today</div>
          <div class="rem-nums" style="margin-top:9px"><b>${rem.kcal}</b><span>kcal left</span></div>
        </div>
        <div class="rem-chips">
          <span class="rem-chip">P <b>${rem.p}g</b></span>
          <span class="rem-chip">C <b>${rem.c}g</b></span>
          <span class="rem-chip">F <b>${rem.f}g</b></span>
          <span class="rem-chip">Fib <b>${rem.fib}g</b></span>
          <span class="rem-chip goal">Per meal Â· <b>${g.perMeal.kcal} kcal</b> Â· P ${g.perMeal.p}g</span>
        </div>
        <div class="rem-note">${over
          ? 'You are over your calorie target. Keep the next meal light and protein-led.'
          : 'What\'s in my fridge? The chef ranks meals that close the gaps without blowing the target.'}</div>
        <div class="rem-actions">
          <button class="btn primary" id="chefBtn">${icon('spark')}Ask AI Chef</button>
          <button class="btn" data-water="500">${icon('drop')}Add 500 ml water</button>
        </div>`;
    }

    const mealTotal = document.getElementById('mealTotal');
    if (mealTotal) mealTotal.textContent = `${t.meals} ${t.meals === 1 ? 'item' : 'items'} Â· ${Math.round(t.kcal)} kcal`;

    const favs = document.getElementById('favs');
    if (favs) {
      const list = LOS.db.prefs.favourites || [];
      if (!list.length) { favs.innerHTML = ''; favs.hidden = true; }
      else {
        favs.hidden = false;
        favs.innerHTML = `<div class="card-head" style="margin-bottom:8px"><h3 style="font-size:13px">Favourites</h3><span class="mono muted">${list.length}</span></div>` +
          list.map((m, i) => `<div class="meal-item fav-item">
            <div class="meal-info"><b>${esc(m.name)}</b><div class="meal-macros"><i>P</i> ${Math.round(m.p)} Â· <i>C</i> ${Math.round(m.c)} Â· <i>F</i> ${Math.round(m.f)} Â· ${Math.round(m.kcal)} kcal</div></div>
            <button class="btn tiny primary" data-fav-log="${i}">Log</button>
            <button class="meal-del" data-fav-del="${i}" aria-label="Remove favourite">${icon('trash')}</button>
          </div>`).join('');
      }
    }

    const meals = document.getElementById('meals');
    if (meals) {
      if (!t.meals) {
        meals.innerHTML = `<div class="empty">
          ${icon('food')}
          <b>No meals logged yet for ${esc(LOS.fromKey(key).toDateString().slice(0, 3))}.</b>
          <p>Log your first meal, or open the chef and let it rank something that fits your remaining macros.</p>
          <button class="btn primary" id="emptyAdd">${icon('plus')}Log your first meal</button>
        </div>`;
      } else {
        const groups = LOS.MEAL_CATS.map((cat) => {
          const items = day.meals.filter((m) => m.cat === cat.id);
          if (!items.length) return '';
          const kcal = items.reduce((n, m) => n + (Number(m.kcal) || 0), 0);
          return `<div class="meal-cat">
            <div class="meal-cat-head"><span>${cat.label}</span><b>${Math.round(kcal)} kcal</b></div>
            ${items.map((m) => `<div class="meal-item">
              <div class="meal-info">
                <b>${esc(m.name)}</b>
                <div class="meal-macros"><i>P</i> ${Math.round(m.p)} Â· <i>C</i> ${Math.round(m.c)} Â· <i>F</i> ${Math.round(m.f)} Â· <i>Fib</i> ${Math.round(m.fib)}</div>
              </div>
              <span class="meal-kcal">${Math.round(m.kcal)} kcal</span>
              <button class="meal-star" data-star-meal="${esc(m.id)}" aria-label="Save as favourite">${icon('spark')}</button>
              <button class="meal-del" data-del-meal="${esc(m.id)}" aria-label="Delete ${esc(m.name)}">${icon('trash')}</button>
            </div>`).join('')}
          </div>`;
        });
        meals.innerHTML = groups.join('') || '';
      }
    }
  }
  LOS.renderFood = renderFood;
  LOS.pages.food = renderFood;

  /* ---------------- wiring ---------------- */
  const chefPrefsForm = document.getElementById('chefPrefs');
  if (chefPrefsForm) {
    chefPrefsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveChefPrefs();
      LOS.toast('Chef preferences saved', 'ok', 1800);
      askChef();
    });
  }

  const catSelect = document.getElementById('mealCat');
  if (catSelect) {
    catSelect.innerHTML = LOS.MEAL_CATS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  }

  const presetMeal = document.getElementById('presetMeal');
  if (presetMeal) {
    presetMeal.innerHTML = '<option value="">â€” choose a preset or type below â€”</option>' +
      PREMADE_MEALS.map((m, i) => `<option value="${i}">${m.name} Â· ${m.kcal} kcal</option>`).join('');
    presetMeal.addEventListener('change', () => {
      const idx = Number(presetMeal.value);
      if (isNaN(idx)) return;
      const m = PREMADE_MEALS[idx];
      if (!m) return;
      const form = document.getElementById('mealForm');
      if (!form) return;
      form.elements.name.value = m.name;
      form.elements.cat.value = m.cat;
      form.elements.kcal.value = m.kcal;
      form.elements.p.value = m.p;
      form.elements.c.value = m.c;
      form.elements.f.value = m.f;
      form.elements.fib.value = m.fib;
    });
  }
  if (mealForm) {
    mealForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = mealForm.elements;
      addMeal({
        name: f.name.value, cat: f.cat.value, kcal: f.kcal.value,
        p: f.p.value, c: f.c.value, f: f.f.value, fib: f.fib.value
      });
    });
  }

  document.addEventListener('click', (e) => {
    const water = e.target.closest('[data-water]');
    if (water) { LOS.addWater(Number(water.dataset.water) || 250); if (LOS.currentPage === 'food') renderFood(); return; }

    if (e.target.closest('#addMealBtn') || e.target.closest('#emptyAdd')) { openMealModal(); return; }

    const del = e.target.closest('[data-del-meal]');
    if (del) {
      const day = LOS.dayData(foodDate);
      const id = del.dataset.delMeal;
      const meal = day.meals.find((m) => m.id === id);
      day.meals = day.meals.filter((m) => m.id !== id);
      LOS.save();
      renderFood();
      LOS.toast(meal ? `${meal.name} removed` : 'Meal removed', 'warn', 2000);
      return;
    }

    if (e.target.closest('#chefBtn')) { askChef(); return; }

    const star = e.target.closest('[data-star-meal]');
    if (star) {
      const day = LOS.dayData(foodDate);
      const meal = day.meals.find((m) => m.id === star.dataset.starMeal);
      if (!meal) return;
      const favs = LOS.db.prefs.favourites || [];
      if (favs.some((f) => f.name === meal.name)) { LOS.toast('Already a favourite', 'warn', 1800); return; }
      favs.push({ name: meal.name, kcal: meal.kcal, p: meal.p, c: meal.c, f: meal.f, fib: meal.fib, cat: meal.cat });
      LOS.db.prefs.favourites = favs;
      LOS.save();
      renderFood();
      LOS.toast(`${meal.name} saved as favourite`, 'ok', 2000);
      return;
    }

    const favLog = e.target.closest('[data-fav-log]');
    if (favLog) {
      const item = (LOS.db.prefs.favourites || [])[Number(favLog.dataset.favLog)];
      if (!item) return;
      openMealModal({ name: item.name, kcal: item.kcal, p: item.p, c: item.c, f: item.f, fib: item.fib, cat: item.cat || guessCat() });
      return;
    }

    const favDel = e.target.closest('[data-fav-del]');
    if (favDel) {
      const idx = Number(favDel.dataset.favDel);
      const list = LOS.db.prefs.favourites || [];
      const removed = list.splice(idx, 1)[0];
      LOS.db.prefs.favourites = list;
      LOS.save();
      renderFood();
      LOS.toast(removed ? `${removed.name} removed` : 'Removed', 'warn', 1800);
      return;
    }
  });

  const prev = document.getElementById('foodPrev');
  const next = document.getElementById('foodNext');
  const today = document.getElementById('foodToday');
  if (prev) prev.addEventListener('click', () => { foodDate = LOS.addDays(foodDate, -1); renderFood(); });
  if (next) next.addEventListener('click', () => {
    if (foodDate < LOS.todayKey()) { foodDate = LOS.addDays(foodDate, 1); renderFood(); }
  });
  if (today) today.addEventListener('click', () => { foodDate = LOS.todayKey(); renderFood(); });
})();
