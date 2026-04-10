## 10. Firecrawl provider integration

Firecrawl is a distinct provider in PM's web stack. This owner section covers configuration, endpoint mapping, async behavior, interact-session flow, credit disclosure, change-tracking behavior, and Firecrawl-specific routing rules. Consumer summaries in other docs defer to this section and to the contract-owned payload fields in `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 10.1 Provider configuration

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.

Fields:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- Firecrawl is disabled by default until explicitly enabled in Settings

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
### 10.2 Endpoint inventory

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl owner section must preserve the exact endpoint inventory.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- /v2/scrape
- /v2/crawl
- /v2/map
- /v2/search
- /v2/extract
- /v2/batch/scrape
- /v2/agent

### 10.3 PM-to-Firecrawl mapping

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl webextract mapping must preserve structured extraction modes and option surface, not a thin single-URL summary.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; it must not disappear silently.
- The Firecrawl mapping table must preserve all PM operation rows, including the exact batch_webextract mapping POST /v2/extract with urls[].
- Firecrawl search responses must be transformed into PM's unified search result shape by flattening source-partitioned results into one results array and tagging each item with source_type in a fixed merge order.

Fields:
- webextract
- JSON Schema support
- prompt-driven extraction behavior
- URL wildcards
- enableWebSearch
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
- Response transformation
- Adapter MUST flatten into PM's unified `results` array
ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads
- tagging each item with `source_type`
- Merge order: web results first, then news, then images

Labels and values:
- Firecrawl
- websearch
- webfetch
- webcrawl
- webmap

Rules:
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: 'new' | 'same' | 'changed' | 'removed'
- pages[].change_status
- change_summary
- explicit out-of-scope retirement if `changeTracking` is not MVP
- no silent disappearance of the capability
- batch_webfetch
- batch_webextract
- POST /v2/extract
- urls[]
### 10.4 Async jobs and status contract

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl async contract must preserve timeout behavior tied to timeout_ms and partial-result survival on timeout.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- The Firecrawl async contract must preserve the exact poll ladder and status family already restored in the owner section.

Fields:
- timeout_ms
- timeout when polling exceeds `timeout_ms`
- partial results survive timeout if already materialized
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
- 2s, 4s, 8s, 15s, 30s
- scraping
- processing
- completed
- failed
- cancelled

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
### 10.5 Credit and cost contract

This section defines the canonical contract for this surface.

Core rules:
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- The Firecrawl credit and disclosure contract must preserve the warning threshold, hard cap, and self-hosted billing exception already restored in the owner section.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- self-hosted Firecrawl does not use credit billing
### 10.6 Interact-session contract

Firecrawl supports a stateful browser session built on `/v2/scrape/{scrapeId}/interact`.

Session flow:
1. `POST /v2/scrape { url }` returns a `scrapeId` in metadata.
2. `POST /v2/scrape/{scrapeId}/interact { prompt | code }` resumes the same browser session.
3. Multiple interact calls reuse session state including DOM, cookies, and scroll position.
4. `DELETE /v2/scrape/{scrapeId}/interact` terminates the session and releases provider resources.

Interaction modes and session properties:
- prompt-based interaction is natural-language driven and maps well to PM's higher-level action intent.
- code-based interaction is an adapter-internal precision path; PM does not expose raw provider code execution as a first-class user tool surface.
- sessions default to a 10-minute TTL with a 5-minute inactivity timeout.
- responses may include `liveViewUrl` and `interactiveLiveViewUrl`.
- PM does not surface those URLs as first-class MVP UI because PM owns the browser surface directly.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md#3.5D-web-operation-family-runtime-contract

### 10.7 Audit, error, and self-hosted rules

This section defines the canonical contract for this surface.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget, Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability

Core rules:
- Preserve the Firecrawl-specific audit payload keys as exact contract-owned fields.
- PM must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl, and deployment-mode disclosure must remain visible.
- The Firecrawl owner section must preserve shared routing/audit disclosure for requested/effective provider selection, fallback visibility, denied-web projection, and canonical web error taxonomy linkage.
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools ask-gated in read_only and plan presets, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- HTTP 404 → `content_not_found`
- HTTP 400 → `invalid_input`
- "Blocked by robots.txt" → `crawl_robots_blocked` or `content_blocked`
- "Content too large" → `content_too_large`

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
ContractRef: Plans/Permissions_System.md#3.4A Web-operation permission-key derivation
ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- self-hosted Firecrawl does not use hosted credit billing
- tool.denied
- tool.invoked
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
- deny
- once
- for session
- always
- question default `allow` only when HITL is available
- read_only
- plan
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"
