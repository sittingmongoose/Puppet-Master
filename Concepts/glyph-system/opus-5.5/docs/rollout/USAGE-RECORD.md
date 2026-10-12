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

## Step 6 review fixes (home-terminal REQUEST_CHANGES; lead, 2026-10-11, 6d3b0bd481, republished 65e832fa63)
Base: main 2f91e7a622 merged at f278a22282. D43 rewrote 42-cards.js, 45-menu.js, 54-w-accounts.js and 90-api.js on
main; the merge had no conflict and the glyph call sites were read line by line against D43's code.
- F1: the size picker's in-place update (42-cards.js settleRows) inserts PMU.svg('check', 14, 'control'), the same neon
  check as the menu's first render.
- F2: the menu's chosen-row check draws itself as its row lands (45-menu.js materialize) on the neon tube .nx-c, never on
  its hidden halo .nx-h, falling back to the old drawing's path. A control glyph plays no act when it mounts, so this
  draw is its one motion.
- F3: the records table's Export (50-w-common.js) is PMU.svg('export', 16), the same glyph as the header's.
- F4: every [data-icon] takes its own host's size (90-api.js dataIconSize: .pmu-ico and .pmu-navicon 16, .pmu-ctlchev
  and .pmu-ctlicon 14, the Live readings chevron 12). Before, all were 16, so the 14 px control chevrons were affected
  too, not only the Live readings chevron.
- Also: the Atlas rows' expand chevrons (53-w-atlas.js, 14) and D43's Open in Settings gear (54-w-accounts.js, settings
  at 14, per the D43 note above). Only the notch and the no-PMG fallbacks still draw the SVG table.

G1, the menu film (P1000, normal admission, H.264, 3 min 9 s; evidence
/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/usage-step6-review/, SHA256SUMS there): Glass Dark, Basic
Light, Retro Dark, NieR, then Basic Dark in Reduced Motion. Each run opens the Scope menu (its rows, the chosen-row check
drawing itself, the rail, the search), a card's gear and kebab menus (a kebab submenu and its back), and a fit-preset
card's size picker (acct-switch), before and after a preset is picked. In-page checks, every run: F4 sizes 12/14/16;
the F2 draw targets .nx-c (none in Reduced Motion, as designed); Scope menu icons 7/7 neon, gear 2/2, kebab 9/9, the back
neon; F1 every size-picker check neon at the open, after the settle and after a pick and reopen (the chosen row moves
between presets); F3 the records Export neon (Ledger). 0 page errors. The picker's rows were already measured at the open
in this session, so the film does not catch the in-place check insertion itself; its call is now the first render's.

Gates on the final composition (main 2f91e7a622 vs the branch at 65e832fa63, P1000):
- walk/cmp: 0 page errors and 0 overflowX on both. The six differences, each adjudicated
  (`cmp-adjudication/RESULTS.md` in the evidence folder, with a bounded settled recheck on the P1000):
  - basic-light@1440 overview cards 13 -> 14, basic-light@1920 14 -> 13, glass-dark@1920 14 -> 13: the pre-warm's 1 %
    plate copy, which exists about 250 ms around 10.5-11 s after load on any page (home-panels' pwtime.mjs). Both
    directions occur, and two walks of the same page differ the same way.
  - friendly-dark@1440 free textOverflow 0 -> 1 and friendly-light@1440 costs 1 -> 4: odometer digit cells
    (span.pmu-odo-c.is-d) mid-roll during the room entrance. No glyph in them; main's walk has them too.
  - glass-dark@1920 costs textOverflow 0 -> 1 (a card body): the budget card's body at 778 px of scroll in 774 during the
    entrance, with 0 neon svgs in it, the odometer strips and the Usage film's comet (i.pmu-film-comet) animating. Settled,
    0/3 on both pages; at the walk's timing, branch 2/9 and main 1/4 (1300 ms), the identical case on main. It's an
    existing entrance transient, not the glyphs. The same class sat unexplained in the W7 summary (filed as noise);
    RESULTS.md now explains it.
  Verdict: no glyph source issue. Harness note for its owner: the walk samples 1.5 s into a room's entrance and does not
  skip .pmu-film-comet or rolling odometer cells.
- flick2 Glass Dark and NieR: 0 show-hide-show.
- usage_boot --page (the branch): ok, newErrors [] (its Home check, fixed on main 0d33a0c4d0, passes).
