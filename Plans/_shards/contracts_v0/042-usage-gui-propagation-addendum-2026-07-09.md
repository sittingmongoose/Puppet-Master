# Shard 042: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Contracts_V0.md`

Source lines: L20399-L20460

Source SHA256: `09408a3e335023db2cf93ebf921993c37ed9166827985d47eeef27ba02b99dbd`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds shared route/open contracts to canonical UsageRecord identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### CV-316 - GUI Usage Route Subject Payload Contract

```yaml
plan_unit_id: CV-316
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  GUI Usage route/open payloads normalize every usage drill-through target into route_target.object_kind = usage_event and route_target.object_id = the canonical usage event id when usage_event_ref exists. OpenSubject carries the display subject, while usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health remain correlation and projection fields. Thread_id, tier_id, timestamp, and run_id can filter or scope a view but cannot replace UsageRecord identity. Raw/Curated consumers share the same redaction contract: Curated receives normalized fields and Raw receives redacted refs/hashes/omitted counts/permission state, not unredacted provider payloads.
gui_related: true
gui_classification_reason: Shared route/open payloads drive visible Usage, Ledger, chat, artifact, graph, and orchestrator navigation.
depends_on: [CV-309, UF-087, UF-088]
unblocks: [SP-234, WM-043]
acceptance_criteria:
  - Route payload fixtures fail if usage_event_ref remains a top-level route selector without object_kind = usage_event and object_id normalization.
  - OpenSubject fixtures preserve usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, and thread_id.
  - Cross-surface drill-through fixtures fail timestamp/run/thread/tier primary routing when usage_event_ref is available.
  - Raw/Curated fixtures prove redacted Raw refs and normalized Curated fields share the same UsageRecord identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - future GUI-ROUTE-001 fixture suite
risk_class: usage_route_payload_identity_drift
reasoning_tier: high
context_scope: gui_usage_route_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_usage_route_subject_payload_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Contracts_V0.md:619-719"
  - "Plans/Contracts_V0.md:5665-5676"
  - "Plans/storage-plan.md:109"
  - "Plans/UI_Command_Catalog.md:1121-1122"
  - "Plans/Runtime_Artifacts_Panel.md:316"
preserved_exact_tokens:
  - route_target.object_kind = usage_event
  - object_id
  - OpenSubject
  - usage_event_ref
  - usage_record_id
  - provider_attempt_ref
  - raw_payload_ref
  - source_confidence
  - settlement_status
negative_constraints:
  - Do not let usage_event_ref bypass object-first route normalization.
  - Do not use timestamp, run_id, thread_id, or tier_id as primary Usage route identity when usage_event_ref exists.
  - Do not expose unredacted Raw provider payloads through route/open payloads.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
```
