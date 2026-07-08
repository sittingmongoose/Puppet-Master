# Shard 021: Contract-driven code generation (lightweight; DRY)

Source: `Plans/Architecture_Invariants.md`

Source lines: L261-L268

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---
