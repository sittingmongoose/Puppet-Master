//! Interview state persistence with YAML save/resume.
//!
//! Adapted from LISA's `state.ts` with extensions for multi-phase
//! domain interviews and decision tracking.

use anyhow::{Context, Result};
use chrono::Utc;
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Current state format version for migrations.
const CURRENT_STATE_VERSION: u32 = 1;

/// Interview phase lifecycle.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum InterviewPhase {
    /// Initial exploration of the feature.
    Exploring,
    /// Active questioning within a domain phase.
    Questioning,
    /// Generating output documents.
    Generating,
}

impl std::fmt::Display for InterviewPhase {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Exploring => write!(f, "exploring"),
            Self::Questioning => write!(f, "questioning"),
            Self::Generating => write!(f, "generating"),
        }
    }
}

/// A single question-answer pair in the interview history.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewQA {
    /// The question asked by the AI.
    pub question: String,
    /// The user's answer.
    pub answer: String,
    /// ISO-8601 timestamp when the answer was provided.
    pub timestamp: String,
}

/// A key decision made during the interview.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Decision {
    /// Which domain phase this decision was made in.
    pub phase: String,
    /// Summary of the decision.
    pub summary: String,
    /// Reasoning or context for the decision.
    pub reasoning: String,
    /// ISO-8601 timestamp.
    pub timestamp: String,
}

/// Full interview state that can be saved and restored.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewState {
    /// State format version for future migrations.
    pub version: u32,
    /// The feature being planned.
    pub feature: String,
    /// Current AI provider name.
    pub provider: String,
    /// Whether first-principles mode is enabled.
    pub first_principles: bool,
    /// Context files provided by the user.
    pub context_files: Vec<String>,
    /// ISO-8601 timestamp when the interview started.
    pub started_at: String,
    /// ISO-8601 timestamp of the last update.
    pub updated_at: String,
    /// Current lifecycle phase.
    pub phase: InterviewPhase,
    /// Index of the current domain phase (0-based into the phase list).
    pub current_domain_phase: usize,
    /// History of question/answer pairs.
    pub history: Vec<InterviewQA>,
    /// Accumulated AI context/notes.
    pub ai_context: String,
    /// IDs of domain phases that are completed.
    pub completed_phases: Vec<String>,
    /// Key decisions made during the interview.
    pub decisions: Vec<Decision>,
}

/// Creates a new interview state with sensible defaults.
pub fn create_state(
    feature: &str,
    provider: &str,
    first_principles: bool,
    context_files: Vec<String>,
) -> InterviewState {
    let now = Utc::now().to_rfc3339();
    InterviewState {
        version: CURRENT_STATE_VERSION,
        feature: feature.to_string(),
        provider: provider.to_string(),
        first_principles,
        context_files,
        started_at: now.clone(),
        updated_at: now,
        phase: InterviewPhase::Exploring,
        current_domain_phase: 0,
        history: Vec::new(),
        ai_context: String::new(),
        completed_phases: Vec::new(),
        decisions: Vec::new(),
    }
}

/// Returns the path to the interview state file within the given base directory.
fn state_path(base_dir: &Path) -> PathBuf {
    base_dir
        .join(".puppet-master")
        .join("interview")
        .join("state.yaml")
}

/// Loads an existing interview state from YAML on disk.
///
/// Returns `Ok(None)` if no state file exists. Returns an error if the
/// file exists but cannot be read or parsed.
pub fn load_state(base_dir: &Path) -> Result<Option<InterviewState>> {
    let path = state_path(base_dir);
    if !path.exists() {
        debug!("No interview state file at {}", path.display());
        return Ok(None);
    }

    let content = fs::read_to_string(&path)
        .with_context(|| format!("Failed to read interview state from {}", path.display()))?;

    let state: InterviewState = serde_yaml::from_str(&content)
        .with_context(|| format!("Failed to parse interview state YAML at {}", path.display()))?;

    info!(
        "Loaded interview state: feature={}, phase={}, domain_phase={}",
        state.feature, state.phase, state.current_domain_phase
    );

    Ok(Some(state))
}

/// Saves the interview state to YAML on disk.
///
/// Creates parent directories as needed and updates the `updated_at` timestamp.
pub fn save_state(state: &mut InterviewState, base_dir: &Path) -> Result<PathBuf> {
    let path = state_path(base_dir);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory {}", parent.display()))?;
    }

    state.updated_at = Utc::now().to_rfc3339();

    let yaml = serde_yaml::to_string(&state).context("Failed to serialize interview state")?;

    let content = format!(
        "# Puppet Master Interview State\n\
         # This file stores your interview progress. Delete to start fresh.\n\
         # DO NOT edit manually.\n\n\
         {yaml}"
    );

    fs::write(&path, &content)
        .with_context(|| format!("Failed to write interview state to {}", path.display()))?;

    debug!("Saved interview state to {}", path.display());

    Ok(path)
}

/// Removes the interview state file (cleanup after successful completion).
pub fn clear_state(base_dir: &Path) -> Result<()> {
    let path = state_path(base_dir);
    if path.exists() {
        fs::remove_file(&path)
            .with_context(|| format!("Failed to remove interview state at {}", path.display()))?;
        info!("Cleared interview state at {}", path.display());
    }
    Ok(())
}

/// Appends a question-answer pair to the state history.
pub fn add_to_history(state: &mut InterviewState, question: &str, answer: &str) {
    state.history.push(InterviewQA {
        question: question.to_string(),
        answer: answer.to_string(),
        timestamp: Utc::now().to_rfc3339(),
    });
}

/// Updates the interview phase.
pub fn update_phase(state: &mut InterviewState, phase: InterviewPhase) {
    state.phase = phase;
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_create_state() {
        let state = create_state("login page", "claude", false, vec![]);
        assert_eq!(state.version, CURRENT_STATE_VERSION);
        assert_eq!(state.feature, "login page");
        assert_eq!(state.provider, "claude");
        assert!(!state.first_principles);
        assert_eq!(state.phase, InterviewPhase::Exploring);
        assert_eq!(state.current_domain_phase, 0);
        assert!(state.history.is_empty());
        assert!(state.decisions.is_empty());
    }

    #[test]
    fn test_save_and_load_roundtrip() {
        let dir = TempDir::new().unwrap();
        let mut state = create_state("dashboard", "cursor", true, vec!["ctx.md".to_string()]);
        add_to_history(&mut state, "What is the goal?", "Build a dashboard");

        let path = save_state(&mut state, dir.path()).unwrap();
        assert!(path.exists());

        let loaded = load_state(dir.path()).unwrap().unwrap();
        assert_eq!(loaded.feature, "dashboard");
        assert_eq!(loaded.provider, "cursor");
        assert!(loaded.first_principles);
        assert_eq!(loaded.history.len(), 1);
        assert_eq!(loaded.history[0].question, "What is the goal?");
    }

    #[test]
    fn test_load_state_missing() {
        let dir = TempDir::new().unwrap();
        let loaded = load_state(dir.path()).unwrap();
        assert!(loaded.is_none());
    }

    #[test]
    fn test_clear_state() {
        let dir = TempDir::new().unwrap();
        let mut state = create_state("feat", "claude", false, vec![]);
        save_state(&mut state, dir.path()).unwrap();
        clear_state(dir.path()).unwrap();
        assert!(load_state(dir.path()).unwrap().is_none());
    }

    #[test]
    fn test_add_to_history() {
        let mut state = create_state("feat", "claude", false, vec![]);
        add_to_history(&mut state, "Q1?", "A1");
        add_to_history(&mut state, "Q2?", "A2");
        assert_eq!(state.history.len(), 2);
        assert_eq!(state.history[1].answer, "A2");
    }

    #[test]
    fn test_update_phase() {
        let mut state = create_state("feat", "claude", false, vec![]);
        assert_eq!(state.phase, InterviewPhase::Exploring);
        update_phase(&mut state, InterviewPhase::Questioning);
        assert_eq!(state.phase, InterviewPhase::Questioning);
    }
}
