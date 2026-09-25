# Re-check, repair round: fix/landing-check-exports-20260924 at d941c0d3b5 (2026-09-24)

This re-check covers only the coordinator's list, run on `git archive d941c0d3b5` in `export-d941/`. Nothing else was
reopened.

- **Scope.** The three commits sit on 94ea73cfee, and each touches only the paths it claims.
  - ec0dfd9008 (X-09): script, test and README.
  - 35c3e0aa47 (X-07): README.
  - d941c0d3b5 (X-13): README.

  No commit adds a file or changes a mode. AGENTS.md, `.claude/CLAUDE.md` and `.gitignore` are unchanged.
- **X-09.** The test file is byte-identical to my `patched/`. The script differs only in its module docstring, which is
  rewrapped and has two insertions naming the new case:
  - "every row the aggregate printed is among the export's rows", in the keying condition;
  - "one that lacks a row the aggregate printed (review X-09)", in the fallback list.

  Both say what the code does. The README's X-09 lines match `patched/`, and its follow-through adds `rows_mismatch` to
  the `--json` case list, which is the code's value. Judged sound.
- **README sentences.** X-07 and X-13 are my replacement words. The only difference is that X-07 keeps the list's ";".
- **Tests.** 154 OK.
- **Scenarios.** E3 now exits 2: "... holds all 133 rows, but 1 of the rows the aggregate printed is not among them;
  the truncated rule applies", and the printed `missing_ref` blocks. The other 13 scenarios give the same results as at
  94ea73cfee.
- **Result.** No should_fix is left open. X-08, X-10, X-11 and X-12 stay recorded as open questions.

**Landing-ready: yes.** origin/main has moved to 38b8c1301d since, so the branch rebases at landing, as the rules say.
