## 9. Acceptance criteria (validator requirements)

A validator MUST be able to verify, at minimum:

ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009, ContractName:Plans/Project_Output_Artifacts.md

1) **Sharded graph validity (canonical headless input)**
   - `.puppet-master/project/plan_graph/index.json` validates (`pm.project-plan-graph-index.v1`)
   - all `nodes[].path` resolve to `plan_graph/nodes/<node_id>.json`
   - `entrypoints` refer to existing node IDs
2) **Shard integrity**
   - each `nodes[].sha256` matches the referenced node shard bytes
3) **Contract reference validity (DRY)**
   - `.puppet-master/project/contracts/index.json` validates (`pm.project_contracts_index.schema.v1`)
   - every `ProjectContract:*` referenced by any node `contract_refs` resolves via `contracts/index.json`
4) **Acceptance coverage**
   - `.puppet-master/project/acceptance_manifest.json` validates (`pm.acceptance_manifest.schema.v1`)
   - each node’s `acceptance[].check_id` is present in the manifest under that node
   - acceptance checks include relevant `ProjectContract:*` references via `contract_refs`
5) **Seglog hash matches**
   - seglog `content_hash` matches the SHA-256 of the materialized artifact bytes for each `logical_path`
   - plan graph shard hashes in `index.json` (`nodes[].sha256`) match the same materialized bytes
6) **Headless orchestration from sharded plan graph**
   - orchestration can run headless from `plan_graph/index.json` + referenced node shards alone
   - no dependency on `plan.md`, GUI artifacts, or optional monolithic exports for ordering/policy enforcement

ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009

7) **Optional derived export consistency (if present)**
   - `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` validates (`pm.project-plan-graph.v1`)
   - it is consistent with the canonical sharded graph (same node IDs, same node fields, same `entrypoints`)

8) **Validation sweep artifact completeness (see §10)**
   - Exactly three `validation_pass_report` events in seglog for each validation sweep run (pass_number 1, 2, 3 sharing the same `workflow_run_id`)
   - Pass 3 report `changes_applied_summary` contains no write-protected artifact paths (no requirements.md, plan.md); derived outputs such as `quickstart.md` may be regenerated
   - All pass report `content_hash` values match the SHA-256 of their `content_bytes`
   - For each pass number `N`, report `provider` and `model` match resolved app settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` from sweep start (`Plans/assistant-chat-design.md §26`)
   - Reports come from a deterministic, headless sweep with no human approval gates between Pass 1, Pass 2, and Pass 3 (`Plans/chain-wizard-flexibility.md §12`)

9) **Post-pass artifact finality**
   - The canonical `.puppet-master/project/**` artifact tree validated by this document MUST represent the post-sweep artifact set (after Pass 2 and Pass 3 corrections for the associated `workflow_run_id`)
   - Validator hash checks apply to post-pass corrected bytes, not pre-sweep intermediates
ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md

10) **Traceability output integrity (see §11)**
    - `.puppet-master/project/traceability/requirements_quality_report.json` validates against `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)
    - `.puppet-master/project/traceability/requirements_coverage.json` validates against `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`)
    - `summary.total_requirements` == `len(requirements[])`
    - `summary.covered` + `summary.partially_covered` + `summary.uncovered` == `summary.total_requirements`
    - `len(uncovered_requirements[])` == `summary.uncovered`
    - `len(orphaned_node_requirement_refs[])` == `summary.orphaned_refs`
    - `len(uncovered_acceptance[])` == `summary.uncovered_acceptance_count`
    - `requirements_coverage.md` requirement ID lists match `requirements_coverage.json` exactly
11) **Quickstart integrity (if present — see §12)**
    - `.puppet-master/project/quickstart.md` is derived convenience output only
    - orchestration, planning, and validator correctness MUST NOT depend on `quickstart.md`
    - each executable command line in `quickstart.md` MUST exist verbatim in `.puppet-master/project/acceptance_manifest.json` (`nodes[].checks[].commands[].cmd`)
    - `quickstart.md` command count MUST be <= 20 and file size MUST be <= 16384 bytes

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

