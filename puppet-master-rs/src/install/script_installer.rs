//! Script-based CLI installers (Claude Code and Cursor).
//!
//! Both CLIs publish official install scripts.  This module:
//! 1. Runs the script via `curl | bash` (or PowerShell equivalent).
//! 2. Uses `PlatformDetector` to find where the script placed the binary.
//! 3. Copies the binary to `{APP_DATA_DIR}/bin/{name}` and sets the executable bit.

use crate::install::app_paths::ensure_app_bin_dir;
use crate::install::install_coordinator::InstallOutcome;
use log::info;
use std::path::PathBuf;
use std::process::Stdio;

// DRY:FN:install_claude_app_local — Run Claude Code install script and copy to bin/claude
/// Install Claude Code via the official script and copy the binary to the app-local `bin/`.
pub async fn install_claude_app_local() -> InstallOutcome {
    info!("Installing Claude Code via official script");

    let mut log_lines = Vec::new();

    // Step 1: Run official install script
    let install_ok = run_install_script(
        "curl -fsSL https://claude.ai/install.sh | bash",
        "irm https://claude.ai/install.ps1 | iex",
        &mut log_lines,
    )
    .await;

    if !install_ok {
        return InstallOutcome::failure_with_log(
            "Claude Code install script failed. Check log for details.",
            log_lines,
        );
    }

    // Step 2: Detect where claude was installed
    let detected_path = find_installed_binary(&["claude"], &mut log_lines).await;

    // Step 3: Copy to app-local bin/
    copy_to_app_bin(detected_path, "claude", &mut log_lines)
}

// DRY:FN:install_cursor_app_local — Run Cursor install script and copy to bin/agent
/// Install Cursor CLI via the official script and copy the binary to the app-local `bin/`.
pub async fn install_cursor_app_local() -> InstallOutcome {
    info!("Installing Cursor CLI via official script");

    let mut log_lines = Vec::new();

    // Step 1: Run official install script
    let install_ok = run_install_script(
        "curl https://cursor.com/install -fsS | bash",
        "irm 'https://cursor.com/install?win32=true' | iex",
        &mut log_lines,
    )
    .await;

    if !install_ok {
        return InstallOutcome::failure_with_log(
            "Cursor install script failed. Check log for details.",
            log_lines,
        );
    }

    // Step 2: Detect where agent/cursor-agent was installed
    let detected_path =
        find_installed_binary(&["agent", "cursor-agent"], &mut log_lines).await;

    // Step 3: Copy to app-local bin/agent
    copy_to_app_bin(detected_path, "agent", &mut log_lines)
}

/// Run the platform-appropriate install script and return whether it succeeded.
async fn run_install_script(
    unix_cmd: &str,
    _win_cmd: &str,
    log_lines: &mut Vec<String>,
) -> bool {
    #[cfg(not(target_os = "windows"))]
    {
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
async fn find_installed_binary(
    names: &[&str],
    log_lines: &mut Vec<String>,
) -> Option<PathBuf> {
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
        if let Some(path) =
            crate::platforms::path_utils::find_in_shell_path(name)
        {
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
                    log_lines.push(format!(
                        "Copied {} → {}",
                        src_path.display(),
                        dst.display()
                    ));
                    InstallOutcome {
                        success: true,
                        message: format!(
                            "Installed {dst_name} to {}",
                            dst.display()
                        ),
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
                        message: format!(
                            "{dst_name} installed (could not copy to app dir: {e})"
                        ),
                        log_lines: log_lines.clone(),
                        installed_path: None,
                    }
                }
            }
        }
        None => {
            // Script ran fine but we couldn't find the binary
            InstallOutcome {
                success: true,
                message: format!(
                    "{dst_name} installation script completed. \
                     Binary location unknown; it should be in your PATH."
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
        let result = find_installed_binary(&["__rwm_nonexistent_binary_42__"], &mut log).await;
        assert!(result.is_none());
    }
}
