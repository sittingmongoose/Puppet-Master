//! Platform CLI compatibility check
//!
//! Verifies installed platform CLIs appear compatible with the flags/features
//! Puppet Master expects (by inspecting help output and version strings).

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::process::Stdio;
use tokio::process::Command;
use tokio::time::{Duration, timeout};
use which::which;

async fn run_command(
    program: &str,
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
        Ok(Err(e)) => Err(format!("Failed to run {program}: {e}")),
        Err(_) => Err(format!("Timed out running {program} {:?}", args)),
    }
}

fn combined_lower(output: &std::process::Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{}{}", stdout, stderr).to_lowercase()
}

#[derive(Clone, Copy)]
struct ToolSpec {
    label: &'static str,
    candidates: &'static [&'static str],
    version_args: &'static [&'static str],
    help_args: &'static [&'static str],
    required_help_substrings: &'static [&'static str],
}

const TOOL_SPECS: &[ToolSpec] = &[
    ToolSpec {
        label: "Cursor",
        candidates: &["agent", "cursor-agent"],
        version_args: &["--version"],
        help_args: &["--help"],
        required_help_substrings: &["--model", "--output-format"],
    },
    ToolSpec {
        label: "Codex",
        candidates: &["codex"],
        version_args: &["--version"],
        help_args: &["--help"],
        required_help_substrings: &["exec", "--json"],
    },
    ToolSpec {
        label: "Claude",
        candidates: &["claude"],
        version_args: &["--version"],
        help_args: &["--help"],
        required_help_substrings: &["--output-format", "--no-session-persistence"],
    },
    ToolSpec {
        label: "Gemini",
        candidates: &["gemini"],
        version_args: &["--version"],
        help_args: &["--help"],
        required_help_substrings: &["--output-format", "--approval-mode"],
    },
    ToolSpec {
        label: "Copilot",
        candidates: &["copilot"],
        version_args: &["--version"],
        help_args: &["--help"],
        required_help_substrings: &["--allow-all-tools"],
    },
];

/// Checks that installed CLIs are new enough / compatible with expected flags.
pub struct PlatformCompatibilityCheck;

impl PlatformCompatibilityCheck {
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

        for spec in TOOL_SPECS {
            let found = spec
                .candidates
                .iter()
                .find_map(|c| which(c).ok().map(|p| (c.to_string(), p)));

            let Some((candidate, path)) = found else {
                details.push(format!("{}: not installed (skipped)", spec.label));
                continue;
            };

            checked_any = true;
            details.push(format!(
                "{}: using '{}' at {:?}",
                spec.label, candidate, path
            ));

            let version =
                match run_command(&candidate, spec.version_args, Duration::from_secs(8)).await {
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
                match run_command(&candidate, spec.help_args, Duration::from_secs(8)).await {
                    Ok(out) => out,
                    Err(e) => {
                        incompatible.push(format!(
                            "{}: failed to read --help output ({e})",
                            spec.label
                        ));
                        continue;
                    }
                };

            let help_text = combined_lower(&help_out);
            let mut missing = Vec::new();
            for req in spec.required_help_substrings {
                if !help_text.contains(req) {
                    missing.push(*req);
                }
            }

            if !missing.is_empty() {
                incompatible.push(format!(
                    "{}: missing expected flag(s) in --help: {}",
                    spec.label,
                    missing.join(", ")
                ));
            }
        }

        if !checked_any {
            return CheckResult {
                passed: true,
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
