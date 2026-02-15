//! Criterion classifier - classifies requirements into verification criteria.
//!
//! Determines what type of verification each requirement needs
//! and whether it can be automated.

use crate::types::{PRD, ParsedRequirements, Priority, RequirementsSection, Subtask};
use anyhow::Result;
use log::{debug, info};
use serde::{Deserialize, Serialize};

// DRY:DATA:CriterionClassifier
/// Classifies requirements into verification criteria.
pub struct CriterionClassifier;

// DRY:DATA:ClassifiedCriterion
/// A classified verification criterion.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClassifiedCriterion {
    /// Unique requirement identifier.
    pub requirement_id: String,
    /// The criterion text.
    pub criterion_text: String,
    /// Type of verification needed.
    pub verification_type: VerificationType,
    /// Whether this can be automated.
    pub automated: bool,
    /// Priority level.
    pub priority: Priority,
    /// Suggested verification command or script.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verification_command: Option<String>,
    /// Expected result or pattern.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_result: Option<String>,
    /// Tags for categorization.
    #[serde(default)]
    pub tags: Vec<String>,
}

// DRY:DATA:VerificationType
/// Type of verification to perform.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum VerificationType {
    /// Command execution verification.
    Command,
    /// File existence check.
    FileExists,
    /// Regular expression pattern match.
    Regex,
    /// Custom script execution.
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
    /// Code review.
    CodeReview,
    /// Documentation check.
    Documentation,
    /// Performance test.
    Performance,
    /// Security scan.
    Security,
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
            Self::CodeReview => write!(f, "CodeReview"),
            Self::Documentation => write!(f, "Documentation"),
            Self::Performance => write!(f, "Performance"),
            Self::Security => write!(f, "Security"),
        }
    }
}

impl VerificationType {
    // DRY:FN:is_automatable
    /// Returns whether this verification type can be automated.
    pub fn is_automatable(&self) -> bool {
        !matches!(self, Self::Manual | Self::CodeReview)
    }

    // DRY:FN:typical_duration_seconds
    /// Returns the typical time to execute in seconds.
    pub fn typical_duration_seconds(&self) -> u32 {
        match self {
            Self::Command => 30,
            Self::FileExists => 5,
            Self::Regex => 10,
            Self::Script => 60,
            Self::Manual => 300,
            Self::UnitTest => 120,
            Self::IntegrationTest => 300,
            Self::Build => 240,
            Self::Lint => 60,
            Self::TypeCheck => 90,
            Self::CodeReview => 1800,
            Self::Documentation => 120,
            Self::Performance => 600,
            Self::Security => 480,
        }
    }
}

// DRY:DATA:ClassificationResult
/// Classification result containing all classified criteria.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClassificationResult {
    /// All classified criteria.
    pub criteria: Vec<ClassifiedCriterion>,
    /// Number of automatable criteria.
    pub automatable_count: usize,
    /// Number of manual criteria.
    pub manual_count: usize,
    /// Total criteria.
    pub total_count: usize,
    /// Automation coverage percentage.
    pub automation_coverage: f64,
}

impl CriterionClassifier {
    // DRY:FN:classify_requirements
    /// Classify requirements into verification criteria.
    pub fn classify_requirements(
        requirements: &ParsedRequirements,
    ) -> Result<ClassificationResult> {
        info!(
            "Classifying requirements for: {}",
            requirements.project_name
        );

        let mut criteria = Vec::new();

        for (section_idx, section) in requirements.sections.iter().enumerate() {
            let section_criteria = Self::classify_section(section, section_idx)?;
            criteria.extend(section_criteria);
        }

        Self::build_result(criteria)
    }

    // DRY:FN:classify_prd
    /// Classify a PRD into verification criteria.
    pub fn classify_prd(prd: &PRD) -> Result<ClassificationResult> {
        info!("Classifying PRD: {}", prd.metadata.name);

        let mut criteria = Vec::new();

        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    let subtask_criteria = Self::classify_subtask(subtask)?;
                    criteria.extend(subtask_criteria);
                }
            }
        }

        Self::build_result(criteria)
    }

    /// Classify a single requirements section.
    fn classify_section(
        section: &RequirementsSection,
        section_idx: usize,
    ) -> Result<Vec<ClassifiedCriterion>> {
        debug!("Classifying section: {}", section.title);

        let mut criteria = Vec::new();
        let mut item_idx = 0;

        // Parse content for individual requirements
        for line in section.content.lines() {
            let trimmed = line.trim();

            if Self::is_requirement_line(trimmed) {
                let requirement_text = trimmed
                    .trim_start_matches("- ")
                    .trim_start_matches("* ")
                    .trim_start_matches("+ ");

                if !requirement_text.is_empty() {
                    let criterion = Self::classify_requirement(
                        requirement_text,
                        &format!("REQ-{:03}-{:03}", section_idx + 1, item_idx + 1),
                    )?;
                    criteria.push(criterion);
                    item_idx += 1;
                }
            }
        }

        Ok(criteria)
    }

    /// Classify a subtask into criteria.
    fn classify_subtask(subtask: &Subtask) -> Result<Vec<ClassifiedCriterion>> {
        debug!("Classifying subtask: {}", subtask.id);

        let mut criteria = Vec::new();

        // Classify acceptance criteria
        for (idx, criterion_text) in subtask.acceptance_criteria.iter().enumerate() {
            let criterion = Self::classify_requirement(
                criterion_text,
                &format!("{}-C{:02}", subtask.id, idx + 1),
            )?;
            criteria.push(criterion);
        }

        // If no acceptance criteria, classify the subtask itself
        if criteria.is_empty() {
            if let Some(ref description) = subtask.description {
                let criterion =
                    Self::classify_requirement(description, &format!("{}-C01", subtask.id))?;
                criteria.push(criterion);
            }
        }

        Ok(criteria)
    }

    /// Classify a single requirement text.
    fn classify_requirement(text: &str, requirement_id: &str) -> Result<ClassifiedCriterion> {
        let verification_type = Self::infer_verification_type(text);
        let automated = verification_type.is_automatable();
        let priority = Self::infer_priority(text);
        let verification_command = Self::suggest_verification_command(text, verification_type);
        let expected_result = Self::suggest_expected_result(text, verification_type);
        let tags = Self::extract_tags(text);

        Ok(ClassifiedCriterion {
            requirement_id: requirement_id.to_string(),
            criterion_text: text.to_string(),
            verification_type,
            automated,
            priority,
            verification_command,
            expected_result,
            tags,
        })
    }

    /// Check if a line contains a requirement.
    fn is_requirement_line(line: &str) -> bool {
        !line.is_empty()
            && (line.starts_with("- ")
                || line.starts_with("* ")
                || line.starts_with("+ ")
                || line.to_lowercase().contains("must")
                || line.to_lowercase().contains("should")
                || line.to_lowercase().contains("shall"))
    }

    /// Infer verification type from requirement text.
    fn infer_verification_type(text: &str) -> VerificationType {
        let lower = text.to_lowercase();

        // Check for specific keywords
        if lower.contains("build") || lower.contains("compile") {
            VerificationType::Build
        } else if lower.contains("lint") || lower.contains("format") {
            VerificationType::Lint
        } else if lower.contains("type check") || lower.contains("types") {
            VerificationType::TypeCheck
        } else if lower.contains("unit test") {
            VerificationType::UnitTest
        } else if lower.contains("integration test") || lower.contains("e2e") {
            VerificationType::IntegrationTest
        } else if lower.contains("performance") || lower.contains("benchmark") {
            VerificationType::Performance
        } else if lower.contains("security") || lower.contains("vulnerab") {
            VerificationType::Security
        } else if lower.contains("document") || lower.contains("readme") {
            VerificationType::Documentation
        } else if lower.contains("file exists") || lower.contains("creates file") {
            VerificationType::FileExists
        } else if lower.contains("command") || lower.contains("run") || lower.contains("execute") {
            VerificationType::Command
        } else if lower.contains("match") || lower.contains("pattern") || lower.contains("regex") {
            VerificationType::Regex
        } else if lower.contains("script") {
            VerificationType::Script
        } else if lower.contains("review") {
            VerificationType::CodeReview
        } else {
            VerificationType::Manual
        }
    }

    /// Infer priority from requirement text.
    fn infer_priority(text: &str) -> Priority {
        let lower = text.to_lowercase();

        if lower.contains("must") || lower.contains("critical") || lower.contains("required") {
            Priority::Critical
        } else if lower.contains("should") || lower.contains("important") {
            Priority::High
        } else if lower.contains("could") || lower.contains("nice") {
            Priority::Low
        } else {
            Priority::Medium
        }
    }

    /// Suggest a verification command based on the requirement.
    fn suggest_verification_command(text: &str, vtype: VerificationType) -> Option<String> {
        let lower = text.to_lowercase();

        match vtype {
            VerificationType::Build => Some("cargo build --release".to_string()),
            VerificationType::Lint => Some("cargo clippy -- -D warnings".to_string()),
            VerificationType::TypeCheck => Some("cargo check".to_string()),
            VerificationType::UnitTest => Some("cargo test".to_string()),
            VerificationType::IntegrationTest => Some("cargo test --test '*'".to_string()),
            VerificationType::Security => Some("cargo audit".to_string()),
            VerificationType::Documentation => Some("cargo doc --no-deps".to_string()),
            VerificationType::FileExists => {
                // Try to extract filename
                if let Some(start) = lower.find("file") {
                    if let Some(name_start) = text[start..].find(|c: char| c == '`' || c == '"') {
                        if let Some(name_end) =
                            text[start + name_start + 1..].find(|c: char| c == '`' || c == '"')
                        {
                            let filename =
                                &text[start + name_start + 1..start + name_start + 1 + name_end];
                            return Some(format!("test -f {}", filename));
                        }
                    }
                }
                Some("test -f <filename>".to_string())
            }
            _ => None,
        }
    }

    /// Suggest expected result based on verification type.
    fn suggest_expected_result(_text: &str, vtype: VerificationType) -> Option<String> {
        match vtype {
            VerificationType::Build => Some("Build succeeds with no errors".to_string()),
            VerificationType::Lint => Some("No lint warnings or errors".to_string()),
            VerificationType::TypeCheck => Some("Type checking passes".to_string()),
            VerificationType::UnitTest => Some("All tests pass".to_string()),
            VerificationType::IntegrationTest => Some("Integration tests pass".to_string()),
            VerificationType::Security => Some("No security vulnerabilities found".to_string()),
            VerificationType::Documentation => {
                Some("Documentation generates successfully".to_string())
            }
            VerificationType::FileExists => Some("File exists".to_string()),
            VerificationType::Command => Some("Command exits with code 0".to_string()),
            _ => None,
        }
    }

    /// Extract tags from requirement text.
    fn extract_tags(text: &str) -> Vec<String> {
        let mut tags = Vec::new();
        let lower = text.to_lowercase();

        if lower.contains("api") {
            tags.push("api".to_string());
        }
        if lower.contains("ui") || lower.contains("interface") {
            tags.push("ui".to_string());
        }
        if lower.contains("database") || lower.contains("storage") {
            tags.push("database".to_string());
        }
        if lower.contains("network") || lower.contains("http") {
            tags.push("network".to_string());
        }
        if lower.contains("auth") {
            tags.push("auth".to_string());
        }
        if lower.contains("performance") {
            tags.push("performance".to_string());
        }
        if lower.contains("security") {
            tags.push("security".to_string());
        }

        tags
    }

    /// Build classification result from criteria list.
    fn build_result(criteria: Vec<ClassifiedCriterion>) -> Result<ClassificationResult> {
        let total_count = criteria.len();
        let automatable_count = criteria.iter().filter(|c| c.automated).count();
        let manual_count = total_count - automatable_count;

        let automation_coverage = if total_count > 0 {
            (automatable_count as f64 / total_count as f64) * 100.0
        } else {
            0.0
        };

        Ok(ClassificationResult {
            criteria,
            automatable_count,
            manual_count,
            total_count,
            automation_coverage,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::ParsedRequirements;

    #[test]
    fn test_infer_verification_type() {
        assert_eq!(
            CriterionClassifier::infer_verification_type("Must build successfully"),
            VerificationType::Build
        );
        assert_eq!(
            CriterionClassifier::infer_verification_type("Run unit tests"),
            VerificationType::UnitTest
        );
        assert_eq!(
            CriterionClassifier::infer_verification_type("File exists at path"),
            VerificationType::FileExists
        );
        assert_eq!(
            CriterionClassifier::infer_verification_type("Security scan required"),
            VerificationType::Security
        );
    }

    #[test]
    fn test_infer_priority() {
        assert_eq!(
            CriterionClassifier::infer_priority("Must implement feature"),
            Priority::Critical
        );
        assert_eq!(
            CriterionClassifier::infer_priority("Should add logging"),
            Priority::High
        );
        assert_eq!(
            CriterionClassifier::infer_priority("Could add optimization"),
            Priority::Low
        );
    }

    #[test]
    fn test_is_requirement_line() {
        assert!(CriterionClassifier::is_requirement_line(
            "- Must do something"
        ));
        assert!(CriterionClassifier::is_requirement_line(
            "Should verify this"
        ));
        assert!(!CriterionClassifier::is_requirement_line(""));
        assert!(!CriterionClassifier::is_requirement_line("   "));
    }

    #[test]
    fn test_verification_type_automatable() {
        assert!(VerificationType::Build.is_automatable());
        assert!(VerificationType::UnitTest.is_automatable());
        assert!(!VerificationType::Manual.is_automatable());
        assert!(!VerificationType::CodeReview.is_automatable());
    }

    #[test]
    fn test_extract_tags() {
        let tags = CriterionClassifier::extract_tags("API must support authentication");
        assert!(tags.contains(&"api".to_string()));
        assert!(tags.contains(&"auth".to_string()));
    }

    #[test]
    fn test_classify_requirements() {
        let requirements =
            ParsedRequirements::new("Test Project").with_section(RequirementsSection::new(
                "Features",
                "- Must build successfully\n- Should pass all tests",
            ));

        let result = CriterionClassifier::classify_requirements(&requirements).unwrap();
        assert!(result.total_count > 0);
        assert!(result.automation_coverage > 0.0);
    }

    #[test]
    fn test_suggest_verification_command() {
        let cmd = CriterionClassifier::suggest_verification_command(
            "Must build successfully",
            VerificationType::Build,
        );
        assert!(cmd.is_some());
        assert!(cmd.unwrap().contains("cargo"));
    }

    #[test]
    fn test_suggest_expected_result() {
        let result =
            CriterionClassifier::suggest_expected_result("Run tests", VerificationType::UnitTest);
        assert!(result.is_some());
        assert!(result.unwrap().contains("pass"));
    }
}
