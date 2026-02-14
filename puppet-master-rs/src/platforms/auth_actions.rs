//! Authentication actions: login and logout for platforms
//!
//! Spawns platform CLIs for interactive login/logout. Uses subscription auth
//! (CLI login, OAuth) rather than API keys.

use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::{Result, anyhow};
use log::info;
use std::process::Stdio;
use tokio::process::Command;

/// Target for auth actions: a Platform or GitHub (gh CLI for general Git ops)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum AuthTarget {
    Platform(Platform),
    GitHub,
}

impl AuthTarget {
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

/// Spawns login for a platform. For interactive logins (Claude, Copilot, Gemini),
/// the CLI is launched and the user completes login in browser or terminal.
pub async fn spawn_login(target: AuthTarget) -> Result<()> {
    // Claude, Gemini, and Copilot require interactive terminal for login
    // (Claude has no `auth login` subcommand — browser-based login on interactive launch)
    if matches!(
        target,
        AuthTarget::Platform(Platform::Claude)
            | AuthTarget::Platform(Platform::Gemini)
            | AuthTarget::Platform(Platform::Copilot)
    ) {
        let platform = match target {
            AuthTarget::Platform(platform) => platform,
            _ => unreachable!(),
        };
        let spec = platform_specs::get_spec(platform);
        let program = spec
            .auth
            .login_command
            .or_else(|| spec.cli_binary_names.first().copied())
            .unwrap_or_default();
        let base_args = spec.auth.login_args.to_vec();
        let full_command = if base_args.is_empty() {
            program.to_string()
        } else {
            format!("{} {}", program, base_args.join(" "))
        };

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
                        program,
                        e,
                        full_command
                    )
                })?;
        } else if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "start", "cmd", "/k", program])
                .args(&base_args)
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                        program,
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
                        program,
                        e,
                        full_command
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
                .login_command
                .or_else(|| spec.cli_binary_names.first().copied())
                .unwrap_or_default();
            (command, spec.auth.login_args.to_vec())
        }
        AuthTarget::GitHub => ("gh", vec!["auth", "login"]),
    };

    info!(
        "Spawning login for {}: {} {:?}",
        target.display_name(),
        program,
        args
    );

    if args.is_empty() {
        let mut child = Command::new(program)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| anyhow!("Failed to spawn {}: {}", program, e))?;
        let status = child.wait().await?;
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("{} exited with code {:?}", program, status.code()))
        }
    } else {
        let mut child = Command::new(program)
            .args(&args)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| anyhow!("Failed to spawn {} {}: {}", program, args.join(" "), e))?;
        let status = child.wait().await?;
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!(
                "{} {} exited with code {:?}",
                program,
                args.join(" "),
                status.code()
            ))
        }
    }
}

/// Spawns logout for a platform where supported.
pub async fn spawn_logout(target: AuthTarget) -> Result<()> {
    // Claude has no logout subcommand — inform user to delete ~/.claude/ credentials
    if matches!(target, AuthTarget::Platform(Platform::Claude)) {
        return Err(anyhow!(
            "Claude Code does not have a logout command. To log out, delete your ~/.claude/ credentials directory."
        ));
    }

    // Gemini has no logout subcommand — inform user to delete ~/.gemini/ credentials
    if matches!(target, AuthTarget::Platform(Platform::Gemini)) {
        return Err(anyhow!(
            "Gemini CLI does not support programmatic logout. To change accounts, run 'gemini' interactively or delete ~/.gemini/ credentials."
        ));
    }

    // Copilot logout requires interactive terminal (/logout slash command)
    if matches!(target, AuthTarget::Platform(Platform::Copilot)) {
        let program = platform_specs::cli_binary_names(Platform::Copilot)
            .first()
            .copied()
            .unwrap_or("copilot");
        if cfg!(target_os = "macos") {
            let script = format!(
                "tell app \"Terminal\" to do script \"{}\"",
                program.replace('"', "\\\"")
            );
            Command::new("osascript")
                .args(["-e", &script])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program,
                        e,
                    )
                })?;
        } else if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "start", "cmd", "/k", program])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program,
                        e,
                    )
                })?;
        } else {
            let terminal_cmd = format!(
                "x-terminal-emulator -e {0} || xterm -e {0} || gnome-terminal -- {0}",
                program
            );
            Command::new("sh")
                .args(["-c", &terminal_cmd])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run 'copilot' and type /logout manually.",
                        program,
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

    info!(
        "Spawning logout for {}: {} {:?}",
        target.display_name(),
        program,
        args
    );

    // gh logout can require interactive confirmation.
    if matches!(target, AuthTarget::GitHub) {
        let status = Command::new(program)
            .args(&args)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .await
            .map_err(|e| anyhow!("Failed to run {} logout: {}", program, e))?;

        if status.success() {
            return Ok(());
        }

        return Err(anyhow!(
            "{} logout failed with exit code {:?}",
            program,
            status.code()
        ));
    }

    let output = Command::new(program)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| anyhow!("Failed to run {} logout: {}", program, e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(anyhow!("{} logout failed: {}", program, stderr.trim()))
    }
}
