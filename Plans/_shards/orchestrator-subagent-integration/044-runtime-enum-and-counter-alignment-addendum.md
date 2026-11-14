# Shard 044: Runtime Enum and Counter Alignment Addendum

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6594-L6606

Source SHA256: `688305f369484024074fdad215c2aa989ed670c5ef587b58a01a144a5beac55b`

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
