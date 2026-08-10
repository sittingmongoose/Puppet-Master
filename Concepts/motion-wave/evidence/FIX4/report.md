# FIX4 — artifacts family-tab animation rework (user-reported: "still messed up")

## Diagnosis (measured live, pre-fix)
- web -> all: 3 survivor web cards FLIP'd ~480-530px DOWN through the 12 revealing
  cards (cards collided mid-flight), then OVERSHOT their landing by ~60px
  (pmFlip easing = --ease-settle, y-peak >1) and bounced back. Measured:
  t70 translate -124px, t120 translate +57px (past target), settle at t360.
- Root cause: family tabs are a CONTENT SWAP (sets hide/reveal wholesale), not a
  reorder. FLIP + reveal + settle-overshoot cannot coexist cleanly in one list.

## Fix (all in pm7-tools/base/PM7-base.html; rebuilt through pipeline)
1. Family-tab path no longer calls pmFlip. New unit transition:
   - exit: `.pm-fam-out` on `.sh-scroll` (whole outgoing set fades + slides
     against the tab direction, 120ms, --ease-smooth),
   - swap: filter applied in the invisible gap, scrollTop reset,
   - enter: `.pm-fam-in` -> visible cards stagger in from the tab direction
     (pmFamIn, --pm-fam-dir +/-, --pi x --pm-row-step, cap 7).
   - interrupt-safe: rapid clicks land the pending swap instantly, then restart.
   - clicking the already-active family is a no-op.
2. pmFlip gained optional easing param; sort-menu path now passes --ease-out
   (decel-only) so reordering cards never overshoot through neighbors.
3. Removed dead `.pm-card-in` system (CSS rule + both reduced-motion kill
   blocks + JS). Kill blocks updated for pm-fam-out / pm-fam-in.

## Verification (live, built artifact, port 8801)
- web->all: zero card transforms during exit; swap at 120ms; 15 visible; classes
  clean at 700ms. No flights, no overshoot.
- 12-switch direction matrix (all pair orders): pm-fam-in fires every time,
  --pm-fam-dir correct (forward -> enter from right, back -> from left;
  mid-flight translateX signs matched), card counts exact per family
  (all 15 / web 2 / browser 3 / evidence 10).
- 8-click interrupt spam: final = last click, 0 stuck classes, clean scroll.
- Sort menu (Newest/Oldest/By family): FLIP runs (11 cards mid-flight),
  decel-only offsets, final grouping correct (webweb|bbb|eeeeeeeeee).
- Reduced motion (data-motion=reduced): instant filter, zero pm animations,
  correct visible set, no fam classes left.
- Style audit: card style attrs contain only authored --cat + --pi vars.
- Console: 0 errors / 0 warnings.

## Governance
- BASE_SHA 65553cb7 -> 8ef31df9929bd7009b3ea01ea7868d2039d19e4aac1ddc6952f0ffad0ca09265
- Gates 4/4 PASS; rebuild byte-identical to Concepts/PMConcept7.html.
- Edits: base only (CSS ~16484 region, kill blocks ~17307/17343, pmFlip sig,
  wireArtifacts tab path). Artifact never hand-edited.
