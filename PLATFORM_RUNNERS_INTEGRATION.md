# Platform Runners Integration Guide

## Integration with RWM Puppet Master Components

This guide shows how the platform runners integrate with other RWM Puppet Master modules.

## 1. Integration with Orchestrator

The orchestrator uses platform runners to execute PRD phases/tasks/subtasks.

```rust
use puppet_master::platforms::{create_runner, quota_manager, rate_limiter};
use puppet_master::types::*;

pub struct Orchestrator {
    prd: Prd,
    config: PuppetMasterConfig,
}

impl Orchestrator {
    pub async fn execute_subtask(&self, subtask: &Subtask) -> Result<()> {
        // Determine platform from tier config
        let platform = self.get_platform_for_tier(TierType::Subtask);
        
        // Check quota before execution
        let quota_mgr = quota_manager::global_quota_manager();
        quota_mgr.enforce_quota(platform)?;
        
        // Acquire rate limit
        let rate_limiter = rate_limiter::global_rate_limiter();
        rate_limiter.acquire(platform).await?;
        
        // Create runner
        let runner = create_runner(platform);
        
        // Build request from subtask
        let request = ExecutionRequest::new(
            platform,
            self.config.platforms[&platform.name()].model.clone()?,
            self.build_prompt_for_subtask(subtask),
        )
        .with_mode(ExecutionMode::Auto)
        .with_timeout(self.config.tiers.subtask.timeout_seconds)
        .with_working_dir(self.config.paths.workspace.clone());
        
        // Execute
        info!("Executing subtask {} on {}", subtask.id, platform);
        let result = runner.execute(&request).await?;
        
        // Record usage
        quota_mgr.record_usage(
            platform,
            result.tokens_used.unwrap_or(0),
            result.duration_secs,
        );
        
        // Store evidence
        self.store_execution_evidence(&result, &subtask.id).await?;
        
        // Update PRD status
        if result.is_success() {
            self.update_subtask_status(&subtask.id, ItemStatus::Completed).await?;
        } else {
            self.update_subtask_status(&subtask.id, ItemStatus::Failed).await?;
        }
        
        Ok(())
    }
    
    fn get_platform_for_tier(&self, tier_type: TierType) -> Platform {
        let platform_name = match tier_type {
            TierType::Phase => &self.config.tiers.phase.platform,
            TierType::Task => &self.config.tiers.task.platform,
            TierType::Subtask => &self.config.tiers.subtask.platform,
        };
        
        Platform::from_str(platform_name).unwrap_or(Platform::Cursor)
    }
}
```

## 2. Integration with State Management

Track execution state across restarts.

```rust
use puppet_master::state::StateManager;
use puppet_master::platforms::*;

pub struct StateManager {
    db: rusqlite::Connection,
}

impl StateManager {
    pub async fn save_execution(&self, result: &ExecutionResult) -> Result<()> {
        self.db.execute(
            "INSERT INTO executions (
                request_id, platform, status, duration_secs, 
                tokens_used, output, started_at, completed_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                result.request_id.to_string(),
                result.status.to_string(),
                result.duration_secs,
                result.tokens_used,
                serde_json::to_string(&result.output)?,
                result.started_at.to_rfc3339(),
                result.completed_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }
    
    pub async fn get_platform_history(&self, platform: Platform) -> Result<Vec<ExecutionResult>> {
        let mut stmt = self.db.prepare(
            "SELECT * FROM executions WHERE platform = ?1 ORDER BY started_at DESC LIMIT 100"
        )?;
        
        let results = stmt.query_map([platform.to_string()], |row| {
            // Parse row into ExecutionResult
            // ...
        })?;
        
        Ok(results.collect()?)
    }
}
```

## 3. Integration with Event Bus

Publish events for execution lifecycle.

```rust
use puppet_master::events::EventBus;
use puppet_master::types::PuppetMasterEvent;

pub async fn execute_with_events(
    platform: Platform,
    request: ExecutionRequest,
    event_bus: &EventBus,
) -> Result<ExecutionResult> {
    // Publish start event
    event_bus.publish(PuppetMasterEvent::TierStarted {
        tier_id: request.id.to_string(),
        tier_type: TierType::Subtask,
        platform: platform.to_string(),
        session_id: Uuid::new_v4().to_string(),
    }).await?;
    
    // Execute
    let runner = create_runner(platform);
    let result = runner.execute(&request).await;
    
    // Publish completion event
    match &result {
        Ok(res) => {
            event_bus.publish(PuppetMasterEvent::TierCompleted {
                tier_id: request.id.to_string(),
                tier_type: TierType::Subtask,
                status: if res.is_success() { ItemStatus::Completed } else { ItemStatus::Failed },
                duration_ms: (res.duration_secs * 1000.0) as u64,
            }).await?;
        }
        Err(e) => {
            event_bus.publish(PuppetMasterEvent::TierFailed {
                tier_id: request.id.to_string(),
                tier_type: TierType::Subtask,
                error: e.to_string(),
            }).await?;
        }
    }
    
    result
}
```

## 4. Integration with GUI (Iced)

Display real-time execution status in the GUI.

```rust
use iced::{Command, Subscription};
use puppet_master::platforms::*;

#[derive(Debug, Clone)]
pub enum Message {
    ExecuteRequest(ExecutionRequest),
    ExecutionUpdate(ExecutionUpdate),
    ExecutionCompleted(ExecutionResult),
}

#[derive(Debug, Clone)]
pub enum ExecutionUpdate {
    OutputLine(OutputLine),
    ProgressUpdate(f32),
}

pub struct App {
    current_execution: Option<ExecutionRequest>,
    output_lines: Vec<OutputLine>,
    execution_status: Option<ExecutionStatus>,
}

impl App {
    pub fn update(&mut self, message: Message) -> Command<Message> {
        match message {
            Message::ExecuteRequest(request) => {
                self.current_execution = Some(request.clone());
                self.output_lines.clear();
                
                Command::perform(
                    execute_async(request),
                    Message::ExecutionCompleted,
                )
            }
            
            Message::ExecutionUpdate(update) => {
                match update {
                    ExecutionUpdate::OutputLine(line) => {
                        self.output_lines.push(line);
                    }
                    ExecutionUpdate::ProgressUpdate(progress) => {
                        // Update progress bar
                    }
                }
                Command::none()
            }
            
            Message::ExecutionCompleted(result) => {
                self.execution_status = Some(result.status);
                self.output_lines = result.output;
                Command::none()
            }
        }
    }
}

async fn execute_async(request: ExecutionRequest) -> ExecutionResult {
    let runner = create_runner(request.platform);
    runner.execute(&request).await.unwrap_or_else(|e| {
        ExecutionResult::failure(
            request.id,
            e.to_string(),
            0.0,
        )
    })
}
```

## 5. Integration with Verification Gates

Use platform runners for verification tasks.

```rust
use puppet_master::verification::VerificationGate;
use puppet_master::platforms::*;

pub struct TestVerificationGate;

impl VerificationGate for TestVerificationGate {
    async fn verify(&self, tier_id: &str) -> Result<bool> {
        // Create verification request
        let request = ExecutionRequest::new(
            Platform::Cursor,
            "gpt-4o".to_string(),
            format!("Run tests for tier {}", tier_id),
        )
        .with_mode(ExecutionMode::Auto)
        .with_timeout(600);
        
        // Execute
        let runner = create_runner(Platform::Cursor);
        let result = runner.execute(&request).await?;
        
        // Parse test results from output
        let tests_passed = self.parse_test_results(&result.output_text())?;
        
        Ok(tests_passed)
    }
}
```

## 6. Integration with Git Operations

Coordinate platform execution with git operations.

```rust
use puppet_master::git::GitManager;
use puppet_master::platforms::*;

pub async fn execute_with_git_tracking(
    request: ExecutionRequest,
    git_manager: &GitManager,
) -> Result<ExecutionResult> {
    // Create feature branch
    let branch_name = format!("puppet-master/{}", request.id);
    git_manager.create_branch(&branch_name).await?;
    git_manager.checkout(&branch_name).await?;
    
    // Execute
    let runner = create_runner(request.platform);
    let result = runner.execute(&request).await?;
    
    // Commit changes if successful
    if result.is_success() {
        let changed_files = git_manager.get_changed_files().await?;
        
        if !changed_files.is_empty() {
            git_manager.add_all().await?;
            git_manager.commit(&format!(
                "Automated changes for request {}\n\nPlatform: {}\nModel: {}\nDuration: {:.2}s",
                request.id,
                request.platform,
                request.model,
                result.duration_secs,
            )).await?;
        }
    } else {
        // Revert changes on failure
        git_manager.reset_hard().await?;
    }
    
    // Return to main branch
    git_manager.checkout("main").await?;
    
    Ok(result)
}
```

## 7. Integration with Configuration

Load platform-specific configurations.

```rust
use puppet_master::config::ConfigManager;
use puppet_master::platforms::*;

pub struct ConfigManager {
    config: PuppetMasterConfig,
}

impl ConfigManager {
    pub fn initialize_platforms(&self) {
        let quota_mgr = quota_manager::global_quota_manager();
        let rate_limiter = rate_limiter::global_rate_limiter();
        
        for (platform_name, platform_config) in &self.config.platforms {
            if !platform_config.enabled {
                continue;
            }
            
            let platform = Platform::from_str(platform_name).unwrap();
            
            // Set quota config
            if let Some(quota_config) = self.build_quota_config(&platform, platform_config) {
                quota_mgr.set_config(quota_config);
            }
            
            // Set rate limiter config
            if let Some(rate_config) = self.build_rate_config(&platform, platform_config) {
                rate_limiter.set_config(rate_config);
            }
        }
    }
    
    fn build_quota_config(&self, platform: &Platform, config: &PlatformConfig) -> Option<QuotaConfig> {
        Some(QuotaConfig {
            platform: *platform,
            max_calls_per_run: config.max_calls_per_run,
            max_calls_per_hour: config.max_calls_per_hour,
            max_calls_per_day: config.max_calls_per_day,
            max_tokens_per_run: config.max_tokens_per_run,
            max_tokens_per_hour: config.max_tokens_per_hour,
            max_tokens_per_day: config.max_tokens_per_day,
            soft_limit_threshold: config.soft_limit_threshold.unwrap_or(0.8),
        })
    }
}
```

## 8. Integration with Doctor/Health Checks

Check platform health and availability.

```rust
use puppet_master::doctor::{HealthCheck, HealthStatus};
use puppet_master::platforms::*;

pub struct PlatformHealthCheck;

impl HealthCheck for PlatformHealthCheck {
    async fn check(&self) -> Vec<HealthStatus> {
        let mut statuses = Vec::new();
        
        for platform in Platform::all() {
            let runner = create_runner(platform);
            let available = runner.is_available().await;
            
            let status = if available {
                // Try to discover models
                let models_result = runner.discover_models().await;
                
                match models_result {
                    Ok(models) if !models.is_empty() => {
                        HealthStatus::healthy(
                            format!("{} CLI", platform),
                            format!("Available with {} models", models.len()),
                        )
                    }
                    Ok(_) => {
                        HealthStatus::warning(
                            format!("{} CLI", platform),
                            "Available but no models discovered".to_string(),
                        )
                    }
                    Err(e) => {
                        HealthStatus::warning(
                            format!("{} CLI", platform),
                            format!("Available but model discovery failed: {}", e),
                        )
                    }
                }
            } else {
                HealthStatus::unhealthy(
                    format!("{} CLI", platform),
                    "CLI not found on PATH".to_string(),
                )
            };
            
            statuses.push(status);
        }
        
        // Check quota status
        let quota_mgr = quota_manager::global_quota_manager();
        for platform in Platform::all() {
            let quota_status = quota_mgr.check_quota(platform);
            let stats = quota_mgr.get_stats(platform);
            
            let status = match quota_status {
                QuotaStatus::Ok => HealthStatus::healthy(
                    format!("{} Quota", platform),
                    format!(
                        "{} calls, {} tokens used",
                        stats.calls_this_run,
                        stats.tokens_this_run
                    ),
                ),
                QuotaStatus::Warning => HealthStatus::warning(
                    format!("{} Quota", platform),
                    "Approaching limit".to_string(),
                ),
                QuotaStatus::Exhausted => HealthStatus::unhealthy(
                    format!("{} Quota", platform),
                    "Quota exhausted".to_string(),
                ),
            };
            
            statuses.push(status);
        }
        
        statuses
    }
}
```

## 9. Integration with Logging

Structured logging for platform operations.

```rust
use log::{info, warn, error};
use puppet_master::platforms::*;

pub async fn execute_with_logging(request: ExecutionRequest) -> Result<ExecutionResult> {
    info!(
        "Starting execution: request_id={}, platform={}, model={}",
        request.id,
        request.platform,
        request.model
    );
    
    let runner = create_runner(request.platform);
    
    // Log capability info
    let capability = capability::global_cache().get(request.platform).await?;
    info!(
        "Platform capability: available={}, version={:?}, features={:?}",
        capability.available,
        capability.version,
        capability.features
    );
    
    // Execute with timing
    let start = std::time::Instant::now();
    let result = runner.execute(&request).await;
    let duration = start.elapsed();
    
    match &result {
        Ok(res) => {
            if res.is_success() {
                info!(
                    "Execution completed: request_id={}, duration={:.2}s, tokens={}, lines={}",
                    request.id,
                    duration.as_secs_f64(),
                    res.tokens_used.unwrap_or(0),
                    res.output.len()
                );
            } else {
                warn!(
                    "Execution failed: request_id={}, status={:?}, error={:?}",
                    request.id,
                    res.status,
                    res.error
                );
            }
        }
        Err(e) => {
            error!(
                "Execution error: request_id={}, error={}",
                request.id,
                e
            );
        }
    }
    
    result
}
```

## 10. Integration with Progress Tracking

Track and persist execution progress.

```rust
use puppet_master::progress::ProgressTracker;
use puppet_master::platforms::*;

pub struct ProgressTracker {
    db: rusqlite::Connection,
}

impl ProgressTracker {
    pub async fn track_execution(&self, request: &ExecutionRequest) -> Result<ProgressHandle> {
        // Create progress entry
        let entry = ProgressEntry {
            session_id: Uuid::new_v4().to_string(),
            item_id: request.id.to_string(),
            platform: request.platform.to_string(),
            status: ItemStatus::InProgress,
            duration_ms: 0,
            accomplishments: vec![],
            files_changed: vec![],
            timestamp: Utc::now(),
        };
        
        self.save_entry(&entry).await?;
        
        Ok(ProgressHandle {
            entry_id: entry.session_id.clone(),
            tracker: self,
        })
    }
    
    pub async fn update_progress(
        &self,
        handle: &ProgressHandle,
        result: &ExecutionResult,
    ) -> Result<()> {
        // Extract accomplishments from output
        let accomplishments = self.parse_accomplishments(&result.output_text());
        
        // Detect file changes
        let files_changed = self.detect_file_changes().await?;
        
        // Update entry
        self.update_entry(&handle.entry_id, ProgressEntry {
            status: if result.is_success() { ItemStatus::Completed } else { ItemStatus::Failed },
            duration_ms: (result.duration_secs * 1000.0) as u64,
            accomplishments,
            files_changed,
            ..Default::default()
        }).await?;
        
        Ok(())
    }
}
```

## Example: Complete Integration

```rust
use puppet_master::{
    config::ConfigManager,
    doctor::PlatformHealthCheck,
    events::EventBus,
    git::GitManager,
    orchestrator::Orchestrator,
    platforms::*,
    progress::ProgressTracker,
    state::StateManager,
    verification::TestVerificationGate,
};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    env_logger::init();
    
    // Load configuration
    let config_mgr = ConfigManager::load().await?;
    config_mgr.initialize_platforms();
    
    // Initialize components
    let state_mgr = StateManager::new().await?;
    let event_bus = EventBus::new();
    let git_mgr = GitManager::new(&config_mgr.config.paths.workspace)?;
    let progress_tracker = ProgressTracker::new().await?;
    
    // Run health checks
    let health_check = PlatformHealthCheck;
    let health_statuses = health_check.check().await;
    for status in health_statuses {
        println!("{:?}", status);
    }
    
    // Create orchestrator
    let orchestrator = Orchestrator::new(
        config_mgr.config.clone(),
        event_bus.clone(),
        state_mgr.clone(),
        git_mgr.clone(),
    );
    
    // Execute PRD
    let prd = config_mgr.load_prd().await?;
    orchestrator.execute_prd(&prd).await?;
    
    Ok(())
}
```

## Summary

The platform runners integrate seamlessly with:

1. **Orchestrator** - Tier execution (phase/task/subtask)
2. **State Management** - Persistence and recovery
3. **Event Bus** - Real-time notifications
4. **GUI** - User interface updates
5. **Verification** - Quality gates
6. **Git** - Version control integration
7. **Configuration** - Platform-specific settings
8. **Health Checks** - Availability monitoring
9. **Logging** - Structured diagnostics
10. **Progress Tracking** - Execution history

All integrations follow Rust best practices:
- Async/await for concurrency
- Result<T> for error handling
- Arc/Mutex for shared state
- Channels for communication
- Traits for polymorphism
