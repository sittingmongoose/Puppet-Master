//! Core business logic modules for RWM Puppet Master orchestration
//!
//! This module contains the primary orchestration engine components:
//! - State machines for orchestrator and tier management
//! - Tier hierarchy and tree structures
//! - Execution engine for running iterations
//! - Prompt building and context management
//! - Auto-advancement logic
//! - Session tracking
//! - Escalation handling
//! - Worker/reviewer separation
//! - State persistence and checkpointing
//! - Process registry and management
//! - Loop detection and prevention
//! - Dependency analysis and parallel execution
//! - Task complexity classification
//! - Platform routing and selection

pub mod auto_advancement;
pub mod checkpoint_manager;
pub mod complexity_classifier;
pub mod dependency_analyzer;
pub mod escalation;
pub mod escalation_chain;
pub mod execution_engine;
pub mod fresh_spawn;
pub mod loop_guard;
pub mod orchestrator;
pub mod parallel_executor;
pub mod platform_router;
pub mod process_registry;
pub mod prompt_builder;
pub mod session_tracker;
pub mod state_machine;
pub mod state_persistence;
pub mod state_transitions;
pub mod tier_node;
pub mod worker_reviewer;

// Re-export key types for convenience
pub use auto_advancement::AdvancementEngine;
pub use checkpoint_manager::{CheckpointManager, CheckpointManagerConfig, RecoveryInfo};
pub use complexity_classifier::{
    ClassificationResult, Complexity, ComplexityClassifier, ModelLevel, TaskInfo, TaskType,
};
pub use dependency_analyzer::{DependencyAnalyzer, DependencyGraph, DependencyNode, ValidationResult};
pub use escalation::EscalationEngine;
pub use execution_engine::ExecutionEngine;
pub use fresh_spawn::{FreshSpawn, ProcessAudit, SpawnConfig, SpawnResult};
pub use loop_guard::{LoopDetection, LoopGuard, LoopGuardConfig, LoopGuardMessage};
pub use orchestrator::Orchestrator;
pub use parallel_executor::{
    ParallelExecutionResult, ParallelExecutor, ParallelExecutorConfig, SubtaskResult,
};
pub use platform_router::{PlatformCapabilities, PlatformRouter, PlatformRouterConfig, RoutingDecision};
pub use process_registry::{ProcessRecord, ProcessRegistry, ProcessStatus, SessionRegistry, SessionStatus};
pub use prompt_builder::PromptBuilder;
pub use session_tracker::SessionTracker;
pub use state_machine::{OrchestratorStateMachine, TierStateMachine};
pub use state_persistence::{
    Checkpoint, CheckpointMetadata, CheckpointSummary, CurrentPosition, StatePersistence, TierContext,
};
pub use state_transitions::{
    can_transition_orchestrator, can_transition_tier, get_valid_next_orchestrator_states,
    get_valid_next_tier_states, OrchestratorTransition, StateTransitions, TierTransition,
};
pub use tier_node::{TierNode, TierTree};
pub use worker_reviewer::WorkerReviewer;
