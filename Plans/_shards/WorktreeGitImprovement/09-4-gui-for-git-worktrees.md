## 4. GUI for Git & Worktrees

### 4.1 Current state

**Config → Branching tab:**

- **Shown:** Base branch, Naming pattern, Granularity (single / per_phase / per_task). Git info (current branch, remote URL, user name, email) when available (from `git_info`).
- **Not shown:** Enable Git, Auto PR, Branch strategy (MainOnly/Feature/Release), "Use worktrees" (parallel), Auto merge on success, Delete branch on merge.
- **Tooltips exist but no controls:** `branching.strategy`, `branching.use_worktrees`, `branching.auto_merge_on_success`, `branching.delete_on_merge`.

**Config → Advanced / Execution:**

- **Shown:** "Enable parallel execution" toggle (bound to `gui_config.advanced.execution.enable_parallel`).
- **Not wired:** This value is never written to the config the orchestrator loads; the run uses `PuppetMasterConfig.orchestrator.enable_parallel_execution` from YAML (or default false).

**Cross-plan (MiscPlan):** Project path for Doctor and "Clean workspace now" must be resolved from the same source as the run (see Section 7.2 and MiscPlan §7.5). Option B run config built from GuiConfig at run start must include both Worktree/Git fields and (when implemented) MiscPlan cleanup/evidence fields so one Save persists all. "Clean workspace now" and "Clean all worktrees" placement and behavior are defined in MiscPlan §7.5; Worktree plan exposes worktree list for "Clean all worktrees."

**Login / Setup:**

- Git config section (user, email, remote, current branch); GitHub auth via GitHub HTTPS API (device-code flow) in Setup.

**No dedicated UI for:**

- List worktrees, recover orphaned worktrees, worktree status, or which tier is using which worktree.

### 4.2 GUI improvements

GUI ownership for worktrees is normalized around Source Control and Orchestrator.

Primary ownership:
- Source Control is the primary operational surface for worktree inventory and user actions.
- Orchestrator consumes worktree identity, ownership, blocked state, and lineage for run/history/recovery views.
- Settings > Branching and Health may expose configuration or diagnostics, but they are not the primary place to manage active worktrees.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

Required Source Control worktree behavior:
- list all active worktrees for the current repo
- show branch, path, owner run/tier, dirty/conflict/orphaned state, age, and upstream relation
- support `open`, `compare`, `recover`, `prune`, and `view lineage`
- surface explicit disabled reasons when active-run ownership or blocked state prevents a destructive action

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Required Orchestrator consumption:
- Progress, Tiers, History, and Node Graph must be able to show the worktree used by the run/attempt
- `dirty_worktree` and `worktree_conflict` MUST present recovery CTAs that route back to Source Control with the correct worktree in scope
- historical runs MUST preserve the historical worktree reference even when the live worktree has been pruned or retired

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Executor_Protocol.md

### 4.2A Stable project identity and instant-project-switch binding

The worktree and git model must bind to stable project identity rather than raw path-only shell semantics.

Rules:
- project switching uses stable `project_id` even when a project path moves, is rebound, or is reopened through worktree-aware flows
- background worktree activity from a non-active project remains visible after the user switches projects
- project switch restore cannot collapse multiple workspace tabs onto one path-only identity
- any worktree/rebind flow that changes path representation must update the project identity mapping used by shell restore, browser restore, and terminal/dev-session restore logic

#### 4.2.1 Wire existing settings to run config (see Section 5)

- Ensure "Enable parallel execution" and any other execution/orchestrator flags edited in the GUI are persisted into the config that `ConfigManager` loads (or that the run receives a config built from GuiConfig). This is a prerequisite for worktrees and Git behavior to be controllable from the UI.

#### 4.2.2 Branching tab: add missing controls

**DRY REQUIREMENT -- Widget Reuse:** Before writing ANY UI code, check `docs/gui-widget-catalog.md` and use existing widgets (`toggler`, `styled_button`, `selectable_label`, `themed_panel`, `help_tooltip`). DO NOT create new widgets unless absolutely necessary. Tag any new reusable widgets with `// DRY:WIDGET:<name>` and run `scripts/generate-widget-catalog.sh` after changes.

- **Enable Git:** Toggle bound to `orchestrator.enable_git` (or equivalent in the canonical config). **Use existing `toggler` widget** -- DO NOT create a new toggle. Tooltip: e.g. "Enable git branch creation, commits, and PR creation during runs." **Use existing `help_tooltip` widget**.
- **Auto PR:** Toggle bound to `branching.auto_pr`. **Use existing `toggler` widget**. Tooltip: "Create a pull request automatically when a tier completes; if off, worktree is merged to base branch without PR." **Use existing `help_tooltip` widget**.
- **Branch strategy:** **Use Iced `pick_list`** (same pattern as in `views/config.rs` for platform/model). Values: Main only / Feature (or Tier) / Release. Bound to config `branching.strategy` (or equivalent). Use existing tooltip `branching.strategy`.
- **Use worktrees (parallel):** Per FinalGUISpec §7.4, Branching tab can show both **Use worktrees** toggle and **Parallel execution** toggle; both must be wired (see Section 5). Add note: "Parallel subtasks use separate git worktrees." **Use existing `selectable_label`** for the note.
- **Auto merge on success / Delete on merge:** Add toggles if the product wants them; wire to config and implement behavior in orchestrator/worktree cleanup. **Use existing `toggler` widgets**. Use existing tooltips.

#### 4.2.3 Branching tab: fix or remove unused fields

- **Naming pattern:** Either wire to branch name generation (document format) or mark as "Reserved for future use" and hide/disable until implemented.
- **Granularity:** Use existing **`radio`** (as in config.rs tab_branching) or **`pick_list`** if switching to dropdown; see gui-widget-catalog and config.rs. Clarify semantics vs actual behavior: today the orchestrator creates branches per tier based on BranchStrategy, not per phase/task granularity. Either map granularity to strategy/branch creation policy and document, or align UI label with actual behavior (e.g. "Branch per tier (phase/task/subtask)"). FinalGUISpec §7.4 allows "per_phase / per_task / per_subtask"; include per_subtask if exposing granularity.

#### 4.2.4 Worktree visibility (optional)

- **Location:** **Health tab** (Settings → Health) per FinalGUISpec §7.4. Worktree list and "Recover orphaned worktrees" are implemented in Health; Worktree plan owns behavior and data (`list_worktrees`, `recover_orphaned_worktrees`).
- **Features:**
  - **Worktree list:** Columns **path, branch, status, age** (per FinalGUISpec). Use a **scrollable column of rows**; each row: **`selectable_label`** or **`selectable_label_mono`** for path/branch/age, **`status_badge`** or **`status_dot`** for status (active/stale/orphaned). No new table widget; reuse scrollable + rows + selectable_label + status_badge (see ledger/doctor list patterns).
  - **Worktree status indicators:** active / stale / orphaned (per FinalGUISpec).
  - **"Recover orphaned worktrees" button:** **`styled_button`**; calls `worktree_manager.recover_orphaned_worktrees()`; show result via **`toast_overlay`**.
- **Scope:** Best-effort; only when project path is known and is a git repo. Expose worktree list for use by MiscPlan "Clean all worktrees" (button/placement and copy are in MiscPlan §7.5).

#### 4.2.5 Git info context

- **Gap:** Git info (**user, email, remote, branch** -- per FinalGUISpec §7.4) is loaded for the Config page; ensure it is resolved for the **active project** (current project or config path), not only CWD, so it matches what the run will use.

### 4.3 Tooltip cleanup

- Remove or repurpose tooltips for controls that don't exist (e.g. use_worktrees, auto_merge_on_success, delete_on_merge) once the corresponding controls are added or the product decision is to not support them.

---

