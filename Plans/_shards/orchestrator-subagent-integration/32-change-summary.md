## Change Summary

- 2026-02-24: Updated **plan graph consumption (user projects)** so Puppet Master orchestrator consumes **SHARDED-ONLY** plan graphs and executes headless from `.puppet-master/project/plan_graph/index.json` + `.puppet-master/project/plan_graph/nodes/<node_id>.json`.
- 2026-02-24: Locked decision: no canonical `.puppet-master/project/plan_graph.json`; monolithic derived export (if materialized) lives at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`; the sharded representation is the sole canonical choice.
- 2026-02-24: Made required user-project artifacts explicit under `.puppet-master/project/` (requirements.md, contracts/, plan.md, plan_graph shards, acceptance_manifest.json, auto_decisions.jsonl) and reaffirmed canonical persistence in seglog.
- 2026-02-24: Added sharding/consumption rules (deterministic `node_id`, minimum required fields for `index.json` and node shards, and `edges.json` consistency validation).
