# Shard 007: GATE-001 -- Schema validation (anti-drift core)

Source: `Plans/Progression_Gates.md`

Source lines: L213-L228

Source SHA256: `04fa25266602369dfd1e39048bb64567490865af81a8aed55236c5b8f9fdd785`

---

## GATE-001 -- Schema validation (anti-drift core)
**Pass condition:** All schema-validated artifacts parse as JSON and validate against their schemas:
- `Plans/plan_graph.json` vs `Plans/plan_graph.schema.json`
- Evidence bundles (`evidence.json`) vs `Plans/evidence.schema.json`
- Change budgets (embedded) vs `Plans/change_budget.schema.json`
- Auto decisions (JSONL rows) vs `Plans/auto_decisions.schema.json`

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with a `checks[]` entry for each schema validation.  
  ContractRef: SchemaID:evidence.schema.json

ContractRef: SchemaID:plan_graph.schema.json, SchemaID:evidence.schema.json, SchemaID:change_budget.schema.json, SchemaID:auto_decisions.schema.json

---

<a id="GATE-002"></a>
