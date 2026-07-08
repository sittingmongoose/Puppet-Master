# Shard 009: INV-007 -- No stringly-typed IDs outside SSOT

Source: `Plans/Architecture_Invariants.md`

Source lines: L94-L103

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

---

## INV-007 -- No stringly-typed IDs outside SSOT


**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
