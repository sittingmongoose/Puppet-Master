# Shard 044: Runtime Enum and Counter Alignment Addendum

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6560-L6572

Source SHA256: `ba7d22d69bd91cf49e929a8d7c3e99252cf89c2ef429521f6e7205f0fc507df8`

---

## Runtime Enum and Counter Alignment Addendum

The orchestrator is a consumer of canonical runtime contracts and MUST NOT redefine them locally.

Required rules:
- use `failure_class` only for classified attempt outcomes
- use `blocked_reason_code` only for unresolved prerequisites or intentionally prevented work
- preserve ordered `allowed_action_ids[]` exactly as emitted by runtime contracts
- treat slot shortage as `capacity_deferred`, not blocked
- create a new `attempt_id` for every retry, prerequisite resume, remediation rerun, or safe-point-restored rerun
- respect the independent counter-family model; `retry_count` is display-only

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Executor_Protocol.md
