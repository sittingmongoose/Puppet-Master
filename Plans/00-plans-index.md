# Plans Index (authoritative map)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.

## Anti-drift layer (required reading order)
To prevent agent drift while building Puppet Master autonomously, these are the **canonical SSOT** inputs and gates. Other plans MUST reference these instead of redefining them.

ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md#7

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
| `orchestrator-subagent-integration.md` | Main run loop policy: tiers, subagents, wiring validation | Registry-driven Persona set (canonical list §4: Phase, Task lang/domain/framework, Subtask, Iteration, Cross-phase including explore). DRY:DATA:subagent_registry; task tool (Tools.md §3.6) validates against this list. Persona definitions, storage, schema, and injection: `Plans/Personas.md` (SSOT). Treat platform specifics as Provider concerns. |
| `interview-subagent-integration.md` | Interview phases + subagent use | Phase assignments use the registry-driven Persona set; cross-phase (ux-researcher, knowledge-synthesizer, context-manager, explore, etc.). Mirrors orchestrator patterns at interview-phase boundaries. Persona injection per `Plans/Personas.md` §5.2. |
| `assistant-chat-design.md` | Assistant/Chat UX and modes | Keep UX; anchor persistence/search to event stream projections |
| `assistant-memory-subsystem.md` | Assistant-only memory continuity subsystem | Canonical SSOT for Assistant memory boundary, per-project memory stores (`assistant_memory.redb` + lexical/semantic indexes), decay scoring, capsule/retrieval budgets, and maintenance operations. Explicitly separate from rules pipeline contracts. |
| `FinalGUISpec.md` | Slint GUI contract | Canonical UI source for **Interaction Mode (Expert/ELI5)** + **Chat ELI5** defaults/independence and the single dual-copy checklist (`§7.4.0`). |
| `GitHub_Integration.md` | GitHub/Git IDE integration spec | Git panel (repo/branch/diff/operations), GitHub API (OAuth device-code, PRs, Actions), SSH remote dev servers, no-wizard project flows (Add Existing / New Local / New GitHub Repo). Cross-refs: Plans/GitHub_API_Auth_and_Flows.md, Plans/FileManager.md, Plans/chain-wizard-flexibility.md. |
| `FileManager.md` | File Manager panel, IDE-style editor, @ mention, click-to-open | Canonical for file tree, editor (tabs, split panes, save, line numbers, syntax), image viewer, HTML preview + hot reload, same browser as §15.18, terminal/browser tabs (§9), editor enhancements MVP (§10), language/framework presets (§11). **LSP is MVP** (§10.10): diagnostics, hover, completion, navigation, inlay hints, code actions, code lens; implement with desktop editor from start. |
| `LSPSupport.md` | LSP client support for rewrite | **LSP is MVP** -- in scope for desktop release. Canonical for LSP: diagnostics, hover, completion, navigation, inlay hints, code actions, code lens, Chat Window LSP (§5.1); OpenCode-style server registry/root discovery; Rust client crates (lsp-types, lsp-client/async_lsp_client). Implement with desktop editor and Chat from start. |
| `storage-plan.md` | seglog, redb, Tantivy, projectors, analytics scan | Implementation checklist; chat persistence/search map to this stack; analytics scan rollups in redb feed dashboard/usage (usage-feature.md, feature-list). |
| `chain-wizard-flexibility.md` | Wizard intents + requirements canonicalization + GitHub flows | Canonical for intent-based flows and requirements merge/canonical artifact |
| `Document_Packaging_Policy.md` | Deterministic packaging for large Markdown/text artifacts | Canonical Document Set contract: sharded set + `00-index.md` + `manifest.json` + full audits with non-bypassable run failure on verification breach. |
| `human-in-the-loop.md` | HITL semantics at tier boundaries | Canonical for pause-for-approval toggles + tier boundary meaning |
| `FileSafe.md` | Safe-edit guards + context compilation | Maps to central tool policy + patch pipeline |
| `Prompt_Pipeline.md` | Prompt assembly pipeline + compaction contract | SSOT for prompt assembly stage ordering and compaction/rotation contracts (pairs with FileSafe Part B for compilation details). |
| `WorktreeGitImprovement.md` | Worktree/git correctness + GUI wiring | Maps to patch/apply/verify/rollback + Provider run dirs |
| `MiscPlan.md` | Cleanup + runner contract + artifact retention | Maps to patch pipeline + event artifacts retention |
| `newtools.md` | GUI testing/tools discovery + MCP tooling | Maps to central tool registry/policy engine |
| `Tools.md` | Built-in tools, custom tools, permissions (allow/deny/ask) | Canonical for tool semantics and permission model; OpenCode-style. **task** tool launches subagents; `subagent_type` is validated against the registry-driven Persona set (orchestrator §4, §3.6). MCP config covered in newtools.md and AGENTS.md. |
| `OpenCode_Deep_Extraction.md` | OpenCode pattern extraction procedure + known-good baseline | Provenance doc for extracting upstream patterns and mapping them into Puppet Master SSOT docs. Covers 8 subsystems (run modes, agents, permissions, commands, formatters, skills, plugins, models) with file pointers, behavior summaries, SSOT mapping table (§8), and delta hooks (§9). |
| `Decision_Log.md` | Decisions made during plan updates | Records decisions not captured in `auto_decisions.jsonl`; timestamped and final. |
| `usage-feature.md` | Usage UX + dashboards | Treat usage as projections/rollups over event ledger; **per-thread usage in chat** (context circle, hover tooltip, thread Usage tab) per §5 (OpenCode-style). Widget-composed page addendum (2026-02-23). |
| `newfeatures.md` | Feature ideas + patterns | Treat Iced references as legacy examples; no SQLite (storage is seglog/redb/Tantivy); rewrite anchors are Provider/event-store/tool-policy |
| `Widget_System.md` | Cross-cutting widget catalog, grid layout, add-widget flow | Canonical for portable page widgets, grid-based resizing, layout persistence. Referenced by Dashboard, Usage, Orchestrator pages. Single widget catalog shared across all widget-composed surfaces. |
| `Run_Graph_View.md` | Node Graph Display (Airflow-style DAG view) | Canonical for the full-page graph visualization tab on the Orchestrator page. NOT a portable widget. Includes Slint implementation guide, data model contract, 5 layout presets, 8-section detail panel, HITL controls, performance targets (500 nodes). |
| `Orchestrator_Page.md` | Orchestrator single-page 6-tab structure | Canonical for tab layout (Progress / Tiers / Node Graph Display / Evidence / History / Ledger). Widget-based tabs reference Widget_System.md. Node Graph tab references Run_Graph_View.md. Terminal widgets, prose summaries, data source documentation. |
| `GUI_Rebuild_Requirements_Checklist.md` | Auditable summary checklist for 2026-02-23 GUI rebuild handoff requirements | Single verification table confirming coverage for widget system, Usage page, chat context enhancements, Dashboard widget grid migration, Orchestrator 6-tab structure, and Node Graph image-backed spec. |
| `Executor_Protocol.md` | Deterministic overseer flow and lifecycle semantics | Canonical for Builder/Verifier/Overseer roles, next-ready selection, and verifier-driven auto completion to `done`. |
| `UI_Wiring_Rules.md` | UI wiring rules + verification | Canonical for Rule 1 (UI dispatches only typed UICommands) and Rule 2 (every UI element maps to one UICommandID). Defines UI Command Dispatcher boundary and Wiring Matrix verification concept. |
| `Provider_Stream_Mapping_External_Reference_A2A.md` | Upstream external-framework + A2A bridge → V0 stream mapping | Canonical mapping of upstream native events and A2A bridge concepts to V0 normalized stream events. Diagnostic instrumentation categories, deterministic rules, and Overseer audit protocol instrumentation. Cross-refs: CLI_Bridged_Providers.md, Architecture_Invariants.md#INV-001, Glossary.md, Executor_Protocol.md. |
| `Provider_OpenCode.md` | OpenCode server-bridged provider integration | Optional provider; user installs OpenCode locally; Puppet Master connects via HTTP REST + SSE. See also CLI_Bridged_Providers.md (extended for HTTP transport). |
| `BinaryLocator_Spec.md` | Deterministic provider CLI discovery | Canonical algorithm for locating + validating external Provider CLIs (initially Cursor Agent + Claude Code) across OS using only official install footprints (override/PATH/common locations/launchers). |
| `Run_Modes.md` | Canonical run-mode definitions + CLI-bridged strategy selection | SSOT for Mode enum (ask/plan/regular/yolo), HTE vs DAE strategy selection, budget defaults, kill conditions, outcome taxonomy, and mode-specific context-management deltas. |
| `Personas.md` | Canonical Persona system definitions | SSOT for Persona vs Agent vs Subagent definitions, storage layout (`.puppet-master/personas/` + `~/.config/puppet-master/personas/`), PERSONA.md schema (YAML frontmatter + body), validation rules, reserved IDs (explorer, researcher, deep-researcher), GUI management (Settings > Advanced > Personas), context-injection rules, and registry relationship. |
| `Permissions_System.md` | Canonical permission system definitions | SSOT for permission actions (`allow`/`ask`/`deny`), multi-layer precedence (mode > session > Persona > project > global > defaults), granular rules (wildcard syntax, last-match-wins), special guards (`doom_loop`, `external_directory`), ask-flow semantics (`once`/`always`/`reject`), deterministic defaults, `.env` deny rules, resolution algorithm, TOML persistence, permission profiles, and GUI requirements (Settings > Permissions). |
| `Commands_System.md` | Canonical User Commands system | SSOT for User Commands (user-authored command presets): definitions (User Command vs UICommand distinction), storage layout (`.puppet-master/commands/` + `~/.config/puppet-master/commands/`), command schema (YAML frontmatter + Markdown template body), template syntax (`$ARGUMENTS`, `$N`, `@path`, `` !`cmd` ``), execution semantics (subtask, Persona/mode/model overrides), permissions integration (bash/read guards on shell injection/file includes), GUI requirements (Settings > Rules & Commands > Commands), and dry-run preview. |
| `Skills_System.md` | Canonical skills system | SSOT for skill discovery/storage roots, SKILL.md schema (frontmatter + body), validation rules, permission integration, Persona skill refs (`default_skill_refs`), runtime surface (via `skill` tool), and GUI requirements (Skills tab). |
| `Plugins_System.md` | Canonical plugin system | SSOT for plugin discovery (internal/project/global/config paths), load order (deterministic), plugin context, 10 hook events with typed I/O and return enums, compaction hook (InjectContext/ReplacePrompt), custom tool registration with collision policy, structured plugin logging, GUI requirements (Settings > Plugins), and OpenCode baseline/deltas. |
| `Formatters_System.md` | Canonical formatter system | SSOT for formatter lifecycle (HTE-only, triggered on File.Edited), built-in formatter table (21 formatters), per-formatter config (disabled/command/environment/extensions, `$FILE` placeholder), evidence tracking via `format.applied` events, GUI requirements (Settings > Formatters), and OpenCode baseline/deltas. |
| `Models_System.md` | Canonical model system | SSOT for canonical model ID (`provider_id/model_id`), 6-level selection priority, model options (per-provider+model), per-Persona model overrides (`default_model`/`default_variant` in PERSONA.md frontmatter), variants (built-in default/fast/powerful + custom + disabling + cycling), canonical media model alias table (§6.8: Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro), GUI requirements (Settings > Models, Chat model picker, variant picker), and OpenCode baseline/deltas. |
| `Media_Generation_and_Capabilities.md` | Media generation and capability system SSOT | Canonical for `capabilities.get` (internal tool returning all media + provider-tool capabilities with enabled/disabled + disabled_reason + setup hints), `media.generate` (uniform media generation interface with per-request `model_override`, artifact-path output, and stable error codes), natural-language slot extraction grammar (deterministic regex-based prompt parsing), capability picker dropdown UI/UX, Cursor-native image routing (Image only; Video/TTS/Music unsupported on Cursor), Gemini media APIs, and verbatim UI copy strings. Model aliases for media (Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro) are DRY-referenced from `Plans/Models_System.md` §6.8. |
| `OpenCode_Coverage_Matrix.md` | OpenCode-to-SSOT coverage audit | Audit of all OpenCode-derived capabilities (extraction §7A–§7H) vs Puppet Master SSOT docs. Coverage matrix, DRY authority audit, GUI/config wiring audit, and mandatory fix list (anchors/subsections). |
| `Wiring_Matrix.md` | Wiring matrix template + examples | Template and 10 EXAMPLE rows for the wiring matrix. Real entries are JSON validated against Wiring_Matrix.schema.json. |

## Known cross-cutting duplication hotspots

Several plans re-describe the same cross-cutting patterns (crews, hooks/lifecycle, cross-session memory, validation). As the rewrite lands, prefer making one canonical spec for these patterns (agent-loop core) and referencing it, rather than copy/pasting blocks into each plan.

- **Analytics scan / rollups:** seglog → counters/rollups → redb; canonical spec in storage-plan.md; rollups feed dashboard and usage (usage-feature.md, feature-list).

## Shard indexes

Agent-friendly shards for long plan docs. Generated by `scripts/pm-shard-plans.py --generate`; do not edit shards directly.

| Source doc | Shard index |
|-----------|-------------|
| `orchestrator-subagent-integration.md` | [`Plans/_shards/orchestrator-subagent-integration/00-index.md`](Plans/_shards/orchestrator-subagent-integration/00-index.md) |
| `FinalGUISpec.md` | [`Plans/_shards/FinalGUISpec/00-index.md`](Plans/_shards/FinalGUISpec/00-index.md) |
| `interview-subagent-integration.md` | [`Plans/_shards/interview-subagent-integration/00-index.md`](Plans/_shards/interview-subagent-integration/00-index.md) |
| `newtools.md` | [`Plans/_shards/newtools/00-index.md`](Plans/_shards/newtools/00-index.md) |
| `LSPSupport.md` | [`Plans/_shards/LSPSupport/00-index.md`](Plans/_shards/LSPSupport/00-index.md) |
| `FileManager.md` | [`Plans/_shards/FileManager/00-index.md`](Plans/_shards/FileManager/00-index.md) |
| `FileSafe.md` | [`Plans/_shards/FileSafe/00-index.md`](Plans/_shards/FileSafe/00-index.md) |
| `Project_Output_Artifacts.md` | [`Plans/_shards/Project_Output_Artifacts/00-index.md`](Plans/_shards/Project_Output_Artifacts/00-index.md) |
| `chain-wizard-flexibility.md` | [`Plans/_shards/chain-wizard-flexibility/00-index.md`](Plans/_shards/chain-wizard-flexibility/00-index.md) |
| `assistant-chat-design.md` | [`Plans/_shards/assistant-chat-design/00-index.md`](Plans/_shards/assistant-chat-design/00-index.md) |
| `MiscPlan.md` | [`Plans/_shards/MiscPlan/00-index.md`](Plans/_shards/MiscPlan/00-index.md) |
| `newfeatures.md` | [`Plans/_shards/newfeatures/00-index.md`](Plans/_shards/newfeatures/00-index.md) |
| `WorktreeGitImprovement.md` | [`Plans/_shards/WorktreeGitImprovement/00-index.md`](Plans/_shards/WorktreeGitImprovement/00-index.md) |
| `Tools.md` | [`Plans/_shards/Tools/00-index.md`](Plans/_shards/Tools/00-index.md) |
| `GitHub_Integration.md` | [`Plans/_shards/GitHub_Integration/00-index.md`](Plans/_shards/GitHub_Integration/00-index.md) |
| `feature-list.md` | [`Plans/_shards/feature-list/00-index.md`](Plans/_shards/feature-list/00-index.md) |
| `usage-feature.md` | [`Plans/_shards/usage-feature/00-index.md`](Plans/_shards/usage-feature/00-index.md) |
| `Run_Graph_View.md` | [`Plans/_shards/Run_Graph_View/00-index.md`](Plans/_shards/Run_Graph_View/00-index.md) |
| `storage-plan.md` | [`Plans/_shards/storage-plan/00-index.md`](Plans/_shards/storage-plan/00-index.md) |
