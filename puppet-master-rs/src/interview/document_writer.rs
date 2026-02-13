//! Writes per-phase documents and the final master document.

use anyhow::{Context, Result};
use chrono::Utc;
use log::info;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

use super::phase_manager::InterviewPhaseDefinition;
use super::state::{Decision, InterviewQA};

/// Writes interview output documents.
pub struct DocumentWriter;

/// A completed phase with its associated data, used for master document generation.
#[derive(Debug, Clone)]
pub struct CompletedPhase {
    pub definition: InterviewPhaseDefinition,
    pub decisions: Vec<Decision>,
    pub qa_history: Vec<InterviewQA>,
    pub document_path: PathBuf,
}

/// Structured JSON output compatible with the Ralph loop.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonOutput {
    project: String,
    metadata: JsonMetadata,
    technical_decisions: Vec<JsonDecision>,
    phases: Vec<JsonPhase>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonMetadata {
    timestamp: String,
    total_phases: usize,
    total_questions: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonDecision {
    phase: String,
    summary: String,
    reasoning: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonPhase {
    id: String,
    name: String,
    questions_answered: usize,
    decisions_count: usize,
}

impl DocumentWriter {
    /// Writes a markdown document for a single completed phase.
    ///
    /// Returns the path to the written file.
    ///
    /// # Arguments
    /// * `phase` - Phase definition
    /// * `decisions` - Decisions made during this phase
    /// * `qa_history` - Q&A history for this phase
    /// * `output_dir` - Output directory
    /// * `phase_number` - The sequential phase number (1-based)
    pub fn write_phase_document(
        phase: &InterviewPhaseDefinition,
        decisions: &[Decision],
        qa_history: &[InterviewQA],
        output_dir: &Path,
        phase_number: usize,
    ) -> Result<PathBuf> {
        fs::create_dir_all(output_dir)
            .with_context(|| format!("Failed to create output dir {}", output_dir.display()))?;

        let filename = format!(
            "phase-{:02}-{}.md",
            phase_number,
            phase.id.replace('_', "-")
        );
        let path = output_dir.join(&filename);

        let mut content = String::new();
        content.push_str(&format!("# Phase: {}\n\n", phase.name));
        content.push_str(&format!("**Domain:** {}\n\n", phase.domain));
        content.push_str(&format!("**Description:** {}\n\n", phase.description));
        content.push_str("---\n\n");

        // Decisions
        if !decisions.is_empty() {
            content.push_str("## Decisions\n\n");
            for (i, decision) in decisions.iter().enumerate() {
                content.push_str(&format!(
                    "{}. **{}**\n   - Reasoning: {}\n\n",
                    i + 1,
                    decision.summary,
                    decision.reasoning
                ));
            }
        }

        // Q&A history
        if !qa_history.is_empty() {
            content.push_str("## Questions & Answers\n\n");
            for (i, qa) in qa_history.iter().enumerate() {
                content.push_str(&format!(
                    "### Q{}: {}\n\n**Answer:** {}\n\n",
                    i + 1,
                    qa.question,
                    qa.answer
                ));
            }
        }

        fs::write(&path, &content)
            .with_context(|| format!("Failed to write phase document to {}", path.display()))?;

        info!("Wrote phase document: {}", path.display());
        Ok(path)
    }

    /// Writes the master requirements document that references all phase documents.
    pub fn write_master_document(
        all_phases: &[CompletedPhase],
        project_name: &str,
        output_dir: &Path,
    ) -> Result<PathBuf> {
        fs::create_dir_all(output_dir)
            .with_context(|| format!("Failed to create output dir {}", output_dir.display()))?;

        let path = output_dir.join("requirements-complete.md");
        let timestamp = Utc::now().to_rfc3339();
        let total_questions: usize = all_phases.iter().map(|p| p.qa_history.len()).sum();

        let mut content = String::new();
        content.push_str(&format!("# Requirements Specification: {project_name}\n\n"));
        content.push_str("## Interview Summary\n\n");
        content.push_str(&format!("- **Date:** {timestamp}\n"));
        content.push_str(&format!("- **Phases completed:** {}\n", all_phases.len()));
        content.push_str(&format!("- **Questions asked:** {total_questions}\n\n"));

        // Phase links
        content.push_str("## Domain Specifications\n\n");
        for phase in all_phases {
            let filename = phase
                .document_path
                .file_name()
                .and_then(|f| f.to_str())
                .unwrap_or("unknown.md");
            content.push_str(&format!("- [{}]({})\n", phase.definition.name, filename));
        }
        content.push('\n');

        // Decisions log
        let all_decisions: Vec<&Decision> = all_phases.iter().flat_map(|p| &p.decisions).collect();
        if !all_decisions.is_empty() {
            content.push_str("## Decisions Log\n\n");
            for decision in &all_decisions {
                content.push_str(&format!(
                    "- **[{}]** {} _{}_\n",
                    decision.phase, decision.summary, decision.reasoning
                ));
            }
            content.push('\n');
        }

        fs::write(&path, &content)
            .with_context(|| format!("Failed to write master document to {}", path.display()))?;

        info!("Wrote master document: {}", path.display());
        Ok(path)
    }

    /// Writes a structured JSON output file compatible with the Ralph loop.
    pub fn write_json_output(
        all_phases: &[CompletedPhase],
        project_name: &str,
        output_dir: &Path,
    ) -> Result<PathBuf> {
        fs::create_dir_all(output_dir)
            .with_context(|| format!("Failed to create output dir {}", output_dir.display()))?;

        let path = output_dir.join("requirements-complete.json");

        let total_questions: usize = all_phases.iter().map(|p| p.qa_history.len()).sum();
        let technical_decisions: Vec<JsonDecision> = all_phases
            .iter()
            .flat_map(|p| {
                p.decisions.iter().map(|d| JsonDecision {
                    phase: d.phase.clone(),
                    summary: d.summary.clone(),
                    reasoning: d.reasoning.clone(),
                })
            })
            .collect();

        let phases: Vec<JsonPhase> = all_phases
            .iter()
            .map(|p| JsonPhase {
                id: p.definition.id.clone(),
                name: p.definition.name.clone(),
                questions_answered: p.qa_history.len(),
                decisions_count: p.decisions.len(),
            })
            .collect();

        let output = JsonOutput {
            project: project_name.to_string(),
            metadata: JsonMetadata {
                timestamp: Utc::now().to_rfc3339(),
                total_phases: all_phases.len(),
                total_questions,
            },
            technical_decisions,
            phases,
        };

        let json =
            serde_json::to_string_pretty(&output).context("Failed to serialize JSON output")?;

        fs::write(&path, &json)
            .with_context(|| format!("Failed to write JSON output to {}", path.display()))?;

        info!("Wrote JSON output: {}", path.display());
        Ok(path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn sample_phase() -> InterviewPhaseDefinition {
        InterviewPhaseDefinition {
            id: "scope_goals".to_string(),
            domain: "Scope & Goals".to_string(),
            name: "Scope & Goals".to_string(),
            description: "Project scope".to_string(),
            min_questions: 3,
            max_questions: 8,
        }
    }

    fn sample_qa() -> Vec<InterviewQA> {
        vec![InterviewQA {
            question: "What is the goal?".to_string(),
            answer: "Build a dashboard".to_string(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        }]
    }

    fn sample_decisions() -> Vec<Decision> {
        vec![Decision {
            phase: "scope_goals".to_string(),
            summary: "Target web first".to_string(),
            reasoning: "Fastest to deploy".to_string(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        }]
    }

    #[test]
    fn test_write_phase_document() {
        let dir = TempDir::new().unwrap();
        let phase = sample_phase();
        let path = DocumentWriter::write_phase_document(
            &phase,
            &sample_decisions(),
            &sample_qa(),
            dir.path(),
            1, // Phase number
        )
        .unwrap();
        assert!(path.exists());
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.contains("Scope & Goals"));
        assert!(content.contains("Build a dashboard"));
        assert!(content.contains("Target web first"));
    }

    #[test]
    fn test_write_master_document() {
        let dir = TempDir::new().unwrap();
        let phase = sample_phase();
        let doc_path = DocumentWriter::write_phase_document(
            &phase,
            &sample_decisions(),
            &sample_qa(),
            dir.path(),
            1, // Phase number
        )
        .unwrap();

        let completed = vec![CompletedPhase {
            definition: phase,
            decisions: sample_decisions(),
            qa_history: sample_qa(),
            document_path: doc_path,
        }];

        let master_path =
            DocumentWriter::write_master_document(&completed, "TestProject", dir.path()).unwrap();
        assert!(master_path.exists());
        let content = fs::read_to_string(&master_path).unwrap();
        assert!(content.contains("TestProject"));
        assert!(content.contains("**Phases completed:** 1"));
    }

    #[test]
    fn test_write_json_output() {
        let dir = TempDir::new().unwrap();
        let completed = vec![CompletedPhase {
            definition: sample_phase(),
            decisions: sample_decisions(),
            qa_history: sample_qa(),
            document_path: dir.path().join("phase-01-scope-goals.md"),
        }];

        let json_path =
            DocumentWriter::write_json_output(&completed, "TestProject", dir.path()).unwrap();
        assert!(json_path.exists());
        let content = fs::read_to_string(&json_path).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&content).unwrap();
        assert_eq!(parsed["project"], "TestProject");
        assert_eq!(parsed["metadata"]["totalPhases"], 1);
    }
}
