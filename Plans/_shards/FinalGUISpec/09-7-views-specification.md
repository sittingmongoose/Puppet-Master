## 7. Views Specification

### 7.1 View Inventory (21 views/panels + 6 bottom panel tabs)

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

**Group:** Settings | **Location:** Primary content

This is a **heavily redesigned** unified settings page that merges four previously separate views. It uses a tabbed interface.

**Tabs:**

| Tab | Content | Source |
|-----|---------|--------|
| **General** | Log level, auto-scroll, show timestamps, minimize to tray, start on boot, retention days, intensive logging, **Interaction Mode (Expert/ELI5)** (app-level copy selector; default ELI5/ON), UI scale (0.75-1.5; Slint native scale factor, no per-token manual scaling), max editor tabs (LRU cap, default 20), run-complete notification toggle, max concurrent runs per thread (default 10), **sound effects** toggle (default off; see §10.13), max terminal instances (default 12, range 4-20), max browser tabs (default 8, range 2-12), hot-reload debounce (default 500ms, range 100-5000ms), **theme management** section (theme selector dropdown, "Open themes folder", "Create new theme", "Import theme", "Export theme" -- see §6.6), **Per-platform concurrency limits** (see §7.4.7) | Old "Settings" view + newfeatures.md |
| **Tiers** | Phase/task/subtask tier configuration; per-tier: platform (**dropdown**), model (**dropdown**), reasoning_effort, plan_mode, ask_mode, output_format | Old "Config" Tiers tab |
| **Branching** | **Enable Git** toggle (bound to `orchestrator.enable_git`; tooltip: "Enable git branch creation, commits, and PR creation during runs"); **Auto PR** toggle (bound to `branching.auto_pr`); **Branch strategy** dropdown: MainOnly / Feature / Release (bound to `branching.strategy`); **Use worktrees** toggle; **Parallel execution** toggle (note: "Parallel subtasks use separate git worktrees"); **Granularity** dropdown or label mapped to BranchStrategy (per_phase / per_task / per_subtask); Git info display (user, email, remote, branch -- resolved for active project, not CWD); **Orchestrator concurrency overrides** (collapsible, per-platform, see §7.4.7) | Old "Config" Branching tab |
| **Verification** | Verification checks, screenshot toggles | Old "Config" Verification tab |
| **Memory** | Multi-level memory with progress/agents/PRD file paths; **Context Injection** toggles and injected-context breakdown | Old "Config" Memory tab |
| **Budgets** | Per-platform token budgets | Old "Config" Budgets tab |
| **Advanced** | **FileSafe Guards** (collapsible card): three independent toggles -- "Block destructive commands" (on/off), "Restrict writes to plan" (on/off), "Block sensitive files" (on/off); approved commands list (scrollable, per-row remove, optional manual add); override toggle with warning styling. **MCP Configuration** (collapsible card): per-platform MCP toggles for **all five platforms** (Cursor, Codex, Claude Code, Gemini, Copilot), MCP server list (add/edit/remove servers with name/command/args/env fields), "Test connection" button per server, Context7 API key input (password-style), web search provider selection and API key. **Tool permissions** (collapsible card, see §7.4.1): per-tool or wildcard allow/deny/ask; optional presets (Read-only, Plan mode, Full); list built-in + MCP-discovered tools with permission dropdown per row; bound to central tool registry per Plans/Tools.md. **Containers & Registry** (collapsible card, see §7.4.8): Docker runtime/compose defaults, DockerHub namespace/repo/tag defaults, auth mode and push policy. **CI / GitHub Actions** (collapsible card, see §7.4.9): workflow template selection, trigger/matrix controls, required-secrets checklist, generate/preview/apply actions. **Other:** Sub-agent toggles and cleanup config (clean untracked before run, clean ignored files, clear agent-output dir, evidence retention days); the legacy Iced-era "Experimental features" subsection with per-platform "Enable Codex/Gemini/Copilot Experimental" toggles is removed in the Slint rewrite and MUST NOT be implemented. | Old "Config" Advanced tab + newtools.md + FileSafe.md + Tools.md + MiscPlan.md + GitHub_API_Auth_and_Flows.md |
| **LSP** | **Language Server Protocol (MVP)** (see §7.4.2): LSP is required for desktop release. Global "Disable automatic LSP server downloads" toggle; built-in servers list with per-server enable/disable (all on by default); per-server env vars and initialization options; custom LSP servers (add/edit/remove: command, extensions, env, initialization). Stored in app config (redb); project overrides optional. | Plans/LSPSupport.md |
| **Interview** | Interview-specific config; enable_phase_subagents, enable_research_subagents, enable_validation_subagents, enable_document_subagents; **Multi-Pass Review:** toggle on/off (default off), number of review passes (1-5 dropdown, default 2), max review subagents (1-10, default 3), show warning label when enabled ("Increases cost and time"); min/max questions (spinners), architecture confirmation toggle, vision provider dropdown; **Interview concurrency overrides** (collapsible, per-platform, see §7.4.7) | Old "Config" Interview tab + interview-subagent-integration.md |
| **Authentication** | Per-provider auth status (Cursor, Codex, Claude, Gemini, Copilot, OpenCode, GitHub) with **real-time auth state** chips (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`); login/logout/re-auth buttons; auth method indicators; auth URLs (selectable/copyable); Git info (user, email, remote, branch); **auth realm split:** show separate entries for `github_api` and `copilot_github` (SSOT: `Plans/Contracts_V0.md` `AuthRealm`); **multi-account visibility:** active account, account count, cooldown/rate-limit badge, and quick switch/manage entry | Old "Login" view |
| **Health** | System health checks with platform filtering; check categories (CLI Tools, Git, Runtimes, Browser Tools, Capabilities, Project Setup); check status (PASS/FAIL/WARN/SKIP); fix suggestions with dry-run; **explicit Install/Uninstall actions** (no automatic install behavior) with **real-time install state** for Cursor CLI, Claude CLI, and Playwright browser runtime (`Not Installed`, `Installing`, `Installed`, `Uninstalling`, `Failed`); Codex/Copilot/Gemini rows show direct-provider auth/connectivity status (no install buttons); platform version display (CLI version per detected platform); **Cursor/Claude manual path override:** `Use manual path` checkbox + native file picker + validate action (Cursor/Claude only); **multi-account health visibility:** per-provider active account + account count + cooldown/auth freshness; **Worktree management:** worktree list (path, branch, status, age columns), "Recover orphaned worktrees" button, worktree status indicators (active/stale/orphaned); **Storage & Cleanup:** DB size, cache size, evidence log count; evidence retention days input; "Clean workspace now" button (confirm modal with preview of files to delete per MiscPlan.md); storage maintenance actions | Old "Doctor" view + WorktreeGitImprovement.md + MiscPlan.md |
| **Rules & Commands** | Application rules (list or text area, editable); project rules (when project selected, reads/writes `.puppet-master/project-rules.md`); custom slash commands editor (application-wide and project-wide, name/description/action) | From agent-rules-context.md + feature-list.md |
| **Shortcuts** | Full keyboard shortcut table (action name, current binding, default binding); search/filter by action name or key; per-row "Change" button (captures next key combination) and "Reset" button; "Reset all" button; export/import shortcuts (JSON). Data sourced from shortcut registry (single source of truth, DRY:DATA). | MiscPlan.md |
| **Skills** | Discover and manage SKILL.md files (project-level from `.puppet-master/skills/` and global from `~/.puppet-master/skills/`). Table: skill name, description, source (project/global), permission (Allow/Deny/Ask dropdown per row). Actions: Add, Edit (opens in File Editor), Remove, "Refresh" (re-scan disk). Bulk permission by pattern (e.g., "Allow all doc-*"). Preview skill body on row expand. | MiscPlan.md |
| **Catalog** | Browse and install community content: commands, agents, hooks, skills, themes, and MCP server configs from a curated catalog. See §7.4.3. | feature-list.md |
| **Sync** | Export, import, and sync app configuration across machines. See §7.4.4. | feature-list.md |
| **SSH** | Manage SSH connections for remote editing. See §7.4.5. | FileManager.md |
| **Debug** | Debug adapter configuration and run/debug profiles. See §7.4.6. | FileManager.md |
| **HITL** | Three independent toggles: pause at phase/task/subtask completion; explanation of each level; all off by default | From human-in-the-loop.md |
| **YAML** | Raw YAML editor for full config | Old "Config" YAML tab |

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/CLI_Bridged_Providers.md

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

**Tab sub-grouping:** With 20 tabs, use a two-level navigation: left sidebar within Settings for groups, right area for the selected tab's content. Group labels act as collapsible section headers in the sidebar. Groups: **Core** (General, Tiers, Branching) | **Features** (Verification, Memory, Budgets, Advanced, Interview, LSP) | **System** (Authentication, Health, Rules & Commands, Shortcuts, Skills, HITL) | **Extensions** (Catalog, Sync, SSH, Debug) | **Raw** (YAML). Each group header shows item count badge. Clicking a group header expands/collapses that group in the sidebar. Active tab highlighted with accent-left-border (3px).

**§7.4.2 LSP (LSP tab):** LSP support is **MVP** (required for desktop release), not optional. Per Plans/LSPSupport.md, the GUI must expose full LSP configuration so users can control automatic downloads, enable/disable servers, set env and initialization options, and add custom servers. Provide **Settings > LSP** with:

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not download or install any LSP server automatically (equivalent to `OPENCODE_DISABLE_LSP_DOWNLOAD=true`). Servers already on PATH or already installed are still used.
- **Built-in LSP servers** -- A list of all built-in servers (see Plans/LSPSupport.md §3.2: astro, bash, clangd, csharp, clojure-lsp, dart, deno, elixir-ls, eslint, fsharp, gleam, gopls, hls, jdtls, julials, kotlin-ls, lua-ls, nixd, ocaml-lsp, oxlint, php intelephense, prisma, pyright, ruby-lsp, rust, slint-lsp, sourcekit-lsp, svelte, terraform, tinymist, typescript, vue, yaml-ls, zls). Each row shows: **server name** (and extensions hint), **Enable** toggle (default: **on** for all). User can turn any server off individually. Expanding a row (or opening "Configure") shows:
  - **Environment variables** -- Key-value list (e.g. `RUST_LOG` = `debug`). Optional; sent when starting that server.
  - **Initialization options** -- Key-value or JSON object; server-specific options sent in the LSP `initialize` request (e.g. TypeScript preferences). Optional.
- **Custom LSP servers** -- Section "Custom LSP servers" with **Add** button. Each custom entry has: **Name** (id), **Command** (array of strings, e.g. `["npx", "godot-lsp-stdio-bridge"]` or `["custom-lsp-server", "--stdio"]`), **Extensions** (comma-separated or list, e.g. `.gd`, `.gdshader`), and optionally **Environment variables** and **Initialization options** (same as built-in). Edit and Remove per row. Custom servers are in addition to built-in; same config schema (command, extensions, env, initialization) as OpenCode.

**Custom LSP server validation:** When adding or editing a custom server, enforce: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension, e.g. `.gd`). If empty, show inline error "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed; user must correct before persisting.

**Initialization options (JSON):** When the user edits **Initialization options** as JSON (e.g. raw text area or "Edit as JSON" for built-in/custom servers), validate on blur or on Save. If the value is **invalid JSON** (parse error): show an inline error message (e.g. "Invalid JSON: unexpected token at line N") and do **not** persist the invalid value. Optionally preserve the user's text in the editor so they can fix it; on next valid parse, clear the error and allow Save. If the user leaves the field with invalid JSON and clicks Save, block save and focus the field with the error message. Do not send invalid JSON to the LSP server at startup (use last known valid value or empty object).

All LSP settings are persisted in app config (redb or equivalent). Optional: project-level overrides (e.g. `.puppet-master/lsp.json` or project key in redb) so a project can disable a server or add a custom server for that project only; document merge rules (project overrides app) in implementation.

**§7.4.1 Tool permissions (Advanced tab):** Per Plans/Tools.md, the GUI must expose the tool permission model (allow / deny / ask) so users can control which tools the agent may use without approval, require approval for, or disable. Provide a **Tool permissions** collapsible card under Settings > Advanced with: (1) **Presets** (optional): dropdown or buttons for "Read-only" (deny edit, bash, webfetch, websearch), "Plan mode" (allow read/grep/glob/list only), "Full" (allow all with ask for bash/edit); (2) **Per-tool list**: table or list of tools (built-in canonical names + discovered MCP/custom tools when available), each with a permission dropdown (Allow | Deny | Ask); (3) **Wildcard rules** (optional): add rule e.g. `mymcp_*: Ask` for all tools from a server. Stored in same config as other Settings; run config reads it for the central tool registry. Tool list may be populated from registry at load time; MCP tools appear when MCP servers are enabled. If the registry is not yet available (pre-rewrite), a minimal UI can show built-in tools only (bash, edit, read, grep, glob, list, webfetch, websearch, question, etc.) with Allow/Deny/Ask per row.

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

1. **Provider rate limits:** Each platform (Cursor, Codex, Claude Code, Gemini, Copilot) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project. Too many concurrent processes degrade the user's development environment.

**Global defaults (Settings > General > Per-platform concurrency limits):**

A collapsible card titled "Per-Platform Concurrency Limits" with a per-platform row for each of the 5 platforms. Each row: platform name + icon, spinner (range 1-10). Defaults: Cursor: 3, Codex: 2, Claude Code: 3, Gemini: 2, Copilot: 2. These defaults apply to all execution contexts unless overridden.

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

**Plan graph independence:** Max concurrent limits are NOT part of the user-project plan graph (`.puppet-master/project/plan_graph/`). The plan graph defines only dependency structure (`depends_on`, `parallel_group`, `blockers`/`unblocks`). Concurrency limits are an execution/config concern: the scheduler loads the plan graph, respects its parallelism structure, and applies the effective per-platform caps from config.

| copy_id | Surface | Expert variant | ELI5 variant | Status |
|---|---|---|---|---|
| `tooltip.concurrency.global` | Settings/General concurrency card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.chat_override` | Settings/General chat override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.interview_override` | Settings/Interview override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.orchestrator_override` | Settings/Branching override card | Required | Required | Required in Slint rewrite |

**§7.4.8 Containers & Registry (Advanced tab):**

Add a collapsible **Containers & Registry** card in Settings > Advanced for local container runtime and registry publishing defaults.

- **Runtime controls:** runtime selector (`docker` default), Docker binary path override, compose file/path defaults, compose project-name strategy.
- **Registry defaults:** registry provider (`dockerhub` default), namespace/repository/tag defaults, push policy (`manual` default; optional `after_build`).
- **Auth controls:** auth mode (`pat` default), login validation action, last validation timestamp.
- **Preview/build integration:** settings are consumed by Preview and Build actions so container preview/build flows use consistent defaults.

ContractRef: ContractName:Plans/newtools.md#147-docker-runtime--dockerhub-contract, ContractName:Plans/newtools.md#146-preview-build-docker-and-actions-contracts, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**§7.4.9 CI / GitHub Actions (Advanced tab):**

Add a collapsible **CI / GitHub Actions** card in Settings > Advanced for workflow generation and management.

- **Template selector:** `docker-build-push`, `native-build-matrix`, `web-preview-and-test`, `mobile-ios-android`.
- **Template options:** trigger controls, matrix/build profile fields, optional publish/scanning toggles.
- **Secrets checklist:** deterministic list of required secrets for selected template and publish options.
- **Workflow actions:** `Generate workflow`, `Preview YAML`, `Apply to .github/workflows`.
- **Post-apply visibility:** generated workflows appear in a Settings list with edit/open actions.

ContractRef: ContractName:Plans/newtools.md#148-github-actions-settings--generation-contract, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

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

**Requirements step:** Upload files (max 10 files, max 5 MiB per file; drag-and-drop or file picker; list display with remove and reorder; reject oversized files with inline error). Requirements Doc Builder button opens Builder chat mode. First Builder Assistant message is exactly `What are you trying to do?`. Multiple uploads are concatenated in display order with separators. Builder output is appended after uploads.

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

**Subagent activity:** When interview subagents are enabled (see Settings > Interview), show an "Agent Activity" card beneath the Q&A area listing active subagents (name, provider, model, current action, elapsed time). Progress spinner per active subagent. When Multi-Pass Review is active, show review round counter and per-reviewer status.

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

Dedicated usage view providing persistent visibility into platform quota and consumption.

**Sections:**

1. **Quota summary:** Per-platform 5h/7d usage vs limit (e.g., "5h: X / Y", "7d: X / Y"). Plan type shown where available. Per-platform labels (e.g., "Codex 5h", "Claude 7d", "Gemini quota") because semantics differ by platform.

2. **Alert thresholds:** Configurable warning threshold (70%, 80%, 90%). Warning when usage nears limit. Option to dismiss or quiet for N hours. Toast notification when approaching limit with option to switch platform/model.

3. **Ledger tab:** Event-level log (platform, operation, tokens in/out, cost, tier/session). Filtering by type, tier, session, date range. Export as JSON/CSV.

4. **Analytics tab (optional):** Aggregate usage by time window, platform, project, model. Cost tracking where available. Export current view.

5. **Reset countdown:** "Resets in 2h 15m" shown when reset time is available (from error parsing or API).

6. **Tool usage widget:** Card or section showing tool-level metrics from seglog rollups (per Plans/Tools.md and storage-plan analytics scan). Columns or list: **Tool name** (built-in + MCP/custom), **Invocation count** (in selected window), **Latency** (e.g. p50 / p95 ms or median), **Error rate** (failures / total, %). Optional: sort by count or error rate; filter by time window (5h / 7d / custom); expand row for breakdown by platform or session. Data from redb projections produced by analytics scan over tool events in seglog. Helps identify noisy or failing tools (e.g. repeated grep, MCP timeouts).

**Data sources:** Primary: seglog/redb rollups from analytics scan jobs. Fallback: aggregate from `usage.jsonl`. Platform APIs augment when env vars are set. Tool usage: same analytics scan rollups (tool latency, error counts per tool).

**Always-visible usage:** Status bar shows compact usage (e.g., "5h: 80% | 7d: 45%") for the selected platform. Dashboard budget widgets show donut charts.

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

**Location:** Side panel (right by default, 240-480px, detachable)

**Structure:**

```
+------------------------------------------+
| [Chat] [Files]              [_] [pop] [x] |  Tab bar + panel controls
+------------------------------------------+
| [Ask] [Plan] [Int] [BS] [Crew]            |  Mode tabs (28px)
+------------------------------------------+
| v Thread: "Project X Plan"     [+]        |  Thread selector (24px)
+------------------------------------------+
|                                           |
|   MESSAGE STREAM                          |  Flex: fills available
|   (scrollable, virtualized)               |
|                                           |
|   +- Assistant -------------------------+ |
|   | [thinking >] collapsed              | |
|   | Response text here...               | |
|   | [Read: 3 files] [Changed: 1]        | |  Activity badges
|   +-------------------------------------+ |
|                                           |
+------------------------------------------+
| [Queued: "follow up msg"  edit send del]  |  Queue area (0-2 items)
+------------------------------------------+
| +------------------------------------+-+ |
| | Message input...              @  | S | |  Input (48-120px, auto-grow)
| |                               pin|   | |
| +------------------------------------+-+ |
+------------------------------------------+
| claude v | sonnet-4.5 v | 42k/128k [o]   |  Footer (20px)
+------------------------------------------+
```

**Mode tabs:** Ask | Plan | Interview | BrainStorm | Crew. Active tab has accent background + 2px bottom border.

**Mode details:**
- **Ask:** Read-only analysis mode. No file edits, no execution. Good for questions, explanations, code review.
- **Plan:** Creates a plan before execution. Three depth levels selectable via dropdown in plan panel header:
  - *Shallow:* Brief plan, minimal clarifying questions
  - *Regular:* Standard plan with clarifying questions and research
  - *Deep:* Comprehensive plan with extensive research and detailed clarifying questions
  Plan flow: Clarifying questions → Research → Plan + Todo → User approval → "Execute" button triggers execution via fresh processes. Plan panel updates progress in real-time. After execution, chat returns to normal Ask mode. "Add to queue" option available when invoked from Interview mode.
- **Interview:** Switches to interview flow with phase-based Q&A. Reduced phases when invoked from Chat (vs standalone Interview view). Questions show suggested answer chips (clickable buttons) and a "Something else" freeform text bar, matching the standalone Interview UI (§7.6). Thought stream toggle available. At end: "Do now" or "Add to queue" options. "Continue in Assistant" button from orchestrator context opens a new Chat thread with interview context pre-loaded.
- **BrainStorm:** Multi-model collaborative mode. Multiple subagents with shared context discuss and research before producing a unified plan. Subagents can communicate with each other before merging results. On "Execute," chat switches to Agent mode (single agent or crew executes the plan).
- **Crew:** Invokes a crew (multiple coordinated agents) with a Plan. Crew members work together on the plan. "Execute with crew" button after plan approval. Crew can work from existing or new plan; plan format is consumable by both single agents and crews.

**Teach capability:** The assistant can explain how Puppet Master works using built-in documentation (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections). Invoked via chat (e.g., "How does [X] work?") or `/teach` command. No separate UI -- runs within any chat mode.

**Thread selector:** Dropdown with current thread name and status dot (green=idle, blue=running, orange=queued, red=attention_required). Click opens floating thread list overlay (max 300px wide) over message area with search, archive toggle, and [+] new thread. No permanent thread sidebar (panel too narrow).

**Thread management:**
- **New thread:** [+] button creates a new thread; inherits current platform/model/mode or defaults
- **Rename:** Double-click thread name in list; or right-click → Rename
- **Archive:** Right-click → Archive; archived threads hidden by default (toggle "Show archived" in thread list)
- **Delete:** Right-click → Delete; confirmation modal required ("This cannot be undone")
- **Resume:** Resume a previous thread, restoring its full conversation context
- **Rewind:** Restore thread to a specific message (right-click message → "Rewind to here"); all messages after that point are soft-deleted (recoverable via "Show removed")
- **Share/Export:** Right-click thread → Export; bundles thread as JSON (messages, plan, metadata); secrets are stripped automatically
- **Run-complete notification:** When a run completes in a background thread, that thread's tab shows an accent dot badge; optional toast notification ("Thread 'Project X' completed"). Notification behavior configurable in Settings/General (on/off)
- **Max concurrent runs:** Default 10 per thread; configurable in Settings/General. When limit reached, new runs are queued with a message "Run queued -- N runs active". Note: per-platform concurrency limits (§7.4.7) also apply — the more restrictive limit wins for any given spawn decision

**Chat history search:** Search icon in thread list header opens a search bar that queries across all threads (human and assistant messages) via Tantivy index. Results show thread name, matching message preview, and timestamp. Click navigates to that message in its thread.

**Message stream:** Virtualized scrolling via `ListView`. User messages right-aligned with accent tint. Assistant messages left-aligned with surface background. 8px gap between messages. Thinking/reasoning: collapsible block with 2px left accent border, default collapsed; toggle to show/hide thinking for the entire thread. Activity transparency sections per assistant message (collapsible, default collapsed):
- **Bash/commands:** Collapsed: "Ran: `cargo test`" (one-line summary). Expanded: full command text + output. Each command is an audit trail entry.
- **Web search:** Collapsed: "Web search: 3 sources". Expanded: search query + list of URLs with titles.
- **Files explored:** Collapsed: "[Read: 3 files]". Expanded: list of file paths, each clickable to open in File Editor.
- **Files changed:** Collapsed: "[Changed: 1 file]". Expanded: list of changed files with +N -M line counts, clickable to open diff in File Editor.
- **Code diffs:** Inline code diffs with filename header showing +N -M. Expanded: line-by-line diff with -/+ prefixes. Clickable to open file at that location.
**Revert action:** Each assistant message with file changes shows a small "Revert" link; click undoes the last agent edit via Git restore point. Confirmation modal before reverting.

**Files-touched strip:** Below each assistant message that modified files, a compact horizontal strip shows affected files with diff counts (e.g., `app.rs +42 -8 | main.rs +3 -1`). File names are clickable (opens in File Editor at first changed line). Strip collapses to `"3 files changed"` when >5 files; click expands.

**Document rendering policy (required):**
- Chat does not render full document bodies for requirements, phase docs, PRD, contract seeds, or similar long artifacts.
- Chat shows concise summaries, findings, gaps, and change notes.

**Post-generation/revision message contract (required):**
- For document workflows, chat posts:
  1. `Opened in editor` indicator,
  2. Clickable canonical file path,
  3. Pointer to embedded document pane entry.

**Multi-Pass findings placement (required):**
- Requirements and Interview Multi-Pass runs post findings summary in chat and indicate that the same summary is shown in the page preview section.

**Plan panel:** When in Plan mode, a persistent sticky card at top shows plan outline and todo checkboxes. Collapsible.

**Steer vs Queue submission modes:** The input area supports two submission modes, toggled via a small indicator next to the SEND button (or Tab key):
- **Steer (default):** Enter sends immediately, interrupting the current generation if the assistant is actively generating. The new message is injected as a "steer" mid-stream.
- **Queue:** Enter queues the message. The queued message is sent automatically when the current generation completes. Useful for chaining requests without interrupting the assistant.
The active mode shows as a subtle label next to the SEND button ("Steer" or "Queue"). Tab toggles between modes. When in Queue mode and a message is queued, the queue area (below) becomes visible.

**Queue area:** Max 2 queued messages (FIFO). Each: truncated text (60 chars), [edit] [send now] [remove]. Faint accent tint background. Appears only when messages are queued.

**Subagent inline blocks:** When the assistant spawns subagents during execution, each subagent's work is displayed as a collapsible block in the message stream. Each block shows: persona/agent name (e.g., "Architect Reviewer"), task label (e.g., "Reviewing module structure"), platform + model badge, elapsed time, and a collapsed summary of output. Blocks persist in thread history. Click to expand and see full subagent output. Status indicator: spinner (running), checkmark (complete), X (failed).

**Active subagent indicator:** When subagents are running, a small line below the composer shows "> 3 subagents working" with a subtle pulse animation. Updates in real-time via `invoke_from_event_loop`.

**Input area:** Multi-line, auto-grows from 1 line (48px) to max 5 lines (120px). SEND button (accent background). Below-input row: `@` mention (opens file picker overlay with fuzzy search, showing files, symbols, and headings as you type), attach button (opens file dialog for files and images; paste and drag-drop also supported). Slash command detection: `/` shows autocomplete popup (see §7.16.2). **Chat ELI5 toggle:** Small toggle in input toolbar; default **OFF** (Expert/default LLM behavior). When on, assistant uses simpler explanations in this thread only (does not affect generated documents, tooltips, or interviewer text). This toggle is independent from app-level **Interaction Mode (Expert/ELI5)** in Settings. **YOLO/Regular toggle:** Permission mode selector; YOLO auto-approves all tool calls, Regular prompts for approval once or per-session. Per-session; does not persist across restarts. **YOLO + FileSafe interaction:** When YOLO is enabled and FileSafe guards are active, show a persistent warning chip in the input toolbar: "[!] YOLO active -- FileSafe guards still apply." When FileSafe blocks a command during YOLO mode, show inline approval card in the chat stream (see below).

**FileSafe in-chat approval UI:** When a command is blocked by FileSafe, display an inline card in the chat stream: orange left border, command text in monospace, guard name that triggered, and two buttons: "Approve once" (runs the command this time only) and "Approve & add to list" (adds to approved commands in Settings > Advanced). The card auto-dismisses after 60 seconds with a "Timed out -- command skipped" message. Blocked commands are also logged to the FileSafe event log accessible from Settings > Advanced.

**Footer strip (20px):** Contains the following controls left-to-right:

**Platform selector:** Compact dropdown (icon + short name). Lists all 5 platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot). Data sourced from `platform_specs`. Per-thread setting -- changing platform applies to the next message sent, not any in-flight generation. When changed, the model dropdown repopulates for the new platform and the reasoning/effort control shows or hides accordingly.

**Model selector:** Compact dropdown listing models for the currently selected platform. Models are discovered dynamically from platform CLIs (e.g., `agent models`, `claude models`) and cached. When discovery fails or returns empty, falls back to `platform_specs::fallback_model_ids(platform)`. User can customize the model list via a "Manage models" entry at the bottom of the dropdown (opens a small modal with: add custom model ID, reorder via drag, mark favorites which appear at the top, remove). Per-thread setting. The `/model` slash command also opens this selector for keyboard-friendly access.

**Reasoning/effort selector:** Shown only when `platform_specs::supports_effort(platform)` returns true. For Claude Code: dropdown with Low / Medium / High (maps to `CLAUDE_CODE_EFFORT_LEVEL` env var). For Codex and Copilot: dropdown with Low / Medium / High / Extra High. For Cursor: hidden (reasoning is encoded in model names like `sonnet-4.5-thinking`). For Gemini: hidden (no effort support). Per-thread setting.

**Context usage:** Text label (e.g., "42k / 128k") plus a context circle (progress gauge, ~16px) showing context usage percentage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover shows tokens/cost/percentage tooltip. Click opens Usage tab for that thread.

**Per-thread usage:** Small context indicator (circular progress, ~16px) in chat header. Hover tooltip: total tokens, usage %, cost (USD). Click opens thread Usage tab with: summary (total tokens, context %, total cost), breakdown (input/output/reasoning/cache), optional per-turn table, link to app-wide Usage page.

**LSP in Chat (MVP):** The Chat Window fully uses LSP (Plans/LSPSupport.md §5.1). **Diagnostics in Assistant context:** When building context for the next Assistant (or Interview) turn, include a summary of current LSP diagnostics for the project or @'d files (errors/warnings with file, line, message, severity, source) so the agent can suggest fixes. **@ symbol with LSP:** When LSP is available, the **@** menu includes **symbols** (from LSP workspace/symbol and optionally documentSymbol) so the user can add a function/class/symbol to context by name; results show path, line, kind. **Code blocks in messages:** Code blocks in assistant or user messages support **LSP hover** (tooltip with type/docs) and **click-to-definition** (e.g. Ctrl+Click) when the block has a known language and the project has an LSP server; definition opens in the File Editor. **Problems link from Chat:** Chat footer or message area offers a link or badge (e.g. "N problems") that opens the Problems panel (LSP diagnostics) for the current project or context. Optional: compact hint for @'d files (e.g. "2 errors in @'d files") with click-through to Problems. Fallback when LSP unavailable: @ symbol uses text-based symbol search; code blocks have no hover/definition; diagnostics in context omitted.

**Chat LSP control placement and behavior:**
- **Footer strip (left-to-right order):** Platform selector → Model selector → Reasoning/effort selector (when supported) → Context usage → **Problems link**. The Problems link is the rightmost LSP-related control in the footer.
- **Problems link:** Label text: **"N problems"** when count > 0 (e.g. "3 problems"), or **"Problems"** when count is 0. Placement: immediately to the right of the context usage indicator (context circle / "42k/128k"). Click target: opens the **Problems** tab of the Bottom Panel (§7.20), filtered to the **current project** (or to files in current chat context if project is set). When no project is set, the link opens Problems with no filter (or shows "Select a project to see problems" in the panel).
- **@ symbol:** Lives in the input area (below-input row: @ mention button). When opened, the overlay shows files and (when LSP available) symbols. No separate header control for LSP in Chat.
- **Code-block LSP:** Hover and go-to-definition apply in the **message area** (message stream); no dedicated control -- interaction is on the code block content itself.

**Chat LSP empty and zero states:**
- **Diagnostics empty:** When LSP is active but there are zero diagnostics, the Problems link shows **"Problems"** (no number); clicking opens Problems panel with empty state **"No problems detected"** (§7.20).
- **@ symbol -- no symbols:** When the user opens @ and selects "symbols" (or the symbol category) and LSP returns no results, show **"No symbols"** (or "No symbols in project") in the symbol list. Do not show an error; treat as empty result.
- **Code block -- unknown or unsupported language:** When a code block in a message has an unknown language tag or no LSP server for that language, do **not** show hover or go-to-definition; do **not** show an error. Render the block as plain code only.

**Chat LSP error states:**
- **LSP server error:** If the LSP server for the project reports an error or crashes, do not block Chat. @ symbol falls back to text-based symbol search (FileManager §12.1.4). Code-block hover/definition in chat is unavailable for that language; no modal error -- optional toast or status: "Language server unavailable for symbols."
- **Timeout resolving symbol (e.g. workspace/symbol):** If the LSP request times out while resolving symbols for @ or for a code block, show a brief inline message (e.g. "Symbol search timed out") and fall back to text-based symbol search for @; for code blocks, show no hover/definition for that request. Do not block the UI.
- **Project not set:** When no project is selected, **disable** LSP-dependent behavior for Chat: @ symbol shows **files only** (no symbol category, or symbol category disabled with tooltip **"Select a project to use symbol search"**). Code-block hover and go-to-definition in chat are disabled (no error; hover/click do nothing or show tooltip **"Open a project for language features"**). Problems link remains clickable; opens Problems panel with empty state **"Select a project to see diagnostics"** or equivalent.

**Chat LSP accessibility:**
- **Platform / model / effort:** Keyboard path and focus order for these dropdowns are already specified (footer strip; Tab order). No change.
- **"N problems" link:** Must be **focusable** (in tab order after context usage). **Screen reader:** Announce as "N problems" or "Problems, N items" (e.g. `aria-label="3 problems"` or live region when count updates). **Activation:** Enter or Space opens the Problems panel (same as click).
- **Code-block hover and go-to-definition:** When focus is on a code block that supports LSP, keyboard users need a way to trigger go-to-definition (e.g. focus the block and use the same shortcut as in the editor: **F12** or **Ctrl+Click** equivalent). Expose **"Go to definition"** in a context menu for the code block (right-click or menu key). Screen reader: announce code blocks that support LSP as "Code, [language], go to definition available" so users know the action exists.

**Tool approval dialog (in-chat):** When a tool has "ask" permission (per Tools.md), an inline approval card appears in the chat stream before execution. Shows: tool name, brief invocation summary (e.g., "bash: git status"), and three buttons: "Once" (approve this invocation only), "For Session" (approve all invocations of this tool for the current session), "Deny" (block this invocation). "For Session" approvals persist only until app restart. When YOLO mode is active, all tool approvals are skipped (but FileSafe guards still apply).

#### 7.16.1 Web Search

The chat supports web search with citations. When the assistant performs web search, results are displayed with inline citations (numbered superscripts linking to sources) and a "Sources" list at the bottom of the message showing URL, title, and snippet for each cited source.

#### 7.16.2 Slash Commands

Typing `/` in the chat input shows an autocomplete popup listing available commands.

**Built-in commands (reserved):**

| Command | Action |
|---------|--------|
| `/new` | Create a new thread |
| `/model` | Switch model for current thread |
| `/export` | Export current thread (JSON bundle, secrets stripped) |
| `/compact` | Compact current session (trim context, preserve key info) |
| `/stop` | Stop current run |
| `/resume` | Resume a paused run |
| `/rewind` | Rewind to a specific message |
| `/revert` | Revert last agent file edit |
| `/share` | Share thread bundle |

**Custom commands:** Users can define application-wide and project-wide custom slash commands. Custom commands are editable in Settings > Slash Commands tab. Custom command names must not conflict with built-in commands. Format: name, description, action (prompt template or callback).

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

**External drag-and-drop:** Drag files from the system file manager into the File Manager tree to copy or move them into the project. Uses platform-specific APIs: Windows (IDropTarget / OLE drag-drop), macOS (NSDraggingDestination / NSPasteboard), Linux (Xdnd protocol / wl_data_device for Wayland). On drop: show confirmation dialog listing files to import ("Copy N files into {folder}?" with [Copy] [Cancel]). If a file already exists at the destination, show conflict resolution: "File already exists" with [Replace] [Skip] [Rename (auto-suffix)] per file, plus [Apply to all]. Progress indicator for multi-file copies. Dropped directories are copied recursively.

**File preview:** When a file is selected, read-only preview in primary content area (or in-panel split when panel >400px). Monospace font with basic syntax highlighting using accent palette.

### 7.18 File Editor (NEW)

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

**Location:** Embedded in Wizard and Interview views

Read-only, chat-like pane showing streaming agent output during document generation and Multi-Pass Review. Shows which persona/subagent is working on which task. Non-interactive. Progress indicators for documents in progress. Monospace font. Min height 120px, max ~500 visible lines (virtualized via `ListView`).

**Responsibility boundary (required):**
- Agent Activity Pane is for streaming/progress only.
- It must not host document navigation, document editing, or approval controls.
- Findings summary and approval controls are shown in chat + preview section; document editing happens in File Editor or embedded document pane.

**Event wiring (required):**
- Pane consumes normalized Provider event stream used by chat.
- UI updates are dispatched through the Slint event loop (`invoke_from_event_loop`) for immediate state refresh.

**Accessibility:** The pane uses `accessible-role: text` (or equivalent for read-only log output). Screen readers should announce new output as it arrives via a live region equivalent (Slint: set `accessible-label` to include latest line summary). Focus can be placed on the pane for keyboard scrolling (Up/Down/Page Up/Page Down). Keyboard shortcut to toggle auto-scroll.

### 7.19.1 Embedded Document Pane (NEW)

**Location:** Embedded in Wizard and Interview primary content, separate from Agent Activity Pane and separate from side-panel Chat.

**Purpose:** Newbie-friendly surface to review and lightly edit human-readable project artifacts without leaving the flow.

**Content scope:**
- Include: requirements docs, plan docs, interview-generated docs (phase docs, PRD, AGENTS.md), and related human-readable artifacts.
- Exclude: raw JSON/non-human-readable files from editable list.
- Special entry: `Plan graph` rendered view (read-only tree/graph). Do not expose raw plan graph JSON for editing in this pane.

**Navigation and editing:**
- Left tree/hierarchical sidebar with button-like document entries.
- Selecting an entry shows document content in main editor area.
- Editing is basic text edit + save. Advanced IDE features remain in File Editor.
- Saves write to the same artifact and shared buffer/history contract as File Editor.

**Plan graph entry requirements:**
- Rendered read-only plan graph view.
- Notice near graph view: `Talk to Assistant to edit plan graph.`

**Checkpoint history UI:**
- Show checkpoint restore options (for example `before_multi_pass`, `after_user_edit_1`).
- Restore actions route through shared file open/refresh pipeline and maintain single source of truth history.

### 7.20 Bottom Panel (NEW)

**Location:** Below primary content, collapsible

**Tab bar (24px):** Terminal | Problems | Output | Ports | Browser | Debug. Optionally **References** (when Find references / Shift+F12 is implemented, results appear in a **References** tab; click row opens file at location; see §7.18 LSP features). Collapse/expand button. Pop-out button.

**Terminal:** Agent stdout/stderr, bash command output. Uses terminal styling (monospace, dark background even in light theme). Color-coded: stdout=ACID_LIME, stderr=HOT_MAGENTA, system/info=SAFETY_ORANGE, FileSafe-blocked=RED with "[BLOCKED] Blocked by FileSafe" prefix. Max 500 visible lines. Auto-scroll with scroll-lock toggle.

**Terminal tab management:** Each terminal instance is a tab within the Terminal section. Tab naming: tabs show agent/task name; user can pin or rename terminal tabs. **Pin semantics:** Pinned tabs are narrower (icon-only), persist across sessions, and cannot be closed without unpinning first. Unpinned tabs close normally. **Instance caps:** Maximum 12 terminal instances (configurable in Settings > General, range 4-20). When the cap is reached, attempting to open a new terminal shows a toast: "Terminal limit reached -- close an existing terminal first." LRU eviction is NOT automatic; user must explicitly close tabs. **New terminal:** "+" button on terminal tab bar creates a new shell instance. Right-click terminal tab: Rename, Split horizontally, Split vertically, Pin/Unpin, Close (disabled if pinned), Close others, Close all unpinned.

**Problems:** Shows LSP diagnostics for the target project: errors, warnings, info. Columns: file (path), line, message, severity, source (e.g., rust-analyzer). Click row to open file in File Editor at that location. Filter by severity via toggle buttons (Errors / Warnings / Info). Badge on tab label shows count (e.g., "Problems (3)"). **Empty states:** "No problems detected" when LSP is active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running; "Select a project to see diagnostics" (or equivalent) when no project is selected (e.g. when opened from Chat with no project set).

**Output:** Puppet Master's own log output (debug/info/warn/error, filtered by settings log level).

**Ports (includes Hot Reload):** Shows detected local servers (port, process name, status) when target project runs dev servers. **Hot reload controls:** A "Watch mode" toggle button at the top of the Ports tab. When enabled, Puppet Master starts a file watcher (using `notify` crate) on the target project directory. On detected changes (debounced 500ms), triggers the project's configured build command (from Settings > General or project config). Status line: "Watching: src/ (12 files changed, last rebuild 3s ago)" or "Watch mode: off". Build output streams to a dedicated terminal tab named "[hot-reload]". Errors in build output are parsed and surfaced in the Problems tab (if possible). Toggle persists per-project in redb. **Port list:** For each detected port: port number, process name, PID, status (listening/closed), uptime. Click row to open `http://localhost:{port}` in the Browser tab. "Kill" button per row (with confirmation). Auto-refresh every 5s or on file-watcher event. Empty state: "No active ports -- start a dev server to see it here."

**Browser (MVP):** Embedded webview tab for viewing web content without leaving the IDE. Uses `wry` crate for cross-platform webview embedding (WebView2 on Windows, WebKit on macOS/Linux). The Browser tab hosts a webview as a native child window within the bottom panel area.

**Browser UI:**
- **URL bar:** Text input at top of browser tab with navigation buttons (Back, Forward, Refresh, Home). URL auto-completes from history. Enter key navigates. Shows loading indicator (progress bar below URL bar) during page load.
- **Tab management within Browser:** Multiple browser tabs within the Browser section (similar to terminal tabs). Pin semantics apply (same as terminal: pinned tabs are icon-only, cannot be closed without unpinning). Instance cap: maximum 8 browser tabs (configurable in Settings > General, range 2-12). "+" button opens new tab with blank page or configured home URL.
- **Click-to-context:** When viewing a page, user can activate "Inspect mode" via a crosshair button in the browser toolbar. In inspect mode, hovering over elements highlights them with an overlay border. Clicking an element captures its context: tag name, id, class list, text content (truncated to 500 chars), bounding rect, parent path (up to 5 ancestors), and an HTML snippet of the element and immediate children. Captured context is injected into the Chat input with a toast: "Element context captured." Rate limit: 1 capture per 2 seconds. DOM size cap: elements with >100 children are summarized.
- **DevTools:** Optional "Open DevTools" button (opens the webview's built-in dev tools in a separate window). Useful for CSS debugging.
- **Bookmarks:** Simple bookmark list (URL + title). Add current page via star icon in URL bar. Bookmark list accessible from dropdown. Persisted in redb.
- **Empty state:** "No page loaded -- enter a URL or click a link from the chat" with a list of bookmarks (if any).
- **Security:** Sandboxed webview. No access to local filesystem unless explicitly granted. JavaScript enabled by default with toggle. Cookies/storage scoped per-project.

**Debug (MVP):** Integrated debugging via the Debug Adapter Protocol (DAP). The Debug tab provides a debugging interface for the target project.

**Debug UI:**
- **Run configurations:** A dropdown at the top of the Debug tab listing saved run/debug configurations for the current project. Each configuration specifies: name, type (launch/attach), program/command, arguments, environment variables, working directory, pre-launch task (optional), and DAP adapter path. Configurations are stored per-project in `.puppet-master/launch.json` (compatible with VS Code launch.json format where possible). "Edit configurations" button opens the configuration file in the File Editor.
- **Debug toolbar:** Play (start/continue), Pause, Step Over, Step Into, Step Out, Restart, Stop buttons. All buttons have clear iconography and tooltips. Disabled when not applicable (e.g., Step Over disabled when not paused at breakpoint).
- **Variables panel:** Tree view of local variables, arguments, and watch expressions. Expandable for compound types. Editable values (double-click to modify, with type validation).
- **Call stack:** List of stack frames. Click to navigate to source location in File Editor. Current frame highlighted.
- **Breakpoints:** List of all breakpoints across files. Columns: file, line, condition (if conditional), hit count, enabled toggle. Click to navigate. Right-click: Edit condition, Remove, Disable.
- **Debug console:** REPL-style input for evaluating expressions in the current debug context. Output shows evaluation results. History (up-arrow for previous commands).
- **Breakpoint gutter integration:** In the File Editor (§7.18), clicking the left gutter (to the left of line numbers) toggles a breakpoint (red dot). Conditional breakpoints via right-click gutter > "Add conditional breakpoint" (shows input for condition expression). Breakpoints are persisted per-project in redb.
- **DAP adapter management:** Settings > Debug (new subsection in Advanced or dedicated tab) lists available debug adapters. Built-in support for common adapters (codelldb for Rust/C++, debugpy for Python, node-debug for JavaScript). Custom adapters can be added (adapter path, type, supported languages). Adapter auto-detection from project language (see §7.3 language auto-detection).
- **Empty state:** "No debug configuration found -- create one to start debugging" with "Create configuration" button that generates a template based on detected project language.
- **Keyboard shortcuts:** F5 (Start/Continue), F10 (Step Over), F11 (Step Into), Shift+F11 (Step Out), Shift+F5 (Stop). Registered in shortcut registry.

**4-split terminal (Dashboard):** The Dashboard also contains a 4-split terminal area (2x2 default layout). One PTY per pane. Bounded line buffers per pane (ring buffer or fixed-size deque). Virtualized rendering. Resizable splits; ratios persisted in redb.

**Collapse behavior:** Double-click tab bar or click collapse button to minimize to just the tab bar (24px). Height stored and restored.

### 7.21 NotFound

Fallback 404/error page shown when navigation target is invalid.

---

