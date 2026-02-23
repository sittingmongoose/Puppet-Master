# Progression Gates (Canonical)

<!--
PUPPET MASTER — PROGRESSION / VERIFICATION GATES

ABSOLUTE NAMING RULE:
- Platform name is “Puppet Master” only.
- If older naming exists, refer to it only as “legacy naming” (do not quote it).
-->

## 0. Scope
This file defines deterministic gates used to validate plan quality and implementation evidence.

ContractRef: Primitive:Gate

---

<a id="GATE-003"></a>
## GATE-003 — Architecture invariants
**Pass condition:** All referenced invariants hold for the change under test.

Minimum checks:
- `INV-002` secrets rule is not violated (no secrets in logs/state/events/evidence).
- `INV-010` naming rule is not violated in user-visible docs/strings.

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json`.
- A grep/audit summary showing no token-like strings persisted (implementation-specific).

ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json

---

<a id="GATE-009"></a>
## GATE-009 — ContractRef coverage
**Pass condition:** Every operational requirement line contains at least one `ContractRef:`.

Deterministic detection:
- Operational requirement line contains: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

Required evidence:
- A report listing all operational lines missing `ContractRef:` (must be empty).

ContractRef: Plans/DRY_Rules.md#7, Plans/DRY_Rules.md#9

---

## References
- `Plans/DRY_Rules.md`
- `Plans/Architecture_Invariants.md`
- `Plans/evidence.schema.json`
