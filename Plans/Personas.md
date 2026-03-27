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

An **Agent** is a running AI execution unit. It is a concrete instance within a Puppet Master run — a provider process that receives a compiled context (system prompt, instructions, conversation history) and produces a response stream. The Orchestrator spawns Agents for each tier (Phase, Task, Subtask, Iteration). An Agent is ephemeral; it exists only for the duration of its run.

<a id="DEF-SUBAGENT"></a>
### 1.2 Subagent

A subagent is a child run that resolves a Persona for the child task. It is not merely “the parent Persona, but smaller,” and it is not defined by provider-native agent-file syntax.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- the child Persona may differ materially from the parent Persona.
- the child Persona does not auto-inherit from the parent.
- provider-native agent files may seed or export Persona content, but PM Persona storage remains canonical.
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
1. Check `.puppet-master/personas/<persona_id>/PERSONA.md` in the active project root.
2. If not found, check `~/.config/puppet-master/personas/<persona_id>/PERSONA.md`.
3. If not found, the Persona is unresolved. The Orchestrator MUST fall back to a bare-context run (no Persona-specific instructions injected) and log a warning.

**Folder-name invariant:** The folder name MUST match the `id` field in the PERSONA.md frontmatter. A mismatch is a validation error.

ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION

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

<a id="PERSONA-VALIDATION"></a>

**`id` regex:** `^[a-z][a-z0-9-]{1,48}[a-z0-9]$`
- Starts with a lowercase letter.
- Contains only lowercase letters, digits, and hyphens.
- Ends with a lowercase letter or digit.
- Length: 3–50 characters.

**`name` length:** 1–100 characters (non-empty, trimmed).

**`description` length:** 1–500 characters (non-empty, trimmed).

**Folder-name match:** The enclosing folder name MUST equal the `id` value.

**Reserved IDs (§6):** The IDs listed in §6 MUST NOT be used for user-created Personas until the corresponding Persona files are officially provided.

**`default_mode` enum:** If present, MUST be one of `ask`, `plan`, `regular`, `yolo` (per `Plans/Run_Modes.md#MODE-ask` et al.).

**`talkativeness` enum:** If present, MUST be one of `talk_a_lot_more`, `talk_more`, `talk_a_little_more`, `model_default`, `talk_a_little_less`, `talk_less`.

**`default_skill_refs` items:** Each entry MUST be a valid skill ID (validated at load time against the skill registry; unresolvable refs produce a warning, not a hard error).

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md#RESERVED-PERSONAS

### 3.4 Markdown body

The Markdown body following the frontmatter contains the Persona's system instructions. This content is injected into the Agent's compiled context (see §5). There are no structural constraints on the body beyond valid Markdown. Recommended sections: expertise areas, behavioral guidelines, output format preferences.

---

## 4. GUI requirements

<a id="GUI-PERSONAS"></a>

The Personas screen is part of Settings/Advanced in the unified Settings page (`Plans/FinalGUISpec.md` §7.4).

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 4.1 Personas management card (Settings > Advanced)

A collapsible **Personas** card in Settings > Advanced MUST provide:

1. **List view:** Table of all resolved Personas (project + global, project-local indicated with badge). Columns: Name, ID, Scope (project/global), Tags, Description (truncated). Sorted alphabetically by name; project-local entries sort before global when IDs match.

2. **Create:** "New Persona" button opens an editor form with fields for `id`, `name`, `description`, `default_mode` (dropdown), `default_platform`, `default_permissions_profile` (dropdown or null), `default_model`, `default_variant`, `temperature`, `top_p`, `reasoning_effort`, `talkativeness`, `default_skill_refs` (multi-select from skill registry), `preferred_tools`, `discouraged_tools`, `tool_usage_guidance`, `aliases`, `tags` (tag input), and a Markdown body editor. Scope selector: project-local or global. `talkativeness` uses the fixed GUI labels `Talk a lot more`, `Talk more`, `Talk a little more`, `Model default`, `Talk a little less`, and `Talk less`, persisted as the enum values from §3.2. Provider support-state gating for runtime controls is defined in `Plans/Models_System.md#PERSONA-CAPABILITY-MATRIX`; `talkativeness` is Persona-instruction-level behavior and therefore follows normal Persona prompt injection rather than provider runtime-control gating.

3. **Edit:** Row click or edit button opens the same editor pre-populated. Editing a global Persona while a project is active offers "Save as project override" (creates project-local copy) or "Save globally."

4. **Delete:** Delete button with confirmation modal. Deleting a project-local Persona that overrides a global one reveals the global version. Deleting a global Persona with no project override removes it entirely.

5. **Schema validation on save:** On every save, validate the PERSONA.md against the schema (§3). Display inline errors for: invalid `id` format, reserved `id` usage, name/description length violations, invalid `default_mode`, folder-name mismatch. Block save until errors are resolved.

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

The following Persona IDs are **protected Puppet Master built-in IDs**. They MUST NOT be used for user-created Personas. When the corresponding built-in `PERSONA.md` definitions are present, they remain selectable and assignable as first-class built-ins; the restriction applies only to user-defined collisions.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#PERSONA-VALIDATION

| Reserved ID | Planned purpose | Status |
|-------------|----------------|--------|
| `collaborator` | User-facing planning and clarification Persona. | Protected built-in ID. |
| `general-purpose` | Broad default execution Persona for general work. | Protected built-in ID. |
| `explorer` | Explores existing codebases; read-only investigation Persona. | Protected built-in ID. |
| `researcher` | Web research + collaboration-focused Persona. | Protected built-in ID. |
| `deep-researcher` | Broader/longer research Persona with extended context. | Protected built-in ID. |

**Enforcement:** The Persona validation logic (§3.3) MUST reject creation of user Personas with these IDs. If a built-in Persona with one of these IDs exists in canonical Persona storage, `select_for_tier()` and surface-specific resolvers MAY return it normally. Imported provider-native agent files MUST NOT overwrite these IDs; collisions are handled per §10.5/§10.8.

---

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
- provider-native command names such as `/subagent`, `/agent`, `/fleet`, or `/delegate` are not registry IDs.
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

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md