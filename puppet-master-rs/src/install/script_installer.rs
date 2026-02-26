//! Script-based CLI installers (Claude Code and Cursor).
//!
//! Both CLIs publish official install scripts.  This module:
//! 1. Runs the script via `curl | bash` (or PowerShell equivalent).
//! 2. Uses `PlatformDetector` to find where the script placed the binary.
//! 3. Copies the binary to `{APP_DATA_DIR}/bin/{name}` and sets the executable bit.

use crate::install::app_paths::ensure_app_bin_dir;
use crate::install::install_coordinator::InstallOutcome;
use crate::types::Platform;
use log::info;
use std::path::PathBuf;
use std::process::Stdio;

// DRY:FN:write_cursor_agent_shim — Write a platform shim for the Cursor agent that delegates to the real bundle
/// Create a shim script that finds and delegates to the real Cursor agent binary.
///
/// The Cursor installer places the real binary in a versioned directory:
/// - Unix: `~/.local/share/cursor-agent/versions/<ver>/cursor-agent`
/// - Windows: `%LOCALAPPDATA%\cursor-agent\versions\<ver>\cursor-agent.cmd`
///
/// This shim always finds the latest version and delegates to it.
async fn write_cursor_agent_shim(app_bin_dir: &std::path::Path) -> Result<PathBuf, String> {
    #[cfg(target_os = "windows")]
    {
        let shim_path = app_bin_dir.join("agent.cmd");
        let content = r#"@echo off
REM Auto-generated shim for Cursor agent — do not edit
REM Finds the latest installed cursor-agent version and delegates to it
for /f "delims=" %%d in ('dir /b /o-d "%LOCALAPPDATA%\cursor-agent\versions\*" 2^>nul') do (
    "%LOCALAPPDATA%\cursor-agent\versions\%%d\cursor-agent.cmd" %*
    exit /b %ERRORLEVEL%
)
echo Error: Cursor agent not found. Please reinstall via Puppet Master. 1>&2
exit /b 1
"#;
        std::fs::write(&shim_path, content)
            .map_err(|e| format!("Failed to write Cursor shim: {e}"))?;
        Ok(shim_path)
    }
    #[cfg(not(target_os = "windows"))]
    {
        let shim_path = app_bin_dir.join("agent");
        let content = r#"#!/usr/bin/env bash
# Auto-generated shim for Cursor agent — do not edit
# Finds the latest installed cursor-agent version and delegates to it
CURSOR_VER_DIR="$(ls -dt ~/.local/share/cursor-agent/versions/*/ 2>/dev/null | head -1)"
if [ -z "$CURSOR_VER_DIR" ]; then
    echo "Error: Cursor agent not found. Please reinstall via Puppet Master." >&2
    exit 1
fi
exec "${CURSOR_VER_DIR}cursor-agent" "$@"
"#;
        std::fs::write(&shim_path, content)
            .map_err(|e| format!("Failed to write Cursor shim: {e}"))?;

        // chmod +x on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(&shim_path)
                .map_err(|e| format!("Failed to read shim metadata: {e}"))?
                .permissions();
            perms.set_mode(0o755);
            std::fs::set_permissions(&shim_path, perms)
                .map_err(|e| format!("Failed to chmod shim: {e}"))?;
        }

        Ok(shim_path)
    }
}

/// Create the Cursor agent shim and return an InstallOutcome.
fn create_cursor_shim(log_lines: &mut Vec<String>) -> InstallOutcome {
    let bin_dir = match ensure_app_bin_dir() {
        Ok(d) => d,
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("Failed to create app bin dir: {e}"),
                log_lines.clone(),
            );
        }
    };

    // Write the shim asynchronously - but we're in a sync context, so use block_on
    let shim_result = tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(write_cursor_agent_shim(&bin_dir))
    });

    match shim_result {
        Ok(shim_path) => {
            log_lines.push(format!(
                "Created Cursor agent shim at {}",
                shim_path.display()
            ));
            InstallOutcome {
                success: true,
                message: format!(
                    "Cursor agent installed. Created shim at {}",
                    shim_path.display()
                ),
                log_lines: log_lines.clone(),
                installed_path: Some(shim_path),
            }
        }
        Err(e) => {
            log_lines.push(format!("Failed to create Cursor shim: {e}"));
            InstallOutcome::failure_with_log(
                format!("Cursor install completed but shim creation failed: {e}"),
                log_lines.clone(),
            )
        }
    }
}

// DRY:FN:install_claude_app_local — Run Claude Code install script and copy to bin/claude
/// Install Claude Code via the official script and copy the binary to the app-local `bin/`.
pub async fn install_claude_app_local() -> InstallOutcome {
    install_script_based_platform(Platform::Claude).await
}

// DRY:FN:install_cursor_app_local — Run Cursor install script and copy to bin/agent
/// Install Cursor CLI via the official script and copy the binary to the app-local `bin/`.
pub async fn install_cursor_app_local() -> InstallOutcome {
    install_script_based_platform(Platform::Cursor).await
}

/// Install a platform via its official install script and copy the binary to the app-local `bin/`.
///
/// Uses `crate::platforms::platform_specs::install_script_urls` as the single source of truth
/// for install script URLs.
async fn install_script_based_platform(platform: Platform) -> InstallOutcome {
    info!(
        "Installing {} via official script",
        crate::platforms::platform_specs::display_name_for(platform)
    );

    let mut log_lines = Vec::new();

    // Get install script URLs from platform_specs (single source of truth)
    #[allow(unused_variables)]
    let (unix_url, win_url) = match crate::platforms::platform_specs::install_script_urls(platform)
    {
        Some(urls) => urls,
        None => {
            return InstallOutcome::failure(format!(
                "{} does not support script-based installation",
                crate::platforms::platform_specs::display_name_for(platform)
            ));
        }
    };

    // Construct platform-appropriate install commands
    #[cfg(not(target_os = "windows"))]
    let unix_cmd = if unix_url.is_empty() {
        return InstallOutcome::failure(format!(
            "{} does not have a Unix install script",
            crate::platforms::platform_specs::display_name_for(platform)
        ));
    } else {
        format!("curl -fsSL {} | bash", unix_url)
    };

    #[cfg(target_os = "windows")]
    let win_cmd = if win_url.is_empty() {
        return InstallOutcome::failure(format!(
            "{} does not have a Windows PowerShell install script. Use winget or another package manager instead.",
            crate::platforms::platform_specs::display_name_for(platform)
        ));
    } else {
        format!("irm '{}' | iex", win_url)
    };

    // Step 1: Run official install script
    #[cfg(not(target_os = "windows"))]
    let install_ok = run_install_script(&unix_cmd, "", &mut log_lines).await;

    #[cfg(target_os = "windows")]
    let install_ok = run_install_script("", &win_cmd, &mut log_lines).await;

    if !install_ok {
        return InstallOutcome::failure_with_log(
            format!(
                "{} install script failed. Check log for details.",
                crate::platforms::platform_specs::display_name_for(platform)
            ),
            log_lines,
        );
    }

    // Step 2: Detect where the binary was installed
    let binary_names = crate::platforms::platform_specs::cli_binary_names(platform);
    let detected_path = find_installed_binary(binary_names, &mut log_lines).await;

    // Step 3: For Cursor, create a shim instead of copying the wrapper
    if platform == Platform::Cursor {
        return create_cursor_shim(&mut log_lines);
    }

    // Step 3: Copy to app-local bin/ using the primary binary name
    let primary_binary = binary_names
        .first()
        .expect("Platform should have at least one binary name");
    copy_to_app_bin(detected_path, primary_binary, &mut log_lines)
}

/// Run the platform-appropriate install script and return whether it succeeded.
async fn run_install_script(unix_cmd: &str, win_cmd: &str, log_lines: &mut Vec<String>) -> bool {
    #[cfg(not(target_os = "windows"))]
    {
        let _ = win_cmd;
        log_lines.push(format!("Running: sh -c \"{unix_cmd}\""));
        let result = tokio::process::Command::new("sh")
            .args(["-c", unix_cmd])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await;

        match result {
            Ok(out) => {
                log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
                if !out.status.success() {
                    log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                    log_lines.push(format!("Script exited with: {}", out.status));
                    return false;
                }
                true
            }
            Err(e) => {
                log_lines.push(format!("Failed to run script: {e}"));
                false
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let _ = unix_cmd;
        log_lines.push(format!("Running PowerShell: {win_cmd}"));
        let result = tokio::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", win_cmd])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await;

        match result {
            Ok(out) => {
                log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
                if !out.status.success() {
                    log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                    return false;
                }
                true
            }
            Err(e) => {
                log_lines.push(format!("Failed to run PowerShell script: {e}"));
                false
            }
        }
    }
}

/// Try to find a newly installed binary using PlatformDetector and common locations.
async fn find_installed_binary(names: &[&str], log_lines: &mut Vec<String>) -> Option<PathBuf> {
    // First: try which
    for name in names {
        if let Ok(path) = which::which(name) {
            log_lines.push(format!("Found installed binary: {}", path.display()));
            return Some(path);
        }
    }

    // Second: check common install paths
    let common_dirs = [
        // Claude Code (npm global)
        dirs_next_home().map(|h| h.join(".local/share/npm/bin")),
        dirs_next_home().map(|h| h.join(".npm-global/bin")),
        // Cursor agent
        dirs_next_home().map(|h| h.join(".cursor-agent")),
        Some(PathBuf::from("/usr/local/bin")),
        Some(PathBuf::from("/usr/bin")),
    ];

    for dir_opt in &common_dirs {
        if let Some(dir) = dir_opt {
            for name in names {
                let candidate = dir.join(name);
                if candidate.exists() {
                    log_lines.push(format!("Found at: {}", candidate.display()));
                    return Some(candidate);
                }
            }
        }
    }

    // Third: shell profile PATH
    for name in names {
        if let Some(path) = crate::platforms::path_utils::find_in_shell_path(name) {
            log_lines.push(format!("Found via shell PATH: {}", path.display()));
            return Some(path);
        }
    }

    log_lines.push(format!(
        "Warning: could not locate installed binary for {:?}; will continue without copy",
        names
    ));
    None
}

fn dirs_next_home() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

/// Copy `src` to `{APP_DATA_DIR}/bin/{dst_name}` and return an InstallOutcome.
fn copy_to_app_bin(
    src: Option<PathBuf>,
    dst_name: &str,
    log_lines: &mut Vec<String>,
) -> InstallOutcome {
    let bin_dir = match ensure_app_bin_dir() {
        Ok(d) => d,
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("Failed to create app bin dir: {e}"),
                log_lines.clone(),
            );
        }
    };

    let dst = bin_dir.join(dst_name);

    match src {
        Some(src_path) => {
            match std::fs::copy(&src_path, &dst) {
                Ok(_) => {
                    set_executable(&dst, log_lines);
                    log_lines.push(format!("Copied {} → {}", src_path.display(), dst.display()));
                    InstallOutcome {
                        success: true,
                        message: format!("Installed {dst_name} to {}", dst.display()),
                        log_lines: log_lines.clone(),
                        installed_path: Some(dst),
                    }
                }
                Err(e) => {
                    log_lines.push(format!("Failed to copy binary: {e}"));
                    // Script installed successfully but we couldn't copy; still report success
                    // since the CLI is usable from its original location
                    InstallOutcome {
                        success: true,
                        message: format!("{dst_name} installed (could not copy to app dir: {e})"),
                        log_lines: log_lines.clone(),
                        installed_path: None,
                    }
                }
            }
        }
        None => {
            // Script ran fine but we couldn't find the binary
            InstallOutcome {
                success: false,
                message: format!(
                    "{dst_name} installation script completed but binary could not be located. \
                     You may need to restart the application."
                ),
                log_lines: log_lines.clone(),
                installed_path: None,
            }
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn set_executable(path: &std::path::Path, log_lines: &mut Vec<String>) {
    use std::os::unix::fs::PermissionsExt;
    match std::fs::metadata(path) {
        Ok(meta) => {
            let mut perms = meta.permissions();
            perms.set_mode(perms.mode() | 0o111);
            if let Err(e) = std::fs::set_permissions(path, perms) {
                log_lines.push(format!("Warning: could not set executable bit: {e}"));
            }
        }
        Err(e) => log_lines.push(format!("Warning: could not read permissions: {e}")),
    }
}

#[cfg(target_os = "windows")]
fn set_executable(_path: &std::path::Path, _log_lines: &mut Vec<String>) {}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn find_installed_binary_returns_none_for_nonexistent() {
        let mut log = Vec::new();
        let result = find_installed_binary(&["__pm_nonexistent_binary_42__"], &mut log).await;
        assert!(result.is_none());
    }
}
