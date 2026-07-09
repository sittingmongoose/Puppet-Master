# Shard 035: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Architecture_Invariants.md`

Source lines: L4408-L4414

Source SHA256: `6d940af76f0d50c6f92e8692ebc817938edcf6015f12a2072bc063517d7020f1`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime architecture-invariant rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-60e840c059b6db237485d48c`: raw reconciliation fragments preceding INV-001 are audit-lineage only. The canonical invariant is that correlation, usage, permission, route, and artifact identity must be represented by named owner fields and must not be reintroduced as anonymous prose aliases.
- Repairs `sfk-ddd4dece078c664fd31f6de5`: INV-001 now requires `correlation_id` trace-through across provider/runtime dispatch, persisted EventRecord/domain events, artifacts, receipts, and route/open payloads; `usage_event_ref` is normalized to `object_kind = usage_event` plus `object_id` before routing and is not a top-level route special case. Evidence: this section, `AI-004`, and `Plans/Contracts_V0.md` route/runtime identity contracts.
- Repairs `sfk-937c36d705a22bf16645cca2`: `GATE-001`, `GATE-003`, and `GATE-010` are routed through `Plans/Progression_Gates.md`; this section now states that `GATE-003` owns invariant governance while current `run-gates` enforcement remains partial until a dedicated invariant verifier exists.
