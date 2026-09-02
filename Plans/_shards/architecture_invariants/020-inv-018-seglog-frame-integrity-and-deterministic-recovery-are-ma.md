# Shard 020: INV-018 -- Seglog frame integrity and deterministic recovery are mandatory

Source: `Plans/Architecture_Invariants.md`

Source lines: L213-L236

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-018 -- Seglog frame integrity and deterministic recovery are mandatory


### Rule

Every first-generation writer targets `SeglogFrameV2`. Its resynchronization prefix, bounded header metadata, and payload have independently validated integrity coverage, and a reader may resynchronize only at a candidate boundary that passes the complete storage-owned validation order. A CRC failure is not universally skippable.

- A partial final frame at the active tail may be truncated only through the storage-owned intent, preimage, durability, and postcondition protocol.
- A single bad frame is the loss unit only when the next complete boundary validates. Otherwise the loss unit is the exact bounded byte range to the next validated boundary or the segment remainder.
- Active non-tail corruption seals the active source as degraded and preserves its bytes; closed-segment corruption never rewrites the damaged closed source in place.
- Recovery rebuilds derived projections from the deterministic surviving-record set. If acknowledged canon has a hole, `projection_health` remains `degraded` with gap provenance even when `projection_freshness` becomes `current` relative to the survivor set; unknown or mutation-authorizing loss blocks mutation.
- Storage integrity and boot-recovery events use deterministic episode identity and disclose segment, generation, offset/range, evidence precision, and terminal disposition without calling lossy recovery clean.

Silently processing corrupt bytes, treating every checksum failure as one skippable record, choosing a boundary by timestamp/mtime, or promoting a projection to recovery authority is prohibited.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

ContractRef: Invariant:INV-018

**Rule:** Every interactive UI element MUST map to exactly one `UICommandID`. The mapping MUST be recorded in the wiring matrix (validated by `Plans/Wiring_Matrix.schema.json`). Every `UICommandID` listed in `Plans/UI_Command_Catalog.md` MUST have a registered handler. No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010

---
