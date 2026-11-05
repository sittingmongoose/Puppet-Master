# DS15 round-8 guard removal rerun

Existing auditor: literal PARTIAL. 236 enumerated guards, 14259 unique negatives, 41 legacy named sets, 3,949,743 F/E/R pairs. Positive regressions: 0. Exactly six repaired install cases change classification; each flips with its own guard removed alone. Legacy residuals after named sets: 5570.

The exact guard/case F/E/R table is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix8/guard-table.json`, SHA-256 `d7d42ab965600cfe6ab79b0e2f109a47417ab277e439357f20c77126c7f9e4c0`. The case catalogue names every integer in its flip/error/stay-rejected lists. The six-case delta is `fix8/guard-delta.json`, SHA-256 `9b619a794efeffffa051d76afbb7f92e00599134c6d646d873fb4864e050e213`. Per-family raw audits are under `fix8/guard-audit/`.

No exception or continued refusal is proof. No local audit-rule redesign is included. Strict field/predicate duplicate certification and inventory/compound-rule limitations move to the shared `pm_guard_isolation.py` adoption in the shared sweep. S-FMT1, S-N1 and S-N2 remain explicit open sweep items. The round-7 table and independent cycle-8 ruling remain historical evidence, not overwritten proof claims.
