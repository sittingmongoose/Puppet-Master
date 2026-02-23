# Rebrand Implementation Plan: RWM → Puppet Master

**Audience:** AI agent performing the rebrand.  
**Goal:** Remove all RWM, Ralph, Ralph Wiggum, and rwm branding; product name becomes **Puppet Master**. No backward compatibility required.

**Conventions used in this plan:**
- **Find:** exact string or pattern to replace.
- **Replace with:** new value.
- Paths are relative to repo root unless noted.
- After each phase, run `cd puppet-master-rs && cargo check && cargo test` and fix any failures before proceeding.
- `Reference/` is excluded from scope -- it is external reference material, not part of this project.

---

## Token Inventory (Canonical Values -- Decide Once, Apply Everywhere)

Treat these as constants for the entire rebrand. Never invent a new variant mid-task.

| Token | Old value | New value |
|-------|-----------|-----------|
| App display name | `RWM Puppet Master` | `Puppet Master` |
| Linux package name | `rwm-puppet-master` | `puppet-master` |
| Bundle identifier | `com.rwm.puppet-master` | `com.puppetmaster.puppet-master` |
| ProjectDirs triplet | `"com", "rwm", "RWM Puppet Master"` | `"com", "puppetmaster", "Puppet Master"` |
| Fallback data dir | `.rwm-puppet-master` | `.puppet-master` |
| Autostart app ID | `com.rwm.puppet-master` | `com.puppetmaster.puppet-master` |
| Commit prefix | `ralph:` | `pm:` |
| Completion signal | `<ralph>COMPLETE</ralph>` | `<pm>COMPLETE</pm>` |
| Gutter signal | `<ralph>GUTTER</ralph>` | `<pm>GUTTER</pm>` |
| Branch naming pattern | `ralph/{phase}/{task}` or `rwm/{tier}/{id}` | `pm/{tier}/{id}` |
| Build env prefix | `RWM_BUILD_` | `PM_BUILD_` |
| User-agent | `rwm-puppet-master/1.0` | `puppet-master/1.0` |

---

## Execution Order (What to Do First)

1. **Phase 1 -- Backend protocol** (signals, commit prefix, build env). No path or installer changes yet; keeps `cargo test` stable.
2. **Phase 2 -- App identity and paths** (ProjectDirs, autostart, temp dirs, probe file, user-agents). Single consistent triplet and path names.
3. **Phase 3 -- User-facing strings and header** (window title, banner, welcome, tray, build display name, config/setup copy, module docs).
4. **Phase 4 -- Package and installers** (Cargo.toml bundle, GitHub workflow, Linux nfpm/desktop/scripts, macOS build/Info.plist, Windows NSI, build/uninstall scripts).
5. **Phase 5 -- Config YAML** (naming_pattern, namingPattern, workingDirectory if folder renamed later).
6. **Phase 6 -- Docs and Plans** (AGENTS.md, README, REQUIREMENTS, .cursorrules, Plans/, conductor/, docs/, Reference/, .cursor/, WIDGETS_*, evidence/audit references).
7. **Phase 7 -- Project folder rename** (rename repo root folder; then fix any remaining path references in config/evidence/audits).

Do **not** rename the project folder until Phases 1-6 are complete and committed, so that paths in the plan and tools remain valid during the work.

---

## Phase 1: Backend Protocol (ralph → pm, RWM build env)

**Objective:** Replace completion signals and commit prefix with `pm`; rename build env vars to `PM_BUILD_*`.

### 1.1 Completion signals

Replace `<ralph>COMPLETE</ralph>` with `<pm>COMPLETE</pm>` and `<ralph>GUTTER</ralph>` with `<pm>GUTTER</pm>` in:

| File | Notes |
|------|--------|
| `puppet-master-rs/src/platforms/runner.rs` | String checks and regex construction |
| `puppet-master-rs/src/core/orchestrator.rs` | Doc/example string |
| `puppet-master-rs/src/core/prompt_builder.rs` | Prompt text and test assertion; also change "RWM Puppet Master" in prompt header to "Puppet Master" |
| `puppet-master-rs/src/core/execution_engine.rs` | Line contains checks |
| `puppet-master-rs/src/platforms/output_parser.rs` | Module doc, comments, detection logic, tests |
| `puppet-master-rs/examples/output_parser_usage.rs` | Example stdout string; also "RWM Puppet Master" → "Puppet Master" |

### 1.2 Commit prefix

In `puppet-master-rs/src/git/commit_formatter.rs`:
- Find: `ralph:` in all format strings and doc comments.
- Replace with: `pm:`
- Update doc comment "RWM conventions" → "Puppet Master conventions".
- Update all tests that assert on `ralph:` to expect `pm:`.

### 1.3 Default branch naming pattern

- `puppet-master-rs/src/config/gui_config.rs`: In `default_naming_pattern()`, replace `"rwm/{tier}/{id}"` with `"pm/{tier}/{id}"`.
- `puppet-master-rs/src/types/config.rs`: Same in `default_naming_pattern()`.

### 1.4 Build env vars

Update both files together -- `build.rs` emits the env vars at compile time; `build_info.rs` reads them. They must stay in sync.

- `puppet-master-rs/build.rs`: Replace every `RWM_BUILD_*` with `PM_BUILD_*` (SEMVER, GIT_SHA, GIT_DIRTY, PROFILE, TARGET, BUILD_ID, BUILD_UTC).
- `puppet-master-rs/src/build_info.rs`: Replace every `option_env!("RWM_BUILD_...")` with `option_env!("PM_BUILD_...")`. Set `APP_DISPLAY_NAME` to `"Puppet Master"` and update any format strings that say "RWM Puppet Master" to "Puppet Master".

### 1.5 Other Ralph/RWM in Phase 1 scope

- `puppet-master-rs/src/interview/document_writer.rs`: Comment "Ralph loop" → "Puppet Master loop" (or "orchestrator loop").

**Check:** `cargo check` and `cargo test` in `puppet-master-rs` pass.

---

## Phase 2: App Identity and Paths

**Objective:** Single app identity: qualifier `com`, organization `puppetmaster`, application `Puppet Master`. Replace all `rwm`/`RWM` in path segments and identifiers.

### 2.1 ProjectDirs triplet

Use `("com", "puppetmaster", "Puppet Master")` everywhere. Replace **every** occurrence of:
- `ProjectDirs::from("com", "RWM", "Puppet Master")`
- `ProjectDirs::from("com", "rwm", "RWM Puppet Master")`

with:

- `ProjectDirs::from("com", "puppetmaster", "Puppet Master")`

**Files:**
- `puppet-master-rs/src/utils/project_paths.rs`
- `puppet-master-rs/src/install/app_paths.rs` (and update doc comments that show example paths: remove "RWM", use "Puppet Master" / "puppetmaster" as appropriate)
- `puppet-master-rs/src/doctor/checks/runtime_check.rs`
- `puppet-master-rs/src/config/default_config.rs`
- `puppet-master-rs/src/projects/persistence.rs` (and doc comments with path examples)

In the same files, remove any `.join("RWM Puppet Master")` (or similar) and use the path returned by ProjectDirs instead, so the app name in paths comes from the triplet.

### 2.2 Fallback / temp dirs (rwm-puppet-master → puppet-master)

Replace all path segments and dir names:

- `.rwm-puppet-master` → `.puppet-master`
- `rwm-puppet-master` (in temp or data paths) → `puppet-master`

**Files:**
- `puppet-master-rs/src/install/app_paths.rs` (fallback `home.join(".rwm-puppet-master")` → `.puppet-master`)
- `puppet-master-rs/src/config/default_config.rs` (all occurrences of `.rwm-puppet-master`, `temp_dir().join("rwm-puppet-master")`, `.../rwm-puppet-master` in fallback logic)
- `puppet-master-rs/src/utils/project_paths.rs`: probe file `.rwm-write-probe-{pid}-{nanos}` → `.pm-write-probe-{pid}-{nanos}`
- `puppet-master-rs/src/automation/workspace_clone.rs`: `.join("rwm-puppet-master-gui-automation")` → `.join("puppet-master-gui-automation")`

### 2.3 Autostart identifiers

In `puppet-master-rs/src/autostart.rs`:
- `com.rwm.puppet-master.desktop` → `com.puppetmaster.puppet-master.desktop`
- `com.rwm.puppet-master.plist` → `com.puppetmaster.puppet-master.plist`
- `<string>com.rwm.puppet-master</string>` → `<string>com.puppetmaster.puppet-master</string>`

### 2.4 User-Agent strings and temp dirs

- `puppet-master-rs/src/interview/reference_manager.rs`: `"RWM-PuppetMaster/0.1"` → `"PuppetMaster/0.1"` (or `"Puppet-Master/0.1"`).
- `puppet-master-rs/src/install/github_cli_installer.rs`:
  - `"rwm-puppet-master/1.0"` → `"puppet-master/1.0"` (two occurrences).
  - `temp_dir().join(format!("rwm-gh-{}", ...))` → `temp_dir().join(format!("pm-gh-{}", ...))`.
- `puppet-master-rs/src/install/copilot_installer.rs`: `"rwm-puppet-master/1.0"` → `"puppet-master/1.0"` (two occurrences).

### 2.5 Test sentinels

Replace `__rwm_nonexistent_binary_42__` with `__pm_nonexistent_binary_42__` in all three files that use it:

- `puppet-master-rs/src/doctor/checks/sdk_checks.rs`
- `puppet-master-rs/src/platforms/path_utils.rs` (two occurrences in tests)
- `puppet-master-rs/src/install/script_installer.rs` (one occurrence in a test)

### 2.6 Platform detector temp path

- `puppet-master-rs/src/platforms/platform_detector.rs`: `"rwm-pm-test-gh-{}-{}"` → `"pm-test-gh-{}-{}"`.

### 2.6 Config UI placeholder

- `puppet-master-rs/src/views/config.rs`: Placeholder or tooltip string `"rwm/{tier}/{id}"` → `"pm/{tier}/{id}"`. Also replace "Ralph Wiggum Model" (interview config copy) with e.g. "requirements interview model".

**Check:** `cargo check` and `cargo test` pass.

---

## Phase 3: User-Facing Strings and Header Logo

**Objective:** All user-visible text says "Puppet Master"; header shows "PUPPET MASTER" (no RWM).

### 3.1 Header widget

- `puppet-master-rs/src/widgets/header.rs`:
  - Comment: "RWM PUPPET MASTER" → "PUPPET MASTER".
  - Title text: `"RWM"` / `"RWM PUPPET MASTER"` → `"PUPPET MASTER"` for both (or use `"PM"` on mobile if desired).

### 3.2 Window and terminal

- `puppet-master-rs/src/app.rs`:
  - `.title("RWM Puppet Master")` → `.title("Puppet Master")`.
  - Terminal banner `"=== RWM Puppet Master Terminal ===\n"` → `"=== Puppet Master Terminal ===\n"`.

### 3.3 Setup, tray, main

- `puppet-master-rs/src/views/setup.rs`: "Welcome to RWM Puppet Master" → "Welcome to Puppet Master".
- `puppet-master-rs/src/tray.rs`: Tooltip "RWM Puppet Master" → "Puppet Master".
- `puppet-master-rs/src/main.rs`: Comment and log message "RWM Puppet Master" → "Puppet Master".

### 3.4 PR body and install scripts

- `puppet-master-rs/src/git/pr_manager.rs`: "*Generated by RWM Puppet Master*" → "*Generated by Puppet Master*" (and update test assertion).
- `puppet-master-rs/src/install/script_installer.rs`: Error messages "RWM Puppet Master" → "Puppet Master".

### 3.5 Interview / test strategy

- `puppet-master-rs/src/interview/test_strategy_generator.rs`: "Auto-generated by RWM Puppet Master interview" → "Auto-generated by Puppet Master interview".

### 3.6 Module and crate docs (Rust)

Replace "RWM Puppet Master" / "Ralph Wiggum" in `//!` and `///` with "Puppet Master" or neutral wording in:

- `puppet-master-rs/src/lib.rs`
- `puppet-master-rs/src/core/mod.rs`
- `puppet-master-rs/src/platforms/mod.rs`
- `puppet-master-rs/src/types/mod.rs`
- `puppet-master-rs/src/types/config.rs`
- `puppet-master-rs/src/widgets/mod.rs`
- `puppet-master-rs/src/config/default_config.rs`
- `puppet-master-rs/src/verification/mod.rs`
- `puppet-master-rs/src/state/mod.rs`
- `puppet-master-rs/src/git/mod.rs`
- `puppet-master-rs/src/tray.rs`

### 3.7 Icons README

- `puppet-master-rs/icons/README.md`: "RWM Puppet Master Icons" → "Puppet Master Icons".

**Check:** `cargo check` passes. Manually confirm header and window title show "Puppet Master" if possible.

---

## Phase 4: Package and Installers

**Objective:** Bundle name "Puppet Master", identifier `com.puppetmaster.puppet-master`; installer artifacts and paths use "Puppet Master" (no RWM).

### 4.1 Cargo.toml (package and bundle)

- `puppet-master-rs/Cargo.toml`:
  - `description`: remove "RWM ", keep "Puppet Master - AI-assisted development orchestrator".
  - `[package.metadata.bundle]`: `name = "Puppet Master"`, `identifier = "com.puppetmaster.puppet-master"`, `copyright = "Copyright (c) 2026"` (or your org; remove "RWM").

### 4.2 GitHub workflow

- `.github/workflows/build-installers.yml`:
  - Replace `RWM-Puppet-Master-` with `Puppet-Master-` in artifact names (Copy-Item, cp, codesign paths).
  - Replace `"RWM Puppet Master\puppet-master.exe"` with `"Puppet Master\puppet-master.exe"`.

### 4.3 Linux: nfpm and desktop

- `installer/linux/nfpm.yaml`:
  - Comment and `name: rwm-puppet-master` → `name: puppet-master` (or keep a hyphenated package name like `puppet-master-app` if needed to avoid conflict with Puppetlabs; document in comment).
  - Maintainer and description: "RWM Puppet Master" → "Puppet Master".
  - `com.rwm.puppet-master.desktop` → `com.puppetmaster.puppet-master.desktop` for both `src` and `dst`.
- Rename file: `installer/linux/applications/com.rwm.puppet-master.desktop` → `installer/linux/applications/com.puppetmaster.puppet-master.desktop`. Update nfpm `contents` to reference the new filename.

### 4.4 Linux: scripts

- `installer/linux/scripts/install.sh`: Comments and `rwm-puppet-master*.deb` → `puppet-master*.deb` (or whatever the new package name is).
- `installer/linux/scripts/preinstall`: Comment "rwm-puppet-master" → "puppet-master".

### 4.5 macOS

- `installer/macos/build-dmg.sh`: All "RWM Puppet Master", "RWM-Puppet-Master" → "Puppet Master", "Puppet-Master"; APP_NAME, BUNDLE_NAME, DMG_NAME, COMPAT_DMG, xattr message.
- `installer/macos/Info.plist`: CFBundleName, CFBundleDisplayName → "Puppet Master"; CFBundleIdentifier → `com.puppetmaster.puppet-master`.

### 4.6 Windows

- `installer/windows/puppet-master.nsi`: Replace all "RWM Puppet Master", "RWM", "RWMPuppetMaster" with "Puppet Master" and a single-word registry key (e.g. "PuppetMaster"). Update Name, OutFile, InstallDir, shortcuts, MUI_ strings, registry keys/values, CompanyName/Publisher, desktop/Start Menu paths.

### 4.7 Build and uninstall scripts (repo root and scripts/)

- `build-all-installers.sh` (repo root): Update comments, echo strings, and artifact path strings: `"RWM Puppet Master"` → `"Puppet Master"`, `RWM-Puppet-Master-` → `Puppet-Master-`.
- `scripts/build-linux-installer.sh`: PKG_NAME, echo text, Maintainer/Description/Name/Summary, "Ralph Wiggum Method", data dir "RWM Puppet Master" → "Puppet Master" and new package name.
- `scripts/build-installer-windows.bat`: Artifact name RWM-Puppet-Master → Puppet-Master.
- `scripts/test-linux-deb.sh`: Echo and grep patterns for package name.
- `scripts/os-clean/linux-uninstall-puppet-master.sh`: Comments, package name `rwm-puppet-master`, paths `com.rwm.puppet-master`, `.rwm-puppet-master`, "RWM Puppet Master".
- `scripts/os-clean/windows-uninstall-puppet-master.ps1`: "RWM Puppet Master" paths, `.rwm-puppet-master`, menu/shortcut names.
- `scripts/os-clean/macos-uninstall-puppet-master.sh`: "RWM Puppet Master" in comments and paths, `.rwm-puppet-master`, `com.rwm.puppet-master` → new names.

### 4.8 Installer README

- `installer/README.md`: Replace every "RWM Puppet Master", "RWM-Puppet-Master", "com.rwm.puppet-master", and path containing "RWM" with "Puppet Master" and new identifier/paths.

**Check:** `cargo check` and `cargo test` still pass. If CI builds installers, trigger a build and confirm artifact names and paths.

---

## Phase 5: Config YAML

**Objective:** Default naming uses `pm`; no `ralph` or `rwm` in config.

### 5.1 Repo config files

**Canonical naming pattern: `pm/{tier}/{id}`** -- use this everywhere.

- `.puppet-master/config.yaml`: `naming_pattern: ralph/{phase}/{task}` → `naming_pattern: pm/{tier}/{id}`.
- `.puppet-master/puppet-master.yaml`: `namingPattern: rwm/{tier}/{id}` → `namingPattern: pm/{tier}/{id}`. Leave `workingDirectory` as-is until Phase 7 (folder rename).
- `puppet-master-rs/puppet-master.yaml`: Same `namingPattern`; leave `workingDirectory` until Phase 7.

**Check:** No remaining `ralph` or `rwm` in these YAML files.

---

## Phase 6: Docs and Plans

**Objective:** All docs and plans refer to "Puppet Master"; no RWM, Ralph, or Ralph Wiggum branding.

### 6.1 Root and agent docs

- `AGENTS.md`: Title and intro "RWM Puppet Master" / "Ralph Wiggum Method" → "Puppet Master" and "four-tier hierarchical approach" (or similar). All `ralph:` examples → `pm:`; `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` → `<pm>COMPLETE</pm>` / `<pm>GUTTER</pm>`.
- `README.md`: "RWM Puppet Master", "Ralph Wiggum Method" → "Puppet Master" and neutral wording.
- `REQUIREMENTS.md`: Replace all "RWM", "RWM Puppet Master", "Ralph Wiggum", "ralph:", "ralph/", "<ralph>...", "ralph-automated" with "Puppet Master" and `pm:` / `pm/` / `<pm>...` / "pm-automated". Update legacy/attribution sections (e.g. snarktank/ralph) only if you want them neutralized; otherwise leave as historical credit.
- `STATE_FILES.md`: "RWM Puppet Master" → "Puppet Master" throughout.
- `.cursorrules`: First line and Project Context "RWM Puppet Master" → "Puppet Master".
- `.claude/CLAUDE.md`: Title "RWM Puppet Master" → "Puppet Master".
- `puppet-master-rs/README.md`: "RWM Puppet Master" → "Puppet Master".

### 6.2 Plans

- `Plans/newfeatures.md`: "RWM Puppet Master" → "Puppet Master".
- `Plans/orchestrator-subagent-integration.md`: "Ralph Loop", "Ralph Wiggum Loop", "enableRalphLoopPatterns" → "Puppet Master loop" / "orchestrator loop" and a neutral config key (e.g. enableOrchestratorLoopPatterns).
- `Plans/MiscPlan.md`: "ralph-clean-workspace" → e.g. "puppet-master-context".
- `Plans/WorktreeGitImprovement.md`: "ralph:" references → "pm:".

### 6.3 Conductor and docs

- `conductor/product.md`: "RWM Puppet Master", "Ralph Loops" → "Puppet Master", "orchestrator loops" (or similar).
- `conductor/tracks/gui_resizing_20260216/spec.md`: "RWM Puppet Master" → "Puppet Master".
- `docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md`: "RWM Puppet Master" → "Puppet Master".
- `docs/PROCESS_CLEANUP_README.md` and `docs/PROCESS_CLEANUP_SYSTEM.md`: "RWM Puppet Master" → "Puppet Master".

### 6.4 Reference and .cursor

- `Reference/BUILD_INSTALLER_FIXES.md`: com.rwm.puppet-master, rwm-puppet-master → new names.
- `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md`: com.rwm.puppet-master.desktop → com.puppetmaster.puppet-master.desktop.
- `Reference/TEST_SUMMARY_REPORT.md`: `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` → `<pm>...`.
- `Reference/GUI_ISSUES_AND_FIXES.md`: "RWM Puppet Master" and paths.
- `.cursor/MCP-CLI-vs-EXTENSION-PATHS.md` and `.cursor/CLAUDE_EXTENSION_AND_MCP.md`: "RWM Puppet Master" folder name → "Puppet Master" (or note "project folder" generically).
- `.cursor/commands/CHECK_STATUS.md`: ralph/signals/commit and package/path references.

### 6.5 Widget refs and evidence/audits

- `WIDGETS_VISUAL_REFERENCE.md` and `WIDGETS_QUICK_REFERENCE.md`: "RWM Puppet Master", "RWM" logo → "Puppet Master".
- `.puppet-master/evidence/gui-browser-test-report.md`: Title checks "RWM Puppet Master" → "Puppet Master".
- `.puppet-master/audits/integration-paths.md` and `.puppet-master/audits/integration-paths.json`: "ralph.*commit" → "pm.*commit"; project root path can be updated in Phase 7.
- `.puppet-master/audits/wiring.json`: `rootDir` path updated in Phase 7 if desired.

**Note:** Evidence `timeline.jsonl` files under `.puppet-master/evidence/` contain historical paths (workspace, cloneRoot). Leave as-is -- they are historical records. The verification grep excludes them (see checklist).

**Check:** Grep for `RWM|Ralph|ralph|Wiggum|rwm` in `*.md`, `*.yaml`, `*.json` (excluding evidence if not updated) and fix any remaining hits.

---

## Phase 7: Project Folder Rename

**Objective:** Repo root folder is no longer "RWM Puppet Master". Update any remaining path references.

### 7.1 Rename folder

- Rename the repository root directory from `RWM Puppet Master` to `Puppet Master` (or `puppet-master`). Do this outside the repo (e.g. in parent directory) or via git-safe rename so the workspace path changes.

### 7.2 Update path references

- `.puppet-master/puppet-master.yaml`: Set `workingDirectory` to the new path (e.g. `.../Puppet Master/.puppet-master`).
- `puppet-master-rs/puppet-master.yaml`: Set `workingDirectory` to the new path (e.g. `.../Puppet Master/puppet-master-rs`).
- `.puppet-master/audits/wiring.json` and `.puppet-master/audits/integration-paths.json`: Update `rootDir` / `projectRoot` to the new path if they are meant to reflect current project root.
- Optionally: bulk replace in `.puppet-master/evidence/**/timeline.jsonl` the old path `.../RWM Puppet Master/...` with `.../Puppet Master/...` (or chosen folder name).

### 7.3 Reopen workspace

- User should reopen the project in the editor using the new folder path so Cursor/IDE uses the new root.

---

## Verification Checklist (Pre-Completion)

Before marking the rebrand complete:

1. **Build and tests**
   - [ ] `cd puppet-master-rs && cargo check` passes with no errors.
   - [ ] `cargo test` passes (including output_parser and commit_formatter tests).
   - [ ] No new warnings from `cargo check 2>&1 | grep warning`.

2. **Grep sweep (no false positives)**
   - [ ] `grep -ri "RWM\|Ralph\|ralph\|Wiggum" --include="*.rs" --include="*.md" --include="*.yaml" --include="*.toml" --include="*.json" --exclude-dir=".puppet-master" --exclude-dir="Reference" .` returns no unintended matches. Ignore historical/attribution lines in REQUIREMENTS or Plans if left as-is.
   - [ ] `grep -ri "rwm" --include="*.rs" --include="*.yaml" --exclude-dir=".puppet-master" --exclude-dir="Reference" .` shows no remaining rwm path/identifier.

3. **Docs**
   - [ ] AGENTS.md, README.md, REQUIREMENTS.md, .cursorrules use "Puppet Master" and `pm:` / `<pm>...` where specified.
   - [ ] Installer README and scripts reference "Puppet Master" and new identifier/paths.

4. **Task status**
   - [ ] Update this plan's Task Status Log (below) with Status (PASS/FAIL), Date, summary, files changed, and commands run.

---

## Task Status Log

| Status | Date | Summary | Files changed | Commands / Notes |
|--------|------|---------|---------------|------------------|
| (pending) | -- | Rebrand not yet started. | -- | -- |

*(After completion, fill in: Status PASS/FAIL, date YYYY-MM-DD, short summary, list of key files, `cargo check`/`cargo test` results, and any FAIL details.)*
