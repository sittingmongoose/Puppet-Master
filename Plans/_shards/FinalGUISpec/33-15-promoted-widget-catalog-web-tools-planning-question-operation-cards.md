## 15. Promoted widget catalog (web tools, planning, question, operation cards)

The promoted widget catalog mirrors the shared runtime contracts. Widget entries below replace the older mixed status taxonomy and Mermaid-only collapse.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 15.1 Terminal operation card widget
Terminal operation cards render lifecycle-bearing command and terminal activity without pretending to be a second shell.

Card states: `pending`, `running`, `completed`, `failed`, `cancelled`, `blocked`

Card anatomy:
- command label plus cwd/runtime identity summary
- status badge, duration/timestamp, and exit-code disclosure when known
- a read-only transcript preview using aligned caps: `5` collapsed, `15` expanded, `50` hard cap
- explicit command/code copy affordances where supported, without turning the preview into an editor

Actions:
- `Open in Terminal`
- `Show Terminal`
- `Rerun in Terminal`
- `Detach/Pop-Out`

Behavior rules:
- the inline mini terminal is read-only and non-interactive
- `Open in Terminal` and `Show Terminal` must focus the same live session
- `Rerun in Terminal` launches a fresh execution and therefore binds to a new `terminal_session_id`
- retry/re-run creates a new card instead of mutating prior history
- the card persists after completion or failure as transcript history rather than auto-removing itself
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- if only historical state remains, the reveal action opens the historical receipt and explicit recovery controls instead of silently creating a replacement session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
- simple read/grep/glob results remain inline text, not cards

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Rules:
- Open in Terminal and Show Terminal focus the same live session
- Keep this widget consuming Plans/assistant-chat-design.md#13.1 Operation-card family and Plans/assistant-chat-design.md#13.3 Bash and terminal ownership
### 15.2 Search result card widget
Search cards show routed provider disclosure, `provider_fallback_summary` when present, and evidence refs without collapsing the underlying requested operation.

ContractRef: ContractName:Plans/assistant-chat-design.md#13.2 Web activity and provenance, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

Search-card rules:
- cards distinguish shortlist results from the later read path used for final answer construction
- search-then-read behavior remains visible: final citations come from the actual read path, and raw search snippets alone are not enough provenance for the final answer
- if a result opens through the PM-native Site Reader path, the card may show `Reading Site`; provider-routed fetch must not reuse the reserved native Site Reader identity
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- requested/effective provider disclosure stays visible whenever routing changes the execution path
- search cards do not inherit generic copy affordances for the rendered results block

Rules:
- cards distinguish shortlist results from the later read path used for final-answer construction
- search cards do not inherit generic copy affordances for rendered result blocks
- Keep this widget pointed at Plans/assistant-chat-design.md#13.2 Web activity and provenance and Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context
### 15.3 Web and diff operation card widget
Web and diff cards consume the shared operation-card family while preserving the web-specific routing, preview, and blocked-recovery contract.

Common fields:
- `tool_use_id`
- `web_operation`
- `requested_adapter_id`
- `effective_adapter_id`
- `adapter_selection_reason`
- `provider_fallback_summary`
- `adapter_id`
- `duration_ms`
- `timestamp`
- `cached`
- `warnings_count`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- `projection_freshness`
- `projection_health`
- `cache_state`
- `sources_ref`, `content_ref`, `map_ref`, and `answer_summary_ref`
- `progress_event { tool_use_id, operation, phase, detail, pages_completed, pages_total, elapsed_ms, estimated_remaining_ms, cancelled: true }`
- aligned preview caps: `5` collapsed, `15` expanded, `50` hard cap

Blocked and denied recovery fields:
- `blocked_reason_code`
- `allowed_action_ids[]`
- `denial_reason_code`
- `denial_source`
- `suggested_recovery_action`
- `status: "unavailable"` for headless unavailable or HITL-unavailable branches

Behavior rules:
- retry creates a new card instead of rewriting the prior card's history
- rendered result blocks stay non-editable and do not become generic copy targets
- provider fallback, cache posture, and blocked recovery remain visible instead of collapsing into one summary string
- batch cards preserve the parent/child audit relationship instead of flattening the run into one opaque result
- when `continue_on_error: false`, the batch stops on the first failure, keeps already completed child results, shows the failing child plus recovery context, and does not pretend later URLs ran successfully
- `Reading Site` remains reserved for the PM-native Site Reader path; provider-routed fetch must not reuse the reserved native Site Reader identity
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md#13.2 Web activity and provenance, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Rules:
- provider fallback, cache posture, freshness, and health remain visible instead of collapsing into one summary string
- batch cards preserve parent/child audit relationship
- retry creates a new card instead of rewriting history
- headless/HITL-unavailable uses status unavailable
- blocked recovery consumes allowed_action_ids[] rather than GUI-local fields
- Keep this widget pointed at Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, and Plans/assistant-chat-design.md#13.2 Web activity and provenance
### 15.4 Planning panel widget (sticky sidebar)
The planning panel is a real sticky execution tracker consuming `todo_id`, `title`, `summary`, `status`, `dependencies[]`, `owner_hint`, and `verification_hint`.

It preserves revision/history views, focused-progress behavior, and plan-level lifecycle `draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`.

Structural edits = adding / removing / reordering TODO items.
Structural edits are gated once the plan is approved and execution has started; status and note updates remain available.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
### 15.5 Question card widget
Question cards render the shared `QuestionItem` contract and the normalized request envelope `mode: "single_question" | "questionnaire"` with `questions: Array<QuestionItem>`.

Behavior rules:
- question cards may include a visual
- options remain visible while the question is open
- users can answer out of order and revise before submit
- PM-managed drafts auto-save until submit and restore on resume
- dismissing pauses conversation until resume
- outcomes remain `answered`, `submitted`, `dismissed`, `timed_out`, and `unavailable`
- headless/HITL-unavailable uses `status: "unavailable"`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Rules:
- status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"
- Something else
- headless/HITL-unavailable uses status unavailable
- Keep this widget pointed at Plans/assistant-chat-design.md#7.4 Question card and questionnaire system and Plans/storage-plan.md#4.2 Question and clarification state
### 15.6 Mermaid and inline visualizer widgets
Mermaid and inline visualizer widgets remain separate widgets.

Mermaid widget secondary actions:
- `Copy source`
- `Open in editor`
- `Open detached preview`
- `Export diagram`

Inline visualizer secondary actions:
- `sendPrompt(text)`
- `openLink(url)`
- `Copy source`
- `Open in editor`
- `Open detached preview`

Sandbox and bridge rules:
- the inline visualizer uses the PM-managed bridge, theme-token injection, auto-resize reporting, and visible fallback described by `Plans/assistant-chat-design.md#28.2 Inline visualizer bridge`
- PM must NOT execute arbitrary HTML or arbitrary host script from model output
- only allowlisted tags/attributes render inside the visualizer sandbox
- visible fallback and error state remain PM-owned display state rather than arbitrary client state

- allowlisted tags/attributes only

ContractRef: ContractName:Plans/assistant-chat-design.md#28.2 Inline visualizer bridge, ContractName:Plans/FinalGUISpec.md

Rules:
- Mermaid and inline visualizer remain separate widgets
- bridge actions are explicit typed callbacks
- Keep widget behavior aligned with Plans/assistant-chat-design.md#28.2 Inline visualizer bridge
### 15.7 Permission approval card widget
Behavior rules:
- canonical blocked classes include `permission_denied`, `network_error`, `adapter_unavailable`, and `timeout`
- question default `allow` only when HITL is available
- `read_only` and `plan` keep read-only web tools ask-gated rather than silently denying them
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- LSP consumers preserve: Position-based operations use `path` + `position`. `rename` requires `path` + `position` + `newName`.

ContractRef: ContractName:Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, ContractName:Plans/LSPSupport.md, ContractName:Plans/assistant-chat-design.md

Rules:
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"
- canonical blocked classes remain permission_denied, network_error, adapter_unavailable, and timeout
- headless or HITL-unavailable renders as unavailable state rather than GUI-only recovery text
- question default allow only when HITL is available
- read_only and plan keep read-only web tools ask-gated
- Approving webresearch For Session does not create a broad allow for unrelated tools
- Keep this card pointed at Plans/Permissions_System.md#3.4A Web-operation permission-key derivation and Plans/storage-plan.md#4.4 Activity transparency payloads
