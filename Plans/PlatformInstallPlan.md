# Platform Installer Rework — App-Local CLI Installations

> NON-CANONICAL / legacy work note: this document is retained for historical context only.
> Follow `Plans/Spec_Lock.json` + `Plans/Crosswalk.md` for current SSOT.
>
> ContractRef: SchemaID:Spec_Lock.json

## Context

The current CLI detection pipeline tries to find tools across dozens of system paths (PATH, shell profiles, platform-specific dirs). This is fragile in GUI apps where PATH is minimal, produces inconsistent results across machines, and makes it impossible to know exactly where a CLI lives or what version will be invoked. Specific failures today: Node install says "run manually", Codex/Copilot SDKs fail to install, Playwright can't find node, Doctor shows spurious Cargo.toml / config-not-found warnings.

**New approach:** Install every CLI into the Puppet Master app data directory (`{APP_DATA_DIR}/bin/`) so the app always knows the exact binary path. Detection always checks this directory first. Node.js is the only exception — it gets installed system-wide (it's a runtime the user needs broadly).

---

## App-Local Directory Structure

```
{APP_DATA_DIR}/          # Linux: ~/.local/share/rwm-puppet-master/
                         # macOS: ~/Library/Application Support/RWM Puppet Master/
                         # Windows: %LOCALAPPDATA%\RWM Puppet Master\
├── bin/                 # All CLI binaries live here
│   ├── gh               # GitHub CLI
│   ├── claude           # Claude Code
│   ├── agent            # Cursor agent
│   ├── codex            # OpenAI Codex
│   ├── gemini           # Google Gemini CLI
│   └── copilot          # GitHub Copilot
├── lib/node_modules/    # npm package installs (with NPM_CONFIG_PREFIX)
└── playwright-browsers/ # Playwright browser binaries
```

---

## Implementation Status

### Phase 1 — Foundation ✅ COMPLETE
- `puppet-master-rs/src/install/app_paths.rs` — get_app_data_dir, get_app_bin_dir, etc.
- `puppet-master-rs/src/install/mod.rs` — module declarations
- `puppet-master-rs/src/lib.rs` — added `pub mod install`

### Phase 2 — Install Logic ✅ COMPLETE
- `puppet-master-rs/src/install/node_installer.rs`
- `puppet-master-rs/src/install/npm_installer.rs`
- `puppet-master-rs/src/install/github_cli_installer.rs`
- `puppet-master-rs/src/install/script_installer.rs`
- `puppet-master-rs/src/install/playwright_installer.rs`
- `puppet-master-rs/src/install/install_coordinator.rs`

### Phase 3 — Detection Update ✅ COMPLETE
- `puppet-master-rs/src/platforms/path_utils.rs` — app_bin_dir prepended to fallback dirs
- `puppet-master-rs/src/platforms/platform_detector.rs` — Stage -1 app-local bin check

### Phase 4 — Doctor/Installation Wiring ✅ COMPLETE
- `puppet-master-rs/src/doctor/installation_manager.rs` — install instructions target app-local bin dir; installs delegate to install_coordinator
- `puppet-master-rs/src/doctor/checks/sdk_checks.rs` — SDK checks + fixes use `NPM_CONFIG_PREFIX` for app-local installs

### Phase 5 — Config Fixes ✅ COMPLETE
- `puppet-master-rs/src/config/config_manager.rs` — persist default config on first launch

### Phase 6 — Wizard New Step ✅ COMPLETE
- `puppet-master-rs/src/app.rs` — DepInstallState + new Messages + step renumbering
- `puppet-master-rs/src/views/wizard.rs` — new step1_install_dependencies view

### Phase 7 — Doctor Warnings ✅ COMPLETE
- `puppet-master-rs/src/doctor/checks/wiring_check.rs` — graceful skip when not Rust project

### Phase 8 — App-Local Detection Enforcement ✅ COMPLETE
Detection was finding system-installed CLIs and treating them as valid. All pages (Setup, Doctor, Config, Wizard) showed wrong "installed" status.
- `puppet-master-rs/src/platforms/platform_detector.rs` — Removed Stages 2-6 (system PATH, default paths, common locations, fallback dirs, shell profiles). Detection now only checks Stage -1 (app-local bin), Stage 0 (project-local), Stage 1 (custom user path)
- `puppet-master-rs/src/platforms/path_utils.rs` — Added `resolve_app_local_executable()` helper
- `puppet-master-rs/src/types/platform.rs` — `resolve_cli_command()` checks app-local bin first (fixes all 5 runners + ai_verifier + prd_validators)
- `puppet-master-rs/src/platforms/auth_actions.rs` — Removed system PATH fallback from `resolve_platform_program()`; GitHub auth uses app-local
- `puppet-master-rs/src/app.rs` — Wizard gh check uses app-local; Wizard + Doctor trigger re-detection after installs
- `puppet-master-rs/src/doctor/checks/git_checks.rs` — Doctor gh check uses app-local

### Phase 9 — Installer + Auth + Model Fixes ✅ COMPLETE
Testing Phase 8 revealed: npm installs fail (exit 127, command not found), auth status bypasses app-local, model catalog bypasses app-local.

**All fixes applied:**
- `puppet-master-rs/src/install/npm_installer.rs` — `.env("PATH", build_enhanced_path_for_subprocess())` added ✅
- `puppet-master-rs/src/install/playwright_installer.rs` — `.env("PATH", build_enhanced_path_for_subprocess())` added ✅
- `puppet-master-rs/src/platforms/auth_status.rs` — `resolve_program()` checks `resolve_app_local_executable()` first ✅
- `puppet-master-rs/src/platforms/model_catalog.rs` — Replaced `which::which()` with `Platform::resolve_cli_command()` (app-local-first) ✅
- `puppet-master-rs/src/install/app_paths.rs` — Doc comments corrected to reflect actual `directories` crate v6 paths ✅

**Additional features added (by parallel agents):**
- Launch Platform CLI Button — Doctor page Launch button (`spawn_launch_cli()`, shell persistence, enhanced PATH)
- DRY Config Discovery — `config_discovery.rs`, shared `discover_config_path()`, Doctor/App/Wizard wired

**Build verified:** `cargo check` + `cargo test --lib` — 992 tests pass, 0 errors, 0 warnings.

---

## Verification Results

**Actual app-local data dir paths** (generated by `directories::ProjectDirs::from("com", "rwm", "RWM Puppet Master")`):
- Linux: `~/.local/share/rwmpuppetmaster/bin/`
- macOS: `~/Library/Application Support/com.rwm.RWM-Puppet-Master/bin/`
- Windows: `%LOCALAPPDATA%\RWM\Puppet Master\data\` (bin\ created on first wizard run)

1. **Linux (sittingmongoose@192.168.50.72)**: ✅ Binary installed (`/usr/bin/puppet-master` v0.1.1). App-local `bin/` dir exists at `~/.local/share/rwmpuppetmaster/bin/` (empty — no CLIs installed yet via wizard, expected on fresh machine). Node.js v25.5.0 available.
2. **macOS (jaredsmacbookair@192.168.50.115)**: ✅ App bundle installed (`/Applications/RWM Puppet Master.app` v0.1.1). App-local `bin/` at `~/Library/Application Support/com.rwm.RWM-Puppet-Master/bin/` has `claude` (v2.1.45) and `agent` (Cursor wrapper) installed.
3. **Windows (sitti@192.168.50.253)**: ✅ Binary installed (`C:\Program Files\RWM Puppet Master\puppet-master.exe`). App data dir at `%LOCALAPPDATA%\RWM\Puppet Master\`. Rust toolchain + Node.js available. `bin\` dir not yet created (expected — created on first wizard run).
4. **Doctor page**: Config discovery warnings fixed by DRY Config Discovery agent ✅
5. **Headless tests**: `cargo test --lib` — 992 tests pass ✅
