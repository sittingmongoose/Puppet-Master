//! Interactive interview module for requirements gathering.
//!
//! Adapted from the LISA project's interview orchestration patterns,
//! enhanced with multi-phase domain coverage, AI platform failover,
//! and zero-gaps completion validation.

pub mod agents_md_generator;
pub mod codebase_scanner;
pub mod completion_validator;
pub mod document_writer;
pub mod failover;
pub mod feature_detector;
pub mod orchestrator;
pub mod phase_manager;
pub mod prompt_templates;
pub mod question_parser;
pub mod reference_manager;
pub mod research_engine;
pub mod state;
pub mod technology_matrix;
pub mod test_strategy_generator;

pub use agents_md_generator::{generate_agents_md, write_agents_md};
pub use completion_validator::{ValidationIssue, ValidationResult, ValidationSeverity};
pub use document_writer::{CompletedPhase, DocumentWriter};
pub use failover::{FailoverManager, PlatformModelPair};
pub use feature_detector::{DetectedFeature, detect_features_from_state};
pub use orchestrator::{
    InterviewCompletionResult, InterviewOrchestrator, InterviewOrchestratorConfig,
    OrchestratorEvent, TurnResult,
};
pub use phase_manager::{InterviewPhaseDefinition, PhaseManager};
pub use question_parser::{
    ParsedAIResponse, PhaseCompletion, QuestionOption, STRUCTURED_MARKERS, StructuredQuestion,
};
pub use reference_manager::{ReferenceManager, ReferenceMaterial, ReferenceType};
pub use research_engine::{ResearchConfig, ResearchEngine, ResearchResult, ResearchType};
pub use state::{Decision, InterviewPhase, InterviewQA, InterviewState};
pub use technology_matrix::{TechnologyEntry, TechnologyExtractor, write_technology_matrix};
pub use test_strategy_generator::{CoverageLevel, TestStrategyConfig, write_test_strategy};
