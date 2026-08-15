# Shard 011: Error taxonomy (stable codes)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L304-L324

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

---

## Error taxonomy (stable codes)
BinaryLocator MUST return stable error codes suitable for UI rendering, logs, and evidence bundles. (ContractRef: Primitive:Provider)

| Code | Meaning | Typical layer |
|---|---|---|
| `OverrideMissing` | Override path was set but does not exist | Override |
| `OverrideInvalid` | Override path exists but fails validation | Override |
| `NotFound` | No candidate found in any layer | Any |
| `NotExecutable` | File exists but cannot be executed (permissions) | Any |
| `BlockedByOSSecurity` | OS blocked execution (e.g., quarantine / SmartScreen) | Any |
| `Timeout` | Version command timed out | Any |
| `MissingRuntime` | Launcher ran but failed due to missing runtime (commonly Node.js) | PATH/CommonLocations/Launchers |
| `WrongBinary` | Output identifies a different Provider CLI | Any |

### UI mapping (DRY)
- UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT (`Plans/FinalGUISpec.md` + typed commands in `crates/ui_commands/`), using these stable error codes and the `trace` output as inputs. (ContractRef: Invariant:INV-003)
- Setup + Health/Doctor map BinaryLocator results for Cursor/Claude as follows: `Found` → Installed, `NotFound` → Not Installed, `FoundButInvalid` → Failed (show `BinaryErrorCode` + trace details). (ContractRef: Invariant:INV-003)
- Manual path controls are Cursor/Claude only: a `Use manual path` checkbox gates a native file picker value that is passed as `override_path`; toggling off clears `override_path` and reverts to normal probe layers. (ContractRef: ConfigKey:advanced_config.cli_paths)
- External user-Project test-tool installation and health are outside BinaryLocator; Project tooling policy owns ordinary external test commands, and no such tool is a PM Browser capability. (ContractRef: Primitive:Provider)

---
