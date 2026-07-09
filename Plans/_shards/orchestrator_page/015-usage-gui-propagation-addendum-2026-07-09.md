# Shard 015: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Orchestrator_Page.md`

Source lines: L2335-L2394

Source SHA256: `0c6d1ada4d9b06aad07ece508a27891ce1095685fb890b946181a1f5b3be97f7`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Orchestrator usage/cost rows and actions to UsageRecord identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### OP-029 - Orchestrator Usage Drill-Through Contract

```yaml
plan_unit_id: OP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator usage, cost, ledger, evidence, history, and receipt rows are consumers of UsageRecord projection packets. They display source_class, source_confidence, source_authority, settlement_status, cost_status, quota_state, projection_freshness, projection_health, hidden/background contribution, and dedupe/parent-child refs when usage appears in a row or detail panel. `View in Usage`, `Show in Usage`, and `Show in Ledger` actions route through object_kind = usage_event and object_id from usage_event_ref whenever present, preserving usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, and thread_id as correlation/context fields.
gui_related: true
gui_classification_reason: Orchestrator usage rows and drill-through actions are user-visible GUI.
depends_on: [OP-026, OP-027, UF-087, UF-088, CV-316, RAP-044, RGV-016]
unblocks: []
acceptance_criteria:
  - Orchestrator usage/cost rows render unknown, estimated, disabled, not_exposed, hidden_byok, hidden_subscription, streaming_partial, adjusted, failed, stale, and provider-reported zero as distinct states.
  - Drill-through actions preserve UsageRecord refs and normalize to object_kind = usage_event when usage_event_ref is present.
  - Hidden/background usage contribution is attributed through parent_usage_record_id or child usage refs rather than silently folded into parent-only totals.
  - Orchestrator fixtures fail if Ledger/Usage pivots use timestamp/run/thread/tier as the primary key when usage_event_ref is available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator Usage drill-through fixture suite
risk_class: orchestrator_usage_drillthrough_identity_drift
reasoning_tier: high
context_scope: orchestrator_usage_projection
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_usage_drillthrough_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Orchestrator_Page.md:231-247"
  - "Plans/Run_Graph_View.md:491-535"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:281-316"
preserved_exact_tokens:
  - View in Usage
  - Show in Usage
  - Show in Ledger
  - usage_event_ref
  - provider_attempt_ref
  - hidden/background
  - parent_usage_record_id
negative_constraints:
  - Do not let Orchestrator mint usage, billing, quota, or pricing authority.
  - Do not route usage/cost actions by timestamp, run-only, thread-only, or tier-only keys when usage_event_ref exists.
  - Do not hide background or subagent usage contribution behind a parent total without drill-through refs.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
```
