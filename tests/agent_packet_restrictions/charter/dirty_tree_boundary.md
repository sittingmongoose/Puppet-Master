# Dirty checkout and write-boundary record

- Recorded UTC: `2026-08-02T19:40:38Z`
- Repository: `/Users/jaredsmacbookair/Documents/PuppetMaster`
- Branch: `main`
- HEAD: `71d039c6f7827068beb536eebde4b414a69d7afc`
- Upstream projection at observation: `origin/main`, Git reported `+0 -0` for the checked-out branch.
- Pre-test Git status entry count: `1577`
- Pre-test status classification: `1059` modified, `0` added, `143` deleted, `375` untracked status entries.
- Tracked dirty-path count: `1202`
- Untracked file count: `11001`
- NUL-delimited status SHA-256: `c69d05ec16a4c1685632e4f51ac7f318acb49328329e455035f42d75061d0b2b`
- Tracked dirty-path-list SHA-256: `8e12852441cb05fd8ca503da14cc4206207d440164c9966f795ac176465c5487`
- Untracked file-list SHA-256: `62eeb9dd3c9a9953756b9324c51252269d8ac306f32a56b9e3656deeb13a6c10`

## Boundary

This testing lane may read the saved checkout but may create or change files only below:

`/Users/jaredsmacbookair/Documents/PuppetMaster/tests/agent_packet_restrictions/`

The following are prohibited for this lane: reset, clean, stash, rebase, checkout-over, revert, overwrite of pre-existing work, staging, commit, and push. Canonical Plans, the active ledger, product code, existing tests, generated governance artifacts, and every path outside the exclusive root are read-only.

The status snapshot intentionally describes the checkout before any test-lane files were added. Later status comparisons must exclude `tests/agent_packet_restrictions/` and prove that the outside-root tracked and untracked projections did not change.
