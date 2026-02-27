# OpenCode Coverage Matrix (Audit)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

---

## 1. Scope and Method

This document audits every OpenCode-derived capability extracted in `Plans/OpenCode_Deep_Extraction.md` (§7A–§7H, §8, §9, §10) and verifies its coverage within the Puppet Master SSOT plan corpus.

**Coverage definitions:**

| Status | Meaning |
|--------|---------|
| **Covered** | An explicit SSOT owner doc exists with stable anchors; dependent plans reference it by anchor (not by restating definitions). |
| **Partial** | A target doc exists but is missing stable anchors, missing GUI wiring, or the capability is only described in `OpenCode_Deep_Extraction.md` without a dedicated SSOT section. |
| **Missing** | No SSOT doc and no clear contract for this capability. The extraction doc records the baseline but nothing in `Plans/` owns it. |

**Inspection corpus:** All files listed in `Plans/00-plans-index.md` plus subsystem SSOT docs (`Run_Modes.md`, `Personas.md`, `Permissions_System.md`, `Commands_System.md`, `Skills_System.md`, `Prompt_Pipeline.md`, `Formatters_System.md`, `Plugins_System.md`, `Models_System.md`) and `OpenCode_Deep_Extraction.md` itself.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

## 2. Coverage Matrix

| # | OpenCode Topic Area | Extraction Pointer(s) | Puppet Master SSOT Owner (Doc + Anchor) | Dependent Plans Referencing SSOT | Coverage Status | Notes |
|---|---|---|---|---|---|---|
| 1 | **Run modes + enforcement** (plan/ask/regular/yolo, strategy selection, budgets, kill conditions) | §7A.1–§7A.3 | `Plans/Run_Modes.md` #MODE-ask, #MODE-plan, #MODE-regular, #MODE-yolo, #STRATEGY-HTE, #STRATEGY-DAE, #KILL-CONDITIONS, #OUTCOME-TAXONOMY | Tools.md, FileSafe.md, CLI_Bridged_Providers.md, Permissions_System.md, Personas.md, assistant-chat-design.md, human-in-the-loop.md | **Covered** | Full four-mode taxonomy with deterministic selection algorithm, budget table, and kill conditions. |
| 2 | **Permissions — allow/ask/deny actions** | §7C.1, §7C.5 | `Plans/Permissions_System.md` #PERM-ACTIONS, #ASK-FLOW | Tools.md §2, Run_Modes.md, Personas.md, Commands_System.md, Plugins_System.md | **Covered** | Three actions with once/always/reject semantics. |
| 3 | **Permissions — granular/wildcard rules** | §7C.2, §7C.3 | `Plans/Permissions_System.md` #GRANULAR-RULES, #WILDCARD-SYNTAX | Tools.md §2.2 | **Covered** | Last-match-wins, `*`/`?` wildcards, home expansion. |
| 4 | **Permissions — doom_loop guard** | §7C.4 | `Plans/Permissions_System.md` #GUARD-DOOM-LOOP | — | **Covered** | Configurable threshold, default 3. |
| 5 | **Permissions — external_directory guard** | §7C.4 | `Plans/Permissions_System.md` #GUARD-EXTERNAL-DIR, #HOME-EXPANSION | — | **Covered** | Allowlist support. |
| 6 | **Permissions — .env deny defaults** | §7C.6 | `Plans/Permissions_System.md` #DEFAULT-ENV-DENY | — | **Covered** | `.env` deny, `.env.example` allow. |
| 7 | **Permissions — multi-layer precedence** | §7C.1 (flat in OC) | `Plans/Permissions_System.md` #PRECEDENCE-LAYERS | Run_Modes.md, Personas.md, Tools.md | **Covered** | PM delta: six layers instead of OC flat overlay. |
| 8 | **Commands — discovery paths** | §7D.1 | `Plans/Commands_System.md` #STORAGE-LAYOUT | FinalGUISpec.md §7.4.11, assistant-chat-design.md §5 | **Covered** | `.puppet-master/commands/` + global path. |
| 9 | **Commands — template syntax ($ARGUMENTS, @path, !`cmd`)** | §7D.3 | `Plans/Commands_System.md` #TEMPLATE-PLACEHOLDERS, #TEMPLATE-FILE-INCLUDE, #TEMPLATE-SHELL-INJECTION | — | **Covered** | Permission-checked shell injection + file includes. |
| 10 | **Commands — args, file include, shell injection** | §7D.3 | `Plans/Commands_System.md` #TEMPLATE-PLACEHOLDERS, #TEMPLATE-FILE-INCLUDE, #TEMPLATE-SHELL-INJECTION | Permissions_System.md | **Covered** | — |
| 11 | **Commands — subtask + model override** | §7D.4 | `Plans/Commands_System.md` #SUBTASK, §3.2 | Tools.md, Personas.md | **Covered** | — |
| 12 | **Formatters — post-write/edit trigger, $FILE** | §7E.1, §7E.3 | `Plans/Formatters_System.md` #LIFECYCLE, #FORMATTER-CONFIG | Run_Modes.md (HTE-only) | **Covered** | HTE-only enforcement is a PM delta. |
| 13 | **Formatters — disable/override** | §7E.3 | `Plans/Formatters_System.md` #FORMATTER-CONFIG | — | **Covered** | Global disable + per-formatter disable/command override. |
| 14 | **Formatters — built-in formatter set** | §7E.2 | `Plans/Formatters_System.md` #BUILT-IN-FORMATTERS | — | **Covered** | 21 formatters with auto-detection. |
| 15 | **Skills — discovery** | §7F.1 | `Plans/Skills_System.md` #DISCOVERY, #SEARCH-ORDER | FinalGUISpec.md (Skills tab), Personas.md (`default_skill_refs`), Tools.md (`skill` tool), Permissions_System.md (`skill` key), FileSafe.md (Skill Bundling), MiscPlan.md (implementation checklist) | **Covered** | Canonical discovery roots + ordering + first-wins shadowing rules are defined in Skills_System.md. |
| 16 | **Skills — frontmatter/schema** | §7F.2 | `Plans/Skills_System.md` #SKILL-SCHEMA | FinalGUISpec.md, Personas.md, Tools.md | **Covered** | Required frontmatter fields (`name`, `description`) and validation are specified. |
| 17 | **Skills — agent surface (skill tool, as-command registration)** | §7F.3 | `Plans/Skills_System.md` #RUNTIME-SURFACE, `Plans/Tools.md` (skill tool I/O) | — | **Partial** | The `skill` tool surface is specified; skill-as-command dual-registration is not required for v1 and remains unspecified. |
| 18 | **Skills — permission gating** | §7F.4 | `Plans/Skills_System.md` #PERMISSIONS, `Plans/Permissions_System.md` #TOOL-KEYS | — | **Covered** | Skill-specific permission patterns and external_directory root handling are owned by Skills_System.md. |
| 19 | **Skills — per-Persona skill refs** | §7B.1 (agent.skills) | `Plans/Skills_System.md` #RUNTIME-SURFACE, `Plans/Personas.md` §3.2 | — | **Covered** | Persona `default_skill_refs` resolution + warning behavior is specified. |
| 20 | **Plugins — discovery + load order** | §7G.1 | `Plans/Plugins_System.md` #DISCOVERY, #LOAD-ORDER | — | **Covered** | Four-source priority, lexicographic tiebreak. |
| 21 | **Plugins — hooks (tool, permission, session, message, compaction, shell.env, system.prompt)** | §7G.3 | `Plans/Plugins_System.md` #HOOK-EVENTS, #HOOK-COMPACTION | — | **Covered** | 10 hook events with typed returns. |
| 22 | **Plugins — custom tools + collision** | §7G.4 | `Plans/Plugins_System.md` #CUSTOM-TOOLS, #TOOL-COLLISION | Tools.md | **Covered** | Namespaced aliasing default; override opt-in. |
| 23 | **Plugins — compaction hook** | §7G.3 | `Plans/Plugins_System.md` #HOOK-COMPACTION | — | **Covered** | InjectContext / ReplacePrompt with first-wins. |
| 24 | **Models — provider/model ID format** | §7H.1 | `Plans/Models_System.md` #MODEL-ID | CLI_Bridged_Providers.md, Provider_OpenCode.md | **Covered** | `provider_id/model_id`, first-`/`-split. |
| 25 | **Models — selection priority** | §7H.2 | `Plans/Models_System.md` #SELECTION-PRIORITY | Run_Modes.md, Personas.md | **Covered** | 6-level chain. |
| 26 | **Models — options + variants** | §7H.3 | `Plans/Models_System.md` #MODEL-OPTIONS, #VARIANTS | — | **Covered** | Per-provider/model options, built-in + custom variants. |
| 27 | **Models — per-Persona override** | §7H.2 (agent.model) | `Plans/Models_System.md` #PERSONA-MODEL-OVERRIDES | Personas.md | **Covered** | `default_model` + `default_variant` in PERSONA.md. |
| 28 | **Provider transform layer** | §7H.4, §10.3 | `Plans/CLI_Bridged_Providers.md` (§ provider transform), `Plans/Models_System.md` §3.4 | Provider_OpenCode.md | **Partial** | Mentioned in both docs but neither defines a complete transform-layer contract with anchors. No `#PROVIDER-TRANSFORM` anchor. |
| 29 | **Provider error classification (retryable, overflow, auth)** | §7H.5, §10.3 | `Plans/CLI_Bridged_Providers.md` (auth error), `Plans/Models_System.md` §4 | Run_Modes.md §5 kill conditions | **Partial** | Overflow detection and retryable-error retry policy are described in Models_System.md §4 but lack a canonical anchor. Auth-error classification lives in CLI_Bridged_Providers.md. No unified error-classification SSOT. |
| 30 | **Tool lifecycle and hook boundaries** | §10.1 | `Plans/Tools.md` (tool semantics), `Plans/Plugins_System.md` #HOOK-TOOL-EXECUTE | — | **Covered** | Tool execution before/after hooks defined in Plugins_System.md; tool semantics in Tools.md. |
| 31 | **Subagent management** | §7B.1–§7B.3 | `Plans/orchestrator-subagent-integration.md` §4 (registry), `Plans/Personas.md` #DEF-SUBAGENT | interview-subagent-integration.md, Tools.md §3.6 (task tool) | **Covered** | Registry-driven Persona set; task-tool validation. |
| 32 | **Context handling / compaction / rotation** | §7B.4, §7B.5 | `Plans/Prompt_Pipeline.md` #ASSEMBLY-PIPELINE, #COMPACTION, `Plans/FileSafe.md` Part B (context compilation), `Plans/Run_Modes.md` §7 (mode-specific context deltas) | — | **Partial** | Prompt assembly + pruning contracts now have a dedicated SSOT (Prompt_Pipeline.md). Detailed compaction thresholds remain owned by FileSafe.md Part B / Run_Modes.md and still need stable anchors if referenced cross-doc. |
| 33 | **LSP integration** | — (not in extraction §7) | `Plans/LSPSupport.md` (canonical) | FinalGUISpec.md §7.4.2 (Settings > LSP), FileManager.md §10.10 | **Covered** | Not part of extraction scope but has its own SSOT. |
| 34 | **MCP integration** | §7D.1 (MCP prompts → commands) | `Plans/newtools.md` (MCP config, server list), `Plans/Tools.md` §5 (MCP in registry) | FinalGUISpec.md §7.4 Advanced (MCP config card) | **Partial** | MCP tools enter the central registry and permission model, but there is no single `Plans/MCP_System.md` SSOT. Config paths, GUI, and discovery rules are split across newtools.md, Tools.md, and FinalGUISpec.md. |
| 35 | **GitHub API: Auth vs usage/tool** | — (not in extraction §7) | `Plans/GitHub_API_Auth_and_Flows.md` (auth contract), `Plans/GitHub_Integration.md` (Git panel + API usage) | FinalGUISpec.md, Architecture_Invariants.md #INV-002 | **Covered** | OAuth device-code default; no secrets in storage. Not part of OpenCode extraction scope. |
| 36 | **GUI config wiring — Permissions** | — | `Plans/Permissions_System.md` §10, `Plans/FinalGUISpec.md` §7.4.10 | — | **Covered** | Dedicated tab with all sub-sections. |
| 37 | **GUI config wiring — Commands** | — | `Plans/Commands_System.md` §6, `Plans/FinalGUISpec.md` §7.4.11 | — | **Covered** | Rules & Commands tab. |
| 38 | **GUI config wiring — Skills** | — | `Plans/Skills_System.md` #GUI-SKILLS, `Plans/FinalGUISpec.md` §7.4 "Skills" row | — | **Partial** | Skills SSOT now exists; FinalGUISpec sources the Skills row from Skills_System.md. A dedicated numbered §7.4.X Skills subsection is still optional but recommended for symmetry with other subsystem tabs. |
| 39 | **GUI config wiring — Plugins** | — | `Plans/Plugins_System.md` §9, `Plans/FinalGUISpec.md` §7.4.12 | — | **Covered** | Dedicated tab cross-referencing SSOT. |
| 40 | **GUI config wiring — Models** | — | `Plans/Models_System.md` §7, `Plans/FinalGUISpec.md` §7.4.14 | — | **Covered** | Model picker + Settings > Models tab. |
| 41 | **GUI config wiring — Formatters** | — | `Plans/Formatters_System.md` §5, `Plans/FinalGUISpec.md` §7.4.13 | — | **Covered** | Dedicated tab cross-referencing SSOT. |
| 42 | **Prompt assembly pipeline** | §7B.4 | `Plans/Prompt_Pipeline.md` #ASSEMBLY-PIPELINE | FileSafe.md Part B (context compilation details), Personas.md §5.2 (Persona injection), Plugins_System.md (#HOOK-COMPACTION) | **Covered** | Prompt assembly stage ordering and the compaction/rotation contract are owned by Prompt_Pipeline.md; other docs provide subsystem-specific details. |

---

## 3. DRY Authority Audit

### 3.1 Documents duplicating canonical definitions

| Document | Duplicated Content | Should Reference Instead |
|---|---|---|
| `Plans/Tools.md` §2 | Restates permission action definitions (allow/ask/deny) and precedence summary | Already references `Plans/Permissions_System.md` via summary — acceptable (marked as summary). No normative duplication detected; §2 explicitly defers to Permissions_System.md. |
| `Plans/OpenCode_Deep_Extraction.md` §8 | Mapping-table SSOT targets | Mapping table rows for Skills (F1–F4) now target `Plans/Skills_System.md`; Models rows (H1–H4) now target `Plans/Models_System.md` anchors (not Provider_OpenCode.md). |
| `Plans/Personas.md` §1.4, §5.4 | SSOT reference list typos / stale qualifiers | `Plugins_System.md` is now referenced correctly (plural) and `Skills_System.md` is no longer marked as missing/future. |
| `Plans/FinalGUISpec.md` §7.4 "Skills" row | Skills tab SSOT source | Skills tab now sources from `Plans/Skills_System.md` (not MiscPlan.md). |
| `Plans/Run_Modes.md` §8 | Restates extraction baseline for run modes | Acceptable: baseline section explicitly cites `Plans/OpenCode_Deep_Extraction.md` §7A. Not a DRY violation — it documents the delta context. |

### 3.2 SSOT docs missing stable anchors

| SSOT Document | Missing Anchors |
|---|---|
| `Plans/CLI_Bridged_Providers.md` | No `#PROVIDER-TRANSFORM` anchor for the transform layer contract; no `#ERROR-CLASSIFICATION` anchor for error categorization. |
| `Plans/Models_System.md` §4 | No anchor on the "Model availability and error handling" section (needs `#MODEL-ERRORS` — already present on inspection). No anchor on overflow detection or retry policy subsections. |
| `Plans/FileSafe.md` Part B | No stable anchor for "context compilation" (`#CONTEXT-COMPILATION` needed) or "compaction thresholds." |
| `Plans/Tools.md` | No `#MCP-INTEGRATION` anchor for MCP tool registration flow. |
| `Plans/FinalGUISpec.md` | No `#SKILLS-TAB` anchor (the Skills row in the settings table has no `§7.4.X` numbered section). |

---

## 4. GUI + Config Wiring Audit

### 4.1 Permissions

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4.10 — dedicated Permissions tab. |
| Config keys/state storage | ✅ | TOML files at `~/.config/puppet-master/permissions.toml` and `<project>/.puppet-master/permissions.toml`; redb projection at `config:v1.tool_permissions`. |
| No secrets in files | ✅ | Permission rules contain no secrets. |
| Doctor/preflight checks | ⚠️ | No explicit Doctor check for invalid/conflicting permission rules. Consider adding a `doctor.permissions.valid` check. |

### 4.2 Commands

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4.11 — Rules & Commands tab. |
| Config keys/state storage | ✅ | Markdown files at `.puppet-master/commands/` and `~/.config/puppet-master/commands/`. |
| No secrets in files | ✅ | Command templates contain no secrets. Shell injections execute at runtime, not stored. |
| Doctor/preflight checks | ⚠️ | No Doctor check for invalid command schemas (missing description, reserved names). Consider adding. |

### 4.3 Skills

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ⚠️ | Skills tab row exists in §7.4 table but has **no dedicated §7.4.X subsection** (unlike Permissions, Commands, Plugins, Formatters, Models which all have one). |
| Config keys/state storage | ✅ | Canonical storage and discovery roots are defined in `Plans/Skills_System.md` (project: `.puppet-master/skills/`, global: `~/.config/puppet-master/skills/`, plus legacy discovery roots for compatibility). |
| No secrets in files | ✅ | Skills are Markdown files with no secret content. |
| Doctor/preflight checks | ❌ | No Doctor check for skill validation. |

### 4.4 Plugins

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4.12 — dedicated Plugins tab. |
| Config keys/state storage | ✅ | `plugin.json` manifests at `.puppet-master/plugins/` and `~/.config/puppet-master/plugins/`; config TOML `[plugins]` section. |
| No secrets in files | ✅ | Plugin manifests contain no secrets. |
| Doctor/preflight checks | ⚠️ | No explicit Doctor check for invalid plugin manifests or failed loads. The plugin system logs `plugin.load_failed` events but there is no user-facing Doctor surface. |

### 4.5 Models

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4.14 — Models tab + Chat panel model picker. |
| Config keys/state storage | ✅ | TOML config `[provider.*]` sections; `model.json` in state directory for last-used; redb `config:v1`. |
| No secrets in files | ✅ | Model config contains no secrets. Provider API keys are in OS credential store per `Architecture_Invariants.md` #INV-002. |
| Doctor/preflight checks | ⚠️ | No explicit Doctor check for model availability or provider auth status at startup. Provider availability is checked at startup and before runs but not surfaced in Doctor. |

### 4.6 Formatters

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4.13 — dedicated Formatters tab. |
| Config keys/state storage | ✅ | TOML config `[formatter]` section at global and project levels. |
| No secrets in files | ✅ | Formatter config contains no secrets. |
| Doctor/preflight checks | ⚠️ | No explicit Doctor check for formatter binary availability. Auto-detection runs per session but results are not surfaced in Doctor. Consider a `doctor.formatters.available` check. |

---

## 5. Mandatory Fix List

These are documentation-only edits required to close coverage gaps. They are NOT implementation tasks.

### 5.1 Missing SSOT Documents

1. ✅ **`Plans/Skills_System.md` created** as the canonical SSOT for skill discovery, schema, agent surface, permission integration, and per-Persona skill refs.

2. ✅ **`Plans/Prompt_Pipeline.md` created** to own the prompt assembly pipeline and compaction/rotation contract.

### 5.2 Anchor Additions

3. **`Plans/CLI_Bridged_Providers.md`** needs anchor `#PROVIDER-TRANSFORM` on its provider transform/normalization section and anchor `#ERROR-CLASSIFICATION` on its error categorization section.

4. **`Plans/FileSafe.md`** Part B needs anchor `#CONTEXT-COMPILATION` on the context compilation section and anchor `#COMPACTION-THRESHOLDS` on any compaction threshold/pruning rules.

5. **`Plans/Tools.md`** needs anchor `#MCP-INTEGRATION` on the section describing how MCP-discovered tools enter the central registry.

6. **`Plans/FinalGUISpec.md`** needs a numbered `§7.4.X` subsection for the **Skills tab** (currently only a table row with no subsection body, unlike all other subsystem tabs which have `§7.4.10`–`§7.4.14`).

### 5.3 Cross-Reference Corrections

7. ✅ **`Plans/OpenCode_Deep_Extraction.md` §8** mapping table rows H1–H4 now target `Plans/Models_System.md` anchors for model options/variants/errors.

8. ✅ **`Plans/Personas.md`** SSOT reference list now uses `Plans/Plugins_System.md` (plural) and no longer marks `Plans/Skills_System.md` as missing/future.

9. ✅ **`Plans/FinalGUISpec.md`** Skills tab row now sources from `Plans/Skills_System.md`.

### 5.4 DRY Tightening

10. **`Plans/Models_System.md` §4.2 and §4.3** should add anchors `#OVERFLOW-DETECTION` and `#RETRY-POLICY` so that `Plans/Run_Modes.md` §5 kill conditions and `Plans/CLI_Bridged_Providers.md` can reference them by anchor.

11. **`Plans/Plugins_System.md` §7.3** references a future `disabled_plugins` field in PERSONA.md frontmatter. `Plans/Personas.md` §3.2 does not yet list this field. One of the two docs must be updated to be consistent.

### 5.5 Doctor/Preflight Gaps

12. Consider adding Doctor checks for: (a) invalid permission configs, (b) invalid command schemas, (c) skill validation errors, (d) formatter binary availability, (e) plugin manifest validation, (f) model/provider availability. These are audit findings — the specific Doctor additions should be tracked in `Plans/FinalGUISpec.md` Health tab or a dedicated Doctor spec.

---

## 6. Summary

| Coverage Status | Count | Examples |
|---|---|---|
| **Covered** | 32 | Run modes, permissions (all facets), commands, skills (discovery + schema + Persona refs), prompt pipeline, formatters, plugins, models, subagents, LSP, GitHub auth |
| **Partial** | 7 | Skills agent surface as-commands (#17), provider transform layer (#28), provider error classification (#29), context/compaction (#32), MCP integration (#34), GUI Skills tab subsectioning (#38) |
| **Missing** | 0 | — (no remaining extraction-core SSOT docs missing; remaining gaps are anchors/subsections) |

**Remaining gaps (high value):**
- Add stable anchors for provider transform and error classification (`CLI_Bridged_Providers.md`) and for context compilation/compaction thresholds (FileSafe.md / Run_Modes.md), so other plans can ContractRef them cleanly.
- Consider adding a dedicated numbered `§7.4.X` Skills subsection in FinalGUISpec.md for symmetry with other subsystem tabs.

---

*Document created for audit purposes only; no code changes.*
