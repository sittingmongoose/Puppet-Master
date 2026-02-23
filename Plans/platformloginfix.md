# Platform Detection, Login, Model & Effort Fix Plan

> NON-CANONICAL / legacy work note: this document is retained for historical context only.
> Follow `Plans/Spec_Lock.json` + `Plans/Crosswalk.md` for current SSOT.
>
> ContractRef: SchemaID:Spec_Lock.json

## Context

Platform detection, login flows, model detection, and effort levels are broken/inconsistent across the GUI. Testing on macOS reveals:
- Doctor shows all 5 platforms as installed (false positives for Codex/Copilot)
- Setup page contradicts Doctor when clicking individual platforms
- Codex login shows toast error (no terminal spawned for interactive login)
- Gemini login opens CLI without clear login guidance
- GitHub Copilot login works in terminal but GUI doesn't update auth status or models
- Config page shows models/effort for platforms that aren't installed or authenticated
- No auth-gating: platforms show as "available" if binary exists, even without login

Root cause: detection doesn't validate binaries, login flows have terminal-spawn gaps, and there's no unified "installed + authenticated = available" gate across all views.

---

## Phase 1: Fix Platform Detection (prevent false positives) — DONE

### 1a. Add binary validation to `platform_detector.rs` — DONE
**File**: `puppet-master-rs/src/platforms/platform_detector.rs`

Added `validate_and_get_version()` method that runs the binary with `--version` and uses a **collision-only** check: it only rejects a binary if the output positively identifies as a *different* platform. This approach was needed because some CLIs (Gemini, Cursor) output bare version numbers with no brand keywords.

Distinctive brand markers used for collision detection:
- `"openai"` / `"codex-cli"` → Codex
- `"github copilot"` → Copilot
- `"claude code"` / `"anthropic"` → Claude

Called in all 6 detection stages. If validation fails, the detector continues to the next candidate.

### 1b. Unify Doctor checks with PlatformDetector — DONE
**File**: `puppet-master-rs/src/doctor/checks/cli_checks.rs`

Replaced manual CLI detection with `PlatformDetector::detect_platform()`. Doctor and Setup now use identical detection logic. Added "Browse" button next to failing CLI checks for manual path selection (handled by `DoctorBrowsePlatformPath` / `DoctorPlatformPathSelected` messages in app.rs).

---

## Phase 2: Fix Login Flows — DONE

### 2a. Fix Codex login — needs terminal — DONE
**File**: `puppet-master-rs/src/platforms/platform_specs.rs`

Changed Codex `login_needs_terminal: false` → `login_needs_terminal: true`

### 2b. Make terminal-spawn data-driven — DONE
**File**: `puppet-master-rs/src/platforms/auth_actions.rs`

Replaced the hardcoded platform match with a spec-driven check using `spec.auth.login_needs_terminal`.

### 2c. Improve Gemini login toast message — DONE
**File**: `puppet-master-rs/src/app.rs` (in `PlatformLoginComplete` handler)

Per-platform toast messages for deferred login: Gemini gets "Select 'Login with Google'", Copilot gets "Complete the OAuth device flow", etc.

### 2d. Auto-refresh models after auth changes — DONE
**File**: `puppet-master-rs/src/app.rs`

Added `rebuild_visible_models()` helper. After auth status updates, it rebuilds `config_models` using **only cached/dynamic models** (no static fallbacks). Unavailable platforms get their models removed.

### 2e. Fix Copilot auth detection — DONE (added this session)
**File**: `puppet-master-rs/src/platforms/auth_status.rs`

**Root cause**: `copilot login` stores auth in `~/.copilot/config.json` under `logged_in_users`, completely separate from `gh auth`. The old code only checked `gh auth status`.

**Fix**: Added `copilot_config_has_logged_in_user()` which reads `~/.copilot/config.json` and checks for a non-empty `logged_in_users` array. This is the primary check; `gh auth status` is kept as a fallback.

Verified on Mac via SSH: `~/.copilot/config.json` contains `"logged_in_users": [{"host": "https://github.com", "login": "sittingmongoose"}]`.

---

## Phase 3: Auth-Gating Across All Views — DONE

### 3a. Update config view platform availability — DONE
**File**: `puppet-master-rs/src/views/config.rs`

`format_platform_option()` now shows: "(not installed)" / "(not logged in)" / "✓". `is_platform_available()` requires both installed AND authenticated. Effort picker gated by `platform_available`.

### 3b. Pass auth_status to config view — DONE
**File**: `puppet-master-rs/src/app.rs`

Added `&self.platform_auth_status` to the `views::config::view()` call.

### 3c-d. Update availability helpers — DONE
**File**: `puppet-master-rs/src/app.rs`

`setup_reports_platform_available()` checks both install AND auth. `unavailable_platform_reason()` returns "Not authenticated. Go to Login to authenticate." when installed but not authed.

### 3e. Pass auth_status to wizard view — DONE
**File**: `puppet-master-rs/src/views/wizard.rs`

Same auth-gating pattern as config. Platform dropdowns show availability based on install + auth.

---

## Phase 4: Startup & Lifecycle — DONE

### 4a. Auto-run detection + auth on app startup — DONE
Startup task batch includes `SetupRunDetection` + `refresh_auth_status_task()`.

### 4b. Chain auth refresh after detection completes — DONE
`SetupDetectionComplete` handler also calls `refresh_auth_status_task()` and `rebuild_visible_models()`.

---

## Phase 5: Model Visibility Based on Availability — DONE

### 5a-b. Only populate models for available platforms — DONE
**File**: `puppet-master-rs/src/app.rs`

`rebuild_visible_models()` uses **only cached/dynamic models from `model_cache`** — never static fallbacks. `config_models` starts empty (was `build_model_map_from_specs()`). Wizard models (`WizardRefreshModels`, `WizardModelsLoaded`) use the same gating.

**User directive**: "There should never be fallback models or effort/reasoning. We need to know it exactly and if we don't we don't display it. The only fallback, would be showing a previous good, validated list."

---

## Phase 6: Additional Fixes (added this session)

### 6a. Fix git-repo initialization — DONE
**File**: `puppet-master-rs/src/doctor/checks/git_checks.rs`

**Root cause**: `git init` ran in the process CWD, which on macOS launched from DMG/Finder could be `/` or `/Applications` (read-only).

**Fix**: Added `resolve_git_init_dir()` which finds a writable directory (CWD → home). Both `run()` and `fix()` now use `.current_dir(&target_dir)`. Better error messages include the target directory path.

### 6b. Fix selectable_label lifetime bug — DONE
**File**: `puppet-master-rs/src/widgets/selectable_text.rs`

**Root cause**: The other agent (selectable text/copy-paste implementation) created `selectable_label(theme, value)` with `value: &'a str`, tying the value lifetime to the element. But iced's `text_input` copies the value internally, so `value` doesn't need to live as long as `'a`. This caused ~90+ compile errors across all views where `&format!(...)` temporaries were used.

**Fix**: Changed `value: &'a str` → `value: &str` in both `selectable_label` and `selectable_label_mono`. One-line fix per function that resolved all ~90 errors.

### 6c. Fix layout_helpers generic type mismatch — DONE
**File**: `puppet-master-rs/src/widgets/layout_helpers.rs`

**Root cause**: `responsive_form_row` and `responsive_label_value` were generic over `Message: 'a`, but `selectable_label` returns `Element<'a, crate::app::Message>` (concrete type).

**Fix**: Changed from generic `Message` parameter to concrete `crate::app::Message`.

### 6d. Fix context menu overlay (iced API changes) — DONE
**File**: `puppet-master-rs/src/app.rs`

Replaced removed `iced::widget::absolute` with `iced::widget::float` for context menu positioning. Fixed `Space::new()` API (no longer takes width/height args in iced 0.14). Fixed `render_context_menu_overlay` lifetime (`&self` → `&'a self`).

### 6e. Fix dashboard lifetime issues — DONE
**File**: `puppet-master-rs/src/views/dashboard.rs`

Restored `selectable_label`/`selectable_label_mono` usage (was temporarily changed to `text()`) now that the lifetime fix in 6b resolves the root cause. Restored proper imports.

---

## Phase 7: Effort/Reasoning Gating — DONE

### 7a. Remove fallback models from config view — DONE
**File**: `puppet-master-rs/src/views/config.rs`

**Root cause**: `model_list_for()` closure fell back to `fallback_model_ids()` from static specs when no dynamic models were available. This contradicted the "no fallbacks" directive.

**Fix**: Simplified to `models.get(&tier_config.platform).cloned().unwrap_or_default()` — returns empty vec when no dynamic models exist.

### 7b. Gate effort visibility on dynamic models — DONE
**Files**: `puppet-master-rs/src/views/config.rs`, `puppet-master-rs/src/views/wizard.rs`

**Root cause**: `effort_visible_for()` (config) and `show_reasoning` (wizard) used `supports_effort()` from static specs. Effort dropdowns appeared even when the platform had no dynamically detected models.

**Fix**: Added `&& models.get(&tier_config.platform).map_or(false, |m| !m.is_empty())` gate to config's `effort_visible_for()`. In wizard, added `has_dynamic_models` check before `show_reasoning`. Removed `REASONING_EFFORTS` static fallback constant from wizard.

**Result**: Effort/reasoning dropdowns only appear when we have dynamically confirmed model data for the platform. The effort level options still come from `platform_specs.rs` (since there's no CLI to query effort levels), but the **visibility** is gated on dynamic model detection.

---

## Files Modified (Complete Summary)

| File | Changes |
|------|---------|
| `platform_detector.rs` | `validate_and_get_version()` with collision-only check, called in all 6 stages |
| `platform_specs.rs` | Codex `login_needs_terminal: true` |
| `auth_actions.rs` | Data-driven terminal spawn using `spec.auth.login_needs_terminal` |
| `auth_status.rs` | **Copilot auth**: reads `~/.copilot/config.json` `logged_in_users`; `gh auth` as fallback |
| `cli_checks.rs` | Uses `PlatformDetector` instead of manual detection |
| `git_checks.rs` | `resolve_git_init_dir()` + `.current_dir()` for writable target dir |
| `app.rs` | Startup tasks, auth-gating helpers, model visibility rebuild, pass auth to views, context menu overlay (absolute→float), Doctor browse handler |
| `views/config.rs` | Auth-aware `format_platform_option()`, hide model/effort for unavailable platforms, removed fallback models, effort gated on dynamic models |
| `views/wizard.rs` | Same auth-gating for wizard platform/model pickers, effort gated on dynamic models, removed `REASONING_EFFORTS` fallback |
| `views/doctor.rs` | "Browse" button next to failing CLI checks |
| `views/dashboard.rs` | Restored `selectable_label`/`selectable_label_mono` with lifetime fix |
| `widgets/selectable_text.rs` | **Lifetime fix**: `value: &'a str` → `value: &str` |
| `widgets/layout_helpers.rs` | Generic `Message` → concrete `crate::app::Message` |

---

## Build Status

- `cargo check` — **compiles clean** (29 warnings, 0 errors)
- `cargo test --lib platforms` — **172 passed**
- `cargo test --lib doctor::checks` — **29 passed**
- `cargo test --lib platforms::auth_status` — **9 passed**
- Full `cargo test` — OOM killed on this machine (test binary too large for available RAM); individual test suites pass

---

## What's Left (for next agent)

### Remaining from original plan
- [ ] **Manual verification on Mac** — Build on Mac via SSH, test all views
- [ ] **Manual verification on Linux** — Same
- [ ] **Manual verification on Windows** — Same

### Remaining issues reported by user
- [x] **Effort/reasoning display** — DONE. See Phase 7 below.
- [ ] **29 compiler warnings** — Mostly unused imports/variables from the selectable text agent's work. Can be cleaned up with `cargo fix --lib -p puppet-master`.

### Key architecture decisions to preserve
1. **No fallback models or effort** — Only dynamically detected (from CLI) or cached (from previous successful detection). Never static specs.
2. **Collision-only binary validation** — Don't require brand keywords (Gemini/Cursor output bare versions); only reject if output identifies as a *different* platform.
3. **Copilot auth** — Primary: `~/.copilot/config.json` `logged_in_users`. Fallback: `gh auth status`. The two are separate auth systems.
4. **Selectable text lifetime** — `value: &str` (not `&'a str`) because iced `text_input` copies the value internally.

---

## SSH Credentials (for manual testing) — redacted
This document previously included plaintext SSH credentials.
Those are secrets and MUST NOT be stored in this repository.

If SSH verification is needed, store credentials in the OS credential store and reference them by profile name only.

ContractRef: Plans/Architecture_Invariants.md#INV-002

### Mac CLI locations (confirmed via SSH)
- Claude: `/usr/local/bin/claude` → "2.1.34 (Claude Code)"
- Codex: `/usr/local/bin/codex` → "codex-cli 0.98.0"
- Gemini: `/opt/homebrew/bin/gemini` → "0.27.3" (bare version, no brand)
- Copilot: `/usr/local/bin/copilot` → "GitHub Copilot CLI 0.0.408"
- Cursor: not confirmed on Mac
- gh: `/opt/homebrew/bin/gh` → "gh version 2.86.0"
