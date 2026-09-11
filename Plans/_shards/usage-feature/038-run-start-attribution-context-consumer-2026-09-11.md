# Shard 038: Run-start attribution context consumer - 2026-09-11

Source: `Plans/usage-feature.md`

Source lines: L7045-L7109

Source SHA256: `3f0a8dcc889ec2cd2f2a0df746594ff699966d6850c730b316a7ab5bd4926c6d`

---

## Run-start attribution context consumer - 2026-09-11

**Versioned run-start reader adoption.** For `run.started`, the current reader is `usage.run_start_attribution.v2@2.0.0` through `storage.run_started_index.v2@2.0.0` and the SP-265/SP-278 successor contract. The v1 identifiers in the following predecessor text are compatibility-only; its owner behavior and restrictions apply unchanged to v2. Current publication requires the actual admitted full rebuild and complete current index/source token. Substituting version strings or accepting an old stored digest does not upgrade a v1 reader.

Newly define `usage.run_start_attribution.v1@1.0.0` under DL-045 as the existing runtime-attribution read consumer of SP-265's `storage.run_started_index.v1@1.0.0` and shared `run_started_index_checkpoint`. It obtains project/run/thread and requested/effective runtime context only after current index-to-source lookup, exact `payload.run_id` matching and immutable snapshot validation. It retains the source event/snapshot refs as correlation, with owner permission checks before account-sensitive disclosure. It does not copy snapshot content into a new Usage store or maintain an independent durable cursor.

The canonical analytics/UsageRecord pipeline is unchanged. A run-start event is neither `usage.event` nor `run.completed.usage`: consuming it cannot create a UsageRecord, token/request count, cost, quota, settlement, elapsed-time partition, rollup update or notification. Missing usage stays unknown, never zero; existing UsageRecord/usage_event_ref identity and attempt/provider accounting authority prevail over run context. Compatibility replay, duplicate delivery, checkpoint rebuild, restart and lost acknowledgement produce zero accounting effects. Do not relabel an existing UsageRecord's settled attribution from a later start or current Settings. A mismatch is incomplete/conflicting correlation under existing Usage trust semantics, not permission to guess or silently repair accounting.

ContractRef: ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/usage-feature.md#UF-085

### UF-102 - Run-start attribution context reader

```yaml
plan_unit_id: UF-102
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage newly defines usage.run_start_attribution.v2@2.0.0 as a read-only correlation consumer
  of SP-265. Verified run-start source and immutable snapshot joins supply project/run/thread and requested/effective
  attribution context with owner permission checks, while UsageRecord and usage_event_ref remain accounting
  authority. Duplicate delivery, compatibility replay, checkpoint rebuild and restart produce no UsageRecord,
  token/request count, cost, quota, settlement, elapsed-time partition or rollup effect. Missing usage
  remains unknown, and conflicting correlation cannot repair settled attribution from current Settings
  or copy snapshot content into a new Usage store. The v1 reader is compatibility-only for this family;
  current v2 publication requires the explicitly admitted SP-265/SP-278 successor and complete current
  source/index token, with unchanged owner behavior.
gui_related: true
gui_classification_reason: Defines existing user-visible consumer presentation and source trust.
depends_on:
- SP-265
- SP-278
unblocks: []
acceptance_criteria:
- Validated start identity is correlation context only; UsageRecord and usage_event_ref remain accounting
  authority.
- All duplicates/replay/recovery produce zero accounting or quota/settlement/rollup effects.
- Missing source or conflicting correlation remains explicit; no invented zero usage, current-settings
  attribution repair, or checkpoint account payload is allowed.
validation_surfaces:
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
- Native execution of the named replay, crash, source-lookup and custody pairs remains required.
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: run_started_owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-run-started-depth.json
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
source_atom_ids: []
negative_constraints:
- No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
- No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
```
