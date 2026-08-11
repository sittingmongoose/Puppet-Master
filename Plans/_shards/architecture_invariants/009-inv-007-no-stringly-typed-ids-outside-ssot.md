# Shard 009: INV-007 -- No stringly-typed IDs outside SSOT

Source: `Plans/Architecture_Invariants.md`

Source lines: L94-L103

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-007 -- No stringly-typed IDs outside SSOT


**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
