//! Prompt construction for platform iterations
//!
//! Builds structured prompts containing:
//! - Tier context and hierarchy
//! - Progress history from progress.txt
//! - Relevant AGENTS.md excerpts
//! - Acceptance criteria
//! - Previous iteration feedback

use crate::core::tier_node::TierTree;
use crate::types::*;
use anyhow::{anyhow, Result};
use std::fs;

/// Prompt builder for constructing iteration prompts
#[derive(Debug)]
pub struct PromptBuilder {
    /// Path to AGENTS.md
    agents_path: Option<std::path::PathBuf>,
    /// Path to progress.txt
    progress_path: Option<std::path::PathBuf>,
    /// Path to PRD
    prd_path: Option<std::path::PathBuf>,
}

impl PromptBuilder {
    /// Create new prompt builder
    pub fn new() -> Self {
        Self {
            agents_path: None,
            progress_path: None,
            prd_path: None,
        }
    }

    /// Set AGENTS.md path
    pub fn with_agents_path(mut self, path: std::path::PathBuf) -> Self {
        self.agents_path = Some(path);
        self
    }

    /// Set progress.txt path
    pub fn with_progress_path(mut self, path: std::path::PathBuf) -> Self {
        self.progress_path = Some(path);
        self
    }

    /// Set PRD path
    pub fn with_prd_path(mut self, path: std::path::PathBuf) -> Self {
        self.prd_path = Some(path);
        self
    }

    /// Build prompt for iteration
    pub fn build_prompt(
        &self,
        tree: &TierTree,
        tier_id: &str,
        iteration: u32,
        previous_feedback: Option<&str>,
    ) -> Result<String> {
        let node = tree
            .find_by_id(tier_id)
            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

        let mut prompt = String::new();

        // Header
        prompt.push_str(&format!(
            "# RWM Puppet Master - Iteration {}\n\n",
            iteration
        ));

        // Context section
        prompt.push_str("## Context\n\n");
        prompt.push_str(&format!("**Tier**: {}\n", tree.get_path_string(tier_id)));
        prompt.push_str(&format!("**Type**: {:?}\n", node.tier_type));
        prompt.push_str(&format!("**Iteration**: {}/{}\n\n", iteration, node.state_machine.max_iterations()));

        // Current task section
        prompt.push_str("## Current Task\n\n");
        prompt.push_str(&format!("### {}\n\n", node.title));
        prompt.push_str(&format!("{}\n\n", node.description));

        // Acceptance criteria
        if !node.acceptance_criteria.is_empty() {
            prompt.push_str("### Acceptance Criteria\n\n");
            for criterion in &node.acceptance_criteria {
                prompt.push_str(&format!("- {}\n", criterion));
            }
            prompt.push_str("\n");
        }

        // Required files
        if !node.required_files.is_empty() {
            prompt.push_str("### Required Files\n\n");
            for file in &node.required_files {
                prompt.push_str(&format!("- `{}`\n", file));
            }
            prompt.push_str("\n");
        }

        // Dependencies
        if !node.dependencies.is_empty() {
            prompt.push_str("### Dependencies\n\n");
            for dep in &node.dependencies {
                prompt.push_str(&format!("- {}\n", dep));
            }
            prompt.push_str("\n");
        }

        // Previous iteration feedback
        if let Some(feedback) = previous_feedback {
            prompt.push_str("## Previous Iteration Feedback\n\n");
            prompt.push_str(feedback);
            prompt.push_str("\n\n");
        }

        // Progress history
        if let Some(progress) = self.load_progress_context()? {
            prompt.push_str("## Progress History\n\n");
            prompt.push_str(&progress);
            prompt.push_str("\n\n");
        }

        // AGENTS.md excerpts
        if let Some(agents_content) = self.load_agents_excerpts()? {
            prompt.push_str("## Agent Guidelines\n\n");
            prompt.push_str(&agents_content);
            prompt.push_str("\n\n");
        }

        // Instructions
        prompt.push_str("## Instructions\n\n");
        prompt.push_str("1. Review the current task, acceptance criteria, and context above\n");
        prompt.push_str("2. Complete the work according to the requirements\n");
        prompt.push_str("3. Follow the agent guidelines and best practices\n");
        prompt.push_str("4. When complete, signal completion with: `<ralph>COMPLETE</ralph>`\n");
        prompt.push_str("5. If you are stuck/blocked, signal with: `<ralph>GUTTER</ralph>`\n\n");

        // Working directory reminder
        prompt.push_str("## Important Notes\n\n");
        prompt.push_str("- All file operations should be relative to the workspace root\n");
        prompt.push_str("- Commit your changes with descriptive commit messages\n");
        prompt.push_str("- Run tests to verify your work\n");
        prompt.push_str(&format!("- This is iteration {}/{}, use your iterations wisely\n\n", iteration, node.state_machine.max_iterations()));

        Ok(prompt)
    }

    /// Build simple prompt without full context (for testing or minimal mode)
    pub fn build_simple_prompt(
        &self,
        tier_title: &str,
        tier_description: &str,
        acceptance_criteria: &[String],
    ) -> String {
        let mut prompt = String::new();

        prompt.push_str("# Task\n\n");
        prompt.push_str(&format!("## {}\n\n", tier_title));
        prompt.push_str(&format!("{}\n\n", tier_description));

        if !acceptance_criteria.is_empty() {
            prompt.push_str("## Acceptance Criteria\n\n");
            for criterion in acceptance_criteria {
                prompt.push_str(&format!("- {}\n", criterion));
            }
            prompt.push_str("\n");
        }

        prompt.push_str("## Instructions\n\n");
        prompt.push_str("Complete the task above and signal completion with: `<ralph>COMPLETE</ralph>`\n");

        prompt
    }

    /// Load progress.txt content (last N entries)
    fn load_progress_context(&self) -> Result<Option<String>> {
        if let Some(path) = &self.progress_path {
            if path.exists() {
                let content = fs::read_to_string(path)?;
                // Get last 20 lines
                let lines: Vec<&str> = content.lines().collect();
                let start = lines.len().saturating_sub(20);
                let excerpt = lines[start..].join("\n");
                return Ok(Some(excerpt));
            }
        }
        Ok(None)
    }

    /// Load relevant AGENTS.md excerpts
    fn load_agents_excerpts(&self) -> Result<Option<String>> {
        if let Some(path) = &self.agents_path {
            if path.exists() {
                let content = fs::read_to_string(path)?;
                
                // Extract key sections
                let mut excerpts = Vec::new();

                // Extract DO and DON'T sections
                if let Some(do_section) = extract_section(&content, "## DO") {
                    excerpts.push(format!("### DO\n{}", do_section));
                }

                if let Some(dont_section) = extract_section(&content, "## DON'T") {
                    excerpts.push(format!("### DON'T\n{}", dont_section));
                }

                // Extract common failure patterns
                if let Some(failures) = extract_section(&content, "## Common Failure Patterns") {
                    excerpts.push(format!("### Common Failure Patterns\n{}", failures));
                }

                if !excerpts.is_empty() {
                    return Ok(Some(excerpts.join("\n\n")));
                }
            }
        }
        Ok(None)
    }

    /// Build gate validation prompt
    pub fn build_gate_prompt(
        &self,
        tree: &TierTree,
        tier_id: &str,
        acceptance_criteria: &[String],
    ) -> Result<String> {
        let _node = tree
            .find_by_id(tier_id)
            .ok_or_else(|| anyhow!("Tier {} not found", tier_id))?;

        let mut prompt = String::new();

        prompt.push_str("# Gate Validation\n\n");
        prompt.push_str(&format!("**Tier**: {}\n\n", tree.get_path_string(tier_id)));

        prompt.push_str("## Validation Requirements\n\n");

        if !acceptance_criteria.is_empty() {
            prompt.push_str("### Acceptance Criteria\n\n");
            for criterion in acceptance_criteria {
                prompt.push_str(&format!("- {}\n", criterion));
            }
            prompt.push_str("\n");
        }

        prompt.push_str("## Instructions\n\n");
        prompt.push_str("Validate that all requirements above are met. ");
        prompt.push_str("Signal `PASS` if all validations pass, or `FAIL - [reason]` if any fail.\n");

        Ok(prompt)
    }
}

impl Default for PromptBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Extract a section from markdown content
fn extract_section(content: &str, header: &str) -> Option<String> {
    let lines: Vec<&str> = content.lines().collect();
    
    // Find start of section
    let start = lines.iter().position(|line| line.starts_with(header))?;
    
    // Find end of section (next ## header or end of file)
    let end = lines[start + 1..]
        .iter()
        .position(|line| line.starts_with("##"))
        .map(|pos| start + 1 + pos)
        .unwrap_or(lines.len());

    // Extract section content
    let section_lines = &lines[start + 1..end];
    let section_text = section_lines.join("\n").trim().to_string();

    if section_text.is_empty() {
        None
    } else {
        Some(section_text)
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::tier_node::TierTree;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_build_simple_prompt() {
        let builder = PromptBuilder::new();
        let prompt = builder.build_simple_prompt(
            "Test Task",
            "This is a test task",
            &vec!["Must pass tests".to_string(), "Must be documented".to_string()],
        );

        assert!(prompt.contains("Test Task"));
        assert!(prompt.contains("This is a test task"));
        assert!(prompt.contains("Must pass tests"));
        assert!(prompt.contains("<ralph>COMPLETE</ralph>"));
    }

    #[test]
    fn test_extract_section() {
        let content = r#"
# Header

## DO

- Follow best practices
- Write tests

## DON'T

- Skip testing
- Commit secrets

## Other Section

Some content
"#;

        let do_section = extract_section(content, "## DO").unwrap();
        assert!(do_section.contains("Follow best practices"));
        assert!(do_section.contains("Write tests"));

        let dont_section = extract_section(content, "## DON'T").unwrap();
        assert!(dont_section.contains("Skip testing"));
        assert!(dont_section.contains("Commit secrets"));
    }

    #[test]
    fn test_extract_section_not_found() {
        let content = "# Header\n\nSome content";
        let section = extract_section(content, "## Missing");
        assert!(section.is_none());
    }

    #[test]
    fn test_build_prompt_with_tree() -> Result<()> {
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1".to_string(),
            "First phase".to_string(),
            None,
            3,
        )?;

        tree.add_node(
            "1.1".to_string(),
            TierType::Task,
            "Task 1.1".to_string(),
            "First task".to_string(),
            Some("1".to_string()),
            3,
        )?;

        tree.add_node(
            "1.1.1".to_string(),
            TierType::Subtask,
            "Subtask 1.1.1".to_string(),
            "First subtask".to_string(),
            Some("1.1".to_string()),
            3,
        )?;

        let builder = PromptBuilder::new();
        let prompt = builder.build_prompt(&tree, "1.1.1", 1, None)?;

        assert!(prompt.contains("Iteration 1"));
        assert!(prompt.contains("Subtask 1.1.1"));
        assert!(prompt.contains("First subtask"));
        assert!(prompt.contains("Phase 1 > Task 1.1 > Subtask 1.1.1"));

        Ok(())
    }

    #[test]
    fn test_build_prompt_with_feedback() -> Result<()> {
        let mut tree = TierTree::new();
        tree.add_node(
            "1.1.1".to_string(),
            TierType::Subtask,
            "Test".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        let builder = PromptBuilder::new();
        let feedback = "Please add more tests";
        let prompt = builder.build_prompt(&tree, "1.1.1", 2, Some(feedback))?;

        assert!(prompt.contains("Previous Iteration Feedback"));
        assert!(prompt.contains(feedback));

        Ok(())
    }
}
