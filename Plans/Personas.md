# Personas (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master Persona system. All other plan documents MUST reference this document by anchor (e.g., `Plans/Personas.md#PERSONA-SCHEMA`) rather than restating Persona definitions, storage layout, schema, or selection rules.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Subagent registry (canonical name list): `Plans/orchestrator-subagent-integration.md` §4 (`DRY:DATA:subagent_registry`)
- Run modes: `Plans/Run_Modes.md`
- Tool permissions: `Plans/Tools.md`
- OpenCode baseline (agents/subagents): `Plans/OpenCode_Deep_Extraction.md` §7B
- Permissions system: `Plans/Permissions_System.md`
- Plugin system: `Plans/Plugins_System.md`
- Models system: `Plans/Models_System.md`
- Skills system: `Plans/Skills_System.md`

---

## 1. Definitions

<a id="DEF-AGENT"></a>
### 1.1 Agent

An **Agent** is a running AI execution unit. It is a concrete instance within a Puppet Master run — a provider process that receives a compiled context (system prompt, instructions, conversation history) and produces a response stream. The Orchestrator spawns Agents for each node in the run graph. An Agent is ephemeral; it exists only for the duration of its run.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
### 1.2 Subagent

A subagent is a child run that resolves a Persona for the child task. It is not merely “the parent Persona, but smaller,” and it is not defined by provider-native agent-file syntax.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- the child Persona may differ materially from the parent Persona.
- the child Persona does not auto-inherit from the parent.
- provider-native agent files may seed or export Persona content, but PM Persona storage remains canonical.
- OpenCode evidence that child sessions with `session.parentID` and compaction requests are force-marked as `agent` is adapter classification evidence only; it does not redefine PM Persona identity or child-run semantics.
- crew mode may reuse the same Persona across many members while varying the model/provider selection.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md
### 1.3 Persona (canonical term)

A **Persona** is the assigned role definition that shapes an Agent's or Subagent's behavior. It is a static, declarative artifact — a YAML-frontmatter Markdown file — that acts as a **behavior-and-runtime contract**. In addition to identity, instructions, default permissions, and skill references, a Persona MAY declare provider/model/variant preferences, optional runtime control preferences, tool-usage guidance, aliases, and UI-facing metadata. When the Orchestrator or Interview phase manager selects a Persona for a run, the Persona's content and runtime metadata feed both the Agent's compiled context and the effective runtime resolution flow.

Expanded scope note: §10.2 is normative and extends this definition without replacing it.

**Key distinctions:**

| Concept | What it is | Lifetime | Mutability |
|---------|-----------|----------|------------|
| **Persona** | A role definition (file on disk) | Persistent until user deletes | User-editable via GUI |
| **Agent** | A running AI process assigned a Persona | Ephemeral (one run) | Immutable once spawned |
| **Subagent** | An Agent spawned by another Agent | Ephemeral (one delegated task) | Immutable once spawned |

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md

<a id="DEF-PROVIDER-NATIVE"></a>
### 1.4 Separation from provider-native concepts

A Persona is **not** a provider-native "agent" (e.g., OpenCode's `Agent.Info`, Cursor's agent definitions under `.cursor/agents/`). Provider-native agent configs are consumed by the Provider facade (`Plans/CLI_Bridged_Providers.md`) as transport-level concerns. Personas are a Puppet Master abstraction that sits above the provider layer.

A Persona is **not** a provider-native "skill" or "plugin." Skills (`Plans/Skills_System.md`) are invocable context-injection units. Plugins (`Plans/Plugins_System.md`) are extension modules with hook-based lifecycle. A Persona MAY reference skills via `default_skill_refs` but does not contain skill logic itself.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 2. Storage layout

<a id="STORAGE-LAYOUT"></a>

Persona files are stored in a deterministic two-tier layout. Project-local Personas override global Personas by `persona_id`.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 Project-local

```
.puppet-master/personas/<persona_id>/PERSONA.md
```

Scoped to the project workspace root. These Personas are available only when that project is active.

### 2.2 Global

```
~/.config/puppet-master/personas/<persona_id>/PERSONA.md
```

Available across all projects. Overridden by a project-local Persona with the same `persona_id`.

### 2.3 Resolution order

When resolving a Persona by `persona_id`:
1. If `persona_id` is a protected built-in ID from §6, resolve the PM-owned bundled `PERSONA.md` definition first. User-created project or global files may not shadow protected built-ins.
2. Check `.puppet-master/personas/<persona_id>/PERSONA.md` in the active project root.
3. If not found, check `~/.config/puppet-master/personas/<persona_id>/PERSONA.md`.
4. If not found, the Persona is unresolved. The Orchestrator MUST fall back to a bare-context run (no Persona-specific instructions injected) and log a warning.

**Folder-name invariant:** The folder name MUST match the `id` field in the PERSONA.md frontmatter. A mismatch is a validation error.

ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION
### 2.4 Built-in scope

Protected built-ins and bundled first-party specialties use the same `PERSONA.md` schema as user Personas, but their source scope is different:
- protected core built-ins are PM-owned, user-immutable, and not deletable or disableable by the user.
- bundled first-party specialty Personas are PM-owned defaults that users may customize, disable, and restore to the shipped default.
- PM may update shipped protected and bundled definitions across product versions; user immutability does not mean the product definition is permanently frozen.
- imported provider-native agent files are seed/import sources only and never become the runtime source of truth.

ContractRef: ContractName:Plans/Personas.md#RESERVED-PERSONAS, ContractName:Plans/FinalGUISpec.md

---

## 3. Persona format (schema)

<a id="PERSONA-SCHEMA"></a>

A Persona file (`PERSONA.md`) consists of YAML frontmatter followed by a Markdown body containing the Persona's system instructions.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md

### 3.1 YAML frontmatter

```yaml
---
id: "rust-engineer"
name: "Rust Engineer"
description: "Expert Rust developer specializing in systems programming, memory safety, and zero-cost abstractions."
default_mode: "regular"
default_platform: null
default_permissions_profile: null
default_model: null
default_variant: null
temperature: null
top_p: null
reasoning_effort: null
talkativeness: "model_default"
default_skill_refs: []
disabled_plugins: []
preferred_tools: []
discouraged_tools: []
tool_usage_guidance: ""
tags: ["language", "rust", "systems"]
aliases: []
---
```

### 3.2 Field definitions

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | **Required** | `string` | Unique Persona identifier. See §3.3 for validation rules. |
| `name` | **Required** | `string` | Human-readable display name. Max 100 characters. |
| `description` | **Required** | `string` | One-paragraph description of the Persona's expertise. Max 500 characters. |
| `default_mode` | Recommended | `string` enum | Default run mode (`ask`, `plan`, `regular`, `yolo`) per `Plans/Run_Modes.md`. If omitted, inherits from run config. |
| `default_platform` | Optional | `string` or `null` | Preferred provider/platform for this Persona. Runtime resolution and fallback semantics are defined in `Plans/Models_System.md`. |
| `default_permissions_profile` | Recommended | `string` or `null` | Named permissions profile to apply when this Persona is active. References a profile defined in the Permissions system (`Plans/Permissions_System.md`). `null` means inherit from run config. |
| `default_model` | Optional | `string` or `null` | Default model identifier (`provider_id/model_id`) for this Persona. Selection priority and validation per `Plans/Models_System.md`. `null` means inherit. |
| `default_variant` | Optional | `string` or `null` | Default variant name for this Persona (e.g., `"fast"`, `"powerful"`). Variant semantics per `Plans/Models_System.md`. `null` means inherit. |
| `temperature` | Optional | `number` or `null` | Preferred sampling temperature when the active provider transport supports it. Unsupported values are recorded as skipped, not silently applied. |
| `top_p` | Optional | `number` or `null` | Preferred nucleus sampling value when supported by the active provider transport. |
| `reasoning_effort` | Optional | `string` or `null` | Preferred provider-specific effort/reasoning level when supported. |
| `talkativeness` | Optional | `string` enum | Persona-level verbosity/collaboration preference. Allowed values: `talk_a_lot_more`, `talk_more`, `talk_a_little_more`, `model_default`, `talk_a_little_less`, `talk_less`. This is a behavior/instruction control, not a provider sampling knob. |
| `default_skill_refs` | Recommended | `string[]` | List of skill IDs to auto-load when this Persona is active. References skills per `Plans/Skills_System.md`. Empty array means no auto-loaded skills. |
| `disabled_plugins` | Optional | `string[]` | List of plugin IDs to silence during hook dispatch when this Persona is active. Plugins listed here are not unloaded, only skipped during hook invocation. Semantics per `Plans/Plugins_System.md` §7.3. Empty array means no plugins disabled. |
| `preferred_tools` | Optional | `string[]` | Tool IDs the Persona should proactively prefer when planning execution. Guidance only by default; it does not override Permissions allow/ask/deny enforcement. |
| `discouraged_tools` | Optional | `string[]` | Tool IDs the Persona should avoid unless needed. Guidance only by default. |
| `tool_usage_guidance` | Optional | `string` | Freeform tool-planning guidance for this Persona. |
| `tags` | Recommended | `string[]` | Categorization tags for filtering and search. Values from: `phase`, `task`, `subtask`, `iteration`, `cross-phase`, `language`, `domain`, `framework`, and freeform tags. |
| `aliases` | Optional | `string[]` | Natural-language invocation aliases and display synonyms used during Persona resolution. |

### 3.3 Validation rules

Persona validation MUST enforce:
- `id` uses lower-case kebab-case (`[a-z0-9]+(-[a-z0-9]+)*`) and matches the storage folder name.
- `id` is globally unique within its source scope after project/global resolution.
- user-created project/global Personas may not use or shadow protected core IDs from §6.
- imported provider-native files that collide with protected IDs are imported only as non-authoritative seed material or saved under a non-reserved ID chosen by the user/import flow.
- `name` and `description` are required and must stay within the limits in §3.2.
- enum fields must use the canonical values from their owner systems.
- provider/model/runtime-control preferences are validated against `Plans/Models_System.md` at resolution time; unsupported controls are recorded as skipped or clamped, not silently applied.
- `default_skill_refs`, plugin IDs, and tool IDs must reference known registries when those registries are available; unresolved refs are displayed as readiness warnings rather than hidden.
- protected core built-ins are read-only to user edit flows, cannot be deleted or disabled, and cannot be project-overridden.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md

### 3.3A Field naming alignment with runtime identity

Persona-related runtime identity fields align to the shared owner contract:
- `requested_persona`
- `effective_persona`

ContractRef: ContractName:Plans/Contracts_V0.md

`_id` variants are retired from canonical runtime payload examples.
### 3.4 Markdown body

The Markdown body following the frontmatter contains the Persona's system instructions. This content is injected into the Agent's compiled context (see §5). There are no structural constraints on the body beyond valid Markdown. Recommended sections: expertise areas, behavioral guidelines, output format preferences.

---

## 4. GUI requirements

<a id="GUI-PERSONAS"></a>

The primary Persona management surface is **Agent Config > Personas**. Settings remains a routing/help surface for policy-bearing controls and may link into Agent Config, but Settings is not the main Persona prompt browser or editor.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 4.1 Personas library and editor (Agent Config > Personas)

Agent Config > Personas MUST provide:

1. **Library view:** Table of all resolved Personas grouped by protected core, bundled specialty, project-local, global, imported seed, disabled, and advanced/internal where applicable. Columns: Name, ID, Scope, Chat selectable, Child/subagent eligible, Tags, Description (truncated), Readiness, and Source. Sorted alphabetically by display name inside each group; project-local entries sort before global when IDs match.

2. **Create:** "New Persona" opens an editor form with fields for `id`, `name`, `description`, `default_mode` (dropdown), `default_platform`, `default_permissions_profile` (dropdown or null), `default_model`, `default_variant`, `temperature`, `top_p`, `reasoning_effort`, `talkativeness`, `default_skill_refs` (multi-select from skill registry), `preferred_tools`, `discouraged_tools`, `tool_usage_guidance`, `aliases`, `tags` (tag input), and a Markdown body editor. Scope selector: project-local or global. `talkativeness` uses the fixed GUI labels `Talk a lot more`, `Talk more`, `Talk a little more`, `Model default`, `Talk a little less`, and `Talk less`, persisted as the enum values from §3.2. Provider support-state gating for runtime controls is defined in `Plans/Models_System.md#PERSONA-CAPABILITY-MATRIX`; `talkativeness` is Persona-instruction-level behavior and therefore follows normal Persona prompt injection rather than provider runtime-control gating.

3. **Prompt visibility:** Selecting a row shows a prompt preview pane and an effective runtime/control summary. The editor must expose the stored Markdown body and a requested/effective compiled prompt preview when enough runtime context is available. Unsupported or skipped controls are shown as skipped, disabled, or clamped rather than silently accepted.

4. **Edit:** Row click or edit opens the same editor pre-populated. Editing a global Persona while a project is active offers "Save as project override" (creates project-local copy) or "Save globally." Protected core built-ins are read-only in the editor; users can duplicate them under a non-reserved ID but cannot modify or shadow the protected ID.

5. **Disable and restore:** Bundled first-party specialty Personas can be disabled and restored to the shipped default after user customization. Protected core built-ins cannot be disabled. User-created and imported Personas can be deleted with confirmation.

6. **Delete:** Delete button with confirmation modal. Deleting a project-local Persona that overrides a global one reveals the global version. Deleting a global Persona with no project override removes it entirely. Delete is not shown for protected core built-ins.

7. **Schema validation on save:** On every save, validate the PERSONA.md against the schema (§3). Display inline errors for: invalid `id` format, reserved `id` usage, name/description length violations, invalid `default_mode`, folder-name mismatch, and attempted protected-ID shadowing. Block save until errors are resolved.

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/Personas.md#PERSONA-VALIDATION

### 4.2 Permission profile editing

When editing a Persona, the `default_permissions_profile` field allows selecting from named permission profiles defined in the Permissions system (`Plans/Permissions_System.md`). The Personas GUI does not define permission profiles itself — it references them. The dropdown is populated from that registry.

ContractRef: ContractName:Plans/Personas.md#GUI-PERSONAS

### 4.3 Skill/plugin references

The `default_skill_refs` field presents a multi-select populated from the skill registry (`Plans/Skills_System.md`). Skills not yet installed show as "(not installed)" with a link to the Catalog (§7.4.3 in `Plans/FinalGUISpec.md`).

### 4.4 No mutation of external agent files

Editing Personas in the Puppet Master GUI MUST NOT mutate files under `.claude/`, `.github/`, `.cursor/`, or any other provider-native agent directory. Personas are stored exclusively in the Puppet Master Persona storage layout (§2). Provider-native agent files may be read as a seed source for initial Persona creation (one-time import), but subsequent edits are isolated to Puppet Master's own storage.

ContractRef: ContractName:Plans/Personas.md#STORAGE-LAYOUT

### 4.5 ELI5/Expert copy

Persona management UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0. Tooltip keys: `tooltip.personas.*` prefix. Both Expert and ELI5 variants are required.

---

## 5. Integration: Persona application to a run

<a id="PERSONA-INJECTION"></a>

### 5.1 Selection

Persona selection must be deterministic and must not silently collapse child roles into the parent Persona.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md

Canonical child Persona resolution order:
1. explicitly requested child Persona
2. child subagent type or child task-type mapping
3. weak parent Persona hint only when compatible and still ambiguous
4. safe general-purpose fallback

Compatibility guard:
- the weak parent hint cannot override the requested child task.
- it cannot override runtime/provider restrictions.
- it cannot be used to widen permissions or mode.
- if no specialized match is safe, the fallback is a general child Persona, not a copy of the parent Persona.

Crew default:
- crew members normally share the same task framing.
- they often share the same Persona.
- model/provider diversity, not Persona diversity, is the default defining behavior of crew mode.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md
### 5.2 Context injection

Persona injection for child runs operates on a reconstructed handoff bundle, not on a blind copy of the parent prompt state.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

Child Persona context rules:
- inject the effective child Persona content resolved from PM Persona storage.
- include current task, working context, required constraints, and requested/effective runtime state.
- include the current effective context-shaping state without making a lossy child copy the only truth.
- do not forward Assistant memory to child runs.
- child runs inherit only the effective compatible subset of parent-allowed tools, skills, plugins, and MCP capabilities.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md
### 5.3 Run-mode interaction

The Persona's `default_mode` field interacts with the run mode system (`Plans/Run_Modes.md`) as follows:

| Source | Priority | Description |
|--------|----------|-------------|
| Explicit run-envelope `mode` | Highest | User- or Orchestrator-specified mode for this run. |
| Persona `default_mode` | Lower | Applied only if the run envelope does not specify a mode. |
| System default (`regular`) | Lowest | Applied if neither run envelope nor Persona specifies a mode. |

ContractRef: ContractName:Plans/Run_Modes.md

### 5.4 Cross-references to SSOT subsystems

The following integrations are specified by their subsystem SSOTs and MUST NOT be restated here:

- **Permissions:** Persona `default_permissions_profile` → `Plans/Permissions_System.md`.
- **Skills:** Persona `default_skill_refs` → `Plans/Skills_System.md`.
- **Plugins:** Plugin hooks that transform Persona context → `Plans/Plugins_System.md`.
- **Models/runtime controls:** Per-Persona platform/model/variant/runtime preferences (`default_platform`, `default_model`, `default_variant`, `temperature`, `top_p`, `reasoning_effort`) → `Plans/Models_System.md`.
- **Behavior controls:** Per-Persona `talkativeness` instruction behavior and effective-state emission → `Plans/Prompt_Pipeline.md`.
- **Prompt/runtime observability:** Effective Persona/runtime resolution record and provider capability filtering → `Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD` and `Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING`.
- **Tool guidance:** Persona tool-preference fields remain guidance; hard enforcement stays in `Plans/Permissions_System.md`.

---

## 6. Reserved Personas

<a id="RESERVED-PERSONAS"></a>

The following Persona IDs are **protected Puppet Master core built-in IDs**. They MUST NOT be used for user-created Personas and MUST NOT be shadowed by project-local or global Persona files. When the corresponding built-in `PERSONA.md` definitions are present, they remain selectable and assignable according to the eligibility table below.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#PERSONA-VALIDATION

| Reserved ID | Display label | Planned purpose | Chat selectable | Child/subagent eligible | Mutability |
|-------------|---------------|-----------------|-----------------|-------------------------|------------|
| `assistant` | Assistant | Default direct-chat Persona with broad capability and a warm, collaborative, helpful style. | Yes, default for chat | No | Protected core built-in |
| `general-purpose` | General | Broad work-first execution Persona for complex multi-step work that combines inspection, action, and verification. | Yes | Yes | Protected core built-in |
| `overseer` | Overseer | Governance/conductor Persona for delegation, completeness, review, promotion, corroboration, weak-integration detection, and auditable remediation judgment. | Yes | Yes, for governance child roles | Protected core built-in |
| `bash` | Bash | Terminal-execution Persona for command-heavy work and concise command-output reduction. | No | Yes, subagent-only | Protected core built-in |
| `teacher` | Teacher | Warm, highly explanatory help and teaching Persona for PM usage, settings, concepts, and adjacent developer tooling. | Yes | No | Protected core built-in |
| `collaborator` | Collaborator | User-facing planning, clarification, ideation, and collaborative shaping Persona. | Yes | Yes | Protected core built-in |
| `researcher` | Researcher | Read-only research Persona that combines local codebase evidence with current external sources. | Yes | Yes | Protected core built-in |
| `deep-researcher` | Deep Researcher | Read-only high-effort research Persona for broader source coverage, comparison, and synthesis. | Yes | Yes | Protected core built-in |
| `explorer` | Explorer | Fast, read-only codebase investigation Persona for finding files, tracing symbols, and returning evidence-rich local findings. | No | Yes, subagent-only | Protected core built-in |

**Enforcement:** The Persona validation logic (§3.3) MUST reject creation of user Personas with these IDs. If a built-in Persona with one of these IDs exists in canonical Persona storage, `select_for_node()` and surface-specific resolvers MAY return it only when the target surface is compatible with its eligibility. Imported provider-native agent files MUST NOT overwrite these IDs; collisions are handled per §10.5/§10.8.

**Display normalization:** Natural-language forms such as `Assistant`, `General`, `Overseer`, `Bash`, `Teacher`, `deep researcher`, and `general purpose` normalize to the canonical IDs above. `Document Writer` is legacy/source-lineage wording and MUST NOT resolve to a protected core Persona unless a later owner decision explicitly reopens it. `_id` runtime field names remain stale aliases; the runtime identity fields are `requested_persona` and `effective_persona`.

ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION, ContractName:Plans/orchestrator-subagent-integration.md
## 7. Relationship to the Persona registry and delegated-subagent registry

The split between `persona_registry` and `subagent_registry` is mandatory.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Tools.md

### 7.1 Canonical `persona_registry`

`persona_registry` owns runtime Persona definitions and Persona IDs used for selection, storage, GUI management, and prompt injection.

### 7.2 Canonical `subagent_registry`

`subagent_registry` owns launchable delegated child-run types. It validates names used by `task`, orchestrator routing, interview routing, and command subtasks.

### 7.3 Required relationship rules

- a launchable subagent type may resolve to a Persona, but the registries are not the same structure.
- Interview stage configuration must persist canonical Persona-oriented field names; legacy `phase_subagents` and `phase_secondary_subagents` are migration aliases only.
- provider-native command names such as `/subagent`, `/agent`, `/fleet`, `/delegate`, or `/replace` are not registry IDs.
- new content must use the requested/effective runtime naming already established elsewhere; stale `*_persona_id` drift should be normalized during reconciliation.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Contracts_V0.md
## 8. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7B and §9B:

### 8.1 Baseline

OpenCode defines agents via `Agent.Info` schema with fields: `name`, `description`, `mode`, `prompt`, `permission`, `model`, `steps`, etc. User-defined agents override via config. Subagents are invoked via the `task` tool. The explore agent is a read-only subagent with a dedicated prompt.

### 8.2 Puppet Master deltas

1. **Persona as file artifact:** OpenCode stores agent definitions in code (`agent.ts`) and config. Puppet Master stores Personas as files on disk (`PERSONA.md`) in a deterministic layout, enabling user editing, project-level overrides, and GUI management without code changes.
2. **Separation from provider-native agents:** OpenCode agents are tightly coupled to the OpenCode runtime. Puppet Master Personas are provider-agnostic; the Provider facade translates Persona instructions into provider-specific invocation.
3. **No in-code persona content:** Puppet Master does not hardcode Persona descriptions/prompts in source code. All Persona content lives in `PERSONA.md` files resolved at runtime.
4. **Reserved-ID enforcement:** OpenCode has no concept of reserved agent names. Puppet Master reserves IDs for planned future Personas (§6).
5. **Provider-native reusable agents:** `Claude Code CLI` native reusable-agent/subagent support is real (`--agent`, `--agents`, and the `agents` command). PM treats that as a native-specialized-agent projection path for Personas when applicable, not as plain prompt stuffing and not as the same primitive as the PM Persona registry.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 9. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Progression_Gates.md

<a id="AC-P01"></a>
**AC-P01:** Every `PERSONA.md` file loaded by the runtime MUST pass schema validation (§3). Invalid files MUST be skipped with a warning log entry.

<a id="AC-P02"></a>
**AC-P02:** Project-local Personas MUST override global Personas with the same `id`. Resolution order (§2.3) MUST be deterministic.

<a id="AC-P03"></a>
**AC-P03:** Reserved Persona IDs (§6) MUST be rejected by the validation logic when a user attempts to create a Persona with a reserved ID.

<a id="AC-P04"></a>
**AC-P04:** Editing a Persona in the GUI MUST NOT create, modify, or delete files under `.claude/`, `.github/`, `.cursor/`, or any provider-native agent directory.

<a id="AC-P05"></a>
**AC-P05:** The context compiler MUST inject the resolved Persona's Markdown body into the Instruction Bundle for every Agent run where a Persona is assigned.

<a id="AC-P06"></a>
**AC-P06:** The folder name for every stored Persona MUST match the `id` field in its frontmatter. A mismatch MUST be treated as a validation error.

<a id="AC-P07"></a>
**AC-P07:** The GUI Personas management card MUST validate the schema on save and block saves with validation errors.
## 10. Persona Runtime Contract Expansion (2026-03-06)

Persona remains part of the shared requested/effective runtime identity model.

Canonical persisted/runtime fields remain:
- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `persona_override_scope`
- `persona_override_owner_id`
- applied/skipped control fields from the shared runtime contract

Rules:
- `requested_persona_id` and `effective_persona_id` are not canonical persisted field names
- requested/effective, inherited/overridden, and honored/skipped/clamped remain distinct concepts
- blocked-state payloads must use canonical requested/effective Persona identity fields rather than reviving `requested_persona_id` or `effective_persona_id`.
- `Plans/Prompt_Pipeline.md` and `/Prompt_Pipeline.md` may still mention tier and tier_id in run-envelope lineage, but persona_override_owner_id must not use tier_id as canonical owner scope.
- Cross-doc runtime identity references in `Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, and `/runtime` must converge on requested_persona and effective_persona instead of requested_persona_id or effective_persona_id.
- `Plans/Contracts_V0.md` and `/Contracts_V0.md` explicitly forbid requested_persona_id and effective_persona_id as parallel canonical fields; Personas.md, Contracts_V0, Contracts_V0.md, and every runtime-facing consumer must treat those names as stale aliases only.
- `Plans/Personas.md` and `/Personas.md` define Overseer personas in relation to lanes: package-overseer and seam-overseer assignments are configurable Persona selections, not implicit implementation-persona reuse.
- Persona-adjacent references through `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Glossary.md`, and `/Glossary.md` must point back to this owner for Persona identity and naming.
- Consumer requirements must remove requested_persona_id and effective_persona_id from canonical examples and use requested_persona/effective_persona instead.
- historical views use frozen captured runtime identity rather than recomputing persona from current settings

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md

Auto-resolution precedence is:
1. explicit manual/run override
2. scoped natural-language override
3. surface-specific explicit mapping
4. surface auto resolver candidate
5. config default
6. canonical fallback

Rules:
- actor type outranks stack hints
- operation type outranks stack hints
- governance/review/corroboration personas do not collapse into implementation personas merely because repo language hints are strong
- `persona_override_owner_id` must align to thread/run/node/attempt/actor lineage rather than to `tier_id`

`owner_hint` is advisory until resolved by the crew-role map. PM checks the active agent config `crew.roles` map, for example `{ "code-review": { provider, model, persona } }`, using exact tag matches such as `code-review`, `test-writer`, or `researcher`; partial matches are not supported in MVP. If no mapping exists, PM falls back to the current session provider/model while selecting the requested Persona behavior. If a mapping exists but the mapped provider or model is unavailable, PM returns `capability_unavailable` and does not silently fall back to a different provider/model/persona tuple.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md
## 11. Core Persona catalog

<a id="CORE-PERSONA-CATALOG"></a>

Core Personas are protected PM-owned behavior contracts. They define the highest-level user-visible and runtime-selected Persona family; specialty Personas refine domain, stack, tool, or workflow fit beneath this layer.

### 11.1 Shared core rules

- Core Personas default model/provider/runtime controls to `Auto` in the UI, stored as inherited/null fields unless a PM-owned definition explicitly sets a value. `Auto` means inherit from the parent run, surface, project policy, or resolver record according to `Plans/Models_System.md`.
- Core Persona definitions are user-immutable and not deletable. PM may update their shipped definitions across product versions.
- `explorer` and `bash` are subagent-only and are not available in the chat manual Persona picker.
- `assistant` and `teacher` are direct user-facing Personas and are not hidden worker/subagent Personas.
- All other protected core Personas are chat-selectable unless a more specific owner rule forbids the surface.
- Child runs must record requested/effective Persona and selection reason; child Persona selection does not auto-inherit the parent Persona.
- Plan/deep-plan `Auto` may switch Persona across phase boundaries. For example, a planning Persona may switch to `general-purpose`, `assistant`, or a specialty Persona once the user accepts a plan and execution begins.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md

### 11.2 `assistant`

`assistant` is the default chat Persona. It has broad capability similar to `general-purpose`, but its default style is warmer, more talkative, more collaborative, and more overtly helpful. It is allowed to do real work when action is warranted, but it must not become a hidden worker Persona or a passive help-bot that avoids substantive execution.

Boundaries:
- use `general-purpose` for colder, work-first broad execution.
- use `teacher` for explicitly pedagogical or beginner-oriented explanation.
- use `researcher`, `deep-researcher`, `explorer`, `bash`, or a specialty Persona when those are materially better fits.

### 11.3 `general-purpose`

`general-purpose` displays as **General**. It is the broad core execution Persona for complex multi-step work that requires reading, reasoning, editing, command execution, verification, and follow-through. It inherits the main conversation model by default, has broad tool access subject to permissions, and is the fallback broad worker when no narrower core or specialty Persona is clearly better.

Boundaries:
- it may act and edit; `explorer` stays read-only.
- it may run commands; `bash` is the terminal-first command-output reduction Persona.
- it should hand off to `researcher` or `deep-researcher` when current external research is central.
- it should not over-delegate when it can complete a coherent task itself.

### 11.4 `explorer`

`explorer` is a fast, read-only core Persona for codebase-local investigation. It is subagent-only and not chat-selectable. It searches files, symbols, configs, tests, docs, and call sites; traces relationships; and returns a concise synthesis backed by enough evidence that the parent usually does not need to rerun the same search.

Rules:
- stay read-only; do not edit, refactor, or implement.
- search broadly enough to avoid shallow false certainty.
- use parallel exploration where it materially improves coverage.
- be thorough by default even when a quick/medium/thorough hint exists.
- return layered output: direct synthesis, supporting file references, uncertainties, and handoff recommendation when relevant.
- do not use web research by default; hand off to `researcher` when current external information is needed.

### 11.5 `bash`

`bash` is a core terminal-execution Persona. It is subagent-only and not chat-selectable. Its purpose is to run command sequences in an isolated context, inspect stdout/stderr/exit status/side effects, and report the smallest actionable result instead of flooding the parent with raw logs.

Rules:
- prefer the minimum useful command sequence.
- distinguish command failure, successful command with problematic output, and intended success.
- summarize important output, state changes, errors, and blockers.
- command-driven file changes may occur when they are natural side effects of scripts, generators, formatters, migrations, or maintenance commands.
- do not become a general planner or coding Persona because a command exposed an issue.
- hand off to `general-purpose` for manual implementation, `explorer` for codebase inspection, and `researcher` for current external research.

### 11.6 `researcher`

`researcher` is a read-only Persona that combines local codebase inspection with current external sources. It is appropriate for debugging strange issues, compatibility checks, solution discovery, current documentation review, GitHub issues/PRs, forums, papers, official docs, MCP resources, skills, and plugins when those sources materially improve the answer.

Rules:
- stay read-only and do not take over implementation.
- ground external research in the project context.
- use multiple search angles when one query is likely to miss evidence.
- prefer high-signal sources and compare perspectives.
- seek counter-evidence when sources look one-sided, promotional, stale, or repetitive.
- return citations, local findings, external findings, implications, uncertainty, and handoff guidance.

### 11.7 `deep-researcher`

`deep-researcher` is the read-only high-effort counterpart to `researcher`. It is for broader source coverage, deeper comparison, strategic debugging, architecture/solution evaluation, plan/deep-plan support, and higher-stakes decision support.

Rules:
- decompose complex research into sub-questions.
- inspect local context, then pursue multiple external source classes.
- compare alternatives and tradeoffs instead of stopping at the first plausible answer.
- use parallel research workers when sub-questions are independent.
- return a structured synthesis with recommendation, comparison, evidence, risks, caveats, and next steps.
- hand off to an execution-capable Persona when the user wants implementation or file changes.

### 11.8 `teacher`

`teacher` is a warm, highly explanatory help Persona for teaching PM usage, settings, workflows, modes, Personas, Orchestrator behavior, and adjacent developer tooling such as GitHub, Docker, coding concepts, MCPs, skills, and plugins. It is user-facing and not a subagent Persona.

Rules:
- explain in simple terms first and define jargon when useful.
- anchor teaching in PM's actual UI, settings, flows, capabilities, and terminology.
- provide concrete steps when the user wants instructions.
- allow light operational help such as changing a setting or configuring a skill/MCP.
- hand off to `assistant`, `general-purpose`, or a specialty Persona when the task becomes real implementation/build work.
- PM documentation coverage is a product dependency for this Persona; missing feature/help coverage must be surfaced instead of guessed.

### 11.9 `overseer`

`overseer` is a governance/conductor Persona, not the scheduler personified and not a normal node-worker implementation Persona. It supervises package/seam execution, selects or recommends workers, demands evidence, judges readiness, and prevents incomplete or weakly integrated work from being treated as done. It may express delegation-first, verification-first, wiring/completeness-sensitive, integration-aware, audit-minded behavior, and it may select or spawn specialist workers where runtime policy permits. It must not claim canonical ownership of dispatch, readiness, blocked state, retry budgets, wakeups, or hard Orchestrator mechanics.

Boundary rules:
- runtime scheduler/executor owners decide dispatchability, readiness, transitions, blocked-state lifecycle, retries, wakeups, and attempt identity.
- `Package Overseer` and `Seam Overseer` remain graph/runtime governance roles for work packages and feature seams.
- the user-facing `overseer` Persona is the abstraction over that governance family unless a later owner decision splits it.
- subjective audit mechanics such as exact reviewer counts, consensus reduction, forced remediation, and observability are Orchestrator/runtime contracts; Persona prose may mirror the instincts but must not re-own the mechanics.
- in package-overseer mode, govern package-local readiness truth, worker selection/review cadence, evidence, package-local concerns, and package-local remediation recommendations; do not claim cross-package promotion or seam completion without explicit higher-scope authority.
- in seam-overseer mode, judge cross-package integration, wiring, architecture consistency, GUI/runtime fit, workflow completeness, weak integration, and whether packages actually form a coherent feature.
- actor type outranks stack hints: overseer, reviewer, corroborator, recovery, graph-patch, and node-worker roles must not collapse into implementation Personas just because a language or framework is detected.
- concerns, critical/major review findings, corroboration gaps, and graph-patch needs must remain visible and routed; do not bury disagreement or missing wiring in prose.
- direct implementation is fallback/override behavior only. It is acceptable only when policy permits it and the change is narrow and mechanical, no suitable worker can be spawned, the change is an oversight artifact update, or the user explicitly asks Overseer to act directly. Substantial feature work should hand off to `general-purpose` or a suitable specialty/node-worker Persona.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### 11.10 Document generation boundary

There is no protected core `document-writer` Persona. Durable document creation is workflow behavior handled by the owning surface and the resolved Persona for that stage: commonly `collaborator` during requirements/specification discovery, `assistant` for broad user-facing drafting, `general-purpose` for mixed execution-oriented writing, or a narrow specialty Persona when one is available and authorized.

Rules:
- do not create or require a dedicated core Document Writer handoff.
- generated requirements, section summaries, plans, reports, and other durable artifacts remain draft workflow outputs until the relevant user or validation gate accepts them.
- preserve source fidelity, cross-references, terminology, and owner boundaries.
- avoid inventing product facts when the supporting canon is incomplete.
- hand off to `researcher` or `deep-researcher` when the writing task needs current external source discovery.

### 11.11 `collaborator`

`collaborator` is the user-facing planning, clarification, ideation, and co-shaping Persona for turning rough ideas into clear, complete, testable project intent. It is more interactive and question-oriented than `general-purpose`, less default-chat-general than `assistant`, and more oriented toward jointly shaping requirements, scope, tradeoffs, missing decisions, researched options, and acceptance criteria before writing or building begins.

Default tone: warm, eager, curious, proactive, technically serious, and creative, with the feel of a friendly senior software engineer, architect, or developer who helps sharpen ideas while still challenging weak, risky, contradictory, or underspecified ideas directly and constructively.

Rules:
- be the primary Persona fit for Chain Wizard, Requirements Doc Builder, interview, scope-probe, specification-discovery, and future dynamic section-thread conversations.
- ask targeted questions in digestible batches; keep asking follow-ups over the flow instead of dumping a giant questionnaire at once.
- challenge weak, risky, contradictory, or underspecified ideas directly but constructively.
- use current research aggressively when it can change questions, options, warnings, recommendations, or architectural direction.
- coordinate read-only `researcher`, `deep-researcher`, `explorer`, or specialty support when discovery is broad, deep, codebase-specific, or domain-specific.
- synthesize research into better questions, options, recommendations, warnings, and decisions rather than defaulting to raw link-reporting; preserve source/evidence pointers in ledgers or artifacts when traceability requires them.
- require explicit user or workflow confirmation before document generation, plan handoff, or build handoff.
- treat requirements drafting and section summaries as workflow outputs, not as a handoff to a separate core Document Writer.
- maintain the formal section/thread ledger when that system is available, recording decisions, assumptions, constraints, unresolved questions, research findings, implementation implications, cross-section dependencies, and do-not-forget details.
- hand off to `general-purpose` or a specialty Persona when the work is ready for implementation, and to `overseer` when readiness/governance judgment becomes the better fit.
## 12. Specialty Persona catalog and curation

<a id="SPECIALTY-PERSONAS"></a>

Specialty Personas are the configurable layer. They may be first-party bundled Personas, project-local Personas, global user Personas, imported seed Personas, or future optional template/catalog entries. They are not protected core built-ins unless listed in §6.

### 12.1 Specialty mutability and source rules

- first-party bundled specialty Personas may be modified, disabled, and restored to default.
- user-created and imported specialty Personas may be edited or deleted.
- provider-native files under `.claude/agents`, `.cursor/agents`, `.github`, or other provider-native directories are seed/import material only.
- PM adaptation must translate provider-native `tools` lists into PM permission/tool-preference metadata rather than copying them as authority.
- provider-native `WebFetch`, `WebSearch`, communication-protocol JSON examples, mandatory `context-manager` steps, KPI/SLA guarantees, and polished completion claims are migration inputs, not literal PM built-in guarantees.
- default model behavior for specialties is `Auto`/inherit unless a PM-owned definition explicitly sets a provider/model preference. External benchmark model recommendations are ignored.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md

### 12.2 First-party specialty groups

The first-party specialty browser groups Personas before it lists individual stack/tool refinements:

| Group | Typical role IDs |
|-------|------------------|
| Review, audit, and verification | `code-reviewer`, `qa-expert`, `test-automator`, `accessibility-tester`, `security-auditor`, `security-engineer`, `compliance-auditor` |
| Design, research, and documentation | `ux-researcher`, `ui-designer`, `technical-writer` |
| Implementation generalists | `backend-developer`, `frontend-developer`, `fullstack-developer`, `mobile-developer`, `api-designer`, `debugger` |
| Data, platform, operations, and reliability | `database-administrator`, `deployment-engineer`, `devops-engineer`, `performance-engineer`, `websocket-engineer` |
| Language and framework specialists | `rust-engineer`, `python-pro`, `typescript-pro`, `javascript-pro`, `php-pro`, `laravel-specialist`, `react-specialist`, `nextjs-developer`, `vue-expert`, `java-architect`, `csharp-developer`, `swift-expert`, `sql-pro` |
| Prompt and LLM systems | `prompt-engineer` |

`technical-writer` is a specialty/template candidate only. It is not a protected core Persona and MUST NOT be used to recreate `document-writer` by another name; workflow owners may use `collaborator`, `assistant`, `general-purpose`, or a narrow specialty for document drafting according to stage fit and configured availability.

`project-manager`, `product-manager`, and `context-manager` are not PM Persona catalog entries. Delivery sequencing, product framing, and context/memory behavior belong in orchestration, interview, prompt pipeline, and memory systems rather than user-selectable Personas under those names.

### 12.3 Approved first-wave additions

These narrow specialists are approved for the first-party specialty catalog because they map directly to common IDE tasks and clear stack/tool seams:
- `docker-expert`
- `github-actions-expert`
- `graphql-expert`
- `openapi-expert`
- `postgres-expert`

Other benchmark-derived candidates such as `design-system-architect`, `observability-engineer`, `threat-modeling-expert`, `error-detective`, `incident-responder`, `dx-optimizer`, `api-documenter`, `monorepo-architect`, `playwright-expert`, `kubernetes-expert`, `terraform-expert`, `prisma-expert`, `oauth-oidc-expert`, `jwt-expert`, and `rest-expert` remain future catalog/template candidates until separately promoted by owner-doc changes.

### 12.4 Prompt-shape normalization

PM-native bundled specialty prompts should be small and sharp rather than copied from long provider-native source files:
- most specialties target roughly 250-500 words.
- complex cross-stack or strategy specialties may need roughly 450-700 words.
- internal/helper or narrow stack specialties should often stay around 180-350 words.
- bodies emphasize mission, when to use, when not to use, operating posture, response approach, useful heuristics, boundaries, and handoff expectations.
- permission/tool posture belongs mostly in metadata.
- hard numeric goals, fake benchmark claims, vendor/version encyclopedias, generic tool lists, and raw JSON communication examples are avoided unless the role truly requires them.

### 12.5 Auto-resolution and collision rules

Auto Persona resolution must be predictable:
- role/function axis outranks stack axis for the first pick.
- operation type outranks repository language hints.
- review/audit roles outrank implementation roles for validation, governance, and review tasks.
- implementation roles outrank review roles for build/change tasks.
- framework/tool specialists refine broader roles and normally replace them only when explicitly requested or strongly matched.
- `fullstack-developer` loses to backend/frontend or stack-specific matches when the task and repo clearly justify a narrower Persona.
- governance/review/corroboration Personas do not collapse into implementation Personas merely because repository language hints are strong.

The browser uses grouping and auto-resolution together: top-level group, specialty within group, optional stack/framework refinement, then project/global override.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Personas.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### P-002 - Doc Compliance And SSOT References

```yaml
plan_unit_id: P-002
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Personas.md preserves the canonical title, compliance block, and DRY reference map for Persona-system consumers.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The canonical title and compliance block remain addressable.
  - The SSOT reference list preserves exact Plan paths and DRY lineage.
  - The subagent registry canonical-name reference remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_doc_reference_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0003
preserved_exact_tokens:
  - "Personas (Canonical SSOT)"
  - "Puppet Master"
  - "SSOT references (DRY)"
  - "DRY:DATA:subagent_registry"
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-003 - Persona SSOT Scope

```yaml
plan_unit_id: P-003
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Plans/Personas.md is the single canonical source for Persona definitions, storage layout, schema, and selection rules; other documents must reference Personas anchors instead of restating those rules.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona definitions, storage layout, schema, and selection rules remain owned by Personas.md.
  - Consumer docs reference Personas anchors rather than restating Persona rules.
  - The DRY ContractRef remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_ssot_restated_in_consumers
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0002
preserved_exact_tokens:
  - "single canonical source of truth"
  - "Plans/Personas.md#PERSONA-SCHEMA"
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
negative_constraints:
  - "Consumer plans must not restate Persona definitions, storage layout, schema, or selection rules."
preserved_contractrefs:
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Personas.md
```

### P-004 - Agent Runtime Definition

```yaml
plan_unit_id: P-004
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  An Agent is a concrete ephemeral AI execution unit spawned by the Orchestrator for a node in the run graph, receiving compiled context and producing a response stream.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Agent remains a running AI execution unit, not a persistent Persona artifact.
  - Agent lifetime remains one run.
  - Contracts_V0 and Executor Protocol ownership references are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_persona_identity_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0005
preserved_exact_tokens:
  - "DEF-AGENT"
  - "Agent"
  - "running AI execution unit"
  - "compiled context"
  - "ContractName:Plans/Contracts_V0.md"
  - "ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - Plans/Personas.md
```

### P-005 - Subagent Child Run Definition

```yaml
plan_unit_id: P-005
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  A subagent is a child run that resolves a Persona for the child task; it does not auto-inherit the parent Persona and is not defined by provider-native agent-file syntax.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Child Persona may differ materially from parent Persona.
  - Provider-native agent files may seed or export Persona content but PM Persona storage remains canonical.
  - Crew mode may share Persona while varying model or provider selection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_persona_inheritance_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0006
preserved_exact_tokens:
  - "Subagent"
  - "child run"
  - "PM Persona storage remains canonical"
  - "crew mode"
  - "session.parentID"
negative_constraints:
  - "A subagent is not merely the parent Persona, but smaller."
  - "The child Persona does not auto-inherit from the parent."
  - "OpenCode force-marking is adapter classification evidence only."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-006 - Persona Artifact Contract

```yaml
plan_unit_id: P-006
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  A Persona is a persistent YAML-frontmatter Markdown behavior-and-runtime contract that shapes Agent or Subagent behavior and feeds compiled context plus effective runtime resolution.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: true
split_recommendation_reason: >-
  The source definition combines runtime contract content and UI-facing metadata; this unit keeps the canonical definition intact.
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona remains persistent and user-editable until deletion.
  - Persona metadata may include identity, instructions, permissions, skills, provider/model preferences, runtime control preferences, aliases, and UI-facing metadata.
  - The Agent/Subagent/Persona distinction table remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_artifact_contract_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0007
preserved_exact_tokens:
  - "Persona"
  - "YAML-frontmatter Markdown file"
  - "behavior-and-runtime contract"
  - "default_skill_refs"
  - "UI-facing metadata"
  - "Agent"
  - "Subagent"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md"
owner_hints:
  - Plans/Personas.md
```

### P-007 - Provider Native Separation

```yaml
plan_unit_id: P-007
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Personas are Puppet Master abstractions above provider-native agents, provider-native skills, and plugins; provider-native configs stay transport-layer concerns consumed by the Provider facade.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Provider-native agent configs remain transport concerns.
  - Skills remain invocable context-injection units.
  - Plugins remain hook-based extension modules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_native_persona_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0008
preserved_exact_tokens:
  - "provider-native agent"
  - "Agent.Info"
  - ".cursor/agents/"
  - "Provider facade"
  - "default_skill_refs"
negative_constraints:
  - "Persona is not a provider-native agent, skill, or plugin."
  - "Persona does not contain skill logic itself."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/OpenCode_Deep_Extraction.md"
owner_hints:
  - Plans/Personas.md
```

### P-008 - Storage Layout Anchor

```yaml
plan_unit_id: P-008
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona files use a deterministic two-tier layout where project-local Personas override global Personas by persona_id.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The STORAGE-LAYOUT anchor remains preserved.
  - Project-local and global storage roots remain deterministic.
  - Decision Policy ContractRef remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_storage_layout_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0009
preserved_exact_tokens:
  - "STORAGE-LAYOUT"
  - "persona_id"
  - "Project-local Personas override global Personas"
  - "ContractRef: PolicyRule:Decision_Policy.md§2"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Personas.md
```

### P-009 - Storage Roots Resolution And Built In Scope

```yaml
plan_unit_id: P-009
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Project and global PERSONA.md roots, Persona resolution order, folder-name invariant, protected built-in scope, bundled specialty scope, and imported provider-native seed-source rules are canonical in Personas.md.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Project-local Personas are scoped to the active project.
  - Global Personas are available across projects and can be overridden by project-local Personas.
  - Protected built-ins resolve from PM-owned bundled definitions first and cannot be shadowed by user files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_storage_resolution_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0013
preserved_exact_tokens:
  - ".puppet-master/personas/<persona_id>/PERSONA.md"
  - "~/.config/puppet-master/personas/<persona_id>/PERSONA.md"
  - "Folder-name invariant"
  - "protected built-in ID"
  - "bundled first-party specialty Personas"
negative_constraints:
  - "User-created project or global files may not shadow protected built-ins."
  - "Imported provider-native agent files are seed/import sources only and never become the runtime source of truth."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION"
  - "ContractRef: ContractName:Plans/Personas.md#RESERVED-PERSONAS, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Personas.md
```

### P-010 - Persona File Schema And Fields

```yaml
plan_unit_id: P-010
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  PERSONA.md consists of YAML frontmatter followed by Markdown body, with frontmatter fields and enum/value meanings defined by the Personas schema.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The PERSONA-SCHEMA anchor remains preserved.
  - The YAML frontmatter example remains normative for field names.
  - Field definitions preserve required, recommended, optional, and enum semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_schema_field_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0016
preserved_exact_tokens:
  - "PERSONA-SCHEMA"
  - "PERSONA.md"
  - "default_mode"
  - "default_platform"
  - "default_permissions_profile"
  - "default_model"
  - "default_variant"
  - "talkativeness"
  - "aliases"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Personas.md
```

### P-011 - Validation And Runtime Identity Names

```yaml
plan_unit_id: P-011
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona validation enforces ID format, uniqueness, protected-ID, enum, registry-ref, and runtime-control rules; Persona runtime identity fields align to requested_persona and effective_persona.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Validation rejects invalid IDs, protected-ID shadowing, invalid enums, and unavailable references as specified.
  - Provider/model/runtime controls are validated at resolution time.
  - requested_persona and effective_persona are the canonical runtime identity field names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_validation_runtime_identity_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0018
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "_id variants are retired"
  - "lower-case kebab-case"
  - "protected core built-ins"
negative_constraints:
  - "`_id` variants are retired from canonical runtime payload examples."
  - "Unsupported controls are recorded as skipped or clamped, not silently applied."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Personas.md
```

### P-012 - Markdown Body Instructions

```yaml
plan_unit_id: P-012
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The Markdown body after Persona frontmatter contains Persona system instructions, is injected into compiled Agent context, and has no structural constraints beyond valid Markdown.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona system instructions come from the Markdown body.
  - The body is injected into compiled context when a Persona is assigned.
  - Recommended sections remain guidance rather than required structure.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_body_injection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0019
preserved_exact_tokens:
  - "Markdown body"
  - "system instructions"
  - "compiled context"
  - "expertise areas"
  - "behavioral guidelines"
  - "output format preferences"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-013 - Agent Config Personas GUI

```yaml
plan_unit_id: P-013
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Agent Config > Personas is the primary Persona management surface and provides library, create, prompt visibility, edit, disable/restore, delete, and schema-validation workflows.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Settings remains a routing/help surface, not the main Persona prompt browser or editor.
  - The library groups resolved Personas by source/status and shows required columns.
  - Create/edit/delete/disable/restore flows preserve protected core built-in restrictions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_gui_workflow_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0021
preserved_exact_tokens:
  - "Agent Config > Personas"
  - "Library view"
  - "New Persona"
  - "Prompt visibility"
  - "Save as project override"
  - "Protected core built-ins"
  - "Schema validation on save"
negative_constraints:
  - "Settings is not the main Persona prompt browser or editor."
  - "Protected core built-ins cannot be modified, disabled, deleted, or shadowed."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md"
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/Personas.md#PERSONA-VALIDATION"
owner_hints:
  - Plans/Personas.md
```

### P-014 - Permission Profile Editor Reference

```yaml
plan_unit_id: P-014
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona editing references named permission profiles from the Permissions system; the Personas GUI does not define permission profiles itself.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - default_permissions_profile is selected from the Permissions registry.
  - The dropdown may include null/inherited state.
  - Permissions profile ownership remains in Plans/Permissions_System.md.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_permission_profile_boundary
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0022
preserved_exact_tokens:
  - "default_permissions_profile"
  - "named permission profiles"
  - "Permissions system"
  - "dropdown"
negative_constraints:
  - "The Personas GUI does not define permission profiles itself."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#GUI-PERSONAS"
owner_hints:
  - Plans/Personas.md
```

### P-015 - Skill And Plugin Reference Fields

```yaml
plan_unit_id: P-015
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  default_skill_refs is populated from the skill registry, and unavailable skills display as not installed with Catalog linkage.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Skill references come from the Skills registry.
  - Not-yet-installed skills display as not installed.
  - Catalog linkage remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_skill_reference_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0023
preserved_exact_tokens:
  - "default_skill_refs"
  - "multi-select"
  - "skill registry"
  - "(not installed)"
  - "Catalog"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-016 - External Agent File Isolation

```yaml
plan_unit_id: P-016
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona GUI edits are isolated to Puppet Master Persona storage and must not mutate provider-native agent directories.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona edits write only to PM Persona storage layout.
  - Provider-native agent files may be read only as one-time seed sources.
  - Subsequent edits remain isolated to Puppet Master storage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: external_agent_file_mutation_risk
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0024
preserved_exact_tokens:
  - ".claude/"
  - ".github/"
  - ".cursor/"
  - "provider-native agent directory"
  - "Puppet Master Persona storage layout"
negative_constraints:
  - "Editing Personas in the Puppet Master GUI MUST NOT mutate files under `.claude/`, `.github/`, `.cursor/`, or any other provider-native agent directory."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#STORAGE-LAYOUT"
owner_hints:
  - Plans/Personas.md
```

### P-017 - Interaction Mode Copy

```yaml
plan_unit_id: P-017
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona management UI follows the app-level Expert/ELI5 Interaction Mode toggle and provides both Expert and ELI5 tooltip variants under tooltip.personas.* keys.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Expert and ELI5 variants are required.
  - Tooltip keys use the tooltip.personas.* prefix.
  - Interaction Mode behavior follows FinalGUISpec.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_copy_mode_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0025
preserved_exact_tokens:
  - "Expert/ELI5"
  - "tooltip.personas.*"
  - "Interaction Mode"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-018 - Child Persona Selection

```yaml
plan_unit_id: P-018
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child Persona selection is deterministic: explicit requested child Persona, child subagent type or task-type mapping, weak compatible parent hint, then safe general-purpose fallback.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Explicit child Persona request has highest priority.
  - Weak parent hint is only used when compatible and still ambiguous.
  - Crew members normally share task framing and often share Persona while model/provider diversity defines crew mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_persona_selection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0027
preserved_exact_tokens:
  - "PERSONA-INJECTION"
  - "Canonical child Persona resolution order"
  - "explicitly requested child Persona"
  - "weak parent Persona hint"
  - "safe general-purpose fallback"
  - "Crew default"
negative_constraints:
  - "Persona selection must not silently collapse child roles into the parent Persona."
  - "The weak parent hint cannot override the requested child task, runtime/provider restrictions, permissions, or mode."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-019 - Child Context And Run Mode Resolution

```yaml
plan_unit_id: P-019
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child Persona injection uses a reconstructed handoff bundle, and Persona default_mode applies below explicit run-envelope mode and above the system default.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Child runs inject effective child Persona content resolved from PM storage.
  - Child handoff includes current task, working context, required constraints, requested/effective runtime state, and effective context-shaping state.
  - Run-envelope mode overrides Persona default_mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_context_run_mode_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0029
preserved_exact_tokens:
  - "reconstructed handoff bundle"
  - "do not forward Assistant memory"
  - "default_mode"
  - "Explicit run-envelope `mode`"
  - "System default (`regular`)"
negative_constraints:
  - "Do not forward Assistant memory to child runs."
  - "Do not make a lossy child copy the only truth."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md"
  - "ContractRef: ContractName:Plans/Run_Modes.md"
owner_hints:
  - Plans/Personas.md
```

### P-020 - Cross Subsystem Owner Boundaries

```yaml
plan_unit_id: P-020
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona integrations with permissions, skills, plugins, models/runtime controls, behavior controls, prompt observability, and tool guidance are owned by their subsystem SSOTs rather than restated in Personas.md.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Permission profile behavior routes to Permissions_System.
  - Skills, Plugins, Models/runtime controls, Prompt Pipeline, and tool enforcement remain under their owner docs.
  - Persona tool preference fields remain guidance while hard enforcement stays in Permissions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_subsystem_owner_boundary_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0030
preserved_exact_tokens:
  - "Permissions"
  - "Skills"
  - "Plugins"
  - "Models/runtime controls"
  - "Behavior controls"
  - "Prompt/runtime observability"
  - "Tool guidance"
negative_constraints:
  - "The listed subsystem integrations MUST NOT be restated here."
owner_hints:
  - Plans/Personas.md
```

### P-021 - Reserved Personas And Display Normalization

```yaml
plan_unit_id: P-021
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Protected core Persona IDs, eligibility, mutability, enforcement, collision handling, display normalization, and stale runtime alias dispositions are canonical in the Reserved Personas section.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Protected Persona IDs remain reserved and cannot be used or shadowed by user-created Personas.
  - Eligibility and mutability table values remain preserved.
  - Natural-language display forms normalize to canonical IDs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_persona_collision_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0031
preserved_exact_tokens:
  - "assistant"
  - "general-purpose"
  - "overseer"
  - "bash"
  - "teacher"
  - "collaborator"
  - "researcher"
  - "deep-researcher"
  - "explorer"
  - "Document Writer"
  - "requested_persona"
  - "effective_persona"
negative_constraints:
  - "User Personas MUST NOT use or shadow protected IDs."
  - "Document Writer is legacy/source-lineage wording unless a later owner decision reopens it."
  - "`_id` runtime field names remain stale aliases."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#PERSONA-VALIDATION"
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-022 - Persona Registry Boundary

```yaml
plan_unit_id: P-022
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The split between persona_registry and subagent_registry is mandatory, and persona_registry owns runtime Persona definitions and Persona IDs used for selection, storage, GUI management, and prompt injection.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - persona_registry and subagent_registry remain distinct.
  - persona_registry owns runtime Persona definitions and IDs.
  - Persona IDs are used for selection, storage, GUI management, and prompt injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_registry_boundary_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0033
preserved_exact_tokens:
  - "persona_registry"
  - "subagent_registry"
  - "runtime Persona definitions"
  - "GUI management"
  - "prompt injection"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Tools.md"
owner_hints:
  - Plans/Personas.md
```

### P-023 - Subagent Registry And Relationship Rules

```yaml
plan_unit_id: P-023
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  subagent_registry owns launchable delegated child-run types and the relationship rules that allow launchable subagent types to resolve to Personas without merging the registries.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - subagent_registry owns launchable child-run types.
  - Launchable subagent type may resolve to a Persona while preserving separate structures.
  - Interview stage fields use canonical Persona-oriented field names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_registry_persona_registry_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0035
preserved_exact_tokens:
  - "subagent_registry"
  - "phase_subagents"
  - "phase_secondary_subagents"
  - "/subagent"
  - "/agent"
  - "/fleet"
  - "/delegate"
  - "/replace"
  - "*_persona_id"
negative_constraints:
  - "Provider-native command names are not registry IDs."
  - "Legacy phase_subagents and phase_secondary_subagents are migration aliases only."
  - "Stale *_persona_id drift should be normalized during reconciliation."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Personas.md
```

### P-024 - OpenCode Baseline

```yaml
plan_unit_id: P-024
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The OpenCode baseline for comparison is Agent.Info schema/config override behavior, task-tool subagent invocation, and read-only explore-agent evidence.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - OpenCode Agent.Info fields remain preserved as baseline evidence.
  - User-defined agents override via config in the baseline.
  - The explore agent remains read-only baseline evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_loss
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0037
preserved_exact_tokens:
  - "OpenCode baseline"
  - "Agent.Info"
  - "name"
  - "description"
  - "mode"
  - "prompt"
  - "permission"
  - "model"
  - "steps"
  - "task tool"
  - "explore agent"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-025 - Puppet Master Deltas From OpenCode

```yaml
plan_unit_id: P-025
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Puppet Master Personas are disk-backed PERSONA.md files, provider-agnostic, not hardcoded in source, reserved-ID enforced, and may project to native reusable-agent paths where applicable.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona content lives in PERSONA.md files resolved at runtime.
  - Personas remain provider-agnostic and translated by the Provider facade.
  - Native reusable-agent support is treated as a projection path when applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_persona_delta_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0038
preserved_exact_tokens:
  - "PERSONA.md"
  - "provider-agnostic"
  - "reserved-ID enforcement"
  - "Claude Code CLI"
  - "--agent"
  - "--agents"
  - "agents command"
  - "native-specialized-agent projection path"
negative_constraints:
  - "Provider-native reusable agents are not plain prompt stuffing and not the same primitive as the PM Persona registry."
  - "Puppet Master does not hardcode Persona descriptions/prompts in source code."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
owner_hints:
  - Plans/Personas.md
```
### P-026 - Persona Validation Acceptance Criteria

```yaml
plan_unit_id: P-026
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona validation acceptance criteria require every loaded PERSONA.md file to pass schema validation, skip invalid files with a warning log entry, reject Reserved Persona IDs, and treat folder-name/id mismatches as validation errors.
gui_related: false
gui_classification_reason: This unit defines schema/runtime validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-010
  - P-011
  - P-021
unblocks: []
acceptance_criteria:
  - AC-P01, AC-P03, and AC-P06 remain testable validation requirements.
  - Invalid Persona files are not loaded as active runtime Personas.
  - Reserved IDs and folder/frontmatter mismatches fail validation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_validation_acceptance_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P01"
  - "AC-P03"
  - "AC-P06"
  - "PERSONA.md"
  - "frontmatter"
  - "Reserved Persona IDs"
negative_constraints:
  - "Invalid or mismatched Personas are not loaded as valid runtime Personas."
owner_hints:
  - Plans/Personas.md
```

### P-027 - Persona Resolution And Instruction Injection Criteria

```yaml
plan_unit_id: P-027
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona resolution acceptance criteria require project-local Personas to deterministically override global Personas with the same id, and require the context compiler to inject the resolved Persona Markdown body into the Instruction Bundle for every assigned Agent run.
gui_related: false
gui_classification_reason: This unit defines runtime resolution and prompt compilation behavior rather than visual presentation.
split_recommended: false
depends_on:
  - P-008
  - P-012
  - P-018
unblocks: []
acceptance_criteria:
  - AC-P02 and AC-P05 remain testable runtime requirements.
  - Project-local override behavior is deterministic.
  - Persona Markdown body injection occurs whenever a Persona is assigned.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution_injection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P02"
  - "AC-P05"
  - "Project-local Personas"
  - "global Personas"
  - "Instruction Bundle"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-028 - GUI Persona Save Isolation Criteria

```yaml
plan_unit_id: P-028
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  GUI Persona edits must never create, modify, or delete provider-native agent files, and the GUI Personas management card must validate the schema on save and block saves with validation errors.
gui_related: true
gui_classification_reason: This unit defines GUI save behavior and user-visible validation handling.
split_recommended: false
depends_on:
  - P-013
  - P-016
  - P-026
unblocks: []
acceptance_criteria:
  - AC-P04 and AC-P07 remain testable GUI requirements.
  - GUI saves are isolated to Puppet Master Persona storage.
  - Save actions with validation errors are blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_persona_save_isolation_drift
reasoning_tier: standard
context_scope: personas_gui
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P04"
  - "AC-P07"
  - "GUI"
  - "Personas management card"
  - ".claude/"
  - ".github/"
  - ".cursor/"
negative_constraints:
  - "Editing a Persona in the GUI MUST NOT create, modify, or delete files under `.claude/`, `.github/`, `.cursor/`, or any provider-native agent directory."
owner_hints:
  - Plans/Personas.md
```

### P-029 - Requested Effective Persona Runtime Identity

```yaml
plan_unit_id: P-029
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona runtime identity uses requested_persona, effective_persona, persona_selection_source, selection_reason, persona_override_scope, persona_override_owner_id, and shared applied/skipped controls; requested_persona_id and effective_persona_id are stale aliases only, and persona_override_owner_id must not use tier_id as canonical owner scope.
gui_related: false
gui_classification_reason: This unit defines runtime identity field names and stale-alias handling rather than GUI presentation.
split_recommended: false
depends_on:
  - P-011
  - P-018
unblocks: []
acceptance_criteria:
  - Runtime-facing consumers converge on requested_persona and effective_persona.
  - requested_persona_id and effective_persona_id are not revived as parallel canonical fields.
  - Historical views use frozen captured runtime identity rather than recomputing from current settings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_identity_alias_drift
reasoning_tier: high
context_scope: personas_runtime_identity
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0040
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "persona_selection_source"
  - "selection_reason"
  - "persona_override_scope"
  - "persona_override_owner_id"
  - "requested_persona_id"
  - "effective_persona_id"
  - "package-overseer"
  - "seam-overseer"
negative_constraints:
  - "requested_persona_id and effective_persona_id are not canonical persisted field names."
  - "persona_override_owner_id must not use tier_id as canonical owner scope."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Personas.md
```

### P-030 - Persona Auto Resolution And Crew Role Mapping

```yaml
plan_unit_id: P-030
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona auto-resolution uses explicit manual/run override, scoped natural-language override, surface-specific explicit mapping, surface auto resolver candidate, config default, then canonical fallback; actor and operation type outrank stack hints, governance/review/corroboration Personas do not collapse into implementation Personas, and exact crew.roles tag mappings either resolve or return capability_unavailable without silent tuple fallback.
gui_related: false
gui_classification_reason: This unit defines runtime resolution and crew-role routing behavior rather than visual presentation.
split_recommended: false
depends_on:
  - P-018
  - P-029
unblocks: []
acceptance_criteria:
  - Auto-resolution precedence remains ordered and deterministic.
  - owner_hint is advisory until resolved by the crew-role map.
  - Missing exact tag mappings fall back to the current session provider/model with requested Persona behavior, while unavailable mapped provider/model returns capability_unavailable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_auto_resolution_drift
reasoning_tier: high
context_scope: personas_runtime_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0040
preserved_exact_tokens:
  - "owner_hint"
  - "crew.roles"
  - "code-review"
  - "test-writer"
  - "researcher"
  - "capability_unavailable"
  - '{ "code-review": { provider, model, persona } }'
negative_constraints:
  - "Partial matches are not supported in MVP."
  - "PM does not silently fall back to a different provider/model/persona tuple when a mapped provider or model is unavailable."
  - "Governance/review/corroboration personas do not collapse into implementation personas merely because repo language hints are strong."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Personas.md
```

### P-031 - Core Persona Catalog Scope

```yaml
plan_unit_id: P-031
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Core Personas are protected Puppet Master-owned behavior contracts that define the highest-level user-visible and runtime-selected Persona family, while specialty Personas refine domain, stack, tool, or workflow fit beneath this layer.
gui_related: false
gui_classification_reason: This unit defines catalog hierarchy and ownership rather than GUI presentation.
split_recommended: false
depends_on:
  - P-021
unblocks: []
acceptance_criteria:
  - The CORE-PERSONA-CATALOG anchor remains preserved.
  - Core Personas remain protected PM-owned behavior contracts.
  - Specialty Personas remain a refinement layer below core Personas.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: core_persona_catalog_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0041
preserved_exact_tokens:
  - "CORE-PERSONA-CATALOG"
  - "Core Personas"
  - "protected PM-owned behavior contracts"
  - "specialty Personas"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-032 - Core Persona Visibility And Mutability Rules

```yaml
plan_unit_id: P-032
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Core Persona default model/provider/runtime controls appear as Auto in the UI and are stored as inherited/null fields unless a PM-owned definition sets a value; core definitions are user-immutable, explorer and bash are subagent-only, assistant and teacher are direct user-facing Personas, and other protected core Personas are chat-selectable unless a narrower owner rule forbids the surface.
gui_related: true
gui_classification_reason: This unit defines user-visible Persona picker and UI default-control behavior.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - Auto defaults inherit according to Models_System.
  - Core definitions are user-immutable and not deletable.
  - Manual Persona picker eligibility preserves subagent-only and user-facing distinctions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: core_persona_visibility_mutability_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0042
preserved_exact_tokens:
  - "Auto"
  - "UI"
  - "user-immutable"
  - "explorer"
  - "bash"
  - "assistant"
  - "teacher"
negative_constraints:
  - "explorer and bash are subagent-only and are not available in the chat manual Persona picker."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - Plans/Personas.md
```

### P-033 - Child Run Core Persona Selection Rules

```yaml
plan_unit_id: P-033
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child runs must record requested/effective Persona and selection reason, child Persona selection does not auto-inherit the parent Persona, and Plan/deep-plan Auto may switch Persona across phase boundaries once planning turns into execution.
gui_related: false
gui_classification_reason: This unit defines runtime child-run resolution behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-018
  - P-029
  - P-032
unblocks: []
acceptance_criteria:
  - Child requested/effective Persona and selection reason are recorded.
  - Parent Persona is not automatically inherited by child runs.
  - Auto phase switches may select general-purpose, assistant, or a specialty Persona after plan acceptance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_core_persona_selection_drift
reasoning_tier: standard
context_scope: personas_child_runs
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0042
preserved_exact_tokens:
  - "requested/effective Persona"
  - "selection reason"
  - "child Persona selection does not auto-inherit"
  - "Plan/deep-plan"
  - "general-purpose"
negative_constraints:
  - "Child Persona selection does not auto-inherit the parent Persona."
owner_hints:
  - Plans/Personas.md
```

### P-034 - Assistant Core Persona

```yaml
plan_unit_id: P-034
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  assistant is the default chat Persona with broad capability similar to general-purpose, a warmer and more collaborative style, permission to do real work when warranted, and boundaries against becoming a hidden worker Persona or passive help-bot.
gui_related: false
gui_classification_reason: This unit defines Persona behavior contract and routing fit rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - assistant remains the default chat Persona.
  - assistant can do real work when action is warranted.
  - general-purpose, teacher, researcher, deep-researcher, explorer, bash, and specialty Personas remain alternative fits when materially better.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_persona_behavior_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0043
preserved_exact_tokens:
  - "assistant"
  - "default chat Persona"
  - "warmer"
  - "general-purpose"
  - "teacher"
negative_constraints:
  - "assistant must not become a hidden worker Persona or a passive help-bot."
owner_hints:
  - Plans/Personas.md
```

### P-035 - General Purpose Core Persona

```yaml
plan_unit_id: P-035
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  general-purpose displays as General and is the broad core execution Persona for complex multi-step work requiring reading, reasoning, editing, command execution, verification, and follow-through, with boundaries against replacing read-only explorer, terminal-first bash, research Personas, or narrower specialty fits.
gui_related: false
gui_classification_reason: This unit defines Persona behavior contract and routing fit rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - general-purpose remains the fallback broad worker when no narrower fit is clearly better.
  - explorer remains read-only and bash remains terminal-first.
  - research and specialty handoffs are used when materially better.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: general_purpose_persona_behavior_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0044
preserved_exact_tokens:
  - "general-purpose"
  - "General"
  - "complex multi-step work"
  - "explorer"
  - "bash"
negative_constraints:
  - "general-purpose should not over-delegate when it can complete a coherent task itself."
owner_hints:
  - Plans/Personas.md
```

### P-036 - Explorer Core Persona

```yaml
plan_unit_id: P-036
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  explorer is a fast, read-only, subagent-only core Persona for codebase-local investigation that searches files, symbols, configs, tests, docs, and call sites, returns concise evidence-backed synthesis, and does not edit, refactor, implement, or use web research by default.
gui_related: false
gui_classification_reason: This unit defines a read-only codebase investigation Persona contract rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - explorer remains subagent-only and read-only.
  - explorer returns synthesis, supporting file references, uncertainties, and handoff recommendations when relevant.
  - explorer hands off to researcher when current external information is needed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: explorer_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0045
preserved_exact_tokens:
  - "explorer"
  - "read-only"
  - "subagent-only"
  - "codebase-local investigation"
  - "do not use web research by default"
negative_constraints:
  - "explorer must stay read-only and must not edit, refactor, or implement."
owner_hints:
  - Plans/Personas.md
```

### P-037 - Bash Core Persona

```yaml
plan_unit_id: P-037
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  bash is a subagent-only terminal-execution Persona that runs useful command sequences in an isolated context, inspects stdout, stderr, exit status, and side effects, and reports the smallest actionable result without becoming a general planner or coding Persona.
gui_related: false
gui_classification_reason: This unit defines terminal execution behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - bash remains subagent-only and terminal-first.
  - bash distinguishes command failure, successful command with problematic output, and intended success.
  - bash hands off to implementation, exploration, or research Personas as appropriate.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bash_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0046
preserved_exact_tokens:
  - "bash"
  - "terminal-execution Persona"
  - "stdout/stderr/exit status/side effects"
  - "minimum useful command sequence"
negative_constraints:
  - "bash must not become a general planner or coding Persona because a command exposed an issue."
owner_hints:
  - Plans/Personas.md
```

### P-038 - Researcher Core Persona

```yaml
plan_unit_id: P-038
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  researcher is a read-only Persona that combines local codebase inspection with current external sources when those sources materially improve the answer, stays grounded in project context, compares evidence, and returns citations plus handoff guidance without taking over implementation.
gui_related: false
gui_classification_reason: This unit defines research behavior and evidence handling rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
unblocks: []
acceptance_criteria:
  - researcher stays read-only.
  - external research is grounded in local project context.
  - outputs include citations, local findings, external findings, implications, uncertainty, and handoff guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: researcher_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0047
preserved_exact_tokens:
  - "researcher"
  - "read-only"
  - "current external sources"
  - "citations"
  - "handoff guidance"
negative_constraints:
  - "researcher must stay read-only and must not take over implementation."
owner_hints:
  - Plans/Personas.md
```

### P-039 - Deep Researcher Core Persona

```yaml
plan_unit_id: P-039
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  deep-researcher is the read-only high-effort counterpart to researcher for broader source coverage, deeper comparison, strategic debugging, architecture or solution evaluation, plan/deep-plan support, and higher-stakes decision support.
gui_related: false
gui_classification_reason: This unit defines research depth and decision-support behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-038
unblocks: []
acceptance_criteria:
  - deep-researcher decomposes complex research into sub-questions.
  - local context and multiple external source classes are compared.
  - outputs include recommendation, comparison, evidence, risks, caveats, and next steps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: deep_researcher_persona_scope_drift
reasoning_tier: high
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0048
preserved_exact_tokens:
  - "deep-researcher"
  - "high-effort"
  - "broader source coverage"
  - "strategic debugging"
  - "plan/deep-plan"
negative_constraints:
  - "deep-researcher must hand off to an execution-capable Persona when the user wants implementation or file changes."
owner_hints:
  - Plans/Personas.md
```

### P-040 - Teacher Core Persona

```yaml
plan_unit_id: P-040
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  teacher is a warm, highly explanatory, user-facing help Persona for teaching Puppet Master usage, settings, workflows, modes, Personas, Orchestrator behavior, adjacent developer tooling, and concrete steps, while surfacing missing product documentation instead of guessing.
gui_related: true
gui_classification_reason: This unit defines user-facing help behavior tied to Puppet Master's UI, settings, and workflows.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - teacher remains user-facing and not a subagent Persona.
  - teaching anchors in Puppet Master's actual UI, settings, flows, capabilities, and terminology.
  - missing feature/help coverage is surfaced rather than guessed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: teacher_persona_doc_guessing_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0049
preserved_exact_tokens:
  - "teacher"
  - "PM usage"
  - "settings"
  - "workflows"
  - "Orchestrator behavior"
  - "PM documentation coverage"
negative_constraints:
  - "teacher must surface missing feature/help coverage instead of guessing."
owner_hints:
  - Plans/Personas.md
```

### P-041 - Overseer Governance Boundary

```yaml
plan_unit_id: P-041
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  overseer is a governance/conductor Persona, not the scheduler personified and not a normal node-worker implementation Persona; scheduler and executor owners retain dispatchability, readiness, transitions, blocked-state lifecycle, retries, wakeups, attempt identity, and hard Orchestrator mechanics.
gui_related: false
gui_classification_reason: This unit defines governance/runtime ownership boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-030
unblocks: []
acceptance_criteria:
  - overseer does not claim canonical ownership of scheduler/executor mechanics.
  - Package Overseer and Seam Overseer remain graph/runtime governance roles.
  - actor type outranks stack hints for overseer, reviewer, corroborator, recovery, graph-patch, and node-worker roles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: overseer_scheduler_ownership_drift
reasoning_tier: high
context_scope: personas_overseer
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0050
preserved_exact_tokens:
  - "overseer"
  - "governance/conductor Persona"
  - "not the scheduler personified"
  - "Package Overseer"
  - "Seam Overseer"
negative_constraints:
  - "overseer must not claim canonical ownership of dispatch, readiness, blocked state, retry budgets, wakeups, or hard Orchestrator mechanics."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md"
owner_hints:
  - Plans/Personas.md
```

### P-042 - Overseer Package And Seam Review Fit

```yaml
plan_unit_id: P-042
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  overseer expresses delegation-first, verification-first, wiring/completeness-sensitive, integration-aware, audit-minded behavior; package-overseer mode governs package-local readiness and remediation evidence, while seam-overseer mode judges cross-package integration, wiring, architecture consistency, GUI/runtime fit, workflow completeness, weak integration, and coherent feature formation.
gui_related: true
gui_classification_reason: This unit includes GUI/runtime fit as a user-visible integration-review concern.
split_recommended: false
depends_on:
  - P-041
unblocks: []
acceptance_criteria:
  - Package-overseer mode stays package-local unless explicitly authorized at higher scope.
  - Seam-overseer mode judges integration and feature coherence across packages.
  - Concerns, critical or major findings, corroboration gaps, and graph-patch needs remain visible and routed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: overseer_review_fit_drift
reasoning_tier: high
context_scope: personas_overseer
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0050
preserved_exact_tokens:
  - "delegation-first"
  - "verification-first"
  - "package-overseer"
  - "seam-overseer"
  - "GUI/runtime fit"
  - "weak integration"
negative_constraints:
  - "Substantial feature work should hand off to general-purpose or a suitable specialty/node-worker Persona."
owner_hints:
  - Plans/Personas.md
```

### P-043 - Document Generation Boundary

```yaml
plan_unit_id: P-043
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  There is no protected core document-writer Persona; durable document creation is workflow behavior handled by the owning surface and resolved stage Persona, and generated requirements, summaries, plans, reports, and durable artifacts remain draft workflow outputs until accepted by the relevant user or validation gate.
gui_related: false
gui_classification_reason: This unit defines workflow ownership and Persona catalog boundaries rather than GUI presentation.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - No dedicated core Document Writer handoff is created or required.
  - Document drafting may use collaborator, assistant, general-purpose, or an authorized narrow specialty according to stage fit.
  - Source fidelity, cross-references, terminology, and owner boundaries are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_writer_core_revival_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0051
preserved_exact_tokens:
  - "document-writer"
  - "Document Writer"
  - "collaborator"
  - "assistant"
  - "general-purpose"
  - "draft workflow outputs"
negative_constraints:
  - "Do not create or require a dedicated core Document Writer handoff."
  - "Do not invent product facts when the supporting canon is incomplete."
owner_hints:
  - Plans/Personas.md
```

### P-044 - Collaborator Core Persona

```yaml
plan_unit_id: P-044
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  collaborator is the user-facing planning, clarification, ideation, interview, scope-probe, specification-discovery, and co-shaping Persona for turning rough ideas into clear, complete, testable project intent before document generation, plan handoff, or build handoff.
gui_related: false
gui_classification_reason: This unit defines planning Persona behavior and workflow handoff policy rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-043
unblocks: []
acceptance_criteria:
  - collaborator asks targeted questions in digestible batches and keeps asking follow-ups over the flow.
  - collaborator challenges weak, risky, contradictory, or underspecified ideas directly but constructively.
  - explicit user or workflow confirmation is required before document generation, plan handoff, or build handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: collaborator_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0052
preserved_exact_tokens:
  - "collaborator"
  - "Chain Wizard"
  - "Requirements Doc Builder"
  - "section/thread ledger"
  - "document generation"
negative_constraints:
  - "Requirements drafting and section summaries are workflow outputs, not a handoff to a separate core Document Writer."
owner_hints:
  - Plans/Personas.md
```

### P-045 - Specialty Persona Catalog Scope

```yaml
plan_unit_id: P-045
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Specialty Personas are the configurable layer and may be first-party bundled Personas, project-local Personas, global user Personas, imported seed Personas, or future optional template/catalog entries, but they are not protected core built-ins unless listed in the Reserved Personas section.
gui_related: false
gui_classification_reason: This unit defines catalog layering and mutability scope rather than visual presentation.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - The SPECIALTY-PERSONAS anchor remains preserved.
  - Specialty Personas remain configurable rather than protected core built-ins by default.
  - Protected core status is limited to entries listed in the Reserved Personas section.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_catalog_scope_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0053
preserved_exact_tokens:
  - "SPECIALTY-PERSONAS"
  - "Specialty Personas"
  - "first-party bundled Personas"
  - "project-local Personas"
  - "global user Personas"
negative_constraints:
  - "Specialty Personas are not protected core built-ins unless listed in section 6."
owner_hints:
  - Plans/Personas.md
```

### P-046 - Specialty Mutability And Provider-Native Source Rules

```yaml
plan_unit_id: P-046
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  First-party bundled specialty Personas may be modified, disabled, and restored to default; user-created and imported specialty Personas may be edited or deleted; provider-native files are seed/import material only, and provider-native tools lists, WebFetch, WebSearch, protocol JSON examples, context-manager steps, KPI/SLA guarantees, polished completion claims, and benchmark model recommendations are migration inputs rather than literal PM built-in guarantees.
gui_related: false
gui_classification_reason: This unit defines catalog mutability, import, provider-source, permissions, and model-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-007
  - P-045
unblocks: []
acceptance_criteria:
  - Provider-native files under .claude/agents, .cursor/agents, .github, or other provider-native directories are seed/import material only.
  - PM adaptation translates provider-native tools lists into PM permission/tool-preference metadata.
  - Specialty model behavior defaults to Auto/inherit unless a PM-owned definition explicitly sets a provider/model preference.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_native_specialty_source_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0054
preserved_exact_tokens:
  - ".claude/agents"
  - ".cursor/agents"
  - ".github"
  - "WebFetch"
  - "WebSearch"
  - "context-manager"
  - "Auto"
negative_constraints:
  - "Provider-native guarantees and external benchmark model recommendations are not literal PM built-in guarantees."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - Plans/Personas.md
```

### P-047 - First-Party Specialty Browser Groups

```yaml
plan_unit_id: P-047
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The first-party specialty browser groups Personas before individual stack/tool refinements, using Review/audit/verification, Design/research/documentation, Implementation generalists, Data/platform/operations/reliability, Language/framework specialists, and Prompt/LLM systems groups with the listed typical role IDs.
gui_related: true
gui_classification_reason: This unit defines the user-visible specialty browser grouping presentation.
split_recommended: false
depends_on:
  - P-045
unblocks: []
acceptance_criteria:
  - First-party specialty groups appear before individual stack/tool refinements.
  - Typical role IDs remain associated with their groups.
  - Prompt and LLM systems includes prompt-engineer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_browser_grouping_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0055
preserved_exact_tokens:
  - "Review, audit, and verification"
  - "Design, research, and documentation"
  - "Implementation generalists"
  - "Data, platform, operations, and reliability"
  - "Language and framework specialists"
  - "Prompt and LLM systems"
  - "prompt-engineer"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-048 - Specialty Entry Exclusions And Document Writer Guard

```yaml
plan_unit_id: P-048
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  technical-writer is a specialty/template candidate only and must not recreate document-writer by another name, while project-manager, product-manager, and context-manager are not PM Persona catalog entries because delivery sequencing, product framing, and context/memory behavior belong to orchestration, interview, prompt pipeline, and memory systems.
gui_related: false
gui_classification_reason: This unit defines catalog exclusions and ownership boundaries rather than GUI presentation.
split_recommended: false
depends_on:
  - P-043
  - P-045
  - P-047
unblocks: []
acceptance_criteria:
  - technical-writer remains specialty/template candidate only.
  - document-writer is not recreated by another name.
  - project-manager, product-manager, and context-manager remain outside PM Persona catalog entries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_exclusion_boundary_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0055
preserved_exact_tokens:
  - "technical-writer"
  - "document-writer"
  - "project-manager"
  - "product-manager"
  - "context-manager"
negative_constraints:
  - "technical-writer MUST NOT be used to recreate document-writer by another name."
  - "project-manager, product-manager, and context-manager are not PM Persona catalog entries."
owner_hints:
  - Plans/Personas.md
```

### P-049 - First-Wave Specialty Additions And Future Candidates

```yaml
plan_unit_id: P-049
unit_type: decision
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  docker-expert, github-actions-expert, graphql-expert, openapi-expert, and postgres-expert are approved first-wave additions to the first-party specialty catalog, while benchmark-derived candidates such as design-system-architect, observability-engineer, threat-modeling-expert, error-detective, incident-responder, dx-optimizer, api-documenter, monorepo-architect, playwright-expert, kubernetes-expert, terraform-expert, prisma-expert, oauth-oidc-expert, jwt-expert, and rest-expert remain future catalog/template candidates until promoted by owner-doc changes.
gui_related: false
gui_classification_reason: This unit records catalog curation decisions rather than GUI presentation.
split_recommended: false
depends_on:
  - P-045
unblocks: []
acceptance_criteria:
  - Approved first-wave additions remain listed exactly.
  - Future candidates are not treated as approved first-party specialties until promoted by owner-doc changes.
  - First-wave additions map to common IDE tasks and clear stack/tool seams.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_catalog_promotion_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: decision
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0056
preserved_exact_tokens:
  - "docker-expert"
  - "github-actions-expert"
  - "graphql-expert"
  - "openapi-expert"
  - "postgres-expert"
  - "playwright-expert"
  - "oauth-oidc-expert"
negative_constraints:
  - "Future catalog/template candidates are not approved first-wave additions until separately promoted by owner-doc changes."
owner_hints:
  - Plans/Personas.md
```

### P-050 - Specialty Prompt Shape Normalization

```yaml
plan_unit_id: P-050
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  PM-native bundled specialty prompts should be small and sharp, with most specialties around 250-500 words, complex cross-stack or strategy specialties around 450-700 words, internal/helper or narrow stack specialties around 180-350 words, and bodies focused on mission, when to use, when not to use, operating posture, response approach, useful heuristics, boundaries, and handoff expectations.
gui_related: false
gui_classification_reason: This unit defines prompt content shape and metadata boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - P-045
  - P-046
unblocks: []
acceptance_criteria:
  - Permission/tool posture belongs mostly in metadata.
  - Hard numeric goals, fake benchmark claims, vendor/version encyclopedias, generic tool lists, and raw JSON communication examples are avoided unless the role truly requires them.
  - Prompt bodies preserve mission, usage, posture, heuristics, boundaries, and handoff expectations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_prompt_bloat_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0057
preserved_exact_tokens:
  - "250-500 words"
  - "450-700 words"
  - "180-350 words"
  - "permission/tool posture"
  - "raw JSON communication examples"
negative_constraints:
  - "Do not copy long provider-native source files as PM-native bundled specialty prompts."
  - "Avoid fake benchmark claims and generic tool lists unless the role truly requires them."
owner_hints:
  - Plans/Personas.md
```

### P-051 - Specialty Auto-Resolution Collision Rules

```yaml
plan_unit_id: P-051
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Specialty auto-resolution must be predictable: role/function axis outranks stack axis, operation type outranks repository language hints, review/audit roles outrank implementation roles for validation/governance/review tasks, implementation roles outrank review roles for build/change tasks, framework/tool specialists refine broader roles, fullstack-developer loses to narrower backend/frontend or stack-specific matches when justified, and governance/review/corroboration Personas do not collapse into implementation Personas because repository language hints are strong.
gui_related: false
gui_classification_reason: This unit defines resolver and collision logic rather than GUI presentation.
split_recommended: false
depends_on:
  - P-030
  - P-045
unblocks: []
acceptance_criteria:
  - Role/function and operation axes outrank stack/language hints where specified.
  - Review, audit, validation, governance, build, and change tasks route predictably.
  - Framework/tool specialists refine broader roles and normally replace them only when explicitly requested or strongly matched.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_auto_resolution_collision_drift
reasoning_tier: high
context_scope: personas_specialty_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0058
preserved_exact_tokens:
  - "role/function axis"
  - "stack axis"
  - "operation type"
  - "fullstack-developer"
  - "governance/review/corroboration Personas"
negative_constraints:
  - "Governance/review/corroboration Personas do not collapse into implementation Personas merely because repository language hints are strong."
owner_hints:
  - Plans/Personas.md
```

### P-052 - Specialty Browser Resolution Presentation

```yaml
plan_unit_id: P-052
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The specialty browser uses grouping and auto-resolution together: top-level group, specialty within group, optional stack/framework refinement, then project/global override.
gui_related: true
gui_classification_reason: This unit defines user-visible specialty browser ordering and presentation.
split_recommended: false
depends_on:
  - P-047
  - P-051
unblocks: []
acceptance_criteria:
  - Browser presentation starts at the top-level group.
  - Specialty within group and optional stack/framework refinement are represented before project/global override.
  - Browser grouping remains aligned with auto-resolution behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_browser_resolution_drift
reasoning_tier: standard
context_scope: personas_specialty_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0058
preserved_exact_tokens:
  - "top-level group"
  - "specialty within group"
  - "optional stack/framework refinement"
  - "project/global override"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-001 - Personas Retired Source-Preserving Bridge

```yaml
plan_unit_id: P-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Personas.md
canonical_text: >-
  P-001 is a retired source-preserving bridge for generated PDS Owner / Consumer Map, PlanUnits, and Migration Coverage audit material. Product prose from Personas-S0001 through Personas-S0058 is covered by fine-grained P-002 through P-052; Personas-S0059, Personas-S0060, and Personas-S0062 are generated structural/audit metadata, and Personas-S0061 is retired bridge lineage. No residual source_preserving_planunit product coverage remains for Plans/Personas.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related source tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - P-002
  - P-003
  - P-004
  - P-005
  - P-006
  - P-007
  - P-008
  - P-009
  - P-010
  - P-011
  - P-012
  - P-013
  - P-014
  - P-015
  - P-016
  - P-017
  - P-018
  - P-019
  - P-020
  - P-021
  - P-022
  - P-023
  - P-024
  - P-025
  - P-026
  - P-027
  - P-028
  - P-029
  - P-030
  - P-031
  - P-032
  - P-033
  - P-034
  - P-035
  - P-036
  - P-037
  - P-038
  - P-039
  - P-040
  - P-041
  - P-042
  - P-043
  - P-044
  - P-045
  - P-046
  - P-047
  - P-048
  - P-049
  - P-050
  - P-051
  - P-052
unblocks: []
acceptance_criteria:
  - P-001 does not override P-002 through P-052 for Personas-S0001 through Personas-S0058.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Personas.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: personas_residual_bridge
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0062
preserved_exact_tokens:
  - "P-001"
  - "Personas (Canonical SSOT) Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "source-preserving"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "P-002"
  - "P-052"
negative_constraints:
  - "P-001 must not be used as implementation-ready product coverage for spans now mapped to P-002 through P-052."
  - "Do not remap Personas-S0001 through Personas-S0058 back to P-001."
owner_hints:
  - Plans/Personas.md
```

## Migration Coverage

Original hash: `9dfc2723f4722146795000e263279f793663e43bd65205bfa071930aba45f9a5`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans from `Personas-S0001` through `Personas-S0058` are preserved in place and atomized into fine-grained PlanUnits `P-002` through `P-052`. Generated structural/audit spans `Personas-S0059` through `Personas-S0062` are explicitly dispositioned; `P-001` is retired as bridge lineage and no residual `source_preserving_planunit` product coverage remains for `Plans/Personas.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
