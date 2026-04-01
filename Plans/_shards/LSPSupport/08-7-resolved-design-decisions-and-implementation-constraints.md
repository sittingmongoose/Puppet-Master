## 7. Resolved design decisions and implementation constraints

### 7.1 Registration-before-spawn invariant

An LSP server MUST be registered in the session map (keyed by `(host_id, server_id, root_identity)`) before its process is spawned. Spawning before registration creates a window where the process exists but cannot be found, tracked, or shut down.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

Required sequence:
1. Acquire the session-map write lock.
2. Insert the session record with status `starting`.
3. Release the write lock.
4. Spawn the subprocess.
5. Transition the record to `ready` or `failed` after handshake completion.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

If spawn fails after registration, the session record is cleaned up or marked `failed` so the slot does not remain permanently occupied.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

