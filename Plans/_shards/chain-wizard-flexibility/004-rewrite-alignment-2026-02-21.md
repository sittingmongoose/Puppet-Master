# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L40-L46

Source SHA256: `0bb989004ab59492ebece74db2d19344b5a672d52c303484828fc038cac5fcbe`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics are retained as historical/source-lineage compatibility. Current PRD intake and planning authority routes through `Plans/PRD_Builder.md`, `Plans/Planning_Wizard.md`, `Plans/FinalGUISpec.md`, and downstream PlanCompile/Executor owner docs before implementation:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
