## 3. Schema alignment (critical; do not rename fields)

This document uses the exact terminology/field names of the canonical schemas under `Plans/`:

- `Plans/project_plan_graph_index.schema.json` (`pm.project-plan-graph-index.v1`)
  - index `nodes[].path`, `nodes[].sha256`
  - index `schema_version`, `entrypoints`, `execution_ordering`, `validation.targets`
- `Plans/project_plan_node.schema.json` (`pm.project-plan-node.v1`)
  - node `contract_refs`, `evidence_required`, `allowed_tools`, `tool_policy_mode`, `policy_mode`, `change_budget`,
    `blockers`, `unblocks`, `status`, `evidence_pointer`, `verifier_result`, `decision_refs`, `spec_lock_requirements`
    (and optional `depends_on`)
- `pm.project-plan-graph.v1` (optional derived monolithic export)
  - `plan_graph/exports/plan_graph.monolithic.json` is a monolithic wrapper over the same node object fields as `pm.project-plan-node.v1` (inlined nodes), plus graph-level `graph_id`, `entrypoints`, and `validation.targets`.
- `Plans/contracts_index.schema.json` (`pm.project_contracts_index.schema.v1`)
- `Plans/acceptance_manifest.schema.json` (`pm.acceptance_manifest.schema.v1`)
- `Plans/auto_decisions.schema.json` (`pm.auto_decisions.schema.v1`)
- `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)

The schemas are authoritative; this doc defines **paths, sharding, DRY requirements, and cross-file integrity rules**.

