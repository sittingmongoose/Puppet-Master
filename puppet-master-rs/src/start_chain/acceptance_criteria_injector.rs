//! Acceptance criteria injector - injects machine-verifiable acceptance criteria into PRD subtasks.
//!
//! This module ensures every subtask has at least one machine-verifiable acceptance criterion
//! that gates can execute (command/file_exists/regex).

use crate::types::{Criterion, PRD, Phase, Subtask, Task};
use anyhow::{Result, anyhow};
use log::{debug, info};
use serde::{Deserialize, Serialize};

/// Configuration for acceptance criteria injection.
#[derive(Debug, Clone)]
pub struct InjectorConfig {
    /// Minimum number of acceptance criteria per subtask.
    pub min_criteria_per_subtask: usize,
    /// Whether to prefer automated criteria.
    pub prefer_automated: bool,
    /// Whether to include file existence checks.
    pub include_file_checks: bool,
    /// Whether to include command execution checks.
    pub include_command_checks: bool,
    /// Whether to include regex pattern checks.
    pub include_regex_checks: bool,
}

impl Default for InjectorConfig {
    fn default() -> Self {
        Self {
            min_criteria_per_subtask: 1,
            prefer_automated: true,
            include_file_checks: true,
            include_command_checks: true,
            include_regex_checks: true,
        }
    }
}

/// Result of injection operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectionResult {
    /// Number of subtasks processed.
    pub subtasks_processed: usize,
    /// Number of subtasks that had no criteria.
    pub subtasks_without_criteria: usize,
    /// Number of criteria injected.
    pub criteria_injected: usize,
    /// Number of criteria converted to machine-verifiable.
    pub criteria_converted: usize,
}

/// Injects machine-verifiable acceptance criteria into a PRD.
pub struct AcceptanceCriteriaInjector {
    config: InjectorConfig,
}

impl AcceptanceCriteriaInjector {
    /// Create a new injector with the given configuration.
    pub fn new(config: InjectorConfig) -> Self {
        Self { config }
    }

    /// Create an injector with default configuration.
    pub fn default() -> Self {
        Self {
            config: InjectorConfig::default(),
        }
    }

    /// Inject acceptance criteria into all subtasks in the PRD.
    ///
    /// This method modifies the PRD in place, ensuring every subtask has
    /// at least the minimum number of machine-verifiable acceptance criteria.
    pub fn inject(&self, prd: &mut PRD) -> Result<InjectionResult> {
        info!(
            "Injecting acceptance criteria into PRD: {}",
            prd.metadata.name
        );

        let mut result = InjectionResult {
            subtasks_processed: 0,
            subtasks_without_criteria: 0,
            criteria_injected: 0,
            criteria_converted: 0,
        };

        for phase in &mut prd.phases {
            self.inject_phase(phase, &mut result)?;
        }

        info!(
            "Injection complete: {} subtasks processed, {} criteria injected, {} converted",
            result.subtasks_processed, result.criteria_injected, result.criteria_converted
        );

        Ok(result)
    }

    /// Inject criteria into a phase.
    fn inject_phase(&self, phase: &mut Phase, result: &mut InjectionResult) -> Result<()> {
        debug!("Processing phase: {}", phase.id);

        for task in &mut phase.tasks {
            self.inject_task(task, result)?;
        }

        Ok(())
    }

    /// Inject criteria into a task.
    fn inject_task(&self, task: &mut Task, result: &mut InjectionResult) -> Result<()> {
        debug!("Processing task: {}", task.id);

        for subtask in &mut task.subtasks {
            self.inject_subtask(subtask, result)?;
        }

        Ok(())
    }

    /// Inject criteria into a subtask.
    fn inject_subtask(&self, subtask: &mut Subtask, result: &mut InjectionResult) -> Result<()> {
        debug!("Processing subtask: {}", subtask.id);
        result.subtasks_processed += 1;

        // Convert existing string acceptance_criteria to prefixed format if not already
        if !subtask.acceptance_criteria.is_empty() {
            let mut converted_strings = Vec::new();
            for criterion_str in &subtask.acceptance_criteria {
                if !Self::is_prefixed_criterion(criterion_str) {
                    // Convert to prefixed format
                    let prefixed = self.text_to_prefixed_string(criterion_str);
                    converted_strings.push(prefixed);
                    result.criteria_converted += 1;
                } else {
                    converted_strings.push(criterion_str.clone());
                }
            }
            subtask.acceptance_criteria = converted_strings;

            // Also convert to Criterion objects if needed
            let converted = self.convert_string_criteria_to_criterion(&subtask.acceptance_criteria)?;
            if let Some(ref mut criterion) = subtask.criterion {
                // If there's already a criterion, we'll keep it but may need to enhance it
                if !self.is_machine_verifiable(criterion) {
                    self.enhance_criterion(criterion, &subtask.title, &subtask.description);
                }
            } else {
                // Create a composite criterion from the strings
                subtask.criterion = Some(self.create_composite_criterion(&subtask.id, &converted)?);
            }
        }

        // Check if subtask has at least one acceptance_criteria string
        if subtask.acceptance_criteria.is_empty() {
            result.subtasks_without_criteria += 1;

            // Generate default criteria based on subtask content
            let generated = self.generate_default_criteria(subtask)?;
            result.criteria_injected += generated.len();

            // Convert Criterion objects to prefixed strings
            for criterion in &generated {
                let prefixed = self.criterion_to_prefixed_string(criterion);
                subtask.acceptance_criteria.push(prefixed);
            }

            // Set first criterion object if available
            if let Some(first_criterion) = generated.into_iter().next() {
                subtask.criterion = Some(first_criterion);
            }
        }

        Ok(())
    }

    /// Check if a criterion string is already in prefixed format.
    fn is_prefixed_criterion(text: &str) -> bool {
        text.starts_with("command:")
            || text.starts_with("file_exists:")
            || text.starts_with("regex:")
    }

    /// Convert a text criterion to a prefixed string format.
    fn text_to_prefixed_string(&self, text: &str) -> String {
        let lower = text.to_lowercase();

        // Determine verification method from text
        if lower.contains("file") && lower.contains("exist") {
            format!("file_exists: {}", text)
        } else if lower.contains("command") || lower.contains("run") || lower.contains("execute") {
            format!("command: {}", text)
        } else if lower.contains("match") || lower.contains("pattern") || lower.contains("contain") {
            format!("regex: {}", text)
        } else if lower.contains("test") || lower.contains("pass") {
            format!("command: {}", text)
        } else {
            format!("command: {}", text)
        }
    }

    /// Convert a Criterion object to a prefixed string format.
    fn criterion_to_prefixed_string(&self, criterion: &Criterion) -> String {
        let method = criterion
            .verification_method
            .as_deref()
            .unwrap_or("command");

        match method {
            "file_exists" => {
                if let Some(ref expected) = criterion.expected {
                    format!("file_exists: {}", expected)
                } else {
                    format!("file_exists: {}", criterion.description)
                }
            }
            "regex" => {
                if let Some(ref expected) = criterion.expected {
                    format!("regex: {}", expected)
                } else {
                    format!("regex: {}", criterion.description)
                }
            }
            _ => {
                // Default to command
                if let Some(ref expected) = criterion.expected {
                    format!("command: {}", expected)
                } else {
                    format!("command: {}", criterion.description)
                }
            }
        }
    }

    /// Convert string acceptance criteria to Criterion objects.
    fn convert_string_criteria_to_criterion(&self, criteria: &[String]) -> Result<Vec<Criterion>> {
        let mut converted = Vec::new();

        for (idx, criterion_text) in criteria.iter().enumerate() {
            let criterion = self.text_to_criterion(&format!("C{:02}", idx + 1), criterion_text)?;
            converted.push(criterion);
        }

        Ok(converted)
    }

    /// Create a composite criterion from multiple criteria.
    fn create_composite_criterion(&self, subtask_id: &str, criteria: &[Criterion]) -> Result<Criterion> {
        if criteria.is_empty() {
            return Err(anyhow!("Cannot create composite criterion from empty list"));
        }

        if criteria.len() == 1 {
            return Ok(criteria[0].clone());
        }

        // For multiple criteria, create a composite description
        let description = criteria
            .iter()
            .map(|c| c.description.as_str())
            .collect::<Vec<_>>()
            .join("; ");

        Ok(Criterion {
            id: format!("{}-COMPOSITE", subtask_id),
            description,
            met: false,
            verification_method: Some("command".to_string()),
            expected: Some("All criteria met".to_string()),
            actual: None,
        })
    }

    /// Convert a text criterion to a Criterion object with verification method.
    fn text_to_criterion(&self, id: &str, text: &str) -> Result<Criterion> {
        // Check if text is in prefixed format
        if let Some(content) = text.strip_prefix("command:") {
            let content = content.trim();
            return Ok(Criterion {
                id: id.to_string(),
                description: content.to_string(),
                met: false,
                verification_method: Some("command".to_string()),
                expected: Some(content.to_string()),
                actual: None,
            });
        } else if let Some(content) = text.strip_prefix("file_exists:") {
            let content = content.trim();
            return Ok(Criterion {
                id: id.to_string(),
                description: format!("File exists: {}", content),
                met: false,
                verification_method: Some("file_exists".to_string()),
                expected: Some(content.to_string()),
                actual: None,
            });
        } else if let Some(content) = text.strip_prefix("regex:") {
            let content = content.trim();
            return Ok(Criterion {
                id: id.to_string(),
                description: format!("Pattern match: {}", content),
                met: false,
                verification_method: Some("regex".to_string()),
                expected: Some(content.to_string()),
                actual: None,
            });
        }

        // Fallback to heuristic-based detection for unprefixed strings
        let lower = text.to_lowercase();

        // Determine verification method from text
        let verification_method = if lower.contains("file") && lower.contains("exist") {
            "file_exists"
        } else if lower.contains("command") || lower.contains("run") || lower.contains("execute") {
            "command"
        } else if lower.contains("match") || lower.contains("pattern") || lower.contains("contain") {
            "regex"
        } else if lower.contains("test") || lower.contains("pass") {
            "command"
        } else {
            "command" // Default to command execution
        };

        // Extract expected value if possible
        let expected = self.extract_expected_value(text);

        Ok(Criterion {
            id: id.to_string(),
            description: text.to_string(),
            met: false,
            verification_method: Some(verification_method.to_string()),
            expected: Some(expected),
            actual: None,
        })
    }

    /// Extract expected value from criterion text.
    fn extract_expected_value(&self, text: &str) -> String {
        let lower = text.to_lowercase();

        if lower.contains("pass") || lower.contains("succeed") {
            "Success".to_string()
        } else if lower.contains("exist") {
            "File exists".to_string()
        } else if lower.contains("return") && lower.contains("0") {
            "Exit code 0".to_string()
        } else if lower.contains("output") {
            "Expected output matches".to_string()
        } else {
            "Verification passes".to_string()
        }
    }

    /// Check if a criterion is machine-verifiable.
    fn is_machine_verifiable(&self, criterion: &Criterion) -> bool {
        if let Some(ref method) = criterion.verification_method {
            matches!(
                method.as_str(),
                "command" | "file_exists" | "regex" | "script"
            )
        } else {
            false
        }
    }

    /// Enhance a non-verifiable criterion to make it verifiable.
    fn enhance_criterion(&self, criterion: &mut Criterion, title: &str, description: &Option<String>) {
        debug!("Enhancing criterion: {}", criterion.id);

        // If no verification method, infer one
        if criterion.verification_method.is_none() {
            let method = self.infer_verification_method(title, description.as_deref().unwrap_or(""));
            criterion.verification_method = Some(method);
        }

        // If no expected value, generate one
        if criterion.expected.is_none() {
            criterion.expected = Some(self.generate_expected_value(&criterion.description));
        }
    }

    /// Infer verification method from subtask content.
    fn infer_verification_method(&self, title: &str, description: &str) -> String {
        let combined = format!("{} {}", title, description).to_lowercase();

        if combined.contains("build") || combined.contains("compile") {
            "command".to_string()
        } else if combined.contains("test") {
            "command".to_string()
        } else if combined.contains("file") || combined.contains("create") {
            "file_exists".to_string()
        } else if combined.contains("output") || combined.contains("format") {
            "regex".to_string()
        } else {
            "command".to_string()
        }
    }

    /// Generate expected value from criterion description.
    fn generate_expected_value(&self, description: &str) -> String {
        let lower = description.to_lowercase();

        if lower.contains("build") {
            "Build succeeds".to_string()
        } else if lower.contains("test") {
            "Tests pass".to_string()
        } else if lower.contains("file") {
            "File exists".to_string()
        } else {
            "Verification succeeds".to_string()
        }
    }

    /// Generate default acceptance criteria for a subtask that has none.
    fn generate_default_criteria(&self, subtask: &Subtask) -> Result<Vec<Criterion>> {
        debug!("Generating default criteria for: {}", subtask.id);

        let mut criteria = Vec::new();

        // Base criterion on subtask description or title
        let description = subtask
            .description
            .as_ref()
            .map(|s| s.as_str())
            .unwrap_or(&subtask.title);

        // Generate basic completion criterion
        let completion_criterion = self.generate_completion_criterion(subtask, description)?;
        criteria.push(completion_criterion);

        // Generate type-specific criteria based on content
        if self.config.include_file_checks {
            if let Some(file_criterion) = self.try_generate_file_criterion(subtask, description) {
                criteria.push(file_criterion);
            }
        }

        if self.config.include_command_checks {
            if let Some(cmd_criterion) = self.try_generate_command_criterion(subtask, description) {
                criteria.push(cmd_criterion);
            }
        }

        // Limit to at most min_criteria_per_subtask + 2
        criteria.truncate(self.config.min_criteria_per_subtask + 2);

        Ok(criteria)
    }

    /// Generate a basic completion criterion.
    fn generate_completion_criterion(&self, subtask: &Subtask, description: &str) -> Result<Criterion> {
        let verification_method = self.infer_verification_method(&subtask.title, description);

        Ok(Criterion {
            id: format!("{}-AC01", subtask.id),
            description: format!("Verify: {}", subtask.title),
            met: false,
            verification_method: Some(verification_method),
            expected: Some("Implementation complete and verified".to_string()),
            actual: None,
        })
    }

    /// Try to generate a file existence criterion based on content.
    fn try_generate_file_criterion(&self, subtask: &Subtask, description: &str) -> Option<Criterion> {
        let lower = description.to_lowercase();

        if lower.contains("file") || lower.contains("create") || lower.contains("implement") {
            Some(Criterion {
                id: format!("{}-FILE", subtask.id),
                description: "Verify implementation files exist".to_string(),
                met: false,
                verification_method: Some("file_exists".to_string()),
                expected: Some("Required files present".to_string()),
                actual: None,
            })
        } else {
            None
        }
    }

    /// Try to generate a command execution criterion based on content.
    fn try_generate_command_criterion(&self, subtask: &Subtask, description: &str) -> Option<Criterion> {
        let lower = description.to_lowercase();

        if lower.contains("test") || lower.contains("verify") || lower.contains("check") {
            Some(Criterion {
                id: format!("{}-CMD", subtask.id),
                description: "Run verification tests".to_string(),
                met: false,
                verification_method: Some("command".to_string()),
                expected: Some("Tests pass successfully".to_string()),
                actual: None,
            })
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ItemStatus, PRDMetadata};

    fn create_test_subtask(id: &str, title: &str) -> Subtask {
        Subtask {
            id: id.to_string(),
            task_id: "TK-001".to_string(),
            title: title.to_string(),
            description: Some(format!("Description for {}", title)),
            criterion: None,
            status: ItemStatus::Pending,
            iterations: 0,
            evidence: vec![],
            plan: None,
            acceptance_criteria: vec![],
            iteration_records: vec![],
        }
    }

    fn create_test_prd() -> PRD {
        let mut prd = PRD::new("Test Project");

        let subtask1 = create_test_subtask("ST-001", "Implement feature");
        let subtask2 = create_test_subtask("ST-002", "Write tests");

        let task = Task {
            id: "TK-001".to_string(),
            title: "Main Task".to_string(),
            description: None,
            status: ItemStatus::Pending,
            subtasks: vec![subtask1, subtask2],
            evidence: vec![],
            gate_reports: vec![],
            dependencies: vec![],
            complexity: None,
            task_type: None,
        };

        let phase = Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Pending,
            tasks: vec![task],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        prd.phases.push(phase);
        prd
    }

    #[test]
    fn test_injector_creation() {
        let injector = AcceptanceCriteriaInjector::default();
        assert_eq!(injector.config.min_criteria_per_subtask, 1);
    }

    #[test]
    fn test_inject_empty_prd() {
        let injector = AcceptanceCriteriaInjector::default();
        let mut prd = PRD::new("Empty");
        let result = injector.inject(&mut prd).unwrap();

        assert_eq!(result.subtasks_processed, 0);
        assert_eq!(result.criteria_injected, 0);
    }

    #[test]
    fn test_inject_criteria() {
        let injector = AcceptanceCriteriaInjector::default();
        let mut prd = create_test_prd();

        let result = injector.inject(&mut prd).unwrap();

        assert_eq!(result.subtasks_processed, 2);
        assert!(result.criteria_injected > 0);

        // Verify criteria were added
        let subtask = &prd.phases[0].tasks[0].subtasks[0];
        assert!(subtask.criterion.is_some());

        let criterion = subtask.criterion.as_ref().unwrap();
        assert!(criterion.verification_method.is_some());
        assert!(criterion.expected.is_some());
    }

    #[test]
    fn test_is_machine_verifiable() {
        let injector = AcceptanceCriteriaInjector::default();

        let criterion1 = Criterion {
            id: "C1".to_string(),
            description: "Test".to_string(),
            met: false,
            verification_method: Some("command".to_string()),
            expected: None,
            actual: None,
        };
        assert!(injector.is_machine_verifiable(&criterion1));

        let criterion2 = Criterion {
            id: "C2".to_string(),
            description: "Test".to_string(),
            met: false,
            verification_method: Some("manual".to_string()),
            expected: None,
            actual: None,
        };
        assert!(!injector.is_machine_verifiable(&criterion2));

        let criterion3 = Criterion {
            id: "C3".to_string(),
            description: "Test".to_string(),
            met: false,
            verification_method: None,
            expected: None,
            actual: None,
        };
        assert!(!injector.is_machine_verifiable(&criterion3));
    }

    #[test]
    fn test_text_to_criterion() {
        let injector = AcceptanceCriteriaInjector::default();

        let criterion = injector
            .text_to_criterion("C1", "File must exist at path")
            .unwrap();
        assert_eq!(criterion.verification_method, Some("file_exists".to_string()));

        let criterion2 = injector
            .text_to_criterion("C2", "Run tests and verify pass")
            .unwrap();
        assert_eq!(criterion2.verification_method, Some("command".to_string()));

        let criterion3 = injector
            .text_to_criterion("C3", "Output must match pattern")
            .unwrap();
        assert_eq!(criterion3.verification_method, Some("regex".to_string()));
    }

    #[test]
    fn test_infer_verification_method() {
        let injector = AcceptanceCriteriaInjector::default();

        assert_eq!(
            injector.infer_verification_method("Build project", "Compile all sources"),
            "command"
        );
        assert_eq!(
            injector.infer_verification_method("Create config file", "Generate config.toml"),
            "file_exists"
        );
        assert_eq!(
            injector.infer_verification_method("Verify output format", "Check JSON structure"),
            "regex"
        );
    }

    #[test]
    fn test_convert_string_criteria() {
        let injector = AcceptanceCriteriaInjector::default();
        let strings = vec![
            "Tests must pass".to_string(),
            "File must exist".to_string(),
        ];

        let criteria = injector.convert_string_criteria_to_criterion(&strings).unwrap();
        assert_eq!(criteria.len(), 2);
        assert!(criteria[0].verification_method.is_some());
        assert!(criteria[1].verification_method.is_some());
    }

    #[test]
    fn test_generate_default_criteria() {
        let injector = AcceptanceCriteriaInjector::default();
        let subtask = create_test_subtask("ST-001", "Implement authentication");

        let criteria = injector.generate_default_criteria(&subtask).unwrap();
        assert!(!criteria.is_empty());
        assert!(criteria[0].verification_method.is_some());
    }

    #[test]
    fn test_inject_with_existing_string_criteria() {
        let injector = AcceptanceCriteriaInjector::default();
        let mut prd = PRD::new("Test");

        let mut subtask = create_test_subtask("ST-001", "Feature");
        subtask.acceptance_criteria = vec![
            "Tests pass".to_string(),
            "File exists".to_string(),
        ];

        let task = Task {
            id: "TK-001".to_string(),
            title: "Task".to_string(),
            description: None,
            status: ItemStatus::Pending,
            subtasks: vec![subtask],
            evidence: vec![],
            gate_reports: vec![],
            dependencies: vec![],
            complexity: None,
            task_type: None,
        };

        let phase = Phase {
            id: "PH-001".to_string(),
            title: "Phase".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Pending,
            tasks: vec![task],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        prd.phases.push(phase);

        let result = injector.inject(&mut prd).unwrap();
        assert_eq!(result.subtasks_processed, 1);
        assert!(result.criteria_converted > 0);

        // Verify criterion was created from strings
        let subtask = &prd.phases[0].tasks[0].subtasks[0];
        assert!(subtask.criterion.is_some());
        
        // Verify acceptance_criteria strings were converted to prefixed format
        assert!(!subtask.acceptance_criteria.is_empty());
        for criterion_str in &subtask.acceptance_criteria {
            assert!(
                criterion_str.starts_with("command:")
                    || criterion_str.starts_with("file_exists:")
                    || criterion_str.starts_with("regex:")
            );
        }
    }

    #[test]
    fn test_prefixed_criterion_detection() {
        assert!(AcceptanceCriteriaInjector::is_prefixed_criterion("command: cargo test"));
        assert!(AcceptanceCriteriaInjector::is_prefixed_criterion("file_exists: src/main.rs"));
        assert!(AcceptanceCriteriaInjector::is_prefixed_criterion("regex: Cargo.toml:name"));
        assert!(!AcceptanceCriteriaInjector::is_prefixed_criterion("Tests must pass"));
    }

    #[test]
    fn test_text_to_prefixed_string() {
        let injector = AcceptanceCriteriaInjector::default();
        
        assert_eq!(
            injector.text_to_prefixed_string("File must exist at path"),
            "file_exists: File must exist at path"
        );
        assert_eq!(
            injector.text_to_prefixed_string("Run tests and verify pass"),
            "command: Run tests and verify pass"
        );
        assert_eq!(
            injector.text_to_prefixed_string("Output must match pattern"),
            "regex: Output must match pattern"
        );
    }

    #[test]
    fn test_criterion_to_prefixed_string() {
        let injector = AcceptanceCriteriaInjector::default();
        
        let criterion1 = Criterion {
            id: "C1".to_string(),
            description: "Check file".to_string(),
            met: false,
            verification_method: Some("file_exists".to_string()),
            expected: Some("/path/to/file".to_string()),
            actual: None,
        };
        assert_eq!(
            injector.criterion_to_prefixed_string(&criterion1),
            "file_exists: /path/to/file"
        );
        
        let criterion2 = Criterion {
            id: "C2".to_string(),
            description: "Run command".to_string(),
            met: false,
            verification_method: Some("command".to_string()),
            expected: Some("cargo test".to_string()),
            actual: None,
        };
        assert_eq!(
            injector.criterion_to_prefixed_string(&criterion2),
            "command: cargo test"
        );
    }

    #[test]
    fn test_parse_prefixed_criterion() {
        let injector = AcceptanceCriteriaInjector::default();
        
        let criterion1 = injector.text_to_criterion("C1", "command: cargo test").unwrap();
        assert_eq!(criterion1.verification_method, Some("command".to_string()));
        assert_eq!(criterion1.expected, Some("cargo test".to_string()));
        
        let criterion2 = injector.text_to_criterion("C2", "file_exists: Cargo.toml").unwrap();
        assert_eq!(criterion2.verification_method, Some("file_exists".to_string()));
        assert_eq!(criterion2.expected, Some("Cargo.toml".to_string()));
        
        let criterion3 = injector.text_to_criterion("C3", "regex: Cargo.toml:name.*puppet").unwrap();
        assert_eq!(criterion3.verification_method, Some("regex".to_string()));
        assert_eq!(criterion3.expected, Some("Cargo.toml:name.*puppet".to_string()));
    }

    #[test]
    fn test_inject_populates_acceptance_criteria_strings() {
        let injector = AcceptanceCriteriaInjector::default();
        let mut prd = create_test_prd();

        let result = injector.inject(&mut prd).unwrap();
        assert!(result.criteria_injected > 0);

        // Verify all subtasks have acceptance_criteria strings
        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    assert!(!subtask.acceptance_criteria.is_empty(), 
                        "Subtask {} should have acceptance_criteria", subtask.id);
                    
                    // Verify at least one is in prefixed format
                    let has_prefixed = subtask.acceptance_criteria.iter().any(|c| {
                        AcceptanceCriteriaInjector::is_prefixed_criterion(c)
                    });
                    assert!(has_prefixed, 
                        "Subtask {} should have at least one prefixed criterion", subtask.id);
                }
            }
        }
    }
}
