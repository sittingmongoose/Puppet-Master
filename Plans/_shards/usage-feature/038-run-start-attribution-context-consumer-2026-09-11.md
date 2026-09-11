# Shard 038: Run-start attribution context consumer - 2026-09-11

Source: `Plans/usage-feature.md`

Source lines: L7045-L7099

Source SHA256: `7ceb20e33f7d4c893a4f99f501dcad5a1c3ce0f09f9d93cc71dcf45225afad08`

---

## Run-start attribution context consumer - 2026-09-11

Newly define `usage.run_start_attribution.v1@1.0.0` under DL-045 as the existing runtime-attribution read consumer of SP-265's `storage.run_started_index.v1@1.0.0` and shared `run_started_index_checkpoint`. It obtains project/run/thread and requested/effective runtime context only after current index-to-source lookup, exact `payload.run_id` matching and immutable snapshot validation. It retains the source event/snapshot refs as correlation, with owner permission checks before account-sensitive disclosure. It does not copy snapshot content into a new Usage store or maintain an independent durable cursor.

The canonical analytics/UsageRecord pipeline is unchanged. A run-start event is neither `usage.event` nor `run.completed.usage`: consuming it cannot create a UsageRecord, token/request count, cost, quota, settlement, elapsed-time partition, rollup update or notification. Missing usage stays unknown, never zero; existing UsageRecord/usage_event_ref identity and attempt/provider accounting authority prevail over run context. Compatibility replay, duplicate delivery, checkpoint rebuild, restart and lost acknowledgement produce zero accounting effects. Do not relabel an existing UsageRecord's settled attribution from a later start or current Settings. A mismatch is incomplete/conflicting correlation under existing Usage trust semantics, not permission to guess or silently repair accounting.

ContractRef: ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/usage-feature.md#UF-085

### UF-102 - Run-start attribution context reader

```yaml
plan_unit_id: UF-102
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage newly defines usage.run_start_attribution.v1@1.0.0 as a read-only correlation consumer of SP-265.
  Verified run-start source and immutable snapshot joins supply project/run/thread and requested/effective
  attribution context with owner permission checks, while UsageRecord and usage_event_ref remain accounting
  authority. Duplicate delivery, compatibility replay, checkpoint rebuild and restart produce no
  UsageRecord, token/request count, cost, quota, settlement, elapsed-time partition or rollup effect.
  Missing usage remains unknown, and conflicting correlation cannot repair settled attribution from current
  Settings or copy snapshot content into a new Usage store.
gui_related: true
gui_classification_reason: "Defines existing user-visible consumer presentation and source trust."
depends_on: [SP-265]
unblocks: []
acceptance_criteria:
  - "Validated start identity is correlation context only; UsageRecord and usage_event_ref remain accounting authority."
  - "All duplicates/replay/recovery produce zero accounting or quota/settlement/rollup effects."
  - "Missing source or conflicting correlation remains explicit; no invented zero usage, current-settings attribution repair, or checkpoint account payload is allowed."
validation_surfaces:
  - Plans/run_started_consumer_contracts.schema.json
  - Plans/run_started_consumer_contract_fixtures.json
  - Native execution of the named replay, crash, source-lookup and custody pairs remains required.
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
source_atom_ids: []
negative_constraints:
  - No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
  - No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
```
