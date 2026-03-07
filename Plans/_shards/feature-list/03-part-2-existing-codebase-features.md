## Part 2 - Existing Codebase Features

Part 2 records what exists in the codebase today for reference. Plans define target behavior; implementation may change (e.g. config structure, automation tooling, platform data sources, orchestration mechanics).

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
- **Managed Unraid template publishing.** Auto-generate/update Unraid XML after successful publish by default; manage a dedicated template repo by default with auto-commit on, auto-push off, and one-click push from the UI.
- **Per-project template repo layout.** One template repo per project, root `ca_profile.xml`, maintainer folder, and `project-name.xml` with maintainer folder defaulting to the DockerHub namespace but remaining editable.
- **Shared/per-project `ca_profile.xml` model.** Generate-if-missing, all fields editable, shared cross-project default with per-project override, profile image upload or external URL, and repo-managed asset default for uploaded images.
