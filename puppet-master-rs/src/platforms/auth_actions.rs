//! Authentication actions: login and logout for platforms
//!
//! Spawns platform CLIs for interactive login/logout. Uses subscription auth
//! (CLI login, OAuth) rather than API keys.

use crate::platforms::path_utils;
use crate::platforms::platform_detector::PlatformDetector;
use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::{Result, anyhow};
use log::info;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

// DRY:FN:resolve_platform_program — Resolve platform CLI program path
// DRY REQUIREMENT: MUST use platform_specs — command_hint parameter is deprecated, use platform_specs instead
async fn resolve_platform_program(platform: Platform, _command_hint: &str) -> Result<PathBuf> {
    // DRY: Use platform_specs to get CLI binary names — DO NOT use command_hint parameter
    // Implementation note: command_hint is kept for backward compatibility but is ignored
    if let Some(detected) = PlatformDetector::detect_platform(platform).await {
        return Ok(detected.cli_path);
    }

    Err(anyhow!(
        "{} CLI not found. Install it from Setup/Doctor first.",
        platform_specs::get_spec(platform).display_name
    ))
}

fn shell_quote(arg: &str) -> String {
    if arg
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || "/._-".contains(c))
    {
        arg.to_string()
    } else {
        format!("'{}'", arg.replace('\'', "'\\''"))
    }
}

fn terminal_command(program: &Path, args: &[&str]) -> String {
    let mut parts = Vec::with_capacity(args.len() + 1);
    parts.push(shell_quote(&program.display().to_string()));
    parts.extend(args.iter().map(|arg| shell_quote(arg)));
    parts.join(" ")
}

// DRY:FN:spawn_terminal_with_raw_command — Spawn terminal with a pre-built shell command string
/// Spawns a new terminal that runs the given full shell command (e.g. `export PATH="..."; npx -y @github/copilot`).
/// Used for Copilot Launch so the agentic CLI is always invoked regardless of which `copilot` binary is resolved.
/// Uses enhanced PATH in the spawn environment; the command string can also embed PATH for the shell inside the terminal.
fn spawn_terminal_with_raw_command(full_shell_command: &str, cwd: Option<&Path>) -> Result<()> {
    let enhanced_path = path_utils::build_enhanced_path_for_subprocess();
    let spawn_cmd = |mut cmd: Command| -> Result<()> {
        cmd.env("PATH", &enhanced_path);
        if let Some(cwd) = cwd {
            cmd.current_dir(cwd);
        }
        cmd.spawn()
            .map_err(|e| anyhow!("Failed to open terminal: {}", e))?;
        Ok(())
    };

    if cfg!(target_os = "macos") {
        let script = format!(
            "tell app \"Terminal\" to do script \"{}\"",
            full_shell_command.replace('"', "\\\"")
        );
        let mut cmd = Command::new("osascript");
        cmd.args(["-e", &script]);
        spawn_cmd(cmd)?;
    } else if cfg!(target_os = "windows") {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", "start", "cmd", "/k", full_shell_command]);
        spawn_cmd(cmd)?;
    } else {
        // Linux: keep bash open after command exits
        let wrapped = format!("{}; exec bash", full_shell_command.replace('\'', "'\\''"));
        let terminal_cmd = format!(
            "x-terminal-emulator -e '{}' || xterm -e '{}' || gnome-terminal -- bash -c '{}' || true",
            wrapped,
            wrapped,
            wrapped.replace('\'', "'\"'\"'")
        );
        let mut cmd = Command::new("sh");
        cmd.args(["-c", &terminal_cmd]);
        spawn_cmd(cmd)?;
    }

    Ok(())
}

// DRY:FN:spawn_terminal_with_command — Cross-platform terminal spawn with enhanced PATH
/// Spawns a new terminal with the given program and args pre-invoked.
/// Uses enhanced PATH for node-based CLIs. On Linux, keeps shell open after CLI exits.
fn spawn_terminal_with_command(program: &Path, args: &[&str], cwd: Option<&Path>) -> Result<()> {
    let full_command = terminal_command(program, args);
    let cli_name = program
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("cli");
    let bin_dir = crate::install::app_paths::get_app_bin_dir();
    let enhanced_path = path_utils::build_enhanced_path_for_subprocess();

    let fallback_msg = format!(
        "Add {} to PATH and run '{}' manually.",
        bin_dir.display(),
        cli_name
    );

    let spawn_cmd = |mut cmd: Command| -> Result<()> {
        cmd.env("PATH", &enhanced_path);
        if let Some(cwd) = cwd {
            cmd.current_dir(cwd);
        }
        cmd.spawn()
            .map_err(|e| anyhow!("Failed to open terminal: {}. {}", e, fallback_msg))?;
        Ok(())
    };

    if cfg!(target_os = "macos") {
        let script = format!(
            "tell app \"Terminal\" to do script \"{}\"",
            full_command.replace('"', "\\\"")
        );
        let mut cmd = Command::new("osascript");
        cmd.args(["-e", &script]);
        spawn_cmd(cmd)?;
    } else if cfg!(target_os = "windows") {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", "start", "cmd", "/k"]);
        cmd.arg(program);
        cmd.args(args);
        spawn_cmd(cmd)?;
    } else {
        // Linux: shell persistence — keep bash open after CLI exits
        let wrapped = format!("{}; exec bash", full_command.replace('\'', "'\\''"));
        let terminal_cmd = format!(
            "x-terminal-emulator -e '{}' || xterm -e '{}' || gnome-terminal -- bash -c '{}' || true",
            wrapped,
            wrapped,
            wrapped.replace('\'', "'\"'\"'")
        );
        let mut cmd = Command::new("sh");
        cmd.args(["-c", &terminal_cmd]);
        spawn_cmd(cmd)?;
    }

    Ok(())
}

fn credentials_dir(folder: &str) -> Option<PathBuf> {
    let home = std::env::var("HOME")
        .ok()
        .or_else(|| std::env::var("USERPROFILE").ok())?;
    Some(PathBuf::from(home).join(folder))
}

// DRY:DATA:AuthTarget — Target for auth actions: a Platform or GitHub
/// Target for auth actions: a Platform or GitHub (gh CLI for general Git ops)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum AuthTarget {
    Platform(Platform),
    GitHub,
}

impl AuthTarget {
    // DRY:FN:display_name — Human-readable name for an auth target
    pub fn display_name(&self) -> &'static str {
        match self {
            AuthTarget::Platform(Platform::Cursor) => "Cursor",
            AuthTarget::Platform(Platform::Codex) => "Codex",
            AuthTarget::Platform(Platform::Claude) => "Claude",
            AuthTarget::Platform(Platform::Gemini) => "Gemini",
            AuthTarget::Platform(Platform::Copilot) => "Copilot",
            AuthTarget::GitHub => "GitHub",
        }
    }
}

// DRY:FN:spawn_login — Spawns interactive login for a platform
/// Spawns login for a platform. For interactive/device-flow logins (Claude, Copilot, Gemini),
/// the CLI is launched in a terminal so the user can see prompts and complete auth.
pub async fn spawn_login(target: AuthTarget) -> Result<()> {
    // Platforms with login_needs_terminal require a visible terminal for login UX
    // (Claude: browser-based login on interactive launch, no `auth login` subcommand)
    // (Codex: interactive `codex login` requires terminal)
    // (Gemini: interactive "Login with Google" on first run)
    // (Copilot: OAuth device flow prints a one-time code in terminal output)
    if let AuthTarget::Platform(platform) = target {
        let spec = platform_specs::get_spec(platform);
        if spec.auth.login_needs_terminal {
            let program_hint = spec
                .auth
                .login_command
                .or_else(|| spec.cli_binary_names.first().copied())
                .unwrap_or_default();
            let resolved_program = resolve_platform_program(platform, program_hint).await?;
            let base_args: Vec<&str> = spec.auth.login_args.iter().copied().collect();
            spawn_terminal_with_command(&resolved_program, &base_args, None)?;
            return Ok(());
        }
    }

    let (program, args) = match target {
        AuthTarget::Platform(platform) => {
            let spec = platform_specs::get_spec(platform);
            let command = spec
                .auth
                .login_command
                .or_else(|| spec.cli_binary_names.first().copied())
                .unwrap_or_default();
            (command, spec.auth.login_args.to_vec())
        }
        AuthTarget::GitHub => ("gh", vec!["auth", "login"]),
    };
    let resolved_program = match target {
        AuthTarget::Platform(platform) => resolve_platform_program(platform, program).await?,
        AuthTarget::GitHub => crate::platforms::path_utils::resolve_app_local_executable("gh")
            .unwrap_or_else(|| PathBuf::from("gh")),
    };

    info!(
        "Spawning login for {}: {} {:?}",
        target.display_name(),
        resolved_program.display(),
        args
    );

    let output = Command::new(&resolved_program)
        .args(&args)
        .stdin(Stdio::inherit())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| {
            anyhow!(
                "Failed to spawn {} {}: {}",
                resolved_program.display(),
                args.join(" "),
                e
            )
        })?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let details = if !stderr.is_empty() {
        stderr
    } else if !stdout.is_empty() {
        stdout
    } else {
        format!("exit code {:?}", output.status.code())
    };

    Err(anyhow!(
        "{} {} failed: {}",
        resolved_program.display(),
        args.join(" "),
        details
    ))
}

/// Builds the shell command string to launch the agentic Copilot CLI via npx.
/// Embeds enhanced PATH so the terminal finds node/npx. Path is escaped for use inside double quotes.
#[cfg(test)]
pub fn build_copilot_launch_command_for_tests(enhanced_path: &str) -> String {
    build_copilot_launch_command_impl(enhanced_path)
}

fn build_copilot_launch_command_impl(enhanced_path: &str) -> String {
    let escaped = enhanced_path.replace('"', "\\\"");
    let npm_cache = crate::install::app_paths::get_npm_cache_dir();
    let cache_str = npm_cache.to_string_lossy();
    if cfg!(target_os = "windows") {
        format!(
            "set \"PATH={}\" && set \"NPM_CONFIG_CACHE={}\" && npx -y @github/copilot",
            escaped, cache_str
        )
    } else {
        format!(
            "export PATH=\"{}\"; export NPM_CONFIG_CACHE=\"{}\"; npx -y @github/copilot",
            escaped, cache_str
        )
    }
}

// DRY:FN:spawn_launch_cli — Spawns platform CLI in a new terminal (interactive mode)
/// Launches the platform CLI interactively in a new terminal. Uses app-local or detected path.
/// When project_dir is Some, the terminal opens in that directory.
/// For Copilot we run `npx -y @github/copilot` with enhanced PATH so the agentic CLI starts regardless of which `copilot` binary is resolved elsewhere.
pub async fn spawn_launch_cli(platform: Platform, project_dir: Option<PathBuf>) -> Result<()> {
    if platform == Platform::Copilot {
        let enhanced_path = path_utils::build_enhanced_path_for_subprocess();
        let command = build_copilot_launch_command_impl(&enhanced_path);
        spawn_terminal_with_raw_command(&command, project_dir.as_deref())?;
        return Ok(());
    }

    let cli_names = platform_specs::cli_binary_names(platform);
    let hint = cli_names.first().copied().unwrap_or("cli");
    let resolved = resolve_platform_program(platform, hint).await?;
    spawn_terminal_with_command(&resolved, &[], project_dir.as_deref())?;
    Ok(())
}

// DRY:FN:spawn_logout — Spawns logout for a platform where supported
/// Spawns logout for a platform where supported.
pub async fn spawn_logout(target: AuthTarget) -> Result<()> {
    // Claude logout: use `claude auth logout` which correctly clears macOS Keychain entries.
    // Deleting ~/.claude/ was insufficient because Claude Code stores the OAuth token in Keychain.
    // DRY REQUIREMENT: MUST use platform_specs::cli_binary_names() — DO NOT hardcode "claude"
    if matches!(target, AuthTarget::Platform(Platform::Claude)) {
        // DRY: Use platform_specs to get CLI binary name — DO NOT hardcode "claude"
        let cli_name = platform_specs::cli_binary_names(Platform::Claude)
            .first()
            .copied()
            .unwrap_or("claude");
        let resolved_program = resolve_platform_program(Platform::Claude, cli_name).await?;
        let output = Command::new(&resolved_program)
            .args(["auth", "logout"])
            .env(
                "PATH",
                crate::platforms::path_utils::build_enhanced_path_for_subprocess(),
            )
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .map_err(|e| anyhow!("Failed to run claude auth logout: {}", e))?;
        return if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(anyhow!("claude auth logout failed: {}", stderr.trim()))
        };
    }

    // Gemini logout: clear only the OAuth credential files inside ~/.gemini/.
    // We do NOT delete the entire directory: the Gemini CLI recreates non-auth files
    // (projects.json, history/, tmp/, settings.json, …) on every invocation, so a
    // full deletion both breaks CLI usability after logout and fools our auth check
    // into thinking the user is still authenticated.
    // Strategy:
    //   • google_accounts.json — set active:null,old:[] (same pattern as Copilot)
    //   • oauth_creds.json    — remove entirely if present
    if matches!(target, AuthTarget::Platform(Platform::Gemini)) {
        let Some(dir) = credentials_dir(".gemini") else {
            return Err(anyhow!(
                "Could not resolve home directory for Gemini logout"
            ));
        };

        // Clear google_accounts.json
        let accounts_path = dir.join("google_accounts.json");
        if accounts_path.exists() {
            let cleared = serde_json::json!({"active": null, "old": []});
            let json_str = serde_json::to_string_pretty(&cleared)
                .map_err(|e| anyhow!("JSON error clearing Gemini accounts: {}", e))?;
            std::fs::write(&accounts_path, json_str)
                .map_err(|e| anyhow!("Failed to clear Gemini google_accounts.json: {}", e))?;
        }

        // Remove oauth_creds.json entirely if present
        let oauth_path = dir.join("oauth_creds.json");
        if oauth_path.exists() {
            std::fs::remove_file(&oauth_path)
                .map_err(|e| anyhow!("Failed to remove Gemini oauth_creds.json: {}", e))?;
        }

        return Ok(());
    }

    // Copilot logout: clear logged_in_users in ~/.copilot/config.json.
    // The old approach of opening an interactive terminal for /logout was unreliable.
    if matches!(target, AuthTarget::Platform(Platform::Copilot)) {
        let Some(dir) = credentials_dir(".copilot") else {
            return Err(anyhow!(
                "Could not resolve home directory for Copilot logout"
            ));
        };
        let config_path = dir.join("config.json");
        if config_path.exists() {
            if let Ok(contents) = std::fs::read_to_string(&config_path) {
                if let Ok(mut json) =
                    serde_json::from_str::<serde_json::Value>(&contents)
                {
                    json["logged_in_users"] = serde_json::json!([]);
                    // Remove rather than null: Copilot CLI's schema expects this field
                    // to be an object or absent. Writing null causes a schema validation
                    // error ("Expected object, received null") on next launch.
                    if let Some(obj) = json.as_object_mut() {
                        obj.remove("last_logged_in_user");
                    }
                    let updated = serde_json::to_string_pretty(&json)
                        .map_err(|e| anyhow!("JSON error: {}", e))?;
                    std::fs::write(&config_path, updated)
                        .map_err(|e| anyhow!("Failed to write Copilot config: {}", e))?;
                }
            }
        }
        return Ok(());
    }

    let (program, args) = match target {
        AuthTarget::Platform(platform) => {
            let spec = platform_specs::get_spec(platform);
            let command = spec
                .auth
                .logout_command
                .or_else(|| spec.cli_binary_names.first().copied())
                .unwrap_or_default();
            (command, spec.auth.logout_args.to_vec())
        }
        AuthTarget::GitHub => ("gh", vec!["auth", "logout"]),
    };
    let resolved_program = match target {
        AuthTarget::Platform(platform) => resolve_platform_program(platform, program).await?,
        AuthTarget::GitHub => crate::platforms::path_utils::resolve_app_local_executable("gh")
            .unwrap_or_else(|| PathBuf::from("gh")),
    };

    info!(
        "Spawning logout for {}: {} {:?}",
        target.display_name(),
        resolved_program.display(),
        args
    );

    // GitHub logout: pre-check auth status first.
    // `gh auth logout` exits 1 with "not logged in" when gh is not authenticated.
    // Treat "already not logged in" as success to avoid spurious error messages.
    if matches!(target, AuthTarget::GitHub) {
        let auth_check = Command::new(&resolved_program)
            .args(["auth", "status"])
            .env(
                "PATH",
                crate::platforms::path_utils::build_enhanced_path_for_subprocess(),
            )
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await;

        let already_logged_out = match &auth_check {
            Ok(out) => {
                let combined = format!(
                    "{}{}",
                    String::from_utf8_lossy(&out.stdout),
                    String::from_utf8_lossy(&out.stderr)
                )
                .to_lowercase();
                combined.contains("not logged in") || !out.status.success()
            }
            Err(_) => false,
        };

        if already_logged_out {
            return Ok(());
        }

        let status = Command::new(&resolved_program)
            .args(["auth", "logout", "--hostname", "github.com"])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .await
            .map_err(|e| anyhow!("Failed to run gh logout: {}", e))?;

        return if status.success() {
            Ok(())
        } else {
            Err(anyhow!(
                "{} logout failed with exit code {:?}",
                resolved_program.display(),
                status.code()
            ))
        };
    }

    let output = Command::new(&resolved_program)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| anyhow!("Failed to run {} logout: {}", resolved_program.display(), e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(anyhow!(
            "{} logout failed: {}",
            resolved_program.display(),
            stderr.trim()
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_copilot_launch_command_contains_export_path_npx_copilot() {
        let path = "/usr/bin:/opt/homebrew/bin";
        let cmd = build_copilot_launch_command_for_tests(path);
        assert!(cmd.contains("npx"), "command should contain npx");
        assert!(cmd.contains("@github/copilot"), "command should contain @github/copilot");
        assert!(
            cmd.contains("NPM_CONFIG_CACHE"),
            "command should set NPM_CONFIG_CACHE to avoid root-owned cache EACCES"
        );
        if cfg!(target_os = "windows") {
            assert!(cmd.contains("set "), "Windows command should set PATH");
        } else {
            assert!(cmd.contains("export PATH="), "Unix command should export PATH");
            assert!(
                cmd.contains("export NPM_CONFIG_CACHE="),
                "Unix command should export NPM_CONFIG_CACHE"
            );
        }
        assert!(cmd.contains(path), "command should contain the path");
    }

    #[test]
    fn test_build_copilot_launch_command_escapes_double_quotes_in_path() {
        let path = r#"C:\Program "Files"\node"#;
        let cmd = build_copilot_launch_command_for_tests(path);
        assert!(!cmd.contains(r#""Files""#), "double quotes in path should be escaped");
        assert!(cmd.contains("\\\""), "path should contain escaped double quote");
    }
}
