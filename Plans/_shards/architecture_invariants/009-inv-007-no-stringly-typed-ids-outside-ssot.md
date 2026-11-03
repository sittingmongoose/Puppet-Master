# Shard 009: INV-007 -- No stringly-typed IDs outside SSOT

Source: `Plans/Architecture_Invariants.md`

Source lines: L94-L103

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-007 -- No stringly-typed IDs outside SSOT


**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
