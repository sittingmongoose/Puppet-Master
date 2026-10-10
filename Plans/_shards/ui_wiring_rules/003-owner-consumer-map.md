# Shard 003: Owner / Consumer Map

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L64-L70

Source SHA256: `59d06d10242be9b0c9e04467151e8d9b32ed951b9a3cec6a5fcee9de69e49c65`

---

## Owner / Consumer Map

This document owns UI wiring rules, dispatcher boundary requirements from the UI side, wiring matrix row expectations, and autonomous verification strategy for interactive GUI command coverage. It consumes command identifiers from `Plans/UI_Command_Catalog.md`, command and event envelope contracts from `Plans/Contracts_V0.md`, GUI placement and visible behavior from `Plans/FinalGUISpec.md`, and gate definitions from `Plans/Progression_Gates.md`.

This document does not own product layout, command catalog membership, runtime event schemas, route semantics, storage projections, or evidence bundle schemas. Those remain with their owner docs and are referenced here for wiring verification.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Progression_Gates.md
