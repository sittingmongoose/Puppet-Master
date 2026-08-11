# Usage-Concept File / Role Inventory

Scope: `Concepts/usage-concepts/` and `_shared/`. Generated Jul 2026.
Method: `ls` sizes + `wc -l`, importers derived by grepping `<link>/<script>` tags in every HTML file.

## 1. Concept pages (HTML)

| File | Lines | Bytes | Role | Imports from `_shared/` |
|---|---:|---:|---|---|
| `index.html` | 387 | 29,696 | Hub/launcher page linking to all concepts; standalone chrome only | base.css, themes.css, icons.js, menu.js, usage-icons.js |
| `u1-signal.html` | 1056 | 87,891 | **U1 Signal — FROZEN (rejected)** | base.css, themes.css, usage-shared.css, icons.js, menu.js, usage-icons.js, usage-data.js, usage-chrome.js |
| `u2-stream.html` | 914 | 77,082 | **U2 Stream — FROZEN (rejected)** | base.css, themes.css, usage-shared.css, icons.js, menu.js, usage-icons.js, usage-data.js, usage-chrome.js |
| `u3-cockpit.html` | 1051 | 75,061 | U3 Cockpit | base.css, themes.css, usage-shared.css, usage-context.css, icons.js, menu.js, usage-icons.js, usage-data.js, usage-chrome.js, usage-context.js |
| `u4-focus.html` | 1228 | 92,069 | U4 Focus | same set as U3 |
| `u5-cozy-console.html` | 844 | 61,500 | U5 Cozy Console | same set as U3 |
| `u6-workspace.html` | 1099 | 86,887 | U6 Workspace | same set as U3 |
| `u7-board.html` | 1385 | 90,941 | U7 Board | same set as U3 |
| `u8-canvas.html` | 1179 | 88,004 | U8 Canvas | same set as U3 |
| `u9-deck.html` | 104 | 9,546 | U9 Deck — thin wrapper over the tabs+widgets system | same set as U3 **+** usage-tabs.css, usage-tabs.js, usage-widgets.css, usage-widgets.js |

## 2. Shared infrastructure (`_shared/`)

| File | Lines | Bytes | Role | Used by |
|---|---:|---:|---|---|
| `base.css` | 786 | 44,775 | Core app-shell chrome: title bar, status bar, sprout-menu chrome, buttons/chips/inputs, glass-bg, skeleton/hovergraph visuals, accordion, shimmer keyframes | **index, U1–U9 (ALL 10)** |
| `themes.css` | 514 | 19,337 | All theme families (glass/basic/retro/friendly + variants), elevation tokens, scrollbar hooks, prefers-reduced-motion block | **ALL 10** |
| `icons.js` | 82 | 9,353 | Shared stroke-SVG icon set (`window.PMIcons`); F3-417 no-emoji contract | **ALL 10** |
| `menu.js` | 154 | 6,918 | Sprout-menu behavior contract: click-open, Esc/outside close, mutual exclusion, viewport clamping (ACD-439/441/442, F3-424 PopupWindow mapping) | **ALL 10** |
| `usage-icons.js` | 62 | 7,139 | Usage-page glyphs extending `PMIcons` | **index, U1–U9 (ALL 10)** |
| `usage-shared.css` | 299 | 25,060 | Shared Usage layout: responsive column grid (`.us-cols`), sections, table, meters, value-state vocab, scrollbar styling, sprout, tooltips, cozy bg | **U1–U9 (not index)** |
| `usage-data.js` | 445 | 40,345 | Canonical dense dataset `window.USAGE` + formatters `USfmt`/`USvs` (UF-002..UF-089); drives every concept | **U1–U9** |
| `usage-chrome.js` | 222 | 12,332 | Usage app shell: title bar + page tabs + status-bar fit harness + theme sprout menu; persists theme to `localStorage`; `postMessage` cross-window sync | **U1–U9** |
| `usage-context.css` | 42 | 5,793 | Context ring + details sprout + message-detail modal chrome | U3–U9 |
| `usage-context.js` | 124 | 10,735 | Behavior for the ring/details sprouts and modal | U3–U9 |
| `usage-tabs.css` | 19 | 2,816 | Animated tab strip + ink indicator + panel in/out keyframes | **U9 only** |
| `usage-tabs.js` | 169 | 8,582 | Tab logic: rAF spring ink, pointer magnify, MutationObserver resync, panel transitions | **U9 only** |
| `usage-widgets.css` | 41 | 5,665 | Widget canvas grid + focus-mode fixed overlay | **U9 only** |
| `usage-widgets.js` | 205 | 15,639 | Draggable/resizable widget canvas: FLIP via getBoundingClientRect, pointer drag/resize, focus mode, `localStorage` persistence | **U9 only** |

Counts: **10 HTML pages + 14 shared files = 24 files** (README.md / FINDINGS.md / research/ / verification/ are not prototypes).

## 3. U1/U2 blast radius (FROZEN but live)

U1/U2 import exactly these 8 shared files. **Any edit to these can change frozen, rejected concepts:**

1. `base.css` — highest risk: holds shell chrome **and** the `:has()` running-row tint, shimmer, sprout transforms used everywhere.
2. `themes.css` — token changes re-skin U1/U2.
3. `usage-shared.css` — layout primitives (`.us-cols`, `.us-scroll`, value-states) are shared with U1/U2.
4. `usage-data.js` — data-shape changes break U1/U2 renderers.
5. `usage-chrome.js` — shell behavior (theme, harness) shared with U1/U2.
6. `icons.js`, 7. `usage-icons.js`, 8. `menu.js` — icon/behavior contract shared with U1/U2.

**Safe to evolve without touching U1/U2:** `usage-context.{css,js}` (U3–U9) and `usage-tabs.{css,js}` / `usage-widgets.{css,js}` (U9 only) — none are imported by U1/U2.

Implication: Slint-portability rework that must alter `base.css` / `usage-shared.css` semantics (e.g. replacing `:has()`, grid, transforms) is **not** U1/U2-neutral and needs explicit sign-off or a fork.
