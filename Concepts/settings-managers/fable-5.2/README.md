# Settings managers, rethought (Fable 5.2)

A concept that redesigns every manager of the Settings page of `Concepts/PMConcept7.html` for a complete newcomer,
without dropping a feature. It does not change PMConcept7: `index.html` frames the real page and adds a layer on top
of its Settings, so every row, action and guided flow you use here is PMConcept7's own.

## Open it

- `index.html` (needs `../../PMConcept7.html` beside it, as in this repository), or
- one file that needs nothing else: `python3 tools/build_standalone.py <out-folder>` writes `settings-managers.html`.

The strip at the top is for review: **Redesign / Today** (keys R and T) shows the same place in both, **What changed
here** says what was wrong on that page and what the redesign does, **Everything that moved** lists where each of the
1,014 settings went, and you can change the look, the window width and reduced motion.

## What is in it

Every chapter of Settings is rebuilt: 132 pages, none left in its planned form.

| Chapter | Pages | Made by |
|---|---|---|
| Settings Home | what works, what needs you, what people come here to do | Fable 5.2 (lead) |
| AI providers | providers, accounts, which model does what, limits, spending | Fable 5.2 (lead) |
| AI providers: web research, pictures voice & video, Back Seat Driver | a page per ability and per search service | Fable 5.2 builder |
| Computers & remote access | computers, devices, away from home, where work runs, where projects are kept | Fable 5.2 (lead) |
| Look & feel | looks, accent and wallpaper beside a live example; text & motion; window; editor and terminal look | Fable 5.2 (lead) |
| The four Customize dialogs (Editor, Terminal, Pip, NieR) | the example stays in view and a line says what each change did | Fable 5.2 (lead) |
| Chat & assistant; Notifications & sounds | every alert in one table; a page per destination, sound and alert | Fable 5.2 builder |
| Memory & helpers; Planning & goals | memories, personas, crews, helpers; plans, goals, templates | Fable 5.2 builder |
| Code & tools | editor, terminal, language help, skills, plugins, connections, shortcuts, commands | Fable 5.2 builder |
| Code & tools: testing, debugging, built-in browser, containers, publishing | | Fable 5.2 builder |
| Source control; Backups & history | services, repositories, rules, checks; backups, restore, history, how long things are kept | Fable 5.2 builder |
| Safety & permissions; Health & updates | profiles, rules, asking, limits, protected; checkup, updates, setup, every setting as a list | Fable 5.2 builder |

Only Fable 5.2 designed or wrote pages. Other models read, audited and reviewed (`AUTHORS.md` says who did what).

## How it is made

- `layer/smx-core.js` the page framework (routes, drawing, borrowing PMConcept7's menus), `smx-parts.js` the parts
  pages are made of, `smx-ia.js` the chapters and data readers, `smx-plan.js` where every setting goes,
  `smx-words.js` the words pass (rows reworded for a newcomer; ids, values and controls unchanged).
- `layer/pages/*.js` one file per chapter (with its stylesheet beside it). `AUTHORS.md` is the contract for writing one.
- `layer/smx-customizers.*` the Customize dialogs. `layer/smx-boot.js` starts it inside PMConcept7.
- `layer/smx-details.js` the "About" panel of a setting (what it does, your choices, the way back to the default).
  The panel is PMConcept7's own; these pages lend its engine a place to draw it, so the button at the end of every
  row works here and the panel keeps whatever PMConcept7 gives it (its model picker came with it).
- Rules followed: only the app's own colour tokens, so all ten looks work; no pills, no one-sided stripes, no emoji;
  text at least 11 px; layout answers to the width of the Settings area, not the window.

## Checks

- **Settings.** The redesign places 1,014 settings: the 999 in PMConcept7's own list of settings and 15 that it draws
  by hand outside that list. `{"do":"coverage"}` in the driver (see `AUTHORS.md`) reports that each has one place,
  none is placed twice, and none is planned on a page that fails to draw it. This proves setting rows only.
- **Everything that is not a row** (lists, menus, guided steps, 429 distinct actions on 3,084 controls) was compared
  feature by feature with a census of PMConcept7; the result is in the share folder.
- **What must stay true**: `browser-check run Concepts/settings-managers/fable-5.2/tools --set page=<out>/settings-managers-app.html`
  (add `--set host=<out>/settings-managers.html` for the review page) runs 14 tests: coverage, every page draws, the
  examples stay in view, a borrowed menu belongs to its thing, the page stays put after a menu or a saved dialog, what
  needs you is counted one way, a provider and its accounts tell one story, panels close, Escape works, a look chosen
  in the strip is saved, 780 and 860 wide no page scrolls sideways and every control is named by its label, and a
  row's "About" opens PMConcept7's own panel here (choose in it, go back to the default, Escape from anywhere).

The review of today's Settings, the audits, the defect list and the list of what is still open are in the share
folder `puppet-master/2026-11-11-settings-managers/`.
