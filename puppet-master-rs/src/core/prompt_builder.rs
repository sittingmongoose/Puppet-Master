//! Prompt construction for platform iterations
//!
//! Builds structured prompts containing:
//! - Tier context and hierarchy
//! - Progress history from progress.txt
//! - Relevant AGENTS.md excerpts
//! - Acceptance criteria
//! - Previous iteration feedback

use crate::core::tier_node::TierTree;
use anyhow::{Result, anyhow};
use std::fs;

// DRY:DATA:PromptBuilder
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
    // DRY:FN:new
    /// Create new prompt builder
    pub fn new() -> Self {
        Self {
            agents_path: None,
            progress_path: None,
            prd_path: None,
        }
    }
    // DRY:FN:with_agents_path

    /// Set AGENTS.md path
    pub fn with_agents_path(mut self, path: std::path::PathBuf) -> Self {
        self.agents_path = Some(path);
        self
    }
    // DRY:FN:with_progress_path

    /// Set progress.txt path
    pub fn with_progress_path(mut self, path: std::path::PathBuf) -> Self {
        self.progress_path = Some(path);
        self
    }
    // DRY:FN:with_prd_path

    /// Set PRD path
    pub fn with_prd_path(mut self, path: std::path::PathBuf) -> Self {
        self.prd_path = Some(path);
        self
    }
    // DRY:FN:build_prompt

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
        prompt.push_str(&format!(
            "**Iteration**: {}/{}\n\n",
            iteration,
            node.state_machine.max_iterations()
        ));

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

        // Interview outputs (master requirements + test strategy)
        if let Some(outputs) = self.load_interview_outputs()? {
            prompt.push_str("## Interview Outputs\n\n");
            prompt.push_str(&outputs);
            prompt.push_str("\n\n");
        }

        // Instructions
        prompt.push_str("## Instructions\n\n");
        prompt.push_str("1. Review the current task, acceptance criteria, and context above\n");
        prompt.push_str("2. Complete the work according to the requirements\n");
        prompt.push_str("3. Follow the agent guidelines and best practices\n");
        prompt.push_str("4. When complete, signal completion with: `<ralph>COMPLETE</ralph>`\n");
        prompt.push_str("5. If you are stuck/blocked, signal with: `<ralph>GUTTER</ralph>`\n");
        prompt.push_str("6. After significant work, provide learnings in this format:\n\n");
        prompt.push_str("```agents-update\n");
        prompt.push_str("PATTERN: <successful pattern discovered>\n");
        prompt.push_str("FAILURE: <failure mode to avoid>\n");
        prompt.push_str("DO: <best practice to follow>\n");
        prompt.push_str("DONT: <anti-pattern to avoid>\n");
        prompt.push_str("```\n\n");

        // Working directory reminder
        prompt.push_str("## Important Notes\n\n");
        prompt.push_str("- All file operations should be relative to the workspace root\n");
        prompt.push_str("- Commit your changes with descriptive commit messages\n");
        prompt.push_str("- Run tests to verify your work\n");
        prompt.push_str(&format!(
            "- This is iteration {}/{}, use your iterations wisely\n\n",
            iteration,
            node.state_machine.max_iterations()
        ));

        Ok(prompt)
    }
    // DRY:FN:build_simple_prompt

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
        prompt.push_str(
            "Complete the task above and signal completion with: `<ralph>COMPLETE</ralph>`\n",
        );

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

    /// Load interview output documents (master requirements + requirements-complete + test strategy).
    fn load_interview_outputs(&self) -> Result<Option<String>> {
        let Some(agents_path) = &self.agents_path else {
            return Ok(None);
        };
        let Some(workspace) = agents_path.parent() else {
            return Ok(None);
        };

        let requirements_path = workspace
            .join(".puppet-master")
            .join("requirements")
            .join("master_requirements.md");
        let requirements_complete_path = workspace
            .join(".puppet-master")
            .join("interview")
            .join("requirements-complete.md");
        
        // Try interview/ subdirectory first (current location), then fall back to root .puppet-master/ (legacy)
        let test_strategy_path_interview = workspace
            .join(".puppet-master")
            .join("interview")
            .join("test-strategy.md");
        let test_strategy_path_legacy = workspace.join(".puppet-master").join("test-strategy.md");
        let test_strategy_path = if test_strategy_path_interview.exists() {
            test_strategy_path_interview
        } else {
            test_strategy_path_legacy
        };

        let read_excerpt = |path: &std::path::Path, max_chars: usize| -> Result<String> {
            let mut content = fs::read_to_string(path)?;
            if content.len() > max_chars {
                content.truncate(max_chars);
                content.push_str("\n\n...(truncated)...\n");
            }
            Ok(content)
        };

        let mut sections = Vec::new();

        if requirements_path.exists() {
            let excerpt = read_excerpt(&requirements_path, 6000)?;
            sections.push(format!(
                "### Master Requirements (excerpt from `{}`)\n\n{}\n",
                requirements_path.display(),
                excerpt
            ));
        }

        if requirements_complete_path.exists() {
            let excerpt = read_excerpt(&requirements_complete_path, 6000)?;
            sections.push(format!(
                "### Interview Requirements Complete (excerpt from `{}`)\n\n{}\n",
                requirements_complete_path.display(),
                excerpt
            ));
        }

        if test_strategy_path.exists() {
            let excerpt = read_excerpt(&test_strategy_path, 4000)?;
            sections.push(format!(
                "### Test Strategy (excerpt from `{}`)\n\n{}\n",
                test_strategy_path.display(),
                excerpt
            ));
        }

        if sections.is_empty() {
            Ok(None)
        } else {
            Ok(Some(sections.join("\n")))
        }
    }
    // DRY:FN:build_gate_prompt

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
        prompt
            .push_str("Signal `PASS` if all validations pass, or `FAIL - [reason]` if any fail.\n");

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
    use crate::types::TierType;

    #[test]
    fn test_build_simple_prompt() {
        let builder = PromptBuilder::new();
        let prompt = builder.build_simple_prompt(
            "Test Task",
            "This is a test task",
            &vec![
                "Must pass tests".to_string(),
                "Must be documented".to_string(),
            ],
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

    #[test]
    fn test_load_interview_outputs() -> Result<()> {
        use std::io::Write;
        use tempfile::TempDir;

        // Create temporary directory structure
        let temp_dir = TempDir::new()?;
        let workspace = temp_dir.path();

        // Create .puppet-master directory structure
        let puppet_master_dir = workspace.join(".puppet-master");
        fs::create_dir(&puppet_master_dir)?;

        let requirements_dir = puppet_master_dir.join("requirements");
        fs::create_dir(&requirements_dir)?;

        let interview_dir = puppet_master_dir.join("interview");
        fs::create_dir(&interview_dir)?;

        // Create AGENTS.md in workspace
        let agents_path = workspace.join("AGENTS.md");
        let mut agents_file = fs::File::create(&agents_path)?;
        agents_file.write_all(b"# Test Agents\n")?;

        // Create master_requirements.md
        let master_req_path = requirements_dir.join("master_requirements.md");
        let mut master_req_file = fs::File::create(&master_req_path)?;
        master_req_file
            .write_all(b"# Master Requirements\nThis is the master requirements document.\n")?;

        // Create requirements-complete.md
        let req_complete_path = interview_dir.join("requirements-complete.md");
        let mut req_complete_file = fs::File::create(&req_complete_path)?;
        req_complete_file.write_all(
            b"# Requirements Complete\nThis is the interview requirements complete document.\n",
        )?;

        // Create test-strategy.md in interview/ subdirectory (preferred location)
        let test_strategy_path = interview_dir.join("test-strategy.md");
        let mut test_strategy_file = fs::File::create(&test_strategy_path)?;
        test_strategy_file.write_all(b"# Test Strategy\nThis is the test strategy document.\n")?;

        // Create prompt builder with agents path
        let builder = PromptBuilder::new().with_agents_path(agents_path);

        // Create a simple tree for testing
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Task,
            "Test Task".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        // Build prompt and check that all interview outputs are included
        let prompt = builder.build_prompt(&tree, "1", 1, None)?;

        // Verify all three documents are referenced
        assert!(prompt.contains("Interview Outputs"));
        assert!(prompt.contains("Master Requirements"));
        assert!(prompt.contains("master requirements document"));
        assert!(prompt.contains("Interview Requirements Complete"));
        assert!(prompt.contains("interview requirements complete document"));
        assert!(prompt.contains("Test Strategy"));
        assert!(prompt.contains("test strategy document"));

        Ok(())
    }

    #[test]
    fn test_load_interview_outputs_partial() -> Result<()> {
        use tempfile::TempDir;

        // Create temporary directory structure with only some files
        let temp_dir = TempDir::new()?;
        let workspace = temp_dir.path();

        // Create .puppet-master directory structure
        let puppet_master_dir = workspace.join(".puppet-master");
        fs::create_dir(&puppet_master_dir)?;

        let interview_dir = puppet_master_dir.join("interview");
        fs::create_dir(&interview_dir)?;

        // Create AGENTS.md in workspace
        let agents_path = workspace.join("AGENTS.md");
        fs::write(&agents_path, b"# Test Agents\n")?;

        // Create only requirements-complete.md (not other files)
        let req_complete_path = interview_dir.join("requirements-complete.md");
        fs::write(
            &req_complete_path,
            b"# Requirements Complete\nPartial test.\n",
        )?;

        // Create prompt builder with agents path
        let builder = PromptBuilder::new().with_agents_path(agents_path);

        // Create a simple tree for testing
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Task,
            "Test Task".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        // Build prompt and check that only available document is included
        let prompt = builder.build_prompt(&tree, "1", 1, None)?;

        // Verify only the existing document is referenced
        assert!(prompt.contains("Interview Outputs"));
        assert!(prompt.contains("Interview Requirements Complete"));
        assert!(prompt.contains("Partial test"));

        // Verify missing documents are not referenced
        assert!(!prompt.contains("Master Requirements"));
        assert!(!prompt.contains("Test Strategy"));

        Ok(())
    }

    #[test]
    fn test_load_interview_outputs_none() -> Result<()> {
        use tempfile::TempDir;

        // Create temporary directory structure with no interview outputs
        let temp_dir = TempDir::new()?;
        let workspace = temp_dir.path();

        // Create AGENTS.md in workspace
        let agents_path = workspace.join("AGENTS.md");
        fs::write(&agents_path, b"# Test Agents\n")?;

        // Create prompt builder with agents path
        let builder = PromptBuilder::new().with_agents_path(agents_path);

        // Create a simple tree for testing
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Task,
            "Test Task".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        // Build prompt - should not include Interview Outputs section
        let prompt = builder.build_prompt(&tree, "1", 1, None)?;

        // Verify Interview Outputs section is not present when no files exist
        assert!(!prompt.contains("Interview Outputs"));
        assert!(!prompt.contains("Master Requirements"));
        assert!(!prompt.contains("Requirements Complete"));
        assert!(!prompt.contains("Test Strategy"));

        // But the prompt should still be valid with other sections
        assert!(prompt.contains("Test Task"));
        assert!(prompt.contains("Instructions"));

        Ok(())
    }

    #[test]
    fn test_load_interview_outputs_truncation() -> Result<()> {
        use tempfile::TempDir;

        // Create temporary directory structure
        let temp_dir = TempDir::new()?;
        let workspace = temp_dir.path();

        // Create .puppet-master directory structure
        let puppet_master_dir = workspace.join(".puppet-master");
        fs::create_dir(&puppet_master_dir)?;

        let interview_dir = puppet_master_dir.join("interview");
        fs::create_dir(&interview_dir)?;

        // Create AGENTS.md in workspace
        let agents_path = workspace.join("AGENTS.md");
        fs::write(&agents_path, b"# Test Agents\n")?;

        // Create requirements-complete.md with content exceeding 6000 chars
        let req_complete_path = interview_dir.join("requirements-complete.md");
        let long_content = "x".repeat(7000);
        fs::write(
            &req_complete_path,
            format!("# Requirements Complete\n{}", long_content),
        )?;

        // Create prompt builder with agents path
        let builder = PromptBuilder::new().with_agents_path(agents_path);

        // Create a simple tree for testing
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Task,
            "Test Task".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        // Build prompt and verify truncation
        let prompt = builder.build_prompt(&tree, "1", 1, None)?;

        // Verify truncation marker is present
        assert!(prompt.contains("...(truncated)..."));
        assert!(prompt.contains("Interview Requirements Complete"));

        Ok(())
    }

    #[test]
    fn test_load_interview_outputs_test_strategy_fallback() -> Result<()> {
        use tempfile::TempDir;

        // Create temporary directory structure
        let temp_dir = TempDir::new()?;
        let workspace = temp_dir.path();

        // Create .puppet-master directory structure
        let puppet_master_dir = workspace.join(".puppet-master");
        fs::create_dir(&puppet_master_dir)?;

        let interview_dir = puppet_master_dir.join("interview");
        fs::create_dir(&interview_dir)?;

        // Create AGENTS.md in workspace
        let agents_path = workspace.join("AGENTS.md");
        fs::write(&agents_path, b"# Test Agents\n")?;

        // Create test-strategy.md in LEGACY location (root .puppet-master/)
        let test_strategy_legacy_path = puppet_master_dir.join("test-strategy.md");
        fs::write(
            &test_strategy_legacy_path,
            b"# Test Strategy\nThis is the LEGACY test strategy document.\n",
        )?;

        // Create prompt builder with agents path
        let builder = PromptBuilder::new().with_agents_path(agents_path.clone());

        // Create a simple tree for testing
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Task,
            "Test Task".to_string(),
            "Test description".to_string(),
            None,
            3,
        )?;

        // Build prompt and verify legacy path is used
        let prompt = builder.build_prompt(&tree, "1", 1, None)?;

        // Verify test strategy from legacy location is included
        assert!(prompt.contains("Interview Outputs"));
        assert!(prompt.contains("Test Strategy"));
        assert!(prompt.contains("LEGACY test strategy document"));

        // Now create the preferred location and verify it takes precedence
        let test_strategy_interview_path = interview_dir.join("test-strategy.md");
        fs::write(
            &test_strategy_interview_path,
            b"# Test Strategy\nThis is the PREFERRED test strategy document.\n",
        )?;

        // Create a new builder to re-evaluate paths
        let builder2 = PromptBuilder::new().with_agents_path(agents_path);
        let prompt2 = builder2.build_prompt(&tree, "1", 1, None)?;

        // Verify preferred path is now used (not legacy)
        assert!(prompt2.contains("Interview Outputs"));
        assert!(prompt2.contains("Test Strategy"));
        assert!(prompt2.contains("PREFERRED test strategy document"));
        assert!(!prompt2.contains("LEGACY test strategy document"));

        Ok(())
    }
}
