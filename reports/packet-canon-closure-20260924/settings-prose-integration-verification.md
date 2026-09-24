# Settings search prose integration

Integrated source: `13a4683a583f61544ba3c528b2b49aa5d963408e`, onto repair
branch base `fd6a80a8fa08fb6db39f56eadfde19c5dc96f5e3`.

SSYS-005/019 now retain stable search-result identity, destination metadata,
the seven source scenarios, navigation-only activation, and exact selected-result
return separately from focus. Current K3/Escape, manager placement, conditional
already-supported Help and no eager manager hydration remain unchanged.

The independent prose review passed against the exact source commit:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/server_forge_backup/settings-search-prose-independent-review.json`
SHA-256 `f855fbbd44ace594614f9f50826821aff6ac8d104688ed669d82fbba7df7eaef`.

Four generated index files conflicted during integration. No generated conflict
was hand-merged. A full in-memory generation was compared with the entire
independently reviewed Settings delta plus the existing integrated SCM/Tour/Goal
state. All six complete stable output comparisons passed. Actual regeneration
then matched all six preview hashes, retaining the SCM source-drift row and the
already-correct Tour storage expected hash without changing any sealed binding.

Preview:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/settings-prose-integrated-index-preview.json`
SHA-256 `2bfcdbb70f6c673581f56c81bd21bce38ef6d9d81175d90daf0fb15a3b825b8a`.

Verification on the integrated worktree:

- All 19 `test_pm_settings*` tests pass, including four prose regressions.
- Index validation passes: 6,719 PlanUnits and 26,224 acceptance units.
- Shard regeneration and check pass: 99 documents, 2,721 shards; no shard changes.
- `git diff --check HEAD` passes.

This is owner-prose preservation and static verification only. The separate
search schema/fixture companion is not approved by this record. Readiness remains
`blocked_runtime_certification_incomplete`. No native GUI/runtime proof,
governance binding refresh, main landing or expanded landing exception is claimed.
The PM bootstrap planning-ledger skill governed derived-file regeneration and
the prohibition on premature governance/WorkNode admission.
