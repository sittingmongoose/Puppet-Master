# Shard 019: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Prompt_Pipeline.md`

Source lines: L4105-L4165

Source SHA256: `9949baba6d481b97dcc92dd4f4c05db820e683d864886982a90c732de54127f0`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds context epochs, compaction, and cache/context usage projection to UsageRecord display contracts. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### PP-073 - Context Epoch Usage Projection Contract

```yaml
plan_unit_id: PP-073
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  ContextEpoch records and compaction projections expose context_estimate, input_total, input_non_cached, cache_read, cache_write, cache_write_1h or TTL-specific cache writes, output_visible, reasoning/thoughts, provider_total, counting_semantics, hidden/background contribution refs, and source_confidence to GUI consumers through UsageRecord/context projections. Compact Now creates a new context epoch or compaction receipt according to chat command rules; it does not rewrite historical UsageRecord totals, erase partial/aborted usage, or convert context_estimate into provider billing authority.
gui_related: true
gui_classification_reason: Context epoch and compaction projections feed the visible chat context circle and Context Detail Pane.
depends_on: [PP-072, UF-087, UF-088, ACD-434]
unblocks: []
acceptance_criteria:
  - Context Detail Pane fixtures show context_estimate as local context pressure only, not billing or quota authority.
  - Compact Now fixtures preserve previous UsageRecord identity and create a new context epoch/receipt without recalculating settled historical costs.
  - Cache fixtures distinguish cache_read = 0 from cache unsupported/not_exposed/unknown and respect provider counting_semantics.
  - Hidden/background contribution refs remain visible in context breakdowns instead of being silently folded into user-message totals.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future context epoch usage projection fixture suite
risk_class: context_epoch_usage_projection_drift
reasoning_tier: high
context_scope: context_epoch_usage_projection
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: context_epoch_usage_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Prompt_Pipeline.md:4830-5020"
  - "Plans/assistant-chat-design.md:1217-1255"
  - "Plans/usage-feature.md:156-194"
  - "Plans/usage-feature.md:5412-5605"
  - "uploaded:opencode-dev/packages/app/src/components/session-context-usage.tsx"
preserved_exact_tokens:
  - ContextEpoch
  - Compact Now
  - context_estimate
  - cache_write_1h
  - output_visible
  - reasoning/thoughts
  - provider_total
  - hidden/background
negative_constraints:
  - Do not convert context_estimate into billing, cost, quota, or provider authority.
  - Do not rewrite historical UsageRecord totals during compaction.
  - Do not render cache unsupported/not_exposed/unknown as cache zero.
owner_hints:
  - Plans/Prompt_Pipeline.md
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```
