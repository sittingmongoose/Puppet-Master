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
- Multiple projects and /repos may run orchestration concurrently. Presented orchestration data is per-project, multi-account aware, and app-level only through shell aggregation; project status cards stay project-scoped, and project differences such as settings, /themes/snapshots/etc, /storage, /provider state, and worktree inventory do not leak across project boundaries. Orchestrator shell references consume the current seven-tab structure (`Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`) from `Plans/Orchestrator_Page.md`; this promoted-feature registration does not re-open or weaken that shell.
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

### SMPFS-002 - Section 15 Authority And Owner Boundary

```yaml
plan_unit_id: SMPFS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Section 15 owns promoted-feature shell and surface behavior while storage, command, permission, tool, usage, FileManager, and widget SSOTs remain canonical subsystem owners through ContractRefs and owner/consumer boundaries.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- SP-001
- T-001
- UCC-001
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-002 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: standard
context_scope: section15_authority
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: section15_authority_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0002
preserved_exact_tokens:
- Section 15 Promoted Features Spec
- 0. Scope and SSOT status
- Puppet Master MVP GUI plan addendum
- SSOT
- must not redefine their persistence schemas or command catalogs
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/usage-feature.md
- Plans/FileManager.md
```

### SMPFS-003 - Workspace-Tab Shell Ownership

```yaml
plan_unit_id: SMPFS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'The app shell is workspace-tab based: each workspace tab owns one active project, project switching is a workspace-tab concern rather than a title-bar project bar, and background, blocked, or failed activity remains visible through persistent shell regions.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-003 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_ownership_drift
reasoning_tier: standard
context_scope: workspace_tab_shell
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_tab_shell_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0004
preserved_exact_tokens:
- 1. Canonical shell and surface model
- 1.1 Shell ownership
- workspace tab
- one active project
- Title bar
- background/blocked/failed activity
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Wiring_Matrix.md
```

### SMPFS-004 - Persistent Shell Surface Inventory

```yaml
plan_unit_id: SMPFS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Persistent shell surfaces include primary in-window and secondary detached surfaces, preserving workspace preview, detached preview, terminal, browser, DevTools, compare/review, and related shell-region identities.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-004 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: surface_inventory_drift
reasoning_tier: standard
context_scope: persistent_shell_surfaces
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: persistent_shell_surface_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
preserved_exact_tokens:
- 1.2 Persistent shell surfaces
- workspace_preview
- detached_preview
- terminal
- browser
- DevTools
- compare/review
- primary in-window surfaces
- secondary detached surfaces
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-005 - Shell Surface Hosting Constraints

```yaml
plan_unit_id: SMPFS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser and HTML preview are editor or workspace-tab first; the bottom panel is not the canonical browser host, and no promoted feature may depend only on floating transient overlays for navigation, review, or activity state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-005 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: surface_hosting_drift
reasoning_tier: standard
context_scope: persistent_shell_surfaces
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_surface_hosting_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
preserved_exact_tokens:
- browser
- HTML preview
- editor-area or workspace-tab first
- bottom panel is not the canonical browser host
- floating/transient overlays
negative_constraints:
- No feature may depend only on floating/transient overlays for state that must survive navigation, review, or background activity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Wiring_Matrix.md
```

### SMPFS-006 - Research Session Runtime Class

```yaml
plan_unit_id: SMPFS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: A research_session is a restricted automation_session that shares browser/runtime infrastructure while enforcing tighter lifecycle, profile isolation, blocked-state visibility, and no implicit takeover of normal browsing.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-006 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_runtime_scope_drift
reasoning_tier: standard
context_scope: research_session_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_session_runtime_class
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
preserved_exact_tokens:
- 1.3 Browser surface classes
- 1.3A Research session alignment
- research_session
- automation_session
- browser/runtime infrastructure
- profile isolation
- blocked-state visibility
negative_constraints:
- Research sessions are not a replacement for normal browser tabs and must not silently take over persistent browsing state.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-007 - Research Browser Affordance Alignment

```yaml
plan_unit_id: SMPFS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research-session browser-action affordances consume Tools, Permissions, and UI command routing; restoring or revealing a blocked/stopped research surface returns stopped with attention_required rather than silently escalating or promoting automation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-007 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_affordance_drift
reasoning_tier: standard
context_scope: research_session_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_browser_affordance_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
preserved_exact_tokens:
- research-session
- /browser-action
- stopped
- attention_required
- session_granted
- Tools
- Permissions
- UI command routing
negative_constraints:
- Research browser restore must not silently escalate permissions or convert a restricted automation session into normal browsing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-008 - Research Action Tiers And Evidence

```yaml
plan_unit_id: SMPFS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research action tiers preserve the 15-action list, excluded action categories, annotation payloads, evidence/citation behavior, and capture-format permission boundaries including session_granted for screenshot and PDF requests.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-008 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_action_permission_drift
reasoning_tier: standard
context_scope: research_action_tiers
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_action_tiers_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
preserved_exact_tokens:
- Action tiers
- webfetch
- webextract
- webresearch
- session_granted
- screenshot
- pdf
- annotation payload
- 15-action
negative_constraints:
- webfetch screenshot and pdf capture-format requests require session_granted and must not auto-elevate silently from static fetch permission.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-009 - Research Lifecycle Boundaries

```yaml
plan_unit_id: SMPFS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research session creation is implicit only for webfetch/webextract actions or webresearch fallback, remains transient unless explicitly escalated, and has no hidden takeover, promotion, or normal-browser persistence side effect.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-009 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_lifecycle_drift
reasoning_tier: standard
context_scope: research_action_tiers
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_lifecycle_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
preserved_exact_tokens:
- webfetch
- webextract
- webresearch
- fallback
- transient
- takeover
- promotion
- explicit automation escalation
negative_constraints:
- Research sessions must not silently promote, persist, or take over normal browsing state.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-010 - Thread And Session Navigation Persistence

```yaml
plan_unit_id: SMPFS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Thread and session navigation is persistent sidebar or shell-region behavior, preserving background progress, blocked/error badges, attention surfaces, restore-and-branch lineage, and usage access without reviving floating-thread-selector canon.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-010 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thread_navigation_drift
reasoning_tier: standard
context_scope: thread_session_navigation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: thread_session_navigation_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0010
preserved_exact_tokens:
- 1.4 Thread and session navigation
- 1.5 Thread usage surface
- sidebar
- persistent shell region
- blocked/error badges
- restore then fork
- usage
negative_constraints:
- Floating thread-selector overlay is not the canonical thread navigation model.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Detached usage pop-out remains non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-011 - Assistant Worktree Surface Points

```yaml
plan_unit_id: SMPFS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Assistant worktrees are an MVP per-project setting surfaced through chat header, thread selector icon, Source Control accordion, breadcrumb toggle, settings, and merge/test affordances without hiding project/worktree state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
- W-001
unblocks: []
acceptance_criteria:
- SMPFS-011 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_surface_drift
reasoning_tier: standard
context_scope: assistant_worktree_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: assistant_worktree_surface_points
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- Assistant worktree integration
- per-project setting
- chat header
- thread selector icon
- Source Control accordion
- breadcrumb toggle
- merge/test
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/WorktreeGitImprovement.md
```

### SMPFS-012 - Worktree Cross-Owner Boundaries

```yaml
plan_unit_id: SMPFS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Assistant worktree integration preserves GitHub Integration, WorktreeGitImprovement, FinalGUISpec, Orchestrator/Source Control, and chain-wizard owner splits, consumes the current seven-tab Orchestrator shell from Orchestrator_Page, and keeps Non-MVP exclusions from becoming implicit MVP behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-012 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_owner_boundary_drift
reasoning_tier: standard
context_scope: assistant_worktree_owner_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: worktree_cross_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- GitHub Integration
- WorktreeGitImprovement
- FinalGUISpec
- Orchestrator
- Source Control
- chain wizard
- Non-MVP
negative_constraints:
- Section 15 must not redefine Source Control, GitHub Integration, or chain-wizard ownership while exposing worktree surfaces.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
```

### SMPFS-013 - Thread Context Detail Usage Surface

```yaml
plan_unit_id: SMPFS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Thread context detail preserves the active-thread context indicator, compact rows, Deep Plan, usage/tokens/cost hover, Compact Now, and editor-tab Context Detail Pane while rejecting a detached usage pop-out as canonical.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-013 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thread_usage_surface_drift
reasoning_tier: standard
context_scope: thread_usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: thread_context_detail_usage_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- active-thread context indicator
- compact rows
- Deep Plan
- usage/tokens/cost hover
- Compact Now
- Context Detail Pane
- detached usage pop-out
negative_constraints:
- Detached usage pop-out is not the canonical per-thread usage surface.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-014 - Terminal Surface Model

```yaml
plan_unit_id: SMPFS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The terminal is the canonical interactive shell surface with up to two terminal sections, tab and pane layout families, bottom-default placement, detach/move/resize behavior, labels, and settings vocabulary.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-014 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_surface_drift
reasoning_tier: standard
context_scope: terminal_surface_model
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_surface_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0012
preserved_exact_tokens:
- 1.6 Dev-loop and terminal surface model
- canonical interactive shell
- up to two terminal sections
- tabs
- panes
- bottom default
- detach
- move/resize
- labels
- settings
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
```

### SMPFS-015 - Terminal Runtime Identity Contract

```yaml
plan_unit_id: SMPFS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal runtime identity preserves terminal_section_id, terminal_tab_id, terminal_pane_id, terminal_session_id, and dev_session_id owner splits; presentation changes must not mint runtime identity and dev_session_id is not a shell-session alias.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-015 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_identity_drift
reasoning_tier: standard
context_scope: terminal_runtime_identity
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_runtime_identity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
preserved_exact_tokens:
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- same terminal session
- runtime identity
negative_constraints:
- Moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity.
- A dev_session_id is not a shell-session alias and MUST NOT be used where exact PTY continuity is required.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-016 - Terminal Presentation Containers

```yaml
plan_unit_id: SMPFS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal presentation containers preserve labels, roles, settings precedence, tab/pane motion, reveal/move/rename/pin/close/detach/reattach behavior, and requested/effective disclosure without changing runtime identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-016 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_presentation_drift
reasoning_tier: standard
context_scope: terminal_presentation_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_presentation_containers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
preserved_exact_tokens:
- Terminal section, tab, pane, and session model
- labels
- roles
- settings precedence
- reveal
- move
- rename
- pin
- close
- detach
- reattach
- requested/effective
negative_constraints:
- Role hints MUST NOT override terminal_session_id ownership, actual pane runtime status, cwd/profile/runtime context of an already running session, explicit user labels, or explicit user default overrides.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-017 - Terminal Reveal Ownership

```yaml
plan_unit_id: SMPFS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal reveal existing sessions first, historical state shows transcript or recovery state, and only explicit new/split/restart actions mint a new terminal runtime identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-017 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_reveal_drift
reasoning_tier: standard
context_scope: terminal_reveal_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_reveal_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
preserved_exact_tokens:
- Cross-surface ownership and reveal rules
- Open in Terminal
- Show Terminal
- existing terminal sessions
- historical state
- new/split/restart
- terminal_session_id
negative_constraints:
- Adjacent run/debug, IDE, remote, and workflow-heavy systems may reference or reveal Terminal, but they MUST NOT redefine terminal ownership or runtime identity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-018 - Dev-Session Linkback And Adoption

```yaml
plan_unit_id: SMPFS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Derived artifacts preserve terminal_session_id and dev_session_id linkbacks; adoption into a dev session is explicit and must never silently attach arbitrary shell sessions from weak heuristics.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-018 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dev_session_adoption_drift
reasoning_tier: standard
context_scope: dev_session_linkback
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: dev_session_linkback_adoption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
preserved_exact_tokens:
- terminal_session_id
- dev_session_id
- derived artifacts
- adoption is explicit
- weak heuristics
negative_constraints:
- PM must not silently adopt arbitrary shell sessions into a dev session from weak heuristics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-019 - Terminal Interaction Mode State Machine

```yaml
plan_unit_id: SMPFS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal interaction modes preserve live_input, scrollback_review, selection_active, search_active, tui_capture, shortcut precedence, PTY/TUI ownership, and accessible state disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-019 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_interaction_state_drift
reasoning_tier: standard
context_scope: terminal_interaction_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_interaction_mode_state_machine
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
preserved_exact_tokens:
- Interaction modes and selection semantics
- live_input
- scrollback_review
- selection_active
- search_active
- tui_capture
- PTY
- TUI
- shortcut precedence
negative_constraints:
- One keystroke MUST NOT trigger both a terminal action and an application action.
- Selection-active keeps copy and selection-adjustment terminal-owned; non-selection terminal actions must not clear active selection unless they inherently replace it.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/Permissions_System.md
```

### SMPFS-020 - Terminal Selection Copy Search Semantics

```yaml
plan_unit_id: SMPFS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal selection, copy, paste, and search semantics preserve linear selection, logical wrapped-line copy, live/review copy behavior, active-owner paste, TUI override paths, search/review transitions, and unicode/grapheme integrity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-020 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_selection_drift
reasoning_tier: standard
context_scope: terminal_interaction_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_selection_copy_search_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
preserved_exact_tokens:
- linear selection
- logical wrapped-line copy
- live/review copy
- active-owner paste
- TUI override
- search
- unicode
- grapheme
negative_constraints:
- Terminal copy/paste/search behavior must not double-trigger app-wide actions or silently discard active terminal selection state.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
```

### SMPFS-021 - Shell Integration Confidence

```yaml
plan_unit_id: SMPFS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Shell integration confidence tiers rich, basic, and opaque constrain command-boundary claims; Puppet Master must not fabricate command text, success, block markers, exact boundaries, or exit status beyond observed data.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-021 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_integration_fabrication
reasoning_tier: standard
context_scope: shell_integration_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_integration_confidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- Command-block and shell-integration rules
- rich
- basic
- opaque
- command boundaries
- command text
- success semantics
- exit status
negative_constraints:
- Puppet Master MUST NOT fabricate exact command boundaries, command text, success semantics, block markers, or exit status when shell integration is weaker than the observed data supports.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
```

### SMPFS-022 - Command Block Identity Metadata

```yaml
plan_unit_id: SMPFS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Command blocks are transcript-oriented metadata with command_block_id, terminal_session_id ownership, lifecycle states, marker references, nullable command/cwd/exit fields, confidence, and compatibility mapping from session_terminated_while_running to session-end.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-022 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_block_identity_drift
reasoning_tier: standard
context_scope: command_block_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_block_identity_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- command_block_id
- terminal_session_id
- block-start
- block-end
- session_terminated_while_running
- session-end
- confidence
- nullable cwd
negative_constraints:
- Command-block identity is transcript-oriented metadata, not rendered UI fragments.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md'
compatibility_only_notes:
- session_terminated_while_running maps to session-end compatibility vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-023 - Command Review Retention Degradation

```yaml
plan_unit_id: SMPFS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Command review surfaces, cards, navigation, and sticky headers degrade honestly when transcript retention is pruned; restored panes restore structure and recent transcript first and reconnect only when runtime support exists.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-023 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_review_degradation_drift
reasoning_tier: standard
context_scope: command_review_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_review_retention_degradation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- command cards
- navigation
- sticky headers
- history-unavailable
- scrollback
- retained raw transcript
- restored panes
- reconnect
negative_constraints:
- If pruning invalidates backing output, raw-transcript-only actions degrade honestly rather than fabricating history.
- Restore language must not blur live continuity with historical slot recovery.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes: []
stale_retired_dispositions:
- degraded-copy and history-unavailable wording remains live degradation vocabulary, not vague uncertainty.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Run_Modes.md
```

### SMPFS-024 - Terminal Session Lifecycle Actions

```yaml
plan_unit_id: SMPFS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal lifecycle preserves session states and actions including clear_scrollback, restart_session, terminate_session, kill_session, close-vs-terminate distinction, pre-run safety, and user-visible lifecycle disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-024 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_lifecycle_drift
reasoning_tier: standard
context_scope: terminal_lifecycle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_session_lifecycle_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
preserved_exact_tokens:
- Session lifecycle and user-visible actions
- clear_scrollback
- restart_session
- terminate_session
- kill_session
- close vs terminate
- pre-run safety
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Run_Modes.md
```

### SMPFS-025 - Terminal Status Attention Close Ladder

```yaml
plan_unit_id: SMPFS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal section, tab, and pane statuses preserve runtime states, attention flags, hidden-output semantics, relaunch/review affordances, and the close/interrupt/terminate/kill ladder.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-025 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_attention_drift
reasoning_tier: standard
context_scope: terminal_lifecycle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_status_attention_close_ladder
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
preserved_exact_tokens:
- section/tab/pane states
- running
- blocked
- exited
- attention flags
- hidden output
- relaunch
- review
- interrupt
- terminate
- kill
negative_constraints:
- Close, interrupt, terminate, and kill must remain distinct user-visible actions with honest consequences.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-026 - Terminal Empty State And Restore Language

```yaml
plan_unit_id: SMPFS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal empty-state and first-run language preserves Start Terminal, linked-surface activation, historical banners, runtime-vs-settings boundaries, restored_without_history, and no live-continuity blur.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-026 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_language_drift
reasoning_tier: standard
context_scope: terminal_empty_state_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_empty_state_restore_language
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0018
preserved_exact_tokens:
- Empty-state and first-run rules
- Start Terminal
- linked-surface activation
- historical banners
- runtime vs settings
- restored_without_history
negative_constraints:
- Restore language must not imply live continuity when only metadata or limited review state was restored.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/storage-plan.md
```

### SMPFS-027 - Requested Vs Effective Runtime Contract

```yaml
plan_unit_id: SMPFS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Requested/effective state is one cross-feature runtime model spanning terminal, browser, provider, tool, project runtime, MCP/tool availability, remote/local surfaces, and project switching.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-027 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_drift
reasoning_tier: standard
context_scope: requested_effective_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: requested_effective_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
preserved_exact_tokens:
- 2. Cross-feature runtime contracts
- 2.1 Requested vs effective state
- requested
- effective
- terminal
- browser
- provider
- tool
- MCP
- remote/local
negative_constraints:
- Requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-028 - Requested Vs Effective Disclosure Freshness

```yaml
plan_unit_id: SMPFS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Differences between requested and effective state must be visible; stale or degraded projections must revalidate before mutating actions and disclose freshness, projection_health, pending-sync, and degraded-copy wording honestly.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-028 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: freshness_disclosure_drift
reasoning_tier: standard
context_scope: requested_effective_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: requested_effective_disclosure_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
preserved_exact_tokens:
- differences between requested and effective
- /revalidate
- /freshness
- projection_freshness
- projection_health
- pending-sync
- degraded-copy
negative_constraints:
- The UI must not imply unsupported terminal, browser, provider, or shell capability.
- Stale or degraded projections must /revalidate before mutating actions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- stale or degraded projections are live freshness/revalidation vocabulary, not retired prose.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-029 - Stable Promoted Identity Catalog

```yaml
plan_unit_id: SMPFS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Section 15 preserves the promoted stable identity catalog from project_id through automation_session_id, with path alone insufficient for project restore semantics and shell/container identities distinct from target_kind route classes.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-029 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: identity_catalog_drift
reasoning_tier: standard
context_scope: promoted_identity_catalog
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: stable_promoted_identity_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
preserved_exact_tokens:
- project_id
- workspace_tab_id
- window_id
- thread_id
- branch_id
- browser_tab_id
- preview_session_id
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- automation_session_id
- target_kind
negative_constraints:
- A path alone is not a sufficient identity for project restore semantics.
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
```

### SMPFS-030 - Identity-Aware Reveal And Runtime Boundaries

```yaml
plan_unit_id: SMPFS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Terminal and browser reveal behavior preserves presentation continuity, exact PTY continuity, and workflow continuity boundaries: terminal_section_id, terminal_tab_id, and terminal_pane_id own shell presentation/reveal targets, terminal_session_id owns exact PTY continuity, and dev_session_id owns workflow continuity without replacing shell identity.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-030 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: identity_reveal_boundary_drift
reasoning_tier: standard
context_scope: promoted_identity_reveal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: identity_aware_reveal_runtime_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
preserved_exact_tokens:
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- Open in Terminal
- Show Terminal
- New Terminal
- explicit split
- explicit restart
- route_target
- OpenSubject
- OpenFile
negative_constraints:
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required.
- Moving, renaming, pinning, docking, or detaching sections, tabs, and panes are presentation changes only and do not mint new PTY identity.
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FileManager.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-031 - Background And Blocked Attention Routing

```yaml
plan_unit_id: SMPFS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Background and blocked work routes through durable attention items that preserve owner, reason, route payload, projection trust, and resume_url transport while History, Progress/Dashboard, chat/thread, and system notifications keep distinct attention purposes.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-031 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attention_routing_drift
reasoning_tier: standard
context_scope: attention_routing
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: background_blocked_attention_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
preserved_exact_tokens:
- project_state:v1:{project_id}
- project_state
- resume_url
- History
- Progress / Dashboard
- /chat
- /thread
- projection trust
- Ledger
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-032 - Attention Surfaces And Project Badges

```yaml
plan_unit_id: SMPFS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Background activity, blocked episodes, action-needed states, attention-center rows, project-card badges, title-bar attention badges, command-palette resume/fix entries, and /fix routes normalize into visible canonical attention surfaces instead of unrelated UI hints.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-032 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attention_surface_drift
reasoning_tier: standard
context_scope: attention_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: attention_surfaces_project_badges
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
preserved_exact_tokens:
- project-attention
- attention center
- project-card badges
- title-bar attention badges
- command-palette "resume/fix"
- /fix
- wizard cards
- thread badges
- dashboard CtAs
- blocked-node lists
- auth badges
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-033 - FileSafe Blocked Outcome Semantics

```yaml
plan_unit_id: SMPFS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: FileSafe dangerous-command blocks are first-class blocked outcomes, and rerun after destructive blocks respects restore-before-rerun requirements when local work or safe-point rules require them.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-033 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_block_semantics_drift
reasoning_tier: standard
context_scope: filesafe_blocking
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: filesafe_blocked_outcome_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
preserved_exact_tokens:
- Dangerous-Command Blocking (FileSafe)
- FileSafe blocks
- blocked outcomes
- rerun
- restore-before-rerun
- safe-point
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-034 - FileSafe Visible Blocked UI

```yaml
plan_unit_id: SMPFS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Blocked commands render visible blocked UI in thread, terminal/output surfaces, and action-needed routing, and the feature cannot rely on terminal-only messaging.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-034 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_block_ui_drift
reasoning_tier: standard
context_scope: filesafe_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: filesafe_visible_blocked_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
preserved_exact_tokens:
- blocked UI
- thread
- terminal/output surfaces
- action-needed routing
- terminal-only messaging
negative_constraints:
- The feature does not rely on terminal-only messaging.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-035 - Branch Restore Boundary And Lineage

```yaml
plan_unit_id: SMPFS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Branching conversations always start from a restore point or equivalent preserved state boundary, create a new thread/session identity linked to the source branch and restore point, and leave the source thread intact.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-035 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: branch_restore_lineage_drift
reasoning_tier: standard
context_scope: branching_conversations
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: branch_restore_boundary_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
preserved_exact_tokens:
- Branching Conversations (Restore Then Fork)
- restore point
- preserved state boundary
- new thread/session identity
- source branch
- source thread remains intact
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
```

### SMPFS-036 - Branch Navigation And Confirmation UI

```yaml
plan_unit_id: SMPFS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Branch labels, source-origin lineage, branch origin time, and dirty or active thread confirmation are visible in history and navigation surfaces before branching from risky source state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-036 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: branch_navigation_ui_drift
reasoning_tier: standard
context_scope: branching_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: branch_navigation_confirmation_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
preserved_exact_tokens:
- branch labels
- source-origin lineage
- branch origin time
- history/navigation surfaces
- dirty or active thread
- confirmation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-037 - Project Instructions Runtime Source Boundary

```yaml
plan_unit_id: SMPFS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The in-app project instructions editor writes the same AGENTS-style guidance, project rules, or equivalent instruction files that the runtime consumes, without creating a shadow runtime source.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-037 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instructions_source_boundary_drift
reasoning_tier: standard
context_scope: project_instructions
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_instructions_runtime_source_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
preserved_exact_tokens:
- In-App Project Instructions Editor
- project-rules/instruction files
- AGENTS-style guidance
- project rules
- shadow runtime source
negative_constraints:
- Editing AGENTS-style guidance, project rules, or equivalent instruction files cannot create a shadow runtime source.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-038 - Project Instructions Editor UI

```yaml
plan_unit_id: SMPFS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project instructions editor exposes path, scope, validation or lint feedback, and dirty state for runtime-consumed instruction files.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-038 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instructions_editor_ui_drift
reasoning_tier: standard
context_scope: project_instructions_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_instructions_editor_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
preserved_exact_tokens:
- path
- scope
- validation/lint feedback
- dirty state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-039 - Mention Picker Sources

```yaml
plan_unit_id: SMPFS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The @ mention picker is rooted in the active project context and supports recent files, modified files, symbol-aware results when available, folder navigation, and Assistant plus Interview chat surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-039 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mention_picker_source_drift
reasoning_tier: standard
context_scope: mention_picker_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mention_picker_sources
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
preserved_exact_tokens:
- '@'
- active project context
- recent files
- modified files
- symbol-aware results
- folder navigation
- Assistant
- Interview chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-040 - Mention Result Identity

```yaml
plan_unit_id: SMPFS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Mention results preserve the identity required by prompt assembly and click-to-open behavior across Assistant and Interview chat surfaces.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-040 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mention_identity_drift
reasoning_tier: standard
context_scope: mention_identity
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mention_result_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
preserved_exact_tokens:
- mention result
- prompt assembly
- click-to-open behavior
- Assistant
- Interview chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-041 - Stream Timing Identity

```yaml
plan_unit_id: SMPFS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Stream timing is tied to canonical assistant message or run identity and can be aggregated later without recomputing from rendered text.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-041 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: stream_timing_identity_drift
reasoning_tier: standard
context_scope: stream_timing
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: stream_timing_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
preserved_exact_tokens:
- Stream Timers and Segment Durations
- assistant turn/segment
- event stream
- canonical message/run identity
- aggregated later
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-042 - Lightweight Timer UI

```yaml
plan_unit_id: SMPFS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Timer UI remains lightweight, visible per assistant turn or segment when supported, and must avoid reflow or flicker in long threads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-042 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: timer_ui_drift
reasoning_tier: standard
context_scope: stream_timing_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: lightweight_timer_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
preserved_exact_tokens:
- timer UI
- lightweight
- reflow/flicker
- long threads
negative_constraints:
- Timer UI must remain lightweight and not cause reflow/flicker in long threads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-043 - Interleaved Thinking Toggle

```yaml
plan_unit_id: SMPFS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The interleaved thinking toggle is thread-local unless another owner broadens scope, shows requested state and effective provider behavior when exact honoring is unavailable, and prevents provider-specific naming from leaking into canonical user copy.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-043 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thinking_toggle_drift
reasoning_tier: standard
context_scope: thinking_toggle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: interleaved_thinking_toggle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0029
preserved_exact_tokens:
- Interleaved Thinking Toggle
- thread-local
- requested state
- effective provider behavior
- provider-specific naming
- canonical user copy
negative_constraints:
- The feature cannot rely on provider-specific naming leaking into canonical user copy.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-044 - MCP Capability Resolution

```yaml
plan_unit_id: SMPFS-044
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP support is host-managed capability resolution with project-, Persona-, and permission-aware effective tool availability, and unhealthy servers never produce silent success-shaped fallback.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-044 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_capability_drift
reasoning_tier: standard
context_scope: mcp_capability
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_capability_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
preserved_exact_tokens:
- MCP Support
- host-managed capability resolution
- project-
- Persona-
- permission-aware
- effective MCP tool availability
- unhealthy MCP servers
negative_constraints:
- Unhealthy MCP servers never produce silent success-shaped fallback.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-045 - MCP Management UI

```yaml
plan_unit_id: SMPFS-045
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP server configuration, enable/disable, test connection, and runtime health are first-class UI behaviors rather than config passthrough only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-045 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_management_ui_drift
reasoning_tier: standard
context_scope: mcp_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_management_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
preserved_exact_tokens:
- server configuration
- enable/disable
- test connection
- runtime health
- first-class UI behaviors
- config passthrough only
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-046 - Project Session Browser Data Scope

```yaml
plan_unit_id: SMPFS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project/session browser spans projects plus per-project sessions, runs, and threads while active-thread navigation remains directly available in chat.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-046 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_session_browser_scope_drift
reasoning_tier: standard
context_scope: project_session_browser
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_session_browser_data_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
preserved_exact_tokens:
- Project and Session Browser
- projects
- per-project sessions/runs/threads
- active-thread navigation
- chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-047 - Project Session Browser Surface

```yaml
plan_unit_id: SMPFS-047
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project/session browser is a real shell surface with empty states, search and filter behavior, row actions, badges, and responsive collapse behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-047 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_session_browser_ui_drift
reasoning_tier: standard
context_scope: project_session_browser_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_session_browser_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
preserved_exact_tokens:
- real shell surface
- empty states
- search/filter behavior
- row actions
- badges
- responsive collapse behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-048 - Streaming Usage Payloads

```yaml
plan_unit_id: SMPFS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Mid-stream token/context updates preserve provisional stream usage payloads with session_id, response, per-model API totals, and token totals including prompt, total, cached, thoughts, and tool until final provider usage closes the turn.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-048 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: streaming_usage_payload_drift
reasoning_tier: standard
context_scope: streaming_usage
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: streaming_usage_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
preserved_exact_tokens:
- session_id
- response
- per-model API totals
- prompt
- total
- cached
- thoughts
- tool
- provisional
- final provider usage event
negative_constraints:
- Partial updates must not invent final totals before the platform reports them.
- partial updates must not invent final totals before the platform reports them
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/storage-plan.md
```

### SMPFS-049 - Streaming Context Usage UI

```yaml
plan_unit_id: SMPFS-049
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Context and usage indicators may update during streaming with stable updating/streaming states, and final per-thread context and usage lands in the canonical Context Detail Pane used outside streaming.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-049 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: streaming_usage_ui_drift
reasoning_tier: standard
context_scope: streaming_usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: streaming_context_usage_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
preserved_exact_tokens:
- context and usage indicators
- updating
- streaming
- Context Detail Pane
- outside streaming
negative_constraints:
- The user sees stable in-progress states such as updating or streaming rather than flickering totals.
- partial updates must not invent final totals before the platform reports them
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/storage-plan.md
```

### SMPFS-050 - Workspace Tab Window Identity

```yaml
plan_unit_id: SMPFS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Workspace tabs are first-class identities that persist order, active tab, per-tab project identity, and local shell state across supported windows.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-050 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: workspace_tab_identity_drift
reasoning_tier: standard
context_scope: workspace_tabs
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_tab_window_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
preserved_exact_tokens:
- workspace tabs
- persist order
- active tab
- per-tab project identity
- local shell state
- windows
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-051 - Multi-Window Close Fallback Behavior

```yaml
plan_unit_id: SMPFS-051
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Multi-window behavior defines deterministic drag/fallback behavior and close handling for dirty editors, running dev sessions, active terminals, and detached children.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-051 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: multiwindow_close_ui_drift
reasoning_tier: standard
context_scope: multiwindow_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: multi_window_close_fallback_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
preserved_exact_tokens:
- drag-between-window support
- fallback behavior
- close behavior
- dirty editors
- running dev sessions
- active terminals
- detached children
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-052 - Virtualized Conversation Log Lists

```yaml
plan_unit_id: SMPFS-052
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Long chat and runtime lists use virtualization while preserving keyboard navigation, focus recovery, anchor-to-message behavior, sticky status elements, selection, and search result navigation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-052 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: virtualized_list_drift
reasoning_tier: standard
context_scope: virtualized_lists_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: virtualized_conversation_log_lists
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0034
preserved_exact_tokens:
- Virtualized Conversation or Log List
- keyboard navigation
- focus recovery
- anchor-to-message
- sticky status elements
- selection
- search results navigation
negative_constraints:
- Virtualization cannot break sticky status elements, selection, or search results navigation.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-053 - Normalized Usage Contract

```yaml
plan_unit_id: SMPFS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: App-wide Usage and the thread-scoped Context Detail Pane share one normalized usage contract, and cost_usage artifacts deep-link into canonical Usage/Ledger surfaces rather than artifact-local models.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-001
- ACD-008
- RAP-024
unblocks: []
acceptance_criteria:
- SMPFS-053 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_contract_drift
reasoning_tier: standard
context_scope: usage_contract
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: normalized_usage_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
preserved_exact_tokens:
- Know Where Your Tokens Go
- Usage
- Context Detail Pane
- normalized usage contract
- cost_usage
- Usage/Ledger surfaces
- artifact-local model
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
- Plans/Runtime_Artifacts_Panel.md
```

### SMPFS-054 - Token Cost Attribution Framing

```yaml
plan_unit_id: SMPFS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Token and cost framing makes per-thread, per-run, and per-model attribution explainable without duplicating data sources.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-054 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_framing_ui_drift
reasoning_tier: standard
context_scope: usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: token_cost_attribution_framing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
preserved_exact_tokens:
- token and cost framing
- per-thread
- per-run
- per-model attribution
- duplicating data sources
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
```

### SMPFS-055 - Catalog Lifecycle Semantics

```yaml
plan_unit_id: SMPFS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Catalog install, update, and remove flows are lifecycle-aware for commands, skills, plugins/hooks, themes, and MCP configs, with update/remove behavior explicit for active or referenced items.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-055 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_lifecycle_drift
reasoning_tier: standard
context_scope: catalog_lifecycle
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: catalog_lifecycle_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
preserved_exact_tokens:
- One-Click Install
- commands
- agents
- hooks
- skills
- plugins/hooks
- themes
- MCP configs
- blocked
- deferred-until-next-load
- immediate effect
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-056 - Catalog Management UI

```yaml
plan_unit_id: SMPFS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The catalog is not install-only; steady-state management, apply-later behavior, and active/referenced item outcomes are part of MVP UI behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-056 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_management_ui_drift
reasoning_tier: standard
context_scope: catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: catalog_management_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
preserved_exact_tokens:
- catalog
- install/update/remove
- enable
- disable
- apply-later
- steady-state management
- MVP behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
```

### SMPFS-057 - Shell Adjacent Pane Family

```yaml
plan_unit_id: SMPFS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal, Problems, Output, Debug Console, and Ports are canonical shell-adjacent panes with distinct responsibilities linked by terminal-session and dev-session identity rather than loose textual association.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-057 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pane_family_drift
reasoning_tier: standard
context_scope: pane_family_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_adjacent_pane_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- Terminal
- Problems
- Output
- Debug Console
- Ports
- shell-adjacent panes
- terminal-session
- dev-session identity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-058 - Pane Ownership Boundaries

```yaml
plan_unit_id: SMPFS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Pane ownership boundaries remain explicit: Terminal owns live PTY/transcript/search/overlays, Output owns structured process output, Problems owns diagnostics, Debug Console owns debugger REPL/evaluation, and Ports owns service endpoints.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-058 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pane_owner_boundary_drift
reasoning_tier: standard
context_scope: pane_boundaries_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pane_ownership_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- Terminal owns live interactive PTY
- Output owns structured or aggregated process output
- Problems owns problem and diagnostic views
- Debug Console
- Ports owns discovered or declared service endpoints
- Surface-boundary labels
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-059 - Origin Preserving Cross Surface Patterns

```yaml
plan_unit_id: SMPFS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Output, Run, Problems, Debug Console, Ports, and Services patterns are canonical only when they preserve origin linkback to the owning terminal, dev session, run, file, tool, or service context.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-059 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: origin_linkback_drift
reasoning_tier: standard
context_scope: cross_surface_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: origin_preserving_cross_surface_patterns
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- /Run
- /search
- /preserve
- /reveal-origin
- /errors/warnings
- /line/code
- /evaluation
- /commands
- /endpoint
- /copy
- /session
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-060 - Debug Run Workbench Boundary

```yaml
plan_unit_id: SMPFS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Debug and run surfaces are part of the broader workbench story; remote run/debug follows requested/effective disclosure, derived shard hints cannot become shipped behavior without owner-doc contracts, and JSONL/logsearch diagnostics remain future hints until reconciled.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- RM-025
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-060 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_run_boundary_drift
reasoning_tier: standard
context_scope: debug_run_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: debug_run_workbench_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- remote run/debug
- requested/effective disclosure
- derived shard hints
- JSONL mirrors
- logsearch-style retrieval
- future /diagnostics hints
negative_constraints:
- Only hand-authored plan contracts can promote derived shard hints into shipped behavior.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Run_Modes.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-061 - Terminal Persistence Tiers

```yaml
plan_unit_id: SMPFS-061
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal persistence preserves guaranteed_durable, best_effort_durable, and transient_only tiers, separate transcript/history/layout/settings owners, append-oriented chunked persistence, and bounded transcript/metadata-only degraded states.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-061 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_persistence_drift
reasoning_tier: standard
context_scope: terminal_persistence
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_persistence_tiers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- guaranteed_durable
- best_effort_durable
- transient_only
- transcript state
- command-block /history metadata
- layout /session metadata
- settings /theme defaults
- append-oriented
- bounded transcript chunks
- metadata-only records
negative_constraints:
- transient_only live PTY state, full scrollback, TUI alternate-screen content, selections, and in-flight search highlights MUST NOT be faked after restart.
- Terminal state categories MUST NOT be collapsed into one terminal blob.
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-062 - Transcript Disclosure And Restore UI

```yaml
plan_unit_id: SMPFS-062
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal restore UI discloses missing transcript backing before transcript-specific review/copy/search and uses exact labels live-restored, /disconnected/review-only, /history/context, and /ephemeral for restored or degraded states.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-062 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_ui_drift
reasoning_tier: standard
context_scope: terminal_restore_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: transcript_disclosure_restore_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- missing backing transcript
- review
- copy
- search
- live-restored
- /disconnected/review-only
- /history/context
- /ephemeral
- restore banners
negative_constraints:
- The UI must disclose missing backing transcript before offering transcript-specific review, copy, or search behavior.
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-063 - Canonical Terminal Restore Outcomes

```yaml
plan_unit_id: SMPFS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Canonical terminal restore outcomes are restored_live, restored_exited, restored_disconnected, and restored_without_history, with restore labels kept distinct from live PTY continuity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-063 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_outcome_drift
reasoning_tier: standard
context_scope: terminal_restore_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: canonical_terminal_restore_outcomes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- restored_live
- restored_exited
- restored_disconnected
- restored_without_history
negative_constraints:
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-064 - Terminal Shortcut And Agent Control Boundary

```yaml
plan_unit_id: SMPFS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal shortcuts coexist with PM-wide shortcuts through explicit scope and precedence, and PM-built-in agents control terminal sessions through the canonical terminal subsystem rather than a parallel hidden shell model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-064 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_shortcut_boundary_drift
reasoning_tier: standard
context_scope: terminal_shortcut_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_shortcut_agent_control_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- terminal shortcuts
- PM-wide shortcuts
- scope and precedence
- PM-built-in agents
- canonical terminal subsystem
- parallel hidden shell model
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SMPFS-065 - Same Session Reveal Commands

```yaml
plan_unit_id: SMPFS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal are idempotent same-session reveal commands that reveal existing sections, tabs, and panes for the referenced session before considering new containers.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-065 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: same_session_reveal_drift
reasoning_tier: standard
context_scope: terminal_reveal_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: same_session_reveal_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- Open in Terminal
- Show Terminal
- idempotent same-session reveal
- New Terminal
- section
- tab
- pane
negative_constraints:
- Open in Terminal is idempotent same-session reveal, not shorthand for New Terminal.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
```

### SMPFS-066 - Terminal Browser Anti Collapse Shape

```yaml
plan_unit_id: SMPFS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal remains a first-class shell workspace, not mini-shells or /browser/terminal placeholders, preserving distinct session/command-block, dev-session, tabs/panes, GUI, debug/hot-reload, and recovery/inspector boundaries.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-066 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_browser_collapse_drift
reasoning_tier: standard
context_scope: terminal_shape_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_browser_anti_collapse_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- first-class shell-workspace
- mini-shells
- /browser/terminal
- /session/command-block
- /dev-session
- /tabs/panes
- /debug/hot-reload
- /recovery/inspector
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-067 - PTY Shell Remote Capability Matrix

```yaml
plan_unit_id: SMPFS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The cross-platform capability matrix preserves PTY host/process supervision, shell integration metadata, docking/detach support, local and remote/multi-context launches, and deterministic degradation when capabilities are unavailable.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-067 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_capability_matrix_drift
reasoning_tier: standard
context_scope: terminal_capability_matrix
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pty_shell_remote_capability_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- PTY host
- process supervision
- shell integration metadata
- docking and detached windows
- SSH
- WSL
- containers
- /dev-container
- degraded PTY control
- unsupported contexts
negative_constraints:
- Unavailable or degraded PTY control MUST be surfaced as effective capability loss, not hidden fallback.
- Unsupported contexts MUST fail deterministically rather than silently retargeting to the wrong runtime.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes:
- Legacy routing shorthand such as /SSH, /WSL/container-or-similar, /render, and /replaces resolves through process-host, renderer, and requested/effective host contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-068 - Renderer Accessibility Text Model Matrix

```yaml
plan_unit_id: SMPFS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Renderer modes, clipboard, IME, accessibility, text/selection model, TUI capture, terminal shortcuts, and requested/effective renderer disclosure remain first-class acceptance requirements across platforms.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-068 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: renderer_accessibility_drift
reasoning_tier: standard
context_scope: terminal_renderer_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: renderer_accessibility_text_model_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- /render-mode
- interactive rich
- plain /log/CI
- machine-readable /export
- degraded ASCII /low-capability
- /spectacle
- Clipboard
- IME
- accessibility
- Unicode
- TUI capture
- requested/effective
negative_constraints:
- Effective renderer mode MUST be disclosed whenever it differs from the requested preference.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-069 - Platform Acceptance And Legacy Routing

```yaml
plan_unit_id: SMPFS-069
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Platform acceptance covers macOS, Linux, Windows, WSL, Wayland, X11, dock/detach, package/runtime dependencies, and legacy shorthand resolved through process-host, renderer, and requested/effective capability contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-069 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_acceptance_drift
reasoning_tier: standard
context_scope: terminal_platforms
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: platform_acceptance_legacy_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- macOS
- Linux
- Windows
- WSL
- Wayland
- /X11
- /dock/detach
- package/runtime dependencies
- /SSH
- /WSL/container-or-similar
- /render
- /replaces
negative_constraints:
- PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes:
- /SSH, /WSL/container-or-similar, /render, and /replaces are legacy shorthand resolved through canonical host/render contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-070 - Terminal Subsystem Layers And Gates

```yaml
plan_unit_id: SMPFS-070
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal subsystem architecture has explicit process-host, PTY transport, VT/ANSI grid buffer engine, renderer, shell-integration metadata, and workspace/session UI layers with acceptance gates for platform behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-070 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_layer_drift
reasoning_tier: standard
context_scope: terminal_architecture
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_subsystem_layers_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- process host
- PTY /session/process transport
- VT /ANSI/grid/buffer
- renderer
- shell-integration metadata
- workspace/session UI
- acceptance gates
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-071 - Terminal Parser Replay Requirements

```yaml
plan_unit_id: SMPFS-071
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal parser and replay requirements preserve mutable grid/buffer state, scrollback and selection anchors, command-block annotations, replay fixtures, resize/reflow, huge output, Unicode/IME, search, and TUI capture behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-071 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_parser_replay_drift
reasoning_tier: standard
context_scope: terminal_parser
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_parser_replay_requirements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- /VT
- /ANSI/grid/buffer
- scrollback
- selection anchors
- command-block annotations
- replay fixtures
- resize/reflow
- huge output
- Unicode
- IME
- search
- TUI capture
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-072 - Non Ship Terminal Rendering Constraints

```yaml
plan_unit_id: SMPFS-072
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: A DOM-style, document-style, line-widget-per-output, or string-concatenation terminal core is non-ship; terminal output is mutable grid/buffer state rendered by a purpose-built terminal engine.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-072 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_rendering_constraint_drift
reasoning_tier: standard
context_scope: terminal_rendering_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: non_ship_terminal_rendering_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- DOM-style
- document-style
- one widget per line forever
- line-widget
- string-concatenation
- non-ship
- mutable grid/buffer state
negative_constraints:
- A DOM-style terminal rendering architecture for the terminal core is non-ship.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-073 - Native Buffer Render Performance Model

```yaml
plan_unit_id: SMPFS-073
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal performance requires off-UI-thread PTY and buffer work, diff/dirty-region painting, throttled rendering, bounded memory, stable scroll/selection/focus, and platform performance tests.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-073 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_performance_drift
reasoning_tier: standard
context_scope: terminal_rendering_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: native_buffer_render_performance_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- off-UI-thread
- diff/dirty-region painting
- throttled rendering
- bounded memory
- scroll
- selection
- focus
- performance tests
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-074 - Terminal Observability Events

```yaml
plan_unit_id: SMPFS-074
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal observability records structured lifecycle and state-transition events including create, attach, ready, start/finish command, interrupt, terminate, kill, detach, reattach, move-window, resize, focus/visibility, cwd/profile changes, renderer errors, shell-integration changes, selection/clipboard failures, and capability fallback.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-074 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_observability_drift
reasoning_tier: standard
context_scope: terminal_observability
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_observability_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- session create
- /attach/ready/start-command/finish-command
- interrupt
- /terminate/kill
- detach
- /reattach/move-window
- resize
- /focus/visibility
- cwd/profile changes
- renderer errors
- shell-integration state changes
- selection and clipboard failures
- capability fallback
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-075 - Terminal Diagnostics Visibility

```yaml
plan_unit_id: SMPFS-075
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal settings and diagnostics expose renderer mode/fallback, shell-integration capability tier/source, last restore outcome, transcript persistence and retention availability, and recent errors/events relevant to the current pane.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-075 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_diagnostics_ui_drift
reasoning_tier: standard
context_scope: terminal_diagnostics_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_diagnostics_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- settings/diagnostics
- renderer mode/fallback state
- shell integration capability tier/source
- last restore outcome
- transcript persistence availability/retention status
- recent terminal errors/events
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-076 - Terminal Diagnostic Privacy And Bundles

```yaml
plan_unit_id: SMPFS-076
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal diagnostic logging records metadata, state transitions, failure codes, and performance counters without indiscriminate shell-content capture; user-requested diagnostic bundles clearly label transcript content as absent, partial, or included.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-076 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_diagnostic_privacy_drift
reasoning_tier: standard
context_scope: terminal_diagnostics
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_diagnostic_privacy_bundles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- metadata
- state transitions
- failure codes
- performance counters
- diagnostic bundle
- absent
- partial
- included
- transcript excerpts
negative_constraints:
- Diagnostic logging must not indiscriminately capture or duplicate full shell content.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-077 - Terminal Rollback Snapshot Boundary

```yaml
plan_unit_id: SMPFS-077
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Rollback/snapshot boundaries allow terminal metadata, layout state, settings, and retained transcript artifacts to be snapshotted, but not arbitrary live PTY or process undo after commands have executed.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-077 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_rollback_boundary_drift
reasoning_tier: standard
context_scope: terminal_recovery
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_rollback_snapshot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- Rollback/snapshot boundary
- terminal metadata
- layout state
- settings
- retained transcript artifacts
- live PTY runtime/process state
- restart/rerun/reopen/restore-structure
negative_constraints:
- PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-078 - Terminal Noise And Queryable State

```yaml
plan_unit_id: SMPFS-078
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Repeated identical terminal failures are coalesced under the /noise rule while persistent degraded state remains inspectable, and major terminal subsystem state is queryable per pane/session and project-wide without scraping rendered UI text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-078 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_noise_state_drift
reasoning_tier: standard
context_scope: terminal_diagnostics_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_noise_queryable_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- /noise
- persistent degraded conditions
- typed events
- state-transition boundaries
- queryable per pane/session
- project-wide
- without scraping rendered UI text
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- All major terminal subsystems emit typed events at state-transition boundaries, and diagnostic state is queryable per pane/session and project-wide without scraping rendered UI text.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-079 - Terminal Acceptance Criteria

```yaml
plan_unit_id: SMPFS-079
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal acceptance requires deterministic two-section, multi-tab, one-to-four pane behavior across docked/detached presentation, same-session reveal, restart identity minting, honest historical restore, terminal/output/problems/debug/ports linkback, and responsive huge-output/search/scrollback paths.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-079 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_acceptance_drift
reasoning_tier: standard
context_scope: terminal_acceptance_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0043
preserved_exact_tokens:
- two terminal sections
- multi-tab behavior
- one-to-four pane tabs
- docked
- detached
- same-session reveal
- new terminal_session_id
- historical sessions
- huge-output
- search
- scrollback
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-080 - Hot Live Reload Semantics

```yaml
plan_unit_id: SMPFS-080
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Dev sessions are stack-aware and distinguish hot reload from live reload, with explicit cleanup and termination rules for project switch and app shutdown.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-080 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hot_reload_semantics_drift
reasoning_tier: standard
context_scope: dev_loop_reload
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: hot_live_reload_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
preserved_exact_tokens:
- Hot Reload
- Live Reload
- Fast Iteration
- dev sessions
- stack-aware
- project switch
- app shutdown
- termination/cleanup rules
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-081 - Hot Live Reload UI

```yaml
plan_unit_id: SMPFS-081
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Hot/live reload UI discloses fallback to live reload, and one-click launch, status, logs, errors, and termination rules are required.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-081 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hot_reload_ui_drift
reasoning_tier: standard
context_scope: dev_loop_reload_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: hot_live_reload_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
preserved_exact_tokens:
- fallback to live reload
- UI copy and state
- one-click launch
- status
- logs
- errors
- termination rules
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-082 - Sound Effects Settings

```yaml
plan_unit_id: SMPFS-082
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Sound effects are grouped settings, not per-view ad hoc toggles, and sound notifications follow action-needed/completion semantics while respecting do-not-disturb or muted-state shell policy.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-082 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: sound_settings_drift
reasoning_tier: standard
context_scope: sound_settings_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: sound_effects_settings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0045
preserved_exact_tokens:
- Sound Effects Settings
- grouped as settings
- per-view ad hoc toggles
- action-needed
- completion semantics
- do-not-disturb
- muted-state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-083 - Instant Project Switch Command Semantics

```yaml
plan_unit_id: SMPFS-083
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Instant project switch defaults to switching the active workspace tab, while an alternate command opens the target project in a new workspace tab.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-083 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_switch_command_drift
reasoning_tier: standard
context_scope: project_switch
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: instant_project_switch_command_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
preserved_exact_tokens:
- Instant Project Switch
- default switch target
- active workspace tab
- alternate command
- new workspace tab
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
```

### SMPFS-084 - Instant Project Switch State And Edge UI

```yaml
plan_unit_id: SMPFS-084
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Project switching recalculates project-scoped config, sessions, terminal cwd, browser preview state, effective tool/MCP/Persona state, preserves old project background activity through attention surfaces, and exposes deterministic missing-path, duplicate-path, and in-flight-run states.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-084 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_switch_ui_drift
reasoning_tier: standard
context_scope: project_switch_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: instant_project_switch_state_edge_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
preserved_exact_tokens:
- project-scoped config
- sessions
- terminal cwd
- browser preview state
- effective tool/MCP/persona state
- background activity
- badges/attention surfaces
- missing-path
- duplicate-path
- in-flight-run
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-085 - Browser Site Reader Web Boundary

```yaml
plan_unit_id: SMPFS-085
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The built-in browser and click-to-context browser-interaction topic is separate from websearch, provider-routed webfetch, site/page reading intents, and Site Reader-only behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-085 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_web_boundary_drift
reasoning_tier: standard
context_scope: browser_web_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_site_reader_web_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- Built-in Browser and Click-to-Context
- Site Reader v1
- browser-interaction
- websearch
- webfetch
- web-operation family
- Reading Site
- Site Reader-only behavior
negative_constraints:
- Provider-routed fetch must not reuse the reserved native Site Reader identity.
- Browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-086 - Web Research Labels And Degradation UI

```yaml
plan_unit_id: SMPFS-086
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Promoted GUI consumes web research activity cards without re-owning tool routing, preserving Searching Web and reserved Reading Site labels, Site Reader detail-level choices, token-efficient fetches, observe/read path separation, and free-tier/provider-limit degradation before unavailable actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-086 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_research_ui_drift
reasoning_tier: standard
context_scope: browser_research_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: web_research_labels_degradation_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- 'Searching Web: <query>'
- 'Reading Site: <url>'
- /detail-level
- minimal
- summary
- full
- /fetches
- /observe
- /automation
- /free-tier
- provider-limit degradation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-087 - PM Managed Browser Runtime

```yaml
plan_unit_id: SMPFS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM browser runtime is capability-first and PM-managed CEF by default; wef, cargo-wef, Wry/hybrid, OS webviews, Playwright/CDP sidecars, chromiumoxide, and Chrome-for-Testing helpers remain candidates or comparison inputs until packaging, update, install, verification, and health strategy is explicit.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-087 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_runtime_drift
reasoning_tier: standard
context_scope: browser_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pm_managed_browser_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- PM-managed CEF runtime
- wef
- cargo-wef
- runtime_unavailable
- Wry/hybrid
- OS webviews
- Playwright/CDP sidecars
- chromiumoxide
- Chrome-for-Testing
- packaging/update/install strategy
negative_constraints:
- If the selected path uses an auto-downloaded CEF binary distribution via cargo-wef, requested/effective browser state must surface runtime_unavailable until the pinned binary is present, verified, and healthy.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- wef and cargo-wef are implementation candidates only until packaging/update/install strategy is explicit.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-088 - Browser Requested Effective Disclosure

```yaml
plan_unit_id: SMPFS-088
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser runtime capability state is requested/effective and must disclose runtime_unavailable, degraded capability, visible-host support, platform differences, and capability-degradation before offering unavailable features.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-088 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_effective_disclosure_drift
reasoning_tier: standard
context_scope: browser_capability_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- requested/effective browser state
- runtime_unavailable
- /capability-degradation
- visible host
- cross-platform embedding
- degraded-but-supported
negative_constraints:
- PM must not leave browser fallback behavior or effective capability disclosure under-specified.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-089 - Browser Chip Capture And Share Flow

```yaml
plan_unit_id: SMPFS-089
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser click, highlight, capture, and share flows use explicit user-triggered chips; cmd.browser.share_with_agent and revoke_share_with_agent update explicit browser-session share state only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-089 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_chip_flow_drift
reasoning_tier: standard
context_scope: browser_context_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_chip_capture_share_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- chip-based model
- visible, user-triggered chips
- cmd.browser.share_with_agent
- cmd.browser.revoke_share_with_agent
- browser-session share state
- hidden automatic context injection
negative_constraints:
- Browser-derived context enters a thread only through visible, user-triggered chips, never through hidden automatic context injection.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-090 - Browser Attachment And Prompt Limits

```yaml
plan_unit_id: SMPFS-090
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser text selection and element pick create browser_selection_context and browser_element_context chips, while screenshots and combined captures create runtime-artifact references and must not inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- RAP-024
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-090 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_prompt_limit_drift
reasoning_tier: standard
context_scope: browser_context_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_attachment_prompt_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- browser_selection_context
- browser_element_context
- runtime-artifact references
- selected browser context chip
- raw unbounded page bodies
- DOM dumps
- screenshots
- prompt text
negative_constraints:
- Browser screenshot and combined selection+screenshot actions MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### SMPFS-091 - Named Browser Action Taxonomy

```yaml
plan_unit_id: SMPFS-091
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The browser control plane remains named-action based, covering tab lifecycle, richer interactions, wait primitives, dialogs, file uploads, storage controls, network routing/mocking, trace/video capture, page/PDF export, test verification, coordinate fallback, and locator generation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-091 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_action_taxonomy_drift
reasoning_tier: standard
context_scope: browser_actions
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: named_browser_action_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- named-action
- list
- create
- select
- close
- hover
- drag
- select option
- fill form
- press key
- navigate back
- wait for time
- wait for text
- wait for text disappearance
- storage-state
- network
- trace/video
- PDF export
- locator generation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-092 - DevTools And Test Debug Boundaries

```yaml
plan_unit_id: SMPFS-092
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Embedded/detached DevTools, agent/browser introspection, and advanced browser test-debug flows are explicit opt-in or named-action surfaces; raw DevTools/CDP scripting and page-code execution are not the default PM browser contract.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-092 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: devtools_boundary_drift
reasoning_tier: standard
context_scope: browser_devtools_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: devtools_test_debug_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- DevTools
- embedded
- detached
- /test-debug
- browser_run_code
- browser_evaluate
- raw DevTools/CDP
- named browser actions
- active browser-session capability state
negative_constraints:
- Raw DevTools/CDP exposure is not an unresolved browser-contract question.
- Page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM guaranteed browser contract.
- Advanced browser /test-debug remains opt-in and MUST NOT replace the named browser/testing action contract as PM default surface.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-093 - Browser Artifact Pipeline

```yaml
plan_unit_id: SMPFS-093
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser screenshots, traces, combined selection/screenshot captures, DevTools automation artifacts, and evidence actions use the runtime-artifact pipeline with naming, retention, manifest shape, chat rendering, privacy redaction, permission disclosure, and requested/effective capability state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- RAP-024
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-093 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_artifact_pipeline_drift
reasoning_tier: standard
context_scope: browser_artifacts_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_artifact_pipeline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- browser screenshots
- traces
- combined selection+screenshot captures
- artifact pipeline
- naming
- retention
- manifest shape
- chat rendering
- privacy redaction
- runtime-artifact references
- /screenshot/devtools/automation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### SMPFS-094 - Browser Session Persistence And Profiles

```yaml
plan_unit_id: SMPFS-094
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser session persistence covers history, cookies, storage, auth sessions, profile { name, saveChanges }, project-scoped normal sessions, workspace_preview/detached_preview sharing, isolated automation_session and auth_session profiles, restore eligibility, and crash recovery.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-094 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_profile_drift
reasoning_tier: standard
context_scope: browser_persistence
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_session_persistence_profiles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- 'profile: { name: string, saveChanges: boolean }'
- cookies
- localStorage
- workspace_preview
- detached_preview
- automation_session
- auth_session
- project-scoped
- persistent profile/store
- restore eligibility
- crash recovery
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- /localStorage slash notation remains lineage for the canonical localStorage storage field.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-095 - Browser Tab Cap And Retargeting

```yaml
plan_unit_id: SMPFS-095
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Browser tab-cap handling is no-silent-retargeting/no LRU reuse: PM prompts, blocks, explicitly closes, or opens detached rather than silently retargeting an existing browser subject.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-095 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_retargeting_drift
reasoning_tier: standard
context_scope: browser_tabs_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_tab_cap_retargeting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- no-silent-retargeting
- no LRU reuse
- prompt
- block
- explicitly close
- open detached
- browser subject
negative_constraints:
- PM must prompt, block, explicitly close, or open detached rather than silently retargeting an existing browser subject.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-096 - Browser Lifecycle Distribution Platform Guarantees

```yaml
plan_unit_id: SMPFS-096
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM-managed browser helpers use helper/subprocess lifecycle, crash detection, restart policy, sandboxing, diagnostics, per-platform bundle layout, update rules, signature/hash verification, uninstall/removal evidence, and explicit Linux/macOS/Windows platform guarantees.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-096 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_lifecycle_distribution_drift
reasoning_tier: standard
context_scope: browser_distribution
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_lifecycle_distribution_platform_guarantees
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- helper/subprocess layout
- /subprocess
- startup
- shutdown
- crash detection
- restart policy
- sandboxing
- diagnostics
- bundle layout
- update rules
- signature/hash verification
- /hash
- uninstall/removal
- /removal
- macOS
- Linux
- Windows
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-097 - Browser Permissions And Safety

```yaml
plan_unit_id: SMPFS-097
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser actions, storage/auth use, DevTools flows, artifact capture, agent-vs-user authority, permission keys, trust tiers, auth/session sensitivity, and no-silent-fallback blocked semantics are governed by Permissions and safety contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-097 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_permission_drift
reasoning_tier: standard
context_scope: browser_safety
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_permissions_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- permission keys
- trust tiers
- agent-vs-user authority
- auth/session sensitivity
- no-silent-fallback blocked semantics
- browser action
- storage/auth
- DevTools flow
- artifact capture
negative_constraints:
- No-silent-fallback blocked semantics govern every browser action, storage/auth use, DevTools flow, and artifact capture.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-098 - Browser Chrome Controls And Test Plan

```yaml
plan_unit_id: SMPFS-098
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser command/UI surfaces expose inspect, screenshot, DevTools, automation controls, exact browser chrome controls, status indicators, activity disclosure, and scenario-driven acceptance criteria for preview, interaction, screenshots, DevTools, auth, crash recovery, restore, and cross-platform packaging.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-098 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_controls_testplan_drift
reasoning_tier: standard
context_scope: browser_controls_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_chrome_controls_test_plan
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- inspect
- screenshot
- devtools
- automation
- browser chrome controls
- status indicators
- activity disclosure
- local HTML preview
- web app interaction
- auth flow
- crash recovery
- cross-platform packaging
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-099 - Browser Reference Material Dispositions

```yaml
plan_unit_id: SMPFS-099
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Playwright MCP, Chrome DevTools MCP, BrowserMCP, Saik0s/mcp-browser-use, browser-use, chromiumoxide, Wry, WebView2, WKWebView, WebKitGTK, OS webviews, CDP sidecars, and MCP config shapes remain reference, comparison, lineage, or background inputs and do not replace PM-owned browser architecture.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-099 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_reference_disposition_drift
reasoning_tier: standard
context_scope: browser_reference_material
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_reference_material_dispositions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- Playwright MCP
- Chrome DevTools MCP
- BrowserMCP/mcp
- Saik0s/mcp-browser-use
- browser-use
- chromiumoxide
- Wry
- WebView2
- WKWebView
- WebKitGTK
- OS webviews
- CDP
- storage-state
- cdpEndpoint
negative_constraints:
- Reference material does not change PM design center away from a PM-owned built-in browser surface.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- Reference/comparison/background labels remain lineage only and do not become PM product commands or core architecture.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
```

### SMPFS-100 - Browser Action Schema And Output Shape

```yaml
plan_unit_id: SMPFS-100
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The canonical browser action table and output shape preserve action_id, bucket, tier, permission_layer, allowed_session_classes, requested_capabilities, artifacts_emitted, degradation_or_blocking_behavior, user_visible_entry_points, typed output sections, fields, limits, sequential execution, URL validation, and invalid_input errors.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-100 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_action_schema_drift
reasoning_tier: standard
context_scope: browser_action_schema
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_action_schema_output_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- action_id
- bucket
- tier
- guaranteed_everyday
- advanced_debug_testing
- permission_layer
- allowed_session_classes
- requested_capabilities
- artifacts_emitted
- degradation_or_blocking_behavior
- user_visible_entry_points
- Open tabs
- Page state
- Snapshot
- New console messages
- Modal state
- Downloads
- timeout_ms
- invalid_input
- 5 MB default
- 5000ms
- 30000ms
- 30s
- HTTP(S)
- https://
negative_constraints:
- Unknown type values produce invalid_input error.
- Reject non-HTTP(S) schemes and malformed URLs.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-101 - Promoted Command Families

```yaml
plan_unit_id: SMPFS-101
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The UI command catalog exposes stable command families for project switching/open-new-tab, workspace tabs, detached windows, thread context detail, branching, browser controls, terminal actions, dev-session actions, and catalog lifecycle actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-101 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: promoted_command_family_drift
reasoning_tier: standard
context_scope: command_catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: promoted_command_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
preserved_exact_tokens:
- project switch
- project open-in-new-workspace-tab
- workspace tab create
- detached window
- thread context detail
- branch-from-restore
- browser open
- terminal show
- dev-session start
- catalog install
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-102 - Command Category And Identity Reveal Rules

```yaml
plan_unit_id: SMPFS-102
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal normalize to the terminal command family, terminal layout and runtime actions remain separate command categories, and cross-surface reveal commands target canonical identities such as terminal_session_id and dev_session_id rather than freeform labels.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-102 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_identity_reveal_drift
reasoning_tier: standard
context_scope: command_catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_category_identity_reveal_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
preserved_exact_tokens:
- Open in Terminal
- Show Terminal
- terminal command family
- terminal layout changes
- terminal runtime actions
- terminal_session_id
- dev_session_id
- freeform labels
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-103 - Project Restore Identity

```yaml
plan_unit_id: SMPFS-103
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Project restore uses stable project_id rather than raw path alone, preserving restore semantics as identity-driven runtime state.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-103 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_restore_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- project_id
- raw path alone
- project restore
negative_constraints:
- Project restore uses stable project_id, not raw path alone.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-104 - Workspace And Detached Surface Restore

```yaml
plan_unit_id: SMPFS-104
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Workspace tabs restore independently, and detached windows restore only when their surface class and platform support allow deterministic restoration.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-104 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_detached_surface_restore
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- workspace tabs restore independently
- detached windows
- surface class
- platform support
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-105 - Normal Browser Restore Scope

```yaml
plan_unit_id: SMPFS-105
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Normal browser tabs restore by project and workspace tab while preserving profile scope; detached normal browsing restores with the originating normal browsing session when supported.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-105 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: normal_browser_restore_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- normal browser tabs
- project
- workspace tab
- profile scope
- detached normal browsing
- originating normal browsing session
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-106 - Auth And Automation Restart Boundaries

```yaml
plan_unit_id: SMPFS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Auth sessions and automation sessions do not auto-resume active work after restart, and auth_session must not auto-close on presumed success because completion requires explicit user or provider/flow evidence.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-106 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: auth_automation_restart_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- auth_session
- automation sessions
- auto-resume
- auto-close
- presumed success
- explicit user or provider/flow evidence
negative_constraints:
- auth_session must not auto-close on presumed success; PM cannot reliably infer completion across arbitrary sites.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-107 - Terminal And Dev Restore Verification

```yaml
plan_unit_id: SMPFS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal sessions and dev sessions have explicit restore eligibility; running processes are never assumed alive after restart, and terminal restart or replacement creates a new terminal_session_id.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-107 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_dev_restore_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- terminal sessions
- dev sessions
- explicit restore eligibility
- running process
- restart
- terminal_session_id
negative_constraints:
- A running process is never assumed alive after restart without verification.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-108 - Terminal Durable Presentation Metadata

```yaml
plan_unit_id: SMPFS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal section, tab, pane, selection-of-active-pane, labels, pin state, dock/detach placement, and linked dev-session references are guaranteed_durable presentation metadata.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-108 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_durable_presentation_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- section
- tab
- pane
- selection-of-active-pane
- labels
- pin state
- dock/detach placement
- linked dev-session references
- guaranteed_durable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-109 - Terminal Transcript And Runtime Persistence Tiers

```yaml
plan_unit_id: SMPFS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal transcript snapshots, command-block metadata, cwd snapshots, shell-integration hints, and Output/Ports linkage are best_effort_durable, while live PTY continuity, unlimited scrollback, TUI alternate-screen content, live selections, and in-flight search highlights are transient_only.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-109 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_transcript_runtime_persistence_tiers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- bounded transcript snapshots
- command-block metadata
- cwd snapshots
- shell-integration hints
- best_effort_durable
- live PTY continuity
- unlimited scrollback
- active TUI alternate-screen content
- live selections
- in-flight search highlights
- transient_only
negative_constraints:
- transient_only runtime state MUST NOT be faked after restart.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-110 - Canonical Restore Outcome Vocabulary

```yaml
plan_unit_id: SMPFS-110
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Canonical restore outcomes are exactly restored_live, restored_exited, restored_disconnected, and restored_without_history.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-110 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: canonical_restore_outcome_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- restored_live
- restored_exited
- restored_disconnected
- restored_without_history
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-111 - Automation Promotion To Normal Browsing

```yaml
plan_unit_id: SMPFS-111
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Promotion from paused automation into normal browsing is an explicit user-confirmed action that may copy or promote eligible browser state, reclassifies the visible automation browser as normal, and is never a hidden side effect.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-111 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: automation_promotion_normal_browsing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- user-confirmed promotion
- paused automation
- normal browsing
- normal persistent profile/store
- visible automation browser
- hidden side effect
negative_constraints:
- Promotion or state copy must be an explicit user action, never a hidden side effect.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-112 - Frozen Browser Runtime History And Crash Evidence

```yaml
plan_unit_id: SMPFS-112
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser requested/effective runtime and capability state is stored as frozen runtime history instead of recomputed heuristically, and crash recovery preserves recoverable metadata and completed evidence artifacts when possible.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RAP-024
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-112 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: frozen_browser_runtime_history_crash_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- browser requested/effective runtime
- capability state
- frozen runtime history
- recomputed heuristically
- crash recovery
- recoverable metadata
- completed evidence artifacts
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Contracts_V0.md
```

### SMPFS-113 - Profile Scope Isolation And SaveChanges

```yaml
plan_unit_id: SMPFS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser or terminal session classes must not silently bleed storage into another profile scope, and profile { name, saveChanges } scopes cookies and localStorage by profile name and project while disabled saveChanges keeps the session isolated.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-113 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: profile_scope_isolation_savechanges
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- 'profile: { name: string, saveChanges: boolean }'
- cookies
- localStorage
- profile name
- project
- saveChanges
- isolated
- storage bleed
negative_constraints:
- No browser or terminal session class may silently bleed storage into another profile scope.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-114 - Retired Shell Navigation And Usage Surfaces

```yaml
plan_unit_id: SMPFS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The title-bar project bar, floating thread-selector overlay, and detached usage pop-out are explicitly non-canonical promoted shell, thread navigation, and per-thread usage models.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- UF-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-114 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: retired_shell_navigation_usage_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- title-bar project bar
- floating thread-selector overlay
- detached usage pop-out
- non-canonical
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- These surfaces are explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
```

### SMPFS-115 - Browser Instance Reuse Non Goal

```yaml
plan_unit_id: SMPFS-115
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: One broad browser-instance model with LRU reuse is not the core browser contract.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-115 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_instance_reuse_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- one broad browser-instance model
- LRU reuse
- browser contract
negative_constraints:
- One broad browser-instance model with LRU reuse is not the core browser contract.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- This model is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SMPFS-116 - Browser Host Placement Non Goal

```yaml
plan_unit_id: SMPFS-116
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The bottom panel is not the primary browser host for the promoted browser model.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-116 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_host_placement_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- bottom panel
- primary browser host
negative_constraints:
- The bottom panel is not the primary browser host.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Bottom-panel-as-primary-browser-host is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-117 - Silent Browser Context Injection Prohibition

```yaml
plan_unit_id: SMPFS-117
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Ordinary browser clicks or text selection must not silently inject context into assistant prompts or runtime state.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-117 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: silent_browser_context_injection_prohibition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- silent automatic context injection
- ordinary browser clicks
- text selection
negative_constraints:
- Silent automatic context injection from ordinary browser clicks or text selection is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Silent browser context injection is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-118 - Storage Bleed Non Goal

```yaml
plan_unit_id: SMPFS-118
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Silent storage bleed between browser session classes or profile scopes is non-canonical.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-118 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: storage_bleed_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- silent storage bleed
- browser session classes
- profile scopes
negative_constraints:
- Silent storage bleed between browser session classes or profile scopes is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Silent storage bleed is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-119 - Low Level Browser Execution Non Goal

```yaml
plan_unit_id: SMPFS-119
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Raw CDP or arbitrary browser code execution is not the guaranteed core browser contract.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-119 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: low_level_browser_execution_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- raw CDP
- arbitrary browser code execution
- guaranteed core browser contract
negative_constraints:
- Raw CDP or arbitrary browser code execution is not the guaranteed core browser contract.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Raw CDP/code execution as core browser contract is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-120 - Generic Watch Mode Non Goal

```yaml
plan_unit_id: SMPFS-120
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Generic watch mode is not the primary dev-loop model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- RM-025
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-120 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: generic_watch_mode_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- generic watch mode
- primary dev-loop model
negative_constraints:
- Generic watch mode is not the primary dev-loop model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Generic watch mode as primary dev-loop model is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Run_Modes.md
- Plans/storage-plan.md
```

### SMPFS-121 - MCP Config Passthrough Non Goal

```yaml
plan_unit_id: SMPFS-121
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP is not config-and-passthrough only; Section 15 consumers rely on host-managed MCP capability resolution.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-121 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_config_passthrough_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- MCP
- config-and-passthrough only
negative_constraints:
- MCP as config-and-passthrough only is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- MCP config-only framing is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
```

### SMPFS-122 - Tool Permission Scope Non Goal

```yaml
plan_unit_id: SMPFS-122
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: App-level-only tool permission scope is insufficient for the promoted project-switch, MCP, and browser model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-122 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: tool_permission_scope_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- app-level-only tool permission scope
- project-switch
- MCP
- browser model
negative_constraints:
- App-level-only tool permission scope is insufficient for the promoted project-switch/MCP/browser model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- App-level-only permission scope is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-123 - Persona Tier Selector Stale Disposition

```yaml
plan_unit_id: SMPFS-123
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Stale Persona/tier selectors from Personas.md, Contracts_V0, and Contracts_V0.md, including _persona_id and select_for_tier(), are not canonical promoted-shell fields; Section 15 consumers use requested/effective Persona identity and runtime owner scope instead.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-123 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: persona_tier_selector_stale_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- Persona/tier selectors
- Personas.md
- Contracts_V0
- _persona_id
- select_for_tier()
- requested/effective Persona identity
- runtime owner scope
negative_constraints:
- Stale Persona/tier selectors are not canonical promoted-shell fields.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- _persona_id and select_for_tier() are stale/retired promoted-shell fields.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Contracts_V0.md
```

### SMPFS-001 - Section 15 Retired Source-Preserving Bridge

```yaml
plan_unit_id: SMPFS-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: SMPFS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 170. Section15_MVP_Promoted_Features_Spec-S0001 through S0050 are covered by fine-grained PlanUnits SMPFS-002 through SMPFS-123 or explicit structural coverage, while S0051, S0052, and S0054 are generated structural/audit dispositions and S0053 is retired bridge lineage. SMPFS-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
- SMPFS-002
- SMPFS-003
- SMPFS-004
- SMPFS-005
- SMPFS-006
- SMPFS-007
- SMPFS-008
- SMPFS-009
- SMPFS-010
- SMPFS-011
- SMPFS-012
- SMPFS-013
- SMPFS-014
- SMPFS-015
- SMPFS-016
- SMPFS-017
- SMPFS-018
- SMPFS-019
- SMPFS-020
- SMPFS-021
- SMPFS-022
- SMPFS-023
- SMPFS-024
- SMPFS-025
- SMPFS-026
- SMPFS-027
- SMPFS-028
- SMPFS-029
- SMPFS-030
- SMPFS-031
- SMPFS-032
- SMPFS-033
- SMPFS-034
- SMPFS-035
- SMPFS-036
- SMPFS-037
- SMPFS-038
- SMPFS-039
- SMPFS-040
- SMPFS-041
- SMPFS-042
- SMPFS-043
- SMPFS-044
- SMPFS-045
- SMPFS-046
- SMPFS-047
- SMPFS-048
- SMPFS-049
- SMPFS-050
- SMPFS-051
- SMPFS-052
- SMPFS-053
- SMPFS-054
- SMPFS-055
- SMPFS-056
- SMPFS-057
- SMPFS-058
- SMPFS-059
- SMPFS-060
- SMPFS-061
- SMPFS-062
- SMPFS-063
- SMPFS-064
- SMPFS-065
- SMPFS-066
- SMPFS-067
- SMPFS-068
- SMPFS-069
- SMPFS-070
- SMPFS-071
- SMPFS-072
- SMPFS-073
- SMPFS-074
- SMPFS-075
- SMPFS-076
- SMPFS-077
- SMPFS-078
- SMPFS-079
- SMPFS-080
- SMPFS-081
- SMPFS-082
- SMPFS-083
- SMPFS-084
- SMPFS-085
- SMPFS-086
- SMPFS-087
- SMPFS-088
- SMPFS-089
- SMPFS-090
- SMPFS-091
- SMPFS-092
- SMPFS-093
- SMPFS-094
- SMPFS-095
- SMPFS-096
- SMPFS-097
- SMPFS-098
- SMPFS-099
- SMPFS-100
- SMPFS-101
- SMPFS-102
- SMPFS-103
- SMPFS-104
- SMPFS-105
- SMPFS-106
- SMPFS-107
- SMPFS-108
- SMPFS-109
- SMPFS-110
- SMPFS-111
- SMPFS-112
- SMPFS-113
- SMPFS-114
- SMPFS-115
- SMPFS-116
- SMPFS-117
- SMPFS-118
- SMPFS-119
- SMPFS-120
- SMPFS-121
- SMPFS-122
- SMPFS-123
unblocks: []
acceptance_criteria:
- Section15_MVP_Promoted_Features_Spec-S0001 through S0050 remain mapped to fine-grained PlanUnits SMPFS-002 through SMPFS-123 or structural coverage rather than SMPFS-001.
- Section15_MVP_Promoted_Features_Spec-S0051, S0052, and S0054 are structurally dispositioned as generated migration metadata.
- Section15_MVP_Promoted_Features_Spec-S0053 is explicitly dispositioned as retired generated bridge lineage.
- SMPFS-001 no longer uses node_compile_hint.mode=source_preserving_planunit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: section15_retired_bridge
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: retired_migration_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0051
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0052
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0054
preserved_exact_tokens:
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- SMPFS-001
- source_preserving_planunit
- retired_migration_bridge
- Section15_MVP_Promoted_Features_Spec-S0051
- Section15_MVP_Promoted_Features_Spec-S0054
negative_constraints:
- SMPFS-001 must not provide product implementation coverage for Section15_MVP_Promoted_Features_Spec-S0001 through S0050.
- SMPFS-001 must not override SMPFS-002 through SMPFS-123 or structural dispositions.
- SMPFS-001 must not use source_preserving_planunit compile mode after Phase 2B batch 170.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes:
- The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, stale/retired evidence, and GUI-related bridge markers remain preserved in span_map and coverage_map.
stale_retired_dispositions:
- source_preserving_planunit retired for Section 15 after Phase 2B batch 170.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```

## Migration Coverage

Original hash: `8ae652cad15d3b8183532cfe5df3b3b36c9f904eff957a4c91632a038ad1cacf`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 168 atomized `Section15_MVP_Promoted_Features_Spec-S0001` through `Section15_MVP_Promoted_Features_Spec-S0020` into fine-grained PlanUnits `SMPFS-002` through `SMPFS-028`. Phase 2B batch 169 atomized `Section15_MVP_Promoted_Features_Spec-S0021` through `Section15_MVP_Promoted_Features_Spec-S0048` into fine-grained PlanUnits `SMPFS-029` through `SMPFS-102` with `Section15_MVP_Promoted_Features_Spec-S0023` retained as structural section organization. Phase 2B batch 170 atomized `Section15_MVP_Promoted_Features_Spec-S0049` and `Section15_MVP_Promoted_Features_Spec-S0050` into fine-grained PlanUnits `SMPFS-103` through `SMPFS-123`, structurally dispositioned generated tail spans `Section15_MVP_Promoted_Features_Spec-S0051`, `S0052`, and `S0054`, and retired `Section15_MVP_Promoted_Features_Spec-S0053` as the `SMPFS-001` bridge lineage. `SMPFS-001` is migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
