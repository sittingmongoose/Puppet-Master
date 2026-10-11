# pm7-glyphs checkpoint (2026-10-11, after Usage step 6 and main 3ad5e84b71)

## Done (all on concept/pm7-glyphs-20261010, pushed)
- Catalog approved by Jared (D44, GLY-0..3). Chat, rail, Usage (steps 1-6), onboarding (two rounds) and toasts adopted,
  each with its record in this folder; every gate passed on the P1000.
- main merged twice: 62f37f65df (panels+terminal publish; build.py runs the glyph layer as step 5 and Home as step 6;
  Plans/_shards and .plan_index regenerated, Plans differs from main only by the rail answers' documents this branch
  carries) and 3ad5e84b71 (codex-onboarding-scenarios' fix, which pm7-glyphs reviewed). Pages regenerated each time.
- Card GLY-4 asked (share folder 2026-10-11-glyph-gly4-onboarding-art/); option A prototype in
  /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/gly4-prototype/.

## Waiting
- t3-usage-pm7's review of Usage step 6 (home-panels approved the code).
- The rail diff review (leftrail-polish-lead, or the planner's pick) before landing.
- Landing slot: after pm7-no-pills (chain: rail answers, Usage D43, hpt small round, combined reseal, pm7-hover tags,
  no-pills, glyphs, Liquid Glass). At landing: merge main, regenerate, rerun the onboarding 69 + tours and the census.
- Jared's GLY-4 answer.

## Next
1. Panels and terminal adoption: a fresh glyph branch from main AFTER this one lands (planner ruling), following
   ../ROLLOUT-NOTES.md; home-panels and home-terminal review their own files.
2. Settings after pm7-no-pills lands (`pm-status-mark` slots: `PMG.status(key, 14, 'nx-still')`).
3. GLY-4 on Jared's answer (A: move inject.js into the onboarding art; Retro's 12 sprites).
Re-arm `pm-mail wait --timeout 7200000` in the background at the start of the next turn.
