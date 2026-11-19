# Contributing to Life OS

Thanks for your interest! Life OS is a local-first life dashboard: timetable, nutrition, training, study and targets. Works as a website and as an installable PWA.

## How to contribute

1. **Fork the repo** and create a branch from `main`.
2. **Make your change** — UI, energy model, storage, or docs.
3. **Run the tests** — `npm test` runs the energy model test suite (`test/energy.test.js`).
4. **Validate JavaScript** — all files in `js/` must pass `node --check`.
5. **Commit with a clear message** — e.g. `feat: add water tracking to home screen`.
6. **Open a pull request** — describe what changed and why.

## Architecture notes

- Everything is vanilla JavaScript — no build step, no framework
- Data lives in `localStorage` under `lifeos.v1`
- The service worker (`sw.js`) caches the app shell for offline use
- The AI Chef proxy is network-only; local ranking degrades gracefully

## License

MIT © KION6969