# Shard 040: Runtime Scheduler Consumer / Subagent Canonical Alignment (2026-03-09)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6349-L6388

Source SHA256: `a29fb722e82fd1f89823b9be4c7a2aaa3b75418b6d3659c9b6657c0b15971241`

---

## Runtime Scheduler Consumer / Subagent Canonical Alignment (2026-03-09)

The orchestrator is the primary consumer of the runtime scheduler contract and MUST treat queue analysis, attempt identity, remediation lineage, and blocked outcomes as first-class orchestration inputs.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### Required orchestration fields per runnable unit
Every runnable orchestration unit MUST retain and propagate:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md
- `run_id`
- `thread_id`
- `node_id`
- `attempt_id`
- `replan_generation`
- `scheduler_lane`
- `manual_priority`
- `transitive_unblock_count`
- `ready_since_utc`
- effective concurrency lane / capacity pool
- permission / model snapshot identifiers

### Parent-child lineage rules
Subagents and remediation children are not free-floating tasks. The orchestrator MUST preserve parent-child lineage across spawn, result ingestion, verification, and retry. A remediation child inherits correlation to the failed parent attempt but receives its own `attempt_id`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md

### Blocked outcome handling
When a unit is blocked by auth, FileSafe, permission policy, or external side-effect approval, the orchestrator MUST:
- preserve completed local work
- mark the unit blocked rather than failed
- store the exact `blocked_reason_code`
- surface only the recovery actions allowed for that reason
- avoid hidden retries or hidden fallback paths
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

### Wake-consumer behavior
Orchestrator projections MUST update immediately on runtime wakeups so newly-unblocked work can be reconsidered in the same event cycle. It MUST NOT wait for a periodic sweep to discover runnable work.
ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Executor_Protocol.md

### Draft decomposition fallback boundary
Interview/planning-stage decomposition fallback may flatten only before graph lock. After graph lock, the orchestrator MUST treat invalid graph structure as integrity failure rather than silently continuing with a degraded execution plan.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md
