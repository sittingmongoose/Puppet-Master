## Autonomous QA Loop Pattern Integration

### Overview

The [autonomous QA loop pattern](https://gist.github.com/gsemet/1ef024fc426cfc75f946302033a69812) provides a proven orchestrator pattern for autonomous task execution with quality gates. While designed for VS Code Copilot, its concepts can enhance our orchestrator subagent integration.

### Key Concepts from Autonomous QA Loop

1. **Orchestrator/Subagent Separation**: Orchestrator manages loop, subagents implement tasks
2. **Three-Tier QA System**: Preflight → Task Inspector → Phase Inspector
3. **Progress Tracking**: Visual status symbols (⬜ 🔄 ✅ 🔴) with detailed tracking
4. **Task Prioritization**: Incomplete tasks (🔴) prioritized over new tasks
5. **Phase-Aware Execution**: Only work on current phase, don't jump ahead
6. **Pause Mechanism**: `PAUSE.md` file to safely halt execution
7. **Commit Strategy**: Amend commits for rework, conventional commits for new work

### Integration Opportunities

#### 1. Enhanced Progress Tracking

**Current State**: Orchestrator tracks tier state in state machines
**Enhancement**: Add visual progress tracking similar to an autonomous QA loop

```rust
// src/core/progress_tracker.rs (new)

pub struct TaskProgress {
    pub task_id: String,
    pub status: TaskStatus,
    pub phase: String,
    pub inspector_notes: Option<String>,
    pub last_inspector_feedback: Option<String>,
}

pub enum TaskStatus {
    NotStarted,      // ⬜
    InProgress,      // 🔄
    Completed,       // ✅ (verified by inspector)
    Incomplete,      // 🔴 (requires rework)
    Skipped,         // ⏸️
}

pub struct ProgressTracker {
    tasks: Vec<TaskProgress>,
    current_phase: String,
}

impl ProgressTracker {
    /// Prioritize incomplete tasks
    pub fn get_next_task(&self) -> Option<&TaskProgress> {
        // First: incomplete tasks in current phase
        self.tasks.iter()
            .filter(|t| t.phase == self.current_phase)
            .find(|t| matches!(t.status, TaskStatus::Incomplete))
            // Then: not started tasks in current phase
            .or_else(|| {
                self.tasks.iter()
                    .filter(|t| t.phase == self.current_phase)
                    .find(|t| matches!(t.status, TaskStatus::NotStarted))
            })
    }
}
```

#### 2. Three-Tier QA System

**Current State**: Orchestrator has verification gates between tiers
**Enhancement**: Add per-task and per-phase inspection

```rust
// src/core/qa_system.rs (new)

pub struct QASystem {
    preflight_runner: PreflightRunner,
    task_inspector: TaskInspector,
    phase_inspector: PhaseInspector,
}

impl QASystem {
    /// Tier 1: Preflight checks (run by subagent before marking complete)
    pub async fn run_preflight(&self, tier_id: &str) -> Result<PreflightResult> {
        // Existing preflight logic
    }

    /// Tier 2: Task Inspector (run after each task completion)
    pub async fn inspect_task(
        &self,
        task_id: &str,
        task_file: &Path,
        commit_hash: &str,
    ) -> TaskInspectionResult {
        // Review commit changes
        // Verify acceptance criteria met
        // Check test coverage
        // Return: Complete or Incomplete with feedback
    }

    /// Tier 3: Phase Inspector (run when phase completes)
    pub async fn inspect_phase(
        &self,
        phase_name: &str,
        phase_tasks: &[String],
    ) -> PhaseInspectionResult {
        // Review all phase commits
        // Verify phase-level acceptance criteria
        // Check integration between tasks
        // Generate validation report
    }
}
```

#### 3. Task Inspector Integration

**Enhancement**: Add automatic task inspection after subagent completion

```rust
// src/core/orchestrator.rs (modifications)

impl Orchestrator {
    async fn execute_tier_with_subagents(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // ... existing subagent selection and execution ...

        // Execute subagent
        let result = self.execute_with_subagent(...).await?;

        // Tier 2: Task Inspector (automatic after completion)
        if tier_node.tier_type == TierType::Subtask {
            let inspection = self.qa_system.inspect_task(
                &tier_node.id,
                &task_file_path,
                &latest_commit_hash,
            ).await?;

            match inspection.status {
                InspectionStatus::Complete => {
                    // Mark as ✅ Completed
                    self.progress_tracker.mark_completed(&tier_node.id).await?;
                }
                InspectionStatus::Incomplete { feedback } => {
                    // Mark as 🔴 Incomplete with feedback
                    self.progress_tracker.mark_incomplete(
                        &tier_node.id,
                        feedback,
                    ).await?;

                    // Prepend feedback to task file for next iteration
                    self.prepend_task_feedback(&tier_node.id, feedback).await?;
                }
            }
        }

        Ok(())
    }
}
```

#### 4. Phase Inspector

**Enhancement**: Add phase-level validation

```rust
// src/core/orchestrator.rs (additions)

impl Orchestrator {
    async fn check_phase_completion(&self, phase_id: &str) -> Result<()> {
        let all_tasks_complete = self.progress_tracker
            .phase_tasks_complete(phase_id)?;

        if all_tasks_complete {
            // Tier 3: Phase Inspector
            let phase_report = self.qa_system.inspect_phase(
                phase_id,
                &self.progress_tracker.get_phase_tasks(phase_id)?,
            ).await?;

            // Advance to next phase
            self.progress_tracker.advance_phase().await?;
        }

        Ok(())
    }
}
```

#### 5. Pause Mechanism

**Enhancement**: Add `PAUSE.md` file check before each iteration

```rust
// src/core/orchestrator.rs (additions)

impl Orchestrator {
    async fn check_pause_gate(&self) -> Result<bool> {
        let pause_file = self.config.paths.workspace
            .join(".puppet-master")
            .join("PAUSE.md");

        if pause_file.exists() {
            log::info!("Pause gate active - orchestrator halted");
            // Emit event for GUI
            return Ok(true);
        }

        Ok(false)
    }

    async fn run_loop(&self) -> Result<()> {
        loop {
            // Check pause gate first
            if self.check_pause_gate().await? {
                return Ok(()); // Exit loop, wait for resume
            }

            // ... rest of loop ...
        }
    }
}
```

#### 6. Commit Strategy for Rework

**Enhancement**: Amend commits for incomplete task rework

```rust
// src/core/orchestrator.rs (modifications)

impl Orchestrator {
    async fn commit_tier_progress(
        &self,
        tier_id: &str,
        tier_type: TierType,
        iteration: u32,
        is_rework: bool,
    ) -> Result<()> {
        let message = if is_rework {
            // For rework, amend previous commit
            format!("tier: {} iteration {} (after review)", tier_id, iteration)
        } else {
            format!("tier: {} iteration {} complete", tier_id, iteration)
        };

        if is_rework {
            // Amend previous commit
            self.git_manager.commit_amend(&message).await?;
        } else {
            // New commit
            self.git_manager.commit(&message).await?;
        }

        Ok(())
    }
}
```

### Updated Orchestrator Loop

```rust
// Enhanced orchestrator loop with autonomous QA loop patterns

async fn run_enhanced_loop(&self) -> Result<()> {
    loop {
        // Step 0: Check pause gate
        if self.check_pause_gate().await? {
            return Ok(()); // Paused
        }

        // Step 1: Read progress
        let progress = self.progress_tracker.read().await?;

        // Step 2: Get next task (prioritize incomplete)
        let next_task = match progress.get_next_task() {
            Some(task) => task,
            None => {
                // All tasks complete
                break;
            }
        };

        // Step 3: Execute with subagent
        // DRY REQUIREMENT: Subagent selection MUST use subagent_selector which uses subagent_registry
        let subagents = self.subagent_selector.select_for_tier(
            next_task.tier_type,
            &tier_context,
        );
        // DRY: Validate selected subagent names using subagent_registry::is_valid_subagent_name()

        // DRY REQUIREMENT: execute_with_subagents MUST use platform_specs for platform-specific invocation
        let result = self.execute_with_subagents(
            &next_task.tier_node,
            &subagents,
        ).await?;

        // Step 4: Run preflight (Tier 1 QA)
        let preflight_result = self.qa_system.run_preflight(&next_task.id).await?;
        if !preflight_result.passed {
            self.progress_tracker.mark_incomplete(
                &next_task.id,
                format!("Preflight failed: {}", preflight_result.errors.join(", ")),
            ).await?;
            continue;
        }

        // Step 5: Task Inspector (Tier 2 QA)
        let inspection = self.qa_system.inspect_task(
            &next_task.id,
            &next_task.file_path,
            &result.commit_hash,
        ).await?;

        match inspection.status {
            InspectionStatus::Complete => {
                self.progress_tracker.mark_completed(&next_task.id).await?;
            }
            InspectionStatus::Incomplete { feedback } => {
                self.progress_tracker.mark_incomplete(
                    &next_task.id,
                    feedback.clone(),
                ).await?;
                self.prepend_task_feedback(&next_task.id, feedback).await?;
                continue; // Re-loop to fix incomplete task
            }
        }

        // Step 6: Check phase completion
        if self.progress_tracker.phase_complete(&next_task.phase)? {
            // Tier 3: Phase Inspector
            let phase_report = self.qa_system.inspect_phase(
                &next_task.phase,
                &self.progress_tracker.get_phase_tasks(&next_task.phase)?,
            ).await?;

            // Advance to next phase
            self.progress_tracker.advance_phase().await?;
        }
    }

    Ok(())
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Benefits of Autonomous QA Loop Integration

1. **Better Quality Assurance**: Three-tier QA catches issues at multiple levels
2. **Clear Progress Visibility**: Visual status symbols make progress obvious
3. **Rework Prioritization**: Incomplete tasks are fixed before new work
4. **Safe Pausing**: PAUSE.md allows safe editing of tasks/progress
5. **Better Commit History**: Amended commits for rework keep history clean
6. **Phase Discipline**: Prevents jumping ahead to next phase prematurely

### Implementation Considerations

1. **Progress File Format**: Use Markdown with status symbols for readability
2. **Inspector Feedback**: Prepend feedback to task files so subagents see it first
3. **Pause File Location**: `.puppet-master/PAUSE.md` for easy access
4. **Commit Amending**: Track which commits are reworks vs new work
5. **Inspector Subagents**: Could use specialized subagents for inspection (code-reviewer, qa-expert)

### Updated Configuration

```yaml
# .puppet-master/config.yaml (additions)

orchestrator:
  # Autonomous QA loop enhancements
  enableAutonomousQaLoopPatterns: true

  # Three-tier QA system
  qaSystem:
    enablePreflight: true
    enableTaskInspector: true
    enablePhaseInspector: true

  # Progress tracking
  progressTracking:
    useVisualStatus: true  # ⬜ 🔄 ✅ 🔴
    trackInspectorFeedback: true
    prependFeedbackToTasks: true

  # Commit strategy
  commits:
    amendForRework: true
    conventionalFormat: true
```

