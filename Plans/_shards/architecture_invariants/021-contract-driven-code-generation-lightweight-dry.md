# Shard 021: Contract-driven code generation (lightweight; DRY)

Source: `Plans/Architecture_Invariants.md`

Source lines: L238-L245

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---
