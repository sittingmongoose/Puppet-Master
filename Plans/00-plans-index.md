# Plans Index (authoritative map)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.

## Anti-drift layer (required reading order)
To prevent agent drift while building Puppet Master autonomously, these are the **canonical SSOT** inputs and gates. Other plans MUST reference these instead of redefining them.

1. `Plans/Spec_Lock.json` — locked decisions + schema version pins + SSOT hashes
2. `Plans/Contracts_V0.md` — canonical contracts (event envelope, tool events, UICommand, auth)
3. `Plans/Crosswalk.md` — ownership boundaries for primitives
4. `Plans/DRY_Rules.md` — DRY + ContractRef rule (no unreferenced operational requirements)
5. `Plans/Glossary.md` — canonical terms (platform naming, primitives)
6. `Plans/Decision_Policy.md` — deterministic decision policy + SpecLock Update Protocol
7. Machine-checkable schemas (doc-linked artifacts):
   - `Plans/plan_graph.schema.json` + `Plans/plan_graph.json` (self-build plan graph; required node execution metadata + deterministic `execution_ordering`)
   - `Plans/project_plan_graph_index.schema.json` + `Plans/project_plan_node.schema.json` (user-project sharded plan graph; required node execution metadata + deterministic `execution_ordering`)
   - `Plans/contracts_index.schema.json` (user-project contract pack index)
   - `Plans/acceptance_manifest.schema.json` (user-project acceptance manifest)
   - `Plans/evidence.schema.json` (evidence bundle)
   - `Plans/change_budget.schema.json` (change budget)
   - `Plans/auto_decisions.schema.json` + `Plans/auto_decisions.jsonl` (autonomous decisions)
   - `Plans/Wiring_Matrix.schema.json` (wiring matrix entries)
8. `Plans/UI_Command_Catalog.md` — stable UI command IDs (layout may change; command IDs do not)
9. `Plans/Architecture_Invariants.md` — architecture invariants (autonomous checks)
10. `Plans/Progression_Gates.md` — deterministic PASS/FAIL gates + Verifier role
11. `Plans/Executor_Protocol.md` — deterministic next-ready selection + role boundaries + auto mark-done semantics
12. Verifier command: `python3 scripts/pm-plans-verify.py run-gates`

**Scope boundary (do not conflate):**
- `Plans/plan_graph.*` is for **Puppet Master self-build** plan nodes.
- User-project output artifacts live under `.puppet-master/project/*` and are specified by `Plans/Project_Output_Artifacts.md`.

## Rewrite tie-in (2026-02-21)

The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) → projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust + Slint (winit; Skia default)
- **Auth**: subscription-first; **Gemini API key is an explicit allowed exception** (subscription-backed)

See: `Plans/rewrite-tie-in-memo.md`.

## Plan map

| Plan | Primary scope | Notes / canonical intent |
|------|--------------|--------------------------|
| `rewrite-tie-in-memo.md` | Locked rewrite decisions | Canonical for rewrite constraints + deltas to apply elsewhere |
| `agent-rules-context.md` | Application/project rules pipeline | Canonical for rules sourcing + injection into every agent/provider run |
| `orchestrator-subagent-integration.md` | Main run loop policy: tiers, subagents, wiring validation | **41 subagents** (canonical list §4: Phase, Task lang/domain/framework, Subtask, Iteration, Cross-phase including explore). DRY:DATA:subagent_registry; task tool (Tools.md §3.6) validates against this list. Treat platform specifics as Provider concerns. |
| `interview-subagent-integration.md` | Interview phases + subagent use | Phase assignments use the same **41 subagents**; cross-phase (ux-researcher, knowledge-synthesizer, context-manager, explore, etc.). Mirrors orchestrator patterns at interview-phase boundaries. |
| `assistant-chat-design.md` | Assistant/Chat UX and modes | Keep UX; anchor persistence/search to event stream projections |
| `FinalGUISpec.md` | Slint GUI contract | Canonical UI source for **Interaction Mode (Expert/ELI5)** + **Chat ELI5** defaults/independence and the single dual-copy checklist (`§7.4.0`). |
| `GitHub_Integration.md` | GitHub/Git IDE integration spec | Git panel (repo/branch/diff/operations), GitHub API (OAuth device-code, PRs, Actions), SSH remote dev servers, no-wizard project flows (Add Existing / New Local / New GitHub Repo). Cross-refs: Plans/GitHub_API_Auth_and_Flows.md, Plans/FileManager.md, Plans/chain-wizard-flexibility.md. |
| `FileManager.md` | File Manager panel, IDE-style editor, @ mention, click-to-open | Canonical for file tree, editor (tabs, split panes, save, line numbers, syntax), image viewer, HTML preview + hot reload, same browser as §15.18, terminal/browser tabs (§9), editor enhancements MVP (§10), language/framework presets (§11). **LSP is MVP** (§10.10): diagnostics, hover, completion, navigation, inlay hints, code actions, code lens; implement with desktop editor from start. |
| `LSPSupport.md` | LSP client support for rewrite | **LSP is MVP** -- in scope for desktop release. Canonical for LSP: diagnostics, hover, completion, navigation, inlay hints, code actions, code lens, Chat Window LSP (§5.1); OpenCode-style server registry/root discovery; Rust client crates (lsp-types, lsp-client/async_lsp_client). Implement with desktop editor and Chat from start. |
| `storage-plan.md` | seglog, redb, Tantivy, projectors, analytics scan | Implementation checklist; chat persistence/search map to this stack; analytics scan rollups in redb feed dashboard/usage (usage-feature.md, feature-list). |
| `chain-wizard-flexibility.md` | Wizard intents + requirements canonicalization + GitHub flows | Canonical for intent-based flows and requirements merge/canonical artifact |
| `human-in-the-loop.md` | HITL semantics at tier boundaries | Canonical for pause-for-approval toggles + tier boundary meaning |
| `FileSafe.md` | Safe-edit guards + context compilation | Should map to central tool policy + patch pipeline |
| `WorktreeGitImprovement.md` | Worktree/git correctness + GUI wiring | Should map to patch/apply/verify/rollback + Provider run dirs |
| `MiscPlan.md` | Cleanup + runner contract + artifact retention | Should map to patch pipeline + event artifacts retention |
| `newtools.md` | GUI testing/tools discovery + MCP tooling | Should map to central tool registry/policy engine |
| `Tools.md` | Built-in tools, custom tools, permissions (allow/deny/ask) | Canonical for tool semantics and permission model; OpenCode-style. **task** tool launches subagents; `subagent_type` must be one of the **41 subagents** (orchestrator §4, §3.6). MCP config covered in newtools.md and AGENTS.md. |
| `usage-feature.md` | Usage UX + dashboards | Treat usage as projections/rollups over event ledger; **per-thread usage in chat** (context circle, hover tooltip, thread Usage tab) per §5 (OpenCode-style). Widget-composed page addendum (2026-02-23). |
| `newfeatures.md` | Feature ideas + patterns | Treat Iced references as legacy examples; no SQLite (storage is seglog/redb/Tantivy); rewrite anchors are Provider/event-store/tool-policy |
| `Widget_System.md` | Cross-cutting widget catalog, grid layout, add-widget flow | Canonical for portable page widgets, grid-based resizing, layout persistence. Referenced by Dashboard, Usage, Orchestrator pages. Single widget catalog shared across all widget-composed surfaces. |
| `Run_Graph_View.md` | Node Graph Display (Airflow-style DAG view) | Canonical for the full-page graph visualization tab on the Orchestrator page. NOT a portable widget. Includes data model contract for Rust structs, 5 layout presets, 8-section detail panel, HITL controls, performance targets (500 nodes). |
| `Orchestrator_Page.md` | Orchestrator single-page 6-tab structure | Canonical for tab layout (Progress / Tiers / Node Graph Display / Evidence / History / Ledger). Widget-based tabs reference Widget_System.md. Node Graph tab references Run_Graph_View.md. Terminal widgets, prose summaries, data source documentation. |
| `GUI_Rebuild_Requirements_Checklist.md` | Auditable summary checklist for 2026-02-23 GUI rebuild handoff requirements | Single verification table confirming coverage for widget system, Usage page, chat context enhancements, Dashboard widget grid migration, Orchestrator 6-tab structure, and Node Graph image-backed spec. |
| `Executor_Protocol.md` | Deterministic executor flow and lifecycle semantics | Canonical for Builder/Verifier/Executor roles, next-ready selection, and verifier-driven auto completion to `done`. |
| `UI_Wiring_Rules.md` | UI wiring rules + verification | Canonical for Rule 1 (UI dispatches only typed UICommands) and Rule 2 (every UI element maps to one UICommandID). Defines UI Command Dispatcher boundary and Wiring Matrix verification concept. |
| `Provider_OpenCode.md` | OpenCode server-bridged provider integration | Optional provider; user installs OpenCode locally; Puppet Master connects via HTTP REST + SSE. See also CLI_Bridged_Providers.md (extended for HTTP transport). |
| `Wiring_Matrix.md` | Wiring matrix template + examples | Template and 10 EXAMPLE rows for the wiring matrix. Real entries are JSON validated against Wiring_Matrix.schema.json. |

## Known cross-cutting duplication hotspots

Several plans re-describe the same cross-cutting patterns (crews, hooks/lifecycle, cross-session memory, validation). As the rewrite lands, prefer making one canonical spec for these patterns (agent-loop core) and referencing it, rather than copy/pasting blocks into each plan.

- **Analytics scan / rollups:** seglog → counters/rollups → redb; canonical spec in storage-plan.md; rollups feed dashboard and usage (usage-feature.md, feature-list).
