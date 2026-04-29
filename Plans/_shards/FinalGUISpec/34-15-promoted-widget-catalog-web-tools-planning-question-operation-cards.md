## 15. Promoted widget catalog (web tools, planning, question, operation cards)

The promoted widget catalog mirrors the shared runtime contracts. Widget entries below replace the older mixed status taxonomy and Mermaid-only collapse.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 15.1 Terminal operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions and give Rerun in Terminal owned command-table treatment rather than collapsing actions into one normalized target.

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out

Rules:
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
### 15.2 Search result card widget

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0269
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Good result row fields:
  - Result should likely carry:
  - Result should carry:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section consumes the linked owner contract and stays aligned with it.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Core rules:
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.

Fields:
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`

Rules:
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- chat may shortlist with search but must read chosen pages before citing them as final evidence
### 15.3 Web and diff operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- Site Reader canon must require real browser interaction, reserve `Reading Site` for the PM-native Site Reader path, and prevent provider-routed fetch from reusing that reserved identity.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Operation cards are restricted to lifecycle-bearing operations, exclude other widget families, and use a locked card-level state machine reconciled against the 8-state agent/process taxonomy.
- Message controls are locked to most-recent-user scope, queued-message FIFO semantics, explicit rewind/discard behavior, always-visible code-block copy, mandatory subagent disclosure, and transient queue state that is not restored across reload or restart.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.

Fields:
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- cancelled: true
- status_badge_state
- `tool_use_id`
- `adapter_id`
- `adapter_selection_reason`
- `duration_ms`
- `timestamp`
- `cached`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health

Rules:
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card
- Open in Terminal
- pending
- running
- completed
- failed
- cancelled
- blocked
- starting
- exited
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- queue state is transient and is not restored across reload or restart
- blocked_reason_code
- allowed_action_ids[]
- denial_reason_code
- denial_source
- suggested_recovery_action
- adapter_id
- adapter_unavailable
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- simple read/grep/glob results remain inline text, not cards
- Stop becomes disabled when a run completes and no next message is queued
- Edit restores content into composer and discards later history/work
- Resend retries the most recent message and discards later history/work
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`
### 15.4 Planning panel widget (sticky sidebar)

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/assistant-chat-design.md#8.1 Canonical planning model

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded

Labels and values:
- Plan
- Deep Plan
- chat.plan_todo_updated
### 15.5 Question card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question flows are locked to PM-managed draft state, required visible options plus a freeform path, resumable multi-question drafts, and explicit dismissed or paused behavior instead of fabricated answers.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- NOT via `sendPrompt`
- Something else
- Always-visible options
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit
- Thread-scoped draft state
- status: 'dismissed'
- draft
- drafts auto-save continuously
- required questions block final submit
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
### 15.6 Mermaid and inline visualizer widgets

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0271
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - render/preview exports (for example Mermaid `SVG` / `PNG`)
  - SVG
  - PNG
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section defines the canonical contract for this surface.

ContractRef: Plans/assistant-chat-design.md#28.2 Inline visualizer bridge

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
### 15.7 Permission approval card widget

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget

Core rules:
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools ask-gated in read_only and plan presets, and carry the blocked/unavailable payload fields through to permission-card consumers.

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
