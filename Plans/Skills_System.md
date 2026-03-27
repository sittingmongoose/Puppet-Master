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
The `skill` tool is the canonical on-demand runtime access path.
- agents can request a specific skill by id
- permission and policy checks still apply
- tool responses are normal Puppet Master runtime artifacts, not provider-private hidden injections

### 4.4 Canonical MVP delivery path
MVP runtime skill delivery is:
1. resolve referenced skills from the registry
2. bundle selected skill content into compiled context when the context compiler decides it is needed
3. allow on-demand access through the `skill` tool for additional lookups

Provider-native skill directories, agent files, or external packaging formats are:
- discovery sources
- import/export formats
- interoperability inputs

They are not the canonical MVP runtime contract.

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
The Skills tab is the canonical management surface for installed, bundled, and imported skills.

Required capabilities:
- show a browseable catalog of currently available skills
- distinguish bundled PM skills, imported skills, and catalog-installed skills
- show readiness / validation state and missing-runtime requirements
- expose management actions in the catalog itself

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

### 6.2 Import and install flows
Required import/install flows:
- drag/drop skill folder or file import
- file-picker import
- Skill Store launcher for browse/install-only flows

Rules:
- imported metadata populates the catalog entry
- validation runs immediately on import
- simple single-file imports may be wrapped into a generated enclosing folder when needed by the runtime

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

### 6.3 Slash and runtime boundary
`/skill` is a lightweight invocation helper only.

Rules:
- skill management MUST NOT move into a `/skills` management family
- runtime skill access remains the `skill` tool and the skill registry
- the GUI must preserve the distinction between “discovered” and “actually runnable on PM”

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

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