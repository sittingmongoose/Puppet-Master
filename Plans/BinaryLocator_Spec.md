# BinaryLocator Spec (Canonical)

## Purpose
Provide a **deterministic, testable** mechanism for Puppet Master to locate and validate **external Provider CLIs** (initially **Cursor Agent** and **Claude Code**) across **Windows / macOS / Linux**, using only their **official install methods**. (ContractRef: Primitive:Provider)

## Non-goals
- Installing, updating, or uninstalling Provider CLIs. (ContractRef: Primitive:Provider)
- Filesystem crawling or heuristic "best guess" scanning beyond the explicitly enumerated probe layers below. (ContractRef: Primitive:Provider)
- Provider orchestration, authentication, or model discovery (owned by Provider layer). (ContractRef: Primitive:Provider)

---

## Canonical references and constraints (SSOT; DRY)

### Locked decisions (no drift)
- Platform name is **Puppet Master** only. (ContractRef: Invariant:INV-010)
- UI toolkit is **Slint 1.15.1**; Iced is legacy. (ContractRef: SchemaID:spec_lock)
- Storage is **seglog + redb + Tantivy**; SQLite is forbidden. (ContractRef: SchemaID:spec_lock)

### Canonical sources (reference, don't duplicate)
- Primitive ownership boundaries: `Plans/Crosswalk.md` (ContractRef: Primitive:Provider)
- DRY / ContractRef rule: `Plans/DRY_Rules.md` §7 (ContractRef: SchemaID:spec_lock)
- Autonomy / deterministic defaults: `Plans/Decision_Policy.md` (ContractRef: SchemaID:spec_lock)
- Contracts baseline (providers, tools, events): `Plans/Contracts_V0.md` (ContractRef: SchemaID:spec_lock)
- Storage envelopes + transition note: `Plans/storage-plan.md` §2.2 (ContractRef: SchemaID:EventEnvelopeV1)
- Naming rules + canonical terms: `Plans/Glossary.md` (ContractRef: SchemaID:spec_lock)

### Legacy-code anchor note (read-only)
This spec may cite `puppet-master-rs/src/...` paths as **legacy-code behavior anchors** only.
- Those paths are **not** the canonical SSOT for the rewrite architecture (see Spec Lock). (ContractRef: SchemaID:spec_lock)
- When conflicts exist, follow Decision Policy precedence: **Spec Lock → Crosswalk → DRY Rules → Glossary → Decision Policy defaults**. (ContractRef: SchemaID:spec_lock)

---

## Terminology (index only)
- **Provider** is the canonical term (not "runner"). (ContractRef: SchemaID:spec_lock)
- **Session** is the canonical user-facing term; legacy terminology must not appear in user-facing text. (ContractRef: Invariant:INV-010)
- This spec uses **probe layer** terminology to avoid conflicting with the four-tier hierarchy naming rule. (ContractRef: SchemaID:spec_lock)

---

## BinaryLocator boundary
BinaryLocator is a **Provider-owned** discovery + validation + trace service. (ContractRef: Primitive:Provider)

### Contract shape

#### Input (conceptual)
`BinaryLocateRequest` is a conceptual contract; concrete types belong in the Provider domain. (ContractRef: Primitive:Provider)

Required fields:
- `provider_cli`: enum identifying which CLI is being located (Cursor Agent, Claude Code). (ContractRef: Primitive:Provider)
- `force_rescan`: boolean; when `true`, bypass all caches and re-probe the filesystem. (ContractRef: Primitive:Provider)

Optional fields:
- `workspace_root`: absolute path; used **only** for workspace-scoped caching keys (must not expand filesystem probing scope). (ContractRef: Primitive:Provider)
- `override_path`: user-provided path string; see Override semantics below. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `env_path`: effective PATH string used for PATH lookup. (ContractRef: Primitive:Provider)

#### Output (conceptual)
`BinaryLocateResult`:
- `status`: `Found | NotFound | FoundButInvalid`. (ContractRef: Primitive:Provider)
- `resolved_path`: absolute path when `Found`. (ContractRef: Primitive:Provider)
- `resolved_name`: candidate binary name that matched (e.g., `agent`, `cursor-agent`, `claude`). (ContractRef: Primitive:Provider)
- `source_layer`: `Override | PATH | CommonLocations | Launchers`. (ContractRef: Primitive:Provider)
- `version`: optional parsed version string. (ContractRef: Primitive:Provider)
- `validation`: `Valid | Invalid(BinaryErrorCode)`. (ContractRef: Primitive:Provider)
- `trace`: ordered list of probe attempts:
  - `layer`: one of the `source_layer` values
  - `candidate`: string (ContractRef: Primitive:Provider)
  - `probe_kind`: `DirectPath | PATHLookup | DirectoryJoin | LauncherResolution` (ContractRef: Primitive:Provider)
  - `result`: `Hit | Miss | HitButInvalid(BinaryErrorCode)` (ContractRef: Primitive:Provider)

#### Trace emission (storage contract note)
BinaryLocator's `trace` is diagnostic data that SHOULD be emitted as events when the event model is available; until then, it is returned as structured data to the caller. (ContractRef: SchemaID:EventEnvelopeV1)
AutoDecision: Until callers have a persisted event writer available, return `trace` only in `BinaryLocateResult`; once available, emit both persisted `EventRecord` diagnostics and return `trace` for deterministic UX/debuggability. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Contracts_V0.md#EventRecord)

> Compatibility note: storage-plan defines `EventEnvelopeV1` as a minimal envelope; Contracts V0 defines `EventRecord` as the canonical persisted envelope with additional required fields; implementations must emit full `EventRecord` envelopes, while readers may accept both during transition. (ContractRef: SchemaID:EventEnvelopeV1, ContractName:Plans/Contracts_V0.md#EventRecord)

---

## Deterministic discovery algorithm

### Probe-layer order (hard requirement)
BinaryLocator MUST attempt probe layers in this exact order and MUST return the **first Valid hit**. (ContractRef: Primitive:Provider)
1) `Override`
2) `PATH`
3) `CommonLocations`
4) `Launchers`

Tie-break rules (deterministic):
- Earlier probe layer wins. (ContractRef: Primitive:Provider)
- Within a layer, earlier candidate name wins (ordered by SSOT list). (ContractRef: Invariant:INV-005)
- Within a candidate name, earlier candidate path in that layer's enumerated list wins. (ContractRef: Primitive:Provider)

Candidate name ordering MUST come from a single SSOT list owned by the Provider domain. (ContractRef: Invariant:INV-005)
- Legacy anchor: `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.cli_binary_names`.

---

### Probe layer: Override
Goal: honor explicit user selection and fail fast with actionable errors if the override is wrong. (ContractRef: ConfigKey:advanced_config.cli_paths)

Rules:
- If `override_path` is `None`/empty, skip this layer. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `override_path` normalization MUST be deterministic. (ContractRef: Primitive:Provider)
  - Expand `~` (home) on Unix-like systems. (ContractRef: Primitive:Provider)
  - Expand `%VAR%` / `$Env:VAR`-style tokens on Windows if present. (ContractRef: Primitive:Provider)
  - If a relative path is provided, resolve it against `workspace_root` if present; otherwise treat it as invalid. (ContractRef: Primitive:Provider)
- If the override path is a directory, probe `override/<candidate_name>` for each candidate name. (ContractRef: Primitive:Provider)
- If the override path is a file path, probe that exact path only. (ContractRef: Primitive:Provider)

Outcome rules:
- If an override path exists but fails validation, return `FoundButInvalid(OverrideInvalid)` and DO NOT fall back to other layers. (ContractRef: Primitive:Provider)
- If an override path does not exist, return `FoundButInvalid(OverrideMissing)` and DO NOT fall back to other layers. (ContractRef: Primitive:Provider)

---

### Probe layer: PATH
Goal: locate the CLI using the effective PATH without guessing. (ContractRef: Primitive:Provider)

Rules:
- For each candidate name, perform an OS-native PATH lookup. (ContractRef: Primitive:Provider)
- If a PATH hit fails validation, continue searching other candidate names in PATH. (ContractRef: Primitive:Provider)
- If no valid PATH hit exists, proceed to `CommonLocations`. (ContractRef: Primitive:Provider)

Legacy anchor: `which::which()` is used today in `puppet-master-rs/src/platforms/path_utils.rs`.

---

### Probe layer: CommonLocations
Goal: find official installs that may not be present in PATH (GUI apps, package-manager shims, user-local bin). (ContractRef: Primitive:Provider)

Rules:
- Enumerate absolute candidate paths from Provider-owned SSOT data in a stable order. (ContractRef: Invariant:INV-005)
- Expand `~` where applicable. (ContractRef: Primitive:Provider)
- De-duplicate by normalized absolute path string; first occurrence wins. (ContractRef: Primitive:Provider)
- Probe each candidate path with existence + validation. (ContractRef: Primitive:Provider)
- If none succeed, proceed to `Launchers`. (ContractRef: Primitive:Provider)

Legacy anchors (read-only):
- `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.default_install_paths`.
- `puppet-master-rs/src/platforms/path_utils.rs` `get_fallback_directories()`.

---

### Probe layer: Launchers
Goal: support official installers that place versioned bundles behind deterministic wrappers/symlinks. (ContractRef: Primitive:Provider)

Rules:
- This layer MUST be restricted to explicit deterministic rules; no broad filesystem crawling is permitted. (ContractRef: Primitive:Provider)

#### Cursor Agent versioned bundle resolution (required)
When `provider_cli == Cursor Agent`, BinaryLocator MUST probe the versions subtree deterministically. (ContractRef: Primitive:Provider)

Candidate roots (by OS):
- Unix: `~/.local/share/cursor-agent/versions/` (ContractRef: Primitive:Provider)
- Windows: `%LOCALAPPDATA%\cursor-agent\versions\` (ContractRef: Primitive:Provider)

Selection rule (deterministic):
- Enumerate immediate child directory names under the versions directory and select the lexicographically greatest name using byte-order string comparison. (ContractRef: Primitive:Provider)
- Treat directory names as opaque strings (no semantic version parsing). (ContractRef: Primitive:Provider)
- Probe `.../<chosen>/cursor-agent` (Unix) or `...\<chosen>\cursor-agent.cmd` (Windows), then validate. (ContractRef: Primitive:Provider)

Legacy anchor: `puppet-master-rs/src/install/script_installer.rs` (Cursor shim notes).

#### Windows launcher wrappers (required)
If a candidate ends with `.cmd` or `.bat`, treat it as a launcher and validate via the standard validation contract. (ContractRef: Primitive:Provider)

If no launcher rule yields a valid hit, return `NotFound`. (ContractRef: Primitive:Provider)

---

## Validation contract (commands, version parsing, permission checks)

### Command selection (SSOT)
BinaryLocator MUST use a Provider-owned SSOT version command for each `provider_cli`. (ContractRef: Invariant:INV-005)
- Legacy anchor: `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.version_command`.

### Execution rules
- Execute: `<resolved_path> <version_command...>` with a 5s timeout. (ContractRef: Primitive:Provider)
- The child process environment MUST set an enhanced PATH to reduce false negatives for launcher scripts. (ContractRef: Primitive:Provider)
  - Legacy anchor: `puppet-master-rs/src/platforms/path_utils.rs` `build_enhanced_path_for_subprocess()`.

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
AutoDecision: Collision guard is **disabled by default** until Provider SSOT defines deterministic `WrongBinary` signatures; implementations MUST NOT introduce heuristic string matching beyond that SSOT. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/DRY_Rules.md#4)

---

## Caching and invalidation

### Cache scopes
BinaryLocator MUST maintain: (ContractRef: Primitive:Provider)
- A per-user persistent cache (durable KV) keyed by `provider_cli`. (ContractRef: Primitive:SessionStore)
- A per-workspace ephemeral cache keyed by `(provider_cli, workspace_fingerprint)` during the current Session. (ContractRef: Primitive:Provider)

### Cache read policy
- If `force_rescan == true`, do not read caches. (ContractRef: Primitive:Provider)
- Otherwise, cached entries MUST be fast-validated before being returned. (ContractRef: Primitive:Provider)

### Cache write/eviction policy
- On `Found(Valid)`, write-through to caches in scope. (ContractRef: Primitive:Provider)
- On `FoundButInvalid`, evict matching cached entries. (ContractRef: Primitive:Provider)
- On `NotFound`, evict workspace cache; evict user cache if it fails fast validation. (ContractRef: Primitive:Provider)

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
| Windows | Cursor Agent | Local app shim (`%LOCALAPPDATA%\cursor-agent\agent.cmd`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `%LOCALAPPDATA%\cursor-agent` from PATH | CommonLocations | `%LOCALAPPDATA%\cursor-agent\agent.cmd` |
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

---

## References
- `Plans/Spec_Lock.json` (locked stack; forbidden deps) (ContractRef: SchemaID:spec_lock)
- `Plans/Crosswalk.md` (Provider ownership boundary) (ContractRef: Primitive:Provider)
- `Plans/DRY_Rules.md` (SSOT + ContractRef rule) (ContractRef: SchemaID:spec_lock)
- `Plans/Glossary.md` (terminology + naming rules) (ContractRef: SchemaID:spec_lock)
- `Plans/Decision_Policy.md` (deterministic defaults) (ContractRef: SchemaID:spec_lock)
- `Plans/Contracts_V0.md` (provider/tool/event contracts) (ContractRef: ContractName:Contracts_V0.md)
- `Plans/storage-plan.md` (EventEnvelopeV1 compatibility note) (ContractRef: SchemaID:EventEnvelopeV1)
- Legacy behavior anchors (read-only):
  - `puppet-master-rs/src/platforms/platform_specs.rs`
  - `puppet-master-rs/src/platforms/path_utils.rs`
  - `puppet-master-rs/src/platforms/platform_detector.rs`
  - `puppet-master-rs/src/install/script_installer.rs`
