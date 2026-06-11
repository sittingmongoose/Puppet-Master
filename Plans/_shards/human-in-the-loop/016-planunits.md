# Shard 016: PlanUnits

Source: `Plans/human-in-the-loop.md`

Source lines: L421-L595

Source SHA256: `844eca99e4c87b9669b375cbe844b13f8bc91141b1ef93860675a6585256c80b`

---

## PlanUnits

### HITL-001 - Human-in-the-Loop (HITL) Mode -- Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: HITL-001
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Plans/human-in-the-loop.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- Human-in-the-Loop (HITL) Mode -- Plan
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Provider-native correlation and approval scope
- Identity and blocked-policy transfer cluster
- Approval scope key and approver identity
- Plan Document Status
- Rewrite alignment (2026-02-21)
- Canonical HITL request contract
- Shared-runtime HITL request and command alignment
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
- Consequential transition, tray, and recovery-label alignment
- Debug automation front-door grants
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
- Executive Summary
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001'
- Relationship to Other Plans
- Derived Grouping Boundaries (DRY)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
- Package and Seam Completion Gates
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
- Settings Model
- Three Independent Toggles
negative_constraints:
- '- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not'
- The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_
- HITL classification keeps the `source axis`, `request axis`, and `execution/result axis` separate. A `/result` or execution outcome may explain why the blocked episode exists, but it must not become the request identity or the source identity.
- UI and storage routes must not cross-wire governance approvals with tool approvals. UI_Command_Catalog, Run_Graph_View, Orchestrator_Page, storage-plan, `Plans/Prompt_Pipeline.md`, `/Prompt_Pipeline.md`, Prompt_Pipeline, usage-feature, usage-feature.md, FileManager, newfeatures, and orchestrator-sub
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- Conversational, `/HITL/tooling`, and tooling docs must not overload session with incompatible scope meanings. Session copy is display or provider context only; blocked and approval correctness comes from lane/account/run/node identity under multi-lane and multi-actor execution.
- Domain-specific "open in X" commands may remain when they express a meaningful domain-specific product action, but they are wrappers over the same route/subject model. The `/subject` identity and route target are shared; HITL, object-open, and runtime surfaces must not invent custom argument familie
- 'Restore language is overloaded and must be normalized before display or persistence. Rollback, checkpoint, revert, and `/checkpoint/revert` wording must resolve to a safe-point-aware retry when a valid safe point exists and policy allows restore, or to an explicit `Start fresh attempt`; it must not '
- '**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.'
- '| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to orchestrator package/seam decision points surfaced through Phase/Task/Subtask grouping controls. Interview-phase-level HITL (pause after each interview phas'
- '- Phase/task/subtask labels are configuration and display groupings only. They MUST NOT redefine `approval_scope_key`, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.'
- '- **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.'
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
- '- Canonical action enumeration uses ordered `allowed_action_ids[]` only. Runtime, Dashboard, Assistant, and APIs MUST derive visible controls from that array and MUST NOT carry a second survivor array for blocked or recovery actions.'
- '- Any remaining phase/task/subtask labels may be rendered as explanatory UI copy, but they MUST NOT redefine approval scope, blocked identity, recovery semantics, or persistence ownership. `approval_scope_key` remains the only durable approval-scope handle for the blocked episode.'
- '- While an approval wait has a known future-timestamp or active user-visible timer, HITL surfaces MUST NOT render it as generic `deadlock/stall`, MUST NOT show stall banners, and MUST NOT auto-pause unrelated runnable work.'
- All surfaces MUST use the same action names, meanings, and enablement conditions. A surface may hide an action for layout reasons, but it MUST NOT rename or reinterpret it.
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- Runtime HITL persistence is keyed by blocked episode identity first. `checkpoints.hitl.{run_id}` and `checkpoints.hitl` are compatibility paths only; `/runtime/storage` records must distinguish concurrent pending-HITL episodes in the same run by `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`
- The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episo
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- '### Consequential transition, tray, and recovery-label alignment'
- 'Consequential approval and recovery transitions use a shared state transition report: from state, to state, target object, actor/source, `/source`, why the transition occurred, prerequisite evidence, review or corroboration refs, and resulting downstream obligations. `projection-trust` defines wheth'
- 'The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Itera'
- '- `seam_complete_gate` — fires when a seam transition is needed. Conditions: the source package is completed and the target package prerequisites are met. Actions: validate cross-package contracts, transfer context, and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = seam'
- '- **Decline action:** "Decline" is the canonical display label for `allowed_action_id = decline`, dispatched as `cmd.runtime.decline`. Legacy "Reject" copy may appear only as compatibility text and MUST map to this action family.'
- '- **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.'
- '- **Decline / Abort:** "Decline" maps to `cmd.runtime.decline` and surfaces the ordered runtime recovery actions. "Abort run" maps to `cmd.runtime.abort_run`; legacy "Reject" and "Cancel Run" labels are compatibility copy only. See §2 for full specification.'
- 2. **Runtime loop:** When a node reaches an approval prerequisite, transition into the canonical blocked episode flow and wait for a runtime action rather than a tier-local pause flag.
- '### Tier-era compatibility retirement'
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
- '- Canonical blocked classification uses `concern_reason`. If additional detail is needed, it MUST be carried in dedicated structured metadata or `detail_ref?`; no legacy short-code survivor field remains in the live contract.'
- '- Canonical approval resolution uses explicit outcome fields such as `approval_outcome` and `approval_recorded_at`, scoped by `approval_scope_key`. Continuation after review is represented by the recorded approval outcome, not by a separate legacy continue-decision field.'
- '- Blocked-episode recovery semantics are canonical. Retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore behavior remain attached to the same `run_id` + `node_id` + `blocked_sequence` episode, and recovery affordances are derived from `allowed_action_ids[]`, `concern_reason`'
stale_retired_dispositions:
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- HITL behavior and tier-boundary semantics'
- '- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not'
- '### Canonical HITL request contract'
- The canonical human-in-the-loop contract remains a blocked-runtime overlay.
- '- `blocked_sequence` remains the canonical approval anchor.'
- HITL is the approval consumer for shared-runtime, multi-lane execution. Assistant chat, validation-pass output, wizard-handoff payloads, DAE side-effect interception, and tool-event records must preserve `effective_account_id`, `requested_account`, `requested_account_id`, `execution_role`, permissio
- 'HITL boundary redesign remains automation-first: approval pauses attach to package-complete and seam-complete events rather than to phase/task/subtask or `/task/subtask` boundaries. Optional HITL boundaries share one UI contract for package-complete, seam-complete, and mandatory side-effect gates; t'
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- HITL blocked/runtime semantics are canonical for `/runtime` consumers; tier-boundary examples remain derived copy only.
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- The canonical switch-history / pressure-episode family is queryable from History, Ledger, Usage, `/Usage`, and Account/Usage Pressure projections, and it remains account-aware rather than tier-derived.
- Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episo
- 'File and artifact opening uses the shared object-open contract. FileManager may continue to expose `OpenFile { path... }` and the canonical `OpenFile { path: PathBuf, line?, range?, target_group? }` workspace-document command, but object-open requests for runtime artifacts must use open-by-identity '
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- 'System `/tray` notifications remain narrow: HITL approval required, run complete, major failure requiring attention, and severe `/pressure` or rate-limit events that materially stop progress. Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.'
- 'The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Itera'
- '- the grant remains represented through the canonical blocked-runtime overlay rather than through a new request-centric debug approval model'
- '- shared runtime actions remain canonical; Debug Mode does not invent a separate approval transport'
- '| **Plans/orchestrator-subagent-integration.md** | Defines the visible Phase → Task → Subtask → Iteration grouping and verification labels. HITL consumes those labels as configuration/display groupings only; canonical approval scope, recovery identity, and progression blocking come from package/seam'
- '- approvals do not bind to `tier_id` as the canonical execution scope'
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

