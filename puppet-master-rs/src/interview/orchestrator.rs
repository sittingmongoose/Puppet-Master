//! Interview lifecycle orchestrator.
//!
//! Adapted from LISA's `InterviewOrchestrator`, enhanced with multi-phase
//! domain interviews, AI platform failover, and document generation.

use anyhow::Result;
use std::path::PathBuf;

use super::document_writer::{CompletedPhase, DocumentWriter};
use super::failover::{FailoverManager, PlatformModelPair};
use super::phase_manager::PhaseManager;
use super::prompt_templates::{self, PromptConfig};
use super::question_parser::{self, ParsedAIResponse, PhaseCompletion, StructuredQuestion};
use super::research_engine::{ResearchConfig, ResearchEngine};
use super::state::{self, Decision, InterviewPhase, InterviewState};

/// Configuration for the interview orchestrator.
pub struct InterviewOrchestratorConfig {
    /// The feature being planned.
    pub feature: String,
    /// Whether to use first-principles mode.
    pub first_principles: bool,
    /// Context file paths.
    pub context_files: Vec<String>,
    /// Optional context file contents (pre-loaded).
    pub context_content: Option<String>,
    /// Optional existing-project scan context.
    pub project_context: Option<String>,
    /// Base directory for state persistence and output.
    pub base_dir: PathBuf,
    /// Output directory for interview artifacts (state, docs, requirements).
    pub output_dir: PathBuf,
    /// Primary AI platform.
    pub primary_platform: PlatformModelPair,
    /// Backup platforms for failover.
    pub backup_platforms: Vec<PlatformModelPair>,
    /// Project name (used for AGENTS.md and test strategy).
    pub project_name: String,
    /// Whether to generate AGENTS.md on completion.
    pub generate_initial_agents_md: bool,
    /// Whether to generate Playwright requirements on completion.
    pub generate_playwright_requirements: bool,
    /// Interaction mode (expert or eli5).
    pub interaction_mode: String,
    /// Optional research configuration.
    pub research_config: Option<ResearchConfig>,
}

/// Result from a single interaction turn.
#[derive(Debug, Clone)]
pub struct TurnResult {
    /// The AI's response text (with structured blocks removed).
    pub text: String,
    /// A structured question, if the AI asked one.
    pub question: Option<StructuredQuestion>,
    /// Whether the current phase is complete.
    pub is_phase_complete: bool,
    /// A snapshot of the current interview state.
    pub state: InterviewState,
}

/// Result from completing the entire interview.
#[derive(Debug, Clone)]
pub struct InterviewCompletionResult {
    /// Whether the interview completed successfully.
    pub success: bool,
    /// Path to the master requirements document.
    pub master_doc_path: Option<PathBuf>,
    /// Path to the JSON output.
    pub json_output_path: Option<PathBuf>,
    /// Path to the AGENTS.md file (if generated).
    pub agents_md_path: Option<PathBuf>,
    /// Paths to test strategy files (if generated).
    pub test_strategy_paths: Vec<PathBuf>,
    /// Path to the technology matrix file (if generated).
    pub technology_matrix_path: Option<PathBuf>,
    /// Final interview state.
    pub state: InterviewState,
    /// Error message if failed.
    pub error: Option<String>,
}

/// Events emitted by the orchestrator for UI updates.
#[derive(Debug, Clone)]
pub enum OrchestratorEvent {
    /// The interview phase changed.
    PhaseChange {
        phase: InterviewPhase,
        domain_phase: usize,
    },
    /// An AI response was received and parsed.
    AIResponse { response: ParsedAIResponse },
    /// State was saved to disk.
    StateSaved { path: PathBuf },
    /// An error occurred.
    Error { error: String },
    /// Platform failover occurred.
    Failover {
        from: PlatformModelPair,
        to: PlatformModelPair,
    },
}

/// Manages the full lifecycle of an interactive interview session.
pub struct InterviewOrchestrator {
    config: InterviewOrchestratorConfig,
    state: InterviewState,
    phase_manager: PhaseManager,
    failover_manager: FailoverManager,
    research_engine: Option<ResearchEngine>,
    event_handlers: Vec<Box<dyn Fn(&OrchestratorEvent) + Send>>,
    is_initialized: bool,
    last_completion_data: Option<PhaseCompletion>,
    completed_phases: Vec<CompletedPhase>,
    phase_qa_start_index: usize,
    /// Tracks the last question text asked by the AI (for send_user_response).
    last_question_text: Option<String>,
}

impl InterviewOrchestrator {
    /// Creates a new orchestrator with the given configuration.
    pub fn new(config: InterviewOrchestratorConfig) -> Self {
        let state = state::create_state(
            &config.feature,
            &config.primary_platform.platform.to_string(),
            config.first_principles,
            config.context_files.clone(),
        );

        let failover_manager = FailoverManager::new(
            config.primary_platform.clone(),
            config.backup_platforms.clone(),
        );

        let research_engine = config
            .research_config
            .as_ref()
            .map(|rc| ResearchEngine::new(rc.clone(), &config.base_dir));

        Self {
            config,
            state,
            phase_manager: PhaseManager::new(),
            failover_manager,
            research_engine,
            event_handlers: Vec::new(),
            is_initialized: false,
            last_completion_data: None,
            completed_phases: Vec::new(),
            phase_qa_start_index: 0,
            last_question_text: None,
        }
    }

    /// Registers an event handler. Returns a handler index that can be used
    /// to identify it (unsubscription is not currently needed).
    pub fn on_event<F>(&mut self, handler: F) -> usize
    where
        F: Fn(&OrchestratorEvent) + Send + 'static,
    {
        self.event_handlers.push(Box::new(handler));
        self.event_handlers.len() - 1
    }

    /// Returns a reference to the current interview state.
    pub fn get_state(&self) -> &InterviewState {
        &self.state
    }

    /// Replaces the current state (e.g. when resuming from a saved state).
    pub fn set_state(&mut self, state: InterviewState) {
        self.phase_manager.set_index(state.current_domain_phase);
        self.state = state;
    }

    /// Returns the system prompt for the current phase.
    pub fn current_system_prompt(&self) -> String {
        let previous_docs: Vec<String> = self
            .completed_phases
            .iter()
            .map(|p| std::fs::read_to_string(&p.document_path).unwrap_or_default())
            .collect();

        let config = PromptConfig {
            feature: self.config.feature.clone(),
            first_principles: self.config.first_principles,
            interaction_mode: self.config.interaction_mode.clone(),
            project_context: self.config.project_context.clone(),
            context_content: self.config.context_content.clone(),
        };

        prompt_templates::generate_system_prompt(
            &config,
            self.phase_manager.current_index(),
            &previous_docs,
        )
    }

    /// Initialises the interview and generates the initial system prompt.
    ///
    /// The caller is responsible for sending this prompt to the AI runner
    /// and then feeding the AI's response into `process_ai_response`.
    pub fn initialize(&mut self) -> Result<String> {
        if self.is_initialized {
            anyhow::bail!("Orchestrator already initialized");
        }

        self.is_initialized = true;

        // Move to questioning phase.
        state::update_phase(&mut self.state, InterviewPhase::Questioning);
        self.emit(OrchestratorEvent::PhaseChange {
            phase: InterviewPhase::Questioning,
            domain_phase: self.phase_manager.current_index(),
        });

        // Save state.
        self.save_state()?;

        // Return the system prompt for the caller to send to the AI.
        Ok(self.current_system_prompt())
    }

    /// Processes an AI response and returns a `TurnResult`.
    ///
    /// Call this after receiving raw text back from the AI platform.
    pub fn process_ai_response(&mut self, response_text: &str) -> Result<TurnResult> {
        let parsed = question_parser::parse_ai_response(response_text);

        self.emit(OrchestratorEvent::AIResponse {
            response: parsed.clone(),
        });

        // Accumulate AI context.
        if !parsed.text.is_empty() {
            if !self.state.ai_context.is_empty() {
                self.state.ai_context.push_str("\n\n");
            }
            self.state.ai_context.push_str(&parsed.text);
        }

        // Update last_question_text for send_user_response.
        if let Some(ref q) = parsed.question {
            // Prefer structured question text.
            self.last_question_text = Some(q.question.clone());
        } else if !parsed.text.is_empty() && !parsed.is_phase_complete {
            // Fallback: use the parsed text if non-empty and not phase-complete.
            self.last_question_text = Some(parsed.text.clone());
        }

        // Handle phase completion.
        if parsed.is_phase_complete {
            if let Some(ref pc) = parsed.phase_completion {
                self.last_completion_data = Some(pc.clone());

                // Record decisions.
                for d in &pc.decisions {
                    self.state.decisions.push(Decision {
                        phase: pc.phase.clone(),
                        summary: d.clone(),
                        reasoning: String::new(),
                        timestamp: chrono::Utc::now().to_rfc3339(),
                    });
                }

                // Mark phase completed.
                self.state.completed_phases.push(pc.phase.clone());
            }
            // Clear last question on phase completion.
            self.last_question_text = None;
        }

        self.save_state()?;

        Ok(TurnResult {
            text: parsed.text,
            question: parsed.question,
            is_phase_complete: parsed.is_phase_complete,
            state: self.state.clone(),
        })
    }

    /// Records the user's answer to the last question.
    pub fn send_user_response(&mut self, answer: &str) -> Result<()> {
        let last_question = self
            .last_question_text
            .clone()
            .unwrap_or_else(|| "(no question)".to_string());

        state::add_to_history(&mut self.state, &last_question, answer);
        self.save_state()?;
        Ok(())
    }

    /// Advances to the next domain phase.
    ///
    /// Writes the document for the completed phase, resets AI context,
    /// and returns the new system prompt for the next phase.
    pub fn advance_phase(&mut self) -> Result<Option<String>> {
        // Write document for completed phase.
        if let Some(phase_def) = self.phase_manager.current_phase() {
            let phase_decisions: Vec<Decision> = self
                .state
                .decisions
                .iter()
                .filter(|d| d.phase == phase_def.id)
                .cloned()
                .collect();

            let phase_qa = self.state.history[self.phase_qa_start_index..].to_vec();

            // Phase number is 1-based and equals current index + 1
            let phase_number = self.completed_phases.len() + 1;

            let doc_path = DocumentWriter::write_phase_document(
                phase_def,
                &phase_decisions,
                &phase_qa,
                &self.config.output_dir,
                phase_number,
            )?;

            self.completed_phases.push(CompletedPhase {
                definition: phase_def.clone(),
                decisions: phase_decisions,
                qa_history: phase_qa,
                document_path: doc_path,
            });
        }

        // Advance the phase manager.
        self.phase_manager.mark_current_complete();
        self.phase_qa_start_index = self.state.history.len();

        if self.phase_manager.is_complete() {
            // After completing all 8 standard phases, detect features for dynamic phases
            let current_phase_count = self.phase_manager.total_phases();

            // Only detect if we just finished the 8th phase (standard phases complete)
            if current_phase_count == 8 {
                let detected_features =
                    super::feature_detector::detect_features_from_state(&self.state);

                if !detected_features.is_empty() {
                    log::info!(
                        "Detected {} features for dynamic phases: {:?}",
                        detected_features.len(),
                        detected_features
                            .iter()
                            .map(|f| &f.name)
                            .collect::<Vec<_>>()
                    );

                    // Add dynamic phases for detected features
                    for feature in detected_features {
                        let phase_id = format!("feature-{}", feature.id);
                        self.phase_manager.add_dynamic_phase(
                            &phase_id,
                            &feature.name,
                            &feature.description,
                        );
                    }

                    // Reset to continue with first dynamic phase
                    self.state.current_domain_phase = 8; // First dynamic phase
                    self.state.ai_context.clear();
                    self.last_completion_data = None;

                    self.emit(OrchestratorEvent::PhaseChange {
                        phase: InterviewPhase::Questioning,
                        domain_phase: 8,
                    });

                    self.save_state()?;

                    // Return fresh system prompt for the first dynamic phase
                    return Ok(Some(self.current_system_prompt()));
                }
            }

            // All phases done (including dynamic ones if any).
            state::update_phase(&mut self.state, InterviewPhase::Generating);
            self.emit(OrchestratorEvent::PhaseChange {
                phase: InterviewPhase::Generating,
                domain_phase: self.phase_manager.current_index(),
            });
            self.save_state()?;
            return Ok(None);
        }

        // Update state for new phase.
        self.state.current_domain_phase = self.phase_manager.current_index();
        self.state.ai_context.clear();
        self.last_completion_data = None;

        self.emit(OrchestratorEvent::PhaseChange {
            phase: InterviewPhase::Questioning,
            domain_phase: self.phase_manager.current_index(),
        });

        self.save_state()?;

        // Return fresh system prompt for the new phase.
        Ok(Some(self.current_system_prompt()))
    }

    /// Completes the interview by writing the master document and JSON output.
    /// Optionally generates AGENTS.md and test strategy based on configuration.
    pub fn complete(&mut self) -> Result<InterviewCompletionResult> {
        // Run completion validation
        let validation =
            super::completion_validator::validate_completion(&self.state, &self.phase_manager);

        // Block completion if there are errors
        if !validation.is_valid {
            let error_messages: Vec<String> = validation
                .errors()
                .iter()
                .map(|e| format!("{}: {}", e.domain, e.message))
                .collect();

            let error_text = format!(
                "Interview completion blocked due to {} validation error(s):\n\n{}",
                validation.errors().len(),
                error_messages.join("\n")
            );

            // Attempt basic loopback: set phase index to first missing phase
            if let Some(issue_phase_idx) = validation.first_issue_phase_index(&self.phase_manager) {
                self.phase_manager.set_index(issue_phase_idx);
                self.state.current_domain_phase = issue_phase_idx;
                log::info!(
                    "Loopback triggered: resetting to phase {} for issue resolution",
                    issue_phase_idx
                );
            }

            return Ok(InterviewCompletionResult {
                success: false,
                master_doc_path: None,
                json_output_path: None,
                agents_md_path: None,
                test_strategy_paths: Vec::new(),
                technology_matrix_path: None,
                state: self.state.clone(),
                error: Some(error_text),
            });
        }

        // Proceed with normal completion
        let master_doc_path = DocumentWriter::write_master_document(
            &self.completed_phases,
            &self.config.feature,
            &self.config.output_dir,
        )
        .ok();

        let json_output_path = DocumentWriter::write_json_output(
            &self.completed_phases,
            &self.config.feature,
            &self.config.output_dir,
        )
        .ok();

        // Generate AGENTS.md at base_dir if enabled
        let agents_md_path = if self.config.generate_initial_agents_md {
            super::agents_md_generator::write_agents_md(
                &self.config.project_name,
                &self.completed_phases,
                &self.config.feature,
                &self.config.base_dir,
            )
            .ok()
        } else {
            None
        };

        // Generate test strategy in output_dir if enabled
        let test_strategy_paths = if self.config.generate_playwright_requirements {
            let config = super::test_strategy_generator::TestStrategyConfig {
                coverage_level: super::test_strategy_generator::CoverageLevel::Standard,
                include_playwright: true,
                include_performance: false,
                include_security: true,
            };
            super::test_strategy_generator::write_test_strategy(
                &self.config.project_name,
                &self.completed_phases,
                &config,
                &self.config.output_dir,
            )
            .unwrap_or_default()
        } else {
            Vec::new()
        };

        // Generate technology-matrix.md
        let technology_matrix_path = super::technology_matrix::write_technology_matrix(
            &self.completed_phases,
            &self.config.output_dir,
        )
        .ok();

        state::update_phase(&mut self.state, InterviewPhase::Generating);
        self.save_state()?;

        Ok(InterviewCompletionResult {
            success: true,
            master_doc_path,
            json_output_path,
            agents_md_path,
            test_strategy_paths,
            technology_matrix_path,
            state: self.state.clone(),
            error: None,
        })
    }

    /// Saves the current state to disk.
    pub fn save_state(&mut self) -> Result<PathBuf> {
        let path = state::save_state_at_output_dir(&mut self.state, &self.config.output_dir)?;
        self.emit(OrchestratorEvent::StateSaved { path: path.clone() });
        Ok(path)
    }

    /// Sets the preloaded reference context content.
    ///
    /// This context will be included in all system prompts. Should be called
    /// before `initialize()` or updated between phases as needed.
    pub fn set_reference_context(&mut self, context: String) {
        self.config.context_content = Some(context);
    }

    /// Retrieves the current reference context content, if any.
    pub fn get_reference_context(&self) -> Option<&String> {
        self.config.context_content.as_ref()
    }

    /// Removes persisted state (cleanup after completion).
    pub fn cleanup(&self) -> Result<()> {
        state::clear_state_at_output_dir(&self.config.output_dir)
    }

    /// Returns a reference to the failover manager for quota checks.
    pub fn failover_manager(&self) -> &FailoverManager {
        &self.failover_manager
    }

    /// Returns a mutable reference to the failover manager.
    pub fn failover_manager_mut(&mut self) -> &mut FailoverManager {
        &mut self.failover_manager
    }

    /// Returns a reference to the phase manager.
    pub fn phase_manager(&self) -> &PhaseManager {
        &self.phase_manager
    }

    /// Returns a reference to the research engine, if configured.
    pub fn research_engine(&self) -> Option<&ResearchEngine> {
        self.research_engine.as_ref()
    }

    /// Returns a mutable reference to the research engine, if configured.
    pub fn research_engine_mut(&mut self) -> Option<&mut ResearchEngine> {
        self.research_engine.as_mut()
    }

    /// Gets the latest research context for the current phase, if available.
    pub fn get_research_context(&self) -> Option<String> {
        let phase_index = self.phase_manager.current_index();
        let phase = self.phase_manager.current_phase()?;

        self.research_engine
            .as_ref()
            .and_then(|engine| engine.load_latest_research(phase_index, &phase.id).ok())
            .filter(|s| !s.is_empty())
    }

    /// Emits an event to all registered handlers.
    fn emit(&self, event: OrchestratorEvent) {
        for handler in &self.event_handlers {
            handler(&event);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Platform;
    use std::path::Path;

    fn test_config(dir: &Path) -> InterviewOrchestratorConfig {
        let output_dir = dir.join(".puppet-master").join("interview");
        InterviewOrchestratorConfig {
            feature: "Test feature".to_string(),
            first_principles: false,
            interaction_mode: "expert".to_string(),
            project_context: None,
            context_files: vec![],
            context_content: None,
            base_dir: dir.to_path_buf(),
            output_dir,
            primary_platform: PlatformModelPair::new(Platform::Claude, "test-model"),
            backup_platforms: vec![],
            research_config: None,
            project_name: "TestProject".to_string(),
            generate_initial_agents_md: false,
            generate_playwright_requirements: false,
        }
    }

    #[test]
    fn test_new_orchestrator() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let orch = InterviewOrchestrator::new(config);
        assert_eq!(orch.get_state().feature, "Test feature");
        assert_eq!(orch.get_state().phase, InterviewPhase::Exploring);
    }

    #[test]
    fn test_initialize() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        let prompt = orch.initialize().unwrap();
        assert!(prompt.contains("Test feature"));
        assert!(prompt.contains("Scope & Goals"));
        assert_eq!(orch.get_state().phase, InterviewPhase::Questioning);
    }

    #[test]
    fn test_process_plain_response() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        let result = orch
            .process_ai_response("What is the main goal of this feature?")
            .unwrap();
        assert_eq!(result.text, "What is the main goal of this feature?");
        assert!(result.question.is_none());
        assert!(!result.is_phase_complete);
    }

    #[test]
    fn test_process_structured_question() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        let response = r#"Let me ask:
<<<PM_QUESTION>>>
{
  "header": "Goal",
  "question": "What is the primary goal?",
  "options": [
    {"label": "Speed", "description": "Make it fast"},
    {"label": "UX", "description": "Make it pretty"}
  ],
  "multiSelect": false
}
<<<END_PM_QUESTION>>>"#;

        let result = orch.process_ai_response(response).unwrap();
        assert!(result.question.is_some());
        assert_eq!(result.question.unwrap().header, "Goal");
    }

    #[test]
    fn test_advance_phase() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        // Simulate phase completion.
        let response = r#"<<<PM_PHASE_COMPLETE>>>
{
  "phase": "scope_goals",
  "summary": "Scope defined",
  "decisions": ["Web first"],
  "openItems": []
}
<<<END_PM_PHASE_COMPLETE>>>"#;
        orch.process_ai_response(response).unwrap();

        let next_prompt = orch.advance_phase().unwrap();
        assert!(next_prompt.is_some());
        let prompt = next_prompt.unwrap();
        assert!(prompt.contains("Architecture & Technology"));
        assert_eq!(orch.get_state().current_domain_phase, 1);
    }

    #[test]
    fn test_double_initialize_fails() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();
        assert!(orch.initialize().is_err());
    }

    #[test]
    fn test_send_user_response_tracks_question() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        // AI asks a plain question.
        orch.process_ai_response("What is your goal?").unwrap();
        orch.send_user_response("Build a login page").unwrap();

        // Verify the question was tracked correctly.
        let history = &orch.get_state().history;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].question, "What is your goal?");
        assert_eq!(history[0].answer, "Build a login page");
    }

    #[test]
    fn test_send_user_response_tracks_structured_question() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        // AI asks a structured question.
        let response = r#"Here is my question:
<<<PM_QUESTION>>>
{
  "header": "Platform",
  "question": "What platform will you target?",
  "options": [
    {"label": "Web", "description": "Browser-based"},
    {"label": "Desktop", "description": "Native app"}
  ],
  "multiSelect": false
}
<<<END_PM_QUESTION>>>"#;

        orch.process_ai_response(response).unwrap();
        orch.send_user_response("Web").unwrap();

        // Verify the structured question text was tracked.
        let history = &orch.get_state().history;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].question, "What platform will you target?");
        assert_eq!(history[0].answer, "Web");
    }

    #[test]
    fn test_set_reference_context() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);

        // Initially no context.
        assert!(orch.get_reference_context().is_none());

        // Set context.
        orch.set_reference_context("Use Rust and Tauri".to_string());
        assert_eq!(
            orch.get_reference_context(),
            Some(&"Use Rust and Tauri".to_string())
        );

        // Verify it appears in the system prompt.
        let prompt = orch.current_system_prompt();
        assert!(prompt.contains("Use Rust and Tauri"));
    }

    #[test]
    fn test_no_question_fallback() {
        let dir = tempfile::TempDir::new().unwrap();
        let config = test_config(dir.path());
        let mut orch = InterviewOrchestrator::new(config);
        orch.initialize().unwrap();

        // No question asked, user sends response anyway.
        orch.send_user_response("Random input").unwrap();

        // Verify fallback question text.
        let history = &orch.get_state().history;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].question, "(no question)");
        assert_eq!(history[0].answer, "Random input");
    }
}
