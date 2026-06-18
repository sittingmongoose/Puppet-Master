# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L37-L43

Source SHA256: `f3d36df91449821add7b4fb1ccd89743610c2b29a761660fb3ae1a96bc4db6dc`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics are retained as historical/source-lineage compatibility. Current PRD intake and planning authority routes through `Plans/PRD_Builder.md`, `Plans/Planning_Wizard.md`, `Plans/FinalGUISpec.md`, and downstream PlanCompile/Executor owner docs before implementation:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
