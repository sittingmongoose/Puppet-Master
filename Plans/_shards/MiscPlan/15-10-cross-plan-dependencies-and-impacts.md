## 10. Cross-Plan Dependencies and Impacts

This section ties the Misc Plan to **Plans/WorktreeGitImprovement.md**, **Plans/orchestrator-subagent-integration.md**, and **Plans/interview-subagent-integration.md**: what this plan depends on, what it impacts, and what else needs to be done so cleanup fits the rest of the system.

### 10.1 WorktreeGitImprovement.md

**What the Worktree plan does:** Config wiring (Option B: build run config from GUI at run start), worktree create/merge/cleanup (of worktree *directories*), active_worktrees repopulation, git binary resolution, GitHub API PR creation wiring (no GitHub CLI), Branching tab GUI, Doctor worktrees check.

**Dependencies (MiscPlan depends on Worktree):**

- **Config wiring (Phase 1):** Cleanup config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, etc.) must live in the **same** config shape that the run receives. When implementing MiscPlan §7 (Cleanup UX & Config), add cleanup fields to that schema and ensure they are populated from the GUI (or file) the same way as other run settings. If Option B is not yet implemented, cleanup toggles in the GUI would not affect the run; implement Option B first or in parallel so cleanup config is wired.
- **Git binary resolution (Phase 3):** The Worktree plan introduces a shared helper for resolving the `git` executable: `path_utils::resolve_git_executable()`, used by both GitManager and Doctor. **MiscPlan's cleanup module** must use that same helper when running `git clean` (in `run_git_clean_with_excludes`). Do not use `Command::new("git")` alone; resolve the binary so cleanup works in environments where git is only in app-local or custom paths. See Worktree §3.1, §7.5.
- **Worktree list for "Clean workspace" (optional):** If implementing "Clean workspace now" for **all active worktrees** (§7.2), the list of worktrees must come from the same place as the orchestrator (e.g. `worktree_manager.list_worktrees()` and/or `active_worktrees`). Worktree plan §2.2 and §7.6 describe repopulation of active_worktrees; if that is not done, "clean all worktrees" may only clean the main workspace. Prefer implementing after or with Worktree Phase 2 so worktree list is reliable.

**Distinction:** Worktree plan's "cleanup" is **removing the worktree directory** after merge (`cleanup_subtask_worktree`, `remove_worktree`). MiscPlan's cleanup is **removing untracked/ignored files *inside* ** the workspace or worktree. Both apply: after an iteration, run MiscPlan's cleanup_after_execution in that worktree; when the subtask is done and merged, run Worktree's remove_worktree. No conflict.

**STATE_FILES.md:** Worktree plan adds a worktrees subsection under `.puppet-master/`; MiscPlan adds agent-output and possibly evidence retention. Both can update STATE_FILES in their own subsections.

### 10.2 orchestrator-subagent-integration.md

**What the Orchestrator plan does:** Subagent selection and invocation at Phase/Task/Subtask/Iteration, config-wiring validation, start/end verification (verify_tier_start, verify_tier_end) at tier boundaries, quality verification (reviewer subagent, gate criteria), parallel execution with worktrees per subtask.

**Impacts (MiscPlan impacts Orchestrator):**

- **Single execution path:** All agent runs (main iteration and subagent runs) should go through the same prepare → execute → cleanup flow. When the orchestrator plan adds `execute_tier_with_subagents` or similar, that path must **use run_with_cleanup** (or the same prepare/execute/cleanup wrapper) so that both "main" iterations and subagent invocations get prepare_working_directory before run and cleanup_after_execution after run. Do not call `runner.execute()` directly from new orchestrator/subagent code; use the wrapper from MiscPlan §4.6.
- **Ordering with start/end verification:** Orchestrator plan's verify_tier_start runs at Phase/Task/Subtask (and optionally Iteration) **entry**; verify_tier_end runs at Phase/Task/Subtask **completion**. MiscPlan's prepare/cleanup run at **iteration** boundaries (before and after each runner.execute). So the flow is: verify_tier_start (tier) → ... → prepare_working_directory (iteration) → execute → cleanup_after_execution (iteration) → ... → verify_tier_end (tier). No conflict; both apply. When implementing orchestrator start/end verification, keep iteration-level prepare/cleanup as defined in MiscPlan.
- **Parallel subtasks:** Each parallel subtask has its own worktree and working_dir. cleanup_after_execution runs in that subtask's work_dir only (per MiscPlan §3.3). Orchestrator plan's parallel execution (worktree per subtask) is compatible; no extra change needed.
- **Commit order:** The orchestrator calls commit_tier_progress **after** the iteration returns; run_with_cleanup runs cleanup **before** that. So cleanup_after_execution must not remove untracked files (§9.1.13); only runner temp files. Full workspace untracked clean runs in prepare_working_directory (before the run).

**Dependencies (MiscPlan depends on Orchestrator):** None. MiscPlan can be implemented first; orchestrator subagent integration should then wire its runner calls through run_with_cleanup.

### 10.3 interview-subagent-integration.md

**What the Interview plan does:** Subagent persona assignments per interview phase, research_engine enhancements (e.g. research_pre_question_with_subagent), prompt templates with subagent instructions, SubagentInvoker for platform-specific invocation, document generation and validation subagents.

**Impacts (MiscPlan impacts Interview):**

- **Research engine:** Interview plan adds or extends `research_pre_question_with_subagent` and similar. Whenever the interview flow calls the platform runner (e.g. `runner.execute(&request)` in research_engine or in subagent invocation), that call must go through **run_with_cleanup** so the interview working directory is prepared and cleaned the same way as orchestrator and start_chain. MiscPlan §4.6 already lists interview research_engine as a call site; when the interview plan adds subagent-based research, that new path must also use the wrapper (not raw runner.execute).
- **SubagentInvoker / platform invocation:** If the interview plan introduces a helper that builds a prompt and then runs the platform (e.g. for validation or research), that run should use run_with_cleanup so agent-left-behind files from interview runs are cleaned. Centralize on the single wrapper for all runner invocations from the interview flow.

**Dependencies (MiscPlan depends on Interview):** None. MiscPlan can be implemented first; interview subagent integration should then use run_with_cleanup for every runner call.

**Interview and orchestrator output:** Interview writes to `.puppet-master/interview/` and `.puppet-master/research/`; start-chain/wizard to `.puppet-master/start-chain/`; tier plans to `.puppet-master/plans/` (STATE_FILES). All are under `.puppet-master/` and thus allowlisted. When adding new output paths in the interview or orchestrator plans, keep them under `.puppet-master/` or add them to the cleanup allowlist so they are never removed (§9.1.14).

### 10.4 newfeatures.md

**Plans/newfeatures.md §13** (Bounded buffers and process isolation) requires that all subprocess output (runners, headless, stream consumers) use **bounded buffers** (fixed max size, drop oldest when full) and that the CLI always runs in a **separate process**. When implementing cleanup or any runner path, ensure we do not accumulate unbounded stdout/stderr; align with newfeatures §13 and document in AGENTS.md. **§2** (Background/async agents) defines output for background runs at `.puppet-master/agent-output/{run-id}/`; if that feature is implemented, the cleanup allowlist and optional "agent output" policy (§3.2, §5) should account for that path so background run output is preserved or cleared per policy.

### 10.5 Summary: what else needs to be done

| Plan | What to do so MiscPlan fits |
|------|-----------------------------|
| **WorktreeGitImprovement** | Implement Phase 1 (config wiring) so cleanup config is in the same run config; implement Phase 3 shared git binary resolution and use it in MiscPlan's run_git_clean_with_excludes; optionally Phase 2 (active_worktrees) for "Clean all worktrees." |
| **orchestrator-subagent-integration** | When adding subagent/iteration execution, use run_with_cleanup (MiscPlan) for every runner invocation; keep verify_tier_start/verify_tier_end at tier boundaries and prepare/cleanup at iteration boundaries. |
| **interview-subagent-integration** | When adding research or subagent runs that call the platform runner, use run_with_cleanup so interview runs get the same prepare/cleanup behavior. |

---

