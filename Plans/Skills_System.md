# Skills System (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical SSOT** for the Puppet Master **Skills** subsystem: skill identity, on-disk format (`SKILL.md`), discovery roots and ordering, search order, deduplication/shadowing rules, permissions integration (`skill` key), how skills are surfaced to runs (Persona `default_skill_refs`, context compiler bundling, and the `skill` tool), runtime surface ownership, and GUI ownership/requirements.

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
- GUI requirements: `Plans/FinalGUISpec.md` §7.4A Agent Config Skills tab
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

Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata into a PM-only `/overlay` or sidecar-only MCP schema that would create a second source of truth outside the skill's `name` and `description`.

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

### 4.3 skill tool

This section defines the canonical contract for this surface.

Runtime contract addendum:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- The shared `invoke_skill` payload carries `skill_id`, `input`, optional `context`, and optional `timeout`; when context is supplied it includes `project_root`, optional `active_file`, optional `selection`, and `conversation_id` so invocation is tied to the active thread and workspace scope.
- Skill defines its own `input` schema via manifest, and PM validates that schema before invocation.
- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.
- Assistant awareness (`assistant-awareness`) does not make every discovered skill assistant-auto-usable. Auto-invoking is limited to skills that are `runtime-ready`, eligible in the active project/session, permission-allowed, and flagged `auto_invokable`; `runtime-ready-with-warnings`, `ready_with_warnings`, imported-with-warnings, invalid, disabled, shadowed, and `warning-blocked` skills require explicit user or agent selection.
- The `skill` tool-description is dynamic: when PM presents the tool to a model, it exposes the live roster of currently runtime-ready skill names and descriptions from manifests, and it updates after registry changes such as import, enable, disable, or revalidate.
- The `skill` tool does not create a hidden `nested-task` and does not own shell or PTY execution. Skill-triggered tool work remains under that tool's permission, Terminal, and audit contracts; chat rendering of skill or tool output is only an audited `/expandable` result surface.
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
- Skill routes that open `/artifact/search/attention` consumers use the shared `route-target` contract, preserving active project, conversation, selection, run/thread/attempt, and skill identity instead of emitting feature-local deep-link payloads.
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.

Core rules:
- Agent behavior management is locked under Agent Config, with Skills as a tab inside it, while Settings retains system-level dependencies and rules.
- Skills management is locked to explicit catalog and import UX, fixed source and readiness vocabularies, store-vs-management separation, and visible source/readiness badges including pm_enhanced.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.
- Skill runtime and permission behavior is locked to a structured skill tool envelope, discovery versus auto-invoke readiness rules, dynamic runtime tool descriptions, FileSafe-constrained resource access, and Agent Config ownership.

Fields:
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- No subcommand family for MVP
- Skills panel
- Natural language
- /natural-language
- skill_id
- arguments?
- context?
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- ready_with_warnings

Labels and values:
- /skill

Rules:
- Agent Config
- Skills
- Personas
- Agent Config owns: agent-behavior artifacts (personas, skills)
- Settings keeps: system-level dependencies (authentication, models, permissions, rules, health)
- Agent Config is NOT replacement for Settings
- drag-and-drop skill folders/files
- file-browser import
- No remote URL/git import in v1
- bundled
- catalog_installed
- manual_import
- project_local
- global_local
- pm_enhanced
### 4.4 Canonical MVP delivery path

MVP skill delivery uses one on-disk format: a single `SKILL.md` per skill.

ContractRef: ContractName:Plans/Tools.md

Delivery rules:
- a skill package resolves to one canonical `SKILL.md`
- import and install preserve the same `skill_id` and readiness semantics used at runtime
- archive format or multi-file package details are implementation concerns and are not the public doc contract
- External Swift-Agent-Skills / agent-skills patterns are design evidence for the adopted portable folder-based `SKILL.md` package shape with optional resources. PM may import/discover them through canonical roots, but the runtime remains the PM registry/discovery/runtime contract.
- A portable folder-based skill package may include bounded package-resource directories such as `resources/`, `scripts/`, and `templates/`; these entries are FileSafe-limited package resources and never replace the single canonical `SKILL.md` manifest/instruction entrypoint, create extra manifests, or authorize provider-native runtime loaders.
- Skills/SKILL.md portability uses the default-import model: portable `SKILL.md` packages import into the PM skill registry and bundled/on-demand context path. External web search examples in skills are REFERENCE ONLY for import semantics; PM uses native Exa/Tavily/DDG/model-native providers for `websearch`/`webfetch` and `/webfetch` rather than adopting a skill-local search backend.
### 4.5 Non-goal for MVP
MVP does not require a per-provider native runtime skill-loading matrix. If provider-native loading is added later, it is an optimization or interoperability layer above the canonical registry + bundling + tool path.

PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM's canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.

Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.

Projection/export defaults are deliberately conservative: `/discover` import stays on, `/exported` or `export/project` projection stays off by default, shared roots such as `.claude/skills` and `.agents/skills` are preferred before per-account sandboxes, `copy` is the baseline projection method, and `symlink` is advanced `/explicit` behavior only after validation confirms support. The GUI and `/exported` views surface the projection result per target immediately, including target, method, drift state, and blockers. Source/provenance labels may surface `PM bundled`, `Imported`, and `Catalog`, while provider-specific CLIs/SDKs consume projected copies only as interoperability targets and never become the canonical skill delivery path.

Projection/export path handling uses canonical path APIs and OS-native separators on Windows/macOS/Linux; PM must never hand-roll slash assumptions for interoperability paths. `copy` remains the default projection method because `symlink` is less portable and more failure-prone across Windows/macOS/Linux, especially where Windows privilege/policy variance applies. Projection into workspace/global convention roots is safer than projection into provider-account sandboxes. Skill ID collision and shadowing are resolved by logical-name identity, not path-string identity, and discovery/projection bookkeeping must account for Windows case-normalization before treating two skills as distinct.

The GUI surfaces projection state, drift, override behavior, and provider/runtime blockers for skills, but PM-bundled skills and the PM `skill` tool remain usable through the canonical registry even when provider-native projection is absent, disabled, or failed.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md
## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 `skill` permission key

The permission key for skill loading is `skill` (`Plans/Permissions_System.md#5-tool-permission-keys`).

Rule: The permission engine MUST support granular rules over Skill IDs for the `skill` key.

### 5.2 External directory guard

Skill permission grants operate over canonical skill IDs, NOT raw filesystem paths. Skill resource paths may be disclosed to the model only when they resolve within allowed roots; attempts to access resources outside the FileSafe allowlist or external-directory policy return normal blocked-action recovery rather than exposing the path. Underlying file operations performed by a skill still pass through FileSafe, even when the `skill` permission itself is allowed.

### 5.3 Child-run inheritance

Skills do not blindly copy into child runs. A child receives only the effective compatible subset of the parent-allowed skill universe.
This child-run inheritance rule cross-references `Plans/Skills_System.md` (`/Skills_System.md`) and `Plans/Plugins_System.md` (`/Plugins_System.md`): skills, /plugins/MCP capabilities, and plugin-provided tool surfaces all stay under the parent-allowed ceiling before child-specific narrowing is applied.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

Rules:
- a child may use a skill only if the parent effectively allowed it.
- the target runtime surface must support the behavior needed by that skill.
- child Persona or task-specific narrowing may disable a skill that the parent still had.
- a child must not gain skill-powered capability that exceeds the parent ceiling.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Skills may be discovered outside the project root (global roots).

Rule: Discovered skill roots MUST be treated as allowed roots for the `skill` tool path checks and for `external_directory` guard evaluation, but they are not auto-whitelisted by raw path string alone: PM canonicalizes the skill root before allowlisting it and rejects symlinked roots that resolve outside the permitted root set.

ContractRef: ContractName:Plans/Permissions_System.md

---

## 6. GUI requirements

Skill management lives in `Agent Config > Skills`.

### 6.1 Management surface

Agent Config owns Personas and Skills. Settings does not re-own skill management.

Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.
Agent Config > Personas covers create/edit/manage personas, persona metadata, persona-scoped runtime preferences, and skill refs; detailed persona schema remains owned by `Plans/Personas.md`.

The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.

The Skills tab owns import/manage actions (`/edit/manage`, `/install/manage`, `/management`, `/disable/remove/revalidate/reimport`) for installed or active skills. The Skill Store is `/install-only`: it is a GUI `/module` for browsing and `/installing` catalog skills and returns installed rows to Agent Config > Skills for inspect/preview, inspection, enable/disable, edit source, source edit, revalidate, reimport, remove/uninstall, open source location, permissions/risk level review (`/risk`), module/source provenance (`/module`), and readiness/state (`/readiness/state`).

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md

Required surfaces:
- skill discovery by `skill_id`, title, and readiness
- source vocabulary `bundled`, `pm_enhanced`, `catalog_installed`, `manual_import`, `project_local`, `global_local`, `shadowed`; `pm_enhanced` marks PM-shipped enhanced/customized variants of upstream portable skills and displays as a visible source badge
- readiness vocabulary `ready`, `ready_with_warnings`, `invalid`, `shadowed`, `disabled`; these five values are the complete readiness vocabulary and no sixth readiness state is canonical
- skill row badges preserve the exact readiness/context identifiers `referenced_by_persona`, `auto_invokable`, `requires_missing_capability`, and `catalog_update_available`
- visible source/readiness badges in the management table rather than a hidden inspector-only view
- store/discovery surfaces remain separate from the management list used for enablement and review
- the loaded-skills catalog supports search, status/readiness filters, `/source/category` filters, preview details, and open-source-folder or open-repo actions when provenance includes a local path, catalog source, or origin URL

Provenance/source GUI wording must distinguish `/source` from `/location`: user-facing origin labels include `Bundled with PM`, `Imported from disk`, `Installed from catalog`, and `Installed from GitHub`, while the current local path remains a separate file-location field. If a skill was installed from GitHub or a catalog, PM preserves that origin metadata instead of collapsing the row into only a filesystem path.
Actionable provenance stores a human-readable origin label and a canonical origin URL when one exists. The GUI shows the actual GitHub URL as a clickable link for GitHub-installed skills and shows the catalog/source link for catalog-installed skills when available.

GUI skill rows/cards use plain-language primary states instead of leaking internal `/error` or `/telemetry` categories. User-facing primary states are `Ready`, `Needs setup`, `Needs permission`, `Has problems`, and `Warning`; technical reasons remain secondary text. Each skill row/card shows name, short description, provenance/source, the primary user-facing state, one-line remediation text when not `Ready`, and a primary action button matched to the issue.

Examples of remediation/action pairing:
- `Needs setup` + `Context7 is not configured for this provider` + action `Set up Context7`
- `Needs permission` + `This skill needs access to Context7 Docs` + action `Review permissions`
- `Has problems` + `The skill file has invalid frontmatter` + action `Edit skill`
- `Warning` + `Optional tool Web Search is unavailable` + action `Review tool setup`

When the technical reason must name a raw tool id for audit or permission resolution, the secondary text may preserve that exact id while the primary state stays plain-language: `Needs permission` may show `This skill needs access to context7_query_docs`, and `Warning` may show `Optional tool websearch_cited is unavailable`.

Validation/readiness split:
- `schema invalid`: malformed frontmatter, invalid field types, invalid skill name/description rules, or invalid `required_tool_refs` / `optional_tool_refs` shape. Result: the skill is `Invalid`, not runnable.
- `unknown tool ref`: a syntactically valid tool ref is not found in the canonical PM tool registry. Result: GUI shows `Missing Requirement` or a more specific unknown-tool state instead of success.
- `known tool ref but unavailable in current context`: the tool exists in the registry, but effective availability is blocked by `/runtime/project/persona/permission/health` state. Result: the skill remains valid but not currently runnable; GUI shows `Missing Requirement` or `Permission Blocked` with the exact reason.

Expanded skill inspectors show required tools and current status of each, optional tools and current status of each, projection/export status, validation details, shadowed/duplicate info, and exact provider/runtime-specific blockers where relevant. The GUI must show source/provenance, validation `/readiness`, shadowed status, projected `/exported` status, and runtime requirement gaps in the skills surface rather than hiding projection results in logs. Internal GUI trace labels may include `/card`, `/source`, `/action`, `/export`, `/duplicate`, `/runtime-specific`, and `skill-file`, but every non-ready state still exposes an obvious next step in the same surface.

Canonical readiness records are split into `skill_record` and `skill_runtime_readiness`. `skill_record` carries `skill_id`, `label`, `source_kind = pm_bundled | imported_disk | catalog | github`, `source_url?`, `location_path`, `validation_state = valid | invalid`, and `projection_state = not_projected | projected | projection_failed | drifted`. `skill_runtime_readiness` carries `skill_id`, `runtime_platform_id`, `account_id?`, `connection_profile_id?`, `readiness_state = ready | needs_setup | needs_permission | has_problems | warning`, `reason_codes[]`, `missing_required_tool_refs[]`, `missing_optional_tool_refs[]`, and `last_evaluated_at`. PM resolves `required_tool_refs[]` and `optional_tool_refs[]` against the canonical tool registry, not a provider-local skill system.

OpenCode product tests such as `packages/opencode/test/tool/skill.test.ts` and `/opencode/test/tool/skill.test.ts` are implementation references for provider-independent skill tool behavior; they do not replace PM's canonical skill registry, permission, or readiness contracts.

### 6.2 Import and install flows

Import and install flows preserve the one-`SKILL.md` model and the runtime readiness contract.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

Flow rules:
- imports register a canonical `skill_id`
- readiness is evaluated after install and surfaced as `ready`, `ready_with_warnings`, `invalid`, `shadowed`, or `disabled`
- file-browser import and drag-and-drop skill folders/files are supported MVP entry points into the same canonical install flow
- manual import may accept a folder drop, a single `SKILL.md`, or a zip/tar (`/tar`) archive containing one or more skill folders; each imported skill still resolves to one canonical `SKILL.md`, and single-file `SKILL.md` import creates a generated enclosing folder if needed. Exact archive internals remain implementation details, and imported resources still use the same `skill_id` and readiness model
- remote git clone URL import remains out of v1; URL provenance may be displayed for catalog-installed or GitHub-installed skills, but ad-hoc remote URL pulls do not bypass the Catalog system
- validated `/runtime-ready` skills are auto-invokable by default; `ready_with_warnings` and other imported-with-warnings entries remain discoverable in the loaded-skills catalog but require explicit user or agent selection before invocation
- imported resources stay within FileSafe-constrained disclosure rules

Additional import/install rules:
- Manual GUI import accepts a folder drop, file-browser/folder picker, single `SKILL.md`, `.zip`, or `.tar.gz` package. The flow unpacks/copies into the selected PM-managed scope, validates immediately, and auto-populates catalog entry metadata from `SKILL.md` frontmatter and import provenance (`name`, `description`, source/provenance, readiness, and optional metadata/tags); the visible result is an auto-populating catalog entry until validation finishes.
- Catalog and Store distribution use `/catalog/install`; generic `/install` buttons must resolve either to `/catalog/install` or to the same local import contract. Remote `URL` or git clone import remains out of v1 except as provenance for catalog-installed or GitHub-installed skills.
- Imported packages default to portable unless validation finds unsupported dependencies, missing runtime requirements, permission/risk blockers, or bad schema. Warnings surface as `imported-with-warnings`, `ready_with_warnings`, or `runtime-ready-with-warnings` rather than silently failing; unsupported entries remain discoverable but are not auto-invoked.
- Natural-language examples such as `use the doc-lookup skill`, `load the swiftui-pro skill`, and `what skills do I have available?` route through the same registry-backed `invoke_skill` contract as `/skill` and Agent Config > Skills. The assistant knows runtime-ready skills in the active project/session, but auto-invoking is limited to eligible `auto_invokable` entries.

### 6.3 Slash and runtime boundary

`/skill` is a discovery or invocation affordance that lands on the same runtime contract as tool-based skill invocation.

ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`

Labels and values:
- /skill
- Skills panel
- Natural language

Fields:
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill

Flow rules:
- /skill <skill_name> [args] resolves directly to the shared runtime contract
- slash and Natural language (`/natural-language`) invocation both resolve to the same `invoke_skill` / `skill_id / arguments? / context?` runtime contract
- `/skill`, `/natural-language`, and Skills panel invocation may target catalog-installed or manually imported entries only after they resolve to the registry; auto-invocation remains limited to validated `/runtime-ready` entries
- Skills panel launches the same shared runtime contract
- No subcommand family for MVP
- Historical helper proposals such as `/skill use <skill-id>`, `/skill show <skill-id>`, and `/skill list` normalize to this grammar: bare `/skill` lists available skills, `/skill <skill_name> [args]` invokes, and inspection, permissions, import, install, validation, and readiness management stay in Agent Config > Skills rather than a `/skills` command family.
- NL/Slash discovery scoping surfaces both `ready` and `ready_with_warnings` entries, with visible warning annotation for `ready_with_warnings`; agent-initiated auto-invocation is restricted to `ready` only, and `invalid` entries are excluded from both discovery and auto-invocation
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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Skills_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### SS-001 - Skills System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: SS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Plans/Skills_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Skills_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- Skills System (Canonical SSOT)
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 1. Definitions
- 1.1 Skill
- 1.2 Skill ID
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
- 2. On-disk format (SKILL.md)
- 2.1 File layout
- 2.2 YAML frontmatter
- 2.3 Body
- 'ContractRef: ContractName:Plans/Tools.md'
- 3. Storage layout and discovery
- 3.1 Canonical discovery roots
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/MiscPlan.md'
- 3.2 Search order and deduplication (shadowing)
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
- 3.3 Validation during discovery
- 'ContractRef: ContractName:Plans/MiscPlan.md'
- 4. Runtime surface
- 4.1 Skill registry
- 4.2 Persona `default_skill_refs`
- 4.3 skill tool
negative_constraints:
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata i'
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
- '- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.'
- '### 4.5 Non-goal for MVP'
- '- a child must not gain skill-powered capability that exceeds the parent ceiling.'
- '- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system (§7.4.3 in `Plans/FinalGUISpec.md`) rather than ad-hoc URL pulls.'
compatibility_only_notes:
- Additional frontmatter fields MAY be present (e.g., `license`, `compatibility`, `metadata`, `tags`) but are not required for core discovery and loading.
- '- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gatin'
- '- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visibl'
- '- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.'
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or '
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo'
- Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles,
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`)
stale_retired_dispositions: []
owner_boundary_notes:
- '# Skills System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- 'This document is the **single canonical SSOT** for the Puppet Master **Skills** subsystem: skill identity, on-disk format (`SKILL.md`), discovery roots and ordering, search order, deduplication/shadowing rules, permissions integration (`skill` key), how skills are surfaced to runs (Persona `default_'
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- 'A Skill is identified by a stable **Skill ID** string. In Puppet Master, the Skill ID is the YAML frontmatter `name` field and MUST follow the canonical skill name regex from the OpenCode baseline:'
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata i'
- '### 3.1 Canonical discovery roots'
- 'Discovery MUST walk roots in this canonical order (first match wins for a given Skill ID):'
- 'Rule: When two discovered skills share the same Skill ID, the first discovered skill is the canonical one and later duplicates are treated as **shadowed**.'
- The MVP runtime surface for skills is canonical and provider-agnostic.
- '`default_skill_refs` are resolved against the canonical registry during prompt/context assembly. They do not imply provider-native skill file installation at runtime.'
- This section defines the canonical contract for this surface.
- '- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gatin'
- '- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visibl'
- '- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.'
- '### 4.4 Canonical MVP delivery path'
- '- a skill package resolves to one canonical `SKILL.md`'
- '- External Swift-Agent-Skills / agent-skills patterns are design evidence for the adopted portable folder-based `SKILL.md` package shape with optional resources. PM may import/discover them through canonical roots, but the runtime remains the PM registry/discovery/runtime contract.'
- '- A portable folder-based skill package may include bounded package-resource directories such as `resources/`, `scripts/`, and `templates/`; these entries are FileSafe-limited package resources and never replace the single canonical `SKILL.md` manifest/instruction entrypoint, create extra manifests,'
- MVP does not require a per-provider native runtime skill-loading matrix. If provider-native loading is added later, it is an optimization or interoperability layer above the canonical registry + bundling + tool path.
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or '
owner_hints:
- Plans/Skills_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `e951f33e7a0c1c8e3d4e6696fac5c14b56591e057e042762614945c15ceb34df`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Skills_System-S0001` through `Skills_System-S0030` are preserved in place and mapped in `coverage_map.jsonl` to `SS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
