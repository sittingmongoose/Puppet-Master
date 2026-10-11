# Rollout record: the Usage page (pm7-glyphs, D44)

Status: GATES PASSED and code review OK from t3-usage-pm7 (with three fixes, made in 64c09e5cdb), on
concept/pm7-glyphs-usage-20261011 (built on the rail step). Step 6 (PMU.svg for home-panels' three call sites) waits for
their publish on main. D43 overlap: whichever of D43 and this step lands second merges and reruns the walk.

## Change
Muse (two reviewed rounds) plus the lead's review fixes: `PMU.icon` draws the neon set for the names in its NEON map
(the card-head tools through `PMG.flat`: one path each, PERF-3), unmapped names keep their own drawing; state marks are
`PMU.stateMark` (`PMG.calm`, cached) beside their words, never replacing them (account rows, plan rows, the free row, the
alert header, the value-state cells); the stepper's plus and minus go through PMU.icon. Words and copy unchanged.

## Gates (P1000 GPU; /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/usage-gates/)
- walk.mjs + cmp.py, BEFORE b4f7a89e98 vs AFTER 73133f6476: 5 textOverflow +-1 (noise); vs AFTER2 64c09e5cdb (after the
  review fixes): 2 textOverflow +-1 in card bodies (noise). No error, overflowX, foldedNoMore or card-count change.
- usage_boot.mjs published: "newErrors": [] on both.
- flick2.mjs glass-dark and nier: 0 show-hide-show.
- Room-change films, glass-dark and nier (H.264), and the idle strip (the owner traced every idle change to the chat
  panel outside #pmuApp; the Usage board is still at idle). Next time the strip is clipped to #pmuApp.
- Non-browser: node --check, Usage lint, build.py --check, build_rail.py --check.
