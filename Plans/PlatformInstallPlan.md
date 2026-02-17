# Platform Installer Rework — App-Local CLI Installations

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

---

## Verification Plan

1. **Linux (SSH: sittingmongoose@192.168.50.72)**: Launch app on clean machine. Run Platform Setup Wizard → step 1 should detect missing Node → click INSTALL → verify CLIs appear in `~/.local/share/rwm-puppet-master/bin/`
2. **macOS (SSH: jaredsmacbookair@192.168.50.115)**: Same flow. Verify in `~/Library/Application Support/RWM Puppet Master/bin/`
3. **Windows (interactive SSH: sitti@192.168.50.253)**: Same. Verify in `%LOCALAPPDATA%\RWM Puppet Master\bin\`
4. **Doctor page**: No "No config file found", no "Unable to locate crate root" warnings
5. **Playwright**: Install via Doctor → browsers in `{APP_DATA_DIR}/playwright-browsers/`
