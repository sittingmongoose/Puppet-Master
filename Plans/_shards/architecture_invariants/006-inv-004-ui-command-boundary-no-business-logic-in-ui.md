# Shard 006: INV-004 -- UI command boundary (no business logic in UI)

Source: `Plans/Architecture_Invariants.md`

Source lines: L68-L77

Source SHA256: `822393a6f0344b214af8956dad4c888e8996f4676b530cdab4e83b2fdb16dada`

---

## INV-004 -- UI command boundary (no business logic in UI)


**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
