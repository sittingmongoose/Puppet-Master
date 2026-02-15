//! Formatters for rendering PRD and TierPlan to markdown.

use crate::start_chain::TierPlan;
use crate::types::PRD;

// DRY:FN:format_prd_to_markdown
/// Format a PRD into markdown text.
pub fn format_prd_to_markdown(prd: &PRD) -> String {
    let mut output = String::new();

    // Header
    output.push_str("# Product Requirements Document\n\n");
    output.push_str(&format!("**Project**: {}\n\n", prd.metadata.name));

    if let Some(desc) = &prd.metadata.description {
        output.push_str(&format!("**Description**: {}\n\n", desc));
    }

    output.push_str(&format!("**Version**: {}\n", prd.metadata.version));
    output.push_str(&format!("**Total Tasks**: {}\n", prd.metadata.total_tasks));
    output.push_str(&format!(
        "**Total Subtasks**: {}\n\n",
        prd.metadata.total_subtasks
    ));

    // Phases
    output.push_str("---\n\n");

    for (idx, phase) in prd.phases.iter().enumerate() {
        output.push_str(&format!("## Phase {}: {}\n\n", idx + 1, phase.title));

        if let Some(goal) = &phase.goal {
            output.push_str(&format!("**Goal**: {}\n\n", goal));
        }

        if let Some(desc) = &phase.description {
            output.push_str(&format!("{}\n\n", desc));
        }

        // Tasks
        if !phase.tasks.is_empty() {
            output.push_str("### Tasks\n\n");

            for (task_idx, task) in phase.tasks.iter().enumerate() {
                output.push_str(&format!(
                    "#### {}.{} {}\n\n",
                    idx + 1,
                    task_idx + 1,
                    task.title
                ));

                if let Some(desc) = &task.description {
                    output.push_str(&format!("{}\n\n", desc));
                }

                // Subtasks
                if !task.subtasks.is_empty() {
                    output.push_str("**Subtasks**:\n\n");

                    for (sub_idx, subtask) in task.subtasks.iter().enumerate() {
                        output.push_str(&format!(
                            "- {}.{}.{} {}\n",
                            idx + 1,
                            task_idx + 1,
                            sub_idx + 1,
                            subtask.title
                        ));

                        if let Some(desc) = &subtask.description {
                            output.push_str(&format!("  - {}\n", desc));
                        }
                    }
                    output.push_str("\n");
                }

                // Acceptance criteria
                if !task.subtasks.is_empty() {
                    let has_criteria = task
                        .subtasks
                        .iter()
                        .any(|s| !s.acceptance_criteria.is_empty());
                    if has_criteria {
                        output.push_str("**Acceptance Criteria**:\n\n");
                        for subtask in &task.subtasks {
                            if !subtask.acceptance_criteria.is_empty() {
                                output.push_str(&format!("- {}:\n", subtask.title));
                                for criterion in &subtask.acceptance_criteria {
                                    output.push_str(&format!("  - {}\n", criterion));
                                }
                            }
                        }
                        output.push_str("\n");
                    }
                }
            }
        }

        output.push_str("---\n\n");
    }

    output
}

// DRY:FN:format_tier_plan_to_markdown
/// Format a TierPlan into markdown text.
pub fn format_tier_plan_to_markdown(tier_plan: &TierPlan) -> String {
    let mut output = String::new();

    // Header
    output.push_str("# Execution Plan\n\n");
    output.push_str(&format!(
        "**Estimated Iterations**: {}\n",
        tier_plan.estimated_iterations
    ));
    output.push_str(&format!(
        "**Complexity Score**: {:.2}\n",
        tier_plan.complexity_score
    ));
    output.push_str(&format!(
        "**Estimated Hours**: {:.1}\n\n",
        tier_plan.estimated_hours
    ));

    if !tier_plan.critical_path.is_empty() {
        output.push_str("**Critical Path**: ");
        output.push_str(&tier_plan.critical_path.join(" → "));
        output.push_str("\n\n");
    }

    output.push_str("---\n\n");

    // Phases
    for (idx, phase) in tier_plan.phases.iter().enumerate() {
        output.push_str(&format!("## Phase {}: {}\n\n", idx + 1, phase.name));
        output.push_str(&format!("**Phase ID**: `{}`\n", phase.phase_id));
        output.push_str(&format!(
            "**Estimated Hours**: {:.1}\n",
            phase.estimated_hours
        ));
        output.push_str(&format!("**Priority**: {}/10\n", phase.priority));

        if !phase.dependencies.is_empty() {
            output.push_str(&format!(
                "**Dependencies**: {}\n",
                phase.dependencies.join(", ")
            ));
        }
        output.push_str("\n");

        // Tasks
        if !phase.tasks.is_empty() {
            output.push_str("### Tasks\n\n");

            for (task_idx, task) in phase.tasks.iter().enumerate() {
                output.push_str(&format!(
                    "#### {}.{} {}\n\n",
                    idx + 1,
                    task_idx + 1,
                    task.name
                ));
                output.push_str(&format!("- **Task ID**: `{}`\n", task.task_id));
                output.push_str(&format!("- **Platform**: {}\n", task.platform));
                output.push_str(&format!("- **Model Level**: {}\n", task.model_level));
                output.push_str(&format!("- **Complexity**: {}/5\n", task.complexity));
                output.push_str(&format!(
                    "- **Estimated Hours**: {:.1}\n",
                    task.estimated_hours
                ));

                if !task.dependencies.is_empty() {
                    output.push_str(&format!(
                        "- **Dependencies**: {}\n",
                        task.dependencies.join(", ")
                    ));
                }
                output.push_str("\n");

                // Subtasks
                if !task.subtasks.is_empty() {
                    output.push_str("**Subtasks**:\n\n");

                    for (sub_idx, subtask) in task.subtasks.iter().enumerate() {
                        output.push_str(&format!(
                            "- {}.{}.{} {} (ID: `{}`)\n",
                            idx + 1,
                            task_idx + 1,
                            sub_idx + 1,
                            subtask.name,
                            subtask.subtask_id
                        ));
                        output.push_str(&format!(
                            "  - Max Iterations: {}\n",
                            subtask.max_iterations
                        ));
                        output.push_str(&format!(
                            "  - Hours/Iteration: {:.1}\n",
                            subtask.estimated_hours_per_iteration
                        ));
                        output.push_str(&format!(
                            "  - Retry Strategy: {}\n",
                            subtask.retry_strategy
                        ));

                        if !subtask.verification_criteria.is_empty() {
                            output.push_str("  - Verification:\n");
                            for criterion in &subtask.verification_criteria {
                                output.push_str(&format!("    - {}\n", criterion));
                            }
                        }
                    }
                    output.push_str("\n");
                }
            }
        }

        output.push_str("---\n\n");
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::start_chain::{PhasePlan, SubtaskPlan, TaskPlan};
    use crate::types::{Phase, Platform, Subtask, Task};

    #[test]
    fn test_format_simple_prd() {
        let mut prd = PRD::new("Test Project");
        prd.metadata.description = Some("A test project".to_string());

        let mut phase = Phase {
            id: "phase1".to_string(),
            title: "Setup".to_string(),
            goal: Some("Initialize project".to_string()),
            description: Some("Set up the project structure".to_string()),
            status: Default::default(),
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        let task = Task {
            id: "task1".to_string(),
            title: "Create structure".to_string(),
            description: Some("Create directory structure".to_string()),
            status: Default::default(),
            subtasks: vec![],
            evidence: vec![],
            gate_reports: vec![],
            dependencies: vec![],
            complexity: None,
            task_type: None,
        };

        phase.tasks.push(task);
        prd.phases.push(phase);
        prd.update_metadata();

        let markdown = format_prd_to_markdown(&prd);

        assert!(markdown.contains("# Product Requirements Document"));
        assert!(markdown.contains("Test Project"));
        assert!(markdown.contains("## Phase 1: Setup"));
        assert!(markdown.contains("Create structure"));
    }

    #[test]
    fn test_format_prd_with_subtasks() {
        let mut prd = PRD::new("Complex Project");

        let mut phase = Phase {
            id: "phase1".to_string(),
            title: "Development".to_string(),
            goal: None,
            description: None,
            status: Default::default(),
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        let mut task = Task {
            id: "task1".to_string(),
            title: "Implement feature".to_string(),
            description: None,
            status: Default::default(),
            subtasks: vec![],
            evidence: vec![],
            gate_reports: vec![],
            dependencies: vec![],
            complexity: None,
            task_type: None,
        };

        let subtask = Subtask {
            id: "subtask1".to_string(),
            task_id: "task1".to_string(),
            title: "Write code".to_string(),
            description: Some("Write the implementation".to_string()),
            criterion: None,
            status: Default::default(),
            iterations: 0,
            evidence: vec![],
            plan: None,
            acceptance_criteria: vec!["Code compiles".to_string(), "Tests pass".to_string()],
            iteration_records: vec![],
        };

        task.subtasks.push(subtask);
        phase.tasks.push(task);
        prd.phases.push(phase);
        prd.update_metadata();

        let markdown = format_prd_to_markdown(&prd);

        assert!(markdown.contains("1.1.1 Write code"));
        assert!(markdown.contains("Write the implementation"));
        assert!(markdown.contains("Code compiles"));
        assert!(markdown.contains("Tests pass"));
    }

    #[test]
    fn test_format_empty_prd() {
        let prd = PRD::new("Empty Project");
        let markdown = format_prd_to_markdown(&prd);

        assert!(markdown.contains("# Product Requirements Document"));
        assert!(markdown.contains("Empty Project"));
        assert!(markdown.contains("**Total Tasks**: 0"));
    }

    #[test]
    fn test_format_tier_plan() {
        let tier_plan = TierPlan {
            phases: vec![PhasePlan {
                phase_id: "phase1".to_string(),
                name: "Setup".to_string(),
                tasks: vec![TaskPlan {
                    task_id: "task1".to_string(),
                    name: "Initialize".to_string(),
                    subtasks: vec![SubtaskPlan {
                        subtask_id: "sub1".to_string(),
                        name: "Create files".to_string(),
                        max_iterations: 3,
                        verification_criteria: vec!["Files exist".to_string()],
                        estimated_hours_per_iteration: 0.5,
                        retry_strategy: "exponential".to_string(),
                    }],
                    platform: Platform::Cursor,
                    model_level: "auto".to_string(),
                    dependencies: vec![],
                    estimated_hours: 1.5,
                    complexity: 2,
                }],
                dependencies: vec![],
                estimated_hours: 1.5,
                priority: 8,
            }],
            estimated_iterations: 3,
            complexity_score: 0.4,
            estimated_hours: 1.5,
            critical_path: vec!["task1".to_string()],
        };

        let markdown = format_tier_plan_to_markdown(&tier_plan);

        assert!(markdown.contains("# Execution Plan"));
        assert!(markdown.contains("**Estimated Iterations**: 3"));
        assert!(markdown.contains("**Complexity Score**: 0.40"));
        assert!(markdown.contains("## Phase 1: Setup"));
        assert!(markdown.contains("1.1 Initialize"));
        assert!(markdown.contains("1.1.1 Create files"));
        assert!(markdown.contains("Files exist"));
    }
}
