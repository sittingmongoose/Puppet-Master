# Shard 041: Orchestrator Runtime Consumer and Remediation Execution Canonical Alignment (2026-03-09)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6389-L6412

Source SHA256: `1b766e341ccbcc8592cd42f2e5be62eaffb068675017ee4bfa70384f01ab2c1f`

---

## Orchestrator Runtime Consumer and Remediation Execution Canonical Alignment (2026-03-09)

The orchestrator is the primary consumer of the canonical runtime scheduler contract.

### Runtime consumption rules
- consume canonical event names and identities from `Plans/Contracts_V0.md`
- reevaluate directly affected runnable units in the same wake cycle after `node.prerequisite_resolved`
- treat shortage of slots as `non_selected_reason = capacity_deferred`, not as a blocked outcome
- preserve completed local work for blocked outcomes and surface only the canonical `allowed_action_ids[]`
- do not hide retries, fallback loops, or provider-local resubmission inside orchestrator code paths

### Remediation execution model
Remediation work is a runnable child attempt.

Required rules:
- child remediation attempts receive their own `attempt_id`
- child remediation attempts inherit correlation to the parent attempt through `remediation_root_id`, `parent_attempt_id`, and `remediation_generation`
- remediation children are visible to queue analysis, run graph, orchestrator lists, and artifact navigation even when they are not canonical graph nodes
- the parent node is not dispatchable while remediation child execution is active
- if remediation requires a scope-changing replan, the runtime creates new canonical graph work only after the replan is accepted/applied

### Same-cycle scheduling
Newly unblocked canonical nodes and remediation children that become runnable in a wake cycle MUST be considered before that wake cycle ends. Orchestrator projections MUST update from committed runtime events/projections rather than timer polling.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
