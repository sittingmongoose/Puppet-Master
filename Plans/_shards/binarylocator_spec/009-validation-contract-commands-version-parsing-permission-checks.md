# Shard 009: Validation contract (commands, version parsing, permission checks)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L239-L280

Source SHA256: `4bc8a2144a608d9e0d25c83ba118b210c360d0914918b70605718f68802c9554`

---

## Validation contract (commands, version parsing, permission checks)

### Command selection (SSOT)


BinaryLocator MUST use a Provider-owned SSOT version command for each `provider_cli`. (ContractRef: Invariant:INV-005)
- Legacy anchor: `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.version_command`.

### Execution rules
- Execute: `<resolved_path> <version_command...>` with a 5s timeout. (ContractRef: Primitive:Provider)
- The child process environment MUST set an enhanced PATH to reduce false negatives for launcher scripts. (ContractRef: Primitive:Provider)
  - Legacy anchor: `puppet-master-rs/src/platforms/path_utils.rs` `build_enhanced_path_for_subprocess()`.
- Timeout cleanup is deterministic: send graceful termination first (`SIGTERM` on Unix-like hosts or `TerminateProcess` for the launched process on Windows), wait `500ms`, then force-kill the remaining child process group/tree when the platform exposes one. The validation result is `Invalid` with reason `timeout_killed` when forced cleanup was required and `timeout_terminated` when graceful termination completed.

### Version parsing (deterministic)
BinaryLocator MUST parse `version` using this deterministic rule order. (ContractRef: Primitive:Provider)
1) If stdout+stderr contains a `\d+\.\d+\.\d+` pattern, return the first match.
2) Else return the first non-empty trimmed line from stdout, else from stderr.
3) Else return `None`.

Legacy anchors (behavior compatibility):
- `puppet-master-rs/src/platforms/platform_detector.rs` `extract_version()`.
- `puppet-master-rs/src/doctor/installation_manager.rs` `extract_version()`.

### Permission checks (lightweight)
- Unix-like: candidate should have at least one execute bit OR execution attempt is authoritative. (ContractRef: Primitive:Provider)
- Windows: candidate should be `.exe`, `.cmd`, `.bat`, or otherwise OS-executable; execution attempt is authoritative. (ContractRef: Primitive:Provider)

### Functional validation outcome
A candidate is `Valid` if the version command completes within timeout and yields either:
- success exit code, OR (ContractRef: Primitive:Provider)
- a non-empty parsed `version`. (ContractRef: Primitive:Provider)

A candidate is `Invalid` if:
- spawn fails (ENOENT/permission/security block), OR (ContractRef: Primitive:Provider)
- timeout occurs, OR (ContractRef: Primitive:Provider)
- exit is non-zero AND no version can be parsed. (ContractRef: Primitive:Provider)

Optional collision guard: if output strongly identifies as a different Provider CLI, return `WrongBinary`. (ContractRef: Primitive:Provider)
AutoDecision: Collision guard is **disabled by default** until Provider SSOT defines deterministic `WrongBinary` signatures; implementations MUST NOT introduce heuristic string matching beyond that SSOT. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators)

---
