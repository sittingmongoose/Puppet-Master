//! AGENTS.md Gate Enforcer
//!
//! Enforces AGENTS.md rules during gate verification.
//! Checks that required patterns are followed and identifies violations.

use anyhow::Result;
use serde::{Deserialize, Serialize};

/// Gate enforcer for AGENTS.md rules
pub struct GateEnforcer {
    rules: Vec<Rule>,
}

/// A gate enforcement rule
#[derive(Debug, Clone)]
pub struct Rule {
    name: String,
    description: String,
    severity: ViolationSeverity,
    check: RuleCheck,
}

/// Different types of rule checks
#[derive(Debug, Clone)]
enum RuleCheck {
    /// Check if a pattern exists in AGENTS.md
    PatternExists(String),
    /// Check if minimum number of patterns documented
    MinPatterns(usize),
    /// Check if minimum number of failure modes documented
    MinFailureModes(usize),
    /// Check if a specific section exists
    SectionExists(String),
    /// Check if entry matches a regex pattern
    _RegexMatch(String),
}

/// Result of enforcement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnforcementResult {
    /// Whether all checks passed
    pub passed: bool,
    /// List of violations found
    pub violations: Vec<Violation>,
    /// List of warnings (non-blocking)
    pub warnings: Vec<String>,
}

impl EnforcementResult {
    /// Create a passing result with no violations
    pub fn passing() -> Self {
        Self {
            passed: true,
            violations: Vec::new(),
            warnings: Vec::new(),
        }
    }

    /// Create a failing result
    pub fn failing(violations: Vec<Violation>) -> Self {
        let passed = violations
            .iter()
            .all(|v| v.severity != ViolationSeverity::Error);

        Self {
            passed,
            violations,
            warnings: Vec::new(),
        }
    }

    /// Add a warning
    pub fn with_warning(mut self, warning: String) -> Self {
        self.warnings.push(warning);
        self
    }
}

/// A single violation of AGENTS.md rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    /// Rule that was violated
    pub rule: String,
    /// Description of the violation
    pub description: String,
    /// Severity level
    pub severity: ViolationSeverity,
    /// Optional location in file
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
}

impl Violation {
    /// Create a new violation
    pub fn new(
        rule: impl Into<String>,
        description: impl Into<String>,
        severity: ViolationSeverity,
    ) -> Self {
        Self {
            rule: rule.into(),
            description: description.into(),
            severity,
            location: None,
        }
    }

    /// Add location information
    pub fn with_location(mut self, location: impl Into<String>) -> Self {
        self.location = Some(location.into());
        self
    }
}

/// Severity level of a violation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ViolationSeverity {
    /// Error - blocks gate
    Error,
    /// Warning - doesn't block gate
    Warning,
    /// Info - informational only
    Info,
}

impl GateEnforcer {
    /// Create a new gate enforcer with default rules
    pub fn new() -> Self {
        Self {
            rules: Self::default_rules(),
        }
    }

    /// Create with custom rules
    pub fn with_rules(rules: Vec<Rule>) -> Self {
        Self { rules }
    }

    /// Define default enforcement rules
    fn default_rules() -> Vec<Rule> {
        vec![
            Rule {
                name: "min-patterns".to_string(),
                description: "At least 2 successful patterns should be documented".to_string(),
                severity: ViolationSeverity::Warning,
                check: RuleCheck::MinPatterns(2),
            },
            Rule {
                name: "min-failure-modes".to_string(),
                description: "At least 1 failure mode should be documented".to_string(),
                severity: ViolationSeverity::Info,
                check: RuleCheck::MinFailureModes(1),
            },
            Rule {
                name: "patterns-section".to_string(),
                description: "AGENTS.md should have a Successful Patterns section".to_string(),
                severity: ViolationSeverity::Warning,
                check: RuleCheck::SectionExists("successful patterns".to_string()),
            },
        ]
    }

    /// Add a custom rule
    pub fn add_rule(&mut self, rule: Rule) {
        self.rules.push(rule);
    }

    /// Enforce rules against AGENTS.md content
    pub fn enforce(
        &self,
        agents_content: &str,
        agents_doc: &crate::types::AgentsDoc,
    ) -> Result<EnforcementResult> {
        let mut violations = Vec::new();
        let mut warnings = Vec::new();

        for rule in &self.rules {
            match &rule.check {
                RuleCheck::MinPatterns(min) => {
                    let pattern_count = agents_doc
                        .agents
                        .iter()
                        .filter(|a| a.role == "pattern")
                        .count();

                    if pattern_count < *min {
                        violations.push(Violation::new(
                            &rule.name,
                            format!(
                                "{}: found {}, expected at least {}",
                                rule.description, pattern_count, min
                            ),
                            rule.severity,
                        ));
                    }
                }

                RuleCheck::MinFailureModes(min) => {
                    let failure_count = agents_doc
                        .agents
                        .iter()
                        .filter(|a| a.role == "failure_mode")
                        .count();

                    if failure_count < *min {
                        violations.push(Violation::new(
                            &rule.name,
                            format!(
                                "{}: found {}, expected at least {}",
                                rule.description, failure_count, min
                            ),
                            rule.severity,
                        ));
                    }
                }

                RuleCheck::SectionExists(section_name) => {
                    let section_exists = agents_content
                        .to_lowercase()
                        .contains(&format!("## {}", section_name.to_lowercase()))
                        || agents_content
                            .to_lowercase()
                            .contains(&format!("# {}", section_name.to_lowercase()));

                    if !section_exists {
                        violations.push(Violation::new(
                            &rule.name,
                            format!("{}: section '{}' not found", rule.description, section_name),
                            rule.severity,
                        ));
                    }
                }

                RuleCheck::PatternExists(pattern) => {
                    if !agents_content.contains(pattern) {
                        violations.push(Violation::new(
                            &rule.name,
                            format!("{}: pattern '{}' not found", rule.description, pattern),
                            rule.severity,
                        ));
                    }
                }

                RuleCheck::_RegexMatch(pattern) => {
                    if let Ok(regex) = regex::Regex::new(pattern) {
                        if !regex.is_match(agents_content) {
                            violations.push(Violation::new(
                                &rule.name,
                                format!(
                                    "{}: regex pattern '{}' not matched",
                                    rule.description, pattern
                                ),
                                rule.severity,
                            ));
                        }
                    } else {
                        warnings.push(format!(
                            "Invalid regex pattern in rule '{}': {}",
                            rule.name, pattern
                        ));
                    }
                }
            }
        }

        // Check if any error-level violations exist
        let has_errors = violations
            .iter()
            .any(|v| v.severity == ViolationSeverity::Error);

        let mut result = EnforcementResult {
            passed: !has_errors,
            violations,
            warnings,
        };

        // Add general warnings
        if agents_content.trim().is_empty() {
            result
                .warnings
                .push("AGENTS.md is empty - no learnings documented yet".to_string());
        }

        if agents_doc.agents.is_empty() {
            result
                .warnings
                .push("No agent definitions found in AGENTS.md".to_string());
        }

        Ok(result)
    }

    /// Quick check - returns true if enforcement would pass
    pub fn quick_check(
        &self,
        agents_content: &str,
        agents_doc: &crate::types::AgentsDoc,
    ) -> Result<bool> {
        let result = self.enforce(agents_content, agents_doc)?;
        Ok(result.passed)
    }
}

impl Default for GateEnforcer {
    fn default() -> Self {
        Self::new()
    }
}

/// Builder for creating custom rules
pub struct RuleBuilder {
    name: String,
    description: String,
    severity: ViolationSeverity,
}

impl RuleBuilder {
    /// Create a new rule builder
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: String::new(),
            severity: ViolationSeverity::Warning,
        }
    }

    /// Set the description
    pub fn description(mut self, desc: impl Into<String>) -> Self {
        self.description = desc.into();
        self
    }

    /// Set the severity
    pub fn severity(mut self, severity: ViolationSeverity) -> Self {
        self.severity = severity;
        self
    }

    /// Build a rule that checks for minimum patterns
    pub fn min_patterns(self, min: usize) -> Rule {
        Rule {
            name: self.name,
            description: self.description,
            severity: self.severity,
            check: RuleCheck::MinPatterns(min),
        }
    }

    /// Build a rule that checks for minimum failure modes
    pub fn min_failure_modes(self, min: usize) -> Rule {
        Rule {
            name: self.name,
            description: self.description,
            severity: self.severity,
            check: RuleCheck::MinFailureModes(min),
        }
    }

    /// Build a rule that checks for section existence
    pub fn section_exists(self, section: impl Into<String>) -> Rule {
        Rule {
            name: self.name,
            description: self.description,
            severity: self.severity,
            check: RuleCheck::SectionExists(section.into()),
        }
    }

    /// Build a rule that checks for pattern existence
    pub fn pattern_exists(self, pattern: impl Into<String>) -> Rule {
        Rule {
            name: self.name,
            description: self.description,
            severity: self.severity,
            check: RuleCheck::PatternExists(pattern.into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{AgentDefinition, AgentsDoc};

    fn create_test_doc() -> (String, AgentsDoc) {
        let content = r#"# Agent Learnings

## Successful Patterns

- Pattern 1: Always check inputs
- Pattern 2: Log important events

## Failure Modes

- Failure 1: Missing error handling
"#;

        let mut doc = AgentsDoc::new("test");
        doc.agents.push(AgentDefinition::new(
            "Pattern 1",
            "pattern",
            "Always check inputs",
        ));
        doc.agents.push(AgentDefinition::new(
            "Pattern 2",
            "pattern",
            "Log important events",
        ));
        doc.agents.push(AgentDefinition::new(
            "Failure 1",
            "failure_mode",
            "Missing error handling",
        ));

        (content.to_string(), doc)
    }

    #[test]
    fn test_default_enforcer_passes() {
        let enforcer = GateEnforcer::new();
        let (content, doc) = create_test_doc();

        let result = enforcer.enforce(&content, &doc).unwrap();
        assert!(result.passed);
        assert_eq!(result.violations.len(), 0);
    }

    #[test]
    fn test_min_patterns_violation() {
        let enforcer = GateEnforcer::new();
        let mut doc = AgentsDoc::new("test");
        doc.agents
            .push(AgentDefinition::new("Pattern 1", "pattern", "Only one"));

        let content = "# AGENTS\n\n## Patterns\n- Only one\n";
        let result = enforcer.enforce(content, &doc).unwrap();

        // Should have warning about not enough patterns
        let pattern_violations: Vec<_> = result
            .violations
            .iter()
            .filter(|v| v.rule == "min-patterns")
            .collect();
        assert_eq!(pattern_violations.len(), 1);
    }

    #[test]
    fn test_section_exists_check() {
        let enforcer = GateEnforcer::new();
        let doc = AgentsDoc::new("test");
        let content = "# AGENTS\n\nNo sections here\n";

        let result = enforcer.enforce(content, &doc).unwrap();

        // Should have violation for missing patterns section
        assert!(!result.violations.is_empty());
    }

    #[test]
    fn test_custom_rule() {
        let mut enforcer = GateEnforcer::new();

        let custom_rule = RuleBuilder::new("custom-pattern")
            .description("Must contain specific pattern")
            .severity(ViolationSeverity::Error)
            .pattern_exists("CRITICAL");

        enforcer.add_rule(custom_rule);

        let (content, doc) = create_test_doc();
        let result = enforcer.enforce(&content, &doc).unwrap();

        // Should fail because "CRITICAL" is not in content
        assert!(!result.passed);
        let custom_violations: Vec<_> = result
            .violations
            .iter()
            .filter(|v| v.rule == "custom-pattern")
            .collect();
        assert_eq!(custom_violations.len(), 1);
        assert_eq!(custom_violations[0].severity, ViolationSeverity::Error);
    }

    #[test]
    fn test_empty_agents_warning() {
        let enforcer = GateEnforcer::new();
        let doc = AgentsDoc::new("test");
        let content = "";

        let result = enforcer.enforce(content, &doc).unwrap();

        assert!(!result.warnings.is_empty());
        assert!(result.warnings.iter().any(|w| w.contains("empty")));
    }

    #[test]
    fn test_quick_check() {
        let enforcer = GateEnforcer::new();
        let (content, doc) = create_test_doc();

        assert!(enforcer.quick_check(&content, &doc).unwrap());
    }
}
