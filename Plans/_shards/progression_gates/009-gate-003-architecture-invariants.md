# Shard 009: GATE-003 -- Architecture invariants

Source: `Plans/Progression_Gates.md`

Source lines: L252-L269

Source SHA256: `72df37706b4be279175bd902815fa3c1e190d8ed0cc4ee16755ec08299d8f855`

---

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
