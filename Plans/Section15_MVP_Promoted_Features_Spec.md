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

Section 15 packetization preserves the owner/consumer split: owner docs identified here are MUST CHANGE, while dependent consumer or /mirror docs are MUST RECONCILE so they stay aligned without becoming the primary feature owner.

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

As a consumer of repaired /tool/routing semantics, `research-session` browser activity must keep `/browser-action` affordances aligned with the owner contracts in Tools, Permissions, and UI command routing rather than inventing a separate browser-action command family.

Identity fields:
- `canonical_purpose`: lightweight agent-driven browser interaction for web research, content access, and page navigation when static fetch or Site Reader is insufficient.
- `canonical_entry_points`: web tool escalation through `webfetch` / `webextract` `actions`, explicit agent request, or autonomous `webresearch` browser fallback.
- `profile_scope`: separate ephemeral profile by default, using the same isolation class as `automation_session`.
- `restore_policy`: never silently resumes; reopen returns `stopped` with `attention_required` until the user or orchestrator chooses a visible recovery action.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

Lifecycle creation is implicit when `webfetch` or `webextract` (`/webextract`) uses `actions`, or when autonomous `webresearch` needs browser fallback.

#### Action tiers

Research-session alignment uses 15 actions across three tiers:
- Tier 1, always allowed: `navigate`, `back`, `reload`, `snapshot`, `screenshot`, `console`, and `network`.
- Tier 2, `session_granted`: `click`, `scroll`, `type`, `press_key`, `wait_for`, and `set_viewport`.
- Tier 3, ask/deny: `fill_form` and `select_option`.

Excluded categories remain explicit: tab management (`open_tab`, `select_tab`, `close_tab`) because `research_session` is single-page focused, hover/drag, file upload, dialog handling, verify actions, trace/video capture, storage/cookie mutation, network simulation, and locator-generation/testing tooling.

Action annotation payloads record `{ action_type, target_selector, timestamp_ms, screenshot_ref }` whenever a research-session browser action emits reviewable evidence. `screenshot_ref` is optional unless the action captured visual evidence.

Permission boundary: `webfetch formats: ["screenshot"]` and `webfetch formats: ["pdf"]` are capture-format requests and require `session_granted`; they must not auto-elevate silently from static fetch permission.

Canonical lifecycle rules:
- creation is implicit when `webfetch` or `webextract` uses `actions`, or when autonomous `webresearch` needs browser fallback
- the session is transient and tears down after the tool invocation completes
- no user takeover or promotion-to-browsing flow exists inside `research_session`
- escalation to full `automation_session` requires explicit confirmation and is disclosed in activity transparency
- telemetry may use the distinct session class value `research_session` even though infrastructure is shared with `automation_session`
- the underlying browser runtime, CDP bridge, and Playwright-derived action taxonomy are shared infrastructure with `automation_session`, not a separate implementation or codebase


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

**Cross-owner worktree alignment:**
- `Plans/GitHub_Integration.md` Source Control §A.1 uses accordion navigation rather than tabs, and §A.4 Worktrees rows are single-column expandable rows whose owner labels can expose run/tier/thread IDs; remote SSH worktree notes stay with GitHub Integration.
- `Plans/WorktreeGitImprovement.md` is the implementation cross-reference for assistant-created worktree lifecycle, temporary naming, rename, cleanup, soft worktree-limit warnings, and Doctor orphaned-worktree checks.
- GUI placement remains split intentionally: `Plans/FinalGUISpec.md` owns the thread selector worktree icon, Source Control accordion reference, Appendix A `WorktreeGitImprovement` cross-ref, and Settings > Branching > Assistant Worktrees with 10 settings in 3 groups.
- Worktrees are visible from Orchestrator and Source Control without forcing one cramped Source Control side-panel design. Orchestrator-managed worktrees stay distinguishable from user-created and assistant-created worktrees, while Source Control may use compact rows, filters, or tabs only when those controls preserve the same worktree object identity.
- Multiple projects and /repos may run orchestration concurrently. Presented orchestration data is per-project, multi-account aware, and app-level only through shell aggregation; project status cards stay project-scoped, and project differences such as settings, /themes/snapshots/etc, /storage, /provider state, and worktree inventory do not leak across project boundaries. Existing Orchestrator tab structure may keep its 4-6 tabs while the current spec stays weak and avoids deep redesign in this promoted-feature registration.
- `chain-wizard-flexibility.md` keeps worktree policy conditional on run intent rather than globally uniform: isolated worktrees are the default for parallel or risky work, but wizard/chain flows may reuse or route worktrees when the owner docs declare that exception explicitly.

**Non-MVP boundaries:** Section 15 registers the promoted feature but does not widen the owner scope: Assistant Chat W.17 remains the explicit non-goal owner for no arbitrary "Bind Existing" MVP, no unbind/merge undo, no per-merge command override, no worktree-scoped Changes section, no thread export of worktree binding metadata, and no orchestrator-to-assistant worktree transfer on handoff.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Per-thread context detail uses one compact inspect/action entrypoint plus one canonical detailed surface.

Rules:
- the chat header context indicator is always visible for the active thread
- compact context rows use normalized workflow labels such as `Ask`, `Agent`, `Plan`, and `Deep Plan`; `Deep Plan` remains a distinct canonical `/workflow` identity rather than collapsing into plain `plan`
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
- Puppet Master does not `auto-spawn` a `second-section` as the default terminal experience; second-section creation is user-driven or explicitly policy-disclosed.
- Each terminal section owns an ordered tab strip.
- Each terminal tab owns from one to four panes.
- Terminal defaults to the bottom of the GUI, can be detached/popped into its own window (`/popped` lineage), moved and resized inside the shell, and restored as one of up to two terminal sections/components with reorderable tabs and panes.
Terminal presentation vocabulary is explicit: the simple default is one visible bottom-docked section; `/docked` means a supported shell runtime zone, detached stays first-class, and `/editor-area` replacement is not a canonical terminal section target.
- Terminal chrome has separate naming-surface layers: a stable `Terminal` section title, detached-window title, terminal-tab label, pane header, and accessibility name; volatile `/context/status`, `/command/status`, and high-priority attention state belong in `/badges` or secondary labels, while primary labels remain user-renamable.
- Each terminal tab can be shown as a single pane or a two-by-two quadrant layout, and tab/pane order is user-controlled without changing runtime identity.
- Supported tab layout families are explicit rather than arbitrary freeform geometry: one pane uses `single`; two panes use `two_columns` or `two_rows`; three panes use `three_columns`, `three_rows`, `main_left_stack_right`, `main_right_stack_left`, `main_top_stack_bottom`, or `main_bottom_stack_top`; four panes use `four_grid`, `main_left_two_stack_right`, `main_right_two_stack_left`, `main_top_three_stack_bottom`, `main_bottom_three_stack_top`, `four_columns`, or `four_rows`. Split and remove behavior transforms to the nearest valid family while preserving pane identity, and user-adjusted ratios survive until reset.
- Terminal settings own a project-root default cwd plus user-configurable default working directory and appearance defaults, including `/theme/color`; section, tab, and pane names must be renameable and `/labeled` without changing runtime identity.
- Pane layout supports row and column splits, and removing a pane rebalances the remaining panes deterministically.
- The layered terminal model covers shell placement/navigation, terminal section `/component` boundaries, session identity and lifecycle, tab `/quadrant/window` presentation, chat/tool command handoff, dev-session relationships, `/defaults/theming`, persistence `/restore/recovery`, and remote `/provider/platform` variants.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### Terminal section, tab, pane, and session model
- `terminal_section_id` owns presentation continuity, dock/detach state, and section-level visibility.
- `terminal_tab_id` owns tab title, pin state, order, section membership, and selected-pane state.
- `terminal_pane_id` owns split-tree slot identity and visible session binding.
- `terminal_session_id` owns runtime PTY continuity.
- `dev_session_id` owns higher-level dev workflow continuity and may link terminal, output, problems, debug-console, and ports surfaces without replacing the underlying shell-session identity.
The shorthand `/tab/pane/session` means this owner split: terminal tab and pane identity own presentation and reveal targets, while terminal session identity owns exact PTY continuity; `/tab/workspace` is the tab-scoped workspace presentation context, not a substitute runtime.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Rules:
- a pane binds to exactly one live or historical `terminal_session_id` at a time
- a tab may contain panes bound to different terminal sessions
- moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity
- a `dev_session_id` is not a shell-session alias and MUST NOT be used where exact PTY continuity is required
- auto-derived terminal `/tab` and pane labels may be recomputed on restore from retained metadata only when no frozen user label exists; restored exited or `/disconnected` panes keep the last display label plus `/status/context` and `/context` indicators, visible labels and accessibility names stay aligned enough to identify the same pane or tab, and primary labels stay scannable while richer runtime detail belongs in badges, subtitles, sticky headers, tooltips, and command metadata.
- A terminal-tab is a workspace-like, tab-owned organization container for `/ops` intent, pin state, pane set, layout, per-pane defaults, tab-scoped `/profile` overrides, restore metadata, and related dev-session affinity; it never pretends to be the live PTY runtime identity or collapses multiple `/sessions` into one fake shell.
- Terminal tab role or intent metadata is optional; untyped general-purpose tabs remain valid, and roles are organizational hints for defaults and labeling rather than authority over shell `/session` identity.
- Role hints may influence default names, iconography `/badges`, default cwd and `/profile/runtime` choices for newly created panes, placement `/routing` and role-based routing hints, lightweight affordances for a workspace type, and PM suggestions from a known action `/template/workflow`; a small initial set includes `general`, `dev_server`, `tests`, `logs`, and `deploy_ops`.
- Role hints MUST NOT override `terminal_session_id` ownership, actual pane runtime status, cwd/profile/runtime context of an already running session, explicit user labels, or explicit user default overrides.
- Role persists with the tab workspace across session churn and restore; clearing or changing the role only changes future defaults and `/affordances`, and users can return a tab to `general` or `/untyped` without losing the tab, its dev-session links, or past `/sessions`.
- Project Terminal settings provide baseline `/profile/defaults`; tab-scoped defaults may override them for one workspace, and new panes inherit resolved cwd and `/profile/runtime` defaults unless an explicit action or exact session binding wins.
- Terminal settings precedence is session or tab explicit override, then project terminal setting, then platform default. Per-project settings own theme, default font and `/rendering`, default `/paste/selection` behavior, shortcut mappings, default shell `/profile`, scrollback and `/performance` limits, confirmation behavior, cwd policy, layout restore, project-preferred layout style, project-scoped labels or workspace defaults, and explicitly allowed environment/profile choices; `/session-scoped` overrides stay narrow and intentional.
- Terminal sections, tabs, panes, and `/tab/quadrant` layout are `workspace-tab-scoped` presentation state linked to thread-scoped and project-scoped context; explicit `New Terminal` or `new-session` commands mint a new `terminal_session_id`, while reveal, detach, `/reattach`, and move actions preserve the bound session unless `/TTY-required` routing requires a fresh interactive shell. Rename `/label` values are `user-only` unless the user accepts metadata-derived suggestions, and built-in `/documentation` or `/fun` affordances may reference terminal behavior without owning `/interruption/recovery` or runtime state.
- Pane and tab motion is explicit `/reorder/move`: moving a pane across a `/section`, tab, or move-across-window path requires a move command, preserves pane identity, attached `/session`, focus unless a background move is chosen, and any `/binding`; moving a whole tab carries contained panes and sessions, split creates a new pane identity, and `/remove` or `/closing` destroys the slot only after terminal cleanup and confirmation rules run.
- Terminal shorthand such as `/tabs/panes`, `/reveal/move/rename/pin/close/detach/reattach`, `/close-tab`, `/reveal`, and `/transcript` maps to this owner split: workspace commands change presentation containers, while PTY transcript continuity stays with `terminal_session_id` unless an explicit `termination_policy`, `/replacement`, restart, or `New Terminal` action asks for a new runtime identity; same-session resolution never falls back to the most-recent visible pane, and requested/effective outcomes are `/disclosed` through inline status and restore `/banners`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

### Cross-surface ownership and reveal rules
- `Open in Terminal` and `Show Terminal` first reveal the existing session bound by `terminal_session_id`.
- If that session is hidden inside another pane, tab, or section, Puppet Master reveals and focuses the existing container before creating anything new.
- If only historical state remains, the reveal target shows historical transcript and recovery controls instead of faking a live shell.
- Explicit `New Terminal`, explicit split, and explicit restart create new runtime identity.
- Output, Problems, Debug Console, and Ports are distinct surfaces that preserve linkback to the owning terminal or dev session.
- Adjacent run/debug, IDE, remote, and `/workflow-heavy` systems may reference terminal state and `/workflows`, summarize or reveal Terminal, and expose TUI or emulator-style context, but they MUST NOT redefine terminal ownership or runtime identity. Debug Console is debugger-scoped, remote shell context remains execution context inside the canonical terminal model when supported, and adjacent surfaces cannot quietly replace Terminal as the shell owner; official-doc comparison material may inform these distinctions but does not create a second owner.
Agent shell control consumes `Plans/Tools.md` `/tool` and `/policy` outcomes through the canonical terminal subsystem; normalized bash/tool outcomes feed terminal state rather than inventing parallel shell ownership.
Routing labels stay exact: `Split Terminal`, `/split/restart`, `source-pane`, `workspace-bound`, `no-structure-yet`, `within-tab`, and `same-session` are action/routing states, so split and restart semantics are never inferred from the nearest visible pane alone.
Derived-surface linkback records preserve `reveal-origin-terminal` when terminal-backed evidence exists; generic `/reveal-origin` falls back through `terminal_session_id`, `terminal_pane_id`, `dev_session_id`, and `no-terminal-origin` only when no terminal-backed source ever existed.
- `dev-session-linked` artifacts preserve both aggregate workflow identity and concrete shell identity. Problems, Ports, Output, Browser/preview, and chat summaries may link to `dev_session_id` as the aggregate workflow context, and whenever a concrete shell runtime exists they also preserve the specific `terminal_session_id` when known.
- `Open in Terminal` from a `dev-session-linked` artifact prefers the originating `terminal_session_id` when available; if no exact terminal session is known, PM may reveal the primary terminal session for that `dev_session_id`; if the dev session has no terminal and now needs PTY-backed interaction, PM creates a new bound terminal session under that dev session.
- Terminal/dev lifecycle independence is explicit: ending a terminal session does not necessarily end the broader `dev_session_id`, ending or stopping a dev session does not delete related reviewable or `/exited` terminal panes, and stopping a dev session ends or detaches only the managed workflow identity without retroactively rewriting terminal history/identity.
- Adoption is explicit: PM may attach a terminal session to an existing `dev_session_id` when the user explicitly launches related workflow work there, and PM must not silently adopt arbitrary shell sessions into a dev session from weak heuristics.
- `terminal_session_id` answers which shell/PTY runtime is this; `dev_session_id` answers which PM dev workflow/lifecycle this belongs to.

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
- Source shorthand `live-input` maps to `live_input`; `/TUI`, `TUI`, and `full-screen` terminal apps map to `tui_capture`, where the `always-allowed` terminal shortcut subset is intentionally narrow: existing selection copy, explicit `terminal-search` only when safe, font zoom, and product-level escape or `/help` affordances. PTY-facing input wins over PM-wide shortcuts unless a reserved terminal-owned action is explicitly allowed for the current mode.
- Accessibility and status disclosure are part of interaction ownership: icon-only indicators require text labels plus `/tooltips/accessibility`, runtime-state and interaction-state are separate state machines, and material mode or focus changes remain user-inspectable.
- Shortcut conflict resolution must disclose suppressed bindings, show the actual focus and interaction-mode context in remapping UI, and record whether a terminal-owned action preempts shell/TUI input before any PTY write.
- `live_input` uses a `hard-reserved` and `always-available` subset for terminal-owned actions; outside that subset, `/PTY` passthrough keeps ordinary typing and common shell-editing defaults with the shell.
- `scrollback_review` (source shorthand `scrollback-review`) permits terminal-owned `/navigation` and `/search` review bindings because shell passthrough is not receiving live input.
- `selection_active` (source shorthand `selection-active`) keeps copy and selection-adjustment terminal-owned; non-selection terminal actions must not clear active selection unless they inherently replace it.
- `search_active` (source shorthand `search-active`) owns search text entry plus next and `/previous/close` bindings; ordinary typed characters feed terminal search UI, not the shell.
- PM-wide shortcuts require explicit scope and precedence handling; one keystroke MUST NOT trigger both a terminal action and an application action
- selection is canonical linear text selection rather than rectangular block selection
- wrapped lines copy logical text rather than viewport-row fragments
- copy works in live and review modes; paste targets only the active terminal input owner
- The live-input-area supports first-class `/copy/paste` and selection without confusing shell-owned line editing with app-owned selection state; wrapped multi-line `/input` may be selected by visible row while copying the logical input text correctly, including stable `/down`, `/right`, and `/selection` behavior.
- When a TUI owns mouse input, terminal-level mouse selection requires an explicit override `/path`; keyboard copy over an existing terminal-level selection remains terminal-owned, and PM shows a local hint when pointer behavior is going to the TUI instead of text selection.
- Command-block copy actions offer block-copy choices to copy command, copy output, or copy full block for `/command/output/completion` content while preserving user-visible context when backing transcript is pruned; if backing transcript is pruned or invalidated, PM clears the active selection gracefully before any copy result can return corrupted data.
- selection-start behavior resolves a Selection `/anchor` to stable buffer or `/transcript` positions with grapheme-aware boundaries; keyboard selection extends from the current caret or anchor through terminal-owned selection commands; baseline MVP selection is terminal-level linear selection, not rectangular `/block` selection, and it survives scroll, streaming output, resize, soft-wrap or hard-line rewrap, theme changes, and renderer changes without falling back to viewport-fragment clipboard-semantics.
- Search opened from `live_input` snapshots review position, enters `scrollback_review + search_active`, and exits predictably; search opened from `scrollback_review` stays in review, beginning selection during search preserves `search_active` unless the selection action explicitly replaces or dismisses search, new output during review or search does not force `live_input` or live-follow, and an explicit return-to-live affordance is visible.
- `live_input + tui_capture` starts when a full-screen TUI or `/keyboard-capturing` app takes over; when TUI capture exits during terminal-level review/search, PM returns to the nearest valid non-transient base-mode instead of snapping blindly to plain PTY live input, and search navigation includes next, previous, and `/previous/close-search`.
- `/alternate-screen` and mouse-capture change input-ownership without erasing pane identity: TUI text-entry stays PTY-facing, review-oriented overlays keep terminal `/ownership`, and auto-follow resumes only after an explicit return-to-live or valid mode exit.
- Valid steady interaction states are `live_input`, `live_input + selection_active`, `live_input + tui_capture`, `live_input + tui_capture + selection_active` when a terminal-level selection override is intentionally engaged, `scrollback_review`, `scrollback_review + selection_active`, `scrollback_review + search_active`, and `scrollback_review + search_active + selection_active` when review selection is intentionally preserved during search. `live_input + search_active` and `search_active + tui_capture` are not normal steady states; search enters review semantics, TUI passthrough is suspended only by explicit user action, and `/history/navigation` follows the active base or `/overlay` state.
- Copy output preserves real line breaks from the buffer or `/transcript`, `/unicode` grapheme boundaries, composed characters, emoji, and wide-character source text rather than padded cell artifacts; default copy preserves selected whitespace, `trimmed-copy` is an explicit alternate command, and copy-on-select is not a baseline default unless a later setting makes that behavior clear and user-visible.
- Terminal-owned shortcut categories include search open and `/next/previous/close`, scrollback up/down/top/bottom, copy current selection and copy variants, paste when the pane is in a paste-capable live-input state, clear or `/reset`, command-block navigation, zoom and `/font-size`, detected link or `/path` open, shell-specific keys such as `/zle/fish`, and return-to-live; PM-wide `hard-reserved` shortcuts stay minimal and documented because they override live shell or `/TUI` input.
- Link actions include open-link and `/path-under-cursor`, and paste is limited to an input-capable live state; non-live, review-only, or `/exited/disconnected` panes may copy retained transcript text but cannot receive shell paste as if a live session existed. Selection and search visuals must remain high-contrast without overwriting the true selected transcript range.

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
- shell-integrated command metadata relies on shell hooks plus escape-sequence signals rather than transcript guessing; integration `/patterns` cover OSC 7 `/cwd`, OSC 133-style `/prompt` and `/command` boundary markers, bash `PROMPT_COMMAND` and prompt wiring, zsh `precmd` and `preexec`, fish `/preexec/postexec-style` functions, generic `/precmd-style` hooks where available, and PowerShell `/profile` and prompt integration.
- Capability tiers record whether each `/session` has trustworthy prompt start `/end`, command start `/end`, cwd reporting, exit status reporting, shell/profile identification, and per-command metadata; weak shell-integration falls back to lower-confidence command metadata rather than invented exactness.
- Command-block identity is transcript-oriented metadata, not rendered UI fragments: each block has `command_block_id`, owning `terminal_session_id`, monotonic ordinal, nullable `command_text`, nullable cwd, `block-start`/start_marker reference, `block-end`/end_marker reference, `started_at`, nullable `ended_at`, nullable `duration_ms`, nullable `exit_status`, lifecycle state, and integration source. Lifecycle states include `pending_prompt`, `collecting_command`, `running`, `completed`, and `indeterminate`; shell-provided markers win when available, and weak integration must not fabricate block-start, block-end, command_text, or exit_status.
- Command-block completion is immutable except for late-arriving metadata from the same authoritative source and carries `/confidence` when completion source quality matters. If session-exit or `/terminated` occurs during an active block, PM finalizes the block as abnormal or indeterminate instead of dropping partial `/command/output/completion`; sticky-header resolution uses the nearest enclosing authoritative command block for the top visible transcript position, omits the header when no block exists, and marks approximations clearly.
- A command block is a prompt-to-completion unit; `/nearest` command-block navigation resolves to the nearest authoritative block for the visible transcript position and must disclose lower-confidence approximations.
- The legacy marker `session_terminated_while_running` maps to the `session-end` closure path: `session_runtime` and `shell_integration` evidence beat any `transcript_heuristic`, and weak integration must keep `block-end`, command text, and copy-output confidence explicit.
- Retention and pruning are honest: command-history metadata is not enough by itself for review, PM preserves a bounded review transcript by default, and it does not promise infinite retention or lossless replay of arbitrary long-running PTY byte streams. The storage model separates active rendering `/input` buffer state, persisted transcript chunks for `/restore`, and lightweight command-block or session metadata keyed to transcript references; transcript persistence is append-oriented and chunked rather than one giant row or `/blob`, and `/flush` writes are batched so high-output sessions do not stall the UI thread.
- If pruning invalidates a command block's backing output range, the block remains as partially-backed or metadata-only command metadata; raw-transcript-only actions degrade honestly with `/history-unavailable`, transcript `/search` operates only on retained raw transcript or `/scrollback`, command or `/block` navigation may continue on metadata, and a restored-pane first restores structure, then recent transcript when available, then live `/reconnect` only where emulator-state and runtime support allow it. Restoring `/tabs/panes/session` shells must not require full transcript replay or fold transcript rows into `/layout` persistence.

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
- `pre-run` terminal command `/safety` approval is visible before execution and includes edit, approve, reject, and trust choices; hard interrupt and `/kill/cancel` primitives are non-negotiable for AI-driven terminal work.
- `terminal_section` state includes `docked_visible`, `docked_hidden`, `detached_visible`, and `detached_hidden`; dock, detach, show, hide, resize, and `/move` transitions are state-preserving events.
- `terminal_tab` state includes `active`, `inactive`, `restoring`, and `review_only`; activation and `/deactivate` are presentation transitions, project reopen enters restoring, and a tab becomes review_only when all attached panes are exited or `/disconnected`.
- `terminal_pane` state includes `live_idle`, `/live_idle`, `live_running`, `tui_active`, `exited`, `disconnected`, and `restoring`; command or `/task` start moves `live_idle` to live_running, command completion returns to live_idle or exited, and alternate-screen or TUI capture enters tui_active.
- runtime-status is pane-level and distinct from attention state and the notifications-model: canonical pane statuses include `ready`, `running`, `tui_active`, `restoring`, `exited_clean`, `exited_error`, `disconnected`, and `failed_to_start`; `tui_active` means a live `/session` is in alternate-screen or `/TUI-oriented` interaction, `/profile/cwd` context is status metadata rather than the status itself, and focused-pane events prefer inline status plus badges while `/inactive` or detached failures may notify.
- Exited-session review preserves `/profile/env` and last-known command context when available, but any relaunch or restart still mints a new live runtime identity.
- Attention flags are separate from runtime status and may coexist with any non-terminal runtime state: `unseen_output`, `unseen_completion`, `failed_command_since_focus`, `restore_action_needed`, `relaunch_available`, `context_changed`, and `tui_mouse_capture_hint` are hidden-attention source-of-truth signals for a `/pane`, `/sections`, or `/tab/window` until `/reviewed` or resolved.
- `unseen_output` means hidden or `/inactive` panes received output; `unseen_completion` means a running command completed while unfocused; `failed_command_since_focus` means a command failed since the pane was focused or reviewed; `restore_action_needed` means structure and `/transcript` were preserved but user action is needed to reconnect, `/restart/rerun`, or `/rerun`; `relaunch_available` applies to exited or `/disconnected` panes; `context_changed` records user-meaningful `/shell/remote` cwd or profile drift while unfocused; `tui_mouse_capture_hint` tells the user that pointer input is going to TUI capture rather than text selection.
- Closing a pane with a running session requires terminal-consistent confirmation; an `/exited` pane may be removed unless product rules preserve review state for `/restart/copy-output`, and pane removal rebalances the surviving pane identities instead of leaving dead quadrants. The stop and `/close` ladder is explicit: interrupt preserves the session, terminate ends the current process while preserving pane review state, kill-session may force-stop the process tree, and close pane, `/tab/section`, or terminal section is a workspace-structure action rather than a process synonym.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Empty-state and first-run rules
- a project with no terminal history shows an explicit `Start Terminal` empty state with shortcut hints
- Output, Problems, Debug Console, and Ports explain that they activate when linked terminal or dev-session data exists
- restored historical tabs and panes show explicit state banners rather than pretending they are newly launched sessions
- Tab-scoped overrides live in workspace-local UI because they affect one workspace, not the project baseline: tab role `/intent`, tab label, tab default cwd or profile override, and tab layout style `/arrangement`.
- Pane and `/session-local` actions are runtime behavior, not durable Settings rows: `/rerun/replace/terminate/kill`, current runtime status handling, live search, selection, review position, temporary overlays, and one-off reveal or `/focus` stay in terminal runtime UI.
- Settings may expose persistent diagnostics preferences, high-level capability visibility, and command `/behaviors`; detailed per-session errors, `/events/logs`, first-run creation, and review-only empty-state actions belong in runtime diagnostics or runtime UI rather than editable settings.
- `restored_without_history` (source shorthand restored-without-history) means PM restored structure but lacks retained transcript or `/history`; it is not first-run empty, and the pane remains user-visible with explicit history-unavailable wording plus create, `/restart/replacement`, or replacement actions. Closing the last-pane removes the tab unless PM intentionally preserves a review-only shell-like workspace, closing the `/last-tab` removes the now-empty section unless a section-empty-shell is explicitly supported, and any empty section shell offers create, `/import/move`, or move actions rather than looking broken.
- Restore language must not blur live continuity with historical slot recovery: a `/restored` `/pane` can keep durable `terminal_session_id` metadata, labels, ratios, layout, and defaults while being metadata-only or `/review-limited` when transcript is missing, and continuity of the same live session after app restart is best-effort and terminal-consistent only when the runtime proves it.

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
- remote and local `/files/shell`, `/file-manager/review`, `/editor/preview/git/LSP/remote`, `/test/share`, and `/runtime/service` surfaces that expose requested/effective capability rather than inventing local-only behavior
- project-scoped overrides after project switch

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Additional rules:
- switching projects recalculates effective terminal, browser, tool, and provider state for the new project context
- historical runtime and shell surfaces show frozen captured effective state rather than recomputing from current settings
- requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide
- stale or degraded projections must `/revalidate` before mutating actions; read-only fallback uses explicit `/freshness`, `projection_freshness`, `projection_health`, pending-sync, and `degraded-copy` wording rather than vague uncertainty

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
- `workspace_tab_id` and `browser_tab_id` are stable shell identities but are not `target_kind` values. `target_kind` remains a destination class for route/open resolution, while tab IDs identify concrete shell containers.
- `terminal_section_id` owns presentation continuity rather than PTY continuity
- `terminal_tab_id` and `terminal_pane_id` own workspace continuity and reveal targets inside the shell chrome
- `terminal_session_id` owns exact PTY continuity and is the canonical meaning of “same terminal session”
- `dev_session_id` owns higher-level workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Action-identity rules:
- `Open in Terminal` and `Show Terminal` target existing `terminal_session_id` bindings first
- `New Terminal`, explicit split, and explicit restart produce new runtime identity even when they reuse an existing pane or tab container
- moving, renaming, pinning, docking, or detaching sections, tabs, and panes are presentation changes only and do not mint new PTY identity
- Owner-vs-consumer discipline follows the universal boundary map: `Crosswalk.md` and `Contracts_V0.md` own route primitives such as `route_target` and `OpenSubject`, `FileManager.md` owns `OpenFile`, `GitHub_Integration.md §C` owns SSH remote project mode, and Section 15 plus `storage-plan.md` own terminal/runtime identity while downstream docs consume or reveal those identities.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md
### 2.3 Attention, blocked, and background indicators

The shell must expose background and blocked work consistently.

Rules:
- background activity from non-active projects or workspace tabs remains visible through badges, activity indicators, and attention-center entries
- Shell project state consumes `projects:v1` and `project_state:v1:{project_id}` projections; `project_state` remains project-scoped, and non-active project activity stays visible through badges and attention surfaces.
- blocked episodes never disappear into silent state changes
- if a feature opens a detached window or background session, its blocked or action-needed state still routes back to canonical shell attention surfaces
- Attention routing separates surfaces by purpose: History is the canonical chronology of everything, Progress / Dashboard owns active operational attention and grouped counts, `/chat` and thread/chat are the direct user-action paths when the blocked owner or flow genuinely needs user input, and system notification is a sparse summon layer for high-value action-needed states.
- The attention center is the canonical high-level shell surface for background, blocked, or action-needed items outside the current active project/thread or `/thread`. Multiple attention-like emitters, including wizard cards, thread badges, dashboard CtAs, blocked-node lists, auth badges, and resume URLs, normalize into attention items instead of remaining unrelated one-off UI hints.
- Ledger remains the strongest fallback surface for exact inspection. Exact Ledger browsing stays available via slice-based record queries even when higher-level projections, dashboards, summaries, or project cards are unhealthy.
- Generalized resume routing covers blocked run items, concern-driven attention, auth/account issues, `/account` recovery, `/thread` recovery, Source Control and GitHub action-needed items, and degraded-trust inspection prompts. `resume_url` remains serialized route transport; the durable attention item records the owner, reason, route payload, and projection trust separately.
- `assistant-chat-design.md` treats thread attention and blocked notices as persistent shell behaviors. Section 15 requires those notices to activate through reusable route payloads rather than purely behavioral local callbacks.
- Project-attention rows are normalized `project-attention` items that can back attention-center rows, project-card badges, title-bar attention badges, command-palette "resume/fix" and `/fix` entries, and cross-surface "go to the right place" behavior.

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
- branch labels, source-origin lineage, and branch origin time are visible in history/navigation surfaces
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
- stream usage payloads preserve `session_id`, `response`, per-model API totals, and token totals including `prompt`, `total`, `cached`, `thoughts`, and `tool`; these fields may update during streaming but remain provisional until the final provider usage event closes the turn

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
- **Debug Console** remains a distinct DAP-owned debugger surface rather than a synonym for Terminal, even when both are visible in the same runtime section.
- **Ports** owns discovered or declared service endpoints, watches, and open-port affordances linked to the owning dev session.
- Surface-boundary labels stay explicit: terminal-run is PTY-backed; Output may own non-interactive `/run/test/task` and `/linter/test/build` summaries; Problems owns `/errors/warnings` with `/line/code`; Debug Console keeps debug-console-specific evaluator semantics; terminal-derived diagnostics and `/diff` render checks link back to the originating terminal or dev session; Ports owns `/listening/forwarded` endpoints and URL actions.
- Cross-surface feature patterns are canonical only when they preserve origin: Output and `/Run` views support channels or per-task tabs, filter and `/search`, pin or `/preserve`, follow-vs-pause for live logs, rerun, and `/reveal-origin`; Problems supports grouping by file, `/tool/severity`, dedupe, filters such as `/current` file or current tool, and code plus originating run or session links; Debug Console separates REPL and `/evaluation` from stdout or `/stderr`, retains expression and `/commands` history, and renders richer `/objects`; Ports and `/Services` support `/endpoint` auto-discovery, process or `/service` labels, open and `/copy` URL actions, and route back to the originating `/session` or dev-service context.
- Debug and run surfaces are part of the broader workbench story, not a free-floating panel: remote run/debug follows remote-edit MVP requested/effective disclosure, only hand-authored plan contracts can promote derived shard hints into shipped behavior, and JSONL mirrors or logsearch-style retrieval remain future `/diagnostics` hints until reconciled into owner docs.
- Process, test, and dev-server debug correlation prefers `dev_session_id`, including `/test/dev-server` loops; `terminal_session_id` remains exact shell continuity, while `browser_session_id` and `session_class` remain the browser evidence identity.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

#### Persistence and recovery guarantees
Terminal persistence uses three guarantee tiers:

| Tier | What belongs here | Rules |
|---|---|---|
| `guaranteed_durable` | section/tab/pane layout, titles, pin state, selected tab or pane, terminal-session and dev-session bindings, restore banners, durable settings refs | MUST restore deterministically after restart or project reopen |
| `best_effort_durable` | bounded transcript snapshots, command-block metadata, shell-integration hints, cwd snapshots, exit metadata, derived Output or Ports linkage | MAY be pruned or absent after crashes or storage pressure, but absence must be disclosed |
| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |

Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.
- Terminal persistence is append-oriented and chunked: high-output or long-running PTY sessions write bounded transcript chunks plus command-history metadata, not a single layout record or `/blob`; partially-backed and metadata-only records are valid degraded states, but the UI must disclose missing backing transcript before offering transcript-specific review, copy, or search behavior.
- Restore labels are exact: `live-restored` requires a verified live-session reattach; `/disconnected/review-only` is the durable UI state when no live runtime exists; `/history/context` hydrates best effort, while `/ephemeral` overlays remain `transient-only`. Guaranteed durable layout includes tab-scoped `/intent`, `/placement`, `/ratios`, and last-known `/profile/env` metadata.

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
- Terminal is a first-class shell-workspace, not a set of mini-shells or `/browser/terminal` placeholders; this terminal/browser anti-collapse shell-shape keeps `/session/command-block`, `/dev-session`, and `/tabs/panes` terms distinct while preserving exact-session continuity, presentation continuity, and multi-surface routing boundaries for GUI, `/debug/hot-reload`, and `/recovery/inspector` consumers.
- chat command cards, output rows, problem rows, and ports rows use exact session or dev-session linkback where available
- `Open in Terminal` is idempotent same-session reveal, not shorthand for `New Terminal`
- `Show Terminal` reveals the existing section, tab, and pane that already own the referenced session before considering creation of a new container

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md

#### Cross-platform capability matrix
One product model applies across macOS, Linux, and Windows, with explicit degradation disclosure when capabilities differ.
Cross-platform findings are first-class terminal design input: the matrix covers PTY `/session/process-host` strategy, renderer fallback and GPU behavior, shell `/profile/cwd/env` handling, `/input/Unicode/accessibility` plus IME and clipboard behavior, permissions, runtime packaging, and escape-sequence quirks.
The terminal SSOT explicitly covers the interaction-mode contract across live input, scrollback review, selection, search, and full-screen TUI capture; `/copy/paste/input-navigation`, `/IME/accessibility`, and `/log/plain/export` are acceptance labels, not optional notes. The same cross-platform terminal SSOT treats macOS plus `/Linux/Windows` acceptance as first-class before implementation can be considered complete.

| Capability area | Required behavior | Degradation rule |
|---|---|---|
| PTY host and process supervision | spawn, resize, signal, exit, cwd tracking, environment handoff, and detached-session recovery semantics | unavailable or degraded PTY control MUST be surfaced as effective capability loss, not hidden fallback |
| Shell integration metadata | command boundaries, cwd updates, prompt markers, exit codes, and command duration where the shell supports them | weak integration MUST degrade to lower-confidence command metadata without fabricated exactness |
| Docking and detached windows | docked section plus detached terminal window behavior | unsupported detach paths MUST be disclosed as platform constraints |
| Clipboard, IME, accessibility | copy, paste, selection, IME composition, focus, and assistive-technology announcements | unsupported or partial behavior MUST be explicitly disclosed in effective capability state |
| Remote and multi-context launches | local shells plus context-aware launch for SSH, WSL, containers, `/dev-container`, or similar transports where supported, with environment-context badges, `/labels`, current shell-profile, cwd `/directory`, and project-root relation where reliably detected | unsupported contexts MUST fail deterministically rather than silently retargeting to the wrong runtime; low-confidence remote/container context is omitted or cautious rather than fake certainty, and `/leaving` or entering context transitions feed sticky headers, command metadata, `/Services` origin linking, labels/default names, and restart/rerun decisions |
| Renderer `/render-mode` | interactive rich, plain `/log/CI`, machine-readable `/export`, degraded ASCII `/low-capability`, and optional `/spectacle` showcase mode | effective renderer mode MUST be disclosed whenever it differs from the requested preference; `/spectacle` never burdens daily-driver defaults |
| Accessibility and text model | keyboard navigation across `/tabs/panes/terminal` actions, screen-reader-readable labels for section, tab, pane, command action, and running or `/exited` state, focus visibility, TUI capture hints, font-model and text-model correctness for grapheme-cluster, multi-codepoint, mixed-width, wide-character, emoji, and box-drawing output, plus IME composition and `/candidate` behavior on macOS and other platforms | degraded accessibility, Unicode, IME, or TUI behavior MUST surface as requested/effective capability loss rather than silent renderer drift |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

Platform acceptance criteria explicitly cover `/macOS`, Windows, WSL, Wayland, `/X11`, `/dock/detach`, `/copy/paste`, IME `/composition`, focus, restore `/review`, and GPU fallback as first-class test dimensions, not post-hoc portability notes.

Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.

#### Subsystem architecture and non-ship rules
The terminal implementation is split into explicit subsystem contracts:
- process host and PTY `/session/process` supervision
- terminal `/engine` and transcript buffer
- renderer
- shell-integration metadata extractor
- workspace chrome and cross-surface UI

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

Rules:
- subsystem boundaries and ownership MUST be explicit
- The terminal SSOT layers are: PTY `/session/process` transport; VT `/ANSI/grid/buffer` terminal-model `/engine`; shell-integration metadata for prompt marks, command boundaries, exit status, cwd, recent command, and `/directory`; and workspace/session UI for sections, tabs, quadrants, detached windows, command palette, search, blocks, `/separators`, sticky headers, badges, and quick actions.
- acceptance gates MUST exist for process-host correctness, renderer stability, transcript integrity, shell-integration degradation, and cross-surface reveal behavior
- Parser-engine gates cover `/VT` escape parsing, `/ANSI/grid/buffer` state, `/selection/scroll` anchor stability, and regression-tested replay fixtures for command blocks, alternate-screen transitions, huge output, search, and resize.
- GPU acceleration may improve rendering, but it does not excuse a bad terminal model or transcript architecture
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- DOM/React/webview-style terminal rendering architectures that treat terminal output as normal document UI are non-ship for the terminal core; terminal output is a high-frequency mutable grid, and these approaches frequently correlate with flicker, scroll jumps, selection breakage, and input lag.
- `/document-style` terminal output, thread-coupled PTY parsing, document-level transcript mutation, and unstated failure-mode fallback are non-ship architecture patterns even when wrapped in `/features` language.
- Terminal core MUST center native screen/buffer state, diff-based painting, and off-UI-thread PTY/buffer work, including ingestion and processing, so rendering remains bounded and selection/input stay stable under high-frequency output.
- Avoid DOM, `/DOM-style`, or `/string-concatenation-style` render models, keep heavy work off the UI thread, throttle high-frequency updates, preserve `/scroll`, selection, cursor, and `/focus/attach` stability during huge-output bursts, and compute selection anchors, search hits, cursor coordinates, and wrapped-line navigation from terminal-model buffer state rather than from painted rows or recycled `/list` `/widgets`; app shell `/layout/chrome` and Slint-style host chrome do not own terminal `/engine` semantics or UI `/reconciliation` of terminal cells.
- Platform performance tests cover WSL, `/Windows/Wayland/macOS`, IME behavior, GPU fallback, `/PTY` resize/focus/attach paths, and `/compositing/scrolling`; GPU can help grid drawing, but it never rescues a weak terminal-model architecture.
- Observability MUST exist for lifecycle transitions, resize, focus, attach or detach, renderer failures, PTY and `/PTY` failures, performance counters, and structured session metadata.
- Terminal observability and failure-triage are first-class for users, PM developers, and support `/reconciliation` workflows collecting high-signal artifacts; diagnostic domains stay separate for PTY `/process` lifecycle, transport `/attach/detach/reconnect`, shell capability, transcript `/retention/pruning`, renderer `/compositor/performance`, clipboard `/IME/input/accessibility`, workspace restore, and windowing.
- structured-event recording includes session create, `/attach/ready/start-command/finish-command`, interrupt, `/terminate/kill`, detach, `/reattach/move-window`, resize, `/focus/visibility`, cwd/profile changes, renderer errors, shell-integration state changes, selection and clipboard failures, and capability fallback for `/render/integration` diagnostics.
- Terminal settings/diagnostics expose current renderer mode/fallback state, shell integration capability tier/source visibility, last restore outcome for the pane/session when relevant, transcript persistence availability/retention status, and recent terminal errors/events relevant to the current pane.
- Capability diagnostics show shell/profile identity when known, capability tier, which shell-integration features are authoritative versus unavailable/degraded, and when PM has fallen back from rich command metadata to plain transcript behavior.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- Terminal performance instrumentation includes PTY input/output throughput indicators, parser/buffer latency, frame/render timing, dropped/deferred paint counters, search latency on large retained transcript, and transcript flush/persist latency.
- PM can produce a terminal diagnostic bundle per pane/session/project on request. Bundle contents may include structured lifecycle/error events, renderer/capability/settings state, settings relevant to terminal behavior, and optional transcript excerpts only when explicitly included; support bundles clearly label transcript content as absent, partial, or included.
- Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".
- Repeated identical failures follow the alerting `/noise` rule and are coalesced in diagnostics rather than spamming banners/toasts/logs, while persistent degraded conditions remain inspectable without repeatedly interrupting the user.
- All major terminal subsystems emit typed events at state-transition boundaries, and diagnostic state is queryable per pane/session and project-wide without scraping rendered UI text.

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
- The PM built-in browser and click-to-context `/browser-interaction` topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into `websearch`, provider-routed `webfetch`, site/page reading intents, or Site Reader-only behavior.
- The promoted GUI consumes agent web research activity cards without re-owning tool routing or treating them as browser UI: cited web search stays transparent and source-linked in chat, `Searching Web: <query>` is the search/discovery label, `Reading Site: <url>` is reserved for PM-native Site Reader, Site Reader exposes `/detail-level` choices (`minimal`, `summary`, `full`), `/fetches` stay token-efficient and iframe-aware, `/observe` read paths remain separate from browser `/automation`, and `/free-tier` or provider-limit degradation is shown before offering unavailable web actions.
- PM's browser-session contract is capability-first: the selected runtime must provide cross-platform embedding for editor-tab and detached browser surfaces; offscreen rendering is secondary capture/render support, not the primary visible host.
- CEF wrappers such as `wef` are implementation candidates only. PM may enable that path only after the PM-owned packaging/update/install strategy is explicit.
- If the selected path uses an auto-downloaded CEF binary distribution via `cargo-wef`, requested/effective browser state must surface `runtime_unavailable` until the pinned binary is present, verified, and healthy.
- Browser click/highlight/share flow MUST use an explicit chip-based model: browser-derived context enters a thread only through visible, user-triggered chips, never through hidden automatic context injection.
- Browser capture is split into two browser-specific attachment paths: text selection creates `browser_selection_context`, and element pick creates `browser_element_context`.
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent` update explicit browser-session share state only; sharing a browser subject does not serialize page, selection, or element context unless a separate visible capture chip is created.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- PM's browser control-plane backlog MUST remain named-action based. Borrow-worthy action families include tab lifecycle (`list`, `create`, `select`, `close`), richer interactions (`hover`, `drag`, `select option`, `fill form`, `press key`, `navigate back`, resize), wait primitives (`wait for time`, `wait for text`, `wait for text disappearance`), dialog handling, file upload handling, storage inspection/control for cookies, `localStorage`, `sessionStorage`, and `storage-state` import/export, network state and request routing/mocking, trace/video capture for agent runs, page/PDF export, test-oriented verification actions, and locator generation.
- `Playwright MCP` remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as `browser_run_code` and `browser_evaluate` MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser `/test-debug` escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- DevTools model: embedded vs detached DevTools; who can open it, when, and agent/browser introspection flows are explicit. User-opened DevTools and agent introspection use named browser actions or advanced debug/testing paths; raw DevTools/CDP protocol scripting remains non-core and must disclose active browser-session capability state.
- screenshot-related labels and evidence/artifact actions remain user-facing named actions: browser screenshots, traces, and combined selection+screenshot captures use the same artifact pipeline as GUI automation, including naming, retention, manifest shape, chat rendering, privacy redaction rules, and runtime-artifact references. `/screenshot/devtools/automation` capabilities stay governed by named actions, artifact routing, permission disclosure, and requested/effective capability state.
- Persistence + isolation: browser history, cookies, storage, auth sessions, per-project isolation, restore eligibility, and crash recovery are explicit browser-session state. Normal browser sessions are project-scoped, while `automation_session` and `auth_session` remain isolated unless user-confirmed promotion or state copy changes profile/restore behavior.
- Runtime/process lifecycle: PM-managed browser helpers use a helper/subprocess layout with `/subprocess` startup, shutdown, crash detection, restart policy, sandboxing, and diagnostics surfaces. Failures surface as requested/effective runtime state instead of silent fallback.
- Distribution + runtime layout: per-platform runtime bundle layout, update rules, signature/hash verification with `/hash` evidence, and uninstall/removal behavior with `/removal` evidence are required for macOS, Linux, and Windows packages.
- Platform guarantee matrix: Linux/macOS/Windows guarantees are explicit; capability differences may be degraded-but-supported only when effective capability loss is disclosed before use.
- Permissions + safety: permission keys, trust tiers, agent-vs-user authority, auth/session sensitivity rules, and no-silent-fallback blocked semantics govern every browser action, storage/auth use, DevTools flow, and artifact capture.
- Commands + UI surfaces: inspect/screenshot/devtools/automation named actions expose exact browser chrome controls, status indicators, and activity disclosure for visible browsing, DevTools, auth, and automation; the promoted GUI may reveal those controls without re-owning the browser model.
- Acceptance criteria + test plan: scenario-driven criteria for local HTML preview, web app interaction, screenshots, DevTools, auth flow, crash recovery, restore, and cross-platform packaging cover the PM-managed CEF runtime, named actions, artifacts, permissions, and requested/effective degradation behavior.
- `Playwright MCP` attach-to-existing-browser flows are reference material for a possible future adopt existing session/state UX, including real-profile or `storage-state` import, but they do not change PM's design center away from a PM-owned built-in browser surface or convert `/local-browser`, `/browser-agent`, or `/mcp-browser-use` into product commands.
- `Chrome DevTools MCP` is reference material for live Chrome inspection/debugging, screenshots, console/network/performance insights, and control-plane/tool taxonomy; it is not PM's embedded browser foundation.
- `BrowserMCP/mcp` is reference material for real-profile/local-browser control, but it is not a direct dependency while it cannot be built standalone.
- `Saik0s/mcp-browser-use` is reference material for browser-use, browser-agent, task/observability/dashboard ideas, but its separate LLM/browser-agent loop is a poor core architecture for PM because PM's own agent must own reasoning/control directly.
- BrowserMCP, browser-use, Playwright MCP, Chrome DevTools MCP, and `chromiumoxide` remain tool/capability comparison inputs; they do not replace the hybrid/PM-owned browser contract or become the PM core architecture.
- Playwright MCP config types are reference material for PM's browser-session option model: persistent vs isolated profiles, `cdpEndpoint`, extension attach flows, snapshot modes, file-access controls, and output/session persistence knobs may inform requested/effective capability fields, but raw CDP endpoints or extension attach are not PM's default product foundation.
- Browser-session options include persistent profiles through `profile: { name: string, saveChanges: boolean }`; `saveChanges` determines whether cookies and localStorage are written back after the session so authenticated workflows can persist intentionally, while `/localStorage` slash notation remains lineage for the canonical `localStorage` storage field.
- Normal browser sessions are project-scoped persistent profile/store subjects: `workspace_preview` uses the project profile; `detached_preview` shares the originating `workspace_preview` profile/state unless explicitly opened as a separate browsing session; `automation_session` uses a separate ephemeral profile by default; and `auth_session` uses a separate isolated auth profile/store.
- Browser tab-cap handling is `no-silent-retargeting` / no LRU reuse: PM must prompt, block, explicitly close, or open detached rather than silently retargeting an existing browser subject.
- PM may borrow the Playwright MCP named action taxonomy as a reference shape: core automation, tab management, network controls, storage controls, devtools-style capture, coordinate fallback actions, PDF export, and testing / verification actions. The canonical PM surface remains named actions such as tab lifecycle `list/create/select/close` and wait primitives `wait for time/text/text disappearance`, not slash-like `/create/select/close`, `/visual`, `/text/text`, or `/control` product commands.
- Browser runtime direction keeps the browser `surface-class` taxonomy while replacing backend ambiguity with the PM-managed CEF runtime contract; Wry/hybrid approaches are comparison/background material rather than the default recommendation, Playwright, CDP, and MCP projects remain automation and control-plane inspiration rather than the core browser runtime, and the packaging/runtime cost is accepted as the trade for capability and reliability.
- Runtime comparison inputs such as OS webviews, Playwright/CDP sidecars, Rust-native CDP backends such as `chromiumoxide`, Wry/hybrid by browser surface/session class shells, and Chromium/Chrome-for-Testing first-run installation helpers remain background material; the canonical Chromium/CEF capability owner is the PM-managed CEF runtime, with any lighter than CEF or `no Chromium needed` claim treated as an explicit packaging/install/runtime tradeoff rather than proof that no Chromium-class runtime is unnecessary.
- Historical comparison labels such as Wry/OS-webview, CEF/Chromium, screenshots/DevTools/network/automation, browser/surface, /automation, /runtime, and /CDP are lineage shorthand; the live browser canon is the PM-managed CEF runtime plus named browser actions, requested/effective capability fields, and explicit degradation disclosure.
- The default browser bundle profile is a `mostly-full` CEF runtime with modest trimming; aggressively pruned bundles that sacrifice browser capabilities/features are nondefault and must surface requested/effective capability degradation before use.
- Legacy runtime comparison inputs `Wry`, `WebView2`, `WKWebView`, and `WebKitGTK` are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure `under-specified`, because degraded states are advertised through requested/effective browser capability fields, `runtime_unavailable`, and `/capability-degradation` before a feature is offered.
- Lightweight `site-reader` and `/web-fetch/read-webpage` flows remain web/read paths; they are distinct from the full interactive built-in browser, visible `automation_session`, and visible `/auth`/`auth_session` surfaces.
- The canonical browser action table schema uses these columns at minimum: `action_id`, `bucket`, `tier` (`guaranteed_everyday` or `advanced_debug_testing`), `permission_layer`, `allowed_session_classes`, `requested_capabilities`, `artifacts_emitted`, `degradation_or_blocking_behavior`, and `user_visible_entry_points`.
- Browser runtime output MUST separate structured page snapshots for actioning from screenshots for evidence/visual output. Action results may expose typed browser-output sections such as `Open tabs`, `Page state`, `Snapshot`, `New console messages`, `Modal state`, and `Downloads` rather than one flat opaque blob.

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
- auth sessions and automation sessions do not auto-resume or silently resume active work after restart
- `auth_session` must not auto-close on presumed success; PM cannot reliably infer completion across arbitrary sites, so completion is explicit user or provider/flow evidence rather than a hidden browser lifecycle guess.
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
- user-confirmed promotion from paused automation into normal browsing copies or promotes eligible browser state into the normal persistent profile/store, converts or reclassifies the visible automation browser as a normal browser tab/session, and changes future restore behavior because the session is no longer treated as automation; promotion or state copy must be an explicit user action, never a hidden side effect
- browser requested/effective runtime and capability state is stored as frozen runtime history rather than recomputed heuristically from current settings
- crash recovery preserves recoverable metadata and completed evidence artifacts when possible
- terminal restart or replacement creates a new `terminal_session_id`; restoring a historical pane never synthesizes that new identity automatically
- no browser or terminal session class may silently bleed storage into another profile scope
- Persistent profiles are scoped by profile name and project; `profile: { name: string, saveChanges: boolean }` never allows cookies or localStorage to bleed into another profile scope, and disabled `saveChanges` keeps the session isolated even when it began from a named profile.

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
- stale Persona/tier selectors from `Personas.md`, `Contracts_V0`, and `Contracts_V0.md`, such as `_persona_id` and `select_for_tier()`, as canonical promoted-shell fields; Section 15 consumers use requested/effective Persona identity and runtime owner scope instead.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Section15_MVP_Promoted_Features_Spec.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### SMPFS-001 - Section 15 Promoted Features Spec Source-Preserving PlanUnit

```yaml
plan_unit_id: SMPFS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Plans/Section15_MVP_Promoted_Features_Spec.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- Section 15 Promoted Features Spec
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Comma'
- 0. Scope and SSOT status
- 1. Canonical shell and surface model
- 1.1 Shell ownership
- 1.2 Persistent shell surfaces
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
- 1.3 Browser surface classes
- 1.3A Research session alignment
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
- Action tiers
- 1.4 Thread and session navigation
- 1.5 Thread usage surface
- 1.5.1 Assistant worktree integration
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md'
- 1.6 Dev-loop and terminal surface model
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- Terminal section, tab, pane, and session model
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- Cross-surface ownership and reveal rules
negative_constraints:
- 'Permission boundary: `webfetch formats: ["screenshot"]` and `webfetch formats: ["pdf"]` are capture-format requests and require `session_granted`; they must not auto-elevate silently from static fetch permission.'
- '- moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity'
- '- a `dev_session_id` is not a shell-session alias and MUST NOT be used where exact PTY continuity is required'
- '- Role hints MUST NOT override `terminal_session_id` ownership, actual pane runtime status, cwd/profile/runtime context of an already running session, explicit user labels, or explicit user default overrides.'
- '- Adjacent run/debug, IDE, remote, and `/workflow-heavy` systems may reference terminal state and `/workflows`, summarize or reveal Terminal, and expose TUI or emulator-style context, but they MUST NOT redefine terminal ownership or runtime identity. Debug Console is debugger-scoped, remote shell co'
- '- Adoption is explicit: PM may attach a terminal session to an existing `dev_session_id` when the user explicitly launches related workflow work there, and PM must not silently adopt arbitrary shell sessions into a dev session from weak heuristics.'
- '- `selection_active` (source shorthand `selection-active`) keeps copy and selection-adjustment terminal-owned; non-selection terminal actions must not clear active selection unless they inherently replace it.'
- '- PM-wide shortcuts require explicit scope and precedence handling; one keystroke MUST NOT trigger both a terminal action and an application action'
- '- Puppet Master MUST NOT fabricate exact command boundaries, command text, or success semantics when shell integration is weaker than the observed data supports'
- '- Command-block identity is transcript-oriented metadata, not rendered UI fragments: each block has `command_block_id`, owning `terminal_session_id`, monotonic ordinal, nullable `command_text`, nullable cwd, `block-start`/start_marker reference, `block-end`/end_marker reference, `started_at`, nullab'
- '- If pruning invalidates a command block''s backing output range, the block remains as partially-backed or metadata-only command metadata; raw-transcript-only actions degrade honestly with `/history-unavailable`, transcript `/search` operates only on retained raw transcript or `/scrollback`, command '
- '- Restore language must not blur live continuity with historical slot recovery: a `/restored` `/pane` can keep durable `terminal_session_id` metadata, labels, ratios, layout, and defaults while being metadata-only or `/review-limited` when transcript is missing, and continuity of the same live sessi'
- '- requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide'
- '- `dev_session_id` owns higher-level workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required'
- '- partial updates must not invent final totals before the platform reports them'
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell o
- '- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.'
- '- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and l'
- '- Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/rest'
- '- provider-routed fetch must not reuse the reserved native Site Reader identity.'
- '- The PM built-in browser and click-to-context `/browser-interaction` topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into `websear'
- '- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.'
compatibility_only_notes:
- '- The legacy marker `session_terminated_while_running` maps to the `session-end` closure path: `session_runtime` and `shell_integration` evidence beat any `transcript_heuristic`, and weak integration must keep `block-end`, command text, and copy-output confidence explicit.'
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell o
- '- All major terminal subsystems emit typed events at state-transition boundaries, and diagnostic state is queryable per pane/session and project-wide without scraping rendered UI text.'
- '- Legacy runtime comparison inputs `Wry`, `WebView2`, `WKWebView`, and `WebKitGTK` are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure `under-specified`, because degraded states are advertised through requested/effective browser cap'
stale_retired_dispositions:
- '- stale or degraded projections must `/revalidate` before mutating actions; read-only fallback uses explicit `/freshness`, `projection_freshness`, `projection_health`, pending-sync, and `degraded-copy` wording rather than vague uncertainty'
- '- stale Persona/tier selectors from `Personas.md`, `Contracts_V0`, and `Contracts_V0.md`, such as `_persona_id` and `select_for_tier()`, as canonical promoted-shell fields; Section 15 consumers use requested/effective Persona identity and runtime owner scope instead.'
owner_boundary_notes:
- '## 0. Scope and SSOT status'
- This document is the canonical owner for the promoted Section 15 feature set. It converts the former idea/backlog material into implementation-ready product and system requirements.
- This document is not the storage, command, permission, or widget SSOT. Those remain owned by their canonical subsystem plans and are reconciled to the requirements here.
- 'Section 15 packetization preserves the owner/consumer split: owner docs identified here are MUST CHANGE, while dependent consumer or /mirror docs are MUST RECONCILE so they stay aligned without becoming the primary feature owner.'
- '## 1. Canonical shell and surface model'
- '- editor-tab browser surface for canonical in-shell `workspace_preview` sessions'
- '- bottom-panel runtime surfaces: terminal, problems, output, debug console, ports, and optional browser-adjacent activity/evidence panes that do not own the canonical browsing session'
- '- no feature may depend on a floating transient overlay as its only canonical navigation model when the same information participates in persistence, restore, or multi-tab/window behavior'
- As a consumer of repaired /tool/routing semantics, `research-session` browser activity must keep `/browser-action` affordances aligned with the owner contracts in Tools, Permissions, and UI command routing rather than inventing a separate browser-action command family.
- 'Permission boundary: `webfetch formats: ["screenshot"]` and `webfetch formats: ["pdf"]` are capture-format requests and require `session_granted`; they must not auto-elevate silently from static fetch permission.'
- 'Canonical lifecycle rules:'
- '**Cross-owner worktree alignment:**'
- '- `Plans/GitHub_Integration.md` Source Control §A.1 uses accordion navigation rather than tabs, and §A.4 Worktrees rows are single-column expandable rows whose owner labels can expose run/tier/thread IDs; remote SSH worktree notes stay with GitHub Integration.'
- '- `chain-wizard-flexibility.md` keeps worktree policy conditional on run intent rather than globally uniform: isolated worktrees are the default for parallel or risky work, but wizard/chain flows may reuse or route worktrees when the owner docs declare that exception explicitly.'
- '**Non-MVP boundaries:** Section 15 registers the promoted feature but does not widen the owner scope: Assistant Chat W.17 remains the explicit non-goal owner for no arbitrary "Bind Existing" MVP, no unbind/merge undo, no per-merge command override, no worktree-scoped Changes section, no thread expor'
- Per-thread context detail uses one compact inspect/action entrypoint plus one canonical detailed surface.
- '- compact context rows use normalized workflow labels such as `Ask`, `Agent`, `Plan`, and `Deep Plan`; `Deep Plan` remains a distinct canonical `/workflow` identity rather than collapsing into plain `plan`'
- '- a detached usage pop-out is not the canonical model'
- The dev loop is shell-first and session-oriented. Terminal is the canonical interactive shell surface, and chat, output, problems, debug console, ports, and dev controls consume terminal or dev-session state instead of owning PTY state themselves.
- 'Terminal presentation vocabulary is explicit: the simple default is one visible bottom-docked section; `/docked` means a supported shell runtime zone, detached stays first-class, and `/editor-area` replacement is not a canonical terminal section target.'
- 'The shorthand `/tab/pane/session` means this owner split: terminal tab and pane identity own presentation and reveal targets, while terminal session identity owns exact PTY continuity; `/tab/workspace` is the tab-scoped workspace presentation context, not a substitute runtime.'
- '- Terminal shorthand such as `/tabs/panes`, `/reveal/move/rename/pin/close/detach/reattach`, `/close-tab`, `/reveal`, and `/transcript` maps to this owner split: workspace commands change presentation containers, while PTY transcript continuity stays with `terminal_session_id` unless an explicit `te'
- '- Adjacent run/debug, IDE, remote, and `/workflow-heavy` systems may reference terminal state and `/workflows`, summarize or reveal Terminal, and expose TUI or emulator-style context, but they MUST NOT redefine terminal ownership or runtime identity. Debug Console is debugger-scoped, remote shell co'
- Agent shell control consumes `Plans/Tools.md` `/tool` and `/policy` outcomes through the canonical terminal subsystem; normalized bash/tool outcomes feed terminal state rather than inventing parallel shell ownership.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `14af3d5908476634b4ede0f0747b7d037058aadcf9105813bb2bab9548f5e083`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Section15_MVP_Promoted_Features_Spec-S0001` through `Section15_MVP_Promoted_Features_Spec-S0050` are preserved in place and mapped in `coverage_map.jsonl` to `SMPFS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
