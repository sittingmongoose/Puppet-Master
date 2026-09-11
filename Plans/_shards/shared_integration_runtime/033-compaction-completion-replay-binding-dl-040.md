# Shard 033: Compaction completion replay binding (DL-040)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2001-L2046

Source SHA256: `a262a1e77b79f096be363d63b1531c1d3ad97b04d68e3b2a9cbf0b1ccdd26405`

---

## Compaction completion replay binding (DL-040)

Define `shared_runtime.thread_detail_compaction_replay.v1`, binding version `1.0.0`, as the delivery binding of existing `ProjectionReplayCoordinator` to ACD-461 consumer `assistant_chat.focused_thread_detail.compaction.v1` and projector `assistant_chat.focused_thread_projector.v1` (both binding version `1.0.0`). This names the previously missing compaction-only binding under explicit EA-S6-001 approval. It creates no new replay service, scheduler, event consumer for other families, or runtime proof.

The exact target/value schema is `thread_detail_projection.v1:{project_id}:{thread_id}:{detail_generation}` / `pm.shared_runtime.thread_detail_projection.v1@1.0.0`. The coordinator's exact checkpoint is `replay_snapshot_checkpoint.v1:{environment_id}:thread_detail:{checkpoint_id}` / `pm.shared_runtime.replay_snapshot_checkpoint.v1@1.0.0`, where SP-259 defines `checkpoint_id` from the actual project/thread pair and binds the verified environment and Storage survivor evidence. Subscribe and buffer live first, establish validated replay/snapshot coverage, apply in sequence, drain, then publish under the existing lifecycle. The shared coordinator and focused-thread projector commit the completion effect and its checkpoint as one redb transaction within the serialized full-detail reducer barrier. That checkpoint certifies only this binding’s coverage; whole-detail cursor/current-state publication also requires verified application of every effect owned by the existing full-detail coordinator and all SP-259 identity, epoch, generation, contiguous-coverage, deletion and currentness predicates. Live buffering and replay share event identity, so overlap cannot add a second activity reference.

Use the existing stable `operation_id` and current `operation_generation` for compaction, with LeaseCoordinator fencing. The compaction commit coordinator holds the thread head/deletion fence through the Case L-2 barrier decision and prevents a stale generation from appending. Uncertain append results reconcile by original idempotency identity before helper retry or head selection. Replay is projection-only: no helper dispatch, tools, notifications, billing, canonical mutation or derived completion event. Deleted-thread suppression and typed unavailable refs apply to live, replay, snapshot and restored projections equally. A missing/unknown schema or owner binding, bad snapshot, uncovered gap, epoch conflict or buffer overflow fences publication and preserves the last verified applied checkpoint until the existing resnapshot/degraded path resolves it.

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-461, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Prompt_Pipeline.md#PP-078, SchemaID:pm.shared_runtime.contracts.v1
### SIR-038 - Compaction Completion Replay Binding

```yaml
plan_unit_id: SIR-038
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ProjectionReplayCoordinator delivers compaction completion to the explicitly named focused-thread consumer/projector using the existing checkpoint family, transactionally advancing projection and replay currentness under SP-259.
gui_related: false
gui_classification_reason: This unit defines persisted-event contracts and owner boundaries.
depends_on: []
unblocks: []
acceptance_criteria:
  - "Live-before-replay, dedupe, snapshot validation and epoch/generation/currentness predicates apply to this exact compaction-only binding."
  - "Operation/lease retries reconcile the original committed record; replay never invokes compaction or recreates deleted content."
validation_surfaces:
  - Plans/context_compaction_completion_contract_fixtures.json
  - reports/event-authority-20260911/step-06-contract-validation.md
risk_class: compaction_completion_authority
reasoning_tier: high
context_scope: compaction_completion_event_authority
implementation_surfaces:
  - Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-040
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```
