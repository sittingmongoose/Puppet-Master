# pm7-glyphs checkpoint (2026-10-11, before the switch to xhigh)

## Done
- Catalog approved by Jared (D44, GLY-0..3); addendum shown. Rollout foundation (build.py step 5, glyph_layer) in.
- Chat step (CHAT.md), rail step (RAIL-RECORD.md) and Usage step (USAGE-RECORD.md) merged into this branch
  (c824da83ed): every gate passed; Usage's owner approved the code. The rail lead or the planner still reviews the rail
  diff (a53fefd5b8..28d3bb3f5f on concept/pm7-glyphs-rail-20261011) before the glyph branch lands.

## Running (T3 worker threads, independent of this thread)
- Muse: onboarding (ONBOARDING.md) in ~/pm-worktrees/pm7-glyphs-onboarding-20261011, branch
  concept/pm7-glyphs-onboarding-20261011 (task pm7-glyphs-onboarding-rollout-r1).
- Muse: toasts (TOASTS.md) in ~/pm-worktrees/pm7-glyphs-toasts-20261011, branch concept/pm7-glyphs-toasts-20261011
  (task pm7-glyphs-toasts-rollout-r1).

## Next
1. Review each worker's result (diff, gate outputs), then run its GPU gates on the P1000 with a zcode worker (spec
   pattern: ~/pm-scratch/pm7-glyphs-20261010/w6*/w7* SPEC.md), check frames, merge into this branch.
2. GLY-4 (onboarding art glyphs: keep, neon geometry in each material, or neon tubes) at xhigh: the card in
   /mnt/Cursor/share/puppet-master/2026-10-11-glyph-gly4-onboarding-art/ (designer2 is paused; do it here).
3. Usage step 6 (PMU.svg for home-panels' three call sites) after the panels publish lands on main; then the panels and
   terminal surfaces (designer2's families, ROLLOUT-NOTES.md) and Settings after pm7-no-pills lands.
4. Mail home-redesign-planner when a surface is ready to land or I'm blocked. Landing: after no-pills, chain order.
Re-arm `pm-mail wait --timeout 7200000` in the background at the start of the next turn.
