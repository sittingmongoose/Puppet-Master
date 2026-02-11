//! Authentication actions: login and logout for platforms
//!
//! Spawns platform CLIs for interactive login/logout. Uses subscription auth
//! (CLI login, OAuth) rather than API keys.

use crate::types::Platform;
use anyhow::{anyhow, Result};
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
    if matches!(
        target,
        AuthTarget::Platform(Platform::Gemini) | AuthTarget::Platform(Platform::Copilot)
    ) {
        let (program, base_args) = match target {
            AuthTarget::Platform(Platform::Gemini) => ("gemini", Vec::<&str>::new()),
            AuthTarget::Platform(Platform::Copilot) => ("copilot", Vec::<&str>::new()),
            _ => unreachable!(),
        };

        // Try to open in a terminal emulator so user can interact.
        // Do not wait — terminal runs independently.
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
                        "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                        program,
                        e,
                        program
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
                        program
                    )
                })?;
        } else {
            // Linux: try common terminal emulators. x-terminal-emulator is the Debian/Ubuntu default.
            let terminal_cmd = format!(
                "x-terminal-emulator -e {0} || xterm -e {0} || gnome-terminal -- {0}",
                program
            );
            Command::new("sh")
                .args(["-c", &terminal_cmd])
                .spawn()
                .map_err(|e| {
                    anyhow!(
                        "Failed to open terminal for {}: {}. Run '{}' manually in your terminal.",
                        program,
                        e,
                        program
                    )
                })?;
        }

        return Ok(());
    }

    let (program, args) = match target {
        AuthTarget::Platform(Platform::Cursor) => ("agent", vec!["login"]),
        AuthTarget::Platform(Platform::Codex) => ("codex", vec!["login"]),
        AuthTarget::Platform(Platform::Claude) => ("claude", vec!["auth", "login"]),
        AuthTarget::Platform(Platform::Gemini) => ("gemini", vec![]), // handled above
        AuthTarget::Platform(Platform::Copilot) => ("copilot", vec![]), // handled above
        AuthTarget::GitHub => ("gh", vec!["auth", "login"]),
    };

    info!("Spawning login for {}: {} {:?}", target.display_name(), program, args);

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
            Err(anyhow!("{} {} exited with code {:?}", program, args.join(" "), status.code()))
        }
    }
}

/// Spawns logout for a platform where supported.
pub async fn spawn_logout(target: AuthTarget) -> Result<()> {
    let (program, args) = match target {
        AuthTarget::Platform(Platform::Cursor) => ("agent", vec!["logout"]),
        AuthTarget::Platform(Platform::Codex) => ("codex", vec!["logout"]),
        AuthTarget::Platform(Platform::Claude) => ("claude", vec!["auth", "logout"]),
        AuthTarget::Platform(Platform::Gemini) => {
            return Err(anyhow!(
                "Gemini CLI does not support programmatic logout. To change accounts, run 'gemini' and use /auth, or delete ~/.gemini/ credentials."
            ));
        }
        AuthTarget::Platform(Platform::Copilot) => {
            return Err(anyhow!(
                "Copilot CLI does not support programmatic logout. Run 'copilot' and type /logout in the interactive session."
            ));
        }
        AuthTarget::GitHub => ("gh", vec!["auth", "logout"]),
    };

    info!("Spawning logout for {}: {} {:?}", target.display_name(), program, args);

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
