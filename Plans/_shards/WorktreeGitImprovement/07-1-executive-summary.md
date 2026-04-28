## 1. Executive Summary

### Goals

- **Worktrees:** Reliable creation/merge/cleanup; correct base branch; recovery and visibility; no unwired or duplicate logic.
- **Git:** Single source of truth for branch naming; config-driven strategy; consistent binary resolution; commit format and logging aligned with docs.
- **GUI:** All Git/worktree-relevant settings visible, wired to the config the orchestrator uses, and consistent with tooltips and docs.

### Critical Blocker

The orchestrator reads **PuppetMasterConfig** from `ConfigManager::discover()` (YAML). The Config page edits **GuiConfig** and saves it to the same path (e.g. `puppet-master.yaml`). The two shapes differ; **enable_parallel** and other advanced/orchestrator fields in the GUI are never seen by the run. **Until config wiring is fixed**, worktrees and Git behavior cannot be fully controlled from the UI. For a consolidated list of unwired features and GUI gaps across plans, see **MiscPlan §9.1.18**.

### GUI updates needed

**Yes.** All Git/worktree-relevant settings must be visible and wired. Required: Branching tab (Enable Git, Auto PR, Branch strategy, optional Use worktrees/Parallel note); optional worktree list and "Recover orphaned worktrees" (placement: **Health** tab per FinalGUISpec); Git info for **active project**; tooltip cleanup. See [Section 4](#4-gui-for-git--worktrees) and Phase 4 checklist. Align with FinalGUISpec §7.4 (Branching and Health) and MiscPlan §7.5 (project path, Option B, cleanup ownership).

### Readiness for implementation

The plan is **ready to implement** with the following in mind:

- **Section 7** (Gaps, Risks, and Implementation Notes) adds the missing detail: config schema mismatch (including granularity enum vs string), how Doctor gets project path, backend run not using current project, conflict-worktree persistence, exact binary-resolution functions, repopulation behavior, granularity vs BranchStrategy, integration test setup, worktree Doctor check scope, and risks (config migration, save timing).
- **Phase 1 (config wiring)** must be implemented first (Option B: build run config from GUI at run start); the rest of the checklist can proceed in order. Section 7.1 and 7.10 describe mapping and save timing for Option B.
- **Optional items** (e.g. worktree list/recover UI, "nothing to commit" handling, re-validate worktree path) can be skipped for an initial release and done later.

---

