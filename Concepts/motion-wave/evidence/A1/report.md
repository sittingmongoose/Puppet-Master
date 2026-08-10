# A1 — W1 Motion Token Layer + Hygiene

Workstream: W1 (motion token layer + hygiene). Base edited ONLY:
`Concepts/pm7-tools/base/PM7-base.html`. Build output regenerated:
`Concepts/PMConcept7.html` (never hand-edited).

## New BASE_SHA
`ccf9ffa8bebddfebc6e07276f15606aced0b9a2d9552ee353e03e08901ae47ee`
(was `1461fd3cc4fb687791da6e94c8dde8d36b71ab7954b1f7db5762270add22bbdc`)
Re-pinned in `Concepts/pm7-tools/build_pm7.py` line 45.

## Changes (by selector / anchor)
- `:root` token block (after `--ease-snap` line): added `--ease-settle`,
  `--ease-pop`, `--ease-antic`, `--pm-travel:10px`, `--pm-stagger:26ms`,
  `--pm-row-step:22ms`, `--ab-hover-scale:1.09`, `--ab-press-scale:.9`.
- 8 `[data-theme...]` blocks overriding `--ease-default` — added 5 personality
  knobs each (`--pm-travel/--pm-stagger/--pm-row-step/--ease-settle/--ab-hover-scale`):
  - retro-dark/light: 4px / 12ms / 10ms / cubic-bezier(.3,1.14,.38,1) / 1.04
  - basic-light/dark: 8px / 22ms / 18ms / cubic-bezier(.26,1.4,.36,1) / 1.08 (full lively personality)
  - glass-dark/light: 14px / 30ms / 24ms / cubic-bezier(.24,1.34,.4,1) / 1.1
  - friendly-dark/light: 12px / 34ms / 26ms / cubic-bezier(.22,1.68,.36,1) / 1.14
- `.activity-bar { transition: width 0.2s ease }` -> `width var(--motion-fast) var(--ease-out)`
- `.side-panel-slot { transition: width 0.3s ease }` -> `width var(--motion-med) var(--ease-out)`
- `.pm6-dot-run { ... pm6-panels-pulse 1.4s ease-in-out }` -> `1.4s var(--ease-out)`
- Deleted dead `@keyframes fmPaneIn` + redundant `[data-pane]...:nth-child(4){animation-delay:.15s}`
  + its orphaned `/* active-pane entrance */` banner. Live `shPaneIn` ladder
  (nth-child 2/3/n+4) kept for A4.

## Build gates (python3 Concepts/pm7-tools/build_pm7.py --out Concepts/PMConcept7.html)
brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS.
Pin assertion held (no --allow-new-base needed).

## Grep verification (built PMConcept7.html)
- `--ease-settle`, `--pm-travel`, `--ab-hover-scale`: present (root + 8 themes).
- `@keyframes fmPaneIn`: GONE. Redundant `nth-child(4){animation-delay}`: GONE.
- Old stragglers (`width 0.2s ease`, `width 0.3s ease`, `pm6-panels-pulse 1.4s ease-in-out`): GONE.
- NOTE: bare string `fmPaneIn` still appears once, but ONLY inside the lineage
  comment of the LIVE shPaneIn block ("ported fmPaneIn pattern"), which the spec
  said to keep. The dead keyframes definition itself is removed.

## Browser smoke (standalone Playwright, http.server :8792)
- title "Puppet Master - Dashboard": PASS
- computed `--pm-travel`: friendly-dark=12px, retro-light=4px, basic-light=8px,
  glass-dark=14px: all PASS
- console errors: 0; page errors: 0; failed requests: 0 (no new errors vs favicon-404 baseline)
- screenshots: render-friendly-dark.png, render-retro-light.png

## Deviations
None on values. Two judgment calls: (1) also removed the orphaned
`/* active-pane entrance */` banner that labelled the deleted fmPaneIn block
(dead-code hygiene); (2) did not tokenize the two `pm6-chat-pulse ... ease-in-out`
rules — they are chat scope, outside W1 and on the do-not-touch list.
