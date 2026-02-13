//! AI pre-research engine for interview questions.
//!
//! Performs research on topics before and after asking questions to ensure
//! the AI has relevant context and to validate user answers.

use anyhow::{Context as AnyhowContext, Result};
use log::{debug, info, warn};
use std::path::{Path, PathBuf};

use crate::platforms::get_runner;
use crate::types::{ExecutionRequest, Platform};

/// Types of research that can be performed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResearchType {
    /// Research before asking questions (topic exploration).
    PreQuestion,
    /// Research after receiving answers (validation and deepening).
    PostAnswer,
}

impl std::fmt::Display for ResearchType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::PreQuestion => write!(f, "pre-question"),
            Self::PostAnswer => write!(f, "post-answer"),
        }
    }
}

/// Configuration for research operations.
#[derive(Debug, Clone)]
pub struct ResearchConfig {
    /// Whether research is enabled.
    pub enabled: bool,
    /// Maximum time to spend on research (seconds).
    pub max_duration_secs: u64,
    /// Topics to focus on.
    pub focus_topics: Vec<String>,
    /// Platform to use for research AI calls.
    pub platform: Platform,
    /// Model to use for research AI calls.
    pub model: String,
}

impl Default for ResearchConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_duration_secs: 30,
            focus_topics: Vec::new(),
            platform: Platform::Cursor,
            model: "gpt-4".to_string(),
        }
    }
}

/// Result of a research operation.
#[derive(Debug, Clone)]
pub struct ResearchResult {
    /// The research type that was performed.
    pub research_type: ResearchType,
    /// Findings from the research (markdown formatted).
    pub findings: String,
    /// Sources consulted (URLs, docs, etc.).
    pub sources: Vec<String>,
    /// Whether the research was successful.
    pub success: bool,
}

/// Engine for performing AI-driven research.
#[derive(Clone)]
pub struct ResearchEngine {
    config: ResearchConfig,
    research_dir: PathBuf,
}

impl ResearchEngine {
    /// Creates a new research engine with the given configuration.
    pub fn new(config: ResearchConfig, base_dir: &Path) -> Self {
        let research_dir = base_dir.join(".puppet-master").join("research");
        Self { config, research_dir }
    }

    /// Ensures the research directory exists.
    fn ensure_research_dir(&self) -> Result<()> {
        if !self.research_dir.exists() {
            std::fs::create_dir_all(&self.research_dir)
                .context("Failed to create research directory")?;
        }
        Ok(())
    }

    /// Generates the filename for saving research results.
    fn research_filename(&self, phase_index: usize, phase_id: &str, research_type: ResearchType) -> String {
        format!(
            "phase-{:02}-{}-{}.md",
            phase_index + 1,
            phase_id,
            research_type
        )
    }

    /// Saves research results to disk.
    pub fn save_research(
        &self,
        phase_index: usize,
        phase_id: &str,
        result: &ResearchResult,
    ) -> Result<PathBuf> {
        self.ensure_research_dir()?;
        
        let filename = self.research_filename(phase_index, phase_id, result.research_type);
        let path = self.research_dir.join(&filename);
        
        let mut content = format!(
            "# Research: {} (Phase {}: {})\n\n",
            result.research_type,
            phase_index + 1,
            phase_id
        );
        content.push_str("## Findings\n\n");
        content.push_str(&result.findings);
        content.push_str("\n\n## Sources\n\n");
        for source in &result.sources {
            content.push_str(&format!("- {}\n", source));
        }
        
        std::fs::write(&path, content)
            .with_context(|| format!("Failed to write research to {}", path.display()))?;
        
        info!("Saved research to: {}", path.display());
        Ok(path)
    }

    /// Loads the most recent research notes for a given phase.
    pub fn load_latest_research(&self, phase_index: usize, phase_id: &str) -> Result<String> {
        let pre_filename = self.research_filename(phase_index, phase_id, ResearchType::PreQuestion);
        let post_filename = self.research_filename(phase_index, phase_id, ResearchType::PostAnswer);
        
        let mut combined = String::new();
        
        // Load pre-question research if available
        let pre_path = self.research_dir.join(&pre_filename);
        if pre_path.exists() {
            match std::fs::read_to_string(&pre_path) {
                Ok(content) => {
                    combined.push_str(&content);
                    combined.push_str("\n\n---\n\n");
                }
                Err(e) => {
                    warn!("Failed to load pre-question research from {}: {}", pre_path.display(), e);
                }
            }
        }
        
        // Load post-answer research if available
        let post_path = self.research_dir.join(&post_filename);
        if post_path.exists() {
            match std::fs::read_to_string(&post_path) {
                Ok(content) => {
                    combined.push_str(&content);
                }
                Err(e) => {
                    warn!("Failed to load post-answer research from {}: {}", post_path.display(), e);
                }
            }
        }
        
        Ok(combined)
    }

    /// Performs pre-question research on a topic.
    ///
    /// Uses AI to research the topic, generate insights, and prepare
    /// context for the interviewer.
    pub async fn research_pre_question(
        &self,
        topic: &str,
        context: &str,
        working_dir: &Path,
    ) -> Result<ResearchResult> {
        if !self.config.enabled {
            return Ok(ResearchResult {
                research_type: ResearchType::PreQuestion,
                findings: String::new(),
                sources: Vec::new(),
                success: false,
            });
        }

        info!("Starting pre-question research on: {}", topic);
        debug!("Research context: {} chars", context.len());

        let research_prompt = self.build_pre_question_prompt(topic, context);
        
        match self.execute_research_ai_call(&research_prompt, working_dir).await {
            Ok(findings) => {
                Ok(ResearchResult {
                    research_type: ResearchType::PreQuestion,
                    findings,
                    sources: vec![format!("AI Research via {}", self.config.platform)],
                    success: true,
                })
            }
            Err(e) => {
                warn!("Pre-question research failed: {}", e);
                Ok(ResearchResult {
                    research_type: ResearchType::PreQuestion,
                    findings: format!("Research could not be completed: {}", e),
                    sources: Vec::new(),
                    success: false,
                })
            }
        }
    }

    /// Performs post-answer research to validate and deepen understanding.
    ///
    /// Uses AI to verify user answers, check for inconsistencies, and
    /// identify potential issues.
    pub async fn research_post_answer(
        &self,
        question: &str,
        answer: &str,
        context: &str,
        working_dir: &Path,
    ) -> Result<ResearchResult> {
        if !self.config.enabled {
            return Ok(ResearchResult {
                research_type: ResearchType::PostAnswer,
                findings: String::new(),
                sources: Vec::new(),
                success: false,
            });
        }

        info!("Starting post-answer research for question: {}", question);
        debug!("Answer: {} chars", answer.len());
        debug!("Context: {} chars", context.len());

        let research_prompt = self.build_post_answer_prompt(question, answer, context);
        
        match self.execute_research_ai_call(&research_prompt, working_dir).await {
            Ok(findings) => {
                Ok(ResearchResult {
                    research_type: ResearchType::PostAnswer,
                    findings,
                    sources: vec![format!("AI Validation via {}", self.config.platform)],
                    success: true,
                })
            }
            Err(e) => {
                warn!("Post-answer research failed: {}", e);
                Ok(ResearchResult {
                    research_type: ResearchType::PostAnswer,
                    findings: format!("Validation could not be completed: {}", e),
                    sources: Vec::new(),
                    success: false,
                })
            }
        }
    }

    /// Builds the AI prompt for pre-question research.
    fn build_pre_question_prompt(&self, topic: &str, context: &str) -> String {
        format!(
            r#"You are a technical research assistant helping prepare context for an interview about software requirements.

**Current Interview Topic:** {}

**Interview Context So Far:**
{}

**Your Task:**
Conduct focused research to help the interviewer ask informed questions about this topic. Provide:

1. **Current Best Practices** - What are the established patterns and approaches for this topic?
2. **Common Technologies** - What libraries, frameworks, or tools are typically used? Include version recommendations.
3. **Common Pitfalls** - What mistakes do developers commonly make in this area?
4. **Key Considerations** - What important questions should be asked to understand the user's needs?
5. **Technology Compatibility** - Based on choices made earlier in the interview (if any), what technologies work well together?

Keep your research concise, actionable, and focused on helping the interviewer ask better questions.
Format your response as markdown with clear sections."#,
            topic, context
        )
    }

    /// Builds the AI prompt for post-answer validation research.
    fn build_post_answer_prompt(&self, question: &str, answer: &str, context: &str) -> String {
        format!(
            r#"You are a technical validation assistant reviewing answers in a software requirements interview.

**Question Asked:** {}

**User's Answer:** {}

**Interview Context:**
{}

**Your Task:**
Validate and analyze the user's answer. Provide:

1. **Technical Feasibility** - Is the described approach technically sound? Are there any obvious red flags?
2. **Version/Compatibility Check** - If specific versions or technologies were mentioned, are they compatible?
3. **Potential Issues** - What problems or challenges might arise with this approach?
4. **Best Practice Alignment** - Does this align with current best practices?
5. **Follow-Up Recommendations** - What additional questions should be asked to clarify or expand on this answer?

Be constructive and helpful. Focus on identifying issues early rather than after implementation.
Format your response as markdown with clear sections."#,
            question, answer, context
        )
    }

    /// Executes an AI research call using the configured platform.
    async fn execute_research_ai_call(&self, prompt: &str, working_dir: &Path) -> Result<String> {
        let request = ExecutionRequest::new(
            self.config.platform,
            self.config.model.clone(),
            prompt.to_string(),
            working_dir.to_path_buf(),
        );

        let runner = get_runner(self.config.platform)
            .await
            .context("Failed to get platform runner for research")?;

        let result = runner
            .execute(&request)
            .await
            .context("Failed to execute research AI call")?;

        if result.success {
            Ok(result.output.unwrap_or_default())
        } else {
            anyhow::bail!(
                "Research AI call failed: {}",
                result.error_message.unwrap_or_else(|| "Unknown error".to_string())
            )
        }
    }

    /// Updates the research configuration.
    pub fn set_config(&mut self, config: ResearchConfig) {
        self.config = config;
    }

    /// Returns a reference to the current configuration.
    pub fn config(&self) -> &ResearchConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[tokio::test]
    async fn test_disabled_research() {
        let temp_dir = env::temp_dir().join("puppet-master-research-test");
        let config = ResearchConfig {
            enabled: false,
            ..Default::default()
        };
        let engine = ResearchEngine::new(config, &temp_dir);
        let result = engine
            .research_pre_question("topic", "context", &temp_dir)
            .await
            .unwrap();
        assert!(!result.success);
        assert!(result.findings.is_empty());
    }

    #[test]
    fn test_research_filename_generation() {
        let temp_dir = env::temp_dir().join("puppet-master-research-test");
        let engine = ResearchEngine::new(ResearchConfig::default(), &temp_dir);
        
        let pre_filename = engine.research_filename(0, "scope-goals", ResearchType::PreQuestion);
        assert_eq!(pre_filename, "phase-01-scope-goals-pre-question.md");
        
        let post_filename = engine.research_filename(5, "testing", ResearchType::PostAnswer);
        assert_eq!(post_filename, "phase-06-testing-post-answer.md");
    }

    #[test]
    fn test_save_and_load_research() -> Result<()> {
        let temp_dir = env::temp_dir().join("puppet-master-research-test-save-load");
        std::fs::create_dir_all(&temp_dir)?;
        
        let engine = ResearchEngine::new(ResearchConfig::default(), &temp_dir);
        
        let result = ResearchResult {
            research_type: ResearchType::PreQuestion,
            findings: "Test research findings".to_string(),
            sources: vec!["Test source".to_string()],
            success: true,
        };
        
        // Save research
        let path = engine.save_research(0, "test-phase", &result)?;
        assert!(path.exists());
        
        // Load research
        let loaded = engine.load_latest_research(0, "test-phase")?;
        assert!(loaded.contains("Test research findings"));
        assert!(loaded.contains("Test source"));
        
        // Clean up
        std::fs::remove_dir_all(&temp_dir)?;
        
        Ok(())
    }

    #[test]
    fn test_prompt_building() {
        let temp_dir = env::temp_dir().join("puppet-master-research-test");
        let engine = ResearchEngine::new(ResearchConfig::default(), &temp_dir);
        
        let pre_prompt = engine.build_pre_question_prompt("Testing Strategy", "Interview context");
        assert!(pre_prompt.contains("Testing Strategy"));
        assert!(pre_prompt.contains("Interview context"));
        assert!(pre_prompt.contains("Best Practices"));
        
        let post_prompt = engine.build_post_answer_prompt(
            "What testing framework?",
            "Playwright",
            "E2E testing"
        );
        assert!(post_prompt.contains("What testing framework?"));
        assert!(post_prompt.contains("Playwright"));
        assert!(post_prompt.contains("E2E testing"));
        assert!(post_prompt.contains("Technical Feasibility"));
    }
}
