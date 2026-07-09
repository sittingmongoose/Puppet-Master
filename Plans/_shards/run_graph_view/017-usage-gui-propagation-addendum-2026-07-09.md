# Shard 017: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Run_Graph_View.md`

Source lines: L1084-L1141

Source SHA256: `1f1d5e7807c054cf621c148e1fad35df3dfb65b3eea61805a8bafec81c974649`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Run Graph usage/cost overlays to UsageRecord identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RGV-016 - Usage Cost Overlay Identity Contract

```yaml
plan_unit_id: RGV-016
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph usage and cost overlays consume UsageRecord projection packets. Node, attempt, edge, and detail-panel usage rows carry usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, dedupe_key, parent_usage_record_id, source_class, source_confidence, source_authority, settlement_status, cost_status, quota_state, projection_freshness, projection_health, and counting_semantics where available. `View in Usage` routes by object_kind = usage_event and object_id from usage_event_ref; run_id, thread_id, tier_id, and timestamp remain filters, labels, or degraded fallback only.
gui_related: true
gui_classification_reason: Run Graph overlays and detail-panel usage actions are visible GUI.
depends_on: [RGV-006, UF-087, UF-088, CV-316, RAP-044]
unblocks: []
acceptance_criteria:
  - Run Graph usage rows show source_class, source_confidence, settlement_status, projection_freshness, and cost/quota unknown or hidden states beside visible totals.
  - "`View in Usage` emits route_target.object_kind = usage_event when usage_event_ref is present and preserves attempt/provider/trace/receipt refs."
  - Partial, aborted, retried, escalated, adjusted, and failed attempts preserve child usage refs and dedupe_key without double-counting the graph rollup.
  - Graph fixtures fail tier_id, timestamp, run-only, or thread-only primary usage routing when usage_event_ref is available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Run Graph Usage overlay fixture suite
risk_class: run_graph_usage_identity_drift
reasoning_tier: high
context_scope: run_graph_usage_overlay
implementation_surfaces:
  - Plans/Run_Graph_View.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: run_graph_usage_overlay_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Run_Graph_View.md:325-333"
  - "Plans/Run_Graph_View.md:491-535"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:281-316"
preserved_exact_tokens:
  - View in Usage
  - usage_event_ref
  - provider_attempt_ref
  - dedupe_key
  - settlement_status
  - counting_semantics
negative_constraints:
  - Do not let Run Graph mint usage authority or recompute provider costs.
  - Do not use tier_id, timestamp, run_id, or thread_id as primary usage route identity when usage_event_ref exists.
  - Do not hide partial/aborted/retried child usage refs behind parent-only totals.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
```
