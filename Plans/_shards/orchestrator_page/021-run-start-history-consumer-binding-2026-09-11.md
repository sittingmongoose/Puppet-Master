# Shard 021: Run-start history consumer binding - 2026-09-11

Source: `Plans/Orchestrator_Page.md`

Source lines: L2724-L2785

Source SHA256: `ac2b4e5b3e867049a18e838c874eb45aa731cbfa5ae40f8bc38746c5f6f25f8f`

---

## Run-start history consumer binding - 2026-09-11

**Versioned run-start reader adoption.** For `run.started`, the current reader is `orchestrator.history_run_start.v2@2.0.0` through `storage.run_started_index.v2@2.0.0` and the SP-265/SP-278 successor contract. The v1 identifiers in the following predecessor text are compatibility-only; its owner behavior and restrictions apply unchanged to v2. Current publication requires the actual admitted full rebuild and complete current index/source token. Substituting version strings or accepting an old stored digest does not upgrade a v1 reader.

Newly define `orchestrator.history_run_start.v1@1.0.0` under DL-045 as the existing focused-run History/Ledger read consumer of SP-265's `storage.run_started_index.v1@1.0.0` and shared `run_started_index_checkpoint`. Read through the selected project index range, resolve the exact source frame and immutable runtime snapshot, and match `payload.run_id` before showing a start fact. `event_type` is indexed; run identity requires validated payload lookup. One event/digest yields one historical fact and preserves the original event identity.

This binding has no independent durable cursor or writer. It does not add a tab, event, state machine, run action or notification. It retains current `active_run_id`/`focused_run_id` and `focus_mode = live | historical` routing, object-backed pivots and owner currentness checks. Historical start evidence cannot make a stopped/terminal run active, imply completion, or enable resume/retry. Missing source, stale generation, incomplete filtering or unsupported schema yields the existing degraded/unavailable presentation; an empty retained range is not a claim that no run ever existed. Normal thread visibility remains hidden after deletion; permitted content-free runtime history stays under its original retention/access rules and never restores deleted content or context.

ContractRef: ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/Contracts_V0.md#EventRecord

### OP-036 - Run-start History and Ledger reader

```yaml
plan_unit_id: OP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: Orchestrator newly defines orchestrator.history_run_start.v2@2.0.0 as its existing focused-run
  History/Ledger reader of SP-265. A verified source event and semantic digest produce one historical
  start fact after exact payload.run_id, snapshot, project, access, deletion and currentness checks. The
  reader shares the filtered checkpoint and preserves live/historical routing; it owns no separate writer
  or cursor and cannot activate a terminal run, imply completion, enable resume, add actions or recreate
  deleted thread content. The v1 reader is compatibility-only for this family; current v2 publication
  requires the explicitly admitted SP-265/SP-278 successor and complete current source/index token, with
  unchanged owner behavior.
gui_related: true
gui_classification_reason: Defines existing user-visible consumer presentation and source trust.
depends_on:
- SP-265
- SP-278
unblocks: []
acceptance_criteria:
- One exact source event/digest produces one historical start fact in the existing focused-run surface.
- Source lookup matches actual payload.run_id and preserves access/deletion/currentness checks.
- Replay does not make historical/terminal runs live, add tabs/actions, or create another cursor/writer.
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
- Plans/Orchestrator_Page.md
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
