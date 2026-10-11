# pm7-glyphs checkpoint (2026-10-11, after onboarding and toasts)

## Done
- Catalog approved by Jared (D44, GLY-0..3); addendum shown. Rollout foundation (build.py step 5, glyph_layer) in.
- Chat (CHAT.md), rail (RAIL-RECORD.md), Usage (USAGE-RECORD.md), onboarding (ONBOARDING-RECORD.md, two rounds) and
  toasts (TOASTS-RECORD.md) are merged into this branch with every gate passed. The rail lead or the planner still
  reviews the rail diff (a53fefd5b8..28d3bb3f5f on concept/pm7-glyphs-rail-20261011) before the glyph branch lands.
- Inks: `tools/tune_inks.py` also fits measured fields (`src/data/ink-fields.json`: the toasts' tinted cards and the
  onboarding window's tinted tags); info is the paused tone.
- Card GLY-4 asked (share folder 2026-10-11-glyph-gly4-onboarding-art/; catalog decisions.json): whether the onboarding
  art scenes draw the neon shapes in each look's material (A, recommended), keep theirs (B) or take tubes (C). The
  option A prototype (path swap for line/paper/light/ink, Retro's 12 redrawn sprites) is in
  /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/gly4-prototype/inject.js.

## Worker threads: none running (onboarding and toasts settled).

## Next
1. GLY-4: on Jared's answer A, move inject.js into the onboarding art (A.glyphs path data from PMG.flat at build or
   first use; Retro's ICONS), then the art's own GPU film in every look and the scenario suite before and after.
2. Usage step 6 (PMU.svg for home-panels' three call sites) after the panels publish lands on main; then the panels and
   terminal surfaces (designer2's families, ROLLOUT-NOTES.md) and Settings after pm7-no-pills lands
   (`pm-status-mark` slots: `PMG.status(key, 14, 'nx-still')`). pm7-no-pills' onboarding-pills branch composes with
   25-glyphs.css (they own the boxes, the marks are ours).
3. Mail home-redesign-planner when a surface is ready to land or I'm blocked. Landing: after no-pills, chain order.
Re-arm `pm-mail wait --timeout 7200000` in the background at the start of the next turn.
