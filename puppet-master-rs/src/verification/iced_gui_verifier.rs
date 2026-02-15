//! Iced GUI verifier.
//!
//! Executes Rust GUI automation scenarios through the local automation module.

use crate::automation::{GuiRunMode, GuiRunSpec, WorkspaceIsolation, run_gui_automation};
use crate::types::{Criterion, Evidence, Verifier, VerifierResult};
use async_trait::async_trait;
use chrono::Utc;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;

/// Criterion payload accepted by `verificationMethod: "iced_gui"`.
#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct IcedGuiCriterionSpec {
    #[serde(default)]
    scenario_path: Option<PathBuf>,
    #[serde(default)]
    mode: Option<String>,
    #[serde(default)]
    workspace_root: Option<PathBuf>,
    #[serde(default)]
    artifacts_root: Option<PathBuf>,
    #[serde(default)]
    run_id: Option<String>,
    #[serde(default)]
    full_action: Option<bool>,
    #[serde(default)]
    capture_full_bundle: Option<bool>,
    #[serde(default)]
    timeout_ms: Option<u64>,
    #[serde(default)]
    workspace_isolation: Option<String>,
}

// DRY:DATA:IcedGuiVerifier
/// Verifier implementation for Iced GUI automation.
pub struct IcedGuiVerifier;

impl IcedGuiVerifier {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

    fn parse_spec(expected: Option<&str>) -> Result<GuiRunSpec, String> {
        let mut spec = GuiRunSpec::default();

        let Some(raw) = expected else {
            return Ok(spec);
        };

        let raw = raw.trim();
        if raw.is_empty() {
            return Ok(spec);
        }

        if raw.starts_with('{') {
            let payload = serde_json::from_str::<IcedGuiCriterionSpec>(raw)
                .map_err(|e| format!("Invalid iced_gui JSON payload: {e}"))?;

            if let Some(path) = payload.scenario_path {
                let scenario_content = std::fs::read_to_string(&path)
                    .map_err(|e| format!("Failed to read scenario {}: {e}", path.display()))?;

                spec = if path
                    .extension()
                    .and_then(|v| v.to_str())
                    .unwrap_or_default()
                    == "yaml"
                    || path
                        .extension()
                        .and_then(|v| v.to_str())
                        .unwrap_or_default()
                        == "yml"
                {
                    serde_yaml::from_str::<GuiRunSpec>(&scenario_content)
                        .map_err(|e| format!("Failed to parse YAML scenario: {e}"))?
                } else {
                    serde_json::from_str::<GuiRunSpec>(&scenario_content)
                        .map_err(|e| format!("Failed to parse JSON scenario: {e}"))?
                };
            }

            if let Some(mode) = payload.mode {
                spec.mode = parse_mode(&mode)?;
            }
            if let Some(workspace_root) = payload.workspace_root {
                spec.workspace_root = workspace_root;
            }
            if let Some(artifacts_root) = payload.artifacts_root {
                spec.artifacts_root = artifacts_root;
            }
            if let Some(run_id) = payload.run_id {
                spec.run_id = run_id;
            }
            if let Some(full_action) = payload.full_action {
                spec.full_action = full_action;
            }
            if let Some(capture_full_bundle) = payload.capture_full_bundle {
                spec.capture_full_bundle = capture_full_bundle;
            }
            if let Some(timeout_ms) = payload.timeout_ms {
                spec.timeout_ms = timeout_ms;
            }
            if let Some(isolation) = payload.workspace_isolation {
                spec.workspace_isolation = parse_isolation(&isolation)?;
            }

            return Ok(spec);
        }

        // Non-JSON payload is treated as a scenario file path.
        let path = PathBuf::from(raw);
        let scenario_content = std::fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read scenario {}: {e}", path.display()))?;

        spec = if path
            .extension()
            .and_then(|v| v.to_str())
            .unwrap_or_default()
            == "yaml"
            || path
                .extension()
                .and_then(|v| v.to_str())
                .unwrap_or_default()
                == "yml"
        {
            serde_yaml::from_str::<GuiRunSpec>(&scenario_content)
                .map_err(|e| format!("Failed to parse YAML scenario: {e}"))?
        } else {
            serde_json::from_str::<GuiRunSpec>(&scenario_content)
                .map_err(|e| format!("Failed to parse JSON scenario: {e}"))?
        };

        Ok(spec)
    }
}

#[async_trait]
impl Verifier for IcedGuiVerifier {
    fn verifier_type(&self) -> &str {
        "iced_gui"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        let spec = match Self::parse_spec(criterion.expected.as_deref()) {
            Ok(spec) => spec,
            Err(err) => {
                return VerifierResult::failure(format!(
                    "Failed to parse iced_gui spec for criterion {}: {}",
                    criterion.id, err
                ));
            }
        };

        let run_result = match run_gui_automation(spec) {
            Ok(result) => result,
            Err(err) => {
                return VerifierResult::failure(format!(
                    "Iced GUI automation execution failed for criterion {}: {}",
                    criterion.id, err
                ));
            }
        };

        let mut metadata = HashMap::new();
        metadata.insert("run_id".to_string(), run_result.run_id.clone());
        metadata.insert("mode".to_string(), run_result.mode.to_string());
        metadata.insert("passed".to_string(), run_result.passed.to_string());
        metadata.insert(
            "artifacts_root".to_string(),
            run_result.artifacts_root.display().to_string(),
        );
        metadata.insert(
            "step_count".to_string(),
            run_result.step_results.len().to_string(),
        );
        metadata.insert(
            "summary_path".to_string(),
            run_result
                .debug_summary_path
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_default(),
        );

        let evidence_path = run_result
            .debug_summary_path
            .clone()
            .unwrap_or_else(|| run_result.artifacts_root.join("summary.md"));

        let evidence = Evidence {
            evidence_type: "iced_gui_run".to_string(),
            path: evidence_path,
            timestamp: Utc::now(),
            description: Some(format!(
                "Iced GUI automation run {}",
                run_result.scenario_name
            )),
            metadata,
        };

        VerifierResult {
            passed: run_result.passed,
            message: if run_result.passed {
                format!(
                    "Iced GUI verifier passed (run_id={}, steps={})",
                    run_result.run_id,
                    run_result.step_results.len()
                )
            } else {
                format!(
                    "Iced GUI verifier failed (run_id={}): {}",
                    run_result.run_id, run_result.message
                )
            },
            evidence: Some(evidence),
            timestamp: Utc::now(),
        }
    }
}

fn parse_mode(raw: &str) -> Result<GuiRunMode, String> {
    match raw.trim().to_lowercase().as_str() {
        "headless" => Ok(GuiRunMode::Headless),
        "native" => Ok(GuiRunMode::Native),
        "hybrid" => Ok(GuiRunMode::Hybrid),
        other => Err(format!(
            "Unknown mode '{}'; expected headless|native|hybrid",
            other
        )),
    }
}

fn parse_isolation(raw: &str) -> Result<WorkspaceIsolation, String> {
    match raw.trim().to_lowercase().as_str() {
        "ephemeralclone" | "ephemeral_clone" | "ephemeral-clone" => {
            Ok(WorkspaceIsolation::EphemeralClone)
        }
        "sameworkspacewithbackups"
        | "same_workspace_with_backups"
        | "same-workspace-with-backups" => Ok(WorkspaceIsolation::SameWorkspaceWithBackups),
        "inplacedirect" | "in_place_direct" | "in-place-direct" => {
            Ok(WorkspaceIsolation::InPlaceDirect)
        }
        other => Err(format!(
            "Unknown workspace isolation '{}'; expected ephemeralClone|sameWorkspaceWithBackups|inPlaceDirect",
            other
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_mode() {
        assert!(matches!(parse_mode("headless"), Ok(GuiRunMode::Headless)));
        assert!(parse_mode("bogus").is_err());
    }

    #[test]
    fn test_parse_isolation() {
        assert!(matches!(
            parse_isolation("ephemeralClone"),
            Ok(WorkspaceIsolation::EphemeralClone)
        ));
        assert!(parse_isolation("bogus").is_err());
    }
}
