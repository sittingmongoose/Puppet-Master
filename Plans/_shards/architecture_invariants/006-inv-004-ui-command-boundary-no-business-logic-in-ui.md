# Shard 006: INV-004 -- UI command boundary (no business logic in UI)

Source: `Plans/Architecture_Invariants.md`

Source lines: L68-L77

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-004 -- UI command boundary (no business logic in UI)


**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
