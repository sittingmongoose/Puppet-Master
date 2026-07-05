# Puppet Master Plans — Final Implementation-Readiness Audit Report

**Audit date:** 2026-07-04
**Scope:** All 74 canonical `Plans/*.md` docs (~358k lines) plus `Concepts/PMConcept.html` (21k lines).
**Method:** Whole-file end-to-end reads via parallel subagents (no spot-checking); each doc read in full by ≥1 dedicated agent; defects categorized per doc; cross-doc synthesis performed.
**Verdict:** **NOT IMPLEMENTATION-READY.** The corpus is an exceptionally thorough *governance and ownership* layer (1,000+ PlanUnits, dense ownership/routing maps, robust anti-drift discipline), but as a *build specification* for a Rust + Slint rewrite it has systemic blocking gaps. Treat the body of this report as the remediation backlog.

---

## 0. Top-Level Findings (read this first)

### 0.1 Three systemic blockers (apply to nearly every doc)

1. **No concrete Rust types or JSON Schemas anywhere.** Across 74 docs, only a handful of concrete shapes exist: the Slint `Theme` global + `PanelDock` enum (FinalGUISpec §6.5), the `BranchGranularity` enum (WorktreeGitImprovement), one TypeScript-ish `execution_unit_context` block (Prompt_Pipeline §6.4), one `EventEnvelopeV1` 4-field stub (Contracts_V0 §1.3). Every other contract — `EventRecord`, `UICommand`, `AuthState`, `HITLRequest`, `ModelSelectionRouter`, `WorkNodeRequest`, `GoalCompletionReceipt`, `MemoryGist`, the 19 `runtime_artifact_*` payloads, etc. — is described in prose/field-lists only. No doc registers `pm.*.schema.v1` IDs that an implementer can validate against.

2. **GUI wiring is uniformly prose-only.** No doc binds a control to all four required artifacts (command_id + handler + state mutation + Slint binding). FinalGUISpec §7 Views and §8 Widget Catalog defer all Slint signatures, callbacks, model bindings, focus/keyboard contracts, and acceptance criteria. The Wiring Matrix's "0 missing commands" claim is self-verified against `PMConcept_Control_Reconciliation.json` (a concept inventory where **91.7% of controls are pre-excluded as concept-only**), **not** against FinalGUISpec. GATE-010 (the wiring gate) is acknowledged as "future verifier scripts" (UIW-007) — it does not exist yet.

3. **PlanUnit acceptance criteria are source-preservation boilerplate, not behavioral tests.** The vast majority of the 1,000+ PlanUnits carry acceptance criteria like "Covered source spans remain losslessly available for exact-text audit" and "No WorkNodes, NodeSeeds, executable queues, … are created by this PlanUnit." These validate *document migration*, not *runtime behavior*. `validation_surfaces` uniformly list `pm-plan-index.py validate` and `pm-plan-migration.py validate` (doc-structure linters), not test harnesses.

### 0.2 Single most critical defect

**`Contracts_V0.md` has no `### 1.2 EventRecord` section.** The heading numbering jumps `### 1.1` → `### 1.3`. `EventRecord` is the canonical persisted envelope per CV-002, CV-026, CV-044, CV-088 — referenced ~30× across the corpus — yet it has **no field list, no Rust struct, no JSON schema, no required/optional marking, no serialization format**. Every `Contracts_V0.md#EventRecord` deep link is broken. This is the load-bearing artifact for storage-plan, Run_Graph_View, Runtime_Artifacts_Panel, usage-feature, and every seglog consumer. **Blocking everything downstream.**

### 0.3 Headline cross-doc contradictions

| # | Topic | Conflict |
|---|---|---|
| 1 | Selection-priority tier count | Models_System §2 says **6 tiers**; audit-addendum says **1-7 tiers** (`precedence_tier: 1-7`) |
| 2 | Variant-selection priority | Models_System §6.5 says variant = "priority 3"; §7.1 says user picker = "priority 1 override" |
| 3 | Agent caps | orchestrator-subagent-integration has 3 conflicting caps: `20 total`, `100 active agents`, `maxConcurrentCrewsPerPlatform = 4` |
| 4 | Tier model | Retired in OSI-055/OSI-402 but still load-bearing in OSI-076, OSI-135, OSI-385, Run_Modes, GATE-010 evidence |
| 5 | `AvailabilityState` enum | Contracts_V0 §4.4 = 5 values; §4.1 + CV-128 = 4 values (omits `eligible_pending_recheck`) |
| 6 | `wake_reason` | Contracts_V0 has 2 incompatible vocabularies (past-tense "_resolved/_recovered" vs noun forms); CV-215 adds a third |
| 7 | `remediation.resolved.resolution` | Contracts_V0 stated 3 ways; line 2261 excludes `ceiling_exceeded` that line 720 says is "retained" |
| 8 | `## 15.` headings in FinalGUISpec | Duplicated (Persistence vs Promoted Widget Catalog); §15.3 cross-refs ambiguous |
| 9 | `cmd.graph.approve_hitl/deny_hitl` | FinalGUISpec treats as live; UI_Command_Catalog explicitly retires them |
| 10 | `restore_safe_point_then_retry` | UI_Command_Catalog has it as **both** `cmd.orchestrator.*` and `cmd.runtime.*` canonical |
| 11 | LSP lifecycle enum | LSPSupport §14.3 has two lists 4 lines apart: PascalCase `Starting/.../ShuttingDown/Stopped` vs lowercase `...→crashed`, with `RestartBackoff`/`crashed` mismatched |
| 12 | Executor dispatch rule | §2 says lexicographic-only; §6 says scored-algorithm supersedes with lex as tiebreak — §2 never updated |
| 13 | Worktree DRY tag | `DRY:FN:resolve_git_executable` vs `DRY:FN:resolve_git_binary` — both asserted canonical |
| 14 | `auth_surface` enum | Multi-Account §4.2 has two disjoint enums (`oauth\|api_key` vs `header_bearer\|header_api_key\|...`) |
| 15 | `account-profile` schema | Multi-Account defines it 3 ways with different field sets |
| 16 | AC-MED05 disabled_reason | Media doc introduces `UNSUPPORTED`/`CAPABILITY_GATED` which violates its own §1.3 "exactly 6 values, no ad-hoc strings" |
| 17 | plan_graph path | Progression_Gates GATE-001 token = `Plans/plan_graph.json`; Project_Output_Artifacts locks **sharded-only** |
| 18 | Reserved slash-command set | Commands_System CS-037 vs CS-051+§7 body disagree on `/goal`, `/goal again`; `/teach` reservation never finalized |
| 19 | Plugin hooks vocab | Plugins_System §4.1 `tool.execute.before/after` vs addenda `pre_tool_invoke`/`post_tool_invoke` |
| 20 | CV-289/CV-291/CV-299 PlanUnit IDs | Referenced by Decision_Policy DP-063 + plans-index; Crosswalk only defines `C-002..C-050` (no `CV-*` family anywhere) |

### 0.4 Confirmed dangling references (files/anchors that don't exist)

| Reference | Referenced by | Status |
|---|---|---|
| `### 1.2 EventRecord` | Contracts_V0 (intra-doc), 30+ cross-docs | **Missing heading** |
| `docs/platform-hooks.md` | orchestrator-subagent-integration | **File absent** |
| `Plans/WIDGETS_VISUAL_REFERENCE.md`, `WIDGETS_QUICK_REFERENCE.md` | FinalGUISpec | **Files absent** |
| `Plans/Terminal_Integration.md` | Section15 SMPFS-135, Goal_Runtime GRS-039, Automated_Testing ATS-022 | **File absent (3 dangling refs)** |
| `Plans/Context_Management.md` | Prompt_Pipeline PP-069, Plan_Document_System PDS-018 | **File absent** |
| `Plans/Skill_System.md` (note: `Skills_System.md` exists) | Plan_Document_System PDS-018 | **File absent** |
| `Plans/Built_In_Terminal_Runtime.md` | Section15 SMPFS-124 | Proposed-then-never-created |
| `Plans/REQUIREMENTS.md`, `STATE_FILES.md` | MiscPlan §4.1/§3.1 | **Files absent** (cited as SSOTs for runner contract!) |
| `Plans/security-sanitization.md` | assistant-chat-design §28.2 | Proposed-only |
| `Plans/Supply_Chain_Security.md` | Release_Supply_Chain §10 | Proposed-only |
| `Plans/Personas_v0.md` | Section15 §6 | `Personas.md` is the real file |
| `§7.4.5 Settings > SSH`, `§7.4.6 Settings > Debug` | FinalGUISpec line 1608 | Sections absent |
| `§2.2.1` (compaction), `§2.1.2` | storage-plan §7 | Targets wrong/missing sections |
| `§2.5`, `§2.9`, `§10.7`, `§10.9`, `§10.10`, `§13` | FileManager | Internal anchors absent |
| `§9.1` | LSPSupport (referenced 6×) | Section absent |
| `## 4.` parent header | Multi-Account | Missing; §4.1–4.6 orphaned |
| `§6.2`, `§6.4A`, `§7.1`, `§2.4B`, `#approval-ui` | Permissions_System AC-PMs | All dangling |
| `## Canonical Runtime Recovery Command Consolidation (2026-03-09)` | UI_Command_Catalog §2.4 | Heading absent |

---

## 1. Per-Document Defects (summary form — full detail in subagent reports)

Legend: ✅=clean · ⚠️=partial · ❌=not ready

| Doc | Lines | Stubs | Under-designed | Inconsistencies | Impl-gap | GUI-wiring | Verdict |
|---|---:|---|---|---|---|---|---|
| orchestrator-subagent-integration | 31,380 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| FinalGUISpec | 27,040 | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| assistant-chat-design | 23,355 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Contracts_V0 | 19,323 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (CRITICAL) |
| storage-plan | 16,269 | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ | ❌ |
| FileSafe | 13,822 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tools | 12,095 | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| chain-wizard-flexibility | 10,237 | ⚠️ | ⚠️ | ❌ | n/a (retired) | ⚠️ | retired |
| Models_System | 9,233 | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Section15_MVP | 9,212 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Permissions_System | 8,864 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| newtools | 8,604 | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| UI_Command_Catalog | 7,880 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (CRITICAL) |
| LSPSupport | 7,039 | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Executor_Protocol | 6,902 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Media_Generation_and_Capabilities | 6,566 | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MiscPlan | 6,382 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Containers_Registry_and_Unraid | 5,975 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| usage-feature | 5,764 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 00-plans-index | 5,254 | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| WorktreeGitImprovement | 5,103 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Prompt_Pipeline | 5,018 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-Account | 5,018 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| OpenCode_Deep_Extraction | 4,606 | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ (lineage) |
| FileManager | 4,482 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Architecture_Invariants | 4,436 | ❌ (INV-001) | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ (INV-001 blocker) |
| Plugins_System | 4,117 | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Provider_OpenCode | 3,714 | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ (banner lies) |
| Commands_System | 3,680 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Progression_Gates | 3,510 | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| Project_Output_Artifacts | 3,537 | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ |
| Wiring_Matrix | 3,477 | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ (CRITICAL) |
| Personas | 3,444 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ |
| Decision_Policy | 3,366 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Crosswalk | 3,265 | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ | ⚠️ |
| Goal_Runtime_System | 2,983 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| human-in-the-loop | 2,555 | ❌ (3 empty hdrs) | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| MCP_Integration | 2,516 | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | ⚠️ |
| assistant-memory-subsystem | 2,507 | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Skills_System | 2,482 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Provider_Stream_Mapping | 2,163 | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ❌ (self-contradicting) |
| GitHub_Integration | 2,063 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| DRY_Rules | 2,044 | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| Glossary | 2,010 | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ |
| GUI_Rebuild_Requirements_Checklist | 1,833 | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ (no verifier) |
| BinaryLocator_Spec | 1,823 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Runtime_Artifacts_Panel | 1,818 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ (20 schemas missing) |
| Automated_Testing_System | 1,783 | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Document_Packaging_Policy | 1,743 | ✅ | ⚠️ | ⚠️ | ❌ | ✅ | ⚠️ |
| feature-list | 1,581 | ✅ | n/a (inventory) | ⚠️ | n/a | ❌ | ⚠️ |
| Decision_Log | 1,512 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CLI_Bridged_Providers | 1,446 | ✅ | ⚠️ | ✅ | ❌ | ✅ | ⚠️ |
| Planning_Wizard | 1,433 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| newfeatures | 1,212 | ⚠️ | n/a | ⚠️ | n/a | ❌ | ⚠️ (pointer doc) |
| OpenCode_Coverage_Matrix | 1,204 | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | ⚠️ |
| Planning_Ledger_System | 1,165 | ⚠️ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ |
| Run_Modes | 1,103 | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Formatters_System | 1,100 | ✅ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ |
| Run_Graph_View | 1,067 | ❌ (2 empty hdrs) | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| interview-subagent-integration | 1,053 | ✅ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ |
| Widget_System | 1,027 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| Plan_Document_System | 1,010 | ❌ | ⚠️ | ✅ | ❌ | ❌ | ❌ (PDS-018: 12 empty + 3 missing) |
| GitHub_API_Auth_and_Flows | 851 | ✅ | ⚠️ | ✅ | ❌ | ✅ | ⚠️ |
| rewrite-tie-in-memo | 846 | ✅ | ❌ | ✅ | ❌ | ❌ | ⚠️ |
| PRD_Builder | 793 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Release_Supply_Chain | 587 | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| chain-wizard | 578 | ✅ | n/a (retired) | ⚠️ | n/a | n/a | retired |
| UI_Wiring_Rules | 527 | ⚠️ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ (verifier absent) |
| Bootstrap_Planning_Migration | 381 | ✅ | ⚠️ | ✅ | ❌ | ✅ | ⚠️ |

**Tally:** ❌ Not ready = **48 docs** · ⚠️ Partial/conditional = **19** · ✅ Ready = **3** (Decision_Log, DRY_Rules, Glossary) · Retired = **4**

---

## 2. Critical Stubs / Empty Sections (must be filled before code)

- **Contracts_V0 §1.2 EventRecord** — missing heading, missing definition (load-bearing for everything)
- **Contracts_V0 "## Canonical owner-section requirements" (lines 224–285)** — ~15 empty `###` headings
- **human-in-the-loop lines 10–14** — 3 empty canonical-section headers (`Provider-native correlation and approval scope`, `Identity and blocked-policy transfer cluster`, `Approval scope key and approver identity`) sitting on the *most* central HITL topics
- **Run_Graph_View lines 8–11** — 2 empty headers (`Concern linkage to adjacent families`, `Focused run and historical routing contract`) — the latter is the unresolved focus-mode contract that OP- Page depends on
- **Architecture_Invariants INV-001 (lines 25–68)** — 40 lines of raw audit notes masquerading as an invariant; only lines 69–73 are normative
- **Progression_Gates "P5 progression owner recovery requirements"** — raw notes, not normative rules
- **Project_Output_Artifacts "P5 … recovery requirements"** — same raw-notes pattern
- **storage-plan lines 8–47** — ~20 empty owner-section anchor headings
- **FinalGUISpec §7.13/7.14/7.15/7.19/7.20.2** — entire view sections that are 2-4 sentences with no layout/props/callbacks/state model
- **Plugins_System §7.3 "Per-Persona plugin overrides"** — empty heading
- **Multi-Account `## 4.` parent** — missing entirely; §4.1–4.6 orphaned and 4.3/4.4 absent
- **FileManager §9 Tabs** — acknowledged 3-line stub (F-067) covering Editor/Terminal/Browser identity
- **Planning_Wizard/PRD_Builder/Goal_Runtime_System** — `implementation_surfaces` repeatedly list `future *` placeholders
- **Plan_Document_System PDS-018** — explicitly admits "12 empty target-doc rows, pathless aliases, missing placeholders such as Terminal_Integration.md / Context_Management.md / Skill_System.md"

---

## 3. Non-Stubbed But Under-Designed Critical Specs

- **Chat core (assistant-chat-design):** No streaming protocol (chunk schema, event types, transport, backpressure, cancellation); no Rust `enum MessageType`/`struct ChatMessage`/`Attachment`/`ToolCall`/`Citation`; no send lifecycle FSM; no `cmd.chat.send/edit/resend/copy/export/share` command IDs.
- **Executor dispatch:** §2 lexicographic vs §6 scored-algorithm contradiction; `reopened` state appears in readiness rules but not the §3 status lifecycle; "Wake reasons and coalescing" section referenced as canonical owner but absent; 9 receipt types (EP-103) named with no schemas; WorkNodeRecord has 20+ fields and no schema.
- **Goal Runtime:** Four different worker-role vocabularies across GRS-009/010/025/027; two write-mode vocabularies (GRS-017 vs GRS-026); two divergent GoalCompletionReceipt field sets (GRS-012 vs GRS-030); no single lifecycle FSM.
- **Permissions:** "Hardcoded fallback defaults table" (§7) referenced 4× but never defined; full tool-permission-key enumeration (§5) absent; `approval_scope_key` construction algorithm absent; `approval_scope_level` enum absent; closed enum sets for `blocked_reason_code`/`failure_class`/`downgrade_reason` scattered, no consolidated registry.
- **Storage:** redb table/namespace layout undefined for the vast majority of record families; blob store + backup store named but undesigned; compaction, schema-version migrations, capacity/quotas, fsync/commit semantics all asserted but unspecified; 20 `runtime_artifact_*` schemas normative-by-absence (RAP-017).
- **Models:** No JSON schema for capability snapshot; selection algorithm tie-break missing; no fallback precedence rule among eligible routes; Free Models label state-machine transitions undefined.
- **Plan-To-Node Compilation:** PNC-019 admits "static JSON fixtures are not executable proof" — `compiler_contract_complete=true` (PNC-007) is *accepted but unproven*; per-stage algorithms absent despite acceptance criteria demanding them.

---

## 4. GUI Wiring Audit (the user's central question)

### 4.1 PMConcept.html inventory (16 surfaces)
Concept depicts a VSCode-style IDE with 7 page-tabs (Home, Projects, Planning Wizard, Orchestrator, Usage, Agent Config, Settings), an Activity Bar (10 icons), 6+ side panels, editor panes with 3 explicit route kinds (Editor/Workspace/Runtime), a dashboard bento grid, a chat panel, a bottom panel with 6 tabs (Terminal/Problems/Output/Ports/Browser/Debug), a status bar, and detached terminal/floating chat windows. The concept is **demo/fixture content** (sample project names, fake metrics, fake model names, fake run IDs) — all explicitly source-lineage per the index.

### 4.2 Notable concept features that **may need plan coverage** (not all fully covered)
- Three-distinct-route-kind invariant (Editor / Workspace / Runtime) — covered by Section15 §9C.
- `data-command` / `data-state-selector` / `data-disabled-reason-selector` / `data-receipt-effect` attributes (CAS-receipt semantics on Approve And Build) — the **receipt-effect** dimension is not consistently owned by any plan doc.
- Requested-vs-Effective model resolution with fallback reason codes — covered in Models_System/Multi-Account/Prompt_Pipeline but no single canonical schema.
- Browser automation takeover controls (Pause/Let Continue/Stop & Keep Browser) and requested-vs-effective permissions projection (capabilities degradation, blocked_actions, permission_tier, profile_scope, restore_policy, takeover_state) — Section15 names these but no Slint bindings.
- Worktree-per-thread file management — covered by WorktreeGitImprovement + assistant-chat-design W.x.
- Context Lens (Mute/Focus/Subcompact) — assistant-chat-design §17.6 names modes but no `cmd.chat.context_lens.*` command IDs.
- Revert vs Rewind distinction — `cmd.chat.revert`/`cmd.chat.rewind` defined, semantics clear.
- HITL safe-point retry (`cmd.runtime.approve`, `cmd.runtime.restore_safe_point_then_retry`) — defined.
- Run Budget strategies (DAE/HTE) and outcomes (OK/BUDGET/ROTATED/DEFERRED) — Run_Modes owns these.
- Crew Mode + batch fanout — orchestrator-subagent-integration owns but wave policy fields unvalued.
- Slash command → command mapping — partially in Commands_System but `/teach` status undefined.

### 4.3 Plans features **not** reflected in the concept
- **Docker/Hosts page** (CRAU-092) — concept shows Docker Manager as a side panel; the dedicated Docker/Hosts routed page with 7 subviews is a plan-side addition (correctly, per index "concept is source-lineage only").
- **First-Run Onboarding flow** (F3-411, UCC-106) — concept depicts the *steady-state* IDE, not the first-run wizard.
- **Goal Mode chip + worker/verifier selectors** (GRS, F3-393) — concept shows the chat composer but no Goal chip specifically.
- **Notifications & Sounds settings destinations** (F3-405) — concept Settings page groups don't include Notifications explicitly.
- **DRY Method settings toggle** (F3-406) — not separately depicted.
- **Vision Bridge / Teach guided overlay** (F3-403, ACD-425/426) — concept has chat /help but not the guided overlay spotlight UI.
- **Free Models "Refresh Models"** (F3-408) — concept Agent Config > Models shows media generation checkboxes but no Free Models refresh button.
- **Capability-lane selectors** (F3-394) — concept doesn't expose the 6 capability-lane bindings explicitly.
- **Bundle controls** (F3-399) — concept doesn't show a bundle approval gate.
- **Annotations/Notes inline mode** (FinalGUISpec §7.18.1) — concept doesn't depict inline note markers.

### 4.4 GUI wiring gaps by surface (every control needs command_id + handler + state mutation + Slint binding)

| Surface | Controls w/ partial-or-no wiring |
|---|---|
| Chat composer | `cmd.chat.send`, `edit`, `resend`, `copy`, `export`, `share`, `submit`, `follow`, `steer`, queue-add/edit/send-now/cancel, attachment add/remove/reorder, mentions chip remove — **none** have command IDs in assistant-chat-design |
| Search panel | 13 of 14 `cmd.search.*` IDs asserted canonical by FinalGUISpec are **absent** from UI_Command_Catalog |
| Orchestrator node detail | `cmd.orchestrator.replan_node/open_for_edit/abort_node` (FinalGUISpec §Blocked-State) — **not in catalog** |
| HITL approval | `cmd.graph.approve_hitl`/`deny_hitl` — FinalGUISpec treats as live; catalog retires them; no replacement wired |
| Browser toolbar | `cmd.browser.open_detached_preview`, `focus_browser_tab` — uncataloged |
| Terminal | `cmd.terminal.open`, `show` — uncataloged |
| System Tray | Show/Hide, Pause/Resume, Quit — no command IDs at all |
| Dashboard | Add Widget flow — no command ID |
| Theme selector | Create/Import/Export/Open themes folder — no command IDs |
| Annotation mode | Add Note, category selector, resolve — no command IDs |
| Bundle controls | Resubmit, final-approval gate — no command IDs |
| Question card | 5-state lifecycle — no command IDs |
| Permission card | Once/For Session/Deny/Always ladder — no command IDs |
| Plan Panel | Structural editing controls (pre-approval) — no command IDs |
| Visualizer host bridge | postMessage handler signatures on Rust side — unspecified |
| First-run wizard | 4 screens with full copy — zero command IDs, zero Slint tree |
| Notifications settings | 5 destination forms — no command IDs |
| Free Models | Refresh Models button — no command ID |
| Goal Mode | worker/verifier selectors — no command IDs |
| Capability lanes | 6 lane bindings — no command IDs |
| Teach/Teacher overlay | Back/Next/Stop/Let me try/Do it/Start walkthrough/Show sources/Save/Hand off — no command IDs |
| Goal chip (chat) | pause/resume/stop/clear/update/show-tasks/show-subgoals/show-evidence — no `cmd.chat.goal.*` IDs |
| Vision bridge | inspect/rerun/copy/attach/manage-permission — no command IDs |
| Memory panel | verify/edit/pin/discard/toggle — command IDs named but no Slint bindings |
| Testing panel | 5 command IDs named but no Slint bindings |
| Source Control | many `cmd.git.*` named but no arg schemas / when-clauses |
| Worktree list/recover | topology + safe actions required; list/recover UI marked Optional — boundary unclear |
| File context menu | ~10 actions, only some have `cmd.file.*` IDs |
| LSP | Restart button, F12/Shift+F12/F2/Shift+Alt+F/Ctrl+Space, Problems link — **zero** command IDs |
| Plugins tab | Plugin list enable/disable/add/remove — **zero** `cmd.plugins.*` IDs |

---

## 5. PMConcept ↔ Plans Reconciliation Summary

### Concept depicts; Plans cover
Editor/Workspace/Runtime route split; Activity Bar; chat composer basics; orchestrator 6-tab shell (Progress/Plan Compile/Node Graph/Evidence/History/Ledger + Seams); usage 4-tab (Overview/Analytics/Providers/Ledger); agent-config sections; settings 5-group sidebar; bottom panel 6-tab; worktree-per-thread; revert-vs-rewind; safe-point retry; HITL approve step; provider cards with requested/effective disclosure.

### Concept depicts; Plans **under-cover**
Browser permissions projection (degradation/blocked_actions/permission_tier/profile_scope/restore_policy/takeover_state) — named in Section15 §1.3A but no Slint binding; Chat context-usage hover module + Compact Now — covered but no `cmd.chat.compact_now` handler signature; Crew Mode 3-model example — orchestrator-subagent-integration owns but fanout thresholds unvalued; Status bar `[i]` menu MCPs/LSPs/Plugins/SSH/remote badges — multiple owners but no single state machine.

### Plans own; Concept does **not** depict
Docker/Hosts routed page; First-Run Onboarding; Goal Mode chip; Notifications settings; DRY Method settings toggle; Vision Bridge; Teach guided overlay; Free Models refresh; Capability-lane selectors; Bundle approval gate; Annotation/Notes inline mode.

---

## 6. Per-Document Detail

The per-document detailed defects from each subagent audit are summarized in §1 above. Below are the key headline defects per critical doc; full granular line-level findings were captured in the audit work and can be re-extracted on request for any specific doc.

### Contracts_V0.md (CRITICAL — load-bearing)
- **Missing §1.2 EventRecord** (heading skips 1.1 → 1.3); no Rust struct, no JSON schema, no required/optional marking.
- `## Canonical owner-section requirements` (lines 224–285) — ~15 empty `###` headings.
- ~15 PlanUnits (CV-282/283/301/302/303/304/306/307/308) name envelopes/event families by field-name tokens only with no types/enums; CV-282 and CV-308 admit "no schema, no event family, no storage keys."
- Enum contradictions: AvailabilityState 4 vs 5 values; wake_reason 2 vocabularies; remediation.resolved.resolution 3 statements.
- `schema_version` required by CV-006 prose but absent from actual envelope definitions.
- 9 dangling `working_ledger.md:L###` refs.
- §7.2 WiringEntry referenced (line 16813) but `### 7.2` is "UICommand envelope rules," not WiringEntry.

### UI_Command_Catalog.md (CRITICAL — wiring SSOT)
- 6 command families exist ONLY as PlanUnit prose / bare bullets: Notifications/Sounds (15 IDs), Onboarding (9), Docker Hosts (11), History (~20 actions), Vision Bridge, Teach. Zero payload/event/precondition rows.
- `/web` family (6 IDs) — no rows. `cmd.debug.*` (10 IDs) — fully deferred to Commands_System.
- Missing IDs referenced elsewhere: `cmd.chat.send/stop/share/web.help`, `cmd.search.{set_scope,previous_result,next_result}`, `cmd.orchestrator.replan_node/open_for_edit/abort_node`, `cmd.terminal.open/show`, `cmd.browser.open_detached_preview/focus_browser_tab`, `cmd.panel.switch` (no row).
- No row carries required columns: `command_kind`, `normalization.kind`, `disabled-reason`, `state-selector`, `handler_location`.
- Duplicate GitHub Actions table (lines 561-609) drops the legacy-alias canon.
- Dual-canonical `restore_safe_point_then_retry` (orchestrator + runtime).
- §2.4 "Run Graph commands" stub defers to non-existent heading `## Canonical Runtime Recovery Command Consolidation (2026-03-09)`.

### FinalGUISpec.md
- Duplicate `## 15.` (Persistence vs Promoted Widget Catalog); duplicate `### 7.4.2`.
- Dangling internal: `§7.4.5/§7.4.6` (Settings SSH/Debug), `§15.3` ambiguous.
- §7 Views and §8 Widget Catalog defer all Slint signatures/callbacks/model bindings/focus-keyboard contracts/acceptance criteria.
- 27 user-visible controls described in prose only (first-run wizard, notifications, capability lanes, Teach overlay, bundle controls, etc.).
- `WIDGETS_VISUAL_REFERENCE.md` and `WIDGETS_QUICK_REFERENCE.md` referenced 5× — files don't exist.
- ~13 of 14 `cmd.search.*` IDs asserted canonical are absent from catalog; remediation-ceiling orchestrator commands and `cmd.graph.approve_hitl/deny_hitl` likewise.
- Settings tab count contradiction (19 canonical vs stale "24" still in §17 risk table).

### assistant-chat-design.md
- Empty §7.3, empty owner-section headers (lines 8-9), empty §23.5.
- Streaming protocol undefined; cross-ref to §12 (Context usage) is broken (no streaming content there).
- No Rust types (`ChatMessage`, `Attachment`, `ToolCall`, `Citation`); no Slint binding contract; no send FSM.
- 27 distinct chat controls have no command IDs (only `cmd.chat.stop/revert/rewind/add_file_reference/compact_context/focus_thread_usage/new/web.*/worktree.*` exist).
- §6 referenced for export, §11 for share, §12 for streaming — all broken (§6=Teach, §11=Threads, §12=Context usage).
- `changeTracking.status` enum conflict (`new/same/changed/removed` vs `changed/unchanged/no_previous_version`).
- `Decision #9` referenced 3× for `response_kind`/`validation_state` lock — no decision registry anchor.

### orchestrator-subagent-integration.md
- 5 stubbed verification functions (`validate_config_wiring_for_tier`, `check_gui_backend_mapping`, etc.) — empty bodies, gate depends on them.
- ~431 PlanUnits; acceptance criteria uniformly process boilerplate ("No WorkNodes created").
- Tier model simultaneously retired (OSI-055/402) and load-bearing (OSI-076/135/385).
- 3 conflicting agent caps (20 vs 100 vs 4).
- `platform_specs::*` and `subagent_registry::*` function signatures mandated but undefined.
- `@message`/`@ask` parser has no grammar.
- `docs/platform-hooks.md` referenced — file absent.
- Persona "explore" vs "explorer" normalization un-audited.
- `active-agents.json` simultaneously canonical and retired.

### storage-plan.md
- redb table/namespace layout undefined for ~50+ record families (only 7 named).
- Blob store + backup store named but undesigned.
- Compaction, schema-version migrations, capacity/quotas, fsync/commit semantics asserted but unspecified.
- §2.2.1 (compaction) and §2.1.2 — broken internal refs.
- `active-agents.json` canonical-status unresolved.
- `dashboard_layout:v1` referenced but never defined.

### Permissions_System.md
- "Hardcoded fallback defaults table" (§7) referenced 4× — never defined.
- Full tool-permission-key enumeration (§5) — stub.
- `approval_scope_key` algorithm + `approval_scope_level` enum — absent.
- Dangling intra-doc refs: §6.2, §6.4A, §7.1, §2.4B, `#approval-ui`.
- 3-action model (allow/ask/deny) vs 4-tier ladder (deny/once/for session/always) never formalized.
- AC-PM10 "all mutating tools deny in plan mode" contradicts plan-mode web/todowrite carve-outs.
- `doom_loop` threshold: AC literal "3" vs §10.6 range "2-10".

### Executor_Protocol.md
- 4 empty owner-section headers at top (lines 8-14); §5 introduction missing; "Wake reasons and coalescing" section referenced but absent.
- §2 lexicographic-only dispatch vs §6 scored-algorithm — §2 never updated.
- `reopened` state in readiness rules but not in §3 lifecycle.
- 9 receipt types (EP-103) named with no schemas.
- WorkNodeRecord (EP-105) 20+ fields, no schema.
- 3 near-identical "Canonical Alignment" addenda with subtle drift.

### Goal_Runtime_System.md
- 16 of 20 GRS PlanUnits have `implementation_surfaces: [future Goal Mode service, future ...]`.
- 4 different worker-role vocabularies (GRS-009/010/025/027).
- 2 different write-policy vocabularies (GRS-017 vs GRS-026).
- 2 divergent GoalCompletionReceipt field sets (GRS-012 vs GRS-030).
- No single canonical lifecycle FSM.
- GRS-039 references `Terminal_Integration.md` — absent.

### Plan_To_Node_Compilation.md
- PNC-019 admits "static JSON fixtures are not executable proof" yet PNC-007 certifies `compiler_contract_complete=true`.
- 3 readiness flags (`runtime_enabled`, `compiler_contract_complete`, `executable_lifecycle_certification_complete`) — no truth table.
- v1 schema_id holds both `design_only` and `native_runtime` branches — contradictory.
- 2 divergent WorkNodeRequest field lists (PNC-013 vs PNC-016).
- H-001 references undefined `CV-290`.
- Per-stage algorithms absent despite acceptance criteria demanding them.

### WorktreeGitImprovement.md
- `DRY:FN:resolve_git_executable` vs `resolve_git_binary` — both asserted canonical.
- `Orphaned`/`orphaned` enum ambiguity.
- Missing §2.7; broken 7.x heading hierarchy.
- Unresolved granularity decision (§7.7/7.14 vs W-027/Phase 4).
- Only `BranchGranularity` is a concrete Rust type.

### Multi-Account.md
- Missing `## 4.` parent; §4.3/§4.4 absent entirely; §4.6 misplaced after §5-7.
- 3 conflicting `account-profile` schemas (15-field vs 16-field vs 8-field).
- 2 disjoint `auth_surface` enums.
- `credential_ref` vs `credential_locator`; `label` vs `display_name` vs `display_identity` — unresolved aliases.
- `CredentialRouteEpoch` (MA-067) named-as-missing.

### Models_System.md
- 6 vs 7 precedence tiers; variant-priority contradiction (priority 3 vs priority 1).
- 3 different Z.AI surface IDs (`zai-coding-plan`, `zai_coding_plan`, `zhipuai-coding-plan`).
- §4.4 empty heading; §3.1/§3.2 TOML-only stubs.
- 12 new contract types (MS-123..MS-133) named with no Rust types/schemas.
- No command IDs for any GUI action (model pickers, capability lanes, Free Models refresh).

### FileSafe.md
- Non-compiling stubs: `check_sql_injection`, `check_filesafe`, `GuardRateLimiter`.
- `GuardError::SymlinkResolution` constructed but absent from enum.
- 2 contradictory `is_interview_operation` impls.
- `commands_match` prefix-matching contradicts AutoDecision ban.
- `FileSafeEvent` missing 4 fields later addenda mark canonical.
- `BashGuard::disabled()` fail-open contradicts fail-closed canon (F2-155).
- No Windows handling, no test vectors.

### LSPSupport.md
- §14.3 lifecycle enum contradiction (PascalCase vs lowercase, 4 lines apart).
- Crash-backoff: 1s/2s/4s cap 30s vs 2s/4s/8s max 3 attempts.
- §9.1 referenced 6× — section absent.
- §14.7 misreferenced for virtual documents (actually §14.8).
- 13 architecture types named with no signatures/traits.
- Zero command IDs for any LSP GUI surface.

### Commands_System.md
- Duplicate `## 7.` headings (acknowledged by CS-050, unfixed).
- Empty `### 6.3 Shortcut binding`.
- Broken §6 ordering (6.6 before 6.1).
- CS-037 vs CS-051+§7 reserved-set drift on `/goal`, `/goal again`.
- `/teach` reservation status undefined.
- `persona` vs `persona_override` field-name split unresolved.
- AC-CMD06 `task` tool not defined in §4.2.
- Zero UICommand IDs for §6 GUI (create/edit/delete/save/preview).
- No JSON schema for command frontmatter.

### Prompt_Pipeline.md
- Missing `#COMPACTION` anchor (referenced by AC-PP02).
- PP-042 dispatch-boundary SSOT fracture unresolved.
- PP-039/PP-043 stale tier vocabulary in live body.
- 19 PlanUnits (PP-054..PP-072) introduce types with no schemas/Rust (ContextEpoch, HistoryAdmissionGate, PromptCacheStabilityLinter, ContextCatalogBudget, InstructionSetEpoch).
- PP-069 references `Context_Management.md` — absent.
- Only AC-PP01 and AC-PP02 exist for the entire SSOT.

### Provider_OpenCode.md
- Compliance banner line 4 ("No open questions") directly contradicted by P5 findings lines 74-97.
- Admitted contract-level `thread_id` mapping bug vs CLI_Bridged_Providers.
- PO-050/PO-051 research-mode PlanUnits.
- SSE correlation fields admitted under-specified.

### Provider_Stream_Mapping (A2A).md
- Self-auditing doc that records its own contradictions in PSMERA-025.
- `attempt_id` required by 2026-03-09 addenda but absent from reserved diagnostic schemas.
- `provider_attempt_ref?` slot named-but-unowned.
- `tier_boundary` stale semantics embedded at stream-schema layer.

### Runtime_Artifacts_Panel.md
- `runtime_artifact_envelope.schema.json` + 19 per-type schemas normative-by-absence (RAP-017).
- §2 and §5 parent headings missing (acknowledged in RAP-025, unfixed).
- 2 different `artifacts_index` key spellings.

### Plugins_System.md
- Duplicate `### 3.2` headings.
- Empty `### 7.3` section.
- `tool.execute.*` vs `pre_tool_invoke`/`post_tool_invoke` hook vocabularies unreconciled.
- Zero `cmd.plugins.*` IDs for Plugins tab GUI.
- PLUG-063 typed-extension-point contract named-but-undefined.

### MiscPlan.md
- `PlatformRunner` trait extension contradicted §4.7 vs §4.8.
- `list_skills_for_agent` stubbed.
- REQUIREMENTS.md / STATE_FILES.md cited as SSOTs — files absent.
- Missing §9.1.20; duplicate References/Implementation-status sections.
- Slint key-event integration point undecided.
- Skills tab + Cleanup subsection placement undecided.

### Containers_Registry_and_Unraid.md
- Empty headers (Tag template resolution, ca_profile round-trip, Known-field registry, Distribution model).
- 3 divergent K8s command/reason-code enumerations.
- `RuntimeHostFamilyProfile` schema undefined (deferred to "future ... fixtures").
- Docker/Hosts route payload has no handler registration.

### Tools.md
- `patch`, `multiedit`, `list` registered but no runtime contract.
- `GitHubApiTool` 14-line stub.
- `media.generate`/`capabilities.get`/`vision_bridge` no schemas or permission rows.
- Duplicate §10-§13 top-level headings.
- 6 P0/P1 PlanUnits (T-167..T-175) name state machines with no fields/transitions.
- Unresolved `gap-001/002/004/005/006` with explicitly broken anchors.

### usage-feature.md
- "8-kind blocked-owner taxonomy" and "5-level escalation ladder" referenced 12+ times — never enumerated.
- Only 1 command ID defined for the entire Usage feature (`cmd.nav.open_usage_subject`).
- `cost_usd` canonical-status contradiction.
- `usage.jsonl` canonicality asserted both ways.

### Section15_MVP_Promoted_Features_Spec.md
- SMPFS-137 placeholder title (`### SMPFS-137 - SMPFS-137`).
- §3.18 orphaned schema stub (bare `Fields:`/`Labels:`/`Rules:` tokens).
- §3.18 canonical browser action table — header with zero rows.
- 9 terminal structs named with no fields (SMPFS-124..136).
- `Terminal_Integration.md` dangling ref.

### Architecture_Invariants.md
- INV-001 (lines 25-68) — raw audit notes; only lines 69-73 normative.
- INV-020..INV-026 referenced but PlanUnits not visible in read range.
- AI-005 ContractRef missing `Plans/` prefix.

### human-in-the-loop.md
- 3 empty canonical-section headers (lines 10-14) on approval scope, approver identity, provider-native correlation.
- HITL-030 action family enum missing `fresh_attempt`.
- Action family vs UICommandID (`cmd.runtime.approve`) relationship undefined.
- "Option B" reference opaque.

### Progression_Gates.md
- "P5 recovery" raw notes (lines 27-78).
- GATE-011/012/013/014 explicitly un-enforced.
- GATE-001 path token (`plan_graph.json`) contradicts sharded-only decision.
- `tier_id` in GATE-010 evidence conflicts with tier retirement.

### Project_Output_Artifacts.md
- "P5 recovery" raw notes.
- Self-admitted under-specified open-by-artifact-identity contract (line 50).
- Pointer-stub format + seglog hash algorithm unspecified.
- Cross-doc inconsistency with Progression_Gates over `plan_graph.json`.

### Release_Supply_Chain.md
- Line 565 explicitly disclaims schema materialization; line 585 admits governance outputs "pending seal phase."
- 7 PlanUnits are gate/policy statements, not implementable contracts.
- References absent `BinaryLocator_Spec.md` and proposed `Supply_Chain_Security.md`.

### Plan_Document_System.md
- PDS-018 admits 12 empty target-doc rows + missing placeholders (`Terminal_Integration.md`, `Context_Management.md`, `Skill_System.md`).
- `finding_key` hash algorithm unspecified (concatenation order, delimiter, hash function, list canonicalization).
- PDS-007 GUI-model routing setting has no command ID, no Settings key, no Slint binding.

### FileManager.md
- §9 Tabs acknowledged 3-line stub (F-067).
- Internal anchors §2.5, §2.9, §10.7, §10.9, §10.10, §13 absent.
- ~15 interactive controls named without UICommandIDs.
- External PlanUnit deps `F2-188`, `F3-399`, `T-160`, `F2-191`, `ATS-011` dangle.

### Wiring_Matrix.md
- 4 PlanUnits (WM-037/039/040/041) explicitly "do not generate wiring JSON" for Goal/Notifications/DRY Method/Onboarding CTAs.
- Coverage claim self-verified against PMConcept inventory (91.7% pre-excluded), not FinalGUISpec.
- Production artifacts (`Wiring_Matrix.schema.json`, `Wiring_Matrix.production.json`, `Wiring_Matrix.production.exclusions.json`, `PMConcept_Control_Reconciliation.json`) and `puppet-master-rs/src/` tree presence unconfirmed.

### UI_Wiring_Rules.md
- UIW-007 verifier scripts explicitly "future" — GATE-010 not enforced.
- 9-check verification program defined but unbuilt.

### GUI_Rebuild_Requirements_Checklist.md
- All verification-table rows unchecked `[ ]`.
- GRRC-015 completion criteria tautological until GATE-010 verifiers exist.

### Plugins_System, Skills_System, MCP_Integration, Personas, etc.
(See §1 table — these have moderate gaps, mostly missing Rust types/schemas and GUI command IDs.)

---

## 7. Recommended Remediation Order (39 steps in 4 phases)

### Phase 0 — Unblocking (must precede anything else)
1. **Contracts_V0 §1.2 EventRecord**: write the missing section + Rust struct + JSON schema.
2. **Fill Contracts_V0 owner-section stubs** (lines 224–285, ~15 empty headings).
3. **Reconcile** AvailabilityState / wake_reason / remediation.resolved.resolution / `schema_version` placement in Contracts_V0.
4. **Create missing owner docs or explicit redirects**: `Terminal_Integration.md` (or fold into Section15), `Context_Management.md` (or fold into Prompt_Pipeline), and decide `Skill_System.md` vs `Skills_System.md`.
5. **Add `EventRecord` deep-link target** so the 30+ `#EventRecord` refs across the corpus resolve.

### Phase 1 — GUI wiring backbone
6. **UI_Command_Catalog**: promote 6 prose-only families to real rows (Notifications/Sounds, Onboarding, Docker Hosts, History, Vision Bridge, Teach) + fill `/web` + `cmd.debug.*` payload/event/precondition columns.
7. **UI_Command_Catalog**: resolve `cmd.graph.approve_hitl/deny_hitl` retirement + the dual `restore_safe_point_then_retry` ownership + the missing `cmd.chat.send/edit/resend/copy/export/share` + 13 of 14 `cmd.search.*` + `cmd.orchestrator.replan_node/open_for_edit/abort_node`.
8. **UI_Command_Catalog**: add required per-row columns (`command_kind`, `normalization.kind`, `disabled-reason`, `state-selector`, `handler_location`).
9. **Build GATE-010 wiring verifier** (UIW-007) — schema-validate `Wiring_Matrix.production.json` against `Wiring_Matrix.schema.json` and verify every FinalGUISpec control maps to a row.
10. **FinalGUISpec**: repair duplicate `## 15.` and `### 7.4.2` headings; resolve `§7.4.5/§7.4.6/§15.3` dangling internal refs; either create `WIDGETS_VISUAL_REFERENCE.md`/`WIDGETS_QUICK_REFERENCE.md` or remove refs.
11. **FinalGUISpec §7/§8**: emit Slint `export component` signatures, callback signatures, `VecModel<T>` row types, focus/keyboard contracts, icon asset refs per view/widget.

### Phase 2 — Critical-spec schema materialization
12. **storage-plan**: define redb table/namespace layout per record family; specify blob store + backup store; specify compaction + schema-version migration + capacity/quotas + fsync/commit; fix §2.2.1/§2.1.2 dangling refs; define `dashboard_layout:v1`.
13. **Runtime_Artifacts_Panel**: materialize `runtime_artifact_envelope.schema.json` + 19 per-type schemas (RAP-017).
14. **Permissions_System**: write the missing defaults table (§7); enumerate tool permission keys (§5); specify `approval_scope_key` algorithm + `approval_scope_level` enum; consolidate error-code registry; fix §6.2/§6.4A/§7.1/§2.4B/`#approval-ui` dangling refs.
15. **Goal_Runtime_System**: write single canonical worker-role enum, write-policy enum, GoalCompletionReceipt struct, lifecycle FSM; fix GRS-039 `Terminal_Integration.md` ref.
16. **Executor_Protocol**: fix §2 vs §6 dispatch-rule contradiction; add `reopened` to §3 lifecycle; write "Wake reasons and coalescing" section; add JSON schemas for the 9 receipt types + WorkNodeRecord + execution_unit_context.
17. **Models_System**: resolve 6-vs-7 tier count and variant-priority contradiction; write capability snapshot JSON schema; write selection tie-break rule; canonicalize Z.AI surface ID.
18. **FileSafe**: fix non-compiling stubs (`check_sql_injection`, `check_filesafe`, `GuardRateLimiter`); add `SymlinkResolution` variant to enum; reconcile `commands_match` prefix-matching vs AutoDecision ban; reconcile `is_interview_operation` two impls; complete `FileSafeEvent` field set; add Windows path handling; add test vectors; wire Slint callbacks.
19. **LSPSupport**: fix lifecycle enum contradiction (§14.3 lines 657 vs 661); reconcile crash-backoff; create §9.1; fix §14.7 misref; reserve `cmd.lsp.*` IDs.
20. **Multi-Account**: restore `## 4.` parent; reconcile `account-profile` 3 schemas; reconcile `auth_surface` 2 enums; canonicalize `credential_ref` vs `credential_locator` and `label`/`display_name`/`display_identity`; specify `CredentialRouteEpoch`.
21. **Commands_System**: repair duplicate `## 7.` heading; fill empty `### 6.3`; fix §6 ordering; reconcile CS-037 ↔ §7 ↔ CS-051 reserved set; finalize `/teach`; decide `persona` vs `persona_override`; reserve `cmd.*` IDs for §6 GUI; write frontmatter JSON schema.
22. **Prompt_Pipeline**: add `#COMPACTION` anchor; rewrite §1.1/§1.2/§6.2 to node/package/lane/seam model; write Rust types/schemas for PP-054..PP-072; fix PP-069 `Context_Management.md` ref.
23. **Plan_To_Node_Compilation**: resolve v1-vs-v2 schema_id; reconcile 3 readiness flags; reconcile 2 WorkNodeRequest field lists; fix `CV-290` dangling ref; write per-stage algorithm cards.
24. **WorktreeGitImprovement**: resolve `resolve_git_executable` vs `resolve_git_binary` tag; fix `Orphaned`/`orphaned` ambiguity; restore §2.7; fix 7.x heading hierarchy; decide granularity-driven branching.

### Phase 3 — Smaller fixes
25. **Plugins_System**: repair duplicate §3.2; fill empty §7.3; reconcile `tool.execute.*` vs `pre_*/post_*` hooks; reserve `cmd.plugins.*`.
26. **Provider_OpenCode**: fix compliance-banner contradiction (line 4 vs P5 findings lines 74–97); resolve `thread_id` mapping bug vs CLI_Bridged_Providers.
27. **Provider_Stream_Mapping**: resolve `attempt_id`/diagnostic-schema contradiction (PSMERA-025).
28. **Tools**: add contracts for `patch`/`multiedit`/`list`; expand `GitHubApiTool` stub; add schemas for `media.generate`/`capabilities.get`/`vision_bridge`; close `gap-001/002/004/005/006`; fix duplicate §10–§13; define ToolTurnSettlement FSM.
29. **Section15_MVP**: repair orphaned §3.18 schema stub; populate browser-action table; fix `Terminal_Integration.md` ref; define per-action error codes; reserve `cmd.*` IDs for promoted features.
30. **Containers_Registry_and_Unraid**: fill empty headers; resolve K8s `select_*` vs `set_*` and 3 reason-code enums; define RuntimeHostFamilyProfile schema; enumerate `cmd.docker.*` family.
31. **MiscPlan**: reconcile `PlatformRunner` trait contradiction §4.7 vs §4.8; resolve REQUIREMENTS.md/STATE_FILES.md absence; restore §9.1.20; dedupe References; pin Skills tab + Cleanup subsection placement; pin Slint key-event integration point.
32. **usage-feature**: enumerate the 8-kind/5-level escalation taxonomy; wire widget command IDs; resolve `cost_usd` canonical-status contradiction.
33. **Progression_Gates**: rewrite "P5 recovery" raw notes; implement GATE-011/012/013/014; reconcile GATE-001 path token with sharded-only decision; retire `tier_id` from GATE-010 evidence.
34. **Project_Output_Artifacts**: rewrite "P5 recovery"; resolve open-by-artifact-identity (line 50 self-admission); specify pointer-stub format + seglog hash algorithm.
35. **Architecture_Invariants**: rewrite INV-001 as normative rules.
36. **human-in-the-loop**: fill 3 empty canonical-section headers (lines 10–14); define `fresh_attempt` action family; reconcile `cmd.runtime.*` vs action family; resolve "Option B" reference.
37. **FileManager**: fill §9 Tabs stub; create §2.5, §2.9, §10.7, §10.10, §13 (or remove refs); pin ~15 `cmd.file.*` IDs.
38. **All remaining**: reserve concrete UICommandIDs per surface (Memory panel, Testing panel, LSP, Plugins, Formatters config card, BinaryLocator manual-path toggle, Personas CRUD, etc.).
39. **Governance cleanup**: fix `CV-289/291/299` PlanUnit-ID form (Crosswalk has no `CV-*` family); retire `chain-wizard*.md` references in 0PI-026/027/056 + DP-033/034; fix 0PI-066 placeholder title; fix stray ContractRef prose lines after 0PI-057/058.

---

## 8. Conclusion

The Puppet Master Plans corpus is a genuinely impressive governance artifact — ownership boundaries, anti-drift discipline, source-lineage preservation, and routing maps are best-in-class. **But it is not a build spec.** Three systemic blockers (no Rust types/JSON schemas, prose-only GUI wiring, source-preservation acceptance criteria) plus a handful of critical single defects (notably the missing `EventRecord` definition) mean an implementer cannot today sit down and write Rust/Slint code from these docs without reversing-engineering most of the contract surface.

Recommended path: execute Phase 0 (3-5 day unblock) → Phase 1 GUI backbone (1-2 weeks) → Phase 2 schema materialization (3-4 weeks, parallelizable) → Phase 3 cleanup (1 week). Only after Phase 0+1 should code work begin in earnest.
