# FIX3 — PM7 Motion Wave Fix Pass (3 user-reported bugs)

**Agent:** FIX3 · **Target:** `Concepts/PMConcept7.html` (build artifact) @ `localhost:8793`
**Viewport:** 1440x900, Chromium headless · **Engine:** standalone Playwright (report-only on the artifact; all edits in `Concepts/pm7-tools/base/PM7-base.html`)
**Run date:** 2026-08-02

## 1. Governance

- New `BASE_SHA = 65553cb7cd7a27a6fd0f9140264907eae34e872f5b39821277c1f435ef6a0910` (was `26fb9510…`). Pinned in `build_pm7.py`; matches `shasum -a 256` of base.
- `python3 Concepts/pm7-tools/build_pm7.py --outdir <scratch> --out Concepts/PMConcept7.html` -> 3,198,760 bytes.
- Gates 4/4: brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS.
- Built-output signatures grepped: `.pm-card-in { animation: pmKidIn … }` (built:15342); `.sh-hit { … padding: 3px 9px 3px 11px … }` (built:15760); `.pm-card-in` in both reduced kill blocks (built:16158, 16193-16194); `wasCollapsed` (built:42038); `startCollapseTrack()` (built:42094); wireArtifacts pm-card-in add/cleanup (built:44142/44148/44152).

## 2. Edit sites (all in base/PM7-base.html)

| Fix | Base site | Change |
|---|---|---|
| 1 | `.sh-hit` / `.sh-hit:hover` (base ~16901) | removed `border-left: 2px solid transparent` + its `border-color` transition term + `:hover border-left-color`; compensated alignment `padding: 3px 9px` -> `3px 9px 3px 11px`. No other `.sh-hit` border refs (only `border-radius` on the `.sh-hit em` highlight pill remains). |
| 2 | `abIndicator()` observer (base ~43048) | added closure `wasCollapsed` + `trackGen`/`trackEnd`; new `startCollapseTrack()` = `cancelAnim()` + per-frame rAF `sync(false)` until bar `transitionend(propertyName==='width')` OR 300ms safety, final `sync(false)`; generation counter + single end-listener guard overlapping toggles. Observer routes a `collapsed` flip to the tracker; ordinary `.icon` mutations still `sync(true)` (spring FLIP preserved). Theme/density observer + resize handler untouched. |
| 3 | `wireArtifacts()` tab path (base ~45134) | record `hiddenBefore`; after `pmFlip`, compute REVEALED set; cancel any zero-first-rect FLIP on each, assign `--pi=min(index,6)`, add `.pm-card-in`, single 700ms cleanup timeout (mirrors `pmCascadeKids`). REMOVED `pmRecascade(panel)` + `pmFlash(scroll||panel)` from tab path. Sort path: REMOVED `pmRecascade(panel)` (kept `pmFlip` + `pmFlash`). New `.pm-card-in` rule reuses `@keyframes pmKidIn`; `.pm-card-in` added to both reduced kill blocks. wireTabber / pmFlip / pmRecascade helpers untouched. |

## 3. Behavioral verification (Playwright, built artifact; theme friendly-dark)

Raw data: `verify-results.json`. Console: 0 page errors, 0 console errors (favicon-404 baseline = none observed).

- **BUG 1** — hover border gone: rest/hover `.sh-hit` border-left-width `0px` + style `none`; hover bg tint applies (`color(srgb … / 0.09)`); code-span x before/after hover identical (98 -> 98, shift 0); non-hover row border `0px`/`none`. PASS.
- **BUG 2** — no draw-up: during collapse (docker active) sampled `.ab-ind` at 30/60/90ms + settle -> WAAPI `anims:0` every sample, opacity `1`, top/height track collapsed geom exactly (232/16); expand same (400/44). Repeated for panel-files (88/16 -> 144/44) and panel-artifacts (376/16). Ordinary switch docker->search: mid-flight `anims:1`, 3-keyframe stretch, lands 0px (top 208 = target), clears by ~600ms. Rapid collapse/expand spam x5 -> opacity `1`, exact on active icon, `anims:0` (no orphan rAF / stuck opacity). PASS.
- **BUG 3** — tab chaos resolved: All->Web = 2 web survivors FLIP (`anims:1`), no reveals, `.sh-scroll` `pm-flashing:false`. Web->All = 13 revealed get `.pm-card-in` (animation-name `pmKidIn`, delays ascending 0/.026/.052/.../.156, `--pi` 0..6 cap), 2 web survivors FLIP, `pm-flashing:false`. Steady-state probe: each revealed card has exactly one `pmKidIn` CSSAnimation (no fly-from-origin leak). Cycle All->Browser->Evidence->All clean each way. Spam x8 -> final set correct, 0 stuck `.pm-card-in`, 0 leftover inline transforms after 1s. Sort -> By family: FLIP runs (11 movers) + flash fires (`pm-flashing:true` mid, cleared on settle) + no recascade. Non-moving survivors: `pmRecascade` removed so no shPaneInDir re-fade. PASS.
- **Regression net** — rail hover scale OK (symbol transform `none` -> `matrix(1.144…)`); FM folder expand OK (chevron `pm-chev-open` anim + `pm-kid-in` cascade, 4 kid anims); menu open/close animated (`is-open` + 2 anims -> Escape display:none). Reduced-motion (`emulateMedia reduce`): `.pm-card-in` anim dead (`animation-name:none`), revealed cards visible, `anyAnims:0`, indicator snaps (`anims:0`). PASS.

## 4. Screenshots

`bug1-hover-no-border.png` (search hit hovered, tint only, no border); `bug2-collapse-mid.png` (rail mid-collapse, indicator snapped to collapsed active icon, no stretch); `bug3-tab-midflip-reveals.png` (artifacts tab mid-FLIP with pm-card-in reveals, no flash); `bug3-sort-flash.png` (sort By family, FLIP + container flash).

## 5. Surprises

- `pmFlip` does NOT actually skip revealed cards: a display:none card has a zero `first` rect, so on reveal it gets a large delta and FLIP flies it in from the origin. The fix cancels that per-card on the revealed set (helpers untouched) so the deliberate `pmKidIn` entrance owns it; steady-state probe confirms one clean animation per card.
- One revealed card reads opacity `0.62` under reduce — that card carries `.sh-card.expired` (`opacity:.62`, specificity 0,2,0), which legitimately outranks the kill block's `opacity:1`. It is the card's intended dimmed resting state, not a leak; all other revealed cards are opacity 1.
- Ordinary rail switch fires `sync(true)` twice (icon `.active` mutation + panel-swap mutation), so the stretch restarts once and runs ~400ms total; this is pre-existing (my change only routes collapse flips), lands exactly, and cleans up.
- The activity bar boots `collapsed`; the bar-width transition is 120ms while icon geometry snaps, so the collapse tracker effectively re-snaps to the new geom each frame — the key win is the stretch FLIP no longer paints a draw-up.
