# Shard 015: GATE-009 -- ContractRef coverage

Source: `Plans/Progression_Gates.md`

Source lines: L336-L349

Source SHA256: `28b32843c89be43a1e730dae715652ef22f99c911144c83f89b42fd938ba22b9`

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
