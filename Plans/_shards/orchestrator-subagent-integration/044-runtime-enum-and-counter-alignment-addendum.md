# Shard 044: Runtime Enum and Counter Alignment Addendum

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6621-L6633

Source SHA256: `41cead1dd57e3bc73f7ccdad0ac7c2b9253f897209e55efbc277f4d8807cad54`

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
