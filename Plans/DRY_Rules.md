# DRY Rules (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DRY / SSOT RULES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document defines the anti-drift rules for plan documents:
- how SSOT sources are referenced (instead of duplicated)
- how `ContractRef:` annotations make requirements executable and gateable

ContractRef: Primitive:DRYRules

---

## 1. SSOT precedence (global)
If documents conflict, resolve with:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. This file
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: SchemaID:Spec_Lock.json, Primitive:Crosswalk, PolicyRule:Decision_Policy.md§2

---

## 2. Don't duplicate canonical contracts
Plans MUST reference canonical contracts rather than restating them.

Examples:
- Event envelope → `Plans/Contracts_V0.md#EventRecord`
- UI commands → `Plans/Contracts_V0.md#UICommand` + `Plans/UI_Command_Catalog.md`
- Auth state/events → `Plans/Contracts_V0.md#AuthState` and provider auth plan

ContractRef: ContractName:Contracts_V0.md

---

## 3. "Index-only" guidance
A plan MAY include an index/list of IDs (event kinds, UI command IDs, tool IDs) but MUST NOT redefine schemas owned elsewhere.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 4. Forbidden patterns (drift accelerators)
- `TBD`, `Open question`, `ask later` in plan requirements.
- Vague requirements like "robust", "graceful", "secure" without measurable behavior.
- Duplicating provider CLI details outside Provider SSOT.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 5. MUST/SHALL/REQUIRED implies ContractRef
Any statement using **MUST / SHALL / REQUIRED / NEVER** MUST include at least one `ContractRef:` line.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 6. ContractRef taxonomy (allowed categories)
ContractRef entries are comma-separated.

Allowed categories (minimum):
- `SchemaID:<id>`
- `ContractName:<path>#<anchor>`
- `Primitive:<name>`
- `ToolID:<id>`
- `EventType:<type>`
- `ConfigKey:<key>`
- `PolicyRule:<id>`
- `UICommand:<id>`
- `Invariant:<id>`
- `Gate:<id>`

ContractRef: Primitive:DRYRules

---

<a id="7"></a>
## 7. ContractRef annotation rule (canonical)
**Rule:** Every operational requirement MUST have at least one `ContractRef:`.

Operational requirement detection (deterministic):
- Any line containing: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

ContractRef: ContractName:Plans/Progression_Gates.md#GATE-009

ContractRef format:
```text
... requirement text ...
ContractRef: Primitive:DRYRules, ContractName:Plans/Contracts_V0.md
```

ContractRef: Gate:GATE-009, ContractName:Plans/Progression_Gates.md#GATE-009

---

## 8. Reference style
- Prefer referencing canonical files/anchors over inline duplication.
- Prefer stable anchors (`<a id="..."></a>`) for cross-doc links when heading slugging could change.

ContractRef: Primitive:DRYRules

---

<a id="9"></a>
## 9. No unreferenced operational text
Operational requirements without `ContractRef:` are non-canonical and MUST fail the plan-quality gate.

ContractRef: Gate:GATE-009

---

<a id="10"></a>
## 10. Inline requirement tag convention (readability only)

This convention is **readability-only and non-authoritative**. It provides a lightweight way to annotate requirement references inline in prose — it does NOT constitute traceability evidence.

**Tag format:**
- `Req:FR-001` — functional requirement reference
- `Req:NFR-001` — non-functional requirement reference
- `Req:REQ-001` — generic requirement reference

Authoritative requirement coverage lives ONLY in:
1. Node shard `requirement_refs` fields (schema: `pm.project-plan-node.v1`)
2. Derived coverage JSON at `.puppet-master/project/traceability/requirements_coverage.json`

ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

Inline tags MUST NOT be used as the sole traceability mechanism.  
ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

If an inline tag and a node's `requirement_refs` conflict, `requirement_refs` MUST be treated as authoritative.  
ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

---

## References
- `Plans/Progression_Gates.md#GATE-009`
- `Plans/Progression_Gates.md#GATE-011`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
- `Plans/requirements_coverage.schema.json`
