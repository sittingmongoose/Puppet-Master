# Coverage — W1 runtime glyph census of PMConcept7.html

Date: 2026-10-10. Page served over http from the `Concepts` folder, driven in one headless Chrome
(`agent-browser`, CDP + Playwright). Read-only on the repository; every artifact lives in this folder.

## Look used

**Basic light.** Set after load with `window.PM_THEME.setFamily('basic', {persist:false})` and
`window.PM_THEME.setMode('light', {persist:false})`; `data-theme="basic-light"` confirmed on `<html>`
before every pass and re-asserted after the theme menu and onboarding walks. The census is of shapes,
not colours. The onboarding window reported `family=basic mode=light` throughout its walk.

## What a row is

`census.csv` has one row per distinct **(surface, context, geometry)** combination; `count` holds the
instances of that combination seen on that surface. `shapes.csv` has one row per distinct
`geometry_hash` across all surfaces (344 shapes; svg inner markup normalized by collapsing whitespace
and dropping `class`/`style`/`id`; text symbols are hashed as `U+XXXX`). Wizard and Orchestrator were
censused distinct-geometry-only per the spec (surface `wizard` / `orchestrator`), everything else was
censused in full.

## Totals

- 1,163 census rows over 49 surface values; 2,568 icon instances seen.
- 344 distinct shapes.
- Kinds: svg 1,000 rows · img 71 · brand 41 · text-symbol 50 · css-bg 1 · pseudo 0 (see gaps).
- 76 rows are status marks (`is_status=yes`), 71 of them with a state word; 1,130 of 1,163 rows have a
  cropped screenshot in `shots/` (named `<id>.png`).
- Conflicts: 3 shapes with two or more status meanings/states, 7 states drawn by two or more shapes
  (`status-conflicts.md`).

## Surfaces reached, and how

| Surface | Rows | How it was reached |
|---|---|---|
| topbar | 4 | always visible after load (`header.title-bar`) |
| statusbar | 2 | always visible (`#pm7GlobalStatusBar`) |
| rail | 12 | always visible (`#activityBar`, collapsed; icons only — expanding shows text labels, no new glyphs) |
| rail-panel:files/search/source/git/docker/testing/run/agents/artifacts | 30/15/19/33/22/26/36/12/38 | click the activity-bar icon (`[data-ab-id]`), expand every `[data-collapse]` section, scroll each scrollable list top-to-bottom |
| panels | 9 | bottom panel chrome (`.bottom-panel`), visible on every page |
| panel-tab-kind | 8 | `switchBottomTab()` for terminal/problems/output/ports/browser/debug; each host panel expanded and scrolled |
| terminal | 6 | terminal tab strip + panes (`#pmTerminalCenterWrap`, `#pmBottomTermChrome`) |
| home | 59 | `Home` page tab (`#pm-home-workspace` model-first workspace, chat surface open as the user left it) |
| chat | 30 | chat surface shown via `PM_HOME_WORKSPACE.setSurfaceVisible('chat', true)` (the rail Chat icon's own command) |
| projects | 15 | `Projects` page tab; accordions expanded |
| usage | 410 | `Usage` page tab, then all 13 nav rooms (overview, plans, costs, accounts, free, context, analytics, ledger, attention, cache, tools, signals, authority) via `.pmu-navbtn` clicks |
| settings:home + 9 workspaces | 15+23/30/17/22/17/21/22/22/21 | `Settings` page tab, then every entry in its own domain rail (`.domain-link[data-domain]`): general, ai, code, memory, planning, source, projects, safety, system |
| wizard | 9 (distinct only) | `Planning Wizard` page tab at rest |
| orchestrator | 10 (distinct only) | `Orchestrator` page tab at rest |
| toast | 1 | `window.toast(...)` ephemeral + four durable kinds (success/warning/error/info) pushed via `toast.important`; badge/inbox host `#notifySlot` |
| onboarding | 66 | `PM_O55_ONBOARDING.open({fresh:true})`, walking welcome → look → where → begin → name → safe → review → creating → ai (fields filled so primaries enable) |
| tour | 40 | `PM7_GUIDED_TOUR.start({project:'tastebook',fresh:true})`, 7 distinct steps: comfort-intro, open-chat, select-teacher, send-question, answer-stream, same-answer-eli5, workspace-orientation |
| menu:* (14 menus) | 45 | one or two clicks from the surfaces above: files worktree-root menu + file-row right-click; search scope menu; source main menu; git automation-service menu; docker endpoint menu; run launch-config/focused-session/expression menus; artifacts sort menu; home more-menu (title-bar `#pm-home-more-btn`); notification inbox (`#rsStack` click); title-bar project + theme menus; chat more-options + thread right-click |

## Gaps (honest)

1. **Source-control context menu did not open.** A right-click on a changed-file row produced no menu
   (the panel may gate it on selection). The files-panel and chat-thread context menus were captured;
   this one was not. Other surfaces' right-click menus (docker containers, git hunks, projects cards)
   were not attempted after two passes; their actions are reachable as visible buttons, which were
   censused.
2. **Guided tour walked partially.** 7 distinct steps of a longer tour (the fixture walkthrough continues
   past `workspace-orientation`). Tour chrome + callout glyphs are captured; surface states that only
   appear in later steps are not.
3. **Onboarding stopped before the final screen.** The walk reached `ai`; its primary stays disabled
   without provider-account input, so the last "ready/done" screen's glyphs are not in the census.
4. **Wizard/Orchestrator at rest only**, per the spec (one row per distinct glyph); their interactive
   states (upload flow, run focus) were not driven.
5. **Empty tab kinds are genuinely empty.** problems/output/ports bottom tabs render text-only at rest
   (verified on two passes); they contribute no glyph rows. `menu:home-open-panel` (Open Panel flyout)
   and `menu:project` (title bar) are text-only menus: 0 rows is the true count.
6. **No pseudo-element status dots found.** The drawn-shape pseudo filter (small painted dot/ring/triangle
   via `::before`/`::after`) matched nothing that signals state: this app draws status marks as small
   svgs, text symbols and tinted elements instead. Pseudo `content` symbols (e.g. the `SYS` label) are
   plain letters, not in the spec's symbol ranges.
7. **33 rows have no screenshot** (`screenshot` empty): 26 usage rows whose element moved during the
   scroll-shoot, 4 onboarding rows, 1 toast row (TTL expiry mid-shoot), 2 menu rows (menu closed before
   the shot). The rows themselves are complete apart from the image.
8. **Long virtualized lists were sampled by scroll-through**, not paged exhaustively: usage ledger,
   artifacts run list, chat transcript. Everything that rendered during a full scroll of each scrollable
   container is in the census; rows only revealed by interactions not performed (filtering, search,
   pagination) are not.
9. **Top-bar search popover** (`tbSearchPop`) opens on input focus and was not collected; the search
   *button* glyph was (it is hidden in full-mode topbar, so it does not appear either).
10. **Exclusions per spec:** charts/sparklines/art/wallpaper svgs were skipped (log in `raw/*.json`
    `info.notes`, e.g. the Home dashboard sparkline and the 1600 px art scene); provider brand marks are
    recorded as `kind=brand` with no further detail (41 rows).
11. **U+00D7 (`×`) and U+2026 (`…`)** were counted as text symbols beyond the strict ranges because the
    spec names them explicitly; no other out-of-range characters were collected.

## Reproduce

```
cd Concepts && python3 -m http.server 0 --bind 127.0.0.1   # note the port
agent-browser start --url http://127.0.0.1:<port>/PMConcept7.html?o55=off
node tools/census.mjs <cdp_endpoint>       # main pass (raw/01–56)
node tools/patchup2.mjs <cdp_endpoint>     # menus, chat, home-more, onboarding, tour (raw/57+)
node tools/reshoot.mjs <cdp_endpoint>      # re-shoots collision-clobbered scopes (raw/200+)
node tools/build.mjs                       # census.csv, shapes.csv, status-conflicts.md
node tools/sheet.mjs <cdp_endpoint>        # contact-sheet.html + contact-sheet.png
agent-browser stop <id>
```

`raw/` holds the per-scope records (keep-last per scope label, by numeric sequence) and
`cov-notes.jsonl` the per-scope walk log quoted above.
