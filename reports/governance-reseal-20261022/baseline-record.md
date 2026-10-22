# Frozen baseline and deferred follow-up — 2026-10-22

Frozen main: `2cf22e20b357d1cc6f5d0840441bf22716a16319`. The existing baseline records commit `78e29008cb73fbb51e8d4ec17643dea4281a34b7` at `2026-10-21T23:34:39Z`. Its file is unchanged; SHA-256 `25941168df82b5b4c674e0eacd4103d3443130428b341784ad2cc9f83261dd9e`.

All 15 ignored audit input hashes were reconstructed from predecessor captures and match this baseline. Final-edition measurements use the refreshed local edition. The local landing comparison writes the old backed-up generated files into the same local audit directory and selects that directory explicitly, so input identity remains comparable. The final edition is restored afterward. No shared edition is changed during preparation.

Local landing check exit 1; 0 blockers; 0 infrastructure results.

Snapshot and baseline recording remain deferred until Astra review and explicit GO. After the first checked main push, install and validate the reviewed currentness edition. In a full local checkout at that main, run `snapshot-current --run-id pds-20261022-001-current-planunit-snapshot --expected-doc-count 96 --supersedes-run-id pds-20261021-003-current-planunit-snapshot` (advance the id if occupied), then `pm-landing-check.py --record-baseline`. Commit both together as a separate follow-up. Never record a baseline to excuse this review comparison.
