# sugfixfinal — Consolidated Platform Install, Auth, Detection & Model Discovery Fixes

> NON-CANONICAL / legacy work note: this document is retained for historical context only.
> Follow `Plans/Spec_Lock.json` + `Plans/Crosswalk.md` for current SSOT.
>
> ContractRef: SchemaID:Spec_Lock.json

## Context

After Phase 8-9 of the Platform Installer Rework, the app-local installation and detection pipeline has multiple critical issues. Installs report success but detection shows "not installed", auth falsely reports "authenticated" from global credentials, npm installs fail outright, the GitHub CLI installer fails on macOS, and model discovery errors surface for platforms that should gracefully use fallback models.

This document consolidates findings from 6 independent investigation plans (sugfix1-6), each with SSH evidence from all 3 target machines. It is the **authoritative implementation plan** for fixing all issues.

---

## Architecture Overview (for the implementing agent)

### Key Directories
- **App-local bin:** `{APP_DATA_DIR}/bin/` — where all managed CLI binaries/shims live
- **App-local lib:** `{APP_DATA_DIR}/lib/` — npm prefix dir (`NPM_CONFIG_PREFIX`)
- **App-local npm wrappers:** `{APP_DATA_DIR}/lib/bin/` — where npm puts wrapper scripts
- **App-local node_modules:** `{APP_DATA_DIR}/lib/lib/node_modules/` — actual npm packages
- **Playwright browsers:** `{APP_DATA_DIR}/playwright-browsers/`
- **Platform data dirs:**
  - Linux: `~/.local/share/rwmpuppetmaster/`
  - macOS: `~/Library/Application Support/com.rwm.RWM-Puppet-Master/`
  - Windows: `%LOCALAPPDATA%\RWM\Puppet Master\data\`

### Key Modules
- `puppet-master-rs/src/install/` — All installers (single entry point: `install_coordinator.rs`)
- `puppet-master-rs/src/platforms/platform_detector.rs` — Multi-stage detection (Stage -1 app-local, Stage 0 project-local, Stage 1 custom path)
- `puppet-master-rs/src/platforms/auth_status.rs` — Per-platform auth checking
- `puppet-master-rs/src/platforms/model_catalog.rs` — Model discovery with caching
- `puppet-master-rs/src/platforms/sdk_bridge.rs` — Node.js SDK bridge for Copilot/Codex models
- `puppet-master-rs/src/platforms/path_utils.rs` — Cross-platform PATH resolution
- `puppet-master-rs/src/platforms/platform_specs.rs` — Single source of truth for all platform capabilities
- `puppet-master-rs/src/app.rs` — Iced GUI message handlers (7900+ lines)
- `puppet-master-rs/src/views/setup.rs` — Setup wizard view
- `puppet-master-rs/src/views/login.rs` — Login/auth view
- `puppet-master-rs/src/views/doctor.rs` — Doctor checks view

### Build & Test Commands
```bash
cd puppet-master-rs
cargo check          # Type check
cargo test --lib     # Run unit tests
cargo build          # Full build
```

### SSH Access for Verification (redacted)
This plan previously included plaintext SSH credentials for manual verification.
Those credentials are **secrets** and MUST NOT be stored in this repository.

If SSH-based verification is required, store credentials in the OS credential store and reference them by *profile name* only.

ContractRef: Plans/Architecture_Invariants.md#INV-002

---

## SSH Investigation Results (from all 6 plans, cross-validated)

### macOS (jaredsmacbookair@192.168.50.115) — arm64
| Item | Finding |
|------|---------|
| App-local bin/ | `agent` (800B shell script, broken), `claude` (183MB real binary, works), `codex` (6659B npm wrapper, broken), `copilot` (14MB native binary, WRONG TOOL), `playwright` (698B npm wrapper, broken) |
| Node.js | v22.18.0 via nvm at `/usr/local/bin/node` — only accessible via `bash -lc`, NOT in default GUI PATH |
| Homebrew | NOT installed (`brew --version` → command not found). Node from Homebrew Cellar also found at `/opt/homebrew/Cellar/node/25.6.1/bin/node` on some setups |
| npm | Not in default GUI PATH |
| gh CLI | NOT installed |
| Global auth dirs | `~/.claude/` (has `.anthropic/`, cache, plugins), `~/.copilot/config.json` (has `logged_in_users`), `~/.gemini/` (has `oauth_creds.json`) |
| Playwright browsers | Installed correctly at `~/Library/Application Support/com.rwm.RWM-Puppet-Master/playwright-browsers/` |
| Copilot `--help` | Only: alias, config, explain, suggest. NO `--allow-all-tools`. This is `gh-copilot` suggest/explain tool, NOT the coding agent |

### Linux (sittingmongoose@192.168.50.72) — x86_64, Ubuntu 24.04
| Item | Finding |
|------|---------|
| App-local bin/ | EMPTY (no installs via wizard yet) |
| Node.js | v25.5.0 in system PATH (`/usr/bin/node`) |
| npm | v11.8.0 in system PATH (`/usr/bin/npm`) |
| gh CLI | Available in system PATH (`/usr/bin/gh`) |
| System CLIs | `codex` and `gemini` exist in `/usr/bin/` (system-wide npm) |
| Global auth dirs | All exist (`~/.claude/`, `~/.copilot/config.json` with `logged_in_users` + `copilot_tokens`, `~/.gemini/`) |

### Windows (sitti@192.168.50.253) — x64, Windows 11 Pro
| Item | Finding |
|------|---------|
| App-local bin/ | Does NOT exist yet |
| App data dir | `%LOCALAPPDATA%\RWM\Puppet Master\data\` exists with `.puppet-master\` and `progress.txt` |
| Node.js | v22.18.0 at `C:\Program Files\nodejs\node.exe` — in PATH |
| npm | At `C:\Program Files\nodejs\npm.cmd` — in PATH |
| gh CLI | At `C:\Program Files\GitHub CLI\gh.exe` — in PATH |
| Claude | `%APPDATA%\npm\claude.cmd` (global npm install, correct binary) |
| Copilot | `%APPDATA%\npm\copilot.cmd` (global npm `@github/copilot`, version 0.0.406, CORRECT binary) |
| Cursor | `%LOCALAPPDATA%\cursor-agent\agent.cmd` — installs to its own location |
| Global auth dirs | All exist (`%USERPROFILE%\.claude\`, `%USERPROFILE%\.copilot\`, `%USERPROFILE%\.gemini\`) |
| HOME/USERPROFILE | Both set to `C:\Users\sitti` |

---

## Issue Inventory (11 Issues)

### Issue 1: npm wrapper scripts break when copied to app-local bin/ (CRITICAL)
**Affects:** Codex, Gemini, Playwright — ALL platforms
**Root cause:** `npm_installer.rs` copies wrapper scripts from `{lib}/bin/` to `{APP_BIN}/`. These scripts use relative paths (`require.resolve()`, `require('./lib/...')`) that break when moved away from their `node_modules/` directory.

**SSH evidence (macOS):**
- `codex` (6659B): Node.js script calling `require.resolve('@openai/codex-darwin-arm64/package.json')` — fails when not next to its `node_modules/`
- `playwright` (698B): Node.js script calling `require('./lib/program')` — `./lib/program` doesn't exist at new location
- Both fail with module resolution errors even when node is available

**File:** `puppet-master-rs/src/install/npm_installer.rs` — `copy_npm_bin_to_app_bin()` function

---

### Issue 2: Cursor `agent` script needs its entire bundle, not just the entry script
**Affects:** Cursor — ALL platforms
**Root cause:** `script_installer.rs` copies only the 800-byte shell wrapper script to `{APP_BIN}/agent`. The script expects `node` and `index.js` in the SAME directory:
```bash
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
NODE_BIN="$SCRIPT_DIR/node"
exec -a "$0" "$NODE_BIN" --use-system-ca "$SCRIPT_DIR/index.js" "$@"
```
The real Cursor agent bundle lives at `~/.local/share/cursor-agent/versions/<ver>/` containing `cursor-agent`, `node`, `index.js`, and more.

**Additional bug:** `copy_to_app_bin()` at line 267-278 returns `success: true` even when the binary isn't found, creating false success reports.

**File:** `puppet-master-rs/src/install/script_installer.rs`

---

### Issue 3: Copilot installer downloads the WRONG binary (CRITICAL)
**Affects:** ALL platforms
**Root cause:** `copilot_installer.rs` downloads from `github/gh-copilot` GitHub Releases. This installs the **suggest/explain tool** (v1.2.0), NOT the Copilot coding agent.

**SSH evidence (macOS copilot --help):**
```
Available Commands: alias, config, explain, suggest
Flags: -h --help, --hostname, -v --version
```
NO `-p`, NO `--allow-all-tools` — this is fundamentally the wrong product.

**Correct binary:** `@github/copilot` npm package (confirmed on Windows: `copilot --version` → `GitHub Copilot CLI 0.0.406` with full coding agent capabilities).

**Fix:** Route Copilot through `npm_installer.rs` with package `@github/copilot`, like Codex and Gemini. Remove `copilot_installer.rs`.

**Files:**
- `puppet-master-rs/src/install/copilot_installer.rs` — delete or deprecate
- `puppet-master-rs/src/install/install_coordinator.rs` — reroute Copilot to npm installer
- `puppet-master-rs/src/platforms/platform_specs.rs` — update `npm_package_info(Platform::Copilot)` to return `Some(("@github/copilot", "copilot"))`

---

### Issue 4: GitHub CLI installer fails on macOS (wrong archive format)
**Affects:** macOS only
**Root cause:** `github_cli_installer.rs:150-174` uses `.tar.gz` for all non-Windows platforms, but GitHub CLI macOS releases use `.zip`.

```rust
// BUG at current_platform_keys():
#[cfg(target_os = "windows")]
let ext = ".zip";
#[cfg(not(target_os = "windows"))]
let ext = ".tar.gz";  // Wrong for macOS — macOS gh assets are .zip
```

**File:** `puppet-master-rs/src/install/github_cli_installer.rs`

---

### Issue 5: Node installer fails on macOS (Homebrew-only, no fallback)
**Affects:** macOS without Homebrew
**Root cause:** `install_node_macos()` only tries `brew install node` with no nvm fallback. The target Mac has no Homebrew, but Node IS available via nvm.

**SSH evidence:** `brew --version` → command not found. `bash -lc "which node"` → `/usr/local/bin/node v22.18.0`.

**Additional bug:** Even when Homebrew IS available, `Command::new("brew")` doesn't use `build_enhanced_path_for_subprocess()`, so brew at `/opt/homebrew/bin/brew` isn't found from the GUI's minimal PATH.

**File:** `puppet-master-rs/src/install/node_installer.rs`

---

### Issue 6: Model discovery treats fallback models as errors (CRITICAL)
**Affects:** Copilot, Codex — ALL platforms
**Root cause:** Chain of 3 failures:

1. **SDK packages never installed:** `@github/copilot-sdk` and `@openai/codex-sdk` are referenced in `platform_specs` but never installed by the app. SDK model listing always fails.

2. **CLI fallback is None:** Both Copilot and Codex have `model_discovery.cli_command: None` in `platform_specs.rs`. `refresh_models_cli_blocking()` correctly returns `CachedModelList::from_fallback()` with `source: ModelSource::Fallback`.

3. **Fallback converted to Err (the actual bug):** In `app.rs:2544-2548`:
```rust
if cached.source == ModelSource::Fallback {
    Message::RefreshModelsComplete(p, Err("Model discovery unavailable; keeping existing cached models".into()))
}
```
Then at `app.rs:2616-2621`, the `Err` path shows an error toast AND **discards the fallback models** instead of using them:
```rust
Err(e) => {
    self.add_toast(ToastType::Error, format!("Failed to refresh models for {:?}: {}", platform, e));
}
```

**Same bug exists in `RefreshModelsForPlatform` handler at `app.rs:2579`.**

**Additional sub-issue:** `SdkBridge::new()` uses `which("node")` (`sdk_bridge.rs:41`) which fails in GUI app context because macOS GUI apps inherit minimal PATH.

**Files:**
- `puppet-master-rs/src/app.rs:2522-2624` — RefreshModels handlers
- `puppet-master-rs/src/platforms/model_catalog.rs:476-606` — refresh pipeline
- `puppet-master-rs/src/platforms/sdk_bridge.rs:40-42` — Node.js detection

---

### Issue 7: Auth false positives from global credential directories
**Affects:** Claude, Gemini, Copilot — ALL platforms
**Root cause:** `auth_status.rs` checks global credential directories (`~/.claude/`, `~/.gemini/`, `~/.copilot/config.json`) which are shared across all CLI installations on the machine.

**SSH confirmed:** All 3 machines have these directories populated from previous global CLI usage. The app-local binaries do read these same credentials (they're per-user, not per-installation), so technically the auth IS valid — but the user didn't log in via Puppet Master.

**Decision (from investigation):** The behavior is correct — shared credentials work. The fix should:
1. Clearly indicate the credential source in the UI message
2. If the platform CLI is NOT installed (detection returns None), return "not installed" immediately — don't check credentials for a binary that doesn't exist

**File:** `puppet-master-rs/src/platforms/auth_status.rs`

---

### Issue 8: `resolve_program()` in auth_status falls back to system PATH
**Affects:** ALL platforms (Linux/Windows especially)
**Root cause:** `auth_status.rs:377-405` checks app-local first but falls back to system PATH, finding system-installed CLIs (e.g., `/usr/bin/gh` on Linux, `C:\Program Files\GitHub CLI\gh.exe` on Windows) that may be authenticated.

**File:** `puppet-master-rs/src/platforms/auth_status.rs:377-405`

---

### Issue 9: Setup page shows BOTH Login and Logout buttons simultaneously
**Affects:** ALL platforms (UI bug)
**Root cause:** In `setup.rs:117-165`:
- Lines 117-136: When installed, always shows "Login" button
- Lines 161-165: Also appends "Logout" button if installed and not actively authenticating

**File:** `puppet-master-rs/src/views/setup.rs:117-165`

---

### Issue 10: Setup page missing Node.js and GitHub CLI installers
**Affects:** ALL platforms
**Root cause:** Setup view only shows the 5 AI platforms. Node.js and GitHub CLI are prerequisites but only available in Wizard step 1.

**File:** `puppet-master-rs/src/views/setup.rs`

---

### Issue 11: Playwright install works but GUI doesn't update
**Affects:** ALL platforms
**Root cause:** Playwright browsers ARE installed correctly, but:
1. The `bin/playwright` wrapper is broken (Issue 1 — npm wrapper copy problem)
2. `playwright_check.rs` doesn't check `{APP_DATA_DIR}/playwright-browsers/` — only checks system default locations (`~/.cache/ms-playwright/`)
3. `PLAYWRIGHT_BROWSERS_PATH` env var not set when running checks

**Files:**
- `puppet-master-rs/src/doctor/checks/playwright_check.rs`
- `puppet-master-rs/src/install/playwright_installer.rs`

---

## Implementation Plan (11 Fixes, ordered by dependency)

### Fix 1: Add missing directories to macOS PATH fallbacks
**File:** `puppet-master-rs/src/platforms/path_utils.rs`
**Function:** `get_fallback_directories()`

Add `/usr/local/bin` to macOS fallback list and scan Homebrew Cellar for versioned node installs:

```rust
#[cfg(target_os = "macos")]
{
    dirs.push(PathBuf::from("/opt/homebrew/bin"));
    dirs.push(PathBuf::from("/opt/local/bin"));
    dirs.push(PathBuf::from("/usr/local/bin")); // ADD — nvm, manual installs

    // Homebrew Cellar versioned node installs (ARM Macs)
    if let Ok(entries) = std::fs::read_dir("/opt/homebrew/Cellar/node") {
        for entry in entries.flatten() {
            let node_bin = entry.path().join("bin");
            if node_bin.join("node").exists() {
                dirs.push(node_bin);
            }
        }
    }
    // Intel Mac Homebrew location
    if let Ok(entries) = std::fs::read_dir("/usr/local/Cellar/node") {
        for entry in entries.flatten() {
            let node_bin = entry.path().join("bin");
            if node_bin.join("node").exists() {
                dirs.push(node_bin);
            }
        }
    }
}
```

Also ensure Windows has `C:\Program Files\nodejs\` in fallback dirs:
```rust
#[cfg(target_os = "windows")]
{
    if let Some(program_files) = std::env::var_os("ProgramFiles") {
        let nodejs_dir = PathBuf::from(program_files).join("nodejs");
        if nodejs_dir.exists() {
            dirs.push(nodejs_dir);
        }
    }
}
```

**Impact:** Unblocks Fixes 2, 3, 5, and all npm-based installs on macOS.

---

### Fix 2: Node installer — macOS nvm fallback + enhanced PATH for brew
**File:** `puppet-master-rs/src/install/node_installer.rs`

**Changes:**
1. Before installing, check if Node is already available via `bash -lc "node --version"`. If found, skip installation.

2. Add `.env("PATH", build_enhanced_path_for_subprocess())` to the `brew` command so it's found from GUI context.

3. Extract nvm install logic from `install_node_linux()` into a shared `install_via_nvm()` function and add it as fallback in `install_node_macos()`:
```rust
async fn install_node_macos(log_lines: &mut Vec<String>) -> InstallOutcome {
    // Step 0: Check if node already available via login shell
    if let Some(version) = check_node_via_login_shell().await {
        return InstallOutcome::already_installed(version);
    }

    // Step 1: Try brew (with enhanced PATH)
    if let Ok(brew_path) = which::which("brew")
        .or_else(|_| crate::platforms::path_utils::resolve_executable("brew").ok_or(()))
    {
        let result = try_brew_install(&brew_path, log_lines).await;
        if result.success { return result; }
    }

    // Step 2: Fallback to nvm (same as Linux)
    install_via_nvm(log_lines).await
}
```

---

### Fix 3: npm wrapper scripts — bin shim framework (CRITICAL)
**File:** `puppet-master-rs/src/install/npm_installer.rs`

**The copy strategy is fundamentally broken.** npm wrapper scripts use relative paths that break when moved. Replace `copy_npm_bin_to_app_bin()` with a shim generator.

**Unix shim template** (`{APP_BIN}/{tool_name}`):
```bash
#!/usr/bin/env bash
# Auto-generated shim for {tool_name} — do not edit
# Delegates to the npm-installed wrapper with correct environment
LIB_DIR="{APP_DATA_DIR}/lib"
export NODE_PATH="$LIB_DIR/lib/node_modules"
export PATH="{node_parent_dir}:$PATH"
exec "$LIB_DIR/bin/{tool_name}" "$@"
```

**Windows shim template** (`{APP_BIN}/{tool_name}.cmd`):
```cmd
@echo off
REM Auto-generated shim for {tool_name} — do not edit
set "LIB_DIR={APP_DATA_DIR}\lib"
set "NODE_PATH=%LIB_DIR%\lib\node_modules"
set "PATH={node_parent_dir};%PATH%"
"%LIB_DIR%\bin\{tool_name}.cmd" %*
```

**Implementation steps:**
1. Create a `generate_bin_shim(tool_name: &str, node_dir: Option<&Path>) -> Result<PathBuf>` function
2. Resolve `node` path using `path_utils::resolve_executable("node")` to get `node_parent_dir`
3. Write the shim to `{APP_BIN}/{tool_name}` (Unix) or `{APP_BIN}/{tool_name}.cmd` (Windows)
4. Set executable bit on Unix
5. **Verify** the shim works: run `{APP_BIN}/{tool_name} --version` and check exit code
6. If verification fails, return `InstallOutcome::failure` — do NOT report false success

**Also add `--include=optional`** to the npm install command to ensure platform-specific native binaries (like `@openai/codex-darwin-arm64`) are installed:
```rust
.args(["install", "-g", pkg.package_name, "--include=optional"])
```

**Alternative (simpler but less isolated):** Instead of generating shims, add `{APP_DATA_DIR}/lib/bin/` to `get_fallback_directories()` so detection finds the npm wrappers in-place. The shim approach is preferred because it provides environment isolation.

---

### Fix 4: Cursor install — detect from real install location
**File:** `puppet-master-rs/src/install/script_installer.rs`

**Recommended approach (Option B from sugfix4 — least invasive):**

After running the Cursor install script, instead of copying the shell wrapper:
1. Find the real Cursor agent bundle directory: `~/.local/share/cursor-agent/versions/<latest>/`
2. Create a shim in `{APP_BIN}/agent` that points to the real bundle:

**Unix shim:**
```bash
#!/usr/bin/env bash
# Auto-generated shim for Cursor agent
CURSOR_VER_DIR="$(ls -dt ~/.local/share/cursor-agent/versions/*/ 2>/dev/null | head -1)"
if [ -z "$CURSOR_VER_DIR" ]; then
    echo "Error: Cursor agent not found. Please reinstall." >&2
    exit 1
fi
exec "${CURSOR_VER_DIR}cursor-agent" "$@"
```

**Windows shim (`agent.cmd`):**
```cmd
@echo off
REM Auto-generated shim for Cursor agent
for /f "delims=" %%d in ('dir /b /o-d "%LOCALAPPDATA%\cursor-agent\versions\*" 2^>nul') do (
    "%LOCALAPPDATA%\cursor-agent\versions\%%d\cursor-agent.cmd" %*
    exit /b %ERRORLEVEL%
)
echo Error: Cursor agent not found. Please reinstall. >&2
exit /b 1
```

**Also fix `copy_to_app_bin()`** — change the `None` branch at line 267-278 to return `success: false`:
```rust
None => {
    InstallOutcome {
        success: false,  // Was `true` — misleading
        message: format!("{dst_name} installation script completed but binary could not be located."),
        log_lines: log_lines.clone(),
        installed_path: None,
    }
}
```

---

### Fix 5: Copilot — switch from GitHub Releases binary to npm package
**Files:**
- `puppet-master-rs/src/platforms/platform_specs.rs` — `npm_package_info()`
- `puppet-master-rs/src/install/copilot_installer.rs` — deprecate
- `puppet-master-rs/src/install/install_coordinator.rs` — reroute

**Changes:**

1. In `platform_specs.rs`, update `npm_package_info()` for Copilot:
```rust
Platform::Copilot => Some(("@github/copilot", "copilot")),
// Was: None (used dedicated copilot_installer.rs)
```

2. In `install_coordinator.rs`, route Copilot through the npm installer:
```rust
Platform::Copilot => {
    // Was: copilot_installer::install_copilot_app_local().await
    // Now: use npm installer (same as Codex/Gemini)
    npm_installer::npm_install_to_app_dir(Platform::Copilot).await
}
```

3. Update the test `npm_package_for_copilot_returns_none` to expect `Some(...)`.

4. `copilot_installer.rs` can be kept for reference but should no longer be called from `install_coordinator.rs`.

5. Update `platform_specs.rs` Copilot version_command: The npm `@github/copilot` uses `--version` (not `version`), verify and update if needed.

6. Update `platform_compatibility_check.rs`: verify the npm copilot binary actually has `--allow-all-tools` in its help output. If not, remove that requirement.

---

### Fix 6: GitHub CLI installer — macOS zip support
**File:** `puppet-master-rs/src/install/github_cli_installer.rs`
**Function:** `current_platform_keys()`

```rust
// BEFORE:
#[cfg(target_os = "windows")]
let ext = ".zip";
#[cfg(not(target_os = "windows"))]
let ext = ".tar.gz";

// AFTER:
#[cfg(target_os = "windows")]
let ext = ".zip";
#[cfg(target_os = "macos")]
let ext = ".zip";      // macOS gh releases are .zip
#[cfg(target_os = "linux")]
let ext = ".tar.gz";
#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
let ext = ".tar.gz";   // Default fallback
```

Verify that `extract_and_install_gh()` dispatches to zip extraction on macOS. The zip extraction code already exists (used for Windows) — just ensure it's triggered when the downloaded file is `.zip`.

---

### Fix 7: Model discovery — stop treating fallback as error
**Files:** `puppet-master-rs/src/app.rs`, `puppet-master-rs/src/platforms/sdk_bridge.rs`

**Fix 7a — `app.rs` RefreshModels handler (line ~2544):**

Stop converting `ModelSource::Fallback` into `Err`. Always return `Ok` with the models:

```rust
// BEFORE (line ~2544):
if cached.source == crate::platforms::model_catalog::ModelSource::Fallback {
    Message::RefreshModelsComplete(p, Err("Model discovery unavailable; keeping existing cached models".into()))
} else {
    Message::RefreshModelsComplete(p, Ok(cached.models))
}

// AFTER:
// Fallback models are valid data — always return Ok
Message::RefreshModelsComplete(p, Ok(cached.models))
```

Apply the **same fix** to `RefreshModelsForPlatform` handler at line ~2579.

Optionally, add an info-level log: `log::info!("Using fallback models for {:?} (no CLI/SDK discovery available)", platform);`

**Fix 7b — `sdk_bridge.rs` SdkBridge::new() (line 41):**

Add app-local and enhanced PATH node resolution:
```rust
pub fn new() -> Option<Self> {
    // Try system PATH first
    if let Ok(node_path) = which("node") {
        return Some(Self { node_path });
    }
    // Try enhanced PATH resolution (finds nvm, brew Cellar, etc.)
    if let Some(node_path) = crate::platforms::path_utils::resolve_executable("node") {
        return Some(Self { node_path });
    }
    // Try app-local bin (GUI apps may not inherit full PATH)
    if let Ok(Some(bin_dir)) = crate::install::app_paths::get_app_bin_dir().map(Some) {
        let app_node = bin_dir.join("node");
        if app_node.exists() {
            return Some(Self { node_path: app_node });
        }
    }
    None
}
```

**Fix 7c — `sdk_bridge.rs` node_command_with_global_path():**

Add app-local lib to `NODE_PATH` so SDK packages installed there are found:
```rust
fn node_command_with_global_path(&self) -> tokio::process::Command {
    let mut command = tokio::process::Command::new(&self.node_path);

    // Build NODE_PATH: app-local lib + system global
    let mut node_paths = Vec::new();
    if let Ok(lib_dir) = crate::install::app_paths::get_lib_dir() {
        node_paths.push(lib_dir.join("lib").join("node_modules").to_string_lossy().to_string());
    }
    if let Some(global_root) = self.npm_global_root() {
        node_paths.push(global_root);
    }
    if let Ok(existing) = std::env::var("NODE_PATH") {
        if !existing.trim().is_empty() {
            node_paths.push(existing);
        }
    }

    if !node_paths.is_empty() {
        let sep = if cfg!(target_os = "windows") { ";" } else { ":" };
        command.env("NODE_PATH", node_paths.join(sep));
    }

    // Also set enhanced PATH for subprocess
    command.env("PATH", crate::platforms::path_utils::build_enhanced_path_for_subprocess());
    command
}
```

**Fix 7d — `model_catalog.rs` refresh_models_cli_blocking():**

Add enhanced PATH to CLI model discovery commands:
```rust
let output = std::process::Command::new(&resolved)
    .args(discovery.cli_args)
    .env("PATH", crate::platforms::path_utils::build_enhanced_path_for_subprocess()) // ADD
    .stdout(std::process::Stdio::piped())
    .stderr(std::process::Stdio::piped())
    .output();
```

---

### Fix 8: Auth detection improvements
**File:** `puppet-master-rs/src/platforms/auth_status.rs`

**Changes:**

1. **Gate auth checks on detection:** If the platform CLI is NOT installed (detection returns None), return "not installed" immediately — don't check credentials for a binary that doesn't exist:
```rust
async fn check_platform(&self, platform: Platform) -> AuthCheckResult {
    // If CLI not detected, auth is irrelevant
    if crate::platforms::platform_detector::PlatformDetector::detect_platform(platform).await.is_none() {
        return AuthCheckResult::not_authenticated(
            format!("{} CLI not installed", platform)
        );
    }
    // ... proceed with existing auth checks
}
```

2. **Cross-platform home directory resolution:** Replace `std::env::var("HOME")` with a helper that checks both `HOME` and `USERPROFILE`:
```rust
fn get_home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}
```

3. **Clarify auth source in status message:** When credentials come from global dirs, indicate this:
```rust
// Example for Claude:
AuthCheckResult::authenticated(
    "Authenticated (credentials from previous CLI login at ~/.claude/)"
)
```

4. **`resolve_program()` (line 377-405):** Prefer app-local but still accept system binaries for auth checking. The credentials are per-user anyway, so finding `gh` at `/usr/bin/gh` is valid for checking `gh auth status`. Document this decision in a comment.

---

### Fix 9: Setup page UI fixes
**File:** `puppet-master-rs/src/views/setup.rs`

**Fix 9a — Unified login/logout button:**

Replace the dual Login+Logout with a dynamic button based on auth status:
```rust
let auth_btn = if !is_installed {
    // Not installed — show Install button only (already handled above)
    None
} else if is_installing {
    Some(styled_button(theme, "Installing...", ButtonVariant::Primary))
} else if let Some(kind) = auth_action {
    // Auth action in progress
    match kind {
        AuthActionKind::Login => Some(styled_button(theme, "Logging in...", ButtonVariant::Info)),
        AuthActionKind::Logout => Some(styled_button(theme, "Logging out...", ButtonVariant::Danger)),
    }
} else if is_authenticated {
    // Authenticated — show Logout only
    Some(styled_button(theme, "Logout", ButtonVariant::Danger)
        .on_press(Message::PlatformLogout(auth_target)))
} else {
    // Not authenticated — show Login only
    Some(styled_button(theme, "Login", ButtonVariant::Info)
        .on_press(Message::PlatformLogin(auth_target)))
};
```

**Note:** This requires passing auth status data to the setup view. Add an `auth_statuses: &HashMap<AuthTarget, bool>` parameter to the `view()` function.

**Fix 9b — Add Node.js and GitHub CLI prerequisite sections:**

Add a "Prerequisites" panel before the AI platform cards showing:
- Node.js status (installed version or "Not installed") + Install button
- GitHub CLI status + Install button

Use `Message::WizardInstallNode` and `Message::WizardInstallGhCli` (or add `SetupInstallNode`/`SetupInstallGhCli` aliases) to trigger installs.

---

### Fix 10: Post-install detection refresh + model auto-refresh
**File:** `puppet-master-rs/src/app.rs`

**Fix 10a — Ensure detection refreshes after install:**

In `SetupInstallComplete`, `WizardDepInstallDone`, and `FixCheckComplete` handlers, ensure all of these are triggered:
1. Platform re-detection (`SetupRunDetection`)
2. Auth status refresh (`RefreshAuthStatus`)
3. Model refresh for the installed platform (`RefreshModelsForPlatform(platform)`)

```rust
Message::SetupInstallComplete(platform, res) => {
    self.setup_installing = None;
    match &res {
        Ok(()) => {
            self.add_toast(ToastType::Success, format!("{} installed", platform));
            return Task::batch(vec![
                self.update(Message::SetupRunDetection),
                self.update(Message::RefreshAuthStatus),
                Task::done(Message::RefreshModelsForPlatform(platform)),
            ]);
        }
        Err(e) => { /* error handling */ }
    }
}
```

**Fix 10b — Auto-refresh models after login:**

In `PlatformLoginComplete` handler, trigger model refresh:
```rust
// After successful login, refresh models for that platform
return Task::done(Message::RefreshModelsForPlatform(platform));
```

---

### Fix 11: Playwright detection — check app-local browser path
**File:** `puppet-master-rs/src/doctor/checks/playwright_check.rs`

1. Add `{APP_DATA_DIR}/playwright-browsers/` to the checked browser directories (before system default paths)
2. Set `PLAYWRIGHT_BROWSERS_PATH` env var when running playwright check commands
3. When spawning any playwright command, include enhanced PATH and the env var:

```rust
let browsers_dir = crate::install::app_paths::get_playwright_browsers_dir();
cmd.env("PLAYWRIGHT_BROWSERS_PATH", &browsers_dir);
cmd.env("PATH", crate::platforms::path_utils::build_enhanced_path_for_subprocess());
```

---

## DRY Impact Matrix

All fixes are in shared modules, so they automatically apply across all screens:

| Shared Module | Fixes | Screens Affected |
|---|---|---|
| `platforms/path_utils.rs` | Fix 1 | ALL (used by every detection/install/auth flow) |
| `install/node_installer.rs` | Fix 2 | Wizard, Doctor, Setup |
| `install/npm_installer.rs` | Fix 3 | Wizard, Doctor, Setup (Codex, Gemini, Copilot, Playwright) |
| `install/script_installer.rs` | Fix 4 | Wizard, Doctor, Setup (Cursor) |
| `platforms/platform_specs.rs` + `install/install_coordinator.rs` | Fix 5 | ALL |
| `install/github_cli_installer.rs` | Fix 6 | Wizard, Doctor, Setup |
| `app.rs` + `platforms/model_catalog.rs` + `platforms/sdk_bridge.rs` | Fix 7 | Config, Wizard (model selection) |
| `platforms/auth_status.rs` | Fix 8 | Login, Setup, Doctor, Config |
| `views/setup.rs` | Fix 9 | Setup page |
| `app.rs` | Fix 10 | All (message handlers) |
| `doctor/checks/playwright_check.rs` | Fix 11 | Doctor page |

---

## Implementation Order

### Phase 1: Foundation (unblocks everything else)
1. **Fix 1** — macOS PATH fallbacks (unblocks npm installs)
2. **Fix 2** — Node installer nvm fallback (unblocks npm-based installs on macOS)

### Phase 2: Critical install fixes
3. **Fix 3** — npm bin shim framework (fixes Codex/Gemini/Playwright)
4. **Fix 4** — Cursor install shim (fixes Cursor detection)
5. **Fix 5** — Copilot npm package switch (fixes wrong binary)
6. **Fix 6** — GH CLI macOS zip (fixes gh install on macOS)

### Phase 3: Model discovery & auth
7. **Fix 7** — Model discovery fallback handling + SDK bridge
8. **Fix 8** — Auth detection improvements

### Phase 4: UI & refresh
9. **Fix 9** — Setup page UI fixes
10. **Fix 10** — Post-install refresh + model auto-refresh
11. **Fix 11** — Playwright browser path detection

---

## Verification Plan

### Step 1: Build
```bash
cd puppet-master-rs && cargo check && cargo test --lib
```

### Step 2: macOS Verification (most issues are here)
Run the same verification steps on macOS. SSH connection details and credentials MUST be handled outside this repository (no plaintext secrets).

1. Install Node (should use nvm fallback since no brew)
2. Install GH CLI (should download .zip)
3. Install Codex (shim should delegate to npm wrapper; `codex --version` works)
4. Install Gemini (same pattern)
5. Install Copilot (should use npm `@github/copilot`; has `--allow-all-tools`)
6. Install Cursor (shim should point to bundle dir)
7. Verify detection shows all installed
8. Verify auth shows correct status with source indication
9. Verify models load (fallback or dynamic) without error toasts
10. Install Playwright; verify browsers detected

### Step 3: Linux Verification
Run the same verification steps on Linux.

Focus on:
- App-local installs creating correct shims
- Detection finding app-local (not system) CLIs

ContractRef: Plans/Architecture_Invariants.md#INV-002

### Step 4: Windows Verification
Same tests adapted for Windows paths and `.cmd` wrappers. Focus on:
- `.cmd` shim generation
- `USERPROFILE` used correctly for auth dirs
- `ensure_app_bin_dir()` creates `bin\` before first install

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Cursor wrapper approach fragile (version path changes on update) | Medium | Use dynamic path discovery (`ls -dt`) or latest version detection |
| npm `--include=optional` may not work on all npm versions | Low | Test on all 3 machines; fallback to `--force` |
| Copilot npm package name may differ | Low | Verified on Windows: `@github/copilot` (v0.0.406) |
| Windows app-local `bin\` not created yet | Medium | `ensure_app_bin_dir()` must be called before any install |
| `@openai/codex-sdk` / `@github/copilot-sdk` may not exist as separate packages | Medium | Fix 7 makes this irrelevant — fallback models used gracefully |
| Shim scripts may need different env vars per platform | Low | Template is parameterized; test per platform |
| Breaking existing cargo tests | Low | All changes in installer/detection code; run `cargo test --lib` after each fix |

---

## Files to Modify (Complete List)

```
puppet-master-rs/src/platforms/path_utils.rs              # Fix 1
puppet-master-rs/src/install/node_installer.rs            # Fix 2
puppet-master-rs/src/install/npm_installer.rs             # Fix 3 (shim framework)
puppet-master-rs/src/install/script_installer.rs          # Fix 4 (Cursor shim + false success)
puppet-master-rs/src/platforms/platform_specs.rs          # Fix 5 (Copilot npm_package_info)
puppet-master-rs/src/install/install_coordinator.rs       # Fix 5 (reroute Copilot)
puppet-master-rs/src/install/copilot_installer.rs         # Fix 5 (deprecate)
puppet-master-rs/src/install/github_cli_installer.rs      # Fix 6 (macOS .zip)
puppet-master-rs/src/app.rs                               # Fix 7a, 10 (model refresh + post-install)
puppet-master-rs/src/platforms/model_catalog.rs            # Fix 7d (enhanced PATH)
puppet-master-rs/src/platforms/sdk_bridge.rs              # Fix 7b, 7c (node resolution + NODE_PATH)
puppet-master-rs/src/platforms/auth_status.rs             # Fix 8 (auth improvements)
puppet-master-rs/src/views/setup.rs                       # Fix 9 (UI fixes)
puppet-master-rs/src/doctor/checks/playwright_check.rs    # Fix 11 (browser path)
```

---

## Cross-Platform Summary

| Issue | macOS | Linux | Windows |
|-------|-------|-------|---------|
| npm wrappers broken after copy | BROKEN | WILL BREAK | WILL BREAK |
| Cursor agent script broken | BROKEN | WILL BREAK | WILL BREAK (.cmd variant) |
| Copilot is wrong binary | YES | YES | NO (Windows already has correct npm binary) |
| GH CLI install fails (zip vs tar.gz) | BROKEN | OK | OK |
| Node install fails (no brew fallback) | BROKEN | OK (apt) | OK (winget) |
| Model refresh error toast | YES | YES | YES |
| Auth false positive from global creds | YES | YES | YES |
| Setup dual login/logout buttons | YES | YES | YES |
| Setup missing Node/GH CLI | YES | YES | YES |
| Playwright GUI not updating | YES | YES | YES |
| PATH resolution missing dirs | YES | OK | OK (but GUI apps may need enhanced PATH) |
