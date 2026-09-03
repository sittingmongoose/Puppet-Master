# Shard 001: Preamble

Source: `Plans/Goal_Runtime_System.md`

Source lines: L1-L5

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

# Goal Runtime System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns native Goal Mode runtime behavior, not the bootstrap ledger conversation that produced it.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner of the Goal object and the Goal runtime: one text-only `objective_text`, integer `revision`, the `active|paused|blocked|completed` lifecycle plus cancellation receipt semantics, durable host continuation, the direct-edit versus agent-proposal authority split, Goal creation authority, the Goal event family, Goal V1 -> V2 migration, and the read-only Goal projection consumed by the Activity domain. It does not own Goal phases, Goal tranches, child Goals or child-goal topology, Goal-owned workflow budgets, or a Goal-specific planner/evaluator/verifier/adjudicator role cast; those constructs are retired by the 2026-09-03 Assistant redesign and survive only as compatibility/source lineage. It does not own scheduling windows or quota resume, To-Do state, Assistant Plan documents, collaborative workflow runtime, permission/approval hosting, model or account identity, subagent lifecycle, or any workflow's own durable state.
