# Baseline after the checked reseal landing — 2026-10-22

Frozen main was `2cf22e20b357d1cc6f5d0840441bf22716a16319`. The original baseline file had SHA-256 `25941168df82b5b4c674e0eacd4103d3443130428b341784ad2cc9f83261dd9e`. It remained unchanged through the first landing check and push.

The checked first main push is `94811a84a540ede8ff33f08432569929e4d1a46c`, verified on both destinations. Astra round 1 reviewed `b9cdb6e18a93c9c8528b2ab2f9e1b225880a4389`: OK, 0 FIX, 0 LOW. Its review SHA-256 is `9c8cc12a6160e398d1f5a1de06826892bf3a2f6b93a907fd3d776cd999db3ed5`. The review and Jared's explicit GO are bound in the reseal record and execution evidence.

After the push, the reviewed currentness edition was written in place after a fresh full backup. All 15 installed hashes stayed stable through validation and both baseline recordings. Currentness remains `UNKNOWN_OPEN`, all four authority flags remain false and runtime stays disabled.

In a full local worktree at that pushed main, `snapshot-current` generated `pds-20261022-001-current-planunit-snapshot` with 96 documents and superseded `pds-20261021-003-current-planunit-snapshot`. Baseline recording followed snapshot generation. The baseline commit field is the already-pushed main `94811a84a540ede8ff33f08432569929e4d1a46c`.

| Check | New baseline total |
|---|---:|
| run-gates | 1486 |
| audit-governance | 1469 |
| current snapshot | 0 |

The export-bucket count is 14, down from 22. A second complete recording reproduced all check totals, keyed rows, buckets, exports and input bindings. The row-level reconciliation accounts for every old bucket. The snapshot and baseline are committed together. No baseline was refreshed to excuse an unpushed landing.

Final baseline capture: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261022/landing-20261022/followup/baseline-final.json`; SHA-256 `7b6d8e98a16f28c4b1811bb943eb38a1abf294cef8c9ea51c271bcf6f3287866`. Reconciliation: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261022/landing-20261022/followup/export-reconciliation.json`; SHA-256 `94f3e5ce24bff4165c7111803f9afa7d09179ad65145bd4de8bbd3798b213701`. Full command captures and their SHA-256 manifest are bound in `execution-evidence.json`. The later shared follow-up check and final publication are bound in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261022/landing-20261022/COMPLETION.json`.
