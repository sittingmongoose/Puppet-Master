//! Start chain pipeline - orchestrates requirements parsing, PRD generation, and validation.

use crate::platforms::{PlatformRegistry, UsageTracker};
use crate::start_chain::{
    AiGapValidatorConfig, CompositeValidator, PrdGenerator, RequirementsParser,
};
use crate::state::EvidenceStore;
use crate::types::{
    config::PuppetMasterConfig, events::PuppetMasterEvent,
    EvidenceType, ParsedRequirements, PRD,
};
use anyhow::{anyhow, Context, Result};
use chrono::Utc;
use log::{info, warn};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::mpsc;

/// Parameters for running the start chain pipeline.
#[derive(Debug, Clone)]
pub struct StartChainParams {
    /// Project name
    pub project_name: String,
    /// Requirements as text or file path
    pub requirements: RequirementsInput,
    /// Whether to use AI for PRD generation
    pub use_ai: bool,
    /// AI platform to use (if use_ai is true)
    pub ai_platform: Option<String>,
    /// AI model to use (if use_ai is true)
    pub ai_model: Option<String>,
    /// Whether to run AI-based validation
    pub validate_with_ai: bool,
    /// AI gap validator configuration
    pub ai_gap_config: Option<AiGapValidatorConfig>,
    /// Whether to save evidence
    pub save_evidence: bool,
}

impl StartChainParams {
    /// Create new parameters with default settings.
    pub fn new(project_name: impl Into<String>, requirements: RequirementsInput) -> Self {
        Self {
            project_name: project_name.into(),
            requirements,
            use_ai: false,
            ai_platform: None,
            ai_model: None,
            validate_with_ai: false,
            ai_gap_config: None,
            save_evidence: false,
        }
    }

    /// Enable AI PRD generation.
    pub fn with_ai(mut self, platform: impl Into<String>, model: impl Into<String>) -> Self {
        self.use_ai = true;
        self.ai_platform = Some(platform.into());
        self.ai_model = Some(model.into());
        self
    }

    /// Enable AI-based validation.
    pub fn with_ai_validation(mut self, config: AiGapValidatorConfig) -> Self {
        self.validate_with_ai = true;
        self.ai_gap_config = Some(config);
        self
    }

    /// Enable evidence saving.
    pub fn with_evidence(mut self) -> Self {
        self.save_evidence = true;
        self
    }

    /// Validate parameters.
    pub fn validate(&self) -> Result<()> {
        if self.project_name.trim().is_empty() {
            return Err(anyhow!("Project name cannot be empty"));
        }

        if self.use_ai {
            if self.ai_platform.is_none() {
                return Err(anyhow!("AI platform must be specified when use_ai is enabled"));
            }
            if self.ai_model.is_none() {
                return Err(anyhow!("AI model must be specified when use_ai is enabled"));
            }
        }

        if self.validate_with_ai && self.ai_gap_config.is_none() {
            return Err(anyhow!(
                "AI gap config must be provided when validate_with_ai is enabled"
            ));
        }

        Ok(())
    }
}

/// Requirements input source.
#[derive(Debug, Clone)]
pub enum RequirementsInput {
    /// Raw text requirements
    Text(String),
    /// Path to requirements file
    File(PathBuf),
}

/// Result of the start chain pipeline.
#[derive(Debug)]
pub struct StartChainResult {
    /// Generated PRD
    pub prd: PRD,
    /// Parsed requirements
    pub requirements: ParsedRequirements,
    /// Validation passed
    pub validation_passed: bool,
    /// Validation issues count
    pub validation_issues_count: usize,
    /// Path where PRD was saved
    pub prd_path: PathBuf,
    /// Evidence IDs if saved
    pub evidence_ids: Vec<String>,
}

/// Start chain pipeline orchestrator.
pub struct StartChainPipeline {
    config: Arc<PuppetMasterConfig>,
    platform_registry: Option<Arc<PlatformRegistry>>,
    evidence_store: Option<Arc<EvidenceStore>>,
    usage_tracker: Option<Arc<UsageTracker>>,
    event_tx: Option<mpsc::UnboundedSender<PuppetMasterEvent>>,
}

impl StartChainPipeline {
    /// Create a new start chain pipeline with configuration.
    pub fn new(config: Arc<PuppetMasterConfig>) -> Self {
        Self {
            config,
            platform_registry: None,
            evidence_store: None,
            usage_tracker: None,
            event_tx: None,
        }
    }

    /// Set platform registry for AI execution.
    pub fn with_platform_registry(mut self, registry: Arc<PlatformRegistry>) -> Self {
        self.platform_registry = Some(registry);
        self
    }

    /// Set evidence store for saving evidence.
    pub fn with_evidence_store(mut self, store: Arc<EvidenceStore>) -> Self {
        self.evidence_store = Some(store);
        self
    }

    /// Set usage tracker for tracking AI usage.
    pub fn with_usage_tracker(mut self, tracker: Arc<UsageTracker>) -> Self {
        self.usage_tracker = Some(tracker);
        self
    }

    /// Set event transmitter for progress updates.
    pub fn with_event_tx(mut self, tx: mpsc::UnboundedSender<PuppetMasterEvent>) -> Self {
        self.event_tx = Some(tx);
        self
    }

    /// Run the pipeline.
    pub async fn run(&self, params: StartChainParams) -> Result<StartChainResult> {
        // Validate parameters
        params.validate()?;

        // Step 1: Parse requirements
        self.emit_step(1, 8, "Parsing requirements").await;
        let requirements = self.parse_requirements(&params.requirements).await?;
        info!(
            "Parsed requirements: {} sections",
            requirements.sections.len()
        );

        // Step 2: Generate PRD
        self.emit_step(2, 8, "Generating PRD").await;
        let prd = self
            .generate_prd(&requirements.project_name, &requirements, &params)
            .await?;
        info!("Generated PRD: {} phases", prd.phases.len());

        // Step 3: Generate architecture documentation
        self.emit_step(3, 8, "Generating architecture").await;
        let architecture_content = self.generate_architecture(&prd, &params).await?;
        info!("Generated architecture documentation");

        // Step 4: Generate tier plan
        self.emit_step(4, 8, "Generating tier plan").await;
        let tier_plan = self.generate_tier_plan(&prd, &params).await?;
        info!("Generated tier plan with {} phases", tier_plan.phases.len());

        // Step 5: Generate test plan
        self.emit_step(5, 8, "Generating test plan").await;
        let test_plan = self.generate_test_plan(&prd, &requirements, &params).await?;
        info!("Generated test plan with {} test suites", test_plan.test_suites.len());

        // Step 6: Generate interview questions
        self.emit_step(6, 8, "Generating interview questions").await;
        let interview_questions = self.generate_interview_questions(&requirements, &params).await?;
        info!("Generated {} interview questions", interview_questions.len());

        // Step 7: Validate PRD
        self.emit_step(7, 8, "Validating PRD").await;
        let (validation_passed, validation_issues_count) =
            self.validate_prd(&prd, &requirements, &params).await?;
        info!(
            "Validation completed: passed={}, issues={}",
            validation_passed, validation_issues_count
        );

        // Step 8: Save artifacts
        self.emit_step(8, 8, "Saving artifacts").await;
        let artifacts = self
            .save_artifacts(
                &prd,
                &requirements,
                &architecture_content,
                &tier_plan,
                &test_plan,
                &interview_questions,
                &params,
            )
            .await?;
        info!("Saved {} artifacts", artifacts.len());

        let evidence_ids = if params.save_evidence {
            self.save_evidence(&prd, &requirements, &params).await?
        } else {
            Vec::new()
        };

        // Emit completion event
        self.emit_complete(true, Some("Start chain pipeline completed successfully"))
            .await;

        Ok(StartChainResult {
            prd,
            requirements,
            validation_passed,
            validation_issues_count,
            prd_path: artifacts
                .get("prd")
                .cloned()
                .unwrap_or_else(|| self.config.paths.prd_path.clone()),
            evidence_ids,
        })
    }

    /// Parse requirements from text or file.
    async fn parse_requirements(&self, input: &RequirementsInput) -> Result<ParsedRequirements> {
        match input {
            RequirementsInput::Text(text) => {
                // Parse text - will auto-detect markdown vs plain text
                RequirementsParser::parse_text(text)
                    .context("Failed to parse requirements text")
            }
            RequirementsInput::File(path) => {
                RequirementsParser::parse_file(path)
                    .await
                    .context("Failed to parse requirements file")
            }
        }
    }

    /// Generate PRD with or without AI.
    async fn generate_prd(
        &self,
        _project_name: &str,
        requirements: &ParsedRequirements,
        params: &StartChainParams,
    ) -> Result<PRD> {
        if params.use_ai {
            // Try AI generation
            if let Some(registry) = &self.platform_registry {
                let platform_name = params.ai_platform.as_ref().unwrap();
                let model = params.ai_model.as_ref().unwrap();

                // Parse platform from string
                let platform = platform_name
                    .parse()
                    .context("Invalid platform name")?;

                // Get runner from registry
                match registry.get(platform).await {
                    Some(runner) => {
                        info!("Using AI platform {} with model {}", platform_name, model);
                        match PrdGenerator::generate_with_ai(
                            &requirements.project_name,
                            requirements,
                            runner,
                            model,
                            &self.config.paths.workspace,
                            self.usage_tracker.as_ref().map(|t| t.as_ref()),
                        )
                        .await
                        {
                            Ok(prd) => return Ok(prd),
                            Err(e) => {
                                warn!("AI PRD generation failed: {}; falling back to heuristic", e);
                            }
                        }
                    }
                    None => {
                        warn!(
                            "Platform {} not available; falling back to heuristic",
                            platform_name
                        );
                    }
                }
            } else {
                warn!("No platform registry configured; falling back to heuristic");
            }
        }

        // Fallback to heuristic generation
        info!("Using heuristic PRD generation");
        PrdGenerator::generate(&requirements.project_name, requirements)
    }

    /// Validate PRD with CompositeValidator and optionally AI.
    async fn validate_prd(
        &self,
        prd: &PRD,
        _requirements: &ParsedRequirements,
        params: &StartChainParams,
    ) -> Result<(bool, usize)> {
        let requirements_text = self.get_requirements_text(&params.requirements).await?;
        let requirement_ids = crate::start_chain::extract_requirement_ids(&requirements_text);

        let result = if params.validate_with_ai && params.ai_gap_config.is_some() {
            let ai_config = params.ai_gap_config.clone().unwrap();
            CompositeValidator::validate_with_ai(prd, &requirement_ids, &requirements_text, ai_config)
                .await
        } else {
            CompositeValidator::validate(prd, &requirement_ids)
        };

        Ok((result.passed, result.issues.len()))
    }

    /// Get requirements as text string.
    async fn get_requirements_text(&self, input: &RequirementsInput) -> Result<String> {
        match input {
            RequirementsInput::Text(text) => Ok(text.clone()),
            RequirementsInput::File(path) => {
                // Check if file exists before trying to read it
                if !path.exists() {
                    return Err(anyhow!("Requirements file does not exist: {}", path.display()));
                }
                
                let ext = path
                    .extension()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_lowercase();

                if ext == "docx" || ext == "pdf" {
                    let doc = crate::start_chain::DocumentParser::parse_file(path)
                        .map_err(|e| anyhow!("Failed to parse document: {}", e))?;
                    Ok(doc.raw_text)
                } else {
                    tokio::fs::read_to_string(path)
                        .await
                        .with_context(|| format!("Failed to read requirements file: {}", path.display()))
                }
            }
        }
    }

    /// Generate architecture documentation.
    async fn generate_architecture(&self, prd: &PRD, params: &StartChainParams) -> Result<String> {
        use crate::start_chain::ArchitectureGenerator;

        if params.use_ai {
            // Try AI generation if available
            if let Some(registry) = &self.platform_registry {
                let platform_name = params.ai_platform.as_ref().unwrap();
                let model = params.ai_model.as_ref().unwrap();

                let platform = platform_name
                    .parse()
                    .context("Invalid platform name")?;

                if let Some(runner) = registry.get(platform).await {
                    info!("Using AI platform {} with model {} for architecture", platform_name, model);
                    match ArchitectureGenerator::generate_with_ai(
                        prd,
                        runner,
                        model,
                        &self.config.paths.workspace,
                        self.usage_tracker.as_ref().map(|t| t.as_ref()),
                    )
                    .await
                    {
                        Ok(arch) => return Ok(arch),
                        Err(e) => {
                            warn!("AI architecture generation failed: {}; falling back to heuristic", e);
                        }
                    }
                }
            }
        }

        // Fallback to heuristic generation
        info!("Using heuristic architecture generation");
        Ok(ArchitectureGenerator::generate(prd))
    }

    /// Generate tier plan.
    async fn generate_tier_plan(&self, prd: &PRD, _params: &StartChainParams) -> Result<super::TierPlan> {
        use crate::start_chain::TierPlanGenerator;
        
        info!("Generating tier plan");
        TierPlanGenerator::generate(prd)
    }

    /// Generate test plan.
    async fn generate_test_plan(
        &self,
        prd: &PRD,
        _requirements: &ParsedRequirements,
        _params: &StartChainParams,
    ) -> Result<super::TestPlan> {
        use crate::start_chain::TestPlanGenerator;
        
        info!("Generating test plan");
        TestPlanGenerator::generate_from_prd(prd)
    }

    /// Generate interview questions.
    async fn generate_interview_questions(
        &self,
        requirements: &ParsedRequirements,
        params: &StartChainParams,
    ) -> Result<Vec<super::InterviewQuestion>> {
        use crate::start_chain::RequirementsInterviewer;

        if params.use_ai {
            // Try AI generation if available
            if let Some(registry) = &self.platform_registry {
                let platform_name = params.ai_platform.as_ref().unwrap();
                let model = params.ai_model.as_ref().unwrap();

                let platform = platform_name
                    .parse()
                    .context("Invalid platform name")?;

                if let Some(runner) = registry.get(platform).await {
                    info!("Using AI platform {} with model {} for interview questions", platform_name, model);
                    match RequirementsInterviewer::interview_with_ai(
                        requirements,
                        runner,
                        model,
                        &self.config.paths.workspace,
                        10, // default question count
                        self.usage_tracker.as_ref().map(|t| t.as_ref()),
                    )
                    .await
                    {
                        Ok(result) => return Ok(result.questions),
                        Err(e) => {
                            warn!("AI interview question generation failed: {}; falling back to heuristic", e);
                        }
                    }
                }
            }
        }

        // Fallback to heuristic generation
        info!("Using heuristic interview question generation");
        let result = RequirementsInterviewer::generate_questions(requirements)?;
        Ok(result.questions)
    }

    /// Save all artifacts to .puppet-master/start-chain/
    async fn save_artifacts(
        &self,
        prd: &PRD,
        requirements: &ParsedRequirements,
        architecture: &str,
        tier_plan: &super::TierPlan,
        test_plan: &super::TestPlan,
        interview_questions: &[super::InterviewQuestion],
        params: &StartChainParams,
    ) -> Result<HashMap<String, PathBuf>> {
        use crate::start_chain::RequirementsInventory;

        let mut artifacts = HashMap::new();

        // Create .puppet-master/start-chain directory
        let start_chain_dir = self
            .config
            .paths
            .workspace
            .join(".puppet-master")
            .join("start-chain");
        tokio::fs::create_dir_all(&start_chain_dir)
            .await
            .context("Failed to create start-chain directory")?;

        // Save PRD (to configured path)
        let prd_path = self.save_prd(prd).await?;
        artifacts.insert("prd".to_string(), prd_path.clone());

        // Save architecture.md
        let architecture_path = start_chain_dir.join("architecture.md");
        tokio::fs::write(&architecture_path, architecture)
            .await
            .context("Failed to write architecture file")?;
        artifacts.insert("architecture".to_string(), architecture_path);

        // Save tier-plan.json
        let tier_plan_path = start_chain_dir.join("tier-plan.json");
        let tier_plan_json = serde_json::to_string_pretty(tier_plan)
            .context("Failed to serialize tier plan")?;
        tokio::fs::write(&tier_plan_path, tier_plan_json)
            .await
            .context("Failed to write tier plan file")?;
        artifacts.insert("tier-plan".to_string(), tier_plan_path);

        // Save test-plan.json
        let test_plan_path = start_chain_dir.join("test-plan.json");
        let test_plan_json = serde_json::to_string_pretty(test_plan)
            .context("Failed to serialize test plan")?;
        tokio::fs::write(&test_plan_path, test_plan_json)
            .await
            .context("Failed to write test plan file")?;
        artifacts.insert("test-plan".to_string(), test_plan_path);

        // Save requirements.json
        let requirements_path = start_chain_dir.join("requirements.json");
        let requirements_json = serde_json::to_string_pretty(requirements)
            .context("Failed to serialize requirements")?;
        tokio::fs::write(&requirements_path, requirements_json)
            .await
            .context("Failed to write requirements file")?;
        artifacts.insert("requirements".to_string(), requirements_path);

        // Save requirements-inventory.json
        let requirements_text = self.get_requirements_text(&params.requirements).await?;
        let requirement_ids = crate::start_chain::extract_requirement_ids(&requirements_text);
        let inventory = RequirementsInventory::build(prd, &requirement_ids);
        let inventory_path = start_chain_dir.join("requirements-inventory.json");
        let inventory_json = serde_json::to_string_pretty(&inventory)
            .context("Failed to serialize requirements inventory")?;
        tokio::fs::write(&inventory_path, inventory_json)
            .await
            .context("Failed to write requirements inventory file")?;
        artifacts.insert("requirements-inventory".to_string(), inventory_path);

        // Save interview-questions.json
        let questions_path = start_chain_dir.join("interview-questions.json");
        let questions_json = serde_json::to_string_pretty(interview_questions)
            .context("Failed to serialize interview questions")?;
        tokio::fs::write(&questions_path, questions_json)
            .await
            .context("Failed to write interview questions file")?;
        artifacts.insert("interview-questions".to_string(), questions_path);

        info!("Saved {} artifacts to {:?}", artifacts.len(), start_chain_dir);
        Ok(artifacts)
    }

    /// Save PRD to configured path.
    async fn save_prd(&self, prd: &PRD) -> Result<PathBuf> {
        let path = &self.config.paths.prd_path;
        PrdGenerator::save_prd(prd, path).await?;
        Ok(path.clone())
    }

    /// Save evidence if configured.
    async fn save_evidence(
        &self,
        prd: &PRD,
        requirements: &ParsedRequirements,
        params: &StartChainParams,
    ) -> Result<Vec<String>> {
        let store = match &self.evidence_store {
            Some(store) => store,
            None => {
                warn!("Evidence store not configured; skipping evidence save");
                return Ok(Vec::new());
            }
        };

        let mut evidence_ids = Vec::new();

        // Save requirements as evidence
        let requirements_json = serde_json::to_string_pretty(requirements)
            .context("Failed to serialize requirements")?;
        let mut metadata = HashMap::new();
        metadata.insert("type".to_string(), "parsed_requirements".to_string());
        metadata.insert("project".to_string(), params.project_name.clone());

        let evidence = store
            .store_evidence(
                "start_chain",
                "pipeline",
                EvidenceType::CommandOutput,
                requirements_json.as_bytes(),
                metadata,
            )
            .context("Failed to store requirements evidence")?;
        // Extract evidence ID from path
        if let Some(filename) = evidence.path.file_stem() {
            evidence_ids.push(filename.to_string_lossy().to_string());
        }

        // Save PRD as evidence
        let prd_json = serde_json::to_string_pretty(prd).context("Failed to serialize PRD")?;
        let mut metadata = HashMap::new();
        metadata.insert("type".to_string(), "generated_prd".to_string());
        metadata.insert("project".to_string(), params.project_name.clone());

        let evidence = store
            .store_evidence(
                "start_chain",
                "pipeline",
                EvidenceType::CommandOutput,
                prd_json.as_bytes(),
                metadata,
            )
            .context("Failed to store PRD evidence")?;
        // Extract evidence ID from path
        if let Some(filename) = evidence.path.file_stem() {
            evidence_ids.push(filename.to_string_lossy().to_string());
        }

        info!("Saved {} evidence items", evidence_ids.len());
        Ok(evidence_ids)
    }

    /// Emit step progress event.
    async fn emit_step(&self, step: u32, total: u32, description: impl Into<String>) {
        if let Some(tx) = &self.event_tx {
            let event = PuppetMasterEvent::StartChainStep {
                step,
                total,
                description: description.into(),
                timestamp: Utc::now(),
            };
            let _ = tx.send(event);
        }
    }

    /// Emit completion event.
    async fn emit_complete(&self, success: bool, message: Option<&str>) {
        if let Some(tx) = &self.event_tx {
            let event = PuppetMasterEvent::StartChainComplete {
                success,
                message: message.map(|s| s.to_string()),
                timestamp: Utc::now(),
            };
            let _ = tx.send(event);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_params_validation_empty_project_name() {
        let params = StartChainParams::new("", RequirementsInput::Text("test".to_string()));
        assert!(params.validate().is_err());
    }

    #[test]
    fn test_params_validation_ai_missing_platform() {
        let mut params = StartChainParams::new("Test", RequirementsInput::Text("test".to_string()));
        params.use_ai = true;
        params.ai_model = Some("gpt-4".to_string());
        assert!(params.validate().is_err());
    }

    #[test]
    fn test_params_validation_ai_missing_model() {
        let mut params = StartChainParams::new("Test", RequirementsInput::Text("test".to_string()));
        params.use_ai = true;
        params.ai_platform = Some("cursor".to_string());
        assert!(params.validate().is_err());
    }

    #[test]
    fn test_params_validation_ai_valid() {
        let params = StartChainParams::new("Test", RequirementsInput::Text("test".to_string()))
            .with_ai("cursor", "gpt-4");
        assert!(params.validate().is_ok());
    }

    #[test]
    fn test_params_validation_ai_validation_missing_config() {
        let mut params = StartChainParams::new("Test", RequirementsInput::Text("test".to_string()));
        params.validate_with_ai = true;
        assert!(params.validate().is_err());
    }

    #[test]
    fn test_params_builder() {
        let params = StartChainParams::new("Test Project", RequirementsInput::Text("test".to_string()))
            .with_ai("cursor", "gpt-4")
            .with_evidence();

        assert_eq!(params.project_name, "Test Project");
        assert!(params.use_ai);
        assert_eq!(params.ai_platform.as_deref(), Some("cursor"));
        assert_eq!(params.ai_model.as_deref(), Some("gpt-4"));
        assert!(params.save_evidence);
    }
}
