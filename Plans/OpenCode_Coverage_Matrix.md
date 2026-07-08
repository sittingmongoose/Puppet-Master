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

Orchestrator tab coverage references FinalGUISpec.md, Orchestrator_Page, Orchestrator_Page.md, `/tab`, cross-referencing, and the canonical seven-tab shell (`Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`) when this matrix audits Orchestrator page navigation; legacy `Tiers` labels are compatibility/search audit inputs only.

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


| SSOT Document | Stable Anchor Status |
|---|---|
| `Plans/CLI_Bridged_Providers.md` | Repaired: `#PROVIDER-TRANSFORM` anchors normalized provider transform/output preservation and `#ERROR-CLASSIFICATION` anchors provider error/finish-reason classification. |
| `Plans/Models_System.md` §4 | Repaired: `#MODEL-ERRORS` anchors model availability/error handling, `#MODEL-OVERFLOW-DETECTION` / `#OVERFLOW-DETECTION` anchor overflow detection ownership, and `#MODEL-RETRY-POLICY` / `#RETRY-POLICY` anchor the model-selection versus runtime-retry ownership split. |
| `Plans/Prompt_Pipeline.md` | Repaired: `#CONTEXT-ASSEMBLY-CACHE-PRESERVATION` anchors context assembly/cache preservation beneath `#ASSEMBLY-PIPELINE`, `#COMPACTION` anchors compaction, and `#COMPACTION-THRESHOLDS` anchors compaction-threshold rules. |
| `Plans/Tools.md` | Repaired: `#MCP-INTEGRATION` anchors the MCP tool registration consumer boundary. |
| `Plans/FinalGUISpec.md` | Repaired: `#SKILLS-TAB` anchors the Agent Config Skills tab. |

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

3. ✅ **`Plans/CLI_Bridged_Providers.md`** now has anchor `#PROVIDER-TRANSFORM` on provider transform/normalization and `#ERROR-CLASSIFICATION` on provider error categorization.

4. ✅ **`Plans/Prompt_Pipeline.md`** now has `#CONTEXT-ASSEMBLY-CACHE-PRESERVATION`, `#COMPACTION`, and `#COMPACTION-THRESHOLDS`.

5. ✅ **`Plans/Tools.md`** now has anchor `#MCP-INTEGRATION` on the section describing how MCP-discovered tools enter the central registry.

6. ✅ **`Plans/FinalGUISpec.md`** now has `#SKILLS-TAB` on §7.4A Agent Config Skills tab.

### 5.3 Cross-Reference Corrections

7. ✅ **`Plans/OpenCode_Deep_Extraction.md` §8** mapping table rows H1–H4 now target `Plans/Models_System.md` anchors for model options/variants/errors.

8. ✅ **`Plans/Personas.md`** SSOT reference list now uses `Plans/Plugins_System.md` (plural) and no longer marks `Plans/Skills_System.md` as missing/future.

9. ✅ **`Plans/FinalGUISpec.md`** Skills tab row now sources from `Plans/Skills_System.md`.

### 5.4 DRY Tightening

10. ✅ **`Plans/Models_System.md` §4** now has anchors `#MODEL-OVERFLOW-DETECTION`, `#OVERFLOW-DETECTION`, `#MODEL-RETRY-POLICY`, and `#RETRY-POLICY` so `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md` can reference model overflow/retry ownership by anchor.

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

### OCM-002 - Audit Authority Scope And Currentness Rules

```yaml
plan_unit_id: OCM-002
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: OpenCode_Coverage_Matrix.md audits OpenCode-derived capability coverage from Plans/OpenCode_Deep_Extraction.md sections 7A-7H, 8, 9, and 10. It preserves Covered, Partial, Missing, provider-matrix confidence, /notes, supersedes_prior, doc-discovery, owner-definition, json.next_required_stage, open_gaps, Audit Mode, zero-finding, and stale tier-era lineage as audit metadata rather than product-owner vocabulary.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: audit_authority_scope_currentness
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: audit_authority_scope_currentness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0002
preserved_exact_tokens:
- OpenCode Coverage Matrix (Audit)
- Plans/OpenCode_Deep_Extraction.md
- Covered
- Partial
- Missing
- provider-matrix confidence
- /notes
- supersedes_prior
- doc-discovery
- owner-definition
- json.next_required_stage
- open_gaps
- Audit Mode
- zero-finding
- Stale tier-era
negative_constraints:
- Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes are audit lineage only and are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-003 - External Reference Landing Owner Categories

```yaml
plan_unit_id: OCM-003
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'External reference adoption uses owner categories before wording lands in canon: tool/runtime contracts land in Tools.md and Contracts_V0.md; UI/UX patterns in FinalGUISpec.md; permission/auth in Permissions_System.md; provider/integration in CLI_Bridged_Providers.md and Provider_OpenCode.md; storage/persistence in storage-plan.md; identity/persona in Personas.md and Multi-Account.md. Non-PM constraints remain external-only unless an owner doc explicitly adopts them.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: external_reference_landing_owner_categories
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: external_reference_landing_owner_categories
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0003
preserved_exact_tokens:
- External Reference Landing Guidance
- Tools.md
- Contracts_V0.md
- FinalGUISpec.md
- Permissions_System.md
- CLI_Bridged_Providers.md
- Provider_OpenCode.md
- storage-plan.md
- Personas.md
- Multi-Account.md
- Non-PM constraints remain external-only
negative_constraints:
- Non-PM constraints remain external-only unless an owner doc explicitly adopts them.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### OCM-004 - Core Coverage Matrix Rows Modes Permissions Commands Formatters

```yaml
plan_unit_id: OCM-004
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Core OpenCode coverage rows 1-14 preserve coverage facts for run modes, permissions, commands, and formatters, including plan/ask/regular/yolo, allow/ask/deny, doom_loop, external_directory, .env deny defaults, $ARGUMENTS, @path, shell injection, $FILE, HTE-only formatter enforcement, and the built-in 21 formatter set.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: core_coverage_rows_modes_permissions_commands_formatters
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: core_coverage_rows_modes_permissions_commands_formatters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- plan/ask/regular/yolo
- allow/ask/deny
- doom_loop
- external_directory
- .env
- $ARGUMENTS
- '@path'
- '!`cmd`'
- $FILE
- HTE-only
- 21 formatters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are audit coverage facts and do not move ownership out of the named SSOT docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-005 - Skills And Plugins Coverage Rows

```yaml
plan_unit_id: OCM-005
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'OpenCode coverage rows 15-23 preserve Skills and Plugins coverage facts, including Skills_System.md #DISCOVERY and #SEARCH-ORDER, the skill tool surface, row 17 Partial for skill-as-command dual registration not required for v1, default_skill_refs, plugin hooks, InjectContext, ReplacePrompt, and custom-tool collision policy.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_plugins_coverage_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: skills_plugins_coverage_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- Skills_System.md
- '#DISCOVERY'
- '#SEARCH-ORDER'
- skill tool
- Partial
- skill-as-command
- default_skill_refs
- InjectContext
- ReplacePrompt
- TOOL-COLLISION
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Row 17 remains Partial because skill-as-command dual registration is not required for v1 and remains unspecified.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-006 - Models Provider Runtime MCP GitHub Prompt Coverage Rows

```yaml
plan_unit_id: OCM-006
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Coverage amendment rows 28, 29, 32, and 34 remain Covered. Rows covering models, providers, runtime context, MCP, GitHub, and prompt assembly preserve provider_id/model_id, FinishReason handling, provider transform and error classification, synthetic-continue loop prevention, compaction-immune overflow handling, MCP lifecycle, safe $ref cycle truncation, GitHub auth, and Prompt_Pipeline.md ownership.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_provider_runtime_mcp_github_prompt_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: models_provider_runtime_mcp_github_prompt_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- Rows 28, 29, 32, and 34 are `Covered`
- provider_id/model_id
- FinishReason
- synthetic-continue loop prevention
- compaction-immune overflow handling
- MCP lifecycle
- safe `$ref`-cycle truncation
- GitHub auth
- Prompt_Pipeline.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt_Pipeline.md owns context-compilation behavior; FileSafe remains a consumer.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OCM-007 - GUI Config Coverage Matrix Rows

```yaml
plan_unit_id: OCM-007
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Coverage rows 36-41 remain Covered for GUI/config wiring for Permissions, Commands, Skills, Plugins, Models, and Formatters, including FinalGUISpec.md, section 7.4A Agent Config Skills tab, Settings > Models, and dedicated tab cross-references to SSOT owner docs.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_coverage_matrix_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_coverage_matrix_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- GUI config wiring
- Permissions
- Commands
- Skills
- Plugins
- Models
- Formatters
- §7.4A Agent Config Skills tab
- Settings > Models
- FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These rows audit GUI wiring coverage without owning the GUI surfaces.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-008 - DRY Duplication Audit Findings

```yaml
plan_unit_id: OCM-008
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The DRY authority audit preserves acceptable summary/defer posture for Tools.md section 2, mapping-table targets for Skills F1-F4 and Models H1-H4, Plugins_System.md plural correction, Skills_System.md no longer missing/future, FinalGUISpec.md Skills row source, and Run_Modes baseline acceptability.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_duplication_audit_findings
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: dry_duplication_audit_findings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0006
preserved_exact_tokens:
- 3. DRY Authority Audit
- Documents duplicating canonical definitions
- Tools.md §2
- Skills (F1–F4)
- Models rows (H1–H4)
- Plugins_System.md
- Skills_System.md
- not MiscPlan.md
- Run_Modes.md §8
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Personas.md stale qualifiers were corrected; Skills_System.md is no longer missing/future.
owner_boundary_notes:
- S0005 is a structural DRY Authority Audit section container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-009 - Stable Anchor Gap Audit Findings

```yaml
plan_unit_id: OCM-009
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'The stable-anchor audit records repaired owner anchors for CLI_Bridged_Providers.md #PROVIDER-TRANSFORM and #ERROR-CLASSIFICATION, Models_System.md #MODEL-OVERFLOW-DETECTION/#OVERFLOW-DETECTION and #MODEL-RETRY-POLICY/#RETRY-POLICY, Prompt_Pipeline.md #CONTEXT-ASSEMBLY-CACHE-PRESERVATION/#COMPACTION/#COMPACTION-THRESHOLDS, Tools.md #MCP-INTEGRATION, and FinalGUISpec.md #SKILLS-TAB.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: stable_anchor_repair_audit_findings
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: stable_anchor_repair_audit_findings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0007
preserved_exact_tokens:
- '#PROVIDER-TRANSFORM'
- '#ERROR-CLASSIFICATION'
- '#MODEL-ERRORS'
- '#MODEL-OVERFLOW-DETECTION'
- '#OVERFLOW-DETECTION'
- '#MODEL-RETRY-POLICY'
- '#RETRY-POLICY'
- '#CONTEXT-ASSEMBLY-CACHE-PRESERVATION'
- '#COMPACTION'
- '#COMPACTION-THRESHOLDS'
- '#MCP-INTEGRATION'
- '#SKILLS-TAB'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Anchor repairs are audit findings, not local implementation tasks.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-010 - GUI Config Wiring Audit Permissions Commands Skills

```yaml
plan_unit_id: OCM-010
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The GUI/config wiring audit preserves Permissions, Commands, and Skills findings for GUI surfaces, config/state storage, no-secrets posture, and Doctor gaps, including ~/.config/puppet-master/permissions.toml, <project>/.puppet-master/permissions.toml, .puppet-master/commands/, ~/.config/puppet-master/commands/, .puppet-master/skills/, ~/.config/puppet-master/skills/, legacy discovery roots, doctor.permissions.valid, and skill validation gaps.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_wiring_permissions_commands_skills
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_wiring_permissions_commands_skills
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0011
preserved_exact_tokens:
- 4. GUI + Config Wiring Audit
- 4.1 Permissions
- 4.2 Commands
- 4.3 Skills
- ~/.config/puppet-master/permissions.toml
- <project>/.puppet-master/permissions.toml
- .puppet-master/commands/
- ~/.config/puppet-master/commands/
- .puppet-master/skills/
- ~/.config/puppet-master/skills/
- legacy discovery roots
- doctor.permissions.valid
- skill validation
negative_constraints: []
compatibility_only_notes:
- Legacy discovery roots for skills remain compatibility-only.
stale_retired_dispositions: []
owner_boundary_notes:
- S0008 is a structural GUI/config wiring audit section container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-011 - GUI Config Wiring Audit Plugins Models Formatters

```yaml
plan_unit_id: OCM-011
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The GUI/config wiring audit preserves Plugins, Models, and Formatters findings for GUI surfaces, config/state storage, no-secrets posture, and Doctor gaps, including .puppet-master/plugins/, ~/.config/puppet-master/plugins/, [plugins], [provider.*], model.json, config:v1, [formatter], plugin.load_failed, provider auth Doctor gap, and doctor.formatters.available.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_wiring_plugins_models_formatters
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_wiring_plugins_models_formatters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0014
preserved_exact_tokens:
- 4.4 Plugins
- 4.5 Models
- 4.6 Formatters
- .puppet-master/plugins/
- ~/.config/puppet-master/plugins/
- '[plugins]'
- '[provider.*]'
- model.json
- config:v1
- '[formatter]'
- plugin.load_failed
- provider auth status
- doctor.formatters.available
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Doctor gaps remain audit findings.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-012 - Fix List Boundary And Completed SSOT Cross References

```yaml
plan_unit_id: OCM-012
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The mandatory fix list is documentation-only and NOT implementation tasks. Completed items preserve Skills_System.md as canonical SSOT, Prompt_Pipeline.md as prompt assembly/compaction owner, OpenCode_Deep_Extraction.md mapping corrections, Personas.md Plugins_System.md plural correction and Skills_System.md no-longer-missing status, and FinalGUISpec.md Skills tab source correction.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: fix_list_boundary_completed_ssot_crossrefs
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: fix_list_boundary_completed_ssot_crossrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0018
preserved_exact_tokens:
- These are documentation-only edits required to close coverage gaps. They are NOT implementation tasks.
- Plans/Skills_System.md created
- Plans/Prompt_Pipeline.md created
- OpenCode_Deep_Extraction.md
- Personas.md
- Plugins_System.md
- FinalGUISpec.md
negative_constraints:
- Mandatory fix list entries are documentation-only audit findings and are not implementation tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- S0015 is a structural mandatory-fix-list container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-013 - Open Anchor Addition Fixes

```yaml
plan_unit_id: OCM-013
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'Anchor-addition audit findings are repaired for CLI_Bridged_Providers.md anchors #PROVIDER-TRANSFORM and #ERROR-CLASSIFICATION, Prompt_Pipeline.md #CONTEXT-ASSEMBLY-CACHE-PRESERVATION/#COMPACTION/#COMPACTION-THRESHOLDS, Tools.md #MCP-INTEGRATION, FinalGUISpec.md #SKILLS-TAB, and Models_System.md overflow/retry anchors.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: open_anchor_addition_fixes
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: open_anchor_addition_fixes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0017
preserved_exact_tokens:
- Anchor Additions
- '#PROVIDER-TRANSFORM'
- '#ERROR-CLASSIFICATION'
- '#CONTEXT-ASSEMBLY-CACHE-PRESERVATION'
- '#COMPACTION'
- '#COMPACTION-THRESHOLDS'
- '#MCP-INTEGRATION'
- '#SKILLS-TAB'
- '#MODEL-OVERFLOW-DETECTION'
- '#MODEL-RETRY-POLICY'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Anchor additions are repaired audit findings for owner docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-014 - DRY Tightening And Provider Account Model Linkage

```yaml
plan_unit_id: OCM-014
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'DRY tightening preserves repaired Models_System.md overflow/retry anchors #MODEL-OVERFLOW-DETECTION/#OVERFLOW-DETECTION and #MODEL-RETRY-POLICY/#RETRY-POLICY, provider/account/model reconciliation through Plans/CLI_Bridged_Providers.md, /CLI_Bridged_Providers.md, Plans/Multi-Account.md, /Multi-Account.md, Plans/Models_System.md, /Models_System.md, and the disabled_plugins inconsistency between Plugins_System.md section 7.3 and Personas.md section 3.2.'
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_tightening_provider_account_model_linkage
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: dry_tightening_provider_account_model_linkage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0019
preserved_exact_tokens:
- '#OVERFLOW-DETECTION'
- '#RETRY-POLICY'
- Plans/CLI_Bridged_Providers.md
- /CLI_Bridged_Providers.md
- Plans/Multi-Account.md
- /Multi-Account.md
- Plans/Models_System.md
- /Models_System.md
- disabled_plugins
- Plugins_System.md §7.3
- Personas.md §3.2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/account/model reconciliation remains linked to owner docs and does not drift into local matrix rules.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-015 - Doctor Preflight Audit Gap Recommendations

```yaml
plan_unit_id: OCM-015
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'Doctor/preflight gaps remain audit findings only: invalid permission configs, invalid command schemas, skill validation errors, formatter binary availability, plugin manifest validation, and model/provider availability. Specific Doctor additions should be tracked in FinalGUISpec.md Health tab or a dedicated Doctor spec.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: doctor_preflight_audit_gap_recommendations
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: doctor_preflight_audit_gap_recommendations
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0020
preserved_exact_tokens:
- Doctor/Preflight Gaps
- invalid permission configs
- invalid command schemas
- skill validation errors
- formatter binary availability
- plugin manifest validation
- model/provider availability
- FinalGUISpec.md Health tab
- dedicated Doctor spec
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are recommendations/audit findings, not executable tasks.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-016 - Coverage Summary Counts And ContractRefs

```yaml
plan_unit_id: OCM-016
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The OpenCode coverage summary preserves counts Covered 36, Partial 2, Missing 0, examples for run modes, permissions, provider transform/error classification, context handling/compaction, MCP lifecycle, GitHub auth, models, subagents, and LSP, plus the ContractRef to CLI_Bridged_Providers.md and Prompt_Pipeline.md.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coverage_summary_counts_contractrefs
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: coverage_summary_counts_contractrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0021
preserved_exact_tokens:
- Covered
- '36'
- Partial
- '2'
- Missing
- '0'
- Run modes
- permissions
- provider transform/error classification
- context handling/compaction
- MCP lifecycle
- GitHub auth
- models
- subagents
- LSP
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OCM-017 - Matrix Owner Consumer Boundary

```yaml
plan_unit_id: OCM-017
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Plans/OpenCode_Coverage_Matrix.md owns audit/currentness behavior for its preserved sections while cross-doc ownership follows ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: matrix_owner_consumer_boundary
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: matrix_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0022
preserved_exact_tokens:
- Owner / Consumer Map
- Plans/OpenCode_Coverage_Matrix.md
- owner doc
- cross-doc ownership
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The matrix remains an audit/currentness surface, not a product-feature owner for referenced SSOT docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### OCM-001 - OpenCode Coverage Matrix Retired Source-Preserving Bridge

```yaml
plan_unit_id: OCM-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: OCM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 108 because OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 are covered by OCM-002 through OCM-017 or explicit structural, retired, and migration-coverage dispositions. OCM-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained OpenCode Coverage Matrix PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- OCM-002
- OCM-003
- OCM-004
- OCM-005
- OCM-006
- OCM-007
- OCM-008
- OCM-009
- OCM-010
- OCM-011
- OCM-012
- OCM-013
- OCM-014
- OCM-015
- OCM-016
- OCM-017
unblocks: []
acceptance_criteria:
- OCM-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 108.
- OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 coverage is owned by OCM-002 through OCM-017 or explicit structural, retired, and migration-coverage dispositions.
- OCM-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0024
preserved_exact_tokens:
- OCM-001
- OpenCode Coverage Matrix (Audit) Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
negative_constraints:
- OCM-001 must not re-own OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 after Phase 2B batch 108.
- OCM-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- OCM-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former OCM-001 residual source-preserving bridge is retired by Phase 2B batch 108.
owner_boundary_notes:
- OCM-002 through OCM-017 and explicit coverage dispositions own OpenCode Coverage Matrix audit/currentness coverage after bridge retirement.
- OpenCode_Coverage_Matrix-S0023 is a structural PlanUnits heading.
- OpenCode_Coverage_Matrix-S0025 is migration-coverage metadata.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally dispositioned and is now retired.
```

## Migration Coverage

Original hash: `c7890ec1d1237f09c00b1490da11be56051fdd0e936f09e9b6a0d4e87f57fa4b`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 108 atomized source spans `OpenCode_Coverage_Matrix-S0001` through `OpenCode_Coverage_Matrix-S0022` into fine-grained PlanUnits `OCM-002` through `OCM-017`. `OpenCode_Coverage_Matrix-S0023` and `OpenCode_Coverage_Matrix-S0025` are structural metadata dispositions, and `OpenCode_Coverage_Matrix-S0024` is the retired `OCM-001` bridge disposition. `OCM-001` is retired to migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime OpenCode coverage rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d180028c03fc70fb93e6bfb8`: `Plans/CLI_Bridged_Providers.md` now publishes `#PROVIDER-TRANSFORM` and `#ERROR-CLASSIFICATION`; `Plans/Models_System.md` publishes `#MODEL-ERRORS`, `#MODEL-OVERFLOW-DETECTION`, `#OVERFLOW-DETECTION`, `#MODEL-RETRY-POLICY`, and `#RETRY-POLICY`; `Plans/Prompt_Pipeline.md` publishes `#COMPACTION`, `#COMPACTION-THRESHOLDS`, and `#CONTEXT-ASSEMBLY-CACHE-PRESERVATION`; `Plans/Tools.md` publishes `#MCP-INTEGRATION`; and `Plans/FinalGUISpec.md` publishes `#SKILLS-TAB`. This is stable-anchor repair only and creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 evidence.
