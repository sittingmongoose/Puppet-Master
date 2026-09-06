# Shard 036: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/storage-plan.md`

Source lines: L16768-L16832

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Usage projection storage and alias handling for GUI consumers. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated storage registry rows, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### SP-234 - Usage Projection Storage And Alias Contract

```yaml
plan_unit_id: SP-234
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage owns the durable projection joins that let GUI surfaces recover UsageRecord identity and route/open state without recomputing accounting. Usage projection records and runtime-artifact projector families carry usage_record_id, usage_event_ref, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, projection_freshness, projection_health, checkpoint cursor, and rebuild provenance. Compatibility aliases such as usage_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_input_tokens, cost_usd, usage_source_kind, UnifiedUsageRecord, estimated_cost_microdollars, and final_cost_microdollars are migration/display inputs only and normalize to UF-085 fields before persistence, aggregation, or GUI projection. `usage_event_ref` remains a usage/storage join and normalizes through route_target.object_kind = usage_event for route/open; it does not become a separate route selector.
gui_related: false
gui_classification_reason: Storage projection fields support GUI consumers but are backend persistence contracts.
depends_on: [SP-230, SP-231, UF-087, CV-316, RAP-044]
unblocks: []
acceptance_criteria:
  - Usage projection records persist usage_record_id, usage_event_ref, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, projection_freshness, projection_health, checkpoint cursor, and rebuild provenance when available.
  - Runtime artifact projector records can join cost_usage and tool_llm_trace artifacts to Usage, Ledger, Context Detail Pane, Run Graph, and Orchestrator without timestamp/run/thread/tier primary routing.
  - Compatibility aliases normalize to UF-085 fields before persistence or GUI projection and cannot become a competing UsageRecord schema.
  - Redaction records preserve raw_payload_ref, redaction_status, provider_payload_hash, omitted counts, and permission state while excluding credentials, account identifiers, and local paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future usage projection storage fixture suite
risk_class: usage_projection_storage_alias_drift
reasoning_tier: high
context_scope: usage_projection_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: usage_projection_storage_alias_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/storage-plan.md:53-109"
  - "Plans/storage-plan.md:651-690"
  - "Plans/storage-plan.md:1606-1800"
  - "Plans/usage-feature.md:514-522"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:288-316"
preserved_exact_tokens:
  - usage_record_id
  - usage_event_ref
  - provider_attempt_ref
  - projection_freshness
  - projection_health
  - checkpoint cursor
  - usage_id
  - cost_usd
  - UnifiedUsageRecord
negative_constraints:
  - Do not hand-edit generated storage registry rows for this PlanUnit.
  - Do not keep compatibility aliases as canonical persisted authority fields.
  - Do not use usage_event_ref as a route selector that bypasses object_kind/object_id normalization.
  - Do not persist unredacted provider payloads, credentials, account identifiers, or local paths.
owner_hints:
  - Plans/storage-plan.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
```
