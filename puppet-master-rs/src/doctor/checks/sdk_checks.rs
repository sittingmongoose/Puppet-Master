//! Node.js and SDK readiness checks.
//!
//! Verifies Node.js/npm availability and optional SDK packages used for
//! Codex/Copilot SDK fallback paths.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use std::path::PathBuf;
use tokio::process::Command;
use tokio::time::{Duration, timeout};

// DRY:FN:find_executable_with_fallbacks -- Resolve executable via PATH + known fallback dirs.
fn find_executable_with_fallbacks(name: &str) -> Option<PathBuf> {
    crate::platforms::path_utils::resolve_executable(name)
}

// DRY:FN:run_shell_command -- Execute a shell command string on the current OS.
async fn run_shell_command(command: &str) -> std::io::Result<std::process::Output> {
    if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/C", command]).output().await
    } else {
        Command::new("bash").args(["-lc", command]).output().await
    }
}

// DRY:FN:node_install_plan -- OS-specific Node.js install plan.
fn node_install_plan() -> (String, String) {
    #[cfg(target_os = "windows")]
    {
        return (
            "Install Node.js LTS via winget".to_string(),
            "winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements"
                .to_string(),
        );
    }

    #[cfg(target_os = "macos")]
    {
        return (
            "Install Node.js via Homebrew".to_string(),
            "brew install node".to_string(),
        );
    }

    #[cfg(target_os = "linux")]
    {
        return (
            "Install Node.js LTS via nvm".to_string(),
            r#"export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm alias default 'lts/*'"#
                .to_string(),
        );
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        ("Unsupported operating system".to_string(), String::new())
    }
}

// DRY:DATA:NodeRuntimeCheck
/// Checks whether Node.js and npm are available.
pub struct NodeRuntimeCheck;

impl NodeRuntimeCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for NodeRuntimeCheck {
    fn name(&self) -> &str {
        "node-runtime"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        "Check Node.js and npm are installed (required for Playwright and SDK fallback)"
    }

    async fn run(&self) -> CheckResult {
        let Some(node_path) = find_executable_with_fallbacks("node") else {
            return CheckResult {
                passed: false,
                message: "Node.js not found".to_string(),
                details: Some(
                    "Node.js is required for Playwright checks and SDK fallback paths.".to_string(),
                ),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };

        let Some(npm_path) = find_executable_with_fallbacks("npm") else {
            return CheckResult {
                passed: false,
                message: "npm not found".to_string(),
                details: Some(format!(
                    "Node found at {}, but npm is missing.",
                    node_path.display()
                )),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };

        let node_version = Command::new(&node_path).arg("--version").output().await;
        let npm_version = Command::new(&npm_path).arg("--version").output().await;

        match (node_version, npm_version) {
            (Ok(node), Ok(npm)) if node.status.success() && npm.status.success() => {
                let node_v = String::from_utf8_lossy(&node.stdout).trim().to_string();
                let npm_v = String::from_utf8_lossy(&npm.stdout).trim().to_string();
                CheckResult {
                    passed: true,
                    message: format!("Node runtime available ({node_v}, npm {npm_v})"),
                    details: Some(format!(
                        "node: {}, npm: {}",
                        node_path.display(),
                        npm_path.display()
                    )),
                    can_fix: false,
                    timestamp: Utc::now(),
                }
            }
            _ => CheckResult {
                passed: false,
                message: "Node.js/npm found but version checks failed".to_string(),
                details: Some("Run 'node --version' and 'npm --version' manually.".to_string()),
                can_fix: true,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let (summary, command) = node_install_plan();
        if command.is_empty() {
            return Some(FixResult::failure(
                "Automatic Node.js installation is not supported on this OS.",
            ));
        }

        if dry_run {
            return Some(
                FixResult::success(format!("Would install Node.js runtime: {summary}"))
                    .with_step(format!("Would run: {command}")),
            );
        }

        match run_shell_command(&command).await {
            Ok(output) if output.status.success() => {
                let recheck = self.run().await;
                if recheck.passed {
                    Some(
                        FixResult::success("Node.js installation completed.")
                            .with_step(summary)
                            .with_step(command)
                            .with_step(format!("Revalidated: {}", recheck.message)),
                    )
                } else {
                    let mut result = FixResult::failure(
                        "Node.js installation command succeeded but Node runtime check still failed.",
                    )
                    .with_step(summary)
                    .with_step(command)
                    .with_step(format!("Revalidation failed: {}", recheck.message));
                    if let Some(details) = recheck.details {
                        result = result.with_step(details);
                    }
                    Some(result)
                }
            }
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                let mut result = FixResult::failure("Node.js installation failed.")
                    .with_step(summary)
                    .with_step(command);
                if !stderr.is_empty() {
                    result = result.with_step(format!("Installer output: {stderr}"));
                }
                Some(result)
            }
            Err(e) => Some(
                FixResult::failure(format!("Failed to start Node.js installation: {e}"))
                    .with_step(summary)
                    .with_step(command),
            ),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

// DRY:DATA:PlatformSdkCheck
/// Check for optional SDK package availability for a platform.
pub struct PlatformSdkCheck {
    platform: Platform,
}

impl PlatformSdkCheck {
    // DRY:FN:new
    pub fn new(platform: Platform) -> Self {
        Self { platform }
    }

    // DRY:FN:sdk_package_name
    fn sdk_package_name(&self) -> Option<&'static str> {
        crate::platforms::platform_specs::get_spec(self.platform)
            .sdk
            .as_ref()
            .map(|sdk| sdk.package_name)
    }

    // DRY:FN:sdk_display_name
    fn sdk_display_name(&self) -> &'static str {
        match self.platform {
            Platform::Codex => "Codex SDK",
            Platform::Copilot => "GitHub Copilot SDK",
            _ => "SDK",
        }
    }

    // DRY:FN:sdk_check_script
    fn sdk_check_script(package: &str) -> String {
        format!(
            "try {{ require.resolve('{package}'); process.exit(0); }} catch {{ process.exit(1); }}"
        )
    }
}

#[async_trait]
impl DoctorCheck for PlatformSdkCheck {
    fn name(&self) -> &str {
        match self.platform {
            Platform::Codex => "codex-sdk",
            Platform::Copilot => "copilot-sdk",
            _ => "unsupported-sdk",
        }
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        match self.platform {
            Platform::Codex => "Check @openai/codex-sdk is installed for SDK fallback",
            Platform::Copilot => "Check @github/copilot-sdk is installed for SDK fallback",
            _ => "Unsupported SDK check",
        }
    }

    async fn run(&self) -> CheckResult {
        let Some(package) = self.sdk_package_name() else {
            return CheckResult {
                passed: true,
                message: "No SDK package required for this platform".to_string(),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            };
        };

        let Some(node_path) = find_executable_with_fallbacks("node") else {
            return CheckResult {
                passed: false,
                message: format!(
                    "{} requires Node.js, but node is not installed",
                    self.sdk_display_name()
                ),
                details: Some("Install Node.js first, then install SDK package.".to_string()),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };
        let Some(npm_path) = find_executable_with_fallbacks("npm") else {
            return CheckResult {
                passed: false,
                message: format!(
                    "{} requires npm, but npm is not installed",
                    self.sdk_display_name()
                ),
                details: Some(format!(
                    "Node found at {}, but npm is missing.",
                    node_path.display()
                )),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };

        let script = Self::sdk_check_script(package);
        let resolved = Command::new(&node_path)
            .args(["-e", &script])
            .output()
            .await;
        if matches!(resolved, Ok(out) if out.status.success()) {
            return CheckResult {
                passed: true,
                message: format!("{} is installed", self.sdk_display_name()),
                details: Some(format!("Package: {package}")),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        // Fallback check: npm list -g package
        let npm_global = Command::new(&npm_path)
            .args(["list", "-g", package, "--depth=0"])
            .output()
            .await;
        if matches!(npm_global, Ok(out) if out.status.success()) {
            return CheckResult {
                passed: true,
                message: format!("{} found in global npm packages", self.sdk_display_name()),
                details: Some(format!("Package: {package}")),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        CheckResult {
            passed: false,
            message: format!("{} not installed", self.sdk_display_name()),
            details: Some(format!(
                "Optional but recommended for SDK fallback. Install with: npm install -g {package}"
            )),
            can_fix: true,
            timestamp: Utc::now(),
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let Some(package) = self.sdk_package_name() else {
            return Some(FixResult::not_fixable());
        };

        let Some(npm_path) = find_executable_with_fallbacks("npm") else {
            return Some(FixResult::failure(
                "npm is not installed; install Node.js/npm first.",
            ));
        };

        let command = format!("{} install -g {package}", npm_path.display());
        if dry_run {
            return Some(
                FixResult::success(format!("Would install {}", self.sdk_display_name()))
                    .with_step(format!("Would run: {command}")),
            );
        }

        match timeout(
            Duration::from_secs(180),
            Command::new(&npm_path)
                .args(["install", "-g", package])
                .output(),
        )
        .await
        {
            Ok(Ok(output)) if output.status.success() => {
                let recheck = self.run().await;
                if recheck.passed {
                    Some(
                        FixResult::success(format!("Installed {}", self.sdk_display_name()))
                            .with_step(command)
                            .with_step(format!("Revalidated: {}", recheck.message)),
                    )
                } else {
                    let mut result = FixResult::failure(format!(
                        "{} install command succeeded but check still failed",
                        self.sdk_display_name()
                    ))
                    .with_step(command)
                    .with_step(format!("Revalidation failed: {}", recheck.message));
                    if let Some(details) = recheck.details {
                        result = result.with_step(details);
                    }
                    Some(result)
                }
            }
            Ok(Ok(output)) => {
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                let mut result =
                    FixResult::failure(format!("Failed to install {}", self.sdk_display_name()))
                        .with_step(command);
                if !stderr.is_empty() {
                    result = result.with_step(format!("npm stderr: {stderr}"));
                }
                Some(result)
            }
            Ok(Err(e)) => Some(
                FixResult::failure(format!(
                    "Failed to start {} installation: {}",
                    self.sdk_display_name(),
                    e
                ))
                .with_step(command),
            ),
            Err(_) => Some(
                FixResult::failure(format!(
                    "{} installation timed out",
                    self.sdk_display_name()
                ))
                .with_step(command),
            ),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn node_install_plan_is_defined() {
        let (summary, command) = node_install_plan();
        assert!(!summary.trim().is_empty());
        #[cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]
        assert!(!command.trim().is_empty());
    }

    #[test]
    fn sdk_package_names_from_specs() {
        let codex = PlatformSdkCheck::new(Platform::Codex);
        let copilot = PlatformSdkCheck::new(Platform::Copilot);
        assert_eq!(codex.sdk_package_name(), Some("@openai/codex-sdk"));
        assert_eq!(copilot.sdk_package_name(), Some("@github/copilot-sdk"));
    }

    #[test]
    fn executable_lookup_returns_none_for_missing_binary() {
        assert!(find_executable_with_fallbacks("__rwm_nonexistent_binary_42__").is_none());
    }
}
