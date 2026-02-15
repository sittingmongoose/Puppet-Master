//! State persistence and checkpointing system
//!
//! Handles saving and restoring orchestrator and tier state machines with:
//! - JSON serialization to .puppet-master/checkpoints/
//! - Checkpoint listing and management
//! - State recovery for resumable execution
//! - Atomic writes with backup support

use crate::types::*;
use anyhow::{Context, Result, anyhow};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// DRY:DATA:Checkpoint
/// Complete checkpoint state that can be saved/loaded
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    /// Checkpoint identifier (typically timestamp-based)
    pub id: String,
    /// When this checkpoint was created
    pub timestamp: DateTime<Utc>,
    /// Orchestrator state at checkpoint time
    pub orchestrator_state: OrchestratorState,
    /// Orchestrator execution context
    pub orchestrator_context: OrchestratorContext,
    /// State of all tiers indexed by tier ID
    pub tier_states: HashMap<String, TierContext>,
    /// Current position in execution
    pub current_position: CurrentPosition,
    /// Metadata about execution progress
    pub metadata: CheckpointMetadata,
}

// DRY:DATA:CurrentPosition
/// Current execution position
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentPosition {
    /// Current phase ID
    pub phase_id: Option<String>,
    /// Current task ID
    pub task_id: Option<String>,
    /// Current subtask ID
    pub subtask_id: Option<String>,
    /// Current iteration number
    pub iteration: u32,
}

// DRY:DATA:CheckpointMetadata
/// Checkpoint metadata for display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckpointMetadata {
    /// Project name
    pub project_name: String,
    /// Number of completed subtasks
    pub completed_subtasks: usize,
    /// Total number of subtasks
    pub total_subtasks: usize,
    /// Total iterations run
    pub iterations_run: usize,
}

// DRY:DATA:TierContext
/// Tier execution context (matches TierStateMachine internal state)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierContext {
    /// Tier state
    pub state: TierState,
    /// Tier type (Phase, Task, Subtask, Iteration)
    pub tier_type: TierType,
    /// Item ID this tier represents
    pub item_id: String,
    /// Current iteration count
    pub iteration_count: u32,
    /// Maximum allowed iterations
    pub max_iterations: u32,
    /// Last error message if any
    pub last_error: Option<String>,
}

// DRY:DATA:StatePersistence
/// State persistence manager
pub struct StatePersistence {
    /// Directory for checkpoint storage
    checkpoint_dir: PathBuf,
    /// Maximum number of checkpoints to keep
    max_checkpoints: usize,
}

impl StatePersistence {
    // DRY:FN:new
    /// Create new state persistence manager
    ///
    /// # Arguments
    /// * `checkpoint_dir` - Directory for storing checkpoints (default: .puppet-master/checkpoints)
    /// * `max_checkpoints` - Maximum checkpoints to retain (default: 10)
    pub fn new(checkpoint_dir: Option<PathBuf>, max_checkpoints: Option<usize>) -> Self {
        let checkpoint_dir =
            checkpoint_dir.unwrap_or_else(|| PathBuf::from(".puppet-master").join("checkpoints"));
        Self {
            checkpoint_dir,
            max_checkpoints: max_checkpoints.unwrap_or(10),
        }
    }

    /// Save a checkpoint with current orchestrator state
    ///
    /// # Arguments
    /// * `checkpoint` - Complete checkpoint to save
    ///
    /// # Returns
    /// Path to saved checkpoint file
    pub async fn save_checkpoint(&self, checkpoint: &Checkpoint) -> Result<PathBuf> {
        // Ensure checkpoint directory exists
        fs::create_dir_all(&self.checkpoint_dir)
            .context("Failed to create checkpoint directory")?;

        // Serialize checkpoint to JSON
        let json =
            serde_json::to_string_pretty(checkpoint).context("Failed to serialize checkpoint")?;

        // Write to file atomically using temp file + rename
        let filename = format!("{}.json", checkpoint.id);
        let checkpoint_path = self.checkpoint_dir.join(&filename);
        let temp_path = self.checkpoint_dir.join(format!("{}.tmp", checkpoint.id));

        fs::write(&temp_path, json).context("Failed to write checkpoint temp file")?;

        fs::rename(&temp_path, &checkpoint_path).context("Failed to rename checkpoint file")?;

        // Clean up old checkpoints
        self.cleanup_old_checkpoints()?;

        Ok(checkpoint_path)
    }

    /// Load a checkpoint by ID
    ///
    /// # Arguments
    /// * `id` - Checkpoint ID to load
    ///
    /// # Returns
    /// Loaded checkpoint or None if not found
    pub async fn load_checkpoint(&self, id: &str) -> Result<Option<Checkpoint>> {
        let filename = format!("{}.json", id);
        let checkpoint_path = self.checkpoint_dir.join(filename);

        if !checkpoint_path.exists() {
            return Ok(None);
        }

        let json =
            fs::read_to_string(&checkpoint_path).context("Failed to read checkpoint file")?;

        let checkpoint: Checkpoint =
            serde_json::from_str(&json).context("Failed to deserialize checkpoint")?;

        Ok(Some(checkpoint))
    }

    /// List all available checkpoints, sorted by timestamp (newest first)
    pub async fn list_checkpoints(&self) -> Result<Vec<CheckpointSummary>> {
        if !self.checkpoint_dir.exists() {
            return Ok(Vec::new());
        }

        let entries =
            fs::read_dir(&self.checkpoint_dir).context("Failed to read checkpoint directory")?;

        let mut summaries = Vec::new();

        for entry in entries {
            let entry = entry.context("Failed to read directory entry")?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }

            // Try to load checkpoint for summary
            if let Some(filename) = path.file_stem().and_then(|s| s.to_str()) {
                if let Ok(Some(checkpoint)) = self.load_checkpoint(filename).await {
                    summaries.push(CheckpointSummary {
                        id: checkpoint.id.clone(),
                        timestamp: checkpoint.timestamp,
                        position: checkpoint.current_position.clone(),
                        metadata: checkpoint.metadata.clone(),
                    });
                }
            }
        }

        // Sort by timestamp, newest first
        summaries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        Ok(summaries)
    }

    /// Delete a specific checkpoint
    ///
    /// # Arguments
    /// * `id` - Checkpoint ID to delete
    pub async fn delete_checkpoint(&self, id: &str) -> Result<()> {
        let filename = format!("{}.json", id);
        let checkpoint_path = self.checkpoint_dir.join(filename);

        if !checkpoint_path.exists() {
            return Err(anyhow!("Checkpoint not found: {}", id));
        }

        fs::remove_file(&checkpoint_path).context("Failed to delete checkpoint file")?;

        Ok(())
    }

    /// Get the most recent checkpoint
    pub async fn get_latest_checkpoint(&self) -> Result<Option<Checkpoint>> {
        let summaries = self.list_checkpoints().await?;

        if let Some(latest) = summaries.first() {
            self.load_checkpoint(&latest.id).await
        } else {
            Ok(None)
        }
    }

    /// Clean up old checkpoints, keeping only the most recent N
    fn cleanup_old_checkpoints(&self) -> Result<()> {
        let entries =
            fs::read_dir(&self.checkpoint_dir).context("Failed to read checkpoint directory")?;

        // Collect all checkpoint files with timestamps
        let mut files: Vec<(PathBuf, DateTime<Utc>)> = Vec::new();

        for entry in entries {
            let entry = entry.context("Failed to read directory entry")?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }

            // Parse timestamp from filename (format: checkpoint-TIMESTAMP)
            if let Some(filename) = path.file_stem().and_then(|s| s.to_str()) {
                if let Some(timestamp_str) = filename.strip_prefix("checkpoint-") {
                    if let Ok(timestamp) = timestamp_str.parse::<i64>() {
                        if let Some(dt) = DateTime::from_timestamp(timestamp / 1000, 0) {
                            files.push((path, dt));
                        }
                    }
                }
            }
        }

        // Sort by timestamp, newest first
        files.sort_by(|a, b| b.1.cmp(&a.1));

        // Delete old files beyond max_checkpoints
        for (path, _) in files.iter().skip(self.max_checkpoints) {
            let _ = fs::remove_file(path); // Ignore errors
        }

        Ok(())
    }
}

// DRY:DATA:CheckpointSummary
/// Summary of a checkpoint for listing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckpointSummary {
    /// Checkpoint ID
    pub id: String,
    /// When checkpoint was created
    pub timestamp: DateTime<Utc>,
    /// Current execution position
    pub position: CurrentPosition,
    /// Progress metadata
    pub metadata: CheckpointMetadata,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_checkpoint(id: &str) -> Checkpoint {
        Checkpoint {
            id: id.to_string(),
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
        }
    }

    #[tokio::test]
    async fn test_save_and_load_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), None);

        let checkpoint = create_test_checkpoint("test-checkpoint-001");

        // Save checkpoint
        persistence.save_checkpoint(&checkpoint).await.unwrap();

        // Load checkpoint
        let loaded = persistence
            .load_checkpoint("test-checkpoint-001")
            .await
            .unwrap()
            .unwrap();

        assert_eq!(loaded.id, checkpoint.id);
        assert_eq!(loaded.orchestrator_state, checkpoint.orchestrator_state);
        assert_eq!(loaded.metadata.completed_subtasks, 5);
    }

    #[tokio::test]
    async fn test_list_checkpoints() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), None);

        // Save multiple checkpoints
        for i in 1..=3 {
            let checkpoint = create_test_checkpoint(&format!("checkpoint-{}", i));
            persistence.save_checkpoint(&checkpoint).await.unwrap();
        }

        // List checkpoints
        let list = persistence.list_checkpoints().await.unwrap();
        assert_eq!(list.len(), 3);
    }

    #[tokio::test]
    async fn test_delete_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), None);

        let checkpoint = create_test_checkpoint("test-checkpoint-delete");
        persistence.save_checkpoint(&checkpoint).await.unwrap();

        // Delete checkpoint
        persistence
            .delete_checkpoint("test-checkpoint-delete")
            .await
            .unwrap();

        // Verify deleted
        let loaded = persistence
            .load_checkpoint("test-checkpoint-delete")
            .await
            .unwrap();
        assert!(loaded.is_none());
    }

    #[tokio::test]
    async fn test_get_latest_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), None);

        // Save checkpoints with slight delay
        let mut checkpoints = Vec::new();
        for i in 1..=3 {
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
            let mut checkpoint = create_test_checkpoint(&format!("checkpoint-{}", i));
            checkpoint.timestamp = Utc::now();
            persistence.save_checkpoint(&checkpoint).await.unwrap();
            checkpoints.push(checkpoint);
        }

        // Get latest
        let latest = persistence.get_latest_checkpoint().await.unwrap().unwrap();

        // Should be the last one saved
        assert_eq!(latest.id, "checkpoint-3");
    }

    #[tokio::test]
    async fn test_cleanup_old_checkpoints() {
        let temp_dir = TempDir::new().unwrap();
        // Set max to 3
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), Some(3));

        // Save 5 checkpoints
        for i in 1..=5 {
            let timestamp = Utc::now().timestamp_millis() + (i * 1000);
            let checkpoint = create_test_checkpoint(&format!("checkpoint-{}", timestamp));
            persistence.save_checkpoint(&checkpoint).await.unwrap();
        }

        // Should only have 3 checkpoints left
        let list = persistence.list_checkpoints().await.unwrap();
        assert_eq!(list.len(), 3);
    }

    #[tokio::test]
    async fn test_load_nonexistent_checkpoint() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = StatePersistence::new(Some(temp_dir.path().to_path_buf()), None);

        let result = persistence.load_checkpoint("nonexistent").await.unwrap();
        assert!(result.is_none());
    }
}
