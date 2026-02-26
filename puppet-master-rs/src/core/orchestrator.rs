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
use crate::git::{GitManager, PrManager, WorktreeManager};
use crate::logging::{ActivityEventType, LoggerService};
use crate::state::{AgentsManager, GateEnforcer, ProgressManager, PromotionEngine, UsageTracker};
use crate::types::BranchStrategy;
use crate::types::*;
use crate::verification::{GateRunConfig, GateRunner, VerificationIntegration};
use anyhow::{Context, Result, anyhow};
use async_trait::async_trait;
use chrono::Utc;
use crossbeam_channel::{Receiver, Sender};
use std::collections::HashMap;
use std::path::Path;
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

// DRY:DATA:Orchestrator
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
    worker_reviewer: Arc<WorkerReviewer>,
    /// Event sender
    event_sender: Sender<OrchestratorEvent>,
    /// Event receiver (for external subscribers)
    event_receiver: Receiver<OrchestratorEvent>,
    /// Last checkpoint time
    last_checkpoint: Arc<Mutex<Instant>>,
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
    /// AGENTS.md manager for learnings persistence
    agents_manager: AgentsManager,
    /// Git manager for git operations
    git_manager: GitManager,
    /// Branch strategy for git branch naming
    branch_strategy: BranchStrategy,
    /// PR manager for pull request creation
    pr_manager: PrManager,
    /// Verification integration
    verification_integration: Option<VerificationIntegration>,
    /// Complexity classifier for task classification
    complexity_classifier: ComplexityClassifier,
    /// Dependency analyzer for subtask ordering
    dependency_analyzer: DependencyAnalyzer,
    /// Platform router for platform selection
    platform_router: Arc<Mutex<PlatformRouter>>,
    /// Loop guard for iteration loop detection
    loop_guard: Arc<Mutex<LoopGuard>>,
    /// Fresh spawn manager for process spawning
    fresh_spawn: FreshSpawn,
    /// Checkpoint manager for state persistence
    checkpoint_manager: Arc<Mutex<CheckpointManager>>,
    /// Parallel executor for concurrent subtasks
    parallel_executor: ParallelExecutor,
    /// Promotion engine for AGENTS.md learning promotion
    promotion_engine: Arc<Mutex<PromotionEngine>>,
    /// Gate enforcer for AGENTS.md rule enforcement
    gate_enforcer: Arc<GateEnforcer>,
    /// Worktree manager for parallel subtask isolation
    worktree_manager: Arc<WorktreeManager>,
    /// Active worktree paths for subtasks (tier_id -> worktree_path)
    active_worktrees: Arc<Mutex<HashMap<String, std::path::PathBuf>>>,
}

impl Orchestrator {
    // DRY:FN:new
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

        let iteration_executor: Arc<dyn IterationExecutor> =
            Arc::new(ExecutionEngine::new(event_sender.clone(), 120, 10));

        let gate_runner: Arc<dyn GateExecutor> =
            Arc::new(GateRunner::new(GateRunConfig::default()));

        // Ensure workspace directory exists and is writable
        let workspace_just_created = !config.paths.workspace.exists();
        if workspace_just_created {
            std::fs::create_dir_all(&config.paths.workspace).with_context(|| {
                format!(
                    "Failed to create workspace directory: {}. Please ensure the path is writable.",
                    config.paths.workspace.display()
                )
            })?;
        }

        // Verify workspace is writable only when it already existed (if we just created it,
        // creation success proves writability). Skipping the write-test on a freshly created
        // directory avoids concurrent-write races (e.g. Windows ERROR_SHARING_VIOLATION) when
        // multiple test threads all use the same workspace path at startup.
        // Note: failure here is a warning only — if writes truly fail, later operations will
        // surface clearer errors; treating this as fatal causes spurious test failures on
        // Windows SSH sessions where AppData ACLs differ from interactive sessions.
        if !workspace_just_created {
            let test_file = config.paths.workspace.join(format!(
                ".puppet-master-write-test-{}",
                std::process::id()
            ));
            match std::fs::write(&test_file, "test") {
                Ok(()) => { std::fs::remove_file(&test_file).ok(); }
                Err(e) => {
                    log::warn!(
                        "Workspace directory may not be writable: {}. Error: {}",
                        config.paths.workspace.display(),
                        e
                    );
                }
            }
        }

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

        // Initialize AGENTS.md manager
        let agents_manager = AgentsManager::new(&config.paths.workspace);

        // Initialize git manager
        let git_manager = GitManager::new(config.paths.workspace.clone());

        // Initialize branch strategy
        let branch_strategy = BranchStrategy::Feature; // Default strategy

        // Initialize PR manager
        let pr_manager = PrManager::new(config.paths.workspace.clone());

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

        // Initialize promotion engine for learning promotion
        let promotion_engine = Arc::new(Mutex::new(PromotionEngine::with_defaults()));

        // Initialize gate enforcer for AGENTS.md rule enforcement
        let gate_enforcer = Arc::new(GateEnforcer::new());

        // Initialize worktree manager for parallel subtask isolation
        let worktree_manager = Arc::new(WorktreeManager::new(config.paths.workspace.clone()));
        let active_worktrees = Arc::new(Mutex::new(HashMap::new()));

        Ok(Self {
            config,
            state_machine: Arc::new(Mutex::new(OrchestratorStateMachine::new())),
            tier_tree: Arc::new(Mutex::new(TierTree::new())),
            advancement_engine,
            escalation_engine,
            worker_reviewer,
            event_sender,
            event_receiver,
            last_checkpoint: Arc::new(Mutex::new(Instant::now())),
            prompt_builder,
            iteration_executor,
            gate_runner,
            session_tracker,
            logger_service,
            progress_manager,
            usage_tracker,
            agents_manager,
            git_manager,
            branch_strategy,
            pr_manager,
            verification_integration,
            complexity_classifier,
            dependency_analyzer,
            platform_router,
            loop_guard,
            fresh_spawn,
            checkpoint_manager,
            parallel_executor,
            promotion_engine,
            gate_enforcer,
            worktree_manager,
            active_worktrees,
        })
    }

    /// Load PRD and build tier tree
    pub async fn load_prd(&self, prd: &PRD) -> Result<()> {
        let mut tree = self.tier_tree.lock().unwrap();
        // Pass workspace path as base_path to enable test strategy loading
        *tree = TierTree::from_prd_with_base_path(
            prd,
            self.config.orchestrator.max_iterations,
            Some(&self.config.paths.workspace),
        )?;
        Ok(())
    }

    // DRY:FN:logger_service
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

    /// Create git branch for tier execution (if git enabled)
    async fn create_tier_branch(
        &self,
        tier_id: &str,
        tier_type: TierType,
    ) -> Result<Option<String>> {
        if !self.config.orchestrator.enable_git {
            return Ok(None);
        }

        // Generate branch name based on strategy
        let branch_name = match self.branch_strategy {
            BranchStrategy::MainOnly => return Ok(Some("main".to_string())),
            BranchStrategy::Feature | BranchStrategy::Tier => match tier_type {
                TierType::Phase => format!("ph-{}", tier_id.to_lowercase().replace("_", "-")),
                TierType::Task => format!("tk-{}", tier_id.to_lowercase().replace("_", "-")),
                TierType::Subtask => format!("st-{}", tier_id.to_lowercase().replace("_", "-")),
                TierType::Iteration => format!("it-{}", tier_id.to_lowercase().replace("_", "-")),
            },
            BranchStrategy::Release => {
                format!("release/{}", tier_id.to_lowercase().replace("_", "-"))
            }
        };

        match self.git_manager.create_branch(&branch_name).await {
            Ok(_) => {
                log::info!("Created git branch: {}", branch_name);
                Ok(Some(branch_name))
            }
            Err(e) => {
                log::warn!(
                    "Failed to create git branch: {}. Continuing without git integration.",
                    e
                );
                Ok(None)
            }
        }
    }

    /// Parse AGENTS.md updates from agent output
    fn parse_agents_updates(&self, output: &str) -> Vec<(String, String)> {
        let mut updates = Vec::new();

        // Look for agents-update code blocks
        let mut in_block = false;
        for line in output.lines() {
            if line.trim() == "```agents-update" {
                in_block = true;
                continue;
            }
            if line.trim() == "```" && in_block {
                in_block = false;
                continue;
            }

            if in_block {
                let trimmed = line.trim();
                if let Some(pattern) = trimmed.strip_prefix("PATTERN:") {
                    updates.push(("pattern".to_string(), pattern.trim().to_string()));
                } else if let Some(failure) = trimmed.strip_prefix("FAILURE:") {
                    updates.push(("failure".to_string(), failure.trim().to_string()));
                } else if let Some(do_item) = trimmed.strip_prefix("DO:") {
                    updates.push(("do".to_string(), do_item.trim().to_string()));
                } else if let Some(dont_item) = trimmed.strip_prefix("DONT:") {
                    updates.push(("dont".to_string(), dont_item.trim().to_string()));
                }
            }
        }

        updates
    }

    /// Process AGENTS.md updates from iteration output
    async fn process_agents_updates(
        &self,
        tier_id: &str,
        output: &str,
        success: bool,
    ) -> Result<()> {
        let updates = self.parse_agents_updates(output);

        if updates.is_empty() {
            return Ok(()); // No updates to process
        }

        log::debug!(
            "Processing {} AGENTS.md updates for tier {}",
            updates.len(),
            tier_id
        );

        for (update_type, content) in updates {
            match update_type.as_str() {
                "pattern" => {
                    if let Err(e) = self.agents_manager.append_pattern(tier_id, content.clone()) {
                        log::warn!("Failed to append pattern to AGENTS.md: {}", e);
                    } else {
                        log::debug!("Added pattern: {}", content);

                        // Record pattern usage for promotion evaluation
                        let mut engine = self.promotion_engine.lock().unwrap();
                        if let Err(e) = engine.record_usage(&content, tier_id, success) {
                            log::warn!("Failed to record pattern usage: {}", e);
                        }
                    }
                }
                "failure" => {
                    if let Err(e) = self.agents_manager.append_failure(tier_id, content.clone()) {
                        log::warn!("Failed to append failure to AGENTS.md: {}", e);
                    } else {
                        log::debug!("Added failure mode: {}", content);
                    }
                }
                "do" => {
                    if let Err(e) = self.agents_manager.append_do(tier_id, content.clone()) {
                        log::warn!("Failed to append do item to AGENTS.md: {}", e);
                    } else {
                        log::debug!("Added do item: {}", content);
                    }
                }
                "dont" => {
                    if let Err(e) = self.agents_manager.append_dont(tier_id, content.clone()) {
                        log::warn!("Failed to append dont item to AGENTS.md: {}", e);
                    } else {
                        log::debug!("Added dont item: {}", content);
                    }
                }
                _ => {}
            }
        }

        Ok(())
    }

    /// Commit changes after successful tier iteration
    async fn commit_tier_progress(
        &self,
        tier_id: &str,
        _tier_type: TierType,
        iteration: u32,
    ) -> Result<()> {
        if !self.config.orchestrator.enable_git {
            return Ok(());
        }

        let git = if let Some(path) = self.get_tier_worktree(tier_id) {
            GitManager::new(path)
        } else {
            self.git_manager.clone()
        };

        let message = format!("tier: {} iteration {} complete", tier_id, iteration);

        if let Err(e) = git.add_all().await {
            log::warn!("Failed to stage changes for tier {}: {}", tier_id, e);
        }

        match git.commit(&message).await {
            Ok(_) => {
                log::info!("Committed tier {} progress", tier_id);
                Ok(())
            }
            Err(e) => {
                log::warn!("Failed to commit tier progress: {}. Continuing.", e);
                Ok(())
            }
        }
    }

    /// Create pull request for tier after successful completion
    /// Create pull request for completed tier
    ///
    /// # Graceful Error Handling
    ///
    /// This method handles PR creation failures gracefully:
    /// - Runs preflight checks via `PrManager::create_pr()`
    /// - If preflight fails (gh not installed/authenticated), logs warning and continues
    /// - If PR creation fails, logs warning and continues
    /// - **Never panics or crashes** - always returns `Ok(())`
    ///
    /// This ensures the orchestrator can continue operating even in environments
    /// without gh CLI (CI/headless) or without GitHub authentication.
    ///
    /// # Arguments
    /// * `tier_id` - Tier identifier
    /// * `tier_type` - Type of tier (Phase/Task/Subtask/Iteration)
    ///
    /// # Example Behavior
    /// ```text
    /// Without gh CLI:
    ///   WARN: Failed to create PR for tier TK-001: Preflight check failed:
    ///         gh CLI not found. Install from https://cli.github.com/
    ///   → Orchestrator continues normally
    ///
    /// With gh CLI but not authenticated:
    ///   WARN: Failed to create PR for tier TK-001: Preflight check failed:
    ///         gh CLI not authenticated. Run 'gh auth login'
    ///   → Orchestrator continues normally
    ///
    /// With gh CLI authenticated:
    ///   INFO: Created PR for tier TK-001: https://github.com/owner/repo/pull/42
    ///   → PR created successfully
    /// ```
    async fn create_tier_pr(&self, tier_id: &str, tier_type: TierType) -> Result<()> {
        // Check if auto-PR is enabled
        if !self.config.branching.auto_pr {
            return Ok(());
        }

        if !self.config.orchestrator.enable_git {
            return Ok(());
        }

        // Get tier information for PR
        let (title, description, acceptance_criteria) = {
            let tree = self.tier_tree.lock().unwrap();
            let node = tree
                .find_by_id(tier_id)
                .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

            let title = node.title.clone();
            let description = node.description.clone();
            let criteria = node.acceptance_criteria.clone();

            (title, description, criteria)
        };

        // Determine head branch name
        let head_branch = if self.get_tier_worktree(tier_id).is_some() {
            match self.worktree_manager.list_worktrees().await {
                Ok(worktrees) => worktrees
                    .into_iter()
                    .find(|w| w.tier_id == tier_id)
                    .map(|w| w.branch)
                    .unwrap_or_else(|| "".to_string()),
                Err(_) => "".to_string(),
            }
        } else {
            "".to_string()
        };

        let head_branch = if !head_branch.is_empty() {
            head_branch
        } else {
            match self.git_manager.current_branch().await {
                Ok(branch) => branch,
                Err(e) => {
                    log::warn!("Failed to get current branch for PR: {}", e);
                    return Ok(());
                }
            }
        };

        // Generate PR title and body
        let tier_type_str = match tier_type {
            TierType::Phase => "Phase",
            TierType::Task => "Task",
            TierType::Subtask => "Subtask",
            TierType::Iteration => "Iteration",
        };

        let pr_title = PrManager::generate_pr_title(tier_type_str, tier_id, &title);
        let pr_body = PrManager::generate_pr_body(&description, &acceptance_criteria, &[]);

        // Create PR
        let base_branch = &self.config.branching.base_branch;
        match self
            .pr_manager
            .create_pr(&pr_title, &pr_body, base_branch, &head_branch)
            .await
        {
            Ok(result) => {
                if result.success {
                    if let Some(url) = result.pr_url {
                        log::info!("Created PR for tier {}: {}", tier_id, url);

                        // Log PR creation activity
                        let _ = self.logger_service.log_activity(
                            ActivityEventType::OrchestrationCompleted,
                            format!("Created PR for tier {}: {}", tier_id, url),
                        );
                    } else {
                        log::info!("PR created successfully for tier {}", tier_id);
                    }
                } else {
                    log::warn!(
                        "Failed to create PR for tier {}: {}",
                        tier_id,
                        result.message
                    );
                }
                Ok(())
            }
            Err(e) => {
                log::warn!(
                    "Failed to create PR for tier {}: {}. Continuing.",
                    tier_id,
                    e
                );
                Ok(())
            }
        }
    }

    /// Run verification gate (if verification enabled)
    async fn run_verification_gate(
        &self,
        tier_id: &str,
        tier_type: TierType,
        criteria: &[Criterion],
    ) -> Result<bool> {
        if !self.config.orchestrator.enable_verification {
            return Ok(true); // Skip verification if disabled
        }

        if let Some(ref verification) = self.verification_integration {
            let gate_type = self.gate_type_for(tier_type);
            match verification
                .run_gate(gate_type, tier_id, criteria, None)
                .await
            {
                report => {
                    log::info!(
                        "Verification gate for {}: {}",
                        tier_id,
                        if report.passed { "PASSED" } else { "FAILED" }
                    );
                    Ok(report.passed)
                }
            }
        } else {
            Ok(true) // No verification configured
        }
    }

    /// Enforce AGENTS.md gate rules
    ///
    /// Checks that AGENTS.md has been properly updated with learnings before allowing
    /// tier completion. This ensures agents document patterns and failures.
    async fn enforce_agents_gate(&self, tier_id: &str) -> Result<()> {
        // Load AGENTS.md for this tier
        let agents_doc = self
            .agents_manager
            .load(tier_id)
            .context("Failed to load AGENTS.md for enforcement")?;

        // Get the raw content for section checking
        let agents_path = self.agents_manager.get_agents_path(tier_id);
        let agents_content = if agents_path.exists() {
            std::fs::read_to_string(&agents_path).context("Failed to read AGENTS.md content")?
        } else {
            String::new()
        };

        // Keep a baseline enforcer instance alive on the orchestrator for shared policy configuration.
        let _baseline_gate_enforcer = &self.gate_enforcer;

        // Create tier-specific enforcer (higher tiers have stricter rules).
        let tier_enforcer = GateEnforcer::for_tier(tier_id);

        // Run enforcement
        let result = tier_enforcer
            .enforce(&agents_content, &agents_doc)
            .context("Failed to run AGENTS.md enforcement")?;

        if !result.passed {
            // Log violations
            for violation in &result.violations {
                log::warn!(
                    "AGENTS.md violation [{}]: {} - {}",
                    match violation.severity {
                        crate::state::ViolationSeverity::Error => "ERROR",
                        crate::state::ViolationSeverity::Warning => "WARN",
                        crate::state::ViolationSeverity::Info => "INFO",
                    },
                    violation.rule,
                    violation.description
                );
            }

            // Build error message from violations
            let error_msgs: Vec<String> = result
                .violations
                .iter()
                .filter(|v| v.severity == crate::state::ViolationSeverity::Error)
                .map(|v| format!("{}: {}", v.rule, v.description))
                .collect();

            if !error_msgs.is_empty() {
                return Err(anyhow!(
                    "AGENTS.md enforcement failed:\n  - {}",
                    error_msgs.join("\n  - ")
                ));
            }
        }

        // Log warnings even if passing
        for warning in &result.warnings {
            log::info!("AGENTS.md gate warning: {}", warning);
        }

        log::info!("AGENTS.md gate enforcement passed for tier {}", tier_id);
        Ok(())
    }

    /// Promote tier learnings to parent/root levels
    ///
    /// Evaluates patterns and learnings from completed tier and promotes high-value
    /// entries up the hierarchy (subtask → task → phase → root).
    async fn promote_tier_learnings(&self, tier_id: &str) -> Result<()> {
        log::debug!("Evaluating learnings promotion for tier {}", tier_id);

        // Load AGENTS.md for this tier
        let agents_doc = self
            .agents_manager
            .load(tier_id)
            .context("Failed to load AGENTS.md for promotion")?;

        if agents_doc.agents.is_empty() {
            log::debug!("No learnings to promote for tier {}", tier_id);
            return Ok(());
        }

        // Evaluate candidates for promotion
        let candidates = {
            let engine = self.promotion_engine.lock().unwrap();
            engine.evaluate(&agents_doc.agents)
        };

        if candidates.is_empty() {
            log::debug!("No learnings meet promotion criteria for tier {}", tier_id);
            return Ok(());
        }

        log::info!(
            "Found {} learning(s) eligible for promotion from tier {}",
            candidates.len(),
            tier_id
        );

        // Promote each candidate
        let engine = self.promotion_engine.lock().unwrap();
        for candidate in candidates {
            match engine.promote(&candidate, &self.agents_manager) {
                Ok(()) => {
                    log::info!(
                        "✓ Promoted '{}' from {} to {} (score: {:.2})",
                        candidate.entry_text.chars().take(60).collect::<String>(),
                        candidate.source_tier,
                        candidate.target_tier,
                        candidate.score
                    );
                }
                Err(e) => {
                    log::warn!(
                        "Failed to promote learning from {} to {}: {}",
                        candidate.source_tier,
                        candidate.target_tier,
                        e
                    );
                }
            }
        }

        Ok(())
    }

    /// Select optimal platform using platform router (if enabled)
    fn select_platform(&self, tier_id: &str, tier_type: TierType) -> Result<Platform> {
        if !self.config.orchestrator.enable_platform_router {
            return Ok(self.tier_config_for(tier_type).platform);
        }

        self.classify_and_route_task(tier_id).or_else(|e| {
            log::warn!(
                "Platform routing failed for {}: {}. Using default.",
                tier_id,
                e
            );
            Ok(self.tier_config_for(tier_type).platform)
        })
    }

    /// Create worktree for a subtask
    async fn create_subtask_worktree(
        &self,
        subtask_id: &str,
    ) -> Result<Option<std::path::PathBuf>> {
        if !self.config.orchestrator.enable_parallel_execution {
            return Ok(None);
        }

        // Generate branch name for the subtask
        let branch = format!("subtask/{}", subtask_id.replace('.', "-"));

        // Create worktree
        match self
            .worktree_manager
            .create_worktree(subtask_id, &branch)
            .await
        {
            Ok(info) => {
                log::info!(
                    "Created worktree for subtask {} at {:?}",
                    subtask_id,
                    info.path
                );

                // Register the worktree path
                let mut worktrees = self.active_worktrees.lock().unwrap();
                worktrees.insert(subtask_id.to_string(), info.path.clone());

                Ok(Some(info.path))
            }
            Err(e) => {
                log::warn!(
                    "Failed to create worktree for subtask {}: {}. Falling back to main repo.",
                    subtask_id,
                    e
                );
                Ok(None)
            }
        }
    }

    /// Get worktree path for a tier (if one exists)
    fn get_tier_worktree(&self, tier_id: &str) -> Option<std::path::PathBuf> {
        let worktrees = self.active_worktrees.lock().unwrap();
        worktrees.get(tier_id).cloned()
    }

    /// Cleanup and merge worktree after subtask completion
    async fn cleanup_subtask_worktree(&self, subtask_id: &str, success: bool) -> Result<()> {
        if !self.config.orchestrator.enable_parallel_execution {
            return Ok(());
        }

        // Unregister the worktree path
        {
            let mut worktrees = self.active_worktrees.lock().unwrap();
            worktrees.remove(subtask_id);
        }

        // Check if worktree exists
        if !self.worktree_manager.worktree_exists(subtask_id).await {
            return Ok(());
        }

        if success {
            // Merge changes back to base branch if auto_pr is disabled
            if !self.config.branching.auto_pr {
                let base_branch = &self.config.branching.base_branch;
                match self
                    .worktree_manager
                    .merge_worktree(subtask_id, base_branch)
                    .await
                {
                    Ok(result) => {
                        if result.success {
                            log::info!(
                                "Merged worktree for subtask {} into {} ({} files changed)",
                                subtask_id,
                                base_branch,
                                result.files_changed.len()
                            );
                        } else {
                            log::warn!(
                                "Merge conflicts detected for subtask {}: {:?}",
                                subtask_id,
                                result.conflicts
                            );
                            // Don't remove worktree if there are conflicts
                            return Ok(());
                        }
                    }
                    Err(e) => {
                        log::warn!("Failed to merge worktree for subtask {}: {}", subtask_id, e);
                        // Continue to cleanup anyway
                    }
                }
            }
        }

        // Remove worktree
        if let Err(e) = self.worktree_manager.remove_worktree(subtask_id).await {
            log::warn!(
                "Failed to remove worktree for subtask {}: {}",
                subtask_id,
                e
            );
        } else {
            log::debug!("Removed worktree for subtask {}", subtask_id);
        }

        Ok(())
    }

    /// Execute subtasks in parallel (if enabled and applicable)
    async fn execute_subtasks_parallel(&self, subtask_ids: &[String]) -> Result<Vec<Result<()>>> {
        if !self.config.orchestrator.enable_parallel_execution || subtask_ids.len() <= 1 {
            // Sequential execution
            let mut results = Vec::new();
            for id in subtask_ids {
                results.push(self.execute_tier(id).await);
            }
            return Ok(results);
        }

        let parallel_config = self.parallel_executor.config();
        log::debug!(
            "Parallel executor config: max_concurrent={}, continue_on_failure={}, task_timeout_secs={}",
            parallel_config.max_concurrent,
            parallel_config.continue_on_failure,
            parallel_config.task_timeout_secs
        );
        log::info!("Executing {} subtasks in parallel", subtask_ids.len());

        // Build dependency list from tier nodes (if any)
        let dependencies: Vec<(String, Vec<String>)> = {
            let tree = self.tier_tree.lock().unwrap();
            subtask_ids
                .iter()
                .map(|id| {
                    let deps = tree
                        .find_by_id(id)
                        .map(|n| n.dependencies.clone())
                        .unwrap_or_default();
                    (id.clone(), deps)
                })
                .collect()
        };

        // Get parallelizable groups
        let groups = self
            .dependency_analyzer
            .get_parallelizable_groups(dependencies)?;

        log::debug!(
            "Executing {} groups of parallelizable subtasks",
            groups.len()
        );

        // Execute each group sequentially, but within each group execute subtasks concurrently.
        let mut all_results = Vec::new();
        for group in groups {
            // Create worktrees for each subtask in the group
            for id in &group {
                let _ = self.create_subtask_worktree(id).await?;
            }

            use futures::future::join_all;

            let results = join_all(group.iter().map(|id| async {
                let res = self.execute_tier(id).await;
                (id.clone(), res)
            }))
            .await;

            // Cleanup worktrees sequentially to avoid concurrent merges/checkouts in the main repo.
            for (id, result) in results {
                let success = result.is_ok();

                if let Err(e) = self.cleanup_subtask_worktree(&id, success).await {
                    log::warn!("Failed to cleanup worktree for subtask {}: {}", id, e);
                }

                all_results.push(result);
            }
        }

        Ok(all_results)
    }

    /// Check if we should create a checkpoint
    fn should_checkpoint(&self) -> bool {
        let last = self.last_checkpoint.lock().unwrap();
        last.elapsed().as_secs() >= 300 // Every 5 minutes
    }

    /// Create checkpoint if needed
    async fn checkpoint_if_needed(&self) -> Result<()> {
        if !self.should_checkpoint() {
            return Ok(());
        }

        let (orchestrator_state, tier_states, stats, position, total_iterations) = {
            let tree = self.tier_tree.lock().unwrap();
            let stats = tree.get_stats();
            let orchestrator_state = self.current_state();

            // Track current position and total iterations
            let mut current_phase_id: Option<String> = None;
            let mut current_task_id: Option<String> = None;
            let mut current_subtask_id: Option<String> = None;
            let mut current_iteration: u32 = 0;
            let mut total_iterations: usize = 0;

            // Build tier states and collect position data
            let mut tier_states = HashMap::new();
            for node in tree.iter_dfs() {
                let state = node.state_machine.current_state();
                let iteration_count = node.state_machine.current_iteration();

                // Sum all iterations across all nodes
                total_iterations += iteration_count as usize;

                // Track active tier position
                if state.is_active() {
                    match node.tier_type {
                        TierType::Phase => {
                            current_phase_id = Some(node.id.clone());
                        }
                        TierType::Task => {
                            current_task_id = Some(node.id.clone());
                        }
                        TierType::Subtask => {
                            current_subtask_id = Some(node.id.clone());
                        }
                        TierType::Iteration => {
                            current_iteration = iteration_count;
                        }
                    }
                }

                let tier_context = crate::core::state_persistence::TierContext {
                    state,
                    tier_type: node.tier_type,
                    item_id: node.id.clone(),
                    iteration_count,
                    max_iterations: node.state_machine.max_iterations(),
                    last_error: None,
                };
                tier_states.insert(node.id.clone(), tier_context);
            }

            let current_position = CurrentPosition {
                phase_id: current_phase_id,
                task_id: current_task_id,
                subtask_id: current_subtask_id,
                iteration: current_iteration,
            };

            (
                orchestrator_state,
                tier_states,
                stats,
                current_position,
                total_iterations,
            )
        };

        let metadata = CheckpointMetadata {
            project_name: self.config.project.name.clone(),
            completed_subtasks: stats.passed,
            total_subtasks: stats.subtasks,
            iterations_run: total_iterations,
        };

        // Use async create method
        let checkpoint_manager = self.checkpoint_manager.clone();
        tokio::task::spawn_blocking(move || {
            let mut mgr = checkpoint_manager.lock().unwrap();
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

        let mut last = self.last_checkpoint.lock().unwrap();
        *last = Instant::now();

        log::info!("Checkpoint created");
        Ok(())
    }

    /// Use worker/reviewer pattern for quality assurance
    fn apply_worker_reviewer(
        &self,
        _tier_id: &str,
        output: &str,
        signal: &CompletionSignal,
        cycle: u32,
    ) -> Result<(bool, String)> {
        if !self.worker_reviewer.is_enabled() {
            return Ok((true, output.to_string()));
        }

        if !self.worker_reviewer.should_review(signal, cycle) {
            return Ok((true, output.to_string()));
        }

        let review_result = self.worker_reviewer.parse_review_result(signal);
        let needs_revision = !review_result.passed;

        let feedback = if needs_revision {
            review_result.reasoning.clone()
        } else {
            output.to_string()
        };

        Ok((review_result.passed, feedback))
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

        let fresh_spawn_timeout_secs = self.fresh_spawn.config().timeout_secs;
        log::debug!(
            "Fresh spawn configured with default timeout {}s",
            fresh_spawn_timeout_secs
        );

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

            let execution_result = if self.config.orchestrator.enable_parallel_execution {
                // Try to parallelize leaf-tier execution by running other ready subtasks under the same Task.
                let batch_ids = {
                    let tree = self.tier_tree.lock().unwrap();
                    let path = tree.get_path(&tier_id);
                    let task_id = path.get(1).cloned();

                    if let Some(task_id) = task_id {
                        tree.get_children(&task_id)
                            .into_iter()
                            .filter(|n| n.tier_type == TierType::Subtask)
                            .filter(|n| n.state_machine.current_state() == TierState::Pending)
                            .filter(|n| {
                                n.dependencies.iter().all(|dep_id| {
                                    tree.find_by_id(dep_id)
                                        .map(|dep| {
                                            dep.state_machine.current_state() == TierState::Passed
                                        })
                                        .unwrap_or(false)
                                })
                            })
                            .map(|n| n.id.clone())
                            .collect::<Vec<_>>()
                    } else {
                        Vec::new()
                    }
                };

                if batch_ids.len() > 1 {
                    match self.execute_subtasks_parallel(&batch_ids).await {
                        Ok(results) => results
                            .into_iter()
                            .collect::<anyhow::Result<Vec<_>>>()
                            .map(|_| ()),
                        Err(e) => Err(e),
                    }
                } else {
                    self.execute_tier(&tier_id).await
                }
            } else {
                self.execute_tier(&tier_id).await
            };

            match execution_result {
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
            .map(|(i, desc)| {
                // Parse prefixed format: "command: <cmd>", "file_exists: <path>", "regex: <file>:<pattern>"
                if let Some(content) = desc.strip_prefix("command:") {
                    let content = content.trim();
                    Criterion {
                        id: format!("AC-{}", i + 1),
                        description: format!("Execute command: {}", content),
                        met: false,
                        verification_method: Some("command".to_string()),
                        expected: Some(content.to_string()),
                        actual: None,
                    }
                } else if let Some(content) = desc.strip_prefix("file_exists:") {
                    let content = content.trim();
                    Criterion {
                        id: format!("AC-{}", i + 1),
                        description: format!("File exists: {}", content),
                        met: false,
                        verification_method: Some("file_exists".to_string()),
                        expected: Some(content.to_string()),
                        actual: None,
                    }
                } else if let Some(content) = desc.strip_prefix("regex:") {
                    let content = content.trim();
                    Criterion {
                        id: format!("AC-{}", i + 1),
                        description: format!("Pattern match: {}", content),
                        met: false,
                        verification_method: Some("regex".to_string()),
                        expected: Some(content.to_string()),
                        actual: None,
                    }
                } else {
                    // Fallback to unprefixed (legacy support)
                    Criterion {
                        id: format!("AC-{}", i + 1),
                        description: desc.clone(),
                        met: false,
                        verification_method: Some("command".to_string()),
                        expected: Some(desc.clone()),
                        actual: None,
                    }
                }
            })
            .collect()
    }

    fn resolve_criteria_for_workdir(
        &self,
        criteria: &[Criterion],
        working_dir: &Path,
    ) -> Vec<Criterion> {
        criteria
            .iter()
            .cloned()
            .map(|mut c| {
                let method = c.verification_method.as_deref().unwrap_or("command");
                match method {
                    "file_exists" => {
                        if let Some(expected) = c.expected.clone() {
                            let path = std::path::Path::new(&expected);
                            if path.is_relative() {
                                c.expected = Some(working_dir.join(path).display().to_string());
                            }
                        }
                    }
                    "regex" => {
                        if let Some(expected) = c.expected.clone() {
                            if let Some(idx) = expected.find(':') {
                                let (file, pattern) = expected.split_at(idx);
                                let pattern = &pattern[1..];
                                let file_path = std::path::Path::new(file);
                                let resolved = if file_path.is_relative() {
                                    working_dir.join(file_path)
                                } else {
                                    file_path.to_path_buf()
                                };
                                c.expected = Some(format!("{}:{}", resolved.display(), pattern));
                            }
                        }
                    }
                    "command" => {
                        if let Some(expected) = c.expected.clone() {
                            let trimmed = expected.trim();
                            if trimmed.starts_with('{') {
                                if let Ok(mut v) =
                                    serde_json::from_str::<serde_json::Value>(trimmed)
                                {
                                    if let Some(obj) = v.as_object_mut() {
                                        if !obj.contains_key("cwd") {
                                            obj.insert(
                                                "cwd".to_string(),
                                                serde_json::Value::String(
                                                    working_dir.display().to_string(),
                                                ),
                                            );
                                            c.expected = Some(v.to_string());
                                        }
                                    }
                                }
                            } else {
                                c.expected = Some(
                                    serde_json::json!({
                                        "command": trimmed,
                                        "cwd": working_dir.display().to_string()
                                    })
                                    .to_string(),
                                );
                            }
                        }
                    }
                    "script" => {
                        if let Some(expected) = c.expected.clone() {
                            let trimmed = expected.trim();
                            if trimmed.starts_with('{') {
                                if let Ok(mut v) =
                                    serde_json::from_str::<serde_json::Value>(trimmed)
                                {
                                    if let Some(obj) = v.as_object_mut() {
                                        if let Some(path) = obj
                                            .get("path")
                                            .and_then(|p| p.as_str())
                                            .map(std::path::PathBuf::from)
                                        {
                                            if path.is_relative() {
                                                obj.insert(
                                                    "path".to_string(),
                                                    serde_json::Value::String(
                                                        working_dir
                                                            .join(path)
                                                            .display()
                                                            .to_string(),
                                                    ),
                                                );
                                            }
                                        }
                                        if !obj.contains_key("cwd") {
                                            obj.insert(
                                                "cwd".to_string(),
                                                serde_json::Value::String(
                                                    working_dir.display().to_string(),
                                                ),
                                            );
                                        }
                                        c.expected = Some(v.to_string());
                                    }
                                }
                            } else {
                                let path = std::path::Path::new(trimmed);
                                if path.is_relative() {
                                    c.expected = Some(working_dir.join(path).display().to_string());
                                }
                            }
                        }
                    }
                    _ => {}
                }
                c
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

            // Create git branch for tier (if git enabled). Skip if running in a worktree.
            if self.get_tier_worktree(tier_id).is_none() {
                let _branch = self.create_tier_branch(tier_id, tier_type).await?;
            }

            // Use platform router to select optimal platform (if enabled)
            let selected_platform = self.select_platform(tier_id, tier_type)?;
            let tier_config = if selected_platform != tier_config.platform {
                log::info!(
                    "Overriding platform for {}: {:?} -> {:?}",
                    tier_id,
                    tier_config.platform,
                    selected_platform
                );
                let mut config = tier_config.clone();
                config.platform = selected_platform;
                config
            } else {
                tier_config.clone()
            };

            // Check if checkpoint is needed
            let _ = self.checkpoint_if_needed().await;

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

            // Use worktree path if available for this tier
            let working_directory = self
                .get_tier_worktree(tier_id)
                .unwrap_or_else(|| self.config.project.working_directory.clone());
            let working_directory_for_gate = working_directory.clone();

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
                working_directory: working_directory.clone(),
                working_dir: working_directory,
                session_id: session_id.clone(),
                timeout_ms: tier_config.timeout_ms,
                timeout_secs,
                context_files: Vec::new(),
                env_vars: HashMap::new(),
                plan_mode: tier_config.plan_mode,
                reasoning_effort: tier_config.reasoning_effort.clone(),
                subagent_enabled: self.config.orchestrator.enable_subagents,
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

            let _review_probe = self.apply_worker_reviewer(
                tier_id,
                &iteration_result.output,
                &iteration_result.signal,
                attempt,
            );

            match iteration_result.signal {
                CompletionSignal::Complete => {
                    let _ = self.session_tracker.complete_session(&session_id);

                    // Process AGENTS.md updates from output (success = true)
                    if let Err(e) = self
                        .process_agents_updates(tier_id, &iteration_result.output, true)
                        .await
                    {
                        log::warn!("Failed to process AGENTS.md updates: {}", e);
                    }

                    // Commit progress to git after successful iteration
                    if let Err(e) = self.commit_tier_progress(tier_id, tier_type, attempt).await {
                        log::warn!("Failed to commit tier progress: {}", e);
                    }

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
                    let criteria =
                        self.resolve_criteria_for_workdir(&criteria, &working_directory_for_gate);
                    let gate_type = self.gate_type_for(tier_type);
                    let gate_report = self
                        .gate_runner
                        .run_gate(gate_type, tier_id, &criteria, None)
                        .await;

                    if gate_report.passed {
                        // Run additional verification integration if enabled
                        let verification_passed = self
                            .run_verification_gate(tier_id, tier_type, &criteria)
                            .await?;

                        if !verification_passed {
                            log::warn!("Verification integration failed for tier {}", tier_id);
                            let reason = "Verification integration failed".to_string();
                            previous_feedback = Some(reason.clone());
                            continue; // Retry
                        }

                        // Enforce AGENTS.md rules before allowing tier completion
                        if let Err(e) = self.enforce_agents_gate(tier_id).await {
                            log::warn!(
                                "AGENTS.md gate enforcement failed for tier {}: {}",
                                tier_id,
                                e
                            );
                            let reason = format!("AGENTS.md not properly updated: {}", e);
                            previous_feedback = Some(reason.clone());
                            continue; // Retry
                        }

                        {
                            let mut tree = self.tier_tree.lock().unwrap();
                            let node = tree
                                .find_by_id_mut(tier_id)
                                .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

                            // Validate transition before passing
                            let current = node.state_machine.current_state();
                            if let Err(e) =
                                self.validate_tier_transition(current, TierState::Passed)
                            {
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
                        } // Drop lock before async operations

                        // Create PR for tier if auto_pr is enabled
                        if let Err(e) = self.create_tier_pr(tier_id, tier_type).await {
                            log::warn!("Failed to create PR for tier {}: {}", tier_id, e);
                        }

                        // Promote learnings from this tier to parent/root levels
                        if let Err(e) = self.promote_tier_learnings(tier_id).await {
                            log::warn!("Failed to promote learnings for tier {}: {}", tier_id, e);
                        }

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

    // DRY:FN:event_receiver
    /// Get event receiver
    pub fn event_receiver(&self) -> &Receiver<OrchestratorEvent> {
        &self.event_receiver
    }

    // DRY:FN:current_state
    /// Get current state
    pub fn current_state(&self) -> OrchestratorState {
        let sm = self.state_machine.lock().unwrap();
        sm.current_state()
    }

    // DRY:FN:get_stats
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

        let (stats, tier_states, position, total_iterations) = {
            let tree = self.tier_tree.lock().unwrap();
            let stats = tree.get_stats();

            // Track current position and total iterations
            let mut current_phase_id: Option<String> = None;
            let mut current_task_id: Option<String> = None;
            let mut current_subtask_id: Option<String> = None;
            let mut current_iteration: u32 = 0;
            let mut total_iterations: usize = 0;

            // Build tier states and collect position data
            let mut tier_states = std::collections::HashMap::new();
            for node in tree.iter_dfs() {
                let state = node.state_machine.current_state();
                let iteration_count = node.state_machine.current_iteration();

                // Sum all iterations across all nodes
                total_iterations += iteration_count as usize;

                // Track active tier position
                if state.is_active() {
                    match node.tier_type {
                        TierType::Phase => {
                            current_phase_id = Some(node.id.clone());
                        }
                        TierType::Task => {
                            current_task_id = Some(node.id.clone());
                        }
                        TierType::Subtask => {
                            current_subtask_id = Some(node.id.clone());
                        }
                        TierType::Iteration => {
                            current_iteration = iteration_count;
                        }
                    }
                }

                let tier_context = crate::core::state_persistence::TierContext {
                    state,
                    tier_type: node.tier_type,
                    item_id: node.id.clone(),
                    iteration_count,
                    max_iterations: node.state_machine.max_iterations(),
                    last_error: None,
                };
                tier_states.insert(node.id.clone(), tier_context);
            }

            let position = CurrentPosition {
                phase_id: current_phase_id,
                task_id: current_task_id,
                subtask_id: current_subtask_id,
                iteration: current_iteration,
            };

            (stats, tier_states, position, total_iterations)
        };

        let metadata = CheckpointMetadata {
            project_name: self.config.project.name.clone(),
            completed_subtasks: stats.passed,
            total_subtasks: stats.subtasks,
            iterations_run: total_iterations,
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
                    output: String::new(),
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
        let promotion_engine = Arc::new(Mutex::new(PromotionEngine::with_defaults()));
        let gate_enforcer = Arc::new(GateEnforcer::new());
        let worktree_manager = Arc::new(WorktreeManager::new(temp_dir.clone()));
        let active_worktrees = Arc::new(Mutex::new(HashMap::new()));

        Orchestrator {
            config,
            state_machine: Arc::new(Mutex::new(OrchestratorStateMachine::new())),
            tier_tree: Arc::new(Mutex::new(tree)),
            advancement_engine: Arc::new(AdvancementEngine::new()),
            escalation_engine: Arc::new(EscalationEngine::with_defaults()),
            worker_reviewer: Arc::new(WorkerReviewer::with_defaults()),
            event_sender,
            event_receiver,
            last_checkpoint: Arc::new(Mutex::new(Instant::now())),
            prompt_builder: PromptBuilder::new(),
            iteration_executor,
            gate_runner,
            session_tracker,
            logger_service,
            progress_manager,
            usage_tracker,
            agents_manager: AgentsManager::new(&temp_dir),
            git_manager: git_manager.clone(),
            branch_strategy: branch_strategy,
            pr_manager: PrManager::new(temp_dir.clone()),
            verification_integration: None,
            complexity_classifier,
            dependency_analyzer: dependency_analyzer,
            platform_router,
            loop_guard,
            fresh_spawn: fresh_spawn,
            checkpoint_manager,
            parallel_executor: parallel_executor,
            promotion_engine,
            gate_enforcer,
            worktree_manager,
            active_worktrees,
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
                output: String::new(),
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
                output: String::new(),
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
                output: String::new(),
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
                output: String::new(),
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Complete,
                duration_secs: 0,
                output_lines: 0,
                output: String::new(),
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
                output: String::new(),
            }),
            Ok(crate::core::execution_engine::IterationResult {
                signal: CompletionSignal::Stalled,
                duration_secs: 0,
                output_lines: 0,
                output: String::new(),
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

    #[test]
    fn test_parse_agents_updates() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let output = r#"
Some agent output here...
<pm>COMPLETE</pm>

```agents-update
PATTERN: Use async/await for all I/O operations
FAILURE: Blocking calls in async context cause deadlocks
DO: Always validate input before processing
DONT: Mix sync and async code without proper consideration
```

More output after...
"#;

        let updates = orchestrator.parse_agents_updates(output);

        assert_eq!(updates.len(), 4);
        assert_eq!(updates[0].0, "pattern");
        assert!(updates[0].1.contains("async/await"));
        assert_eq!(updates[1].0, "failure");
        assert!(updates[1].1.contains("Blocking calls"));
        assert_eq!(updates[2].0, "do");
        assert!(updates[2].1.contains("validate input"));
        assert_eq!(updates[3].0, "dont");
        assert!(updates[3].1.contains("Mix sync and async"));
    }

    #[test]
    fn test_parse_agents_updates_empty() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let output = "No AGENTS updates here";
        let updates = orchestrator.parse_agents_updates(output);

        assert_eq!(updates.len(), 0);
    }

    #[test]
    fn test_parse_agents_updates_multiple_blocks() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let output = r#"
```agents-update
PATTERN: First pattern
```

Some text in between

```agents-update
PATTERN: Second pattern
FAILURE: Some failure
```
"#;

        let updates = orchestrator.parse_agents_updates(output);

        assert_eq!(updates.len(), 3);
        assert!(updates[0].1.contains("First pattern"));
        assert!(updates[1].1.contains("Second pattern"));
        assert!(updates[2].1.contains("Some failure"));
    }

    #[test]
    fn test_build_gate_criteria_with_prefixes() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let acceptance_criteria = vec![
            "command: cargo test".to_string(),
            "file_exists: Cargo.toml".to_string(),
            "regex: README.md:puppet-master".to_string(),
        ];

        let criteria = orchestrator.build_gate_criteria(&acceptance_criteria);

        assert_eq!(criteria.len(), 3);

        // Check command criterion
        assert_eq!(criteria[0].verification_method, Some("command".to_string()));
        assert_eq!(criteria[0].expected, Some("cargo test".to_string()));

        // Check file_exists criterion
        assert_eq!(
            criteria[1].verification_method,
            Some("file_exists".to_string())
        );
        assert_eq!(criteria[1].expected, Some("Cargo.toml".to_string()));

        // Check regex criterion
        assert_eq!(criteria[2].verification_method, Some("regex".to_string()));
        assert_eq!(
            criteria[2].expected,
            Some("README.md:puppet-master".to_string())
        );
    }

    #[test]
    fn test_build_gate_criteria_legacy_format() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let acceptance_criteria = vec![
            "All tests pass".to_string(),
            "Code is formatted".to_string(),
        ];

        let criteria = orchestrator.build_gate_criteria(&acceptance_criteria);

        assert_eq!(criteria.len(), 2);

        // Should default to command with the original text
        assert_eq!(criteria[0].verification_method, Some("command".to_string()));
        assert_eq!(criteria[0].expected, Some("All tests pass".to_string()));
        assert_eq!(criteria[1].verification_method, Some("command".to_string()));
        assert_eq!(criteria[1].expected, Some("Code is formatted".to_string()));
    }

    #[tokio::test]
    async fn test_enforce_agents_gate_passes_with_good_content() {
        use tempfile::TempDir;

        let temp_dir = TempDir::new().unwrap();
        let mut config = default_config();
        config.paths.workspace = temp_dir.path().to_path_buf();

        let orchestrator = Orchestrator::new(config).unwrap();

        // Create a tier directory with valid AGENTS.md
        let tier_path = temp_dir.path().join("phase1");
        std::fs::create_dir_all(&tier_path).unwrap();

        let agents_content = r#"# Agent Learnings

## Successful Patterns
- Pattern 1: Use async/await for I/O operations
- Pattern 2: Add proper error handling

## Failure Modes
- Failure 1: Blocking calls in async contexts
"#;
        std::fs::write(tier_path.join("AGENTS.md"), agents_content).unwrap();

        // Should pass with valid content
        let result = orchestrator.enforce_agents_gate("phase1").await;
        assert!(
            result.is_ok(),
            "Gate enforcement should pass with valid content"
        );
    }

    #[tokio::test]
    async fn test_promote_tier_learnings_no_candidates() {
        use tempfile::TempDir;

        let temp_dir = TempDir::new().unwrap();
        let mut config = default_config();
        config.paths.workspace = temp_dir.path().to_path_buf();

        let orchestrator = Orchestrator::new(config).unwrap();

        // Create minimal AGENTS.md (no high-usage patterns)
        let tier_path = temp_dir.path().join("phase1");
        std::fs::create_dir_all(&tier_path).unwrap();
        std::fs::write(
            tier_path.join("AGENTS.md"),
            "# Learnings\n\n## Patterns\n- Some pattern\n",
        )
        .unwrap();

        // Should complete without error even if no promotions
        let result = orchestrator.promote_tier_learnings("phase1").await;
        assert!(
            result.is_ok(),
            "Promotion should succeed with no candidates"
        );
    }

    #[test]
    fn test_orchestrator_has_promotion_engine() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        // Verify the promotion engine is accessible
        let engine = orchestrator.promotion_engine.lock().unwrap();
        // Just checking it's not panicking
        drop(engine);
    }

    #[test]
    fn test_orchestrator_has_gate_enforcer() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        // Verify the gate enforcer is accessible
        let enforcer = &orchestrator.gate_enforcer;
        // Just checking it exists
        let _ = enforcer;
    }

    #[tokio::test]
    async fn test_process_agents_updates_records_pattern_usage() {
        use tempfile::TempDir;

        let temp_dir = TempDir::new().unwrap();
        let mut config = default_config();
        config.paths.workspace = temp_dir.path().to_path_buf();

        let orchestrator = Orchestrator::new(config).unwrap();

        // Create tier directory
        let tier_path = temp_dir.path().join("phase1");
        std::fs::create_dir_all(&tier_path).unwrap();

        let output = r#"
```agents-update
PATTERN: Use Result<T, E> for error handling
```
"#;

        // Process with success = true
        let result = orchestrator
            .process_agents_updates("phase1", output, true)
            .await;
        assert!(result.is_ok(), "Should process updates successfully");

        // Verify pattern was recorded in promotion engine
        let engine = orchestrator.promotion_engine.lock().unwrap();
        let stats = engine.get_stats("Use Result<T, E> for error handling");
        assert!(stats.is_some(), "Pattern usage should be tracked");
        let (count, success_rate) = stats.unwrap();
        assert_eq!(count, 1, "Should have recorded one usage");
        assert_eq!(success_rate, 1.0, "Should have 100% success rate");
    }

    #[tokio::test]
    async fn test_worktree_integration() {
        let config = default_config();
        let orchestrator = Orchestrator::new(config).unwrap();

        let subtask_id = "test-subtask-1";

        // Test get_tier_worktree returns None initially
        assert!(orchestrator.get_tier_worktree(subtask_id).is_none());

        // Note: Full worktree creation test would require a real git repo
        // This test verifies the integration is properly wired
        assert!(
            orchestrator
                .worktree_manager
                .get_worktree_path(subtask_id)
                .ends_with(subtask_id)
        );
    }

    // NOTE: Checkpoint metadata population (CurrentPosition and iterations_run) is tested
    // through integration tests and verified manually. The logic:
    // 1. CurrentPosition is populated by finding active tiers (state.is_active())
    //    and capturing phase_id/task_id/subtask_id based on tier_type
    // 2. iterations_run is the sum of node.state_machine.current_iteration() across all nodes
    // This implementation is in checkpoint_if_needed() and create_checkpoint() methods.
}
