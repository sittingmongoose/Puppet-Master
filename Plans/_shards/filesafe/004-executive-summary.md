# Shard 004: Executive Summary

Source: `Plans/FileSafe.md`

Source lines: L70-L101

Source SHA256: `d64a6e89622ae2049310e926f5729a8336d79b9976ae988bb8ebbb22625c30be`

---

## Executive Summary

FileSafe is the canonical guardrail layer that blocks destructive commands before execution, constrains write scope, filters sensitive file access, validates compiled prompt content, and records guard outcomes in the canonical event stream.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Prompt/context compilation is adjacent but separately owned. `Plans/Prompt_Pipeline.md` owns run/work-package/node/attempt-scoped context selection, delta compilation, cache heuristics, skill bundling, and compaction behavior. FileSafe consumes the compiled prompt, structured attachments, and run/node/attempt identity as safety inputs; it does not own those rewrite-era algorithms or classify guard policy by legacy execution hierarchy.

Doc-change mutation surfaces are narrowed to the shared `Plans/Contracts_V0.md` payload contract plus FileSafe guard outcomes; other docs may consume those records but must not mint a competing doc-change authority.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

### Part A -- FileSafe


1. **FileSafe: Command blocklist** -- Blocks destructive CLI commands before they run.
2. **FileSafe: Write scope** -- Restricts writes to the canonical allowed-file scope for the execution.
3. **FileSafe: Security filter** -- Blocks access to sensitive files and secrets.
4. **Compiled prompt checking** -- Scans the fully assembled prompt before provider dispatch.
5. **Verification and override integration** -- Allows only explicitly authorized override paths and records them canonically.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

### Part B -- Compiled-context safety boundary

- FileSafe checks the fully compiled prompt **after** Prompt Pipeline assembly and **before** provider dispatch.
- FileSafe validates structured attachments, forwarded document selections, and file references against security and write-scope policy.
- FileSafe emits structured allow/block outcomes for these checks into seglog.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

---
