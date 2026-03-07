## Crews and Subagent Communication Enhancements for Interview Flow

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance the **interview flow** to enable better coordination between interview subagents and improve plan generation quality.

### 1. Interview Phase Crews

**Concept:** Use crews within interview phases to enable subagents to communicate and coordinate. For example, Architecture phase can use a crew with `architect-reviewer`, `knowledge-synthesizer`, and `technical-writer` working together.

**Benefits:**
- **Parallel research:** Multiple research subagents can work simultaneously and share findings
- **Collaborative validation:** Validation subagents can discuss answers and reach consensus
- **Coordinated documentation:** Document generation subagents can coordinate to ensure consistency

**BeforePhase crew creation responsibilities:**

- **Check phase subagent configuration:** Determine if phase has multiple subagents (primary + secondary) that would benefit from crew coordination
- **Create phase crew:** If phase has multiple subagents, create crew with all phase subagents as members
- **Register crew:** Register crew with `CrewManager` and persist canonical crew metadata to redb/seglog projections (not ad-hoc JSON files)
- **Initialize crew communication:** Set up message board routing for crew (crew_id = `interview-phase-{phase_id}`)
- **Inject crew context:** Add crew information to phase subagent prompts (crew members, message board access, coordination instructions)

**DuringPhase crew coordination responsibilities:**

- **Monitor crew messages:** Track messages posted by crew members via message board
- **Coordinate research:** When research subagents run, they post findings to crew message board before returning results
- **Coordinate validation:** When validation subagents run, they can query crew message board for prior validations and post their own findings
- **Coordinate documentation:** When document generation subagents run, they can query crew message board for prior document sections and coordinate consistency

**AfterPhase crew completion responsibilities:**

- **Validate crew output:** Check that crew members completed their work and posted final messages
- **Archive crew messages:** Archive crew messages/events to seglog with a queryable redb projection for replay/resume
- **Disband crew:** Mark crew as `CrewStatus::Complete` and remove from active crews
- **Save crew decisions:** Persist crew decisions and findings to canonical interview memory storage for use by later phases

**Implementation:** Extend `src/interview/orchestrator.rs` to create crews at phase start, coordinate during phase execution, and disband at phase completion. Use `CrewManager` from orchestrator plan (`src/core/crews.rs`). File examples below are illustrative legacy persistence only; canonical storage for rewrite-era implementation is seglog + redb projections.

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, modify phase transition logic:

```rust
// Before starting a new phase
let before_ctx = BeforePhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    model: config.primary_platform.model.clone(),
    selected_subagents: get_phase_subagents(&config, &current_phase.id)?,
    previous_decisions: load_previous_phase_decisions(&state)?,
    detected_gui_frameworks: state.detected_gui_frameworks.clone(),
    known_gaps: get_known_gaps_for_phase(&current_phase.id)?,
};

let before_result = self.hook_registry.execute_before_phase(&before_ctx)?;

// Create phase crew if multiple subagents
let phase_crew = if before_result.selected_subagents.len() > 1 {
    let crew_id = format!("interview-phase-{}", current_phase.id);
    let crew_subagents: Vec<CrewSubagent> = before_result.selected_subagents.iter()
        .map(|(agent_type, agent_id)| CrewSubagent {
            agent_id: format!("{}-phase-{}", agent_id, current_phase.id),
            agent_type: agent_type.clone(),
            platform: config.primary_platform.platform,
            tier_id: None, // Interview phase, not tier
            status: SubagentStatus::Active,
        })
        .collect();
    
    let crew = Crew {
        crew_id: crew_id.clone(),
        name: Some(format!("{} Phase Crew", current_phase.name)),
        platform: config.primary_platform.platform,
        subagents: crew_subagents,
        task: format!("Research and validate {} phase decisions", current_phase.name),
        created_by: CrewCreator::Orchestrator { tier_id: format!("interview-phase-{}", current_phase.id) },
        created_at: Utc::now(),
        status: CrewStatus::Forming,
    };
    
    self.crew_manager.create_crew(crew).await?;
    Some(crew_id)
} else {
    None
};

// Inject crew context into prompt if crew exists
let prompt = if let Some(crew_id) = &phase_crew {
    let crew_context = self.crew_manager.get_crew_coordination_context(&crew_id).await?;
    format!("{}\n\n**Crew Coordination:** You are part of a crew ({}) with {} members. Coordinate via the message board (agent-messages.json). Post findings and questions to the crew before completing your work.\n\n{}", 
        prompt, crew_id, before_result.selected_subagents.len(), crew_context)
} else {
    prompt
};

// After phase completes
let after_ctx = AfterPhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    subagent_output: phase_output.clone(),
    completion_status: if phase_complete { CompletionStatus::Success } else { CompletionStatus::Warning("Incomplete".to_string()) },
    question_count: state.current_phase_qa.len(),
};

let after_result = self.hook_registry.execute_after_phase(&after_ctx)?;

// Disband phase crew if it exists
if let Some(crew_id) = phase_crew {
    self.crew_manager.disband_crew(&crew_id, "Phase completed").await?;
    
    // Archive crew messages to canonical storage / projection
    let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
    self.persist_phase_crew_messages(&current_phase.id, &messages).await?;
    
    // Save crew decisions to memory
    self.memory_manager.save_phase_decisions(&current_phase.id, &extract_crew_decisions(&messages)).await?;
}
```

**Error handling:**

- **Crew creation failure:** If crew creation fails, log warning and proceed without crew (fallback to single-subagent mode)
- **Message board failure:** If message board access fails, log warning and proceed without coordination (subagents work independently)
- **Crew disband failure:** If crew disband fails, log error but continue (crew will be cleaned up on next startup)

### 2. Crew-Aware Plan Generation

**Concept:** When the interview generates PRD/plans, include crew recommendations for tasks/subtasks that would benefit from multiple subagents working together. Per §5.2 (Documentation and plans for AI execution), generated plans must also include **which subagent personas to use** (item 4) and **what can be done in parallel** (item 5).

**What to include in generated plans:**
- **Subagent persona recommendations:** Which subagent(s) to use per task, subtask, or phase (names from subagent_registry). PRD subtasks carry `crew_recommendation` with `subagents`; phase plans and other docs must carry subagent recommendations where applicable.
- **Parallelism:** Which tasks/subtasks can run in parallel via the canonical `depends_on` dependency graph so the Overseer can schedule parallel execution.
- **Crew recommendations:** Suggest crews for complex tasks/subtasks when multiple subagents work together.
- **Crew templates:** Reference crew templates (e.g., "Use 'Full Stack Crew' for this phase")
- **Crew metadata:** Add crew hints to PRD tasks/subtasks

**PRD schema extension:**

```json
{
  "phases": [
    {
      "tasks": [
        {
          "subtasks": [
            {
              "id": "ST-001-001-001",
              "title": "Implement authentication API",
              "crew_recommendation": {
                "suggested": true,
                "subagents": ["rust-engineer", "security-auditor", "test-automator"],
                "rationale": "Requires security expertise, implementation, and testing",
                "crew_template": "Security Implementation Crew",
                "complexity_score": 7.5,
                "expertise_areas": ["security", "backend", "testing"]
              },
               "depends_on": []
            }
          ]
        }
      ]
    }
  ]
}
```

- **Parallelism fields:** `depends_on` lists task/subtask ids that must complete before this one; empty means no dependencies. Parallel execution is inferred from the dependency graph. Document this schema in the PRD generator and STATE_FILES; orchestrator uses it to schedule parallel execution.

**Crew and parallelism field semantics (canonical: STATE_FILES.md §3.3):**

- **crew_recommendation:** Optional. When present, `subagents` is **required** (array of strings; names from subagent_registry). Other fields (rationale, crew_template, complexity_score, expertise_areas) are optional. If `crew_recommendation` is present but `subagents` is missing or empty, the orchestrator **treats it as no recommendation** and falls back to dynamic selection.
- **depends_on:** Optional. Type: array of strings (item ids). Empty array or missing = no dependencies. This item may run only after every listed item has completed. Use `depends_on` for ordering; do not introduce a separate `can_run_after` in the PRD schema.
- **Phase/Task:** Phase and Task may carry the same optional fields with the same types and semantics when the generator specifies at that level.

**Complexity analysis responsibilities:**

- **Analyze subtask title and description:** Extract keywords, technical terms, and complexity indicators (e.g., "implement", "design", "integrate", "refactor")
- **Analyze acceptance criteria:** Count verification tokens (TEST:, CLI_VERIFY:, etc.), assess test complexity, identify multiple verification types
- **Analyze dependencies:** Check if subtask depends on other subtasks or external systems
- **Estimate effort:** Calculate estimated hours based on title length, description length, acceptance criteria count, dependency count
- **Identify expertise areas:** Map keywords and technical terms to expertise areas (e.g., "authentication" → security, "API" → backend, "test" → testing)

**Subagent selection logic:**

- **Map expertise areas to subagents:** Use expertise area → subagent type mapping (e.g., security → security-auditor, backend → rust-engineer, testing → test-automator)
- **Check subagent availability:** Verify subagent types are available for the platform configured for this tier
- **Apply crew templates:** Match expertise areas to crew templates (e.g., security + backend + testing → "Security Implementation Crew")
- **Generate rationale:** Create human-readable rationale explaining why crew is recommended

**Implementation:** Extend `src/start-chain/prd_generator.rs` (or equivalent) to include complexity analysis and crew recommendation logic. Add `CrewRecommendationGenerator` module.

**Integration with PRD generator:**

In `src/start-chain/prd_generator.rs` (or equivalent), extend subtask generation:

```rust
use crate::core::crews::{CrewManager, CrewRecommendationGenerator};

impl PrdGenerator {
    pub fn generate_prd_with_crew_recommendations(
        &self,
        phases: &[Phase],
        output_path: &Path,
        crew_manager: &CrewManager,
    ) -> Result<PathBuf> {
        let mut prd = self.generate_base_prd(phases)?;
        
        // Analyze each subtask and add crew recommendations
        let crew_recommender = CrewRecommendationGenerator::new(crew_manager);
        
        for phase in &mut prd.phases {
            for task in &mut phase.tasks {
                for subtask in &mut task.subtasks {
                    // Analyze subtask complexity
                    let complexity = self.analyze_subtask_complexity(subtask)?;
                    
                    // Generate crew recommendation if complexity warrants it
                    if complexity.should_suggest_crew() {
                        let recommendation = crew_recommender.suggest_crew_for_subtask(
                            subtask,
                            &complexity,
                            &task.platform_config, // Platform for this tier
                        ).await?;
                        
                        if let Some(recommendation) = recommendation {
                            subtask.crew_recommendation = Some(recommendation);
                        }
                    }
                }
            }
        }
        
        // Write PRD with crew recommendations
        self.write_prd_json(&prd, output_path)?;
        
        Ok(output_path.to_path_buf())
    }
    
    fn analyze_subtask_complexity(&self, subtask: &Subtask) -> Result<SubtaskComplexity> {
        // Extract keywords from title and description
        let title_keywords = self.extract_keywords(&subtask.title);
        let desc_keywords = self.extract_keywords(&subtask.description);
        
        // Count acceptance criteria and verification tokens
        let acceptance_criteria_count = subtask.acceptance_criteria.len();
        let verification_token_count = subtask.acceptance_criteria.iter()
            .filter(|ac| ac.contains("TEST:") || ac.contains("CLI_VERIFY:") || 
                    ac.contains("BROWSER_VERIFY:") || ac.contains("FILE_VERIFY:"))
            .count();
        
        // Identify expertise areas
        let expertise_areas = self.identify_expertise_areas(&title_keywords, &desc_keywords);
        
        // Estimate effort (hours)
        let estimated_hours = self.estimate_effort(
            &subtask.title,
            &subtask.description,
            acceptance_criteria_count,
            verification_token_count,
            subtask.dependencies.len(),
        );
        
        // Calculate complexity score (0-10)
        let complexity_score = self.calculate_complexity_score(
            estimated_hours,
            expertise_areas.len(),
            acceptance_criteria_count,
            verification_token_count,
        );
        
        Ok(SubtaskComplexity {
            estimated_hours,
            complexity_score,
            expertise_areas,
            requires_multiple_expertise: expertise_areas.len() > 1,
            acceptance_criteria_count,
            verification_token_count,
        })
    }
    
    fn identify_expertise_areas(&self, title_keywords: &[String], desc_keywords: &[String]) -> Vec<String> {
        let mut areas = Vec::new();
        let all_keywords: Vec<_> = title_keywords.iter().chain(desc_keywords.iter()).collect();
        
        // Map keywords to expertise areas
        for keyword in all_keywords {
            let keyword_lower = keyword.to_lowercase();
            if keyword_lower.contains("auth") || keyword_lower.contains("security") || 
               keyword_lower.contains("encrypt") || keyword_lower.contains("permission") {
                if !areas.contains(&"security".to_string()) {
                    areas.push("security".to_string());
                }
            }
            if keyword_lower.contains("api") || keyword_lower.contains("endpoint") || 
               keyword_lower.contains("server") || keyword_lower.contains("backend") {
                if !areas.contains(&"backend".to_string()) {
                    areas.push("backend".to_string());
                }
            }
            if keyword_lower.contains("test") || keyword_lower.contains("verify") || 
               keyword_lower.contains("assert") || keyword_lower.contains("spec") {
                if !areas.contains(&"testing".to_string()) {
                    areas.push("testing".to_string());
                }
            }
            if keyword_lower.contains("ui") || keyword_lower.contains("frontend") || 
               keyword_lower.contains("component") || keyword_lower.contains("render") {
                if !areas.contains(&"frontend".to_string()) {
                    areas.push("frontend".to_string());
                }
            }
            if keyword_lower.contains("database") || keyword_lower.contains("db") || 
               keyword_lower.contains("schema") || keyword_lower.contains("migration") {
                if !areas.contains(&"database".to_string()) {
                    areas.push("database".to_string());
                }
            }
        }
        
        areas
    }
    
    fn estimate_effort(
        &self,
        title: &str,
        description: &str,
        acceptance_criteria_count: usize,
        verification_token_count: usize,
        dependency_count: usize,
    ) -> f64 {
        // Base effort from title/description length
        let base_hours = (title.len() + description.len()) as f64 / 500.0;
        
        // Add effort for acceptance criteria (0.5 hours each)
        let criteria_hours = acceptance_criteria_count as f64 * 0.5;
        
        // Add effort for verification tokens (0.3 hours each)
        let verification_hours = verification_token_count as f64 * 0.3;
        
        // Add effort for dependencies (0.2 hours each)
        let dependency_hours = dependency_count as f64 * 0.2;
        
        // Minimum 1 hour, maximum 8 hours
        (base_hours + criteria_hours + verification_hours + dependency_hours)
            .max(1.0)
            .min(8.0)
    }
    
    fn calculate_complexity_score(
        &self,
        estimated_hours: f64,
        expertise_area_count: usize,
        acceptance_criteria_count: usize,
        verification_token_count: usize,
    ) -> f64 {
        // Normalize to 0-10 scale
        let hours_score = (estimated_hours / 8.0) * 4.0; // Max 4 points
        let expertise_score = (expertise_area_count as f64 / 5.0) * 3.0; // Max 3 points
        let criteria_score = (acceptance_criteria_count as f64 / 10.0) * 2.0; // Max 2 points
        let verification_score = (verification_token_count as f64 / 5.0) * 1.0; // Max 1 point
        
        (hours_score + expertise_score + criteria_score + verification_score)
            .min(10.0)
    }
}

impl CrewRecommendationGenerator {
    pub async fn suggest_crew_for_subtask(
        &self,
        subtask: &Subtask,
        complexity: &SubtaskComplexity,
        platform_config: &PlatformConfig,
    ) -> Result<Option<CrewRecommendation>> {
        // Only suggest crew if complexity warrants it
        if !complexity.should_suggest_crew() {
            return Ok(None);
        }
        
        // Map expertise areas to subagent types
        let subagent_types = self.map_expertise_to_subagents(&complexity.expertise_areas)?;
        
        // Filter subagents by platform availability
        let available_subagents = self.filter_by_platform(subagent_types, platform_config.platform)?;
        
        if available_subagents.is_empty() {
            return Ok(None); // No available subagents for this platform
        }
        
        // Find matching crew template
        let crew_template = self.find_matching_template(&available_subagents)?;
        
        // Generate rationale
        let rationale = format!(
            "Subtask requires {} expertise areas ({}), estimated {} hours, and {} acceptance criteria. Recommended crew: {}",
            complexity.expertise_areas.len(),
            complexity.expertise_areas.join(", "),
            complexity.estimated_hours,
            complexity.acceptance_criteria_count,
            available_subagents.join(" + ")
        );
        
        Ok(Some(CrewRecommendation {
            suggested: true,
            subagents: available_subagents,
            rationale,
            crew_template,
            complexity_score: complexity.complexity_score,
            expertise_areas: complexity.expertise_areas.clone(),
        }))
    }
    
    fn map_expertise_to_subagents(&self, expertise_areas: &[String]) -> Result<Vec<String>> {
        let mut subagents = Vec::new();
        
        for area in expertise_areas {
            match area.as_str() {
                "security" => subagents.push("security-auditor".to_string()),
                "backend" => subagents.push("rust-engineer".to_string()), // Or backend-developer
                "testing" => subagents.push("test-automator".to_string()),
                "frontend" => subagents.push("frontend-developer".to_string()),
                "database" => subagents.push("database-administrator".to_string()),
                _ => {} // Unknown expertise area
            }
        }
        
        Ok(subagents)
    }
    
    fn filter_by_platform(&self, subagents: Vec<String>, platform: Platform) -> Result<Vec<String>> {
        // Check which subagents are available for this platform
        // This would check platform_specs or subagent registry
        let available: Vec<String> = subagents.into_iter()
            .filter(|subagent| self.is_subagent_available(subagent, platform))
            .collect();
        
        Ok(available)
    }
    
    fn find_matching_template(&self, subagents: &[String]) -> Result<Option<String>> {
        // Match subagent combination to crew templates
        // E.g., ["rust-engineer", "security-auditor", "test-automator"] → "Security Implementation Crew"
        let template_map: HashMap<Vec<String>, String> = HashMap::from([
            (vec!["rust-engineer".to_string(), "security-auditor".to_string(), "test-automator".to_string()], 
             "Security Implementation Crew".to_string()),
            (vec!["rust-engineer".to_string(), "frontend-developer".to_string(), "test-automator".to_string()], 
             "Full Stack Crew".to_string()),
            // ... more templates
        ]);
        
        // Sort subagents for consistent matching
        let mut sorted_subagents = subagents.to_vec();
        sorted_subagents.sort();
        
        Ok(template_map.get(&sorted_subagents).cloned())
    }
}

impl SubtaskComplexity {
    fn should_suggest_crew(&self) -> bool {
        // Suggest crew if:
        // - Requires multiple expertise areas, OR
        // - Estimated hours > 4.0, OR
        // - Complexity score > 6.0
        self.requires_multiple_expertise || 
        self.estimated_hours > 4.0 || 
        self.complexity_score > 6.0
    }
}
```

**Integration with orchestrator:**

- Orchestrator reads `crew_recommendation` from PRD tasks/subtasks when loading PRD
- When orchestrator creates crews for tiers, it checks for `crew_recommendation` and uses it as a hint for subagent selection
- Crew recommendations guide subagent selection for orchestrator-initiated crews, but orchestrator can override based on tier configuration

**Error handling:**

- **Complexity analysis failure:** If complexity analysis fails, log warning and proceed without crew recommendation
- **Subagent mapping failure:** If expertise area → subagent mapping fails, log warning and use fallback subagents
- **Platform availability check failure:** If platform availability check fails, log warning and proceed without filtering (may suggest unavailable subagents)

### 3. Cross-Phase Crew Coordination

**Concept:** Crews can coordinate across interview phases. For example, Architecture phase crew shares decisions with Testing phase crew.

**Benefits:**
- **Consistency:** Later phases can reference decisions from earlier phases
- **Context sharing:** Crews can ask questions of previous phase crews
- **Decision validation:** Later phase crews can validate earlier phase decisions

**BeforePhase cross-phase coordination responsibilities:**

- **Load prior phase crew messages:** Load messages from previous phase crews from canonical crew-message projections
- **Load prior phase decisions:** Load decisions from previous phases from canonical interview-memory projections
- **Inject cross-phase context:** Add prior phase decisions and crew messages to current phase crew context
- **Set up cross-phase message routing:** Configure message board to route messages to previous phase crews (for questions/validation)

**DuringPhase cross-phase coordination responsibilities:**

- **Post decisions to message board:** When phase crew makes decisions, post them to message board with `to_tier_id` = `interview-phase-{next_phase_id}` for future phases
- **Query prior phase crews:** Current phase crew can post questions to previous phase crews via message board (routing by phase_id)
- **Validate prior decisions:** Current phase crew can validate decisions from previous phases and post validation results

**AfterPhase cross-phase coordination responsibilities:**

- **Archive phase decisions:** Save phase decisions to canonical interview-memory storage with phase_id linkage
- **Archive crew messages:** Archive crew messages with cross-phase routing information
- **Prepare for next phase:** Set up message routing for next phase to access current phase decisions

**Implementation:** Extend `src/interview/orchestrator.rs` to load prior phase messages/decisions at phase start, enable cross-phase message routing during phase execution, and archive decisions/messages at phase completion.

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, extend phase transition logic:

```rust
// Before starting a new phase
let before_ctx = BeforePhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    model: config.primary_platform.model.clone(),
    selected_subagents: get_phase_subagents(&config, &current_phase.id)?,
    previous_decisions: load_previous_phase_decisions(&state)?,
    detected_gui_frameworks: state.detected_gui_frameworks.clone(),
    known_gaps: get_known_gaps_for_phase(&current_phase.id)?,
};

let before_result = self.hook_registry.execute_before_phase(&before_ctx)?;

// Load prior phase crew messages and decisions
let prior_phase_messages = if current_phase.number > 1 {
    let prior_phase_id = format!("phase-{}", current_phase.number - 1);
    self.load_phase_crew_messages(&prior_phase_id).await?
} else {
    Vec::new()
};

let prior_phase_decisions = self.memory_manager.load_phase_decisions(&current_phase.id).await?;

// Create phase crew with cross-phase context
let phase_crew = if before_result.selected_subagents.len() > 1 {
    let crew_id = format!("interview-phase-{}", current_phase.id);
    
    // Inject cross-phase context into crew task
    let crew_task = format!(
        "Research and validate {} phase decisions.\n\n**Prior Phase Context:**\n{}\n\n**Prior Phase Decisions:**\n{}",
        current_phase.name,
        format_crew_messages_summary(&prior_phase_messages),
        format_decisions_summary(&prior_phase_decisions)
    );
    
    let crew = Crew {
        crew_id: crew_id.clone(),
        name: Some(format!("{} Phase Crew", current_phase.name)),
        platform: config.primary_platform.platform,
        subagents: /* ... */,
        task: crew_task,
        created_by: CrewCreator::Orchestrator { tier_id: format!("interview-phase-{}", current_phase.id) },
        created_at: Utc::now(),
        status: CrewStatus::Forming,
    };
    
    self.crew_manager.create_crew(crew).await?;
    
    // Set up cross-phase message routing
    if current_phase.number > 1 {
        let prior_phase_id = format!("interview-phase-phase-{}", current_phase.number - 1);
        self.crew_manager.enable_cross_phase_routing(&crew_id, &prior_phase_id).await?;
    }
    
    Some(crew_id)
} else {
    None
};

// After phase completes
// ... existing after phase logic ...

// Archive phase decisions and messages
if let Some(crew_id) = phase_crew {
    let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
    
    // Extract decisions from messages
    let decisions: Vec<Decision> = messages.iter()
        .filter(|msg| matches!(msg.message_type, MessageType::Decision))
        .map(|msg| extract_decision_from_message(msg))
        .collect();
    
    // Save decisions to memory
    self.memory_manager.save_phase_decisions(&current_phase.id, &decisions).await?;
    
    // Archive messages to canonical storage / projection
    self.persist_phase_crew_messages(&current_phase.id, &messages).await?;
    
    // Disband crew
    self.crew_manager.disband_crew(&crew_id, "Phase completed").await?;
}
```

**Cross-phase message routing:**

```rust
impl CrewManager {
    pub async fn enable_cross_phase_routing(
        &self,
        current_crew_id: &str,
        prior_crew_id: &str,
    ) -> Result<()> {
        // Configure message board to allow current crew to post messages to prior crew
        // Prior crew is archived, but messages can still be posted for reference
        self.message_board.enable_cross_phase_routing(
            current_crew_id,
            prior_crew_id,
        ).await?;
        
        Ok(())
    }
    
    pub async fn post_cross_phase_question(
        &self,
        from_crew_id: &str,
        to_phase_id: &str,
        question: &str,
    ) -> Result<String> {
        // Post question to prior phase crew (archived, but accessible)
        let message = AgentMessage {
            message_id: generate_message_id(),
            from_agent_id: format!("crew-{}", from_crew_id),
            from_platform: /* ... */,
            to_agent_id: None,
            to_tier_id: Some(format!("interview-phase-{}", to_phase_id)),
            message_type: MessageType::Question,
            subject: "Cross-phase question".to_string(),
            content: question.to_string(),
            context: MessageContext {
                phase_id: Some(to_phase_id.to_string()),
                crew_id: Some(from_crew_id.to_string()),
            },
            thread_id: None,
            in_reply_to: None,
            created_at: Utc::now(),
            read_by: Vec::new(),
            resolved: false,
        };
        
        self.message_board.post_message(message).await?;
        
        Ok(message.message_id)
    }
}
```

**Error handling:**

- **Prior phase message load failure:** If loading prior phase messages fails, log warning and proceed without cross-phase context
- **Cross-phase routing failure:** If cross-phase routing setup fails, log warning and proceed without cross-phase coordination
- **Decision archive failure:** If archiving decisions fails, log error but continue (decisions may be lost, but phase can complete)

### 4. Research Crews for Tool Discovery

**Concept:** When interview performs tool research (newtools plan), use crews to coordinate multiple researchers working in parallel.

**Benefits:**
- **Parallel research:** Multiple researchers can research different tools simultaneously
- **Coordinated catalog updates:** Researchers can coordinate catalog entries
- **Conflict resolution:** Researchers can discuss conflicting tool recommendations

**BeforeResearch crew creation responsibilities:**

- **Determine research scope:** Identify GUI framework(s) to research and required research subagents
- **Create research crew:** Create crew with research subagents (e.g., `ux-researcher`, `qa-expert`, `test-automator` for GUI testing tools)
- **Assign research tasks:** Divide research scope among crew members (e.g., `ux-researcher` researches UX tools, `qa-expert` researches testing tools)
- **Initialize research coordination:** Set up message board for research crew to share findings

**DuringResearch crew coordination responsibilities:**

- **Coordinate research assignments:** Crew members post their research assignments to message board to avoid duplicates
- **Share research findings:** Crew members post findings to message board as they discover tools
- **Resolve conflicts:** If crew members find conflicting information, they discuss via message board to reach consensus
- **Coordinate catalog entries:** Before adding catalog entries, crew members review each other's proposed entries

**AfterResearch crew completion responsibilities:**

- **Validate research results:** Crew members validate each other's research results before catalog update
- **Merge research findings:** Combine findings from all crew members into unified catalog entries
- **Archive research messages:** Archive research crew messages to canonical research/crew projections
- **Disband research crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/interview/research_engine.rs` to create research crews, coordinate research operations, and disband crews after research completes. File-path examples below are illustrative legacy persistence only; canonical storage for rewrite-era implementation is seglog + redb projection.

**Integration with research engine:**

In `src/interview/research_engine.rs`, extend research operations:

```rust
impl ResearchEngine {
    pub async fn execute_research_with_crew(
        &self,
        topic: &str,
        context: &str,
        framework: Option<&str>,
        config: &InterviewOrchestratorConfig,
    ) -> Result<ResearchResult> {
        // Determine research subagents based on topic and framework
        let research_subagents = self.select_research_subagents(topic, framework)?;
        
        // Create research crew if multiple subagents
        let research_crew = if research_subagents.len() > 1 {
            let research_id = generate_research_id();
            let crew_id = format!("tool-research-{}", research_id);
            
            let crew_subagents: Vec<CrewSubagent> = research_subagents.iter()
                .map(|(agent_type, agent_id)| CrewSubagent {
                    agent_id: format!("{}-research-{}", agent_id, research_id),
                    agent_type: agent_type.clone(),
                    platform: config.primary_platform.platform,
                    tier_id: None,
                    status: SubagentStatus::Active,
                })
                .collect();
            
            // Divide research scope among crew members
            let research_tasks = self.divide_research_scope(topic, framework, &research_subagents)?;
            
            let crew = Crew {
                crew_id: crew_id.clone(),
                name: Some(format!("Tool Research Crew: {}", topic)),
                platform: config.primary_platform.platform,
                subagents: crew_subagents,
                task: format!("Research {} tools for {}", topic, framework.unwrap_or("detected framework")),
                created_by: CrewCreator::Orchestrator { tier_id: "interview-phase-8".to_string() },
                created_at: Utc::now(),
                status: CrewStatus::Active,
            };
            
            self.crew_manager.create_crew(crew).await?;
            
            // Assign research tasks to crew members
            for (i, (agent_id, task)) in research_tasks.iter().enumerate() {
                let message = AgentMessage {
                    message_id: generate_message_id(),
                    from_agent_id: "research-orchestrator".to_string(),
                    from_platform: config.primary_platform.platform,
                    to_agent_id: Some(agent_id.clone()),
                    message_type: MessageType::Request,
                    subject: "Research assignment".to_string(),
                    content: task.clone(),
                    context: MessageContext {
                        crew_id: Some(crew_id.clone()),
                        research_id: Some(research_id.clone()),
                    },
                    thread_id: None,
                    in_reply_to: None,
                    created_at: Utc::now(),
                    read_by: Vec::new(),
                    resolved: false,
                };
                
                self.crew_manager.post_to_crew(&crew_id, message).await?;
            }
            
            Some((crew_id, research_id))
        } else {
            None
        };
        
        // Execute research (with or without crew)
        let research_result = if let Some((crew_id, _)) = &research_crew {
            // Research with crew coordination
            self.execute_parallel_research_with_crew(topic, context, framework, &crew_id).await?
        } else {
            // Single-subagent research (no crew)
            self.execute_single_research(topic, context, framework).await?
        };
        
        // Disband research crew if it exists
        if let Some((crew_id, research_id)) = research_crew {
            // Archive research messages to canonical storage / projection
            let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
            self.persist_research_crew_messages(&research_id, &messages).await?;
            
            // Disband crew
            self.crew_manager.disband_crew(&crew_id, "Research completed").await?;
        }
        
        Ok(research_result)
    }
    
    async fn execute_parallel_research_with_crew(
        &self,
        topic: &str,
        context: &str,
        framework: Option<&str>,
        crew_id: &str,
    ) -> Result<ResearchResult> {
        // Get crew members
        let crew = self.crew_manager.get_crew(crew_id).await?;
        
        // Execute research for each crew member in parallel
        let mut research_tasks = Vec::new();
        for member in &crew.subagents {
            let task = tokio::spawn({
                let crew_id = crew_id.to_string();
                let member_id = member.agent_id.clone();
                let topic = topic.to_string();
                let context = context.to_string();
                let framework = framework.map(|s| s.to_string());
                
                async move {
                    // Execute research for this crew member
                    let result = self.execute_research_for_member(
                        &member_id,
                        &topic,
                        &context,
                        framework.as_deref(),
                    ).await?;
                    
                    // Post findings to crew message board
                    let findings_message = AgentMessage {
                        message_id: generate_message_id(),
                        from_agent_id: member_id.clone(),
                        from_platform: member.platform,
                        to_agent_id: None,
                        message_type: MessageType::Update,
                        subject: format!("Research findings: {}", topic),
                        content: format!("Found {} tools:\n{}", result.tools.len(), 
                            result.tools.iter().map(|t| format!("- {}", t.name)).collect::<Vec<_>>().join("\n")),
                        context: MessageContext {
                            crew_id: Some(crew_id),
                        },
                        thread_id: None,
                        in_reply_to: None,
                        created_at: Utc::now(),
                        read_by: Vec::new(),
                        resolved: false,
                    };
                    
                    self.crew_manager.post_to_crew(&crew_id, findings_message).await?;
                    
                    Ok::<ResearchResult, Error>(result)
                }
            });
            
            research_tasks.push(task);
        }
        
        // Wait for all research tasks to complete
        let mut all_results = Vec::new();
        for task in research_tasks {
            let result = task.await??;
            all_results.push(result);
        }
        
        // Merge research results from all crew members
        let merged_result = self.merge_research_results(all_results)?;
        
        // Validate merged results (crew members review each other's findings)
        let validated_result = self.validate_research_results_with_crew(&merged_result, crew_id).await?;
        
        Ok(validated_result)
    }
    
    fn divide_research_scope(
        &self,
        topic: &str,
        framework: Option<&str>,
        subagents: &[(String, String)],
    ) -> Result<Vec<(String, String)>> {
        // Divide research scope based on subagent expertise
        let mut tasks = Vec::new();
        
        for (agent_type, agent_id) in subagents {
            let task = match agent_type.as_str() {
                "ux-researcher" => format!("Research UX tools for {} framework", framework.unwrap_or("detected")),
                "qa-expert" => format!("Research testing tools for {} framework", framework.unwrap_or("detected")),
                "test-automator" => format!("Research automation tools for {} framework", framework.unwrap_or("detected")),
                _ => format!("Research {} tools for {} framework", topic, framework.unwrap_or("detected")),
            };
            
            tasks.push((agent_id.clone(), task));
        }
        
        Ok(tasks)
    }
    
    async fn validate_research_results_with_crew(
        &self,
        results: &ResearchResult,
        crew_id: &str,
    ) -> Result<ResearchResult> {
        // Post research results to crew for validation
        let validation_message = AgentMessage {
            message_id: generate_message_id(),
            from_agent_id: "research-orchestrator".to_string(),
            from_platform: /* ... */,
            to_agent_id: None,
            message_type: MessageType::Request,
            subject: "Validate research results".to_string(),
            content: format!("Please review and validate these research results:\n{}", 
                serde_json::to_string_pretty(results)?),
            context: MessageContext {
                crew_id: Some(crew_id.to_string()),
            },
            thread_id: None,
            in_reply_to: None,
            created_at: Utc::now(),
            read_by: Vec::new(),
            resolved: false,
        };
        
        self.crew_manager.post_to_crew(crew_id, validation_message).await?;
        
        // **Interview Validation Timeout (Resolved):**
        // - Timeout: **30 seconds** for validation responses.
        // - Config: `interview.validation_timeout_s`, default `30`.
        // - On timeout: **proceed with partial results**. Validations that responded are
        //   included; validations that timed out are logged as warnings (not failures)
        //   in the phase summary.
        // - Seglog event: `interview.validation.timeout` with details of which validators
        //   timed out.
        // - Rationale: validation is best-effort; a slow validator should not block the
        //   interview flow.
        let validation_responses = self.crew_manager.wait_for_responses(
            crew_id,
            MessageType::Answer,
            chrono::Duration::seconds(30),
        ).await?;
        
        // Merge validation feedback
        let validated_results = self.apply_validation_feedback(results, &validation_responses)?;
        
        Ok(validated_results)
    }
}
```

**Error handling:**

- **Research crew creation failure:** If crew creation fails, log warning and fall back to single-subagent research
- **Research task assignment failure:** If task assignment fails, log error and proceed with available crew members
- **Research coordination failure:** If message board access fails during research, log warning and continue (crew members work independently)
- **Validation failure:** If validation fails, log warning and proceed with unvalidated results (catalog update may be incomplete)

