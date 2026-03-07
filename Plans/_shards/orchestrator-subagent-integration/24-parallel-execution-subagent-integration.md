## Parallel Execution & Subagent Integration

### Current Parallel Execution Capabilities

The orchestrator already supports parallel execution of subtasks:

1. **Dependency Analysis**: Uses `DependencyAnalyzer` with Kahn's topological sort to build execution levels
2. **Parallel Executor (`ParallelExecutor`)**: Executes subtasks concurrently within dependency levels
3. **Worktree Isolation**: Each parallel subtask runs in its own git worktree
4. **Dependency-Aware**: Respects `TierNode.dependencies` to determine execution order

**Execution Flow:**
```
Level 0: [Subtask A, Subtask B] → Run in parallel (no dependencies)
Level 1: [Subtask C] → Runs after A and B complete
Level 2: [Subtask D] → Runs after C completes
```

### Subagent Selection for Parallel Subtasks

When subtasks run in parallel, each subtask can have **different subagents** selected independently:

**Example Scenario:**
- **Subtask A** (Rust backend API): `rust-engineer` + `backend-developer`
- **Subtask B** (React frontend UI): `react-specialist` + `frontend-developer`
- Both run in parallel (Level 0), each with their own specialized subagents

**Implementation:**

```rust
// src/core/orchestrator.rs (modifications to execute_subtasks_parallel)

async fn execute_subtasks_parallel(&self, subtask_ids: &[String]) -> Result<Vec<Result<()>>> {
    // ... existing dependency analysis ...

    // Get parallelizable groups
    let groups = self.dependency_analyzer.get_parallelizable_groups(dependencies)?;

    // Execute each group sequentially
    for group in groups {
        // Create worktrees for each subtask
        for id in &group {
            let _ = self.create_subtask_worktree(id).await?;
        }

        // Execute subtasks in parallel, each with its own subagent selection
        let results = join_all(group.iter().map(|id| async {
            let tree = self.tier_tree.lock().unwrap();
            let tier_node = tree.find_by_id(id).unwrap();

            // Build context for this specific subtask
            let tier_context = self.build_tier_context(&tier_node, &context)?;

            // DRY REQUIREMENT: Subagent selection MUST use subagent_selector which uses subagent_registry — NEVER hardcode subagent names
            // Select subagents for THIS subtask (independent of others)
            let subagent_names = self.subagent_selector.select_for_tier(
                TierType::Subtask,
                &tier_context,
            );
            // DRY: Validate selected subagent names using subagent_registry::is_valid_subagent_name()
            for name in &subagent_names {
                if !subagent_registry::is_valid_subagent_name(name) {
                    log::warn!("Invalid subagent name selected: {}", name);
                }
            }

            // DRY REQUIREMENT: execute_tier_with_subagents MUST use platform_specs for platform-specific invocation
            // Execute with selected subagents
            self.execute_tier_with_subagents(&tier_node, &tier_context, &subagent_names).await
        })).await;

        // ... cleanup ...
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Context Flow Through Dependency Chains

Subagents can inherit context from completed dependencies:

**Dependency Chain Example:**
```
Subtask A (rust-engineer) → Subtask B (rust-engineer + test-automator)
```

**Implementation:**

```rust
// src/core/subagent_selector.rs (additions)

impl SubagentSelector {
    // DRY:FN:select_with_dependency_context — Select subagents with dependency context
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_language() — NEVER hardcode language → subagent mappings
    /// Select subagents with dependency context
    pub fn select_with_dependency_context(
        &self,
        tier_node: &TierNode,
        completed_dependencies: &[TierNode],
        tier_context: &TierContext,
    ) -> Vec<String> {
        let mut subagents = self.select_for_tier(tier_node.tier_type, tier_context);

        // DRY REQUIREMENT: language_to_subagent MUST use subagent_registry::get_subagent_for_language()
        // Inherit language/domain from completed dependencies
        for dep in completed_dependencies {
            if let Some(dep_context) = self.get_tier_context(dep) {
                // Inherit language if not already set
                if tier_context.primary_language.is_none() {
                    if let Some(lang) = &dep_context.primary_language {
                        // DRY: Use subagent_registry — DO NOT call self.language_to_subagent which may hardcode mappings
                        if let Some(subagent) = subagent_registry::get_subagent_for_language(lang) {
                            if !subagents.contains(&subagent) {
                                subagents.insert(0, subagent); // Prioritize inherited language
                            }
                        }
                    }
                }

                // Inherit domain if not already set
                if tier_context.domain == ProjectDomain::Unknown {
                    // Use domain from dependency
                }
            }
        }

        subagents
    }
}
```

### Agent Coordination and Communication

When multiple agents/subagents run concurrently (parallel subtasks, different tiers, or same tier with multiple subagents), they need **coordination** to avoid conflicts, understand what others are working on, and not "freak out" when code changes around them.

**Benefits of coordination:**

- **Conflict prevention:** Agents know what files/modules others are modifying, avoiding simultaneous edits
- **Context awareness:** Agents understand what other agents are working on, reducing confusion when seeing changes
- **Efficient collaboration:** Agents can build on each other's work, reference shared decisions, and avoid duplicate effort
- **Reduced errors:** Agents don't overwrite each other's changes or create conflicting implementations
- **Cross-platform coordination:** Agents from different platforms (Codex, Claude, Cursor, Gemini, Copilot) can coordinate with each other through shared state files

**Coordination mechanisms:**

1. **Shared state files (existing):** All agents read `progress.txt`, `AGENTS.md`, `prd.json` -- these provide **asynchronous** coordination (agents see what others have done, not what they're doing now).

2. **Real-time coordination state (new, cross-platform):** Add `.puppet-master/state/active-agents.json` that tracks:
   - Which agents/subagents are currently active (including platform: "codex", "claude", "cursor", "gemini", "copilot")
   - What files/modules each agent is working on
   - What operations each agent is performing (e.g., "editing src/api.rs", "running tests")
   - Platform identifier (so agents know which platform other agents are using)
   - Timestamp of last update

   **This file-based coordination works across ALL platforms** -- a Codex agent can see what a Claude agent is doing, and vice versa. All platforms read/write to the same JSON file.

3. **Provider-bridge coordination (current):**

   - No same-platform shared thread/session coordination path is active.
   - Codex and Copilot follow the same file-based coordination contract as Cursor/Claude/Gemini.
   - Cross-platform and same-platform coordination both use `active-agents.json` + prompt injection.

4. **Cross-worktree awareness:** Even when agents run in separate worktrees, they can:
   - Read shared state files from main repo (progress.txt, prd.json)
   - Read active-agents.json to see what others are doing (regardless of platform)
   - Write their own status to active-agents.json before starting work
   - Update status as they work (file being edited, operation in progress)

5. **Prompt injection:** Inject coordination context into each agent's prompt:
   ```
   **Active Agents:**
   - rust-engineer (Codex) is editing src/api.rs (started 2 minutes ago)
   - test-automator (Claude Code) is running tests in tests/api_test.rs (started 1 minute ago)

   **Files Being Modified:**
   - src/api.rs (by rust-engineer on Codex)
   - tests/api_test.rs (by test-automator on Claude Code)

   **Your Task:** Implement authentication middleware. Avoid editing src/api.rs until rust-engineer finishes.
   ```

**Cross-platform coordination example:**

When a Codex agent and a Claude Code agent work simultaneously:

```
1. Codex agent (rust-engineer) starts Subtask A:
   - Registers in active-agents.json:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "tier_id": "1.1.1",
       "current_operation": "Starting API implementation",
       "files_being_edited": []
     }

2. Claude Code agent (test-automator) starts Subtask B (parallel):
   - Reads active-agents.json before starting
   - Sees: "rust-engineer (Codex) is working on Subtask A"
   - Registers itself:
     {
       "agent_id": "test-automator-1.1.2",
       "platform": "claude",
       "tier_id": "1.1.2",
       "current_operation": "Starting test implementation",
       "files_being_edited": []
     }

3. Codex agent begins editing src/api.rs:
   - Updates active-agents.json:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "files_being_edited": ["src/api.rs"],
       "current_operation": "Editing src/api.rs to add POST /users endpoint"
     }

4. Claude Code agent reads coordination state (periodic check):
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs. **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."
   - Agent understands context and avoids editing src/api.rs

5. Codex agent completes:
   - Unregisters from active-agents.json
   - Claude Code agent can now safely edit src/api.rs for tests
```

**Platform field in coordination state:**

The `active-agents.json` includes a `platform` field so agents know which platform other agents are using:

```json
{
  "active_agents": {
    "rust-engineer-1.1.1": {
      "agent_id": "rust-engineer-1.1.1",
      "platform": "codex",
      "tier_id": "1.1.1",
      "worktree_path": ".puppet-master/worktrees/1.1.1",
      "files_being_edited": ["src/api.rs"],
      "current_operation": "Editing src/api.rs",
      "started_at": "2026-02-18T10:00:00Z",
      "last_update": "2026-02-18T10:02:00Z"
    },
    "test-automator-1.1.2": {
      "agent_id": "test-automator-1.1.2",
      "platform": "claude",
      "tier_id": "1.1.2",
      "worktree_path": ".puppet-master/worktrees/1.1.2",
      "files_being_edited": ["tests/api_test.rs"],
      "current_operation": "Writing tests for API endpoint",
      "started_at": "2026-02-18T10:01:00Z",
      "last_update": "2026-02-18T10:03:00Z"
    }
  },
  "last_updated": "2026-02-18T10:03:00Z"
}
```

This allows agents to see not just what others are doing, but also which platform they're using, which can be useful context (e.g., "Codex agent is working on this, Claude agent is working on that").

**Implementation:**

```rust
// src/core/agent_coordination.rs (new module)

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:ActiveAgent — Active agent coordination state
pub struct ActiveAgent {
    pub agent_id: String, // e.g., "rust-engineer", "test-automator"
    pub platform: Platform, // "codex", "claude", "cursor", "gemini", "copilot" - enables cross-platform coordination
    pub tier_id: String,
    pub worktree_path: Option<PathBuf>, // None if main repo
    pub files_being_edited: Vec<PathBuf>,
    pub current_operation: String, // e.g., "editing src/api.rs", "running tests"
    pub started_at: DateTime<Utc>,
    pub last_update: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCoordinationState {
    pub active_agents: HashMap<String, ActiveAgent>, // keyed by agent_id
    pub last_updated: DateTime<Utc>,
}

// DRY:DATA:AgentCoordinator — Agent coordination state manager
pub struct AgentCoordinator {
    state_file: PathBuf,
}

impl AgentCoordinator {
    // DRY:FN:new — Create agent coordinator
    pub fn new(project_root: &Path) -> Self {
        Self {
            state_file: project_root.join(".puppet-master").join("state").join("active-agents.json"),
        }
    }

    // DRY:FN:register_agent — Register an agent as active
    // DRY REQUIREMENT: Agent platform field MUST be from tier_config.platform — NEVER hardcode platform
    /// Register an agent as active
    pub async fn register_agent(&self, agent: ActiveAgent) -> Result<()> {
        // DRY: Validate agent_id format if needed — use subagent_registry::is_valid_subagent_name() for subagent names
        let mut state = self.load_state().await?;
        state.active_agents.insert(agent.agent_id.clone(), agent);
        state.last_updated = Utc::now();
        self.save_state(&state).await
    }

    /// Update agent status (files being edited, current operation)
    pub async fn update_agent_status(
        &self,
        agent_id: &str,
        files_being_edited: Vec<PathBuf>,
        current_operation: String,
    ) -> Result<()> {
        let mut state = self.load_state().await?;
        if let Some(agent) = state.active_agents.get_mut(agent_id) {
            agent.files_being_edited = files_being_edited;
            agent.current_operation = current_operation;
            agent.last_update = Utc::now();
            state.last_updated = Utc::now();
            self.save_state(&state).await
        } else {
            Err(anyhow!("Agent {} not found", agent_id))
        }
    }

    /// Unregister an agent (when it completes)
    pub async fn unregister_agent(&self, agent_id: &str) -> Result<()> {
        let mut state = self.load_state().await?;
        state.active_agents.remove(agent_id);
        state.last_updated = Utc::now();
        self.save_state(&state).await
    }

    // DRY:FN:get_coordination_context — Get coordination context for prompt injection
    /// Get coordination context for prompt injection
    pub async fn get_coordination_context(&self) -> Result<String> {
        let state = self.load_state().await?;
        let mut context = String::new();

        if !state.active_agents.is_empty() {
            context.push_str("**Active Agents:**\n");
            for agent in state.active_agents.values() {
                let age = Utc::now().signed_duration_since(agent.started_at);
                // DRY REQUIREMENT: Platform display name MUST use platform_specs::display_name_for() — NEVER hardcode platform names
                let platform_display = platform_specs::display_name_for(agent.platform);
                context.push_str(&format!(
                    "- {} ({}) is {} (started {} ago, tier: {})\n",
                    agent.agent_id,
                    platform_display, // Use platform_specs for display name
                    agent.current_operation,
                    format_duration(age),
                    agent.tier_id
                ));
            }

            context.push_str("\n**Files Being Modified:**\n");
            let mut all_files: Vec<_> = state.active_agents.values()
                .flat_map(|a| &a.files_being_edited)
                .collect();
            all_files.sort();
            all_files.dedup();
            for file in all_files {
                let agents: Vec<_> = state.active_agents.values()
                    .filter(|a| a.files_being_edited.contains(file))
                    .map(|a| &a.agent_id)
                    .collect();
                context.push_str(&format!(
                    "- {} (by {})\n",
                    file.display(),
                    agents.join(", ")
                ));
            }
        }

        Ok(context)
    }

    async fn load_state(&self) -> Result<AgentCoordinationState> {
        if self.state_file.exists() {
            let json = std::fs::read_to_string(&self.state_file)?;
            let state: AgentCoordinationState = serde_json::from_str(&json)?;
            // Prune stale agents (no update in last hour)
            let mut pruned = state.clone();
            let cutoff = Utc::now() - chrono::Duration::hours(1);
            pruned.active_agents.retain(|_, agent| agent.last_update > cutoff);
            if pruned.active_agents.len() != state.active_agents.len() {
                self.save_state(&pruned).await?;
            }
            Ok(pruned)
        } else {
            Ok(AgentCoordinationState {
                active_agents: HashMap::new(),
                last_updated: Utc::now(),
            })
        }
    }

    async fn save_state(&self, state: &AgentCoordinationState) -> Result<()> {
        std::fs::create_dir_all(self.state_file.parent().unwrap())?;
        let json = serde_json::to_string_pretty(state)?;
        std::fs::write(&self.state_file, json)?;
        Ok(())
    }
}

fn format_duration(d: chrono::Duration) -> String {
    if d.num_minutes() < 1 {
        format!("{}s", d.num_seconds())
    } else if d.num_hours() < 1 {
        format!("{}m", d.num_minutes())
    } else {
        format!("{}h {}m", d.num_hours(), d.num_minutes() % 60)
    }
}
```

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, before executing a tier:

```rust
// Before tier execution
let coordinator = AgentCoordinator::new(&self.config.project.working_directory);

// Register this agent/subagent as active (includes platform for cross-platform coordination)
coordinator.register_agent(ActiveAgent {
    agent_id: format!("{}-{}", subagent_name, tier_id),
    platform: tier_config.platform, // Include platform so other agents know which platform this agent uses
    tier_id: tier_id.to_string(),
    worktree_path: self.get_tier_worktree(tier_id),
    files_being_edited: Vec::new(), // Will update as agent works
    current_operation: format!("Starting tier {}", tier_id),
    started_at: Utc::now(),
    last_update: Utc::now(),
}).await?;

// Get coordination context and inject into prompt
let coordination_context = coordinator.get_coordination_context().await?;
let enhanced_prompt = if !coordination_context.is_empty() {
    format!("{}\n\n{}", prompt, coordination_context)
} else {
    prompt
};

// During execution, update status periodically (e.g., when agent edits files)
// This requires parsing agent output or using platform-specific hooks
// For now, update on tier completion

// After tier execution
coordinator.unregister_agent(&format!("{}-{}", subagent_name, tier_id)).await?;
```

**Provider coordination model (Codex/Copilot included):**

- **Canonical mode:** File-based coordination (`active-agents.json`) for all platforms.
- **Scope:** Works for same-platform and cross-platform crews using the same state schema.
- **Runtime path:** Direct-provider invocation via direct provider calls (no local CLI bridge); no SDK threads/sessions.
- **Prompt contract:** Every subagent receives coordination context built from shared state.

**When to use coordination modes:**

- **File-based coordination (canonical):** Always on for orchestrator-managed runs. All platforms (Codex, Claude, Cursor, Gemini, Copilot) read/write the same coordination file.
- **Platform-native hooks (optional enrichments):** Use hook events where available to improve update fidelity, but keep the file-based state as the single source of coordination truth.

**Benefits:**

- **Reduced conflicts:** Agents know what files others are editing, avoiding simultaneous modifications. Coordination context warns agents: "rust-engineer is editing src/api.rs -- avoid this file."
- **Better context:** Agents understand what others are working on, reducing confusion when seeing changes. Agent sees: "test-automator is running tests -- these test failures are expected."
- **Efficient collaboration:** Agents can reference shared decisions and avoid duplicate work. Agent sees: "architect-reviewer established pattern X -- use this pattern."
- **No "freaking out":** Agents see coordination context explaining why code is changing, who is changing it, and what they're doing. Reduces false alarms and confusion.
- **Platform-neutral:** one coordination contract across providers keeps behavior deterministic and replayable.

**Coordination state updates:**

- **Before execution:** Agent registers in coordination state with initial operation description.
- **During execution:** Agent updates coordination state periodically (e.g., every 30 seconds or when file operations occur):
  - Files being edited (extracted from agent output or platform hooks)
  - Current operation (e.g., "editing src/api.rs", "running cargo test")
  - Progress updates
- **After execution:** Agent unregisters from coordination state.

**Extracting file operations from agent output:**

- **Parse agent output:** Use output parser to detect file paths mentioned in agent responses (e.g., "I'm editing src/api.rs" or file paths in diffs).
- **Platform hooks:** For platforms with native hooks (Cursor, Claude, Gemini), use `PreToolUse`/`PostToolUse` hooks to detect file operations in real-time.
- **Provider event adapters:** For Codex/Copilot, use normalized CLI stream/tool events to detect file operations in real time.

**Example coordination flow (cross-platform):**

```
1. Agent A (rust-engineer, Codex) starts Subtask A: registers in active-agents.json
   - agent_id: "rust-engineer-1.1.1"
   - platform: "codex"
   - current_operation: "Starting implementation of API endpoint"
   - files_being_edited: []

2. Agent A begins editing: updates coordination state
   - files_being_edited: ["src/api.rs"]
   - current_operation: "Editing src/api.rs to add POST /users endpoint"

3. Agent B (test-automator, Claude Code) starts Subtask B (parallel): reads coordination state
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs (started 1 minute ago). **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."

4. Agent B (Claude Code) waits or works on other files, then proceeds when Agent A (Codex) finishes
   - Cross-platform coordination: Claude agent sees Codex agent's status via shared file

5. Agent A (Codex) completes: unregisters from coordination state
   - Agent B (Claude Code) can now safely edit src/api.rs for tests
```

**Key point:** File-based coordination enables **cross-platform communication**. A Codex agent and a Claude Code agent can coordinate through `active-agents.json` even when they run on different providers/CLIs.

**Provider-bridge runner integration (canonical):**

- **All platform runners (Cursor, Codex, Claude, Gemini, Copilot):** read/update file-based coordination state (`active-agents.json`) and consume the same prompt injection contract.
- **No shared provider sessions/threads:** orchestrator keeps fresh-process isolation per iteration and uses files/events for coordination.

**Implementation notes:**

- **Where:** New module `src/core/agent_coordination.rs` for file-based coordination; platform runners only read/write coordination state and consume injected context.
- **What:** Implement `AgentCoordinator`, inject coordination context into prompts, and keep status updates provider-agnostic.
- **When:** Register agent before execution; update status during execution (periodically or on file operations); unregister after execution.

### Puppet Master Crews (Teams/Fleets Alternative)

**Concept:** Build a Puppet Master-native multi-agent communication system called **"Crews"** that enables subagents to talk to each other directly. Crews can be invoked by users (platform-specific) or by the orchestrator (cross-platform coordination). This provides agent-to-agent communication and gives the orchestrator ("boss agent") full visibility into subagent interactions.

**Feature Name:** "Crews" (can be invoked as "crew" or "crews" in commands/prompts)

**Two modes of operation:**

1. **User-initiated Crews (platform-specific) -- Future: Assistant feature:**
   - **Status:** Not yet implemented. Will be enabled when the "Assistant" feature is added.
   - User will invoke crew via command/prompt: "use a crew", "create a crew", "crew", "crews"
   - Crew will use the **currently selected platform** (from tier config or GUI selection)
   - Example: If user has Copilot selected → Crew spawns Copilot subagents
   - Example: If user has Claude Code selected → Crew spawns Claude Code subagents
   - **Rationale:** User needs control over which platform to use (subscription limits, preferences, capabilities)
   - **Note:** Platform selection logic will be defined when Assistant feature is designed (see Gap #37)

2. **Orchestrator-initiated Crews (platform-specific per tier, cross-platform coordination via message board) -- Current implementation:**
   - Orchestrator automatically creates crews for each tier that needs subagents
   - **Respects tier-level platform configuration:**
     - Task level with platform = Codex → Crew uses Codex subagents
     - Subtask level with platform = Copilot → Crew uses Copilot subagents
   - Each crew uses the platform specified in that tier's config
    - **Cross-platform coordination:** Different crews (different platforms) coordinate via shared message board (`agent-messages.json`) and coordination state (`active-agents.json`)
    - **Rationale:** Orchestrator respects tier-level platform selections while enabling cross-platform coordination through shared state

**Canonical crew contract:**
- A Crew is a runtime coordination construct, not a replacement for tier or node ownership.
- Canonical crew state is persisted via seglog/redb (`crew.started`, `crew.member_*`, `crew.message_posted`, `crew.completed` plus `runs -> crew.*` projections).
- File-based message boards such as `agent-messages.json` or `active-agents.json` are debug/interop mirrors only and MUST be rebuildable from canonical events.
- Crew permissions are bounded by the member run's platform, strategy, tool policy, and FileSafe scope; crew membership does not widen those permissions.

ContractRef: Primitive:Seglog, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

**User-initiated Crew invocation (Future: Assistant feature):**

**Status:** Not yet implemented. This will be enabled when the "Assistant" feature is added.

```rust
// Future implementation (when Assistant feature is added):
// User command examples:
// "use a crew to implement authentication"
// "create a crew for testing"
// "crew: implement API endpoint"
// "crews: add tests and documentation"

// In orchestrator (via Assistant), detect crew invocation
if prompt.contains("crew") || prompt.contains("crews") || prompt.contains("use a crew") || prompt.contains("create a crew") {
    // Deterministic platform selection (no prompting):
    // 1) tier config platform (when in a tier context)
    // 2) Assistant thread/platform selection (when present)
    // 3) fallback: cursor
    let platform = self.resolve_platform_for_crew()?; // e.g., Platform::Cursor

    // Parse crew request (extract task, subagents needed)
    let crew_request = parse_crew_request(&prompt)?;

    // Create crew with platform-specific subagents
    let crew = Crew::new(platform, crew_request.subagents, crew_request.task);

    // Spawn crew (all subagents use same platform)
    crew.execute().await?;
}
```

**Platform selection for user-initiated crews (Future consideration):**

- **Source:** Current tier config platform, or GUI platform selection if in GUI mode
- **Fallback:** If no platform selected, use deterministic default platform (cursor)
- **Validation:** Ensure platform supports subagents (all providers support subagents via coordination)
- **Note:** Exact implementation will be defined when Assistant feature is designed (see Gap #37)

**Example user-initiated crew flow (Future):**

```
User: "use a crew to implement authentication system"
Current platform: Copilot (from tier config or GUI)

Orchestrator (via Assistant):
1. Detects "crew" invocation
2. Gets current platform: Copilot
3. Parses request: task = "implement authentication system"
4. Selects subagents: ["backend-developer", "security-auditor", "test-automator"]
5. Creates crew with Copilot platform
6. Spawns 3 Copilot subagents (all using Copilot CLI)
7. Agents coordinate via Crew communication system (file-based)
8. All agents can talk to each other, orchestrator monitors
```

**Orchestrator-initiated crew flow:**

```
Orchestrator needs to coordinate:
- Codex agent (rust-engineer) working on Subtask A
- Claude Code agent (test-automator) working on Subtask B (parallel)

Orchestrator:
1. Creates cross-platform crew automatically
2. Registers both agents in crew
3. Agents coordinate via file-based coordination
4. Agents can communicate via message board
5. Orchestrator monitors all communication
```

**Crew structure:**

```rust
// src/core/crews.rs (new module)

use crate::types::Platform;

#[derive(Debug, Clone)]
// DRY:DATA:Crew — Crew (multi-agent team) structure
pub struct Crew {
    pub crew_id: String, // UUID
    pub name: Option<String>, // User-provided name (optional)
    pub platform: Platform, // Platform for user-initiated crews; None for orchestrator cross-platform crews
    pub subagents: Vec<CrewSubagent>,
    pub task: String, // Crew's overall task
    pub created_by: CrewCreator, // User or Orchestrator
    pub created_at: DateTime<Utc>,
    pub status: CrewStatus,
}

#[derive(Debug, Clone)]
pub enum CrewCreator {
    User { user_id: Option<String> },
    Orchestrator { tier_id: String },
}

#[derive(Debug, Clone)]
pub struct CrewSubagent {
    pub agent_id: String, // e.g., "rust-engineer", "test-automator"
    pub agent_type: String, // Subagent type/name
    pub platform: Platform, // For orchestrator crews, can differ from crew.platform
    pub tier_id: Option<String>, // Which tier this subagent is working on
    pub status: SubagentStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CrewStatus {
    Forming, // Crew being created
    Active, // Crew members working
    Waiting, // Crew waiting for something
    Complete, // Crew finished task
    Disbanded, // Crew disbanded
}

#[derive(Debug, Clone, PartialEq)]
pub enum SubagentStatus {
    Pending, // Not started yet
    Active, // Currently working
    Waiting, // Waiting for another subagent
    Complete, // Finished
    Blocked, // Blocked on something
}
```

**Crew communication:**

Crew members communicate via the message board (`agent-messages.json`), but messages are scoped to the crew:

```rust
impl Crew {
    // DRY:FN:post_to_crew — Post message to crew
    // DRY REQUIREMENT: Validate crew subagent names using subagent_registry::is_valid_subagent_name()
    /// Post message to crew (all crew members see it)
    pub async fn post_to_crew(&self, message: AgentMessage) -> Result<()> {
        // DRY: Validate crew subagent names — DO NOT allow invalid subagent names in crew
        for subagent in &self.subagents {
            if !subagent_registry::is_valid_subagent_name(&subagent.agent_type) {
                return Err(anyhow!("Invalid subagent name in crew: {}", subagent.agent_type));
            }
        }
        // Set message routing to crew members
        message.to_tier_id = None; // Override tier_id
        message.crew_id = Some(self.crew_id.clone()); // Scope to crew

        communicator.post_message(message).await
    }

    /// Get messages for crew
    pub async fn get_crew_messages(&self) -> Result<Vec<AgentMessage>> {
        communicator.get_messages_for_crew(&self.crew_id).await
    }
}
```

**User-initiated crew example:**

```rust
// User: "create a crew with rust-engineer, test-automator, and code-reviewer to implement authentication"

// Parse crew request
let crew_request = CrewRequest {
    subagents: vec!["rust-engineer".to_string(), "test-automator".to_string(), "code-reviewer".to_string()],
    task: "implement authentication".to_string(),
    platform: None, // Will use current platform
};

// Get current platform
let current_platform = tier_config.platform; // e.g., Platform::Copilot

// Create crew
let crew = Crew {
    crew_id: uuid::Uuid::new_v4().to_string(),
    name: Some("Authentication Crew".to_string()),
    platform: current_platform, // Copilot
    subagents: vec![
        CrewSubagent {
            agent_id: format!("rust-engineer-{}", crew.crew_id),
            agent_type: "rust-engineer".to_string(),
            platform: current_platform, // All use Copilot
            tier_id: None,
            status: SubagentStatus::Pending,
        },
        CrewSubagent {
            agent_id: format!("test-automator-{}", crew.crew_id),
            agent_type: "test-automator".to_string(),
            platform: current_platform, // All use Copilot
            tier_id: None,
            status: SubagentStatus::Pending,
        },
        CrewSubagent {
            agent_id: format!("code-reviewer-{}", crew.crew_id),
            agent_type: "code-reviewer".to_string(),
            platform: current_platform, // All use Copilot
            tier_id: None,
            status: SubagentStatus::Pending,
        },
    ],
    task: "implement authentication".to_string(),
    created_by: CrewCreator::User { user_id: None },
    created_at: Utc::now(),
    status: CrewStatus::Forming,
};

// Execute crew (spawn all subagents using Copilot)
crew.execute().await?;
```

**Orchestrator-initiated crew example:**

```rust
// Orchestrator creates crews per tier, respecting tier platform config

// Task level (1.1) has platform = Codex
let task_tier_config = tier_config_for(TierType::Task, "1.1");
// task_tier_config.platform = Platform::Codex

let task_crew = Crew {
    crew_id: uuid::Uuid::new_v4().to_string(),
    name: None,
    platform: task_tier_config.platform, // Codex (from tier config)
    subagents: vec![
        CrewSubagent {
            agent_id: "rust-engineer-1.1".to_string(),
            agent_type: "rust-engineer".to_string(),
            platform: task_tier_config.platform, // Codex (all use same platform)
            tier_id: Some("1.1".to_string()),
            status: SubagentStatus::Active,
        },
        CrewSubagent {
            agent_id: "backend-developer-1.1".to_string(),
            agent_type: "backend-developer".to_string(),
            platform: task_tier_config.platform, // Codex (all use same platform)
            tier_id: Some("1.1".to_string()),
            status: SubagentStatus::Active,
        },
    ],
    task: "Implement API endpoints".to_string(),
    created_by: CrewCreator::Orchestrator { tier_id: "1.1".to_string() },
    created_at: Utc::now(),
    status: CrewStatus::Active,
};

// Subtask level (1.1.1) has platform = Copilot
let subtask_tier_config = tier_config_for(TierType::Subtask, "1.1.1");
// subtask_tier_config.platform = Platform::Copilot

let subtask_crew = Crew {
    crew_id: uuid::Uuid::new_v4().to_string(),
    name: None,
    platform: subtask_tier_config.platform, // Copilot (from tier config)
    subagents: vec![
        CrewSubagent {
            agent_id: "test-automator-1.1.1".to_string(),
            agent_type: "test-automator".to_string(),
            platform: subtask_tier_config.platform, // Copilot (all use same platform)
            tier_id: Some("1.1.1".to_string()),
            status: SubagentStatus::Active,
        },
    ],
    task: "Add tests for API endpoint".to_string(),
    created_by: CrewCreator::Orchestrator { tier_id: "1.1.1".to_string() },
    created_at: Utc::now(),
    status: CrewStatus::Active,
};

// Both crews coordinate via shared message board (cross-platform coordination)
// Task crew (Codex) and Subtask crew (Copilot) can communicate through agent-messages.json
// Orchestrator monitors all crews regardless of platform
```

**Cross-platform coordination example:**

```
Task level (1.1):
  Platform: Codex
  Crew: Codex subagents (rust-engineer, backend-developer)

Subtask level (1.1.1):
  Platform: Copilot
  Crew: Copilot subagents (test-automator)

Coordination:
  - Codex crew members coordinate via shared state files and provider event updates
  - Copilot crew members coordinate via shared state files and provider event updates
  - Cross-platform coordination: Codex crew and Copilot crew communicate via shared message board (agent-messages.json)
  - Orchestrator monitors all crews and can see cross-platform communication
```

**Crew state file:**

```json
// .puppet-master/state/crews.json

{
  "crews": [
    {
      "crew_id": "abc-123",
      "name": "Authentication Crew",
      "platform": "copilot",
      "created_by": { "type": "user" },
      "subagents": [
        {
          "agent_id": "rust-engineer-abc-123",
          "agent_type": "rust-engineer",
          "platform": "copilot",
          "tier_id": null,
          "status": "active"
        }
      ],
      "task": "implement authentication",
      "status": "active",
      "created_at": "2026-02-18T10:00:00Z"
    },
    {
      "crew_id": "xyz-789",
      "name": null,
      "platform": "codex",
      "created_by": { "type": "orchestrator", "tier_id": "1.1" },
      "subagents": [
        {
          "agent_id": "rust-engineer-1.1",
          "agent_type": "rust-engineer",
          "platform": "codex",
          "tier_id": "1.1",
          "status": "active"
        },
        {
          "agent_id": "backend-developer-1.1",
          "agent_type": "backend-developer",
          "platform": "codex",
          "tier_id": "1.1",
          "status": "active"
        }
      ],
      "task": "Implement API endpoints",
      "status": "active",
      "created_at": "2026-02-18T10:01:00Z"
    },
    {
      "crew_id": "def-456",
      "name": null,
      "platform": "copilot",
      "created_by": { "type": "orchestrator", "tier_id": "1.1.1" },
      "subagents": [
        {
          "agent_id": "test-automator-1.1.1",
          "agent_type": "test-automator",
          "platform": "copilot",
          "tier_id": "1.1.1",
          "status": "active"
        }
      ],
      "task": "Add tests for API endpoint",
      "status": "active",
      "created_at": "2026-02-18T10:02:00Z"
    }
  ],
  "last_updated": "2026-02-18T10:02:00Z"
}
```

**Note:** Each orchestrator-initiated crew uses the platform from its tier config. Crew xyz-789 (Task 1.1) uses Codex because Task tier config specifies Codex. Crew def-456 (Subtask 1.1.1) uses Copilot because Subtask tier config specifies Copilot. They coordinate cross-platform via shared message board.

**GUI integration (Current and Future):**

**Current implementation (orchestrator-initiated crews only):**
- **Crew monitoring:** Show active orchestrator-initiated crews, crew members, crew communication
- **Crew status:** Display crew progress, subagent status, messages
- **Crew actions:** View crew details, cancel crew, view messages
- **Crew filtering:** Filter by platform, status, tier

**Future implementation (when Assistant feature is added):**
- **Crew creation:** User can create crews from GUI (select platform, subagents, task, optional name)
- **Crew settings:** GUI settings panel for crew configuration (max crew size, timeout, etc.)
- **Assistant integration:** GUI integration with Assistant feature for user-initiated crew creation

**GUI components to add:**

1. **Crews tab/page** (new view in GUI)
2. **Crew list widget** (shows all crews with status)
3. **Crew detail view** (expandable crew details)
4. **Crew message viewer** (messages within crew)
5. **Crew status badges** (visual status indicators)
6. **Crew filter controls** (filter by platform, status, tier)
7. **Crew cancellation dialog** (confirm cancellation)
8. **Future: Crew creation dialog** (when Assistant feature is added)

**Command parsing:**

```rust
// Detect crew invocation in prompts
fn detect_crew_invocation(prompt: &str) -> Option<CrewRequest> {
    let lower = prompt.to_lowercase();

    if lower.contains("crew") || lower.contains("crews") {
        // Parse crew request
        // Extract: subagents, task, optional name
        // ...
    }

    None
}
```

**Benefits of "Crews" name:**

- **Intuitive:** "Crew" suggests a team working together
- **Flexible:** Can be singular ("crew") or plural ("crews")
- **Distinct:** Different from "Teams" (Claude) and "Fleets" (Copilot)
- **Memorable:** Easy to remember and type

**Implementation notes:**

- **Where:** New module `src/core/crews.rs` for crew management; extend `src/core/agent_communication.rs` for crew-scoped messaging; extend GUI views for crew monitoring
- **What:** Implement `Crew` struct, crew creation (orchestrator-initiated only for now), crew execution, crew communication, GUI components for crew visibility
- **When:**
  - **Current:** Orchestrator creates crew for tier → use platform from tier config (`tier_config_for(tier_type, tier_id).platform`)
  - **Future (Assistant feature):** User invokes crew → create platform-specific crew using deterministic platform selection (no prompting; fallback = cursor)
  - Cross-platform coordination happens automatically via shared message board (`agent-messages.json`)

**GUI implementation requirements:**

- **Where:** New GUI view `src/views/crews.rs` for crew monitoring; extend `src/app.rs` with crew-related messages and handlers
- **What:** Implement crew list view, crew detail view, crew message viewer, crew status indicators, crew filter controls, crew cancellation dialog
- **Messages:** Add crew-related messages (e.g., `Message::CrewsTabSelected`, `Message::CrewDetailExpanded(String)`, `Message::CrewCancelled(String)`, `Message::CrewFilterChanged(...)`)
- **Data loading:** Load crews from `.puppet-master/state/crews.json`, messages from `agent-messages.json`, coordination state from `active-agents.json`
- **Update frequency:** Event-driven updates for crew status changes, polling every 5 seconds for messages
- **Future (Assistant feature):** When Assistant feature is added, extend GUI with crew creation dialog, crew settings panel, Assistant integration

**Key implementation detail:**

When orchestrator creates a crew for a tier, it must:
1. Get tier config: `let tier_config = tier_config_for(tier_type, tier_id)?;`
2. Use tier platform: `crew.platform = tier_config.platform;`
3. All crew subagents use same platform: `subagent.platform = tier_config.platform;`
4. Crew coordinates with other crews (different platforms) via shared message board

### Gaps and Potential Issues for Crews Feature

**Gap #37: Platform selection ambiguity for user-initiated crews (Future: Assistant feature)**

**Status:** Not applicable to current Crews implementation. This gap will be relevant when the "Assistant" feature is implemented, which will enable user-initiated crew invocations.

**Current state:** With the current system, users cannot directly invoke crews. Only orchestrator-initiated crews are supported (crews created automatically for tiers that need subagents).

**Future consideration (Assistant feature):** Deterministic platform selection for user-initiated crews (resolved):
- **Priority order:** (1) current tier config platform (if in tier context), (2) Assistant thread/platform selection (if available), (3) fallback = cursor.
- **Optional override:** users may specify a platform explicitly in the crew command, but the system MUST have a deterministic default even when no override is provided.

ContractRef: PolicyRule:Decision_Policy.md§2

**Gap #38: Crew lifecycle management and cleanup (GUI updates required)**

**Issue:** What happens when a crew member crashes? What if crew never completes? What if user cancels crew mid-execution? How do we clean up crew state?

**Mitigation:**
- **Crew timeout:** Set maximum crew execution time (e.g., 2 hours). If exceeded, mark crew as "timeout" and disband.
- **Member failure handling:** If crew member fails, either (1) retry with same subagent, (2) replace with alternative subagent, or (3) mark crew as "partial failure" and continue with remaining members
- **Graceful shutdown:** On user cancel (via GUI), send cancellation message to all crew members, wait for cleanup, then disband crew
- **Automatic cleanup:** Prune crews older than 24 hours (completed or failed). Archive crew state before deletion.
- **Crew status tracking:** Track crew status transitions (Forming → Active → Complete/Disbanded). Log all transitions for debugging.

**GUI requirements:**
- **Crew cancellation button:** Allow users to cancel orchestrator-initiated crews via GUI (with confirmation dialog)
- **Crew timeout warning:** Show warning in GUI when crew approaches timeout (e.g., "Crew will timeout in 10 minutes")
- **Member failure indicators:** Show visual indicators in GUI when crew members fail (red status badge, error icon)
- **Crew status updates:** Update GUI in real-time when crew status changes (Forming → Active → Complete/Disbanded)
- **Cleanup notifications:** Show notification in GUI when crews are automatically cleaned up ("3 crews archived")

```rust
impl Crew {
    pub async fn handle_member_failure(&mut self, failed_agent_id: &str) -> Result<()> {
        // Mark member as failed
        if let Some(member) = self.subagents.iter_mut().find(|a| a.agent_id == failed_agent_id) {
            member.status = SubagentStatus::Blocked;
        }

        // Check if crew can continue
        let active_members: Vec<_> = self.subagents.iter()
            .filter(|a| matches!(a.status, SubagentStatus::Active | SubagentStatus::Pending))
            .collect();

        if active_members.is_empty() {
            // All members failed — disband crew
            self.status = CrewStatus::Disbanded;
            self.post_to_crew(AgentMessage {
                message_type: MessageType::Announcement,
                subject: "Crew disbanded due to member failures".to_string(),
                content: "All crew members have failed. Crew is being disbanded.".to_string(),
                // ...
            }).await?;
        } else {
            // Continue with remaining members
            self.post_to_crew(AgentMessage {
                message_type: MessageType::Update,
                subject: format!("Crew member {} failed", failed_agent_id),
                content: format!("Crew will continue with {} remaining members", active_members.len()),
                // ...
            }).await?;
        }

        Ok(())
    }

    pub async fn cancel(&mut self) -> Result<()> {
        // Send cancellation to all members
        self.post_to_crew(AgentMessage {
            message_type: MessageType::Announcement,
            subject: "Crew cancelled".to_string(),
            content: "User has cancelled this crew. Please stop work and clean up.".to_string(),
            // ...
        }).await?;

        // Wait for members to acknowledge (with timeout)
        tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;

        // Disband crew
        self.status = CrewStatus::Disbanded;
        self.save_state().await?;

        Ok(())
    }
}
```

**Gap #39: Message routing and crew scoping**

**Issue:** How do we ensure messages are scoped correctly to crews? What prevents messages from leaking between crews? What if agent is in multiple crews?

**Mitigation:**
- **Crew ID in messages:** All crew messages must include `crew_id` field. Filter messages by crew_id when retrieving.
- **Message scoping:** When agent posts message to crew, set `crew_id` and filter recipients to crew members only
- **Multi-crew agents:** If agent is in multiple crews, show messages from all crews but clearly label which crew each message belongs to
- **Message isolation:** Crew messages are isolated by default. Cross-crew communication requires explicit broadcast or orchestrator mediation.

```rust
impl AgentCommunicator {
    pub async fn get_messages_for_crew(&self, crew_id: &str) -> Result<Vec<AgentMessage>> {
        let board = self.load_message_board().await?;
        Ok(board.messages.iter()
            .filter(|msg| msg.crew_id.as_ref().map(|id| id == crew_id).unwrap_or(false))
            .cloned()
            .collect())
    }

    pub async fn get_messages_for_agent_in_crews(
        &self,
        agent_id: &str,
        crew_ids: &[String],
    ) -> Result<Vec<AgentMessage>> {
        let board = self.load_message_board().await?;
        Ok(board.messages.iter()
            .filter(|msg| {
                // Message is to this agent
                msg.to_agent_id.as_ref().map(|id| id == agent_id).unwrap_or(false) ||
                // Message is to a crew this agent is in
                msg.crew_id.as_ref().map(|id| crew_ids.contains(id)).unwrap_or(false) ||
                // Broadcast message
                (msg.to_agent_id.is_none() && msg.crew_id.is_none())
            })
            .cloned()
            .collect())
    }
}
```

**Gap #40: Crew size limits and resource management (GUI updates required)**

**Issue:** What's the maximum crew size? What if crew exceeds platform quota? What if too many crews run simultaneously?

**Mitigation:**
- **Crew size limits:** Maximum 10 subagents per crew (configurable). If user requests more, split into multiple crews or reject with suggestion.
- **Platform quota checking:** Before creating crew, check platform quota. If insufficient, either (1) wait for quota, (2) use fallback platform, or (3) reject with error.
- **Concurrent crew limits:** Maximum 5 active crews per platform (configurable). Queue additional crews or reject. Note: this is separate from per-platform agent caps (see "Parallel Execution Configuration" below and `Plans/FinalGUISpec.md` §7.4.7). A crew spawn must satisfy both the crew cap and the per-platform agent cap.
- **Resource monitoring:** Track platform usage per crew. Alert if crew approaches quota limits.

**GUI requirements:**
- **Crew size indicator:** Show crew size (e.g., "3/10 members") in crew list/detail view
- **Platform quota display:** Show platform quota usage in GUI (e.g., "Codex: 2/5 crews active, 45/100 quota remaining")
- **Limit warnings:** Show warnings in GUI when approaching limits ("Warning: 4/5 crews active for Codex")
- **Resource usage dashboard:** Add resource usage section showing platform quotas, active crews per platform, crew sizes
- **Future (Assistant feature):** When user-initiated crews are added, GUI should validate crew size and platform quota before allowing crew creation

```rust
impl CrewManager {
    pub async fn can_create_crew(&self, platform: Platform, crew_size: usize) -> Result<bool> {
        // Check crew size limit
        if crew_size > self.config.max_crew_size {
            return Err(anyhow!("Crew size {} exceeds maximum {}", crew_size, self.config.max_crew_size));
        }

        // Check concurrent crew limit
        let active_crews = self.get_active_crews_for_platform(platform).await?;
        if active_crews.len() >= self.config.max_concurrent_crews_per_platform {
            return Err(anyhow!("Maximum concurrent crews ({}) reached for platform {:?}",
                self.config.max_concurrent_crews_per_platform, platform));
        }

        // Check platform quota (if available)
        if let Some(quota) = self.check_platform_quota(platform).await? {
            if quota.remaining < crew_size as u64 {
                return Err(anyhow!("Insufficient platform quota. Need {}, have {}",
                    crew_size, quota.remaining));
            }
        }

        Ok(true)
    }
}
```

**Gap #41: Crew parsing and subagent selection**

**Issue:** How do we parse crew requests from user prompts? What if user requests invalid subagent names? What if requested subagents aren't available for the platform?

**Mitigation:**
- **Crew request parsing:** Use regex/NLP to extract: (1) subagent names (explicit list or inferred from task), (2) task description, (3) optional crew name, (4) optional platform override
- **Subagent validation:** Validate requested subagents against canonical subagent list. If invalid, suggest alternatives or reject.
- **Platform compatibility:** Check if requested subagents are available for selected platform. Some platforms may not support all subagent types.
- **Auto-selection fallback:** If user doesn't specify subagents, auto-select based on task (use `SubagentSelector`).

```rust
fn parse_crew_request(prompt: &str) -> Result<CrewRequest> {
    // Try to extract explicit subagent list
    // Pattern: "crew with rust-engineer, test-automator, code-reviewer"
    let subagent_pattern = regex::Regex::new(r"crew\s+with\s+([^,]+(?:,\s*[^,]+)*)")?;
    let subagents = if let Some(caps) = subagent_pattern.captures(prompt) {
        caps.get(1).unwrap().as_str()
            .split(',')
            .map(|s| s.trim().to_string())
            .collect()
    } else {
        // Auto-select based on task
        vec![] // Will be filled by SubagentSelector
    };

    // Extract task
    // Pattern: "crew to <task>" or "crew: <task>"
    let task_pattern = regex::Regex::new(r"crew\s+(?:to|:)\s+(.+)")?;
    let task = task_pattern.captures(prompt)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .ok_or_else(|| anyhow!("Could not parse task from crew request"))?;

    // Extract platform override
    // Pattern: "crew with <platform>"
    let platform_pattern = regex::Regex::new(r"crew\s+with\s+(codex|copilot|claude|cursor|gemini)")?;
    let platform_override = platform_pattern.captures(prompt)
        .and_then(|c| c.get(1))
        .map(|m| parse_platform(m.as_str()));

    Ok(CrewRequest {
        subagents,
        task,
        platform_override,
    })
}
```

**Gap #42: Crew state persistence and recovery**

**Issue:** What if Puppet Master crashes mid-crew? How do we recover crew state? What if crew state file gets corrupted?

**Mitigation:**
- **Crew state persistence:** Save crew state to `.puppet-master/state/crews.json` after each significant change (member status, message posted, crew status change)
- **Recovery on startup:** On Puppet Master startup, load crew state and resume active crews. Check if crew members are still active (via coordination state).
- **State validation:** Validate crew state on load (check required fields, valid status transitions, member consistency)
- **Backup and restore:** Backup crew state before major changes. Restore from backup if corruption detected.

```rust
impl CrewManager {
    pub async fn recover_crews_on_startup(&self) -> Result<()> {
        let crews = self.load_crews().await?;
        let coordination_state = self.coordinator.load_state().await?;

        for mut crew in crews {
            if matches!(crew.status, CrewStatus::Active | CrewStatus::Forming) {
                // Check if crew members are still active
                let active_members: Vec<_> = crew.subagents.iter()
                    .filter(|member| {
                        coordination_state.active_agents.contains_key(&member.agent_id)
                    })
                    .collect();

                if active_members.is_empty() {
                    // All members inactive — mark crew as disbanded
                    crew.status = CrewStatus::Disbanded;
                    tracing::warn!("Crew {} disbanded on recovery: all members inactive", crew.crew_id);
                } else if active_members.len() < crew.subagents.len() {
                    // Some members inactive — update status
                    for member in &mut crew.subagents {
                        if !coordination_state.active_agents.contains_key(&member.agent_id) {
                            member.status = SubagentStatus::Blocked;
                        }
                    }
                    tracing::info!("Crew {} recovered with {} active members", crew.crew_id, active_members.len());
                }

                self.save_crew(&crew).await?;
            }
        }

        Ok(())
    }
}
```

**Gap #43: Crew conflicts and deadlocks (GUI updates required)**

**Issue:** What if crew members have conflicting requirements? What if crew deadlocks (all members waiting for each other)? What if crew members disagree on approach?

**Mitigation:**
- **Conflict detection:** Monitor crew messages for conflicts (e.g., "I need X" vs "I need Y" where X and Y conflict). Detect deadlocks (all members in "Waiting" status for >5 minutes).
- **Orchestrator intervention:** If conflict or deadlock detected, orchestrator can (1) mediate via message, (2) assign decision-maker (e.g., architect-reviewer), or (3) disband and re-plan
- **Decision escalation:** If crew members disagree, escalate to orchestrator or user. Orchestrator can inject decision message to resolve conflict.

**GUI requirements:**
- **Conflict indicators:** Show visual indicators in GUI when conflicts or deadlocks are detected (warning badge, alert icon)
- **Deadlock notification:** Show notification/toast when deadlock detected ("Crew 'Authentication Crew' is deadlocked. Orchestrator is resolving...")
- **Conflict resolution UI:** Show conflict details in GUI (which members disagree, what the conflict is about) with option to manually intervene
- **Status indicators:** Highlight crews with conflicts/deadlocks in crew list (different color, warning icon)

```rust
impl Crew {
    pub async fn detect_deadlock(&self) -> Result<bool> {
        // Check if all members are waiting
        let all_waiting = self.subagents.iter()
            .all(|member| matches!(member.status, SubagentStatus::Waiting));

        if all_waiting {
            // Check how long they've been waiting
            let oldest_wait = self.subagents.iter()
                .filter_map(|m| {
                    if matches!(m.status, SubagentStatus::Waiting) {
                        // Get last status change time (would need to track this)
                        Some(Utc::now() - chrono::Duration::minutes(5)) // Placeholder
                    } else {
                        None
                    }
                })
                .min();

            if let Some(wait_time) = oldest_wait {
                if wait_time.num_minutes() > 5 {
                    return Ok(true); // Deadlock detected
                }
            }
        }

        Ok(false)
    }

    pub async fn resolve_deadlock(&mut self, orchestrator: &Orchestrator) -> Result<()> {
        // Orchestrator injects resolution message
        orchestrator.post_to_crew(self.crew_id.clone(), AgentMessage {
            message_type: MessageType::Decision,
            subject: "Deadlock resolution".to_string(),
            content: "Orchestrator detected deadlock. Proceeding with approach X. All members should proceed.".to_string(),
            // ...
        }).await?;

        // Unblock all members
        for member in &mut self.subagents {
            if matches!(member.status, SubagentStatus::Waiting) {
                member.status = SubagentStatus::Active;
            }
        }

        Ok(())
    }
}
```

**Gap #44: Crew visibility and user experience (GUI updates required)**

**Issue:** How do users see orchestrator-initiated crews? How do users monitor crew progress? How do users interact with crews (cancel, modify, etc.)?

**Mitigation:**
- **GUI crew dashboard:** Add "Crews" tab/section to GUI showing all active crews (orchestrator-initiated for now; user-initiated when Assistant feature is added), crew members, status, messages
- **Crew status indicators:** Show crew status (Active, Waiting, Complete, Disbanded) with visual indicators. Show member status within crew (Pending, Active, Waiting, Complete, Blocked).
- **Crew actions:** Allow users to (1) view crew messages, (2) cancel crew (orchestrator-initiated crews), (3) view crew details (platform, tier, task, members), (4) filter/search crews
- **Crew filtering:** Filter crews by platform, status, creator (orchestrator for now), tier
- **Crew message viewer:** Show messages within each crew, with threading, timestamps, and read status
- **Crew creation UI (Future: Assistant feature):** When Assistant feature is added, GUI will need controls for creating user-initiated crews (select platform, subagents, task)

**GUI implementation requirements:**

**New GUI components needed:**
1. **Crews tab/page:** New view showing all crews
2. **Crew list widget:** List of crews with status badges, platform icons, member counts
3. **Crew detail view:** Expandable/collapsible crew details showing members, messages, status
4. **Crew message viewer:** Message list/thread viewer within crew detail
5. **Crew status badge:** Visual indicator for crew status (color-coded)
6. **Crew member status indicator:** Visual indicator for member status within crew
7. **Crew actions menu:** Context menu or action buttons (view, cancel, etc.)
8. **Crew filter controls:** Filter by platform, status, tier (dropdowns, checkboxes)

**GUI data sources:**
- Load crews from `.puppet-master/state/crews.json`
- Load messages from `.puppet-master/state/agent-messages.json` (filtered by crew_id)
- Load coordination state from `.puppet-master/state/active-agents.json` (for member status)

**GUI update frequency:**
- Crew list: Update on crew status change (event-driven)
- Crew messages: Poll every 5 seconds or use event-driven updates
- Member status: Update on coordination state change (event-driven)

**Future GUI requirements (Assistant feature):**
- When Assistant feature is added, GUI will need:
  - Crew creation dialog/form (select platform, subagents, task, optional name)
  - Platform selection widget (for user-initiated crews)
  - Subagent selection widget (multi-select from canonical list)
  - Crew name input field
  - Task description input field

**Gap #45: Crew performance and scalability**

**Issue:** What if there are 50+ active crews? What if crew has 20+ members? Will message board become a bottleneck?

**Mitigation:**
- **Crew limits:** Enforce maximum concurrent crews (e.g., 20 total). Queue additional crews or reject.
- **Message board optimization:** Index messages by crew_id, agent_id, tier_id for fast filtering. Archive old messages (>24 hours).
- **Lazy loading:** Only load messages for active crews. Load full message history on demand.
- **Message batching:** Batch multiple messages into single file write to reduce I/O.

**Gap #46: Crew integration with existing subagent system**

**Issue:** How do crews integrate with existing tier-level subagent selection? What if tier already has subagents when crew is created? Can crew members be tier subagents?

**Mitigation:**
- **Crew vs tier subagents:** Crews are separate from tier-level subagents. Tier subagents work independently; crews add communication layer.
- **Overlap handling:** If crew member is also a tier subagent, agent participates in both (tier work + crew communication)
- **Coordination:** Crew members coordinate via message board; tier subagents coordinate via coordination state. Both can coexist.

**Gap #47: Crew message spam and rate limiting**

**Issue:** What prevents crew members from spamming messages? What if agent posts 100 messages per minute?

**Mitigation:**
- **Rate limiting:** Limit messages per agent per minute (e.g., max 10 messages/minute). Reject excess messages with error.
- **Message importance:** Prioritize important messages (Questions, Warnings) over updates. Filter low-priority messages if message board is full.
- **Message deduplication:** Detect duplicate messages (same content from same agent within 1 minute). Reject duplicates.

```rust
impl AgentCommunicator {
    pub async fn post_message_with_rate_limit(&self, message: AgentMessage) -> Result<()> {
        // Check rate limit
        let recent_messages = self.get_recent_messages_for_agent(&message.from_agent_id,
            chrono::Duration::minutes(1)).await?;

        if recent_messages.len() >= 10 {
            return Err(anyhow!("Rate limit exceeded: max 10 messages per minute"));
        }

        // Check for duplicates
        if self.is_duplicate(&message, &recent_messages)? {
            return Err(anyhow!("Duplicate message detected"));
        }

        // Post message
        self.post_message(message).await
    }
}
```

**Gap #48: Crew task completion and handoff**

**Issue:** How do crews know when their task is complete? How do crews hand off work to the next tier or other crews? What if crew members disagree on completion criteria?

**Mitigation:**
- **Task completion criteria:** Define clear completion criteria for crew tasks (e.g., "all tests pass", "code review approved", "documentation complete"). Crew members can vote on completion or defer to orchestrator.
- **Crew handoff:** When crew completes, post completion message to orchestrator and other crews. Include handoff context (files changed, decisions made, blockers resolved).
- **Completion validation:** Orchestrator validates crew completion against acceptance criteria. If criteria not met, crew continues or escalates.
- **Handoff messages:** Crews can post handoff messages to other crews (e.g., "Task 1.1 complete, API endpoints ready for testing"). Other crews receive these as coordination context.

**Gap #49: Crew member selection and availability**

**Issue:** What if requested subagent type isn't available for the platform? What if subagent is already busy in another crew? How do we handle subagent unavailability?

**Mitigation:**
- **Subagent availability check:** Before creating crew, check if requested subagents are available (not already in max crews, platform supports subagent type).
- **Fallback subagents:** If requested subagent unavailable, suggest alternatives (e.g., "rust-engineer unavailable, use backend-developer instead?").
- **Subagent capacity:** Track how many crews each subagent type is in. Limit concurrent crews per subagent type (e.g., max 3 crews per subagent type).
- **Platform compatibility:** Validate subagent type is supported by platform. Some platforms may not support all subagent types.

**Gap #50: Crew coordination with tier execution**

**Issue:** How do crews coordinate with tier-level execution? What if tier completes while crew is still working? What if crew needs to wait for tier completion?

**Mitigation:**
- **Tier completion awareness:** Crews monitor tier completion status. When tier completes, crew can either (1) continue if task not complete, (2) disband if task complete, or (3) wait for next tier.
- **Crew-tier synchronization:** Crews can wait for tier completion before starting (e.g., "wait for Task 1.1 to complete before starting Subtask 1.1.1 crew").
- **Tier context injection:** Crews receive tier context (files, decisions, blockers) as part of coordination context. Crews can reference tier work in their messages.

**Gap #51: Crew debugging and observability**

**Issue:** How do we debug crew communication issues? How do we see what crews are doing? How do we trace crew decision-making?

**Mitigation:**
- **Crew logs:** Log all crew operations (creation, member status changes, messages posted, completion) to `.puppet-master/logs/crews.log`.
- **Crew traces:** Generate traces for crew execution (similar to iteration traces). Show crew timeline, member activities, message flow.
- **Crew metrics:** Track crew metrics (duration, message count, member failures, conflicts detected). Display in GUI.
- **Debug mode:** Enable verbose logging for crew communication (log all messages, coordination state changes, platform calls).

### Additional Enhancements for Crews

**Enhancement #1: Crew templates and presets**

Allow users (when Assistant feature is added) to save crew configurations as templates:

```rust
pub struct CrewTemplate {
    pub name: String,
    pub subagents: Vec<String>,
    pub default_task: Option<String>,
    pub description: String,
}

// Users can create templates like:
// "Full Stack Crew": [rust-engineer, frontend-developer, test-automator, code-reviewer]
// "Security Review Crew": [security-auditor, compliance-auditor, code-reviewer]
```

**Enhancement #2: Crew performance metrics**

Track and display crew performance:
- Average time to complete tasks
- Success rate (tasks completed vs failed)
- Member utilization (how often each subagent type is used)
- Platform usage distribution

**Enhancement #3: Crew learning and adaptation**

Crews can learn from past executions:
- Track which subagent combinations work best for different task types
- Suggest optimal crew compositions based on historical data
- Adapt crew behavior based on success patterns

**Enhancement #4: Crew scheduling and prioritization**

When multiple crews are queued:
- Prioritize crews by tier dependency (crews for earlier tiers run first)
- Schedule crews based on platform quota availability
- Allow users to reorder crew execution (when Assistant feature is added)

**Gap #52: Crew integration with PRD/plan generation**

**Issue:** When the interview generates PRD/plans, should it account for crews? Should plans specify which tasks/subtasks benefit from crews? Should plans include crew recommendations?

**Mitigation:**
- **Crew-aware plan generation:** When interview generates PRD/plans, include crew recommendations for tasks that would benefit from multiple subagents working together
- **Plan annotations:** Add crew hints to PRD tasks/subtasks (e.g., "This subtask benefits from a crew: rust-engineer + test-automator + code-reviewer")
- **Crew templates in plans:** Plans can reference crew templates (e.g., "Use 'Full Stack Crew' template for this phase")
- **Orchestrator awareness:** Orchestrator reads crew hints from PRD and automatically creates crews when appropriate

**Integration with interview plan generation:**

When interview generates PRD (`prd.json`), add crew metadata to tasks/subtasks:

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
                "rationale": "Requires security expertise, implementation, and testing"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Gap #53: Crew coordination with interview phases**

**Issue:** Can crews be used during the interview itself? Should interview phases use crews for research/validation/documentation?

**Mitigation:**
- **Interview phase crews:** Interview phases can use crews internally (e.g., Architecture phase crew: architect-reviewer + knowledge-synthesizer + technical-writer)
- **Research crews:** Research operations can use crews (e.g., multiple researchers working in parallel)
- **Document generation crews:** Document generation can use crews (e.g., technical-writer + knowledge-synthesizer + qa-expert)
- **Cross-phase coordination:** Crews can coordinate across interview phases (e.g., Architecture crew shares decisions with Testing crew)

**Note:** This is separate from orchestrator-initiated crews for execution tiers. Interview crews are for interview flow only.

**Why this is valuable:**

1. **Cross-platform communication:** Works for all supported providers (Cursor, Claude Code, OpenCode, Codex, Gemini, GitHub Copilot), even those without native teams/fleets support
2. **Orchestrator visibility:** Boss agent (orchestrator) can monitor all subagent communication, providing insights into what subagents are doing and how they're coordinating
3. **Platform-agnostic:** Can be used alongside native teams/fleets (Claude Code Teams, Copilot Fleets) but provides fallback and cross-platform capabilities
4. **Enhanced coordination:** Enables more sophisticated coordination patterns (agents asking for help, sharing decisions, requesting reviews)
5. **Unified interface:** Single communication system works the same way across all providers

**Comparison with native solutions:**

| Feature | Claude Code Teams | Copilot Fleets | Puppet Master Communication |
|---------|------------------|----------------|---------------------------|
| Cross-platform | ❌ Claude only | ❌ Copilot only | ✅ All supported providers |
| Orchestrator visibility | Limited | Limited | ✅ Full visibility |
| Agent-to-agent messaging | ✅ Native | ❌ Not supported | ✅ Supported |
| File-based (no API) | ❌ Uses API | ❌ Uses API | ✅ File-based |
| Works with CLI-only | ❌ Requires Teams API | ❌ Requires Fleets API | ✅ Pure file-based |

**Architecture:**

The communication system extends the existing coordination state with a message board/queue:

```
.puppet-master/state/
├── active-agents.json          # Existing: agent status tracking
└── agent-messages.json         # New: agent-to-agent messages
```

**Message structure:**

```rust
// src/core/agent_communication.rs (new module)

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:AgentMessage — Agent-to-agent message structure
pub struct AgentMessage {
    pub message_id: String, // UUID
    pub from_agent_id: String, // e.g., "rust-engineer-1.1.1"
    pub from_platform: Platform,
    pub to_agent_id: Option<String>, // None = broadcast
    pub to_agent_type: Option<String>, // e.g., "test-automator", "code-reviewer"
    pub to_tier_id: Option<String>, // e.g., "1.1" (all agents in this tier)
    pub message_type: MessageType,
    pub subject: String, // Brief summary
    pub content: String, // Full message content
    pub context: MessageContext, // Files, operations, etc.
    pub thread_id: Option<String>, // For threaded conversations
    pub in_reply_to: Option<String>, // message_id of message being replied to
    pub created_at: DateTime<Utc>,
    pub read_by: Vec<String>, // agent_ids that have read this message
    pub resolved: bool, // Whether this message/request has been resolved
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Question, // Agent asking a question
    Answer, // Agent answering a question
    Update, // Agent sharing progress/status update
    Request, // Agent requesting help/review/approval
    Decision, // Agent sharing a decision (architecture, pattern, etc.)
    Warning, // Agent warning about conflicts/issues
    Announcement, // Agent announcing completion/blocker
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageContext {
    pub files_mentioned: Vec<PathBuf>,
    pub operations_mentioned: Vec<String>, // e.g., "editing src/api.rs", "running tests"
    pub tier_id: String,
    pub related_messages: Vec<String>, // message_ids
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessageBoard {
    pub messages: Vec<AgentMessage>,
    pub last_updated: DateTime<Utc>,
    pub schema_version: u32,
}
```

**Message routing:**

Messages can be routed to:
- **Direct:** Specific agent ID (`to_agent_id`)
- **By type:** All agents of a specific type (`to_agent_type`, e.g., "all test-automators")
- **By tier:** All agents in a specific tier (`to_tier_id`)
- **Broadcast:** All active agents (`to_agent_id = None`, `to_agent_type = None`, `to_tier_id = None`)

**Usage examples:**

**Example 1: Agent asking for help**

```rust
// Rust engineer needs help with testing
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "rust-engineer-1.1.1".to_string(),
    from_platform: Platform::Codex,
    to_agent_type: Some("test-automator".to_string()), // Ask all test-automators
    message_type: MessageType::Question,
    subject: "Need help writing tests for POST /users endpoint".to_string(),
    content: "I've implemented the POST /users endpoint in src/api.rs. Can someone help me write comprehensive tests? The endpoint handles validation, authentication, and database insertion.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["implemented POST /users endpoint".to_string()],
        tier_id: "1.1.1".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 2: Agent sharing a decision**

```rust
// Architect reviewer shares architectural decision
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "architect-reviewer-1.0".to_string(),
    from_platform: Platform::Claude,
    to_tier_id: Some("1.1".to_string()), // Share with all agents in tier 1.1
    message_type: MessageType::Decision,
    subject: "Architecture decision: Use Actix-web for API server".to_string(),
    content: "After reviewing requirements, I've decided we should use Actix-web for the API server. This provides async/await support, good performance, and strong Rust ecosystem integration. All agents working on API-related tasks should use this framework.".to_string(),
    context: MessageContext {
        files_mentioned: vec![],
        operations_mentioned: vec!["architecture review".to_string()],
        tier_id: "1.0".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 3: Agent warning about conflicts**

```rust
// Agent warns about file conflict
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "test-automator-1.1.2".to_string(),
    from_platform: Platform::Claude,
    to_agent_id: Some("rust-engineer-1.1.1".to_string()), // Direct message
    message_type: MessageType::Warning,
    subject: "File conflict: src/api.rs".to_string(),
    content: "I'm about to add tests for src/api.rs. Are you still editing it? I'll wait if you need more time.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["adding tests".to_string()],
        tier_id: "1.1.2".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Integration with orchestrator:**

The orchestrator monitors all messages and can:
- **Track agent communication:** See which agents are talking to each other
- **Detect blockers:** Identify when agents are stuck or need help
- **Monitor decisions:** Track architectural decisions and ensure consistency
- **Detect conflicts:** See warnings about file conflicts before they happen
- **Provide insights:** Show communication patterns in GUI

**Integration with agent prompts:**

Messages are injected into agent prompts as part of coordination context:

```rust
// In orchestrator, before executing agent
let coordination_context = coordinator.get_coordination_context().await?;
let messages = coordinator.get_messages_for_agent(&agent_id, &tier_id).await?;
let message_context = coordinator.format_messages_for_prompt(&messages)?;

let enhanced_prompt = format!(
    "{}\n\n{}\n\n**Messages from other agents:**\n{}",
    prompt,
    coordination_context,
    message_context
);
```

**Message filtering:**

Agents only see messages relevant to them:
- Messages addressed to their agent_id
- Messages addressed to their agent type
- Messages addressed to their tier_id
- Broadcast messages
- Messages mentioning files they're working on

**Message threading:**

Messages can be threaded (conversations):
- `thread_id`: Groups related messages together
- `in_reply_to`: Links reply to original message
- Agents can follow threads to see conversation history

**Message lifecycle:**

- **Created:** Agent posts message
- **Read:** Agent reads message (tracked in `read_by`)
- **Replied:** Agent replies (creates new message with `in_reply_to`)
- **Resolved:** Message marked as resolved (e.g., question answered, request fulfilled)
- **Expired:** Old messages (>24 hours) are archived or deleted

**Implementation:**

```rust
// src/core/agent_communication.rs

// DRY:DATA:AgentCommunicator — Agent-to-agent message communication
pub struct AgentCommunicator {
    message_board_file: PathBuf,
    coordinator: AgentCoordinator, // Reuse coordination state
}

impl AgentCommunicator {
    // DRY:FN:new — Create agent communicator
    pub fn new(project_root: &Path) -> Self {
        Self {
            message_board_file: project_root.join(".puppet-master").join("state").join("agent-messages.json"),
            coordinator: AgentCoordinator::new(project_root),
        }
    }

    // DRY:FN:post_message — Post a message to the message board
    // DRY REQUIREMENT: Validate agent_id using subagent_registry::is_valid_subagent_name() if it's a subagent name
    /// Post a message to the message board
    pub async fn post_message(&self, message: AgentMessage) -> Result<()> {
        // DRY: Validate message.from_agent_id if it's a subagent name (not a tier-specific ID)
        // Implementation note: Extract subagent name from agent_id if format is "subagent-tier_id"
        // and validate using subagent_registry::is_valid_subagent_name()
        let mut board = self.load_message_board().await?;
        board.messages.push(message);
        board.last_updated = Utc::now();
        self.save_message_board(&board).await
    }

    /// Get messages relevant to an agent
    pub async fn get_messages_for_agent(
        &self,
        agent_id: &str,
        tier_id: &str,
        agent_type: Option<&str>,
    ) -> Result<Vec<AgentMessage>> {
        let board = self.load_message_board().await?;
        let active_agents = self.coordinator.load_state().await?;

        // Filter messages relevant to this agent
        let relevant: Vec<_> = board.messages.iter()
            .filter(|msg| {
                // Direct message
                if let Some(ref to_id) = msg.to_agent_id {
                    if to_id == agent_id {
                        return true;
                    }
                }

                // Message to agent type
                if let Some(ref to_type) = msg.to_agent_type {
                    if agent_type.map(|t| t == to_type).unwrap_or(false) {
                        return true;
                    }
                }

                // Message to tier
                if let Some(ref to_tier) = msg.to_tier_id {
                    if to_tier == tier_id {
                        return true;
                    }
                }

                // Broadcast (no specific recipient)
                if msg.to_agent_id.is_none() && msg.to_agent_type.is_none() && msg.to_tier_id.is_none() {
                    return true;
                }

                // Message mentions files agent is working on
                if let Some(agent) = active_agents.active_agents.get(agent_id) {
                    for file in &agent.files_being_edited {
                        if msg.context.files_mentioned.contains(file) {
                            return true;
                        }
                    }
                }

                false
            })
            .cloned()
            .collect();

        Ok(relevant)
    }

    /// Format messages for prompt injection
    pub fn format_messages_for_prompt(&self, messages: &[AgentMessage]) -> Result<String> {
        if messages.is_empty() {
            return Ok(String::new());
        }

        let mut formatted = String::new();
        formatted.push_str("**Recent Messages from Other Agents:**\n\n");

        for msg in messages.iter().take(10) { // Limit to 10 most recent
            // DRY REQUIREMENT: Platform display name MUST use platform_specs::display_name_for() — NEVER hardcode platform names
            let platform_display = platform_specs::display_name_for(msg.from_platform);
            let from_info = format!("{} ({})", msg.from_agent_id, platform_display);
            let message_type_str = match msg.message_type {
                MessageType::Question => "❓ Question",
                MessageType::Answer => "✅ Answer",
                MessageType::Update => "📢 Update",
                MessageType::Request => "🙏 Request",
                MessageType::Decision => "🎯 Decision",
                MessageType::Warning => "⚠️ Warning",
                MessageType::Announcement => "📣 Announcement",
            };

            formatted.push_str(&format!(
                "- **{}** from {}: {}\n  {}\n",
                message_type_str,
                from_info,
                msg.subject,
                msg.content
            ));

            if !msg.context.files_mentioned.is_empty() {
                formatted.push_str(&format!(
                    "  Files: {}\n",
                    msg.context.files_mentioned.iter()
                        .map(|f| f.display().to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                ));
            }
        }

        Ok(formatted)
    }

    /// Mark message as read
    pub async fn mark_message_read(&self, message_id: &str, agent_id: &str) -> Result<()> {
        let mut board = self.load_message_board().await?;
        if let Some(msg) = board.messages.iter_mut().find(|m| m.message_id == message_id) {
            if !msg.read_by.contains(&agent_id.to_string()) {
                msg.read_by.push(agent_id.to_string());
                self.save_message_board(&board).await?;
            }
        }
        Ok(())
    }

    /// Archive old messages (>24 hours)
    pub async fn archive_old_messages(&self) -> Result<()> {
        let mut board = self.load_message_board().await?;
        let cutoff = Utc::now() - chrono::Duration::hours(24);

        let (active, archived): (Vec<_>, Vec<_>) = board.messages
            .into_iter()
            .partition(|msg| msg.created_at > cutoff || !msg.resolved);

        board.messages = active;
        self.save_message_board(&board).await?;

        // Save archived messages to separate file
        if !archived.is_empty() {
            let archive_file = self.message_board_file.with_extension("archive.json");
            // Append to archive file
            // ...
        }

        Ok(())
    }

    async fn load_message_board(&self) -> Result<AgentMessageBoard> {
        // Similar to AgentCoordinator::load_state
        // ...
    }

    async fn save_message_board(&self, board: &AgentMessageBoard) -> Result<()> {
        // Similar to AgentCoordinator::save_state (with locking)
        // ...
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with agent execution:**

Agents can post messages during execution:

```rust
// In orchestrator, during agent execution
// Parse agent output for message commands
if agent_output.contains("@message") || agent_output.contains("@ask") {
    // Extract message from agent output
    let message = parse_message_from_output(&agent_output)?;
    communicator.post_message(message).await?;
}

// Before agent execution, inject messages into prompt
let messages = communicator.get_messages_for_agent(&agent_id, &tier_id, Some(&agent_type)).await?;
let message_context = communicator.format_messages_for_prompt(&messages)?;
```

**Orchestrator monitoring:**

The orchestrator can monitor all messages for insights:

```rust
// In orchestrator
pub struct OrchestratorInsights {
    pub active_conversations: Vec<ConversationThread>,
    pub pending_questions: Vec<AgentMessage>,
    pub recent_decisions: Vec<AgentMessage>,
    pub conflict_warnings: Vec<AgentMessage>,
}

impl OrchestratorInsights {
    pub async fn analyze_communication(&self, communicator: &AgentCommunicator) -> Result<Self> {
        let board = communicator.load_message_board().await?;

        // Analyze messages for insights
        // ...
    }
}
```

**Benefits:**

1. **Cross-platform:** Works for all providers, even without native teams/fleets
2. **Orchestrator visibility:** Boss agent can see all subagent communication
3. **Enhanced coordination:** Agents can ask for help, share decisions, warn about conflicts
4. **File-based:** No API calls, pure file-based (fits Puppet Master architecture)
5. **Flexible routing:** Messages can be direct, by type, by tier, or broadcast
6. **Threaded conversations:** Supports multi-turn conversations
7. **Integration:** Works seamlessly with existing coordination state

**Potential issues and mitigations:**

- **Message spam:** Limit message rate per agent (max 10 messages/minute)
- **Large message board:** Archive old messages, limit message history
- **File locking:** Use same locking mechanism as coordination state
- **Message parsing:** Agents may not always format messages correctly -- provide clear instructions in prompts
- **Orphaned messages:** Messages from crashed agents -- mark as resolved after agent unregisters

**Next steps:**

1. Add message board to coordination state
2. Implement `AgentCommunicator` with message posting/reading
3. Integrate message injection into agent prompts
4. Add orchestrator monitoring/insights
5. Add GUI visualization of agent communication
6. Test with multiple agents across different platforms

### Gaps and Potential Issues for Agent Coordination

**Gap #28: File locking and concurrent writes**

**Issue:** Multiple agents may write to `active-agents.json` simultaneously, causing race conditions, file corruption, or lost updates. The current implementation reads the entire file, modifies it, and writes it back -- this is not atomic.

**Mitigation:**
- **File locking:** Use advisory file locks (e.g., `flock` on Unix, `File::lock` in Rust) to ensure exclusive access during writes. Implement retry logic with exponential backoff if lock acquisition fails.
- **Atomic writes:** Write to a temporary file (`active-agents.json.tmp`), then atomically rename to `active-agents.json` (rename is atomic on most filesystems).
- **Read-modify-write with retry:** If file changes between read and write, reload and retry (up to 3 attempts).
- **Lock timeout:** If lock cannot be acquired within 5 seconds, log warning and proceed (coordination may be stale but execution continues).

```rust
// src/core/agent_coordination.rs (enhanced)

use std::fs::File;
use std::io::{Read, Write};
use std::os::unix::fs::FileExt; // For file locking on Unix

impl AgentCoordinator {
    async fn save_state_with_lock(&self, state: &AgentCoordinationState) -> Result<()> {
        let lock_file = self.state_file.with_extension("lock");
        let mut attempts = 0;
        const MAX_ATTEMPTS: u32 = 3;

        loop {
            // Try to acquire lock
            match self.acquire_lock(&lock_file).await {
                Ok(_) => break,
                Err(e) if attempts < MAX_ATTEMPTS => {
                    attempts += 1;
                    tokio::time::sleep(tokio::time::Duration::from_millis(100 * attempts)).await;
                    continue;
                }
                Err(e) => {
                    // Lock timeout — log warning but proceed
                    tracing::warn!("Could not acquire coordination lock after {} attempts: {}. Proceeding without lock.", MAX_ATTEMPTS, e);
                    break;
                }
            }
        }

        // Write to temp file first
        let temp_file = self.state_file.with_extension("tmp");
        let json = serde_json::to_string_pretty(state)?;
        std::fs::write(&temp_file, json)?;

        // Atomic rename
        std::fs::rename(&temp_file, &self.state_file)?;

        // Release lock
        let _ = std::fs::remove_file(&lock_file);

        Ok(())
    }

    async fn acquire_lock(&self, lock_file: &Path) -> Result<()> {
        // Create lock file with PID
        let pid = std::process::id();
        let lock_content = format!("{}\n", pid);

        // Try to create lock file exclusively
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(lock_file)
        {
            Ok(mut file) => {
                file.write_all(lock_content.as_bytes())?;
                Ok(())
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                // Check if lock is stale (process no longer exists)
                if let Ok(content) = std::fs::read_to_string(lock_file) {
                    if let Ok(lock_pid) = content.trim().parse::<u32>() {
                        // Check if process exists (Unix-specific)
                        if !self.process_exists(lock_pid) {
                            // Stale lock — remove it
                            let _ = std::fs::remove_file(lock_file);
                            return self.acquire_lock(lock_file).await;
                        }
                    }
                }
                Err(anyhow!("Lock file exists"))
            }
            Err(e) => Err(anyhow!("Failed to create lock: {}", e)),
        }
    }

    fn process_exists(&self, pid: u32) -> bool {
        // Unix-specific: check if process exists
        #[cfg(unix)]
        {
            use std::process::Command;
            Command::new("kill")
                .args(&["-0", &pid.to_string()])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
        }
        #[cfg(not(unix))]
        {
            // Windows: use different approach
            true // Assume exists for now
        }
    }
}
```

**Gap #29: Error handling and file corruption recovery**

**Issue:** If `active-agents.json` becomes corrupted (invalid JSON, partial write, disk full), coordination breaks. Agents may not be able to register or read coordination state.

**Mitigation:**
- **JSON validation:** Validate JSON structure after reading. If invalid, try to parse what we can (best-effort recovery).
- **Backup before write:** Create backup (`active-agents.json.bak`) before each write. If write fails, restore from backup.
- **Fallback to empty state:** If file is corrupted and cannot be recovered, start with empty state (all agents unregistered). Log warning.
- **Corruption detection:** Check file size, JSON validity, and schema compliance. If corrupted, attempt recovery or reset.

```rust
async fn load_state(&self) -> Result<AgentCoordinationState> {
    if self.state_file.exists() {
        let json = match std::fs::read_to_string(&self.state_file) {
            Ok(json) => json,
            Err(e) => {
                tracing::error!("Failed to read coordination state: {}. Using empty state.", e);
                return Ok(AgentCoordinationState::default());
            }
        };

        // Try to parse JSON
        match serde_json::from_str::<AgentCoordinationState>(&json) {
            Ok(state) => {
                // Validate schema (check required fields)
                self.validate_state(&state)?;
                Ok(state)
            }
            Err(e) => {
                // Try backup
                let backup_file = self.state_file.with_extension("bak");
                if backup_file.exists() {
                    tracing::warn!("Coordination state corrupted. Attempting backup recovery.");
                    if let Ok(backup_json) = std::fs::read_to_string(&backup_file) {
                        if let Ok(backup_state) = serde_json::from_str(&backup_json) {
                            tracing::info!("Recovered coordination state from backup.");
                            return Ok(backup_state);
                        }
                    }
                }

                // Last resort: empty state
                tracing::error!("Coordination state corrupted and backup recovery failed: {}. Using empty state.", e);
                Ok(AgentCoordinationState::default())
            }
        }
    } else {
        Ok(AgentCoordinationState::default())
    }
}

fn validate_state(&self, state: &AgentCoordinationState) -> Result<()> {
    // Validate schema: check that all agents have required fields
    for (agent_id, agent) in &state.active_agents {
        if agent.agent_id.is_empty() {
            return Err(anyhow!("Invalid agent: empty agent_id"));
        }
        if agent.tier_id.is_empty() {
            return Err(anyhow!("Invalid agent {}: empty tier_id", agent_id));
        }
        // Check for reasonable timestamps (not in future, not too old)
        let now = Utc::now();
        if agent.started_at > now {
            return Err(anyhow!("Invalid agent {}: started_at in future", agent_id));
        }
        if agent.started_at < now - chrono::Duration::days(7) {
            // Agent running for 7+ days is likely stale
            tracing::warn!("Agent {} has been running for 7+ days — likely stale", agent_id);
        }
    }
    Ok(())
}
```

**Gap #30: Stale agent cleanup and crash recovery**

**Issue:** If an agent crashes or is killed without unregistering, it remains in `active-agents.json` indefinitely, causing false conflicts and stale coordination state.

**Mitigation:**
- **Heartbeat mechanism:** Agents update `last_update` timestamp periodically (every 30 seconds). Prune agents with `last_update` older than threshold (e.g., 5 minutes).
- **Process existence check:** When loading state, check if agent's process still exists (via PID if stored, or by checking worktree activity). Remove stale entries.
- **Automatic cleanup:** Before each coordination read/write, prune stale agents (no update in last 5 minutes).
- **Crash detection:** Detect agent crashes (process exit, worktree deletion) and automatically unregister.

```rust
async fn load_state(&self) -> Result<AgentCoordinationState> {
    // ... existing load logic ...

    // Prune stale agents
    let mut pruned = state.clone();
    let cutoff = Utc::now() - chrono::Duration::minutes(5); // 5 minute timeout
    let initial_count = pruned.active_agents.len();

    pruned.active_agents.retain(|agent_id, agent| {
        // Check if agent is stale
        if agent.last_update < cutoff {
            tracing::info!("Pruning stale agent: {} (last update: {} ago)",
                agent_id,
                Utc::now().signed_duration_since(agent.last_update));
            return false;
        }

        // Check if worktree still exists (if applicable)
        if let Some(ref worktree) = agent.worktree_path {
            if !worktree.exists() {
                tracing::info!("Pruning agent {}: worktree {} no longer exists", agent_id, worktree.display());
                return false;
            }
        }

        true
    });

    if pruned.active_agents.len() != initial_count {
        // Save pruned state
        self.save_state(&pruned).await?;
    }

    Ok(pruned)
}
```

**Gap #31: File operation extraction reliability**

**Issue:** Extracting file operations from agent output is unreliable. Agents may mention files they don't edit, or edit files they don't mention. Platform hooks may not fire for all file operations.

**Mitigation:**
- **Multi-source extraction:** Combine multiple sources: (1) agent output parsing (regex for file paths), (2) platform hooks (`PreToolUse`/`PostToolUse`), (3) provider stream/tool events from CLI output adapters, (4) git diff detection (compare worktree before/after).
- **Confidence scoring:** Assign confidence scores to file operations (high: platform hook detected, medium: agent mentioned, low: inferred from context). Only include high/medium confidence files in coordination state.
- **Validation:** After agent completes, validate claimed files against actual git diff. If mismatch, log warning and update coordination state.
- **Best-effort updates:** If file extraction fails, still register agent with empty `files_being_edited` list. Coordination context will still show agent is active, just without file details.

```rust
pub struct FileOperationExtractor;

impl FileOperationExtractor {
    /// Extract file operations from multiple sources
    pub async fn extract_files(
        &self,
        agent_output: &str,
        platform_hooks: Option<Vec<String>>, // Files detected by platform hooks
        git_diff: Option<Vec<PathBuf>>, // Files changed in git diff
    ) -> Vec<PathBuf> {
        let mut files = std::collections::HashSet::new();

        // Source 1: Platform hooks (highest confidence)
        if let Some(hook_files) = platform_hooks {
            for file in hook_files {
                files.insert(PathBuf::from(file));
            }
        }

        // Source 2: Git diff (high confidence)
        if let Some(diff_files) = git_diff {
            for file in diff_files {
                files.insert(file);
            }
        }

        // Source 3: Agent output parsing (medium confidence)
        let output_files = self.parse_files_from_output(agent_output);
        for file in output_files {
            files.insert(file);
        }

        files.into_iter().collect()
    }

    fn parse_files_from_output(&self, output: &str) -> Vec<PathBuf> {
        // Regex patterns for common file mentions
        let patterns = vec![
            r#"editing\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#"modifying\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#""([^"]+\.(rs|ts|js|py|go|java))""#,
            r#"'([^']+\.(rs|ts|js|py|go|java))'"#,
        ];

        let mut files = Vec::new();
        for pattern in patterns {
            let re = regex::Regex::new(pattern).unwrap();
            for cap in re.captures_iter(output) {
                if let Some(file_match) = cap.get(1) {
                    files.push(PathBuf::from(file_match.as_str()));
                }
            }
        }

        files
    }
}
```

**Gap #32: Coordination state size limits and performance**

**Issue:** If many agents run simultaneously (50+), `active-agents.json` becomes large, causing slow reads/writes and prompt token bloat. Coordination context injected into prompts may exceed token limits.

**Mitigation:**
- **Size limits:** Limit coordination state to max 100 active agents. If exceeded, prune oldest agents (by `started_at`).
- **Prompt context limits:** Limit coordination context to max 2000 tokens. If exceeded, summarize (e.g., "15 agents active, 8 editing files") or filter (only show agents editing files in current directory).
- **Lazy loading:** Only load coordination state when needed (before agent execution), not on every orchestrator tick.
- **Caching:** Cache coordination context for 5 seconds to avoid repeated file reads.
- **Filtering:** Allow filtering coordination context by tier, platform, or file path to reduce size.

```rust
pub async fn get_coordination_context(
    &self,
    filter: Option<CoordinationFilter>, // Filter by tier, platform, file path
) -> Result<String> {
    let state = self.load_state().await?;
    let mut context = String::new();

    // Apply filters
    let filtered_agents: Vec<_> = state.active_agents.values()
        .filter(|agent| {
            if let Some(ref filter) = filter {
                if let Some(ref tier_filter) = filter.tier_id {
                    if agent.tier_id != *tier_filter {
                        return false;
                    }
                }
                if let Some(ref platform_filter) = filter.platform {
                    if agent.platform != *platform_filter {
                        return false;
                    }
                }
                if let Some(ref file_filter) = filter.file_path {
                    if !agent.files_being_edited.iter().any(|f| f == file_filter) {
                        return false;
                    }
                }
            }
            true
        })
        .collect();

    // Limit to max agents
    let max_agents = 20; // Limit to prevent token bloat
    let agents_to_show: Vec<_> = filtered_agents.iter().take(max_agents).collect();

    if agents_to_show.is_empty() {
        return Ok(String::new());
    }

    // Build context (same as before but with limit)
    // ... existing context building logic ...

    // If context exceeds token limit, summarize
    let estimated_tokens = context.len() / 4; // Rough estimate
    if estimated_tokens > 2000 {
        context = self.summarize_coordination_context(&agents_to_show)?;
    }

    Ok(context)
}

pub struct CoordinationFilter {
    pub tier_id: Option<String>,
    pub platform: Option<Platform>,
    pub file_path: Option<PathBuf>,
}
```

**Gap #33: Conflict resolution and file locking**

**Issue:** If two agents want to edit the same file, coordination context warns them, but there's no automatic conflict resolution. Agents may ignore warnings or both proceed, causing merge conflicts.

**Mitigation:**
- **Conflict detection:** Before agent starts, check coordination state for file conflicts. If conflict detected, either (1) delay agent start, (2) select alternative files, or (3) escalate to orchestrator.
- **File-level locking:** Extend coordination state to include file locks (which agent has "locked" a file for editing). Agents must acquire lock before editing.
- **Lock timeout:** File locks expire after 30 minutes (agent should finish editing by then). Stale locks are automatically released.
- **Orchestrator intervention:** If conflict persists, orchestrator can serialize execution (run agents sequentially instead of parallel) or reassign files.

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileLock {
    pub file_path: PathBuf,
    pub locked_by: String, // agent_id
    pub locked_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl AgentCoordinator {
    /// Check for file conflicts before agent starts
    pub async fn check_file_conflicts(
        &self,
        agent_id: &str,
        files_to_edit: &[PathBuf],
    ) -> Result<Vec<FileConflict>> {
        let state = self.load_state().await?;
        let mut conflicts = Vec::new();

        for file in files_to_edit {
            // Check if any other agent is editing this file
            for (other_agent_id, other_agent) in &state.active_agents {
                if *other_agent_id != agent_id && other_agent.files_being_edited.contains(file) {
                    conflicts.push(FileConflict {
                        file: file.clone(),
                        conflicting_agent: other_agent_id.clone(),
                        conflicting_platform: other_agent.platform.clone(),
                    });
                }
            }
        }

        Ok(conflicts)
    }

    /// Acquire file lock (if available)
    pub async fn acquire_file_lock(
        &self,
        agent_id: &str,
        file: &Path,
        duration_minutes: u64,
    ) -> Result<bool> {
        let mut state = self.load_state().await?;

        // Check if file is already locked
        // (This would require extending AgentCoordinationState with file_locks field)
        // For now, check files_being_edited

        // If not locked, add to agent's files_being_edited
        if let Some(agent) = state.active_agents.get_mut(agent_id) {
            if !agent.files_being_edited.contains(file) {
                agent.files_being_edited.push(file.to_path_buf());
                agent.last_update = Utc::now();
                self.save_state(&state).await?;
                return Ok(true);
            }
        }

        Ok(false) // File already locked
    }
}

pub struct FileConflict {
    pub file: PathBuf,
    pub conflicting_agent: String,
    pub conflicting_platform: Platform,
}
```

**Gap #34: Path normalization and worktree handling**

**Issue:** Agents may report file paths in different formats (relative vs absolute, worktree paths vs main repo paths). Coordination state may not correctly match files across worktrees.

**Mitigation:**
- **Path normalization:** Normalize all paths to relative paths from project root before storing in coordination state.
- **Worktree path resolution:** Convert worktree paths to main repo paths (e.g., `.puppet-master/worktrees/A/src/api.rs` → `src/api.rs`).
- **Path comparison:** Use canonical paths for comparison (resolve symlinks, normalize separators).

```rust
impl AgentCoordinator {
    fn normalize_path(&self, path: &Path, project_root: &Path) -> PathBuf {
        // If path is absolute, make it relative to project root
        if path.is_absolute() {
            if let Ok(relative) = path.strip_prefix(project_root) {
                return relative.to_path_buf();
            }
        }

        // If path is in worktree, convert to main repo path
        if let Ok(stripped) = path.strip_prefix(".puppet-master/worktrees/") {
            // Extract worktree name and file path
            if let Some(components) = stripped.components().next() {
                // Remove worktree prefix, keep file path
                return stripped.strip_prefix(components).unwrap_or(stripped).to_path_buf();
            }
        }

        path.to_path_buf()
    }
}
```

**Gap #35: Coordination-event ingestion fallback**

**Issue:** If provider event ingestion fails (e.g. adapter parse errors, stream interruption), coordination updates can degrade, and there is no explicit fallback policy.

**Mitigation:**
- **Fallback detection:** Detect event-ingestion failures (parser error, stream timeout, malformed event). Automatically continue with file-based baseline updates.
- **Baseline-first coordination:** Keep file-based coordination as the canonical path; event ingestion is an enrichment layer only.
- **Error handling:** Log ingestion failures but do not block execution. Continue with baseline file-based coordination.

**Gap #36: Coordination metrics and monitoring**

**Issue:** No visibility into coordination effectiveness. Can't tell if coordination is preventing conflicts, how often agents wait, or if coordination state is accurate.

**Mitigation:**
- **Metrics:** Track coordination events (agent registered, conflicts detected, stale agents pruned, file locks acquired).
- **Logging:** Log coordination state changes (agent registered/unregistered, file conflicts detected, coordination context injected).
- **Monitoring:** Add coordination state to GUI (show active agents, file locks, conflicts).
- **Analytics:** Track coordination effectiveness (conflicts prevented, false positives, coordination accuracy).

### Improvements to Agent Coordination

**Improvement #1: Coordination state querying and filtering**

Add methods to query coordination state by platform, tier, file path, or agent ID:

```rust
impl AgentCoordinator {
    pub async fn get_agents_by_platform(&self, platform: Platform) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.platform == platform)
            .cloned()
            .collect())
    }

    pub async fn get_agents_by_tier(&self, tier_id: &str) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.tier_id == tier_id)
            .cloned()
            .collect())
    }

    pub async fn get_agents_editing_file(&self, file: &Path) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.files_being_edited.contains(file))
            .cloned()
            .collect())
    }
}
```

**Improvement #2: Coordination state backup and recovery**

Automatically backup coordination state before each write, with retention policy:

```rust
impl AgentCoordinator {
    async fn save_state(&self, state: &AgentCoordinationState) -> Result<()> {
        // Backup current state
        if self.state_file.exists() {
            let backup_file = self.state_file.with_extension(format!("bak.{}", Utc::now().timestamp()));
            let _ = std::fs::copy(&self.state_file, &backup_file);

            // Cleanup old backups (keep last 10)
            self.cleanup_old_backups().await?;
        }

        // Save new state (with locking as above)
        self.save_state_with_lock(state).await
    }

    async fn cleanup_old_backups(&self) -> Result<()> {
        // Implementation: list backup files, sort by timestamp, keep last 10
        // ...
    }
}
```

**Improvement #3: Coordination state validation and schema versioning**

Add schema versioning to coordination state to handle format changes:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCoordinationState {
    pub schema_version: u32, // Current version: 1
    pub active_agents: HashMap<String, ActiveAgent>,
    pub last_updated: DateTime<Utc>,
}

impl AgentCoordinator {
    fn validate_schema_version(&self, state: &AgentCoordinationState) -> Result<()> {
        const CURRENT_SCHEMA_VERSION: u32 = 1;

        if state.schema_version != CURRENT_SCHEMA_VERSION {
            return Err(anyhow!(
                "Coordination state schema version mismatch: expected {}, got {}",
                CURRENT_SCHEMA_VERSION,
                state.schema_version
            ));
        }

        Ok(())
    }

    async fn migrate_schema(&self, old_state: AgentCoordinationState) -> Result<AgentCoordinationState> {
        // Migrate old schema versions to current
        // ...
    }
}
```

### Handling Concurrent Subagent Execution

When multiple subagents run in parallel:

1. **Worktree Isolation**: Each subtask has its own worktree, so subagents don't interfere
2. **Independent Selection**: Each subtask selects subagents independently based on its own context
3. **Resource Management**: Platform runners handle concurrent invocations
4. **Context Sharing**: Completed subtasks share results via dependency chain, not direct subagent communication
5. **Coordination**: Agents coordinate through shared state files and real-time coordination state (see "Agent Coordination and Communication" above)

**Example:**
```rust
// Parallel execution with different subagents
Level 0:
  - Subtask A (rust-engineer) → Worktree: .puppet-master/worktrees/A
  - Subtask B (react-specialist) → Worktree: .puppet-master/worktrees/B
  - Subtask C (python-pro) → Worktree: .puppet-master/worktrees/C

// All run concurrently, each with appropriate subagent
// Results merged back to main branch after completion
```

### Subagent Conflict Prevention

**Potential Conflicts:**
1. **File Conflicts**: Multiple subagents modifying same files
2. **Resource Conflicts**: Platform quota limits
3. **Context Conflicts**: Conflicting architectural decisions

**Mitigation Strategies:**

**Coordination-based prevention (primary):** Use agent coordination (see "Agent Coordination and Communication" above) to prevent conflicts:
- Agents register files they're editing in `active-agents.json`
- Before starting work, agents check coordination state for file conflicts
- If conflict detected, agent waits or selects alternative files
- Coordination context injected into prompts warns agents about active files

**Conflict detection (secondary):** Detect conflicts before execution:

```rust
// src/core/subagent_selector.rs (additions)

pub struct SubagentConflictDetector;

impl SubagentConflictDetector {
    /// Check for potential conflicts between parallel subagents using coordination state
    pub async fn detect_conflicts(
        &self,
        subagent_groups: &[Vec<String>],
        tier_contexts: &[TierContext],
        coordinator: &AgentCoordinator,
    ) -> Vec<Conflict> {
        let mut conflicts = Vec::new();
        let coordination_state = coordinator.load_state().await.ok();

        // Check for overlapping file modifications using coordination state
        for (i, context_a) in tier_contexts.iter().enumerate() {
            for (j, context_b) in tier_contexts.iter().enumerate().skip(i + 1) {
                if let Some(state) = &coordination_state {
                    // Check if any active agents are editing overlapping files
                    let files_a: Vec<_> = state.active_agents.values()
                        .filter(|a| a.tier_id == context_a.item_id)
                        .flat_map(|a| &a.files_being_edited)
                        .collect();
                    let files_b: Vec<_> = state.active_agents.values()
                        .filter(|a| a.tier_id == context_b.item_id)
                        .flat_map(|a| &a.files_being_edited)
                        .collect();

                    let overlapping: Vec<_> = files_a.iter()
                        .filter(|f| files_b.contains(f))
                        .collect();

                    if !overlapping.is_empty() {
                        conflicts.push(Conflict {
                            type_: ConflictType::FileOverlap,
                            subtask_a: i,
                            subtask_b: j,
                            files: overlapping.iter().map(|f| (*f).clone()).collect(),
                        });
                    }
                }
            }
        }

        // Check for architectural conflicts
        for (i, subagents_a) in subagent_groups.iter().enumerate() {
            for (j, subagents_b) in subagent_groups.iter().enumerate().skip(i + 1) {
                if self.has_architectural_conflict(subagents_a, subagents_b) {
                    conflicts.push(Conflict {
                        type_: ConflictType::Architectural,
                        subtask_a: i,
                        subtask_b: j,
                        files: Vec::new(),
                    });
                }
            }
        }

        conflicts
    }

    fn has_architectural_conflict(
        &self,
        subagents_a: &[String],
        subagents_b: &[String],
    ) -> bool {
        // Check if subagents might make conflicting decisions
        // e.g., architect-reviewer vs different language engineers
        subagents_a.contains(&"architect-reviewer".to_string()) &&
        subagents_b.contains(&"architect-reviewer".to_string())
    }
}

pub enum ConflictType {
    FileOverlap,
    Architectural,
    ResourceLimit,
}

pub struct Conflict {
    pub type_: ConflictType,
    pub subtask_a: usize,
    pub subtask_b: usize,
    pub files: Vec<String>,
}
```

### Parallel Execution Configuration

**Concurrency caps rationale:** Per-platform concurrency limits exist for two reasons:

1. **Provider rate limits:** Each platform (Cursor, Codex, Claude Code, Gemini, Copilot) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project folder. Running too many concurrent processes degrades the user's development environment.

**Source of caps:** The orchestrator uses the **effective per-provider cap** from config (global default + Orchestrator-context override if set), NOT a value from the plan graph. The plan graph defines only dependency structure (`depends_on`, plus blocking edges such as `blockers`/`unblocks` where applicable); max concurrent is an execution/config concern. See `Plans/FinalGUISpec.md` §7.4.7 for the full settings model (global + per-context overrides).

**Crew limits vs agent limits:** These are separate concepts:
- **Per-platform agent cap** (below): limits individual concurrent agent/subagent processes per platform. This is what hits rate limits and machine load.
- **Crew cap** (`max_concurrent_crews_per_platform` in Gap #40): limits concurrent crew groups per platform. A crew is a logical group of subagents working together.

Both limits apply: a crew spawn must not exceed either the crew cap or the per-platform agent cap.

```yaml
# .puppet-master/config.yaml (additions)

orchestrator:
  enableParallelExecution: true

  parallelConfig:
    maxConcurrent: 3
    continueOnFailure: false
    taskTimeoutSecs: 3600

  # Subagent-specific parallel settings
  subagentParallelConfig:
    # Allow different subagents to run in parallel
    allowParallelSubagents: true

    # Per-platform agent caps are now sourced from the global concurrency
    # config (concurrency.global.per_provider) with optional Orchestrator-
    # context override (concurrency.overrides.orchestrator.per_provider).
    # See Plans/FinalGUISpec.md §7.4.7 for the settings model.
    # Effective cap = orchestrator override if set, else global default.
    # Legacy key kept for reference; implementation reads from unified config:
    maxConcurrentPerPlatform:
      cursor: 3
      codex: 2
      claude: 3
      gemini: 2
      copilot: 2

    # Conflict detection
    detectConflicts: true
    failOnConflict: false  # Warn but continue

    # Context inheritance from dependencies
    inheritFromDependencies: true
    inheritLanguage: true
    inheritDomain: true
```

### Benefits of Parallel Subagent Execution

1. **Faster Execution**: Multiple specialized subagents work simultaneously
2. **Better Specialization**: Each subtask gets the right subagent for its domain
3. **Resource Efficiency**: Worktrees isolate changes, preventing conflicts
4. **Scalability**: Can handle complex projects with many parallel subtasks

### Example: Multi-Language Project

**Scenario:** Full-stack project with Rust backend and React frontend

**Phase 1: Setup**
- `project-manager` coordinates

**Task 1: Backend API**
- Subtask 1.1: Database schema (parallelizable)
  - `rust-engineer` + `database-administrator`
- Subtask 1.2: API endpoints (parallelizable)
  - `rust-engineer` + `api-designer`
- Subtask 1.3: Authentication (depends on 1.1, 1.2)
  - `rust-engineer` + `security-engineer`

**Task 2: Frontend UI**
- Subtask 2.1: Component library (parallelizable)
  - `react-specialist` + `frontend-developer`
- Subtask 2.2: API integration (depends on Task 1)
  - `react-specialist` + `frontend-developer`

**Execution Flow:**
```
Level 0 (Parallel):
  - 1.1: rust-engineer + database-administrator
  - 1.2: rust-engineer + api-designer
  - 2.1: react-specialist + frontend-developer

Level 1 (After Level 0):
  - 1.3: rust-engineer + security-engineer (inherits context from 1.1, 1.2)

Level 2 (After Task 1):
  - 2.2: react-specialist + frontend-developer (inherits API context from Task 1)
```

### Implementation Considerations

1. **Subagent Selection Timing**: Select subagents **before** building dependency groups, so each subtask knows its subagents
2. **Context Caching**: Cache project context detection to avoid repeated filesystem scans
3. **Worktree Management**: Ensure worktrees are created before subagent execution
4. **Result Aggregation**: Merge subagent outputs correctly when dependencies complete
5. **Error Handling**: If one parallel subtask fails, handle gracefully based on `continue_on_failure` config

### Updated Orchestrator Flow

```rust
// High-level flow with subagents and parallel execution

1. Detect project context (language, framework, domain) - CACHED
2. For each tier level:
   a. Build dependency graph
   b. Get parallelizable groups
   c. For each group:
      - Select subagents for each subtask (independent)
      - Create worktrees
      - Execute subtasks in parallel with their subagents
      - Merge results
      - Cleanup worktrees
3. Advance to next dependency level
```


