# DG6A r3: cite lines carried to the goal-five merge's rebased head

- **Reviewed edition:** DG6A r3 (`drafts/PNC019/c12-dg5/dg6a-reanchor-r3-20261125/DG6A.self-grade.r3.json`,
  sha256 `b0fa10397b7534ce34215a243889990c3f7f86f5ba09dde8eb3ffbb226345509`), graded at `1e11fe17a7`, where all
  632 cites match (`pm-dg6a-final-regression-check.py --audit-grade-only`: pass, 16 families, 632 citations).
- **Why a carry:** main `906f426402` inserted lines in `Plans/FinalGUISpec.md` after `1e11fe17a7`. At the
  rebased head, r3 as reviewed fails the check: 136 of 632 cites, all in `Plans/FinalGUISpec.md`, sit at old
  line numbers (`dg6a-cite-drift.json`; first failure F3-708 line 52997).
- **Rule (the `reanchor_head.py` diff_mapped rule):** every cite's range is carried through
  `git diff -U0 1e11fe17a7:<file> HEAD:<file>`. A range no hunk touches is shifted by the hunks before it, and the
  quote must sit in the shifted range. Anything else would be left as it was and reported (`dg6a_cite_carry.py`).
- **Result:** 136 shifted, 496 unchanged, 0 unmapped, 0 inside an edited range (`dg6a-carry-report.json`).
  Only `line_start`/`line_end` change (272 values); every quote, unit, grade and other byte equals r3.
  Carried grade sha256 `7cccf4b4a309a0fb2eec298610ae7fb81b563191a9d183be707e86b4d3d3a84e`; the check at the
  head then passes: `{"status": "pass", "families": 16, "citations": 632}`.
- **Re-derive:** `python3 -B dg6a_cite_carry.py --repo <tree at this commit> --from 1e11fe17a7 --grade
  DG6A.self-grade.r3.json --out <out> --report <report>` reproduces the committed grade byte for byte.
- **Ruling:** pm-ea-lead 1127065059 (land the carried r3 with the r3 check patch), after lead 1125150208
  ("apply r3 grade + check patch on merge branch after rebase onto new main, re-run tool").
- **Not this landing's:** main's own grade before this commit fails 275 of 519 cites at main; the DG6A check is
  not one of the landing gates.
