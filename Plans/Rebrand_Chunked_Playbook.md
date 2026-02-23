# Rebrand Chunked Playbook

Convert the canonical rebrand plan into small, agent-executable chunks with clear scope, success criteria, evidence format, and builder/verifier prompts.

---

## Rebrand Goals and Invariants

- **ABSOLUTE NAMING RULE:** The platform name is **Puppet Master** only. Do not mention any prior or legacy product name in user-facing content. Where older naming exists, refer to it only as "legacy naming" (do not quote it).
- **Canonical token table** -- use these values everywhere:

| Token | Value |
|-------|--------|
| App display name | `Puppet Master` |
| Linux package name | `puppet-master` |
| Bundle identifier | `com.puppetmaster.puppet-master` |
| ProjectDirs triplet | `("com", "puppetmaster", "Puppet Master")` |
| Fallback data dir | `.puppet-master` |
| Autostart app ID | `com.puppetmaster.puppet-master` |
| Commit prefix | `pm:` |
| Completion signal | `<pm>COMPLETE</pm>` |
| Gutter signal | `<pm>GUTTER</pm>` |
| Branch naming pattern | `pm/{tier}/{id}` |
| Build env prefix | `PM_BUILD_` |
| User-agent | `puppet-master/1.0` |

- **Execution order:** Complete Phases 1-6 before any folder rename. Do not rename the project folder until Phases 1-6 are complete and committed.

---

## Priority Note

To reduce agent confusion, run these chunks early (even out of phase order): **rebrand-6a** (root and agent docs), **rebrand-3a** and **rebrand-3b** (UI title/header), **rebrand-4a** (bundle metadata). Remaining chunks follow phase order.

---

## Chunk List

### rebrand-1a -- Completion signals

- **Scope:**  
  `puppet-master-rs/src/platforms/runner.rs`, `puppet-master-rs/src/core/orchestrator.rs`, `puppet-master-rs/src/core/prompt_builder.rs`, `puppet-master-rs/src/core/execution_engine.rs`, `puppet-master-rs/src/platforms/output_parser.rs`, `puppet-master-rs/examples/output_parser_usage.rs`
- **Success criteria:**  
  - `grep -rE 'ralph|RWM' puppet-master-rs/src/platforms/runner.rs puppet-master-rs/src/core/orchestrator.rs puppet-master-rs/src/core/prompt_builder.rs puppet-master-rs/src/core/execution_engine.rs puppet-master-rs/src/platforms/output_parser.rs puppet-master-rs/examples/output_parser_usage.rs` exits 1 (no matches).  
  - `grep -E '<pm>COMPLETE</pm>|<pm>GUTTER</pm>'` appears in those files where signals are used.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; `cargo test` exit code and brief output; list of files changed.
- **Builder prompt:**  
  Implement completion and gutter signal rebrand for the listed files per Plans/rebrand.md Phase 1.1. Replace legacy signal tags with `<pm>COMPLETE</pm>` and `<pm>GUTTER</pm>`. In prompt_builder and output_parser_usage, also replace any legacy app name in headers with "Puppet Master". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-1a. Record grep exit codes, cargo test result, and the list of modified files to the chunk evidence artifact.

---

### rebrand-1b -- Commit prefix

- **Scope:**  
  `puppet-master-rs/src/git/commit_formatter.rs`
- **Success criteria:**  
  - `grep -E 'ralph|RWM' puppet-master-rs/src/git/commit_formatter.rs` exits 1.  
  - `grep 'pm:' puppet-master-rs/src/git/commit_formatter.rs` exits 0.  
  - `cd puppet-master-rs && cargo check && cargo test` passes (including commit_formatter tests).
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement commit prefix rebrand in commit_formatter.rs per Plans/rebrand.md Phase 1.2. Replace legacy commit prefix with `pm:` in format strings and doc comments; update "Puppet Master conventions" wording and all tests to expect `pm:`. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-1b. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-1c -- Default branch naming pattern

- **Scope:**  
  `puppet-master-rs/src/config/gui_config.rs`, `puppet-master-rs/src/types/config.rs`
- **Success criteria:**  
  - `grep -E 'rwm/\{tier\}|\"rwm/' puppet-master-rs/src/config/gui_config.rs puppet-master-rs/src/types/config.rs` exits 1.  
  - `grep 'pm/{tier}/{id}' puppet-master-rs/src/config/gui_config.rs puppet-master-rs/src/types/config.rs` exits 0.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement default branch naming pattern rebrand per Plans/rebrand.md Phase 1.3. In default_naming_pattern() in both files, replace legacy pattern with `pm/{tier}/{id}`. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-1c. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-1d -- Build env vars

- **Scope:**  
  `puppet-master-rs/build.rs`, `puppet-master-rs/src/build_info.rs`
- **Success criteria:**  
  - `grep -E 'RWM_BUILD_|RWM ' puppet-master-rs/build.rs puppet-master-rs/src/build_info.rs` exits 1.  
  - `grep 'PM_BUILD_' puppet-master-rs/build.rs` and `grep 'PM_BUILD_\|Puppet Master' puppet-master-rs/src/build_info.rs` exit 0.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement build env rebrand per Plans/rebrand.md Phase 1.4. In build.rs replace all RWM_BUILD_* with PM_BUILD_*; in build_info.rs replace option_env!("RWM_BUILD_...") with option_env!("PM_BUILD_..."), set APP_DISPLAY_NAME to "Puppet Master", and update any display strings. Keep both files in sync. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-1d. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-1e -- Phase 1 misc

- **Scope:**  
  `puppet-master-rs/src/interview/document_writer.rs`
- **Success criteria:**  
  - `grep -iE 'ralph|RWM' puppet-master-rs/src/interview/document_writer.rs` exits 1.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit code; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Update document_writer.rs per Plans/rebrand.md Phase 1.5: replace comment referencing legacy loop name with "Puppet Master loop" or "orchestrator loop". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-1e. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2a -- ProjectDirs triplet

- **Scope:**  
  `puppet-master-rs/src/utils/project_paths.rs`, `puppet-master-rs/src/install/app_paths.rs`, `puppet-master-rs/src/doctor/checks/runtime_check.rs`, `puppet-master-rs/src/config/default_config.rs`, `puppet-master-rs/src/projects/persistence.rs`
- **Success criteria:**  
  - No `ProjectDirs::from("com", "RWM"` or `"com", "rwm", "RWM` or `.join("RWM Puppet Master")` in scope.  
  - All use `ProjectDirs::from("com", "puppetmaster", "Puppet Master")` (or path from triplet).  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes for legacy triplet/join; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement ProjectDirs triplet rebrand per Plans/rebrand.md Phase 2.1. Replace every ProjectDirs::from(..., legacy org, ...) with ("com", "puppetmaster", "Puppet Master"). Remove any .join("RWM Puppet Master") and use ProjectDirs path. Update doc comments with path examples. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2a. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2b -- Fallback and temp dirs

- **Scope:**  
  `puppet-master-rs/src/install/app_paths.rs`, `puppet-master-rs/src/config/default_config.rs`, `puppet-master-rs/src/utils/project_paths.rs`, `puppet-master-rs/src/automation/workspace_clone.rs`
- **Success criteria:**  
  - `grep -E '\.rwm-puppet-master|rwm-puppet-master|rwm-write-probe|rwm-puppet-master-gui' puppet-master-rs/src/install/app_paths.rs puppet-master-rs/src/config/default_config.rs puppet-master-rs/src/utils/project_paths.rs puppet-master-rs/src/automation/workspace_clone.rs` exits 1.  
  - `.puppet-master`, `puppet-master`, `.pm-write-probe`, `puppet-master-gui-automation` used as appropriate.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement fallback and temp dir rebrand per Plans/rebrand.md Phase 2.2. Replace .rwm-puppet-master with .puppet-master, rwm-puppet-master in paths with puppet-master, probe prefix with .pm-write-probe, and workspace clone dir with puppet-master-gui-automation. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2b. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2c -- Autostart identifiers

- **Scope:**  
  `puppet-master-rs/src/autostart.rs`
- **Success criteria:**  
  - `grep -E 'com\.rwm\.puppet-master' puppet-master-rs/src/autostart.rs` exits 1.  
  - `grep 'com.puppetmaster.puppet-master' puppet-master-rs/src/autostart.rs` exits 0.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement autostart identifier rebrand per Plans/rebrand.md Phase 2.3. Replace com.rwm.puppet-master with com.puppetmaster.puppet-master in .desktop, .plist, and XML string. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2c. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2d -- User-Agent and temp dirs

- **Scope:**  
  `puppet-master-rs/src/interview/reference_manager.rs`, `puppet-master-rs/src/install/github_cli_installer.rs`, `puppet-master-rs/src/install/copilot_installer.rs`
- **Success criteria:**  
  - `grep -E 'rwm-puppet-master|RWM-PuppetMaster|rwm-gh-' puppet-master-rs/src/interview/reference_manager.rs puppet-master-rs/src/install/github_cli_installer.rs puppet-master-rs/src/install/copilot_installer.rs` exits 1.  
  - User-agent and temp dir use puppet-master / PuppetMaster / pm-gh as per token table.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement user-agent and temp dir rebrand per Plans/rebrand.md Phase 2.4. Replace legacy user-agent strings with puppet-master/1.0 or PuppetMaster/0.1; replace rwm-gh- temp prefix with pm-gh-. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2d. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2e -- Test sentinels

- **Scope:**  
  `puppet-master-rs/src/doctor/checks/sdk_checks.rs`, `puppet-master-rs/src/platforms/path_utils.rs`, `puppet-master-rs/src/install/script_installer.rs`
- **Success criteria:**  
  - `grep '__rwm_nonexistent_binary' puppet-master-rs/src/doctor/checks/sdk_checks.rs puppet-master-rs/src/platforms/path_utils.rs puppet-master-rs/src/install/script_installer.rs` exits 1.  
  - `grep '__pm_nonexistent_binary_42__'` present where sentinel is used.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement test sentinel rebrand per Plans/rebrand.md Phase 2.5. Replace __rwm_nonexistent_binary_42__ with __pm_nonexistent_binary_42__ in all three files. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2e. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2f -- Platform detector and config UI

- **Scope:**  
  `puppet-master-rs/src/platforms/platform_detector.rs`, `puppet-master-rs/src/views/config.rs`
- **Success criteria:**  
  - `grep -E 'rwm-pm-test-gh|rwm/\{tier\}|Ralph Wiggum' puppet-master-rs/src/platforms/platform_detector.rs puppet-master-rs/src/views/config.rs` exits 1.  
  - pm-test-gh and pm/{tier}/{id} and neutral wording (e.g. "requirements interview model") used.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement platform detector temp path and config UI rebrand per Plans/rebrand.md Phase 2.6. In platform_detector.rs replace rwm-pm-test-gh with pm-test-gh. In config.rs replace placeholder rwm/{tier}/{id} with pm/{tier}/{id} and the interview config copy (legacy model name) with e.g. "requirements interview model". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-2f. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-3a -- Header widget

- **Scope:**  
  `puppet-master-rs/src/widgets/header.rs`
- **Success criteria:**  
  - `grep -iE 'RWM|ralph' puppet-master-rs/src/widgets/header.rs` exits 1.  
  - Header title text is "PUPPET MASTER" (or "PM" on mobile if applicable).  
  - `cd puppet-master-rs && cargo check` passes.
- **Evidence artifact:**  
  Grep exit code; cargo check exit code; list of files changed.
- **Builder prompt:**  
  Implement header widget rebrand per Plans/rebrand.md Phase 3.1. Replace legacy header comment and title strings with "PUPPET MASTER". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-3a. Record grep and cargo check results and modified files to the chunk evidence artifact.

---

### rebrand-3b -- Window, terminal, setup, tray, main

- **Scope:**  
  `puppet-master-rs/src/app.rs`, `puppet-master-rs/src/views/setup.rs`, `puppet-master-rs/src/tray.rs`, `puppet-master-rs/src/main.rs`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM ' puppet-master-rs/src/app.rs puppet-master-rs/src/views/setup.rs puppet-master-rs/src/tray.rs puppet-master-rs/src/main.rs` exits 1.  
  - Window title and terminal banner and welcome/tooltip/log say "Puppet Master".  
  - `cd puppet-master-rs && cargo check` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo check exit code; list of files changed.
- **Builder prompt:**  
  Implement window, terminal, setup, tray, and main rebrand per Plans/rebrand.md Phase 3.2-3.3. Replace .title(...), terminal banner, "Welcome to...", tray tooltip, and main comment/log with "Puppet Master". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-3b. Record grep and cargo check results and modified files to the chunk evidence artifact.

---

### rebrand-3c -- PR body, install scripts, interview

- **Scope:**  
  `puppet-master-rs/src/git/pr_manager.rs`, `puppet-master-rs/src/install/script_installer.rs`, `puppet-master-rs/src/interview/test_strategy_generator.rs`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM ' puppet-master-rs/src/git/pr_manager.rs puppet-master-rs/src/install/script_installer.rs puppet-master-rs/src/interview/test_strategy_generator.rs` exits 1.  
  - "Generated by Puppet Master" and "Auto-generated by Puppet Master interview" and error messages use "Puppet Master". Tests updated.  
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**  
  Implement PR body, install script messages, and interview test strategy rebrand per Plans/rebrand.md Phase 3.4-3.5. Replace "*Generated by...*" and error strings and "Auto-generated by... interview" with "Puppet Master". Update test assertions. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-3c. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-3d -- Module/crate docs and icons README

- **Scope:**  
  `puppet-master-rs/src/lib.rs`, `puppet-master-rs/src/core/mod.rs`, `puppet-master-rs/src/platforms/mod.rs`, `puppet-master-rs/src/types/mod.rs`, `puppet-master-rs/src/types/config.rs`, `puppet-master-rs/src/widgets/mod.rs`, `puppet-master-rs/src/config/default_config.rs`, `puppet-master-rs/src/verification/mod.rs`, `puppet-master-rs/src/state/mod.rs`, `puppet-master-rs/src/git/mod.rs`, `puppet-master-rs/src/tray.rs`, `puppet-master-rs/icons/README.md`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|Ralph Wiggum'` in the listed files exits 1.  
  - `//!` and `///` and icons README use "Puppet Master" or neutral wording.  
  - `cd puppet-master-rs && cargo check` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo check exit code; list of files changed.
- **Builder prompt:**  
  Implement module/crate docs and icons README rebrand per Plans/rebrand.md Phase 3.6-3.7. Replace legacy product name in //! and /// and icons/README.md with "Puppet Master" or neutral wording. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-3d. Record grep and cargo check results and modified files to the chunk evidence artifact.

---

### rebrand-4a -- Cargo.toml bundle

- **Scope:**  
  `puppet-master-rs/Cargo.toml`
- **Success criteria:**  
  - `grep -iE 'RWM |com\.rwm\.|ralph' puppet-master-rs/Cargo.toml` exits 1.  
  - description and package.metadata.bundle name/identifier/copyright use "Puppet Master" and com.puppetmaster.puppet-master.  
  - `cd puppet-master-rs && cargo check` passes.
- **Evidence artifact:**  
  Grep exit codes; cargo check exit code; list of files changed.
- **Builder prompt:**  
  Implement Cargo.toml bundle rebrand per Plans/rebrand.md Phase 4.1. Update description (remove legacy prefix), bundle name to "Puppet Master", identifier to com.puppetmaster.puppet-master, copyright without legacy. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4a. Record grep and cargo check results and modified files to the chunk evidence artifact.

---

### rebrand-4b -- GitHub workflow

- **Scope:**  
  `.github/workflows/build-installers.yml`
- **Success criteria:**  
  - `grep -E 'RWM-Puppet-Master|RWM Puppet Master' .github/workflows/build-installers.yml` exits 1.  
  - Artifact names and paths use "Puppet-Master-" and "Puppet Master".  
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement GitHub workflow rebrand per Plans/rebrand.md Phase 4.2. Replace RWM-Puppet-Master- with Puppet-Master- in artifact names and "RWM Puppet Master\\puppet-master.exe" with "Puppet Master\\puppet-master.exe". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4b. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4c -- Linux nfpm and desktop

- **Scope:**  
  `installer/linux/nfpm.yaml`, `installer/linux/applications/` (including renaming desktop file)
- **Success criteria:**  
  - No rwm-puppet-master or com.rwm.puppet-master in nfpm.yaml or desktop file contents.  
  - File `installer/linux/applications/com.puppetmaster.puppet-master.desktop` exists; nfpm contents reference it.  
  - Package name and description in nfpm use "Puppet Master" / puppet-master.
- **Evidence artifact:**  
  Grep/ls exit codes; list of files changed (including rename).
- **Builder prompt:**  
  Implement Linux nfpm and desktop rebrand per Plans/rebrand.md Phase 4.3. In nfpm.yaml set name to puppet-master, description/maintainer to "Puppet Master", and desktop src/dst to com.puppetmaster.puppet-master.desktop. Rename installer/linux/applications/com.rwm.puppet-master.desktop to com.puppetmaster.puppet-master.desktop and update its contents. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4c. Record file checks and modified/renamed files to the chunk evidence artifact.

---

### rebrand-4d -- Linux scripts

- **Scope:**  
  `installer/linux/scripts/install.sh`, `installer/linux/scripts/preinstall`
- **Success criteria:**  
  - `grep -iE 'rwm-puppet-master' installer/linux/scripts/install.sh installer/linux/scripts/preinstall` exits 1.  
  - Comments and package references use puppet-master.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement Linux installer scripts rebrand per Plans/rebrand.md Phase 4.4. Replace rwm-puppet-master in comments and package patterns with puppet-master. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4d. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4e -- macOS

- **Scope:**  
  `installer/macos/build-dmg.sh`, `installer/macos/Info.plist`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM-Puppet-Master|com\.rwm\.' installer/macos/build-dmg.sh installer/macos/Info.plist` exits 1.  
  - APP_NAME, BUNDLE_NAME, DMG_NAME, CFBundleName, CFBundleDisplayName, CFBundleIdentifier use "Puppet Master" and com.puppetmaster.puppet-master.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement macOS rebrand per Plans/rebrand.md Phase 4.5. In build-dmg.sh replace all legacy app/dmg names with "Puppet Master" and "Puppet-Master". In Info.plist set CFBundleName, CFBundleDisplayName to "Puppet Master" and CFBundleIdentifier to com.puppetmaster.puppet-master. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4e. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4f -- Windows NSI

- **Scope:**  
  `installer/windows/puppet-master.nsi`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM\"|RWMPuppetMaster' installer/windows/puppet-master.nsi` exits 1.  
  - Name, OutFile, InstallDir, shortcuts, MUI_ strings, registry, CompanyName/Publisher use "Puppet Master" and PuppetMaster (or chosen single-word key).
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement Windows NSI rebrand per Plans/rebrand.md Phase 4.6. Replace all legacy product name and RWM/RWMPuppetMaster with "Puppet Master" and a single-word registry key (e.g. PuppetMaster). Update Name, OutFile, InstallDir, shortcuts, MUI_, registry, CompanyName/Publisher. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4f. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4g -- Build and uninstall scripts

- **Scope:**  
  `build-all-installers.sh`, `scripts/build-linux-installer.sh`, `scripts/build-installer-windows.bat`, `scripts/test-linux-deb.sh`, `scripts/os-clean/linux-uninstall-puppet-master.sh`, `scripts/os-clean/windows-uninstall-puppet-master.ps1`, `scripts/os-clean/macos-uninstall-puppet-master.sh`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM-Puppet-Master|rwm-puppet-master|com\.rwm\.|\.rwm-puppet-master|Ralph Wiggum'` in the listed files exits 1.  
  - Echo strings, PKG_NAME, paths, package names use "Puppet Master" and new identifiers/paths.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement build and uninstall scripts rebrand per Plans/rebrand.md Phase 4.7. Update comments, echo strings, artifact paths, PKG_NAME, package names, and uninstall paths to "Puppet Master", puppet-master, com.puppetmaster.puppet-master, .puppet-master. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4g. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4h -- Installer README

- **Scope:**  
  `installer/README.md`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|RWM-Puppet-Master|com\.rwm\.puppet-master|/RWM' installer/README.md` exits 1.  
  - All references use "Puppet Master" and new identifier/paths.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement installer README rebrand per Plans/rebrand.md Phase 4.8. Replace every legacy product name, artifact name, identifier, and path with "Puppet Master" and new values. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-4h. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-5 -- Config YAML

- **Scope:**  
  `.puppet-master/config.yaml`, `.puppet-master/puppet-master.yaml`, `puppet-master-rs/puppet-master.yaml`
- **Success criteria:**  
  - `grep -E 'ralph|rwm' .puppet-master/config.yaml .puppet-master/puppet-master.yaml puppet-master-rs/puppet-master.yaml 2>/dev/null` exits 1 (or files absent; then create/update when present).  
  - naming_pattern / namingPattern is pm/{tier}/{id}. workingDirectory unchanged until Phase 7.
- **Evidence artifact:**  
  Grep exit codes; list of files changed (note: .puppet-master may be gitignored).
- **Builder prompt:**  
  Implement config YAML rebrand per Plans/rebrand.md Phase 5. Set naming_pattern / namingPattern to pm/{tier}/{id} in the three files. Leave workingDirectory as-is until Phase 7. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-5. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6a -- Root and agent docs

- **Scope:**  
  `AGENTS.md`, `README.md`, `REQUIREMENTS.md`, `STATE_FILES.md`, `.cursorrules`, `.claude/CLAUDE.md`, `puppet-master-rs/README.md`
- **Success criteria:**  
  - In these files, no legacy product name in titles/intros; `ralph:` → `pm:`, `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` → `<pm>COMPLETE</pm>` / `<pm>GUTTER</pm>`; "Puppet Master" and "four-tier hierarchical approach" (or similar) used.
  - `grep -iE 'RWM Puppet Master|Ralph Wiggum Method' AGENTS.md README.md REQUIREMENTS.md STATE_FILES.md .cursorrules .claude/CLAUDE.md puppet-master-rs/README.md` exits 1 (allow historical/attribution in REQUIREMENTS if left as-is per spec).
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement root and agent docs rebrand per Plans/rebrand.md Phase 6.1. Update AGENTS.md, README.md, REQUIREMENTS.md, STATE_FILES.md, .cursorrules, .claude/CLAUDE.md, puppet-master-rs/README.md: product name "Puppet Master", commit prefix pm:, completion/gutter tags <pm>...</pm>. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-6a. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6b -- Plans

- **Scope:**  
  `Plans/newfeatures.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/MiscPlan.md`, `Plans/WorktreeGitImprovement.md`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|Ralph Loop|Ralph Wiggum|enableRalphLoopPatterns|ralph-clean-workspace|ralph:' Plans/newfeatures.md Plans/orchestrator-subagent-integration.md Plans/MiscPlan.md Plans/WorktreeGitImprovement.md` exits 1 (or no matches in files that were updated).  
  - "Puppet Master", "orchestrator loop", neutral config key, "puppet-master-context" (or similar), "pm:" used as specified in rebrand.md.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement Plans rebrand per Plans/rebrand.md Phase 6.2. In newfeatures.md use "Puppet Master". In orchestrator-subagent-integration.md use "Puppet Master loop"/"orchestrator loop" and e.g. enableOrchestratorLoopPatterns. In MiscPlan.md replace ralph-clean-workspace with e.g. puppet-master-context. In WorktreeGitImprovement.md use pm:. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-6b. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6c -- Conductor and docs

- **Scope:**  
  `conductor/product.md`, `conductor/tracks/gui_resizing_20260216/spec.md`, `docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md`, `docs/PROCESS_CLEANUP_README.md`, `docs/PROCESS_CLEANUP_SYSTEM.md`
- **Success criteria:**  
  - `grep -iE 'RWM Puppet Master|Ralph Loops' conductor/product.md conductor/tracks/gui_resizing_20260216/spec.md docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md docs/PROCESS_CLEANUP_README.md docs/PROCESS_CLEANUP_SYSTEM.md` exits 1.  
  - "Puppet Master" and "orchestrator loops" (or similar) used.
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement conductor and docs rebrand per Plans/rebrand.md Phase 6.3. Replace legacy product name and "Ralph Loops" with "Puppet Master" and "orchestrator loops" in the listed files. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-6c. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6d -- Reference and .cursor

- **Scope:**  
  `Reference/BUILD_INSTALLER_FIXES.md`, `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md`, `Reference/TEST_SUMMARY_REPORT.md`, `Reference/GUI_ISSUES_AND_FIXES.md`, `.cursor/MCP-CLI-vs-EXTENSION-PATHS.md`, `.cursor/CLAUDE_EXTENSION_AND_MCP.md`, `.cursor/commands/CHECK_STATUS.md`
- **Success criteria:**  
  - No legacy product name or com.rwm / rwm-puppet-master / ralph signals in the listed Reference and .cursor files.  
  - "Puppet Master" and com.puppetmaster.puppet-master and <pm>... used. (Evidence grep may exclude Reference if treated as reference-only; for this chunk, only the listed files are in scope.)
- **Evidence artifact:**  
  Grep exit codes for listed files only; list of files changed.
- **Builder prompt:**  
  Implement Reference and .cursor rebrand per Plans/rebrand.md Phase 6.4. Update the listed Reference and .cursor docs: identifiers and paths to com.puppetmaster.puppet-master and new names; signals to <pm>...; folder name to "Puppet Master" or generic "project folder". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-6d on the listed files only. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6e -- Widget refs and evidence/audits

- **Scope:**  
  `WIDGETS_VISUAL_REFERENCE.md`, `WIDGETS_QUICK_REFERENCE.md`, `.puppet-master/evidence/gui-browser-test-report.md`, `.puppet-master/audits/integration-paths.md`, `.puppet-master/audits/integration-paths.json`, `.puppet-master/audits/wiring.json`
- **Success criteria:**  
  - In these files, no legacy product name or "RWM" logo; ralph.*commit → pm.*commit where applicable. rootDir in audits can be updated in Phase 7.  
  - Do not modify .puppet-master/evidence/**/timeline.jsonl (historical records).
- **Evidence artifact:**  
  Grep exit codes; list of files changed.
- **Builder prompt:**  
  Implement widget refs and evidence/audits rebrand per Plans/rebrand.md Phase 6.5. In WIDGETS_* replace legacy product name and logo with "Puppet Master". In gui-browser-test-report and audits replace legacy naming and ralph.*commit with pm.*commit. Do not edit timeline.jsonl. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-6e. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-7a -- Update path references after rename

- **Scope:**  
  `.puppet-master/puppet-master.yaml`, `puppet-master-rs/puppet-master.yaml`, `.puppet-master/audits/wiring.json`, `.puppet-master/audits/integration-paths.json`; optionally `.puppet-master/evidence/**/timeline.jsonl`
- **Success criteria:**  
  - workingDirectory and rootDir / projectRoot reflect the new project root path (e.g. .../Puppet Master/...).  
  - Optional: timeline.jsonl paths updated if desired.
- **Evidence artifact:**  
  List of files changed; optional grep for old root path in audits.
- **Builder prompt:**  
  Implement path reference updates per Plans/rebrand.md Phase 7.2. Set workingDirectory in both puppet-master.yaml files to the new project path. Update rootDir/projectRoot in wiring.json and integration-paths.json. Optionally bulk-replace old root path in timeline.jsonl. Run only after human has renamed the project folder (rebrand-H2). Use the token table; do not introduce legacy naming.
- **Verifier prompt:**  
  Run the success criteria for chunk rebrand-7a. Record modified files and optional path grep to the chunk evidence artifact.

---

## Human-Only Steps

These steps must not be performed by an agent; they require manual action or credentials.

- **H1. Rename GitHub repository**  
  Rename the GitHub repo to the desired name (e.g. puppet-master) in the GitHub UI. No agent execution.

- **H2. Rename top-level project folder**  
  After Phases 1-6 are complete and committed, rename the repository root directory (e.g. from the legacy folder name to `Puppet Master` or `puppet-master`) outside the repo or via git-safe rename. Then run chunk rebrand-7a to update path references. Reopen the project in the editor using the new folder path.

- **H3. Signing and packaging identity**  
  Any OS-level code signing, notary, or packaging identity steps that require human credentials (e.g. Apple Developer, Windows signing cert) are manual. Apply if applicable for release builds.

---

## Reference

Canonical rebrand spec: [Plans/rebrand.md](Plans/rebrand.md).

**After all chunks:** Run the full **Verification Checklist** in Plans/rebrand.md (build/tests, grep sweep, docs check, Task Status Log) before marking the rebrand complete.
