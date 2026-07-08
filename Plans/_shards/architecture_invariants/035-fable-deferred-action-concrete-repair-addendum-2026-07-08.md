# Shard 035: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Architecture_Invariants.md`

Source lines: L4438-L4444

Source SHA256: `6f883fb60e510b7c00faba9208e8a0702690c2df24d96a4294dc6f33d861634b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime architecture-invariant rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-60e840c059b6db237485d48c`: raw reconciliation fragments preceding INV-001 are audit-lineage only. The canonical invariant is that correlation, usage, permission, route, and artifact identity must be represented by named owner fields and must not be reintroduced as anonymous prose aliases.
- Keeps `sfk-ddd4dece078c664fd31f6de5` explicitly deferred: correlation_id trace-through and usage_event_ref special-case removal need a dedicated architecture/gate-owner slice before closure.
- Keeps `sfk-937c36d705a22bf16645cca2` explicitly deferred: GATE-001/GATE-003/GATE-010 authority needs gate registry owner reconciliation before closure.
