# Progression Gates (Canonical)

<!--
PUPPET MASTER -- PROGRESSION / VERIFICATION GATES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This file defines deterministic gates used to validate plan quality and implementation evidence.

ContractRef: Primitive:Gate

---

## 1. Verifier role (AI-only; deterministic)
The Verifier is an AI role that runs these gates and returns a binary PASS/FAIL result.

**Hard rules:**
- The Verifier MUST run gates exactly as written here (no discretionary skipping).  
  ContractRef: Primitive:Gate
- The Verifier MUST block progression when any gate fails.  
  ContractRef: Primitive:Gate
- The Verifier MUST NOT require a human to read logs or approve decisions; it relies only on machine-checkable artifacts (schemas, evidence bundles, deterministic lints).  
  ContractRef: PolicyRule:Decision_Policy.md§4

**Execution contract (recommended):**
- Implement a repo-local verifier command that can be invoked headlessly, e.g. `python3 scripts/pm-plans-verify.py run-gates`.  
  ContractRef: SchemaID:plan_graph.schema.json

**Current script-enforceable coverage (`run-gates`):**
- `GATE-001` schema validation (plan graph + node change budgets + auto decisions)
- `GATE-002` Spec Lock integrity (SSOT hash verification)
- `GATE-004` drift phrase lint (`TBD`, `Open Questions`, `ask later`)
- `GATE-005` non-example node evidence existence + schema validation
- `GATE-006` non-example node change-budget declaration checks
- `GATE-009` ContractRef coverage lint

ContractRef: Gate:GATE-001, Gate:GATE-002, Gate:GATE-004, Gate:GATE-005, Gate:GATE-006, Gate:GATE-009

---

<a id="GATE-001"></a>
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
## GATE-002 -- Spec Lock integrity
**Pass condition:**
- `Plans/Spec_Lock.json` pins schema versions and locked decisions, and
- every `canonical_ssot_hashes.files[*].sha256` matches the current file contents for the listed SSOT files.

Required evidence:
- Evidence bundle entry that includes a Spec Lock hash verification report (must be empty / no mismatches).  
  ContractRef: SchemaID:evidence.schema.json

ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

---

<a id="GATE-003"></a>
## GATE-003 -- Architecture invariants
**Pass condition:** All referenced invariants hold for the change under test.

Minimum checks:
- `INV-002` secrets rule is not violated (no secrets in logs/state/events/evidence).
- `INV-010` naming rule is not violated in user-visible docs/strings.

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json`.
- A grep/audit summary showing no token-like strings persisted (implementation-specific).

**Script enforcement status:** Not currently enforced by `run-gates`; this gate is validated by dedicated invariant checks in implementation-specific verifiers.

ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json

---

<a id="GATE-004"></a>
## GATE-004 -- Forbidden deps + drift phrases
**Pass condition:**
- No build-governing doc introduces forbidden dependencies from Spec Lock, and
- no drift phrases exist in build-governing docs: `TBD`, `Open Questions`, `ask later`.

**Script enforcement status:** `run-gates` currently enforces the drift-phrase half of this gate.

ContractRef: SchemaID:Spec_Lock.json#forbidden_deps, ContractName:Plans/DRY_Rules.md#4

---

<a id="GATE-005"></a>
## GATE-005 -- Evidence required for completion
**Pass condition:** A node cannot be marked complete unless its evidence bundle exists and validates.

**Script enforcement status:** `run-gates` enforces this gate for non-example nodes in `Plans/plan_graph.json`.

ContractRef: SchemaID:evidence.schema.json, SchemaID:plan_graph.schema.json

---

<a id="GATE-006"></a>
## GATE-006 -- Change budget enforcement
**Pass condition:** The actual change stays within the node’s declared change budget (max files, LOC delta, allowed/forbidden paths/files).

**Script enforcement status:** `run-gates` enforces non-example node change-budget declaration completeness and schema validity (including bounded change fields).

ContractRef: SchemaID:change_budget.schema.json, SchemaID:plan_graph.schema.json

---

<a id="GATE-009"></a>
## GATE-009 -- ContractRef coverage
**Pass condition:** Every operational requirement line contains at least one `ContractRef:`.

Deterministic detection:
- Operational requirement line contains: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

Required evidence:
- A report listing all operational lines missing `ContractRef:` (must be empty).

ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/DRY_Rules.md#9

---

<a id="GATE-010"></a>
## GATE-010 -- Wiring matrix validation
**Pass condition:** The UI wiring matrix is complete, valid, and testable:
1. `Plans/Wiring_Matrix.schema.json` parses as valid JSON Schema.
2. All wiring matrix artifacts validate against `Plans/Wiring_Matrix.schema.json`.
3. Every wiring entry key is a unique `ui_element_id`, and each row's `ui_element_id` value matches its containing key.
4. Every `UICommandID` in `Plans/UI_Command_Catalog.md` has at least one wiring matrix entry.
5. Every wiring matrix entry's `handler_location` resolves to an existing module/function in the codebase.
6. Every wiring matrix entry with non-empty `expected_event_types` has a corresponding test that exercises command dispatch and verifies the declared events are emitted.
7. No dead commands: UICommandIDs referenced in code but absent from the catalog are flagged.

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries for schema validation, coverage, handler resolution, and event emission tests.

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after wiring matrix is populated with non-example entries.

ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-011, Invariant:INV-012

---

## References
- `Plans/DRY_Rules.md`
- `Plans/Architecture_Invariants.md`
- `Plans/evidence.schema.json`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
