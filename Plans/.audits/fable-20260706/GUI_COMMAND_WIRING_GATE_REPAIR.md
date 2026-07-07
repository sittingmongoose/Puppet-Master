# FABLE GUI Command, Wiring, Gate, And OpenRef Repair

Generated: 2026-07-07T22:45:00Z
Ledger: gui-command-wiring-gate-repair-20260707

## Scope

This repair closes one bounded GUI/buildability slice: UI command payload/response schemas, production wiring semantics, launch-chain command/receipt wiring, missing normative doc repoints, and progression-gate registry visibility. It does not close FileSafe, storage, platform_specs, broad PlanUnit boilerplate, runtime certification harnesses, executable WorkNodes, NodeSeeds, production build tasks, or buildability proof.

## Closed Findings

- fable-20260706-p1-ui-command-catalog-missing-families
- fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events
- fable-20260706-p1-launch-approval-chain-preimplementation-proof
- fable-20260706-p1-missing-referenced-docs-and-openrefs
- fable-20260706-p1-progression-gates-registry-and-run-gates-coverage

## Evidence

- `Plans/UI_Command_Catalog.md` adds UCC-108 for FABLE GUI command families, UICommandResponse, receipt effects, and runtime allowed-action mappings.
- `Plans/Wiring_Matrix.production.json` validates with concrete production locations, no `*.command_applied` placeholders, and explicit receipt-only dispositions where no persisted event is expected.
- `Plans/Wiring_Matrix.md` adds WM-042 for production wiring semantic repair.
- `Plans/PRD_Builder.md`, `Plans/Planning_Wizard.md`, `Plans/Plan_To_Node_Compilation.md`, and `Plans/Goal_Runtime_System.md` carry launch-chain acceptance criteria without claiming runtime certification.
- Missing openrefs are repointed to `Plans/FinalGUISpec.md`, `Plans/Widget_System.md`, `Plans/Release_Supply_Chain.md`, `Plans/Prompt_Pipeline.md`, `Plans/Skills_System.md`, and `Plans/Section15_MVP_Promoted_Features_Spec.md`.
- `Plans/Progression_Gates.md` defines GATE-007/008 tombstones, GATE-010 wiring semantic failures, and owned manual-pending status for GATE-011/012/013 through PG-061.

## Remaining Boundaries

Buildability remains blocked by runtime lifecycle and clean-room harness certification. This repair intentionally leaves unrelated mechanical registry findings and broad PlanUnit boilerplate outside the closure set.
