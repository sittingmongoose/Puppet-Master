# D-M01-A control — revision stage report

## Result

Authored a complete bounded recommendation in `final.md`, covering all six brief obligations, conditions, uncertainties, optional alternative, and discriminating proposed checks. The conditional Online Backup API recommendation is retained. The source/documentation versus SQLite 3.51.3 implementation discrepancy about `sqlite3_backup_finish()` is resolved conservatively: record every step result; only a recorded `SQLITE_DONE` plus finish `SQLITE_OK` qualifies for publication. The code also returns immediate `SQLITE_BUSY` when its source pager is in a write transaction.

## Critique dispositions preserved

- **Accepted:** obligation 1, with the boundary that the destination connection and (in shared-cache mode) target file remain isolated; a dedicated source handle is prudent, while concurrent source use depends on the build’s threadsafe configuration.
- **Accepted with amendment:** obligation 2 clarifies that a separate live-writer handle causes restart behavior; completion is consistent/up to date, not fixed to the scheduled-start instant.
- **Accepted with material correction:** obligation 3 distinguishes captured API prose from version-pinned code, and makes DONE—not finish status or progress—the completion evidence. The bounded retry, cleanup and previous-snapshot preservation rule remains proposed policy.
- **Accepted:** obligation 4 retains runtime checks for journal mode and page sizes; obligation 5 treats progress counts as stale-able estimates; obligation 6 remains proposed, not executed, and retains VACUUM INTO only as an optional compacted-copy lead.
- **Rejected:** none of the critique’s material claims.
- **Unresolved:** target writer handle/transaction behavior, churn, threadsafe build configuration, target destination mode/page size, and suitable operational timing limits.

## Witnesses and limits

SHA-256 matched the manifest for all three frozen source captures and matched the provided identities for the predecessor draft and critique. No SQLite database, downloaded code, installer, or project code was executed. The proposed tests are not execution evidence. Only the listed raw captures and authorized brief/predecessor artifacts were read.

