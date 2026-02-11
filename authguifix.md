# authguifix — Fix Auth, GUI State, and Install Text

## Context

This plan fixes issues found in the Rust/Iced rewrite (`puppet-master-rs/`). The project compiles (`cargo check` passes). The problems are:
- Auth status checks use API keys instead of subscription CLI auth
- Doctor view missing loading states
- Login/logout button text doesn't distinguish operations
- Installation instruction text has wrong package names
- Interactive CLI logins need terminal handling
- Minor type/metadata bugs

**Build command**: `cd puppet-master-rs && TMPDIR=/tmp CARGO_TARGET_DIR=/home/$USER/.cargo-target cargo check`

Run cargo check after each file group to catch regressions.

---

## Phase 1: Fix auth_status.rs — Subscription Auth, Not API Keys

**File**: `puppet-master-rs/src/platforms/auth_status.rs`

### 1a. Codex: Replace API key check with `codex login status`

Remove the `CODEX_API_KEY` env var check (around lines 103-109). Replace the `codex --version` fallback (around lines 112-116) with:

```rust
// Try codex login status (exits 0 when logged in)
for cmd in &["codex"] {
    if let Ok(output) = self.run_command(cmd, &["login", "status"]).await {
        if output.status.success() {
            return AuthCheckResult::authenticated("Codex CLI is authenticated via subscription");
        }
    }
}
```

Update the error message (around line 118-120) to say: `"Not authenticated. Run 'codex login' to authenticate."` — do NOT mention API keys.

### 1b. Claude: Replace API key check with `claude auth status`

Remove the `ANTHROPIC_API_KEY` env var check (around lines 125-131). The existing `claude auth status` check at ~line 134 is correct — just make sure it's the first thing that runs, not behind an API key gate. Keep the "logged in" / "authenticated" string matching.

Update the error message to say: `"Not authenticated. Run 'claude auth login' to authenticate."`

### 1c. Gemini: Replace API key checks with credential file check

Remove both `GOOGLE_API_KEY` and `GEMINI_API_KEY` env var checks (around lines 150-165). Replace the `gemini --version` fallback (around lines 168-174) with:

```rust
// Gemini CLI caches OAuth credentials after "Login with Google"
// Check if credentials exist at ~/.gemini/
let home = std::env::var("HOME").unwrap_or_default();
let cred_path = std::path::Path::new(&home).join(".gemini");
if cred_path.exists() {
    // Also verify CLI is available
    for cmd in &["gemini", "gemini-cli"] {
        if let Ok(output) = self.run_command(cmd, &["--version"]).await {
            if output.status.success() {
                return AuthCheckResult::authenticated(
                    "Gemini CLI installed and credentials cached"
                );
            }
        }
    }
}
// CLI exists but no cached creds
for cmd in &["gemini", "gemini-cli"] {
    if let Ok(output) = self.run_command(cmd, &["--version"]).await {
        if output.status.success() {
            return AuthCheckResult::not_authenticated(
                "Gemini CLI installed but not authenticated. Run 'gemini' and select 'Login with Google'."
            );
        }
    }
}
```

Update error message: `"Not authenticated. Run 'gemini' and select 'Login with Google'."`

### 1d. Cursor: Remove --version "authenticated" fallback

Around lines 87-94, the `--version` fallback returns `authenticated: true`. Change it to return `not_authenticated` with message: `"Cursor CLI found but auth status unknown. Run 'agent login'."` Only `agent status` with "logged in" string match should return authenticated.

### 1e. Copilot: Remove --version "authenticated" fallback

Around lines 183-187, the `copilot --version` check returns `authenticated: true`. Remove this block or change it to fall through to the `gh auth status` check at line 190. Only `gh auth status` success should return authenticated.

### 1f. Clean up env_helpers

Remove or deprecate the `get_set_api_keys` function (around lines 304-311) since we no longer use API key env vars for auth checking.

---

## Phase 2: Fix Doctor Loading States in app.rs

**File**: `puppet-master-rs/src/app.rs`

### 2a. Add missing state fields to App struct

Find the App struct fields (around line 195-196 area where `login_in_progress` and `setup_installing` are). Add:

```rust
/// Whether doctor checks are currently running
pub doctor_running: bool,
/// Set of check names currently being fixed
pub doctor_fixing: HashSet<String>,
```

Initialize both in `App::new()` / default:
```rust
doctor_running: false,
doctor_fixing: HashSet::new(),
```

### 2b. Wire `doctor_running` in RunAllChecks handler

In the `Message::RunAllChecks` handler (around line 829), add at the top:
```rust
self.doctor_running = true;
```

In the `Message::DoctorResultsReceived` handler (around line 958), add:
```rust
self.doctor_running = false;
```

### 2c. Wire `doctor_fixing` in FixCheck handler

In the `Message::FixCheck` handler (around line 901), add at the top:
```rust
self.doctor_fixing.insert(name.clone());
```

In the `Message::FixCheckComplete` handler (around line 918), add at the top:
```rust
self.doctor_fixing.remove(&name);
```

### 2d. Pass state to doctor view

Find the view call (around line 1488):
```rust
Page::Doctor => views::doctor::view(&self.doctor_results, false, &self.theme),
```
Change to:
```rust
Page::Doctor => views::doctor::view(&self.doctor_results, self.doctor_running, &self.doctor_fixing, &self.theme),
```

---

## Phase 3: Update Doctor View to Use Fixing State

**File**: `puppet-master-rs/src/views/doctor.rs`

### 3a. Update view function signature

Change the function signature to accept the fixing set:
```rust
pub fn view<'a>(
    doctor_results: &[DoctorCheckResult],
    running: bool,
    fixing: &HashSet<String>,
    theme: &AppTheme,
) -> Element<'a, Message> {
```

Add `use std::collections::HashSet;` to imports.

### 3b. Update Fix button to show "Fixing..." when in progress

In the fix button area (around lines 159-164), change to:
```rust
if fixing.contains(&check.name) {
    button(text("Fixing...").size(12))
    // no .on_press() — disabled
} else if !check.passed && check.fix_available {
    button(text("Fix").size(12))
        .on_press(Message::FixCheck(check.name.clone(), false))
} else {
    iced::widget::Space::new(0, 0).into()
}
```

### 3c. Disable Refresh button during running

Around line 73, add the same `running` guard:
```rust
let refresh_btn = if running {
    button(text("Refreshing...").size(14))
} else {
    button(text("Refresh").size(14))
        .on_press(Message::RefreshDoctor)
};
```

---

## Phase 4: Fix Login/Logout Button Text

### 4a. Change state type in app.rs

**File**: `puppet-master-rs/src/app.rs`

Change the field:
```rust
// OLD:
pub login_in_progress: HashSet<AuthTarget>,

// NEW:
pub login_in_progress: HashMap<AuthTarget, AuthActionKind>,
```

Add a simple enum (at top of app.rs or in types):
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthActionKind {
    Login,
    Logout,
}
```

Update `PlatformLogin` handler (around line 1275):
```rust
self.login_in_progress.insert(target, AuthActionKind::Login);
```

Update `PlatformLogout` handler (around line 1324):
```rust
self.login_in_progress.insert(target, AuthActionKind::Logout);
```

Update both completion handlers to use `.remove(&target)` (should work the same since HashMap has remove by key).

### 4b. Update login.rs view

**File**: `puppet-master-rs/src/views/login.rs`

Change the parameter type from `HashSet<AuthTarget>` to `HashMap<AuthTarget, AuthActionKind>`.

Update the button logic (around lines 106-114):
```rust
let login_logout_btn = if let Some(action) = login_in_progress.get(&auth_target) {
    let label = match action {
        AuthActionKind::Login => "Logging in...",
        AuthActionKind::Logout => "Logging out...",
    };
    button(text(label).size(14))
    // no .on_press() — disabled
} else if status.authenticated {
    button(text("Logout").size(14))
        .on_press(Message::PlatformLogout(auth_target))
} else {
    button(text("Login").size(14))
        .on_press(Message::PlatformLogin(auth_target))
};
```

### 4c. Update setup.rs view

**File**: `puppet-master-rs/src/views/setup.rs`

Same change as login.rs. Update the parameter type and button logic. Also keep the Logout button visible (but disabled) during auth operations instead of hiding it:

```rust
// Always show logout button when installed, just disable during auth
if is_installed {
    if auth_in_progress {
        platform_row = platform_row.push(
            button(text("Logout").size(12))
            // no .on_press() — disabled during operation
        );
    } else {
        platform_row = platform_row.push(
            button(text("Logout").size(12))
                .on_press(Message::PlatformLogout(auth_target)),
        );
    }
}
```

---

## Phase 5: Fix Installation Instruction Text

**File**: `puppet-master-rs/src/doctor/installation_manager.rs`

### 5a. Fix Codex instructions (around lines 244-281)

- Change `"@anthropic/codex-cli"` to `"@openai/codex"`
- Change `"Codex CLI (Anthropic)"` to `"Codex CLI (OpenAI)"`
- Remove lines about `ANTHROPIC_API_KEY` / `export ANTHROPIC_API_KEY=...`
- Replace with: `"Authenticate: codex login"`

### 5b. Fix Claude instructions (around lines 283-298)

Replace the whole block. It currently says "Download from claude.ai/download" (Desktop app). Change to:

```
macOS/Linux:
  curl -fsSL https://claude.ai/install.sh | bash

Windows PowerShell:
  irm https://claude.ai/install.ps1 | iex

Authenticate:
  claude auth login
```

### 5c. Fix Gemini instructions (around lines 301-335)

- Change `"pip install google-generativeai"` to `"npm install -g @google/gemini-cli"`
- Remove `"curl -sS https://dl.google.com/gemini/install.sh | sh"` (not in official docs)
- Remove lines about `GOOGLE_API_KEY`
- Replace with: `"Authenticate: run 'gemini' and select 'Login with Google'"`

### 5d. Fix Cursor instructions (around lines 189-242)

- Change `"cursor.sh"` references to `"cursor.com"`
- Change the Linux install to: `"curl -fsSL https://cursor.com/install | bash"`
- This matches the official docs

---

## Phase 6: Fix Interactive Login Handling for GUI

**File**: `puppet-master-rs/src/platforms/auth_actions.rs`

### 6a. Gemini and Copilot login: spawn in terminal emulator

For Gemini (line 39) and Copilot (line 40), instead of bare `Stdio::inherit()`, detect available terminal and spawn inside it:

```rust
AuthTarget::Platform(Platform::Gemini) | AuthTarget::Platform(Platform::Copilot) => {
    let (program, base_args) = match target {
        AuthTarget::Platform(Platform::Gemini) => ("gemini", vec![]),
        AuthTarget::Platform(Platform::Copilot) => ("copilot", vec![]),
        _ => unreachable!(),
    };

    // Try to open in a terminal emulator so user can interact
    let terminal_cmd = if cfg!(target_os = "macos") {
        // macOS: use osascript to open Terminal.app
        format!("osascript -e 'tell app \"Terminal\" to do script \"{}\"'", program)
    } else if cfg!(target_os = "windows") {
        format!("start cmd /k {}", program)
    } else {
        // Linux: try common terminal emulators
        // x-terminal-emulator is the Debian/Ubuntu default
        format!("x-terminal-emulator -e {} || xterm -e {} || gnome-terminal -- {}", program, program, program)
    };

    let mut child = Command::new("sh")
        .args(["-c", &terminal_cmd])
        .spawn()
        .map_err(|e| anyhow!("Failed to open terminal for {}: {}. Run '{}' manually in your terminal.", program, e, program))?;

    // Don't wait — terminal runs independently
    // Return success immediately; user completes login in the terminal
    return Ok(());
}
```

### 6b. Fix logout to use inherit stdio for gh

For the logout function (around lines 91-96), change `gh auth logout` to use `Stdio::inherit()` instead of `Stdio::piped()`:

```rust
// For commands that need interactive confirmation
let needs_interactive = matches!(target, AuthTarget::GitHub);

let output_or_status = if needs_interactive {
    let status = Command::new(program)
        .args(&args)
        .stdin(Stdio::inherit())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .await
        .map_err(|e| anyhow!("Failed to run {} logout: {}", program, e))?;
    if status.success() { return Ok(()); }
    else { return Err(anyhow!("{} logout failed with exit code {:?}", program, status.code())); }
} else {
    // Existing piped approach for non-interactive logouts
    // ... keep existing code
};
```

### 6c. Fix Gemini/Copilot logout error messages

Change Gemini logout (line 84) to:
```rust
AuthTarget::Platform(Platform::Gemini) => {
    return Err(anyhow!("Gemini CLI does not support programmatic logout. To change accounts, run 'gemini' and use /auth, or delete ~/.gemini/ credentials."));
}
```

Change Copilot logout (line 85) to:
```rust
AuthTarget::Platform(Platform::Copilot) => {
    return Err(anyhow!("Copilot CLI does not support programmatic logout. Run 'copilot' and type /logout in the interactive session."));
}
```

---

## Phase 7: Fix Minor Type/Metadata Bugs

### 7a. Fix Codex doc comment

**File**: `puppet-master-rs/src/types/platform.rs`, line 14

Change:
```rust
/// Anthropic Claude via Codex CLI
Codex,
```
To:
```rust
/// OpenAI Codex CLI
Codex,
```

### 7b. Fix `supports_plan_mode()`

**File**: `puppet-master-rs/src/types/platform.rs`, around line 48

Change to include all platforms that support plan mode:
```rust
pub fn supports_plan_mode(&self) -> bool {
    matches!(self, Platform::Cursor | Platform::Codex | Platform::Claude | Platform::Gemini | Platform::Copilot)
}
```

Claude uses `--permission-mode plan`, Gemini uses `--approval-mode plan`, Copilot uses `/plan`.

### 7c. Fix `supports_reasoning_effort()`

Same file, around line 53. Add Codex (supports `--reasoning-effort` for o3/o3-mini):
```rust
pub fn supports_reasoning_effort(&self) -> bool {
    matches!(self, Platform::Claude | Platform::Gemini | Platform::Codex)
}
```

### 7d. Fix PlatformConfig executable name

Same file, around line 217. Change:
```rust
Platform::Cursor => "cursor-agent".to_string(),
```
To:
```rust
Platform::Cursor => "agent".to_string(),
```

This matches `default_cli_name()` and the `CursorRunner`.

---

## Phase 8: Verify

After all changes:

1. `cd puppet-master-rs && TMPDIR=/tmp CARGO_TARGET_DIR=/home/$USER/.cargo-target cargo check` — must pass with 0 errors
2. Verify each view file compiles (the signature changes in doctor.rs, login.rs, setup.rs must match their call sites in app.rs)
3. Grep for any remaining `ANTHROPIC_API_KEY`, `CODEX_API_KEY`, `GOOGLE_API_KEY`, `GEMINI_API_KEY` references in auth_status.rs — should be zero
4. Grep for `"@anthropic/codex-cli"` in installation_manager.rs — should be zero
5. Grep for `"cursor.sh"` — should be zero
6. Grep for `"pip install google-generativeai"` — should be zero

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `platforms/auth_status.rs` | Remove API key checks, use CLI subscription auth |
| `platforms/auth_actions.rs` | Terminal emulator for interactive logins, fix logout stdio |
| `app.rs` | Add `doctor_running`, `doctor_fixing`, change `login_in_progress` to HashMap |
| `views/doctor.rs` | Accept fixing set, show "Fixing...", disable buttons during run |
| `views/login.rs` | Use HashMap, show "Logging in/out..." correctly |
| `views/setup.rs` | Same as login.rs, keep Logout visible when disabled |
| `doctor/installation_manager.rs` | Fix instruction text for Codex/Claude/Gemini/Cursor |
| `types/platform.rs` | Fix doc comment, plan_mode, reasoning_effort, executable name |
