# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L37-L44

Source SHA256: `e5a47a11437fc556e9e309fed3faf756fe1cadb0b1936958b13b407dfd328346`

---

## Rewrite alignment (2026-02-21)

This plan's workflow semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow

