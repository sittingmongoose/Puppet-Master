# Shard 015: GATE-011 -- Requirements traceability coverage

Source: `Plans/Progression_Gates.md`

Source lines: L337-L381

Source SHA256: `1662dae45b80cff576a398c163bae48c6cc47ff005bfb274a64d9e6066a2dd4c`

---

## GATE-011 -- Requirements traceability coverage


**Pass conditions (ALL must hold; deterministic, no soft thresholds, no flag-driven overrides):**

1. `.puppet-master/project/traceability/requirements_coverage.json` exists **and** validates against schema `pm.requirements_coverage.schema.v1` (cross-ref: `Plans/requirements_coverage.schema.json`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
2. `.puppet-master/project/traceability/requirements_coverage.md` exists and all requirement IDs listed in the Markdown file match the JSON exactly — no additions, no omissions.  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
3. `uncovered_requirements[]` is empty (equivalent: `summary.uncovered == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
4. `orphaned_node_requirement_refs[]` is empty (equivalent: `summary.orphaned_refs == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, Gate:GATE-011
5. `uncovered_acceptance[]` is empty (equivalent: `summary.uncovered_acceptance_count == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
6. Every requirement in `requirements[]` maps to **at least one plan node** and **at least one acceptance check**:
   - `len(requirements[i].node_ids) >= 1`
   - `len(requirements[i].acceptance_check_ids) >= 1`  
   Deterministic enforcement: produce a machine-checkable violation list of `req_id`s that fail either predicate; list MUST be empty.  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md§11.4, Gate:GATE-011
7. Integrity checks 1–8 from `Plans/Project_Output_Artifacts.md §11.4` all pass (count consistency, list consistency, JSON↔MD sync, schema validity).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011

**Fail condition:** Any pass condition (1–7) fails.  
ContractRef: Gate:GATE-011

**Required evidence:**
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
   - `requirements_coverage_json_validates` — JSON validates against `pm.requirements_coverage.schema.v1`
   - `requirements_coverage_md_sync` — Markdown req IDs match JSON exactly (no additions, no omissions)
   - `no_uncovered_requirements` — `uncovered_requirements[]` empty
   - `no_orphaned_refs` — `orphaned_node_requirement_refs[]` empty
   - `no_uncovered_acceptance` — `uncovered_acceptance[]` empty
   - `per_requirement_minimum_mappings` — deterministic report proving every `req_id` has `node_ids >= 1` and `acceptance_check_ids >= 1` (violation list empty)
   - `integrity_checks_pass` — all integrity rules from `Plans/Project_Output_Artifacts.md §11.4` pass  
  - Evidence payload MUST include machine-readable failure detail fields for each check (for example `missing_in_md_ids[]`, `missing_in_json_ids[]`, `uncovered_requirement_ids[]`, `orphaned_refs[]`, `uncovered_acceptance_ids[]`, `missing_node_mapping_req_ids[]`, `missing_acceptance_mapping_req_ids[]`); all lists MUST be empty on PASS.  
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-011

**Script enforcement status:** Not currently enforced by `run-gates`; targeted for future enforcement after traceability tooling is in place.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:evidence.schema.json, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

---

<a id="GATE-012"></a>
