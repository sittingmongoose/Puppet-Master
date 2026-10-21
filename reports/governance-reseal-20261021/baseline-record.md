# Baseline after the checked reseal landing — 2026-10-21

Frozen main was `40bf3f157436a659804113eb7f08bbb248b0122d`. The original baseline file had SHA-256 `cb56bf422174bf03225a0ea1cf29547f3f09556b152072643fda6cbc91096dc6`. It remained unchanged through the first landing check and push.

The checked first main push is `63aebecebdf511d827b7dc21ece8311acd4d2769`, verified on both destinations. Astra round 1 reviewed `79e749839611c14da312b0d9dab044241c0a57bb`: OK, 0 FIX, 0 LOW. Its review SHA-256 is `00cc5e621200dada1f5d8ba88954f98e96031df0babbcf913facf51d88049359`. The review and Jared's explicit GO are bound in the reseal record and execution evidence.

After the push, the reviewed currentness edition was written in place after a fresh full backup. All 15 installed hashes stayed stable through validation and both baseline recordings. Currentness remains `UNKNOWN_OPEN`, all four authority flags remain false and runtime stays disabled.

In a full local worktree at that pushed main, `snapshot-current` generated `pds-20261021-002-current-planunit-snapshot` with 96 documents and superseded `pds-20261021-001-current-planunit-snapshot`. Baseline recording followed snapshot generation. The baseline commit field is the already-pushed main `63aebecebdf511d827b7dc21ece8311acd4d2769`.

| Check | New baseline total |
|---|---:|
| run-gates | 1486 |
| audit-governance | 1469 |
| current snapshot | 0 |

The export-bucket count is 14, down from 22. A second complete recording reproduced all check totals, keyed rows, buckets, exports and input bindings. The row-level reconciliation accounts for every old bucket. The snapshot and baseline are committed together. No baseline was refreshed to excuse an unpushed landing.

Final baseline capture: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261021/landing-20261021/followup/baseline-final.json`; SHA-256 `cb9dfaf6d06c994b3b95a57ae9c63dfdff1767e6666bddd278455b7cb32ae01a`. Reconciliation: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261021/landing-20261021/followup/export-reconciliation.json`; SHA-256 `5a465bff08d4d2d9a69c7ff7975111b88e6161f9884b1a8bfc14f8fc13bb7a63`. Full command captures and their SHA-256 manifest are bound in `execution-evidence.json`. The later shared follow-up check and final publication are bound in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261021/landing-20261021/COMPLETION.json`.
