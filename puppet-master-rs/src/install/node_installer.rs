//! System-wide Node.js installation.
//!
//! Node.js is the only dependency installed system-wide (not app-local) because
//! it is a runtime the user needs broadly.  Installation is attempted via the
//! platform package manager first, with nvm as a fallback on Linux/macOS.

use crate::install::install_coordinator::InstallOutcome;
use log::{debug, info};

// Minimum Node.js major version required.
const MIN_NODE_MAJOR: u64 = 18;

// DRY:FN:check_node_version — Probe system node and return version string if found
/// Probe the system for an installed `node` binary and return its version string.
///
/// Uses `bash -lc "node --version"` (loads shell profile) so nvm-installed Node
/// is found even when the GUI app inherits a minimal PATH.
pub fn check_node_version() -> Option<String> {
    // First try direct which lookup
    if let Ok(out) = std::process::Command::new("node")
        .arg("--version")
        .output()
    {
        if out.status.success() {
            let v = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !v.is_empty() {
                debug!("node version via direct: {}", v);
                return Some(v);
            }
        }
    }

    // Fallback: bash login shell (picks up nvm, asdf, etc.)
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(out) = std::process::Command::new("bash")
            .args(["-lc", "node --version"])
            .output()
        {
            if out.status.success() {
                let v = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !v.is_empty() {
                    debug!("node version via bash -lc: {}", v);
                    return Some(v);
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Try PowerShell on Windows
        if let Ok(out) = std::process::Command::new("cmd")
            .args(["/C", "node --version"])
            .output()
        {
            if out.status.success() {
                let v = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !v.is_empty() {
                    return Some(v);
                }
            }
        }
    }

    None
}

// DRY:FN:node_meets_minimum — Returns true if installed node >= MIN_NODE_MAJOR
/// Returns `true` if Node.js is installed and meets the minimum version requirement.
pub fn node_meets_minimum() -> bool {
    match check_node_version() {
        Some(v) => {
            // Parse "v18.20.0" or "18.20.0"
            let trimmed = v.trim_start_matches('v');
            let major: u64 = trimmed
                .split('.')
                .next()
                .and_then(|m| m.parse().ok())
                .unwrap_or(0);
            major >= MIN_NODE_MAJOR
        }
        None => false,
    }
}

// DRY:FN:install_node_system_wide — Install Node.js system-wide via package manager
/// Install Node.js system-wide using the platform's package manager.
///
/// Order of attempt:
/// - Linux:   apt-get → nvm fallback
/// - macOS:   brew
/// - Windows: winget
pub async fn install_node_system_wide() -> InstallOutcome {
    info!("Attempting system-wide Node.js installation");

    #[cfg(target_os = "linux")]
    return install_node_linux().await;

    #[cfg(target_os = "macos")]
    return install_node_macos().await;

    #[cfg(target_os = "windows")]
    return install_node_windows().await;

    #[allow(unreachable_code)]
    InstallOutcome::failure("Unsupported operating system for automatic Node.js installation.")
}

#[cfg(target_os = "linux")]
async fn install_node_linux() -> InstallOutcome {
    use std::process::Stdio;

    let mut log_lines = Vec::new();

    // Try apt-get first (Debian/Ubuntu)
    if which::which("apt-get").is_ok() {
        log_lines.push("Trying: apt-get install -y nodejs npm".to_string());
        let result = tokio::process::Command::new("sh")
            .args([
                "-c",
                "apt-get install -y nodejs npm 2>&1 || (curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && apt-get install -y nodejs)",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await;

        match result {
            Ok(out) if out.status.success() => {
                log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
                if node_meets_minimum() {
                    return InstallOutcome {
                        success: true,
                        message: "Node.js installed via apt-get.".to_string(),
                        log_lines,
                        installed_path: which::which("node").ok(),
                    };
                }
                log_lines.push("apt-get succeeded but node version check failed; trying nvm fallback.".to_string());
            }
            Ok(out) => {
                log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                log_lines.push("apt-get install failed; trying nvm fallback.".to_string());
            }
            Err(e) => {
                log_lines.push(format!("apt-get not available: {e}; trying nvm fallback."));
            }
        }
    }

    // nvm fallback
    log_lines.push("Installing Node.js via nvm…".to_string());
    let nvm_script = r#"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm alias default 'lts/*'
"#;
    let result = tokio::process::Command::new("bash")
        .args(["-lc", nvm_script])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(out) => {
            log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
            if !out.status.success() {
                log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                return InstallOutcome::failure_with_log(
                    "nvm install failed. Please install Node.js 18+ manually.",
                    log_lines,
                );
            }
            if node_meets_minimum() {
                InstallOutcome {
                    success: true,
                    message: "Node.js installed via nvm.".to_string(),
                    log_lines,
                    installed_path: None,
                }
            } else {
                InstallOutcome::failure_with_log(
                    "nvm install succeeded but node >= 18 not detected. Open a new terminal.",
                    log_lines,
                )
            }
        }
        Err(e) => InstallOutcome::failure_with_log(
            format!("nvm install failed to start: {e}"),
            log_lines,
        ),
    }
}

#[cfg(target_os = "macos")]
async fn install_node_macos() -> InstallOutcome {
    use std::process::Stdio;

    let mut log_lines = vec!["Running: brew install node".to_string()];

    let result = tokio::process::Command::new("brew")
        .args(["install", "node"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(out) => {
            log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
            if out.status.success() && node_meets_minimum() {
                InstallOutcome {
                    success: true,
                    message: "Node.js installed via Homebrew.".to_string(),
                    log_lines,
                    installed_path: which::which("node").ok(),
                }
            } else {
                log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                InstallOutcome::failure_with_log(
                    "brew install node failed. Please install Node.js 18+ manually.",
                    log_lines,
                )
            }
        }
        Err(e) => InstallOutcome::failure_with_log(
            format!("Homebrew not available or failed: {e}"),
            log_lines,
        ),
    }
}

#[cfg(target_os = "windows")]
async fn install_node_windows() -> InstallOutcome {
    use std::process::Stdio;

    let mut log_lines =
        vec!["Running: winget install --id OpenJS.NodeJS.LTS".to_string()];

    let result = tokio::process::Command::new("winget")
        .args([
            "install",
            "--id",
            "OpenJS.NodeJS.LTS",
            "-e",
            "--accept-source-agreements",
            "--accept-package-agreements",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(out) => {
            log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
            if out.status.success() {
                InstallOutcome {
                    success: true,
                    message: "Node.js installed via winget. Please restart your terminal."
                        .to_string(),
                    log_lines,
                    installed_path: None,
                }
            } else {
                log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                InstallOutcome::failure_with_log(
                    "winget install failed. Download Node.js 18+ from https://nodejs.org/",
                    log_lines,
                )
            }
        }
        Err(e) => InstallOutcome::failure_with_log(
            format!("winget not available: {e}. Download Node.js from https://nodejs.org/"),
            log_lines,
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn node_meets_minimum_does_not_panic() {
        // May return true or false depending on environment
        let _ = node_meets_minimum();
    }

    #[test]
    fn check_node_version_returns_option() {
        let _ = check_node_version();
    }
}
