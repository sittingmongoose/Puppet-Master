## 10.5 Crews and Subagent Communication Enhancements for Cleanup Operations

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance **cleanup operations** to enable better coordination between cleanup operations and subagents.

### 1. Cleanup Coordination via Crews

**Concept:** When orchestrator performs cleanup operations, crews can coordinate to ensure cleanup is safe and effective.

**Benefits:**
- **Safe cleanup:** Crew members can warn about files that should not be cleaned
- **Coordinated cleanup:** Multiple cleanup operations can coordinate to avoid conflicts
- **Evidence preservation:** Crew members can coordinate to preserve evidence files

**BeforeCleanup crew coordination responsibilities:**

- **Identify cleanup scope:** Determine which files/directories will be cleaned and which subagents are involved
- **Create cleanup crew:** Create crew with subagents involved in cleanup operations, crew_id = `cleanup-{cleanup_id}`
- **Post cleanup warnings:** Crew members post warnings about files that should not be cleaned (e.g., evidence files, state files)
- **Coordinate cleanup order:** Crew members coordinate cleanup order to avoid conflicts

**DuringCleanup crew coordination responsibilities:**

- **Monitor cleanup progress:** Crew members post updates about cleanup progress
- **Handle cleanup conflicts:** If cleanup conflicts arise, crew members coordinate resolution
- **Preserve evidence files:** Crew members ensure evidence files are not cleaned

**AfterCleanup crew completion responsibilities:**

- **Validate cleanup results:** Crew members confirm that cleanup completed successfully and evidence files were preserved
- **Archive cleanup coordination messages:** Archive cleanup coordination messages to `.puppet-master/memory/cleanup-{cleanup_id}-messages.json`
- **Disband cleanup crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/cleanup/workspace.rs` to create cleanup crews, coordinate cleanup operations, and disband crews after cleanup completes.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Integration with cleanup module:**

In `src/cleanup/workspace.rs`, extend cleanup operations:

```rust
impl CleanupModule {
    pub async fn prepare_working_directory_with_crew_coordination(
        &self,
        work_dir: &Path,
        config: &CleanupConfig,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Post cleanup plan to crew for review
            let cleanup_plan_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "cleanup-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Cleanup plan review".to_string(),
                content: format!(
                    "Proposed cleanup plan:\nWork directory: {}\nClean untracked: {}\nClean ignored: {}\nAllowlist: {:?}\n\nPlease review and warn about files that should not be cleaned.",
                    work_dir.display(),
                    config.untracked,
                    config.clean_ignored,
                    cleanup_exclude_patterns()
                ),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, cleanup_plan_message).await?;
            
            // Wait for crew warnings (or timeout after 5 seconds)
            let warnings = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Warning,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Apply warnings to cleanup config (add additional exclude patterns)
            let updated_config = self.apply_cleanup_warnings(config, &warnings)?;
            
            // Perform cleanup with updated config
            self.prepare_working_directory(work_dir, &updated_config).await?;
            
            // Post cleanup completion to crew
            let completion_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "cleanup-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Cleanup completed".to_string(),
                content: format!("Cleanup completed for work directory: {}", work_dir.display()),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, completion_message).await?;
        } else {
            // No crew coordination, perform cleanup directly
            self.prepare_working_directory(work_dir, config).await?;
        }
        
        Ok(())
    }
    
    fn apply_cleanup_warnings(
        &self,
        config: &CleanupConfig,
        warnings: &[AgentMessage],
    ) -> Result<CleanupConfig> {
        let mut updated_config = config.clone();
        
        // Extract additional exclude patterns from warnings
        let mut additional_excludes = Vec::new();
        for warning in warnings {
            // Parse warning content to extract file paths/patterns that should not be cleaned
            // E.g., "Do not clean .puppet-master/evidence/test-results.json"
            let exclude_patterns = self.extract_exclude_patterns_from_warning(warning)?;
            additional_excludes.extend(exclude_patterns);
        }
        
        // Add additional excludes to config (implementation depends on CleanupConfig structure)
        // updated_config.additional_excludes.extend(additional_excludes);
        
        Ok(updated_config)
    }
    
    fn extract_exclude_patterns_from_warning(
        &self,
        warning: &AgentMessage,
    ) -> Result<Vec<String>> {
        // Parse warning content to extract exclude patterns
        // Simple implementation: look for file paths mentioned in warning
        let mut patterns = Vec::new();
        
        // Extract paths from warning content (simple regex or string matching)
        // E.g., "Do not clean .puppet-master/evidence/test-results.json" → ".puppet-master/evidence/test-results.json"
        // Implementation depends on warning message format
        
        Ok(patterns)
    }
}
```

**Error handling:**

- **Cleanup crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Cleanup warning parsing failure:** If cleanup warnings cannot be parsed, log warning and proceed with original config
- **Cleanup coordination failure:** If cleanup coordination fails, log warning and proceed with direct cleanup (may clean files that should be preserved)

