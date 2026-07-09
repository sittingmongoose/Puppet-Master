# Shard 028: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/usage-feature.md`

Source lines: L5411-L5598

Source SHA256: `cff0c06423b3a9a6670c68d5f8ddfa1985a23aa861cb547da65c4348293a907d`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum propagates UF-085 and UF-086 into GUI-facing Usage consumers. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### UF-087 - UsageRecord GUI Projection And Alias Contract

```yaml
plan_unit_id: UF-087
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage GUI surfaces consume normalized UsageRecord and context projection records. They do not compute a chat-local, dashboard-local, widget-local, or artifact-local cost model. Every visible token, context, cost, quota, credit, cache, reasoning, provider-total, or context-estimate value carries value_state, source_class, source_confidence, source_authority, settlement_status, projection_freshness, projection_health, observed_at_utc or last_updated, and reason when degraded, estimated, unknown, disabled, not_exposed, hidden_byok, or hidden_subscription. Compatibility aliases such as usage_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_input_tokens, cost_usd, usage_source_kind, UnifiedUsageRecord, estimated_cost_microdollars, and final_cost_microdollars are import/display aliases only and must reconcile to UF-085 fields before GUI aggregation. Thread_id, tier_id, timestamp, and run_id may narrow or filter views, but UsageRecord identity and usage_event_ref remain primary for accounting and drill-through.
gui_related: true
gui_classification_reason: Usage, Ledger, chat context, dashboard widgets, runtime artifacts, settings, graph, and orchestrator all display usage/accounting state.
depends_on: [UF-085, UF-086, CBP-027, RAP-043]
unblocks: []
acceptance_criteria:
  - Usage page, Ledger, Context Detail Pane, dashboard-hosted usage widgets, Runtime Artifacts drill-through, Run Graph, Orchestrator, Multi-Account, and Models rows render disabled, not_exposed, unknown, stale, estimated, hidden_byok, and hidden_subscription as explicit states, not as zero.
  - GUI projections display cache_read, cache_write, cache_write_1h or cache_write_ttl, output_visible, reasoning/thoughts, provider_total, context_estimate, and counting_semantics when present, and hide or label unavailable buckets as not_exposed rather than unsupported zero.
  - GUI fixtures prove provider-reported zero is distinct from missing usage, null usage, disabled quota, unsupported cache, and unknown cost.
  - Retry, escalation, partial stream, aborted stream, failed attempt, and adjusted settlement fixtures preserve forensic records while rollups count each deduped usage_event_ref only once.
  - BYOK and subscription/provider-plan records preserve usage refs while suppressing misleading token-cost display according to cost_status and provider policy.
  - Antigravity CLI rows use provider_id `antigravity_cli` and route `agy`; missing or broken `/stats` renders stats unavailable, missing `/usage` renders usage unknown, missing `/quota` renders quota not exposed, missing `/credits` renders credits not exposed, disabled buckets render disabled, and G1 credits never render as tokens, cost, quota, or provider_total.
  - No UI path fabricates reset countdowns, remaining quota, price snapshots, or raw provider payload content from status/login probes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - future GUI usage projection fixture suite
risk_class: usage_gui_projection_false_pass
reasoning_tier: high
context_scope: usage_gui_projection
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_gui_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/CLI_Bridged_Providers.md:1429-1510"
  - "Plans/Runtime_Artifacts_Panel.md:262-316"
  - "Plans/runtime_artifact_cost_usage.schema.json:47-510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:pi-main/packages/ai/test/anthropic-cache-write-1h-cost.test.ts:18-86"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/anomalyco/opencode/issues/30649"
  - "https://github.com/anomalyco/opencode/issues/28494"
  - "https://github.com/cline/cline/issues/11037"
  - "https://github.com/earendil-works/pi/issues/4477"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
preserved_exact_tokens:
  - UsageRecord
  - usage_event_ref
  - provider_attempt_ref
  - source_class
  - source_confidence
  - settlement_status
  - projection_freshness
  - cache_write_1h
  - output_visible
  - reasoning/thoughts
  - provider_total
  - context_estimate
  - counting_semantics
  - hidden_byok
  - hidden_subscription
  - antigravity_cli
  - agy
  - missing /stats
  - G1 credits
negative_constraints:
  - Do not let GUI surfaces aggregate from compatibility aliases before coercing to UF-085 fields.
  - Do not render unknown, not exposed, hidden, disabled, stale, estimated, failed, partial, or unsupported values as zero.
  - Do not add cache buckets to input totals or reasoning/thoughts to output totals when provider counting_semantics says the provider total is already inclusive.
  - Do not use thread_id, tier_id, timestamp, or run_id as the primary usage accounting identity when usage_event_ref is available.
  - Do not expose unredacted raw provider payloads, credentials, account identifiers, or local paths in GUI Raw views.
owner_hints:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### UF-088 - GUI Usage Acceptance Fixture Matrix

```yaml
plan_unit_id: UF-088
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage implementation is not GUI-complete until cross-surface fixtures prove that normalized UsageRecord values render correctly in Usage, Ledger, Context Detail Pane, Runtime Artifacts, Run Graph, Orchestrator, provider/settings rows, model rows, and Dashboard-hosted Usage widgets. The fixture suite is closed at minimum over GUI-USG-001 missing usage, GUI-USG-002 provider-reported zero, GUI-USG-003 unknown cost, GUI-USG-004 BYOK/subscription hidden cost, GUI-USG-005 disabled quota bucket, GUI-USG-006 cache zero versus unsupported, GUI-USG-007 inclusive/exclusive no-double-count, GUI-USG-008 partial/aborted stream, GUI-CBP-001 Antigravity missing commands, GUI-CBP-002 Antigravity G1 credits, GUI-ROUTE-001 object-first usage route, GUI-RAW-001 Raw/Curated redaction, and GUI-RAP-001 envelope plus per-type validation.
gui_related: true
gui_classification_reason: The fixture matrix proves user-visible Usage behavior across GUI surfaces.
depends_on: [UF-085, UF-086, UF-087, CBP-027, RAP-043]
unblocks: []
acceptance_criteria:
  - GUI-USG-001 missing usage carries source_class unknown and usage reporting state unknown or unavailable, with absent or redacted raw payload refs, and never renders zero tokens, zero cost, or no-usage success.
  - GUI-USG-002 provider-reported zero carries source_class provider_reported, settlement_status settled or adjusted, zero buckets, and raw ref/hash evidence, and is not confused with missing or null usage.
  - GUI-USG-003 unknown cost carries cost_status unknown with null cost fields and visible unknown/estimated copy, not `$0.00` or provider-authoritative copy.
  - GUI-USG-004 BYOK/subscription hidden preserves usage_event_ref and UsageRecord identity while rendering hidden_byok or hidden_subscription cost state instead of fake per-token price.
  - GUI-USG-005 disabled quota bucket renders quota_status disabled without zero remaining, exhausted, success, reset countdown, or fabricated progress.
  - GUI-USG-006 cache zero versus unsupported proves reported cache_read = 0 is distinct from cache unsupported, not_exposed, or unknown.
  - GUI-USG-007 inclusive/exclusive no-double-count proves cache and reasoning buckets are not added to provider-inclusive totals and are added only when mapper counting_semantics proves exclusivity.
  - GUI-USG-008 partial/aborted stream preserves streaming_partial or failed settlement, trace lifecycle partial or aborted, dedupe_key, and accepted partial rollup once without showing final/settled copy.
  - GUI-CBP-001 Antigravity missing commands covers missing or broken `/stats`, `/usage`, `/quota`, and `/credits` as stats unavailable, usage unknown, quota not exposed, and credits not exposed.
  - GUI-CBP-002 Antigravity G1 credits carries provider_id antigravity_cli, route agy, credits status/remaining, and UseG1Credits without populating token, cost, quota, or provider_total fields.
  - GUI-ROUTE-001 object-first usage route asserts route_target.object_kind = usage_event and object_id from usage_event_ref plus attempt/provider refs, and fails timestamp/run/thread/tier primary routing.
  - GUI-RAW-001 Raw/Curated redaction shows normalized Curated fields and Raw redacted refs, hashes, omitted counts, and permission state with no credentials, account ids, local paths, or raw provider secrets.
  - GUI-RAP-001 envelope plus per-type validation rejects envelope-only or arbitrary non-empty type_payload artifacts for cost_usage and tool_llm_trace.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - future GUI Usage fixture suite
  - future runtime artifact JSON Schema negative fixture suite
risk_class: gui_usage_acceptance_false_pass
reasoning_tier: high
context_scope: usage_gui_acceptance_fixtures
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: usage_gui_acceptance_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/usage-feature.md:5425-5440"
  - "Plans/usage-feature.md:5535-5550"
  - "Plans/assistant-chat-design.md:1222-1255"
  - "Plans/Runtime_Artifacts_Panel.md:269-294"
  - "Plans/runtime_artifact_envelope.schema.json:1"
  - "Plans/runtime_artifact_cost_usage.schema.json:202-340"
  - "Plans/Contracts_V0.md:5665-5676"
  - "Plans/storage-plan.md:109"
  - "Plans/UI_Command_Catalog.md:1121"
preserved_exact_tokens:
  - GUI-USG-001
  - GUI-USG-002
  - GUI-USG-003
  - GUI-USG-004
  - GUI-USG-005
  - GUI-USG-006
  - GUI-USG-007
  - GUI-USG-008
  - GUI-CBP-001
  - GUI-CBP-002
  - GUI-ROUTE-001
  - GUI-RAW-001
  - GUI-RAP-001
  - missing usage
  - provider-reported zero
  - unknown cost
  - disabled quota
  - BYOK
  - subscription-hidden
  - cache zero vs unsupported
  - no-double-count
  - partial/aborted stream
  - G1 credits
negative_constraints:
  - Do not call GUI Usage complete from provider parser fixtures alone.
  - Do not call runtime artifact schema strictness complete from envelope-only validation.
  - Do not let any fixture pass if unknown, hidden, disabled, not exposed, or missing values render as zero.
  - Do not let Raw views expose secrets, unredacted provider payloads, account identifiers, or local paths.
owner_hints:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```
