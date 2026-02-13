//! Main orchestration loop and coordinator
//!
//! Coordinates all components:
//! - State machines
//! - Execution engine  
//! - Tier tree
//! - Session tracking
//! - Event emission
//! - Checkpoint management

use crate::core::escalation_chain::{
    EscalationChainFailureType, map_failure_type_to_chain_key, select_escalation_chain_step,
    to_tier_type,
};
use crate::core::{
    auto_advancement::AdvancementEngine,
    checkpoint_manager::{CheckpointManager, CheckpointManagerConfig},
    complexity_classifier::{ComplexityClassifier, TaskInfo},
    dependency_analyzer::DependencyAnalyzer,
    escalation::EscalationEngine,
    execution_engine::ExecutionEngine,
    fresh_spawn::{FreshSpawn, SpawnConfig},
    loop_guard::{LoopGuard, LoopGuardConfig, LoopGuardMessage},
    parallel_executor::{ParallelExecutor, ParallelExecutorConfig},
    platform_router::{PlatformCapabilities, PlatformRouter, PlatformRouterConfig},
    prompt_builder::PromptBuilder,
    session_tracker::SessionTracker,
    state_machine::{OrchestratorEvent, OrchestratorStateMachine, TierEvent},
    state_persistence::{CheckpointMetadata, CurrentPosition},
    state_transitions,
    tier_node::TierTree,
    worker_reviewer::WorkerReviewer,
};
use crate::git::GitManager;
use crate::logging::{ActivityEventType, LoggerService};
use crate::state::{ProgressManager, UsageTracker};
use crate::types::BranchStrategy;
use crate::types::*;
use crate::verification::{GateRunConfig, GateRunner, VerificationIntegration};
use anyhow::{Context, Result, anyhow};
use async_trait::async_trait;
use chrono::Utc;
use crossbeam_channel::{Receiver, Sender};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;

#[async_trait]
trait IterationExecutor: Send + Sync {
    async fn execute_iteration(
        &self,
        context: &IterationContext,
    ) -> Result<crate::core::execution_engine::IterationResult>;
}

#[async_trait]
impl IterationExecutor for ExecutionEngine {
    async fn execute_iteration(
        &self,
        context: &IterationContext,
    ) -> Result<crate::core::execution_engine::IterationResult> {
        ExecutionEngine::execute_iteration(self, context).await
    }
}

#[async_trait]
trait GateExecutor: Send + Sync {
    async fn run_gate(
        &self,
        gate_type: &str,
        gate_id: &str,
        criteria: &[Criterion],
        test_plan: Option<&TestPlan>,
    ) -> GateReport;
}

#[async_trait]
impl GateExecutor for GateRunner {
    async fn run_gate(
        &self,
        gate_type: &str,
        gate_id: &str,
        criteria: &[Criterion],
        test_plan: Option<&TestPlan>,
    ) -> GateReport {
        GateRunner::run_gate(self, gate_type, gate_id, criteria, test_plan).await
    }
}

trait SessionLifecycle: Send + Sync {
    fn start_session(
        &self,
        tier_id: String,
        tier_type: TierType,
        platform: Platform,
        model: String,
    ) -> Result<String>;
    fn complete_session(&self, session_id: &str) -> Result<()>;
    fn fail_session(&self, session_id: &str, error: String) -> Result<()>;
}

impl SessionLifecycle for SessionTracker {
    fn start_session(
        &self,
        tier_id: String,
        tier_type: TierType,
        platform: Platform,
        model: String,
    ) -> Result<String> {
        SessionTracker::start_session(self, tier_id, tier_type, platform, model)
    }

    fn complete_session(&self, session_id: &str) -> Result<()> {
        SessionTracker::complete_session(self, session_id)
    }

    fn fail_session(&self, session_id: &str, error: String) -> Result<()> {
        SessionTracker::fail_session(self, session_id, error)
    }
}

/// Main orchestrator
pub struct Orchestrator {
    /// Configuration
    config: PuppetMasterConfig,
    /// Orchestrator state machine
    state_machine: Arc<Mutex<OrchestratorStateMachine>>,
    /// Tier tree
    tier_tree: Arc<Mutex<TierTree>>,
    /// Advancement engine
    advancement_engine: Arc<AdvancementEngine>,
    /// Escalation engine
    escalation_engine: Arc<EscalationEngine>,
    /// Worker/Reviewer coordinator
    _worker_reviewer: Arc<WorkerReviewer>,
    /// Event sender
    event_sender: Sender<OrchestratorEvent>,
    /// Event receiver (for external subscribers)
    event_receiver: Receiver<OrchestratorEvent>,
    /// Last checkpoint time
    _last_checkpoint: Arc<Mutex<Instant>>,
    /// Prompt builder
    prompt_builder: PromptBuilder,
    /// Iteration executor (real engine in production, mockable in tests)
    iteration_executor: Arc<dyn IterationExecutor>,
    /// Gate runner (mockable in tests)
    gate_runner: Arc<dyn GateExecutor>,
    /// Session tracking lifecycle (mockable in tests)
    session_tracker: Arc<dyn SessionLifecycle>,
    /// Logger service for centralized logging
    logger_service: LoggerService,
    /// Progress manager for progress.txt updates
    progress_manager: ProgressManager,
    /// Usage tracker for platform usage
    usage_tracker: UsageTracker,
    /// Git manager for git operations
    _git_manager: GitManager,
    /// Branch strategy for git branch naming
    _branch_strategy: BranchStrategy,
    /// Verification integration
    _verification_integration: Option<VerificationIntegration>,
    /// Complexity classifier for task classification
    complexity_classifier: ComplexityClassifier,
    /// Dependency analyzer for subtask ordering
    _dependency_analyzer: DependencyAnalyzer,
    /// Platform router for platform selection
    platform_router: Arc<Mutex<PlatformRouter>>,
    /// Loop guard for iteration loop detection
    loop_guard: Arc<Mutex<LoopGuard>>,
    /// Fresh spawn manager for process spawning
    _fresh_spawn: FreshSpawn,
    /// Checkpoint manager for state persistence
    checkpoint_manager: Arc<Mutex<CheckpointManager>>,
    /// Parallel executor for concurrent subtasks
    _parallel_executor: ParallelExecutor,
}

impl Orchestrator {
    /// Create new orchestrator
    pub fn new(config: PuppetMasterConfig) -> Result<Self> {
        let (event_sender, event_receiver) = crossbeam_channel::unbounded();

        let advancement_engine = Arc::new(AdvancementEngine::new());
        let escalation_engine = Arc::new(EscalationEngine::with_defaults());
        let worker_reviewer = Arc::new(WorkerReviewer::with_defaults());

        let prompt_builder = PromptBuilder::new()
            .with_agents_path(config.paths.workspace.join("AGENTS.md"))
            .with_progress_path(config.paths.progress_path.clone())
            .with_prd_path(config.paths.prd_path.clone());

        let session_log_path = config
            .paths
            .workspace
            .join(".puppet-master")
            .join("logs")
            .join("sessions.jsonl");
        let session_tracker: Arc<dyn SessionLifecycle> =
            Arc::new(SessionTracker::new(session_log_path)?);

        let platforms = config.platforms.values().cloned().collect::<Vec<_>>();
        let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
            platforms,
            event_sender.clone(),
            120,
            10,
        ));

        let gate_runner: Arc<dyn GateExecutor> =
            Arc::new(GateRunner::new(GateRunConfig::default()));

        // Ensure workspace directory exists and is writable
        if !config.paths.workspace.exists() {
            std::fs::create_dir_all(&config.paths.workspace).with_context(|| {
                format!(
                    "Failed to create workspace directory: {}. Please ensure the path is writable.",
                    config.paths.workspace.display()
                )
            })?;
        }

        // Verify workspace is writable
        let test_file = config.paths.workspace.join(".puppet-master-write-test");
        std::fs::write(&test_file, "test").with_context(|| {
            format!(
                "Workspace directory is not writable: {}. Please check permissions.",
                config.paths.workspace.display()
            )
        })?;
        std::fs::remove_file(&test_file).ok();

        // Initialize .puppet-master directory structure
        let puppet_master_dir = config.paths.workspace.join(".puppet-master");
        std::fs::create_dir_all(&puppet_master_dir).with_context(|| {
            format!(
                "Failed to create .puppet-master directory: {}",
                puppet_master_dir.display()
            )
        })?;

        // Create subdirectories
        let subdirs = ["logs", "evidence", "checkpoints", "capabilities", "usage"];
        for subdir in &subdirs {
            let path = puppet_master_dir.join(subdir);
            std::fs::create_dir_all(&path).with_context(|| {
                format!("Failed to create {} directory: {}", subdir, path.display())
            })?;
        }

        // Initialize logging service
        let logger_service = LoggerService::new(puppet_master_dir.clone(), false);

        // Log startup activity
        let _ = logger_service.log_activity(
            ActivityEventType::ProjectCreated,
            "Orchestrator initialized",
        );

        // Initialize progress manager
        let progress_manager = ProgressManager::new(&config.paths.progress_path)?;

        // Initialize usage tracker
        let usage_path = puppet_master_dir.join("usage.jsonl");
        let usage_tracker = UsageTracker::new(&usage_path)?;

        // Initialize git manager
        let git_manager = GitManager::new(config.paths.workspace.clone());

        // Initialize branch strategy
        let branch_strategy = BranchStrategy::Feature; // Default strategy

        // Initialize verification integration if configured
        let verification_integration = Some(VerificationIntegration::new(
            &config.paths.workspace,
            GateRunConfig::default(),
        )?);

        // Initialize complexity classifier
        let complexity_classifier = ComplexityClassifier::new();

        // Initialize dependency analyzer
        let dependency_analyzer = DependencyAnalyzer::new();

        // Initialize platform router with capabilities from config
        let mut platform_router_config = PlatformRouterConfig::default();
        for (_platform_name, platform_config) in &config.platforms {
            let caps = PlatformCapabilities {
                available: platform_config.available,
                health_score: 100, // Could be tracked dynamically
                quota_remaining: platform_config.quota.unwrap_or(100) as u8,
                supports_level: std::collections::HashMap::from([
                    (crate::core::complexity_classifier::ModelLevel::Level1, true),
                    (crate::core::complexity_classifier::ModelLevel::Level2, true),
                    (crate::core::complexity_classifier::ModelLevel::Level3, true),
                ]),
            };
            platform_router_config
                .capabilities
                .insert(platform_config.platform, caps);
        }
        let platform_router = Arc::new(Mutex::new(PlatformRouter::new(platform_router_config)));

        // Initialize loop guard
        let loop_guard = Arc::new(Mutex::new(LoopGuard::new(LoopGuardConfig::default())));

        // Initialize fresh spawn with working directory
        let spawn_config = SpawnConfig {
            working_dir: config.project.working_directory.clone(),
            timeout_secs: 3600,
            env_vars: Vec::new(),
            capture_stdout: true,
            capture_stderr: true,
        };
        let fresh_spawn = FreshSpawn::new(spawn_config);

        // Initialize checkpoint manager
        let checkpoint_manager_config = CheckpointManagerConfig {
            checkpoint_dir: puppet_master_dir.join("checkpoints"),
            max_checkpoints: 10,
            auto_checkpoint_interval_secs: 300, // 5 minutes
        };
        let checkpoint_manager = Arc::new(Mutex::new(CheckpointManager::new(
            checkpoint_manager_config,
        )));

        // Initialize parallel executor
        let parallel_executor_config = ParallelExecutorConfig {
            max_concurrent: 3,
            continue_on_failure: false,
            task_timeout_secs: 3600,
        };
        let parallel_executor = ParallelExecutor::new(parallel_executor_config);

        Ok(Self {
            config,
            state_machine: Arc::new(Mutex::new(OrchestratorStateMachine::new())),
            tier_tree: Arc::new(Mutex::new(TierTree::new())),
            advancement_engine,
            escalation_engine,
            _worker_reviewer: worker_reviewer,
            event_sender,
            event_receiver,
            _last_checkpoint: Arc::new(Mutex::new(Instant::now())),
            prompt_builder,
            iteration_executor,
            gate_runner,
            session_tracker,
            logger_service,
            progress_manager,
            usage_tracker,
            _git_manager: git_manager,
            _branch_strategy: branch_strategy,
            _verification_integration: verification_integration,
            complexity_classifier,
            _dependency_analyzer: dependency_analyzer,
            platform_router,
            loop_guard,
            _fresh_spawn: fresh_spawn,
            checkpoint_manager,
            _parallel_executor: parallel_executor,
        })
    }

    /// Load PRD and build tier tree
    pub async fn load_prd(&self, prd: &PRD) -> Result<()> {
        let mut tree = self.tier_tree.lock().unwrap();
        *tree = TierTree::from_prd(prd, self.config.orchestrator.max_iterations)?;
        Ok(())
    }

    /// Get the logger service for external access
    pub fn logger_service(&self) -> &LoggerService {
        &self.logger_service
    }

    /// Run log retention cleanup
    pub async fn cleanup_logs(&self) -> Result<()> {
        use crate::logging::{LogRetentionManager, RetentionConfig};

        let logs_dir = self
            .config
            .paths
            .workspace
            .join(".puppet-master")
            .join("logs");
        let retention_config = RetentionConfig {
            max_age_days: 30,
            max_file_count: 100,
            max_total_size_mb: 500,
            protected_patterns: vec!["current".to_string(), "latest".to_string()],
        };

        let manager = LogRetentionManager::new(retention_config);
        let result = manager.cleanup(&logs_dir)?;

        log::info!(
            "Log cleanup: deleted {} files, freed {} bytes",
            result.files_removed,
            result.bytes_freed
        );

        Ok(())
    }

    /// Start orchestration
    pub async fn start(&self) -> Result<()> {
        let mut sm = self.state_machine.lock().unwrap();
        sm.send(OrchestratorEvent::Start)?;
        drop(sm);

        self.emit_event(OrchestratorEvent::StateChanged {
            old_state: OrchestratorState::Idle,
            new_state: OrchestratorState::Planning,
        });

        Ok(())
    }

    /// Pause orchestration
    pub async fn pause(&self) -> Result<()> {
        let mut sm = self.state_machine.lock().unwrap();
        sm.send(OrchestratorEvent::Pause)?;
        drop(sm);

        self.emit_event(OrchestratorEvent::StateChanged {
            old_state: OrchestratorState::Executing,
            new_state: OrchestratorState::Paused,
        });

        Ok(())
    }

    /// Resume orchestration
    pub async fn resume(&self) -> Result<()> {
        let mut sm = self.state_machine.lock().unwrap();
        sm.send(OrchestratorEvent::Resume)?;
        drop(sm);

        self.emit_event(OrchestratorEvent::StateChanged {
            old_state: OrchestratorState::Paused,
            new_state: OrchestratorState::Executing,
        });

        Ok(())
    }

    /// Stop orchestration
    pub async fn stop(&self) -> Result<()> {
        let mut sm = self.state_machine.lock().unwrap();
        sm.send(OrchestratorEvent::Stop)?;
        drop(sm);

        self.emit_event(OrchestratorEvent::StateChanged {
            old_state: OrchestratorState::Executing,
            new_state: OrchestratorState::Idle,
        });

        Ok(())
    }

    /// Reset orchestration
    pub async fn reset(&self) -> Result<()> {
        let mut sm = self.state_machine.lock().unwrap();
        sm.send(OrchestratorEvent::Reset)?;
        drop(sm);

        // Reset tier tree states
        let mut tree = self.tier_tree.lock().unwrap();
        let ids: Vec<String> = tree.iter_dfs().map(|n| n.id.clone()).collect();
        for id in ids {
            if let Some(node) = tree.find_by_id_mut(&id) {
                let _ = node.state_machine.reset();
            }
        }

        Ok(())
    }

    /// Main orchestration loop
    pub async fn run(&self) -> Result<()> {
        match self.current_state() {
            OrchestratorState::Idle => {
                self.start().await?;

                {
                    let mut sm = self.state_machine.lock().unwrap();
                    sm.send(OrchestratorEvent::PlanComplete)?;
                }

                self.emit_event(OrchestratorEvent::StateChanged {
                    old_state: OrchestratorState::Planning,
                    new_state: OrchestratorState::Executing,
                });
            }
            OrchestratorState::Planning => {
                {
                    let mut sm = self.state_machine.lock().unwrap();
                    sm.send(OrchestratorEvent::PlanComplete)?;
                }

                self.emit_event(OrchestratorEvent::StateChanged {
                    old_state: OrchestratorState::Planning,
                    new_state: OrchestratorState::Executing,
                });
            }
            OrchestratorState::Paused => {
                self.resume().await?;
            }
            OrchestratorState::Executing => {}
            OrchestratorState::Complete | OrchestratorState::Error => return Ok(()),
        }

        loop {
            let (is_executing, is_paused) = {
                let sm = self.state_machine.lock().unwrap();
                (sm.is_executing(), sm.is_paused())
            };

            if !is_executing {
                if is_paused {
                    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
                    continue;
                }
                break;
            }

            let next_tier_id = {
                let tree = self.tier_tree.lock().unwrap();
                self.advancement_engine.get_next_executable(&tree)
            };

            let tier_id = match next_tier_id {
                Some(id) => id,
                None => {
                    let is_complete = {
                        let tree = self.tier_tree.lock().unwrap();
                        self.advancement_engine.is_complete(&tree)
                    };

                    if is_complete {
                        let mut sm = self.state_machine.lock().unwrap();
                        sm.send(OrchestratorEvent::Complete)?;
                        break;
                    } else {
                        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                        continue;
                    }
                }
            };

            // Classify and route task before execution
            let platform = match self.classify_and_route_task(&tier_id) {
                Ok(p) => p,
                Err(e) => {
                    log::warn!("Failed to classify/route task {}: {}", tier_id, e);
                    // Continue with default platform from config
                    let tree = self.tier_tree.lock().unwrap();
                    let node = tree.find_by_id(&tier_id).expect("Tier must exist");
                    self.tier_config_for(node.tier_type).platform
                }
            };
            log::debug!("Task {} routed to platform {:?}", tier_id, platform);

            match self.execute_tier(&tier_id).await {
                Ok(_) => {
                    // Auto-checkpoint if interval elapsed
                    let should_checkpoint = {
                        let checkpoint_mgr = self.checkpoint_manager.lock().unwrap();
                        checkpoint_mgr.should_auto_checkpoint()
                    };

                    if should_checkpoint {
                        if let Err(e) = self.create_checkpoint("auto").await {
                            log::warn!("Failed to create auto-checkpoint: {}", e);
                        }
                    }

                    // Emit progress update for GUI
                    let stats = self.get_stats();
                    let total = stats.total_nodes.max(1);
                    let completed = stats.passed + stats.failed + stats.escalated;
                    let overall = (completed as f64 / total as f64) * 100.0;
                    let phase_total = stats.phases.max(1);
                    let task_total = stats.tasks.max(1);
                    let subtask_total = stats.subtasks.max(1);
                    let phase_pct =
                        (stats.passed.min(stats.phases) as f64 / phase_total as f64) * 100.0;
                    let task_pct =
                        (stats.passed.min(stats.tasks) as f64 / task_total as f64) * 100.0;
                    let subtask_pct =
                        (stats.passed.min(stats.subtasks) as f64 / subtask_total as f64) * 100.0;
                    let progress = PuppetMasterEvent::progress(
                        phase_pct,
                        task_pct,
                        subtask_pct,
                        100.0,
                        overall,
                    );
                    let _ = self
                        .event_sender
                        .send(OrchestratorEvent::PuppetMasterEvent(progress));

                    let advancement = {
                        let tree = self.tier_tree.lock().unwrap();
                        self.advancement_engine
                            .determine_advancement(&tree, &tier_id)?
                    };

                    if advancement.should_advance {
                        let tree = self.tier_tree.lock().unwrap();
                        if self.advancement_engine.is_complete(&tree) {
                            let mut sm = self.state_machine.lock().unwrap();
                            sm.send(OrchestratorEvent::Complete)?;
                            break;
                        }
                    }
                }
                Err(e) => {
                    log::error!("Tier execution failed: {}", e);
                    self.emit_event(OrchestratorEvent::Error(format!(
                        "Tier {} failed: {}",
                        tier_id, e
                    )));
                    self.pause().await?;
                    break;
                }
            }
        }

        Ok(())
    }

    fn tier_config_for(&self, tier_type: TierType) -> &TierConfig {
        match tier_type {
            TierType::Phase => &self.config.tiers.phase,
            TierType::Task => &self.config.tiers.task,
            TierType::Subtask => &self.config.tiers.subtask,
            TierType::Iteration => &self.config.tiers.iteration,
        }
    }

    fn gate_type_for(&self, tier_type: TierType) -> &'static str {
        match tier_type {
            TierType::Phase => "phase",
            _ => "task",
        }
    }

    fn build_gate_criteria(&self, acceptance_criteria: &[String]) -> Vec<Criterion> {
        acceptance_criteria
            .iter()
            .enumerate()
            .map(|(i, desc)| Criterion {
                id: format!("AC-{}", i + 1),
                description: desc.clone(),
                met: false,
                verification_method: None,
                expected: None,
                actual: None,
            })
            .collect()
    }

    fn context_ids(&self, tree: &TierTree, tier_id: &str) -> (String, String, String) {
        let path = tree.get_path(tier_id);
        let phase_id = path.first().cloned().unwrap_or_default();
        let task_id = path.get(1).cloned().unwrap_or_else(|| phase_id.clone());
        let subtask_id = path.get(2).cloned().unwrap_or_else(|| task_id.clone());
        (phase_id, task_id, subtask_id)
    }

    /// Execute a single tier
    async fn execute_tier(&self, tier_id: &str) -> Result<()> {
        // Transition to Planning if needed.
        {
            let mut tree = self.tier_tree.lock().unwrap();
            let node = tree
                .find_by_id_mut(tier_id)
                .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

            if node.state_machine.current_state() == TierState::Pending {
                node.state_machine.send(TierEvent::StartPlanning)?;
            }
        }

        let (tier_type, max_iterations) = {
            let tree = self.tier_tree.lock().unwrap();
            let node = tree
                .find_by_id(tier_id)
                .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;
            (node.tier_type, node.state_machine.max_iterations())
        };

        let tier_config = self.tier_config_for(tier_type).clone();
        let mut previous_feedback: Option<String> = None;

        for attempt in 1..=max_iterations {
            let (prompt, phase_id, task_id, subtask_id) = {
                let tree = self.tier_tree.lock().unwrap();
                let prompt = self.prompt_builder.build_prompt(
                    &tree,
                    tier_id,
                    attempt,
                    previous_feedback.as_deref(),
                )?;
                let (phase_id, task_id, subtask_id) = self.context_ids(&tree, tier_id);
                (prompt, phase_id, task_id, subtask_id)
            };

            {
                let mut tree = self.tier_tree.lock().unwrap();
                let node = tree
                    .find_by_id_mut(tier_id)
                    .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

                match node.state_machine.current_state() {
                    TierState::Planning | TierState::Retrying => {
                        // Validate transition before sending event
                        let current = node.state_machine.current_state();
                        if let Err(e) = self.validate_tier_transition(current, TierState::Running) {
                            log::warn!("Tier transition validation failed: {}", e);
                        }
                        node.state_machine.send(TierEvent::StartExecution)?;
                    }
                    TierState::Running => {}
                    TierState::Passed => return Ok(()),
                    TierState::Failed => {
                        return Err(anyhow!("Tier {} is already failed", tier_id));
                    }
                    other => {
                        return Err(anyhow!(
                            "Tier {} in unexpected state {:?} for execution",
                            tier_id,
                            other
                        ));
                    }
                }
            }

            let session_id = self.session_tracker.start_session(
                tier_id.to_string(),
                tier_type,
                tier_config.platform,
                tier_config.model.clone(),
            )?;

            // Log iteration start
            let _ = self.logger_service.log_activity(
                ActivityEventType::OrchestrationStarted,
                format!("Starting iteration {} for tier {}", attempt, tier_id),
            );

            let timeout_secs = tier_config
                .timeout_ms
                .map(|ms| ms.saturating_add(999) / 1000);

            let context = IterationContext {
                tier_id: tier_id.to_string(),
                phase_id,
                task_id,
                subtask_id,
                iteration_number: attempt,
                iteration: attempt,
                prompt,
                model: tier_config.model.clone(),
                platform: tier_config.platform,
                working_directory: self.config.project.working_directory.clone(),
                working_dir: self.config.project.working_directory.clone(),
                session_id: session_id.clone(),
                timeout_ms: tier_config.timeout_ms,
                timeout_secs,
                context_files: Vec::new(),
                env_vars: HashMap::new(),
            };

            let iteration_result = match self.iteration_executor.execute_iteration(&context).await {
                Ok(r) => r,
                Err(e) => {
                    let signal = CompletionSignal::Error(e.to_string());

                    // Log error
                    let mut error_context = HashMap::new();
                    error_context.insert("tier_id".to_string(), tier_id.to_string());
                    error_context.insert("attempt".to_string(), attempt.to_string());
                    let _ = self.logger_service.log_error(
                        crate::logging::ErrorCategory::Platform,
                        format!("Iteration execution failed: {}", e),
                        error_context,
                    );

                    let _ = self
                        .session_tracker
                        .fail_session(&session_id, format!("{}", signal));
                    return self
                        .handle_iteration_failure(tier_id, attempt, &signal)
                        .await;
                }
            };

            match iteration_result.signal {
                CompletionSignal::Complete => {
                    let _ = self.session_tracker.complete_session(&session_id);

                    // Log completion
                    let _ = self.logger_service.log_activity(
                        ActivityEventType::IterationCompleted,
                        format!("Iteration {} completed for tier {}", attempt, tier_id),
                    );

                    // Track usage
                    let usage_record = UsageRecord {
                        timestamp: Utc::now(),
                        platform: tier_config.platform,
                        action: format!("tier_execution:{}", tier_id),
                        duration_ms: Some(iteration_result.duration_secs * 1000),
                        success: true,
                        tokens: None,
                        session_id: Some(session_id.clone()),
                        tier_id: Some(tier_id.to_string()),
                        model: Some(tier_config.model.clone()),
                        cost: None,
                    };
                    let _ = self.usage_tracker.record(usage_record);

                    // Transition to Gating.
                    {
                        let mut tree = self.tier_tree.lock().unwrap();
                        let node = tree
                            .find_by_id_mut(tier_id)
                            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;
                        node.state_machine.send(TierEvent::Complete)?;
                    }

                    let acceptance_criteria = {
                        let tree = self.tier_tree.lock().unwrap();
                        let node = tree
                            .find_by_id(tier_id)
                            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;
                        node.acceptance_criteria.clone()
                    };

                    let criteria = self.build_gate_criteria(&acceptance_criteria);
                    let gate_type = self.gate_type_for(tier_type);
                    let gate_report = self
                        .gate_runner
                        .run_gate(gate_type, tier_id, &criteria, None)
                        .await;

                    if gate_report.passed {
                        let mut tree = self.tier_tree.lock().unwrap();
                        let node = tree
                            .find_by_id_mut(tier_id)
                            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

                        // Validate transition before passing
                        let current = node.state_machine.current_state();
                        if let Err(e) = self.validate_tier_transition(current, TierState::Passed) {
                            log::warn!("Tier transition validation failed: {}", e);
                        }
                        node.state_machine.send(TierEvent::GatePass)?;

                        // Update progress
                        let progress_entry = ProgressEntry {
                            item_id: tier_id.to_string(),
                            status: ItemStatus::Passed,
                            progress: 100.0,
                            message: Some(format!(
                                "Tier passed gate after {} iteration(s)",
                                attempt
                            )),
                            timestamp: Utc::now(),
                        };
                        let _ = self.progress_manager.append_entry(&progress_entry);

                        // Log gate pass
                        let _ = self.logger_service.log_activity(
                            ActivityEventType::GatePassed,
                            format!("Tier {} passed gate", tier_id),
                        );

                        return Ok(());
                    }

                    let reason = gate_report
                        .report
                        .clone()
                        .unwrap_or_else(|| "Gate failed".to_string());

                    {
                        let mut tree = self.tier_tree.lock().unwrap();
                        let node = tree
                            .find_by_id_mut(tier_id)
                            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;
                        let next_state = node
                            .state_machine
                            .send(TierEvent::GateFail(reason.clone()))?;

                        if next_state == TierState::Failed {
                            return Err(anyhow!("Tier {} failed gate: {}", tier_id, reason));
                        }
                    }

                    let action = self.escalation_engine.determine_action(
                        &crate::core::escalation::FailureType::GateFailed,
                        attempt,
                        TierState::Gating,
                    );

                    match action {
                        EscalationAction::Retry => {
                            // Check loop guard before retrying
                            if let Err(e) = self.check_loop_guard(tier_id, attempt, Some(&reason)) {
                                log::warn!("Loop detected, failing tier: {}", e);
                                return Err(anyhow!(
                                    "Tier {} gate failed with loop detection: {}",
                                    tier_id,
                                    reason
                                ));
                            }
                            previous_feedback = Some(reason);
                            continue;
                        }
                        EscalationAction::PauseForUser | EscalationAction::EscalateToParent => {
                            return Err(anyhow!("Tier {} gate failed: {}", tier_id, reason));
                        }
                        EscalationAction::Skip | EscalationAction::Fail => {
                            return Err(anyhow!("Tier {} gate failed: {}", tier_id, reason));
                        }
                    }
                }

                other_signal => {
                    let _ = self.session_tracker.fail_session(
                        &session_id,
                        format!("Iteration {}: {}", attempt, other_signal),
                    );

                    let res = self
                        .handle_iteration_failure(tier_id, attempt, &other_signal)
                        .await;

                    if res.is_ok() {
                        previous_feedback = Some(format!("Previous attempt: {}", other_signal));
                        continue;
                    }

                    return res;
                }
            }
        }

        Err(anyhow!(
            "Tier {} exceeded max iterations ({})",
            tier_id,
            max_iterations
        ))
    }

    async fn handle_iteration_failure(
        &self,
        tier_id: &str,
        attempt: u32,
        signal: &CompletionSignal,
    ) -> Result<()> {
        let (tier_state, tier_type, next_state) = {
            let mut tree = self.tier_tree.lock().unwrap();
            let node = tree
                .find_by_id_mut(tier_id)
                .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;
            let current_state = node.state_machine.current_state();
            let tier_type = node.tier_type;
            let next_state = node
                .state_machine
                .send(TierEvent::Fail(format!("{}", signal)))?;
            (current_state, tier_type, next_state)
        };

        // Try to use configurable escalation chains if available
        let action = if let Some(ref escalation_config) = self.config.escalation {
            self.determine_escalation_action_from_config(
                escalation_config,
                signal,
                attempt,
                tier_id,
                tier_type,
            )
            .await?
        } else {
            // Fall back to legacy escalation engine
            let failure_type = self.escalation_engine.classify_failure(signal);
            self.escalation_engine
                .determine_action(&failure_type, attempt, tier_state)
        };

        match action {
            EscalationAction::Retry => {
                // Check loop guard before retrying
                if let Err(e) =
                    self.check_loop_guard(tier_id, attempt, Some(&format!("{}", signal)))
                {
                    log::warn!("Loop detected during retry: {}", e);
                    return Err(anyhow!(
                        "Tier {} failed with loop detection: {}",
                        tier_id,
                        e
                    ));
                }

                if next_state == TierState::Failed {
                    Err(anyhow!(
                        "Tier {} failed after {} attempts: {}",
                        tier_id,
                        attempt,
                        signal
                    ))
                } else {
                    Ok(())
                }
            }
            EscalationAction::Skip | EscalationAction::Fail => Err(anyhow!(
                "Tier {} failed (action={}) after {} attempts: {}",
                tier_id,
                action,
                attempt,
                signal
            )),
            EscalationAction::PauseForUser | EscalationAction::EscalateToParent => Err(anyhow!(
                "Tier {} requires escalation (action={}) after {} attempts: {}",
                tier_id,
                action,
                attempt,
                signal
            )),
        }
    }

    /// Determine escalation action using configurable escalation chains
    async fn determine_escalation_action_from_config(
        &self,
        escalation_config: &EscalationChainsConfig,
        signal: &CompletionSignal,
        attempt: u32,
        tier_id: &str,
        tier_type: TierType,
    ) -> Result<EscalationAction> {
        // Map signal to failure type
        let failure_type = match signal {
            CompletionSignal::Timeout => EscalationChainFailureType::Timeout,
            CompletionSignal::Error(_) => EscalationChainFailureType::Error,
            CompletionSignal::Gutter => EscalationChainFailureType::Acceptance,
            _ => EscalationChainFailureType::Error,
        };

        let chain_key = map_failure_type_to_chain_key(failure_type);

        // Get the chain for this failure type
        if let Some(chain) = escalation_config.chains.get(&chain_key) {
            let selection = select_escalation_chain_step(chain, attempt)?;

            // Convert EscalationChainAction to EscalationAction
            let action = match selection.step.action {
                EscalationChainAction::Retry => EscalationAction::Retry,
                EscalationChainAction::SelfFix => EscalationAction::Retry,
                EscalationChainAction::KickDown => EscalationAction::Skip,
                EscalationChainAction::Pause => EscalationAction::PauseForUser,
                EscalationChainAction::Escalate => {
                    // If escalate action, trigger escalation event
                    if let Some(target_tier_type) = to_tier_type(selection.step.to) {
                        self.trigger_escalation(tier_id, tier_type, target_tier_type)
                            .await?;
                    }
                    EscalationAction::EscalateToParent
                }
            };

            if selection.step.notify {
                log::warn!(
                    "Escalation step {} for {} at attempt {}: action={:?}",
                    selection.index,
                    tier_id,
                    attempt,
                    action
                );
            }

            Ok(action)
        } else {
            // No chain configured, check tier-level escalation config
            let tier_config = self.tier_config_for(tier_type);
            if let Some(escalation_target) = tier_config.escalation {
                let target_tier_type = to_tier_type(Some(escalation_target))
                    .ok_or_else(|| anyhow!("Invalid escalation target"))?;
                self.trigger_escalation(tier_id, tier_type, target_tier_type)
                    .await?;
                Ok(EscalationAction::EscalateToParent)
            } else {
                // No escalation configured, use retry as default
                Ok(EscalationAction::Retry)
            }
        }
    }

    /// Trigger escalation to a parent tier and emit event
    async fn trigger_escalation(
        &self,
        from_tier_id: &str,
        from_tier_type: TierType,
        to_tier_type: TierType,
    ) -> Result<()> {
        // Find parent tier of the target type
        let to_tier_id = {
            let tree = self.tier_tree.lock().unwrap();
            let current_node = tree
                .find_by_id(from_tier_id)
                .ok_or_else(|| anyhow!("Tier {} not found", from_tier_id))?;

            // Walk up the tree to find a parent of the target type
            let mut current_parent = current_node.parent;
            let mut found_id: Option<String> = None;

            while let Some(parent_idx) = current_parent {
                let parent_node = tree
                    .get_node(parent_idx)
                    .ok_or_else(|| anyhow!("Invalid parent index: {}", parent_idx))?;
                if parent_node.tier_type == to_tier_type {
                    found_id = Some(parent_node.id.clone());
                    break;
                }
                current_parent = parent_node.parent;
            }

            found_id.ok_or_else(|| {
                anyhow!(
                    "No parent tier of type {:?} found for tier {}",
                    to_tier_type,
                    from_tier_id
                )
            })?
        };

        // Emit escalation event
        let event = PuppetMasterEvent::Escalation {
            from_tier_id: from_tier_id.to_string(),
            to_tier_id: to_tier_id.clone(),
            reason: format!("Escalating from {:?} to {:?}", from_tier_type, to_tier_type),
            timestamp: Utc::now(),
        };

        let _ = self
            .event_sender
            .send(OrchestratorEvent::PuppetMasterEvent(event));

        log::info!(
            "Escalation triggered: {} ({:?}) -> {} ({:?})",
            from_tier_id,
            from_tier_type,
            to_tier_id,
            to_tier_type
        );

        Ok(())
    }

    /// Emit event
    fn emit_event(&self, event: OrchestratorEvent) {
        let _ = self.event_sender.send(event);
    }

    /// Get event receiver
    pub fn event_receiver(&self) -> &Receiver<OrchestratorEvent> {
        &self.event_receiver
    }

    /// Get current state
    pub fn current_state(&self) -> OrchestratorState {
        let sm = self.state_machine.lock().unwrap();
        sm.current_state()
    }

    /// Get tier tree statistics
    pub fn get_stats(&self) -> crate::core::tier_node::TreeStats {
        let tree = self.tier_tree.lock().unwrap();
        tree.get_stats()
    }

    /// Classify task complexity and route to appropriate platform
    fn classify_and_route_task(&self, tier_id: &str) -> Result<Platform> {
        let tree = self.tier_tree.lock().unwrap();
        let node = tree
            .find_by_id(tier_id)
            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

        // Build task info for classification
        let task_info = TaskInfo {
            title: node.title.clone(),
            description: node.description.clone(),
            acceptance_criteria: node.acceptance_criteria.clone(),
            test_command_count: 0, // Could be extracted from node if available
            additional_context: String::new(),
        };

        // Classify the task
        let classification = self.complexity_classifier.classify(&task_info);

        log::info!(
            "Task {} classified as {:?} ({:?}) -> model level {:?}",
            tier_id,
            classification.complexity,
            classification.task_type,
            classification.model_level
        );

        // Route to best platform
        let platform_router = self.platform_router.lock().unwrap();
        let routing_decision = platform_router.route(
            Some(self.tier_config_for(node.tier_type).platform),
            &classification,
            node.tier_type,
        )?;

        log::info!(
            "Routed task {} to {} ({})",
            tier_id,
            routing_decision.platform,
            routing_decision.reason
        );

        Ok(routing_decision.platform)
    }

    /// Check loop guard before attempting iteration
    fn check_loop_guard(&self, tier_id: &str, attempt: u32, feedback: Option<&str>) -> Result<()> {
        let mut loop_guard = self.loop_guard.lock().unwrap();

        // Create message for loop detection
        let message = LoopGuardMessage::new(
            "feedback",
            Some("reviewer"),
            Some(tier_id),
            feedback.unwrap_or(""),
        );

        let detection = loop_guard.check(&message);

        if detection.is_blocked() {
            return Err(anyhow!(
                "Loop detected for tier {} at attempt {}: {}",
                tier_id,
                attempt,
                detection.reason().unwrap_or_default()
            ));
        }

        Ok(())
    }

    /// Create a checkpoint with current orchestrator state
    async fn create_checkpoint(&self, reason: &str) -> Result<()> {
        let orchestrator_state = {
            let sm = self.state_machine.lock().unwrap();
            sm.current_state()
        };

        let (stats, tier_states) = {
            let tree = self.tier_tree.lock().unwrap();
            let stats = tree.get_stats();

            // Build tier states
            let mut tier_states = std::collections::HashMap::new();
            for node in tree.iter_dfs() {
                let tier_context = crate::core::state_persistence::TierContext {
                    state: node.state_machine.current_state(),
                    tier_type: node.tier_type,
                    item_id: node.id.clone(),
                    iteration_count: 0, // TODO: track iteration count in TierStateMachine
                    max_iterations: node.state_machine.max_iterations(),
                    last_error: None,
                };
                tier_states.insert(node.id.clone(), tier_context);
            }
            (stats, tier_states)
        };

        let metadata = CheckpointMetadata {
            project_name: self.config.project.name.clone(),
            completed_subtasks: stats.passed,
            total_subtasks: stats.subtasks,
            iterations_run: 0, // Could track this globally
        };

        let position = CurrentPosition {
            phase_id: None, // Could track current phase
            task_id: None,
            subtask_id: None,
            iteration: 0,
        };

        // Spawn blocking to avoid holding mutex across await
        let checkpoint_manager = self.checkpoint_manager.clone();
        let checkpoint_id = tokio::task::spawn_blocking(move || {
            let mut mgr = checkpoint_manager.lock().unwrap();
            // Use blocking runtime for the async call
            tokio::runtime::Handle::current().block_on(async {
                mgr.create(
                    orchestrator_state,
                    OrchestratorContext::default(),
                    tier_states,
                    position,
                    metadata,
                )
                .await
            })
        })
        .await
        .context("Failed to spawn checkpoint task")??;

        self.checkpoint_manager
            .lock()
            .unwrap()
            .update_last_checkpoint_time();

        log::info!("Created checkpoint {} (reason: {})", checkpoint_id, reason);
        Ok(())
    }

    /// Validate state transition using StateTransitions
    fn validate_tier_transition(&self, from: TierState, to: TierState) -> Result<()> {
        if state_transitions::can_transition_tier(from, to) {
            Ok(())
        } else {
            Err(anyhow!(
                "Invalid tier state transition: {:?} -> {:?}",
                from,
                to
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::default_config::default_config;
    use crate::git::CommitFormatter;
    use chrono::Utc;
    use std::collections::VecDeque;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[derive(Debug)]
    struct MockIterationExecutor {
        results: Mutex<VecDeque<Result<crate::core::execution_engine::IterationResult>>>,
        calls: AtomicUsize,
    }

    impl MockIterationExecutor {
        fn new(results: Vec<Result<crate::core::execution_engine::IterationResult>>) -> Self {
            Self {
                results: Mutex::new(results.into()),
                calls: AtomicUsize::new(0),
            }
        }

        fn call_count(&self) -> usize {
            self.calls.load(Ordering::SeqCst)
        }
    }

    #[async_trait]
    impl IterationExecutor for MockIterationExecutor {
        async fn execute_iteration(
            &self,
            _context: &IterationContext,
        ) -> Result<crate::core::execution_engine::IterationResult> {
            self.calls.fetch_add(1, Ordering::SeqCst);
            let mut guard = self.results.lock().unwrap();
            guard.pop_front().unwrap_or_else(|| {
                Ok(crate::core::execution_engine::IterationResult {
                    signal: CompletionSignal::Complete,
                    duration_secs: 0,
                    output_lines: 0,
                })
            })
        }
    }

    #[derive(Debug)]
    struct MockGateRunner {
        reports: Mutex<VecDeque<GateReport>>,
        calls: AtomicUsize,
    }

    impl MockGateRunner {
        fn new(reports: Vec<GateReport>) -> Self {
            Self {
                reports: Mutex::new(reports.into()),
                calls: AtomicUsize::new(0),
            }
        }

        fn call_count(&self) -> usize {
            self.calls.load(Ordering::SeqCst)
        }
    }

    #[async_trait]
    impl GateExecutor for MockGateRunner {
        async fn run_gate(
            &self,
            _gate_type: &str,
            _gate_id: &str,
            _criteria: &[Criterion],
            _test_plan: Option<&TestPlan>,
        ) -> GateReport {
            self.calls.fetch_add(1, Ordering::SeqCst);
            let mut guard = self.reports.lock().unwrap();
            guard.pop_front().unwrap_or_else(|| GateReport {
                gate_type: "task".to_string(),
                passed: true,
                timestamp: Utc::now(),
                report: None,
                criteria: Vec::new(),
                reviewer_notes: None,
            })
        }
    }

    #[derive(Debug, Default)]
    struct MockSessionTracker {
        started: Mutex<Vec<String>>,
        completed: Mutex<Vec<String>>,
        failed: Mutex<Vec<(String, String)>>,
        counter: AtomicUsize,
    }

    impl MockSessionTracker {
        fn started_count(&self) -> usize {
            self.started.lock().unwrap().len()
        }
        fn completed_count(&self) -> usize {
            self.completed.lock().unwrap().len()
        }
        fn failed_count(&self) -> usize {
            self.failed.lock().unwrap().len()
        }
    }

    impl SessionLifecycle for MockSessionTracker {
        fn start_session(
            &self,
            _tier_id: String,
            _tier_type: TierType,
            _platform: Platform,
            _model: String,
        ) -> Result<String> {
            let n = self.counter.fetch_add(1, Ordering::SeqCst) + 1;
            let id = format!("PM-TEST-{:03}", n);
            self.started.lock().unwrap().push(id.clone());
            Ok(id)
        }

        fn complete_session(&self, session_id: &str) -> Result<()> {
            self.completed.lock().unwrap().push(session_id.to_string());
            Ok(())
        }

        fn fail_session(&self, session_id: &str, error: String) -> Result<()> {
            self.failed
                .lock()
                .unwrap()
                .push((session_id.to_string(), error));
            Ok(())
        }
    }

    fn build_test_tree(max_iterations: u32) -> TierTree {
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1".to_string(),
            "Phase desc".to_string(),
            None,
            max_iterations,
        )
        .unwrap();
        tree.add_node(
            "1.1".to_string(),
            TierType::Task,
            "Task 1.1".to_string(),
            "Task desc".to_string(),
            Some("1".to_string()),
            max_iterations,
        )
        .unwrap();
        tree.add_node(
            "1.1.1".to_string(),
            TierType::Subtask,
            "Subtask 1.1.1".to_string(),
            "Subtask desc".to_string(),
            Some("1.1".to_string()),
            max_iterations,
        )
        .unwrap();
        tree
    }

    fn passed_report() -> GateReport {
        GateReport {
            gate_type: "task".to_string(),
            passed: true,
            timestamp: Utc::now(),
            report: None,
            criteria: Vec::new(),
            reviewer_notes: None,
        }
    }

    fn failed_report(reason: &str) -> GateReport {
        GateReport {
            gate_type: "task".to_string(),
            passed: false,
            timestamp: Utc::now(),
            report: Some(reason.to_string()),
            criteria: Vec::new(),
            reviewer_notes: None,
        }
    }

    fn build_orchestrator(
        tree: TierTree,
        iteration_executor: Arc<dyn IterationExecutor>,
        gate_runner: Arc<dyn GateExecutor>,
        session_tracker: Arc<dyn SessionLifecycle>,
    ) -> Orchestrator {
        let config = default_config();
        let (event_sender, event_receiver) = crossbeam_channel::unbounded();

        // Initialize test-only services with temporary directory
        let temp_dir =
            std::env::temp_dir().join(format!("puppet-master-test-{}", std::process::id()));
        let _ = std::fs::create_dir_all(&temp_dir);
        let puppet_master_dir = temp_dir.join(".puppet-master");
        let _ = std::fs::create_dir_all(&puppet_master_dir);

        let logger_service = LoggerService::new(puppet_master_dir.clone(), false);
        let progress_manager = ProgressManager::new(&temp_dir.join("progress.txt")).unwrap();
        let usage_tracker = UsageTracker::new(&puppet_master_dir.join("usage.jsonl")).unwrap();
        let git_manager = GitManager::new(temp_dir.clone());
        let branch_strategy = BranchStrategy::Feature;
        let commit_formatter = CommitFormatter;

        // Initialize new modules
        let complexity_classifier = ComplexityClassifier::new();
        let dependency_analyzer = DependencyAnalyzer::new();
        let platform_router = Arc::new(Mutex::new(PlatformRouter::with_defaults()));
        let loop_guard = Arc::new(Mutex::new(LoopGuard::default_config()));
        let fresh_spawn = FreshSpawn::with_defaults();
        let checkpoint_manager = Arc::new(Mutex::new(CheckpointManager::new(
            CheckpointManagerConfig::default(),
        )));
        let parallel_executor = ParallelExecutor::with_defaults();

        Orchestrator {
            config,
            state_machine: Arc::new(Mutex::new(OrchestratorStateMachine::new())),
            tier_tree: Arc::new(Mutex::new(tree)),
            advancement_engine: Arc::new(AdvancementEngine::new()),
            escalation_engine: Arc::new(EscalationEngine::with_defaults()),
            _worker_reviewer: Arc::new(WorkerReviewer::with_defaults()),
            event_sender,
            event_receiver,
            _last_checkpoint: Arc::new(Mutex::new(Instant::now())),
            prompt_builder: PromptBuilder::new(),
            iteration_executor,
            gate_runner,
            session_tracker,
            logger_service,
            progress_manager,
            usage_tracker,
            _git_manager: git_manager,
            _branch_strategy: branch_strategy,
            _verification_integration: None,
            complexity_classifier,
            _dependency_analyzer: dependency_analyzer,
            platform_router,
            loop_guard,
            _fresh_spawn: fresh_spawn,
            checkpoint_manager,
            _parallel_executor: parallel_executor,
        }
    }

    #[tokio::test]
    async fn execute_tier_happy_path() {
        let tree = build_test_tree(3);

        let exec = Arc::new(MockIterationExecutor::new(vec![Ok(
            crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
            },
        )]));
        let gate = Arc::new(MockGateRunner::new(vec![passed_report()]));
        let sessions = Arc::new(MockSessionTracker::default());

        let orchestrator = build_orchestrator(tree, exec.clone(), gate.clone(), sessions.clone());
        orchestrator.execute_tier("1.1.1").await.unwrap();

        let tree = orchestrator.tier_tree.lock().unwrap();
        let node = tree.find_by_id("1.1.1").unwrap();
        assert_eq!(node.state_machine.current_state(), TierState::Passed);

        assert_eq!(exec.call_count(), 1);
        assert_eq!(gate.call_count(), 1);
        assert_eq!(sessions.started_count(), 1);
        assert_eq!(sessions.completed_count(), 1);
        assert_eq!(sessions.failed_count(), 0);
    }

    #[tokio::test]
    async fn execute_tier_retries_on_timeout() {
        let tree = build_test_tree(3);

        let exec = Arc::new(MockIterationExecutor::new(vec![
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Timeout,
                duration_secs: 0,
                output_lines: 0,
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
            }),
        ]));
        let gate = Arc::new(MockGateRunner::new(vec![passed_report()]));
        let sessions = Arc::new(MockSessionTracker::default());

        let orchestrator = build_orchestrator(tree, exec.clone(), gate.clone(), sessions.clone());
        orchestrator.execute_tier("1.1.1").await.unwrap();

        let tree = orchestrator.tier_tree.lock().unwrap();
        let node = tree.find_by_id("1.1.1").unwrap();
        assert_eq!(node.state_machine.current_state(), TierState::Passed);

        assert_eq!(exec.call_count(), 2);
        assert_eq!(gate.call_count(), 1);
        assert_eq!(sessions.started_count(), 2);
        assert_eq!(sessions.completed_count(), 1);
        assert_eq!(sessions.failed_count(), 1);
    }

    #[tokio::test]
    async fn execute_tier_retries_on_gate_failure() {
        let tree = build_test_tree(3);

        let exec = Arc::new(MockIterationExecutor::new(vec![
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
            }),
        ]));
        let gate = Arc::new(MockGateRunner::new(vec![
            failed_report("tests failed"),
            passed_report(),
        ]));
        let sessions = Arc::new(MockSessionTracker::default());

        let orchestrator = build_orchestrator(tree, exec.clone(), gate.clone(), sessions.clone());
        orchestrator.execute_tier("1.1.1").await.unwrap();

        let tree = orchestrator.tier_tree.lock().unwrap();
        let node = tree.find_by_id("1.1.1").unwrap();
        assert_eq!(node.state_machine.current_state(), TierState::Passed);

        assert_eq!(exec.call_count(), 2);
        assert_eq!(gate.call_count(), 2);
        assert_eq!(sessions.started_count(), 2);
        assert_eq!(sessions.completed_count(), 2);
        assert_eq!(sessions.failed_count(), 0);
    }

    #[tokio::test]
    async fn execute_tier_fails_after_max_iterations() {
        let tree = build_test_tree(2);

        let exec = Arc::new(MockIterationExecutor::new(vec![
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Stalled,
                duration_secs: 0,
                output_lines: 0,
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Stalled,
                duration_secs: 0,
                output_lines: 0,
            }),
        ]));
        let gate = Arc::new(MockGateRunner::new(vec![]));
        let sessions = Arc::new(MockSessionTracker::default());

        let orchestrator = build_orchestrator(tree, exec.clone(), gate, sessions.clone());
        let err = orchestrator.execute_tier("1.1.1").await.unwrap_err();
        assert!(err.to_string().contains("failed") || err.to_string().contains("attempt"));

        let tree = orchestrator.tier_tree.lock().unwrap();
        let node = tree.find_by_id("1.1.1").unwrap();
        assert_eq!(node.state_machine.current_state(), TierState::Failed);

        assert_eq!(exec.call_count(), 2);
        assert_eq!(sessions.started_count(), 2);
        assert_eq!(sessions.failed_count(), 2);
    }
}
