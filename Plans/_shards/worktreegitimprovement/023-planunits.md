# Shard 023: PlanUnits

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L803-L4784

Source SHA256: `f39b33e38b644f3f0195f8707f327ef505ba574c0765d4d499b27173f011a367`

---

## PlanUnits

### W-002 - Worktree Git Plan Authority

```yaml
plan_unit_id: W-002
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Plans/WorktreeGitImprovement.md owns worktree and Git owner-section requirements, plan-only implementation status, rewrite alignment, SSOT compliance, and the source-control/worktree/lane coverage blocker headings for this plan.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- W-002 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: owner_doc_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0012
preserved_exact_tokens:
- Worktree & Git Improvement -- Implementation Plan
- Canonical owner-section requirements
- PLAN DOCUMENT ONLY
- implementation-ready
- patch/apply/verify/rollback pipeline
- SSOT references (DRY)
- Spec_Lock.json
- DRY_Rules.md
- Glossary.md
- Decision_Policy.md
- Progression_Gates.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/DRY_Rules.md
- Plans/Glossary.md
- Plans/Decision_Policy.md
- Plans/Progression_Gates.md
```

### W-003 - Summary Goals Config Blocker And GUI Copy

```yaml
plan_unit_id: W-003
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree/Git goals require reliable worktrees, branch naming SSOT, wired GUI settings, Phase 1 Option B config wiring first, and Expert/ELI5 copy selected through app-level Interaction Mode rather than chat-level Chat ELI5.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-003 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: implementation_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0018
preserved_exact_tokens:
- Worktrees
- Git
- GUI
- enable_parallel
- GuiConfig
- PuppetMasterConfig
- Option B
- Interaction Mode (Expert/ELI5)
- Chat ELI5
- FinalGUISpec §7.4.0
- MiscPlan §9.1.18
negative_constraints:
- Do not couple app-level Interaction Mode Expert/ELI5 copy to chat-level Chat ELI5.
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/MiscPlan.md
```

### W-004 - Worktree Path Guard Rules

```yaml
plan_unit_id: W-004
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree-relative paths must be realpath-normalized, fail closed on resolution failure, validated against canonical roots, and use no-follow traversal by default unless an explicit Follow symlinks setting revalidates the resolved target.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-004 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: path_safety_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0021
preserved_exact_tokens:
- realpath()
- starts_with(project_root)
- starts_with(cache_root)
- --no-follow
- no-follow
- Follow symlinks
- working_directory
- FileSafe `check_file_write`
negative_constraints:
- If realpath() fails on a worktree-relative path, the operation MUST be denied.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Architecture_Invariants.md
```

### W-005 - Assistant Worktree Command Ownership

```yaml
plan_unit_id: W-005
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Chat worktree create/remove delegates to WorktreeManager; worktree creation/removal is user or system infrastructure rather than agent-tool-gated raw bash, and git-aware tools auto-scope to the worktree through process cwd.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-004
unblocks: []
acceptance_criteria:
- W-005 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: command_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0022
preserved_exact_tokens:
- cmd.chat.worktree.create
- cmd.chat.worktree.remove
- WorktreeManager
- raw `bash`
- git worktree add
- git status
- cwd
negative_constraints:
- Agents do not run raw bash git worktree add or removal commands for this contract.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
```

### W-006 - Source Control Compare And Row UX

```yaml
plan_unit_id: W-006
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Assistant/worktree row compare actions open committed branch-to-branch review through cmd.git.open_diff with compare_origin set to the base branch ref, and orch-owned worktree rows show Open Lane rather than Open Thread.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-005
unblocks: []
acceptance_criteria:
- W-006 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_ui_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0022
preserved_exact_tokens:
- Compare buttons
- cmd.git.open_diff
- compare_origin
- Open Lane
- Open Thread
- Source Control rows
- orch-owned worktrees
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-007 - Worktree Branch Creation Policy

```yaml
plan_unit_id: W-007
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree creation uses the configured base branch or explicit ref and handles existing branches by verifying refs and reusing safe existing branches without unsafe deletion.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-011
unblocks: []
acceptance_criteria:
- W-007 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_creation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0027
preserved_exact_tokens:
- config.branching.base_branch
- git worktree add -b
- git worktree add <path> <branch>
- git rev-parse --verify refs/heads/{branch}
- 'fatal: A branch named'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-008 - Restart Rehydration And PR Head Recovery

```yaml
plan_unit_id: W-008
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: After restart, worktree resolution and PR head branch resolution recover from durable or listed worktrees instead of falling back to the main repo path or main repo branch.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-008 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: restart_rehydration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0037
preserved_exact_tokens:
- active_worktrees
- get_node_worktree(node_id)
- worktree_manager.list_worktrees()
- worktree_manager.get_worktree_path(node_id)
- create_node_pr
- head_branch
- main repo branch
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-009 - Conflict Worktree Preservation

```yaml
plan_unit_id: W-009
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Merge-conflict worktrees must not be silently removed or overwritten on rerun; reuse remains blocked until resolution or explicit discard preserves user-visible conflict state.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-008
unblocks: []
acceptance_criteria:
- W-009 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0025
preserved_exact_tokens:
- cleanup_subtask_worktree
- active_worktrees
- create_subtask_worktree
- create_worktree
- merge conflict
- conflicting worktree
negative_constraints:
- Do not destroy conflict state on rerun by silently removing an existing conflicting worktree.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-010 - Conflict Worktree User Affordance

```yaml
plan_unit_id: W-010
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Conflict state may surface the worktree path or status and a Resolve worktree conflicts action for user repair or confirmed removal.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-009
unblocks: []
acceptance_criteria:
- W-010 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_ui_affordance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0025
preserved_exact_tokens:
- toast
- status
- Resolve worktree conflicts
- open in editor
- remove after confirmation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
```

### W-011 - Node And Branch Sanitization

```yaml
plan_unit_id: W-011
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Node IDs used as path components and branch IDs used as Git refs must be sanitized with shared/ref-safe helpers before join or branch creation.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-004
unblocks: []
acceptance_criteria:
- W-011 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: identity_sanitization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0026
preserved_exact_tokens:
- node_id
- worktree_base.join(node_id)
- subtask_id.replace
- ..
- path separators
- BranchStrategyManager::sanitize_id
- invalid ref characters
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-012 - Detached Head And Merge Target Validation

```yaml
plan_unit_id: W-012
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Detached worktrees and missing merge target branches must be detected and handled with clear skip, create, or error behavior rather than empty-branch merges or blind checkout failure.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-007
unblocks: []
acceptance_criteria:
- W-012 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: merge_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0028
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0038
preserved_exact_tokens:
- Detached HEAD
- branch refs/heads
- git merge ""
- source_branch is empty
- target_branch
- git checkout target_branch
- base branch is missing
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-013 - Lane Worktree Lifecycle Handshake

```yaml
plan_unit_id: W-013
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Lanes own worktrees through explicit Source Control allocation, Orchestrator records the handshake, and canonical lane/worktree records drive reuse, cleanup, retry, and recovery.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-013 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lane_worktree_handshake
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0033
preserved_exact_tokens:
- lane_id
- run_id
- worktree_id
- lifecycle state
- blocked/recovery state
- Source Control MUST confirm allocation
- Orchestrator records the handshake
- canonical lane/worktree records
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale worktrees allocated but not reclaimed are eligible for cleanup via storage housekeeping.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
```

### W-014 - Worktree Row Ownership Presentation

```yaml
plan_unit_id: W-014
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree rows show owning package, lane, run, lifecycle, and blocked/recovery state while Source Control actions report results back through canonical lane/worktree records.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-014 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: row_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0033
preserved_exact_tokens:
- owning package reference
- lane
- run
- lifecycle state
- blocked/recovery state
- worktree rows
- Source Control actions
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
```

### W-015 - Allocation Strategy And Cleanup Lineage

```yaml
plan_unit_id: W-015
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree allocation follows lane/effective-scope provider policy; contamination, dirty state, conflict state, blocked recovery, or lineage mismatch disqualifies reuse, and cleanup waits for grace-period and file-lock checks.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-015 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: allocation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0034
preserved_exact_tokens:
- delegated subagent
- overseer
- node
- work package
- seam
- run
- contamination
- dirty-state
- conflict-state
- grace_period_ms
- worktree.deleted
- worktree.created
negative_constraints:
- worktree.deleted may be emitted only after the grace-period and file-lock checks pass.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-016 - Runtime Lineage And Legacy State Migration

```yaml
plan_unit_id: W-016
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree transfer, restore, retry, and fresh-attempt payloads carry explicit SCM targeting and never silently inherit prior ownership; legacy git_panel/* state is one-time migration input only.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
- W-015
unblocks: []
acceptance_criteria:
- W-016 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: runtime_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0035
preserved_exact_tokens:
- runtime lineage event
- cmd.runtime.restore_safe_point_then_retry
- repo_id
- worktree_id
- baseline_target
- safe_point
- historical_commit
- worktree_head
- /fresh-attempt
- git_panel/*
- source_control.project_state.{project_id}
negative_constraints:
- Manual prune/remove stays forbidden while the worktree is active or blocked_preserved unless the explicit override policy permits it and records the override.
- No new build writes both legacy and canonical keys.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy git_panel/* and git_panel state is one-time migration input into source_control.project_state.{project_id} only.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### W-017 - Worktree Identity And Remote Context

```yaml
plan_unit_id: W-017
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control owns live SCM truth with stable project_id/repo_id/worktree_id; remote or SSH and historical worktrees keep correct live, historical, or compare contexts with deterministic labels.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-017 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: identity_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- project_id/repo_id/worktree_id
- repo_id
- worktree_id
- worktree_path
- /recovered
- /SSH
- historical_snapshot
- live_state
- compare_historical_to_live
- compare_target
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Health is a read-only diagnostic and validation mirror unless a repair utility deep-links back into Source Control.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
```

### W-018 - Multi Active SCM Status Strip

```yaml
plan_unit_id: W-018
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Orchestrator and Progress surfaces consume a first-class SCM status strip with primary and additional active contexts, lifecycle states, blocked episode CTAs, and exact deep-link payload fields.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
unblocks: []
acceptance_criteria:
- W-018 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: scm_status_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- primary_active_context
- additional_active_context_count
- +N parallel contexts
- Progress > Current Task
- Progress > Orchestrator Status
- worktree_id/path
- owner_tier_id
- blocked_preserved
- safe-point-preserved
- requires_safe_point_restore
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Compatibility worktree_id/path and owner_tier_id may appear only as compatibility fields over canonical IDs.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
```

### W-019 - Copy Reason Families And Receipt Lineage

```yaml
plan_unit_id: W-019
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: User-facing action nouns, receipt nouns, worktree glossary terms, blocked reason-family templates, and SCM receipt lineage remain distinct and typed across Source Control, Orchestrator, GitHub Actions, Docker, Kubernetes, and history views.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-018
unblocks: []
acceptance_criteria:
- W-019 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: copy_and_receipt_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- Rebind
- Start fresh
- retry
- resume
- recover
- restore
- Receipt
- History
- Evidence
- Log
- Ledger
- reason-family
- dirty_worktree
- worktree_conflict
- SCM `/receipt` lineage
negative_constraints:
- Rebind, Start fresh, retry, resume, recover, and restore are not interchangeable.
- A receipt row must not become generic History or Evidence by loose copy drift.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Glossary.md
- Plans/Runtime_Artifacts_Panel.md
```

### W-020 - Worktree Docs Doctor And Optional Path Revalidation

```yaml
plan_unit_id: W-020
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree state files are documented, Doctor adds worktree checks and orphan detection, and optional path/list revalidation can remove stale active_worktrees before use.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-020 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: diagnostic_docs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0040
preserved_exact_tokens:
- STATE_FILES.md
- .puppet-master/worktrees
- Doctor
- git worktree list
- detect_orphaned_worktrees()
- active_worktrees
- IterationContext
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-021 - Git Exit Classification And Retry Policy

```yaml
plan_unit_id: W-021
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git exit scenarios map to success, informational, retryable, or fatal outcomes, with bounded retry only for network timeout and lock contention cases allowed by the table.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-021 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_exit_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0043
preserved_exact_tokens:
- Exit 0
- Exit 1 with `nothing to commit`
- Exit 128
- index.lock
- retry once after 500ms backoff
- exponential backoff
- skip-silently-never
negative_constraints:
- Fatal scenarios MUST NOT be retried or skipped (skip-silently-never).
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
- Plans/Architecture_Invariants.md
```

### W-022 - Git Mutation Hard Error Verification

```yaml
plan_unit_id: W-022
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Mutating or validation-sensitive git commands treat non-zero as hard error except nothing to commit, and verify staged state after git add before accepting commit-sensitive transitions.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-022 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: commit_sensitive_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0043
preserved_exact_tokens:
- /commit-sensitive
- git status --porcelain
- git add
- git commit
- git stash
- git checkout
- FileSafe.md#11.1.2a
- nothing to commit
negative_constraints:
- Do not silently swallow non-zero exits from git add, git commit, git stash, git checkout, or equivalent mutation-sensitive commands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- After git add, run a post-add git status --porcelain verification before accepting any commit-sensitive staged-state transition.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
```

### W-023 - Shared Git Binary Resolution

```yaml
plan_unit_id: W-023
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: GitManager and Doctor resolve git through the same helper instead of allowing PATH-only runtime behavior to diverge from Doctor fallback resolution.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-023 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: binary_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0044
preserved_exact_tokens:
- GitManager::run_git_cmd
- Command::new("git")
- GitInstalledCheck
- find_tool_executable("git")
- path_utils
- git_resolver
- 'GitManager::new(repo_path, git_binary: Option<PathBuf>)'
- resolve_git_executable()
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-024 - GitHub PR API Only

```yaml
plan_unit_id: W-024
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: PR creation uses the GitHub HTTPS API and Doctor validates API auth state and required scopes; runtime PR creation must not shell out to a GitHub CLI.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-024 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: github_api_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0045
preserved_exact_tokens:
- GitHub PR creation (API-only; no GitHub CLI)
- GitHub CLI subprocess
- GitHub HTTPS API
- GitHub_API_Auth_and_Flows.md
- OAuth device-code token
- OS credential store
negative_constraints:
- Runtime PR creation must not shell out to a GitHub CLI.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy GitHub CLI subprocess paths are compatibility-only and not canonical.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/GitHub_API_Auth_and_Flows.md
```

### W-025 - Git Config And Repo Project Context

```yaml
plan_unit_id: W-025
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git configured and repo checks consider project-local context, passing when usable global or local identity exists and running repo checks in the active project path when known.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-025 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_project_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0053
preserved_exact_tokens:
- GitConfiguredCheck
- git config --global user.name
- git config user.name
- git config user.email
- GitRepoCheck
- resolve_git_init_dir()
- git rev-parse --git-dir
- project directory
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-026 - Branch Strategy And Naming SSOT

```yaml
plan_unit_id: W-026
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Orchestrator reads branch strategy from config and uses one branch naming implementation rather than duplicating BranchStrategyManager logic.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-007
unblocks: []
acceptance_criteria:
- W-026 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: branch_naming_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0048
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0049
preserved_exact_tokens:
- BranchStrategy::Feature
- GitConfig
- branch_strategy
- BranchingConfig
- create_node_branch
- BranchStrategyManager::generate_branch_name
- it-
- tk-
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-027 - Naming Pattern GUI Policy

```yaml
plan_unit_id: W-027
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: The GUI-exposed naming_pattern must either be wired into branch generation with documented placeholders or kept hidden/inert until branch-generation support lands.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-026
unblocks: []
acceptance_criteria:
- W-027 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_ui_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0050
preserved_exact_tokens:
- naming_pattern
- GUI
- '{node}'
- '{id}'
- ph-
- tk-
- st-
- release
negative_constraints:
- Do not keep an exposed GUI naming_pattern field that runtime branch logic ignores without documented behavior.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
```

### W-028 - Commit Message Formatting

```yaml
plan_unit_id: W-028
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: 'Iteration commits use CommitFormatter or equivalent formatting so they match the documented pm: convention.'
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-026
unblocks: []
acceptance_criteria:
- W-028 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: commit_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0051
preserved_exact_tokens:
- commit_node_progress
- 'format!("node: {} iteration {} complete"'
- AGENTS.md
- CommitFormatter
- CommitFormatter::format_iteration_commit
- 'pm: [ITERATION]'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- AGENTS.md
```

### W-029 - Git Actions Log Path

```yaml
plan_unit_id: W-029
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git action logging path and ignore/documentation policy must be made consistent between runtime behavior and REQUIREMENTS.md.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-029 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: runtime_log_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0052
preserved_exact_tokens:
- .puppet-master
- git-actions.log
- .puppet-master/logs/git-actions.log
- REQUIREMENTS.md
- .gitignore
- runtime-only
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-030 - Empty Commit Handling

```yaml
plan_unit_id: W-030
unit_type: optional_requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: The nothing to commit case may be detected and logged as informational without masking real git command failures.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-030 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: optional_git_noise_reduction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0054
preserved_exact_tokens:
- Empty commit handling
- nothing to commit
- debug/info
- real errors
negative_constraints:
- Do not reduce noise by treating genuine git command failure as informational.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-031 - Source Control GUI Owner Surface

```yaml
plan_unit_id: W-031
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control remains the Git/worktree owner surface, GUI handoff stays worktree-first, and cross-references use Plans/Orchestrator_Page.md#Source Control boundary rather than stale numbered anchors.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
- W-014
unblocks: []
acceptance_criteria:
- W-031 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_owner_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0056
preserved_exact_tokens:
- Source Control
- Git/worktree owner surface
- worktree-first
- Plans/Orchestrator_Page.md#Source Control boundary
- stale numbered anchor
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Cross-references now point at Plans/Orchestrator_Page.md#Source Control boundary rather than the stale numbered anchor.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
```

### W-032 - Worktree Topology View

```yaml
plan_unit_id: W-032
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control > Worktrees presents first-class worktree topology, filters, graph badge, command-backed events, disabled reasons, and stale-group defaults.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-031
unblocks: []
acceptance_criteria:
- W-032 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_topology_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0057
preserved_exact_tokens:
- Worktree topology view
- Source Control > Worktrees
- Source Control > Graph
- hide-stale
- ownership display mode
- cmd.git.worktree.list/select/open/compare/prune/recover
- disabled reason
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Worktree topology view replaces hidden plumbing with first-class Source Control topology.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
```

### W-033 - Safe Worktree Actions And Recovery Rows

```yaml
plan_unit_id: W-033
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree action menus and blocked cards enforce lineage-safe prune/remove/reuse/recover with disabled explanations and exact recovery targeting.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-016
- W-032
unblocks: []
acceptance_criteria:
- W-033 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: safe_action_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0057
preserved_exact_tokens:
- Safe worktree actions
- Worktree safety / ownership
- locked
- prunable
- dirty
- repairable
- show-unsafe-actions
- dirty_worktree
- worktree_conflict
- blocked by policy
- blocked by unresolved lineage
negative_constraints:
- Unsafe actions remain disabled with explanation rather than hidden when lineage says they are not allowed.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
```

### W-034 - Source Control Graph And AI Commit Batching

```yaml
plan_unit_id: W-034
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control graph parity and AI commit batching are GUI task modes with advisory-only batching, project-scoped aliases/state, and dense owner-surface baselines.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-031
unblocks: []
acceptance_criteria:
- W-034 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_graph_batching
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- History / graph / worktree parity
- Branch/worktree lineage graph
- Source Control > Graph
- cmd.source_control.graph.focus/filter/layout
- cmd.source_control.graph_focus
- cmd.source_control.graph_filter
- AI commit batching
- cmd.source_control.suggest_commit_batches
- JetBrains Git log
- GitLens
- /GitKraken
negative_constraints:
- AI commit batching is advisory, reviewable, and never automatic.
preserved_contractrefs: []
compatibility_only_notes:
- cmd.source_control.graph_focus and cmd.source_control.graph_filter compatibility aliases resolve to catalog-owned graph focus/filter/layout commands.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-035 - Review Mode And Compare Diff Identity

```yaml
plan_unit_id: W-035
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Review mode owns worktree/base/PR/range comparisons, compare settings, stale-target fallback, and reusable hunk-level diff identity across chat, file surfaces, and Source Control.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-031
unblocks: []
acceptance_criteria:
- W-035 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: review_compare_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- Review mode
- Open Review Mode
- Source Control > History
- Worktrees
- cmd.source_control.review.open/swap/filter
- cmd.source_control.open_review
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- stale-target
- stage
- unstage
- discard
- apply
- Search-within-diff
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.source_control.review.open/swap/filter compatibility aliases resolve to catalog-owned review commands.
stale_retired_dispositions:
- When compare target is gone, pruned, or stale-target, open nearest valid baseline when one exists and explain the downgrade.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
```

### W-036 - Conflict Assistant

```yaml
plan_unit_id: W-036
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Conflict assistant provides guided merge, rebase/worktree, and worktree-conflict repair through Source Control while preserving explicit approval and separate resolution records.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-009
- W-010
- W-033
unblocks: []
acceptance_criteria:
- W-036 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_assistant_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- Conflict assistant
- Source Control > Changes
- Open Conflict Assistant
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
- auto-open
- structured merge view
negative_constraints:
- Conflict assistant must not silently resolve semantic conflicts or auto-write a side selection without explicit approval.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-037 - Config Wiring Option B

```yaml
plan_unit_id: W-037
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Run start builds PuppetMasterConfig from the current in-memory gui_config through Option B, Save only persists next-launch YAML, fallback must not silently start default-only, and redb projection remains later storage-plan scope."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-003
unblocks: []
acceptance_criteria:
- "W-037 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_gui_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0060
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0062
preserved_exact_tokens:
- "Config Wiring (Prerequisite)"
- "GuiConfig"
- "PuppetMasterConfig"
- "active_config_path()"
- "ConfigManager::discover_with_hint(hint)"
- "YAML-only"
- "projected in redb"
- "Option B"
- "Option A"
- "Option C"
negative_constraints:
- "Option B and Phase 1 config wiring are required for the initial release."
- "Do not require Save before Run for execution-affecting GUI settings."
- "Do not silently fall back to default config if config build/discovery fails."
preserved_contractrefs: []
compatibility_only_notes:
- "redb projection is later storage-plan scope, not initial config-wiring scope."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/storage-plan.md"
```

### W-038 - Execution-Affecting Projection Completeness

```yaml
plan_unit_id: W-038
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Every GUI setting that changes runtime behavior, including interview execution-affecting settings, HITL node toggles, Git enablement, branching fields, and per-provider concurrency caps, belongs in the run-start config snapshot rather than GUI-only state."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
unblocks: []
acceptance_criteria:
- "W-038 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: run_config_snapshot_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0063
preserved_exact_tokens:
- "Execution-affecting projection completeness"
- "enable_parallel_execution"
- "enable_git"
- "branching.base_branch"
- "branching.auto_pr"
- "strategy"
- "granularity"
- "naming_pattern"
- "concurrency.global.per_provider"
- "concurrency.overrides.orchestrator.per_provider"
negative_constraints:
- "Execution-affecting GUI settings must not remain GUI-only."
- "Projection completeness is by behavior class, not ad hoc exception."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/interview-subagent-integration.md"
- "Plans/human-in-the-loop.md"
```

### W-039 - Phase Dependency Order

```yaml
plan_unit_id: W-039
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Implementation sequencing keeps Phase 1 config wiring before worktree/Git phases, Phase 3.1 git binary resolution before worktree merge checks, and Phase 5 tests after Phase 2 and Phase 3 implementation behavior exists."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-038
unblocks: []
acceptance_criteria:
- "W-039 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: phase_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0065
preserved_exact_tokens:
- "Implementation Checklist"
- "Dependency order"
- "Phase 1 before Phase 2/3"
- "Phase 3.1 before Phase 2.11"
- "Phase 5 after Phase 2/3"
negative_constraints:
- "Do not implement worktree or Git behavior before the run-start config blocker is wired."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-040 - Phase 1 Config Wiring Checklist

```yaml
plan_unit_id: W-040
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 1 wires GUI runtime settings into Dashboard run start without requiring Save, including current_project.path, Enable parallel execution, Git enablement if exposed, branch fields, and failure messaging for config build/discovery."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-038
- W-049
unblocks: []
acceptance_criteria:
- "W-040 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_wiring_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0066
preserved_exact_tokens:
- "Phase 1: Config wiring (blocker)"
- "current_project.path"
- "Dashboard Run/Start"
- "Enable parallel execution"
- "Enable Git"
- "Auto PR"
- "Save not required"
- "PuppetMasterConfig"
negative_constraints:
- "Run/Start must use the in-memory GUI config even if the user has not clicked Save."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/FinalGUISpec.md"
```

### W-041 - Phase 2 Worktree Checklist

```yaml
plan_unit_id: W-041
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 2 worktree implementation covers active_worktrees state, create/list/existence/merge behavior, conflict recording, state-file persistence, gitignore coverage, Doctor checks, and path-safety enforcement."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-004
- W-007
- W-008
- W-009
- W-011
- W-012
- W-020
- W-023
unblocks: []
acceptance_criteria:
- "W-041 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0067
preserved_exact_tokens:
- "Phase 2: Worktrees"
- "active_worktrees"
- "list_worktrees()"
- "worktree_exists"
- "merge_worktree"
- "worktree-conflicts.json"
- "STATE_FILES.md"
- "Doctor"
- "realpath"
negative_constraints:
- "Worktree operations must not bypass path-safety and existence checks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-042 - Phase 3 Git Checklist

```yaml
plan_unit_id: W-042
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 3 git implementation resolves the git binary once, performs status/commit/push/PR behavior through canonical helpers and GitHub HTTPS API, formats PM commits, and records git-actions.log entries."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
- W-025
- W-026
- W-028
- W-029
- W-030
unblocks: []
acceptance_criteria:
- "W-042 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0068
preserved_exact_tokens:
- "Phase 3: Git"
- "resolve_git_executable()"
- "GitHub HTTPS API"
- "No GitHub CLI"
- "CommitFormatter"
- "pm:"
- "git-actions.log"
- "cmd.git.status"
negative_constraints:
- "Do not shell out to GitHub CLI for PR creation in this scope."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-043 - Phase 4 GUI Checklist

```yaml
plan_unit_id: W-043
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 4 GUI work exposes Settings branch controls, Source Control panels, clean-workspace affordances, PR status/action display, conflict UI, and DRY widget reuse without creating duplicate widget implementations."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-027
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
unblocks: []
acceptance_criteria:
- "W-043 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_gui_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0069
preserved_exact_tokens:
- "Phase 4: GUI"
- "Branching tab"
- "Enable Git"
- "Auto PR"
- "Source Control page"
- "Clean workspace now"
- "DRY:WIDGET"
- "conflict UI"
negative_constraints:
- "Do not duplicate reusable Source Control widgets."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/FinalGUISpec.md"
- "Plans/Widget_System.md"
```

### W-044 - Phase 5 Testing And Acceptance

```yaml
plan_unit_id: W-044
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 5 testing and acceptance require config wiring tests, worktree lifecycle tests, Git integration tests, GUI handler tests, and acceptance criteria proving GUI settings affect runtime, worktrees are tracked, and Git/PR operations use configured policy."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-040
- W-041
- W-042
- W-043
unblocks: []
acceptance_criteria:
- "W-044 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: phase_acceptance_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0070
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0071
preserved_exact_tokens:
- "Phase 5: Testing and docs"
- "Acceptance criteria (per phase)"
- "Unit/integration tests"
- "GUI smoke tests"
- "Settings branch fields"
- "PR URL/status"
negative_constraints:
- "Phase 5 validation must not run before Phase 2 and Phase 3 behavior exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-045 - Phase Source Hints

```yaml
plan_unit_id: W-045
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Implementation source hints route Phase 2 and Phase 3 work to the listed Rust modules, state files, requirement docs, and gitignore updates without making these hints executable build tasks."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-042
unblocks: []
acceptance_criteria:
- "W-045 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: implementation_surface_hints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0072
preserved_exact_tokens:
- "File/source hints"
- "src/core/worktree_manager.rs"
- "src/core/git.rs"
- "src/core/github.rs"
- "src/core/config.rs"
- "src-tauri/src/main.rs"
- "STATE_FILES.md"
- "REQUIREMENTS.md"
- ".gitignore"
negative_constraints:
- "File/source hints are plan lineage, not executable build tasks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-046 - Required Optional Scope Matrix

```yaml
plan_unit_id: W-046
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "The required/optional checklist matrix keeps Phase 1 config wiring, Phase 2 worktrees, Phase 3 local git basics, and Phase 4 essential Source Control GUI mandatory while keeping PR automation, custom merge tools, and advanced GitHub polling optional."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-040
- W-041
- W-042
- W-043
- W-044
unblocks: []
acceptance_criteria:
- "W-046 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: required_optional_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0073
preserved_exact_tokens:
- "Required vs optional"
- "Phase 1"
- "Phase 2"
- "Phase 3"
- "Phase 4"
- "Required"
- "Optional"
- "PR creation via API"
negative_constraints:
- "Optional PR/GitHub enhancements must not block required local worktree and Git behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-047 - Config Schema Migration And Save Timing

```yaml
plan_unit_id: W-047
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Config schema migration introduces a single canonical BranchGranularity enum, migrates legacy strings, exposes push_policy and merge_policy, and discloses Save timing so GUI edits apply to current run start while persistence applies to next launch."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-053
unblocks: []
acceptance_criteria:
- "W-047 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_schema_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0084
preserved_exact_tokens:
- "Config format and schema mismatch"
- "BranchGranularity"
- "Subtask"
- "Iteration"
- "No string-based branching.granularity"
- "config.migrated"
- "push_policy"
- "merge_policy"
- "Save timing tooltip"
negative_constraints:
- "Do not keep string-based branching.granularity as canonical."
- "Do not make Save timing ambiguous for execution-affecting settings."
preserved_contractrefs: []
compatibility_only_notes:
- "Legacy strings such as per_task and per_agent map into canonical BranchGranularity values during migration."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-048 - Doctor Project Path Context

```yaml
plan_unit_id: W-048
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Doctor config checks accept an optional project path hint so the Doctor view can inspect the selected project rather than only the current process working directory."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-020
- W-025
unblocks: []
acceptance_criteria:
- "W-048 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_project_hint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0076
preserved_exact_tokens:
- "Doctor"
- "project path context"
- "run_all(hint: Option<&Path>)"
- "discover_config_path"
- "config check"
- "current_project.path"
negative_constraints:
- "Doctor must not be limited to the process cwd when the GUI has a selected project."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-049 - Dashboard Current Project Config Hint

```yaml
plan_unit_id: W-049
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Dashboard run start passes current_project.path into backend config discovery so spawn_orchestrator_backend builds run config from the selected project rather than defaulting to cwd-only discovery."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-048
- W-025
unblocks: []
acceptance_criteria:
- "W-049 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dashboard_run_config_hint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0077
preserved_exact_tokens:
- "Backend run does not use current project"
- "Dashboard"
- "spawn_orchestrator_backend"
- "ConfigManager::discover_with_hint(config_hint)"
- "current_project.path"
negative_constraints:
- "Backend run must not ignore current_project.path when a project is selected."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-050 - Conflict Worktree Persistence

```yaml
plan_unit_id: W-050
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Conflict worktree persistence may be in-memory for the initial release, while longer-lived conflict state records use worktree-conflicts.json or canonical storage without conflating conflict cleanup with normal worktree cleanup."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-009
- W-010
- W-033
unblocks: []
acceptance_criteria:
- "W-050 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_worktree_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0078
preserved_exact_tokens:
- "Merge conflicts"
- "conflict worktrees"
- "worktree-conflicts.json"
- "in-memory-only initial release"
negative_constraints:
- "Conflict worktrees must not be cleaned up as ordinary successful worktrees."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-051 - Git Binary And GitHub API Details

```yaml
plan_unit_id: W-051
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git binary resolution uses find_tool_executable(\"git\") through resolve_git_executable(), while GitHub PR creation uses HTTPS API rather than GitHub CLI."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
unblocks: []
acceptance_criteria:
- "W-051 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_binary_api_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0079
preserved_exact_tokens:
- "Binary resolution"
- "find_tool_executable(\"git\")"
- "resolve_git_executable()"
- "GitHub HTTPS API"
- "No GitHub CLI"
negative_constraints:
- "Do not duplicate git binary detection."
- "Do not require GitHub CLI for GitHub PR behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-052 - Active Worktree Repopulation

```yaml
plan_unit_id: W-052
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "active_worktrees is repopulated from listed worktree paths by extracting node identity and inserting canonical entries rather than relying on stale in-memory state."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-008
unblocks: []
acceptance_criteria:
- "W-052 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: active_worktree_repopulation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0080
preserved_exact_tokens:
- "active_worktrees repopulation"
- "extract_node_id(&path)"
- "active_worktrees.insert"
- "list_worktrees"
negative_constraints:
- "Do not rely solely on stale in-memory active_worktrees after restart."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-053 - Granularity BranchStrategy Decision

```yaml
plan_unit_id: W-053
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Branch granularity and BranchStrategy stay distinct: config.branching.granularity owns worktree/branch unit size, while MainOnly, Feature, and Release strategy controls are hidden or marked future unless implemented."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-026
- W-027
unblocks: []
acceptance_criteria:
- "W-053 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: branch_strategy_gui_decision
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0081
preserved_exact_tokens:
- "Granularity vs BranchStrategy"
- "config.branching.granularity"
- "BranchStrategy"
- "MainOnly"
- "Feature"
- "Release"
- "hide or mark future"
negative_constraints:
- "Do not expose BranchStrategy controls as active if they are not implemented."
- "Do not conflate branch strategy with branch granularity."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-054 - Git Worktree Integration Test Setup

```yaml
plan_unit_id: W-054
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree integration tests use a temporary repository with git init and one commit, and can be marked or gated as integration-git."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-042
- W-044
unblocks: []
acceptance_criteria:
- "W-054 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_integration_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0082
preserved_exact_tokens:
- "Integration test setup"
- "temp dir"
- "git init"
- "one commit"
- "integration-git"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-055 - Worktree Doctor Scope

```yaml
plan_unit_id: W-055
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree Doctor checks use git worktree list --porcelain and detect_orphaned_worktrees() to scope orphan detection to the selected repository/worktree context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-020
- W-023
- W-025
- W-048
unblocks: []
acceptance_criteria:
- "W-055 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_worktree_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0083
preserved_exact_tokens:
- "Worktree Doctor check"
- "git worktree list --porcelain"
- "detect_orphaned_worktrees()"
- "Doctor"
negative_constraints:
- "Doctor worktree checks must not infer orphaned worktrees without repository context."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-056 - Resolved Worktree Decisions

```yaml
plan_unit_id: W-056
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved worktree decisions require HashSet<node_id> active tracking, detached HEAD merge handling, recovery timing, and Windows-safe path behavior for worktree lifecycle implementation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-050
- W-052
unblocks: []
acceptance_criteria:
- "W-056 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_worktree_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "Resolved decisions (implementation-ready)"
- "WorktreeManager"
- "HashSet<node_id>"
- "detached HEAD"
- "Windows path safety"
- "recovery timing"
negative_constraints:
- "Do not treat resolved worktree decisions as open product questions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-057 - Resolved Git Decisions

```yaml
plan_unit_id: W-057
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved Git decisions require DRY:FN:resolve_git_executable, no GitHub CLI, canonical branch naming, local Git operation logging, and PM commit formatting."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
- W-026
- W-027
- W-028
- W-029
unblocks: []
acceptance_criteria:
- "W-057 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_git_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "DRY:FN:resolve_git_executable"
- "No GitHub CLI"
- ".puppet-master/logs/git-actions.log"
- "CommitFormatter"
- "pm:"
- "branch naming"
negative_constraints:
- "Do not duplicate resolve_git_executable behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-058 - Resolved Config Doctor Decisions

```yaml
plan_unit_id: W-058
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved config and Doctor decisions bind Dashboard run config to app.rs::spawn_orchestrator_backend, current_project.path, run_all(hint: Option<&Path>), and the canonical branch granularity/strategy distinction."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-049
- W-053
- W-055
unblocks: []
acceptance_criteria:
- "W-058 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_config_doctor_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "app.rs::spawn_orchestrator_backend"
- "current_project.path"
- "run_all(hint: Option<&Path>)"
- "config.branching.granularity"
- "BranchStrategy"
negative_constraints:
- "Do not treat Dashboard project hint or Doctor hint wiring as optional once config wiring is implemented."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-059 - DRY Platform Git Subagent SSOT

```yaml
plan_unit_id: W-059
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Backend DRY compliance keeps platform_specs, subagent_registry, and git binary resolution as single sources of truth, with DRY tags for functions and data rather than duplicated backend logic."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-026
unblocks: []
acceptance_criteria:
- "W-059 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dry_backend_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0086
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0088
preserved_exact_tokens:
- "DRY Method Compliance"
- "platform_specs"
- "subagent_registry"
- "DRY:DATA:subagent_registry"
- "DRY:FN:resolve_git_binary"
- "DRY:FN"
- "DRY:DATA"
negative_constraints:
- "Never duplicate git binary detection."
- "Do not duplicate platform or subagent registry data."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/DRY_Rules.md"
```

### W-060 - Widget Reuse GUI DRY Compliance

```yaml
plan_unit_id: W-060
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "GUI DRY compliance reuses cataloged widgets, shared helpers, and documented exceptions for Source Control and worktree interfaces instead of creating duplicate visual components."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-027
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
unblocks: []
acceptance_criteria:
- "W-060 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dry_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0088
preserved_exact_tokens:
- "DRY Requirements"
- "DRY and AGENTS.md conventions"
- "docs/gui-widget-catalog.md"
- "src/widgets/"
- "styled_button"
- "page_header"
- "DRY:WIDGET"
- "UI-DRY-EXCEPTION"
negative_constraints:
- "Do not create duplicate GUI widgets when a cataloged widget or helper exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Widget_System.md"
- "Plans/DRY_Rules.md"
```

### W-061 - Crew Coordination State

```yaml
plan_unit_id: W-061
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree coordination uses the reconciled PM crew model: optional overlays, child runs, explicit shared crew state, crew-board messages, and canonical seglog/redb lineage rather than ad hoc memory side files."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-015
- W-016
- W-019
unblocks: []
acceptance_criteria:
- "W-061 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: crew_coordination_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0089
preserved_exact_tokens:
- "Crews and Subagent Communication Enhancements"
- "optional overlays"
- "child runs"
- "shared crew state"
- "crew-board messages"
- ".puppet-master/memory/*"
- "active-agents.json"
- "seglog/redb projections"
negative_constraints:
- ".puppet-master/memory/* is not canonical crew coordination state."
- "active-agents.json is not canonical git/worktree coordination state."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/storage-plan.md"
- "Plans/assistant-memory-subsystem.md"
- "Plans/Contracts_V0.md"
- "Plans/Prompt_Pipeline.md"
- "Plans/FileSafe.md"
```

### W-062 - Lifecycle Quality Canon

```yaml
plan_unit_id: W-062
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree lifecycle and quality features align to child-run, crew, and blocked-state canon, preserving blocked_reason_code, ordered allowed_action_ids[], child lineage, worktree ownership, canonical event/storage structures, state reconstruction, and handoff reconstruction."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-061
- W-019
- W-033
unblocks: []
acceptance_criteria:
- "W-062 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lifecycle_quality_canon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0090
preserved_exact_tokens:
- "Lifecycle and Quality Enhancements"
- "child-run"
- "crew"
- "blocked-state canon"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "cleanup"
- "reroute"
- "retry"
- "handoff reconstruction"
negative_constraints:
- "Do not invent separate active-agent lifecycle files."
- "Quality and handoff metadata do not belong in memory-manager files."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"
- "ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/assistant-memory-subsystem.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Prompt_Pipeline.md"
```

### W-063 - Worktree Safe Points And Retry Visibility

```yaml
plan_unit_id: W-063
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree-native safe points and retry visibility record scoped filesystem/Git state, avoid destructive reset behavior, expose retry posture, and provide acceptance criteria for safe-point creation/restoration and conflict-aware retry disclosure."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-033
- W-062
unblocks: []
acceptance_criteria:
- "W-063 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_safe_point_retry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0092
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0093
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0094
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0095
preserved_exact_tokens:
- "Safe-Point and Retry Integration Addendum (2026-03-08)"
- "Worktree-native safe points"
- "Retry posture visibility"
- "no git reset --hard"
- "safe-point recovery"
- "retry posture"
negative_constraints:
- "Do not use git reset --hard as the recovery primitive for worktree safe points."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-064 - Worktree Recovery Required Rules

```yaml
plan_unit_id: W-064
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Safe point and worktree recovery alignment requires worktree-specific baselines, explicit recovery targets, and dirty/conflict blocking before mutation or recovery action proceeds."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-063
- W-012
- W-021
unblocks: []
acceptance_criteria:
- "W-064 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_recovery_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0096
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0097
preserved_exact_tokens:
- "Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)"
- "Required rules"
- "worktree-specific baseline"
- "explicit target"
- "dirty/conflict blocking"
negative_constraints:
- "Recovery actions must not run without an explicit target worktree or safe-point context."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-065 - Dirty Conflict Runtime Alignment

```yaml
plan_unit_id: W-065
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Runtime worktree conflict alignment treats the addendum as historical context, preserves worktree_conflict and dirty_worktree as canonical blocked reasons, uses ordered allowed actions and dirty/conflict state fields, and keeps cleanup distinct from conflict resolution."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-019
- W-033
- W-064
unblocks: []
acceptance_criteria:
- "W-065 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dirty_conflict_runtime_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0098
preserved_exact_tokens:
- "Runtime Worktree Conflict Canonical Alignment (2026-03-09)"
- "historical context only"
- "worktree_conflict"
- "dirty_worktree"
- "blocked_reason_code"
- "blocked_reason_detail"
- "remediation_actions_allowed"
- "dirty_state"
- "conflict_state"
negative_constraints:
- "Do not fabricate a new failure class when clearing the underlying worktree issue."
- "Conflict and cleanup semantics must remain distinct."
preserved_contractrefs:
- "ContractRef: Plans/Orchestrator_Page.md#Source Control boundary"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
```

### W-066 - Package Lane Worktree Allocation Policy

```yaml
plan_unit_id: W-066
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree allocation is package/lane based: Orchestrator owns the active run lane-pool truth while Source Control owns repo/worktree execution and inspection, and old run/tier/subtask allocation patterns are compatibility context until mapped to package lane pools."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-015
- W-016
unblocks: []
acceptance_criteria:
- "W-066 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lane_pool_allocation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "Worktree Lane Allocation and Source Control Reconciliation"
- "package/lane based"
- "lane-pool truth"
- "old run/tier/subtask"
- "branch-per-run"
- "subtask-per-worktree"
- "package-based lane pools"
negative_constraints:
- "Do not treat old run/tier/subtask allocation as canonical ownership."
- "Do not replace per-package lane ceilings with flat provider-only limits."
preserved_contractrefs: []
compatibility_only_notes:
- "Old run/tier/subtask, branch-per-run, subtask-per-worktree, wizard-centric, /iteration-scoped, and /seam-aware SCM assumptions are compatibility context only."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Crosswalk.md"
```

### W-067 - Source Control Lane Worktree Ownership UX

```yaml
plan_unit_id: W-067
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Source Control remains the primary operational surface for worktree inventory and actions while exposing package/lane ownership, lifecycle state, blocked/recovery state, and action ownership for open, compare, diff, history, recover, archive, prune, and remove."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-014
- W-031
- W-032
- W-033
- W-035
- W-036
- W-066
unblocks: []
acceptance_criteria:
- "W-067 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_lane_worktree_owner_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "Source Control"
- "Feature Seam"
- "Work Package"
- "Lane"
- "Worktree"
- "open"
- "compare"
- "diff"
- "history/graph"
- "recover"
- "archive"
- "prune"
- "remove"
negative_constraints:
- "Source Control must not hide known package/lane ownership for worktree rows."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/FinalGUISpec.md"
```

### W-068 - Compatibility And Route Identity Guardrails

```yaml
plan_unit_id: W-068
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Tier-era ownership keys and route-detail fields remain compatibility hazards: tier_id must not propagate as canonical worktree identity, and cross-surface openings must not pollute base route identity with line, range, wizard_step, shell-tab, or panel-subview detail."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-066
- W-067
unblocks: []
acceptance_criteria:
- "W-068 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: compat_route_identity_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "tier_id"
- "tier_type"
- "worker_provider"
- "GraphNode"
- "GraphNodeUI"
- "base route identity"
- "line"
- "range"
- "wizard_step"
- "shell-tab"
- "panel-subview"
negative_constraints:
- "tier_id must not propagate as the canonical ownership key."
- "Cross-surface openings must not pollute base route identity."
preserved_contractrefs: []
compatibility_only_notes:
- "Tier-era low-level ownership examples are compatibility inputs until migrated to lane, node, attempt, runtime-lineage, and worktree identity."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/Crosswalk.md"
```

### W-069 - Cross-Lane Reuse Cleanup Scale Policy

```yaml
plan_unit_id: W-069
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Cross-lane reuse requires contamination checks, contamination-triggered shrink, per-package lane ceilings, lane-named worktrees, preview-heavy archive/remove operations, split Orchestrator versus Source Control action ownership, and package/lane policy as the scale owner."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-015
- W-033
- W-063
- W-066
unblocks: []
acceptance_criteria:
- "W-069 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: cross_lane_cleanup_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "cross-lane reuse"
- "safe-point restore"
- "contamination-triggered"
- "provider-only"
- "per-package"
- "lane-named"
- "Bulk /archive/remove"
- "preview-heavy"
- "package/lane policy"
negative_constraints:
- "Cross-lane reuse is not a best-effort cleanup path."
- "Bulk archive/remove operations must not become one-button destructive worktree actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/Crosswalk.md"
```

### W-001 - Worktree Git Source-Preserving Bridge Retired

```yaml
plan_unit_id: W-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "W-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 204 because WorktreeGitImprovement-S0100 through S0103 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated W-001 bridge, and Migration Coverage. WorktreeGitImprovement-S0001 through S0099 are covered by W-002 through W-069 or explicit structural/reference dispositions. W-001 no longer carries source_preserving_planunit compile mode and must not own product coverage."
gui_related: false
gui_classification_reason: "The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though its retired source lineage preserved earlier GUI-related Worktree/Git product tokens."
split_recommended: false
depends_on:
- W-002
- W-003
- W-004
- W-005
- W-006
- W-007
- W-008
- W-009
- W-010
- W-011
- W-012
- W-013
- W-014
- W-015
- W-016
- W-017
- W-018
- W-019
- W-020
- W-021
- W-022
- W-023
- W-024
- W-025
- W-026
- W-027
- W-028
- W-029
- W-030
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
- W-037
- W-038
- W-039
- W-040
- W-041
- W-042
- W-043
- W-044
- W-045
- W-046
- W-047
- W-048
- W-049
- W-050
- W-051
- W-052
- W-053
- W-054
- W-055
- W-056
- W-057
- W-058
- W-059
- W-060
- W-061
- W-062
- W-063
- W-064
- W-065
- W-066
- W-067
- W-068
- W-069
unblocks: []
acceptance_criteria:
- WorktreeGitImprovement-S0001 through S0099 remain mapped to fine-grained Worktree/Git PlanUnits or structural/reference dispositions rather than W-001.
- WorktreeGitImprovement-S0100 through S0103 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- W-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: worktree_git_generated_tail_batch_204
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0101
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0102
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0103
preserved_exact_tokens:
- "source_preserving_planunit"
- "Worktree & Git Improvement -- Implementation Plan"
- "WorktreeGitImprovement-S0100"
- "WorktreeGitImprovement-S0103"
- "Migration Coverage"
- "PlanUnits"
- "Owner / Consumer Map"
negative_constraints:
- "W-001 must not provide product implementation coverage for WorktreeGitImprovement-S0001 through S0103 after Phase 2B batch 204."
- "W-001 must not override W-002 through W-069 or later fine-grained Worktree/Git PlanUnits."
- "W-001 must not use source_preserving_planunit mode after Phase 2B batch 204."
- "Do not rely on one coarse source_preserving_planunit as the final implementation standard for WorktreeGitImprovement.md."
preserved_contractrefs:
- "ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated W-001 bridge are lineage only and are not promoted as active ContractRefs."
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former W-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/WorktreeGitImprovement.md
```
