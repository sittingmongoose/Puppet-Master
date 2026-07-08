# Shard 020: INV-018 -- Seglog CRC32 is mandatory

Source: `Plans/Architecture_Invariants.md`

Source lines: L244-L259

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-018 -- Seglog CRC32 is mandatory


### Rule

Every seglog record MUST include a CRC32 checksum. Checksum validation MUST occur on every read. A record that fails CRC32 validation MUST be skipped and a recovery event emitted. Silently processing a corrupt record is prohibited.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

ContractRef: Invariant:INV-018

**Rule:** Every interactive UI element MUST map to exactly one `UICommandID`. The mapping MUST be recorded in the wiring matrix (validated by `Plans/Wiring_Matrix.schema.json`). Every `UICommandID` listed in `Plans/UI_Command_Catalog.md` MUST have a registered handler. No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010

---
