# Shard 036: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Architecture_Invariants.md`

Source lines: L4545-L4551

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime architecture-invariant rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-60e840c059b6db237485d48c`: raw reconciliation fragments preceding INV-001 are audit-lineage only. The canonical invariant is that correlation, usage, permission, route, and artifact identity must be represented by named owner fields and must not be reintroduced as anonymous prose aliases.
- Repairs `sfk-ddd4dece078c664fd31f6de5`: INV-001 now requires `correlation_id` trace-through across provider/runtime dispatch, persisted EventRecord/domain events, artifacts, receipts, and route/open payloads; event-primary `usage_event_ref` normalizes to `object_kind = usage_event`, while PMConcept7 Ledger attempt-primary routing normalizes `attempt_id` to `object_kind = usage_attempt` and retains the event ref as correlation. Neither is a top-level route special case. Evidence: this section, `AI-004`, and `Plans/Contracts_V0.md` route/runtime identity contracts.
- Repairs `sfk-937c36d705a22bf16645cca2`: `GATE-001`, `GATE-003`, and `GATE-010` are routed through `Plans/Progression_Gates.md`; this section now states that `GATE-003` owns invariant governance while current `run-gates` enforcement remains partial until a dedicated invariant verifier exists.
