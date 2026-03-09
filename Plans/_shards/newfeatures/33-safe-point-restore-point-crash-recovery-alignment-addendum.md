## Safe Point / Restore Point / Crash Recovery Alignment Addendum

### Terminology distinction

- **Safe point** (`sp:` namespace): Runtime-internal recovery anchor created before mutation-capable attempts. Scoped to `run_id/node_id/attempt_id`. Not user-visible. Used for retry-from-safe-point and remediation recovery.
- **Restore point** (`rp:` namespace): User-facing history checkpoint. Scoped to `project_id`. User-visible and browsable. Used for manual rollback/undo.

These are distinct concepts with distinct storage namespaces and MUST NOT be conflated.

### Crash recovery alignment

When the application restarts after a crash (§4 Session and Crash Recovery), the storage layer classifies any in-progress attempt with no terminal event as `interrupted_by_restart` (an `attempt_terminal_state` enum value). The scheduler then evaluates whether to:
- Resume from a safe point (if one exists for the interrupted attempt)
- Start a fresh attempt (if no safe point exists)
- Mark as `stale_historical` (if the attempt belongs to a prior `replan_generation`)

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
