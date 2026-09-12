# Shard 033: Compaction completion replay binding (DL-040)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2028-L2408

Source SHA256: `2b65f01d132470fa8ff9bb2c748a69d2454964c49bf1641414f95fb395a5d362`

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


### SIR-042 - Full Thread Typed Result Binding And Central Response Projection

```yaml
plan_unit_id: SIR-042
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: "Existing Full Thread command outcomes bind separately owned result/error records and feed CV-333. Command, governor and work axes remain independent; only actual owner operations have durable Full Thread identity."
gui_related: false
gui_classification_reason: This governs backend record binding and dispatcher contracts.
depends_on: [SIR-015, CV-333]
unblocks: []
acceptance_criteria:
  - "CommandOutcomeRecord has present owner_result_ref, owner_result_schema_ref and owner_result_sha256 fields, null together only before a result exists and all non-null for terminal outcomes."
  - "Authenticate and validate the actual result before publishing its exact schema identity and canonical-JSON digest; matching shape or hash alone never establishes authority."
  - "Same-frame acknowledgement remains independent of terminal owner verification, and command completion does not fabricate ObservableWork completion."
  - "Application-scope operations do not invent a Project; local-only route/open and pre-dispatch refusals do not invent Server or operation scope."
  - "Replay preserves the original owner result, outcome, receipt and command identity with zero repeated effects; terminal_unknown remains recovery-required."
  - "Schema evolution is a pre-build contract correction; old minimal records remain explicit unbound read/import lineage until actual missing references are resolved."
validation_surfaces: [Plans/ui_command_response_fixtures.json, tests/test_pm_ui_command_response.py, python3 scripts/pm-plans-verify.py validate-ui-command-response, python3 scripts/pm-plan-index.py validate]
risk_class: command_response_identity_or_false_completion
reasoning_tier: high
context_scope: central_command_response_bridge
implementation_surfaces: [Plans/full_thread_runtime_contracts.schema.json, Plans/ui_command_response.schema.json, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: static_command_response_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/Shared_Integration_Runtime.md#SIR-015]
negative_constraints:
  - No native dispatcher, owner authentication, effect execution, new command, event or physical storage-family admission is proved by static fixtures.
  - No second command outcome owner, fabricated operation scope, automatic retry of unknown effects, or governance/readiness lift.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/ui_command_response.schema.json, ContractName:Plans/Shared_Integration_Runtime.md#SIR-015


For the installed SP-285 pending recovery route, actual canonical pending custody delegates the original normalized identity/payload digest, original dispatch ID and genuine nonterminal SIR outcome. Initial dispatch authentication occurs before pending publication; restart never downgrades success or recreates raw dispatch payloads. SIR alone advances that same original operation. Preserve an existing acknowledgement; if absent, acknowledge in the actual current recovery frame. Bind current full owner identity, target generation, availability, frame and revision. Resolve the actual SP-286 receipt before the final complete owner-local guard, then publish terminal companion/result/outcome/response atomically with no dependent resolver between guard and publication. Stale completion preserves pending custody and current legitimate holds; no silent redispatch or new operation is allowed.

### SIR-044 - Original create-command outcome delegated custody

```yaml
plan_unit_id: SIR-044
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: For cmd.chat.create_restore_point, Shared Integration Runtime delegates custody of its
  exact original CommandOutcomeRecord to the canonical SP-274 command-result value while retaining exclusive
  semantic production and authentication authority. The resolver returns the same original outcome and
  its separately typed owner-result join for app-root replay. SP-285 preserves first-capture authentication
  and permits later immutable retained-row resolution without disposed raw source/dispatch/transaction
  inputs; combined available-created inspection requires original_create_result_custody.
  Installed SP-285 pending recovery authenticates retained original dispatch custody, uses SP-286 first receipt and publishes only after the final complete owner-local runtime/domain guard.
gui_related: false
gui_classification_reason: This unit defines durable authority, authenticated custody and replay, with
  no visual presentation contract.
split_recommended: false
depends_on:
- SP-274
- CV-333
- DL-045
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Only the actual original SIR operation authority can supply or advance its pending outcome; Storage
  cannot synthesize an outcome from a caller, result, event or current topology.
- Terminal outcome bytes, identity, schema and separately computed owner-result hash and references are
  preserved in the same committed SP-274 publication and mandatory backup.
- Historical resolution preserves the original operation, topology and command identity; passive replay
  writes nothing and cannot create a global outcome writer.
- Initial source authentication remains complete; later original-result reads authenticate immutable retained
  canonical custody and current disclosure authority without retired raw source/transaction controls or
  reconstructed outcome/receipt facts.
- For the installed SP-285 pending recovery route, actual canonical pending custody delegates the original normalized identity/payload digest, original dispatch ID and genuine nonterminal SIR outcome. Initial dispatch authentication occurs before pending publication; restart never downgrades success or recreates raw dispatch payloads. SIR alone advances that same original operation. Preserve an existing acknowledgement; if absent, acknowledge in the actual current recovery frame. Bind current full owner identity, target generation, availability, frame and revision. Resolve the actual SP-286 receipt before the final complete owner-local guard, then publish terminal companion/result/outcome/response atomically with no dependent resolver between guard and publication. Stale completion preserves pending custody and current legitimate holds; no silent redispatch or new operation is allowed.
validation_surfaces:
- Plans/restore_point_create_result.schema.json
- Plans/restore_point_create_result_fixtures.json
- Plans/restore_point_create_result_join_fixtures.json
- Plans/restore_point_create_result_native_pairs.json
- Plans/storage_value_registry.json
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_original_result_authority
reasoning_tier: high
context_scope: restore_point_create_original_result
implementation_surfaces:
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: restore_point_create_result_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/UI_Command_Catalog.md#UCC-164
- Plans/Contracts_V0.md#CV-333
preserved_exact_tokens:
- cmd.chat.create_restore_point
- RP-AUTHORITY-INDEFINITE
- CommandOutcomeRecord
- pre_dispatch_rejection
negative_constraints:
- No new event admission, retention policy, global command architecture, launch-critical promotion, native
  execution proof, readiness clearance or governance seal.
- No guessed original outcome, hidden pre-dispatch writer, point resurrection, source visibility grant
  or passive replay mutation.
owner_hints:
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Shared_Integration_Runtime.md
- Plans/Contracts_V0.md
```

For exactly `cmd.chat.create_restore_point`, Storage SP-274 retains the ORIGINAL SIR-owned CommandOutcomeRecord as delegated app-root command-replay custody within the command-specific canonical value. SIR remains the sole semantic producer/owner; Storage cannot generate an outcome from a typed result, schema-valid caller body, event, receipt ref, current topology or defaults. Native creation authenticates the actual operation owner and current dispatch identity before admitting the initial record and its true terminal successor. Once terminal, preserve the exact original record and schema; no conversion to a newly observed topology or new operation is permitted. The delegated resolver exposes that same original record to CV-333 through the exact stored command_outcome_ref and validates its separately owned typed result/hash/ref join. A retained actual outcome is not a global outcome writer or a substitute for initial native acknowledgement/effect evidence. Pending updates require the original SIR authority; passive replay writes nothing. This narrowly supplies custody for the existing app-root original-owner-result obligation; it does not materialize a global CommandOutcome family or alter RP-DELIVERY-365D. Under SP-285, initial capture/source authentication remains complete. Later source-independent canonical-result resolution uses the exact admitted immutable row and current disclosure authority without disposed original raw payload/dispatch or redb/source controls. When combined with available-created evidence, explicitly require retained_creation read_purpose=original_create_result_custody and its actual SP-274 result; passive_creation cannot substitute or authorize replay.

### Original Home command outcome custody

Shared Integration Runtime delegates custody of the authenticated original Home CommandOutcomeRecord, content-free normalized identity and original CV-333 response to the same canonical Home operation receipt defined by SP-273. SIR retains sole semantic production and authentication authority. The receipt resolves exact original command/operation/instance/topology/target/dispatch identities and the separately typed Home result; copied refs or mutually repaired hashes do not authenticate those records. Pending semantic authority remains with the original SIR owner until the real outcome is resolved; Home3 durably retains the exact delegated nonterminal capsule in its existing slot under the protocol below.

The new Home capture bytes are explicitly serialized from authenticated original typed values under SP-273, not claimed original SIR wire bytes. Existing SIR/CV source schemas and hash meanings remain unchanged. Original terminal values and typed AppendReceipt/publication custody are immutable, content-free and coherently backed up; layout bodies stay in their distinct configuration/temporary operation custody. A read-only retry returns the same original values without synthesizing an outcome or repeating layout mutation. This narrow Home delegation does not reuse the create-only SIR-044 result family or introduce a global result producer. SP-273 owns the physical bytes, exact joins, retention, migration and withdrawal rules.


For current Home3, `owner.sir.home_layout_pending_custody@1.0.0` authenticates the immutable original and current nonterminal source, original Home admission transaction and target-identity binding in `pending_sir_custody`. Capture the actual original request/binding/full identity/clock before candidate copies or validators; exact source/request bytes, distinct Home and original SIR digests, dispatch/outcome/frame and target/topology duplicates must join. A Home event ref or typed owner result cannot create acknowledgement. Actual acknowledged/executing progression uses the real available frame and receipt, preserves existing acknowledgement, and never regresses phase or time. The original source is immutable. Derive the full expected acknowledgement from actual entry source/frame/revision/clock before copying; compare working, installed and returned values, including exact frame types, after all helpers.

Explicit resume after lawful original control disposal rebinds only the same actual Home owner, canonical slot key, operation digest, original admission transaction and original source digest. It does not deep-copy an owner, synthesize original ingress, acquire a fresh restored-operation capability or create another acknowledgement. Current SIR identity/binding/frame/availability/clock and Home permission/target remain required. Carry Home's previously validated actual activation owner/records/enabled/revision pin through SIR rebinding to both Home pending capture publications and their final guards; a withdrawn resolver or replacement handle cannot become a new baseline. Exact returned SIR source and Home candidate values must still equal their independent actual sources.

SIR privately stages the genuine original terminal outcome and CV-333 response only after the actual Home readback and original append proof. Home3 requires SP-286/CV-339's explicit full-value resolver, exact retained shared v2 witness and independently authenticated complete current event/SP-278 token at staging and final terminal publication. Old shared semantic readers or legacy selectors cannot replace that authority. Pending raw-source and retained-witness variants, terminal publication version 2, and unchanged original receipt/hash/result meanings are owned by SP-273. SIR creates no parallel durable outcome store or new Home field. The same terminal Home transaction captures authentic outcome/response/result and clears temporary pending custody before public success.

Final owner, activation, source, staged-value, candidate and transaction comparisons run after dependent helpers and before publication under actual exclusion. After commit, response disclosure separately compares the exact original retained projection and current permission/owner facts after its final copy. A late refusal conserves an already valid Home transaction and independently completed shared source/receipt/backup effects; authorized retry returns the same originals without another layout/event/acknowledgement. Generic Store/BackupVault issuance remains independently authorized while Home's local pending capability is withdrawn.

Exact retained Home1 and frozen external Home2 readers preserve their original authority; external Home2 is not a deployed predecessor and supplies no pending conversion. Fresh Home3 admission requires the installed writer/readers/resolver and original SIR binding in SP-273. Native ingress/source authentication, dispatcher/frame ownership, real activation/leases/redb/fsync, recovery/backup enumeration and UI delivery remain `NOT_RUN`; the bounded move/succeeded model and regression chain do not close other Home command or terminal paths.

```yaml
plan_unit_id: SIR-046
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: For actually admitted Home commands producing workspace.layout_changed under SP-273, Shared
  Integration Runtime delegates custody of its exact authenticated original CommandOutcomeRecord to the
  same canonical Home operation receipt while retaining exclusive semantic production and authentication
  authority. The captured content-free normalized-request identity and exact original CV-333 response
  join that same operation and separately hashed Home owner result. This is NEW Home-only delegated custody;
  create-only SIR-044 and its physical family are not reused. Original terminal typed values, NEW Home
  capture bytes, schema/topology and refs are immutable and mandatory-backup; pending advances require
  original SIR authority; passive retry resolution cannot synthesize outcomes or create a global writer.
  Home3 retains exact original/current nonterminal custody in the existing slot, resumes only the original
  admitted owner tuple, and carries validated activation and independent original-value pins through SIR
  rebinding and final Home publication. Current full event/token plus actual shared v2 custody authenticate
  terminal capture; exact original response disclosure preserves prior lawful effects on late refusal.
gui_related: false
gui_classification_reason: Exact original SIR custody only.
depends_on:
- SIR-042
- CV-333
- DL-045
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Shared Integration Runtime remains the sole semantic producer and authenticator of the exact original
  Home CommandOutcomeRecord.
- Original normalized identity, outcome and response join actual command, operation, target generation,
  dispatch identity and separately hashed Home result through the same canonical receipt.
- New Home content-free capture serialization and hashes are explicit; they do not claim original SIR
  wire bytes or change existing owner hash recipes.
- Pending or unresolved original outcome custody cannot synthesize a successful terminal response or bypass
  original Home readback and append durability.
- Authentic original terminal values remain immutable and backed up; read-only retry cannot create a second
  outcome, repeat Home mutation or become a global result store.
- Home3 original/current nonterminal custody binds actual initial request, frame/acknowledgement and admission transaction; original source remains immutable and repeated resume preserves the actual owner tuple.
- Original validated activation handle/records/revision survive dependent SIR rebind and final Home capture; exact returned source, candidate, staged values and output cannot redefine their original expectations.
- Terminal Home3 custody requires complete current event/token and actual shared v2 full-value witness with exact original receipt/result/commitment joins; no semantic fallback or old-source fabrication.
- Valid Home/shared publications survive later local refusal; current authorized disclosure returns original values without another outcome or effect.
validation_surfaces:
- Plans/home_layout_event_contracts.schema.json
- Plans/home_layout_pending_receipt.schema.json
- Plans/home_layout_pending_receipt_v2_reader.schema.json
- Plans/home_layout_value_readers.schema.json
- Plans/home_layout_full_value_contract_fixtures.json
- Plans/event_payloads/workspace_layout_changed.schema.json
- Plans/home_workspace_layout.schema.json
- Plans/home_layout_event_contract_fixtures.json
- reports/event-authority-20260911/step-08-home-validation.md
- reports/event-authority-20260911/step-08-home-full-value-validation.md
- reports/event-authority-20260911/step-08-home-full-value-checks.json
risk_class: home_layout_readback_event_receipt_crash_or_replay_authority_escape
reasoning_tier: high
context_scope: workspace_layout_changed_original_sir_custody
implementation_surfaces:
- Plans/Shared_Integration_Runtime.md
- Plans/home_layout_event_contracts.schema.json
- Plans/home_layout_pending_receipt.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/storage-plan.md#SP-273
- Plans/Shared_Integration_Runtime.md#SIR-042
- Plans/Contracts_V0.md#CV-333
- Plans/Decision_Log.md#DL-045
negative_constraints:
- No event admission, sibling terminal/panel closure, retention value change, runtime claim, global accounting
  change, readiness or seal.
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-046, ContractName:Plans/storage-plan.md#SP-273, ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/Decision_Log.md#DL-045
