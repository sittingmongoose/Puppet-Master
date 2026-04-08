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
- Node.js/TypeScript (Express), proprietary Fire Engine + Playwright fallback, Redis + playwright-service (confirmed); other internals not publicly documented [XV-FIX]
- 7 core endpoints: /v2/scrape, /v2/crawl, /v2/map, /v2/search, /v2/extract, /v2/batch/scrape, /v2/agent (beta) [XV2-FIX — browser and /interact removed; not separate endpoints per Part R corrected inventory]
- Core output formats: markdown, HTML, screenshots, structured JSON, with changeTracking support [XV-FIX]
- SDKs: Python, Node.js/TypeScript, Go, Rust, CLI [XV-FIX]
- AGPL-3.0 license (self-hostable but missing Fire Engine anti-bot in OSS)
- MCP server as first-class integration path

#### Search
- Uses Serper API (Google results) — NOT its own index
- Sources: web, news, images + categories: github, research, pdf
- /search does live search with optional scraping of results (not guaranteed full content for all results) [XV-FIX]
- Search results: configurable `limit` parameter (per source type, varies by plan) [XV-FIX]

#### Extract (Beta)
- LLM-powered structured extraction from URLs
- Structured extraction via JSON Schema or natural-language prompt [XV-FIX]
- URL wildcards for domain-wide extraction
- `enableWebSearch` flag to expand beyond provided URLs
- FIRE-1 agent model for complex navigation

#### Agent
- Autonomous research: no URLs required, describe what you need in natural language
- Spark-1-pro / spark-1-mini models
- Searches, navigates, fills forms, handles pagination, extracts structured data
- 20–2500 credits depending on complexity

#### Interact / Actions
- [XV2-FIX] NOT a separate core endpoint — interact/browser are sub-features accessible via /v2/scrape `actions` parameter, not standalone /v2 endpoints.
- 6 official actions: `wait`, `click`, `scroll`, `write`, `press`, `screenshot` [XV-FIX]
- `/interact` endpoint: prompt-based interaction (not just CSS selectors)
- Action limits and session persistence not documented in official sources [XV-FIX]

#### Change Tracking
- Built-in `changeTracking` format: previous scrape timestamp + status (new/same/changed/removed)
- Diff formats: git-diff or JSON
- Observer app for scheduled monitoring

#### Async Model
- Async support: confirmed for extract, batch, and agent operations via polling and webhooks. Other operations may be synchronous. [XV-FIX]

#### Anti-bot
- Proxy modes: basic, stealth, enhanced, auto
- Stealth browsing via Playwright and proxy support (confirmed) [XV-FIX]
- Fire Engine (proprietary) NOT available in self-hosted

#### Pricing / Credit Model [XV2-ADD]
- [XV2-ADD] Firecrawl uses a credit-based pricing model — costs vary by operation and complexity (e.g. agent: 20–2500 credits). This is a key capability constraint for provider routing decisions. See Part R for full credit breakdown.

### PART B: PM CURRENT WEB TOOL STATE (CRITICAL — STUBS)

Canonical docs define 6 web tools but most are barely specified:

- **websearch**: `query: string` → `results array`. Exa-backed. Web only. No categories, no provider routing.
- **webfetch**: `url: string` → `content: string`. Markdown only. Timeout and size cap specifics OPEN — see Part S. [XV2-FIX — "30s timeout, 1 MiB cap" was unsupported by any canonical doc; old ledger refs were from OpenCode, not PM]
- **webextract**: `url: string` → `extracted content + provenance refs`. NO schema. Behavior thinly defined — [XV2-FIX] Tools.md §3.5D (lines 317-334) provides a "Web operation family runtime contract" with 4 rules (Site Reader, provider support tiers, NL routing parity, fallback/provenance) but these are high-level, not implementation-ready contracts.
- **webresearch**: `task: string` → `multi-source result + sources/provenance`. NO chaining. NO autonomous behavior. [XV2-FIX] §3.5D runtime contract applies here too but is thin — does NOT constitute a complete behavioral spec.
- **webcrawl**: `url: string` → `crawl results + traversed refs`. No dedup, no filtering.
- **webmap**: `url: string` → `site map + source refs`. Minimal.

§8.2.1 (cited web search) is ENTIRELY MISSING from newtools.md — referenced at line 72 TOC but never written. [XV-ADD] §8.2.1 Web Search (referenced in newtools.md TOC) was NEVER WRITTEN — the section does not exist.

[XV-ADD] `webextract` and `webresearch` are barely-specified STUBS with no implementation-ready contracts.

[XV-ADD] All 6 web tools (websearch, webfetch, webextract, webresearch, webcrawl, webmap) need full contract expansion — see Parts R-X.

[XV2-ADD] Permissions_System.md (lines 252-257, 390-395) already defines permission keys and default `ask` posture for all 6 web tools. This is canonical but NOT reflected in the stub descriptions above — the tools have permission definitions even where behavioral contracts are thin.

### PART C: RECOVERED PROVIDER ARCHITECTURE (from w-20260316-160450)

#### Hybrid Provider Model
- **Exa** = primary/default (free tier + optional API key in global user settings)
- **Tavily** = optional premium (native integration, NOT via MCP; API key required)
- **DuckDuckGo** = fallback (HTML scraping adapter, no key)
- **Google** = optional adapter slot
- **Anthropic/OpenAI** = model-native web search providers
- **Firecrawl** = lower-priority provider (user-changeable) [NEW — user decision this session]

#### Capability-Based Routing
Per operation × provider → native / pm-composed / unsupported [XV2-FIX — 6 ops including fetch, not 5]:
- **Firecrawl**: native for all 6 ops (fetch, search, extract, research via agent, crawl, map) [XV2-ADD — was missing from routing bullets]
- **Tavily**: native for ALL 6 ops (fetch, search, extract, research, crawl, map) [XV2-FIX — count corrected to 6]
- **Exa**: native search/crawl/fetch, near-native extract [XV2-FIX — was "native"], near-native research, unsupported map
- **Anthropic/OpenAI**: native search only, pm-composed fetch, everything else pm-composed
- **DDG**: native-ish search, partial crawl, pm-composed fetch/extract/research, unsupported map [XV2-FIX — was "everything else pm-composed" but DDG map is unsupported per Part U]
- **Google**: native search only, pm-composed fetch, everything else unsupported or pm-composed
- Fallback within providers supporting the SAME operation [XV2-FIX — was ambiguous "same operation" qualifier missing]
- Provider switch disclosed in chat + audit
- [XV2-ADD] When no provider supports a requested operation, PM surfaces a clear capability-unavailable error with direct setup guidance (per old ledger line 759).

#### Provider Classification
- **Model-native providers**: Anthropic, OpenAI (capabilities come from the model itself)
- **Backend/API providers**: Exa, Tavily, DuckDuckGo, Google, Firecrawl (external services)

#### Key Provider Rules
- Tavily extract ≠ native Site Reader (distinct roles)
- PM uses `websearch` (no underscore) throughout — underscore naming is the provider's convention (Anthropic/OpenAI tool names), NOT PM's locked decision [XV-FIX]

#### Provider Details [XV-ADD]
- **Google Custom Search JSON API**: NOT available to new customers, scheduled for discontinuation 2027-01-01. PM must NOT design around Google official search as strategic backend. Google adapter slot must be a pluggable adapter with display label 'Google' regardless of actual backend. [XV-ADD]
- **DuckDuckGo**: no official API (HTML scraping only), poor suitability for JavaScript-heavy SPAs, best-effort/no-key fallback. DDG is ENABLED BY DEFAULT as fallback (LOCKED). [XV-ADD]
- **Exa**: free tier works WITHOUT API key; user API key overcomes rate-limit ceilings; default numResults=8; free-plan rate-limit → graceful fallback to next provider, not hard failure. [XV-ADD]
- [AUDIT3-FIX] **Exa rate-limit user-facing recovery guidance (LOCKED)**: When Exa hits a rate limit (HTTP 429) and PM falls back to the next provider, the chat activity label MUST include a user-readable explanation AND a path to resolution. Example: `"Searching Web: <query> (Exa rate-limited → fell back to DuckDuckGo. Add an Exa API key in Settings > Providers to avoid rate limits.)"` This guidance appears in both the chat activity label AND the audit log `provider_fallback_summary`. Do not silently fall back without user-visible explanation.
- **Tavily**: requires API key, free tier = 1,000 credits/month, $0.008/credit PAYG. Parameters: search_depth (ultra-fast/fast/basic/advanced), max_results, include/exclude domains, time_range, topic, include_images, include_raw_content, chunks_per_source. Best practice: two-step search-then-extract. CRITICAL: Tavily extract must NOT replace native Site Reader — they serve distinct roles (provider-side enrichment vs PM-native structured reading). [XV-ADD]
- [AUDIT3-FIX] **Tavily Settings UI layout rule (LOCKED)**: Tavily's advanced provider options (`search_depth`, `max_results`, `include_domains`/`exclude_domains`, `time_range`, `topic`, `include_images`, `include_raw_content`, `chunks_per_source`) MUST be placed behind an expandable **"Advanced"** section in the Settings UI, NOT displayed at top level. Top-level Tavily settings show only: enable/disable toggle, API key field, and provider priority position.
- [AUDIT3-FIX] **Tavily `include_raw_content` default = `false` (LOCKED)**: `include_raw_content` MUST default to `false` (conservative). PM already reads top search-result sources via native Site Reader, so fetching raw content through Tavily is redundant and risks unexpectedly large payloads. Users can enable it in the Advanced section when needed.
- [AUDIT3-FIX] **Tavily heavy-mode reservation rule (LOCKED)**: `search_depth: "advanced"`, `include_raw_content: true`, and high `chunks_per_source` values MUST be reserved for precision needs or fallback scenarios — NOT used as defaults. Default runtime behavior should use lighter Tavily modes (e.g. `search_depth: "basic"` or `"fast"`), letting PM's search-then-read heuristic handle depth via native Site Reader. Heavier Tavily modes activate only when: (a) lighter pass returned insufficient results, or (b) user explicitly requests deeper provider-side retrieval.
- **Anthropic/OpenAI**: model-native web-search providers MUST reuse PM's provider-account/auth model. Do NOT expose separate web-search API key fields if provider account is already configured. Settings UI should show: provider name, enabled toggle, capability badges, effective account label, effective model, auth state, rate-limit summary. [XV-ADD]

#### Provider Settings IA [XV-ADD]
- Three provider classes for settings display: (1) Account-backed (Anthropic, OpenAI) — derive web-search from existing auth, (2) API-backed (Exa, Tavily, Google-compatible, Firecrawl) — separate API key, (3) No-key (DuckDuckGo) — always available, no config needed. Settings rows should show health/error state and last-failure messaging. [XV-ADD]
- Two-class provider model (model-native vs backend/API) is a DESIGN PRINCIPLE, not just classification [XV-ADD]

#### Granular Editor Help Text [AUDIT3-FIX]
- Settings UI granular permission editor must include contextual help text with examples:
  - Host/domain pattern fields: examples like `https://docs.rs/*`, `https://developer.mozilla.org/*`
  - Session-approval scope: search/research use `*` wildcard; extract/crawl/map/read use host-scoped patterns
  - Provider-specific settings: explain what each controls (e.g., "API Key — required for Exa/Tavily/Firecrawl; not needed for DuckDuckGo")
  - Provider ordering: explain reordering effect on fallback behavior
- Help text is inline (tooltip or below-field), NOT a separate help page.
- [AUDIT3-FIX] **Settings must surface support tier per provider per operation (LOCKED)**: Settings UI / `/web` help / autocomplete surfaces MUST show BOTH provider availability AND support tier (`native`, `PM-composed`, or `unsupported`) for each provider × operation combination. This is a disclosure requirement so users understand what "supported" means for a given provider. Display as a capability matrix or per-provider badge row.

#### Provider Behavior Rules [XV-ADD]
- Provider fallback on rate-limit/outage: fall to next provider in priority order that supports the SAME operation [XV2-FIX — clarified same-operation constraint], do NOT stop. Fallback must be shown in BOTH chat activity label AND audit log. [XV-ADD]
- Users CAN adjust provider order in settings (LOCKED) [XV-ADD]
- [XV2-ADD] MVP scope: provider ordering is GLOBAL only. Per-operation priority override is NOT MVP (per Part U line 1644).
- Read-only preset ≠ Plan preset. Plan mode must NOT mean 'no network'. Read-only and Plan mode are NOT synonyms — different permission sets for different purposes. [XV-ADD] [XV2-FIX] ⚠️ CAUTION: This is a LOCKED DESIRED STATE that currently contradicts canonical docs — Permissions_System.md line 596 STILL defines Plan mode as deny-all-except-read. Reconciliation required before implementation.

#### Site Reader Architecture [XV-ADD]
- webfetch = native Site Reader path by DEFAULT. Site Reader is the PRIMARY architecture for PM-native site reading. Provider-delegated fetch (e.g. via Firecrawl scrape, Exa crawl, Tavily extract) is an ALTERNATIVE path, not the default. The 'Reading Site' activity label is RESERVED exclusively for the native Site Reader path. [XV-ADD]
- [XV2-ADD] Site Reader requires full browser interaction capability in v1 (not just static HTTP fetch) — per old ledger lines 585, 669. This is a hard requirement for JavaScript-rendered content.
- Agent must search THEN read top results before answering (global heuristic, not just inside webresearch composed mode). Final answer should carry sources/citations from actual read path, not raw search snippets alone. [XV-ADD]

### PART D: RECOVERED TERMINAL / INLINE OPERATION CARDS (from w-20260316-160450)

#### Mini-Terminal Card Defaults (LOCKED)
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- Full metadata (locked): status, cwd, command summary, elapsed time, exit code / truncation indicator [RECOVERY-FIX]
- ⚠️ [XV2-FIX] Shell-integration-opaque caveat: when shell integration is opaque (no reliable command boundaries), PM must degrade gracefully — must NOT fabricate exact command text or boundaries. Metadata fields that depend on shell integration (command summary, exit code attribution) should be marked approximate or omitted.
- **READ-ONLY and non-interactive** — user cannot type into the mini terminal card [RECOVERY-FIX]
- One card per command
- Retries create a new terminal and therefore a new mini terminal card — they do NOT append to the existing card [RECOVERY-FIX]
- Long-running/watch-mode commands are handled the same as any other command card — no special treatment [RECOVERY-FIX]
- Live by default while command active
- Copy works directly from card
- `Open in Terminal` opens PM's built-in terminal (NOT external OS terminal)
- Opens view onto same live command/session
- Repeated `Open in Terminal` idempotent (focuses existing, no duplicates) — `Open in Terminal` reuses/focuses the existing terminal view for that command rather than creating duplicates [RECOVERY-FIX]
- No special extra failure treatment or retry affordance beyond the normal command-card status/meta presentation [RECOVERY-FIX] — ⚠️ reconciliation with blocked-recovery matrix: the matrix handles the `blocked` state (actionable block requiring user intervention); `failed` state has no additional recovery affordance beyond status display.
- Placement: inline exactly where command happened
- A textual summary may appear after an inline card in the message flow — card does not suppress subsequent text [RECOVERY-FIX]
- [AUDIT3-FIX] **Narrative Order Rule (LOCKED)**: Preserve narrative order — (1) command trigger in assistant narrative, (2) inline operation card (mini terminal/search/diff), (3) assistant textual summary/commentary. Cards do not float out of narrative position.

#### Inline Operation Card Family (LOCKED)
- Shared template: command, search, edit events
- Same inline preview pattern for terminal outputs, search results, code-edit previews/diffs
- **Shared anatomy**: type icon+label, status badge (running/completed/blocked/failed/cancelled), title/summary, subject detail, primary open action, expand/collapse, bounded preview body, optional secondary actions
- **Search card**: primary action opens search results view/list (NOT jump to file); individual hits open files; collapsed=5 results, expanded=15, scrollable, 50-result cap; NO copy
- **Diff card**: one per edit command; opening opens file in editor showing diff; cap=50 lines; diff preview sizing same as other cards; NO copy; [RECOVERY-FIX] when diff exceeds 50-line inline cap, truncate with "Show full diff" expansion affordance — truncation is by LINES, not hunks
- **Terminal card**: copy allowed; may show bounded live tail while active
- **Web operation cards** [XV-ADD]: 6 types — Searching Web, Extracting Site, Researching Web, Crawling Site, Mapping Site, Reading Site. Same shared anatomy; collapsed shows query/URL + source count
- [RECOVERY-FIX] Copy scope: NO copy action for search result cards or diff cards — copy is limited to text content cards, code blocks, and terminal output

#### Card Summary Defaults (LOCKED)
- Command: `Ran: <command>` or `Running: <command>`
- Web/search: `<operation>: <query/url> — N sources`
- Diff/edit: `<path> +N −M`
- Completed cards: default to collapsed when verbose
- Failed/blocked cards: surface key failure line without forcing expand
- **Expanded-state spec** [XV-ADD]: shows input summary, requested vs effective provider delta, support tier, fallback info, source/scope counts, warnings/errors

#### Blocked-Action Recovery Matrix (LOCKED) [XV-ADD]
- **Permission blocked** → show approval card (once / session / always / deny options); links to `blocked_reason_code` + `allowed_action_ids[]`
- **FileSafe blocked** → show "allow once" + add-rule + open FileSafe settings; links to `blocked_reason_code` + `allowed_action_ids[]`
- **MCP unavailable** → show retry connection + open integration/auth/config surface; links to `blocked_reason_code` + `allowed_action_ids[]`
- **Provider unavailable** → show switch provider/model + open Authentication/Health; links to `blocked_reason_code` + `allowed_action_ids[]`
- **Headless mode** → show "open in Terminal" option; links to `blocked_reason_code` + `allowed_action_ids[]`
- ⚠️ [XV2-FIX] Headless-specific recovery: "Open in Terminal" is impossible in headless mode. When headless, use `headless_ask_denied` resume guidance instead — return structured `status: "unavailable"` with `reason: "headless"` and allow the agent to proceed with a fallback strategy or surface the blockage to the orchestrator. Do NOT offer GUI-only recovery actions in headless context.

#### block_reason_code → Recovery Path Mapping [RECOVERY-FIX]
- `permission_denied` → re-prompt approval (approval card: once / session / always / deny)
- `network_error` → retry with backoff (exponential backoff; show retry count to user)
- `provider_unavailable` → fallback to next provider in priority order; if no fallback available, show provider health / auth surface
- `headless_unavailable` → structured unavailable response: `status: "unavailable", reason: "headless"`; allow agent fallback or orchestrator escalation (do NOT offer GUI-only recovery)
- `timeout` → configurable retry (honor per-operation timeout config; surface elapsed time and retry option to user)

#### Action Taxonomy [XV-ADD]
- **expand**: show more output inline (within current card/context)
- **show terminal**: reveal existing PTY session
- **background**: move long-running operation to background
  - [RECOVERY-FIX] Background card state: when an operation card enters `background` state (user chose to background it), the card shows a `backgrounded` badge. Completion updates the badge to the final state (`completed` or `failed`) with a notification to the user.
- **detach / pop-out**: separate window
  - [AUDIT3-FIX] **Scope rule**: detach/pop-out, if supported, applies to the **canonical terminal surface**, NOT the inline mini terminal card/preview. The mini terminal is always inline and read-only; pop-out targets the full PM terminal view for that session.
- ⚠️ "Terminal thread" is an **ANTI-PATTERN** — do not imply a special thread type

#### Operation Card Scope Exclusion [XV-ADD]
- Simple read/grep/glob results are **inline text**, NOT operation cards
- Cards are reserved for stateful, time-bounded operations with lifecycle (pending→running→completed/failed/cancelled)
- [AUDIT3-FIX] **Named Widget Family Exclusion List**: The inline operation-card family explicitly EXCLUDES the following — they are separate widget families that MUST NOT be collapsed into the operation-card pattern:
  1. **Question cards** — separate questionnaire widget with draft/submit lifecycle
  2. **Approval cards** — separate permission-request widget with once/session/always/deny actions
  3. **Sticky plan panel** — separate persistent plan-tracker surface, not an inline card
  4. **Thought-stream blocks** — separate reasoning-transparency surface
  5. **Subagent blocks** — separate delegated-task disclosure surface
  - These exclusions are definitional — adding any to the operation-card family requires an explicit design decision, not implicit drift.

#### Card Status Badge State Machine [XV-ADD]
- States: `pending` → `running` → `completed` | `failed` | `cancelled`
- Additional state: `blocked` (used in shared anatomy status badge — transition: `running` → `blocked` when action requires user intervention or external dependency; `blocked` → `running` on unblock) [XV2-FIX]
- Transitions: pending→running (execution starts), running→completed (success), running→failed (error/nonzero exit), running→cancelled (user stop), running→blocked (awaiting resolution), blocked→running (unblocked)
- ⚠️ [XV2-FIX] Canonical 8-state taxonomy reconciliation: assistant-chat-design.md §13 defines 8 agent/process states: `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, `attention_required`. PM's card-level state machine (above) is a simplified projection for UI badge display. Reconciliation: `pending`≈`starting`, `running`=`running`, `completed`≈`exited`, `failed`=`failed`, `cancelled`≈`terminated`, `blocked`≈`attention_required`. States `disconnected` and `restoring` apply at agent-session level (not individual card level) and should surface as card-level `blocked` with appropriate `blocked_reason_code`.
- Badge is always visible on card; color/icon per state

#### Inline Comfort Threshold [XV-ADD]
- Concept: when terminal output volume exceeds inline comfort, promote from inline preview to full terminal view
- Threshold is heuristic (line count, byte size, duration) — exact values are implementation-detail

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
- ⚠️ [RECOVERY-FIX] `Rerun in Terminal` is PROPOSED — absent from UI_Command_Catalog.md with no command ID. Needs canonical landing before implementation.
- Terminology: use `Open in Terminal`, NOT `Pop Out Terminal`
- Large payloads store full data behind refs/blobs; cards show bounded previews only
- Cards persist on thread reload; re-rendered from persisted source/metadata
- Search and diff operations have NO streaming rule — results appear complete, not progressively streamed [XV-ADD]
- [RECOVERY-FIX] Web operation cards render on COMPLETION (not streaming). The activity label (e.g., `Researching Web: <query>`) streams progress text; card content appears only when the operation completes.

### PART E: RECOVERED CHAT CONTROLS & MESSAGE ACTIONS (from w-20260316-160450)

#### Message Controls (LOCKED)
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- **Stop**: immediate cancellation (distinct from queue/steer/interrupt)
- **Edit**: restores into composer for modification + resend; discards all later history/work
- **Resend**: retry/re-run most recent message; discards all later history/work
- **NO delete action** (explicitly locked by user)
- Inline rewind warning, NO extra confirmation dialog
- Stop/Edit/Resend disappear once next user message sent
- [RECOVERY-FIX] Run-completion edge case: when a run completes and no next message is queued, Stop becomes disabled; Edit/Resend remain available on the last user message. If a queued message exists when the run completes, it auto-sends.
- Render as icons, not text labels

#### Queued Messages / Steer Semantics [XV2-ADD]
- Per canonical assistant-chat-design.md lines 214-243: when user sends a message while agent is actively running, message enters a **queued messages strip** (FIFO, max 2 queued messages).
- Queued strip shows pending messages with actions: **Edit** (modify before delivery), **Send now** (force immediate delivery interrupting current work), **Cancel** (remove from queue).
- **Stop does NOT clear the queue** — stopping the current run proceeds to deliver next queued message.
- If queue is full (2 messages), composer blocks further sends until a slot opens.
- Queue is per-conversation, transient (not persisted across reload), and visible in the chat UI between the active response and the composer.

#### Stop Control Placement (LOCKED)
- Primary: composer/send icon morphs into stop icon while agent working
- If user starts typing during active run, composer returns to send (new message queued)
- Per-message stop icon also present alongside edit/resend

#### Message Row Action Model (LOCKED)
- Assistant row: copy + contextual stop (while run active)
- Most recent user row: copy + edit + resend + contextual stop
- Older messages: copy only
- Code blocks: visible copy, open in editor (if filename), go to definition (if LSP)
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #13**: Code-block copy affordance is LOCKED as **always-visible** on fenced code blocks. Copy coexists with LSP actions (open in editor, go to definition) without conflict.
- Code block fallback [XV-ADD]: when no filename or LSP binding exists, copy still works; other affordances (open in editor, go to definition) are omitted/disabled, not errored

#### Scroll / Auto-Follow (LOCKED)
- Auto-follow while at bottom; scrolling up pauses auto-follow
- Jump-to-bottom button with unseen-count badge
- Pressing jump returns to bottom + re-enables follow

#### Copy Behavior (LOCKED)
- All user + assistant messages: always-visible copy icons (NOT hover-only)
- ⚠️ [XV2-FIX] Copy icon visibility contradiction: This ledger locks "always-visible copy icons" for message-level copy, but canonical assistant-chat-design.md lines 286-295 specifies message-level actions appear in a hover/focus action row (hidden until hover/focus). **Ledger intent**: PM deliberately departs from the canonical hover-only pattern for copy — PM locks always-visible copy as a usability choice. This is a known divergence from canonical current state, not an oversight. If canonical updates to always-visible, this note can be removed.
- Code blocks: copy coexists with file-open/LSP actions — ✅ [GAP-RESOLVE] **RESOLVED — Decision #13**: LOCKED as always-visible copy affordance on fenced code blocks, coexisting with LSP actions. Status: **LOCKED**.
- Diff cards: do NOT inherit generic code-block copy (distinct operation-card rules)

#### Subagent Disclosure Requirements [XV-ADD]
- Messages from subagents must disclose: which subagent, why it was invoked, what task it owns
- This is a transparency requirement — users must always know when they are interacting with a delegated agent

#### Message Row Action Model Per Type [XV-ADD]
- **Assistant message**: copy + contextual stop (while run active)
- **User message**: copy + edit + resend + contextual stop (most recent only)
- **System message**: copy only (no edit/resend)
- **Tool-result message**: copy only; tool-specific actions (e.g., open file for edit results)
- **Subagent message**: copy + subagent identity badge; no direct edit/resend

### PART F: RECOVERED PLAN / DEEP PLAN / TODO TRACKING (from w-20260316-160450)

#### Plan vs Deep Plan (LOCKED)
- Both produce normalized TODO list; users can edit/add/remove/reorder before approval
- Plan is read-only until execute; keeps plan panel visible
- Deep Plan uses same todo function but produces fuller plan artifact for review/edit/questions before execution
- [AUDIT3-FIX] **Deep Plan Q&A Loop (named first-class feature, LOCKED)**: The pre-execution question phase is formally named the **Q&A loop**. It runs between artifact production and execution approval: PM poses clarifying questions, user answers, plan may be revised before approval. This is the primary behavioral differentiator between Plan mode (produces todo → proceeds) and Deep Plan mode (produces artifact → **Q&A loop** → approval → execution). Any downstream spec must reference Q&A loop by name.
- Deep Plan does **materially more** thinking, research, clarifying-question work — the difference is **degree/intensity**, not categorical [XV-FIX] (old ledger LOCKED this as "difference is degree/intensity")

#### Normalized TODO Schema (LOCKED)
- `todo_id`, `title`, `summary`, `status`, `dependencies[]`, `owner_hint`, `verification_hint`, `notes?`, `order_index?`
- [RECOVERY-FIX] `notes?` and `order_index?` are from old-ledger spec (w-20260316-160450 line ~3766-3775), NOT yet in canonical `assistant-chat-design.md`. Need canonical landing before these fields are implementation-locked.
- Status set: `pending`, `in_progress`, `completed`, `blocked`, `skipped`
- ⚠️ [XV2-FIX] `superseded` status: The inline progress format (below) uses `Superseded TODO N/M` and the Plan/TODO State Model includes `superseded` as a plan-level state, but `superseded` is absent from this TODO-item status set. Resolution: `superseded` is a **plan-level** state (the entire plan is superseded by a revision), NOT an individual TODO-item status. Inline progress text `Superseded TODO 5/5` refers to a TODO within a superseded plan. Individual TODOs in a superseded plan retain their last status; the plan-level `superseded` flag governs visibility.
- [RECOVERY-FIX] TODO item statuses: `pending` / `in_progress` / `completed` / `blocked` / `skipped`. `superseded` is a PLAN-LEVEL state only — individual TODOs in a superseded plan retain their last status.
- `owner_hint` lifecycle [XV-ADD]: starts as advisory suggestion, can evolve to effective delegated owner during execution
- [RECOVERY-FIX] `owner_hint` advisory→effective mechanism: `owner_hint` starts as an advisory field in tool output. It becomes effective when crew delegation resolves it to a concrete provider/model/persona mapping. Recording: seglog captures both `owner_hint_advisory` and `owner_hint_resolved` for audit trail. Evolution trigger is crew delegation resolution, not a user action.
- TODOs carry forward into execution

#### Plan/TODO State Model (LOCKED)
- Distinguish: `draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`
- Revisions/replans create explicit new draft/revision state (NOT invisible mutation)
- After approval: structural edits gated/restricted; status updates continue automatically
- [RECOVERY-FIX] Structural edit definition (per old ledger ~line 3783): Structural edits = adding / removing / reordering TODO items. Non-structural = updating status, notes, verification_hint on existing items. Post-approval policy: structural edits require re-approval (trigger replan/revise flow); non-structural edits (status, notes) are free and continue automatically.
- Later changes require explicit replan/revise flow — create new revision rather than invisibly mutate history [XV-ADD]
- Bounded revision/status history persisted for plan auditability [XV-ADD]
- Storage event: `chat.plan_todo_updated` = canonical event family for TODO persistence
- [RECOVERY-FIX] `chat.plan_todo_updated` minimal payload schema: `{ plan_id: string, todo_id: string, field: string, old_value: any, new_value: any, source: "agent" | "user" }`

#### Sticky Plan Panel (LOCKED)
- Per-thread, shows: plan title/summary, todo list in canonical order, status badge per todo, dependency hints, owner/delegated-executor badge, verification hint
- Before approval: full editing controls
- After approval: execution-tracker posture (read-mostly)

#### Inline Progress in Chat (LOCKED)
- Do NOT duplicate full checklist on every turn
- Show compact milestones: `Started TODO 2/5`, `Completed TODO 2/5`, `Blocked TODO 3/5`, `Skipped TODO 4/5`, `Superseded TODO 5/5` [XV-ADD]
- Clicking inline update focuses/opens sticky plan panel at that item
- Completed plan leaves final todo states visible; switching to Ask mode must NOT erase plan/todo state

#### Auto-Use Heuristic (LOCKED)
- Plan/Deep Plan = mandatory normalized TODO
- Non-Plan execution: agent may auto-use `todowrite` when multi-step enough
- Triggers: 3+ meaningful steps, dependencies, multi-file/multi-subsystem, delegated subagent/crew, explicit user request
- [RECOVERY-FIX] Auto-use on-trigger behavior: when auto-use heuristic fires, agent emits a `todowrite` tool call with proposed TODO items. If auto-approved (per permission preset), items are created silently. If ask-mode, user sees an approval prompt with the proposed items before creation.

#### todowrite/todoread Tool Contract (LOCKED)
- Expand to use normalized TODO schema from planning outputs
- `todowrite` can create, reorder, update statuses/notes
- `todoread` returns current normalized list for active thread/run
- Same schema works for single-agent, subagent, crew execution
- Remove `todowrite` from blanket `ask/plan` mode auto-deny — this is a **3-location fix**: mode deny list, preset table, reconciliation map [XV-ADD]
- Subagent default = deny unless explicitly re-enabled by run config
- [AUDIT3-FIX] **Named Doc Contradictions for 3-Location Fix**: The 3-location fix must also resolve these specific contradictions:
  1. **`FinalGUISpec.md`**: current wording "todo checkboxes" is too thin relative to the normalized TODO schema — must expand to execution-tracker semantics
  2. **`Tools.md`**: current `todowrite`/`todoread` tool contract lags the normalized TODO contract — I/O must be expanded to match full schema (including `dependencies[]`, `owner_hint`, `verification_hint`)
  3. **All docs**: must stop implying todo tracking is only a static checklist instead of a live execution tracker

#### Deep Plan → TODO Projection Sync Rule [XV2-ADD]
- Per canonical requirement: editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins.
- Flow: user edits Deep Plan artifact → PM extracts/diffs TODO changes → normalized TODO list updated → execution proceeds from updated TODOs.
- This ensures the TODO list (which drives execution) never drifts from the user-approved Deep Plan artifact.

#### Plan/TODO Per-Doc Landing Zones [AUDIT3-FIX]
- **`Plans/assistant-chat-design.md`** → Add sticky-panel-vs-inline-progress division + auto-use heuristic guidance
- **`Plans/FinalGUISpec.md`** → Expand sticky-card into fuller execution-tracker contract; define status badges, item-focus behavior, post-approval edit restrictions
- **`Plans/Tools.md`** → Expand `todowrite`/`todoread` I/O to match normalized TODO contract
- **`Plans/storage-plan.md`** → Ensure thread-scoped plan/todo state persists with revision/status history
- **`Plans/feature-list.md`** → Dependent summary update after SSOT docs reconciled

### PART G: RECOVERED QUESTION CARD / QUESTIONNAIRE SYSTEM (from w-20260316-160450)

#### Question UI (LOCKED)
- **CRITICAL** [XV-ADD]: Question-flow visuals write directly into PM-managed draft state, NOT via `sendPrompt`. `sendPrompt` queues a chat message — it is NOT the primary PM interaction model for questions.
- Question cards may include an accompanying visual (e.g., screenshot, diagram) [XV-ADD]
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

#### Questionnaire Draft Persistence [XV-ADD]
- Drafts auto-save; storage landing zone defined in storage-plan.md
- [AUDIT3-FIX] **Thread-scoped draft state (LOCKED)**: Questionnaire draft state is thread-scoped — bound to the specific thread where presented. Drafts auto-save continuously; no manual save exposed. Persisted data is bounded/structured (per-question draft values only). On thread reload/navigation-return, draft state restored so user can resume without data loss.
- Dismiss is explicit state returning `status: 'dismissed'`, NOT fabricated partial answers
- Draft persistence allows resume after navigation/close
- [RECOVERY-FIX] Questionnaire draft persistence landing zone in storage-plan.md is currently UNVERIFIED. `draft_value` (per-question saved text) and partial answers need an explicit storage section in storage-plan.md. Flag for reconciliation — do not assume coverage until confirmed.

#### Multi-Question Lifecycle [XV-ADD]
- 5 states: `draft` → `incomplete` → `ready_to_submit` → `submitted` → `paused`
- (Already reflected in Question Card Schema flow states below; this section names the lifecycle explicitly)
- [RECOVERY-FIX] Lifecycle transition triggers (previously undefined):
  - `pending` → `active`: question presented to user in chat UI
  - `active` → `answered`: user submits a response
  - `active` → `dismissed`: user explicitly dismisses the question/questionnaire
  - `active` → `expired`: timeout reached (only if timeout is configured on the question)
  - `answered` → (terminal): no further transitions
  - `dismissed` → (terminal): no further transitions
  - (Note: `pending`/`active` map to `draft`/`incomplete` in the 5-state UI lifecycle above; triggers apply to both layers.)

#### Question Card Schema (LOCKED)
- `question_id`, `prompt`, `options[]`, `allow_other`, `allow_multi_select`, `required`, `response_kind` ⚠️, `draft_value`, `validation_state` ⚠️, `submitted_at?`
- [RECOVERY-FIX] Canonical field name is `question`, NOT `prompt`. Card schema must use `question` to match tool contract (old ledger ~line 3710-3718: QuestionItem uses `question` consistently). Any `prompt` references in the card schema above are errors pending correction. `prompt` may exist at the envelope/header level only — it is NOT the per-question field name.
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #9**: `response_kind` and `validation_state` are LOCKED:
  - `response_kind`: `"selection" | "freeform" | "mixed"`
  - `validation_state`: `"valid" | "invalid" | "pending"`
  - Both fields are optional; omit if not needed by the question type.
- ⚠️ [XV2-FIX] **Field-name normalization note**: Schema field names and tool contract field names have drifted. Canonical names (tool contract is authoritative where conflicts exist):
  - Schema `prompt` ↔ Tool `question` → **canonical: `question`** (tool contract is the wire format)
  - Schema `allow_other` ↔ Tool `allow_freeform?`/`allow_other?` → **canonical: `allow_freeform`** (with `allow_other` as deprecated alias)
  - [RECOVERY-FIX] Canonical field name is `allow_freeform` (not `allow_other`). This field controls whether the user can enter a freeform text response in addition to pre-defined options. `allow_other` is a deprecated alias and must not be introduced in new code.
  - Schema `allow_multi_select` ↔ Tool `multi_select?` → **canonical: `multi_select`** (shorter form)
  - Schema `draft_value` ↔ Tool `default_values?` → **these are distinct**: `default_values` = initial suggestion from tool caller, `draft_value` = user's in-progress input (PM-managed state). Both retained.
  - [RECOVERY-FIX] `default_values?: string[]` = pre-selected option IDs when the question is first shown (caller-supplied initial suggestion). `draft_value?: string` = saved freeform draft text (PM-managed, for resume after dismiss/navigate away). These are distinct fields, not aliases. Do not collapse them.
  - Schema must be updated to use canonical names before implementation lock.
- Flow states: `draft`, `incomplete`, `ready_to_submit`, `submitted`, `paused`

#### Question Tool Contract (LOCKED)
- Input: `mode: "single_question" | "questionnaire"`, `header?`, `prompt?`, `questions: Array<QuestionItem>`
- QuestionItem: `question_id`, `question`, `description?`, `options?`, `required?` (default true), `multi_select?` (default false), `allow_freeform?`/`allow_other?` (default true), `placeholder?`, `default_values?`
- Output: `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`, `answers: Array<{question_id, values: string[]}>`, optional `answer_text?` for single-question callers
- [RECOVERY-FIX] `source?` field: INCLUDED as optional per old ledger final recommendation (old ledger ~line 3722). Full answer item shape: `{ question_id, values: string[], source?: "option" | "other" | "freeform" }` — indicates whether the answer came from a pre-defined option, an 'other' freeform entry, or pure freeform input. The previous claim "deliberately excluded per old ledger final pass" was false; the old ledger explicitly includes it.
- [AUDIT3-FIX] **`source?` field RE-LOCKED (LOCKED)**: `source?: "option" | "other" | "freeform"` is a confirmed, included optional field in every answer item. Old ledger (line 3722) locked this; demotion to Open Question was unjustified. Status: **LOCKED — do not re-open.**
- Headless/HITL-unavailable = `status = "unavailable"` (NOT fabricated answers)
- [RECOVERY-FIX] Subagent question tool access is DENIED by default. Subagents do not question the user directly unless explicitly granted permission by run config. This is a hard default, not a soft preference. (Old ledger ~line 3731: "Children do not question the user directly by default.") The previous soft wording "should NOT spam users" understated this rule.
- [AUDIT3-FIX] **Coordinated top-level Q&A = product rule (architectural principle)**: The prohibition on subagent-direct question flows is not merely a configurable default — it is a **product rule**. The entire question system is designed so one question flow per user interaction is owned by the top-level orchestrator. Subagents needing user input must escalate to parent. Framing as merely a "default" understates design intent. Landing zone: `assistant-chat-design.md` §15.2.
- Add `question` to Permissions_System.md; default = allow when HITL available
- Legacy single-question mode is syntactic sugar over the richer multi-question envelope [XV-ADD]
- [RECOVERY-FIX] Single-question syntactic sugar mechanism: Single-question mode is syntactic sugar for a 1-item questionnaire. Tool emits `question` (singular) with the same QuestionItem schema. Runtime wraps it in an implicit single-item questionnaire. Response envelope is identical to multi-question output (`status`, `answers[]`, optional `answer_text?`).
- Reference: existing `question_ids[]` in Contracts_V0.md proves multi-question is canonical [XV-ADD]
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #8**: `options` format is LOCKED as `Array<{id: string, label: string, description?: string}>` (object-array). `string[]` is accepted as shorthand and auto-expanded to `{id: str, label: str}` at ingestion. Object-array is the canonical wire format.
- [XV2-FIX] `options` format resolution note: old ledger v1 contract locked **object-array format** `Array<{id, label, description?}>`. Status: **LOCKED — canonical** (see GAP-RESOLVE above).

#### Questionnaire Lifecycle / Output Status Normalization [XV2-ADD]
- ⚠️ The lifecycle states and tool output statuses are inconsistent:
  - Lifecycle states (Part G Multi-Question Lifecycle): `draft`, `incomplete`, `ready_to_submit`, `submitted`, `paused`
  - Tool output statuses: `answered`, `submitted`, `dismissed`, `timed_out`, `unavailable`
  - `paused` exists in lifecycle but NOT in tool output statuses.
  - `dismissed`, `timed_out`, `unavailable` exist in tool output but NOT in lifecycle states.
- Reconciliation: Lifecycle states describe the **UI questionnaire widget** state (internal to PM rendering). Tool output statuses describe the **result returned to the calling tool**. These are different state machines for different layers:
  - UI lifecycle: `draft` → `incomplete` → `ready_to_submit` → `submitted` | `paused` | `dismissed`
  - Tool output: `answered` (single-Q shorthand) | `submitted` (multi-Q completed) | `dismissed` (user explicitly dismissed) | `timed_out` (deadline expired) | `unavailable` (headless/no HITL)
  - `paused` is UI-only (widget is backgrounded/navigated away); it does not produce a tool output until resumed or dismissed.

### PART H: RECOVERED INLINE VISUALIZER / MERMAID (from w-20260316-160450)

#### Mermaid (LOCKED)
- Canonical source text (`mermaid` fenced blocks / `.mmd`)
- Chat/planning render as native diagram card
- Visible error state on parse failure
- **Mermaid diagram actions** [XV2-ADD]: per canonical FinalGUISpec.md lines 1773-1778, Mermaid cards must support: **Copy source** (copy raw mermaid text), **Open in editor** (open `.mmd` source in editor), **Open detached preview** (pop out diagram to standalone preview window), **Export diagram** (export rendered diagram as image/SVG). These are secondary actions on the Mermaid card, consistent with the shared card anatomy's optional secondary actions slot.

#### Anti-HTML-Execution Guard [XV-ADD]
- Mermaid/Markdown rendering must NOT execute arbitrary HTML
- Strict sanitization required — allowlisted tags/attributes only
- Same-origin isolation and sandbox settings apply to bridge behavior [XV-ADD]

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
- [XV2-FIX] Visualizer fallback clarification: The above line and the line below are NOT contradictory when read correctly. What IS allowed: showing source code + visible error state (explicit degradation with user-visible notification). What is PROHIBITED: **silent** degradation to text-only where the user doesn't realize rendering failed. The key word is "silently" — any fallback must be accompanied by a visible error/warning indicator.
- No fallback mode (do not **silently** degrade to text-only) [XV2-FIX: added "silently" to clarify intent]

#### Visualizer Persistence (LOCKED)
- Persist: source fragment, metadata (title, kind, version), PM-managed outputs/draft values
- Do NOT persist arbitrary JS heap/runtime state
- Re-render from persisted source on thread reload/export review

#### Visualizer Persistence Clarification [XV-ADD]
- **Persist**: rendered output references, source data, metadata
- **Do NOT persist**: transient rendering state, animation positions, scroll offsets, ephemeral JS variables
- (Complements the existing Visualizer Persistence section above)

- ✅ [GAP-RESOLVE] **RESOLVED — Decision #10**: Visualizer theme-token injection is LOCKED:
  - **Mechanism**: CSS custom properties injected as inline `style` attribute on the visualizer container at render time.
  - **MVP tokens**: `--pm-viz-bg`, `--pm-viz-fg`, `--pm-viz-accent`, `--pm-viz-border`, `--pm-viz-font-family`, `--pm-viz-font-size`
  - **Constraint**: Visualizer fragments MUST use these tokens; hardcoded colors are prohibited.
- ⚠️ [XV2-FIX] **Theme-token injection in LOCKED section**: The above unresolved item sits inside the supposedly LOCKED Inline Visualizer section. ~~This is explicitly flagged: the visualizer behavior is locked but the theme-token injection schema (token names, CSS custom property format, injection timing, bridge API shape) remains an **open design gap** within the locked section.~~ [GAP-RESOLVE] This gap is now RESOLVED per Decision #10 above.
- ⚠️ NOTE [XV-FIX]: External reference conclusions (e.g., "ALL ADOPTED" claims elsewhere in ledger) should be read as "transferable ideas" — do not copy raw assumptions from external references without PM-specific validation

#### Chat Widget Taxonomy (LOCKED)
- Plain code blocks, diff/operation cards, Mermaid/native diagram cards, question cards = **related but distinct message widgets** (not one overloaded "rich block" type)
- [RECOVERY-FIX] **Inline visual module** is the sixth distinct message widget type (FINDING-H02). Add to taxonomy: `plain code blocks` | `diff/operation cards` | `Mermaid/native diagram cards` | `question cards` | `inline visual module`. The inline visual module (HTML/SVG sandboxed fragment with narrow bridge) is categorically distinct from Mermaid cards and from plain code blocks — it has its own rendering pipeline, sandbox settings, theme-token injection, and bridge API. Do not conflate with the Mermaid card type.

### PART I: RECOVERED SLASH COMMANDS (from w-20260316-160450)

#### CRITICAL: Slash-Command SSOT Drift
Three incompatible slash-command lists exist:
- `assistant-chat-design.md` §5: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/clear`, `/help`, `/settings`, `/doctor`, `/cancel`, `/stop`
- `FinalGUISpec.md` §7.16.2: `/new`, `/model`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`
- `UI_Command_Catalog.md`: follows assistant-chat-design style with stable IDs

#### Canonical Built-In Slash Set (LOCKED)
Unified reserved set: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`
- `/cancel` = alias/deprecation path to `/stop` (accepted temporarily, UI prefers `/stop`)
- `/clear` = LOCKED as removed from the reserved set [XV-FIX] — confirmed removed; not open [XV2-FIX] — This is AUTHORITATIVE: `/clear` is LOCKED-REMOVED. Canonical `assistant-chat-design.md` already explicitly excludes `/clear` from the reserved set. Reconciliation map hedge ("remove unless genuinely distinct") and Open Questions listing are stale — both must defer to this locked decision.
- All reserved built-ins are **non-overridable**
- `Commands_System.md` must stop allowing `override_builtin: true` for reserved built-ins

#### /web Family (LOCKED)
- `/web search <query>`, `/web extract <url>`, `/web research <task>`, `/web crawl <url>`, `/web map <url>`
- Stable IDs: `cmd.chat.web.search`, `cmd.chat.web.extract`, `cmd.chat.web.research`, `cmd.chat.web.crawl`, `cmd.chat.web.map`
- Optional: `cmd.chat.web.help` [XV2-FIX] — PROPOSED only; `cmd.chat.web.help` does NOT exist in canonical docs. Treat as proposed, not canonical.
- Natural language routes through same dispatcher
- Do NOT flatten into separate top-level slash families (`/search`, `/crawl`)

#### /skill Invocation — ✅ [GAP-RESOLVE] LOCKED — Decision #14: Triple-Path Discovery
- **Skills panel**: browse, filter, and invoke skills directly from the GUI
- **Slash command**: `/skill <skill_name> [args]` — `/skill` with no args lists available skills
- **Natural language**: agent detects skill-appropriate requests and invokes automatically
- No subcommand family for MVP (no `/skill use`, `/skill list`, `/skill show` subcommands). All three paths invoke the same `invoke_skill` tool contract.
- ~~`/skill use <skill-id>`, `/skill list`, `/skill show <skill-id>` — [XV2-FIX] subcommand shape (`use|list|show`) is PROPOSED only; canonical docs define only lightweight `/skill` with no subcommand family. Do not treat this shape as locked.~~
- Lightweight helper, NOT full management family
- Management remains in Agent Config > Skills
- Natural-language invocation routes same dispatcher

#### /web Bare Command Behavior [XV-ADD]
- `/web` with no subcommand opens inline help/autocomplete, does NOT immediately run a default operation
- Parsing rules: bare `/web` → shows help; subcommand is required; URL normalization applies; parse failure → shows usage

#### /cancel Migration Contract [XV-ADD]
- `/cancel` resolves internally to `cmd.chat.stop`
- It is a deprecated alias
- Presentation: shown as deprecated in slash catalog, distinct from active commands

#### Slash Settings/Catalog Behavior [XV-ADD]
- Reserved commands shown as non-editable in catalog
- Deprecated aliases shown distinctly (visual separation from active commands)
- `/web` is discoverable in catalog

#### /worktree Aliases [XV2-ADD]
- `/worktree` is reserved in `UI_Command_Catalog.md` but was missing from this ledger's unified reserved set. ADD to canonical built-in slash set above when reconciling.

#### User Command Namespace [XV-ADD]
- `/x-...` prefix is RESERVED for user-defined custom commands

#### Feature-List Drift [XV-ADD]
- `feature-list.md` also omits `/web` — needs reconciliation

#### Natural-Language Intent Mapping [XV-ADD]
- NL intents and slash commands hit the same dispatcher
- Mapping table:
  - "search the web for X" → `websearch`
  - "extract this page" → `webextract`
  - "read this URL" → `webfetch`
  - "research topic" → `webresearch`
  - [AUDIT3-FIX] "read this site" / "read this URL" / "fetch this page" → `webfetch` (routes to native Site Reader `Reading Site` path, NOT to `websearch` or provider `extract`). Reading intents MUST resolve to `webfetch`, not `websearch`.

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
- Import: drag-and-drop skill folders/files, file-browser import, supported archives (`.zip`, possibly `.tar.gz` — not confirmed [XV-FIX])
- No remote URL/git import in v1 (remote = Catalog/Skill Store path)
- Import flow: unpack → auto-populate metadata from frontmatter → validate → surface warnings
- Portable skills presumed importable by default; validation determines readiness

#### Skill Source/Readiness Model (LOCKED)
- Source types: `bundled`, `catalog_installed`, `manual_import`, `project_local`, `global_local`, `shadowed`
- [AUDIT3-FIX] **`pm_enhanced` source type (LOCKED)**: Add `pm_enhanced` to the skill source type enum. Identifies skills where PM ships an enhanced/customized variant of an upstream portable skill. Display as a visible badge in Skills catalog UI. Ordering: `bundled` > `pm_enhanced` > `catalog_installed` > `manual_import` > `project_local` > `global_local` > `shadowed`.
- Readiness/status: `ready`, `ready_with_warnings`, `invalid`, `shadowed`, `disabled`
- [AUDIT3-FIX] **5-state vocabulary confirmed (LOCKED)**: Cross-reference of old ledger confirms identical 5-state set: `ready`, `ready_with_warnings`, `invalid`, `shadowed`, `disabled`. No 6th state exists. Vocabulary locked.
- Badges: `referenced_by_persona`, `auto_invokable`, `requires_missing_capability`, `catalog_update_available`

#### Skill Store vs Skills Page (LOCKED)
- **Skill Store** = browse/install surface only (launched from Skills page)
- **Skills page** = management surface for installed/active/manageable entries
- Management actions in Skills page: enable/disable, inspect/preview, edit source, revalidate, remove/uninstall, open source location

#### Skill Tool Runtime Contract (LOCKED)
- Output envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, `metadata?`
- Built-in/bundled skills first-class in same registry model
- Resource/file sampling for discoverability only (not recursive dumps)

#### Single SKILL.md Import [XV-ADD]
- Skills import via single `SKILL.md` file with auto-generated folder structure

#### Skills Auto-Invocation Rules [XV-ADD]
- Do NOT auto-invoke skills with `invalid` or warning-blocked status
- `auto_invokable` flag with context matching determines when skills are automatically suggested/invoked
- [AUDIT3-FIX] **NL/Slash Discovery Scoping for `ready_with_warnings` (LOCKED)**: Discovery surfaces BOTH `ready` and `ready_with_warnings` entries (with visible ⚠ annotation). **Auto-invocation** (agent-initiated, no user gesture) restricted to `ready` only. `invalid` entries excluded from both surfaces entirely. Summary: discovery = ready + ready_with_warnings (annotated); auto-invoke = ready only.

#### Natural-Language Skill Routing [XV-ADD]
- NL requests route through canonical skill registry, not filesystem discovery
- [AUDIT3-FIX] **Dynamic skill descriptions (LOCKED)**: The `skill` tool's runtime tool-description MUST dynamically expose names and descriptions of currently runtime-ready skills. When PM presents the `skill` tool to the model, the description includes the live roster of active skill names and summaries from manifests. Updates whenever skill registry changes (import, enable, disable, revalidate).

#### Skill Permission Model [XV-ADD]
- `skill` permissions operate over skill IDs, not filesystem paths
- Permission grants are identity-based
- [AUDIT3-FIX] **Skills must respect FileSafe path constraints**: Skill resource paths must only disclose paths within allowed roots. If a skill attempts to access paths outside the FileSafe allowlist, normal blocked-action recovery applies. Skill permission grants operate over canonical skill IDs, NOT raw filesystem paths — but underlying file operations within the skill still pass through FileSafe.

#### Agent Config Tab Model Detail [XV-ADD]
- Personas tab: persona list, persona editing, cross-links to provider settings
- [AUDIT3-FIX] **Personas tab expanded spec (LOCKED)**: Three content categories: (1) **Persona list and editing** — create, edit, delete, reorder; (2) **Runtime preferences** — per-persona behavioral preferences (response style, verbosity, default model, tool posture, output format defaults); applied automatically when persona is active; (3) **Skill refs** — skills associated with/activated for this persona; clicking cross-links to Skills tab. Cross-links to provider settings remain.
- Skills tab: installed skills management, catalog link, skill status
- Non-goals: Agent Config does NOT manage authentication, provider keys, system health, or global rules (those stay in Settings)

#### Skill Tool Input Contract [XV-ADD] — ✅ [GAP-RESOLVE] LOCKED — Decision #1
```
invoke_skill {
  skill_id: string,
  input: Record<string,any>,
  context?: {
    project_root: string,
    active_file?: string,
    selection?: string,
    conversation_id: string
  },
  timeout?: number  // ms, default 30000
}
→ {
  status: "success" | "error" | "partial",
  output: any,
  artifacts?: Artifact[],
  error?: { code: string, message: string }
}
```
Skill defines its own `input` schema via manifest. PM validates against schema before invocation.

#### cmd.chat.delete_message — Policy vs Existence [XV2-FIX]
- Canonical `UI_Command_Catalog.md` defines `cmd.chat.delete_message` as an existing command ID.
- Part E's "NO delete action (explicitly locked by user)" means the command is **policy-denied by default**, NOT that the action/command doesn't exist.
- The command exists canonically; it is simply disabled by user-locked policy in v1.

#### /skill Scope Boundary [XV-ADD]
- Explicit prohibition: no `/skills` management command family
- Skill management is via Agent Config UI only

#### Skills Acceptance Checklist [XV-ADD]
1. Single `SKILL.md` import works
2. Auto-invocation respects readiness status
3. NL routing finds registered skills
4. Permissions on skill IDs not filesystem paths
5. Agent Config shows skills tab
6. Deprecated commands handled correctly
7. Catalog shows skill status badges

#### Skills Reconciliation Landing Zones [XV-ADD]
- 6 docs need skill-related updates:
  1. `Skills_System.md`
  2. `Tools.md`
  3. `FinalGUISpec.md`
  4. `Permissions_System.md`
  5. `assistant-chat-design.md`
  6. `UI_Command_Catalog.md`

### PART K: RECOVERED PERMISSIONS ARCHITECTURE (from w-20260316-160450)

#### Core Permission Model (LOCKED)
- Three permission actions: `allow` / `ask` / `deny`
- Unknown/unrecognized tool default = `ask`
- Immutable permission snapshot finalized at attempt/run start
- Historical runs show frozen permission snapshot that governed them — NEVER recomputed from current settings
- Finalize effective permission snapshot at run start / project switch

#### Canonical Tool Permission Keys (LOCKED)
Full key table (16+ keys):
- Built-in: `bash`, `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch`, `logread`, `repo.import`, `lsp` [XV-FIX: added `list` — used in presets but was missing from key table]
  - [XV2-ADD] **`read` key special behavior**: `read` has security-critical `.env` deny defaults per `Permissions_System.md` §7.1: `*.env` = deny, `*.env.*` = deny, `*.env.example` = allow. These defaults apply regardless of preset or mode.
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
- [XV2-FIX] **Canonical docs requiring update**: BOTH `Permissions_System.md` §10.4 (line 596 still denies everything except read tools) AND `Tools.md` preset tables (Run_Modes.md says ask/plan allow no project-file mutation but over-broadly denies non-mutation tools). Both locations must be updated to match the corrected auto-deny set above.

#### APPROVAL LADDER CONFLICT — 3-Way Incompatibility [XV2-FIX]
- **THREE incompatible models remain live simultaneously:**
  1. **Ledger Part K** (below): `once` / `for session` / `always` (durable) / `deny` — 4-tier
  2. **Permissions_System.md §6**: `once` / `always` / `reject` — where `always` is session-scoped only, non-persistent
  3. **assistant-chat-design.md**: `once` / `for session` / `deny` — 3-tier, no durable option
- **DESIRED state** (this ledger's position): 4-tier ladder with durable `always` creating persistent permission rules (project or global scoped)
- **CURRENT canonical state**: Neither canonical doc supports durable `always`; Permissions_System.md's `always` is session-scoped; assistant-chat-design.md has no `always` at all
- **⚠️ REQUIRES RECONCILIATION**: This conflict must be resolved during reconciliation. Both canonical docs must be updated to match the 4-tier model, or the ledger must be revised downward.
- [RECOVERY-FIX] **Implementation target: 4-tier model.** The 4-tier ladder (`once` / `for session` / `always`-durable / `deny`) is the LOCKED DESIRED STATE for this ledger. Reconciliation MUST update both `Permissions_System.md` and `assistant-chat-design.md` to reflect the 4-tier model. Do NOT implement the 3-tier model found in canonical docs — those docs are out of date. The reconciliation pass must bring canonical docs in line with the 4-tier target before implementation begins.

#### Approval Ladder (LOCKED — EXPANDED)
- Current ladder too small: only `once` / `for session` / `deny`
- Correct ladder: `once` / `for session` / `always` (durable rule) / `deny`
- `once` = one invocation only
- `for session` = ephemeral session-cache allow rule
- `always` = persistent permission-rule creation through canonical permissions storage
- `deny` = reject this invocation
- When choosing `always`, surface scope selection: **project** or **global**
- Do NOT collapse durable approval into ad-hoc allowlists
- [AUDIT3-FIX] **Approval Card Exact Button Wording (LOCKED)**:
  - **`Once`** — "Approve only this invocation"
  - **`For Session`** — search/research: "Approve this tool for the rest of the current session" (pattern: `*`); extract/crawl/map/fetch: "Approve this host/site for the rest of the current session" (pattern: `https://host.example/*`)
  - **`Always`** — create durable permission rule (surfaces project/global scope selection)
  - **`Deny`** — reject this invocation AND reject any other pending asks in the same batch/session. This cascades to queued permission requests in the same approval batch — prevents users from having to deny a stream of related requests one by one.
  - ⚠️ Deny cascade semantics: when user clicks Deny, the runtime must also reject other pending asks in the same session per the existing reject-all-pending contract.

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
- [XV2-ADD] **Gap note**: Session-approval patterns below are defined for all 6 web tools, but canonical `Permissions_System.md` only provides examples for `webfetch`/`websearch`. The remaining 4 tools (`webextract`, `webresearch`, `webcrawl`, `webmap`) are ledger-defined patterns pending canonical adoption.
- **Search/research tools** → tool-wide wildcard (`*`) pattern
  - `websearch`, `webresearch`: session pattern = `*` (host cannot be known upfront in search operations)
- **URL-scoped operations** → normalized host/domain pattern
  - `webfetch`, `webextract`, `webcrawl`, `webmap`: session pattern = `https://host.example/*`
  - Rationale: URL-scoped read operations where host scoping is understandable and safer
- Approving `webcrawl` "For Session" auto-approves crawl/map/extract/fetch matching same host pattern
- Approving `webresearch` "For Session" does NOT create broad allow for unrelated tools
- [AUDIT3-FIX] **Per-Operation Approval-Card Summary Text Templates**:
  - `websearch` → show tool name + query preview
  - `webfetch` → show tool name + target host/URL
  - `webextract` → show tool name + target host/URL
  - `webresearch` → show tool name + task summary + estimated source count when available
  - `webcrawl` → show tool name + root URL + page/depth caps
  - `webmap` → show tool name + root URL + page/depth caps
  - Session-approval pattern derivation: search/research → `*` tool-wide session allow; extract/crawl/map/fetch → host-scoped pattern like `https://docs.example.com/*`

#### Permission Preset Reconciliation (LOCKED — FULL DETAIL)
- Presets must stop being narrower than product's own planning/research features
- **Read-only preset**:
  - Allow: `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch`, `skill`, `lsp` (read-only), `question`, `todoread`, `todowrite`, `capabilities.get`
  - Ask: `webfetch`, `websearch`, `webextract`, `webresearch`, `webcrawl`, `webmap`, `logread`, `task` [XV2-FIX] — added explicit dispositions for all 6 web tools; previously only `webfetch`/`websearch` were listed (matches gap flagged by XV-ADD note below)
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

#### Approval Ladder Scope Detail [XV-ADD]
- When user chooses `always`, surface scope selection: **project** or **global**
- Do NOT collapse durable approval into ad-hoc FileSafe allowlists
- [AUDIT3-FIX] **Suggested-pattern pre-population for durable `always` (LOCKED)**: When user chooses durable `always`, PM MUST pre-populate/suggest a pattern derived from invocation context:
  - `websearch` / `webresearch` → suggested pattern: `*` (host unknown upfront)
  - `webfetch` / `webextract` → suggested pattern: `https://<actual-host>/*` (derived from URL)
  - `webcrawl` / `webmap` → suggested pattern: `https://<actual-root-host>/*` (derived from `root_url`)
  - User may edit the suggested pattern before confirming; suggestion is a convenience default, not a lock.
- [AUDIT3-FIX] **No-active-project conditional**: When no active project context exists, the scope selection for durable `always` MUST only offer **Global** — **Project** option is hidden/disabled. Prevents orphaned project-scoped rules with no project to bind to.
- Durable `Always` = canonical rule creation, not session cache or persona mutation

#### Persona Non-Mutation Rule [XV-ADD]
- Approval cards must NOT mutate Persona permission profiles
- In-chat approval is session/project-scoped, never persona-scoped (v1)

#### Permission Snapshot Retry Rule [XV-ADD]
- When retrying after approval/policy/mode/project change, create a NEW permission snapshot
- Old snapshot stays frozen for historical record
- Triggers for re-snapshot: project switch, mode change, approval grant, policy edit

#### Approval Source Disclosure [XV-ADD]
- Approval UI must show which layer (project defaults, global defaults, user override, admin policy) governs each tool's permission state

#### Read-Only Preset Web Tools [XV-ADD]
- Read-only preset needs explicit dispositions for ALL 6 web tools: `webfetch`, `websearch`, `webextract`, `webresearch`, `webcrawl`, `webmap` — not just the first two

#### Search/Research Future-Pattern Caveat [XV-ADD]
- MVP uses wildcard session-approval; advanced editor may later gain query-pattern support

#### FinalGUISpec.md Broken Cross-References [XV2-ADD]
- `FinalGUISpec.md` cites §7.4.16 (Permissions), §7.4.10 (Skills), and §7.16.2 (slash commands), but **these section numbers do not exist** in the current canonical document.
- Impacted areas: any doc or ledger entry referencing FinalGUISpec section numbers for Permissions, Skills, or slash commands should be treated as broken until section numbers are verified/updated.
- Flag for reconciliation: FinalGUISpec.md section numbering needs audit.

#### Permissions/Logging/Subagents Reconciliation — Acceptance Checklist (ATOMIC GATE) [AUDIT3-FIX]
- **All 8 items MUST pass before the permissions/logging/subagents reconciliation packet is complete:**
  1. ☐ **Durable approval path exists** — 4-tier ladder implemented in canonical docs
  2. ☐ **Blocked states surface recovery actions** — every blocked tool state shows a direct recovery path
  3. ☐ **Historical runs show frozen snapshots** — never recomputed from current settings
  4. ☐ **Both audit surfaces exist** — in-thread transparency AND dedicated log/audit surface
  5. ☐ **Open in Terminal focuses same session** — not a new one
  6. ☐ **Long-running promotes to Terminal** — not bloating chat
  7. ☐ **Subagent usage visible/auditable** — which subagent/persona used, why, what task
  8. ☐ **Task lifecycle persists** — in thread history and storage with defined event schema
- This checklist is the exit gate. Partial completion = NOT DONE.

### PART L: RECOVERED SUBAGENT / TASK BEHAVIOR (from w-20260316-160450)

#### Subagent Defaults (Direction established but contract details still thin [XV-FIX])
- **Aggressive by default**: always use when explicitly asked; prefer for bigger multi-step work; proactively use whenever clear specialist fit
- Do NOT require explicit `/task` or subagent invocation for work that benefits from specialization
- Later GUI settings may tune aggressiveness; default remains aggressive not conservative
- Chat/UI should disclose: which subagent/persona used, why, what task it owned
- Needs: resumability/stable task id, inherited permission shaping, hidden vs inaccessible subagents, nested task behavior [XV-FIX]

#### Task Tool Runtime Contract (LOCKED — FULL SPEC)
- [XV2-FIX] **Canonical status note**: The exact I/O fields below (`subagent_type`, `task_id`, `resumed`, `runtime_snapshot`, etc.) are PROPOSED by this ledger. Canonical `Tools.md` only describes behavioral requirements, not this exact envelope. Treat field-level detail as PROPOSED, not canonical, until `Tools.md` is updated.
- **Input**: `description`, `prompt`, `subagent_type`, `task_id?` (resume/continue), `command?`
- **Output**: `task_id`, `subagent_type`, `resumed: boolean`, `result_text`, `runtime_snapshot?`
- **Error**: invalid `subagent_type` = structured error
- **Visibility**: inaccessible/denied subagents should NOT be advertised as selectable from caller's effective permission view
- **Permission inheritance**: subagents inherit parent permissions with enforced overrides
- **Default denials for subagents**:
  - `todowrite` / `todoread` = denied by default unless explicitly re-enabled by run config
  - Nested `task` use = denied by default unless target subagent explicitly permits it
  - [RECOVERY-FIX] `question` = denied by default; subagents must NOT independently spawn question flows — per `assistant-chat-design.md` §15.2 ("Children do not question the user directly by default"). Subagents must escalate to the parent orchestrator to surface questions to the user. This is FINDING-X01 from the cross-validation audit.
  - [AUDIT3-FIX] **Architectural principle / product rule**: The `question` denial for subagents is an architectural principle, not a soft runtime preference. Runtime must enforce at tool-dispatch layer. Any run-config override granting `question` to a subagent must be explicit, logged, and visible (audit transparency). This is a product-level invariant, not a per-run tunable.
- **Resume**: resumed tasks continue same delegated session identity, NOT fresh spawn

#### Crew Delegation Model (LOCKED)
- Same normalized TODO schema works for ALL execution types: single-agent, subagent, crew
- `owner_hint` bridges planning and execution: may be advisory at plan time, becomes effective delegated owner during execution
- Progress rows can surface delegated owner changes without rewriting original TODO identity
- Progress disclosure without rewriting TODO identity is a key constraint

#### Task Lifecycle Persistence [XV-ADD]
- Task lifecycle events persist in thread history and storage
- Note: old ledger left this as acceptance criterion, not fully locked
- Implementation must define event schema

#### Task Lifecycle States [XV-ADD] — ✅ [GAP-RESOLVE] LOCKED — Decision #15
- **6 states**: `pending → running → completed | failed | cancelled | timed_out`
- **Failure**: emits `task.failed` event with error; parent agent decides retry
- **Timeout**: configurable per-task; default 120s regular tasks, 300s long-running tasks
- **Retry**: parent agent responsibility, not automatic; max 2 retries recommended

#### Automatic Subagent Session [XV-ADD]
- Subagent sessions are created automatically when orchestrator delegates
- No manual session creation required

#### Specialist-Fit Guardrail [XV-ADD]
- Subagent delegation must be "specialist-fit, not arbitrary fan-out"
- Orchestrator should only delegate when the task matches a specialist's declared expertise

#### Subagent Question-Spam Prevention [XV-ADD]
- Subagents must NOT independently spawn question flows without parent orchestrator approval/awareness

#### Permission Preset Tables [XV-ADD]
- **Read-only**: allow `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch`, `skill`, `lsp`, `question`, `todoread`, `todowrite`, `capabilities.get`
- **Plan**: all Read-only + ask: `webfetch`, `websearch`, `webextract`, `webresearch`, `webcrawl`, `webmap`, `logread`, `task`. EXPLICITLY: web tools at `ask`, NOT auto-deny
- **Full**: allow all tools except: deny nested `task` by default, deny `media.generate` by default

#### Crew Delegation owner_hint Mapping [XV-ADD] — ✅ [GAP-RESOLVE] LOCKED — Decision #2
**Mapping algorithm:**
1. `owner_hint` is a string tag (e.g., `"code-review"`, `"test-writer"`, `"researcher"`)
2. PM checks agent config `crew.roles` map → `{ "code-review": { provider, model, persona } }`
3. No mapping found → fall back to current session's provider/model (same agent, different persona)
4. Mapping found but provider unavailable → error with `capability_unavailable`; do NOT silently fall back
5. Partial match NOT supported in MVP — exact match only

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

#### LSP Op-Name Vocabulary Reconciliation [XV2-ADD]
- Tools.md §3.4.1 uses short names: `definition`, `references`, `implementation`.
- Tools.md §3.5E and LSPSupport.md use long names: `goToDefinition`, `findReferences`, `goToImplementation`.
- This ledger (Part M above) uses the long-name vocabulary.
- **Both vocabularies refer to the same operations.** Canonical docs must pick ONE and alias the other. Until resolved, treat long names as the ledger-canonical form and short names as the Tools.md shorthand.

#### LSP/Codesearch Separation Boundary [XV-ADD]
- `codesearch` MUST remain separate from direct `lsp` operations. They are different tools with different scopes: `codesearch` is multi-tier search (Tantivy full-text index + LSP symbol search + grep fallback); `lsp` is language-server symbol operations (go-to-definition, references, hover, etc.). Do NOT merge or alias them. [XV2-FIX — corrected from "project-wide text search" to multi-tier description matching canonical codesearch architecture]

#### LSP Chat/UI Seam [XV-ADD]
- LSP also integrates into chat via code-block hover/go-to-definition actions and chat/editor cross-referencing. This is a UI seam, not just a tool-surface concern. LSP-backed actions in chat must respect the same permission and disclosure rules as direct `lsp` tool calls.

- LSP operations have no defined output/error envelope or tool-result schema — flagged as INCOMPLETE [XV-ADD]
- LSP reconciliation status: needs MUST CHANGE treatment (not just reconciliation) per cross-validation consensus [XV-ADD]
- [XV2-FIX] Clarification: The operation SET is partially reconciled (Part Q confirms `rename` extension is reconciled), but the output/error envelope and tool-result schema remain unresolved. Part Q's "RECONCILED" status applies to the op surface only, not the full contract. See Part Q line "LSP surface ops — RECONCILED with PM-extended rename" — that reconciliation is scoped to which ops exist, not how they respond.

### PART N: RECOVERED MCP CONTRACT (from w-20260316-160450)

#### Server Config Model (LOCKED)
- **Shared fields**: `enabled`, `timeout_ms`
- **Local server**: `type: "local"`, `command: string[]`, `environment?`
- **Remote server**: `type: "remote"`, `url`, `headers?`, `oauth?: object | false`

#### Runtime Status Model (LOCKED)
- **Auth state**: `authenticated`, `expired`, `not_authenticated`
- **Connection/effective state**: `connected`, `disabled`, `needs_auth`, `needs_client_registration`, `failed`

> **[XV2-ADD] Auth enum vocabulary conflict**: MCP auth state names (`authenticated`/`expired`/`not_authenticated`) conflict with provider auth vocabulary (`LoggedIn`/`LoggedOut`/`AuthExpired`/`AuthFailed`). These are two distinct enum sets for overlapping concepts. Alignment is needed — either unify into one canonical enum or document an explicit mapping between them.

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
- MCP contract partially specified. Old ledger notes 'not fully packetized.' Auth/config/override/debug surfaces still need expansion. [XV-FIX]

#### MCP Tool Exposure Semantics [XV-ADD]
- MCP servers expose tools that must be explicitly enabled/disabled. Override layering: project > global > org > default. Each tool has an enabled/disabled toggle independent of server connection state.
- Tool visibility respects the same requested/effective disclosure as all PM tools.

> **[XV2-ADD] Org-layer discrepancy**: The override layering above includes `org` but canonical permission precedence in Tools.md does NOT include an `org` layer. Either Tools.md needs to add `org`-level overrides, or this ledger's layering should drop `org`. Flag for reconciliation.

#### MCP Tool Naming Format [XV2-ADD]
- Tools.md §8.6 specifies that MCP tools are exposed with the naming format `{server_slug}_{tool_name}` (e.g., `github_search_repositories`).
- Prefix wildcard matching is supported: enabling/disabling `github_*` affects all tools from the `github` server.
- This is implementation-critical for the override layering above — tool-level enable/disable must resolve against the `{server_slug}_{tool_name}` canonical name.

#### MCP Auth/Status/Debug Surface [XV-ADD]
- MCP needs: auth flow surfaces (OAuth, API key), connection status indicators, debug/inspection surfaces (request/response logging), credential invalidation handling.
- Auth flow must surface: OAuth redirect, API key entry, token refresh, credential expiry notification.
- Status indicators: connected, disconnected, authenticating, error — visible in server management UI.
- Debug surface: request/response logging with secrets scrubbed, latency metrics, error traces.

#### MCP Landing Zones [XV-ADD]
- MCP docs span `Tools.md` AND `FinalGUISpec.md` (for UI surfaces). Consider whether a dedicated MCP SSOT document is needed vs distributing across existing docs.
- Current distribution: tool registration → `Tools.md`, UI surfaces → `FinalGUISpec.md`, permissions → `Permissions_System.md`, storage → `storage-plan.md`.

#### MCP Tool Registry Participation [XV-ADD]
- MCP tools participate in PM's central tool registry alongside built-in, provider, custom, and skill-backed tools. Shared policy and seglog events apply.
- MCP tools emit the same `tool.invoked` / `tool.denied` seglog events as all other tool types.
- MCP tool permissions follow the same layered override model as built-in tools.

#### MCP Reconciliation Map [XV-ADD]
- Currently MISSING — reconciliation maps exist for Perms/Question/TODO/Web/Runtime but NOT for MCP.
- Needed reconciliation targets:
  - `Tools.md` — tool registration, discovery, enable/disable semantics
  - `FinalGUISpec.md` — server management UI, connection status, auth flow surfaces
  - `Permissions_System.md` — MCP tool permissions, approval gating
  - `storage-plan.md` — server config persistence, credential storage, derived adapter config

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
- `requested_model_provider_id` / `effective_model_provider_id` [XV2-FIX — present in storage-plan.md lines 271-311 and Contracts_V0.md but was missing from this list]
- `provider_family_id` [XV2-FIX — present in canonical docs but was missing from this list]
- `requested_runtime_platform_id` / `effective_runtime_platform_id` [XV2-FIX — present in canonical docs but was missing from this list]
- `requested_billing_entity_id` / `effective_billing_entity_id` / `effective_billing_entity_label` [XV2-FIX — present in canonical docs but was missing from this list]
- `effective_entitlement_class` [XV2-FIX — present in canonical docs but was missing from this list]
- `connection_profile_id` [XV2-FIX — present in canonical docs but was missing from this list]

> **[XV2-FIX] LOCKED-HARD integrity note**: The above additions were already present in `storage-plan.md` (lines 271-311) and `Contracts_V0.md` but were omitted from this ledger's field list. The LOCKED-HARD claim was overstating completeness. List is now aligned with canonical sources.

> **[XV2-ADD] Persona field adoption gap**: Canonical docs do NOT yet persist `requested_persona` / `effective_persona` in core contracts despite this section locking them. There is a landing gap — these fields need to be adopted into `Contracts_V0.md` and `storage-plan.md` before the LOCKED-HARD claim is fully substantiated.

#### Multi-Account (LOCKED — first-class)
- Same-provider accounts are NOT interchangeable
- Switching is provider-aware, account-aware, role-aware
- Manual set-active is override/debug only, not primary model
- Usage/pressure/switching must plug into existing Usage model
- Account-selection fields: `requested_account_policy`, `requested_account_id?`, `requested_account_binding` (none | preferred | required), `effective_account_id?`, `account_switch_reason?`

#### Still-Absent Runtime Fields — Corrected [XV2-FIX]
> **[XV2-FIX] Partial correction**: The original "still absent" claims were partially wrong. `requested_account_id`, `execution_role`, `projection_freshness`, and `projection_health` ARE present in `storage-plan.md` (lines 281-316). Corrected list below separates genuinely absent fields from those already landed.

- **Already present in canonical docs** (no longer "still absent"):
  - `requested_account_id` — in storage-plan.md
  - `execution_role` — in storage-plan.md
  - `projection_freshness` (current | refreshing | stale) — in storage-plan.md
  - `projection_health` (healthy | degraded | unavailable) — in storage-plan.md
- **Genuinely still absent from canonical docs**:
  - `requested_account_binding` (none | preferred | required)
  - `operational_identity`
- **Recommendation**: if adopted, land genuinely-absent fields first in shared runtime contracts (`Contracts_V0.md`, `Prompt_Pipeline.md`, `Multi-Account.md`, `storage-plan.md`); do NOT let feature-specific docs invent shadow names

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
- **Chat MUST NOT invent assistant-local substitutes** (9+ forbidden patterns) [XV-FIX count corrected from 6]:
  - `requested_persona_id` / `effective_persona_id` → use canonical `requested_persona` / `effective_persona`
  - `active_model` / `actual_model` → use canonical `effective_model`
  - `resolved_account` / `current_account` → use canonical account fields
  - `chat_role_identity` → use canonical `execution_role`
  - `assistant_runtime_state` → use canonical runtime snapshot
  - `projection_trust` → use canonical `projection_freshness` / `projection_health`
  - `selection_reason` → use canonical `adapter_selection_reason` or `account_switch_reason` [XV-ADD]

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
- [AUDIT3-FIX] `operational_identity` canonicalization gap — must be: (1) defined in `Contracts_V0.md` or `Prompt_Pipeline.md` with clear semantics; (2) added to `storage-plan.md` persisted field set; (3) referenced consistently across `Multi-Account.md`, `CLI_Bridged_Providers.md`, `Provider_OpenCode.md`. Until canonicalized, feature-specific docs MUST NOT invent shadow names for this concept.
- `Plans/Personas.md` §10.11B lists `requested_persona_id`/`effective_persona_id` — contradicts `Contracts_V0.md` canonical naming lock
- User explicitly locked that `_id` suffix variants must NOT become parallel canonical fields
- **Resolution**: reconciliation must fix `Personas.md` to use canonical names only

#### Blocked-Outcome Field Contract [XV-ADD]
- `blocked_reason_code` and `allowed_action_ids[]` must be present in blocked-action responses. These link the permission denial to the recovery UI.
- Blocked responses must be machine-actionable: the UI uses `allowed_action_ids[]` to render available recovery paths (e.g., "Request approval", "Switch account", "Change mode").

#### Retry Resnapshot Rule [XV-ADD]
- After approval/policy/mode/project change, retry MUST create a NEW permission snapshot. Old snapshot stays frozen.
- Triggers for resnapshot: project switch, mode change, approval grant, policy edit, new session.
- Old snapshot remains immutable for historical audit; new snapshot governs the retried attempt.

#### Transport-Invariance Rule [XV-ADD]
- Direct, CLI-bridged, and server-bridged access must preserve the same identity contract. Transport layer must not alter runtime identity semantics.
- Identity fields, permission snapshots, and disclosure rules are transport-agnostic.

#### Do-Not-Overfit Rule [XV-ADD]
- Plugin/MCP/container constraints must NOT become PM-native assumptions. PM's identity model is its own; external system constraints are external.
- If an external system (e.g., MCP server, container runtime) imposes identity constraints, PM adapts at the boundary — it does NOT reshape its core identity model to match.

#### Verified Canonical Anchor Docs [XV-ADD]
- `CLI_Bridged_Providers.md` and `Provider_OpenCode.md` are confirmed canonical docs that must be in the impacted-docs register.
- They need expanded identity bundle and correlation/identity specs.
- Any runtime identity contract change must be reconciled against these anchor docs.

#### Provider Baseline Capabilities [XV-ADD]
- No-silent-cross-fallback: auth must not silently try another account when the requested account fails.
- Capability-based routing: route to provider based on declared capabilities, not hardcoded provider lists.
- Attempt/message boundaries: clear delineation of what constitutes one attempt (one prompt-response cycle with immutable snapshot).

#### PM ≠ OpenCode Modes [XV-ADD]
- PM has explicit product-level Ask/Plan modes; OpenCode handles differently.
- OpenCode must NOT be normative for PM mode semantics. Do not justify PM behavior by OpenCode analogy.
- PM's mode model is its own canonical design; OpenCode is reference material only.

#### Runtime Cross-Feature Enforcement [XV-ADD]
- `question`, `todowrite`, `todoread`, web activity cards, and assistant runtime disclosures must ALL obey the shared owner/consumer boundary.
- If chat features need runtime-state behavior, extend owner docs first rather than inventing assistant-local schema.
- This applies to any future feature that surfaces runtime identity — it consumes, never re-owns.

#### History Non-Rewrite Rule [XV-ADD]
- Later project/global rule edits must NOT rewrite historical attempts. Historical views must show frozen permission/runtime snapshots that governed them, not current settings.
- This is a hard rule: historical fidelity is non-negotiable for audit integrity.

#### Runtime Field List Consistency [XV-FIX]
- `effective_account_label`, `effective_provider_identity`, `effective_project_id` must ALL be present in: canonical field list (PART O), reconciliation map, AND decisions section. Verify cross-section consistency.

- Still-absent fields landing priority: land them first in shared runtime contracts (`Contracts_V0.md`, `Prompt_Pipeline.md`, `Multi-Account.md`, `storage-plan.md`) BEFORE any feature-specific docs depend on them. [XV-ADD]

#### Frozen-History Display Rules [XV-ADD]
- Never collapse these into a single status blob — they are separate display dimensions:
  - inherited vs overridden
  - requested vs effective
  - honored / skipped / clamped
  - current / stale / degraded / unavailable

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
4. **Plan/todo**: `chat.plan_todo_updated` [XV2-ADD — PROPOSED: this event is NOT defined in canonical Tools.md event list; treat as proposed until landed]
5. **Subagents**: `chat.subagent_*` family

> **[XV2-ADD] Subagent event naming conflict**: This ledger uses `chat.subagent_*` prefix (e.g., `chat.subagent_spawned`), but Tools.md defines events without the `chat.` prefix: `subagent.spawn_requested`, `subagent.spawn_completed`, etc. The `subagent.*` prefix (no `chat.`) should be treated as canonical per Tools.md. This ledger's `chat.subagent_*` references need reconciliation to match.
6. **HITL/approval**: approval/ask flow events (once/session/always/deny with source/layer)
7. **Rollback**: state rollback events
8. **Persona/runtime snapshots**: effective runtime record snapshots
9. **Background runs**: long-running/watch-mode commands (same card model, NOT separate "background" card type)
10. **Permission snapshots**: immutable snapshots frozen at attempt start
- [AUDIT3-FIX] **`web.operation.*` event family PROHIBITION (LOCKED)**: Do NOT create a separate parallel `web.operation.*` seglog event family for web operations. All web operation events MUST use the existing `tool.invoked` / `tool.denied` event family with web-specific fields under `payload.meta`. A separate `web.operation.*` family is only permissible if later analytics truly require it — this is an explicit prohibition against preemptive creation.

#### Web-Operation Audit Payload (LOCKED)
Additive fields under `payload.meta` for all web tool invocations:
- `web_operation`: `search` | `extract` | `research` | `crawl` | `map` | `read`

> **[XV2-ADD] `read` ↔ `webfetch` mapping**: The `read` value in `web_operation` enum maps to the `webfetch` tool in the canonical tool set. Audit payloads use `read` as the semantic operation name; the underlying tool invocation is `webfetch`. Consumers must map between these vocabularies.
- `web_input`: structured object with subfields `query?`, `url?`, `task?`, `root_url?` (canonical shape per old ledger) [XV-FIX — replaces flat `web_input_preview` string as canonical; preview is a derived display field]
- `web_input_preview?`: truncated string derived from `web_input` for display/audit summary
- `support_tier`: `native` | `pm_composed` | `unsupported` (NOTE: canonical spelling is `pm_composed` with underscore, NOT `pm-composed`) [XV-FIX — spelling standardized]
- `execution_path`: routing path taken — concrete examples: `provider_search_native`, `pm_search_plus_site_reader`, `pm_research_composed` [XV-ADD]
- `requested_adapter_id?`: what was requested
- `effective_adapter_id?`: what actually executed
- `adapter_selection_reason?`: why this adapter was chosen
- `provider_fallback_occurred`: boolean
- `provider_fallback_summary?`: fallback chain if triggered
- `source_count?`: number of sources returned
- `result_quality_hint`: `search_snippets_only` | `extracted_pages` | `site_reader_pages` | `research_synthesis` [XV-ADD]
- `projection_freshness`: `current` | `refreshing` | `stale` (required per old ledger for every web operation) [XV-ADD]
- `projection_health`: `healthy` | `degraded` | `unavailable` (required per old ledger for every web operation) [XV-ADD]
- `sources_ref?`: pointer/ref to normalized sources set when too large for inline [XV-ADD]
- [AUDIT3-FIX] **`warnings_count?` and `error_code?` in common audit payload (LOCKED)**: Two optional fields in the common `payload.meta` shape for ALL web operation audit events:
  - `warnings_count?: number` — count of non-fatal warnings during the operation
  - `error_code?: string` — present when `success = false`; value is one of the canonical error codes from the Web Error Taxonomy
- Result-shape hints by operation: `query_preview` (search), `url` (fetch/extract), `content_format` (fetch), `task_preview` (research), etc.
- [AUDIT3-FIX] **`depth_limit?` audit field for crawl/map operations**: `webcrawl`/`webmap` result-shape hints include `depth_limit?` — the effective depth limit applied (may differ from `max_depth` input if provider imposed lower ceiling). Audit/transparency field, not an input parameter.

#### Named Ref Fields for Large Payloads [XV-ADD]
- `sources_ref` — pointer to normalized source list blob
- `content_ref` — pointer to full extracted content blob
- `map_ref` — pointer to site map data blob
- `answer_summary_ref` — pointer to research synthesis summary blob
- All ref fields require mandatory secrets scrubbing before storage

#### Storage Split Guidance (LOCKED)
- **Inline in audit log**: previews, summaries, metadata, source counts
- **Ref/blob storage**: full extracted pages, source lists, crawl results, map data
- Large payloads store full data behind refs/blobs while audit entries show bounded previews

#### Storage Ownership Split — Contracts_V0.md vs storage-plan.md (LOCKED) [AUDIT3-FIX]
- **`Contracts_V0.md` owns**: Event type names, top-level `EventRecord` schema/envelope, canonical requested/effective runtime snapshot fields, generic rule that tool-specific payloads live under `payload.meta`
- **`storage-plan.md` owns**: Concrete web-operation payload fields, blob/ref strategy, per-tool `payload.meta` child field registrations, blob-ref naming conventions, secrets scrubber requirements, cache storage structure and TTL table
- **Boundary rule**: Do NOT duplicate schemas across both docs. `Contracts_V0.md` = envelope; `storage-plan.md` = concrete child payloads. `Tools.md` and chat docs define user/tool semantics, not persistence envelopes.
- **Inline vs ref/blob split** (storage-plan.md owned): Inline = short previews, counts, enum-like routing fields, error codes. By ref = extracted page bodies, research synthesis, full source sets, crawl inventories, map graph payloads.

#### Activity Labels (LOCKED)
- `Searching Web: <query>`, `Reading Site: <url>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, `Mapping Site: <url>`
- Two explicit rows per operation (not generic audit-trail wording)

#### Canonical Activity Labels — Distinction Rules [XV-ADD]
- Six distinct labels (LOCKED): `Searching Web: <query>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, `Mapping Site: <root_url>`, `Reading Site: <url>`
- CRITICAL: `Extracting Site` ≠ `Reading Site` — different evidence paths and failure modes. `Extracting Site` uses provider-level extraction; `Reading Site` uses PM's native Site Reader.

#### Provenance Badges (LOCKED)
- `search snippet`, `site extract`, `site reader`, `research synthesis`, `crawl result`, `map result`
- Let users judge source quality/depth at glance

#### Citation/Provenance Precedence Hierarchy [XV-ADD]
- 6-level priority (strongest to weakest):
  1. Native Site Reader output (`Reading Site`) — highest provenance
  2. Provider extract output (`Extracting Site`)
  3. Research synthesis with explicit source list (`Researching Web`)
  4. Crawl result (`Crawling Site`)
  5. Map result (`Mapping Site`)
  6. Raw search snippets only (`Searching Web`) — lowest provenance
- Source dedup rule: preserve strongest provenance badge per URL (if same URL appears via multiple paths, keep the highest-ranked provenance)

#### Permission Snapshot (LOCKED)
- Finalize effective permission snapshot at attempt/run start; keep immutable for that attempt
- Historical runs show frozen permission snapshot, NOT current settings state
- Requested vs effective state disclosed when they differ

#### webfetch Audit (LOCKED)
- Each webfetch must emit audit entry: URL, status, bytes/truncation, whether used as source

#### Denied-Web Audit Payload [XV-ADD]
- `tool.denied.payload.meta` fields for when web operations are blocked by permissions:
  - `web_operation`, `web_input`, `denial_reason_code`, `denial_source` (policy | permission | mode | user), `suggested_recovery_action`
- Denied operations still emit seglog events for audit completeness.

#### tool.denied Payload Field Reconciliation [AUDIT3-FIX]
- **Renames** (old → current, current name is canonical):
  - `web_input_preview?` → `web_input` (current uses structured object)
  - `blocked_reason_code?` → `denial_reason_code` (semantic rename; more specific to denial context)
- **Missing from current — RESTORED**:
  - `requested_adapter_id?` — which adapter was requested for the denied operation
  - `projection_freshness?` — `current` | `refreshing` | `stale`
  - `projection_health?` — `healthy` | `degraded` | `unavailable`
  - `allowed_action_ids[]?` — machine-actionable recovery paths for UI
  - `headless_denied?` — boolean; true when denial occurred in headless mode
- **Full reconciled `tool.denied.payload.meta` field set**:
  - `web_operation`, `web_input`, `denial_reason_code`, `denial_source` (`policy`|`permission`|`mode`|`user`), `suggested_recovery_action`, `requested_adapter_id?`, `projection_freshness?`, `projection_health?`, `allowed_action_ids[]?`, `headless_denied?`

#### Approval-Card Summaries Per Operation [XV-ADD]
- Each web operation type has specific approval card wording.
- Session-approval scope patterns:
  - `search` / `research` = `*` wildcard (host cannot be known upfront)
  - `extract` / `crawl` / `map` = `https://host.example/*` host-scoped
  - `read` = `https://host.example/*` host-scoped
- Approval cards must show the operation type, scope, and requested input.

#### Web Error Taxonomy [XV-ADD]
- 12 error codes for web operations (from old ledger):
  1. `web_timeout` — request timed out
  2. `web_dns_failure` — DNS resolution failed
  3. `web_connection_refused` — target refused connection
  4. `web_tls_error` — TLS/SSL handshake failure
  5. `web_http_4xx` — client error response
  6. `web_http_5xx` — server error response
  7. `web_content_too_large` — response exceeded size limits
  8. `web_content_blocked` — content blocked by policy/robots
  9. `web_auth_required` — target requires authentication
  10. `web_rate_limited` — rate limit exceeded
  11. `web_parse_failure` — content could not be parsed/extracted
  12. `web_provider_error` — upstream provider returned an error
  13. `projection_too_stale` — projection freshness is stale beyond acceptable threshold; operation cannot proceed with confidence [AUDIT3-FIX]
  14. `empty_result` — operation completed successfully but returned zero results (distinct from error; still surfaced as a recoverable condition) [AUDIT3-FIX]
  15. `crawl_limit_reached` — crawl operation hit max_pages or max_depth limit before exhausting discovered URLs [AUDIT3-FIX]
- [AUDIT3-FIX] **Canonical error code table unification note**: All web operation error codes (the 15 above PLUS the general error code set: `invalid_input`, `permission_denied`, `user_declined`, `unsupported_operation`, `no_eligible_adapter`, `adapter_unavailable`) must be assembled into ONE canonical error code table during reconciliation. Overlap between web-specific codes (`web_rate_limited`, `web_timeout`, `web_content_blocked`) and general codes (`rate_limited`, `timeout`, `content_blocked`) must be deduplicated with clear scoping rules.

#### Log Summary / Inspector Contract [XV-ADD]
- Summary rows in log view with on-demand deref behavior (click to expand full payload).
- Dedicated log/audit surface exists alongside chat transparency — BOTH surfaces required, not one replacing the other.
- Log inspector supports: filter by event family, search by tool/operation, time-range queries, export.
- [AUDIT3-FIX] **Log summary rows use 5-item format**: (1) Operation label, (2) Short query/url/task preview (truncated), (3) Success/failure status, (4) Fallback note (when occurred), (5) Source/page counts (when present). Log summary MUST NOT inline full content — those are behind refs.
- [AUDIT3-FIX] **History inspector deref policy: on-demand only, never eager**. History rows combine: (a) canonical runtime snapshot fields, (b) web-operation payload from `payload.meta`, (c) dereferenced refs ONLY on demand (click-to-expand). Eager deref of large blobs degrades log browsing and violates the inline/ref storage split.

#### In-Thread Section Triggers [XV-ADD]
- Rules for when in-thread activity sections appear:
  - Any tool invocation → activity section
  - Any file read/write → activity section
  - Any web operation → activity section (all 6 types: search, extract, research, crawl, map, read)
  - Any subagent delegation → activity section
- 4 web operation types added to in-thread activity list: `crawl`, `map`, `extract`, `research` (in addition to existing `search`, `read`)

- Chat must NOT become the only place to inspect operational history. Dedicated logs must NOT replace lightweight thread transparency. BOTH surfaces required. [XV-ADD]
- `logsearch` / `logread` GUI surfacing — these tools need explicit GUI/surface integration, not just CLI availability. [XV-ADD]

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
- LSP surface ops — **RECONCILED** with PM-extended `rename` [XV2-FIX — scope clarification: "RECONCILED" applies to the operation SET only (which ops exist and PM's `rename` extension). The output/error envelope and tool-result schema are NOT reconciled — see Part M for INCOMPLETE flag. Do not read this as full LSP contract reconciliation.]
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
- [AUDIT3-FIX] **Iframe handling expectations (LOCKED)**: Site Reader MUST handle nested iframes during structured reading: (1) recursively discover iframes (max 3 levels deep); (2) cross-origin iframes: attempt content extraction where browser security policy allows, gracefully skip with warning when blocked by same-origin policy or X-Frame-Options; (3) per-frame CDP sessions for content extraction when browser runtime available; (4) iframe content merged into parent page's `PageRepresentation` with source-frame attribution. Distinct from Inline Visualizer iframe sandboxing (Part H) — Site Reader iframes are *read targets*, not *rendering containers*.

#### External Ecosystem Findings (Design Evidence, Not Normative)
- **Swift-Agent-Skills / agent-skills ecosystem**: portable folder-based skills with `SKILL.md` plus optional resources — PATTERN ADOPTED; keep PM registry/discovery/runtime contract canonical
- **xeditor-monorepo**: source/editor/preview layering — REFERENCE ONLY; use as inspiration for preview-capable surfaces
- **Classic298/open-webui-plugins (inline visualizer reference)**: HTML/SVG fragment input (not full page), host-wrapped rendering, narrow bridge only, theme injection, auto-height — ALL ADOPTED for PM visual module

#### External Reference Import Rule [XV-ADD]
- Do NOT import plugin/MCP/container constraints as PM-native rules. PM's own design is authoritative; external systems are reference material only.
- External system behavior may inform PM design but must be restated in PM vocabulary before becoming canonical.

#### External Reference Acceptance Checklist [XV-ADD]
- For each external reference adopted:
  1. Verify the reference is still current and applicable
  2. Identify the PM-relevant subset (not the entire external spec)
  3. Document adoption scope (what was adopted, what was excluded, why)
  4. Place the adopted content in the correct canonical PM doc
  5. Mark non-PM constraints as external-only (not normative for PM)

#### External Reference Landing Guidance [XV-ADD]
- Landing targets by category of external reference:
  - Tool/runtime contracts → `Tools.md`, `Contracts_V0.md`
  - UI/UX patterns → `FinalGUISpec.md`
  - Permission/auth patterns → `Permissions_System.md`
  - Provider/integration patterns → `CLI_Bridged_Providers.md`, `Provider_OpenCode.md`
  - Storage/persistence patterns → `storage-plan.md`
  - Identity/persona patterns → `Personas.md`, `Multi-Account.md`

#### External-Name Leakage Flag [XV2-ADD]
- **Contradiction detected**: Canonical docs import external environment/config names (e.g., `OPENCODE_DISABLE_LSP_DOWNLOAD`, `OPENCODE_LSP_TIMEOUT`, etc.) directly into PM specifications. This contradicts Part Q Rule 6 above ("do NOT copy external command names, product labels, or user-visible nouns where PM already has canonical language") and Rule 3 ("Avoid importing external names into canonical UX/contracts when PM-native term already exists").
- **Action needed**: Audit canonical docs for imported external env var names and either (a) rename them to PM-native equivalents (`PM_DISABLE_LSP_DOWNLOAD`, etc.) or (b) document them explicitly as external-compatibility shims, not canonical PM config.

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
- `proxy_mode?: "basic" | "enhanced" | "auto"` (default `"auto"`; cloud only) [FC-FIX: removed invalid "stealth" value — Firecrawl API supports only basic/enhanced/auto]
- `cache_enabled?: boolean` (default true; uses Firecrawl's built-in cache)

#### Capability Matrix (Firecrawl Provider)

| PM Operation | Firecrawl Support | Firecrawl Endpoint | Tier | Notes |
|---|---|---|---|---|
| `websearch` | native | POST /v2/search | native | Uses Serper (Google); live search with optional scraping of results [XV-FIX: was "returns full page content not just snippets"] [FC-FIX2: renamed to canonical PM name] |
| `webextract` | native | POST /v2/extract | native | LLM-powered; JSON Schema support; URL wildcards; enableWebSearch [FC-FIX2: renamed to canonical PM name] |
| `webresearch` | native | POST /v2/agent (beta) | native | Autonomous Spark-1 agent; no URLs required; 20-2500 credits [XV-FIX: marked beta] [FC-FIX2: renamed to canonical PM name] |
| `webcrawl` | native | POST /v2/crawl | native | Async job; includePaths/excludePaths; sitemap modes; dedup [FC-FIX2: renamed to canonical PM name] |
| `webmap` | native | POST /v2/map | native | Search filter; dedup similar URLs [XV-REMOVE: "Up to 100k URLs" — unverified specific claim] [FC-FIX2: renamed to canonical PM name] |
| `webfetch` | native | POST /v2/scrape | native | Multiple formats; 6 actions (wait, click, scroll, write, press, screenshot); change tracking [XV-FIX: was "12+ formats" (overstated), action count corrected to 6] [XV2-ADD: Firecrawl advanced docs reference additional actions (executeJavascript, scrape, pdf) beyond the 6 listed here — action set may be larger than documented. Verify against latest API before implementation.] [FC-FIX2: renamed to canonical PM name] |
| `batch_webfetch` (Firecrawl: /v2/batch/scrape) | native | POST /v2/batch/scrape | native | Bulk URL scraping with webhook completion notification [XV-ADD] [FC-FIX2: renamed from batch_scrape to align with Part V naming] |

[XV-FIX] **Firecrawl endpoint inventory** (corrected per official docs): /v2/scrape, /v2/crawl, /v2/map, /v2/search, /v2/extract, /v2/batch/scrape, /v2/agent (beta). [XV-REMOVE: `browser` endpoint removed — not in Firecrawl docs.]

[FC-FIX] **Async operation support**: The following Firecrawl endpoints return job IDs and require polling/webhooks for completion: `/v2/crawl`, `/v2/extract`, `/v2/batch/scrape`, `/v2/agent`. Other endpoints (`/v2/scrape`, `/v2/search`, `/v2/map`) return results synchronously.

**Adapter async pattern**: For async Firecrawl operations, the PM adapter:
1. Sends initial request → receives `{ success: true, id: "<job_id>" }`
2. Polls `GET /v2/<operation>/<job_id>` at intervals: 2s, 4s, 8s, 15s, 30s (exponential backoff, max 30s interval)
3. Poll response includes `status: "scraping" | "processing" | "completed" | "failed" | "cancelled"` and partial `data` when available (exact values vary by Firecrawl endpoint; adapter should treat any non-"completed" non-"failed" status as in-progress) [FC-FIX2]
4. On `completed`: return full results to PM tool layer
5. On `failed`: map Firecrawl error to PM error code, return to tool layer
6. Timeout: if polling exceeds provider `timeout_ms` config, return `timeout` error with any partial results
7. Webhook alternative: if PM is configured with a webhook endpoint, Firecrawl can POST results directly (NOT MVP — polling is the v1 pattern)

[XV-ADD] **Firecrawl pricing/rate-limit complexity note**: Cost can spike sharply with agent/batch operations. Shared global rate limits across endpoints. Self-hosted option available but has degradation/stability pain points (container management, proxy rotation, anti-bot updates).

[XV-ADD] **Site Reader primacy rule**: webfetch routing MUST respect Site Reader primacy — Firecrawl scrape is an ALTERNATIVE provider path, not the default. Native Site Reader is always the default for webfetch.

#### Firecrawl → PM Parameter Mapping

**websearch → Firecrawl /v2/search:**
- `query` → `query`
- `max_results` → `limit` (configurable `limit` parameter; actual cap varies by plan and source type; PM default 8) [XV-FIX: removed specific "1-100" claim]
- `sources` → `sources` (Firecrawl supports `["web", "news", "images"]`)
- `categories` → `categories` (Firecrawl supports `["github", "research", "pdf"]`)
- `include_domains` → not directly supported by Firecrawl search; PM filters post-search [XV-REMOVE: `scrapeOptions.includeTags` mapping was not confirmed]
- `exclude_domains` → not directly supported; PM filters post-search
- `time_range` → `tbs` (Firecrawl time-based search parameter)
- PM `scrapeOptions` defaults: `formats: ["markdown"]`, `onlyMainContent: true`
- [FC-FIX2] **Response transformation**: Firecrawl `/v2/search` returns results separated by source type (`{ web: [...], images: [...], news: [...] }`). Adapter MUST flatten into PM's unified `results` array, tagging each item with `source_type`. Merge order: web results first, then news, then images (preserving per-source rank ordering within each group).

**webfetch → Firecrawl /v2/scrape:**
- `url` → `url`
- `formats` → `formats` (PM markdown → `[{type:"markdown"}]`; PM screenshot → `[{type:"screenshot"}]`; PM pdf → `parsers:[{type:"pdf"}]`)
- `actions` → `actions` (PM action subset maps to Firecrawl's 6 action types: wait, click, scroll, write, press, screenshot) [XV-FIX: was 9; standardized to 6 per official docs]
- `cache_ttl` → `maxAge` (Firecrawl uses ms; PM exposes seconds)
- `change_tracking` → `formats` includes `{type:"changeTracking"}`
- `timeout` → [FC-FIX] `timeout`: PM webfetch does NOT expose a user-facing `timeout` parameter. The Firecrawl adapter uses the provider-level `timeout_ms` from config (line 1410, default 60000ms) as the request timeout. NOT a per-invocation parameter mapping.
- `detail_level` → [FC-FIX] `onlyMainContent` / `onlyCleanContent`: These Firecrawl params are set by the adapter based on the requested `formats`. When `formats` includes `"rawHtml"`, both are false. For `"markdown"` or `"html"`, `onlyMainContent: true`. No PM-side input maps to these — they are adapter-internal defaults derived from format selection.

**webextract → Firecrawl /v2/extract:**
- `url` → `urls: [url]` (Firecrawl accepts array, max 10; PM strict one-URL)
- `schema` → `schema` (JSON Schema; Firecrawl validates output against it)
- [XV-REMOVE: `detail_hint → scrapeOptions depth` mapping removed — not confirmed]
- Firecrawl adds: `enableWebSearch`, `urlTrace`, `showSources`
- PM one-URL constraint means Firecrawl's multi-URL + wildcard capability is PM-composed only

**webresearch → Firecrawl /v2/agent:**
- `task` → `prompt`
- `max_sources` → `maxCredits` (approximate; Firecrawl credit-based not source-based)
- `depth_hint` → `model` selection (PM fast → `spark-1-mini`, PM deep → `spark-1-pro`)
- Firecrawl adds: `urls` (optional starting points), `schema` (structured output) [XV-REMOVE: `strictConstrainToURLs` removed — not confirmed in official docs]
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

#### Firecrawl Credit Cost Reference (for adapter routing awareness) [FC-FIX]

| PM Operation | Firecrawl Endpoint | Base Credit Cost | Modifiers |
|---|---|---|---|
| `websearch` | /v2/search | 2 per 10 results | +scrape costs if scrapeOptions used |
| `webfetch` | /v2/scrape | 1 per page | +4 enhanced proxy; +4 JSON mode; +1 ZDR |
| `webfetch` (interact) | /v2/scrape/{id}/interact | 2/min (code) or 7/min (AI) | session-time based |
| `webextract` | /v2/extract | ~15 tokens/credit (variable) | +5/page for JSON mode |
| `webresearch` | /v2/agent | 20–2500 (dynamic) | spark-1-mini ~60% cheaper |
| `webcrawl` | /v2/crawl | 1 per page crawled | +4 enhanced proxy; +4 JSON mode per page |
| `webmap` | /v2/map | ~1 (undocumented) | — |
| `batch_webfetch` (Firecrawl: /v2/batch/scrape) | /v2/batch/scrape | 1 per URL | same modifiers as webfetch [FC-FIX2: renamed from batch_scrape to align with Part V naming] |

**Routing implications:**
- Cost-aware routing SHOULD prefer cheaper operations when multiple could satisfy the request (e.g., search+scrape vs agent for simple lookups)
- PM's credit warning (Part S line 1847) triggers at estimated >100 credits [FC-FIX2]
- PM's hard cap (default 500 credits) prevents runaway agent costs
- Self-hosted Firecrawl: credits do not apply (no billing); cost awareness N/A
- Adapter SHOULD track cumulative session credits in `firecrawl_credits_used` audit field

#### Firecrawl Error Handling
- HTTP 401/403 → `adapter_unavailable` (invalid/expired API key; recovery: open Authentication settings)
- HTTP 429 → `rate_limited` (recovery: fallback to next provider OR wait)
- HTTP 402 → `rate_limited` (credit exhausted; recovery: add credits or switch provider)
- HTTP 500/502/503 → `adapter_unavailable` (server error; recovery: retry or fallback)
- Timeout → `timeout` (recovery: retry with longer timeout or fallback)
- Firecrawl `success: false` → map `error` field to PM `error_message`; use PM error codes
- [FC-FIX2] HTTP 404 → `content_not_found` (target page does not exist)
- [FC-FIX2] HTTP 400 → `invalid_input` (malformed request parameters)
- [FC-FIX2] Firecrawl `success: false` with `error: "Blocked by robots.txt"` → `crawl_robots_blocked` or `content_blocked` (per operation)
- [FC-FIX2] Firecrawl `success: false` with `error: "Content too large"` → `content_too_large`
- [FC-FIX2] Firecrawl `success: false` with other error → map to closest PM error code; log original Firecrawl error in `error_message`

#### Firecrawl Interact Session Model (Provider Capability) [FC-FIX]

Firecrawl's `/interact` endpoint provides a STATEFUL multi-turn browser session,
distinct from the one-shot `actions` parameter on `/scrape`:

**Session Flow:**
1. Initial scrape: `POST /v2/scrape { url }` → response includes `scrapeId` (via `data.metadata.scrapeId`)
2. Interact: `POST /v2/scrape/{scrapeId}/interact { prompt | code }` — resumes browser session
3. Multiple interact calls reuse the same session (state carries over — DOM, cookies, scroll position)
4. Stop: `DELETE /v2/scrape/{scrapeId}/interact` — terminates session, releases resources

**Two Interaction Modes:**
- **Prompt-based** (`prompt: string`): Natural language instruction; Firecrawl AI navigates/clicks/extracts autonomously. More agent-friendly. Cost: 7 credits/min.
- **Code-based** (`code: string, codeOptions: { language: "nodejs" | "python" | "bash" }`): Direct Playwright script execution. Full control. Cost: 2 credits/min.

**Session Properties:**
- TTL: 10 min default, 5 min inactivity timeout
- Returns `liveViewUrl` (view-only browser stream) and `interactiveLiveViewUrl` (interactive)
- Supports `persistent profiles`: `profile: { name: string, saveChanges: boolean }` preserves cookies/localStorage across sessions (enables authenticated workflows)
- Response includes full page content after each interact step (markdown, HTML, screenshot, etc.)

**PM Integration Design:**
- PM's research_session (Part T) is the PM-native abstraction for browser interaction
- When Firecrawl is the provider for webfetch with `actions`, the adapter SHOULD use `/interact` session model (scrape → interact → capture) rather than the deprecated `actions` parameter on `/scrape`
- Firecrawl's prompt-based mode maps to: PM sends a single composite prompt describing all actions, Firecrawl handles navigation autonomously — this is an ALTERNATIVE execution strategy to PM's action-by-action approach
- Code-based mode: NOT exposed to PM agents directly. Used only as internal adapter implementation detail when PM's action sequence needs precise Playwright control
- Live View URLs: NOT surfaced in PM v1 (PM has its own browser surface). Future consideration for remote debugging or user-preview scenarios
- Persistent profiles: NOT MVP. Future feature for authenticated research workflows where site login must persist across tool invocations

**Adapter Decision Tree (webfetch with actions):**
1. If Firecrawl is selected provider AND actions requested:
   a. Start scrape to get `scrapeId`
   b. For each PM WebAction, translate to interact prompt or code
   c. After all actions, capture final page state
   d. Clean up session (DELETE)
2. If all actions are Tier 1 (read-only) or simple click/type sequences with CSS selectors: use prompt-based mode. If actions use wait_for with custom timeout, precise coordinate interactions, or depend on dynamic DOM state: use code-based mode. [FC-FIX2]
4. Session timeout handling: if interact returns timeout, retry once; if still fails, return partial content + warning

#### Firecrawl-Specific Audit Fields
- `firecrawl_credits_used?: number` (from response `creditsUsed`)
- `firecrawl_cache_state?: "hit" | "miss"` (from response `metadata.cacheState`)
- `firecrawl_scrape_id?: string` (from response `data.metadata.scrapeId` for traceability) [FC-FIX2: corrected JSON path from scrape_id]
- ★ `provenance_badge?: string` (links to citation precedence hierarchy in Part P; e.g. `search_snippet`, `site_extract`, `site_reader`, `provider_scrape`) [XV-ADD] [XV2-FIX: Normalized to underscore format for consistency with Part S. Note: `provider_scrape` is NOT in Part P's locked 6-badge canonical set; treat as PROPOSED extension. Part P canonical set uses spaced format and needs harmonization.] [FC-FIX2] Badge format is PROPOSED underscore format pending Part P harmonization. Final canonical format and valid values blocked on Part P badge reconciliation — underscore format (`site_reader`, `provider_scrape`) is recommended for code-friendliness but not yet locked.

### PART S: ENHANCED WEB TOOL CONTRACTS (FULL IMPLEMENTATION-READY SPEC)

These extend the existing locked contracts from w-20260316-160450 with Firecrawl-inspired capabilities. New parameters marked with ★. Existing locked parameters preserved exactly.

#### WebAction Type Schema (LOCKED) [FC-FIX]

WebAction is the typed interface for browser actions used in webfetch and webextract `actions` parameters, and in research_session Tier 1-3 action sets (Part T).

```typescript
interface WebAction {
  type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network";
  selector?: string;       // CSS selector for target element (required for click, type, fill_form, select_option)
  value?: string;          // Text to type, key to press, URL to navigate to, option value to select
  timeout_ms?: number;     // Max wait time for this action (default 5000)
  description?: string;    // Human-readable description for audit/transparency
}
```

**Validation rules:**
- `type` is required; must be one of the enumerated values
- `selector` is required when `type` is click, type, fill_form, select_option; optional otherwise
- `value` is required when `type` is type, press_key, navigate, select_option; optional otherwise
- `timeout_ms` defaults to 5000ms; max 30000ms; total across all actions capped at 30s
- [FC-FIX2] Practical constraint: the 30s total cap is a hard wall-clock limit across ALL actions. If action 1 takes 20s, actions 2-10 share the remaining 10s. Per-action `timeout_ms` is a max-wait, not a guarantee. High per-action timeouts reduce headroom for subsequent actions.
- `description` is optional; used in activity transparency and audit log
- Unknown `type` values → `invalid_input` error
- Actions are executed sequentially in array order
- If any action fails, subsequent actions are skipped; partial results returned with per-action status

#### Common Output Fields (all web tools) [FC-FIX]

Every web tool output includes these base fields. Individual tool contracts extend this set.

| Field | Type | Description |
|---|---|---|
| `tool_use_id` | `string` | Unique invocation ID for tracing |
| `adapter_id` | `string` | Provider that fulfilled the request (e.g. `"exa"`, `"firecrawl"`, `"pm_native"`) |
| `adapter_selection_reason` | `string` | Why this provider was chosen (capability match, fallback, user override) |
| `duration_ms` | `number` | Wall-clock execution time |
| `timestamp` | `string` | ISO 8601 completion timestamp |
| `cached` | `boolean` | Whether result was served from cache |
| `error_code?` | `string` | Present only on error; from the canonical error enum |
| `error_message?` | `string` | Human-readable error description |
| `warnings?` | `string[]` | Non-fatal issues (e.g., partial results, format unavailable) |
| `provenance_badge?` | `string` | Citation source type from Part P hierarchy |
| `execution_path?` | `string` | Routing trace (e.g., `pm_site_reader`, `provider_firecrawl_scrape`) |

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
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 3600, store: true }`) [FC-FIX]

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

[XV-ADD] **Search-then-Read Auto Behavior (LOCKED global heuristic)**: After search, choose top candidates and pass into Reading Site / Site Reader. Final answer carries sources/citations from actual read path, not raw search snippets alone. This ensures provenance quality.

**Output:** (extends locked common fields)
- `results: Array<{ title, url, snippet?, score?, source_type?: string }>`
- ★ `source_type` on each result indicates which source produced it (`"web"`, `"news"`, etc.)
- ★ `provenance_badge?: string` (from Part P citation precedence hierarchy) [XV-ADD]
- ★ `execution_path?: string` (e.g. `provider_search_native`, `pm_search_plus_site_reader`) [XV-ADD]
- ★ `cache_state?: "hit" | "miss" | "bypassed"` [FC-FIX]

**Error additions:**
- `unsupported_source` — requested source type not available from any enabled provider

#### webfetch — Enhanced Contract

[XV-FIX] **Site Reader primacy**: Site Reader is the DEFAULT and PRIMARY path for webfetch. Firecrawl/other providers are fallback/alternative paths that require explicit configuration or Site Reader failure.

**Input:**
- `url: string` (required) [locked]
- [AUDIT3-FIX] **URL validation rules (LOCKED)**: Before routing, `url` MUST be validated: (1) reject non-HTTP(S) schemes (e.g. `file://`, `ftp://`, `javascript:`) with `invalid_input` error; (2) normalize URL before routing (trim whitespace, resolve relative paths, ensure scheme present — default to `https://` if bare domain); (3) reject malformed URLs (unparseable, empty host) with `invalid_input` error.
- ★ `formats?: string[]` (default `["markdown"]`; options: `"markdown"`, `"html"`, `"rawHtml"`, `"screenshot"`, `"pdf"`, `"summary"`, `"links"`, `"images"`)
- ★ `actions?: Array<WebAction>` (optional; max 10 actions, max 30s total wait; see Research Action Model below)
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 14400, store: true }`)
- ★ `change_tracking?: boolean` (default false; when true, returns diff against previous fetch of same URL)
- ★ `pdf_mode?: "fast" | "auto" | "ocr"` (default `"auto"`; applies when URL serves PDF content)
- ★ `max_content_length?: number` — ✅ [GAP-RESOLVE] **RESOLVED — Decision #3**: LOCKED as **5 MB default**, configurable. Agent can override down with `max_content_length` parameter.

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
- [XV-FIX] `screenshot` and `pdf` format requests require `session_granted` tier approval (elevated from default) — per Do-Not-Forget permission rules
- [AUDIT3-FIX] **Image/media attachment handling**: When webfetch encounters a URL serving binary/non-text content: (1) detect `Content-Type` via HTTP response headers; (2) for supported image types (`image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml`), return as inline attachment with MIME type preserved, size capped at `max_content_length` (5 MB); (3) for unsupported/large binary media (video, audio, executables), return metadata only (MIME type, content-length, URL) without downloading body; (4) non-text responses do NOT go through HTML→Markdown conversion.

**Behavior — actions:**
- Actions execute BEFORE content extraction (navigate to final state, then capture)
- Action model is research-session subset (see Part T)
- Max 10 actions per webfetch (research context is lighter) [XV-FIX: removed "not 50 like Firecrawl" — "max 50 actions" is unconfirmed]
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
- Provider-dependent: PM native uses platform OCR or fallback text extraction [XV-REMOVE: "Firecrawl uses LlamaParse" — unconfirmed by Firecrawl docs for PDF processing]

**Output:** (extends locked common fields)
- `content: string` (primary markdown/text content) [locked]
- `status?: number` (HTTP status) [locked]
- ★ `formats_returned: string[]` (which requested formats were successfully produced)
- ★ `screenshot?: { data_uri: string, width: number, height: number }` (when screenshot format requested)
- ★ `pdf_artifact?: { ref: string, page_count: number }` (when pdf format requested)
- ★ `summary?: string` (when summary format requested)
- ★ `links?: Array<{ url: string, text?: string, rel?: string }>` (when links format requested) [FC-FIX2]
- ★ `images?: Array<{ url: string, alt?: string, dimensions?: { width: number, height: number } }>` (when images format requested) [FC-FIX2]
- ★ `cache_state?: "hit" | "miss" | "bypassed"`
- ★ `change_status?: "new" | "same" | "changed" | "removed"` (when change_tracking true)
- ★ `change_summary?: string` (when changed; concise description)
- ★ `previous_fetch_at?: string` (ISO timestamp of previous cached version)
- ★ `action_results?: Array<{ action: string, status: "success" | "error", error?: string }>` (when actions used)
- ★ `provenance_badge?: 'site_reader' | 'provider_scrape'` [XV-ADD] (indicates whether content came from native Site Reader or provider scrape path) [XV2-FIX: Normalized to underscore format. `provider_scrape` is NOT in Part P's locked canonical 6-badge set — treat as PROPOSED extension pending Part P update.] [FC-FIX2] Recommended resolution: normalize all badges to underscore format (`site_reader`, `provider_scrape`, `search_snippet`, `site_extract`, `research_synthesis`, `crawl_result`, `map_result`). Part P canonical set needs harmonization from spaced to underscore format during reconciliation.
- ★ `execution_path?: string` (e.g. `pm_site_reader`, `provider_firecrawl_scrape`, `pm_fetch_fallback`) [XV-ADD]

**Error additions:** [FC-FIX2]
- `content_too_large` — response body exceeds `max_content_length` (5 MB default)
- `content_blocked` — target site blocked by robots.txt, WAF, geo-restriction, or content policy
- `content_not_found` — URL returned HTTP 404 or equivalent not-found response
- `no_previous_version` — INFORMATIONAL (not error): change_tracking requested but no previous cached fetch exists; returns `change_status: "new"` and this code in `warnings[]`, not `error_code`

#### webextract — Enhanced Contract

**Input:**
- `url: string` (required; one URL only per invocation) [locked]
- `adapter_hint?: string` (optional) [locked]
- `detail_hint?: "fast" | "balanced" | "deep"` (optional) [locked]
- ★ `schema?: object` (JSON Schema defining expected output structure)
- ★ `schema_mode?: "strict" | "lenient"` (default `"lenient"`)
- ★ `actions?: Array<WebAction>` (optional; max 10 actions, max 30s; execute before extraction)
- ★ `prompt?: string` (optional; natural-language extraction guidance when schema alone insufficient; max 2000 chars)
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 14400, store: true }`) [FC-FIX]

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
- ★ `provenance_badge?: string` (from Part P citation precedence hierarchy) [XV-ADD]
- ★ `execution_path?: string` (e.g. `provider_extract_native`, `pm_extract_composed`) [XV-ADD]
- ★ `cache_state?: "hit" | "miss" | "bypassed"` [FC-FIX]

[XV-ADD] **Tavily boundary note**: Tavily extract may be useful as provider-side enrichment but must NOT replace native Site Reader. Different roles: Tavily provides structured extraction from its index; Site Reader provides direct content access and reading.
- [AUDIT3-FIX] **Tavily extract — future optional enrichment path note**: Tavily extract could later serve as ADDITIVE enrichment alongside native Site Reader — not as replacement. Potential future model: Site Reader produces primary read; Tavily extract optionally provides supplementary structured metadata (entity extraction, topic classification) as second-pass enrichment layer. NOT MVP — documented future direction to prevent premature closure of design space.

**Error additions:**
- `extraction_schema_mismatch` — strict mode; output doesn't conform to required schema fields
- `schema_too_large` — schema exceeds 50KB limit
- `schema_invalid` — schema is not valid JSON Schema draft-07
- [FC-FIX] `extraction_empty` — extraction completed but produced no data (page content doesn't match schema or prompt). Output includes `extracted_data: null` and `schema_conformance: "none"`. In lenient mode this is a WARNING (tool returns successfully with empty data + warning); in strict mode this is an ERROR.
- `content_not_found` — target URL returned HTTP 404 or resolved to non-existent page [FC-FIX2]

#### webresearch — Enhanced Contract

**Input:**
- `task: string` (required) [locked]
- `max_sources?: number` (default 6) [locked]
- `adapter_hint?: string` (optional) [locked]
- `depth_hint?: "fast" | "balanced" | "deep"` (optional) [locked]
- ★ `autonomous?: boolean` (default false)
- ★ `auto_read_cap?: number` (default 4; max pages to read before synthesizing) [value locked, param new]
- ★ `schema?: object` (JSON Schema for structured research output)
- ★ `schema_mode?: "strict" | "lenient"` (default `"lenient"`) [FC-FIX2] — same semantics as webextract schema_mode; controls validation strictness of research output against schema
- ★ `starting_urls?: string[]` (optional; seed URLs to begin research from; max 5)
  - [FC-FIX2] `starting_urls` validated per webfetch URL validation rules: reject non-HTTP(S) schemes, normalize (trim whitespace, ensure scheme, resolve relative), reject malformed URLs with `invalid_input` error
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 3600, store: true }`) [FC-FIX2] — research results are cacheable; same TTL as websearch since research freshness matters

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
- ★ `provenance_badge?: string` (from Part P citation precedence hierarchy) [XV-ADD]
- ★ `execution_path?: string` (e.g. `pm_research_composed`, `provider_firecrawl_agent`) [XV-ADD]
- ★ `cache_state?: "hit" | "miss" | "bypassed"` [FC-FIX2]

✅ [GAP-RESOLVE] **RESOLVED — Decision #11**: Research session Tier 2 actions are **auto-allowed after parent tool's "For Session" host approval**. No second confirmation needed.

[XV-ADD] **Credit warning UX spec**: Confirmation dialog when estimated Firecrawl agent cost exceeds 100 credits. Hard cap default: 500 credits per research session. User can adjust cap in settings.

**Error additions:**
- `autonomous_budget_exceeded` — autonomous research hit iteration/time/credit cap without satisfactory result
  - When `autonomous_budget_exceeded` fires, the tool STILL returns whatever partial results were collected before the budget was hit. The error code is present alongside `answer_summary` (partial), `sources_used_count`, and `research_steps`. This is a "soft error" — the agent can use partial results or retry with a larger budget. [FC-FIX]
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
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 86400, store: true }`) [FC-FIX]
- [AUDIT3-FIX] **Permission semantics qualifier**: `webcrawl` uses the same tool-key permission semantics as other web operations — permission key `webcrawl`, default posture `ask`, host-scoped session-approval pattern. Approving `webcrawl` "For Session" for a host also auto-approves `crawl`/`map`/`extract`/`fetch` matching the same host pattern (per Part K session-approval rules). Same system applied to a fan-out operation.

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
- ★ `provenance_badge?: string` (from Part P citation precedence hierarchy) [XV-ADD]
- ★ `execution_path?: string` (e.g. `provider_crawl_native`, `pm_crawl_composed`) [XV-ADD]
- ★ `cache_state?: "hit" | "miss" | "bypassed"` [FC-FIX]

**Error additions:** [FC-FIX]
- `crawl_depth_exceeded` — crawl reached max_depth without finding enough pages matching filters
- `crawl_timeout` — crawl exceeded provider timeout before completing all pages
- `crawl_robots_blocked` — robots.txt blocked access to root_url or majority of target paths
- `crawl_rate_limited` — target site rate-limited the crawler (429/503 responses)

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
- ★ `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 86400, store: true }`) [FC-FIX]

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
- ★ `provenance_badge?: string` (from Part P citation precedence hierarchy) [XV-ADD]
- ★ `execution_path?: string` (e.g. `provider_map_native`, `pm_map_composed`) [XV-ADD]
- ★ `cache_state?: "hit" | "miss" | "bypassed"` [FC-FIX]

**Error additions:** [FC-FIX]
- `map_timeout` — site map discovery exceeded provider timeout
- `map_no_sitemap` — use_sitemap was "only" but no sitemap.xml found at root_url
- `map_robots_blocked` — robots.txt blocked sitemap access
- `sitemap_parse_error` — sitemap.xml found but malformed/unparseable

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
- [XV2-FIX] **Clarification**: This means research_session reuses automation_session's browser runtime, CDP/Playwright infrastructure, and PM browser surface — it is NOT a separate codebase. However, per Open Questions (line ~2633), a distinct `session_class` value `"research_session"` SHOULD be minted for telemetry/audit distinction even though the underlying infrastructure is shared. "Not a separate implementation" refers to runtime/infra; telemetry identity is separate.
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
| `scroll` | maps to viewport scroll (line 663) | Scroll to load lazy content, reveal below-fold content [XV-FIX: scroll = viewport scroll (research-appropriate); drag = precise element manipulation (full automation only). These are architecturally different.] |
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
- Tier 2 (session_granted) actions: ✅ [GAP-RESOLVE] **RESOLVED — Decision #11**: LOCKED as **auto-allowed after parent tool's "For Session" host approval** on that host. No second confirmation needed.
- Tier 3 (ask/deny) actions: require separate per-action or per-session confirmation
- Escalation to automation_session: always requires explicit confirmation

#### Research Session Evidence & Audit
- `snapshot` and `screenshot` results are included in parent tool's output (webfetch/webextract result)
- Research session actions are logged in audit as child events of parent tool invocation
- Activity transparency shows: `Reading Site: <url> (with browser interaction)` — sub-annotation on the existing `Reading Site` label, not a 7th distinct label
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #12**: `(with browser interaction)` is LOCKED as a **sub-annotation on the existing `Reading Site` label** (not a 7th distinct label). The label stays `Reading Site`; `interaction: true` metadata flag is visible in activity detail. The canonical six labels remain unchanged.

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

[XV2-FIX] **Site Reader primacy for `fetch`**: The matrix above treats `fetch` as provider-routed like any other operation, but multiple locked docs establish webfetch as PM-native Site Reader PRIMARY path (see Part C, Part S). Provider fetch (Firecrawl scrape, Exa crawl, Tavily extract) is FALLBACK only. The routing algorithm (Part X Steps 5-7) for webfetch MUST try Site Reader first, then fall to the provider matrix on failure. The `fetch` row should be read as: Site Reader is the default for ALL providers; these provider paths are fallback alternatives.

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

[XV-FIX] **DDG research clarification**: DDG research = pm-composed (DDG has no native research mode; PM composes search+read to simulate research). DDG `search` is listed as "native-ish" because DDG provides search results natively but with limited API guarantees — this is distinct from pm-composed research.

[XV-ADD] **Old ledger detail reference**: Cell-level matrix data exists in the old work-item ledger (w-20260316-160450, approximately lines 748-941) with full tier assignments and per-cell justification. Current matrix should reference or incorporate that detail during implementation.

### PART V: BATCH OPERATIONS (FULL SPEC)

#### Overview
Batch operations allow multiple URLs to be processed in a single tool invocation. Inspired by Firecrawl's /v2/batch/scrape endpoint. Applies to webfetch and webextract.

[XV-ADD] **Firecrawl-native batch details**: Firecrawl /v2/batch/scrape supports `ignoreInvalidURLs` parameter (skip bad URLs without failing batch), webhook support for batch completion notification, 24-hour result retention window for polling results, and `maxConcurrency` control for parallel processing limits.

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
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #6**: Batch permission for mixed-host URL batches is LOCKED as: **single confirmation prompt showing all unique domains in the batch**. "For Session" grants all listed domains for that session. No per-host separate prompts.
- Progress: activity transparency shows `Fetching sites: 5/20 complete`
- Cache: each URL cached independently (same cache semantics as single webfetch)
- Timeout: per-URL timeout same as single webfetch; ✅ [GAP-RESOLVE] **RESOLVED — Decision #16**: Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min).
- [FC-FIX2] **Batch credit awareness**: Batch operations multiply per-URL credit cost (see Part R credit cost table). For Firecrawl batch_webfetch: 1 credit/URL base + modifiers per URL. A 50-URL batch can cost 50–450+ credits. PM's credit warning threshold (>100 credits estimated) SHOULD trigger before executing large batches via Firecrawl. Batch cost estimate = `url_count × per_url_credit_estimate`.

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

[XV2-ADD] **Batch output field gaps**: The batch per-URL result object above omits several fields present in single webfetch output: `pdf_artifact`, `summary`, `links`, `images`, `action_results` (N/A — actions excluded from batch), `provenance_badge`, `execution_path`. Of these, `provenance_badge` and `execution_path` SHOULD carry over to batch results (each URL may route differently). `summary`, `links`, `images` should carry over when those formats are requested. `pdf_artifact` should carry over when pdf format is requested. `action_results` is correctly excluded (actions not supported in batch).

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

### Async Progress Model for Long-Running Web Operations [FC-FIX]

webcrawl and webmap can take minutes to complete (especially with large sites or deep crawls). PM needs a progress model for these operations.

**Which operations are long-running:**
- `webcrawl`: Always potentially long (crawling N pages sequentially/in parallel)
- `webmap`: Usually fast (sitemap parse) but can be slow (link traversal on large sites)
- `webresearch` (autonomous): Can involve multiple search-read cycles
- `batch_webfetch` / `batch_webextract`: Potentially long (multiple URLs; up to 600s timeout per Part V) [FC-FIX2]
- `webfetch`/`websearch`/`webextract`: Always synchronous from PM's perspective (single request)

**Progress Reporting Contract:**
```
progress_event: {
  tool_use_id: string,       // Links to the initiating tool invocation
  operation: string,          // "webcrawl" | "webmap" | "webresearch" | "batch_webfetch" | "batch_webextract",  // [FC-FIX2] added batch ops
  phase: "starting" | "in_progress" | "completing" | "done" | "failed" | "cancelled",  // [FC-FIX2] added cancelled
  detail: string,            // Human-readable: "Crawled 12/25 pages", "Mapped 45 URLs"
  pages_completed?: number,   // For crawl/map: pages processed so far
  pages_total?: number,       // For crawl/map: estimated total (may revise upward)
  elapsed_ms: number,
  estimated_remaining_ms?: number  // Best-effort estimate
}
```

**Delivery mechanism:**
- Progress events surface through PM's existing activity transparency system
- Activity label updates in real-time: `Crawling Site: example.com (12/25 pages)`
- Progress events are audit-logged but NOT surfaced as tool output (they appear in the activity stream, not in the tool result)
- Final result is delivered as normal tool output when operation completes

**Cancellation:**
- User can cancel long-running operations via activity stream "Stop" button
- Cancellation returns partial results collected so far + `cancelled: true` flag
- For provider-async operations (Firecrawl crawl): adapter sends cancel request to provider

**Timeout behavior:**
- webcrawl default timeout: 120s (overridable by provider config)
- webmap default timeout: 60s
- webresearch autonomous timeout: 120s (per Part S line 1708)
- On timeout: return partial results + `timeout` error code + `partial_results: true` flag

### PART W: WEB CONTENT CACHING LAYER (FULL SPEC)

#### Overview
Shared caching layer used by webfetch, webextract, webcrawl, and webmap. Reduces redundant fetches, enables change detection, and improves agent responsiveness.

[XV2-ADD] **Cache field gap for non-fetch operations**: Only webfetch has `cache_policy` and `cache_state` fields in its enhanced contract (Part S). webcrawl, webmap, webextract, and websearch all use this caching layer per the TTL table below, but their contracts in Part S lack corresponding `cache_policy` input and `cache_state` output fields. Either add these fields to the other tool contracts or document that caching for non-fetch operations is implicit (always-on, TTL-only, no user control).

#### Cache Architecture
- Cache is per-project (not global; respects project isolation)
- Storage: bounded in-memory + disk overflow; ✅ [GAP-RESOLVE] **RESOLVED — Decision #4**: Cache size limit is LOCKED at **500 MB default per project**, configurable in settings. LRU eviction.
- Cache entries keyed by: `(normalized_url, formats_hash, adapter_id)` — same URL fetched with different formats or different providers = different cache entries
- ✅ [GAP-RESOLVE] **RESOLVED — Decision #5**: Cache key ordering is LOCKED as **two-phase lookup**: Step 4 checks `(url, formats_hash)` only (adapter-agnostic). After provider selection at Step 7, validate `adapter_id` match. If mismatch, discard cache hit and fetch fresh. This resolves the ordering conflict between cache-check (Step 4) and provider selection (Steps 5-7).
- Actions are NOT included in cache key (actions may change page state; always re-executed)

[XV-ADD] **Cache precedence rules**: When both Firecrawl built-in cache and PM cache layer are active, PM cache takes precedence for serving cached content. Firecrawl cache serves as provider-side optimization only.

[XV-ADD] **Firecrawl cache interaction**: Firecrawl has built-in cache and change-tracking semantics (changeTracking parameter). PM cache layer sits above this, serving the PM-level caching contract. The two layers are complementary: Firecrawl cache reduces provider-side cost/latency; PM cache provides project-scoped, cross-provider caching.

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
  - Check tool permission key (e.g., `webfetch`) [XV2-FIX: was `tools.webfetch`; canonical permission keys per Permissions_System.md use bare names without `tools.` prefix]
  - Default: `ask` for all 6 web tools
  - If permission = deny: return `permission_denied`
  - If permission = ask: present approval prompt to user
  - If user declines: return `user_declined`
  - Approval scope:
    - websearch/webresearch: `*` wildcard (any search term) [XV2-FIX: PROPOSED extension — `*` wildcard pattern is not defined in the canonical permission system's pattern model. Treat as proposed, not canonical, until Permissions_System.md is updated.]
    - webfetch/webextract: host-scoped (approve for specific domain)
    - webcrawl/webmap: host-scoped + depth-scoped [XV2-FIX: PROPOSED extension — depth-scoped approval is not defined in the canonical permission system's pattern model. Treat as proposed, not canonical.]

Step 4: CHECK CACHE (new step for Firecrawl integration)
  - [XV2-FIX] **Cache key ordering issue**: ~~This step checks cache BEFORE provider selection (Steps 5-7), but cache key includes `adapter_id` (see Part W). Either cache lookup here must be adapter-agnostic (URL + formats only), or this step must be split.~~ ✅ [GAP-RESOLVE] **RESOLVED — Decision #5**: Two-phase lookup. This step checks `(url, formats_hash)` only. After Step 7, validate `adapter_id` match; discard cache hit on mismatch.
  - [FC-FIX2] **LOCKED**: If request includes `actions`, skip cache entirely (always fresh-execute). Actions modify page state, making cached content unreliable. Cache lookup only applies to action-free requests. Cache STORE still applies to the final result after actions execute (the post-action content IS cacheable for future action-free requests to the same URL).
  - If cache enabled and entry exists within TTL:
    - Return cached result with `cache_state: "hit"`
    - Skip Steps 5-8 entirely (UNLESS request includes actions — see above)
  - If change_tracking and expired entry exists:
    - Mark for diff comparison after fresh fetch
    - Continue to Step 5

Step 5: QUERY CAPABILITY MATRIX
  - [XV2-FIX] **webfetch Site Reader primacy**: For `fetch` operations, Site Reader is the DEFAULT path and MUST be tried first BEFORE querying the provider capability matrix. Provider fetch paths (Firecrawl scrape, Exa crawl, Tavily extract) are FALLBACK only, used when Site Reader fails or is unavailable. This is locked behavior per Part C and Part S.
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
  - [FC-FIX2] **Cost check**: If estimated credit cost for selected provider exceeds warning threshold (100 credits), present cost confirmation before execution
  - [FC-FIX2] **Cost-aware selection**: When multiple providers can fulfill the operation at similar capability level, prefer lower credit cost (e.g., PM-composed research over Firecrawl agent for simple tasks)
  - [FC-FIX2] Record `estimated_credit_cost` in audit alongside `adapter_selection_reason`

Step 8: EXECUTE & FALLBACK
  - Execute request against selected provider
  - If provider fails:
    - Try next eligible provider from Step 5 list
    - Record fallback in `provider_fallback_occurred`, `provider_fallback_summary`
    - Repeat until success or all providers exhausted
  - If all providers fail: return `adapter_unavailable` with summary of failures
  - [FC-FIX2] For async provider operations (webcrawl via Firecrawl, webresearch autonomous via Firecrawl agent): adapter polls per Part R async pattern; progress events emitted per Async Progress Model
  - [FC-FIX2] For webfetch/webextract with actions when Firecrawl is selected provider: adapter uses Firecrawl interact session model (Part R) rather than one-shot actions parameter

Step 9: RENDER & PERSIST
  - Format result according to tool output contract
  - Compute change_tracking diff if applicable
  - Store in cache if cache_policy.store is true
  - Record audit event with all routing metadata
  - Render activity label in chat:
    - Search: `Searching Web: <query>`
    - Fetch: `Reading Site: <url>` [XV2-FIX: This label MUST be routing-aware. `Reading Site: <url>` is reserved EXCLUSIVELY for the native Site Reader path (per Part C). Provider-routed fetch should use a distinct label, e.g. `Fetching Site: <url> (via <provider>)`. Rendering all fetch operations as "Reading Site" misrepresents provenance.]
    - Extract: `Extracting Site: <url>` [XV-FIX: was "Extracting from:" — corrected to match canonical set from Part P]
    - Research: `Researching Web: <task summary>` [XV-FIX: was "Researching:" — corrected to match canonical set from Part P]
    - Crawl: `Crawling Site: <root_url>` [XV-FIX: was "Crawling:" — corrected to match canonical set from Part P]
    - Map: `Mapping Site: <root_url>` [XV-FIX: was "Mapping:" — corrected to match canonical set from Part P]
  - Return result to agent/tool caller
```

#### Firecrawl-Specific Routing Notes
- Firecrawl's `search` uses Serper (Google) — fundamentally keyword-based, unlike Exa (semantic)
- When Exa is primary and user wants keyword search specifically, `adapter_hint: "firecrawl"` or `adapter_hint: "google"` overrides
- Firecrawl's `agent` endpoint (for webresearch autonomous) has credit cost 20-2500; PM should warn before delegating
- Firecrawl self-hosted: Fire Engine anti-bot not available; some sites may fail that work on cloud
- PM must NOT silently switch from self-hosted Firecrawl to cloud Firecrawl (different billing, different capabilities)

### Per-Contract Error Code Applicability [FC-FIX]

The 25 web tool error codes and which contracts they apply to: [FC-FIX2]

| Error Code | websearch | webfetch | webextract | webresearch | webcrawl | webmap |
|---|---|---|---|---|---|---|
| `adapter_unavailable` | YES | YES | YES | YES | YES | YES |
| `rate_limited` | YES | YES | YES | YES | YES | YES |
| `timeout` | YES | YES | YES | YES | YES | YES |
| `permission_denied` | YES | YES | YES | YES | YES | YES |
| `invalid_input` | YES | YES | YES | YES | YES | YES |
| `unsupported_operation` | YES | YES | YES | YES | YES | YES |
| `content_too_large` | — | YES | — | — | — | — |
| `content_blocked` | — | YES | YES | — | YES | YES |
| `content_not_found` | — | YES | YES | — | YES | YES |
| `unsupported_source` | YES | — | — | — | — | — |
| `extraction_schema_mismatch` | — | — | YES | YES | — | — |
| `schema_too_large` | — | — | YES | YES | — | — |
| `schema_invalid` | — | — | YES | YES | — | — |
| `extraction_empty` | — | — | YES | YES | — | — |
| `autonomous_budget_exceeded` | — | — | — | YES | — | — |
| `autonomous_unavailable` | — | — | — | YES | — | — |
| `crawl_depth_exceeded` | — | — | — | — | YES | — |
| `crawl_timeout` | — | — | — | — | YES | — |
| `crawl_robots_blocked` | — | — | — | — | YES | — |
| `crawl_rate_limited` | — | — | — | — | YES | — |
| `map_timeout` | — | — | — | — | — | YES |
| `map_no_sitemap` | — | — | — | — | — | YES |
| `map_robots_blocked` | — | — | — | — | — | YES |
| `sitemap_parse_error` | — | — | — | — | — | YES |
| `no_previous_version` | — | YES | — | — | YES | — |

Notes:
- First 6 codes are UNIVERSAL (apply to all 6 tools)
- Contract-specific codes are defined in each tool's "Error additions" section
- `no_previous_version` is informational (not a failure) — included for completeness
- Provider adapters map provider-specific errors to these PM error codes

## Gaps / Problems Identified

### FIRECRAWL INTEGRATION GAPS (all MVP per user)

1. **Schema-Based Structured Extraction** (HIGH) — webextract has no schema definition/validation
2. **Multi-Source Search Categories** (MEDIUM) — websearch is web-only via Exa; no news/image/code/academic
3. **Change Detection / Monitoring** (MEDIUM) — ~~no equivalent designed for webfetch/webcrawl~~ NOW SPECIFIED in Part V (webfetch `change_tracking`, hash-based comparison); needs canonical landing [XV2-FIX]
4. **Autonomous Research Agent** (MEDIUM-HIGH) — webresearch has no autonomous navigation/form-filling
5. **Interactive Browser Actions for Research** (MEDIUM) — automation_session designed for testing, not research
6. **Batch Operations** (LOW-MEDIUM) — ~~no explicit batch scrape of arbitrary URL lists~~ NOW SPECIFIED in Part W (batch webfetch max 50 URLs, batch webextract max 10 URLs); needs canonical landing [XV2-FIX]
7. **Output Format Flexibility** (LOW-MEDIUM) — ~~webfetch focused on markdown; no screenshot/PDF/summary~~ NOW SPECIFIED in Part S (webfetch `formats`: 8 types including screenshot/pdf/summary); needs canonical landing [XV2-FIX]
8. **PDF Handling** (LOW-MEDIUM) — ~~web tools don't address PDF extraction~~ NOW SPECIFIED in Part S (webfetch `pdf_mode`: fast/auto/ocr); needs canonical landing [XV2-FIX]
9. **Webhook/Streaming for Long-Running Ops** (LOW) — async model not detailed
10. **Anti-Bot / Stealth** (LOW) — not addressed; less critical for IDE context
11. **Caching with TTL** (LOW-MEDIUM) — ~~no web content caching in planning docs~~ NOW SPECIFIED in Part W (per-project cache, per-operation TTL defaults, LRU eviction); ✅ [GAP-RESOLVE] cache size LOCKED — Decision #4: 500 MB default, configurable; needs canonical landing [XV2-FIX]

### CANONICAL DOC GAPS (from cross-reference audit)

12. **§8.2.1 ENTIRELY MISSING** — cited web search section referenced in newtools.md TOC (line 72) but never written
13. **"Reading Site" undefined as tool** — mentioned as activity label but never defined as tool
14. **No provider capability matrix** — hybrid provider model (Exa/Tavily/DDG/Google/model-native) exists in old ledger but zero canonical doc coverage
15. **No /web UI spec** — /web slash command family has no UI/UX specification in FinalGUISpec.md
16. **Plan mode permission contradiction** — Permissions_System.md auto-denies web tools in ask/plan modes, contradicting PM's web-research-first-class direction
17. **Slash-command SSOT drift** — ~~three incompatible slash-command lists across assistant-chat-design.md, FinalGUISpec.md, UI_Command_Catalog.md~~ largely aligned between assistant-chat-design.md and UI_Command_Catalog.md; FinalGUISpec references need verification [XV2-FIX]
18. **Commands override policy conflict** — ~~assistant-chat-design.md says no override; Commands_System.md allows override_builtin: true~~ RESOLVED: Commands_System.md already forbids overriding reserved built-ins [XV2-FIX]
19. **Personas.md field-name drift** — ~~`requested_persona_id`/`effective_persona_id` conflicts with Contracts_V0.md canonical naming~~ NOW CORRECT: Personas.md already uses `requested_persona`/`effective_persona` naming; no remaining drift [XV2-FIX]
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
| C2 | CRITICAL | assistant-chat-design.md / FinalGUISpec.md / UI_Command_Catalog.md | ~~Three incompatible slash-command lists~~ Largely aligned; FinalGUISpec references need verification [XV2-FIX] |
| C3 | ~~CRITICAL~~ RESOLVED | assistant-chat-design.md / Commands_System.md | ~~Override policy conflict for reserved built-ins~~ Commands_System.md already forbids overriding reserved built-ins [XV2-FIX] |
| C4 | ~~HIGH~~ RESOLVED | Personas.md / Contracts_V0.md | ~~Field naming conflict (requested_persona_id vs requested_persona)~~ Personas.md already uses correct `requested_persona`/`effective_persona` naming [XV2-FIX] |
| C5 | HIGH | Tools.md | ~~Tools SSOT lags web model — only websearch + webfetch fully defined~~ All 6 web tools listed but per-tool contracts still thin — need full expansion [XV2-FIX] |
| C6 | HIGH | Permissions_System.md | Preset narrowness — missing skill/lsp/question/todo/web tools |
| C7 | HIGH | Non-persona runtime | Missing fields: requested_account_id, requested_account_binding, execution_role, operational_identity, projection_freshness, projection_health |

### CROSS-VALIDATION IDENTIFIED GAPS [XV-ADD]

- Citation/provenance precedence hierarchy was completely dropped (6-level ordering) — ~~DROPPED~~ RESTORED in ledger Part P; needs canonical landing [XV2-FIX] [XV-ADD]
- Blocked-action recovery matrix was dropped (5 recovery paths by failure type) — ~~DROPPED~~ RESTORED in ledger Part D/K; needs canonical landing [XV2-FIX] [XV-ADD]
- `/web` bare-command behavior was dropped (opens help, no default op) [XV-ADD]
- Question-flow visuals → PM draft state was dropped (NOT via sendPrompt) [XV-ADD]
- MCP reconciliation map is MISSING (exists for 5 other areas but not MCP) — ~~MISSING~~ RESTORED in ledger Part N; needs canonical landing [XV2-FIX] [XV-ADD]
- Permission preset tables were completely dropped (Read-only/Plan/Full definitions) — ~~DROPPED~~ RESTORED in ledger Part L; needs canonical landing [XV2-FIX] [XV-ADD]
- Plan-state lifecycle was dropped (6 states: draft→approved→executing→completed→blocked→superseded) — ~~DROPPED~~ RESTORED in ledger Part F; needs canonical landing [XV2-FIX] [XV-ADD]
- Multi-question 5-state lifecycle was dropped (draft→incomplete→ready_to_submit→submitted→paused) — ~~DROPPED~~ RESTORED in ledger Part G; needs canonical landing [XV2-FIX] [XV-ADD]
- Task lifecycle states/failure/timeout never specified [XV-ADD]
- Skill tool input contract is MISSING (only output envelope exists) [XV-ADD]
- 9+ unsupported claims identified and removed from Parts A-C and R-X (spam blocklist, API rotation, rate thresholds, HMAC, LlamaParse, NUQ, overstated SDKs/formats/actions) [XV-ADD]
- Activity label wording drift between canonical set and routing algorithm [XV-ADD]
- `web_search` underscore naming was misattributed (provider convention, not PM's) [XV-ADD]
- Several items marked LOCKED were actually still open in old ledger (/skill, code-block visible copy, task defaults) [XV-ADD]

### SECOND-PASS AUDIT: Parts D-H — Cross-Validation Findings [2P-AUDIT]

> Second-pass deep audit of new ledger Parts D-H (lines 141-393) against old ledger w-20260316-160450, assistant-chat-design.md, FinalGUISpec.md, UI_Command_Catalog.md, and Run_Modes.md. First pass integrated 200+ items; this pass surfaces what the first pass missed.

#### Part D — Terminal / Inline Operation Cards

**FINDING-D01** | CRITICAL | Badge state mismatch vs. canonical doc
- New ledger Part D (line 163) defines 5 badge states: `running/completed/blocked/failed/cancelled`.
- New ledger state machine (lines 195-198) defines: `pending → running → completed | failed | cancelled`.
- Canonical `assistant-chat-design.md` (line 932) defines **8 command-card badge states**: `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, `attention_required`.
- Mapping conflicts: `completed` (new) vs `exited` (canonical); `cancelled` (new) vs `terminated` (canonical); `blocked` (new ledger only — not in canonical set); `starting`, `disconnected`, `restoring`, `attention_required` (canonical only — not in new ledger).
- Fix: align Part D badge state set with `assistant-chat-design.md §13` canonical list; document any intentional divergences explicitly.

**FINDING-D02** | CRITICAL | `blocked` in anatomy but absent from state machine transitions
- Card anatomy (line 163) lists `blocked` as a valid badge value.
- Card Status Badge State Machine (lines 195-198) defines `pending→running→completed|failed|cancelled` — `blocked` has no entry-point transition.
- Old ledger (~lines 381-388) treated `blocked` as a recoverable state with defined recovery paths.
- This is an internal inconsistency: how does a card reach `blocked`? No trigger or transition defined.
- Fix: add `running → blocked` and `blocked → running | cancelled` transitions; document what triggers `blocked` (permission denied, FileSafe held, MCP unavailable).

**FINDING-D03** | HIGH | Headless recovery action is semantically invalid
- Blocked-Action Recovery Matrix (line 182): headless mode recovery = "show 'open in Terminal' option."
- In headless mode there is no terminal/TTY — offering `Open in Terminal` is a nonsensical action.
- Old ledger (~lines 2670-2675) correctly says headless = "show that interactive approval was unavailable and what user action can resume it."
- Part K (line 578) also correctly states: "Headless ask denial → show that interactive approval unavailable + what user action resumes."
- Fix: replace headless recovery action with the Part K formulation — show "interactive approval was unavailable" message + link to the action that can resume (e.g., open app in interactive mode or switch to an interactive surface).

**FINDING-D04** | HIGH | `Rerun in Terminal` is an undefined and uncataloged label
- Part D (line 211) uses the label `Rerun in Terminal` in the inline-only + complete recovery path.
- This label is not locked anywhere in either ledger.
- Old ledger only locked `Open in Terminal` and `Show Terminal` as terminal-reveal labels.
- `UI_Command_Catalog.md` (line 337-351) catalogs `cmd.terminal.show` and `cmd.chat.retry_message` but has no `cmd.terminal.rerun` or equivalent for `Rerun in Terminal`.
- Fix: either lock `Rerun in Terminal` explicitly with its corresponding stable command ID (`cmd.terminal.restart_session` or a new entry), or replace with `Rerun` + separate `Open in Terminal`, keeping label budget consistent with the terminology lock.

**FINDING-D05** | HIGH | `Open in Terminal` / `Show Terminal` equivalence not documented in Part D
- `UI_Command_Catalog.md` (line 337) explicitly states: "`Open in Terminal` and `Show Terminal` normalize to `cmd.terminal.show`; they do not imply `cmd.terminal.new_tab`."
- Part D Action Taxonomy (lines 184-188) lists both `show terminal` and `detach/pop-out` but does not state they share a backing command.
- Part D terminology lock (line 214) locks `Open in Terminal` but does not explain its relationship to `Show Terminal`.
- This omission will cause implementors to wonder if they are distinct commands or aliases.
- Fix: add a note to Part D Action Taxonomy — "Both `Open in Terminal` and `Show Terminal` resolve to `cmd.terminal.show`; they differ only in which context surface triggers them."

**FINDING-D06** | MEDIUM | Diff card truncation overflow behavior is unspecified
- Diff card spec (line 165): "cap=50 lines; diff preview sizing same as other cards."
- No truncation indicator, no "show full diff" action, and no fallback spec for diffs > 50 lines.
- Old ledger (~lines 107-108) confirmed the 50-line cap unit but not overflow behavior.
- Fix: add "diffs > 50 lines: show truncation marker (e.g., `… N lines omitted`) + `View Full Diff` action resolving to `cmd.file.open_with` diff view."

**FINDING-D07** | MEDIUM | `background` action has no card-state consequence spec
- Action Taxonomy (line 187): "background: move long-running operation to background."
- No spec for what happens to the card when an operation is backgrounded: Does the card show a `backgrounded` status? Where does the user monitor it? Is there a background operations panel?
- Fix: define card behavior when operation is sent to background (e.g., badge transitions to `running` with a "backgrounded" annotation, user accesses it via activity tray or terminal session).

**FINDING-D08** | MEDIUM | Action Taxonomy does not specify which actions apply to which card types
- Action Taxonomy (lines 184-189) lists 4 actions: expand, show terminal, background, detach/pop-out.
- No mapping to card types: does a search card support `show terminal`? Does a diff card support `background`? Does a web card support `detach/pop-out`?
- Fix: add a matrix or note per card type specifying applicable actions; at minimum note which actions are terminal-card-only.

**FINDING-D09** | MEDIUM | Web operation card streaming policy is unspecified
- Part D (line 217): "Search and diff operations have NO streaming rule — results appear complete."
- No corresponding statement for web operation cards (`Searching Web`, `Extracting Site`, `Researching Web`, `Crawling Site`, `Mapping Site`, `Reading Site`).
- `Researching Web` in particular may involve multi-step processing; streaming intermediate results vs. appear-complete is important for UX.
- Fix: add streaming/completion policy for each web card type; at minimum state whether `Researching Web` shows intermediate status or only final results.

**FINDING-D10** | MEDIUM | Card summary format not aligned with all 6 web card types
- Line 171 defines card summary format: `<operation>: <query/url> — N sources`.
- `Reading Site` takes a URL, not a query — format OK.
- `Researching Web` takes a `<task>` (not URL, not simple query) — format ambiguous.
- `Mapping Site` returns a map structure, not `N sources` — "N sources" doesn't apply.
- Fix: specify a summary format per web card type that matches its actual input/output structure.

**FINDING-D11** | LOW | Inline Comfort Threshold has undefined relationship to 5/15-line defaults
- Mini-Terminal Card Defaults (lines 143-145): collapsed=5 lines, expanded=15 lines (locked).
- Inline Comfort Threshold (lines 200-202): exact values are "implementation-detail."
- These defaults implicitly define the thresholds but the spec doesn't say whether promotion triggers at >15 lines, at >5× collapsed lines, or at some other formula.
- Fix: either explicitly define the comfort threshold relative to the 5/15 defaults, or explicitly state the threshold is unrelated to the 5/15 display defaults.

#### Part E — Chat Controls & Message Actions

**FINDING-E01** | CRITICAL | Queue capacity (max-2) is absent from Part E
- `assistant-chat-design.md` (lines 225, 229, 239) explicitly defines: "Queued messages (max 2, FIFO)" with "queue is full (2 messages)" handling (clear queue / send now replace first).
- Part E says nothing about queue capacity — it mentions queuing behavior in line 232 but never states max-2 FIFO.
- Old ledger (~lines 2140-2147) explicitly flagged "old wording that implies one queued message instead of an ordered max-2 queue" as a contradiction to fix and canonize.
- Fix: add to Part E the max-2 FIFO queue capacity rule and the "queue full" behavior per `assistant-chat-design.md §4`.

**FINDING-E02** | HIGH | Code block copy was a resolved decision in old ledger, downgraded to OPEN QUESTION
- Old ledger "stable interaction rules ready to canonize" section explicitly listed: "ordinary fenced code blocks should also expose a visible copy affordance; code-block copy should coexist with existing file-open / LSP go-to-definition behavior."
- New ledger Part E (line 250) marks code block copy as an explicit OPEN QUESTION.
- This is a DROPPED DECISION — the old ledger had resolved it; the new ledger re-opens it without explanation.
- Fix: restore the locked decision (always-visible copy affordance on fenced code blocks, coexisting with LSP actions) and remove the OPEN QUESTION flag, or document why it was re-opened.

**FINDING-E03** | MEDIUM | Missing spec for Stop/Edit/Resend on run completion (no next message)
- Part E (line 228): "Stop/Edit/Resend disappear once next user message sent."
- No spec for what happens if a run completes without the user sending a new message.
- Do the controls persist indefinitely? Disappear on run completion? Time out?
- Old ledger (~line 194) only locked the "next message sent" trigger, not run-completion behavior.
- Fix: specify the behavior: e.g., "Stop disappears when run completes; Edit/Resend persist until next message sent."

**FINDING-E04** | MEDIUM | First message row action model (lines 236-241) is incomplete vs. the second (lines 257-263)
- Lines 236-241 define a 3-row model: assistant, most-recent user, older messages.
- Lines 257-263 define a 5-row model adding system message and subagent message rows.
- The first definition will be read as the complete model by implementors who don't see the extension.
- The expansion in lines 257-263 is not annotated as additive or as superseding lines 236-241.
- Fix: replace the first model entirely with the 5-row model, or annotate lines 257-263 as "[XV-ADD: expanded from 3-row model to include system and subagent rows]".

**FINDING-E05** | MEDIUM | Queue row action model is entirely absent
- The old ledger extensively covered queue strip behavior (edit, send-now-steer, cancel per queued row).
- Part E's message row action model (both the basic and the "per-type" extension) covers only rendered message rows — it never addresses actions available on **queued-but-not-yet-sent** messages in the queue strip.
- `assistant-chat-design.md` (line 239) specifies queue row actions: Edit, Send now (steer), Cancel.
- Fix: add a "Queue strip rows" entry to the message row action model with actions: Edit / Send now / Cancel.

**FINDING-E06** | MEDIUM | Rewind warning visual presentation is unspecified
- Part E (line 227): inline rewind warning shown before Edit confirms.
- No spec for how the warning is rendered: inline in thread? Tooltip? Hover state? Inline banner?
- Old ledger (~line 190): "inline rewind warning, no extra confirmation dialog" — only says no separate dialog.
- Fix: specify presentation: e.g., "inline contextual warning banner within the message row, no modal dialog."

**FINDING-E07** | LOW | Subagent disclosure requirements vs. action model partial overlap
- Subagent Disclosure Requirements (lines 253-255): disclose which subagent, why invoked, what task it owns.
- Subagent message row action model (lines 262-263): "copy + subagent identity badge; no direct edit/resend."
- Badge provides identity but not invocation reason or task ownership — the disclosure requirements are broader than the action model captures.
- Fix: clarify whether subagent disclosure is inline in the card (expandable detail) or in a separate disclosure panel; reference the activity transparency spec in Part P.

#### Part F — Plan / Deep Plan / TODO Tracking

**FINDING-F01** | CRITICAL | `Superseded` used in inline progress but not in TODO status enum
- TODO status set (line 274): `pending`, `in_progress`, `completed`, `blocked`, `skipped` — no `superseded`.
- Inline progress milestones (line 293) show `Superseded TODO 5/5` as a valid milestone display.
- The `superseded` state exists at the PLAN level (line 279) but NOT at the TODO-item level.
- This is a critical data-model inconsistency: the UI renders a status (`Superseded`) that does not exist in the schema that backs it.
- Fix: either add `superseded` to the TODO status enum (with a note it propagates from plan-level supersession), or change the inline progress format to say "Plan superseded" (plan-level label) rather than "Superseded TODO N/N" (item-level label).

**FINDING-F02** | HIGH | `notes?` and `order_index?` in TODO schema are new additions, not labeled as such
- Part F (line 273) lists `notes?` and `order_index?` in the normalized TODO schema without annotation.
- Old ledger TODO schema (lines 3747-3774) and `assistant-chat-design.md` canonical TODO fields list: `todo_id`, `title`, `summary`, `dependencies[]`, `owner_hint`, `verification_hint`, `status`. `notes?` and `order_index?` are NOT in the canonical list.
- These are legitimate additions but are presented as if always locked, without a [XV-ADD] tag.
- Fix: annotate `notes?` and `order_index?` as [XV-ADD] fields not present in the original canonical schema.

**FINDING-F03** | HIGH | Structural edit vs. status update boundary is undefined
- Part F (lines 282-283): "After approval: structural edits gated/restricted; status updates continue automatically" and "Later changes require explicit replan/revise flow."
- "Structural edits" is never defined. Adding a new TODO? Reordering? Changing a title? Changing a dependency? All of these could be considered structural.
- Without this definition, implementors cannot distinguish what is locked vs. freely mutable post-approval.
- Fix: define "structural edit" — e.g., "adding, removing, or reordering TODO items or changing their `dependencies[]` or `title`; does NOT include status transitions or notes updates."

**FINDING-F04** | MEDIUM | Auto-use heuristic trigger behavior (what happens on fire) is missing
- Auto-Use Heuristic (lines 297-300) lists trigger conditions.
- No spec for what happens when the heuristic fires mid-conversation: Create TODO list from scratch? Require user confirmation? Appear as a new plan card/panel? Emit a `chat.plan_todo_updated` event?
- Fix: add the on-trigger behavior, e.g., "when auto-use fires, agent silently creates a plan in `draft` state and surfaces the sticky plan panel; user can dismiss."

**FINDING-F05** | MEDIUM | `chat.plan_todo_updated` event payload undefined
- Part F (line 284) references `chat.plan_todo_updated` as the canonical storage event family.
- No payload schema is defined anywhere in Parts D-H or in Part P's event payload specifications.
- Old ledger (~line 3800) only says "use `chat.plan_todo_updated` as the canonical event family" without defining its structure.
- Fix: define minimum payload fields, e.g., `{ thread_id, run_id, plan_id, revision, todos: Array<NormalizedTodoItem>, plan_state }`.

**FINDING-F06** | MEDIUM | `owner_hint` advisory-to-effective lifecycle mechanism is undefined
- Part F (line 275): "`owner_hint` starts as advisory suggestion, can evolve to effective delegated owner during execution."
- No spec for how this evolution is triggered or recorded — what event sets it? What schema field stores effective ownership vs. advisory?
- Old ledger (~lines 2456-2457): "progress rows can surface delegated owner changes without rewriting the original TODO identity" — mentions it can be surfaced but not how it's triggered.
- Fix: define the evolution mechanism, e.g., "when a subagent claims a TODO item (via `todowrite` with `owner_hint` matching its own identity), `owner_hint` becomes effective; prior advisory value preserved in `owner_hint_original`."

**FINDING-F07** | LOW | Sticky Plan Panel `verification_hint` scope is ambiguous
- The Sticky Plan Panel (line 287) displays "verification hint" as a panel field.
- `verification_hint` is a per-TODO-item field (line 273), not a plan-level field.
- Does the panel show one verification hint per TODO item row (correct per schema) or a plan-level summary?
- Fix: clarify whether the panel shows per-item `verification_hint` inline in each row, or a plan-level summary (which would require defining a plan-level `verification_hint` field).

#### Part G — Question Card / Questionnaire System

**FINDING-G01** | CRITICAL | Question Card Schema uses `prompt` but QuestionItem contract uses `question` — different field names for same concept
- Question Card Schema (line 337): fields include `question_id`, **`prompt`**, `options[]`, `allow_other`, etc.
- Question Tool Contract QuestionItem (line 343): fields include `question_id`, **`question`**, `description?`, etc.
- These are two different field names for the question text on what must be the same underlying entity.
- Old ledger (line 3710-3718) consistently uses `question` in the QuestionItem definition.
- Fix: unify to a single field name; `question` matches the old ledger and the tool contract; update the Question Card Schema field from `prompt` to `question`, or explicitly document that `prompt` (schema) is the UI-facing binding for `question` (contract).

**FINDING-G02** | HIGH | `source?` field exclusion claim is unsupported — old ledger includes it
- New ledger (line 345): `~~source? field in answers~~: deliberately excluded per old ledger final pass [XV-FIX]`.
- Old ledger (line 3722) explicitly includes it as optional: `answers: Array<{ question_id, values: string[], source?: "option" | "other" | "freeform" }>`.
- No section of the old ledger contains a "final pass" that removes `source?` — no such exclusion exists in the old ledger record.
- The [XV-FIX] claim is factually incorrect — this is an UNDOCUMENTED removal, not a restoration of an old ledger decision.
- Fix: either restore `source?: "option" | "other" | "freeform"` as optional in the output envelope (matching old ledger), or correctly document why it was removed (implementation complexity, not old ledger decision).

**FINDING-G03** | HIGH | `options` format UNRESOLVED despite old ledger having locked object-array
- Part G (line 351): "options format ⚠️ UNRESOLVED: `string[]` vs `Array<{id, label, description?}>`."
- Old ledger "v1 expanded contract" (line 2181) explicitly specifies: `options?: Array<{ id, label, description? }>` (object array).
- The v1 expanded contract was the recommended and intended format. Marking this as UNRESOLVED when the old ledger had a decision is a DROPPED DECISION.
- Note: old ledger line 2164 (in a different context) uses `options?: string[]` for the legacy single-question path. The two paths may use different formats, which IS a real open question — but the object-array format was locked for the richer questionnaire path.
- Fix: restore the lock for `Array<{id, label, description?}>` for multi-question/questionnaire mode; `string[]` remains acceptable only for backwards-compatible legacy single-question callers.

**FINDING-G04** | HIGH | Subagent question-spawn rule is weaker than canonical doc
- New ledger Part G (line 347): "Subagents should NOT spam users with independent question flows."
- `assistant-chat-design.md` (line 1051): "Children do not question the user directly by default. A child escalates to the parent; the parent decides whether to answer from existing context, send more context, ask the user, reroute, or cancel the child."
- "Should not spam" (soft preference) is materially weaker than "do not question directly by default" (hard default denial).
- Fix: strengthen Part G line 347 to: "Subagents MUST NOT invoke the `question` tool to address users directly — they must escalate to the parent orchestrator, per `assistant-chat-design.md §15.2`. The parent decides whether to surface a question to the user."

**FINDING-G05** | MEDIUM | `allow_freeform?` / `allow_other?` naming ambiguity — same field or different?
- Question Tool Contract (line 343): lists "`allow_freeform?`/`allow_other?`" with a slash, suggesting alternatives.
- Question Card Schema (line 337): lists only `allow_other` — no `allow_freeform`.
- Old ledger (line 2183): uses only `allow_freeform` (not `allow_other`). Old ledger line 3717: uses `allow_freeform? / allow_other?` — same slash-ambiguity.
- It is unclear whether these are: (a) synonymous aliases, (b) two distinct boolean flags, or (c) one field with a renamed-in-flight.
- Fix: pick one canonical name (recommend `allow_other` per Question Card Schema) and deprecate/remove the other. Document explicitly.

**FINDING-G06** | MEDIUM | `default_values?` (tool contract) vs. `draft_value` (schema) are different concepts, both exist but not cross-referenced
- Tool contract QuestionItem (line 343): `default_values?` (plural, pre-set answer before user interaction).
- Question Card Schema (line 337): `draft_value` (singular, autosaved in-progress answer).
- These are genuinely different: `default_values?` is the initial seeded answer; `draft_value` is the live autosave.
- Neither field appears in BOTH places — `draft_value` is only in the schema, `default_values?` only in the contract.
- Fix: add `draft_value?` to the tool contract (as a runtime-side field) and add `default_values?` to the card schema (as the initial seed); add a note explaining the distinction.

**FINDING-G07** | MEDIUM | Multi-question lifecycle state machine lists states but omits all transition triggers
- Multi-Question Lifecycle (lines 332-335): 5 states: `draft → incomplete → ready_to_submit → submitted → paused`.
- No transition triggers defined. What triggers `draft → incomplete`? What triggers `incomplete → ready_to_submit`? What triggers the transition to `paused`?
- Fix: add transition rules: `draft → incomplete` = user begins answering any question; `incomplete → ready_to_submit` = all `required` questions answered; `ready_to_submit → submitted` = user confirms submit; `paused` = user dismisses without submitting; `submitted → [terminal]` = no further transitions.

**FINDING-G08** | MEDIUM | Legacy single-question "syntactic sugar" claim is under-specified
- Part G (line 349): "Legacy single-question mode is syntactic sugar over the richer multi-question envelope."
- No spec of what "syntactic sugar" means concretely — does the agent see a single-question API surface? Or does the host always receive a multi-question envelope with one item?
- Old ledger (~lines 2168-2204): described single-question path as backwards-compatible legacy mode, with `answer_text?` as compat output.
- Fix: specify the sugar behavior: "Single-question callers emit `{ mode: 'single_question', questions: [item] }` and receive a response envelope; the host may accept a simplified `{ question, options?, ... }` alias that is internally promoted to the full envelope before processing."

**FINDING-G09** | LOW | `response_kind` and `validation_state` are listed in schema but ⚠️ UNRESOLVED — risk of schema pollution
- Question Card Schema (line 337) lists `response_kind ⚠️` and `validation_state ⚠️` as fields without defined values.
- Including undefined fields in a schema creates ambiguity for implementors (should they implement these fields? What values are valid?).
- Fix: move `response_kind` and `validation_state` to a separate "Future Fields" or "TBD" annotation outside the core schema table; keep them tracked but not as active schema members until resolved.

#### Part H — Inline Visualizer / Mermaid

**FINDING-H01** | HIGH | "No fallback mode" (line 376) directly contradicts "show source or fallback" (line 375)
- Line 375: "When rendering fails: show source or fallback + visible error state."
- Line 376: "No fallback mode (do not silently degrade to text-only)."
- The word "fallback" in line 375 implies there IS a fallback mode; line 376 says there is not.
- Old ledger: "visuals are expected to be supported directly; no alternate fallback mode or accessibility-only mode is being requested here" — this was about no accessibility-only text mode, NOT about rendering failure recovery.
- The new ledger conflates "no accessibility-text-only mode" with "no fallback on rendering failure."
- Fix: rewrite line 375 as: "When rendering fails: show the source fragment (raw code or HTML) with a visible error indicator." Rewrite line 376 as: "No silent text-only degradation — rendering failure shows the source, not a silent text-only substitute."
- [RECOVERY-FIX] Reconciled specification: "On render failure: show the SOURCE code/markup + a visible error banner. This IS the failure mode. What is PROHIBITED is silently falling back to a text-only rendering as if the visualizer didn't exist. The user must always know rendering failed."

**FINDING-H02** | HIGH | Inline visualizer absent from Chat Widget Taxonomy
- Chat Widget Taxonomy (lines 391-393): "Plain code blocks, diff/operation cards, Mermaid/native diagram cards, question cards = related but distinct message widgets."
- The general-purpose HTML/JS inline visual module (sandboxed, with host bridges) is architecturally a distinct 5th widget type — but it is not listed.
- Fix: add "Inline visual module (HTML/SVG fragment, sandboxed, general-purpose interactive)" as a 5th entry in the taxonomy.
- [RECOVERY-FIX] 5th widget type full description (from old ledger lines 207-213): "Inline HTML/JS Visual Module — sandboxed iframe rendering agent-generated HTML/JS/CSS fragments. Used for data visualizations, interactive diagrams, and custom UI that exceeds Mermaid/code-block capabilities."

**FINDING-H03** | MEDIUM | Narrow bridge CONTRACT is absent — only names are provided
- Part H (line 367): "narrow bridges: `sendPrompt(text)`, `openLink(url)`, theme injection, auto-height/resize reporting."
- No contract for ANY bridge: what does `sendPrompt(text)` do in PM's context? What does `openLink(url)` trigger? How are theme tokens injected? What triggers resize reporting?
- Fix: add a bridge contract section: `sendPrompt(text)` → queues a message into the active thread composer (same as user typing); `openLink(url)` → routes via `cmd.browser.open_detached_preview` or system browser if external; theme injection → host pushes CSS custom property bundle on mount and on theme change; resize reporting → visual sends `{ height: px }` message to host, host adjusts card height.
- [RECOVERY-FIX] Minimal bridge contracts (from old ledger lines 200-206):
  ```
  sendPrompt(text: string): void  — injects text into chat input as if user typed it
  openLink(url: string, target?: "_blank" | "_self"): void  — opens URL; _blank = new tab, _self = navigate (blocked in sandbox)
  copyToClipboard(text: string): Promise<boolean>  — copies text to system clipboard via host bridge
  requestResize(width?: number, height?: number): void  — requests container resize; host may constrain
  ```
  Note: All bridge calls are async-safe. sendPrompt in question-flow context submits as question answer, not new chat message.
- [RECOVERY-FIX] sendPrompt dual-context enforcement: "Bridge enforces context: if a questionnaire is active when sendPrompt is called from within a visualizer, the text is routed as a question answer (not a new chat message). If no questionnaire is active, it's routed as a new chat input. The bridge does NOT allow the visualizer to bypass the question flow."

**FINDING-H04** | MEDIUM | Theme token injection schema marked ⚠️ UNRESOLVED but also marked ADOPTED — contradiction
- Part H (line 388): "Visualizer theme token injection schema — exact token names, format, and injection mechanism not yet locked ⚠️ UNRESOLVED."
- Part H (line 367) and Part Q (line 1083): "ALL ADOPTED for PM visual module" — all bridges including theme injection were adopted from external reference.
- An ADOPTED bridge with an UNRESOLVED schema is a contradiction — adoption covers the concept, not the spec.
- Fix: clarify: "Theme injection bridge is adopted as a concept; the exact CSS custom property token names and injection protocol are UNRESOLVED pending design system token mapping."
- [RECOVERY-FIX] GAP-RESOLVE verification: The Part H spec section now has Decision #10 resolved — the "UNRESOLVED" status is cleared. The mechanism is LOCKED: "CSS custom properties injected as inline style on visualizer container. MVP tokens: `--pm-viz-bg`, `--pm-viz-fg`, `--pm-viz-accent`, `--pm-viz-border`, `--pm-viz-font-family`, `--pm-viz-font-size`." The contradiction is resolved — both the concept (ADOPTED) and the mechanism (LOCKED via GAP-RESOLVE) are now consistent. Any remaining reference to "UNRESOLVED" for the theme-token mechanism in Part H is stale and must be removed.

**FINDING-H05** | MEDIUM | Third-party library allowlist is entirely undefined
- Part H (line 374): "Third-party libraries/scripts allowed through PM's supported visual runtime."
- No definition of "PM's supported visual runtime": no allowlist, no vetting process, no version pinning requirement.
- Old ledger (~line 170): "third-party script/library use is allowed" — equally without boundary.
- Fix: add minimum specification: "Allowed libraries must be bundled in the source fragment — no CDN fetches at runtime. No unvetted network requests from within the visual module. Exact allowlist TBD; tracked as OPEN QUESTION."
- [RECOVERY-FIX] Full allowlist specification (from old ledger line 170 + inference): "Allowed libraries must be BUNDLED in the source fragment — no CDN fetches at runtime. No unvetted network requests from within the visual module. Exact allowlist TBD (tracked as open design item). Recommended MVP approach: no external libraries; agent must inline all code. Post-MVP: curated allowlist of bundled libraries (e.g., D3, Chart.js, Three.js)."

**FINDING-H06** | MEDIUM | Sandbox settings (iframe attribute tokens) never specified
- Part H (line 363): "Same-origin isolation and sandbox settings apply to bridge behavior."
- The `sandbox` attribute on an iframe has specific token values (`allow-scripts`, `allow-same-origin`, etc.). No combination is specified.
- Old ledger (~line 206): "same-origin/sandbox settings matter for the richer bridge behavior" — also unspecified.
- Fix: specify the intended sandbox token set, e.g., "iframe sandbox: `allow-scripts` only (no `allow-same-origin` to isolate from PM origin; postMessage bridge used for all cross-boundary communication)."
- [RECOVERY-FIX] Exact iframe sandbox attribute tokens (from old ledger line 206): "Iframe sandbox attributes: `sandbox='allow-scripts'` (minimum for JS execution). Explicitly DENIED: `allow-same-origin`, `allow-forms`, `allow-popups`, `allow-top-navigation`. Communication via `postMessage` bridge only."

**FINDING-H07** | MEDIUM | Anti-HTML-Execution Guard scope unclear against inline visualizer
- Anti-HTML-Execution Guard (lines 360-363): "Mermaid/Markdown rendering MUST NOT execute arbitrary HTML."
- Inline visualizer (lines 365-376) explicitly DOES allow arbitrary HTML/JS in the sandboxed module.
- The guard says "Mermaid/Markdown" but a reader scanning Part H may misread it as banning what the visualizer allows.
- Old ledger (~line 2148): "chat Markdown/Mermaid wording could be misread as permitting arbitrary embedded HTML execution."
- Fix: add a clarifying note to the Anti-HTML-Execution Guard: "This guard applies to Markdown/Mermaid rendering only. The separate sandboxed inline visual module (§H below) explicitly supports HTML/JS fragments within its isolated sandbox boundary — it is NOT covered by this guard."
- [RECOVERY-FIX] Rendering context clarification (from old ledger line 2147): "The anti-raw-HTML guard applies to Markdown message rendering (no raw HTML injected into chat message flow). The Inline Visualizer is EXEMPT because it renders inside a sandboxed iframe, not in the message DOM. These are different rendering contexts."

**FINDING-H08** | MEDIUM | Dual persistence specs for visualizer are divergent without reconciliation
- Visualizer Persistence (lines 378-381): persist source fragment, metadata (title, kind, version), PM-managed outputs/draft values.
- Visualizer Persistence Clarification (lines 383-386): persist rendered output references, source data, metadata.
- "Rendered output references" appears in the clarification but not in the main persistence section; "source fragment" (main) ≠ "source data" (clarification) — are they the same?
- Fix: consolidate into one persistence spec. Canonical fields: `{ source_fragment: string, title?: string, kind: string, version?: string, pm_managed_outputs?: object }`. Explicitly note that rendered output references are NOT persisted (render from source on reload).
- [RECOVERY-FIX] Consolidated persistence model (from old ledger lines 2134-2141): "Persistence model: (1) source fragment (HTML/JS/CSS string), (2) render config (width, height, theme tokens), (3) rendered output reference (screenshot/snapshot for scroll-back). On session reload: re-render from source fragment + config. Screenshot is fallback for when re-render is impractical."

**FINDING-H09** | LOW | HTML/SVG allowlist for sanitization is undefined
- Part H (line 362): "Strict sanitization required — allowlisted tags/attributes only."
- No allowlist defined anywhere. What tags? What attributes?
- This is a security-relevant spec gap: without an allowlist, strict sanitization cannot be implemented correctly.
- Fix: add minimum allowlist or forward reference to a security spec document: "Allowlisted tags/attributes tracked in `Plans/security-sanitization.md` (TBD). Baseline: standard HTML5 safe subset per DOMPurify's DEFAULT_ALLOWED_TAGS; no `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>` with external URL references."
- [RECOVERY-FIX] HTML/SVG sanitization by rendering context: "Inside sandboxed iframe, agent-generated HTML/SVG is NOT sanitized (sandbox provides isolation). In message-flow context (non-iframe), raw HTML/SVG is BLOCKED by the anti-HTML guard. Mermaid SVG output is sanitized by the Mermaid library's built-in DOMPurify pass."

#### Cross-Part / Cross-Reference Issues

**FINDING-X01** | HIGH | Subagent question-default denial not in subagent default-denial list
- Part L (line 644-646): subagent default denial list includes `todowrite`, `todoread`, nested task — does NOT include `question`.
- Old ledger (~line 2196) says subagents should not independently spawn question flows.
- `assistant-chat-design.md` (line 1051): "Children do not question the user directly by default."
- Fix: add `question` to the Part L subagent default-denial list with annotation: "subagent default = deny; subagents must escalate to parent orchestrator to surface questions to the user."

**FINDING-X02** | MEDIUM | `question` listed as needing addition to Permissions_System.md in Part G, but Part K already has it — creates confusion about current state
- Part G (line 348): "Add `question` to Permissions_System.md; default = allow when HITL available."
- Part K (lines 545-546): `question` appears in the canonical tool permission keys with "default=allow when HITL available."
- If Part K already has it, Part G's "Add" instruction is stale/confusing. If Part K is aspirational (not yet in Permissions_System.md), then BOTH should say "not yet in the doc."
- Fix: clarify Part G line 348 — state whether `question` is already in Part K and therefore in Permissions_System.md (remove the "Add" imperative) or is still pending (align both parts to say "still to add").

**FINDING-X03** | MEDIUM | `sendPrompt` bridge dual-context rule lacks enforcement mechanism
- Part H (line 367): `sendPrompt(text)` is a narrow bridge for the inline visualizer.
- Part G (line 313): "Question-flow visuals write directly into PM-managed draft state, NOT via `sendPrompt`."
- The split rule (use sendPrompt for general visuals; do NOT use it for question-flow visuals) is stated but there is no spec for HOW the visualizer distinguishes context (general vs. question-flow).
- Fix: specify the mechanism: e.g., "When a visual module is embedded within a question card, the host omits `sendPrompt` from the bridge — the bridge is intentionally narrowed to prevent question-flow visuals from bypassing PM draft state."

**FINDING-X04** | MEDIUM | Card `blocked` state to Blocked-Action Recovery Matrix relationship is undefined
- Part D (line 163): badge state list includes `blocked`.
- Blocked-Action Recovery Matrix (lines 177-182): 5 recovery paths by failure type.
- No spec connecting WHICH block type causes the card to show `blocked` badge state vs. showing a separate approval card.
- Example: does a permission-blocked tool call show the card in `blocked` state, or does it spawn a separate HITL approval card?
- Fix: add a mapping, e.g., "Permission blocked, FileSafe blocked → card badge `blocked` + inline recovery actions. MCP/Provider unavailable → card badge `blocked` + retry/config actions. Headless mode → card badge `blocked` + informational message."

**FINDING-X05** | LOW | Part E scroll auto-follow behavior not cross-referenced to FinalGUISpec
- Part E (line 244): "Scrolling: auto-follow tail when user scrolled to bottom; pause auto-follow when user scrolls up."
- `FinalGUISpec.md` (line 928): "If scrolled to bottom: auto-scroll to show new content."
- `assistant-chat-design.md` (line 1502): "While streaming, if user has scrolled up, do NOT auto-scroll; only auto-scroll when already at bottom."
- Part E is consistent with canonical behavior but does not cross-reference either canonical source.
- Fix (LOW): add ContractRef to Part E scroll rule pointing to `assistant-chat-design.md §24.4`.

**FINDING-X06** | LOW | Questionnaire draft persistence forward reference to storage-plan.md is unverified
- Part G (lines 327-330): "Questionnaire drafts auto-save to storage landing zone defined in storage-plan.md."
- Old ledger (~lines 2206-2208): only said storage should register "bounded structured answer data."
- `storage-plan.md` has not been verified to contain this landing zone.
- Fix: add a tracking note that `storage-plan.md` questionnaire landing zone verification is pending; add it to the reconciliation map (Part Q).

#### Summary Table

| ID | Sev | Part | Issue |
|----|-----|------|-------|
| D01 | CRITICAL | D | Badge states (5 in new ledger) don't match canonical 8 from assistant-chat-design.md §13 |
| D02 | CRITICAL | D | `blocked` badge in anatomy but no state machine transition to reach it |
| D03 | HIGH | D | Headless recovery offers "Open in Terminal" — invalid in headless context |
| D04 | HIGH | D | `Rerun in Terminal` not in UI_Command_Catalog; not locked |
| D05 | HIGH | D | `Open in Terminal` = `Show Terminal` = `cmd.terminal.show` — equivalence not documented |
| D06 | MEDIUM | D | Diff card: no truncation behavior for diffs > 50 lines |
| D07 | MEDIUM | D | `background` action: no spec for card state after backgrounding |
| D08 | MEDIUM | D | Action taxonomy: no per-card-type applicability mapping |
| D09 | MEDIUM | D | Web operation cards: no streaming vs. complete-result policy |
| D10 | MEDIUM | D | Card summary format `<operation>: <query/url> — N sources` not aligned with all 6 web card types |
| D11 | LOW | D | Comfort threshold has undefined relationship to 5/15-line defaults |
| E01 | CRITICAL | E | Queue max-2 FIFO capacity absent from Part E; locked in canonical doc |
| E02 | HIGH | E | Code block copy was a locked decision in old ledger; downgraded to OPEN QUESTION without explanation |
| E03 | MEDIUM | E | Stop/Edit/Resend behavior on run completion (no next message) unspecified |
| E04 | MEDIUM | E | First message row action model (lines 236-241) is incomplete; extension in lines 257-263 not annotated |
| E05 | MEDIUM | E | Queue strip row actions absent from message row action model |
| E06 | MEDIUM | E | Rewind warning visual presentation unspecified |
| E07 | LOW | E | Subagent disclosure requirements broader than subagent action model captures |
| F01 | CRITICAL | F | `Superseded TODO N/N` in inline progress but `superseded` not in TODO status enum |
| F02 | HIGH | F | `notes?` / `order_index?` are new TODO schema additions — not annotated as [XV-ADD] |
| F03 | HIGH | F | "Structural edit" vs "status update" boundary never defined |
| F04 | MEDIUM | F | Auto-use heuristic: on-trigger behavior unspecified |
| F05 | MEDIUM | F | `chat.plan_todo_updated` event payload schema never defined |
| F06 | MEDIUM | F | `owner_hint` advisory→effective evolution mechanism undefined |
| F07 | LOW | F | Sticky plan panel `verification_hint` scope ambiguous (item-level vs. plan-level) |
| G01 | CRITICAL | G | Question Card Schema `prompt` ≠ QuestionItem `question` — same concept, different field names |
| G02 | HIGH | G | `source?` exclusion claims "per old ledger final pass" but old ledger line 3722 includes it |
| G03 | HIGH | G | `options` format marked UNRESOLVED despite old ledger v1 expanded contract locking object-array |
| G04 | HIGH | G | Subagent question rule is weaker than `assistant-chat-design.md §15.2` canonical rule |
| G05 | MEDIUM | G | `allow_freeform?` / `allow_other?` ambiguity — same field or different? |
| G06 | MEDIUM | G | `default_values?` (contract) vs `draft_value` (schema) not cross-referenced |
| G07 | MEDIUM | G | Multi-question state lifecycle: states listed but no transition triggers |
| G08 | MEDIUM | G | Legacy single-question "syntactic sugar" behavior not concretely specified |
| G09 | LOW | G | `response_kind` / `validation_state` in schema as ⚠️ UNRESOLVED risks schema pollution |
| H01 | HIGH | H | "No fallback mode" (line 376) contradicts "show source or fallback" (line 375) |
| H02 | HIGH | H | Inline visual module absent from Chat Widget Taxonomy |
| H03 | MEDIUM | H | Narrow bridge names provided but contract is absent |
| H04 | MEDIUM | H | Theme injection ADOPTED but schema UNRESOLVED — contradiction not clarified |
| H05 | MEDIUM | H | Third-party library allowlist undefined |
| H06 | MEDIUM | H | Sandbox iframe token combination unspecified |
| H07 | MEDIUM | H | Anti-HTML-Execution Guard scope ambiguous vs. inline visualizer permissions |
| H08 | MEDIUM | H | Dual persistence specs (lines 378-381 vs. 383-386) divergent without reconciliation |
| H09 | LOW | H | HTML/SVG allowlisted tags/attributes for sanitization never defined |
| X01 | HIGH | D/G/L | `question` tool not in subagent default-denial list despite canonical prohibition |
| X02 | MEDIUM | G/K | "Add `question` to Permissions_System.md" ambiguous — Part K implies already there |
| X03 | MEDIUM | G/H | `sendPrompt` dual-context rule (general vs. question-flow) lacks enforcement mechanism |
| X04 | MEDIUM | D/K | Card `blocked` state → Blocked-Action Recovery Matrix relationship undefined |
| X05 | LOW | E | Part E scroll auto-follow not cross-referenced to canonical sources |
| X06 | LOW | G | Questionnaire draft → storage-plan.md landing zone unverified |

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
- CC. ~~Fix Personas.md field naming drift (requested_persona_id → requested_persona)~~ RESOLVED: Personas.md already uses correct naming [XV2-FIX]
- DD. ~~Fix Commands_System.md override policy for reserved built-ins~~ RESOLVED: already forbids overriding reserved built-ins [XV2-FIX]
- EE. Write external reference policy into relevant docs

### Cross-Validation Remediation Actions [XV-ADD]
- Fix A-XV: Remove all unsupported claims from Parts A-C, R-X (9+ items identified) [XV-ADD]
- Fix B-XV: Restore citation/provenance 6-level precedence hierarchy into Part P [XV-ADD]
- Fix C-XV: Restore blocked-action recovery matrix (5 paths) into Part D or K [XV-ADD]
- Fix D-XV: Add full question tool contract (input/output/behavioral rules) into Part G [XV-ADD]
- Fix E-XV: Add plan-state lifecycle (6 states) into Part F [XV-ADD]
- Fix F-XV: Add MCP reconciliation map into Part N [XV-ADD]
- Fix G-XV: Restore permission preset tables into Part L [XV-ADD]
- Fix H-XV: Fix activity labels in routing algorithm (Part X) to match canonical set [XV-ADD]
- Fix I-XV: Resolve naming: `pm_composed` (underscore) as canonical spelling [XV-ADD]
- Fix J-XV: Resolve `web_input` as structured object (not preview string) [XV-ADD]
- Fix K-XV: Add `execution_path`, `result_quality_hint`, `sources_ref` to audit payload (Part P) [XV-ADD]
- Fix L-XV: Add forbidden-substitutes full list (9+ items, not 6) to Part O [XV-ADD]
- Fix M-XV2: Specify task lifecycle states, failure behavior, and timeout semantics (currently STILL THIN — no candidate fix existed) [XV2-ADD]
- Fix N-XV2: Specify skill tool input contract (only output envelope exists — no candidate fix existed) [XV2-ADD]

## Impacted Docs

> [RECOVERY-FIX] **Severity supersession note**: Severity assignments in this section supersede the old-ledger three-bucket register (MUST CHANGE / MUST RECONCILE / MUST VERIFY) from w-20260316-160450 lines 4017-4076. Severity was re-evaluated during cross-validation sweeps in this ledger. Key **escalations**: `Run_Modes.md` plan-mode fix was MUST VERIFY in old ledger but is now CRITICAL here (it contains the plan-mode auto-deny bug, contradiction C1). Key **de-escalations**: FinalGUISpec.md slash-command SSOT was flagged as "three incompatible lists" (MUST CHANGE) in old ledger but is now downgraded to "largely aligned; FinalGUISpec references need verification" (REQUIRED RECONCILIATION) per XV2-FIX cross-validation.

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
  - [AUDIT3-FIX] **Blocked/provisional constraint**: exact provider settings layout should stay OUT of FinalGUISpec until provider-runtime docs settle. FinalGUISpec owns UI widget contracts; must not encode provider routing/config internals.
- `Plans/Permissions_System.md` — CRITICAL FIXES:
  - ~~Add~~ Verify coverage complete for `question` in permission-key table (default allow) — keys already exist at Permissions_System.md lines 249-257 [XV2-FIX]
  - ~~Add~~ Verify coverage complete for `webextract`, `webresearch`, `webcrawl`, `webmap` permission keys — keys already exist at Permissions_System.md lines 387-395 [XV2-FIX]
  - Remove `todowrite` + web tools from blanket ask/plan mode auto-deny
  - Expand presets (read-only, plan, full) with complete tool lists
  - Define session approval patterns (search/research=`*`, extract/crawl/map=host-scoped)
  - Add approval ladder `always` option with project/global scope
  - Add blocked-action recovery paths
- `Plans/storage-plan.md` — Structured `chat.plan_todo_updated` event family, bounded questionnaire draft/answer persistence, activity payload registration for web operations (inline vs ref/blob split)

### CRITICAL FIXES
- `Plans/Commands_System.md` — ~~Remove/forbid `override_builtin` for reserved built-ins~~ ALREADY DONE: Commands_System.md already forbids overriding reserved built-ins [XV2-FIX]; reserve `/web` family exactly like other built-ins; narrow `override_builtin` to non-core command namespaces if it survives
- `Plans/UI_Command_Catalog.md` — Reconcile slash-command IDs to unified built-in list; add canonical `/web` family (cmd.chat.web.*); add `/skill` helper IDs; keep reserved list synchronized across all docs
- `Plans/Skills_System.md` — MUST CHANGE: Agent Config > Skills naming, import/readiness/state taxonomy (source_type, readiness status, validation warnings), richer `skill` runtime metadata [XV-FIX: upgraded from REQUIRED RECONCILIATION — was MUST CHANGE in old ledger]
- `Plans/LSPSupport.md` — MUST CHANGE: Align lsp tool operation surface with canonical 10+1 decision [XV-FIX: upgraded from REQUIRED RECONCILIATION — was MUST CHANGE in old ledger]

### REQUIRED RECONCILIATION
- `Plans/newtools.md` — Write missing §8.2.1, verify MCP/web-tooling text doesn't contradict canonical owners [XV-FIX: confirmed correct escalation from old ledger's MUST VERIFY — preserved]
- `Plans/chain-wizard-flexibility.md` — Clarification-request / question-flow semantics must align with shared question system
- `Plans/interview-subagent-integration.md` — Interview question behavior = baseline pattern for shared question-card system
- `Plans/orchestrator-subagent-integration.md` — Subagent/task defaults + todo-tool availability must match reconciled contracts
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — Browser capability, research session variant
- `Plans/feature-list.md` — Summary must reflect final slash set, Agent Config naming, refined tool behavior [XV-FIX: upgraded from VERIFY/MINOR — was MUST RECONCILE in old ledger]
- `Plans/00-plans-index.md` — Ownership/index descriptions must stay consistent [XV-FIX: upgraded from VERIFY/MINOR — was REQUIRED in old ledger]
- `Plans/Personas.md` — ~~FIX field naming drift (requested_persona_id → requested_persona); HIGH contradiction at line ~1506 AND confirmed drift in old ledger~~ Field naming is NOW CORRECT (`requested_persona`/`effective_persona`); stale line reference removed (Personas.md is only 441 lines); verify no remaining edge-case drift [XV2-FIX] [XV-FIX: upgraded from VERIFY/MINOR]
- `Plans/CLI_Bridged_Providers.md` — REQUIRED RECONCILIATION: needs expanded identity bundle, runtime field correlation [XV-ADD]
- `Plans/Provider_OpenCode.md` — REQUIRED RECONCILIATION: needs expanded correlation/identity, PM≠OpenCode boundary [XV-ADD]

### VERIFY / MINOR RECONCILIATION
- `Plans/Run_Modes.md` — ~~Ask/Plan semantics consistent with reconciled permissions/tools~~ CRITICAL FIX: plan-mode auto-deny of web tools is a critical bug (contradicts product direction), not minor reconciliation — escalate to match severity of C1 [XV2-FIX]
- `Plans/Contracts_V0.md` — Clarification events + runtime owner boundary compatible; verify canonical requested/effective field names
- `Plans/Prompt_Pipeline.md` — No accidental runtime-identity re-ownership
- `Plans/Multi-Account.md` — Account-routing/runtime-disclosure assumptions still valid
- `Plans/Progression_Gates.md` — Clarification-request expectations aligned with question flow
- `Plans/OpenCode_Coverage_Matrix.md` — Audit statuses correct after changes
- `Plans/newfeatures.md` — [AUDIT3-FIX] UPGRADED from verify-only to confirmed impacted. Origin/promoted-feature text must be updated to reflect reconciled web tool contracts, slash-command set, and Agent Config naming — passive verification insufficient given scope of upstream changes.
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
- [AUDIT3-FIX] §-level precision for web operations reconciliation:
  - `Tools.md` §3.5D (lines 317-334) — expand to implementation-ready per-tool contracts
  - `Tools.md` §3.4 — add webextract, webresearch, webcrawl, webmap definitions
  - `newtools.md` §8.2.1 — WRITE the missing Web Search section
  - `Permissions_System.md` §6 — extend approval ladder with `always` (durable); add session-approval scope patterns
  - `Permissions_System.md` §10.4 (line 596) — fix plan-mode auto-deny to exclude web tools
  - `assistant-chat-design.md` §5 — reconcile slash-command list for `/web` family
  - `FinalGUISpec.md` §7.16.2 — reconcile slash-command list; fix broken §references
  - `Run_Modes.md` — fix plan-mode semantics to not auto-deny web tools

#### Runtime Identity Consumption Reconciliation Map
- Chat CONSUMES shared runtime identity from owner docs; must NOT re-own or invent replacements
- Canonical fields: requested_persona, effective_persona, requested_platform, effective_platform, requested_model, effective_model, requested_auth_mode, effective_auth_mode, requested_account_policy, effective_account_id, account_switch_reason, applied_persona_controls[], skipped_persona_controls[]
- Safe chat ownership: display format, requested/effective placement, compact/expanded, routing to details, UX copy

#### MCP Reconciliation Map [XV-ADD]
- Landing zones: Tools.md (tool registration), FinalGUISpec.md (server management UI), Permissions_System.md (MCP tool permissions), storage-plan.md (server config persistence) [XV-ADD]

#### Reconciliation Execution Order [XV-ADD]
- Old ledger 4-phase order: (1) slash-command SSOT, (2) tool+permission, (3) GUI behavior, (4) persistence registration [XV-ADD]
- Current ledger offers 6 packets (A-F) with different grouping [XV-ADD]
- **Tension noted**: old ledger's sequential dependency chain vs current ledger's parallel packet model — reconciliation should respect dependency ordering within packets [XV-ADD]

#### LSP Reconciliation Map [XV2-ADD]
- LSP touches 3+ docs (Tools.md, LSPSupport.md, Permissions_System.md) but has no reconciliation map [XV2-ADD]
- Landing zones: Tools.md (canonical 10+1 operation set), LSPSupport.md (operation contracts, parameter normalization), Permissions_System.md (lsp permission key, read-only default) [XV2-ADD]

#### Skills / Agent Config Reconciliation Map [XV2-ADD]
- Skills/Agent Config touches 6 docs but has no reconciliation map [XV2-ADD]
- Landing zones: Skills_System.md (catalog, import UX, readiness model), FinalGUISpec.md (Agent Config IA, Skills tab), Tools.md (skill tool contract), Permissions_System.md (skill permission key), assistant-chat-design.md (skill invocation flow), UI_Command_Catalog.md (/skill helper IDs) [XV2-ADD]

#### Reconciliation Success-Test Checklist [AUDIT3-FIX]
> [AUDIT3-FIX] CRITICAL. After all canonical-doc reconciliation packets land, the following divergence checklist MUST pass — no two docs may disagree on any of these items:
1. **Reserved slash commands** — `assistant-chat-design.md`, `FinalGUISpec.md`, `Commands_System.md`, `UI_Command_Catalog.md` all list the same canonical built-in set
2. **Built-in overridability** — `Commands_System.md` forbids `override_builtin` for every reserved built-in; no other doc suggests otherwise
3. **Web tool inventory** — `Tools.md`, `Permissions_System.md`, `newtools.md` agree on the same 6 web tools with matching parameter shapes
4. **Plan mode web access** — `Run_Modes.md`, `Permissions_System.md`, and every permission preset agree that plan mode does NOT auto-deny web tools
5. **Runtime identity field names** — all runtime docs use canonical `requested_persona`/`effective_persona` naming (no `_id` suffix variants)
6. **Permission key completeness** — `Permissions_System.md` has explicit permission keys for `question`, `todowrite`, `todoread`, `skill`, `lsp`, and all 6 web tools
7. **Activity label consistency** — `assistant-chat-design.md` and `FinalGUISpec.md` agree on the 6 canonical web activity labels
- **When to run**: after each reconciliation packet lands, re-check all 7 items. Full green = reconciliation complete.

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
- Cache per-project, ~~bounded 100MB default,~~ LRU eviction — NOTE: 100MB cache size is NOT decided; see Open Questions [XV2-FIX]
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
- Citation/provenance model non-negotiable — full 6-level precedence hierarchy now restored in Part P [XV2-FIX]
- Permission model (allow/ask/deny) applies to all web tools
- Exa = primary, Tavily = optional premium, DDG = fallback
- ~~`web_search` underscore naming to avoid LLM collisions~~ — REMOVED [XV-FIX]: provider convention, not PM decision
- ~~47-domain spam blocklist with monthly updates~~ — REMOVED [XV-FIX]: fabricated, zero source
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
- Approval ladder: 4-tier (once / for session / always-durable / deny) with project/global scope — NOTE: this is the DESIRED state per ledger design; canonical docs currently still reflect 3-tier. Reconciliation required to bring canonical docs to 4-tier. [XV2-FIX]
- Canonical tool permission keys: 16+ keys including all web tools, question, skill, lsp, todo
- Unknown tool default: `ask`
- Permission snapshots immutable at attempt start; historical runs show frozen snapshot
- Subagent default denials: todowrite/todoread + nested task denied unless re-enabled — SOFTENED [XV-FIX]: direction established but contract still thin per old ledger
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

### Cross-Validation Confirmed Decisions [XV-ADD]
- DDG enabled as default fallback (LOCKED) [XV-ADD]
- Users can adjust provider order in settings (LOCKED) [XV-ADD]
- Provider fallback on rate-limit: fall to next provider, do NOT stop (LOCKED) [XV-ADD]
- Agent must search THEN read top results before answering (global heuristic, LOCKED) [XV-ADD]
- Exa API key lives in global user setting, not project-scoped (LOCKED) [XV-ADD]
- Google display label may say 'Google' while backend stays pluggable adapter (LOCKED) [XV-ADD]
- Question-flow visuals write to PM draft state, NOT sendPrompt (LOCKED) [XV-ADD]
- Dismiss returns status='dismissed', not fabricated partial answers (LOCKED) [XV-ADD]
- Persona profiles must NOT be mutated from in-chat approval cards (v1, LOCKED) [XV-ADD]
- `pm_composed` (underscore) is canonical spelling (RESOLVED by XV) [XV-ADD]
- `web_input` is structured object, not preview string (RESOLVED by XV) [XV-ADD]
- Deep Plan distinction is 'degree/intensity' not categorical (per old ledger, LOCKED) [XV-ADD]
- ~~`source?` field in question answers: deliberately excluded per old final pass (LOCKED)~~ REMOVED [XV2-FIX]: false decision — old ledger line 3722 actually INCLUDES `source?` as optional; moved to Open Questions [XV-ADD]
- DDG research = pm-composed, not native (RESOLVED by XV) [XV-ADD]

## Open Questions / Uncertainties

### Previously Open, Now Resolved by Deep Specs (Parts R-X)
- ~~Exact Firecrawl provider capability routing (which ops are native vs pm-composed)~~ → Part U: full matrix
- ~~Exact webresearch autonomous mode boundary vs Firecrawl /agent scope~~ → Part S webresearch contract
- ~~Whether change tracking requires persistent storage of previous fetch content~~ → Part W: stores content_hash + metadata, not full content; 7-day retention for change detection
- ~~Whether `/clear` is preserved or removed~~ → Part I locks `/clear` as REMOVED; canonical docs already exclude it [XV2-FIX]

### Previously Open, Now Resolved (Old-Ledger Carryforward) [XV2-ADD]
- ~~Terminal ownership model~~ — terminal sessions owned by PM runtime, not by individual tools; LOCKED in old ledger, should NOT be re-opened [XV2-ADD]
- ~~Agent Config > Skills direction~~ — Agent Config is top-level surface with Skills tab; LOCKED in old ledger, should NOT be re-opened [XV2-ADD]
- ~~Web activity model~~ — 6-tool web family with activity labels; LOCKED in old ledger, should NOT be re-opened [XV2-ADD]
- ~~Shell-first terminal handoff~~ — terminal handoff is shell-first (not IDE-terminal-first); LOCKED in old ledger, should NOT be re-opened [XV2-ADD]

### Still Open (Non-Web-Tool Questions)
- Exact todo auto-use heuristic threshold details (3+ steps is recommended trigger)
- Can user edit TODOs after execution starts? (currently: structural edits gated; status updates continue)
- Exact skills import archive payload format details
- Exact skills browsing/filtering affordances for MVP
- ~~Whether fenced code copy always visible or context-dependent~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #13: Always-visible copy affordance on fenced code blocks (see Part E).
- Multi-select support in question cards (schema supports it; UX unclear)
- PM visual-runtime script/third-party-library policy details
- Whether `/clear` is preserved or removed — ~~OPEN~~ RESOLVED: Part I locks `/clear` as REMOVED; canonical docs already exclude it [XV2-FIX]
- Whether still-absent runtime fields (execution_role, operational_identity, projection_freshness, projection_health) should be adopted for MVP or deferred

### Cross-Validation Open Questions [XV-ADD]
- ~~webfetch size cap: 1 MiB (old canonical) vs 5 MB (OpenCode reference)? — NEEDS DECISION~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #3: 5 MB default, configurable; agent can override down with `max_content_length`. [XV-ADD]
- ~~`options` format in question schema: string[] vs Array<{id,label,description?}>? — UNRESOLVED~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #8: Object-array `Array<{id, label, description?}>` is canonical; `string[]` auto-expanded at ingestion. [XV-ADD]
- ~~`response_kind` and `validation_state` field definitions — UNRESOLVED~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #9: `response_kind`: `"selection" | "freeform" | "mixed"`; `validation_state`: `"valid" | "invalid" | "pending"`; both optional. [XV-ADD]
- ~~Visualizer theme token injection schema — UNRESOLVED~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #10: CSS custom properties injected inline on container; MVP tokens locked (see Part H). [XV-ADD]
- ~~Cache size limit per project (100MB was unsourced) — NEEDS DECISION~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #4: 500 MB default per project, configurable, LRU eviction. [XV-ADD]
- ~~Batch timeout formula (individual × 3, cap 300s) — UNVERIFIED, needs validation~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #16: `individual_timeout × min(url_count, 5)`, cap 600s. [XV-ADD]
- ~~Research session Tier 2 permission: auto-allowed after host approval, or second confirmation? — UNRESOLVED~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #11: Auto-allowed after parent tool's "For Session" host approval; no second confirmation. [XV-ADD]
- Credit warning UX thresholds (100 credits confirm, 500 hard cap): correct defaults? — NEEDS VALIDATION [XV-ADD]
- ~~Crew delegation owner_hint: concrete mapping algorithm — UNRESOLVED~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #2: Exact-match `crew.roles` map; fallback to current session on no match; error on unavailable provider (see Part L). [XV-ADD]
- ~~Task lifecycle: exact states, failure behavior, timeout semantics — STILL THIN~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #15: 6-state lifecycle locked; failure/timeout/retry semantics locked (see Part L). [XV-ADD]
- ~~Code-block visible copy: always visible or only on hover/focus? — STILL OPEN (was open in old ledger)~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #13: Always-visible copy affordance (see Part E). [XV-ADD]
- Per-operation provider override: NOT MVP, but no post-MVP design direction exists [XV-ADD]
- ~~`/skill` lock status: intentionally unresolved per old ledger — STILL OPEN~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #14: Triple-path discovery locked (Skills panel, `/skill` slash command, NL auto-invoke); no subcommand family for MVP (see Part I). [XV-ADD]
- ~~MCP dedicated SSOT document vs distributed across existing docs — NEEDS DECISION~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #7: Dedicated `Plans/MCP_Integration.md` is the single SSOT; cross-references from Tools.md, storage-plan.md, Permissions_System.md. [XV-ADD]
- `source?` in question answers: old ledger final recommendation (line 3722) INCLUDES it as optional `source?: "option" | "other" | "freeform"`; current ledger excluded it without supporting evidence. Needs resolution. [XV2-ADD]
- [AUDIT3-FIX] ~~`source?` Open Question~~ **RESOLVED AND RE-LOCKED**: confirmed INCLUDED as optional per old ledger line 3722. See Part G [AUDIT3-FIX] entry. Status: **LOCKED**.

### New Questions Emerging from Deep Specs
- **research_session as 5th session class vs restricted automation_session?** — Part T defines it as a restricted automation_session (same runtime, subset of actions). But should we mint a separate session_class value `"research_session"` for telemetry/audit distinction? Recommendation: yes, mint the session class but reuse automation_session infrastructure
- **Firecrawl credit budget enforcement** — When autonomous webresearch delegates to Firecrawl /agent (20-2500 credits), should PM enforce a hard credit cap? How should user be warned? Recommendation: require confirmation when estimated cost > 100 credits; hard cap default 500 credits (user-adjustable)
- ~~**Batch webfetch permission UX** — Single approval for batch of N URLs, or per-domain approval?~~ ✅ [GAP-RESOLVE] RESOLVED — Decision #6: Single confirmation prompt showing all unique domains; "For Session" grants all listed domains. (see Part V)
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

### Packetization Derived-Outputs Guardrail [AUDIT3-FIX]
- Packets must NOT include derived-only outputs that duplicate or contradict source content:
  - Rule 1: Packet doc intent buckets include MUST CHANGE + MUST RECONCILE docs only. MUST VERIFY docs checked during review but not primary targets.
  - Rule 2: Do NOT put derived-only outputs (ledger summaries, audit tables, cross-reference matrices) into packet intent buckets — they are research artifacts.
  - Rule 3: If a packet generates content restating something owned by another canonical doc, REFERENCE the owner doc, not duplicate inline.
  - Violation creates reconciliation drift — the exact problem this ledger exists to solve.

## Do-Not-Forget Details

### Firecrawl-Specific
- Firecrawl's search uses Serper (Google) — PM uses Exa (semantic); fundamentally different paradigms
- Fire Engine (proprietary anti-bot) NOT available in self-hosted; PM should not assume this
- Firecrawl /agent expensive (20–2500 credits) and uses proprietary Spark models
- Firecrawl `/interact` has prompt-based mode (not just CSS selectors) — more agent-friendly
- PM's Site Reader detail-level approach already more sophisticated than Firecrawl's onlyMainContent
- AGPL license — patterns only, no code import
- PM is strict superset of Firecrawl's action model (40 vs 9 actions)
- [FC-FIX] Firecrawl supports Zero Data Retention (ZDR) for enterprise compliance: `zeroDataRetention: true` on scrape (+1 credit/page), `enterprise: ["zdr"]` on search (10 credits/10 results). When ZDR enabled, PM cache becomes the ONLY persistence layer. NOT MVP — enterprise feature for future consideration. Adapter config: `firecrawl_zdr?: boolean` (global setting, not per-request).
- [FC-FIX] Firecrawl search returns structured multi-source response (`{ web: [...], images: [...], news: [...] }`). PM's websearch adapter flattens this into a single `results` array with `source_type` tags per item. This transformation is adapter-internal; the PM contract (Part S) already defines the flat output shape.
- [FC-FIX] Firecrawl webhook delivery includes `X-Firecrawl-Signature` header (HMAC-SHA256 of payload). If PM adds webhook-based async completion in future (instead of polling), signature verification is MANDATORY. NOT MVP.
- [FC-FIX] Firecrawl `storeInCache` and `minAge` parameters exist but are NOT mapped as PM-exposed parameters. PM's own cache layer (Part W) handles caching above the provider level. The adapter passes `maxAge` (mapped from `cache_policy.max_age_seconds`) and lets Firecrawl use its default `storeInCache: true`.

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
- `web_search` with underscore (provider convention, not PM-specific decision) [XV-FIX: was misattributed as PM collision avoidance]
- Support tiers: `native`, `pm-composed`, `unsupported`

### Critical Fixes That Must Not Be Dropped
- §8.2.1 in newtools.md — cited but NEVER WRITTEN
- Plan mode permission contradiction — web tools auto-denied in planning modes
- Slash-command SSOT — ~~three incompatible lists must become one~~ largely aligned; FinalGUISpec references need verification [XV2-FIX]
- Commands_System.md override_builtin — ~~must be retired for reserved commands~~ RESOLVED: already forbids overriding reserved built-ins [XV2-FIX]
- Personas.md field naming — ~~must align with Contracts_V0.md canonical names~~ NOW CORRECT: already uses `requested_persona`/`effective_persona` [XV2-FIX]
- Permission presets — too narrow, missing skill/lsp/question/todo/web
- Approval ladder — needs `always` (durable) option, not just once/session/deny

### Interaction Model
- Research session variant of automation_session serves BOTH research AND testing/debugging
- 15-action research subset in 3 tiers: always_allowed (7), session_granted (6), ask/deny (2)
- Full automation_session available as fallback when lightweight research actions insufficient
- Agents should auto-escalate to full automation when failing with lightweight actions
- Research session is transient (ephemeral profile, no takeover/promotion, teardown after tool completes)
- Escalation to automation_session always requires explicit user confirmation

### Cross-Validation Critical Reminders [XV-ADD]
- Citation/provenance precedence (6 levels) MUST be in Part P and referenced by all tool contracts [XV-ADD]
- Blocked-action recovery (5 paths) MUST be implementation-ready with `blocked_reason_code` linkage [XV-ADD]
- `Reading Site` label is RESERVED EXCLUSIVELY for native Site Reader path — never for provider-delegated fetch [XV-ADD]
- `Extracting Site` ≠ `Reading Site` — different evidence paths, different failure modes, different provenance [XV-ADD]
- History non-rewrite rule: later edits never rewrite historical attempts [XV-ADD]
- Persona non-mutation: approval cards never mutate persona profiles (v1) [XV-ADD]
- Transport-invariance: direct/CLI/server-bridged must preserve same identity contract [XV-ADD]
- PM modes ≠ OpenCode modes — do not conflate [XV-ADD]
- Reconciliation order: slash-command SSOT → tool+permission → GUI behavior → persistence [XV-ADD]
- 9 unsupported claims were removed from Firecrawl specs — do not re-introduce [XV-ADD]
- Old ledger line references for key contracts: question tool (3689-3739), todo tool (3741-3801), runtime boundary (3871-3935), provider matrix (748-941) [XV-ADD]

### Cross-Validation Sweep 2 — Do-Not-Forget Additions [XV2-ADD]
- 4-action terminal distinction: `Open in Terminal`, `Show Terminal`, `Rerun in Terminal`, `Detach/Pop-Out` are functionally distinct actions with different command IDs — do not conflate [XV2-ADD]
- Card family coherence rule: all inline operation cards (terminal, search, diff, web) share the same anatomy (header, status badge, body, action row) with per-type specialization [XV2-ADD]
- Preview sizing consistency: 5-collapsed / 15-expanded / 50-cap applies uniformly across terminal, search, and diff cards — do not introduce per-card-type exceptions without explicit decision [XV2-ADD]
- Skill "discovered vs usable" distinction: a skill appearing in the catalog does NOT mean it is ready to use; readiness status (source_type, validation warnings) gates usability [XV2-ADD]
- Failure presentation simplicity: tool failures show a single clear error message with recovery action — do not present multiple competing error surfaces for the same failure [XV2-ADD]
- [RECOVERY-FIX] Terminal ownership model: terminal sessions are owned by the **PM runtime**, not by individual tools or commands. Tools trigger terminal activity; PM runtime manages the terminal session lifecycle (creation, binding, teardown). A tool ending does not equal a terminal session ending. No individual tool may claim ownership of a terminal session or spawn a competing terminal model. (Old ledger ~line 78-94, LOCKED.)
- [RECOVERY-FIX] Mini terminal is read-only in chat: the mini terminal card embedded in the chat message is a **read-only preview** — users cannot type into it. Interaction with the live terminal session requires clicking `Open in Terminal` to focus the PM terminal. (Old ledger ~line 78, 488: "mini terminal is read-only/non-interactive".)
- [RECOVERY-FIX] No copy for search/diff cards: search result cards and diff cards do **NOT** inherit the generic copy affordance. Copy is available on terminal cards and code blocks; it is explicitly absent from search and diff operation cards. Do not add copy to these card types without an explicit decision. (See Part D lines ~175-176.)

### Wording Discipline Checklist [AUDIT3-FIX]
- 3-rule wording discipline for all reconciliation packets:
  1. **Prefer canonical runtime vocabulary**: use "platform/model/auth/account policy/effective account" — do not invent synonyms
  2. **Use provider-layer vocabulary correctly**: use "provider capability registry / adapter" for web execution layer — do not conflate with runtime identity terms
  3. **No duplicate top-level nouns**: if canonical runtime docs already own a term, do not create a duplicate (e.g., do not create `chat_model` when `effective_model` exists)

### Chat-Thread vs Broader-Doc Contradiction Advisory [AUDIT3-FIX]
- Watch for contradictions between chat-thread docs (`assistant-chat-design.md`) and broader GUI/runtime docs (`FinalGUISpec.md`, `Contracts_V0.md`, `Permissions_System.md`, `Run_Modes.md`).
- Chat-thread docs describe behavior FROM THE CHAT PERSPECTIVE; GUI/runtime docs FROM THE SYSTEM PERSPECTIVE. When they disagree, system-perspective doc is authoritative for contracts; chat-perspective doc is authoritative for UX presentation only.
- Especially fragile for: permission semantics, runtime identity display, slash-command availability, mode-dependent tool access.

### Three-Way Inline Rendering Distinction [AUDIT3-FIX]
- The three rendering paths are architecturally distinct and MUST NOT be collapsed:
  1. **One-shot `bash` tool invocations** — inline terminal operation cards with mini-terminal preview
  2. **Search tools** — inline search result cards (no terminal preview, no copy affordance)
  3. **Shell-owned live terminal surfaces** — full terminal sessions via `Open in Terminal`
- These share card anatomy but have DIFFERENT content models, interaction affordances, and lifecycle rules.
- Collapsing any two requires an explicit design decision — do not let it happen by accident.

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
- [FC-FIX] All Firecrawl implementation-readiness gaps from 3-agent audit now resolved:
  - WebAction type schema defined (Part S)
  - Common output fields enumerated (Part S)
  - Cache fields added to all 6 contracts (Part S)
  - Error sections added to webcrawl/webmap (Part S)
  - Interact session model fully specified (Part R)
  - Phantom parameter mappings fixed (Part R)
  - Async job model corrected with crawl included (Part R)
  - Credit cost reference table added (Part R)
  - Invalid "stealth" proxy mode removed (Part R)
  - Per-contract error applicability table added (cross-cutting)
  - Async progress model for long-running operations added (cross-cutting)
  - ZDR, webhook, search transform, cache param notes added (Do-Not-Forget)
  - Empty extraction edge case specified (Part S webextract)
  - Partial results on budget exceeded clarified (Part S webresearch)

### Web Tool Enhancements (Firecrawl-Inspired, Now Specified)
- websearch: `sources` (web/news/images/code/academic) + `categories` (github/research/pdf)
- webfetch: `formats` (8 options), `actions` (research session), `cache_policy`, `change_tracking`, `pdf_mode`
- webextract: `schema` (JSON Schema draft-07), `schema_mode` (strict/lenient), `actions`, `prompt`
- webresearch: `autonomous` mode (3 tiers: PM-composed default, enhanced PM-composed, provider-native agent)
- webcrawl: `change_tracking`, `dedup`, `include/exclude_paths`, `respect_robots`, `formats`
- webmap: `include/exclude_paths`, `search` filter, `use_sitemap` modes
- Batch operations: webfetch (max 50 URLs, concurrency 3-10), webextract (max 10 URLs, concurrency 3-5)
- Caching: per-project, **500 MB default** (configurable), per-operation TTL defaults, LRU eviction — ✅ [GAP-RESOLVE] RESOLVED — Decision #4 (see Part W) [XV2-FIX]
- Routing: 9-step algorithm updated with cache check (new Step 4) and Firecrawl routing notes

---

## RECONCILIATION / COVERAGE PASS

### 1) RECONCILIATION SUMMARY

**What was reconciled:** Firecrawl Gap Analysis + Lost-Spec Recovery (w-20260329-235630) — a dual-domain research work item covering (A) Firecrawl capabilities vs PM's web-tool design and (B) recovery of 30+ topic areas of locked decisions from w-20260316-160450 that never reached canonical planning docs. Topics span: web tool contracts (6 tools), provider architecture (Firecrawl integration, routing algorithm, capability matrix), chat UI/UX (operation cards, message controls, question system, TODO schema, inline visualizers, Mermaid), slash commands, skills/agent config, permissions (approval ladder, presets), subagent/task behavior, LSP tool contract, MCP contract, runtime identity, logging/audit transparency, and external reference policy.

**Major drift risks:**
- **C1 CRITICAL**: Permissions_System.md and Run_Modes.md contain plan-mode auto-deny rules that contradict the product direction for web tool access in plan mode. This is stale canonical text that must be replaced, not appended to.
- **C5 HIGH**: Tools.md web tool contracts are thin stubs — the ledger specifies full implementation-ready contracts (Parts R+S) that must be landed.
- **C6 HIGH**: Permission presets in Permissions_System.md are missing skill/lsp/question/todo/web tools entirely.
- **C7 HIGH**: Contracts_V0.md is missing runtime identity fields (requested_account_binding, operational_identity) recovered from prior work item.
- **Firecrawl interact session model**: The ledger specifies a stateful multi-turn session model (Part T research_session) that has no counterpart in any canonical doc.
- **Slash command set**: 15 canonical commands + /web family + /skill helper defined in the ledger but not yet in Commands_System.md or UI_Command_Catalog.md.
- **Question card/questionnaire system**: Full UI + schema + lifecycle defined (Part G) with no canonical doc home.
- **TODO schema + Plan/Deep Plan tracking**: Normalized schema and state model (Part F) defined but not in storage-plan.md or assistant-chat-design.md.
- **Operation card family**: Three-way inline rendering distinction (terminal, search, web/diff) defined (Part D) but not in FinalGUISpec.md widget catalog.
- **Provider capability matrix**: 7 providers × 6 operations (Part U) has no canonical home.

### 2) RAW COVERAGE LEDGER SUMMARY

**Total docs considered:** 47 canonical planning docs (Plans/*.md, excluding _shards, .pipeline, .evidence)

**Major doc clusters/themes and hit counts (from repo-wide search):**

| Theme | Primary Docs (high hits) | Secondary Docs (moderate) | Peripheral (low/verify) |
|---|---|---|---|
| Web tools / Firecrawl / provider routing | Tools.md (20), Permissions_System.md (23) | storage-plan.md (2), newtools.md (1) | FinalGUISpec.md (1), assistant-chat-design.md (1) |
| Question/TODO/Plan/Deep Plan | assistant-chat-design.md (71), orchestrator-subagent-integration.md (83) | chain-wizard-flexibility.md (14), FinalGUISpec.md (17) | Run_Modes.md (7), storage-plan.md (4) |
| Operation cards / terminal / inline rendering | assistant-chat-design.md (7) | FinalGUISpec.md (3) | FileSafe.md (2) |
| Slash commands | assistant-chat-design.md (37), Skills_System.md (20), UI_Command_Catalog.md (17), Commands_System.md (16) | MiscPlan.md (20), OpenCode_Deep_Extraction.md (14), OpenCode_Coverage_Matrix.md (12) | FinalGUISpec.md (8), Personas.md (6), Prompt_Pipeline.md (6) |
| Approval ladder / permissions | Permissions_System.md (1+3+5 across patterns) | FinalGUISpec.md (3), Run_Modes.md (1) | Section15 (1), storage-plan.md (1) |
| Research session / browser actions | Section15_MVP_Promoted_Features_Spec.md (53) | Permissions_System.md (4), FileManager.md (5), Wiring_Matrix.md (4) | newtools.md (2) |
| Subagent / task / crew / delegation | orchestrator-subagent-integration.md (559), interview-subagent-integration.md (278) | Tools.md (49), assistant-chat-design.md (72), Contracts_V0.md (34) | newtools.md (32), MiscPlan.md (28), chain-wizard-flexibility.md (22), Personas.md (22) |
| Seglog / audit / activity / transparency | storage-plan.md (73), assistant-chat-design.md (24) | chain-wizard-flexibility.md (19), Tools.md (15), interview-subagent-integration.md (15) | orchestrator-subagent-integration.md (13), FinalGUISpec.md (10) |
| Runtime identity (requested/effective) | Multi-Account.md (7), interview-subagent-integration.md (8) | Models_System.md (4), Personas.md (3), storage-plan.md (3) | Contracts_V0.md (2), CLI_Bridged_Providers.md (3), orchestrator-subagent-integration.md (3) |
| Capability matrix / provider registry | Models_System.md (8), CLI_Bridged_Providers.md (3) | Contracts_V0.md (2), Permissions_System.md (2), OpenCode_Coverage_Matrix.md (2) | Provider_OpenCode.md (1), Personas.md (1), Section15 (1) |
| Mermaid / inline visualizer | assistant-chat-design.md (20), FileManager.md (16) | FinalGUISpec.md (9), feature-list.md (6) | — |
| TODO tools / plan panel | Tools.md (9), FinalGUISpec.md (8) | Permissions_System.md (5), assistant-chat-design.md (4) | storage-plan.md (1) |
| LSP tool / language server | LSPSupport.md (22), Tools.md (11) | FinalGUISpec.md (2), FileManager.md (2) | Permissions_System.md (1) |
| MCP server / config | Tools.md (26), newtools.md (13) | Permissions_System.md (3), storage-plan.md (3), Section15 (3) | Contracts_V0.md (2), MiscPlan.md (3) |

**Where drift risk was highest:**
1. Permissions_System.md ↔ Run_Modes.md (plan-mode auto-deny contradiction)
2. Tools.md (thin web tool stubs vs ledger's full contracts)
3. Commands_System.md ↔ UI_Command_Catalog.md ↔ assistant-chat-design.md (slash command set fragmentation)
4. Contracts_V0.md (missing runtime identity fields)
5. assistant-chat-design.md ↔ FinalGUISpec.md (operation card / widget catalog misalignment)
6. storage-plan.md (missing web content cache layer, audit payload expansion)

### 3) THREE-BUCKET REGISTER

#### BUCKET 1: MUST CHANGE
Docs that clearly need new or revised content based on the research findings.

| # | Doc | Why | Key Changes |
|---|---|---|---|
| 1 | Plans/Tools.md | PRIMARY OWNER for web tools, provider routing, tool registry. C5 HIGH: web tool contracts are thin stubs. | Expand 6 web tool contracts to full implementation-ready specs (Parts R+S). Add Firecrawl-as-provider with parameter mapping, error handling, credit costs. Add provider capability matrix (Part U). Add routing algorithm (Part X). Add batch operations (Part V). Add web content caching layer reference (Part W). Add WebAction type definition. Add research session variant (Part T). Expand question tool contract. Expand TODO tools contract. Expand LSP tool contract (10+1). Add MCP SSOT reference. Update task tool contract. |
| 2 | Plans/assistant-chat-design.md | PRIMARY OWNER for chat modes, activity transparency, question system, TODO, operation cards, slash commands. | Add operation card family spec (Part D: terminal, search, diff/web cards with three-way rendering distinction). Add mini-terminal defaults and card status badge state machine. Add chat controls spec (Part E: stop/edit/resend, queued messages, scroll/auto-follow, copy behavior, message row actions). Add question card/questionnaire system (Part G: UI, multi-question flow, schema, lifecycle). Add Plan/Deep Plan/TODO tracking UI (Part F: sticky panel, inline progress, auto-use heuristic). Expand inline visualizer/Mermaid rendering (Part H). Add activity labels for web tools and provider routing transparency. Add provenance badges. Update slash command canonical set (Part I: 15 commands + /web family + /skill helper + /cancel deprecation). |
| 3 | Plans/FinalGUISpec.md | PRIMARY OWNER for UI widgets, panels, visual rendering. | Add widget catalog entries for terminal operation cards, search cards, diff cards (Part D card families). Add planning panel widget specs (Part F: sticky panel, inline progress). Add question card widget spec (Part G). Add Mermaid/inline visualizer sandboxing spec (Part H). Add permission approval card UI widgets. Add provider routing status indicator. Add Firecrawl credit warning UX. |
| 4 | Plans/Permissions_System.md | PRIMARY OWNER for permissions + CRITICAL FIX. C1 CRITICAL: plan-mode auto-deny for web tools. C6 HIGH: presets missing tools. | **REPLACE stale canonical text**: plan-mode auto-deny rule for web tools must be retired and replaced with correct policy. Expand permission presets to include skill/lsp/question/todo/web tools. Add full 4-tier approval ladder spec (Part K). Add session approval patterns. Add batch permission UX (Decision #6). Add research session tier 2 permissions. |
| 5 | Plans/storage-plan.md | PRIMARY OWNER for persistence, audit, cache. | Add web content caching layer (Part W: per-project, 500MB default, per-operation TTL defaults, LRU eviction, change detection). Expand audit payload for web tool events and provider routing. Add question/questionnaire session state persistence. Add TODO schema persistence (Part F normalized schema). |
| 6 | Plans/Run_Modes.md | CRITICAL FIX for C1. | **REPLACE stale canonical text**: plan-mode web tool auto-deny contradiction must be fixed. Update mode-dependent tool access matrix. Update Deep Plan mode tool availability. |
| 7 | Plans/Commands_System.md | PRIMARY for slash command reserved set. | Add reserved built-in slash command set (15 canonical per Part I). Add /web family commands (/websearch, /webfetch, /webextract, /webresearch). Add /skill helper command. Add /cancel deprecation note. Update override_builtin rules for reserved set. |
| 8 | Plans/UI_Command_Catalog.md | PRIMARY for command IDs and mapping. | Add /web family command IDs (cmd.web.search, cmd.web.fetch, etc.). Add /skill helper mapping. Cross-reference to Commands_System reserved set. |
| 9 | Plans/Skills_System.md | CRITICAL UPDATE for agent config. | Consolidate Agent Config naming. Add skill import/readiness model (Part J). Add Skill Store concept. Add /skill discovery paths (Decision #14). Update tool contract for skill invocation. |
| 10 | Plans/LSPSupport.md | CRITICAL UPDATE for tool contract. | Align with 10 read-only + 1 write-gated operation set (Part M). Add lsp_rename gating details. Align tool contract with Tools.md. |
| 11 | Plans/newtools.md | MISSING SECTION. | Add §8.2.1 Web Search section (never written). Add MCP SSOT cross-reference. Add research session variant cross-reference. |
| 12 | Plans/Contracts_V0.md | CRITICAL UPDATE for runtime identity. C7 HIGH. | Add requested_account_binding and operational_identity fields (Part O). Clarify runtime identity requested/effective model. Clarify owner/consumer boundary. |

#### BUCKET 2: MUST RECONCILE
Docs that must be updated so the feature remains consistent across the planning set.

| # | Doc | Why | Key Reconciliation |
|---|---|---|---|
| 13 | Plans/chain-wizard-flexibility.md | Plan/Deep Plan/TODO lifecycle touches wizard flow. | Reconcile Plan/Deep Plan/TODO auto-use heuristic (Part F). Align Deep Plan escalation semantics. Ensure wizard does not conflict with new plan-mode tool access. |
| 14 | Plans/orchestrator-subagent-integration.md | Subagent/task defaults and crew delegation must align. | Reconcile task tool contract defaults (Part L). Add crew delegation mapping. Align task lifecycle states (Decision #15). Ensure subagent tool access aligns with updated permission presets. |
| 15 | Plans/interview-subagent-integration.md | Interview question system must align with Part G. | Reconcile interview question flow with new question card/questionnaire spec. Align subagent tool access with updated permissions. |
| 16 | Plans/Section15_MVP_Promoted_Features_Spec.md | Research session / browser actions must align with Part T. | Reconcile research session spec with Part T's 15 actions in 3 tiers. Align browser action annotation (Decision #12). |
| 17 | Plans/Personas.md | Field naming must align with runtime identity model. | Verify requested_persona/effective_persona naming aligns with Part O. Ensure no duplicate top-level nouns (wording discipline rule #3). |
| 18 | Plans/CLI_Bridged_Providers.md | Provider identity bundle and Firecrawl entry. | Add Firecrawl provider entry. Expand identity bundle per Part O. Update capability registry cross-reference. |
| 19 | Plans/Provider_OpenCode.md | PM≠OpenCode boundary per Part Q. | Clarify PM-native vs OpenCode terminology (Part Q external reference policy). Update provider capability differentiation. |
| 20 | Plans/Multi-Account.md | Owner/consumer boundary from Part O. | Reconcile owner/consumer boundary with runtime identity model. Align multi-account fields with requested_account_binding. |
| 21 | Plans/Models_System.md | Provider capability matrix alignment. | Reconcile with Part U capability matrix (7 providers × 6 operations). Note model-native web search capability. |
| 22 | Plans/00-plans-index.md | Index entries for all new/changed content. | Update index entries for expanded Tools.md sections, new command families, new widget types, new storage schemas. |

#### BUCKET 3: MUST VERIFY
Docs that should be checked before packet emission because they are likely to contain overlapping or conflicting behavior.

| # | Doc | Why |
|---|---|---|
| 23 | Plans/feature-list.md | Feature cross-references may need updating for new web tools, question system, TODO schema, Mermaid rendering. |
| 24 | Plans/Prompt_Pipeline.md | Prompt templates may reference stale tool names or missing web tool context injection. |
| 25 | Plans/Progression_Gates.md | Gate requirements may reference outdated tool availability or permission semantics. |
| 26 | Plans/OpenCode_Coverage_Matrix.md | Coverage tracking may be stale for new slash commands, MCP, tool operations. |
| 27 | Plans/newfeatures.md | New feature entries may need cross-references to web tool enhancements. |
| 28 | Plans/MiscPlan.md | Cross-cutting slash command references (20 hits) may contain stale lists. |
| 29 | Plans/FileManager.md | Browser surface and Mermaid rendering references must not conflict with Part H inline visualizer spec. |
| 30 | Plans/OpenCode_Deep_Extraction.md | OpenCode alignment may need updating for PM-native web tool terminology. |
| 31 | Plans/Crosswalk.md | Cross-walk entries may need updating for new runtime identity fields and tool categories. |
| 32 | Plans/Glossary.md | Terms for new concepts (WebAction, research_session, operation card, approval ladder, etc.) may need additions. |
| 33 | Plans/Executor_Protocol.md | Executor protocol may need awareness of new tool categories and plan-mode changes. |
| 34 | Plans/human-in-the-loop.md | HITL patterns may need updating for new approval ladder and batch permission UX. |
| 35 | Plans/Wiring_Matrix.md | Wiring entries for research_session and web tools may need additions. |
| 36 | Plans/usage-feature.md | Usage/billing feature may need awareness of Firecrawl credit model and web tool cost tracking. |
| 37 | Plans/assistant-memory-subsystem.md | Memory subsystem may need awareness of web research session context persistence. |
| 38 | Plans/Widget_System.md | Widget type registry may need entries for new card widget types. |
| 39 | Plans/Architecture_Invariants.md | Invariants may need updating for provider architecture changes. |
| 40 | Plans/DRY_Rules.md | External reference policy (Part Q) may need a DRY rule entry. |

### 4) DERIVED / REGEN-ONLY CHECKS

These are generated or derived artifacts that must be regenerated/validated after canonical doc changes but must NOT enter the packet as direct doc intents:

| Artifact | Action |
|---|---|
| Plans/_shards/** (all shards) | Must be regenerated via `python3 scripts/pm-shard-plans.py --generate` after all canonical doc changes are complete. |
| Plans/.evidence/** | Must be regenerated/validated after canonical changes. |
| Plans/Spec_Lock.json | Must be verified via `python3 scripts/pm-plans-verify.py verify-spec-lock` after changes. Do NOT hand-edit. |
| Plans/auto_decisions.jsonl | Decisions #1-16 from this work item should be appended if the pipeline requires it. Do NOT hand-edit. |

### 5) MISSING COVERAGE WARNINGS

| Warning | Detail |
|---|---|
| No dedicated MCP SSOT doc | The ledger (Part N) identifies MCP as needing a dedicated SSOT section. Currently split across Tools.md §5 (MCP integration) and newtools.md §8 (MCP support). Decision #7 says "MCP dedicated SSOT doc." This either needs a new doc or a clearly identified single-owner section. |
| Firecrawl provider has no standalone doc | Firecrawl integration is fully specified in the ledger (Parts R, S, T, U, V, W, X) but has no canonical home. Recommend it be a major new section in Tools.md or CLI_Bridged_Providers.md, not a separate doc. |
| External reference policy (Part Q) has no home | 6 rules for external references (OpenCode, Cursor, etc.) need a canonical location — likely Provider_OpenCode.md or DRY_Rules.md. |
| Web content caching layer (Part W) spans two docs | Cache layer touches both storage-plan.md (persistence) and Tools.md (tool-level caching behavior). Must ensure single ownership without duplication. |

### 6) PACKETIZATION-READY DOC SET

#### MUST CHANGE — 12 docs

**1. Plans/Tools.md**
- **Why:** Primary owner of web tool contracts, provider routing, tool registry. C5 HIGH: current web tool contracts are thin stubs.
- **Likely anchor/section:** §3 Built-in Tools (web tools), §5 MCP Integration, §7 Implementation Details, new §Provider Capability Matrix, new §Routing Algorithm
- **Change type:** ADDITIVE (major new sections) + REPLACE (existing thin web tool entries must be replaced with full contracts)
- **Stale-canon:** Existing web tool entries are thin and must be replaced, not appended to
- **Exact obligations:** websearch/webfetch/webextract/webresearch/webcrawl/webmap full contracts per Parts R+S; WebAction type schema; provider capability matrix (7×6); routing algorithm (9-step); batch operations (max 50/10); credit cost reference table; Firecrawl parameter mapping; Firecrawl error code mapping; Firecrawl interact session model; Firecrawl async adapter pattern; question tool contract; TODO tools (todowrite/todoread) contract; LSP tool contract (10+1); task tool contract updates

**2. Plans/assistant-chat-design.md**
- **Why:** Primary owner for chat modes, activity transparency, inline rendering, question system, TODO UI, slash commands.
- **Likely anchor/section:** §4 Message Types, §5 Commands, §7 Attachments/Web Search, §8 Plan Mode, §13 Activity Transparency, §14 Subagents, new §Operation Cards, new §Question System, new §TODO Tracking UI
- **Change type:** ADDITIVE (multiple new sections) + RECONCILE (existing slash command list, existing activity section)
- **Stale-canon:** Existing slash command references may need updating; activity transparency section needs expansion not replacement
- **Exact obligations:** Operation card family (terminal, search, diff/web) with three-way rendering distinction; mini-terminal defaults; card status badge state machine (idle→running→success|error|timeout); chat controls (stop/edit/resend, queued messages, scroll/auto-follow, copy behavior); message row actions; question card UI + multi-question flow + schema + lifecycle; Plan/Deep Plan/TODO sticky panel + inline progress + auto-use heuristic; inline visualizer/Mermaid rendering + sandboxing + bridges + persistence + theme tokens; 15 canonical slash commands + /web family + /skill helper + /cancel deprecation; activity labels for web tools; provenance badges; code-block copy visibility (Decision #13)

**3. Plans/FinalGUISpec.md**
- **Why:** Primary owner for UI widgets, panels, visual rendering.
- **Likely anchor/section:** §7 Views Specification (widget catalog), §15 Persistence, new widget entries
- **Change type:** ADDITIVE (new widget catalog entries)
- **Stale-canon:** None expected — mostly additive
- **Exact obligations:** Terminal operation card widget; search result card widget; diff card widget; planning panel widget (sticky panel, inline progress); question card widget; Mermaid/inline visualizer sandboxed rendering widget; permission approval card widget; provider routing status indicator; Firecrawl credit warning UX

**4. Plans/Permissions_System.md**
- **Why:** Primary owner + C1 CRITICAL (plan-mode auto-deny) + C6 HIGH (missing presets).
- **Likely anchor/section:** §Permission Presets, §Plan Mode Rules, new §Approval Ladder, new §Session Approval Patterns
- **Change type:** REPLACE (plan-mode auto-deny stale text) + ADDITIVE (approval ladder, presets, batch UX)
- **Stale-canon:** **CRITICAL** — plan-mode auto-deny rule for web tools is stale and contradicts product direction. Must be replaced, not appended.
- **Exact obligations:** Remove/replace plan-mode web tool auto-deny; expand presets to include skill/lsp/question/todo/web tools; 4-tier approval ladder (deny → once → session → always); session approval patterns; batch permission UX (Decision #6); research session tier 2 permissions (Decision #11)

**5. Plans/storage-plan.md**
- **Why:** Primary owner for persistence, audit payload, cache.
- **Likely anchor/section:** §2 Implementation, §6 Potential Problems, §7 Enhancements, §8 Implementation Order, new §Web Content Cache, new §Audit Payload Expansion
- **Change type:** ADDITIVE (cache layer, audit expansion, TODO/question persistence)
- **Stale-canon:** None expected — mostly additive
- **Exact obligations:** Web content caching layer (per-project scope, 500MB default per Decision #3, per-operation TTL defaults, LRU eviction, cache key ordering per Decision #5, change detection persistence); audit payload expansion for web tool events and provider routing; question/questionnaire session state persistence; TODO schema persistence (normalized schema from Part F)

**6. Plans/Run_Modes.md**
- **Why:** C1 CRITICAL — plan-mode auto-deny contradiction.
- **Likely anchor/section:** §Mode-dependent tool access, §Plan Mode
- **Change type:** REPLACE (stale plan-mode tool restriction) + RECONCILE (tool access matrix)
- **Stale-canon:** **CRITICAL** — plan-mode restrictions that auto-deny web tools must be replaced
- **Exact obligations:** Fix plan-mode web tool access; update mode-dependent tool access matrix; update Deep Plan mode tool availability

**7. Plans/Commands_System.md**
- **Why:** Primary for slash command reserved set.
- **Likely anchor/section:** §Reserved Built-in Commands, §Command Registration
- **Change type:** ADDITIVE (new command entries) + RECONCILE (reserved set)
- **Stale-canon:** Existing command lists may be incomplete
- **Exact obligations:** 15 canonical reserved built-in slash commands; /web family (/websearch, /webfetch, /webextract, /webresearch); /skill helper; /cancel deprecation note; override_builtin rules for reserved set

**8. Plans/UI_Command_Catalog.md**
- **Why:** Primary for command IDs and mapping.
- **Likely anchor/section:** §Command ID Registry
- **Change type:** ADDITIVE (new command IDs)
- **Stale-canon:** None expected
- **Exact obligations:** /web family command IDs (cmd.web.search, cmd.web.fetch, cmd.web.extract, cmd.web.research); /skill helper mapping; cross-reference to Commands_System reserved set

**9. Plans/Skills_System.md**
- **Why:** Agent Config naming, import/readiness model.
- **Likely anchor/section:** §Agent Config, §Skill Import, §Readiness Model
- **Change type:** ADDITIVE + RECONCILE (naming consolidation)
- **Stale-canon:** "Skills page" vs "Agent Config" naming may be inconsistent
- **Exact obligations:** Agent Config naming consolidation; skill import/readiness model (Part J); Skill Store concept; /skill discovery paths (Decision #14); tool contract for skill invocation (Decision #1)

**10. Plans/LSPSupport.md**
- **Why:** LSP tool contract alignment.
- **Likely anchor/section:** §LSP Operations, §Tool Contract
- **Change type:** RECONCILE (operation set alignment)
- **Stale-canon:** None expected
- **Exact obligations:** 10 read-only + 1 write-gated (lsp_rename) operation set; lsp_rename gating details; tool contract alignment with Tools.md

**11. Plans/newtools.md**
- **Why:** Missing §8.2.1 Web Search section.
- **Likely anchor/section:** §8.2 Web Tools, §8.2.1 Web Search (new)
- **Change type:** ADDITIVE (missing section)
- **Stale-canon:** None — section was never written
- **Exact obligations:** §8.2.1 Web Search implementation spec; MCP SSOT cross-reference; research session variant cross-reference

**12. Plans/Contracts_V0.md**
- **Why:** C7 HIGH — missing runtime identity fields.
- **Likely anchor/section:** §4 Runtime Identity, §4.1 Auth State
- **Change type:** ADDITIVE (new fields) + RECONCILE (existing identity model)
- **Stale-canon:** Existing identity section may be incomplete but not contradictory
- **Exact obligations:** requested_account_binding field; operational_identity field; runtime identity requested/effective model clarification; owner/consumer boundary definition

#### MUST RECONCILE — 10 docs

**13. Plans/chain-wizard-flexibility.md**
- **Why:** Plan/Deep Plan/TODO lifecycle touches wizard flow.
- **Likely anchor/section:** §Deep Plan Escalation, §Wizard Flow
- **Change type:** RECONCILE (alignment)
- **Exact obligations:** Plan/Deep Plan/TODO auto-use heuristic alignment; Deep Plan escalation semantics; wizard tool access alignment with updated plan-mode permissions

**14. Plans/orchestrator-subagent-integration.md**
- **Why:** Subagent/task defaults and crew delegation.
- **Likely anchor/section:** §Task Tool, §Crew Delegation, §Subagent Selection
- **Change type:** RECONCILE (defaults, lifecycle)
- **Exact obligations:** Task tool contract default alignment; crew delegation mapping (Decision #2); task lifecycle states (Decision #15); subagent tool access alignment with updated permission presets

**15. Plans/interview-subagent-integration.md**
- **Why:** Interview question system alignment.
- **Likely anchor/section:** §Interview Phases, §Question Flow
- **Change type:** RECONCILE (question system alignment)
- **Exact obligations:** Interview question flow alignment with Part G question card/questionnaire spec; subagent tool access alignment

**16. Plans/Section15_MVP_Promoted_Features_Spec.md**
- **Why:** Research session / browser actions alignment.
- **Likely anchor/section:** §Research Session, §Browser Actions
- **Change type:** RECONCILE (research session alignment)
- **Exact obligations:** Research session alignment with Part T (15 actions, 3 tiers, lifecycle, escalation); browser action annotation (Decision #12)

**17. Plans/Personas.md**
- **Why:** Field naming alignment with runtime identity.
- **Likely anchor/section:** §Persona Fields
- **Change type:** RECONCILE (naming alignment)
- **Exact obligations:** requested_persona/effective_persona naming alignment with Part O; no duplicate top-level nouns (wording discipline rule #3)

**18. Plans/CLI_Bridged_Providers.md**
- **Why:** Provider identity bundle and Firecrawl entry.
- **Likely anchor/section:** §Provider Registry, §Identity Bundle
- **Change type:** ADDITIVE (Firecrawl entry) + RECONCILE (identity bundle)
- **Exact obligations:** Firecrawl provider entry; expanded identity bundle per Part O; capability registry cross-reference

**19. Plans/Provider_OpenCode.md**
- **Why:** PM≠OpenCode boundary per Part Q.
- **Likely anchor/section:** §Boundary Rules
- **Change type:** RECONCILE (boundary clarification)
- **Exact obligations:** PM-native vs OpenCode terminology (Part Q external reference policy, 6 rules); provider capability differentiation

**20. Plans/Multi-Account.md**
- **Why:** Owner/consumer boundary from Part O.
- **Likely anchor/section:** §Identity Model, §Account Binding
- **Change type:** RECONCILE (boundary alignment)
- **Exact obligations:** Owner/consumer boundary reconciliation with runtime identity model; requested_account_binding alignment

**21. Plans/Models_System.md**
- **Why:** Provider capability matrix alignment.
- **Likely anchor/section:** §Provider Capabilities
- **Change type:** RECONCILE (capability matrix)
- **Exact obligations:** Alignment with Part U capability matrix (7 providers × 6 operations); model-native web search capability note

**22. Plans/00-plans-index.md**
- **Why:** Index entries for all new/changed content.
- **Likely anchor/section:** §Document Index
- **Change type:** ADDITIVE (new entries)
- **Exact obligations:** Update index entries for expanded Tools.md sections, new command families, new widget types, new storage schemas

#### MUST VERIFY — 18 docs

23–40: Plans/feature-list.md, Plans/Prompt_Pipeline.md, Plans/Progression_Gates.md, Plans/OpenCode_Coverage_Matrix.md, Plans/newfeatures.md, Plans/MiscPlan.md, Plans/FileManager.md, Plans/OpenCode_Deep_Extraction.md, Plans/Crosswalk.md, Plans/Glossary.md, Plans/Executor_Protocol.md, Plans/human-in-the-loop.md, Plans/Wiring_Matrix.md, Plans/usage-feature.md, Plans/assistant-memory-subsystem.md, Plans/Widget_System.md, Plans/Architecture_Invariants.md, Plans/DRY_Rules.md

### 7) FIDELITY BLOCKER CONSUMPTION CHECK

**LFA-001 (AuthState null-padding in Contracts_V0.md#4.1):**
- Status: CONFIRMED RESOLVED per `Plans/.pipeline/ledger_fidelity_report.txt`
- Fidelity report says: "LFA-001 is resolved — the live `Contracts_V0.md` §4.1 now contains the exact `null` field + padding semantics"
- Contracts_V0.md is in MUST CHANGE (bucket 1, item #12) for C7 runtime identity fields
- The existing resolution will be preserved during C7 changes
- **CONSUMED** ✅

**LFA-002 (FileSafe optimistic-concurrency in FileSafe.md#11.1.2a):**
- Status: CONFIRMED RESOLVED per `Plans/.pipeline/ledger_fidelity_report.txt`
- Fidelity report says: "LFA-002 is resolved — the live `FileSafe.md` §11.1.2a now contains the exact optimistic-concurrency / CAS semantics"
- FileSafe.md is NOT in scope for this work item (web tools / lost-spec recovery domain)
- The existing resolution is stable and will not be disturbed by this work item's changes
- **CONSUMED** ✅

**Fidelity recovery plan obligations:**
- LFA-001 recovery map (Contracts_V0.md#4.1 exact `null` field + padding): Already resolved in live doc. MUST CHANGE for Contracts_V0.md will preserve. ✅
- LFA-002 recovery map (FileSafe.md#11.1.2a CAS semantics): Already resolved in live doc. Not disturbed by this work item. ✅

**All active fidelity blockers consumed.** ✅

### 8) FINAL REGISTER DETERMINISM CHECK

- No doc appears in more than one final bucket ✅
- MUST CHANGE: 12 docs (deterministic assignment)
- MUST RECONCILE: 10 docs (deterministic assignment)
- MUST VERIFY: 18 docs (deterministic assignment)
- Total unique canonical docs in register: 40
- Derived/regen-only: 4 artifact categories (excluded from buckets)
- Missing coverage warnings: 4 items (flagged for packet design)

<ready_for_packetize/>

## RECONCILIATION / COVERAGE PASS — FIDELITY-CONSUMING UPDATE (2026-04-04)

> This addendum supersedes the earlier three-bucket register above. It incorporates the active `Plans/.pipeline/ledger_fidelity_report.txt` and `Plans/.pipeline/fidelity_recovery_plan.txt` and is the authoritative reconciliation result for packetization.

### 1) RECONCILIATION SUMMARY

**What was reconciled:** Firecrawl Gap Analysis + Lost-Spec Recovery for `w-20260329-235630`, using the current research ledger plus the active fidelity report and fidelity recovery plan as required reconciliation inputs.

**Major drift risks:**
- The **current packet is drifted**, not just incomplete. It currently preserves stale canon such as `webextract` → `/scrape`, bare `/web` → search, bare `/skill` → open panel, Git URL skill import, `pending → queued → running → success | failed | cancelled`, old web error codes, and old widget status taxonomy.
- Several packet operations are the **wrong shape** and must be re-packetized as `replace_section` instead of `append` / `insert_after`, especially in `Plans/Tools.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/newtools.md`, and `Plans/storage-plan.md`.
- The highest-risk stale-canon families are now exact-token families, not broad themes:
  - `cmd.chat.delete_message`
  - `cmd.terminal.show` as the normalized target for both `Open in Terminal` and `Show Terminal`
  - `QuestionInput` / `QuestionAnswer`
  - `requested_persona_id` / `effective_persona_id`
  - `unblock_action_ids[]`
  - `invalid_url`, `fetch_failed`, `provider_unavailable`, `credit_cap_exceeded`
  - `wait | screenshot | select | hover | evaluate | press | focus` as the web-action enum
- Active fidelity blockers require owner-doc correction **before** consumer cleanup. This pass therefore promotes several consumer docs to **MUST CHANGE** because they currently preserve contradictory canon, not just thin summaries.

### 2) RAW COVERAGE LEDGER SUMMARY

**Total docs considered:** 40 canonical planning docs plus 4 pipeline inputs (`working_ledger.md`, `meta.json`, `ledger_fidelity_report.txt`, `fidelity_recovery_plan.txt`).

**Major doc clusters/themes:**
1. **Web owner docs:** `Plans/Tools.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`
2. **Chat / widget / command surfaces:** `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`
3. **Skill / task / LSP / MCP contracts:** `Plans/Skills_System.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/LSPSupport.md`, `Plans/Contracts_V0.md`, `Plans/newtools.md`
4. **Runtime identity / provider consumers:** `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/interview-subagent-integration.md`
5. **Summary / indexing / reference docs likely to drift if untouched:** `Plans/00-plans-index.md`, `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/Provider_OpenCode.md`, `Plans/human-in-the-loop.md`

**Where drift risk was highest:**
1. `Plans/Tools.md` and `Plans/storage-plan.md` — web contract ownership, cache schema, error taxonomy, blocked payloads
2. `Plans/Permissions_System.md`, `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Skills_System.md` — stale owner canon still present
3. `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md` — consumer/widget drift and duplicate packet-appended section families
4. `Plans/orchestrator-subagent-integration.md`, `Plans/Contracts_V0.md`, `Plans/interview-subagent-integration.md` — lifecycle and runtime-identity drift
5. Packet-shape risk — current packet misses required docs and uses additive ops where stale canon must be retired

### 3) THREE-BUCKET REGISTER

#### MUST CHANGE
Docs that require direct edits to land owner canon, retire stale same-file canon, or fix active fidelity blockers.

1. `Plans/Tools.md`
2. `Plans/assistant-chat-design.md`
3. `Plans/FinalGUISpec.md`
4. `Plans/Permissions_System.md`
5. `Plans/storage-plan.md`
6. `Plans/Commands_System.md`
7. `Plans/UI_Command_Catalog.md`
8. `Plans/Skills_System.md`
9. `Plans/Contracts_V0.md`
10. `Plans/newtools.md`
11. `Plans/Run_Modes.md`
12. `Plans/orchestrator-subagent-integration.md`
13. `Plans/LSPSupport.md`
14. `Plans/interview-subagent-integration.md`
15. `Plans/Section15_MVP_Promoted_Features_Spec.md`
16. `Plans/CLI_Bridged_Providers.md`
17. `Plans/Models_System.md`
18. `Plans/Multi-Account.md`
19. `Plans/Personas.md`
20. `Plans/MCP_Integration.md`

#### MUST RECONCILE
Docs that are not the primary owner for the feature but must be updated so the planning set stays coherent and non-drifting.

1. `Plans/chain-wizard-flexibility.md`
2. `Plans/Provider_OpenCode.md`
3. `Plans/00-plans-index.md`
4. `Plans/feature-list.md`
5. `Plans/newfeatures.md`
6. `Plans/human-in-the-loop.md`

#### MUST VERIFY
Docs that may or may not need edits but must be checked before packet emission because they are likely to become misleading.

1. `Plans/Prompt_Pipeline.md`
2. `Plans/Progression_Gates.md`
3. `Plans/OpenCode_Coverage_Matrix.md`
4. `Plans/FileManager.md`
5. `Plans/MiscPlan.md`
6. `Plans/OpenCode_Deep_Extraction.md`
7. `Plans/Wiring_Matrix.md`
8. `Plans/Widget_System.md`
9. `Plans/Executor_Protocol.md`
10. `Plans/Crosswalk.md`
11. `Plans/usage-feature.md`
12. `Plans/assistant-memory-subsystem.md`
13. `Plans/Architecture_Invariants.md`
14. `Plans/Glossary.md`

### 4) DERIVED / REGEN-ONLY CHECKS

These artifacts must be regenerated or rerun after packet/doc corrections but must **not** be turned into packet doc intents:

1. `Plans/.pipeline/research_packet.json` — regenerate; current packet is fidelity-defective and missing required docs/anchors
2. `Plans/.pipeline/packet_shape_report.txt` — rerun after packet regeneration
3. `Plans/.pipeline/verifier_report.txt` — rerun after packet regeneration
4. `Plans/.pipeline/ledger_fidelity_report.txt` — rerun after canonical updates land
5. `Plans/.pipeline/fidelity_recovery_plan.txt` — superseded once the next fidelity pass is green
6. `Plans/_shards/**` — regenerate after canonical doc edits
7. `Plans/.evidence/**` — refresh after canonical doc edits
8. `Plans/Spec_Lock.json` — verify after canonical doc edits; do not hand-edit
9. `Plans/auto_decisions.jsonl` — pipeline-managed only; do not hand-edit

### 5) MISSING COVERAGE WARNINGS

**Current packet candidate doc set is missing required impacted docs:**
1. `Plans/MCP_Integration.md` — required to resolve LF-18
2. `Plans/feature-list.md` — summary/reference surface will remain misleading if omitted
3. `Plans/newfeatures.md` — promoted-feature summary will remain misleading if omitted
4. `Plans/human-in-the-loop.md` — approval ladder / HITL semantics will remain misleading if omitted

**Current packet candidate anchor set is insufficient even for docs already included:**
1. `Plans/Tools.md` currently uses `append` for Firecrawl / matrix / routing / batch / cache sections; recovery needs `replace_section` and stale-residue retirement
2. `Plans/FinalGUISpec.md` currently uses file-end `append`, which already created a duplicate `15.*` family; recovery needs targeted `replace_section`
3. `Plans/Commands_System.md` currently inserts after `### 6.3 Shortcut binding`; recovery needs `replace_section` for the existing `## 7. Reserved built-in slash commands`
4. `Plans/newtools.md` currently inserts under `## 8` but still leaves `§8.2.1` missing and preserves `planned` MCP SSOT wording
5. `Plans/storage-plan.md` currently appends cache persistence as a second `## 8`; recovery needs owner-section replacement, not additive duplication
6. `Plans/Tools.md` packet coverage does **not** currently target `### 3.5B question tool runtime contract` or the LSP consumer sections even though LF-09 and LF-17 require them
7. `Plans/Contracts_V0.md` packet coverage does **not** currently create the owner web-error matrix required by LF-08

### 6) PACKETIZATION-READY DOC SET

Each doc below belongs in the next packet because it either owns active blocker recovery or is a required reconciliation surface.

#### MUST CHANGE packet docs

**1. `Plans/Tools.md`**
- **Why it belongs:** primary owner for web contracts, Firecrawl provider integration, routing, batch, cache consumer rules, `question`, LSP consumer alignment, task/preset consumer alignment
- **Likely anchor/section:** `### 3.5B question tool runtime contract`; `### 3.5D Web operation family runtime contract`; `## 10. Firecrawl provider integration`; `## 11. Provider capability matrix`; `## 12. Web tool routing algorithm`; `## 13. Batch operations`; `## 14. Web content caching layer`
- **What kind of change is needed:** replace_section across existing sections; add owner cross-refs for moved contracts
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `webextract` → `/v2/extract`; `batch_webfetch`; `batch_webextract`; `WebAction.type = click|scroll|type|press_key|wait_for|navigate|screenshot|set_viewport|fill_form|select_option|back|reload|snapshot|console|network`; capability modes `native|near-native|native (model)|native (agent)|pm-composed|partial|unsupported`; routing labels `Reading Site|Extracting Site|Researching Web|Crawling Site|Mapping Site`; cache states `hit|miss|bypassed|expired_used_for_diff`; error codes `adapter_unavailable|unsupported_operation|content_blocked|content_not_found|unsupported_source|extraction_schema_mismatch|autonomous_budget_exceeded|no_previous_version`

**2. `Plans/assistant-chat-design.md`**
- **Why it belongs:** owner/consumer for slash commands, question flow, planning UI, activity labels, operation cards, Mermaid vs inline visualizer
- **Likely anchor/section:** `### 5.1 Reserved built-ins`; `### 5.2 /web and /skill`; `### 7.4 Question card and questionnaire system`; `### 8.1 Canonical planning model`; `### 13.1 Operation-card family`; `### 13.2 Web activity and provenance`; `## 28. Markdown and Mermaid Rendering...`
- **What kind of change is needed:** replace_section plus targeted insert_after in `## 28`
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** bare `/web` opens help/autocomplete and has no default op; bare `/skill` is discovery/invocation, not open-panel behavior; no delete action; `mode|header|prompt|questions[]`; `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values}`; statuses `answered|submitted|dismissed|timed_out|unavailable`; `Reading Site` reserved for Site Reader; `Extracting Site`; `Researching Web`; blocked recovery `blocked_reason_code` + `allowed_action_ids[]`; inline visualizer bridge `sendPrompt|openLink`

**3. `Plans/FinalGUISpec.md`**
- **Why it belongs:** owner for Settings/Agent Config IA and widget contracts; current packet append created duplicate `15.*` family
- **Likely anchor/section:** `#### 7.4.4 Settings (Unified) panel specification`; `#### 7.4.7 Agent-Config panel specification`; widget family `### 15.1`–`### 15.9`
- **What kind of change is needed:** replace_section for settings/Agent Config and widget family
- **Additive or replace/retire stale canonical text:** must replace/retire stale packet-appended widget canon
- **Exact named obligations that must survive:** provider class split `account-backed|API-backed|no-key`; `skill` / Agent Config ownership; question widget aligned to `QuestionItem`; widget status set `pending|running|completed|failed|cancelled|blocked`; separate Mermaid vs inline visualizer; provider routing status indicator; Firecrawl credit warning UX; terminal actions `Open in Terminal|Show Terminal|Rerun in Terminal|Detach/Pop-Out`

**4. `Plans/Permissions_System.md`**
- **Why it belongs:** owner for approval ladder, defaults, presets, research-session permission behavior
- **Likely anchor/section:** `## 5. Tool permission keys`; `## 6. Ask flow semantics`; `### 6.5 Four-tier approval ladder`; `## 7. Deterministic defaults`
- **What kind of change is needed:** replace_section plus insert_after where needed
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `deny|once|for session|always`; deny cascade; frozen permission snapshots; `skill` default `allow`; `question` default `allow` only when HITL is available; read-only / plan web defaults remain `ask`; Tier 2 research-session auto-allow after `For Session`

**5. `Plans/storage-plan.md`**
- **Why it belongs:** owner for question persistence, TODO persistence, blocked payloads, web audit payloads, cache persistence
- **Likely anchor/section:** `### 4.2 Question and clarification state`; `### 4.3 Plan and TODO state`; `### 4.4 Activity transparency payloads`; `## 8. Web content caching persistence`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `chat.plan_todo_updated`; `blocked_reason_code`; ordered `allowed_action_ids[]`; `web_operation`; structured `web_input`; `sources_ref|content_ref|map_ref|answer_summary_ref`; `normalized_url|formats_hash|adapter_id`; `expired_used_for_diff`; retire `unblock_action_ids[]`

**6. `Plans/Commands_System.md`**
- **Why it belongs:** owner for reserved slash-command SSOT
- **Likely anchor/section:** `## 7. Reserved built-in slash commands`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `/new|/model|/effort|/mode|/export|/compact|/stop|/resume|/rewind|/revert|/share|/settings|/doctor|/help|/web`; `/cancel` deprecated; `/clear` removed; bare `/web` no default; bare `/skill` discovery/invocation only

**7. `Plans/UI_Command_Catalog.md`**
- **Why it belongs:** consumer for reserved slash IDs and terminal action taxonomy
- **Likely anchor/section:** `### 2.7 Chat slash commands (reserved)` and terminal-session command rows
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** retire `cmd.chat.delete_message`; retire `Bare /web (with query argument) routes to cmd.web.search by default`; stop normalizing both `Open in Terminal` and `Show Terminal` to `cmd.terminal.show`

**8. `Plans/Skills_System.md`**
- **Why it belongs:** owner for `skill` tool, discovery, readiness, import model
- **Likely anchor/section:** `### 4.3 skill tool`; `### 4.4 Canonical MVP delivery path`; `### 6.1`–`### 6.3`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `invoke_skill` structured I/O; source vocabulary `bundled|pm_enhanced|catalog_installed|manual_import|project_local|global_local|shadowed`; readiness vocabulary `ready|ready_with_warnings|invalid|shadowed|disabled`; no Git URL import in v1

**9. `Plans/Contracts_V0.md`**
- **Why it belongs:** owner for runtime snapshot and new owner web-error matrix
- **Likely anchor/section:** `### 3.4 Tool-specific payload extensions` (insert new web error taxonomy section after); `### 5.1B Persona/Runtime Snapshot Payload Contract`
- **What kind of change is needed:** insert_after + replace_section
- **Additive or replace/retire stale canonical text:** must replace incomplete owner schemas
- **Exact named obligations that must survive:** `requested_persona`; `effective_persona`; `requested_account_binding`; `operational_identity`; never `requested_persona_id`; never `effective_persona_id`; owner web-error matrix with `adapter_unavailable|unsupported_operation|content_blocked|content_not_found|unsupported_source|extraction_schema_mismatch|autonomous_budget_exceeded|no_previous_version`

**10. `Plans/newtools.md`**
- **Why it belongs:** currently missing `§8.2.1` and preserves wrong MCP ownership wording
- **Likely anchor/section:** `## 8. MCP Support and GUI Settings`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** real `§8.2.1` cited-search landing; `Plans/MCP_Integration.md` as SSOT; corrected research-session reference; retire `A dedicated Plans/MCP_Integration.md SSOT document is planned`

**11. `Plans/Run_Modes.md`**
- **Why it belongs:** consumer for plan-mode semantics drift
- **Likely anchor/section:** `### 9.2 plan`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale text
- **Exact named obligations that must survive:** plan mode does not auto-deny web tools; Deep Plan Q&A loop and artifact→TODO projection sync remain coherent with runtime mode

**12. `Plans/orchestrator-subagent-integration.md`**
- **Why it belongs:** owner for task tool alignment and subagent defaults
- **Likely anchor/section:** `#### Task tool contract alignment`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** `pending → running → completed | failed | cancelled | timed_out`; parent-owned retries; timeout split `120s` regular / `300s` long-running; child default denial of `question`

**13. `Plans/LSPSupport.md`**
- **Why it belongs:** owner for LSP op surface
- **Likely anchor/section:** `## 9. MVP LSP features (summary)`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale op inventory
- **Exact named obligations that must survive:** one 9-read-op set plus approval-gated `rename`; retire or explicitly reconcile `diagnostics`; align long-name / short-name aliases

**14. `Plans/interview-subagent-integration.md`**
- **Why it belongs:** consumer for question-system and runtime-identity alignment
- **Likely anchor/section:** `### Question system alignment`; `### Runtime identity visibility`; `### Requested/effective Interview contract`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace/retire stale text
- **Exact named obligations that must survive:** object-array options `Array<{id, label, description?}>`; `response_kind`; `validation_state`; no `requested_persona_id`; no `effective_persona_id`

**15. `Plans/Section15_MVP_Promoted_Features_Spec.md`**
- **Why it belongs:** consumer for research-session / browser-action alignment
- **Likely anchor/section:** `#### 1.3A Research session alignment`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale text
- **Exact named obligations that must survive:** `research_session` vs `automation_session`; action annotation `{ action_type, target_selector, timestamp_ms, screenshot_ref }`; correct tier boundary semantics

**16. `Plans/CLI_Bridged_Providers.md`**
- **Why it belongs:** consumer summary for Firecrawl provider entry and provider identity bundle
- **Likely anchor/section:** `## Firecrawl provider entry`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale summary
- **Exact named obligations that must survive:** `firecrawl`; do not flatten to `native for all` without the owner caveats; include runtime identity bundle and routing cross-ref

**17. `Plans/Models_System.md`**
- **Why it belongs:** consumer for capability matrix and provider settings disclosure
- **Likely anchor/section:** `### 4.5 Web tool provider capability alignment`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale alignment note
- **Exact named obligations that must survive:** capability alignment with the repaired matrix; support-tier disclosure; model-native auth reuse; health / last-failure surfacing

**18. `Plans/Multi-Account.md`**
- **Why it belongs:** consumer for owner/consumer boundary and account-binding terms
- **Likely anchor/section:** `### 4.6 Owner/consumer boundary alignment`
- **What kind of change is needed:** replace_section
- **Additive or replace/retire stale canonical text:** must replace stale alignment note
- **Exact named obligations that must survive:** `requested_account_binding`; `operational_identity`; owner/consumer enforcement; no local substitute fields

**19. `Plans/Personas.md`**
- **Why it belongs:** consumer for canonical runtime-identity field naming
- **Likely anchor/section:** `### 3.3A Field naming alignment with runtime identity`
- **What kind of change is needed:** replace_section / targeted cleanup
- **Additive or replace/retire stale canonical text:** must retire any `_id` variants
- **Exact named obligations that must survive:** `requested_persona`; `effective_persona`; no `requested_persona_id`; no `effective_persona_id`

**20. `Plans/MCP_Integration.md`**
- **Why it belongs:** missing owner doc required for LF-18
- **Likely anchor/section:** new owner doc
- **What kind of change is needed:** append (new file creation)
- **Additive or replace/retire stale canonical text:** new owner doc plus consumer retirement elsewhere
- **Exact named obligations that must survive:** `Plans/MCP_Integration.md` as single SSOT; credential binding/invalidation; requested-vs-effective availability; naming `{server_slug}_{tool_name}`; retire `_` / `/` dual-format canon elsewhere

#### MUST RECONCILE packet docs

**21. `Plans/chain-wizard-flexibility.md`**
- **Why it belongs:** clarification / wizard flows must not fork the repaired `question` and planning canon
- **Likely anchor/section:** clarification-request / agent-activity sections
- **What kind of change is needed:** insert_after or replace_section depending local wording
- **Additive or replace/retire stale canonical text:** may require local stale-text retirement
- **Exact named obligations that must survive:** shared `question` contract; no wizard-local alternative status model

**22. `Plans/Provider_OpenCode.md`**
- **Why it belongs:** recovered external-reference policy needs a canonical consumer home
- **Likely anchor/section:** PM vs OpenCode terminology boundary section
- **What kind of change is needed:** replace_section or insert_after
- **Additive or replace/retire stale canonical text:** must retire imported OpenCode terminology if present
- **Exact named obligations that must survive:** PM-native terminology boundary; do not import provider / tool / runtime names from OpenCode as PM canon

**23. `Plans/00-plans-index.md`**
- **Why it belongs:** owner/index descriptions must reflect the repaired doc graph and the new MCP owner doc
- **Likely anchor/section:** reconciliation note / index entries
- **What kind of change is needed:** append or replace existing reconciliation note
- **Additive or replace/retire stale canonical text:** additive unless stale ownership text exists
- **Exact named obligations that must survive:** index ownership for `Plans/MCP_Integration.md`, repaired `Plans/Tools.md`, `Plans/Permissions_System.md`, `Plans/storage-plan.md`, `Plans/Commands_System.md`, `Plans/Skills_System.md`

**24. `Plans/feature-list.md`**
- **Why it belongs:** reference summary will be misleading if it keeps old slash / web / Agent Config descriptions
- **Likely anchor/section:** chat / state / commands summary sections
- **What kind of change is needed:** targeted replace_section or insert_after
- **Additive or replace/retire stale canonical text:** must retire stale summary phrasing if found
- **Exact named obligations that must survive:** 6-tool web family; reserved slash-command set; Agent Config + Skills ownership; question / TODO / visualizer terms

**25. `Plans/newfeatures.md`**
- **Why it belongs:** promoted-feature summary must not retain outdated web / tool / command summaries
- **Likely anchor/section:** runtime identity / provider behavior and UI / navigation summary sections
- **What kind of change is needed:** targeted replace_section or insert_after
- **Additive or replace/retire stale canonical text:** may require stale summary retirement
- **Exact named obligations that must survive:** Firecrawl / web contract recovery, runtime identity fields, command set, question / TODO / widget families

**26. `Plans/human-in-the-loop.md`**
- **Why it belongs:** approval semantics and `question` gating will drift if left untouched
- **Likely anchor/section:** approval options / user-availability sections
- **What kind of change is needed:** targeted replace_section or insert_after
- **Additive or replace/retire stale canonical text:** must retire stale 3-option language if present
- **Exact named obligations that must survive:** `deny|once|for session|always`; batch unique-domain confirmation; `question` default `allow` only when HITL is available

### 7) FIDELITY BLOCKER CONSUMPTION CHECK

All active fidelity blockers were consumed into the final impacted-doc set:

- **LF-01** → MUST CHANGE: `Plans/Tools.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`
- **LF-02** → MUST CHANGE: `Plans/Tools.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Permissions_System.md`
- **LF-03** → MUST CHANGE: `Plans/Tools.md`, `Plans/newtools.md`
- **LF-04** → MUST CHANGE: `Plans/Tools.md`, `Plans/assistant-chat-design.md`, `Plans/Models_System.md`, `Plans/CLI_Bridged_Providers.md`
- **LF-05** → MUST CHANGE: `Plans/Tools.md`, `Plans/Permissions_System.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/newtools.md`
- **LF-06** → MUST CHANGE: `Plans/Tools.md`, `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`
- **LF-07** → MUST CHANGE: `Plans/storage-plan.md`, `Plans/Tools.md`
- **LF-08** → MUST CHANGE: `Plans/Contracts_V0.md`, `Plans/Tools.md`, `Plans/storage-plan.md`
- **LF-09** → MUST CHANGE: `Plans/Tools.md`, `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`, `Plans/interview-subagent-integration.md`, `Plans/FinalGUISpec.md`
- **LF-10** → MUST CHANGE: `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`
- **LF-11** → MUST CHANGE: `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/assistant-chat-design.md`
- **LF-12** → MUST CHANGE: `Plans/Skills_System.md`, `Plans/FinalGUISpec.md`, `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`
- **LF-13** → MUST CHANGE: `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`, `Plans/Tools.md`; MUST RECONCILE: `Plans/human-in-the-loop.md`
- **LF-14** → MUST CHANGE: `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`
- **LF-15** → MUST CHANGE: `Plans/assistant-chat-design.md`, `Plans/Tools.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Run_Modes.md`
- **LF-16** → MUST CHANGE: `Plans/orchestrator-subagent-integration.md`, `Plans/Tools.md`, `Plans/Permissions_System.md`
- **LF-17** → MUST CHANGE: `Plans/LSPSupport.md`, `Plans/Tools.md`
- **LF-18** → MUST CHANGE: `Plans/MCP_Integration.md`, `Plans/Tools.md`, `Plans/newtools.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`
- **LF-19** → MUST CHANGE: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/interview-subagent-integration.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`
- **LF-20** → MUST CHANGE: `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`
- **LF-21** → MUST CHANGE: `Plans/FinalGUISpec.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`

No active fidelity blocker was left implicit, deferred, or verify-only.

### 8) FINAL REGISTER DETERMINISM CHECK

- No doc appears in more than one final bucket ✅
- MUST CHANGE: 20 docs
- MUST RECONCILE: 6 docs
- MUST VERIFY: 14 docs
- Total unique canonical docs in register: 40

### 9) EXACT-OBLIGATION PRESERVATION CHECK

## RECONCILIATION / COVERAGE PASS — FIDELITY-RECOVERY CONSUMING UPDATE (2026-04-04)

This section supersedes earlier reconciliation registers in this ledger where they conflict with the current docs, the blocked ledger fidelity audit, or the fidelity recovery plan.

### 1) RECONCILIATION SUMMARY

**What design/feature was reconciled:** Firecrawl Gap Analysis + Lost-Spec Recovery for PM web tools, Firecrawl provider integration, routing/batch/cache behavior, questionnaire persistence, MCP owner canon, LSP tool contract, terminal command identity, and all directly-coupled consumer surfaces already implicated by the current packet candidate.

**Major drift risks:**
- `Plans/Tools.md` still compresses implementation-ready web canon into summary rows and short bullets. This is now the dominant packet defect.
- `Plans/storage-plan.md` still treats questionnaire draft/resume state as a vague storage bullet instead of an exact owner contract (`draft_value`, thread-scoped resume, lifecycle split).
- `Plans/MCP_Integration.md` exists but is still missing the exact MCP auth-state / effective-state canon (`authenticated | expired | not_authenticated`, `connected | disabled | needs_auth | needs_client_registration | failed`).
- `Plans/LSPSupport.md` still owns only the LSP op list, not the result/error envelope future implementation must target.
- `Plans/UI_Command_Catalog.md` still leaves `Rerun in Terminal` as prose-only rather than a command-table owned action.
- Packet drift is structural as well as semantic: most blocked docs already have packet anchors, but the anchors currently carry summary-grade content; `Plans/MCP_Integration.md` is still emitted as whole-file `append` instead of section-owned repair.

### 2) RAW COVERAGE LEDGER SUMMARY

**Total docs considered:** 30

**Major doc clusters/themes:**
- **Core owner contracts:** `Plans/Tools.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`, `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Skills_System.md`, `Plans/Contracts_V0.md`, `Plans/Run_Modes.md`, `Plans/LSPSupport.md`, `Plans/MCP_Integration.md`
- **Primary consumer/UI surfaces:** `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`, `Plans/newtools.md`
- **Cross-system reconciliation docs:** `Plans/orchestrator-subagent-integration.md`, `Plans/interview-subagent-integration.md`, `Plans/chain-wizard-flexibility.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Provider_OpenCode.md`, `Plans/human-in-the-loop.md`
- **Summary/index docs likely to drift if left untouched:** `Plans/00-plans-index.md`, `Plans/feature-list.md`, `Plans/newfeatures.md`
- **Likely-overlap verification seams:** `Plans/Prompt_Pipeline.md`, `Plans/Wiring_Matrix.md`, `Plans/Widget_System.md`, `Plans/FileManager.md`

**Where drift risk was highest:**
1. `Plans/Tools.md` — web contract, Firecrawl, routing, batch, cache owner compression
2. `Plans/storage-plan.md` — questionnaire draft/resume and cache-persistence under-specification
3. `Plans/MCP_Integration.md` — missing exact auth/effective-state canon
4. `Plans/LSPSupport.md` — missing LSP result/error envelope
5. `Plans/UI_Command_Catalog.md` — missing `Rerun in Terminal` command ownership row
6. `Plans/assistant-chat-design.md` / `Plans/FinalGUISpec.md` / `Plans/Section15_MVP_Promoted_Features_Spec.md` — consumers that must stay aligned once owner sections are regenerated

### 3) THREE-BUCKET REGISTER

#### MUST CHANGE
- `Plans/Tools.md` — primary owner for `### 3.5D Web operation family runtime contract`, `## 10. Firecrawl provider integration`, `## 11. Provider capability matrix`, `## 12. Web tool routing algorithm`, `## 13. Batch operations`, `## 14. Web content caching layer`; active fidelity blockers FIDELITY-01, FIDELITY-02, FIDELITY-03 land here.
- `Plans/assistant-chat-design.md` — consumer owner for `### 7.4 Question card and questionnaire system`, `### 8.1 Canonical planning model`, `### 13.1 Operation-card family`, `### 13.2 Web activity and provenance`, and slash-command/UI behavior already implicated by the reconciled feature set.
- `Plans/FinalGUISpec.md` — widget/settings owner for provider settings surfaces, promoted widget catalog, approval/UI surfacing, and inline visual/web card projections.
- `Plans/Permissions_System.md` — permission/default/preference owner for web-family defaults, `question`, child-agent `question`, ask-flow semantics, and preset alignment with current web/tool canon.
- `Plans/storage-plan.md` — primary owner for `### 4.2 Question and clarification state`, `### 4.4 Activity transparency payloads`, and `## 8. Web content caching persistence`; active fidelity blocker FIDELITY-04 lands here.
- `Plans/Commands_System.md` — reserved built-in slash command owner; current packet still needs the exact `/web` / `/skill` / `/cancel` / reserved-set alignment to remain durable.
- `Plans/UI_Command_Catalog.md` — command-table owner for terminal/layout and reserved chat-command mapping; active fidelity blocker FIDELITY-07 lands here.
- `Plans/Skills_System.md` — owner for `skill` tool delivery path, `pm_enhanced`, `ready_with_warnings`, import/install boundary, and runtime/management split.
- `Plans/Contracts_V0.md` — owner for tool-specific payload extensions and runtime snapshot/tool payload families consumed by web/tool/storage/runtime docs.
- `Plans/newtools.md` — consumer/compatibility owner for web search / web tools / MCP support summaries that otherwise drift from the repaired owner docs.
- `Plans/Run_Modes.md` — owner for mode overlays and mode-dependent tool availability; must stay aligned with repaired permissions/web behavior.
- `Plans/LSPSupport.md` — primary owner for the LSP op surface plus the missing result/error envelope; active fidelity blocker FIDELITY-06 lands here.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — research-session/browser-action consumer that must align with repaired tool/routing semantics.
- `Plans/CLI_Bridged_Providers.md` — Firecrawl provider consumer summary; must stay coherent with repaired `Plans/Tools.md` Firecrawl owner section.
- `Plans/Models_System.md` — provider capability alignment consumer; must stay coherent with the repaired per-operation matrix and requested/effective provider disclosure.
- `Plans/MCP_Integration.md` — primary MCP owner doc; active fidelity blocker FIDELITY-05 lands here.

#### MUST RECONCILE
- `Plans/orchestrator-subagent-integration.md` — task/subagent/question escalation and shared question/runtime alignment must match repaired owner docs.
- `Plans/interview-subagent-integration.md` — interview question/runtime consumer; already packetized and must stay aligned to repaired `question` / runtime field canon.
- `Plans/chain-wizard-flexibility.md` — shared questionnaire alignment consumer; must stay aligned with repaired question/questionnaire canon.
- `Plans/Multi-Account.md` — requested/effective/runtime-account consumer; must stay aligned with repaired owner runtime fields.
- `Plans/Personas.md` — requested/effective persona field naming consumer; must stay aligned with repaired runtime snapshot canon.
- `Plans/Provider_OpenCode.md` — PM-native vs OpenCode terminology boundary consumer; must stay aligned with repaired provider/web-tool ownership language.
- `Plans/00-plans-index.md` — index summary must reflect the repaired owner/consumer set so the planning index does not drift.
- `Plans/feature-list.md` — feature summary doc is already in the packet candidate and should be reconciled, not left to silently lag behind.
- `Plans/newfeatures.md` — summary/feature-rollup consumer that should stay coherent with repaired web/question/tool surfaces.
- `Plans/human-in-the-loop.md` — approval/ask-flow consumer that should stay aligned with repaired permission/question/terminal recovery semantics.

#### MUST VERIFY
- `Plans/Prompt_Pipeline.md` — verify no stale tool naming or injected-context assumptions remain after repaired owner contracts land.
- `Plans/Wiring_Matrix.md` — verify no stale wiring entries for research-session / web-tool / terminal command identity remain.
- `Plans/Widget_System.md` — verify no conflicting widget taxonomy remains once promoted widget docs are updated.
- `Plans/FileManager.md` — verify file/browser/rendering consumers do not keep stale inline visual or terminal-action assumptions.

### 4) DERIVED / REGEN-ONLY CHECKS

- `Plans/_shards/**` — regenerate after canonical doc changes; never add as packet doc intents.
- `Plans/.evidence/**` — evidence-only / generated outputs; do not packetize.
- `Plans/Spec_Lock.json` — verify after canonical changes; do not hand-edit.
- `Plans/auto_decisions.jsonl` — derived decision log; do not hand-edit.
- `Plans/.pipeline/research_packet.json` — regenerate after owner/consumer reconciliation; current packet content is not fidelity-complete.

### 5) MISSING COVERAGE WARNINGS

- **No path-level impacted-doc omission remains** between the current packet candidate and the reconciled MUST CHANGE + MUST RECONCILE set. The current defect is **packet content/operation fidelity**, not a missing doc path.
- **Packet-shape warning:** `Plans/MCP_Integration.md` is still packetized as `append` rather than heading-owned replacement/repair. That is a packet defect even though the path is already present.
- **Anchor-fidelity warning:** `Plans/Tools.md`, `Plans/storage-plan.md`, `Plans/LSPSupport.md`, and `Plans/UI_Command_Catalog.md` are present in the packet candidate, but their current packet sections are too thin to satisfy active fidelity blockers.

### 6) PACKETIZATION-READY DOC SET

#### MUST CHANGE docs that belong in the regenerated packet

- `Plans/Tools.md`
  - **why it belongs:** primary owner for web tool/runtime/provider/MCP consumer contracts
  - **likely anchor/section:** `### 3.5B \`question\` tool runtime contract`; `### 3.5C \`todowrite\` and \`todoread\` runtime contract`; `### 3.5D Web operation family runtime contract`; `## 5. MCP integration (in scope)`; `### 8.6 MCP tool name format and wildcard rule`; `### 10.2 Default policy table`; `### 10.4 Presets → config mapping`; `## 10. Firecrawl provider integration`; `## 11. Provider capability matrix`; `## 12. Web tool routing algorithm`; `## 13. Batch operations`; `## 14. Web content caching layer`
  - **what kind of change is needed:** owner replacement/regeneration on existing packet anchors
  - **additive vs replace/retire:** must replace/retire stale compressed owner text
  - **exact named obligation(s) that must survive:** `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`, `WebAction.timeout_ms`, `proxy_mode?: "basic" | "enhanced" | "auto"`, `firecrawl_credits_used`, `firecrawl_cache_state`, `firecrawl_scrape_id`, `progress_event`, `provenance_badge`, `execution_path`, TTL defaults, two-phase cache lookup, `autonomous_budget_exceeded`

- `Plans/assistant-chat-design.md`
  - **why it belongs:** primary chat consumer for question/questionnaire, planning/TODO, operation-card family, web activity, slash behavior, and rendering
  - **likely anchor/section:** `### 5.1 Reserved built-ins`; `### 5.2 \`/web\` and \`/skill\``; `### 7.4 Question card and questionnaire system`; `### 8.1 Canonical planning model`; `### 13.1 Operation-card family`; `### 13.2 Web activity and provenance`; `## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)`
  - **what kind of change is needed:** consumer reconciliation against repaired owner docs
  - **additive vs replace/retire:** replace/retire any stale local wording where it conflicts with repaired owners; otherwise additive
  - **exact named obligation(s) that must survive:** `question_id`, `default_values`, `draft_value`, `answered | submitted | dismissed | timed_out | unavailable`, operation-card narrative order, routing-aware web activity labels

- `Plans/FinalGUISpec.md`
  - **why it belongs:** UI/settings/widget consumer for provider settings, promoted widget catalog, approval UI, and visual/web card rendering
  - **likely anchor/section:** `#### 7.4.4 Settings (Unified) panel specification`; `#### 7.4.7 Agent-Config panel specification`; `## 15. Promoted widget catalog (web tools, planning, question, operation cards)`
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** additive plus retirement of stale/incomplete widget summaries where needed
  - **exact named obligation(s) that must survive:** provider class/settings disclosure, web/plan/question/approval widget ownership, inline visual/web-tool rendering split

- `Plans/Permissions_System.md`
  - **why it belongs:** owner for tool permission keys, ask-flow semantics, defaults, presets
  - **likely anchor/section:** `## 5. Tool permission keys`; `## 6. Ask flow semantics`; `## 7. Deterministic defaults`; `### 10.4 Presets`
  - **what kind of change is needed:** owner reconciliation/update
  - **additive vs replace/retire:** replace/retire stale local examples or preset text where needed; keep owner-first
  - **exact named obligation(s) that must survive:** `question` default, child-agent `question`, web-family defaults, ask-flow alignment with repaired web/question owners

- `Plans/storage-plan.md`
  - **why it belongs:** owner for question/questionnaire persistence, activity transparency payloads, cache persistence, runtime field consumption
  - **likely anchor/section:** `### 4.1 Shared runtime identity consumption`; `### 4.2 Question and clarification state`; `### 4.3 Plan and TODO state`; `### 4.4 Activity transparency payloads`; `## 8. Web content caching persistence`
  - **what kind of change is needed:** owner replacement/regeneration
  - **additive vs replace/retire:** must replace/retire thin question/cache owner text
  - **exact named obligation(s) that must survive:** `draft_value`, thread-scoped questionnaire draft state, `response_kind`, `validation_state`, `answered | submitted | dismissed | timed_out | unavailable`, `progress_event`, cache TTL/caching persistence alignment

- `Plans/Commands_System.md`
  - **why it belongs:** owner for reserved slash built-ins
  - **likely anchor/section:** `## 7. Reserved built-in slash commands`
  - **what kind of change is needed:** owner update/reconciliation
  - **additive vs replace/retire:** replace existing reserved-set text if needed rather than append competing lists
  - **exact named obligation(s) that must survive:** `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`, `/cancel` deprecation, `/skill` boundary

- `Plans/UI_Command_Catalog.md`
  - **why it belongs:** owner for canonical command-table identities and reserved chat-command mapping
  - **likely anchor/section:** `#### Terminal session and layout commands`; `### 2.7 Chat slash commands (reserved)`
  - **what kind of change is needed:** owner replacement/regeneration
  - **additive vs replace/retire:** must replace/retire prose-only terminal action treatment
  - **exact named obligation(s) that must survive:** `Rerun in Terminal` plus `Command ID`, `Payload`, `Domain event(s)`, `UI surface(s)` ownership

- `Plans/Skills_System.md`
  - **why it belongs:** owner for `skill` runtime and management path
  - **likely anchor/section:** `### 4.3 \`skill\` tool`; `### 4.4 Canonical MVP delivery path`; `### 6.1 Management surface`; `### 6.2 Import and install flows`; `### 6.3 Slash and runtime boundary`
  - **what kind of change is needed:** owner update
  - **additive vs replace/retire:** replace owner sections where packet already targets them
  - **exact named obligation(s) that must survive:** `pm_enhanced`, `ready_with_warnings`, `skill_id`, install/import/runtime boundary

- `Plans/Contracts_V0.md`
  - **why it belongs:** owner for tool payload extensions and runtime snapshot payload families consumed elsewhere
  - **likely anchor/section:** `### 3.4 Tool-specific payload extensions`; `### 5.1B Persona/Runtime Snapshot Payload Contract`
  - **what kind of change is needed:** owner update
  - **additive vs replace/retire:** additive/replace as needed to keep owner fields canonical
  - **exact named obligation(s) that must survive:** runtime snapshot fields, blocked/web payload extensions consumed by storage/tools/chat

- `Plans/newtools.md`
  - **why it belongs:** consumer summary for PM-native tool framing, web tooling, MCP support, and repair notes
  - **likely anchor/section:** current packet reconciliation note / MCP support section
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** additive with retirement of any stale PM/OpenCode terminology residue
  - **exact named obligation(s) that must survive:** PM-native web tool / MCP framing, repaired owner references

- `Plans/Run_Modes.md`
  - **why it belongs:** owner for mode overlays and mode-specific tool behavior
  - **likely anchor/section:** `### 9.2 \`plan\``
  - **what kind of change is needed:** owner reconciliation
  - **additive vs replace/retire:** replace/retire stale mode language where it conflicts with repaired permissions/web owner text
  - **exact named obligation(s) that must survive:** `plan` mode alignment with repaired web/question/todo behavior

- `Plans/LSPSupport.md`
  - **why it belongs:** primary owner for the LSP feature summary and missing result/error envelope
  - **likely anchor/section:** `## 9. MVP LSP features (summary)`
  - **what kind of change is needed:** owner replacement/regeneration
  - **additive vs replace/retire:** replace thin op-list-only owner text
  - **exact named obligation(s) that must survive:** `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `prepareCallHierarchy`, `incomingCalls`, `outgoingCalls`, `rename`, result/error envelope

- `Plans/interview-subagent-integration.md`
  - **why it belongs:** consumer for question/runtime identity alignment
  - **likely anchor/section:** `### Question system alignment`; `### Runtime identity visibility`; `### Requested/effective Interview contract`
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** replace targeted sections where packet already owns the headings
  - **exact named obligation(s) that must survive:** `QuestionItem`, runtime field names, requested/effective alignment

- `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - **why it belongs:** research-session/browser-action consumer for repaired web/tool/routing canon
  - **likely anchor/section:** `#### 1.3A Research session alignment`
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** replace targeted section
  - **exact named obligation(s) that must survive:** `research_session`, tiered action unlocking, action annotation payload, explicit/non-silent restore rules

- `Plans/CLI_Bridged_Providers.md`
  - **why it belongs:** Firecrawl provider consumer summary
  - **likely anchor/section:** `## Firecrawl provider entry`
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** replace targeted section
  - **exact named obligation(s) that must survive:** provider id `firecrawl`, per-operation support tier disclosure, requested/effective routing disclosure

- `Plans/Models_System.md`
  - **why it belongs:** provider capability and model/provider disclosure consumer
  - **likely anchor/section:** `### 4.5 Web tool provider capability alignment`
  - **what kind of change is needed:** consumer reconciliation
  - **additive vs replace/retire:** replace targeted section
  - **exact named obligation(s) that must survive:** per-operation support tier, model-native auth reuse, health/last-failure visibility

- `Plans/MCP_Integration.md`
  - **why it belongs:** primary MCP owner doc
  - **likely anchor/section:** `## 1. Canonical naming`; `## 2. Requested versus effective availability`; `## 3. Credential binding and invalidation`; `## 4. Cross-surface responsibilities`
  - **what kind of change is needed:** owner repair plus packet-shape correction
  - **additive vs replace/retire:** replace section-owned content; do not keep packet as append-only file creation
  - **exact named obligation(s) that must survive:** `authenticated | expired | not_authenticated`, `connected | disabled | needs_auth | needs_client_registration | failed`, mapping to `LoggedIn | LoggedOut | AuthExpired | AuthFailed`

#### MUST RECONCILE docs that still belong in the regenerated packet

- `Plans/orchestrator-subagent-integration.md` — task/question escalation consumer; likely anchor `#### Task tool contract alignment`; additive reconciliation; exact obligations: parent-owned question flow and task alignment.
- `Plans/chain-wizard-flexibility.md` — shared questionnaire consumer; likely anchor `### 15.6 Shared questionnaire alignment`; replace targeted section; exact obligations: `QuestionItem`, shared questionnaire semantics, repaired draft/resume names.
- `Plans/Multi-Account.md` — runtime-account consumer; likely anchor `### 4.6 Owner/consumer boundary alignment`; replace targeted section; exact obligations: `requested_account_binding`, `operational_identity`.
- `Plans/Personas.md` — runtime persona-name consumer; likely anchor `### 3.3A Field naming alignment with runtime identity`; replace targeted section; exact obligations: `requested_persona`, `effective_persona`.
- `Plans/Provider_OpenCode.md` — PM/OpenCode boundary consumer; likely anchor `### 2.1 PM-native vs OpenCode terminology boundary`; additive/replace targeted section; exact obligations: PM-native ownership boundaries.
- `Plans/00-plans-index.md` — index summary; likely anchor packet reconciliation note section; additive reconciliation; exact obligations: repaired owner docs must be indexed coherently.
- `Plans/feature-list.md` — summary list consumer; likely anchor file-end reconciliation note; additive reconciliation; exact obligations: repaired web/question/tool features remain accurately summarized.
- `Plans/newfeatures.md` — summary rollup consumer; likely anchor file-end reconciliation note; additive reconciliation; exact obligations: repaired web/question/MCP/LSP surfaces stay reflected.
- `Plans/human-in-the-loop.md` — approval/ask-flow consumer; likely anchor file-end or approval-alignment note; additive reconciliation; exact obligations: repaired permission/question/terminal block handling must not drift.

### 7) FIDELITY BLOCKER CONSUMPTION CHECK

- **FIDELITY-01** consumed into **MUST CHANGE** via `Plans/Tools.md`
- **FIDELITY-02** consumed into **MUST CHANGE** via `Plans/Tools.md`
- **FIDELITY-03** consumed into **MUST CHANGE** via `Plans/Tools.md`
- **FIDELITY-04** consumed into **MUST CHANGE** via `Plans/storage-plan.md`
- **FIDELITY-05** consumed into **MUST CHANGE** via `Plans/MCP_Integration.md`
- **FIDELITY-06** consumed into **MUST CHANGE** via `Plans/LSPSupport.md`
- **FIDELITY-07** consumed into **MUST CHANGE** via `Plans/UI_Command_Catalog.md`

No active fidelity blocker was left implicit, deferred, or downgraded to verify-only.

### 8) EXACT-OBLIGATION PRESERVATION CHECK

Exact obligations from `Plans/.pipeline/fidelity_recovery_plan.txt` were preserved as targeting input in this reconciliation result, including:
- `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`
- `WebAction.timeout_ms`
- `proxy_mode?: "basic" | "enhanced" | "auto"`
- `firecrawl_credits_used`, `firecrawl_cache_state`, `firecrawl_scrape_id`
- `progress_event`
- `provenance_badge`, `execution_path`
- TTL defaults (`webfetch`, `webextract`, `webcrawl`, `webmap`, `websearch`, `webresearch`)
- `draft_value`, `default_values`, `question_id`, `response_kind`, `validation_state`
- `authenticated | expired | not_authenticated`
- `connected | disabled | needs_auth | needs_client_registration | failed`
- `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `prepareCallHierarchy`, `incomingCalls`, `outgoingCalls`, `rename`
- `Rerun in Terminal`

Every exact obligation family named in `Plans/.pipeline/fidelity_recovery_plan.txt` was preserved as targeting input in this reconciliation result. Explicitly preserved token families include:

- `enabled`, `api_key`, `base_url`, `timeout_ms`, `proxy_mode`, `cache_enabled`
- `/v2/scrape`, `/v2/crawl`, `/v2/map`, `/v2/search`, `/v2/extract`, `/v2/batch/scrape`, `/v2/agent`
- `batch_webfetch`, `batch_webextract`
- `blocked_reason_code`, `allowed_action_ids[]`, `web_operation`, `web_input`, `sources_ref`, `content_ref`, `map_ref`, `answer_summary_ref`
- `requested_persona`, `effective_persona`, `requested_account_binding`, `operational_identity`
- never `requested_persona_id`, never `effective_persona_id`
- `deny`, `once`, `for session`, `always`
- `pending`, `running`, `completed`, `failed`, `cancelled`, `blocked`
- `pending → running → completed | failed | cancelled | timed_out`
- `adapter_unavailable`, `unsupported_operation`, `content_blocked`, `content_not_found`, `unsupported_source`, `extraction_schema_mismatch`, `autonomous_budget_exceeded`, `no_previous_version`
- bare `/web` no-default behavior; bare `/skill` discovery / invocation behavior
- `Open in Terminal`, `Show Terminal`, `Rerun in Terminal`, `Detach/Pop-Out`
- `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values}`
- `response_kind`, `validation_state`
- source / readiness vocab `bundled|pm_enhanced|catalog_installed|manual_import|project_local|global_local|shadowed` and `ready|ready_with_warnings|invalid|shadowed|disabled`

<ready_for_packetize/>
