# Shard 010: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L1291-L1334

Source SHA256: `278f1669db833cc39a6cfb7d04b13716a30e695a411912821ef783aa48af18e6`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### PNC-020 - Discovery WorkNode Intake Future Boundary

```yaml
plan_unit_id: PNC-020
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  WorkNode and Plan-to-Node discovery references are future_boundary_only. They may provide a backlink and future conformance expectation for Plans/Plan_To_Node_Compilation.md, but they are excluded from current runtime conformance proof and compile readiness. This compile creates no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks. Future compiler work must preserve exact verification requirements inherited from source PlanUnits before any runtime enablement.
gui_related: false
gui_classification_reason: This is a Plan-to-Node compiler boundary and execution-artifact constraint.
depends_on: [PNC-001, PNC-004, T-161, OSI-429]
unblocks: [ATS-011]
acceptance_criteria:
  - WorkNode discovery references are future conformance expectations only.
  - Node-readiness/index outputs do not create WorkNodes, NodeSeeds, queues, manifests, launches, implementation files, or build tasks.
  - Runtime conformance proof is not required for the disabled future compiler boundary.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: execution_boundary
reasoning_tier: standard
context_scope: plan_to_node_future_boundary
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: future_boundary_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0030
  - pldg-20260622-001-fff:atom-0037
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#worknode_intake_future_contract
source_atom_ids: [atom-0027, atom-0030, atom-0037, atom-0043, atom-0058, atom-0059, atom-0092, atom-0094]
preserved_exact_tokens: ["future_boundary_only", "WorkNode", "Plan-to-Node", "excluded from current runtime conformance proof", "No WorkNodes", "NodeSeeds", "executable queues", "final node manifests", "runtime launches"]
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.
  - Do not treat future WorkNode intake rows as current runtime readiness or creation permission.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```
