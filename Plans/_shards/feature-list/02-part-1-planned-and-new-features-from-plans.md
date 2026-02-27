## Part 1 - Planned and New Features (from Plans)

### 1. Rewrite and architecture

**Single deterministic agent loop.** Every backend is a Provider behind one unified session/event store, tool registry, and patch/edit pipeline. OpenCode-style provider abstraction, centralized config, and session orchestration make the main engine deterministic and reliable. Platform-specific "runner" terminology converges on Provider plus unified event model.

**Event-sourced storage (no SQLite).** Storage is seglog as the canonical append-only event ledger, redb for durable KV state/projections/settings, and Tantivy for full-text search over chats, docs, and log summaries. Sessions and runs are replayable from seglog with deterministic projections into redb/Tantivy and checkpointing for resumability. **Analytics scan jobs** scan seglog for tool latency distributions, error rates, and usage; they write **rollups** into redb for the Usage view and dashboard (5h/7d, tool performance, error summaries).

**GUI rewrite (Rust + Slint).** Desktop UI switches to Rust and Slint with winit backend for Windows, macOS, and Linux. Default renderer is winit + Skia; fallback GPU is winit + FemtoVG-wgpu; emergency software fallback is kept for compatibility. Backend selection via Slint BackendSelector or SLINT_BACKEND.

**Theme (locked).** Three themes: Light, Dark, and Basic. Theme switching is supported; app restart is acceptable. Light and Dark preserve the retro look; Basic is plain and easier to read. No Iced commitment; UX requirements only.

**Future thin clients.** Mobile and web clients will be thin and connect back to the desktop app. Stable boundary is the unified event model plus streaming API (runs, events, artifacts) and command API (start run, approve tool, cancel run); no direct provider/tool access from clients.

**Core reliability.** Tools are governed by a central policy engine (permissions, validation, normalized tool results). Edits go through an explicit patch/apply/verify/rollback pipeline (worktrees, branches, sandboxes). Plans/ is the authoritative requirements source for orchestration, safe-edit, subagents, worktree/git, and tooling.

**Provider and CLI.** Claude Code CLI as Provider (stream-json, print mode, optional partials; Claude Code Hooks for tools/telemetry). Cursor Agent CLI as Provider (--print --output-format stream-json, internal parsing into unified event model). **Cursor / ACP (Resolved — Not Needed for MVP):**
Cursor CLI is not ACP-native (confirmed by Cursor staff, January 2026). Cursor supports MCPs, which Puppet Master already uses. An ACP adapter layer is **not needed for MVP**. If Cursor adds ACP support in the future, an adapter can be added as a non-breaking enhancement. Priority: P4 (future/optional). Gemini auth: API key default in UI; explicit exception to "subscription only"; OAuth optional.

**Contract-Locked PlanGraph System.** Canonical node-based plan graph and execution: user-project outputs under `.puppet-master/project/**` (sharded plan graph, Project Contract Pack, acceptance_manifest, auto_decisions; seglog canonical; optional UI wiring artifacts for GUI projects). Progression Gates (GATE-001–GATE-010): schema validation, Spec Lock integrity, drift phrases, evidence, wiring matrix validation; Verifier role; run-gates verifier (`python3 scripts/pm-plans-verify.py run-gates`). Overseer Protocol: Builder/Verifier/Overseer roles, deterministic next-ready selection and status lifecycle for plan_graph nodes; Spec Lock version checks.

Contract layers: Platform vs Project contracts, ProjectContract:* refs in node shards; Spec_Lock.json pins schema versions and locked decisions. UI command layer: stable UICommand IDs (UI_Command_Catalog), Wiring Rules (dispatch only UICommands; one element, one command), Dispatcher boundary, Wiring Matrix (schema-validated). Architecture invariants INV-001–INV-012 (tool correlation, no secrets, UI SSOT/boundary, deterministic ordering, providers isolated, no stringly-typed IDs, GitHub API-only, Cursor transport invisible, naming, wiring coverage).

Contracts V0 as SSOT for event envelope, UICommand, EventRecord, AuthState. Anti-drift: required SSOT reading order (Spec_Lock → Contracts_V0 → Crosswalk → DRY_Rules → Glossary → Decision_Policy → schemas → UI_Command_Catalog → Architecture_Invariants → Progression_Gates → Executor_Protocol → Verifier command). Scope: self-build plan graph (`Plans/plan_graph.*`) vs user-project (`.puppet-master/project/*`); do not conflate. Plans: Project_Output_Artifacts.md, Progression_Gates.md, Executor_Protocol.md, UI_Command_Catalog.md, UI_Wiring_Rules.md, Wiring_Matrix.md, Architecture_Invariants.md, Contracts_V0.md, Crosswalk.md, 00-plans-index.md.

---

### 2. Chat and assistant

**Chat modes.** Ask (read-only; no edits, no execution). Plan (read-only until execute; clarifying questions required, then research, then plan + todo; execute after approval). Interview (switch to interview flow; reduced phases when from Assistant; at end: Do now or Add to queue). BrainStorm (multi-model, shared context, subagents communicate; on execute chat switches to Agent mode). Crew (invoke crew with Plan; must work together). **Chat controls (OpenCode-style):** platform dropdown, model dropdown (customizable -- dynamic discovery + manage models), reasoning/effort when platform supports it; in chat header or footer; context passed on switch; apply to next turn. Many features require a project.

**Bash capability.** The Assistant can run shell commands (bash) when not in read-only mode (e.g. in Plan execution or Agent mode). Execution is subject to permissions (YOLO vs regular approval) and to FileSafe/guards. Bash output (stdout/stderr) is visible in the thread.

**Plan mode depth and rules.** Depth: Shallow, Regular, or Deep (controls clarifying questions and research length). Clarifying questions always required before plan creation. "Add to queue" only in Interview, not default Plan. Plan panel shows written plan and todo list. Execution after approval via same engine (fresh process per step). Parallelization when possible; user can disable in settings.

**ELI5 (two toggles, independent).** App-level control is **Interaction Mode (Expert/ELI5)** (default: ELI5 **ON**) and selects tooltip/interviewer copy variants. Chat-level control is **Chat ELI5** (default: **OFF**, Expert/default LLM behavior) and only changes assistant style instructions for that chat thread/session. Both toggles are stored and applied separately. In-scope authored copy must be dual-variant (Expert + ELI5) per `Plans/FinalGUISpec.md` §7.4.0 checklist.

**Permissions: YOLO vs Regular.** YOLO: max permissions, no prompts. Regular: approve once or approve for session. Per session/chat. Do not persist "approve for session" across restarts.

**Message submission (Steer vs Queue).** Steer mode: Enter submits now; Tab or "Queue" queues when busy. Queue mode: Enter queues when busy. Interrupt = send new message (steer). Stop = cancel run, no message. Queued messages above input (max 2, FIFO); each with edit, "Send now," remove. Clear queue. Keyboard shortcuts and command palette. Error state: Retry/Cancel; suggest switch platform/model on failure.

**Slash commands and custom commands.** Built-in reserved: /new, /model, /export, /compact, /stop, /resume, /rewind, /revert, /share. Application- and project-wide; user-customizable near Rules. No conflicting names with built-ins.

**Teach.** Assistant explains how Puppet Master works from docs (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections, mode descriptions). The documentation that Teach uses must be built when the rest of the project is built so it is always available. Optional tips/snippets and "How does [X] work?" flows in chat. No separate Teach UI.

**Attachments, web search, extensibility.** Files and photos; paste and drag-drop. Web search with citations (inline + Sources list); full spec in newtools. MCP/plugins same as rest of app. All five platforms support images.

**File Manager, IDE-style editor, and @ mention.** @ in prompt opens autocomplete (recent/modified files, folder nav). Insert path or @path; resolve when building prompt. File Manager: pop-out side window; selecting a file opens it in the **in-app IDE-style editor**. **IDE-style editor (MVP):** center-left File Editor strip; **tabs** for open files (GUI setting **max editor tabs**, default e.g. 20-30, for LRU cap); **split panes** (multiple editor groups); **drag editor out to own window and back** (detach/snap, same as File Manager and Chat); editable content, Save (Ctrl+S), unsaved indicator, line numbers, go-to-line/range, basic syntax highlighting; open from File Manager or from chat. **LSP (MVP):** diagnostics, hover, completion, inlay hints, semantic highlighting, code actions, code lens, signature help; status in status bar; per-server enable/disable and custom servers via Settings > LSP (Plans/LSPSupport.md). **Chat Window LSP (MVP):** diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code blocks in messages with hover and click-to-definition; Problems link from Chat (Plans/LSPSupport.md §5.1, assistant-chat-design §9.1). **Additional LSP enhancements (Plans/LSPSupport.md §9.1):** find references, rename symbol, format document/selection; go to type definition, go to implementation, document links, call hierarchy, folding/selection range; Chat "Fix all," "Rename X to Y," "Where is this used?," "Format file," copy type to chat; optional LSP diagnostics verification gate and LSP snapshot in evidence; Interview "structure of file" via documentSymbol; promote lsp tool when ready. **Terminal:** tabs for multiple terminal sessions in bottom panel. **Browser:** multiple browser instances (no in-browser tabs). **Language/framework presets** (JetBrains-style): tools downloaded when project added or from interview flow; run/debug, modal editing, remote SSH, review/1-click apply, etc. Full list in Plans/FileManager.md §10-§11. **Click to open in editor:** clicking a file path (files-touched strip, "Read:" / "Edited:", or code block filename) in chat opens that file in the editor; when line/range is known, scroll to it. Activity "Read: file" and code blocks open in editor; context files as chips; drag file into chat to attach.

**Chat history search.** Human search across chats/history (UI). Agent search via tool/MCP or index in context pipeline for prior messages/sessions.

**Threads and chat management.** Multiple threads in one chat UI. New thread (plus). Thread state (Working/Completed). Rename, archive, delete (with confirm). Resume and rewind (restore to message). Session share (bundle, no secrets). Copy message (selectable/Copy action). Run-complete notification (other thread) with setting to disable. Max concurrent runs per thread (default 10); per-platform concurrency caps also apply (see FinalGUISpec §7.4.7). Plan panel per thread. Persistence: thread list, messages, queue, plan/todo.

**Context usage display.** Streaming when platform supports. Tokens, context window, rate limits in header/strip/status. Rate limit hit: clear message and option to switch platform/model.

**Activity transparency.** Show search query/scope; bash when not read-only (subject to permissions/FileSafe); files read and changed per turn; thinking/reasoning collapsible toggle; revert last agent edit (Git/restore points).

**Subagents and Crew.** Auto or user-requested subagents. Crew via button or "use a crew." Crew + Plan must work (e.g. execute plan with crew).

**Plan + Crew execution.** Plan + todo; execute with single agent, Crew, or agent+subagents; user or manager chooses. "Execute with crew" after plan. Crew can work from existing or new plan; plan format consumable by both.

**Interview phase UX (chat).** Thought stream; message strip; question UI with suggested options and "Something else" freeform.

**Context and truncation.** Minimize truncation; VBW/GSD-style strategies; context compilation for chat; user-triggered "Compact session"; re-pack on model switch (last N turns + summary, platform_specs limits).

**BrainStorm mode.** Single coordinated Q&A/research then one plan; on execute chat switches to Agent mode. Execute by single agent, crew, or agent+subagents. Subagents can "talk to each other" before merge.

**Documentation audience (AI Overseer).** Interview output (PRD, AGENTS.md, etc.) for AI Overseer: unambiguous, wire-explicit, DRY in generated content; no partially complete components.

**Dashboard warnings and CtAs.** Warnings and Calls to Action on Dashboard; addressable via Assistant (e.g. "approve and continue," "run suggested fix"). HITL: CtA on Dashboard plus new thread with appropriate name. "Continue in Assistant" with run summary and context when orchestrator completes or pauses.

**Live testing tools and hot reload.** Assistant can request "start hot reload dev mode" or "run tests in watch mode"; results in IDE panes.

---

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

---

### 4. Orchestration and subagents

**Automatic task decomposition and orchestration flow.** Session-level prompt: assess → understand → decompose → act → verify. Trivial tasks (1-2 steps) proceed directly; complex (3+ steps) explicit plan → execute → verify. Optional role hints (planner, implementer, reviewer). Single canonical prompt; composition with rules pipeline; platform-compatible injection. No new tiers.

**Tier-level subagent strategy.** Phase: project-manager (default), architect-reviewer, product-manager; parallel possible. Task: by language (rust-engineer, python-pro, javascript-pro, etc.), domain (backend-, frontend-, fullstack-developer, etc.), framework (react-specialist, vue-expert, etc.); priority language → domain → framework; fallback fullstack-developer. Subtask: by type (code-reviewer, test-automator, technical-writer, etc.) and inherited task context. Iteration: by state and error patterns (compilation → debugger, test failure → test-automator + debugger, etc.). ProjectContext (languages, frameworks, domain, task_type, error_patterns); TierContext; SubagentSelector (detect_language, select_for_tier). Plan mode (our own, not CLI built-in): default true for all tiers; config and GUI toggle; Cursor --mode=plan, Claude --permission-mode plan, Gemini --approval-mode plan, etc.

**Background/async agents.** Multiple parallel runs with bounded queue. Git branch isolation per run (stash, branch, diff/merge). Output isolation; merge conflict detection. Queue manager (Rust); GUI panel for background runs. Main-flow vs background-flow policy; queue state persistence. Reuse WorktreeGitImprovement and MiscPlan.

**Orchestrator integration.** build_tier_context, select_for_tier (with tier overrides and required/disabled validated via subagent_registry), execute_subagent (sequential or parallel per config), build_subagent_invocation via platform_specs, run_with_cleanup at all runner call sites.

**HITL (human-in-the-loop).** Require explicit human approval at selected tier boundaries (phase, task, subtask). Three independent toggles; off by default. Pause after end verification at that tier; before advancing. GUI: one place (Orchestrator/Wizard/Dashboard settings). "Approve & continue" to advance; reject/cancel semantics at implementation. Dashboard CtAs when paused; addressable via Assistant or direct control. Recovery: if app closes while paused, on restore run stays "waiting for approval."

---

### 5. Interview and wizard

**Interview subagent integration.** Phase assignments: Scope & Goals → product-manager; Architecture → architect-reviewer; Product/UX → ux-researcher; Data → database-administrator; Security → security-auditor, compliance-auditor; Deployment → devops-engineer, deployment-engineer; Performance → performance-engineer; Testing → qa-expert, test-automator. Cross-phase: technical-writer, knowledge-synthesizer, debugger, code-reviewer, context-manager, explore. **41 subagents/personas** (canonical list in orchestrator-subagent-integration.md §4; task tool validates against this list per Tools.md §3.6). SubagentConfig (enable_phase_subagents, research, validation, document); phase_subagents in InterviewOrchestratorConfig.

**Research engine and validation.** BeforeResearch/DuringResearch/AfterResearch; persist results, update phase context. BeforeValidation/DuringValidation/AfterValidation; remediation loop for Critical/Major (max retries, retry on severity). write_phase_document_with_subagent; write_prd_with_crew_recommendations.

**Document generation.** Phase docs, PRD, AGENTS.md for target projects (technology/version constraints, DRY Method, critical-first, size budget, linked docs). Convention templates by stack. Preserve sections when agents update.

**Chain-wizard flexibility: four intents.** New project (greenfield; full product, full interview, new repo, full PRD). Fork & evolve (upstream URL; delta requirements, delta interview, fork, delta PRD). Enhance/rewrite/add (existing project new to PM; delta scope, delta interview, same dir, delta PRD). Contribute (PR) (upstream; feature/fix scope, light interview, fork, branch, PR). State: store selected intent in app state and optionally .puppet-master/; pass to Interview and start chain.

**Requirements step.** Single prompt "Provide your Requirements Document(s)" with: (1) upload single/multiple files, (2) Requirements Doc Builder (opens Assistant with context; user triggers "Done -- hand off to Interview"; output to .puppet-master/requirements/). Framing text varies by intent. Multiple uploads; formats md, pdf, txt, docx; canonical input from all uploads + Builder; storage .puppet-master/requirements/.

**Adaptive interview phases.** Phase selector: AI or phase manager decides which phases to cut, shorten, or double down from intent and early context. Output: phase_id + depth (full | short | skip); optional reorder. Stored in interview state. Defaults: full intent → all full; Contribute → minimal set.

**Project setup and GitHub.** New project: optional "Create GitHub repo" (repo name, visibility, description, .gitignore, license, default branch); GitHub HTTPS API provider flow only. Auth is realm-split: `github_api` (repo/fork/PR API operations) and `copilot_github` (Copilot provider auth realm). Fork & evolve / Contribute: upstream repo; "Create fork for me" or "I'll create fork myself"; clone fork to project path; optional upstream remote. PR start: fork → clone → create feature branch. PR finish: commit, push, open PR (GitHub HTTPS API); "I'll commit and open PR myself" with instructions. Canonical GitHub flows: `Plans/GitHub_API_Auth_and_Flows.md`. Integration with WorktreeGitImprovement and MiscPlan (branch naming, PR body, no secrets).

---

### 6. Rules, context, and safety

**Agent rules context.** Application-level rules (e.g. "Always use Context7 MCP") apply to every agent everywhere; stored at application level. Project-level rules (e.g. "Always use DRY Method") apply to every agent on that project; stored at project root (.puppet-master-rules.md, PROJECT_RULES.md, or .puppet-master/project-rules.md). Single rules pipeline: get_agent_rules_context(application_config, project_path) returns one formatted block (application + project). Callers: Orchestrator, Interview, Assistant. Order: application first, then project when project path set. GUI: Settings → Application rules; when project selected, Project rules panel. Bootstrap: seed from Puppet Master AGENTS.md if no application rules. Rewrite: single pipeline for providers, tool policy, agent loop; rules injection represented in unified event stream where relevant.

**Tool permissions and FileSafe.** Tool permissions (allow/deny/ask per tool; Plans/Tools.md) are evaluated first; FileSafe (command blocklist, write scope, security filter) runs after for allowed/approved invocations. Single policy entry point recommended: e.g. `may_execute_tool(tool_name, context)` → Allow | Deny | Ask; then FileSafe checks for bash/edit/read. See Tools.md §2.4, §10.6.

**FileSafe Part A -- Command blocklist (BashGuard).** Blocks destructive CLI commands (e.g. migrate:fresh, db:drop, TRUNCATE, git reset --hard, Docker volume prune) before run. Regex patterns from file; case-insensitive. Pattern file resolution: custom path → .puppet-master/destructive-commands.local.txt → bundled config/destructive-commands.txt. Env override PUPPET_MASTER_ALLOW_DESTRUCTIVE=1. Integration: BaseRunner::execute_command before spawn. Event logging (filesafe-events or event log). Config: bash_guard (enabled, allow_destructive, custom_patterns_path); GUI label "Command blocklist."

**FileSafe Part A -- Write scope (FileGuard).** Restricts writes to files declared in the active plan; no writes outside plan scope. Allowed set from request metadata (env, context files, plan). Check in BaseRunner before spawn. Config: file_guard (enabled, strict_mode); GUI label "Write scope."

**FileSafe Part A -- Security filter (SecurityFilter).** Blocks access to sensitive paths (.env*, *secret*, *key*, *.pem, id_rsa, config/secrets.*, etc.). Config: security_filter (enabled, allow_during_interview); GUI label "Security filter."

**FileSafe -- Prompt content checking.** Scan compiled prompt (after context compilation) for destructive commands; extract from code blocks, shell prompts, SQL. Check in platform runner after append_prompt_attachments. Same strategy for all five platforms.

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

---

### 7. Usage, recovery, and analytics

**Persistent rate limit and usage visibility.** Always-visible 5h/7d in UI (dashboard, header, or Usage page). Plan type where available. Tier config/setup show usage when selecting platform. Background refresh. State-file-first (usage.jsonl, summary.json); platform APIs augment when configured. Align with usage-feature.md.

**Usage feature (full scope).** Quota and plan visibility (primary); alerts and thresholds (e.g. 80% warning; rate limit hit → clear message, link to Usage); event ledger (platform, operation, tokens, cost, tier/session; filter and export); optional analytics (aggregate by time, platform, project, tier; cost when available; retention). Data sources: usage.jsonl (primary), summary.json (optional), active-subagents/active-agents for enrichment. Per-platform: Cursor API (usage/account only), Copilot GitHub metrics REST API, Claude Admin API + stream-json usage, Gemini Cloud Quotas + error parsing. GUI placement options: dedicated Usage page, or Dashboard + Ledger + quota widget, or compact usage in header + full Usage page. Success criteria: users see 5h/7d and plan without manual command; clear warning on limit; tier config shows current usage. Rewrite: usage as projections/rollups over seglog; durable KV in redb; fast search in Tantivy.

**Multi-Account and Usage page.** Multi-account support: multiple identities per platform (all five), pick-best-by-usage, auto-rotation on rate limit, optional session migrate/resume for Claude; account registry and cooldowns in redb (Plans/Multi-Account.md). Dedicated Usage page is fully widget-composed (grid layout, add-widget flow); Multi-Account widget (`widget.multi_account`) is first-class on Usage and reusable on Dashboard (Plans/usage-feature.md, Plans/Widget_System.md).

**Session and crash recovery.** Periodic snapshots (e.g. 5 min); auto-save (e.g. 30 s). Restore last layout, session, optional message checkpoints. Retention policy. Recovery struct serialization (app phase, project path, orchestrator state, interview phase, window geometry, timestamp). Panic hook (best-effort). Schema version in snapshot. Non-blocking I/O. Config keys. "Restore previous session?" dialog on launch.

**History and rollback (restore points).** Snapshot after each iteration/message (files + content before/after). Rollback = restore files + truncate state. Conflict detection (mtime/hash). Retention (e.g. last 50). Rollback flow with confirmation; optional re-run verification. GUI History/Restore panel. Git alignment. Branching conversations: restore then fork; alternate branches with labels.

**Analytics and usage dashboard.** Aggregate usage by time, project, model/platform. By project: sessions, tokens, cost, last used. **Tool usage widget** on Usage page: per-tool invocation count, latency, error rate from seglog rollups (FinalGUISpec §7.8; Plans/Tools.md). Storage from existing state or redb rollups. "Know where your tokens go" framing. Time range selector; export CSV/JSON. Privacy/local only. Align with usage-feature and state-file-first.

---

### 8. Streaming, protocol, and UI polish

**Protocol normalization (multi-provider streaming).** Single internal stream format (message delta, usage, etc.). One parser/UI pipeline. "Show thinking," "token usage live," "streaming progress" platform-agnostic. Per-platform adapters. Minimal "orchestrator stream" schema (text_delta, thinking_delta, tool_use, tool_result, usage, done, error).

**Stream event visualization and thinking display.** Live stream events as icons/strip; extended thinking in collapsible area. Event types from normalized stream; last N events or sliding window. Accessibility for event strip.

**Bounded buffers and process isolation.** Fixed max size for stream/log buffers (e.g. 10 MB or 1000 lines); drop oldest when full. Process isolation: CLI subprocess only. Shared bounded buffer type and constants (e.g. limits module); document in AGENTS.md.

**Stream timers and segment durations.** Live duration per segment type (Thinking, Bash, Compacting, etc.); short history of last segments. UI "Current: ..." and "Last: ...."

**Interleaved thinking toggle.** Setting to show/hide extended thinking; per-session override. Align with normalized stream.

**Mid-stream token and context updates.** Real-time token count and context % during stream; usage/token-delta events; throttle updates.

**Virtualized conversation/log list.** Virtualized rendering for long lists (e.g. 10k+ items); slice by scroll position; overscan. Reuse for run log, messages, restore-point list.

---

### 9. Tools, MCP, and discovery

**Tool permissions.** Per-tool and optional wildcard allow/deny/ask; presets (Read-only, Plan mode, Full). Settings > Advanced > Tool permissions: per-tool list (built-in + MCP-discovered) with permission dropdown; optional wildcard rules (e.g. `mymcp_*: Ask`). Central policy engine applies permission first, then FileSafe (command blocklist, write scope, security filter). Config key e.g. `tool_permissions` in same blob as rest of Settings; run config snapshot at start. YOLO bypasses ask (approval not prompted); Regular: approve once or for session. Plans/Tools.md (§2, §10 implementation plan); FinalGUISpec §7.4.1.

**Tool usage widget.** Usage page shows per-tool metrics from seglog rollups: tool name, invocation count, latency (e.g. p50/p95), error rate; optional sort/filter and time window. Data from analytics scan writing `tool_usage.{window}` to redb. FinalGUISpec §7.8; storage-plan; Tools.md §8.4.

**newtools -- GUI/testing tool discovery.** Single source of truth: gui_tool_catalog (e.g. interview/gui_tool_catalog.rs or automation/). Per framework: framework ID, display name, detection hints, existing tools (name, description, install/setup, capabilities, doc URL), custom headless default. Research as input only; user always gets catalog-backed options and/or plan for custom headless. Interview flow: GUI stack detection from Architecture; testing phase lookup catalog; options: Playwright (when web), per-framework tools, "Plan/build custom headless GUI tool." Persist generate_playwright_requirements, selected_framework_tools, plan_custom_headless_tool. Test strategy: extend TestStrategyConfig with framework tools and custom headless section.

**Custom headless tool.** Full-featured (like this project): headless execution (e.g. tiny-skia), action catalog, full evidence (timeline, summary, artifacts). Standard path .puppet-master/evidence/gui-automation/. When chosen, tasks to obtain/set up existing tools and/or plan/implement custom tool; acceptance criteria reference Playwright, framework tools, custom headless, debug log path.

**MCP for all five platforms.** Config and verification for Cursor, Codex, Claude Code, Gemini, Copilot. Per-platform config paths; Context7 API key (Bearer). Config → MCP (or Advanced → MCP); Context7 on by default, API key field (masked), toggle off. Inject into run so agents can call MCP tools. Align with central tool registry/policy engine.

**Cited web search.** Single implementation for Assistant, Interview, Orchestrator. Output: inline citations [1],[2] and Sources block (title + URL). Activity transparency (show query). Prefer MCP server (e.g. opencode-websearch-cited); support providers (Google, OpenAI, OpenRouter). Config for enable, provider, model, keys; rate limits, auth failures, timeouts, no results, security/privacy and key handling specified.

**Doctor.** Headless tool check when plan_custom_headless_tool true; platform version check per CLI; MCP check (Context7 etc. reachable/list tools). Catalog version or last-updated for "catalog as of date X."

**Capability Introspection (`capabilities.get`).** Internal tool returning the full set of capabilities available to the running Puppet Master instance — both media capabilities (`media.image`, `media.video`, `media.tts`, `media.music`) and provider-tool capabilities (e.g., OpenCode-discovered tools). Each entry includes `enabled`, `disabled_reason`, and `setup_hint`. Agents (Assistant, Interviewer, Requirements Doc Builder) call `capabilities.get` when the user asks about available features. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§1](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). Registered in tool table: `Plans/Tools.md` §3.1.

**Media Generation (`media.generate` — Image / Video / TTS / Music).** Uniform internal tool for all media generation. Accepts a structured request envelope (`kind`, `prompt`, optional parameters: `count`, `aspect_ratio`, `size`, `duration`, `format`, `voice`, `bpm`, `seed`, `negative_prompt`, `quality`). Backend routing: Cursor-native for images when Cursor is the active backend; Gemini media APIs for all kinds otherwise (requires Google Gemini API key). Natural-language slot extraction grammar (deterministic regex-based parsing) runs before `media.generate` to produce the request envelope from user prompts. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), [§3](Plans/Media_Generation_and_Capabilities.md#SLOT-EXTRACTION).

**Per-message model override.** Users can specify a model for a single `media.generate` request inline in their prompt (e.g., "Generate an image using Nano Banana Pro") without changing the persistent model in Settings. The override is ephemeral — it applies only to the current invocation. Resolution: alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2.3](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), `Plans/Models_System.md`.

**Capability picker dropdown.** Composer-area dropdown showing the four media capabilities (Image, Video, TTS, Music). Disabled capabilities are visible but greyed out with a tooltip showing the disabled reason. When a Google API key is missing, a banner/footnote displays "Please provide a free or paid Google API Key." with a "Get API key" link. Clicking an enabled capability inserts a verbatim prompt guiding the user to describe their generation request. Provider-exposed tools (e.g., OpenCode tools) appear in `capabilities.get` output but are NOT part of this media dropdown. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§4](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER), [§5](Plans/Media_Generation_and_Capabilities.md#UI-COPY).

---

### 10. Git and worktree

**WorktreeGitImprovement.** Base branch from config.branching.base_branch. active_worktrees persistence: repopulate from list_worktrees() on init/load or fallback worktree_manager.get_worktree_path(tier_id). Merge conflicts: surface worktree path; avoid reusing tier_id until user resolves/discards. Sanitize tier_id and branch name (ref-safe). Branch already exists: check before worktree add -b; if exists use worktree add path branch or safe delete. Detached HEAD: treat missing branch as detached; merge_worktree skip or merge by commit when source_branch empty. worktree_exists: path exists and valid worktree. Recovery when project selected. PR head branch: resolve from worktree when active_worktrees has no entry. merge_worktree: ensure target_branch exists or create/error. Documentation: STATE_FILES subsection on worktrees. Doctor: worktrees check (git worktree list, verify .puppet-master/worktrees, optionally detect_orphaned_worktrees). Optional: re-validate worktree path before building IterationContext.

**Git.** Shared resolution for git binary (path_utils::resolve_git_executable); GitManager and Doctor use it. PR creation uses GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` through the `github_api` realm (independent from `copilot_github`). Branch strategy from config (e.g. branching.strategy); use in create_tier_branch (no hardcoded Feature). Branch naming: single implementation (e.g. BranchStrategyManager); remove duplicate logic in orchestrator. naming_pattern wire into branch name generation or hide and document. Commit format: CommitFormatter::format_iteration_commit for "pm:" convention. git-actions.log align path with REQUIREMENTS and .gitignore policy. Doctor: optional check project dir is repo and basic git works. Empty commit: detect "nothing to commit" and log at debug/info.

**Config wiring (Option B).** At run start build PuppetMasterConfig from current gui_config so run sees latest UI (enable_parallel_execution, branching, etc.) without Save. Branching tab: Enable Git, Auto PR, Branch strategy (MainOnly/Feature/Release); wire Use worktrees, Auto merge on success, Delete on merge; fix/hide naming_pattern. Fields to wire: enable_parallel_execution, enable_git, branching.base_branch, branching.auto_pr, optionally strategy/granularity/naming_pattern. Worktree visibility (optional): list worktrees, "Recover orphaned worktrees" button.

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

**Plugin and skills extensibility.** Commands, agents/roles, hooks, skills (trigger-based context). Plugin directory (e.g. app data or project .puppet-master/plugins/); manifest (e.g. plugin.json). Loading at startup; invocation by name. Skills: auto-inject when trigger matches (file extension, keyword, regex). GUI Plugins/Extensions section. Bundled default plugin. One-click install from curated catalog: catalog format (id, name, description, type, source URL or bundled path, version); install = copy + enable; updates/uninstall.

**Keyboard-first and command palette.** Shortcuts for major actions (20+). Ctrl/Cmd+P command palette; filtered action list. In-app shortcut docs. Accessibility: focus, screen reader.

**Customizable desktop shortcuts.** GUI (Config → Shortcuts tab or Advanced → Shortcuts) to view, change, and reset keyboard shortcuts for in-app text/composer (defaults: Ctrl+A/E/B/F, Alt+B/F, Ctrl+D/K/U/W, Alt+D, Ctrl+T/G for line/word movement, kill, transpose, cancel). Backend: ShortcutAction, KeyBinding, default_shortcuts (DRY:DATA), build_key_map, GuiConfig.shortcuts; key map wired at app level. Export/import JSON, search/filter in list, shortcut in tooltip/menu label. MiscPlan §7.7, §7.9, §8.8, §7.11.1.

**Agent Skills management.** GUI (Config → Skills tab or Advanced → Skills) to discover, list, add, edit, remove, and set permissions for agent skills (SKILL.md in folders; OpenCode-style discovery paths). Backend: src/skills/ (discovery, load_skill, frontmatter, permissions, list_skills_for_agent); GuiConfig.skill_permissions; first-wins deduplication. Bulk permission by pattern, sort/filter, preview body, last modified, validate all. MiscPlan §7.8, §7.10, §8.9, §7.11.2.

**Database and projections.** Per rewrite: seglog (canonical ledger), redb (durable KV state/projections/settings), Tantivy (full-text search). Queryable history, analytics, and recovery metadata are produced from these; no separate SQLite for run/session/history.

**Branching conversations.** Restore then fork; alternate branches with labels. "Restore and branch" in UI.

**In-app project instructions editor.** Edit AGENTS.md/CLAUDE.md/project rules in-app; optional live markdown preview; save to project root. Support project rules file.

**@ mention system.** @ in prompt opens autocomplete (recent/modified files, folder nav); insert path or @path; resolve when building prompt.

**Multi-tab and multi-window.** Tabs (view + context per tab); multiple windows; optional drag tabs between windows; persist tab list and order.

**Project and session browser.** List projects and per-project sessions/runs; search/filter; optional git status per project; open project or session.

**Instant project switch (OpenCode-style).** Project bar or sidebar; single source of truth for current project; swap context/settings on selection; project list persisted; "Open project..."; what swaps: nav, per-project state, last session per project. Alignment with snapshotting and redb (project_path).

**Built-in browser and click-to-context (Cursor-style).** Launch webapps in-app; click element → send context to Assistant (DOM, attributes, rect). Wry WebView; custom protocol or IPC; modifier or toolbar toggle for capture. Element context schema (tagName, id, className, textContent, role, ariaLabel, rect, parentPath, optional outerHTML; token/size cap). Rust handler → app state → Assistant; "Element sent to chat" toast. Phased: separate window → schema v1 → Assistant integration → optional embedding → polish. Security: validate, sanitize, rate limit.

**Full IDE-style terminal and panes.** Terminal at current project folder (embedded or external). **Terminal tabs:** multiple terminal sessions (new tab, switch, close, optional name); each tab has own cwd and history. Panes: Terminal, Problems, Output, Debug Console, Ports. Single "open terminal at path" helper; project path from app state. See FileManager.md §9.

**Hot reload, live reload, fast iteration.** One-click dev server/watcher; project type detection (Cargo.toml, package.json, etc.); integrated Terminal/Output; state preservation where supported. Assistant-callable ("start hot reload," "run tests in watch"). Project scanners; integrate watchers; error handling → Problems pane.

**Sound effects settings.** Per-event enable/disable and sound selection; user-loaded sounds; built-in + user catalog. Events: Agent, Permissions, Errors, optional HITL/Dev server/Build. Config persistence; accessibility (system silent/reduce motion).

**Updating Puppet Master.** Version visibility; update discovery; upgrade path docs; config/state compatibility across versions.

**Cross-device sync.** Manual export/import + BYOS. Sync payload: config, state, threads, history. Storage options: local/mounted, NAS/SMB/NFS/SFTP/WebDAV, cloud folder; custom config. "Sync now" / "Sync on startup"; conflict policy. No secrets by default; optional encrypted secrets.

**One-click install (no code).** Curated catalog of commands, agents, hooks, skills; install = copy + enable; updates/uninstall; catalog format; default catalog.

---

