//! PRD quality validators for ensuring completeness and correctness.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use crate::types::prd::PRD;

// DRY:DATA:IssueSeverity
/// Severity level of a validation issue.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum IssueSeverity {
    /// Critical issue that blocks progress
    Critical,
    /// High priority issue
    High,
    /// Medium priority issue
    Medium,
    /// Low priority issue or suggestion
    Low,
}

// DRY:DATA:ValidationIssue
/// A validation issue found in the PRD.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationIssue {
    /// Issue severity
    pub severity: IssueSeverity,
    /// Issue category
    pub category: String,
    /// Location in PRD (e.g., "P1-T2-S3")
    pub location: String,
    /// Issue description
    pub description: String,
    /// Suggested fix
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

impl ValidationIssue {
    // DRY:FN:new
    /// Creates a new validation issue.
    pub fn new(
        severity: IssueSeverity,
        category: impl Into<String>,
        location: impl Into<String>,
        description: impl Into<String>,
    ) -> Self {
        Self {
            severity,
            category: category.into(),
            location: location.into(),
            description: description.into(),
            suggestion: None,
        }
    }

    // DRY:FN:with_suggestion
    /// Adds a suggestion and returns self for chaining.
    pub fn with_suggestion(mut self, suggestion: impl Into<String>) -> Self {
        self.suggestion = Some(suggestion.into());
        self
    }
}

// DRY:DATA:ValidationResult
/// Result of validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    /// Whether validation passed
    pub passed: bool,
    /// Issues found
    pub issues: Vec<ValidationIssue>,
    /// Total items validated
    pub items_validated: usize,
}

impl ValidationResult {
    // DRY:FN:new
    /// Creates a new validation result.
    pub fn new(passed: bool, issues: Vec<ValidationIssue>, items_validated: usize) -> Self {
        Self {
            passed,
            issues,
            items_validated,
        }
    }

    // DRY:FN:count_by_severity
    /// Counts issues by severity.
    pub fn count_by_severity(&self, severity: IssueSeverity) -> usize {
        self.issues
            .iter()
            .filter(|i| i.severity == severity)
            .count()
    }

    // DRY:FN:critical_issues
    /// Returns critical issues.
    pub fn critical_issues(&self) -> Vec<&ValidationIssue> {
        self.issues
            .iter()
            .filter(|i| i.severity == IssueSeverity::Critical)
            .collect()
    }
}

// DRY:DATA:CoverageValidator
/// Validator for requirements coverage.
pub struct CoverageValidator;

impl CoverageValidator {
    // DRY:FN:validate
    /// Validates that all requirements have corresponding PRD items.
    /// Note: This implementation checks if requirement IDs appear in PRD item titles/descriptions.
    pub fn validate(prd: &PRD, requirement_ids: &[String]) -> ValidationResult {
        let mut issues = Vec::new();
        let mut covered_requirements = HashSet::new();

        // Collect all requirement references from PRD (check titles and descriptions)
        for phase in &prd.phases {
            for req_id in requirement_ids {
                if phase.title.contains(req_id)
                    || phase.goal.as_ref().map_or(false, |g| g.contains(req_id))
                    || phase
                        .description
                        .as_ref()
                        .map_or(false, |d| d.contains(req_id))
                {
                    covered_requirements.insert(req_id.clone());
                }
            }

            for task in &phase.tasks {
                for req_id in requirement_ids {
                    if task.title.contains(req_id)
                        || task
                            .description
                            .as_ref()
                            .map_or(false, |d| d.contains(req_id))
                    {
                        covered_requirements.insert(req_id.clone());
                    }
                }

                for subtask in &task.subtasks {
                    for req_id in requirement_ids {
                        if subtask.title.contains(req_id)
                            || subtask
                                .description
                                .as_ref()
                                .map_or(false, |d| d.contains(req_id))
                            || subtask
                                .acceptance_criteria
                                .iter()
                                .any(|c| c.contains(req_id))
                        {
                            covered_requirements.insert(req_id.clone());
                        }
                    }
                }
            }
        }

        // Check for uncovered requirements
        for req_id in requirement_ids {
            if !covered_requirements.contains(req_id) {
                issues.push(
                    ValidationIssue::new(
                        IssueSeverity::High,
                        "coverage",
                        req_id,
                        format!("Requirement {} has no PRD coverage", req_id),
                    )
                    .with_suggestion("Add a phase, task, or subtask to cover this requirement"),
                );
            }
        }

        let passed = issues.is_empty();
        ValidationResult::new(passed, issues, requirement_ids.len())
    }
}

// DRY:DATA:QualityValidator
/// Validator for PRD item quality.
pub struct QualityValidator;

impl QualityValidator {
    // DRY:FN:validate
    /// Validates that PRD items have acceptance criteria and proper structure.
    pub fn validate(prd: &PRD) -> ValidationResult {
        let mut issues = Vec::new();
        let mut items_validated = 0;

        for phase in &prd.phases {
            items_validated += 1;

            // Check phase has description
            if phase
                .description
                .as_ref()
                .map_or(true, |d| d.trim().is_empty())
            {
                issues.push(ValidationIssue::new(
                    IssueSeverity::Medium,
                    "quality",
                    &phase.id,
                    format!("Phase {} has empty description", phase.id),
                ));
            }

            // Check phase has tasks
            if phase.tasks.is_empty() {
                issues.push(ValidationIssue::new(
                    IssueSeverity::High,
                    "quality",
                    &phase.id,
                    format!("Phase {} has no tasks", phase.id),
                ));
            }

            for task in &phase.tasks {
                items_validated += 1;

                // Check task has description
                if task
                    .description
                    .as_ref()
                    .map_or(true, |d| d.trim().is_empty())
                {
                    issues.push(ValidationIssue::new(
                        IssueSeverity::Medium,
                        "quality",
                        &task.id,
                        format!("Task {} has empty description", task.id),
                    ));
                }

                // Check task has subtasks
                if task.subtasks.is_empty() {
                    issues.push(ValidationIssue::new(
                        IssueSeverity::Medium,
                        "quality",
                        &task.id,
                        format!("Task {} has no subtasks", task.id),
                    ));
                }

                for subtask in &task.subtasks {
                    items_validated += 1;

                    // Check subtask has description
                    if subtask
                        .description
                        .as_ref()
                        .map_or(true, |d| d.trim().is_empty())
                    {
                        issues.push(ValidationIssue::new(
                            IssueSeverity::Medium,
                            "quality",
                            &subtask.id,
                            format!("Subtask {} has empty description", subtask.id),
                        ));
                    }

                    // Check subtask has acceptance criteria
                    if subtask.acceptance_criteria.is_empty() {
                        issues.push(
                            ValidationIssue::new(
                                IssueSeverity::High,
                                "quality",
                                &subtask.id,
                                format!("Subtask {} has no acceptance criteria", subtask.id),
                            )
                            .with_suggestion("Add testable acceptance criteria"),
                        );
                    } else {
                        // Best-effort parity: flag overly-generic acceptance criteria.
                        for criterion in &subtask.acceptance_criteria {
                            if Self::is_generic_criterion(criterion) {
                                issues.push(
                                    ValidationIssue::new(
                                        IssueSeverity::Medium,
                                        "quality",
                                        &subtask.id,
                                        format!(
                                            "Subtask {} has generic acceptance criterion: {}",
                                            subtask.id, criterion
                                        ),
                                    )
                                    .with_suggestion(
                                        "Replace with specific, machine-verifiable criteria",
                                    ),
                                );
                            }
                        }
                    }
                }
            }
        }

        let passed = !issues
            .iter()
            .any(|i| matches!(i.severity, IssueSeverity::High | IssueSeverity::Critical));
        ValidationResult::new(passed, issues, items_validated)
    }

    fn is_generic_criterion(text: &str) -> bool {
        let t = text.trim().to_lowercase();
        if t.is_empty() {
            return true;
        }

        // Mirrors common filler patterns from TS validator (best-effort).
        let exact = [
            "implementation complete",
            "code complete",
            "feature implemented",
            "works as expected",
            "functionality verified",
            "tests pass",
            "no errors",
            "all requirements met",
            "done",
            "complete",
            "delivered",
            "implemented",
            "verified",
            "working",
            "functional",
        ];

        if exact.iter().any(|p| t == *p) {
            return true;
        }

        let contains = [
            "implementation is complete",
            "code is complete",
            "feature is implemented",
            "all tests pass",
            "no errors occur",
            "requirements are met",
            "everything works",
            "system is functional",
        ];

        contains.iter().any(|p| t.contains(p))
    }
}

// DRY:DATA:AiGapValidator
/// AI gap validator - uses a platform CLI to detect semantic gaps between the source
/// requirements and the PRD.
///
/// This validator is intentionally best-effort and defaults to disabled to avoid
/// forcing AI tool execution in environments without configured CLIs.
pub struct AiGapValidator {
    config: AiGapValidatorConfig,
}

// DRY:DATA:AiGapValidatorConfig
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiGapValidatorConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_ai_platform")]
    pub platform: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[serde(default = "default_ai_timeout_seconds")]
    pub timeout_seconds: u64,
    #[serde(default)]
    pub block_on_critical: bool,
    #[serde(default = "default_max_high_gaps")]
    pub max_high_gaps: usize,
}

fn default_ai_platform() -> String {
    "cursor".to_string()
}

fn default_ai_timeout_seconds() -> u64 {
    120
}

fn default_max_high_gaps() -> usize {
    0
}

impl Default for AiGapValidatorConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            platform: default_ai_platform(),
            model: None,
            timeout_seconds: default_ai_timeout_seconds(),
            block_on_critical: true,
            max_high_gaps: default_max_high_gaps(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AiGapReport {
    #[serde(default)]
    gaps: Vec<AiGap>,
    #[serde(default)]
    _confidence: Option<f64>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AiGap {
    #[serde(default)]
    severity: Option<String>,
    #[serde(default)]
    requirement_id: Option<String>,
    description: String,
    #[serde(default)]
    suggested_fix: Option<String>,
    #[serde(default)]
    location: Option<String>,
}

impl AiGapValidator {
    // DRY:FN:new
    pub fn new(config: AiGapValidatorConfig) -> Self {
        Self { config }
    }

    // DRY:FN:validate
    pub async fn validate(&self, prd: &PRD, requirements_text: &str) -> ValidationResult {
        if !self.config.enabled {
            return ValidationResult::new(true, Vec::new(), 0);
        }

        let prompt = build_gap_prompt(prd, requirements_text);

        match self.execute_platform_cli(&prompt).await {
            Ok(response_text) => match parse_gap_report(&response_text) {
                Ok(report) => self.evaluate_report(report),
                Err(parse_err) => ValidationResult::new(
                    true,
                    vec![ValidationIssue::new(
                        IssueSeverity::Low,
                        "ai_gap",
                        "ai",
                        format!("AI gap response parse failed (graceful degradation): {parse_err}"),
                    )],
                    0,
                ),
            },
            Err(exec_err) => ValidationResult::new(
                true,
                vec![ValidationIssue::new(
                    IssueSeverity::Low,
                    "ai_gap",
                    "ai",
                    format!("AI gap detection failed (graceful degradation): {exec_err}"),
                )],
                0,
            ),
        }
    }

    fn evaluate_report(&self, report: AiGapReport) -> ValidationResult {
        let mut issues = Vec::new();

        let mut critical_count = 0usize;
        let mut high_count = 0usize;

        for gap in report.gaps {
            let sev = gap.severity.as_deref().unwrap_or("medium").to_lowercase();

            let severity = match sev.as_str() {
                "critical" => {
                    critical_count += 1;
                    IssueSeverity::Critical
                }
                "high" => {
                    high_count += 1;
                    IssueSeverity::High
                }
                "low" => IssueSeverity::Low,
                _ => IssueSeverity::Medium,
            };

            let location = gap
                .location
                .clone()
                .or(gap.requirement_id.clone())
                .unwrap_or_else(|| "ai".to_string());

            let mut issue = ValidationIssue::new(severity, "ai_gap", location, gap.description);
            if let Some(s) = gap.suggested_fix {
                issue = issue.with_suggestion(s);
            }
            issues.push(issue);
        }

        let mut passed = true;
        if self.config.block_on_critical && critical_count > 0 {
            passed = false;
        }
        if high_count > self.config.max_high_gaps {
            passed = false;
        }

        ValidationResult::new(passed, issues, 0)
    }

    async fn execute_platform_cli(&self, prompt: &str) -> Result<String, String> {
        use crate::types::Platform;
        use std::process::Stdio;
        use std::str::FromStr;
        use std::time::Duration;
        use tokio::process::Command;

        let platform = Platform::from_str(&self.config.platform)
            .map_err(|e| format!("Unknown platform: {e}"))?;

        let working_dir = std::env::current_dir().map_err(|e| e.to_string())?;
        let (command, args) =
            build_platform_command(platform, prompt, &working_dir, self.config.model.as_deref());

        let mut cmd = Command::new(&command);
        cmd.args(&args)
            .current_dir(&working_dir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        let timeout = Duration::from_secs(self.config.timeout_seconds);

        let output = match tokio::time::timeout(timeout, cmd.output()).await {
            Ok(Ok(output)) => output,
            Ok(Err(e)) => return Err(e.to_string()),
            Err(_) => {
                return Err(format!(
                    "{} CLI execution timed out after {}s",
                    platform, self.config.timeout_seconds
                ));
            }
        };

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!(
                "{} CLI failed: {} ({})",
                platform,
                output.status,
                stderr.trim()
            ));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

fn build_gap_prompt(prd: &PRD, requirements_text: &str) -> String {
    let prd_summary = summarize_prd(prd);

    // Keep prompts bounded.
    let req_excerpt = truncate(requirements_text, 16000);

    format!(
        "You are a requirements coverage auditor. Compare SOURCE REQUIREMENTS to the PRD SUMMARY and identify any requirements that are missing or insufficiently covered.\n\nReturn ONLY valid JSON with this schema:\n{{\n  \"confidence\": 0.0,\n  \"gaps\": [\n    {{\n      \"severity\": \"critical|high|medium|low\",\n      \"requirementId\": \"REQ-123\" | null,\n      \"location\": \"optional location string\" | null,\n      \"description\": \"what is missing\",\n      \"suggestedFix\": \"how to fix\" | null\n    }}\n  ]\n}}\n\nSOURCE REQUIREMENTS:\n{req_excerpt}\n\nPRD SUMMARY:\n{prd_summary}\n",
    )
}

fn summarize_prd(prd: &PRD) -> String {
    let mut out = String::new();
    out.push_str(&format!("Project: {}\n", prd.metadata.name));
    out.push_str(&format!("Phases: {}\n\n", prd.phases.len()));

    for phase in &prd.phases {
        out.push_str(&format!("{}: {}\n", phase.id, phase.title));
        for task in &phase.tasks {
            out.push_str(&format!("  {}: {}\n", task.id, task.title));
            for subtask in &task.subtasks {
                out.push_str(&format!(
                    "    {}: {} (AC: {})\n",
                    subtask.id,
                    subtask.title,
                    subtask.acceptance_criteria.len()
                ));
            }
        }
        out.push('\n');
    }

    out
}

fn truncate(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        return text.to_string();
    }
    text.chars().take(max_chars).collect::<String>() + "\n...[truncated]"
}

fn parse_gap_report(response_text: &str) -> Result<AiGapReport, String> {
    // Prefer strict JSON parse, then fall back to substring extraction.
    if let Ok(report) = serde_json::from_str::<AiGapReport>(response_text) {
        return Ok(report);
    }

    let start = response_text.find('{').ok_or("No JSON object found")?;
    let end = response_text.rfind('}').ok_or("No JSON object found")?;
    if end <= start {
        return Err("Invalid JSON object bounds".to_string());
    }

    let candidate = &response_text[start..=end];
    serde_json::from_str::<AiGapReport>(candidate).map_err(|e| e.to_string())
}

fn build_platform_command(
    platform: crate::types::Platform,
    prompt: &str,
    working_dir: &std::path::Path,
    model: Option<&str>,
) -> (String, Vec<String>) {
    let spec = crate::platforms::platform_specs::get_spec(platform);
    let mut args: Vec<String> = Vec::new();
    let command = platform.resolve_cli_command();

    if let Some(subcommand) = spec.headless.subcommand {
        args.push(subcommand.to_string());
    }
    if !spec.headless.prompt_flag.is_empty() {
        args.push(spec.headless.prompt_flag.to_string());
    }
    args.push(prompt.to_string());

    match platform {
        crate::types::Platform::Cursor => {
            if let Some(model) = model {
                args.push("--model".to_string());
                args.push(model.to_string());
            }
            push_json_output_args(&mut args, platform);
        }
        crate::types::Platform::Codex => {
            args.push("--full-auto".to_string());
            push_json_output_args(&mut args, platform);
            if let Some(model) = model {
                args.push("--model".to_string());
                args.push(model.to_string());
            }
            args.push("--color".to_string());
            args.push("never".to_string());
            if let Some(flag) = spec.working_dir_flag {
                args.push(flag.to_string());
                args.push(working_dir.display().to_string());
            }
        }
        crate::types::Platform::Claude => {
            if let Some(model) = model {
                args.push("--model".to_string());
                args.push(model.to_string());
            }
            push_json_output_args(&mut args, platform);
            args.push("--no-session-persistence".to_string());
            args.push("--permission-mode".to_string());
            args.push("bypassPermissions".to_string());
        }
        crate::types::Platform::Gemini => {
            push_json_output_args(&mut args, platform);
            args.push("--approval-mode".to_string());
            args.push("yolo".to_string());
            if let Some(model) = model {
                args.push("--model".to_string());
                args.push(model.to_string());
            }
        }
        crate::types::Platform::Copilot => {
            args.push("--allow-all-tools".to_string());
            args.push("--stream".to_string());
            args.push("off".to_string());
            args.push("--allow-all-paths".to_string());
            args.push("--allow-all-urls".to_string());
        }
    }

    (command, args)
}

fn push_json_output_args(args: &mut Vec<String>, platform: crate::types::Platform) {
    let spec = crate::platforms::platform_specs::get_spec(platform);
    let flag = spec.headless.output_format_flag;
    if flag.is_empty() || !spec.headless.output_formats.contains(&"json") {
        return;
    }
    args.push(flag.to_string());
    if flag != "--json" {
        args.push("json".to_string());
    }
}

// DRY:DATA:NoManualValidator
/// Validator to ensure no manual verification steps.
pub struct NoManualValidator;

impl NoManualValidator {
    // DRY:FN:validate
    /// Validates that all acceptance criteria are automatable.
    pub fn validate(prd: &PRD) -> ValidationResult {
        let mut issues = Vec::new();
        let mut items_validated = 0;

        let manual_keywords = [
            "manual",
            "manually",
            "visual inspection",
            "visually",
            "human review",
            "by hand",
        ];

        // Only subtasks have acceptance_criteria in this schema
        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    for criterion in &subtask.acceptance_criteria {
                        items_validated += 1;
                        if Self::contains_manual_step(criterion, &manual_keywords) {
                            issues.push(
                                ValidationIssue::new(
                                    IssueSeverity::Low,
                                    "automation",
                                    &subtask.id,
                                    format!(
                                        "Subtask {} has manual acceptance criterion: {}",
                                        subtask.id, criterion
                                    ),
                                )
                                .with_suggestion("Convert to automated verification"),
                            );
                        }
                    }
                }
            }
        }

        let passed = issues.is_empty();
        ValidationResult::new(passed, issues, items_validated)
    }

    fn contains_manual_step(text: &str, keywords: &[&str]) -> bool {
        let lowercase = text.to_lowercase();
        keywords.iter().any(|keyword| lowercase.contains(keyword))
    }
}

// DRY:DATA:CompositeValidator
/// Combined validator that runs all validators.
pub struct CompositeValidator;

impl CompositeValidator {
    // DRY:FN:validate
    /// Runs all synchronous validators and combines results.
    pub fn validate(prd: &PRD, requirement_ids: &[String]) -> ValidationResult {
        let coverage_result = CoverageValidator::validate(prd, requirement_ids);
        let quality_result = QualityValidator::validate(prd);
        let no_manual_result = NoManualValidator::validate(prd);

        let mut all_issues = Vec::new();
        all_issues.extend(coverage_result.issues);
        all_issues.extend(quality_result.issues);
        all_issues.extend(no_manual_result.issues);

        let passed = coverage_result.passed && quality_result.passed && no_manual_result.passed;
        let total_items = coverage_result.items_validated
            + quality_result.items_validated
            + no_manual_result.items_validated;

        ValidationResult::new(passed, all_issues, total_items)
    }

    // DRY:FN:validate_with_ai
    /// Runs all validators including optional AI gap detection.
    pub async fn validate_with_ai(
        prd: &PRD,
        requirement_ids: &[String],
        requirements_text: &str,
        ai_config: AiGapValidatorConfig,
    ) -> ValidationResult {
        let base = Self::validate(prd, requirement_ids);
        let ai_result = AiGapValidator::new(ai_config)
            .validate(prd, requirements_text)
            .await;

        let mut all_issues = base.issues;
        all_issues.extend(ai_result.issues);

        let passed = base.passed && ai_result.passed;
        ValidationResult::new(
            passed,
            all_issues,
            base.items_validated + ai_result.items_validated,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::prd::{ItemStatus, PRDMetadata, Phase, Task};

    fn create_test_prd() -> PRD {
        use crate::types::prd::Subtask;

        PRD {
            metadata: PRDMetadata {
                name: "Test".to_string(),
                description: None,
                version: "1.0".to_string(),
                total_tasks: 1,
                total_subtasks: 0,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: Some(chrono::Utc::now()),
                updated_at: Some(chrono::Utc::now()),
            },
            phases: vec![Phase {
                id: "P1".to_string(),
                title: "Phase 1".to_string(),
                goal: None,
                description: Some("Test phase".to_string()),
                tasks: vec![Task {
                    id: "P1-T1".to_string(),
                    title: "Task 1 REQ-001".to_string(),
                    description: Some("Test task".to_string()),
                    subtasks: vec![Subtask {
                        id: "P1-T1-S1".to_string(),
                        task_id: "P1-T1".to_string(),
                        title: "Subtask 1".to_string(),
                        description: Some("Test subtask".to_string()),
                        criterion: None,
                        status: ItemStatus::Pending,
                        iterations: 0,
                        evidence: Vec::new(),
                        plan: None,
                        acceptance_criteria: vec!["Criterion 1".to_string()],
                        iteration_records: Vec::new(),
                    }],
                    status: ItemStatus::Pending,
                    dependencies: Vec::new(),
                    complexity: None,
                    task_type: None,
                    evidence: Vec::new(),
                    gate_reports: Vec::new(),
                }],
                status: ItemStatus::Pending,
                iterations: 0,
                evidence: Vec::new(),
                gate_report: None,
                orchestrator_state: None,
                orchestrator_context: None,
                dependencies: Vec::new(),
            }],
        }
    }

    #[test]
    fn test_validation_issue_creation() {
        let issue = ValidationIssue::new(IssueSeverity::High, "test", "P1-T1", "Test issue")
            .with_suggestion("Fix it");

        assert_eq!(issue.severity, IssueSeverity::High);
        assert_eq!(issue.category, "test");
        assert!(issue.suggestion.is_some());
    }

    #[test]
    fn test_coverage_validator() {
        let prd = create_test_prd();
        let requirement_ids = vec!["REQ-001".to_string(), "REQ-002".to_string()];

        let result = CoverageValidator::validate(&prd, &requirement_ids);

        // REQ-002 should be uncovered
        assert!(!result.passed);
        assert_eq!(result.issues.len(), 1);
        assert!(result.issues[0].description.contains("REQ-002"));
    }

    #[test]
    fn test_quality_validator() {
        let mut prd = create_test_prd();
        // Remove subtasks to test validation
        prd.phases[0].tasks[0].subtasks.clear();

        let result = QualityValidator::validate(&prd);

        // Should find that task has no subtasks
        assert!(!result.issues.is_empty());
        let has_subtask_issue = result
            .issues
            .iter()
            .any(|i| i.description.contains("no subtasks"));
        assert!(has_subtask_issue);
    }

    #[test]
    fn test_no_manual_validator() {
        let mut prd = create_test_prd();
        prd.phases[0].tasks[0].subtasks[0]
            .acceptance_criteria
            .push("Manually verify the output".to_string());

        let result = NoManualValidator::validate(&prd);

        assert!(!result.passed);
        assert_eq!(result.issues.len(), 1);
        assert_eq!(result.issues[0].category, "automation");
    }

    #[test]
    fn test_composite_validator() {
        let prd = create_test_prd();
        let requirement_ids = vec!["REQ-001".to_string()];

        let result = CompositeValidator::validate(&prd, &requirement_ids);

        // The test PRD has all required fields populated and REQ-001 is covered,
        // so no quality or coverage issues should be found
        assert!(result.passed);
        assert!(result.issues.is_empty());
    }

    #[test]
    fn test_composite_validator_aggregates_and_fails() {
        let prd = create_test_prd();
        let requirement_ids = vec!["REQ-999".to_string()];

        let result = CompositeValidator::validate(&prd, &requirement_ids);

        assert!(!result.passed);
        assert!(result.issues.iter().any(|i| i.category == "coverage"));
    }

    #[test]
    fn test_validation_result_severity_counts() {
        let issues = vec![
            ValidationIssue::new(IssueSeverity::Critical, "test", "P1", "Issue 1"),
            ValidationIssue::new(IssueSeverity::High, "test", "P2", "Issue 2"),
            ValidationIssue::new(IssueSeverity::High, "test", "P3", "Issue 3"),
        ];

        let result = ValidationResult::new(false, issues, 10);

        assert_eq!(result.count_by_severity(IssueSeverity::Critical), 1);
        assert_eq!(result.count_by_severity(IssueSeverity::High), 2);
        assert_eq!(result.critical_issues().len(), 1);
    }
}
