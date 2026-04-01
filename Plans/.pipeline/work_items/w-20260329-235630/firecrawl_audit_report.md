# Firecrawl Capability Audit — Gap Report
## Ledger: `w-20260329-235630/working_ledger.md`
## Date: 2025-08-25

---

## Summary

The ledger is **remarkably thorough**. Of 11 major Firecrawl capability areas, 6 are fully covered, 4 are partially covered with specific omissions, and 1 has a significant gap. The ledger already identified many of these as gaps in its own "FIRECRAWL INTEGRATION GAPS" section (lines 2199-2211). What follows catches the delta between Firecrawl's CURRENT docs and the ledger's specs.

---

## Per-Capability Audit

### 1. Scrape (single-page extraction) — ✅ Fully Covered
**Firecrawl reality:** `POST /v2/scrape` returns markdown, HTML, rawHtml, screenshot, links, json, images, summary, branding, audio. Supports `onlyMainContent`, location/language, caching (`maxAge`), Zero Data Retention, and enhanced proxy modes.

**Ledger coverage:** Part R (line 1423) maps webfetch → `/v2/scrape` with all key parameters. Part S (line 1547-1623) defines the enhanced webfetch contract with 8 format types matching Firecrawl. Proxy mode mapped at line 1411. Cache mapped at line 1450.

**Minor omissions (non-actionable):**
- ⚠️ Firecrawl now has `branding` format (extracts brand identity: colors, fonts, typography, spacing, UI components). Ledger does not mention it. **PM relevance: LOW** — branding extraction is a design-system analysis feature, not an IDE agent use case. No spec text needed.
- ⚠️ Firecrawl now has `audio` format (extracts MP3 audio from YouTube etc.). **PM relevance: NONE** — not an IDE use case. No spec text needed.
- ⚠️ Firecrawl's `summary` format uses LLM internally. Ledger line 1567 correctly notes this is "provider-dependent; Firecrawl native, others pm-composed." Accurate.

### 2. Crawl (multi-page async jobs) — ✅ Fully Covered
**Firecrawl reality:** `POST /v2/crawl` → async job ID → poll/WebSocket/webhook. Params: `limit`, `maxDiscoveryDepth`, `includePaths`, `excludePaths`, `allowSubdomains`, `allowExternalLinks`, `sitemap` modes, `delay`, `maxConcurrency`, `scrapeOptions`. Webhook events: started/page/completed/failed. HMAC signature verification. Crawl errors endpoint.

**Ledger coverage:** Part R (line 1469-1484) maps all key parameters. Part S (line 1738-1782) defines enhanced webcrawl contract with change_tracking, dedup, include/exclude_paths, respect_robots, formats. Part X routing algorithm covers async patterns.

**Minor omissions:**
- ⚠️ Firecrawl's `crawlEntireDomain` (follow sibling/parent URLs, not just child paths) is not mapped. The ledger's `same_origin_only` inverts `allowExternalLinks` + `allowSubdomains` but doesn't cover `crawlEntireDomain` semantics. **PM relevance: LOW** — PM's default depth-limited crawl covers most use cases; `crawlEntireDomain` is for full-site ingestion. Could add a note to Part R parameter mapping.
- ⚠️ Firecrawl's `regexOnFullURL` (match include/exclude against full URL including query params) is unmapped. Ledger uses glob-style on path component only (line 1769). **PM relevance: LOW** — path-only filtering is the common case.
- ⚠️ WebSocket delivery for real-time crawl results is mentioned as unconfirmed at line 1428. Firecrawl docs DO confirm WebSocket support ("The watcher method provides real-time updates as pages are crawled"). However PM likely doesn't need real-time streaming of individual crawl pages, so noting it as confirmed but not PM-relevant is sufficient.

### 3. Map (site structure discovery) — ✅ Fully Covered
**Firecrawl reality:** `POST /v2/map` returns `links: [{ url, title, description }]`. Supports `search` param for filtering. Uses sitemap + SERP + cached crawl data. Location/language support.

**Ledger coverage:** Part R (line 1479-1484) maps parameters fully. Part S (line 1783-1813) defines enhanced webmap contract with search filter, use_sitemap modes, include/exclude_paths. Output shape matches.

**No gaps.**

### 4. Extract (structured data extraction with schema) — ✅ Fully Covered
**Firecrawl reality:** `POST /v2/extract` accepts `urls[]` (with wildcards), `prompt`, `schema`, `enableWebSearch`. Async job model. FIRE-1 agent model for complex extraction. Credit-based billing (15 tokens per credit).

**Ledger coverage:** Part R (line 1455-1460) maps parameters. Part S (line 1625-1677) defines enhanced webextract with schema, schema_mode, prompt, actions. Notes Firecrawl's multi-URL + wildcard capability as "PM-composed only" (PM is one-URL per invocation).

**Minor omissions:**
- ⚠️ FIRE-1 agent model for complex extraction is mentioned in Part A (line 50) but NOT in the parameter mapping (Part R). The mapping doesn't show how PM would request FIRE-1 specifically. **PM relevance: MEDIUM** — FIRE-1 could be useful for hard-to-extract sites. However, since PM routes through its own adapter layer, this is an implementation detail of the Firecrawl adapter, not a PM-exposed parameter.

### 5. Search (web search + optional scraping) — ⚠️ Partially Covered
**Firecrawl reality:** `POST /v2/search` with `query`, `limit`, `sources` (web/news/images), `categories` (github/research/pdf), `scrapeOptions`, `tbs` (time-based filtering), `timeout`, `location`. Returns `{ web: [...], images: [...], news: [...] }` structured by source type. HD image search with size filtering. Zero Data Retention modes (zdr, anon). Cost: 2 credits per 10 results.

**Ledger coverage:** Part A (lines 39-43) documents search correctly. Part R (lines 1436-1444) maps parameters including sources, categories, tbs. Part S (lines 1512-1543) defines enhanced websearch with sources and categories.

**Gaps:**
- ⚠️ **Firecrawl search returns structured multi-source response** (`{ web: [...], images: [...], news: [...] }`) — the ledger's websearch output (line 1539) defines `results: Array<{ title, url, snippet?, score?, source_type? }>` which flattens all sources into one array with `source_type` tags. This is a design choice (not necessarily a gap), but the mapping in Part R doesn't note the structural transformation from Firecrawl's separated-by-type response to PM's flat array.

**Spec text to add to Part R, after line 1444:**
```
- **Response transformation**: Firecrawl search returns results separated by source type 
  (`{ web: [...], images: [...], news: [...] }`). PM adapter MUST flatten these into the 
  unified `results` array, tagging each with `source_type`. Ordering: web results first, 
  then news, then images (preserving per-source position ordering).
```

### 6. Interact (browser automation — formerly "Actions") — ⚠️ Partially Covered
**Firecrawl reality:** This is NOW a **major standalone capability** called `/interact` (not just `actions` on scrape). The flow:
1. Scrape URL → get `scrapeId`
2. `POST /v2/scrape/{scrapeId}/interact` with `prompt` (natural language) OR `code` (Playwright Node/Python/Bash)
3. Session persists across multiple interact calls (stateful)
4. `DELETE /v2/scrape/{scrapeId}/interact` to stop
5. Returns `liveViewUrl` and `interactiveLiveViewUrl` (embeddable browser stream)
6. Supports persistent profiles (cookies/localStorage across sessions)
7. Pricing: 2 credits/min (code), 7 credits/min (AI prompt)

**Ledger coverage:** Part A (lines 58-62) describes interact/actions. Part R (line 1423) maps 6 actions. Part T (lines 1815-1909) defines research_session with 15 actions in 3 tiers.

**Gaps:**
- ❌ **Interact as a PERSISTENT SESSION model is not reflected.** The ledger treats actions as a one-shot parameter on webfetch (`actions?: Array<WebAction>`, max 10 actions, max 30s). Firecrawl's `/interact` is a multi-turn stateful session: scrape → interact → interact → interact → stop. PM's research_session (Part T) is closer to this model (it has session lifecycle) but it's framed as a PM-internal construct, not as something delegated to Firecrawl.
- ❌ **Prompt-based interaction** is noted at line 3048 ("Firecrawl `/interact` has prompt-based mode — more agent-friendly") but this is a Do-Not-Forget note, NOT reflected in the parameter mapping. Part R doesn't map PM actions to Firecrawl's prompt-based interact mode.
- ❌ **Code execution mode** (Playwright Node/Python/Bash) is not mentioned. PM probably won't use this directly but should note it exists as a provider capability.
- ❌ **Live View URLs** (embeddable browser stream) are not mentioned. This could be relevant for PM's browser surface.
- ⚠️ **Persistent profiles** (cookie/session reuse across scrapes) not mentioned. Could enable authenticated scraping workflows.

**Spec text to add to Part R, new subsection after line 1484:**
```
#### Firecrawl Interact Session Model (Provider Capability Note)

Firecrawl's `/interact` endpoint provides a STATEFUL multi-turn browser session:
1. Initial scrape returns `scrapeId` (via `data.metadata.scrapeId`)
2. `POST /v2/scrape/{scrapeId}/interact` resumes the browser session
3. Supports `prompt` (natural language — AI navigates/clicks/extracts) or `code` 
   (Playwright Node.js/Python/Bash for full control)
4. Multiple interact calls reuse the same session (state carries over)
5. `DELETE /v2/scrape/{scrapeId}/interact` terminates the session
6. Returns `liveViewUrl` (view-only) and `interactiveLiveViewUrl` (interactive)
7. Session TTL: 10 min default, 5 min inactivity timeout
8. Persistent profiles: `profile: { name, saveChanges }` preserves cookies/
   localStorage across sessions (enables authenticated workflows)
9. Pricing: 2 credits/min (code-only), 7 credits/min (with AI prompts)

**PM Integration Notes:**
- PM's research_session (Part T) is the PM-native equivalent but is one-shot 
  (ephemeral, teardown after tool completes)
- When Firecrawl is the active provider for webfetch with `actions`, the adapter 
  SHOULD use the `/interact` session model (scrape → interact → capture) rather 
  than the deprecated `actions` parameter on `/scrape`
- Firecrawl's prompt-based interact mode can be used as an ALTERNATIVE to PM's 
  action-by-action approach — Firecrawl handles the navigation autonomously
- Live View URLs are NOT surfaced in PM v1 (PM has its own browser surface)
- Persistent profiles: NOT MVP. Future consideration for authenticated research 
  workflows where site login must persist across tool invocations.
```

### 7. Change Detection / Monitoring — ✅ Fully Covered
**Firecrawl reality:** `changeTracking` format in scrape/crawl/batch. Modes: `git-diff` (line-level), `json` (field-level with schema). Persistent snapshots (never expire). Scoped to team + optional tag. Works with webhooks for scheduled monitoring. Statuses: new/same/changed/removed + visibility (visible/hidden).

**Ledger coverage:** Part A (lines 64-67) documents change tracking. Part S webfetch (lines 1592-1598) specifies change_tracking with hash-based comparison, diff_summary, change_status. Part S webcrawl (lines 1754-1759) specifies per-page change detection. Part W (lines 2095-2102) specifies cache interaction with change detection.

**Minor omissions:**
- ⚠️ Firecrawl's `git-diff` vs `json` diff MODES are not reflected. The ledger specifies `change_status` and `diff_summary` (concise description) but doesn't distinguish between line-level git-diff and field-level JSON comparison modes. PM's implementation is simpler (hash-based comparison, not full diff), which is a valid design choice.
- ⚠️ Firecrawl's `visibility` field (visible vs hidden — whether URL is still discoverable via links/sitemap) is not reflected. **PM relevance: LOW** for IDE use.
- ⚠️ Firecrawl's `tag` parameter for separate tracking histories is not reflected. **PM relevance: LOW** in v1.

### 8. Batch Operations — ✅ Fully Covered
**Firecrawl reality:** `POST /v2/batch/scrape` with URL list, async job model (sync/async modes), webhook support (started/page/completed/failed events), `maxConcurrency`, `ignoreInvalidURLs`, 24-hour result retention, supports all scrapeOptions including structured extraction.

**Ledger coverage:** Part R (line 1424) maps batch_scrape. Part V (lines 1949-2036) fully specifies batch webfetch (max 50 URLs) and batch webextract (max 10 URLs) with concurrency control, continue_on_error semantics, partial failure handling, and audit model. XV-ADD note at line 1954 captures Firecrawl-native batch details.

**No significant gaps.**

### 9. Async Job Model (job_id → poll) — ⚠️ Partially Covered
**Firecrawl reality:** Crawl, batch/scrape, extract, and agent all use async job model: submit → get job_id → poll status (processing/completed/failed/cancelled) or use webhooks/WebSocket. Result expiration: 24 hours.

**Ledger coverage:** Line 1428 notes "Only extract, batch/scrape, and agent clearly support async." The routing algorithm (Part X) implicitly handles this but doesn't spell out the adapter-level async pattern.

**Gap:**
- ⚠️ **Crawl is async too** — line 1428 says "Only extract, batch/scrape, and agent" but Firecrawl docs explicitly show crawl as async (returns job ID, poll for status). The ledger's own Part R line 1421 says "Async job" for crawl, contradicting line 1428.
- ⚠️ **No explicit adapter-level async pattern** — the ledger doesn't define how the Firecrawl adapter handles the poll-for-completion pattern internally. Should it block the tool invocation while polling? Use PM-internal progress reporting?

**Spec text to add to Part R, after line 1428:**
```
[XV3-FIX] **Async operation support** (corrected): Crawl, batch/scrape, extract, and 
agent ALL use Firecrawl's async job model (submit → job_id → poll/webhook). Scrape, 
map, and search are synchronous.

**Firecrawl Adapter Async Pattern:**
- For async Firecrawl operations (crawl, batch, extract, agent):
  1. Submit job → receive `job_id`
  2. Poll `GET /v2/{endpoint}/{job_id}` at 2s intervals (with exponential backoff 
     to max 10s)
  3. Surface progress in PM activity label: `Crawling Site: <url> (12/50 pages)`
  4. On completion: return results to tool caller
  5. On timeout (per Part R timeout_ms): cancel job if possible, return partial 
     results with `timeout` error
  6. Result expiration: Firecrawl retains results for 24 hours — PM should NOT 
     depend on this; cache results locally on completion
```

### 10. Anti-bot / Stealth — ✅ Fully Covered
**Firecrawl reality:** Three proxy types: basic (1 credit), enhanced (5 credits), auto (try basic then enhanced). Location-based proxy selection (28+ countries). Fire Engine proprietary for cloud. Default: all requests go through proxies.

**Ledger coverage:** Part A (lines 72-76) documents proxy modes and Fire Engine limitation. Part R (line 1411) maps `proxy_mode` config with correct options. Line 1491 notes self-hosted limitation. Line 1494-1500 maps error codes.

**Minor correction needed:**
- ⚠️ Line 1411 lists `"stealth"` as a proxy_mode option. Firecrawl docs show only `basic`, `enhanced`, `auto` — there is no `stealth` mode. The term "stealth" appears in the ledger as a synonym but is NOT a valid Firecrawl API value.

**Spec text fix at line 1411:**
```
- `proxy_mode?: "basic" | "enhanced" | "auto"` (default `"auto"`; cloud only)
  [XV3-FIX: removed "stealth" — not a valid Firecrawl proxy mode. Firecrawl 
  supports only basic/enhanced/auto.]
```

### 11. Credit/Pricing Model — ⚠️ Partially Covered
**Firecrawl reality (current pricing):**
| Operation | Cost |
|---|---|
| Scrape (basic) | 1 credit |
| Scrape (enhanced proxy) | 5 credits |
| Scrape (JSON/structured) | +4 credits |
| PDF parsing | 1 credit/page |
| Search | 2 credits per 10 results |
| Search + scrape | 2 credits + 1/page scraped |
| Crawl | 1 credit/page |
| Map | (not explicitly stated, likely 1 credit) |
| Extract | 15 tokens = 1 credit (variable) |
| Extract (JSON mode) | +5 credits/page |
| Agent (spark-1-mini) | dynamic, 60% cheaper than pro |
| Agent (spark-1-pro) | 20-2500 credits per call |
| Interact (code) | 2 credits/min |
| Interact (AI prompt) | 7 credits/min |
| Change tracking (basic) | free (standard scrape credits) |
| Change tracking (json mode) | +5 credits/page |
| Zero Data Retention | +1 credit/page |

**Ledger coverage:** Line 77-78 notes credit-based pricing. Part R line 1430 warns about cost spikes. Line 1467 warns agent is 20-2500 credits. Line 1492 tracks `creditsUsed`. Line 1732 defines credit warning UX (>100 credits confirmation, 500 hard cap).

**Gap:**
- ⚠️ **No per-operation credit cost table.** The ledger has scattered mentions but no consolidated reference for PM's cost-awareness routing. An adapter that routes to Firecrawl should know that `/search` is 2 credits/10 results vs `/agent` could be 2500.

**Spec text to add to Part R, new subsection after line 1430:**
```
#### Firecrawl Credit Cost Reference (for adapter routing awareness)

| PM Operation | Firecrawl Endpoint | Base Credit Cost | Modifiers |
|---|---|---|---|
| `search` | /v2/search | 2 per 10 results | +scrape costs if scrapeOptions used |
| `fetch` | /v2/scrape | 1 per page | +4 enhanced proxy; +4 JSON mode; +1 ZDR |
| `fetch` (interact) | /v2/scrape/{id}/interact | 2/min (code) or 7/min (AI) | session-time based |
| `extract` | /v2/extract | ~15 tokens/credit (variable) | +5/page for JSON mode |
| `research` | /v2/agent | 20–2500 (dynamic) | spark-1-mini ~60% cheaper |
| `crawl` | /v2/crawl | 1 per page | +4 enhanced proxy; +4 JSON mode per page |
| `map` | /v2/map | ~1 (not documented) | — |
| `batch_scrape` | /v2/batch/scrape | 1 per URL | same modifiers as fetch |

**Routing implications:**
- Cost-aware routing SHOULD prefer cheaper operations when multiple could satisfy 
  the request (e.g., search+scrape vs agent for simple lookups)
- PM's credit warning (Part S line 1732) triggers at estimated >100 credits
- PM's hard cap (default 500 credits) prevents runaway agent costs
- Self-hosted Firecrawl: credits don't apply (no billing); cost awareness N/A
```

---

## NEW Firecrawl Capabilities NOT in Ledger At All

### 12. Agent endpoint (`/v2/agent`) — ✅ Covered
Fully covered in Part A (lines 52-56), Part R (lines 1462-1467), Part S webresearch autonomous mode (lines 1697-1699). The mapping of `task` → `prompt`, `depth_hint` → model selection, and credit warnings are all specified.

### 13. Interact endpoint (`/v2/scrape/{id}/interact`) — ❌ Insufficiently Covered
See item 6 above. The ledger treats this as the old `actions` parameter model, but Firecrawl has evolved this into a full stateful session API. Spec text provided above.

### 14. Zero Data Retention (ZDR) — ❌ Not Reflected
**Firecrawl reality:** `zeroDataRetention: true` parameter on scrape; `enterprise: ["zdr"]` or `enterprise: ["anon"]` on search. Enterprise-only feature. +1 credit/page for scrape ZDR; 10 credits/10 results for search ZDR; 2 credits/10 results for anonymized ZDR.

**PM relevance: MEDIUM** — for enterprise PM deployments handling sensitive data, ZDR ensures Firecrawl doesn't persist scraped content. This is a compliance feature.

**Spec text to add to Part R, new subsection after Firecrawl Error Handling (line 1500):**
```
#### Firecrawl Zero Data Retention (ZDR)

Firecrawl supports Zero Data Retention for enterprise compliance:
- Scrape: `zeroDataRetention: true` — Firecrawl does not persist page content 
  beyond the request lifetime. +1 credit/page. Enterprise plans only.
- Search: `enterprise: ["zdr"]` (end-to-end, 10 credits/10 results) or 
  `enterprise: ["anon"]` (Firecrawl-side only, 2 credits/10 results)
- PM adapter SHOULD expose a `firecrawl_zdr?: boolean` config option (global 
  setting, not per-request) for enterprise deployments
- When ZDR is enabled, PM cache layer becomes the ONLY persistence layer 
  (Firecrawl retains nothing)
- NOT MVP — enterprise feature for future consideration
```

### 15. Firecrawl Caching (`maxAge`, `storeInCache`, `minAge`) — ⚠️ Partially Covered
**Firecrawl reality:** Default `maxAge` = 172800000ms (2 days). `storeInCache: false` to skip storage. `minAge` for cache-only lookups (no fresh scrape). Can speed up scrapes by 5x.

**Ledger coverage:** Part R (line 1450) maps `cache_ttl → maxAge`. Part W (lines 2052-2054) notes dual-layer caching. But `storeInCache` and `minAge` parameters are not mapped.

**PM relevance: LOW** — PM has its own cache layer (Part W) that sits above Firecrawl's. The Firecrawl adapter should pass through PM's cache policy to Firecrawl's parameters, which the mapping partially covers. `minAge` (cache-only lookup) could be useful for checking if Firecrawl has a cached version before triggering a fresh scrape, but this is an optimization, not a gap.

### 16. Webhook Signature Verification — ❌ Not Reflected
**Firecrawl reality:** All webhooks include `X-Firecrawl-Signature` header (HMAC-SHA256). Verification required for security.

**PM relevance: LOW for v1** — PM is unlikely to use Firecrawl webhooks directly in v1 (the adapter polls for results). If webhooks are added later, signature verification is mandatory.

---

## Consolidated Findings

| # | Capability | Status | Severity | Action Needed |
|---|---|---|---|---|
| 1 | Scrape | ✅ | — | None (branding/audio formats irrelevant) |
| 2 | Crawl | ✅ | — | Minor: note WebSocket confirmed |
| 3 | Map | ✅ | — | None |
| 4 | Extract | ✅ | — | None (FIRE-1 is adapter-internal) |
| 5 | Search response transform | ⚠️ | LOW | Add response transformation note |
| 6 | Interact session model | ❌ | **HIGH** | Add Interact session subsection to Part R |
| 7 | Change detection | ✅ | — | None (PM's simpler model is valid) |
| 8 | Batch operations | ✅ | — | None |
| 9 | Async job model | ⚠️ | MEDIUM | Fix crawl omission; add adapter async pattern |
| 10 | Anti-bot/stealth | ✅ | — | Fix: remove invalid "stealth" proxy mode |
| 11 | Credit/pricing table | ⚠️ | MEDIUM | Add consolidated credit cost table |
| 12 | Agent | ✅ | — | None |
| 13 | Interact (full) | ❌ | **HIGH** | Same as #6 |
| 14 | Zero Data Retention | ❌ | LOW | Add ZDR subsection (enterprise, not MVP) |
| 15 | Firecrawl caching params | ⚠️ | LOW | Minor: note storeInCache/minAge exist |
| 16 | Webhook signatures | ❌ | LOW | Note for future webhook integration |

### Priority Actions (if ledger is being updated):
1. **HIGH**: Add Interact session model subsection (item 6/13) — this is the biggest real gap
2. **MEDIUM**: Fix async job model to include crawl; add adapter polling pattern (item 9)
3. **MEDIUM**: Add credit cost reference table (item 11)
4. **LOW**: Fix "stealth" proxy mode to valid values (item 10)
5. **LOW**: Add search response transformation note (item 5)
6. **LOW**: Add ZDR note for enterprise awareness (item 14)

---

## Overall Assessment

The ledger is **95%+ accurate** against Firecrawl's current documentation. The most significant gap is the evolution of Firecrawl's `actions` feature into a full `/interact` session API with prompt-based control, persistent profiles, and live view streaming. The ledger's research_session concept (Part T) actually approximates this model architecturally, but the Firecrawl adapter mapping in Part R doesn't reflect the provider's new session-based approach. All other capabilities are covered at implementation-ready fidelity.
