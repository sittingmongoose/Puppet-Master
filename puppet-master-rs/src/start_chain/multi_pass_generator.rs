//! Multi-pass PRD generation for quality improvement.

use serde::{Deserialize, Serialize};

use crate::platforms::{PlatformRunner, UsageEvent, UsageTracker};
use crate::start_chain::PromptTemplates;
use crate::types::prd::PRD;
use crate::types::{ExecutionRequest, ParsedRequirements};
use anyhow::{Result as AnyhowResult, anyhow};
use chrono::Utc;
use std::path::Path;
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Configuration for multi-pass generation.
#[derive(Debug, Clone)]
pub struct MultiPassConfig {
    /// Number of passes to perform
    pub pass_count: usize,
    /// Enable gap filling in pass 2
    pub enable_gap_filling: bool,
    /// Enable validation in final pass
    pub enable_validation: bool,
    /// Minimum coverage threshold (0.0-1.0)
    pub min_coverage: f32,
}

impl Default for MultiPassConfig {
    fn default() -> Self {
        Self {
            pass_count: 3,
            enable_gap_filling: true,
            enable_validation: true,
            min_coverage: 0.85,
        }
    }
}

/// Result of a generation pass.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PassResult {
    /// Pass number (1-indexed)
    pub pass_number: usize,
    /// Pass description
    pub description: String,
    /// Number of items added in this pass
    pub items_added: usize,
    /// Number of items refined
    pub items_refined: usize,
    /// Gaps identified
    pub gaps_found: Vec<String>,
    /// Coverage achieved (0.0-1.0)
    pub coverage: f32,
    /// Issues found
    pub issues: Vec<String>,
}

impl PassResult {
    /// Creates a new pass result.
    pub fn new(pass_number: usize, description: impl Into<String>) -> Self {
        Self {
            pass_number,
            description: description.into(),
            items_added: 0,
            items_refined: 0,
            gaps_found: Vec::new(),
            coverage: 0.0,
            issues: Vec::new(),
        }
    }
}

/// Multi-pass PRD generator.
pub struct MultiPassGenerator {
    config: MultiPassConfig,
    pass_results: Vec<PassResult>,
}

impl MultiPassGenerator {
    /// Creates a new multi-pass generator with default configuration.
    pub fn new() -> Self {
        Self {
            config: MultiPassConfig::default(),
            pass_results: Vec::new(),
        }
    }

    /// Creates a new multi-pass generator with custom configuration.
    pub fn with_config(config: MultiPassConfig) -> Self {
        Self {
            config,
            pass_results: Vec::new(),
        }
    }

    /// Runs all generation passes using AI, producing an improved PRD.
    pub async fn generate_with_ai(
        &mut self,
        requirements: &ParsedRequirements,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        working_directory: &Path,
        usage_tracker: Option<&UsageTracker>,
    ) -> AnyhowResult<PRD> {
        self.pass_results.clear();

        let mut current_prd: Option<PRD> = None;

        for pass_num in 1..=self.config.pass_count {
            let prev = current_prd.as_ref();
            let (prd, pass_result) = self
                .run_ai_pass(
                    pass_num,
                    requirements,
                    prev,
                    Arc::clone(&runner),
                    model,
                    working_directory,
                    usage_tracker,
                )
                .await?;
            self.pass_results.push(pass_result);
            current_prd = Some(prd);
        }

        let mut prd =
            current_prd.ok_or_else(|| anyhow!("multi-pass generation produced no PRD"))?;
        if prd.metadata.name.is_empty() {
            prd.metadata.name = requirements.project_name.clone();
        }
        if prd.metadata.created_at.is_none() {
            prd.metadata.created_at = Some(Utc::now());
        }
        prd.metadata.updated_at = Some(Utc::now());
        prd.update_metadata();
        Ok(prd)
    }

    async fn run_ai_pass(
        &self,
        pass_num: usize,
        requirements: &ParsedRequirements,
        previous_prd: Option<&PRD>,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        working_directory: &Path,
        usage_tracker: Option<&UsageTracker>,
    ) -> AnyhowResult<(PRD, PassResult)> {
        let description = match pass_num {
            1 => "Initial generation",
            2 => "Gap analysis + filling",
            3 => "Quality validation",
            _ => "Refinement",
        };
        let mut pass_result = PassResult::new(pass_num, description);

        let prompt = match pass_num {
            1 => {
                let template = PromptTemplates::prd_generation();

                let mut vars = std::collections::HashMap::new();
                vars.insert(
                    "project_name".to_string(),
                    requirements.project_name.clone(),
                );
                vars.insert(
                    "project_description".to_string(),
                    requirements
                        .description
                        .clone()
                        .unwrap_or_else(|| "(no description provided)".to_string()),
                );
                vars.insert(
                    "requirements".to_string(),
                    Self::format_requirements_for_prompt(requirements),
                );

                let (system_prompt, user_prompt) =
                    template.render_full(&vars).map_err(|e| anyhow!(e))?;

                let mut prompt = String::new();
                if let Some(system) = system_prompt {
                    prompt.push_str(&system);
                    prompt.push_str("\n\n");
                }
                prompt.push_str(&user_prompt);
                prompt.push_str(
                    "\n\nReturn ONLY a single JSON object matching this Rust PRD schema with camelCase fields: {metadata:{name,description?,version?,createdAt?,updatedAt?},phases:[{id,title,goal?,description?,tasks:[{id,title,description?,subtasks:[{id,taskId,title,description?,acceptanceCriteria:[]}]}]}]}. Do not include markdown fences or any extra text.",
                );
                prompt
            }
            2 => {
                let prev = previous_prd.ok_or_else(|| anyhow!("pass 2 requires previous PRD"))?;
                format!(
                    r#"You are improving an existing PRD.

REQUIREMENTS:
{requirements}

CURRENT_PRD_JSON:
{prd}

TASK:
1) Identify missing requirements coverage, missing subtasks, missing acceptanceCriteria.
2) Update the PRD to close gaps. Add phases/tasks/subtasks as needed.
3) Ensure every subtask has at least 2 acceptanceCriteria entries.

Return ONLY the updated PRD as a single JSON object (camelCase), no markdown fences."#,
                    requirements = Self::format_requirements_for_prompt(requirements),
                    prd = serde_json::to_string_pretty(prev).unwrap_or_else(|_| "{}".to_string())
                )
            }
            _ => {
                let prev =
                    previous_prd.ok_or_else(|| anyhow!("validation requires previous PRD"))?;
                format!(
                    r#"You are validating a PRD for quality and completeness.

REQUIREMENTS:
{requirements}

CURRENT_PRD_JSON:
{prd}

TASK:
- Ensure IDs are stable and consistent.
- Ensure descriptions are non-empty where appropriate.
- Ensure every subtask has acceptanceCriteria and is testable.
- Fix any obvious structure issues.

Return ONLY the final PRD as a single JSON object (camelCase), no markdown fences."#,
                    requirements = Self::format_requirements_for_prompt(requirements),
                    prd = serde_json::to_string_pretty(prev).unwrap_or_else(|_| "{}".to_string())
                )
            }
        };

        let prd = self
            .execute_prd_prompt(
                Arc::clone(&runner),
                model,
                prompt,
                working_directory,
                usage_tracker,
            )
            .await?;

        // Fill pass result metrics (best-effort)
        let new_count = Self::count_prd_items(&prd);
        let old_count = previous_prd.map(Self::count_prd_items).unwrap_or(0);
        pass_result.items_added = new_count.saturating_sub(old_count);
        pass_result.coverage = self.calculate_coverage(&prd);
        pass_result.gaps_found = self.find_structural_gaps(&prd);
        if pass_num >= 3 {
            pass_result.issues = self.validate_prd(&prd);
        }

        Ok((prd, pass_result))
    }

    async fn execute_prd_prompt(
        &self,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        prompt: String,
        working_directory: &Path,
        usage_tracker: Option<&UsageTracker>,
    ) -> AnyhowResult<PRD> {
        let request = ExecutionRequest::new(
            runner.platform(),
            model.to_string(),
            prompt,
            working_directory.to_path_buf(),
        )
        .with_timeout(Duration::from_millis(300_000))
        .with_plan_mode(true);

        let start = Instant::now();
        let exec = runner.execute(&request).await?;
        let duration_ms = exec
            .duration_ms
            .unwrap_or_else(|| start.elapsed().as_millis() as u64);

        let mut event = UsageEvent::new(runner.platform())
            .with_model(model.to_string())
            .with_duration(duration_ms)
            .with_success(exec.success);
        if let Some(tokens) = exec.tokens_used {
            event = event.with_tokens(0, tokens);
        }
        if !exec.success {
            event = event.with_error(
                exec.error_message
                    .clone()
                    .unwrap_or_else(|| "AI PRD generation failed".to_string()),
            );
        }
        if let Some(tracker) = usage_tracker {
            let _ = tracker.track(event).await;
        } else if let Ok(tracker) = UsageTracker::default_location() {
            let _ = tracker.track(event).await;
        }

        if !exec.success {
            return Err(anyhow!(
                "AI PRD generation unsuccessful: {}",
                exec.error_message
                    .unwrap_or_else(|| "unknown error".to_string())
            ));
        }

        let raw_output = exec
            .output
            .ok_or_else(|| anyhow!("AI PRD generation produced no output"))?;
        let response_text = Self::extract_platform_response_text(&raw_output);
        let json_value = Self::try_parse_json_value(&response_text)
            .ok_or_else(|| anyhow!("Failed to parse AI PRD output as JSON"))?;

        let mut json_value = json_value;
        if let Some(prd_val) = json_value.get("prd").cloned() {
            json_value = prd_val;
        } else if let Some(prd_val) = json_value.get("data").cloned() {
            json_value = prd_val;
        }

        let mut prd: PRD = serde_json::from_value(json_value)
            .map_err(|e| anyhow!("Failed to deserialize PRD JSON: {e}"))?;

        if prd.metadata.created_at.is_none() {
            prd.metadata.created_at = Some(Utc::now());
        }
        prd.metadata.updated_at = Some(Utc::now());
        prd.update_metadata();

        Ok(prd)
    }

    fn extract_platform_response_text(raw_output: &str) -> String {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(raw_output) {
            if let Some(text) = Self::extract_text_from_json(&json) {
                return text;
            }
        }

        if let (Some(start), Some(end)) = (raw_output.find('{'), raw_output.rfind('}')) {
            if start < end {
                if let Ok(json) =
                    serde_json::from_str::<serde_json::Value>(&raw_output[start..=end])
                {
                    if let Some(text) = Self::extract_text_from_json(&json) {
                        return text;
                    }
                }
            }
        }

        raw_output.to_string()
    }

    fn extract_text_from_json(json: &serde_json::Value) -> Option<String> {
        if let Some(s) = json.as_str() {
            return Some(s.to_string());
        }
        let obj = json.as_object()?;

        for key in ["response", "output", "message", "content", "text"] {
            if let Some(s) = obj.get(key).and_then(|v| v.as_str()) {
                return Some(s.to_string());
            }
        }

        if let Some(result) = obj.get("result") {
            if let Some(s) = result.get("finalResponse").and_then(|v| v.as_str()) {
                return Some(s.to_string());
            }
            if let Some(s) = result.get("response").and_then(|v| v.as_str()) {
                return Some(s.to_string());
            }
            if let Some(s) = result.get("output").and_then(|v| v.as_str()) {
                return Some(s.to_string());
            }
        }

        None
    }

    fn try_parse_json_value(text: &str) -> Option<serde_json::Value> {
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(text) {
            return Some(v);
        }

        if let (Some(start), Some(end)) = (text.find('{'), text.rfind('}')) {
            if start < end {
                return serde_json::from_str::<serde_json::Value>(&text[start..=end]).ok();
            }
        }

        None
    }

    fn format_requirements_for_prompt(requirements: &ParsedRequirements) -> String {
        let mut out = String::new();
        for section in &requirements.sections {
            out.push_str(&format!("## {}\n{}\n\n", section.title, section.content));
        }
        if out.trim().is_empty() {
            out = requirements
                .description
                .clone()
                .unwrap_or_else(|| "(no requirements sections provided)".to_string());
        }
        out
    }

    fn count_prd_items(prd: &PRD) -> usize {
        let phase_count = prd.phases.len();
        let task_count: usize = prd.phases.iter().map(|p| p.tasks.len()).sum();
        let subtask_count: usize = prd
            .phases
            .iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.subtasks.len())
            .sum();
        phase_count + task_count + subtask_count
    }

    /// Runs all generation passes on the PRD.
    pub fn generate(&mut self, initial_prd: &PRD) -> Result<PRD, String> {
        let mut current_prd = initial_prd.clone();

        for pass_num in 1..=self.config.pass_count {
            let pass_result = self.run_pass(pass_num, &mut current_prd)?;
            self.pass_results.push(pass_result);
        }

        Ok(current_prd)
    }

    /// Runs a single pass.
    fn run_pass(&self, pass_num: usize, prd: &mut PRD) -> Result<PassResult, String> {
        match pass_num {
            1 => self.run_pass_1_initial(prd),
            2 => self.run_pass_2_gap_filling(prd),
            3 => self.run_pass_3_validation(prd),
            _ => self.run_pass_refinement(pass_num, prd),
        }
    }

    /// Pass 1: Initial generation and structural analysis.
    fn run_pass_1_initial(&self, prd: &mut PRD) -> Result<PassResult, String> {
        let mut result = PassResult::new(1, "Initial generation");

        // Count existing items
        let phase_count = prd.phases.len();
        let task_count: usize = prd.phases.iter().map(|p| p.tasks.len()).sum();
        let subtask_count: usize = prd
            .phases
            .iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.subtasks.len())
            .sum();

        result.items_added = phase_count + task_count + subtask_count;

        // Calculate initial coverage
        result.coverage = self.calculate_coverage(prd);

        // Identify structural gaps
        result.gaps_found = self.find_structural_gaps(prd);

        Ok(result)
    }

    /// Pass 2: Gap filling and enhancement.
    fn run_pass_2_gap_filling(&self, prd: &mut PRD) -> Result<PassResult, String> {
        let mut result = PassResult::new(2, "Gap filling");

        if !self.config.enable_gap_filling {
            return Ok(result);
        }

        // Find items without acceptance criteria  (only subtasks have acceptance_criteria in this schema)
        let mut items_refined = 0;
        for phase in &mut prd.phases {
            for task in &mut phase.tasks {
                for subtask in &mut task.subtasks {
                    if subtask.acceptance_criteria.is_empty() {
                        result
                            .gaps_found
                            .push(format!("Subtask {} lacks acceptance criteria", subtask.id));
                    }
                }

                items_refined += 1;
            }
        }

        result.items_refined = items_refined;
        result.coverage = self.calculate_coverage(prd);

        Ok(result)
    }

    /// Pass 3: Final validation and quality checks.
    fn run_pass_3_validation(&self, prd: &mut PRD) -> Result<PassResult, String> {
        let mut result = PassResult::new(3, "Validation");

        if !self.config.enable_validation {
            return Ok(result);
        }

        // Run validation checks
        result.issues = self.validate_prd(prd);
        result.coverage = self.calculate_coverage(prd);

        // Check if minimum coverage is met
        if result.coverage < self.config.min_coverage {
            result.issues.push(format!(
                "Coverage {:.1}% below minimum {:.1}%",
                result.coverage * 100.0,
                self.config.min_coverage * 100.0
            ));
        }

        Ok(result)
    }

    /// Additional refinement pass.
    fn run_pass_refinement(&self, pass_num: usize, prd: &mut PRD) -> Result<PassResult, String> {
        let mut result = PassResult::new(pass_num, format!("Refinement {}", pass_num - 3));
        result.coverage = self.calculate_coverage(prd);
        Ok(result)
    }

    /// Calculates coverage metrics for the PRD.
    fn calculate_coverage(&self, prd: &PRD) -> f32 {
        let mut total_items = 0;
        let mut items_with_criteria = 0;

        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    total_items += 1;
                    if !subtask.acceptance_criteria.is_empty() {
                        items_with_criteria += 1;
                    }
                }
            }
        }

        if total_items == 0 {
            return 0.0;
        }

        items_with_criteria as f32 / total_items as f32
    }

    /// Finds structural gaps in the PRD.
    fn find_structural_gaps(&self, prd: &PRD) -> Vec<String> {
        let mut gaps = Vec::new();

        if prd.phases.is_empty() {
            gaps.push("No phases defined".to_string());
            return gaps;
        }

        for phase in &prd.phases {
            if phase.tasks.is_empty() {
                gaps.push(format!("Phase {} has no tasks", phase.id));
            }

            for task in &phase.tasks {
                if task.subtasks.is_empty() {
                    gaps.push(format!("Task {} has no subtasks", task.id));
                }
            }
        }

        gaps
    }

    /// Validates PRD quality.
    fn validate_prd(&self, prd: &PRD) -> Vec<String> {
        let mut issues = Vec::new();

        // Check metadata
        if prd.metadata.name.is_empty() {
            issues.push("PRD metadata missing project name".to_string());
        }

        // Check for empty descriptions
        for phase in &prd.phases {
            if phase.description.as_ref().map_or(true, |d| d.is_empty()) {
                issues.push(format!("Phase {} has empty description", phase.id));
            }

            for task in &phase.tasks {
                if task.description.as_ref().map_or(true, |d| d.is_empty()) {
                    issues.push(format!("Task {} has empty description", task.id));
                }
            }
        }

        issues
    }

    /// Returns the results from all passes.
    pub fn pass_results(&self) -> &[PassResult] {
        &self.pass_results
    }

    /// Returns a summary of the generation process.
    pub fn summary(&self) -> GenerationSummary {
        GenerationSummary {
            total_passes: self.pass_results.len(),
            final_coverage: self.pass_results.last().map(|r| r.coverage).unwrap_or(0.0),
            total_items_added: self.pass_results.iter().map(|r| r.items_added).sum(),
            total_items_refined: self.pass_results.iter().map(|r| r.items_refined).sum(),
            total_gaps_found: self.pass_results.iter().map(|r| r.gaps_found.len()).sum(),
            total_issues: self.pass_results.iter().map(|r| r.issues.len()).sum(),
        }
    }
}

impl Default for MultiPassGenerator {
    fn default() -> Self {
        Self::new()
    }
}

/// Summary of multi-pass generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerationSummary {
    /// Total number of passes completed
    pub total_passes: usize,
    /// Final coverage achieved
    pub final_coverage: f32,
    /// Total items added across all passes
    pub total_items_added: usize,
    /// Total items refined
    pub total_items_refined: usize,
    /// Total gaps found
    pub total_gaps_found: usize,
    /// Total issues found
    pub total_issues: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::prd::{PRDMetadata, Phase, Task};

    fn create_test_prd() -> PRD {
        PRD {
            metadata: PRDMetadata {
                name: "Test Project".to_string(),
                description: Some("Test description".to_string()),
                version: "1.0.0".to_string(),
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
                goal: Some("Test goal".to_string()),
                description: Some("Test phase".to_string()),
                tasks: vec![Task {
                    id: "T1".to_string(),
                    title: "Task 1".to_string(),
                    description: Some("Test task".to_string()),
                    subtasks: Vec::new(),
                    status: crate::types::prd::ItemStatus::Pending,
                    dependencies: Vec::new(),
                    complexity: None,
                    task_type: None,
                    evidence: Vec::new(),
                    gate_reports: Vec::new(),
                }],
                status: crate::types::prd::ItemStatus::Pending,
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
    fn test_multi_pass_config_default() {
        let config = MultiPassConfig::default();
        assert_eq!(config.pass_count, 3);
        assert!(config.enable_gap_filling);
        assert!(config.enable_validation);
    }

    #[test]
    fn test_pass_result_creation() {
        let result = PassResult::new(1, "Initial pass");
        assert_eq!(result.pass_number, 1);
        assert_eq!(result.description, "Initial pass");
        assert_eq!(result.items_added, 0);
    }

    #[test]
    fn test_coverage_calculation() {
        let generator = MultiPassGenerator::new();
        let mut prd = create_test_prd();

        // Add a subtask with criteria
        use crate::types::prd::Subtask;
        prd.phases[0].tasks[0].subtasks.push(Subtask {
            id: "T1-S1".to_string(),
            task_id: "T1".to_string(),
            title: "Subtask 1".to_string(),
            description: Some("Test subtask".to_string()),
            criterion: None,
            status: crate::types::prd::ItemStatus::Pending,
            iterations: 0,
            evidence: Vec::new(),
            plan: None,
            acceptance_criteria: vec!["Test criterion".to_string()],
            iteration_records: Vec::new(),
        });

        let coverage = generator.calculate_coverage(&prd);
        assert!(coverage > 0.0); // Subtask has criteria
    }

    #[test]
    fn test_structural_gaps() {
        let generator = MultiPassGenerator::new();
        let prd = create_test_prd();
        let gaps = generator.find_structural_gaps(&prd);
        // Should find that task has no subtasks
        assert!(!gaps.is_empty());
    }

    #[test]
    fn test_multi_pass_generation() {
        let mut generator = MultiPassGenerator::new();
        let prd = create_test_prd();
        let result = generator.generate(&prd);
        assert!(result.is_ok());
        assert_eq!(generator.pass_results().len(), 3);
    }

    #[test]
    fn test_generation_summary() {
        let mut generator = MultiPassGenerator::new();
        let prd = create_test_prd();
        let _ = generator.generate(&prd).unwrap();
        let summary = generator.summary();
        assert_eq!(summary.total_passes, 3);
        assert!(summary.final_coverage >= 0.0);
    }
}
