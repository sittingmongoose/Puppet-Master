## 19. Technical Analysis: How These Mechanisms Work

The following explains **how** the features above can be implemented in practice. It is based on public documentation, architecture descriptions, and official CLI/API behavior.

### 19.1 Three-Process Layout and CLI Integration

**Puppet Master architecture:** We use a **single Rust/Iced process**; we do **not** add a middle Node server or WebSocket layer. The "three-process" layout below is an **alternative pattern used elsewhere**; our implementation stays one Rust app that spawns the CLI as a child process and reads stdout (optionally with an in-Rust stream parser and bounded buffers). See §17.5 and the Architecture row in §17.2.

**Alternative pattern (not ours):** A common pattern elsewhere is to run three processes:

1. **Native backend (e.g. Rust/Tauri)** - Window, file system, redb, crash recovery, port management. Exposes many commands to the frontend.
2. **Frontend (e.g. React)** - UI and state. Talks to the backend via IPC and to a middle layer via WebSocket.
3. **Middle server (e.g. Node, often compiled to a binary)** - Listens on a **dynamic port** (e.g. 20000-65000), found and held by the backend to avoid races. This server spawns the **CLI as a child process**.

**CLI invocation:** The middle server spawns the CLI, e.g.:

```text
claude --print --output-format stream-json --model <model> --working-dir <path>
```

Optional: `--append-system-prompt` (or `--append-system-prompt-file`) for orchestration, `--no-session-persistence` for print-only. The CLI's stdout is **newline-delimited JSON**; the server reads it line-by-line and forwards events (e.g. over WebSocket: `stream-chunk`, `stream-complete`, `token-update`).

**Why "no lag":** The UI runs in a separate process from the CLI so the main thread never blocks on CLI I/O. The stream is consumed with **bounded buffers** (e.g. 100KB in a parser, 10MB in the server). Long lists are **virtualized**. Together this keeps input latency low in long sessions.

### 19.2 Usage and Rate Limits (Session vs 5h/7d)

**Session-level token usage (from stream):**  
CLI with `--output-format stream-json` emits **usage in the stream**. When a line's JSON has `type` `"usage"`, it carries e.g. `input_tokens`, `output_tokens`, and optionally cache fields. The server (or a parser) reads stdout line-by-line, parses JSON, and when it sees `usage` forwards to the UI (e.g. `token-update` or `context-update`). **Mid-stream:** emit usage during the response so the context bar updates in real time. So "tokens used this session" and "context usage %" come from **parsing stream-json** and aggregating `usage` events; no separate API is required for per-session usage.

**Account-level limits (5-hour and 7-day windows):**  
Possible sources:

1. **`/usage` slash command** - In interactive mode the user can type `/usage`; there is no documented non-interactive "usage only" CLI flag, so an app cannot simply get usage without running a full session and parsing the reply.
2. **`claude --account`** - Documented to show "subscription tier and approximate usage information." An app can **run `claude --account`** (or platform-equivalent), capture stdout, and **parse** it to get approximate usage and tier. Run periodically (e.g. every few minutes) to refresh the "5h / 7d" display without an API key.
3. **Admin API** - For organizations, Anthropic exposes an Admin API (e.g. `/v1/organizations/usage_report/claude_code`) that returns usage and cost. This requires an Admin API key and is not for individual Pro/Max accounts.

**For Puppet Master:** (1) **Session usage** from our runner's stream when we have stream-json or equivalent. (2) **5h/7d** via periodic `claude --account` (or platform-equivalent) and parsing, and/or optional Admin API when the user provides a key. Document which platforms expose account/usage via CLI vs API.

### 19.3 Stream Format and Protocol Normalization

**Canonical stream:** One JSON object per line on stdout with a required `type` field. Main types:

- `system` - init/session metadata (`session_id`, `model`, `cwd`, `permissionMode`, `tools`).
- `text` - streaming assistant content (`content`).
- `tool_use` - tool call (`id`, `name`, `input`).
- `tool_result` - tool result (`tool_use_id`, `content`, optional `is_error`).
- `usage` - token counts (`input_tokens`, `output_tokens`, optional cache fields).
- `result` - end-of-turn (`is_error`, optional `usage`, `total_cost_usd`, `duration_ms`).
- `message_stop` - end of message.
- `thinking` - optional extended thinking (`thought`).
- `error` - fatal or recoverable error.

The middle server (or backend) reads line-by-line, parses JSON, and forwards or converts to internal events. Multi-provider support uses a **shim** that runs each provider's CLI or API and **translates** its output into this same schema so one parser and one UI pipeline handle all platforms.

**For Puppet Master:** Define our own "orchestrator stream" schema (§5) and, per platform, add an adapter that maps platform output (Claude stream-json, Codex JSONL, Gemini JSON, etc.) into that schema.

### 19.4 Compaction

**Mechanism:** A component monitors **context usage %** from the same token counts as session usage (§19.2). When usage crosses a threshold (e.g. 75% or 85%), it sets a "pending compact" flag. On the **next** user message, the app: (1) Builds a "compact" prompt (e.g. "Summarize this conversation and list key decisions; preserve file paths and open tasks"). (2) Sends that to the CLI; the CLI returns a summary. (3) Replaces "old" messages in state with the summary. (4) Then sends the user's actual message. So compaction is **orchestrated by the app**; the CLI is just the model that produces the summary. Show "Compacting..." in the UI and optionally run hooks at `compaction_trigger` and `context_warning`.

### 19.5 Orchestration Flow

**Mechanism:** Injected via **system prompt**. When spawning a new session, add `--append-system-prompt "<text>"` or `--append-system-prompt-file <path>`. The appended text instructs the model to assess task complexity and follow a loop (e.g. understand → decompose → act → verify) and optionally use named roles. Store the text in a service and allow toggling or customization in settings.

### 19.6 Hooks and FileSafe

**Hooks:** Backend defines events (e.g. `user_prompt_submit`, `pre_tool_use`, `context_warning`, `compaction_trigger`). When an event fires, run configured hooks (e.g. scripts) with a JSON payload; the script returns JSON (e.g. `{ "action": "continue"|"block"|"modify", "payload": ... }`). Enforce a timeout (e.g. 5s) and then continue or block/modify. **Dangerous-command blocking:** Part of FileSafe; PreToolUse can call into FileSafe blocklist. Same contract: receive tool name and arguments, return block with message when dangerous. Config can allow overrides or allowlists.

### 19.7 One-Click Install

**Mechanism:** A **catalog** (JSON or manifest: id, name, description, type, source URL or bundled path). "Install" = download or copy from bundle into the plugin dir, then refresh the in-memory registry (commands, agents, hooks, skills). Each type has a known format (commands = markdown with frontmatter, agents = markdown with YAML, hooks = script path, skills = JSON with triggers and content). One action in the UI runs the install routine; the app does the rest without the user editing files.

### 19.8 Background / Async Agents with Queue and Git Isolation

**Queue:** A **queue manager** (e.g. in Rust) holds a fixed-capacity job queue (e.g. max 4 concurrent). Each job is "run agent X with prompt Y." When a slot is free, the manager spawns the same CLI path used for the main flow (same binary, same stream-json contract) but with a distinct working dir or session id. The manager tracks each run's PID, status (queued / running / completed / failed / cancelled), and output path. Optionally persist queue state to disk so it survives app restart.

**Git isolation:** Before starting a background run: (1) If working tree is dirty, run `git stash`. (2) Create a branch from current HEAD, e.g. `async-{role}-{id}`. (3) Spawn the CLI with `--working-dir` pointing at the repo or an explicit worktree checked out to that branch. (4) CLI runs and commits on that branch when applicable. When the run finishes, the app can offer: diff (`git diff main..branch`), merge (`git merge --no-commit --no-ff` to detect conflicts first), or delete branch. **Conflict detection:** run a dry-run merge (`git merge --no-commit --no-ff` then abort); if exit code or output indicates conflicts, surface in UI and never auto-merge.


**Output isolation:** Each run writes stdout/stderr and any artifacts to a dedicated directory (e.g. `.puppet-master/agent-output/{run-id}/`). The main session's stream and state are separate; the UI shows background runs in a separate panel and does not mix their output with the main conversation.

### 19.9 Session and Crash Recovery

**Snapshot content:** Serialize a minimal struct: current view/phase, selected project path, orchestrator state (phase/task/subtask ids), interview phase and answers if applicable, window position/size, unsent input buffer, timestamp. Optionally include the last N message ids or iteration ids for the active run. Write to a known path (e.g. app data dir + `recovery/snapshot_<timestamp>.json`).

**When to snapshot:** A timer (e.g. every 5 minutes) triggers a snapshot write. Optionally a shorter-interval "auto-save" (e.g. 30s) that only writes a lightweight checkpoint (e.g. unsent input + current view). Use non-blocking I/O so the main loop doesn't stall.

**On startup:** Check for the presence of a recovery file (e.g. newest snapshot under 24 hours). If found, show a small dialog: "Restore previous session?" If user confirms, load the snapshot and restore: set view, project, orchestrator state, interview state, window geometry; optionally restore unsent input. Then delete or archive the snapshot so we don't re-prompt on next launch.

**Panic hook:** Register a panic hook that, before exiting, writes one last snapshot (or a "crash occurred" marker). That way the next launch can offer restore even when the app crashed.

**Cleanup:** On startup or in the background, delete snapshots older than the retention window (e.g. 24 hours).

### 19.10 Plugin and Skills Extensibility

**Discovery:** On startup (and when the user clicks "Refresh"), scan the plugin directory (e.g. app data or project `.puppet-master/plugins/`). Each plugin is a subdirectory containing a manifest (e.g. `plugin.json`) with: id, name, version, and lists of commands, agents, hooks, skills (each entry points to a file or inline config).

**Registries:** Build in-memory maps: command name → (path or content, metadata), agent name → (system prompt, tools, metadata), hook event → list of (script path or handler, metadata), skill trigger → (triggers, content, metadata). These are the "plugin registries" the rest of the app uses.

**Resolution at runtime:** When the user invokes a command, look up the command name in the registry; if it's a plugin command, run it (e.g. build a prompt from the command's markdown and send to the CLI). When building the iteration prompt, collect all skills whose triggers match (e.g. file extension, keyword, or regex against open files or prompt text); append their content to the context. When a hook event fires, run each registered handler for that event with the JSON payload and apply the result (continue/block/modify).

**Formats:** Commands and agents are typically markdown with YAML frontmatter; hooks are scripts (e.g. shell) that read JSON from stdin and write JSON to stdout; skills are JSON (triggers array + content string).

### 19.11 Analytics and Usage Dashboard

**Data source:** Either (a) query **redb** rollups produced by **analytics scan jobs** (scan seglog for run/usage events and write aggregates into redb), or (b) **scan** evidence/run logs on demand (e.g. list directories under `.puppet-master/evidence/` or similar and parse metadata files). The redb rollup approach is faster for large history; the scan approach can be used before rollups are populated.

**Aggregation:** For "by project": group runs by `project_path`, sum tokens/cost, count runs, max timestamp. For "by model/platform": group by platform and model. For "by date": group by day (or week), sum tokens/cost, count runs. Run these queries when the user opens the analytics view or when the time-range filter changes.

**UI:** Time-range selector (7d, 14d, 30d, all); optional project filter; cards for totals; tables or simple charts (e.g. by project, by platform, by date). Export = serialize current view to CSV/JSON and write to a file. All data stays local; no telemetry.

### 19.12 History and Restore Points (Rollback)

**When to snapshot:** After each "logical turn"--e.g. after each iteration in the orchestrator, or after each user message in a chat-style flow. For each turn, record: turn id (or message index), list of files that were modified (path + content before, content after or diff), and optional metadata (timestamp, platform, etc.). Store in a bounded store (e.g. last 50 restore points, or last N days) to limit disk use.

**Storage:** Restore-point metadata is stored in a **redb** `restore_points` namespace/table (keyed by `project_id` + `restore_point_id`), with file snapshot blobs stored inline for small payloads or as app-data blob refs for larger payloads. Restore-point lifecycle changes are emitted as seglog events (`restore_point.created`, `restore_point.pruned`) so projections and audit replay remain deterministic. File snapshots can be full content or diffs; for rollback we need to be able to reconstruct "content before."

**Rollback flow:** User selects a restore point. (1) Compute the set of files that were modified after that point. (2) For each file, check for conflicts: compare stored mtime or hash with current file; if the file was changed outside the app (or by another run), warn and optionally skip or show diff. (3) Show confirmation: "Restore N files and truncate state to this point?" (4) On confirm: write each file's snapshot content back to disk; update app state (e.g. set current phase/task/subtask or message index to that point). Optionally re-run the verification gate for that point.

**Branching:** "Restore and branch" = create a new session/conversation id, copy the restore point's state and file snapshots into that new id, and mark the current session as having "branched from" that point. The user can then continue from the restore point in the new branch without overwriting the original timeline.

### 19.13 Keyboard-First and Command Palette

**Shortcut registry:** Maintain a map: (modifiers + key) → action. Actions are app messages or command ids (e.g. "OpenSettings", "NewRun", "SwitchToDashboard"). On key event (e.g. in the window or a global listener), normalize modifiers (Cmd vs Ctrl by platform) and look up the action; if found, dispatch it. Register shortcuts for every major action (20+).

**Command palette:** A modal or overlay that appears on a fixed shortcut (e.g. Ctrl/Cmd+P). It shows a list of all available actions (and optionally recent projects, open tabs). The list is filtered by the user's typed string (prefix or fuzzy match). User moves selection with Up/Down and activates with Enter; Escape closes. "Execute" = dispatch the same action as if the user had used the shortcut or clicked the menu. The list can be categorized (e.g. Navigation, Run, Settings) for clarity.

**Documentation:** Generate the "Keyboard shortcuts" help view from the same registry so the list is always in sync.

### 19.14 Stream Event Visualization and Thinking Display

**Event types:** From the normalized stream (§19.3), each event has a `type` (e.g. `text`, `tool_use`, `tool_result`, `thinking`, `usage`). Map these to a small set of display types: e.g. read, edit, bash, tool_call, tool_result, thinking, message. Each has an icon and optional short label.

**Event strip:** A horizontal strip (or short list) that shows the **last 15 events**. No sliding time window (event count is simpler and more predictable). Config: `ui.event_strip.max_events`, default `15`. When a new event arrives, append it (and drop the oldest if over the cap). Render each as a small icon (and optional tooltip). Place the strip near the run status (e.g. in dashboard or run detail view) so the user sees "what's happening" at a glance.

**Thinking display:** If the stream emits `thinking` or `thinking_delta` events with a `thought` (or similar) field, append the text to a buffer. Display the buffer in a dedicated pane or collapsible section (e.g. "Thinking" below the main log). Limit display length (e.g. last 4k characters) to avoid UI lag. Sanitize content if needed (e.g. escape HTML). **Thinking toggle:** A setting (e.g. `ui.show_thinking_stream`) controls whether the thinking pane is visible and updated; when off, still consume the events (for protocol correctness) but don't render them, or show only a "Thinking..." placeholder.

### 19.15 Bounded Buffers and Process Isolation

**Bounded buffers:** Any component that reads subprocess stdout/stderr or accumulates stream lines must use a **fixed-capacity** buffer (e.g. a ring buffer or a deque with a max size). When the buffer is full, drop the **oldest** data (or the oldest line). Typical limits: max total bytes (e.g. 10 MB) and/or max number of lines (e.g. 1000). This prevents unbounded memory growth if the CLI produces output faster than the app consumes it or if a run never ends.

**Where to apply:** (1) The process that reads CLI stdout (e.g. in the runner or a middle server): use a bounded line buffer. (2) Any stream parser that accumulates input before parsing (e.g. multi-line JSON): cap the accumulation size. (3) The GUI component that displays "live" run output: feed it from a bounded buffer, not the raw stream.

**Process isolation:** The app process must **never** run the CLI logic in-process (e.g. no embedding the model). The CLI is always a **child process** (or a separate service). The app communicates via stdin/stdout (or sockets). If the CLI hangs, the app can kill the process and remain responsive. This is a non-negotiable architectural constraint for reliability and "no lag."

### 19.16 Database and Persistence (Structured State)

**When to use structured storage:** For state that benefits from **querying** and **indexing**: run history, restore points, analytics aggregates, session metadata. Per rewrite design, structured storage (seglog/redb/Tantivy or equivalent) is part of the architecture, not optional. File-based state (prd.json, progress.txt, AGENTS.md) remains the source of truth for the work queue and long-term memory; the projections layer provides reporting and recovery.

**Schema (minimal):** Tables such as: `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path); `restore_points` (id, run_id, created_at, file_snapshots_json); `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features need them (e.g. interview phases, analytics by hour).

**Implementation:** Use **redb** for durable KV. One module (e.g. `db` or `persistence`) opens the redb database at a fixed path (e.g. under app data dir), runs **migrations** (versioned schema applied in order when the stored schema version is less than the app's), and exposes functions to insert/query. Keep migrations additive where possible.

**Optional:** Allow a "lite" mode (build-time or runtime) that disables redb and relies only on file-based state for minimal deployments.

### 19.17 In-App Project Instructions Editor

**Mechanism:** Determine the path to the project instructions file (e.g. AGENTS.md or CLAUDE.md in the current project root). **Read** the file into memory and show it in a text area (or simple editor widget). On "Save," **write** the content back to that path. Optional: a **live preview** pane that renders the markdown (e.g. via a minimal markdown-to-HTML renderer or by delegating to a web view). The app does not need to interpret the file; it just provides read/write and optional preview so the user can edit without leaving the app. Path comes from app state (current project).

### 19.18 @ Mention System for File References

**Trigger:** In the prompt input widget, detect the `@` character (e.g. on keypress or when the user types `@`). Open a dropdown or overlay.

**Data source:** Build a list of "mentionable" items: (a) recent files (from app state or a recent-files list), (b) modified files in the current run or session, (c) folder contents when the user types `@path/` (e.g. list directory at `path`). Optionally support a small folder tree. Filter the list by the substring after `@` (prefix or fuzzy match).

**On select:** Insert the chosen reference into the input at the cursor. Format can be the raw path or a token like `@path/to/file`. When **building the iteration prompt** (or sending to the CLI), resolve each `@path` token: read the file and include its contents in the context, or add a platform-specific "include file" directive. So the backend must know how to expand mentions into context.

### 19.19 Stream Timers and Segment Durations

**Mechanism:** In the **stream consumer**, track the **current segment** by event type. When a `thinking` (or `thinking_delta`) event arrives, start a timer for "thinking"; when a `tool_use` for Bash arrives, start a timer for "bash"; when a `tool_result` arrives, stop the timer for that tool call and record the duration. Optionally maintain a small **ring buffer** of the last N segments (type + duration in ms). In the UI, show "Current: Thinking 0:12" and optionally "Last: Bash 0:45, Read 0:01." Timers are derived entirely from the normalized stream; no separate instrumentation.

### 19.20 MCP (Model Context Protocol) Support

**Mechanism:** The app does not implement MCP itself; it acts as a **config and passthrough** layer. **Config:** Store a list of MCP servers (name, command, args, env, auto_start). **When spawning the CLI:** Merge this config into the format the platform expects--e.g. for Claude Code, `--mcp-config <path>` or a config file that the CLI reads; for other platforms, the equivalent flag or env. So the user manages the list of servers in the app (add/edit/remove, test connection), and the app writes the config and passes it to the CLI. Document per platform how MCP is configured (flag, env, config file path).

### 19.21 Project and Session Browser

**Data source:** Either (a) scan the file system for "recent" or "known" project roots (e.g. from a saved list, or from run metadata in redb), or (b) list entries from redb (runs grouped by project_path). For each project, optionally list recent sessions or runs (e.g. last 10) with timestamp and outcome.

**UI:** A view that lists projects (and optionally expandable sessions per project). Search/filter by name or path. Optional: for each project, call the **git** module to get branch name and dirty status (e.g. `git status --short`); show a one-line summary or badge. Clicking a project sets it as the current project; clicking a session might open run detail or offer to restore.

### 19.22 Multi-Tab and Multi-Window

**Tabs:** The main layout has a **tab bar**. Each tab holds: view id (e.g. dashboard, config, run detail) + context (e.g. project path, run id). When the user switches tabs, the app loads that view with that context. Tab list and order can be persisted (e.g. in config or in the recovery snapshot). No need to keep every tab's full state in memory; only the active tab's view is fully built; others can be lazy-loaded when selected.

**Multiple windows:** Depending on the framework, either (a) the app supports multiple top-level windows (each with its own tab set), or (b) multiple instances of the app run and share state via a file or redb. Drag-between-windows (e.g. move a tab from one window to another) is optional and platform-dependent.

### 19.23 Virtualized Conversation or Log List

**Mechanism:** For any list that can be very long (e.g. 10k+ messages, iterations, or log lines), use **virtualized rendering**: only create widgets (or DOM nodes) for the **visible range** plus a small **overscan** (e.g. 5-10 items above and below). The scroll position (and container height) determines which slice of the list is "visible." When the user scrolls, recompute the slice and re-render only that slice. Total list length is known (from data); the scrollable area uses a **placeholder** height (e.g. item_count * estimated_item_height) so the scrollbar is correct. This keeps the number of live widgets bounded and avoids lag and high memory use.

### 19.25 Summary Table

| Feature | Mechanism |
|--------|-----------|
| **CLI integration** (§19.1) | **Alternative (not ours):** Middle server spawns CLI; forwards via WebSocket. **Our implementation:** Single Rust process spawns CLI, reads stdout (optionally stream-json), bounded buffer; no middle server. See §19.1 and §17.5. |
| **Session usage** (§19.2) | Parse `usage` events from stream-json; accumulate tokens; emit to UI (and optionally mid-stream). |
| **5h/7d limits** (§19.2) | Periodic `claude --account` (or equivalent) and parse stdout; or Admin API when org key is set. |
| **Compaction** (§19.4) | App monitors usage % from stream; at threshold, sends compact prompt to CLI, then replaces history with summary. |
| **Orchestration** (§19.5) | `--append-system-prompt` (or file) on spawn with fixed "understand → decompose → act → verify" text. |
| **Stream format** (§19.3) | Newline-delimited JSON with `type` and type-specific fields; same schema for all providers via shim. |
| **Hooks / FileSafe** (§19.6) | Event enum; run scripts with JSON in/out and timeout; dangerous-command blocking via FileSafe blocklist. |
| **One-click install** (§19.7) | Catalog + install routine that copies files and refreshes registries; no code required from user. |
| **Background agents** (§19.8) | Queue manager with fixed concurrency required; git branch per run required (stash, create branch, run CLI, diff/merge); output dir per run required; conflict detection must use dry-run merge. |
| **Crash recovery** (§19.9) | Timer writes snapshot (state struct) to disk; on startup check for recent snapshot and offer restore; optional panic hook; cleanup old snapshots. |
| **Plugins / skills** (§19.10) | Scan plugin dir, parse manifests, build registries (command, agent, hook, skill); resolve at runtime; commands/agents = markdown, hooks = scripts, skills = JSON. |
| **Analytics** (§19.11) | Data from redb rollups or scan of run/evidence metadata; aggregate by project, model, date; query on view open or filter change; export = serialize to CSV/JSON. |
| **Restore points / rollback** (§19.12) | Snapshot after each turn (file list + content before/after); store metadata and indexes in redb with blob refs for snapshot content; emit restore-point lifecycle events to seglog; rollback = restore files + truncate state; conflict check via mtime/hash; branching = copy state to new session id. |
| **Command palette** (§19.13) | Shortcut registry (key → action); Ctrl/Cmd+P opens modal with full action list; filter by typed string; execute selected action; shortcuts help from same registry. |
| **Stream event viz / thinking** (§19.14) | Map stream event types to icons; show last N events in strip; thinking = buffer `thinking_delta`, display in pane with length limit; toggle to show/hide thinking. |
| **Bounded buffers** (§19.15) | All stdout/stream consumers use fixed-capacity buffer (ring buffer or capped deque); drop oldest when full; CLI always in child process. |
| **Database** (§19.16) | **redb**; migrations; tables for runs, restore_points, usage_snapshots; optional "lite" mode without redb. |
| **In-app instructions editor** (§19.17) | Read project instructions file from project path; text area + optional markdown preview; save writes back to same path. |
| **@ mentions** (§19.18) | On `@` open dropdown; data = recent/modified files or folder list; on select insert path; when building prompt expand @path to file content or include directive. |
| **Stream timers** (§19.19) | On segment start (by event type) start timer; on end record duration; ring buffer of last N segments; UI shows current + last. |
| **MCP** (§19.20) | Config list of servers (name, command, args, env); at spawn merge into platform's expected flag/config; app is config layer only. |
| **Project browser** (§19.21) | List projects from redb or scan; filter/search; per-project git status; click to set project or open session. |
| **Multi-tab / multi-window** (§19.22) | Tab = view id + context; switch loads view; persist tab list; multi-window = multiple app windows or instances sharing state. |
| **Virtualization** (§19.23) | List renders only visible range + overscan; scroll position drives slice; placeholder height for scrollbar; bounded widget count. |

---

