# Shard 006: INV-004 -- UI command boundary (no business logic in UI)

Source: `Plans/Architecture_Invariants.md`

Source lines: L101-L110

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-004 -- UI command boundary (no business logic in UI)


**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
