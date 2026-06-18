# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L38-L44

Source SHA256: `60b6e07279d170ab6fcaf8817873523922c64d666151f3c17cf4ff4b45618b7d`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
