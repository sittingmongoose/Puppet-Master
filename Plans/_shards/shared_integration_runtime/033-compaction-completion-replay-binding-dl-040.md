# Shard 033: Compaction completion replay binding (DL-040)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2028-L2200

Source SHA256: `e41fc7b712796ea356e0378d22c411e16744092eef07da738623d5289d9b1809`

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

### SIR-043 - Profile-First Optimization And Portable Kernels

```yaml
plan_unit_id: SIR-043
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Performance optimization follows profile, eliminate work and copies, improve scheduling/layout/locality, select measured libraries and LTO/PGO, then runtime-dispatched SIMD; handwritten assembly requires a remaining measured bottleneck and portable equivalence. Kernel specialization never raises the global CPU baseline or substitutes microbenchmarks for end-to-end proof.
gui_related: false
depends_on: [SIR-004, SIR-015, SIR-017, SIR-018]
unblocks: []
acceptance_criteria:
  - "Retain measured candidate kernels for delimiter/framing, prefix/suffix/diff comparison, checksum/hash, redaction, ANSI, search/vector, image, and bitset work."
  - "Every specialization has capability detection, a portable fallback, differential/equivalence tests, and fuzz coverage of bounds, errors, and security behavior."
  - "Retain portable x86-64 and native arm64 with no global AVX2 or target-cpu=native requirement."
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, tests/test_pm_full_thread_contracts.py, future native startup and whole-process-tree performance captures]
risk_class: unsupported_or_unmeasured_optimization
reasoning_tier: high
context_scope: profile_first_portable_optimization
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: retained_performance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:8-48
preserved_exact_tokens: ["LTO","PGO","SIMD","portable fallback"]
negative_constraints:
  - "Do not optimize by weakening bounds, redaction, provenance, or security checks."
  - "Do not claim runtime performance from static contract coverage."
```

### SIR-039 - Adaptive Physical-Core And Multi-Resource Admission

```yaml
plan_unit_id: SIR-039
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  The existing RuntimeResourceGovernor adapts admitted parallelism from measured work-family throughput and latency, physical-core and SMT capacity, heterogeneous-core capability, and simultaneous memory, bandwidth, storage, process, GPU/media, and external-pool budgets under one physical parent.
gui_related: false
depends_on: [SIR-004, SIR-015, SIR-017, SIR-018]
unblocks: []
acceptance_criteria:
  - "Physical cores and SMT siblings are not assumed to be equivalent units of usable capacity."
  - "Suitable independent work can use slower cores without placing the interactive critical path behind them; platform QoS rules remain controlling."
  - "External library and domain pools are charged to the same physical parent and no CPU-count formula bypasses another exhausted resource budget."
  - "Required specialists and tests remain queued in admitted waves rather than silently omitted."
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, tests/test_pm_full_thread_contracts.py, future native startup and whole-process-tree performance captures]
risk_class: oversubscription_or_critical_path_starvation
reasoning_tier: high
context_scope: adaptive_physical_resource_admission
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: retained_performance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:153-163
preserved_exact_tokens: ["RuntimeResourceGovernor","SMT","GPU","media"]
negative_constraints:
  - "Do not create another scheduler or physical resource owner."
  - "Do not treat logical CPU count as a universal concurrency setting."
```

### SIR-040 - Staged Native Startup And Selected-Surface Hydration

```yaml
plan_unit_id: SIR-040
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Startup presents the native window, compact cached shell, live Server/runtime/storage reconciliation, selected visible hydration, and deferred maintenance/inactive-Project work in that order. Cold domain inventories are not an application-wide startup barrier and cached presentation is not readiness.
gui_related: true
gui_classification_reason: Startup presentation or visible hydration and eviction behavior affects the GUI.
depends_on: [SIR-004, SIR-015, SIR-017, SIR-018]
unblocks: []
acceptance_criteria:
  - "Do not wait for all Vaults, providers/CLIs, CEF helpers, indexes, Chat/Goal histories, backups, integration-version checks, or remote hosts before presenting the shell."
  - "Hydrate only the selected visible surface before admitting unrelated deferred work."
  - "Display cached/currentness truth and enforce security and recovery fences before affected actions or mutations."
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, tests/test_pm_full_thread_contracts.py, future native startup and whole-process-tree performance captures]
risk_class: startup_global_hydration_barrier
reasoning_tier: high
context_scope: staged_native_startup
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: retained_performance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:284-307
preserved_exact_tokens: ["native window","compact cached shell","selected visible surface"]
negative_constraints:
  - "Do not fabricate readiness while presenting cached state."
  - "Do not remove permission or recovery preconditions to accelerate startup."
```

### SIR-041 - Hot Warm Cold Residency And Bounded Representations

```yaml
plan_unit_id: SIR-041
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Runtime memory uses byte-budgeted hot, warm, and cold residency with demand hydration and explicit eviction/reload. All channels, media, caches, histories, retries, evidence buffers, and connection/process pools are bounded; payloads use lifetime-safe pooled or borrowed buffers and references without redundant raw/normalized/UI/storage/log retention.
gui_related: true
gui_classification_reason: Startup presentation or visible hydration and eviction behavior affects the GUI.
depends_on: [SIR-004, SIR-015, SIR-017, SIR-018]
unblocks: []
acceptance_criteria:
  - "Hot data is visible/active interaction state; warm data is compact IDs, offsets, summaries, thumbnails, projections, and working indexes; full histories and inactive artifact/index bodies remain cold."
  - "Byte caps cover async channels, provider fragments, terminal buffers, images/GPU surfaces, video/capture rings, diff/syntax caches, search/index caches, notifications, Browser artifacts, retries, undo histories, log/receipt buffers, connection pools, and process pools."
  - "Backpressure, safe coalescing, redacted spill, or explicit degradation precedes unbounded growth."
  - "Raw provider bodies are discarded after normalization unless a bounded authorized diagnostic capture retains them; blobs are referenced, media is content-addressed, and ID interning/job arenas are bounded."
  - "Memory optimization preserves canonical event/receipt content, required provenance, durable work, and security/terminal evidence."
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, tests/test_pm_full_thread_contracts.py, future native startup and whole-process-tree performance captures]
risk_class: unbounded_memory_or_evidence_loss
reasoning_tier: high
context_scope: bounded_residency_and_representation
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: retained_performance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:338-381
preserved_exact_tokens: ["hot","warm","cold","byte caps","content address"]
negative_constraints:
  - "Do not use row counts as a replacement for byte budgets."
  - "Do not discard authority evidence as ordinary repaint traffic."
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-015, ContractName:Plans/Shared_Integration_Runtime.md#SIR-017, ContractName:Plans/DRY_Rules.md, SchemaID:pm.full_thread_runtime.contracts.v1
