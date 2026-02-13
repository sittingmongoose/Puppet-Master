//! Parallel subtask executor with dependency awareness
//!
//! Coordinates parallel execution of subtasks with:
//! - Respect for dependency ordering
//! - Configurable concurrency limits
//! - Per-task result tracking
//! - Partial failure handling

use anyhow::{Context, Result};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::Semaphore;
use tokio::task::JoinHandle;

use super::dependency_analyzer::DependencyAnalyzer;

/// Configuration for parallel executor
#[derive(Debug, Clone)]
pub struct ParallelExecutorConfig {
    /// Maximum concurrent executions
    pub max_concurrent: usize,
    /// Whether to continue after a subtask fails
    pub continue_on_failure: bool,
    /// Timeout per task in seconds (0 = no timeout)
    pub task_timeout_secs: u64,
}

impl Default for ParallelExecutorConfig {
    fn default() -> Self {
        Self {
            max_concurrent: 3,
            continue_on_failure: false,
            task_timeout_secs: 3600, // 1 hour default
        }
    }
}

/// Result of a single subtask execution
#[derive(Debug, Clone)]
pub struct SubtaskResult {
    /// Subtask ID
    pub id: String,
    /// Whether execution succeeded
    pub success: bool,
    /// Execution level in dependency graph
    pub level: usize,
    /// Execution duration in milliseconds
    pub duration_ms: u64,
    /// Error message if failed
    pub error: Option<String>,
    /// Optional output data
    pub output: Option<String>,
}

/// Result of parallel execution
#[derive(Debug, Clone)]
pub struct ParallelExecutionResult {
    /// Overall success (all subtasks passed)
    pub success: bool,
    /// Individual results per subtask
    pub results: HashMap<String, SubtaskResult>,
    /// Total execution duration in milliseconds
    pub total_duration_ms: u64,
    /// Maximum concurrency actually used
    pub max_concurrency_used: usize,
    /// Number of subtasks completed
    pub completed_count: usize,
    /// Number of subtasks failed
    pub failed_count: usize,
}

/// Parallel executor for running subtasks concurrently
pub struct ParallelExecutor {
    config: ParallelExecutorConfig,
    analyzer: DependencyAnalyzer,
}

impl ParallelExecutor {
    /// Create new parallel executor
    pub fn new(config: ParallelExecutorConfig) -> Self {
        Self {
            config,
            analyzer: DependencyAnalyzer::new(),
        }
    }

    /// Create with default configuration
    pub fn with_defaults() -> Self {
        Self::new(ParallelExecutorConfig::default())
    }

    /// Execute subtasks in parallel respecting dependencies
    ///
    /// # Arguments
    /// * `subtasks` - Vector of (subtask_id, dependencies)
    /// * `executor` - Async function to execute each subtask
    ///
    /// # Returns
    /// ParallelExecutionResult with all outcomes
    pub async fn execute<F, Fut>(
        &self,
        subtasks: Vec<(String, Vec<String>)>,
        executor: F,
    ) -> Result<ParallelExecutionResult>
    where
        F: Fn(String) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<String>> + Send + 'static,
    {
        let start_time = std::time::Instant::now();

        // Build dependency graph
        let graph = self
            .analyzer
            .build_graph(subtasks.clone())
            .context("Failed to build dependency graph")?;

        // Execute level by level
        let mut results = HashMap::new();
        let mut completed = HashSet::new();
        let mut failed = HashSet::new();
        let mut max_concurrency = 0;

        let executor = Arc::new(executor);

        for (level_idx, level_tasks) in graph.levels.iter().enumerate() {
            // Track max concurrency
            max_concurrency = max_concurrency.max(level_tasks.len());

            // Execute all tasks in this level concurrently
            let level_results = self
                .execute_level(level_idx, level_tasks, executor.clone())
                .await?;

            // Process results
            for result in level_results {
                if result.success {
                    completed.insert(result.id.clone());
                } else {
                    failed.insert(result.id.clone());
                }
                results.insert(result.id.clone(), result);
            }

            // Stop if failure and not continuing
            if !failed.is_empty() && !self.config.continue_on_failure {
                break;
            }
        }

        let total_duration_ms = start_time.elapsed().as_millis() as u64;

        Ok(ParallelExecutionResult {
            success: failed.is_empty(),
            results,
            total_duration_ms,
            max_concurrency_used: max_concurrency,
            completed_count: completed.len(),
            failed_count: failed.len(),
        })
    }

    /// Execute all tasks in a single level concurrently
    async fn execute_level<F, Fut>(
        &self,
        level: usize,
        task_ids: &[String],
        executor: Arc<F>,
    ) -> Result<Vec<SubtaskResult>>
    where
        F: Fn(String) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<String>> + Send + 'static,
    {
        let semaphore = Arc::new(Semaphore::new(self.config.max_concurrent));
        let mut handles: Vec<JoinHandle<SubtaskResult>> = Vec::new();

        for task_id in task_ids {
            let task_id = task_id.clone();
            let executor = executor.clone();
            let semaphore = semaphore.clone();
            let timeout_secs = self.config.task_timeout_secs;

            let handle = tokio::spawn(async move {
                // Acquire semaphore permit
                let _permit = semaphore.acquire().await.unwrap();

                let start = std::time::Instant::now();
                let result = if timeout_secs > 0 {
                    // Execute with timeout
                    match tokio::time::timeout(
                        tokio::time::Duration::from_secs(timeout_secs),
                        executor(task_id.clone()),
                    )
                    .await
                    {
                        Ok(Ok(output)) => Ok(output),
                        Ok(Err(e)) => Err(e),
                        Err(_) => Err(anyhow::anyhow!(
                            "Task timed out after {} seconds",
                            timeout_secs
                        )),
                    }
                } else {
                    // Execute without timeout
                    executor(task_id.clone()).await
                };

                let duration_ms = start.elapsed().as_millis() as u64;

                match result {
                    Ok(output) => SubtaskResult {
                        id: task_id,
                        success: true,
                        level,
                        duration_ms,
                        error: None,
                        output: Some(output),
                    },
                    Err(e) => SubtaskResult {
                        id: task_id,
                        success: false,
                        level,
                        duration_ms,
                        error: Some(e.to_string()),
                        output: None,
                    },
                }
            });

            handles.push(handle);
        }

        // Wait for all tasks to complete
        let mut results = Vec::new();
        for handle in handles {
            let result = handle.await.context("Task panicked")?;
            results.push(result);
        }

        Ok(results)
    }

    /// Get configuration
    pub fn config(&self) -> &ParallelExecutorConfig {
        &self.config
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use tokio::time::{Duration, sleep};

    #[tokio::test]
    async fn test_execute_parallel_tasks() {
        let executor = ParallelExecutor::with_defaults();

        let subtasks = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec![]),
            ("C".to_string(), vec![]),
        ];

        let result = executor
            .execute(subtasks, |id| async move {
                sleep(Duration::from_millis(10)).await;
                Ok(format!("Completed {}", id))
            })
            .await
            .unwrap();

        assert!(result.success);
        assert_eq!(result.completed_count, 3);
        assert_eq!(result.failed_count, 0);
    }

    #[tokio::test]
    async fn test_execute_with_dependencies() {
        let executor = ParallelExecutor::with_defaults();

        // A -> B -> C (linear chain)
        let subtasks = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec!["B".to_string()]),
        ];

        let order = Arc::new(AtomicUsize::new(0));

        let result = executor
            .execute(subtasks, {
                let order = order.clone();
                move |id| {
                    let order = order.clone();
                    async move {
                        let seq = order.fetch_add(1, Ordering::SeqCst);
                        sleep(Duration::from_millis(10)).await;
                        Ok(format!("{} executed at {}", id, seq))
                    }
                }
            })
            .await
            .unwrap();

        assert!(result.success);
        assert_eq!(result.completed_count, 3);

        // Check that B's level is higher than A's
        let a_level = result.results.get("A").unwrap().level;
        let b_level = result.results.get("B").unwrap().level;
        let c_level = result.results.get("C").unwrap().level;
        assert!(a_level < b_level);
        assert!(b_level < c_level);
    }

    #[tokio::test]
    async fn test_stop_on_failure() {
        let config = ParallelExecutorConfig {
            continue_on_failure: false,
            ..Default::default()
        };
        let executor = ParallelExecutor::new(config);

        let subtasks = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec![]),
            ("C".to_string(), vec!["A".to_string(), "B".to_string()]),
        ];

        let result = executor
            .execute(subtasks, |id| async move {
                if id == "B" {
                    Err(anyhow::anyhow!("Task B failed"))
                } else {
                    Ok(format!("Completed {}", id))
                }
            })
            .await
            .unwrap();

        assert!(!result.success);
        assert_eq!(result.failed_count, 1);
        // C should not execute because B failed
        assert!(!result.results.contains_key("C"));
    }

    #[tokio::test]
    async fn test_continue_on_failure() {
        let config = ParallelExecutorConfig {
            continue_on_failure: true,
            ..Default::default()
        };
        let executor = ParallelExecutor::new(config);

        let subtasks = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec![]),
            ("C".to_string(), vec!["A".to_string()]),
        ];

        let result = executor
            .execute(subtasks, |id| async move {
                if id == "B" {
                    Err(anyhow::anyhow!("Task B failed"))
                } else {
                    Ok(format!("Completed {}", id))
                }
            })
            .await
            .unwrap();

        assert!(!result.success); // Overall failed
        assert_eq!(result.failed_count, 1);
        assert_eq!(result.completed_count, 2);
        // C should execute because we continue on failure
        assert!(result.results.contains_key("C"));
    }

    #[tokio::test]
    async fn test_concurrency_limit() {
        let config = ParallelExecutorConfig {
            max_concurrent: 2,
            ..Default::default()
        };
        let executor = ParallelExecutor::new(config);

        let active = Arc::new(AtomicUsize::new(0));
        let max_active = Arc::new(AtomicUsize::new(0));

        let subtasks = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec![]),
            ("C".to_string(), vec![]),
            ("D".to_string(), vec![]),
        ];

        let result = executor
            .execute(subtasks, {
                let active = active.clone();
                let max_active = max_active.clone();
                move |id| {
                    let active = active.clone();
                    let max_active = max_active.clone();
                    async move {
                        let current = active.fetch_add(1, Ordering::SeqCst) + 1;
                        max_active.fetch_max(current, Ordering::SeqCst);

                        sleep(Duration::from_millis(50)).await;

                        active.fetch_sub(1, Ordering::SeqCst);
                        Ok(format!("Completed {}", id))
                    }
                }
            })
            .await
            .unwrap();

        assert!(result.success);
        // Max concurrency should not exceed configured limit
        let max = max_active.load(Ordering::SeqCst);
        assert!(max <= 2, "Max concurrency {} exceeded limit 2", max);
    }

    #[tokio::test]
    async fn test_task_timeout() {
        let config = ParallelExecutorConfig {
            task_timeout_secs: 1,
            ..Default::default()
        };
        let executor = ParallelExecutor::new(config);

        let subtasks = vec![("A".to_string(), vec![])];

        let result = executor
            .execute(subtasks, |_id| async move {
                // Sleep longer than timeout
                sleep(Duration::from_secs(2)).await;
                Ok("Should not complete".to_string())
            })
            .await
            .unwrap();

        assert!(!result.success);
        assert_eq!(result.failed_count, 1);

        let a_result = result.results.get("A").unwrap();
        assert!(!a_result.success);
        assert!(a_result.error.as_ref().unwrap().contains("timed out"));
    }
}
