  - re-run after reject must resolve to canonical runtime action families like `restore_safe_point_then_retry`, `start_fresh_attempt`, `replan`, or `skip_node`
  - deprecated `allowed_actions[]` is compatibility-only and MUST NOT appear in new canonical schemas
- `UI_Command_Catalog.md` aligns with the newer runtime model:
  - canonical recovery maps from `allowed_action_ids[]` to `cmd.runtime.*`
  - pre-attempt blocked episodes are keyed by `blocked_sequence`, not by fabricated `attempt_id`
  - this is already closer to the rewrite direction than the old HITL request examples
- The missing structural piece is approval scope anchoring. Current docs still do not define one durable scope key that answers:
  - what exact blocked episode is being approved
  - which execution unit it belongs to
  - whether the approval is specific to one blocked episode vs reusable session policy
  - who approved or declined it
- Because the older HITL contract is tier-keyed, it is still vulnerable to the same stale-ownership problem as `TierContext`. Under the rewrite, approval must anchor to canonical execution-unit context first, with any tier/package/seam label only as secondary presentation metadata.

### Impacted docs
- `Plans/human-in-the-loop.md`
- `Plans/Contracts_V0.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- downstream consumers:
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- `Contracts_V0.md` still publishes `HITLRequest` with legacy `allowed_actions[]` and `approve_continue`, while the later correction in `human-in-the-loop.md` says deprecated field names must not appear in new canonical schemas.
- `storage-plan.md` still registers HITL events as `request_id`, `run_id`, `tier_id`, `tier_type`, `request_kind`, `message`, `allowed_actions`, which is now behind the newer blocked-projection/action-family model.
- `UI_Command_Catalog.md` still has graph-local `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` entries even though the same file later establishes `cmd.runtime.*` as the canonical recovery namespace.
- No durable approver identity is defined on approval/rejection events yet.
- No explicit `approval_scope_key` or equivalent exists to separate:
  - one blocked episode approval
  - one node/attempt-specific approval
  - one broader prerequisite/session policy choice

### Candidate fixes to carry forward
- Reconcile HITL so blocked/runtime semantics are canonical and tier-boundary examples become derived copy only.
- Move approval anchoring onto canonical runtime identity:
  - `run_id`
  - `node_id`
  - `blocked_sequence`
  - `attempt_id?`
  - plus execution-unit context refs where applicable
- Add an explicit approval-scope field or object, likely something like `approval_scope_key`, so reusable approvals and one-off blocked-episode approvals cannot bleed together.
- Add durable approver identity fields to approval/rejection records/events so audit/history can explain who approved or declined, not just that it happened.
- Deprecate graph-local HITL command IDs in favor of `cmd.runtime.*` mappings everywhere, with surface-specific labels only in copy.

### Do-not-forget details
- the important split is blocked-episode approval versus session-wide policy; the docs still do not formalize that boundary
- `approve_continue` is legacy vocabulary and should not survive as canonical runtime action naming
- pre-attempt blocked episodes must not invent an `attempt_id`; `blocked_sequence` is already the cleaner anchor

## Research Progress - 2026-03-16 - Sonnet downstream cohort synthesis

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/human-in-the-loop.md`
- `Plans/Tools.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/WorktreeGitImprovement.md`
- current `working_ledger.md`
- adjacent owner docs pulled by the Sonnet passes (`Contracts_V0.md`, `storage-plan.md`, `Prompt_Pipeline.md`, `Permissions_System.md`, `Multi-Account.md`, `Glossary.md`, `Orchestrator_Page.md`, `Run_Graph_View.md`)

### Key findings
- Sonnet materially deepened the downstream cohort rather than merely echoing the Opus pass.
- UI / projection / command contracts are still structurally incomplete:
  - `FinalGUISpec.md` still has no true Orchestrator page section, still leaves `Tiers` as a standalone run-group view, and still lacks any native concern-model, historical-run-mode, or Progress-only widget-boundary contract.
  - `FinalGUISpec.md` also sharpens the projection-state naming issue: generic “projection trust” language will collide with existing preview/browser `trust_tier`; the cleaner split remains `projection_freshness` vs `projection_health`.
  - `Runtime_Artifacts_Panel.md` now looks more fragile than earlier passes suggested: `attempt_id` is still absent from the canonical artifact ID set, producer identity is anonymous at the envelope boundary, `subagent_lineage` still has no minimum payload semantics, `cost_usage` drill-through still rests on optional `usage_event_ref`, and the artifacts panel still has no degraded/stale projection contract.
  - `UI_Command_Catalog.md` still leaves the runtime command layer under-owned: deprecated graph recovery commands are still presented as live canon, HITL `approve_continue` still has no canonical `cmd.*` mapping, cross-surface pivot payloads still lack rewrite-era structural keys, and there are still no stable `cmd.account.*`, `cmd.concern.*`, or `cmd.promotion.*` families.
- Conversational / HITL / tooling contracts still break under shared-runtime and multi-lane execution:
  - `assistant-chat-design.md` still promises requested/effective auth/account disclosure in its rewrite-alignment prose but fails to materialize it anywhere in its concrete surface sections.
  - validation-pass and wizard-handoff payloads still omit `effective_account_id`, `requested_account`, `execution_role`, and permission posture even though those are now critical for reproducible downstream execution.
  - `human-in-the-loop.md` remains tier-keyed at its canonical request/storage layer, still lacks node/package/lane/attempt anchors, still has no approver identity on durable HITL events, and still leaves session-scoped reject/always semantics lane-unsafe.
  - `Tools.md` still leaves tool events under-attributed (`node_id`, `attempt_id`, actor/account/role, lane context missing), keeps the normalized outcome taxonomy unwired to actual event fields, and still lacks any real DAE post-hoc tool-event contract.
- The execution-core and wizard/source-control documents continue to expose load-bearing rewrite drift:
  - `Executor_Protocol.md` still has a broken Glossary forward reference, an incomplete wake-reason set, no real `blocked_reason_code` table, no `blocked_sequence` integration, and no actor/lifecycle model for reviewer/corroboration flows.
  - `orchestrator-subagent-integration.md` sharpens from “drift” to “implementation risk”: `TierContext` and `ActiveAgent` are concrete structs missing lane/package/seam/account/role identity, and `FindingCategory` cannot map cleanly into the emerging concern taxonomy.
  - `interview-subagent-integration.md` still contradicts itself on `requested_persona_id` vs `requested_persona`, still omits account/role identity from provenance and blocked-handoff surfaces, and still maps interview phases through `tier_id`-shaped crew structs.
  - `chain-wizard-flexibility.md` still leaves CUP without requested/effective runtime governance, still has no `wizard_id -> run_id` lineage bridge, and still carries the actively misleading “no change to tier/subtask execution” claim.
  - `WorktreeGitImprovement.md` now has a specifically named failure mode: `extract_tier_id()` is a hidden migration tripwire that would silently drop lane/node-named worktrees during restart repopulation; the document still has no lane lifecycle model, no shared worktree projection object, and no account identity in Git/PR operation contexts.

### Highest-risk impacted docs
- `Plans/FinalGUISpec.md`
  - still lacks true Orchestrator-page ownership, concern-model UI, historical-run-mode behavior, and stable projection-freshness/health language.
- `Plans/Runtime_Artifacts_Panel.md`
  - still lacks attempt-level identity, producer attribution, trustworthy `cost_usage` linkage, and degraded/stale projector behavior.
- `Plans/assistant-chat-design.md`
  - still lacks concrete auth/account/role disclosure and still leaves session approval and handoff scopes ambiguous.
- `Plans/human-in-the-loop.md`
  - still lacks execution anchors, approver identity, concurrency-safe approval scope, and escalation behavior.
- `Plans/UI_Command_Catalog.md`
  - still lacks canonical mappings/families for HITL, account management, concern flows, promotion flows, and freshness-gated mutation commands.
- `Plans/orchestrator-subagent-integration.md`
  - still contains concrete runtime structs that cannot carry the rewrite’s full execution identity or concern model.
- `Plans/chain-wizard-flexibility.md`
  - still leaves wizard/runtime lineage and execution policy under-specified at the exact handoff boundary that now matters most.
- `Plans/WorktreeGitImprovement.md`
  - still treats tier identity as the filesystem and registry key, making lane-aware recovery and audit structurally unsafe.

### Contradictions / gaps surfaced
- Several downstream docs now fail at the schema level, not only at the prose level:
  - missing `attempt_id`, `blocked_sequence`, account identity, or execution-role fields mean later UI/runtime promises cannot be implemented faithfully from the current contracts.
- Conversational/HITL/tooling docs still overload “session” with incompatible scope meanings, which becomes a correctness bug under multi-lane and multi-actor execution.
- Artifact, tool, blocked, and handoff surfaces still cannot explain which effective account/actor produced or approved the action they represent.
- Execution-core docs still retain enough tier-rooted structs and enum sets that downstream consumers keep compensating locally instead of inheriting stable runtime truth.
- Source Control / worktree docs still describe boundary ownership in prose only; they still do not anchor one shared projection object or route payload that other surfaces can rely on.

### Candidate fixes to carry forward
- Add a real Orchestrator section to `FinalGUISpec.md`, make Progress the only widget canvas, and bind all projection-state UX to `projection_freshness` + `projection_health` rather than overloaded trust language.
- Extend artifact/tool/HITL/blocked/handoff envelopes with the missing identity anchors: `attempt_id`, `node_id`, `lane_id`, `package_id`, `execution_role`, actor identity, account identity, and `blocked_sequence` where appropriate.
- Define canonical command families for account operations, concern operations, and promotion operations, and explicitly map HITL `allowed_action_ids` into stable `cmd.*` handlers.
- Introduce an Approval Scope Key so session approvals and rejects stop bleeding across unrelated concurrent lanes/actors.
- Consolidate execution-core protocol docs around node-native execution context, reviewer/corroboration/concern lifecycle hooks, and wake/block taxonomies that are complete enough to serve downstream consumers.
- Add explicit wizard/runtime lineage and isolation policy fields so CUP, validation passes, wizard handoff, Orchestrator receipts, and Source Control all share one auditable chain.
- Replace tier-keyed worktree path and registry assumptions before lane-named worktrees exist, or restart recovery will silently lose state.

### Do-not-forget details
- `extract_tier_id()` is now a named migration trap, not just a vocabulary issue.
- `approve_continue` is still the most dangerous unmapped UI action in the downstream command layer.
- `validation_pass_report` and wizard handoff still look “complete” until you ask which account/role actually executed them.
- The missing `attempt_id` in artifact surfaces is now a cross-surface correctness bug, not merely a future enhancement.
- Sonnet confirms the downstream cohort still contains enough high-signal drift that stopping at Opus+Sonnet would leave the user’s requested multi-model breadth visibly unfinished.

## Research Progress - 2026-03-16 - GPT-5.4 downstream cohort synthesis

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/human-in-the-loop.md`
- `Plans/Tools.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/WorktreeGitImprovement.md`
- adjacent owner docs pulled for contradiction checks (`Contracts_V0.md`, `Prompt_Pipeline.md`, `storage-plan.md`, `Multi-Account.md`, `Orchestrator_Page.md`, `Run_Graph_View.md`, `UI_Wiring_Rules.md`, `Wiring_Matrix.schema.json`, `GitHub_Integration.md`, `GitHub_API_Auth_and_Flows.md`, `Project_Output_Artifacts.md`)

### Key findings
- GPT-5.4 sharpened several downstream issues from “drift” into concrete contract breaks.
- GUI / command / projection contracts still have live SSOT collisions:
  - `FinalGUISpec.md` still has no true Orchestrator-page owner section, still leaves Dashboard/Orchestrator operational surfaces identity-thin, still conflicts with `UI_Command_Catalog.md` on slash-command canon, and still mixes `restore point` language with runtime safe-point recovery.
  - `UI_Command_Catalog.md` is now directly self-contradictory: it still presents graph-local HITL mutators as canon while later insisting all blocked-state recovery buttons across graph/chat/GUI must map to `cmd.runtime.*`.
  - account/auth controls, concern actions, and promotion actions still have no canonical command-family owner, and command/wiring schemas still cannot encode projection-freshness/health gating for mutating actions.
- Artifact / HITL / tool surfaces still fail at the keying and persistence layer:
  - `Runtime_Artifacts_Panel.md` now has a stronger failure: it mandates a concrete envelope + 19 per-type JSON schema files that do not exist, making its validation contract unimplementable as written.
  - artifact identity still cannot satisfy adjacent attempt-native receipt/evidence pivots because the common ID set still omits `attempt_id`.
  - `human-in-the-loop.md` now exposes a three-way approval-identity split: `request_id` for HITL replay, `blocked_sequence` for runtime recovery commands, and vague `session` scoping for permission propagation.
  - restart persistence for HITL is still effectively run-scoped (`checkpoints.hitl.{run_id}`), which is unsafe once multiple concurrent approval episodes exist in one run.
  - `Tools.md` still splits its own minimum payload contract from later blocked-runtime addenda, still has no legal durable contract for tool-level `pending-HITL`, and still lacks a real registry/tool-definition home for `mutation_capable`.
- Execution-core ownership gaps are now more specifically named:
  - `Executor_Protocol.md` still lacks `blocked_sequence` minting rules even though storage/contracts/UI all depend on it.
  - the same doc still names `startup_recovered`, but no doc owns the full restart-recovery -> first `scheduler.pass` handoff.
  - `execution_role` is now visibly required by multi-account routing policy, yet it is still absent from canonical effective-resolution/runtime snapshot families.
  - `orchestrator-subagent-integration.md` is now sharper than earlier passes suggested: `TierContext` declares runtime identity fields that its own constructor never populates, while active coordination/hook structs remain fully tier-rooted and cannot be joined losslessly to attempt/worktree/permission/runtime records.
- Wizard / interview / Source Control lineage still has unclosed hard seams:
  - `interview-subagent-integration.md` claims Prompt Pipeline alignment while truncating auth/account identity from its requested/effective contract, still writes blocked bundles as `attention_required` in earlier sections, and still splits interview execution identity between `tier_id = None` and synthetic `interview-phase-*` pseudo-tier ids.
  - `chain-wizard-flexibility.md` still leaks orchestrator ownership into pre-run CUP/quality blocking, still omits hard lineage keys from the normalized downstream payload (`project_id`, thread/report identity), and still overstates Contribute(PR) as “no worktrees” rather than a stable-branch policy with isolated runtime execution underneath.
  - `WorktreeGitImprovement.md` still lacks any durable worktree record/projection family, still splits restart authority between filesystem rediscovery and runtime lineage, still has no authority rule across commit author / push actor / PR API actor, and still conflicts with `GitHub_Integration.md` / `storage-plan.md` on the owning `base_branch` state key.

### Highest-risk impacted docs
- `Plans/Runtime_Artifacts_Panel.md`
  - schema family absent, attempt identity incomplete, receipt/artifact drill contract still unimplementable.
- `Plans/human-in-the-loop.md`
  - approval identity/keying split (`request_id` vs `blocked_sequence` vs session scope) is now a correctness bug for restart and concurrency.
- `Plans/UI_Command_Catalog.md`
  - still internally split on blocked/HITL mutator ownership and still missing command families for account/concern/promotion flows.
- `Plans/orchestrator-subagent-integration.md`
  - runtime identity looks declared but is not actually materialized by its own constructor/coordination path.
- `Plans/Executor_Protocol.md`
  - still missing canonical ownership for `execution_role`, `blocked_sequence` minting, and startup-recovery scheduler handoff.
- `Plans/interview-subagent-integration.md`
  - still claims shared runtime alignment while dropping auth/account identity and reintroducing pseudo-tier execution keys.
- `Plans/chain-wizard-flexibility.md`
  - still leaves lineage/isolation payloads too thin at the last pre-run handoff boundary.
- `Plans/WorktreeGitImprovement.md`
  - still cannot support durable historical worktree lineage or multi-identity SCM audit without new record families.

### Contradictions / gaps surfaced
- The same user action can still target three different approval identities depending on which doc you read.
- Several docs still claim to align with canonical runtime records while silently dropping auth/account/role fields that those records already own elsewhere.
- Command and wiring SSOTs still cannot express stale/degraded action preconditions, even though surface docs increasingly require them.
- Runtime-core docs still depend on tier-rooted live coordination objects while downstream recovery/history contracts have already moved to attempt-native keys.
- Source Control and worktree docs still lack one durable object family for worktree ownership, restart authority, and historical lineage preservation.

### Candidate fixes to carry forward
- Unify approval identity across HITL/chat/runtime recovery (`request_id`, `blocked_sequence`, approval scope) and make restart persistence episode-scoped rather than run-scoped.
- Add the missing schema/record families that docs already require in practice: runtime-artifact schemas, durable worktree records/projections, and command families for account/concern/promotion actions.
- Extend canonical runtime snapshots with `execution_role` and carry that through Prompt Pipeline, Contracts, storage, wizard/interview, and UI owners.
- Rebase orchestrator live-context structs around node/attempt/worktree/permission-aware execution envelopes instead of tier-keyed adapters.
- Treat Contribute(PR) isolation as a policy about stable branch ownership, not as a promise that isolated worktrees never exist.
- Reconcile `base_branch` storage ownership before more Source Control/UI work lands on conflicting keys.

### Do-not-forget details
