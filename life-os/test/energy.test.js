// Life OS — energy model tests
// Tests the Mifflin–St Jeor BMR / TDEE / calorie-target calculation
// used by LOS.goalsFor() in js/core.js

function goalsFor(p) {
  const age = Number(p.age) || 20;
  const h = Number(p.height) || 175;
  const w = Number(p.weight) || 75;
  const sex = p.sex === 'female' ? 'female' : 'male';
  const activity = Number(p.activity) || 1.55;
  const goal = p.goal || 'recomp';

  const bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * activity;
  const offset = goal === 'cut' ? -500 : goal === 'recomp' ? -250 : goal === 'bulk' ? 300 : 0;
  const kcal = Math.round((tdee + offset) / 10) * 10;

  const proteinPerKg = Number(p.proteinPerKg) || (goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : goal === 'recomp' ? 2.0 : 1.6);
  const fatPerKg = Number(p.fatPerKg) || 0.85;
  const meals = Math.min(6, Math.max(2, Math.round(Number(p.meals) || 4)));
  const protein = Math.round(w * proteinPerKg);
  const fat = Math.round(w * fatPerKg);
  const carbs = Math.max(70, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fibre = Math.round(kcal / 100);
  const water = Math.round(Math.min(4.2, Math.max(2.2, w * 0.04)) * 10) / 10;

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, carbs, fat, fibre, water, goal, meals };
}

function assert(condition, message) {
  if (!condition) throw new Error('FAIL: ' + message);
  console.log('  ✔ ' + message);
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error('  ✗ ' + name + ' — ' + e.message);
  }
}

test('male recomp: BMR/TDEE/kcal match hand calculation', () => {
  const g = goalsFor({ age: 20, height: 175, weight: 75, sex: 'male', activity: 1.55, goal: 'recomp' });
  // BMR = 10*75 + 6.25*175 - 5*20 + 5 = 1748.75 → 1749
  assert(g.bmr === 1749, `BMR should be 1749, got ${g.bmr}`);
  // TDEE = 1748.75 * 1.55 = 2710.56 → 2711
  assert(g.tdee === 2711, `TDEE should be 2711, got ${g.tdee}`);
  // kcal = round((2710.56 - 250) / 10) * 10 = 2460
  assert(g.kcal === 2460, `kcal should be 2460, got ${g.kcal}`);
  assert(g.goal === 'recomp', 'goal should be recomp');
  assert(g.meals === 4, 'default meals should be 4');
});

test('female cut: BMR uses -161 female offset', () => {
  const g = goalsFor({ age: 25, height: 160, weight: 60, sex: 'female', activity: 1.375, goal: 'cut' });
  // BMR = 10*60 + 6.25*160 - 5*25 - 161 = 1314
  assert(g.bmr === 1314, `BMR should be 1314, got ${g.bmr}`);
  // TDEE = 1314 * 1.375 = 1806.75 → 1807
  assert(g.tdee === 1807, `TDEE should be 1807, got ${g.tdee}`);
  // kcal = round((1806.75 - 500) / 10) * 10 = 1310
  assert(g.kcal === 1310, `kcal should be 1310, got ${g.kcal}`);
});

test('bulk goal adds +300 offset', () => {
  const g = goalsFor({ age: 30, height: 180, weight: 80, sex: 'male', activity: 1.55, goal: 'bulk' });
  const bmr = Math.round(10 * 80 + 6.25 * 180 - 5 * 30 + 5); // 1750
  const tdee = Math.round(bmr * 1.55); // 2713
  const expectedKcal = Math.round((tdee + 300) / 10) * 10;
  assert(g.kcal === expectedKcal, `bulk kcal should be ${expectedKcal}, got ${g.kcal}`);
});

test('protein scales with weight and goal', () => {
  const cut = goalsFor({ weight: 70, goal: 'cut' });
  const recomp = goalsFor({ weight: 70, goal: 'recomp' });
  const bulk = goalsFor({ weight: 70, goal: 'bulk' });
  assert(cut.protein > recomp.protein, 'cut protein should exceed recomp (2.2 vs 2.0 g/kg)');
  assert(recomp.protein > bulk.protein, 'recomp protein should exceed bulk (2.0 vs 1.8 g/kg)');
});

test('carbs never drop below 70g floor', () => {
  const g = goalsFor({ weight: 50, height: 150, age: 60, sex: 'female', activity: 1.2, goal: 'cut' });
  assert(g.carbs >= 70, `carbs floor should be 70, got ${g.carbs}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);