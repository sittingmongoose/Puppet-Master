//! Type definitions for the RWM Puppet Master.
//!
//! This module contains all the core types used throughout the application,
//! organized into logical sub-modules.

pub mod budget;
pub mod capabilities;
pub mod config;
pub mod doctor;
pub mod events;
pub mod evidence;
pub mod execution;
pub mod git;
pub mod platform;
pub mod prd;
pub mod requirements;
pub mod start_chain;
pub mod state;
pub mod transitions;

// Re-export commonly used types for convenience
pub use budget::{BudgetInfo, QuotaStatus, UsageRecord, UsageStats, UsageAction};
pub use config::{
    BranchingConfig, BudgetConfig, BudgetEnforcementConfig, Complexity, EscalationChainAction,
    EscalationChainKey, EscalationChainStepConfig, EscalationChainsConfig, EscalationTarget,
    Granularity, LoggingConfig, MemoryConfig, MergePolicy, ModelLevel, ProjectConfig,
    PuppetMasterConfig, PushPolicy, TaskFailureStyle, TaskType, TierConfig, TierConfigs,
    UiConfig, VerificationConfig, ValidationError, OrchestratorConfig, PathConfig,
};
pub use doctor::{CheckCategory, CheckResult, DoctorCheck, FixResult};
pub use events::{PuppetMasterEvent, OutputLineType, LogLevel};
pub use execution::{
    CompletionSignal, ExecutionRequest, ExecutionResult, ProcessInfo,
    ExecutionMode, ExecutionStatus, OutputLine, ReasoningEffort,
    ReviewResult, Role, VerificationMethod, Verifier, VerifierResult,
    EvidenceType, EvidenceData,
};
pub use git::{GitResult, GitStatus, BranchStrategy, GitConfig, CommitPolicy};
pub use platform::{CliPaths, Platform, PlatformConfig};
pub use prd::{
    Criterion, Evidence, GateReport, ItemStatus, Iteration, Phase, Subtask, Task, PRDMetadata, PRD,
    CriterionType, CriterionResult, GateResult, GateDecision, TestResult, Priority, TestPlan,
};
pub use start_chain::{
    ParsedRequirements, RequirementsSection, ProjectInfo, AgentsDoc, AgentDefinition, ProgressEntry,
};
pub use state::{
    OrchestratorContext, OrchestratorState, StateTransition, TierState, TierType,
    AdvancementResult, EscalationAction, IterationContext, SessionInfo, SessionState,
};
pub use requirements::{
    RequirementsSource, RequirementPriority, ParsedRequirement,
    RequirementsStats, RequirementsInventory,
};
pub use evidence::{
    EvidenceType as EvidenceTypeNew, StoredEvidence, VerifierResult as VerifierResultNew,
    GateReportEvidence, EvidenceCollection,
};
pub use capabilities::{
    FeatureFlag, QuotaInfo, CooldownInfo, AuthStatus, PlatformCapabilities,
};
pub use transitions::{
    TransitionTrigger, TransitionAction, OrchestratorTransition, TierTransition, TransitionHistory,
};
