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
- GUI requirements: `Plans/FinalGUISpec.md` (§7.4 Skills tab)
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

<a id="RUNTIME-SURFACE"></a>

### 4.1 Skill registry

The runtime maintains a registry of discovered skills keyed by Skill ID. The registry is the source for:
- GUI Skills tab list
- Persona editor multi-select (`default_skill_refs`)
- Resolution for the `skill` tool when invoked by name

### 4.2 Persona `default_skill_refs`

When a Persona specifies `default_skill_refs`, those skill IDs MUST be resolved against the registry at run start.

Rule: Unresolvable refs MUST produce a warning but MUST NOT block the run.

Rule: Resolved skills SHOULD be bundled by the context compiler as described in `Plans/FileSafe.md` Part B (Skill Bundling).

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/FileSafe.md

### 4.3 `skill` tool

The canonical tool semantics are defined in `Plans/Tools.md`.

Rule: The `skill` tool input `path_or_name` MUST accept either:
- a Skill ID (preferred), resolved via the registry; or
- an explicit file path to a `SKILL.md`, which MUST be under one of the allowed discovery roots.

Rule: The `skill` tool MUST return `{ name, content }` where `name` is the resolved Skill ID.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

---

## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 `skill` permission key

The permission key for skill loading is `skill` (`Plans/Permissions_System.md#TOOL-KEYS`).

Rule: The permission engine MUST support granular rules over Skill IDs for the `skill` key.

### 5.2 External directory guard

Skills may be discovered outside the project root (global roots).

Rule: Discovered skill roots MUST be treated as allowed roots for the `skill` tool path checks and for `external_directory` guard evaluation.

ContractRef: ContractName:Plans/Permissions_System.md

---

## 6. GUI requirements

<a id="GUI-SKILLS"></a>

The **Skills** tab in Settings MUST implement the GUI behavior described in `Plans/FinalGUISpec.md` (Settings tabs table, Skills row). This SSOT adds the subsystem-specific requirements:

1. **Source column:** Must label skills as Project/Global and indicate which root they came from (`.puppet-master`, `.claude`, `.agents`).
2. **Validation status:** Must show invalid skills with error messages (frontmatter parse errors, missing required fields, directory mismatch).
3. **Shadowing indicator:** Must show when a skill is shadowed by a higher-priority root (§3.2) and allow users to navigate to the shadowed copies.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

---

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
