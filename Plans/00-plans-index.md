# Plans Index (authoritative map)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.

## Anti-drift layer (required reading order)

Required reading order for the orchestrator rewrite canon-collapse is:
1. `Plans/rewrite-tie-in-memo.md`
2. `Plans/Decision_Log.md`
3. `Plans/DRY_Rules.md`
4. `Plans/Crosswalk.md`
5. `Plans/Contracts_V0.md`
6. `Plans/storage-plan.md`
7. `Plans/Prompt_Pipeline.md`
8. `Plans/Executor_Protocol.md`
9. `Plans/Decision_Policy.md`
10. `Plans/Progression_Gates.md`

Primary consumer docs then follow:
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`
- `Plans/FileManager.md`

Rules:
- owner docs are reconciled before consumer docs
- consumer docs must not preserve stale tier-era or request-era canon as peer alternatives
- summary and checklist mirrors are reconciled after owner and primary consumer docs

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md
## Rewrite tie-in (2026-02-21)
The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) -> projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust + Slint (winit; Skia default)
- **Auth**: subscription-first; Gemini is modeled as two provider entries: Gemini Direct (`gemini`, direct API-key only) and Gemini CLI (`gemini_cli`, CLI-wrapped OAuth/API-key/Google-credential paths). Requested/effective auth and account identity carry across storage, runtime, setup/health, and usage

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

See: `Plans/rewrite-tie-in-memo.md`, `Plans/Multi-Account.md`, `Plans/usage-feature.md`, and `Plans/FinalGUISpec.md`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
## Plan map

### Instant Grep canon reconciliation note (2026-03-30)

The Instant Grep packet uses the following ownership split:
- `Tools.md` is the primary owner for grep tool semantics, sparse-n-gram query flow, covering/fallback rules, and `tool.invoked.index_used`
- `storage-plan.md` is the primary owner for regex-index storage layout, binary formats, dirty-layer lifecycle, publication, and startup recovery
- `FinalGUISpec.md` is the primary owner for indexing settings, status-bar disclosure, Search ownership, and remote-cache administration surfaces
- `GitHub_Integration.md` is the primary owner for remote Git/non-Git cache behavior, verification paths, staging, re-anchor, and no-silent-local-fallback reconciliation
- `assistant-chat-design.md`, `UI_Command_Catalog.md`, `Glossary.md`, `Architecture_Invariants.md`, `BinaryLocator_Spec.md`, `usage-feature.md`, and `Wiring_Matrix.md` are required reconciliation consumers

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md


### Browser canon reconciliation note (2026-03-19)

The built-in browser packet uses the following ownership split:
- `Section15_MVP_Promoted_Features_Spec.md` is the browser behavior owner for session classes, runtime model, action/command families, capture rules, permissions defaults, persistence hooks, recovery expectations, and anti-drift/non-goals
- `rewrite-tie-in-memo.md` is the rewrite-baseline constraint owner for browser-runtime and preview/browser architectural assumptions
- `FinalGUISpec.md`, `FileManager.md`, and `UI_Command_Catalog.md` are the primary browser consumers for placement, open flows, click-to-context, and user-visible commands
- `assistant-chat-design.md`, `Prompt_Pipeline.md`, `Permissions_System.md`, `storage-plan.md`, `Runtime_Artifacts_Panel.md`, `newtools.md`, and `Wiring_Matrix.md` are reconciliation consumers for chat capture, prompt assembly, permissions, persistence, evidence, live testing/tooling, and command wiring

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/UI_Command_Catalog.md

`newfeatures.md` remains historical/origin material only for this topic. Normative browser behavior now lives in the promoted Section 15 owner and the reconciled subsystem SSOT docs above.

ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

### Debug canon reconciliation note (2026-03-23)

The Debug Mode packet uses the following ownership split:
- `assistant-chat-design.md` is the Assistant Debug Mode owner for mode-strip behavior, Investigation Context visibility, thread lifecycle, and slash-command expectations
- `Run_Modes.md`, `Permissions_System.md`, and `storage-plan.md` own runtime posture, Debug Automation Profile behavior, and persisted investigation identity/state
- `Section15_MVP_Promoted_Features_Spec.md` owns browser-target debug behavior and the visible browser evidence / automation contract
- `Runtime_Artifacts_Panel.md`, `Contracts_V0.md`, `Prompt_Pipeline.md`, and `Tools.md` own artifact grouping, event fields, prompt assembly, and shared debug-capable tool semantics
- `FinalGUISpec.md`, `UI_Command_Catalog.md`, `newtools.md`, `GitHub_Integration.md`, and `feature-list.md` are primary consumers for shell placement, command routing, tooling discovery, remote scope, and summary coverage
- `Commands_System.md`, `Glossary.md`, `FileManager.md`, `human-in-the-loop.md`, `Architecture_Invariants.md`, `orchestrator-subagent-integration.md`, `interview-subagent-integration.md`, `Wiring_Matrix.md`, `rewrite-tie-in-memo.md`, and `MiscPlan.md` are required reconciliation companions

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

| Plan | Primary scope | Notes / canonical intent |
|------|--------------|--------------------------|
| `rewrite-tie-in-memo.md` | Locked rewrite decisions | Canonical for rewrite constraints + deltas to apply elsewhere |
| `Section15_MVP_Promoted_Features_Spec.md` | Promoted Section 15 feature owner | Canonical owner for the promoted Section 15 shell, browser, project-switch, workspace-tab/window, thread-usage, catalog-lifecycle, terminal/dev-loop, and cross-feature defaults/identities/non-goals set. |
| `agent-rules-context.md` | Application/project rules pipeline | Canonical for rules sourcing + injection into every agent/provider run |
| `orchestrator-subagent-integration.md` | Main run loop policy: tiers, subagents, wiring validation | Registry-driven Persona set (canonical list §4: Phase, Task lang/domain/framework, Subtask, Iteration, Cross-phase including `explorer` and `requirements-quality-reviewer`). DRY:DATA:subagent_registry; task tool (Tools.md §3.6) validates against this list. Persona definitions, storage, schema, and injection: `Plans/Personas.md` (SSOT). Treat platform specifics as Provider concerns. |
| `interview-subagent-integration.md` | Interview phases + subagent use | Phase assignments use the registry-driven Persona set; cross-phase (`ux-researcher`, `knowledge-synthesizer`, `context-manager`, `explorer`, `requirements-quality-reviewer`, etc.). Mirrors orchestrator patterns at interview-phase boundaries. Persona injection per `Plans/Personas.md` §5.2. |
| `assistant-chat-design.md` | Assistant/Chat UX and modes | Canonical for chat/thread/session navigation, PM-native Ask/Plan semantics, slash-command behavior, shared question flows, activity transparency, `/web`, `/skill`, and plan/TODO semantics. |
| `assistant-memory-subsystem.md` | Assistant-only memory continuity subsystem | Canonical SSOT for Assistant memory boundary, per-project memory stores (`assistant_memory.redb` + lexical/semantic indexes), decay scoring, capsule/retrieval budgets, and maintenance operations. Explicitly separate from rules pipeline contracts. |
| `FinalGUISpec.md` | Slint GUI contract | Canonical UI source for shell/layout/view placement, responsive behavior, settings IA, chat widgets/activity cards/plan tracker, Agent Config > Skills, browser/terminal surfaces, and Interaction Mode (Expert/ELI5) + Chat ELI5 defaults/independence. |
| `GitHub_Integration.md` | GitHub/Git IDE integration spec | Git panel (repo/branch/diff/operations), GitHub API (OAuth device-code, PRs, Actions), SSH remote dev servers, no-wizard project flows (Add Existing / New Local / New GitHub Repo). Cross-refs: Plans/GitHub_API_Auth_and_Flows.md, Plans/FileManager.md, Plans/chain-wizard-flexibility.md. |
| `FileManager.md` | File Manager panel, IDE-style editor, @ mention, click-to-open | Canonical for file tree, editor (tabs, split panes, save, line numbers, syntax), image viewer, HTML/browser preview, detached preview behavior, `@` mention integration, terminal/browser tabs (§9), editor enhancements MVP (§10), language/framework presets (§11). |
| `LSPSupport.md` | LSP client support for rewrite | **LSP is MVP** -- in scope for desktop release. Canonical for LSP diagnostics, navigation, chat/editor LSP behavior, server registry/root discovery, and the widened canonical `lsp` tool surface used by Assistant Chat and editor workflows. |
| `storage-plan.md` | seglog, redb, Tantivy, projectors, analytics scan | Canonical persistence and restore model for project identity, workspace tabs, windows, browser/preview state, terminal sessions, dev sessions, plan/TODO/question/activity state, usage projections, and analytics scan rollups. |
| `chain-wizard-flexibility.md` | Wizard intents + requirements canonicalization + GitHub flows | Canonical for intent-based flows and requirements merge/canonical artifact |
| `Document_Packaging_Policy.md` | Deterministic packaging for large Markdown/text artifacts | Canonical Document Set contract: sharded set + `00-index.md` + `manifest.json` + full audits with non-bypassable run failure on verification breach. |
| `human-in-the-loop.md` | HITL semantics at tier boundaries | Canonical for pause-for-approval toggles + tier boundary meaning |
| `FileSafe.md` | Safe-edit guards + context compilation | Canonical blocked destructive-command behavior and restore-before-rerun integration; maps to central tool policy + patch pipeline. |
| `Prompt_Pipeline.md` | Prompt assembly pipeline + compaction contract | SSOT for prompt assembly stage ordering and compaction/rotation contracts (pairs with FileSafe Part B for compilation details). |
| `WorktreeGitImprovement.md` | Worktree/git correctness + GUI wiring | Canonical for stable project identity vs path rebinding and worktree-aware project-switch/restore behavior. |
| `MiscPlan.md` | Cleanup + runner contract + artifact retention | Maps to patch pipeline + event artifacts retention |
| `newtools.md` | GUI testing/tools discovery + MCP tooling | Canonical for MCP settings/UI flow, cited search, testing-tool discovery, and runtime-health-oriented MCP GUI behavior. |
| `Tools.md` | Built-in tools, custom tools, permissions (allow/deny/ask) | Canonical for tool semantics, MCP integration, requested-vs-effective tool availability, normalized `question` / TODO tool contracts, expanded web operations, `task`, widened `lsp`, and permission-adjacent tool behavior. |
| `OpenCode_Deep_Extraction.md` | OpenCode pattern extraction procedure + known-good baseline | Provenance doc for extracting upstream patterns and mapping them into Puppet Master SSOT docs. Covers 8 subsystems (run modes, agents, permissions, commands, formatters, skills, plugins, models) with file pointers, behavior summaries, SSOT mapping table (§8), and delta hooks (§9). |
| `Decision_Log.md` | Decisions made during plan updates | Records decisions not captured in `auto_decisions.jsonl`; timestamped and final. |
| `usage-feature.md` | Usage UX + dashboards | Canonical for app-wide Usage plus per-thread usage in chat, shared UsageRecord ownership, and cost_usage deep-link behavior. |
| `Runtime_Artifacts_Panel.md` | Artifacts panel (runtime artifacts) | Canonical for 19 artifact types, seglog `runtime_artifact.*`, redb `artifacts_index:v1:{project_id}`, cost_usage, Show in Ledger/Usage, browser recordings, and JSON schemas. Distinct from Project Plan Package (`Project_Output_Artifacts.md`). |
| `newfeatures.md` | Feature ideas + patterns | Historical/origin source for promoted Section 15 ideas; normative behavior for promoted items now lives in the promoted Section 15 owner and reconciled subsystem SSOTs. |
| `Widget_System.md` | Cross-cutting widget catalog, grid layout, add-widget flow | Canonical for portable page widgets, grid-based resizing, layout persistence. Referenced by Dashboard, Usage, Orchestrator pages. Single widget catalog shared across all widget-composed surfaces. |
| `Run_Graph_View.md` | Node Graph Display (Airflow-style DAG view) | Canonical for the full-page graph visualization tab on the Orchestrator page. NOT a portable widget. Includes Slint implementation guide, data model contract, 5 layout presets, 8-section detail panel, HITL controls, performance targets (500 nodes). |
| `Orchestrator_Page.md` | Orchestrator single-page 6-tab structure | Canonical for tab layout (Progress / Seams / Node Graph Display / Evidence / History / Ledger). Widget-based tabs reference Widget_System.md. Node Graph tab references Run_Graph_View.md. Terminal widgets, prose summaries, data source documentation. |
| `GUI_Rebuild_Requirements_Checklist.md` | Auditable summary checklist for 2026-02-23 GUI rebuild handoff requirements | Single verification table confirming coverage for widget system, Usage page, chat context enhancements, Dashboard widget grid migration, Orchestrator 6-tab structure, and Node Graph image-backed spec. |
| `Executor_Protocol.md` | Deterministic overseer flow and lifecycle semantics | Canonical for Builder/Verifier/Overseer roles, next-ready selection, and verifier-driven auto completion to `done`. |
| `UI_Wiring_Rules.md` | UI wiring rules + verification | Canonical for Rule 1 (UI dispatches only typed UICommands) and Rule 2 (every UI element maps to one UICommandID). Defines UI Command Dispatcher boundary and Wiring Matrix verification concept. |
| `Provider_Stream_Mapping_External_Reference_A2A.md` | Upstream external-framework + A2A bridge → V0 stream mapping | Canonical mapping of upstream native events and A2A bridge concepts to V0 normalized stream events. Diagnostic instrumentation categories, deterministic rules, and Overseer audit protocol instrumentation. Cross-refs: CLI_Bridged_Providers.md, Architecture_Invariants.md#INV-001, Glossary.md, Executor_Protocol.md. |
| `Provider_OpenCode.md` | OpenCode server-bridged provider integration | Optional provider; user installs OpenCode locally; Puppet Master connects via HTTP REST + SSE. See also CLI_Bridged_Providers.md (extended for HTTP transport). |
| `BinaryLocator_Spec.md` | Deterministic provider CLI discovery | Canonical algorithm for locating + validating external Provider CLIs (initially Cursor Agent + Claude Code) across OS using only official install footprints (override/PATH/common locations/launchers). |
| `Run_Modes.md` | Canonical run-mode definitions + CLI-bridged strategy selection | SSOT for Mode enum (ask/plan/regular/yolo), HTE vs DAE strategy selection, budget defaults, kill conditions, outcome taxonomy, and mode-specific context-management deltas. |
| `Personas.md` | Canonical Persona system definitions | SSOT for Persona vs Agent vs Subagent definitions, storage layout (`.puppet-master/personas/` + `~/.config/puppet-master/personas/`), PERSONA.md schema (YAML frontmatter + body), validation rules, reserved IDs (explorer, researcher, deep-researcher), GUI management (Settings > Advanced > Personas), context-injection rules, and registry relationship. |
| `Permissions_System.md` | Canonical permission system definitions | SSOT for permission actions (`allow`/`ask`/`deny`), multi-layer precedence (mode > session > Persona > project > global > defaults), PM-native Ask/Plan mode semantics, granular rules (wildcard syntax, last-match-wins), special guards (`doom_loop`, `external_directory`), question/TODO/web tool defaults, `.env` deny rules, resolution algorithm, TOML persistence, permission profiles, and GUI requirements (Settings > Permissions). |
| `Commands_System.md` | Canonical User Commands system | SSOT for User Commands (user-authored command presets): definitions (User Command vs UICommand distinction), storage layout (`.puppet-master/commands/` + `~/.config/puppet-master/commands/`), command schema (YAML frontmatter + Markdown template body), template syntax (`$ARGUMENTS`, `$N`, `@path`, `` !`cmd` ``), execution semantics (subtask, Persona/mode/model overrides), reserved built-in slash-command collision rules, permissions integration, GUI requirements (Settings > Rules & Commands > Commands), and dry-run preview. |
| `Skills_System.md` | Canonical skills system | SSOT for skill discovery/storage roots, SKILL.md schema (frontmatter + body), validation rules, permission integration, Persona skill refs (`default_skill_refs`), runtime surface (via `skill` tool), and GUI requirements under Agent Config > Skills. |
| `Plugins_System.md` | Canonical plugin system | SSOT for plugin discovery (internal/project/global/config paths), load order (deterministic), plugin context, 10 hook events with typed I/O and return enums, compaction hook (InjectContext/ReplacePrompt), custom tool registration with collision policy, structured plugin logging, GUI requirements (Settings > Plugins), and OpenCode baseline/deltas. |
| `Formatters_System.md` | Canonical formatter system | SSOT for formatter lifecycle (HTE-only, triggered on File.Edited), built-in formatter table (21 formatters), per-formatter config (disabled/command/environment/extensions, `$FILE` placeholder), evidence tracking via `format.applied` events, GUI requirements (Settings > Formatters), and OpenCode baseline/deltas. |
| `Models_System.md` | Canonical model system | SSOT for canonical model ID (`provider_id/model_id`), 6-level selection priority, model options (per-provider+model), per-Persona model overrides (`default_model`/`default_variant` in PERSONA.md frontmatter), variants (built-in default/fast/powerful + custom + disabling + cycling), canonical media model alias table (§6.8: Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro), GUI requirements (Settings > Models, Chat model picker, variant picker), and OpenCode baseline/deltas. |
| `Media_Generation_and_Capabilities.md` | Media generation and capability system SSOT | Canonical for `capabilities.get` (internal tool returning all media + provider-tool capabilities with enabled/disabled + disabled_reason + setup hints), `media.generate` (uniform media generation interface with per-request `model_override`, artifact-path output, and stable error codes), natural-language slot extraction grammar (deterministic regex-based prompt parsing), capability picker dropdown UI/UX, Cursor-native image routing (Image only; Video/TTS/Music unsupported on Cursor), Gemini media APIs, and verbatim UI copy strings. Model aliases for media (Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro) are DRY-referenced from `Plans/Models_System.md` §6.8. |
| `OpenCode_Coverage_Matrix.md` | OpenCode-to-SSOT coverage audit | Audit of all OpenCode-derived capabilities (extraction §7A–§7H) vs Puppet Master SSOT docs. Coverage matrix, DRY authority audit, GUI/config wiring audit, and mandatory fix list (anchors/subsections). |
| `Wiring_Matrix.md` | Wiring matrix template + examples | Canonical routing for UI command producer/consumer mappings and required runtime/browser/dev/catalog wiring coverage; example/template posture is subordinate to the canonical runtime wiring sections. |


### Instant Grep (sparse n-gram index) canon reconciliation note

The Instant Grep packet uses the following ownership split:
- `Tools.md` is the primary owner for grep tool semantics, index-accelerated query flow, covering algorithm, fallback behavior, and `tool.invoked` analytics fields
- `storage-plan.md` is the primary owner for regex index storage layout (§2.1), binary file formats, generation directory scheme, file watcher dual-consumer model (§2.4), and sensitive indexing guards
- `FinalGUISpec.md` is the primary owner for status bar Indexing indicator (§3.2), Indexing settings section (§7.4.2), and Search panel index-acceleration UX (Search side-panel owner)
- `GitHub_Integration.md` is the primary owner for remote project search index cache (§C.3), bare Git clone lifecycle, non-Git remote indexer binary, and cache settings
- `assistant-chat-design.md`, `UI_Command_Catalog.md`, `Glossary.md`, `Architecture_Invariants.md`, `BinaryLocator_Spec.md`, `usage-feature.md`, `Wiring_Matrix.md`, and `00-plans-index.md` are reconciliation consumers

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

## Known cross-cutting duplication hotspots

The highest-risk duplication hotspots for this planning set are now:

- child-run canon versus provider-native subagent language
- Persona selection versus subagent registry language
- crew shared-state versus legacy memory-manager language
- dynamic context shrinking versus compaction and Subcompact language
- requested/effective runtime surface and effort language
- blocked/awaiting-parent versus older denial or recovery aliases
- Context Lens UI wording versus command and wiring ownership

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

Rewrite-era guidance:
- owner docs define the canon.
- consumer docs should reference owner docs rather than re-describing the full model.
- packetization and reconciliation should prefer rewrite-outright where stale canon would remain misleading if left in place.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md
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
## 2026-03-07 addendum — containers, registry, and Unraid

- Registered `Plans/Containers_Registry_and_Unraid.md` as the canonical SSOT for first-class DockerHub image publishing, contextual Docker management UI, managed Unraid template repositories, and `ca_profile.xml` behavior.

| Plan | Primary scope | Notes / canonical intent |
|------|--------------|--------------------------|
| `Containers_Registry_and_Unraid.md` | First-class DockerHub publishing, container runtime management, and Unraid template workflows | Canonical for DockerHub browser/PAT auth UX, requested vs effective auth capability, protected repo creation, contextual Docker Manage UI, managed template-repo defaults, `ca_profile.xml` scope/editability, and maintainer-asset handling. |

## Runtime Packet Index Coverage Consolidation Addendum (2026-03-09)

Update index descriptions so readers can find the owning docs for:
- scheduler semantics and queue analysis
- event/contracts and storage for attempts, safe points, and remediation lineage
- blocked-state UX and recovery actions
- provider/auth/permission mappings into runtime taxonomy
- glossary ownership for new runtime terms

Index descriptions for this packet MUST point readers to:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md
- `Plans/Contracts_V0.md` for canonical events, enums, identities, and action fields
- `Plans/Executor_Protocol.md` for scheduler semantics, attempt lifecycle, and graph-lock behavior
- `Plans/storage-plan.md` for persistence and restart rules
- `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/FinalGUISpec.md` for rendering and interaction
- `Plans/chain-wizard-flexibility.md`, `Plans/assistant-chat-design.md`, and `Plans/interview-subagent-integration.md` for paused/degraded planning-state semantics
- `Plans/Glossary.md` for canonical runtime terminology

## 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager

- `Plans/GitHub_Integration.md` now owns two distinct operational surfaces: Git-first Source Control and GitHub Actions.
- `Plans/WorktreeGitImprovement.md` remains canonical for worktree correctness and runtime alignment, but Source Control is the primary user-facing worktree surface.
- `Plans/Containers_Registry_and_Unraid.md` is the canonical owner for Docker Manager, including Publish / Unraid and project-focused Kubernetes placement.
- `Plans/newtools.md` remains canonical for Docker/Actions doctor and result minima and must be read alongside the feature-owner docs.
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`, and `Plans/usage-feature.md` are required anti-drift companions for this packet.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md


## Web Tools + Firecrawl + Lost-Spec Recovery reconciliation note (2026-03-30)

The reconciled owner and consumer set for web tools, Firecrawl, questions, planning/TODO, permissions, runtime identity, and MCP now spans:
- `Plans/Tools.md`
- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- `Plans/Permissions_System.md`
- `Plans/storage-plan.md`
- `Plans/Commands_System.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Skills_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Modes.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/MCP_Integration.md`

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md

Consumer summaries in orchestration, interview, provider, account, and index surfaces defer to those repaired owner sections instead of keeping competing canon. Verify-only docs were checked during reconciliation and are intentionally out of packet scope because no edits were required.
