//! Generates initial AGENTS.md from interview results.
//!
//! Creates a starter AGENTS.md file that guides AI agents through the project
//! based on the requirements gathered during the interview.

use anyhow::{Context, Result};
use log::info;
use std::fs;
use std::path::Path;

use super::document_writer::CompletedPhase;

/// Generates AGENTS.md content from completed interview phases.
pub fn generate_agents_md(
    project_name: &str,
    completed_phases: &[CompletedPhase],
    feature_description: &str,
) -> Result<String> {
    let mut content = String::new();

    // Header
    content.push_str(&format!(
        "# {project_name} - Agent Instructions\n\n\
         **Auto-generated from interview on {}**\n\n",
        chrono::Utc::now().format("%Y-%m-%d")
    ));

    // Project overview
    content.push_str(&format!(
        "## Project Overview\n\n\
         {feature_description}\n\n"
    ));

    // Key decisions summary
    content.push_str("## Key Technical Decisions\n\n");
    for phase in completed_phases {
        if !phase.decisions.is_empty() {
            content.push_str(&format!("### {}\n\n", phase.definition.name));
            for decision in &phase.decisions {
                content.push_str(&format!("- **{}**: {}\n", decision.summary, decision.reasoning));
            }
            content.push('\n');
        }
    }

    // Agent roles (stub - will be expanded)
    content.push_str(
        "## Agent Roles\n\n\
         ### Architect\n\
         - Review technical decisions in this document\n\
         - Design system architecture\n\
         - Define module boundaries\n\n\
         ### Developer\n\
         - Implement features according to specifications\n\
         - Follow coding standards\n\
         - Write unit tests\n\n\
         ### Tester\n\
         - Create comprehensive test suite\n\
         - Run automated tests\n\
         - Verify requirements coverage\n\n\
         ### Reviewer\n\
         - Review code changes\n\
         - Verify adherence to requirements\n\
         - Check for security issues\n\n",
    );

    // Development workflow
    content.push_str(
        "## Development Workflow\n\n\
         1. Review this document and all phase documents\n\
         2. Break down work into tasks\n\
         3. Create branches per the branching strategy\n\
         4. Implement and test each task\n\
         5. Create pull requests for review\n\
         6. Merge after approval\n\n",
    );

    // Reference to phase documents
    content.push_str("## Detailed Requirements\n\n");
    content.push_str("See the following phase documents for complete specifications:\n\n");
    for phase in completed_phases {
        let filename = phase
            .document_path
            .file_name()
            .and_then(|f| f.to_str())
            .unwrap_or("unknown.md");
        content.push_str(&format!("- [{}]({})\n", phase.definition.name, filename));
    }
    content.push('\n');

    // Testing requirements
    content.push_str(
        "## Testing Requirements\n\n\
         - All tests must be automatable (no manual testing)\n\
         - Use Playwright for E2E tests where applicable\n\
         - Aim for high coverage of critical paths\n\
         - Tests must be designed for AI agents to run\n\n",
    );

    // Success criteria
    content.push_str(
        "## Success Criteria\n\n\
         This project is complete when:\n\
         - All requirements are implemented\n\
         - All tests pass\n\
         - Code review is approved\n\
         - Documentation is complete\n\n",
    );

    Ok(content)
}

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
        assert!(content.contains("TestProject"));
        assert!(content.contains("Agent Instructions"));
        assert!(content.contains("Build CLI tool"));
        assert!(content.contains("Agent Roles"));
    }

    #[test]
    fn test_write_agents_md() {
        let dir = TempDir::new().unwrap();
        let phases = vec![sample_phase()];
        let path = write_agents_md("TestProject", &phases, "Test feature", dir.path()).unwrap();
        assert!(path.exists());
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.contains("TestProject"));
    }
}
