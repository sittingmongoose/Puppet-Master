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

A **Subagent** is an Agent spawned by another Agent (or by the Orchestrator on behalf of an Agent) to perform a delegated task. Subagents are invoked via the `task` tool (`Plans/Tools.md` §3.6). The parent Agent receives the Subagent's output as tool-call results. Subagents inherit the parent's permission ruleset merged with session-level permissions.

<a id="DEF-PERSONA"></a>
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

Cross-surface requested/effective Persona precedence is canonically defined in `Plans/Prompt_Pipeline.md` (§6.2–§6.5). This section does **not** redefine that global precedence.

This section defines only how **Orchestrator auto mode** produces candidate Persona IDs before the global prompt-pipeline precedence is applied:

1. **Plan/tier hard requirement:** If the PRD or plan contains a hard Persona/subagent requirement for the current tier item, emit that candidate first.
2. **Orchestrator auto candidate generation:** If no hard requirement exists, the Orchestrator's selector generates candidates from project context, language, domain, framework, tier level, and operation type.
3. **Orchestrator config constraints:** Disabled/required/override lists may narrow or replace the Orchestrator-generated candidate set as defined in `Plans/orchestrator-subagent-integration.md`.

The candidate produced here becomes a `plan_or_tier_default` or `auto_surface_resolver` input to the global requested/effective Persona resolution flow; it does **not** bypass manual selection, scoped natural-language overrides, or higher-priority run-envelope inputs.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#PERSONA-SELECTION-SOURCE-ENUM, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Personas.md#STORAGE-LAYOUT

### 5.2 Context injection

Once a Persona is resolved, its content is injected into the Agent's compiled context by the **context compiler** (`Plans/FileSafe.md` Part B). The injection follows these rules:

1. The Persona's Markdown body is prepended to the Instruction Bundle (per `Plans/Contracts_V0.md#InstructionBundleAssembly`).
2. The Persona's `default_mode` (if set and not overridden by run config) influences the run mode for that Agent.
3. The Persona's `default_permissions_profile` (if set) is applied as the base permission ruleset, with run-config and tier-level overrides layered on top.
4. The Persona's `default_skill_refs` are loaded and their content added to the context.
5. The Persona's runtime-preference fields (`default_platform`, `default_model`, `default_variant`, `temperature`, `top_p`, `reasoning_effort`) feed the effective runtime resolution flow defined by `Plans/Models_System.md` and `Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD`.
6. The Persona's `talkativeness` field is compiled into a standardized behavior directive in the Instruction Bundle. `model_default` adds no extra verbosity directive. The other values instruct the active Agent to be more or less expansive/collaborative while preserving correctness, schema compliance, and any stricter user/system length requirements.
7. The Persona's tool-guidance fields (`preferred_tools`, `discouraged_tools`, `tool_usage_guidance`) influence planning/tool choice but MUST NOT replace Permissions allow/ask/deny enforcement.

**Interview integration:** The Interview phase manager uses the same injection mechanism. For each interview phase, the phase-assigned Persona(s) are resolved and injected into the phase prompt. Persona overrides do not change *which* Personas the Interview selects — they only supply custom description/instruction content for those selected Personas (per `Plans/interview-subagent-integration.md` — "Subagent personas" in §Relationship).

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FileSafe.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Models_System.md#SELECTION-PRIORITY, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Permissions_System.md

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

<a id="REGISTRY-RELATIONSHIP"></a>

Puppet Master now distinguishes between two related but non-identical registries:

### 7.1 Canonical `persona_registry`

`persona_registry` is the canonical set of **valid Persona IDs** for runtime resolution across Chat, Interview, Requirements Builder, Orchestrator, Multi-Pass Review, and delegated child runs.

At minimum, `persona_registry` MUST include:
- every ID in the canonical delegated-subagent registry, **plus**
- the non-delegated built-ins required by Persona/runtime resolution:
  - `collaborator`
  - `general-purpose`
  - `researcher`
  - `deep-researcher`
  - `sre`

Automatic surface resolution, natural-language resolution, stored overrides, and validation of requested/effective Persona IDs MUST validate against `persona_registry`, not against the delegated-subagent subset.

### 7.2 Canonical `subagent_registry`

`subagent_registry` remains the canonical subset of Persona IDs that are valid for **delegated subagent/task-tool execution** and provider-facing delegated-run validation.

Rules:
- Every `subagent_registry` entry MUST also exist in `persona_registry`.
- `persona_registry` MAY contain IDs that are **not** valid delegated subagents.
- Task-tool validation and delegated-run launch paths validate against `subagent_registry`.
- Chat/Interview/Builder/Orchestrator surface resolution validates against `persona_registry`.

### 7.3 Why the split is required

The Persona system now includes valid runtime Personas that are not purely delegated-subagent identities. Examples include `collaborator` for questioning/planning, `general-purpose` as a generic execution fallback, and `researcher` / `deep-researcher` for explicit research modes.

It is therefore incorrect to treat the delegated-subagent list as the complete set of valid runtime Personas.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

---

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

This addendum expands the Persona system so it can serve as Puppet Master's canonical equivalent of the OpenCode runtime `agent` object while preserving Puppet Master terminology.

### 10.1 Canonical terminology and invariants

- **Persona** remains the canonical stored contract.
- **Agent** remains the canonical term for a running AI execution instance.
- **Subagent** remains the canonical term for a delegated Agent.
- Provider-native terms such as OpenCode `agent`, OpenCode `subagent`, Claude Code subagents, or Cursor agent naming are **reference/baseline terms only** and MUST NOT replace Puppet Master terminology in SSOT docs.
- A Persona may be attached to:
  - a primary Assistant run,
  - an Interview phase/stage run,
  - a Requirements Builder stage/pass run,
  - an Orchestrator tier run,
  - or a delegated Subagent run.

### 10.2 Persona is broader than prompt text

A Persona is not merely a prompt overlay. It is a **behavior-and-runtime contract** that may define:

- identity and expertise,
- collaboration style and communication behavior,
- workflow/process guidance,
- tool guidance and tool preference,
- preferred platform/model/variant,
- optional runtime control preferences (`temperature`, `top_p`, `reasoning_effort`) when the provider supports them,
- optional skill/plugin defaults,
- and UI metadata for selection and display.

Rule: The Persona body remains the primary instruction content, but the frontmatter/runtime metadata are equally normative for effective run assembly.

### 10.3 Persona behavior style is part of Persona, not a separate overlay

The following user-facing behavior characteristics are treated as Persona content, not as a separate style system:

- engaged,
- creative,
- collaborative,
- exploratory,
- willing to talk more,
- more proactive in offering solutions.

Resolved decision: **Collaborator** is a first-class built-in Persona and owns those user-facing interaction traits.

### 10.4 Schema expansion (additive)

Extend the Persona schema with the following optional fields:

```yaml
---
id: "collaborator"
name: "Collaborator"
description: "User-facing, engaged planning and clarification persona."
default_mode: "regular"
default_platform: null
default_model: null
default_variant: null
temperature: null
top_p: null
reasoning_effort: null
default_skill_refs: []
disabled_plugins: []
preferred_tools: []
discouraged_tools: []
tool_usage_guidance: ""
tags: ["general", "collaboration", "user-facing"]
aliases: ["collab", "discussion", "planner"]
---
```

#### Added/clarified fields

| Field | Type | Meaning |
|---|---|---|
| `default_platform` | `string | null` | Preferred provider/platform for this Persona. |
| `default_model` | `string | null` | Preferred provider/model identifier for this Persona. |
| `default_variant` | `string | null` | Preferred variant or model preset. |
| `temperature` | `number | null` | Preferred sampling temperature when supported by the active provider transport. |
| `top_p` | `number | null` | Preferred nucleus sampling value when supported. |
| `reasoning_effort` | `string | null` | Preferred provider-specific effort/reasoning level when supported. |
| `preferred_tools` | `string[]` | Tools the Persona should proactively prefer. Guidance only by default. |
| `discouraged_tools` | `string[]` | Tools the Persona should avoid unless needed. Guidance only by default. |
| `tool_usage_guidance` | `string` | Freeform strategy guidance for tool selection/execution. |
| `aliases` | `string[]` | Natural-language invocation aliases and display synonyms. |

Rules:
- These fields are **preferences/guidance** unless another subsystem elevates them to enforcement.
- Unsupported provider controls are skipped, recorded, and surfaced to the user; they are never silently assumed to have been honored.
- `preferred_tools`, `discouraged_tools`, and `tool_usage_guidance` do **not** replace Permissions allow/ask/deny enforcement.

### 10.5 Persona import baseline from provider-native agent files

Provider-native agent files (such as `.claude/agents/*.md`) are valid **seed/import material** for Personas, but they are never canonical runtime storage.

Import rules:
- Useful behavioral/process guidance in those files SHOULD be preserved when imported.
- Tool guidance and workflow checklists MAY be translated into Persona fields/body sections.
- Provider-native fields or assumptions that are not portable MUST be normalized into Puppet Master's provider-capability-aware representation.
- Imported artifacts are saved only into Puppet Master Persona storage paths.

### 10.6 Provider-native OpenCode baseline (informative but normative for delta design)

OpenCode's runtime `Agent.Info` object bundles:
- prompt,
- mode,
- permissions,
- model,
- variant,
- temperature,
- topP,
- options,
- steps,
- and description/name.

OpenCode then:
- resolves the selected agent by name,
- chooses model via explicit request -> agent model -> last-used model,
- injects `agent.prompt` into system prompt assembly,
- merges runtime options/variant,
- and applies tool permission checks through merged agent/session rules.

Puppet Master SHOULD mirror the **mechanics** of that assembly through Personas while keeping Puppet Master terminology and permission separation.

### 10.7 New built-in Personas that MUST be fully defined
### 10.7.1 Canonical built-in Persona minima

Until the full built-in `PERSONA.md` files are published, the following minima are normative and MUST be preserved by implementation:

| Persona ID | Primary job | Default mode | Default talkativeness | Tool stance | Primary auto-selection cues |
|---|---|---|---|---|---|
| `collaborator` | User-facing clarification, planning, tradeoff discussion | `regular` | `talk_more` | Prefer questions, synthesis, and lightweight inspection before execution | ambiguity, intake, planning, conversation-heavy work |
| `general-purpose` | Broad fallback execution Persona | `regular` | `model_default` | Balanced; no special tool bias beyond Permissions | final fallback when no better Persona resolves |
| `explorer` | Read-oriented repository and artifact investigation | `regular` | `talk_a_little_less` | Prefer read/search/inspect tools; avoid edits unless explicitly requested | repo discovery, read-only investigation, tracing |
| `researcher` | Focused external research and synthesis | `regular` | `talk_more` | Prefer retrieval/research flows and synthesis over code execution | web/source gathering, factual comparison |
| `deep-researcher` | Broader or multi-source research with heavier synthesis | `regular` | `talk_more` | Same as `researcher`, but for deeper/more expensive synthesis | broad research asks, deeper evidence gathering |
| `technical-writer` | Human-readable documentation and structured drafting | `regular` | `talk_a_little_more` | Prefer document-editing and summarization flows | drafting specs, docs, handoff artifacts |
| `requirements-quality-reviewer` | Requirements completeness and ambiguity review | `regular` | `talk_a_little_less` | Review-oriented; should not silently become the drafting Persona | requirements QA, acceptance coverage review |
| `security-engineer` | Implementation-focused security work | `regular` | `model_default` | Execution-oriented security remediation | security fixes, hardening implementation |
| `security-auditor` | Security review and findings generation | `regular` | `talk_a_little_less` | Audit/review-oriented; prefer evidence before remediation | security audits, threat/risk review |
| `devops-engineer` | Deployment, infra, CI/CD, operations implementation | `regular` | `model_default` | Execution-oriented infra/tooling work | CI/CD, deploy, infra automation |
| `sre` | Reliability, production-readiness, operational validation | `regular` | `talk_a_little_less` | Verification and reliability review over feature drafting | production-readiness, incident/risk validation |

Implementation rule:
- Built-in `PERSONA.md` files shipped by Puppet Master MUST match these minima.
- Surface-specific mappings may refine *when* one of these Personas is chosen, but they MUST NOT redefine the Persona's core job or invert its tool stance.


The following built-ins are now first-class and MUST be fleshed out in Persona storage and UI:

- `collaborator`
- `general-purpose`
- `explorer`
- `researcher`
- `deep-researcher`

The following existing or planned Personas also require sharpened contracts:

- `technical-writer`
- `requirements-quality-reviewer`
- `security-engineer`
- `security-auditor`
- `devops-engineer`
- `sre`

### 10.8 Canonical explorer naming

Resolved naming rule:
- Puppet Master standardizes on **`explorer`** as the canonical Persona ID and display concept.
- Stale uses of `explore` in plans/registry/examples are legacy/OpenCode carryover and MUST be normalized to `explorer`.
- `explore` MAY be accepted as an **input alias only** (for natural-language requests, imports, or migration), but persistence, config storage, registry rows, and UI display MUST always normalize to `explorer`.

### 10.9 Natural-language Persona invocation

Users may explicitly summon Personas by natural language in Chat and other interactive surfaces.

Examples:
- "Use Explorer"
- "Switch to Collaborator"
- "Be a Rust engineer"
- "Answer as a technical writer"
- "Use the security auditor for this"

#### Resolution requirements

- Natural-language Persona invocation resolves against:
  - canonical Persona IDs,
  - display names,
  - aliases,
  - and fuzzy normalized forms (for example `rust engineer` -> `rust-engineer`).
- On success, the invocation creates a `requested_persona` override.
- The runtime must record `persona_selection_source = user_natural_language`.
- Ambiguous matches should trigger a clarification flow only when deterministic alias/ID resolution cannot safely choose a single Persona.

#### Scope defaults

Default scope resolution:
- one-shot phrasing such as "for this answer", "for this", "right now" -> **turn scope**,
- persistent phrasing such as "from now on", "in this chat", "for this session" -> **session scope**.

Optional explicit scopes may also be supported:
- run scope,
- task scope,
- subagent scope.

### 10.10 Auto/manual/hybrid Persona selection

Every major execution surface supports Persona selection modes:

- `manual`
- `auto`
- `hybrid`

Definitions:
- **manual:** user/config chooses Persona directly and auto selection is not used unless fallback is required.
- **auto:** system resolver chooses Persona based on context/task/surface.
- **hybrid:** auto chooses initial Persona, but the user may lock or override it.

Auto mode MUST NOT be opaque. The system must always expose:
- effective Persona,
- why it was chosen,
- and whether the current effective Persona came from auto, explicit user request, config, or plan/tier assignment.

### 10.11 Effective Persona Resolution Record (cross-reference)

This document declares the Persona-owned fields of the runtime selection record. The full cross-system record is defined jointly with `Plans/Models_System.md` and `Plans/Prompt_Pipeline.md`.

Every run/sub-run/phase/tier/pass MUST carry at minimum:

- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`

Shared-record note: `Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD` is the canonical cross-system record definition; this section owns only the Persona-specific fields within that shared structure.

`selection_reason` examples:
- `Auto: Rust repo + code-edit task`
- `Auto: interview questioning stage`
- `User requested via natural language`
- `Tier default: iteration execution`
- `Fallback: preferred Persona unavailable`

### 10.12 Acceptance criteria addendum

Add the following acceptance criteria to Persona implementation work:

- A Persona may request platform/model/variant/runtime controls, and unsupported controls MUST be skipped with explicit recording and UI disclosure.
- Auto mode must always show the effective Persona and selection reason; it must never display only `Auto` with no resolution detail.
- Natural-language Persona invocation must resolve deterministically to a requested Persona override or trigger clarification when ambiguous.
- Puppet Master storage remains the only canonical Persona storage. Editing Personas MUST NOT mutate provider-native directories.
- Canonical built-in Persona naming MUST use `explorer`, not `explore`.
