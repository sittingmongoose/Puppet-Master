# A4 — W4 Inner tabs / panes / lists — evidence report

Theme sweep: friendly-dark + retro-light (extreme personalities). Standalone Playwright,
port 8795 serving Concepts/, killed after. Built file = Concepts/PMConcept7.html.

## Prototype (Concepts/motion-wave/protos/tabs-lists.html)
Browser-verified, 9/9 assertions, zero console errors:
- scaleX ink stretch: lands <=1px, mid-flight width > tab (stretched), WAAPI anim present, settles.
- width+translateX (fm) ink stretch: same, mid = union span.
- direction panes: index delta -> --pm-pane-dir -1 (left) / +1 (right).
- --pi stagger: row animation-delay ascending [0, 26, 52, 78ms].
- pmFlip: 6/6 cards mid-flight, correct final order, no residual transform.
- reduce(): ink snaps on tab, getAnimations empty, pane visible.

## Double-animation strategy (chosen + why)
Data rows (.sh-wt/.sh-card/.sh-chg/.sh-commit/.sh-ctr/.fm-* /.sh-file) are NEVER direct
[data-pane] children — they live inside .sh-shelf>.sh-body or .sh-scroll. So the two
animation tiers target disjoint element sets; the only coupling is nested-transform
compounding (an animating shelf + an animating row inside would move 2x). Picked option
"rows animate INSTEAD of their wrapper": the pane-child rule EXCLUDES .sh-shelf/.sh-scroll
(`> *:not(.sh-shelf):not(.sh-scroll)`) so leaf blocks (menus, buttons, commit/eq rows,
footnotes, empty states) cascade as blocks, while the rows inside cascade individually via
the row rule. One animation per element, no compounding. Side effect: a shelf's .sh-head
appears instantly while its rows cascade under it (reads as "header leads, rows follow").
Shelves holding only non-row content (e.g. REMOTE PROJECTION .sh-kv, GRAPH) appear without
entrance animation — correct end state, minor cosmetic, accepted.

## cozeSwitchPanel-adjacent decisions
- cozeSwitchPanel + PANEL_TARGETS untouched (do-not-touch). PMPANEL.go (A3) untouched.
- Direction is computed inside wireTabber (owns .active + pane swap), set on the
  .side-panel-view BEFORE un-hide. Artifacts family tabs are FILTER tabs (no [data-pane]):
  wireTabber still toggles .active + sets dir (harmless, no panes); wireArtifacts FLIPs cards.
- Generic ink (wireSegInk) was LATENT-INVISIBLE: the later `.pm-segtab-ink{width:0}` rule
  (added for fmInk) clobbered the width:100px base, so scaleX rendered 0px. Restored by
  setting width:100px inline in wireSegInk — required for the smoke "ink lands on every tab"
  across search/source/git/docker/artifacts. Documented as a bug-fix aligned with intent.
- Ink CSS transition retired to `none` on .pm-segtab-ink (both rules): click travel is fully
  WAAPI (--ease-settle, 3-keyframe stretch, cancel-before-start); ResizeObserver / window
  resize / fmInk slot-width transitionend re-syncs call the non-animating path so they SNAP
  (spec: "must snap with NO animation") and cannot fight the WAAPI flight. reduce() -> snap.
- pmRecascade re-fires shPaneInDir on visible rows but SKIPS any row with a running WAAPI
  animation (getAnimations), so a FLIP-ing card is never also cascaded (no double motion).
  Wired on panel enter (enter observer -> container slide + row cascade together) and after
  artifacts filter/sort + worktree filter (FLIP handles moved rows, recascade handles the rest).
- pill-fit guard stays scoped to HIDDEN panes (extended to the row classes within them). The
  active pane is deliberately NOT touched, so a refit never re-fires shPaneInDir on visible
  rows (would read as a flicker). Restoring hidden panes is invisible (they return to display:none).

## What changed (anchors in PM7-base.html)
CSS: shPaneIn keyframes + nth-child ladder DELETED (dead-code rule); @keyframes shPaneInDir +
pane-block rule (> *:not(.sh-shelf):not(.sh-scroll)) + row-cascade rule (10 row classes),
delay = calc(var(--pi,0) * var(--pm-row-step)); both .pm-segtab-ink rules transition->none;
.pm-segtab-item svg easing -> --ease-settle; reduced-motion @media + data-attr kill blocks
extended to row classes; pill-fit-measure guard extended to row classes (hidden panes only).
JS (pm6-js-cozy-shelves): +cssMs/+pmEase helpers; wireTabber sets --pm-pane-dir;
+pmAssignPi/+pmRecascade/+pmFlip (window.pmFlip, window.pmRecascade); wireSource FLIP+recascade;
wireArtifacts family-filter FLIP + sort-menu FLIP + recascade; wireSegInk -> WAAPI scaleX
stretch (width:100px base restored, DOMMatrix from-rect, direction-flipped transform-origin);
fmInk -> WAAPI width+translateX stretch on clicks, snaps on resize/transitionend; enter
observer calls pmRecascade(v); boot() calls pmAssignPi(#sidePanelSlot).

## Re-pin + gates
BASE_SHA = 8aed12f6635b5d6fe694050830d46539c157bcd3ce35413457d91a801f705c9d
build_pm7.py: brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS.
base_pin_ok: true.

## Grep (built PMConcept7.html)
shPaneInDir=6, pmFlip=6, pmRecascade=8, --pm-pane-dir=3, pmAssignPi=2, --pi=11.
Old shPaneIn refs=0, @keyframes shPaneIn=0, nth-child(n+4)=0.

## Smoke (27/27 BOTH themes)
- files(3)/search(2)/source(4)/git(3)/docker(6)/artifacts(4): every tab clicked — ink lands
  <=1px each time; --pm-pane-dir inc=1/dec=-1; row animation-delay ascending (files explorer
  active pane is the FM tree = W5, so 0 W4 cascade rows there, correct).
- artifacts: family filter shows only target fam + FLIP survivors mid-flight; all 3 sorts FLIP
  (15 cards mid-flight translate), sort=old yields ascending ts.
- source: chips All->Threads->Orch->All filter correct + FLIP survivors.
- resize: ink snaps (0 anims) and stays on tab <=1px.
- pill-fit: refit adds zero new row animations, opacity stays 1, no .pill-fit-measure residue.
- rapid spam (15 clicks): single active = last-clicked, ink settled <=1px, 1 visible pane, no
  stuck .pm-panel-exit/.pm-panel-enter.
- reduced-motion: ink snaps on tab, pane instant opacity 1, zero shPaneInDir / row animations.
- console: zero new errors vs favicon baseline (both themes).

## Deviations / notes
- Docker "dangling" chip is a demo.toast (no real DOM reorder) — FLIP not wired (spec: "if it
  reorders"); documented, not a gap.
- Pre-existing rail quirk (NOT W4): the LEADING files icon's first click is swallowed (W2
  drag-gesture suppressNextClick arms on the first icon); git/search first-click fine, files
  opens normally after any panel. Smoke works around it with an open-retry. W4 does not touch
  the rail click path.
- shPaneInDir uses translateX (per W4 task text); equivalent to the spec's translate(x,0).
