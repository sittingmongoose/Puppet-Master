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
- bottom-panel runtime surfaces: terminal, problems, output, debug console, ports, browser preview when embedded
- attention center / action-needed surface for background or blocked items

Secondary surfaces:
- detached preview window
- detached browser window
- detached terminal window
- detached compare/review window when explicitly invoked

No feature may depend on a floating transient overlay as its only canonical navigation model when the same information participates in persistence, restore, or multi-tab/window behavior.

### 1.3 Browser surface classes

The browser model is split into four classes:
- `workspace_preview`: project-linked in-shell preview/browser tab for previewing local HTML or trusted workspace browsing flows
- `detached_preview`: a user-visible detached browser/preview window linked to the originating workspace tab and project
- `automation_session`: an ephemeral non-primary browser session used by automation or tooling; it does not become a persistent shell tab automatically
- `auth_session`: an ephemeral browser session used for auth/device/browser flows; it is never restored as a workspace browser tab automatically

Rules:
- browser tab capacity applies to in-shell browser tabs only
- detached preview windows are outside the in-shell browser-tab cap
- automation and auth sessions are not counted as in-shell browser tabs and are not silently promoted into them
- preview/browser state is scoped by project and workspace tab unless the session class above explicitly says otherwise

### 1.4 Thread and session navigation

Thread/session navigation is persistent, not overlay-first.

Rules:
- chat thread navigation lives in a persistent sidebar or equivalent persistent shell region
- the thread/session browser can expose project-level and session-level navigation, but it does not replace the chat thread list for active-thread navigation
- background blocked/running state must appear in badges and attention surfaces, not only inside the currently open thread
- restore-and-branch creates a visible alternate thread/session lineage with stable labels and origin metadata

### 1.5 Thread usage surface

Per-thread usage uses one canonical detail surface.

Rules:
- the chat header context indicator is always visible for the active thread
- hover shows summary information
- activation opens the thread Usage surface owned by chat/usage integration
- a detached usage pop-out is not the canonical model
- app-wide Usage and thread Usage are linked by shared usage identity and filters

### 1.6 Dev-loop and terminal surface model

The dev loop is session-oriented.

Rules:
- a dev session represents one active dev-server/watcher/test-watch lifecycle for a workspace tab and project
- generic watch-mode wording is not sufficient
- dev-session state is summarized in shell surfaces and detailed in terminal/output/ports surfaces
- assistant-callable dev actions map to stable commands and produce visible shell state changes
- project switch or workspace-tab close must follow explicit dev-session interruption/termination rules; no orphaned background session is allowed by default

## 2. Cross-feature runtime contracts

### 2.1 Requested vs effective state

The promoted feature set depends on a single requested-vs-effective state model.

Rules:
- requested state is what the user, Persona, project, command, or settings surface asked for
- effective state is what the runtime actually resolved and executed after provider, platform, permission, MCP, capability, or policy evaluation
- requested vs effective differences must be visible when they alter runtime behavior or available actions
- this applies to Persona, platform/provider, model, MCP/tool availability, browser trust/capability, and project-scoped overrides
- switching projects must recalculate effective state for the new project context; cached state from the previous project must not remain silently authoritative

### 2.2 Stable identities

The promoted feature set requires first-class stable identities for:
- `project_id`
- `workspace_tab_id`
- `window_id`
- `thread_id`
- `branch_id` for branched thread/session lineage
- `browser_tab_id`
- `preview_session_id`
- `terminal_session_id`
- `dev_session_id`
- `automation_session_id` when automation/browser tooling needs ephemeral isolation

Rules:
- a path alone is not a sufficient identity for project restore semantics
- workspace-tab identity is distinct from project identity so multiple tabs may point at the same project with different local shell state
- browser-tab identity is distinct from preview-session identity so multiple browser containers can render the same preview subject without collapsing persistence

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

- context/usage indicators may update during streaming
- partial updates must not invent final totals before the platform reports them
- the user sees stable in-progress states such as updating/streaming rather than flickering totals
- final per-thread usage lands in the same canonical thread Usage surface used outside streaming

### 3.10 Multi-Tab and Multi-Window

- workspace tabs are first-class and persist order, active tab, per-tab project identity, and local shell state
- windows may host one or more workspace tabs when the platform implementation supports it
- drag-between-window support is optional, but fallback behavior must be defined and deterministic
- close behavior must account for dirty editors, running dev sessions, active terminals, and detached children

### 3.11 Virtualized Conversation or Log List

- long chat and runtime lists must use virtualization without losing keyboard navigation, focus recovery, or anchor-to-message behavior
- virtualization cannot break sticky status elements, selection, or search results navigation

### 3.12 Know Where Your Tokens Go (Analytics Framing)

- app-wide Usage and thread Usage share one normalized usage contract
- cost_usage artifacts deep-link into canonical Usage/Ledger surfaces rather than an artifact-local model
- token and cost framing must make per-thread, per-run, and per-model attribution explainable without duplicating data sources

### 3.13 One-Click Install for Commands, Agents, Hooks, and Skills

- catalog install/update/remove flows must be lifecycle-aware for commands, skills, plugins/hooks, themes, and MCP configs
- update/remove behavior for active or referenced items is explicit: blocked, deferred-until-next-load, or allowed with immediate effect, depending on subsystem rules
- the catalog is not install-only; steady-state management is part of MVP behavior

### 3.14 Full IDE-Style Terminal and Panes

- terminal, problems, output, debug console, and ports are canonical panes
- terminal sessions are first-class identities and can be pinned, renamed, and restored according to shell policy
- problems/output/ports are linked to active project and dev session state

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

- click-to-context uses the canonical browser surface classes defined above
- in-shell browser tabs, detached preview windows, and ephemeral automation/auth sessions have distinct persistence and capability rules
- user-triggered context sharing marks the relevant browser/preview subject as shared with the active agent and exposes revoke controls
- browser behavior must account for Slint + Wry/WKWebView/WebView2/WebKitGTK differences across Linux, macOS, and Windows without collapsing the surface model

## 4. Command families required by the promoted features

The UI command catalog must expose stable commands for:
- project switch and project open-in-new-workspace-tab
- workspace tab create/close/reopen/move/focus
- detached window open/attach/close for supported surfaces
- thread Usage activation
- branch-from-restore and branch-open actions
- browser open/focus/detach/share-with-agent/revoke-share
- dev session start/stop/restart/show-output/show-ports
- catalog install/update/remove/enable/disable/apply-later actions

## 5. Persistence and restore rules

- project restore uses stable `project_id`, not raw path alone
- workspace tabs restore independently
- detached windows restore only when their surface class and platform support allow it
- in-shell browser tabs restore by project/workspace tab; auth and automation sessions do not
- terminal sessions and dev sessions have explicit restore eligibility; a running process is never assumed alive after restart without verification

## 6. Non-goals and anti-drift rules

The following are explicitly non-canonical after promotion:
- title-bar project bar as the primary project-switch shell
- floating thread-selector overlay as the canonical thread navigation model
- detached usage pop-out as the canonical per-thread usage surface
- one broad browser-instance model with LRU reuse as the core browser contract
- generic watch mode as the primary dev-loop model
- MCP as config-and-passthrough only
- app-level-only tool permission scope as sufficient for the promoted project-switch/MCP/browser model
