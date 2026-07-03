# Shard 012: Acceptance criteria (testable)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L322-L355

Source SHA256: `e9456832f2a15e65e0158775c6650904e162afa6161f7b115793467ad3ccb3b7`

---

## Acceptance criteria (testable)

### Evidence + gates
- Any implementation node for BinaryLocator MUST produce an evidence bundle that references the ContractRefs in this spec. (ContractRef: SchemaID:evidence_bundle)
- Operational statements in code and updated plan docs MUST satisfy GATE-009 ContractRef coverage. (ContractRef: SchemaID:spec_lock)

### Discovery matrix (OS × install method)
Expected result includes probe layer and a representative resolved path pattern.

| OS | Provider CLI | Supported footprint (SSOT) | Test PATH setup | Expected first-hit probe layer | Expected resolved path pattern |
|---|---|---|---|---|
| macOS | Cursor Agent | User-local shim (`~/.local/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `~/.local/bin` from PATH | CommonLocations | `~/.local/bin/agent` |
| macOS | Cursor Agent | Homebrew shim (`/opt/homebrew/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/opt/homebrew/bin` in PATH | PATH | `/opt/homebrew/bin/agent` |
| Linux | Cursor Agent | System shim (`/usr/local/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/usr/local/bin` in PATH | PATH | `/usr/local/bin/agent` |
| Windows (Native) | Cursor Agent | User-local shim (`%LOCALAPPDATA%\\cursor-agent\\agent.exe`) (SSOT: `Plans/FinalGUISpec.md` Cursor install (Windows Native)) | Exclude `%LOCALAPPDATA%\\cursor-agent` from PATH | CommonLocations | `%LOCALAPPDATA%\\cursor-agent\\agent.exe` |
| Windows (WSL) | Cursor Agent | User-local shim in WSL (`~/.local/bin/agent`) (SSOT: `Plans/FinalGUISpec.md` Cursor Windows policy) | Exclude `~/.local/bin` (inside WSL) from PATH | CommonLocations | `~/.local/bin/agent` |
| macOS | Claude Code | Homebrew shim (`/opt/homebrew/bin/claude`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/opt/homebrew/bin` in PATH | PATH | `/opt/homebrew/bin/claude` |
| Linux | Claude Code | User-local shim (`~/.local/bin/claude`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `~/.local/bin` from PATH | CommonLocations | `~/.local/bin/claude` |
| Windows | Claude Code | npm shim (`%APPDATA%\\npm\\claude.cmd`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `%APPDATA%\\npm` in PATH | PATH | `%APPDATA%\\npm\\claude.cmd` |
| Windows | Claude Code | WinGet link (`%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `%LOCALAPPDATA%\\Microsoft\\WinGet\\Links` from PATH | CommonLocations | `%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe` |

### Functional acceptance checks
1. Determinism: repeated runs on a fixed filesystem snapshot return identical `source_layer`, `resolved_path`, and `resolved_name`. (ContractRef: Primitive:Provider)
2. Override semantics: invalid override returns `FoundButInvalid(OverrideInvalid)` with no fallback probing. (ContractRef: ConfigKey:advanced_config.cli_paths)
3. Validation: every `Found` result has passed version-command validation and returns `version` when parseable. (ContractRef: Primitive:Provider)
4. Trace completeness: `trace` includes every attempted candidate in order, including misses. (ContractRef: Primitive:Provider)
5. Cache correctness: cached paths are never returned without fast validation; invalid cached paths are evicted. (ContractRef: Primitive:SessionStore)
6. Force rescan: `force_rescan=true` bypasses caches and updates results even if a cached value is still valid. (ContractRef: Primitive:Provider)
7. Windows launcher support: `.cmd`/`.bat` candidates are validated as executable launchers. (ContractRef: Primitive:Provider)
8. Cursor versions subtree: when only the versions bundle exists, the Launchers layer resolves and validates the latest lexicographic entry. (ContractRef: Primitive:Provider)
9. Manual-path UX contract: only Cursor/Claude expose manual-path controls; unchecked state emits no `override_path`; checked state emits exactly the file-picker path. (ContractRef: ConfigKey:advanced_config.cli_paths)
10. UI state mapping determinism: identical `BinaryLocateResult` values always map to the same Setup/Health install-state label (`Installed`, `Not Installed`, `Failed`). (ContractRef: Invariant:INV-003)

---
