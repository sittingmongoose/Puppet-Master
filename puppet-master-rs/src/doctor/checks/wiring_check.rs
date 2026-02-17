//! Internal wiring check
//!
//! Verifies core components are wired together:
//! orchestrator -> execution engine -> gate runner.

use crate::config::default_config::default_config;
use crate::core::Orchestrator;
use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use crate::verification::{GateRunConfig, GateRunner};
use async_trait::async_trait;
use chrono::Utc;
use std::path::{Path, PathBuf};

fn find_crate_root() -> Option<PathBuf> {
    let mut dir = std::env::current_dir().ok()?;
    for _ in 0..8 {
        if dir.join("Cargo.toml").exists() {
            return Some(dir);
        }
        if !dir.pop() {
            break;
        }
    }
    None
}

async fn file_contains(path: &Path, needle: &str) -> Result<bool, String> {
    // Check if file exists before trying to read it
    if !path.exists() {
        return Err(format!("File does not exist: {}", path.display()));
    }

    let content = tokio::fs::read_to_string(path)
        .await
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;
    Ok(content.contains(needle))
}

// DRY:DATA:WiringCheck
/// Smoke-checks that the core runtime wiring exists and is callable.
pub struct WiringCheck;

impl WiringCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

impl Default for WiringCheck {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DoctorCheck for WiringCheck {
    fn name(&self) -> &str {
        "wiring"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Verify internal wiring (orchestrator → execution engine → gate runner)"
    }

    async fn run(&self) -> CheckResult {
        let mut details = Vec::new();

        // 1) Source-level wiring checks (defensive against partial ports / TODO stubs).
        let Some(crate_root) = find_crate_root() else {
            // Not running inside the puppet-master source tree (e.g. release binary,
            // or project directory is not a Rust project). Skip source checks gracefully.
            return CheckResult {
                passed: true,
                message: "Wiring source checks skipped (not running from a Rust project directory)"
                    .to_string(),
                details: Some(
                    "Source-level checks only apply when running from the puppet-master-rs \
                     source directory."
                        .to_string(),
                ),
                can_fix: false,
                timestamp: Utc::now(),
            };
        };

        let orchestrator_path = crate_root.join("src/core/orchestrator.rs");
        let engine_path = crate_root.join("src/core/execution_engine.rs");
        let gate_path = crate_root.join("src/verification/gate_runner.rs");

        if !orchestrator_path.exists() || !engine_path.exists() || !gate_path.exists() {
            return CheckResult {
                passed: false,
                message: "Core wiring files missing".to_string(),
                details: Some(format!(
                    "Expected: {:?}, {:?}, {:?}",
                    orchestrator_path, engine_path, gate_path
                )),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        let mut source_ok = true;
        for (label, ok) in [
            (
                "orchestrator uses ExecutionEngine::new",
                file_contains(&orchestrator_path, "ExecutionEngine::new").await,
            ),
            (
                "orchestrator uses GateRunner::new",
                file_contains(&orchestrator_path, "GateRunner::new").await,
            ),
            (
                "orchestrator calls run_gate",
                file_contains(&orchestrator_path, ".run_gate(").await,
            ),
        ] {
            match ok {
                Ok(true) => details.push(format!("[OK] {label}")),
                Ok(false) => {
                    source_ok = false;
                    details.push(format!("[FAIL] {label}"));
                }
                Err(e) => {
                    source_ok = false;
                    details.push(format!("[FAIL] {label}: {e}"));
                }
            }
        }

        // 2) Runtime smoke checks.
        let gate_runner = GateRunner::new(GateRunConfig::default());
        let gate_report = gate_runner
            .run_gate("task", "doctor-wiring", &[], None)
            .await;
        if gate_report.passed {
            details.push("[OK] GateRunner can execute an empty gate".to_string());
        } else {
            source_ok = false;
            details.push("[FAIL] GateRunner failed to execute an empty gate".to_string());
        }

        match Orchestrator::new(default_config()) {
            Ok(_) => details.push("[OK] Orchestrator::new constructed successfully".to_string()),
            Err(e) => {
                source_ok = false;
                details.push(format!("[FAIL] Orchestrator::new failed: {e}"));
            }
        }

        if !source_ok {
            return CheckResult {
                passed: false,
                message: "Internal wiring check failed".to_string(),
                details: Some(details.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        CheckResult {
            passed: true,
            message: "Internal wiring looks healthy".to_string(),
            details: Some(details.join("\n")),
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}
