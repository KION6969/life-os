# Life OS

A local-first life dashboard: timetable, nutrition, training, study and targets, wrapped in a calm cyber interface. Works as a website and as an installable PWA. Fully static — no backend required.

## Deploy to Vercel

1. Install the Vercel CLI: `npm i -g vercel`
2. From the project root: `vercel` (first run links the project; subsequent runs deploy).
3. Or connect this repo in the Vercel dashboard — Vercel will serve the `life-os/` folder. Set the **Root Directory** to `life-os` (or move its contents to the repo root).

The app is 100% client-side: all data lives in the visitor's `localStorage`. There is no server to run.

## Run locally

```powershell
.\start-life-os.ps1
```

Serves `life-os/` on the first free port from 4190, opens an app window, and proxies the AI Chef to a local router.

## Files
See `life-os/README.md`.
