//! Doctor reporter - formats health check results for display

use super::check_registry::{CheckReport, DoctorReport};
use crate::types::CheckCategory;

// DRY:DATA:DoctorReporter
/// Formats doctor check results for display
pub struct DoctorReporter;

impl DoctorReporter {
    // DRY:FN:format_text
    /// Generate a text report
    pub fn format_text(report: &DoctorReport) -> String {
        let mut output = String::new();

        output.push_str(&format!("\n=== Puppet Master Health Check ===\n\n"));
        output.push_str(&format!(
            "Total: {} | Passed: {} | Failed: {} | Warnings: {}\n\n",
            report.checks.len(),
            report.passed,
            report.failed,
            report.warnings
        ));

        // Display by category
        for category in [
            CheckCategory::Cli,
            CheckCategory::Git,
            CheckCategory::Config,
            CheckCategory::Project,
            CheckCategory::Environment,
        ] {
            let checks: Vec<&CheckReport> = report
                .checks
                .iter()
                .filter(|c| c.category == category)
                .collect();
            if !checks.is_empty() {
                output.push_str(&format!("--- {:?} Checks ---\n", category));
                for check in checks {
                    let status = if check.result.passed {
                        "[PASS]"
                    } else if check.result.can_fix {
                        "[FIX]"
                    } else {
                        "[FAIL]"
                    };

                    output.push_str(&format!(
                        "{} {}: {}\n",
                        status, check.name, check.result.message
                    ));

                    if let Some(details) = &check.result.details {
                        output.push_str(&format!("   {}\n", details));
                    }
                }
                output.push_str("\n");
            }
        }

        if report.all_passed() {
            output.push_str("All checks passed!\n");
        } else if report.warnings > 0 {
            output.push_str(&format!(
                "[WARN] {} check(s) have fixable issues. Run with --fix to attempt repairs.\n",
                report.warnings
            ));
        }

        if report.failed > 0 {
            output.push_str(&format!(
                "[FAIL] {} check(s) failed and require manual intervention.\n",
                report.failed
            ));
        }

        output
    }

    // DRY:FN:format_json
    /// Generate a JSON report
    pub fn format_json(report: &DoctorReport) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&serde_json::json!({
            "summary": {
                "total": report.checks.len(),
                "passed": report.passed,
                "failed": report.failed,
                "warnings": report.warnings,
            },
            "checks": report.checks.iter().map(|check| {
                serde_json::json!({
                    "name": check.name,
                    "category": format!("{:?}", check.category),
                    "description": check.description,
                    "passed": check.result.passed,
                    "message": check.result.message,
                    "details": check.result.details,
                    "can_fix": check.result.can_fix,
                })
            }).collect::<Vec<_>>(),
        }))
    }

    // DRY:FN:format_markdown
    /// Generate a markdown report
    pub fn format_markdown(report: &DoctorReport) -> String {
        let mut output = String::new();

        output.push_str("# Puppet Master Health Check\n\n");
        output.push_str(&format!(
            "**Summary:** {} total | {} passed | {} failed | {} warnings\n\n",
            report.checks.len(),
            report.passed,
            report.failed,
            report.warnings
        ));

        for category in [
            CheckCategory::Cli,
            CheckCategory::Git,
            CheckCategory::Config,
            CheckCategory::Project,
            CheckCategory::Environment,
        ] {
            let checks: Vec<&CheckReport> = report
                .checks
                .iter()
                .filter(|c| c.category == category)
                .collect();
            if !checks.is_empty() {
                output.push_str(&format!("## {:?} Checks\n\n", category));

                for check in checks {
                    let status_icon = if check.result.passed {
                        "[PASS]"
                    } else if check.result.can_fix {
                        "[FIX]"
                    } else {
                        "[FAIL]"
                    };

                    output.push_str(&format!("### {} {}\n\n", status_icon, check.name));
                    output.push_str(&format!("*{}*\n\n", check.description));
                    output.push_str(&format!("**Result:** {}\n\n", check.result.message));

                    if let Some(details) = &check.result.details {
                        output.push_str(&format!("```\n{}\n```\n\n", details));
                    }
                }
            }
        }

        if report.all_passed() {
            output.push_str("\n---\n\n**All checks passed!**\n");
        }

        output
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{CheckCategory, CheckResult};
    use chrono::Utc;

    #[test]
    fn test_format_text() {
        let report = DoctorReport {
            checks: vec![CheckReport {
                name: "test-check".to_string(),
                category: CheckCategory::Cli,
                description: "A test check".to_string(),
                result: CheckResult {
                    passed: true,
                    message: "All good".to_string(),
                    details: None,
                    can_fix: false,
                    timestamp: Utc::now(),
                },
            }],
            passed: 1,
            failed: 0,
            warnings: 0,
        };

        let text = DoctorReporter::format_text(&report);
        assert!(text.contains("Health Check"));
        assert!(text.contains("test-check"));
        assert!(text.contains("All good"));
    }
}
