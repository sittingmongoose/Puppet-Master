# Shard 008: Internal workflow use of Goal V2

Source: `Plans/Goal_Runtime_System.md`

Source lines: L210-L233

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Internal workflow use of Goal V2

Goal V2 is used extensively inside Puppet Master, not only in Assistant Chat. Internal research, Planning Ledger to Plans transfer, PlanUnit generation, audit and repair sweeps, WorkNode preparation, and execution all run under the same engine, with the same record, the same continuation loop, and the same stop semantics. There is no second internal Goal engine and no internal-only Goal field.

What the internal callers get from Goal is exactly two things: a stable objective that survives compaction, restart, and model change, and a durable host continuation that keeps working the objective until it is complete, paused, blocked, or cancelled. What they do not get, and must not ask for, is a place to store their own workflow state.

Each internal caller keeps its own state under its own owner:

| Caller | Goal supplies | Caller owns |
|---|---|---|
| Internal research | objective, continuation | queries, sources, extracts, citations, dedup, coverage |
| Ledger to Plans transfer | objective, continuation | ledger session, atoms, decisions, corrections, topic coverage, conversion receipts |
| PlanUnit generation | objective, continuation | unit drafts, owner placement, dependency graph, acceptance criteria, validation surfaces |
| Audit and repair | objective, continuation | findings, severity, disposition, repair attempts, re-verification evidence |
| WorkNode preparation | objective, continuation | node seeds, readiness, inputs, compile receipts |
| Execution | objective, continuation | assignments, checkpoints, tests, evidence, artifacts, retries, schedules, quotas |

An internal caller that needs staged progress models the stages in its own records and reports readiness to Goal through completion evidence. It does not add a phase to the Goal, and Goal does not grow a field to hold it. This is the DRY boundary that the retired phase model violated: a Goal phase was a second, weaker copy of a workflow stage that the workflow already owned, and the two drifted.

A Goal may drive several workflows by reference over its life. It holds no queue of them. The active work is whatever `active_run_ref` names, and the run owner resolves ordering, parallelism, and dependency among its own units.

Invisible internal Goals are not rendered in the Assistant Activity bar. They are visible in the surfaces their owning workflow already provides, and they obey the same Stop epoch as user-facing Goals.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md
