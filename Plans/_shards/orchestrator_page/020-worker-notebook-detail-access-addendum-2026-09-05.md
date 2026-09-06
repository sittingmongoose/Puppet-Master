# Shard 020: Worker Notebook Detail Access Addendum (2026-09-05)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2689-L2722

Source SHA256: `cd66bb447f461b390142bf4edc41ced7d57085e271e0085e54aab67885c58689`

---

## Worker Notebook Detail Access Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. The Orchestrator exposes notebook access for the selected run/worker through existing detail surfaces: the SubagentWave/worker inspector rows (OP-022 patterns) gain a notebook entry point rendering the worker_lineage/coordinator_run notebook with author, epistemic kind, freshness, evidence refs, and included-context status, under OP-006 projection-trust freshness (stale/degraded/unavailable disables mutation). No new rail or tab is added; a trivially empty worker notebook renders a positive empty state, and notebook data never becomes scheduling or completion truth (OSI-436).

```yaml
plan_unit_id: OP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: Notebook access for the selected run/worker attaches to existing Orchestrator detail surfaces (worker inspector rows) under projection-trust freshness rules, rendering author, epistemic kind, freshness, evidence, and included-context status. No new rail or tab exists; empty states are positive; notebook data never becomes scheduling or completion truth.
gui_related: true
gui_classification_reason: This unit is Orchestrator Page detail-surface notebook behavior.
depends_on: [OP-034, OSI-437]
unblocks: []
acceptance_criteria:
  - Selected run/worker detail reaches its notebook without a new rail.
  - Stale/degraded projections disable notebook mutation like every mutating surface.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: untruthful_projection
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: gui_surface_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I02
preserved_exact_tokens: ["projection_state", "existing detail surfaces", "positive empty state"]
negative_constraints:
  - Do not derive node status from notebook data.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Working_Notebook.md
