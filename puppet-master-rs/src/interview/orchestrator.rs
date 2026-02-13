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
    /// Base directory for state persistence and output.
    pub base_dir: PathBuf,
    /// Primary AI platform.
    pub primary_platform: PlatformModelPair,
    /// Backup platforms for failover.
    pub backup_platforms: Vec<PlatformModelPair>,
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
    event_handlers: Vec<Box<dyn Fn(&OrchestratorEvent) + Send>>,
    is_initialized: bool,
    last_completion_data: Option<PhaseCompletion>,
    completed_phases: Vec<CompletedPhase>,
    phase_qa_start_index: usize,
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

        Self {
            config,
            state,
            phase_manager: PhaseManager::new(),
            failover_manager,
            event_handlers: Vec::new(),
            is_initialized: false,
            last_completion_data: None,
            completed_phases: Vec::new(),
            phase_qa_start_index: 0,
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
            .state
            .history
            .last()
            .map(|qa| qa.question.clone())
            .unwrap_or_else(|| "Initial question".to_string());

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

            let output_dir = self
                .config
                .base_dir
                .join(".puppet-master")
                .join("interview");

            let doc_path = DocumentWriter::write_phase_document(
                phase_def,
                &phase_decisions,
                &phase_qa,
                &output_dir,
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
            // All phases done.
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
    pub fn complete(&mut self) -> Result<InterviewCompletionResult> {
        let output_dir = self
            .config
            .base_dir
            .join(".puppet-master")
            .join("interview");

        let master_doc_path = DocumentWriter::write_master_document(
            &self.completed_phases,
            &self.config.feature,
            &output_dir,
        )
        .ok();

        let json_output_path = DocumentWriter::write_json_output(
            &self.completed_phases,
            &self.config.feature,
            &output_dir,
        )
        .ok();

        state::update_phase(&mut self.state, InterviewPhase::Generating);
        self.save_state()?;

        Ok(InterviewCompletionResult {
            success: true,
            master_doc_path,
            json_output_path,
            state: self.state.clone(),
            error: None,
        })
    }

    /// Saves the current state to disk.
    pub fn save_state(&mut self) -> Result<PathBuf> {
        let path = state::save_state(&mut self.state, &self.config.base_dir)?;
        self.emit(OrchestratorEvent::StateSaved { path: path.clone() });
        Ok(path)
    }

    /// Removes persisted state (cleanup after completion).
    pub fn cleanup(&self) -> Result<()> {
        state::clear_state(&self.config.base_dir)
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

    fn test_config(dir: &Path) -> InterviewOrchestratorConfig {
        InterviewOrchestratorConfig {
            feature: "Test feature".to_string(),
            first_principles: false,
            context_files: vec![],
            context_content: None,
            base_dir: dir.to_path_buf(),
            primary_platform: PlatformModelPair::new(Platform::Claude, "test-model"),
            backup_platforms: vec![],
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
}
