## 7. Views Specification

### 7.1 View Inventory (21 views/panels + 6 bottom panel tabs)
| 21 | Artifacts | -- | Side panel | **NEW** (runtime artifacts: diffs, plans, evidence, browser recordings, cost_usage, etc.; see Plans/Runtime_Artifacts_Panel.md) |

| # | View | Group | Type | Status |
|---|------|-------|------|--------|
| 1 | Dashboard | Home | Primary content | Existing (redesigned) |
| 2 | Projects | Home | Primary content | Existing (expanded: language detection, health) |
| 3 | Wizard | Run | Primary content | Existing (step 0-9) |
| 4 | Interview | Run | Primary content | Existing |
| 5 | Tiers | Run | Primary content | Existing |
| 6 | Settings | Settings | Primary content | **NEW** (merged: old Config + old Settings + Login + Doctor; 20 tabs in 5 groups) |
| 7 | Usage | Data | Primary content | **NEW** |
| 8 | Metrics | Data | Primary content | Existing |
| 9 | Evidence | Data | Primary content | Existing |
| 10 | EvidenceDetail | Data | Primary content | Existing |
| 11 | History | Data | Primary content | Existing |
| 12 | Ledger | Data | Primary content | Existing |
| 13 | Memory | Data | Primary content | Existing |
| 14 | Coverage | Data | Primary content | Existing |
| 15 | Setup | Run | Primary content | Existing |
| 16 | Chat | -- | Side panel | **NEW** |
| 17 | FileManager | -- | Side panel | **NEW** |
| 18 | FileEditor | -- | Primary content | **NEW** (+ instructions editor, SSH remote) |
| 19 | AgentActivity | -- | Embedded pane | **NEW** |
| 20 | BottomPanel | -- | Bottom panel | **NEW** (Terminal/Problems/Output/Ports/Browser/Debug) |
| 21 | NotFound | -- | Primary content | Existing |
### 7.2 Dashboard

**Group:** Home | **Location:** Primary content

The Dashboard is the operational hub. It uses a rearrangeable card grid.

**Widget cards:**
- **Orchestrator Status:** Status badge (Running/Paused/Idle/Error) + controls (Start, Pause, Resume, Stop, Reset, Preview, Build) + latest preview/build summary
- **Current Task:** Current tier, item name, platform, model
- **Progress:** Phase/task/subtask progress bars (3 bars)
- **Budgets:** Per-platform budget donut charts (used/total tokens, color-coded by usage %)
- **Calls to Action (CtAs):** HITL approval prompts, warnings, "Continue in Chat" buttons
- **Terminal Output:** Embedded scrollable terminal (last N lines; stdout=lime, stderr=magenta, info=orange)
- **Interview Panel:** Compact interview progress (visible when interview is active)
- **Error Display:** Red error box with message (visible when error exists)

**Card grid:**
- 2 columns at <1200px, 3 at 1200-1600px, 4 at >1600px
- Each card has a 4px drag handle (crosshatch pattern) in top-left corner
- Drag a card to swap positions with another
- Card order persisted in redb under `dashboard_layout:v1`

**Controls:** START, PAUSE, RESUME, STOP, RESET, PREVIEW, BUILD buttons with visual state feedback (see §10.1 Button Feedback). Retry/Replan/Reopen per-item buttons. Kill process button (if running).

**Preview/Build status strip:** The Orchestrator Status card includes a compact strip showing:
- latest preview session (`running`/`stopped`/`degraded`) with "Open preview artifact" action
- latest build result (`success`/`failed`) with artifact path summary and open/copy action

ContractRef: ContractName:Plans/newtools.md#146-preview-build-docker-and-actions-contracts, ContractName:Plans/Orchestrator_Page.md#45-preview-build-actions

**Calls to Action (CtA) cards:** CtA cards have accent-left-border (4px), elevated surface background, and a prominent action button. Types:
- **HITL approval:** "Phase X complete -- approval required" with evidence summary, "Approve & Continue" (primary) and "Reject" (secondary) buttons. Badge on activity bar when active.
- **Run interrupted:** "Previous run was interrupted" with "Resume from checkpoint" and "Start fresh" buttons.
- **Rate limit:** "Platform X rate limited -- resets in 2h 15m" with "Switch platform" button.
- **Warning:** Orange-border card for non-blocking issues (stale data, missing config).
- **Wizard attention required (`wizard_attention_required`):** Amber-border card when a Chain Wizard is blocked in `attention_required` state; see detailed spec below.
Multiple CtAs stack vertically in priority order (HITL > wizard_attention_required > interrupted > rate limit > warnings).

**`wizard_attention_required` CtA card spec:**

*Card data model:*
```json
{
  "card_type": "wizard_attention_required",
  "card_id": "<string>",
  "title": "Requirements Need Your Input",
  "reason": "<human-readable summary, e.g., '3 questions about authentication scope'>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "question_count": "<integer ≥ 1>",
  "resume_url": "<deep-link: puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify>",
  "thread_id": "<string>",
  "created_at_utc": "<ISO-8601 date-time>",
  "dismissed": false
}
```

*Visual spec:*
- Card background: amber/warning tint (matches system attention color)
- Left border accent: amber (4px solid)
- Header row: ⚠ icon + "Requirements Need Your Input" in bold
- Body text: `reason` field (e.g., "3 questions need answers before this wizard can proceed")
- Action buttons:
  1. **"Resume Wizard"** (primary, filled) -- navigates to the exact wizard step via `resume_url`
  2. **"View in Thread"** (secondary, outlined) -- opens the associated chat thread via `thread_id`
- Dismiss: NOT manually dismissable by the user; auto-dismisses only when the wizard transitions out of `attention_required`

*Placement:*
- Dashboard renders an **"Action Required"** section at the **top of the card grid**, above all other sections (Recent Activity, widget rows, etc.), when one or more `wizard_attention_required` cards exist.
- Section header: "Action Required" with an amber ⚠ badge showing the total count of cards in this section.
- Multiple wizards in `attention_required` state each produce their own card; all shown in this section, stacked vertically.
- When no `wizard_attention_required` cards exist, the "Action Required" section is **hidden entirely** (not rendered as an empty section).

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics, ContractName:Plans/assistant-chat-design.md

**HITL-to-Chat handoff:** When an HITL approval CtA is shown, clicking "Approve & Continue" or "Reject" can optionally spawn a new Chat thread named after the approval prompt (e.g., "Phase 2 Approval"). This allows the user to discuss the approval decision with the assistant before confirming. The "Continue in Assistant" button on any orchestrator CtA injects the current run context into a new Chat thread for interactive follow-up.

**Orchestrator subagent indicator:** When subagents are active during tier execution, the Current Task card shows "> 2 subagents active" with platform/model badges per subagent. Crew execution shows crew member list with per-member status dots (green=active, gray=waiting, red=error).

**Platform quota display:** Dashboard card showing per-platform quota status. Format: "Codex: 2/5 crews active, 45/100 quota remaining" (numbers are illustrative). Color-coded: green (plenty remaining), amber (>70% used), red (>90% used or rate-limited). Links to Usage page for details.

**Stream event visualization:** During active runs, a compact icon strip shows live events as they occur (e.g., file read icon, bash icon, search icon, edit icon). Each icon has a tooltip showing the event detail (e.g., "Read: src/app.rs"). Icons fade in with 100ms ease-out. Strip is below the Current Task card.

**Duration timers:** When the orchestrator or a subagent is running, show per-segment elapsed time in the Current Task card: "Thinking: 0:12", "Bash: 0:45", "Total: 1:23". Updates every second via `invoke_from_event_loop`. Paused segments show accumulated time without incrementing.

**Background runs panel:** When runs are executing in background threads, a collapsible "Background Runs" card lists active runs: thread name, status (running/paused/queued), elapsed time, and actions: "Cancel" (confirmation modal) and "View diff" (opens File Editor diff view showing all changes from this run). Completed runs show "View diff" and "Restore point" buttons.

**Restore point preview:** Before confirming a rollback to a restore point, show a diff preview: list of files that will change, with +/- line counts. "Confirm rollback" and "Cancel" buttons. Rollback uses Git restore point.

**Rate-limit alert banner:** Non-intrusive warning banner at the top of primary content area when any platform is approaching its usage limit (configurable threshold, default 80%). Format: "[!] Codex usage at 85% -- resets in 2h 15m [Switch platform] [Dismiss]". Banner uses amber background. Dismissing hides for 1 hour (or until next threshold crossing).

**Config migration dialog:** On version upgrade, if new config fields are introduced, show a one-time modal: "Settings updated for v{version}" with a summary of new options. "View new settings" opens Settings page filtered to new fields. "OK" dismisses. Non-blocking (app is usable behind the modal).

**Version update banner:** When a new app version is available, show a dismissible banner: "Puppet Master v{new_version} available [Update now] [Later]". "Update now" opens the relevant update mechanism. "Later" dismisses until next launch.

**FileSafe status:** Optional compact card showing guard count ("FileSafe: 3/3 guards active") with link to Settings > Advanced > FileSafe.

### 7.3 Projects

**Group:** Home | **Location:** Primary content

Project management and switching. Shows project list with status indicators, current project info. Controls for creating, opening, and switching projects.

**Project list layout:**
- Table/card list: project name, path, language badge(s), last opened, orchestrator status (idle/running/paused), health indicator
- Sort by: name, last opened, status
- Filter by: language, status
- Actions per row: Open, Edit settings, Remove (does not delete files, just un-registers), Archive
- "Add project" button: opens native folder picker; validates the selected directory (checks for git init, detects language)

**Language/framework auto-detection (MVP):** On project open or add, Puppet Master scans the project root (max depth 3) for language markers and displays detected languages as badges in the project header and project list.

**Detection rules (evaluated in order, all matches shown):**

| Marker File(s) | Detected Language/Framework | Badge Text |
|---------------|-----------------------------|------------|
| `Cargo.toml` | Rust | `Rust` |
| `package.json` | JavaScript/TypeScript | `JS/TS` |
| `tsconfig.json` | TypeScript | `TypeScript` |
| `pyproject.toml`, `setup.py`, `requirements.txt` | Python | `Python` |
| `go.mod` | Go | `Go` |
| `pom.xml`, `build.gradle`, `build.gradle.kts` | Java/Kotlin | `Java` or `Kotlin` |
| `*.csproj`, `*.sln` | C# / .NET | `C#` |
| `Gemfile` | Ruby | `Ruby` |
| `Package.swift` | Swift | `Swift` |
| `mix.exs` | Elixir | `Elixir` |
| `composer.json` | PHP | `PHP` |
| `CMakeLists.txt`, `Makefile` | C/C++ | `C/C++` |
| `Dockerfile` | Docker | `Docker` |
| `.slint` files | Slint | `Slint` |

**Detection behavior:**
- Runs on project open (async, non-blocking). Results cached in redb per project; re-scanned on explicit refresh or when file watcher detects marker file changes.
- **Badge display:** Language badges appear in the project header bar (below the breadcrumb, next to the project name). Each badge is a small pill: language icon + name, using `Theme.accent-blue` background. Multiple badges for polyglot projects (e.g., a Rust project with Docker and TypeScript tooling shows all three).
- **Auto-suggested tool presets:** On detection, Puppet Master pre-selects relevant LSP servers (e.g., detect Rust -> enable rust-analyzer in Settings > LSP). Also suggests relevant skills if any match the detected language. Suggestions appear as a one-time dismissible banner: "Detected Rust project -- rust-analyzer enabled [View LSP settings] [Dismiss]".
- **Interview integration:** Detected languages are passed to the Interview system so that questions about tech stack can be pre-populated. The Interview "Technology" phase shows detected languages as pre-filled chips that the user can confirm or edit.
- **Manual override:** User can manually add or remove language tags in the project settings (accessible from the project dropdown or Projects page). Manual tags are stored alongside auto-detected ones; manual removals suppress auto-detection for that language until the user re-enables.

**Project health indicators:**
- Green dot: project directory exists, git repo intact, config valid
- Amber dot: stale config (schema version mismatch), missing optional files
- Red dot: project directory missing, git repo corrupt, critical config errors
- Tooltip on hover shows specific health details

### 7.4 Settings (Unified)

#### 7.4B Agent Config
`Agent Config` is the management home for assistant-facing runtime packages and configuration that travel with the assistant experience rather than with global system dependencies.

Minimum tabs:
- `Personas`
- `Skills`

Rules:
- This supersedes older standalone `Skills page` wording.
- `Settings` remains the home for system-wide dependencies, provider accounts, permissions, models, LSP, MCP, and other global runtime configuration.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Personas.md, ContractName:Plans/assistant-chat-design.md

#### 7.4C Skills tab
The Skills tab shows a browseable catalog of currently available skills.

Required capabilities:
- distinguish bundled PM skills, imported skills, and installed catalog skills
- show readiness / validation state and missing-runtime requirements
- allow drag/drop import and file-picker import
- allow launching the Skill Store for browse/install flows only
- keep management actions in the catalog itself rather than moving them into slash commands

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

#### 7.4.B Source Control, GitHub Actions, and Docker Manager settings normalization

The unified Settings surface MUST expose configuration and persistence controls for the three operational side panels without redefining their runtime contracts.

Required Settings coverage:
- Source Control: auto-fetch interval, default diff mode, history/graph filters, default compare target, worktree visibility preferences, merge/conflict presentation defaults
- GitHub Actions: default subview, refresh interval, pinned workflows, current-branch focus behavior, log display preferences, admin-scope visibility
- Docker Manager: runtime defaults, hidden-subview policy, default subview, requested auth mode, registry defaults, build/bake defaults, compose defaults, Kubernetes visibility and namespace/context focus, Publish / Unraid defaults

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md

State ownership rules:
- shared defaults live in Settings
- panel navigation and selection state restore per project
- secrets remain outside redb and are never stored in panel-state records
- requested vs effective capability differences MUST be visible when they alter the enabled/disabled state of panel actions

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

#### 7.4.R Retrieval & Search (Memory tab; project-scoped; complements Context Injection)

In addition to the three required Context Injection toggles (**Parent Summary**, **Scoped `AGENTS.md`**, **Attempt Journal**) defined by `Plans/Contracts_V0.md#ContextInjectionToggles`, the Memory tab MUST include a **Retrieval & Search** configuration card that governs **project-scoped auto-retrieval (RAG)** and **agent-callable search** across chat history, workspace code, and project logs.

ContractRef: ContractName:Plans/assistant-chat-design.md#10-chat-history-search, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

**Group:** Settings | **Location:** Primary content

This is a **heavily redesigned** unified settings page that merges four previously separate views. It uses a tabbed interface.

**Tabs:**

| Tab | Content | Source |
|-----|---------|--------|
| **General** | Log level, auto-scroll, show timestamps, minimize to tray, start on boot, retention days, intensive logging, **Interaction Mode (Expert/ELI5)**, UI scale, max editor tabs, run-complete notification toggle, max concurrent runs per thread, sound effects toggle, max terminal instances, max browser tabs, hot-reload debounce, theme management, and per-platform concurrency limits. | Old "Settings" view + newfeatures.md |
| **Tiers** | Phase/task/subtask tier configuration; per-tier platform, model, reasoning_effort, plan_mode, ask_mode, output_format. | Old "Config" Tiers tab |
| **Branching** | Enable Git, Auto PR, branch strategy, Use worktrees, Parallel execution, granularity, Git info display, and Orchestrator concurrency overrides. | Old "Config" Branching tab |
| **Verification** | Verification checks and screenshot toggles. | Old "Config" Verification tab |
| **Memory** | Multi-level memory with progress/agents/PRD file paths, Context Injection toggles, and Retrieval & Search controls. | Old "Config" Memory tab |
| **Budgets** | Per-platform token budgets. | Old "Config" Budgets tab |
| **Advanced** | FileSafe Guards, MCP Configuration, Containers & Registry, CI / GitHub Actions, sub-agent toggles, cleanup config, and the explicit removal of legacy per-platform experimental toggles. | Old "Config" Advanced tab + newtools.md + FileSafe.md + MiscPlan.md + GitHub_API_Auth_and_Flows.md |
| **Permissions** | Dedicated permissions management screen with scope selector, wildcard default, per-tool override table, presets, allowlists, doom_loop policy, and per-Persona permission profile editor. | Plans/Permissions_System.md + Plans/Tools.md |
| **LSP** | Language Server Protocol settings, built-in/custom server controls, env/init options, and project override disclosure. | Plans/LSPSupport.md |
| **Interview** | Interview-specific config, subagent toggles, Multi-Pass Review settings, question bounds, architecture confirmation, vision provider, and Interview concurrency overrides. | Old "Config" Interview tab + interview-subagent-integration.md |
| **Media** | Media generation configuration. Capability toggles and model selectors remain here, but eligibility follows the canonical Gemini auth/account model. Cursor image generation remains enabled without Gemini credentials; non-Cursor media requires an eligible Gemini account under the same requested/effective auth/account rules as standard Gemini usage. | Plans/Media_Generation_and_Capabilities.md |
| **Authentication** | Per-provider auth status with real-time auth state chips, login/logout/re-auth buttons, auth method indicators, auth URLs, Git info, and auth realm split for `github_api` / `copilot_github`. Gemini appears as **one provider** with grouped `OAuth` and `API key` account lists, `requested_auth_mode = auto | oauth | api_key`, provider summary fields for current effective account/current effective auth mode/recent switch reason/cooldown summary, and per-account rows for label, auth-surface badge, provider identity metadata, configured project id, auth/configuration/availability state, priority integer, threshold, cooldown, retry budget, and manual set-active override. The API-key group may show a `Get API key` link, but copy MUST NOT imply AI Studio is the only source of valid keys. OAuth and API key are different quota/plan paths and MUST be disclosed as such. | Old "Login" view + Plans/Multi-Account.md + Plans/rewrite-tie-in-memo.md |
| **Health** | System health checks with platform filtering, status (PASS/FAIL/WARN/SKIP), fix suggestions, install/uninstall actions, direct-provider auth/connectivity checks, platform versions, manual path override for Cursor/Claude, worktree management, storage/cleanup actions, and multi-account health visibility. Gemini health includes grouped OAuth/API-key accounts, current effective account, current effective auth mode, auth/configuration/availability state, cooldown/auth freshness, and validation-required / needs-configuration disclosure where applicable. | Old "Doctor" view + WorktreeGitImprovement.md + MiscPlan.md + Plans/Multi-Account.md |
| **Rules & Commands** | Application rules, project rules, User Commands management, dry-run preview, shortcut binding, and schema validation. | agent-rules-context.md + feature-list.md + Commands_System.md |
| **Shortcuts** | Full keyboard shortcut table with change/reset/reset-all and export/import. | MiscPlan.md |
| **Plugins** | Manage installed plugins, enable/disable, reload, and plugin log viewer. | Plans/Plugins_System.md |

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/rewrite-tie-in-memo.md

Additional Retrieval & Search controls within the Memory tab card:
- **Project chat history** (Tantivy chat index; `chatsearch`)
- **Project workspace code** (Tantivy code index + LSP + ripgrep; `codesearch`)
- **Project logs** (Tantivy logs index; `logsearch`/`logread`)

**Source allowlist toggles (per project):**
- `retrieval.allow_chat_history` (default **ON**)
- `retrieval.allow_code` (default **ON**)
- `retrieval.allow_logs` (default **ON**)

**Auto-retrieval mode per source (per project):**
- Enum: `off | auto | always`
- Keys: `retrieval.mode.chat_history`, `retrieval.mode.code`, `retrieval.mode.logs`
- Default: **auto** for all three sources.
- Note: `auto` uses deterministic trigger heuristics and budgets (see `Plans/assistant-chat-design.md` §10.1).

**Budgets / caps (per project):**
- `retrieval.max_queries_per_turn.<source>` (default: `2`)
- `retrieval.max_hits_per_query.<source>` (default: `5`)
- `retrieval.max_injected_bytes_per_turn.<source>` (default: `24_000`)
- `retrieval.max_injected_bytes_per_turn.total` (default: `48_000`)
- `retrieval.logs.max_lookback_days` (default: `7`)

**Secrets policy (mandatory; non-configurable):**
- Puppet Master MUST enforce `PolicyRule:no_secrets_in_storage` / `INV-002`: secrets (tokens/credentials/private keys) are stripped/redacted before any content is persisted to seglog/redb/Tantivy/blob files.
- This mandatory scrub applies regardless of Retrieval settings and cannot be disabled.

**Additional heuristic redaction (optional; default OFF):**
- Toggle: `retrieval.redaction.secretish_enabled` (default **OFF**)
- When enabled, apply an additional aggressive "secret-ish" redaction pass (on top of the mandatory scrub) to:
  - log index summaries/snippets
  - retrieved-context injection snippets (logs)
  - optional code snippets displayed in retrieval blocks
- UI copy must warn: "Heuristic redaction is best-effort and may hide useful details; it does not replace the mandatory secrets policy."

**Thread-local override (UI):**
- The chat header/footer includes an **Auto Retrieval** On/Off chip per thread (`Plans/assistant-chat-design.md` §12.1). This override is stored per thread and does not change project defaults.
- The chip animates while retrieval is in-flight and links to the latest retrieval audit entry (§13).

**Permissions interplay (required):**
- Retrieval settings do not bypass Permissions: tool permissions still apply (`chatsearch`, `codesearch`, `logsearch`, `logread`, `webfetch`, `websearch`, `repo.import`).
- If a source is allowed in Retrieval settings but the corresponding tool is denied by Permissions, that source is effectively disabled for the run and the UI must show the disabled reason consistent with other capability/permission UI.

ContractRef: ContractName:Plans/assistant-chat-design.md#10-chat-history-search, ContractName:Plans/assistant-chat-design.md#17-context-truncation, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002
### 7.4A LSP settings and override semantics

The unified Settings surface exposes the canonical LSP configuration without redefining backend policy.

Required GUI behavior:
- show app-level LSP settings backed by `config.lsp`
- show when a project-level override from `.puppet-master/lsp.json` is active
- display the locked defaults from Plans/LSPSupport.md
- make clear that project overrides replace app-level values according to the canonical merge rule rather than creating a third settings plane

Required visible defaults:
- `didChangeDebounceMs=100`
- `hoverTimeoutMs=5000`
- `completionTimeoutMs=5000`
- `workspaceSymbolTimeoutMs=10000`
- `hoverDelayMs=300`
- `workspaceFolders` cap = 10 active roots

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

**§7.4.X Context Injection (Memory tab; per-project; optional per-run override)**

Rule: Puppet Master MUST expose three per-project Context Injection toggles (default ON): Parent Summary, Scoped `AGENTS.md` beyond top-level, and Attempt Journal. The toggles MUST affect Instruction/Memory bundle assembly deterministically, and the UI MUST display an “Injected Context” breakdown per run/turn (paths + byte counts; truncation reason).

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

Rule: When users edit `AGENTS.md` in Puppet Master (via File Editor or any in-app editing surface), Puppet Master MUST apply lightness lint + budget enforcement, and strict mode MUST be able to block runs when budgets are exceeded.

ContractRef: ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

**§7.4.0 Interaction Mode and Dual-Copy Contract (SSOT):**

Puppet Master uses two independent Expert/ELI5 controls:

- **App-level control (Settings > General):** Label is **Interaction Mode (Expert/ELI5)**. Canonical setting: `app_eli5_enabled` (or equivalent), default **ON** (ELI5). This controls authored tooltip/help strings and interviewer Q&A display copy.
- **Chat-level control (Chat input toolbar):** Label is **Chat ELI5**. Canonical setting: `chat_eli5_enabled` (or equivalent), default **OFF** (Expert/default LLM behavior). This control only modifies assistant instruction style for that chat thread/session.
- **Independence rule:** The controls must remain independent. Example supported combination: app ELI5 ON (simple tooltips/interviewer copy) while chat ELI5 OFF (technical chat responses).
- **Storage rule:** Persist app-level and chat-level toggles separately; never derive one from the other.
- **Migration alias:** Legacy `interaction_mode` values map to app-level behavior only (`eli5` => app ELI5 ON, `expert` => app ELI5 OFF).

**Dual-copy requirement (in-scope authored copy):**

- Every in-scope authored copy item must have both variants: `expert` and `eli5`.
- In-scope for this contract: tooltip/help copy, interviewer Q&A copy shown to users, and chat response-style prompt instructions.
- Out of scope: externally generated dynamic content (for example LSP hover payloads, web snippets, model-produced message bodies beyond style instruction).

**Single auditable checklist (authoritative table):**

| copy_id | Surface | Inventory source | Expert variant | ELI5 variant | Status |
|---|---|---|---|---|---|
| `tooltip.interview.*` | Settings/Interview tooltips | `src/widgets/tooltips.rs` keys with `interview.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.wizard.*` | Wizard tooltips | `src/widgets/tooltips.rs` keys with `wizard.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.tier.*` | Tier/config tooltips | `src/widgets/tooltips.rs` keys with `tier.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.branching.*` | Branching/worktree tooltips | `src/widgets/tooltips.rs` keys with `branching.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.memory.*` | Memory tooltips | `src/widgets/tooltips.rs` keys with `memory.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.orchestrator.*` | Orchestrator tooltips | `src/widgets/tooltips.rs` keys with `orchestrator.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.verification.*` | Verification tooltips | `src/widgets/tooltips.rs` keys with `verification.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.budget.*` | Budget tooltips | `src/widgets/tooltips.rs` keys with `budget.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.cli_paths.*` | CLI path tooltips | `src/widgets/tooltips.rs` keys with `cli_paths.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.network.*` | Network/API tooltips | `src/widgets/tooltips.rs` keys with `network.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.loop_guard.*` | Loop guard tooltips | `src/widgets/tooltips.rs` keys with `loop_guard.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.checkpointing.*` | Checkpointing tooltips | `src/widgets/tooltips.rs` keys with `checkpointing.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.subagent_*` | Subagent platform tooltips | `src/widgets/tooltips.rs` keys with `subagent_` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.experimental_*` | Experimental feature tooltips | `src/widgets/tooltips.rs` keys with `experimental_` prefix | Legacy-only | Legacy-only | Legacy Iced implementation only; MUST NOT be implemented in the Slint rewrite. See Plans/rewrite-tie-in-memo.md. |
| `chat.style.prompt_instruction` | Chat assistant system instruction | `Plans/assistant-chat-design.md` §2.1 | Required | Required | Required |
| `interview.copy.question` | Interview question text shown to user | Interview prompt/copy pipeline | Required | Required | Required in rewrite |
| `interview.copy.explanation` | Interview "what this means/why it matters" text | Interview prompt/copy pipeline | Required | Required | Required in rewrite |
| `interview.copy.feedback` | Interview feedback/correction text shown to user | Interview prompt/copy pipeline | Required | Required | Required in rewrite |

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md

**Audit rule:** Any row above marked "Required" must not ship with a missing variant. No in-scope row may remain single-variant.

**Tab sub-grouping:** With 24 tabs, use a two-level navigation: left sidebar within Settings for groups, right area for the selected tab's content. Group labels act as collapsible section headers in the sidebar. Groups: **Core** (General, Tiers, Branching) | **Features** (Verification, Memory, Budgets, Permissions, Advanced, Interview, LSP, Models, Media) | **System** (Authentication, Health, Rules & Commands, Shortcuts, HITL) | **Extensions** (Plugins, Formatters, Catalog, Sync, SSH, Debug) | **Raw** (YAML). Each group header shows item count badge. Clicking a group header expands/collapses that group in the sidebar. Active tab highlighted with accent-left-border (3px).

**§7.4.2 LSP (LSP tab):** LSP support is **MVP** (required for desktop release), not optional. Per Plans/LSPSupport.md, the GUI must expose full LSP configuration so users can control automatic downloads, enable/disable servers, set env and initialization options, and add custom servers. Provide **Settings > LSP** with:

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not download or install any LSP server automatically (equivalent to `OPENCODE_DISABLE_LSP_DOWNLOAD=true`). Servers already on PATH or already installed are still used.
- **Built-in LSP servers** -- A list of all built-in servers (see Plans/LSPSupport.md §3.2: astro, bash, clangd, csharp, clojure-lsp, dart, deno, elixir-ls, eslint, fsharp, gleam, gopls, hls, jdtls, julials, kotlin-ls, lua-ls, nixd, ocaml-lsp, oxlint, php intelephense, prisma, pyright, ruby-lsp, rust, slint-lsp, sourcekit-lsp, svelte, terraform, tinymist, typescript, vue, yaml-ls, zls). Each row shows: **server name** (and extensions hint), **Enable** toggle (default: **on** for all). User can turn any server off individually. Expanding a row (or opening "Configure") shows:
  - **Environment variables** -- Key-value list (e.g. `RUST_LOG` = `debug`). Optional; sent when starting that server.
  - **Initialization options** -- Key-value or JSON object; server-specific options sent in the LSP `initialize` request (e.g. TypeScript preferences). Optional.
- **Custom LSP servers** -- Section "Custom LSP servers" with **Add** button. Each custom entry has: **Name** (id), **Command** (array of strings, e.g. `["npx", "godot-lsp-stdio-bridge"]` or `["custom-lsp-server", "--stdio"]`), **Extensions** (comma-separated or list, e.g. `.gd`, `.gdshader`), and optionally **Environment variables** and **Initialization options** (same as built-in). Edit and Remove per row. Custom servers are in addition to built-in; same config schema (command, extensions, env, initialization) as OpenCode.

**Custom LSP server validation:** When adding or editing a custom server, enforce: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension, e.g. `.gd`). If empty, show inline error "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed; user must correct before persisting.

**Initialization options (JSON):** When the user edits **Initialization options** as JSON (e.g. raw text area or "Edit as JSON" for built-in/custom servers), validate on blur or on Save. If the value is **invalid JSON** (parse error): show an inline error message (e.g. "Invalid JSON: unexpected token at line N") and do **not** persist the invalid value. Optionally preserve the user's text in the editor so they can fix it; on next valid parse, clear the error and allow Save. If the user leaves the field with invalid JSON and clicks Save, block save and focus the field with the error message. Do not send invalid JSON to the LSP server at startup (use last known valid value or empty object).

All LSP settings are persisted in app config (redb or equivalent). Optional: project-level overrides (e.g. `.puppet-master/lsp.json` or project key in redb) so a project can disable a server or add a custom server for that project only; document merge rules (project overrides app) in implementation.

**§7.4.1 Tool permissions:** Tool permissions have been promoted from a collapsible card in Advanced to a dedicated **Permissions** tab (see §7.4.10). The canonical SSOT for permission actions, precedence, granular rules, defaults, and GUI requirements is `Plans/Permissions_System.md`. The tool registry (`Plans/Tools.md`) supplies the list of known tool names to populate the Permissions tab.

**Critical form control requirements:**
- **Model selection MUST use dropdowns** populated from dynamic model discovery, NOT text entry boxes
- **Platform selection MUST use dropdowns** listing available platforms
- All configuration that accepts one of N choices must use `ComboBox` (dropdown), not free-text `TextInput`.
- Save/discard controls per tab or global
ContractRef: ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/DRY_Rules.md#7

**§7.4.3 Catalog (Catalog tab):** Browse and install community content from a curated catalog. The catalog provides one-click installation for commands, agents, hooks, skills, themes, and MCP server configurations.

**Catalog UI layout:**
- **Search bar** at top with real-time filtering (debounced 200ms). Search across name, description, tags.
- **Category tabs** below search: All | Commands | Agents | Hooks | Skills | Themes | MCP Servers
- **Content grid:** Card-based layout (3 columns at >1200px, 2 at 800-1200px, 1 at <800px). Each card shows:
  - Item name (bold), author, version, short description (2 lines max, truncated with ellipsis)
  - Category badge (color-coded per category)
  - Star rating or download count (if available from catalog service)
  - Install/Installed status: "Install" button (primary) or "Installed v1.2" label with "Update" button (if newer version available) and "Remove" button
  - Click card to expand: full description, changelog, compatibility info, file list, "View source" link
- **Catalog source:** Reads from a bundled index file (`~/.puppet-master/catalog/index.json`) that is refreshed periodically (default: daily, configurable). "Refresh catalog" button forces re-download. If no network: show last cached index with "Catalog may be outdated" banner.
- **Install flow:** Click "Install" -> confirmation modal showing what will be installed (files, permissions needed) -> progress bar -> success toast "Installed {name} v{version}" or error toast with details. Installed items appear in their respective Settings tabs (e.g., installed skills show in Skills tab, installed themes show in theme selector).
- **Conflict handling:** If an installed item conflicts with an existing local item (same name), show conflict resolution: "A skill named '{name}' already exists locally. [Replace] [Keep both (rename)] [Cancel]".
- **Empty state:** "Catalog is empty -- check your network connection or refresh" with "Refresh" button.

**§7.4.4 Sync (Sync tab):** Export, import, and sync app configuration, custom commands, shortcuts, themes, and skills across machines.

**Sync UI:**
- **Export section:**
  - "Export configuration bundle" button. Opens a checklist modal where the user selects what to include: General settings, Tier configuration, Keyboard shortcuts, Custom commands, Skills, Themes, MCP server configs, LSP settings, Tool permissions, Rules. Each item shows a size estimate.
  - Export format: `.pm-bundle` file (ZIP archive containing TOML/JSON config files + asset files). Filename auto-generated: `puppet-master-config-{date}.pm-bundle`.
  - "Export" button generates the bundle and opens a native Save dialog.
- **Import section:**
  - "Import configuration bundle" button. Opens native file picker filtered to `.pm-bundle` files.
  - On import: parse bundle, show contents preview (list of config sections with current vs imported values summary). Per-section toggles: include/exclude each section from import.
  - **Conflict resolution:** For each conflicting item (e.g., a shortcut that differs from current), show side-by-side comparison: "Current: Ctrl+K -> Command palette" vs "Imported: Ctrl+K -> Search files". Options per conflict: [Keep current] [Use imported] [Keep both]. "Apply to all similar" checkbox.
  - "Apply" button merges selected sections. Progress indicator. Success toast with summary: "Imported: 3 shortcuts, 5 skills, 1 theme. Skipped: 2 conflicts (kept current)."
  - **Backup:** Before import, auto-create a backup of current config in `~/.puppet-master/backups/pre-import-{timestamp}.pm-bundle`. Show "Undo import" button in success toast (restores from backup).
- **Sync status:** Shows last export date, last import date, and bundle file path (if saved locally). No cloud sync in MVP -- file-based only.

**§7.4.5 SSH (SSH tab):** Manage SSH connections for remote file editing. When an SSH connection is active, the File Manager and File Editor can browse and edit files on the remote host.

**SSH UI:**
- **Connection list:** Table of saved SSH connections. Columns: name (user-assigned), host, port, username, auth method (key/password), status (connected/disconnected/error). Actions per row: Connect, Disconnect, Edit, Remove.
- **Add connection form:** Name (text input), Host (text input, required), Port (number input, default 22), Username (text input, required), Authentication method (radio: SSH key file / Password / SSH agent):
  - SSH key file: file picker for private key path, optional passphrase (password input)
  - Password: password input (stored securely in system keychain, not in plain text config)
  - SSH agent: auto-detect available keys from running SSH agent
- **Connection testing:** "Test connection" button (shows spinner -> "Connected successfully" or error message with details). Test must pass before saving.
- **Remote file browsing:** When connected, the File Manager (§7.17) gains a "Remote" toggle or dropdown at the top showing available connections. Selecting a remote connection switches the file tree to browse the remote host's filesystem. Path navigation shows `[remote-name]:/path/to/dir` prefix. File operations (open, save, create, delete, rename) are proxied over SSH/SFTP.
- **Editor integration:** Files opened from a remote connection show a `[SSH: remote-name]` badge in the editor tab. Save operations write back via SFTP. Unsaved changes are buffered locally; if connection drops, show warning banner: "Connection lost -- changes saved locally. Reconnect to sync." with "Reconnect" button.
- **Latency indicator:** Status bar shows SSH connection latency (e.g., "SSH: dev-server 45ms"). High latency (>500ms) shows amber indicator; connection errors show red.
- **Security:** Private keys never leave the local machine. Passwords stored in OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service). SSH host key verification with known_hosts management. First-connection fingerprint prompt: "Unknown host {host}. Fingerprint: {fingerprint}. [Trust and connect] [Cancel]".
- **Persistence:** Connection profiles saved in redb (minus passwords, which go to system keychain). Last-connected state restored on app launch (auto-reconnect configurable, default off).

**§7.4.6 Debug (Debug tab in Settings):** Configure debug adapters and default run/debug settings.

**Debug settings UI:**
- **Debug adapters:** Table of available debug adapters. Columns: adapter name, type, supported languages, path, status (installed/not found). Built-in adapters: codelldb (Rust, C, C++), debugpy (Python), node-debug (JavaScript, TypeScript). Per-row actions: Configure (set path, env vars), Remove (custom only). "Add custom adapter" button: name, type, command (path to adapter executable), supported language extensions, environment variables.
- **Default configurations:** Template run/debug configurations that are copied to new projects. Each template: name, type (launch/attach), default program/command pattern, default arguments, default environment variables, default working directory, pre-launch task.
- **Breakpoint settings:** Global preferences: break on uncaught exceptions (toggle, default on), break on caught exceptions (toggle, default off), max breakpoints per file (default 50).
- **Auto-detect adapters:** "Scan for adapters" button checks PATH and common install locations for known debug adapter binaries. Found adapters are auto-configured. Scan results shown in a modal: "[checkmark] codelldb found at /usr/local/bin/codelldb" / "[x] debugpy not found -- install with pip install debugpy".
- **Integration:** Debug adapter settings feed into the Bottom Panel Debug tab (§7.20). Project-level `.puppet-master/launch.json` overrides these defaults per Plans/FileManager.md.

**§7.4.7 Per-Platform Concurrency Limits (Global + Per-Context Overrides):**

Per-platform concurrency limits control the maximum number of concurrent agent/subagent processes spawned per platform (provider). These limits exist for two reasons:

1. **Provider rate limits:** Each provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project. Too many concurrent processes degrade the user's development environment.

**Global defaults (Settings > General > Per-platform concurrency limits):**

A collapsible card titled "Per-Platform Concurrency Limits" with a per-platform row for each of the 6 providers. Each row: platform name + icon, spinner (range 1-10). Defaults: Cursor: 3, Claude Code: 3, OpenCode: 2, Codex: 2, GitHub Copilot: 2, Gemini: 2. These defaults apply to all execution contexts unless overridden.

Tooltip (Expert): "Maximum concurrent agent processes per platform. Limits apply across all execution contexts (Chat, Interview, Orchestrator) unless overridden per context. Prevents provider rate-limit errors and reduces local machine load (CPU, disk I/O)."

Tooltip (ELI5): "How many tasks can run at the same time on each AI platform. Lower numbers are safer — they prevent rate-limit errors and keep your computer responsive."

**Per-context overrides:**

Three execution contexts can override the global per-platform caps: **Chat**, **Interview** (includes Multi-Pass Review), and **Orchestrator**. Overrides are placed in each context's settings tab:

- **Chat:** Settings > General, below "max concurrent runs per thread." Collapsible "Chat concurrency overrides" card (collapsed by default). Same per-platform row layout. When not overridden, each row shows "Using global: N" in muted text. When overridden, shows the override value and an "(override)" badge. Clear button per row resets to global.
- **Interview:** Settings > Interview, below the Multi-Pass Review section. Collapsible "Interview concurrency overrides" card (collapsed by default). Same layout. Note: "max review subagents" (existing, 1-10) is a separate concern — it limits how many reviewer subagents participate in a single Multi-Pass Review run, not per-platform concurrency.
- **Orchestrator:** Settings > Branching, below "Parallel execution" toggle. Collapsible "Orchestrator concurrency overrides" card (collapsed by default). Same layout.

**Effective cap:** For a given context and platform, the effective cap = that context's override if set, else the global default. All execution managers (Chat runner, Interview phase manager, Orchestrator scheduler) must respect the effective cap when spawning agents/subagents.

**Interaction with "max concurrent runs per thread":** The per-thread cap (Settings > General, default 10) limits total concurrent runs in a single chat thread regardless of platform. The per-platform cap limits how many of those runs can use a specific platform. Both limits apply simultaneously; the more restrictive limit wins for any given spawn decision.

**Persistence:** Stored in the same config store as other settings (redb in rewrite, gui_config/YAML pre-rewrite). Option B run config (per WorktreeGitImprovement.md §5.2) must include the effective per-platform caps for the run.

**Config shape:**

```yaml
concurrency:
  global:
    per_provider:
      cursor: 3
      codex: 2
      claude: 3
      gemini: 2
      copilot: 2
  overrides:
    chat:
      per_provider: {}       # empty = use global for all
    interview:
      per_provider: {}
    orchestrator:
      per_provider: {}
```

When an override is set (e.g. `overrides.orchestrator.per_provider.claude: 5`), that value is used for that context+platform. When absent, the global value applies.

**Plan graph independence:** Max concurrent limits are NOT part of the user-project plan graph (`.puppet-master/project/plan_graph/`). The plan graph defines only dependency structure (`depends_on`, `blockers`/`unblocks`). Concurrency limits are an execution/config concern: the scheduler loads the plan graph, respects its dependency-derived parallelism structure, and applies the effective per-platform caps from config.

| copy_id | Surface | Expert variant | ELI5 variant | Status |
|---|---|---|---|---|
| `tooltip.concurrency.global` | Settings/General concurrency card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.chat_override` | Settings/General chat override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.interview_override` | Settings/Interview override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.orchestrator_override` | Settings/Branching override card | Required | Required | Required in Slint rewrite |

**§7.4.8 Containers & Registry (Advanced tab):**

Add a collapsible **Containers & Registry** card in Settings > Advanced for local container runtime, DockerHub publishing, and managed Unraid template defaults.

- **Runtime controls:** runtime selector (`docker` default), Docker binary path override, compose file path input with Browse/Auto-detect actions, compose project-name strategy (`auto`, `fixed`, `hash-based`), build context path, Dockerfile path, target stage, and target platforms / Buildx readiness.
- **DockerHub auth controls:** browser/device login action, PAT entry, helper text stating PAT is recommended, link/explainer for obtaining a PAT, stored-auth status, validated account/namespace summary, validate action, clear/remove credentials action, and requested-auth-mode vs effective-capability presentation.
- **Repository controls:** namespace selector, repository selector, refresh action, create-repository action, tag-template defaults (`{commit}`, `{version}`, `{timestamp}`), and push policy (`manual` default; optional `after_build`).
- **Create-repository safety:** the create-repository confirmation dialog MUST show namespace, repository name, and privacy; privacy defaults to private and MUST be visibly labeled as the default. This confirmation is non-bypassable.
- **Unraid controls:** `Generate/Update Unraid XML after successful publish` toggle (default enabled), `Manage Unraid template repository` toggle (default enabled), template repo path/remote/branch settings, setup flow (create-new vs select-existing), auto-push toggle (default disabled), one-click push action, and template-repo status row.
- **Docker Manage visibility:** include a setting named exactly `Hide Docker Manage when not used in Project.` Default: enabled.
- **`ca_profile.xml` controls:** scope selector (shared cross-project default vs per-project override), full edit surface, icon/image mode (repo-managed upload vs external URL), and warning state when the profile was auto-generated and still needs review.

**Validation behavior:** `Validate Docker configuration` MUST run inline preflight for Docker reachability, compose validity, Buildx readiness, requested-auth to effective-capability validation, selected repository access, managed template-repo validity (when enabled), and `ca_profile.xml` readiness.

Normative blocking matrix:
- Failures in Docker reachability / compose validity / Buildx readiness block Docker Build, Run/Preview, and Push entry points.
- Failures in DockerHub auth/repository-access block image-push entry points, but do not invalidate an already completed local build result.
- Managed template-repo validation failure (`unconfigured`, `config_invalid`, `diverged_remote`) does **not** block Docker image push; it blocks managed template update / auto-commit / template push actions and shows explicit remediation inline.
- `ca_profile.xml` review-required state does **not** block Docker image push; it blocks template auto-push and shows explicit review messaging inline.
- When a remote side effect is blocked by policy or confirmation requirements, the surface MUST present that outcome as **blocked** rather than **failed**, preserving any local build/publish result that already exists.

**Persistence behavior:** shared container defaults persist globally; project-specific Docker state persists per project.

Canonical scope split:
- Global app state:
  - runtime defaults
  - compose defaults
  - default push policy
  - `Hide Docker Manage when not used in Project.`
  - shared `ca_profile` source model
- Project state:
  - requested auth mode
  - selected namespace/repository/tag policy
  - last validation snapshot (non-secret)
  - template repo config/status
  - Docker Manage dock/tab/expanded-panel state
  - per-project `ca_profile` override state when override is enabled

Secrets persist only in OS credential storage or Docker credential-helper storage, never in redb.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md#147a-dockerhub-browser-auth-repository-management-and-unraid-publishing-addendum, ContractName:Plans/Permissions_System.md
**§7.4.9 CI / GitHub Actions (Advanced tab):**

Add a collapsible **CI / GitHub Actions** card in Settings > Advanced for workflow generation and management.

- **Template selector:** `docker-build-push`, `native-build-matrix`, `web-preview-and-test`, `mobile-ios-android`.
- **Template options:** trigger controls, matrix/build profile fields, optional publish/scanning toggles.
- **Secrets checklist:** deterministic list of required secrets for selected template and publish options.
- **Workflow actions:** `Generate workflow`, `Preview YAML`, `Apply to .github/workflows`.
- **Post-apply visibility:** generated workflows appear in a Settings list with edit/open actions.

ContractRef: ContractName:Plans/newtools.md#148-github-actions-settings--generation-contract, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**§7.4.10 Permissions (Permissions tab):**

> **SSOT:** The canonical specification for the Permissions GUI is `Plans/Permissions_System.md` §10. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Permissions_System.md#GUI-PERMISSIONS, ContractName:Plans/Tools.md

The **Permissions** tab in Settings provides a dedicated screen for managing tool permissions across all scopes. Layout:

1. **Scope selector** (top bar): Toggle between **Global** and **Project** (project visible only when a project is active). Indicates which config file is being edited (`~/.config/puppet-master/permissions.toml` or `<project>/.puppet-master/permissions.toml`). When in Global scope with a project active, show effective (merged) permissions with layer-of-origin badges.

2. **Presets bar**: Three buttons — "Read-only", "Plan mode", "Full" — each applying a batch of permission rules per `Plans/Permissions_System.md` §10.4. Clicking triggers a confirmation dialog: "This will replace your current permissions. Continue?"

3. **Global wildcard default**: Single dropdown (`Allow` | `Ask` | `Deny`) setting the fallback action for any tool without an explicit rule. Default: `Ask`.

4. **Per-tool override table**: Table of all known tools (built-in canonical names from `Plans/Permissions_System.md` §5 + MCP-discovered tools). Columns: Tool name, Category badge, Permission dropdown (`Allow` | `Ask` | `Deny`), expand chevron. Tool list populated from registry at load time.

5. **Granular rule editor** (per-tool expand): When a tool row is expanded, an ordered list of `{pattern, action}` entries with: "Add rule" button, drag handles for reorder (last-match-wins), delete button per row, pattern input with wildcard help tooltip (`*` and `?`).

6. **External directory allowlist** (collapsible card): Scrollable list of allowlisted paths; "Add path" button (text input + optional native directory picker); per-row delete; home expansion display.

7. **doom_loop policy** (collapsible card): Action dropdown (`Allow` | `Ask` | `Deny`), repeat threshold spinner (default 3, range 2–10), explanation text.

8. **Per-Persona permission profiles** (collapsible card): List of named profiles from `~/.config/puppet-master/permission-profiles/`. "Create profile" button opens a permission editor scoped to the new profile. Profile rows: name, override count, edit/delete. The `default_permissions_profile` dropdown in the Personas editor (`Plans/Personas.md` §4) is populated from this list.

9. **ELI5/Expert**: In ELI5 mode, only per-tool dropdowns and presets are visible. Granular rules, profile editor, allowlist, and doom_loop config are hidden. Tooltip prefix: `tooltip.permissions.*`.

**Tab sub-grouping update**: The Permissions tab belongs to the **Features** group in the Settings sidebar (alongside Verification, Memory, Budgets, Advanced, Interview, LSP).

**§7.4.11 Commands (Rules & Commands tab):**

> **SSOT:** The canonical specification for the Commands GUI is `Plans/Commands_System.md` §6. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS, ContractName:Plans/DRY_Rules.md

The **Rules & Commands** tab in Settings includes a **Commands** section for managing User Command presets. Layout:

1. **Scope selector** (top of Commands section): Toggle between **Global** (`~/.config/puppet-master/commands/`) and **Project** (`<project_root>/.puppet-master/commands/`; visible only when a project is active).

2. **Command list**: Table of all resolved commands (project + global). Columns: Name (with `/x-` prefix), Scope badge, Description (truncated), Persona (or "—"), Mode (or "inherit"), Model (or "inherit"), Subtask indicator. Project-local entries sort before global when names match.

3. **Create / Edit / Delete**: "New Command" button opens an editor with name, description, Persona dropdown, mode dropdown, model dropdown, subtask toggle, permissions profile override dropdown, and Markdown template editor. Edit pre-populates; delete confirms. Global commands offer "Save as project override" when a project is active.

4. **Dry-run preview**: "Preview" button resolves the template with sample arguments and displays the rendered prompt in a read-only Markdown view without submitting a run. Highlights placeholder substitutions, file includes, and shell injection results (or permission-blocked placeholders).

5. **Shortcut binding**: Per-command "Bind shortcut" action opens the shortcut capture UI. Bindings appear in Settings > Shortcuts as "Run command: \<name\>".

6. **Schema validation**: On save, validates name format, reserved-name collision, required description, mode/model format. Blocks save on errors.

7. **ELI5/Expert**: In ELI5 mode, only name, description, and a "Run" button are shown. Template editor, Persona/mode/model overrides, permissions profile, and dry-run are hidden in ELI5. Tooltip prefix: `tooltip.commands.*`.

**Tab sub-grouping update**: The Rules & Commands tab belongs to the **System** group in the Settings sidebar.

**§7.4.12 Plugins (Plugins tab):**

> **SSOT:** The canonical specification for the Plugins system is `Plans/Plugins_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Plugins_System.md#GUI-PLUGINS, ContractName:Plans/DRY_Rules.md

The **Plugins** tab in Settings provides visibility and control over discovered plugins. Layout:

1. **Plugin list**: Table of all discovered plugins (internal + project + global + config). Columns: ID, Name, Version, Source badge (Internal/Project/Global/Config), Enabled toggle, Component counts (commands, hooks, skills). Sorted by load order (internal first, then project, global, config; lexicographic within each source).

2. **Enable/Disable**: Per-plugin toggle. Disabling a plugin removes its hooks and tools from the active set without deleting the plugin from disk. Per-hook disable: expand a plugin row to see its registered hooks; each hook has an independent enable/disable toggle.

3. **Plugin details**: Expand a plugin row to see: registered hook events, registered custom tools (with collision status), and the plugin's log output (filtered from structured log).

4. **Reload plugins**: "Reload" button re-scans discovery paths and reloads all plugin manifests. Toast confirms reload with count.

5. **Per-Persona disabling**: A note linking to Agent Config > Personas where `disabled_plugins` can be set per Persona.

6. **ELI5/Expert**: In ELI5 mode, show only plugin name, description, and enabled toggle. Component counts, log viewer, and hook-level toggles are hidden. Tooltip prefix: `tooltip.plugins.*`.

**Tab sub-grouping update**: The Plugins tab belongs to the **Extensions** group in the Settings sidebar.

**§7.4.13 Formatters (Formatters tab):**

> **SSOT:** The canonical specification for the Formatters system is `Plans/Formatters_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Formatters_System.md#GUI-FORMATTERS, ContractName:Plans/DRY_Rules.md

The **Formatters** tab in Settings provides formatter configuration. Layout:

1. **Global toggle**: "Enable formatters" (bound to `config.formatters.enabled`; default: true). When off, no formatters run.

2. **Formatter table**: Table of all known formatters (built-in + custom). Columns: Name, File Extensions, Command, Enabled toggle. Built-in formatters are pre-populated from the canonical table (`Plans/Formatters_System.md` §2). Custom formatters appear below with a "Custom" badge.

3. **Add custom formatter**: "Add formatter" button opens a form: name (unique), command (with `$FILE` placeholder), extensions (comma-separated), optional environment variables. Validate command on save.

4. **Edit / Remove**: Edit button for custom formatters (built-in formatters only allow enable/disable and command override). Remove button for custom formatters only.

5. **Evidence link**: "View format events" link opens the Evidence ledger filtered to `format.applied` events.

6. **ELI5/Expert**: In ELI5 mode, show only formatter name, extensions, and enabled toggle. Command, environment, and evidence link are hidden. Tooltip prefix: `tooltip.formatters.*`.

**Tab sub-grouping update**: The Formatters tab belongs to the **Extensions** group in the Settings sidebar.

**§7.4.14 Models (Models tab):**

> **SSOT:** The canonical specification for the Models system is `Plans/Models_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Models_System.md#GUI-MODELS, ContractName:Plans/DRY_Rules.md

The **Models** tab in Settings provides model and variant configuration. Layout:

1. **Default model selector**: Provider dropdown + Model dropdown. Displays the canonical model ID (`provider_id/model_id`). Sets `config.model`.

2. **Variant selector**: Dropdown with built-in variants (default, fast, powerful) plus any custom variants. "Edit variants" button opens the variant editor. Variant cycling shortcut binding note.

3. **Variant editor** (collapsible card): List of custom variants with name, model ID, and description. Add/edit/remove custom variants. Built-in variants (default/fast/powerful) can be customized (model ID override) but not deleted. Disable a variant: toggle to exclude it from the cycling order.

4. **Per-Persona model overrides** (collapsible card): Table of Personas with `default_model` and `default_variant` columns. Edit button per row opens a model/variant picker. Clearing a field falls back to global config. Links to Agent Config > Personas for full Persona editing.

5. **Provider priority list** (collapsible card): Ordered list of provider IDs. Drag-to-reorder or up/down buttons. Determines the internal priority list for fallback when no model is explicitly set.

6. **Model options** (collapsible card): Per-provider-model option editor. Select provider + model, then edit options (temperature, max_tokens, top_p, reasoning_effort, etc.) as key-value fields.

7. **ELI5/Expert**: In ELI5 mode, show only default model selector and variant selector. Provider priority, model options, and per-Persona overrides are hidden. Tooltip prefix: `tooltip.models.*`.

**Tab sub-grouping update**: The Models tab belongs to the **Features** group in the Settings sidebar.

**§7.4.15 Media (Media tab):**

> **SSOT:** The canonical specification for media generation capabilities, capability gating, disabled reasons, request/response contracts, and UI copy is `Plans/Media_Generation_and_Capabilities.md`. This section provides the FinalGUISpec Settings integration points only; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ContractName:Plans/DRY_Rules.md

The **Media** tab in Settings provides enable/disable toggles and model selection for each media capability. Layout:

1. **Image Generation** (collapsible row):
   - **Enable** toggle (default: follows backend/provider eligibility — ON when Cursor image routing is active or at least one eligible Gemini account is configured for non-Cursor media; OFF otherwise).
   - **Model dropdown**: lists available image-generation models for the configured provider. Selection sets the default image model. Description panel below the dropdown changes dynamically with each model selection (short model description, supported features, max resolution).
   - Disabled-state rule: greyed out when no eligible Gemini account is configured for non-Cursor media **except** in Cursor chats where Image Gen remains enabled without Gemini credentials (routes via Cursor-native generation per `Plans/Media_Generation_and_Capabilities.md` §2.4).

2. **Video Generation** (collapsible row):
   - **Enable** toggle (default OFF; enablement requires an eligible Gemini account under the canonical requested/effective auth/account rules).
   - **Model dropdown** + dynamic description panel (same pattern as Image Gen).
   - Disabled-state rule: greyed out when no eligible Gemini account is configured.

3. **Text-to-Speech (TTS)** (collapsible row):
   - **Enable** toggle (default OFF; enablement requires an eligible Gemini account under the canonical requested/effective auth/account rules).
   - **Model dropdown** + dynamic description panel.
   - Disabled-state rule: greyed out when no eligible Gemini account is configured.

4. **Music Generation** (collapsible row):
   - **Enable** toggle (default OFF; enablement requires an eligible Gemini account under the canonical requested/effective auth/account rules).
   - **Model dropdown** + dynamic description panel.
   - Disabled-state rule: greyed out when no eligible Gemini account is configured.

**Disabled-state presentation:** When Gemini access is not configured for the resolved non-Cursor media path, the toggle and dropdown are rendered **greyed out** (non-interactive). A footnote below the disabled row displays: *"Configure Gemini access in Settings -> Authentication. Sign in with Gemini OAuth or add a Google/Gemini API key. [Get API key](https://aistudio.google.com/app/api-keys)"* When a capability is admin-disabled (toggle OFF), the model dropdown is hidden.

**DRY note:** Capability IDs, disabled-reason values, backend routing rules, and UI copy strings are defined in `Plans/Media_Generation_and_Capabilities.md` §1–§5 and MUST NOT be restated here.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ToolID:capabilities.get, ToolID:media.generate

**Tab sub-grouping update**: The Media tab belongs to the **Features** group in the Settings sidebar.

<a id="SKILLS-TAB"></a>

**§7.4.16 Skills (Agent Config > Skills):**

> **SSOT:** The canonical specification for skill identity, on-disk format, discovery roots, search order, shadowing, validation, and permission semantics is `Plans/Skills_System.md`. This section provides the FinalGUISpec GUI integration points only; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Skills_System.md#GUI-SKILLS, ContractName:Plans/DRY_Rules.md

The **Skills** management surface under **Agent Config > Skills** provides discovery, inspection, import/readiness visibility, and permission management for `SKILL.md` files. Skills are discovered from project-local roots (e.g., `.puppet-master/skills/`) and global roots (`~/.config/puppet-master/skills/`); the full set of discovery roots and their priority order is defined in `Plans/Skills_System.md` §3.

**Layout:**

1. **Skill list table**: Table of all discovered skills. Columns:
   - **Name**: Skill ID (from YAML frontmatter `name` field).
   - **Description**: Skill description (truncated with expand; see §10.10).
   - **Source**: Badge indicating Project or Global, with sub-label showing root origin (`.puppet-master`, `.claude`, `.agents`). Source column requirements per `Plans/Skills_System.md` §6.
   - **Permission**: Dropdown per row (`Allow` | `Deny` | `Ask`). Persisted per Skill ID in the permission store. Semantics defined in `Plans/Skills_System.md` §5.
   - **Status**: Validation indicator — green check for valid, red warning icon for invalid (hover shows error message). Invalid skills are listed but not loadable. Validation rules per `Plans/Skills_System.md` §3.3.
   - **Shadowed**: When a skill is shadowed by a higher-priority root, show amber badge "Shadowed" with tooltip listing the overriding skill's path. Shadowing rules per `Plans/Skills_System.md` §3.2.

2. **Actions toolbar** (above table):
   - **Add**: Opens a native directory picker to select a skill directory containing `SKILL.md`. Validates on selection; on success, copies to the active scope's skill root and re-scans.
   - **Edit**: Opens the selected skill's `SKILL.md` in the File Editor (§7.18). Disabled when no row is selected.
   - **Remove**: Deletes the selected skill directory from disk (confirmation modal: "Remove skill '{name}'? This cannot be undone." with [Remove] and [Cancel]). Disabled for shadowed-only entries or when no row is selected.
   - **Refresh**: Re-scans all discovery roots and rebuilds the skill list. Toast: "Skills refreshed — {N} skills found."
   - **Validate all**: Runs validation (per `Plans/Skills_System.md` §3.3) across all discovered skills and updates the Status column. Toast summary: "{N} valid, {M} invalid."

3. **Bulk permission** (below toolbar): Pattern input with "Apply" button. Example: entering `doc-*` and selecting `Allow` sets permission to Allow for all skills whose ID matches the glob pattern. Pattern matching uses the same `*` and `?` wildcards as the Permissions tab (§7.4.10).

4. **Skill preview** (row expand): Expanding a skill row reveals a read-only Markdown preview of the skill body (content after YAML frontmatter). For invalid skills, the expand area shows the validation error details instead.

5. **Scope indicator** (top bar): Shows whether the current project provides project-local skills. When no project is active, only global skills are listed with a note: "Open a project to see project-level skills."

**Error handling:**

- Discovery errors (e.g., unreadable directory, permission denied on a root): per-root warning banner at the top of the skill list: "Could not scan {root}: {error}". Other roots continue scanning.
- YAML parse failures: skill appears in the table with Status = invalid; expand shows the parse error. Skill is not loadable.
- Directory-name mismatch (folder name ≠ Skill ID): shown as a validation error in the Status column per `Plans/Skills_System.md` §3.3.

**ELI5/Expert**: In ELI5 mode, show only skill name, description, source, and permission dropdown. Status column, shadowed badge, bulk permission, and validate-all button are hidden. Tooltip prefix: `tooltip.skills.*`.

**Tab sub-grouping update**: Skill management lives under **Agent Config > Skills**, not as a standalone Settings sidebar tab.

### 7.5 Wizard

**Group:** Run | **Location:** Primary content

Multi-step requirements wizard (10 steps: 0-9):
- Step 0: Project Setup (new/existing, GitHub repo creation, intent selection: New project / Fork & evolve / Enhance / Contribute PR)
- Step 1: Dependency Install (platform CLIs and runtimes) -- NEW
- Step 2: Quick Interview Config (reasoning level, agents.md)
- Steps 3-8: PRD generation, tier configuration, tier planning
- Step 9: Final review and initialization

**Intent selection UI:** Four cards, each showing: intent name, one-line description, and themed icon. Selected card has accent border and filled background. Changing intent mid-flow triggers a confirmation modal: "Changing intent will clear requirements and interview progress. Continue?" with [Continue] and [Cancel] buttons.

**Project setup fields (intent-specific):**
- **New project:** Project path input; optional "Create GitHub repo" checkbox with sub-fields: repo name (pre-filled from project name), visibility (Public/Private radio), description (text input), .gitignore template (dropdown), license (dropdown: MIT, Apache 2.0, GPL-3.0, etc.), default branch (text input, default "main").
- **Fork & evolve / Contribute PR:** Upstream repo input (URL or owner/repo); "Create fork for me" or "I'll create the fork myself" radio; fork URL/path input when manual.
- **Contribute PR:** Feature branch name input (text input with auto-suggest from requirements slug; sanitized per git ref rules).

**Requirements step:** Upload files (max 10 files, max 5 MiB per file; drag-and-drop or file picker; list display with remove and reorder; reject oversized files with inline error). Requirements Doc Builder button opens Builder chat mode. First Builder Assistant message is context-sensitive: `What are you building?` (new project), `What are you adding or changing?` (existing project), or `What are you adding or changing in this fork?` (fork / contribute). Multiple uploads are concatenated in display order after deterministic text normalization; Builder output is appended after uploads.

**Builder conversation flow (required):**
- Turn definition: one Assistant message plus one user response.
- Suggest generation when enough context exists or after 6 completed turns. Suggestion does not auto-generate.
- User can continue conversation indefinitely until explicit generation confirmation.
- On generation confirmation, ask qualifying questions only for missing or thin checklist sections, then generate requirements doc + contract seed pack.
- Before Multi-Pass or handoff, ask: `Do you want to make any more changes or talk about it more?`

**Builder checklist status UI (derived from side structure):**
- Optional compact status row in requirements step or preview section:
  - `Scope`, `Goals`, `Out of scope`, `Acceptance criteria`, `Non-goals`
  - contract-seed sections when present: `Assumptions`, `Constraints`, `Glossary`, `Non-functional budgets`
- Status values: `filled`, `thin`, `empty`.

**Agent activity view:** Embedded read-only pane (monospace font, min 120px height, max ~500 visible lines virtualized) showing streaming agent output during doc generation and Multi-Pass Review. Shows prompts, model responses, subagent reports in real-time.

**Progress status strip:** Single line above or below the agent activity pane. Left side: current step text (e.g., "Review pass 2 of 3 -- 2 subagents active"). Right side: determinate progress bar when total is known (e.g., 5/8 documents). Stale detection: after 30 seconds with no update, show "Progress stalled -- last update 30s ago" in amber.

**Run states:** idle, generating, reviewing (with pass/round and subagents active count), paused, cancelling, cancelled, interrupted, complete, error.

**Pause/Cancel/Resume controls:** Single toolbar row below the agent activity pane.
- **Pause:** Takes effect at next handoff boundary; in-flight subagents complete; no new subagents spawned. Button disabled when not running.
- **Cancel:** Confirmation modal: "Stop this run? No changes will be applied." [Stop run] [Keep running]. Transitions to cancelling then cancelled. Toast: "Run cancelled -- no changes applied."
- **Resume:** Continues from persisted checkpoint. Toast: "Resuming..." then "Run resumed."

**Multi-Pass Review approval UI:** When review completes, show findings summary first (gaps, consistency issues, missing information, applied changes, unresolved items) in the preview section and in chat. Then show one final approval gate:
- **Accept:** Set revised bundle as canonical and continue.
- **Reject:** Discard revised bundle and keep original bundle as canonical.
- **Edit:** Open revised bundle in File Editor or embedded document pane; on save, return to same final gate.
No per-document approval and no extra approval modes.

The findings summary shown here MUST be the canonical workflow artifact for that review run. At minimum the rendered payload must resolve back to review-run identity, per-document findings counts, unresolved items, and any revised-artifact reference needed by the final approval gate.

**Document review locations (required):**
- Chat summary includes three pointers after generation/revision:
  1. `Opened in editor`
  2. Clickable canonical file path
  3. Embedded document pane entry
- Full document bodies are not rendered in chat.

**Wizard layout with separate regions (required):**
- Primary content split includes:
  - workflow/step content,
  - embedded document pane (review/edit human-readable docs),
  - embedded agent activity pane (streaming progress only).
- Side-panel chat remains independent from both embedded panes.

**Step transitions:** Animated slide-left/slide-right (200ms ease-in-out) between steps. Back button returns to previous step without data loss.

**Recovery:** Wizard state is persisted per-project in redb (`wizard_state:v1:{project_id}`) including intent, current step, form data, and run checkpoint (run_type, run_id, phase, step_index, document_index, total_documents, subagent_tasks_done, checkpoint_version). On app restart with incomplete wizard, show a CtA card on Dashboard: "Resume wizard for {project}?" with "Resume" and "Start over" buttons. If checkpoint is missing or invalid version, show "Start over" only. "Resume" restores to the last completed step with all form data intact.

**Wizard state `attention_required` -- recovery flow:**

When a user navigates away from the Chain Wizard while it is in `attention_required` state:

1. The wizard state is written to redb as `attention_required` and persists across app restarts.
2. The Dashboard shows a `wizard_attention_required` CtA card in the "Action Required" section at the top of the card grid (see §7.2 `wizard_attention_required` CtA card spec).
3. The relevant chat thread shows a badge and a `clarification_request` system message with an inline question form.
4. **Resuming from Dashboard card or thread:** Clicking "Resume Wizard" (on the Dashboard CtA card or on the thread) opens the wizard directly at the step identified in `wizard_step`, with the `clarification_request` message and its inline question form shown prominently.
5. **After submission:** The wizard automatically re-runs Pass 1 + Pass 2.
   - If the new quality report returns `verdict == "PASS"`: wizard transitions back to `active`; the CtA card is dismissed; the thread badge is cleared.
   - If `verdict == "FAIL"` again: a new `clarification_request` is posted (the previous one is archived); the CtA card `reason` text is updated to reflect the new question count/summary.

*Deep-link URL format:*
`puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify`

This URL is stored as `resume_url` on the `wizard_attention_required` CtA card and on the `clarification_request` thread message. The app registers this URL scheme and navigates to the correct view on activation.

ContractRef: ContractName:Plans/assistant-chat-design.md#thread-attention-needed-state, ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics

**Error handling:** Subagent crash/timeout: collect partial reports; if <50% complete, fail run and surface "Multi-Pass Review failed (too few reviews completed)"; otherwise continue with completed reports. Review agent fails: surface "Could not produce revised doc" with "Use original document" and "Retry" buttons. All subagent spawns fail: surface error with auth/model check suggestion.

### 7.6 Interview

**Group:** Run | **Location:** Primary content

Interactive requirements gathering with phase tracking, Q&A flow, reference materials. Also available as a Chat mode (Interview tab in Chat panel).

**Phase progress:** Horizontal stepper showing interview phases (Gather, Research, Validate, Document, Review). Each step shows completion percentage and elapsed time. Active phase pulses with accent color. Completed phases show green checkmark icon; errored phases show red X icon with "Retry phase" button.

**Adaptive phase selection:** Phases are selected based on intent and requirements (via AI phase selector or rule-based fallback). GUI shows a phase checklist (all phases listed with checkboxes; unchecked = skip). "Run all phases" toggle (default off) overrides and runs all phases at Full depth. Phase depth indicators: Full (all questions + research), Short (max 2 questions, no research), Skip (omitted).

**Question UI:** Each interview question shows: question text, suggested answer options as clickable chips/buttons, and a "Something else" text input bar for freeform answers. Thought stream toggle (show/hide the model's reasoning). Message strip showing conversation flow.

**Subagent activity:** When interview subagents are enabled (see Settings > Interview), reuse the shared **Agent Activity Pane** (`§7.19`) as an embedded Interview surface rather than a one-off card. The Interview layout is: Q&A/chat region + shared activity pane + embedded document pane. Active Interview stage/subagent rows show Persona, selection reason, effective platform/model, current action, elapsed time, and skipped-control disclosure when relevant. When Multi-Pass Review is active, show review round counter and per-reviewer status in the same pane.

**Interview preview section (required):**
- Preview section shows Multi-Pass findings summary and one final approval gate.
- Final gate actions: `Accept | Reject | Edit`.
- Findings summary appears before final gate and is also posted in chat.

**Multi-Pass Review approval (Interview):**
- Single approval model only:
  - **Accept:** apply revised bundle and complete handoff.
  - **Reject:** discard revised bundle and complete handoff with original bundle.
  - **Edit:** open revised docs in File Editor or embedded document pane, then return to same final gate.

**Interview embedded document pane (required):**
- Interview page includes embedded document pane for interview artifacts (phase docs, PRD, AGENTS.md, and other human-readable project docs).
- Pane includes `Plan graph` as a read-only rendered view.
- Plan graph view shows notice: `Talk to Assistant to edit plan graph.`

**Remediation flow:** If validation fails, show a remediation panel: list of failed checks with severity, remediation suggestions, and "Fix & Re-validate" button. User can also skip individual checks with "Accept risk" (logged).

### 7.7 Tiers

**Group:** Run | **Location:** Primary content

Hierarchical tier tree (phase/task/subtask) with expandable nodes. Shows tier type, status, platform, model, and details per node.

### 7.8 Usage (NEW)
**Group:** Data | **Location:** Primary content

Dedicated usage view providing persistent visibility into platform quota, consumption, and source confidence.

**Sections:**

1. **Quota summary:** Per-platform 5h/7d usage vs limit (or provider-equivalent window), with plan type where available. Per-platform labels remain explicit because semantics differ by provider. Gemini stays on one shared surface with source/effective-mode labels such as `Gemini quota` or `Gemini (estimated)`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md

2. **Alert thresholds:** Configurable warning threshold, toast notification when usage nears limit, option to dismiss or quiet, and switch/fallback reason disclosure when a provider account changes.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md

3. **Ledger tab:** Event-level log with filtering by platform, auth mode, effective account, tier, session, thread, and date range. Export as JSON/CSV.
4. **Analytics tab (optional):** Aggregate usage by time window, platform, project, model, auth mode, and account where available.
5. **Reset countdown:** Show `Resets in X` when reset time is available from provider APIs, structured runtime signals, or fallback error parsing.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

6. **Tool usage widget:** Same as current analytics rollup requirement.
7. **Gemini account context strip:** Show current effective account, current effective auth mode, recent switch reason, cooldown state, and signal-confidence/source labels when the selected platform is Gemini.
8. **Media usage display:** Media counters remain local counters unless an authoritative provider quota API explicitly exists. Media actions still follow the same Gemini requested/effective auth/account rules as standard Gemini usage.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

**Data sources:** Primary: seglog/redb rollups from analytics scan jobs. Fallback: aggregate from `usage.jsonl`. Platform APIs and structured provider/runtime outputs augment when configured. Gemini account/context disclosure uses the same canonical `UsageRecord` / runtime snapshot family as the rest of the app.

ContractRef: ContractName:Plans/storage-plan.md, ToolID:media.generate, ContractName:Plans/Runtime_Artifacts_Panel.md

**Always-visible usage:** Status bar shows compact usage for the selected platform. Gemini status surfaces include current effective account and current effective auth mode when available.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
### 7.9 Metrics

**Group:** Data | **Location:** Primary content

Aggregated session metrics: iterations, success rate, avg latency, token usage. Per-platform stats: models used, requests made, tokens consumed. Per-subtask breakdowns. Refresh button.

### 7.10 Evidence

**Group:** Data | **Location:** Primary content

Evidence browser with type filtering. List view with click-to-expand or hover-to-preview for details. EvidenceDetail shows full evidence item.

### 7.10.1 EvidenceDetail

**Group:** Data | **Location:** Primary content (drilldown from Evidence)

Full-screen view of a single evidence item. Shows:
- **Header:** Evidence type badge, timestamp, session/tier identifiers
- **Metadata table:** Platform, model, tokens used, duration, pass/fail status
- **Content:** Full evidence body (verification output, test results, build logs) in a scrollable monospace block
- **Attached files:** List of related files (screenshots, diffs) with click-to-open in File Editor
- **Actions:** Copy evidence ID, export as JSON, navigate to related tier/session in History view
- **Back navigation:** Breadcrumb (`Data > Evidence > [item name]`) plus Escape key returns to Evidence list preserving scroll position

### 7.11 History

**Group:** Data | **Location:** Primary content

Execution history with status filters and pagination. Shows session info, status, timestamps.

### 7.12 Ledger

**Group:** Data | **Location:** Primary content

Event ledger browser color-coded by event type. Filtering by type, tier, session. Export capability.

### 7.13 Memory

**Group:** Data | **Location:** Primary content

Memory/context state display. Shows memory sections (problem statement, tier plan, checkpoint data). Can load from external files (agents.md, PRD file, memory progress).

### 7.14 Coverage

**Group:** Data | **Location:** Primary content

Requirement coverage metrics by phase and category.

### 7.15 Setup

**Group:** Run | **Location:** Primary content

Platform readiness view for Setup and first-run troubleshooting. Shows detected versions, resolved paths, and live transition states.

- **Install/Uninstall state rows:** Cursor CLI, Claude CLI, and Playwright browser runtime use real-time states: `Not Installed` → `Installing` → `Installed` and `Installed` → `Uninstalling` → `Not Installed` (or `Failed` with error details).
- **Explicit actions:** Each row has explicit install/uninstall actions (no automatic install behavior).
  - **Windows (Cursor only):** show two install actions: `Install Native` and `Install WSL`.
- **Manual path override (Cursor/Claude only):** `Use manual path` checkbox reveals a native file picker and path field; Save triggers immediate validation and state update (`Valid` / `Invalid` + reason).
- **Binary validation error rendering:** When validation fails, Setup renders the stable `BinaryErrorCode` from `Plans/BinaryLocator_Spec.md` and maps it to deterministic copy/actions: `OverrideMissing`/`NotFound` → explain that no usable binary was found and keep install actions visible; `NotExecutable` → explain permission issue and suggest fixing file mode; `BlockedByOSSecurity` → show OS-specific unblock guidance; `MissingRuntime` → explain missing launcher runtime (for example Node.js) and link to install guidance; `WrongBinary` → explain that a different CLI was found; `Timeout`/`OverrideInvalid` → show validation failure details with a `Retry` action. The trace/details expander MUST use the same mapping in Setup and Health/Doctor.
- **Provider auth + multi-account snapshot:** Compact per-provider auth state (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`), active account label, and account count, with links to Settings > Authentication and Settings > Health.
- **Command contract (normative):**
  - Cursor install (Linux/macOS/WSL):
    ```bash
    curl https://cursor.com/install -fsS | bash
    ```
  - Cursor PATH setup (bash; Linux/macOS/WSL):
    ```bash
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    ```
  - Cursor PATH setup (zsh; Linux/macOS/WSL):
    ```bash
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
    ```
  - Cursor install (Windows Native; PowerShell):
    ```powershell
    irm 'https://cursor.com/install?win32=true' | iex
    ```
  - Cursor verify:
    ```bash
    agent --version
    ```
  - Cursor uninstall (Linux/macOS/WSL):
    ```bash
    rm -f ~/.local/bin/agent ~/.local/bin/cursor-agent
    rm -rf ~/.local/share/cursor-agent
    ```
  - Cursor PATH cleanup (bash/zsh; Linux/macOS/WSL):
    ```bash
    sed -i '/export PATH="$HOME\/.local\/bin:$PATH"/d' ~/.bashrc
    sed -i '/export PATH="$HOME\/.local\/bin:$PATH"/d' ~/.zshrc
    ```
  - Cursor uninstall (Windows Native; PowerShell):
    ```powershell
    $agentPath = "$env:LOCALAPPDATA\cursor-agent"
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $userPath = ($userPath -split ';' | Where-Object { $_ -and ($_ -ne $agentPath) }) -join ';'
    [Environment]::SetEnvironmentVariable("PATH", $userPath, "User")
    $env:PATH = ($env:PATH -split ';' | Where-Object { $_ -and ($_ -ne $agentPath) }) -join ';'
    if (Test-Path $agentPath) { Remove-Item -Recurse -Force $agentPath }
    ```
  - Cursor Windows policy: prefer Windows Native install/detect; also offer an explicit WSL path. Setup MUST show two actions: `Install Native` and `Install WSL`. If the user chooses `Install WSL` and WSL is not installed, surface actionable guidance.
  - Claude install (Linux/macOS/WSL):
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```
  - Claude install (Windows):
    ```cmd
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```
  - Claude uninstall (Linux/macOS/WSL):
    ```bash
    rm -f ~/.local/bin/claude
    rm -rf ~/.local/share/claude
    ```
  - Claude uninstall (Windows):
    ```cmd
    del "%USERPROFILE%\.local\bin\claude.exe"
    rmdir /s /q "%USERPROFILE%\.local\share\claude"
    ```
  - Claude verify:
    ```bash
    claude --version
    ```
  - Playwright policy: install/uninstall remains app-local only.

### 7.16 Chat Panel (NEW)

The Chat Panel is the canonical assistant-thread surface for Ask, Plan, Interview, BrainStorm, and Crew-assisted planning/execution handoff.

#### Thread header and mode controls
Required controls:
- platform/model/effort selectors
- mode selector (`Ask`, `Plan`, `Interview`, `BrainStorm`, `Crew` as applicable)
- thread selector / new thread action
- compact-context / usage access where available

Rules:
- PM-native Ask and Plan semantics are authoritative and MUST NOT be rewritten to match OpenCode defaults.
- Ask remains read-only analysis.
- Plan remains read-only until explicit execution.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md

#### Message stream and controls
Required message behaviors:
- always-visible copy icons on user and assistant messages
- `Stop`, `Edit`, and `Resend` apply only to the latest user message in scope
- `Stop` cancels immediately
- `Edit` / `Resend` rewind later work
- controls disappear after the next user message
- when scrolled away from the bottom, show a jump-to-latest control with unseen-count badge

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

#### Activity cards
The message stream uses the shared inline operation-card family.

Required card families:
- Bash / command cards
- Web activity cards
- Files explored / files changed cards
- Diff cards
- Subagent cards

Rules:
- command cards show compact preview in chat and focus the same live session in Terminal
- web cards distinguish `Searching Web`, `Extracting Site`, `Researching Web`, `Crawling Site`, `Mapping Site`, and `Reading Site`
- diff cards remain distinct from generic code blocks
- primary action labels/routes must match the card type rather than one generic `open` action

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/Tools.md

#### Composer and submission behavior
Required composer rules:
- Steer vs Queue remain explicit submission modes
- while a run is active and the composer is otherwise idle, the send control morphs into stop
- if the user starts typing a new message during an active run, the composer returns to send behavior for queue/steer semantics
- queued messages remain visible and editable

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

#### Plan panel and question forms
Required planning/question UX:
- sticky plan panel is authoritative for plan + TODO state
- inline questionnaire / clarification forms support multiple questions in one flow
- required questions block submit
- drafts auto-save in bounded structured form
- dismiss is explicit pause, not implicit rejection

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/chain-wizard-flexibility.md

#### Runtime identity display
Chat displays shared runtime identity; it does not own the schema.

Rules:
- compact display may show requested vs effective deltas
- expanded display may route to details, usage, or history
- historical chat views use frozen runtime snapshots captured for the execution

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

### 7.17 File Manager Panel (NEW)

**Location:** Side panel (tabbed with Chat by default, detachable independently)

**Structure:**

```
+------------------------------------------+
| [Chat] [Files]              [_] [pop] [x] |  Tab bar
+------------------------------------------+
| [magnifier] Search files...               |  Search (28px)
+------------------------------------------+
|                                           |
|  v src/                                   |
|    > app.rs                          M    |  File tree (virtualized)
|    > main.rs                              |
|    v views/                               |
|      > dashboard.rs                       |
|      > config.rs                     A    |
|    v widgets/                             |
|      ...                                  |
|  v tests/                                 |
|  > Cargo.toml                             |
|  > README.md                              |
|                                           |
+------------------------------------------+
| 42 files | 3 modified | main up2          |  Git status strip (20px)
+------------------------------------------+
```

**Features:**
- Fuzzy file search with real-time tree filtering
- Virtualized tree view (only visible nodes instantiated)
- Git status indicators: M (modified), A (added), D (deleted), U (untracked) -- colored per theme
- `.gitignore` respected, optional toggle to show ignored files
- Context menu (right-click): Copy path, Copy relative path, Open in external editor, Add to chat context, **New file**, **New folder**, **Rename** (inline edit), **Delete** (confirm modal), Reveal in system file manager, Collapse all, Expand all
- Drag files to chat input to attach them
- `@` mention in Chat input opens File Manager search as overlay popup
- **Keyboard navigation:** Up/Down to move selection, Left to collapse folder, Right to expand folder, Enter to open file, Delete to delete (with confirm), F2 to rename, Ctrl+N to create new file in selected folder
- **Current file highlighting:** The file currently open in the editor is highlighted with accent background in the tree (even if the tree is scrolled; on click-to-open from editor, auto-scroll tree to show the file)
- **Expand/collapse persistence:** Tree expansion state is persisted per-project in redb. Restored on project open. "Collapse All" and "Expand All" buttons in the search bar area.

**External drag-and-drop:** Drag files from the system file manager into the File Manager tree to copy or move them into the project. Uses platform-specific APIs: Windows (IDropTarget / OLE drag-drop), macOS (NSDraggingDestination / NSPasteboard), Linux (Xdnd protocol / wl_data_device for Wayland). On drop: multi-file and directory drops show a preflight confirmation dialog ("Copy N files into {folder}?" with [Copy] [Cancel]); single-file drops without conflicts may proceed immediately. If a file already exists at the destination, show conflict resolution per Plans/FileManager.md §1.1 (`Overwrite` / `Keep both` / `Cancel`, with optional "apply to all" behavior from Settings). Hold **Shift** during drag to move instead of copy; cursor/drag-image feedback must show the current mode. Progress indicator for multi-file copies. Dropped directories are copied recursively.

**File preview:** When a file is selected, read-only preview in primary content area (or in-panel split when panel >400px). Monospace font with basic syntax highlighting using accent palette.

### 7.18 File Editor (NEW)

#### Rendering preview/export and detached-window UX contract (2026-03-08)

**Mermaid export UI**
- Mermaid-capable preview surfaces expose `Export` actions for `SVG`, `PNG`, `Copy SVG`, and `Copy image`.
- `Export` opens a dialog or popover that includes:
  - destination path
  - format
  - theme (`current app theme` default, explicit override allowed)
  - background mode
  - overwrite behavior summary
- The export confirmation UI MUST show the final filename before write.
- Export failures and clipboard failures MUST surface a visible inline or toast error.

**Detached preview/browser windows**
- Detached windows are modeless and owned by the app session.
- Closing the main app closes detached preview/browser windows after preview intent has been persisted.
- Closing a detached preview window updates the owning surface state but does not delete the underlying preview subject.
- `Detach` followed by `Reattach` keeps the same `preview_session_id` unless platform fallback forced a transport restart.
- When the product falls back from embedded to detached mode automatically, the UI MUST show that this is a platform/runtime fallback, not a content error.

**Location:** Primary content (between File Manager and Dashboard)

IDE-style editor with:
- Open files as tabs (tab bar, closable, reorderable)
- Editable buffers with Save (`Ctrl+S`); unsaved indicator (dot on tab); **undo/redo** (Ctrl+Z / Ctrl+Shift+Z)
- Line numbers
- Basic syntax highlighting (keywords, strings, comments using accent palette); language detected from file extension; coverage: Rust, Python, JavaScript/TypeScript, JSON, YAML, Markdown, TOML, HTML, CSS, Shell
- **Breadcrumbs bar:** Below tab bar, showing file path segments (each segment is a link that opens folder in File Manager)
- **Minimap:** Optional (toggle in Settings > General), 60px-wide reduced-scale view of the file on the right edge; click/drag to navigate
- **Code folding:** Fold/unfold regions via gutter icons (collapsed/expanded triangle); fold all/unfold all via command palette
- Go-to-line (Ctrl+G): overlay input field at top of editor, accepts line number, validates range
- Find/replace (Ctrl+F / Ctrl+H)
- Split panes (multiple editor groups, drag tabs to split); target split direction via drop zone indicators
- **Multi-cursor:** Ctrl+Click to add cursors; Ctrl+D to select next occurrence; Escape to reduce to single cursor
- Large file handling: read-only truncated view for >10k lines with "Load full file" option; hard cap at 5MB
- Image viewer for PNG, JPEG, GIF, WebP, SVG
- Click-to-open from chat: clicking file paths in chat, files-touched strip, or code blocks opens file at specified line/range
- Tab persistence: per-project open tabs, active tab, scroll/cursor position; max tabs setting in Settings/General (LRU eviction, default 20)
- Collapsible/hideable when not needed
- **Detachable:** File Editor can be dragged out to a separate floating window and snapped back, using the same panel system as Chat and File Manager (§5). Only one floating editor window at a time.
- **Read-only mode:** When a file is opened from evidence or during a run, show read-only indicator in tab ("[locked]") and disable editing. Reason displayed in status bar ("File locked: evidence artifact" or "File locked: run in progress").
- **Transient states:** Loading (spinner replacing content), Decoding error (banner: "Cannot display binary file"), File-not-found (banner with "File was deleted or moved" and close button)

**LSP-powered editor features (when LSP server available):** Per Plans/LSPSupport.md, when a language server is running for the current file's language, the editor gains the following. Each feature has a **trigger**, **UI location**, and **fallback** when the server does not support it or LSP is unavailable.

| Feature | Trigger | UI location | Fallback (server unsupported or unavailable) |
|---------|---------|-------------|-----------------------------------------------|
| **Inline diagnostics** | Server sends `publishDiagnostics` | Underlines on affected ranges (red=error, amber=warning, blue=info); left gutter severity icon per line. Click gutter icon to see full message. | No underlines or gutter markers; no error. |
| **Hover** | Mouse hover (300ms delay) or focus + shortcut | Themed tooltip at cursor (or slightly offset). Max-width to prevent overflow. Dismiss on mouse move or Escape. | No tooltip; no error. |
| **Code completion** | Typing or **Ctrl+Space** | Inline dropdown below (or above if near bottom) cursor. Items: label, detail, kind icon. Arrow keys + Enter to select. | No dropdown; typing inserts characters only. |
| **Signature help** | Cursor inside function call (e.g. after `(`) | Popup near cursor (e.g. below line). Current signature + parameter highlight; previous/next overload. Dismiss on cursor move or Escape. | No popup; no error. |
| **Inlay hints** | Document open/change (after debounce) | Inline decorations in editor (muted, smaller font). Read-only; do not affect buffer. | No inlay hints; syntax highlighting only. |
| **Code actions** | **Ctrl+.** or click lightbulb in gutter | Lightbulb in gutter when actions available. Click or Ctrl+. opens quick fix / refactor list. Apply via FileSafe. | No lightbulb; no error. |
| **Code lens** | Server sends code lens for document | Inline links above symbols (e.g. "Run test", "3 references"). Click to invoke. Toggle in Settings > LSP. | No code lens; no error. |
| **Semantic highlighting** | Server supports `semanticTokens` | Token-based coloring (e.g. local vs parameter). | Fall back to regex-based syntax highlighting. |
| **Go to definition** | **Ctrl+Click** or **F12** on symbol | Opens definition in same or new editor tab; scrolls to location. | No navigation; no error. Use heuristic (e.g. grep) if implemented. |
| **Find references** | **Shift+F12** on symbol | Opens References view (inline list or panel); click row opens file at location. | No references list; no error. |
| **Rename symbol** | **F2** on symbol | Inline rename or dialog; apply via workspace/applyEdit (FileSafe). | No rename; no error. |
| **LSP status** | Server lifecycle | Status bar: server name + state (e.g. "rust-analyzer: Ready", "Initializing...", "Error: ..."). | When no server: show nothing (no "no LSP" indicator). |
| **LSP unavailable** | Open file, no server for language | Dismissible banner: "Install {server} for full language support" with link to Settings > LSP. | N/A (this is the fallback UX). |

**Editor LSP context menu:** When the user right-clicks (or menu key) in the editor, include LSP actions when available: **Go to Definition** (F12), **Find References** (Shift+F12), **Rename** (F2), **Quick Fix** / **Refactor** (Ctrl+.), **Copy type/signature** (when hover has content). Disable or hide entries when the server does not support the capability or when LSP is unavailable.

**Editor LSP shortcuts (summary):** F12 = Go to definition; Shift+F12 = Find references; F2 = Rename symbol; Ctrl+Space = Trigger completion; Ctrl+. = Code actions (quick fix). Go to Symbol (outline): Ctrl+Shift+O. All shortcuts are discoverable in Settings > Shortcuts.

**Open-file contract:** All file-open actions across the app (File Manager click, chat file path click, Ctrl+P, @ mention, code action navigation) use a single unified contract: `OpenFile { path, line?, range?, target_group? }`. `target_group` defaults to the active (focused) editor group; optionally "Open in other group" or "Open in new group" via context menu. When line/range is specified, editor scrolls to that location with a brief highlight fade (configurable duration, default 5 seconds).

**Embedded document pane integration (required):**
- Embedded document pane is another view on the same file artifacts used by File Editor.
- File Editor and document pane share one buffer model, one dirty state, and one save source per file path.
- Restore/checkpoint actions triggered in document pane use the same open-file and buffer-refresh pipeline as File Editor.

**Split panes and editor groups:** Multiple editor groups (side-by-side or top/bottom). Each group has its own tab list and active tab. **Shared buffer model:** One buffer per file path across all groups; any edit in one group updates all views immediately. Only cursor position and scroll offset are per-view. Tab drag between groups to move files. Drop zone indicators show split direction targets.

**Additional editor features:**
- **Format on save:** When LSP server supports `textDocument/formatting`, format before persist. Timeout 5 seconds; if exceeded, save unformatted. Toggle in Settings > General ("Format on save", default off). Also: `textDocument/rangeFormatting` for format-selection.
- **Comment toggle:** Ctrl+/ toggles line comment for the current selection or cursor line. Language-aware (// for Rust/JS, # for Python/Shell, etc.).
- **Indent/outdent:** Tab / Shift+Tab on selection.
- **Duplicate line:** Ctrl+Shift+D duplicates the current line or selection.
- **Move line up/down:** Alt+Up / Alt+Down moves the current line.
- **Trim trailing whitespace:** Optional on-save behavior (toggle in Settings > General, default off).
- **Render whitespace:** Optional toggle to show spaces/tabs as dots/arrows (toggle in Settings > General, default off).
- **Sticky scroll:** When scrolling, keep the current scope header (function/class/block signature) pinned at the top of the editor. Toggle in Settings > General (default on for code files).
- **Line wrap:** Toggle (Ctrl+Alt+W) between soft-wrap and horizontal scroll.
- **Zoom:** Ctrl+= / Ctrl+- to zoom editor text size (independent of app UI scale).

**Image viewer:** Supports PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Controls: zoom in/out, fit-to-pane, fit-to-width. View-only (no pixel editing). Optional: copy to clipboard, open in system viewer via context menu.

**HTML preview with hot reload:** When an HTML file is open, a split preview pane shows the rendered HTML (via embedded webview or lightweight renderer). Hot reload: on save, preview refreshes with a 400ms debounce (configurable 100-2000ms in Settings > General). Watches linked files (script/link refs) for changes. Multiple HTML files can each have their own preview. Preview toolbar: refresh button, open in external browser button, device-width selector (phone/tablet/desktop).

**Click-to-context (HTML preview):** When viewing HTML, user can click an element in the preview to capture its context (tag, id, class, text content, bounding rect, parent path, HTML snippet). Captured context is sent to the Chat input with a toast notification: "Element context captured." Rate-limited to prevent spam. DOM size cap to prevent oversized captures.

**Optional Vim-like modal editing:** Toggle in Settings > General ("Vim mode", default off). When on, editor enters normal/insert/visual modes. Focus trap: Ctrl+Shift+Z exits Vim mode and returns to normal editor behavior. Mode indicator in status bar ("NORMAL" / "INSERT" / "VISUAL").

**Editor diff view:** Side-by-side diff between buffer and disk version, or between branches. Accessible via right-click tab > "Compare with saved" or command palette.

**In-app instructions editor (MVP):** The File Editor provides enhanced support for editing project instruction files (AGENTS.md, .puppet-master/project-rules.md, SKILL.md files, and similar Markdown-based configuration files).

- **Detection:** When a file matching known instruction patterns is opened (AGENTS.md, *.md in `.puppet-master/` or `.cursor/` directories, SKILL.md, CLAUDE.md, .cursorrules, etc.), the editor activates "Instructions mode" -- indicated by a badge in the tab: "[instructions]".
- **Split preview:** Instructions mode opens a side-by-side layout by default: editor on the left, rendered Markdown preview on the right. Preview updates live as the user types (debounced 200ms). Preview supports: headings, bold/italic, code blocks (with syntax highlighting), tables, lists, blockquotes, horizontal rules, links (clickable, open in Browser tab), images (rendered inline).
- **Template insertion:** A toolbar above the editor in Instructions mode shows quick-insert buttons: "Add rule", "Add convention", "Add file pattern", "Add command". Each inserts a pre-formatted template block at the cursor position (e.g., "Add rule" inserts `## Rule: [name]\n\n**When:** [condition]\n**Then:** [action]\n`).
- **Validation:** Basic structural validation for AGENTS.md-style files: warns on missing required sections (if a schema is defined for the file type), warns on duplicate headings, warns on overly long files (>500 lines -- "Consider splitting into linked documents"). Warnings shown as amber markers in the gutter and in the Problems tab.
- **Preview toolbar:** Toggle between "Preview" (rendered Markdown), "Raw" (plain text editor), and "Split" (side-by-side) views. Preview-only mode locks the editor for read-only viewing.

**SSH remote file integration:** When an SSH connection is active (see §7.4.5), the File Editor can open and edit files on remote hosts.

- **Remote file indicator:** Remote files show a `[SSH: connection-name]` badge in the editor tab, styled with a distinct background color (Theme.accent-orange at 10% opacity) to clearly distinguish from local files.
- **Save behavior:** On Ctrl+S, the file is written back to the remote host via SFTP. A brief "Saving to remote..." indicator appears in the status bar. If the save fails (connection timeout, permission denied), show an error toast with the option to "Save locally" (creates a local copy in a temp directory).
- **Connection resilience:** If the SSH connection drops while a remote file is open, the editor retains the buffer contents. A persistent banner appears above the editor: "Connection to {host} lost -- editing offline. Changes will sync on reconnect." with "Reconnect" and "Save locally" buttons. On reconnect, if the remote file has changed since the local edit, show a merge conflict dialog: "Remote file has changed. [Keep yours] [Keep remote] [Show diff]".
- **Performance:** Remote files are cached locally in `~/.puppet-master/cache/ssh/{host}/{path}`. Subsequent opens of the same file check remote modification time (via SFTP stat) before re-downloading. Cache expires after 1 hour or on explicit refresh.

### 7.19 Agent Activity Pane (NEW)

**Location:** Embedded in Wizard, Interview, and Requirements Builder views

Read-only, chat-like pane showing streaming agent output during document generation and Multi-Pass Review. Shows which persona/subagent is working on which task. Output lines are non-interactive; progress controls live in the pane footer. Monospace font. Min height 120px, max ~500 visible lines (virtualized via `ListView`).

**Responsibility boundary (required):**
- Agent Activity Pane is for streaming/progress only.
- It must not host document navigation, document editing, or approval controls.
- Findings summary and approval controls are shown in chat + preview section; document editing happens in File Editor or embedded document pane.

**Virtual buffer and auto-scroll:**
- Backed by a bounded FIFO buffer of 500 visible lines; oldest lines are evicted first.
- Auto-scroll is on by default. If the user scrolls upward, auto-scroll pauses and a `New output` affordance re-enables it.
- Auto-scroll preference is persisted per project under `project.{project_id}.ui.agent_activity_auto_scroll` (default `true`).

**Progress display and controls:**
- Header shows current state badge (`idle`, `generating`, `reviewing`, `paused`, `cancelling`, `cancelled`, `complete`, `error`).
- Status text uses deterministic progress wording such as `Writing document 3 of 15` or `Reviewing pass 2 of 4`.
- Footer buttons are `Pause`, `Resume`, and `Cancel`. These control the run state but never make the log stream itself editable or clickable.

**Embedding and persistence:**
- In Interview and Requirements Builder, the pane sits in a vertical split below the primary surface. Default split ratio: 65/35 for Interview, 60/40 for Requirements Builder.
- Collapsed state and split ratio are persisted per project: `project.{project_id}.ui.agent_activity_pane_visible` and `project.{project_id}.ui.agent_activity_pane_ratio`.

**Event wiring (required):**
- Pane consumes normalized Provider event stream used by chat.
- UI updates are dispatched through the Slint event loop (`invoke_from_event_loop`) for immediate state refresh.

**Error handling:**
- On stream disconnect, keep existing output visible and show a persistent inline warning with reconnect/retry affordance.
- On cancellation, append a final `[cancelled]` line instead of clearing the pane.
- On provider/runtime error, append the error line, set the header badge to `error`, and keep prior output available for review.

**Accessibility:** The pane uses `accessible-role: text` (or equivalent for read-only log output). Screen readers should announce new output as it arrives via a live region equivalent (Slint: set `accessible-label` to include latest line summary). Focus can be placed on the pane for keyboard scrolling (Up/Down/Page Up/Page Down). Keyboard shortcut to toggle auto-scroll.

### 7.19.1 Embedded Document Pane (NEW)

#### Rendering-subject scope for embedded documents (2026-03-08)

The Embedded Document Pane may host either document-backed or artifact-backed renderable content.

Rules:
- Workspace-backed documents use `doc:<document_id>` as the preview subject.
- Planning drafts, assistant-created unsaved documents, and other non-file artifacts use `artifact:<artifact_id>` until first persist.
- Artifact-backed content may open source in a transient `generated://<artifact_id>` buffer.
- The pane may issue v1 structured preview edits only when the underlying subject is backed by a mutable shared buffer or a validated transient source buffer using the same preview-action pipeline.
- Review/inspection surfaces that are not yet wired to the validated preview-action path remain non-destructive even when they render Markdown/Mermaid richly.

**Purpose:** The Embedded Document Pane supports live, multi-document preview during doc generation (Requirements Doc Builder + Interviewer) and provides durable annotations, send-selection-to-chat handoff, and targeted resubmits for cheap iteration.

**Non-goal (explicit):** No direct patch-apply mode. Structured annotations remain requests/review cues; the agent/runtime performs document changes through targeted revision or later explicit edit flows.

---

#### A) Live Multi-Document Preview (during generation + targeted resubmits)

**Doc list requirements**
- Shows ALL generation artifacts for the current bundle/run, including staged artifacts (examples: `requirements-builder.md`, `contract-seeds.md`, and interview artifacts like phase docs, PRD, `AGENTS.md`).
- Updates as new docs appear mid-run.
- Click to switch between docs at any time.

**Doc entry status badges (canonical set)**
- `writing…` (live updating; read-only)
- `draft` (editable)
- `needs-review`
- `changes-requested`
- `approved` (Approved/Done for final review gating)

**Live update behavior**
- If viewing the actively-written doc: show streaming updates.
- If viewing another doc: that doc stays stable; the active doc continues writing in background (badge + updated_at continue to update).

**Follow active doc toggle (default ON)**
- ON: auto-switch selection to the doc being written.
- OFF: user selection is sticky; writing never steals focus.

**Editing guardrails**
- If a doc is `writing…`, it is read-only in this pane (prevents dueling writes).
- Once it leaves `writing…`, it becomes editable with basic edit+save.

---

#### B) Annotation Mode (Highlight + Actions)

The Embedded Document Pane uses a selection-driven **Annotations** review model rather than an `Add note`-only flow.

**Selection palette**
- Select text to open a reusable action palette with: `Comment / Ask`, `Replace with...`, `Insert after...`, `Remove / Strike this`, and `Send selection to chat`.
- `Comment / Ask`, `Replace`, `Insert after`, and `Remove` create durable annotations.
- `Send selection to chat` creates a removable `document_selection_context` chip in the page-owned chat composer prep strip.
- Actions that require stable source anchoring are disabled with explicit explanation on no-source-map renders.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md

**Annotation drawer**
- Title: `Annotations`.
- Placement: right-side rail / drawer in binder-style review surfaces; the left rail remains dedicated to document switching and status.
- On the first durable annotation in a page/bundle context, auto-open the drawer once for discoverability; after that, drawer open/closed state is sticky.
- Each row shows operation badge, selected excerpt, payload preview, anchor status, lifecycle state, and replies.
- Filters include `Open`, `Addressed`, `Resolved`, plus operation-type filters/badges.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Lifecycle and anchoring**
- Annotation lifecycle is `open -> addressed -> resolved`.
- The agent/runtime may set `addressed`; the user controls final `resolved`.
- Store both `anchor.text_position` and `anchor.text_quote`.
- Default prefix/suffix length is 32 chars (clamped).
- Re-anchoring is deterministic: 1) position selector, 2) quote selector with prefix/suffix preference, 3) keep annotation open and show `Anchor not found — reselect to re-anchor`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

**Cross-pane chat handoff**
- Hidden chat does not auto-open on `Send selection to chat`; instead pulse/badge the owning chat launcher and show a lightweight toast.
- Use one unified composer prep strip above the textarea for pending context chips; document-selection chips live beside other context sources, not in a bespoke one-off tray.
- Read-only / no-source-map renders are `Send selection to chat` only in v1 unless the renderer later gains stable semantic anchors.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

---

#### C) Bundle Controls: Resubmit with Annotations + Final Review

**Resubmit with Annotations (targeted revision pass)**
- Runs a targeted revision pass on docs with open durable annotations, or a user-selected subset.
- Input records are deterministic and ordered by `doc_id`, source start offset, and `annotation_id`.
- Each record carries `operation`, `intent_kind`, `operation_payload`, `selected_text`, anchor data, and bounded provenance.
- The pass may update document text and/or answer question/comment annotations without changing the document.
- For each processed annotation, record `addressed_explanation` and an updated anchor when re-anchoring succeeds.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

**Structured-output and conflict rules**
- Conflicting or stale mutating annotations are excluded from automatic revision and surfaced for user resolution.
- Allow one automatic retry on schema/order/shape validation failure; after that, degrade or fail explicitly rather than silently coercing output.
- Hard rule: targeted revision MUST NOT trigger Multi-Pass Review.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Crosswalk.md

**Final Multi-Pass Review (runs once, final-only)**
- Multi-Pass Review is disabled until all bundle docs are Approved/Done and there are no open annotations.
- User explicitly clicks `Run Final Review`; do not auto-run.
- Runs once by default; rerun explicit only.
- Outputs findings and optional revised bundle.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

**Single final gate**
- After final review completes, show `Accept | Reject | Edit`.
- `Accept` applies the revised bundle.
- `Reject` discards review output and preserves the pre-review bundle.
- `Edit` opens the revised docs without rerunning review.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

---

#### D) Acceptance Criteria (UI-level, testable)

- During generation, ≥2 docs appear in the doc list; user can switch between them and watch live updates.
- Annotations are anchored to selections; after edits, they re-attach via quote+context or remain open with a clear anchor-not-found warning (never silently lost).
- Resubmit with Annotations applies/answers durable annotations and does not run Multi-Pass Review.
- Multi-Pass Review cannot start until all docs are Approved/Done and annotations are resolved; it runs once by default and ends in a single Accept/Reject/Edit gate.

### 7.20 Bottom Panel (NEW)

#### Browser normalization against unified rendering contract (2026-03-08)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

The browser model is split into explicit surface classes.

### Surface classes
- `workspace_preview`: in-shell browser tab for project-linked preview and trusted browser tasks
- `detached_preview`: detached browser or preview window linked to a workspace tab and project
- `automation_session`: ephemeral automation browser session that does not become a persistent shell tab automatically
- `auth_session`: ephemeral auth/device/login browser session that is never restored as a shell browser tab automatically

### Required shell behavior
- browser tab caps apply only to in-shell browser tabs
- detached preview windows are outside the in-shell browser-tab cap
- automation and auth sessions are never silently converted into workspace browser tabs
- browser state is restored per project and workspace tab when the surface class allows restoration
- user-triggered share-to-agent state is visible on the originating browser/preview surface and revocable from the browser chrome and attention surfaces

### Cross-platform rule
- Windows uses WebView2, macOS uses WKWebView, Linux uses WebKitGTK/Wry
- when embedding support differs by platform, the surface class remains the same and only the hosting mode changes
- Wayland limitations may require detached-window fallback for some embedded-browser cases, but a static screenshot fallback is not acceptable as the steady-state browser model

### Dev-loop interaction
- Ports and browser surfaces reflect the active dev session
- opening a detected local server from Ports creates or focuses the correct browser surface without bypassing the tab/window restore rules above
#### 10.9.1 Native Clipboard Contract (Normative)

Text-entry widgets (`TextInput`, `TextEdit`) MUST use Slint-native clipboard and selection behavior for keyboard shortcuts and context-menu actions.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, SchemaID:Spec_Lock.json#locked_decisions.ui, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT route text-widget copy/paste/select-all behavior through custom Rust clipboard read/write handlers.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT add custom key interception for Ctrl/Cmd+A/C/X/V on text widgets.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Non-text copy contexts (for example Copy Path / Copy Value) MAY use `ClipboardHelper`, but this exception MUST remain scoped to non-text widgets only.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/FileManager.md, PolicyRule:Decision_Policy.md§2

<a id="10.9.2"></a>
#### 10.9.2 Clipboard Surface Coverage Matrix

| Surface | Allowed implementation path | Disallowed glue | Required verification |
|---------|-----------------------------|-----------------|-----------------------|
| File Editor input | Slint `TextInput` / `TextEdit` native keyboard + context-menu clipboard actions | Manual clipboard read/write for text widgets; custom Ctrl/Cmd+A/C/X/V interceptors | Verify Ctrl/Cmd+A/C/X/V + Copy/Paste/Select All context actions behave natively |
| Chat composer input | Slint text widget native clipboard behavior | Message-level clipboard rerouting for text input | Verify parity with File Editor shortcuts and context actions |
| Terminal command input (if editable) | Slint editable text widget native clipboard behavior | Custom clipboard manager for text entry | Verify Ctrl/Cmd+A/C/X/V + context actions on terminal command input |
| Terminal/log read-only output | Read-only Slint text widget selection/copy behavior (or equivalent read-only selectable surface) | Paste routed into read-only output; manual text-widget clipboard read/write | Verify selection and copy work; verify paste is not treated as editable insertion in read-only output |
| Non-text copy contexts (path/value) | `ClipboardHelper` callback only for non-text targets | Reusing non-text helper as a general text-widget clipboard path | Verify copied value equals selected path/value source text |

<a id="10.9.3"></a>
#### 10.9.3 Legacy Glue Removal Checklist

Migration readiness checklist for clipboard behavior:
- [ ] Remove manual clipboard read/write handlers used for text widgets.
- [ ] Remove custom Ctrl/Cmd clipboard key interceptors for text widgets.
- [ ] Remove read-only text workaround glue where native Slint read-only text widgets cover the behavior.
- [ ] Remove manual selection-state plumbing implemented only to support text-widget clipboard actions.
- [ ] Keep `ClipboardHelper` usage scoped to non-text copy contexts (path/value).

This checklist MUST be completed before closing clipboard migration tasks in the rebuild queue.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

### 10.10 Truncation with Expand

Long text (file paths, error messages, thinking streams) truncates with "..." and expands on click. All text remains selectable.

### 10.11 Animation and Transition Specifications

All animations use Slint's built-in `animate` directive with consistent timing:

| Category | Duration | Easing | Examples |
|----------|----------|--------|----------|
| **Micro feedback** | 100ms | ease-out | Button press, toggle flip, checkbox tick |
| **Panel transitions** | 200ms | ease-in-out | Panel collapse/expand, sidebar show/hide, tab switch |
| **Overlays** | 150ms (in), 100ms (out) | ease-out / ease-in | Modal appear/dismiss, toast slide-in, context menu popup |
| **Layout shifts** | 250ms | ease-in-out | Dashboard card reorder, panel dock/undock, split resize |
| **Progress** | continuous | linear | Spinner rotation, indeterminate progress bar, streaming indicator |
| **State transitions** | 150ms | ease-out | Status dot color change, auth status update, orchestrator state change |

**Reduced motion:** When system prefers-reduced-motion is active (detected via platform API on startup), replace all animations with instant transitions (0ms duration). Store override in Settings > General as a toggle ("Reduce animations").

**Scroll animations:** Scroll-to-target (e.g., click-to-open from chat) uses 200ms ease-out. Auto-scroll for new content is instant (no animation) to avoid visual delay.

### 10.12 Progress Bars and Indicators

**Determinate progress bar:** Filled bar showing percentage. Height 4px (inline) or 8px (standalone). Color follows status: `Theme.accent-blue` (normal), `Theme.success-green` (complete), `Theme.warning-amber` (paused).

**Indeterminate progress bar:** Sliding highlight animation (1.5s loop, linear). Used when total is unknown (e.g., agent thinking, web search). Same height as determinate.

**Stalled state:** If a progress bar hasn't updated in 30 seconds, change color to `Theme.warning-amber` and show a subtle pulse animation. Tooltip: "Progress stalled -- last update 45s ago."

**Context gauge (chat):** Circular progress (16px diameter) showing context window usage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover tooltip shows exact token count and percentage.

**Phase/tier progress:** Stepped progress indicator (circles connected by lines). Each circle shows phase/tier state: empty (pending), half-filled (in-progress with spinning edge), filled (complete), X (failed). Connected line fills left-to-right as phases complete.

### 10.13 Sound Effects (MVP)

Audio feedback for key application events. Uses the `rodio` crate for cross-platform audio playback. All sounds are optional and disabled by default.

**Settings > General toggle:** "Sound effects" (default: off). When off, no audio is played. When on, sub-toggles allow per-event control.

**Event-to-sound mapping:**

| Event | Sound | Duration | Notes |
|-------|-------|----------|-------|
| Run complete (success) | Short ascending chime (3 notes) | ~600ms | Plays when any orchestrator run or chat agent run finishes successfully |
| Run complete (failure) | Low descending tone (2 notes) | ~400ms | Plays when a run fails or is cancelled by error |
| HITL approval needed | Gentle bell / notification ping | ~300ms | Plays when an approval prompt appears; does not repeat until dismissed |
| Rate limit hit | Soft warning tone | ~200ms | Plays once per rate-limit event (not on every retry) |
| Error (critical) | Sharp alert tone | ~250ms | Plays on unrecoverable errors (auth failure, crash recovery prompt) |
| Message received | Subtle click / pop | ~100ms | Plays when a new assistant message arrives in an inactive thread (configurable) |
| Timer milestone | Single soft tick | ~100ms | Plays at configurable intervals during long runs (e.g., every 5 minutes). Off by default. |

**Sound file format:** WAV or OGG files bundled with the application in `assets/sounds/`. File size budget: <50KB per sound, <500KB total. Users can replace sound files by placing custom files in `~/.puppet-master/sounds/` with matching filenames (e.g., `run-complete-success.wav` overrides the built-in sound).

**Volume control:** Master volume slider in Settings > General (0-100%, default 50%). Volume respects system volume. No per-event volume controls in MVP.

**Mute behavior:** When the app is minimized to tray, sounds still play (so the user hears run-complete notifications). When system "Do Not Disturb" or equivalent is active, sounds are suppressed.

**Implementation notes:** Sounds play on a dedicated audio thread (never block the UI thread). `rodio::OutputStream` is created once at startup and reused. If audio device is unavailable (e.g., headless server), skip silently (no error toast).

---

