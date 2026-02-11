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

mod requirements_parser;
mod prd_generator;
mod architecture_generator;
mod tier_plan_generator;
mod test_plan_generator;
mod requirements_interviewer;
mod criterion_classifier;
mod structure_detector;
mod validation_gate;
mod criterion_to_script;
mod multi_pass_generator;
mod traceability;
mod document_parser;
mod prompt_templates;
mod prd_validators;
mod requirements_inventory;
mod pipeline;

pub use requirements_parser::RequirementsParser;
pub use prd_generator::PrdGenerator;
pub use architecture_generator::ArchitectureGenerator;
pub use tier_plan_generator::{TierPlanGenerator, TierPlan, PhasePlan, TaskPlan, SubtaskPlan};
pub use test_plan_generator::{
    TestPlanGenerator, TestPlan, TestSuite, TestCase, VerificationType, CoverageTargets,
};
pub use requirements_interviewer::{
    RequirementsInterviewer, InterviewQuestion, QuestionCategory, Importance, InterviewResult,
};
pub use criterion_classifier::{
    CriterionClassifier, ClassifiedCriterion, VerificationType as CriterionVerificationType,
    ClassificationResult,
};
pub use structure_detector::{
    StructureDetector, DocumentStructure, Section, ListItem, ListType, CodeBlock, Link,
    DocumentStatistics,
};
pub use validation_gate::{
    ValidationGate, ValidationResult, ValidationError, ValidationWarning, Severity, CheckResult,
};
pub use criterion_to_script::{
    CriterionToScriptConverter, VerificationCriterion, CriterionType,
    GeneratedScript, ScriptType,
};
pub use multi_pass_generator::{
    MultiPassGenerator, MultiPassConfig, PassResult, GenerationSummary,
};
pub use traceability::{
    TraceabilityMatrix, TraceabilityLink, TraceabilityItemType, CoverageStatus,
    TraceabilityStats,
};
pub use document_parser::{
    DocumentParser, ParsedDocument, DocumentSection, ListItem as DocumentListItem,
};
pub use prompt_templates::{PromptTemplate, PromptTemplates};
pub use prd_validators::{
    AiGapValidator, AiGapValidatorConfig, CoverageValidator, QualityValidator, NoManualValidator,
    CompositeValidator, ValidationIssue, IssueSeverity, ValidationResult as ValidatorResult,
};
pub use requirements_inventory::{
    extract_requirement_ids, map_requirements_to_prd, RequirementsInventory,
};
pub use pipeline::{
    StartChainPipeline, StartChainParams, StartChainResult, RequirementsInput,
};

// Re-export types
pub use crate::types::{ParsedRequirements, RequirementsSection, PRD};
