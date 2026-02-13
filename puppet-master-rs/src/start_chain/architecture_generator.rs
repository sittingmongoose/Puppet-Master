//! Architecture generator - creates architecture documentation from PRD

use crate::platforms::{PlatformRunner, UsageEvent, UsageTracker};
use crate::start_chain::PromptTemplate;
use crate::types::{ExecutionRequest, PRD};
use anyhow::Result;
use log::{info, warn};
use std::path::Path;
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Generates architecture documentation
pub struct ArchitectureGenerator;

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

fn strip_markdown_fences(text: &str) -> String {
    let t = text.trim();
    if !t.contains("```") {
        return t.to_string();
    }

    // Best-effort: remove wrapping ``` fences.
    let mut out = String::new();
    let mut in_fence = false;
    for line in t.lines() {
        if line.trim_start().starts_with("```") {
            in_fence = !in_fence;
            continue;
        }
        if in_fence {
            out.push_str(line);
            out.push('\n');
        }
    }

    if out.trim().is_empty() {
        t.to_string()
    } else {
        out.trim().to_string()
    }
}

impl ArchitectureGenerator {
    /// Generate architecture documentation from PRD
    pub fn generate(prd: &PRD) -> String {
        info!(
            "Generating architecture documentation for {}",
            prd.metadata.name
        );

        let mut doc = String::new();

        // Title and overview
        doc.push_str(&format!("# {} - Architecture\n\n", prd.metadata.name));
        doc.push_str(&format!("**Version:** {}\n", prd.metadata.version));
        doc.push_str(&format!(
            "**Created:** {}\n\n",
            prd.metadata
                .created_at
                .map(|d| d.format("%Y-%m-%d").to_string())
                .unwrap_or_default()
        ));
        doc.push_str("---\n\n");

        // Project overview
        doc.push_str("## Project Overview\n\n");
        doc.push_str(&format!(
            "{}\n\n",
            prd.metadata.description.as_deref().unwrap_or("")
        ));

        // System architecture
        doc.push_str("## System Architecture\n\n");
        doc.push_str(&Self::generate_system_diagram(prd));
        doc.push_str("\n\n");

        // Module breakdown
        doc.push_str("## Module Breakdown\n\n");
        doc.push_str(&Self::generate_module_breakdown(prd));
        doc.push_str("\n\n");

        // Data flow
        doc.push_str("## Data Flow\n\n");
        doc.push_str(&Self::generate_data_flow(prd));
        doc.push_str("\n\n");

        // Technology stack
        doc.push_str("## Technology Stack\n\n");
        doc.push_str(&Self::generate_tech_stack(prd));
        doc.push_str("\n\n");

        // Implementation phases
        doc.push_str("## Implementation Phases\n\n");
        doc.push_str(&Self::generate_phase_overview(prd));
        doc.push_str("\n\n");

        doc
    }

    /// Generate architecture documentation from PRD using an AI platform runner.
    ///
    /// Falls back to template-based generation if execution or parsing fails.
    pub async fn generate_with_ai(
        prd: &PRD,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        working_directory: &Path,
        usage_tracker: Option<&UsageTracker>,
    ) -> Result<String> {
        let prd_json = serde_json::to_string_pretty(prd)?;

        let template = PromptTemplate::new(
            "architecture_generation",
            r#"Generate a complete ARCHITECTURE.md markdown document for the target project described by this PRD JSON:

{{prd_json}}

Requirements:
- Use markdown headings.
- Include Technology Stack section with a table and rationale derived from the PRD.
- Include Module Breakdown, Data Flow, Deployment/Operations, and Testing/Verification strategy.
- Output markdown only (no JSON)."#,
        )
        .with_system_prompt(
            "You are a senior software architect. Produce a pragmatic architecture document aligned with the PRD.",
        )
        .with_variable("prd_json");

        let mut vars = std::collections::HashMap::new();
        vars.insert("prd_json".to_string(), prd_json);

        let (system_prompt, user_prompt) = template
            .render_full(&vars)
            .map_err(|e| anyhow::anyhow!(e))?;

        let mut prompt = String::new();
        if let Some(system) = system_prompt {
            prompt.push_str(&system);
            prompt.push_str("\n\n");
        }
        prompt.push_str(&user_prompt);

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
                warn!("AI architecture generation execution failed: {err}");
                return Ok(Self::generate(prd));
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
                    .unwrap_or_else(|| "AI architecture generation failed".to_string()),
            );
        }
        if let Some(tracker) = usage_tracker {
            let _ = tracker.track(event).await;
        } else if let Ok(tracker) = UsageTracker::default_location() {
            let _ = tracker.track(event).await;
        }

        if !exec.success {
            warn!(
                "AI architecture generation returned unsuccessful result; using template fallback"
            );
            return Ok(Self::generate(prd));
        }

        let Some(raw_output) = exec.output.as_deref() else {
            warn!("AI architecture generation produced no output; using template fallback");
            return Ok(Self::generate(prd));
        };

        let response_text = extract_platform_response_text(raw_output);
        Ok(strip_markdown_fences(&response_text))
    }

    /// Generate system architecture diagram (ASCII)
    fn generate_system_diagram(prd: &PRD) -> String {
        let mut diagram = String::new();

        diagram.push_str("```\n");
        diagram.push_str(&format!("┌─────────────────────────────────────┐\n"));
        diagram.push_str(&format!("│  {}  │\n", prd.metadata.name));
        diagram.push_str(&format!("└─────────────────────────────────────┘\n"));
        diagram.push_str("             │\n");
        diagram.push_str("     ┌───────┼───────┐\n");

        let phase_count = prd.phases.len();
        for (i, phase) in prd.phases.iter().enumerate() {
            if i < 3 {
                diagram.push_str(&format!("     │       │       │\n"));
                diagram.push_str(&format!("     ▼       ▼       ▼\n"));
                diagram.push_str(&format!(" ┌───────┬───────┬───────┐\n"));
                diagram.push_str(&format!(
                    " │ {:^5} │ {:^5} │ {:^5} │\n",
                    phase.title.chars().take(5).collect::<String>(),
                    prd.phases
                        .get(i + 1)
                        .map(|p| p.title.chars().take(5).collect::<String>())
                        .unwrap_or_default(),
                    prd.phases
                        .get(i + 2)
                        .map(|p| p.title.chars().take(5).collect::<String>())
                        .unwrap_or_default()
                ));
                diagram.push_str(" └───────┴───────┴───────┘\n");
                break;
            }
        }

        if phase_count > 3 {
            diagram.push_str(&format!("       ... {} more phases\n", phase_count - 3));
        }

        diagram.push_str("```\n");

        diagram
    }

    /// Generate module breakdown
    fn generate_module_breakdown(prd: &PRD) -> String {
        let mut breakdown = String::new();

        for phase in &prd.phases {
            breakdown.push_str(&format!("### {} - {}\n\n", phase.id, phase.title));
            breakdown.push_str(&format!(
                "{}\n\n",
                phase.description.as_deref().unwrap_or("")
            ));

            if !phase.tasks.is_empty() {
                breakdown.push_str("**Components:**\n\n");
                for task in &phase.tasks {
                    breakdown.push_str(&format!(
                        "- **{}** ({}): {}\n",
                        task.title,
                        task.id,
                        task.description.as_deref().unwrap_or("")
                    ));
                }
                breakdown.push_str("\n");
            }
        }

        breakdown
    }

    /// Generate data flow description
    fn generate_data_flow(prd: &PRD) -> String {
        let mut flow = String::new();

        flow.push_str(
            "The system follows a modular architecture with clear data flow between components:\n\n",
        );

        for (i, phase) in prd.phases.iter().enumerate() {
            flow.push_str(&format!("{}. **{}**: ", i + 1, phase.title));
            flow.push_str("Handles ");
            flow.push_str(
                &phase
                    .description
                    .as_deref()
                    .and_then(|d| d.lines().next())
                    .unwrap_or("processing"),
            );
            flow.push_str("\n");
        }

        flow.push_str("\n");
        flow.push_str(
            "Data flows sequentially through these phases, with each phase validating its outputs before passing to the next.\n",
        );

        flow
    }

    /// Generate technology stack recommendations.
    ///
    /// Note: start-chain AI generation derives the stack from the PRD; this fallback keeps the stack as TBD.
    fn generate_tech_stack(prd: &PRD) -> String {
        let mut stack = String::new();

        stack.push_str("Technology stack (to be selected based on requirements):\n\n");
        stack.push_str("| Layer | Technology | Notes |\n");
        stack.push_str("|-------|------------|-------|\n");
        stack.push_str("| Backend | TBD | Based on PRD constraints and team preferences |\n");
        stack.push_str("| Frontend | TBD | Depends on target platforms and UX requirements |\n");
        stack.push_str(
            "| Data Store | TBD | Choose based on persistence, scale, and consistency needs |\n",
        );
        stack.push_str("| CI/CD | TBD | Integrate with required deployment environments |\n");
        stack.push_str("\n");

        if let Some(desc) = prd.metadata.description.as_deref() {
            let d = desc.to_lowercase();
            if d.contains("mobile") {
                stack.push_str("- Consider mobile-first UI and offline sync requirements.\n");
            }
            if d.contains("cli") {
                stack.push_str(
                    "- Consider a CLI-first UX and cross-platform packaging requirements.\n",
                );
            }
        }

        stack
    }

    /// Generate phase overview
    fn generate_phase_overview(prd: &PRD) -> String {
        let mut overview = String::new();

        overview.push_str(&format!("Total phases: {}\n\n", prd.phases.len()));

        for phase in &prd.phases {
            overview.push_str(&format!("#### {} - {}\n", phase.id, phase.title));
            overview.push_str(&format!("**Status:** {:?}\n", phase.status));
            overview.push_str(&format!("**Tasks:** {}\n", phase.tasks.len()));

            let subtask_count: usize = phase.tasks.iter().map(|t| t.subtasks.len()).sum();
            overview.push_str(&format!("**Subtasks:** {}\n\n", subtask_count));
        }

        overview
    }

    /// Save architecture documentation to file
    pub async fn save_architecture(content: &str, path: &Path) -> Result<()> {
        // Ensure directory exists
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        tokio::fs::write(path, content).await?;
        info!("Architecture documentation saved to {:?}", path);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ItemStatus, Phase};

    #[test]
    fn test_generate_architecture() {
        let mut prd = PRD::new("Test Project");
        prd.phases.push(Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: Some("First phase".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: Vec::new(),
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        });

        let arch = ArchitectureGenerator::generate(&prd);

        assert!(arch.contains("Test Project"));
        assert!(arch.contains("Architecture"));
        assert!(arch.contains("Phase 1"));
    }
}
