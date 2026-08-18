# Shard 009: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Widget_System.md`

Source lines: L1017-L1077

Source SHA256: `7e7cc7c4a88a4fe7766f2f08e3cbec180ca48744d83610581004317f5f6052b7`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum constrains Dashboard-hosted Usage widgets without expanding the Dashboard catalog beyond owner-approved widgets. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### WS-015 - Usage Widget Value-State Contract

```yaml
plan_unit_id: WS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Dashboard-hosted Usage widgets are consumers of the canonical UsageRecord projection and FinalGUISpec value-state matrix. A Usage widget may summarize token, context, cost, quota, cache, reasoning, provider_total, context_estimate, Antigravity credits, or provider pressure only when it carries value_state, source_class, source_confidence, settlement_status, projection_freshness, and reason for degraded/unknown/hidden/disabled values. If the Dashboard does not promote a Usage widget in a given build, the Add Widget catalog shows Usage unavailable rather than silently substituting a simplified spend widget.
gui_related: true
gui_classification_reason: Dashboard widgets and Add Widget catalog behavior are visible GUI surfaces.
depends_on: [WS-013, F3-418, UF-087]
unblocks: []
acceptance_criteria:
  - Any Usage widget row renders disabled, not_exposed, unknown, stale, estimated, hidden_byok, hidden_subscription, streaming_partial, adjusted, failed, provider-reported zero, cache zero, and cache unsupported as distinct display states.
  - Usage widget fixtures cover no-double-count behavior for cache and reasoning inclusive/exclusive semantics.
  - Add Widget catalog either exposes a named Usage widget with this contract or marks Usage widget hostability unavailable with a reason; it must not expose an unowned placeholder widget.
  - Dashboard widget rollups use usage_event_ref or UsageRecord aggregation refs and never timestamp/run/thread/tier-only joins for accounting identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Dashboard Usage widget fixture suite
risk_class: dashboard_usage_widget_false_zero
reasoning_tier: high
context_scope: widget_usage_projection
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: widget_usage_value_state_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Widget_System.md:65-70"
  - "Plans/Widget_System.md:830-889"
  - "Plans/FinalGUISpec.md:1265-1293"
  - "Plans/FinalGUISpec.md:18585-18680"
  - "Plans/usage-feature.md:5412-5605"
preserved_exact_tokens:
  - Dashboard
  - Usage widget
  - Add Widget
  - value_state
  - source_confidence
  - usage_event_ref
  - cache zero
  - unsupported
negative_constraints:
  - Do not add a Dashboard Usage widget that bypasses UF-085/UF-087 projections.
  - Do not render unavailable Usage widget hostability as an empty zero widget.
  - Do not let Dashboard rollups become the canonical Usage schema owner.
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
```
