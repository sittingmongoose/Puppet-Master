# Shard 008: Runtime Scheduler / Recovery Ownership and Precedence

Source: `Plans/Crosswalk.md`

Source lines: L469-L486

Source SHA256: `9ec60383b4d1dbbf8296abf0656249a24639590f6a26edd22c6600871284974c`

---

## Runtime Scheduler / Recovery Ownership and Precedence


Canonical ownership:
- runtime lifecycle and scheduling: `Plans/Executor_Protocol.md`
- runtime events, enums, and payloads: `Plans/Contracts_V0.md`
- persistence and restart recovery: `Plans/storage-plan.md`
- deterministic recovery defaults: `Plans/Decision_Policy.md`
- runtime command IDs: `Plans/UI_Command_Catalog.md`
- Context Lens control/action wiring rows: `Plans/Wiring_Matrix.md`
- chat, GUI, run graph, orchestrator, and wizard surfaces are consumers of the contracts above
- `Executor_Protocol.md` owns `blocked_sequence` minting and the restart-recovery to first `scheduler.pass` handoff from `startup_recovered`; `Contracts_V0.md` owns `/contracts/UI` payload implications; effective-resolution/runtime snapshots must carry `execution_role`; and `orchestrator-subagent-integration.md` must stop tier-rooted `/hook` coordination from losing attempt/worktree/permission/runtime joins such as `/worktree/permission/runtime`.

Precedence rules:
- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only
- when a consumer doc conflicts with the owner docs above, the owner docs win
- stale canonical text must be replaced or retired, not preserved by later additive notes alone
- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes that contradiction to owner docs and requires one scheduler truth.
