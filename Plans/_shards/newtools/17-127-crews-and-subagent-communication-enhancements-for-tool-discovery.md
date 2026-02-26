## 12.7 Crews and Subagent Communication Enhancements for Tool Discovery

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance the **tool discovery and research flow** to enable better coordination between research subagents.

### 1. Research Crews for Parallel Tool Discovery

**Concept:** When the interview performs tool research (e.g., via Context7 MCP, web search, catalog lookup), use crews to coordinate multiple researchers working in parallel.

**Benefits:**
- **Parallel research:** Multiple research subagents can research different tools simultaneously (e.g., `ux-researcher` researches UX tools, `qa-expert` researches testing tools, `test-automator` researches automation tools)
- **Coordinated catalog updates:** Researchers can coordinate catalog entries to avoid duplicates and ensure consistency
- **Conflict resolution:** Researchers can discuss conflicting tool recommendations via crew messages
- **Shared findings:** Research findings are shared via crew messages before catalog update

**BeforeResearch crew creation responsibilities:**

- **Determine research subagents:** Identify which research subagents are needed based on GUI framework and research scope (e.g., Iced framework → `ux-researcher` + `qa-expert` + `test-automator`)
- **Create research crew:** Create crew with selected research subagents, crew_id = `tool-research-{research_id}`
- **Assign research domains:** Divide research scope among crew members (e.g., `ux-researcher` → UX tools, `qa-expert` → testing tools, `test-automator` → automation tools)
- **Initialize research coordination:** Set up message board for research crew with research_id context

**DuringResearch crew coordination responsibilities:**

- **Coordinate research assignments:** Crew members post their assigned research domains to message board to avoid overlap
- **Share research findings:** Crew members post discovered tools to message board as they find them
- **Resolve conflicts:** If crew members find conflicting information about the same tool, they discuss via message board
- **Coordinate catalog entry proposals:** Before proposing catalog entries, crew members post proposed entries to message board for review

**AfterResearch crew completion responsibilities:**

- **Validate research results:** Crew members review each other's research results before catalog update
- **Merge research findings:** Combine findings from all crew members into unified catalog entries
- **Archive research messages:** Archive research crew messages to `.puppet-master/memory/tool-research-{research_id}-messages.json`
- **Disband research crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/interview/research_engine.rs` to create research crews, coordinate research operations, and disband crews after research completes. Integration details match interview plan §4 "Research Crews for Tool Discovery" (see that section for full code examples).

**Integration with research engine:**

In `src/interview/research_engine.rs`, when `execute_research_ai_call` is called for tool research:

```rust
impl ResearchEngine {
    pub async fn execute_research_ai_call(
        &self,
        prompt: &str,
        working_dir: &Path,
        framework: Option<&str>,
    ) -> Result<ResearchResult> {
        // Determine if research should use crew (multiple subagents needed)
        let research_subagents = self.select_research_subagents_for_framework(framework)?;
        
        if research_subagents.len() > 1 {
            // Create research crew and execute parallel research
            self.execute_research_with_crew(prompt, working_dir, framework, &research_subagents).await
        } else {
            // Single-subagent research (no crew)
            self.execute_single_research(prompt, working_dir, framework).await
        }
    }
    
    fn select_research_subagents_for_framework(
        &self,
        framework: Option<&str>,
    ) -> Result<Vec<(String, String)>> {
        // Select research subagents based on framework
        // E.g., Iced → ux-researcher + qa-expert + test-automator
        // E.g., Dioxus → ux-researcher + test-automator
        match framework {
            Some("iced") | Some("Iced") => Ok(vec![
                ("ux-researcher".to_string(), "ux-researcher-1".to_string()),
                ("qa-expert".to_string(), "qa-expert-1".to_string()),
                ("test-automator".to_string(), "test-automator-1".to_string()),
            ]),
            Some("dioxus") | Some("Dioxus") => Ok(vec![
                ("ux-researcher".to_string(), "ux-researcher-1".to_string()),
                ("test-automator".to_string(), "test-automator-1".to_string()),
            ]),
            _ => Ok(vec![("qa-expert".to_string(), "qa-expert-1".to_string())]),
        }
    }
}
```

**Error handling:**

- **Research crew creation failure:** If crew creation fails, log warning and fall back to single-subagent research
- **Research coordination failure:** If message board access fails during research, log warning and continue (crew members work independently)
- **Research validation failure:** If validation fails, log warning and proceed with unvalidated results

### 2. Crew Coordination for Catalog Updates

**Concept:** When research populates or extends the catalog, crew members coordinate to ensure catalog entries are consistent and complete.

**Benefits:**
- **Consistency:** Crew members can review each other's catalog entries
- **Completeness:** Crew members can suggest additional tools or capabilities
- **Validation:** Crew members can validate catalog entries before persistence

**BeforeCatalogUpdate crew coordination responsibilities:**

- **Post proposed catalog entries:** Crew members post proposed catalog entries to crew message board with `message_type` = `Update`
- **Review proposed entries:** Other crew members review proposed entries and post comments/questions via message board
- **Resolve conflicts:** If crew members propose conflicting entries for the same tool, they discuss via message board to reach consensus

**DuringCatalogUpdate crew coordination responsibilities:**

- **Validate entry format:** Crew members validate that proposed entries match `ToolCatalogEntry` schema
- **Check for duplicates:** Crew members check if proposed entries duplicate existing catalog entries
- **Suggest improvements:** Crew members suggest improvements to proposed entries (e.g., additional capabilities, better descriptions)

**AfterCatalogUpdate crew coordination responsibilities:**

- **Confirm catalog update:** Crew members confirm that catalog was updated correctly
- **Archive coordination messages:** Archive catalog coordination messages to `.puppet-master/memory/catalog-update-{update_id}-messages.json`
- **Update crew status:** Mark crew as having completed catalog update coordination

**Implementation:** Extend `src/interview/gui_tool_catalog.rs` to coordinate catalog updates via crew message board before persisting entries.

**Integration with catalog:**

In `src/interview/gui_tool_catalog.rs`, extend catalog update operations:

```rust
impl GuiToolCatalog {
    pub async fn add_entry_with_crew_coordination(
        &self,
        entry: ToolCatalogEntry,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Post proposed entry to crew for review
            let proposal_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "catalog-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Update,
                subject: "Proposed catalog entry".to_string(),
                content: serde_json::to_string_pretty(&entry)?,
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, proposal_message).await?;
            
            // Wait for crew review (or timeout after 10 seconds)
            let review_responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(10),
            ).await?;
            
            // Apply review feedback
            let validated_entry = self.apply_review_feedback(&entry, &review_responses)?;
            
            // Add validated entry to catalog
            self.add_entry(validated_entry).await?;
            
            // Post confirmation to crew
            let confirmation_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "catalog-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Catalog entry added".to_string(),
                content: format!("Catalog entry for {} added successfully", entry.tool_name),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, confirmation_message).await?;
        } else {
            // No crew coordination, add entry directly
            self.add_entry(entry).await?;
        }
        
        Ok(())
    }
    
    fn apply_review_feedback(
        &self,
        entry: &ToolCatalogEntry,
        review_responses: &[AgentMessage],
    ) -> Result<ToolCatalogEntry> {
        let mut updated_entry = entry.clone();
        
        for review in review_responses {
            // Parse review feedback and apply suggestions
            // E.g., if review suggests additional capabilities, add them
            // E.g., if review suggests better description, update it
            // Implementation depends on review message format
        }
        
        Ok(updated_entry)
    }
}
```

**Error handling:**

- **Crew coordination failure:** If crew coordination fails, log warning and proceed with direct catalog update (no coordination)
- **Review timeout:** If crew review times out, log warning and proceed with original entry (no review feedback applied)
- **Review feedback parsing failure:** If review feedback cannot be parsed, log warning and proceed with original entry

