## 11. Traceability outputs

This section defines the **normative generation rules and integrity requirements** for derived verification outputs under `.puppet-master/project/traceability/`. These files are:
- **derived** (not planning inputs)
- **non-canonical** with respect to planning decisions
- **canonical** with respect to verification outputs (requirements quality + coverage reports)

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011

### 11.1 `traceability/requirements_quality_report.json` (machine-readable)

- Path: `.puppet-master/project/traceability/requirements_quality_report.json`
- Schema: `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)
- This artifact is derived from requirements quality analysis and is verification-canonical (non-canonical for planning decisions).

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1

### 11.2 `traceability/requirements_coverage.json` (machine-readable)

- Path: `.puppet-master/project/traceability/requirements_coverage.json`
- Schema: `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`)

ContractRef: SchemaID:pm.requirements_coverage.schema.v1

**Generation procedure (normative; executed in order):**

#### Step 1 — Requirements source: `.puppet-master/project/requirements.md`

- Requirement ID extraction rule: any line matching  
  `^\s*[-*]?\s*(FR-[0-9]{3,}|NFR-[0-9]{3,}|REQ-[0-9]{3,})\b`  
  OR a heading matching  
  `^#+\s*(FR-[0-9]{3,}|NFR-[0-9]{3,}|REQ-[0-9]{3,})\b`
- The **first capture group** is the requirement ID; the remainder of the line (trimmed) is the description.
- The extracted ID set is the **authoritative set of known requirements** for this coverage run.
- Each extracted requirement is recorded in `requirements[]` with initial `node_ids: []`, `acceptance_check_ids: []`, `coverage_status: "uncovered"`.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1

#### Step 2 — Node `requirement_refs` source: `.puppet-master/project/plan_graph/nodes/*.json`

- Each node shard (schema: `pm.project-plan-node.v1`) MAY contain an optional `requirement_refs: string[]` field.
- For each `req_id` in a node's `requirement_refs`:
  - If `req_id` appears in the requirements set from Step 1: add the node's `node_id` to that requirement's `node_ids[]`.
  - If `req_id` does NOT appear in the requirements set: record it in `orphaned_node_requirement_refs[]` as  
    `{ "req_id": "<req_id>", "node_id": "<node_id>", "reason": "req_id_not_in_requirements_md" }`.

ContractRef: SchemaID:pm.project-plan-node.v1

#### Step 3 — Acceptance mapping source: `.puppet-master/project/acceptance_manifest.json`

- Each acceptance check entry MUST declare `req_id` when that check is intended to provide requirement coverage evidence.
- If `req_id` exists in the requirements set, add the check's `check_id` to that requirement's `acceptance_check_ids[]`.
- Checks with no `req_id` are allowed, but they do not contribute to requirements coverage.

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

- Schema: `pm.acceptance_manifest.schema.v1`.
- For each acceptance check that contains a `req_id` field: if `req_id` exists in the Step 1 requirements set, add the check's ID to that requirement's `acceptance_check_ids[]`.
- Checks with no `req_id` field are not included in coverage mapping (this is not an error).
- Acceptance checks with a `req_id` that does not appear in the requirements set MUST be ignored for `uncovered_acceptance[]` computation (schema semantics for `uncovered_acceptance[]` are requirement-centric, not unknown-check-centric).

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

#### Coverage status determination (normative)

For each requirement in `requirements[]`:

| Condition | `coverage_status` |
|-----------|-------------------|
| `len(node_ids) >= 1` AND `len(acceptance_check_ids) >= 1` | `"covered"` |
| `len(node_ids) >= 1` AND `len(acceptance_check_ids) == 0` | `"partially_covered"` |
| `len(node_ids) == 0` | `"uncovered"` |

#### `uncovered_acceptance[]` population rule (normative; schema-aligned)

After coverage statuses are computed, `uncovered_acceptance[]` MUST contain exactly the requirements where:
- `len(node_ids) >= 1`
- `len(acceptance_check_ids) == 0`

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

Each entry MUST be:
`{ "req_id": "<req_id>", "node_ids": [ ... ], "reason": "no_acceptance_check_maps_to_this_requirement" }`.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/requirements_coverage.schema.json

#### Summary block (normative)

The `summary` object MUST be computed after all three steps:

- `total_requirements`: `len(requirements[])`
- `covered`: count of requirements with `coverage_status == "covered"`
- `partially_covered`: count of requirements with `coverage_status == "partially_covered"`
- `uncovered`: count of requirements with `coverage_status == "uncovered"`
- `orphaned_refs`: `len(orphaned_node_requirement_refs[])`
- `uncovered_acceptance_count`: `len(uncovered_acceptance[])`
ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

### 11.3 `traceability/requirements_coverage.md` (human-readable)

- Path: `.puppet-master/project/traceability/requirements_coverage.md`

The Markdown file MUST:

1. Be **regenerated deterministically from `requirements_coverage.json`** (not separately edited).
2. **Match all counts and IDs** from `requirements_coverage.json` exactly.
ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md
3. Include, at minimum:
   - A summary table with covered / partially covered / uncovered counts.
   - A list or table of **covered** requirements (IDs + descriptions).
   - A list or table of **partially covered** requirements (IDs + descriptions; note: planned but not acceptance-tested).
   - A list or table of **uncovered** requirements (IDs + descriptions).
   - A list of **orphaned node `requirement_refs`** (req_ids referenced by nodes but not present in requirements.md).
   - A list of **uncovered acceptance requirements** (requirements with node coverage but no mapped acceptance checks).

### 11.4 Integrity requirements (normative; verifier MUST enforce)

The verifier MUST enforce all of the following checks deterministically:
ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

1. `summary.total_requirements` == `len(requirements[])` — ContractRef: SchemaID:pm.requirements_coverage.schema.v1
2. `summary.covered` + `summary.partially_covered` + `summary.uncovered` == `summary.total_requirements`
3. `len(uncovered_requirements[])` == `summary.uncovered`
4. `len(orphaned_node_requirement_refs[])` == `summary.orphaned_refs`
5. `len(uncovered_acceptance[])` == `summary.uncovered_acceptance_count`
6. Every `req_id` in `uncovered_requirements[]` appears in `requirements[]` with `coverage_status == "uncovered"`
7. `requirements_coverage.md` requirement ID lists MUST match `requirements_coverage.json` exactly (verified by extracting IDs from the Markdown and comparing to the JSON) — ContractRef: SchemaID:pm.requirements_coverage.schema.v1
8. `requirements_coverage.json` MUST validate against `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`) — ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
9. `requirements_quality_report.json` MUST validate against `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`) — ContractRef: SchemaID:pm.requirements_quality_report.schema.v1

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011

### 11.5 Seglog persistence (traceability outputs)

Traceability outputs MUST be persisted to seglog as `artifact_type` values `requirements_quality_report`, `requirements_coverage_json`, and `requirements_coverage_md` (see §8.2) following the standard seglog field contract (§8.1). The filesystem files under `.puppet-master/project/traceability/` are regenerable from seglog.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog

