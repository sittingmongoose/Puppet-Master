//! Start chain module - Requirements parsing and PRD generation
//!
//! Handles the initial project setup by:
//! - Parsing requirements from markdown or text files
//! - Generating structured PRD with Phase/Task/Subtask hierarchy
//! - Creating architecture documentation
//! - Generating tiered execution plans
//! - Creating test plans
//! - Interactive requirements gathering
//! - Classifying verification criteria
//! - Detecting document structure
//! - Validating PRD quality
//! - Converting criteria to executable scripts
//! - Multi-pass PRD generation
//! - Requirements traceability
//! - Document parsing

mod acceptance_criteria_injector;
mod architecture_generator;
mod criterion_classifier;
mod criterion_to_script;
mod document_parser;
mod multi_pass_generator;
mod pipeline;
mod prd_generator;
mod prd_validators;
mod prompt_templates;
mod requirements_interviewer;
mod requirements_inventory;
mod requirements_parser;
mod structure_detector;
mod test_plan_generator;
mod tier_plan_generator;
mod traceability;
mod validation_gate;

pub use acceptance_criteria_injector::{
    AcceptanceCriteriaInjector, InjectionResult, InjectorConfig,
};
pub use architecture_generator::ArchitectureGenerator;
pub use criterion_classifier::{
    ClassificationResult, ClassifiedCriterion, CriterionClassifier,
    VerificationType as CriterionVerificationType,
};
pub use criterion_to_script::{
    CriterionToScriptConverter, CriterionType, GeneratedScript, ScriptType, VerificationCriterion,
};
pub use document_parser::{
    DocumentParser, DocumentSection, ListItem as DocumentListItem, ParsedDocument,
};
pub use multi_pass_generator::{
    GenerationSummary, MultiPassConfig, MultiPassGenerator, PassResult,
};
pub use pipeline::{RequirementsInput, StartChainParams, StartChainPipeline, StartChainResult};
pub use prd_generator::PrdGenerator;
pub use prd_validators::{
    AiGapValidator, AiGapValidatorConfig, CompositeValidator, CoverageValidator, IssueSeverity,
    NoManualValidator, QualityValidator, ValidationIssue, ValidationResult as ValidatorResult,
};
pub use prompt_templates::{PromptTemplate, PromptTemplates};
pub use requirements_interviewer::{
    Importance, InterviewQuestion, InterviewResult, QuestionCategory, RequirementsInterviewer,
};
pub use requirements_inventory::{
    RequirementsInventory, extract_requirement_ids, map_requirements_to_prd,
};
pub use requirements_parser::RequirementsParser;
pub use structure_detector::{
    CodeBlock, DocumentStatistics, DocumentStructure, Link, ListItem, ListType, Section,
    StructureDetector,
};
pub use test_plan_generator::{
    CoverageTargets, TestCase, TestPlan, TestPlanGenerator, TestSuite, VerificationType,
};
pub use tier_plan_generator::{PhasePlan, SubtaskPlan, TaskPlan, TierPlan, TierPlanGenerator};
pub use traceability::{
    CoverageStatus, TraceabilityItemType, TraceabilityLink, TraceabilityMatrix, TraceabilityStats,
};
pub use validation_gate::{
    CheckResult, Severity, ValidationError, ValidationGate, ValidationResult, ValidationWarning,
};

// Re-export types
pub use crate::types::{PRD, ParsedRequirements, RequirementsSection};
