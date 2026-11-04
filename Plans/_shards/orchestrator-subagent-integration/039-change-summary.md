# Shard 039: Change Summary

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6252-L6258

Source SHA256: `a9c9b254073e29133da61ac15e895350b1bcd9097149180c1b24d8f505e24ce6`

---

## Change Summary

- 2026-02-26: Added capability introspection and media-generation gating requirement: Orchestrator MUST call `capabilities.get` before dispatching `media.generate`; gates execution on real-time capability state. SSOT: `Plans/Media_Generation_and_Capabilities.md`. ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM
- 2026-02-24: Updated **plan graph consumption (user projects)** so Puppet Master orchestrator consumes **SHARDED-ONLY** plan graphs and executes headless from `.puppet-master/project/plan_graph/index.json` + `.puppet-master/project/plan_graph/nodes/<node_id>.json`.
- 2026-02-24: Locked decision: no canonical `.puppet-master/project/plan_graph.json`; monolithic derived export (if materialized) lives at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`; the sharded representation is the sole canonical choice.
- 2026-02-24: Made required user-project artifacts explicit under `.puppet-master/project/` (requirements.md, contracts/, plan.md, plan_graph shards, acceptance_manifest.json, auto_decisions.jsonl) and reaffirmed canonical persistence in seglog.
- 2026-02-24: Added sharding/consumption rules (deterministic `node_id`, minimum required fields for `index.json` and node shards, and `edges.json` consistency validation).
