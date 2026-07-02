# Shard 017: GATE-013 -- Ambiguity marker resolution

Source: `Plans/Progression_Gates.md`

Source lines: L437-L479

Source SHA256: `ee317f3f4b90686b4b5f04cda15081d9510deb47832c773857b52334b4bdda34`

---

## GATE-013 -- Ambiguity marker resolution
**Canonical ambiguity marker format:** `<!-- AMBIGUOUS: <id> <description> -->` (HTML comment; works in Markdown and JSON strings).

Example: `<!-- AMBIGUOUS: AMB-001 Unclear whether this requirement applies to guest users -->`

**Pass conditions (ALL must hold):**
1. No unresolved ambiguity markers matching `<!-- AMBIGUOUS: <id> ... -->` exist in any of:
   - `.puppet-master/project/requirements.md`
   - `.puppet-master/project/plan.md`
   - Any file under `.puppet-master/project/contracts/` (contract fragments)
2. For each ambiguity marker ID that appears in any of the above files, a corresponding entry MUST exist in `.puppet-master/project/auto_decisions.jsonl` where the `applied_to[]` array contains the marker ID (e.g., `"AMB-001"`).  
   ContractRef: Gate:GATE-013, ContractName:Plans/Decision_Policy.md
3. The `auto_decisions.jsonl` entry MUST validate against `Plans/auto_decisions.schema.json`.  
   ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, ContractName:Plans/Decision_Policy.md

**Ambiguity marker resolution rule (normative):**
- An ambiguity is unresolved only when an active `<!-- AMBIGUOUS: ... -->` marker lacks a matching schema-valid auto-decision row.
- Historical auto-decision rows MAY remain in `.puppet-master/project/auto_decisions.jsonl` after the corresponding marker is removed from current artifacts.
- Duplicate active ambiguity IDs in the current artifact set are a gate failure.

ContractRef: Gate:GATE-013, SchemaID:pm.auto_decisions.schema.v1

**Deterministic detection rules:**
- Scan: `grep -rn '<!-- AMBIGUOUS:' .puppet-master/project/requirements.md .puppet-master/project/plan.md .puppet-master/project/contracts/`
- For each match, extract the marker ID (second token after `AMBIGUOUS:`).
- Look up the marker ID in `.puppet-master/project/auto_decisions.jsonl` via `applied_to[]` field.
- If any marker ID has no corresponding `auto_decisions.jsonl` entry with a matching `applied_to[]` element: FAIL.
- If the scan returns zero matches AND `auto_decisions.jsonl` contains no entries with marker IDs in `applied_to[]`: PASS (no ambiguities exist).

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
  - Grep scan result (zero unresolved markers or full list matched to decisions)
  - For each resolved marker: the `decision_id` from the matching `auto_decisions.jsonl` row
  - Schema validation of each referenced `auto_decisions.jsonl` row against `pm.auto_decisions.schema.v1`  
  ContractRef: SchemaID:evidence.schema.json

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after traceability artifact generation is integrated.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, SchemaID:evidence.schema.json, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Project_Output_Artifacts.md

---

<a id="GATE-014"></a>
