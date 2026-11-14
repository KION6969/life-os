# Life OS

A local-first life dashboard: timetable, nutrition, training, study and targets, wrapped in a calm cyber interface. Works as a website and as an installable PWA. Fully static — no backend required.

## Deploy to Vercel

Live at: **https://lifeos-deploy5-9d6q18foh-kion6969s-projects.vercel.app**

To redeploy:
1. Install the Vercel CLI: `npm i -g vercel`
2. From the `life-os/` folder: `vercel --prod --yes`
3. Or connect this repo in the Vercel dashboard — set the Root Directory to `life-os`.

## Run locally

```powershell
.\start-life-os.ps1
```

Serves `life-os/` on the first free port from 4190, opens an app window, and proxies the AI Chef to a local router.

## Files
See `life-os/README.md`.
