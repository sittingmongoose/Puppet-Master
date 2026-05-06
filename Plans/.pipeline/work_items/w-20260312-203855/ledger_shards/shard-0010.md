
## Settings / Provider / Persona / Account Impacts

- `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`
  - likely issue: requested/effective platform/model/persona are modeled, but requested/effective account identity and fallback reason are missing.

- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - likely issue: tier-boundary and single-Overseer audit rules are too rigid for package/seam overseers and automation-first execution.

- `Plans/Multi-Account.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md`
  - likely issue: multi-account behavior exists in slices, but active/effective account switching is not carried through repo/project/worktree execution contracts.

- `Plans/newtools.md`, `Plans/assistant-chat-design.md`
  - likely issue: provider/model controls remain per-thread or per-run and do not expose requested/effective execution identity across package, seam, node, and delegated subagent layers.

## Worktree / SCM / Parallelism Impacts

- `Plans/WorktreeGitImprovement.md`
  - likely issue: worktree ownership is still tier/subtask-native and does not support package-based lane pools or contamination quarantine.

- `Plans/GitHub_Integration.md`
  - likely issue: Source Control ownership and GitHub actions remain branch/worktree-centric, without package/seam/lane-aware visibility.

- `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/MiscPlan.md`
  - likely issue: completion, cleanup, concurrency, and queueing are still framed around tiers, runs, and threads instead of package lanes and promotion boundaries.

- `Plans/assistant-chat-design.md`
  - likely issue: execution ordering is thread FIFO with small queues, which misfits package-lane parallelism and multi-project concurrent orchestration.

## Cleanup Priorities

- priority 1
  - docs that cannot safely coexist with the new model
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/Contracts_V0.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/plan_graph.schema.json`
  - `Plans/project_plan_node.schema.json`

- priority 2
  - docs that are misleading but not immediately blocking
  - `Plans/FinalGUISpec.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/GitHub_Integration.md`
  - `Plans/Widget_System.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/newtools.md`
  - `Plans/assistant-chat-design.md`

- priority 3
  - docs that mostly need terminology / projection cleanup
  - `Plans/00-plans-index.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/feature-list.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/usage-feature.md`
  - `Plans/auto_decisions.schema.json`

## Contradictions To Resolve

- contradiction
  - docs involved: `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`
  - why it matters: canonical persona field names already disagree before account identity is added.

- contradiction
  - docs involved: `Plans/Contracts_V0.md`, `Plans/human-in-the-loop.md`
  - why it matters: blocked action IDs cannot be wired safely while both `allowed_actions[]` and `allowed_action_ids[]` remain canonical.

- contradiction
  - docs involved: `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, `Plans/Run_Graph_View.md`
  - why it matters: scheduler truth is split between lexicographic, scored, and UI-derived recovery models.

- contradiction
  - docs involved: `Plans/human-in-the-loop.md`, `Plans/Project_Output_Artifacts.md`
  - why it matters: one doc says HITL is tier-boundary only while another allows mid-tier approval nodes.

- contradiction
  - docs involved: `Plans/WorktreeGitImprovement.md`, `Plans/GitHub_Integration.md`, `Plans/feature-list.md`
  - why it matters: current SCM ownership is tier- and branch-based, which collides with package-lane worktree pools.

- contradiction
  - docs involved: `Plans/Containers_Registry_and_Unraid.md`
  - why it matters: `needs_review` and blocked/failure payload semantics disagree inside the same doc, which will leak into automation-first operator flows.

- contradiction
  - docs involved: `Plans/sharding_config.json`, `Plans/auto_decisions.jsonl`
  - why it matters: fallback chunk-line settings disagree, showing state/decision drift even in supporting planning machinery.

## Suggested Research Follow-Ups

- follow-up question
  - why it matters: define one canonical field envelope for `{project, run, seam, package, node, attempt, lane, promotion, review, resolution_thread}` so schemas stop drifting independently.

- follow-up question
  - why it matters: choose whether tier terms become pure derived UI aliases or are fully deprecated in orchestration/runtime contracts.

- follow-up question
  - why it matters: decide how package overseer and seam overseer divide authority across scheduling, review, promotion, remediation, and graph patch requests.

- follow-up question
  - why it matters: formalize requested vs effective execution identity, including account fallback/switching, before more provider/chat/SCM docs extend the wrong model.

- follow-up question
  - why it matters: define package-based lane-pool worktree policy end-to-end, including contamination, safe-point, restore, and visibility rules shared by Orchestrator and Source Control.

- follow-up question
  - why it matters: unify blocked/recovery action families so UI, runtime, and chat-thread resolution all point to the same canonical actions.

## Research Progress - 2026-03-16 - Source Control / Worktree Handshake

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/FinalGUISpec.md`
- `Plans/MiscPlan.md`
- `Plans/storage-plan.md`
- `Plans/Run_Graph_View.md`

### Key findings
- Existing docs already establish a strong surface split:
  - `Source Control` is the primary operational surface for worktree inventory and user actions.
  - `Orchestrator` consumes worktree identity, ownership, blocked state, and lineage for run/history/recovery views.
  - `Settings > Branching` and `Settings > Health` expose config/diagnostics, not primary active-worktree management.
- Existing docs are still too runtime-worktree-centric for the rewrite:
  - ownership is still described as run/tier/subtask worktree ownership
  - Source Control rows expose `owner run/tier when present`
  - Orchestrator still references `Tiers` and per-tier worktree ownership
  - this collides with the newer package-based lane-pool model
- Storage direction is already close to what the rewrite needs:
  - `orchestrator.receipt.{run_id}.{attempt_id}` already carries `repo_id`, `worktree_id`, branch, commit-range, workflow refs, etc.
  - `source_control.project_state.{project_id}` already has `selected_worktree_id?`
  - `Run_Graph_View` already requires historical SCM/worktree lineage to remain visible when live targets no longer exist
- Cleanup semantics are split across docs but not yet normalized:
  - Worktree plan cleanup = removing worktree directories after merge/completion
  - MiscPlan cleanup = cleaning files inside a workspace/worktree
  - this distinction exists, but the UI/state model does not yet clearly separate lane lifecycle from cleanup actions

### Emerging boundary model
- Recommended boundary:
  - `Orchestrator` owns package lane-pool operational truth for the active run:
    - which package owns which lane pool
    - which lane is baseline vs active vs suspect/restoring vs historical/retired
    - why a lane is blocked, weakly integrated, or cleanup-eligible
    - which action is allowed from runtime/governance state
  - `Source Control` owns repo/worktree execution and inspection operations:
    - open
    - compare
    - diff/history/graph
    - recover
    - archive/prune/remove when policy permits
    - explicit disabled reasons for destructive actions
- Practical interpretation:
  - Orchestrator should be the stronger lane/worktree operations overview.
  - Source Control should be the narrower but deeper Git/worktree inventory and manipulation surface.
  - Orchestrator CTAs should route into Source Control for Git-native operations with exact project/run/package/lane/worktree context preserved.

### Candidate object model shift
- Existing doc wording implies `worktree` is the primary user-visible object.
- Rewrite direction implies a new object stack:
  - `Feature Seam`
  - `Work Package`
  - `Lane`
  - `Worktree`
- Recommended modeling rule:
  - `Lane` becomes the primary operational object in Orchestrator.
  - `Worktree` remains the concrete filesystem/Git backing for a lane instance.
  - a lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed.
  - Source Control can still list worktrees directly, but should also expose lane/package ownership and lifecycle state when known.

### Lifecycle state direction
- Current docs have action verbs like `recover`, `prune`, `remove`, and `Clean all worktrees`, but not a strong shared lane lifecycle.
- Recommended lane/worktree lifecycle vocabulary:
  - `baseline`
  - `active`
  - `suspect`
  - `restoring`
  - `retained`
  - `cleanup_eligible`
  - `archived`
  - `removed`
  - `historical`
- Working interpretation:
  - `historical` is record truth and can coexist with `archived` or `removed`
  - `archived` means lane/worktree metadata and lineage stay visible, but the live execution surface is no longer active
  - `removed` means the live worktree directory is gone
  - `cleanup_eligible` is a policy/queue state, not the same thing as already removed
  - `suspect` and `restoring` are operational states visible in Orchestrator first and in Source Control second

### CTA / action boundary
- Recommended no-ambiguity rule:
  - Orchestrator may initiate scoped actions on a lane/worktree from run context.

## Research Progress - 2026-03-16 - Opus Identity / Runtime Batch

### Targeted docs read
- `Plans/Multi-Account.md`
