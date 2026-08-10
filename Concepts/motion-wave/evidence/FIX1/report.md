# FIX1 — PM7 Motion Wave Fix Pass (V1/V3/V4+V5/V6-R2)

**Agent:** FIX1 · **Target:** `Concepts/PMConcept7.html` (build artifact) @ `127.0.0.1:8798`
**Viewport:** 1440x900, Chromium headless · **Engine:** standalone Playwright (report-only on the artifact; all edits in `Concepts/pm7-tools/base/PM7-base.html`)
**Run date:** 2026-08-02

## 0. State audit (interrupted prior run)

The previous run was cut by a usage limit AFTER it had already completed the full governance loop:

- Base sha on disk = `54846c71…` and `BASE_SHA` in `build_pm7.py` was ALREADY re-pinned to the same value (not the pre-wave `1cfb8aae…`). Pin matches file: consistent.
- All four fixes were already present in base and coherent (no half-applied hunks):
  - FIX1: `trayRowIn` fill-mode already `backwards` (base:2539).
  - FIX2: `.sh-fp` target-guard present in the delegated `[data-collapse]` handler (base:44486); the old wireSearch `stopPropagation` forEach on `.sh-fileh .sh-fp[data-demo-action]` was already removed (`ev.stopPropagation();` count 12 -> 11 vs `bak-pre-motion-wave`).
  - FIX3: resolver already `REASONS[code] || code || REASONS.demo_scope` (base:29614).
  - FIX4: `.dot-run`/`.sh-sdot.is-running`/`.sh-ticks.pm-live::after`/`.sh-foot .fm-footstat .dot` already in BOTH reduced-motion kill shapes (base:17312 media + base:17347-17350 attr).
- `Concepts/PMConcept7.html` was byte-identical (`cmp`) to a fresh rebuild of the pinned base.

Decision: nothing was incoherent, so no revert/re-apply was needed. I re-ran the canonical build to re-confirm gates and idempotency, then verified all four fixes behaviorally.

## 1. Governance

- `BASE_SHA = 54846c7101b25ab0cd04b6146da4bb1b1eb2eb91090b866a4a498cf03fe482c9` (pinned, matches base sha).
- `python3 Concepts/pm7-tools/build_pm7.py --out Concepts/PMConcept7.html --outdir <scratch>` -> output 3,194,689 bytes, idempotent (identical to prior artifact).
- Gates: brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS (4/4).
- Built-output signatures grepped: `trayRowIn … backwards`; `.sh-fp')) return` guard x1 and zero `sh-fp[data-demo-action]` stopPropagation; `REASONS[code] || code || REASONS.demo_scope`; both FIX4 kill blocks x1 each.

## 2. Edit sites (all in base/PM7-base.html)

| Fix | Site | Change |
|---|---|---|
| FIX1 | base:2539 `.pm-ab-tray-open .pm-ab-tray-row` | fill-mode `both` -> `backwards` (releases transform to hover/:active after the stagger finishes; keeps pre-delay hidden state) |
| FIX2 | base:44486 `wireAccordion` delegated click | added `if (ev.target.closest('.sh-fp')) return;`; REMOVED the wireSearch `forEach … ev.stopPropagation()` on `.sh-fileh .sh-fp[data-demo-action]` so filename clicks bubble to the document-level demo router |
| FIX3 | base:29614 `guard.reason` | `REASONS[code] || REASONS.demo_scope` -> `REASONS[code] || code || REASONS.demo_scope` (unknown reason used verbatim; only empty falls to demo_scope). Single resolver covers BOTH call paths: router `data-demo-reason` (base:31540-31541) and `demo.reason` action -> `res.reason` (base:31546 + reg at 31640). The unrelated `reason` at base:28224 is a different guard module, untouched. |
| FIX4 | base:17312 (`@media (prefers-reduced-motion: reduce)`) and base:17347-17350 (`[data-reduced-motion="1"]` / `[data-motion="reduced"]`) | added `.dot-run`, `.sh-sdot.is-running`, `.sh-ticks.pm-live::after`, `.sh-foot .fm-footstat .dot` -> `animation: none !important` in both shapes. Editor/dashboard selectors untouched. |

## 3. Behavioral verification (Playwright, built artifact)

Raw data: `verify-results.json`. Console: 0 errors, 0 page errors (favicon-404 baseline filtered).

**FIX1 — tray row hover (before: hover/active dead; after: live).** Persisted an order with run/agents/artifacts behind the `__more__` sentinel; More button `data-empty="0"`, tray opens with 3 rows.
- Hover a tray row -> computed transform `matrix(1,0,0,1,2,0)` = translateX(2px) exactly (was identity).
- `:active` (mouse held, settled) -> `matrix(0.97,0,0,0.97,0,0)` = scale squash applies; differs from hover.
- Cascade still plays on open: per-row `animation-delay` 0s / 0.026s / 0.052s (stagger present), all rows `opacity:1` after settle, `animation-fill-mode: backwards`.

**FIX2 — filename click no longer swallows the toast (panel-search).**
- Click a find-results `.sh-fp[data-demo-action]` filename -> toast fires (`cmd.search.open_result -> src/services/import.rs`) AND the file group does NOT toggle (`open` unchanged).
- Click the rest of the header (the count `<b>`) -> group toggles (open -> closed).
- Replace-pane `.sh-fileh[data-demo-action]` rows still toast (`cmd.search.open_result -> …`) via their own handler — not broken.

**FIX3 — specific reason toast (before: generic demo_scope; after: verbatim reason).**
- panel-testing tr-2219 Quarantine (`data-demo-reason="already quarantined 2d"`, `demo.reason` path) -> toast `already quarantined 2d`.
- Docker publish-chain Push (`data-demo-reason="image not built yet"`, publish pane) -> toast `image not built yet`. (Note: this Publish control lives in the Docker Manager panel, `#panel-docker [data-pane="publish"]`, not `#panel-git`.)
- panel-git GitHub Actions Run workflow (`data-demo-reason="missing workflow scope"`, router `data-demo-reason` path) -> toast `missing workflow scope`.
- REASONS-token path still resolves its enum message: projects stale button (`data-demo-reason="stale"`) -> `This projection is stale — refresh it before mutating anything.`

**FIX4 — panel-scoped pulses killed under reduced motion (V6-R2).** Per-panel baseline -> reduced -> unset (playState running counts via `document.getAnimations()`):

| animation | panel | baseline | reduced | resumed |
|---|---|---|---|---|
| dotPulse | docker | 2 | 0 | 2 |
| dotPulse | testing | 2 | 0 | 2 |
| liveRail | run | 1 | 0 | 1 |
| pmShimmer | artifacts | 1 | 0 | 1 |
| fmbreathe | files footer | 1 | 0 | 1 |

- All three reduced paths equivalent on docker dotPulse: `data-reduced-motion="1"` -> 0, `data-motion="reduced"` -> 0, `emulateMedia(reduce)` -> 0; unset -> 2 (resumed).
- Dots stay VISIBLE with correct color under reduced: `.dot-run` opacity 1, background `rgb(255,173,147)` (= --graph-running on this theme), not transparent.
- pmShimmer note: in the multi-panel loop the artifacts shimmer reads 0 at baseline (a run->artifacts ordering/settle quirk in the harness, not a product issue); measured on a fresh artifacts visit it is 1 -> 0 across all three paths -> 1 (see `pmShimmerIsolatedProbe` in the JSON). The CSS kill (`.sh-ticks.pm-live::after`) is present in both shapes regardless.

## 4. Surprises / notes

- The interrupted run had finished cleanly; the audit found zero partial hunks, so this pass was verify-and-complete rather than repair.
- The task's "panel-git Publish Push" is actually the Docker Manager publish-chain Push (`#panel-docker [data-pane="publish"]`); verified there plus a genuine `#panel-git` aria-disabled control (Run workflow) for coverage.
- FIX1 `:active` settled scale reads ~0.97 vs the CSS `scale(.98)` (0.12s transform transition / easing); the squash unambiguously applies (a<1, differs from hover), which is the finding being fixed.
- No new console/page errors vs the favicon-404 baseline.

## 5. Evidence index

`fix1-tray-hover.png`, `fix2-search-fp.png`, `fix3-testing-quarantine.png`, `fix4-reduced-dots.png`, `verify-results.json`.
