# A7 — W7 Liveness/Feedback + W8 Hygiene — Evidence

Agent: A7 (final integration). Built file: `Concepts/PMConcept7.html` (never hand-edited).
Base edited: `Concepts/pm7-tools/base/PM7-base.html` only.

## New BASE_SHA
`1cfb8aae3e28932545aa43fdf3627d76c786557043c6add977ef3ee1f0b0d5e9`
(pinned in `build_pm7.py`). Build: `python3 Concepts/pm7-tools/build_pm7.py --out Concepts/PMConcept7.html --outdir <scratch>`.

## Gates — ALL PASS
brace_balance PASS · css_vars_defined PASS · js_node_check PASS · no_emoji PASS.
Grep built output: pmValueFlash 2 · pmChipPop 10 · pm-flashing 11 · pmFlash 10 · pm-chip-pop 7.

## Prototype
`protos/liveness.html` — browser-verified on :8799. flash class lifecycle + no box-shadow
keyframes PASS; dots delays [0s,0.35s]; fixed rows transitionProperty background,transform +
hover matrix(…,2,0); chip pop class add/remove; reduce() kills flash/pop, active kept,
values visible. Screenshot: proto-liveness.png.

## pmFlash sites WIRED
- source worktree chip filter -> flashes worktree shelf `.sh-body` (+ pmChipPop on chip)
- artifacts family tab -> flashes `.sh-scroll` card container (+ pmChipPop on tab via wireTabber)
- artifacts sort menu pick -> flashes `.sh-scroll`
- search `.js-filterchip` flip (glob input / ignore toggle) -> flashes RESULTS shelf body
- search collapse-all / expand-all (#shResCollapse/#shResExpand) -> flashes RESULTS shelf body
- FM #fmCollapseAll -> flashes #fmTree (or active pane for changed/open)
- FM #fmHideIgnored -> flashes #fmTree

## pmFlash sites SKIPPED (with reason)
- docker container Stop/Start/Restart: handlers are `data-demo-action="demo.toast"` only
  (registered in TOAST_IDS, no real handler mutating a status chip) -> no DOM state change.
- commit Stage-all / Unstage-all (`cmd.git.stage_hunks`/`unstage_hunks`): toast-only, rows
  do not move -> skipped.
- docker dangling chip (`.pm-chipbtn`, line 18695): toast-only, no `.active`/state -> no pop.
- testing/artifacts live elapsed tickers: continuous, not a change event -> no flash (per brief).

## Chip pop (pmChipPop) wired
source worktree chips; artifact family tabs (in wireTabber, gated to #panel-artifacts);
search flags `.sh-flag` Regex/Case/Word in BOTH panes + `respect ignore files` toggle.
Docker dangling chip skipped (no state).

## Bare-ease disposition (panel+rail scope)
Only one bare easing exists in the cozy+panels CSS blocks: `opacity 45ms ease-in 175ms`
inside the fm-ctx sprout CLOSE timing. LEFT intentionally — it is the documented sprout
close acceleration (W6 engine). Everything else already uses var(--ease-*). panels block: 0 bare.

## transition:all cleanup
.pm-minibtn, .pm-chipbtn, .sh-flag -> explicit lists (color, border-color, background,
transform). Zero `transition:all` declarations remain in cozy/panels blocks (verified).

## Status pulse unification
Easings already var(--ease-out) (dotPulse, liveRail, pmShimmer, fmbreathe, pm6-panels-pulse).
Added out-of-phase offsets (scoped, dashboard untouched):
`#panel-git .sh-job .sh-dot.dot-run`, `#panel-testing .sh-run .sh-dot.dot-run`,
`#panel-docker .sh-ctr-h .sh-dot.dot-run` -> animation-delay .35s.

## Legacy rows / press / will-change / dead code
- Hover transition + translateX(2px) added to .pm6-sp-row, .pm6-fm-file, .pm6-search-hit,
  .pm6-sc-commit, .pm6-fm-rootitem (base) and live `.sh-hit` (search results).
  NOTE: .pm6-sc-commit + .pm6-fm-rootitem are on the frozen dead list
  (dead_selectors.py:615,586) so T01 drops them at build; edits stay in base for
  consistency, the 3 sheen-referenced ones survive into the built file.
- Press squash: `.side-panel-view .pm-btn:active`, `.pm-minibtn:active`,
  `.pm-chipbtn:active`, `.sh-flag:active` -> scale(.97). fm-row(.985)/fm-tbtn untouched.
- will-change:transform added to .pm-ab-ghost (.ab-ind + .pm-ab-tray already had it).
- Dead keyframes: none in cozy/panels (fmPaneIn already gone from W1); 17 in-scope keyframes
  all referenced.

## Reduced motion
Both kill blocks (data-attr + @media) extended: .pm-flashing::after (opacity 0), .pm-chip-pop,
and legacy-row hover transitions -> none. JS pmFlash/pmChipPop guard reduce().

## Browser smoke (:8799, friendly-dark + basic-light + reduced)
32 checks. 29 PASS outright; 3 initial FAILs were test-ordering false negatives, re-verified
PASS in isolation:
- flash overlay mid-flight peak opacity = 0.55 (no box-shadow keyframes).
- search replace-pane flag pop: {on:true,pop:true} isolated (smoke had pre-set it via pair mirror).
- .sh-hit hover bg applies (smoke had collapsed all groups first).
- press squash real :active -> matrix(0.970185) pm-btn, matrix(0.972199) pm-minibtn.
- pulse delays differ: docker {.35s,0s}; testing [0s,0.35s].
- regression: all 9 panels open, source tabs switch (4), menu opens, tree expands,
  prior keyframes live (railPanelIn, shPaneInDir, dotPulse, pmTabGlow…).
- reduce: no flash/pop, .active kept, values visible, no pmValueFlash/pmChipPop anims.
- console: zero errors vs favicon baseline in all 3 modes.

## Deviations
None functional. Only note: 2 legacy selectors (pm6-sc-commit, pm6-fm-rootitem) removed at
build by the pre-existing frozen dead-selector pipeline — base edits retained, built output
unaffected. Screenshots: smoke-friendly-dark.png, smoke-basic-light.png, smoke-reduced.png.
