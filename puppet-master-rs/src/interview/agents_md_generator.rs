//! Generates initial AGENTS.md from interview results.
//!
//! Creates a starter AGENTS.md file that guides AI agents through the project
//! based on the requirements gathered during the interview.
//!
//! Implements Part 2.9 of interviewupdates.md specification.

use anyhow::{Context, Result};
use log::info;
use std::fs;
use std::path::Path;

use super::document_writer::CompletedPhase;

// DRY:FN:generate_agents_md
/// Generates AGENTS.md content from completed interview phases.
///
/// This follows the spec from Part 2.9:
/// - Title: "# AGENTS.md - {Project Name}"
/// - Sections: Overview, Architecture Notes, Codebase Patterns, DO, DON'T,
///   Testing, Common Failure Modes, Directory Structure
pub fn generate_agents_md(
    project_name: &str,
    completed_phases: &[CompletedPhase],
    feature_description: &str,
) -> Result<String> {
    let mut content = String::new();

    // Header (Part 2.9 spec: "# AGENTS.md - {Project Name}")
    content.push_str(&format!("# AGENTS.md - {}\n\n", project_name));
    content.push_str(&format!(
        "_Auto-generated from interview on {}_\n\n",
        chrono::Utc::now().format("%Y-%m-%d")
    ));

    // Overview section (from Phase 1 - Scope & Goals)
    content.push_str("## Overview\n\n");
    if let Some(scope_phase) = completed_phases
        .iter()
        .find(|p| p.definition.id == "scope_goals")
    {
        // Extract overview from scope & goals decisions
        if !scope_phase.decisions.is_empty() {
            for decision in &scope_phase.decisions {
                content.push_str(&format!("- {}: {}\n", decision.summary, decision.reasoning));
            }
            content.push('\n');
        } else {
            content.push_str(&format!("{}\n\n", feature_description));
        }

        // Include relevant Q&A from scope phase
        if !scope_phase.qa_history.is_empty() {
            content.push_str("**Project goals:**\n\n");
            for qa in scope_phase.qa_history.iter().take(3) {
                content.push_str(&format!("- {}: {}\n", qa.question, qa.answer));
            }
            content.push('\n');
        }
    } else {
        content.push_str(&format!("{}\n\n", feature_description));
    }

    // Architecture Notes section (from Phase 2 - Architecture & Technology)
    content.push_str("## Architecture Notes\n\n");
    if let Some(arch_phase) = completed_phases
        .iter()
        .find(|p| p.definition.id == "architecture_technology")
    {
        if !arch_phase.decisions.is_empty() {
            content.push_str("**Tech stack (versions pinned):**\n\n");
            for decision in &arch_phase.decisions {
                content.push_str(&format!(
                    "- **{}**: {}\n",
                    decision.summary, decision.reasoning
                ));
            }
            content.push('\n');
        }

        // Extract platform targets, build system details from Q&A
        if !arch_phase.qa_history.is_empty() {
            content.push_str("**Platform & build details:**\n\n");
            for qa in &arch_phase.qa_history {
                content.push_str(&format!("- {}: {}\n", qa.question, qa.answer));
            }
            content.push('\n');
        }
    } else {
        content.push_str("_Placeholder: Tech stack to be determined_\n\n");
    }

    // Codebase Patterns section
    content.push_str("## Codebase Patterns\n\n");
    let mut patterns_found = false;
    for phase in completed_phases {
        let pattern_keywords = ["naming", "structure", "pattern", "convention", "style"];
        let relevant_decisions: Vec<_> = phase
            .decisions
            .iter()
            .filter(|d| {
                pattern_keywords
                    .iter()
                    .any(|k| d.summary.to_lowercase().contains(k))
            })
            .collect();

        if !relevant_decisions.is_empty() {
            patterns_found = true;
            for decision in relevant_decisions {
                content.push_str(&format!(
                    "- **{}**: {}\n",
                    decision.summary, decision.reasoning
                ));
            }
        }
    }
    if !patterns_found {
        content.push_str("_Placeholder: Coding patterns and conventions to be established_\n");
    }
    content.push_str("\n");

    // DO section
    content.push_str("## DO\n\n");
    let mut do_items = Vec::new();

    // Extract specific versions and tools from decisions
    for phase in completed_phases {
        for decision in &phase.decisions {
            if decision.summary.to_lowercase().contains("use")
                || decision.summary.to_lowercase().contains("version")
            {
                do_items.push(format!(
                    "- {} (decided in interview Phase: {})",
                    decision.summary, phase.definition.name
                ));
            }
        }
    }

    // Add standard DO items
    do_items.push("- Run all tests before marking tasks complete".to_string());
    do_items.push("- Check Playwright tests pass for any GUI changes".to_string());
    do_items.push("- Follow the architecture decisions documented above".to_string());
    do_items.push("- Update AGENTS.md with learnings after significant iterations".to_string());

    for item in &do_items {
        content.push_str(&format!("{}\n", item));
    }
    content.push('\n');

    // DON'T section
    content.push_str("## DON'T\n\n");
    let mut dont_items = Vec::new();

    // Extract explicit exclusions from decisions
    for phase in completed_phases {
        for decision in &phase.decisions {
            if decision.summary.to_lowercase().contains("avoid")
                || decision.summary.to_lowercase().contains("not")
                || decision.summary.to_lowercase().contains("don't")
            {
                dont_items.push(format!("- {}", decision.summary));
            }
        }
    }

    // Add standard DON'T items
    dont_items.push("- Don't skip tests - ALL testing is autonomous".to_string());
    dont_items.push("- Don't assume - everything was specified in the interview".to_string());
    dont_items.push("- Don't use deprecated or conflicting library versions".to_string());
    dont_items.push("- Don't introduce manual testing steps".to_string());

    for item in &dont_items {
        content.push_str(&format!("{}\n", item));
    }
    content.push('\n');

    // Testing section (from Phase 8 - Testing & Verification)
    content.push_str("## Testing\n\n");
    content.push_str("**All tests must be runnable by AI agents autonomously.**\n\n");

    if let Some(test_phase) = completed_phases
        .iter()
        .find(|p| p.definition.id == "testing_verification")
    {
        if !test_phase.decisions.is_empty() {
            for decision in &test_phase.decisions {
                content.push_str(&format!("- {}: {}\n", decision.summary, decision.reasoning));
            }
            content.push('\n');
        }

        // Extract test configuration details from Q&A
        if !test_phase.qa_history.is_empty() {
            content.push_str("**Test configuration:**\n\n");
            for qa in &test_phase.qa_history {
                content.push_str(&format!("- {}: {}\n", qa.question, qa.answer));
            }
            content.push('\n');
        }
    }

    content.push_str("See `test-strategy.md` for detailed test specifications.\n\n");
    content.push_str("Every tier has machine-verifiable acceptance criteria.\n\n");

    // Common Failure Modes section
    content.push_str("## Common Failure Modes\n\n");
    content.push_str("_Pre-populated from research engine findings about the tech stack:_\n\n");

    // Extract gotchas and warnings from decisions
    let mut failure_modes_found = false;
    for phase in completed_phases {
        for decision in &phase.decisions {
            if decision.reasoning.to_lowercase().contains("avoid")
                || decision.reasoning.to_lowercase().contains("gotcha")
                || decision.reasoning.to_lowercase().contains("watch out")
                || decision.reasoning.to_lowercase().contains("careful")
            {
                failure_modes_found = true;
                content.push_str(&format!(
                    "- **{}**: {}\n",
                    phase.definition.name, decision.reasoning
                ));
            }
        }
    }

    if !failure_modes_found {
        content.push_str("_No specific failure modes identified during interview. Research engine findings to be added._\n");
    }
    content.push('\n');

    // Directory Structure section (from Phase 2 decisions)
    content.push_str("## Directory Structure\n\n");
    if let Some(arch_phase) = completed_phases
        .iter()
        .find(|p| p.definition.id == "architecture_technology")
    {
        let structure_decisions: Vec<_> = arch_phase
            .decisions
            .iter()
            .filter(|d| {
                d.summary.to_lowercase().contains("directory")
                    || d.summary.to_lowercase().contains("structure")
                    || d.summary.to_lowercase().contains("folder")
            })
            .collect();

        if !structure_decisions.is_empty() {
            content.push_str("```\n");
            for decision in structure_decisions {
                content.push_str(&format!("{}\n", decision.reasoning));
            }
            content.push_str("```\n\n");
        } else {
            content.push_str("```\n");
            content.push_str("# Directory structure to be determined based on project type\n");
            content.push_str("# See phase documents for module organization decisions\n");
            content.push_str("```\n\n");
        }
    } else {
        content.push_str("_Placeholder: Directory structure to be defined_\n\n");
    }

    // Reference to phase documents
    content.push_str("---\n\n");
    content.push_str("## Detailed Phase Documents\n\n");
    content.push_str("See the following domain specifications for complete requirements:\n\n");
    for phase in completed_phases {
        let filename = phase
            .document_path
            .file_name()
            .and_then(|f| f.to_str())
            .unwrap_or("unknown.md");
        content.push_str(&format!("- [{}]({})\n", phase.definition.name, filename));
    }
    content.push('\n');

    Ok(content)
}

// DRY:FN:write_agents_md
/// Writes the AGENTS.md file to disk.
pub fn write_agents_md(
    project_name: &str,
    completed_phases: &[CompletedPhase],
    feature_description: &str,
    output_dir: &Path,
) -> Result<std::path::PathBuf> {
    let content = generate_agents_md(project_name, completed_phases, feature_description)?;

    fs::create_dir_all(output_dir)
        .with_context(|| format!("Failed to create output dir {}", output_dir.display()))?;

    let path = output_dir.join("AGENTS.md");

    fs::write(&path, &content)
        .with_context(|| format!("Failed to write AGENTS.md to {}", path.display()))?;

    info!("Wrote AGENTS.md to {}", path.display());
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interview::phase_manager::InterviewPhaseDefinition;
    use crate::interview::state::{Decision, InterviewQA};
    use tempfile::TempDir;

    fn sample_phase() -> CompletedPhase {
        CompletedPhase {
            definition: InterviewPhaseDefinition {
                id: "scope_goals".to_string(),
                domain: "Scope & Goals".to_string(),
                name: "Scope & Goals".to_string(),
                description: "Project scope".to_string(),
                min_questions: 3,
                max_questions: 8,
            },
            decisions: vec![Decision {
                phase: "scope_goals".to_string(),
                summary: "Build CLI tool".to_string(),
                reasoning: "Simplest to start".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            }],
            qa_history: vec![InterviewQA {
                question: "What type?".to_string(),
                answer: "CLI".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            }],
            document_path: std::path::PathBuf::from("phase-01-scope-goals.md"),
        }
    }

    #[test]
    fn test_generate_agents_md() {
        let phases = vec![sample_phase()];
        let content = generate_agents_md("TestProject", &phases, "Build a CLI tool").unwrap();
        assert!(content.contains("# AGENTS.md - TestProject"));
        assert!(content.contains("## Overview"));
        assert!(content.contains("## Architecture Notes"));
        assert!(content.contains("## Codebase Patterns"));
        assert!(content.contains("## DO"));
        assert!(content.contains("## DON'T"));
        assert!(content.contains("## Testing"));
        assert!(content.contains("## Common Failure Modes"));
        assert!(content.contains("## Directory Structure"));
    }

    #[test]
    fn test_write_agents_md() {
        let dir = TempDir::new().unwrap();
        let phases = vec![sample_phase()];
        let path = write_agents_md("TestProject", &phases, "Test feature", dir.path()).unwrap();
        assert!(path.exists());
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.contains("# AGENTS.md - TestProject"));
        assert!(content.contains("## DO"));
        assert!(content.contains("## DON'T"));
    }
}
