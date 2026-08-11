# Shard 021: Contract-driven code generation (lightweight; DRY)

Source: `Plans/Architecture_Invariants.md`

Source lines: L238-L245

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---
