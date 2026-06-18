# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L38-L44

Source SHA256: `68c5caa8b0ab2dc022b78943f96a63b56c41df44912d958613b08dcdd20072e7`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow
