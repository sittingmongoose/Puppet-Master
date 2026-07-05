# Shard 013: GATE-009 -- ContractRef coverage

Source: `Plans/Progression_Gates.md`

Source lines: L297-L310

Source SHA256: `048d6a2b70207dc30577e816669c735025358111707249ae1357a4fbbbb0aa82`

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
