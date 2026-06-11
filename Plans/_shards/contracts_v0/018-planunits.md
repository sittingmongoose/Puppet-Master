# Shard 018: PlanUnits

Source: `Plans/Contracts_V0.md`

Source lines: L2544-L2824

Source SHA256: `15835ed96323e7cfee16f8a2b8a268cbdd9ad57efd83879f53ca07e7adc18021`

---

## PlanUnits

### CV-001 - Contracts V0 (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: CV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Plans/Contracts_V0.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Contracts_V0.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0118
preserved_exact_tokens:
- Contracts V0 (Canonical)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
- Canonical owner-section requirements
- Owner-first canonicalization order
- Requested/effective account identity contract
- Shared governance/runtime record envelope
- Concern record family definition
- Concern lifecycle and resolution kinds
- Concern action policy and authority model
- Concern linkage to adjacent families
- Promotion classes and gate evidence
- Historical semantic consistency
- Coverage blocker concern lifecycle owner section
- Concern owner vs creator vs resolver separation
- Concern source-event vs record vs projection split
- Runtime attribution ownership split
- Approval scope key and approver identity
- Concern update heuristics
- Route/open compatibility-only fallback marking
- Recommended minimum concern record shape
- Concern ownership / authority direction
- 0. Scope
- 'ContractRef: ContractName:Plans/Contracts_V0.md'
negative_constraints:
- '- Family-specific payloads specialize under the shared envelope; they must not invent one-off top-level shapes when a subordinate payload block can carry the family-specific fields under the canonical record identity, status, provenance, and lineage fields.'
- '- `requested_account_id` is the explicit requested account anchor; `requested_account_policy` remains the policy selector used before effective resolution and MUST NOT replace the concrete requested account field.'
- '- Gemini account resolution uses the same shared requested-vs-effective identity contract: the compact `/model/auth` display shorthand must still preserve account selection, switch reason, concrete auth mode, and `vs-effective` differences. A Gemini family may contain multiple API-key accounts and m'
- '- `selectable_unit_id` is resolver/debug identity for the chosen runtime candidate. It MUST NOT replace `account_id` in user-facing copy or persisted canonical auth/routing fields; `/routing` payloads keep account identity stable and may add selectable-unit evidence only as subordinate resolution de'
- Wizard, interview, Source Control, and worktree handoff payloads are high-risk runtime lineage consumers. `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `chain-wizard-flexibility`, `chain-wizard-flexibility.md`, `interview-subagent-integration`, and `interview-subagent-i
- Graph and runtime object schemas must carry explicit package/seam/lane IDs before they are used for execution recovery or promotion decisions. `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`, `/plan_graph.schema.json`, `/project_pla
- '`EventRecord` / runtime alignment claims are incomplete unless the schema carries project/thread/run/attempt/account identity directly or by canonical snapshot ref; owner docs must not claim runtime alignment while omitting those join keys.'
- Orchestrator and Source Control projections preserve requested/effective identity across `Orchestrator_Page`, `Orchestrator_Page.md`, `live-status`, `/switch`, `/model`, `/account`, `project_id`, cross-surface, and multi-project routing. Legacy `requested_persona_id` and `effective_persona_id` names
- '`Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, and `/Contracts_V0.md` are the practical runtime/UI SSOT for execution, blocked states, `/handoff`, `/recovery`, terminals, and event families. `AttemptJournal` and '
- Storage and projection backbones are package-aware and must not retain `/tier/session/thread` as their primary runtime scope. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/assistant-memory-subsystem.md`, `/storage-plan.md`, `/usage-feature.md`, `/assistant-memory-subsystem.md`, `/package
- Storage families must not stay attempt/block/usage-centric when the rewrite depends on lane/worktree/concern/project-attention-centric objects; attempt, blocked, and usage projections remain valid only when they join to lane/worktree/concern/project-attention identity rather than hiding it.
- Operational surfaces consume this contract across `Plans/FinalGUISpec.md`, `Plans/Run_Graph_View.md`, `Plans/assistant-chat-design.md`, `/FinalGUISpec.md`, `/Run_Graph_View.md`, and `/assistant-chat-design.md`. `phase-grouped` layouts, `/tier` actions, or one-current-task assumptions must not obscur
- Canonical persona and account field names must be traceable end to end. `Contracts_V0`, `Contracts_V0.md`, `attempt.started`, usage, storage, auth, and `/effective/provider/account` surfaces must not normatively revive `requested_persona_id` or `effective_persona_id` after this contract forbids them
- If a stale or degraded blocked-flow projection previously displayed `allowed_action_ids[]`, the `GUI` must not guess that the old action set is still valid; it revalidates against canonical/current runtime state before execution or disables the action with an explicit projection-health reason.
- Runtime attribution packets are carried by immutable prompt handoff bundles, `attempt.started`, `attempt_record`, `/dispatch`, and usage/worker-inspection projections when relevant. `tool.invoked` and `tool.denied` are both first-class runtime trace records; `tool.invoked` must not remain under-attr
- Wizard and interview handoffs inherit the runtime identity grammar before they emit artifacts. `Plans/chain-wizard-flexibility.md`, `/chain-wizard-flexibility.md`, `pre-run`, and `/artifact` payloads must not stay `under-keyed` relative to the adjacent event/artifact contracts. `interview-subagent-i
- Provider/model controls are execution identity controls, not page-local preferences. `Plans/newtools.md`, `Plans/assistant-chat-design.md`, `/newtools.md`, `/assistant-chat-design.md`, `/model`, `per-run`, `per-thread`, and `/effective` consumers must expose requested/effective execution identity ac
- '`Plans/Prompt_Pipeline.md` is upstream of requested/effective identity disclosure across chat, builders, Orchestrator, and storage; scope drift in that owner contract must not leak weaker requested/effective runtime fields into downstream projections.'
- Event-schema precision is mandatory wherever runtime identity appears in tables or examples. `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `run.started`, `usage.event`, `hitl.*`, `config-validation`, `safe_point`, `safe_point.created`, `scheduler.pass`, and `remediation.resol
- Adjacent command, route, evidence, usage, and storage schemas consume this same identity contract. `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/evidence.schema.json`, `/UI_Command_Catalog.md`, `/Crosswalk.md`, and `/evidence.schema.json` must not define incompatible target or proof re
- Scheduling and handoff schemas use package/seam/lane execution identity before tier or task framing. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `/seam/lane/
- Requested identity is carried beside verified/effective identity across downstream integrations. `GitHub_API_Auth_and_Flows`, `GitHub_API_Auth_and_Flows.md`, `GitHub_Integration`, `GitHub_Integration.md`, `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Contracts_V0`, `Contracts_V0.md`, `Ru
- One shared requested/effective identity disclosure contract is reusable across graph detail, artifacts, GitHub/auth surfaces, and usage/account-pressure surfaces; consumers may narrow display, but they must not fork the requested/effective identity grammar.
- 'Operational identity can be displayed beside provider or account identity, but `/account` ownership remains with the auth/account contract. A UI may show operational identity for clarity, yet it must not imply the same owner, token source, or authority as provider/account identity unless the owning '
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Route/open compatibility-only fallback marking'
- '- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers'
- Graph and runtime object schemas must carry explicit package/seam/lane IDs before they are used for execution recovery or promotion decisions. `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`, `/plan_graph.schema.json`, `/project_pla
- Runtime event rows that affect execution, usage, or recovery must carry the shared identity snapshot rather than a compatibility-era subset. `run.started`, `usage.event`, `/Run`, `/UI`, `/attempt`, and `/effective` consumers in `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, and `storage-plan.md`
- Orchestrator and Source Control projections preserve requested/effective identity across `Orchestrator_Page`, `Orchestrator_Page.md`, `live-status`, `/switch`, `/model`, `/account`, `project_id`, cross-surface, and multi-project routing. Legacy `requested_persona_id` and `effective_persona_id` names
- Artifact, HITL, and tool-denial surfaces must converge on the same blocked episode and runtime action contract. `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `human-in-the-loop`, and `human-in-the-loop.md` m
- 'Compatibility adoption is explicit: `HITLRequest`, `request_id`, `run.tier_`, `run.tier_*`, `/compatibility`, and `/navigation` are lineage or lookup metadata, not peer canonical approval or runtime snapshot identity. `route_target` and `OpenSubject` own navigation identity; `wizard.blocked` and `re'
- Canonical persona and account field names must be traceable end to end. `Contracts_V0`, `Contracts_V0.md`, `attempt.started`, usage, storage, auth, and `/effective/provider/account` surfaces must not normatively revive `requested_persona_id` or `effective_persona_id` after this contract forbids them
- Child/orchestrator lineage consumers must retire tier-era side files and selectors. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `TierContext`, `TierType`, `select_for_tier`, `tier_id`, `active-agents`, `active-agents.json`, `/effective-runtime`, node-adjace
- '`Plans/Orchestrator_Page.md` may describe newer blocked/remediation lineage only through the canonical blocked/remediation and route contracts; `TierChanged` and `active tier` are tier-era compatibility labels, not route identity, remediation identity, or runtime ownership.'
- Tier-era event names and cleanup priorities are explicit compatibility obligations. `Plans/storage-plan.md` and `/storage-plan.md` may retain `run.tier_started`, `run.tier_completed`, `run.verification_result`, `run.persona_stage_changed`, `run.qa_cycle_started`, and `run.qa_cycle_completed` as `tie
- Storage, telemetry, terminology, and event schemas anchor runtime identity with package/seam/lane/account scope before legacy scopes. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/Glossary.md`, `Plans/Crosswalk.md`, `/storage-plan.md`, `/usage-feature.md`, `/Glossary.md`, and `/Crosswalk
- 'HITL and tool-event contracts retire request-local and analytics-only eras into compatibility language. `HITL`, `HITLRequest`, `request-local`, `tier_id`, `tier_type`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are legacy approval vocabulary unless mapped to the `runtime-facing` '
- Legacy `HITLRequest` / blocked-flow examples that lean on `tier_id` or `tier_type` are compatibility references only; runtime-facing records use `node_id`, `blocked_sequence`, and attempt-scoped records as canonical execution anchors.
- Adjacent command, route, evidence, usage, and storage schemas consume this same identity contract. `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/evidence.schema.json`, `/UI_Command_Catalog.md`, `/Crosswalk.md`, and `/evidence.schema.json` must not define incompatible target or proof re
- '`Plans/storage-plan.md` and `/storage-plan.md` maintain an explicit `same-file` split between early `event-table` / `writer-facing` guidance and later runtime-recovery / `canonical-record` addenda. Readers must treat the latter as the governing canonical record and recovery contract whenever the ear'
- HITL request identity is compatibility vocabulary unless it resolves to blocked runtime action identity. `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `request_id`, `tier_id`, `tier_type`, `request_kind`, `request_kind = tier_boundary_approval`, `tier_boundary_approval`, and `tier-boundary`
- Tool denial and approval projections use the scheduler-impacting payload, not thinner compatibility rows. `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, and `tool.denied` consumers must not publish thin payloads as sufficient canon when scheduler state changes. `/e
- 'Storage, usage, evidence, and summary families stay node-native and execution-context first. `storage-plan`, `storage-plan.md`, `/runtime`, `rewrite-era`, `node-native`, `execution-context`, `tier_runtime_record`, `tier_id`, `cross-surface`, `usage_record`, `/summary`, and `tier-correlated` records '
- Approval action identity uses one canonical action-ID family. `Plans/Contracts_V0.md`, `Plans/human-in-the-loop.md`, `/Contracts_V0.md`, and `/human-in-the-loop.md` consumers must not wire blocked action IDs from both `allowed_actions[]` and `allowed_action_ids[]` as coequal canon; `allowed_actions[
- The shared runtime snapshot is the explicit replacement for `TierContext`. Any execution-unit refs, lane/worktree refs, requested/effective runtime identity, execution role, governance lineage, remediation generation, or `/replan` generation formerly packed into tier context must resolve into the pa
- Recovery command and wake semantics stay keyed to blocked runtime state. `UI_Command_Catalog.md`, `UI_Command_Catalog`, `HITL`, `cmd.runtime`, `cmd.runtime.*`, and pre-attempt blocked episodes map canonical recovery from `allowed_action_ids[]` to runtime commands; pre-attempt blocks are keyed by `bl
- 'Runtime artifact envelopes keep artifact-family distinctions while consuming the shared attribution packet instead of artifact-local identity alone. Artifact payload metadata includes `created_at_utc`, `summary?`, `detail_ref?`, `content_ref?`, and `source_surface?`; surviving `task_id` language in '
stale_retired_dispositions:
- '- Owner-before-consumer rule: when the canonicalization map calls for same-heading replacement or stale-residue retirement, owner-doc correction remains mandatory before consumer cleanup.'
- '- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.'
- '- Let storage-plan own the persistence mechanics for crash-critical active receipt/session lifecycle, blocked episode creation/resolution, follow-mode intent, last inspected run/node/log context, and retention anchors for receipts, log tails, watch buffers, explorer snapshots, and stale caches.'
- '- `requested_persona` and `effective_persona` are persisted core runtime identity fields. `_id` variants such as `requested_persona_id` and `effective_persona_id` are retired from canonical contracts and may survive only as migration/source-lineage aliases.'
- '- `provider_account_id` is retired as canonical/live identity vocabulary and may survive only as subordinate provider-native metadata inside bridged-provider envelopes.'
- Dispatcher and projection safety are runtime contract concerns. `/domain`, `cmd.runtime`, `cmd.runtime.*`, `correlation_id`, `allowed_action_ids`, and `allowed_action_ids[]` require a trace-through into persisted dispatch/domain events; recovery actions are admitted only when the current blocked epi
- If a stale or degraded blocked-flow projection previously displayed `allowed_action_ids[]`, the `GUI` must not guess that the old action set is still valid; it revalidates against canonical/current runtime state before execution or disables the action with an explicit projection-health reason.
- Resume, run-graph, and command consumers keep account trust and worker identity visible. `Plans/GitHub_Integration.md`, `/GitHub_Integration.md`, `/account`, and `trust-state` flows normalize commands and bind resumed flows to project/account trust before rehydrating state. `/Run`, `/use`, `/receipt
- Graph-native runtime surfaces expose the same identity and governance drill-down. `Plans/Run_Graph_View.md`, `/Run_Graph_View.md`, `/effective`, `graph-native`, `drill-in`, `trust-state`, and `governance-record` contracts must let operators inspect requested/effective identity, account trust, and go
- 'Storage, usage, evidence, and summary families stay node-native and execution-context first. `storage-plan`, `storage-plan.md`, `/runtime`, `rewrite-era`, `node-native`, `execution-context`, `tier_runtime_record`, `tier_id`, `cross-surface`, `usage_record`, `/summary`, and `tier-correlated` records '
- 'Stable target kinds are required for rewrite-era object families even when older Orchestrator, FileManager, or path-opening docs still pivot by `run_id`, `tier_id`, or file path. `node`, `attempt`, `scheduler_pass`, `blocked_episode`, and other rewrite-era objects are first-class navigation targets '
- 'Run graph and event projections expose the same runtime state without stale tier or persona field drift. `Run_Graph_View`, `Run_Graph_View.md`, graph detail, usage pivots, `/attempt/runtime`, `/verifier`, stale `hitl_request_id`, `View in Tiers`, `tier_id`, worker/verifier identity, `Contracts_V0`, '
- 'Runtime storage and persistence records carry execution context before tier compatibility. `attempt_record`, `tier_runtime_record`, run-start/runtime snapshot events, `/runtime`, `/persistence`, `auth-account`, `/account/role`, `shared-runtime`, provider-account identity, and `operational_identity` '
- Persisted destination state is subordinate to the requested route target. `/view-state` owns `active_subview`, filters, compare targets, pinned selections, destination tabs, and similar surface-local state, but those fields must be overridden when reuse would land on the wrong object, hide the reque
- Runtime record compatibility must not keep stale tier keys as structural canon. `tier_runtime_record` keyed by `run_id` and `tier_id`, `usage_record` keyed by `run_id`, `tier_id`, `attempt_id?`, and `usage_sequence`, and `evidence_record` keyed by `run_id`, `tier_id`, and `evidence_id` are compatibi
- Rewrite-root and Crosswalk routing guidance must consume contract-owned primitives instead of under-route ownership. `00-plans-index.md`, `plans-index`, `Decision_Log.md`, `Decision_Log`, `rewrite-tie-in-memo.md`, `rewrite-tie-in-memo`, `/effective`, `rewrite-era`, and `/Packages/Overseers` decision
- Projection health states use one rebuild/scan vocabulary. `/rebuild`, `/scan`, and `/sections` projections use `current` when caught up enough for normal use, `refreshing` when an old committed projection remains visible while refresh or rebuild runs, `stale` when usable for context but not guarante
- 'Approval and restart semantics preserve blocked-state identity across the Contracts, Executor Protocol, and HITL owners. `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/human-in-the-loop.md`, and `/human-in-the-loop.md` jointly own the rule '
- Alias and resume-url contracts keep migration metadata separate from canonical routing. `alias_of_command_id` belongs to migration `/deprecation` alias handling only; stable wrappers declare `normalizes_to`, `canonical_target_contract`, and `canonical_route_kind` instead of pretending to be deprecat
- Runtime identity packets carry execution role, blocked minima, and parent scope without reviving older field families. `requested_persona` ownership is about scope, not renaming it back into older fields. `Plans/Contracts_V0.md` and `/Contracts_V0.md` attempt/runtime packet families include `executi
- Widget and permission projections inherit shared account and blocked-state scope. Widget multi-account and `/account-pressure` contracts bind to canonical `provider_accounts` and `provider_accounts.*` projections, inherit trust and `/scope` from the host surface, and cannot create a local account-pr
- 'Route/open ownership must not leak into consumers or wiring. `WiringEntry` consumes route/open contracts and `/open` behavior; it is not their surrogate owner. Direct command dispatch verification must also encode wrapper normalization, deprecated alias mapping, route/open contract consumption, and '
- 'The command-definition layer carries minimal command-classification and normalization metadata without restating route payload structure: `command_kind` plus optional `normalization { kind, normalizes_to_contract? | alias_of_command_id? }`. Stable wrappers set `normalizes_to_contract`; deprecated al'
- Approval and dispatch proof stay runtime-command aware. `allowed_action_ids[]` has won at the runtime-command layer, so approval targeting resolves through `blocked_sequence` while any retained `request_id` is lineage or lookup metadata. `GATE-010` must eventually validate more than flat wiring cove
owner_boundary_notes:
- '# Contracts V0 (Canonical)'
- '- contracts own canonical route identity'
- '- Stratum 1: owner docs'
- '- Treat the routing tranche as structurally closed after the owner-doc contracts are added.'
- '- Strong aligned owner:'
- '- Strong owner docs:'
- '- mixed-canon owner docs'
- '- 1. Reconcile owner contracts and schemas first.'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Owner-first canonicalization order'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Coverage blocker concern lifecycle owner section'
- '### Concern owner vs creator vs resolver separation'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- CANONICAL CONTRACTS
- 'This document defines the canonical contracts for:'
- This section is the single canonical owner for runtime identity, concern/episode lifecycle, route_target primitives, and OpenSubject routing semantics across all surfaces and execution contexts.
- '- Apply owner-doc corrections before consumer and mirror cleanup.'
- '- Rerun fidelity audit only after owner and consumer corrections are in place.'
- '- The canonicalization sequence in this owner section is strict: canonical owner repairs first, dependent consumer updates second, mirror cleanup third, and final verification evidence last.'
- '- Owner-before-consumer rule: when the canonicalization map calls for same-heading replacement or stale-residue retirement, owner-doc correction remains mandatory before consumer cleanup.'
- '- The owner-doc integrity stack is ordered, not three isolated docs: `Crosswalk.md` first for primitive/term routing, `DRY_Rules.md` second for duplication and SSOT discipline, and `Decision_Log.md` third for durable decision trace. Contract repairs that touch those owners must preserve that order.'
- '- When a verification `re-check` cannot be trusted as one end-to-end read because owner or `/consumer` documents are too large, split it into smaller bounded reviewer slices and reconcile their findings back into this owner-before-consumer sequence before declaring closure.'
owner_hints:
- Plans/Contracts_V0.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

