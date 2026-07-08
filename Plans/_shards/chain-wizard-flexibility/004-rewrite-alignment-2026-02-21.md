# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L40-L46

Source SHA256: `549fc6f601509dc82b3f76bb694c5ed08ec61384f2988768b91d1a46f2ab69ee`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics are retained as historical/source-lineage compatibility. Current PRD intake and planning authority routes through `Plans/PRD_Builder.md`, `Plans/Planning_Wizard.md`, `Plans/FinalGUISpec.md`, and downstream PlanCompile/Executor owner docs before implementation:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
