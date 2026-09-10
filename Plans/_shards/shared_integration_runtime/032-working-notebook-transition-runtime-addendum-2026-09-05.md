# Shard 032: Working Notebook Transition Runtime Addendum (2026-09-05)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1953-L2153

Source SHA256: `5f68424017662b22dbb771645606c16ea5b9a91aebee2245e17899dc5a0aa874`

---

## Working Notebook Transition Runtime Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Transition policy is owned by `Plans/Prompt_Pipeline.md` (PP-085); this addendum routes the runtime responsibilities through existing Shared Integration Runtime machinery. A fresh context-window transition is orchestrated like any other durable operation: lifecycle records bind `OperationId`, owner generation, topology generation, projection generation, and an idempotency key; stale generations are rejected with an explicit receipt. Admission of the reconstructed request reuses `ProviderDispatchAdmissionService` unchanged — the exact new visible bytes, route, account, permission snapshot, topology, and mutation evidence are admitted and the single-use receipt is consumed atomically at dispatch; any change invalidates the receipt and forces safe re-admission.

Recovery around a transition reuses §14.2 reconciliation, not new semantics: startup reconciles nonterminal transitions and their in-flight operations against receipts, processes, lease generations, and owner truth, with outcomes `resumed | replayed | rolled_back | cleaned | quarantined | manual_recovery_required | terminal_unknown_with_disclosure`; absence of evidence never becomes success. The required cut points and their durable records are: before checkpoint (nothing durable to consult; request stays `requested`), mid-write (partial notebook writes stay uncommitted; commit barrier per `Plans/storage-plan.md`), after commit before admission (committed checkpoint is consulted; re-admission required), after admission before native activation (receipt re-validated against current generations and the current stop epoch; cancelled if a newer stop epoch exists), after native activation before PM observation (last valid PM checkpoint and authoritative history references are kept; the provider operation outcome is reconciled, never blindly replayed or promised as rollback), after PM observation before resumed turn (reconstructed request re-admitted against current state), and after partial resumed output (normal partial-turn reconciliation; no invented completion). A user Stop always wins over a pending fresh-window continuation, and late results are fenced by generation so they cannot reactivate cancelled work.

Host transfer: notebook and checkpoint records are Project Vault data. After `Plans/Project_Sync_and_Backbone.md` cutover, the old host's lease expires into `expired_pending_reconciliation` and a stale holder cannot renew, release, or mutate notebook state; the destination resumes only after current access/route validation.

```yaml
plan_unit_id: SIR-036
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Fresh context-window transitions are durable Shared Runtime operations. Their lifecycle records bind OperationId, owner/topology/projection generations, and an idempotency key; admission of the reconstructed request reuses ProviderDispatchAdmissionService with a single-use receipt bound to the exact new bytes, route, account, permission, topology, and mutation state, and any change forces safe re-admission. Crash and in-flight safety reuse §14.2 reconciliation across the seven transition cut points; unknown provider operation outcomes are reconciled, never blindly replayed or promised as rollback. A user Stop wins over a pending continuation, and late results are generation-fenced so they cannot reactivate cancelled work.
gui_related: false
gui_classification_reason: Transition runtime is backend behavior, not GUI work.
depends_on: [SIR-035, PP-085]
unblocks: [SIR-037]
acceptance_criteria:
  - Crash-before/after-commit and crash-after-activation fixtures reconcile deterministically without duplicate mutation or invented completion.
  - Stop between admission and dispatch discards the stale continuation.
  - Late results never reactivate cancelled work.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: unsafe_recovery
reasoning_tier: high
context_scope: shared_runtime
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C15
preserved_exact_tokens: ["ProviderDispatchAdmissionService", "terminal_unknown_with_disclosure", "cut points", "generation-fenced"]
negative_constraints:
  - Do not replay a mutation merely to reconstruct context.
  - Do not issue dispatch admission from an adapter.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Goal_Runtime_System.md

```yaml
plan_unit_id: SIR-037
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Notebook and checkpoint records are Project Vault data under existing lease and topology authority. After Project Move cutover the previous host lease enters expired_pending_reconciliation and a stale holder cannot renew, release, or mutate notebook or checkpoint state; the destination host resumes only after current access and route validation. Notebook payloads never contain raw credentials, and account or machine changes revalidate notebook scope, authorization, and route without inferring credentials from notes.
gui_related: false
gui_classification_reason: Lease fencing is runtime behavior, not GUI work.
depends_on: [SIR-036]
unblocks: []
acceptance_criteria:
  - A late writer on the previous host is rejected after cutover.
  - No raw credential appears in any notebook or checkpoint payload.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_writer
reasoning_tier: standard
context_scope: shared_runtime
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/Multi-Account.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I11
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A47
preserved_exact_tokens: ["expired_pending_reconciliation", "stale holder", "Project Vault data"]
negative_constraints:
  - Do not let an old host keep writing after lease transfer.
  - Do not infer credentials from note or checkpoint content.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Multi-Account.md

### SIR-038 - Profile-First Optimization And Portable Kernels

```yaml
plan_unit_id: SIR-038
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
