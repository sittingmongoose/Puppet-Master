# Native OS Menu Audit — PMConcept6 / PMConcept7

This is a complete catalogue of every place the current concept uses **native OS-level menus** (`<select>`, `<dialog>`, native `confirm()`/`prompt()`/`alert()`, and native `oncontextmenu`). Per the design rule, all of these must be replaced with the Puppet Master custom "sprout" popout menu (`.pm6-tb-menu-wrap` + `PM6_SPROUT` engine).

The redesign prototype (`pm7-panel-protos/`) already replaces the ones in scope (the redesigned panels + shell). The rest are listed here for the real build pass.

## Scope notes

- **Already migrated (before this work):** the title-bar **Theme** selector. It was a `<select class="theme-select" id="themeSelect">` and is now the `#themeMenuWrap` sprout menu (`11-html-shell-open.part.html`, wired in `29x-pm6-js-panels.part.html wireTheme()`). Survives only in `_bak_pre_*` backups.
- **Replaced inside the prototype** (`pm7-panel-protos/`): Search scope, Source branch, Docker view selector (where applicable), and the file-tree context menu — all use sprout menus.

## Audit table

Source files are under `Concepts/pm6-build/parts/`. Line numbers are from those part files (the build artifacts `PMConcept6.html`/`PMConcept7.html` are generated — edit parts, not artifacts).

| # | File | Line(s) | Element / call | Current | Replacement |
|---|------|---------|----------------|---------|-------------|
| 1 | `12-html-side-panels.part.html` | 114–119 | `<select class="...pm6-search-scope">` (All Files / Open Files / src/ only / web/ only) | native `<select>` | **Sprout menu** `data-select="single"` — the "All Files" scope picker. *(Done in prototype.)* |
| 2 | `12-html-side-panels.part.html` | 176 | `<select id="pm6RunConfig">` (Run & Debug config) | native `<select>` | Sprout menu — run configuration picker. |
| 3 | `12-html-side-panels.part.html` | 232–238 | `<select onchange="cmd.git.switch_branch">` (Source Control branch) | native `<select>` | **Sprout menu** — branch switcher. *(Done in prototype.)* |
| 4 | `12-html-side-panels.part.html` | 29 | `oncontextmenu="...showFileContextMenu(event)"` on `.file-tree` | native contextmenu | Custom PM context menu (sprout variant anchored to cursor). The demo already has a `.context-menu-mock` (lines 58–74) but it's triggered by the native `oncontextmenu`. Route the native event to `preventDefault()` + open a PM sprout menu at cursor. *(Done in prototype.)* |
| 5 | `15-page-projects.part.html` | 13 | `<select id="projectsSortBy">` | native `<select>` | Sprout menu — sort picker. |
| 6 | `15-page-projects.part.html` | 19 | `<select id="projectsFilterLang">` | native `<select>` | Sprout menu — language filter. |
| 7 | `15-page-projects.part.html` | 30 | `<select id="projectsFilterStatus">` | native `<select>` | Sprout menu — status filter. |
| 8 | `17-page-orchestrator.part.html` | 215 | `<select class="pm6-orch-select" id="pm6OrchEvFamily">` | native `<select>` | Sprout menu — artifact-family filter. |
| 9 | `17-page-orchestrator.part.html` | 280 | `<select class="pm6-orch-select" id="pm6OrchLedgerFilter">` | native `<select>` | Sprout menu — ledger event-family filter. |
| 10 | `18-page-usage.part.html` | 345 | `<select class="pm6-usage-sel" id="pm6UsageLedgerPlat">` | native `<select>` | Sprout menu — platform filter. |
| 11 | `18-page-usage.part.html` | 346–353 | `<select class="pm6-usage-sel" id="pm6UsageLedgerType">` | native `<select>` | Sprout menu — event-type filter. |
| 12 | `18-page-usage.part.html` | 354 | `<select class="pm6-usage-sel" id="pm6UsageLedgerRep">` | native `<select>` | Sprout menu — reporting-state filter. |
| 13 | `25-js-terminal-demo.part.html` | 235 | JS-built `'<select ...>'` string | native `<select>` injected at runtime | Sprout menu built from the same data — replace the string template with sprout-menu markup. |
| 14 | `24-js-main.part.html` | 905 | `if (!confirm('Terminate session? …'))` | native `confirm()` | PM confirmation dialog (a sprout-menu variant or a small modal component). |
| 15 | `24-js-main.part.html` | 1244 | `pill.oncontextmenu = function(ev){…}` | native contextmenu on workgroup pill | PM context menu (sprout). |
| 16 | `24-js-main.part.html` | 1250 | `var n = prompt('Workgroup name', gg.title)` | native `prompt()` | PM inline-rename / modal text input. |
| 17 | `24-js-main.part.html` | 1310 | `if (confirm('Close this workgroup…'))` | native `confirm()` | PM confirmation dialog. |
| 18 | `24-js-main.part.html` | 1354 | `sb.oncontextmenu = function(ev){…}` | native contextmenu on terminal pill | PM context menu (sprout). |
| 19 | `24-js-main.part.html` | 1360 | `var n = prompt('Terminal label', …)` | native `prompt()` | PM inline-rename / modal text input. |

## Replacement patterns

### Single-select `<select>` → sprout menu
Wrap in a `.pm6-tb-menu-wrap[data-select="single"]`, emit a trigger button + `.pm6-tb-menu` of `.pm6-tb-menu-item`s carrying `data-value`. The `PM6_SPROUT`/`tbMenuOpen` helpers + click delegation already handle open/close, selection highlight, and click-away. See `Concepts/pm6-build/parts/29x-pm6-js-panels.part.html wireTheme()` (lines ~828–866) and `wireProjectMenu()` (~868) for the canonical wiring.

### Native `confirm()` → PM confirmation
Build a small confirmation surface (a centered modal or a sprout-menu-style card) with explicit allowed/denied actions. Per `Plans/FinalGUISpec.md` action-surface policy: destructive/bulk actions pick `light`/`strong`/`hard_gate` confirmation; `hard_gate` must show why the gate exists + exact consequence of each allowed action.

### Native `prompt()` → PM text input
Use an inline-rename field or a small modal with a `<input>` + OK/Cancel. Never the browser `prompt()`.

### Native `oncontextmenu` → PM context menu
`event.preventDefault()` on the native contextmenu, then open a PM sprout menu anchored to `event.clientX/clientY`. The `setPopoutSprout()` logic already pins the grow origin to the nearest corner; for cursor-anchored menus, position the wrap absolutely at the cursor and let the sprout engine handle the animation.

## Notes for the real build

- These are all source-of-truth edits in `Concepts/pm6-build/parts/*.part.html` — NOT in the assembled `PMConcept*.html` (those are build artifacts).
- After editing parts, run `Concepts/pm6-build/assemble.py` then `Concepts/pm7-tools/build_pm7.py` to regenerate.
- The sprout engine and CSS are already present app-wide (`10x-pm6-css-chat.part.html` lines 76–176, `29x-pm6-js-panels.part.html`, `29x-pm6-js-chat.part.html PM6_SPROUT`), so no new infrastructure is needed — just markup swaps + a `wireXxxMenu()` per menu.
