# Section 15 Promoted Features Spec

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

## 0. Scope and SSOT status

This document is the canonical owner for the promoted Section 15 feature set. It converts the former idea/backlog material into implementation-ready product and system requirements.

This document is authoritative for:
- shell ownership and surface placement
- cross-feature command families
- persistence and restore boundaries for the promoted features
- requested vs effective runtime state presentation where the promoted features depend on it
- defaults, failure behavior, fallback behavior, and cross-feature interaction rules

This document is not the storage, command, permission, or widget SSOT. Those remain owned by their canonical subsystem plans and are reconciled to the requirements here.

## 1. Canonical shell and surface model

### 1.1 Shell ownership

The application shell is workspace-tab based.

Rules:
- a workspace tab is the primary user-visible working context
- each workspace tab has exactly one active project at a time
- instant project switch changes the active project for the active workspace tab by default
- a separate command opens a project in a new workspace tab instead of replacing the current tab context
- detached windows are secondary shells tied to a parent workspace tab or to a detached-surface record; they are not a replacement for workspace tabs
- the title bar does not own primary project switching
- the shell must expose background activity and blocked state without requiring the user to switch away from the active workspace tab

### 1.2 Persistent shell surfaces

Primary in-window surfaces:
- activity/navigation rail
- project/session browser surface
- assistant/chat surface with persistent thread navigation
- file/editor surface
- editor-tab browser surface for canonical in-shell `workspace_preview` sessions
- bottom-panel runtime surfaces: terminal, problems, output, debug console, ports, and optional browser-adjacent activity/evidence panes that do not own the canonical browsing session
- attention center / action-needed surface for background or blocked items

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

Secondary surfaces:
- `detached_preview` window
- detached browser window
- detached DevTools window
- detached terminal window
- detached compare/review window when explicitly invoked

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- browser browsing and HTML preview are editor/workspace-tab-first rather than bottom-panel-first
- the bottom panel may expose console/network summaries, downloads, evidence activity, or DevTools-adjacent panes for the focused browser session, but it is not the primary browser host
- detached windows are first-class shell surfaces, not degraded workarounds
- no feature may depend on a floating transient overlay as its only canonical navigation model when the same information participates in persistence, restore, or multi-tab/window behavior

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### 1.3 Browser surface classes


#### 1.3A Research session alignment

`research_session` is a restricted `automation_session`: it reuses the same browser/runtime infrastructure but exposes a smaller action set, tighter lifecycle, and explicit escalation rules.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

#### Action tiers

**Tier 1 — always allowed**
`navigate`, `back`, `reload`, `snapshot`, `screenshot`, `console`, `network`

**Tier 2 — session granted**
`click`, `scroll`, `type`, `press_key`, `wait_for`, `set_viewport`

**Tier 3 — ask/deny**
`fill_form`, `select_option`

Excluded categories remain explicit: tab management, hover/drag, file upload, dialog handling, verify actions, trace/video capture, storage/cookie mutation, network simulation, and locator-generation/testing tooling.

Lifecycle rules:
- creation is implicit when `webfetch` or `webextract` uses `actions`, or when autonomous `webresearch` needs browser fallback
- the session is transient and tears down after the tool invocation completes
- no user takeover or promotion-to-browsing flow exists inside `research_session`
- escalation to full `automation_session` requires explicit confirmation and is disclosed in activity transparency
- telemetry may use the distinct session class value `research_session` even though infrastructure is shared with `automation_session`
### 1.4 Thread and session navigation

Thread/session navigation is persistent, not overlay-first.

Rules:
- chat thread navigation lives in a persistent sidebar or equivalent persistent shell region
- the thread/session browser can expose project-level and session-level navigation, but it does not replace the chat thread list for active-thread navigation
- background blocked/running state must appear in badges and attention surfaces, not only inside the currently open thread
- restore-and-branch creates a visible alternate thread/session lineage with stable labels and origin metadata

### 1.5 Thread usage surface

#### 1.5.1 Assistant worktree integration

Threads can optionally be bound to git worktrees, enabling isolated branch-per-thread workflows. This is an MVP feature gated behind a per-project setting.

**Surface points:**
- Chat header worktree button (visible when project is a git repo)
- Thread selector worktree icon (shows branch glyph when thread has worktree)
- Source Control Worktrees accordion section (unified inventory of all worktrees)
- File manager breadcrumb worktree toggle
- Settings > Branching > Assistant Worktrees (10 configuration keys)
- Merge-back dialog (squash/merge/rebase, PR, export)
- Pre-merge test gate (auto-detect or configured command)

**Primary spec:** `Plans/assistant-chat-design.md` §Worktrees in Assistant

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Per-thread context detail uses one compact inspect/action entrypoint plus one canonical detailed surface.

Rules:
- the chat header context indicator is always visible for the active thread
- hover shows summary information for `Usage`, `Tokens`, and estimated `Cost`, plus `More Details`
- click reveals `Compact Now` rather than immediately navigating away
- `More Details` opens or focuses the thread-scoped Context Detail Pane in an editor tab
- a detached usage pop-out is not the canonical model
- app-wide Usage and the Context Detail Pane remain linked by shared usage identity and filters

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md
### 1.6 Dev-loop and terminal surface model
The dev loop is shell-first and session-oriented. Terminal is the canonical interactive shell surface, and chat, output, problems, debug console, ports, and dev controls consume terminal or dev-session state instead of owning PTY state themselves.

Rules:
- Puppet Master supports up to two terminal sections/components.
- A terminal section may be docked in the main shell or detached into its own window.
- Each terminal section owns an ordered tab strip.
- Each terminal tab owns from one to four panes.
- Pane layout supports row and column splits, and removing a pane rebalances the remaining panes deterministically.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### Terminal section, tab, pane, and session model
- `terminal_section_id` owns presentation continuity, dock/detach state, and section-level visibility.
- `terminal_tab_id` owns tab title, pin state, order, section membership, and selected-pane state.
- `terminal_pane_id` owns split-tree slot identity and visible session binding.
- `terminal_session_id` owns runtime PTY continuity.
- `dev_session_id` owns higher-level dev workflow continuity and may link terminal, output, problems, debug-console, and ports surfaces without replacing the underlying shell-session identity.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Rules:
- a pane binds to exactly one live or historical `terminal_session_id` at a time
- a tab may contain panes bound to different terminal sessions
- moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity
- a `dev_session_id` is not a shell-session alias and MUST NOT be used where exact PTY continuity is required

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

### Cross-surface ownership and reveal rules
- `Open in Terminal` and `Show Terminal` first reveal the existing session bound by `terminal_session_id`.
- If that session is hidden inside another pane, tab, or section, Puppet Master reveals and focuses the existing container before creating anything new.
- If only historical state remains, the reveal target shows historical transcript and recovery controls instead of faking a live shell.
- Explicit `New Terminal`, explicit split, and explicit restart create new runtime identity.
- Output, Problems, Debug Console, and Ports are distinct surfaces that preserve linkback to the owning terminal or dev session.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Interaction modes and selection semantics
Base interaction modes are:
- `live_input`
- `scrollback_review`

Overlay states are:
- `selection_active`
- `search_active`
- `tui_capture`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Glossary.md

Rules:
- terminal keyboard input belongs to the terminal during `live_input` and `tui_capture`
- PM-wide shortcuts require explicit scope and precedence handling; one keystroke MUST NOT trigger both a terminal action and an application action
- selection is canonical linear text selection rather than rectangular block selection
- wrapped lines copy logical text rather than viewport-row fragments
- copy works in live and review modes; paste targets only the active terminal input owner

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md

### Command-block and shell-integration rules
Command blocks are metadata layered over the canonical terminal transcript rather than separate free-floating widgets.

Shell-integration disclosure tiers are:
- `rich`
- `basic`
- `opaque`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md

Rules:
- Puppet Master MUST NOT fabricate exact command boundaries, command text, or success semantics when shell integration is weaker than the observed data supports
- one command card corresponds to one observed command invocation when command metadata is available
- transcript continuity remains canonical even when command metadata is degraded
- command-block anchoring MUST survive transcript growth, resize, and later reveal/open flows

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md

### Session lifecycle and user-visible actions
Canonical terminal session states are:
- `starting`
- `running`
- `exited`
- `failed`
- `terminated`
- `disconnected`
- `restoring`
- `attention_required`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

Action rules:
- `clear_scrollback` clears retained transcript for the current session and preserves runtime identity
- `restart_session` replaces runtime with a new `terminal_session_id` while preserving the pane or tab container chosen by the command
- `terminate_session` requests graceful shutdown
- `kill_session` forces termination
- closing a pane or tab removes presentation state; if a live session is still attached, the user gets explicit close-versus-terminate behavior instead of silent orphaning

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Empty-state and first-run rules
- a project with no terminal history shows an explicit `Start Terminal` empty state with shortcut hints
- Output, Problems, Debug Console, and Ports explain that they activate when linked terminal or dev-session data exists
- restored historical tabs and panes show explicit state banners rather than pretending they are newly launched sessions

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md
## 2. Cross-feature runtime contracts

### 2.1 Requested vs effective state
The promoted feature set depends on one requested-vs-effective state model across terminal, browser, provider, tool, and project-scoped runtime behavior.

Rules:
- requested state is what the user, Persona, project, command, or settings surface asked for
- effective state is what the runtime actually resolved and executed after permission, platform, renderer, shell-integration, health, capability, or policy evaluation
- requested vs effective differences MUST be visible when they change available actions, session routing, restore behavior, or capability disclosure

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

This rule applies to:
- Persona, platform/provider, model, and account routing
- MCP and tool availability
- browser trust and capability tiers
- terminal renderer mode, shell-integration tier, detach/windowing capability, clipboard or IME capability, accessibility support, and transcript-retention tier
- project-scoped overrides after project switch

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Additional rules:
- switching projects recalculates effective terminal, browser, tool, and provider state for the new project context
- historical runtime and shell surfaces show frozen captured effective state rather than recomputing from current settings
- requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
### 2.2 Stable identities
The promoted feature set requires first-class stable identities for:
- `project_id`
- `workspace_tab_id`
- `window_id`
- `thread_id`
- `branch_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `automation_session_id`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Identity rules:
- a path alone is not a sufficient identity for project restore semantics
- `workspace_tab_id` is distinct from `project_id` so multiple tabs may point at the same project with different local shell state
- `browser_tab_id` is distinct from `preview_session_id` so multiple browser containers can render the same preview subject without collapsing persistence
- `terminal_section_id` owns presentation continuity rather than PTY continuity
- `terminal_tab_id` and `terminal_pane_id` own workspace continuity and reveal targets inside the shell chrome
- `terminal_session_id` owns exact PTY continuity and is the canonical meaning of “same terminal session”
- `dev_session_id` owns higher-level workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Action-identity rules:
- `Open in Terminal` and `Show Terminal` target existing `terminal_session_id` bindings first
- `New Terminal`, explicit split, and explicit restart produce new runtime identity even when they reuse an existing pane or tab container
- moving, renaming, pinning, docking, or detaching sections, tabs, and panes are presentation changes only and do not mint new PTY identity

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md
### 2.3 Attention, blocked, and background indicators

The shell must expose background and blocked work consistently.

Rules:
- background activity from non-active projects or workspace tabs remains visible through badges, activity indicators, and attention-center entries
- blocked episodes never disappear into silent state changes
- if a feature opens a detached window or background session, its blocked or action-needed state still routes back to canonical shell attention surfaces

## 3. Feature requirements

### 3.1 Dangerous-Command Blocking (FileSafe)

- FileSafe blocks are first-class blocked outcomes.
- blocked commands render visible blocked UI in the thread, terminal/output surfaces, and action-needed routing
- rerun after a destructive block respects restore-before-rerun requirements when local work or safe-point rules require it
- the feature does not rely on terminal-only messaging

### 3.2 Branching Conversations (Restore Then Fork)

- branching always starts from a restore point or equivalent preserved state boundary
- branch creation produces a new thread/session identity linked to the source branch and restore point
- the source thread remains intact
- branch labels, source lineage, and branch origin time are visible in history/navigation surfaces
- branching from a dirty or active thread requires confirmation that makes the preserved source state explicit

### 3.3 In-App Project Instructions Editor

- the in-app instructions editor writes the same project-rules/instruction files the runtime consumes
- editing AGENTS-style guidance, project rules, or equivalent instruction files cannot create a shadow runtime source
- the editor must show path, scope, validation/lint feedback, and dirty state

### 3.4 `@` Mention System for File References

- `@` opens a picker rooted in the active project context
- recent files, modified files, symbol-aware results when available, and folder navigation are valid sources
- the mention result must preserve the identity needed by prompt assembly and click-to-open behavior
- the picker must work in Assistant and Interview chat surfaces

### 3.5 Stream Timers and Segment Durations

- stream timing is visible per assistant turn/segment where the event stream supports it
- timing data is tied to canonical message/run identity and can be aggregated later without recomputation from rendered text
- timer UI must remain lightweight and not cause reflow/flicker in long threads

### 3.6 Interleaved Thinking Toggle

- the toggle is thread-local unless another owner doc explicitly broadens scope
- requested state and effective provider behavior are both shown when the provider cannot honor the requested mode exactly
- the feature cannot rely on provider-specific naming leaking into canonical user copy

### 3.7 MCP Support

- MCP support is host-managed capability resolution, not config passthrough only
- server configuration, enable/disable, test connection, and runtime health are first-class UI behaviors
- effective MCP tool availability is project-, Persona-, and permission-aware
- unhealthy MCP servers never produce silent success-shaped fallback

### 3.8 Project and Session Browser

- the project/session browser is a real shell surface, not a placeholder concept
- it shows projects plus per-project sessions/runs/threads as applicable
- empty states, search/filter behavior, row actions, badges, and responsive collapse behavior are required
- it is the main browse/history surface across projects, while active-thread navigation remains available directly in chat

### 3.9 Mid-Stream Token and Context Updates
- context and usage indicators may update during streaming
- partial updates must not invent final totals before the platform reports them
- the user sees stable in-progress states such as updating or streaming rather than flickering totals
- final per-thread context and usage state lands in the same canonical Context Detail Pane used outside streaming

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### 3.10 Multi-Tab and Multi-Window

- workspace tabs are first-class and persist order, active tab, per-tab project identity, and local shell state
- windows may host one or more workspace tabs when the platform implementation supports it
- drag-between-window support is optional, but fallback behavior must be defined and deterministic
- close behavior must account for dirty editors, running dev sessions, active terminals, and detached children

### 3.11 Virtualized Conversation or Log List

- long chat and runtime lists must use virtualization without losing keyboard navigation, focus recovery, or anchor-to-message behavior
- virtualization cannot break sticky status elements, selection, or search results navigation

### 3.12 Know Where Your Tokens Go (Analytics Framing)

- app-wide Usage and the thread-scoped Context Detail Pane share one normalized usage contract
- cost_usage artifacts deep-link into canonical Usage/Ledger surfaces rather than an artifact-local model
- token and cost framing must make per-thread, per-run, and per-model attribution explainable without duplicating data sources

### 3.13 One-Click Install for Commands, Agents, Hooks, and Skills

- catalog install/update/remove flows must be lifecycle-aware for commands, skills, plugins/hooks, themes, and MCP configs
- update/remove behavior for active or referenced items is explicit: blocked, deferred-until-next-load, or allowed with immediate effect, depending on subsystem rules
- the catalog is not install-only; steady-state management is part of MVP behavior

### 3.14 Full IDE-Style Terminal and Panes
Terminal, Problems, Output, Debug Console, and Ports are canonical shell-adjacent panes. They are distinct surfaces with separate responsibilities, but they remain linked by terminal-session and dev-session identity rather than by loose textual association.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

#### Canonical pane family
- **Terminal** owns live interactive PTY state, transcript, search-in-scrollback, and command-block overlays.
- **Output** owns structured or aggregated process output views that are linked back to terminal or dev-session identity.
- **Problems** owns problem and diagnostic views linked to the same terminal or dev-session provenance when the problem source is shell-backed.
- **Debug Console** remains distinct from Terminal even when both are visible in the same runtime section.
- **Ports** owns discovered or declared service endpoints, watches, and open-port affordances linked to the owning dev session.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

#### Persistence and recovery guarantees
Terminal persistence uses three guarantee tiers:

| Tier | What belongs here | Rules |
|---|---|---|
| `guaranteed_durable` | section/tab/pane layout, titles, pin state, selected tab or pane, terminal-session and dev-session bindings, restore banners, durable settings refs | MUST restore deterministically after restart or project reopen |
| `best_effort_durable` | bounded transcript snapshots, command-block metadata, shell-integration hints, cwd snapshots, exit metadata, derived Output or Ports linkage | MAY be pruned or absent after crashes or storage pressure, but absence must be disclosed |
| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

Canonical restore outcomes are:
- `restored_live`
- `restored_exited`
- `restored_disconnected`
- `restored_without_history`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md

#### Shortcut, automation, and reveal rules
- terminal shortcuts coexist with PM-wide shortcuts through explicit scope and precedence rules
- PM-built-in agents control terminal sessions through the canonical terminal subsystem rather than through a parallel hidden shell model
- chat command cards, output rows, problem rows, and ports rows use exact session or dev-session linkback where available
- `Open in Terminal` is idempotent same-session reveal, not shorthand for `New Terminal`
- `Show Terminal` reveals the existing section, tab, and pane that already own the referenced session before considering creation of a new container

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md

#### Cross-platform capability matrix
One product model applies across macOS, Linux, and Windows, with explicit degradation disclosure when capabilities differ.

| Capability area | Required behavior | Degradation rule |
|---|---|---|
| PTY host and process supervision | spawn, resize, signal, exit, cwd tracking, environment handoff, and detached-session recovery semantics | unavailable or degraded PTY control MUST be surfaced as effective capability loss, not hidden fallback |
| Shell integration metadata | command boundaries, cwd updates, prompt markers, exit codes, and command duration where the shell supports them | weak integration MUST degrade to lower-confidence command metadata without fabricated exactness |
| Docking and detached windows | docked section plus detached terminal window behavior | unsupported detach paths MUST be disclosed as platform constraints |
| Clipboard, IME, accessibility | copy, paste, selection, IME composition, focus, and assistive-technology announcements | unsupported or partial behavior MUST be explicitly disclosed in effective capability state |
| Remote and multi-context launches | local shells plus context-aware launch for SSH, WSL, containers, or similar transports where supported | unsupported contexts MUST fail deterministically rather than silently retargeting to the wrong runtime |
| Renderer mode | `interactive_rich`, `plain_log`, `machine_export`, `degraded_ascii` | effective renderer mode MUST be disclosed whenever it differs from the requested preference |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

#### Subsystem architecture and non-ship rules
The terminal implementation is split into explicit subsystem contracts:
- process host and PTY supervision
- terminal engine and transcript buffer
- renderer
- shell-integration metadata extractor
- workspace chrome and cross-surface UI

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

Rules:
- subsystem boundaries and ownership MUST be explicit
- acceptance gates MUST exist for process-host correctness, renderer stability, transcript integrity, shell-integration degradation, and cross-surface reveal behavior
- GPU acceleration may improve rendering, but it does not excuse a bad terminal model or transcript architecture
- a DOM-style “one widget per line forever” terminal core is non-ship for this product model
- observability MUST exist for lifecycle transitions, resize, focus, attach or detach, renderer failures, PTY failures, performance counters, and structured session metadata

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

#### Acceptance criteria
- two terminal sections, multi-tab behavior, and one-to-four pane tabs behave deterministically across docked and detached presentation
- same-session reveal never spawns a duplicate shell when the referenced `terminal_session_id` still exists
- restarting a session mints a new `terminal_session_id`; clearing scrollback does not
- restored historical sessions never fake live PTY continuity
- terminal, output, problems, debug console, and ports preserve linkback to the owning terminal or dev session
- huge-output, search, and scrollback paths remain responsive under bounded-render and bounded-memory rules

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md
### 3.15 Hot Reload, Live Reload, and Fast Iteration

- dev sessions are stack-aware and distinguish hot reload from live reload when the stack supports both
- fallback to live reload is explicit in UI copy and state
- one-click launch, status, logs, errors, and termination rules are required
- project switch and app shutdown use explicit termination/cleanup rules

### 3.16 Sound Effects Settings

- sound effects are grouped as settings, not per-view ad hoc toggles
- sound notifications follow action-needed / completion semantics and respect do-not-disturb or muted-state policy from the shell

### 3.17 Instant Project Switch

- default switch target is the active workspace tab only
- an alternate command opens the target project in a new workspace tab
- switching recalculates project-scoped config, sessions, terminal cwd, browser preview state, and effective tool/MCP/persona state
- background activity from the old project remains visible through badges/attention surfaces
- missing-path, duplicate-path, and in-flight-run behavior are deterministic and user-visible

### 3.18 Built-in Browser and Click-to-Context

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract

Core rules:
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only.
- Reading Site remains reserved for the PM-native Site Reader path.
- provider-routed fetch must not reuse the reserved native Site Reader identity.

Fields:
- value?: string
- description?: string
- timeout_ms
- type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network"

Labels and values:
- Reading Site

Rules:
- invalid_input
- 5 MB default
- timeout_ms defaults to 5000ms; max 30000ms; total across all actions capped at 30s
- Unknown `type` values → `invalid_input` error
- Actions are executed sequentially in array order
- reject non-HTTP(S) schemes
- default to `https://` if bare domain
- reject malformed URLs
## 4. Command families required by the promoted features
The UI command catalog must expose stable commands for:
- project switch and project open-in-new-workspace-tab
- workspace tab create, close, reopen, move, and focus
- detached window open, reattach, and close for supported surfaces
- thread context detail open, focus, close, and context-compaction actions
- branch-from-restore and branch-open actions
- browser open, focus, detach, open-DevTools, toggle-DevTools-dock, share, revoke-share, capture, takeover, promotion, and recovery actions
- terminal show, focus, new-tab, split-pane, move-to-section, rename, pin, close-pane, close-tab, clear-scrollback, restart-session, terminate-session, kill-session, detach-section, and reattach-section actions
- dev-session start, stop, restart, show-output, show-problems, and show-ports actions
- catalog install, update, remove, enable, disable, and apply-later actions

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md

Rules:
- `Open in Terminal` and `Show Terminal` normalize to the terminal command family rather than inventing chat-local commands
- terminal layout changes and terminal runtime actions are separate command categories even when they share one visual toolbar
- cross-surface reveal commands target canonical identities such as `terminal_session_id` and `dev_session_id` rather than freeform labels

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md
## 5. Persistence and restore rules
- project restore uses stable `project_id`, not raw path alone
- workspace tabs restore independently
- detached windows restore only when their surface class and platform support allow it
- in-shell normal browser tabs restore by project and workspace tab and preserve profile scope
- detached normal browsing restores with the originating normal browsing session when supported
- auth sessions and automation sessions do not silently resume active work after restart
- terminal sessions and dev sessions have explicit restore eligibility; a running process is never assumed alive after restart without verification

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Terminal persistence guarantees:
- section, tab, pane, selection-of-active-pane, labels, pin state, dock/detach placement, and linked dev-session references are `guaranteed_durable`
- bounded transcript snapshots, command-block metadata, cwd snapshots, shell-integration hints, and derived Output or Ports linkage are `best_effort_durable`
- live PTY continuity, unlimited scrollback, active TUI alternate-screen content, live selections, and in-flight search highlights are `transient_only`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md

Canonical restore outcomes are:
- `restored_live`
- `restored_exited`
- `restored_disconnected`
- `restored_without_history`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Additional rules:
- promotion from paused automation into normal browsing changes future restore behavior because the session is no longer treated as automation
- browser requested/effective runtime and capability state is stored as frozen runtime history rather than recomputed heuristically from current settings
- crash recovery preserves recoverable metadata and completed evidence artifacts when possible
- terminal restart or replacement creates a new `terminal_session_id`; restoring a historical pane never synthesizes that new identity automatically
- no browser or terminal session class may silently bleed storage into another profile scope

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md
## 6. Non-goals and anti-drift rules

The following are explicitly non-canonical after promotion:
- title-bar project bar as the primary project-switch shell
- floating thread-selector overlay as the canonical thread navigation model
- detached usage pop-out as the canonical per-thread usage surface
- one broad browser-instance model with LRU reuse as the core browser contract
- the bottom panel as the primary browser host
- silent automatic context injection from ordinary browser clicks or text selection
- silent storage bleed between browser session classes or profile scopes
- raw CDP or arbitrary browser code execution as the guaranteed core browser contract
- generic watch mode as the primary dev-loop model
- MCP as config-and-passthrough only
- app-level-only tool permission scope as sufficient for the promoted project-switch/MCP/browser model

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md
