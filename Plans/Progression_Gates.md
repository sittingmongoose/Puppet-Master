# Progression Gates (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


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
- `GATE-011`, `GATE-012`, `GATE-013` target the traceability layer (not yet enforced by `run-gates`; pending traceability artifact generation integration)

ContractRef: Gate:GATE-001, Gate:GATE-002, Gate:GATE-004, Gate:GATE-005, Gate:GATE-006, Gate:GATE-009, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013

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

<a id="GATE-011"></a>
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
## GATE-012 -- Requirements quality
**Pass conditions (ALL must hold):**
1. `.puppet-master/project/traceability/requirements_quality_report.json` exists.
2. The file validates against schema `pm.requirements_quality_report.schema.v1` (cross-ref: `Plans/requirements_quality_report.schema.json`).
3. `verdict == "PASS"`.
4. `needs_user_clarification[]` is empty (length == 0).

**BLOCKED state (deterministic):**
- If `needs_user_clarification[]` is non-empty after a Puppet Master run, the gate enters BLOCKED state.
- In BLOCKED state: Puppet Master MUST NOT advance to the next plan node; instead it MUST surface each clarification item to the user via the UI escalation path (thread badge + in-thread clarification message + dashboard CtA).  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md
- Puppet Master MUST NOT auto-resolve clarification items; each item MUST be resolved by explicit user input before re-running the gate.  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md
- Once the user resolves all items and the quality agent re-runs, producing `needs_user_clarification[] == []` and `verdict == "PASS"`, the gate transitions to PASS and progression resumes.

**Deterministic gate outcomes:**
- PASS: Conditions 1–4 hold.
- BLOCKED: Conditions 1–2 hold and `needs_user_clarification[]` is non-empty.
- FAIL: Missing/invalid report artifact (conditions 1–2 fail), or `needs_user_clarification[]` is empty while `verdict != "PASS"`.
ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
   - Schema validation of `requirements_quality_report.json` against `pm.requirements_quality_report.schema.v1`
   - Deterministic gate-state classification evidence (`PASS` | `BLOCKED` | `FAIL`) derived from `verdict` + `needs_user_clarification[]`
   - PASS-path assertions (required when classified as PASS): `verdict == "PASS"` and `needs_user_clarification[]` is empty
   - BLOCKED-path escalation evidence (required when `needs_user_clarification[]` is non-empty):
     - Thread state transitioned to `attention_required` with unanswered-question count equal to `len(needs_user_clarification[])` (thread badge evidence).  
       Cross-ref: `Plans/assistant-chat-design.md §11.1`
     - A dashboard clarification Call to Action was emitted and linked to the same clarification scope (wizard/thread context), consistent with dashboard CtA behavior.  
       Cross-ref: `Plans/assistant-chat-design.md §21`
     - Clarification request payload/message evidence includes all `question_id`s from `needs_user_clarification[]` (no omissions).  
       Cross-ref: `Plans/assistant-chat-design.md §11.2`
   - Unblock/re-run evidence (required before progression resumes from BLOCKED): subsequent report shows `needs_user_clarification[] == []` and `verdict == "PASS"`.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-012, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§6

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after traceability artifact generation is integrated.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Gate:GATE-012, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

---

<a id="GATE-013"></a>
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

## References
- `Plans/DRY_Rules.md`
- `Plans/Architecture_Invariants.md`
- `Plans/Decision_Policy.md`
- `Plans/evidence.schema.json`
- `Plans/auto_decisions.schema.json`
- `Plans/Project_Output_Artifacts.md`
- `Plans/requirements_coverage.schema.json`
- `Plans/requirements_quality_report.schema.json`
- `Plans/human-in-the-loop.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
