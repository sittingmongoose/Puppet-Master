# Shard 003: Owner / Consumer Map

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L64-L70

Source SHA256: `683459c0727eb26dc581b46d93d03d310d3886a13c76b365ac66f4cd8ae13975`

---

## Owner / Consumer Map

This document owns UI wiring rules, dispatcher boundary requirements from the UI side, wiring matrix row expectations, and autonomous verification strategy for interactive GUI command coverage. It consumes command identifiers from `Plans/UI_Command_Catalog.md`, command and event envelope contracts from `Plans/Contracts_V0.md`, GUI placement and visible behavior from `Plans/FinalGUISpec.md`, and gate definitions from `Plans/Progression_Gates.md`.

This document does not own product layout, command catalog membership, runtime event schemas, route semantics, storage projections, or evidence bundle schemas. Those remain with their owner docs and are referenced here for wiring verification.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Progression_Gates.md
