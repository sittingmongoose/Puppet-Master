# Settings managers, rethought (Fable 5.2)

A concept that redesigns every manager of the Settings page of `Concepts/PMConcept7.html` for a complete newcomer,
without dropping a feature. It does not change PMConcept7: `index.html` frames the real page and adds a layer on top
of its Settings, so every row, action and guided flow you use here is PMConcept7's own.

## Open it

- `index.html` (needs `../../PMConcept7.html` beside it, as in this repository), or
- one file that needs nothing else: `python3 tools/build_standalone.py <out-folder>` writes `settings-managers.html`.

The strip at the top is for review: **Redesign / Today** (keys R and T) shows the same place in both, **What changed
here** says what was wrong on that page and what the redesign does, **Everything that moved** lists where each of the
1,010 settings went, and you can change the look, the window width and reduced motion.

## What is in it

| Chapter | State |
|---|---|
| Settings Home | Done |
| AI providers (accounts, models, limits, spending) | Done |
| Computers & remote access (computers, devices, away from home, where work runs, where projects are kept) | Done |
| Look & feel (looks, accent, wallpaper beside a live example; editor and terminal look) | Done |
| The four Customize dialogs (Editor, Terminal, Pip, NieR): example stays in view and shows each change | Done |
| Memory & helpers; Planning & goals | Built by a Fable 5.2 builder (see `AUTHORS.md`) |
| Source control; Backups & history | Built by a Fable 5.2 builder |
| Safety & permissions; Health & updates | Built by a Fable 5.2 builder |
| Chat & assistant; Notifications & sounds; Code & tools; Web, media and Back Seat Driver | Planned: every setting is in its new place; lists and guided steps still open in today's manager from a button on the page |

## How it is made

- `layer/smx-core.js` the page framework (routes, drawing, borrowing PMConcept7's menus), `smx-parts.js` the parts
  pages are made of, `smx-ia.js` the chapters and data readers, `smx-plan.js` where every setting goes.
- `layer/pages/*.js` one file per chapter (with its stylesheet beside it). `AUTHORS.md` is the contract for writing one.
- `layer/smx-customizers.*` the Customize dialogs. `layer/smx-boot.js` starts it inside PMConcept7.
- Rules followed: only the app's own colour tokens, so all ten looks work; no pills, no one-sided stripes, no emoji;
  text at least 11 px; layout answers to the width of the Settings area, not the window.

## Checks

`{"do":"coverage"}` in the driver (see `AUTHORS.md`) reports that every setting has a place, none is placed twice, and
none is planned on a page that fails to draw it. The review of today's Settings, the audits and the defect list are in
the share folder `puppet-master/2026-11-11-settings-managers/`.
