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
  - Manual review: confirm no legacy naming in the listed files.
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
  - Manual review: confirm no legacy naming in commit_formatter.rs.
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
  - Manual review: confirm no legacy naming patterns in the listed files.
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
  - Manual review: confirm no legacy build env prefix in the listed files.
  - `grep 'PM_BUILD_' puppet-master-rs/build.rs` and `grep 'PM_BUILD_\|Puppet Master' puppet-master-rs/src/build_info.rs` exit 0.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement build env rebrand per Plans/rebrand.md Phase 1.4. In build.rs replace all legacy build env vars with PM_BUILD_*; in build_info.rs replace option_env! calls referencing the legacy build prefix with option_env!("PM_BUILD_..."), set APP_DISPLAY_NAME to "Puppet Master", and update any display strings. Keep both files in sync. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-1d. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-1e -- Phase 1 misc

- **Scope:**
  `puppet-master-rs/src/interview/document_writer.rs`
- **Success criteria:**
  - Manual review: confirm no legacy naming in document_writer.rs.
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
  - No legacy ProjectDirs triplet or legacy app name `.join()` in scope.
  - All use `ProjectDirs::from("com", "puppetmaster", "Puppet Master")` (or path from triplet).
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes for legacy triplet/join; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement ProjectDirs triplet rebrand per Plans/rebrand.md Phase 2.1. Replace every legacy ProjectDirs triplet with ("com", "puppetmaster", "Puppet Master"). Remove any `.join()` of the legacy app name and use the path from ProjectDirs. Update doc comments with path examples using "Puppet Master" / "puppetmaster". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2a. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2b -- Fallback and temp dirs

- **Scope:**
  `puppet-master-rs/src/install/app_paths.rs`, `puppet-master-rs/src/config/default_config.rs`, `puppet-master-rs/src/utils/project_paths.rs`, `puppet-master-rs/src/automation/workspace_clone.rs`
- **Success criteria:**
  - Manual review: confirm no legacy path names in the listed files.
  - `.puppet-master`, `puppet-master`, `.pm-write-probe`, `puppet-master-gui-automation` used as appropriate.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement fallback and temp dir rebrand per Plans/rebrand.md Phase 2.2. Replace legacy fallback dir with .puppet-master, legacy temp dir prefix with puppet-master, probe prefix with .pm-write-probe, and workspace clone dir with puppet-master-gui-automation. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2b. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2c -- Autostart identifiers

- **Scope:**
  `puppet-master-rs/src/autostart.rs`
- **Success criteria:**
  - Manual review: confirm no legacy bundle identifier in autostart.rs.
  - `grep 'com.puppetmaster.puppet-master' puppet-master-rs/src/autostart.rs` exits 0.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement autostart identifier rebrand per Plans/rebrand.md Phase 2.3. Replace legacy bundle identifier with com.puppetmaster.puppet-master in .desktop, .plist, and XML string. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2c. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2d -- User-Agent and temp dirs

- **Scope:**
  `puppet-master-rs/src/interview/reference_manager.rs`, `puppet-master-rs/src/install/github_cli_installer.rs`, `puppet-master-rs/src/install/copilot_installer.rs`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
  - User-agent and temp dir use puppet-master/1.0 or Puppet-Master/0.1 and pm-gh- prefix as per token table.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement user-agent and temp dir rebrand per Plans/rebrand.md Phase 2.4. Replace legacy user-agent strings with puppet-master/1.0 or Puppet-Master/0.1; replace legacy temp prefix with pm-gh-. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2d. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2e -- Test sentinels

- **Scope:**
  `puppet-master-rs/src/doctor/checks/sdk_checks.rs`, `puppet-master-rs/src/platforms/path_utils.rs`, `puppet-master-rs/src/install/script_installer.rs`
- **Success criteria:**
  - Manual review: confirm no legacy nonexistent-binary sentinel in the listed files.
  - `grep '__pm_nonexistent_binary_42__'` present where sentinel is used.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement test sentinel rebrand per Plans/rebrand.md Phase 2.5. Replace the legacy sentinel with __pm_nonexistent_binary_42__ in all three files. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2e. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-2f -- Platform detector and config UI

- **Scope:**
  `puppet-master-rs/src/platforms/platform_detector.rs`, `puppet-master-rs/src/views/config.rs`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
  - pm-test-gh and pm/{tier}/{id} and neutral wording (e.g. "requirements interview model") used.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement platform detector temp path and config UI rebrand per Plans/rebrand.md Phase 2.6. In platform_detector.rs replace the legacy temp path prefix with pm-test-gh. In config.rs replace the legacy branch naming placeholder with pm/{tier}/{id} and the legacy interview model label with e.g. "requirements interview model". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-2f. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-3a -- Header widget

- **Scope:**
  `puppet-master-rs/src/widgets/header.rs`
- **Success criteria:**
  - Manual review: confirm no legacy naming in header.rs.
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
  - Manual review: confirm no legacy naming in the listed files.
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
  - Manual review: confirm no legacy naming in the listed files.
  - "Generated by Puppet Master" and "Auto-generated by Puppet Master interview" and error messages use "Puppet Master". Tests updated.
  - `cd puppet-master-rs && cargo check && cargo test` passes.
- **Evidence artifact:**
  Grep exit codes; cargo test exit code; list of files changed.
- **Builder prompt:**
  Implement PR body, install script messages, and interview test strategy rebrand per Plans/rebrand.md Phase 3.4-3.5. Replace legacy product name in "*Generated by...*" and error strings and "Auto-generated by... interview" with "Puppet Master". Update test assertions. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-3c. Record grep and cargo test results and modified files to the chunk evidence artifact.

---

### rebrand-3d -- Module/crate docs and icons README

- **Scope:**
  `puppet-master-rs/src/lib.rs`, `puppet-master-rs/src/core/mod.rs`, `puppet-master-rs/src/platforms/mod.rs`, `puppet-master-rs/src/types/mod.rs`, `puppet-master-rs/src/types/config.rs`, `puppet-master-rs/src/widgets/mod.rs`, `puppet-master-rs/src/config/default_config.rs`, `puppet-master-rs/src/verification/mod.rs`, `puppet-master-rs/src/state/mod.rs`, `puppet-master-rs/src/git/mod.rs`, `puppet-master-rs/src/tray.rs`, `puppet-master-rs/icons/README.md`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
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
  - Manual review: confirm no legacy naming in Cargo.toml.
  - description and package.metadata.bundle name/identifier/copyright use "Puppet Master" and com.puppetmaster.puppet-master.
  - `cd puppet-master-rs && cargo check` passes.
- **Evidence artifact:**
  Grep exit codes; cargo check exit code; list of files changed.
- **Builder prompt:**
  Implement Cargo.toml bundle rebrand per Plans/rebrand.md Phase 4.1. Update description (remove legacy prefix), bundle name to "Puppet Master", identifier to com.puppetmaster.puppet-master, copyright without legacy naming. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-4a. Record grep and cargo check results and modified files to the chunk evidence artifact.

---

### rebrand-4b -- GitHub workflow

- **Scope:**
  `.github/workflows/build-installers.yml`
- **Success criteria:**
  - Manual review: confirm no legacy naming in build-installers.yml.
  - Artifact names and paths use "Puppet-Master-" and "Puppet Master".
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement GitHub workflow rebrand per Plans/rebrand.md Phase 4.2. Replace the legacy artifact name prefix with Puppet-Master- and update the Windows path to "Puppet Master\puppet-master.exe". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-4b. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4c -- Linux nfpm and desktop

- **Scope:**
  `installer/linux/nfpm.yaml`, `installer/linux/applications/` (including renaming desktop file)
- **Success criteria:**
  - No legacy naming in nfpm.yaml or desktop file contents.
  - File `installer/linux/applications/com.puppetmaster.puppet-master.desktop` exists; nfpm contents reference it.
  - Package name and description in nfpm use "Puppet Master" / puppet-master.
- **Evidence artifact:**
  Grep/ls exit codes; list of files changed (including rename).
- **Builder prompt:**
  Implement Linux nfpm and desktop rebrand per Plans/rebrand.md Phase 4.3. In nfpm.yaml set name to puppet-master, description/maintainer to "Puppet Master", and desktop src/dst to com.puppetmaster.puppet-master.desktop. Rename the legacy .desktop file in installer/linux/applications/ to com.puppetmaster.puppet-master.desktop and update its contents. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-4c. Record file checks and modified/renamed files to the chunk evidence artifact.

---

### rebrand-4d -- Linux scripts

- **Scope:**
  `installer/linux/scripts/install.sh`, `installer/linux/scripts/preinstall`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
  - Comments and package references use puppet-master.
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement Linux installer scripts rebrand per Plans/rebrand.md Phase 4.4. Replace the legacy package name in comments and package patterns with puppet-master. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-4d. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4e -- macOS

- **Scope:**
  `installer/macos/build-dmg.sh`, `installer/macos/Info.plist`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
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
  - Manual review: confirm no legacy naming in puppet-master.nsi.
  - Name, OutFile, InstallDir, shortcuts, MUI_ strings, registry, CompanyName/Publisher use "Puppet Master" and PuppetMaster (or chosen single-word registry key).
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement Windows NSI rebrand per Plans/rebrand.md Phase 4.6. Replace all legacy product naming with "Puppet Master" and a single-word registry key (e.g. PuppetMaster). Update Name, OutFile, InstallDir, shortcuts, MUI_, registry, CompanyName/Publisher. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-4f. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-4g -- Build and uninstall scripts

- **Scope:**
  `build-all-installers.sh`, `scripts/build-linux-installer.sh`, `scripts/build-installer-windows.bat`, `scripts/test-linux-deb.sh`, `scripts/os-clean/linux-uninstall-puppet-master.sh`, `scripts/os-clean/windows-uninstall-puppet-master.ps1`, `scripts/os-clean/macos-uninstall-puppet-master.sh`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
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
  - Manual review: confirm no legacy naming in installer/README.md.
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
  - Manual review: confirm no legacy naming in the listed YAML files (or files absent; then create/update when present).
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
  - No legacy naming in titles/intros; legacy commit prefix → pm:; legacy completion/gutter signals → `<pm>COMPLETE</pm>` / `<pm>GUTTER</pm>`; "Puppet Master" and "four-tier hierarchical approach" (or similar) used.
  - Manual review: confirm no legacy naming in listed files. Allow historical/attribution in REQUIREMENTS if left as-is per spec.
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement root and agent docs rebrand per Plans/rebrand.md Phase 6.1. Update AGENTS.md, README.md, REQUIREMENTS.md, STATE_FILES.md, .cursorrules, .claude/CLAUDE.md, puppet-master-rs/README.md: product name "Puppet Master", commit prefix pm:, completion/gutter tags `<pm>...</pm>`. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-6a. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6b -- Plans

- **Scope:**
  `Plans/newfeatures.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/MiscPlan.md`, `Plans/WorktreeGitImprovement.md`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
  - "Puppet Master", "orchestrator loop", neutral config key, "puppet-master-context" (or similar), "pm:" used as specified in rebrand.md.
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement Plans rebrand per Plans/rebrand.md Phase 6.2. In newfeatures.md use "Puppet Master". In orchestrator-subagent-integration.md use "Puppet Master loop"/"orchestrator loop" and e.g. enableOrchestratorLoopPatterns. In MiscPlan.md replace legacy workspace context name with e.g. puppet-master-context. In WorktreeGitImprovement.md use pm:. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-6b. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6c -- Conductor and docs

- **Scope:**
  `conductor/product.md`, `conductor/tracks/gui_resizing_20260216/spec.md`, `docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md`, `docs/PROCESS_CLEANUP_README.md`, `docs/PROCESS_CLEANUP_SYSTEM.md`
- **Success criteria:**
  - Manual review: confirm no legacy naming in the listed files.
  - "Puppet Master" and "orchestrator loops" (or similar) used.
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement conductor and docs rebrand per Plans/rebrand.md Phase 6.3. Replace legacy product name and legacy loop name with "Puppet Master" and "orchestrator loops" in the listed files. Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-6c. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6d -- Reference and .cursor

- **Scope:**
  `Reference/BUILD_INSTALLER_FIXES.md`, `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md`, `Reference/TEST_SUMMARY_REPORT.md`, `Reference/GUI_ISSUES_AND_FIXES.md`, `.cursor/MCP-CLI-vs-EXTENSION-PATHS.md`, `.cursor/CLAUDE_EXTENSION_AND_MCP.md`, `.cursor/commands/CHECK_STATUS.md`
- **Success criteria:**
  - No legacy naming in the listed Reference and .cursor files.
  - "Puppet Master" and com.puppetmaster.puppet-master and `<pm>...` used. (Evidence grep limited to listed files only.)
- **Evidence artifact:**
  Grep exit codes for listed files only; list of files changed.
- **Builder prompt:**
  Implement Reference and .cursor rebrand per Plans/rebrand.md Phase 6.4. Update the listed Reference and .cursor docs: identifiers and paths to com.puppetmaster.puppet-master and new names; signals to `<pm>...`; folder name to "Puppet Master" or generic "project folder". Use the token table; do not introduce legacy naming.
- **Verifier prompt:**
  Run the success criteria for chunk rebrand-6d on the listed files only. Record grep results and modified files to the chunk evidence artifact.

---

### rebrand-6e -- Widget refs and evidence/audits

- **Scope:**
  `WIDGETS_VISUAL_REFERENCE.md`, `WIDGETS_QUICK_REFERENCE.md`, `.puppet-master/evidence/gui-browser-test-report.md`, `.puppet-master/audits/integration-paths.md`, `.puppet-master/audits/integration-paths.json`, `.puppet-master/audits/wiring.json`
- **Success criteria:**
  - No legacy naming; pm.*commit used where applicable. rootDir in audits can be updated in Phase 7.
  - Do not modify .puppet-master/evidence/**/timeline.jsonl (historical records).
- **Evidence artifact:**
  Grep exit codes; list of files changed.
- **Builder prompt:**
  Implement widget refs and evidence/audits rebrand per Plans/rebrand.md Phase 6.5. In WIDGETS_* replace legacy product name and logo with "Puppet Master". In gui-browser-test-report and audits replace legacy naming and commit pattern with pm.*commit. Do not edit timeline.jsonl. Use the token table; do not introduce legacy naming.
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
  After Phases 1-6 are complete and committed, rename the repository root directory (e.g. from the legacy folder name to `Puppet Master` or `puppet-master`) outside the repo or via git-safe rename so the workspace path changes. Then run chunk rebrand-7a to update path references. Reopen the project in the editor using the new folder path.

- **H3. Signing and packaging identity**
  Any OS-level code signing, notary, or packaging identity steps that require human credentials (e.g. Apple Developer, Windows signing cert) are manual. Apply if applicable for release builds.

---

## Global Verification

After all chunks are complete, run the following from the repo root:

```bash
# 1) Placeholder scan — must have no matches in the 3 rebrand plan files
rg -n "\b(TODO|TBD|FIXME)\b|ContractRef:\s*<|ContractRef:\s*\.\.\." \
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md Plans/rebrand_chunks.json -i || true

# 2) Autonomy scan — must have no matches in the 2 markdown files
rg -n "^\s{0,3}#+\s+.*open questions\b" \
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md -i || true

# 3) Naming drift heuristic — must have no anomalous matches
rg -n "\b[A-Z]{2,}[-\s]+Puppet Master\b" \
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md Plans/rebrand_chunks.json || true

# 4) JSON validity
python3 -m json.tool Plans/rebrand_chunks.json >/dev/null

# 5) Chunk ID consistency
python3 - <<'PY'
import json, re
from pathlib import Path
md = Path('Plans/Rebrand_Chunked_Playbook.md').read_text(encoding='utf-8', errors='replace')
md_ids = set(re.findall(r'^### (rebrand-[0-9][a-z0-9-]*)\b', md, flags=re.MULTILINE))
data = json.loads(Path('Plans/rebrand_chunks.json').read_text(encoding='utf-8'))
json_ids = {obj.get('chunk_id') for obj in data if isinstance(obj, dict)}
print('missing_in_json', sorted(md_ids - json_ids))
print('extra_in_json', sorted(json_ids - md_ids))
PY
```

All five commands must produce no anomalous output.

---

## SSOT References

- [Plans/DRY_Rules.md](Plans/DRY_Rules.md) — DRY enforcement rules
- [Plans/Progression_Gates.md](Plans/Progression_Gates.md) — phase gates and completion criteria
- [Plans/Decision_Policy.md](Plans/Decision_Policy.md) — decision and escalation policy
- [Plans/Project_Output_Artifacts.md](Plans/Project_Output_Artifacts.md) — canonical artifact registry
- [Plans/Contracts_V0.md](Plans/Contracts_V0.md) — contract layer definitions
- [Plans/Spec_Lock.json](Plans/Spec_Lock.json) — locked spec values

---

## Reference

Canonical rebrand spec: [Plans/rebrand.md](Plans/rebrand.md).

**After all chunks:** Run the full **Verification Checklist** in Plans/rebrand.md (build/tests, positive naming checks, naming-drift heuristic, docs check, Task Status Log) before marking the rebrand complete.
