## 10. Firecrawl provider integration

Firecrawl is a distinct provider in PM's web stack. This owner section covers configuration, endpoint mapping, async behavior, interact-session flow, credit disclosure, change-tracking behavior, and Firecrawl-specific routing rules. Consumer summaries in other docs defer to this section and to the contract-owned payload fields in `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 10.1 Provider configuration
| Field | Type | Notes |
|---|---|---|
| `enabled` | `bool` | Provider availability flag. Default `false` until explicitly enabled in Settings. |
| `api_key` | `secret_ref?` | Required for hosted/cloud Firecrawl. Self-hosted deployments may omit it when the upstream instance does not require an API key. |
| `base_url` | `string` | Defaults to `https://api.firecrawl.dev`; may point to a self-hosted Firecrawl deployment. |
| `timeout_ms` | `integer` | Defaults to `60000`; applies to request execution and async polling ceilings. |
| `proxy_mode` | `'basic' | 'enhanced' | 'auto'` | Exact supported enum. Default `'auto'` for hosted/cloud Firecrawl. |
| `cache_enabled` | `bool` | Defaults to `true`; controls provider-cache hints beneath PM cache precedence. |

Configuration rules:
- `proxy_mode` remains the exact field name and its supported enum is locked to `basic`, `enhanced`, and `auto`.
- self-hosted deployments MUST disclose deployment mode and MUST NOT silently pretend to have hosted-only proxy capability.
- `Fire Engine` availability is a self-hosted capability note: advanced anti-bot and proxy-backed behavior depends on the self-hosted deployment exposing Fire Engine-equivalent support.
- PM stores hosted/cloud versus self-hosted as deployment-mode disclosure; switching between them requires an explicit, user-visible configuration change.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md

Rules:
- self-hosted deployments disclose deployment mode and do not silently imply hosted-only proxy capability
- Keep consumer refs aimed at Plans/FinalGUISpec.md#7.4.4 Settings (Unified) panel specification and Plans/Models_System.md#4.5 Web tool provider capability alignment
### 10.2 Endpoint inventory

Firecrawl-native endpoints that PM maps to are:
- `/v2/scrape`
- `/v2/crawl`
- `/v2/map`
- `/v2/search`
- `/v2/extract`
- `/v2/batch/scrape`
- `/v2/agent`

### 10.3 PM-to-Firecrawl mapping
PM operation names remain canonical. Firecrawl endpoints are provider-specific implementation targets, not alternate PM tool names.

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/assistant-chat-design.md#13.2 Web activity and provenance

| PM operation | Firecrawl path | Contract notes |
|---|---|---|
| `websearch` | `POST /v2/search` | Preserves Serper-backed Google-result behavior, provider `sources[]` / `categories[]`, and optional result scraping behavior in Firecrawl `websearch`. |
| `webfetch` | `POST /v2/scrape` or provider interact-session capture | Provider fetch path exists, but Site Reader remains the primary PM path and provider-routed fetch never reuses the reserved `Reading Site` identity. |
| `webextract` | `POST /v2/extract` | Accepts `urls[]`; preserves JSON Schema support, prompt-driven extraction behavior, URL wildcards for bounded targets, and `enableWebSearch` when retrieval expansion is approved. |
| `webresearch` | `POST /v2/agent` | Preserves no-URL natural-language research, navigation/forms/pagination capability, and structured extraction behavior during provider-native research. |
| `webcrawl` | `POST /v2/crawl` | Page-by-page crawl with PM-owned audit projection and shared progress/cancellation semantics. |
| `webmap` | `POST /v2/map` | URL discovery and sitemap-oriented mapping. |
| `batch_webfetch` | `POST /v2/batch/scrape` | Bulk URL fetch path. |
| `batch_webextract` | `POST /v2/extract` with `urls[]` | Native multi-URL extract mapping; do not rewrite this as scrape-plus-PM extraction. |

Additional mapping rules:
- provider endpoint names never replace PM tool names in UI, storage, or permission policy.
- Response transformation: Adapter MUST flatten into PM's unified `results` array, tagging each item with `source_type`. Merge order: web results first, then news, then images.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md
- Firecrawl actions for `webfetch` route through the provider interact-session model when browser interaction is required.
- PM remains responsible for requested/effective provider disclosure, credit warnings, and canonical error-code projection.
- provider-native research is an optional execution path inside PM's `webresearch` contract; it is never exposed as a second top-level tool family.

#### Change-tracking behavior

`changeTracking` remains explicit canon and MUST NOT disappear silently. If PM chooses not to implement `changeTracking` in MVP, the owner section must carry explicit out-of-scope retirement if `changeTracking` is not MVP; no silent disappearance of the capability is allowed.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Rules:
- when `changeTracking` is requested on a Firecrawl fetch/crawl path that can compare content versions, the normalized result may include `changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }`.
- `changeTracking` is a capability flag on the request/result contract; PM does not silently drop it when the caller asked for it.
- when no prior version exists, PM preserves the canonical `no_previous_version` outcome rather than fabricating a diff.

Additional canonical rules:
- Keep the contract-owned output vocabulary anchored in Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/storage-plan.md#4.4 Activity transparency payloads, and Plans/assistant-chat-design.md#13.2 Web activity and provenance
- changeTracking must either remain structured or be explicitly retired rather than disappearing silently
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md
### 10.4 Async jobs and status contract

Async Firecrawl operations return a job id and are polled with the exact interval ladder `2s, 4s, 8s, 15s, 30s`.

Supported async families in MVP:
- `/v2/crawl`
- `/v2/extract`
- `/v2/batch/scrape`
- `/v2/agent`

Polling rules:
- initial request returns `{ success: true, id: '<job_id>' }`.
- PM polls `GET /v2/<operation>/<job_id>` using the interval ladder above.
- job status remains in the Firecrawl family `scraping | processing | completed | failed | cancelled`.
- `completed` returns full results, `failed` maps to PM-owned error codes, and `cancelled` preserves partial results when any were already materialized.
- when polling exceeds `timeout_ms`, PM returns a timeout outcome and partial results survive timeout if already materialized.
- webhook delivery is a future path, not the MVP contract.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 10.5 Credit and cost contract

| PM operation | Firecrawl endpoint | Base credit cost | Notes |
|---|---|---|---|
| `websearch` | `/v2/search` | `2` per 10 results | Scrape options add their own cost. |
| `webfetch` | `/v2/scrape` | `1` per page | Enhanced proxy and JSON modes increase per-page cost. |
| `webfetch` interact mode | `/v2/scrape/{scrapeId}/interact` | `2/min` code or `7/min` prompt | Session-time based. |
| `webextract` | `/v2/extract` | `~15 tokens/credit` | JSON-heavy extraction increases cost. |
| `webresearch` | `/v2/agent` | `20-2500` | Spark-1-mini is cheaper than Spark-1-pro. |
| `webcrawl` | `/v2/crawl` | `1` per page crawled | Enhanced proxy and JSON modes add modifiers. |
| `webmap` | `/v2/map` | `~1` | Exact hosted billing is lightly documented; PM treats this as approximate. |
| `batch_webfetch` | `/v2/batch/scrape` | `1` per URL | Same modifiers as `webfetch`. |

Routing and disclosure rules:
- PM shows a credit warning before Firecrawl execution when the estimate is `>100 credits`.
- PM enforces a default hard cap of `500 credits` for one research or batch session unless the user raises it in settings.
- self-hosted Firecrawl does not use hosted credit billing, so hosted-credit warnings do not apply there.
- section 12 routing consumes these cost signals when providers offer similar capability.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md#12-web-tool-routing-algorithm

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
Firecrawl-specific execution still projects through PM-owned audit and error contracts. Firecrawl-specific payload keys are contract-owned in `Plans/Contracts_V0.md#3.4 Tool-specific payload extensions` and are consumed here rather than re-owned here.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Audit and routing rules:
- requested and effective provider routing remain visible through `requested_adapter_id`, `effective_adapter_id`, `adapter_selection_reason`, and `provider_fallback_summary`.
- Firecrawl execution may extend the shared payload with `firecrawl_credits_used`, `firecrawl_cache_state`, and `firecrawl_scrape_id` as contract-owned fields.
- `firecrawl_cache_state` uses PM cache vocabulary `hit | miss | bypassed | expired_used_for_diff` when applicable.
- fallback is user-visible; no silent fallback is allowed when a provider is skipped, rate-limited, or fails over.
- denied-web episodes project through the shared `tool.denied` and `tool.invoked` payload families rather than ad hoc provider-local fields.
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl; deployment-mode disclosure remains visible in Settings, logs, and approvals.
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
- self-hosted Firecrawl still reports the canonical PM error codes and audit payload shape; self-hosting changes deployment, not the public contract.


Long-running progress and cancellation reuse the shared `progress_event` payload. Each `progress_event` carries `tool_use_id`, `operation`, `phase`, optional `detail`, `pages_completed`, `pages_total`, `elapsed_ms`, `estimated_remaining_ms`, and `cancelled: true` when work is interrupted after partial materialization.

Firecrawl-specific notes:
- Firecrawl is disabled by default until explicitly enabled in Settings.
- provider credit warnings surface before large-cost operations such as autonomous research or large batch fetches.
- HTTP/provider failures map through `Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability`; provider-local status strings are not exposed as standalone canon.
- HTTP 401/403 → `adapter_unavailable`.
- HTTP 429 → `rate_limited`.
- HTTP 402 → `rate_limited`.
- HTTP 500/502/503 → `adapter_unavailable`.
- Timeout → `timeout`.
- HTTP 404 → `content_not_found`.
- HTTP 400 → `invalid_input`.
- "Blocked by robots.txt" → `crawl_robots_blocked` or `content_blocked`.
- "Content too large" → `content_too_large`.

Rules:
- partial completed work survives cancellation and timeout boundaries when already materialized
- error_code
- fallback is user-visible and no silent fallback is allowed
- self-hosted Firecrawl changes deployment, not the public PM error or audit contract
- web operation approvals must surface the same summaries defined by Plans/Permissions_System.md#3.4A Web-operation permission-key derivation
