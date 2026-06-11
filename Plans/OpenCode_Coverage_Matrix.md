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

Provider-matrix confidence rule: OpenCode-derived provider-matrix rows must track confidence explicitly so downstream reconciliation does not accidentally treat partially researched direct providers as fully pinned. A direct provider row can be useful evidence while still remaining `Partial` until an SSOT owner doc locks the provider/runtime behavior.

**Inspection corpus:** All files listed in `Plans/00-plans-index.md` plus subsystem SSOT docs (`Run_Modes.md`, `Personas.md`, `Permissions_System.md`, `Commands_System.md`, `Skills_System.md`, `Prompt_Pipeline.md`, `Formatters_System.md`, `Plugins_System.md`, `Models_System.md`) and `OpenCode_Deep_Extraction.md` itself.

Self-review note: `Plans/OpenCode_Coverage_Matrix.md` (`/OpenCode_Coverage_Matrix.md`) audit statuses and `/notes` remain the coverage owner after packet changes to command, skill, LSP, and permission coverage; when those owner docs change, this matrix is rechecked as an audit/currentness surface rather than treated as a product-feature owner.

Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes in this matrix are anti-pattern markers and audit lineage only; they are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.

Coverage audit rows may carry `supersedes_prior`, doc-discovery, owner-definition, and `17` resolved-count state when a later matrix pass replaces an older audit conclusion. Those fields are audit-state metadata and do not move ownership out of the named SSOT docs.

Command coverage health tracks fix-status, command-coverage, self-invalidating IDs, DRY_Rules, DRY_Rules.md, alias-canonicalization, cross-checks, and `/uncategorized` routing so this matrix can distinguish stale aliases from unresolved owner gaps.

Zero-finding waves and Ledger Condenser handoffs are audit terminal signals. A zero-finding result may supersedes_prior audit state only when no new exact blockers, contradictory survivors, or owner-definition gaps remain.

Open gaps retain machine-readable stage fields: json.next_required_stage, open_gaps.json.next_required_stage, open_gaps, re-auditing, Audit Mode, and follow-on state must remain visible when another audit pass is requested.

Adjacent owner references for this matrix include `Plans/Multi-Account.md`, `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`, `Plans/FinalGUISpec.md`, `/Multi-Account.md`, `/Models_System.md`, `/Prompt_Pipeline.md`, `/Personas.md`, and `/FinalGUISpec.md`; those references keep multi-account, model, prompt, persona, and GUI coverage aligned without duplicating their owner prose.

automation-first provider-stream coverage keeps `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, `/Provider_Stream_Mapping_External_Reference_A2A.md`, `/seam`, and tier-boundary evidence tied to provider-stream mapping rather than treating it as local matrix behavior.

Lane-aware worktree coverage references `Plans/WorktreeGitImprovement.md` and `/WorktreeGitImprovement.md` when a coverage row depends on lane-aware worktree semantics.

Runtime-correlation and meta-docs coverage uses `/runtime-correlation`, meta-docs, DRY_Rules, DRY_Rules.md, `/additive`, doc-integrity, cross-checking, `/governance`, and multi-account fields to mark additive governance evidence without treating the matrix as the owner of those runtime contracts.

GUI tab coverage references `Plans/FinalGUISpec.md`, `/FinalGUISpec.md`, `/tabs`, cross-reference, and widget-composed surfaces when the matrix audits tab or widget wiring.

Package/seam/lane coverage references `/package/seam/lane-aware`, tier-bound, Personas.md, Models_System, Models_System.md, Prompt_Pipeline, Prompt_Pipeline.md, and `/override` when persona/model/prompt overrides intersect package or lane semantics.

Orchestrator tab coverage references FinalGUISpec.md, Orchestrator_Page, Orchestrator_Page.md, `/tab`, cross-referencing, and Tiers when this matrix audits Orchestrator page navigation.

Governance handoff observations are governance-relevant only when `/handoff` and raw_observation evidence affects audit reconstruction or orchestration projections.

Coverage traceability rows keep stable coverage identifiers visible so downstream checks can trace each covered obligation to the exact source item without treating source-lineage labels as provider canon.

High-signal model coverage records may cite six-model treatment when a later coverage pass checks whether additional broad passes are still useful.

Later-model audit entries keep later-model and follow-on fields when the next step depends on a future model pass instead of immediate owner-doc edits.

Iterative audit closure records preserve zero-finding and iterative-audit status when bounded audit waves produce no new exact blockers.

### External Reference Landing Guidance

External reference adoption uses owner categories before wording lands in canon. Tool/runtime contracts land in `Tools.md` and `Contracts_V0.md`; UI/UX patterns land in `FinalGUISpec.md`; permission/auth patterns land in `Permissions_System.md`; provider/integration patterns land in `CLI_Bridged_Providers.md` and `Provider_OpenCode.md`; storage/persistence patterns land in `storage-plan.md`; identity/persona patterns land in `Personas.md` and `Multi-Account.md`. Non-PM constraints remain external-only unless an owner doc explicitly adopts them.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

## 2. Coverage Matrix
**Coverage status amendment (r-20260328-192850-06):** The following rows were revisited after the run-05 reconciliation pass. Rows 28, 29, 32, and 34 are `Covered`; row 32 no longer carries a synthetic-continue or loop-prevention gap because `Plans/Prompt_Pipeline.md` now preserves that canon directly. This amendment supersedes the `pre-run-05` matrix state for row 32 and the dependent summary counts below.

| Row | Topic | Prior status | Current status | Basis |
|---|---|---|---|---|
| 28 | Provider transform layer | Covered | **Covered** | `CLI_Bridged_Providers.md` preserves transform contract, FinishReason mapping, and replay-safe stream handling. |
| 29 | Provider error classification | Covered | **Covered** | `CLI_Bridged_Providers.md` and `Executor_Protocol.md` jointly preserve bounded failure classification and retry posture. |
| 32 | Context handling / compaction / rotation | Covered | **Covered** | `Prompt_Pipeline.md` now owns synthetic-continue loop prevention, compaction-immune overflow handling, and the prompt-compaction contract directly; FileSafe remains a safety consumer rather than a second SSOT. |
| 34 | MCP integration | Covered | **Covered** | `Tools.md` preserves MCP lifecycle and now defines safe `$ref`-cycle truncation behavior. |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md

| # | OpenCode Topic Area | Extraction Pointer(s) | Puppet Master SSOT Owner (Doc + Anchor) | Dependent Plans Referencing SSOT | Coverage Status | Notes |
|---|---|---|---|---|---|---|
| 1 | **Run modes + enforcement** (plan/ask/regular/yolo, strategy selection, budgets, kill conditions) | §7A.1-§7A.3 | `Plans/Run_Modes.md` #MODE-ask, #MODE-plan, #MODE-regular, #MODE-yolo, #STRATEGY-HTE, #STRATEGY-DAE, #KILL-CONDITIONS, #OUTCOME-TAXONOMY | Tools.md, FileSafe.md, CLI_Bridged_Providers.md, Permissions_System.md, Personas.md, assistant-chat-design.md, human-in-the-loop.md | **Covered** | Full four-mode taxonomy with deterministic selection algorithm, budget table, and kill conditions. |
| 2 | **Permissions - allow/ask/deny actions** | §7C.1, §7C.5 | `Plans/Permissions_System.md` #PERM-ACTIONS, #ASK-FLOW | Tools.md §2, Run_Modes.md, Personas.md, Commands_System.md, Plugins_System.md | **Covered** | Three actions with once/always/reject semantics. |
| 3 | **Permissions - granular/wildcard rules** | §7C.2, §7C.3 | `Plans/Permissions_System.md` #GRANULAR-RULES, #WILDCARD-SYNTAX | Tools.md §2.2 | **Covered** | Last-match-wins, `*`/`?` wildcards, home expansion, canonical-root case semantics. |
| 4 | **Permissions - doom_loop guard** | §7C.4 | `Plans/Permissions_System.md` #GUARD-DOOM-LOOP | - | **Covered** | Configurable threshold, default 3. |
| 5 | **Permissions - external_directory guard** | §7C.4 | `Plans/Permissions_System.md` #GUARD-EXTERNAL-DIR, #HOME-EXPANSION | - | **Covered** | Allowlist support. |
| 6 | **Permissions - .env deny defaults** | §7C.6 | `Plans/Permissions_System.md` #DEFAULT-ENV-DENY | - | **Covered** | `.env` deny, `.env.example` allow. |
| 7 | **Permissions - multi-layer precedence** | §7C.1 (flat in OC) | `Plans/Permissions_System.md` #PRECEDENCE-LAYERS | Run_Modes.md, Personas.md, Tools.md | **Covered** | PM delta: layered precedence with requested/effective disclosure. |
| 8 | **Commands - discovery paths** | §7D.1 | `Plans/Commands_System.md` #STORAGE-LAYOUT | FinalGUISpec.md §7.4.11, assistant-chat-design.md §5 | **Covered** | `.puppet-master/commands/` + global path. |
| 9 | **Commands - template syntax ($ARGUMENTS, @path, !`cmd`)** | §7D.3 | `Plans/Commands_System.md` #TEMPLATE-PLACEHOLDERS, #TEMPLATE-FILE-INCLUDE, #TEMPLATE-SHELL-INJECTION | - | **Covered** | Permission-checked shell injection + file includes. |
| 10 | **Commands - args, file include, shell injection** | §7D.3 | `Plans/Commands_System.md` #TEMPLATE-PLACEHOLDERS, #TEMPLATE-FILE-INCLUDE, #TEMPLATE-SHELL-INJECTION | Permissions_System.md | **Covered** | - |
| 11 | **Commands - subtask + model override** | §7D.4 | `Plans/Commands_System.md` #SUBTASK, §3.2 | Tools.md, Personas.md | **Covered** | - |
| 12 | **Formatters - post-write/edit trigger, $FILE** | §7E.1, §7E.3 | `Plans/Formatters_System.md` #LIFECYCLE, #FORMATTER-CONFIG | Run_Modes.md (HTE-only) | **Covered** | HTE-only enforcement is a PM delta. |
| 13 | **Formatters - disable/override** | §7E.3 | `Plans/Formatters_System.md` #FORMATTER-CONFIG | - | **Covered** | Global disable + per-formatter disable/command override. |
| 14 | **Formatters - built-in formatter set** | §7E.2 | `Plans/Formatters_System.md` #BUILT-IN-FORMATTERS | - | **Covered** | 21 formatters with auto-detection. |
| 15 | **Skills - discovery** | §7F.1 | `Plans/Skills_System.md` #DISCOVERY, #SEARCH-ORDER | FinalGUISpec.md (Skills tab), Personas.md (`default_skill_refs`), Tools.md (`skill` tool), Permissions_System.md (`skill` key), FileSafe.md (Skill Bundling), MiscPlan.md (implementation checklist) | **Covered** | Canonical discovery roots + ordering + first-wins shadowing rules are defined in Skills_System.md. |
| 16 | **Skills - frontmatter/schema** | §7F.2 | `Plans/Skills_System.md` #SKILL-SCHEMA | FinalGUISpec.md, Personas.md, Tools.md | **Covered** | Required frontmatter fields (`name`, `description`) and validation are specified. |
| 17 | **Skills - agent surface (skill tool, as-command registration)** | §7F.3 | `Plans/Skills_System.md` #RUNTIME-SURFACE, `Plans/Tools.md` (skill tool I/O) | - | **Partial** | The `skill` tool surface is specified; skill-as-command dual registration is not required for v1 and remains unspecified. |
| 18 | **Skills - permission gating** | §7F.4 | `Plans/Skills_System.md` #PERMISSIONS, `Plans/Permissions_System.md` #TOOL-KEYS | - | **Covered** | Skill-specific permission patterns and external_directory root handling are owned by Skills_System.md. |
| 19 | **Skills - per-Persona skill refs** | §7B.1 (agent.skills) | `Plans/Skills_System.md` #RUNTIME-SURFACE, `Plans/Personas.md` §3.2 | - | **Covered** | Persona `default_skill_refs` resolution + warning behavior is specified. |
| 20 | **Plugins - discovery + load order** | §7G.1 | `Plans/Plugins_System.md` #DISCOVERY, #LOAD-ORDER | - | **Covered** | Four-source priority, lexicographic tiebreak. |
| 21 | **Plugins - hooks (tool, permission, session, message, compaction, shell.env, system.prompt)** | §7G.3 | `Plans/Plugins_System.md` #HOOK-EVENTS, #HOOK-COMPACTION | - | **Covered** | 10 hook events with typed returns. |
| 22 | **Plugins - custom tools + collision** | §7G.4 | `Plans/Plugins_System.md` #CUSTOM-TOOLS, #TOOL-COLLISION | Tools.md | **Covered** | Namespaced aliasing default; override opt-in. |
| 23 | **Plugins - compaction hook** | §7G.3 | `Plans/Plugins_System.md` #HOOK-COMPACTION | - | **Covered** | InjectContext / ReplacePrompt with first-wins. |
| 24 | **Models - provider/model ID format** | §7H.1 | `Plans/Models_System.md` #MODEL-ID | CLI_Bridged_Providers.md, Provider_OpenCode.md | **Covered** | `provider_id/model_id`, first-`/`-split. |
| 25 | **Models - selection priority** | §7H.2 | `Plans/Models_System.md` #SELECTION-PRIORITY | Run_Modes.md, Personas.md | **Covered** | 6-level chain. |
| 26 | **Models - options + variants** | §7H.3 | `Plans/Models_System.md` #MODEL-OPTIONS, #VARIANTS | - | **Covered** | Per-provider/model options, built-in + custom variants. |
| 27 | **Models - per-Persona override** | §7H.2 (agent.model) | `Plans/Models_System.md` #PERSONA-MODEL-OVERRIDES | Personas.md | **Covered** | `default_model` + `default_variant` in PERSONA.md. |
| 28 | **Provider transform layer** | §7H.4, §10.3 | `Plans/CLI_Bridged_Providers.md` (§ provider transform), `Plans/Models_System.md` §3.4 | Provider_OpenCode.md | **Covered** | Bridged-provider transforms preserve lineage, normalized replay safety, and FinishReason handling. |
| 29 | **Provider error classification (retryable, overflow, auth)** | §7H.5, §10.3 | `Plans/CLI_Bridged_Providers.md` (auth and stream resilience), `Plans/Executor_Protocol.md` §7.1 | Run_Modes.md §5 kill conditions | **Covered** | Failure-class mapping now includes bounded reconnect, refresh-once auth, and circuit-breaker posture. |
| 30 | **Tool lifecycle and hook boundaries** | §10.1 | `Plans/Tools.md` (tool semantics), `Plans/Plugins_System.md` #HOOK-TOOL-EXECUTE | - | **Covered** | Tool execution before/after hooks defined in Plugins_System.md; tool semantics in Tools.md. |
| 31 | **Subagent management** | §7B.1-§7B.3 | `Plans/orchestrator-subagent-integration.md` §4 (registry), `Plans/Personas.md` #DEF-SUBAGENT | interview-subagent-integration.md, Tools.md §3.6 (task tool) | **Covered** | Registry-driven Persona set; task-tool validation. |
| 32 | **Context handling / compaction / rotation** | §7B.4, §7B.5 | `Plans/Prompt_Pipeline.md` #ASSEMBLY-PIPELINE, #COMPACTION, `Plans/Run_Modes.md` §7 (mode-specific context deltas) | - | **Covered** | Prompt_Pipeline.md now preserves synthetic-continue loop prevention, compaction thresholds, immune-content overflow handling, and reasoning-preservation canon directly; FileSafe consumes the compiled output but no longer acts as the SSOT for context-compilation behavior. |
| 33 | **LSP integration** | - (not in extraction §7) | `Plans/LSPSupport.md` (canonical) | FinalGUISpec.md §7.4.2 (Settings > LSP), FileManager.md §10.10 | **Covered** | Not part of extraction scope but has its own SSOT. |
| 34 | **MCP integration** | §7D.1 (MCP prompts -> commands) | `Plans/newtools.md` (MCP config, server list), `Plans/Tools.md` §5 (MCP in registry) | FinalGUISpec.md §7.4 Advanced (MCP config card) | **Covered** | Tools.md specifies MCP lifecycle, connection pooling, timeouts, and safe schema-cycle truncation. |
| 35 | **GitHub API: Auth vs usage/tool** | - (not in extraction §7) | `Plans/GitHub_API_Auth_and_Flows.md` (auth contract), `Plans/GitHub_Integration.md` (Git panel + API usage) | FinalGUISpec.md, Architecture_Invariants.md #INV-002 | **Covered** | OAuth device-code default; no secrets in storage. Not part of OpenCode extraction scope. |
| 36 | **GUI config wiring - Permissions** | - | `Plans/Permissions_System.md` §10, `Plans/FinalGUISpec.md` §7.4 Settings and inspectors | - | **Covered** | Dedicated permissions surface is owned by Permissions_System and surfaced through Settings. |
| 37 | **GUI config wiring - Commands** | - | `Plans/Commands_System.md` §6, `Plans/FinalGUISpec.md` §7.4.11 | - | **Covered** | Rules & Commands tab. |
| 38 | **GUI config wiring - Skills** | - | `Plans/Skills_System.md` #GUI-SKILLS, `Plans/FinalGUISpec.md` §7.4A Agent Config Skills tab | - | **Covered** | Agent Config > Skills is the canonical GUI surface; it mirrors Skills_System owner vocabulary. |
| 39 | **GUI config wiring - Plugins** | - | `Plans/Plugins_System.md` §9, `Plans/FinalGUISpec.md` §7.4.12 | - | **Covered** | Dedicated tab cross-referencing SSOT. |
| 40 | **GUI config wiring - Models** | - | `Plans/Models_System.md` §7, `Plans/FinalGUISpec.md` §7.4.14 | - | **Covered** | Model picker + Settings > Models tab. |
| 41 | **GUI config wiring - Formatters** | - | `Plans/Formatters_System.md` §5, `Plans/FinalGUISpec.md` §7.4.13 | - | **Covered** | Dedicated tab cross-referencing SSOT. |
| 42 | **Prompt assembly pipeline** | §7B.4 | `Plans/Prompt_Pipeline.md` #ASSEMBLY-PIPELINE | FileSafe.md Part B (context compilation details), Personas.md §5.2 (Persona injection), Plugins_System.md (#HOOK-COMPACTION) | **Covered** | Prompt assembly stage ordering and the compaction/rotation contract are owned by Prompt_Pipeline.md; other docs provide subsystem-specific details. |
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
| `Plans/Prompt_Pipeline.md` | No stable anchor on the context-assembly/cache-preservation subsection beneath `#ASSEMBLY-PIPELINE`; compaction-threshold rules should also carry a dedicated stable anchor beneath `#COMPACTION`. |
| `Plans/Tools.md` | No `#MCP-INTEGRATION` anchor for MCP tool registration flow. |
| `Plans/FinalGUISpec.md` | Agent Config Skills content now lives at §7.4A; add a stable `#SKILLS-TAB` anchor only if future cross-reference tooling requires one. |

---

## 4. GUI + Config Wiring Audit

### 4.1 Permissions

| Check | Status | Detail |
|---|---|---|
| GUI surface in FinalGUISpec.md | ✅ | §7.4 Settings and inspectors, with permission details owned by `Plans/Permissions_System.md` §10. |
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
| GUI surface in FinalGUISpec.md | ✅ | §7.4A Agent Config Skills tab mirrors the `Plans/Skills_System.md` owner contract. |
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

4. **`Plans/Prompt_Pipeline.md`** needs a stable anchor on the context-assembly/cache-preservation subsection beneath `#ASSEMBLY-PIPELINE`, and compaction-threshold rules should also carry a dedicated stable anchor beneath `#COMPACTION`.

5. **`Plans/Tools.md`** needs anchor `#MCP-INTEGRATION` on the section describing how MCP-discovered tools enter the central registry.

6. ✅ **`Plans/FinalGUISpec.md`** now has §7.4A Agent Config Skills tab for the **Skills tab**; future work may add a stable `#SKILLS-TAB` anchor if needed.

### 5.3 Cross-Reference Corrections

7. ✅ **`Plans/OpenCode_Deep_Extraction.md` §8** mapping table rows H1–H4 now target `Plans/Models_System.md` anchors for model options/variants/errors.

8. ✅ **`Plans/Personas.md`** SSOT reference list now uses `Plans/Plugins_System.md` (plural) and no longer marks `Plans/Skills_System.md` as missing/future.

9. ✅ **`Plans/FinalGUISpec.md`** Skills tab row now sources from `Plans/Skills_System.md`.

### 5.4 DRY Tightening

10. **`Plans/Models_System.md` §4.2 and §4.3** should add anchors `#OVERFLOW-DETECTION` and `#RETRY-POLICY` so that `Plans/Run_Modes.md` §5 kill conditions and `Plans/CLI_Bridged_Providers.md` can reference them by anchor.

Provider/account/model reconciliation for OpenCode coverage stays linked to `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`), `Plans/Multi-Account.md` (`/Multi-Account.md`), and `Plans/Models_System.md` (`/Models_System.md`) so bridged-provider transforms, account routing, and model identity do not drift into separate local rules.

11. **`Plans/Plugins_System.md` §7.3** references a future `disabled_plugins` field in PERSONA.md frontmatter. `Plans/Personas.md` §3.2 does not yet list this field. One of the two docs must be updated to be consistent.

### 5.5 Doctor/Preflight Gaps

12. Consider adding Doctor checks for: (a) invalid permission configs, (b) invalid command schemas, (c) skill validation errors, (d) formatter binary availability, (e) plugin manifest validation, (f) model/provider availability. These are audit findings — the specific Doctor additions should be tracked in `Plans/FinalGUISpec.md` Health tab or a dedicated Doctor spec.

---

## 6. Summary
| Coverage Status | Count | Examples |
|---|---|---|
| **Covered** | 36 | Run modes, permissions, provider transform/error classification, context handling/compaction, MCP lifecycle, GitHub auth, models, subagents, LSP |
| **Partial** | 2 | Skills agent surface as-commands (#17), any future external-only bridge work not yet packetized |
| **Missing** | 0 | - |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/OpenCode_Coverage_Matrix.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### OCM-001 - OpenCode Coverage Matrix (Audit) Source-Preserving PlanUnit

```yaml
plan_unit_id: OCM-001
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Plans/OpenCode_Coverage_Matrix.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Coverage_Matrix-S0021
preserved_exact_tokens:
- OpenCode Coverage Matrix (Audit)
- 1. Scope and Method
- External Reference Landing Guidance
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- 2. Coverage Matrix
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
- 3. DRY Authority Audit
- 3.1 Documents duplicating canonical definitions
- 3.2 SSOT docs missing stable anchors
- 4. GUI + Config Wiring Audit
- 4.1 Permissions
- 4.2 Commands
- 4.3 Skills
- 4.4 Plugins
- 4.5 Models
- 4.6 Formatters
- 5. Mandatory Fix List
- 5.1 Missing SSOT Documents
- 5.2 Anchor Additions
- 5.3 Cross-Reference Corrections
- 5.4 DRY Tightening
- 5.5 Doctor/Preflight Gaps
- 6. Summary
negative_constraints: []
compatibility_only_notes:
- Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes in this matrix are anti-pattern markers and audit lineage only; they are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.
- '| Config keys/state storage | ✅ | Canonical storage and discovery roots are defined in `Plans/Skills_System.md` (project: `.puppet-master/skills/`, global: `~/.config/puppet-master/skills/`, plus legacy discovery roots for compatibility). |'
stale_retired_dispositions:
- Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes in this matrix are anti-pattern markers and audit lineage only; they are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.
- Command coverage health tracks fix-status, command-coverage, self-invalidating IDs, DRY_Rules, DRY_Rules.md, alias-canonicalization, cross-checks, and `/uncategorized` routing so this matrix can distinguish stale aliases from unresolved owner gaps.
- '| `Plans/Personas.md` §1.4, §5.4 | SSOT reference list typos / stale qualifiers | `Plugins_System.md` is now referenced correctly (plural) and `Skills_System.md` is no longer marked as missing/future. |'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- This document audits every OpenCode-derived capability extracted in `Plans/OpenCode_Deep_Extraction.md` (§7A–§7H, §8, §9, §10) and verifies its coverage within the Puppet Master SSOT plan corpus.
- '| **Covered** | An explicit SSOT owner doc exists with stable anchors; dependent plans reference it by anchor (not by restating definitions). |'
- '| **Partial** | A target doc exists but is missing stable anchors, missing GUI wiring, or the capability is only described in `OpenCode_Deep_Extraction.md` without a dedicated SSOT section. |'
- '| **Missing** | No SSOT doc and no clear contract for this capability. The extraction doc records the baseline but nothing in `Plans/` owns it. |'
- 'Provider-matrix confidence rule: OpenCode-derived provider-matrix rows must track confidence explicitly so downstream reconciliation does not accidentally treat partially researched direct providers as fully pinned. A direct provider row can be useful evidence while still remaining `Partial` until a'
- '**Inspection corpus:** All files listed in `Plans/00-plans-index.md` plus subsystem SSOT docs (`Run_Modes.md`, `Personas.md`, `Permissions_System.md`, `Commands_System.md`, `Skills_System.md`, `Prompt_Pipeline.md`, `Formatters_System.md`, `Plugins_System.md`, `Models_System.md`) and `OpenCode_Deep_E'
- 'Self-review note: `Plans/OpenCode_Coverage_Matrix.md` (`/OpenCode_Coverage_Matrix.md`) audit statuses and `/notes` remain the coverage owner after packet changes to command, skill, LSP, and permission coverage; when those owner docs change, this matrix is rechecked as an audit/currentness surface ra'
- Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes in this matrix are anti-pattern markers and audit lineage only; they are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.
- Coverage audit rows may carry `supersedes_prior`, doc-discovery, owner-definition, and `17` resolved-count state when a later matrix pass replaces an older audit conclusion. Those fields are audit-state metadata and do not move ownership out of the named SSOT docs.
- Command coverage health tracks fix-status, command-coverage, self-invalidating IDs, DRY_Rules, DRY_Rules.md, alias-canonicalization, cross-checks, and `/uncategorized` routing so this matrix can distinguish stale aliases from unresolved owner gaps.
- Zero-finding waves and Ledger Condenser handoffs are audit terminal signals. A zero-finding result may supersedes_prior audit state only when no new exact blockers, contradictory survivors, or owner-definition gaps remain.
- Adjacent owner references for this matrix include `Plans/Multi-Account.md`, `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`, `Plans/FinalGUISpec.md`, `/Multi-Account.md`, `/Models_System.md`, `/Prompt_Pipeline.md`, `/Personas.md`, and `/FinalGUISpec.md`; those references ke
- automation-first provider-stream coverage keeps `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, `/Provider_Stream_Mapping_External_Reference_A2A.md`, `/seam`, and tier-boundary evidence tied to provider-stream mapping rather than treating it as local matrix behavior.
- Runtime-correlation and meta-docs coverage uses `/runtime-correlation`, meta-docs, DRY_Rules, DRY_Rules.md, `/additive`, doc-integrity, cross-checking, `/governance`, and multi-account fields to mark additive governance evidence without treating the matrix as the owner of those runtime contracts.
- Later-model audit entries keep later-model and follow-on fields when the next step depends on a future model pass instead of immediate owner-doc edits.
- External reference adoption uses owner categories before wording lands in canon. Tool/runtime contracts land in `Tools.md` and `Contracts_V0.md`; UI/UX patterns land in `FinalGUISpec.md`; permission/auth patterns land in `Permissions_System.md`; provider/integration patterns land in `CLI_Bridged_Pro
- '| 32 | Context handling / compaction / rotation | Covered | **Covered** | `Prompt_Pipeline.md` now owns synthetic-continue loop prevention, compaction-immune overflow handling, and the prompt-compaction contract directly; FileSafe remains a safety consumer rather than a second SSOT. |'
- '| # | OpenCode Topic Area | Extraction Pointer(s) | Puppet Master SSOT Owner (Doc + Anchor) | Dependent Plans Referencing SSOT | Coverage Status | Notes |'
- '| 3 | **Permissions - granular/wildcard rules** | §7C.2, §7C.3 | `Plans/Permissions_System.md` #GRANULAR-RULES, #WILDCARD-SYNTAX | Tools.md §2.2 | **Covered** | Last-match-wins, `*`/`?` wildcards, home expansion, canonical-root case semantics. |'
- '| 15 | **Skills - discovery** | §7F.1 | `Plans/Skills_System.md` #DISCOVERY, #SEARCH-ORDER | FinalGUISpec.md (Skills tab), Personas.md (`default_skill_refs`), Tools.md (`skill` tool), Permissions_System.md (`skill` key), FileSafe.md (Skill Bundling), MiscPlan.md (implementation checklist) | **Covere'
- '| 32 | **Context handling / compaction / rotation** | §7B.4, §7B.5 | `Plans/Prompt_Pipeline.md` #ASSEMBLY-PIPELINE, #COMPACTION, `Plans/Run_Modes.md` §7 (mode-specific context deltas) | - | **Covered** | Prompt_Pipeline.md now preserves synthetic-continue loop prevention, compaction thresholds, immu'
- '| 33 | **LSP integration** | - (not in extraction §7) | `Plans/LSPSupport.md` (canonical) | FinalGUISpec.md §7.4.2 (Settings > LSP), FileManager.md §10.10 | **Covered** | Not part of extraction scope but has its own SSOT. |'
- '| 38 | **GUI config wiring - Skills** | - | `Plans/Skills_System.md` #GUI-SKILLS, `Plans/FinalGUISpec.md` §7.4A Agent Config Skills tab | - | **Covered** | Agent Config > Skills is the canonical GUI surface; it mirrors Skills_System owner vocabulary. |'
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `d76e3a91d68d46770db47b8bc6123849238f5347ef59f1fa2454d390ebb56237`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `OpenCode_Coverage_Matrix-S0001` through `OpenCode_Coverage_Matrix-S0021` are preserved in place and mapped in `coverage_map.jsonl` to `OCM-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
