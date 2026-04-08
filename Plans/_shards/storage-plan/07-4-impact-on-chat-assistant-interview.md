## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption

Shared runtime identity projection is consumed across chat, widgets, audit, and delegated execution. Storage keeps the canonical field names and their meanings aligned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md

| Field | Meaning |
|---|---|
| `requested_persona` | Persona requested for the run. |
| `effective_persona` | Persona actually in effect. |
| `requested_account_binding` | Requested account or provider binding before routing and policy resolution. |
| `operational_identity` | Stable runtime identity used for execution and audit. |
| `effective_account_label` | Human-readable effective account label shown to the user. |
| `effective_provider_identity` | Effective provider/account pair used after routing. |
| `effective_project_id` | Project identity bound to the execution context. |

Storage rules:
- these fields are additive and do not replace the existing requested/effective vocabulary
- `_id` aliases such as `requested_persona_id` are not canonical runtime snapshot fields
- chat and GUI surfaces consume the same stored field names rather than projecting local variants
### 4.2 Question and clarification state
Question and clarification state persists the shared `question` runtime contract rather than a chat-local form model.

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

Stored request fields:
- `mode`, `header`, `prompt`, `questions`, `context_ref?`, `visual_ref?`
- each `questions` item keeps `question_id`, `question`, `options[]`, `required`, `multi_select`, `allow_freeform`, `allow_other?`, `default_values?`, `response_kind?`, and `validation_state?`

Stored answer fields:
- `status`
- `answers: Array<{question_id, values: string[]}>`
- `answer_text?`
- `source?`
- `response_kind?`
- `validation_state?`
- `draft_value?`
- `unanswered_question_ids[]?`
- `answered_at_utc?`

Persistence rules:
- `allow_other is a deprecated alias`; persistence normalizes it to `allow_freeform` before storage or resume rendering
- `default_values?: string[]` are caller-supplied initial option ids; `draft_value?: string` is PM-managed freeform draft state restored on resume
- `response_kind?: "selection" | "freeform" | "mixed"` and `validation_state?: "valid" | "invalid" | "pending"` are optional preserved fields when the request surface needs them
- PM-managed drafts restore by `question_id`
- outcomes remain `answered`, `submitted`, `dismissed`, `timed_out`, and `unavailable`
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
- child-agent clarification remains parent-mediated even when the stored request originated from delegated work

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/FinalGUISpec.md

Rules:
- drafts restore by question_id
- child-agent clarification remains parent-mediated even when delegated work originated the request
- Keep this persistence section consuming Plans/Contracts_V0.md#3.4 Tool-specific payload extensions and Plans/Tools.md#3.5B `question` tool runtime contract
### 4.3 Plan and TODO state
Plan and TODO persistence keeps plan lifecycle and item lifecycle separate.

ContractRef: ContractName:Plans/Tools.md#3.5C `todowrite` and `todoread` runtime contract, ContractName:Plans/assistant-chat-design.md

Stored TODO item schema:
- `todo_id`
- `title`
- `summary`
- `notes?`
- `status`
- `dependencies[]`
- `owner_hint`
- `verification_hint`

Item status is exactly `pending | in_progress | completed | blocked | skipped`.

Plan artifact lifecycle states:
- `draft`
- `approved`
- `executing`
- `completed`
- `blocked`
- `superseded`

Rules:
- todoread returns current normalized list for active thread/run
- `todoread` returns current normalized list for active thread/run
- `todowrite` can create, reorder, update statuses/notes
- Remove `todowrite` from blanket `ask/plan` mode auto-deny; normalized planning-state mutation follows planning approval rules instead
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
- plan-level states live on the plan artifact or revision record, not in the item `status` field
- Deep Plan remains in the Q&A loop until the user approves or resubmits the plan; execution does not begin before the plan reaches `approved`
- Structural edits = adding / removing / reordering TODO items
- once execution starts, structural edits are gated while status and note updates remain allowed against the normalized TODO projection

ContractRef: ContractName:Plans/Tools.md#3.5C `todowrite` and `todoread` runtime contract, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Projection rules:
- plan/TODO mutations emit `chat.plan_todo_updated` as defined by `Plans/Contracts_V0.md#1.1 Assistant worktree seglog events`
- revision/history persistence distinguishes structural plan revisions from item status updates
- sticky execution tracking restores against the same normalized TODO projection used by `todoread` and `todowrite`

ContractRef: ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events, ContractName:Plans/FinalGUISpec.md

Additional canonical rules:
- durable TODO state stays synchronized with the normalized todowrite/todoread contract
- plan artifact lifecycle stays separate from item lifecycle
- planning-state mutation follows planning approval rules rather than generic read-only web posture
- Keep plan/TODO mutation refs anchored to Plans/Contracts_V0.md#1.1 Assistant worktree seglog events
### 4.4 Activity transparency payloads
Activity transparency stores one shared payload family for chat transparency, operation cards, audit history, and later drill-down surfaces.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### Web-operation child payload

| Key | Type | Notes |
|---|---|---|
| `web_operation` | `string` | One of `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`, `batch_webfetch`, `batch_webextract` where applicable. |
| `web_input` | `object` | Structured normalized request snapshot. Never a preview string. |
| `requested_adapter_id` | `string?` | Requested provider or adapter id. |
| `effective_adapter_id` | `string?` | Provider or adapter actually used. |
| `adapter_selection_reason` | `string?` | Why the effective provider/path was selected. |
| `provider_fallback_summary?` | `string` | User-visible fallback explanation when fallback occurred. |
| `warnings_count` | `number` | Count of surfaced warnings. |
| `error_code?` | `string` | Canonical PM error code when the operation failed or degraded. |
| `error_message?` | `string?` | Canonical user-visible failure text when present. |
| `warnings?` | `string[]?` | Canonical warnings array when present. |
| `provenance_badge?` | `string?` | User-visible provenance/source badge. |
| `tool_use_id` | `string` | Stable correlation id for the specific web invocation. |
| `duration_ms` | `integer` | Elapsed execution duration. |
| `timestamp` | `string` | Stable event timestamp. |
| `cached` | `boolean` | Whether the served result came from cache. |
| `projection_freshness` | `current | refreshing | stale` | Freshness state. |
| `projection_health` | `healthy | degraded | unavailable` | Health state. |
| `sources_ref?` / `content_ref?` / `map_ref?` / `answer_summary_ref?` | `string` | Durable refs for large payloads or synthesized answers. |
| `blocked_reason_code?` | `string` | Canonical blocked or unavailable class for denied or blocked web execution. |
| `denial_reason_code?` | `string` | Present for denied or blocked web execution. |
| `denial_source?` | `string` | Source of the denial decision. |
| `suggested_recovery_action?` | `string` | User-facing recovery hint. |
| `allowed_action_ids[]?` | `string[]` | Explicit recovery actions available to the user or approval ladder. |
| `progress_event?` | `object` | Structured long-running progress payload. |

Contract-owned extensions may add `firecrawl_credits_used`, `firecrawl_cache_state`, and `firecrawl_scrape_id`; those names remain owned by `Plans/Contracts_V0.md` rather than this storage plan.

#### Batch parent payload

| Key | Type | Notes |
|---|---|---|
| `requested_tool` | `string` | Batch family tool requested by the caller. |
| `batch_size` | `integer` | Total URLs/items requested. |
| `unique_domains` | `integer?` | Count of distinct domains in the batch when known. |
| `continue_on_error` | `boolean` | Canonical strict-vs-continue execution switch. |
| `completed_children` | `integer` | Number of child operations completed before batch end. |
| `failed_children` | `integer` | Number of child operations that failed. |
| `blocked_children` | `integer` | Number of child operations blocked or denied. |
| `parent_ref` | `string` | Stable parent audit/event reference. |

Batch rules:
- batch web operations persist one parent audit event for the batch plus child audit events per URL
- parent and child events use the canonical `tool.invoked` and result families rather than a batch-only envelope
- when `continue_on_error` is `false`, the first failure closes the batch, preserves already completed child results, and marks later unstarted children as not run rather than successful
- child payloads keep per-URL provider selection, refs, and error code, and remain linked to the parent event

#### Long-running `progress_event` payload

| Key | Type | Notes |
|---|---|---|
| `tool_use_id` | `string` | Stable correlation id for the long-running operation. |
| `operation` | `string` | The active operation family, including batch tools where applicable. |
| `phase` | `string` | Current phase such as `queued`, `fetching`, `extracting`, `polling`, `completed`, or `cancelled`. |
| `detail` | `string?` | User-visible progress detail. |
| `pages_completed` | `integer?` | Count of completed pages/URLs/items. |
| `pages_total` | `integer?` | Total expected pages/URLs/items when known. |
| `elapsed_ms` | `integer?` | Elapsed time in milliseconds. |
| `estimated_remaining_ms` | `integer?` | Best-effort remaining time estimate when known. |
| `cancelled` | `bool?` | Set to `true` when the operation was cancelled after work started. |

Progress and cancellation rules:
- denied or blocked web events still use the same payload family
- ref dereference remains on-demand in history and audit views
- freshness and health are independent dimensions and are not collapsed into a single status field
- if cancellation occurs after some work completed, the persisted payload keeps completed partial results plus `cancelled: true` rather than discarding the finished work
- timeout or provider interruption may still preserve partial results when the provider already materialized them before the failure boundary
- partial completed work survives cancellation and timeout boundaries when already materialized

#### Carry-through rules

- denied or blocked web episodes persist `blocked_reason_code`, `allowed_action_ids[]`, `denial_reason_code`, `denial_source`, and `suggested_recovery_action` without inventing GUI-local replacements.
- if `changeTracking` is part of the request/result, persistence carries the structured field rather than dropping it; if PM retires it from MVP, the owner docs must state explicit out-of-scope retirement if `changeTracking` is not MVP and no silent disappearance of the capability is allowed.
- If request includes `actions`, skip cache entirely (always fresh-execute); Cache STORE still applies to the final result after actions execute.
- PM cache takes precedence for serving cached content.
- Firecrawl cache serves as provider-side optimization only.
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"` remains the canonical cache-state vocabulary.

ContractRef: ContractName:Plans/Tools.md#14-web-content-caching-layer, ContractName:Plans/Contracts_V0.md

Rules:
- denied or blocked web episodes persist the shared blocked-recovery fields without GUI-local replacements
- if request includes actions, cache serving is bypassed but the final post-action result may still be stored
- blocked episodes keep the recovery actions and denial source needed by approval UI
- error naming aligns to `adapter_unavailable`
- Keep this owner section feeding Plans/assistant-chat-design.md#13.2 Web activity and provenance and Plans/FinalGUISpec.md#15.3 Web and diff operation card widget
- partial completed work survives cancellation and timeout boundaries when already materialized
- Keep this sub-section mirrored into Plans/Contracts_V0.md#3.4 Tool-specific payload extensions and Plans/FinalGUISpec.md#15.3 Web and diff operation card widget
### 4.5 Inline visualizer persistence

Inline visualizer persistence stores only PM-managed source, metadata, and PM-owned outputs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Persistence rules:
- persisted fields include source fragment, title, kind, version, and PM-managed output or draft values
- arbitrary JS heap state is not persisted
- replay or reload re-renders from the persisted source plus metadata
- visible fallback and error state are persisted as PM-owned display state, not as arbitrary client script state
