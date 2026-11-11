# Life OS

A local-first life dashboard: timetable, nutrition, training, study and targets, wrapped in a calm cyber interface. Works as a website and as an installable PWA.

## Launch

From the project root:

```powershell
.\start-life-os.ps1
```

The launcher serves `life-os\` on the first free port from **4190**, opens an app-style Edge/Chrome window, and proxies the AI Chef to the local FreeLLMAPI router.

Options:

```powershell
.\start-life-os.ps1 -Port 4300        # pick a starting port
.\start-life-os.ps1 -NoBrowser        # server only
.\start-life-os.ps1 -Model claude-haiku-4-5
.\start-life-os.ps1 -Lan              # expose on the LAN (no auth - trusted networks only)
```

Stop with `Ctrl+C`.

## Editing the app

Nothing is fixed in the UI:

- **Timetable** — Home → **Edit** opens the schedule editor. Add a block (name, start, end, category), tap a row to edit it, use the bin to delete, or **Reset default** to restore the built-in day.
- **Food** — every meal is yours: **Log a meal** accepts any name and macros, and each logged meal has a delete button. Water is tracked with +250 / +500 ml buttons.
- **AI Chef preferences** — open the chef and set your **diet** (omnivore / vegetarian / vegetarian + eggs / vegan / pescatarian), **cuisine**, the **ingredients you actually have**, and anything to **avoid**. These are saved on the device and sent to the router; the local ranking filters and scores meals by the same rules, so it still respects your diet when the router is offline.
- **Profile** — height, weight, age, sex, activity, goal, diet, cuisine, protein g/kg, fat g/kg and meals/day. Changing any of them recalculates BMR, TDEE, calories, protein, carbs, fat, fibre, water and the per-meal target instantly across the app.

## Nutrition model

BMR uses Mifflin-St Jeor, TDEE applies the activity multiplier, then the goal offset (cut −500, recomp −350, bulk +300). Protein and fat are set per kilogram of body weight, and carbohydrates fill the remaining calories. The per-meal target is the daily target divided by meals/day.

## Screens

| Screen | What it does |
| --- | --- |
| **Home** | Greeting, live/next schedule block, daily score ring, calorie/protein/study/water meters, protocol timeline, habits, 7-day momentum |
| **Food** | Macro ring and bars, remaining kcal/protein/carbs/fat/fibre, water tracking, meal log by category, AI Chef suggestions |
| **Gym** | Six-day split (push / pull / legs / upper / lower / conditioning / recovery), exercise accordion, live workout overlay with set logging, rest countdown, session history |
| **Study** | Focus 25 / Deep 50 / Break 5 timer with ring, minute logging, task queue, 7-day chart and all-time stats |
| **Profile** | Identity, metrics, BMR/TDEE via Mifflin-St Jeor, macro targets, accent + motion preferences, export / import / reset, storage usage, PWA install |

## AI Chef

`start-life-os.ps1` exposes `POST /api/chef` and forwards the request to `http://127.0.0.1:31415/v1/chat/completions` using the best available model (default failover: `claude-haiku-4-5` → `claude-opus-4-5` → `nemotron-3-ultra-550b`). The prompt includes the person's diet, cuisine, pantry list, dislikes, remaining macros and per-meal target, and the server rejects placeholder replies. The browser always renders a local rule-based ranking first, then upgrades it when the router answers. If the router is down, the local ranking stays and nothing breaks.

## Data

Everything is stored in `localStorage` under `lifeos.v1` on this browser only. Use **Profile → Export snapshot** before clearing site data. Import restores a snapshot; reset erases everything.

## Files

```
life-os/
  index.html            app shell, screens, modals, icon sprite
  styles.css            cyber design system + responsive layout
  js/core.js            storage, derived targets, home, navigation
  js/food.js            macros, meals, water, AI Chef
  js/gym.js             split, plans, live workout
  js/study.js           timer, tasks, charts
  js/profile.js         profile form, energy model, data tools
  js/schedule.js        editable timetable (add / edit / delete / reset)
  js/init.js            boot, routing, palette, particles, PWA
  manifest.webmanifest  PWA manifest
  sw.js                 offline app shell
  icon.svg / -192 / -512
start-life-os.ps1       static server + chef proxy + app window
```

## Notes

- The service worker caches the app shell. Bump `VERSION` in `sw.js` when shipping JS/CSS changes so installed copies refresh.
- Fonts load from Google Fonts; without a network the system font stack is used and everything else still works.
- Free router models are occasionally rate limited. The Chef degrades to the local ranking rather than showing an error.
