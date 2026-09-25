# Shard 033: Compaction completion replay binding (DL-040)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2164-L2606

Source SHA256: `75009faabcc9921c2d6720f45c7c2a45a9d28826c3cef1e9905d422e1cba1d10`

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

For exactly `cmd.forge.pipeline.retry`, request/result composition reuses actual common Forge authority/result/receipt/error, authentic original SIR IdentityEnvelope/CommandOutcome and current caller/return context. Explicit new SIR dispatch and nullable error projections bind their genuine owner records, including cancelled-null UI error. Inputs and resolved originals are pinned across all callbacks; a fresh final disclosure check is mandatory. Canonical digests come from the owner callback, not a newly chosen wire codec. The exact central response adapter must invoke this full composition, not only validate a bare result shape.

ContractRef: ContractName:Plans/forge_retry_selected_contracts.schema.json

Exactly `cmd.forge.repository.list` and `cmd.forge.pipeline.list` retain an authentic SIR original request/digest, full unchanged IdentityEnvelope, independent dispatch/target generations, actor/permission/idempotency and genuine nullable caller. The existing precommit authority uses its actual Server/Host/Environment/Client scope without inventing Project/run/agent identity. Actual current delivery is independently supplied. The adapter joins authentic descriptor/selection, original read admission, typed source window and read receipt before composing current CommandOutcome/UI response and safe errors.

Accepted work is real nonterminal ObservableWork without terminal receipt. Read-only degraded/partial freshness is explicitly represented by the actual read owner, not borrowed from a mutation outcome. Failed/cancelled reads preserve their genuine observations and original error, including cancelled-null UI error where required. Original and live resolved values are snapshotted against later callback/resolver mutation. Replay discloses retained original reads under current permission; it does not silently repeat the provider query or substitute the visible panel filter. Static validation supplies no native authentication, availability or protected Full Thread change.

ContractRef: ContractName:Plans/forge_list_query_contracts.schema.json

The exact selected-preview original binding retains genuine full IdentityEnvelope, request/command/operation/dispatch/frame/caller, actor/permission and canonical argument/result digests. The existing Backup receipt's separate correlation_id is retained as explicit original dispatcher metadata, not invented as an IdentityEnvelope field or equated to command_instance_id. Actual result, owner preview/production receipt, CommandOutcome and UI response resolve to the same original; a cancelled null UI error preserves the unchanged actual Backup error through the typed safe projection. Accepted work is genuinely nonterminal. Unknown production retains its original reconciliation identity and cannot become successful readiness. Current disclosure is rechecked after source/target/helper calls and originals/resolved records remain mutation-fenced. No native availability or physical custody is established by the companion.

For exactly `cmd.backup.recovery_key.reencrypt`, SIR's internal companion retains authentic original full IdentityEnvelope, complete authority and reviewed arguments, payload digest, original dispatch/frame/generation, idempotency, actor/permission and nullable actual return context. The domain adapter resolves the actual review, source/target records, re-encryption observation/receipt and work before mapping to CommandOutcome/UICommandResponse. Safe error projection joins the unchanged actual Backup error to original identity/caller; cancelled common UI error may be null without erasing the owner error or known effects. Unknown effects map to terminal_unknown/recovery_required, accepted work cannot be relabelled terminal, and replay never repeats cryptographic effects. Mandatory actual original/current disclosure and immutable input guards remain; no protected FullThread field or native producer is created by static validation.

For exactly `cmd.backup.recovery_key.rotate`, the SIR binding in `Plans/backup_key_rotation_contracts.schema.json` retains authentic full IdentityEnvelope, original request/operation/instance/dispatch/frame/independent target, actor/permission, initiating Client, exact arguments/digest and genuine nullable caller. Current delivery independently authenticates the same caller and protected audience. Actual session-owned nonterminal progress maps accepted/pending with no terminal receipt and no invented ObservableWork; session delivery does not mean engine rotation completion. Terminal dedicated redacted rotation receipt joins actual original, protected use, per-repository causal engine facts, unchanged Backup error and nullable safe UI error. Failure/cancellation retain known effects, including null UI error for genuine cancellation; unknown use/effects remain terminal_unknown/reconciliation-only. Snapshot original and live resolved records and reject late mutation. Replay cannot redeem consumed input or repeat rotation. No Full Thread/UI schema widening, key bytes, new event or native proof follows from static composition.

For the exact ACT111 export successor, SIR retains an authentic original dispatch binding to the complete submitted export request, full IdentityEnvelope, actor/permission snapshot, dispatch frame/generation, idempotency/payload digest and original return context. Actual result, CommandOutcome and UICommandResponse resolve against that binding. The separate nonsecret error projection binds the unchanged actual Backup error reference, original identity and caller to the current common UI error; cancelled UI error may be null without dropping the owner error or known output effects. Accepted ObservableWork is nonterminal and has no terminal result receipt. Replay preserves the original outcome and receipts; every final disclosure requires current native authorization. This internal admission does not change protected FullThread types, introduce events or advertise handler availability.

ContractRef: ContractName:Plans/backup_portable_export_contracts.schema.json, ContractName:Plans/Backup_Restore_System.md#BRS-014

For exactly `cmd.forge.review.comment`, the SIR dispatch binding in `Plans/forge_review_comment_contracts.schema.json` retains the authenticated original full IdentityEnvelope, exact arguments and argument-only digest, request/dispatch/frame, independent target generation, idempotency, actor/permission and genuine nullable caller. The actual delivery owner independently supplies its nullable current caller; null/foreign substitution is not equivalent. The actual provider comment result composes the unchanged common outcome with nonterminal accepted work, genuine original receipt/error and no inferred no_op. Explicit error projection resolves the unchanged owner error and exact command/instance/identity/caller to nullable existing UICommandError; cancellation may retain known applied owner effects with null UI error. Unknown owner error/effect is not failed success/failure certainty; degraded mapping remains unsupported. Snapshot inputs before dependent owner reads and reject late mutation. No Full Thread identity/UI envelope schema widening, fabricated thread, automatic replay, physical store or native authentication/disclosure proof follows from static fixtures.

For exactly `cmd.git.pull`, `Plans/sir_git_pull_dispatch.schema.json` binds the authenticated dispatcher original full IdentityEnvelope, selected arguments and canonical argument-only digest, request/dispatch/frame, independent target generation, idempotency, actor/permission and actual nullable caller. The actual delivery owner independently supplies its nullable current caller value; missing, foreign and null substitution do not pass as equivalent. RepositoryContext contributes only its existing Project/Plan/Goal/topology lineage, never fabricated Server/Run/agent identity. Accepted genuine ObservableWork cannot already be terminal or carry a terminal receipt. Actual terminal receipt facts and unresolved native effects govern the unchanged common response; no_op is not inferred.

The explicit `pm.sir.git_pull_error_projection.v1` resolves the unchanged new pull owner error by the actual error_ref, preserves its exact full payload, command/instance and authenticated original/delivery caller, and supplies the existing nullable UICommandError value. Null UI error for actual cancellation does not erase owner error/effect/recovery truth. No total error-code mapping, truncation or normalization is invented; unavailable authentic projection fails closed. Inputs and live resolved original/source/preview/receipt values are snapshotted before dependent callbacks and checked for mutation afterward. Replay preserves original outcomes and cannot refetch/reintegrate. Authentic producer/disclosure enforcement and logical original/error/phase custody remain independent prerequisites, not proof supplied by synthetic fixtures or hash equality. No UICommandEnvelope or historical identity schema is widened.

For exactly `cmd.backup.delete`, `Plans/backup_selected_delete_contracts.schema.json` materializes `pm.sir.backup_selected_delete_dispatch.v1` from the existing authenticated dispatcher and `pm.sir.backup_selected_delete_error_projection.v1` as a nonpersisted safe disclosure projection. Retain the real original IdentityEnvelope, request/operation/instance/dispatch/frame/target, actor/permission, admission time, idempotency, full typed arguments and existing canonical payload digest. Original caller uses the existing nullable return_context value grammar, not Source Control producer authority; actual delivery must equal the independently retained original value. No normalized caller bag, invented Project or new Full Thread field is introduced.

The selected-delete response adapter resolves the actual `pm.backup.selected_delete.request.v1`, `pm.backup.selected_delete.observation.v1`, `pm.backup.selected_delete.result.v1` and terminal `pm.backup.selected_delete.receipt.v1`. These are new explicitly scoped Backup contracts, not capture BackupReceipt records. Original selection, genuine RetentionPreview and BackupPolicy revisions, exact immutable source identities and actual retention decisions join through their existing owners; the actual Backup candidate-hash callback is mandatory, not an invented serialization codec. Native admission, retention/currentness, source custody, actual effects and current caller/error disclosure remain mandatory. The effect adapter receives the actual observation, receipt and work records. Snapshot before resolver/adapters and reject input mutation; recheck current disclosure after domain resolution.

Completed maps to succeeded only when every selected snapshot is known deleted; failed and cancelled retain actual per-member effects. Unknown effects map to terminal_unknown/recovery_required with a retained reconciliation reference, not retriable resubmission. Cancelled UI error remains null while the actual typed Backup error and safe projection remain joined. The actual accepted work snapshot is nonterminal and has no terminal result receipt; neither a later terminal work record nor agreeing caller references establish acceptance. Original response replay never deletes again. No no_op, hold override, prune/cascade, new EventRecord, native handler proof or physical storage admission is implied. Original dispatch, deletion observations and deletion receipts require explicit custody enrollment separately; do not fold them into capture receipt custody or invent a retention interval.

For exactly `cmd.backup.destination.test` and `cmd.backup.destination.remove`, `pm.sir.backup_destination_lifecycle_dispatch.v1` retains the genuine original request/whole IdentityEnvelope, actor, permission snapshot, idempotency key, canonical argument digest, independent dispatcher frame/target generation and exact nullable caller-return value. The common response resolves that original and its actual DestinationLifecycleReceipt/error, never a caller-supplied grant. The receipt's safe nullable UI error is an authenticated projection of the actual unchanged Backup error record under final disclosure; cancellation may keep UI error null without dropping its owner error/effects. The accepted asynchronous branch resolves actual nonterminal original ObservableWork with no terminal receipt; later terminal work is not an acceptance snapshot. A terminal response resolves the original receipt and actual observed effect; replay preserves that response and cannot repeat canary creation or removal. Original, native source/effect, canonical digest and current disclosure adapters are mandatory, not schema-issued authority.

For exactly `cmd.forge.review.thread.reply`, `Plans/forge_thread_reply_contracts.schema.json#/$defs/dispatch_binding` is a disjoint authentic SIR original containing unchanged full IdentityEnvelope, exact selected arguments/canonical digest, permission and original nullable caller. Current delivery is independently authenticated and preserves the actual caller; RepositoryBinding or current panel state cannot fabricate identity. Domain/central composition resolves actual whole thread/revision window, original body/version, issued reply observation and common receipt/work/outcome. Accepted work is an actual nonterminal acceptance snapshot without terminal receipt; unknown effects remain reconciliation-only and replay cannot repost. Live original/resolved-value mutation fails closed. Physical original/observation custody and native authority remain independently pending.

The new `pm.sir.forge_thread_reply_error_projection.v1` is an internal nonpersisted safe disclosure projection, not a receipt/error store. It binds the actual unchanged Forge command error record and outcome error reference to the exact original request/identity/caller and nullable UI error. No provider-code default or normalization is inferred. Genuine cancelled responses may retain owner error/partial effects/recovery while common UI error is null. The native final-disclosure adapter authenticates the actual source error and projection; matching synthetic records or digest values establish no native proof.


For exactly `cmd.forge.pipeline.cancel`, `Plans/forge_cancel_selected_contracts.schema.json#/$defs/dispatch_binding` is a disjoint authentic SIR original containing actual full identity, selected request, canonical digest, permission and original caller context. Shared response composition resolves actual state-fence/revalidation/observation, receipt/work, original dispatch and current caller/disclosure, rejecting late mutation and replayed effects. Existing Full Thread identity and central outcome grammars remain unchanged. Actual original and observation custody remain physical-registration-pending; a static match does not authenticate the issuer or enable a native handler.

The new `pm.sir.forge_cancel_error_projection.v1` is an internal nonpersisted SIR disclosure projection, not a receipt or error store. It binds the actual unchanged Forge command error record and outcome error reference to the original request, whole identity, caller, time and exact nullable UI error. No provider-code mapping is inferred. A cancelled response may retain a genuine owner error and recovery facts while its common UI error remains null. Native final disclosure authenticates the actual source error and projection; unrelated references/text cannot replace them. Accepted work uses an actual nonterminal acceptance snapshot with no terminal receipt, never later terminal work substituted for that snapshot.

For exactly `cmd.forge.pipeline.open_logs`, `Plans/forge_log_selection_contracts.schema.json#/$defs/dispatch_binding` is a disjoint SIR original value produced by the established authenticated dispatcher. Its arguments are the exact selected log request, with genuine full identity, permission, canonical argument digest and nullable original caller context. The actual current delivery owner supplies the independently authenticated matching caller value. Resolve original run/child/cursor/content provenance and current redacted disclosure through mandatory native adapters; static matching is not authentication. Shared response composition retains actual receipts and work, preserves replay without reissued reads and rejects late resolver/callback mutation. Unknown effects remain terminal_unknown/recovery_required even when the owner label says failed; no_op and generic degraded terminal mapping are unadmitted for this profile. Do not widen the separate two-action Forge review binding or IdentityEnvelope. Original and observation custody remain separately pending, with no new store or retention interval.

For exactly `cmd.jujutsu.git.push`, the authenticated dispatcher produces the closed original `pm.sir.jj_publication_dispatch_binding.v1` in `Plans/sir_jj_publication_dispatch.schema.json`. It preserves the authentic full IdentityEnvelope, exact original selected-publication arguments and their canonical payload digest, request/dispatch/frame identity, independent target generation, idempotency, actual actor/permission snapshot, admission time and nullable original caller return context. RepositoryContext supplies only its own lineage; it cannot invent Server, operation-generation, Run, agent or caller identity. Existing SCM return_context is reused only as value grammar, not SCM authority. The actual delivery owner independently supplies current nullable return_context; missing is not null, and foreign or null substitution fails. No UICommandEnvelope, IdentityEnvelope or historical JJ schema is widened.

The exact result composes the actual original, per-target RemoteOperationTarget preview, native qualification, observations/reconciliation and Source Control receipt through `pm_jj_publication_selected`, then binds the CV-333 response and CommandOutcomeRecord through `pm_jj_publication_response`. Payload hash covers actual selected arguments, not the dispatch binding container. Accepted work resolves the genuine original ObservableWork and has no central terminal receipt. Known terminal outcomes preserve actual receipt facts; unknown effects and recovery-required remain terminal_unknown/recovery_required, never no_op or inferred success. Replay preserves the original response and effects. Input values and live resolved original/preview/receipt records are snapshotted before dependent reads and checked again for late mutation. Native producer/delivery authentication, effect admission and physical original custody remain independently required; matching static records or hashes prove none of them. No peer store, public command, event or retention interval is admitted by this logical binding.

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
  - "The two Forge review decisions bind authenticated original SIR identity, arguments, caller and owner evidence; accepted is nonterminal, unknown effects require reconciliation, and degraded mutation qualification remains unsupported."
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

For exactly `cmd.backup.destination.discover` and `cmd.backup.browse`, `Plans/backup_bounded_read_contracts.schema.json#/$defs/dispatch_binding` explicitly materializes the narrow SIR-owned original read dispatch. The existing authenticated dispatcher is its sole producer; retain the actual full IdentityEnvelope, request/dispatch/frame/target identities, actor/permission, admission time, idempotency, complete typed read arguments and their native canonical payload digest. Application/Project scope comes from actual admission, never a discovered repository or an invented Project. The existing nullable Source Control return_context grammar represents original caller facts without borrowing Source Control producer authority. Explicit delivery_return_context from the actual delivery owner must equal that independently resolved original value; missing is distinct from authenticated null. No normalized_request caller/lineage bag or Full Thread field is added.

The exact-two central UI response adapter invokes the genuine bounded-read original/page/previous-page/destination/immutable-source oracle and resolves the actual new BackupReadProjectionReceipt. Original identity, request/operation/instance/dispatch/frame/target, payload/idempotency, actual receipt/page/currentness, outcome and typed error join the actual CommandOutcomeRecord and UICommandResponse. Native source/receipt/caller authentication, canonical digest, original admission and current disclosure callbacks are mandatory; Boolean grants or fixture agreement do not replace them. Independent generations remain independent. Preserve completed/partial/unavailable/failed/cancelled page truth: completed maps to succeeded; partial/unavailable/failed to failed with the actual typed error; cancelled to cancelled with null common UI error and its retained reason reference. No no_op, async acceptance, new EventRecord, registration, mutation or recovery proof is inferred. Replay keeps original receipt/result/caller and zero reissued reads; lost original or prior-page custody fails closed, never selects latest. Inputs are snapshotted before dependent calls, current disclosure is rechecked at the end and mutation invalidates the composition. Original dispatch/receipt physical custody remains separately pending, with no new store or retention interval and no native handler claim.

For exactly `cmd.forge.review.approve` and `cmd.forge.review.request_changes`, `Plans/sir_forge_review_dispatch.schema.json#/$defs/dispatch_binding` is the narrow SIR-owned original dispatch binding. The existing authenticated dispatcher is its sole producer: preserve the actual full IdentityEnvelope, request/dispatch/frame/target identities, original actor/permission, admission time, idempotency, exact closed Forge arguments and canonical argument payload digest. Actual application or Project scope comes from SIR admission, never hosted repository/provider-project identity. All independently owned generations remain independent. The original binding is separately resolved and authenticated; agreeing fixture snapshots, refs or hashes do not establish it. This adds no physical store, native proof, identity envelope, Full Thread shape change or reinterpretation of historical Forge requests.

The binding explicitly reuses the nullable `Plans/source_control_contracts.schema.json#/$defs/return_context` value grammar for genuine original caller/return facts, without borrowing Source Control producer or topology authority. Outer null means the actual caller has no such return value, not that a real route may be discarded. An explicit `delivery_return_context` input comes from the actual current delivery/caller owner under that same nullable grammar and must equal the independently authenticated original value. It is not a normalized_request or UICommandResponse field or a new durable record. Missing, foreign or null-substituted delivery fails this bounded profile; unavailable caller delivery does not change the genuine operation result or replay the hosted effect. Value equality proves neither caller authentication nor delivery. Unrepresentable caller values remain unsupported rather than inventing GUI focus for API/automation callers.

The SIR payload hash remains the canonical digest of the actual closed Forge command arguments, not the enclosing caller/identity/custody container. Native canonical digest and authentic original/owner record resolution are mandatory dependencies. The central adapter invokes the actual Forge selected-decision original/result/receipt/observation oracle, then binds original identity, operation, instance, idempotency, request/dispatch/frame/target, payload, permission and exact receipt. Snapshot before dependent calls and reject late mutation. Preserve original replay with zero repeated effects. Native provider/dispatcher/Permissions/caller authentication and physical original/observation replay/backup custody remain separate prerequisites.

Forge `accepted` stays central nonterminal progress with null result_receipt_ref and genuine owner ObservableWork joined to the original full identity. A common accepted receipt is acknowledgement/progress evidence only, never terminal or inferred same-frame completion. Work state remains independent of command outcome. Terminal succeeded/blocked/failed/cancelled/recovery_required/effect_unknown maps to succeeded/rejected/failed/cancelled/terminal_unknown/terminal_unknown with the actual owner receipt; no_op is not inferred. This exact-two adapter explicitly refuses common `degraded` outcome pending Forge mutation qualification; historical shared schemas and degraded read callers remain unchanged. Availability degradation is a different axis. This is bounded static composition, not all Forge-command or native completion closure. An actual typed error with unknown effect state or an actual provider observation reporting unknown effects overrides a terminal label: central outcome stays terminal_unknown/recovery_required until reconciliation; a failed or cancelled label cannot turn uncertainty into a known result.


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
