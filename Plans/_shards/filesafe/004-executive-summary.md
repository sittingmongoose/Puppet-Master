# Shard 004: Executive Summary

Source: `Plans/FileSafe.md`

Source lines: L70-L119

Source SHA256: `efecff59153c90ec0a8dd33d6982b5ed891688de490ddcebfb45639be8d2e91e`

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
- Prompt/free-text command and path extraction is advisory defense-in-depth only; free-text extraction is advisory, not authoritative. Layer-1 enforcement is the structured tool/command invocation, normalized command identity, resolved path scope, and security-filter decision. A free-text extraction hit may block, warn, or ask for clarification, but a free-text extraction miss never authorizes command execution or file mutation.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### P0 fail-closed security resolution (2026-07-07)

This section is the active FileSafe security decision for FABLE `fable-20260706-p0-filesafe-fail-open-and-allowlist-security`. Earlier examples that appear to disable guards, match approved commands by prefix, treat empty allowlists as warn-only, or make `PUPPET_MASTER_ALLOW_DESTRUCTIVE=1` sufficient authority are retired source-lineage only unless this section explicitly restates them as live behavior.

Canonical requirements:
- FileSafe, BashGuard, FileGuard, and SecurityFilter initialization failures fail closed. The affected startup/runtime path blocks guarded command execution, file mutation, and sensitive-file access until the diagnostic is resolved.
- Disabled guard states are valid only for explicit, authenticated, auditable operator configuration that narrows or intentionally suspends one named guard for a scoped run/project/worktree duration. Initialization failure must never create a disabled guard.
- Approved command matching is exact after normalization. Normalization trims leading/trailing whitespace, collapses internal ASCII whitespace runs to one space, preserves token order and shell metacharacters, and does not split or concatenate authorization across command segments.
- Command identity is the whole normalized segment that would be dispatched after policy expansion and before spawn. For multi-line or chained invocations using newline, `&&`, `;`, `||`, or `|`, each dispatch segment is normalized and checked independently; the invocation is allowed only if every segment is independently allowed and none is blocked. An approval for `git status` does not approve `git status && rm -rf /`.
- Prefix, substring, `starts_with`, shell-fragment, fuzzy, prompt-expanded, and concatenated-command approval are forbidden. Mismatches emit `filesafe.command_denied` with `denial_code = approved_command_identity_mismatch`.
- Missing or empty command/path allowlists fail closed whenever the corresponding guard is enabled. `strict_mode=false` can soften non-authoritative advisory reporting only after a safe enforcement baseline is present; it cannot permit writes, reads, or commands when the authoritative allowlist, baseline, root, or guard input is absent.
- `PUPPET_MASTER_ALLOW_DESTRUCTIVE=1` is only a request signal. It is not sufficient authority by itself. A destructive override requires an authenticated operator grant with auth realm, operator identity, reason, scope, duration/expiry, project/run/worktree binding, and an emitted security event and receipt before any destructive command can run.
- Prompt/free-text command or path extraction is never the sole enforcement boundary. Structured tool arguments, final command segments, and resolved path scopes remain mandatory checks.
- Source-lineage snippets that preserve old fail-open, prefix-match, or disabled-fallback examples must be explicitly fenced as retired/noncanonical and must include a copy-prevention note saying they are not implementation guidance.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

---
