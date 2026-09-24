# Queued Onboarding draft identity

Closes `ONBOARDING-READY-COMPOSITION-001` against repair base `1d208d2ecfae45543578b53071a778f4600dd9f5`. `PWIZ-021` requires the queued durable draft to have an identity/revision distinct from a Project, and continuation/return projections to retain those references.

The shared schema now requires non-null draft identity/revision whenever a queued plan exists. This covers standalone continuation, result snapshots, return contexts and durable sessions, including deferred and connect-existing paths. Unqueued Welcome remains valid without an invented draft; connect-existing still has no Project or commit binding. No field, command, runtime family, migration policy or permission is added.

One existing connect-existing Back fixture incorrectly retained a queued plan while discarding its draft identity. It now retains the existing fixture draft/revision. Two new negative fixtures reproduce the actual schema hole. All other existing fixture values are unchanged. The existing storage-family inline schema was regenerated with exactly the same conditional at its two reachable locations; all other registry values are unchanged. Storage-registry shards and derived indexes were regenerated, without refreshing governance bindings.

Verification:

- Focused tests: 11 failed assertions, zero errors against the old schema; all 30 tests pass after repair, including draft-null combinations across five projection locations and two paths.
- Existing phase tests: 53/54 pass; only the pre-existing `294 != 90` storage-family census assertion fails. Settings draft tests: 11 pass.
- Full aggregate: 32 contract pairs, 1,180 positive cases, 4,051 negative cases, 12 self-tests; zero findings.
- Storage consistency, 99-document/2,721-shard check and whitespace checks pass.

External evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `queued-draft-projection-verification.json`, SHA-256 `d286124bced6725c97bd950df1573cf4476952bc8cb15442b594f3a10645f5b0`: exact parsed-data deltas, two old-valid/new-invalid fixture probes and complete focused outputs.
- `queued-draft-projection-full-contracts.json`, SHA-256 `6940134ee84c81b8826caf8ca27895e283a333d5e0db685bcb62b2a7c481061b`: complete aggregate report.
- `queued-draft-projection-red.json`, SHA-256 `c5993801e81fc6441ac86ffc35ea6a94de5fed7dd88775057ea3c052d040dc96`: failing baseline test output.
- `server_forge_backup/onboarding-queued-draft-independent-review.json`, SHA-256 `cbfc3f0cbf9a7f69ee9a02b2463e6109f06f96bdbef2b387aa8cab587724d694`: independent full-delta review and 50 old/new-schema probes, including ten previously accepted null/null cases now rejected; no findings.

This proves static contract consistency, not authenticated reference resolution, native persistence/migration, GUI behavior, readiness, governance reseal or main landing. It does not close the other packet findings.
