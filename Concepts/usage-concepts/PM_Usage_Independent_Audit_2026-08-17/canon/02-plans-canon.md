# Plans Canon Extract — Usage (authoritative scoring baseline)

Read-only extract. Every quoted block is verbatim from the cited Plans file. No Plans file was
modified. Citations are `path:line`.

Sources read in full for this extract:
- `/mnt/Cursor/PuppetMaster/Plans/usage-feature.md` (owner-section :4-95, :515-548, :592-610, :763-869, :5417-5605, :5607-5804, :5814-5843, :6173-6318)
- `/mnt/Cursor/PuppetMaster/Plans/Contracts_V0.md` (CV-196 :12800, CV-200 :13005, CV-201 :13061, CV-316 :20403)
- `/mnt/Cursor/PuppetMaster/Plans/FinalGUISpec.md` (F3-418 :28987)
- `/mnt/Cursor/PuppetMaster/Plans/Widget_System.md` (§2 :30, §3 :74, WS-002 :134, WS-003 :192, WS-004 :252, WS-006 :367, WS-009 :553, WS-013 :830, WS-015 :1021)
- `/mnt/Cursor/PuppetMaster/Plans/CLI_Bridged_Providers.md` (CBP-022 :1335, CBP-027 :1582)
- `/mnt/Cursor/PuppetMaster/Plans/Runtime_Artifacts_Panel.md` (RAP-043 :1838, RAP-044 :1952)
- `/mnt/Cursor/PuppetMaster/Plans/DRY_Rules.md` (:2050-2160)
- `/mnt/Cursor/PuppetMaster/Plans/Glossary.md` (usage terms)
- `/mnt/Cursor/PuppetMaster/Plans/runtime_artifact_cost_usage.schema.json`, `runtime_artifact_tool_llm_trace.schema.json`, `runtime_artifact_envelope.schema.json` — **the only closed-enum authority for most Usage state fields**
- `/mnt/Cursor/PuppetMaster/tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json` (13 fixtures)

---

## A. Canonical UsageRecord field / bucket names and counting semantics

### A.1 CV-196 — Canonical Token Bucket Fields (verbatim `canonical_text`, Contracts_V0.md:12807)

> The canonical UsageRecord token buckets are input_total, input_non_cached,
> cache_read, cache_write, cache_write_1h or provider TTL-specific
> cache_write_ttl where exposed, output_total, output_visible,
> reasoning/thoughts, provider_total, and context_estimate; legacy
> input_tokens, output_tokens, cache_read_input_tokens,
> cache_creation_input_tokens, cache_read_tokens, and reasoning_tokens are
> compatibility import/export aliases only.

CV-196 `acceptance_criteria` (verbatim, Contracts_V0.md:12820-12823):
- "All UF-085 token buckets are preserved individually or represented as unknown/not_exposed when a provider does not expose them."
- "Legacy token names normalize into UF-085 fields before persistence, aggregation, spending-limit checks, GUI projection, or route/open drill-through."
- "Consumers do not collapse the token buckets into a smaller canonical set or double-count provider-inclusive cache/reasoning buckets."

CV-196 `negative_constraints` (verbatim, :12846-12848):
- "Canonical token buckets must not be collapsed into a smaller field set."
- "Legacy token names must not be presented as the canonical UsageRecord schema."

CV-196 `preserved_exact_tokens` (legacy aliases, :12839-12844): `` `input_tokens` ``, `` `output_tokens` ``,
`` `cache_read_input_tokens` ``, `` `cache_creation_input_tokens` ``, `` `reasoning_tokens` ``.
CV-196 `unblocks: [CV-197, CV-198, CV-204, CV-211]`, `depends_on: []`.

### A.2 UF-085 — Implementation Ready Usage Accounting Contract (verbatim `canonical_text`, usage-feature.md:5619)

> UsageRecord is the single normalized accounting record for provider, CLI, local, estimated, and unknown usage signals. Every record carries idempotent correlation through usage_record_id, usage_event_ref, provider_attempt_ref, attempt_id, run_id, thread_id?, node_id?, tool_call_id?, parent_usage_record_id?, and dedupe_key so retries, escalations, resumed streams, and receipt/artifact drill-through cannot double-count or fork attribution. Provider identity is normalized through provider_id, provider_route_kind, provider_account_ref?, model_id, model_variant?, reasoning_tier?, and context_window_tokens?. Authority is explicit through source_class = provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown, source_confidence, source_authority, raw_payload_ref, redaction_status, and provider_payload_hash. Settlement is explicit through settlement_status = observed | streaming_partial | settled | adjusted | failed | unknown plus observed_at_utc, settled_at_utc?, adjusted_at_utc?, failure_class?, and partial_reason?. Token buckets are first-class and present even when unknown: input_total, input_non_cached, cache_read, cache_write, cache_write_1h, cache_write_ttl?, output_total, output_visible, reasoning/thoughts, provider_total, and context_estimate. Provider mappers state counting_semantics for whether cache is a subset of input and whether reasoning/thoughts are a subset of output; PM never adds subset fields back onto inclusive provider totals. Costs use cost_microdollars and/or provider minor units, currency, cost_status, pricing_snapshot_id, pricing_source, pricing_effective_at, pricing_version, per-bucket costs, and unknown-cost fail-closed behavior. BYOK and subscription/provider-plan routes preserve accounting refs while suppressing misleading per-token cost display when provider policy requires it. Usage windows and quotas are normalized as rolling, fixed, billing, session, or unknown with reset/cooldown evidence; missing reset signals, disabled buckets, missing cost, and missing quota render unknown/not exposed/disabled rather than guessed countdowns or zeroes. Raw provider payloads are retained by reference with redaction before persistence, while normalized fields remain queryable.

UF-085 `negative_constraints` (verbatim, :5705-5712) — the no-double-count and no-false-zero rules:
- "Do not let Ledger, rollups, Runtime Artifacts, or UI projections parse ad hoc JSON instead of the canonical UsageRecord contract."
- "Do not add cache_read/cache_write/cache_write_1h to input_total when the provider says input_total is already inclusive."
- "Do not add reasoning/thoughts to output_total when the provider says output_total is already inclusive."
- "Do not turn context_estimate into billing, cost, quota, or provider authority."
- "Do not display missing, disabled, unsupported, blocked, stale, or unknown cost/quota as zero."
- "Do not fabricate reset countdowns, remaining quota, or cost from status/login probes."
- "Do not expose raw provider payloads, credentials, account identifiers, or local machine paths in persisted UsageRecord fields."

### A.3 Counting semantics — the closed triple (`runtime_artifact_cost_usage.schema.json` `$defs/tokenBuckets/counting_semantics`)

| field | closed values |
|---|---|
| `input_total_includes_cache` | `yes` \| `no` \| `unknown` |
| `output_total_includes_reasoning` | `yes` \| `no` \| `unknown` |
| `provider_total_semantics` | `provider_reported` \| `derived_input_plus_output` \| `not_exposed` \| `unknown` |

Rule (UF-085): "Provider mappers state counting_semantics for whether cache is a subset of input and
whether reasoning/thoughts are a subset of output; PM never adds subset fields back onto inclusive
provider totals." UF-086 adds: "Each parser fixture states whether cache is a subset of input,
reasoning/thoughts are a subset of output, provider_total is authoritative or derived, and
context_estimate is local-only." (usage-feature.md:5729)

### A.4 Persisted wire shape — `$defs` of `Plans/runtime_artifact_cost_usage.schema.json` (all listed fields REQUIRED unless noted)

- `tokenBuckets` **required**: `input_total`, `input_non_cached`, `cache_read`, `cache_write`, `cache_write_1h`, `output_total`, `output_visible`, `reasoning_tokens`, `provider_total`, `context_estimate`, `counting_semantics`, `usage_reporting_state`; optional `cache_write_ttl`, `cache_write_breakdown_state`, `thoughts_tokens`, `delta`, `cumulative`.
- `providerIdentity` **required**: `provider_id`, `provider_route_kind`, `model_id`; optional `provider_account_ref`, `model_variant`, `reasoning_tier`, `context_window_tokens`.
- `costFields` **required**: `cost_status`, `cost_microdollars`, `cost_minor_units`, `currency`, `pricing_snapshot_id`, `pricing_source`, `pricing_effective_at`, `pricing_version`; optional `bucket_costs_microdollars`, `custom_provider_price_row_ref`.
- `quotaFields` **required**: `window_kind`, `window_scope`, `quota_status`, `evidence_source`, `reset_at`, `cooldown_until`, `quota_remaining`, `quota_used`, `quota_limit`; optional `credits_remaining`, `credits_status`.
- `authorityFields` **required**: `source_class`, `source_confidence`, `source_authority`, `settlement_status`, `raw_payload_ref`, `redaction_status`, `provider_payload_hash`; optional `observed_at_utc`, `settled_at_utc`, `adjusted_at_utc`, `failure_class`, `partial_reason`.
- `type_payload` **required**: `usage_event_ref`, `usage_record_id`, `reasoning_tokens`, `provider`, `usage`, `cost`, `quota`, `authority`, `refs`, `flags`; optional `total_tokens`, `stream`, `overflow_evidence`, `provider_compat`.
- `type_payload.refs` **required**: `usage_event_ref`, `usage_record_id`, `provider_attempt_ref`, `raw_payload_ref`; optional `attempt_id`, `run_id`, `thread_id`, `node_id`, `tool_call_id`, `parent_usage_record_id`, `dedupe_key`, `receipt_refs`, `child_usage_event_refs`.
- `type_payload.flags` **required**: `is_estimated`, `is_provider_reported`, `is_cli_reported`, `is_local_context_estimate`, `is_subscription_hidden`, `is_byok`, `unknown_reason`; optional `display_cost_policy`.
- `type_payload.stream` optional: `stop_reason`, `abort_requested`, `usage_observed_before_abort`, `stream_end_source`.

### A.5 Alias-normalization rules (usage-feature.md:515-525, "Canonical UsageRecord fields")

- ":517 UF-085 is the implementation-ready UsageRecord contract. Older field names in this section are compatibility, import, export, or display aliases unless they are repeated by UF-085."
- ":518 `usage_id` resolves to `usage_record_id` or `usage_event_ref` according to the importing source; UI routes prefer `usage_event_ref` normalized through `object_kind = usage_event` and `object_id`."
- ":519 `input_tokens` resolves to `input_total`; `output_tokens` resolves to `output_total`; older `cache_read_tokens`, `cached_input_tokens`, and `cache_creation_input_tokens` aliases resolve to `cache_read`, `cache_write`, `cache_write_1h`, or `cache_write_ttl` only when the provider mapper states the TTL and inclusive/exclusive semantics."
- ":520 `cost_usd` is display or migration material only. Canonical cost authority uses `cost_microdollars`, provider minor units, currency, cost_status, pricing_snapshot_id/version/date/source, and custom-provider price row refs where applicable."
- ":521 `usage_source_kind` remains source-lineage vocabulary and maps to UF-085 `source_class`, `source_confidence`, and `source_authority`; it does not replace the closed source classes `provider_reported`, `provider_header`, `cli_reported`, `local_estimated`, `pricing_estimated`, and `unknown`."
- ":523 Cost-integrity display rules … the canonical display tiers are `<$0.01 = 6dp`, `<$1 = 4dp`, and otherwise 2dp, while `cost_usd` remains display/migration material and must not be the only canonical precision source."
- ":524 `cost_usd = cost_microdollars / 1_000_000` is derived only at display/export boundaries or compatibility import/migration edges; it is not a persisted UsageRecord authority field."
- ":525 Raw-cost provider values are retained as provenance or debug evidence only after normalization to canonical token buckets and `cost_microdollars`; raw-cost fields must not become independent billing authority."
- ":529 All usage events are coerced into UsageRecord format before aggregation."

### A.6 CV-200 — Usage Source Window And Cache Metadata (verbatim `canonical_text`, Contracts_V0.md:13013)

> Usage attribution preserves source_class, source_confidence, source_authority,
> window_label, closed window_scope values, cache_hit, cache_strategy, and maps
> the display phrase usage-record to the canonical usage_record object; legacy
> usage_source_kind and provider_usage_source_kind normalize into the source
> fields before storage or display.

CV-200 `acceptance_criteria` (verbatim, :13024-13027):
- "window_scope is closed to provider, account, account+model, org, and server_profile."
- "source_class/source_confidence/source_authority distinguish local_estimated, API-key-derived, OAuth-quota-derived, combined API/OAuth attribution, provider_reported, provider_header, cli_reported, pricing_estimated, and unknown states."
- "usage_source_kind, provider_usage_source_kind, and provider_signal_confidence remain compatibility/migration aliases only."
- "cache_hit and cache_strategy remain available where they affect attribution."

CV-200 `negative_constraints` (:13053-13055):
- "Usage source and window metadata must not collapse all usage into one projection."
- "Compatibility source aliases must not replace source_class, source_confidence, or source_authority."

### A.7 CV units bearing on settlement_status / source_class / cost_status

- **CV-196** (:12800) — token buckets; no settlement/source/cost enums.
- **CV-200** (:13005) — the only CV that *defines* source_class/source_confidence/source_authority preservation and closes `window_scope`. It does **not** enumerate source_class; the closed set lives in UF-085 and the cost_usage schema.
- **CV-201** (:13061) — "Usage attribution is keyed by the tuple provider_id, model_id, account_id, billing_entity_id, and entitlement_class when those dimensions are known…".
- **CV-316 — GUI Usage Route Subject Payload Contract** (:20403, canonical_text :20411, verbatim):
  > GUI Usage route/open payloads normalize every usage drill-through target into route_target.object_kind = usage_event and route_target.object_id = the canonical usage event id when usage_event_ref exists. OpenSubject carries the display subject, while usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health remain correlation and projection fields. Thread_id, tier_id, timestamp, and run_id can filter or scope a view but cannot replace UsageRecord identity. Raw/Curated consumers share the same redaction contract: Curated receives normalized fields and Raw receives redacted refs/hashes/omitted counts/permission state, not unredacted provider payloads.
- **No CV unit defines `cost_status` at all.** `cost_status` is defined by UF-085 prose (as a field) and enumerated only in `Plans/runtime_artifact_cost_usage.schema.json` (`$defs/costFields/cost_status`). Consumers naming it: `Plans/usage-feature.md:520, :5041, :5439, :5529`; `Plans/Orchestrator_Page.md:2355`; `Plans/Multi-Account.md:5102, :5108`; `Plans/Models_System.md:9460, :9467`; `Plans/Run_Graph_View.md:1102`; `Plans/assistant-chat-design.md:23854`; `Plans/Media_Generation_and_Capabilities.md:575, :2555`; `Plans/Section15_MVP_Promoted_Features_Spec.md:8955`.

---

## B. Canonical enum value sets (verbatim)

`ENUM AUTHORITY` column: `UF-085` = prose-closed in the PlanUnit; `SCHEMA` = JSON Schema `enum`;
`NONE` = named as a required field by canon but **never enumerated anywhere in Plans/** — audit must
treat any concept-invented value set for these as unverifiable, not as a match.

### B.1 `source_class` — CLOSED (UF-085 + SCHEMA, identical)
```
provider_reported
provider_header
cli_reported
local_estimated
pricing_estimated
unknown
```
Authority: `usage-feature.md:5619` ("source_class = provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown"); `runtime_artifact_cost_usage.schema.json` `$defs/authorityFields/source_class`; re-stated as closed at `usage-feature.md:521`.

### B.2 `source_confidence` — CLOSED (SCHEMA; restated in prose)
```
high
medium
low
unknown
```
Authority: `runtime_artifact_cost_usage.schema.json` `$defs/authorityFields/source_confidence`; prose restatement `usage-feature.md:5041` ("source_confidence as high, medium, low, or unknown"), `assistant-chat-design.md:23854`.

### B.3 `source_authority` — **NOT CLOSED**
Schema type is `stringOrNull` (`$defs/authorityFields/source_authority`), REQUIRED but free-form.
Fixtures assert only presence/`unknown` (`source_authority:unknown` in GUI-USG-001). No enumerated set
exists in Plans. Audit: presence-and-non-zero is checkable; a specific value list is not canon.

### B.4 `settlement_status` — CLOSED (UF-085 + SCHEMA, identical)
```
observed
streaming_partial
settled
adjusted
failed
unknown
```
Authority: `usage-feature.md:5619` ("settlement_status = observed | streaming_partial | settled | adjusted | failed | unknown"); `runtime_artifact_cost_usage.schema.json` `$defs/authorityFields/settlement_status`.

### B.5 `cost_status` — CLOSED (SCHEMA only; no CV/UF prose enumeration)
```
provider_reported
priced
estimated
hidden_subscription
hidden_byok
unknown
```
Authority: `runtime_artifact_cost_usage.schema.json` `$defs/costFields/cost_status`.
Related required cost flags (booleans, not enums): `is_estimated`, `is_provider_reported`,
`is_cli_reported`, `is_local_context_estimate`, `is_subscription_hidden`, `is_byok`, `unknown_reason`.
Related optional enum `display_cost_policy` = `show | hide | subscription_covered | unknown`.

### B.6 `value_state` — **NOT CLOSED ANYWHERE IN PLANS**
Named as a REQUIRED per-cell field by F3-418 (`FinalGUISpec.md:28995`), UF-087
(`usage-feature.md:5429`), and WS-015 (`Widget_System.md:1029`), and listed in all three
`preserved_exact_tokens`. **No Plans file enumerates its values.** The state vocabulary that canon
requires to be *distinguishable* (from F3-418 acceptance :29002 and UF-087 :5435, verbatim tokens) is:
```
disabled
not_exposed
unknown
stale
estimated
hidden_byok
hidden_subscription
streaming_partial
failed
adjusted
provider-reported zero
```
(F3-418:29002: "render disabled, not_exposed, unknown, stale, estimated, hidden_byok,
hidden_subscription, streaming_partial, failed, adjusted, and provider-reported zero as distinct states.")
Audit: score against *distinguishability of these 11 states*, not against a literal enum.

### B.7 `window_kind` — **TWO CONFLICTING CANON SPELLINGS** (unresolved intra-canon)
| Authority | Values |
|---|---|
| UF-085 prose (`usage-feature.md:5619`) + SCHEMA (`$defs/quotaFields/window_kind`) | `rolling` \| `fixed` \| `billing` \| `session` \| `unknown` |
| UF-041 (`usage-feature.md:3080`) + owner prose (`usage-feature.md:597`) | `rolling` \| `fixed_reset` \| `billing_cycle` \| `session_only` \| `unknown` |

The persisted/validated form is the SCHEMA form (`fixed`/`billing`/`session`). The GUI-semantics form
is the UF-041 form (`fixed_reset`/`billing_cycle`/`session_only`), with per-value rules at
`usage-feature.md:600-606`. Both are `status: accepted`. See §F.0.

Companion closed field `window_scope` (CV-200 :13024, SCHEMA): `provider | account | account+model | org | server_profile`.

### B.8 `quota_status` — CLOSED (SCHEMA + UF-088 fixture prose)
```
reported
disabled
not_exposed
estimated
unknown
```
Authority: `runtime_artifact_cost_usage.schema.json` `$defs/quotaFields/quota_status`; UF-088
acceptance `usage-feature.md:5531` ("renders quota_status disabled").
Companion `evidence_source` (SCHEMA, closed): `provider_api | provider_header | cli_command | statusline | local_estimate | not_exposed | unknown`.
Companion `credits_status` (SCHEMA, closed): `reported | not_exposed | disabled | unknown`.
**Note:** four owner docs spell this field `quota_state`, not `quota_status` — see §F.0.

### B.9 `cache_reporting_state` — **NOT CLOSED ANYWHERE IN PLANS**
Named as required by UF-080 (`usage-feature.md:5822, :5830, :5836, :5875`) alongside
`cache_miss_reason`. **No Plans file enumerates it.** The only value evidence in the repo is the
golden fixture GUI-USG-006, which asserts three values:
```
reported
not_exposed
unknown
```
(`tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json:50`)
The nearest *schema*-closed neighbour is a different field, `cache_write_breakdown_state` =
`reported | fallback_short_ttl | not_exposed | unknown`. `cache_reporting_state` does not appear in
`runtime_artifact_cost_usage.schema.json` at all. Audit: score the three fixture values plus
"reported cache_read = 0 ≠ unsupported/not_exposed/unknown"; treat any fourth invented value as
unverifiable.

### B.10 `projection_freshness` — CLOSED (SCHEMA)
```
current
refreshing
stale
```
Authority: `Plans/runtime_artifact_envelope.schema.json` (`projection_freshness.enum`).
Owner prose `usage-feature.md:510` merges freshness+health into one list: "Use
current/refreshing/stale/degraded/unavailable projection states." — the two are separate fields.

### B.11 `projection_health` — CLOSED (SCHEMA)
```
healthy
degraded
unavailable
```
Authority: `Plans/runtime_artifact_envelope.schema.json` (`projection_health.enum`).

### B.12 `stream_state` — CLOSED (SCHEMA)
```
started
partial
final
error
aborted
unknown
```
Authority: `Plans/runtime_artifact_tool_llm_trace.schema.json`
`properties/type_payload/properties/lifecycle/properties/stream_state`.
UF-088 fixture GUI-USG-008 asserts `stream_state:partial_or_aborted`.

### B.13 Additional closed sets the audit will need (same schema authority)
| field | closed values |
|---|---|
| `usage_reporting_state` | `final` \| `partial` \| `estimated` \| `unavailable` \| `unknown` |
| `redaction_status` | `redacted` \| `not_required` \| `pending` \| `unknown` |
| `cache_write_breakdown_state` | `reported` \| `fallback_short_ttl` \| `not_exposed` \| `unknown` |
| `display_cost_policy` | `show` \| `hide` \| `subscription_covered` \| `unknown` |
| `retention_class` (envelope) | `ephemeral` \| `session` \| `project` \| `governed` \| `debug_retained` |
| bridge exit normalization (CBP-026) | `success` \| `provider_error` \| `usage_error` \| `auth_required` \| `timeout` \| `cancelled` \| `killed` \| `invalid_json` \| `protocol_error` \| `transport_error` |

---

## C. The 13 GUI acceptance fixtures — MUST / MUST_NOT checklist

Source of truth: `/mnt/Cursor/PuppetMaster/tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json`
(`schema_id: pm.usage_gui.acceptance_fixture_matrix.v1`, `owner_plan_unit: UF-088`).
Validator: `python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures` (UF-088 :5543).
UF-088 declares the suite "closed at minimum" over exactly these 13 ids (`usage-feature.md:5521`).

### GUI-USG-001 — missing usage renders unknown, not zero
Surfaces: Usage, Ledger, Dashboard Usage widget, Context Detail Pane
- MUST: `source_class:unknown`, `source_confidence:unknown`, `source_authority:unknown`, `usage_reporting_state:unknown_or_unavailable`, `raw_payload_ref:absent_or_redacted`
- MUST_NOT: `zero_tokens`, `zero_cost`, `no_usage_success`

### GUI-USG-002 — provider-reported zero remains reported zero
Surfaces: Usage, Ledger, provider/settings row
- MUST: `source_class:provider_reported`, `source_confidence`, `source_authority`, `settlement_status:settled_or_adjusted`, `zero_buckets`, `raw_payload_ref`, `provider_payload_hash`
- MUST_NOT: `missing_usage`, `null_usage`, `unknown_usage`

### GUI-USG-003 — unknown cost fails closed
Surfaces: Usage, Ledger, Dashboard Usage widget
- MUST: `cost_status:unknown`, `source_confidence`, `source_authority`, `cost_microdollars:null`, `cost_minor_units:null`, `unknown_cost_copy`
- MUST_NOT: `$0.00`, `provider_authoritative_cost`, `priced_success`

### GUI-USG-004 — BYOK and subscription costs are hidden, not estimated
Surfaces: Usage, Ledger, provider/settings row, model row
- MUST: `usage_event_ref`, `usage_record_id`, `source_confidence`, `source_authority`, `hidden_byok`, `hidden_subscription`, `display_cost_policy:suppress`
- MUST_NOT: `fake_per_token_price`, `pricing_snapshot_id_without_source`, `cost_microdollars_fabricated`
- ⚠ `display_cost_policy:suppress` is **not** in the schema enum (`show|hide|subscription_covered|unknown`) — see §F.0.

### GUI-USG-005 — disabled quota bucket is disabled, not empty
Surfaces: Usage, provider/settings row, Antigravity CLI quota row
- MUST: `quota_status:disabled`, `window_kind:unknown_or_disabled`, `disabled_reason`
- MUST_NOT: `zero_remaining`, `exhausted`, `success`, `reset_countdown`, `fabricated_progress`

### GUI-USG-006 — reported cache zero differs from unsupported cache
Surfaces: Usage, Ledger, model row
- MUST: `cache_read:0`, `cache_reporting_state:reported`, `cache_reporting_state:not_exposed`, `cache_reporting_state:unknown`
- MUST_NOT: `zero_cache_as_unsupported`, `unsupported_cache_as_zero`

### GUI-USG-007 — inclusive and exclusive token totals do not double count
Surfaces: Usage, Ledger, Runtime Artifacts, model row
- MUST: `counting_semantics`, `input_total_includes_cache`, `output_total_includes_reasoning`, `provider_total_semantics`
- MUST_NOT: `cache_added_when_provider_inclusive`, `reasoning_added_when_provider_inclusive`, `double_counted_total`

### GUI-USG-008 — partial and aborted streams preserve partial usage once
Surfaces: Usage, Runtime Artifacts, Run Graph, Orchestrator
- MUST: `settlement_status:streaming_partial_or_failed`, `stream_state:partial_or_aborted`, `dedupe_key`, `accepted_partial_rollup_once`
- MUST_NOT: `final_copy`, `settled_copy`, `duplicate_partial_rollup`

### GUI-CBP-001 — Antigravity missing commands render not exposed or unknown
Surfaces: Antigravity CLI provider row, Usage, provider/settings row
- MUST: `/stats`, `/usage`, `/quota`, `/credits`, `stats_unavailable`, `usage:unknown`, `quota:not_exposed`, `credits:not_exposed`
- MUST_NOT: `fabricated_stats`, `fabricated_usage`, `fabricated_quota`, `fabricated_credits`

### GUI-CBP-002 — Antigravity G1 credits are credits-only
Surfaces: Antigravity CLI provider row, Usage, Dashboard Usage widget
- MUST: `provider_id:antigravity_cli`, `route:agy`, `G1 credits`, `UseG1Credits`, `credits_status`, `credits_remaining`
- MUST_NOT: `token_bucket_populated_from_credits`, `cost_populated_from_credits`, `quota_populated_from_credits`, `provider_total_from_credits`

### GUI-ROUTE-001 — Usage route opens object-first by usage event
Surfaces: Usage, Ledger, Runtime Artifacts
- MUST: `route_target.object_kind:usage_event`, `object_id:usage_event_ref`, `usage_record_id`, `provider_attempt_ref`, `attempt_id`, `trace_ref`, `source_class`, `source_confidence`, `source_authority`, `settlement_status`, `projection_freshness`, `projection_health`
- MUST_NOT: `timestamp_primary_route`, `run_only_primary_route`, `thread_only_primary_route`, `tier_only_primary_route`

### GUI-RAW-001 — Raw and Curated usage views redact provider payloads
Surfaces: Runtime Artifacts, Usage, Ledger
- MUST: `Curated normalized fields`, `source_class`, `source_confidence`, `source_authority`, `Raw redacted refs`, `provider_payload_hash`, `omitted_counts`, `permission_state`
- MUST_NOT: `credentials`, `account_identifiers`, `local_paths`, `raw_provider_secrets`

### GUI-RAP-001 — Runtime artifact usage drill-through requires envelope and per-type schemas
Surfaces: Runtime Artifacts, Usage, Ledger
- MUST: `cost_usage`, `tool_llm_trace`, `envelope_plus_per_type`, `usage_event_ref`, `usage_record_id`
- MUST_NOT: `envelope_only_valid`, `arbitrary_non_empty_type_payload_valid`

### C.1 UF-088 negative constraints over the whole matrix (verbatim, :5595-5599)
- "Do not call GUI Usage complete from provider parser fixtures alone."
- "Do not call runtime artifact schema strictness complete from envelope-only validation."
- "Do not let any fixture pass if unknown, hidden, disabled, not exposed, or missing values render as zero."
- "Do not let Raw views expose secrets, unredacted provider payloads, account identifiers, or local paths."

---

## D. Widget hostability + layout + per-widget-config ownership (who owns what)

### D.1 Ownership boundary (DRY_Rules.md:2064-2069, verbatim excerpt)
> `Plans/Widget_System.md` owns Dashboard widget hostability and widget layout. Consumers cite these
> owners and do not re-declare the layout field shape or create a second Home state machine.

> U10 interaction behavior is a reusable interaction vocabulary only. It does not transfer widget
> commands, widget hostability, DOM FLIP/order, or Dashboard widget state into the Home workspace.

### D.2 Hostability — WS-002 (verbatim `canonical_text`, Widget_System.md:141)
> Widget composition is in scope only for Dashboard widgets, Usage widgets, and Orchestrator Progress
> widgets. Plan Compile, Seams, Node Graph, Evidence, History, and Ledger are not widget canvases.

### D.3 Owner/consumer boundary — WS-003 (verbatim, :199)
> Widget_System owns widget hostability, layout, and projection inheritance for Dashboard, Usage, and
> Orchestrator Progress; widgets consume stable projections and canonical records and do not define
> page semantics.

Widget_System §2 refines the boundary (`Widget_System.md:39`, verbatim):
> Widget hostability treats `/settings/widget`, `/plan/question/approval`, and `/web-tool` as routed
> GUI consumer paths over FinalGUISpec and UI command owners; Widget_System owns only whether those
> widgets can be hosted by Dashboard, Usage, or Orchestrator `Progress`, plus layout and projection
> inheritance.

### D.4 Cross-surface hostability — WS-013 (verbatim, :837)
> Dashboard may host a curated subset of Progress widgets and some Usage widgets, while deep
> inspection surfaces remain non-hostable native tabs. Source Control is a constrained side-panel and
> `/small` surface, not a broad widget canvas.

WS-013 `negative_constraints`: "Deep inspection surfaces remain non-hostable native tabs."; "Source
Control is a constrained side-panel and `/small` surface, not a broad widget canvas."

### D.5 Per-widget configuration scope — WS-004 (verbatim, :259)
> Widget config changes presentation, local filtering, and layout only. Widget-level filters inherit
> page, project, and focused-run context; `/tab` filters, page/tab filters, and widget presentation
> config remain separate.

Three-layer scope model (`Widget_System.md:61`, verbatim):
> Widget scope has three layers: `router/page scope` carries `project_id`, `focused_run_id`, `/live`
> or historical mode, `/scope`, and deep-link targets; `tab scope` owns tab-native filters and pivots;
> `widget config` owns presentation settings, safe subfilters, and widget-local `/filter` state only.

Usage-side restatement (`usage-feature.md:78`, verbatim):
> Orchestrator `Progress` widgets embedded or linked from Usage inherit `focused_run_id` and page trust
> state automatically; widget config is limited to local presentation such as collapsed sections, chart
> style, sort, density, visible columns, or safe subset filters that cannot escape page scope.

### D.6 Data contract — WS-006 (verbatim, :374)
> Widgets consume stable orchestrator projections, canonical record `/query` contracts, widget identity
> `/type`, scope, filter `/sort/display` config, and projection refs; they do not subscribe to raw event
> streams or bespoke queries.

`negative_constraints`: "Widgets must not define meaning by subscribing directly to legacy event names
or tier-specific objects."

### D.7 Layout persistence namespace — WS-009 (verbatim, :560)
> Layout persistence uses app-default with project override. `dashboard_layout:v1` is import or
> rollback only; Dashboard writes use `widget_layout:v1:dashboard`; retired Orchestrator layout
> namespaces remain compatibility-only; `orchestrator:progress` has its own namespace.

Retired-but-readable namespaces (compatibility import evidence only):
`widget_layout:v1:orchestrator:tiers`, `…:evidence`, `…:history`, `…:ledger`, plus `dashboard_layout`
and `dashboard_layout:v1`. Usage restates the same rule at `usage-feature.md:80`:
"`dashboard_layout:v1` and `dashboard_layout` remain backup/migration reads, future reads use
`widget_layout:v1:dashboard`, and the active `widget_layout` family takes precedence."
Widget_System §3: "run-level layout persistence is not canonical for Orchestrator `Progress`".

### D.8 Usage-page composition (usage-feature.md:763-869, Widget-Composed Page Layout addendum)
- ":767 The Usage page is a required, dedicated top-level page. Every content area on the Usage page is a widget."
- ":773 The Usage page MUST be composed entirely of widgets from the widget catalog (Plans/Widget_System.md section 2). There is no static/fixed content area -- every panel, chart, and table is a widget that can be moved, resized, and configured."
- Users can Move / Resize (grid spans, grid-snapping) / Configure (gear icon) / Add (catalog flow) / Remove.
- **Default 4-column layout** (:792-800), verbatim table:

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.quota_summary` | 2x1 | 5h/7d usage bars per platform with plan type |
| 2 | 0 | `widget.alert_thresholds` | 2x1 | Approaching-limit warnings and threshold status |
| 0 | 1 | `widget.analytics_chart` | 2x2 | Aggregate usage over time (bar/line/area chart) |
| 2 | 1 | `widget.budget_donuts` | 2x2 | Donut charts for budget consumption per platform |
| 0 | 3 | `widget.tool_usage` | 2x2 | Tool invocation count, latency (p50/p95), error rate, and grep/Search `index_used` fallback mix |
| 2 | 3 | `widget.multi_account` | 2x2 | Per-platform account list, active account, cooldown state |
| 0 | 5 | `widget.ledger_table` | 4x3 | Event-level usage/token/cost ledger with filtering |

- **Responsive columns** (:805): "2 columns (<1200px), 3 columns (1200-1600px), 4 columns (>1600px) per Plans/FinalGUISpec.md section 12.3."
- **Resize affects data** (:807): "a wider `widget.analytics_chart` shows more time granularity, a taller `widget.ledger_table` shows more rows."
- **Per-widget config table** (:815-822), verbatim:

| Widget | Config Options |
|--------|---------------|
| `widget.quota_summary` | Time window (5h/7d), platforms to display |
| `widget.analytics_chart` | Time window (5h/7d/24h/custom), chart type (bar/line/area), platforms to include |
| `widget.budget_donuts` | Time window, chart style (donut/bar) |
| `widget.tool_usage` | Time window, sort by (count/latency/errors/index_used fallback rate) |
| `widget.ledger_table` | Visible columns, page size, default sort, event type filter |
| `widget.multi_account` | Platforms to show, show cooldown timers (on/off) |

- ":824 Configuration is persisted alongside the widget layout per Plans/Widget_System.md section 7."
- ":851 All widgets that appear on the Usage page are **also hostable on the Dashboard**." (add-widget flow, `Plans/Widget_System.md#4`)
- Multi-account widget (:829): "remains a first-class catalog entry, but it is now a status and observability widget rather than the canonical setup surface"; "the widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup."
- Analytics signal contract (:790): "`tool.invoked.index_used`: `true` counts queries served by sparse-n-gram candidate narrowing, while `false` counts raw ripgrep fallback or another unindexed path."
- Usage consumption boundary (`usage-feature.md:76`): "Usage consumes `Plans/Widget_System.md` … only for widget hostability, layout, and configuration persistence; Widget_System's broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership."

### D.9 Dashboard-hosted Usage widget value-state contract — WS-015 (verbatim `canonical_text`, Widget_System.md:1029)
> Dashboard-hosted Usage widgets are consumers of the canonical UsageRecord projection and
> FinalGUISpec value-state matrix. A Usage widget may summarize token, context, cost, quota, cache,
> reasoning, provider_total, context_estimate, Antigravity credits, or provider pressure only when it
> carries value_state, source_class, source_confidence, settlement_status, projection_freshness, and
> reason for degraded/unknown/hidden/disabled values. If the Dashboard does not promote a Usage widget
> in a given build, the Add Widget catalog shows Usage unavailable rather than silently substituting a
> simplified spend widget.

WS-015 acceptance (verbatim): distinct display states for "disabled, not_exposed, unknown, stale,
estimated, hidden_byok, hidden_subscription, streaming_partial, adjusted, failed, provider-reported
zero, cache zero, and cache unsupported"; no-double-count fixtures; Add Widget must either expose a
named Usage widget with this contract or "marks Usage widget hostability unavailable with a reason;
it must not expose an unowned placeholder widget"; "Dashboard widget rollups use usage_event_ref or
UsageRecord aggregation refs and never timestamp/run/thread/tier-only joins for accounting identity."
`negative_constraints`: "Do not add a Dashboard Usage widget that bypasses UF-085/UF-087 projections.";
"Do not render unavailable Usage widget hostability as an empty zero widget."; "Do not let Dashboard
rollups become the canonical Usage schema owner."
F3-418 parallel rule (:29004): "Usage widgets hosted on Dashboard either use the same value-state
matrix or remain explicitly unavailable as a Dashboard widget; no dashboard widget may use a
simplified zero-for-missing model."

### D.10 Ownership summary table
| Concern | Owner | Consumers may not |
|---|---|---|
| Which surfaces can host widgets (Dashboard / Usage / Orchestrator Progress only) | `Plans/Widget_System.md` (WS-002, WS-013) | make Plan Compile, Seams, Node Graph, Evidence, History, Ledger, or Source Control widget canvases |
| Grid/layout + layout persistence namespaces | `Plans/Widget_System.md` (WS-009) + `Plans/storage-plan.md` | write `dashboard_layout:v1`, invent run-level Progress layout, re-declare layout field shape |
| Per-widget config semantics (presentation/local filter/layout only) | `Plans/Widget_System.md` (WS-004) | let widget config escape page/project/focused-run scope or diverge from the tab's canonical projection rules |
| Usage page composition, default widget set, per-widget config option lists | `Plans/usage-feature.md` (§Widget-Composed Page Layout) | add static non-widget Usage content areas |
| Usage page head copy + icon-only Refresh/Export | `Plans/usage-feature.md` UF-089 | add a second head line or text-labelled buttons |
| Page-header layout / per-theme header boxes | `Plans/FinalGUISpec.md` F3-462 (UF-089 `owner_boundary_notes`) | — |
| `cmd.usage.refresh` / `cmd.usage.export` semantics | `Plans/UI_Command_Catalog.md` UCC-116 (UF-089 `owner_boundary_notes`) | change IDs, payloads, events, preconditions |
| Value-state matrix for every visible numeric cell | `Plans/FinalGUISpec.md` F3-418 | simplify to zero-for-missing anywhere, incl. Dashboard widgets |
| UsageRecord schema + aggregation/display semantics | `Plans/usage-feature.md` (UF-085/UF-087) + `Plans/Contracts_V0.md` (CV-196/CV-200) | define parallel usage schemas (usage-feature.md:528) |
| Runtime-artifact drill-through + Raw/Curated | `Plans/Runtime_Artifacts_Panel.md` RAP-043/RAP-044 | envelope-only validation, artifact-local cost models |
| Antigravity CLI usage/quota/credits/statusline | `Plans/CLI_Bridged_Providers.md` CBP-027 | map to Gemini Direct, or infer counters from probes |

### D.11 UF-089 — Usage Page Head Presentation (verbatim `canonical_text`, usage-feature.md:6185)
> The Usage page head stays one line. Its subtitle follows the copy pattern "AI Cost/usage for
> <project> — quotas, cost, cache savings and safety guards. Refreshes every 5 minutes; history kept
> for 90 days." where <project> is the active project name; the concept fixture shows project
> Tastebook. The 5-minute figure mirrors the default auto-refresh cadence inside the documented 5-15
> minute background refresh window and the 90-day figure mirrors the default raw-event retention
> window; changed defaults surface the configured values rather than stale copy. Refresh and Export
> render as icon-only buttons (inline SVG restart and clipboard glyphs), each carrying `title` and
> `aria-label` accessible names, and dispatch cmd.usage.refresh and cmd.usage.export unchanged.

`negative_constraints`: "Do not add a second head line or re-introduce text-labeled Refresh/Export
buttons on the Usage page head."; "Do not hardcode Tastebook or the 5-minute/90-day figures as literal
copy…"; "Do not change cmd.usage.refresh or cmd.usage.export IDs, payloads, events, or preconditions
from this unit; it is presentation only."
`stale_retired_dispositions`: "The 'prominent Refresh action' presentation is retired per PMConcept7
rev 9 Usage head; Refresh remains an explicit user action rendered icon-only with title and aria-label
accessible names so the head stays one line."
Backing defaults (`usage-feature.md:5812`): "refresh config key is `usage.refresh_interval_seconds`
with default `300`; retention config key is `usage.retention_days` with default `90`."

---

## E. Command-name normalization boundary + Event Authority admission rule (verbatim)

### E.1 Shared-runtime command-name normalization boundary (DRY_Rules.md, "### Shared-runtime command-name normalization boundary")

> DRY normalization does not register commands or aliases. Packet candidate names
> resolve only through the command owner as follows:

| Packet candidate or generic role | Canonical normalization/disposition |
|---|---|
| `cmd.lsp.server.restart` | Rejected candidate; use `cmd.lsp.restart_server`. |
| `cmd.lsp.server.diagnose` | Compatibility intent; use `cmd.lsp.open_problems`. |
| `cmd.debug.session.start` | Normalize to `cmd.run_debug.start`. |
| `cmd.debug.session.stop` | Normalize to `cmd.run_debug.stop`. |
| `cmd.debug.session.action` | Rejected generic action; select the exact existing `cmd.run_debug.*` verb. |
| `cmd.worktree.provision` | Normalize to `cmd.git.worktree.create`; a thread-scoped caller may use only the existing thread wrapper. |
| `cmd.worktree.release` | Normalize to `cmd.git.worktree.release`. |
| `cmd.context.receipt.open` | Normalize by subject kind to `cmd.nav.open_subject` or `cmd.nav.open_usage_subject`. |
| `cmd.remote.reconnect` | Retained exact-`ExecutionEnvironmentId` compatibility wrapper over canonical `cmd.environment.reconnect`; it owns no peer lifecycle. |

> The 26 generalized Environment, outbox, installation, Eval, MCP, resource, BSD,
> and related commands are registered only by `Plans/Commands_System.md` and
> `Plans/UI_Command_Catalog.md`. This DRY registry does not create or alias them.
>
> ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#15.1, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md

Usage-side companion rule (`usage-feature.md:92`, verbatim):
> `cmd.nav.open_usage_subject` resolves canonical Usage/Ledger identity from `usage_event_ref` or an
> equivalent usage target; domain-specific usage commands are wrappers over the shared route/subject
> model, not independent argument families.

And (`usage-feature.md:86`, verbatim):
> `UI_Command_Catalog.md` and `UI_Command_Catalog` wrappers must normalize artifact actions, thread
> usage actions, panel switches, and Orchestrator pivots into shared route/subject payloads rather
> than preserving separate local arg sets.

### E.2 Event Authority admission rule (DRY_Rules.md, "### Unresolved schema and Event Authority boundary", verbatim)

> `Plans/shared_runtime_contracts.schema.json` currently materializes only its closed
> root definitions. Its `x-puppet-master-blocked-definitions` entries remain
> non-implementation-ready identity skeletons until their owning lifecycle enums are
> adjudicated. This DRY registry neither fills those enums nor creates a peer schema.
>
> The Event Authority denominator remains `UNKNOWN_OPEN`. No event family is inferred,
> registered, or declared emitted from a service name in this registry. Producers use
> receipts/projections that already have owner-approved contracts, or remain
> non-emitting until individual Event Authority adjudication.
>
> ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/shared_runtime_contracts.schema.json, ContractName:Plans/event_family_registry.json, ContractName:Plans/storage-plan.md

### E.3 DR-037 — Shared Runtime Service Name And Delegation Registry (verbatim `canonical_text`)
> The sixteen Shared Integration Runtime service names are the sole reusable shared-runtime roles;
> consumers delegate domain policy to existing owners, reject feature-local peers, and normalize packet
> command candidates through canonical command owners without creating commands or events.

DR-037 acceptance (verbatim):
- "Every service in Shared Integration Runtime section 15.2 appears exactly once with its retained domain-owner boundary."
- "Packet candidate peer roles are either normalized to a canonical service or returned to a named domain owner."
- "LSP, DAP, worktree, context, and remote-wrapper candidates normalize exactly as the command-owner canon specifies."
- "The registry creates no command, alias, event family, schema peer, WorkNode, NodeSeed, or executable queue."
- "Blocked shared-runtime schema definitions and the UNKNOWN_OPEN Event Authority denominator remain explicit gaps rather than inferred closure."

The 16 canonical shared-runtime service names (DRY_Rules.md registry table): `InstallationResolver`,
`InstallationLifecycleManager`, `CapabilityProvisioner`, `EnvironmentConnectionSupervisor`,
`ThreadCommandOutbox`, `ProjectionReplayCoordinator`, `StreamCoalescer`, `RuntimeResourceGovernor`,
`ObservableWork`, `LeaseCoordinator`, `OperationalAwarenessService`, `DebugSessionBroker`,
`EvalSessionBroker`, `ProviderDispatchAdmissionService`, `ConditionalRuleEngine`,
`BackSeatDriverService`. Usage-relevant delegation row: `BackSeatDriverService` — "Goal, Chat, **Usage**,
Settings, and provider owners retain their respective policy and presentation"; prohibited peers:
"Per-surface BSD service or mutation-capable advisor". `ObservableWork` prohibited peer: "Feature-local
work/progress state machine or spinner-as-truth". `OperationalAwarenessService` prohibited peer:
"Operational-awareness store that becomes a domain authority".
Closing rule: "A value type such as `ToolRecoveryEnvelope` is not a service."

### E.4 Usage-side consumption of shared runtime (usage-feature.md:6241-6251, verbatim highlights)
- ":6241 Usage consumes `Plans/Shared_Integration_Runtime.md` operation identities, `ObservableWork`, `OperationalAwarenessService`, and provider-dispatch receipts while retaining sole ownership of Usage accounting and presentation. Shared runtime facts do not invent token counts, prices, settlement, or cost."
- ":6243 One real provider attempt creates one immutable UsageRecord, even when it is a background or silent helper, produces no user-visible content, is later suppressed, fails, times out, is interrupted, falls back, is replayed, or is superseded. … Deduplication keys prevent retry/reconnect/projector overlap from charging or rolling up the same provider attempt twice; a genuinely new retry or fallback provider attempt has its own record and links to the logical operation."
- ":6245 Full purpose attribution covers primary turns plus subagent/crew calls, vision/media inspection, compression/compaction/summarization, web search/fetch/extract/research, approval review, MCP routing, skill/tool discovery, title generation, probes, attachment transformation, fallback, replay, BSD, conditional-rule model assistance, and future helper classes. … Missing provider facts remain `unknown`, never zero."
- ":6247 `Off` or a pre-dispatch duplicate/rule suppression with no model call produces an operational decision record, not fabricated model Usage. … A call remains chargeable/attributable even when Chat displays nothing. BSD failure cannot convert primary work into failed Usage or block settlement of the primary attempt."
- ":6249 Non-model install/update/repair/rollback, environment maintenance, outbox wait, replay/snapshot transfer, local probes, LSP/DAP/Eval local work, MCP transport wait, worktree/lease activity, and other local/runtime operations use linked operational-attribution records rather than fake token Usage. … Operational records preserve `operation_id`, optional command and purpose, object lineage, exact Host/Environment, status/outcome, times, and partitions for provider active, local compute, resource, permission/approval, offline/outbox, reconnect/sync/replay/snapshot, maintenance, and total elapsed."
- ":6251 It does not treat either projection as billing, lifecycle, or completion authority and never exposes protected `AuthBrowserSession`, secrets, unredacted payloads, or raw registries."
- UF-091 acceptance: "OperationalAttributionRecord uses the closed value definition in `Plans/shared_runtime_contracts.schema.json` and the Usage owner remains the sole authority for its timing and lineage meaning."

---

## F. Canon-vs-packet vocabulary conflicts (stale-canon-conflict source)

### F.0 PREREQUISITE — conflicts *inside* Plans canon (both spellings `status: accepted`)
The audit cannot score "matches canon" for these fields without picking a side. Flag, do not repair.

| # | Field | Spelling A (authority) | Spelling B (authority) |
|---|---|---|---|
| F0-1 | `window_kind` values | `rolling` / `fixed` / `billing` / `session` / `unknown` — UF-085 `usage-feature.md:5619` + `runtime_artifact_cost_usage.schema.json` (the *validated* form) | `rolling` / `fixed_reset` / `billing_cycle` / `session_only` / `unknown` — UF-041 `usage-feature.md:3080` + owner prose `usage-feature.md:597` (the *GUI-semantics* form, with per-value rules at :600-606) |
| F0-2 | quota state field name | `quota_status` — schema `$defs/quotaFields/quota_status`, UF-088 `usage-feature.md:5531`, fixture GUI-USG-005 | `quota_state` — `Multi-Account.md:5102/5108`, `Models_System.md:9460/9467`, `Run_Graph_View.md:1102`, `Orchestrator_Page.md:2355` |
| F0-3 | reasoning bucket name | `reasoning/thoughts` — UF-085 prose + CV-196 | `reasoning_tokens` — schema REQUIRED wire field; RAP-043 calls it "the JSON wire alias for UF-085 reasoning/thoughts"; but CV-196 also lists `reasoning_tokens` as a *legacy compatibility alias only*. Schema additionally has optional `thoughts_tokens`. |
| F0-4 | `display_cost_policy` value | `show` / `hide` / `subscription_covered` / `unknown` — schema `type_payload/flags/display_cost_policy` | `suppress` — golden fixture GUI-USG-004 asserts `display_cost_policy:suppress`, a value the schema rejects |
| F0-5 | `cache_reporting_state` | REQUIRED by UF-080 (`usage-feature.md:5822/5830/5836`) and asserted by fixture GUI-USG-006 (`reported` / `not_exposed` / `unknown`) | **absent from `runtime_artifact_cost_usage.schema.json` entirely**; no closed enum anywhere in Plans |
| F0-6 | `value_state` | REQUIRED by F3-418, UF-087, WS-015 and in all three `preserved_exact_tokens` | **never enumerated in any Plans file** |
| F0-7 | `source_authority` | REQUIRED by UF-085, CV-200, CV-316, F3-418, and all 13-fixture MUST lists | schema type is `stringOrNull` — **free-form, no closed set** |
| F0-8 | projection state axes | two fields: `projection_freshness` (`current/refreshing/stale`) + `projection_health` (`healthy/degraded/unavailable`) — envelope schema | one merged five-value list: "current/refreshing/stale/degraded/unavailable projection states" — `usage-feature.md:510` |

### F.1 Packet `PM_Usage_Concept_Update_Final_Cumulative_2026-08-08` vs Plans canon

Packet files cited by path relative to
`Concepts/usage-concepts/PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/`.

| # | Concept / field | 2026-08-08 packet spelling | Plans canon spelling | Verdict |
|---|---|---|---|---|
| F1-1 | `source_class` value set | 8 values: `provider_reported`, `provider_header`, `cli_reported`, **`pm_observed`**, `local_estimated`, `pricing_estimated`, **`derived`**, `unknown` (`reference/HERMES_USAGE_HANDOFF.md:615-624`) | CLOSED 6: `provider_reported \| provider_header \| cli_reported \| local_estimated \| pricing_estimated \| unknown` (UF-085 :5619; restated closed at :521; schema) | **CONFLICT — packet adds 2 values to a closed enum.** `pm_observed` and `derived` have no canon slot. Nearest canon homes: `derived` → `provider_total_semantics: derived_input_plus_output` or `flags.is_estimated`; `pm_observed` → `local_estimated` + `source_authority`. |
| F1-2 | Data-quality axis | ONE flattened list of 8: `Provider reported`, `CLI reported`, **`PM observed`**, **`Derived`**, `Estimated`, `Unknown`, **`Partial`**, **`Stale`** (`04_SERVER_NETWORK_MAINTENANCE_AND_DATA_QUALITY.md:79-90`) | THREE orthogonal closed fields: `source_class` (6) + `usage_reporting_state` (`final\|partial\|estimated\|unavailable\|unknown`) + `projection_freshness` (`current\|refreshing\|stale`), plus `source_confidence` (4) and `value_state` | **CONFLICT — packet collapses 3-4 canon axes into one field.** `Partial` is canon `usage_reporting_state`/`settlement_status:streaming_partial`; `Stale` is canon `projection_freshness:stale`. CV-200 negative constraint: "Usage source and window metadata must not collapse all usage into one projection." |
| F1-3 | Field name for that axis | `data_quality` (`reference/HERMES_USAGE_HANDOFF.md:127, 257`) and DRY role `UsageDataQuality` (`06_…:77`) | `value_state` + `source_class` + `source_confidence` + `source_authority` + `usage_reporting_state` + `projection_freshness` + `projection_health` | **CONFLICT (naming).** No `data_quality` field exists in Plans canon. |
| F1-4 | Settlement value set | `Included`, `Extra balance`, `Usage pack`, `API billed`, `Free allowance`, `No charge observed`, `Unknown` — labelled "Settlement states" (`01_PROVIDER_ACCOUNT_PLAN_AND_SETTLEMENT.md:64-74`) | `settlement_status = observed \| streaming_partial \| settled \| adjusted \| failed \| unknown` (UF-085 :5619; schema) | **CONFLICT — same word, disjoint value sets.** The packet's list is a *cost/plan-coverage* axis, i.e. canon `cost_status` (`provider_reported\|priced\|estimated\|hidden_subscription\|hidden_byok\|unknown`) + `display_cost_policy` + quota/credits, NOT canon settlement lifecycle. The packet has **no** vocabulary for the canon settlement lifecycle (no `streaming_partial`/`adjusted`/`failed`) other than a bare `settlement_status` field name in `reference/HERMES_USAGE_HANDOFF.md:625-631`, whose value list there *does* match canon. So the packet is internally inconsistent too. |
| F1-5 | `cost_status` | **absent from the entire packet** (0 occurrences) | REQUIRED by schema `$defs/costFields`; named by UF-085, UF-088 GUI-USG-003, F3-418, RAP-044, and 8 owner docs | **GAP/CONFLICT — the packet has no canonical cost-state field.** |
| F1-6 | Cost field | `cost_or_allowance` (`reference/HERMES_USAGE_HANDOFF.md:450`); `Tokens/cost/settlement` (`02_…:145`); `Tokens/cache/cost` (`03_…:73`) | `cost_microdollars`, `cost_minor_units`, `currency`, `cost_status`, `pricing_snapshot_id`, `pricing_source`, `pricing_effective_at`, `pricing_version`, `bucket_costs_microdollars`, `custom_provider_price_row_ref` | **CONFLICT — packet coins a single combined field where canon requires 8 required cost fields.** `usage-feature.md:520/524`: `cost_usd` is display/migration only; no combined "allowance" field exists. |
| F1-7 | Input/output buckets | `input_tokens`, `output_tokens` (`reference/HERMES_USAGE_HANDOFF.md:446-447`) | `input_total`, `output_total` (CV-196; UF-085) | **CONFLICT — packet uses the legacy compatibility aliases as its primary names.** CV-196 negative constraint: "Legacy token names must not be presented as the canonical UsageRecord schema." |
| F1-8 | Cache buckets | `cache_read_tokens`, `cache_write_tokens` (`reference/HERMES_USAGE_HANDOFF.md:250-251, 448-449`); prose "Actual cache-read tokens / Actual cache-write tokens" (`02_…:83-84`) | `cache_read`, `cache_write`, `cache_write_1h`, `cache_write_ttl?` (CV-196; UF-085; UF-080) | **CONFLICT — legacy aliases as primary; `cache_write_1h` / `cache_write_ttl` absent entirely from the packet.** `usage-feature.md:519` allows the alias resolution "only when the provider mapper states the TTL and inclusive/exclusive semantics" — the packet states neither. |
| F1-9 | Reasoning bucket | `reasoning_tokens` (`reference/HERMES_USAGE_HANDOFF.md:445`); prose "Input/output/reasoning/cache reads/writes" (`05_…:42`) | `reasoning/thoughts` (CV-196/UF-085 canonical), `reasoning_tokens` = wire alias per RAP-043 / legacy alias per CV-196 | **AMBIGUOUS — collides with intra-canon conflict F0-3.** Not scorable as a clean fail. |
| F1-10 | Missing buckets | packet never names `input_non_cached`, `output_visible`, `provider_total`, `context_estimate`, `counting_semantics` | all five are REQUIRED first-class buckets (CV-196, UF-085, schema `tokenBuckets` required list) | **GAP — 5 of the 11 canonical buckets absent.** CV-196: "Canonical token buckets must not be collapsed into a smaller field set." Directly defeats fixture GUI-USG-007 (`counting_semantics`, `input_total_includes_cache`, `output_total_includes_reasoning`, `provider_total_semantics`). |
| F1-11 | Cache source labelling | "Provider-reported/derived/estimated source" (`02_…:87`) | `cache_reporting_state` (+ `cache_miss_reason`) per UF-080, and `source_class` separately | **CONFLICT — packet re-derives a per-cache source axis instead of `cache_reporting_state`; and its `derived` value is not a canon `source_class`.** |
| F1-12 | Accounting identity | `logical_turn_id`, `parent_event_id` (`02_…:30-32`); "logical-turn grouping" (`06_…:63`) | `usage_event_ref` (primary), `usage_record_id`, `parent_usage_record_id?`, `dedupe_key`, `provider_attempt_ref`, `attempt_id` (UF-085; CV-316; RAP-044; fixture GUI-ROUTE-001) | **CONFLICT — packet invents a grouping key family and never names `usage_event_ref`, `usage_record_id`, `dedupe_key`, or `parent_usage_record_id`.** UF-087 negative constraint forbids non-`usage_event_ref` primary accounting identity. |
| F1-13 | Route/drill-through | "semantic deep link to Settings/owner" (`06_…:66`) | `route_target.object_kind = usage_event` + `object_id` from `usage_event_ref`; `cmd.nav.open_usage_subject` (CV-316, RAP-044, F3-418, fixture GUI-ROUTE-001) | **GAP — packet has no object-first route vocabulary.** |
| F1-14 | Window model | prose only: "Next reset/cooldown", "Saved resets and expiration", "Plan resets/cooldowns" (`01_…:42, 34`; `05_…:39`) | `window_kind`, `window_label`, `window_scope` (closed 5), `quota_status`, `evidence_source`, `reset_at`, `cooldown_until`, `quota_remaining/used/limit` — all REQUIRED | **GAP/CONFLICT — packet has zero window/quota field vocabulary; `window_kind` and `window_scope` appear 0 times.** |
| F1-15 | Antigravity vocabulary | "Record Claude CLI and Antigravity CLI OAuth as CLI-owned profile routes." (`01_…:141`) — no `antigravity_cli`, no `agy`, no `/stats /usage /quota /credits`, no `G1 credits`, no `UseG1Credits` | CBP-027 requires `provider_id antigravity_cli`, route `agy`, the four slash probes, `Models & Quota`, `statusline`, `G1 credits`, `UseG1Credits`; fixtures GUI-CBP-001/002 assert them | **GAP — the packet omits the entire CBP-027 token set that two of the 13 fixtures score on.** |
| F1-16 | Value-state labelling in UI | "no `provider-reported`, `high`, or `medium` labels in ordinary context UI" (`05_…:32`) | F3-418 :28995 "A numeric cell is not only a number: it carries value, value_state, source_class, source_confidence, source_authority, settlement_status, projection_freshness, projection_health, last_updated or observed_at_utc, reason…"; UF-087 :5429 same; WS-015 :1029 same | **TENSION, resolvable.** Canon requires the *fields* to be carried and the states to be *distinguishable*; it does not mandate literal `provider-reported`/`high`/`medium` strings in ordinary chrome (F3-418 permits "state copy"). The packet's rule is a copy-style constraint, not an enum removal — but a concept that *drops the fields* (rather than restyling the copy) fails F3-418/UF-087/WS-015. Audit must check field presence in detail surfaces, not label text. |
| F1-17 | DRY service names | 18 candidate roles: `UsageEventStore`, `UsageNormalizer`, `SettlementResolver`, `UsageDataQuality`, `UsageForecast`, `CapacityProjection`, `RouteReceipt`, `CacheReceipt`, `TimeBreakdown`, `ProviderFamilyUsage`, `AccountConnectionUsage`, `HelperPurposeGroup`, `Goal/CrewUsage`, `MaintenanceActivity`, `ContextUsageDetail`, `RunOutProjection`, `SourceFreshness`, `UsageWidgetHost` (`06_…:73-92`, "Names are candidate roles.") | DR-037: "The sixteen Shared Integration Runtime service names are the sole reusable shared-runtime roles"; prohibited "feature-local peers, convenience facades, or compatibility services for the same responsibility" | **CONFLICT for the overlapping subset.** `TimeBreakdown` and `RunOutProjection`/`SourceFreshness` overlap `ObservableWork` / `OperationalAwarenessService` (prohibited peers: "Feature-local work/progress state machine or spinner-as-truth"; "Operational-awareness store that becomes a domain authority"). `UsageWidgetHost` overlaps Widget_System-owned hostability (WS-002/WS-003/WS-013). The rest are Usage-domain value types/projections, which DR-037 permits ("A value type such as `ToolRecoveryEnvelope` is not a service") but which must be returned to the named domain owner, not minted as services. |
| F1-18 | Command IDs | preserve `cmd.usage.refresh`, `cmd.usage.export`, `cmd.account.select_profile`, `cmd.provider.switch_route`; candidates `cmd.usage.detail.open`, `cmd.usage.forecast.request`, `cmd.usage.range.set`, `cmd.usage.filter.set`, `cmd.provider.usage.open_management` (`06_…:34-51`; `CANDIDATE_COMMAND_ID_REGISTER.json`) | `cmd.usage.refresh`/`cmd.usage.export` owned by `UI_Command_Catalog.md` UCC-116 (UF-089 owner_boundary_notes); `cmd.nav.open_usage_subject` is the canonical usage-open command (`usage-feature.md:92`); DRY normalization table registers **nothing** and normalizes `cmd.context.receipt.open` → `cmd.nav.open_subject`/`cmd.nav.open_usage_subject` | **CONFLICT (partial).** `cmd.usage.refresh`/`cmd.usage.export` match canon exactly. The 5 candidates are **unadjudicated**: `cmd.usage.detail.open` duplicates the canonical `cmd.nav.open_usage_subject` role (a "domain-specific usage command" that canon says must be "wrappers over the shared route/subject model, not independent argument families"). None appears in the DRY normalization table, so none may be treated as registered. |
| F1-19 | Event emission | "→ immutable Usage event" in the wiring chain (`06_…:59-67`); "Every real attempt is independently attributable" (`02_…:25`) | "The Event Authority denominator remains `UNKNOWN_OPEN`. No event family is inferred, registered, or declared emitted from a service name in this registry." (DRY_Rules.md) | **ADMISSION-RULE CONFLICT.** Any concept that shows or claims a named emitted Usage event family is asserting closure canon explicitly refuses. Producers must "use receipts/projections that already have owner-approved contracts, or remain non-emitting until individual Event Authority adjudication." |
| F1-20 | Purpose taxonomy | 18 closed-ish values: `user_work`, `subagent`, `crew_member`, `moa_reference`, `moa_aggregator`, `vision`, `compression`, `web_extract`, `approval_review`, `mcp_router`, `skill_search`, `title_generation`, `probe`, `catalog_validation`, `attachment_transform`, `fallback_attempt`, `conversation_replay`, `bsd` (`02_…:52-71`) | UF-090 (`usage-feature.md:6261`) lists purposes as prose, not a closed enum: "silent, suppressed, failed, interrupted, replay, fallback, BSD, subagent, vision, compression, web, approval, MCP, skill, title, probe, attachment, and other helper calls" | **NOT A CONFLICT — packet is a superset/refinement of an open canon list.** `moa_reference`/`moa_aggregator` and `crew_member` are packet-new but UF-090's "and other helper classes" (:6245) admits them. No canon enum to violate. |
| F1-21 | Time partitions | 11 partitions incl. `Provider permit wait`, `Waiting for reset` (`03_…:46-57`) | UF-091 (:6302) requires "Provider-active, local, resource, approval, offline/outbox, reconnect/replay/snapshot, maintenance, and total times remain distinguishable"; :6249 same list | **NOT A CONFLICT — packet superset.** `Provider permit wait` maps to `ProviderDispatchAdmissionService`; `Waiting for reset` is quota-window wait. Both admissible. |
| F1-22 | `projection_freshness` / `projection_health` | correct canon values (`reference/HERMES_USAGE_HANDOFF.md:633-641`) | `current/refreshing/stale`; `healthy/degraded/unavailable` | **MATCH.** |
| F1-23 | `settlement_status` (Hermes reference only) | `observed/streaming_partial/settled/adjusted/failed/unknown` (`reference/HERMES_USAGE_HANDOFF.md:625-631`) | identical | **MATCH** — but contradicts the packet's own `01_…:64-74` "Settlement states" (see F1-4). Packet-internal split. |
| F1-24 | `stream_state` | **absent from the packet** | closed 6, REQUIRED by fixture GUI-USG-008 | **GAP.** |
| F1-25 | `value_state` | **absent from the packet** (0 occurrences) | REQUIRED per-cell by F3-418, UF-087, WS-015 | **GAP** (mitigated by F0-6: canon never enumerates it either). |
| F1-26 | Usage page head | "AI Cost/usage for <project>", icon-only Refresh/Export with `title`+`aria-label` — **absent from the packet**; packet 05 lists density questions instead | UF-089 exact copy pattern + icon-only + accessible names + `cmd.usage.refresh`/`cmd.usage.export` | **GAP — the packet does not carry UF-089.** UF-089 postdates nothing here; it is `status: accepted` canon from 2026-07-23. |
| F1-27 | Widget vocabulary | `UsageWidgetHost`, "Focus and widget sizing", "Preserve smooth widget move/resize without flashing, dead-space use, alignment" (`05_…:52, 83`; `06_…:91`) | WS-002/003/004/009/013/015 own hostability, layout keys, config scope; `usage-feature.md:784-826` owns the 7 default widget IDs and their config option lists | **GAP/CONFLICT — the packet names no `widget.*` IDs and no `widget_layout:v1:dashboard` namespace, and coins `UsageWidgetHost` in a space Widget_System owns.** |
| F1-28 | Provider-native state | 11 prose rows: `Included usage`, `Extra usage balance`, `Usage packs and expiration`, `Saved resets and expiration`, `Free allowance`, `Paid usage after plan`, `API usage`, `Current post-plan rate`, `Spending guard`, `Next reset/cooldown`, `Current pressure` — "Do not flatten all of these into one `budget`." (`01_…:32-46`) | canon has no field family for included/extra/pack/saved-reset; nearest are `quotaFields` (`quota_remaining/used/limit`, `credits_remaining`, `credits_status`) and `cost_status:hidden_subscription` | **NEW VOCABULARY, NOT A CONFLICT — but unowned.** These are packet-proposed fields with no Plans owner yet; a concept rendering them is showing un-adjudicated vocabulary, which the audit should score as "beyond canon", not "matches canon". |
| F1-29 | Free Models | "Free Models is a catalog/routing wrapper… Do not create a Free Models quota ledger." (`01_…:120-135`) | consistent with UF-085 (no parallel usage schemas) and `usage-feature.md:528` | **NOT A CONFLICT.** |
| F1-30 | Hard failures list | `unknown displayed as zero`; `plan-included work shown as API-billed without evidence`; `helper calls hidden inside main model`; `maintenance counted as model tokens`; `route/settlement history rewritten by current aliases/settings` (`05_…:85-95`) | exactly canon: UF-085 negative constraints, UF-087 :5502, F3-418 :29051, UF-090 :6282, UF-091 :6316, `usage-feature.md:145` ("Today's Settings must not reinterpret old events" ↔ `01_…:145`) | **MATCH — the packet's failure list is canon-aligned and is the strongest scoring hook the packet supplies.** |

### F.2 How the audit should resolve F.1
Plans canon wins on every row where a closed enum or a REQUIRED schema field exists (F1-1, F1-2, F1-3,
F1-4, F1-5, F1-6, F1-7, F1-8, F1-10, F1-11, F1-12, F1-17, F1-18, F1-19). The 2026-08-08 packet is a
concept-update packet, not an owner doc: `usage-feature.md:94` establishes the general rule that
concept material "is illustrative source-lineage only. It does not define active Usage UX, UsageRecord
fields, source classes, cost authority, provider quota truth, refresh/retention intervals, widget IDs,
commands, runtime events, receipts, WorkNodes, NodeSeeds, queues, or wiring. Any promoted detail must
be restated in live owner docs…". So packet-only vocabulary (`pm_observed`, `derived`, `data_quality`,
`cost_or_allowance`, `logical_turn_id`, `Included`/`Extra balance`/`Usage pack`/`API billed`, the 18
DRY role names, the 5 candidate commands) is **not** canon and a concept using it is drifting, even
though the packet told it to. Where the packet is a superset of an open canon list (F1-20, F1-21) or
matches (F1-22, F1-23, F1-29, F1-30), no conflict.
The 8 rows in §F.0 are unresolvable from Plans alone and must be reported as canon defects, not concept
defects.
