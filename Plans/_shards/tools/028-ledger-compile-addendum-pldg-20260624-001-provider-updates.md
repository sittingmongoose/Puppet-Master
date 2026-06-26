# Shard 028: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Tools.md`

Source lines: L2319-L10782

Source SHA256: `8267963419c1d6b68ad9337379c2f27485848acfa7a831f04b24ac2e178d529b`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into tool capability and provider-native tool requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### T-164 - Provider Native Tool Mediation And Capability Scope

```yaml
plan_unit_id: T-164
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Provider-native tool calls and hosted/client tool capabilities must be mediated through PM tool policy and permission custody. Tool availability is caller-scoped and must include provider_entry_id, account_profile_ref, model_id, capability_id, caller_scope, execution_role, enabled_on_instance, usable_now, blocked_reason, permission_snapshot_id, redaction_profile, and verification_state. Cursor client tools such as `providerIdentifier: client` / `toolName: pm_echo` are evidence for route-specific capability handling, not permission bypasses.
gui_related: false
gui_classification_reason: Tool policy/capability mediation contract rather than visual presentation.
depends_on: [CV-294, PS-119]
unblocks: []
acceptance_criteria:
  - Provider-native tools pass through PM permission/capability policy before use.
  - Tool availability is caller-scoped and does not infer usable_now from provider enablement alone.
  - Provider tool evidence does not store secrets or provider-native hidden state.
  - Tool result records can link to runtime artifacts without re-owning artifact schema.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_tool_permission_bypass
reasoning_tier: high
context_scope: provider_native_tools
implementation_surfaces: [Plans/Tools.md, Plans/Permissions_System.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_native_tool_mediation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0117
  - pldg-20260624-001-provider-updates:atom-0120
source_atom_ids: [atom-0117, atom-0120, atom-0121, atom-0131]
preserved_exact_tokens: ["provider-native tools", "providerIdentifier: client", "toolName: pm_echo", "enabled_on_instance", "usable_now", "blocked_reason", "caller_scope", "execution_role", "permission_snapshot_id"]
negative_constraints:
  - Do not bypass PM permission custody for provider-native tools.
  - Do not infer `usable_now` from provider enablement alone.
  - Do not store provider secret material in tool records.
owner_hints: [Plans/Tools.md, Plans/Permissions_System.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md]
```

### T-003 - Tool GUI Settings And Usage Visibility

```yaml
plan_unit_id: T-003
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The GUI exposes tool support through Settings > Advanced > MCP Configuration, Settings > Permissions, required
  MVP presets, built-in plus MCP-discovered permission rows, and Usage-page tool metrics from seglog rollups.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: false
depends_on:
- T-002
unblocks: []
acceptance_criteria:
- Settings bind to the same central registry config used by runs.
- Presets Read-only, Plan mode, and Full are implemented but optional to apply.
- Usage shows tool name, invocation count, latency p50/p95, and error rate.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_owner_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: gui_contract_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0004
preserved_exact_tokens:
- Settings > Advanced > MCP Configuration
- Settings > Permissions
- Read-only
- Plan mode
- Full
- Usage page
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-004 - Permission Summary Consumes Permissions SSOT

```yaml
plan_unit_id: T-004
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools summarizes permission actions, precedence, and persistence for registry context only; canonical permission
  semantics remain in Plans/Permissions_System.md.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-002
unblocks:
- T-006
- T-007
acceptance_criteria:
- '`allow`, `ask`, and `deny` meanings stay aligned with Permissions_System.'
- Precedence order and TOML/redb paths remain summary references, not duplicate ownership.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_policy_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0007
preserved_exact_tokens:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
- allow
- deny
- ask
- Mode override > Session cache > Persona overrides > Project-level > Global-level > Defaults
- '`tool_permissions`'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-005 - Canonical Child Run Identity For Subagents

```yaml
plan_unit_id: T-005
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: A PM subagent is a child run with canonical identity fields and requested/effective Persona/runtime fields;
  provider-native subagent, child-session, or plain-run paths are adapter differences that do not change PM child-run canon.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-004
unblocks:
- T-015
acceptance_criteria:
- All child-run identity fields remain preserved.
- Disposable-by-default lifecycle is retained.
- Provider invocation kind stays additive adapter metadata.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_identity_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: child_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0008
preserved_exact_tokens:
- child_run_id
- parent_run_id
- thread_id
- batch_id?
- subgroup_id?
- attempt_id?
- requested/effective Persona
- effective provider invocation kind
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-006 - FileSafe And Embedded Review Guard

```yaml
plan_unit_id: T-006
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: FileSafe applies after tool permission and may still block an allowed tool invocation; embedded document review
  is not a hidden mutation channel.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-004
unblocks:
- T-007
acceptance_criteria:
- Permission answers whether the agent may call the tool; FileSafe answers whether the invocation may proceed.
- No direct `patch-apply` or `/suggested-change` mode is introduced for `embedded-document-pane` without a separate tool,
  permission, FileSafe, and audit contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hidden_mutation_channel
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: policy_guard_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0009
preserved_exact_tokens:
- FileSafe
- '`embedded-document-pane`'
- '`patch-apply`'
- '`/suggested-change`'
negative_constraints:
- Embedded document review is not a hidden tool mutation channel.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-007 - Central Policy Engine And Result Taxonomy

```yaml
plan_unit_id: T-007
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Every agent-usable tool attempt passes through one canonical policy engine for identity, permission, approval/HITL,
  FileSafe, validation, terminal or shell binding, execution or rejection, and normalized result persistence.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-004
- T-006
unblocks:
- T-008
acceptance_criteria:
- Canonical order 1-7 remains preserved.
- Shell-backed execution binds to canonical terminal-session state when execution occurs.
- Denied or blocked shell calls do not mint fake live terminal sessions.
- Result taxonomy includes all required values.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: policy_order_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_policy_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0010
preserved_exact_tokens:
- allowed_succeeded
- allowed_runtime_error
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- validation_blocked
- cancelled
- timed_out
- post_scan_failure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md'
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-008 - Tool Routing Audit Gap Carry-Through

```yaml
plan_unit_id: T-008
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool route activations are persistence-aware, audit records preserve unresolved exact_items gap lineage, blocked-packet
  consumers preserve runtime blocked terms, and recovery/validation/project-state consumers keep lineage explicit without
  reviving stale request shapes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Historical-run navigation may update stored `focused_run_id`; hover previews, comparisons, and pivots must not.
- gap-001, gap-002, gap-004, gap-005, gap-006, and broken-anchor lineage remain visible until owner docs close them.
- '`{ tool_name, invocation_summary, options }` is not revived as a canonical ask shape.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: audit_lineage_loss
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: audit_lineage_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- exact_items
- gap-001
- gap-002
- gap-004
- gap-005
- gap-006
- blocked_notice
- blocked-episode
- Last updated
- /freshness
- /recovery
- '`allowed_action_ids` / `allowed_action_ids[]`'
negative_constraints:
- Do not revive `{ tool_name, invocation_summary, options }` as canonical ask shape.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Unresolved gap and broken-anchor names remain visible until owner docs close them.
owner_hints:
- Plans/Tools.md
```

### T-009 - Tool Side-Effect Identity And Governance Authority

```yaml
plan_unit_id: T-009
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool export, side-effect, GitHub/Source Control, and runtime-governance records carry operational identity,
  trust, multi-context repo scope, account re-resolution, blocked-governance, pre-dispatch interception, and shared attention/status
  payloads.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Tool consumers do not assume one `/current` repo context.
- '`/tool`, `operational_identity`, and `trust_state_at_export` remain preserved.'
- Remote side-effect approval honors runtime governance before execution.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: side_effect_authority_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: side_effect_authority_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- multi-repo
- multi-context
- DAE
- /restart
- re-resolution
- blocked_owner
- /governance
- pre-dispatch
- info
- warning
- attention_required
- blocked
- system_notification
negative_constraints:
- GitHub and Source Control tool consumers must not assume one `/current` repo context.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-010 - Tool Widgets Scope And Node-Native Evidence

```yaml
plan_unit_id: T-010
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-facing widgets and command routing expose scope/identity mismatches, normalize command target variants
  through a shared target model, preserve blocked-sequence identity, and treat node-native evidence as authority while tier
  fields survive only as compatibility/grouping projections.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Page-global, app-global, project-scoped, and `/run-centric` scope remain distinct.
- Missing `IDs` are structural.
- '`tier-native` and `tier-aligned` never remain execution authority.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_runtime_scope_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: gui_runtime_consumer_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- cmd.*.open_*
- object_kind
- '`Executor_Protocol` / `Executor_Protocol.md`'
- '`/attempt/blocked-sequence`'
- '`node-native`'
- '`tier-native`'
- '`tier-aligned`'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Any `tier-native` or `tier-aligned` fields survive only as compatibility/grouping projections.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-011 - Cross-Plan Tool Permission Reference Map

```yaml
plan_unit_id: T-011
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools keeps a consumer reference map to Permissions_System, FileSafe, FileManager, assistant-chat-design,
  orchestrator-subagent-integration, and interview-subagent-integration for permission, FileSafe, workspace, approval, and
  run-config alignment.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: false
depends_on:
- T-004
- T-006
- T-007
unblocks: []
acceptance_criteria:
- Each plan relation is preserved without re-owning adjacent docs.
- Permissions_System remains canonical for GUI and persistence permission behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_reference_staleness
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: owner_reference_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0012
preserved_exact_tokens:
- Permissions_System.md
- FileSafe.md
- FileManager.md
- assistant-chat-design.md
- orchestrator-subagent-integration.md
- interview-subagent-integration.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-012 - Built-In Tool Registry Target Set

```yaml
plan_unit_id: T-012
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The central registry holds canonical built-in tool names, permission keys, limits, and provider-neutral semantics
  for shell, file, search, web, and question tools; provider/native mappings do not alter registry names or policy evaluation.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-002
- T-004
- T-007
unblocks:
- T-013
- T-016
acceptance_criteria:
- Each table tool and permission key remains preserved.
- OpenCode-compatible evidence is adapter context, not a PM owner override.
- Plan agents ask before `bash` by default unless policy grants it.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_registry_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_registry_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0014
preserved_exact_tokens:
- bash
- edit
- write
- read
- grep
- glob
- list
- patch
- multiedit
- webfetch
- websearch
- webextract
- webresearch
- webcrawl
- webmap
- question
- '`opencode` split-terminal behavior'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- The grep stale snapshot/fallback note remains product canon for registry behavior until a later owner pass moves or supersedes
  it.
owner_hints:
- Plans/Tools.md
```

### T-013 - Debug-Capable Tool Classification

```yaml
plan_unit_id: T-013
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`debug_capable` is metadata on a tool or capability and classifies cross-surface debug families without creating
  new tool IDs or bypassing permission, artifact, visibility, or stale-runtime safeguards.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Debug groups and usage tags remain preserved.
- Assistant Debug Mode is an entrypoint, not an ownership silo.
- Stale recoverable runtime identity enters `attention_required` with `session_reconnect_required`.
- No hidden evidence ingress or permission bypass is authorized.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_authorization_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_metadata_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0015
preserved_exact_tokens:
- debug_capable
- debug.target_discovery
- debug.browser_automation
- debug.logs_and_console
- debug.dap
- debug.agent_session_trace
- debug.bundle_export
- attention_required_reason_code = session_reconnect_required
negative_constraints:
- Classifying a tool as debug-capable does not authorize hidden evidence ingress or bypass the normal permission model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-014 - Edit Group And Ignore Pattern Semantics

```yaml
plan_unit_id: T-014
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`edit`, `write`, `patch`, and `multiedit` share the single `edit` permission, while grep/glob/list respect
  `.gitignore` by default with project `.ignore` explicit allow support.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- File mutation controls remain one permission knob.
- Ignore behavior preserves `.gitignore`, `.ignore`, and `!node_modules/` examples.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_fragmentation
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_permission_grouping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0016
preserved_exact_tokens:
- edit
- write
- patch
- multiedit
- .gitignore
- .ignore
- '!node_modules/'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-015 - Provider Platform Mapping Uses Canonical Names

```yaml
plan_unit_id: T-015
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Providers map PM canonical tool names to platform-native equivalents in platform_specs or runner code, while
  the registry and permission engine use canonical names only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Adding a provider does not require changing permission config.
- The `edit` to Claude "Edit" / Cursor edit tool example remains adapter context.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_mapping_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_mapping_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0017
preserved_exact_tokens:
- canonical names only
- platform_specs
- '`edit` -> Claude "Edit"'
- Cursor edit tool
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-016 - LSP MVP Tool Operations And Compatibility Aliases

```yaml
plan_unit_id: T-016
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The `lsp` tool is MVP with nine read-only operations plus one approval-gated `rename`; `lsp_rename`, `definition`,
  `references`, and `implementation` are compatibility/source aliases normalized to canonical operations and parameter shapes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Operation inventory and parameter requirements remain preserved.
- '`rename` / `lsp_rename` requires `path` + `position` + `newName` and approval gating.'
- '`workspaceSymbol` requires `query`.'
- Status values remain `ok | partial | unavailable | error`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_alias_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0019
preserved_exact_tokens:
- 10 read-only + 1 write-gated (lsp_rename)
- nine read-only operations plus one approval-gated `rename`
- '`lsp_rename`'
- '`lsp.rename`'
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`lsp_rename` is a legacy/source alias, not a second tool key.'
- '`definition`, `references`, and `implementation` are compatibility aliases.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-017 - Shared Built-In Tool Contract Envelope

```yaml
plan_unit_id: T-017
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Core tool-contract adapters default to sync semantics unless async handles are explicit, blocked/unavailable
  results include structured recovery action, previews use mini-card families, and concrete I/O/limit/error, unknown-tool,
  GUI permission/preset, and usage token linkage remains discoverable.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
- T-012
unblocks: []
acceptance_criteria:
- Sync default and explicit async-handle rule remain preserved.
- Blocked permission, FileSafe, or service cases include structured recovery action.
- Non-terminal previews expose source/result mini-cards and diff cards without treating preview as final mutation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_preview_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shared_tool_contract_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0020
preserved_exact_tokens:
- '`/tool-contract`'
- '`/service`'
- '`/diffs`'
- '`/presets`'
- '`/token`'
- '`/tokens`'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-018 - Bash Tool Runtime Contract

```yaml
plan_unit_id: T-018
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`bash` accepts command execution parameters, returns shell-bound sync/async results, emits structured errors,
  and applies default wait and hard timeout behavior without fabricating terminal state.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- Parameters `command`, `mode`, `initial_wait`, `shellId`, and `detach` remain preserved.
- Output shapes for completed sync, still-running sync, and async launch remain preserved.
- All error codes and timeout behavior remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_binding_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0021
preserved_exact_tokens:
- sync
- async
- initial_wait
- shellId
- detach
- 30s
- 30m
- validation_error
- permission_denied
- filesafe_blocked
- shell_not_found
- spawn_failed
- output_limit_exceeded
- timeout
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-019 - Edit Tool Runtime Contract

```yaml
plan_unit_id: T-019
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`edit` performs atomic exact-string replacement inside allowed workspace roots, reports affected line spans
  and byte/line changes, and fails atomically for validation, permission, FileSafe, path, replacement, encoding, or timeout
  errors.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-014
- T-017
unblocks: []
acceptance_criteria:
- Parameters `path`, `old_str`, and `new_str` remain preserved.
- '`old_str` must be found exactly once.'
- Timeout returns `timed_out` without partial file rewrite.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: atomic_edit_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0022
preserved_exact_tokens:
- old_str
- new_str
- replace_miss
- replace_conflict
- encoding_error
- 10s
- line_count_changed
- bytes_changed
negative_constraints:
- On timeout, edit must fail atomically with no partial file rewrite.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-020 - Read View Tool Runtime Contract

```yaml
plan_unit_id: T-020
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-native `view` maps to canonical `read`; it reads files or directories with optional inclusive 1-based
  ranges, preserves numbered text and structured line arrays, and returns structured errors/timeouts without fabricating missing
  lines.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-017
unblocks: []
acceptance_criteria:
- The `view` to `read` canonical mapping remains preserved.
- '`view_range` semantics, including `-1` to end of file, remain preserved.'
- File and directory result shapes stay distinct.
- Timeout does not fabricate missing lines.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: read_rendering_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0023
preserved_exact_tokens:
- '`view`'
- '`read`'
- '`view_range`'
- '`-1`'
- '`binary_unsupported`'
- '`too_large`'
- do not fabricate missing lines
negative_constraints:
- On timeout, do not fabricate missing lines.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-021 - Grep Tool Runtime Contract

```yaml
plan_unit_id: T-021
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`grep` accepts pattern, path, glob, output-mode, and flags inputs; returns one of the locked match result
  shapes; preserves all error codes; and times out with a structured `timed_out` response where `partial: true` is allowed
  only when verified.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`content`, `files_with_matches`, and `count` output modes remain preserved.'
- The default timeout remains `30s`.
- All grep error codes remain preserved, including backend and result-limit failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: search_result_shape_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0024
preserved_exact_tokens:
- pattern
- glob
- output_mode
- line_numbers
- head_limit
- 'partial: true'
- content
- files_with_matches
- count
- 30s
- backend_unavailable
- result_limit_exceeded
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-022 - Glob Tool Runtime Contract

```yaml
plan_unit_id: T-022
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`glob` accepts a pattern and optional root path, returns deterministic normalized paths after ignore-rule
  filtering, and preserves validation, policy, FileSafe, path, and timeout errors.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`paths: string[]` remains the successful result shape.'
- Returned paths remain normalized and deterministic after ignore-rule filtering.
- The recommended default timeout remains `10s`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_enumeration_nondeterminism
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0025
preserved_exact_tokens:
- '**/*.md'
- ignore-rule filtering
- 'paths: string[]'
- 10s
- validation_error
- permission_denied
- filesafe_blocked
- path_not_found
- timeout
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-023 - Create Write Tool Runtime Contract

```yaml
plan_unit_id: T-023
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-native `create` maps to canonical `write`; it writes full file text under write-scope policy, reports
  created/overwritten state and byte/line counts, and fails atomically on timeout or write rejection.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-006
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`path`, `file_text`, `created: boolean`, `bytes_written`, and `line_count` remain preserved.'
- Timeout and rejected writes fail atomically.
- Overwrite policy remains explicit through `created` and `already_exists`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: write_atomicity_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0026
preserved_exact_tokens:
- create
- write
- path
- file_text
- 'created: boolean'
- bytes_written
- line_count
- parent_missing
- already_exists
- io_error
- '{ status: "timed_out", path, error: { code: "timeout" } }'
negative_constraints:
- On timeout, the write must fail atomically.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-024 - Skill Runtime Registry Boundary

```yaml
plan_unit_id: T-024
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools exposes only `skill-runtime` metadata as a consumer pointer to Plans/Skills_System.md; richer runtime
  refs resolve through the shared tool-contract boundary rather than ad hoc skill-local schemas.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-006
- T-017
unblocks: []
acceptance_criteria:
- The structured skill envelope remains preserved.
- FileSafe-constrained resource access remains under the shared tool-contract boundary.
- Tools does not duplicate Skills_System ownership of richer skill runtime behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_skill_schema_ownership
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: skill_runtime_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0027
preserved_exact_tokens:
- skill-runtime
- Plans/Skills_System.md
- skill_id
- arguments?
- context?
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- ready_with_warnings
- Agent Config
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
- Plans/Skills_System.md
```

### T-025 - Question Tool Envelope And Compatibility Normalization

```yaml
plan_unit_id: T-025
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The question tool uses the locked multi-question envelope, canonical `QuestionItem` names and enums, object-array
  options, answer source metadata, and normalized answer arrays; legacy single-question and string-answer shorthands are compatibility-only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-017
unblocks:
- T-026
- T-027
acceptance_criteria:
- '`mode?: "single_question" | "questionnaire"` remains preserved.'
- '`questions: Array<QuestionItem>` and `options?: Array<{id, label, description?}>` remain the canonical shapes.'
- 'Output statuses and `source?: "option" | "other" | "freeform"` remain preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_question_shape_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: question_tool_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0028
preserved_exact_tokens:
- 'mode?: "single_question" | "questionnaire"'
- 'questions: Array<QuestionItem>'
- 'options?: Array<{id, label, description?}>'
- 'source?: "option" | "other" | "freeform"'
- QuestionItem
- answer_text?
negative_constraints:
- '`prompt` is envelope/header-only compatibility text; it is not the per-question field name.'
preserved_contractrefs: []
compatibility_only_notes:
- '`string[]` options, `allow_other`, `allow_multi_select`, `text: string`, `answer: string`, `questions: [...]`, and `mode|header|prompt|questions[]`
  are compatibility shorthands normalized before storage or rendering.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
- Plans/storage-plan.md
```

### T-026 - Question Card Flow And Headless Outcome

```yaml
plan_unit_id: T-026
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Question-card behavior stays aligned across Assistant, Interviewer, document-builder, and visual-module flows;
  required items block completion until answered, dismiss pauses, `Other` remains freeform, headless returns unavailable,
  and subagent access is denied by default.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-025
unblocks: []
acceptance_criteria:
- Required-by-default items keep the flow incomplete until answered.
- Dismiss-to-pause returns an explicit dismissed or paused status.
- Headless/HITL-unavailable returns unavailable with reason `headless` and no GUI-only recovery action.
- Subagent question tool access remains denied by default.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_headless_question_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: question_card_flow_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0028
preserved_exact_tokens:
- Other
- freeform
- default_values
- draft_value
- headless_unavailable
- 'status: "unavailable", reason: "headless"'
- Subagent question tool access is DENIED by default
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-027 - TODO Tool Schema Persistence And Access Policy

```yaml
plan_unit_id: T-027
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`todowrite` and `todoread` use the normalized TODO schema for Plan and Deep Plan, persist explicit revision
  states, emit `chat.plan_todo_updated`, and must not be blanket-denied in ask/plan mode unless stricter presets apply.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
- T-017
- T-025
unblocks:
- T-028
acceptance_criteria:
- TODO schema fields, statuses, and revision states remain preserved.
- Auto-use behavior and ask-mode approval prompts remain explicit.
- Deep Plan edits resync the normalized TODO projection before execution begins.
- '`todoread` remains non-mutating and must not survive as a `source_surface` mutation source.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: todo_state_duplication
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: todo_tool_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0029
preserved_exact_tokens:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending
- in_progress
- completed
- blocked
- skipped
- superseded
- draft
- approved
- executing
- chat.plan_todo_updated
- todowrite
- todoread
negative_constraints:
- Ask/Plan presets must not carry inherited blanket-denies or a blanket-deny rule for `question`, `todowrite`, `todoread`,
  or the six web operation tools.
- '`todoread` must not survive as a `source_surface` mutation source.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3
  Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-028 - TODO Execution Tracker UI Boundary

```yaml
plan_unit_id: T-028
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: TODO remains the SSOT across single-agent, crew, and subagent runs; sticky-card and execution-tracker own
  the full TODO UI while inline-progress chat messages remain compact links, not a second TODO state model.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-027
unblocks: []
acceptance_criteria:
- The full TODO list, status badges, focused item behavior, delegated owner display, and post-approval edit restrictions remain
  preserved.
- '`/revise` creates an explicit draft/revision instead of mutating approved history invisibly.'
- Inline-progress chat messages stay compact and link back to the sticky panel.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: todo_ui_competing_state
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: todo_ui_state_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0029
preserved_exact_tokens:
- sticky-panel-vs-inline-progress
- sticky-card / execution-tracker
- inline-progress
- /revise
- full TODO list
- status badges
- delegated owner display
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3
  Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-029 - Web Operation Ownership Dispatch And Adapter Routing

```yaml
plan_unit_id: T-029
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The web operation family is PM-owned above providers, dispatches each invocation to one canonical operation,
  validates before adapter routing, and rejects malformed or unsupported inputs with `invalid_input`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
- T-017
unblocks:
- T-030
- T-031
- T-032
- T-034
- T-038
acceptance_criteria:
- Operations `search`, `extract`, `research`, `crawl`, `map`, and `fetch`/`read` remain preserved.
- Support tiers remain routing metadata, not provider ownership replacement.
- Malformed or unsupported inputs return `invalid_input` or `unsupported_operation` before adapter dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_ownership_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_operation_dispatch_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- search
- extract
- research
- crawl
- map
- fetch
- read
- native
- PM-composed
- unavailable
- unsupported_operation
- invalid_input
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-030 - Web Permission And Support-Tier Visibility

```yaml
plan_unit_id: T-030
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web permission and GUI/help consumers expose support tier, provider availability, URL/domain/query/task visibility,
  and wildcard versus host-scoped approvals instead of hiding fan-out behind generic `webfetch`.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-007
- T-029
unblocks: []
acceptance_criteria:
- '`websearch` and `webresearch` use wildcard operation approvals because URLs are not known before discovery.'
- '`/extract/crawl/map` and `webfetch` use host/site-scoped approvals when targets are known.'
- GUI/help surfaces expose operation support tiers and activity labels.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_permission_opacity
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_permission_support_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- /web
- /help/autocomplete
- Settings
- Searching Web
- Reading Site
- Extracting Site
- Researching Web
- Crawling Site
- Mapping Site
- wildcard-only operation approvals
- host/site-scoped approvals
negative_constraints:
- Provider-doc `/classes`, provider-internal grouping, and provider row layout are not locked PM canon.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-031 - Web Input Shapes And Compatibility Aliases

```yaml
plan_unit_id: T-031
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Canonical web input shapes remain stable across adapters for `websearch`, `webfetch`, `webextract`, `webresearch`,
  `webcrawl`, and `webmap`, while source shorthand and legacy formats normalize before dispatch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
unblocks:
- T-032
- T-035
- T-037
- T-041
acceptance_criteria:
- All listed operation parameters, defaults, source/category behavior, and unsupported-operation behavior remain preserved.
- Source shorthand and legacy formats normalize into typed fields before dispatch.
- Provider/API-side hints remain advisory unless a future provider contract reintroduces explicit mapping.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: adapter_shorthand_schema_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_input_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- limit?
- /news/images/code/academic
- /research/pdf
- /auto/ocr
- /API-side
- /html/rawHtml/screenshot/pdf/summary/links/images
- /PDF/summary
- 'formats?: string[]'
- /docs/*
- /api/**
- '!/internal/*'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`limit?`, source/category slash shorthand, `/auto/ocr`, `/API-side`, provider slash shorthand formats, `/PDF/summary`,
  and `formats?: string[]` are compatibility aliases normalized before dispatch.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-032 - Web Research Execution Recipes

```yaml
plan_unit_id: T-032
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webresearch` supports bounded autonomous and deterministic PM-composed recipes with optional seed URLs,
  capped search/read cycles, citations, and no page interaction in the non-autonomous branch.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
- T-031
unblocks:
- T-033
acceptance_criteria:
- '`starting_urls?: string[]` remains capped at five URLs.'
- Autonomous research remains bounded to at most three search iterations and a 120s total runtime unless narrower limits apply.
- The deterministic non-autonomous branch searches, reads/extracts, and synthesizes without page interaction.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unbounded_autonomous_browsing
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_research_runtime_recipe
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- 'starting_urls?: string[]'
- 'autonomous: true'
- max_sources
- 120s
- auto_read_cap
- Firecrawl `/v2/agent`
- Tavily
- 'Searching Web: <refined query>'
- 'Reading Site: <url>'
negative_constraints:
- 'When `autonomous: false` or omitted on `webresearch`, the agent does NOT navigate or interact with pages.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-033 - Agent Web Activity And Audit Evidence Surface

```yaml
plan_unit_id: T-033
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Agent-web-research is shared by Assistant, Interview, Orchestrator, requirements-doc-builder, and doc-builder
  surfaces; activity cards and audit trails expose search plus `/fetch/read` steps and browser-interaction sub-annotations
  when needed.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-030
- T-032
unblocks: []
acceptance_criteria:
- Activity labels and audit-trail visibility remain preserved.
- '`Reading Site: <url> (with browser interaction)` remains explicit when browser interaction is involved.'
- Web operation child payload refs remain visible through `tool.invoked` and `tool.denied`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_evidence_hidden
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_activity_audit_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- /brittle
- /fetch/read
- tool.invoked
- tool.denied
- payload.meta
- warnings_count
- error_code
- 'Reading Site: <url> (with browser interaction)'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Research-session action subset remains bounded to web-operation evidence access, not a full visible browser-session product
  surface.
owner_hints:
- Plans/Tools.md
```

### T-034 - WebAction Browser Action And Safety Contract

```yaml
plan_unit_id: T-034
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: WebAction and browser testing use named action IDs, exact aliases, sequential execution, timing caps, explicit
  safety layers, and degraded-capability reason codes rather than arbitrary browser-code execution.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-029
- T-030
unblocks: []
acceptance_criteria:
- Action enum, aliases, everyday/advanced IDs, 5000ms default, 30000ms max, and 30s total cap remain preserved.
- Action execution remains sequential in array order.
- Degraded or blocked browser capabilities return explicit reason codes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_automation_overreach
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: browser_action_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- press key
- press_key
- select option
- select_option
- fill form
- fill_form
- file upload
- upload_file
- dialog handle
- handle_dialog
- session_granted
- /safety
- platform_unsupported
- runtime_unavailable
- permission_not_granted
- 5000ms
- 30000ms
- 30s
negative_constraints:
- WebAction/browser testing uses named action IDs rather than arbitrary browser-code execution.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-035 - Web Extraction Schema Validation Contract

```yaml
plan_unit_id: T-035
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Schema-backed `webextract` and `webresearch` use JSON Schema draft-07, strict/lenient validation modes, explicit
  empty/invalid/too-large errors, and prompt+schema two-phase behavior without silently rewriting prompts.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-031
unblocks: []
acceptance_criteria:
- '`schema_mode?: "strict" | "lenient"` remains preserved with default `"lenient"`.'
- 'Strict and lenient output behavior remains preserved, including `_schema_violation: true`.'
- Schema size and schema validation errors remain explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: schema_prompt_mutation
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_extraction_schema_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- 'schema_mode?: "strict" | "lenient"'
- '"lenient"'
- '_schema_violation: true'
- extraction_schema_mismatch
- extraction_empty
- schema_too_large
- schema_invalid
- 50KB
- JSON Schema draft-07
negative_constraints:
- Schema validation must not silently rewrite the LLM prompt.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-036 - Web Formats Firecrawl Mapping And Retired Claims

```yaml
plan_unit_id: T-036
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web format semantics preserve browser artifact behavior, adapter-internal Firecrawl mappings, and retired/unconfirmed
  claims without making them PM canon.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-031
- T-034
- T-035
unblocks: []
acceptance_criteria:
- Screenshot/PDF runtime warnings and browser-runtime requirements remain preserved.
- '`html` versus `rawHtml` semantics remain preserved.'
- '`detail_hint -> scrapeOptions depth` remains removed as unconfirmed.'
- The Firecrawl PDF `LlamaParse` claim remains retired as unconfirmed.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: adapter_internal_overlock
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_format_adapter_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- capability_unavailable
- 'formats: ["pdf"]'
- '"rawHtml"'
- scripts/nav/ads
- 'onlyMainContent: true'
- detail_hint → scrapeOptions depth
- LlamaParse
- export_pdf
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`export_pdf` is retired for research access; trace/video are excluded from `research_session`; Firecrawl PDF `LlamaParse`
  is retired as unconfirmed.'
stale_retired_dispositions:
- Firecrawl PDF processing does not make `LlamaParse` PM canon.
owner_hints:
- Plans/Tools.md
```

### T-037 - Web Crawl Map Scope Change Tracking And Dedup

```yaml
plan_unit_id: T-037
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webcrawl` and `webmap` preserve scope filters, effective depth reporting, content-hash dedup, robots/change-tracking
  inputs, per-page change status, and structured warnings for narrowed provider behavior.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-031
unblocks: []
acceptance_criteria:
- Scope filters, effective depth, and per-page change status remain preserved.
- Content-hash dedup and `dedup_skipped` behavior remain preserved.
- Provider narrowing returns structured warnings rather than silent drift.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: crawl_scope_ambiguity
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_crawl_map_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- depth_limit?
- include_paths
- exclude_paths
- dedup
- respect_robots
- change_status
- change_summary
- new|same|changed|removed
- /docs/*
- /api/**
- '!/internal/*'
- /exclude_paths
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-038 - Web Result Envelope Cache And Audit Payload

```yaml
plan_unit_id: T-038
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web outputs share locked execution-path, cache, common envelope, operation-specific result fields, citation
  provenance, semantic audit values, default limits, and child payload refs.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
- T-031
unblocks: []
acceptance_criteria:
- TTL defaults, `cache_state`, and `execution_path` remain preserved.
- The common result envelope and operation-specific extensions remain preserved.
- Semantic audit `read` maps to the canonical `webfetch` tool.
- '`web_input` remains the canonical structured routing/audit input.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_audit_cache_extras_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_result_cache_audit_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- provider_search_native
- pm_search_plus_site_reader
- provider_extract_native
- pm_extract_composed
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- 'provenance_badge?: string'
- cache_state
- web_input
- web_input_preview
- denial_reason_code
negative_constraints:
- '`web_input_preview` must not replace structured `web_input`.'
preserved_contractrefs: []
compatibility_only_notes:
- Legacy child payload `blocked_reason_code?` aliases normalize to `denial_reason_code`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-039 - Site Reader Structured Runtime And PageRepresentation

```yaml
plan_unit_id: T-039
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Site Reader is the native structured browser-reading runtime behind `webfetch` and `Reading Site`; it builds
  typed `PageRepresentation`, handles iframes, returns rendered representations after navigation, and owns page/session state.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-029
- T-031
unblocks:
- T-040
- T-041
acceptance_criteria:
- The representation preserves accessibility tree, layout bounds, landmarks, headings, interactive elements, forms, and optional
  iframes.
- Iframe discovery remains bounded to 3 levels with warning behavior for blocked content.
- Navigation returns a rendered page representation with default detail level `minimal`.
- Page/session state remains owned by the Site Reader runtime.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: untyped_page_dump_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: structured_site_reader_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0031
preserved_exact_tokens:
- Site Reader
- PageRepresentation
- accessibility tree
- layout bounds
- landmarks
- headings
- interactive elements
- forms
- iframe
- 3 levels deep
- CDP sessions
- minimal
- PageManager
negative_constraints:
- Site Reader is not a browser-display feature, thin search helper, full built-in browser, click-to-context, DevTools-linked
  capture, or visible browser-session product surface.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-040 - Site Reader Product Boundary And Vocabulary

```yaml
plan_unit_id: T-040
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Site Reader remains the default structured-reader engine; `/raw` is fallback, read/observe stays separate
  from act/interact, and PM product vocabulary excludes non-PM implementation/source names.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-039
unblocks: []
acceptance_criteria:
- Token-efficient summaries, stable element identity, and frame-level/per-frame CDP handling remain preserved.
- Canonical PM vocabulary remains preserved.
- Legacy Skills page labels normalize to Agent Config > Skills.
- External editor architecture remains non-normative inspiration.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: external_vocabulary_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: site_reader_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0031
preserved_exact_tokens:
- Site Reader
- Searching Web
- Reading Site
- visual module
- visual card
- Skill Store
- /text/markdown
- /observe
- /interact
- /interaction
- /raw
- Agent Config > Skills
- skill-management
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy `Skills page` labels normalize to `Agent Config > Skills`; external `skill-management` labels do not replace PM vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-041 - Webfetch URL Cache And Change Tracking Contract

```yaml
plan_unit_id: T-041
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webfetch` rejects non-HTTP(S) and malformed URLs, normalizes routing, defaults bare domains to `https://`,
  enforces max content length, defaults cache policy, and reports hash-based change tracking.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-029
- T-031
- T-039
unblocks:
- T-042
acceptance_criteria:
- Non-HTTP(S) schemes and malformed URLs return `invalid_input`.
- Bare domains default to `https://`.
- The default max content length remains 5 MB.
- 'Cache policy defaults to `{ max_age_seconds: 14400, store: true }`.'
- Hash-based change tracking status values remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsafe_scheme_or_cache_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: webfetch_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0032
preserved_exact_tokens:
- file://
- ftp://
- 'javascript:'
- invalid_input
- https://
- max_content_length
- 5 MB
- '{ max_age_seconds: 14400, store: true }'
- new|same|changed|removed
- change_tracking
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-042 - Webfetch Binary Attachment And Output Contract

```yaml
plan_unit_id: T-042
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webfetch` detects binary non-text responses by `Content-Type`, returns supported image types as capped inline
  attachments, returns unsupported large media as metadata only, and keeps non-text responses out of HTML-to-Markdown conversion.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-041
unblocks: []
acceptance_criteria:
- Supported image MIME types and source shorthands remain preserved.
- Unsupported or large binary media returns metadata only without downloading the body.
- Non-text responses do not enter HTML-to-Markdown conversion.
- Markdown remains the default content view for text fetches.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsafe_media_download_or_rendering_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: webfetch_binary_output_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0032
preserved_exact_tokens:
- image/png
- image/jpeg
- image/gif
- image/webp
- image/svg+xml
- /png
- /jpeg
- /gif
- /webp
- /svg
- /non-text
- /large
- MIME type
- content-length
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-043 - LSP Expanded Tool Operations And Boundaries

```yaml
plan_unit_id: T-043
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`lsp` widens beyond the minimal MVP read trio with additional read operations, retains `rename` as write-like
  with explicit approval before apply, complements context bundling, and does not require provider-native skill installation
  for MVP.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-016
- T-017
unblocks: []
acceptance_criteria:
- All listed LSP read operations remain preserved.
- '`rename` remains write-like and requires explicit approval before apply.'
- The LSP tool complements but does not replace context compiler bundling.
- MVP operation does not require provider-native skill installation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_context_compiler_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: lsp_runtime_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0033
preserved_exact_tokens:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename
- context compiler
- provider-native skill installation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-044 - Chatsearch Project Index Contract

```yaml
plan_unit_id: T-044
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`chatsearch` is project-scoped with `query: string`, optional `filters: { thread_id?, time_range? }`, optional
  `k?: number`, hit shape `{ thread_id, message_id, ts, role, snippet, score }`, project Tantivy scope, strict secret scrubbing,
  and Context Lens muted-message exclusion or annotation.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Input and output schema are preserved.
- Per-project Tantivy scope is enforced.
- Muted `message_ids` do not enter agent context.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: chatsearch_project_index_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- chatsearch
- 'query: string'
- 'filters: { thread_id?, time_range? }'
- 'k?: number'
- '{ thread_id, message_id, ts, role, snippet, score }'
- Tantivy
- PolicyRule:no_secrets_in_storage
- INV-002
- message_ids
- Context Lens
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, Invariant:INV-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-045 - Codesearch Multi-Lane Boundary

```yaml
plan_unit_id: T-045
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`codesearch` uses Tantivy primary, LSP symbol secondary, and `grep` fallback while remaining distinct from
  direct `lsp` operations and raw regex `grep`.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-016
- T-021
- T-043
unblocks: []
acceptance_criteria:
- Backend ordering, output shape, ignore handling, environment-file exclusion, and secret-scrubbed snippets are preserved.
- '`codesearch` remains distinct from direct `lsp` and raw regex `grep`.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: codesearch_multilane_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- codesearch
- Tantivy
- workspace/symbol
- documentSymbol
- grep fallback
- /keyword
- /phrase/symbol
- '{ path, line_or_range, snippet, kind? }'
- .gitignore
- .env
- .env.*
- .env.example
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-046 - Grep Ownership Compatibility Scope And Correctness

```yaml
plan_unit_id: T-046
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools owns `grep` fallback, `/sparse-n-gram`, degradation, filtering, freshness, and event-field semantics
  while external callers keep `{ pattern, path?, glob? }`, the 1000 result limit, the 30s timeout, read-only posture, and
  final ripgrep verification.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-021
unblocks:
- T-047
- T-048
- T-049
- T-050
- T-051
- T-052
acceptance_criteria:
- No new user-facing or agent-facing tool name is introduced.
- Sparse index candidate narrowing never changes final correctness.
- Project indexes are not merged across projects.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_sparse_owner_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- grep
- /sparse-n-gram
- tool.invoked.index_used
- '{ pattern, path?, glob? }'
- 'matches: Array<{ path, line_number, line }>'
- '1000'
- 30s
- MUST NOT change final correctness
- ripgrep
- no cross-project index merging
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-047 - Grep Sparse N-Gram Extraction And Frequency Table

```yaml
plan_unit_id: T-047
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep index build extracts all sparse n-grams through `build_all`; query time extracts a `minimal-covering`
  set; boundary weighting uses the shipped 256x256 `u16` table and `effective[a][b] = α × base[a][b] + (1-α) × project[a][b]`;
  extraction stays byte-level.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
unblocks: []
acceptance_criteria:
- Fixed-width 3-gram fallback remains available when boundary weighting cannot place sparse boundaries.
- CRLF stripping and ASCII-only lowercase normalization are preserved.
- Non-ASCII bytes pass through unchanged.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_sparse_ngram_algorithm_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- build_all
- minimal-covering
- 256x256
- u16
- The Stack Smol
- effective[a][b] = α × base[a][b] + (1-α) × project[a][b]
- frequency_table.bin
- fixed-width 3-gram
- raw bytes
- u8::to_ascii_lowercase()
- "CRLF `\r`"
- hash("fo")
- hash("Fo")
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-048 - Grep Query Planning Alternation And Skip Rules

```yaml
plan_unit_id: T-048
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Regex HIR/literal extraction feeds xxh3 lookup, Roaring postings, branch intersection/union, file-map resolution,
  path/glob filtering, dirty paths, and ripgrep verification.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-047
unblocks: []
acceptance_criteria:
- Alternation uses union-of-intersections, not pure intersection.
- Index is skipped for no-literal queries, non-ASCII case-insensitive literals, and covering sets above 64 n-grams.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_query_planner_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- regex-syntax
- regex_syntax
- HIR
- regex_syntax::literal
- regex_syntax::literal::Seq
- xxh3
- lookup.bin
- Roaring Bitmap
- file_map.bin
- git cat-file --batch
- foo|bar
- .*
- '[a-z]+'
- \d{3}
- '>64 n-grams'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-049 - Grep Freshness Dirty Layer And Watcher Recovery

```yaml
plan_unit_id: T-049
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM-mediated writes update the dirty layer synchronously; watcher overflow marks indexed files dirty and re-anchors;
  stale snapshots remain queryable while refresh or re-anchor work runs.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
- T-047
unblocks: []
acceptance_criteria:
- Deleted dirty paths suppress stale base-index hits.
- Raw fallback remains reserved for missing, corrupted/building, disabled, or query-skip paths.
- Per-file verification races do not fail the whole query.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_freshness_recovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- dirty layer
- generation-aware path records
- IN_Q_OVERFLOW
- FSEvents "must scan"
- Windows RDCW
- 64 KB
- no stale-threshold cutoff
- no commit-count-based fallback threshold
- /corrupted/building
- ENOENT
- skip-and-continue
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-050 - Grep Filtering And Path Safety

```yaml
plan_unit_id: T-050
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep indexing respects ignore baselines, mandatory secret-path exclusions, binary detection, large-file thresholds,
  generated-file exclusions, path canonicalization, and project/cache containment.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
unblocks: []
acceptance_criteria:
- The generated-file exclusion default list is preserved.
- Paths from `.gitmodules`, dirty staging, and remote events are canonicalized and contained.
- Submodule paths containing `..` are rejected with a logged warning.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_filtering_path_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- .gitignore
- .ignore
- secret-path exclusions
- null-byte
- default 10 MB
- package-lock.json
- yarn.lock
- pnpm-lock.yaml
- '*.min.js'
- '*.min.css'
- '*.map'
- '*.generated.*'
- '*.g.dart'
- '*.pb.go'
- starts_with(project_root)
- starts_with(cache_root)
- .gitmodules
- ..
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-051 - Grep Indexing And Search GUI Consumers

```yaml
plan_unit_id: T-051
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The user-facing Search regex mode and optional Indexing setting consume the same sparse-n-gram path without
  weakening backend safeguards.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-046
- T-050
unblocks: []
acceptance_criteria:
- '`Follow symlinks` remains off by default.'
- Enabled symlink targets are still canonicalized and project-root-contained.
- Search panel regex mode inherits dirty-layer guarantees and fallback causes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_search_panel_gui_consumer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- Search panel regex toggle is ON
- Indexing settings
- Follow symlinks
- OFF by default
- --no-follow
- no-follow
- starts_with(project_root)
- dirty-layer freshness guarantee
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-052 - Grep Performance Publication And Rust Foundation

```yaml
plan_unit_id: T-052
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep index targets <20 ms queries, bounded build and storage envelopes, generation publication with flush,
  cancellation checks, and Rust crate foundations without treating study references as dependencies.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-047
- T-048
- T-049
unblocks: []
acceptance_criteria:
- Generation publication and cancellation handoff are preserved.
- Rust crate list and scheduling notes are preserved.
- '`trigrep` and `fast-grep-rust` remain study references only.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_performance_publication_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- <20 ms
- <2 minutes
- <=500 MB
- <10 minutes
- <=5 GB
- <30 minutes
- <=50 GB
- 1.5x index size
- RSS contribution typically <500 MB
- 1-10%
- thread-priority
- regex-syntax
- roaring
- memmap2
- xxhash-rust
- arc-swap
- ThreadPriority::Min
- pthread_set_qos_class_self_np(QOS_CLASS_UTILITY)
- gen-{N+1}/
- File::sync_all();
- sync_all
- CancellationToken
- O(index_size)
- trigrep
- fast-grep-rust
- Cursor
- ClickHouse
- GitHub Code Search
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-053 - Logsearch Logread Project Logs Contract

```yaml
plan_unit_id: T-053
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`logsearch` indexes summaries and snippets; `logread` fetches bounded full payloads by `event_id` or `blob_ref`;
  full payload remains out of the index and all persisted or returned log material is strictly scrubbed.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Input and output shapes are preserved.
- Full log payload is fetched out-of-index through `logread`.
- '`blob_ref` path ownership remains under storage blobs.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: logsearch_logread_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- logsearch
- logread
- 'query: string'
- 'filters: { time_range?, run_id?, thread_id?, tool_name?, level? }'
- '{ event_id? | blob_ref? }'
- '{ content, truncated?: boolean, truncation_reason? }'
- summaries/snippets only
- blob_ref
- storage/blobs/projects/{project_id}/logs/...
- PolicyRule:no_secrets_in_storage
- INV-002
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-054 - Repo Import External Repository Contract

```yaml
plan_unit_id: T-054
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`repo.import` imports external repositories as `new_project`, `add_workspace_root`, or lifecycle-bound `temporary_mount`
  without half-registering failed imports.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- FileSafe, path traversal, repo size, clone timeout, and network/provider permissions are enforced.
- Temporary mounts return bounded `mount_ref` and remain excluded from durable project identity until promoted.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: repo_import_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- repo.import
- 'source: string'
- dest_path?
- new_project
- add_workspace_root
- temporary_mount
- mount_ref
- invalid_source
- permission_denied
- filesafe_blocked
- repo_too_large
- clone_failed
- auth_required
- destination_exists
- network_unavailable
- no half-registered project
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-055 - Task Public Discovery Boundary

```yaml
plan_unit_id: T-055
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The public `task` contract describes delegated work, not a user-curated agent catalog; hidden, unavailable,
  or policy-blocked subagents stay out of public discovery and success-shaped fallbacks.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-005
unblocks: []
acceptance_criteria:
- Public task discovery excludes blocked, hidden, or inaccessible subagents.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_public_discovery_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0035
preserved_exact_tokens:
- task
- 42 subagents
- delegated work
- hidden
- unavailable
- policy-blocked
- success-shaped fallbacks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-056 - Task Request Schema And Registry Validation

```yaml
plan_unit_id: T-056
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task input schema includes `goal`, `context?`, `owner_hint?`, `subagent_type?`, `resume?`, and `timeout_s?`;
  accepted `subagent_type` validates against the 42-entry `subagent_registry` before launch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- Unknown subagent types are rejected before launch.
- '`owner_hint` exact-match fallback is preserved.'
- Hidden, inaccessible, or policy-blocked subagents stay out of selectable public inputs.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_request_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0036
preserved_exact_tokens:
- goal
- context?
- owner_hint?
- subagent_type?
- resume?
- timeout_s?
- subagent_registry
- 42 subagent types
- crew.roles
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-057 - Task Result Envelope And Resume Compatibility

```yaml
plan_unit_id: T-057
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task results return stable `delegated_session_id`, lifecycle `status`, optional summary, artifacts, and failure
  detail; resume reuses identity and provider compatibility fields normalize back to PM shape.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- Resume does not mint a fresh child identity.
- Provider-facing compatibility fields remain compatibility-only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_result_resume_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- delegated_session_id
- pending | running | completed | failed | cancelled | timed_out
- summary?
- artifacts[]?
- failure_detail?
- 'resumed: boolean'
- task_id
- subagent_type
- result_text
- runtime_snapshot?
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-058 - Task Permission Public Input And MCP Dependency Boundary

```yaml
plan_unit_id: T-058
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task subagents inherit parent permissions with enforced overrides; nested `task`, `todowrite`, and `todoread`
  remain denied unless run config re-enables them; MCP runtime deps reference shared MCP auth/config without copying secrets.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- The public contract does not expose `agent_type`, `name`, or optional `agent_id` as canonical user-facing inputs.
- Unavailable providers surface an error instead of silent rerouting.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_permission_dependency_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- todowrite
- todoread
- nested `task`
- denied by default
- agent_type
- name
- agent_id
- 'type: "local"'
- 'command: string[]'
- 'type: "remote"'
- shared MCP runtime /auth/config
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-059 - Task Delegation Transparency Surface

```yaml
plan_unit_id: T-059
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: GUI/chat transparency records which subagent or `/persona` was used, why when meaningful, what task it owned,
  TODO linkage, blocked or failure state, and lifecycle in thread history/storage.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- User-asked subagent usage is honored when feasible.
- Aggressive read-heavy delegation requires specialist-fit and task-fit evidence.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_delegation_transparency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- User-asked subagent usage
- aggressive-by-default
- read-heavy `task` delegation
- specialist-fit
- task-fit evidence
- /persona
- TODO linkage
- /blocked
- thread history/storage
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-060 - Task Launch Bounds Metadata And Timeout Clamp

```yaml
plan_unit_id: T-060
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`task` launches canonical child runs with requested/effective persona, runtime, account, capability, write-scope,
  effort, required/optional classification, inherited ceilings, and clamped `task_timeout_ms` metadata.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-005
- T-055
unblocks: []
acceptance_criteria:
- Children may narrow but must not widen parent bounds.
- Omitted timeout defaults to inherited remaining budget.
- Broader requested timeout is clamped and emits a structured diagnostic.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_launch_bounds_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- canonical child runs
- subagent_registry
- requested and effective Persona
- required
- optional
- parent permission ceiling
- write scope
- remaining budget
- task_timeout_ms
- MUST NOT widen
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md,
  ContractName:Plans/Models_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-061 - Task No-Silent-Fallback And Copilot Strict Deny

```yaml
plan_unit_id: T-061
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Explicit child runtime requests fail or ask when unavailable; implicit orchestrator selections may fallback
  with recorded reason; Copilot-native subagent paths require a Copilot-rooted parent.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-060
unblocks: []
acceptance_criteria:
- Explicit unavailable runtime requests do not silently fallback.
- Implicit fallback records the fallback reason.
- A non-Copilot parent gets strict deny for Copilot-native subagent semantics.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_runtime_fallback_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- No-silent-fallback
- explicit user or command requests
- implicit orchestrator-selected runtime surfaces
- fallback reason
- Copilot-rooted parent
- Copilot-native subagent path
- strict deny
- not silent downgrade
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-062 - Task Child Lifecycle Unified Model

```yaml
plan_unit_id: T-062
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Retry, reroute, replacement, cancellation, and resume are lifecycle semantics of one canonical child-run model
  shared by command subtasks, interview children, crew members, and orchestrator children.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-060
unblocks: []
acceptance_criteria:
- Resume applies only to non-terminal interrupted or waiting children.
- Task does not create separate runtime classes for command, interview, crew, or orchestrator children.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_child_lifecycle_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- retry
- reroute
- replacement
- cancellation
- resume
- non-terminal interrupted or waiting children
- command subtasks
- interview children
- crew members
- orchestrator children
- same canonical child-run model
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md,
  ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-063 - Delegated Debug Investigation Participation

```yaml
plan_unit_id: T-063
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Delegated task runs may join an existing investigation by inheriting `investigation_id` and a narrowed-or-equal
  permission snapshot, adding evidence, instrumentation updates, and verification results through canonical contracts only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- No second mutation-capable investigation is created for the same project/worktree unless a higher-level isolation flow exists.
- Temporary instrumentation carries its `instrumentation_id` cleanup contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: delegated_investigation_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0039
preserved_exact_tokens:
- investigation_id
- narrowed-or-equal permission snapshot
- evidence
- instrumentation updates
- verification results
- second mutation-capable investigation
- project/worktree
- instrumentation_id
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/orchestrator-subagent-integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-064 - GitHubApiTool Sole HTTPS Interface

```yaml
plan_unit_id: T-064
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`GitHubApiTool` is the sole permitted interface for GitHub HTTPS API operations; `gh` is forbidden for auth,
  status, repo, fork, and PR operations.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GitHub CLI is forbidden for auth/status/repo/fork/PR operations.
- Auth flows remain owned by `Plans/GitHub_API_Auth_and_Flows.md`.
- API version default remains configurable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: github_api_tool_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0040
preserved_exact_tokens:
- GitHubApiTool
- GitHub HTTPS API calls
- repository
- fork
- PR
- issue
- status
- gh
- Spec_Lock.json#github_operations
- github.api_version
- '"2022-11-28"'
- Crosswalk.md §3.1
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ToolID:GitHubApiTool, SchemaID:Spec_Lock.json#github_operations, Primitive:Tool'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-065 - Custom Tool Registry And Event Normalization

```yaml
plan_unit_id: T-065
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Custom tools are user- or project-defined callable functions registered with name, description, input schema,
  permissions, and normalized invocation/result events in seglog.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Custom tools are not policy-exempt.
- 'Wildcard permissions such as `myproject_*: ask` remain valid.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_registry_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0042
preserved_exact_tokens:
- Custom tools
- Name
- description
- input schema
- Permission model
- allow/deny/ask
- wildcards
- 'myproject_*: ask'
- seglog
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-066 - Custom Tool Schema Discovery And Enablement

```yaml
plan_unit_id: T-066
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Custom tool schemas use JSON Schema or equivalent and discovery comes from project config, enabled lists,
  or explicit scans without arbitrary disk loading.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Prompt descriptions are preserved.
- Arbitrary code is not loaded from disk without explicit enablement.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_discovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0043
preserved_exact_tokens:
- JSON Schema
- description for model prompt
- project-level
- user-level
- enabled list
- scan
- explicit enablement
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-067 - Custom Tool Subprocess Safety FileSafe And Host Policy

```yaml
plan_unit_id: T-067
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: MVP custom tools run arbitrary code in subprocesses with configurable timeout and output caps, apply FileSafe
  where classifiable, use prefixes/namespaces, and obey enterprise host-policy before external host contact.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- MVP does not imply a network or filesystem sandbox.
- Offline cached results are read-only evidence, not live authority.
- Diagnostics distinguish host policy, proxy, TLS, offline-cache, and unsupported-host failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_safety_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0044
preserved_exact_tokens:
- subprocess
- 60s default
- 1 MiB
- No network or filesystem sandbox for MVP
- FileSafe
- custom_*
- myproject_*
- blocked_by_host_policy
- host_blocked_by_policy
- proxy_auth_required
- tls_untrusted
- offline_cached_only
- enterprise_host_unsupported
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-068 - MCP Integration Consumer Boundary

```yaml
plan_unit_id: T-068
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools is a consumer cross-reference for MCP registry and permission integration; MCP availability, credential
  binding, invalidation, and remote auth/debug/status evidence are owned by `Plans/MCP_Integration.md`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Underscore form remains canonical for MCP tool names.
- Slash-separated aliases do not remain live examples.
- Skill metadata consumes the central registry rather than becoming a competing tool model.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0045
preserved_exact_tokens:
- MCP canon
- requested versus effective MCP availability
- credential binding
- tool names
- '{server_slug}_{tool_name}'
- slash-separated aliases
- tool-resolution
- /remote/auth/debug/status
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-069 - Tool Addition Mechanisms And Central Registry Alignment

```yaml
plan_unit_id: T-069
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool addition mechanisms route through MCP servers, platform flags, and the central registry; implementation
  uses `platform_specs`, central MCP ownership, secretless derived adapter config, and storage-aligned events/search.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DirectApi providers use the central registry directly.
- CliBridge receives derived adapter config only where required.
- Secrets resolve through env or credential store only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_addition_registry_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0046
preserved_exact_tokens:
- MCP server
- Platform CLI flags
- Central tool registry
- platform_specs
- CliBridge
- DirectApi
- env/credential store
- no secrets in config files
- seglog
- redb
- Tantivy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-070 - GUI Tool Catalog And MCP Settings Surfaces

```yaml
plan_unit_id: T-070
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: GUI tool catalog choices are offered in Interview and GUI MCP settings live under Settings -> Advanced ->
  MCP Configuration while still integrating through the central MCP/tool contract.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GUI rows remain consumer surfaces over the central registry/MCP contract.
- '`Playwright`, `Context7`, `DRY:DATA:gui_tool_catalog`, and `newtools.md` owner hints are preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_addition_gui_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0046
preserved_exact_tokens:
- GUI tool catalog
- Interview
- DRY:DATA:gui_tool_catalog
- Playwright
- headless runners
- Settings → Advanced → MCP Configuration
- Context7
- newtools.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-071 - Per-Platform MCP Config Reference And Secretless Adapters

```yaml
plan_unit_id: T-071
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Per-platform MCP/tool config is reference material to reverify with Doctor or platform docs; Cursor and Claude
  configs/flags are compatibility details, while Codex, Gemini, and Copilot remain DirectApi provider/tool-boundary rows.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Derived adapter config contains no secrets.
- Cited web search normalizes through live web/provenance/tool contracts before consumer use.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: platform_mcp_config_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0047
preserved_exact_tokens:
- Cursor
- .cursor/mcp.json
- ~/.cursor/mcp.json
- Claude Code
- .mcp.json
- ~/.claude.json
- --allowedTools
- --permission-mode
- Codex
- Gemini
- Copilot
- 'Authorization: Bearer <key>'
- websearch-cited
- websearch_cited
- usage.event
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-072 - Tool Event Payload And Index Used Disclosure

```yaml
plan_unit_id: T-072
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked and denied tool packets expose the shared runtime-facing blocked payload fields and canonical `tool.invoked`
  / `tool.denied` events; grep/Search acceleration reports optional `index_used`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Escalation ladder is preserved.
- '`tool.invoked.index_used=true` means sparse-n-gram narrowing served the query; false means fallback or another unindexed
  path.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_event_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0049
- pldg-20260622-001-fff:atom-0063
- pldg-20260622-001-fff:atom-0076
- pldg-20260622-001-fff:subagent_compile_proposals:Helmholtz
preserved_exact_tokens:
- blocked_sequence
- approval_scope_key
- action_available
- escalation_level
- tool.invoked
- tool.denied
- info
- warning
- attention_required
- blocked
- system_notification
- tool.invoked.index_used = true
- 'false'
negative_constraints:
- Do not use `tool.invoked.index_used` for fuzzy/path discovery; it remains only grep/Search sparse-n-gram disclosure.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-073 - Tool Permission Config Persistence And Snapshot

```yaml
plan_unit_id: T-073
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool permissions persist under `tool_permissions` in config with app defaults and project overrides; active
  runs use immutable snapshots and settings changes affect only the next run.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Project switching recomputes effective permissions.
- Mid-run Settings changes do not affect the active run.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_permission_config_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0050
preserved_exact_tokens:
- GuiConfig
- redb
- config:v1
- tool_permissions
- '"allow" | "deny" | "ask"'
- project-scoped overrides
- immutable snapshot
- next run
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-074 - Tool Dispatch Policy Order And Child Inheritance

```yaml
plan_unit_id: T-074
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: No tool implementation dispatches outside the canonical flow; child/helper work inherits parent policy, deadline,
  MCP effective availability, and registry-filtered tool set unless narrowed.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-058
unblocks: []
acceptance_criteria:
- Child tool dispatch inherits parent policy, deadline, and MCP effective-availability snapshot unless explicitly narrowed.
- Helper/background work cannot bypass policy, schema validation, or timeout propagation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_dispatch_policy_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0051
preserved_exact_tokens:
- policy.may_execute_tool()
- central tool registry
- effective MCP-discovered tools
- /helper/background
- schema validation
- timeout propagation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-075 - MCP Schema OAuth Isolation And Stable Auth State

```yaml
plan_unit_id: T-075
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool dispatch consumes MCP-owned schema/OAuth facts, fails fast for auth or timeout evidence, uses owner-provided
  loopback binding, isolates schema cycles and mismatches, and serializes client/token state.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-068
- T-074
unblocks: []
acceptance_criteria:
- Tool layer does not mint hidden OAuth flows or extend run timeout.
- Callback listeners do not silently widen to wildcard or public-interface binds.
- Schema violations isolate per server/tool and do not poison other servers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_schema_oauth_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- /OAuth/timeout
- fail fast
- callback/listener failure
- bind-address
- bind-host
- WSL/container
- schema-cycle
- '{}'
- mcp_schema_mismatch
- finishReason=length
- no-dispatch
- client-id
- callback-listener
- token-write
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-076 - Dispatch Required Order And Revalidation Hooks

```yaml
plan_unit_id: T-076
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Dispatch order normalizes context, checks policy, applies FileSafe, applies allowed provider normalizers,
  validates schema, runs arg-touching hooks, revalidates changed args, and dispatches only after all checks pass.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-074
- T-075
unblocks: []
acceptance_criteria:
- Provider-specific normalizers run before schema validation only where the tool surface explicitly allows them.
- Hook-mutated arguments trigger permission and schema revalidation before dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_dispatch_required_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- Normalize the invocation context
- policy.may_execute_tool()
- FileSafe/write-scope checks
- GLM quoted-JSON unquoting
- Qwen XML-wrapper stripping
- schema.validate_tool_args()
- arg-touching hooks
- Re-run permission and schema validation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-077 - Tool Failure Error Result And Structured Retry Decisions

```yaml
plan_unit_id: T-077
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Invalid args and non-permission tool errors return structured `is_error=true` results without execution, best-effort
  repair, substring retry matching, or zero-value success-shaped results.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-076
unblocks: []
acceptance_criteria:
- Invalid payloads are rejected before dispatch.
- Provider-specific retry decisions use structured error classes or status codes.
- Non-permission tool errors surface as `is_error=true`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_failure_result_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- is_error=true
- best effort
- empty `tool_result`
- PER error type
- structured error classes
- status codes
- substring matching
- OC-EXEC-106
- zero-value success-shaped result
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-078 - Incomplete Tool Invocation Truncation Gate

```yaml
plan_unit_id: T-078
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Incomplete tool invocations truncated by provider output close with structured truncation errors and never
  synthesize missing, empty, minimal, or incomplete arguments.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-076
unblocks: []
acceptance_criteria:
- Truncated incomplete tool calls are closed before permission, schema, or execution paths.
- Missing or incomplete arguments are rejected rather than synthesized.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_truncation_no_dispatch_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- finishReason=length
- stop_reason = length
- no-dispatch
- tool_result(ok=false, error=truncated_by_length)
- MUST NOT synthesize missing arguments
- empty
- /minimal
- structurally incomplete tool arguments
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-079 - Retry Classification And Bounded Recovery

```yaml
plan_unit_id: T-079
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Automatic retries are per-invocation, classed, capped at 3, use `1000ms`, `2000ms`, and `4000ms` backoff with
  `+/-25%` jitter, and only recreate helpers for recoverable classes.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-077
unblocks: []
acceptance_criteria:
- Retry caps are per invocation.
- Auth, permission, schema, validation, content-filter, and safety-stop classes are terminal.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_retry_bounded_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0053
preserved_exact_tokens:
- transient transport
- server-warming
- recoverable bootstrap failures
- 3 per invocation
- 1000ms
- 2000ms
- 4000ms
- +/-25%
- Retry-After
- helper/client recreation
- auth-required
- permission-denied
- schema-mismatch
- validation-failed
- content-filter
- safety-stop
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-080 - Deadline Propagation And Loop Suppression

```yaml
plan_unit_id: T-080
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Nested tool/helper work inherits the parent absolute deadline or remaining budget; retries clamp to remaining
  budget and loop suppression compares normalized fingerprint, target, error class/status, and near-match signatures.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-079
unblocks: []
acceptance_criteria:
- Parent deadline is never extended by retries or helper restarts.
- Exhausted remaining budget emits timeout/budget result without dispatch.
- Equivalent repeated failures stop further retries with a diagnostic.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_deadline_loop_suppression
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0054
preserved_exact_tokens:
- parent deadline
- remaining-budget snapshot
- MUST NOT extend
- timeout or budget result
- normalized tool fingerprint
- canonical target
- error class/status
- near-match argument
- stderr signatures
- diagnostic
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-081 - Shell Command Validation Escaping And One-Layer Dispatch

```yaml
plan_unit_id: T-081
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Shell dispatch validates the full rendered command string, prefers structured parsing where practical, uses
  exactly one shell interpretation layer, prohibits `eval`, and requires platform-correct path escaping.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-074
unblocks: []
acceptance_criteria:
- Banned-command checks scan the full rendered command string.
- Unix shell dispatch uses one shell interpretation layer.
- Individual tools do not implement competing escaping layers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shell_runtime_validation_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0055
preserved_exact_tokens:
- full rendered command string
- ;
- '&&'
- '||'
- '|'
- subshell/grouping constructs
- $()
- backticks
- redirection operators
- structured parsing
- AST-aware validation
- exactly one shell interpretation layer
- never eval
- exec.Command("bash", "-c", command)
- /bin/bash
- cmd.exe
- PowerShell
- shellQuote
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-082 - Shell Instance Isolation Lifecycle And OC Evidence Labels

```yaml
plan_unit_id: T-082
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Shell instances are isolated per agent tree, lifecycle is mutex-guarded, queues are non-blocking, dead-shell
  writes return structured LIFE errors, and OC codes remain evidence labels only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-081
unblocks: []
acceptance_criteria:
- Environment variables do not leak across session/agent boundaries.
- Alive-check occurs before queue writes.
- OC references do not replace canonical behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shell_lifecycle_error_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0055
preserved_exact_tokens:
- isolated per agent tree
- mutex-guarded
- /non-blocking
- dead shell
- structured LIFE error
- OC-LIFE-006
- OC-EXEC-101
- OC-EXEC-108
- OC-PROV-012
- OC-EXEC-106
- OC-LIFE-004
- OC-LIFE-005
- OC-PROV-006
- OC-PROV-005
- evidence labels only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-083 - Tool CLI Flag Derivation

```yaml
plan_unit_id: T-083
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The registry and resolved tool policy derive platform-specific CLI flags for Claude, Copilot, and Gemini without
  runner hardcoding.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-069
- T-073
unblocks:
- T-102
acceptance_criteria:
- Allow, ask, and deny outcomes map to platform flags as specified.
- Gemini remains gated by PM policy rather than provider CLI flags.
- Runner logic uses registry and policy as the single source of truth.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_cli_flag_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0056
preserved_exact_tokens:
- --allowedTools
- Read,Edit,Bash
- --allow-tool
- --allow-all-tools
- --deny-tool
- N/A
- no hardcoding in runner
- platform_specs
- tool policy → CLI args
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-084 - Tool Usage Rollup Schema

```yaml
plan_unit_id: T-084
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Analytics writes executed tool rollups under `rollups` / `tool_usage.{window}` with canonical windows and
  per-tool count, latency, error, and `index_used` fields.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Rollup schema matches the source value shape.
- Analytics aggregates `tool.invoked` events so the Usage page can render without scanning seglog.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_usage_rollup_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0057
preserved_exact_tokens:
- rollups
- tool_usage.{window}
- 5h
- 7d
- 24h
- 1h
- count
- p50_ms
- p95_ms
- error_count
- index_used
- tool.invoked
- latency_ms
- success
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-085 - Tool Usage Widget Freshness And Runtime Identity

```yaml
plan_unit_id: T-085
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Usage widget consumes the same windows, excludes `tool.denied` and FileSafe blocks from executed-call
  rollups, preserves node-native runtime identity, and can show freshness metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-072
unblocks: []
acceptance_criteria:
- '`error_count` counts executed `tool.invoked` events where `success = false`.'
- Denied and FileSafe-blocked calls are excluded from executed-call rollups.
- '`tool_usage_meta.{window}` supports a Last updated timestamp.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_usage_widget_freshness_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0057
preserved_exact_tokens:
- node-native
- tier-native
- tier-aligned
- tool.denied
- FileSafe blocks
- success = false
- tool_usage_meta.{window}
- computed_at
- window_started_at
- window_ended_at
- Last updated
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`tier-native` and `tier-aligned` fields survive only as compatibility/grouping projections.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-086 - YOLO FileSafe Boundary

```yaml
plan_unit_id: T-086
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: YOLO treats all tools as allow for session prompting, removing ask prompts, but does not disable FileSafe
  or destructive/write-scope/sensitive-file guards.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Ask prompts are suppressed for the session.
- FileSafe remains enforced after YOLO allow behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: yolo_file_safe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0058
preserved_exact_tokens:
- YOLO
- allow
- ask
- FileSafe
- destructive commands
- write-scope
- sensitive-file guards
- does not disable FileSafe
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-087 - MCP Name Wildcard Permission Layering

```yaml
plan_unit_id: T-087
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: MCP tool names use `{server_slug}_{tool_name}`; wildcard rules match the underscore form and server-level
  permission rules apply before per-tool wildcard expansion.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Slash and mixed separator examples are retired.
- No `org` layer is added to canonical precedence.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_name_wildcard_permission_layering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0059
preserved_exact_tokens:
- '{server_slug}_{tool_name}'
- context7_*
- slash variants
- mixed `_` / `/` examples
- server-level permission rules
- project > global > org > default
- canonical `Plans/Permissions_System.md` precedence
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Slash variants and mixed `_` / `/` examples are retired.
- Older `project > global > org > default` wording is non-canonical historical wording.
owner_hints:
- Plans/Tools.md
```

### T-088 - MCP Unavailable Runtime Contract

```yaml
plan_unit_id: T-088
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Unavailable MCP servers mark their tools unavailable, fail calls immediately with structured errors, use independent
  per-tool timeout, emit diagnostics, preserve safe stale identity, and retry once after cooldown.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A transient `listTools()` failure does not permanently delete the MCP client or singleton state.
- Calls to unavailable tools fail immediately with structured errors.
- Reconnect behavior is bounded to one automatic attempt after cooldown.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_unavailable_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0060
preserved_exact_tokens:
- unavailable
- failure_class=provider_transient
- Per-tool MCP invocation timeout
- 30 seconds
- server_id
- reason
- last_healthy_at
- stale list
- listTools()
- one automatic reconnect attempt
- 60 seconds
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-089 - MCP Degraded User Surface

```yaml
plan_unit_id: T-089
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: User surfaces show MCP servers as `degraded` or `unavailable` and never silently hide a server after a single
  transient failure.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-088
unblocks: []
acceptance_criteria:
- Visible degraded/unavailable state is emitted from runtime diagnostic evidence.
- A single transient failure does not remove the server from user surfaces.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_degraded_user_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0060
preserved_exact_tokens:
- degraded
- unavailable
- MUST NOT silently hide
- startup timeout
- transport failure
- auth loss
- schema mismatch
- repeated health-check failure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-090 - Tool Gap Risk Register

```yaml
plan_unit_id: T-090
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The gaps table is preserved as risk/readiness metadata for platform semantics, MCP instability, defaults,
  sandboxing, HITL, FileSafe, retention, subagent overrides, LSP, web abuse, config, snapshots, MCP down, empty Usage, provider
  coverage, policy enforcement, and LSP crashes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Rows remain risk/readiness mitigations, not WorkNodes or executable tasks.
- Mitigation labels are preserved for future implementation planning.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_gap_risk_register
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0061
preserved_exact_tokens:
- Platform tool semantics differ
- MCP tool names unstable
- Permission default ambiguity
- Custom tool sandboxing
- Ask vs HITL in orchestrator
- Edit permission vs write scope
- Tool latency in seglog
- Subagent tool defaults
- LSP tool when no server
- webfetch / websearch abuse
- Config key for tool permissions
- Permission change mid-run
- MCP server down
- Tool usage widget empty
- All providers in MCP GUI
- Policy application point
- LSP server crash mid-call
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-091 - Optional Tool Enhancement Backlog

```yaml
plan_unit_id: T-091
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Optional tool enhancements remain non-MVP backlog items covering rate limits, dashboard, presets, templates,
  allowlists, denied/ask audit, UI descriptions, and bash allowlists.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Optional enhancements do not redefine MVP scope.
- MVP remains defined by §3 built-in tools, §10 permission model, §8 events/rollups, and GUI Tool permissions.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: optional_tool_enhancement_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0062
preserved_exact_tokens:
- optional
- not MVP
- Per-tool rate limits
- Tool usage dashboard
- Permission presets
- Custom tool templates
- MCP tool allowlist
- Audit log for denied/ask
- Tool description in UI
- Bash command allowlist
- Read-only
- Plan mode
- Full
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-092 - Permissions Implementation SSOT Boundary

```yaml
plan_unit_id: T-092
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools consumes `Plans/Permissions_System.md` as the permission SSOT while adding registry-specific FileSafe
  integration, CLI derivation, and preset implementation guidance.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Tools does not restate conflicting permission owner definitions.
- Mode override text does not imply blanket denial of help-family tools when the effective preset allows them.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permissions_implementation_ssot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0063
preserved_exact_tokens:
- SSOT
- Plans/Permissions_System.md
- FileSafe integration
- CLI derivation
- presets
- /question/skill/LSP/todo/subagent
- /search/skill/lsp/question/todo
- help-family tools
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-093 - Permission Config Schema Projection

```yaml
plan_unit_id: T-093
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Durable permission config uses global and project TOML files and projects the merged set to redb `tool_permissions`
  in `config:v1` for backward compatibility.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Global and project TOML locations are preserved.
- Merged permission projection to redb remains backward-compatible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_config_schema_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0064
preserved_exact_tokens:
- ~/.config/puppet-master/permissions.toml
- <project_root>/.puppet-master/permissions.toml
- tool_permissions
- config:v1
- backward compatibility
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-094 - Default Policy Table Consumer Summary

```yaml
plan_unit_id: T-094
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools mirrors the canonical default policy table for skill, question, web, batch web, todo, and child-agent
  question tool families while keeping defaults owned by Permissions_System §7.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Default table remains a consumer summary of Permissions_System §7.
- Child-agent `question` remains denied by default.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: default_policy_table_consumer_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0065
preserved_exact_tokens:
- skill
- question
- HITL
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- batch_webfetch
- batch_webextract
- todoread
- todowrite
- child-agent `question`
- allow
- ask
- deny
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-095 - Permission Resolution Algorithm Summary

```yaml
plan_unit_id: T-095
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Permission resolution order is summarized as Mode override, Session cache, Persona, Project, Global, Defaults,
  Special guards, then FileSafe post-resolution application.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Summary does not compete with Permissions_System §8.
- FileSafe remains post-resolution per §10.6.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_resolution_algorithm_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0066
preserved_exact_tokens:
- Mode override
- Session cache
- Persona overrides
- Project rules
- Global rules
- Defaults
- Special guards
- FileSafe applies
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-096 - Permission Preset Tool Mapping

```yaml
plan_unit_id: T-096
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`read_only`, `plan`, and `full` presets map to tool-facing availability without silently denying all web/help
  tools, and child-agent `question` denial remains architectural.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Preset semantics remain owned by Permissions_System §10.4.
- Plan preset does not silently auto-deny the whole web family.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_preset_tool_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0067
preserved_exact_tokens:
- read_only
- plan
- full
- read/search/list
- mutation stays denied
- read-only web tools remain `ask`
- full
- Child-agent denial of `question`
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-097 - Permission GUI Config Serialization

```yaml
plan_unit_id: T-097
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Permissions GUI is specified by Permissions_System and FinalGUISpec; the tool registry supplies known
  built-in and MCP-discovered tool names for the GUI per-tool list.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GUI does not own permission semantics.
- Tool registry supplies known tool names for serialization/display.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_gui_config_serialization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0068
preserved_exact_tokens:
- Permissions GUI
- Plans/Permissions_System.md §10
- Plans/FinalGUISpec.md §7.4
- Settings and inspectors
- built-in + MCP-discovered
- per-tool list
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-098 - FileSafe Policy API Order Summary

```yaml
plan_unit_id: T-098
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`policy.may_execute_tool(tool_name, invocation_context)` remains the permission entrypoint; FileSafe normalized
  checks run inside the canonical §8.2 flow and hook-mutated args require re-checks.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Subsection remains an API summary only.
- FileSafe runs on normalized arguments within the canonical dispatch order.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: filesafe_policy_api_order_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0069
preserved_exact_tokens:
- MUST NOT be read as a competing order definition
- policy.may_execute_tool(tool_name, invocation_context)
- Result<Allow | Deny(reason) | Ask, Error>
- check_bash_command(cmd)
- check_write_path(path)
- check_read_path(path)
- hook-mutated arguments
- required re-checks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-099 - Assistant Ask Pending Approval Notice

```yaml
plan_unit_id: T-099
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Interactive Assistant ask-flow surfaces a `blocked_notice` pending approval with scoped actions and blocked
  metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Pending approval notice includes scoped response options and blocked metadata.
- Ask-flow response semantics defer to Permissions_System §6.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: assistant_ask_pending_approval_notice
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0070
preserved_exact_tokens:
- Assistant (interactive)
- ask
- blocked_notice
- pending approval
- action_available
- blocked_reason_code
- blocked_sequence
- approval_scope_key
- deny
- once
- for session
- always
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-100 - Headless Ask Denial Or HITL

```yaml
plan_unit_id: T-100
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Headless Orchestrator and Interview contexts map `ask` to deny or to pending-HITL when HITL is enabled, avoiding
  invisible interactive waits.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Headless flows do not wait invisibly for interactive approval.
- HITL-enabled flows may enter pending-HITL instead of denial.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: headless_ask_denial_or_hitl
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0070
preserved_exact_tokens:
- Orchestrator / Interview
- headless
- ask → deny
- pending-HITL
- human-in-the-loop.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-101 - Web Operation Approval Summary Rules

```yaml
plan_unit_id: T-101
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Runner and UI integrations preserve web-operation approval summaries for search, fetch, extract, research,
  crawl, and map plus the correct session-approval scope.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Crawl/session approval remains host-pattern scoped.
- Webresearch approval does not broadly allow unrelated tools.
- Advanced query-pattern support requires a separate owner-defined matcher contract and validation evidence before use.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_operation_approval_summary_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0071
preserved_exact_tokens:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-102 - Platform CLI Derivation Table

```yaml
plan_unit_id: T-102
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Resolved permissions derive platform-specific CLI args for Claude, Copilot, Gemini, Cursor, and Codex, with
  names sourced from registry and policy.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-083
unblocks: []
acceptance_criteria:
- Allow/ask/deny behavior matches the platform derivation table.
- Runner uses registry and policy for all names.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: platform_cli_derivation_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0072
preserved_exact_tokens:
- Claude
- Copilot
- Gemini
- Cursor
- Codex
- --allowedTools
- --allow-tool
- --deny-tool
- Tool disabled
- allow → forward
- deny → return
- ask → map to deny or HITL
- No hardcoded tool names
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-103 - HTE DAE Tool Enforcement Boundary

```yaml
plan_unit_id: T-103
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The before-forwarding tool-filter wording applies only to HTE; DAE requires deterministic pre-spawn restriction
  and post-run reconciliation because the provider executes tools inside a jail.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-102
unblocks: []
acceptance_criteria:
- Providers without deterministic restriction support cannot advertise `dae_allowed = true`.
- HTE and DAE enforcement boundaries remain distinct.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: hte_dae_tool_enforcement_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0072
preserved_exact_tokens:
- HTE
- DAE
- before forwarding
- provider executes tools inside a jail
- deterministic pre-spawn restriction
- post-run reconciliation
- dae_allowed = true
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-104 - Tools Owner Consumer Reference Map

```yaml
plan_unit_id: T-104
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The relationship table remains a consumer/owner map for rewrite tie-in, newtools, storage, agent context,
  orchestrator, interview, FileSafe, usage, LSP, HITL, and media capability docs.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The table does not re-own referenced docs.
- Media capability tool registration defers full contracts to the media capabilities doc.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_owner_consumer_reference_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0073
preserved_exact_tokens:
- rewrite-tie-in-memo.md
- newtools.md
- storage-plan.md
- agent-rules-context.md
- orchestrator-subagent-integration.md
- interview-subagent-integration.md
- FileSafe.md
- usage-feature.md
- LSPSupport.md
- human-in-the-loop.md
- Media_Generation_and_Capabilities.md
- 42 subagents
- subagent_registry
- capabilities.get
- media.generate
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-105 - Tool Implementation Readiness Checklist

```yaml
plan_unit_id: T-105
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The ordered implementation checklist is readiness metadata only; it preserves dependencies and gates without
  creating WorkNodes, tasks, or executable queues.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Checklist items remain ordered readiness metadata.
- No WorkNodes, NodeSeeds, executable tasks, or queues are created from this checklist.
- Addenda consolidation and machine verification remain gate/readiness language.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_implementation_readiness_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0074
preserved_exact_tokens:
- Config schema
- Default policy table as code
- Resolution function
- FileSafe and YOLO order
- Per-tool adapters
- Event emission
- GUI Tool permissions
- Usage widget and rollups
- Central registry and policy engine
- Registry → CLI derivation
- MCP integration
- Ask UI and headless
- LSP tool promotion
- Addenda consolidation gate
- merge-and-dedup
- Machine verification gates
- /gate
- Doctor and docs
- subagent_tool_overrides
negative_constraints:
- Do not interpret this checklist as a WorkNode manifest or executable build queue.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-106 - Tool Outcome Runtime Taxonomy Mapping

```yaml
plan_unit_id: T-106
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-layer policy outcomes map deterministically to runtime blocked/failure classes, and non-executed calls
  are classified as blocked/denied rather than execution failures.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Outcome mappings are deterministic.
- Calls that never execute are not mislabeled as execution failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_outcome_runtime_taxonomy_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0077
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0078
preserved_exact_tokens:
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- validation_blocked
- blocked / `permission_denied`
- blocked/denied
- not execution failure
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-107 - Tool Blocked Recovery Metadata

```yaml
plan_unit_id: T-107
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked tool outcomes carry guard or policy source, reason code, recovery options where applicable, and executed-at-all
  evidence for runtime recovery UI.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Runtime recovery UI receives enough metadata to bind recovery paths.
- Tool-layer outcomes map deterministically into the shared runtime taxonomy.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_blocked_recovery_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0079
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0080
preserved_exact_tokens:
- guard / policy source
- reason code
- recovery options
- whether the action executed at all
- UI/assistant/orchestrator surfaces
- Acceptance criteria
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-108 - Tool Denied Event Runtime Fields

```yaml
plan_unit_id: T-108
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: When `tool.denied` blocks progress, its event or mapped payload includes blocked reason, optional failure
  class, permission snapshot, allowed actions, headless flag, and remote side-effect metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Blocking denial events collapse into canonical runtime taxonomy.
- Required fields remain available to UI and scheduling layers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denied_event_runtime_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0081
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0082
preserved_exact_tokens:
- tool.denied
- blocked_reason_code
- failure_class
- effective permission snapshot identifier
- allowed_action_ids[]
- headless_denied
- side-effect metadata
- remote mutation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-109 - Tool Denial Canonical Action Alignment

```yaml
plan_unit_id: T-109
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Denied work must not return success-shaped fallbacks; runtime-facing denial paths preserve blocked state and
  use canonical action fields instead of a parallel `recovery_options[]` schema.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Scheduler, chat, and GUI inspect the blocked state.
- Runtime-facing paths use canonical action fields only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denial_canonical_action_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0083
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0084
preserved_exact_tokens:
- MUST NOT return success-shaped fallbacks
- blocked outcome
- scheduler
- chat
- GUI
- allowed_action_ids[]
- executed_at_all
- MUST NOT publish a parallel `recovery_options[]` schema
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Parallel `recovery_options[]` schema is retired for runtime-facing tool-denial paths.
owner_hints:
- Plans/Tools.md
```

### T-110 - Tool Denial Payload Consolidation

```yaml
plan_unit_id: T-110
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Runtime-facing tool denial payloads consolidate source mapping rules and preserve blocked state instead of
  converting denied work into success-shaped or generic-failure fallbacks.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Source mappings remain exact.
- Blocked state survives through UI and scheduler consumption.
- Denied work is not converted to generic failure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denial_payload_consolidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0085
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0086
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0088
preserved_exact_tokens:
- Canonical runtime-facing payload
- blocked_reason_code
- allowed_action_ids[]
- executed_at_all
- permission-layer denial
- headless interactive denial
- FileSafe denial
- plugin_hook_blocked
- success-shaped
- generic-failure
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-111 - Tool Blocked Field Name Contract

```yaml
plan_unit_id: T-111
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-originated blocked payloads use `allowed_action_ids[]` only and canonical `blocked_reason_code` values,
  including `validation_blocked`, for post-validation paths.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Deprecated names are absent from new tool contracts.
- Post-validation paths use canonical blocked reason codes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_blocked_field_name_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0089
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0090
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0091
preserved_exact_tokens:
- allowed_action_ids[]
- Deprecated names MUST NOT appear
- blocked_reason_code
- validation_blocked
- Tool-originated blocked payloads
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Deprecated blocked-payload field names are retired from new tool contracts.
owner_hints:
- Plans/Tools.md
```

### T-112 - Tool Mutation Capability Recovery Contract

```yaml
plan_unit_id: T-112
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Every tool definition includes `mutation_capable: bool` defaulting false, and recovery paths use the canonical
  runtime action family with prerequisite metadata rather than tool-private action arrays.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Tool definitions expose mutation capability.
- Recovery paths do not invent private action arrays.
- Blocked state is not converted to fallback output.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_mutation_capability_recovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0092
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0093
preserved_exact_tokens:
- 'mutation_capable: bool'
- default `false`
- planning
- safe-point
- recovery decisions
- MUST NOT invent tool-private action arrays
- MUST preserve the blocked state
- prerequisite metadata
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-113 - Firecrawl Owner Section Boundary

```yaml
plan_unit_id: T-113
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl is a distinct provider owner section; packet regeneration treats `## 10` as one coherent owner-section
  replacement unit and collapses stale parent/child duplicate canon.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Consumer summaries defer to this owner section and Contracts_V0 for payload fields.
- Stale peer Firecrawl owner bodies are not preserved beside current provider capability/routing canon.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_owner_section_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0094
preserved_exact_tokens:
- Firecrawl
- '## 10'
- '### 10.3'
- '### 10.7'
- single owner-level Firecrawl subtree
- distinct provider
- Packet regeneration
- stale parent
- child bodies
- peer canon
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Duplicate stale parent/child Firecrawl owner bodies are retired as peer canon.
owner_hints:
- Plans/Tools.md
```

### T-114 - Firecrawl Provider Identity And Defaults

```yaml
plan_unit_id: T-114
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl identity is provider ID `firecrawl`, display name `Firecrawl`, default priority below Exa/Tavily
  and above DDG, user-adjustable ordering, and disabled until API key or self-hosted URL configuration.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Firecrawl identity and defaults are preserved exactly.
- Stale cited-search/newtools residue remains retired from owner/provider canon.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_provider_identity_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0095
preserved_exact_tokens:
- firecrawl
- Firecrawl
- below Exa, Tavily; above DDG (user-adjustable)
- disabled (requires API key or self-hosted URL)
- '"stale cited-search framing and older `newtools` wording"'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Exact stale residue "stale cited-search framing and older `newtools` wording" is retired from Firecrawl owner/provider canon.
owner_hints:
- Plans/Tools.md
```

### T-115 - Firecrawl Configuration Field Boundary

```yaml
plan_unit_id: T-115
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl configuration preserves `enabled`, `api_key`, `base_url`, `timeout_ms`, `cache_enabled`, `proxy_mode?:
  "basic" | "enhanced" | "auto"` default `"auto"`, `timeout_ms?: number` default `60000`, and the self-hosted Fire Engine
  limitation.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-114
unblocks: []
acceptance_criteria:
- '`timeout_ms` remains provider-level configuration, not per-invocation `timeout`.'
- Provider-reference implementation notes stay non-normative unless Firecrawl documents them.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_config_timeout_proxy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0095
preserved_exact_tokens:
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- 'proxy_mode?: "basic" | "enhanced" | "auto"'
- '"auto"'
- '60000'
- /enhanced/auto
- webfetch
- Fire Engine
- Node.js/TypeScript (Express)
- Redis
- playwright-service
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-116 - Firecrawl Method-Locked Endpoint Inventory

```yaml
plan_unit_id: T-116
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl endpoint inventory and PM operation routing are exact and method-locked for search, extract, research,
  crawl, map, fetch, and batch fetch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-114
unblocks: []
acceptance_criteria:
- Every endpoint/method pair remains preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_endpoint_inventory_method_lock
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0096
preserved_exact_tokens:
- /v2/scrape
- /v2/crawl
- /v2/map
- /v2/search
- /v2/extract
- /v2/batch/scrape
- /v2/agent
- websearch -> POST /v2/search
- webextract -> POST /v2/extract
- webresearch -> POST /v2/agent
- webcrawl -> POST /v2/crawl
- webmap -> POST /v2/map
- webfetch -> POST /v2/scrape
- batch_webfetch -> POST /v2/batch/scrape
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-117 - Firecrawl Provider Capability Exclusion

```yaml
plan_unit_id: T-117
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-side capability names are adapter-lineage only unless future provider contracts map them; PM does
  not add them to `WebAction` or expose arbitrary provider code execution as a first-class user tool.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Provider capability labels do not expand the PM WebAction enum.
- Arbitrary provider code execution is not exposed as a first-class user tool.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_provider_capability_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0096
preserved_exact_tokens:
- executeJavascript
- scrape
- pdf
- adapter-lineage only
- WebAction
- arbitrary provider code execution
- first-class user tool
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-118 - Firecrawl Webextract Adapter Mapping

```yaml
plan_unit_id: T-118
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webextract` maps PM `url` to provider `urls: [url]`, maps JSON Schema to provider `schema`, keeps PM one-URL
  validation, and keeps provider options typed/audit-boundary only.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- No unconfirmed PM parameter is exposed.
- PM validates scope before adapter dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_webextract_adapter_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- webextract
- url
- 'urls: [url]'
- JSON Schema
- schema
- enableWebSearch
- urlTrace
- showSources
- strictConstrainToURLs
- URL wildcards
- domain-wide extraction
- one-URL constraint
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-119 - Firecrawl Webresearch Agent Mapping

```yaml
plan_unit_id: T-119
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webresearch` accepts `task: string`, maps PM `task` to provider `prompt`, returns `multi-source result +
  sources/provenance`, and treats `max_sources` only as approximate `maxCredits` for credit-limited provider routing.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Mapping does not imply chaining, autonomous behavior, or a full behavioral spec beyond the web operation runtime contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_webresearch_agent_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- webresearch
- 'task: string'
- prompt
- multi-source result + sources/provenance
- max_sources
- maxCredits
- provider_firecrawl_agent
- pm_research_composed
- depth_hint
- spark-1-mini
- spark-1-pro
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-120 - Firecrawl Websearch Transform And Filters

```yaml
plan_unit_id: T-120
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`websearch` preserves supported source/category filters, flattens source-partitioned `{ web, images, news
  }` responses into PM `results`, tags each item with `source_type`, and keeps fixed merge order.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Domain and time filter mappings remain exact.
- If Firecrawl cannot enforce include/exclude domains natively, PM applies filtering post-search.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_websearch_transform_filter_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- '["web", "news", "images"]'
- '["github", "research", "pdf"]'
- '{ web: [...], images: [...], news: [...] }'
- results
- source_type
- web results first, then news, then images
- include_domains
- exclude_domains
- scrapeOptions.includeTags
- time_range
- tbs
- 'formats: ["markdown"]'
- 'onlyMainContent: true'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4
  Activity transparency payloads'
compatibility_only_notes: []
stale_retired_dispositions:
- Firecrawl search does not map PM `include_domains` to `scrapeOptions.includeTags`; that source mapping is retired as unconfirmed.
owner_hints:
- Plans/Tools.md
```

### T-121 - Firecrawl Crawl Map Cache Change Tracking

```yaml
plan_unit_id: T-121
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webmap`, `webcrawl`, cache policy, and `changeTracking` preserve PM-owned limits, sitemap errors, cache
  defaults, adapter cache mapping, and PM-owned crawl diff persistence.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- '`changeTracking` cannot disappear silently.'
- Firecrawl provider `changeTracking` output is subordinate to PM persistence, comparison, and audit semantics.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_crawl_map_cache_change_tracking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- map_timeout
- map_no_sitemap
- 'use_sitemap?: "include" | "only" | "skip"'
- include|only|skip
- ignoreRobotsTxt
- delay
- webhook callback
- max_pages = 25
- limit of 10000
- 'cache_policy?: { max_age_seconds?: number, store?: boolean }'
- cache_ttl
- maxAge
- minAge
- storeInCache
- changeTracking
- change_status
- new
- same
- changed
- removed
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-122 - Firecrawl Browser Capability Endpoint Boundary

```yaml
plan_unit_id: T-122
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl interact/browser capabilities are sub-features through `/v2/scrape` `actions` or the interact-session
  flow, not standalone PM core endpoints or separate `/v2` endpoint families.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- No separate `/v2` endpoint family is invented for PM core web operations.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_browser_capability_endpoint_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- /v2/scrape
- actions
- interact-session flow
- not standalone PM core endpoints
- separate `/v2` endpoint families
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-123 - Firecrawl Batch Operation Row Coverage

```yaml
plan_unit_id: T-123
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl mapping coverage preserves all PM operation rows, including exact batch extraction and scrape rows.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Batch webfetch and batch webextract mapping rows remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_batch_operation_mapping_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- batch_webfetch
- batch_webextract
- POST /v2/extract
- urls[]
- POST /v2/batch/scrape
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-124 - Firecrawl Async Polling And Timeout

```yaml
plan_unit_id: T-124
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Async Firecrawl operations use POST job creation, polling, terminal status mapping, provider `timeout_ms`,
  and partial-result survival on timeout.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Webhooks remain non-MVP unless a future HMAC-verified completion path is enabled.
- Partial materialized results survive timeout.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_async_polling_timeout_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0098
preserved_exact_tokens:
- '{ success: true, id: "<job_id>" }'
- GET /v2/<operation>/<job_id>
- scraping
- processing
- completed
- failed
- cancelled
- timeout_ms
- partial `data`
- X-Firecrawl-Signature
- HMAC-SHA256
- 2s, 4s, 8s, 15s, 30s
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-125 - Firecrawl Progress Cancellation Activity

```yaml
plan_unit_id: T-125
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Long-running web operations emit structured progress, support activity-stream Stop cancellation, return partial
  results with cancellation, and do not render chat/activity complete before terminal status.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-124
unblocks: []
acceptance_criteria:
- 'Stop cancellation returns collected partial results with `cancelled: true`.'
- Chat/activity surfaces do not appear complete before terminal status.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_progress_cancellation_activity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0098
preserved_exact_tokens:
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- 'cancelled: true'
- Researching Web
- 'Fetching sites: 5/20 complete'
- appear-complete
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-126 - Firecrawl Cost-Aware Routing

```yaml
plan_unit_id: T-126
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl routing prefers lower `estimated_credit_cost` unless capability, policy, or freshness gives a stronger
  `adapter_selection_reason`; static priority alone is insufficient.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Estimates above 100 credits require cost confirmation before execution.
- The 500 credits cap remains aligned with routing.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_credit_cost_routing_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0099
preserved_exact_tokens:
- estimated_credit_cost
- adapter_selection_reason
- '>100 credits'
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- provider endpoint
- estimated credit class
- ZDR modifier
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-127 - Firecrawl ZDR And Billing Disclosure

```yaml
plan_unit_id: T-127
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl costs are advisory routing inputs, ZDR is not MVP, global `firecrawl_zdr?: boolean` controls future
  ZDR, and self-hosted Firecrawl does not use hosted credit billing.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-126
unblocks: []
acceptance_criteria:
- Batch and agent credit warnings are explicit before dispatch.
- Self-hosted billing exception remains visible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_zdr_self_hosted_billing_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0099
preserved_exact_tokens:
- 'zeroDataRetention: true'
- 'enterprise: ["zdr"]'
- PM cache is the ONLY persistence layer
- 'firecrawl_zdr?: boolean'
- url_count × per_url_credit_estimate
- estimated_credit_cost
- ignoreInvalidURLs
- maxConcurrency
- 20-2500
- batch_scrape
- batch_webfetch
- self-hosted Firecrawl does not use credit billing
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy `batch_scrape` normalizes to `batch_webfetch`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-128 - Firecrawl Interact Session Lifecycle

```yaml
plan_unit_id: T-128
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`/interact` is a stateful multi-turn browser session with scrape, interact, repeated stateful calls, explicit
  cleanup, prompt/code modes, retry behavior, TTL, and non-MVP profile/live-view limits.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-122
unblocks: []
acceptance_criteria:
- PM does not expose raw provider code execution as a first-class user tool.
- PM does not surface live view URLs as first-class MVP UI.
- Provider interact cleanup remains explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_interact_session_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0100
preserved_exact_tokens:
- /interact
- /v2/scrape/{scrapeId}/interact
- scrapeId
- prompt | code
- DELETE /v2/scrape/{scrapeId}/interact
- DOM
- cookies
- scroll position
- codeOptions
- 'language: "nodejs" | "python" | "bash"'
- 2 credits/min
- 7/min
- 10-minute TTL
- 5-minute inactivity timeout
- liveViewUrl
- interactiveLiveViewUrl
- 'profile: { name: string, saveChanges: boolean }'
- /localStorage
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md#3.5D-web-operation-family-runtime-contract'
compatibility_only_notes:
- Persistent profiles are not MVP for this interact surface.
- Legacy `/localStorage` slash notation is retained only as lineage for canonical `localStorage`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-129 - Firecrawl Audit Traceability

```yaml
plan_unit_id: T-129
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl audit payloads preserve provider lineage and requested/effective adapter disclosure fields used
  for routing, projection, and audit visibility.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Traceability fields remain contract-owned.
- Requested/effective adapter and execution path fields remain available for routing/audit disclosure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_audit_traceability_adapter_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- 'firecrawl_scrape_id?: string'
- data.metadata.scrapeId
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- execution_path
- provider_search_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- projection_freshness
- projection_health
- warnings_count
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget, Plans/Contracts_V0.md#3.4 Tool-specific payload
  extensions, Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Permissions_System.md#3.4A Web-operation permission-key
  derivation, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-130 - Firecrawl Permission And Deployment Disclosure

```yaml
plan_unit_id: T-130
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM must not silently switch hosted/self-hosted Firecrawl, deployment mode remains visible, and web permission
  approval summaries defer to Permissions_System and approval-card owners.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-129
unblocks: []
acceptance_criteria:
- Six web tools remain independently visible and ask-gated unless stricter read-only/no-network presets deny them.
- Hosted/self-hosted deployment mode remains visible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_permission_deployment_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- PM MUST NOT silently switch
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- tool.denied
- tool.invoked
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- deny
- once
- for session
- always
- question default `allow` only when HITL is available
- read_only
- plan
- blocked_reason_code
- allowed_action_ids[]
- 'status: "unavailable"'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Permissions_System.md#3.4A Web-operation permission-key derivation'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4A
  Web error taxonomy and applicability'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-131 - Firecrawl Error Taxonomy And Retired Aliases

```yaml
plan_unit_id: T-131
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl HTTP and provider errors map to PM canonical error codes; unmapped `success: false` preserves provider
  detail in `error_message`; `stealth` and legacy `scrape_id` are retired.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-129
unblocks: []
acceptance_criteria:
- '`autonomous_budget_exceeded` remains a soft error with partial results.'
- Original provider detail is preserved in `error_message` for otherwise unmapped provider errors.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_error_taxonomy_retired_aliases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- crawl_timeout
- content_not_found
- invalid_input
- crawl_robots_blocked
- content_blocked
- content_too_large
- autonomous_budget_exceeded
- answer_summary
- sources_used_count
- research_steps
- stealth
- scrape_id (retired alias)
- error_message
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy Firecrawl/browser `stealth` configuration is retired for PM web tools.
- Legacy `scrape_id` is retired as an incorrect canonical field name and may appear only as transfer lineage.
owner_hints:
- Plans/Tools.md
```

### T-132 - Provider Stack And Firecrawl Defaults

```yaml
plan_unit_id: T-132
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Global provider ordering is Settings-configurable, per-operation priority override is not MVP, and Firecrawl
  identity/default state carry through without overriding section 10 canon.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-113
- T-114
unblocks: []
acceptance_criteria:
- Provider stack stays user-changeable in Settings.
- Firecrawl remains `firecrawl` / `Firecrawl`, below Exa/Tavily and above DDG, disabled until API key or self-hosted URL.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_stack_firecrawl_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- global provider stack
- per-operation priority reordering is NOT MVP
- Provider ID
- firecrawl
- Display name
- Firecrawl
- Default priority
- disabled (requires API key or self-hosted URL)
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Exact stale residue "stale cited-search framing and older `newtools` wording" remains retired.
owner_hints:
- Plans/Tools.md
```

### T-133 - Capability Tier Preservation

```yaml
plan_unit_id: T-133
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider capability tier is separate from routing posture; real provider fetch, research, and crawl capability
  is not erased by Site Reader primacy.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Firecrawl/Tavily/Exa `webfetch` do not collapse to `fallback-only`.
- Anthropic/OpenAI search stays `native (model)` / model-native.
- DuckDuckGo partial crawl behavior remains preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_capability_tier_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- capability-tier
- fallback-only
- native (model)
- pm_composed
- pm-composed
- native-ish
- near-native
- partial
- unsupported
- Site Reader primacy
- Firecrawl `webfetch` capability is not erased
- Tavily `webfetch` capability is not erased
- Exa `webfetch` capability is not erased
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-134 - Exa Same-Operation Fallback Disclosure

```yaml
plan_unit_id: T-134
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Exa free-plan routing can run without a user key, but rate-limit or outage falls to the next eligible same-operation
  provider with visible chat and audit disclosure.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`numResults=8` is preserved.'
- Rate-limit fallback does not hard-stop the operation.
- '`provider_fallback_summary` appears in chat activity and audit.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: exa_same_operation_fallback_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- free tier
- without an API key
- numResults=8
- provider_fallback_summary
- same operation
- PM does NOT stop
- Settings > Providers
- DuckDuckGo
- rate-limit
- outage
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-135 - DDG And Google Adapter Boundary

```yaml
plan_unit_id: T-135
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: DuckDuckGo is best-effort/no-key and Google is an optional pluggable adapter slot, not a strategic hard dependency.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DDG remains `native-ish` wrapper/scraping-based.
- Google display label stays `Google`.
- Official Google constraints and optional SERP adapter posture remain explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: ddg_google_adapter_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- DuckDuckGo
- /no-key
- Nipurn123/duckduckgo-mcp
- https://html.duckduckgo.com/html/?q=
- cheerio
- /nav/etc
- /strategic
- Google
- '2027-01-01'
- 100 free queries/day
- $5 per 1,000
- 10,000/day
- /search-provider
- Google Programmable Search / Custom Search JSON API
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-136 - Provider Settings Capability Disclosure

```yaml
plan_unit_id: T-136
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Settings, `/web` help, and autocomplete disclose provider availability, support tier, health/error, and last
  failure at row or badge level.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Help remains inline tooltip or below-field text, not a separate page.
- Provider classes remain `account-backed | API-backed | no-key`.
- Model-native providers do not expose a separate web-search API key field.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_settings_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- /web help/autocomplete
- support-tier badges
- /configuration/availability
- account-backed | API-backed | no-key
- enabled/disabled state
- provider priority / fallback order
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-137 - Tavily Settings Controls

```yaml
plan_unit_id: T-137
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tavily is an optional premium/official API-key provider with enable, API key, and provider priority at top
  level; advanced provider options stay behind an expandable Advanced section.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Top-level Settings expose only enable/disable, API key, and provider priority.
- Advanced section owns search depth, domain, time/news/topic/image/raw/chunk fields.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tavily_settings_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- Tavily
- API key
- Advanced
- search_depth
- max_results
- include_domains
- exclude_domains
- time_range
- /time-range
- topic
- include_images
- include_raw_content
- chunks_per_source
- provider priority ordering
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-138 - Tavily Search-Then-Extract Economics

```yaml
plan_unit_id: T-138
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tavily search returns candidate URLs/snippets first and may enrich later, but Tavily extract does not replace
  native Site Reader in MVP.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`include_raw_content` defaults conservative/false for discovery.'
- Free-tier/PAYG economics and `ultra-fast/fast/basic/advanced` values are preserved.
- Extract remains additive future enrichment only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tavily_search_extract_economics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- free tier = 1,000 credits/month
- $0.008/credit PAYG
- ultra-fast/fast/basic/advanced
- search-then-extract
- include_raw_content
- 'false'
- Tavily extract must NOT replace native Site Reader
- ADDITIVE
- not MVP
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-139 - Support Tier Vocabulary

```yaml
plan_unit_id: T-139
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Support tiers are canonical capability labels and `pm-composed` is display/source-lineage alias for stored
  `pm_composed`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All eight tier labels survive.
- Site Reader primacy remains routing posture, not capability erasure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: support_tier_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0104
preserved_exact_tokens:
- native
- native (model)
- native-ish
- near-native
- pm_composed
- pm-composed
- fallback-only
- partial
- unsupported
- Site Reader primacy
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-140 - Provider Operation Capability Matrix

```yaml
plan_unit_id: T-140
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Exa/Tavily/Firecrawl/Anthropic-OpenAI/Google/DDG operation matrix is canonical for `websearch` through
  `webmap`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-139
unblocks: []
acceptance_criteria:
- Matrix row values remain exact.
- '`fallback-only` cannot replace real fetch capability.'
- Unsupported map/crawl branches keep PM-composed conditions.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_operation_capability_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0105
preserved_exact_tokens:
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- partial native-ish / pm_composed
- unsupported unless PM composes it
- provider-native
- /deep-research
- search_and_crawl
- fallback-only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-141 - Model-Native Auth And Tool-Key Boundary

```yaml
plan_unit_id: T-141
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Model-native web search reuses configured provider account, auth, and model; `web_search` remains provider
  convention, not the PM tool key.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-140
unblocks: []
acceptance_criteria:
- No second auth silo is created for model-native search.
- Settings shows provider, effective account, model, auth, and rate-limit summary.
- PM tool key remains `websearch`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: model_native_auth_tool_key_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0105
preserved_exact_tokens:
- web_search
- websearch
- enabled toggle
- capability badges
- effective account label
- effective model
- auth state
- rate-limit summary
- second auth silo
- model-native
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-142 - Web Routing Selection And Recovery

```yaml
plan_unit_id: T-142
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Routing normalizes operation/input, checks permissions and capability registry, chooses an eligible same-operation
  adapter, and returns setup guidance or `adapter_unavailable` when exhausted.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-140
unblocks: []
acceptance_criteria:
- '`search_provider` is not exposed as a tool parameter.'
- Fallback records `provider_fallback_occurred` and `provider_fallback_summary`.
- All-provider failure returns `adapter_unavailable`, not a success-shaped fallback.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_routing_selection_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- capability-unavailable terminal branch
- 'Step 1: NORMALIZE OPERATION'
- 'Step 5: QUERY CAPABILITY MATRIX'
- search_provider
- NOT exposed
- adapter_unavailable
- provider_fallback_occurred
- provider_fallback_summary
- /rate-limit/outage
- /unconfigured
- success-shaped fallback
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-143 - Site Reader Identity And Browser Labels

```yaml
plan_unit_id: T-143
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`Reading Site: <url>` is reserved exclusively for PM-native Site Reader with browser interaction metadata,
  while provider fetch uses `Fetching Site: <url> (via <provider>)`.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Provider-routed fetch never reuses Site Reader identity.
- Browser interaction is metadata/sub-annotation, not a new activity label.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: site_reader_identity_browser_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- 'Reading Site: <url>'
- 'Fetching Site: <url> (via <provider>)'
- reserved EXCLUSIVELY
- real browser-interaction capability
- 'interaction: true'
- (with browser interaction)
- seventh web activity label
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-144 - Web Provenance And Citation Strength

```yaml
plan_unit_id: T-144
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Final claims cite the actual read/extract/research/crawl/map path, with search snippets allowed only as visibly
  snippet-level provenance.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
- T-143
unblocks: []
acceptance_criteria:
- Strongest provenance order is preserved.
- Repeated URLs and mapped page sets dedupe without losing strongest provenance badge.
- Snippet-only citations are labeled as snippet-level provenance.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_provenance_citation_strength
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- 'Searching Web: <query>'
- 'Extracting Site: <url>'
- 'Researching Web: <task>'
- 'Crawling Site: <url>'
- 'Mapping Site: <url>'
- site_reader
- site_extract
- research_synthesis
- crawl_result
- map_result
- search_snippet
- raw search snippets alone are not enough provenance
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-145 - Cost-Aware Routing And Completion Audit

```yaml
plan_unit_id: T-145
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Routing is cost-aware when providers are similar and completion records output, cache/diff, and audit metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Static priority alone is insufficient.
- '`>100 credits` warning and `500 credits` cap stay aligned.'
- '`cache_policy` and `change_tracking` completion behavior is preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: cost_aware_routing_completion_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- '>100 credits'
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- cache_policy
- change_tracking
- tool output contract
- audit events
- routing metadata
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-146 - NL Dispatcher And Cited Search Workflow

```yaml
plan_unit_id: T-146
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Natural-language and slash web intents share dispatcher mappings, and cited web search performs search, selected
  read/fetch, then final cited answer.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-142
- T-143
- T-144
unblocks: []
acceptance_criteria:
- Reading intents resolve to `webfetch`, not `websearch`.
- Command tables and routing docs mirror the same mappings.
- Provider helper names do not become PM-owned tool names.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: nl_dispatcher_cited_search_workflow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- '"search the web for X" → `websearch`'
- '"extract this page" → `webextract`'
- '"read this URL" → `webfetch`'
- '"research topic" → `webresearch`'
- cited-web-search
- legacy `cited-search`
- 'Web search: <query>'
- /webfetch
- /citations
- site/page reading is not search
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes:
- '`cited-search` is legacy wording only.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-147 - Research Lineage And Subagent Boundary

```yaml
plan_unit_id: T-147
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Source-specific research may use read-only sub-agents, but the main coordinator owns ledger updates and anonymized
  synthesis.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Sub-agents must not perform concurrent ledger writes.
- Topic and competitor lineage remains exact.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: research_lineage_subagent_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- topic-01
- topic-02
- topic-03
- topic-07
- topic-08
- topic-09
- topic-10
- topic-11
- topic-13
- topic-18
- topic-19
- topic-21
- topic-24
- topic-26
- topic-28
- topic-29
- topic-34
- topic-35
- topic-38
- topic-43
- topic-45
- competitor-cursor
- competitor-kiro
- competitor-vscode
- competitor-jetbrains
- /code/issue/community
- must not perform concurrent ledger writes
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-148 - Batch Error And Audit Semantics

```yaml
plan_unit_id: T-148
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Batch operations preserve explicit `continue_on_error: false` behavior and parent/child audit event shape.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`continue_on_error: false` stops on first failure and returns completed results plus failure detail.'
- Per-URL results preserve route-specific provenance and execution fields.
- '`action_results` remains excluded from batch outputs.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_error_audit_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
preserved_exact_tokens:
- 'continue_on_error: false'
- stop on the first failure
- return completed results plus failure detail
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- provenance_badge
- execution_path
- action_results
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-149 - Batch Permission Session Grant

```yaml
plan_unit_id: T-149
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: One approval prompt covers all unique domains in mixed-host batches and `For Session` grants all listed domains
  for that session.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No per-host prompts are created.
- Prompt lists every unique domain in scope.
- For Session grants all listed domains for that session.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_permission_session_grant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
preserved_exact_tokens:
- single confirmation prompt
- all unique domains
- mixed-host URL batches
- PM does not issue per-host prompts
- For Session
- per-host separate prompts
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-150 - Batch Inputs Concurrency And Timeout

```yaml
plan_unit_id: T-150
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Batch webfetch and batch webextract retain exact URL limits, shared option semantics, concurrency bounds,
  and locked timeout formula.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Batch webfetch maxes at 50 URLs with default concurrency 3 and max 10.
- Batch webextract maxes at 10 URLs with default concurrency 3 and max 10.
- Batch-level timeout remains `individual_timeout × min(url_count, 5)`, cap 600s.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_inputs_concurrency_timeout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:14
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:11
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:20
- Plans/Tools.md:623
- Plans/Tools.md:669
- Plans/Tools.md:2160
- Plans/Tools.md:2163
- Plans/Tools.md:2164
preserved_exact_tokens:
- 'urls: string[]'
- 'formats?: string[]'
- 'cache_policy?: object'
- 'change_tracking?: boolean'
- 'pdf_mode?: string'
- 'schema_mode?: string'
- 'detail_hint?: string'
- 'concurrency?: number'
- default 3
- max 10
- max 5
- individual_timeout × min(url_count, 5)
- 600s
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- The older batch_webextract max concurrency 5 line is stale; the accepted canonical max concurrency is 10.
owner_hints:
- Plans/Tools.md
```

### T-151 - Web Cache Two-Phase Adapter Validation

```yaml
plan_unit_id: T-151
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM web cache performs adapter-agnostic lookup before provider selection and validates `adapter_id` after selection,
  discarding mismatched hits.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`(url, formats_hash)` lookup precedes adapter choice.'
- Cache state vocabulary remains exact.
- Mismatched adapter hits are discarded before fresh fetch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_cache_two_phase_adapter_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0108
preserved_exact_tokens:
- (url, formats_hash)
- adapter_id
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- 'cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"'
- two-phase cache-check
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-152 - Web Cache Actions Diff And Storage Guardrails

```yaml
plan_unit_id: T-152
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Action requests bypass read-time cache but may store final results; PM cache precedes Firecrawl cache, and
  change tracking compares fresh content to prior entries.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-151
unblocks: []
acceptance_criteria:
- Per-project 500 MB, TTL, LRU, stable ordering, and change detection persistence are preserved.
- Question/questionnaire and TODO storage carry-through are not overwritten by web cache/activity payloads.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_cache_actions_diff_storage_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0108
preserved_exact_tokens:
- actions
- always fresh-execute
- Cache STORE
- PM cache takes precedence
- Firecrawl cache serves as provider-side optimization only
- 500 MB
- TTL
- LRU
- per-project
- 'change_tracking: true'
- content_hash
- 'change_status: "changed"'
- diff_summary
- 'change_status: "same"'
- 'change_status: "removed"'
- Question/questionnaire session state persistence
- TODO schema persistence
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-153 - Tools Web Owner Consumer Boundary

```yaml
plan_unit_id: T-153
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools remains the SSOT for tool-level web behavior, provider capability, and cache-routing while storage,
  provider bridge, newtools, and OpenCode surfaces remain narrower consumers or adjacent references.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Consumer docs reference Tools rather than restating tool definitions.
- Firecrawl/web obligations remain traceable.
- Stale permission/LSP/web-output markers are retired as owner text.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_web_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0109
preserved_exact_tokens:
- Tools are defined SSOT
- UI, CLI, Help, Permissions
- cache-routing / cache routing
- OpenCode billing and /caching
- HARDER
- '### 3.5C'
- '### 3.5D'
- '## 10'
- '### 10.3'
- '### 10.7'
- '### 11.1'
- '## 14'
- obl-013
- obl-014
- obl-041
- obl-053
- obl-054
- obl-062
- obl-066
- obl-067
- obl-029
- obl-040
- obl-043
- obl-068
- /LSP/web-output
- /web-output/LSP/permission
- legacy `web-output`
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale permission, LSP, and web-output carry-through markers such as `/LSP/web-output`, `/web-output/LSP/permission`, and
  legacy `web-output` phrasing are retired as owner text.
owner_hints:
- Plans/Tools.md
```

### T-154 - Blocked Notice Consumer Propagation

```yaml
plan_unit_id: T-154
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked surfaces must carry richer `blocked_notice` semantics beyond `blocked_family` and `allowed_action_ids[]`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`escalation_level`, `action_available` ownership, and usage observability are carried through blocked_notice handling.'
- '`allowed_action_ids[]` remains subordinate to richer blocked_notice semantics if present.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: blocked_notice_consumer_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0111
preserved_exact_tokens:
- blocked_notice
- blocked_family
- allowed_action_ids[]
- escalation_level
- action_available
- usage observability
- subordinate
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-155 - Tool Attribution Runtime Identity Shape

```yaml
plan_unit_id: T-155
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool records share one attribution family across tool events, runtime artifacts, receipts, and usage records.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Run, attempt, thread, node, artifact, provider, and usage anchors plus runtime identity fields are carried.
- Execution-role, account-switch, pressure, blocked-sequence, startup recovery, DAE, and usage switch-history ownership follow
  through.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_attribution_runtime_identity_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0113
preserved_exact_tokens:
- run/attempt/thread/node/artifact/provider/usage
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure
- blocked_sequence
- startup recovery handshake
- DAE jail/approval policy
- usage switch-history
- usage execution-role follow-through
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-156 - Tools Migration Owner Map Boundary

```yaml
plan_unit_id: T-156
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Source-preserving standardization keeps Tools owner/consumer boundaries in the original body text while cross-doc
  ownership follows ContractRefs and boundary notes.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`Plans/Tools.md` remains owner for preserved behavior.'
- Plan Document System and Bootstrap Migration refs stay attached.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_migration_owner_map_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0114
preserved_exact_tokens:
- source-preserving standardization
- Plans/Tools.md remains the owner doc
- cross-doc ownership follows the ContractRefs
- Owner / Consumer Map
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-001 - Adding Tool Support Generated Artifact Residual

```yaml
plan_unit_id: T-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Tools.md
canonical_text: >-
  T-001 is retired as active source-preserving product coverage after Phase 2B batch 187. Tools-S0001 through
  Tools-S0115 are covered by fine-grained T-002 through T-156 or explicit structural/split coverage, while Tools-S0116
  through Tools-S0117 are generated PlanUnits and Migration Coverage audit material. T-001 remains only a generated-artifact
  residual for migration lineage and must not override implementation-facing Tools PlanUnits.
gui_related: true
gui_classification_reason: >-
  The retired generated residual preserves GUI-bearing historical bridge metadata from Tools-S0116, but the live T-001
  disposition is migration/audit lineage rather than product GUI coverage.
split_recommended: false
depends_on:
- T-002
- T-003
- T-004
- T-005
- T-006
- T-007
- T-008
- T-009
- T-010
- T-011
- T-012
- T-013
- T-014
- T-015
- T-016
- T-017
- T-018
- T-019
- T-020
- T-021
- T-022
- T-023
- T-024
- T-025
- T-026
- T-027
- T-028
- T-029
- T-030
- T-031
- T-032
- T-033
- T-034
- T-035
- T-036
- T-037
- T-038
- T-039
- T-040
- T-041
- T-042
- T-043
- T-044
- T-045
- T-046
- T-047
- T-048
- T-049
- T-050
- T-051
- T-052
- T-053
- T-054
- T-055
- T-056
- T-057
- T-058
- T-059
- T-060
- T-061
- T-062
- T-063
- T-064
- T-065
- T-066
- T-067
- T-068
- T-069
- T-070
- T-071
- T-072
- T-073
- T-074
- T-075
- T-076
- T-077
- T-078
- T-079
- T-080
- T-081
- T-082
- T-083
- T-084
- T-085
- T-086
- T-087
- T-088
- T-089
- T-090
- T-091
- T-092
- T-093
- T-094
- T-095
- T-096
- T-097
- T-098
- T-099
- T-100
- T-101
- T-102
- T-103
- T-104
- T-105
- T-106
- T-107
- T-108
- T-109
- T-110
- T-111
- T-112
- T-113
- T-114
- T-115
- T-116
- T-117
- T-118
- T-119
- T-120
- T-121
- T-122
- T-123
- T-124
- T-125
- T-126
- T-127
- T-128
- T-129
- T-130
- T-131
- T-132
- T-133
- T-134
- T-135
- T-136
- T-137
- T-138
- T-139
- T-140
- T-141
- T-142
- T-143
- T-144
- T-145
- T-146
- T-147
- T-148
- T-149
- T-150
- T-151
- T-152
- T-153
- T-154
- T-155
- T-156
unblocks: []
acceptance_criteria:
- Tools-S0001 through S0115 remain mapped to fine-grained Tools PlanUnits or explicit structural dispositions rather than
  T-001.
- Tools-S0116 through S0117 remain available as generated PlanUnits and Migration Coverage audit material only.
- T-001 no longer uses node_compile_hint.mode source_preserving_planunit; that token is preserved only as migration lineage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source
  code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: tools_generated_residual_tail
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0116
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0117
preserved_exact_tokens:
- source_preserving_planunit
- generated_artifact_residual
- Migration Coverage
- PlanUnits
- Tools-S0116
- Tools-S0117
- T-001 - Adding Tool Support -- Research & Plan Source-Preserving PlanUnit
- T-001 - Adding Tool Support Generated Artifact Residual
- Migration Coverage
negative_constraints:
- T-001 must not provide product implementation coverage for Tools-S0001 through Tools-S0115 after Phase 2B batch 186.
- T-001 must not override T-002 through T-156 or later fine-grained Tools PlanUnits.
- T-001 must not use source_preserving_planunit compile mode after Phase 2B batch 187.
preserved_contractrefs:
- Generated PlanUnits and Migration Coverage material remain preserved by span_map and coverage_map as migration-lineage audit
  material.
compatibility_only_notes:
- The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint
  mode.
- The old Tools T-001 bridge title is a compatibility alias for audit and search only.
stale_retired_dispositions:
- The former T-001 source-preserving bridge is retired as active product coverage; product coverage lives in T-002 through
  T-156 and coverage_map rows.
- Generated Tools-S0116 through Tools-S0117 are not product implementation canon.
owner_hints:
- Plans/Tools.md
```
