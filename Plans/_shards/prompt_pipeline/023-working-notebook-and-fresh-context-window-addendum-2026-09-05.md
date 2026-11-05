# Shard 023: Working Notebook And Fresh Context Window Addendum (2026-09-05)

Source: `Plans/Prompt_Pipeline.md`

Source lines: L5721-L6145

Source SHA256: `759e3a0d5c2a0132ff9479ee1c06c273aadab97d69b73dc28950b9383f4235a3`

---

## Working Notebook And Fresh Context Window Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1` (work item `wnc-20260905`). Notebook content semantics are owned by `Plans/Working_Notebook.md`; this section owns prompt-side policy: the distinct context operations, proactive fresh-window transitions, the checkpoint reserve, one shared admission budget, reconstruction, and authorization survival. The proposed record spellings (`ContextWindowTransition`, `FreshWindowTransitionState`, `ContextCheckpointReserve`) are additive PlanUnit-level names; no handler, event emission, or runtime behavior is claimed.

### Five distinct context operations

The pipeline distinguishes five context operations with different reasons and effects; none substitutes for another:

1. **Tool-result shaping** — per-tool/per-MCP-tool output caps applied at the tool boundary (`full | summarize | meta_only | exclude` per-tool policies, the 512 KiB large-output boundary, and `ToolRecoveryEnvelope` truncation). Shaping never rewrites canonical tool-call or tool-result history; original artifacts remain recoverable under their owners.
2. **Selected-region Subcompact** — a user-directed Context Lens operation owned by `Plans/assistant-chat-design.md` that replaces a selected message region with a local summary while preserving canonical source history and rehydration handles.
3. **Conversation compaction** — bounded transactional compaction with a `CompactionReceipt` (§2). Compaction and shaping never overwrite canonical source history.
4. **Fresh context-window transition** — a new operation specified by this addendum: checkpoint required state, then continue the same logical work in a new model context window inside the same run/attempt lineage. Window identity (`old_context_window_id`/`new_context_window_id`) is distinct from Goal, run, attempt, and provider-session identities. A fresh window MUST NOT emit `done.rotated`; run rotation still follows §3 and `Plans/Run_Modes.md`, and `done.rotated` is emitted only when a genuine run rotation occurs.
5. **Run rotation** — terminating the run and spawning a follow-up run per `Plans/Run_Modes.md` (`done.rotated`, rotation-eligible modes only).

### Proactive fresh-window request and host admission

An agent, user, or runtime policy MAY request a fresh context window before overflow: after material progress, while pressure is rising (`pressure_start_pct = 70`, `pressure_aggressive_pct = 85` per model metadata), or when an overflow-imminent condition is detected. The request is never authority. The host admits, defers, or denies through a typed lifecycle:

`requested → preparing → checkpointed → admitted → activated → recovered_resumed`, with terminal `deferred`, `denied`, `failed`, and `cancelled` edges from every non-terminal state.

- `requested`: recorded with reason (`proactive_before_overflow | pressure_rising | pre_overflow_material_progress | overflow_imminent | model_change | recovery_reconstruction`), initiator, requested/effective controller, and route snapshot; current context remains usable.
- `preparing`: safe-point and budget checks; required notebook checkpoint content is selected per `Plans/Working_Notebook.md` WN-016; in-flight operations are reconciled or retained under their owners (Plans/Executor_Protocol.md receipts; Shared Integration Runtime outbox).
- `checkpointed`: the notebook checkpoint commit barrier has succeeded per `Plans/storage-plan.md`; a partial write never exposes a committed checkpoint.
- `admitted`: the reconstructed request passes fresh Context Admission, Packet Admission, Permissions/FileSafe checks, and receives the single-use `ProviderDispatchAdmissionReceipt` bound to the exact new visible bytes, route, account, permission, topology, and mutation state. A stop-epoch, generation, route, or account change after admission returns the transition to safe re-admission.
- `activated`: the new window is established at the observable boundary. A provider-native adapter that reports only an acknowledgement records that observation level (Plans/CLI_Bridged_Providers.md opacity rules) rather than fabricating internal states; no success state exists for an unobserved or failed activation.
- `recovered_resumed`: bounded current context is admitted and continuation resumes; the transition record terminates. Activation success is never reported for an unobserved or failed activation, and the operation context does not itself reset environment state, declare a Goal done, change a Plan, erase history, or reset billing/quota.

An early valid request can succeed before any payload failure; unsafe or unsupported requests return typed reasons (`notebook_checkpoint_failed`, `transition_deferred`, `transition_cancelled`, `transition_retry_exhausted`, `notebook_route_unsupported`) without context loss. At most one automatic retry per failed transport operation reuses the same idempotency identity; a generation conflict requires fresh validation, and an unknown external outcome is never blindly retried.

### Checkpoint reserve and the one admission budget

Reserve behavior is model/capability aware through the existing model metadata and the existing `contingency` bucket (§2.2 allocation targets). The effective input/response capacity is calculated from provider counting semantics using current post-assembly estimates; PM MUST NOT double-count a provider output-window reservation, silently add a second contingency pool, or rely on a stale pre-tool estimate. If a protected minimum (mandatory instructions, safety, acceptance criteria, authorization evidence) cannot fit the available capacity, the outcome is a typed insufficient-capacity deferral/failure — required state is never dropped to report success.

Notebook capsule and retrieved entries compete inside the existing selected/retrieved-context allocation: capsule plus entries total at most 1,024 estimated tokens AND 4 KiB before admission (ceilings, not reservations; `Plans/Working_Notebook.md` WN-009/WN-018). No additive unbounded notebook injection budget exists. Stable mandatory instruction prefixes are not rewritten for volatile notebook metadata: notebook material assembles in ordered late blocks per `StablePrefixSnapshot`/`AppendOnlyProviderContext` rules, and deduplication is by source/revision. A cache hit is neither zero-cost nor a permission grant.

### Reconstruction from current owner state

After any fresh window, resume, or recovery, the reconstructed request is rebuilt from current owner state, preferring owner facts over stale note summaries: mandatory instructions; current user constraints including exact negative constraints and superseding corrections; the exact approved Goal objective and revision, Plan identity/version/hash, and acceptance references; permitted tools; workflow position; bounded recent context; the resume capsule; and authorized evidence. Notes cannot change `objective_text`, Plan version/hash, or acceptance criteria. Notebook or capsule text never substitutes for: approval and permission receipts (Permissions/FileSafe re-decide against new visible bytes and changed dependencies; an old dispatch receipt cannot authorize reconstructed bytes or a changed account), memory verification, ledger turn commits, or completion evidence. Synthetic continuation, notes, and summaries preserve user/assistant/tool boundaries and tool-call/result pairing; malformed reconstructed history is safely repaired or rejected (`HistoryAdmissionGate`), lossy conversion is explicit and only used when necessary, and hidden provider reasoning is never revealed.

### Read-only continuation, fallback, and thrashing prevention

Ask/Plan/Deep Plan and read-only collaborative work may checkpoint internal notebook state and continue in a fresh context window where eligible. Internal notebook persistence in read-only runs is a policy-limited sidecar write to PM-owned notebook storage: it MUST NOT confer target-project mutation authority, widen tool/project/external-write ceilings, or require switching to `regular`/`yolo`. Actual run-rotation restrictions are unchanged.

When fresh-window support is unavailable on a route (capability, account, transport), the pipeline falls back to bounded conventional compaction/reconstruction or existing failure handling, records the requested/effective path and reason, and never discards recoverable context based only on an assumed native capability. No private backend dependency exists for generic PM routes.

Automatic transitions are bounded: a no-progress signature (recovered context substantially equal to the discarded context without task progress), a per-thread transition cooldown, and a maximum of one automatic retry per failed transport operation prevent reset-read-reset loops and repeated checkpoints without progress; escalation follows normal owner outcomes (`done.failed`/`done.deferred` per `Plans/Run_Modes.md`). Failure is never renamed success and never becomes an automatic terminal Goal result. Repeatedly retrieved evidence triggers bounded retention rather than perpetual re-reading.

```yaml
plan_unit_id: PP-084
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: "The pipeline owns five distinct context operations: tool-result shaping, selected-region Subcompact (Context Lens, owner assistant-chat-design), conversation compaction, fresh context-window transition, and run rotation. A fresh context-window transition checkpoints required state and continues the same logical work in a new window inside the same run/attempt lineage; its window identity is distinct from Goal/run/attempt/provider-session identity; it never emits done.rotated, never completes a Goal, never changes a Plan, and never resets billing or quota. Compaction and shaping never overwrite canonical source history."
gui_related: false
gui_classification_reason: Context-operation policy is pipeline behavior, not GUI work.
depends_on: [PP-072, WN-001]
unblocks: [PP-085, PP-086, PP-087, PP-088, PP-089]
acceptance_criteria:
  - Fresh window and run rotation are separately identifiable and separately recorded.
  - A fresh window does not emit done.rotated unless genuine rotation occurred.
  - Compaction/shaping leave canonical source history intact.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: context_operation_conflation
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Run_Modes.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C01
preserved_exact_tokens: ["done.rotated", "fresh context-window transition", "window identity", "run rotation"]
negative_constraints:
  - Do not label a fresh context-window transition as run rotation or a session deletion.
  - Do not let shaping or compaction rewrite canonical source history.
owner_hints: [Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: PP-085
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: A proactive fresh-window request can originate from agent, user, or runtime policy before overflow (material progress, rising pressure at the model-owned 70/85 thresholds, or overflow-imminent). The request is not authority. The host admits/defers/denies through the typed lifecycle requested, preparing, checkpointed, admitted, activated, recovered_resumed, with terminal deferred, denied, failed, and cancelled edges, using safe-point, checkpoint, permission, capacity, stop-epoch, and route capability checks. Admission reuses the single-use ProviderDispatchAdmissionReceipt bound to the exact reconstructed bytes; generation/stop/route/account changes force safe re-admission. At most one automatic retry per failed transport operation reuses the same idempotency identity. An unobserved or failed activation has no success event, and native-adapter acknowledgements record observation level only.
gui_related: false
gui_classification_reason: Transition lifecycle is pipeline/runtime behavior, not GUI work.
depends_on: [PP-084, WN-016]
unblocks: [PP-088]
acceptance_criteria:
  - A valid early request succeeds before payload failure; unsafe or unsupported requests return typed reasons without context loss.
  - Stop between admission and dispatch discards the stale continuation via stop-epoch fencing.
  - No success event exists for an unobserved or failed activation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: unsafe_context_discard
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Shared_Integration_Runtime.md, Plans/Goal_Runtime_System.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
preserved_exact_tokens: ["requested", "preparing", "checkpointed", "admitted", "activated", "recovered_resumed", "ProviderDispatchAdmissionReceipt", "stop-epoch"]
negative_constraints:
  - Do not let an agent request alone discard context.
  - Do not fabricate internal transition states from a native acknowledgement.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Shared_Integration_Runtime.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Contracts_V0.md

```yaml
plan_unit_id: PP-086
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: "The checkpoint reserve and notebook injection share the existing one admission budget. Reserve behavior is model/capability aware: post-assembly estimates and the existing contingency bucket size the space required for required checkpoint output and recovery framing before large results or near exhaustion, without double-counting provider output-window reservations or adding a second contingency pool. Notebook capsule plus entries total at most 1,024 estimated tokens and 4 KiB, compete inside the existing selected/retrieved-context allocation, assemble in ordered late blocks so stable instruction prefixes stay cache-stable, and dedupe by source/revision. Oversized protected minimum yields a typed insufficient-capacity deferral/failure; required state is never dropped to report success."
gui_related: false
gui_classification_reason: Budget policy is pipeline behavior, not GUI work.
depends_on: [PP-084, WN-009]
unblocks: []
acceptance_criteria:
  - Post-assembly estimates and reserve reflect the current effective window.
  - No additive unbounded notebook injection budget and no second contingency pool exist.
  - Volatile notebook changes do not rewrite stable instruction prefixes.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: budget_double_counting
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Models_System.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C12
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A30
preserved_exact_tokens: ["contingency", "1,024 estimated tokens", "4 KiB", "ceilings, not reservations", "insufficient-capacity"]
negative_constraints:
  - Do not stack an unconditional reserve percentage on top of the existing contingency bucket.
  - Do not trim approved acceptance criteria or authorization evidence into a misleading success.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Models_System.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: PP-087
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: "After a fresh window, resume, or recovery the pipeline reconstructs from current owner state, preferring owner facts over stale note summaries: mandatory instructions, current user constraints including exact negative constraints and superseding corrections, exact approved Goal/Plan/acceptance references, permitted tools, workflow position, bounded recent context, the resume capsule, and authorized evidence. Authoritative approvals and current instructions survive independently of notebooks and lossy summaries: Permissions/FileSafe and final provider-dispatch admission re-run against new visible bytes and changed dependencies, and an old dispatch receipt cannot authorize reconstructed bytes or a changed account. Replay integrity preserves user/assistant/tool boundaries and tool-call/result pairs; synthetic content never masquerades as user instruction; malformed reconstructed history is repaired or rejected; lossy conversion is explicit and necessary-only."
gui_related: false
gui_classification_reason: Reconstruction policy is pipeline behavior, not GUI work.
depends_on: [PP-085, WN-015]
unblocks: [PP-088]
acceptance_criteria:
  - Exact negative constraints and superseding corrections survive reconstruction.
  - A note claiming approval never authorizes dispatch; approval owners re-decide.
  - Lossy or synthetic content is labeled and never presented as user-authored instruction.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: authorization_laundering
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Permissions_System.md, Plans/FileSafe.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C07
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C14
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C15
preserved_exact_tokens: ["current owner state", "exact negative constraints", "re-run against new visible bytes", "tool-call/result pairs"]
negative_constraints:
  - Do not let notes or summaries substitute for approval receipts, memory verification, or ledger commits.
  - Do not reveal hidden provider reasoning during reconstruction.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Permissions_System.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: PP-088
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: Read-only routes (ask, plan, deep plan) and read-only collaborative work may use internal notebook persistence and a safe fresh context where eligible without acquiring target-project mutation authority; notebook sidecar writes in read-only runs never widen tool, project, or external-write ceilings and never require switching to regular/yolo; actual run-rotation restrictions are unchanged. When fresh-window support is unavailable, the pipeline falls back to bounded conventional compaction/reconstruction or existing failure handling, records requested/effective path and reason, and never discards recoverable context based on an assumed native capability. Automatic transitions are bounded by no-progress signatures, cooldowns, and one automatic retry; escalation follows normal owner outcomes, and failure is never renamed success.
gui_related: false
gui_classification_reason: Mode and fallback policy is pipeline behavior, not GUI work.
depends_on: [PP-084, PP-085]
unblocks: [PP-089]
acceptance_criteria:
  - Read-only research continues in a fresh window without authority widening or mode escalation.
  - Requested/effective path and fallback reason are recorded.
  - No unbounded context transition loop exists.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: read_only_escalation
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Run_Modes.md, Plans/Permissions_System.md, Plans/CLI_Bridged_Providers.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C10
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C11
preserved_exact_tokens: ["policy-limited sidecar write", "requested/effective path", "no-progress signatures", "never renamed success"]
negative_constraints:
  - Do not make context continuation depend on switching to regular/yolo.
  - Do not create a private-backend dependency for generic PM fallback routes.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Run_Modes.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md

```yaml
plan_unit_id: PP-089
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: "Tool-result shaping policy survives replay and recovery: the effective per-tool/per-MCP-tool output policy (full/summarize/meta_only/exclude, caps, truncation markers, original artifact refs) is snapshotted with the assembled context, and resume/replay retains the effective policy snapshot so truncation/shaping stays consistent and observable. Shaping separates execution output retention from model-visible output: original artifacts and tool/result causal relationships remain recoverable where retained, the canonical tool history is never overwritten by the summary, and huge results never bypass context caps. Retrieval and notebook material remain explicit context source classes inspectable by source type, identity, derivation, and visibility, never permanent memory or canonical source history by retrieval alone."
gui_related: false
gui_classification_reason: Shaping policy is pipeline/tool-boundary behavior, not GUI work.
depends_on: [PP-084]
unblocks: []
acceptance_criteria:
  - Replayed history shows the same effective shaping with visible policy provenance.
  - Original canonical tool history remains intact behind shaped model-visible output.
  - Source class, identity, derivation, and visibility are inspectable for notebook/history material.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: replay_drift
reasoning_tier: standard
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Tools.md, Plans/MCP_Integration.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C13
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H06
preserved_exact_tokens: ["policy snapshot", "original artifact refs", "explicit context source classes"]
negative_constraints:
  - Do not overwrite canonical tool history with shaped summaries.
  - Do not let huge results bypass context caps.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MCP_Integration.md

```yaml
plan_unit_id: PP-090
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: "Derived-content exclusion: when a source is muted or revoked, its substantive content is removed from or rebuilt out of future derivative dispatch across notes, capsules, summaries, handoffs, search projections, and future prompt caches, propagating the restriction chain of Plans/Permissions_System.md. Already-sent bytes are not claimed as recalled; invalidation covers future use only and discloses that boundary. Unknown provenance is handled conservatively: if exact dependency isolation is unavailable, the affected derived block is excluded or rebuilt rather than silently declassified. Source history remains distinct: retrieval and notebook material are explicit context source classes, and original retained evidence stays addressable without being rewritten by shaping."
gui_related: false
gui_classification_reason: Restriction propagation is pipeline/permission behavior, not GUI work.
depends_on: [PP-087]
unblocks: []
acceptance_criteria:
  - Revoke after summary creation removes derivative content from future dispatch.
  - No direct-ID or cached capsule bypass of a muted source exists.
  - Already-sent bytes are disclosed as sent, never as recalled.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: derived_content_leak
reasoning_tier: high
context_scope: context_pipeline
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Permissions_System.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: pipeline_policy_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A10
preserved_exact_tokens: ["derived", "muted", "revoked", "already sent", "conservatively"]
negative_constraints:
  - Do not re-admit excluded substantive content through derivatives or caches.
  - Do not claim recall of provider-sent bytes.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Permissions_System.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Working_Notebook.md

### PP-091 - Browser Event And Artifact Prompt Consumer Boundary

```yaml
plan_unit_id: PP-091
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  An admitted Browser event is bounded operational metadata, never prompt content admission. Browser result chips,
  representation refs and screenshot artifacts enter the existing prompt/context materialization path only under
  current permission, capability, target/generation, privacy, redaction, vision, byte/token budget and prompt-context
  epoch checks. Capability-specific compact digests and explicit on-demand help remain owned by PP-083.
gui_related: false
gui_classification_reason: This is prompt content admission and invalidation, not visual chip design.
depends_on: [PP-074, PP-083, SMPFS-166]
unblocks: []
acceptance_criteria:
  - Consume admitted event identity and bounded artifact refs without injecting the event payload, page/DOM body, query/source code, expanded API union or full help into the base prompt.
  - Event registration, successful capture, program completion and screenshot model_attachment_selected each remain insufficient to attach content without independent current prompt admission.
  - Screenshot auto, always and never preserve artifact identity and human/test capture independently; always cannot bypass permission, redaction, vision or budget and never does not delete a requested artifact.
  - Current permission, capability, API/help/registry, target PageGeneration and prompt-context epoch changes invalidate affected materialization; stale/historical evidence cannot authorize current mutation.
  - Replay is projection-only and cannot deliver a prompt, grant capability, consume a provider call, or turn operational byte/token estimates into model usage.
  - Protected AuthBrowserSession and secrets never enter Browser chips, captures, help, context or prompt records.
validation_surfaces: [Plans/browser_event_admission_fixtures.json, python3 scripts/pm-browser-event-admission.py, Plans/section15_browser_program_contract_fixtures.json, future native Browser prompt attachment and epoch invalidation fixtures]
risk_class: browser_event_to_prompt_authority_escape
reasoning_tier: high
context_scope: browser_prompt_consumer
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/browser_event_admission.json, Plans/section15_browser_program_contracts.schema.json]
node_compile_hint: {mode: static_prompt_consumer_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-005, source_ref:egolite-requirement:HBU-016, source_ref:egolite-requirement:HBU-022, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints: [No event-to-prompt auto-attachment., No authority or budget widening from capture policy., No provider execution or token-efficiency proof from static admission.]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md#PP-083, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/browser_event_admission.json


### PP-151 - Event Authority subagent.context_rehydrated 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: PP-151
unit_type: event_contract
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: |-
  subagent.context_rehydrated 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_rehydrated.schema.json (pm.event_payload.subagent_context_rehydrated.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime rehydration adapter. When an already supported rehydration restores effective context, bind the original source refs and before/after effective-context revisions to the exact child identity. Source access/deletion checks precede restoration. No source history is rewritten, no missing source is fabricated, and replay never rehydrates or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_rehydrated", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_rehydrated:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_rehydrated, server_id is the actual Server identity durably frozen by its original effective-context runtime rehydration adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context rehydration operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_rehydrated: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context rehydration operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_rehydrated, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.rehydrated@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_rehydrated: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime rehydration adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.rehydrated@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_rehydrated: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime rehydration adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_rehydrated append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_rehydrated: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_rehydrated authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-623
- SP-603
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### PP-152 - Event Authority subagent.context_shrunk 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: PP-152
unit_type: event_contract
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: |-
  subagent.context_shrunk 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_shrunk.schema.json (pm.event_payload.subagent_context_shrunk.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime shrinking adapter. When the existing effective-context shrinker commits a shorter replacement, preserve source refs and rehydration handles. Automatic default scope remains tool results; optional retrieved/plan blocks require their existing configuration. Protected working-set, system/provider/persona/tool definitions remain immune. No original history is rewritten and replay never shrinks or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_shrunk", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_shrunk:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_shrunk, server_id is the actual Server identity durably frozen by its original effective-context runtime shrinking adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context shrink operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_shrunk: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context shrink operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_shrunk, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.shrunk@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_shrunk: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime shrinking adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.shrunk@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_shrunk: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime shrinking adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_shrunk append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_shrunk: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_shrunk authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-624
- SP-604
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```
