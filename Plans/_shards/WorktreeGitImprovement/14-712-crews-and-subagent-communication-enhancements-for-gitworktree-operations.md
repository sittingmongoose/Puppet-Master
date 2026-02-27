## 7.12 Crews and Subagent Communication Enhancements for Git/Worktree Operations

**Status: Optional / Phase 6 (or later).** Not required for initial Worktree/Git release. Depends on Plans/orchestrator-subagent-integration.md Crews (CrewManager, AgentMessage, message board, etc.) being implemented and exposed to the git layer. When implementing, align code samples with actual APIs: e.g. `PrManager::create_pr(title, body, base, head)` and `Result<PrResult>`; `WorktreeManager::create_worktree(tier_id, branch)` takes two args; call `get_worktree_path` only after `create_worktree`.

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance **git and worktree operations** to enable better coordination between git operations and subagents.

### 1. Git Operation Crews

**Concept:** When orchestrator performs git operations (branch creation, commits, PR creation), crews can coordinate multiple subagents working on related git operations.

**Benefits:**
- **Coordinated commits:** Multiple subagents can coordinate commit messages and branch naming
- **PR coordination:** Subagents can discuss PR content and review requirements
- **Conflict prevention:** Crews can coordinate to avoid git conflicts

**BeforeGitOp crew creation responsibilities:**

- **Identify parallel git operations:** When orchestrator creates parallel subtasks that will perform git operations, identify if they need coordination
- **Create git operation crew:** Create crew with subagents from parallel subtasks, crew_id = `git-op-{tier_id}`
- **Initialize git coordination:** Set up message board for git operation crew with tier_id context
- **Register worktree paths:** Crew members register their worktree paths in coordination state

**DuringGitOp crew coordination responsibilities:**

- **Coordinate branch names:** Crew members coordinate branch names to avoid conflicts (e.g., `subtask/ST-001-001-001`, `subtask/ST-001-001-002`)
- **Coordinate commit messages:** Crew members coordinate commit message formats to ensure consistency (e.g., `pm: [ITERATION] ...`)
- **Coordinate PR content:** Crew members coordinate PR titles, descriptions, and review requirements
- **Avoid git conflicts:** Crew members check coordination state before editing files to avoid conflicts

**AfterGitOp crew completion responsibilities:**

- **Validate git operations:** Crew members confirm that git operations completed successfully
- **Archive git coordination messages:** Archive git coordination messages to `.puppet-master/memory/git-op-{tier_id}-messages.json`
- **Disband git crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/git/git_manager.rs`, `src/git/worktree_manager.rs`, and `src/git/pr_manager.rs` to create git operation crews, coordinate git operations, and disband crews after operations complete.

**Integration with git managers:**

In `src/git/git_manager.rs`, extend branch creation:

```rust
impl GitManager {
    pub async fn create_tier_branch_with_crew_coordination(
        &self,
        tier_id: &str,
        branch_name: &str,
        crew_id: Option<&str>,
    ) -> Result<String> {
        if let Some(crew_id) = crew_id {
            // Coordinate branch name with crew
            let coordination_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("git-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Branch name coordination".to_string(),
                content: format!("Proposed branch name: {}. Please confirm or suggest alternative.", branch_name),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, coordination_message).await?;
            
            // Wait for crew responses (or timeout after 5 seconds)
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Use coordinated branch name (or original if no response)
            let final_branch_name = if let Some(response) = responses.first() {
                // Parse response to extract alternative branch name if suggested
                self.parse_branch_name_from_response(response)?
                    .unwrap_or_else(|| branch_name.to_string())
            } else {
                branch_name.to_string()
            };
            
            // Create branch with coordinated name
            self.create_branch(&final_branch_name).await?;
            
            Ok(final_branch_name)
        } else {
            // No crew coordination, create branch directly
            self.create_branch(branch_name).await?;
            Ok(branch_name.to_string())
        }
    }
}
```

In `src/git/pr_manager.rs`, extend PR creation:

```rust
impl PrManager {
    pub async fn create_pr_with_crew_coordination(
        &self,
        branch_name: &str,
        title: &str,
        description: &str,
        crew_id: Option<&str>,
    ) -> Result<String> {
        if let Some(crew_id) = crew_id {
            // Coordinate PR content with crew
            let pr_proposal_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "pr-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "PR content coordination".to_string(),
                content: format!("Proposed PR:\nTitle: {}\nDescription: {}\n\nPlease review and suggest improvements.", title, description),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, pr_proposal_message).await?;
            
            // Wait for crew responses (or timeout after 10 seconds)
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(10),
            ).await?;
            
            // Apply crew feedback to PR content
            let (final_title, final_description) = self.apply_pr_feedback(title, description, &responses)?;
            
            // Create PR with coordinated content
            let pr_url = self.create_pr(branch_name, &final_title, &final_description).await?;
            
            Ok(pr_url)
        } else {
            // No crew coordination, create PR directly
            self.create_pr(branch_name, title, description).await?;
            Ok(/* pr_url */)
        }
    }
}
```

**Error handling:**

- **Git crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Branch name coordination failure:** If branch name coordination fails, log warning and use original branch name
- **PR coordination failure:** If PR coordination fails, log warning and proceed with original PR content

### 2. Worktree Coordination via Crews

**Concept:** When orchestrator creates worktrees for parallel subtasks, crews can coordinate to ensure worktrees are used correctly and conflicts are avoided.

**Benefits:**
- **Worktree awareness:** Crew members know which worktrees are in use
- **Conflict prevention:** Crew members can coordinate to avoid editing files in the same worktree
- **Merge coordination:** Crew members can coordinate merge order and conflict resolution

**BeforeWorktreeCreation crew coordination responsibilities:**

- **Identify parallel worktrees:** When orchestrator creates parallel subtasks that will use worktrees, identify if they need coordination
- **Create worktree coordination crew:** Create crew with subagents from parallel subtasks, crew_id = `worktree-coord-{tier_id}`
- **Register worktree paths:** Crew members register their worktree paths in coordination state before creation

**DuringWorktreeUsage crew coordination responsibilities:**

- **Check worktree availability:** Crew members check coordination state before editing files to ensure worktree is available
- **Coordinate file edits:** Crew members coordinate which files they will edit to avoid conflicts
- **Coordinate merge order:** Crew members coordinate merge order to avoid merge conflicts

**AfterWorktreeMerge crew coordination responsibilities:**

- **Validate merge results:** Crew members confirm that merges completed successfully
- **Archive worktree coordination messages:** Archive worktree coordination messages to `.puppet-master/memory/worktree-coord-{tier_id}-messages.json`
- **Disband worktree crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/git/worktree_manager.rs` to create worktree coordination crews, coordinate worktree usage, and disband crews after merges complete.

**Integration with worktree manager:**

In `src/git/worktree_manager.rs`, extend worktree creation:

```rust
impl WorktreeManager {
    pub async fn create_subtask_worktree_with_crew_coordination(
        &self,
        tier_id: &str,
        crew_id: Option<&str>,
    ) -> Result<PathBuf> {
        if let Some(crew_id) = crew_id {
            // Register worktree path in coordination state
            let worktree_path = self.get_worktree_path(tier_id);
            
            let registration_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Worktree registration".to_string(),
                content: format!("Registering worktree path: {}", worktree_path.display()),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, registration_message).await?;
            
            // Create worktree
            self.create_worktree(tier_id).await?;
            
            Ok(worktree_path)
        } else {
            // No crew coordination, create worktree directly
            self.create_worktree(tier_id).await?;
            Ok(self.get_worktree_path(tier_id))
        }
    }
    
    pub async fn merge_worktree_with_crew_coordination(
        &self,
        tier_id: &str,
        target_branch: &str,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Coordinate merge order with crew
            let merge_coordination_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Merge order coordination".to_string(),
                content: format!("Requesting merge order for worktree {} to branch {}", tier_id, target_branch),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, merge_coordination_message).await?;
            
            // **Merge-Order Coordination Timeout (Resolved):**
            // - Timeout: **5 seconds** for crew merge-order responses.
            // - On timeout: **proceed with default order** (alphabetical by worktree name).
            //   Log warning `merge.coordination.timeout` seglog event.
            // - Do NOT block. Merge coordination is best-effort optimization; alphabetical
            //   order is deterministic and safe.
            // - Config: `git.merge_coordination_timeout_s`, default `5`.
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Decision,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Determine merge order from crew responses (fallback: alphabetical by worktree name)
            let merge_order = self.determine_merge_order_from_responses(&responses)?;
            
            // Wait for turn if not first in merge order
            if merge_order > 0 {
                self.wait_for_merge_turn(crew_id, merge_order).await?;
            }
            
            // Perform merge
            self.merge_worktree(tier_id, target_branch).await?;
            
            // Notify crew that merge completed
            let completion_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Merge completed".to_string(),
                content: format!("Worktree {} merged to branch {}", tier_id, target_branch),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, completion_message).await?;
        } else {
            // No crew coordination, merge directly
            self.merge_worktree(tier_id, target_branch).await?;
        }
        
        Ok(())
    }
}
```

**Error handling:**

- **Worktree crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Worktree registration failure:** If worktree registration fails, log warning and proceed (coordination may be incomplete)
- **Merge coordination failure:** If merge coordination fails, log warning and proceed with direct merge (may cause conflicts)

