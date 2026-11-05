# Shard 007: GATE-001 -- Schema validation (anti-drift core)

Source: `Plans/Progression_Gates.md`

Source lines: L220-L235

Source SHA256: `28b32843c89be43a1e730dae715652ef22f99c911144c83f89b42fd938ba22b9`

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
