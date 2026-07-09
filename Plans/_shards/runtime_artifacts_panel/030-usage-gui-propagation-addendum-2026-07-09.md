# Shard 030: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1938-L2013

Source SHA256: `6966f6f122a8c32dbebdf00ba927141f1c427e52cdf4898c5f0212d6704ee4cc`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Runtime Artifacts usage drill-through to UsageRecord identity and strict per-type validation. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RAP-044 - Usage Artifact Drill-Through And Raw Curated Contract

```yaml
plan_unit_id: RAP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts usage drill-through is object-first. `Show in Usage` and `Show in Ledger` emit route_target.object_kind = usage_event and a stable object_id whenever usage_event_ref is present, plus secondary refs for usage_event_ref, usage_record_id, artifact_id, attempt_id, node_id, provider_attempt_ref, tool_call_id, trace_ref, receipt refs, raw_payload_ref, run_id, and thread_id. Run, thread, timestamp, and tier remain filters or display scope only. The Runtime Artifacts panel exposes Curated and Raw usage views: Curated shows normalized provider, usage, cost, quota, authority, settlement, counting_semantics, and correlation refs; Raw shows raw_payload_ref, redaction_status, provider_payload_hash, omitted counts, truncation/redaction reason, and permissioned-unavailable state. Append, indexing, and drill-through validation must validate the common envelope plus the matching per-type schema for cost_usage and tool_llm_trace; envelope-only validation or arbitrary non-empty type_payload cannot pass.
gui_related: true
gui_classification_reason: Runtime Artifacts drill-through, Curated/Raw views, and Usage/Ledger actions are visible inspection UI.
depends_on: [RAP-043, UF-087, UF-088, UCC-109, CV-316]
unblocks: []
acceptance_criteria:
  - "`Show in Usage` and `Show in Ledger` payloads include object_kind = usage_event and object_id derived from usage_event_ref when usage_event_ref exists."
  - Route fixtures fail timestamp-only, run-only, thread-only, tier-only, and artifact-only Usage pivots when usage_event_ref is available.
  - Curated view displays normalized token buckets, cost status, quota status, source_class, source_confidence, source_authority, settlement_status, counting_semantics, and correlation refs.
  - Raw view displays redacted raw_payload_ref, redaction_status, provider_payload_hash, omitted counts, and permissioned unavailable state without exposing raw secrets, account identifiers, credentials, or local paths.
  - cost_usage and tool_llm_trace artifacts validate against the envelope plus their matching per-type schema before append, index, display, export, or drill-through.
  - Negative fixtures reject envelope-only cost_usage/tool_llm_trace artifacts and arbitrary non-empty type_payload payloads.
validation_surfaces:
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - future GUI-RAP-001 fixture suite
risk_class: runtime_artifact_usage_drillthrough_false_pass
reasoning_tier: high
context_scope: runtime_artifact_usage_drillthrough
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_artifact_usage_drillthrough_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Runtime_Artifacts_Panel.md:262-316"
  - "Plans/runtime_artifact_envelope.schema.json:1"
  - "Plans/runtime_artifact_cost_usage.schema.json:47-510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "Plans/Contracts_V0.md:5665-5676"
  - "Plans/storage-plan.md:109"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
preserved_exact_tokens:
  - Show in Usage
  - Show in Ledger
  - route_target.object_kind = usage_event
  - usage_event_ref
  - provider_attempt_ref
  - trace_ref
  - raw_payload_ref
  - Curated
  - Raw
  - type_payload
  - cost_usage
  - tool_llm_trace
negative_constraints:
  - Do not route usage drill-through primarily by timestamp, run, thread, tier, or artifact-only filters when usage_event_ref is available.
  - Do not validate cost_usage or tool_llm_trace with envelope-only validation.
  - Do not display Raw payload contents without redaction refs, permission state, and secret stripping.
  - Do not create an artifact-local usage schema separate from UsageRecord.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
```
