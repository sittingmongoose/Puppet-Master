# Shard 011: Canonical Runtime Recovery Matrix Completion

Source: `Plans/Decision_Policy.md`

Source lines: L416-L438

Source SHA256: `9ecf3fea83953a6a763b3d4cd902f1c5bba3b041b42ed48244dcc7a480af6030`

---

## Canonical Runtime Recovery Matrix Completion


### Additional blocked rows
| classifier family | classifier | automatic next step | counter family | backoff | requires safe-point restore | remediation | terminal / escalation |
|---|---|---|---|---|---|---|---|
| `blocked_reason_code` | `validation_blocked` | wait for corrected input or explicit user action | `manual_resume_count` | none | no | optional | remain blocked |
| `blocked_reason_code` | `remediation_ceiling_exceeded` | no automatic retry | none | none | no | no | remain blocked until replan, manual fix, or abort |
| `blocked_reason_code` | `worktree_conflict` | wait for conflict resolution | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `dirty_worktree` | wait for cleanup or restore action | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `plugin_hook_blocked` | wait for hook resolution or explicit override action | `manual_resume_count` | none | no | no | remain blocked |

### Timeout normalization
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md
`tool_outcome = timed_out` MUST first normalize to `failure_class = provider_transient`, then follow the canonical provider-transient row.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

### Field-level override


When a blocked payload sets `requires_safe_point_restore = true`, that field overrides the row-default rerun path.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md
