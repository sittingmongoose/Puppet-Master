# Shard 007: Derived Grouping Boundaries (DRY)

Source: `Plans/human-in-the-loop.md`

Source lines: L145-L156

Source SHA256: `1d422c28121f5136cf861604a3df266fb3bb96deca8fc1dd177205c530863fb9`

---

## Derived Grouping Boundaries (DRY)


Tier boundaries are not a co-equal execution model.

Rules:
- approvals do not bind to `tier_id` as the canonical execution scope
- any surviving tier or phase labels are derived grouping/view concepts only
- approval and recovery flows bind to runtime blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md

