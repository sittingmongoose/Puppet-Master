# Shard 021: Contract-driven code generation (lightweight; DRY)

Source: `Plans/Architecture_Invariants.md`

Source lines: L238-L245

Source SHA256: `822393a6f0344b214af8956dad4c888e8996f4676b530cdab4e83b2fdb16dada`

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---
