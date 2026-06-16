# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L37-L43

Source SHA256: `0b73f2f9279538abf08313620fd9f5d277911139b86a3ab9b23e127ce0b86230`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
