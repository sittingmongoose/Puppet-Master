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

async fn resolve_platform_program(platform: Platform, command_hint: &str) -> Result<PathBuf> {
    let _ = command_hint;
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
    if cfg!(target_os = "windows") {
        format!("set \"PATH={}\" && npx -y @github/copilot", escaped)
    } else {
        format!("export PATH=\"{}\"; npx -y @github/copilot", escaped)
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
    // Claude logout: remove local credential cache.
    if matches!(target, AuthTarget::Platform(Platform::Claude)) {
        let Some(path) = credentials_dir(".claude") else {
            return Err(anyhow!(
                "Could not resolve home directory for Claude logout"
            ));
        };
        if !path.exists() {
            return Ok(());
        }
        tokio::fs::remove_dir_all(&path).await.map_err(|e| {
            anyhow!(
                "Failed to remove Claude credentials at {}: {}",
                path.display(),
                e
            )
        })?;
        return Ok(());
    }

    // Gemini has no logout subcommand — inform user to delete ~/.gemini/ credentials
    if matches!(target, AuthTarget::Platform(Platform::Gemini)) {
        return Err(anyhow!(
            "Gemini CLI does not support programmatic logout. To change accounts, run 'gemini' interactively or delete ~/.gemini/ credentials."
        ));
    }

    // Copilot logout requires interactive terminal (/logout slash command)
    if matches!(target, AuthTarget::Platform(Platform::Copilot)) {
        let program_hint = platform_specs::cli_binary_names(Platform::Copilot)
            .first()
            .copied()
            .unwrap_or("copilot");
        let resolved_program = resolve_platform_program(Platform::Copilot, program_hint).await?;
        spawn_terminal_with_command(&resolved_program, &[], None)?;
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

    // gh logout can require interactive confirmation.
    if matches!(target, AuthTarget::GitHub) {
        let status = Command::new(&resolved_program)
            .args(&args)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .await
            .map_err(|e| anyhow!("Failed to run {} logout: {}", resolved_program.display(), e))?;

        if status.success() {
            return Ok(());
        }

        return Err(anyhow!(
            "{} logout failed with exit code {:?}",
            resolved_program.display(),
            status.code()
        ));
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
        if cfg!(target_os = "windows") {
            assert!(cmd.contains("set "), "Windows command should set PATH");
        } else {
            assert!(cmd.contains("export PATH="), "Unix command should export PATH");
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
