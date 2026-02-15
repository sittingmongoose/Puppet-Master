//! Tier plan generator - creates tiered execution plans from PRD.
//!
//! Takes a PRD and produces a detailed execution plan with phases, tasks,
//! subtasks, and iterations, including time estimates and dependencies.

use crate::types::{PRD, Phase, Platform, Subtask, Task};
use anyhow::{Context, Result};
use log::{debug, info};
use serde::{Deserialize, Serialize};

// DRY:DATA:TierPlanGenerator
/// Generates tiered execution plans from a PRD.
pub struct TierPlanGenerator;

// DRY:DATA:TierPlan
/// A complete tier execution plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierPlan {
    /// Phases in the execution plan.
    pub phases: Vec<PhasePlan>,
    /// Estimated total iterations.
    pub estimated_iterations: u32,
    /// Complexity score (0.0 to 1.0).
    pub complexity_score: f64,
    /// Total estimated time in hours.
    #[serde(default)]
    pub estimated_hours: f64,
    /// Critical path task IDs.
    #[serde(default)]
    pub critical_path: Vec<String>,
}

// DRY:DATA:PhasePlan
/// A phase within an execution plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhasePlan {
    /// Phase identifier.
    pub phase_id: String,
    /// Phase name.
    pub name: String,
    /// Tasks in this phase.
    pub tasks: Vec<TaskPlan>,
    /// Dependencies (phase IDs that must complete first).
    pub dependencies: Vec<String>,
    /// Estimated time for this phase in hours.
    #[serde(default)]
    pub estimated_hours: f64,
    /// Phase priority (1-10, higher is more important).
    #[serde(default = "default_priority")]
    pub priority: u32,
}

fn default_priority() -> u32 {
    5
}

// DRY:DATA:TaskPlan
/// A task within a phase plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskPlan {
    /// Task identifier.
    pub task_id: String,
    /// Task name.
    pub name: String,
    /// Subtasks for this task.
    pub subtasks: Vec<SubtaskPlan>,
    /// Platform to execute this task.
    pub platform: Platform,
    /// Model level (e.g., "flash", "thinking", "pro").
    pub model_level: String,
    /// Task dependencies.
    pub dependencies: Vec<String>,
    /// Estimated time in hours.
    #[serde(default)]
    pub estimated_hours: f64,
    /// Complexity rating (1-5).
    #[serde(default = "default_complexity")]
    pub complexity: u32,
}

fn default_complexity() -> u32 {
    3
}

// DRY:DATA:SubtaskPlan
/// A subtask within a task plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtaskPlan {
    /// Subtask identifier.
    pub subtask_id: String,
    /// Subtask name.
    pub name: String,
    /// Maximum iterations allowed.
    pub max_iterations: u32,
    /// Verification criteria.
    pub verification_criteria: Vec<String>,
    /// Estimated time in hours per iteration.
    #[serde(default)]
    pub estimated_hours_per_iteration: f64,
    /// Retry strategy.
    #[serde(default = "default_retry_strategy")]
    pub retry_strategy: String,
}

fn default_retry_strategy() -> String {
    "exponential".to_string()
}

impl TierPlanGenerator {
    // DRY:FN:generate
    /// Generate a tier plan from a PRD.
    pub fn generate(prd: &PRD) -> Result<TierPlan> {
        info!("Generating tier plan for PRD: {}", prd.metadata.name);

        let mut phases = Vec::new();
        let mut total_iterations = 0;
        let mut total_hours = 0.0;

        for phase in &prd.phases {
            let phase_plan =
                Self::generate_phase_plan(phase).context("Failed to generate phase plan")?;

            total_iterations += phase_plan
                .tasks
                .iter()
                .flat_map(|t| &t.subtasks)
                .map(|s| s.max_iterations)
                .sum::<u32>();

            total_hours += phase_plan.estimated_hours;
            phases.push(phase_plan);
        }

        let complexity_score = Self::calculate_complexity(&phases);
        let critical_path = Self::identify_critical_path(&phases);

        Ok(TierPlan {
            phases,
            estimated_iterations: total_iterations,
            complexity_score,
            estimated_hours: total_hours,
            critical_path,
        })
    }

    /// Generate a plan for a single phase.
    fn generate_phase_plan(phase: &Phase) -> Result<PhasePlan> {
        debug!("Generating plan for phase: {}", phase.id);

        let mut tasks = Vec::new();
        let mut phase_hours = 0.0;

        for task in &phase.tasks {
            let task_plan = Self::generate_task_plan(task)?;
            phase_hours += task_plan.estimated_hours;
            tasks.push(task_plan);
        }

        Ok(PhasePlan {
            phase_id: phase.id.clone(),
            name: phase.title.clone(),
            tasks,
            dependencies: phase.dependencies.clone(),
            estimated_hours: phase_hours,
            priority: Self::infer_priority(phase),
        })
    }

    /// Generate a plan for a single task.
    fn generate_task_plan(task: &Task) -> Result<TaskPlan> {
        debug!("Generating plan for task: {}", task.id);

        let mut subtasks = Vec::new();
        let mut task_hours = 0.0;

        for subtask in &task.subtasks {
            let subtask_plan = Self::generate_subtask_plan(subtask)?;
            task_hours +=
                subtask_plan.estimated_hours_per_iteration * subtask_plan.max_iterations as f64;
            subtasks.push(subtask_plan);
        }

        let complexity = Self::infer_task_complexity(task);
        let platform = Self::select_platform_for_task(task, complexity);
        let model_level = Self::select_model_level(complexity);

        Ok(TaskPlan {
            task_id: task.id.clone(),
            name: task.title.clone(),
            subtasks,
            platform,
            model_level,
            dependencies: task.dependencies.clone(),
            estimated_hours: task_hours,
            complexity,
        })
    }

    /// Generate a plan for a single subtask.
    fn generate_subtask_plan(subtask: &Subtask) -> Result<SubtaskPlan> {
        debug!("Generating plan for subtask: {}", subtask.id);

        let verification_criteria = subtask.acceptance_criteria.clone();
        let max_iterations = Self::calculate_max_iterations(subtask);
        let estimated_hours = Self::estimate_subtask_hours(subtask);

        Ok(SubtaskPlan {
            subtask_id: subtask.id.clone(),
            name: subtask.title.clone(),
            max_iterations,
            verification_criteria,
            estimated_hours_per_iteration: estimated_hours,
            retry_strategy: "exponential".to_string(),
        })
    }

    /// Calculate maximum iterations for a subtask.
    fn calculate_max_iterations(subtask: &Subtask) -> u32 {
        // Base on description complexity
        let description_length = subtask.description.as_ref().map(|d| d.len()).unwrap_or(0);

        let criteria_count = subtask.acceptance_criteria.len();

        // Simple heuristic
        if description_length > 500 || criteria_count > 5 {
            5
        } else if description_length > 200 || criteria_count > 3 {
            3
        } else {
            2
        }
    }

    /// Estimate hours per subtask iteration.
    fn estimate_subtask_hours(subtask: &Subtask) -> f64 {
        let description_length = subtask.description.as_ref().map(|d| d.len()).unwrap_or(0);

        let criteria_count = subtask.acceptance_criteria.len();

        // Rough estimation based on complexity
        let base_hours = 0.5;
        let description_factor = (description_length as f64 / 100.0).min(3.0);
        let criteria_factor = criteria_count as f64 * 0.25;

        base_hours + description_factor + criteria_factor
    }

    /// Infer task complexity (1-5).
    fn infer_task_complexity(task: &Task) -> u32 {
        let subtask_count = task.subtasks.len();
        let has_description = task.description.is_some();
        let dependency_count = task.dependencies.len();

        if subtask_count > 10 || dependency_count > 3 {
            5
        } else if subtask_count > 5 || dependency_count > 1 || has_description {
            4
        } else if subtask_count > 3 {
            3
        } else if subtask_count > 1 {
            2
        } else {
            1
        }
    }

    /// Select appropriate platform for a task based on complexity.
    fn select_platform_for_task(task: &Task, complexity: u32) -> Platform {
        // Use task_type hint if available
        if let Some(ref task_type) = task.task_type {
            if task_type.contains("critical") || task_type.contains("complex") {
                return Platform::Claude;
            }
        }

        // Default platform selection based on complexity
        match complexity {
            5 => Platform::Claude, // Most complex - use Claude
            4 => Platform::Gemini, // Complex - use Gemini
            3 => Platform::Codex,  // Medium - use Codex
            _ => Platform::Cursor, // Simple - use Cursor
        }
    }

    /// Select model level based on complexity.
    fn select_model_level(complexity: u32) -> String {
        match complexity {
            5 => "thinking".to_string(),
            4 => "pro".to_string(),
            _ => "flash".to_string(),
        }
    }

    /// Infer phase priority (1-10).
    fn infer_priority(phase: &Phase) -> u32 {
        let has_dependencies = !phase.dependencies.is_empty();
        let task_count = phase.tasks.len();

        // Phases with dependencies are typically more important
        let base_priority = if has_dependencies { 7 } else { 5 };

        // Adjust based on task count
        let adjusted = base_priority + (task_count as u32).min(3);

        adjusted.min(10)
    }

    /// Calculate overall complexity score (0.0 to 1.0).
    fn calculate_complexity(phases: &[PhasePlan]) -> f64 {
        if phases.is_empty() {
            return 0.0;
        }

        let total_tasks: usize = phases.iter().map(|p| p.tasks.len()).sum();
        let total_subtasks: usize = phases
            .iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.subtasks.len())
            .sum();

        let avg_complexity: f64 = phases
            .iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.complexity as f64)
            .sum::<f64>()
            / total_tasks.max(1) as f64;

        let dependency_count: usize = phases.iter().map(|p| p.dependencies.len()).sum();

        // Normalize to 0.0-1.0 range
        let task_factor = (total_tasks as f64 / 20.0).min(1.0) * 0.3;
        let subtask_factor = (total_subtasks as f64 / 50.0).min(1.0) * 0.3;
        let complexity_factor = (avg_complexity / 5.0) * 0.25;
        let dependency_factor = (dependency_count as f64 / 10.0).min(1.0) * 0.15;

        task_factor + subtask_factor + complexity_factor + dependency_factor
    }

    /// Identify critical path through the plan.
    fn identify_critical_path(phases: &[PhasePlan]) -> Vec<String> {
        let mut critical_path = Vec::new();

        // Find the longest chain of dependencies
        for phase in phases {
            if !phase.dependencies.is_empty() {
                critical_path.push(phase.phase_id.clone());

                // Add tasks with longest estimated hours
                if let Some(longest_task) = phase
                    .tasks
                    .iter()
                    .max_by(|a, b| a.estimated_hours.partial_cmp(&b.estimated_hours).unwrap())
                {
                    critical_path.push(longest_task.task_id.clone());
                }
            }
        }

        critical_path
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::ItemStatus;

    #[test]
    fn test_generate_empty_prd() {
        let prd = PRD::new("Test Project");
        let plan = TierPlanGenerator::generate(&prd).unwrap();

        assert_eq!(plan.phases.len(), 0);
        assert_eq!(plan.estimated_iterations, 0);
    }

    #[test]
    fn test_calculate_max_iterations() {
        let subtask = Subtask {
            id: "ST-001".to_string(),
            task_id: "TK-001".to_string(),
            title: "Test".to_string(),
            description: Some("Simple task".to_string()),
            criterion: None,
            status: ItemStatus::Pending,
            iterations: 0,
            evidence: vec![],
            plan: None,
            acceptance_criteria: vec!["Criterion 1".to_string()],
            iteration_records: vec![],
        };

        let max_iter = TierPlanGenerator::calculate_max_iterations(&subtask);
        assert!(max_iter >= 2 && max_iter <= 5);
    }

    #[test]
    fn test_select_platform_by_complexity() {
        let platform = TierPlanGenerator::select_platform_for_task(
            &Task {
                id: "TK-001".to_string(),
                title: "Test".to_string(),
                description: None,
                status: ItemStatus::Pending,
                subtasks: vec![],
                evidence: vec![],
                gate_reports: vec![],
                dependencies: vec![],
                complexity: None,
                task_type: None,
            },
            5,
        );

        assert_eq!(platform, Platform::Claude);
    }

    #[test]
    fn test_complexity_score_calculation() {
        let phases = vec![PhasePlan {
            phase_id: "PH-001".to_string(),
            name: "Phase 1".to_string(),
            tasks: vec![TaskPlan {
                task_id: "TK-001".to_string(),
                name: "Task 1".to_string(),
                subtasks: vec![],
                platform: Platform::Cursor,
                model_level: "flash".to_string(),
                dependencies: vec![],
                estimated_hours: 2.0,
                complexity: 3,
            }],
            dependencies: vec![],
            estimated_hours: 2.0,
            priority: 5,
        }];

        let score = TierPlanGenerator::calculate_complexity(&phases);
        assert!(score >= 0.0 && score <= 1.0);
    }
}
