# Shard 009: INV-007 -- No stringly-typed IDs outside SSOT

Source: `Plans/Architecture_Invariants.md`

Source lines: L127-L136

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-007 -- No stringly-typed IDs outside SSOT


**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
