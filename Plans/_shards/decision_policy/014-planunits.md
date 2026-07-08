# Shard 014: PlanUnits

Source: `Plans/Decision_Policy.md`

Source lines: L464-L3293

Source SHA256: `b207b63da950e011e04156e61c1426ee4b7921a8774ab2f7e45766efe6673dd6`

---

## PlanUnits

### DP-002 - Canonical Name And Policy Scope Signals

```yaml
plan_unit_id: DP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy preserves the canonical Puppet Master naming rule, compliance
  posture, and source-scope statement for deterministic ambiguity resolution.
gui_related: false
gui_classification_reason: This unit defines naming and policy scope, not UI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Policy text keeps Puppet Master as the only canonical platform name.
  - Legacy naming may be referenced only as legacy naming without quoting the retired name.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_name_drift
reasoning_tier: standard
context_scope: decision_policy_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: canonical_name_policy_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0001
preserved_exact_tokens:
  - "`Puppet Master`"
  - "`legacy naming`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Contracts_V0.md`"
negative_constraints:
  - "Do not quote older platform names; refer to them only as legacy naming."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-003 - Ambiguity Scope And Decision Policy Contract

```yaml
plan_unit_id: DP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy applies when ambiguity is unresolved by Spec Lock, Crosswalk,
  DRY Rules, or Glossary, and exposes PolicyRule:Decision_Policy.md as the
  governing policy reference.
gui_related: false
gui_classification_reason: This unit defines policy applicability and contract routing.
split_recommended: false
depends_on: [DP-002]
unblocks: []
acceptance_criteria:
  - Ambiguity resolution only falls to Decision Policy after higher-precedence sources do not decide.
  - PolicyRule:Decision_Policy.md remains the contract reference for this scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: policy_scope_drift
reasoning_tier: standard
context_scope: ambiguity_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: ambiguity_scope_policy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0002
preserved_exact_tokens:
  - "`Spec Lock`"
  - "`Crosswalk`"
  - "`DRY Rules`"
  - "`Glossary`"
  - "`ContractRef: PolicyRule:Decision_Policy.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-004 - Precedence Stack And Spec Lock Priority

```yaml
plan_unit_id: DP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Ambiguity resolution must follow the fixed precedence stack:
  Plans/Spec_Lock.json, Plans/Crosswalk.md, Plans/DRY_Rules.md,
  Plans/Glossary.md, then Decision Policy.
gui_related: false
gui_classification_reason: This unit defines policy ordering only.
split_recommended: false
depends_on: [DP-003]
unblocks: []
acceptance_criteria:
  - The five-source precedence stack remains ordered and non-negotiable.
  - The mechanical alias id 2 remains preserved for downstream anchors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: precedence_order_drift
reasoning_tier: high
context_scope: policy_precedence
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: precedence_stack
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0003
preserved_exact_tokens:
  - "`Plans/Spec_Lock.json`"
  - "`Plans/Crosswalk.md`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Glossary.md`"
  - "`ContractRef: SchemaID:Spec_Lock.json`"
  - "`<a id=\"2\"></a>`"
negative_constraints:
  - "Do not reorder the precedence stack."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-005 - Safe Autonomous Default Ordering

```yaml
plan_unit_id: DP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  When higher-precedence sources do not decide, deterministic defaults prefer
  the simplest safe non-scope-expanding choice, API-only paths over forbidden
  CLI subprocesses, idempotent behavior, and bounded retries with explicit
  backoff.
gui_related: false
gui_classification_reason: This unit defines backend policy defaults.
split_recommended: false
depends_on: [DP-004]
unblocks: []
acceptance_criteria:
  - Defaults prefer a simplest safe choice that does not expand scope.
  - Retries have explicit limits and backoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: autonomous_default_drift
reasoning_tier: standard
context_scope: deterministic_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: safe_autonomous_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`GitHub.com`"
  - "`API-only`"
  - "`idempotent`"
  - "`bounded retries`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2`"
negative_constraints:
  - "Do not expand product scope while resolving an implementation ambiguity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-006 - Stable Identity And Attribution Defaults

```yaml
plan_unit_id: DP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Stable IDs win over inferred labels: UI commands use cmd.* IDs, event types
  use stable type strings, OpenCode bridge persistence prefers
  connection_profile_id, usage_record growth stays attribution-relevant, and
  debug investigations group by investigation_id.
gui_related: true
gui_classification_reason: This unit includes user-visible UI command identity and bridge/debug identity labels.
split_recommended: false
depends_on: [DP-005]
unblocks: []
acceptance_criteria:
  - UI commands keep cmd.* IDs and event types keep stable type strings.
  - connection_profile_id is the persisted account/server identity for OpenCode bridge decisions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_attribution_drift
reasoning_tier: high
context_scope: stable_identity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: stable_identity_attribution_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`cmd.*`"
  - "`type`"
  - "`connection_profile_id`"
  - "`selectable_unit_id`"
  - "`usage_record`"
  - "`investigation_id`"
negative_constraints:
  - "Do not replace persisted account/server identity with selectable_unit_id."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-007 - Provider Policy Stale-Table Retirement

```yaml
plan_unit_id: DP-007
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Provider-specific behavior tables for Codex, Copilot, Gemini, Cursor, and
  OpenCode are advisory when stale; current selection policy is owned by
  Contracts, Multi-Account, Models, and provider contracts, with remaining
  provider-table cleanup limited to edge-case review.
gui_related: false
gui_classification_reason: This unit retires stale provider-policy tables, not UI presentation.
split_recommended: false
depends_on: [DP-006]
unblocks: []
acceptance_criteria:
  - Stale provider rows do not override current owner contracts.
  - Remaining cleanup is not a blocker for requested/effective account policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_provider_policy_drift
reasoning_tier: standard
context_scope: provider_policy_cleanup
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: stale_provider_table_retirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`Codex/Copilot/Gemini/Cursor/OpenCode`"
  - "`advisory when stale`"
  - "`Contracts, Multi-Account, Models, and provider contracts`"
negative_constraints:
  - "Do not let stale provider tables override current selection policy."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-008 - Operational Identity And Execution Role Separation

```yaml
plan_unit_id: DP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Operational identity is separate from provider-account identity; runtime and
  attempt packets carry execution_role when role-aware policy decides the route
  and must not collapse operational side effects into model/persona/auth/account
  fields.
gui_related: false
gui_classification_reason: This unit defines runtime identity policy.
split_recommended: false
depends_on: [DP-006]
unblocks: []
acceptance_criteria:
  - Runtime identity keeps github_api, registry, Kubernetes, provider-account, and operational side-effect identity distinct.
  - Runtime and attempt packets carry execution_role when required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_collapse
reasoning_tier: high
context_scope: runtime_identity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: operational_identity_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`github_api`"
  - "`execution_role`"
  - "`/model/persona/auth/account`"
  - "`ContractName:Plans/Multi-Account.md`"
negative_constraints:
  - "Do not collapse operational identity into provider-account identity."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
```

### DP-009 - HITL Recovery Defaults And Projection Trust Copy

```yaml
plan_unit_id: DP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  HITL recovery defaults normalize allowed_action_ids, keep HITL off by default
  except configured or critical failure cases, and require explicit projection
  trust copy before mutating or decision-bearing actions.
gui_related: true
gui_classification_reason: This unit defines approval prompts, recovery UI, and user-visible trust copy.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - allowed_action_ids is canonical over allowed_actions.
  - Projection trust states use explicit warning, blocked, stale, and degraded copy before action.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_trust_copy_drift
reasoning_tier: high
context_scope: hitl_recovery_projection_trust
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_recovery_projection_trust_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`allowed_action_ids`"
  - "`allowed_actions`"
  - "`HITL is off by default`"
  - "`Warning: provider pressure high`"
  - "`Blocked: waiting on user approval`"
  - "`View may be stale; refresh before acting`"
  - "`Projection degraded; showing canonical history only`"
negative_constraints:
  - "Do not allow live mutating or decision-bearing actions to rely on unclear projection trust state."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-010 - Page-Owned Orchestrator Scope And Permission Identity

```yaml
plan_unit_id: DP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Orchestrator semantic scope is page-owned: page and router state own project,
  focused run, historical-run mode, and object focus, while widgets may only add
  presentation or sub-filter choices.
gui_related: true
gui_classification_reason: This unit governs page, router, widget, and settings behavior.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Widgets do not secretly select a different run or redefine operational scope.
  - Permission, model, and account policy keep runtime-overlay and execution context explicit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_scope_drift
reasoning_tier: high
context_scope: orchestrator_page_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
node_compile_hint:
  mode: page_owned_orchestrator_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`project_id`"
  - "`focused_run_id`"
  - "`historical-run mode`"
  - "`account_pressure_episode`"
  - "`account_switch_event`"
negative_constraints:
  - "Widgets must not secretly select a different /run or redefine operational scope."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
```

### DP-011 - Degraded-Trust Concern Escalation Bridge

```yaml
plan_unit_id: DP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Conversational and tooling surfaces share degraded-trust and concern
  escalation disclosure so blocked overlays, approval prompts, tool health, chat
  threads, switch events, concerns, and trust-staleness explanations stay
  consistent.
gui_related: true
gui_classification_reason: This unit defines user-visible overlays, prompts, disclosures, and chat explanations.
split_recommended: false
depends_on: [DP-009]
unblocks: []
acceptance_criteria:
  - Blocked overlays, approval prompts, and tool-health disclosures expose runtime-trust and concern state consistently.
  - Chat threads have a place for switch events, concern notices, and trust-staleness explanation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: degraded_trust_surface_drift
reasoning_tier: standard
context_scope: trust_concern_bridge
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: degraded_trust_concern_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`/concern`"
  - "`degraded-trust`"
  - "`switch events`"
  - "`trust-staleness explanation`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-012 - Subagent Runtime Consumer Boundary

```yaml
plan_unit_id: DP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Orchestrator subagent integration consumes canonical execution and runtime
  context and may keep local selection or decomposition helpers, but route,
  identity, approval, blocked, and recovery semantics come from canonical
  runtime and policy contracts.
gui_related: false
gui_classification_reason: This unit defines runtime ownership boundaries.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Subagent integration does not own a mixed runtime object.
  - Route, identity, approval, blocked, and recovery semantics route to canonical runtime and policy contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_runtime_ownership_drift
reasoning_tier: standard
context_scope: subagent_runtime_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: subagent_runtime_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/runtime`"
  - "`/decomposition`"
  - "`ContractName:Plans/orchestrator-subagent-integration.md`"
negative_constraints:
  - "Do not make orchestrator-subagent-integration the owner of mixed runtime semantics."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/orchestrator-subagent-integration.md
```

### DP-013 - Blocked Approval Identity And Compatibility Fields

```yaml
plan_unit_id: DP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval identity must not be reconstructed from request_id, tier_id,
  tier_type, ambient labels, one-off resume_url, wizard, or object values;
  those fields are compatibility, lineage, or derived data under blocked-episode
  identity.
gui_related: false
gui_classification_reason: This unit governs approval identity semantics.
split_recommended: false
depends_on: [DP-012]
unblocks: []
acceptance_criteria:
  - request_id, tier_id, tier_type, and resume_url remain non-primary identity fields.
  - Tier and group surfaces consume canonical contract pointers instead of rebuilding runtime identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_identity_reconstruction
reasoning_tier: high
context_scope: blocked_approval_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_approval_identity_compatibility_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`request_id + tier_id + tier_type`"
  - "`one-off`"
  - "`resume_url`"
  - "`/wizard`"
  - "`/object`"
negative_constraints:
  - "Approval identity must not be reconstructed from request_id + tier_id + tier_type or ambient tier labels."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-014 - Runtime Blocked Reasons And Concern Lifecycle

```yaml
plan_unit_id: DP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime blocked reasons stay runtime truth across Source Control and SCM
  remediation surfaces, while concern closure requires rationale, resolution
  kind, and explicit lineage for merge, split, and supersede actions.
gui_related: true
gui_classification_reason: This unit affects Source Control/SCM visible blocked states and concern actions.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - dirty_worktree and worktree_conflict remain exact blocked reasons.
  - Concern dismissal, resolution, merge, split, and supersede actions preserve lineage and semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_reason_softening
reasoning_tier: high
context_scope: blocked_reasons_concern_lifecycle
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: blocked_reason_concern_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`dirty_worktree`"
  - "`worktree_conflict`"
  - "`dismissed`"
  - "`resolved`"
  - "`resolution_kind`"
  - "`merge`"
  - "`split`"
  - "`supersede`"
negative_constraints:
  - "Do not soften dirty_worktree or worktree_conflict into generic SCM errors."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-015 - HITL Interview Approval Scope And Automation Defaults

```yaml
plan_unit_id: DP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  HITL carries actor, lane/account, approval provenance, concurrency-safe queue,
  and scope rules; interview projections preserve runtime identity parity, and
  approval-heavy UX remains optional HITL policy rather than mandatory runtime
  progress.
gui_related: true
gui_classification_reason: This unit defines approval UX defaults and interview shared orchestration behavior.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - Tier-level settings may remain only as user-facing approval-trigger configuration.
  - Automation-first execution remains the default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_heavy_default_drift
reasoning_tier: standard
context_scope: hitl_interview_approval_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: hitl_interview_approval_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/lane/account`"
  - "`routing-key`"
  - "`tier-level`"
  - "`Automation-first execution`"
  - "`model-neutral`"
negative_constraints:
  - "Do not make phase-complete approvals, manual review steps, modal confirmations, or direct-click approvals mandatory runtime checkpoints."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/interview-subagent-integration.md
```

### DP-016 - Actor Account Traceability And Degraded Projection Gating

```yaml
plan_unit_id: DP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Tool, approval, blocked, command, storage, and recovery records use one
  node/actor/account-aware key family, and degraded-projection gating is
  action-class aware with explicit user explanation.
gui_related: true
gui_classification_reason: This unit governs disabled/explained action states and trace-visible runtime records.
split_recommended: false
depends_on: [DP-014]
unblocks: []
acceptance_criteria:
  - Tool events carry actor/account-aware identity instead of under-attributed analytics exhaust.
  - Execution-changing, promotion, recovery, approval, and recovery-state actions require fresh-enough projection state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: actor_account_trace_loss
reasoning_tier: high
context_scope: actor_account_projection_gating
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: actor_account_traceability_projection_gating
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/actor/account-aware`"
  - "`/identity`"
  - "`allowed_action_ids[]`"
  - "`/promotion/recovery/approval`"
  - "`/navigation/export`"
negative_constraints:
  - "Do not hide degraded projection gating behind generic disabled controls."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
```

### DP-017 - Worker Runtime Identity And Durable Projection Browsing

```yaml
plan_unit_id: DP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Worker selection follows the provider/model/persona/account policy model, and
  evidence or artifact browsing may survive stale projections only as durable
  canonical records with explicit stale or degraded copy.
gui_related: true
gui_classification_reason: This unit governs visible evidence/artifact browsing and live-status indicators.
split_recommended: false
depends_on: [DP-016]
unblocks: []
acceptance_criteria:
  - Worker routes carry identity, account, role, and permission separation.
  - Evidence and artifact views distinguish canonical history from live-status or new-link claims under stale/degraded projection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worker_projection_browsing_drift
reasoning_tier: standard
context_scope: worker_identity_durable_projection
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: worker_runtime_identity_durable_projection_browsing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`/model/persona/account`"
  - "`Evidence`"
  - "`/artifact`"
  - "`/artifacts`"
  - "`View may be stale`"
  - "`Projection degraded`"
negative_constraints:
  - "Do not make new-links or live-status indicators authoritative under degraded projections."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-018 - Route Primitive Ownership And Research-Incomplete Seams

```yaml
plan_unit_id: DP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  GitHub realm isolation remains part of runtime identity, canonical route
  contracts are owned by Contracts_V0, primitive boundaries by Crosswalk, and
  any seam that still needs a new canonical event or record family remains
  research-incomplete.
gui_related: false
gui_classification_reason: This unit defines owner routing and research status, not presentation.
split_recommended: false
depends_on: [DP-017]
unblocks: []
acceptance_criteria:
  - github_api and copilot_github do not collapse into one runtime identity bucket.
  - Route contract ownership stays with Contracts_V0 while primitive boundaries stay with Crosswalk.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_owner_confusion
reasoning_tier: high
context_scope: route_primitive_ownership
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: route_primitive_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`github_api`"
  - "`copilot_github`"
  - "`Contracts_V0.md`"
  - "`Crosswalk.md`"
  - "`/record`"
  - "`research-incomplete`"
negative_constraints:
  - "Do not treat research-incomplete route seams as done."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
```

### DP-019 - Blocked Projection Persistence And Owner-Schema Completion

```yaml
plan_unit_id: DP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Worker output, approval targeting, live graph bindings, approval persistence,
  route/open posture, and persistence-contract decisions flow through canonical
  blocked projections and owner-schema completion rather than same-file stale
  alternatives.
gui_related: false
gui_classification_reason: This unit defines persistence and owner-schema contracts.
split_recommended: false
depends_on: [DP-018]
unblocks: []
acceptance_criteria:
  - tier_id worker-output correlation and request_id approval targeting do not bypass canonical blocked projection identity.
  - attempt_record and tier_runtime_record may coexist only when tier_runtime_record is derived and view-oriented.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persistence_owner_schema_drift
reasoning_tier: high
context_scope: blocked_projection_persistence
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_projection_persistence_owner_schema_completion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`attempt_record`"
  - "`tier_runtime_record`"
  - "`request_id`"
  - "`blocked_sequence`"
  - "`episode-scoped restart persistence`"
  - "`canon-collapse`"
negative_constraints:
  - "Decision Policy must not replace Contracts_V0 as the runtime identity, blocked identity, or route/open contract owner."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### DP-020 - Runtime Artifact Lineage And Blocked Episode Targetability

```yaml
plan_unit_id: DP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime identity is not replaced by artifact lineage; logical_artifact_id and
  linked_artifact_id remain navigation helpers, while blocked_sequence has
  canonical blocked-episode identity for approval, resume, inspection, and
  remediation.
gui_related: true
gui_classification_reason: This unit governs CTA cards, blocked notices, navigation helpers, and blocked episode interactions.
split_recommended: false
depends_on: [DP-019]
unblocks: []
acceptance_criteria:
  - Artifact lineage IDs do not become runtime or blocked-object identity.
  - Blocked episodes are targetable objects, not only node or attempt views.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_artifact_identity_drift
reasoning_tier: high
context_scope: blocked_episode_targetability
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: runtime_artifact_lineage_blocked_episode_targetability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`logical_artifact_id`"
  - "`linked_artifact_id`"
  - "`CtA card actions`"
  - "`blocked-notice`"
  - "`blocked_sequence`"
negative_constraints:
  - "Artifact lineage must not become runtime identity or blocked-object identity."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
```

### DP-021 - Usage Route Open Object Ownership Cleanup

```yaml
plan_unit_id: DP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Usage routing cleanup includes usage-feature and its duplicated cost_usage
  section, canonical blocked objects carry the cross-family minimum, and
  route/open ownership is subject-first for content subjects and object_kind
  based for non-subject objects.
gui_related: false
gui_classification_reason: This unit defines routing and ownership cleanup rules.
split_recommended: false
depends_on: [DP-020]
unblocks: []
acceptance_criteria:
  - usage-feature cost ownership is normalized with Usage routing.
  - subject_id routes apply to content subjects and object_kind routes apply to non-subject objects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_object_owner_drift
reasoning_tier: high
context_scope: usage_route_open_cleanup
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_route_open_object_ownership_cleanup
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`usage-feature.md`"
  - "`cost_usage`"
  - "`blocked-episode`"
  - "`preview_subject_id`"
  - "`subject_id`"
  - "`object_kind`"
negative_constraints:
  - "Do not invent a second identity model when a subject-first route identity is present."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/usage-feature.md
```

### DP-022 - Tier Compatibility Cleanup Lifecycle And Large-Run Policy

```yaml
plan_unit_id: DP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Tier-shaped objects may survive only as compatibility or selector overlays,
  cleanup lifecycle distinguishes archive, remove, prune, recover, and restore,
  and Orchestrator-wide large-run pagination preserves progress, blocked, and
  evidence navigation.
gui_related: true
gui_classification_reason: This unit governs user-visible selectors, cleanup actions, and large-run navigation behavior.
split_recommended: false
depends_on: [DP-021]
unblocks: []
acceptance_criteria:
  - Tier-shaped selectors point back to canonical run/node/attempt/lane/worktree identity.
  - Cleanup actions distinguish archival, pruning, semantic removal, and recovery or restore posture before mutation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tier_cleanup_large_run_drift
reasoning_tier: standard
context_scope: tier_cleanup_large_run_policy
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: tier_compatibility_cleanup_lifecycle_large_run_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`tier-shaped`"
  - "`/task/subtask/iteration`"
  - "`/remove/prune/recover`"
  - "`large-run`"
  - "`/pagination`"
negative_constraints:
  - "Tier-shaped objects must not pretend to be canonical runtime context."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
```

### DP-023 - OpenCode Identity And Redaction Defaults

```yaml
plan_unit_id: DP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  OpenCode and bridged request/runtime bundles carry full auth/account identity
  plus upstream-provider identity rules, and secret-like data is redacted and
  never persisted.
gui_related: false
gui_classification_reason: This unit defines identity and storage safety policy.
split_recommended: false
depends_on: [DP-022]
unblocks: []
acceptance_criteria:
  - Bridge consumers can distinguish upstream provider identity from local account, role, and operational identity.
  - Possible secrets are treated as secrets and are not persisted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_redaction_identity_drift
reasoning_tier: high
context_scope: opencode_identity_redaction
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: opencode_identity_redaction_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`auth`"
  - "`/account`"
  - "`upstream-provider`"
  - "`Prefer redaction`"
  - "`ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations`"
negative_constraints:
  - "Do not persist data that might be a secret."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Provider_OpenCode.md
```

### DP-024 - Tie-Break Ordering Defaults

```yaml
plan_unit_id: DP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  If two choices remain otherwise equal, choose the option already referenced by
  an existing plan document, and if still tied choose the lexicographically
  smallest stable ID.
gui_related: false
gui_classification_reason: This unit defines deterministic ordering policy.
split_recommended: false
depends_on: [DP-004]
unblocks: []
acceptance_criteria:
  - Referenced existing plan choices beat unreferenced alternatives.
  - Lexicographically smallest stable ID is the final tie-breaker.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tiebreak_drift
reasoning_tier: standard
context_scope: deterministic_tiebreak
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: tiebreak_ordering_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0009
preserved_exact_tokens:
  - "`referenced by an existing plan document`"
  - "`lexicographically smallest stable ID`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-025 - Autonomous Decision Logging Contract

```yaml
plan_unit_id: DP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Autonomous ambiguity resolution emits exactly one schema-valid auto-decision
  row to the correct internal or user-project path, with deterministic field
  semantics, contract_refs, and no secrets or credential material.
gui_related: false
gui_classification_reason: This unit defines JSONL decision logging policy.
split_recommended: false
depends_on: [DP-024]
unblocks: []
acceptance_criteria:
  - Puppet Master internal SSOT decisions write to Plans/auto_decisions.jsonl.
  - User-project artifact decisions write to .puppet-master/project/auto_decisions.jsonl.
  - Auto-decision rows do not contain secrets in decision, rationale, or applied_to.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auto_decision_logging_drift
reasoning_tier: high
context_scope: autonomous_decision_logging
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/auto_decisions.jsonl
node_compile_hint:
  mode: autonomous_decision_logging_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0010
preserved_exact_tokens:
  - "`pm.auto_decisions.schema.v1`"
  - "`Plans/auto_decisions.jsonl`"
  - "`.puppet-master/project/auto_decisions.jsonl`"
  - "`inputs_hash`"
  - "`contract_refs[]`"
  - "`PolicyRule:no_secrets_in_storage`"
negative_constraints:
  - "Auto-decision rows MUST NOT contain secrets or credential material."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-026 - No Human In Loop Runtime Rule

```yaml
plan_unit_id: DP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime execution plans must not depend on humans making decisions mid-run;
  the spec-lock-update-protocol alias remains preserved for the following
  SpecLock protocol section.
gui_related: false
gui_classification_reason: This unit defines runtime decision policy.
split_recommended: false
depends_on: [DP-025]
unblocks: []
acceptance_criteria:
  - Plans do not depend on humans making decisions during orchestrator execution, agent iterations, or verification gates.
  - The spec-lock-update-protocol anchor remains available.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: human_midrun_dependency
reasoning_tier: high
context_scope: no_human_in_loop_runtime
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: no_human_in_loop_runtime_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0011
preserved_exact_tokens:
  - "`No human in the loop`"
  - "`plans must not depend on humans making decisions mid-run`"
  - "`<a id=\"spec-lock-update-protocol\"></a>`"
negative_constraints:
  - "Plans MUST NOT depend on humans making decisions mid-run."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-027 - Spec Lock Protocol Boundary

```yaml
plan_unit_id: DP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  SpecLock updates are autonomous machine maintenance only after canonical SSOT
  edits, and the operational handling forbids hand-maintained Spec_Lock or
  manual auto_decisions ledger updates outside the protocol.
gui_related: false
gui_classification_reason: This unit defines governance protocol boundaries.
split_recommended: false
depends_on: [DP-026]
unblocks: []
acceptance_criteria:
  - Spec Lock updates are allowed only after canonical SSOT edits.
  - Plans/Spec_Lock.json and Plans/auto_decisions.jsonl are not hand-maintained outside the protocol.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_protocol_boundary_drift
reasoning_tier: high
context_scope: spec_lock_update_protocol
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
  - Plans/auto_decisions.jsonl
node_compile_hint:
  mode: spec_lock_protocol_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0013
preserved_exact_tokens:
  - "`SpecLock Update Protocol`"
  - "`Plans/Spec_Lock.json`"
  - "`Plans/auto_decisions.jsonl`"
  - "`SchemaID:pm.auto_decisions.schema.v1`"
negative_constraints:
  - "Do not hand-edit Spec_Lock or manually maintain auto_decisions outside this protocol."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-028 - Spec Lock Deterministic Update Steps

```yaml
plan_unit_id: DP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  A Spec Lock update loads and rewrites the full JSON object, recomputes
  canonical SSOT hashes, appends one auto-decision row, produces schema-valid
  evidence, and runs verifier gates.
gui_related: false
gui_classification_reason: This unit defines governance update mechanics.
split_recommended: false
depends_on: [DP-027]
unblocks: []
acceptance_criteria:
  - Spec Lock updates rewrite the full JSON object without partial updates.
  - canonical_ssot_hashes, auto_decisions, evidence bundles, and verifier gates are all part of the protocol.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_update_step_loss
reasoning_tier: high
context_scope: spec_lock_update_steps
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
node_compile_hint:
  mode: spec_lock_deterministic_update_steps
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0014
preserved_exact_tokens:
  - "`canonical_ssot_hashes[*].sha256`"
  - "`pm.evidence.schema.v1`"
  - "`Gate:GATE-001`"
  - "`Plans/evidence.schema.json`"
negative_constraints:
  - "Do not partially update Spec_Lock fields."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-029 - Spec Lock Prohibited Behaviors

```yaml
plan_unit_id: DP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Spec Lock updates must not add TBD, Open Questions, or ask-later language and
  must not leave canonical SSOT hashes stale after SSOT docs change.
gui_related: false
gui_classification_reason: This unit defines governance prohibitions.
split_recommended: false
depends_on: [DP-028]
unblocks: []
acceptance_criteria:
  - Spec Lock updates do not add deferred-decision language.
  - Hashes are not left stale after SSOT document changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_prohibited_behavior
reasoning_tier: high
context_scope: spec_lock_prohibitions
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
node_compile_hint:
  mode: spec_lock_prohibited_behaviors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0015
preserved_exact_tokens:
  - "`TBD`"
  - "`Open Questions`"
  - "`ask later`"
  - "`ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators`"
  - "`SchemaID:Spec_Lock.json#canonical_ssot_hashes`"
negative_constraints:
  - "Do not add TBD, Open Questions, or ask later language as part of a Spec Lock update."
  - "Do not leave hashes stale after changing SSOT docs."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-030 - No Secrets In Persistent Storage

```yaml
plan_unit_id: DP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Persistent stores, including seglog, redb, and Tantivy indexes, must not
  contain tokens, passwords, API keys, OAuth refresh tokens, credentials, or
  other secrets; tokens live only in the OS credential store.
gui_related: false
gui_classification_reason: This unit defines storage safety policy.
split_recommended: false
depends_on: [DP-023]
unblocks: []
acceptance_criteria:
  - Persistent stores do not contain secrets.
  - AuthState tokens are not persisted, and violations are P0 remediation bugs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_persistence
reasoning_tier: high
context_scope: persistent_storage_secrets
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_secrets_in_persistent_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0016
preserved_exact_tokens:
  - "`PolicyRule: no_secrets_in_storage`"
  - "`seglog`"
  - "`redb`"
  - "`Tantivy indexes`"
  - "`OS credential store`"
  - "`Architecture_Invariants.md#INV-002`"
  - "`<a id=\"6\"></a>`"
negative_constraints:
  - "Persistent stores MUST NOT contain secrets."
  - "Tokens MUST NOT be persisted in AuthState."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Architecture_Invariants.md
```

### DP-031 - Ambiguity Deterministic Resolution

```yaml
plan_unit_id: DP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Ambiguity exists when multiple valid technical or design choices satisfy user
  intent; resolve it by applying deterministic defaults from section 2 and
  logging to Plans/auto_decisions.jsonl without user interaction.
gui_related: false
gui_classification_reason: This unit defines policy classification and logging, not UI presentation.
split_recommended: false
depends_on: [DP-024, DP-025]
unblocks: []
acceptance_criteria:
  - Ambiguity is resolved by deterministic defaults, not user questions.
  - Examples such as buffer size, retry count, and brand-palette color remain classified as ambiguity when user intent is satisfied.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ambiguity_classification_drift
reasoning_tier: standard
context_scope: ambiguity_vs_missing_intent
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: ambiguity_deterministic_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0018
preserved_exact_tokens:
  - "`Ambiguity (multiple valid choices)`"
  - "`pm.auto_decisions.schema.v1`"
  - "`Choosing a buffer size`"
  - "`Picking a retry count`"
  - "`Selecting a color within a brand palette`"
negative_constraints:
  - "Do not ask the user when deterministic defaults resolve the ambiguity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-032 - Missing User Intent Clarification Boundary

```yaml
plan_unit_id: DP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Missing user intent or insufficient specification is a material product choice
  the system cannot infer; it generates a clarification question captured in
  needs_user_clarification and does not apply a deterministic default.
gui_related: false
gui_classification_reason: This unit defines pre-execution clarification policy.
split_recommended: false
depends_on: [DP-031]
unblocks: []
acceptance_criteria:
  - Missing user intent generates a clarification question rather than a deterministic default.
  - The clarification is captured in requirements_quality_report needs_user_clarification.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: missing_intent_defaulting
reasoning_tier: high
context_scope: missing_user_intent
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: missing_user_intent_clarification_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0019
preserved_exact_tokens:
  - "`Missing User Intent / Insufficient Specification`"
  - "`needs_user_clarification[]`"
  - "`pm.requirements_quality_report.schema.v1`"
negative_constraints:
  - "The system MUST generate a clarification question and MUST NOT apply a deterministic default."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-033 - Pre-Execution Clarification And Start-Run Block

```yaml
plan_unit_id: DP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Clarification questions surface before orchestrator execution during Planning
  Wizard finalization or a legacy Chain Wizard / Interview compatibility flow;
  unresolved clarification blocks run start by moving wizard state to
  attention_required and blocking the Start Run action.
gui_related: true
gui_classification_reason: This unit defines user-visible clarification timing and Start Run blocking.
split_recommended: false
depends_on: [DP-032]
unblocks: []
acceptance_criteria:
  - Clarification occurs before any orchestrator run begins.
  - If clarification is unresolved, the run does not start and Start Run is blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_execution_clarification_bypass
reasoning_tier: high
context_scope: clarification_start_run_block
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: pre_execution_clarification_start_run_block
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0020
preserved_exact_tokens:
  - "`Chain Wizard`"
  - "`Interview phase`"
  - "`attention_required`"
  - "`Start Run`"
  - "`PolicyRule:Decision_Policy.md§4`"
negative_constraints:
  - "If clarification cannot be resolved before run start, the run MUST NOT start."
  - "Do not use Chain Wizard or Interview as current product terminology outside compatibility/source-lineage contexts."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Planning_Wizard.md
  - Plans/chain-wizard-flexibility.md
```

### DP-034 - Requirements Quality Report Boundary Severity Persistence

```yaml
plan_unit_id: DP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The requirements_quality_report is a pre-execution artifact generated after
  Contract Unification and before run start; execution may continue only on PASS
  with empty needs_user_clarification, and report text is redacted before
  persistence.
gui_related: false
gui_classification_reason: This unit defines validation artifact and persistence policy.
split_recommended: false
depends_on: [DP-030, DP-032, DP-033]
unblocks: []
acceptance_criteria:
  - Execution only continues when the latest canonical report is PASS and needs_user_clarification is empty.
  - Blocking severity and redaction rules are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_quality_report_drift
reasoning_tier: high
context_scope: requirements_quality_report_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: requirements_quality_report_boundary_severity_persistence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0021
preserved_exact_tokens:
  - "`requirements_quality_report`"
  - "`verdict: \"PASS\"`"
  - "`needs_user_clarification[]`"
  - "`missing_scenarios`"
  - "`contradiction`"
  - "`vagueness`"
  - "`PolicyRule:no_secrets_in_storage`"
negative_constraints:
  - "Do not copy credentials or tokens into requirements quality report fields."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
```

### DP-035 - Runtime Fallback Prohibition Defaults

```yaml
plan_unit_id: DP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime and consumer docs must not preserve tier-era or request-era canon as
  silent fallback; provider and account fallback is automatic only for eligible
  policy-permitted units and otherwise terminates in explicit blocked reasons.
gui_related: false
gui_classification_reason: This unit defines runtime fallback policy.
split_recommended: false
depends_on: [DP-007, DP-013]
unblocks: []
acceptance_criteria:
  - Replacement canon does not leave silent tier-era or request-era fallbacks.
  - Terminal fallback blocked reasons remain explicit and enumerable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_runtime_fallback
reasoning_tier: high
context_scope: runtime_decision_rules_addendum
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: runtime_fallback_prohibition_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0023
preserved_exact_tokens:
  - "`No hidden orchestration fallbacks`"
  - "`no_eligible_account`"
  - "`policy_forbids_fallback`"
  - "`all_units_hard_blocked`"
negative_constraints:
  - "Runtime and consumer docs must not preserve tier-era or request-era canon as silent fallback behavior."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-036 - Deterministic Blocked Approval Identity Addendum

```yaml
plan_unit_id: DP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blocked and approval decisions resolve through runtime blocked episodes
  targeting run_id, node_id, blocked_sequence, and optional attempt_id, with
  request_id retained only as lineage or compatibility and allowed_action_ids as
  canonical.
gui_related: false
gui_classification_reason: This unit defines blocked and approval payload identity.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - Runtime blocked episode identity uses run_id, node_id, blocked_sequence, and attempt_id when present.
  - request_id is lineage/compatibility only and allowed_action_ids[] is canonical.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_approval_identity_drift
reasoning_tier: high
context_scope: blocked_approval_identity_addendum
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: deterministic_blocked_approval_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0024
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
  - "`request_id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "request_id is lineage/compatibility only."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-037 - Workflow Overlay Identity Preservation

```yaml
plan_unit_id: DP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Deterministic defaults preserve workflow overlay identity instead of
  collapsing it into runtime posture; Deep Plan remains a first-class workflow
  display identity even when normalized runtime mode is plan.
gui_related: false
gui_classification_reason: This unit defines workflow identity semantics.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Deep Plan remains first-class workflow display identity.
  - Shared lower-level planning mechanics stay in subordinate profile or behavior fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: workflow_identity_collapse
reasoning_tier: standard
context_scope: workflow_overlay_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
node_compile_hint:
  mode: workflow_overlay_identity_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0025
preserved_exact_tokens:
  - "`Deep Plan`"
  - "`/workflow`"
  - "`plan`"
  - "`deep_plan`"
  - "`/profile`"
negative_constraints:
  - "Do not collapse Deep Plan workflow identity into lower-level plan runtime posture."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-038 - Projection-Sensitive Mutation Guard

```yaml
plan_unit_id: DP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Mutating actions must not rely silently on stale, partial, unknown, degraded,
  account-changed, receipt, state, or drift projections; mutation-sensitive
  domains return to blocked or preflight-gated posture and require revalidate
  immediately before mutation.
gui_related: true
gui_classification_reason: This unit governs visible blocked/preflight action posture for mutation-sensitive surfaces.
split_recommended: false
depends_on: [DP-016]
unblocks: []
acceptance_criteria:
  - Registry promotion, Docker Manager drift detection, and Kubernetes operations are projection-sensitive mutation domains.
  - /revalidate occurs immediately before mutation when projection trust is not authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_projection_mutation
reasoning_tier: high
context_scope: projection_state_action_policy
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: projection_sensitive_mutation_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`stale`"
  - "`partial`"
  - "`unknown`"
  - "`degraded`"
  - "`account-changed`"
  - "`/revalidate`"
negative_constraints:
  - "Mutating actions must not rely silently on stale or degraded projections."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-039 - Auth Action Lifecycle Provider Pressure And Config Ownership

```yaml
plan_unit_id: DP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Setup/auth actions expose idle, pending, success, failure, disabled, and
  post-success lifecycle states; provider pressure distinguishes authoritative
  counters from inferred signals, and GUI provider/model/account controls belong
  primarily in Agent-Config.
gui_related: true
gui_classification_reason: This unit defines visible auth action states, pressure display, and configuration surface ownership.
split_recommended: false
depends_on: [DP-038]
unblocks: []
acceptance_criteria:
  - Auth actions are not complete merely because a projection updated.
  - authoritative_remaining_counter drives approaching_threshold at <= 20 percent remaining.
  - Health and Usage pages are observability and diagnostics, not primary provider/model/account config owners.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_pressure_config_drift
reasoning_tier: standard
context_scope: auth_pressure_config_ownership
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auth_lifecycle_provider_pressure_config_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`idle`"
  - "`pending`"
  - "`success`"
  - "`failure`"
  - "`disabled`"
  - "`post-success`"
  - "`authoritative_remaining_counter`"
  - "`approaching_threshold`"
  - "`<= 20% remaining`"
  - "`Agent-Config`"
negative_constraints:
  - "Weaker inferred pressure signals must not masquerade as authoritative counters."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-040 - Question Routing Approval UX And Runtime Display Defaults

```yaml
plan_unit_id: DP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Question routing uses parent-owned question-flow, subagent access stays
  default-denial, blocked and HITL approval surfaces show ordered
  allowed_action_ids and permission-level disclosure, and runtime-display
  consumers do not re-own runtime identity.
gui_related: true
gui_classification_reason: This unit defines question surfaces, approval cards, and runtime disclosure UI.
split_recommended: false
depends_on: [DP-036]
unblocks: []
acceptance_criteria:
  - Child ask channels cannot answer the user through a child-local path.
  - Approval cards do not mutate Persona permission profiles.
  - Runtime-display consumers show disclosure without runtime-identity re-ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_approval_runtime_display_drift
reasoning_tier: high
context_scope: question_approval_runtime_display
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: question_routing_approval_ux_runtime_display_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`/G/L`"
  - "`question-flow`"
  - "`default-denial`"
  - "`sendPrompt`"
  - "`permission-level`"
  - "`deny`, `once`, `for session`, `always`"
  - "`allowed_action_id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Subagent access stays default-denial and must not let a child answer through a child-local ask channel."
  - "Approval cards MUST NOT mutate Persona permission profiles."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-041 - Debug Context And Reopen Blocking

```yaml
plan_unit_id: DP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Browser-context auto-ingestion is visible, bounded, and revocable; debug
  blocked reopen states render canonical blocked-state UI and missing linked
  runtime identity reopens into attention_required with target_selection_required
  rather than silently minting a replacement target.
gui_related: true
gui_classification_reason: This unit governs visible Investigation Context chips, blocked UI, and target-selection recovery.
split_recommended: false
depends_on: [DP-038]
unblocks: []
acceptance_criteria:
  - Browser capture appears only as visible Investigation Context items or chips.
  - Debug investigation blocked reopen states do not auto-execute until prerequisites change.
  - Missing linked runtime identity becomes attention_required with target_selection_required unless deterministic rebinding exists.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_context_reopen_drift
reasoning_tier: high
context_scope: debug_context_reopen_blocking
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: debug_context_reopen_blocking
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`browser-context`"
  - "`Investigation Context`"
  - "`blocked`"
  - "`attention_required`"
  - "`target_selection_required`"
negative_constraints:
  - "Browser capture must never be silent chat capture or hidden messages."
  - "PM must not silently mint or infer a replacement target."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-042 - Provider Auth Surface And Storage Lock Owner Boundaries

```yaml
plan_unit_id: DP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy may decide fallback posture, but provider identity,
  auth_surface, and bridge capability facts stay subordinate to AuthState and
  bridge owners, while lock-path ambiguity resolves through the storage owner
  from canonical logical-root and storage fallback canon.
gui_related: false
gui_classification_reason: This unit defines provider/auth/storage owner boundaries.
split_recommended: false
depends_on: [DP-023, DP-030, DP-038]
unblocks: []
acceptance_criteria:
  - Provider-owned identity and auth-surface wording route to Contracts_V0 and CLI_Bridged_Providers.
  - lock-path is derived by storage ownership, not surface-local path guesses.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_auth_storage_owner_drift
reasoning_tier: high
context_scope: provider_auth_storage_owner_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_auth_surface_storage_lock_owner_boundaries
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`AuthState`"
  - "`provider_identity`"
  - "`auth_surface`"
  - "`Plans/CLI_Bridged_Providers.md`"
  - "`lock-path`"
  - "`logical-root`"
negative_constraints:
  - "Decision Policy must not redefine provider_identity, auth_surface, or bridge capability facts."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
```

### DP-043 - Runtime Scheduler Event Canonical Defaults

```yaml
plan_unit_id: DP-043
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime recovery defaults use scored event-driven scheduling, canonical
  Contracts_V0 event names and enum families over older aliases, defensive-only
  watchdog_recheck wakeups, and no critical-path scheduler term in MVP.
gui_related: false
gui_classification_reason: This unit defines runtime scheduler and event policy.
split_recommended: false
depends_on: [DP-035]
unblocks: []
acceptance_criteria:
  - scored event-driven scheduling remains the default runtime model.
  - watchdog_recheck may emit redundant wakeups defensively but is not the primary correctness path.
  - No critical-path scheduler term is introduced for MVP.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_scheduler_default_drift
reasoning_tier: high
context_scope: runtime_recovery_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_event_canonical_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`scored event-driven scheduling`"
  - "`watchdog_recheck`"
  - "`critical-path scheduler term`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md`"
negative_constraints:
  - "watchdog_recheck MUST NOT become the primary correctness path."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-044 - Retry And Remediation Ceiling Defaults

```yaml
plan_unit_id: DP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blind retry is forbidden, default retry ceiling remains 3 attempts, and
  default remediation ceiling remains 3 generations unless a higher-precedence
  contract narrows either ceiling.
gui_related: false
gui_classification_reason: This unit defines runtime retry/remediation policy.
split_recommended: false
depends_on: [DP-043]
unblocks: []
acceptance_criteria:
  - Blind retry is forbidden.
  - Retry and remediation ceilings remain 3 unless narrowed by higher-precedence contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retry_ceiling_drift
reasoning_tier: high
context_scope: runtime_retry_remediation
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: retry_remediation_ceiling_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`blind retry`"
  - "`3`"
  - "`default retry ceiling`"
  - "`default remediation ceiling`"
negative_constraints:
  - "blind retry is forbidden."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-045 - Blocked Outcome Preservation And Attempt Snapshots

```yaml
plan_unit_id: DP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blocked outcomes preserve completed local work by default when a prerequisite
  or remote side effect is unresolved, and prerequisite resolution creates a new
  attempt snapshot instead of mutating the old attempt in place.
gui_related: false
gui_classification_reason: This unit defines runtime attempt and preservation policy.
split_recommended: false
depends_on: [DP-044]
unblocks: []
acceptance_criteria:
  - Blocked outcomes preserve completed local work by default under unresolved prerequisite or remote side-effect stops.
  - Prerequisite resolution creates a new attempt snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_outcome_preservation_loss
reasoning_tier: high
context_scope: blocked_outcome_attempt_snapshot
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: blocked_outcome_preservation_attempt_snapshots
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`blocked outcomes`"
  - "`completed local work`"
  - "`new attempt snapshot`"
negative_constraints:
  - "Prerequisite resolution must not mutate an old attempt snapshot in place."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-046 - Graph Degradation And Integrity Defaults

```yaml
plan_unit_id: DP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Draft decomposition may degrade only before graph lock, and canonical graph
  integrity failures do not degrade silently.
gui_related: false
gui_classification_reason: This unit defines graph integrity and degradation policy.
split_recommended: false
depends_on: [DP-045]
unblocks: []
acceptance_criteria:
  - Draft decomposition degradation is allowed only before graph lock.
  - Canonical graph integrity failures do not degrade silently.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_integrity_silent_degradation
reasoning_tier: high
context_scope: graph_integrity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: graph_degradation_integrity_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`graph lock`"
  - "`canonical graph integrity failures`"
negative_constraints:
  - "Canonical graph integrity failures do not degrade silently."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-047 - Mutation-Sensitive Git Snapshot Failure Criticality

```yaml
plan_unit_id: DP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Mutation-sensitive git snapshot failures are CRITICAL: if git add or an
  equivalent snapshot step fails, undo metadata must not advance to a poisoned
  hash or silently point at a weeks-old state.
gui_related: false
gui_classification_reason: This unit defines source-control mutation safety policy.
split_recommended: false
depends_on: [DP-046]
unblocks: []
acceptance_criteria:
  - Failed git add or equivalent snapshot failure is treated as CRITICAL.
  - undo metadata does not advance to poisoned or stale hashes after a failed snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mutation_snapshot_poisoning
reasoning_tier: high
context_scope: git_snapshot_failure_criticality
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: mutation_sensitive_git_snapshot_failure_criticality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`git add`"
  - "`/undo`"
  - "`poisoned hash`"
  - "`weeks-old state`"
  - "`CRITICAL`"
negative_constraints:
  - "Mutation-sensitive git snapshot failures must not be swallowed."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-048 - Provider Response Guard Determinism

```yaml
plan_unit_id: DP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Provider adapters check choices.len before indexing, and an empty
  content-filtered response maps to FinishReasonContentFilter rather than panic
  or normal completion.
gui_related: false
gui_classification_reason: This unit defines provider adapter response handling.
split_recommended: false
depends_on: [DP-043]
unblocks: []
acceptance_criteria:
  - PROV adapters check choices.len before indexing.
  - Empty content-filtered responses map to FinishReasonContentFilter.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_response_guard_panic
reasoning_tier: high
context_scope: provider_response_guard
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: provider_response_guard_determinism
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`PROV`"
  - "`choices.len`"
  - "`FinishReasonContentFilter`"
negative_constraints:
  - "Empty content-filtered responses must not become a panic or normal completion."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-049 - Additional Blocked Reason Matrix Rows

```yaml
plan_unit_id: DP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The runtime recovery matrix includes blocked rows for validation_blocked,
  remediation_ceiling_exceeded, worktree_conflict, dirty_worktree, and
  plugin_hook_blocked with their manual resume, remediation, safe-point, and
  terminal/escalation behavior.
gui_related: false
gui_classification_reason: This unit defines blocked-reason matrix policy.
split_recommended: false
depends_on: [DP-043, DP-044]
unblocks: []
acceptance_criteria:
  - The five listed blocked_reason_code classifiers remain in the matrix.
  - Matrix rows preserve manual_resume_count, safe-point restore, remediation, and remain-blocked semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_matrix_row_loss
reasoning_tier: high
context_scope: runtime_recovery_matrix
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: additional_blocked_reason_matrix_rows
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0029
preserved_exact_tokens:
  - "`validation_blocked`"
  - "`remediation_ceiling_exceeded`"
  - "`worktree_conflict`"
  - "`dirty_worktree`"
  - "`plugin_hook_blocked`"
  - "`manual_resume_count`"
  - "`remain blocked`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-050 - Timeout Outcome Provider-Transient Normalization

```yaml
plan_unit_id: DP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  tool_outcome = timed_out first normalizes to failure_class =
  provider_transient, then follows the canonical provider-transient row.
gui_related: false
gui_classification_reason: This unit defines backend timeout normalization.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - timed_out outcomes normalize to provider_transient before row handling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: timeout_normalization_drift
reasoning_tier: high
context_scope: timeout_normalization
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: timeout_outcome_provider_transient_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0030
preserved_exact_tokens:
  - "`tool_outcome = timed_out`"
  - "`failure_class = provider_transient`"
  - "`ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
```

### DP-051 - Safe-Point Restore Field Override

```yaml
plan_unit_id: DP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  When a blocked payload sets requires_safe_point_restore = true, that field
  overrides the row-default rerun path.
gui_related: false
gui_classification_reason: This unit defines backend blocked payload override behavior.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - requires_safe_point_restore = true overrides row-default rerun behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_override_loss
reasoning_tier: standard
context_scope: safe_point_restore_override
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: safe_point_restore_field_override
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0031
preserved_exact_tokens:
  - "`requires_safe_point_restore = true`"
  - "`ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
```

### DP-052 - Worktree Blocked Posture Defaults

```yaml
plan_unit_id: DP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  worktree_conflict remains blocked until resolution, and dirty_worktree remains
  blocked until cleanup or restore action.
gui_related: false
gui_classification_reason: This unit defines backend blocked-state posture.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - worktree_conflict and dirty_worktree remain blocked until their listed resolution paths.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_blocked_posture_drift
reasoning_tier: standard
context_scope: source_control_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: worktree_blocked_posture_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`worktree_conflict`"
  - "`dirty_worktree`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-053 - Source Control Recovery CTA Effects

```yaml
plan_unit_id: DP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  worktree_conflict and dirty_worktree blocked states show the Source Control
  recovery CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control recovery CTA behavior.
split_recommended: false
depends_on: [DP-052]
unblocks: []
acceptance_criteria:
  - Source Control recovery CTA is shown for worktree_conflict and dirty_worktree blocked states.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_cta_loss
reasoning_tier: standard
context_scope: source_control_recovery_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: source_control_recovery_cta_effects
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show Source Control recovery CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-054 - GitHub Actions Auth-Expired Blocked Default

```yaml
plan_unit_id: DP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Unrecoverable failure_class = auth_expired for GitHub-hosted Actions admin/run
  actions remains blocked until auth refresh.
gui_related: false
gui_classification_reason: This unit defines GitHub Actions blocked-state policy.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - Unrecoverable GitHub-hosted Actions auth_expired admin/run actions remain blocked until auth refresh.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_actions_auth_block_drift
reasoning_tier: standard
context_scope: github_actions_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_auth_expired_blocked_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`failure_class = auth_expired`"
  - "`GitHub-hosted Actions admin/run actions`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
```

### DP-055 - GitHub Actions Recovery CTA Effect

```yaml
plan_unit_id: DP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The GitHub Actions auth refresh block shows the GitHub Actions recovery CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible GitHub Actions recovery CTA behavior.
split_recommended: false
depends_on: [DP-054]
unblocks: []
acceptance_criteria:
  - GitHub Actions recovery CTA is shown for unrecoverable auth_expired admin/run action blocks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_actions_cta_loss
reasoning_tier: standard
context_scope: github_actions_recovery_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_recovery_cta_effect
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show GitHub Actions recovery CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
```

### DP-056 - Docker And Kubernetes Blocked Posture Defaults

```yaml
plan_unit_id: DP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Docker external_side_effect_blocked waits for approval or explicit decline
  while preserving local build/publish result, and Kubernetes
  apply/exec/port-forward prerequisite blocks wait for context or prerequisite
  resolution.
gui_related: false
gui_classification_reason: This unit defines Docker and Kubernetes blocked posture.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - Docker repo create, push, and template push side-effect blocks preserve local build/publish result.
  - Kubernetes prerequisite blocks wait for context or prerequisite resolution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_kubernetes_blocked_posture_drift
reasoning_tier: standard
context_scope: docker_kubernetes_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_kubernetes_blocked_posture_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`external_side_effect_blocked`"
  - "`Docker repo create/push/template push`"
  - "`preserve local build/publish result`"
  - "`Kubernetes apply/exec/port-forward`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
```

### DP-057 - Docker Manager Kubernetes CTA Effect

```yaml
plan_unit_id: DP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Kubernetes apply, exec, and port-forward prerequisite blocks show the Docker
  Manager Kubernetes CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible Docker Manager Kubernetes CTA behavior.
split_recommended: false
depends_on: [DP-056]
unblocks: []
acceptance_criteria:
  - Docker Manager Kubernetes CTA is shown for Kubernetes prerequisite blocks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_kubernetes_cta_loss
reasoning_tier: standard
context_scope: docker_manager_kubernetes_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_manager_kubernetes_cta_effect
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show Docker Manager Kubernetes CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
```

### DP-058 - Target-Bound Approval Identity Fields

```yaml
plan_unit_id: DP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval and preflight blind-spot defaults are target-bound, not
  action-name-bound, and preserve SCM, GitHub Actions, Docker, and Kubernetes
  target identity fields before mutation.
gui_related: false
gui_classification_reason: This unit defines approval identity payload fields.
split_recommended: false
depends_on: [DP-036]
unblocks: []
acceptance_criteria:
  - Approval identity includes target fields for SCM, GitHub Actions, Docker, and Kubernetes domains.
  - Multi-repo projects do not bind approval by action name alone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: target_bound_approval_identity_drift
reasoning_tier: high
context_scope: target_bound_approval_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: target_bound_approval_identity_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`project_id`"
  - "`repo_id`"
  - "`workflow_id`"
  - "`runtime`"
  - "`registry_host`"
  - "`kube_context`"
negative_constraints:
  - "Approval/preflight blind-spot defaults are target-bound, not action-name-bound."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
```

### DP-059 - Approval Preflight Ordering And Revalidation

```yaml
plan_unit_id: DP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval ordering is static policy check, cheap capability or precondition
  preflight, approval request only while still actionable, then full
  execution-time revalidate immediately before mutation; stale-preflight
  evidence or target drift returns the action to blocked state.
gui_related: false
gui_classification_reason: This unit defines approval/preflight execution policy.
split_recommended: false
depends_on: [DP-058]
unblocks: []
acceptance_criteria:
  - The static policy, precondition, approval, and revalidate order is preserved.
  - preflight_revision drift or changed target identity invalidates approval and returns to blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_preflight_order_drift
reasoning_tier: high
context_scope: approval_preflight_revalidation
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: approval_preflight_ordering_revalidation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/precondition`"
  - "`/revalidate`"
  - "`preflight_revision`"
  - "`stale-preflight evidence`"
negative_constraints:
  - "Approval requests occur only while still actionable."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-060 - Domain-Sensitive Approval Scope Separation

```yaml
plan_unit_id: DP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Domain-bound approvals include attempted operation or action class, bind
  domain-sensitive resource targets, and keep policy-vs-approval-vs-preflight
  outcomes as distinct blocked families.
gui_related: false
gui_classification_reason: This unit defines approval scope semantics.
split_recommended: false
depends_on: [DP-058]
unblocks: []
acceptance_criteria:
  - SCM, GitHub Actions, Docker, and Kubernetes approvals bind operation/action class plus target scope.
  - policy-vs-approval-vs-preflight outcomes remain distinct blocked families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: domain_approval_scope_collapse
reasoning_tier: high
context_scope: domain_sensitive_approval_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: domain_sensitive_approval_scope_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/admin/domain-sensitive`"
  - "`/repositories`"
  - "`/worktrees/refs`"
  - "`/environment`"
  - "`policy-vs-approval-vs-preflight`"
negative_constraints:
  - "Domain-bound approvals include the attempted operation or action class, not only resource identity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-061 - Research-Safe Planning Tool Boundary

```yaml
plan_unit_id: DP-061
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Research-safe plan-mode tools and question-driven planning flows may be
  allowed for planning without granting mutation authority.
gui_related: false
gui_classification_reason: This unit defines planning tool permission boundaries.
split_recommended: false
depends_on: [DP-060]
unblocks: []
acceptance_criteria:
  - Research-safe planning tools do not grant mutation authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: research_safe_tool_boundary_drift
reasoning_tier: standard
context_scope: research_safe_planning_tools
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: research_safe_planning_tool_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/research-safe`"
  - "`todoread`"
  - "`todowrite`"
  - "`webfetch`"
  - "`webcrawl`"
  - "`webmap`"
negative_constraints:
  - "Planning tool allowance does not grant mutation authority."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-062 - Durable Approval Scope Reuse Context

```yaml
plan_unit_id: DP-062
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Durable approval scope and reuse are governed by approval_scope_key,
  actor/lane/run/account context, requested/effective permission disclosure, and
  permission-snapshot drift rules in Permissions_System and Contracts_V0.
gui_related: false
gui_classification_reason: This unit defines durable approval reuse policy.
split_recommended: false
depends_on: [DP-058, DP-059]
unblocks: []
acceptance_criteria:
  - approval_scope_key and actor/lane/run/account context govern durable approval reuse.
  - Permission disclosure and permission-snapshot drift rules are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: durable_approval_reuse_drift
reasoning_tier: high
context_scope: durable_approval_scope_reuse
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: durable_approval_scope_reuse_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`approval_scope_key`"
  - "`actor/lane/run/account context`"
  - "`requested/effective permission disclosure`"
  - "`permission-snapshot drift rules`"
  - "`ContractName:Plans/Permissions_System.md`"
  - "`ContractName:Plans/Contracts_V0.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
```

### DP-001 - Decision Policy Source-Preserving Bridge Retired

```yaml
plan_unit_id: DP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The former Decision Policy source-preserving bridge is retired in place after
  Phase 2B atomized or structurally dispositioned Decision_Policy-S0001 through
  Decision_Policy-S0036 into DP-002 through DP-062 or explicit structural
  coverage. DP-001 remains only as migration lineage for the retired bridge span
  and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DP-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by DP-002 through DP-062 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 046 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Decision_Policy.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0035
preserved_exact_tokens:
- DP-001
- source_preserving_planunit
- source_preserving_bridge_retired
- DP-002
- DP-062
- Decision_Policy-S0001
- Decision_Policy-S0036
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks
negative_constraints:
- "Do not remap atomized Decision_Policy spans back to DP-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to DP-001 remain auditable."
stale_retired_dispositions: []
owner_boundary_notes:
- "DP-002 through DP-062 and structural coverage_map dispositions own the Decision_Policy source coverage for S0001-S0036."
owner_hints:
- Plans/Decision_Policy.md
```
