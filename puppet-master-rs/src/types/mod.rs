//! Type definitions for Puppet Master.
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
pub use budget::{BudgetInfo, QuotaStatus, UsageAction, UsageRecord, UsageStats};
pub use capabilities::{AuthStatus, CooldownInfo, FeatureFlag, PlatformCapabilities, QuotaInfo};
pub use config::{
    BranchingConfig, BudgetConfig, BudgetEnforcementConfig, Complexity, EscalationChainAction,
    EscalationChainKey, EscalationChainStepConfig, EscalationChainsConfig, EscalationTarget,
    Granularity, GuiAutomationConfig, InterviewConfig, LoggingConfig, MemoryConfig, MergePolicy,
    ModelLevel, OrchestratorConfig, PathConfig, PlatformModelPair, ProjectConfig,
    PuppetMasterConfig, PushPolicy, TaskFailureStyle, TaskType, TierConfig, TierConfigs, UiConfig,
    ValidationError, VerificationConfig,
};
pub use doctor::{CheckCategory, CheckResult, DoctorCheck, FixResult};
pub use events::{LogLevel, OutputLineType, PuppetMasterEvent};
pub use evidence::{
    EvidenceCollection, EvidenceType as EvidenceTypeNew, GateReportEvidence, StoredEvidence,
    VerifierResult as VerifierResultNew,
};
pub use execution::{
    CompletionSignal, EvidenceData, EvidenceType, ExecutionMode, ExecutionRequest, ExecutionResult,
    ExecutionStatus, OutputLine, ProcessInfo, ReasoningEffort, ReviewResult, Role,
    VerificationMethod, Verifier, VerifierResult,
};
pub use git::{BranchStrategy, CommitPolicy, GitConfig, GitResult, GitStatus};
pub use platform::{CliPaths, Platform, PlatformConfig};
pub use prd::{
    Criterion, CriterionResult, CriterionType, Evidence, GateDecision, GateReport, GateResult,
    ItemStatus, Iteration, PRD, PRDMetadata, Phase, Priority, Subtask, Task, TestPlan, TestResult,
};
pub use requirements::{
    ParsedRequirement, RequirementPriority, RequirementsInventory, RequirementsSource,
    RequirementsStats,
};
pub use start_chain::{
    AgentDefinition, AgentsDoc, ParsedRequirements, ProgressEntry, ProjectInfo, RequirementsSection,
};
pub use state::{
    AdvancementResult, EscalationAction, IterationContext, OrchestratorContext, OrchestratorState,
    SessionInfo, SessionState, StateTransition, TierState, TierType,
};
pub use transitions::{
    OrchestratorTransition, TierTransition, TransitionAction, TransitionHistory, TransitionTrigger,
};
