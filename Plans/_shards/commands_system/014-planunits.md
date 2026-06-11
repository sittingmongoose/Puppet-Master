# Shard 014: PlanUnits

Source: `Plans/Commands_System.md`

Source lines: L680-L864

Source SHA256: `b5de2955ec7af4adeb576436220d240d13e0d93596dc9236fc6e2d2124d58540`

---

## PlanUnits

### CS-001 - Commands System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: CS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: Plans/Commands_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Commands_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0053
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

