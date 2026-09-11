# Shard 020: Run-start evidence consumer binding - 2026-09-11

Source: `Plans/Run_Graph_View.md`

Source lines: L1277-L1330

Source SHA256: `284d95201916a33d121ad4339283ac20bb295d51e5b98889beab81d6fddfbe7e`

---

## Run-start evidence consumer binding - 2026-09-11

Newly define `run_graph.run_start_context.v1@1.0.0` under DL-045 as the existing focused-run graph/identity inspection consumer of SP-265's `storage.run_started_index.v1@1.0.0` and shared `run_started_index_checkpoint`. Resolve the verified CURRENT-selected index row to its source frame, validate the current run-start payload and immutable runtime snapshot, and match actual `payload.run_id` to `focused_run_id` in the selected project. Index values do not contain run ID and cannot establish an index-only keyed-by-run view.

The effect is one source-backed historical start/identity join in the existing graph/inspector. Preserve `active_run_id`, `focused_run_id` and `focus_mode = live | historical`; a late/replayed start never changes focus or overwrites current graph/runtime status. No new graph node, toolbar, action, notification, scheduler state or durable graph cursor follows. Reader caches are valid only under the shared checkpoint/index-generation token. Missing/stale/incomplete evidence exposes the existing unavailable/degraded trust state and cannot enable mutation. Tombstones and access checks remain effective after replay and restore; a historical run or deleted thread is not recreated from its start event.

ContractRef: ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/Contracts_V0.md#EventRecord

### RGV-019 - Run-start graph context reader

```yaml
plan_unit_id: RGV-019
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph newly defines run_graph.run_start_context.v1@1.0.0 as the existing graph inspector reader of
  SP-265. It matches the selected project and focused_run_id through the validated source payload and
  immutable runtime snapshot, and publishes one historical identity join under the shared checkpoint and
  generation token. It preserves active_run_id, focused_run_id and live/historical focus_mode; replay
  cannot move focus, change graph/runtime state, recreate deleted content or enable mutation from missing,
  stale or unavailable evidence.
gui_related: true
gui_classification_reason: "Defines existing user-visible consumer presentation and source trust."
depends_on: [SP-265]
unblocks: []
acceptance_criteria:
  - "Run identity is established through validated source payload and immutable snapshot, not index metadata alone."
  - "All reads use the SP-265 shared token and existing focus_mode routing; replay does not change focus, graph state or mutation authority."
  - "Missing, deleted or stale source cannot resurrect content or enable graph actions."
validation_surfaces:
  - Plans/run_started_consumer_contracts.schema.json
  - Plans/run_started_consumer_contract_fixtures.json
  - Native execution of the named replay, crash, source-lookup and custody pairs remains required.
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
  - Plans/Run_Graph_View.md
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
