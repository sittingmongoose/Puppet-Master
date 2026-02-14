//! Project status inspector - Dynamic per-project status
//!
//! Inspects each project's .puppet-master/ state to determine:
//! - Interview status (running/paused/complete)
//! - Orchestrator status (idle/executing/paused)
//! - Last run timestamp
//! - Last checkpoint information

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Interview status derived from project state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum InterviewStatus {
    /// Interview not started
    NotStarted,
    /// Interview in progress
    Running,
    /// Interview paused
    Paused,
    /// Interview completed
    Complete,
}

/// Orchestrator status derived from project state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrchestratorStatus {
    /// Orchestrator idle (not running)
    Idle,
    /// Orchestrator executing
    Executing,
    /// Orchestrator paused
    Paused,
    /// Orchestrator failed
    Failed,
}

/// Dynamic project status based on .puppet-master/ inspection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStatus {
    /// Project path
    pub path: PathBuf,
    /// Interview status
    pub interview_status: InterviewStatus,
    /// Orchestrator status
    pub orchestrator_status: OrchestratorStatus,
    /// Last run timestamp (if any)
    pub last_run: Option<DateTime<Utc>>,
    /// Last checkpoint timestamp (if any)
    pub last_checkpoint: Option<DateTime<Utc>>,
    /// Number of checkpoints available
    pub checkpoint_count: usize,
    /// Current phase (if orchestrator is running)
    pub current_phase: Option<String>,
    /// Current task (if orchestrator is running)
    pub current_task: Option<String>,
    /// Progress percentage (0-100)
    pub progress_percent: Option<u8>,
}

impl ProjectStatus {
    /// Create a default "unknown" status
    pub fn unknown(path: PathBuf) -> Self {
        Self {
            path,
            interview_status: InterviewStatus::NotStarted,
            orchestrator_status: OrchestratorStatus::Idle,
            last_run: None,
            last_checkpoint: None,
            checkpoint_count: 0,
            current_phase: None,
            current_task: None,
            progress_percent: None,
        }
    }

    /// Get a human-readable status summary
    pub fn summary(&self) -> String {
        let interview = match self.interview_status {
            InterviewStatus::NotStarted => "Not started",
            InterviewStatus::Running => "Running",
            InterviewStatus::Paused => "Paused",
            InterviewStatus::Complete => "Complete",
        };

        let orchestrator = match self.orchestrator_status {
            OrchestratorStatus::Idle => "Idle",
            OrchestratorStatus::Executing => "Executing",
            OrchestratorStatus::Paused => "Paused",
            OrchestratorStatus::Failed => "Failed",
        };

        if let Some(progress) = self.progress_percent {
            format!(
                "Interview: {}, Orchestrator: {} ({}%)",
                interview, orchestrator, progress
            )
        } else {
            format!("Interview: {}, Orchestrator: {}", interview, orchestrator)
        }
    }
}

/// Project status inspector
pub struct ProjectStatusInspector {
    project_root: PathBuf,
    puppet_master_dir: PathBuf,
}

impl ProjectStatusInspector {
    /// Create a new status inspector for a project
    pub fn new(project_root: PathBuf) -> Self {
        let puppet_master_dir = project_root.join(".puppet-master");
        Self {
            project_root,
            puppet_master_dir,
        }
    }

    /// Inspect the project and determine its current status
    pub fn inspect(&self) -> Result<ProjectStatus> {
        // Check if .puppet-master directory exists
        if !self.puppet_master_dir.exists() {
            return Ok(ProjectStatus::unknown(self.project_root.clone()));
        }

        let mut status = ProjectStatus::unknown(self.project_root.clone());

        // Check interview status
        status.interview_status = self.inspect_interview_status()?;

        // Check orchestrator status
        status.orchestrator_status = self.inspect_orchestrator_status()?;

        // Get checkpoint information
        let (checkpoint_count, last_checkpoint) = self.inspect_checkpoints()?;
        status.checkpoint_count = checkpoint_count;
        status.last_checkpoint = last_checkpoint;

        // Get last run timestamp from checkpoints or logs
        status.last_run = self.get_last_run_timestamp()?;

        // Get current execution position if orchestrator is active
        if matches!(
            status.orchestrator_status,
            OrchestratorStatus::Executing | OrchestratorStatus::Paused
        ) {
            if let Ok((phase, task, progress)) = self.get_current_position() {
                status.current_phase = phase;
                status.current_task = task;
                status.progress_percent = progress;
            }
        }

        Ok(status)
    }

    /// Inspect interview status from state files
    fn inspect_interview_status(&self) -> Result<InterviewStatus> {
        let interview_dir = self.puppet_master_dir.join("interview");
        let complete_md = interview_dir.join("requirements-complete.md");
        let state_yaml = interview_dir.join("state.yaml");

        if complete_md.exists() {
            return Ok(InterviewStatus::Complete);
        }

        if state_yaml.exists() {
            // We don't currently persist a separate paused flag cross-project.
            return Ok(InterviewStatus::Running);
        }

        Ok(InterviewStatus::NotStarted)
    }

    /// Inspect orchestrator status from the latest checkpoint (best-effort).
    fn inspect_orchestrator_status(&self) -> Result<OrchestratorStatus> {
        let checkpoints_dir = self.puppet_master_dir.join("checkpoints");

        if !checkpoints_dir.exists() {
            return Ok(OrchestratorStatus::Idle);
        }

        let mut checkpoint_files: Vec<_> = fs::read_dir(&checkpoints_dir)?
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.path())
            .filter(|path| path.is_file() && path.extension().map_or(false, |e| e == "json"))
            .collect();

        checkpoint_files.sort_by_key(|path| {
            fs::metadata(path)
                .and_then(|meta| meta.modified())
                .ok()
        });

        let Some(latest_checkpoint) = checkpoint_files.last() else {
            return Ok(OrchestratorStatus::Idle);
        };

        let content = fs::read_to_string(latest_checkpoint)
            .context("Failed to read checkpoint file")?;

        #[derive(Deserialize)]
        struct CheckpointStatus {
            #[serde(default)]
            orchestrator_state: Option<String>,
        }

        let checkpoint: CheckpointStatus = serde_json::from_str(&content)
            .context("Failed to parse checkpoint")?;

        let Some(state) = checkpoint.orchestrator_state else {
            return Ok(OrchestratorStatus::Idle);
        };

        match state.as_str() {
            "idle" | "Idle" | "" => Ok(OrchestratorStatus::Idle),
            "planning" | "Planning" | "executing" | "Executing" => Ok(OrchestratorStatus::Executing),
            "paused" | "Paused" => Ok(OrchestratorStatus::Paused),
            "error" | "Error" => Ok(OrchestratorStatus::Failed),
            "complete" | "Complete" => Ok(OrchestratorStatus::Idle),
            _ => Ok(OrchestratorStatus::Idle),
        }
    }

    /// Inspect checkpoint directory
    fn inspect_checkpoints(&self) -> Result<(usize, Option<DateTime<Utc>>)> {
        let checkpoints_dir = self.puppet_master_dir.join("checkpoints");

        if !checkpoints_dir.exists() {
            return Ok((0, None));
        }

        let mut checkpoint_files = Vec::new();

        for entry in fs::read_dir(&checkpoints_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() && path.extension().map_or(false, |e| e == "json") {
                checkpoint_files.push(path);
            }
        }

        let count = checkpoint_files.len();

        // Find the most recent checkpoint by modification time
        let last_checkpoint = checkpoint_files
            .iter()
            .filter_map(|path| {
                fs::metadata(path).ok().and_then(|meta| {
                    meta.modified()
                        .ok()
                        .map(|time| DateTime::<Utc>::from(time))
                })
            })
            .max();

        Ok((count, last_checkpoint))
    }

    /// Get last run timestamp from various sources
    fn get_last_run_timestamp(&self) -> Result<Option<DateTime<Utc>>> {
        // Try to get from logs directory
        let logs_dir = self.puppet_master_dir.join("logs");

        if !logs_dir.exists() {
            return Ok(None);
        }

        let mut last_modified: Option<DateTime<Utc>> = None;

        for entry in fs::read_dir(&logs_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                if let Ok(meta) = fs::metadata(&path) {
                    if let Ok(modified) = meta.modified() {
                        let timestamp = DateTime::<Utc>::from(modified);
                        if last_modified.is_none() || timestamp > last_modified.unwrap() {
                            last_modified = Some(timestamp);
                        }
                    }
                }
            }
        }

        Ok(last_modified)
    }

    /// Get current execution position from the latest checkpoint
    fn get_current_position(&self) -> Result<(Option<String>, Option<String>, Option<u8>)> {
        let checkpoints_dir = self.puppet_master_dir.join("checkpoints");

        if !checkpoints_dir.exists() {
            return Ok((None, None, None));
        }

        // Find the most recent checkpoint file
        let mut checkpoint_files: Vec<_> = fs::read_dir(&checkpoints_dir)?
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.path())
            .filter(|path| path.is_file() && path.extension().map_or(false, |e| e == "json"))
            .collect();

        checkpoint_files.sort_by_key(|path| {
            fs::metadata(path)
                .and_then(|meta| meta.modified())
                .ok()
        });

        if let Some(latest_checkpoint) = checkpoint_files.last() {
            let content = fs::read_to_string(latest_checkpoint)
                .context("Failed to read checkpoint file")?;

            #[derive(Deserialize)]
            struct CheckpointData {
                #[serde(default)]
                current_position: Option<CurrentPosition>,
                #[serde(default)]
                metadata: Option<Metadata>,
            }

            #[derive(Deserialize)]
            struct CurrentPosition {
                phase_id: Option<String>,
                task_id: Option<String>,
            }

            #[derive(Deserialize)]
            struct Metadata {
                completed_subtasks: Option<usize>,
                total_subtasks: Option<usize>,
            }

            let checkpoint: CheckpointData = serde_json::from_str(&content)
                .context("Failed to parse checkpoint")?;

            let phase = checkpoint
                .current_position
                .as_ref()
                .and_then(|p| p.phase_id.clone());

            let task = checkpoint
                .current_position
                .as_ref()
                .and_then(|p| p.task_id.clone());

            let progress = checkpoint.metadata.and_then(|meta| {
                if let (Some(completed), Some(total)) =
                    (meta.completed_subtasks, meta.total_subtasks)
                {
                    if total > 0 {
                        Some(((completed * 100) / total).min(100) as u8)
                    } else {
                        None
                    }
                } else {
                    None
                }
            });

            return Ok((phase, task, progress));
        }

        Ok((None, None, None))
    }

    /// Get the .puppet-master directory path
    pub fn puppet_master_dir(&self) -> &Path {
        &self.puppet_master_dir
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_project() -> TempDir {
        TempDir::new().unwrap()
    }

    fn setup_puppet_master_dir(root: &Path) -> PathBuf {
        let pm_dir = root.join(".puppet-master");
        fs::create_dir_all(&pm_dir).unwrap();
        pm_dir
    }

    #[test]
    fn test_project_status_unknown() {
        let temp_dir = create_test_project();
        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());

        let status = inspector.inspect().unwrap();
        assert_eq!(status.interview_status, InterviewStatus::NotStarted);
        assert_eq!(status.orchestrator_status, OrchestratorStatus::Idle);
        assert!(status.last_run.is_none());
        assert!(status.last_checkpoint.is_none());
        assert_eq!(status.checkpoint_count, 0);
    }

    #[test]
    fn test_inspect_interview_status_not_started() {
        let temp_dir = create_test_project();
        let _pm_dir = setup_puppet_master_dir(temp_dir.path());
        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());

        let status = inspector.inspect_interview_status().unwrap();
        assert_eq!(status, InterviewStatus::NotStarted);
    }

    #[test]
    fn test_inspect_interview_status_running() {
        let temp_dir = create_test_project();
        let pm_dir = setup_puppet_master_dir(temp_dir.path());
        let interview_dir = pm_dir.join("interview");
        fs::create_dir_all(&interview_dir).unwrap();

        fs::write(interview_dir.join("state.yaml"), "# state\n").unwrap();

        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());
        let status = inspector.inspect_interview_status().unwrap();
        assert_eq!(status, InterviewStatus::Running);
    }

    #[test]
    fn test_inspect_interview_status_complete() {
        let temp_dir = create_test_project();
        let pm_dir = setup_puppet_master_dir(temp_dir.path());
        let interview_dir = pm_dir.join("interview");
        fs::create_dir_all(&interview_dir).unwrap();

        fs::write(
            interview_dir.join("requirements-complete.md"),
            "# Requirements\n",
        )
        .unwrap();

        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());
        let status = inspector.inspect_interview_status().unwrap();
        assert_eq!(status, InterviewStatus::Complete);
    }

    #[test]
    fn test_inspect_orchestrator_status_idle() {
        let temp_dir = create_test_project();
        let _pm_dir = setup_puppet_master_dir(temp_dir.path());
        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());

        let status = inspector.inspect_orchestrator_status().unwrap();
        assert_eq!(status, OrchestratorStatus::Idle);
    }

    #[test]
    fn test_inspect_orchestrator_status_executing() {
        let temp_dir = create_test_project();
        let pm_dir = setup_puppet_master_dir(temp_dir.path());
        let checkpoints_dir = pm_dir.join("checkpoints");
        fs::create_dir_all(&checkpoints_dir).unwrap();

        fs::write(
            checkpoints_dir.join("checkpoint1.json"),
            r#"{"orchestrator_state":"executing"}"#,
        )
        .unwrap();

        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());
        let status = inspector.inspect_orchestrator_status().unwrap();
        assert_eq!(status, OrchestratorStatus::Executing);
    }

    #[test]
    fn test_inspect_checkpoints() {
        let temp_dir = create_test_project();
        let pm_dir = setup_puppet_master_dir(temp_dir.path());
        let checkpoints_dir = pm_dir.join("checkpoints");
        fs::create_dir_all(&checkpoints_dir).unwrap();

        // Create checkpoint files
        fs::write(checkpoints_dir.join("checkpoint1.json"), r#"{}"#).unwrap();
        fs::write(checkpoints_dir.join("checkpoint2.json"), r#"{}"#).unwrap();

        let inspector = ProjectStatusInspector::new(temp_dir.path().to_path_buf());
        let (count, last_checkpoint) = inspector.inspect_checkpoints().unwrap();
        assert_eq!(count, 2);
        assert!(last_checkpoint.is_some());
    }

    #[test]
    fn test_status_summary() {
        let status = ProjectStatus {
            path: PathBuf::from("/test"),
            interview_status: InterviewStatus::Complete,
            orchestrator_status: OrchestratorStatus::Executing,
            last_run: None,
            last_checkpoint: None,
            checkpoint_count: 5,
            current_phase: Some("Phase 1".to_string()),
            current_task: Some("Task A".to_string()),
            progress_percent: Some(45),
        };

        let summary = status.summary();
        assert!(summary.contains("Interview: Complete"));
        assert!(summary.contains("Orchestrator: Executing"));
        assert!(summary.contains("45%"));
    }
}
