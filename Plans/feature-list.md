# Puppet Master Feature List (Reference)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document exists to avoid losing features when writing rewrite implementation docs. Part 1 lists planned and new features from the Plans folder, organized by category and relation. Part 2 records what exists in the codebase today for reference. Plans define target behavior; implementation may change.

---

## Part 1 - Planned and New Features (from Plans)

### 1. Rewrite and architecture
**Single deterministic agent loop.** Every backend is a Provider behind one unified session/event store, tool registry, and patch/edit pipeline. OpenCode-style provider abstraction, centralized config, and session orchestration make the main engine deterministic and reliable. Platform-specific runner terminology converges on Provider plus unified event model.

**Event-sourced storage (no SQLite).** Storage is seglog as the canonical append-only event ledger, redb for durable KV state/projections/settings, and Tantivy for full-text search over chats, docs, and log summaries. Sessions and runs are replayable from seglog with deterministic projections into redb/Tantivy and checkpointing for resumability. Analytics scan jobs write rollups into redb for Usage, dashboards, and cross-surface attribution.

**GUI rewrite (Rust + Slint).** Desktop UI switches to Rust and Slint with winit backend for Windows, macOS, and Linux. Default renderer is winit + Skia; fallback GPU is winit + FemtoVG-wgpu; emergency software fallback is kept for compatibility.

**Future thin clients.** Mobile and web clients are thin clients against the desktop-owned core and unified event/command APIs.

**Core reliability.** Tools are governed by a central policy engine. Edits go through an explicit patch/apply/verify/rollback pipeline. Plans/ remains the authoritative requirements source for orchestration, safe-edit, subagents, worktree/git, and tooling.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

**Provider and CLI.** Claude Code CLI and Cursor Agent CLI remain bridged Providers. Cursor / ACP remains optional future work only.

**Gemini provider auth/account model.** Gemini is one DirectApi provider with mixed OAuth and API-key account pools. Default `requested_auth_mode` is `auto` with OAuth-first provider preference. Explicit `oauth` and explicit `api_key` requests do not silently cross-fallback. Requested vs effective auth/account identity is recorded across prompt assembly, storage, health, and usage. Gemini API key remains the explicit allowed exception to the broader subscription-first guidance, but OAuth remains first-class and default-preferred. Media follows the same Gemini auth/account rules as regular provider usage.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Media_Generation_and_Capabilities.md

**Contract-Locked PlanGraph System.** Canonical node-based plan graph and execution remains unchanged in scope, with user-project outputs under `.puppet-master/project/**`, progression gates, verifier role, and Overseer protocol.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Executor_Protocol.md
### 2. Chat and assistant

**Chat modes.** Ask is read-only analysis. Plan is read-only until explicit execution and requires clarifying questions, research, and visible plan + TODO output before approval. Interview uses the shared question system. BrainStorm coordinates one Q&A/research phase before one plan. Crew consumes the same approved plan/TODO contract.

**Chat controls.** Copy icons are always visible. `Stop`, `Edit`, and `Resend` apply only to the latest user message, with stop as immediate cancel and edit/resend rewinding later work. When scrolled away from the bottom, chat shows a jump-to-latest control with unseen-count badge.

**Slash commands.** Canonical reserved built-ins are `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`, and `/skill`. `/cancel` is an alias path to `/stop`. Reserved built-ins are not overridable by custom commands.

**Web and Site Reader.** `/web` exposes `search`, `extract`, `research`, `crawl`, and `map`. User-facing activity labels distinguish `Searching Web`, `Extracting Site`, `Researching Web`, `Crawling Site`, `Mapping Site`, and PM-native `Reading Site`. Final answers preserve source provenance and fallback visibility.

**Question system.** PM supports both single-question and multi-question questionnaire flows. Users may answer in any order, required questions block submit, drafts auto-save, and dismiss pauses the flow explicitly.

**Plan and TODO tracking.** Plan/Deep Plan emit normalized TODOs. The sticky plan panel is the authoritative tracker; inline chat updates are lightweight milestones. `todowrite` / `todoread` use the same normalized TODO schema.

**Terminal and activity transparency.** Chat uses shared inline operation cards for commands, web work, file reads/changes, diffs, and subagent activity. Command cards preview shell-backed activity inline, while the canonical interactive session remains the Terminal surface and `Open in Terminal` focuses the same live session.

**Skills.** Skill management lives in `Agent Config > Skills`; Skill Store is browse/install only. `/skill` is a lightweight invocation helper, not a management family.

**Runtime identity display.** Chat displays shared requested/effective runtime state and frozen historical snapshots, but assistant/chat docs do not own the runtime identity schema.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md

### 3. GUI layout and shell (Composergui6 / Plans/FinalGUISpec.md)

**Master layout.** IDE shell: title bar (28px), activity bar (48px), primary content (flex), side panels (left and right, 240-480px resizable), bottom panel (120-300px collapsible), status bar (24px). Retro-futuristic: paper texture, pixel grid, hard shadows, Orbitron/Rajdhani, neon accents.

**Zones.** Title bar: app name, project dropdown, theme, settings. Activity bar: icon-only vertical nav; reorderable. File Manager: left default; tree, search; detach, dock left/right, snap. **File Editor (IDE-style):** center-left between File Manager and Dashboard; tabs for open files; editable buffers, Save, line numbers, go-to-line/range, syntax highlighting; collapsible. Clicking a file path or code block in chat opens the file here. Dashboard: center; top half = monitoring widgets (orchestrator, progress, budgets, CtAs); bottom half = 4-way terminal grid (2×2), user-adjustable splitters. Chat: right default; thread list + message area; detach, dock left/right, snap. Status bar: mode, platform/model, context usage, notifications.

**File Manager panel.** Header (title, refresh, pop-out), search, file tree (virtualized), optional Git status strip. Selecting a file opens it in the **IDE-style editor** (File Editor strip). Detach/snap same as Chat; default dock left. Integration with Chat: @ opens file picker; context files as chips; **clicking a file path or code block in chat opens that file in the editor** (and scrolls to line/range when known); drag file into chat.

**Chat panel layout.** Header (CHAT, new thread, menu, pop out) → mode tabs (Ask, Plan, Interview, BrainStorm, Crew) → thread selector → **context circle** (OpenCode-style: usage % for thread; hover = tokens/usage %/cost; click = Usage tab for that thread) → thread list adjacent to message area (messages, queue, input, footer). Virtualized message stream; queued messages (max 2); input with @ and attach; **footer: platform dropdown, model dropdown (customizable list, OpenCode-style), reasoning/effort when platform supports it**, context usage. Plan panel when in Plan mode; activity badges. Responsive: narrow width abbreviates tabs; thread list can collapse to dropdown or icon.

**User-rearrangeable layout.** Dashboard widget cards (drag, 2-4 col grid); activity bar icon reorder and separator; side panel left/right; bottom panel tab order. Terminal 2×2 grid with user-adjustable splitters. Not on every screen (simple dialogs fixed). Persistence in redb: ui_layout, dashboard_layout, activity_bar_order.

**Detach/snap behavior.** State machine: Docked (side, width) ↔ Floating (window_id, position, size). Undock: double-click title, drag, or "Pop out." Snap zones (e.g. 25px from main window edge) with visual cue (accent strip). Close floating window → docked (collapsed or last side). Slint: one window per root component; floating panels separate components/windows; shared state via Rust bridge.

**Themes.** Light and Dark (retro): paper texture, pixel grid, scanlines, Orbitron/Rajdhani, palette (PAPER_CREAM, PAPER_DARK, ELECTRIC_BLUE, ACID_LIME, etc.), 2-3px borders, hard shadow. Basic: flat background, no texture/grid/scanlines, system sans-serif, +1px font sizes, line-height 1.6, 1px borders, 4px radius, muted accents (WCAG AA). Theme switch: live for colors/spacing/borders; restart for font family.

**Retro preservation.** Pixel grid and scanline overlays conditional on theme. Fonts: Orbitron (display), Rajdhani (UI). Palette from puppet-master-rs theme. Hard shadows, 2-3px borders; crosshatch/panel styling.

**Navigation.** Activity bar 6-8 icons by group (Home, Run, Config, Health, Data, Chat, Files). Click = default page; long-press/right-click = popover sub-menu; active = 3px left accent. Command palette Ctrl+P / Ctrl+K (fuzzy search pages, commands, settings). Breadcrumb "Group > Page" at top of content. Keyboard shortcuts (Ctrl+1-5, Ctrl+Shift+C/E/`, Ctrl+P/K, Ctrl+N, Ctrl+,).

**Bottom panel.** Tabs: Terminal, Problems, Output, Ports. Resizable 120-300px. Terminal = agent stdout/stderr; **Problems** = LSP diagnostics (MVP) (file, line, message, severity, source; click to open in editor -- Plans/LSPSupport.md, FinalGUISpec §7.20). Output = app logs. Collapse to tab bar; height persisted.

**Settings > LSP (LSP tab).** LSP is **MVP (required)** for desktop release. Full GUI for Language Server Protocol (Plans/LSPSupport.md, FinalGUISpec §7.4.2): **Disable automatic LSP server downloads** (global toggle, default off); **built-in LSP servers** list (all from OpenCode-aligned table) with **Enable** per server (all on by default) and per-server **Environment variables** and **Initialization options**; **Custom LSP servers** (add/edit/remove: name, command, extensions, env, initialization). Persisted in app config; optional project overrides.

**Migration from Iced.** Mapping of current views to new locations: Dashboard, Projects, Wizard, Interview, Config, Setup, Login, Settings, Doctor, Coverage, Tiers, Evidence, Metrics, History, Ledger, Memory; new Chat side panel, File Manager tab, Terminal/Output in bottom panel.


#### Scan additions (auto-import: GUI/layout)
##### Plans/FileManager.md
- **Call hierarchy view.** Incoming/outgoing call hierarchy tree view (FileManager §10.10.7).
- **Color picker for literals.** Swatches + interactive edits for color literals (FileManager §10.10.7).
- **Custom review rules.** Project-level automated code review rules stored in .puppet-master/review-rules (FileManager §10.8).
- **Editor diff view.** Inline/side-by-side diff (buffer vs disk/branches) with revert integration (FileManager §10.9).
- **Editor minimap.** Right-gutter minimap for quick navigation (FileManager §10.1).
- **External drag-and-drop to file manager.** Copy/move between OS and file tree with conflict handling (FileManager §1.1).
- **File watcher invalidation.** Auto-refresh tree on disk changes with optional watch toggle (FileManager §10.7).
- **Git status badges in file tree.** Status badges (M/A/D/R/U/?) integrated into tree (FileManager §13).
- **Semantic folding.** Semantic region folding via LSP (FileManager §10.10.7).
- **Session-scoped editor view state.** Per-thread cursor/scroll/selection state with restore prompt (FileManager §10.7).
- **Snippet/template expansion.** User/preset snippets with triggers/shortcuts (FileManager §10.9).
- **Sticky scroll.** Keep scope headers visible while scrolling (FileManager §10.1).
- **Visual design sidebar.** CSS/HTML drag-and-drop layout control with one-click apply (FileManager §10.6).

##### Plans/FinalGUISpec.md
- **Agent activity pane.** Read-only streaming subagent output pane with virtualization constraints (FinalGUISpec §7.19).
- **Bottom panel multi-tool suite.** Terminal/Problems/Output/Ports/Browser/Debug integrated bottom panel with hot-reload and inspect modes (FinalGUISpec §7.20).
- **Embedded document pane w/ annotations.** Live multi-doc preview with status badges, selection action palette, durable annotations, thread-scoped send-to-chat chips, and targeted resubmit-with-annotations flow (FinalGUISpec §7.19-§7.19.1).
- **File manager drag-drop + conflict dialogs.** Explicit UI contract for drag/drop + conflict resolution dialogs in file manager panel (FinalGUISpec §7.17).
- **Persona editor compatibility matrix.** Persona editor shows supported / partially supported / unsupported control state per provider (Claude Code, Cursor CLI, OpenCode, Direct/API) (FinalGUISpec §17.1).
- **Persona runtime control editor fields.** GUI support for default_platform/default_model/default_variant/temperature/top_p/reasoning_effort/talkativeness plus tool guidance and aliases (FinalGUISpec §17.2).
- **Surface-level Persona controls.** Chat, Interview, Requirements Builder, Orchestrator, and Multi-Pass expose Persona mode, effective Persona, platform/model display, selection reason, and override/lock controls (FinalGUISpec §17.4-§17.5).
- **Provider-gap disclosure in UI.** GUI must never imply unsupported Persona controls were honored; skipped controls are disclosed inline, via tooltips, or in run/history details (FinalGUISpec §17.7).
- **SSH remote file integration.** Remote file editing via SFTP with connection badge, offline resilience, conflict UI, and reconnect actions (FinalGUISpec §7.18).
- **Slash command catalog.** Reserved slash commands list and behavior contract (FinalGUISpec §7.16.2).
- **Usage page view.** Dedicated Usage view with quota summary and tool usage widgets (FinalGUISpec §7.8).
- **Web search UI with inline citations.** Chat web search with numbered inline citations + sources list UI (FinalGUISpec §7.16.1).

##### Plans/GUI_Rebuild_Requirements_Checklist.md
- **Context usage ring pop-out + compact now.** Enhanced context usage UI including "Compact Now" and detailed pop-out view (Checklist; assistant-chat-design §25).
- **Cross-cutting widget system.** Unified widget catalog with grid resizing defaults and layout persistence (Checklist; references Widget_System).
- **Docker runtime + DockerHub settings.** Advanced settings for docker runtime defaults, registry auth, and publish policy (Checklist; FinalGUISpec/newtools refs).
- **GitHub Actions generation settings.** Settings + templates + preview/apply flow for workflow generation (Checklist; FinalGUISpec/newtools refs).
- **Node graph display (DAG) view contract.** Airflow-style DAG view with detail panel and layout presets (Checklist; references Run_Graph_View).
- **Orchestrator single-page with 6 tabs.** Orchestrator page as single surface with Progress/Tiers/Node Graph/Evidence/History/Ledger tabs (Checklist; references Orchestrator_Page).
- **Preview + build controls UI contract.** Dashboard/orchestrator preview/build controls with artifact + session summaries (Checklist; FinalGUISpec §7.2; newtools).
- **Remove experimental settings section.** Explicit removal of Experimental GUI section/config keys/flags in Slint rewrite (Checklist; rewrite memo).
- **UI scaling migration (Iced→Slint).** Use Slint-native scaling; avoid Iced token multiplication scaling (Checklist; FinalGUISpec/rewrite memo).
- **Widget grid dashboard (card→widget migration).** Migrate dashboard from cards to widget grid with layout persistence and add-widget flow (Checklist; references FinalGUISpec Appendix C).

##### Plans/LSPSupport.md
- **Fallback when LSP unavailable.** Heuristic symbol search/no diagnostics plus optional install hint banner (LSPSupport §5).
- **LSP status indicator UI.** Status bar indicator for LSP server state (Initializing/Ready/Error) with server name (LSPSupport §1/§13).
- **LSP timeouts + cancellation.** Configurable request timeouts and client-side cancellation for stale results (LSPSupport §7/§14.4).

##### Plans/Orchestrator_Page.md
- **Agent terminal widget.** widget.agent_terminal live PTY output with ring buffer/virtualization (Orchestrator_Page §10).
- **CTA stack widget.** widget.cta_stack for HITL approvals, interruptions, rate limits, warnings (Orchestrator_Page §4).
- **Completed prose widget.** widget.completed_prose collapsible reverse-chron summaries of completed tiers (Orchestrator_Page §11).
- **Current task widget.** widget.current_task shows active tier objective, elapsed time, platform/model (Orchestrator_Page §4).
- **Evidence browser widget.** widget.evidence_browser with filters/search/detail preview and evidence types (Orchestrator_Page §7).
- **History list widget.** widget.history_list run history table with sortable columns (Orchestrator_Page §8).
- **Ledger table widget.** widget.ledger_table event ledger with token/cost/duration aggregation (Orchestrator_Page §9).
- **Orchestrator status widget.** widget.orchestrator_status run control surface with state badges and preview/build actions (Orchestrator_Page §4).
- **Progress bars widget.** widget.progress_bars shows phase/task/subtask completion bars (Orchestrator_Page §4).
- **Tier tree widget.** widget.tier_tree interactive tree with state badges, acceptance criteria, iteration count (Orchestrator_Page §5).

##### Plans/Run_Graph_View.md
- **Directed edge rendering contract.** Orthogonal routed edges with arrowheads and state-based coloring (Run_Graph_View §4.3).
- **Graph minimap.** Corner minimap with viewport rectangle and click navigation (Run_Graph_View §4.4).
- **Graph node rendering contract.** Node styling/size, status text, icons, and state-based colors (Run_Graph_View §4.1).
- **Large-graph optimization mode.** Level-of-detail fallback rules for 200+ / 500+ node graphs (Run_Graph_View §9.5).
- **Layout presets (5).** Selectable layout algorithms incl grouped-by-phase and critical path (Run_Graph_View §9).
- **Node detail panel sections.** Detail panel with summary/mapping/worker/verifier/activity/usage/HITL/deps/logs (Run_Graph_View §6).
- **Node graph display tab.** Full-page orchestrator tab showing live-updating DAG of plan execution (Run_Graph_View §1.2).
- **Node table + filtering.** Searchable right-panel node table with state filters and quick toggles (Run_Graph_View §5.2).
- **Two-way selection sync.** Graph↔table selection sync with multi-select via modifiers (Run_Graph_View §5.3).
- **Zoom/pan controls + fit-to-screen.** Wheel zoom, drag pan, fit-to-screen, and zoom indicator (Run_Graph_View §4.5).

##### Plans/UI_Command_Catalog.md
- **UI command catalog (cmd.* IDs).** SSOT catalog of cmd.* UICommand IDs across subsystems (GitHub/LSP/Graph/Widgets/Orchestrator/Chat memory) not enumerated in feature-list (UI_Command_Catalog).

##### Plans/UI_Wiring_Rules.md
- **Dispatcher routing boundary enforcement.** Explicit dispatcher boundary enforcing handler registration by command_id (UI_Wiring_Rules).
- **Element-to-command mapping uniqueness.** Schema-validated uniqueness keyed by ui_element_id in wiring matrix (UI_Wiring_Rules).
- **Expected event emission test coverage.** Tests verifying expected_event_types in matrix are actually emitted (UI_Wiring_Rules).
- **Handler location resolution verification.** Verify handler_location paths resolve to real Rust modules (UI_Wiring_Rules).
- **Handler statelessness verification.** Enforce handlers are stateless with respect to UI concerns (UI_Wiring_Rules).
- **Orphan UI element detection.** Detect interactive elements missing wiring matrix entry (UI_Wiring_Rules Rule 2).
- **Orphan UICommand detection.** Detect command IDs with no handler registration (UI_Wiring_Rules Rule 2).
- **UI pure-function constraint verification.** Verify view layer observes state only and never mutates state directly (UI_Wiring_Rules).
- **UICommand correlation_id requirement.** Require unique correlation_id per invocation in UICommand envelope (UI_Wiring_Rules).
- **Unknown command rejection behavior.** Structured error handling for unrecognized command_id (UI_Wiring_Rules §3.3).

##### Plans/Widget_System.md
- **Add-widget flow + searchable catalog overlay.** UI flow to add widgets via searchable catalog overlay with per-page caps (Widget_System: §4 Add-Widget Flow).
- **Layout persistence + migration.** Persist layouts in redb with versioned keys and auto-migrate legacy layouts (Widget_System: §7 Layout Persistence).
- **Per-widget configuration panel.** Standard widget config UI with widget-specific fields and debounced persistence (Widget_System: §5 Widget Configuration).
- **Preconfigured default layouts + reset.** Ship default layouts per page and allow reset with confirmation (Widget_System: §6 Preconfigured Defaults).
- **Responsive grid layout system for widgets.** Grid layout with responsive columns, snap resizing, row height, reflow rules (Widget_System: §3 Grid Layout System).
- **Standard widget chrome/header contract.** Uniform widget header (drag handle/title/gear/close) and themed content styling (Widget_System: §9 Widget Chrome).
- **Widget UICommand IDs.** Stable cmd.widget.* command IDs for add/remove/move/resize/config/reset_layout (Widget_System: §11 UICommand IDs).
- **Widget accessibility + keyboard navigation.** Keyboard navigation order, resize shortcuts, accessible roles/labels, screenreader announcements (Widget_System: §10 Accessibility).
- **Widget catalog system.** Canonical registry of widget types with stable IDs, metadata, page hosting rules (Widget_System: §2 Widget Catalog).
- **Widget data contracts (push vs pull).** Formal push/pull widget data source mapping and update mechanics (Widget_System: §8 Widget Data Contracts).
---

### 4. Orchestration and subagents

**Automatic task decomposition and orchestration flow.** Session-level prompt: assess → understand → decompose → act → verify. Trivial tasks (1-2 steps) proceed directly; complex (3+ steps) explicit plan → execute → verify. Optional role hints (planner, implementer, reviewer). Single canonical prompt; composition with rules pipeline; platform-compatible injection. No new tiers.

**Tier-level subagent strategy.** Phase: project-manager (default), architect-reviewer, product-manager; parallel possible. Task: by language (rust-engineer, python-pro, javascript-pro, etc.), domain (backend-, frontend-, fullstack-developer, etc.), framework (react-specialist, vue-expert, etc.); priority language → domain → framework; fallback fullstack-developer. Subtask: by type (code-reviewer, test-automator, technical-writer, etc.) and inherited task context. Iteration: by state and error patterns (compilation → debugger, test failure → test-automator + debugger, etc.). ProjectContext (languages, frameworks, domain, task_type, error_patterns); TierContext; SubagentSelector (detect_language, select_for_tier). Plan mode (our own, not provider CLI built-in): default true for all tiers; config and GUI toggle; Cursor --mode=plan, Claude --permission-mode plan; Gemini is Direct-provider (no CLI plan-mode flags).

**Background/async agents.** Multiple parallel runs with bounded queue. Git branch isolation per run (stash, branch, diff/merge). Output isolation; merge conflict detection. Queue manager (Rust); GUI panel for background runs. Main-flow vs background-flow policy; queue state persistence. Reuse WorktreeGitImprovement and MiscPlan.

**Orchestrator integration.** build_tier_context, select_for_tier (with tier overrides and required/disabled validated via subagent_registry), execute_subagent (sequential or parallel per config), build_subagent_invocation via platform_specs, run_with_cleanup at all runner call sites.

**HITL (human-in-the-loop).** Require explicit human approval at selected tier boundaries (phase, task, subtask). Three independent toggles; off by default. Pause after end verification at that tier; before advancing. GUI: one place (Orchestrator/Wizard/Dashboard settings). "Approve & continue" to advance; reject/cancel semantics at implementation. Dashboard CtAs when paused; addressable via Assistant or direct control. Recovery: if app closes while paused, on restore run stays "waiting for approval."


#### Scan additions (auto-import: orchestration)
##### Plans/Run_Modes.md
- **Budget: max_same_shell_failure.** Enforce per-run retry ceiling for repeated shell failures (Run_Modes §4).
- **Budget: max_write_thrashing.** Enforce per-run write-thrashing ceiling for same-file writes (Run_Modes §4).
- **DAE end-of-run scans.** Mandatory end-of-run scans: FileSafe audit, security-filter scan, diff reconciliation (Run_Modes §5.4).
- **DAE strategy (delegated agent execution).** DAE: provider executes tools in jailed workspace with enforcement/reconciliation (Run_Modes §2.2).
- **HTE strategy (hosted tool execution).** HTE: Puppet Master executes tools; provider plans only with zero delegated tool execution (Run_Modes §2.1).
- **Kill condition: hte_tool_observed.** Terminate if tool_use observed in HTE provider stream (Run_Modes §5.2).
- **Kill condition: shell_failure.** DAE terminate if same shell command fails 3+ consecutive times (Run_Modes §5.3).
- **Kill condition: write_thrash.** DAE terminate if same file written >5 times in 10 minutes (Run_Modes §5.3).
- **Mode-specific context compilation deltas.** Ask/plan read-only vs regular/yolo full context with rotation rules (Run_Modes §7).
- **Mode→strategy resolution algorithm.** Deterministic mapping from UI/config/policy to strategy for ask/plan/regular/yolo (Run_Modes §3).

##### Plans/orchestrator-subagent-integration.md
- **Autonomous QA loop pattern integration.** Integrate autonomous test/QA feedback loops into tier execution (orchestrator-subagent-integration).
- **BeforeTier/AfterTier lifecycle hooks.** Hook-based lifecycle middleware for tier boundaries (orchestrator-subagent-integration).
- **Error-pattern-based subagent escalation.** Escalate/select subagents based on detected error patterns (compile/test/security/perf) (orchestrator-subagent-integration).
- **LSP diagnostics-based subagent bias.** Bias subagent selection using current LSP diagnostics for in-scope files (orchestrator-subagent-integration).
- **Overseer AI role in orchestrator.** Explicit Overseer role coordinating tier execution (orchestrator-subagent-integration).
- **Platform capability manager.** Dynamic capability introspection + gating per platform for subagent features (orchestrator-subagent-integration).
- **Puppet Master crews.** Crew-based multi-agent coordination on the same tier with shared messaging (orchestrator-subagent-integration).
- **Tier-level effective Persona/runtime state.** Each tier run records requested/effective Persona, selection reason, requested/effective platform/model/variant, and applied/skipped Persona controls (orchestrator Persona addendum).
- **Tier auto Persona switching without new tiers.** Orchestrator can shift between planning/execution/review Personas inside existing Phase/Task/Subtask/Iteration structure; Iteration remains the lowest tier (orchestrator Persona addendum).
- **Registry normalization to explorer.** Canonical registry and plan language standardize on explorer, not stale explore naming (orchestrator Persona addendum).
- **Sharded-only plan graph consumption.** Orchestrator consumes validated sharded-only plan graph (not monolithic) (orchestrator-subagent-integration).
- **Start/end verification framework.** Start verification (wiring/readiness) and end verification (quality) at tier boundaries (orchestrator-subagent-integration).
- **Tier-level config-wiring validation.** Validate platform/model/effort wiring per tier at start of execution (orchestrator-subagent-integration).
---

### 5. Interview and wizard

**Interview subagent integration.** Phase assignments: Scope & Goals → product-manager; Architecture → architect-reviewer; Product/UX → ux-researcher; Data → database-administrator; Security → security-auditor, compliance-auditor; Deployment → devops-engineer, deployment-engineer; Performance → performance-engineer; Testing → qa-expert, test-automator. Cross-phase: technical-writer, knowledge-synthesizer, debugger, code-reviewer, context-manager, explorer, requirements-quality-reviewer. **42 subagents/personas** (canonical list in orchestrator-subagent-integration.md §4; task tool validates against this list per Tools.md §3.6). SubagentConfig owns phase/research/validation/document toggles plus phase_subagents and phase_secondary_subagents in InterviewOrchestratorConfig.

**Research engine and validation.** BeforeResearch/DuringResearch/AfterResearch; persist results, update phase context. BeforeValidation/DuringValidation/AfterValidation; remediation loop for Critical/Major (max retries, retry on severity). write_phase_document_with_subagent; write_prd_with_crew_recommendations.

**Document generation.** Phase docs, PRD, AGENTS.md for target projects (technology/version constraints, DRY Method, critical-first, size budget, linked docs). Convention templates by stack. Preserve sections when agents update.

**Chain-wizard flexibility: four intents.** New project (greenfield; full product, full interview, new repo, full PRD). Fork & evolve (upstream URL; delta requirements, delta interview, fork, delta PRD). Enhance/rewrite/add (existing project new to PM; delta scope, delta interview, same dir, delta PRD). Contribute (PR) (upstream; feature/fix scope, light interview, fork, branch, PR). State: store selected intent in app state and optionally .puppet-master/; pass to Interview and start chain.

**Requirements step.** Single prompt "Provide your Requirements Document(s)" with: (1) upload single/multiple files, (2) Requirements Doc Builder (opens Assistant with context; user triggers "Done -- hand off to Interview"; output to .puppet-master/requirements/). Framing text varies by intent. Multiple uploads; formats md, pdf, txt, docx; canonical input from all uploads + Builder; storage .puppet-master/requirements/.

**Adaptive interview phases.** Phase selector: AI or phase manager decides which phases to cut, shorten, or double down from intent and early context. Output: phase_id + depth (full | short | skip); optional reorder. Stored in interview state. Defaults: full intent → all full; Contribute → minimal set.

**Project setup and GitHub.** New project: optional "Create GitHub repo" (repo name, visibility, description, .gitignore, license, default branch); GitHub HTTPS API provider flow only. Auth is realm-split: `github_api` (repo/fork/PR API operations) and `copilot_github` (Copilot provider auth realm). Fork & evolve / Contribute: upstream repo; "Create fork for me" or "I'll create fork myself"; clone fork to project path; optional upstream remote. PR start: fork → clone → create feature branch. PR finish: commit, push, open PR (GitHub HTTPS API); "I'll commit and open PR myself" with instructions. Canonical GitHub flows: `Plans/GitHub_API_Auth_and_Flows.md`. Integration with WorktreeGitImprovement and MiscPlan (branch naming, PR body, no secrets).


#### Scan additions (auto-import: interview/wizard)
##### Plans/chain-wizard-flexibility.md
- **Contract unification handoff.** Explicit Requirements → Contracts → Plan → Execution handoff with end-of-interview contract unification pass (Contract layer section).
- **Intent-based workflows.** Wizard/interview flow adapts by intent (New Project / Fork & Evolve / Enhance / Contribute PR) (Intent-based workflows section).
- **No-wizard project management flows.** Project flows (add existing / create local / create GitHub repo) without mandatory chain wizard; wizard can be deferred (No-wizard flows section).
- **Requirements doc builder + review cycle.** Assistant generates requirements doc with optional multi-agent review cycle before user approval (Requirements/doc builder sections).
- **Requirements Builder Persona strategy.** Builder stages map to Personas: Collaborator for intake/clarification, Technical Writer for drafting, domain Personas for specialized fragments, and reviewer Personas for quality/final review (Requirements Builder Persona Strategy Addendum).
- **Per-stage/pass Persona + model selection in Builder.** Requirements Builder supports Persona/platform/model selection by stage or pass with capability-aware fallback and UI visibility of effective runtime choices (Requirements Builder Persona Strategy Addendum).
- **Three-pass canonical validation.** Mandatory multi-pass validation sweep (Document creation → docs+alignment → canonical-only) after contract completion (Three-pass canonical validation section).

##### Plans/interview-subagent-integration.md
- **Interview crews and communication enhancements.** Interview-phase crews, crew-aware plan generation, cross-phase coordination, research crews for tool discovery (Interview subagent integration crews section).
- **Interview lifecycle + quality enhancements.** BeforePhase/AfterPhase hooks, structured handoff validation, cross-session memory, remediation loops (Interview subagent integration lifecycle section).
- **Interview tab GUI gaps widgets.** Interview tab progress/activity visibility for doc creation and multi-pass review (Interview subagent integration GUI gaps).
- **Interview stage-based Persona strategy.** Interview distinguishes questioning, research, validation, drafting, and review Personas; Collaborator is the default questioning Persona and Technical Writer is the default drafting Persona (Interview Persona Stage Strategy Addendum).
- **GUI/UI/UX Interview model preference.** GUI/UI/UX interview work may prefer Gemini by default when available/configured, while remaining user-adjustable and capability-aware (Interview Persona Stage Strategy Addendum).
- **Interview effective Persona/model/platform visibility.** Interview activity panes and chat surfaces show effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls (Interview Persona Stage Strategy Addendum).
- **Platform-specific subagent invocation wrappers.** Platform-specific invocation wrapper/compat layer and limitations/workarounds (Interview subagent integration invocation).
- **Subagent file management (agent discovery).** Discovery/import module for provider-native agent files (.cursor/agents, .claude/agents, etc.) integrated into interview orchestration; provider-native files are seed material only, while Puppet Master Personas remain the canonical runtime source (Interview subagent integration file management).
- **Testing strategy for subagent integration.** Tests for file management, platform invocation, and integration scenarios (Interview subagent integration testing).
- **User-project output contract (sharded plan_graph).** Canonical output contract crosswalk, event model updates, and validation refs for user artifacts (Interview subagent integration output contract).
---

### 6. Rules, context, and safety

**Agent rules context.** Application-level rules (e.g. "Always use Context7 MCP") apply to every agent everywhere; stored at application level. Project-level rules (e.g. "Always use DRY Method") apply to every agent on that project; stored at project root (.puppet-master-rules.md, PROJECT_RULES.md, or .puppet-master/project-rules.md). Single rules pipeline: get_agent_rules_context(application_config, project_path) returns one formatted block (application + project). Callers: Orchestrator, Interview, Assistant. Order: application first, then project when project path set. GUI: Settings → Application rules; when project selected, Project rules panel. Bootstrap: seed from Puppet Master AGENTS.md if no application rules. Rewrite: single pipeline for providers, tool policy, agent loop; rules injection represented in unified event stream where relevant.

**Tool permissions and FileSafe.** Tool permissions (allow/deny/ask per tool; Plans/Tools.md) are evaluated first; FileSafe (command blocklist, write scope, security filter) runs after for allowed/approved invocations. Single policy entry point recommended: e.g. `may_execute_tool(tool_name, context)` → Allow | Deny | Ask; then FileSafe checks for bash/edit/read. See Tools.md §2.4, §10.6.

**FileSafe Part A -- Command blocklist (BashGuard).** Blocks destructive CLI commands (e.g. migrate:fresh, db:drop, TRUNCATE, git reset --hard, Docker volume prune) before run. Regex patterns from file; case-insensitive. Pattern file resolution: custom path → .puppet-master/destructive-commands.local.txt → bundled config/destructive-commands.txt. Env override PUPPET_MASTER_ALLOW_DESTRUCTIVE=1. Integration: BaseRunner::execute_command before spawn. Event logging (filesafe-events or event log). Config: bash_guard (enabled, allow_destructive, custom_patterns_path); GUI label "Command blocklist."

**FileSafe Part A -- Write scope (FileGuard).** Restricts writes to files declared in the active plan; no writes outside plan scope. Allowed set from request metadata (env, context files, plan). Check in BaseRunner before spawn. Config: file_guard (enabled, strict_mode); GUI label "Write scope."

**FileSafe Part A -- Security filter (SecurityFilter).** Blocks access to sensitive paths (.env*, *secret*, *key*, *.pem, id_rsa, config/secrets.*, etc.). Config: security_filter (enabled, allow_during_interview); GUI label "Security filter."

**FileSafe -- Prompt content checking.** Scan compiled prompt (after context compilation) for destructive commands; extract from code blocks, shell prompts, SQL. Check in platform runner after append_prompt_attachments. Same strategy for all providers.

**FileSafe -- Verification gate integration.** Allow destructive/sensitive operations when request tagged as verification-gate or interview (configurable).

**FileSafe -- Approved-commands whitelist.** Commands from Assistant chat approved by user; stored in FileSafeConfig; BashGuard allows when command matches approved list.

**FileSafe and Assistant YOLO mode.** When YOLO is on, there is no human approval step before tool execution. FileSafe is the primary protection layer for Assistant in YOLO mode. FileSafe settings must be configurable and easy to turn on or off.

**FileSafe Part B -- Context compilation and token efficiency.** Role-specific context compiler: compile_context(phase_id, role, plan_path, working_directory) → .context-{role}.md per role (Phase, Task, Subtask, Iteration). Delta context: "Changed Files (Delta)" from git diff since last phase/commit. Context cache: cache key = paths + mtimes/hashes; skip compile when valid; invalidate on change. Structured handoff schemas: typed JSON for inter-agent messages (phase_progress, task_blocker, etc.). Compaction-aware re-reads: marker file; if absent skip full plan re-read; set on compaction; clear on session start. Skill bundling: parse plan frontmatter skills_used; resolve skill paths; append "Skills Reference" to Task/Iteration context once per phase. Config: context.compiler_enabled, delta_context, context_cache, skill_bundling. Integration: call compiler in platform runner before building prompt.

**Context Compiler Graceful Degradation (Resolved):**
On context compiler failure:
1. **Use stale context** if available (cached result less than 5 minutes old from redb `context:compiled:{project_id}`).
2. If no stale context: **skip context compilation** and proceed with the raw file list (file paths only, no semantic context).
3. Log warning: `context.compiler.degraded` seglog event with failure reason.
4. Never prompt the user for context compiler failures — they are transient infrastructure issues.
5. Config: `context.compiler.stale_cache_ttl_s`, default `300` (5 minutes).

**Hook system.** Events: UserMessageSubmit, PreToolUse, PostToolUse, ContextWarning, CompactionTrigger, SessionStart, SessionEnd, Error. Continue, block, or modify. Hook runner with timeout (e.g. 5s per hook; configurable). PreToolUse hooks can call into FileSafe (Command blocklist) for dangerous-command blocking; one extension point. Config and GUI for hooks per event.

**Auto-compaction and context thresholds.** Warn at usage % (e.g. 75%); auto-compact at threshold; force at critical. Compaction step: summarize + preserve key items (files, decisions, open tasks, errors). Token counting: stream when available, else heuristic. Thresholds configurable; preservation rules. UI: "Compacting..." and context bar. Hooks ContextWarning, CompactionTrigger. Complementary to FileSafe context compiler (conversation compaction vs context compilation).


#### Scan additions (auto-import: rules/safety)
##### Plans/FileSafe.md
- **Chat-approved command whitelist.** User can approve blocked commands in chat and whitelist for future runs (FileSafe §13.4).
- **Delta context section (changed files).** Add Changed Files (Delta) section from git diff to compiled context (FileSafe §14.2).
- **Guard destructive git commands.** Block git reset --hard / force pushes etc. in bash guard (FileSafe §13.1).
- **Prompt SQL-injection pattern detection.** Detect SQL-injection-like prompt patterns (e.g., UNION SELECT/DROP TABLE) (FileSafe §13.2).
- **Rate limiting for blocked commands.** Track repeated guard violations and escalate/lock after thresholds (FileSafe §13.3).

##### Plans/Permissions_System.md
- **Ask-flow semantics once/always/reject.** Distinct ask responses: once (single), always (session rule + cascade), reject (cascade deny) (Permissions_System §6).
- **ELI5/Expert permissions UI toggle.** Permissions UI adapts to Interaction Mode for simplified vs expert views (Permissions_System §10.9).
- **GUI rule editor for permissions.** Interactive rule editor UI (add/delete/reorder, wildcard help) (Permissions_System §10.3).
- **Home expansion + normalization.** Expand ~/$HOME and normalize paths for permission rules (Permissions_System §3.2).
- **Named permission profiles + persona integration.** Named profiles directory and persona default_permissions_profile integration (Permissions_System §9/§10.7).
- **Pattern suggestion + auto-generation.** Derive suggested patterns during always-approve flow with user edit option (Permissions_System §3.4).
- **Permission precedence layers.** Formal layered precedence (mode override/session cache/persona/project/global/default) (Permissions_System §2.4).
- **TOML persistence for permissions.** Global/project TOML persistence locations for permission rules (Permissions_System §9.1).
- **Wildcard pattern syntax + ordering.** Pattern syntax (*,?, space wildcard) with last-match-wins ordering (Permissions_System §3.1).

##### Plans/agent-rules-context.md
- **AGENTS.md light enforcement.** Authoring-time lint + runtime budget enforcement (size/lines/headings) with warnings/blocks and deterministic truncation policy (AGENTS.md Light Enforcement section).
- **Context injection toggles.** User-configurable toggles for Parent Summary / Scoped AGENTS.md / Attempt Journal (Feature Spec section).
- **Tiered context injection bundles.** Tier-specific Instruction/Work/Memory bundle assembly with deterministic scoping and per-tier visibility rules (Feature Spec section).
---

### 7. Usage, recovery, and analytics

**Persistent rate limit and usage visibility.** Always-visible 5h/7d in UI (dashboard, header, or Usage page). Plan type where available. Tier config/setup show usage when selecting platform. Background refresh. State-file-first (usage.jsonl, summary.json); platform APIs augment when configured. Align with usage-feature.md.

**Usage feature (full scope).** Quota and plan visibility (primary); alerts and thresholds (e.g. 80% warning; rate limit hit → clear message, link to Usage); event ledger (platform, operation, tokens, cost, tier/session; filter and export); optional analytics (aggregate by time, platform, project, tier; cost when available; retention). Data sources: usage.jsonl (primary), summary.json (optional), active-subagents/active-agents for enrichment. Per-platform: Cursor API (usage/account only), Copilot GitHub metrics REST API, Claude Admin API + stream-json usage, Gemini Cloud Quotas + error parsing. GUI placement options: dedicated Usage page, or Dashboard + Ledger + quota widget, or compact usage in header + full Usage page. Success criteria: users see 5h/7d and plan without manual command; clear warning on limit; tier config shows current usage. Rewrite: usage as projections/rollups over seglog; durable KV in redb; fast search in Tantivy.

**Multi-Account and Usage page.** Multi-account support: multiple identities per provider, pick-best-by-usage, auto-rotation on rate limit, optional session migrate/resume for Claude; account registry and cooldowns in redb (Plans/Multi-Account.md). Dedicated Usage page is fully widget-composed (grid layout, add-widget flow); Multi-Account widget (`widget.multi_account`) is first-class on Usage and reusable on Dashboard (Plans/usage-feature.md, Plans/Widget_System.md).

**Session and crash recovery.** Periodic snapshots (e.g. 5 min); auto-save (e.g. 30 s). Restore last layout, session, optional message checkpoints. Retention policy. Recovery struct serialization (app phase, project path, orchestrator state, interview phase, window geometry, timestamp). Panic hook (best-effort). Schema version in snapshot. Non-blocking I/O. Config keys. "Restore previous session?" dialog on launch.

**History and rollback (restore points).** Snapshot after each iteration/message (files + content before/after). Rollback = restore files + truncate state. Conflict detection (mtime/hash). Retention (e.g. last 50). Rollback flow with confirmation; optional re-run verification. GUI History/Restore panel. Git alignment. Branching conversations: restore then fork; alternate branches with labels.

**Analytics and usage dashboard.** Aggregate usage by time, project, model/platform. By project: sessions, tokens, cost, last used. **Tool usage widget** on Usage page: per-tool invocation count, latency, error rate from seglog rollups (FinalGUISpec §7.8; Plans/Tools.md). Storage from existing state or redb rollups. "Know where your tokens go" framing. Time range selector; export CSV/JSON. Privacy/local only. Align with usage-feature and state-file-first.


#### Scan additions (auto-import: usage/analytics)
##### Plans/usage-feature.md
- **Alerts history log.** Optional persistent alerts timeline log (e.g., alerts.jsonl) for user review (usage-feature: Enhancement 8).
- **Compact header usage strip.** Optional header strip summarizing key usage (e.g., Cursor 5h / Claude 7d) linking to Usage page (usage-feature: Enhancement 5).
- **Configurable alert thresholds + quiet/dismiss.** User-configurable quota warning thresholds with optional cooldown/quiet period to suppress repeat warnings (usage-feature: Gap 5).
- **Estimated cost display with disclaimer.** Show approximate cost derived from token counts and pricing with explicit disclaimer when provider cost unavailable (usage-feature: Cost when platform doesn't report).
- **Multi-account widget as first-class catalog item.** Dedicated reusable widget for per-platform accounts, active account selection, and cooldown timers (usage-feature: Multi-Account Widget).
- **Per-tier usage breakdown in configuration.** Show per-tier usage metrics in config UI to identify top-consuming tier and adjust settings (usage-feature: Enhancement 3).
- **Per-widget configuration panel (Usage).** Each Usage widget has an independent config panel (time window, platform filters, chart options, columns) with persistent state (usage-feature: Per-Widget Configuration).
- **Platform-specific usage window labels + tooltips.** Show provider-specific window labels (Codex 5h/Claude 7d/etc.) with explanatory tooltips (usage-feature: Problem 4).
- **Reset countdown timer display.** Display “Resets in Xh Ym” for quota windows when reset time is known/derivable (usage-feature: Enhancement 2).
- **Widget-composed Usage page layout.** Usage page as a widget-composed, fully customizable grid with add/remove/move/resize widgets and responsive column behavior (usage-feature: Widget-Composed Page Layout Addendum).
---

### 8. Streaming, protocol, and UI polish

**Protocol normalization (multi-provider streaming).** Single internal stream format (message delta, usage, etc.). One parser/UI pipeline. "Show thinking," "token usage live," "streaming progress" platform-agnostic. Per-platform adapters. Minimal "orchestrator stream" schema (text_delta, thinking_delta, tool_use, tool_result, usage, done, error).

**Stream event visualization and thinking display.** Live stream events as icons/strip; extended thinking in collapsible area. Event types from normalized stream; last N events or sliding window. Accessibility for event strip.

**Bounded buffers and process isolation.** Fixed max size for stream/log buffers (e.g. 10 MB or 1000 lines); drop oldest when full. Process isolation: CLI subprocess only. Shared bounded buffer type and constants (e.g. limits module); document in AGENTS.md.

**Stream timers and segment durations.** Live duration per segment type (Thinking, Bash, Compacting, etc.); short history of last segments. UI "Current: ..." and "Last: ...."

**Interleaved thinking toggle.** Setting to show/hide extended thinking; per-session override. Align with normalized stream.

**Mid-stream token and context updates.** Real-time token count and context % during stream; usage/token-delta events; throttle updates.

**Virtualized conversation/log list.** Virtualized rendering for long lists (e.g. 10k+ items); slice by scroll position; overscan. Reuse for run log, messages, restore-point list.


#### Scan additions (auto-import: streaming/protocol)
##### Plans/CLI_Bridged_Providers.md
- **Auth/UX detection state machine.** Provider auth preflight + in-run error classification mapped to LoggedOut/LoggingIn/LoggedIn/AuthExpired/AuthFailed states (CLI bridged providers auth UX sections).
- **Claude hooks + transcript ingestion.** Ingest Claude Code hooks and transcript JSONL; reconcile with streaming events for usage/tool correlation (CLI bridged providers Claude provider sections).
- **Tool-call reconciler.** Reconciler for malformed/out-of-order/duplicated tool events across stream/hook/transcript sources (CLI bridged providers reconciliation sections).

##### Plans/Provider_OpenCode.md
- **Auth realms split (server vs upstream).** Separate auth realms for server and upstream provider (Provider_OpenCode §5.3).
- **Dynamic model list discovery.** GET /provider models grouped by provider with caching (Provider_OpenCode §7.1-7.2).
- **HTTP+SSE transport.** OpenCode server-bridged transport over HTTP + SSE streaming (Provider_OpenCode §4.2).
- **Health check + preflight auth detection.** GET /global/health and status mapping to auth states (Provider_OpenCode §5.2).
- **No fallback models policy.** Policy: do not hardcode fallback models; error if server unreachable (Provider_OpenCode §7.3).
- **Process isolation via session deletion.** Iteration isolation guarantee by session-per-iteration + deletion (Provider_OpenCode §12).
- **Server discovery + connection config.** Host/port discovery and connection method selection (Provider_OpenCode §5.1).
- **Session lifecycle mapping.** Explicit HTTP session create/delete mapped to run lifecycle (Provider_OpenCode §6.2).
- **Sync vs async invocation shapes.** Sync POST message vs async prompt_async + SSE shapes (Provider_OpenCode §13.1-13.2).
- **Version compatibility tracking.** Record server version and enforce minimum versions (Provider_OpenCode §5.4).

##### Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- **Artifact streaming as text projection pattern.** Pattern for converting incremental artifact updates into text_delta while preserving metadata (A2A §10 Pattern E).
- **Auth-required stream mapping.** Map upstream auth-required transitions into canonical events (A2A §8.4).
- **Deduplication policy for duplicate upstream events.** Rules for deduplicating duplicate upstream events (A2A §8.2).
- **Exactly-one terminal done arbitration.** Rules to emit exactly one terminal done event when upstream emits multiple (A2A §8.8).
- **Input-required pause semantics.** Treat input_required as resumable pause with diagnostics input_required/input_provided (A2A §8.3).
- **Overseer subjective audit protocol instrumentation.** Instrument multi-reviewer audit protocol with consensus/override semantics (A2A §9.1-9.4).
- **Pause/resume continuation without done.** Continuation rules for HITL input without emitting terminal done (A2A §8.3).
- **Raw observation ring buffer retention.** Bounded ring buffer for upstream events with truncation handling (A2A §8.6).
- **Reserved diagnostic instrumentation categories.** Normative reserved diagnostic categories with required detail keys (A2A §5.1-5.2).
- **Tool correlation reconciliation rules.** Synthesize orphaned tool_use/tool_result events and dedup multi-results deterministically (A2A §8.7).
---

### 9. Tools, MCP, and discovery

**Tool permissions.** Per-tool and optional wildcard allow/deny/ask; presets (Read-only, Plan mode, Full). Settings > **Permissions** tab: per-tool list (built-in + MCP-discovered) with permission dropdown; optional wildcard rules (e.g. `mymcp_*: Ask`). Central policy engine applies permission first, then FileSafe (command blocklist, write scope, security filter). Permission data persists via the canonical permissions config/GUI pipeline and the resolved snapshot is loaded at run start. YOLO bypasses ask (approval not prompted); Regular: approve once or for session. Plans/Tools.md (§2, §10 implementation plan); Permissions_System.md; FinalGUISpec §7.4.10.

**Tool usage widget.** Usage page shows per-tool metrics from seglog rollups: tool name, invocation count, latency (e.g. p50/p95), error rate (failed executed calls / total executed calls); optional sort/filter and time window. Canonical windows are `5h`, `24h`, and `7d`; the card also shows rollup freshness / last-updated metadata. Data comes from analytics scan writing `tool_usage.{window}` plus freshness metadata to redb. FinalGUISpec §7.8; storage-plan; Tools.md §8.4.

**newtools -- GUI/testing tool discovery.** Single source of truth: gui_tool_catalog (e.g. interview/gui_tool_catalog.rs or automation/). Per framework: framework ID, display name, detection hints, existing tools (name, description, install/setup, capabilities, doc URL), custom headless default. Research as input only; user always gets catalog-backed options and/or plan for custom headless. Interview flow: GUI stack detection from Architecture; testing phase lookup catalog; options: Playwright (when web), per-framework tools, "Plan/build custom headless GUI tool." Persist generate_playwright_requirements, selected_framework_tools, plan_custom_headless_tool. Test strategy: extend TestStrategyConfig with framework tools and custom headless section.

**Custom headless tool.** Full-featured (like this project): headless execution (e.g. tiny-skia), action catalog, full evidence (timeline, summary, artifacts, manifest). Standard path `.puppet-master/evidence/gui-automation/<run_id>/`; canonical evidence-in-chat layout comes from `Plans/newtools.md` §13. When chosen, tasks cover obtain/set up existing tools and/or plan/implement custom tool; acceptance criteria reference Playwright, framework tools, custom headless, and the canonical evidence/debug-log paths.

**MCP for all providers.** Config and verification for Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini. Canonical settings live in **Settings > Advanced > MCP Configuration**; provider-specific files/flags are derived adapters only when a CLI needs them. Context7 is on by default, API key field is masked, and Save/Test flows must verify provider readiness before a run injects MCP tools. Align with central tool registry/policy engine and Doctor/preflight checks.

**Cited web search.** Single implementation for Assistant, Interview, Orchestrator. Output: inline citations [1],[2] and Sources block (title + URL) using the canonical cited-search result schema. Activity transparency shows the query. Prefer a centrally registered MCP implementation (default server slug `websearch-cited`, tool name `websearch_cited`); support providers (Google, OpenAI, OpenRouter). Config covers enablement, provider/model preference, keys, timeouts, privacy controls, rate limits, auth failures, and no-results behavior.

**Doctor.** Headless tool check when `plan_custom_headless_tool = true`; platform version check per CLI; MCP checks for Context7/provider readiness and cited-search availability; catalog freshness for "catalog as of date X." Doctor/preflight output must distinguish config missing, auth failure, server unreachable, empty tool list, and stale catalog snapshots.

**Capability Introspection (`capabilities.get`).** Internal tool returning the full set of capabilities available to the running Puppet Master instance — both media capabilities (`media.image`, `media.video`, `media.tts`, `media.music`) and provider-tool capabilities (e.g., OpenCode-discovered tools). Each entry includes `enabled`, `disabled_reason`, and `setup_hint`. Assistant and Interviewer call `capabilities.get` when the user asks about available features; when Assistant is operating in the Requirements Doc Builder workflow, the same requirement applies. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§1](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). Registered in tool table: `Plans/Tools.md` §3.1.

**Media Generation (`media.generate` — Image / Video / TTS / Music).** Uniform internal tool for all media generation. Accepts a structured request envelope (`kind`, `prompt`, optional parameters: `count`, `aspect_ratio`, `size`, `resolution`, `duration`, `format`, `voice`, `bpm`, `seed`, `negative_prompt`, `quality`). Backend routing: Cursor-native for images only when Cursor is the active backend (Video/TTS/Music unsupported on Cursor); Gemini media APIs for all kinds on non-Cursor backends using the same requested/effective auth/account resolution model as standard Gemini usage. Artifacts written to `.puppet-master/artifacts/media/<request_id>/` (artifact paths, not data URIs). Stable error codes (§2.6 of SSOT). Natural-language slot extraction grammar (deterministic regex-based parsing) runs before `media.generate` to produce the request envelope from user prompts. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), [§3](Plans/Media_Generation_and_Capabilities.md#SLOT-EXTRACTION).

**Per-message model override.** Users can specify a model for a single `media.generate` request inline in their prompt (e.g., "Generate an image using Nano Banana Pro") without changing the persistent model in Settings. The override is ephemeral — it applies only to the current invocation. Resolution: alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. Canonical media model aliases (Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro) are defined in `Plans/Models_System.md` [§6.8](Plans/Models_System.md#MEDIA-ALIASES). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2.3](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), `Plans/Models_System.md`.

**Capability picker dropdown.** Composer-area dropdown showing the four media capabilities (Image, Video, TTS, Music). Disabled capabilities are visible but greyed out with a tooltip showing the disabled reason. When visible capabilities are blocked because no eligible Gemini account is configured for the resolved request/policy, a banner/footnote displays "Configure Gemini access in Settings -> Authentication." with sign-in / API-key guidance and a "Get API key" link. Clicking an enabled capability inserts a verbatim prompt guiding the user to describe their generation request. Provider-exposed tools (e.g., OpenCode tools) appear in `capabilities.get` output but are NOT part of this media dropdown. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§4](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER), [§5](Plans/Media_Generation_and_Capabilities.md#UI-COPY).


#### Scan additions (auto-import: tools/discovery)
##### Plans/BinaryLocator_Spec.md
- **Binary error taxonomy + UI mapping.** Stable error codes (e.g., NotFound/NotExecutable/BlockedByOSSecurity/Timeout/etc.) mapped to health/install UI states (BinaryLocator spec error taxonomy).
- **BinaryLocator discovery & validation.** Deterministic multi-layer binary discovery + validation (override/PATH/common locations/launchers) with caching and version parsing (BinaryLocator spec).
- **Cursor agent versioned bundle resolution.** Deterministic selection of Cursor agent binary from versioned bundle directories per-OS (BinaryLocator spec probe layers).

##### Plans/Commands_System.md
- **Command storage + override resolution.** Project-local and global command directories with deterministic override/precedence rules (Commands System storage/discovery).
- **Command templates: args/includes/shell-injection.** Template features like $ARGUMENTS/$1, @path includes, and !`shell` expansion integrated with permissions (Commands System templates/permissions).
- **GUI command manager.** GUI surface to create/edit/delete commands, scope selection, dry-run preview, and shortcut bindings (Commands System GUI management).
- **User commands system.** User-authored command presets with YAML frontmatter + template bodies, invocable via slash/command palette (Commands System overview).

##### Plans/Formatters_System.md
- **Built-in formatter catalog.** Built-in formatter support across many ecosystems (Formatters_System §3).
- **Custom formatter definitions.** User-defined formatters with command/env/extensions and $FILE placeholder semantics (Formatters_System §4.3-4.4).
- **Formatter $FILE argument insertion rule.** If $FILE absent in command, append file path as last arg; otherwise substitute (Formatters_System §4.3).
- **Formatter auto-detection.** Auto-detect available formatters via binary checks + config file presence (Formatters_System §3).
- **Formatter error handling + preserve output.** Non-zero exit preserves output and logs a format.error event with stderr/exit code (Formatters_System §2.3).
- **Formatting evidence ledger events.** Record format.applied events and diff metadata to distinguish formatter changes (Formatters_System §2.2).
- **GUI formatter settings tab.** Dedicated GUI tab to manage formatters, scope select, and custom tool entries (Formatters_System §5).
- **Global + project formatter config.** Global config plus per-project override config persistence (Formatters_System §4.5).
- **Per-formatter config fields.** Config fields like disabled/command/environment/extensions with overrides (Formatters_System §4.2).
- **Sequential formatter pipeline.** Run multiple formatters sequentially in registration order after edits (Formatters_System §2.1).

##### Plans/Media_Generation_and_Capabilities.md
- **Disabled-reason precedence ordering.** Deterministic precedence when multiple disabled causes apply (BACKEND_UNSUPPORTED→...→MODEL_UNAVAILABLE) (Media §1.4).
- **Media acceptance criteria suite.** AC-MED01..AC-MED15 covering capabilities.get/media.generate behavior, error codes, storage, and UI compliance (Media §6).
- **Media kind detection + precedence rules.** Pre-processing of control blocks + kind detection via prefixes/keywords/verb fallback and deterministic parameter precedence (Media §3.1-3.3).
- **Media slot-extraction mini-grammar.** Deterministic regex grammar to extract structured media params from prompts (count/aspect/size/duration/format/voice/quality/seed/bpm/negative prompt) (Media §3).
- **Per-field extraction normalization rules.** Detailed per-field regex/normalization for aspect_ratio/duration/voice/BPM/seed/negative_prompt etc. (Media §3.5-3.14).
- **Prompt cleaning after control extraction.** Strip matched control spans and preserve creative prompt text (Media §3.15).

##### Plans/MiscPlan.md
- **Active cleanup operation tracking.** Track active cleanup state in a state file for audit/debugging (MiscPlan §10.6.4).
- **Bulk skill permission by pattern.** Apply permissions to multiple skills matching wildcard patterns with override precedence (MiscPlan §7.11.2).
- **Cleanup coordination via crews.** Crew coordination for cleanup operations, preserving evidence and warning about protected files (MiscPlan §10.5.1).
- **Cleanup dry-run preview.** Optional dry-run/preview listing files to remove before executing cleanup (MiscPlan §9.1.9).
- **Cleanup failure remediation loop.** Automatic retries/escalation with error categorization for cleanup failures (MiscPlan §10.6.5).
- **Cleanup lifecycle hooks.** BeforeCleanup/AfterCleanup hooks tracking cleanup and validating workspace state (MiscPlan §10.6.1).
- **Cross-session cleanup pattern memory.** Persist cleanup patterns/excludes for future optimization (MiscPlan §10.6.3).
- **Keyboard shortcuts editor UI.** GUI to view/edit/reset keyboard shortcuts with search and export/import (MiscPlan §7.7/§7.9).
- **Structured cleanup result schema.** CleanupResult structured output (files_removed, errors, warnings, duration_ms) for validation (MiscPlan §10.6.2).
- **Target-project DRY method seeding.** Interview generates initial AGENTS.md with DRY Method + tech/version constraints for target projects (MiscPlan §1).

##### Plans/Models_System.md
- **Configurable model priority list.** User-configurable model priority ordering array for selection (Models_System §2.1).
- **Model availability refresh action.** Explicit refresh/availability checks at startup/before runs/on-demand (Models_System §4.1).
- **Overflow detection + auto-compaction trigger.** Provider-specific overflow detection patterns that trigger compaction and retry behaviors (Models_System §4.2-4.3).
- **Per-model option overrides.** Model-specific option overrides (temperature/top_p/reasoning_effort) over provider defaults (Models_System §3.2).
- **Provider Persona capability matrix.** Canonical supported / partially_supported / unsupported matrix for Persona prompt/model/variant/effort/temperature/top_p/tool/subagent controls across Claude Code, Cursor CLI, OpenCode, and Direct/API providers (Models_System §10.4).
- **Requested vs effective runtime control state.** Runs persist requested/effective platform/model/variant and effective temperature/top_p/reasoning_effort plus applied/skipped Persona controls (Models_System §10.2-§10.3).
- **Unsupported control disclosure rules.** Persona-requested controls unsupported by the active provider are skipped explicitly and surfaced in editor/runtime UI rather than silently ignored (Models_System §10.5-§10.7).
- **Per-provider model options.** Provider-level default option map (e.g., max_output_tokens, temperature) configurable via provider options (Models_System §3.1).
- **Provider normalization details.** Per-provider message normalization, beta headers, schema transforms, and token enforcement (Models_System §3.4).
- **Standard option fields spec.** Formal supported option fields, types, and defaults (Models_System §3.3).

##### Plans/Plugins_System.md
- **Config-sourced plugin packages.** Plugins.packages config supports package specifiers and file:// URLs for discovery (Plugins_System discovery/storage).
- **Deterministic hook execution order.** Plugin hooks execute in deterministic load-order across runs (Plugins_System load/execution).
- **Hook event catalog.** Defined hook events: tool.execute.before/after, permission.ask, session.start/end, chat.message/params, session.compacting, shell.env, system.prompt.transform (Plugins_System hooks).
- **Hook timeout + error handling.** Hook timeout defaults and panic/error handling semantics with configurable behavior (Plugins_System hook semantics).
- **OpenCode backward-compat mappings.** Compatibility mapping for experimental hook names and prompt injection semantics (Plugins_System baseline/deltas).
- **Per-persona plugin disabling.** Personas can disable plugins via disabled_plugins in persona frontmatter (Plugins_System config/persona integration).
- **PluginContext API.** Standard PluginContext object (register_hook/register_tool/log/data dir, etc.) for plugins (Plugins_System lifecycle).
- **Plugins settings UI (ELI5/Expert).** GUI Plugins tab with ELI5 vs Expert views, timeouts, override flags, and details (Plugins_System GUI).
- **Structured plugin event logging.** Typed events like plugin.loaded/hook.invoked/hook.error/tool.registered, etc. (Plugins_System logging).
- **Tool name collision resolution.** Namespaced aliasing and explicit allow_tool_override rules for plugin tools vs built-ins (Plugins_System tool registration).

##### Plans/Skills_System.md
- **Canonical skill discovery roots.** Deterministic discovery from multiple project/global roots (.puppet-master/.claude/.agents) (Skills_System §3.1).
- **Central skill registry runtime surface.** Runtime registry of discovered skills used by GUI/personas and skill tool resolution (Skills_System §4.1).
- **Invalid skills listed in GUI.** GUI must list invalid skills with validation errors (Skills_System §6).
- **Persona default_skill_refs resolution.** Resolve default_skill_refs at run start; warn on missing refs (Skills_System §4.2).
- **Shadowed skill visibility warnings.** GUI exposes shadowed duplicates (same skill ID) with warnings (Skills_System §3.2).
- **Skill discovery validation.** Validate YAML frontmatter and directory-name-to-skill-id matching during discovery (Skills_System §3.3).
- **Skill source column in GUI.** GUI indicates Project/Global and which root each skill came from (Skills_System §6).
- **skill tool path validation.** skill tool enforces paths under allowed discovery roots (Skills_System §4.3; AC-SK03).

##### Plans/Tools.md
- **Custom tools system.** User/project-defined tools with schema, discovery, and sandboxing (Tools §4).
- **GitHubApiTool (only GitHub HTTPS interface).** Single allowed interface for GitHub HTTPS API calls (Tools §3.7).
- **MCP tool namespacing rules.** Server slug and wildcard matching rules for MCP tool namespacing (Tools §8.6).
- **Per-tool rate limits.** Optional per-tool invocation limits per run/session (Tools §9.2).
- **multiedit tool.** Batch string replacements in a single operation with limits (Tools §3.1).
- **patch tool.** Apply unified diff patches with write-scope validation (Tools §3.1).
- **question tool.** Ask user questions mid-run with options/freeform responses (Tools §3.1).
- **skill tool.** Load skills into context with path validation (Tools §3.1).
- **webfetch tool.** Fetch web content from URL with allowlist/denylist, timeout, and size caps (Tools §3.1).

##### Plans/newtools.md
- **Automation migration contract (Iced→Slint).** Migration boundaries for evidence schema compatibility and backend abstraction (newtools §14.9).
- **Docker runtime + DockerHub contract.** Docker compose orchestration, preflight checks, registry auth/push, settings UI (newtools §14.7).
- **Doctor preflight matrix.** Readiness checks across display runtime/mobile simulators/docker/github actions with failure contracts (newtools §14.10).
- **Evidence-in-chat contract + media rendering.** Schema for gui_automation_manifest + inline media rendering and evidence cards in chat (newtools §13).
- **GitHub Actions generation contract.** Workflow template selection, validation, preview rendering, and generation flows (newtools §14.8).
- **Live visualization execution architecture.** Non-headless automation with real-time status streaming and media capture across platforms (newtools §14).
- **Mobile testing stacks defaults.** Concrete iOS/Android/RN testing defaults with artifact capture strategies (newtools §14.5).
- **Preview/build controls UI contract.** UI command IDs and surfaces for preview/build launch with artifact reporting (newtools §14.6).
- **Research crews for tool discovery.** Multi-agent coordination system for concurrent tool discovery research (newtools §12.7).
- **Tool discovery lifecycle hooks.** BeforeResearch/AfterResearch lifecycle + structured handoff validation + memory persistence for tool choices (newtools §12.8).
---

### 10. Git and worktree

**WorktreeGitImprovement.** Base branch from config.branching.base_branch. active_worktrees persistence: repopulate from list_worktrees() on init/load or fallback worktree_manager.get_worktree_path(tier_id). Merge conflicts: surface worktree path; avoid reusing tier_id until user resolves/discards. Sanitize tier_id and branch name (ref-safe). Branch already exists: check before worktree add -b; if exists use worktree add path branch or safe delete. Detached HEAD: treat missing branch as detached; merge_worktree skip or merge by commit when source_branch empty. worktree_exists: path exists and valid worktree. Recovery when project selected. PR head branch: resolve from worktree when active_worktrees has no entry. merge_worktree: ensure target_branch exists or create/error. Documentation: STATE_FILES subsection on worktrees. Doctor: worktrees check (git worktree list, verify .puppet-master/worktrees, optionally detect_orphaned_worktrees). Optional: re-validate worktree path before building IterationContext.

**Git.** Shared resolution for git binary (path_utils::resolve_git_executable); GitManager and Doctor use it. PR creation uses GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` through the `github_api` realm (independent from `copilot_github`). Branch strategy from config (e.g. branching.strategy); use in create_tier_branch (no hardcoded Feature). Branch naming: single implementation (e.g. BranchStrategyManager); remove duplicate logic in orchestrator. naming_pattern wire into branch name generation or hide and document. Commit format: CommitFormatter::format_iteration_commit for "pm:" convention. git-actions.log align path with REQUIREMENTS and .gitignore policy. Doctor: optional check project dir is repo and basic git works. Empty commit: detect "nothing to commit" and log at debug/info.

**Config wiring (Option B).** At run start build PuppetMasterConfig from current gui_config so run sees latest UI (enable_parallel_execution, branching, etc.) without Save. Branching tab: Enable Git, Auto PR, Branch strategy (MainOnly/Feature/Release); wire Use worktrees, Auto merge on success, Delete on merge; fix/hide naming_pattern. Fields to wire: enable_parallel_execution, enable_git, branching.base_branch, branching.auto_pr, optionally strategy/granularity/naming_pattern. Worktree visibility (optional): list worktrees, "Recover orphaned worktrees" button.


#### Scan additions (auto-import: git/worktrees)
##### Plans/GitHub_API_Auth_and_Flows.md
- **Credential store keying schema.** OS credential store keying/payload schema for GitHub tokens (GitHub auth flows credential storage).
- **Credential-store unavailable fallback mode.** Session-only in-memory token mode when OS store inaccessible; reconnect required after restart (GitHub auth flows).
- **Deterministic device-flow polling.** Polling algorithm handling authorization_pending/slow_down (+5s), expiry deadlines, and response codes (GitHub auth flows device flow section).
- **Failure-state taxonomy + canonical UX copy.** Mapped failure kinds with title/body/actions (GitHub auth flows failure states).
- **GitHub request envelope + rate-limit handling.** Canonical headers + deterministic primary vs secondary rate-limit behavior (GitHub auth flows request envelope).
- **Repo push permission checks.** Pre-PR check for push permissions (API check + fallback to push failure signal) (GitHub auth flows).
- **SSH remote dev server auth context.** Auth behavior considerations for SSH-based development servers (GitHub auth flows stub section).
- **Scope verification + missing-scope UX.** Post-auth scope validation via X-OAuth-Scopes and MissingScopes failure state w/ UI consequences (GitHub auth flows).

##### Plans/GitHub_Integration.md
- **Branch create/switch + stash handling.** Searchable branch switcher, create branch validation, and deterministic stash/discard options (GitHub Integration §A.4).
- **Changes list bulk ops.** Staged/Changes/Untracked groups with bulk stage/unstage/discard and per-file recovery (GitHub Integration §A.2).
- **Commit UI with amend + hook recovery.** Commit form with amend toggle, force-push warnings, and hook failure recovery (GitHub Integration §A.4).
- **Diff preview panel modes.** Side-by-side/unified diff viewer with truncation rules and persisted preferences (GitHub Integration §A.3).
- **Git panel IDE surface.** Full Git UI: status, changes list, diff preview, stage/unstage/commit/push/pull/sync/fetch (GitHub Integration §A).
- **GitHub Actions panel + workflow dispatch.** Runs list/detail, log viewer, download logs, trigger workflow_dispatch with inputs and auto-refresh (GitHub Integration §B.3).
- **GitHub device-code auth UX.** IDE device-code flow UI for github_api realm with OS credential-store-only persistence (GitHub Integration §B.1).
- **No-wizard project management flows.** Add existing / create local / create GitHub repo flows without chain wizard requirement (GitHub Integration §D).
- **PR & issues panel with caching.** PR/issues surfaces with caching/TTL, status columns, and create PR flow (GitHub Integration §B.2).
- **Repo/branch status bar.** Upstream tracking indicators (ahead/behind/diverged/etc.) with repo/branch badges (GitHub Integration §A.1).
- **Reserved UICommand IDs + config keys.** Stable cmd.git/cmd.github/cmd.ssh IDs and config keys reserved for integration panels (GitHub Integration §E-F).
- **SSH remote dev server management.** Add/manage SSH targets, host key verification, status badges, and remote context (GitHub Integration §C).
- **Stash management UI.** Auto-stash with timestamps, stash list dropdown, pop w/ conflict recovery behavior (GitHub Integration §A.4).

##### Plans/WorktreeGitImprovement.md
- **Branch name + tier_id sanitization.** Sanitize tier_id for path safety and sanitize branch names for valid git refs (WorktreeGitImprovement: §2.4).
- **Branching tab GUI wiring.** Branching tab controls (Enable Git, Auto PR, strategy, worktrees toggle, auto-merge, delete-on-merge) wired live without explicit Save (WorktreeGitImprovement: §5.3/Phase 4).
- **Detached HEAD worktree handling.** Treat missing branch as detached; merge logic handles commit-hash-based merges or skips (WorktreeGitImprovement: §2.6).
- **Doctor: worktrees validation check.** Doctor validates worktree state, detects orphans, suggests recovery actions (WorktreeGitImprovement: §2.11).
- **GUI config schema reconciliation at run start.** Resolve mismatch between GuiConfig and PuppetMasterConfig (enable_parallel/strategy/branching) when building run config (WorktreeGitImprovement: §5.1–7.1).
- **GitHub PR creation via HTTPS API realm.** Create PRs using github_api realm (HTTPS API) without relying on GitHub CLI integration (WorktreeGitImprovement: §3.2).
- **Merge conflict worktree recovery UI.** Surface conflicting worktrees, block tier_id reuse until resolved/discarded, and offer recovery UI actions (WorktreeGitImprovement: §2.3).
- **Unified git binary resolution.** Single shared git executable resolution used by GitManager + Doctor for consistency (WorktreeGitImprovement: §3.1).
- **Worktree lifecycle docs in STATE_FILES.** Add STATE_FILES documentation for worktree lifecycle/paths/persistence/recovery mechanics (WorktreeGitImprovement: §2.11).
- **Worktree orphan detection + recovery on project load.** Repopulate active_worktrees from git worktree list and expose recovery UI in Health/project selection (WorktreeGitImprovement: §2.8).
---

### 11. Cleanup and runner contract

**MiscPlan -- Cleanup policy.** Never remove: state files (progress.txt, AGENTS.md, prd.json, etc.); .puppet-master/ except where retention allows pruning; config/discovery under .puppet-master/. May remove: untracked files/dirs in workspace/worktree except allowlisted. Allowlist (DRY:DATA): .puppet-master/, .gitignore, progress.txt, AGENTS.md, prd.json, sensitive patterns, paths.workspace, explicit preserve list; when newtools GUI automation exists: .puppet-master/evidence/gui-automation/. .puppet-master/agent-output/ is clearable by policy. Scope: main repo or worktree path. Mechanism: configurable conservative (known temp/agent-output) vs moderate (git clean -fd with excludes) vs clean ignored (-fdx). Default conservative. Gitignore and security: respect .gitignore; never expose secrets; no git add -f for sensitive paths; cleanup excludes .env, *.pem, etc.; never log/commit/evidence/PR body: tokens, keys, credential contents.

**Runner contract.** prepare_working_directory(work_dir, config): ensure path is git repo; run untracked cleanup only here (git clean -fd with excludes from allowlist); clear agent-output dir when config says; do not reset tracked state unless future config; on failure log warning, continue best-effort. cleanup_after_execution(pid, work_dir, config): terminate process if needed; remove runner temp files only; do not run broad git clean here. run_git_clean_with_excludes(work_dir, clean_untracked, clean_ignored): single helper; uses cleanup_exclude_patterns(); shared git binary. run_with_cleanup(runner, request, config): wrapper prepare → execute → cleanup. All call sites (ExecutionEngine caller, research_engine, start_chain, execute_ai_turn when project known) use wrapper or explicit prepare/cleanup. Runners keep only execute; no prepare/cleanup on PlatformRunner; wrapper is single entry point.

**Module and config.** src/cleanup/: mod.rs, workspace.rs. DRY:DATA allowlist; DRY:FN prepare_working_directory, cleanup_after_execution, run_git_clean_with_excludes, run_with_cleanup. CleanupConfig: untracked, clean_ignored, clear_agent_output, remove_build_artifacts, skip_prepare_for_conversation. IterationContext: cleanup_config; ExecutionEngine gets it and calls prepare/cleanup.

**Agent-output dir.** .puppet-master/agent-output/ (DRY:DATA). Optional run subdirs. Clear in prepare_working_directory when config says; clear contents, keep dir.

**Evidence retention and pruning.** Config: retention_days, retain_last_runs, prune_on_cleanup. prune_evidence_older_than(base_dir, config): DRY:FN; list evidence; remove older than retention; not in cleanup_after_execution hot path.

**Cleanup UX.** Config → Advanced → "Workspace / Cleanup": clean untracked, clean ignored, clear agent-output, remove build artifacts, evidence retention. "Clean workspace now" in Doctor or Advanced: resolve project path from same source as run; run prepare-style run_git_clean_with_excludes; confirmation; optional dry-run (git clean -fd -n) and list. Optional "Clean all worktrees" using worktree list. Widgets: gui-widget-catalog (styled_button, confirm_modal, toggler, etc.).

---

### 12. Extensibility and other
This section tracks promoted feature inventory and its owner-doc routing for the rewrite planning set.

**Promoted Section 15 owner.** `Plans/Section15_MVP_Promoted_Features_Spec.md` is the primary owner for the promoted Section 15 feature set. The subsystem docs below remain authoritative for their own storage, command, permission, shell, and UI details.

**Database and projections.** Per rewrite: seglog (canonical ledger), redb (durable KV state/projections/settings), Tantivy (full-text search). Queryable history, analytics, and recovery metadata are produced from these; no separate SQLite for run/session/history.

**Branching conversations.** Restore then fork; alternate branches with labels and visible lineage.

**In-app project instructions editor.** Edit project rules and project instruction files in-app; save targets match the runtime-consumed instruction paths.

**`@` mention system.** `@` in prompt opens autocomplete rooted in the active project; insertion preserves the canonical file identity used by prompt assembly and click-to-open behavior.

**Multi-tab and multi-window.** Workspace tabs are first-class, each with its own view/context and active project. Multiple windows may host workspace tabs; tab and window state persist with deterministic fallback when drag-between-window support is unavailable.

**Project and session browser.** Browse projects and their sessions/runs/threads with search/filter and project/session status visibility.

**Instant project switch.** Project switching is workspace-tab based by default. The active workspace tab switches project immediately, and a separate command opens a target project in a new workspace tab. Background activity from non-active projects remains visible through badges and attention surfaces.

**Built-in browser and click-to-context.** Browser behavior uses in-shell browser tabs plus detached preview windows. Automation and auth browser sessions remain separate ephemeral classes. User-triggered share-to-agent state is visible and revocable.

**Full IDE-style terminal and panes.** Terminal sessions, Problems, Output, Debug Console, and Ports are canonical panes tied to project and dev-session state.

**Hot reload, live reload, fast iteration.** One-click dev-session launch, stack-aware reload behavior, integrated output panes, explicit fallback to live reload, and explicit termination rules on switch/close.

**Sound effects settings.** Per-event enable/disable and sound selection with persisted settings and accessibility-aware behavior.

**Updating Puppet Master.** Version visibility, update discovery, and compatibility-aware upgrade path information.

**Cross-device sync.** Manual export/import plus BYOS sync targets for config/state/history payloads with explicit conflict policy.

**One-click install (no code).** Curated catalog lifecycle for commands, agents, hooks, skills, themes, and MCP configs, including install, update, remove, and active-item conflict behavior.

#### Scan additions (auto-import: extensibility/other)
##### Plans/Section15_MVP_Promoted_Features_Spec.md
- **Promoted Section 15 owner.** Canonical owner for shell/project-switch/browser/tab/window/dev-loop/catalog/usage/branching defaults and cross-feature rules.

##### Plans/newfeatures.md
- **Historical/origin source for promoted Section 15 ideas.** Normative behavior for promoted items lives in the promoted owner doc and reconciled subsystem SSOTs; this file remains the origin/reference source.
### 1. GUI and views

**Pages.** Dashboard, Projects, Wizard, Config, Doctor, Tiers, Evidence, Metrics, History, Coverage, Memory, Ledger, Login, Settings, Setup, Interview, NotFound. Config currently has multiple tabs: Project, Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, GUI Automation.

**Theme.** Light/Dark (AppTheme); palette and semantic colors (background, text, surface, accent, success, shadow, etc.) per theme in theme/palette.rs, colors.rs, styles.rs, tokens.rs, scaled.rs.

**Widget catalog.** Navigation/header (Page, header, simple_header); selectable text and context menu (selectable_label, selectable_label_mono, selectable_text_input, selectable_text_field, context_menu_actions); buttons/inputs (styled_button, styled_button_sized, variants, styled_text_input, labeled_input, code_input); layout (page_header, refresh_button, responsive_form_row, responsive_label_value, responsive_columns, responsive_grid); status (status_badge, status_dot, pulsing_status_dot, auth_status_chip); panels (panel, themed_panel, panel_with_title, panel_with_header); modals/toasts (modal_overlay, confirm_modal, error_modal, toast_overlay, ToastManager); feedback (progress_bar, help_tooltip, help_text, get_tooltip); specialized (terminal_output, terminal_compact, terminal_large; interview_panel; budget_donut, usage_chart; step_circle_canvas; paper_texture, pixel_grid, scanline_overlay, retro_overlay; icon, icon_sized; page_transition). See docs/gui-widget-catalog.md.

### 2. Platforms

**Supported providers (rewrite).** CLI-bridged: Cursor, Claude Code. Server-bridged: OpenCode. Direct-provider: Codex, GitHub Copilot, Gemini. Provider specs cover auth, model discovery, plan mode (where applicable), media capability gating, headless flags (where applicable), subagents, and MCP capability.

**Runners and support.** cursor.rs, codex.rs, claude.rs, gemini.rs, copilot.rs; registry in platforms/registry.rs; auth_actions.rs, auth_status.rs; platform_detector.rs; capability.rs; model_catalog.rs. Provider auth strategy is realm-aware: `github_api` (GitHub API provider operations) and `copilot_github` (Copilot provider auth) are separate inventories.

### 3. Orchestration

**State machines.** Orchestrator: Idle → Planning → Executing (with Paused) → Complete/Error. Tier: Pending → Planning → Running → Gating → Passed (with Retrying, Escalated, Failed). core/state_machine.rs.

**Tier hierarchy.** Phase → Task → Subtask; leaf nodes are execution units. core/tier_node.rs; each node has TierStateMachine, acceptance criteria, dependencies, required files.

**Orchestrator.** Coordinates state machines, execution engine, tier tree, session tracking, checkpoints, event emission. Uses ExecutionEngine, PromptBuilder, FreshSpawn, PlatformRouter, SessionTracker, CheckpointManager, AdvancementEngine, EscalationEngine, LoopGuard, ParallelExecutor, DependencyAnalyzer, ComplexityClassifier, WorkerReviewer, AgentsManager, GateEnforcer, PromotionEngine, ProgressManager, UsageTracker, GitManager, PrManager, WorktreeManager, VerificationIntegration, GateRunner. core/orchestrator.rs.

**Execution.** Per-iteration: build prompt (progress.txt, AGENTS.md excerpts), fresh process spawn (no session resume), platform routing, iteration result parsing. core/execution_engine.rs, fresh_spawn.rs, prompt_builder.rs. Iteration lifecycle: Planning → run iteration → completion signal parsing → verification gate → AGENTS.md updates → state file updates → advance or retry/escalate.

### 4. Verification gates

**Gate runner.** Runs gates at tier boundaries (task/phase); config: parallel vs sequential, stop-on-first-failure, evidence collection, timeout. Produces GateReport; wired to EvidenceStore and BroadcastEventBus. verification/gate_runner.rs.

**Verifier registry.** Default verifiers: Command, FileExists, Regex, Script, AI, Browser, IcedGui. verification/ (command_verifier, file_exists_verifier, regex_verifier, script_verifier, ai_verifier, browser_verifier, iced_gui_verifier). Types in types/execution.rs: VerificationMethod, Criterion, GateReport, GateResult, Evidence. **Optional:** LSP diagnostics gate ("No LSP errors in scope" at tier boundaries) and LSP snapshot in evidence for audit (Plans/LSPSupport.md §9.1).

**Evidence.** Stored under .puppet-master/evidence/ (gate-reports, screenshots, test-logs, verifier-results). Evidence view and detail view for browsing.

### 5. State and config

**State files.** prd.json (work queue; state/prd_manager.rs); progress.txt (append-only short-term memory; state/progress_manager.rs); AGENTS.md (long-term memory; root and optional per-tier; state/agents_manager.rs, agents_multi_level.rs, agents_gate_enforcer.rs, agents_promotion.rs, agents_archive.rs). .puppet-master/ per STATE_FILES.md.

**GUI config.** config/gui_config.rs: Project (name, working directory, description, version); Tiers (per-tier platform, model, reasoning_effort, plan_mode, ask_mode, output_format, max_iterations, task_failure_style); Branching (base_branch, naming_pattern, granularity, auto_pr); Verification (browser_adapter, evidence_directory, screenshot_on_failure); Memory (progress_file, agents_file, prd_file, multi_level_agents); Budgets (per-platform max_calls_per_run/hour/day, unlimited_auto_mode); Advanced (log_level, process_timeout_ms, parallel_iterations, etc.); Interview (InterviewGuiConfig); GUI Automation (enabled, mode, workspace_isolation, artifacts_directory, visual_diff_threshold). Wizard: WizardTierConfig per tier.

### 6. Git

**Modules.** git_manager.rs (general git operations); commit_formatter.rs (commit message formatting); branch_strategy.rs (branch strategy); pr_manager.rs (PR creation/management); worktree_manager.rs (worktrees for parallel task execution; WorktreeInfo, MergeResult, .puppet-master/worktrees). git/mod.rs.

### 7. Interview and start chain

**Interview.** interview/orchestrator.rs: multi-phase requirements gathering, AI failover, completion validation. PhaseManager, InterviewPhase, interview/state.rs. ReferenceManager, DocumentWriter, FailoverManager, ResearchEngine, CompletionValidator, AgentsMdGenerator, TestStrategyGenerator, etc.

**Start chain.** start_chain/pipeline.rs: StartChainPipeline from requirements (text or file) to PRD; optional AI generation and validation; evidence saving. StartChainParams: project_name, requirements, use_ai, ai_platform, ai_model, validate_with_ai, ai_gap_config, save_evidence. Components: RequirementsParser, RequirementsInventory, RequirementsInterviewer, DocumentParser, StructureDetector, PrdGenerator, MultiPassGenerator, TierPlanGenerator, ArchitectureGenerator, TestPlanGenerator, CriterionClassifier, CriterionToScriptConverter, Traceability, ValidationGate, AcceptanceCriteriaInjector, formatters. Wizard kicks off StartChainPipeline and writes prd.json / AGENTS.md as configured.

### 8. Doctor

**Check registry.** doctor/check_registry.rs. Checks: transport-aware provider readiness (Cursor/Claude CLI availability, Codex/Copilot/Gemini direct-provider auth/connectivity, OpenCode server health); Git transport (GitInstalled, GitConfigured, GitRepo); Auth realms (`github_api`, `copilot_github`) reported independently; Project (WorkingDir, PrdFile, StateDirectory); Config (ConfigFile, ConfigValid); Runtime (UsageCheck, SecretsCheck, RuntimeCheck, NodeRuntime); PlaywrightCheck, PlatformCompatibilityCheck, WiringCheck. doctor/checks/. DoctorReport, CheckReport, categories; Doctor view runs and displays results.

### 9. Automation

**Headless runner.** automation/headless_runner.rs: Iced tiny-skia headless renderer (no GPU/display); builds full widget tree via app.view(), layout, draw, screenshot to RGBA/PNG. Used for GUI automation: navigate, execute actions, snapshots, assertions.

**Runners.** Headless (HeadlessRunner / headless_runner::run); Native (NativeRunner); Hybrid. GuiRunSpec: run_id, scenario_name, mode (Headless/Native/Hybrid), full_action, workspace_root, artifacts_root, workspace_isolation, steps (GuiStep: action + assertions), timeout_ms. GuiAction: Navigate, Execute, Click, RightClick, Type, Wait, Resize, Snapshot. GuiAssertion: PageIs, NoLastError, OrchestratorStatus, OutputContains, DoctorRunning/DoctorResultCountAtLeast/DoctorCheckStatus, ToastContains/ToastTypeContains, AuthStatus, SetupChecking/SetupPlatformStatus/SetupPlatformCountAtLeast, ContextMenuOpen. run_gui_automation(spec) → GuiRunResult (step_results, debug timeline/summary, artifact manifest).

**Action catalog.** automation/action_catalog.rs: resolve_action(action_id) → Message (e.g. nav.dashboard, nav.config for all pages); used by headless/native runners.

**Workspace clone.** automation/workspace_clone.rs: Ephemeral clone for isolation; ClonedWorkspace, build_artifact_manifest, ensure_path_within.

**Debug feed.** automation/debug_feed.rs: DebugFeedCollector records step/backend/log/system events; writes debug bundle (timeline + summary) under artifacts.

### 10. Other

**Logging.** logging/ (event_bus, log_streamer, log_retention, logger_service, iteration_logger, intensive_logger, error_logger).

**Usage tracking.** platforms/usage_tracker.rs; Metrics view; Doctor UsageCheck.

**Checkpoints.** core/checkpoint_manager.rs; state persistence in core/state_persistence.rs.

**Tray.** tray.rs -- system tray integration (TrayAction subscription in app).

**Build info.** build_info.rs for version/build data.

##### Plans/Containers_Registry_and_Unraid.md
- **Contextual Docker Manage surface.** First-class Docker management UI shown when a Docker-related project is active, with `Hide Docker Manage when not used in Project.` setting (default enabled).
- **Dual DockerHub auth UX.** Browser/device login plus PAT entry, with PAT-recommended helper copy and requested-vs-effective capability display.
- **Protected repository auto-create flow.** Missing DockerHub repos can be created from Puppet Master, but only after explicit non-bypassable confirmation with namespace, repository name, and privacy (default private).
- **First-class build/run/publish workflow.** Buildx-backed image build, container run for testing, user-openable container access, and publish results including digest/tag evidence.
- **Managed Unraid template publishing.** Auto-generate/update Unraid XML after successful publish by default; manage a dedicated template repo by default with auto-commit on, auto-push off, one-click push from the UI, and a defined unmanaged local-output path when the managed repo is unavailable.
- **Per-project template repo layout.** One template repo per project, root `ca_profile.xml`, maintainer folder, and `project-name.xml` with maintainer folder defaulting to the DockerHub namespace but remaining editable.
- **Shared/per-project `ca_profile.xml` model.** Generate-if-missing, shared cross-project default with per-project override, profile image upload or external URL, repo-managed asset default for uploaded images, and a two-layer editor (structured fields + raw XML passthrough preservation) so all fields remain editable without losing unknown content.

## Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)

Reference additions for rewrite planning:

- First-class Markdown rendering in chat, editor preview, document panes, and planning documents.
- Native Mermaid detection/rendering from fenced `mermaid` blocks and `.mmd` files.
- Mermaid export as SVG (canonical) and PNG (derived).
- Full Markdown support centered on source-canonical editing plus rendered preview, not on replacing Markdown with a hidden WYSIWYG model.
- HTML files support both source editing and full rendered browser-like viewing.
- Image files render natively in the Slint app surface.
- Detached preview/browser windows are first-class, cross-platform guaranteed behavior.
- Embedded webviews are optional optimizations, not required product invariants.
- Generated Markdown/Mermaid previews use a restricted trust tier; full HTML/browser mode uses a separate trust tier.
- Preview-mode edits are limited to validated structured commands and otherwise fall back to source editing.
- Planning documents, including future Deep Plan Mode surfaces, use the same Markdown/Mermaid pipeline and canonical-source rules.

## Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)

### GUI and views
- first-class `Source Control` side-panel surface with Changes, History, Graph, Worktrees, and Branches / Stash
- first-class `GitHub Actions` side-panel surface with Current Branch, Workflows, and Settings
- first-class `Docker Manager` side-panel surface with Containers, Images, Compose, Registries, Build / Bake, Publish / Unraid, and project-focused Kubernetes

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### Orchestration and recovery
- run-to-repo lineage and worktree ownership surfaced across Orchestrator tabs
- run-to-workflow and workflow-to-diff correlation
- publish/runtime/template and Kubernetes rollout linkage surfaced in Orchestrator and Run Graph
- cross-surface `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` pivots

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### State and commands
- Source Control, GitHub Actions, and Docker Manager panel state persisted per project where applicable
- new canonical command families for Source Control, GitHub Actions, Docker Manager, and cross-surface pivots
- blocked-state and requested-vs-effective rules remain product-wide behavior, not panel-local polish

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md

## Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)

Summary bullets for this feature family MUST say:
- deterministic scored ready-set scheduling instead of pure lexical dispatch
- event-driven queue-analysis passes keyed by `scheduler_pass_id`
- immutable attempt lineage with new `attempt_id` per dispatch and explicit runtime fields for retry/blocking/remediation/safe points
- blocked outcomes with explicit recovery actions instead of generic failures, with distinct `attention_required` vs `blocked` wizard/thread/dashboard states
- safe-point-backed recovery distinct from user-facing restore points
- remediation child execution with explicit lineage and shared failure-class retry/backoff policy
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior

Remove or revise older summary phrasing that implies lexical dispatch, node-centric retry commands, or `attention_required` as the only paused clarification state.

**Artifacts panel and panels (from GUI/Artifacts/Usage scope):** Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts, Chat, Files (single slot, last-click wins); layout save per project; OpenCode-style usage-on-message reference; AI in Git; multi-repo source control (or explicit deferral).
