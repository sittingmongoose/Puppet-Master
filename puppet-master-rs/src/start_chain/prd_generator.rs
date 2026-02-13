//! PRD generator - creates structured PRD from parsed requirements

use crate::platforms::{PlatformRunner, UsageEvent, UsageTracker};
use crate::types::{
    ExecutionRequest, ItemStatus, PRD, ParsedRequirements, Phase, RequirementsSection, Subtask,
    Task,
};
use anyhow::{Result, anyhow};
use chrono::Utc;
use log::{info, warn};
use std::path::Path;
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Generates PRD from parsed requirements
pub struct PrdGenerator;

fn extract_platform_response_text(raw_output: &str) -> String {
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(raw_output) {
        if let Some(text) = extract_text_from_json(&json) {
            return text;
        }
    }

    if let (Some(start), Some(end)) = (raw_output.find('{'), raw_output.rfind('}')) {
        if start < end {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&raw_output[start..=end]) {
                if let Some(text) = extract_text_from_json(&json) {
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

impl PrdGenerator {
    /// Generate a PRD from parsed requirements
    pub fn generate(project_name: &str, requirements: &ParsedRequirements) -> Result<PRD> {
        info!("Generating PRD for project: {}", project_name);

        let mut prd = PRD::new(project_name);

        let mut phase_counter = 1;

        // Convert top-level sections to phases
        for section in &requirements.sections {
            let phase = Self::section_to_phase(section, &mut phase_counter)?;
            prd.phases.push(phase);
        }

        Self::inject_default_acceptance_criteria(&mut prd, requirements);
        prd.update_metadata();

        Ok(prd)
    }

    /// Generate a PRD from parsed requirements using an AI platform runner.
    ///
    /// Falls back to rule-based generation if execution or parsing fails.
    pub async fn generate_with_ai(
        project_name: &str,
        requirements: &ParsedRequirements,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        working_directory: &Path,
        usage_tracker: Option<&UsageTracker>,
    ) -> Result<PRD> {
        // Delegate large documents to multi-pass generator.
        const LARGE_DOC_THRESHOLD: usize = 5000;
        let source_chars: usize = requirements
            .sections
            .iter()
            .map(|s| s.title.len() + s.content.len())
            .sum::<usize>()
            + requirements
                .description
                .as_ref()
                .map(|d| d.len())
                .unwrap_or(0);

        if source_chars >= LARGE_DOC_THRESHOLD {
            let mut multi = super::MultiPassGenerator::new();
            match multi
                .generate_with_ai(
                    requirements,
                    Arc::clone(&runner),
                    model,
                    working_directory,
                    usage_tracker,
                )
                .await
            {
                Ok(mut prd) => {
                    prd.update_metadata();
                    return Ok(prd);
                }
                Err(err) => {
                    warn!(
                        "Multi-pass AI PRD generation failed: {err}; falling back to single-pass"
                    );
                }
            }
        }

        let template = super::PromptTemplates::prd_generation();

        let mut vars = std::collections::HashMap::new();
        vars.insert("project_name".to_string(), project_name.to_string());
        vars.insert(
            "project_description".to_string(),
            Self::extract_description(requirements),
        );
        vars.insert(
            "requirements".to_string(),
            Self::format_requirements_for_prompt(requirements),
        );

        let (system_prompt, user_prompt) = template.render_full(&vars).map_err(|e| anyhow!(e))?;

        let mut prompt = String::new();
        if let Some(system) = system_prompt {
            prompt.push_str(&system);
            prompt.push_str("\n\n");
        }
        prompt.push_str(&user_prompt);
        prompt.push_str(
            "\n\nReturn ONLY a single JSON object matching this Rust PRD schema with camelCase fields: {metadata:{name,description?,version?,createdAt?,updatedAt?},phases:[{id,title,goal?,description?,tasks:[{id,title,description?,subtasks:[{id,taskId,title,description?,acceptanceCriteria:[]}]}]}]}. Do not include markdown fences or any extra text.",
        );

        let request = ExecutionRequest::new(
            runner.platform(),
            model.to_string(),
            prompt,
            working_directory.to_path_buf(),
        )
        .with_timeout(Duration::from_millis(300_000))
        .with_plan_mode(true);

        let start = Instant::now();
        let exec = match runner.execute(&request).await {
            Ok(r) => r,
            Err(err) => {
                warn!("AI PRD generation execution failed: {err}");
                return Self::generate(project_name, requirements);
            }
        };
        let duration_ms = exec
            .duration_ms
            .unwrap_or_else(|| start.elapsed().as_millis() as u64);

        // Track usage (best-effort)
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
            warn!("AI PRD generation returned unsuccessful result; using heuristic fallback");
            return Self::generate(project_name, requirements);
        }

        let Some(raw_output) = exec.output.as_deref() else {
            warn!("AI PRD generation produced no output; using heuristic fallback");
            return Self::generate(project_name, requirements);
        };

        let response_text = extract_platform_response_text(raw_output);
        let Some(mut json_value) = try_parse_json_value(&response_text) else {
            warn!("Failed to parse AI PRD output as JSON; using heuristic fallback");
            return Self::generate(project_name, requirements);
        };

        // Some models wrap the PRD in a top-level field.
        if let Some(prd_val) = json_value.get("prd").cloned() {
            json_value = prd_val;
        } else if let Some(prd_val) = json_value.get("data").cloned() {
            json_value = prd_val;
        }

        let mut prd: PRD = match serde_json::from_value(json_value) {
            Ok(p) => p,
            Err(err) => {
                warn!("Failed to deserialize AI PRD output: {err}; using heuristic fallback");
                return Self::generate(project_name, requirements);
            }
        };

        if prd.metadata.name.is_empty() {
            prd.metadata.name = project_name.to_string();
        }
        if prd.metadata.created_at.is_none() {
            prd.metadata.created_at = Some(Utc::now());
        }
        prd.metadata.updated_at = Some(Utc::now());

        Self::inject_default_acceptance_criteria(&mut prd, requirements);
        prd.update_metadata();

        Ok(prd)
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

    /// Convert a section to a phase
    fn section_to_phase(section: &RequirementsSection, phase_counter: &mut usize) -> Result<Phase> {
        let phase_id = format!("PH-{:03}", *phase_counter);
        *phase_counter += 1;

        let mut phase = Phase {
            id: phase_id.clone(),
            title: section.title.clone(),
            goal: None,
            description: Some(section.content.clone()),
            status: ItemStatus::Pending,
            tasks: Vec::new(),
            iterations: 0,
            evidence: Vec::new(),
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: Vec::new(),
        };

        // Create a single task from the section content
        let mut task_counter = 1;
        let task = Self::content_to_task(&section.content, &phase_id, &mut task_counter)?;
        phase.tasks.push(task);

        Ok(phase)
    }

    /// Create a task from content
    fn content_to_task(content: &str, phase_id: &str, task_counter: &mut usize) -> Result<Task> {
        let task_id = format!("{}-{:03}", phase_id.replace("PH", "TK"), *task_counter);
        *task_counter += 1;

        let mut subtasks = Vec::new();
        let mut subtask_counter = 1;

        // Split content into lines and create subtasks from bullet items
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
                let item_text = trimmed.trim_start_matches("- ").trim_start_matches("* ");
                let subtask = Self::item_to_subtask(item_text, &task_id, &mut subtask_counter)?;
                subtasks.push(subtask);
            }
        }

        // If no subtasks from bullets, create one from the full content
        if subtasks.is_empty() {
            let subtask = Subtask {
                id: format!("{}-{:03}", task_id.replace("TK", "ST"), subtask_counter),
                task_id: task_id.clone(),
                title: "Implementation".to_string(),
                description: Some(content.to_string()),
                criterion: None,
                status: ItemStatus::Pending,
                iterations: 0,
                evidence: Vec::new(),
                plan: None,
                acceptance_criteria: Vec::new(),
                iteration_records: Vec::new(),
            };
            subtasks.push(subtask);
        }

        Ok(Task {
            id: task_id,
            title: "Implementation".to_string(),
            description: Some(content.to_string()),
            status: ItemStatus::Pending,
            subtasks,
            evidence: Vec::new(),
            gate_reports: Vec::new(),
            dependencies: Vec::new(),
            complexity: None,
            task_type: None,
        })
    }

    /// Convert an item to a subtask
    fn item_to_subtask(item: &str, task_id: &str, subtask_counter: &mut usize) -> Result<Subtask> {
        let subtask_id = format!("{}-{:03}", task_id.replace("TK", "ST"), *subtask_counter);
        *subtask_counter += 1;

        let title = if item.len() > 80 {
            item.chars().take(80).collect::<String>() + "..."
        } else {
            item.to_string()
        };

        Ok(Subtask {
            id: subtask_id,
            task_id: task_id.to_string(),
            title,
            description: Some(item.to_string()),
            criterion: None,
            status: ItemStatus::Pending,
            iterations: 0,
            evidence: Vec::new(),
            plan: None,
            acceptance_criteria: Vec::new(),
            iteration_records: Vec::new(),
        })
    }

    /// Inject default acceptance criteria into subtasks that have none.
    ///
    /// Uses the AcceptanceCriteriaInjector to ensure every subtask has machine-verifiable criteria.
    fn inject_default_acceptance_criteria(prd: &mut PRD, _requirements: &ParsedRequirements) {
        let injector = super::AcceptanceCriteriaInjector::default();
        match injector.inject(prd) {
            Ok(result) => {
                info!(
                    "Injected {} criteria into {} subtasks",
                    result.criteria_injected, result.subtasks_without_criteria
                );
            }
            Err(e) => {
                warn!("Failed to inject acceptance criteria: {}", e);
            }
        }
    }

    /// Extract project description from requirements
    fn extract_description(requirements: &ParsedRequirements) -> String {
        requirements
            .description
            .clone()
            .or_else(|| requirements.sections.first().map(|s| s.content.clone()))
            .unwrap_or_else(|| "Project generated from requirements".to_string())
    }

    /// Save PRD to file
    pub async fn save_prd(prd: &PRD, path: &std::path::Path) -> Result<()> {
        let json = serde_json::to_string_pretty(prd)?;

        // Ensure directory exists
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        tokio::fs::write(path, json).await?;
        info!("PRD saved to {:?}", path);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_prd() {
        let mut requirements = ParsedRequirements::new("Test Project");
        requirements.sections.push(RequirementsSection::new(
            "Phase 1",
            "Phase description\n- Item 1\n- Item 2",
        ));

        let prd = PrdGenerator::generate("Test Project", &requirements).unwrap();

        assert_eq!(prd.metadata.name, "Test Project");
        assert_eq!(prd.phases.len(), 1);
        assert_eq!(prd.phases[0].title, "Phase 1");
        
        // Verify acceptance criteria were injected
        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    assert!(!subtask.acceptance_criteria.is_empty(),
                        "Subtask {} should have acceptance_criteria injected", subtask.id);
                }
            }
        }
    }

    #[test]
    fn test_acceptance_criteria_injection() {
        let mut requirements = ParsedRequirements::new("Test Project");
        requirements.sections.push(RequirementsSection::new(
            "Implementation",
            "Build the feature\n- Write code\n- Add tests",
        ));

        let prd = PrdGenerator::generate("Test Project", &requirements).unwrap();

        // Verify subtasks have prefixed acceptance criteria
        let subtask = &prd.phases[0].tasks[0].subtasks[0];
        assert!(!subtask.acceptance_criteria.is_empty());
        
        // Check for prefixed format
        let has_prefixed = subtask.acceptance_criteria.iter().any(|c| {
            c.starts_with("command:") || c.starts_with("file_exists:") || c.starts_with("regex:")
        });
        assert!(has_prefixed, "Generated PRD should have prefixed acceptance criteria");
    }

    #[test]
    fn test_section_to_phase() {
        let section = RequirementsSection::new("Test Phase", "Description\n- Item 1");

        let mut counter = 1;
        let phase = PrdGenerator::section_to_phase(&section, &mut counter).unwrap();

        assert_eq!(phase.id, "PH-001");
        assert_eq!(phase.title, "Test Phase");
        assert!(!phase.tasks.is_empty());
    }
}
