## 13. Activity transparency: search, bash, and file activity

Activity transparency uses a shared inline operation-card family rather than isolated one-off widgets.

### 13.1 Operation-card family
This section defines the canonical contract for this surface.

Core rules:
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Operation cards are restricted to lifecycle-bearing operations, exclude other widget families, and use a locked card-level state machine reconciled against the 8-state agent/process taxonomy.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools ask-gated in read_only and plan presets, and carry the blocked/unavailable payload fields through to permission-card consumers.

Fields:
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- status_badge_state

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
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
- denial_reason_code
- denial_source
- suggested_recovery_action
- projection_freshness
- projection_health
- adapter_id
- adapter_unavailable
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- simple read/grep/glob results remain inline text, not cards
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`
### 13.2 Web activity and provenance
This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability

Core rules:
- Preserve the Firecrawl-specific audit payload keys as exact contract-owned fields.
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- Site Reader canon must require real browser interaction, reserve `Reading Site` for the PM-native Site Reader path, and prevent provider-routed fetch from reusing that reserved identity.
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; it must not disappear silently.
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- The Firecrawl owner section must preserve shared routing/audit disclosure for requested/effective provider selection, fallback visibility, denied-web projection, and canonical web error taxonomy linkage.
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`
- changeTracking.status
- changeTracking.previous_content_ref
- changeTracking.diff_summary_ref
- changeTracking.checked_at_utc
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

Permission rules:
- single confirmation prompt showing all unique domains in the batch
- For Session grants all listed domains for that session

Rules:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- fallback-only
- webfetch
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`
- native (model)
- pm-composed
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: 'new' | 'same' | 'changed' | 'removed'
- pages[].change_status
- change_summary
- explicit out-of-scope retirement if `changeTracking` is not MVP
- no silent disappearance of the capability
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- tool.denied
- tool.invoked
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
- `urls: string[]` (required; min 1, max 50)
- `concurrency?: number` (default 3; max 10
- `continue_on_error?: boolean` (default true
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)
- chat may shortlist with search but must read chosen pages before citing them as final evidence
### 13.3 Bash and terminal ownership
This section defines the canonical contract for this surface.

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
### Command-card model
Command cards are transcript-adjacent summaries rather than a second shell implementation.

Rules:
- cards surface summary, status, and a primary reveal action without pretending to own the full shell lifecycle
- when shell integration is `rich` or `basic`, command cards may expose cwd, duration, exit code, and command labels according to confidence tier
- when shell integration is `opaque`, the card MUST degrade to lower-confidence activity disclosure and MUST NOT fabricate exact command text or exact command boundaries
- transcript continuity remains canonical even when command-card metadata is degraded

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

### Reveal and focus behavior
- if the referenced terminal session is already visible, `Open in Terminal` and `Show Terminal` simply focus it
- if the session is hidden inside another pane, tab, or section, the shell reveals the existing pane or tab before creating anything new
- if only historical state remains, the card opens that historical shell receipt and presents explicit recovery actions instead of silently creating a replacement session
- explicit `New Terminal` and explicit restart remain separate user-visible actions

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Status, degradation, and linked-surface behavior
Command-card status badges may reflect `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, and `attention_required`.

Rules:
- chat preview stays compact even when the terminal transcript is large
- Output, Problems, Debug Console, and Ports continue to route through the owning terminal or dev-session identity rather than through chat-local state
- command cards may link to Output, Problems, or Ports when the command or dev session produced those linked surfaces

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md
### 13.4 Shared runtime identity display
Assistant Chat may display requested/effective runtime identity, but it must consume the owner-doc shared runtime model rather than invent assistant-local fields.

Rules:
- compact chat surfaces may show only the material display summary needed for that moment
- the message-under-row summary uses the resolved user-facing mode label, model, and time or duration
- the mode display label is derived from canonical shared fields rather than from assistant-local string assembly
- compact chat surfaces do not show version and do not show `current` or `frozen` wording
- historical thread/activity views show frozen requested/effective runtime state captured for that execution
- assistant/chat MUST NOT introduce local replacement fields such as `active_model`, `actual_model`, or `assistant_runtime_state`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Message runtime popover fields are closed to:
- `Mode`
- `Provider`
- `Model`
- `Effort`
- `Persona`
- `Worker`
- `Tokens`
- `Context`

Label rules:
- `Mode` uses the normalized user-facing labels `Ask`, `Agent`, `Plan`, and `Deep Plan`
- `Worker` is `Agent` or `Subagent`
- `Tokens` shows compact total and may disclose breakdown on expansion or in the detailed pane
- `Context` shows used, limit, and percentage when known
- assistant rows show thinking time or duration; user rows show timestamp

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Display mapping rules:
- `Deep Plan` is shown when the effective overlay is `deep_plan`
- `Plan` is shown when the effective overlay is `plan` and the runtime posture is planning
- `Ask` is shown when the effective runtime posture is `ask` and no higher planning overlay is active
- `Agent` is shown for normal execution posture when no higher planning overlay is active

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md
