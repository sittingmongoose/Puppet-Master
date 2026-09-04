# Shard 060: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/FinalGUISpec.md`

Source lines: L29014-L29093

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds visible Usage, Dashboard, settings, graph, orchestrator, and artifact entrypoints to the canonical UsageRecord projection. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-418 - Usage Value-State Rendering And Identity Contract

```yaml
plan_unit_id: F3-418
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every visible Usage, Ledger, Dashboard-hosted Usage widget, chat context summary, Context Detail Pane, Runtime Artifacts drill-through, provider/settings row, model row, Run Graph usage overlay, and Orchestrator usage/cost row renders UsageRecord projections through a shared value-state matrix. A numeric cell is not only a number: it carries value, value_state, source_class, source_confidence, source_authority, settlement_status, projection_freshness, projection_health, last_updated or observed_at_utc, reason, and raw/debug redaction availability where relevant. UsageRecord and usage_event_ref remain the accounting and rollup identity. Event-primary navigation uses usage_event/usage_event_ref; a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id and retains usage_event_ref as correlation. Thread_id, tier_id, timestamp, and run_id are filters or narrowing context only. GUI copy for Antigravity CLI uses provider_id `antigravity_cli` and route `agy`; missing `/stats`, `/usage`, `/quota`, or `/credits` and disabled buckets render as unavailable/unknown/not_exposed/disabled states, while G1 credits remain credits and never become tokens, cost, quota, or provider_total.
gui_related: true
gui_classification_reason: Defines visible Usage, Dashboard, settings, graph, orchestrator, and artifact rendering behavior.
depends_on: [UF-085, UF-086, UF-087, CBP-027, RAP-043]
unblocks: []
acceptance_criteria:
  - Usage page and Ledger rollups pivot by usage_event_ref or usage_record_id first; thread_id, tier_id, timestamp, and run_id are filter chips or scope labels only.
  - Visible token, cost, quota, context, cache, reasoning, provider_total, and credit cells render disabled, not_exposed, unknown, stale, estimated, hidden_byok, hidden_subscription, streaming_partial, failed, adjusted, and provider-reported zero as distinct states.
  - Cache zero is shown as a real reported zero only with source_class/source_confidence evidence; missing cache support, unsupported cache, and not exposed cache use state copy instead of zero.
  - Usage widgets hosted on Dashboard either use the same value-state matrix or remain explicitly unavailable as a Dashboard widget; no dashboard widget may use a simplified zero-for-missing model.
  - Runtime Artifact `Show in Usage` and `Show in Ledger` actions land by object_kind = usage_event plus usage_event_ref and secondary refs, not timestamp/run/thread/tier-only filters.
  - Provider/settings and model rows show Antigravity CLI `antigravity_cli`/`agy` usage, quota, credits, statusline, disabled bucket, and G1 credit states without inferring counters from model names or login status.
  - Raw/debug affordances show redaction_status, provider_payload_hash, raw_payload_ref, omitted count, and permissioned-unavailable state rather than unredacted payload content.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - future GUI usage value-state fixture suite
risk_class: gui_usage_state_false_zero
reasoning_tier: high
context_scope: gui_usage_value_state
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
node_compile_hint:
  mode: gui_usage_value_state_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/FinalGUISpec.md:1265-1293"
  - "Plans/FinalGUISpec.md:1548-1595"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/CLI_Bridged_Providers.md:1429-1510"
  - "Plans/runtime_artifact_cost_usage.schema.json:47-510"
  - "https://github.com/anomalyco/opencode/issues/30649"
  - "https://github.com/cline/cline/issues/11037"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
preserved_exact_tokens:
  - value_state
  - source_class
  - source_confidence
  - settlement_status
  - projection_freshness
  - hidden_byok
  - hidden_subscription
  - usage_event_ref
  - object_kind = usage_event
  - object_kind = usage_attempt
  - attempt_id
  - antigravity_cli
  - agy
  - G1 credits
negative_constraints:
  - Do not render missing, unknown, hidden, stale, disabled, not exposed, partial, failed, or unsupported values as zero.
  - Do not treat thread_id, tier_id, timestamp, or run_id as primary Usage identity when a canonical event or attempt selector is available.
  - Do not infer Antigravity usage, quota, credits, or countdowns from status/login/model probes.
  - Do not expose unredacted raw provider payloads in GUI debug views.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
```
