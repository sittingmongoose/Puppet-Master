# Working Ledger

## Work Item
w-20260329-235630

## Mode
research

## Topic / Scope
Two-part research:
1. **Firecrawl gap analysis**: Evaluate Firecrawl capabilities against PM agent web-search design; integrate all gaps (high/medium/lower) as MVP.
2. **Comprehensive lost-spec recovery**: Prior work item w-20260316-160450 contains 4,076 lines of locked decisions across 30+ topics that NEVER made it into canonical planning docs. Full audit and reconciliation inventory required — ALL topics, not just web.

## Objective
- Map Firecrawl capabilities → PM integration model (provider + native)
- Recover ALL locked decisions from w-20260316-160450 across every topic area
- Cross-reference against canonical docs to produce excruciating-detail gap inventory
- Catalog every locked decision, its target doc, and what's missing/partial/contradictory
- Produce reconciliation-ready findings for downstream packetization

## Constraints / Non-Goals
- Research only; no planning-doc edits in this phase
- Firecrawl AGPL code is NOT imported — patterns and capabilities only
- Ledger is execution memory only, NOT canonical, NOT cited in planning docs
- Not rewriting PM architecture — augmenting existing web tool family + recovering lost specs

## Key Facts and Findings

### PART A: FIRECRAWL CAPABILITIES

#### Architecture
- Node.js/TypeScript (Express), proprietary Fire Engine + Playwright fallback, NUQ job queue, Redis, PostgreSQL
- 8 core endpoints: scrape, crawl, map, search, extract, agent, browser, interact
- 12+ output formats per scrape (markdown, HTML, JSON, screenshot, summary, links, images, changeTracking, branding, audio, attributes, query)
- SDKs: Python, JS/TS, Rust, Java, Go, Elixir
- AGPL-3.0 license (self-hostable but missing Fire Engine anti-bot in OSS)
- MCP server as first-class integration path

#### Search
- Uses Serper API (Google results) — NOT its own index
- Sources: web, news, images + categories: github, research, pdf
- Returns full page content (markdown/HTML), not just snippets
- 1 credit per result, limit 1–10

#### Extract (Beta)
- LLM-powered structured extraction from URLs
- Supports JSON Schema, Pydantic, Zod
- URL wildcards for domain-wide extraction
- `enableWebSearch` flag to expand beyond provided URLs
- FIRE-1 agent model for complex navigation

#### Agent
- Autonomous research: no URLs required, describe what you need in natural language
- Spark-1-pro / spark-1-mini models
- Searches, navigates, fills forms, handles pagination, extracts structured data
- 20–2500 credits depending on complexity

#### Interact / Actions
- Post-scrape browser automation: click, scroll, type, wait, screenshot, executeJavascript, PDF
- Max 50 actions, total wait ≤60s
- `/interact` endpoint: prompt-based interaction (not just CSS selectors)
- Persistent browser sessions with profiles (cookies, localStorage)

#### Change Tracking
- Built-in `changeTracking` format: previous scrape timestamp + status (new/same/changed/removed)
- Diff formats: git-diff or JSON
- Observer app for scheduled monitoring

#### Async Model
- All operations return job ID immediately
- Polling, WebSocket streaming, webhooks (started/page/completed/failed)
- Webhook HMAC signature verification, 3 retry attempts with backoff

#### Anti-bot
- Proxy modes: basic, stealth, enhanced, auto
- UA rotation, fingerprint randomization, TLS signature rotation
- Fire Engine (proprietary) NOT available in self-hosted

### PART B: PM CURRENT WEB TOOL STATE (CRITICAL — STUBS)

Canonical docs define 6 web tools but most are barely specified:

- **websearch**: `query: string` → `results array`. Exa-backed. Web only. No categories, no provider routing.
- **webfetch**: `url: string` → `content: string`. Markdown only. 30s timeout, 1 MiB cap.
- **webextract**: `url: string` → `extracted content + provenance refs`. NO schema. NO behavior defined.
- **webresearch**: `task: string` → `multi-source result + sources/provenance`. NO chaining. NO autonomous behavior.
- **webcrawl**: `url: string` → `crawl results + traversed refs`. No dedup, no filtering.
- **webmap**: `url: string` → `site map + source refs`. Minimal.

§8.2.1 (cited web search) is ENTIRELY MISSING from newtools.md — referenced at line 72 TOC but never written.

### PART C: RECOVERED PROVIDER ARCHITECTURE (from w-20260316-160450)

#### Hybrid Provider Model
- **Exa** = primary/default (free tier + optional API key in global user settings)
- **Tavily** = optional premium (native integration, NOT via MCP; API key required)
- **DuckDuckGo** = fallback (HTML scraping adapter, no key)
- **Google** = optional adapter slot
- **Anthropic/OpenAI** = model-native web search providers
- **Firecrawl** = lower-priority provider (user-changeable) [NEW — user decision this session]

#### Capability-Based Routing
Per operation × provider → native / pm-composed / unsupported:
- **Tavily**: native for ALL 5 ops (search, extract, research, crawl, map)
- **Exa**: native search/extract/crawl, near-native research, unsupported map
- **Anthropic/OpenAI**: native search only, everything else pm-composed
- **DDG**: native-ish search, partial crawl, everything else pm-composed
- **Google**: native search only
- Fallback within providers supporting same operation
- Provider switch disclosed in chat + audit

#### Provider Classification
- **Model-native providers**: Anthropic, OpenAI (capabilities come from the model itself)
- **Backend/API providers**: Exa, Tavily, DuckDuckGo, Google, Firecrawl (external services)

#### Key Provider Rules
- Tavily extract ≠ native Site Reader (distinct roles)
- Naming: `web_search` (underscore) to avoid LLM keyword collisions
- 47-domain spam blocklist with monthly updates
- API key rotation: 30-day cycle
- Rate limit alerting at 80%, throttling at 90%

### PART D: RECOVERED TERMINAL / INLINE OPERATION CARDS (from w-20260316-160450)

#### Mini-Terminal Card Defaults (LOCKED)
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- Full metadata (status, cwd, command summary, elapsed time, exit/truncation details)
- One card per command
- Retries create new terminal + new card (not reuse)
- Long-running/watch-mode: same card model
- Live by default while command active
- Copy works directly from card
- `Open in Terminal` opens PM's built-in terminal (NOT external OS terminal)
- Opens view onto same live command/session
- Repeated `Open in Terminal` idempotent (focuses existing, no duplicates)
- No special failure treatment beyond normal card status/meta
- Placement: inline exactly where command happened
- Optional textual summary after card

#### Inline Operation Card Family (LOCKED)
- Shared template: command, search, edit events
- Same inline preview pattern for terminal outputs, search results, code-edit previews/diffs
- **Shared anatomy**: type icon+label, status badge (running/completed/blocked/failed/cancelled), title/summary, subject detail, primary open action, expand/collapse, bounded preview body, optional secondary actions
- **Search card**: primary action opens search results view/list (NOT jump to file); individual hits open files; collapsed=5 results, expanded=15, scrollable, 50-result cap; NO copy
- **Diff card**: one per edit command; opening opens file in editor showing diff; cap=50 lines; diff preview sizing same as other cards; NO copy
- **Terminal card**: copy allowed; may show bounded live tail while active

#### Card Summary Defaults (LOCKED)
- Command: `Ran: <command>` or `Running: <command>`
- Web/search: `<operation>: <query/url> — N sources`
- Diff/edit: `<path> +N −M`
- Completed cards: default to collapsed when verbose
- Failed/blocked cards: surface key failure line without forcing expand

#### Terminal Promotion / Handoff / Recovery (LOCKED)
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- If non-interactive becomes long-running, chat may promote to Terminal-owned
- Every promoted command card binds to stable terminal session identity
- `Open in Terminal` / `Show Terminal` must focus SAME live session
- After promotion: chat stops acting as full transcript owner; card shows status + bounded tail
- Recovery: process alive + attach fails → `Retry attach`, `View output log`, `Stop process`; process ended → focus historical output; inline-only + complete → `View output` / `Rerun in Terminal`
- Terminology: use `Open in Terminal`, NOT `Pop Out Terminal`
- Large payloads store full data behind refs/blobs; cards show bounded previews only
- Cards persist on thread reload; re-rendered from persisted source/metadata

### PART E: RECOVERED CHAT CONTROLS & MESSAGE ACTIONS (from w-20260316-160450)

#### Message Controls (LOCKED)
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- **Stop**: immediate cancellation (distinct from queue/steer/interrupt)
- **Edit**: restores into composer for modification + resend; discards all later history/work
- **Resend**: retry/re-run most recent message; discards all later history/work
- **NO delete action** (explicitly locked by user)
- Inline rewind warning, NO extra confirmation dialog
- Stop/Edit/Resend disappear once next user message sent
- Render as icons, not text labels

#### Stop Control Placement (LOCKED)
- Primary: composer/send icon morphs into stop icon while agent working
- If user starts typing during active run, composer returns to send (new message queued)
- Per-message stop icon also present alongside edit/resend

#### Message Row Action Model (LOCKED)
- Assistant row: copy + contextual stop (while run active)
- Most recent user row: copy + edit + resend + contextual stop
- Older messages: copy only
- Code blocks: visible copy, open in editor (if filename), go to definition (if LSP)

#### Scroll / Auto-Follow (LOCKED)
- Auto-follow while at bottom; scrolling up pauses auto-follow
- Jump-to-bottom button with unseen-count badge
- Pressing jump returns to bottom + re-enables follow

#### Copy Behavior (LOCKED)
- All user + assistant messages: always-visible copy icons (NOT hover-only)
- Code blocks: visible copy coexists with file-open/LSP actions
- Diff cards: do NOT inherit generic code-block copy (distinct operation-card rules)

### PART F: RECOVERED PLAN / DEEP PLAN / TODO TRACKING (from w-20260316-160450)

#### Plan vs Deep Plan (LOCKED)
- Both produce normalized TODO list; users can edit/add/remove/reorder before approval
- Plan is read-only until execute; keeps plan panel visible
- Deep Plan uses same todo function but produces fuller plan artifact for review/edit/questions before execution
- Deep Plan does **materially more** thinking, research, clarifying-question work (not just degree; explicit behavioral difference)

#### Normalized TODO Schema (LOCKED)
- `todo_id`, `title`, `summary`, `status`, `dependencies[]`, `owner_hint`, `verification_hint`, `notes?`, `order_index?`
- Status set: `pending`, `in_progress`, `completed`, `blocked`, `skipped`
- TODOs carry forward into execution

#### Plan/TODO State Model (LOCKED)
- Distinguish: `draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`
- Revisions/replans create explicit new draft/revision state (NOT invisible mutation)
- After approval: structural edits gated/restricted; status updates continue automatically
- Later changes require explicit replan/revise flow
- Storage event: `chat.plan_todo_updated` = canonical event family for TODO persistence

#### Sticky Plan Panel (LOCKED)
- Per-thread, shows: plan title/summary, todo list in canonical order, status badge per todo, dependency hints, owner/delegated-executor badge, verification hint
- Before approval: full editing controls
- After approval: execution-tracker posture (read-mostly)

#### Inline Progress in Chat (LOCKED)
- Do NOT duplicate full checklist on every turn
- Show compact milestones: `Started TODO 2/5`, `Completed TODO 2/5`, `Blocked TODO 3/5`
- Clicking inline update focuses/opens sticky plan panel at that item
- Completed plan leaves final todo states visible; switching to Ask mode must NOT erase plan/todo state

#### Auto-Use Heuristic (LOCKED)
- Plan/Deep Plan = mandatory normalized TODO
- Non-Plan execution: agent may auto-use `todowrite` when multi-step enough
- Triggers: 3+ meaningful steps, dependencies, multi-file/multi-subsystem, delegated subagent/crew, explicit user request

#### todowrite/todoread Tool Contract (LOCKED)
- Expand to use normalized TODO schema from planning outputs
- `todowrite` can create, reorder, update statuses/notes
- `todoread` returns current normalized list for active thread/run
- Same schema works for single-agent, subagent, crew execution
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- Subagent default = deny unless explicitly re-enabled by run config

### PART G: RECOVERED QUESTION CARD / QUESTIONNAIRE SYSTEM (from w-20260316-160450)

#### Question UI (LOCKED)
- Suggested options/chips + required **"Something else"** freeform path
- Always-visible options; required by default unless explicitly marked otherwise
- Question styling stays consistent (not ad hoc per question)
- Used by: Assistant, Interviewer, requirements/document-builder flows

#### Multi-Question Flow (LOCKED)
- Present as navigable flow/list
- Answer out of order; go back and change before submit
- Final submit blocked until required questions complete
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit; pauses conversation until user resumes

#### Question Card Schema (LOCKED)
- `question_id`, `prompt`, `options[]`, `allow_other`, `allow_multi_select`, `required`, `response_kind`, `draft_value`, `validation_state`, `submitted_at?`
- Flow states: `draft`, `incomplete`, `ready_to_submit`, `submitted`, `paused`

#### Question Tool Contract (LOCKED)
- Input: `mode: "single_question" | "questionnaire"`, `header?`, `prompt?`, `questions: Array<QuestionItem>`
- QuestionItem: `question_id`, `question`, `description?`, `options?`, `required?` (default true), `multi_select?` (default false), `allow_freeform?`/`allow_other?` (default true), `placeholder?`, `default_values?`
- Output: `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`, `answers: Array<{question_id, values: string[], source?: "option"|"other"|"freeform"}>`, optional `answer_text?` for single-question callers
- Headless/HITL-unavailable = `status = "unavailable"` (NOT fabricated answers)
- Subagents should NOT spam users with independent question flows
- Add `question` to Permissions_System.md; default = allow when HITL available

### PART H: RECOVERED INLINE VISUALIZER / MERMAID (from w-20260316-160450)

#### Mermaid (LOCKED)
- Canonical source text (`mermaid` fenced blocks / `.mmd`)
- Chat/planning render as native diagram card
- Visible error state on parse failure

#### Inline Visualizer (LOCKED)
- HTML/SVG fragment rendered in isolated rich-UI surface with injected theme tokens
- Auto-sizing, narrow bridges (`sendPrompt(text)`, `openLink(url)`, theme injection, auto-height/resize reporting)
- Local JS state/controls inside visual expected (tabs, sliders, quiz choices)
- NOT limited to question flows — general-purpose chat capability
- Use cases: quizzes, interactive visualizations, diagrams, charts, explainer widgets
- Visuals appear both on explicit request + proactively when helpful
- Natural-language invocation (visualize, diagram, chart, quiz me, etc.)
- Contained sandboxed visual module/card with narrow host bridge
- Third-party libraries/scripts allowed through PM's supported visual runtime
- When rendering fails: show source or fallback + visible error state
- No fallback mode (do not silently degrade to text-only)

#### Visualizer Persistence (LOCKED)
- Persist: source fragment, metadata (title, kind, version), PM-managed outputs/draft values
- Do NOT persist arbitrary JS heap/runtime state
- Re-render from persisted source on thread reload/export review

#### Chat Widget Taxonomy (LOCKED)
- Plain code blocks, diff/operation cards, Mermaid/native diagram cards, question cards = **related but distinct message widgets** (not one overloaded "rich block" type)

### PART I: RECOVERED SLASH COMMANDS (from w-20260316-160450)

#### CRITICAL: Slash-Command SSOT Drift
Three incompatible slash-command lists exist:
- `assistant-chat-design.md` §5: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/clear`, `/help`, `/settings`, `/doctor`, `/cancel`, `/stop`
- `FinalGUISpec.md` §7.16.2: `/new`, `/model`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`
- `UI_Command_Catalog.md`: follows assistant-chat-design style with stable IDs

#### Canonical Built-In Slash Set (LOCKED)
Unified reserved set: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`
- `/cancel` = alias/deprecation path to `/stop` (accepted temporarily, UI prefers `/stop`)
- `/clear` = remove unless product explicitly preserves it
- All reserved built-ins are **non-overridable**
- `Commands_System.md` must stop allowing `override_builtin: true` for reserved built-ins

#### /web Family (LOCKED)
- `/web search <query>`, `/web extract <url>`, `/web research <task>`, `/web crawl <url>`, `/web map <url>`
- Stable IDs: `cmd.chat.web.search`, `cmd.chat.web.extract`, `cmd.chat.web.research`, `cmd.chat.web.crawl`, `cmd.chat.web.map`
- Optional: `cmd.chat.web.help`
- Natural language routes through same dispatcher
- Do NOT flatten into separate top-level slash families (`/search`, `/crawl`)

#### /skill Helper (LOCKED)
- `/skill use <skill-id>`, `/skill list`, `/skill show <skill-id>`
- Lightweight helper, NOT full management family
- Management remains in Agent Config > Skills
- Natural-language invocation routes same dispatcher

### PART J: RECOVERED SKILLS / AGENT CONFIG (from w-20260316-160450)

#### Agent Config Surface (LOCKED — user correction)
- Top-level management surface name = **Agent Config** (NOT "Skills page")
- **Skills** becomes one tab/section inside Agent Config
- Recommended minimal v1 tabs: **Personas** + **Skills**
- FinalGUISpec.md must stop treating Skills as Settings sidebar destination

#### Agent Config Boundary (LOCKED)
- Agent Config owns: agent-behavior artifacts (personas, skills)
- Settings keeps: system-level dependencies (authentication, models, permissions, rules, health)
- Cross-link allowed: Agent Config → Settings for referenced dependencies
- Agent Config is NOT replacement for Settings

#### Skills Catalog & Import (LOCKED)
- Real browseable skills catalog + explicit import UX
- Import: drag-and-drop skill folders/files, file-browser import, supported archives (`.zip`, `.tar.gz`)
- No remote URL/git import in v1 (remote = Catalog/Skill Store path)
- Import flow: unpack → auto-populate metadata from frontmatter → validate → surface warnings
- Portable skills presumed importable by default; validation determines readiness

#### Skill Source/Readiness Model (LOCKED)
- Source types: `bundled`, `catalog_installed`, `manual_import`, `project_local`, `global_local`, `shadowed`
- Readiness/status: `ready`, `ready_with_warnings`, `invalid`, `shadowed`, `disabled`
- Badges: `referenced_by_persona`, `auto_invokable`, `requires_missing_capability`, `catalog_update_available`

#### Skill Store vs Skills Page (LOCKED)
- **Skill Store** = browse/install surface only (launched from Skills page)
- **Skills page** = management surface for installed/active/manageable entries
- Management actions in Skills page: enable/disable, inspect/preview, edit source, revalidate, remove/uninstall, open source location

#### Skill Tool Runtime Contract (LOCKED)
- Output envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, `metadata?`
- Built-in/bundled skills first-class in same registry model
- Resource/file sampling for discoverability only (not recursive dumps)

### PART K: RECOVERED PERMISSIONS ARCHITECTURE (from w-20260316-160450)

#### Core Permission Model (LOCKED)
- Three permission actions: `allow` / `ask` / `deny`
- Unknown/unrecognized tool default = `ask`
- Immutable permission snapshot finalized at attempt/run start
- Historical runs show frozen permission snapshot that governed them — NEVER recomputed from current settings
- Finalize effective permission snapshot at run start / project switch

#### Canonical Tool Permission Keys (LOCKED)
Full key table (16+ keys):
- Built-in: `bash`, `read`, `grep`, `glob`, `codesearch`, `chatsearch`, `logsearch`, `logread`, `repo.import`, `lsp`
- Web family: `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`
- Interactive: `question` (default=allow when HITL available), `skill` (default=allow)
- Planning: `todowrite`, `todoread` (default discussed as `allow` but mode-override conflict — see below)
- Execution: `task`, `media.generate`, `capabilities.get`

#### CRITICAL: Plan Mode Contradiction (BUG — LOCKED FIX)
- **Current broken state**: Plan mode auto-denies `edit`, `bash`, `task`, `webfetch`, `websearch`, `repo.import`, `media.generate`, `todowrite`
- Clashes with PM direction that web research is first-class in planning
- Plan/Deep Plan emitting normalized TODOs + web research being first-class in planning makes blanket deny contradictory
- **Corrected auto-deny set** for `ask`/`plan` modes: ONLY `edit`, `bash`, `task`, `repo.import`, `media.generate`
- Web tools + `question` + `todowrite` resolve through normal permission rules, NOT blanket-denied by mode
- **FIX REQUIRED**: Remove web tools + question + todowrite from mode-level deny

#### Approval Ladder (LOCKED — EXPANDED)
- Current ladder too small: only `once` / `for session` / `deny`
- Correct ladder: `once` / `for session` / `always` (durable rule) / `deny`
- `once` = one invocation only
- `for session` = ephemeral session-cache allow rule
- `always` = persistent permission-rule creation through canonical permissions storage
- `deny` = reject this invocation
- When choosing `always`, surface scope selection: **project** or **global**
- Do NOT collapse durable approval into ad-hoc allowlists

#### Approval UI Disclosure (LOCKED)
- Show source/layer that governs each permission decision: mode override | session cache | Persona profile | project rule | global rule | default
- Show requested vs effective state when they differ
- Include **durable/permanent approval path** (not only once/for-session/deny)
- Logging visibility in BOTH chat surfaces + dedicated log/audit view

#### Blocked-Action Recovery (LOCKED)
- Permission blocked → approve once/for session/always/open permissions
- FileSafe blocked → approve once/add rule/open FileSafe settings
- MCP unavailable → open integration/auth/config surface
- Provider unavailable → switch provider/model or open Authentication/Health
- Headless ask denial → show that interactive approval unavailable + what user action resumes

#### Session Approval Patterns for Web Tools (LOCKED)
- **Search/research tools** → tool-wide wildcard (`*`) pattern
  - `websearch`, `webresearch`: session pattern = `*` (host cannot be known upfront in search operations)
- **URL-scoped operations** → normalized host/domain pattern
  - `webfetch`, `webextract`, `webcrawl`, `webmap`: session pattern = `https://host.example/*`
  - Rationale: URL-scoped read operations where host scoping is understandable and safer
- Approving `webcrawl` "For Session" auto-approves crawl/map/extract/fetch matching same host pattern
- Approving `webresearch` "For Session" does NOT create broad allow for unrelated tools

#### Permission Preset Reconciliation (LOCKED — FULL DETAIL)
- Presets must stop being narrower than product's own planning/research features
- **Read-only preset**:
  - Allow: `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch`, `skill`, `lsp` (read-only), `question`, `todoread`, `todowrite`, `capabilities.get`
  - Ask: `webfetch`, `websearch`, `logread`, `task`
  - Deny: `edit`, `bash`, `repo.import`, `media.generate`
- **Plan mode preset**:
  - Allow: all Read-only allow tools
  - Ask: `webfetch`, `websearch`, `webextract`, `webresearch`, `webcrawl`, `webmap`, `logread`, `task`
  - Deny: `edit`, `bash`, `repo.import`, `media.generate`
  - EXPLICITLY: web tools at `ask`, NOT auto-deny
- **Full preset**:
  - Allow: read/search/skill/lsp/question/todo family
  - Ask: `edit`, `bash`, `repo.import`, `media.generate`, web family, `logread`, `task`
- Plan-mode language MUST NOT imply blanket denial of tools expected during planning/research
- Canonical permission presets should match PM's explicit Ask/Plan product semantics, NOT OpenCode defaults

### PART L: RECOVERED SUBAGENT / TASK BEHAVIOR (from w-20260316-160450)

#### Subagent Defaults (LOCKED by user)
- **Aggressive by default**: always use when explicitly asked; prefer for bigger multi-step work; proactively use whenever clear specialist fit
- Do NOT require explicit `/task` or subagent invocation for work that benefits from specialization
- Later GUI settings may tune aggressiveness; default remains aggressive not conservative
- Chat/UI should disclose: which subagent/persona used, why, what task it owned

#### Task Tool Runtime Contract (LOCKED — FULL SPEC)
- **Input**: `description`, `prompt`, `subagent_type`, `task_id?` (resume/continue), `command?`
- **Output**: `task_id`, `subagent_type`, `resumed: boolean`, `result_text`, `runtime_snapshot?`
- **Error**: invalid `subagent_type` = structured error
- **Visibility**: inaccessible/denied subagents should NOT be advertised as selectable from caller's effective permission view
- **Permission inheritance**: subagents inherit parent permissions with enforced overrides
- **Default denials for subagents**:
  - `todowrite` / `todoread` = denied by default unless explicitly re-enabled by run config
  - Nested `task` use = denied by default unless target subagent explicitly permits it
- **Resume**: resumed tasks continue same delegated session identity, NOT fresh spawn

#### Crew Delegation Model (LOCKED)
- Same normalized TODO schema works for ALL execution types: single-agent, subagent, crew
- `owner_hint` bridges planning and execution: may be advisory at plan time, becomes effective delegated owner during execution
- Progress rows can surface delegated owner changes without rewriting original TODO identity
- Progress disclosure without rewriting TODO identity is a key constraint

### PART M: RECOVERED LSP TOOL CONTRACT (from w-20260316-160450)

#### Canonical LSP Operation Set (LOCKED)
- **Read-only operations** (under `lsp` permission, default allow):
  - `goToDefinition` — requires `path` + `position`
  - `findReferences` — requires `path` + `position`
  - `hover` — requires `path` + `position`
  - `documentSymbol` — requires `path`
  - `workspaceSymbol` — requires `query`
  - `goToImplementation` — requires `path` + `position`
  - `prepareCallHierarchy` — requires `path` + `position`
  - `incomingCalls` — requires `path` + `position`
  - `outgoingCalls` — requires `path` + `position`
- **Write/approval-gated operations**:
  - `rename` — requires `path` + `position` + `newName`; approval-gated because it applies edits
- PM intentionally extends OpenCode by keeping `rename` — described as intentional enhancement
- Position-based ops: `path` + `position` (line/character)
- **Impacted docs**: `Plans/Tools.md` (reconcile `lsp` op set), `Plans/LSPSupport.md` (align exact `lsp` tool op surface), `Plans/Permissions_System.md`

### PART N: RECOVERED MCP CONTRACT (from w-20260316-160450)

#### Server Config Model (LOCKED)
- **Shared fields**: `enabled`, `timeout_ms`
- **Local server**: `type: "local"`, `command: string[]`, `environment?`
- **Remote server**: `type: "remote"`, `url`, `headers?`, `oauth?: object | false`

#### Runtime Status Model (LOCKED)
- **Auth state**: `authenticated`, `expired`, `not_authenticated`
- **Connection/effective state**: `connected`, `disabled`, `needs_auth`, `needs_client_registration`, `failed`

#### Supported MCP Flows (LOCKED)
- `auth` — authentication and credential management
- `list/status` — server discovery, capability listing, health check
- `logout` — credential clearing
- `debug` — diagnostic inspection of MCP server state

#### OAuth Rules (LOCKED)
- Remote MCP servers may use automatic OAuth
- Dynamic client registration supported when server supports it
- Pre-registered client credentials remain allowed
- `oauth: false` disables OAuth auto-detection for API-key/header-only servers

#### Credential Persistence (LOCKED)
- Persist tokens securely
- Bind stored credentials to the effective remote server URL
- If configured URL changes, previously stored credentials become invalid for that server binding
- Generated adapter config must stay derived/no-secrets

#### MCP Adapter Layer Contract (LOCKED)
- One canonical MCP config in PM storage
- Per-platform derived adapters/files only where required
- No secrets persisted into derived config files
- Requested vs effective MCP availability remains canonical
- Effective state depends on: enabled flag, auth state, server health, project context, policy/permission state

#### PM-Specific MCP Framing
- PM formalizes its own MCP contract (OpenCode MCP runtime is reference only)
- Requested vs effective disclosure applies to MCP just as to all other runtime identity

### PART O: RECOVERED RUNTIME IDENTITY MODEL (from w-20260316-160450)

#### Shared Provider/Runtime Identity (LOCKED)
- Shared across: Assistant, Interviewer, Requirements/PRD builders, Package Overseers, Seam Overseers, node workers
- Actor ontology MUST remain separate (conversational actors ≠ orchestration actors)
- **Requested vs effective MANDATORY** for all runtime concepts: inherited/overridden, requested, effective, honored/skipped/clamped

#### Canonical Persisted Field Names (LOCKED — HARD)
- `requested_persona` / `effective_persona` — NOT `requested_persona_id` / `effective_persona_id`
- `requested_platform` / `effective_platform`
- `requested_model` / `effective_model`
- `requested_auth_mode` / `effective_auth_mode`
- `requested_account_policy`
- `effective_account_id` / `effective_account_label`
- `effective_provider_identity`
- `effective_project_id`
- `account_switch_reason`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`

#### Multi-Account (LOCKED — first-class)
- Same-provider accounts are NOT interchangeable
- Switching is provider-aware, account-aware, role-aware
- Manual set-active is override/debug only, not primary model
- Usage/pressure/switching must plug into existing Usage model
- Account-selection fields: `requested_account_policy`, `requested_account_id?`, `requested_account_binding` (none | preferred | required), `effective_account_id?`, `account_switch_reason?`

#### Still-Absent Runtime Fields (from old ledger — NOT YET in canonical docs)
- `requested_account_id`
- `requested_account_binding` (none | preferred | required)
- `execution_role`
- `operational_identity`
- `projection_freshness` (current | refreshing | stale)
- `projection_health` (healthy | degraded | unavailable)
- **Recommendation**: if adopted, land these first in shared runtime contracts (`Contracts_V0.md`, `Prompt_Pipeline.md`, `Multi-Account.md`, `storage-plan.md`); do NOT let feature-specific docs invent shadow names

#### Immutable Provider Handoff Identity (LOCKED)
- Preserve immutable attempt identity: `run_id`, `thread_id`, `node_id`, `attempt_id`, snapshot IDs, safe point, remediation lineage
- Normalize provider-specific signals into canonical runtime classes BEFORE orchestration/UI use
- Do NOT invent hidden provider-local retry loops

#### Owner/Consumer Boundary (LOCKED — HARD RULE)
- Chat/assistant is CONSUMER, not owner of runtime identity
- **Chat MUST NOT re-own**:
  - Canonical requested/effective field list
  - Account-binding semantics
  - Provider/account selection precedence
  - Persona resolution precedence
  - Execution-role taxonomy
  - Operational-identity taxonomy
  - Projection freshness/health vocabulary
  - Blocked/retry/account-switch canonical semantics
  - Route/deep-link/open-by-identity contracts
  - Historical snapshot semantics
- **Chat MUST NOT invent assistant-local substitutes** such as:
  - `requested_persona_id` → use canonical `requested_persona`
  - `active_model` / `actual_model` → use canonical `effective_model`
  - `resolved_account` / `current_account` → use canonical account fields
  - `chat_role_identity` → use canonical `execution_role`
  - `assistant_runtime_state` → use canonical runtime snapshot
  - `projection_trust` → use canonical `projection_freshness` / `projection_health`

#### Safe Chat Ownership (LOCKED)
- Chat/assistant IS allowed to own:
  - How chat displays shared runtime identity
  - Where chat shows requested vs effective values
  - How chat routes to details/history/usage from that identity
  - Which views are compact vs expanded
  - Chat-specific UX copy around the shared model
- Chat MUST NOT own: the contract itself, the canonical field list, or the resolution semantics

#### Hard Display/History Rules (LOCKED)
1. Chat/thread concepts are NOT the canonical owner of runtime identity
2. Chat may persist chat-local context, but must consume shared runtime identity owned elsewhere
3. Historical chat/activity views must show frozen requested/effective runtime state captured for that execution
4. Do NOT recompute historical runtime state from current settings
5. Do NOT collapse distinct concepts into one status blob (keep: inherited/overridden, requested, effective, honored/skipped/clamped, current/stale/degraded/unavailable as separate dimensions)

#### Known Drift (MUST FIX)
- `Plans/Personas.md` §10.11B lists `requested_persona_id`/`effective_persona_id` — contradicts `Contracts_V0.md` canonical naming lock
- User explicitly locked that `_id` suffix variants must NOT become parallel canonical fields
- **Resolution**: reconciliation must fix `Personas.md` to use canonical names only

### PART P: RECOVERED LOGGING / AUDIT / ACTIVITY TRANSPARENCY (from w-20260316-160450)

#### Two Complementary Audit Surfaces (LOCKED — BOTH REQUIRED)
- **In-thread transparency**: concise, collapsible, user-facing
  - Per-message activity sections: bash/commands, web search, files explored, files changed, code diffs
  - Default-collapsed; lightweight thread audit entries
- **Dedicated log/audit surface**: richer search/filter/drill-down
  - Persisted log summaries + blobs
  - Output / Run Debug / event-log style surfaces
  - `logsearch`, `logread` tools exist for programmatic access
- Do NOT collapse into one surface; keep both for complementary purposes

#### Seglog Event Families (LOCKED)
Full event family list:
1. **Tool calls**: `tool.invoked`, `tool.denied`
2. **Usage/tokens**: token tracking per tool/turn
3. **Chat queue**: message queue events
4. **Plan/todo**: `chat.plan_todo_updated`
5. **Subagents**: `chat.subagent_*` family
6. **HITL/approval**: approval/ask flow events (once/session/always/deny with source/layer)
7. **Rollback**: state rollback events
8. **Persona/runtime snapshots**: effective runtime record snapshots
9. **Background runs**: long-running/watch-mode commands (same card model, NOT separate "background" card type)
10. **Permission snapshots**: immutable snapshots frozen at attempt start

#### Web-Operation Audit Payload (LOCKED)
Additive fields under `payload.meta` for all web tool invocations:
- `web_operation`: `search` | `extract` | `research` | `crawl` | `map` | `read`
- `web_input_preview`: truncated input for audit
- `support_tier`: `native` | `pm_composed` | `unsupported`
- `execution_path`: routing path taken
- `requested_adapter_id?`: what was requested
- `effective_adapter_id?`: what actually executed
- `adapter_selection_reason?`: why this adapter was chosen
- `provider_fallback_occurred`: boolean
- `provider_fallback_summary?`: fallback chain if triggered
- `source_count?`: number of sources returned
- Result-shape hints by operation: `query_preview` (search), `url` (fetch/extract), `content_format` (fetch), `task_preview` (research), etc.

#### Storage Split Guidance (LOCKED)
- **Inline in audit log**: previews, summaries, metadata, source counts
- **Ref/blob storage**: full extracted pages, source lists, crawl results, map data
- Large payloads store full data behind refs/blobs while audit entries show bounded previews

#### Activity Labels (LOCKED)
- `Searching Web: <query>`, `Reading Site: <url>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, `Mapping Site: <url>`
- Two explicit rows per operation (not generic audit-trail wording)

#### Provenance Badges (LOCKED)
- `search snippet`, `site extract`, `site reader`, `research synthesis`, `crawl result`, `map result`
- Let users judge source quality/depth at glance

#### Permission Snapshot (LOCKED)
- Finalize effective permission snapshot at attempt/run start; keep immutable for that attempt
- Historical runs show frozen permission snapshot, NOT current settings state
- Requested vs effective state disclosed when they differ

#### webfetch Audit (LOCKED)
- Each webfetch must emit audit entry: URL, status, bytes/truncation, whether used as source

### PART Q: RECOVERED EXTERNAL REFERENCE POLICY (from w-20260316-160450)

#### External References as Design Evidence (LOCKED — 6 RULES)
1. External references should be cited as non-normative inspiration/baseline evidence only
2. PM product vocabulary remains canonical
3. Avoid importing external names into canonical UX/contracts when PM-native term already exists
4. Canonical behavior must be restated in PM docs even when inspired by external system
5. Do NOT let reference repo's implementation stack dictate PM architecture
6. Do NOT copy external command names, product labels, or user-visible nouns where PM already has canonical language

#### PM-Native Terms (LOCKED)
- `Site Reader` NOT `Charlotte`
- `Searching Web` / `Reading Site` (activity labels)
- `visual module` / `visual card` (not plugin/widget)
- `Skills page` / `Skill Store` (not external skill-management concepts)
- `Agent Config` (top-level management surface)
- Source-canonical documents / preview-capable editor

#### OpenCode Reference Integration Summary (LOCKED)
- Bash/grep/glob tool surfaces — **ALIGNED** (baseline adopted)
- LSP surface ops — **RECONCILED** with PM-extended `rename`
- Skills/SKILL.md portability — **ADOPTED** default-import model
- Web search (websearch/webfetch) — **REFERENCE ONLY** (PM uses native Exa/Tavily/DDG/model-native providers)
- MCP runtime — **REFERENCE ONLY** (PM formalizes its own MCP contract)

#### Site Reader (Charlotte-Inspired) Implementation Contract (LOCKED)
- Native to PM, NOT MCP-based
- Default to structured/detail-level reading: `minimal` / `summary` / `full`
- Optimize for token efficiency first
- Support iframe-aware reading in the native rewrite
- Preserve clean separation between read/observe behavior and richer interaction/automation behavior
- Full browser interaction capability in v1 (not just passive structured reading)

#### External Ecosystem Findings (Design Evidence, Not Normative)
- **Swift-Agent-Skills / agent-skills ecosystem**: portable folder-based skills with `SKILL.md` plus optional resources — PATTERN ADOPTED; keep PM registry/discovery/runtime contract canonical
- **xeditor-monorepo**: source/editor/preview layering — REFERENCE ONLY; use as inspiration for preview-capable surfaces
- **Classic298/open-webui-plugins (inline visualizer reference)**: HTML/SVG fragment input (not full page), host-wrapped rendering, narrow bridge only, theme injection, auto-height — ALL ADOPTED for PM visual module

### PART R: FIRECRAWL-AS-PROVIDER INTEGRATION (FULL SPEC)

#### Provider Identity
- **Provider class**: Backend/API provider (same class as Exa, Tavily, DDG)
- **Provider ID**: `firecrawl`
- **Display name**: `Firecrawl`
- **Default priority**: below Exa, Tavily; above DDG (user-adjustable)
- **Default state**: disabled (requires API key or self-hosted URL)

#### Configuration Model
- `enabled: boolean` (default false)
- `api_key?: string` (required for cloud; stored in global user settings, NOT project-scoped)
- `base_url?: string` (default `https://api.firecrawl.dev`; user overrides for self-hosted)
- `timeout_ms?: number` (default 60000; applies to all Firecrawl operations)
- `proxy_mode?: "basic" | "stealth" | "enhanced" | "auto"` (default `"auto"`; cloud only)
- `cache_enabled?: boolean` (default true; uses Firecrawl's built-in cache)

#### Capability Matrix (Firecrawl Provider)

| PM Operation | Firecrawl Support | Firecrawl Endpoint | Tier | Notes |
|---|---|---|---|---|
| `search` | native | POST /v2/search | native | Uses Serper (Google); returns full page content not just snippets |
| `extract` | native | POST /v2/extract | native | LLM-powered; JSON Schema support; URL wildcards; enableWebSearch |
| `research` | native | POST /v2/agent | native | Autonomous Spark-1 agent; no URLs required; 20-2500 credits |
| `crawl` | native | POST /v2/crawl | native | Async job; includePaths/excludePaths; sitemap modes; dedup |
| `map` | native | POST /v2/map | native | Up to 100k URLs; search filter; dedup similar URLs |
| `fetch` | native | POST /v2/scrape | native | 12+ formats; actions; PDF modes; change tracking |

#### Firecrawl → PM Parameter Mapping

**websearch → Firecrawl /v2/search:**
- `query` → `query`
- `max_results` → `limit` (Firecrawl supports 1-100; PM default 8)
- `sources` → `sources` (Firecrawl supports `["web", "news", "images"]`)
- `categories` → `categories` (Firecrawl supports `["github", "research", "pdf"]`)
- `include_domains` → `scrapeOptions.includeTags` (partial; Firecrawl lacks direct domain filter on search)
- `exclude_domains` → not directly supported; PM filters post-search
- `time_range` → `tbs` (Firecrawl time-based search parameter)
- PM `scrapeOptions` defaults: `formats: ["markdown"]`, `onlyMainContent: true`

**webfetch → Firecrawl /v2/scrape:**
- `url` → `url`
- `formats` → `formats` (PM markdown → `[{type:"markdown"}]`; PM screenshot → `[{type:"screenshot"}]`; PM pdf → `parsers:[{type:"pdf"}]`)
- `actions` → `actions` (PM action subset maps to Firecrawl's 9 action types)
- `cache_ttl` → `maxAge` (Firecrawl uses ms; PM exposes seconds)
- `change_tracking` → `formats` includes `{type:"changeTracking"}`
- `timeout` → `timeout` (Firecrawl ms; PM seconds, convert)
- `detail_level` → `onlyMainContent` (PM minimal → true, PM full → false) + `onlyCleanContent`

**webextract → Firecrawl /v2/extract:**
- `url` → `urls: [url]` (Firecrawl accepts array, max 10; PM strict one-URL)
- `schema` → `schema` (JSON Schema; Firecrawl validates output against it)
- `detail_hint` → maps to `scrapeOptions` depth
- Firecrawl adds: `enableWebSearch`, `urlTrace`, `showSources`
- PM one-URL constraint means Firecrawl's multi-URL + wildcard capability is PM-composed only

**webresearch → Firecrawl /v2/agent:**
- `task` → `prompt`
- `max_sources` → `maxCredits` (approximate; Firecrawl credit-based not source-based)
- `depth_hint` → `model` selection (PM fast → `spark-1-mini`, PM deep → `spark-1-pro`)
- Firecrawl adds: `urls` (optional starting points), `schema` (structured output), `strictConstrainToURLs`
- **Cost warning**: Firecrawl agent is 20-2500 credits per call; PM should warn user and/or cap

**webcrawl → Firecrawl /v2/crawl:**
- `root_url` → `url`
- `max_pages` → `limit` (Firecrawl default 10000; PM default 25)
- `max_depth` → `maxDiscoveryDepth`
- `same_origin_only` → inverse of `allowExternalLinks` + `allowSubdomains`
- `change_tracking` → requires storing previous crawl state; Firecrawl doesn't natively diff crawls
- `dedup` → `deduplicateSimilarURLs` (Firecrawl default true)
- `filters` → `includePaths` + `excludePaths`
- Firecrawl adds: `sitemap` modes, `ignoreRobotsTxt`, `delay`, webhook

**webmap → Firecrawl /v2/map:**
- `root_url` → `url`
- `max_pages` → `limit` (Firecrawl default 5000; PM default 50)
- `max_depth` → via `includePaths`/`excludePaths` depth control
- `same_origin_only` → `allowExternalLinks`, `allowSubdomains`
- Firecrawl adds: `search` (filter results), `deduplicateSimilarURLs`, `sitemap` modes

#### Firecrawl Provider Routing Rules
- Firecrawl participates in standard capability-based routing algorithm (same 9-step process as other providers)
- Fallback TO Firecrawl: when higher-priority provider fails for same operation
- Fallback FROM Firecrawl: when Firecrawl fails, try next enabled provider for same operation
- Provider switch disclosed in chat + audit with `adapter_selection_reason`
- **Self-hosted limitation**: Fire Engine anti-bot NOT available; `proxy_mode` settings ignored for self-hosted
- **Credit awareness**: PM should track `creditsUsed` from Firecrawl responses; surface in Usage model when available

#### Firecrawl Error Handling
- HTTP 401/403 → `adapter_unavailable` (invalid/expired API key; recovery: open Authentication settings)
- HTTP 429 → `rate_limited` (recovery: fallback to next provider OR wait)
- HTTP 402 → `rate_limited` (credit exhausted; recovery: add credits or switch provider)
- HTTP 500/502/503 → `adapter_unavailable` (server error; recovery: retry or fallback)
- Timeout → `timeout` (recovery: retry with longer timeout or fallback)
- Firecrawl `success: false` → map `error` field to PM `error_message`; use PM error codes

#### Firecrawl-Specific Audit Fields
- `firecrawl_credits_used?: number` (from response `creditsUsed`)
- `firecrawl_cache_state?: "hit" | "miss"` (from response `metadata.cacheState`)
- `firecrawl_scrape_id?: string` (from response `scrape_id` for traceability)

### PART S: ENHANCED WEB TOOL CONTRACTS (FULL IMPLEMENTATION-READY SPEC)

These extend the existing locked contracts from w-20260316-160450 with Firecrawl-inspired capabilities. New parameters marked with ★. Existing locked parameters preserved exactly.

#### websearch — Enhanced Contract

**Input:**
- `query: string` (required)
- `max_results?: number` (default 8) [locked]
- `adapter_hint?: string` (optional) [locked]
- `include_domains?: string[]` (optional) [locked]
- `exclude_domains?: string[]` (optional) [locked]
- `time_range?: string` (optional) [locked]
- ★ `sources?: string[]` (default `["web"]`; options: `"web"`, `"news"`, `"images"`, `"code"`, `"academic"`)
- ★ `categories?: string[]` (optional; options: `"github"`, `"research"`, `"pdf"`)

**Behavior:**
- `sources` controls which content types to search. Provider must support requested source or PM returns `unsupported_operation` for that source
- `categories` is an additional filter applied post-search or during search if provider supports it
- When multiple sources requested, results are tagged with source type in output
- Provider capability determines which source/category combinations are native vs pm-composed vs unsupported:
  - Firecrawl: native for web/news/images sources + github/research/pdf categories
  - Exa: native for web; news/images/code/academic are pm-composed or unsupported
  - Tavily: native for web + news (via `topic: "news"`); others pm-composed
  - DDG: native-ish for web only
  - Anthropic/OpenAI: native for web only (model-native search)
- `search_provider` override is NOT exposed as tool parameter; provider routing handled by capability-based algorithm

**Output:** (extends locked common fields)
- `results: Array<{ title, url, snippet?, score?, source_type?: string }>`
- ★ `source_type` on each result indicates which source produced it (`"web"`, `"news"`, etc.)

**Error additions:**
- `unsupported_source` — requested source type not available from any enabled provider

#### webfetch — Enhanced Contract

**Input:**
- `url: string` (required) [locked]
- ★ `formats?: string[]` (default `["markdown"]`; options: `"markdown"`, `"html"`, `"rawHtml"`, `"screenshot"`, `"pdf"`, `"summary"`, `"links"`, `"images"`)
- ★ `actions?: Array<WebAction>` (optional; max 10 actions, max 30s total wait; see Research Action Model below)
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 14400, store: true }`)
- ★ `change_tracking?: boolean` (default false; when true, returns diff against previous fetch of same URL)
- ★ `pdf_mode?: "fast" | "auto" | "ocr"` (default `"auto"`; applies when URL serves PDF content)

**Behavior — formats:**
- `"markdown"` — default; HTML → Markdown conversion via Site Reader structured reading pipeline
- `"html"` — cleaned HTML (scripts/nav/ads stripped via Site Reader)
- `"rawHtml"` — unprocessed HTML as-is from server
- `"screenshot"` — full-page or viewport screenshot; returns base64 image artifact; uses browser runtime
- `"pdf"` — render page to PDF artifact; uses browser runtime
- `"summary"` — LLM-generated summary of page content (provider-dependent; Firecrawl native, others pm-composed)
- `"links"` — extract all links from page as `Array<{ url, text?, rel? }>`
- `"images"` — extract all images as `Array<{ url, alt?, dimensions? }>`
- Multiple formats can be requested simultaneously; each populated in output
- `screenshot` and `pdf` formats require browser runtime; if unavailable, return `capability_unavailable` warning (not error)

**Behavior — actions:**
- Actions execute BEFORE content extraction (navigate to final state, then capture)
- Action model is research-session subset (see Part T)
- Max 10 actions per webfetch (not 50 like Firecrawl; research context is lighter)
- Max 30s total wait across all actions
- If actions fail, webfetch still returns whatever content is available + warning
- Actions require `session_granted` permission tier (same as automation_session interaction actions)
- Permission prompt: "webfetch wants to interact with <url> (click, scroll, type). Allow?"

**Behavior — cache_policy:**
- `max_age_seconds`: if cached content exists and is younger than this, return cached version
- `store`: whether to cache this fetch result for future use
- Cache key: normalized URL + effective formats (excluding actions; actions always re-execute)
- Cache scope: per-project (not global; different projects may have different access/state)
- Cache storage: bounded; PM may evict oldest entries when capacity reached
- Cache hit/miss surfaced in audit: `cache_state: "hit" | "miss" | "bypassed"`

**Behavior — change_tracking:**
- Requires previous fetch of same URL to exist in cache/storage
- Returns `change_status: "new" | "same" | "changed" | "removed"` in output
- When `"changed"`, includes `diff_summary?: string` (concise description of what changed)
- Does NOT return full diff content inline (too large); provides `diff_ref?: string` pointer to full diff
- If no previous version exists, returns `change_status: "new"`
- Previous version compared is most recent cached version of same normalized URL

**Behavior — pdf_mode:**
- `"fast"` — text extraction only; no OCR
- `"auto"` — detect whether OCR needed; apply if text layer missing
- `"ocr"` — always apply OCR (for scanned documents)
- Applies when URL returns `Content-Type: application/pdf` OR when explicitly fetching with `formats: ["pdf"]`
- Provider-dependent: Firecrawl uses LlamaParse; PM native uses platform OCR or fallback text extraction

**Output:** (extends locked common fields)
- `content: string` (primary markdown/text content) [locked]
- `status?: number` (HTTP status) [locked]
- ★ `formats_returned: string[]` (which requested formats were successfully produced)
- ★ `screenshot?: { data_uri: string, width: number, height: number }` (when screenshot format requested)
- ★ `pdf_artifact?: { ref: string, page_count: number }` (when pdf format requested)
- ★ `summary?: string` (when summary format requested)
- ★ `links?: Array<{ url: string, text?: string }>` (when links format requested)
- ★ `images?: Array<{ url: string, alt?: string }>` (when images format requested)
- ★ `cache_state?: "hit" | "miss" | "bypassed"`
- ★ `change_status?: "new" | "same" | "changed" | "removed"` (when change_tracking true)
- ★ `change_summary?: string` (when changed; concise description)
- ★ `previous_fetch_at?: string` (ISO timestamp of previous cached version)
- ★ `action_results?: Array<{ action: string, status: "success" | "error", error?: string }>` (when actions used)

**Error additions:**
- `capability_unavailable` — screenshot/pdf requested but browser runtime not available (warning, not fatal)
- `no_previous_version` — change_tracking requested but no previous cached fetch exists (not error; returns change_status "new")

#### webextract — Enhanced Contract

**Input:**
- `url: string` (required; one URL only per invocation) [locked]
- `adapter_hint?: string` (optional) [locked]
- `detail_hint?: "fast" | "balanced" | "deep"` (optional) [locked]
- ★ `schema?: object` (JSON Schema defining expected output structure)
- ★ `schema_mode?: "strict" | "lenient"` (default `"lenient"`)
- ★ `actions?: Array<WebAction>` (optional; max 10 actions, max 30s; execute before extraction)
- ★ `prompt?: string` (optional; natural-language extraction guidance when schema alone insufficient; max 2000 chars)

**Behavior — schema:**
- When `schema` provided, extraction output is validated against it
- `"strict"` mode: output MUST conform to schema; non-conforming fields dropped; missing required fields → `extraction_schema_mismatch` error
- `"lenient"` mode (default): best-effort conformance; non-conforming fields included with `_schema_violation: true` annotation; missing required fields → warning, not error
- Schema supports: JSON Schema draft-07 features including `$ref`, `oneOf`, `anyOf`, `enum`, `required`, nested objects/arrays
- Schema does NOT support: `$id` referencing external schemas (security); schemas larger than 50KB (complexity cap)
- Provider handling:
  - Firecrawl: passes schema directly to /v2/extract (native support)
  - Tavily: no native schema; PM post-processes Tavily extract output against schema
  - Exa: no native schema; PM post-processes
  - Model-native: PM-composed extraction with schema in prompt
- When no schema provided, behavior unchanged from locked contract (free-form extraction)

**Behavior — actions:**
- Same model as webfetch actions: execute before extraction, same permission tier
- Use case: click "Show more", expand collapsed sections, dismiss overlays, navigate to content before extracting

**Behavior — prompt:**
- Natural-language guidance for extraction (e.g., "Extract all product prices and names from this page")
- Complements schema; prompt describes WHAT to extract, schema describes WHAT SHAPE to return
- When both prompt + schema: prompt guides the extraction, schema validates the output
- When prompt only (no schema): free-form extraction guided by prompt; output shape determined by provider/LLM

**Output:** (extends locked common fields)
- `content_ref?: string` [locked]
- `content_preview?: string` [locked]
- `content_format?: "text" | "markdown" | "structured"` [locked]
- ★ `extracted_data?: object` (when schema provided; structured extraction result)
- ★ `schema_conformance?: "full" | "partial" | "none"` (when schema provided)
- ★ `schema_violations?: Array<{ path: string, message: string }>` (when lenient mode + violations found)
- ★ `action_results?: Array<{ action: string, status: "success" | "error", error?: string }>` (when actions used)

**Error additions:**
- `extraction_schema_mismatch` — strict mode; output doesn't conform to required schema fields
- `schema_too_large` — schema exceeds 50KB limit
- `schema_invalid` — schema is not valid JSON Schema draft-07

#### webresearch — Enhanced Contract

**Input:**
- `task: string` (required) [locked]
- `max_sources?: number` (default 6) [locked]
- `adapter_hint?: string` (optional) [locked]
- `depth_hint?: "fast" | "balanced" | "deep"` (optional) [locked]
- ★ `autonomous?: boolean` (default false)
- ★ `auto_read_cap?: number` (default 4; max pages to read before synthesizing) [value locked, param new]
- ★ `schema?: object` (JSON Schema for structured research output)
- ★ `starting_urls?: string[]` (optional; seed URLs to begin research from; max 5)

**Behavior — autonomous mode:**
- When `autonomous: false` (default): PM-composed research recipe:
  1. Search using highest-priority provider
  2. Select top candidate URLs (up to `max_sources`)
  3. Read/extract up to `auto_read_cap` pages via Site Reader
  4. Synthesize answer with citations from read content
  - This is deterministic and bounded; agent does NOT navigate or interact with pages
- When `autonomous: true`: provider-native autonomous research if available, else enhanced PM-composed:
  - **Firecrawl provider**: delegates to /v2/agent endpoint (Spark-1 model autonomously searches, navigates, extracts)
  - **Tavily provider**: delegates to Tavily's advanced search + extract chain
  - **Other providers**: PM-composed enhanced recipe:
    1. Search → select candidates
    2. Read top pages via Site Reader
    3. If insufficient, search again with refined queries based on what was found
    4. Read additional pages
    5. Repeat up to `max_sources` total reads or 3 search iterations (whichever first)
    6. Synthesize with citations
  - Autonomous mode may use browser actions (research-session tier) if Site Reader fails on a page
  - Autonomous research is bounded: max 3 search iterations, max `max_sources` page reads, max 120s total
  - Each step surfaces in activity transparency: `Searching Web: <refined query>`, `Reading Site: <url>`

**Behavior — schema:**
- Same semantics as webextract schema but applied to final research synthesis output
- Useful for structured research: "find all competitors with {name, url, pricing_model, features[]}"

**Behavior — starting_urls:**
- Seeds the research with known URLs instead of starting from search
- PM reads these URLs first, then searches for additional sources if needed
- Useful when user already has context (e.g., "research this topic starting from these docs")

**Output:** (extends locked common fields)
- `answer_summary?: string` [locked]
- `evidence_refs?: string[]` [locked]
- `sources_used_count?: number` [locked]
- ★ `research_steps?: Array<{ step: "search" | "read" | "refine", detail: string, timestamp: string }>` (when autonomous; trace of research process)
- ★ `extracted_data?: object` (when schema provided)
- ★ `iterations_used?: number` (when autonomous; how many search-read cycles)

**Error additions:**
- `autonomous_budget_exceeded` — autonomous research hit iteration/time/credit cap without satisfactory result
- `autonomous_unavailable` — autonomous mode requested but no provider supports it and PM-composed enhanced recipe also failed

#### webcrawl — Enhanced Contract

**Input:**
- `root_url: string` (required) [locked]
- `max_pages?: number` (default 25) [locked]
- `max_depth?: number` (default 2) [locked]
- `same_origin_only?: boolean` (default true) [locked]
- `adapter_hint?: string` (optional) [locked]
- ★ `change_tracking?: boolean` (default false)
- ★ `dedup?: boolean` (default true; deduplicate similar pages)
- ★ `include_paths?: string[]` (URL path patterns to include; glob-style)
- ★ `exclude_paths?: string[]` (URL path patterns to exclude; glob-style)
- ★ `respect_robots?: boolean` (default true)
- ★ `formats?: string[]` (default `["markdown"]`; applied to each crawled page; same options as webfetch)

**Behavior — change_tracking:**
- Requires previous crawl of same root_url to exist in storage
- Per-page change detection: each crawled page compared to its previous version
- Output includes per-page `change_status` field
- New pages (not in previous crawl) marked `"new"`; removed pages (in previous but not current) marked `"removed"`
- Storage of previous crawl state is bounded: PM stores page hashes + metadata, not full content of previous crawl
- `change_summary` in output: count of new/changed/removed/same pages

**Behavior — dedup:**
- When true, skip pages whose content hash matches already-crawled page in same crawl run
- Reduces noise from pages with identical content at different URLs (common in CMS/docs sites)
- Provider-dependent: Firecrawl has `deduplicateSimilarURLs` natively; others PM-composed via content hashing

**Behavior — include/exclude_paths:**
- Glob-style path matching: `"/docs/*"`, `"/api/**"`, `"!/internal/*"`
- Applied to URL path component only (not query string or fragment)
- `include_paths` is allowlist (only crawl matching paths); `exclude_paths` is denylist
- When both specified: include first, then exclude

**Output:** (extends locked common fields)
- `pages_visited_count?: number` [locked]
- `pages_returned_count?: number` [locked]
- `scope_summary?: string` [locked]
- ★ `pages: Array<{ url: string, title?: string, content_ref?: string, change_status?: string }>`
- ★ `change_summary?: { new: number, changed: number, same: number, removed: number }` (when change_tracking)
- ★ `dedup_skipped?: number` (pages skipped due to deduplication)

#### webmap — Enhanced Contract

**Input:**
- `root_url: string` (required) [locked]
- `max_pages?: number` (default 50) [locked]
- `max_depth?: number` (default 3) [locked]
- `same_origin_only?: boolean` (default true) [locked]
- `adapter_hint?: string` (optional) [locked]
- ★ `include_paths?: string[]` (glob-style path filters)
- ★ `exclude_paths?: string[]` (glob-style path filters)
- ★ `search?: string` (filter discovered URLs by search term)
- ★ `use_sitemap?: "include" | "only" | "skip"` (default `"include"`)

**Behavior — use_sitemap:**
- `"include"` — discover URLs from both sitemap.xml AND link traversal
- `"only"` — only use sitemap.xml, no link traversal (fast)
- `"skip"` — ignore sitemap.xml, only link traversal

**Behavior — search:**
- Filter discovered URLs by search term match in URL path or page title
- Useful for narrowing large site maps: "find all API reference pages"

**Output:** (extends locked common fields)
- `nodes_count?: number` [locked]
- `edges_count?: number` [locked]
- `scope_summary?: string` [locked]
- `map_ref?: string` [locked]
- ★ `links: Array<{ url: string, title?: string, description?: string }>` (discovered URLs with metadata)
- ★ `sitemap_used?: boolean` (whether sitemap.xml was found and used)

### PART T: RESEARCH SESSION VARIANT (FULL SPEC)

#### Session Class Definition

```
research_session:
  canonical_purpose: "lightweight agent-driven browser interaction for 
                     web research, content access, and page navigation
                     when static fetch/Site Reader is insufficient"
  canonical_entry_points: "web tool escalation (webfetch/webextract 
                          actions parameter), explicit agent request,
                          autonomous webresearch browser fallback"
  profile_scope: "separate ephemeral profile by default (same as 
                 automation_session)"
  restore_policy: "never silently resumes; returns stopped/attention-
                  required on reopen (same as automation_session)"
```

#### Relationship to automation_session
- research_session is a **restricted subset** of automation_session, NOT a separate implementation
- Uses same browser runtime, same CDP/Playwright infrastructure, same PM browser surface
- Differs in: allowed action set, permission defaults, lifecycle expectations, entry points
- An agent that starts with research_session actions can escalate to full automation_session if lightweight actions fail (user-confirmed escalation)

#### Research Action Set (15 actions in 3 tiers)

**Tier 1: always_allowed (7 actions — read-only observation)**

| Action | From automation_session | Purpose in Research |
|---|---|---|
| `navigate` | ✓ (line 652) | Navigate to URL for reading |
| `back` | ✓ (line 653) | Return to previous page |
| `reload` | ✓ (line 654) | Refresh stale page |
| `snapshot` | ✓ (line 671) | Capture structured page state for extraction |
| `screenshot` | ✓ (line 672) | Visual evidence of page state |
| `console` | ✓ (line 673) | Debug page errors preventing content access |
| `network` | ✓ (line 674) | Debug failed requests preventing content |

**Tier 2: session_granted (6 actions — interaction for content access)**

| Action | From automation_session | Purpose in Research |
|---|---|---|
| `click` | ✓ (line 658) | Expand collapsed content, dismiss overlays, navigate links, accept cookies |
| `scroll` | maps to `drag`/viewport (line 663) | Scroll to load lazy content, reveal below-fold content |
| `type` | ✓ (line 659) | Fill search boxes on target sites, login forms |
| `press_key` | ✓ (line 664) | Enter key after typing, Escape to close modals |
| `wait_for` | ✓ (line 667) | Wait for dynamic content to load after interaction |
| `set_viewport` | ✓ (line 675) | Switch viewport for responsive content access |

**Tier 3: ask/deny (2 actions — write/submit operations)**

| Action | From automation_session | Purpose in Research |
|---|---|---|
| `fill_form` | ✓ (line 660) | Submit search/filter forms on target sites |
| `select_option` | ✓ (line 661) | Select dropdown values for filtered content |

**NOT included in research_session (23 actions excluded):**
- Tab management (open_tab, select_tab, close_tab) — research is single-page focused
- hover, drag — not needed for content access
- upload_file — research doesn't upload
- handle_dialog — research shouldn't trigger dialogs
- All verify_* actions — testing only
- All trace/video actions — testing evidence only
- export_pdf — use webfetch `formats: ["pdf"]` instead
- All storage/cookie actions — research doesn't mutate site state
- All network simulation actions — testing only
- generate_locator — testing tooling only

#### Research Session Lifecycle
1. **Creation**: Implicitly created when webfetch/webextract uses `actions` parameter, or when autonomous webresearch needs browser fallback
2. **Active**: Agent executes research actions (navigate, click, scroll, wait, then snapshot/screenshot for content)
3. **Content captured**: Once content obtained, session is available for reuse within same tool invocation
4. **Teardown**: Ephemeral profile destroyed after tool invocation completes (no persistence across tool calls)
5. **No takeover/promotion**: Unlike automation_session, research_session has no user-takeover or promote-to-browsing flow (it's transient)

#### Escalation to Full automation_session
- When research actions are insufficient (e.g., site requires complex multi-step interaction, authentication, or testing-tier actions)
- Agent requests escalation; PM presents approval: "This site requires full browser automation. Allow automation_session? [Once / For Session / Deny]"
- If approved, current research_session upgrades to automation_session with full 40-action set
- Escalation disclosed in activity transparency: `Escalated to full browser automation for <url>`
- Permission recorded for audit

#### Research Session Permission Model
- Research_session permission is gated by the parent web tool's permission (e.g., `webfetch` permission covers actions within webfetch)
- Tier 1 (always_allowed) actions: no additional permission prompt
- Tier 2 (session_granted) actions: covered by parent tool's "For Session" approval on that host
- Tier 3 (ask/deny) actions: require separate per-action or per-session confirmation
- Escalation to automation_session: always requires explicit confirmation

#### Research Session Evidence & Audit
- `snapshot` and `screenshot` results are included in parent tool's output (webfetch/webextract result)
- Research session actions are logged in audit as child events of parent tool invocation
- Activity transparency shows: `Reading Site: <url> (with browser interaction)` — distinct from plain `Reading Site: <url>`

### PART U: PROVIDER CAPABILITY MATRIX (COMPLETE)

Full per-operation × per-provider capability table with Firecrawl included.

| Operation | Exa | Tavily | Firecrawl | Anthropic | OpenAI | DDG | Google |
|---|---|---|---|---|---|---|---|
| `search` | native | native | native | native (model) | native (model) | native-ish | native |
| `extract` | near-native | native | native | pm-composed | pm-composed | pm-composed | pm-composed |
| `research` | near-native | native | native (agent) | pm-composed | pm-composed | pm-composed | pm-composed |
| `crawl` | native | native | native | pm-composed | pm-composed | partial | pm-composed |
| `map` | unsupported | native | native | pm-composed | pm-composed | unsupported | pm-composed |
| `fetch` | via crawl | via extract | native (scrape) | pm-composed | pm-composed | pm-composed | pm-composed |

**Tier definitions:**
- **native**: Provider offers this operation directly via its API
- **near-native**: Provider has close equivalent (e.g., Exa content retrieval ≈ extract)
- **native (model)**: Model's built-in web search capability
- **native (agent)**: Provider's autonomous agent endpoint
- **pm-composed**: PM synthesizes from lower-level primitives (search → read → synthesize)
- **partial**: Limited native support (e.g., DDG search_and_crawl)
- **unsupported**: Cannot be offered for this provider

**Default Provider Priority Order:**
1. Exa (primary; free tier, no key required)
2. Tavily (optional premium; requires API key)
3. Firecrawl (optional; requires API key or self-hosted URL)
4. Anthropic/OpenAI (model-native; available when model supports)
5. Google (optional; requires adapter configuration)
6. DuckDuckGo (fallback; no key, best-effort quality)

**User can reorder providers in Settings. Per-operation override is NOT MVP (global order only).**

### PART V: BATCH OPERATIONS (FULL SPEC)

#### Overview
Batch operations allow multiple URLs to be processed in a single tool invocation. Inspired by Firecrawl's /v2/batch/scrape endpoint. Applies to webfetch and webextract.

#### Batch webfetch Contract

**Input:**
- `urls: string[]` (required; min 1, max 50)
- `formats?: string[]` (same as single webfetch; applied to ALL URLs)
- `cache_policy?: object` (same as single; applied to ALL URLs)
- `change_tracking?: boolean` (same as single; applied to ALL URLs)
- `pdf_mode?: string` (same as single; applied to ALL URLs)
- `concurrency?: number` (default 3; max 10; how many URLs fetched simultaneously)
- `continue_on_error?: boolean` (default true; if false, stop batch on first failure)
- `adapter_hint?: string` (optional; same as single)

**NOT included in batch:** `actions` — actions are per-page interactive; batch is for bulk static content

**Behavior:**
- URLs processed in parallel up to `concurrency` limit
- Each URL processed independently via same webfetch pipeline (routing, permission, audit)
- Permission: single "Allow batch webfetch of N URLs?" prompt (not per-URL)
- Progress: activity transparency shows `Fetching sites: 5/20 complete`
- Cache: each URL cached independently (same cache semantics as single webfetch)
- Timeout: per-URL timeout same as single webfetch; batch-level timeout = individual × 3 (capped at 300s)

**Partial failure handling:**
- `continue_on_error: true` (default): failed URLs included in results with error info; batch continues
- `continue_on_error: false`: batch stops at first failure; completed results returned + failure detail
- Each URL result carries individual `success` boolean and error info if failed
- Batch succeeds if at least one URL succeeded

**Output:**
```
{
  success: boolean,                    // true if at least one URL succeeded
  results: Array<{
    url: string,
    success: boolean,
    content?: string,                  // same as single webfetch output
    formats_returned?: string[],
    screenshot?: object,
    cache_state?: string,
    change_status?: string,
    error_code?: string,               // if this URL failed
    error_message?: string
  }>,
  summary: {
    total: number,
    succeeded: number,
    failed: number,
    cached: number
  },
  // common fields (web_operation, support_tier, etc.)
}
```

**Audit:** One parent audit event for batch + child events per URL.

#### Batch webextract Contract

**Input:**
- `urls: string[]` (required; min 1, max 10)
- `schema?: object` (same as single; applied to ALL URLs)
- `schema_mode?: string` (same as single)
- `detail_hint?: string` (same as single)
- `prompt?: string` (same as single; applied to ALL URLs)
- `concurrency?: number` (default 3; max 5)
- `continue_on_error?: boolean` (default true)
- `adapter_hint?: string` (optional)

**NOT included in batch:** `actions` — same rationale as webfetch

**Behavior:** Same concurrency/failure/progress model as batch webfetch.

**Output:** Same structure as batch webfetch but with extraction-specific fields per URL.

**Provider support:**
- Firecrawl: /v2/extract natively accepts up to 10 URLs; direct delegation
- Tavily: PM-composed; sequential or parallel single extractions
- Exa: PM-composed
- Others: PM-composed

### PART W: WEB CONTENT CACHING LAYER (FULL SPEC)

#### Overview
Shared caching layer used by webfetch, webextract, webcrawl, and webmap. Reduces redundant fetches, enables change detection, and improves agent responsiveness.

#### Cache Architecture
- Cache is per-project (not global; respects project isolation)
- Storage: bounded in-memory + disk overflow (max 100MB per project, configurable in settings)
- Cache entries keyed by: `(normalized_url, formats_hash, adapter_id)` — same URL fetched with different formats or different providers = different cache entries
- Actions are NOT included in cache key (actions may change page state; always re-executed)

#### Cache Entry Shape
```
{
  cache_key: string,                    // hash of (url, formats, adapter_id)
  url: string,                          // normalized URL
  formats_requested: string[],          // what formats were cached
  adapter_id: string,                   // which provider produced this
  content_hash: string,                 // hash of content for change detection
  content_ref: string,                  // pointer to cached content (not inline)
  metadata: {
    title?: string,
    status_code?: number,
    content_type?: string,
    content_length?: number
  },
  fetched_at: string,                   // ISO timestamp
  expires_at: string,                   // fetched_at + TTL
  access_count: number,                 // how many times accessed
  last_accessed_at: string              // for LRU eviction
}
```

#### TTL Defaults Per Operation
| Operation | Default TTL | Rationale |
|---|---|---|
| `webfetch` | 4 hours (14400s) | Page content changes moderately |
| `webextract` | 4 hours (14400s) | Same as fetch; extraction from same content |
| `webcrawl` | 24 hours (86400s) | Crawls are expensive; site structure changes slowly |
| `webmap` | 24 hours (86400s) | Site maps change slowly |
| `websearch` | 1 hour (3600s) | Search results change frequently |
| `webresearch` | Not cached | Research synthesis is task-specific; not reusable |

#### Invalidation Rules
- **TTL expiry**: entry removed from active cache after TTL (but retained for change detection)
- **Manual invalidation**: user can clear cache for URL, domain, or entire project via settings
- **Change detection retention**: even after TTL, previous content hash + metadata kept for change_tracking (retained 7 days or until storage pressure)
- **LRU eviction**: when cache capacity reached, least-recently-accessed entries evicted first
- **No cross-project cache sharing**: project A's cache never serves project B

#### Interaction with Change Detection
- When `change_tracking: true` and cached entry exists (even expired):
  - Fetch fresh content
  - Compare content_hash of fresh vs cached
  - If different: `change_status: "changed"`, compute diff_summary
  - If same: `change_status: "same"`, return cached (extend TTL)
  - If previous entry was present but URL now 404: `change_status: "removed"`
- If no previous entry exists at all: `change_status: "new"`

#### Cache in Audit
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`
- Cache hits do NOT generate provider API calls (no credits used)
- Cache bypass: when `cache_policy.max_age_seconds: 0` or `cache_policy.store: false`

### PART X: ROUTING ALGORITHM (IMPLEMENTATION-READY, WITH FIRECRAWL)

Updated 9-step routing algorithm incorporating Firecrawl as a provider.

```
Step 1: NORMALIZE OPERATION
  - Map tool invocation to canonical operation: search|extract|research|crawl|map|fetch
  - Validate input parameters against tool contract
  - Reject invalid inputs with `invalid_input` error

Step 2: RESOLVE RUNTIME MODE
  - Check current run mode (ask|plan|regular|yolo)
  - Check web tool permissions for current mode
  - ⚠ CURRENT BUG: plan mode auto-denies web tools (MUST BE FIXED)
  - If denied by mode: return `permission_denied` with reason

Step 3: RESOLVE PERMISSION
  - Check tool permission key (e.g., `tools.webfetch`)
  - Default: `ask` for all 6 web tools
  - If permission = deny: return `permission_denied`
  - If permission = ask: present approval prompt to user
  - If user declines: return `user_declined`
  - Approval scope:
    - websearch/webresearch: `*` wildcard (any search term)
    - webfetch/webextract: host-scoped (approve for specific domain)
    - webcrawl/webmap: host-scoped + depth-scoped

Step 4: CHECK CACHE (new step for Firecrawl integration)
  - If cache enabled and entry exists within TTL:
    - Return cached result with `cache_state: "hit"`
    - Skip Steps 5-8 entirely
  - If change_tracking and expired entry exists:
    - Mark for diff comparison after fresh fetch
    - Continue to Step 5

Step 5: QUERY CAPABILITY MATRIX
  - For each enabled provider (in priority order):
    - Check if provider supports this operation (native/near-native/pm-composed/unsupported)
    - Check if provider supports requested parameters (e.g., schema → only Firecrawl/Tavily natively)
    - Filter out `unsupported` providers for this operation
  - Result: ordered list of eligible providers

Step 6: FILTER BY AVAILABILITY
  - Remove providers that are:
    - Not configured (missing API key, URL, etc.)
    - Currently rate-limited (known recent 429)
    - Temporarily unavailable (known recent 5xx)
  - If no providers remain: return `no_eligible_adapter`

Step 7: SELECT PROVIDER
  - Choose highest-priority remaining provider
  - If provider supports operation natively: use native endpoint
  - If provider is pm-composed for this operation: use PM recipe
  - Record `adapter_selection_reason` for audit

Step 8: EXECUTE & FALLBACK
  - Execute request against selected provider
  - If provider fails:
    - Try next eligible provider from Step 5 list
    - Record fallback in `provider_fallback_occurred`, `provider_fallback_summary`
    - Repeat until success or all providers exhausted
  - If all providers fail: return `adapter_unavailable` with summary of failures

Step 9: RENDER & PERSIST
  - Format result according to tool output contract
  - Compute change_tracking diff if applicable
  - Store in cache if cache_policy.store is true
  - Record audit event with all routing metadata
  - Render activity label in chat:
    - Search: `Searching Web: <query>`
    - Fetch: `Reading Site: <url>`
    - Extract: `Extracting from: <url>`
    - Research: `Researching: <task summary>`
    - Crawl: `Crawling: <root_url>`
    - Map: `Mapping: <root_url>`
  - Return result to agent/tool caller
```

#### Firecrawl-Specific Routing Notes
- Firecrawl's `search` uses Serper (Google) — fundamentally keyword-based, unlike Exa (semantic)
- When Exa is primary and user wants keyword search specifically, `adapter_hint: "firecrawl"` or `adapter_hint: "google"` overrides
- Firecrawl's `agent` endpoint (for webresearch autonomous) has credit cost 20-2500; PM should warn before delegating
- Firecrawl self-hosted: Fire Engine anti-bot not available; some sites may fail that work on cloud
- PM must NOT silently switch from self-hosted Firecrawl to cloud Firecrawl (different billing, different capabilities)

## Gaps / Problems Identified

### FIRECRAWL INTEGRATION GAPS (all MVP per user)

1. **Schema-Based Structured Extraction** (HIGH) — webextract has no schema definition/validation
2. **Multi-Source Search Categories** (MEDIUM) — websearch is web-only via Exa; no news/image/code/academic
3. **Change Detection / Monitoring** (MEDIUM) — no equivalent designed for webfetch/webcrawl
4. **Autonomous Research Agent** (MEDIUM-HIGH) — webresearch has no autonomous navigation/form-filling
5. **Interactive Browser Actions for Research** (MEDIUM) — automation_session designed for testing, not research
6. **Batch Operations** (LOW-MEDIUM) — no explicit batch scrape of arbitrary URL lists
7. **Output Format Flexibility** (LOW-MEDIUM) — webfetch focused on markdown; no screenshot/PDF/summary
8. **PDF Handling** (LOW-MEDIUM) — web tools don't address PDF extraction
9. **Webhook/Streaming for Long-Running Ops** (LOW) — async model not detailed
10. **Anti-Bot / Stealth** (LOW) — not addressed; less critical for IDE context
11. **Caching with TTL** (LOW-MEDIUM) — no web content caching in planning docs

### CANONICAL DOC GAPS (from cross-reference audit)

12. **§8.2.1 ENTIRELY MISSING** — cited web search section referenced in newtools.md TOC (line 72) but never written
13. **"Reading Site" undefined as tool** — mentioned as activity label but never defined as tool
14. **No provider capability matrix** — hybrid provider model (Exa/Tavily/DDG/Google/model-native) exists in old ledger but zero canonical doc coverage
15. **No /web UI spec** — /web slash command family has no UI/UX specification in FinalGUISpec.md
16. **Plan mode permission contradiction** — Permissions_System.md auto-denies web tools in ask/plan modes, contradicting PM's web-research-first-class direction
17. **Slash-command SSOT drift** — three incompatible slash-command lists across assistant-chat-design.md, FinalGUISpec.md, UI_Command_Catalog.md
18. **Commands override policy conflict** — assistant-chat-design.md says no override; Commands_System.md allows override_builtin: true
19. **Personas.md field-name drift** — `requested_persona_id`/`effective_persona_id` conflicts with Contracts_V0.md canonical naming
20. **No provider settings GUI** — no specification for provider management UI

### MASSIVE LOST-SPEC GAPS (from w-20260316-160450 recovery)

These are entire topic areas with locked decisions that exist ONLY in the old ledger and are ABSENT from canonical docs:

21. **Terminal/command card specs** — entire inline operation card family with defaults, anatomy, behaviors, promotion rules
22. **Chat message controls** — stop/edit/resend behavior, scroll/auto-follow, copy behavior, message row action model
23. **Plan vs Deep Plan distinction** — behavioral difference, intensity, todo schema, auto-use heuristic
24. **TODO item schema** — normalized fields, state model, plan panel, inline progress, tool contract
25. **Shared question-card system** — question UI, multi-question flows, question card schema, tool contract
26. **Inline visualizer / Mermaid specs** — visualizer architecture, persistence, sandboxing, bridges
27. **Individual slash command reconciliation** — canonical built-in set, override policy, /web family, /skill helper
28. **Skills system details** — catalog, import UX, source/readiness model, Skill Store boundary, tool runtime contract
29. **Agent Config information architecture** — rename from "Skills page", tab model, boundary rules
30. **Subagent behavior defaults** — aggressive-by-default, task tool contract, inheritance rules
31. **LSP tool operation set** — canonical read-only + write ops, rename as intentional PM extension
32. **MCP runtime/auth/config contract** — server config model, runtime status model, OAuth rules
33. **Shared runtime identity model** — requested/effective, owner/consumer boundary, multi-account
34. **Logging/audit surfaces** — dual-surface model, activity labels, provenance badges, permission snapshots
35. **External reference policy** — design-evidence rules, PM-native terminology
36. **Permission preset reconciliation** — expanded presets, approval ladder, blocked-action recovery
37. **Approval ladder expansion** — from 3-option to 4-option (once/session/always/deny)
38. **Web tool permission semantics** — per-operation scope rules, host/domain patterns

### CRITICAL CONTRADICTIONS FOUND

| ID | Severity | Location | Issue |
|----|----------|----------|-------|
| C1 | CRITICAL | Permissions_System.md | Plan mode auto-denies web tools — contradicts product direction |
| C2 | CRITICAL | assistant-chat-design.md / FinalGUISpec.md / UI_Command_Catalog.md | Three incompatible slash-command lists |
| C3 | CRITICAL | assistant-chat-design.md / Commands_System.md | Override policy conflict for reserved built-ins |
| C4 | HIGH | Personas.md / Contracts_V0.md | Field naming conflict (requested_persona_id vs requested_persona) |
| C5 | HIGH | Tools.md | Tools SSOT lags web model — only websearch + webfetch fully defined |
| C6 | HIGH | Permissions_System.md | Preset narrowness — missing skill/lsp/question/todo/web tools |
| C7 | HIGH | Non-persona runtime | Missing fields: requested_account_id, requested_account_binding, execution_role, operational_identity, projection_freshness, projection_health |

## Candidate Fixes / Design Directions

### Web Tool Enhancements (Firecrawl-inspired, all MVP)
- A. Add JSON Schema parameter to webextract (+ optional on webfetch)
- B. Add `sources`/`categories` params to websearch for multi-source routing
- C. Add change detection to webfetch/webcrawl (diff status on re-fetch)
- D. Create research session variant of automation_session (15-action subset, 3-tier permissions)
- E. Expand webresearch scope to include autonomous search-navigate-extract chain
- F. Add batch web operations (parallel multi-URL webfetch/webextract)
- G. Add screenshot/PDF/summary format options to webfetch
- H. Add web content caching layer with configurable TTL
- I. Add Firecrawl as lower-priority provider in capability routing matrix

### Canonical Doc Fixes (reconciliation required)
- J. Write missing §8.2.1 in newtools.md
- K. Build provider capability matrix (per operation × provider → native/pm-composed/unsupported)
- L. Reconcile slash-command SSOT into single canonical set
- M. Fix plan-mode permission contradiction (remove web tools from blanket deny)
- N. Expand permission presets to include skill/lsp/question/todo/web tools
- O. Add approval ladder `always` option with project/global scope
- P. Add blocked-action recovery paths to approval UI

### Lost-Spec Recovery (MASSIVE — 30+ topic areas)
- Q. Write terminal/inline operation card specs into FinalGUISpec.md
- R. Write chat message controls (stop/edit/resend, scroll, copy) into FinalGUISpec.md + assistant-chat-design.md
- S. Write Plan/Deep Plan distinction and TODO schema into assistant-chat-design.md
- T. Write shared question-card system into FinalGUISpec.md + Tools.md + assistant-chat-design.md
- U. Write inline visualizer/Mermaid specs into FinalGUISpec.md + assistant-chat-design.md
- V. Write Skills/Agent Config IA into FinalGUISpec.md + Skills_System.md
- W. Write subagent behavior defaults into assistant-chat-design.md
- X. Write LSP tool operation set into Tools.md + LSPSupport.md
- Y. Write MCP runtime/auth/config contract into Tools.md
- Z. Write runtime identity owner/consumer boundary into assistant-chat-design.md + Contracts_V0.md
- AA. Write logging/audit dual-surface model into FinalGUISpec.md + assistant-chat-design.md
- BB. Write web tool permission semantics into Permissions_System.md
- CC. Fix Personas.md field naming drift (requested_persona_id → requested_persona)
- DD. Fix Commands_System.md override policy for reserved built-ins
- EE. Write external reference policy into relevant docs

## Impacted Docs

### PRIMARY OWNERS (major content writes required)
- `Plans/Tools.md` — Web tool family expansion, schema support, parameter extensions, canonical tool contracts (question, todowrite, todoread, web*, skill, task, lsp), provider capability matrix
  - Expand `question` to `single_question` / `questionnaire` modes with structured input/output
  - Expand `todowrite` / `todoread` to normalized TODO schema
  - Expand `lsp` to full 10-operation read-only set + approval-gated `rename`
  - Add `webextract`, `webresearch`, `webcrawl`, `webmap` as new operations
  - Expand `skill` to include richer metadata (source_type, resource_base_dir, resource_entries_sample)
  - Expand `task` to resumable delegated-run contract with task_id, runtime_snapshot
- `Plans/assistant-chat-design.md` — Chat modes/controls, activity transparency, shared question flow, Plan/Deep Plan, TODO behavior, /web family, /skill, terminal handoff, subagent defaults, runtime display rules, runtime identity consumption rules
- `Plans/FinalGUISpec.md` — Chat widgets (terminal/search/diff cards anatomy), sticky plan panel as live TODO tracker, question forms using canonical questionnaire model, Agent Config IA with Skills tab, activity-card rendering (5/15 collapsed/expanded, 50-line caps), Stop/Edit/Resend controls, copy icons (always visible), jump-to-latest badge, inline visualizer
- `Plans/Permissions_System.md` — CRITICAL FIXES:
  - Add `question` to permission-key table (default allow)
  - Add `webextract`, `webresearch`, `webcrawl`, `webmap` permission keys
  - Remove `todowrite` + web tools from blanket ask/plan mode auto-deny
  - Expand presets (read-only, plan, full) with complete tool lists
  - Define session approval patterns (search/research=`*`, extract/crawl/map=host-scoped)
  - Add approval ladder `always` option with project/global scope
  - Add blocked-action recovery paths
- `Plans/storage-plan.md` — Structured `chat.plan_todo_updated` event family, bounded questionnaire draft/answer persistence, activity payload registration for web operations (inline vs ref/blob split)

### CRITICAL FIXES
- `Plans/Commands_System.md` — Remove/forbid `override_builtin` for reserved built-ins; reserve `/web` family exactly like other built-ins; narrow `override_builtin` to non-core command namespaces if it survives
- `Plans/UI_Command_Catalog.md` — Reconcile slash-command IDs to unified built-in list; add canonical `/web` family (cmd.chat.web.*); add `/skill` helper IDs; keep reserved list synchronized across all docs

### REQUIRED RECONCILIATION
- `Plans/Skills_System.md` — Agent Config > Skills naming, import/readiness/state taxonomy (source_type, readiness status, validation warnings), richer `skill` runtime metadata
- `Plans/LSPSupport.md` — Align lsp tool operation surface with canonical 10+1 decision
- `Plans/newtools.md` — Write missing §8.2.1, verify MCP/web-tooling text doesn't contradict canonical owners
- `Plans/chain-wizard-flexibility.md` — Clarification-request / question-flow semantics must align with shared question system
- `Plans/interview-subagent-integration.md` — Interview question behavior = baseline pattern for shared question-card system
- `Plans/orchestrator-subagent-integration.md` — Subagent/task defaults + todo-tool availability must match reconciled contracts
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — Browser capability, research session variant

### VERIFY / MINOR RECONCILIATION
- `Plans/feature-list.md` — Summary must reflect final slash set, Agent Config naming, refined tool behavior
- `Plans/00-plans-index.md` — Ownership/index descriptions must stay consistent
- `Plans/Run_Modes.md` — Ask/Plan semantics consistent with reconciled permissions/tools
- `Plans/Contracts_V0.md` — Clarification events + runtime owner boundary compatible; verify canonical requested/effective field names
- `Plans/Prompt_Pipeline.md` — No accidental runtime-identity re-ownership
- `Plans/Multi-Account.md` — Account-routing/runtime-disclosure assumptions still valid
- `Plans/Progression_Gates.md` — Clarification-request expectations aligned with question flow
- `Plans/OpenCode_Coverage_Matrix.md` — Audit statuses correct after changes
- `Plans/Personas.md` — FIX field naming drift (requested_persona_id → requested_persona)
- `Plans/newfeatures.md` — Origin text not misleading after updates
- `Plans/MiscPlan.md` — Old cleanup notes don't retain stale wording
- `Plans/FileManager.md` — Browser session relation to web tools
- `Plans/OpenCode_Deep_Extraction.md` — Verify extraction-derived guidance not mistakenly treated as PM semantics

### CONCRETE RECONCILIATION MAPS

#### Slash-Command SSOT Reconciliation
- Current drift: `assistant-chat-design.md`, `FinalGUISpec.md`, `Commands_System.md`, `UI_Command_Catalog.md` all disagree
- Canonical unified reserved set: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`
- Deprecation: `/cancel` → alias to `/stop`; `/clear` → remove unless genuinely distinct behavior required
- `UI_Command_Catalog.md` normalizes chat command IDs to unified built-in list
- `Commands_System.md` forbids `override_builtin: true` for reserved built-ins

#### Permission Preset Reconciliation Map
- Read-only: allow=read/grep/glob/list/codesearch/chatsearch/logsearch/skill/lsp(ro)/question/todoread/todowrite/capabilities.get; ask=webfetch/websearch/logread/task; deny=edit/bash/repo.import/media.generate
- Plan: allow=Read-only set; ask=full web family + logread + task; deny=edit/bash/repo.import/media.generate
- Full: allow=read/search/skill/lsp/question/todo; ask=edit/bash/repo.import/media.generate/web/logread/task

#### Question Tool Contract Reconciliation Map
- Expand `Tools.md` to support `single_question` / `questionnaire` modes
- Add `question` to `Permissions_System.md` permission-key table
- Align `storage-plan.md` with questionnaire draft persistence (bounded structured data only)

#### TODO Tool Contract Reconciliation Map
- Expand `todowrite` / `todoread` to normalized schema from planning outputs
- Remove `todowrite` from `ask/plan` mode auto-deny
- Make `chat.plan_todo_updated` the canonical event family for TODO persistence

#### Web Operations Reconciliation Map
- Add `webextract`, `webresearch`, `webcrawl`, `webmap` permission keys to `Permissions_System.md`
- Remove `webfetch` / `websearch` from mode auto-deny
- Define web activity labels in `assistant-chat-design.md` and `FinalGUISpec.md`

#### Runtime Identity Consumption Reconciliation Map
- Chat CONSUMES shared runtime identity from owner docs; must NOT re-own or invent replacements
- Canonical fields: requested_persona, effective_persona, requested_platform, effective_platform, requested_model, effective_model, requested_auth_mode, effective_auth_mode, requested_account_policy, effective_account_id, account_switch_reason, applied_persona_controls[], skipped_persona_controls[]
- Safe chat ownership: display format, requested/effective placement, compact/expanded, routing to details, UX copy

## Decisions Already Resolved

### User Decisions (this session)
- ALL Firecrawl gaps (high/medium/lower) are MVP scope
- Firecrawl joins provider taxonomy as lower-priority provider (user-changeable)
- Firecrawl capabilities integrated natively into PM where possible
- Site Reader interaction API serves BOTH research AND testing/debugging
- Both lightweight research actions AND full automation_session fallback when needed
- Lost specs from w-20260316-160450 MUST be reconciled into canonical docs
- ALL topics recovered, not just web-related
- Reconciliation in "excruciating detail"

### Design Decisions from Deep Specs (Parts R-X)
- Firecrawl default state: disabled; requires explicit API key or self-hosted URL
- Firecrawl provider ID: `firecrawl`; config stored in global user settings
- Firecrawl supports ALL 6 PM web operations natively (search, extract, research, crawl, map, fetch)
- Firecrawl parameter mappings: full per-operation bidirectional mapping defined (Part R)
- Firecrawl error codes: mapped to PM's 12-code error taxonomy
- Firecrawl audit fields: `firecrawl_credits_used`, `firecrawl_cache_state`, `firecrawl_scrape_id`
- websearch `sources`: 5 types (web/news/images/code/academic); default `["web"]`
- websearch `categories`: 3 types (github/research/pdf); optional filter
- webfetch `formats`: 8 types (markdown/html/rawHtml/screenshot/pdf/summary/links/images); default `["markdown"]`
- webfetch `actions`: max 10 actions, max 30s total wait (lighter than Firecrawl's 50/60s)
- webfetch `cache_policy`: `{max_age_seconds: 14400, store: true}` default
- webfetch `change_tracking`: hash-based comparison; `new|same|changed|removed` status
- webfetch `pdf_mode`: `fast|auto|ocr`; default `auto`
- webextract `schema`: JSON Schema draft-07; max 50KB; no external `$id` references
- webextract `schema_mode`: `strict|lenient`; default `lenient`
- webextract `prompt`: max 2000 chars; complements schema (prompt guides extraction, schema validates output)
- webresearch `autonomous`: false by default; 3 tiers (PM-composed default, enhanced PM recipe, provider-native agent)
- webresearch autonomous bounds: max 3 search iterations, max `max_sources` reads, max 120s
- webresearch `starting_urls`: max 5 seed URLs
- webcrawl `dedup`: default true; content-hash based
- webcrawl `include/exclude_paths`: glob-style path matching; include first, then exclude
- webmap `use_sitemap`: `include|only|skip`; default `include`
- Batch webfetch: max 50 URLs, concurrency default 3 (max 10)
- Batch webextract: max 10 URLs, concurrency default 3 (max 5)
- Batch failure model: `continue_on_error` default true; batch succeeds if at least one URL succeeds
- Cache per-project, bounded 100MB default, LRU eviction
- Cache key: `(normalized_url, formats_hash, adapter_id)` — actions NOT in key
- Cache TTL defaults: fetch/extract 4h, crawl/map 24h, search 1h, research NOT cached
- Change detection retention: 7 days after TTL expiry (for diff comparison)
- Routing algorithm: 9 steps with new Step 4 (cache check) after Firecrawl integration
- Research session: restricted subset of automation_session (15 of 40 actions in 3 tiers)
- Research session is transient (ephemeral profile, no takeover/promotion, teardown after tool completes)
- Escalation from research_session to automation_session requires explicit user confirmation
- Provider priority: Exa > Tavily > Firecrawl > Anthropic/OpenAI > Google > DDG

### Prior Locked Decisions (from w-20260316-160450, confirmed still valid)
- PM has 6-tool web family — augmenting, not replacing
- Site Reader is default webfetch path
- Citation/provenance model non-negotiable
- Permission model (allow/ask/deny) applies to all web tools
- Exa = primary, Tavily = optional premium, DDG = fallback
- `web_search` underscore naming to avoid LLM collisions
- 47-domain spam blocklist with monthly updates
- Subagent use aggressive by default
- Tool approval must include durable/permanent path
- No delete action on messages (user locked)
- Agent Config (not Skills page) as top-level surface
- Deep Plan does materially more than standard Plan
- Question flows: required by default, "Something else" always available
- Slash commands: reserved set non-overridable
- `Open in Terminal` (not `Pop Out Terminal`)
- Mini terminal: 5 collapsed, 15 expanded
- Search results: 5 collapsed, 15 expanded, 50 cap
- Diff inline cap: 50 lines

### Decisions Locked by Deep-Spec Enrichment (Parts D-Q)
- Approval ladder: 4-tier (once / for session / always-durable / deny) with project/global scope
- Canonical tool permission keys: 16+ keys including all web tools, question, skill, lsp, todo
- Unknown tool default: `ask`
- Permission snapshots immutable at attempt start; historical runs show frozen snapshot
- Subagent default denials: todowrite/todoread + nested task denied unless re-enabled
- Crew execution: same normalized TODO schema across single-agent, subagent, crew
- LSP parameter normalization: per-operation required fields (path, position, query, newName)
- MCP: 4 supported flows (auth, list/status, logout, debug)
- MCP credential binding: bound to effective remote server URL; URL change invalidates
- Runtime identity: canonical field names `requested_persona` / `effective_persona` (never `_id` variants)
- Runtime identity: 6 forbidden local substitutes chat must NOT invent
- Runtime identity: 5 safe chat ownership areas (display, routing, compact/expanded, UX copy)
- Multi-account: account-binding values (none / preferred / required)
- Seglog: 10 event families covering tools, usage, HITL, plan/todo, subagent, rollback, persona, background
- Web audit payload: 12+ fields under payload.meta for all web tool invocations
- Storage split: inline previews in audit, full content via ref/blob
- External references: 6 rules; OpenCode used for ALIGNED/RECONCILED/ADOPTED/REFERENCE ONLY categorization
- Site Reader: native, detail-level, token-efficient, iframe-aware, full browser interaction in v1

## Open Questions / Uncertainties

### Previously Open, Now Resolved by Deep Specs (Parts R-X)
- ~~Exact Firecrawl provider capability routing (which ops are native vs pm-composed)~~ → Part U: full matrix
- ~~Exact webresearch autonomous mode boundary vs Firecrawl /agent scope~~ → Part S webresearch contract
- ~~Whether change tracking requires persistent storage of previous fetch content~~ → Part W: stores content_hash + metadata, not full content; 7-day retention for change detection

### Still Open (Non-Web-Tool Questions)
- Exact todo auto-use heuristic threshold details (3+ steps is recommended trigger)
- Can user edit TODOs after execution starts? (currently: structural edits gated; status updates continue)
- Exact skills import archive payload format details
- Exact skills browsing/filtering affordances for MVP
- Whether fenced code copy always visible or context-dependent
- Multi-select support in question cards (schema supports it; UX unclear)
- PM visual-runtime script/third-party-library policy details
- Whether `/clear` is preserved or removed
- Whether still-absent runtime fields (execution_role, operational_identity, projection_freshness, projection_health) should be adopted for MVP or deferred

### New Questions Emerging from Deep Specs
- **research_session as 5th session class vs restricted automation_session?** — Part T defines it as a restricted automation_session (same runtime, subset of actions). But should we mint a separate session_class value `"research_session"` for telemetry/audit distinction? Recommendation: yes, mint the session class but reuse automation_session infrastructure
- **Firecrawl credit budget enforcement** — When autonomous webresearch delegates to Firecrawl /agent (20-2500 credits), should PM enforce a hard credit cap? How should user be warned? Recommendation: require confirmation when estimated cost > 100 credits; hard cap default 500 credits (user-adjustable)
- **Batch webfetch permission UX** — Single approval for batch of N URLs, or per-domain approval? Recommendation: single approval showing unique domains in batch
- **Cache cross-session behavior** — Cache is per-project, but should cache persist across PM restarts? Recommendation: yes, disk-backed cache survives restart; in-memory portion rebuilt lazily
- **webextract prompt + schema interaction** — When both provided, is prompt used for extraction guidance and schema for validation only? Or does schema constrain the LLM prompt? Recommendation: prompt guides extraction; schema validates output (two-phase)
- **webfetch `formats: ["screenshot"]` permission** — Screenshot requires browser runtime, which means higher permission tier than static fetch. Should screenshot format auto-elevate to session_granted? Recommendation: yes, screenshot/pdf formats require session_granted tier
- **Autonomous webresearch visibility** — During autonomous mode (3 search iterations), should each step be individually surfaced in chat, or just the final result? Recommendation: each step surfaced with activity labels (Searching Web, Reading Site, Refining query) for full transparency

## Packetization Notes

### Scope Warning
This work item expanded dramatically from "evaluate Firecrawl" to "Firecrawl + recover 30+ topic areas of lost specs". Packetization will need to handle:
1. **Web tool family expansion** — concentrated in Tools.md, newtools.md, Permissions_System.md
2. **Provider architecture** — new content for Tools.md capability matrix, provider routing
3. **Terminal/inline cards** — FinalGUISpec.md, assistant-chat-design.md
4. **Chat controls** — FinalGUISpec.md, assistant-chat-design.md
5. **Plan/Deep Plan/TODO** — assistant-chat-design.md, Tools.md, storage-plan.md, FinalGUISpec.md
6. **Question system** — FinalGUISpec.md, Tools.md, assistant-chat-design.md, Permissions_System.md, storage-plan.md
7. **Visualizer/Mermaid** — FinalGUISpec.md, assistant-chat-design.md
8. **Slash commands** — assistant-chat-design.md, UI_Command_Catalog.md, Commands_System.md
9. **Skills/Agent Config** — FinalGUISpec.md, Skills_System.md
10. **Subagent/task** — assistant-chat-design.md, Tools.md
11. **LSP** — Tools.md, LSPSupport.md
12. **MCP** — Tools.md
13. **Runtime identity** — assistant-chat-design.md, Contracts_V0.md, Personas.md
14. **Permissions** — Permissions_System.md (multiple fixes)
15. **Logging/audit** — FinalGUISpec.md, assistant-chat-design.md

### Packetization Strategy Recommendation
Given the scope, this should likely be split into multiple reconciliation packets:
- **Packet A**: Web tools + provider architecture + Firecrawl integration (Tools.md, newtools.md, Permissions_System.md web sections)
- **Packet B**: Chat UI/UX (terminal cards, message controls, scroll/copy, activity transparency, slash commands) → FinalGUISpec.md, assistant-chat-design.md, UI_Command_Catalog.md
- **Packet C**: Planning/execution (Plan/Deep Plan, TODO schema, question system, visualizers) → assistant-chat-design.md, FinalGUISpec.md, Tools.md, storage-plan.md
- **Packet D**: Agent ecosystem (Skills/Agent Config, subagents, LSP, MCP) → Skills_System.md, FinalGUISpec.md, Tools.md, LSPSupport.md
- **Packet E**: Permissions/runtime (presets, approval ladder, runtime identity, logging) → Permissions_System.md, Contracts_V0.md, Personas.md
- **Packet F**: Contradiction fixes (slash SSOT, override policy, field naming) → cross-doc fixes

## Do-Not-Forget Details

### Firecrawl-Specific
- Firecrawl's search uses Serper (Google) — PM uses Exa (semantic); fundamentally different paradigms
- Fire Engine (proprietary anti-bot) NOT available in self-hosted; PM should not assume this
- Firecrawl /agent expensive (20–2500 credits) and uses proprietary Spark models
- Firecrawl `/interact` has prompt-based mode (not just CSS selectors) — more agent-friendly
- PM's Site Reader detail-level approach already more sophisticated than Firecrawl's onlyMainContent
- AGPL license — patterns only, no code import
- PM is strict superset of Firecrawl's action model (40 vs 9 actions)

### Lost-Spec Recovery
- Source: w-20260316-160450 working_ledger.md (4,076 lines, ~128KB)
- 200+ locked decisions, 38 critical/high contradictions, 15+ recommendations
- 20 canonical doc clusters identified for reconciliation
- Full extraction available in session artifacts (old_ledger_full_audit.txt, old_ledger_full_audit_explore.txt)
- Old ledger is NOT canonical — it must be reconciled INTO canonical docs, not referenced

### Provider Architecture
- Tavily integration is NATIVE, NOT via MCP (this was a specific locked decision)
- Exa free tier + optional API key in global user settings
- Model-native providers (Anthropic/OpenAI) have fundamentally different capability profile than backend providers
- Provider switch must be disclosed in chat + audit

### Key Terminology
- `Site Reader` (never `Charlotte` in PM docs)
- `Open in Terminal` (never `Pop Out Terminal`)
- `Agent Config` with `Skills` tab (never `Skills page` as top-level)
- `Searching Web:` / `Reading Site:` (activity labels)
- `web_search` with underscore (LLM collision avoidance)
- Support tiers: `native`, `pm-composed`, `unsupported`

### Critical Fixes That Must Not Be Dropped
- §8.2.1 in newtools.md — cited but NEVER WRITTEN
- Plan mode permission contradiction — web tools auto-denied in planning modes
- Slash-command SSOT — three incompatible lists must become one
- Commands_System.md override_builtin — must be retired for reserved commands
- Personas.md field naming — must align with Contracts_V0.md canonical names
- Permission presets — too narrow, missing skill/lsp/question/todo/web
- Approval ladder — needs `always` (durable) option, not just once/session/deny

### Interaction Model
- Research session variant of automation_session serves BOTH research AND testing/debugging
- 15-action research subset in 3 tiers: always_allowed (7), session_granted (6), ask/deny (2)
- Full automation_session available as fallback when lightweight research actions insufficient
- Agents should auto-escalate to full automation when failing with lightweight actions
- Research session is transient (ephemeral profile, no takeover/promotion, teardown after tool completes)
- Escalation to automation_session always requires explicit user confirmation

### Firecrawl Integration Model
- Firecrawl is a lower-priority provider (below Exa, Tavily; above DDG)
- Default state: disabled; requires API key or self-hosted URL
- Supports ALL 6 PM web operations natively
- Firecrawl search uses Serper/Google (keyword) vs Exa (semantic) — different result profiles
- Firecrawl agent endpoint (for webresearch autonomous) costs 20-2500 credits per call
- Self-hosted Firecrawl lacks Fire Engine anti-bot; some sites will fail vs cloud
- PM must NOT silently switch between self-hosted and cloud Firecrawl
- Firecrawl parameter mappings fully specified per operation (see Part R)
- Firecrawl error codes mapped to PM error taxonomy (see Part R)

### Web Tool Enhancements (Firecrawl-Inspired, Now Specified)
- websearch: `sources` (web/news/images/code/academic) + `categories` (github/research/pdf)
- webfetch: `formats` (8 options), `actions` (research session), `cache_policy`, `change_tracking`, `pdf_mode`
- webextract: `schema` (JSON Schema draft-07), `schema_mode` (strict/lenient), `actions`, `prompt`
- webresearch: `autonomous` mode (3 tiers: PM-composed default, enhanced PM-composed, provider-native agent)
- webcrawl: `change_tracking`, `dedup`, `include/exclude_paths`, `respect_robots`, `formats`
- webmap: `include/exclude_paths`, `search` filter, `use_sitemap` modes
- Batch operations: webfetch (max 50 URLs, concurrency 3-10), webextract (max 10 URLs, concurrency 3-5)
- Caching: per-project, bounded 100MB, per-operation TTL defaults, LRU eviction
- Routing: 9-step algorithm updated with cache check (new Step 4) and Firecrawl routing notes
