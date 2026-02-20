//! Platform CLI compatibility check
//!
//! Verifies installed platform CLIs appear compatible with the flags/features
//! Puppet Master expects (by inspecting help output and version strings).

use crate::platforms::platform_detector::PlatformDetector;
use crate::platforms::platform_specs;
use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use std::path::Path;
use std::process::Stdio;
use tokio::process::Command;
use tokio::time::{Duration, timeout};

async fn run_command(
    program: &Path,
    args: &[&str],
    timeout_duration: Duration,
) -> Result<std::process::Output, String> {
    let mut cmd = Command::new(program);
    cmd.args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);

    match timeout(timeout_duration, cmd.output()).await {
        Ok(Ok(output)) => Ok(output),
        Ok(Err(e)) => Err(format!("Failed to run {}: {e}", program.display())),
        Err(_) => Err(format!(
            "Timed out running {} {:?}",
            program.display(),
            args
        )),
    }
}

fn combined_lower(output: &std::process::Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{}{}", stdout, stderr).to_lowercase()
}

fn required_help_substrings(platform: Platform) -> &'static [&'static str] {
    match platform {
        Platform::Cursor => &["--model", "--output-format"],
        Platform::Codex => &["exec", "--config"],  // @openai/codex Rust binary: exec ✓, --config ✓, --json ✗
        Platform::Claude => &["--output-format", "--no-session-persistence"],
        Platform::Gemini => &["--output-format", "--approval-mode"],
        // Copilot is launched via `npx -y @github/copilot` (always downloads latest agent).
        // The binary detected by PlatformDetector may be the legacy gh-copilot suggest/explain
        // tool (from the deprecated binary installer), which does not expose --allow-all-tools.
        // Flag checking is not useful here: agent compatibility is guaranteed by npx -y.
        Platform::Copilot => &[],
    }
}

// DRY:DATA:PlatformCompatibilityCheck
/// Checks that installed CLIs are new enough / compatible with expected flags.
pub struct PlatformCompatibilityCheck;

impl PlatformCompatibilityCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

impl Default for PlatformCompatibilityCheck {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DoctorCheck for PlatformCompatibilityCheck {
    fn name(&self) -> &str {
        "platform-cli-compatibility"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }

    fn description(&self) -> &str {
        "Verify installed platform CLIs support expected flags / are not known-incompatible"
    }

    async fn run(&self) -> CheckResult {
        let mut details = Vec::new();
        let mut incompatible = Vec::new();
        let mut checked_any = false;

        for platform in Platform::all() {
            let spec = platform_specs::get_spec(*platform);
            let trace =
                PlatformDetector::detect_platform_with_custom_paths_trace(*platform, None, None)
                    .await;

            let Some(detected) = trace.detected else {
                details.push(format!("{}: not installed (skipped)", spec.display_name));
                continue;
            };

            checked_any = true;
            details.push(format!(
                "{}: using '{}' at {}",
                spec.display_name,
                detected.cli_name,
                detected.cli_path.display()
            ));

            let version = match run_command(
                &detected.cli_path,
                &[spec.version_command],
                Duration::from_secs(8),
            )
            .await
            {
                Ok(out) => {
                    let text = combined_lower(&out);
                    if out.status.success() {
                        Some(text.lines().next().unwrap_or("").trim().to_string())
                    } else {
                        None
                    }
                }
                Err(_) => None,
            };

            if let Some(v) = version {
                details.push(format!("  version: {v}"));
            } else {
                details.push("  version: unknown".to_string());
            }

            let help_out =
                match run_command(&detected.cli_path, &["--help"], Duration::from_secs(8)).await {
                    Ok(out) => out,
                    Err(e) => {
                        incompatible.push(format!(
                            "{}: failed to read --help output ({e})",
                            spec.display_name
                        ));
                        continue;
                    }
                };

            let help_text = combined_lower(&help_out);
            let mut missing = Vec::new();
            for req in required_help_substrings(*platform) {
                if !help_text.contains(req) {
                    missing.push(*req);
                }
            }

            if !missing.is_empty() {
                incompatible.push(format!(
                    "{}: missing expected flag(s) in --help: {}",
                    spec.display_name,
                    missing.join(", ")
                ));
            }
        }

        if !checked_any {
            return CheckResult {
                // WARN (not PASS): avoids green state when every platform is effectively skipped.
                passed: false,
                message: "No platform CLIs detected; compatibility check skipped".to_string(),
                details: Some(details.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        if !incompatible.is_empty() {
            details.push("".to_string());
            details.push("Incompatibilities:".to_string());
            for i in &incompatible {
                details.push(format!("  - {i}"));
            }

            return CheckResult {
                passed: false,
                message: format!("Found {} incompatible platform CLI(s)", incompatible.len()),
                details: Some(details.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        CheckResult {
            passed: true,
            message: "All detected platform CLIs appear compatible".to_string(),
            details: Some(details.join("\n")),
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn required_help_flags_include_expected_cursor_flags() {
        let flags = required_help_substrings(Platform::Cursor);
        assert!(flags.contains(&"--model"));
        assert!(flags.contains(&"--output-format"));
    }

    #[test]
    fn required_help_flags_for_copilot_is_empty() {
        // Copilot is launched via npx -y @github/copilot; no static binary flag check needed.
        let flags = required_help_substrings(Platform::Copilot);
        assert!(flags.is_empty());
    }
}
