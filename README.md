# Workout Board

A workout log you install on your phone's home screen. Static files only — no server,
no build step, no account. Everything is saved in the browser as you type.

Live at **https://lively-duckanoo-37ca31.netlify.app** — pushes to `main` deploy automatically.

## What it does

- **Muscle heatmap** — everything you log heats the muscles it works, then decays back to
  cold over 8 days. Tap a muscle for drills filtered to the equipment you own.
- **Aerobic engine** — run and bike sessions feed a separate gauge that decays over 12 days.
- **Your workouts, your structure** — starts with three full-body days, but rename them,
  reorder them, add more, delete them. Tabs are whatever you call them.
- **Tick to log** — tap the circle and the exercise counts as done at its planned sets.
  Weight and reps are there under "Add weight and reps" when you want them, out of the
  way when you do not.
- **Add exercises from a searchable library** — filtered to your equipment, and it brings
  the sets, reps and muscle map with it. Or type any name and add it as your own.
- **Cardio log**, **history**, **equipment loadout**, **operator status** (rank, level,
  weekly ops against a target of 4).
- **Coach** — reads the live board (coldest muscles, what is still recovering, which day
  covers the gaps best, engine, your stated goal) and writes a short brief.

## Putting it on your home screen

Open the site in **Safari on the iPhone** → Share → **Add to Home Screen**. It launches
full screen with no browser chrome, and the service worker means it opens and works with
no signal.

## Memory

Saved to `localStorage` under `wazeer.readiness.v1`, written through on every change.
It survives closing the app, restarting the phone and going offline.

It is tied to the origin, so it does **not** cross devices, and it does not follow the app
to a different URL. Clearing site data wipes it. Gear tab → **Export backup** writes a JSON
file; **Import backup** loads it on another device.

If the browser blocks site storage, a red banner says so rather than silently losing the log.

## Deploying a change

Push to `main`. Netlify redeploys, and the app picks it up on the **next** launch — the
service worker serves the cached copy first, then refreshes in the background.

**Bump `VERSION` in `sw.js` whenever `index.html` changes.** Without that the old shell can
survive an extra load.

## The heat maths

`DECAY_STR = 8` days, `DECAY_CARD = 12` days, `SET_UNIT = 0.11`.

For each worked set inside the strength window, a muscle gains
`muscleWeight × SET_UNIT × workedSets × max(0, 1 − daysAgo / DECAY_STR)`, capped at 1.
Cardio adds `0.5 × (minutes / 40) × intensity × recency` to the engine (Easy 1, Tempo 1.2,
Hard 1.4) and bleeds a smaller share into the leg muscles.

## Layout

    index.html              the whole app
    sw.js                   offline cache — bump VERSION when index.html changes
    manifest.webmanifest    install metadata
    netlify.toml            publish root, no build, no-cache on sw.js and index.html
    icon.svg                source for the icons
    icon-*.png, apple-touch-icon.png
    dev/engine.js           pure logic extracted from index.html, for the tests
    dev/test-engine.mjs     node dev/test-engine.mjs

`index.html` is the source of truth. If you change the maths in it, re-extract
`dev/engine.js` before running the tests.

## Credit

Anatomy polygons are the MIT-licensed [react-body-highlighter](https://github.com/GV79/react-body-highlighter)
muscle map by GV79.
