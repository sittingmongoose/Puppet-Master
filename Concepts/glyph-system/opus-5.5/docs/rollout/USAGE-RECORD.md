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

## Step 6 (lead, 2026-10-11, after the panels+terminal publish; 8ce5ebcb08, 358a18a8e6)
`PMU.svg(name, size, role)` in 00-core.js: PMU.icon's NEON lookup and cache, a bare svg (no wrapper), '' when neither PMG
nor the SVG table has the name. The card-head tools (42-cards.js, 14 flat), the menu's icons (45-menu.js: rows, back and
search 14, the rail 16; the chosen-row check as a control, home-panels' review) and its in-place row update
(42-cards.js:612), and the shell's [data-icon] fill (90-api.js, 16) call it. DOM shape, data-tool, aria and classes
unchanged. Code approved by home-panels; the owner (t3-usage-pm7) reviews too.

Gates (P1000; /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/usage-step6/, SHA256SUMS there):
- walk + cmp, BEFORE 5a31d27167 vs AFTER 8ce5ebcb08: 18 looks x widths each, 0 page errors, 0 overflowX, all on the
  Quadro P1000. 13 differences (textOverflow swings and +-1 overview cards in both directions); a second walk of AFTER
  against the first gives 8 of the same kinds (+-1 overview cards, textOverflow up to 6): run-to-run noise.
- flick2, Glass Dark and NieR: 0 show-hide-show.
- Idle strip, now clipped to #pmuApp (`scripts/idle-strip-clip.mjs`): live:0 only the entrance tail changes (AFTER 1/12
  pairs, BEFORE 2/12); live:1 the beats. The board is still at idle.
- usage_boot --published: "newErrors": [] and every Usage contract holds. Its "Home dashboard renders" check fails on
  BEFORE's reference build and on AFTER alike (Home's headH 0 since the panels publish): the check is stale, not the
  step (told t3-usage-pm7).
- Room films on 358a18a8e6, H.264: `films/usage-rooms-step6-{glass-dark,nier}-h264.mp4` (rooms, the card-head tools
  hovered, an account row).
