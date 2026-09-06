# Shard 041: Shared Integration Runtime persistence and migration addendum (2026-08-13)

Source: `Plans/storage-plan.md`

Source lines: L17951-L18125

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Shared Integration Runtime persistence and migration addendum (2026-08-13)

### Canonical mapping

Shared runtime uses the existing storage stack and creates no peer database:

| Data | Authority and engine |
|---|---|
| Individually Event Authority-admitted semantic lifecycle events | `EventRecord` in seglog only; no shared-runtime event is admitted by this addendum. |
| Installation lifecycle, connection/domain state, permission snapshots, resource admission, single-use dispatch receipts, outbox, leases, Debug/Eval/MCP session state, conditional-rule/BSD evidence, Goal lineage, and operational attribution | redb canonical families after their closed value schema is materialized. |
| Current topology, installation inventory, ObservableWork, Operational Awareness, bounded prompt state, replay checkpoints, coalescing evidence, and thread shell/pinned/detail state | redb derived projections/checkpoints; rebuildable from named canonical events/values and never canonical event producers. |
| Search | Tantivy derived indexes over redacted labels, summaries, and stable refs only; raw catalogs, logs, paths, request bytes, secrets, and inventories are excluded. |
| Diagnostics/export | JSON/JSONL only; import-only legacy lineage is never live authority. |

SQLite is prohibited as Puppet Master storage. Provider dispatch evidence stores
the finalized request and structured attachment-manifest SHA-256 values plus
artifact/decision/resource-admission/lineage refs, never their raw bytes. Opaque provider-owned SQLite files
remain outside Puppet Master authority and are neither imported nor queried.
Secrets remain in the operating-system credential store. redb, seglog, Tantivy,
JSONL, migration backups, journals, receipts, and artifacts store only non-secret
refs, redacted metadata, approved hashes, and bounded evidence.

The registry materializes only owner-closed value definitions. Shared Runtime now
closes the previously deferred inventory, capability provisioning, lease, outbox,
replay/checkpoint, Debug, Eval, conditional-rule, BSD, and coalescing vocabularies,
plus the exact thread shell/pinned/detail projections, MCP component lifecycle, and
Usage-owned operational-attribution record;
Goal Runtime separately closes durable Goal/Plan/thread/agent lineage. Debug identity
reuses `dev_session_record.v1` with subordinate `dap_session_id`; paused variables,
stacks, and console data remain session-ephemeral. `ProviderRequestPermit` is not a
storage family. Its only durable evidence remains
`provider_dispatch_admission_receipt`.

The registry therefore contains 88 families: 66 materialized, 21 deferred, and one
compatibility alias. The exact closed set added or promoted by this addendum is 27
families: 26 roots from `Plans/shared_runtime_contracts.schema.json` (pairwise
connection/domain/outbox/replay/lease/MCP transition and provider-dispatch-attempt
validator envelopes are intentionally not storage families)
plus `goal_runtime_lineage_record` from
`Plans/goal_runtime_lineage.schema.json`. Each registry-local schema is a
deterministic exact copy of its owner definition with every transitively reachable
local `$defs` dependency; Storage owns persistence disposition, not domain meaning.
Canonical records use mandatory-backup recovery; explicitly derived projections use
rebuild-from-authority disposition and cannot become authority. The materializer
computes its denominator and transitive dependency set instead of retaining a fixed
July/August floor. This is schema/registry closure only: it creates no redb table,
runs no data migration, admits no EventRecord, and proves no runtime/buildability or
provider-network dispatch.

### Forward-only migration and recovery

`StorageMigrationCoordinator` is the only actor allowed to materialize or upgrade
these families. The mandatory order is:

1. validate the owner prose, standalone closed schema, registry row, current
   store version, family aliases, and secret rejection rules;
2. acquire the storage-maintenance lease and complete the exact
   `migration_preflight_result`, including the enforced reserve arithmetic;
3. record source schema versions and hashes, create a mandatory backup for every
   non-rebuildable family, and read-back verify its manifest and bytes before any
   mutation;
4. create the same-root durable journal with stable idempotent step IDs, then
   create redb tables/index/checkpoints and projector/Tantivy definitions;
5. copy forward validated values from explicitly declared aliases/deferred bundles
   in one forward transaction, stop alias writes, and never lazy-rewrite on read;
6. validate counts, canonical encodings, hashes, identity joins, FileSafe and
   permission refs, no-raw-secret rejection, and derived-source coverage;
7. write the new store schema stamp last, reopen, replay/catch up derived
   projections, and rebuild Tantivy/JSONL only from authoritative sources;
8. append the sole existing `migration_receipt` after read-back proof. On
   interruption, journal evidence selects completion, one automatic verified
   restore, quarantine, or `manual_recovery_required`; absence of evidence is
   never success.

For the future 59-to-84-family store migration, the 25 newly registered exact
families begin empty unless a declared, schema-compatible source family is named in
the migration plan. No grouped deferred inventory row, UI projection, packet receipt,
`ProviderRequestPermit`, FileSafe receipt, immutable-intent record, or legacy
dispatch value may be imported by resemblance. Existing permission snapshots and
dispatch receipts retain their exact keys and bytes. Canonical families require
mandatory-backup custody before first mutation; derived families rebuild only from
their named owner authority after quarantine. Every family preserves version-last
stamping, unresolved-recovery mutation fences, and its individual retention policy.
This paragraph specifies the future migration; no store bytes or schema version are
changed by this canon-closure wave.

`migration_progress_snapshot` remains journal-derived progress, not a family,
event, or receipt. `storage_recovery_contracts.schema.json` owns exactly the
preflight result, journal-derived progress snapshot, and the one existing
`migration_receipt` value shape; it creates no peer receipt or event family.

### SP-246 - Shared Runtime Storage Engine And Family Routing

```yaml
plan_unit_id: SP-246
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Shared runtime persists admitted semantic events only in seglog, closed current
  state and evidence in redb, derived redacted search in Tantivy, and diagnostics
  in JSON/JSONL, with no SQLite, raw secrets, peer event log, or inferred event
  authority; every now-owner-closed shared-runtime family is schema-materialized.
gui_related: false
depends_on: [SP-235, SP-236, SP-243, SIR-011, CV-324]
unblocks: []
acceptance_criteria:
  - Prose and the standalone schema route canonical, derived, checkpoint, and receipt values without a peer database or generic shared-runtime event.
  - Tantivy indexes only redacted labels/summaries/refs and is always rebuildable from authoritative source.
  - ProviderRequestPermit is absent as a family; exactly one provider_dispatch_admission_receipt row and one permission_snapshot_record row remain materialized from the closed shared schema bundle.
  - The 26 durable Shared Runtime bundle roots and one Goal lineage root are each materialized exactly once with transitive owner-schema dependencies; pairwise transition and dispatch-attempt validation envelopes are not persisted.
  - The registry has exactly 88 families with 66 materialized, 21 deferred, and one compatibility alias; materialization does not imply a database migration, runtime implementation, Event Authority, or buildability readiness.
validation_surfaces:
  - JSON Schema validation of Plans/storage_value_registry.json
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
  - python3 scripts/pm-implementation-readiness.py self-test
risk_class: storage_authority_or_schema_drift
reasoning_tier: high
context_scope: shared_runtime_storage_mapping
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/shared_runtime_contracts.schema.json]
node_compile_hint: {mode: shared_runtime_storage_mapping, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not use SQLite or adopt provider-owned databases.
  - Do not materialize a lifecycle until its owner closes the enum and invariants; do not retain a false blocker after that closure is accepted.
  - Do not register an EventRecord family in this wave.
owner_hints: [Plans/storage-plan.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```

### SP-247 - Shared Runtime Forward Migration And Artifact-Backed Recovery

```yaml
plan_unit_id: SP-247
unit_type: migration_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  StorageMigrationCoordinator alone performs shared-runtime schema migration using
  exact preflight, maintenance lease, source hashes, verified mandatory backup
  before mutation, same-root idempotent journal, one forward transaction, read-back
  and secret/join validation, version-last stamp, reopen/replay/rebuild, and the sole
  migration_receipt; one verified restore attempt precedes fail-closed manual recovery.
gui_related: false
depends_on: [SP-235, SP-246, CV-321]
unblocks: []
acceptance_criteria:
  - No mutation occurs before preflight, maintenance lease, and read-back-verified mandatory backup.
  - Copy-forward is explicit and forward-only; compatibility/deferred aliases become read-only and never lazy-rewrite.
  - Counts, hashes, joins, canonical encodings, and raw-secret rejection pass before the version stamp is written last.
  - Restart is decided from durable journal/receipt evidence and cannot report success from missing evidence.
  - Recovery outputs link backup, journal, validation, receipt, disclosure, and artifact refs without embedding raw content.
validation_surfaces:
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
  - python3 scripts/pm-storage-recovery-contracts.py --self-test
  - pre-build negative fixtures for arithmetic, timestamps, transitions, rollback, data-risk, and secret/path rejection
  - future implementation-stage crash-cut, ENOSPC, EIO, corrupt-journal, and restore execution
  - Draft 2020-12 validation of storage recovery contracts
risk_class: unsafe_storage_migration_or_false_recovery
reasoning_tier: high
context_scope: shared_runtime_storage_migration_recovery
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_recovery_contracts.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: shared_runtime_storage_migration, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not stamp a new version before read-back validation.
  - Do not create a second migration receipt or treat progress as a receipt.
  - Do not claim unavailable platform/failure-injection lanes passed.
owner_hints: [Plans/storage-plan.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```
