# Shard 028: Usage Artifact Schema Strictness Addendum - 2026-07-09

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1834-L1918

Source SHA256: `7c0bb4c9b7a914ee98c6e8185dd2c7612033369b55b4a3024c95f070e6b49286`

---

## Usage Artifact Schema Strictness Addendum - 2026-07-09

This addendum tightens already-materialized runtime artifact schema expectations for usage-bearing artifacts. It creates no runtime artifacts, WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts.

### RAP-043 - Usage And Tool Trace Schema Strictness

```yaml
plan_unit_id: RAP-043
unit_type: schema_contract
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The materialized `cost_usage` and `tool_llm_trace` runtime artifact schemas must reject arbitrary non-empty `type_payload` values. `cost_usage` requires canonical usage identity through `usage_event_ref`, provider/route/account/model identity, normalized usage token buckets and counting semantics, nonnegative `reasoning_tokens` as the JSON wire alias for UF-085 reasoning/thoughts, normalized cost fields, quota/window evidence, authority/source/confidence/settlement fields, raw provider payload/redaction refs, and flags for estimated, provider-reported, CLI-reported, local-context-estimated, BYOK, subscription-hidden, and unknown states. `tool_llm_trace` requires `trace_ref`, trace_kind, tool_call_id, llm_call_id or stream_id, provider_attempt_ref, usage_event_ref when available, stream lifecycle timestamps or refs for start/partial/final/error/abort, provider payload/redaction refs, usage settlement link, retry/escalation relation, and quota/usage refs; provider_reported/cli_reported flags are signal flags only, not source authority, and Curated trace views must join UsageRecord authority through `usage_record_id` or `usage_artifact_ref`. Schema-only JSON validation must fail if these required payload fields are absent; repo-specific validators may add fixtures but must not be the only line of defense.
gui_related: true
gui_classification_reason: Cost usage and tool/LLM trace artifacts are user-visible drill-through surfaces, and schema strictness protects their displayed Usage/Ledger behavior.
depends_on: [RAP-016, RAP-017, RAP-018, UF-085, CBP-027]
unblocks: []
acceptance_criteria:
  - "`Plans/runtime_artifact_cost_usage.schema.json` rejects an artifact whose `type_payload` lacks provider, usage, cost, quota, authority, refs, or flags."
  - "`Plans/runtime_artifact_cost_usage.schema.json` requires `usage_event_ref`, `usage_record_id`, and nonnegative `reasoning_tokens` as the UF-085 reasoning/thoughts wire alias with counting_semantics."
  - "`Plans/runtime_artifact_tool_llm_trace.schema.json` rejects an artifact whose `type_payload` lacks `trace_ref`, `usage_record_id`, trace lifecycle, provider attempt linkage, usage settlement linkage, retry/escalation relation, or raw-payload/redaction refs."
  - Schema-only validation can distinguish missing, unknown, disabled, estimated, provider-reported, CLI-reported, BYOK, and subscription-hidden states without accepting arbitrary payloads.
  - Runtime Artifacts drill-through uses canonical `usage_event_ref`, `usage_record_id`, `provider_attempt_ref`, and `trace_ref` rather than timestamp heuristics or artifact-local cost models.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts are created by this PlanUnit.
validation_surfaces:
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: runtime_artifact_schema_false_pass
reasoning_tier: high
context_scope: runtime_artifact_usage_schema
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_runtime_artifact_schema_strictness
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Runtime_Artifacts_Panel.md:262-292"
  - "Plans/runtime_artifact_cost_usage.schema.json:1"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:1"
  - "uploaded:Puppet-Master-main/Plans/runtime_artifact_cost_usage.schema.json:1"
  - "uploaded:Puppet-Master-main/Plans/runtime_artifact_tool_llm_trace.schema.json:1"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:pi-main/packages/ai/src/types.ts:352-375"
  - "uploaded:pi-main/packages/ai/src/api/anthropic-messages.ts:546-559"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
preserved_exact_tokens:
  - cost_usage
  - tool_llm_trace
  - type_payload
  - usage_event_ref
  - provider_attempt_ref
  - trace_ref
  - reasoning_tokens
  - provider_reported
  - provider_header
  - cli_reported
  - local_estimated
  - pricing_estimated
  - unknown
  - streaming_partial
  - settled
  - adjusted
  - failed
  - BYOK
  - subscription-hidden
negative_constraints:
  - Do not accept arbitrary non-empty `type_payload` as a valid cost_usage or tool_llm_trace artifact.
  - Do not rely only on custom repo validators when JSON Schema itself can express required payload fields.
  - Do not create an artifact-local usage model separate from canonical UsageRecord.
  - Do not use timestamp heuristics, run-only filters, or tier-only filters as the primary usage/cost join.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
