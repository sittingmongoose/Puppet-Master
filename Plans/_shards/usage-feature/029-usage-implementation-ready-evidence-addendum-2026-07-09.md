# Shard 029: Usage Implementation-Ready Evidence Addendum - 2026-07-09

Source: `Plans/usage-feature.md`

Source lines: L5607-L5804

Source SHA256: `c50527a3f019e145fb3d6329af96044e8af04a2ff3b90ec28806717228eae686`

---

## Usage Implementation-Ready Evidence Addendum - 2026-07-09

This addendum promotes the uploaded local Usage evidence and live issue recheck into canonical Usage implementation contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated governance artifacts, production build tasks, final manifests, or PNC-019 receipts.

### UF-085 - Implementation Ready Usage Accounting Contract

```yaml
plan_unit_id: UF-085
unit_type: schema_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  UsageRecord is the single normalized accounting record for provider, CLI, local, estimated, and unknown usage signals. Every record carries idempotent correlation through usage_record_id, usage_event_ref, provider_attempt_ref, attempt_id, run_id, thread_id?, node_id?, tool_call_id?, parent_usage_record_id?, and dedupe_key so retries, escalations, resumed streams, and receipt/artifact drill-through cannot double-count or fork attribution. Provider identity is normalized through provider_id, provider_route_kind, provider_account_ref?, model_id, model_variant?, reasoning_tier?, and context_window_tokens?. Authority is explicit through source_class = provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown, source_confidence, source_authority, raw_payload_ref, redaction_status, and provider_payload_hash. Settlement is explicit through settlement_status = observed | streaming_partial | settled | adjusted | failed | unknown plus observed_at_utc, settled_at_utc?, adjusted_at_utc?, failure_class?, and partial_reason?. Token buckets are first-class and present even when unknown: input_total, input_non_cached, cache_read, cache_write, cache_write_1h, cache_write_ttl?, output_total, output_visible, reasoning/thoughts, provider_total, and context_estimate. Provider mappers state counting_semantics for whether cache is a subset of input and whether reasoning/thoughts are a subset of output; PM never adds subset fields back onto inclusive provider totals. Costs use cost_microdollars and/or provider minor units, currency, cost_status, pricing_snapshot_id, pricing_source, pricing_effective_at, pricing_version, per-bucket costs, and unknown-cost fail-closed behavior. BYOK and subscription/provider-plan routes preserve accounting refs while suppressing misleading per-token cost display when provider policy requires it. Usage windows and quotas are normalized as rolling, fixed, billing, session, or unknown with reset/cooldown evidence; missing reset signals, disabled buckets, missing cost, and missing quota render unknown/not exposed/disabled rather than guessed countdowns or zeroes. Raw provider payloads are retained by reference with redaction before persistence, while normalized fields remain queryable.
gui_related: true
gui_classification_reason: Usage totals, quota/cost display, drill-through, and fail-closed unknown states directly affect user-visible Usage and Ledger behavior.
depends_on: [UF-023, UF-035, UF-036, UF-040, UF-041, UF-074, UF-080]
unblocks: [RAP-043, CBP-027]
acceptance_criteria:
  - A canonical UsageRecord fixture validates identity/correlation fields for usage_event_ref, provider_attempt_ref, attempt_id, parent_usage_record_id, and dedupe_key.
  - Provider mapper fixtures prove source_class, source_confidence, settlement_status, raw_payload_ref, redaction_status, provider_payload_hash, and counting_semantics are present for provider-reported, header-reported, CLI-reported, local-estimated, pricing-estimated, and unknown signals.
  - Retry, escalation, resumed stream, failed attempt, and aborted/partial stream fixtures preserve forensic records while rollups count only the idempotent settled or accepted partial usage once.
  - No-double-count fixtures prove reasoning/thoughts are not added to output when the provider says output is inclusive and cache buckets are not added to input when the provider says input is inclusive.
  - Cost fixtures cover cost_microdollars, provider minor units, price snapshot id/version/date/source, custom-provider price rows, unknown-cost fail-closed policy, BYOK suppression, and subscription cost-display suppression.
  - Quota/window fixtures cover rolling, fixed, billing, session, disabled, not exposed, and unknown windows with reset/cooldown evidence and no fabricated countdowns.
  - Raw provider payload retention is tested through redacted payload refs and hashes without storing secrets in UsageRecord fields.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - future UsageRecord provider-mapper fixture suite
risk_class: usage_accounting_false_pass
reasoning_tier: high
context_scope: usage_accounting_contract
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
node_compile_hint:
  mode: usage_accounting_schema_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:opencode-dev/packages/llm/src/protocols/anthropic-messages.ts:566-615"
  - "uploaded:opencode-dev/packages/llm/src/protocols/openai-responses.ts:503-520"
  - "uploaded:opencode-dev/packages/llm/src/protocols/gemini.ts:338-360"
  - "uploaded:zero-main/internal/modelregistry/cost.go:38-119"
  - "uploaded:zero-main/internal/agent/context_measurement.go:9-47"
  - "uploaded:pi-main/packages/ai/src/models.ts:385-394"
  - "uploaded:pi-main/packages/ai/test/anthropic-cache-write-1h-cost.test.ts:18-86"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.ts:4-87"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.test.ts:19-64"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "https://github.com/anomalyco/opencode/issues/28494"
  - "https://github.com/anomalyco/opencode/issues/30649"
  - "https://github.com/earendil-works/pi/issues/2709"
  - "https://github.com/earendil-works/pi/issues/4477"
  - "https://github.com/cline/cline/issues/11037"
  - "https://github.com/cline/cline/issues/4346"
preserved_exact_tokens:
  - UsageRecord
  - usage_record_id
  - usage_event_ref
  - provider_attempt_ref
  - provider_reported
  - provider_header
  - cli_reported
  - local_estimated
  - pricing_estimated
  - unknown
  - observed
  - streaming_partial
  - settled
  - adjusted
  - failed
  - input_total
  - input_non_cached
  - cache_read
  - cache_write
  - cache_write_1h
  - output_total
  - output_visible
  - reasoning/thoughts
  - provider_total
  - context_estimate
  - counting_semantics
  - cost_microdollars
  - cost_minor_units
  - pricing_snapshot_id
  - BYOK
  - subscription
  - rolling
  - fixed
  - billing
  - session
negative_constraints:
  - Do not let Ledger, rollups, Runtime Artifacts, or UI projections parse ad hoc JSON instead of the canonical UsageRecord contract.
  - Do not add cache_read/cache_write/cache_write_1h to input_total when the provider says input_total is already inclusive.
  - Do not add reasoning/thoughts to output_total when the provider says output_total is already inclusive.
  - Do not turn context_estimate into billing, cost, quota, or provider authority.
  - Do not display missing, disabled, unsupported, blocked, stale, or unknown cost/quota as zero.
  - Do not fabricate reset countdowns, remaining quota, or cost from status/login probes.
  - Do not expose raw provider payloads, credentials, account identifiers, or local machine paths in persisted UsageRecord fields.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### UF-086 - Provider Parser Fixture And Acceptance Contract

```yaml
plan_unit_id: UF-086
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage implementation is not complete until provider parser fixtures prove normalized UsageRecord behavior for OpenAI Chat/Responses, Anthropic Messages, Gemini, Bedrock, OpenRouter, LiteLLM/OpenAI-compatible routes, local/llama routes, custom providers, and Antigravity CLI. Fixtures must include raw provider payload refs plus normalized fields for token buckets, inclusive/exclusive counting semantics, settlement lifecycle, cost status, quota/window evidence, BYOK/subscription cost-display policy, retry/escalation de-duplication, and partial/aborted stream preservation. Each parser fixture states whether cache is a subset of input, reasoning/thoughts are a subset of output, provider_total is authoritative or derived, and context_estimate is local-only. The fixture suite must include negative tests for missing usage, null usage, unknown cost, disabled quotas, missing reset, missing /stats, provider-reported zero, malformed negative/subset-overflow values, and custom-provider price rows.
gui_related: false
gui_classification_reason: Parser fixtures and acceptance contracts are backend validation requirements; GUI consumes the resulting projections.
depends_on: [UF-085]
unblocks: []
acceptance_criteria:
  - OpenAI fixtures cover cached tokens and reasoning tokens for Chat/Responses, with output_total already inclusive when provider payload says so.
  - Anthropic fixtures cover cache_read, cache_write, cache_write_1h or TTL-specific cache creation, message_start plus final message_delta settlement, and fallback when TTL breakdown is not exposed.
  - Gemini fixtures cover cachedContentTokenCount and thoughtsTokenCount where candidates output is visible-only and inclusive output is candidates plus thoughts only when both semantics are proven.
  - Bedrock fixtures cover cache-aware input and provider/header source authority where exposed.
  - OpenRouter fixtures cover BYOK, upstream cost details, raw provider cost payload refs, and hidden/suppressed display cost when appropriate.
  - LiteLLM/OpenAI-compatible fixtures cover missing, partial, null, provider-specific cached token fields and OpenAI-compatible cache-inclusive prompt_tokens.
  - Local/llama fixtures cover context overflow evidence, request-size/server-log disagreement, local_estimated context_estimate, and no billing authority.
  - Custom-provider fixtures cover price rows for input/output/cacheRead/cacheWrite/cacheWrite1h, context window, max tokens, reasoning/thinking compatibility flags, and cache control format.
  - Antigravity fixtures cover /usage, /quota, /credits, Models & Quota, statusline context/quota signals, G1 credits, disabled buckets, and missing /stats as unknown/not exposed.
  - JSON schema negative tests reject cost_usage or tool_llm_trace artifacts whose type_payload lacks normalized provider, usage, cost or quota, authority, refs, and flags where required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - future provider parser fixture suite
  - future runtime artifact JSON schema positive and negative fixture suite
risk_class: usage_parser_fixture_gap
reasoning_tier: high
context_scope: usage_provider_parser_acceptance
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
node_compile_hint:
  mode: usage_provider_parser_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:opencode-dev/packages/opencode/test/server/negative-tokens-regression.test.ts:1-84"
  - "uploaded:zero-main/internal/cli/usage.go:23-151"
  - "uploaded:zero-main/internal/modelregistry/cost.go:38-119"
  - "uploaded:pi-main/packages/coding-agent/docs/custom-provider.md:164-233"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.test.ts:19-64"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:197-200"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:222-233"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
  - "https://github.com/google-antigravity/antigravity-cli/issues/74"
  - "https://github.com/google-antigravity/antigravity-cli/issues/23"
  - "https://github.com/google-antigravity/antigravity-cli/issues/397"
preserved_exact_tokens:
  - OpenAI
  - Anthropic
  - Gemini
  - Bedrock
  - OpenRouter
  - LiteLLM
  - OpenAI-compatible
  - local/llama
  - custom providers
  - Antigravity
  - no-double-count
  - missing /stats
  - G1 credits
  - disabled buckets
  - provider parser fixtures
negative_constraints:
  - Do not call Usage implementation-ready from schemas that accept arbitrary non-empty type_payload.
  - Do not accept provider parser fixtures that lack raw-payload lineage and normalized field expectations.
  - Do not treat missing usage, null usage, unknown cost, disabled quota, or broken /stats as zero.
  - Do not let provider compatibility flags silently change cache/reasoning semantics without a fixture.
owner_hints:
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Runtime_Artifacts_Panel.md
```
