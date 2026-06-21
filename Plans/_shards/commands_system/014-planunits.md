# Shard 014: PlanUnits

Source: `Plans/Commands_System.md`

Source lines: L690-L3407

Source SHA256: `22dd09e99960560bd60cf5022e9bbc8ce19050021d1898510cc37c138dff2864`

---

## PlanUnits

### CS-002 - Command SSOT Authority and Legacy Retirements

```yaml
plan_unit_id: CS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System.md is the single canonical source of truth for Puppet Master
  User Commands, and adjacent docs must reference its anchors rather than
  restating command definitions, discovery paths, template syntax, or execution
  semantics; legacy phase_subagents and provider-native command-name assumptions
  remain replace-only migration labels.
gui_related: false
gui_classification_reason: Command SSOT authority and legacy retirement constraints are canonical ownership semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: [CS-003, CS-010, CS-012]
acceptance_criteria:
  - Commands_System.md remains the single canonical source of truth for User Commands.
  - Other plan documents reference command definitions, discovery paths, template syntax, and execution semantics by anchor.
  - User Commands may surface /resume only by reference to Assistant Chat and storage SSOTs.
  - User Commands MUST NOT define a separate restore/resume storage schema.
  - Legacy phase_subagents and provider-native command-name assumptions remain /replace-only migration labels and do not remain active beside the Persona-stage command contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_ssot_drift
reasoning_tier: high
context_scope: commands_system_authority
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_ssot_authority
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0003
preserved_exact_tokens:
  - "Puppet Master"
  - "single canonical source of truth"
  - "Plans/Commands_System.md#COMMAND-SCHEMA"
  - "/resume"
  - "phase_subagents"
  - "provider-native `command-name`"
  - "/replace"
negative_constraints:
  - "User Commands MUST NOT define a separate restore/resume storage schema."
  - "Legacy phase_subagents and provider-native command-name assumptions MUST NOT remain active beside the Persona-stage command contract."
owner_hints:
  - Plans/Commands_System.md
```

### CS-003 - Command SSOT Reference Map

```yaml
plan_unit_id: CS-003
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands System reference map names the external owner documents that
  command behavior consumes, including locked decisions, contracts, DRY rules,
  glossary terms, deterministic ambiguity handling, UICommand IDs, reserved
  slash commands, run modes, Personas, permissions, tools, OpenCode extraction,
  and GUI specification.
gui_related: true
gui_classification_reason: The reference map includes user-visible slash commands, UICommand dispatch IDs, and GUI specification consumers.
split_recommended: false
depends_on: [CS-002]
unblocks: [CS-004, CS-006, CS-011]
acceptance_criteria:
  - SSOT references include Spec_Lock, Contracts_V0, DRY_Rules, Glossary, Decision_Policy, and auto_decisions.
  - UICommand dispatch IDs are routed to Plans/UI_Command_Catalog.md.
  - Reserved slash commands are routed to Plans/assistant-chat-design.md section 5.
  - Run modes, Personas, Permissions, Tools, OpenCode baseline, and FinalGUISpec remain referenced instead of duplicated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_reference_map_drift
reasoning_tier: standard
context_scope: commands_system_references
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: command_ssot_reference_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0004
preserved_exact_tokens:
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/UI_Command_Catalog.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/Run_Modes.md"
  - "Plans/Personas.md"
  - "Plans/Permissions_System.md"
  - "Plans/Tools.md"
  - "Plans/OpenCode_Deep_Extraction.md"
  - "Plans/FinalGUISpec.md"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-004 - Backend and Provider Owner Deferral

```yaml
plan_unit_id: CS-004
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  User Commands consume but do not re-own adjacent MCP, context, storage, retry,
  provider, OpenCode, launcher, and binary-location runtime contracts; command
  loading and invocation may surface owner-projected values without rebinding
  credential custody, context compilation, persistence, recovery taxonomy,
  account health, thread mapping, or launcher identity.
gui_related: false
gui_classification_reason: Owner deferral for provider, storage, context, retry, and launcher semantics is backend/runtime governance.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes backend owner boundaries with chat, route, palette, widget, and GUI-facing consumer constraints.
depends_on: [CS-002, CS-003]
unblocks: [CS-005, CS-006, CS-007, CS-009]
acceptance_criteria:
  - MCP prompt and tool OAuth flows defer /token custody, refresh, retry, and shared local HTTP listener ownership to Tools/MCP owner docs.
  - Context behavior treats LF-006 and LF-007 as stale-residue or wrong-owner-routing failures when detailed context compilation is routed to FileSafe instead of Prompt_Pipeline.
  - Storage and migration paths use the owner detection order config > $PUPPET_MASTER_DATA_DIR > project dir > global dir without moving path-resolution semantics out of storage-plan.
  - 429, 402, and /breaker behavior remains owned by CLI_Bridged_Providers, Executor_Protocol, and Run_Modes.
  - Provider account-health and OpenCode thread_id opacity remain owner-projected and are not collapsed into command-local credential state.
  - Launcher and binary-location context treats four-tier, process-scope wording, and /session-scope wording as stale compatibility labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_owner_boundary_drift
reasoning_tier: high
context_scope: command_provider_runtime_boundaries
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Run_Modes.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: command_backend_provider_owner_deferral
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "/token"
  - "LF-006"
  - "LF-007"
  - "config > $PUPPET_MASTER_DATA_DIR > project dir > global dir"
  - "429"
  - "402"
  - "/breaker"
  - "client-id"
  - "thread_id"
  - "four-tier"
  - "/session-scope"
negative_constraints:
  - "Commands may not re-own credential custody, context compilation, persistence, retry taxonomy, provider account-health, OpenCode account identity, or launcher identity."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### CS-005 - Chat Message and Question-Flow Command Boundaries

```yaml
plan_unit_id: CS-005
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command presets consume Assistant Chat message actions and shared question
  lifecycle behavior without redefining Resend, retry, rewind, file restore, or
  clarification-request semantics.
gui_related: true
gui_classification_reason: Resend and question-flow behavior are user-visible chat and wizard interaction semantics.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes visible chat/question behavior with backend owner boundaries.
depends_on: [CS-004]
unblocks: [CS-006, CS-011]
acceptance_criteria:
  - Resend replays the latest user-authored message and discards later generated history/work.
  - Command presets do not redefine Resend as generic retry, rewind, or file-restore.
  - Clarification-request and question-flow behavior defer to assistant-chat-design and chain-wizard-flexibility.
  - Commands may launch or reference question flows but do not define a separate question lifecycle.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_command_boundary_drift
reasoning_tier: high
context_scope: command_chat_question_boundaries
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: command_chat_question_flow_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "Resend"
  - "question-flow"
  - "clarification-request"
negative_constraints:
  - "Command presets must not redefine Resend as generic retry, rewind, or file-restore."
  - "Commands do not define a separate question lifecycle."
owner_hints:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### CS-006 - Registry Route Palette and Argument Contracts

```yaml
plan_unit_id: CS-006
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-contract reconciliation is registry-facing: User Commands may invoke
  or display route-like UICommands, palette object results, navigation wrappers,
  and subject-open commands only when cmd.* IDs, validation hooks, route_target
  payloads, /subject semantics, and argument-contract requirements remain owned
  by Contracts_V0, UI_Command_Catalog, and UI_Wiring_Rules.
gui_related: true
gui_classification_reason: Route-like UICommands, command palette object results, navigation wrappers, and subject-open commands drive visible UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes registry, route, palette, navigation, and backend runtime owner constraints.
depends_on: [CS-003, CS-005]
unblocks: [CS-007, CS-008, CS-011, CS-013]
acceptance_criteria:
  - /compact stays reserved when cmd.chat.compact_context exists.
  - cmd.chat.run_user_command cannot claim chat.message.submitted unless the event owner registers it.
  - cmd.chat.branch_from_restore remains invalid until registered or marked /superseded.
  - Route-like commands normalize object identity through route_target, /route, or /subject contracts before carrying object identity.
  - cmd.panel.switch and cmd.source_control.switch_subview remain pure /view state commands with controlled destination vocabularies.
  - Palette object results route through the deep-link contract and shared route_target or subject-open family.
  - Schema-level argument-contract requirements are not hidden in generic args.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_registry_route_drift
reasoning_tier: high
context_scope: command_registry_route_contracts
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: command_registry_route_palette_contracts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "cmd.chat.run_user_command"
  - "chat.message.submitted"
  - "cmd.chat.branch_from_restore"
  - "route_target"
  - "/subject"
  - "argument-contract"
  - "cmd.panel.switch"
  - "cmd.source_control.switch_subview"
negative_constraints:
  - "Commands must not let feature-local labels become private target models."
  - "Object identity must not be smuggled through generic command-local payloads."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
```

### CS-007 - Runtime Identity and Execution-Core Projection

```yaml
plan_unit_id: CS-007
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-facing runtime identity is owner-projected from Prompt_Pipeline,
  storage, executor, multi-account, bridged-provider, and execution-core owners;
  Commands may launch or display execution actions but must not revive tier-era
  execution context, TierContext, tier_runtime_record, requested/effective
  account history, or runtime ownership through command frontmatter.
gui_related: false
gui_classification_reason: Runtime identity and execution-core projection are backend execution-context semantics.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes runtime identity projection with route and GUI-facing consumer rules.
depends_on: [CS-004, CS-006]
unblocks: [CS-008, CS-020]
acceptance_criteria:
  - Requested/effective field meaning, /runtime, dispatch presence, persistence, /projection, and account history stay with their owner docs.
  - Projection trust/freshness and /freshness vocabulary remain separate from preview /browser trust_tier language.
  - persona_override_owner_id and requested_account_binding are owner-projected runtime identity, not command-local state.
  - TierContext and tier_runtime_record may survive only as derived decomposition, grouping, view, current-view, current-view/runtime-overlay, or /runtime-overlay projections.
  - Execution-core owners must reconcile node-native execution, graph/package/seam/lane/runtime-record language, blocked overlays, and execution_unit_context before Commands treats runtime context as canonical command input.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_runtime_identity_drift
reasoning_tier: high
context_scope: command_runtime_projection
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: command_runtime_identity_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "requested/effective"
  - "/runtime"
  - "/projection"
  - "trust_tier"
  - "/browser"
  - "persona_override_owner_id"
  - "requested_account_binding"
  - "TierContext"
  - "tier_runtime_record"
  - "execution_unit_context"
negative_constraints:
  - "Commands must not invent alternate requested/effective account history or erase switch notifications."
  - "TierContext and tier_runtime_record must not act as rewrite-era canonical execution context."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/Executor_Protocol.md
```

### CS-008 - Widget Artifact Checklist Availability and Confirmation Consumers

```yaml
plan_unit_id: CS-008
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands may expose widget, native-surface, artifact, checklist, availability,
  summary, and mutation entries only as owner-routed consumers that preserve
  widget trust, artifact provenance, checklist freshness, availability classes,
  alias/deprecation gates, stale or degraded projection revalidation, and
  confirmation requirements for strong or non-reversible actions.
gui_related: true
gui_classification_reason: Widgets, native surfaces, artifact panels, command-palette summaries, badges, and confirmation gates are visible user-facing surfaces.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes GUI-facing consumer constraints with backend mutation and availability gates.
depends_on: [CS-006, CS-007]
unblocks: [CS-013]
acceptance_criteria:
  - Widget_System owns chrome slots, /trust-state, projection-trust semantics, hostability, tab-boundary direction, and risky widget config boundaries.
  - Runtime_Artifacts_Panel owns artifact-type semantics, panel behavior, schema family references, and artifact evidence/provenance.
  - Section15_MVP_Promoted_Features_Spec remains verification-only unless upstream reconciliation requires direct edits.
  - GATE-010 evaluates subject-open commands, wrappers, route-payload completeness, alias /deprecation, blocked-action admissibility, allowed_action_ids, and stale or /degraded projection revalidation.
  - Command definitions and UICommands declare live-run only, historical-safe, or record-only/export-only before palette, shortcut, or route dispatch.
  - strong, hard_gate, non_reversible, and compensating_action_only actions preserve owner-defined confirmation, gating, preview, and blocked-action checks before dispatch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_consumer_surface_drift
reasoning_tier: high
context_scope: command_widget_artifact_confirmation_consumers
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: command_widget_artifact_confirmation_consumers
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "/trust-state"
  - "/completed/integration"
  - "/historical-run"
  - "GATE-010"
  - "allowed_action_ids"
  - "live-run only"
  - "historical-safe"
  - "record-only/export-only"
  - "strong"
  - "hard_gate"
  - "non_reversible"
  - "compensating_action_only"
negative_constraints:
  - "Commands must not define a parallel widget trust schema, widget-local state classification, artifact schema family, or stale Tiers scope through command metadata."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CS-009 - Debug and Launcher Command Boundary

```yaml
plan_unit_id: CS-009
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-facing Debug terminology distinguishes DAP debugging, agentic
  app/runtime investigation, and assistant-session inspection; any command that
  requests wrapper-script, launcher-file, launch-command/env, external-directory,
  degraded-runtime, or browser-health-sensitive actions must preserve revert
  paths and central permission/capability gate routing.
gui_related: false
gui_classification_reason: Debug terminology, launcher mutation cleanup, and permission/capability gates are runtime and policy behavior.
split_recommended: false
depends_on: [CS-004]
unblocks: []
acceptance_criteria:
  - Debug terminology does not collapse classical DAP debugging, agentic app/runtime investigation, and assistant-session inspection.
  - Wrapper script, /launcher file, or /launch-command/env edits record an exact revert path.
  - Cleanup restores from a restore point or generated revert patch.
  - External directory access outside the active policy /allowlist resolves through central permission/capability gates.
  - Actions unavailable or degraded for the active runtime or /browser health state resolve through central permission/capability gates before command injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_launcher_boundary_drift
reasoning_tier: high
context_scope: command_debug_launcher_boundary
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: command_debug_launcher_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0006
preserved_exact_tokens:
  - "Debug"
  - "/launcher"
  - "/launch-command/env"
  - "/allowlist"
  - "/browser"
negative_constraints:
  - "Command templates may request launcher cleanup workflow, but they do not themselves become persistent launcher owners."
owner_hints:
  - Plans/Commands_System.md
```

### CS-010 - User Command Definition

```yaml
plan_unit_id: CS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A User Command is a user-authored or catalog-installed Markdown preset with
  YAML frontmatter whose resolved template body is submitted to the active chat
  thread or run as a repeatable prompt workflow.
gui_related: false
gui_classification_reason: The User Command definition is data/model semantics for command presets.
split_recommended: true
split_recommendation_reason: Source span S0008 includes the next anchor for UICommand distinction, so lineage is shared with CS-011.
depends_on: [CS-002]
unblocks: [CS-011, CS-014]
acceptance_criteria:
  - DEF-USER-COMMAND remains the anchor for the User Command definition.
  - User Commands are user-authored or catalog-installed command presets stored as Markdown files with YAML frontmatter.
  - Invocation resolves placeholders, file includes, and shell output injection before submission.
  - User Commands package repeatable prompt workflows without requiring code.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: user_command_definition_drift
reasoning_tier: standard
context_scope: command_definitions
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: user_command_definition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0008
preserved_exact_tokens:
  - "DEF-USER-COMMAND"
  - "User Command"
  - "YAML frontmatter"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-011 - UICommand Distinction and Invocation Surfaces

```yaml
plan_unit_id: CS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  UICommands are developer-defined internal dispatch identifiers distinct from
  user-authored User Commands; User Commands may be invoked from Assistant chat,
  the command palette, and optional Orchestrator shortcut triggers through the
  command execution seam without becoming UICommand definitions.
gui_related: true
gui_classification_reason: UICommand dispatch, slash autocomplete, command palette entries, and shortcut triggers are visible UI interaction surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0008 and S0010 mix definition anchors with visible invocation surfaces.
depends_on: [CS-006, CS-010]
unblocks: [CS-013, CS-022]
acceptance_criteria:
  - DEF-UICOMMAND-DISTINCTION remains the anchor for UICommand distinction.
  - UICommands are stable IDs that bind UI elements to handlers and are developer-defined, code-registered, and wiring-matrix-verified.
  - User Commands are content presets and UICommands are internal dispatch actions.
  - User Command invocation ultimately dispatches cmd.chat.run_user_command without making the User Command itself a UICommand.
  - Assistant chat uses slash-command prefix / with custom /x-<command-name> support.
  - Command palette entries appear as Run command: <name>.
  - Orchestrator shortcut trigger keybindings remain optional via Settings > Shortcuts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: uicommand_user_command_conflation
reasoning_tier: high
context_scope: command_invocation_surfaces
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: uicommand_distinction_invocation_surfaces
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0010
preserved_exact_tokens:
  - "DEF-UICOMMAND-DISTINCTION"
  - "UICommand"
  - "cmd.chat.run_user_command"
  - "project-local `/symbols/commands/other`"
  - "Run command: <name>"
  - "Settings > Shortcuts"
negative_constraints:
  - "User Commands are not user-authored UICommands."
  - "File tree actions and editor/file operations use canonical UICommands, not user-authored command presets."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-012 - Command Storage Roots and Resolution

```yaml
plan_unit_id: CS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  User Command files use a deterministic project-local and global two-tier
  layout where project-local commands override global commands by name and
  unresolved command names surface the exact Unknown command error.
gui_related: false
gui_classification_reason: Command file storage roots and resolution order are filesystem and lookup semantics.
split_recommended: false
depends_on: [CS-002]
unblocks: [CS-013, CS-014]
acceptance_criteria:
  - STORAGE-LAYOUT remains the anchor for User Command storage layout.
  - Project-local commands live at <project_root>/.puppet-master/commands/<name>.md and are available only when that project is active.
  - Global commands live at ~/.config/puppet-master/commands/<name>.md and are overridden by a project-local command with the same name.
  - Resolution checks project-local commands first, global commands second, and returns unresolved when neither path exists.
  - Unresolved invocation surfaces display "Unknown command: <name>".
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_storage_resolution_drift
reasoning_tier: standard
context_scope: command_storage_discovery
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: command_storage_roots_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0014
preserved_exact_tokens:
  - "STORAGE-LAYOUT"
  - "<project_root>/.puppet-master/commands/<name>.md"
  - "~/.config/puppet-master/commands/<name>.md"
  - "Unknown command: <name>"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/storage-plan.md
```

### CS-013 - Reserved Names Collisions and Name Validation

```yaml
plan_unit_id: CS-013
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Reserved built-in slash commands and their families cannot be overridden by
  provider, skill, plugin, extension, natural-language, or custom User Command
  names; command creation also enforces the canonical lowercase name regex and
  disambiguates /mode by owner context.
gui_related: false
gui_classification_reason: Reserved-name collision handling and regex validation are command registry and schema constraints.
split_recommended: false
depends_on: [CS-011, CS-012]
unblocks: [CS-014, CS-016]
acceptance_criteria:
  - /web reserves the family namespace for /web search, /web fetch, /web extract, /web research, /web crawl, and /web map.
  - override_builtin: true is /forbid for reserved Assistant Chat built-ins and cannot override /web, /skill, /cancel, /clear, /stop, or canonical chat commands.
  - /web commands are network /external-read operations, not /shell mutation commands.
  - /worktree is reserved and cannot be re-bound by a custom command.
  - /skill cannot be rebound by User Commands or override_builtin.
  - /plugins remains plugin-management/navigation, not a User Command namespace.
  - Natural-language and slash dispatch share the same dispatcher collision handling.
  - GPT-era registry audits do not create new event names by observation.
  - Ask /Plan behavior for command-triggered tools follows Run_Modes and Permissions_System permission rows.
  - Names match ^[a-z][a-z0-9_-]{0,48}[a-z0-9]$ and length 2-50 characters.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_reserved_name_drift
reasoning_tier: high
context_scope: command_name_validation
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_reserved_name_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0017
preserved_exact_tokens:
  - "/web"
  - "/web search"
  - "/web fetch"
  - "/web extract"
  - "/web research"
  - "/web crawl"
  - "/web map"
  - "override_builtin: true"
  - "/forbid"
  - "/worktree"
  - "/skill"
  - "/plugins"
  - "chat.thread.created"
  - "chat.thread_created"
  - "chat.message.submitted"
  - "^[a-z][a-z0-9_-]{0,48}[a-z0-9]$"
negative_constraints:
  - "Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming."
  - "GPT-era registry audits do not create new event names by observation."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
```

### CS-014 - Command File Schema and Frontmatter Fields

```yaml
plan_unit_id: CS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A User Command file consists of YAML frontmatter plus a Markdown template body,
  with canonical fields for name, description, arguments, persona/model/mode
  overrides, permissions_profile_override, and override_builtin.
gui_related: false
gui_classification_reason: Command schema and frontmatter field definitions are file-format semantics.
split_recommended: false
depends_on: [CS-013]
unblocks: [CS-015, CS-018, CS-020]
acceptance_criteria:
  - COMMAND-SCHEMA remains the anchor for User Command file structure.
  - Frontmatter examples preserve description, persona, mode, model, subtask, permissions_profile_override, and override_builtin.
  - name is required, must pass validation, and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes.
  - description is required and remains a short user-facing description.
  - arguments remains an optional array<object> for positional argument schema.
  - persona_override, mode_override, model_override, and permissions_profile_override remain requested overrides subject to their owner systems.
  - override_builtin remains reserved for future non-chat extension points and MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_schema_drift
reasoning_tier: standard
context_scope: command_file_schema
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: command_file_schema_frontmatter
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0020
preserved_exact_tokens:
  - "COMMAND-SCHEMA"
  - "YAML frontmatter"
  - "description"
  - "persona"
  - "mode"
  - "model"
  - "subtask"
  - "permissions_profile_override"
  - "override_builtin"
negative_constraints:
  - "name MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes."
  - "override_builtin MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes."
owner_hints:
  - Plans/Commands_System.md
```

### CS-015 - Template Body and Placeholder Semantics

```yaml
plan_unit_id: CS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Markdown template body supports placeholders, file includes, and shell
  output injection; placeholder extraction scans for $ARGUMENTS and $N patterns,
  stores extracted hints for autocomplete display, and replaces unresolved
  placeholders with an empty string.
gui_related: false
gui_classification_reason: Template body and placeholder expansion are command template processing semantics.
split_recommended: true
split_recommendation_reason: Source span S0022 also carries the TEMPLATE-FILE-INCLUDE anchor consumed by CS-016.
depends_on: [CS-014]
unblocks: [CS-016, CS-017, CS-024]
acceptance_criteria:
  - TEMPLATE-PLACEHOLDERS remains the anchor for placeholder semantics.
  - The template body supports placeholders, file includes, and shell output injection.
  - $ARGUMENTS represents all remaining text after the command name.
  - $1, $2, and $N represent positional arguments from invocation text.
  - Load-time extraction scans for $ARGUMENTS and $N patterns and stores the extracted list as hints for autocomplete display.
  - Unresolved placeholders are replaced with empty string.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_template_placeholder_drift
reasoning_tier: standard
context_scope: command_template_resolution
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_template_placeholders
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0022
preserved_exact_tokens:
  - "TEMPLATE-PLACEHOLDERS"
  - "$ARGUMENTS"
  - "$1"
  - "$2"
  - "$N"
  - "hints"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-016 - File Include Resolution and Read Permission Guard

```yaml
plan_unit_id: CS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template file includes use @path and directory listing expansion, then enforce
  the Permissions System read permission key so denied includes are blocked,
  ask results show approval UI, and blocked includes substitute an error.
gui_related: true
gui_classification_reason: File include permission handling can surface approval UI and visible blocked-include errors.
split_recommended: true
split_recommendation_reason: Source spans S0022, S0023, and S0034 share anchors and permission behavior with placeholder and shell-injection units.
depends_on: [CS-013, CS-015]
unblocks: [CS-017, CS-024]
acceptance_criteria:
  - TEMPLATE-FILE-INCLUDE remains the anchor for file include semantics.
  - "@path/to/file includes the referenced file contents during template resolution."
  - "@path/to/dir includes a directory listing."
  - File inclusion checks the read permission key from Permissions_System section 5.
  - deny blocks the include and substitutes an error message.
  - ask shows the approval UI and applies the same ask flow semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_file_include_permission_drift
reasoning_tier: high
context_scope: command_template_permission_guards
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_file_include_permission_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0034
preserved_exact_tokens:
  - "TEMPLATE-FILE-INCLUDE"
  - "@path"
  - "@path/to/file"
  - "@path/to/dir"
  - "read"
  - "ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys"
negative_constraints:
  - "Denied file inclusion must be blocked and substituted with an error message."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-017 - Shell Injection Resolution and Bash Permission Guard

```yaml
plan_unit_id: CS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template shell output injection uses the !`shell-command` pattern and enforces
  the Permissions System bash key and ask flow, including actor/lane/run/account
  scope, blocked-overlay/HITL routing for underspecified context, and unified
  ask/plan plus external_publish_side_effect approval calculation.
gui_related: true
gui_classification_reason: Shell injection permission prompts and blocked overlays are visible approval/HITL UI behavior.
split_recommended: true
split_recommendation_reason: Source spans S0023, S0024, S0032, and S0033 share template and permission-section anchors with adjacent units.
depends_on: [CS-015, CS-016]
unblocks: [CS-024]
acceptance_criteria:
  - TEMPLATE-SHELL-INJECTION remains the anchor for shell output injection.
  - The pattern !`shell-command` executes the shell command and injects stdout during template resolution.
  - Shell injection checks the bash permission key from Permissions_System section 5.
  - deny, once, for session, and always responses follow Permissions_System ask flow semantics.
  - The shell command string is the invocation context for granular pattern matching.
  - Command-launched work, template file inclusion, and shell injection pass actor/lane/run/account and /lane/run/account scope.
  - Underspecified context presents blocked-overlay/HITL routing rather than pretending a global approval or denial is safe.
  - ask/plan and external_publish_side_effect resolve through one canonical approval calculation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_shell_permission_drift
reasoning_tier: high
context_scope: command_template_permission_guards
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_shell_injection_permission_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0033
preserved_exact_tokens:
  - "TEMPLATE-SHELL-INJECTION"
  - "!`shell-command`"
  - "bash"
  - "once"
  - "for session"
  - "always"
  - "deny"
  - "actor/lane/run/account"
  - "/lane/run/account"
  - "ask/plan"
  - "external_publish_side_effect"
negative_constraints:
  - "A command must not resolve publish, durable mutation, or plan approval through separate command-template text."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-018 - Command Working Directory Resolution

```yaml
plan_unit_id: CS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command execution resolves the active working directory to the bound worktree
  root when execution context has is_worktree true and otherwise to the active
  project root, applying consistently to Assistant Chat, Orchestrator DAE,
  terminal sessions, and file operations.
gui_related: false
gui_classification_reason: Working directory resolution is command execution runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 also includes visible path-card and terminal cwd behavior covered by CS-019.
depends_on: [CS-014]
unblocks: [CS-019, CS-020]
acceptance_criteria:
  - EXECUTION remains the anchor for command execution semantics.
  - If active context has a bound worktree with is_worktree true, commands use the worktree root path.
  - Otherwise commands use the active project root.
  - Assistant Chat, Orchestrator DAE, terminal sessions, and file operations share this resolution rule.
  - cmd.chat.* commands execute against the worktree root when a thread has a bound worktree, and against project root otherwise.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_working_directory_drift
reasoning_tier: high
context_scope: command_execution_context
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_working_directory_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0026
preserved_exact_tokens:
  - "EXECUTION"
  - "is_worktree"
  - "worktree root path"
  - "active project root"
  - "cmd.chat.*"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-019 - Assistant Worktree Naming Path Display and Terminal CWD

```yaml
plan_unit_id: CS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Assistant worktree commands use thread-derived worktree directory names,
  append numeric suffixes for collisions, show edit and file-card paths relative
  to the resolved working_directory, and persist terminal cwd snapshots from
  the worktree path.
gui_related: true
gui_classification_reason: Edit and file-card path display is user-visible, and terminal sessions expose cwd behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 mixes backend working-directory resolution with visible path display and terminal session behavior.
depends_on: [CS-018]
unblocks: []
acceptance_criteria:
  - Assistant thread worktrees use .puppet-master/worktrees/thread-{short_id}, where short_id derives from the bound thread_id.
  - If thread-{short_id} already exists, command handling appends a numeric suffix such as thread-{short_id}-2.
  - Existing orchestrator worktrees keep .puppet-master/worktrees/{tier_id} style directory names as compatibility lineage.
  - Worktree-bound edit and file cards display paths relative to the resolved working_directory.
  - File cards open by resolving the displayed relative path under working_directory with no special path rewriting layer.
  - Terminal commands opened from the same thread set terminal cwd to the worktree path and persist cwd_snapshot on terminal_session_record.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_command_drift
reasoning_tier: high
context_scope: command_execution_context
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_command_display_cwd
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0026
preserved_exact_tokens:
  - ".puppet-master/worktrees/{tier_id}"
  - ".puppet-master/worktrees/thread-{short_id}"
  - "thread-{short_id}-2"
  - "working_directory"
  - "cwd_snapshot"
  - "terminal_session_record"
negative_constraints:
  - "Worktree-bound file cards must not use a special path rewriting layer."
owner_hints:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
```

### CS-020 - Command Subtask Child-Run Contract

```yaml
plan_unit_id: CS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  When subtask: true is set, command execution launches a canonical child run
  through the shared delegated-run contract with required lineage, storage,
  permission/capability narrowing, requested-vs-effective runtime evidence, and
  no silent fallback for unavailable or incompatible runtime surfaces.
gui_related: false
gui_classification_reason: Command-launched child-run behavior is runtime delegation and storage evidence semantics.
split_recommended: false
depends_on: [CS-007, CS-018]
unblocks: [CS-021, CS-022, CS-023]
acceptance_criteria:
  - subtask: true is not a lighter-weight interpretation of normal prompt submission.
  - subtask: true creates a child-session and /delegation boundary with parent-child lineage, storage, /permission/capability, and runtime evidence.
  - Persona/runtime/model/effort state resolves through the same pipeline as other child runs.
  - Child dependency classification is required by safer default unless the command declares advisory behavior.
  - Child execution inherits and narrows parent permission ceiling and compatible capability universe before dispatch.
  - Parent-child linkage is recorded in canonical event and storage records.
  - The no-silent-fallback rule applies when a command explicitly requests an unavailable or incompatible runtime surface.
  - Requested-vs-effective provider /runtime surface is recorded when policy, availability, compatibility, or account binding changes the launched child.
  - PM canonical child-run identity remains the SSOT even when a provider has no native session tree.
  - Command-launched permission resolution defers lane, package, /package/account-bounded, account-bounded approval scope, and multi-lane orchestrator semantics to Permissions_System.
  - Commands uses projection-freshness and /degraded state rather than trust_tier for stale command projections.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_subtask_delegation_drift
reasoning_tier: high
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: command_subtask_child_run_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0027
preserved_exact_tokens:
  - "subtask: true"
  - "child-session"
  - "/delegation"
  - "/permission/capability"
  - "no-silent-fallback"
  - "/effective"
  - "/runtime"
  - "session-tree"
  - "provider-family"
  - "/package/account-bounded"
  - "trust_tier"
  - "/degraded"
negative_constraints:
  - "Command subtasks are not a lighter-weight exception to the canonical child-run contract."
  - "Commands must not synthesize a weaker command-local permission policy."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
```

### CS-021 - Command Persona Resolution

```yaml
plan_unit_id: CS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command subtasks follow the canonical child Persona resolution order: explicit
  command Persona override wins, otherwise task or child type resolves through
  the normal child Persona pipeline, parent Persona is only a weak hint, and
  child Persona does not silently copy the parent Persona.
gui_related: false
gui_classification_reason: Persona selection is runtime child-run resolution semantics.
split_recommended: false
depends_on: [CS-020]
unblocks: [CS-022]
acceptance_criteria:
  - Command subtasks follow canonical child Persona resolution order.
  - Explicit command Persona override wins.
  - Otherwise command-provided task or child type resolves Persona through the normal child Persona pipeline.
  - Parent Persona is at most a weak hint.
  - Child Persona does not silently copy the parent Persona.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_persona_resolution_drift
reasoning_tier: standard
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Personas.md
  - Plans/Tools.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_persona_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0028
preserved_exact_tokens:
  - "Persona"
  - "parent Persona"
negative_constraints:
  - "Child Persona does not silently copy the parent Persona."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Personas.md
```

### CS-022 - Mode Model Account Requested-Effective Overrides

```yaml
plan_unit_id: CS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command provider, model, account, Persona, worker-policy, mode, and runtime
  surface overrides are explicit child requests capped by parent authority, with
  UI-visible requested/effective fields and policy remap reasons whenever
  compatibility, availability, policy, or account binding changes the launched
  runtime/model/effort result.
gui_related: true
gui_classification_reason: The requested/effective override grammar is explicitly displayed in command UI.
split_recommended: false
depends_on: [CS-020, CS-021]
unblocks: [CS-023]
acceptance_criteria:
  - Command UI shows requested override, effective result, inheritance source, and policy remap reason.
  - Command overrides are explicit child requests, not bypasses around the runtime model.
  - Command mode overrides are capped by parent mode authority.
  - Command model/runtime surface overrides become explicit child requests.
  - Explicit requests do not silently fallback.
  - Requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_override_visibility_drift
reasoning_tier: high
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Models_System.md
  - Plans/Run_Modes.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: command_requested_effective_overrides
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0029
preserved_exact_tokens:
  - "/model/account/worker-policy"
  - "requested/effective"
  - "runtime/model/effort"
negative_constraints:
  - "Explicit requests do not silently fallback."
owner_hints:
  - Plans/Commands_System.md
```

### CS-023 - Current Working Set Retention

```yaml
plan_unit_id: CS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command cards, command-launched child runs, and command-produced blocks remain
  in the current working-set while they are latest active results, support the
  next intended action, participate in unresolved comparison, approval, question,
  or validation state, or are focused or pinned; they leave when superseded,
  carried forward, or execution moves to another branch.
gui_related: true
gui_classification_reason: Command cards, focus, pinned state, and working-set membership are user-visible interaction and state presentation.
split_recommended: true
split_recommendation_reason: Span map inferred S0030 as non-GUI, but the source text governs visible command cards, focus, /pinned, and working-set behavior.
depends_on: [CS-020, CS-022]
unblocks: []
acceptance_criteria:
  - Command cards remain in the current working-set while they are latest active results in the current branch of work.
  - Command-launched child runs and command-produced blocks remain while they support the next intended action.
  - Items remain while participating in unresolved comparison, /approval/question/validation state.
  - Items remain while explicitly focused or /pinned by the user.
  - Items leave when a newer result supersedes the same purpose, the finding has been carried forward, or execution clearly moves to a different branch of work.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_working_set_drift
reasoning_tier: standard
context_scope: command_working_set
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_current_working_set_retention
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0030
preserved_exact_tokens:
  - "working-set"
  - "/approval/question/validation"
  - "/pinned"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-024 - Template Resolution Order

```yaml
plan_unit_id: CS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template resolution parses YAML frontmatter, extracts placeholder hints,
  substitutes invocation arguments, resolves permission-checked file includes,
  resolves permission-checked shell injections, and submits the fully resolved
  body to the run in that order.
gui_related: false
gui_classification_reason: Template resolution order is deterministic backend command processing.
split_recommended: false
depends_on: [CS-015, CS-016, CS-017]
unblocks: []
acceptance_criteria:
  - Template resolution first parses YAML frontmatter and extracts field values.
  - Placeholder hints for $ARGUMENTS and positional patterns are extracted before substitution.
  - Invocation arguments substitute placeholders before file includes and shell injections.
  - "@path file includes resolve with permission checks before shell injections."
  - "!`command` shell injections resolve with permission checks after file includes."
  - The fully resolved body is the prompt submitted to the run.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_template_order_drift
reasoning_tier: standard
context_scope: command_template_resolution
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_template_resolution_order
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0031
preserved_exact_tokens:
  - "$ARGUMENTS"
  - "$1"
  - "$2"
  - "@path"
  - "!`command`"
  - "ContractRef: ContractName:Plans/Commands_System.md#EXECUTION"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-025 - Permissions Profile Override Precedence

```yaml
plan_unit_id: CS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A command permissions_profile_override loads the named permission profile from
  ~/.config/puppet-master/permission-profiles/<profile_id>.toml and applies it
  as an additional precedence layer between Persona overrides and project-level
  rules, effectively replacing the Persona profile for that command run.
gui_related: false
gui_classification_reason: Permissions profile override precedence is policy resolution behavior, not visual presentation.
split_recommended: false
depends_on: [CS-014, CS-020, CS-021]
unblocks: [CS-030, CS-033, CS-045]
acceptance_criteria:
  - permissions_profile_override loads the named profile from ~/.config/puppet-master/permission-profiles/<profile_id>.toml.
  - The profile applies as an additional precedence layer between Persona overrides and project-level rules.
  - For this command run, the override effectively replaces the Persona profile.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_permission_precedence_drift
reasoning_tier: high
context_scope: command_permission_profile_resolution
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_permissions_profile_override_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0035
preserved_exact_tokens:
  - "permissions_profile_override"
  - "~/.config/puppet-master/permission-profiles/<profile_id>.toml"
  - "Persona"
  - "project-level rules"
  - "ContractRef: ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-026 - Catalog-Installed Command Lifecycle and Override Safety

```yaml
plan_unit_id: CS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Catalog-installed commands remain canonical User Commands after installation:
  installation writes through the same command roots, updates follow manual edit
  validation, removal is blocked or deferred when active references require it,
  and uninstalling a catalog item never silently deletes a user-authored project
  override that intentionally shadows it.
gui_related: false
gui_classification_reason: Catalog installation, update, and deletion safety are lifecycle and storage semantics.
split_recommended: true
split_recommendation_reason: Source span S0037 mixes lifecycle/storage constraints with GUI provenance display and Settings ownership.
depends_on: [CS-012, CS-013, CS-014]
unblocks: [CS-027, CS-032]
acceptance_criteria:
  - Catalog-installed commands are still canonical User Commands after installation.
  - Installation creates or updates a command in the same canonical command roots described in section 2.
  - Updates follow the same validation rules as manual edits.
  - Removal is blocked or deferred when the command is actively referenced by an open edit session or another subsystem requires explicit replacement/confirmation.
  - Uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: catalog_command_lifecycle_drift
reasoning_tier: high
context_scope: command_catalog_lifecycle
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: catalog_installed_command_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0037
preserved_exact_tokens:
  - "Catalog-installed commands"
  - "canonical User Commands"
  - "same canonical command roots"
negative_constraints:
  - "Uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it."
owner_hints:
  - Plans/Commands_System.md
```

### CS-027 - Commands GUI SSOT and Catalog Provenance Display

```yaml
plan_unit_id: CS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands settings screen is part of Settings > Rules & Commands, this
  document is the SSOT for Commands GUI behavior, and the GUI shows whether each
  command is local/manual, catalog-installed, or catalog-installed with local
  override.
gui_related: true
gui_classification_reason: This PlanUnit governs the visible Commands settings screen and catalog provenance display.
split_recommended: true
split_recommendation_reason: Source span S0037 mixes visible GUI provenance with lifecycle and storage safety covered by CS-026.
depends_on: [CS-026]
unblocks: [CS-028, CS-029, CS-030, CS-040, CS-046, CS-049]
acceptance_criteria:
  - GUI-COMMANDS remains the anchor for Commands GUI behavior.
  - The Commands settings screen is part of the Rules & Commands tab in the unified Settings page.
  - All GUI surfaces described in Commands_System.md remain normative.
  - FinalGUISpec references this section as the SSOT for Commands GUI behavior.
  - The GUI shows whether a command is local/manual, catalog-installed, or catalog-installed with local override.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_ssot_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: commands_gui_ssot_catalog_provenance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0037
preserved_exact_tokens:
  - "GUI-COMMANDS"
  - "Rules & Commands"
  - "local/manual"
  - "catalog-installed"
  - "catalog-installed with local override"
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
```

### CS-028 - Commands Settings Scope Selector

```yaml
plan_unit_id: CS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Settings > Rules & Commands includes a Commands section with a top scope
  selector that manages Global commands from ~/.config/puppet-master/commands/
  and Project commands from <project_root>/.puppet-master/commands/ when a
  project is active.
gui_related: true
gui_classification_reason: Scope selection is a visible control in the Commands settings section.
split_recommended: false
depends_on: [CS-012, CS-027]
unblocks: [CS-029, CS-046]
acceptance_criteria:
  - The Commands section within Settings > Rules & Commands provides a top-level scope selector.
  - Global manages commands in ~/.config/puppet-master/commands/.
  - Project is visible when a project is active and manages commands in <project_root>/.puppet-master/commands/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_scope_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_scope_selector
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0039
preserved_exact_tokens:
  - "Settings > Rules & Commands"
  - "Global"
  - "Project"
  - "~/.config/puppet-master/commands/"
  - "<project_root>/.puppet-master/commands/"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-029 - Resolved Command List

```yaml
plan_unit_id: CS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands GUI lists resolved project and global commands in a table with
  name, scope, description, Persona, Mode, Model, and Subtask columns, shows
  project-local badges and /x- prefixes, and sorts alphabetically with
  project-local overrides before matching global commands.
gui_related: true
gui_classification_reason: The resolved command list is a visible table in Settings.
split_recommended: false
depends_on: [CS-012, CS-021, CS-022, CS-027, CS-028]
unblocks: [CS-046]
acceptance_criteria:
  - The table lists all resolved project and global commands.
  - Project-local commands are indicated with a badge.
  - Columns include Name, Scope, Description, Persona, Mode, Model, and Subtask.
  - Name is bold with /x- prefix shown.
  - Description is truncated to one line.
  - Persona, Mode, and Model show unset inherited states as specified.
  - Subtask true is indicated with a checkbox icon.
  - The table sorts alphabetically by name with project-local entries before global entries when names match.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_list_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_resolved_command_list
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0040
preserved_exact_tokens:
  - "/x-"
  - "Scope"
  - "Persona"
  - "Mode"
  - "Model"
  - "Subtask"
  - "inherit"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-030 - Command Create Editor Form

```yaml
plan_unit_id: CS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  New Command opens an editor form for name, description, Persona, mode, model,
  subtask, permissions profile override, override built-in, template body, and
  project-local or global save scope, using canonical validation and syntax
  highlighting for command template patterns.
gui_related: true
gui_classification_reason: The create editor form is a visible command authoring UI.
split_recommended: true
split_recommendation_reason: Source span S0041 mixes editor controls with save-time validation covered by CS-033.
depends_on: [CS-013, CS-014, CS-015, CS-021, CS-022, CS-025, CS-027]
unblocks: [CS-031, CS-033, CS-034, CS-046]
acceptance_criteria:
  - New Command opens an editor form.
  - Name is validated per section 2.5 and collision-checked per section 2.4.
  - Description is required and has max 200 chars.
  - Persona, Mode, Model, Subtask, Permissions profile override, and Override built-in controls are present as specified.
  - Override built-in is visible only in Expert mode.
  - Reserved Assistant Chat slash commands fail validation even if Override built-in is enabled.
  - Template body uses a Markdown editor with syntax highlighting for $ARGUMENTS, $N, @path, and !`cmd` patterns.
  - Scope selector supports project-local or global.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_create_form_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_create_editor_form
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0041
preserved_exact_tokens:
  - "New Command"
  - "override_builtin"
  - "Expert mode"
  - "$ARGUMENTS"
  - "$N"
  - "@path"
  - "!`cmd`"
negative_constraints:
  - "Reserved Assistant Chat slash commands fail validation even if override_builtin is enabled."
owner_hints:
  - Plans/Commands_System.md
```

### CS-031 - Command Edit Save Targets

```yaml
plan_unit_id: CS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Row click or edit button opens the command editor pre-populated; editing a
  global command while a project is active offers Save as project override or
  Save globally.
gui_related: true
gui_classification_reason: Edit entry points and save-target options are visible editor interactions.
split_recommended: false
depends_on: [CS-012, CS-030]
unblocks: [CS-032]
acceptance_criteria:
  - Row click opens the same editor pre-populated.
  - Edit button opens the same editor pre-populated.
  - Editing a global command while a project is active offers Save as project override.
  - Editing a global command while a project is active offers Save globally.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_edit_target_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_edit_save_targets
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0042
preserved_exact_tokens:
  - "Save as project override"
  - "Save globally"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-032 - Command Delete and Reveal Behavior

```yaml
plan_unit_id: CS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Delete uses a confirmation modal; deleting a project-local command that
  overrides a global command reveals the global version, while deleting a global
  command with no project override removes it entirely.
gui_related: true
gui_classification_reason: Delete confirmation and reveal behavior are visible settings interactions.
split_recommended: false
depends_on: [CS-012, CS-026, CS-031]
unblocks: []
acceptance_criteria:
  - Delete button uses a confirmation modal.
  - Deleting a project-local command that overrides a global one reveals the global version.
  - Deleting a global command with no project override removes it entirely.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_delete_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_delete_reveal_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0043
preserved_exact_tokens:
  - "confirmation modal"
  - "project-local command"
  - "global version"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-033 - Command Save Schema Validation

```yaml
plan_unit_id: CS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Every command save validates the file against the command schema, displays
  inline errors for reserved names, invalid formats, missing description,
  invalid mode, invalid model, and invalid override_builtin use, and blocks save
  until all errors are resolved.
gui_related: true
gui_classification_reason: Inline save validation errors and blocked saves are visible editor behavior.
split_recommended: true
split_recommendation_reason: Span map inferred S0044 as non-GUI, but the source text governs visible inline errors and save blocking.
depends_on: [CS-013, CS-014, CS-025, CS-030]
unblocks: [CS-049]
acceptance_criteria:
  - Every save validates the command file against section 3 schema.
  - Inline errors are displayed for reserved name collision, invalid name format, missing description, invalid mode value, and invalid model format.
  - If override_builtin: true is set while the command name matches a reserved Assistant Chat slash command, inline validation explains that override_builtin does not apply to canonical reserved chat commands.
  - Save is blocked until errors are resolved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_save_validation_drift
reasoning_tier: high
context_scope: commands_gui_editor_validation
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_save_schema_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0041
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0044
preserved_exact_tokens:
  - "override_builtin: true"
  - "reserved name collision"
  - "invalid name format"
  - "missing description"
  - "invalid mode value"
  - "invalid model format"
negative_constraints:
  - "override_builtin does not apply to canonical reserved chat commands."
  - "Block save until errors are resolved."
owner_hints:
  - Plans/Commands_System.md
```

### CS-034 - Dry-Run Preview Rendering

```yaml
plan_unit_id: CS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The command editor Preview resolves a template with sample arguments and
  renders the fully resolved prompt in a read-only Markdown view with
  highlighted placeholder substitutions, file-include results, shell-injection
  results, or permission-blocked placeholders.
gui_related: true
gui_classification_reason: Dry-run preview is a visible editor preview surface.
split_recommended: true
split_recommendation_reason: Source span S0045 mixes preview rendering with execution safety covered by CS-035.
depends_on: [CS-015, CS-016, CS-017, CS-024, CS-030]
unblocks: [CS-035, CS-046, CS-049]
acceptance_criteria:
  - DRY-RUN remains the anchor for dry-run preview behavior.
  - Preview resolves the template with sample arguments.
  - Preview displays the fully rendered prompt without submitting it.
  - Placeholder substitutions are highlighted.
  - File-include and shell-injection results appear, or permission-blocked placeholders appear.
  - Preview uses a read-only rendered Markdown view.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_run_preview_rendering_drift
reasoning_tier: standard
context_scope: commands_gui_preview
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_dry_run_preview_rendering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0045
preserved_exact_tokens:
  - "DRY-RUN"
  - "Preview"
  - "permission-blocked placeholders"
  - "read-only rendered Markdown view"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-035 - Dry-Run Preview Execution Safety

```yaml
plan_unit_id: CS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Dry-run preview does not execute any run; shell injections in preview mode may
  execute the shell command only under bash permission and must not submit the
  result to any agent.
gui_related: false
gui_classification_reason: Preview execution safety is command execution policy, not visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0045 mixes GUI rendering and backend execution-safety requirements.
depends_on: [CS-017, CS-024, CS-034]
unblocks: []
acceptance_criteria:
  - The preview does NOT execute any run.
  - Shell injections in preview mode execute the shell command only subject to bash permission.
  - Preview-mode shell results are not submitted to any agent.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_run_preview_execution_drift
reasoning_tier: high
context_scope: commands_gui_preview
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_dry_run_preview_execution_safety
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0045
preserved_exact_tokens:
  - "does NOT execute any run"
  - "bash"
  - "do not submit the result to any agent"
negative_constraints:
  - "Dry-run preview must not submit the result to any agent."
owner_hints:
  - Plans/Commands_System.md
```

### CS-036 - Shortcut Binding Section Anchor

```yaml
plan_unit_id: CS-036
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The 6.3 Shortcut binding heading is preserved as source lineage only in this
  window; it does not add behavior beyond invocation-surface shortcut rules
  already covered by earlier PlanUnits and owner docs.
gui_related: false
gui_classification_reason: This is structural lineage for a heading-only span.
split_recommended: false
depends_on: [CS-011, CS-027]
unblocks: []
acceptance_criteria:
  - The 6.3 Shortcut binding heading remains covered by migration artifacts.
  - No new shortcut behavior is inferred from this heading-only span.
  - Shortcut behavior continues to defer to invocation-surface and UI owner contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: shortcut_heading_overinterpretation
reasoning_tier: low
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_shortcut_binding_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0046
preserved_exact_tokens:
  - "6.3 Shortcut binding"
negative_constraints:
  - "Do not infer new shortcut behavior from the heading-only span."
owner_hints:
  - Plans/Commands_System.md
```

### CS-037 - Reserved Slash-Command Set Lock

```yaml
plan_unit_id: CS-037
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Section 7 is the locked slash-command SSOT for reserved chat slash commands:
  the canonical reserved set remains visible to consumers, /clear is removed,
  /cancel is a deprecated alias to /stop, traceability includes obl-046 and
  obl-047, and repairs replace the reserved section rather than appending
  stale packet residue.
gui_related: false
gui_classification_reason: Reserved command set locking and stale-residue replacement are command registry governance.
split_recommended: true
split_recommendation_reason: Source span S0047 is dense and mixes reserved-set lock, /web parsing, aliases, override policy, and catalog presentation.
depends_on: [CS-002, CS-013]
unblocks: [CS-038, CS-039, CS-040, CS-041, CS-042, CS-045, CS-047]
acceptance_criteria:
  - Section 7 remains the slash-command SSOT for the single canonical set of reserved chat slash commands.
  - Reserved commands include /new, /model, /effort, /mode, /export, /compact, /stop, /resume, /rewind, /revert, /share, /settings, /doctor, /help, /web, /skill, and /cancel.
  - /clear is removed.
  - /cancel remains a deprecated alias to /stop.
  - Traceability for the reserved command family includes obl-046 and obl-047.
  - Packet regeneration treats this owner as a replace_section unit.
  - Repairs replace section 7 rather than appending stale-residue child/parent packet material after section 6.3.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_slash_set_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: reserved_slash_command_set_lock
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/new"
  - "/model"
  - "/effort"
  - "/mode"
  - "/export"
  - "/compact"
  - "/stop"
  - "/resume"
  - "/rewind"
  - "/revert"
  - "/share"
  - "/settings"
  - "/doctor"
  - "/help"
  - "/web"
  - "/skill"
  - "/cancel"
  - "/clear"
  - "obl-046"
  - "obl-047"
  - "replace_section"
negative_constraints:
  - "/clear stays removed."
  - "Stale-residue child/parent packet material cannot survive beside the canonical /web, /skill, and /cancel rules."
owner_hints:
  - Plans/Commands_System.md
```

### CS-038 - Web Slash Family Parsing and IDs

```yaml
plan_unit_id: CS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The /web family remains one reserved slash-command family with bare /web
  opening help/autocomplete only, execution requiring explicit subcommands, and
  stable cmd.chat.web.* IDs for search, fetch, extract, research, crawl, and map.
gui_related: false
gui_classification_reason: Web slash parsing and command IDs are dispatcher semantics.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes web-family parsing with reserved aliases and visible catalog presentation.
depends_on: [CS-013, CS-037]
unblocks: [CS-039]
acceptance_criteria:
  - /web is one command family and is not flattened into separate top-level families.
  - Bare /web shows help/autocomplete only.
  - Execution requires /web search, /web fetch, /web extract, /web research, /web crawl, or /web map.
  - The stale rule that bare /web with query routes to cmd.web.search by default is retired.
  - cmd.web.search is not the implicit destination for bare /web.
  - Stable command IDs include cmd.chat.web.search, cmd.chat.web.fetch, cmd.chat.web.extract, cmd.chat.web.research, cmd.chat.web.crawl, and cmd.chat.web.map.
  - URL normalization applies and parse failure shows usage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_slash_family_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: web_family_subcommand_required_parsing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/web search <query>"
  - "/web fetch <url>"
  - "/web extract <url>"
  - "/web research <task>"
  - "/web crawl <url>"
  - "/web map <url>"
  - "cmd.chat.web.search"
  - "cmd.chat.web.fetch"
  - "cmd.chat.web.extract"
  - "cmd.chat.web.research"
  - "cmd.chat.web.crawl"
  - "cmd.chat.web.map"
  - "bare /web shows help/autocomplete only"
negative_constraints:
  - "Do not flatten /web into separate slash families."
  - "cmd.web.search is not the implicit destination for bare /web."
owner_hints:
  - Plans/Commands_System.md
```

### CS-039 - Reserved Dispatch Aliases and Override Policy

```yaml
plan_unit_id: CS-039
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  override_builtin is forbidden for every reserved built-in slash command, may
  survive only for non-core command namespaces, and cannot override /web, /skill,
  /cancel, /clear, /stop, or other canonical Assistant Chat built-ins; reserved
  aliases keep /cancel mapped to stop, /rewind conversation-only, /revert file
  restore, and /clear removed rather than thread-clear.
gui_related: false
gui_classification_reason: Override policy and dispatch alias mapping are dispatcher and registry constraints.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes dispatch alias policy with web parsing and catalog presentation.
depends_on: [CS-013, CS-037, CS-038]
unblocks: [CS-040, CS-041, CS-047]
acceptance_criteria:
  - override_builtin is /forbid for every reserved built-in slash command.
  - If override_builtin survives for extension design, it is narrowed to non-core command namespaces only.
  - override_builtin cannot override /web, /skill, /cancel, /clear, /stop, or other canonical Assistant Chat built-ins.
  - /cancel resolves internally to cmd.chat.stop.
  - /rewind dispatches cmd.chat.rewind and remains conversation-only.
  - /revert dispatches cmd.chat.revert and remains file-mutation restore, not conversation rewind.
  - /share, /settings, /doctor, and /help route to their owning surfaces rather than user-defined commands.
  - /clear stays removed and must not return as a thread-clear command.
  - Source cleanup shorthand normalizes to reserved-command alias policy plus ask-gated web permission posture and does not create extra slash commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_alias_override_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_slash_dispatch_override_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "override_builtin"
  - "/forbid"
  - "cmd.chat.stop"
  - "cmd.chat.rewind"
  - "cmd.chat.revert"
  - "thread-clear"
  - "/de-duplication"
  - "/research-focused"
  - "/risky"
negative_constraints:
  - "/clear stays removed and must not return as a thread-clear command."
  - "override_builtin cannot override canonical Assistant Chat built-ins."
owner_hints:
  - Plans/Commands_System.md
```

### CS-040 - Reserved Command Catalog Presentation

```yaml
plan_unit_id: CS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Reserved commands remain visible as non-editable catalog entries, /web remains
  discoverable in catalog, and deprecated aliases are shown distinctly from
  active commands.
gui_related: true
gui_classification_reason: Reserved command catalog presentation is visible catalog UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes visible catalog presentation with backend reserved-set and alias rules.
depends_on: [CS-027, CS-037, CS-039]
unblocks: []
acceptance_criteria:
  - /web remains discoverable in catalog.
  - Deprecated aliases are shown distinctly from active commands.
  - Reserved commands are shown as non-editable in catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_command_catalog_drift
reasoning_tier: standard
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: reserved_command_catalog_presentation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/web remains discoverable in catalog"
  - "deprecated aliases shown distinctly from active commands"
  - "reserved commands shown as non-editable in catalog"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-041 - User Command UICommand Dispatch Bridge

```yaml
plan_unit_id: CS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.chat.run_user_command is the required UICommand dispatch bridge for User
  Command execution from every invocation surface, with registration owned by
  UI_Command_Catalog and event naming owned by the event owner rather than by
  assertion in this document.
gui_related: false
gui_classification_reason: The dispatch bridge and event ownership are internal command wiring semantics.
split_recommended: false
depends_on: [CS-011, CS-020, CS-039]
unblocks: [CS-042, CS-045, CS-049]
acceptance_criteria:
  - UICOMMAND-ENTRY remains the anchor for the User Command UICommand catalog entry.
  - cmd.chat.run_user_command is the required dispatch bridge for User Command execution from any invocation surface.
  - Args schema preserves command_name and optional arguments.
  - Expected events are tool.invoked when subtask: true, otherwise the canonical chat message event registered by the event owner.
  - chat.message.submitted is not expected unless that event is explicitly registered.
  - This document does not make cmd.chat.run_user_command registered by assertion.
  - Reserved slash-command UICommand IDs remain defined in UI_Command_Catalog section 2.7 and distinct from User Command execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_uicommand_bridge_drift
reasoning_tier: high
context_scope: command_dispatch_bridge
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: run_user_command_uicommand_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0048
preserved_exact_tokens:
  - "UICOMMAND-ENTRY"
  - "cmd.chat.run_user_command"
  - "{ command_name, arguments? }"
  - "tool.invoked"
  - "subtask: true"
  - "chat.message.submitted"
  - "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#7-uicommand"
negative_constraints:
  - "This document does not make cmd.chat.run_user_command registered by assertion."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-042 - Debug Mode UICommand Family

```yaml
plan_unit_id: CS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Debug Mode actions use a separate canonical cmd.debug.* UICommand family for
  assistant-thread investigation control, allowing Assistant Chat, editor, and
  debug-adjacent surfaces to invoke investigation lifecycle actions without
  overloading the User Command namespace.
gui_related: true
gui_classification_reason: Debug Mode commands affect visible Assistant Chat, editor, evidence, and investigation surfaces.
split_recommended: false
depends_on: [CS-009, CS-011, CS-037]
unblocks: []
acceptance_criteria:
  - Debug Mode actions use a separate canonical cmd.debug.* UICommand family.
  - The family includes start, stop, pause, resume, add_breakpoint, remove_breakpoint, clear_breakpoints, view_evidence, step, and collect_snapshot commands.
  - Preconditions for each command remain preserved.
  - Debug Mode dispatch IDs are internal wiring identifiers, not User Commands.
  - Debug Mode dispatch IDs complement rather than replace the reserved slash-command surface and broader UI command catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_uicommand_namespace_drift
reasoning_tier: high
context_scope: debug_mode_command_dispatch
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
node_compile_hint:
  mode: debug_mode_uicommand_family
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0049
preserved_exact_tokens:
  - "cmd.debug.*"
  - "cmd.debug.start"
  - "cmd.debug.stop"
  - "cmd.debug.pause"
  - "cmd.debug.resume"
  - "cmd.debug.add_breakpoint"
  - "cmd.debug.remove_breakpoint"
  - "cmd.debug.clear_breakpoints"
  - "cmd.debug.view_evidence"
  - "cmd.debug.step"
  - "cmd.debug.collect_snapshot"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md"
negative_constraints:
  - "Debug Mode dispatch IDs are internal wiring identifiers, not User Commands."
  - "Debug Mode actions must not overload the User Command namespace."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-043 - OpenCode Reference Boundary

```yaml
plan_unit_id: CS-043
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  OpenCode command material is external reference input used only for
  ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization and does not override
  Puppet Master command names, dispatch rules, storage paths, or reserved
  slash-command policy.
gui_related: false
gui_classification_reason: OpenCode reference boundary is migration/evidence governance.
split_recommended: false
depends_on: [CS-002, CS-003]
unblocks: [CS-044, CS-045]
acceptance_criteria:
  - BASELINE-DELTAS remains the anchor for OpenCode baseline and Puppet Master deltas.
  - OpenCode command material is external reference input.
  - OpenCode material is used for ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization only.
  - OpenCode material does not override Puppet Master command names.
  - OpenCode material does not override Puppet Master dispatch rules, storage paths, or reserved slash-command policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_reference_boundary_drift
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_reference_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0050
preserved_exact_tokens:
  - "BASELINE-DELTAS"
  - "ALIGNED/RECONCILED/ADOPTED/REFERENCE"
  - "OpenCode"
negative_constraints:
  - "OpenCode reference input does not override Puppet Master command names, dispatch rules, storage paths, or reserved slash-command policy."
owner_hints:
  - Plans/Commands_System.md
```

### CS-044 - OpenCode Command Baseline Reference

```yaml
plan_unit_id: CS-044
unit_type: reference
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The OpenCode baseline records external command behavior for comparison,
  including built-ins, config-defined commands, MCP prompt conversion, skill
  registration, .opencode discovery paths, template features, subtask task
  launch, provider_id/model_id model override format, and built-in override
  precedence.
gui_related: false
gui_classification_reason: OpenCode baseline is external reference material, not Puppet Master GUI behavior.
split_recommended: false
depends_on: [CS-043]
unblocks: [CS-045]
acceptance_criteria:
  - OpenCode loads commands from built-in commands, config-defined commands, MCP prompts, and skills when no name collision exists.
  - Discovery paths include .opencode/commands/<name>.md and ~/.config/opencode/commands/<name>.md.
  - Template features include $ARGUMENTS, $1/$2 positional args, !`shell` injection, and @file inclusion.
  - subtask: true runs as a subagent task in the OpenCode baseline.
  - model override uses provider_id/model_id format in the OpenCode baseline.
  - Custom commands can override built-in commands by name in the OpenCode baseline.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_misuse
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_command_baseline_reference
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0051
preserved_exact_tokens:
  - ".opencode/commands/<name>.md"
  - "~/.config/opencode/commands/<name>.md"
  - "init"
  - "review"
  - "MCP prompts"
  - "skills"
  - "$ARGUMENTS"
  - "provider_id/model_id"
negative_constraints:
  - "OpenCode baseline behavior remains reference material and does not override Puppet Master command policy."
owner_hints:
  - Plans/Commands_System.md
```

### CS-045 - Puppet Master Command Backend Deltas

```yaml
plan_unit_id: CS-045
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Puppet Master command backend deltas from OpenCode include .puppet-master
  discovery paths, Persona integration, per-command permissions profile override,
  no built-in User Commands, separate MCP prompt handling, non-overridable
  reserved slash commands, and provider/capability identity limits owned by
  provider, media capability, contracts, and event-registration owners.
gui_related: false
gui_classification_reason: Backend deltas cover discovery paths, Persona mapping, permissions, reserved policy, and provider capability ownership.
split_recommended: true
split_recommendation_reason: Source span S0052 mixes backend deltas with GUI management delta covered by CS-046.
depends_on: [CS-012, CS-021, CS-025, CS-037, CS-041, CS-043, CS-044]
unblocks: [CS-046]
acceptance_criteria:
  - Puppet Master uses .puppet-master/commands/<name>.md and ~/.config/puppet-master/commands/<name>.md instead of .opencode paths.
  - Puppet Master commands specify persona per Plans/Personas.md rather than provider-native agent names.
  - Puppet Master adds permissions_profile_override for fine-grained control.
  - Puppet Master does not bundle built-in User Commands.
  - Equivalent functionality is provided through reserved slash commands and Orchestrator actions.
  - Puppet Master treats MCP prompts as a separate mechanism and does not auto-register them as User Commands.
  - override_builtin is reserved for future non-chat extension points and MUST NOT bypass reserved chat-command or reserved git/GitHub prefix rules.
  - OpenCode final-pass evidence remains external reference input for command behavior only.
  - Puppet Master still requires SSE filter discriminator, stable OpenCode session-ID mapping, requested /auth versus /effective account identity parity, and command ID registration before adopting OpenCode-specific behavior.
  - Capability discovery such as capabilities.get is a live provider/runtime contract, not a command-local cache.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_command_delta_drift
reasoning_tier: high
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
  - Plans/Personas.md
  - Plans/Provider_OpenCode.md
  - Plans/Contracts_V0.md
  - Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: puppet_master_command_backend_deltas
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0052
preserved_exact_tokens:
  - ".puppet-master/commands/<name>.md"
  - "~/.config/puppet-master/commands/<name>.md"
  - "persona"
  - "permissions_profile_override"
  - "MCP prompts"
  - "override_builtin"
  - "capabilities.get"
  - "requested `/auth` versus `/effective`"
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
negative_constraints:
  - "Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands."
  - "override_builtin MUST NOT be used to bypass reserved chat-command or reserved git/GitHub prefix rules."
  - "Capability discovery is a live provider/runtime contract, not a command-local cache."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Provider_OpenCode.md
```

### CS-046 - Puppet Master Commands GUI Delta

```yaml
plan_unit_id: CS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Puppet Master differs from OpenCode by providing a full GUI Commands settings
  screen for command management.
gui_related: true
gui_classification_reason: The delta is explicitly the GUI command management screen.
split_recommended: true
split_recommendation_reason: Source span S0052 mixes GUI management delta with backend OpenCode/Puppet Master deltas.
depends_on: [CS-027, CS-028, CS-029, CS-030, CS-034, CS-045]
unblocks: []
acceptance_criteria:
  - OpenCode has no GUI for command management.
  - Puppet Master provides a full Commands settings screen.
  - The GUI delta routes through section 6 Commands GUI requirements.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_delta_drift
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: puppet_master_commands_gui_delta
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0052
preserved_exact_tokens:
  - "GUI management"
  - "full Commands settings screen"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-047 - Acceptance Storage and Reserved Names

```yaml
plan_unit_id: CS-047
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command acceptance requires deterministic project-local override resolution,
  runtime rejection of reserved slash-command names, and a ban on reserved
  Assistant Chat slash-command overrides through override_builtin.
gui_related: false
gui_classification_reason: Storage resolution and reserved-name acceptance are runtime validation requirements.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes backend acceptance criteria with GUI acceptance criteria.
depends_on: [CS-012, CS-013, CS-037, CS-039]
unblocks: []
acceptance_criteria:
  - AC-CMD01 remains covered: project-local commands MUST override global commands with the same name and resolution order MUST be deterministic.
  - AC-CMD02 remains covered: User Commands MUST NOT use any reserved slash-command name and runtime MUST reject creation of commands with reserved names.
  - AC-CMD10 remains covered: User Commands MUST NOT override reserved Assistant Chat slash commands.
  - override_builtin MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_reserved_name_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_acceptance_storage_reserved_names
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "ACCEPTANCE"
  - "AC-CMD01"
  - "AC-CMD02"
  - "AC-CMD10"
  - "ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Progression_Gates.md"
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Commands_System.md#COMMAND-SCHEMA"
negative_constraints:
  - "User Commands MUST NOT use any reserved slash-command name."
  - "User Commands MUST NOT override reserved Assistant Chat slash commands."
  - "override_builtin MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes."
owner_hints:
  - Plans/Commands_System.md
```

### CS-048 - Acceptance Template Permissions and Subtasks

```yaml
plan_unit_id: CS-048
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command acceptance requires template resolution order, bash permission checks
  for shell injection, read permission checks for file inclusion, and canonical
  child-run execution with parent event-ledger linkage when subtask: true.
gui_related: false
gui_classification_reason: Template, permission, and child-run acceptance criteria are runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes runtime acceptance with GUI acceptance.
depends_on: [CS-016, CS-017, CS-020, CS-024]
unblocks: []
acceptance_criteria:
  - AC-CMD03 remains covered: template resolution MUST follow frontmatter parse, placeholder extraction, placeholder substitution, file includes, then shell injection.
  - AC-CMD04 remains covered: shell injection MUST be permission-checked against bash before execution.
  - If shell injection is denied, it MUST be blocked and an error substituted.
  - AC-CMD05 remains covered: file inclusion MUST be permission-checked against read.
  - If file inclusion is denied, it MUST be blocked and an error substituted.
  - "AC-CMD06 remains covered: when subtask: true, the command MUST execute as a child run via the task tool and parent MUST record linkage in the event ledger."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_runtime_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
  - Plans/Tools.md
node_compile_hint:
  mode: command_acceptance_template_permission_subtask
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "AC-CMD03"
  - "AC-CMD04"
  - "AC-CMD05"
  - "AC-CMD06"
  - "bash"
  - "read"
  - "subtask: true"
  - "task"
  - "event ledger"
negative_constraints:
  - "Denied shell injection or file inclusion must be blocked and substituted with an error."
owner_hints:
  - Plans/Commands_System.md
```

### CS-049 - Acceptance GUI Validation Preview Invocation

```yaml
plan_unit_id: CS-049
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command GUI acceptance requires save-time name validation with blocked saves,
  dry-run rendering of the fully resolved template without submitting to an
  agent run, and User Command exposure in command palette and chat slash
  autocomplete unless unresolved.
gui_related: true
gui_classification_reason: These acceptance criteria govern visible validation, preview, palette, and autocomplete behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes GUI acceptance with backend acceptance criteria.
depends_on: [CS-011, CS-027, CS-033, CS-034, CS-041]
unblocks: []
acceptance_criteria:
  - AC-CMD07 remains covered: the GUI Commands management section MUST validate command names on save.
  - AC-CMD07 blocks saves with validation errors for reserved names, invalid format, and missing description.
  - AC-CMD08 remains covered: dry-run preview MUST render the fully resolved template without submitting it to any agent run.
  - AC-CMD09 remains covered: every User Command MUST appear in command palette and chat slash-command autocomplete unless unresolved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_gui_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: command_acceptance_gui_preview_invocation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "AC-CMD07"
  - "AC-CMD08"
  - "AC-CMD09"
  - "command palette"
  - "chat slash-command autocomplete"
negative_constraints:
  - "Dry-run preview must render without submitting it to any agent run."
owner_hints:
  - Plans/Commands_System.md
```

### CS-001 - Commands System Source-Preserving Bridge Retired

```yaml
plan_unit_id: CS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized Commands_System-S0001 through Commands_System-S0053 into CS-002
  through CS-049. CS-001 remains only as migration lineage for the retired bridge
  span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CS-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CS-002 through CS-049.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 027 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Commands_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0056
preserved_exact_tokens:
- Commands System (Canonical SSOT)
- 0. Scope and SSOT status
- 0.1 Command scope and legacy retirements
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 0.2 Cross-owner consumer boundaries
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md'
- Debug and launcher command boundary
- 1. Definitions
- 1.1 User Command (preset)
- 1.2 UICommand (internal dispatch) — distinction
- 'ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md'
- 1.3 Invocation surfaces
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md'
- 2. Storage and discovery
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 2.1 Project-local
- 2.2 Global
- 2.3 Resolution order
- 2.4 Name collision rules
- 2.4.1 Reserved namespace retirements
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- 2.5 Name validation
- 3. Command schema
negative_constraints:
- User Commands may surface `/resume` only by reference to the Assistant Chat and storage SSOTs; they MUST NOT define a separate restore/resume storage schema.
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- orchestration-core reconciliation is execution-core owner work, not command-surface cleanup. `Executor_Protocol.md` and `orchestrator-subagent-integration.md` are the execution-core outliers when they retain tier-era, tier-shaped `TierContext`, or `tier_runtime_record` canon; Commands treats graph/p
- Widget and native-surface state remains owner-routed when Commands exposes a command or checklist entry. `Plans/Widget_System.md` (`/Widget_System.md`) and `Widget_System` own chrome slots for `/trust-state`, projection-trust semantics, hostability, and tab-boundary direction. They also own the acce
- Runtime artifact panels are also owner-routed when Commands exposes an artifact action. `Runtime_Artifacts_Panel.md` and `Runtime_Artifacts_Panel` own artifact-type semantics, panel behavior, schema family references, and the artifact evidence/provenance model; Commands may open or invoke the panel,
- 'Command availability and summary vocabulary are consumer constraints, not local decorations. Command definitions and UICommands must declare whether each action is `live-run only`, `historical-safe`, or `record-only/export-only` / `/export-only` before palette, shortcut, or route dispatch; Commands '
- '| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '- permission resolution for command-launched child work defers to `Plans/Permissions_System.md` (`/Permissions_System.md`) for lane, package, `/package/account-bounded`, account-bounded approval scope, and multi-lane orchestrator runs; Commands may request or display the selected approval scope, but'
- '- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it'
- '- /clear stays removed and must not return as a `thread-clear` command'
- 7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension point
- '**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.'
- '**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.'
compatibility_only_notes:
- '### 0.1 Command scope and legacy retirements'
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- '- record the requested-vs-effective (`/effective`) provider `/runtime` surface when policy, availability, compatibility, or account binding changes the launched child.'
- '- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.'
- Command permission prompts inherit parallel actor scoping. HITL/tool and `/tool` approval semantics normalize onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance. When resolving command-launched work, template file inclusion, or shell injection, th
stale_retired_dispositions:
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- Checklist references remain freshness-checked consumers. `Plans/Section15_MVP_Promoted_Features_Spec.md` (`/Section15_MVP_Promoted_Features_Spec.md`) is verification-only unless upstream reconciliation reveals direct stale references that require edits; it is not the storage, command, permission, or
- 'Mutation and deprecation gates are first-class command constraints. `GATE-010` must evaluate subject-open commands, wrapper commands over canonical navigation, route-payload completeness, alias `/deprecation`, blocked-action admissibility against `allowed_action_ids` and `allowed_action_ids[]`, and '
- Assistant worktree commands share the orchestrator worktree directory family but use thread-derived names. Existing orchestrator worktrees keep `.puppet-master/worktrees/{tier_id}` style directory names; Assistant thread worktrees use `.puppet-master/worktrees/thread-{short_id}`, where `short_id` is
- '- generalized projection freshness uses storage and owner vocabulary: `storage-plan.md` and `storage-plan` reserve `trust_tier` for Preview and `/browser` semantics, so Commands uses projection-freshness and `/degraded` state for stale command projections rather than reusing `trust_tier` as a generi'
- 'This section owns `## 7. Reserved built-in slash commands` as the locked reserved-set contract. The same built-in slash-command family must stay visible here and in consumers: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`'
- 'Packet regeneration treats this owner as a `replace_section` unit: repairs for the reserved-set contract replace `## 7. Reserved built-in slash commands` itself rather than appending raw material after `### 6.3 Shortcut binding`, so stale-residue child/parent packet material cannot survive beside th'
- 'The `/web` family is reserved as one command family, not flattened into independent top-level commands. Bare `/web` has no-default execution behavior: it opens help/autocomplete only, and execution requires a subcommand such as `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web craw'
- 'Exact reserved-command behavior: bare /web has no default action, bare /skill is discovery or invocation only, /rewind dispatches conversation-only rewind, /revert dispatches file-mutation restore, /share/settings/doctor/help route to their owning surfaces, /cancel remains a deprecated alias to /sto'
- '- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.'
- '- deprecated aliases shown distinctly from active commands'
owner_boundary_notes:
- '# Commands System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '### 0.2 Cross-owner consumer boundaries'
- User Commands consume, but do not re-own, several adjacent runtime and provider contracts. For MCP prompt or tool OAuth flows, command loading and invocation defer to `Plans/Tools.md` `### Schema isolation and OAuth state`; Commands may surface the selected provider/scope and stable `client-id`, but
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For storage and migration paths, command execution uses the storage owner detection order `config > $PUPPET_MASTER_DATA_DIR > project dir > global dir`; Commands may display the resolved storage-root or pass it through execution context, but migration, persistence, and path-resolution semantics stay
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For clarification-request and `question-flow` behavior, command presets and wizard entry points defer to the shared question system in `Plans/assistant-chat-design.md` and the planning flow consumer rules in `Plans/chain-wizard-flexibility.md`; Commands may launch or reference those flows but do not
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- 'Command-contract reconciliation is registry-facing, not prose-only. `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` must keep command-contract `IDs` and validation hooks aligned: `/compact` stays reserved when `cmd.chat.compact_context` exists, `cmd.chat.run_user_command` cannot c'
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- 'Command taxonomy is a three-way split, not a binary split: pure shell/view-state commands, route-consuming navigation commands, and domain mutation/runtime commands. Pure shell/view-state commands stay local and lightweight: they change what panel/subview/layout is visible, but they do not own canon'
- Command palette object results follow the same route model. Because `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) already defines the global command palette, Commands treats palette exposure as a consumer boundary. The command palette may expose Orchestrator object results, not just commands/pages or
- '`UI_Wiring_Rules.md` remains the wiring owner for reusable navigation commands and subject-open commands; Commands treats those as first-class wiring shapes with schema-level route-payload and `argument-contract` obligations, not as generic `args` smuggling.'
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
owner_hints:
- Plans/Commands_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```
