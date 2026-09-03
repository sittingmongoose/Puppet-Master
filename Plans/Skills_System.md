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
`default_skill_refs` are resolved against the canonical registry during prompt/context assembly. They nominate eligible candidates; they do not select every candidate for the current request, inject every full `SKILL.md`, or imply provider-native skill file installation at runtime.

### 4.2A Progressive Skill capability stages

Skills consume the canonical `CapabilityStageRecord` and `CapabilityCatalogMaterialization` from `Plans/Tools.md`. For a Skill the stages mean:

1. `installed` — the package/manifest is present in a canonical discovery root with provenance and content hash.
2. `project_enabled` — the resolved first-wins Skill entry is enabled for the active Project/profile; invalid or shadowed entries cannot advance.
3. `policy_available` — readiness, required-tool refs, route/runtime compatibility, Permissions, FileSafe, trust, and resource policy permit consideration.
4. `selected_for_request` — the current request explicitly names the Skill or deterministic task matching selects it from eligible candidates.
5. `invoked` — `invoke_skill` passes validation and receives a concrete attempt identity.

A later stage cannot be true while an earlier stage is false. Discovery, installation, Persona defaulting, user enablement, policy availability, request selection, and invocation remain independently inspectable. A Skill being present in Agent Config or a Persona's `default_skill_refs` is not evidence that its instructions entered a model request.

Skill catalog materialization is bounded: L0 may include a deterministic slice of `skill_id`, name, and bounded description; L1 adds selected provenance/readiness/dependency metadata; L2 adds the selected `SKILL.md` instructions needed for the request; L3 adds selected resources/examples only on demand. Full instructions and package resources never enter context merely because the Skill is installed, enabled, or policy-available. Essential `skill`/catalog-search discovery remains a bounded bootstrap capability so an omitted Skill can still be found without injecting the full catalog.

Selected Skill entries and instruction bodies are ordered by canonical `skill_id`, then manifest/content hash, using ascending UTF-8 byte order. Filesystem enumeration, root scan completion, locale, GUI sort, and provider projection order cannot change prompt schema/instruction order. The Skill slice contributes its ordered hash to the shared materialization receipt and Prompt Pipeline context/cache epoch.

Each request records materialized Skills and bounded omissions through `CapabilityMaterializationReceipt`. Skill omission reasons use the shared codes plus Skill-specific evidence for `invalid`, `shadowed`, `warning_blocked`, or `missing_required_tool`; overflow retains per-reason counts and a continuation/artifact ref. Omitted or deferred Skills MUST NOT be serialized as successful instructions, and absence from the bounded prompt slice MUST NOT be misreported as absence from the installed catalog.

Skill manifests, catalog projections, receipts, instructions, and resources never contain resolved raw credentials; a Skill can reference a canonical secret requirement but receives any authorized value only at the invoked tool boundary. Skills do not introduce SQLite or a second capability/policy store. Browser-oriented Skill actions remain policy-selected PM-native Browser Program tools and cannot establish a PM-owned external browser-test runtime, compatibility facade, MCP route, or capture engine.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/MCP_Integration.md

### 4.3 skill tool

This section defines the canonical contract for this surface.

Runtime contract addendum:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- The shared `invoke_skill` payload carries `skill_id`, `input`, optional `context`, and optional `timeout`; when context is supplied it includes `project_root`, optional `active_file`, optional `selection`, and `conversation_id` so invocation is tied to the active thread and workspace scope.
- `timeout` is measured in milliseconds. When omitted, `invoke_skill` uses `timeout_ms = 120000`; callers may lower it, and may raise it only up to `max_timeout_ms = 600000` when the active runtime policy permits. Timeout expiry emits `skill.invocation_timed_out`, cancels any outstanding skill-owned work, and returns a non-success result without retrying automatically.
- If a skill is valid but blocked by missing permissions, invocation pauses before tool dispatch and emits a permission blocked payload with `blocked_reason_code = permission_required`, `approval_scope_key`, `permission_snapshot_id?`, ordered `allowed_action_ids[]`, and the required tool/capability refs. `Review permissions` routes to the canonical Permissions approval/settings surface; Skills never owns a parallel consent dialog.
- Skill defines its own `input` schema via manifest, and PM validates that schema before invocation.
- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.
- Assistant awareness (`assistant-awareness`) does not make every discovered skill assistant-auto-usable. Auto-invoking is limited to skills that are `runtime-ready`, eligible in the active project/session, permission-allowed, and flagged `auto_invokable`; `runtime-ready-with-warnings`, `ready_with_warnings`, imported-with-warnings, invalid, disabled, shadowed, and `warning-blocked` skills require explicit user or agent selection.
- The `skill` tool-description is dynamic and bounded: when PM presents the tool to a model, it exposes a deterministic budgeted slice of currently runtime-ready Skill names/descriptions plus total/omitted counts and catalog-search guidance. It never injects the complete roster when that would exceed the catalog budget, and it updates after registry changes such as import, enable, disable, or revalidate.
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
- `Needs setup` + `Context7 is not configured for this provider` + action `cmd.skills.setup_dependency` with `dependency_id = context7`
- `Needs permission` + `This skill needs access to Context7 Docs` + action `cmd.permissions.review_request` with the current `approval_scope_key`
- `Has problems` + `The skill file has invalid frontmatter` + action `cmd.skills.open_source_for_edit` with `skill_id`
- `Warning` + `Optional tool Web Search is unavailable` + action `cmd.skills.review_tool_requirement` with `tool_ref`

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
- archive import rejects zip-slip/path traversal, absolute paths, symlink or hardlink escape, duplicate canonical paths after case normalization, nested archive recursion beyond depth 2, package bytes above `max_skill_package_bytes = 52428800`, and expanded bytes above `max_skill_expanded_bytes = 209715200`
- name collisions resolve by stable `skill_id`: same id and same content hash is idempotent, same id with different content requires Replace, Keep Both with generated suffix, or Cancel, and a case-only collision is rejected on all platforms
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

### SS-002 - Skills SSOT Authority And DRY References

```yaml
plan_unit_id: SS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skills_System.md is the single canonical SSOT for Puppet Master Skills, preserving compliance, deterministic defaults, anchor-reference rule, and adjacent SSOT references without redefining owner documents.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-002 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_ssot_authority_dry_references
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0003
preserved_exact_tokens:
- Skills System (Canonical SSOT)
- Puppet Master
- single canonical SSOT
- SKILL.md
- default_skill_refs
- skill tool
- GUI ownership/requirements
- Plans/Skills_System.md#DISCOVERY
- Plans/Spec_Lock.json
- Plans/Contracts_V0.md
- Plans/DRY_Rules.md
- Plans/Glossary.md
- Plans/Decision_Policy.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Contracts_V0.md
- Plans/DRY_Rules.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/FinalGUISpec.md
```

### SS-003 - Skill Definition And Skill ID Schema

```yaml
plan_unit_id: SS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: A Skill is a user-authored SKILL.md context module, and Skill ID is the stable YAML frontmatter name field matching the OpenCode baseline regex and 1-64 character length.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
unblocks: []
acceptance_criteria:
- SS-003 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_definition_id_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0006
preserved_exact_tokens:
- Skill
- Skill ID
- SKILL.md
- YAML frontmatter
- name
- ^[a-z0-9]+(-[a-z0-9]+)*$
- 1–64 characters
- OpenCode baseline
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/OpenCode_Deep_Extraction.md
```

### SS-004 - SKILL.md Layout And Frontmatter Contract

```yaml
plan_unit_id: SS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Each skill uses one required <skill_root>/<skill_id>/SKILL.md with YAML frontmatter requiring name and description, allowing optional metadata, and keeping required_tool_refs and optional_tool_refs in the skill frontmatter as the single source for tool dependency metadata.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-004 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_md_layout_frontmatter_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0009
preserved_exact_tokens:
- SKILL.md
- <skill_root>/<skill_id>/SKILL.md
- name
- description
- license
- compatibility
- metadata
- tags
- required_tool_refs
- optional_tool_refs
- default_skill_refs
- /export/interoperability
negative_constraints:
- PM MUST NOT move required tool metadata into a PM-only /overlay or sidecar-only MCP schema.
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata into a PM-only `/overlay` or sidecar-only MCP schema that would create a second source of truth outside the skill''s `name` and `description`.'
preserved_contractrefs: []
compatibility_only_notes:
- Additional frontmatter fields MAY be present (e.g., `license`, `compatibility`, `metadata`, `tags`) but are not required for core discovery and loading.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-005 - SKILL.md Body Preservation

```yaml
plan_unit_id: SS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The SKILL.md Markdown body is skill content preserved verbatim by the loader with no templating in v1.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-005 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_md_body_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0010
preserved_exact_tokens:
- Markdown body
- Skill content
- verbatim
- no templating in v1
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-006 - Discovery Roots And Project Global Resolution

```yaml
plan_unit_id: SS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill discovery uses deterministic project-local and global roots and resolves project-local roots relative to the active project root or git worktree root.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-006 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: discovery_roots_project_global_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0012
preserved_exact_tokens:
- .puppet-master/skills/**/SKILL.md
- .claude/skills/**/SKILL.md
- .agents/skills/**/SKILL.md
- ~/.config/puppet-master/skills/**/SKILL.md
- ~/.claude/skills/**/SKILL.md
- ~/.agents/skills/**/SKILL.md
- active project root
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
- Plans/storage-plan.md
```

### SS-007 - Search Order And First Wins Shadowing

```yaml
plan_unit_id: SS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Discovery walks roots in canonical order and resolves duplicate Skill IDs by first match wins, treating later duplicates as shadowed.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-007 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: search_order_first_wins_shadowing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0013
preserved_exact_tokens:
- SEARCH-ORDER
- first match wins
- Project .puppet-master/skills
- Project .claude/skills
- Project .agents/skills
- Global ~/.config/puppet-master/skills
- shadowed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
```

### SS-008 - Shadowed And Invalid Skill GUI Visibility

```yaml
plan_unit_id: SS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The GUI exposes shadowed duplicates and invalid skills with validation errors even though invalid skills are not loadable by ID.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-008 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: shadowed_invalid_skill_gui_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0014
preserved_exact_tokens:
- shadowed duplicates
- GUI
- warning indicator
- invalid
- validation errors
- loadable by ID
negative_constraints:
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-009 - Discovery Validation Loader Rules

```yaml
plan_unit_id: SS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: During discovery the loader parses YAML frontmatter, validates name and description, enforces directory-name equals Skill ID, marks invalid skills, and prevents invalid lookup by ID.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-009 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: discovery_validation_loader_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0014
preserved_exact_tokens:
- Parse YAML frontmatter
- invalid
- name
- description
- directory-name match
- enclosing folder name
- Skill ID
negative_constraints:
- Invalid skills MUST NOT be loadable by ID.
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
- Plans/Tools.md
```

### SS-010 - Runtime Registry And Persona Skill Refs

```yaml
plan_unit_id: SS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill registry is the provider-agnostic discovery and validation source, and Persona default_skill_refs resolve against it during prompt/context assembly without implying provider-native runtime installation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-010 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: runtime_registry_persona_skill_refs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0017
preserved_exact_tokens:
- MVP runtime surface
- provider-agnostic
- skill registry
- default_skill_refs
- context assembly
- provider-native skill file installation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Personas.md
```

### SS-011 - Skill Invocation Payload Contract

```yaml
plan_unit_id: SS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The canonical skill invocation payload uses skill_id with input, optional context, optional timeout, active project/thread context, and manifest-defined input schema validation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SS-011 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_invocation_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- skill_id
- invoke_skill
- input
- context
- timeout
- project_root
- active_file
- selection
- conversation_id
- input schema
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SS-012 - Skill Result Envelope And Resource Safety

```yaml
plan_unit_id: SS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill result is a structured skill-content envelope with source_type, resource_base_dir?, resource_entries_sample?, metadata?, compatibility display aliases, and FileSafe-constrained relative resource guidance.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-012 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_result_envelope_resource_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- skill-content
- title
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- name
- built-in
- /built-in
- bundled
- resource-root
- FileSafe-permitted skill resources
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-013 - Runtime Readiness And Auto-Invoke Gating

```yaml
plan_unit_id: SS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Assistant auto-invocation is limited to runtime-ready, eligible, permission-allowed, auto_invokable skills; warning, invalid, disabled, shadowed, and blocked entries require explicit selection while the tool description exposes the live runtime-ready roster.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-013 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: runtime_readiness_auto_invoke_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- assistant-awareness
- runtime-ready
- auto_invokable
- runtime-ready-with-warnings
- ready_with_warnings
- imported-with-warnings
- invalid
- disabled
- shadowed
- warning-blocked
- dynamic tool-description
- ready
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-014 - Skill Triggered Execution Boundaries

```yaml
plan_unit_id: SS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill tool does not create hidden nested-task work or own shell/PTX execution; skill-triggered tool work remains under tool permission, Terminal, audit, route-target, project/worktree context, and blocked/recovery contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-014 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_triggered_execution_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- nested-task
- shell
- PTY
- /expandable
- allowed_actions[]
- allowed_action_ids[]
- route-target
- active-worktree
- /artifact/search/attention
- /revert
negative_constraints:
- Skill-triggered runtime actions must not assume a single active-worktree.
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SS-015 - User Invocation Surfaces And MVP Grammar

```yaml
plan_unit_id: SS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill discovery and invocation converge through GUI panel, /skill, and natural language on the same invoke_skill runtime contract without an MVP subcommand family.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-015 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: user_invocation_surfaces_mvp_grammar
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- GUI panel
- /skill
- Natural language
- /natural-language
- Skills panel
- No subcommand family for MVP
- invoke_skill
- /skill <skill_name> [args]
- /skill with no args lists available skills
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SS-016 - Canonical MVP Delivery Package Path

```yaml
plan_unit_id: SS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: MVP skill delivery uses one canonical SKILL.md per skill package; optional resources remain FileSafe-limited package resources and external examples are design evidence only rather than runtime owners.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-016 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: canonical_mvp_delivery_package_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0019
preserved_exact_tokens:
- one canonical SKILL.md
- skill package
- External Swift-Agent-Skills
- agent-skills
- resources/
- scripts/
- templates/
- FileSafe-limited package resources
- websearch
- webfetch
- /webfetch
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-017 - Provider Native Loading Non Goal

```yaml
plan_unit_id: SS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: MVP does not require a per-provider native runtime skill-loading matrix; PM uses registry, bundling, and the skill tool at runtime, with provider-native loading only as optimization or interoperability above the canonical path.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-017 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: provider_native_loading_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
preserved_exact_tokens:
- per-provider native runtime skill-loading matrix
- PM registry/bundling/skill tool path
- provider-native
- /directories
- /provider-native
- /discover
- /bundling/
- /project
negative_constraints:
- Provider-native files/directories and /directories cannot become the canonical runtime contract.
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-018 - Projection Export Compatibility Policy

```yaml
plan_unit_id: SS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Projection/export policy defaults to import/discover yes and export/project no, records explicit targets, accepts compatibility roots through the canonical registry, and uses copy by default with symlink only as validated explicit behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-018 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: projection_export_compatibility_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
preserved_exact_tokens:
- import/discover yes
- export/project no
- .claude/skills
- .agents/skills
- claude/skills/*/SKILL.md
- agents/skills/*/SKILL.md
- not_projected
- projected_in_sync
- projection_failed
- drifted
- copy
- symlink
- Windows/macOS/Linux
negative_constraints:
- PM must never hand-roll slash assumptions for interoperability paths.
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SS-019 - Projection Provenance GUI Visibility

```yaml
plan_unit_id: SS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The GUI surfaces projection results, drift, override behavior, provider/runtime blockers, source/provenance labels, source links, exported status, and source/location distinctions for skills.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-019 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: projection_provenance_gui_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- projection state
- drift
- blockers
- PM bundled
- Imported
- Catalog
- source/provenance
- /exported
- Bundled with PM
- Imported from disk
- Installed from catalog
- Installed from GitHub
- source_url
- location_path
negative_constraints:
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-020 - Skill Permission Key And Skill ID Grants

```yaml
plan_unit_id: SS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill permission key governs skill loading and supports granular permission rules over canonical Skill IDs.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-020 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_permission_key_skill_id_grants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0022
preserved_exact_tokens:
- Permissions integration
- skill
- Plans/Permissions_System.md#5-tool-permission-keys
- Skill IDs
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
```

### SS-021 - External Directory FileSafe Guard

```yaml
plan_unit_id: SS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill permission grants operate over canonical Skill IDs rather than raw filesystem paths, and skill resource disclosure or file operations remain FileSafe and external-directory guarded.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-021 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: external_directory_filesafe_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0023
preserved_exact_tokens:
- canonical skill IDs
- raw filesystem paths
- FileSafe allowlist
- external-directory policy
- blocked-action recovery
- Underlying file operations
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
```

### SS-022 - Child Run Inheritance And Allowed Roots

```yaml
plan_unit_id: SS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Child runs receive only the effective compatible subset of parent-allowed skills, cannot exceed the parent ceiling, and discovered global roots are canonicalized allowed roots while symlink escapes are rejected.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
- PLUG-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-022 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: child_run_inheritance_allowed_roots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0024
preserved_exact_tokens:
- child-run inheritance
- parent-allowed skill universe
- parent ceiling
- Plugins_System.md
- Models_System.md
- global roots
- canonicalizes
- symlinked roots
negative_constraints:
- A child must not gain skill-powered capability that exceeds the parent ceiling.
- a child must not gain skill-powered capability that exceeds the parent ceiling.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Plugins_System.md
- Plans/storage-plan.md
```

### SS-023 - Agent Config Skills Ownership

```yaml
plan_unit_id: SS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Agent Config > Skills owns skill management while Settings keeps system-level dependencies; legacy Settings > Skills redirects/focuses to Agent Config and dependencies deep-link back to Settings where appropriate.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-023 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: agent_config_skills_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- Agent Config > Skills
- Settings > Skills
- Settings
- Authentication
- Models/Permissions
- permission profiles
- rules/commands
- runtime controls
- health
- Agent Config > Personas
- management-surface
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
- Plans/Personas.md
```

### SS-024 - Skills Catalog Filters Badges Actions

```yaml
plan_unit_id: SS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The Skills tab is the loaded-skills catalog with search/filter, source/readiness filters, preview/body inspection, validation/warning details, source/readiness badges, store-vs-management split, and import/manage actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-024 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_catalog_filters_badges_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- loaded-skills catalog
- /search/filter
- source-readiness
- /global/bundled/catalog
- preview/body inspection
- referenced_by_persona
- auto_invokable
- assistant-auto-usable
- requires_missing_capability
- catalog_update_available
- imported-with-warnings
- warning-blocked
- Skill Store
- /install-only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-025 - GUI Provenance And Remediation States

```yaml
plan_unit_id: SS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill rows/cards distinguish source from location, preserve origin labels and URLs, and show plain-language primary states with remediation text and matched action buttons.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-025 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: gui_provenance_remediation_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- /source
- /location
- Bundled with PM
- Imported from disk
- Installed from catalog
- Installed from GitHub
- GitHub URL
- Ready
- Needs setup
- Needs permission
- Has problems
- Warning
- Set up Context7
- Review permissions
- Edit skill
- Review tool setup
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-026 - Validation Readiness GUI Taxonomy

```yaml
plan_unit_id: SS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: GUI readiness distinguishes schema invalid, unknown tool ref, and known-but-unavailable tool refs, mapping them to Invalid, Missing Requirement, or Permission Blocked style outcomes without hiding exact reasons.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-026 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: validation_readiness_gui_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- schema invalid
- unknown tool ref
- known tool ref but unavailable
- Missing Requirement
- Permission Blocked
- invalid
- valid but not currently runnable
- required_tool_refs
- optional_tool_refs
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-027 - Skill Readiness Record Schemas

```yaml
plan_unit_id: SS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Canonical readiness records split skill_record from skill_runtime_readiness and resolve required_tool_refs and optional_tool_refs against the canonical PM tool registry.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-027 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_readiness_record_schemas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- skill_record
- skill_runtime_readiness
- source_kind = pm_bundled | imported_disk | catalog | github
- source_url?
- location_path
- validation_state = valid | invalid
- projection_state = not_projected | projected | projection_failed | drifted
- readiness_state = ready | needs_setup | needs_permission | has_problems | warning
- reason_codes[]
- missing_required_tool_refs[]
- missing_optional_tool_refs[]
- last_evaluated_at
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SS-028 - Import Install GUI And Package Flows

```yaml
plan_unit_id: SS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Import and install flows preserve one SKILL.md per skill while supporting file-browser import, drag-and-drop folders/files, single SKILL.md, zip/tar packages, generated enclosing folders, catalog/store install, validation, and auto-populated catalog metadata.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-028 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: import_install_gui_package_flows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
preserved_exact_tokens:
- file-browser import
- drag-and-drop skill folders/files
- single SKILL.md
- zip/tar
- /tar
- .zip
- .tar.gz
- generated enclosing folder
- /catalog/install
- auto-populating catalog entry
- name
- description
- source/provenance
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
```

### SS-029 - Import Runtime Warning And NL Routing Rules

```yaml
plan_unit_id: SS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Imported packages default to portable, warning states remain discoverable but not auto-invoked, imported resources stay FileSafe-constrained, and natural-language skill examples route through registry-backed invoke_skill.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-029 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: import_runtime_warning_nl_routing_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
preserved_exact_tokens:
- portable
- imported-with-warnings
- ready_with_warnings
- runtime-ready-with-warnings
- unsupported
- auto-invoked
- use the doc-lookup skill
- load the swiftui-pro skill
- what skills do I have available?
- invoke_skill
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/assistant-chat-design.md
```

### SS-030 - Slash And Runtime Invocation Boundary

```yaml
plan_unit_id: SS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The /skill affordance, Skills panel, and natural language invocation land on the shared invoke_skill runtime contract, with bare /skill listing available skills and no /skills command family for MVP.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-030 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: slash_runtime_invocation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- /skill
- Skills panel
- Natural language
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- /natural-language
- skill_id
- arguments?
- context?
- No subcommand family for MVP
- /skills
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Commands_System.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
```

### SS-031 - OpenCode Baseline Reference Only Constraints

```yaml
plan_unit_id: SS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: OpenCode skill tests and baseline notes are reference inputs only; Puppet Master rejects .opencode/skills roots, uses first-wins discovery with shadowing visibility, and keeps remote URL discovery out of v1 in favor of Catalog distribution.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-031 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: opencode_baseline_reference_only_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0029
preserved_exact_tokens:
- OpenCode product tests
- packages/opencode/test/tool/skill.test.ts
- /opencode/test/tool/skill.test.ts
- OpenCode_Deep_Extraction.md §7F
- .opencode/skills
- first-wins
- Remote skill discovery (URLs)
- Catalog system
- §7.4.3
negative_constraints:
- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system rather than ad-hoc URL pulls.
- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system (§7.4.3 in `Plans/FinalGUISpec.md`) rather than ad-hoc URL pulls.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2'
compatibility_only_notes:
- OpenCode tests and external skill examples are implementation/design references only.
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
```

### SS-032 - Skills Discovery Order Acceptance

```yaml
plan_unit_id: SS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK01 requires Skills to be discovered from the canonical roots and in the canonical order defined in Skills_System §3.2.
gui_related: false
gui_classification_reason: This unit preserves backend discovery ordering and registry behavior rather than visual presentation.
split_recommended: false
depends_on:
- SS-006
- SS-007
- SS-008
unblocks: []
acceptance_criteria:
- AC-SK01 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- Skills MUST be discovered from the canonical roots and in the canonical order defined in §3.2.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_discovery_order_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- 8. Acceptance criteria
- AC-SK01
- Skills MUST be discovered
- canonical roots
- canonical order
- §3.2
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
```

### SS-033 - Duplicate Skill Shadowing GUI Acceptance

```yaml
plan_unit_id: SS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK02 requires duplicate Skill IDs to resolve first-wins while shadowed duplicates remain visible in the GUI.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI visibility for duplicate or shadowed skills.
split_recommended: false
depends_on:
- SS-008
- SS-023
- SS-024
unblocks: []
acceptance_criteria:
- AC-SK02 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- Duplicate Skill IDs MUST be resolved first-wins, and shadowed duplicates MUST be visible in the GUI.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: duplicate_skill_shadowing_gui_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- AC-SK02
- Duplicate Skill IDs
- first-wins
- shadowed duplicates
- visible in the GUI
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- Shadowed duplicate GUI visibility is owned here as Skills behavior and consumed by FinalGUISpec surfaces through the ContractRef.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-034 - Skill Tool Allowed Roots Acceptance

```yaml
plan_unit_id: SS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK03 requires the skill tool to enforce that explicit file paths are under allowed discovery roots.
gui_related: false
gui_classification_reason: This unit preserves backend tool and permission enforcement rather than visual presentation.
split_recommended: false
depends_on:
- SS-020
- SS-021
- SS-022
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- AC-SK03 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- The `skill` tool MUST enforce that explicit file paths are under allowed discovery roots.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_tool_allowed_roots_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- AC-SK03
- skill tool
- "`skill` tool"
- explicit file paths
- allowed discovery roots
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-001 - Skills System Retired Source-Preserving Bridge

```yaml
plan_unit_id: SS-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Skills_System.md
canonical_text: SS-001 is retired after Phase 2B batch 172. Skills_System-S0001 through S0030 are covered by fine-grained SS-002 through SS-034 or explicit split coverage; Skills_System-S0031, S0032, and S0034 are generated structural migration metadata; and Skills_System-S0033 is retained only as retired bridge lineage. SS-001 must not provide product implementation coverage or override SS-002 through SS-034.
gui_related: false
gui_classification_reason: This retired compatibility disposition records generated migration-lineage metadata rather than active GUI behavior.
split_recommended: false
depends_on:
- SS-002
- SS-003
- SS-004
- SS-005
- SS-006
- SS-007
- SS-008
- SS-009
- SS-010
- SS-011
- SS-012
- SS-013
- SS-014
- SS-015
- SS-016
- SS-017
- SS-018
- SS-019
- SS-020
- SS-021
- SS-022
- SS-023
- SS-024
- SS-025
- SS-026
- SS-027
- SS-028
- SS-029
- SS-030
- SS-031
- SS-032
- SS-033
- SS-034
unblocks: []
acceptance_criteria:
- Skills_System-S0001 through S0030 remain mapped to fine-grained Skills System PlanUnits rather than SS-001.
- Skills_System-S0031, S0032, and S0034 remain structurally dispositioned generated migration metadata.
- Skills_System-S0033 remains retired bridge lineage only and does not provide product implementation coverage.
- SS-001 no longer uses source_preserving_planunit as a node_compile_hint mode.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_bridge_overreach
reasoning_tier: standard
context_scope: skills_generated_tail_disposition
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: retired_migration_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0034
preserved_exact_tokens:
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- source_preserving_planunit
negative_constraints:
- SS-001 must not provide product implementation coverage for Skills_System-S0001 through S0030 after Phase 2B batch 172.
- SS-001 must not override SS-002 through SS-034 or structural dispositions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes:
- The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint mode.
stale_retired_dispositions:
- SS-001 retired the original source-preserving bridge after fine-grained and structural coverage was established.
owner_hints:
- Plans/Skills_System.md
- Plans/Plan_Document_System.md
- Plans/Bootstrap_Planning_Migration.md
```

## Migration Coverage

Original hash: `e951f33e7a0c1c8e3d4e6696fac5c14b56591e057e042762614945c15ceb34df`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 171 atomized `Skills_System-S0001` through `Skills_System-S0029` into fine-grained PlanUnits `SS-002` through `SS-031`. Phase 2B batch 172 atomized `Skills_System-S0030` into `SS-032` through `SS-034`, structurally dispositioned generated metadata spans `Skills_System-S0031`, `Skills_System-S0032`, and `Skills_System-S0034`, and retired generated bridge span `Skills_System-S0033` through `SS-001`. No residual source-preserving product bridge remains for `Plans/Skills_System.md`. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## FABLE Residual Skills Invocation Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE Skills rows for invocation-time permission consent, timeout defaults, remediation command refs, and requested import package safety. Import hardening is included as a user-requested scope item, but the Critical/High closure set remains limited to the rows named in the FABLE registry.

### SS-035 - FABLE Residual Skills Invocation And Import Contract

```yaml
plan_unit_id: SS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  Skill invocation uses a millisecond timeout with default 120000 and max 600000, reports timeout as
  skill.invocation_timed_out, and routes missing-permission invocation through the canonical Permissions ask
  flow using blocked_reason_code, approval_scope_key, permission_snapshot_id, and ordered allowed_action_ids.
  Remediation buttons resolve to stable command refs rather than prose-only labels. Manual archive import rejects
  path traversal, symlink escape, package-size overflow, expanded-size overflow, archive recursion overflow, and
  deterministic skill id/name collisions.
gui_related: true
gui_classification_reason: Skill cards, remediation actions, permission prompts, and import errors are visible management and invocation surfaces.
depends_on: [SS-011, SS-025, SS-027, SS-028, PS-041, PS-042]
unblocks: []
acceptance_criteria:
  - "`invoke_skill.timeout` is milliseconds, defaults to 120000, caps at 600000, and expires with cancellation plus `skill.invocation_timed_out`."
  - Missing permissions produce a blocked payload with `blocked_reason_code = permission_required`, `approval_scope_key`, optional `permission_snapshot_id`, and ordered `allowed_action_ids[]`.
  - "`Review permissions` routes to `cmd.permissions.review_request`; Skills does not define a local consent dialog."
  - Remediation commands are `cmd.skills.setup_dependency`, `cmd.permissions.review_request`, `cmd.skills.open_source_for_edit`, and `cmd.skills.review_tool_requirement`.
  - Archive import rejects zip-slip, absolute paths, symlink/hardlink escape, case-normalized duplicate paths, nested archive recursion above 2, package bytes above 52428800, and expanded bytes above 209715200.
  - Skill id/name collisions resolve as idempotent same-hash import, explicit Replace, explicit Keep Both with generated suffix, or Cancel; case-only collisions are rejected.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_skills_invocation_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_skills_invocation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1047
  - fablereport.md:1048
  - fablereport.md:1049
  - fablereport.md:1050
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "invoke_skill"
  - "timeout"
  - "Needs permission"
  - "Review permissions"
  - "Set up Context7"
  - "Edit skill"
  - "Review tool setup"
  - "zip/tar"
  - "zip-slip"
negative_constraints:
  - Do not treat this Skills repair as a UI wiring repair, runtime certification, implementation readiness, or buildability proof.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Skills_System.md
  - Plans/Permissions_System.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime skills rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d75fd32061dc8e608952bd68` and `sfk-83bf8b6fcb84de178c4cc3a6`: Skills_System owns backend skill discovery, validation, permissions, and catalog status. GUI placement is consumed by FinalGUISpec/MiscPlan. Backend fields are `skill_id`, `source`, `manifest_ref`, `permission_class`, `enabled`, `validation_state`, `blocked_reason_code?`, and `schema_version`.

## Remaining Runtime Integration Addendum - 2026-08-13

This addendum compiles the Skill-owned portion of progressive capability accountability row `CTX-015`. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

### SS-036 - Progressive Skill Selection And Instruction Materialization

```yaml
plan_unit_id: SS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  Skills preserve installed, project_enabled, policy_available, selected_for_request, and invoked as independent stages.
  Persona defaults nominate eligible candidates instead of eagerly injecting them; bounded L0-L3 materialization admits
  only request-selected instructions/resources in deterministic Skill-ID/hash order and emits explicit omission receipts.
gui_related: false
gui_classification_reason: Backend Skill discovery, selection, prompt admission, and receipt contract; not GUI implementation work.
depends_on: [SS-007, SS-009, SS-010, SS-013, T-176, PP-009]
unblocks: []
acceptance_criteria:
  - A Skill can be installed and enabled without being policy-available, selected, invoked, or injected, and each distinction remains inspectable.
  - Persona default_skill_refs nominate candidates; only request-selected L2 instructions enter the request.
  - The dynamic skill tool description is bounded, reports total/omitted counts, and preserves catalog-search guidance rather than injecting an unbounded roster.
  - Identical inputs produce the same selected Skill order and hash independent of root-scan completion, GUI sort, locale, or provider projection order.
  - Invalid, shadowed, warning-blocked, missing-dependency, unselected, and budget-deferred Skills remain omitted with bounded reasons and are not serialized as successful instructions.
  - Skill catalogs, instructions, resources, and receipts expose no raw secrets, introduce no SQLite, and cannot establish a PM-owned external browser-test runtime or compatibility surface.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: progressive_skill_materialization_drift
reasoning_tier: high
context_scope: skills_capability_materialization
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: progressive_skill_selection_materialization
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md#Progressive-capability-disclosure
  - ACCOUNTABILITY_MATRIX.json:CTX-012
  - ACCOUNTABILITY_MATRIX.json:CTX-015
  - reference/HERMES_V020_SOURCE_REVIEW.md#5.4-Tool-disclosure-and-schema-cost
source_atom_ids: []
preserved_exact_tokens:
  - installed
  - project_enabled
  - policy_available
  - selected_for_request
  - invoked
  - default_skill_refs
  - CapabilityMaterializationReceipt
negative_constraints:
  - Do not eagerly inject every default, installed, enabled, or policy-available Skill instruction body.
  - Do not treat a Skill's presence in Agent Config or a Persona default as evidence that it entered model context.
  - Do not expose raw secrets, introduce SQLite, or create a PM-owned external browser-test runtime/facade/MCP/command/capture dependency.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Skills_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
```

## Additive Correction v4 — Wonderer Methodology And The Grill Me Question Frontier (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`WONV-001..002`, `WONV-005`, and
the Skill side of `QMAX-003`, `QMAX-006`, `PART-013`) to this owner.

### WONV-001..002, WONV-005 — Wonderer methodology and its convergence gate

The Wonderer methodology Skill produces tethered adjacent leads with an explicit connection back
to the seed. It is a Skill applied through the built-in Wonderer Persona; it is not Hermes
profile infrastructure and imports no profile runtime.

A Wonderer lead reaches an Assistant Plan only after one of three things happens: it is
researched to a convergent evidence path, the user decides it, or it is explicitly retained as an
unresolved hypothesis. An accepted factual or architectural claim cites its evidence path.
Fertility is never promoted to truth, and an interesting lead is not a finding.

### QMAX-003, QMAX-006 — Grill Me extends one shared allowance

Grill Me is a reusable methodology Skill applied through a dedicated participant role that widens
the question frontier. It adds exactly **25** questions to the owning workflow's allowance —
retiring the former `+10` — and the allowance is one counter shared by every participant in the
run, never a per-agent quota.

The strategy bases those 25 extend are owned by `Plans/Assistant_Plan_Runtime.md`
(`QMAX-001..004`): Plan Quick 3, Standard 6, Thorough 8; Deep Plan Thorough 10, Exhaustive 15,
BrainStorm 20 — giving 28, 31, 33, 35, 40, and 45 with Grill Me enabled. PRD Builder and Planning
Wizard apply the same `+25` to their own owner-defined scopes without importing an Assistant
strategy base.

Grill Me routes an answerable factual question to research rather than to the user, and a
question already answered in the thread or in imported planning context is deduplicated before
admission rather than re-asked.

### PART-013 — Question pressure is not voting weight

Grill Me contributes questions and decision pressure. It has no automatic final vote unless it is
explicitly configured as an additional ordinary voting role, and the number of questions it
raised never implies voting weight. It has no implementation authority.
