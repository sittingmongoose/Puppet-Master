# Shard 015: GATE-009 -- ContractRef coverage

Source: `Plans/Progression_Gates.md`

Source lines: L336-L349

Source SHA256: `72df37706b4be279175bd902815fa3c1e190d8ed0cc4ee16755ec08299d8f855`

---

## GATE-009 -- ContractRef coverage
**Pass condition:** Every operational requirement line contains at least one `ContractRef:`.

Deterministic detection:
- Operational requirement line contains: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

Required evidence:
- A report listing all operational lines missing `ContractRef:` (must be empty).

ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/DRY_Rules.md#9

---

<a id="GATE-010"></a>
