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

The browser model is split into four session classes.

| Session class | Canonical purpose | Canonical entry points | Profile scope | Restore policy |
|---|---|---|---|---|
| `workspace_preview` | project-linked in-shell browser tab for local HTML preview and trusted normal browsing | `Open in Browser`, browser-tab focus/open flows | project-scoped persistent browser profile | restore by project and workspace tab |
| `detached_preview` | detached browser/preview window linked to the same logical browser subject as normal browsing | `Open in Detached Browser`, explicit detach from normal browsing | shares originating normal-browsing state unless the user explicitly creates a separate detached profile | restore with the originating normal browsing session when supported |
| `automation_session` | watchable agent-driven browser session for testing, verification, debugging, and other live automation | agent/tool-launched visible browser runs, browser testing flows | separate ephemeral profile by default | never silently resumes active work; if reopened after restart or crash it returns as stopped / attention-required |
| `auth_session` | PM-owned provider/auth/device/login browser flow | provider sign-in and auth/device flows | separate isolated auth profile/store | never auto-restores as a normal browser tab and never auto-completes |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Rules:
- browser tab capacity applies only to in-shell `workspace_preview` tabs
- detached preview windows are outside the in-shell browser-tab cap
- `automation_session` and `auth_session` are not counted as in-shell browser tabs and are never silently promoted into them
- `detached_preview` shares the originating normal browsing state unless the user explicitly requests separate detached state
- no browser session class may silently bleed storage, cookies, local storage, or session storage into another profile scope
- `auth_session` is for PM-owned auth/provider flows, must not auto-close on presumed success, must not auto-complete, and does not impose extra select/copy/paste restrictions

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md

Takeover and promotion rules:
- direct user interaction with an `automation_session` presents `Take over and pause agent`, `Let agent continue`, and `Stop agent and keep browser`
- the default takeover path is `Take over and pause agent`
- a paused automation browser remains `automation_session`
- only `Promote to Normal Browsing` reclassifies a session into normal browsing and copies/promotes eligible state into a normal browser profile

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Every browser session must persist and disclose:
- `session_class`
- `requested_browser_runtime`
- `effective_browser_runtime`
- `requested_capabilities`
- `effective_capabilities`
- `capability_degradations`
- `blocked_actions`
- `permission_tier`
- `profile_scope`
- `restore_policy`
- `takeover_state`

Each degraded or blocked browser capability uses explicit reasons such as:
- `platform_unsupported`
- `runtime_unavailable`
- `permission_not_granted`
- `session_class_restricted`
- `temporarily_unavailable_after_recovery`

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

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

The built-in browser is a real PM-controlled browser surface. It is separate from `web_search`, `web_fetch`, and Site Reader / Reading Site behavior, and it supports direct user browsing, watchable live automation, screenshots, structured snapshots, DevTools, PM-owned auth/device flows, and deterministic capture into chat.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

#### Canonical browser runtime and host model

- the canonical browser runtime is CEF-class embedded Chromium
- Puppet Master ships a PM-managed pinned bundled runtime and updates it atomically as a matched set
- lower-level bindings plus a PM-owned shim/bridge are preferred over making an experimental wrapper the architectural linchpin
- native child-window embedding is the baseline host path
- offscreen rendering is secondary and not the primary browser-host contract
- runtime damage, version mismatch, or absence surfaces as `runtime_unavailable`
- the UI must not silently fall through to an unrelated legacy system-webview browser model

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

#### Entry points and normal browsing behavior

- `Open` keeps HTML in source/editor mode
- `Open in Browser` opens the subject in a `workspace_preview`
- `Open in Detached Browser` opens the subject in a `detached_preview`
- split browser layout is a second-step layout action after opening, not a separate first-class open command
- the editor/workspace tab surface is the canonical in-shell browser host
- the bottom panel may expose browser-adjacent activity, evidence, or DevTools-linked panes, but it is not the primary browser host

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

#### Capture to chat and evidence behavior

Capture into chat remains explicit and user-triggered for ordinary browsing.

Required ordinary capture rules:
- text selection uses `browser_selection_context`
- element pick uses `browser_element_context`
- native document selection continues to use `document_selection_context`
- explicit capture creates removable composer chips and MUST NOT silently send a hidden message
- if there is no writable active composer or thread, PM opens a new thread and records requested versus effective target
- ordinary browsing clicks MUST NOT unexpectedly create or send chat context

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Accepted explicit browser capture actions and labels remain:
- `Add Selection to Chat`
- `Add Selection + Screenshot`
- `Add Selection + Full Screenshot`
- `Pick Element for Chat`
- `Pick Element + Screenshot`
- `Pick Element + Full Screenshot`
- `Add Screenshot to Chat`
- `Add Full Screenshot to Chat`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Debug-investigation auto-ingestion is a separate visible contract.

Rules for active investigations:
- when a browser session is bound to an active investigation, bounded evidence may be added automatically to the visible Investigation Context
- investigation auto-ingestion must create visible context items with provenance, timestamp, redaction/truncation state, and revoke controls
- investigation auto-ingestion does not create hidden user messages, hidden composer chips, or invisible prompt-only payloads
- the default combined manual capture remains context plus clipped screenshot; full-page combined capture remains explicit even during Debug Mode

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md

#### DevTools and watchable automation

- docked DevTools is the default mode and lives inside the currently focused browser session surface
- there is only one focused-browser docked DevTools instance at a time
- detached DevTools is an alternate layout, not a more powerful capability tier
- PM chrome exposes DevTools entry and bridge actions only; deep inspection tools live inside DevTools itself
- users must be able to watch live automation browse and test in a visible `automation_session`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/newtools.md

#### Named browser action contract

Strong named actions are the guaranteed browser contract.

Guaranteed everyday actions:
- `navigate`
- `back`
- `reload`
- `open_tab`
- `select_tab`
- `close_tab`
- `click`
- `type`
- `fill_form`
- `select_option`
- `hover`
- `drag`
- `press_key`
- `upload_file`
- `handle_dialog`
- `wait_for`
- `verify_text`
- `verify_element`
- `verify_value`
- `snapshot`
- `screenshot`
- `console`
- `network`
- `set_viewport`

Advanced debug/testing actions:
- `trace_start`
- `trace_stop`
- `video_start`
- `video_stop`
- `export_pdf`
- `storage_import`
- `storage_export`
- `cookie_*`
- `local_storage_*`
- `session_storage_*`
- `network_offline`
- `network_online`
- `route_mock`
- `generate_locator`

Raw CDP or arbitrary browser-code execution may exist as implementation detail or escape hatch, but it is not the guaranteed core browser contract and must not be reopened as the primary product model.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/newtools.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### Browser action table

| action_id | bucket | tier | permission_layer | allowed_session_classes | requested_capabilities | artifacts_emitted | degradation_or_blocking_behavior | user_visible_entry_points |
|---|---|---|---|---|---|---|---|---|
| `navigate` | Navigation/tabs | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `navigation` | none | block when runtime is unavailable or session is recovering | browser chrome, agent tool invocation |
| `back` | Navigation/tabs | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `navigation_history` | none | block when no history entry exists | browser chrome, agent tool invocation |
| `reload` | Navigation/tabs | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `reload` | none | block when runtime is unavailable or session is recovering | browser chrome, hot-reload UI, agent tool invocation |
| `open_tab` | Navigation/tabs | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `tab_management` | none | block when session class or tab-cap policy rejects the request | browser chrome, command palette, agent tool invocation |
| `select_tab` | Navigation/tabs | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `tab_management` | none | block when the target tab is unavailable or session is recovering | browser chrome, command palette, agent tool invocation |
| `close_tab` | Navigation/tabs | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `tab_management` | none | block when closing would strand a protected flow or when the tab no longer exists | browser chrome, command palette, agent tool invocation |
| `click` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `interaction` | none | block when permission is not granted or the session is paused after recovery | agent tool invocation, explicit browser takeover choice |
| `type` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `interaction`, `text_input` | none | block when permission is not granted | agent tool invocation |
| `fill_form` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `interaction`, `form_fill` | none | block when permission is not granted | agent tool invocation |
| `select_option` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `interaction`, `form_fill` | none | block when permission is not granted or the control is unavailable | agent tool invocation |
| `hover` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `interaction` | none | block when permission is not granted | agent tool invocation |
| `drag` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `interaction` | none | block when permission is not granted | agent tool invocation |
| `press_key` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `interaction`, `keyboard_input` | none | block when permission is not granted | agent tool invocation |
| `upload_file` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `upload` | optional runtime receipt | block when upload permission or file/path policy denies access | agent tool invocation |
| `handle_dialog` | Interaction | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `dialog_control` | optional dialog evidence | block when dialog state is absent or permission is not granted | browser chrome, agent tool invocation |
| `wait_for` | Wait/assert | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `wait` | optional trace marker | degrade with timeout or recovery pause details | agent tool invocation |
| `verify_text` | Wait/assert | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `assertion` | optional verification receipt | block or fail on timeout / missing permission | agent tool invocation |
| `verify_element` | Wait/assert | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `assertion` | optional verification receipt | block or fail on timeout / missing permission | agent tool invocation |
| `verify_value` | Wait/assert | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `assertion` | optional verification receipt | block or fail on timeout / missing permission | agent tool invocation |
| `snapshot` | Debug/evidence | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `snapshot_read` | structured page snapshot | degrade when runtime snapshot support is temporarily unavailable | browser chrome, agent tool invocation |
| `screenshot` | Debug/evidence | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `screenshot_capture` | screenshot artifact | degrade when runtime capture support is temporarily unavailable | browser chrome, capture actions, agent tool invocation |
| `console` | Debug/evidence | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `console_read` | console evidence | degrade when console stream is unavailable after recovery | browser chrome, DevTools bridge, agent tool invocation |
| `network` | Debug/evidence | guaranteed_everyday | always_allowed | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `network_read` | network evidence | degrade when network stream is unavailable after recovery | browser chrome, DevTools bridge, agent tool invocation |
| `set_viewport` | Environment | guaranteed_everyday | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `viewport_control` | optional screenshot evidence | block when permission is not granted | browser chrome, agent tool invocation |
| `trace_start` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `trace_control` | trace artifact | block when trace capture support is unavailable or permission is not granted | browser chrome, agent tool invocation |
| `trace_stop` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `trace_control` | trace artifact | block when no trace is active | browser chrome, agent tool invocation |
| `video_start` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `video_capture` | video artifact | block when recording support is unavailable or permission is not granted | browser chrome, agent tool invocation |
| `video_stop` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `video_capture` | video artifact | block when no recording is active | browser chrome, agent tool invocation |
| `export_pdf` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `pdf_export` | PDF artifact | block when export is unavailable | browser chrome, agent tool invocation |
| `storage_import` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `storage_import` | import receipt, optional trace | block until explicit confirmation is granted | agent tool invocation, browser settings flows |
| `storage_export` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `storage_export` | export artifact | block until explicit confirmation is granted | agent tool invocation, browser settings flows |
| `cookie_*` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `cookie_mutation` | optional receipt/trace | block until explicit confirmation is granted | agent tool invocation |
| `local_storage_*` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `local_storage_mutation` | optional receipt/trace | block until explicit confirmation is granted | agent tool invocation |
| `session_storage_*` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session`, `auth_session` | `session_storage_mutation` | optional receipt/trace | block until explicit confirmation is granted | agent tool invocation |
| `network_offline` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session` | `network_mode_control` | optional trace/evidence | block until explicit confirmation is granted | agent tool invocation |
| `network_online` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session` | `network_mode_control` | optional trace/evidence | block until explicit confirmation is granted | agent tool invocation |
| `route_mock` | Environment | advanced | explicit_confirmation | `workspace_preview`, `detached_preview`, `automation_session` | `network_mocking` | optional trace/evidence | block until explicit confirmation is granted | agent tool invocation |
| `generate_locator` | Debug/evidence | advanced | session_granted | `workspace_preview`, `detached_preview`, `automation_session` | `locator_generation` | locator receipt | block when DOM inspection is unavailable | DevTools bridge, agent tool invocation |

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md

#### Scenario and acceptance matrix

| scenario_id | session_class | preconditions | user_or_agent_action | expected_visible_behavior | expected_artifacts_or_context | recovery_expectation | platform_notes |
|---|---|---|---|---|---|---|---|
| `html_open_workspace` | `workspace_preview` | local HTML file exists in the workspace and the browser runtime is healthy | user chooses `Open in Browser` | HTML opens in an editor/workspace browser tab and remains linked to the project/workspace tab | browser session state only | normal browser session restores on restart | same PM browser model on Windows, macOS, and Linux |
| `html_open_detached` | `detached_preview` | local HTML file exists and the user requests a detached view | user chooses `Open in Detached Browser` | detached browser window opens while keeping the link to the originating subject | detached browser session state only | detached normal session may restore when platform support allows | detached is first-class, not a degraded fallback wording |
| `normal_browsing_workspace` | `workspace_preview` | user is already in a normal browser tab | user navigates, opens tabs, captures screenshots, or opens DevTools | normal browsing remains in the editor/workspace tab browser surface | snapshots, screenshots, console/network evidence as requested | normal browser session restores | platform-specific embedding details do not change the PM browser model |
| `watchable_automation_run` | `automation_session` | automation action is launched and the browser runtime is healthy | agent drives the browser through named actions | user can watch live browsing/testing in a visible PM browser surface | optional snapshots, screenshots, traces, videos | no silent auto-resume; reopened run is stopped / attention-required | browser runtime health is surfaced consistently across platforms |
| `automation_takeover_pause` | `automation_session` | live automation browser is visible | user interacts and chooses `Take over and pause agent` | the browser remains visible and becomes paused/manual without reclassification | optional paused-state audit record | paused session can later resume or be promoted; it is never stranded | same takeover model across platforms |
| `automation_stop_keep_browser` | `automation_session` | live automation browser is visible | user chooses `Stop agent and keep browser` | automation work stops while the browser remains open | stop receipt and any completed evidence remain available | stopped browser may later be promoted or closed normally | same takeover model across platforms |
| `automation_promote` | `automation_session` | paused/manual automation browser exists | user chooses `Promote to Normal Browsing` | visible browser converts into normal browsing with promoted state | state-promotion receipt and any already completed evidence | promoted session restores as normal browsing, not as automation | promotion requires explicit confirmation |
| `auth_flow_browser` | `auth_session` | PM-owned provider/auth/device flow requires browser interaction | user or PM opens auth browser session | auth browser stays open until explicitly completed or closed | optional auth-flow receipt, optional screenshots | auth session never auto-closes or silently restores as normal browsing | same isolated-session semantics across platforms |
| `capture_existing_thread` | `workspace_preview` | active writable thread/composer exists | user chooses any capture-to-chat action | removable chip is added to the active composer and nothing is auto-sent | `browser_selection_context`, `browser_element_context`, and/or screenshot artifact | blocked/expired chips restore visibly instead of being dropped | same UX regardless of platform |
| `capture_new_thread` | `workspace_preview` | no writable active thread/composer exists | user chooses any capture-to-chat action | PM opens a new thread and places the chips there | requested/effective target metadata plus capture chips and optional screenshot artifact | blocked/expired chips restore visibly instead of being dropped | same UX regardless of platform |
| `browser_evidence_capture` | any browser session class | runtime is healthy and evidence action is allowed | user or agent captures screenshot, trace, or video | capture completes without changing the browser session class | runtime artifact records for screenshot/trace/video/recording | completed artifacts survive crash/recovery when possible | capture scope must behave the same across desktop platforms |
| `browser_crash_recovery` | any browser session class | browser runtime or subprocess crashes | user chooses `Reopen`, `Retry`, or `Keep Closed` | PM shows recoverable state instead of silently losing the browser | preserved metadata and any completed artifacts | no silent resumption of live automation/auth work | `runtime_unavailable` copy is platform-aware but product-consistent |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### Permission, recovery, and promotion rules

- always-allowed browser capabilities cover navigation/readback operations, snapshots, screenshots, console/network read, explicit DevTools open, and explicit share/capture actions
- session-granted browser capabilities cover click/type/fill/tab-management/upload/dialog/viewport changes and trace/video control
- high-risk explicit-confirmation capabilities cover auth-flow mutation, storage import/export, cookie/storage mutation, offline/mock routing, download execution, and promotion of automation state into normal browsing
- normal browser sessions restore by project/workspace identity
- live automation and auth sessions never silently resume active work after restart
- browser or subprocess crash preserves recoverable metadata and offers `Reopen`, `Retry`, and `Keep Closed`
- completed screenshots, traces, and videos are preserved when possible

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### Debug investigation browser automation rules

Active Debug investigations may bind a browser target and drive it through the canonical browser session model.

Required rules:
- browser-led reproduction and evidence capture run in a visible `automation_session` when PM is driving the browser
- manual takeover is a pause/resume handoff, not simultaneous mixed human-and-agent control of the same active automation step
- auth handoff continues to use isolated `auth_session` behavior and must not silently promote credentials or state into normal browsing
- completed traces, recordings, screenshots, console summaries, and network summaries route into Runtime Artifacts and visible Investigation Context summaries
- browser-target debugging for remote-mode projects is limited to PM-managed project targets such as forwarded URLs or project-owned web entrypoints; arbitrary remote attach remains out of scope for MVP

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/GitHub_Integration.md

#### Debug investigation browser scenario matrix

| scenario_id | preconditions | action | expected visible behavior | expected persistence |
|---|---|---|---|---|
| `debug_browser_auto_ingest_visible` | active investigation bound to a browser target | agent captures screenshot / console / network evidence | evidence appears as visible Investigation Context items and linked artifacts | `debug.investigation.context_item_added`, `runtime_artifact.*`, and any related `browser.context_captured` or browser-session refs |
| `debug_browser_takeover_pause_resume` | visible automation session exists | user takes over or later resumes | browser remains visible, automation is paused/resumed without silent session reclassification | takeover state changes persist on the owning browser session and investigation |
| `debug_browser_auth_handoff` | auth step is required mid-investigation | PM opens isolated auth session | auth work is isolated and explicit; normal browsing state is not silently mutated | auth session and investigation linkage persist with explicit scope and cleanup state |
| `debug_browser_remote_project_target` | remote-mode project exposes a PM-managed URL or forwarded port | agent debugs browser target | UI stays bound to remote project authority; no silent local fallback or ad-hoc remote attach language | investigation and browser evidence retain remote project and browser identity refs |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

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
