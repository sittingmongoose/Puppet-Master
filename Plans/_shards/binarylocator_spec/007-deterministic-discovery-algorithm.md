# Shard 007: Deterministic discovery algorithm

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L112-L210

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

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
- `override_path` input is valid only for Cursor Agent and Claude Code rows exposed in Setup/Health UI; other tools must not emit this field. (ContractRef: ConfigKey:advanced_config.cli_paths)
- Setup/Health manual-path UX contract is: `Use manual path` checkbox + native file picker. If the checkbox is off, callers MUST pass `override_path = None`. (ContractRef: ConfigKey:advanced_config.cli_paths)
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
- Candidate paths MUST be limited to official/default footprints and explicit user override path; legacy/pre-rewrite binary locations MUST NOT be included. (ContractRef: Primitive:Provider)
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
When `provider_cli == Cursor Agent`, BinaryLocator MUST be able to probe the versions subtree deterministically. (ContractRef: Primitive:Provider)

Candidate roots (by OS):
- Unix / WSL: `~/.local/share/cursor-agent/versions/` (ContractRef: Primitive:Provider)
- Windows Native: `%LOCALAPPDATA%\\cursor-agent\\versions\\` (ContractRef: Primitive:Provider)

Selection rule (deterministic):
- Enumerate immediate child directory names under the versions directory and select the lexicographically greatest name using byte-order string comparison. (ContractRef: Primitive:Provider)
- Treat directory names as opaque strings (no semantic version parsing). (ContractRef: Primitive:Provider)
- Ignore non-directory children, hidden lock/temp names beginning with `.`, and names ending in `.tmp`; if two directory entries compare equal after platform path normalization, prefer the one whose canonical absolute path is byte-order greatest. (ContractRef: Primitive:Provider)
- Probe `.../<chosen>/cursor-agent` (Unix/WSL) or `...\\<chosen>\\cursor-agent.exe` (Windows Native), then validate. (ContractRef: Primitive:Provider)

Legacy anchor: `puppet-master-rs/src/install/script_installer.rs` (Cursor shim notes).

#### Windows launcher wrappers (required)


If a candidate ends with `.cmd` or `.bat`, treat it as a launcher and validate via the standard validation contract. (ContractRef: Primitive:Provider)

If no launcher rule yields a valid hit, return `NotFound`. (ContractRef: Primitive:Provider)

---
