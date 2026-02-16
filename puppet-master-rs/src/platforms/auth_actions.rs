//! Authentication actions: login and logout for platforms
//!
//! Spawns platform CLIs for interactive login/logout. Uses subscription auth
//! (CLI login, OAuth) rather than API keys.

use crate::platforms::platform_specs;
use crate::platforms::platform_detector::PlatformDetector;
use crate::types::Platform;
use anyhow::{Result, anyhow};
use log::info;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

fn resolve_program(program: &str) -> PathBuf {
    crate::platforms::path_utils::resolve_executable(program)
        .unwrap_or_else(|| PathBuf::from(program))
}

async fn resolve_platform_program(platform: Platform, command_hint: &str) -> Result<PathBuf> {
    if let Some(detected) = PlatformDetector::detect_platform(platform).await {
        return Ok(detected.cli_path);
    }

    if let Some(resolved) = crate::platforms::path_utils::resolve_executable(command_hint) {
        return Ok(resolved);
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
            let base_args = spec.auth.login_args.to_vec();
            let full_command = terminal_command(&resolved_program, &base_args);

            // Try to open in a terminal emulator so user can interact.
            // Do not wait — terminal runs independently.
            if cfg!(target_os = "macos") {
                let script = format!(
                    "tell app \"Terminal\" to do script \"{}\"",
                    full_command.replace('"', "\\\"")
                );
                Command::new("osascript")
                    .args(["-e", &script])
                    .spawn()
                    .map_err(|e| {
                        anyhow!(
                            "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                            program_hint,
                            e,
                            full_command
                        )
                    })?;
            } else if cfg!(target_os = "windows") {
                Command::new("cmd")
                    .args(["/C", "start", "cmd", "/k"])
                    .arg(&resolved_program)
                    .args(&base_args)
                    .spawn()
                    .map_err(|e| {
                        anyhow!(
                            "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                            program_hint,
                            e,
                            full_command
                        )
                    })?;
            } else {
                // Linux: try common terminal emulators. x-terminal-emulator is the Debian/Ubuntu default.
                let terminal_cmd = format!(
                    "x-terminal-emulator -e {0} || xterm -e {0} || gnome-terminal -- {0}",
                    full_command
                );
                Command::new("sh")
                    .args(["-c", &terminal_cmd])
                    .spawn()
                    .map_err(|e| {
                        anyhow!(
                            "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                            program_hint,
                            e,
                            full_command
                        )
                    })?;
            }

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
        AuthTarget::GitHub => resolve_program(program),
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
        if cfg!(target_os = "macos") {
            let script = format!(
                "tell app \"Terminal\" to do script \"{}\"",
                terminal_command(&resolved_program, &[]).replace('"', "\\\"")
            );
            Command::new("osascript")
                .args(["-e", &script])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program_hint,
                        e,
                    )
                })?;
        } else if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "start", "cmd", "/k"])
                .arg(&resolved_program)
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program_hint,
                        e,
                    )
                })?;
        } else {
            let terminal_cmd = format!(
                "x-terminal-emulator -e {0} || xterm -e {0} || gnome-terminal -- {0}",
                terminal_command(&resolved_program, &[])
            );
            Command::new("sh")
                .args(["-c", &terminal_cmd])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program_hint,
                        e,
                    )
                })?;
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
        AuthTarget::GitHub => resolve_program(program),
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
