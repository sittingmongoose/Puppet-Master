//! Test plan generator - creates test plans from requirements and PRD.
//!
//! Generates verification criteria for each subtask and creates comprehensive
//! test suites to validate implementation.

use crate::types::{ParsedRequirements, PRD, Phase, Task, Subtask, Priority};
use anyhow::{Context, Result};
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Generates test plans from requirements and PRD.
pub struct TestPlanGenerator;

/// A complete test plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestPlan {
    /// Test suites organized by tier/phase.
    pub test_suites: Vec<TestSuite>,
    /// Coverage targets for testing.
    pub coverage_targets: CoverageTargets,
    /// Total number of tests.
    #[serde(default)]
    pub total_tests: u32,
    /// Estimated test execution time in minutes.
    #[serde(default)]
    pub estimated_minutes: f64,
}

/// A test suite grouping related tests.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestSuite {
    /// Suite name.
    pub name: String,
    /// Tests in this suite.
    pub tests: Vec<TestCase>,
    /// Associated tier/phase ID.
    pub tier_id: String,
    /// Suite priority.
    #[serde(default)]
    pub priority: Priority,
    /// Tags for categorization.
    #[serde(default)]
    pub tags: Vec<String>,
}

/// An individual test case.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestCase {
    /// Test case name.
    pub name: String,
    /// Detailed description.
    pub description: String,
    /// Verification type.
    pub verification_type: VerificationType,
    /// Success criteria.
    pub criteria: Vec<String>,
    /// Expected outcome.
    pub expected_outcome: String,
    /// Test priority.
    #[serde(default)]
    pub priority: Priority,
    /// Estimated execution time in seconds.
    #[serde(default)]
    pub estimated_seconds: u32,
    /// Prerequisite test IDs.
    #[serde(default)]
    pub prerequisites: Vec<String>,
    /// Test data or inputs.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_data: Option<String>,
}

/// Type of verification to perform.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum VerificationType {
    /// Execute a command and check result.
    Command,
    /// Verify file exists.
    FileExists,
    /// Match against regex pattern.
    Regex,
    /// Run a custom script.
    Script,
    /// Manual human verification.
    Manual,
    /// Unit test execution.
    UnitTest,
    /// Integration test execution.
    IntegrationTest,
    /// Build verification.
    Build,
    /// Linter check.
    Lint,
    /// Type checking.
    TypeCheck,
}

impl std::fmt::Display for VerificationType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Command => write!(f, "Command"),
            Self::FileExists => write!(f, "FileExists"),
            Self::Regex => write!(f, "Regex"),
            Self::Script => write!(f, "Script"),
            Self::Manual => write!(f, "Manual"),
            Self::UnitTest => write!(f, "UnitTest"),
            Self::IntegrationTest => write!(f, "IntegrationTest"),
            Self::Build => write!(f, "Build"),
            Self::Lint => write!(f, "Lint"),
            Self::TypeCheck => write!(f, "TypeCheck"),
        }
    }
}

/// Coverage targets for testing.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CoverageTargets {
    /// Target code coverage percentage.
    #[serde(default = "default_code_coverage")]
    pub code_coverage_percent: f64,
    /// Target requirement coverage percentage.
    #[serde(default = "default_requirement_coverage")]
    pub requirement_coverage_percent: f64,
    /// Minimum tests per subtask.
    #[serde(default = "default_tests_per_subtask")]
    pub min_tests_per_subtask: u32,
    /// Critical path coverage required.
    #[serde(default = "default_bool_true")]
    pub critical_path_coverage: bool,
}

fn default_code_coverage() -> f64 {
    80.0
}

fn default_requirement_coverage() -> f64 {
    100.0
}

fn default_tests_per_subtask() -> u32 {
    2
}

fn default_bool_true() -> bool {
    true
}

impl Default for CoverageTargets {
    fn default() -> Self {
        Self {
            code_coverage_percent: default_code_coverage(),
            requirement_coverage_percent: default_requirement_coverage(),
            min_tests_per_subtask: default_tests_per_subtask(),
            critical_path_coverage: default_bool_true(),
        }
    }
}

impl TestPlanGenerator {
    /// Generate a test plan from requirements.
    pub fn generate_from_requirements(requirements: &ParsedRequirements) -> Result<TestPlan> {
        info!("Generating test plan from requirements");

        let mut test_suites = Vec::new();
        let mut total_tests = 0;
        let mut total_minutes = 0.0;

        for (idx, section) in requirements.sections.iter().enumerate() {
            let suite = Self::generate_suite_from_section(section, idx)?;
            total_tests += suite.tests.len() as u32;
            total_minutes += suite.tests.iter()
                .map(|t| t.estimated_seconds as f64 / 60.0)
                .sum::<f64>();
            test_suites.push(suite);
        }

        Ok(TestPlan {
            test_suites,
            coverage_targets: CoverageTargets::default(),
            total_tests,
            estimated_minutes: total_minutes,
        })
    }

    /// Generate a test plan from a PRD.
    pub fn generate_from_prd(prd: &PRD) -> Result<TestPlan> {
        info!("Generating test plan from PRD: {}", prd.metadata.name);

        let mut test_suites = Vec::new();
        let mut total_tests = 0;
        let mut total_minutes = 0.0;

        for phase in &prd.phases {
            let suite = Self::generate_suite_from_phase(phase)?;
            total_tests += suite.tests.len() as u32;
            total_minutes += suite.tests.iter()
                .map(|t| t.estimated_seconds as f64 / 60.0)
                .sum::<f64>();
            test_suites.push(suite);
        }

        Ok(TestPlan {
            test_suites,
            coverage_targets: CoverageTargets::default(),
            total_tests,
            estimated_minutes: total_minutes,
        })
    }

    /// Generate test suite from a requirements section.
    fn generate_suite_from_section(
        section: &crate::types::RequirementsSection,
        index: usize,
    ) -> Result<TestSuite> {
        debug!("Generating test suite for section: {}", section.title);

        let tier_id = format!("REQ-{:03}", index + 1);
        let mut tests = Vec::new();

        // Parse section content for testable items
        for (idx, line) in section.content.lines().enumerate() {
            if Self::is_testable_line(line) {
                if let Some(test) = Self::create_test_from_line(line, idx) {
                    tests.push(test);
                }
            }
        }

        // Always add at least one test
        if tests.is_empty() {
            tests.push(TestCase {
                name: format!("{} - Basic Verification", section.title),
                description: section.content.clone(),
                verification_type: VerificationType::Manual,
                criteria: vec!["Implementation matches requirements".to_string()],
                expected_outcome: "Requirements satisfied".to_string(),
                priority: section.priority.unwrap_or(Priority::Medium),
                estimated_seconds: 300,
                prerequisites: vec![],
                test_data: None,
            });
        }

        Ok(TestSuite {
            name: section.title.clone(),
            tests,
            tier_id,
            priority: section.priority.unwrap_or(Priority::Medium),
            tags: vec![],
        })
    }

    /// Generate test suite from a phase.
    fn generate_suite_from_phase(phase: &Phase) -> Result<TestSuite> {
        debug!("Generating test suite for phase: {}", phase.id);

        let mut tests = Vec::new();

        for task in &phase.tasks {
            for subtask in &task.subtasks {
                let task_tests = Self::generate_tests_for_subtask(subtask)?;
                tests.extend(task_tests);
            }
        }

        // Add phase-level integration test
        tests.push(TestCase {
            name: format!("{} - Integration Test", phase.title),
            description: format!("Verify all tasks in {} work together", phase.title),
            verification_type: VerificationType::IntegrationTest,
            criteria: vec![
                "All subtasks complete successfully".to_string(),
                "No conflicts between tasks".to_string(),
                "Phase objective met".to_string(),
            ],
            expected_outcome: "Phase fully functional".to_string(),
            priority: Priority::High,
            estimated_seconds: 600,
            prerequisites: vec![],
            test_data: None,
        });

        Ok(TestSuite {
            name: phase.title.clone(),
            tests,
            tier_id: phase.id.clone(),
            priority: Priority::Medium,
            tags: vec!["phase".to_string()],
        })
    }

    /// Generate tests for a subtask.
    fn generate_tests_for_subtask(subtask: &Subtask) -> Result<Vec<TestCase>> {
        debug!("Generating tests for subtask: {}", subtask.id);

        let mut tests = Vec::new();

        // Create tests from acceptance criteria
        for (idx, criterion) in subtask.acceptance_criteria.iter().enumerate() {
            let verification_type = Self::infer_verification_type(criterion);
            
            tests.push(TestCase {
                name: format!("{} - Criterion {}", subtask.title, idx + 1),
                description: criterion.clone(),
                verification_type,
                criteria: vec![criterion.clone()],
                expected_outcome: "Criterion met".to_string(),
                priority: Priority::Medium,
                estimated_seconds: Self::estimate_test_duration(&verification_type),
                prerequisites: vec![],
                test_data: None,
            });
        }

        // Add default verification if no criteria
        if tests.is_empty() {
            tests.push(TestCase {
                name: format!("{} - Verification", subtask.title),
                description: subtask.description.clone().unwrap_or_default(),
                verification_type: VerificationType::Manual,
                criteria: vec!["Implementation complete".to_string()],
                expected_outcome: "Subtask objectives met".to_string(),
                priority: Priority::Medium,
                estimated_seconds: 180,
                prerequisites: vec![],
                test_data: None,
            });
        }

        Ok(tests)
    }

    /// Check if a line contains testable content.
    fn is_testable_line(line: &str) -> bool {
        let trimmed = line.trim();
        !trimmed.is_empty() 
            && (trimmed.starts_with("- ") 
                || trimmed.starts_with("* ")
                || trimmed.starts_with("+ ")
                || trimmed.to_lowercase().contains("must")
                || trimmed.to_lowercase().contains("should")
                || trimmed.to_lowercase().contains("verify"))
    }

    /// Create a test case from a single line.
    fn create_test_from_line(line: &str, index: usize) -> Option<TestCase> {
        let trimmed = line.trim()
            .trim_start_matches("- ")
            .trim_start_matches("* ")
            .trim_start_matches("+ ");

        if trimmed.is_empty() {
            return None;
        }

        let verification_type = Self::infer_verification_type(trimmed);

        Some(TestCase {
            name: format!("Test Case {}", index + 1),
            description: trimmed.to_string(),
            verification_type,
            criteria: vec![trimmed.to_string()],
            expected_outcome: "Requirement satisfied".to_string(),
            priority: Priority::Medium,
            estimated_seconds: Self::estimate_test_duration(&verification_type),
            prerequisites: vec![],
            test_data: None,
        })
    }

    /// Infer verification type from criterion text.
    fn infer_verification_type(text: &str) -> VerificationType {
        let lower = text.to_lowercase();

        if lower.contains("build") || lower.contains("compile") {
            VerificationType::Build
        } else if lower.contains("lint") || lower.contains("format") {
            VerificationType::Lint
        } else if lower.contains("type") && lower.contains("check") {
            VerificationType::TypeCheck
        } else if lower.contains("unit test") || lower.contains("unittest") {
            VerificationType::UnitTest
        } else if lower.contains("integration") || lower.contains("e2e") {
            VerificationType::IntegrationTest
        } else if lower.contains("file exists") || lower.contains("creates") {
            VerificationType::FileExists
        } else if lower.contains("command") || lower.contains("run") || lower.contains("execute") {
            VerificationType::Command
        } else if lower.contains("match") || lower.contains("pattern") {
            VerificationType::Regex
        } else if lower.contains("script") {
            VerificationType::Script
        } else {
            VerificationType::Manual
        }
    }

    /// Estimate test duration based on verification type.
    fn estimate_test_duration(verification_type: &VerificationType) -> u32 {
        match verification_type {
            VerificationType::Command => 30,
            VerificationType::FileExists => 5,
            VerificationType::Regex => 10,
            VerificationType::Script => 60,
            VerificationType::Manual => 180,
            VerificationType::UnitTest => 120,
            VerificationType::IntegrationTest => 300,
            VerificationType::Build => 240,
            VerificationType::Lint => 60,
            VerificationType::TypeCheck => 90,
        }
    }

    /// Merge multiple test plans.
    pub fn merge_plans(plans: Vec<TestPlan>) -> Result<TestPlan> {
        let mut merged_suites = Vec::new();
        let mut total_tests = 0;
        let mut total_minutes = 0.0;

        for plan in plans {
            total_tests += plan.total_tests;
            total_minutes += plan.estimated_minutes;
            merged_suites.extend(plan.test_suites);
        }

        Ok(TestPlan {
            test_suites: merged_suites,
            coverage_targets: CoverageTargets::default(),
            total_tests,
            estimated_minutes: total_minutes,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ParsedRequirements, RequirementsSection, ItemStatus, PRDMetadata};

    #[test]
    fn test_generate_from_requirements() {
        let requirements = ParsedRequirements::new("Test Project")
            .with_section(RequirementsSection::new(
                "Feature 1",
                "- Must support feature X\n- Should validate input"
            ));

        let plan = TestPlanGenerator::generate_from_requirements(&requirements).unwrap();
        assert!(!plan.test_suites.is_empty());
        assert!(plan.total_tests > 0);
    }

    #[test]
    fn test_generate_from_prd() {
        let prd = PRD::new("Test Project");
        let plan = TestPlanGenerator::generate_from_prd(&prd).unwrap();
        assert_eq!(plan.test_suites.len(), 0);
    }

    #[test]
    fn test_infer_verification_type() {
        assert_eq!(
            TestPlanGenerator::infer_verification_type("Must build successfully"),
            VerificationType::Build
        );
        assert_eq!(
            TestPlanGenerator::infer_verification_type("Run unit tests"),
            VerificationType::UnitTest
        );
        assert_eq!(
            TestPlanGenerator::infer_verification_type("File exists at path"),
            VerificationType::FileExists
        );
    }

    #[test]
    fn test_is_testable_line() {
        assert!(TestPlanGenerator::is_testable_line("- Must do something"));
        assert!(TestPlanGenerator::is_testable_line("Should verify this"));
        assert!(!TestPlanGenerator::is_testable_line(""));
        assert!(!TestPlanGenerator::is_testable_line("   "));
    }

    #[test]
    fn test_coverage_targets_default() {
        let targets = CoverageTargets::default();
        assert_eq!(targets.code_coverage_percent, 80.0);
        assert_eq!(targets.requirement_coverage_percent, 100.0);
        assert_eq!(targets.min_tests_per_subtask, 2);
        assert!(targets.critical_path_coverage);
    }

    #[test]
    fn test_merge_plans() {
        let plan1 = TestPlan {
            test_suites: vec![],
            coverage_targets: CoverageTargets::default(),
            total_tests: 5,
            estimated_minutes: 10.0,
        };

        let plan2 = TestPlan {
            test_suites: vec![],
            coverage_targets: CoverageTargets::default(),
            total_tests: 3,
            estimated_minutes: 5.0,
        };

        let merged = TestPlanGenerator::merge_plans(vec![plan1, plan2]).unwrap();
        assert_eq!(merged.total_tests, 8);
        assert_eq!(merged.estimated_minutes, 15.0);
    }
}
