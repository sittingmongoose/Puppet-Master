# Shard 007: Derived Grouping Boundaries (DRY)

Source: `Plans/human-in-the-loop.md`

Source lines: L145-L155

Source SHA256: `7aaa04e47769b1e276e701736ff33f9200125da8385a05d5fe9c5eb0be5c87f6`

---

## Derived Grouping Boundaries (DRY)


Tier boundaries are not a co-equal execution model.

Rules:
- approvals do not bind to `tier_id` as the canonical execution scope
- any surviving tier or phase labels are derived grouping/view concepts only
- approval and recovery flows bind to runtime blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md
