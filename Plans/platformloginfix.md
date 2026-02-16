# Platform Detection, Login, Model & Effort Fix Plan

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

## Phase 1: Fix Platform Detection (prevent false positives)

### 1a. Add binary validation to `platform_detector.rs`
**File**: `puppet-master-rs/src/platforms/platform_detector.rs`

After finding a candidate binary in any detection stage, validate it actually belongs to the claimed platform by running `--version` and checking the output contains expected keywords.

Add method:
```rust
async fn validate_detected_binary(platform: Platform, path: &Path, version_flag: &str) -> bool {
    // Run binary with version flag, 3-second timeout
    // Check output contains platform-specific identifiers:
    //   Codex -> "codex" or "openai"
    //   Copilot -> "copilot" or "github"
    //   Claude -> "claude" or "anthropic"
    //   Gemini -> "gemini" or "google"
    //   Cursor -> "cursor" or "agent"
    // Return false if binary doesn't match, causing detector to continue searching
}
```

Call `validate_detected_binary()` after each `get_version_for_path()` in all 6 stages. If validation fails, `continue` to next candidate.

### 1b. Unify Doctor checks with PlatformDetector
**File**: `puppet-master-rs/src/doctor/checks/cli_checks.rs`

Replace manual CLI detection in doctor checks with `PlatformDetector::detect_platform_with_custom_paths_trace()`. This ensures Doctor and Setup use identical detection logic. The `run()` method is already async, so calling the async detector is straightforward.

---

## Phase 2: Fix Login Flows

### 2a. Fix Codex login — needs terminal
**File**: `puppet-master-rs/src/platforms/platform_specs.rs` (line ~510)

Change Codex `login_needs_terminal: false` → `login_needs_terminal: true`

### 2b. Make terminal-spawn data-driven
**File**: `puppet-master-rs/src/platforms/auth_actions.rs` (lines 90-95)

Replace the hardcoded platform match with a spec-driven check:
```rust
// BEFORE: hardcoded list of Claude | Gemini | Copilot
// AFTER:
if let AuthTarget::Platform(platform) = target {
    let spec = platform_specs::get_spec(platform);
    if spec.auth.login_needs_terminal {
        // ... existing terminal spawn code ...
    }
}
```

This automatically picks up Codex (now `login_needs_terminal: true`) and any future platforms.

### 2c. Improve Gemini login toast message
**File**: `puppet-master-rs/src/app.rs` (in `PlatformLoginComplete` handler, ~line 5251)

For Gemini deferred login, customize toast: "Gemini CLI opened in terminal. Select 'Login with Google' when prompted to authenticate."

### 2d. Auto-refresh models after auth status changes
**File**: `puppet-master-rs/src/app.rs` (in `AuthStatusReceived` handler, ~line 5171)

After updating `platform_auth_status`, compare old vs new auth states. For any platform that became newly authenticated, trigger `RefreshModelsForPlatform`. Add helper:
```rust
fn rebuild_visible_models(&mut self) {
    // For each platform: if installed+authed, populate config_models from cache/specs
    // If not available, remove from config_models so UI shows empty/disabled
}
```

---

## Phase 3: Auth-Gating Across All Views

### 3a. Update config view platform availability
**File**: `puppet-master-rs/src/views/config.rs`

Update `format_platform_option()` signature to accept `&HashMap<String, AuthStatus>`:
- Not installed → "Name (not installed)"
- Installed but not authenticated → "Name (not logged in)"
- Installed and authenticated → "Name ✓"

Update `is_platform_available()` to require both installed AND authenticated.

Update `tier_card()` to hide model/effort dropdowns when platform unavailable. Show "Select an available platform" placeholder instead.

### 3b. Pass auth_status to config view
**File**: `puppet-master-rs/src/app.rs` (~line 6058)

Add `&self.platform_auth_status` to the `views::config::view()` call. Update config view function signature to accept it.

### 3c. Update `setup_reports_platform_available()`
**File**: `puppet-master-rs/src/app.rs` (~line 6410)

Add auth check: return false if platform not authenticated.

### 3d. Update `unavailable_platform_reason()`
**File**: `puppet-master-rs/src/app.rs` (~line 6432)

Add case: if installed but not authenticated, return "Not authenticated. Go to Login to authenticate."

### 3e. Pass auth_status to wizard view
**File**: `puppet-master-rs/src/views/wizard.rs`

Same pattern as config: platform dropdowns should show availability based on install + auth. Model/effort pickers should only show for available platforms.

---

## Phase 4: Startup & Lifecycle

### 4a. Auto-run detection + auth on app startup
**File**: `puppet-master-rs/src/app.rs` (startup/loaded handler)

Add to startup task batch:
```rust
Task::batch(vec![
    Task::done(Message::SetupRunDetection),
    refresh_auth_status_task(),
])
```

This ensures both install status and auth status are populated before user visits any page.

### 4b. Chain auth refresh after detection completes
**File**: `puppet-master-rs/src/app.rs` (in `SetupDetectionComplete` handler, ~line 4355)

After setting `setup_platform_statuses`, also return `refresh_auth_status_task()` to ensure auth is checked for all detected platforms.

---

## Phase 5: Model Visibility Based on Availability

### 5a. Only populate config_models for available platforms
**File**: `puppet-master-rs/src/app.rs`

In `AuthStatusReceived` and `SetupDetectionComplete`, call `rebuild_visible_models()` which:
- For each platform that is installed + authenticated: insert cached/fallback models into `config_models`
- For unavailable platforms: remove from `config_models`

### 5b. Wizard models same treatment
**File**: `puppet-master-rs/src/app.rs` (in `WizardRefreshModels`)

Use same gating: only include models for available platforms in `wizard_models`.

---

## Files Modified (Summary)

| File | Changes |
|------|---------|
| `platform_detector.rs` | Add `validate_and_get_version()`, call in all 6 stages, remove old `get_version_for_path()` |
| `platform_specs.rs` | Codex `login_needs_terminal: true` |
| `auth_actions.rs` | Data-driven terminal spawn using `spec.auth.login_needs_terminal` |
| `cli_checks.rs` | Use `PlatformDetector` instead of manual detection |
| `app.rs` | Startup tasks, auth-gating helpers, model visibility rebuild, pass auth to views, Doctor browse handler |
| `views/config.rs` | Auth-aware `format_platform_option()`, hide model/effort for unavailable platforms |
| `views/wizard.rs` | Same auth-gating for wizard platform/model pickers |
| `views/doctor.rs` | "Browse" button next to failing CLI checks for manual path selection |

---

## Verification

### Automated
1. `cargo test --package puppet-master-rs` — all existing tests pass
2. Add unit tests for `validate_detected_binary()` with mock outputs
3. Add tests for `format_platform_option()` with auth/install combos
4. Add tests for `setup_reports_platform_available()` with auth data

### Manual (SSH to Mac)
```bash
sshpass -p '0303' ssh -o StrictHostKeyChecking=no jaredsmacbookair@192.168.50.115

# 1. Check what's actually installed
which claude codex gemini copilot agent cursor-agent gh
codex --version 2>&1; copilot --version 2>&1

# 2. Build and run
cd /path/to/puppet-master-rs && cargo build --release && cargo run --release

# 3. Test sequence:
# - Doctor: only truly installed platforms show green
# - Setup: consistent with Doctor
# - Login: Codex opens terminal, Gemini opens terminal with guidance, Copilot refreshes after login
# - Config: unavailable platforms show "(not installed)"/"(not logged in)", no model/effort dropdowns
# - After logging in: platform shows ✓, models appear, effort shows (where supported)
```

### Cross-Platform (SSH to Linux/Windows)
```bash
# Linux
sshpass -p 'Tigger12' ssh -o StrictHostKeyChecking=no sittingmongoose@192.168.50.72
# Windows (via expect)
# Verify same behavior on all three OS targets
```

---

## Progress Tracking

- [x] Phase 1a: Binary validation in platform_detector.rs
- [x] Phase 1b: Unify doctor checks with PlatformDetector + Browse button
- [x] Phase 2a: Codex login_needs_terminal fix
- [x] Phase 2b: Data-driven terminal spawn in auth_actions.rs
- [x] Phase 2c: Improved Gemini login toast
- [x] Phase 2d: Auto-refresh models after auth changes
- [x] Phase 3a: Auth-gating in config view
- [x] Phase 3b: Pass auth_status to config view
- [x] Phase 3c-d: Update availability helpers in app.rs
- [x] Phase 3e: Auth-gating in wizard view
- [x] Phase 4a: Startup detection + auth
- [x] Phase 4b: Chain auth refresh after detection
- [x] Phase 5a-b: Model visibility gating
- [x] Tests pass (cargo test — all pass, no warnings)
- [ ] Manual verification on Mac
- [ ] Manual verification on Linux
- [ ] Manual verification on Windows
