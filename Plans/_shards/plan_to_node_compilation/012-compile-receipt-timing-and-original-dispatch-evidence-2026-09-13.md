# Shard 012: Compile receipt timing and original dispatch evidence - 2026-09-13

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L1491-L1674

Source SHA256: `f31d88c4b35996d247054ac9faffae91c07489df4d1bed10e6555f2824fcdb12`

---

## Compile receipt timing and original dispatch evidence - 2026-09-13

### PNC-024 - Truthful Compile Worklist Receipt Timing

```yaml
plan_unit_id: PNC-024
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Compile worklists persist only the original assignment and completion receipts actually
  issued at their current lifecycle point. Draft and ready may precede assignment; running
  mandatory parallel work requires the configured minimum distinct non-parent assignments
  and authentic matching assignment receipts before dispatch, at least two. Completion is
  never fabricated before a wave finishes. Completion and certification retain all existing
  required successful receipt, evidence, coverage, currentness and original source checks.
  The adjacent lifecycle and recovery rules are mandatory semantic obligations; a schema
  cardinality lower bound alone cannot prove dispatch or complete coverage.
gui_related: false
gui_classification_reason: Defines compiler source custody, receipt timing and dispatch predicates without a visual surface.
depends_on: [PNC-010, PNC-014, PNC-015, PNC-016, PNC-019, PNC-021, DL-045]
unblocks: []
acceptance_criteria:
  - Draft and ready can retain empty receipt lists and no waves before any original assignment; incremental preparation retains only actual issued receipts.
  - Every persisted wave retains its original typed assignment receipt, and both receipt lists equal the actual receipts belonging to the exact persisted waves.
  - Before dispatch and while running mandatory parallel work, the configured minimum distinct non-parent assignments, at least two, and matching authentic assignment receipts are required.
  - Serial running retains its existing schema behavior; the exact ten broad stages, sixteen stage names and required minimum parallelism remain unchanged.
  - A wave that has not completed needs no completion receipt; completed waves retain the existing complete receipt and durable evidence requirements.
  - Complete worklists and stage or compile certification require all required successful completions, full parallel coverage and original assignment, source and attempt identity.
  - Blocked or cancelled worklists preserve already issued receipts and actual dispatch history; original controller custody distinguishes before-dispatch and after-dispatch cases.
  - Missing, failed, duplicate, foreign, mismatched or stale required evidence never authorizes certification, and required parallel work cannot fall back to one broad parent agent.
  - Existing validator discrepancies remain visible and confer no bypass, lifecycle certification, runtime enablement or readiness clearance.
validation_surfaces:
  - Plans/plans_to_code_handoff.schema.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fabricated_or_premature_compile_receipt
reasoning_tier: high
context_scope: original_compile_receipt_lifecycle
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-045
  - Plans/Plan_To_Node_Compilation.md#PNC-010
  - Plans/Plan_To_Node_Compilation.md#PNC-016
  - reports/event-authority-20260911/step-08-compile-receipt-timing-validation.md
source_atom_ids: []
preserved_exact_tokens: [draft, ready, running, blocked, complete, cancelled, parallelism_required, minimum_parallel_assignments, assignment_receipt_refs, completion_receipt_refs]
negative_constraints:
  - Do not create placeholder receipts, predict their identities or borrow receipts from another wave, stage, attempt or invocation.
  - Do not treat schema checks or retained source contracts as actual dispatch, native installation, completion, certification or governance seal evidence.
  - Do not create WorkNodes, NodeSeeds, GoalRuns, executable queues, runtime launches or production build tasks through this source correction.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md]
```

Draft and ready worklists may have empty assignment and completion receipt lists and no assigned waves. Partially prepared assignments retain only authentic issued receipts. Every persisted wave has its original typed assignment receipt. Receipt lists identify exactly the actual receipts belonging to those persisted waves, preserving original null/presence and parent-only write authority.

Before dispatching a mandatory parallel stage, the controller must possess its configured minimum distinct non-parent assignments, at least two, and their authentic matching assignment receipts. Running requires the same proof. Ready alone does not authorize dispatch. A shortage uses the existing typed block or reduce-scope route. No completion receipt is required for an assignment whose execution has not completed. As results arrive, actual completion receipts and durable evidence join the original assignment identity. Complete worklists and stage or compile certification require every required successful completion, full required parallel coverage, current original source and attempt identity, and existing audit closure. A single arbitrary receipt-list entry cannot establish that coverage.

Blocked or cancelled status does not erase issued receipts or past dispatch obligations. Before-dispatch blocked or cancelled worklists may truthfully have no waves; after dispatch they retain original assignment proof and every completion already received. Recovery uses actual original controller and dispatch custody to distinguish those cases. A status label proves neither historical dispatch nor completion. Failed, foreign, duplicate, stale or mismatched receipts cannot satisfy required successful completion. The sixteen-stage algorithm, mandatory broad-stage parallelism, disabled bootstrap/v1 launch flags, distinct native-runtime enablement, and Executor and Goal Runtime certification boundaries remain unchanged.

The authoritative schema correction is limited to `compile_parallelism_policy` and `compile_worklist` in `Plans/plans_to_code_handoff.schema.json`. Required receipt fields and list types remain. The unconditional nonempty receipt-list predicates are removed from the reusable policy and its broad-stage duplicate; a running or complete worklist with `parallelism_required=true` retains a nonempty assignment list and at least one assigned wave. These structural lower bounds do not replace the configured minimum, distinct original identities, actual dispatch proof or complete successful coverage above. The original complete-worklist condition and entire wave, assignment-receipt and completion-receipt contracts are preserved.

The existing semantic predicate in `scripts/pm-prd-planning-runtime-validate.py` still requires the configured non-parent wave count whenever parallelism is required, including draft and ready before assignment. This is an unresolved validator discrepancy with the truthful pre-assignment contract. Its source-established limitation is not an executed lifecycle result. The current Event Authority task permits no validator edit beyond its already completed Step 3 holding-bucket change; this correction supplies no bypass or green gate claim. A later separately authorized validator correction must preserve exact receipt-set equality, dispatch minimum, original joins and completed-worklist checks. Operational consumers must report this limitation and prove original dispatch and completion custody before authorizing either action.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md#PNC-010, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-019, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-021, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Decision_Log.md#DL-045

### PNC-025 - Original complete native compiler custody and recovery

PNC-025 defines original native compiler checkpoint, artifact and certification custody through `Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json`. `native_plan_compile_checkpoint` is an immutable genuine compiler-controller checkpoint, selected by the real compile identity’s current `native_plan_compile_head`. It contains the entire existing 23-field native_runtime plan_compile_run plus all additional complete operational bodies defined by CompilerCheckpoint. The bootstrap-only existing plan_compile_run row and design-only compiler_wave_contract retain their original disabled/runtime and policy contracts; they cannot store, impersonate or enable this native route.

#### Complete state and original input custody

The full checkpoint retains run stage/current state, cursor, last-green hashes, blockers, next required stage, resume command/action, receipts and every complete compile-wave contract. It additionally retains all original full stage_cards, worklists, source_hashes, currentness_checks, repairs, repair_attempt_receipts, audit_cycles, verification_receipts, repair_receipt_sources, retry_records, cancellation, supersession, next_action, artifact_sources, compile_receipt_sources and other_required_receipt_sources. Approved pack, PlanUnit index, acceptance index, approved project context, testing policy and final audit/closure remain complete original source bindings with actual readers and exact bytes. Their hashes are not replacement bodies and cannot reconstruct an unavailable original input from the current repository.

`compiler-field-map.json` is the exact PNC-015 field coverage map. Stage cards cover the same sixteen-stage registry. Bounded worklists preserve every item/source hash, original assignment identity, read/write/forbidden scope, parent-only writeback, parallelism policy, full assignment and completion receipts, and original source/evidence. Where stage cards, worklists and run.compile_wave_contracts describe the same actual contract, their entire values agree. Counts, IDs or receipt refs alone cannot replace these complete bodies. Parent review and original writeback remain required; a subagent proposal or schema-valid native artifact does not certify itself.

CurrentnessCheck preserves original check identity, complete expected/observed source digest, source schema/owner/codec, result status, full reason, occurrence and evidence. Unavailable observed source is not current. Saved original observations describe what the owner actually checked then and do not waive current source revalidation. CompilerRetry retains the exact canonical compile_wave_retry_route, original assignment/attempt identity, actual result/receipt and retry count. No stored command string is executed by recovery.

CompilerCancellation preserves its authentic original source/operation, exact last committed stage, every unfinished assignment and all earlier genuine effects; it creates no Goal for genuine pre-Goal compilation. CompilerSupersession preserves both actual approved-pack identities and the original PlanDiffImpactReport’s exact lane dispositions, reasons and dependency/write-surface proofs, without a new plan_compile_run state. An unsupported original state is unavailable for this profile until its actual owner defines the mapping; it is never trimmed. NextAction preserves the full original bounded route/action/input references and exact next_required_stage/resume_command_or_action; terminal absence is null only when the genuine controller has no next action.

CompilerCheckpoint.final_audit_closure_source is the complete earlier ApprovedPlanPack final audit/closure input available at compiler birth. It is not the future final_compile_audit_repair output. Later actual compiler audits, repairs, Auditor verification and completion receipts retain their own complete checkpoint fields and appear only after original issuance. No hash edge is allowed from an earlier input to the future receipt or checkpoint that needs that input.

#### Original artifacts, certification and commit

`owner.plan_compile.native.publish_state_input.v1` is the original state-output boundary. `/record/value/run` is exactly the whole original native compile input consumed by activation; the additional checkpoint state is neither squeezed into that run nor replaced by its compact live capture. The genuine checkpoint and original capture/origin participate in that actual state publication. `owner.plan_compile.native.publish_artifact.v1` issues only the complete original typed node_seed_candidate, node_seed_review, workgraph_draft or worknode_request through CompilerArtifactValue and its full record/wrapper. Every acceptance, dependency, order, risk, gui_related, context, test, authority, model-routing and source-control field remains. This source definition creates no artifact instance or WorkNode.

`owner.plan_compile.native.publish_certification_input.v1` issues the complete seven-field plan_compile_receipt, including summary, evidence and entire handoff, in its actual original certification operation. It binds the genuine earlier input checkpoint, certified graph and every original request source. `owner.workflow.compile.issue_graph.v1` and `owner.workflow.compile.issue_request.v1` must independently establish that these graph/requests are the actual accepted outputs of that certification. Any schema-valid lookalike, copied receipt, foreign output or missing whole certificate refuses source issuance.

The certificate’s compiler_checkpoint selects the real earlier checkpoint. A subsequent checkpoint may reference the newly issued certificate, but the certificate never hashes a future checkpoint that itself hashes the certificate. The actual owner may reserve an original receipt identity before publication; that reserved ID is not a previously issued receipt or authorization. Whole original certificate/source/capture/activation-origin participants preserve their actual native transaction and acyclic dependency order.

CompilerCommitInput/CompilerCommitResult bind the existing state publication to the lower original `owner.plan_compile.native.publish_artifact.v1`, `owner.plan_compile.native.advance_head.v1` and `owner.storage.activation_operational_custody.publish.v1` participants. The complete new checkpoint, current head, origins and every newly issued artifact/receipt participant commit together or none of those new effects do. Expected head/value/origin is null only at proven fresh native compiler birth under the actual owner/root exclusion fence; restored loss or an empty scan is not that proof. Head generation starts at zero only at genuine birth and advances once per real checkpoint commit; checkpoint output_revision starts at one and advances once. Immutable new keys must be genuinely absent. Current-head CAS compares its entire outer value, genuine origin, owner/epoch and actual generation.

Checkpoint prior_checkpoint selects its genuine predecessor. The checkpoint origin’s prior_physical_sha256 commits that prior logical checkpoint, while the head origin commits the prior whole head; neither is an absent-key proof for the new immutable checkpoint. Other immutable receipt/artifact births have null prior only where their exact original revision contract declares no predecessor. No older native state receives a synthesized former origin. A restored head cannot regress a newer generation or erase actual terminal cancellation/supersession truth.

#### Original reads and truthful restart

`owner.native_plan_compile_checkpoint.read_original.v1` retains the complete CompilerReadRequest/CompilerReadResult and returns the complete original run plus operational checkpoint and source/origin, or exact unavailable. `owner.native_plan_compile_certification_receipt.read_original.v1` retains the whole CertificationReadRequest/CertificationReadResult and original certification body/origin. Both use the independently authenticated role/operation/request/capture and current disclosure/source guards, not a selector-only lookup.

This unit explicitly defines `owner.native_plan_compile_checkpoint.read_recovery.v1` with the whole CompilerRecoveryRequest/CompilerRecoveryResult and `owner.native_plan_compile_artifact.read_original.v1` with the whole CompilerArtifactReadRequest/CompilerArtifactReadResult. These newly named internal technical owner entries close the previously unnamed complete signatures; they do not add public commands, alter ordinary CompilerReadRequest/Result, claim an installed runtime endpoint or introduce a caller discriminator. Each is bound to its native original compiler/Storage authority and enforces its own full entry/final predicates.

Compiler recovery returns the genuine current full head/checkpoint, every required original artifact and compile receipt with authentic origins. Every referenced source, approval, repair/audit/verification/test/source-control/request/model dependency required by the saved next action must also be obtained through its actual full original owner interface. Inline repair, Auditor and verification bodies remain the entire genuinely received canonical values, not flattened findings. A historical immutable checkpoint can be disclosed under current permission; it is not automatically resumable and cannot supersede later state. Any missing or conflicting dependency is reported as unavailable and keeps dependent mutation fenced. No replacement comes from current Plans, UI, event payloads, sibling receipts, a fresh test/compile/model invocation or a reconstructed source hash.

Recovery never interprets resume_command_or_action or NextAction as sufficient execution permission. Original enabled-runtime, current source/approval/host/project/repository/worktree, owner, Stop/cancellation and permission checks precede any resumed effect. The complete BRS-024 recovery closure and SP-308 policy/deletion/tombstone rules also remain mandatory. Restoring source custody does not recreate a native lease or ownership capability.

#### Truthful receipt timing and current source admission

PNC-024 remains exact: draft/ready may have no assigned waves and empty receipt lists before genuine assignment; incremental preparation stores only actually issued receipts. Before dispatch and while running mandatory parallel work, require the configured minimum distinct non-parent assignments, at least two, their authentic matching assignment receipts and unchanged parent authority. Persisted waves retain their whole original typed assignment receipt. A wave that has not completed has no manufactured completion receipt; complete worklists, stages and compile certification require every actual required successful completion, source/attempt identity, evidence and full coverage. Serial-running behavior, all sixteen stages, ten broad stages, blocked/cancelled prior dispatch and existing receipt rules remain unchanged.

The known pinned semantic validator discrepancy that demands minimum non-parent assignments for pre-assignment draft/ready remains a separate unproved implementation mismatch; this owner contract supplies no bypass or validator-support claim. Original child-source emptiness follows GRS-075 at every current issue/certification/current-writer replay boundary. A supplied empty array cannot override a nonempty, unknown, stale or missing actual original child graph. Whole RequiredSet/CompletionRequirementSource are consumed at their genuine lifecycle point and never fabricated early.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: PNC-025
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Original complete native compiler custody and recovery. The immutable original checkpoint and current
  head preserve the complete native compiler run, full operational state, exact next action and every required original
  source/artifact/receipt.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- PNC-015
- PNC-019
- PNC-024
- CV-349
- SP-308
unblocks: []
acceptance_criteria:
- The immutable original checkpoint and current head preserve the complete native compiler run, full operational
  state, exact next action and every required original source/artifact/receipt.
- State, artifact, head and Storage owners jointly commit whole candidates and origins with original predecessor
  semantics and exact current-head CAS.
- Certification binds the genuine earlier input checkpoint and complete actual graph/request outputs without a cyclic
  future-checkpoint dependency.
- Original recovery and artifact readers use their full named technical signatures and require original dependency
  closure plus current admission before resumed effects.
- PNC-024 truthful assignment/completion timing and the existing validator discrepancy remain explicit; no fabricated
  receipts or runtime enablement follows.
validation_surfaces:
- Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json
- Plans/workflow_activation_contracts/compiler-field-map.json
- Plans/workflow_activation_contracts/methods.json
- Plans/plans_to_code_handoff.schema.json
- Plans/Backup_Restore_System.md#BRS-024
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: pnc_025_activation_original_custody
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json, ContractName:Plans/workflow_activation_contracts/compiler-field-map.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Backup_Restore_System.md#BRS-024
