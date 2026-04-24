## 4. Data model and identity
Graph projection identity is anchored by:
- `project_id`
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence?`
- `graph_generation_id?`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`

Focused-run routing state is anchored by:
- `active_run_id`
- `focused_run_id`
- `focus_mode = live | historical`

Rules:
- usage correlation resolves through canonical usage identity such as `usage_event_ref` and runtime attribution fields, not by `tier_id`
- runtime artifacts link through `artifact_id`, `provider_attempt_ref`, `usage_event_ref`, and external receipt refs as bridges rather than as replacement primary keys
- cross-tab deep links, graph pivots, and search pivots MUST resolve against `focused_run_id` when present
- focused-run routing MUST remain coherent for both live and historical views

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
