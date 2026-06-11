# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/human-in-the-loop.md`

Source lines: L28-L126

Source SHA256: `844eca99e4c87b9669b375cbe844b13f8bc91141b1ef93860675a6585256c80b`

---

## Rewrite alignment (2026-02-21)


HITL semantics are part of the deterministic agent-loop core described in `Plans/rewrite-tie-in-memo.md`:

- HITL approvals should be represented as explicit **events** in the unified event model (seglog ledger)
- "Pause for approval" must be reproducible/replayable (event stream + projections), not just an in-memory UI state
- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not

### Canonical HITL request contract


The canonical human-in-the-loop contract remains a blocked-runtime overlay.

Required runtime-facing fields are:
- `run_id`
- `node_id`
- `blocked_sequence`
- `attempt_id?`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `approval_scope_key`
- `detail_ref?`
- `approver_identity?`

Rules:
- `blocked_sequence` remains the canonical approval anchor.
- `allowed_action_ids[]` stay ordered and runtime-owned.
- `action_available` rows derive from the same blocked-runtime action set.

### Shared-runtime HITL request and command alignment
HITL is the approval consumer for shared-runtime, multi-lane execution. Assistant chat, validation-pass output, wizard-handoff payloads, DAE side-effect interception, and tool-event records must preserve `effective_account_id`, `requested_account`, `requested_account_id`, `execution_role`, permission posture, actor identity, lane identity, and `attempt_id` so a later reviewer can tell who asked, who approved, under which `/account/role`, on which `/package/lane/attempt`, and whether an `/always` policy was scoped safely. Any rewrite-alignment or post-hoc explanation that omits these fields is under-attributed and lane-unsafe.

Runtime HITL persistence is keyed by blocked episode identity first. `checkpoints.hitl.{run_id}` and `checkpoints.hitl` are compatibility paths only; `/runtime/storage` records must distinguish concurrent pending-HITL episodes in the same run by `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`, `approval_scope_key`, actor/account/lane context, and approver identity. The event family must support a three-way join among the blocked episode, approval-identity record, and tool-level or /tool-definition request that triggered the wait.

The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_requested` is subordinate to the runtime blocked episode. `allowed_action_ids[]` owns the active action order; any request-era `allowed_actions` array is a derived alias for old consumers and must not become a second action family.

HITL classification keeps the `source axis`, `request axis`, and `execution/result axis` separate. A `/result` or execution outcome may explain why the blocked episode exists, but it must not become the request identity or the source identity.

HITL settings are automation-first and OFF by default unless a user explicitly enables phase, task, or subtask groupings. `<phase>/<task>/<subtask>` and `/task/subtask` are display/configuration labels only. Live approval can be package/seam/lane-bound through `/package/seam/lane-bound` and `/seam-aware` gate context, with package-complete and seam-complete approvals recorded as `package_complete_gate` and `seam_complete_gate` outcomes rather than as tier-local pauses.

HITL boundary redesign remains automation-first: approval pauses attach to package-complete and seam-complete events rather than to phase/task/subtask or `/task/subtask` boundaries. Optional HITL boundaries share one UI contract for package-complete, seam-complete, and mandatory side-effect gates; tier-boundary review is display/example copy only. Mandatory and optional HITL cases, including Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL, must be classified in one boundary model.

Clarification questions and blocked-resolution flows use node-effective execution metadata. A node-effective prompt must show provider, model, effort, `/model/effort`, execution-level identity, runtime-only artifacts, dependent-node impact, package-level worktree coherence, same-lane continuation, package-based remediation, `/package/seam/remediation`, delegated-worker ownership, promote-then-fork tradeoffs, and whether the decision is graph-declared. Palette copy must be palette-friendly while still distinguishing palette-allowed, palette-discouraged, low-risk focus actions, and detail pivots such as `/detail/history/ledger/evidence` and `/seam/package/node/lane/concern/review/patch/recovery`.

UI and storage routes must not cross-wire governance approvals with tool approvals. UI_Command_Catalog, Run_Graph_View, Orchestrator_Page, storage-plan, `Plans/Prompt_Pipeline.md`, `/Prompt_Pipeline.md`, Prompt_Pipeline, usage-feature, usage-feature.md, FileManager, newfeatures, and orchestrator-subagent-integration are consumers of the same event-to-surface model: `hitl.*` rows in the event-table carry MUSTs for `/config`, `run.started`, `usage.event`, account-aware switch-history, `/role-aware` actor projections, runtime execution-role disclosure, `/meta` work-item links, `/families`, `/action-family` normalization, and action-family resolution. Freshness-gated mutation commands stay bound to the same current blocked episode. Dashboard, Orchestrator, chat-thread, Assistant, and direct controls all route side-effect approvals to the same blocked episode and approval_scope_key.

Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over the blocked episode, not as a replacement for approval identity.

HITL blocked/runtime semantics are canonical for `/runtime` consumers; tier-boundary examples remain derived copy only.

The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command model.

The canonical switch-history / pressure-episode family is queryable from History, Ledger, Usage, `/Usage`, and Account/Usage Pressure projections, and it remains account-aware rather than tier-derived.

Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episode is separate from session policy scope, doom-loop avoidance, reject-cascade handling, `/resolutions`, `/lane/account`, multi-actor provenance, `ask`, `always`, tool-approval policy, cross-wires cleanup, and any governance-boundary decision.

Conversational, `/HITL/tooling`, and tooling docs must not overload session with incompatible scope meanings. Session copy is display or provider context only; blocked and approval correctness comes from lane/account/run/node identity under multi-lane and multi-actor execution.

File and artifact opening uses the shared object-open contract. FileManager may continue to expose `OpenFile { path... }` and the canonical `OpenFile { path: PathBuf, line?, range?, target_group? }` workspace-document command, but object-open requests for runtime artifacts must use open-by-identity with runtime-artifact envelope data and artifact-opening target metadata. `target_group` is display routing, not a replacement for the artifact identity.

Domain-specific "open in X" commands may remain when they express a meaningful domain-specific product action, but they are wrappers over the same route/subject model. The `/subject` identity and route target are shared; HITL, object-open, and runtime surfaces must not invent custom argument families for each destination.

Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/interview/builder/orchestrator`, and `Run_Modes` can appear in migration or display copy, but canonical HITL ownership is the blocked-node runtime action model with one action family and one approval identity.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

### Consequential transition, tray, and recovery-label alignment
Consequential approval and recovery transitions use a shared state transition report: from state, to state, target object, actor/source, `/source`, why the transition occurred, prerequisite evidence, review or corroboration refs, and resulting downstream obligations. `projection-trust` defines whether a projected control may act immediately, require review, or show degraded operational confidence.

Recovery labels must distinguish true undo from compensating action. `Undo` is available only when an immediate inverse operation exists. `Restore`, `Rollback`, `Retry from Safe Point`, and `Reopen` describe distinct recovery behaviors. `compensating_action_only` covers `/dismiss`, acknowledge/dismiss concern, reopen after revoke, restore from safe point, restore point copy, `Create New Lane`, `Re-request Promotion`, and `Reapply` when they change or reconstruct state without being true undo.

Restore language is overloaded and must be normalized before display or persistence. Rollback, checkpoint, revert, and `/checkpoint/revert` wording must resolve to a safe-point-aware retry when a valid safe point exists and policy allows restore, or to an explicit `Start fresh attempt`; it must not mint another recovery action family.

System `/tray` notifications remain narrow: HITL approval required, run complete, major failure requiring attention, and severe `/pressure` or rate-limit events that materially stop progress. Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.

Provider-native approval correlation records preserve OpenCode session IDs in provider-native `IDs`, `/provider`, and `/attempt/account/trust` metadata rather than overloading runtime thread identity. GUI concern-model, projection-health, and degraded-trust requirements from FinalGUISpec.md are HITL consumers when they render approval or recovery decisions.

The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Iteration`, TierContext, tier-boundary, and tier-keyed language are compatibility/display context only. HITL still deprecates request-era `allowed_actions` and `allowed_actions[]` in favor of runtime `allowed_action_ids[]`.
### Debug automation front-door grants

Debug Mode may ask for a run-scoped front-door grant that covers repeated low-risk investigation actions.

Required rules:
- the grant remains represented through the canonical blocked-runtime overlay rather than through a new request-centric debug approval model
- the approval record is anchored by the owning blocked episode and investigation identity
- shared runtime actions remain canonical; Debug Mode does not invent a separate approval transport
- declining the grant keeps the investigation alive in a degraded or blocked state when possible rather than silently discarding the investigation

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Scope rules:
- the front-door grant may cover repeated low-risk evidence reads and declared-scope temporary instrumentation actions only
- high-risk mutations, auth/state mutation, publish-side effects, and other explicit-confirmation actions still require their own confirmations
- target binding falls back to `agent_session` only when the request is explicitly about PM's own run or `/session` behavior, or when no project-backed target is available
- revoking the grant or finishing the investigation revokes the front-door scope as well

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

