# Skills System (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master **Skills** subsystem: skill identity, on-disk format (`SKILL.md`), discovery roots and ordering, deduplication/shadowing rules, permissions integration (`skill` key), how skills are surfaced to runs (Persona `default_skill_refs`, context compiler bundling, and the `skill` tool), and GUI requirements.

All other plan documents MUST reference this document by anchor (e.g., `Plans/Skills_System.md#DISCOVERY`) rather than redefining skill discovery or schema.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Tool registry semantics: `Plans/Tools.md` (skill tool I/O)
- Permission model + tool keys: `Plans/Permissions_System.md` (`skill`, `external_directory`)
- Persona schema + default_skill_refs: `Plans/Personas.md#PERSONA-SCHEMA`
- Context compiler + skill bundling: `Plans/FileSafe.md` Part B
- GUI requirements: `Plans/FinalGUISpec.md` §7.4B-§7.4C (Agent Config > Skills)
- OpenCode baseline (skills): `Plans/OpenCode_Deep_Extraction.md` §7F

---

## 1. Definitions

<a id="DEFINITIONS"></a>

### 1.1 Skill

A **Skill** is a named, user-authored context module stored as a Markdown file (`SKILL.md`) with YAML frontmatter. Skills are loaded as text and injected into an Agent's compiled context (bundled) or loaded on-demand via the `skill` tool.

### 1.2 Skill ID

<a id="SKILL-ID"></a>

A Skill is identified by a stable **Skill ID** string. In Puppet Master, the Skill ID is the YAML frontmatter `name` field and MUST follow the canonical skill name regex from the OpenCode baseline:

- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Length: 1–64 characters

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 2. On-disk format (SKILL.md)

<a id="SKILL-SCHEMA"></a>

### 2.1 File layout

A skill is stored as a directory containing one required file:

```
<skill_root>/<skill_id>/SKILL.md
```

### 2.2 YAML frontmatter

The SKILL.md MUST begin with YAML frontmatter containing at minimum:

```yaml
---
name: "doc-lookup"
description: "Look up documentation quickly and return citations."
---
```

| Field | Type | Required | Validation |
|---|---|---:|---|
| `name` | `string` | Yes | Skill ID regex + length (§1.2) |
| `description` | `string` | Yes | 1–1024 chars, trimmed |

Additional frontmatter fields MAY be present (e.g., `license`, `compatibility`, `metadata`, `tags`) but are not required for core discovery and loading.

### 2.3 Body

The Markdown body following the frontmatter is the Skill content. The loader preserves the body verbatim (no templating in v1).

ContractRef: ContractName:Plans/Tools.md

---

## 3. Storage layout and discovery

<a id="DISCOVERY"></a>

### 3.1 Canonical discovery roots

Skills are discovered from deterministic on-disk roots.

**Project-local roots (relative to project root):**
- `.puppet-master/skills/**/SKILL.md`
- `.claude/skills/**/SKILL.md`
- `.agents/skills/**/SKILL.md`

**Global roots:**
- `~/.config/puppet-master/skills/**/SKILL.md`
- `~/.claude/skills/**/SKILL.md`
- `~/.agents/skills/**/SKILL.md`

Rule: Project-local discovery MUST resolve relative to the active project root (walk up from CWD to git worktree root, or use the app's selected project path).

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/MiscPlan.md

### 3.2 Search order and deduplication (shadowing)

<a id="SEARCH-ORDER"></a>

Discovery MUST walk roots in this canonical order (first match wins for a given Skill ID):

1. Project `.puppet-master/skills`
2. Project `.claude/skills`
3. Project `.agents/skills`
4. Global `~/.config/puppet-master/skills`
5. Global `~/.claude/skills`
6. Global `~/.agents/skills`

Rule: When two discovered skills share the same Skill ID, the first discovered skill is the canonical one and later duplicates are treated as **shadowed**.

Rule: The GUI MUST expose shadowed duplicates (at least as a warning indicator) so users can resolve conflicts.

ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md

### 3.3 Validation during discovery

<a id="DISCOVERY-VALIDATION"></a>

During discovery, the loader MUST:
1. Parse YAML frontmatter; if invalid, mark the skill as invalid and include an error message.
2. Validate `name` and `description` per §2.2.
3. Enforce directory-name match: the enclosing folder name MUST equal the Skill ID (`name`).

Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.

ContractRef: ContractName:Plans/MiscPlan.md

---

## 4. Runtime surface
The MVP runtime surface for skills is canonical and provider-agnostic.

### 4.1 Skill registry
The skill registry remains the discovery and validation source for available skills. It determines what a run may reference, but it is not itself a provider-specific runtime delivery mechanism.

### 4.2 Persona `default_skill_refs`
`default_skill_refs` are resolved against the canonical registry during prompt/context assembly. They do not imply provider-native skill file installation at runtime.

### 4.3 `skill` tool
The canonical runtime surface for skill invocation is shared with `Plans/Tools.md`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

#### Input

`skill_id`, `arguments?`, `context?`

#### Output envelope

`skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, `metadata?`

Runtime rules:
- discovery lists `ready` and `ready_with_warnings`
- auto-invoke is limited to `ready`
- FileSafe-constrained resource disclosure remains explicit; skills do not expose raw filesystem listings outside that boundary
Discovery/invocation convergence:
- `/skill <skill_name> [args]`, the Skills panel, and Natural language all converge on `invoke_skill`.
- `/skill with no args lists available skills` or opens discovery/help.
- No subcommand family for MVP.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Rules:
- GUI panel, /skill, and Natural language converge on the same runtime contract
- ready_with_warnings remains discoverable but is not auto-invoked
- Keep this skill runtime section consuming Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved) for slash dispatch identity
### 4.4 Canonical MVP delivery path

MVP skill delivery uses one on-disk format: a single `SKILL.md` per skill.

ContractRef: ContractName:Plans/Tools.md

Delivery rules:
- a skill package resolves to one canonical `SKILL.md`
- import and install preserve the same `skill_id` and readiness semantics used at runtime
- archive format or multi-file package details are implementation concerns and are not the public doc contract
### 4.5 Non-goal for MVP
MVP does not require a per-provider native runtime skill-loading matrix. If provider-native loading is added later, it is an optimization or interoperability layer above the canonical registry + bundling + tool path.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md
## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 `skill` permission key

The permission key for skill loading is `skill` (`Plans/Permissions_System.md#TOOL-KEYS`).

Rule: The permission engine MUST support granular rules over Skill IDs for the `skill` key.

### 5.2 External directory guard

### 5.3 Child-run inheritance

Skills do not blindly copy into child runs. A child receives only the effective compatible subset of the parent-allowed skill universe.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

Rules:
- a child may use a skill only if the parent effectively allowed it.
- the target runtime surface must support the behavior needed by that skill.
- child Persona or task-specific narrowing may disable a skill that the parent still had.
- a child must not gain skill-powered capability that exceeds the parent ceiling.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Skills may be discovered outside the project root (global roots).

Rule: Discovered skill roots MUST be treated as allowed roots for the `skill` tool path checks and for `external_directory` guard evaluation.

ContractRef: ContractName:Plans/Permissions_System.md

---

## 6. GUI requirements

Skill management lives in `Agent Config > Skills`.

### 6.1 Management surface

Agent Config owns Personas and Skills. Settings does not re-own skill management.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md

Required surfaces:
- skill discovery by `skill_id`, title, and readiness
- source vocabulary `bundled`, `pm_enhanced`, `catalog_installed`, `manual_import`, `project_local`, `global_local`, `shadowed`
- readiness vocabulary `ready`, `ready_with_warnings`, `invalid`, `shadowed`, `disabled`
- visible source/readiness badges in the management table rather than a hidden inspector-only view
- store/discovery surfaces remain separate from the management list used for enablement and review

### 6.2 Import and install flows

Import and install flows preserve the one-`SKILL.md` model and the runtime readiness contract.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

Flow rules:
- imports register a canonical `skill_id`
- readiness is evaluated after install and surfaced as `ready`, `ready_with_warnings`, `invalid`, `shadowed`, or `disabled`
- file-browser import and drag-and-drop skill folders/files are supported MVP entry points into the same canonical install flow
- No remote URL/git import in v1
- imported resources stay within FileSafe-constrained disclosure rules

### 6.3 Slash and runtime boundary

`/skill` is a discovery or invocation affordance that lands on the same runtime contract as tool-based skill invocation.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md

Boundary rules:
- `/skill <skill_name> [args]` resolves directly to the shared runtime contract
- `/skill with no args lists available skills` or opens discovery/invocation help
- slash and Natural language invocation both resolve to the same `invoke_skill` / `skill_id / arguments? / context?` runtime contract
- No subcommand family for MVP
- the Skills panel surfaces the same discovery and help posture
- `ready_with_warnings` remains discoverable but is not auto-invoked
## 7. Baseline alignment (OpenCode)

<a id="BASELINE-DELTAS"></a>

OpenCode baseline notes (see `Plans/OpenCode_Deep_Extraction.md` §7F):
- OpenCode supports additional discovery sources (e.g., `.opencode/skills`, config paths/URLs) and uses later-overwrites-earlier on collision.

Puppet Master deltas:
- Puppet Master does **not** use `.opencode/skills` roots.
- Puppet Master uses **first-wins** discovery with explicit shadowing visibility (§3.2).
- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system (§7.4.3 in `Plans/FinalGUISpec.md`) rather than ad-hoc URL pulls.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2

---

## 8. Acceptance criteria

<a id="ACCEPTANCE"></a>

<a id="AC-SK01"></a>
**AC-SK01:** Skills MUST be discovered from the canonical roots and in the canonical order defined in §3.2.

ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER

<a id="AC-SK02"></a>
**AC-SK02:** Duplicate Skill IDs MUST be resolved first-wins, and shadowed duplicates MUST be visible in the GUI.

ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER, ContractName:Plans/FinalGUISpec.md

<a id="AC-SK03"></a>
**AC-SK03:** The `skill` tool MUST enforce that explicit file paths are under allowed discovery roots.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md
