//! Higher-level checkpoint management with policies
//!
//! Wraps StatePersistence with:
//! - Auto-checkpoint intervals
//! - Retention policies
//! - Recovery detection
//! - Resumption support

use super::state_persistence::{
    Checkpoint, CheckpointMetadata, CheckpointSummary, CurrentPosition, StatePersistence,
    TierContext,
};
use crate::types::*;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::path::PathBuf;

/// Configuration for checkpoint manager
#[derive(Debug, Clone)]
pub struct CheckpointManagerConfig {
    /// Directory for checkpoint storage
    pub checkpoint_dir: PathBuf,
    /// Maximum checkpoints to keep
    pub max_checkpoints: usize,
    /// Auto-checkpoint interval in seconds (0 = disabled)
    pub auto_checkpoint_interval_secs: u64,
}

impl Default for CheckpointManagerConfig {
    fn default() -> Self {
        Self {
            checkpoint_dir: PathBuf::from(".puppet-master").join("checkpoints"),
            max_checkpoints: 10,
            auto_checkpoint_interval_secs: 300, // 5 minutes
        }
    }
}

/// Recovery information for resumable runs
#[derive(Debug, Clone)]
pub struct RecoveryInfo {
    /// The checkpoint that can be resumed
    pub checkpoint: Checkpoint,
    /// Human-readable reason for recovery
    pub reason: String,
    /// Whether the run is actually recoverable
    pub recoverable: bool,
}

/// High-level checkpoint manager with policy enforcement
pub struct CheckpointManager {
    /// Configuration
    config: CheckpointManagerConfig,
    /// Underlying state persistence
    persistence: StatePersistence,
    /// Last checkpoint timestamp
    last_checkpoint: Option<DateTime<Utc>>,
}

impl CheckpointManager {
    /// Create new checkpoint manager
    pub fn new(config: CheckpointManagerConfig) -> Self {
        let persistence = StatePersistence::new(
            Some(config.checkpoint_dir.clone()),
            Some(config.max_checkpoints),
        );

        Self {
            config,
            persistence,
            last_checkpoint: None,
        }
    }

    /// Create checkpoint with current orchestrator state
    ///
    /// # Arguments
    /// * `orchestrator_state` - Current orchestrator state
    /// * `orchestrator_context` - Current orchestrator context
    /// * `tier_states` - Current tier states
    /// * `position` - Current execution position
    /// * `metadata` - Checkpoint metadata
    ///
    /// # Returns
    /// Checkpoint ID
    pub async fn create(
        &mut self,
        orchestrator_state: OrchestratorState,
        orchestrator_context: OrchestratorContext,
        tier_states: HashMap<String, TierContext>,
        position: CurrentPosition,
        metadata: CheckpointMetadata,
    ) -> Result<String> {
        let timestamp = Utc::now();
        let checkpoint_id = format!("checkpoint-{}", timestamp.timestamp_millis());

        let checkpoint = Checkpoint {
            id: checkpoint_id.clone(),
            timestamp,
            orchestrator_state,
            orchestrator_context,
            tier_states,
            current_position: position,
            metadata,
        };

        self.persistence
            .save_checkpoint(&checkpoint)
            .await
            .context("Failed to save checkpoint")?;

        self.last_checkpoint = Some(timestamp);

        Ok(checkpoint_id)
    }

    /// Load checkpoint by ID
    pub async fn load(&self, id: &str) -> Result<Option<Checkpoint>> {
        self.persistence.load_checkpoint(id).await
    }

    /// List all checkpoints
    pub async fn list(&self) -> Result<Vec<CheckpointSummary>> {
        self.persistence.list_checkpoints().await
    }

    /// Delete checkpoint by ID
    pub async fn delete(&self, id: &str) -> Result<()> {
        self.persistence.delete_checkpoint(id).await
    }

    /// Get the most recent checkpoint
    pub async fn get_latest(&self) -> Result<Option<Checkpoint>> {
        self.persistence.get_latest_checkpoint().await
    }

    /// Check if auto-checkpoint should be created
    ///
    /// Returns true if enough time has elapsed since last checkpoint
    pub fn should_auto_checkpoint(&self) -> bool {
        if self.config.auto_checkpoint_interval_secs == 0 {
            return false;
        }

        if let Some(last) = self.last_checkpoint {
            let elapsed = Utc::now().signed_duration_since(last).num_seconds() as u64;
            elapsed >= self.config.auto_checkpoint_interval_secs
        } else {
            true // First checkpoint
        }
    }

    /// Check for incomplete runs that can be recovered
    ///
    /// Returns recovery info if there's a checkpoint that can be resumed
    pub async fn check_for_recovery(&self) -> Result<Option<RecoveryInfo>> {
        let latest = self.get_latest().await?;

        if let Some(checkpoint) = latest {
            // Check if the run was incomplete
            let recoverable = matches!(
                checkpoint.orchestrator_state,
                OrchestratorState::Executing
                    | OrchestratorState::Planning
                    | OrchestratorState::Paused
            );

            if recoverable || checkpoint.orchestrator_state == OrchestratorState::Error {
                let reason = format!(
                    "Found incomplete run in state '{}' at position: phase={}, task={}, subtask={}",
                    checkpoint.orchestrator_state,
                    checkpoint
                        .current_position
                        .phase_id
                        .as_deref()
                        .unwrap_or("none"),
                    checkpoint
                        .current_position
                        .task_id
                        .as_deref()
                        .unwrap_or("none"),
                    checkpoint
                        .current_position
                        .subtask_id
                        .as_deref()
                        .unwrap_or("none"),
                );

                return Ok(Some(RecoveryInfo {
                    checkpoint,
                    reason,
                    recoverable,
                }));
            }
        }

        Ok(None)
    }

    /// Get recovery suggestions for a checkpoint
    pub fn get_recovery_suggestions(&self, checkpoint: &Checkpoint) -> Vec<String> {
        let mut suggestions = Vec::new();
        let pos = &checkpoint.current_position;

        match checkpoint.orchestrator_state {
            OrchestratorState::Executing
            | OrchestratorState::Planning
            | OrchestratorState::Paused => {
                suggestions.push(format!(
                    "Resume from checkpoint: puppet-master resume {}",
                    checkpoint.id
                ));
                suggestions
                    .push("Or restart with fresh state: puppet-master run --no-resume".to_string());
            }
            OrchestratorState::Error => {
                suggestions.push("Previous run failed. Review logs before resuming.".to_string());
                suggestions.push(format!(
                    "Attempt recovery: puppet-master resume {}",
                    checkpoint.id
                ));
            }
            _ => {}
        }

        // Position-specific suggestions
        if let Some(subtask_id) = &pos.subtask_id {
            suggestions.push(format!(
                "Rerun current subtask: puppet-master run --from-subtask {}",
                subtask_id
            ));
        } else if let Some(task_id) = &pos.task_id {
            suggestions.push(format!(
                "Rerun current task: puppet-master run --from-task {}",
                task_id
            ));
        } else if let Some(phase_id) = &pos.phase_id {
            suggestions.push(format!(
                "Rerun current phase: puppet-master run --from-phase {}",
                phase_id
            ));
        }

        // Progress info
        if checkpoint.metadata.total_subtasks > 0 {
            let progress = (checkpoint.metadata.completed_subtasks as f64
                / checkpoint.metadata.total_subtasks as f64
                * 100.0) as usize;
            suggestions.push(format!(
                "Progress: {}/{} subtasks completed ({}%)",
                checkpoint.metadata.completed_subtasks,
                checkpoint.metadata.total_subtasks,
                progress
            ));
        }

        suggestions
    }

    /// Update last checkpoint time (for tracking)
    pub fn update_last_checkpoint_time(&mut self) {
        self.last_checkpoint = Some(Utc::now());
    }

    /// Get time since last checkpoint
    pub fn time_since_last_checkpoint(&self) -> Option<i64> {
        self.last_checkpoint
            .map(|last| Utc::now().signed_duration_since(last).num_seconds())
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_config(checkpoint_dir: PathBuf) -> CheckpointManagerConfig {
        CheckpointManagerConfig {
            checkpoint_dir,
            max_checkpoints: 5,
            auto_checkpoint_interval_secs: 60,
        }
    }

    #[tokio::test]
    async fn test_create_and_load_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let mut manager = CheckpointManager::new(config);

        let checkpoint_id = manager
            .create(
                OrchestratorState::Executing,
                OrchestratorContext::default(),
                HashMap::new(),
                CurrentPosition {
                    phase_id: Some("1".to_string()),
                    task_id: Some("1.1".to_string()),
                    subtask_id: Some("1.1.1".to_string()),
                    iteration: 1,
                },
                CheckpointMetadata {
                    project_name: "test".to_string(),
                    completed_subtasks: 5,
                    total_subtasks: 10,
                    iterations_run: 15,
                },
            )
            .await
            .unwrap();

        let loaded = manager.load(&checkpoint_id).await.unwrap().unwrap();
        assert_eq!(loaded.orchestrator_state, OrchestratorState::Executing);
        assert_eq!(loaded.metadata.completed_subtasks, 5);
    }

    #[tokio::test]
    async fn test_list_checkpoints() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let mut manager = CheckpointManager::new(config);

        // Create multiple checkpoints
        for i in 0..3 {
            // Add delay to ensure unique timestamps
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
            manager
                .create(
                    OrchestratorState::Executing,
                    OrchestratorContext::default(),
                    HashMap::new(),
                    CurrentPosition {
                        phase_id: Some(format!("{}", i + 1)),
                        task_id: None,
                        subtask_id: None,
                        iteration: 0,
                    },
                    CheckpointMetadata {
                        project_name: format!("test-{}", i),
                        completed_subtasks: i,
                        total_subtasks: 10,
                        iterations_run: i * 2,
                    },
                )
                .await
                .unwrap();
        }

        let list = manager.list().await.unwrap();
        assert_eq!(list.len(), 3);
    }

    #[tokio::test]
    async fn test_get_latest_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let mut manager = CheckpointManager::new(config);

        // Create checkpoints
        for i in 0..3 {
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
            manager
                .create(
                    OrchestratorState::Executing,
                    OrchestratorContext::default(),
                    HashMap::new(),
                    CurrentPosition {
                        phase_id: Some(format!("{}", i + 1)),
                        task_id: None,
                        subtask_id: None,
                        iteration: i as u32,
                    },
                    CheckpointMetadata {
                        project_name: format!("test-{}", i),
                        completed_subtasks: i,
                        total_subtasks: 10,
                        iterations_run: 0,
                    },
                )
                .await
                .unwrap();
        }

        let latest = manager.get_latest().await.unwrap().unwrap();
        assert_eq!(latest.current_position.iteration, 2);
    }

    #[tokio::test]
    async fn test_check_for_recovery() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let mut manager = CheckpointManager::new(config);

        // Create incomplete checkpoint
        manager
            .create(
                OrchestratorState::Executing,
                OrchestratorContext::default(),
                HashMap::new(),
                CurrentPosition {
                    phase_id: Some("1".to_string()),
                    task_id: Some("1.1".to_string()),
                    subtask_id: Some("1.1.1".to_string()),
                    iteration: 1,
                },
                CheckpointMetadata {
                    project_name: "test".to_string(),
                    completed_subtasks: 5,
                    total_subtasks: 10,
                    iterations_run: 15,
                },
            )
            .await
            .unwrap();

        let recovery = manager.check_for_recovery().await.unwrap();
        assert!(recovery.is_some());

        let info = recovery.unwrap();
        assert!(info.recoverable);
        assert!(info.reason.contains("Executing"));
    }

    #[tokio::test]
    async fn test_should_auto_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let mut config = create_test_config(temp_dir.path().to_path_buf());
        config.auto_checkpoint_interval_secs = 1; // 1 second for testing

        let mut manager = CheckpointManager::new(config);

        // Should checkpoint initially
        assert!(manager.should_auto_checkpoint());

        // Update last checkpoint time
        manager.update_last_checkpoint_time();

        // Should not checkpoint immediately
        assert!(!manager.should_auto_checkpoint());

        // Wait for interval
        tokio::time::sleep(tokio::time::Duration::from_millis(1100)).await;

        // Should checkpoint again
        assert!(manager.should_auto_checkpoint());
    }

    #[tokio::test]
    async fn test_recovery_suggestions() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let manager = CheckpointManager::new(config);

        let checkpoint = Checkpoint {
            id: "test-checkpoint".to_string(),
            timestamp: Utc::now(),
            orchestrator_state: OrchestratorState::Executing,
            orchestrator_context: OrchestratorContext::default(),
            tier_states: HashMap::new(),
            current_position: CurrentPosition {
                phase_id: Some("1".to_string()),
                task_id: Some("1.1".to_string()),
                subtask_id: Some("1.1.1".to_string()),
                iteration: 1,
            },
            metadata: CheckpointMetadata {
                project_name: "test".to_string(),
                completed_subtasks: 5,
                total_subtasks: 10,
                iterations_run: 15,
            },
        };

        let suggestions = manager.get_recovery_suggestions(&checkpoint);

        assert!(!suggestions.is_empty());
        assert!(
            suggestions
                .iter()
                .any(|s| s.contains("Resume from checkpoint"))
        );
        assert!(suggestions.iter().any(|s| s.contains("Progress")));
    }

    #[tokio::test]
    async fn test_time_since_last_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let config = create_test_config(temp_dir.path().to_path_buf());
        let mut manager = CheckpointManager::new(config);

        // No checkpoint yet
        assert!(manager.time_since_last_checkpoint().is_none());

        // Update checkpoint time
        manager.update_last_checkpoint_time();

        // Should have time since checkpoint
        assert!(manager.time_since_last_checkpoint().is_some());

        // Wait a bit
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        // Time should be >= 0 (just created, so might be 0 or slightly > 0)
        let elapsed = manager.time_since_last_checkpoint().unwrap();
        assert!(elapsed >= 0);
    }
}
