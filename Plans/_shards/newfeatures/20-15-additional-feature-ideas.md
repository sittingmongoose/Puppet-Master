## 15. Additional Feature Ideas

The following ideas are listed for completeness. They are not yet folded into the main phasing; they can be scheduled once the core features above are in place or in parallel where dependencies allow.

### 15.1 Dangerous-Command Blocking (FileSafe)

Dangerous-command blocking is part of **FileSafe** (Plans/FileSafe.md): Command blocklist, PreToolUse integration, and runner integration use the same blocklist and extension point. PreToolUse hooks can call into FileSafe for blocklist checks; the user sees a clear "Blocked by FileSafe" (or equivalent) message and can optionally override or add exceptions via config. No separate "Security guard" feature; see FileSafe.md and §9, §17.3-17.4.

---

### 15.2 Branching Conversations (Restore Then Fork)

**Concept:** Extend restore points (§8) so that after **rolling back** to a point, the user can **continue from there in a new branch** instead of overwriting the current timeline. That gives "branching conversations": main line plus one or more alternate continuations (e.g. "what if I had answered Phase 3 differently?"). Each branch has its own restore-point chain and optional label.

**Relevance:** Supports experimentation and comparison of strategies (interview answers, iteration choices) without losing the original path.

**Implementation:** When user chooses "Roll back and branch" (or "Restore as new branch"), create a new conversation/session id, copy state and file snapshots up to that point, and mark the current session as "branched from" that point. UI: "Restore" panel could offer "Restore here" vs "Restore and branch." Storage: link restore points to a branch id; list branches in History view.

---

### 15.3 In-App Project Instructions Editor

**Concept:** An **in-app editor** for project-level instructions (e.g. AGENTS.md, CLAUDE.md, or a project-specific instructions file). The user can open, edit, and save the file without leaving the app. Optional **live preview** (e.g. rendered markdown) in a split pane or tab. Ensures the file is saved to the project root (or a configured path) so the CLI sees it on the next run.

**Relevance:** Reduces context-switching; users can tweak instructions right before or after a run. Aligns with our memory layers (AGENTS.md is long-term memory).

**Implementation:** New view or modal "Project instructions" that (1) reads the file from project path, (2) shows a text area (or simple editor) and optional preview pane, (3) saves on demand or with auto-save. Use existing widgets; for preview, a minimal markdown renderer or "open in external editor" fallback. Path comes from current project in app state. Support **project rules** (Plans/agent-rules-context.md: e.g. `.puppet-master/project-rules.md` or `PROJECT_RULES.md`) and/or **AGENTS.md**, **CLAUDE.md**; user can choose which file to edit or have a single "Project instructions" entry that opens the project rules file when set, else AGENTS.md/CLAUDE.md.

---

### 15.4 @ Mention System for File References

**Concept:** In prompt input areas, support **@-style mentions** that open an autocomplete list: recent files, modified files, or folder navigation (e.g. type `@src/` to see contents of `src/`). Selecting an item inserts a canonical reference (e.g. path or `@path/to/file`) into the prompt so the agent (and our context builder) can resolve it. Fast file reference without typing full paths.

**Relevance:** Speeds up "add this file to context" and keeps prompts tidy. Complements skills (§6) and context assembly for iterations.

**Implementation:** In the input widget, detect `@` and trigger a small overlay or dropdown. Data source: list of recent/modified files from app state or a quick filesystem scan of the project; optional folder tree. On select, insert the chosen path (or a token like `@path`). Resolution: when building the iteration prompt, expand `@path` to file contents or a "include file X" directive per platform.

---

### 15.5 Stream Timers and Segment Durations

**Concept:** During a run, show **live duration** for the current segment type: e.g. "Thinking: 0:12," "Bash: 0:45," "Compacting: 0:08." When the segment ends, optionally keep a short history (e.g. "Last: Thinking 0:12, Bash 0:45"). Gives the user a clear sense of where time is spent without reading raw logs.

**Relevance:** Complements stream event visualization (§12); timers answer "how long has this step been running?" and "how long did the last step take?"

**Implementation:** In the normalized stream consumer, track segment start/end by event type (e.g. `thinking_delta` start → start timer; `thinking_delta` end or `message` start → stop and display). Persist segment type + duration in a small ring buffer for "last N segments." UI: next to or below the event strip (§12), show "Current: Thinking 0:12" and optionally "Last: Bash 0:45, Read 0:01."

---

### 15.6 Interleaved Thinking Toggle

**Concept:** A **setting** (and optional per-session override) to show or hide **extended thinking/reasoning** content as it streams. When on, the thinking pane or section is visible and updates live (§12). When off, thinking is not shown (or only a "Thinking..." placeholder) to reduce noise or save space. Some platforms stream thinking; others don't--the toggle only affects display when data is present.

**Relevance:** User control over information density; aligns with "thinking" in the normalized stream (§5, §12).

**Implementation:** Config key e.g. `ui.show_thinking_stream` (default true). In the stream consumer, if false, discard or hide `thinking_delta` content in the UI but still allow backend to use it if needed. Toggle in Settings and optionally in the run view toolbar.

---

### 15.7 MCP (Model Context Protocol) Support

**Concept:** **Model Context Protocol** allows the CLI (or our app) to connect to external MCP servers that expose tools and data sources. The app can list configured MCP servers, enable/disable them, and pass through server config to the platform CLI (e.g. via `--mcp-config` or platform-specific flags). No direct implementation of MCP in the app; we act as a **config and passthrough** layer so the user can manage servers in one place and the CLI gets the right arguments.

**Relevance:** Many platforms already support MCP; we already mention it in AGENTS.md. A dedicated "MCP" section in settings (or under Plugins) would make server management visible and consistent.

**Implementation:** Config schema: list of servers (name, command, args, env, auto_start). GUI: "MCP" tab or subsection to add/edit/remove servers and test connection. When spawning the CLI, merge this config into the platform's expected flag or config file (per platform_specs). Document which platforms support MCP and how (e.g. env var, flag, config file path). **See Plans/newtools.md §8** for concrete MCP-in-GUI design (Config → MCP, Context7 default/API key/toggle, per-platform config table, and Option B run-config wiring).

---

### 15.8 Project and Session Browser

**Concept:** A **browser view** that lists projects (e.g. by recent working directories or a user-maintained list) and, per project, sessions or runs (e.g. last 10 runs, interview sessions, orchestrator runs). User can search and filter (e.g. by date, platform, outcome). Optional: show **git status** per project (branch, dirty files count) so the user can see state at a glance. Clicking a project opens it; clicking a session might open run detail or restore.

**Relevance:** Improves navigation when the user has many projects or long history; supports "resume where I left off" and "see what ran where."

**Implementation:** Data: scan app data or redb for run/session metadata per project path; maintain a "recent projects" list (already may exist). UI: new view "Projects" or "Browser" with a list/grid of projects, expandable to show sessions. Optional search/filter bar. Git status: call existing git module for branch and status; show as badge or one-line summary. Reuse existing widgets and theme.

---

### 15.9 Mid-Stream Token and Context Updates

**Concept:** During a **streaming** response, update **token count** (and optionally context usage %) in the UI in real time, not only when the response completes. The backend receives usage or token-delta events from the normalized stream and pushes them to the UI; the "Context: X%" or "Tokens: N" display updates live. Reduces "did it hang?" anxiety and supports compaction decisions mid-stream.

**Relevance:** Extends persistent rate limit (§3) and stream visualization (§12); requires protocol normalization (§5) to have `usage` or token events in the stream.

**Implementation:** In the stream consumer, on `usage` or token-delta event, update in-memory session stats and emit a UI message (e.g. "UsageUpdated"). GUI: the usage widget (header or run view) subscribes and redraws. Usage updates throttled to **max once per 500ms**. Config: `ui.usage.throttle_ms`, default `500`. Document which platforms send mid-stream usage; others show final-only.

---

### 15.10 Multi-Tab and Multi-Window

**Concept:** Support **multiple tabs** in a single window (e.g. different views or different projects per tab) and **multiple windows** (e.g. one window per project or per run). Optional **drag** of tabs between windows. Tab state (selected view, project, scroll position) is per-tab; window position/size is per-window. Improves multitasking and comparison across projects or runs.

**Relevance:** Scales the GUI to power users who run several projects or sessions in parallel.

**Implementation:** Iced and our current app structure may be single-window; multi-window would require explicit window management (e.g. new window = new app instance with shared state, or a single process with multiple windows). Tabs: add a tab bar to the main layout; each tab holds a view id + context (e.g. project path); switching tabs loads that view/context. Persist tab list and order (e.g. in config or recovery snapshot). Drag-between-windows is optional and platform-dependent.

---

### 15.11 Virtualized Conversation or Log List

**Concept:** For views that show a **long list** of messages, iterations, or log lines (e.g. 10k+ items), use **virtualized rendering**: only render the visible portion of the list plus a small overscan. Scroll position drives which slice is rendered; DOM/widget count stays bounded so scrolling stays smooth and memory stays low.

**Relevance:** Long orchestrator runs or interview sessions could produce very long logs or message lists; virtualization keeps the UI responsive.

**Implementation:** Iced may have or need a virtualized list widget (or a "lazy" list that requests only a window of items). Implement a list that takes total count + a "fetch slice" callback (start index, length) and only builds children for that slice. Reuse for: run log view, message history view, restore-point list. Document max recommended items and overscan size.

---

### 15.12 "Know Where Your Tokens Go" (Analytics Framing)

**Concept:** Frame the analytics dashboard (§7) explicitly as **"where your tokens go"**: emphasize breakdown by project, by model, and by date so the user can see what consumes the most tokens or cost and adjust (e.g. move heavy work to a different platform or tier, or trim context). Optional: simple "top 5 projects by tokens" or "top 3 models by cost" on the dashboard or in the analytics view header.

**Relevance:** Makes analytics actionable; reinforces persistent rate limit (§3) and tier selection.

**Implementation:** Copy and UX only: add a short tagline or section title in the Analytics view (e.g. "See where your tokens go") and optionally pre-sort or highlight "by project" and "by model" sections. No new backend; reuse §7 data and UI.

---

### 15.13 One-Click Install for Commands, Agents, Hooks, and Skills (No Code)

**Concept:** **Extend without coding:** users can install **commands, agents, hooks, and skills** from a **curated catalog** with one click. No writing code or editing config files by hand. The catalog lists named items (e.g. "FileSafe dangerous-command blocklist hook", "Code review command", "Rust skill pack") with short descriptions; user clicks "Install" and the app downloads or copies the artifact into the right place (plugin dir or config), enables it, and optionally runs a one-time setup. Updates or uninstall are equally simple (e.g. "Update" / "Remove" in the same UI). Everything in the catalog is pre-built: ready-to-use hooks, agent markdown files, skill JSON, and command definitions.

**Relevance:** Makes the plugin/skills system (§6) and hooks (§9) accessible to non-developers. "One-click install, no code" is a strong UX promise: extend behavior by choosing from a list, not by writing scripts or editing JSON.

**Implementation:** Define a **catalog format** (e.g. a JSON or manifest listing id, name, description, type [command|agent|hook|skill], source URL or bundled path, version). Catalog can be bundled in the app or fetched from a static URL (e.g. GitHub Pages or a simple index file). "Install" = copy files to the appropriate plugin/config location and enable. GUI: "Extensions" or "Plugin catalog" view with search and "Install" / "Remove" / "Update" per item. No code execution beyond copying and parsing; all catalog items are static assets (markdown, JSON, or signed scripts if we ever support remote scripts). Ship a small default catalog (e.g. FileSafe-style dangerous-command blocklist hook, a few skills) so the feature is useful from day one.

> **SSOT cross-reference:** Plugin discovery paths, manifest format, and install mechanics for catalog items that are plugins are defined in `Plans/Plugins_System.md` §1 (`#DISCOVERY`). The Catalog tab GUI spec is in `Plans/FinalGUISpec.md` §7.4.3.

---

### 15.14 Full IDE-Style Terminal and Panes

**Concept:** A **terminal** (or "Open terminal") action that opens a shell in the **current project folder**. The user can run commands, inspect files, or use git from the same directory Puppet Master is using for the project without leaving the app or manually `cd`-ing. Either: (1) an **in-app embedded terminal** widget that runs a shell with `cwd` set to the project path, or (2) **launch the user's default external terminal** (e.g. gnome-terminal, kitty, iTerm, Windows Terminal) in that directory. Both options are valid; choose one or support both (e.g. "Terminal" opens embedded, "Open in external terminal" in a menu).

**Relevance:** Reduces context-switching when the user wants to run a quick command, check git status, or inspect the workspace. Aligns with "current project" already in app state (Dashboard, orchestrator, interview all have a project path).

**Implementation:**
- **Project path:** Use the same "current project" / workspace path the app already uses (from project selection, orchestrator run, or interview). If no project is selected, disable the action or open in a sensible default (e.g. app data dir or prompt to select a project).
- **Embedded terminal:** If the app embeds a terminal, use a crate that provides a PTY and a terminal widget (e.g. for Iced, a terminal widget if available, or a minimal shell view). Set `cwd` to the project path when spawning the shell.

**Terminal Instance Policy (Resolved):**
- **One terminal instance per project.** When the active project changes, the terminal's cwd switches to the new project's root.
- A **global terminal** is also available via the command palette (`/terminal-global`) — its cwd is the Puppet Master data directory.
- Output channels (Build, Hot Reload, Tests) are separate tabs within the project terminal, not separate terminal instances.
- Config: `terminal.scope` — `"project"` (default) or `"global"` (single terminal for all projects, cwd is last active project).

Security: same process-isolation and sandbox considerations as the rest of the app; terminal runs in the user's environment.
- **External terminal:** If opening an external app, resolve the user's preferred terminal (config or platform default: e.g. `$TERM`, or a list of known terminals per OS) and launch it with the working directory set (e.g. `gnome-terminal --working-directory=<path>`, `cmd /c start cmd /k cd /d <path>`, or platform-specific equivalent). Use existing path from app state; no new "project" concept.
- **UI:** A "Terminal" or "Open terminal" entry in the main menu, Dashboard, or project context menu (e.g. right-click project → "Open terminal here"). Use existing widgets for menus and buttons; check `docs/gui-widget-catalog.md`.
- **DRY:** Single "open terminal at path" helper (or two: embedded vs external); call from whichever UI surfaces expose (menu, dashboard, context menu). Project path must come from app state (single source of truth).


**Panes (full IDE-style):** Terminal (one or more tabs, cwd = project path; optional external terminal). **Problems:** diagnostics from build/linters/LSP; click to file:line. **Output:** channels for Build, Hot Reload, Tests; used by §15.16. **Debug Console:** REPL for debug session; DAP later. **Ports:** ports in use; optional Tilt/Skaffold. **Implementation:** Panel (bottom/side) with tab bar; shared project path; resize/collapse. Reuse widgets; add panel/tab components if needed. (Supersedes earlier "terminal only" scope).

---

### 15.15 Hot Reload, Live Reload, and Fast Iteration (Puppet Master IDE)

**Concept:** Native support for **hot reloading, live reload, and fast iteration** (Puppet Master IDE or Cursor-extended IDE). One-click launch of the right dev server/watcher; live logs and errors in integrated Terminal/Output (§15.14). Where supported, preserve app state across reloads. The **Assistant** can **call up live testing tools** (e.g. "start hot reload dev mode", "run tests in watch mode"); results surface in IDE panes.

**Target platforms/workflows (prioritized):**
- **Web:** Vite/Next.js HMR, webpack dev server, nodemon for backend restarts.
- **Mobile:** Expo Fast Refresh (React Native), Flutter hot reload.
- **Native desktop:** Iced 0.14 hot reload (beacon server), Slint live preview, Dioxus native HMR.
- **Backend/prod:** cargo-watch / nodemon, Skaffold/Tilt for K8s dev loops.

**Requirements:**
1. **Detect project type** automatically: scan `Cargo.toml`, `package.json`, `pubspec.yaml`, Expo config → project kind (Rust, Node/Next/Vite, Flutter, Expo, etc.).
2. **One-click launch:** "Hot Reload Dev Mode" / "Start Dev Server" button or menu → spin up the right watcher/dev server.
3. **Integrated terminal/output:** Live logs, errors, reload status in Terminal/Output panes (§15.14).
4. **State preservation:** Where supported (React Fast Refresh, Flutter hot reload), preserve app state; document per stack.
5. **Remote/prod sync:** Tilt/Skaffold support; port-forwarding and status in Ports pane.
6. **API hooks:** VS Code extension APIs if extending Cursor/VS Code; LSP or custom protocol for custom Rust IDE so agents can request "start dev server" / "run tests."

**Implementation steps:**
1. **Project scanners/detectors:** Scan project root for `Cargo.toml`, `package.json`, `pubspec.yaml`, Expo config; return project type and suggested dev command (`cargo watch -x run`, `npm run dev`, `expo start`, etc.). Single source required; used by one-click launch and Assistant.

2. **Integrate watchers:** Spawn correct process with `cwd` = project path; stream stdout/stderr to Output (and optionally Terminal); track PID for shutdown.
3. **UI:** Toolbar/menu "Hot Reload Dev Mode" / "Start Dev Server"; status bar "Hot Reload: Active" or "Dev server: running". Use existing widgets.
4. **Error handling:** Parse build output for errors → Problems pane; auto-rebuild where watcher supports it; on crash offer Restart and log to Output.
5. **Cross-platform:** macOS, Linux, Windows; no WSL. Same path/process abstractions as rest of app.
6. **Assistant integration:** Assistant can request "start hot reload dev mode" or "run tests in watch mode"; app starts watcher and routes output to Output/Terminal. Expose message or API (e.g. StartDevMode, RunTestsWatch) for Assistant execution path.

**Edge cases:** Use hot reload when stack supports it; fallback to live reload and show "Live Reload" in status. On IDE close or project switch, terminate dev process (SIGTERM then SIGKILL); no orphan processes. Do not auto-restart on next open without user action.

**Non-goals:** Full DAP debugger is separate; Ports can start as "list ports in use" then integrate Tilt/Skaffold. This section focuses on detect → one-click launch → integrated output and Assistant-callable live tools.

---

### 15.16 Sound Effects Settings

**Concept:** A **Sound effects** settings section where the user can enable or disable sounds for different events and choose which sound plays for each. Per event: enable/disable toggle and a way to select the sound (dropdown, list, or picker). **Users can load their own sounds** in addition to any built-in set. Layout and look are flexible -- whatever fits the app; no specific visual reference required. Sounds play when the corresponding event occurs (e.g. agent complete, permission required, error).

**Relevance:** Improves feedback when the user is not focused on the window (e.g. agent done, HITL approval needed, build failed). Aligns with Settings/Config; same config persistence and widget reuse as other toggles.

**Event categories (examples):**
- **Agent:** Play sound when the agent (orchestrator iteration, Assistant, interview turn) is complete or needs attention.
- **Permissions:** Play sound when a permission is required (e.g. tool approval, HITL gate).
- **Errors:** Play sound when an error occurs (build failure, gate failure, runner crash).
- Optional: **HITL:** Play sound when paused for human approval; **Dev server:** when hot-reload dev server is ready or fails; **Build:** when a build completes (success or failure). Start with Agent, Permissions, Errors; extend as needed.

**UI:** Layout and styling are up to the app. Requirements: per-event **toggle** (on/off) and **sound selection** (dropdown or list of available sounds). Optionally a short description per event. Use existing widgets per `docs/gui-widget-catalog.md` where they fit.

**Implementation:**
- **Sound catalog:** Combined list of **built-in** sounds (bundled or from app sounds dir) and **user-loaded** sounds. Each entry: id, display name, source path or bundle ref. Format: WAV/OGG/MP3 or platform-supported; play via system sound or a small audio crate (e.g. rodio). DRY required: one catalog must be used by both selection UI and playback.

- **User-loaded sounds:** User can **load their own sound files** (e.g. "Add sound" or file picker). Accepted formats: WAV, OGG, MP3 (or subset). Store user-added files in a known dir (e.g. app data `sounds/` or `.puppet-master/sounds/`); catalog includes them by path or by copied filename. Selection UI (dropdown/list) shows both built-in and user-loaded; user can remove or rename user-loaded entries if desired. Config stores selection by stable id (built-in id or path/filename for user sounds).
- **Config:** Persist per-event enabled (bool) and selected sound id/path in app config. Load/save with rest of Settings; wire via same Option B as other config.
- **Playback:** When an event occurs, check config for that event; if enabled, play the selected sound. Single "play_sound(sound_id_or_path)" helper; no duplicate playback logic per event.
- **Accessibility:** Respect system "reduce motion" / "silent" preferences if available; optional global "Sound effects: off" master toggle.

---

### 15.17 Instant Project Switch (OpenCode Desktop-Style)

**Concept:** The user can **instantly switch between projects**; **all context and settings swap** with the selection. A **project bar** (or sidebar) lists open/recent projects; selecting one switches the active project immediately -- dashboard, config, orchestrator, interview, terminal cwd, and any project-scoped state all reflect the new project without a full app restart or manual re-selection.

**Reference: OpenCode Desktop.** [OpenCode](https://github.com/anomalyco/opencode) (anomalyco/opencode) recently released a Desktop app (Tauri shell loading a Solid.js web app from `packages/app`). Their project switcher is implemented as follows (from code exploration of `packages/app` and `packages/desktop`):

- **Project bar / sidebar:** A collapsible sidebar shows a list of **projects** (each project = workspace directory). When collapsed, it becomes a narrow **bar** of project tiles (icons/names); the user can hover to expand or click a tile to switch. See `packages/app/src/pages/layout.tsx` and `packages/app/src/pages/layout/sidebar-project.tsx`.
- **Single source of truth for "current project":** The **route/URL** encodes the active project: `/:dir/session/:id` where `dir` is the project directory path base64-encoded. So `params.dir` (from the router) should be the single source of truth; all UI and data must be derived from it (e.g. `currentDir() = decode64(params.dir)`).

- **What swaps when switching:** (1) **Navigation:** `navigateToProject(directory)` updates the route (e.g. `navigate(\`/${base64Encode(root)}/session/${lastSessionId}\`)`). (2) **Per-project state:** Sync and session data are keyed by directory via `globalSync.child(directory)` -- so when the route changes, every component that reads `currentDir()` or `params.dir` gets the new project's data from the same global store. (3) **Persisted project list:** "Open" projects are kept in `layout.projects` (from `context/layout`); `layout.projects.list()`, `.open(directory)`, `.close(directory)`; this list is persisted so the sidebar shows the same set across restarts. (4) **Last session per project:** `lastProjectSession[root]` stores the last session id (and directory) per project root so switching back opens the same session. (5) **Workspace order/names:** Optional workspace (e.g. git worktree) order and display names are stored per project in the layout store.
- **Context/layout:** `LayoutProvider` (in `packages/app/src/context/layout.tsx`) holds sidebar open/close state, panel widths, and per-project workspace toggles; the **project list** itself is maintained by a combination of persisted layout and server "recent projects" (e.g. `server.projects.last()`). So "context and settings" that swap are: everything that is **keyed by project path** (directory) -- sessions, file tree, terminal cwd, project-specific config). Global UI state (sidebar width, theme) stays; project-scoped state is selected by current project path.
- **Desktop shell:** The desktop package (`packages/desktop`) is a Tauri app that loads the app bundle and provides platform APIs (file picker, storage, deep links). Project switching is entirely in the web app; no Tauri-specific logic for "switch project" -- it's just navigation + reactive state keyed by directory.

**Relevance for Puppet Master:** We already have a "current project" in app state (Dashboard, orchestrator, interview, terminal all use a project path). Adding a **project bar** (left sidebar, collapsed strip) that lists recent/open projects and sets the current project on click would give the same "instant switch" feel; all views that depend on the current project path would then show the new project's context. Config can be **per-project** (e.g. `.puppet-master/config.yaml` per project directory) or **global with project overrides**; either way, switching the active project must cause the app to load that project's config and state.

**Implementation (Puppet Master):**

- **Project list:** Maintain an "open" or "recent" project list (e.g. from config, recovery, or a scanned list). Persist it so the bar shows the same set across restarts. Allow "Open project..." (folder picker) to add and "Close" to remove.
- **Project bar or sidebar:** A visible **bar** or **sidebar** that lists these projects (by name or path). User can click one to switch. Optionally: collapsible to a narrow bar (icons or short names only); expand on hover or click. Reuse existing widgets; see `docs/gui-widget-catalog.md`.
- **Single source of truth:** Treat **current project path** as the single source of truth in app state (e.g. `App::current_project_path: Option<PathBuf>`). All views (Dashboard, Config, Wizard, Orchestrator, Interview, Terminal) must read this; when it changes, they should re-load or re-key their data (sessions, config, cwd) from the new path. never maintain a second "selected project" state.

- **What swaps on switch:** (1) Set `current_project_path` to the selected project. (2) Load that project's config (e.g. `.puppet-master/config.yaml` in that path, or from a global store keyed by path). (3) Update any project-scoped state: orchestrator state, interview state, recovery snapshot reference, terminal cwd, evidence/log paths. (4) Optionally persist "last session" or "last view" per project so switching back restores the same view/session. (5) Re-run config discovery for the new path so Doctor, tier config, and run config reflect the new project.
- **Persistence:** Persist the list of open/recent projects (and optionally last session or last view per project) in app config or recovery so the project bar and "where I was" survive restarts.
- **DRY:** must reuse existing "current project" / project path usage everywhere; the project bar should only update that one field and triggers a re-load of project-scoped data.


**References:** OpenCode repo: [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) -- `packages/desktop` (Tauri shell), `packages/app` (Solid.js app), `packages/app/src/pages/layout.tsx` (main layout and project/sidebar logic), `packages/app/src/pages/layout/sidebar-project.tsx` (project tiles and switcher), `packages/app/src/context/layout.tsx` (layout and project list state). OpenCode Desktop is BETA; their project ID is derived from repo root (issue #5638: multiple worktrees from same repo can collide); we can use full path or a stable id per project to avoid that.

**Snapshotting (§4) and instant project switch:** Recovery snapshot (§4, §19.9) serializes **selected project path**; on restore, set `current_project_path` from snapshot. Restore points (§8) are keyed by project; switching project = UI shows restore points for the new project. On switch, the next **periodic** snapshot will record the new current project; optionally write a lightweight per-project checkpoint (view + session) for the project we're leaving so switching back restores "where I was." Crash recovery: snapshot contains last active project path; project list (open/recent) must be persisted separately so the bar shows the same set after restore.

**Database / structured storage (§14, rewrite):** With file-based state, all paths under each project's `.puppet-master/`. With seglog + redb + Tantivy (rewrite-tie-in-memo): **project_path is a first-class key** in events and projections; runs, restore points, usage rollups are per-project or keyed by project_path. Switching project = change `current_project_path`; all reads for "current" data use the new path; no migration of data. Analytics "by project" already groups by project_path.

**GUI (expanded):** **Project Bar Placement (Resolved):** **Left sidebar**, collapsible to a narrow icon bar: Expanded width: **240px**. Collapsed width: **48px** (icons only). Default: expanded on desktop (window width ≥ 1200px), collapsed when window width < 1200px. User can manually toggle collapse/expand (persisted in redb `ui.project_bar.collapsed`). Project list sorted by last-accessed (most recent first). Active project highlighted. Running projects show an activity indicator (spinner icon). **Per tile:** Name (basename or display name), optional icon; click = switch; context menu: Rename, Close. **"Open project...":** Folder picker; canonicalize path; deduplicate if already in list. **Empty state:** "No project open" + prominent "Open project...". **Keyboard:** Optional shortcut (e.g. Cmd/Ctrl+O) or project switcher in command palette (§11); optional Cmd+1-9 for first 9 projects (OpenCode issue #9600). **Accessibility (§23.11):** Keyboard-navigable; screen reader labels ("Project: &lt;name&gt;, switch to project"). **Stable identity:** Use canonical path so same directory via symlink/casing is one project; document Windows vs Unix.

**Gaps (to resolve in implementation):** (1) **Where is the project list stored?** App config vs dedicated file vs recovery payload; document so recovery, sync (§22), and project bar use the same place. (2) **Project path no longer exists:** Detect on switch/startup; skip or remove from list; offer "Remove" or "Locate...". (3) **Same path twice (symlinks/casing):** Canonicalize; deduplicate on add and load. (4) **In-flight run when switching project (Resolved):**
When the user switches projects while a run is active on the current project:
- **Prompt:** "A run is active on [Project X]. Switch anyway? The run will continue in the background."
- If confirmed: switch to new project. The previous run continues in background. Its status is visible in the project bar (activity indicator on the project icon).
- If declined: stay on current project.
- The user can return to the original project at any time to see the run's progress.
- Config: none (always prompt). (5) **Max list size and eviction:** Define cap (e.g. 30), LRU vs FIFO; document in config. (6) **Interaction with multi-tab (§15.10):** Project bar global (switch = change active tab's context) vs per-tab project; decide when implementing tabs.

**Potential problems:** (1) **Config load failure for new project:** Switch with defaults, show error and stay, or switch + banner "Config missing; using defaults"; document. (2) **Dirty State When Switching Project (Resolved):** **Persist to last view per project.** When the user switches away from a project with unsent text in the input field: the unsent text is saved to redb (`project:{id}:last_input`). On return to that project, the input field is restored with the unsent text. No discard prompt, no modal. Seamless context switching. If the project is removed from the project list, its persisted input is also removed. (3) **Performance with many projects:** Lazy-load config/state on switch; bar only needs names for display. (4) **Sync (§22):** Project list in payload; paths may differ across devices (Windows vs Mac); document machine-specific or re-bind paths on import.

---

### 15.18 Built-in Browser and Click-to-Context (Cursor-Style)

**Concept:** The user can **launch webapps from Puppet Master** in a built-in browser. When the user **clicks an element** on the page, the app **immediately sends that element's context to the chat/Assistant** so the agent has DOM and structure without the user copying or describing it. This mirrors Cursor's in-app browser and "click to give context to the agent" behavior; Cursor achieves it via an Electron-hosted browser; we achieve it natively with an **embedded WebView**. The same browser is used for **local HTML preview with hot reload** (Plans/FileManager.md §8); when viewing a local HTML file there, the user can also click elements and send them to the Assistant.

**Reference:** Cursor 2.0 provides an [in-app browser](https://cursor.com/docs/agent/browser) for agent use; users report that opening a browser via agent can sometimes open the system browser instead of an in-IDE view. Third-party flows (e.g. Web to MCP, [Browser Tools MCP](https://apidog.com/blog/browser-tools-mcp-server/), [React Grab](https://github.com/nicholasgriffintn/react-grab)) send element or component context via MCP, clipboard, or automation. Here we want the same **built-in** flow: click → context → Assistant in one step, without leaving the app.

---

#### Implementation (native app, post-rewrite)

**1. WebView stack and windowing**

- Use **Wry** (tauri-apps/wry): WebKit on macOS/Linux, WebView2 on Windows. Wry's `WebViewBuilder::build()` accepts any type implementing **`HasWindowHandle`**, so a **winit** window (Slint's backend per rewrite-tie-in-memo) is compatible.
- **Linux:** Wry uses WebKitGTK. On **X11**, `build(&window)` or `new_as_child()` can embed in a winit window. On **Wayland**, Wry typically requires a **GTK** container (e.g. `WebViewBuilderExtUnix::build_gtk(vbox)` with a `gtk::Fixed` or vbox); the tao crate exposes `window.default_vbox()` for this. Slint + winit does not provide a GTK widget by default, so **on Linux Wayland the browser may need to be a separate window** (Wry creates its own window) until we have a Slint-GTK or winit-GTK integration path. Document: X11 = embeddable; Wayland = separate window or GTK path.
- **Create WebView:** One WebView per "browser" instance. Load user-supplied URLs via "Open URL" or a webapp/bookmark list. Optional: URL bar, back/forward, refresh in the Browser panel chrome.

**2. Getting element context from the page to Rust**

Two mechanisms:

- **Custom protocol (recommended):** Register a custom scheme (e.g. `puppet-master`) with **`with_asynchronous_custom_protocol`**. The handler receives `Request<Vec<u8>>`; `request.body()` and `request.uri()` are available. Use **async** so we don't block the WebView thread (e.g. push payload to app state or channel, then `responder.respond()` with a minimal 200 body). **Note:** On older WebKit2GTK (pre-2.36), POST body/headers to custom protocols were not passed (wry #614); newer Linux stacks support it. Fallback: send element context as **GET** with a query parameter (e.g. base64-encoded JSON) if POST body is empty on legacy systems.
- **IPC handler (alternative):** Wry's `with_ipc_handler` receives messages from `window.ipc.postMessage(string)`. JS can `postMessage(JSON.stringify(elementData))`. Limitation: on Linux/Android, "the request URL is not supported on iframes and the main frame URL is used instead"; and availability of `window.ipc` on arbitrary loaded pages may be platform-dependent. Prefer **custom protocol** for portability and consistent POST body handling.

**3. Injected script: when and what to capture**

- Use **`with_initialization_script`** (runs before `window.onload` on each new page load) to install a **document-level click listener**. Guarantee: script runs in main frame; on Windows, scripts are also added to subframes (wry docs).
- **Capture mode:** Do **not** send every click to the Assistant. Support one of: (a) **Modifier key:** e.g. Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) to "send this element to chat"; (b) **Toolbar toggle:** "Send element to chat" on, then next click sends context, then toggle off; (c) **Right-click context menu:** "Send element to chat" in a custom context menu. Option (a) or (b) is recommended so normal browsing is unaffected.
- In the listener: `if (!captureMode) return;` then `event.preventDefault(); event.stopPropagation();` to avoid navigation/form submit; get `event.target`, serialize it (see **Element context schema** below), then `fetch("puppet-master://element-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })`. No need to read the response body in JS; Rust responds with 200 and empty or minimal body.
- **Capture-mode state:** The "capture mode" flag must be visible to the injected script. Options: (1) **Initialization script** reads a global set by the host (e.g. `window.__puppetMasterCaptureMode = true` via `evaluate_script` when user toggles); (2) **Only modifier:** no global; script checks `event.metaKey`/`event.ctrlKey`. Option (2) avoids cross-script state but doesn't support "toggle then click." Prefer (2) for v1; add (1) if we add a toolbar toggle.

**4. Element context schema (what to send to the Assistant)**

Aim: **token-efficient**, **agent-useful** summary of the clicked element. Raw `outerHTML` can be huge; prefer a structured, bounded payload.

- **Required fields:** `tagName`, `id` (or null), `className` (string), `textContent` or `innerText` (truncated to **500 characters**), `role`, `ariaLabel` (from `getAttribute('aria-label')` or `aria-label`), `rect` (`getBoundingClientRect()`: `x`, `y`, `width`, `height`), `parentPath` (short CSS-like path, e.g. `div#main > section > button.submit`, max depth **6 levels**).
- **Optional but useful:** `outerHTML` **truncated** (first **2000 characters** + "..." if longer), `href` for anchors, `name` for form controls, `type` for inputs, `disabled`, `visible` (e.g. offsetParent check or intersection with viewport). **Omit** large blobs (e.g. full subtree HTML) by default; offer "Include full HTML" in settings or as a second action if needed.
- **Token budget:** Cap total JSON size at **4 KB**. If over cap, truncate `textContent` and `outerHTML` first, then shorten `parentPath`.
Config keys: `browser.element_context.text_content_chars` (500), `browser.element_context.outer_html_chars` (2000), `browser.element_context.parent_path_depth` (6), `browser.element_context.total_cap_bytes` (4096).
- **Reference:** "Element to LLM"-style formats (e.g. layout-aware, accessibility-tree-style) can improve agent reasoning; we can adopt a compact JSON shape inspired by that and extend later (e.g. add `childrenSummary` or `siblingContext`).

**5. Rust handler and Assistant integration**

- In the **async custom protocol** handler: parse `request.body()` as JSON; validate required fields and size cap; push the payload to app state (e.g. a channel or "last captured element" + event). Then `responder.respond(Response::builder().status(200).body(vec![]).unwrap())`.
- **Main loop / UI:** When the event is received, format the element context for the Assistant (e.g. a markdown block or a structured attachment). Per **Plans/assistant-chat-design.md**, add support for an **"element context" attachment type** or a **"User selected element"** message variant so the next Assistant turn receives it (e.g. "User selected this element: ..." in the conversation). Do **not** block the custom-protocol callback on network or heavy work; keep handler fast and delegate to the app's event loop.

**6. GUI placement and UX**

- **Browser tab/panel:** Expose a "Browser" tab or panel (e.g. alongside Dashboard, Chat, Interview). Content: URL bar, optional back/forward/refresh, and the WebView. Optional: split view (browser + chat) so the user sees the page and the Assistant in one place.
- **Feedback:** When the user sends an element to chat, show a **toast** ("Element sent to chat") and/or briefly **focus or scroll** the chat input so the user can type a follow-up. Optionally show a one-line summary in the chat (e.g. "Added: &lt;button class=\"submit\"&gt;") before the full context is attached.
- **Keyboard:** Document shortcut for "Send element to chat" (e.g. Cmd+Click) in §11 and in-app help. For **accessibility (§23.11):** provide a way to "select current focused element and send to chat" (e.g. focus an element via Tab, then a shortcut) so keyboard-only users don't rely on mouse click.

---

#### How to make it work (phased)

- **Phase A -- Separate-window browser + capture:** Implement a **standalone browser window** (Wry + winit/tao), no Slint embedding. Custom protocol + initialization script; capture on Cmd/Ctrl+Click; serialize with the schema above; Rust handler parses and stores in app state. Verify on Windows, macOS, Linux (X11 and Wayland with separate window).
- **Phase B -- Element schema v1:** Ship required fields + truncated optional fields; enforce token/size cap; add a simple "Element sent to chat" toast. No Assistant integration yet; just confirm capture and display in a debug or preview pane.
- **Phase C -- Assistant integration:** Extend Assistant chat (assistant-chat-design.md) with "element context" attachment or message type; when capture event fires, append the formatted context to the current thread and optionally focus the composer. Test with a few real pages (e.g. Cursor docs, a local HTML form).
- **Phase D -- Embedding (optional):** If we have a winit window handle and (on Linux) a GTK path, try **child WebView** (e.g. `new_as_child`) so the browser lives inside the main window. Fall back to separate window on Wayland if needed.
- **Phase E -- Polish:** Toolbar "Send element to chat" toggle, optional "Include full HTML," keyboard shortcut for "send focused element," and any allowlist/security UX (see below).

---

#### Element context schema (detailed)

| Field         | Type   | Max/notes | Purpose for agent |
|---------------|--------|-----------|--------------------|
| `tagName`     | string | --         | Element type |
| `id`          | string \| null | -- | Stable selector |
| `className`   | string | --         | CSS class |
| `textContent` | string | 500 chars | Visible text |
| `role`        | string | --         | ARIA role |
| `ariaLabel`   | string \| null | 200 chars | Accessible name |
| `rect`        | `{ x, y, width, height }` | -- | Position/size |
| `parentPath`  | string | depth **6** | DOM path |
| `outerHTML`   | string | 2000 chars | Optional HTML |
| `href`        | string \| null | 500 chars | For links |
| `name`, `type`, `disabled` | as needed | -- | Form controls |
| `visible`     | boolean | --         | Rough visibility |

Encode as JSON; total payload cap **4 KB** (Config: `browser.element_context.total_cap_bytes`, default `4096`) with truncation as above.

---

#### Security

- **Arbitrary URL loading:** The WebView loads user-chosen URLs. Treat all page content as **untrusted**. Do not expose sensitive host APIs to the page; the only "back channel" is our custom protocol or IPC, and we only accept **element context** payloads (validate shape and size).
- **Validate and sanitize:** Before passing captured JSON to the Assistant, validate structure and cap sizes. Avoid re-rendering raw page HTML in the chat without sanitization if we ever show it in a rich view (e.g. use plain text or a safe subset).
- **Navigation and schemes:**

**Browser Navigation Scheme Policy (Resolved):**
- **Blocked schemes:** `file://`, `blob://`, `data:` (with executable MIME types). Navigation to these schemes is silently blocked with a console warning.
- **Warning schemes:** Non-HTTPS schemes (e.g., `ftp://`, `ws://`). Show a one-time warning: "Navigating to non-secure URL. [Proceed] [Cancel]."
- **Allowed by default:** All `https://` origins. No allowlist needed for HTTPS.
- **Optional allowlist:** `browser.allowed_origins` (array of origin strings). If set, only listed origins are allowed without warning. Non-listed HTTPS origins still work but show no warning (HTTPS is always safe to navigate).
- Config: `browser.blocked_schemes` (default `["file", "blob"]`), `browser.allowed_origins` (default: empty = all HTTPS allowed).
- **Abuse:** A malicious page could repeatedly POST to `puppet-master://element-context`. Mitigate: browser capture rate-limit: max **10 captures per minute** (Config: `browser.capture_rate_limit_per_min`, default `10`); optional "Confirm before sending to chat" for first capture per page; and only accept POST when capture mode is on (modifier or toggle), so random scripts can't trigger sends without user action.

**Browser/Assistant Boundary (Resolved):**
- The built-in browser is **read-only for agents**: navigate, screenshot, extract DOM context. Agents CANNOT click, type, or interact with browser content.
- **User click-to-context** is the only interaction bridge: user clicks an element → context is captured and attached to the next agent prompt.
- Security: same-origin policy enforced. No cross-origin data access by agents. Agent-initiated navigation is limited to the current project's preview URLs.

---

#### Gaps (to resolve in implementation)

- **Same-origin / CSP / strict sites:** Injected script runs in page context; strict CSP or non-scriptable pages may block or break. Fallback: "Copy element" that uses best-effort serialization (e.g. only when we control the page or user confirms "Allow capture on this site"). Document which sites are known to break.
- **Custom protocol POST body on Linux:** Older WebKit2GTK (&lt; 2.36) may not pass POST body to custom protocol (wry #614). Use **async** handler; if body is empty and method is POST, fall back to GET with query param (e.g. `?q=&lt;base64&gt;`) for that session and document minimum WebKit2GTK version.
- **iframes:** Initialization script runs in main frame (and on Windows in subframes). Clicks inside iframes may have different origin; capture may be limited or fail. Document "capture in main frame only" for v1; iframe support later if needed.
- **Linux Wayland embedding:** No GTK widget in Slint/winit by default; browser may be **separate window only** on Wayland until we have a GTK integration path. Document and test.
- **Slint + WebView in one window:** Slint has no native WebView widget. Embedding requires either a separate window, or a platform-specific child (e.g. winit handle + Wry `new_as_child` on X11/Windows/macOS; on Wayland, GTK container). Decide and document in Phase D.
- **Assistant schema:** Assistant chat must define the exact attachment type or message variant for "element context" and how it's presented to the model (assistant-chat-design.md).

---

#### Potential problems

- **Malicious page spamming capture:** Page JS could call `fetch("puppet-master://element-context", { body: ... })` repeatedly. Mitigation: rate limit; only honor captures when user has triggered capture mode (modifier or toggle). We control the injected script, so we can avoid exposing the endpoint to arbitrary page script if we only inject the listener and don't expose the URL in a global.
- **Token budget and context window:** Large or many "element context" attachments could fill the context. Mitigation: strict size cap per capture; optional "Summarize element" instead of "Send full"; and compaction/trimming per §10.
- **Click vs double-click vs right-click:** Define which event we use (e.g. single left-click with modifier). Double-click and right-click should not send unless we add explicit support; document behavior.
- **Accessibility:** Mouse-only capture excludes keyboard users. Provide "send focused element to chat" (e.g. when focus is in the WebView, a shortcut sends the currently focused DOM node). Requires focus tracking and possibly `document.activeElement` in the injected script.
- **Visibility and "what the user sees":** We send DOM and rect; we don't send a screenshot of the element by default. For some UIs (e.g. canvas, SVG, complex CSS), a screenshot might help; that would require render/capture (e.g. canvas or viewport screenshot and crop to rect). Defer to a later enhancement; document as optional.
- **fetch() response on custom protocol:** Some platforms have had issues with `fetch()` to custom protocols not resolving (e.g. Linux). Wry's async responder should still allow us to respond; if the page's fetch hangs, we can still process the body in Rust. Document and test; fallback to IPC if fetch is unreliable on a platform.

---

#### Testing

- **Unit:** Serialization shape: given a mock DOM node object, our JS produces JSON that matches the schema and size cap. Rust: given a valid/invalid JSON body, handler parses, validates, and rejects oversize or malformed input.
- **Integration:** Load a local HTML file in the WebView; trigger capture (modifier+click); assert custom protocol handler receives body; assert app state contains the element payload. Optional: mock Assistant and assert "element context" message is appended.
- **Manual:** Test on Cursor docs, a form, a SPA; verify capture works, toast appears, and Assistant receives context. Test on Linux X11 and Wayland (separate window); test Windows and macOS.
- **Security:** Try loading a page that posts to `puppet-master://` from page script (without our listener); confirm we only accept when capture mode is on and rate limit applies.

---

#### Dependencies and relationship

- **Crates:** Wry; on Linux, WebKitGTK and GTK (and optionally tao for `default_vbox()` if we use GTK embedding). Rewrite uses Slint + winit; Wry's `build(&window)` works with `HasWindowHandle` (winit provides this).
- **Assistant:** Plans/assistant-chat-design.md -- define "element context" attachment or message type and how it's shown to the model.
- **Other plans:** MCP (§15.7) and browser tools (Plans/newtools.md) can complement (e.g. automation, screenshots); click-to-context is in-app and direct to the Assistant. §11 keyboard shortcuts; §23.11 accessibility for "send focused element."

---

