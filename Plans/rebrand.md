# Rebrand Implementation Plan: legacy naming → Puppet Master

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Audience:** AI agent performing the rebrand.
**Goal:** Remove all legacy naming; the product name is **Puppet Master**.  No backward compatibility required.

**Conventions used in this plan:**
- **Replace with:** canonical new value from the token table below.
- Paths are relative to repo root unless noted.
- After each phase, run `cd puppet-master-rs && cargo check && cargo test` and fix any failures before proceeding.
- `Reference/` is excluded from scope -- it is external reference material, not part of this project.

---

## Token Inventory (Canonical Values -- Decide Once, Apply Everywhere)

Treat these as constants for the entire rebrand. Never invent a new variant mid-task.

| Token | Value |
|-------|-------|
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

## Phase 1: Backend Protocol (legacy prefix → pm, build env)

**Objective:** Replace completion signals and commit prefix with `pm`; rename build env vars to `PM_BUILD_*`.

### 1.1 Completion signals

Replace legacy completion signal with `<pm>COMPLETE</pm>` and legacy gutter signal with `<pm>GUTTER</pm>` in:

| File | Notes |
|------|--------|
| `puppet-master-rs/src/platforms/runner.rs` | String checks and regex construction |
| `puppet-master-rs/src/core/orchestrator.rs` | Doc/example string |
| `puppet-master-rs/src/core/prompt_builder.rs` | Prompt text and test assertion; also update app name in prompt header to "Puppet Master" |
| `puppet-master-rs/src/core/execution_engine.rs` | Line contains checks |
| `puppet-master-rs/src/platforms/output_parser.rs` | Module doc, comments, detection logic, tests |
| `puppet-master-rs/examples/output_parser_usage.rs` | Example stdout string; also update any legacy app name to "Puppet Master" |

### 1.2 Commit prefix

In `puppet-master-rs/src/git/commit_formatter.rs`:
- Replace the legacy commit prefix in all format strings and doc comments with `pm:`.
- Update doc comment to say "Puppet Master conventions".
- Update all tests that assert on the legacy prefix to expect `pm:`.

### 1.3 Default branch naming pattern

- `puppet-master-rs/src/config/gui_config.rs`: In `default_naming_pattern()`, replace the legacy pattern with `"pm/{tier}/{id}"`.
- `puppet-master-rs/src/types/config.rs`: Same in `default_naming_pattern()`.

### 1.4 Build env vars

Update both files together -- `build.rs` emits the env vars at compile time; `build_info.rs` reads them. They must stay in sync.

- `puppet-master-rs/build.rs`: Replace every legacy `*_BUILD_*` env var with `PM_BUILD_*` (SEMVER, GIT_SHA, GIT_DIRTY, PROFILE, TARGET, BUILD_ID, BUILD_UTC).
- `puppet-master-rs/src/build_info.rs`: Replace every `option_env!` call referencing the legacy build prefix with `option_env!("PM_BUILD_...")`. Set `APP_DISPLAY_NAME` to `"Puppet Master"` and update any format strings to use "Puppet Master".

### 1.5 Other legacy naming in Phase 1 scope

- `puppet-master-rs/src/interview/document_writer.rs`: Comment referencing legacy loop name → "Puppet Master loop" (or "orchestrator loop").

**Check:** `cargo check` and `cargo test` in `puppet-master-rs` pass.

---

## Phase 2: App Identity and Paths

**Objective:** Single app identity: qualifier `com`, organization `puppetmaster`, application `Puppet Master`. Replace all legacy naming in path segments and identifiers.

### 2.1 ProjectDirs triplet

Use `("com", "puppetmaster", "Puppet Master")` everywhere. Replace every legacy `ProjectDirs::from(...)` call with:

- `ProjectDirs::from("com", "puppetmaster", "Puppet Master")`

**Files:**
- `puppet-master-rs/src/utils/project_paths.rs`
- `puppet-master-rs/src/install/app_paths.rs` (and update doc comments that show example paths: use "Puppet Master" / "puppetmaster" as appropriate)
- `puppet-master-rs/src/doctor/checks/runtime_check.rs`
- `puppet-master-rs/src/config/default_config.rs`
- `puppet-master-rs/src/projects/persistence.rs` (and doc comments with path examples)

In the same files, remove any `.join()` of the legacy app name and use the path returned by ProjectDirs instead, so the app name in paths comes from the triplet.

### 2.2 Fallback / temp dirs

Replace all legacy path segments and dir names with canonical values:

- Legacy fallback data dir → `.puppet-master`
- Legacy temp dir prefix → `puppet-master`

**Files:**
- `puppet-master-rs/src/install/app_paths.rs` (fallback dir → `.puppet-master`)
- `puppet-master-rs/src/config/default_config.rs` (all legacy dir names in fallback logic)
- `puppet-master-rs/src/utils/project_paths.rs`: probe file prefix → `.pm-write-probe-{pid}-{nanos}`
- `puppet-master-rs/src/automation/workspace_clone.rs`: workspace clone dir → `puppet-master-gui-automation`

### 2.3 Autostart identifiers

In `puppet-master-rs/src/autostart.rs`: update all legacy bundle/plist/desktop identifiers to `com.puppetmaster.puppet-master`.

### 2.4 User-Agent strings and temp dirs

- `puppet-master-rs/src/interview/reference_manager.rs`: legacy user-agent → `"Puppet-Master/0.1"`.
- `puppet-master-rs/src/install/github_cli_installer.rs`:
  - Legacy user-agent (two occurrences) → `"puppet-master/1.0"`.
  - Legacy temp dir join prefix → `"pm-gh-"`.
- `puppet-master-rs/src/install/copilot_installer.rs`: Legacy user-agent (two occurrences) → `"puppet-master/1.0"`.

### 2.5 Test sentinels

Replace the legacy nonexistent-binary sentinel with `__pm_nonexistent_binary_42__` in:

- `puppet-master-rs/src/doctor/checks/sdk_checks.rs`
- `puppet-master-rs/src/platforms/path_utils.rs` (two occurrences in tests)
- `puppet-master-rs/src/install/script_installer.rs` (one occurrence in a test)

### 2.6 Platform detector temp path

- `puppet-master-rs/src/platforms/platform_detector.rs`: Legacy temp path format string → `"pm-test-gh-{}-{}"`.

### 2.7 Config UI placeholder

- `puppet-master-rs/src/views/config.rs`: Legacy branch naming placeholder → `"pm/{tier}/{id}"`. Also replace legacy interview model name with "requirements interview model".

**Check:** `cargo check` and `cargo test` pass.

---

## Phase 3: User-Facing Strings and Header Logo

**Objective:** All user-visible text says "Puppet Master"; header shows "PUPPET MASTER" (no legacy naming).

### 3.1 Header widget

- `puppet-master-rs/src/widgets/header.rs`:
  - Comment: update legacy heading → "PUPPET MASTER".
  - Title text: update legacy title(s) → `"PUPPET MASTER"` for both (or use `"PM"` on mobile if desired).

### 3.2 Window and terminal

- `puppet-master-rs/src/app.rs`:
  - `.title(...)` → `.title("Puppet Master")`.
  - Terminal banner → `"=== Puppet Master Terminal ===\n"`.

### 3.3 Setup, tray, main

- `puppet-master-rs/src/views/setup.rs`: Welcome message → "Welcome to Puppet Master".
- `puppet-master-rs/src/tray.rs`: Tooltip → "Puppet Master".
- `puppet-master-rs/src/main.rs`: Comment and log message → "Puppet Master".

### 3.4 PR body and install scripts

- `puppet-master-rs/src/git/pr_manager.rs`: Footer text → "*Generated by Puppet Master*" (and update test assertion).
- `puppet-master-rs/src/install/script_installer.rs`: Error messages → "Puppet Master".

### 3.5 Interview / test strategy

- `puppet-master-rs/src/interview/test_strategy_generator.rs`: Header comment → "Auto-generated by Puppet Master interview".

### 3.6 Module and crate docs (Rust)

Replace legacy app name / legacy method name in `//!` and `///` with "Puppet Master" or neutral wording in:

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

- `puppet-master-rs/icons/README.md`: Update heading → "Puppet Master Icons".

**Check:** `cargo check` passes. Manually confirm header and window title show "Puppet Master" if possible.

---

## Phase 4: Package and Installers

**Objective:** Bundle name "Puppet Master", identifier `com.puppetmaster.puppet-master`; installer artifacts and paths use "Puppet Master" (no legacy naming).

### 4.1 Cargo.toml (package and bundle)

- `puppet-master-rs/Cargo.toml`:
  - `description`: "Puppet Master - AI-assisted development orchestrator".
  - `[package.metadata.bundle]`: `name = "Puppet Master"`, `identifier = "com.puppetmaster.puppet-master"`, `copyright = "Copyright (c) 2026"`.

### 4.2 GitHub workflow

- `.github/workflows/build-installers.yml`:
  - Replace legacy artifact name prefix with `Puppet-Master-` in artifact names (Copy-Item, cp, codesign paths).
  - Replace legacy Windows path with `"Puppet Master\puppet-master.exe"`.

### 4.3 Linux: nfpm and desktop

- `installer/linux/nfpm.yaml`:
  - `name: puppet-master` (note: if conflict with Puppetlabs is a concern, use `puppet-master-app`; document in comment).
  - Maintainer and description: "Puppet Master".
  - Desktop file references → `com.puppetmaster.puppet-master.desktop`.
- Rename file: `installer/linux/applications/` — legacy `.desktop` file → `com.puppetmaster.puppet-master.desktop`. Update nfpm `contents` to reference the new filename.

### 4.4 Linux: scripts

- `installer/linux/scripts/install.sh`: Comments and package glob → `puppet-master*.deb`.
- `installer/linux/scripts/preinstall`: Comment → "puppet-master".

### 4.5 macOS

- `installer/macos/build-dmg.sh`: All legacy naming → "Puppet Master" / "Puppet-Master"; APP_NAME, BUNDLE_NAME, DMG_NAME, COMPAT_DMG, xattr message.
- `installer/macos/Info.plist`: CFBundleName, CFBundleDisplayName → "Puppet Master"; CFBundleIdentifier → `com.puppetmaster.puppet-master`.

### 4.6 Windows

- `installer/windows/puppet-master.nsi`: Replace all legacy naming with "Puppet Master" and a single-word registry key (e.g. "PuppetMaster"). Update Name, OutFile, InstallDir, shortcuts, MUI_ strings, registry keys/values, CompanyName/Publisher, desktop/Start Menu paths.

### 4.7 Build and uninstall scripts (repo root and scripts/)

- `build-all-installers.sh` (repo root): Update comments, echo strings, and artifact path strings to "Puppet Master" / `Puppet-Master-`.
- `scripts/build-linux-installer.sh`: PKG_NAME, echo text, Maintainer/Description/Name/Summary, legacy method name, data dir → "Puppet Master" and new package name.
- `scripts/build-installer-windows.bat`: Artifact name → `Puppet-Master`.
- `scripts/test-linux-deb.sh`: Echo and grep patterns for package name.
- `scripts/os-clean/linux-uninstall-puppet-master.sh`: Comments, package name, paths, legacy identifiers → canonical names.
- `scripts/os-clean/windows-uninstall-puppet-master.ps1`: Legacy paths, dir names, menu/shortcut names → canonical names.
- `scripts/os-clean/macos-uninstall-puppet-master.sh`: Comments, paths, legacy identifiers → canonical names.

### 4.8 Installer README

- `installer/README.md`: Replace every legacy naming occurrence (names, identifiers, paths) with "Puppet Master" and new identifier/paths.

**Check:** `cargo check` and `cargo test` still pass. If CI builds installers, trigger a build and confirm artifact names and paths.

---

## Phase 5: Config YAML

**Objective:** Default naming uses `pm`; no legacy naming in config.

### 5.1 Repo config files

**Canonical naming pattern: `pm/{tier}/{id}`** -- use this everywhere.

- `.puppet-master/config.yaml`: Replace legacy naming pattern with `naming_pattern: pm/{tier}/{id}`.
- `.puppet-master/puppet-master.yaml`: Replace legacy `namingPattern` with `namingPattern: pm/{tier}/{id}`. Leave `workingDirectory` as-is until Phase 7 (folder rename).
- `puppet-master-rs/puppet-master.yaml`: Same `namingPattern`; leave `workingDirectory` until Phase 7.

**Check:** No remaining legacy naming in these YAML files.

---

## Phase 6: Docs and Plans

**Objective:** All docs and plans refer to "Puppet Master"; no legacy naming anywhere.

### 6.1 Root and agent docs

- `AGENTS.md`: Title and intro → "Puppet Master" and "four-tier hierarchical approach" (or similar). All legacy commit prefix examples → `pm:`; legacy completion/gutter signals → `<pm>COMPLETE</pm>` / `<pm>GUTTER</pm>`.
- `README.md`: Legacy naming → "Puppet Master" and neutral wording.
- `REQUIREMENTS.md`: Replace all legacy naming, signals, and commit prefix references with "Puppet Master" and `pm:` / `pm/` / `<pm>...` / "pm-automated". Update legacy/attribution sections only if you want them neutralized; otherwise leave as historical credit.
- `STATE_FILES.md`: Legacy naming → "Puppet Master" throughout.
- `.cursorrules`: First line and Project Context → "Puppet Master".
- `.claude/CLAUDE.md`: Title → "Puppet Master".
- `puppet-master-rs/README.md`: Legacy naming → "Puppet Master".

### 6.2 Plans

- `Plans/newfeatures.md`: Legacy naming → "Puppet Master".
- `Plans/orchestrator-subagent-integration.md`: Legacy loop names, legacy config key → "Puppet Master loop" / "orchestrator loop" and `enableOrchestratorLoopPatterns`.
- `Plans/MiscPlan.md`: Legacy workspace context name → e.g. "puppet-master-context".
- `Plans/WorktreeGitImprovement.md`: Legacy commit prefix references → `pm:`.

### 6.3 Conductor and docs

- `conductor/product.md`: Legacy naming → "Puppet Master", "orchestrator loops" (or similar).
- `conductor/tracks/gui_resizing_20260216/spec.md`: Legacy naming → "Puppet Master".
- `docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md`: Legacy naming → "Puppet Master".
- `docs/PROCESS_CLEANUP_README.md` and `docs/PROCESS_CLEANUP_SYSTEM.md`: Legacy naming → "Puppet Master".

### 6.4 Reference and .cursor

- `Reference/BUILD_INSTALLER_FIXES.md`: Legacy identifiers → new names.
- `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md`: Legacy desktop identifier → `com.puppetmaster.puppet-master.desktop`.
- `Reference/TEST_SUMMARY_REPORT.md`: Legacy signals → `<pm>COMPLETE</pm>` / `<pm>GUTTER</pm>`.
- `Reference/GUI_ISSUES_AND_FIXES.md`: Legacy naming and paths.
- `.cursor/MCP-CLI-vs-EXTENSION-PATHS.md` and `.cursor/CLAUDE_EXTENSION_AND_MCP.md`: Legacy folder name → "Puppet Master" (or "project folder" generically).
- `.cursor/commands/CHECK_STATUS.md`: Legacy signals/commit prefix and package/path references.

### 6.5 Widget refs and evidence/audits

- `WIDGETS_VISUAL_REFERENCE.md` and `WIDGETS_QUICK_REFERENCE.md`: Legacy naming / logo → "Puppet Master".
- `.puppet-master/evidence/gui-browser-test-report.md`: Title checks → "Puppet Master".
- `.puppet-master/audits/integration-paths.md` and `.puppet-master/audits/integration-paths.json`: Legacy commit prefix pattern → `pm.*commit`; project root path updated in Phase 7.
- `.puppet-master/audits/wiring.json`: `rootDir` path updated in Phase 7 if desired.

**Note:** Evidence `timeline.jsonl` files under `.puppet-master/evidence/` contain historical paths (workspace, cloneRoot). Leave as-is -- they are historical records. The verification heuristic excludes them.

**Check:** Naming-drift heuristic (see Verification section) returns no anomalous matches. Inspect any hits manually.

---

## Phase 7: Project Folder Rename

**Objective:** Repo root folder no longer uses legacy naming. Update any remaining path references.

### 7.1 Rename folder

- Rename the repository root directory from the legacy name to `Puppet Master` (or `puppet-master`). Do this outside the repo (e.g. in parent directory) or via git-safe rename so the workspace path changes.

### 7.2 Update path references

- `.puppet-master/puppet-master.yaml`: Set `workingDirectory` to the new path (e.g. `.../Puppet Master/.puppet-master`).
- `puppet-master-rs/puppet-master.yaml`: Set `workingDirectory` to the new path (e.g. `.../Puppet Master/puppet-master-rs`).
- `.puppet-master/audits/wiring.json` and `.puppet-master/audits/integration-paths.json`: Update `rootDir` / `projectRoot` to the new path if they are meant to reflect current project root.
- Optionally: bulk replace in `.puppet-master/evidence/**/timeline.jsonl` the old path with the new folder name (or chosen folder name).

### 7.3 Reopen workspace

- User should reopen the project in the editor using the new folder path so Cursor/IDE uses the new root.

---

## Verification Checklist (Pre-Completion)

Before marking the rebrand complete:

1. **Build and tests**
   - [ ] `cd puppet-master-rs && cargo check` passes with no errors.
   - [ ] `cargo test` passes (including output_parser and commit_formatter tests).
   - [ ] No new warnings from `cargo check 2>&1 | grep warning`.

2. **Positive naming checks**
   - [ ] `grep -ri "Puppet Master" AGENTS.md README.md` exits 0 (canonical name present).
   - [ ] `grep -r "pm:" puppet-master-rs/src/git/commit_formatter.rs` exits 0 (canonical commit prefix present).
   - [ ] `grep -r "<pm>COMPLETE</pm>" puppet-master-rs/src/platforms/output_parser.rs` exits 0.

3. **Naming-drift heuristic (no legacy strings embedded)**
   ```bash
   rg -n "\b[A-Z]{2,}[-\s]+Puppet Master\b" \
     --type-add 'doc:*.{md,yaml,toml,json}' -t doc . || true
   ```
   Inspect any hits; confirm they are not legacy naming drift.

4. **Docs**
   - [ ] AGENTS.md, README.md, REQUIREMENTS.md, .cursorrules use "Puppet Master" and `pm:` / `<pm>...` where specified.
   - [ ] Installer README and scripts reference "Puppet Master" and new identifier/paths.

5. **Task status**
   - [ ] Update this plan's Task Status Log (below) with Status (PASS/FAIL), Date, summary, files changed, and commands run.

---

## SSOT References

- [Plans/DRY_Rules.md](Plans/DRY_Rules.md) — DRY enforcement rules
- [Plans/Progression_Gates.md](Plans/Progression_Gates.md) — phase gates and completion criteria
- [Plans/Decision_Policy.md](Plans/Decision_Policy.md) — decision and escalation policy
- [Plans/Project_Output_Artifacts.md](Plans/Project_Output_Artifacts.md) — canonical artifact registry
- [Plans/Contracts_V0.md](Plans/Contracts_V0.md) — contract layer definitions
- [Plans/Spec_Lock.json](Plans/Spec_Lock.json) — locked spec values

---

## Task Status Log

| Status | Date | Summary | Files changed | Commands / Notes |
|--------|------|---------|---------------|------------------|
| (pending) | -- | Rebrand not yet started. | -- | -- |

*(After completion, fill in: Status PASS/FAIL, date YYYY-MM-DD, short summary, list of key files, `cargo check`/`cargo test` results, and any FAIL details.)*
