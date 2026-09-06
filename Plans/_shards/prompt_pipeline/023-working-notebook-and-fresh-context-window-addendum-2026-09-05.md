# Shard 023: Working Notebook And Fresh Context Window Addendum (2026-09-05)

Source: `Plans/Prompt_Pipeline.md`

Source lines: L5700-L5983

Source SHA256: `cbda2ffd980a861f82ffab67431b1190940e9227a2d3302a8337a726502f14b7`

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
