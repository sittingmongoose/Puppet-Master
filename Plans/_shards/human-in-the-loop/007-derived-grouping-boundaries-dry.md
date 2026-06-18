# Shard 007: Derived Grouping Boundaries (DRY)

Source: `Plans/human-in-the-loop.md`

Source lines: L145-L155

Source SHA256: `9a1e98a6713f49fb21d5ee872176e6931760f952f4e30a255c4d2c8878314e2b`

---

## Derived Grouping Boundaries (DRY)


Tier boundaries are not a co-equal execution model.

Rules:
- approvals do not bind to `tier_id` as the canonical execution scope
- any surviving tier or phase labels are derived grouping/view concepts only
- approval and recovery flows bind to runtime blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md
