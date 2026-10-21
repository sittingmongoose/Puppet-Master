# Frozen baseline and deferred follow-up — 2026-10-21

Frozen main: `40bf3f157436a659804113eb7f08bbb248b0122d`. The existing baseline records commit `856b130fc4c45fbedc9cca7a14164e8749e3fc30` at `2026-10-21T17:46:57Z`. Its file is unchanged; SHA-256 `cb56bf422174bf03225a0ea1cf29547f3f09556b152072643fda6cbc91096dc6`.

All 15 ignored audit input hashes were reconstructed from predecessor captures and match this baseline. Final-edition measurements use the refreshed local edition. The local landing comparison selects the old backed-up edition so input identity remains comparable. No shared edition is changed during preparation.

Local landing check exit 1; 0 blockers; 0 infrastructure results.

Snapshot and baseline recording remain deferred until Astra review and explicit GO. After the first checked main push, install and validate the reviewed currentness edition. In a full local checkout at that main, run `snapshot-current --run-id pds-20261021-002-current-planunit-snapshot --expected-doc-count 96 --supersedes-run-id pds-20261021-001-current-planunit-snapshot` (advance the id if occupied), then `pm-landing-check.py --record-baseline`. Commit both together as a separate follow-up. Never record a baseline to excuse this review comparison.
