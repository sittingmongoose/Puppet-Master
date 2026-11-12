# Shard 015: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Crosswalk.md`

Source lines: L3369-L3373

Source SHA256: `2ab27e2c80bf1dccd3906a987fa207e103af8679f2ed73bbf5e7ffe49fc0007b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Crosswalk pointer rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-276a3e41fd08d5c4adaff514` and `sfk-973c4b99a2e3f9e5ad705e53`: `max_subagents_spawn` is owned by `Plans/interview-subagent-integration.md` as `interview.max_subagents_spawn`. Crosswalk may route to that owner but must not invent a separate field.
