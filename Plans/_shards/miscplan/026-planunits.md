# Shard 026: PlanUnits

Source: `Plans/MiscPlan.md`

Source lines: L1352-L6285

Source SHA256: `d6df972ed7015b1942e58814db32c487fa2c65a26341c2d814e0d08b0f0707a6`

---

## PlanUnits

### M-002 - Cleanup Artifact Event Architecture Alignment

```yaml
plan_unit_id: M-002
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup actions, retained artifacts, evidence, and manual Clean workspace activity are first-class artifacts/events in the unified event model, with redb carrying retention policy, retention metadata, and rollups while cleanup boundaries align to patch/apply/verify/rollback rather than UI-only affordances.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_event_storage_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_artifact_event_architecture_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
preserved_exact_tokens:
- cleanup actions
- retained artifacts
- evidence
- first-class **artifacts/events**
- seglog ledger
- cleanup and evidence events
- redb
- retention policy
- last cleanup time
- evidence count per run
- patch/apply/verify/rollback pipeline
- not UI-only affordances
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact behavior while storage-plan.md owns seglog/redb storage mechanics and rewrite-tie-in-memo.md owns rewrite alignment.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-003 - Cleanup Backend Implementation Order

```yaml
plan_unit_id: M-003
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: 'Cleanup implementation proceeds in DRY-friendly order: create src/cleanup, centralize the allowlist and run_git_clean_with_excludes, implement prepare and cleanup functions, add the run_with_cleanup wrapper and call-site adoption, then add agent-output, evidence pruning, and manual Clean workspace behavior.'
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_sequence_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_backend_implementation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
preserved_exact_tokens:
- Suggested implementation order
- src/cleanup/
- allowlist
- DRY:DATA
- run_git_clean_with_excludes
- DRY:FN
- prepare_working_directory
- cleanup_after_execution
- run_with_cleanup
- AGENTS.md
- config toggles
- Cleanup UX
- Agent-output dir
- evidence pruning
- manual "Clean workspace" action
- Cross-plan
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-004 - Cleanup UX Copy And Widget Reuse Gates

```yaml
plan_unit_id: M-004
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UX changes use existing widgets, provide Expert and ELI5 copy variants for authored tooltip/help/discoverability copy, let app-level Interaction Mode choose the displayed variant, and keep Chat ELI5 separate and chat-only.
gui_related: true
gui_classification_reason: The unit covers user-visible cleanup configuration, confirmation, tooltip, or interaction behavior.
split_recommended: true
depends_on:
- M-003
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_gui_copy_widget_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_ux_copy_widget_reuse_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
preserved_exact_tokens:
- Cleanup UX
- config toggles
- existing widgets
- Expert and ELI5 variants
- Plans/FinalGUISpec.md §7.4.0
- App-level **Interaction Mode (Expert/ELI5)**
- Chat ELI5
- chat-only
- docs/gui-widget-catalog.md
- scripts/generate-widget-catalog.sh
- scripts/check-widget-reuse.sh
- styled_button
- confirm_modal
- toggler
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-005 - Target Project AGENTS DRY Seeding Handoff

```yaml
plan_unit_id: M-005
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Target project AGENTS.md may be seeded with DRY Method and technology/version constraints from the interview, but implementation ownership remains with interview-subagent-integration.md §5.1 and agents_md_generator.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: target_agents_handoff_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: target_project_agents_dry_seeding_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0008
preserved_exact_tokens:
- Target-project DRY
- interview-seeded
- AGENTS.md
- DRY Method
- Technology & version constraints
- Stack conventions
- React 18
- Pydantic v2
- critical-first block
- ~150-200 lines
- linked docs
- two-tier structure
- agents_md_generator
- preserving the DRY section
- overwrite vs. merge
negative_constraints: []
compatibility_only_notes:
- This is a handoff/consumer PlanUnit; it must not duplicate the Interview plan implementation owner.
stale_retired_dispositions: []
owner_boundary_notes:
- MiscPlan records cleanup-adjacent DRY guidance, while Plans/interview-subagent-integration.md §5.1 and agents_md_generator own target-project AGENTS.md generation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-006 - Cleanup Protection And Allowlist Policy

```yaml
plan_unit_id: M-006
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup never removes state files, .puppet-master except explicitly allowed pruning, config/discovery paths, .gitignore, sensitive credential patterns, or the headless GUI evidence path; agent-output may be cleared only by policy while preserving the rest of .puppet-master.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: destructive_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_protection_allowlist_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- progress.txt
- AGENTS.md
- prd.json
- STATE_FILES.md
- .puppet-master/
- .puppet-master/config.yaml
- .puppet-master/capabilities/
- .puppet-master/plans/
- .gitignore
- .env
- .env.*
- '*.env'
- '*.pem'
- '*.key'
- '*.crt'
- '*.p12'
- .ssh/
- .ssh/*
- .puppet-master/evidence/gui-automation/
- .puppet-master/agent-output/
- CLEANUP_EXCLUDE_PATTERNS
- cleanup_exclude_patterns()
negative_constraints:
- Cleanup must not remove state files, .puppet-master except explicit pruning, .gitignore, or sensitive credential paths.
- No cleanup caller may hardcode a divergent allowlist.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-007 - Assistant Worktree Cleanup Controls And Persistence UX

```yaml
plan_unit_id: M-007
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Assistant-owned worktrees identified by owner_thread_id are persistent by default; chat header Remove, thread delete, Source Control row Remove, Doctor orphan cleanup, app uninstall, and completed-thread behavior each have explicit cleanup semantics and confirmations.
gui_related: true
gui_classification_reason: The unit covers user-visible cleanup configuration, confirmation, tooltip, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: assistant_worktree_cleanup_controls_persistence_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0014
preserved_exact_tokens:
- owner_thread_id
- persistent by default
- User clicks Remove in chat header dropdown
- confirmation dialog
- dirty
- branching.assistant_worktree_cleanup_default
- ask
- keep
- remove
- Source Control worktree row
- thread-bound
- Force-remove via Doctor
- orphan cleanup
- App uninstall
- Completed threads
- merge
- create PR
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-008 - Cleanup Workspace Scope Isolation

```yaml
plan_unit_id: M-008
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup runs only in the actual selected main repo, worktree, lane, attempt workspace, or worktree path used by the agent, and must not clean the main working tree for artifacts owned by another lane, attempt, or worktree.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-007
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_worktree_data_loss
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_workspace_scope_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0014
preserved_exact_tokens:
- paths.workspace
- configured project root
- worktree
- lane
- attempt-specific working directory
- selected path only
- must not clean the main working tree
- another lane, attempt, or worktree
- same directory the agent used
negative_constraints:
- Cleanup must not clean artifacts owned by another lane, attempt, or worktree.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-009 - Cleanup Mode Configuration And Conservative Defaults

```yaml
plan_unit_id: M-009
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup supports conservative, moderate, and configurable modes, with operator-controlled untracked, clean_ignored, clear_agent_output, remove_build_artifacts, and skip_prepare_for_conversation fields and conservative defaults that avoid aggressive cleanup unless configured.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_config_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_mode_configuration_conservative_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- Option A -- Conservative
- Option B -- Moderate
- Option C -- Configurable
- cleanup.untracked
- cleanup.ignored
- clean_ignored
- clear_agent_output
- remove_build_artifacts
- skip_prepare_for_conversation
- 'Default: conservative'
- git clean -fd
- git clean -fdx
- CleanupConfig
negative_constraints:
- Ignored-file cleanup must run only when configured.
- Cleanup defaults must avoid aggressive deletion.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-010 - Cleanup DRY Module And Reuse Registry

```yaml
plan_unit_id: M-010
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The src/cleanup module owns cleanup policy and execution; reusable cleanup functions, helpers, and data are DRY-tagged, parent module declaration is explicit, and pre-implementation checks prevent duplicate cleanup logic.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_cleanup_logic_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_dry_module_reuse_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
preserved_exact_tokens:
- DRY Method
- single implementation
- src/cleanup/
- src/cleanup/mod.rs
- src/cleanup/workspace.rs
- pub mod cleanup
- DRY:FN
- DRY:DATA
- DRY:HELPER
- cleanup_allowlist()
- CLEANUP_EXCLUDE_PATTERNS
- prepare_working_directory
- cleanup_after_execution
- run_git_clean_with_excludes
- run_with_cleanup
- grep `DRY:`
- no duplicate allowlist or git-clean logic
negative_constraints:
- Runners and call sites must not reimplement git clean or allowlist logic.
- Call sites must not hardcode exclude lists.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-011 - Gitignore Sensitive File And No Secrets Safety

```yaml
plan_unit_id: M-011
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Git operations respect .gitignore, never introduce git add -f for paths that could be secrets, optionally guard staged sensitive files, and never log, commit, capture in evidence, or include in GitHub content tokens, keys, or credential file contents.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_secrets_safety_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: gitignore_sensitive_file_no_secrets_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0017
preserved_exact_tokens:
- respect .gitignore
- git add -A
- GitManager::add_all
- Do not introduce `git add -f`
- force-add
- sensitive pattern
- .env
- '*.pem'
- '*.key'
- No secrets in logs, evidence, or GitHub
- GH_TOKEN
- GITHUB_TOKEN
- 'Authorization: Bearer'
- GitHub HTTPS API
- OAuth device-code
- OS credential store
- tier metadata
- file lists
- acceptance criteria
negative_constraints:
- Do not introduce git add -f for paths that could be secrets.
- Do not log, commit, include in evidence, or include in PR content tokens, keys, or credential file contents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-012 - Git Clean Helper And Git Binary Resolution

```yaml
plan_unit_id: M-012
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: run_git_clean_with_excludes is the only git-clean helper, reads cleanup_exclude_patterns from the cleanup module, emits one -e per exclude pattern, uses shared git binary resolution, and is called only by prepare_working_directory or manual Clean workspace.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-010
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: git_clean_helper_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: git_clean_helper_git_binary_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- DRY:FN:run_git_clean_with_excludes
- 'pub async fn run_git_clean_with_excludes(work_dir: &Path, clean_untracked: bool, clean_ignored: bool) -> Result<()>'
- cleanup_exclude_patterns()
- CLEANUP_EXCLUDE_PATTERNS
- one `-e <pattern>` per entry
- git clean -fd
- git clean -fdx
- clean_untracked
- clean_ignored
- path_utils::resolve_executable("git")
- resolve_git_executable()
- Command::new("git")
- prepare_working_directory
- manual "Clean workspace" action
negative_constraints:
- run_git_clean_with_excludes must not accept an allowlist parameter.
- Do not hardcode Command::new("git") as sufficient.
- cleanup_after_execution must not call run_git_clean_with_excludes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-013 - Prepare Working Directory Semantics

```yaml
plan_unit_id: M-013
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory performs a best-effort git repo check, skips rather than fails non-repo or git-unavailable cases, does not reset tracked files without a future explicit config, runs broad untracked cleanup only before execution, and may clear agent-output in prepare.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-009
- M-012
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_working_directory_semantics_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_working_directory_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- prepare_working_directory
- git rev-parse --show-toplevel
- not a git repo or git unavailable
- skipping git clean
- git checkout -- .
- git restore .
- Do **not** run
- untracked cleanup
- before the run
- cleanup.clear_agent_output
- agent-output
- Prepare completed
- Prepare skipped
negative_constraints:
- Do not run git checkout -- . or git restore . in prepare unless a future config flag is added and documented.
- Broad untracked cleanup must run before execution, not after execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-014 - Cleanup After Execution Semantics

```yaml
plan_unit_id: M-014
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: cleanup_after_execution terminates the process if needed, removes runner temp files, may remove known build-artifact directories by config, and must not run broad untracked cleanup after execution because that would delete current-run outputs before commit.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-009
- M-012
- M-013
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_after_execution_semantics_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_after_execution_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- cleanup_after_execution
- Kill / terminate process
- pid > 0
- SIGTERM
- runner temp files
- context copy temp
- Do **not** run broad "git clean -fd"
- untracked
- orchestrator commits tier progress after the runner returns
- target/
- remove_build_artifacts
- Cleanup completed
negative_constraints:
- cleanup_after_execution must not run broad untracked cleanup.
- cleanup_after_execution must not remove current-run untracked source or docs before commit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-015 - Run With Cleanup Wrapper And Call Site Adoption

```yaml
plan_unit_id: M-015
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The canonical implementation uses run_with_cleanup around runner.execute; orchestrator, research, and start-chain paths must adopt it, conversation is optional/project-aware, config is passed into execution paths, and PlatformRunner keeps only execute with earlier trait-extension wording retained as compatibility lineage.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: run_with_cleanup_call_site_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: run_with_cleanup_wrapper_call_site_adoption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- runner.execute()
- prepare and cleanup
- ExecutionEngine::execute_iteration
- core/execution_engine.rs
- interview/research_engine.rs
- start_chain/prd_generator.rs
- requirements_interviewer.rs
- architecture_generator.rs
- multi_pass_generator.rs
- app.rs
- execute_ai_turn
- Option B
- run_with_cleanup
- PlatformRunner
- Do **not** add `prepare_working_directory` or `cleanup_after_execution` to `PlatformRunner`
- execute_with_sdk_fallback has been removed
negative_constraints:
- Call sites must not duplicate prepare/cleanup logic.
- PlatformRunner must keep only execute; earlier trait-extension wording is compatibility lineage superseded by wrapper-only guidance.
compatibility_only_notes:
- Earlier trait-extension wording in §4.1 and §4.7 is retained as compatibility lineage but is superseded by the wrapper-only rule in §4.8.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-016 - Agent Output Directory And Prepare Time Clearing

```yaml
plan_unit_id: M-016
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: .puppet-master/agent-output/ is the disposable scratch area; its path is DRY data, optional run subdirectories may be used, contents may be cleared only in prepare_working_directory, and STATE_FILES.md plus AGENTS.md document the behavior.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-013
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_output_directory_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: agent_output_directory_prepare_time_clearing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0028
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0029
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0031
preserved_exact_tokens:
- .puppet-master/agent-output/
- agent-output/run-<session_id>/
- DRY:DATA
- AGENT_OUTPUT_SUBDIR
- 'pub const AGENT_OUTPUT_SUBDIR: &str = "agent-output"'
- 'pub fn agent_output_dir(base: &Path) -> PathBuf { base.join(".puppet-master").join(AGENT_OUTPUT_SUBDIR) }'
- prepare_working_directory
- cleanup.clear_agent_output
- do not remove the directory itself
- STATE_FILES.md
- AGENTS.md
negative_constraints:
- Agent output from the current run must not be deleted in cleanup_after_execution before commit.
- Do not remove the agent-output directory itself when clearing contents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-017 - Evidence Retention And Pruning Backend

```yaml
plan_unit_id: M-017
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence lifecycle aligns to seglog and redb; retention is configurable by days or runs, pruning is scheduled/manual and outside the hot cleanup_after_execution path, and current or in-progress run evidence must not be deleted when feasible.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-002
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_retention_pruning_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_retention_pruning_backend
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0035
preserved_exact_tokens:
- .puppet-master/evidence/
- seglog
- redb
- 'evidence.retention_days: Option<u32>'
- 'evidence.retain_last_runs: Option<u32>'
- 'evidence.prune_on_cleanup: bool'
- 'pub async fn prune_evidence_older_than(base_dir: &Path, config: &EvidenceRetentionConfig) -> Result<PruneResult>'
- retention_days
- retain_last_runs
- removed items
- current prd.json
- progress.txt
- Do not block the main iteration path
negative_constraints:
- Evidence pruning must not delete evidence for the current run or recent runs still in progress when feasible.
- retain_last_runs semantics must be defined before relying on run-based pruning.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-018 - Evidence Pruning Documentation Notices

```yaml
plan_unit_id: M-018
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence retention and pruning documentation must tell users that evidence can be pruned and must warn agents not to rely on very old evidence paths.
gui_related: false
gui_classification_reason: The unit covers documentation and evidence-retention policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-017
unblocks: []
acceptance_criteria:
- STATE_FILES.md documents retention behavior, that evidence may be pruned, and the config controlling that retention.
- AGENTS.md notes that evidence can be pruned and agents should not rely on very old evidence paths.
- The covered source spans remain losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_docs_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_pruning_documentation_notices
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0036
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0040
preserved_exact_tokens:
- STATE_FILES.md
- AGENTS.md
- evidence may be pruned
- agents should not rely on very old evidence paths
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/evidence documentation obligations while referenced docs own their final prose.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The covered documentation notice is narrow enough for a single unit.
```

### M-019 - Cleanup Evidence Config Schema And Defaults

```yaml
plan_unit_id: M-019
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup and evidence settings must be modeled in one run/config schema with deterministic defaults and must be projected from the same GuiConfig/config path used by the rest of the app.
gui_related: false
gui_classification_reason: The unit covers backend config schema and run-config projection rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-009
- M-013
- M-017
unblocks: []
acceptance_criteria:
- A single config shape owns cleanup and evidence fields; no cleanup-only config schema is introduced.
- Runtime config includes cleanup.untracked, cleanup.ignored or clean_ignored, cleanup.clear_agent_output, cleanup.remove_build_artifacts, evidence.retention_days, evidence.retain_last_runs, and evidence.prune_on_cleanup.
- The YAML example and Rust CleanupConfig tokens remain traceable to the original source.
- Cleanup config is populated from the same place as enable_parallel and branching.base_branch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_config_schema_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_evidence_config_schema_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0038
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0041
preserved_exact_tokens:
- cleanup.untracked
- cleanup.ignored
- cleanup.clear_agent_output
- cleanup.remove_build_artifacts
- evidence.retention_days
- evidence.retain_last_runs
- evidence.prune_on_cleanup
- 'cleanup:'
- 'clean_ignored: false'
- 'retention_days: null'
- 'retain_last_runs: null'
- 'prune_on_cleanup: false'
- 'CleanupConfig { untracked: bool, clean_ignored: bool, clear_agent_output: bool, remove_build_artifacts: bool }'
- 'skip_prepare_for_conversation: bool'
- enable_parallel
- branching.base_branch
negative_constraints:
- Do not introduce a separate cleanup-only config shape.
- Broad untracked cleanup remains prepare_working_directory-only, not cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md remains the referenced owner for Option B config wiring details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source spans mix GUI placement and backend schema; this unit owns only the schema/default/projection behavior.
```

### M-020 - Advanced Cleanup Controls Placement And Widget Reuse

```yaml
plan_unit_id: M-020
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup and evidence controls must be visible inside the existing Advanced config surface, preferably as a Workspace / Cleanup subsection, using existing GUI catalog widgets and the same GuiConfig projection path as other run settings.
gui_related: true
gui_classification_reason: The unit defines user-visible Config/Advanced controls, toggles, inputs, buttons, and widget reuse.
split_recommended: true
depends_on:
- M-019
unblocks: []
acceptance_criteria:
- Config remains an 8-tab surface unless Advanced becomes too crowded enough to justify the documented ninth-tab fallback.
- The recommended placement is Advanced -> Workspace / Cleanup with cleanup/evidence toggles and optional worktree cleanup controls.
- The UI uses existing widgets from docs/gui-widget-catalog.md and runs catalog checks after widget changes.
- GUI controls map into CleanupConfig and evidence retention config through the shared run-config build path.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_ux_placement_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: advanced_cleanup_controls_placement_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0038
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- 8-tab
- Advanced
- Workspace / Cleanup
- Clean untracked before run
- Clean ignored files
- Clear agent-output dir
- Remove build artifacts after run
- Evidence retention (days)
- Clean all worktrees
- CleanupGuiConfig
- EvidenceRetentionGuiConfig
- GuiConfig
- styled_button
- confirm_modal
- page_header
- refresh_button
- scripts/generate-widget-catalog.sh
- scripts/check-widget-reuse.sh
negative_constraints:
- Do not create a cleanup-only config file.
- Do not create a cleanup-only tab unless the documented Advanced-crowding fallback is intentionally selected.
compatibility_only_notes:
- The documented ninth tab is a fallback, not the preferred canonical placement.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup UX requirements; FinalGUISpec and UI catalog docs own final widget implementation conventions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Source spans combine placement, widgets, project-context safety, and cross-plan alignment; this unit owns placement/widget reuse only.
```

### M-021 - Manual Clean Workspace Action And Project Context

```yaml
plan_unit_id: M-021
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Clean workspace now must run prepare-style workspace cleanup for the intended project path, with confirmations, optional dry-run/evidence pruning, clear feedback, and disabled-state safety when no project context exists.
gui_related: true
gui_classification_reason: The unit defines user-visible manual cleanup actions, confirmation modals, previews, tooltips, toasts, and disabled states.
split_recommended: true
depends_on:
- M-013
- M-017
- M-020
unblocks: []
acceptance_criteria:
- Doctor or Config exposes Clean workspace now as a button or command.
- The action runs the same untracked cleanup as prepare_working_directory, such as run_git_clean_with_excludes with allowlist, not cleanup_after_execution.
- Clean ignored and prune evidence paths require explicit confirmation.
- The project root is resolved from the same source as the run; std::env::current_dir() is not used unless it is the intended project.
- Missing project context disables the action with an explanatory tooltip and prevents accidental CWD cleanup.
- Optional preview uses git clean -fd -n and post-clean feedback reports cleaned count or nothing to clean.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: destructive_clean_wrong_project
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: manual_clean_workspace_action_project_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0040
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- Clean workspace now
- run_git_clean_with_excludes
- cleanup_after_execution
- 'Remove untracked and ignored files in workspace?'
- 'Removes agent-left-behind untracked files and optional temp dirs; does not remove .puppet-master/ or state files.'
- current_project.path
- discover_config_path(Some(hint))
- gui_config.project.working_directory
- 'std::env::current_dir()'
- 'Select a project or open a config to clean.'
- git clean -fd -n
- 'Cleaned N files/dirs'
- 'Nothing to clean.'
negative_constraints:
- The manual action must not run in an accidental process CWD.
- The manual action must not behave like cleanup_after_execution when broad untracked cleanup is intended.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Doctor and Config may host the action, but the cleanup semantics stay owned by the shared cleanup implementation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source spans mix control placement, project-root safety, preview, and docs; this unit owns the manual action and safety path.
```

### M-022 - Cleanup Cross-Plan UI And Source-Control Boundaries

```yaml
plan_unit_id: M-022
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup GUI wiring must align with Worktree, Orchestrator, Interview, Providers, and Source Control owner surfaces without collapsing per-project, per-worktree, or historical lineage state into a single global cleanup pool.
gui_related: true
gui_classification_reason: The unit governs user-visible cleanup/worktree/source-control grouping, labels, layout boundaries, and provider-readiness surface alignment.
split_recommended: true
depends_on:
- M-020
- M-021
unblocks: []
acceptance_criteria:
- Cleanup and evidence toggles are added to the same GuiConfig and Option B run-config build described by the Worktree plan.
- Cleanup UI does not conflict with Orchestrator Advanced layout, Interview GUI gaps, or Providers readiness state.
- Source Control grouping preserves terminal widget IDs, /hostability, worktree /controls, /filtering, lane binding, and historical lineage requirements.
- Cleanup state remains partitioned by project/worktree context instead of one global pool.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_cleanup_ui_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_cross_plan_ui_source_control_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- Worktree plan
- Option B
- Orchestrator plan
- Interview plan
- Providers surface alignment
- Source Control grouping
- /hostability
- /controls
- /filtering
- source-control lane binding
- historical lineage preservation
- scale-safe partitioning
negative_constraints:
- Do not collapse all cleanup state into one global pool.
- Do not treat Source Control lineage and lane binding as cosmetic polish.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Referenced owner docs retain final authority for their surfaces; this unit records MiscPlan cleanup integration constraints.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit spans multiple owner surfaces and should be routed with owner-doc evidence during implementation planning.
```

### M-023 - Platform CLI Capability Non-Dependency

```yaml
plan_unit_id: M-023
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Platform hooks, skills, plugins, extensions, and MCP integrations can complement cleanup and agent context, but Puppet Master prepare/cleanup remains an internal run_with_cleanup responsibility and is not dependent on provider-native extension mechanisms.
gui_related: false
gui_classification_reason: The unit defines provider/runtime architecture and optional integration stance rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- prepare_working_directory and cleanup_after_execution are implemented internally and invoked via run_with_cleanup around runner.execute().
- Provider-specific hooks, plugins, extensions, skills, and MCP servers are optional compatibility helpers only.
- Cleanup and evidence are not exposed as MCP tools in the current plan.
- Optional future clean_workspace MCP exposure remains out of scope until explicitly planned.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_hook_dependency_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: platform_cli_capability_non_dependency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0043
preserved_exact_tokens:
- prepare_working_directory
- cleanup_after_execution
- run_with_cleanup
- runner.execute()
- hooks
- skills
- plugins
- extensions
- MCP servers
- clean_workspace
- out of scope
- platform_specs
- AGENTS.md
negative_constraints:
- Puppet Master must not rely on platform-specific hooks or scripts for core workspace cleanup.
- Cleanup and evidence are not MCP tools in the current plan.
compatibility_only_notes:
- A Puppet Master-authored skill or optional user hook can document cleanup expectations for users running CLIs outside Puppet Master.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider capability details remain aligned with orchestrator-subagent-integration and platform_specs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span includes bootstrap copy, which is isolated in M-024; this unit covers the provider non-dependency stance.
```

### M-024 - Provider Bootstrap Trust Copy

```yaml
plan_unit_id: M-024
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cursor provider bootstrap/trust status copy must preserve the exact title and subtext specified by the source span.
gui_related: true
gui_classification_reason: The unit preserves user-visible bootstrap/trust copy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The Cursor trust title is exactly Workspace trust required.
- The Cursor trust subtext is exactly Cursor CLI is signed in, but this workspace must be trusted before all tools and MCP servers are available.
- The covered source span remains losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bootstrap_trust_copy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: provider_bootstrap_trust_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0043
preserved_exact_tokens:
- Workspace trust required
- Cursor CLI is signed in, but this workspace must be trusted before all tools and MCP servers are available
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider bootstrap ownership remains with provider/runtime owner docs; MiscPlan preserves exact copy lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The copy requirement is narrow enough for one unit.
```

### M-025 - Shortcuts GUI Surface Defaults And Edit Flow

```yaml
plan_unit_id: M-025
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: A Shortcuts GUI surface must show the complete default shortcut table, current bindings, change/double-click edit flow, reset controls, persistence, widget reuse, and immediate reflection of the active key map.
gui_related: true
gui_classification_reason: The unit defines a user-visible Shortcuts screen, list/table behavior, edit flow, reset controls, and copyable labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Users can open the Shortcuts surface from Config, Advanced, Shortcuts, Settings, or Preferences according to the single canonical UI location selected by implementation.
- The surface lists all actions and current bindings from the default/override key map.
- Users can change bindings via Change or double-click and can reset per action or reset all.
- Shortcut keys are selectable/copyable and use existing widget-catalog widgets.
- Changes persist through the same Config/GuiConfig surface and take effect immediately after save.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_surface_registry_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_gui_surface_defaults_edit_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
preserved_exact_tokens:
- Desktop Shortcuts (GUI screen)
- Config -> Advanced -> Shortcuts
- Config -> Shortcuts
- Settings / Preferences
- GuiConfig
- selectable_label
- selectable_label_mono
- Ctrl+A
- Ctrl+E
- Ctrl+B
- Ctrl+F
- Alt+B
- Alt+F
- Ctrl+D
- Ctrl+K
- Ctrl+U
- Ctrl+W
- Alt+D
- Ctrl+T
- Ctrl+G
- Move to start of current line
- Move to end of current line
- Move cursor back one character
- Move cursor forward one character
- Move cursor back one word
- Move cursor forward one word
- Delete character under cursor
- Kill to end of line
- Kill to start of line
- Kill previous word
- Kill next word
- Transpose characters
- Cancel popovers / abort running response
negative_constraints:
- The implementation must choose one canonical UI location for Shortcuts.
- The GUI must not show a shortcut list disconnected from the active key map.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec and UI_Command_Catalog own final surface composition and widget conventions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span also defines backend data flow and error handling, which are split into M-026 and M-027.
```

### M-026 - Shortcut Registry Backend And Key Map Rebuild

```yaml
plan_unit_id: M-026
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut handling must use a single registry of actions/defaults, serializable KeyBinding overrides in GuiConfig, a DRY build_key_map merge function, platform-aware display/mapping, and deterministic rebuild/install timing for all focusable text areas.
gui_related: true
gui_classification_reason: The unit defines backend shortcut data used by GUI key handling and user-visible text-input behavior.
split_recommended: true
depends_on:
- M-025
unblocks: []
acceptance_criteria:
- ShortcutAction and KeyBinding types exist for every default shortcut action.
- default_shortcuts() is the single source of truth and is tagged DRY:DATA:default_shortcuts.
- GuiConfig.shortcuts or keyboard_shortcuts stores overrides only.
- build_key_map(default_shortcuts(), gui_config.shortcuts) rebuilds app key handling at startup, after edit/reset, and after successful import.
- Slint key events in composer, chat input, interview text fields, config text inputs, wizard prompts, and other focusable text areas consult the active key map.
- Unit tests cover default/override merge, validation, and round-trip behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_keymap_serialization_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_registry_backend_key_map_rebuild
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- ShortcutAction
- KeyBinding
- default_shortcuts()
- GuiConfig.shortcuts
- keyboard_shortcuts
- build_key_map(defaults, overrides) -> KeyMap
- build_key_map(default_shortcuts(), gui_config.shortcuts)
- DRY:DATA:shortcut_actions
- DRY:DATA:default_shortcuts
- DRY:FN:build_key_map
- DRY:FN:validate_shortcut_binding
- FocusScope
- key-pressed
- App::key_map
- MoveToLineStart
- '"Ctrl+A"'
- '{ "modifiers": ["ctrl"], "key": "A" }'
negative_constraints:
- Key handling must not use hardcoded shortcut bindings outside the shared registry/key map.
- A separate shortcuts file is not used unless design explicitly mandates it.
compatibility_only_notes:
- KeyBinding serialization must remain backward-compatible if the format changes later.
stale_retired_dispositions: []
owner_boundary_notes:
- Slint wiring details belong to the GUI implementation surface, but the shortcut registry remains a shared backend/UI contract.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The unit bridges backend registry and GUI event routing; conflict/error UX is split into M-027.
```

### M-027 - Shortcut Conflict And Config Failure UX

```yaml
plan_unit_id: M-027
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut editing/import must reject or explicitly resolve duplicate bindings, recover from invalid shortcut config with defaults and a toast, distinguish empty filters from no matches, and avoid blank or undefined labels while the key map is loading.
gui_related: true
gui_classification_reason: The unit defines user-visible validation errors, toasts, inline empty states, loading labels, and conflict behavior.
split_recommended: true
depends_on:
- M-026
unblocks: []
acceptance_criteria:
- Duplicate bindings are rejected or intentionally resolved by the implementation choice, with the recommendation to reject and show Already used by &lt;ActionName&gt;.
- Corrupt or invalid shortcuts config falls back to defaults, logs a warning, and shows Shortcuts reset to defaults due to config error.
- Unsupported import versions are rejected or explicitly handled by documented version behavior.
- Empty filter shows all rows; a non-empty no-match filter shows No shortcuts match 'xyz'.
- UI shows a label-only state or (Loading...) before the key map is loaded and never shows blank or (undefined).
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_conflict_config_failure_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_conflict_config_failure_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- 'Already used by &lt;ActionName&gt;'
- 'Shortcuts reset to defaults due to config error'
- 'Unsupported shortcut file version'
- "No shortcuts match 'xyz'"
- '(Loading...)'
- '(undefined)'
- validate_shortcut_binding
- Ctrl+C
- Ctrl+V
negative_constraints:
- The UI must not show No shortcuts when the filter is the cause of an empty result.
- The UI must not show blank or (undefined) shortcut labels.
- The app must not crash on missing, corrupt, or invalid shortcut config.
compatibility_only_notes:
- Reject-vs-steal and unknown-version handling are implementation choices; the recommended stance is reject with clear copy.
stale_retired_dispositions: []
owner_boundary_notes:
- Shortcut conflict details remain coupled to M-026 registry behavior.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source carries several implementation choices; this unit preserves the choices and recommendations as node-readiness considerations, not product blockers.
```

### M-028 - Shortcut Export Import Filter And Label Helpers

```yaml
plan_unit_id: M-028
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Shortcuts surface must support export/import of overrides, Replace/Merge confirmation, list filtering by action or key, menu/tooltip shortcut labels, and shared DRY helper functions that reuse GuiConfig shortcut serialization.
gui_related: true
gui_classification_reason: The unit defines visible export/import, filtering, confirmation, success/error toasts, and menu/tooltip labels.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
unblocks: []
acceptance_criteria:
- Export writes current overrides or full key map to JSON with a version field and success toast.
- Import parses and validates JSON, confirms Replace or Merge, rebuilds the key map, persists config, and reports success/failure without partial invalid application.
- Filtering is case-insensitive over action labels and shortcut strings, with the empty-filter/no-match behavior from M-027.
- Menus and buttons for shortcut actions display the current binding in labels or tooltips through a shared helper.
- Export/import helpers reuse the same serialization as GuiConfig.shortcuts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_import_format_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_export_import_filter_label_helpers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0049
preserved_exact_tokens:
- Export...
- Import...
- Replace
- Merge
- '{ "version": 1, "overrides": { "MoveToLineStart": "Ctrl+A", ... } }'
- 'Exported N shortcuts.'
- 'Imported N shortcuts.'
- export_shortcuts_to_json
- import_shortcuts_from_json
- ShortcutOverrides
- Invalid shortcut file
- Unknown action: X
- 'Filter by action or shortcut'
- shortcut_label
- 'Shortcut: Ctrl+K'
- No shortcut
negative_constraints:
- Invalid JSON or unparseable files must not apply partial shortcut changes.
- Imported files with unsupported future versions must not be silently accepted.
compatibility_only_notes:
- Unknown-action handling is an implementation choice; the recommendation is to document skip-vs-reject behavior.
stale_retired_dispositions: []
owner_boundary_notes:
- This unit extends M-025/M-026 without introducing a separate shortcut ownership surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Export/import, filter, and label helpers are related user-facing enhancements but should remain separately addressable from the core key map.
```

### M-029 - Skills Management Surface Owner Boundary

```yaml
plan_unit_id: M-029
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: A Skills management GUI surface must exist for discover/list/add/edit/remove/permissions behavior, while final placement follows the current Skills/GUI owner docs and older Config/Settings placement wording is retained as source lineage compatibility.
gui_related: true
gui_classification_reason: The unit defines a user-visible Skills management screen and placement boundary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The product exposes one Skills management surface that is reachable from the same config/settings family as GuiConfig.
- The surface covers discover, list, add, edit, remove, and permission configuration.
- Skill names and paths are selectable/copyable through catalog widgets.
- Final placement is reconciled with Skills_System.md and FinalGUISpec rather than treating older Config/Settings wording as a competing owner decision.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_owner_surface_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_management_surface_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- Agent Skills (GUI)
- SKILL.md
- Config
- Advanced
- Skills
- Settings
- page_header
- styled_button
- selectable_label
- selectable_label_mono
- Add / Edit / Remove / Permissions / Refresh
negative_constraints:
- Do not create multiple competing Skills GUI locations.
- Do not delete a skill without explicit user confirmation.
compatibility_only_notes:
- Config, Advanced, dedicated Skills tab, Settings, and Preferences wording is preserved as source lineage pending owner-doc placement reconciliation.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Skills_System.md and Plans/FinalGUISpec own the final Skills surface placement and system-wide skill model.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source span also contains package model, permissions, and CRUD/error behavior split into M-030 through M-032.
```

### M-030 - Skill Package Format Discovery And Validation

```yaml
plan_unit_id: M-030
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill discovery and validation must follow the one-folder-per-skill SKILL.md package model, ordered project/global discovery roots, strict OpenCode-aligned name validation, frontmatter requirements, and required_tool_refs/optional_tool_refs readiness semantics.
gui_related: false
gui_classification_reason: The unit covers backend discovery, package validation, and readiness metadata rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-029
unblocks: []
acceptance_criteria:
- Discovery uses project and global roots from the canonical skill system and records the ordered search path.
- Each skill is one folder with SKILL.md and frontmatter fields name, description, license, compatibility, and metadata as applicable.
- Skill names match ^[a-z0-9]+(-[a-z0-9]+)*$, are 1-64 chars, have no leading/trailing or consecutive hyphens, and match the directory name.
- Descriptions are 1-1024 chars.
- required_tool_refs problems block runnable /readiness; optional_tool_refs problems warn; exact failing refs are surfaced instead of one generic error.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_schema_discovery_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_package_format_discovery_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
preserved_exact_tokens:
- SKILL.md
- name
- description
- license
- compatibility
- metadata
- .puppet-master/skills/<name>/SKILL.md
- .claude/skills/<name>/SKILL.md
- .agents/skills/<name>/SKILL.md
- ~/.config/puppet-master/skills/<name>/SKILL.md
- ~/.claude/skills/<name>/SKILL.md
- ~/.agents/skills/<name>/SKILL.md
- '^[a-z0-9]+(-[a-z0-9]+)*$'
- required_tool_refs
- optional_tool_refs
- /readiness
- discover_skills(project_root)
negative_constraints:
- Skill name in frontmatter must match the directory name.
- Required-tool reference failures must not be flattened into a generic error.
compatibility_only_notes:
- OpenCode-compatible import roots are compatibility inputs; PM-native runtime delivery remains canonical.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Skills_System.md owns the canonical skill system; this unit preserves MiscPlan implementation requirements and source lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Discovery and validation are separable from permissions, GUI CRUD, and runtime bundling.
```

### M-031 - Skill Permissions Persona And Tool Exposure

```yaml
plan_unit_id: M-031
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill loading is permission-gated through permission.skill, Persona default_skill_refs and permission profiles, available_skills tool descriptions, skill({ name }) on-demand retrieval, /skillname commands, external_directory allowlisting, and compaction preservation.
gui_related: false
gui_classification_reason: The unit defines permission/runtime contracts and prompt/tool exposure rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- permission.skill supports per-skill patterns such as allow, deny, ask, and wildcard entries.
- Persona default_skill_refs and permission profiles can auto-load or restrict skills.
- A Persona can deny the skill permission key to disable skill loading for that Persona.
- Tool descriptions include available skills in <available_skills> XML blocks with name and description.
- Agents invoke skills with skill({ name }) and /skillname command-palette entries.
- Skill directories are automatically included in external_directory allowlist handling, and skill tool calls survive /compaction pruning.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_permission_runtime_exposure_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_permissions_persona_tool_exposure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- permission.skill
- default_skill_refs
- permission profiles
- '{ "my-skill": "allow", "internal-*": "deny", "*": "allow" }'
- '<available_skills>'
- skill({ name })
- /skillname
- external_directory
- /compaction
- assistant-chat-design.md
negative_constraints:
- Persona-level deny of skill must disable skill loading for runs using that Persona.
- Incremental summarization or compaction must not drop recoverable skill lineage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permissions_System.md, Personas.md, Prompt_Pipeline.md, and Tools.md retain their ContractRef authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: Permission/tool exposure is independent of Skills GUI CRUD and package validation.
```

### M-032 - Skills GUI CRUD Refresh And Errors

```yaml
plan_unit_id: M-032
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills GUI must list discovered skills with source and permission state, support create/import/edit/remove/permission/refresh flows, refresh only on open/mutations/manual refresh, and surface frontmatter, missing SKILL.md, and config-write errors without corrupting state.
gui_related: true
gui_classification_reason: The unit defines user-visible Skills list, CRUD controls, refresh behavior, validation errors, and toasts.
split_recommended: true
depends_on:
- M-029
- M-030
- M-031
unblocks: []
acceptance_criteria:
- The list shows project and global skills with name, truncated description, source path, source type, and resolved permission.
- Add supports Create new or Import from path; Edit validates frontmatter/name matching; Remove or Disable requires confirmation.
- Permissions can be edited per skill or by pattern and persist to GuiConfig.skill_permissions or permission.skill-compatible config.
- Refresh runs on opening, after Add/Edit/Remove, and when the user clicks Refresh; no timer-based auto-refresh is used.
- Invalid frontmatter, missing SKILL.md, and permission/config write failures surface as clear inline errors or toasts and do not corrupt saved state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_gui_mutation_state_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_gui_crud_refresh_errors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- Create new
- Import from path
- Remove
- Disable
- Do not delete without explicit user confirmation.
- GuiConfig.skill_permissions
- opencode.json-style permission.skill
- Refresh
- discover_skills(project_root)
- Do not auto-refresh on a timer
- Invalid frontmatter in SKILL.md
- Missing SKILL.md
- Permission/config write failure
negative_constraints:
- Do not delete a skill folder without explicit user confirmation.
- Do not auto-refresh the Skills list on a timer.
- Do not lose edits after a permission/config write failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend discovery/load/persistence remains the provider for this GUI; GUI owns presentation and mutation flow.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: Skills CRUD and refresh/error behavior are a coherent GUI workflow separate from backend discovery and runtime delivery.
```

### M-033 - Skill Runtime Readiness Bundling And PM Skill Tool

```yaml
plan_unit_id: M-033
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: PM-native skill runtime delivery must compute readiness from validation, permission, and tool availability; bundle selected skill content into compiled context; expose the PM skill tool for on-demand retrieval; and avoid requiring provider-native runtime delivery matrices for MVP.
gui_related: false
gui_classification_reason: The unit defines runtime readiness, prompt/context bundling, and tool delivery rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-030
- M-031
unblocks: []
acceptance_criteria:
- Runtime readiness is computed before launch from validation state, permission state, and tool availability.
- PM-selected skill content is bundled into compiled context when needed.
- PM exposes the skill tool for on-demand skill retrieval during the run.
- Provider-native directories and formats are optional import/export/projection layers, not required runtime delivery for MVP.
- Tests cover discover_skills, load_skill, and resolve_skill_permission.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_runtime_readiness_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_runtime_readiness_bundling_pm_tool
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- PM-native runtime model
- runtime readiness
- compiled context
- skill tool
- provider-native skill directories
- provider-native formats
- canonical registry
- permission filter
- context bundling
- discover_skills
- load_skill
- resolve_skill_permission
negative_constraints:
- Implementation does not require a separate per-provider native runtime delivery matrix.
compatibility_only_notes:
- Provider-native formats may be documented or used as interoperability inputs.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, Prompt_Pipeline.md, and Tools.md own runtime skill contracts; this unit preserves MiscPlan readiness and bundling lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Runtime readiness is separate from projection target drift and GUI decisions.
```

### M-034 - Skill Projection Targets Drift And Manual Override

```yaml
plan_unit_id: M-034
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill import/discovery can read compatible roots, but projection/export is optional and explicit, tracked per projection target, separated between workspace-owned and provider-root-owned state, and direct edits move only the chosen target to Manual Override.
gui_related: true
gui_classification_reason: The unit includes user-visible projection, drift, repair, and Manual Override state.
split_recommended: true
depends_on:
- M-033
unblocks: []
acceptance_criteria:
- Import/discovery from compatible roots is allowed when canonical skill settings enable it.
- Projection/export is optional and explicit.
- Projection and drift state are tracked per target through projection_targets or projection_targets[].
- Workspace-owned projections are not confused with provider-root-owned account/runtime directories during cleanup or repair.
- Editing a provider-native projection target directly switches only that target to Manual Override; repair acts on the chosen target and does not silently revert siblings.
- Projection failure does not imply PM-native skill runtime delivery failure.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_projection_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_projection_targets_drift_manual_override
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
preserved_exact_tokens:
- projection_targets
- projection_targets[]
- workspace AGENTS.md
- workspace CLAUDE.md
- workspace GEMINI.md
- workspace .cursor/rules/pm-generated.mdc
- workspace cursor/rules/pm-generated.mdc
- provider/account-local
- /account-local
- Manual Override
negative_constraints:
- Cleanup or repair flows must not confuse workspace-owned projected files with provider-root-owned account/runtime directories.
- Repair must not silently revert sibling projection targets.
- A projection failure does not mean PM-native skill runtime delivery failed.
compatibility_only_notes:
- Projection/export remains optional and explicit.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, FinalGUISpec.md, storage-plan.md, Multi-Account.md, and OpenCode_Deep_Extraction.md retain final projection and account-boundary authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Multi-Account.md'
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Projection target drift is distinct from PM-native runtime readiness and should remain independently routable.
```

### M-035 - Skills Gap Decisions And Readiness Table

```yaml
plan_unit_id: M-035
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: 'Skills implementation planning must preserve the resolved gaps table covering first-wins discovery deduplication, create-no-overwrite behavior, concurrent-edit handling recommendation, full validate-all status table, deferred ask timing, import-copy semantics, global-only create without a project, and name/folder match enforcement.'
gui_related: true
gui_classification_reason: The unit includes user-visible Skills list/status decisions, prompts, modals, and error behavior.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-033
unblocks: []
acceptance_criteria:
- Deduplication by name uses first-wins by search order and can show later duplicates as shadowed in the GUI.
- Creating a skill never overwrites an existing SKILL.md.
- Concurrent edit handling preserves the recommended Reload / Overwrite / Cancel prompt option for implementation planning.
- Validate all shows a full table of discovered skills with OK or Error status and summary counts unless explicitly deferred for v1.
- Ask permission is deferred to the moment the runner would load the skill and is handled in-app before or at run start, not inside the platform CLI.
- Import copies into a discovery path instead of persisting arbitrary external paths.
- No-project creation offers global-only, and frontmatter name must match folder name.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_gap_decision_readiness_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_gap_decisions_readiness_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- First-wins by search order
- DRY:DATA:skill_search_paths
- 'A skill named &lt;name&gt; already exists at this location'
- File changed on disk. Reload / Overwrite / Cancel
- 'N OK, M errors.'
- Show only errors
- Allow skill 'doc-lookup' for this run?
- Allow / Deny / Always / Never
- Explicit per-skill entry wins over pattern.
- Copy into a discovery path.
- ~/.config/puppet-master/skills/<name>
- Name must match folder name
negative_constraints:
- Create new must not overwrite an existing skill containing SKILL.md.
- Import must not persist arbitrary external paths.
- Ask permission prompts occur in-app before or at run start, not inside the platform CLI.
compatibility_only_notes:
- Some choices remain implementation-plan readiness decisions, not product blockers for this standardization batch.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md owns final skill semantics; this unit keeps the MiscPlan gap-resolution table source-preserved and atomized.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source table covers many readiness choices; this unit preserves them as one planning-readiness cluster while keeping implementation decisions explicit.
```

### M-036 - Skills Bulk Permission Pattern Control

```yaml
plan_unit_id: M-036
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must support a bulk permission pattern control where users enter a wildcard pattern, select Allow/Deny/Ask, confirm the matched count, persist GuiConfig.skill_permissions, and preserve explicit per-skill precedence over patterns.
gui_related: true
gui_classification_reason: The unit defines user-visible bulk permission input, dropdown, confirmation modal, and list feedback.
split_recommended: true
depends_on:
- M-031
- M-032
- M-035
unblocks: []
acceptance_criteria:
- Users can enter patterns such as doc-* or internal-* and choose Allow, Deny, or Ask.
- Apply resolves discovered skills matching the pattern and shows a confirmation with count before persisting.
- Confirmation copy preserves the source example Set Allow for 3 skills matching doc-*?.
- On confirm, GuiConfig.skill_permissions is updated and the list reflects new resolved permissions.
- Explicit per-skill rules win over pattern rules.
- Source lines 801-866 of MiscPlan-S0050 remain residual under M-001 for the next bounded window.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_bulk_permission_pattern_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_bulk_permission_pattern_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Bulk permission
- Set by pattern
- doc-*
- internal-*
- Allow / Deny / Ask
- Apply
- 'Set Allow for 3 skills matching doc-*?'
- GuiConfig.skill_permissions
- Explicit per-skill wins over pattern
- apply_bulk_permission
- SkillPermissions
- Permission
- SkillInfo
negative_constraints:
- The atomized coverage for this unit is bounded to MiscPlan-S0050 lines 791-800; lines 801-866 remain residual for later handling.
- Explicit per-skill overrides must not be overridden by a broader pattern.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend wildcard semantics are shared with resolve_skill_permission and M-031.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit intentionally covers only the first bounded part of S0050; remaining sort/filter, preview, modified/version, and validate-all material stays residual.
```

### M-037 - Skills Bulk Permission Backend Save Handling

```yaml
plan_unit_id: M-037
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills bulk-permission updates must route through shared backend permission state, report config-persist failures, and leave retryable in-memory state instead of pretending unsaved changes succeeded.
gui_related: true
gui_classification_reason: The unit defines user-visible bulk-permission save feedback and retry behavior on the Skills surface.
split_recommended: false
depends_on:
- M-031
- M-032
- M-036
unblocks: []
acceptance_criteria:
- Bulk permission may use apply_bulk_permission as a DRY helper to compute matched skills and update SkillPermissions.
- Config persist failure after Apply shows an error toast.
- In-memory state is not marked as saved after a persist failure so the user can retry.
- Source lines 801-802 of MiscPlan-S0050 are covered without re-owning the earlier M-036 source lines.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_bulk_permission_save_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_bulk_permission_backend_save_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- apply_bulk_permission
- SkillPermissions
- Permission
- SkillInfo
- config persist fails
- error toast
- saved
negative_constraints:
- Failed permission config persistence must not be shown as saved.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend wildcard semantics remain shared with resolve_skill_permission.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers only the backend save/error tail of the bulk-permission source span.
```

### M-038 - Skills Sort Filter List Controls

```yaml
plan_unit_id: M-038
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must support in-memory sort and combined filters over the discovered skill list without re-running discovery on sort or filter changes.
gui_related: true
gui_classification_reason: The unit defines user-visible list sorting, filtering controls, dropdowns, and persisted sort preference.
split_recommended: false
depends_on:
- M-030
- M-031
- M-032
unblocks: []
acceptance_criteria:
- Users can sort skills by Name, Source, or Permission.
- Users can filter by text, source, and permission with combined filters.
- Sort/filter applies in-memory to discover_skills plus resolved permission results and does not rediscover on every sort/filter change.
- Sort preference persists in session or GuiConfig.
- Existing widget-catalog inputs/dropdowns/toggles are reused.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_sort_filter_state_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_sort_filter_list_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Sort / filter list
- Name
- Source
- Permission
- All / Project / Global
- All / Allow / Deny / Ask
- skills_list_sort
- sort_skills
- filter_skills
- discover_skills(project_root)
negative_constraints:
- Sort and filter changes must not trigger re-discovery.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills discovery remains owned by the backend skill registry; this unit owns the list-control behavior.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Sort/filter list controls are a coherent GUI enhancement.
```

### M-039 - Skills Preview Body Pane

```yaml
plan_unit_id: M-039
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must provide an on-demand read-only SKILL.md body preview with copyable text and clear per-skill load errors.
gui_related: true
gui_classification_reason: The unit defines a visible Skills preview pane or modal, selectable text, and error display.
split_recommended: false
depends_on:
- M-030
- M-032
unblocks: []
acceptance_criteria:
- Selecting a skill loads its SKILL.md body on demand into a read-only pane, drawer, or modal.
- Preview content is copyable and may show markdown body only or full file with frontmatter collapsed.
- Edit opens the full editor.
- Load failures show an error in the preview pane and may trigger list refresh without aborting the whole surface.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_preview_body_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_preview_body_pane
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Preview skill body
- SKILL.md
- read-only pane
- selectable_label_mono
- load_skill(path)
- "body: Option<String>"
- load_skill_body(path)
- Could not load skill
negative_constraints:
- Skill bodies must be loaded on demand rather than all up front.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Preview reuses backend skill loading and must not define a competing parser.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Preview is separable from sort/filter and validation.
```

### M-040 - Skill Last Modified And Version Display

```yaml
plan_unit_id: M-040
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill list and preview metadata must show last-modified information and may show optional version metadata when supported, while unreadable mtimes degrade to an empty or placeholder value without dropping the skill.
gui_related: true
gui_classification_reason: The unit defines user-visible skill metadata display in list rows and preview panes.
split_recommended: false
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- SkillInfo can carry modified metadata from file mtime.
- The Skills list and preview pane show last modified as a date or relative time.
- Optional version can be read from frontmatter or metadata.version only if the frontmatter model extends to support it.
- Unreadable mtime shows an empty value or -- and does not remove the skill from the list.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_metadata_display_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_last_modified_version_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Last modified / version
- std::fs::metadata(path).modified()
- "modified: Option<DateTime<Utc>>"
- SystemTime
- "Modified: 2026-02-22"
- "Modified: 2 days ago"
- metadata.version
- "skill_modified(path: &Path)"
- --
negative_constraints:
- Mtime read failures must not exclude a discovered skill.
compatibility_only_notes:
- The version field is optional and not required by OpenCode.
stale_retired_dispositions: []
owner_boundary_notes:
- Skill metadata remains an extension of SkillInfo and does not change core discovery ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Metadata display is a narrow enhancement.
```

### M-041 - Validate All Skills Read-Only Flow

```yaml
plan_unit_id: M-041
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills validation must provide a read-only Validate all flow that checks every discovered SKILL.md and reports per-skill results in a full, copyable table.
gui_related: true
gui_classification_reason: The unit defines a user-visible validation command, results table, summary line, optional error filter, and copyable errors.
split_recommended: false
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- Validate all runs the same frontmatter, name, directory-name, and description checks as load_skill.
- Results show a full table for all discovered skills with OK or Error plus message.
- Summary copy preserves N OK, M errors.
- Per-skill read errors are reported and do not abort validation of later skills.
- Validation is read-only and does not write skill files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_validate_all_flow_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: validate_all_skills_read_only_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Validate all SKILL.md on disk
- Validate all
- "validate_skill(path: &Path)"
- ValidationError
- N OK, M errors
- Show only errors
- Could not read file
negative_constraints:
- Validate all must not abort the entire run when one skill becomes unreadable.
- Validate all is read-only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Validation reuses load_skill rules and must not duplicate divergent validation semantics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Validate all is a discrete Skills quality workflow.
```

### M-042 - Shortcuts Skills Readiness And Order

```yaml
plan_unit_id: M-042
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts and Skills implementation planning is ready when the spec sections, checklists, project-path behavior, Slint key-event integration point, platform skill delivery, dependencies, and recommended order are reconciled.
gui_related: true
gui_classification_reason: The unit covers GUI-facing Shortcuts and Skills implementation readiness, including key-event and Skills surface sequencing.
split_recommended: true
depends_on:
- M-003
- M-019
- M-025
- M-026
- M-027
- M-028
- M-030
- M-031
- M-032
- M-033
- M-034
- M-035
- M-036
- M-037
- M-038
- M-039
- M-040
- M-041
unblocks: []
acceptance_criteria:
- The implementation plan reads sections 7.7 through 7.11.2 and checklist sections 8.8 through 8.10.2 before planning Shortcuts and Skills.
- No-project Skills creation offers global-only paths.
- Slint key event integration point is identified and documented.
- platform_specs or equivalent documents how each platform receives skills.
- Implementation order preserves cleanup/run-config foundation before Shortcuts, Skills, Cleanup UX, enhancements, and pre-completion.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_skills_readiness_order_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_skills_readiness_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Implementation plan readiness
- Implementation plan checklist
- project_root is None
- FocusScope
- KeyMap
- platform_specs
- list_skills_for_agent
- GuiConfig and Option B run config
- Recommended implementation order
- Pre-completion
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Slint API confirmation and platform skill delivery are implementation-readiness blockers, not product-decision blockers for this standardization batch.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This readiness unit coordinates several GUI/backend areas and should remain split_recommended for implementation planning.
```

### M-043 - Cleanup Checklist Core Module Guard

```yaml
plan_unit_id: M-043
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation checklist items must keep all cleanup policy, allowlist data, and git-clean execution in src/cleanup with DRY tags and no duplicated logic outside the shared module.
gui_related: false
gui_classification_reason: The unit covers backend module organization, DRY tagging, and cleanup helper implementation.
split_recommended: true
depends_on:
- M-006
- M-010
- M-012
- M-013
- M-014
- M-016
unblocks: []
acceptance_criteria:
- src/cleanup/mod.rs and src/cleanup/workspace.rs carry CleanupConfig, allowlist data, prepare_working_directory, cleanup_after_execution, and run_git_clean_with_excludes as shared implementations.
- cleanup_exclude_patterns or CLEANUP_EXCLUDE_PATTERNS includes the exact required exclusions.
- Git execution uses resolved git binary behavior rather than duplicated Command::new logic.
- prepare_working_directory never removes protected .puppet-master or root state files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_core_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_checklist_core_module_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0051
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0052
preserved_exact_tokens:
- src/cleanup/
- pub mod cleanup;
- src/lib.rs
- CleanupConfig
- cleanup_exclude_patterns()
- CLEANUP_EXCLUDE_PATTERNS
- run_git_clean_with_excludes
- path_utils::resolve_executable("git")
- DRY:DATA
- DRY:FN
negative_constraints:
- No duplicate allowlist or git-clean logic anywhere outside src/cleanup/.
- Do not call run_git_clean_with_excludes from cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree git binary resolution remains the future source for resolve_git_executable when available.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Checklist spans combine structure, helper behavior, and docs; this unit owns core module guardrails.
```

### M-044 - Cleanup Wrapper Config Wiring Checklist

```yaml
plan_unit_id: M-044
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup wrapper and config wiring must place cleanup settings in the run config snapshot, pass CleanupConfig explicitly through execution context, wrap CLI execution paths, and skip cleanup only when no intended project workspace exists.
gui_related: false
gui_classification_reason: The unit covers backend execution wiring and run-config propagation rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
- M-019
unblocks: []
acceptance_criteria:
- run_with_cleanup is a shared DRY wrapper or equivalent prepare/execute/cleanup sequence.
- CleanupConfig is included in the run config built from GuiConfig.
- IterationContext or equivalent carries cleanup_config explicitly.
- ExecutionEngine wraps direct CLI runner.execute with prepare and cleanup.
- Interview, start_chain, and app call sites use run_with_cleanup when they have a known project working directory.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_wrapper_config_wiring_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_wrapper_config_wiring_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0053
preserved_exact_tokens:
- run_with_cleanup(runner, request, config)
- IterationContext
- "cleanup_config: Option<CleanupConfig>"
- ExecutionEngine::execute_iteration
- runner.execute(request)
- execute_ai_turn
- current_dir()
- CLI-only
negative_constraints:
- Do not use a thread-local or global current run config when explicit passing is available.
- Do not run prepare/cleanup from app.rs when current_dir is not the intended project.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This checklist consumes Worktree Option B run-config wiring rather than owning it.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Execution wiring spans several call sites and should remain split_recommended.
```

### M-045 - Cleanup Tests Agent Output Evidence Checklist

```yaml
plan_unit_id: M-045
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must test protected excludes, define agent-output cleanup, and implement evidence pruning as a scheduled/manual path outside cleanup_after_execution.
gui_related: false
gui_classification_reason: The unit covers backend tests, storage paths, and evidence pruning implementation.
split_recommended: true
depends_on:
- M-006
- M-011
- M-012
- M-013
- M-014
- M-015
- M-016
- M-017
- M-019
unblocks: []
acceptance_criteria:
- Tests assert that cleanup excludes .puppet-master, progress.txt, AGENTS.md, prd.json, .gitignore, and sensitive patterns.
- AGENT_OUTPUT_SUBDIR and agent_output_dir are single-source cleanup data.
- Evidence pruning config includes retention_days, retain_last_runs, and prune_on_cleanup.
- prune_evidence_older_than runs from manual action or background, not cleanup_after_execution.
- The definition of run for retain_last_runs is resolved or retention_days is preferred until then.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_tests_output_evidence_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_tests_agent_output_evidence_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0056
preserved_exact_tokens:
- .puppet-master
- progress.txt
- AGENTS.md
- prd.json
- .gitignore
- AGENT_OUTPUT_SUBDIR
- agent_output_dir(base)
- prune_evidence_older_than(base_dir, config)
- retention_days
- retain_last_runs
- prune_on_cleanup
negative_constraints:
- Evidence pruning must not run from cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md and AGENTS.md own final documentation updates for state and evidence paths.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This checklist groups tests, agent-output, and evidence retention while preserving separate source lineage.
```

### M-046 - Cleanup UX Checklist

```yaml
plan_unit_id: M-046
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UX checklist implementation must wire Advanced and Doctor cleanup controls, tooltips/docs, platform-hook non-dependency notes, Shortcuts config surface, and Skills config surface through existing widgets.
gui_related: true
gui_classification_reason: The unit defines user-visible cleanup controls, Doctor mention, Config tabs, Shortcuts tab, and Skills tab.
split_recommended: true
depends_on:
- M-017
- M-020
- M-021
- M-025
- M-029
unblocks: []
acceptance_criteria:
- Advanced -> Workspace / Cleanup contains cleanup and evidence toggles wired into the shared run config.
- Clean workspace now appears on Doctor or Advanced with project-root resolution, optional all-worktrees handling, confirmation, and preview.
- Tooltips and docs preserve cleanup policy and platform-hook non-dependency.
- Shortcuts and Skills subsections or tabs are added under the selected config surface.
- Widget catalog scripts run after UI widget changes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_ux_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_ux_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0057
preserved_exact_tokens:
- Advanced -> Workspace / Cleanup
- Clean workspace now
- Doctor
- git clean -fd -n
- Config -> Advanced -> Workspace
- Config -> Shortcuts
- Skills subsection/tab
- generate-widget-catalog.sh
- check-widget-reuse.sh
negative_constraints:
- Manual Clean workspace must use prepare-style logic, not cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- UI surface details remain reconciled with FinalGUISpec and UI widget catalog ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: UX checklist spans cleanup, shortcuts, and skills surfaces.
```

### M-047 - Desktop Shortcuts Backend Checklist

```yaml
plan_unit_id: M-047
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Desktop Shortcuts backend checklist implementation must define ShortcutAction, KeyBinding, defaults, GuiConfig overrides, key-map rebuild, validation, no hardcoded bindings, config-failure fallback, and unit tests.
gui_related: true
gui_classification_reason: The unit governs backend behavior directly reflected in user-visible shortcut handling and Config UI.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
- M-028
unblocks: []
acceptance_criteria:
- ShortcutAction, KeyBinding, default_shortcuts, GuiConfig.shortcuts, build_key_map, and validate_shortcut_binding are implemented in order.
- Composer and prompt fields use the key map and do not hardcode bindings.
- Missing shortcuts config uses empty overrides.
- Invalid shortcuts config falls back to defaults, logs a warning, shows Shortcuts reset to defaults due to config error, and does not crash.
- Tests cover merge, validation, and round-trip behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_backend_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: desktop_shortcuts_backend_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0058
preserved_exact_tokens:
- ShortcutAction
- KeyBinding
- DRY:DATA:shortcut_actions
- DRY:DATA:default_shortcuts
- build_key_map(defaults, overrides) -> KeyMap
- DRY:FN:build_key_map
- validate_shortcut_binding
- Shortcuts reset to defaults due to config error
- Do not crash
negative_constraints:
- All key handling in composer and prompt fields uses the key map, with no hardcoded bindings.
- The app must not crash on invalid shortcuts config.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- M-026 and M-027 preserve the authoritative registry and error UX details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Checklist remains split_recommended because it combines implementation order and validation requirements.
```

### M-048 - Agent Skills Backend Checklist

```yaml
plan_unit_id: M-048
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Agent Skills backend checklist implementation must create the skills modules, canonical ordered discovery, frontmatter loading, wildcard permission resolution, safe CRUD, runner skill listing, and tests.
gui_related: false
gui_classification_reason: The unit covers backend skill discovery, loading, permissions, CRUD, runner integration, and tests.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-033
- M-035
unblocks: []
acceptance_criteria:
- src/skills or equivalent modules define discovery, frontmatter, and permissions.
- DRY:DATA:skill_search_paths records canonical project-first then global discovery order.
- discover_skills, load_skill, resolve_skill_permission, and list_skills_for_agent are DRY helpers.
- Create does not overwrite a directory containing SKILL.md.
- Runtime delivery follows canonical registry plus permission filter plus context bundling plus skill tool path.
- Tests cover discovery, frontmatter validation, name matching, wildcard/default permissions, and explicit-over-pattern precedence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_backend_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: agent_skills_backend_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0059
preserved_exact_tokens:
- src/skills/
- discovery.rs
- frontmatter.rs
- permissions.rs
- DRY:DATA:skill_search_paths
- .puppet-master/skills
- .claude/skills
- .agents/skills
- DRY:FN:discover_skills
- DRY:FN:load_skill
- DRY:FN:resolve_skill_permission
- DRY:FN:list_skills_for_agent
- explicit per-skill entry wins over pattern
negative_constraints:
- Creating a skill must not overwrite an existing SKILL.md.
- Provider-native formats remain interoperability inputs only.
compatibility_only_notes:
- Provider-native formats remain compatibility inputs, not MVP runtime-delivery owners.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md and Prompt_Pipeline.md retain runtime delivery authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Backend checklist spans modules, CRUD, runtime integration, and tests.
```

### M-049 - Shortcuts Enhancement Checklist

```yaml
plan_unit_id: M-049
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts enhancement checklist implementation must add config-load failure handling, export/import, search/filter, and shortcut discoverability helpers after the core shortcut backend is complete.
gui_related: true
gui_classification_reason: The unit defines user-visible Shortcuts export/import, filtering, labels, tooltips, and toasts.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
- M-028
- M-047
unblocks: []
acceptance_criteria:
- Config load failure handling is wired at app startup and when opening Config -> Shortcuts.
- Export and Import buttons use shared JSON helpers and validate imports before Replace or Merge.
- Search/filter matches action labels and shortcut strings with correct empty and no-match states.
- Shortcut labels or tooltips use a shared helper and stay synced with key-map changes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_enhancement_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_enhancement_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0060
preserved_exact_tokens:
- Config load failure (Shortcuts)
- Export...
- Import...
- export_shortcuts_to_json
- import_shortcuts_from_json
- Replace/Merge
- filter_shortcut_list
- No shortcuts match
- (Loading...)
negative_constraints:
- Invalid JSON or unsupported shortcut versions must be rejected before applying changes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Enhancements depend on the core Shortcuts registry and Config surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The checklist covers multiple user-facing shortcut enhancements.
```

### M-050 - Skills Enhancement Checklist

```yaml
plan_unit_id: M-050
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills enhancement checklist implementation must add sort/filter, last-modified display, preview, bulk permission, validate-all, create-no-overwrite, and concurrent-edit handling after the core Skills backend is complete.
gui_related: true
gui_classification_reason: The unit defines user-visible Skills enhancements, prompts, metadata, validation results, and editor conflict handling.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-037
- M-038
- M-039
- M-040
- M-041
- M-048
unblocks: []
acceptance_criteria:
- Sort/filter, last-modified display, preview, bulk permission, validate-all, create-no-overwrite, and concurrent-edit behavior are implemented in the documented order.
- Bulk permission persists GuiConfig.skill_permissions and documents explicit-over-pattern precedence.
- Validate all shows a full table with N OK, M errors and copyable errors.
- Existing SKILL.md directories are not overwritten.
- Concurrent edit handling preserves the File changed on disk. Reload / Overwrite / Cancel recommendation.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_enhancement_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_enhancement_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0060
preserved_exact_tokens:
- skills_list_sort
- "modified: Option<DateTime<Utc>>"
- Bulk permission
- Validate all
- N OK, M errors
- Create skill -- dir exists
- SKILL.md
- File changed on disk. Reload / Overwrite / Cancel
negative_constraints:
- Create new must not overwrite an existing skill containing SKILL.md.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md owns canonical skill semantics; this checklist preserves MiscPlan implementation sequencing.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Skills enhancements touch list, preview, persistence, validation, and editor state.
```

### M-051 - Pre-Completion Verification Checklist

```yaml
plan_unit_id: M-051
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup/Shortcuts/Skills implementation completion must run the AGENTS.md pre-completion checklist and update the Task Status Log when done.
gui_related: false
gui_classification_reason: The unit covers implementation verification workflow rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-043
- M-044
- M-045
- M-046
- M-047
- M-048
- M-049
- M-050
unblocks: []
acceptance_criteria:
- AGENTS.md pre-completion verification checklist is run for compile, DRY tagging, module organization, tests, and scope.
- Task Status Log is updated when done.
- The covered source span remains losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: precompletion_verification_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: precompletion_verification_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0061
preserved_exact_tokens:
- AGENTS.md Pre-Completion Verification Checklist
- compile
- DRY tagging
- module organization
- tests
- scope
- Task Status Log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- AGENTS.md owns the actual pre-completion checklist.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This verification step is narrow enough for a single unit.
```

### M-052 - Cleanup Risk Register

```yaml
plan_unit_id: M-052
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must account for over-aggressive clean, worktree path correctness, config wiring, evidence pruning timing, and no-secrets GitHub behavior as a risk register.
gui_related: true
gui_classification_reason: The unit includes cleanup UX/config risks and user-facing evidence or worktree consequences.
split_recommended: true
depends_on:
- M-006
- M-008
- M-011
- M-013
- M-017
- M-019
unblocks: []
acceptance_criteria:
- Conservative defaults and explicit allowlists mitigate git clean -fdx risk.
- work_dir is the actual worktree path when worktrees are used.
- Cleanup config is read from the same runtime config used by orchestrator.
- Evidence pruning avoids files for runs still writing evidence.
- Secrets are not force-added, logged, included in evidence, or included in PR bodies.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_risk_register_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_risk_register
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0062
preserved_exact_tokens:
- Over-aggressive clean
- git clean -fdx
- Worktree path
- Config wiring
- Evidence pruning
- Secrets to GitHub
negative_constraints:
- Never force-add ignored files.
- Never log or put tokens/keys in evidence or PR body.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Security constraints remain aligned with Architecture_Invariants and GitHub auth flows.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The risk register spans cleanup, storage, security, and GUI-visible config concerns.
```

### M-053 - Cleanup Signature Alignment Gap

```yaml
plan_unit_id: M-053
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must preserve the signature-alignment gap between REQUIREMENTS.md and the extended work_dir-aware cleanup_after_execution contract until the owner contract is reconciled.
gui_related: false
gui_classification_reason: The unit covers backend contract signatures and type alignment.
split_recommended: false
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- The REQUIREMENTS.md prepare_working_directory and cleanup_after_execution signatures remain traceable.
- The plan's work_dir-aware cleanup_after_execution extension is preserved.
- Path and PathBuf alignment is called out for consistency.
- The gap is an implementation/contract alignment issue, not a product-decision blocker for standardization.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_signature_alignment_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_signature_alignment_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0064
preserved_exact_tokens:
- REQUIREMENTS.md §26.2
- "prepare_working_directory(&self, path: &str)"
- "cleanup_after_execution(&self, pid: u32)"
- "work_dir: &Path"
- Path
- PathBuf
negative_constraints: []
compatibility_only_notes:
- REQUIREMENTS signatures are preserved as compatibility/source lineage until reconciled.
stale_retired_dispositions: []
owner_boundary_notes:
- REQUIREMENTS.md owns the original runner-contract wording.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Signature alignment is narrow enough for a single unit.
```

### M-054 - Root State Git Clean Excludes

```yaml
plan_unit_id: M-054
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Git clean exclusions must protect root-level state files, ignore rules, and sensitive files even when those files are untracked.
gui_related: false
gui_classification_reason: The unit covers backend cleanup safety and security allowlist behavior.
split_recommended: false
depends_on:
- M-006
- M-011
- M-012
unblocks: []
acceptance_criteria:
- progress.txt, AGENTS.md, prd.json, .gitignore, and sensitive patterns are excluded from git clean.
- The allowlist is implemented in DRY:DATA and consumed by run_git_clean_with_excludes.
- Cleanup does not rely on these files always being tracked.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: root_state_git_clean_excludes_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: root_state_git_clean_excludes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0065
preserved_exact_tokens:
- progress.txt
- AGENTS.md
- prd.json
- .gitignore
- DRY:DATA
- git clean -fd
negative_constraints:
- Root-level state files must not be removed just because they are untracked.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md owns state file definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Root state protection is a narrow cleanup safety unit.
```

### M-055 - Non-Git Prepare Policy

```yaml
plan_unit_id: M-055
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory must treat non-git or git-unavailable workspaces as best-effort cleanup cases that warn and continue instead of failing the iteration.
gui_related: false
gui_classification_reason: The unit covers backend prepare policy and runner error handling.
split_recommended: false
depends_on:
- M-013
unblocks: []
acceptance_criteria:
- git rev-parse --show-toplevel failure does not fail the iteration.
- "The app logs Prepare: not a git repo or git unavailable, skipping git clean."
- Optional non-git cleanup such as clearing agent-output may still run.
- prepare_working_directory returns Ok(()) for non-git skip cases.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_git_prepare_policy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: non_git_prepare_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0066
preserved_exact_tokens:
- git rev-parse --show-toplevel
- "Prepare: not a git repo or git unavailable, skipping git clean"
- Ok(())
- agent-output
negative_constraints:
- Non-git workspaces must not abort the iteration just because git clean cannot run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runner execution owns the actual warning/logging surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Non-git prepare behavior is narrow enough for one unit.
```

### M-056 - Prepare No Reset And WorkDir Source

```yaml
plan_unit_id: M-056
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory must avoid tracked-state reset by default and must use the same work_dir source as execution instead of arbitrary current_dir cleanup.
gui_related: false
gui_classification_reason: The unit covers backend workspace selection and cleanup semantics rather than visible GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-015
unblocks: []
acceptance_criteria:
- prepare_working_directory does not run git checkout -- . or git restore . unless a future documented config flag enables reset.
- Optional stash/reset behavior is deferred to a future explicit config with documented order.
- Orchestrator cleanup uses the selected lane or attempt worktree or config.project.working_directory.
- Non-orchestrator flows pass the execution working_dir or skip cleanup when the intended workspace is unknown.
- std::env::current_dir() is avoided unless it is the intended workspace.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_reset_workdir_source_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_no_reset_workdir_source
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0068
preserved_exact_tokens:
- git checkout -- .
- git restore .
- git stash
- stash -> prepare (reset if enabled) -> run -> cleanup -> stash pop (optional)
- get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)
- std::env::current_dir()
- config.project.working_directory
negative_constraints:
- prepare_working_directory must not reset tracked state by default.
- Cleanup must not use current_dir unless it is the intended workspace.
compatibility_only_notes:
- get_tier_worktree and tier_id remain legacy-named compatibility inputs.
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns canonical lane/worktree selection semantics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit combines reset policy and work_dir selection, both sharing prepare safety.
```

### M-057 - Git Clean Exclude Helper Contract

```yaml
plan_unit_id: M-057
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: run_git_clean_with_excludes must build git clean commands from the single allowlist data source using explicit -e patterns and tests that excluded paths are never removed.
gui_related: false
gui_classification_reason: The unit covers backend git-clean command construction and security invariant compliance.
split_recommended: false
depends_on:
- M-011
- M-012
unblocks: []
acceptance_criteria:
- The helper uses one -e flag per exclude pattern.
- Exact cleanup exclude patterns are documented in cleanup_exclude_patterns or CLEANUP_EXCLUDE_PATTERNS.
- Tests verify excluded paths are never removed.
- INV-002 and no_secrets_in_storage ContractRef remains traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: git_clean_exclude_helper_contract_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: git_clean_exclude_helper_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0069
preserved_exact_tokens:
- git clean -fd -e <pattern>
- -e
- DRY:FN:run_git_clean_with_excludes
- DRY:DATA
- CLEANUP_EXCLUDE_PATTERNS
negative_constraints:
- Exclude patterns must not be hardcoded at call sites.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md owns the no-secrets invariant.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The helper contract is narrow enough for a single unit.
```

### M-058 - Evidence Run Definition Gap

```yaml
plan_unit_id: M-058
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence retain_last_runs behavior must not be relied on until run is defined for iteration, subtask, task, global, node, lane, or attempt lineage; retention_days is preferred until then.
gui_related: false
gui_classification_reason: The unit covers backend retention semantics and documentation rather than visible GUI.
split_recommended: false
depends_on:
- M-017
- M-019
unblocks: []
acceptance_criteria:
- The meaning of run for evidence.retain_last_runs is defined before run-based pruning is used.
- Evidence path or iteration log inference is documented if retain_last_runs is implemented.
- retention_days remains the preferred policy until run is well-defined.
- Current run, node, lane, or attempt lineage evidence is not pruned by ambiguity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_run_definition_gap
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_run_definition_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0070
preserved_exact_tokens:
- evidence.retain_last_runs
- run
- iteration
- subtask
- task
- global
- retention_days
negative_constraints:
- Do not use retain_last_runs pruning without defining what counts as a run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- storage-plan.md and evidence docs own final run/evidence lineage definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The gap is narrow and documented as implementation-readiness.
```

### M-059 - Manual Clean Worktrees Dry Run Preview

```yaml
plan_unit_id: M-059
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Manual Clean workspace may clean all active worktrees only through the canonical worktree list and should offer an optional dry-run preview using git clean -fd -n.
gui_related: true
gui_classification_reason: The unit defines user-visible manual cleanup worktree scope and preview behavior.
split_recommended: true
depends_on:
- M-012
- M-021
unblocks: []
acceptance_criteria:
- Clean all active worktrees uses worktree_manager, active_worktrees, or equivalent canonical state.
- If orchestrator state is unavailable, the action cleans only the main workspace or disables all-worktrees mode.
- Preview or Dry run can list paths from git clean -fd -n before confirmation.
- Preview is optional but must explain what would be removed if implemented.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: manual_clean_worktrees_preview_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: manual_clean_worktrees_dry_run_preview
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0071
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0072
preserved_exact_tokens:
- Clean workspace now
- all active worktrees
- worktree_manager
- active_worktrees
- Preview
- Dry run
- git clean -fd -n
negative_constraints:
- All-worktrees cleanup must not invent a worktree list outside canonical state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns worktree list persistence and repopulation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Manual clean worktree scope and preview are related user-facing safety features.
```

### M-060 - Prepare Failure Worktree Race Limits

```yaml
plan_unit_id: M-060
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup is best-effort on prepare failures, harmless for absent .puppet-master directories in worktrees, and explicitly limited for concurrent runs or shared workspaces.
gui_related: false
gui_classification_reason: The unit covers backend cleanup failure policy, worktree path behavior, and concurrency limits.
split_recommended: true
depends_on:
- M-008
- M-013
- M-014
unblocks: []
acceptance_criteria:
- prepare_working_directory errors are logged and execution continues.
- run_with_cleanup catches prepare errors and proceeds to runner.execute.
- Worktree cleanup runs in the worktree root and .puppet-master exclusions are harmless when absent.
- Concurrent cleanup races are acknowledged as out of scope or best-effort for v1.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_failure_worktree_race_limits
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_failure_worktree_race_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0073
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0075
preserved_exact_tokens:
- Best-effort
- run_with_cleanup
- runner.execute(request)
- .puppet-master/
- "Optional: concurrent runs"
- out of scope for v1
negative_constraints:
- Prepare failures must not abort the iteration.
compatibility_only_notes:
- Concurrent-run locking is not part of v1 cleanup unless later explicitly planned.
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree cleanup semantics apply per directory.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Failure, worktree, and race concerns remain separable implementation risks.
```

### M-061 - Cleanup After Execution No Broad Clean

```yaml
plan_unit_id: M-061
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: cleanup_after_execution must never run broad git clean on untracked workspace files because it runs before orchestrator commit and would delete current iteration output.
gui_related: false
gui_classification_reason: The unit covers backend execution ordering and cleanup semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- cleanup_after_execution only kills or terminates processes, cleans runner temp files, and optionally removes known build-artifact dirs.
- Full workspace untracked cleanup runs only in prepare_working_directory before the run.
- Current iteration source/docs remain available for orchestrator staging and commit.
- The legacy/current plan wording about cleanup_after_execution running git clean is preserved as compatibility lineage but superseded.
- INV-002 and no_secrets_in_storage ContractRef remains traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_after_execution_broad_clean_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_after_execution_no_broad_clean
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0076
preserved_exact_tokens:
- cleanup_after_execution
- git clean -fd
- run_with_cleanup
- prepare -> execute -> cleanup
- commit_tier_progress
- runner temp files
- known build-artifact dirs
- target/
- prepare_working_directory
negative_constraints:
- Do not run broad git clean -fd in cleanup_after_execution.
- cleanup_after_execution must never remove untracked source or docs.
compatibility_only_notes:
- The old cleanup_after_execution workspace-clean wording is superseded by prepare-only broad cleanup.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator commit ordering remains owned by orchestrator execution docs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The critical ordering fix is narrow and should remain independently addressable.
```

### M-062 - Output Location Allowlist Boundary

```yaml
plan_unit_id: M-062
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Interview, start-chain, wizard, and orchestrator outputs must stay under .puppet-master or be explicitly allowlisted so cleanup never removes canonical or current-iteration output.
gui_related: false
gui_classification_reason: The unit covers backend output path safety and cleanup allowlist behavior.
split_recommended: true
depends_on:
- M-006
- M-011
- M-016
- M-061
unblocks: []
acceptance_criteria:
- Interview output_dir and research output stay under .puppet-master/interview and .puppet-master/research.
- Start-chain and wizard outputs stay under .puppet-master/start-chain or another allowlisted path.
- Orchestrator unit plans stay under .puppet-master/plans.
- Any designed project-root output must be allowlisted or broad cleanup skipped for that flow.
- Current-iteration output is not deleted after execution.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: output_location_allowlist_boundary
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: output_location_allowlist_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0077
preserved_exact_tokens:
- .puppet-master/interview/
- .puppet-master/research/
- .puppet-master/start-chain/
- tier-plan.md
- .puppet-master/plans/
- PLAN.md
- REQUIREMENTS.md
negative_constraints:
- If interview writes final output to project root, that path must be allowlisted or broad cleanup skipped.
compatibility_only_notes:
- tier-plan.md is preserved as legacy-named source lineage.
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md owns canonical state/output path definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Output path constraints span multiple flows and owner docs.
```

### M-063 - Cleanup Clarifications And Explicit Config

```yaml
plan_unit_id: M-063
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup clarification gaps must preserve prd.json protection, prepare-only cleanup toggles, prepare-style manual clean, cleanup_after_execution temp-only behavior, and explicit cleanup_config passing.
gui_related: true
gui_classification_reason: The unit includes GUI cleanup toggles, manual cleanup action behavior, and runtime config projection.
split_recommended: true
depends_on:
- M-021
- M-044
- M-061
unblocks: []
acceptance_criteria:
- prd.json remains excluded by cleanup allowlist and run_git_clean_with_excludes.
- cleanup.untracked controls prepare_working_directory before each run, not cleanup_after_execution.
- Manual Clean workspace invokes prepare-style git clean with excludes.
- Checklist wording that mentions workspace cleanup after execution is interpreted as runner temp and optional build-artifact cleanup only.
- cleanup_config is passed explicitly through IterationContext or equivalent and default behavior is documented.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_clarification_config_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_clarifications_explicit_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0078
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0079
preserved_exact_tokens:
- prd.json
- cleanup.untracked
- before each run
- prepare_working_directory
- cleanup_after_execution
- run_git_clean_with_excludes
- "cleanup_config: Option<CleanupConfig>"
- unwrap_or_default()
- 'CleanupConfig { untracked: true, clean_ignored: false, clear_agent_output: false, remove_build_artifacts: false }'
negative_constraints:
- cleanup_after_execution must not run workspace cleanup with excludes.
- A global current run config is not recommended.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree Option B owns the run-config construction pattern consumed here.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Clarifications span GUI, manual clean, and execution config.
```

### M-064 - SDK Fallback Retired Disposition

```yaml
plan_unit_id: M-064
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The prior execute_with_sdk_fallback cleanup gap is preserved as resolved, struck compatibility lineage because execution is now always CLI via runner.execute.
gui_related: false
gui_classification_reason: The unit records backend execution history and retired SDK fallback wording.
split_recommended: false
depends_on:
- M-044
unblocks: []
acceptance_criteria:
- Struck text for execute_with_sdk_fallback remains traceable as resolved history.
- Current state states execute_iteration calls runner.execute directly and prepare/cleanup wrap it.
- run_with_cleanup remains for call sites that call runner.execute directly.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: sdk_fallback_retired_lineage_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: sdk_fallback_retired_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0080
preserved_exact_tokens:
- execute_with_sdk_fallback
- SDK removed
- always CLI
- runner.execute()
- try_execute_with_sdk(request)
- Current state
negative_constraints: []
compatibility_only_notes:
- The SDK fallback gap is resolved and retained only as historical compatibility/source lineage.
stale_retired_dispositions:
- execute_with_sdk_fallback has been removed.
owner_boundary_notes:
- Executor docs own current execution path details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This retired gap is narrow enough for a compatibility disposition.
```

### M-065 - Execution-Affecting GUI Runtime Projection

```yaml
plan_unit_id: M-065
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Execution-affecting GUI settings must be projected into the Option B runtime config snapshot at run start and must not remain GUI-only state.
gui_related: true
gui_classification_reason: The unit governs user-visible GUI settings that alter runtime behavior.
split_recommended: true
depends_on:
- M-019
unblocks: []
acceptance_criteria:
- Interview question-limit settings, architecture-confirmation settings, vision-provider settings, HITL toggles, and orchestrator execution-affecting settings are projected into runtime config.
- GUI-visible but runtime-ignored execution settings are treated as defects.
- MiscPlan summarizes these requirements by ContractRef to owner SSOTs instead of restating open-ended wire-later status.
- Worktree, orchestrator, interview, and HITL ContractRefs remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_runtime_projection_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: execution_affecting_gui_runtime_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0081
preserved_exact_tokens:
- Execution-affecting GUI settings must not remain GUI-only state.
- Option B runtime config construction
- interview question-limit settings
- HITL phase/task/subtask/iteration toggles
- GUI-visible but runtime-ignored fields are defects
negative_constraints:
- GUI-visible execution-affecting settings must not remain runtime-ignored.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md, orchestrator-subagent-integration.md, interview-subagent-integration.md, and human-in-the-loop.md remain owner SSOTs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md'
split_recommendation_reason: This GUI runtime projection rule touches multiple owner docs.
```

### M-066 - Shortcut Gap Guards

```yaml
plan_unit_id: M-066
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut gap guards must preserve startup/config failure recovery, duplicate-binding rejection recommendation, export/import versioning, and unloaded-key-map tooltip behavior.
gui_related: true
gui_classification_reason: The unit defines user-visible shortcut toasts, tooltips, import errors, and conflict behavior.
split_recommended: false
depends_on:
- M-027
- M-028
- M-047
unblocks: []
acceptance_criteria:
- Corrupted or invalid shortcut config never crashes the app and falls back to defaults with the required toast.
- New shortcut conflicts are rejected with Already used by &lt;ActionName&gt; unless implementation intentionally selects another documented resolution.
- Export JSON includes version and unsupported imports are rejected clearly.
- Unloaded key maps show action label only or (Loading...) and never blank or (undefined).
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_gap_guard_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_gap_guards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0082
preserved_exact_tokens:
- Shortcuts reset to defaults due to config error
- Already used by &lt;ActionName&gt;
- version
- unsupported version
- STATE_FILES.md
- (Loading...)
- (undefined)
negative_constraints:
- The app must not crash when shortcuts config is corrupted or invalid.
- The UI must never show blank or (undefined) shortcut labels.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Core shortcut registry behavior remains covered by M-026 and M-047.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Gap guards are a coherent shortcut safety cluster.
```

### M-067 - Skills Runtime Compatibility Boundary

```yaml
plan_unit_id: M-067
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills runtime behavior is PM-native registry discovery, permission filtering, readiness validation, context bundling, and on-demand skill tool access; CLI/provider-native projections are compatibility-only.
gui_related: false
gui_classification_reason: The unit covers runtime skill delivery and provider compatibility boundaries.
split_recommended: true
depends_on:
- M-033
- M-035
- M-048
unblocks: []
acceptance_criteria:
- Direct providers consume PM-native skill bundling and PM tool availability.
- CLI-bridged providers may receive compatibility projections only when explicitly enabled.
- Runtime correctness still depends on PM-native bundling plus the PM skill tool.
- OpenCode server-bridged providers remain subject to the same PM-native skill canon.
- Skills_System, FileSafe, Tools, Prompt_Pipeline, CLI_Bridged_Providers, Provider_OpenCode, and Multi-Account ContractRefs remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_runtime_compatibility_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_runtime_compatibility_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0083
preserved_exact_tokens:
- registry discovery
- permission filtering
- readiness validation
- context bundling
- on-demand `skill` tool access
- provider-native skill runtime-delivery matrix
- CLI-bridged providers
- PM-native bundling plus the PM `skill` tool
- OpenCode
negative_constraints:
- Do not invent a separate provider-native skill runtime-delivery matrix for MVP.
compatibility_only_notes:
- CLI-bridged provider projections are compatibility-only and optional.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, Prompt_Pipeline.md, Tools.md, FileSafe.md, CLI_Bridged_Providers.md, Provider_OpenCode.md, and Multi-Account.md retain authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md'
split_recommendation_reason: Runtime compatibility spans multiple provider owner docs.
```

### M-068 - Shortcuts Skills Implementation Risks

```yaml
plan_unit_id: M-068
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts and Skills implementation planning must explicitly confirm Slint 1.17.1 or current-stable key-event integration, Windows path-case behavior for skill discovery, and platform_specs skill injection per provider.
gui_related: true
gui_classification_reason: The unit affects GUI key handling, Skills list behavior, and provider-visible skill integration.
split_recommended: true
depends_on:
- M-047
- M-048
unblocks: []
acceptance_criteria:
- Slint key-event capture location and KeyMap application are confirmed against Slint 1.17.1 or current stable docs before implementation.
- Skill discovery handles Windows path case and separators as needed.
- platform_specs or equivalent documents how each provider receives skill list, paths, content, environment, prompt injection, or tools.
- list_skills_for_agent remains stubbed until platform-specific delivery is defined.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_skills_implementation_risk_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_skills_implementation_risks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0084
preserved_exact_tokens:
- Slint 1.17.1
- FocusScope
- KeyEvent
- Windows path case
- platform_specs skill injection
- Cursor
- Claude Code
- OpenCode
- Codex
- GitHub Copilot
- Gemini
negative_constraints: []
compatibility_only_notes:
- Provider skill injection remains stubbed until platform_specs or equivalent defines delivery.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider docs and platform_specs own provider-specific delivery details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Risks span GUI framework, OS filesystem behavior, and provider integration.
```

### M-069 - Cross-Plan Cleanup Owner Boundaries

```yaml
plan_unit_id: M-069
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cross-plan cleanup reconciliation must preserve owner boundaries for FileSafe, Worktree, newtools, Contracts, Crosswalk, Executor, Orchestrator, command aliases, package lanes, safe-points, historical lineage, and stale tier-era terminology.
gui_related: true
gui_classification_reason: The unit includes user-visible route/open cleanup, Source Control, help/search surfaces, and orchestrator tab/page retargeting.
split_recommended: true
depends_on:
- M-006
- M-008
- M-011
- M-022
- M-061
unblocks: []
acceptance_criteria:
- Cleanup scope remains package/lane/worktree aware and cannot erase another package's live artifacts.
- FileSafe write-scope rules remain package-scoped.
- Export/archive status alone does not authorize deletion of canonical historical record or worktree lineage.
- Route/open cleanup respects Contracts_V0, Crosswalk, FileManager, and command-catalog ownership.
- Tier language remains legacy decomposition/help compatibility terminology.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_plan_cleanup_owner_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cross_plan_cleanup_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0085
preserved_exact_tokens:
- /FileSafe.md
- /WorktreeGitImprovement.md
- /newtools.md
- /Contracts_V0.md
- /Crosswalk.md
- /packages/graph
- /alias
- /worktree
- /historical
- /block/runtime-lineage
- /effective/runtime
- Tier language is legacy decomposition/help terminology.
negative_constraints:
- Per-subtask /worktree cleanup must not conflict with package-based lane pools.
- Export or archival status alone must not authorize deletion of canonical /historical record model or /worktree lineage.
compatibility_only_notes:
- Tier IDs and /request-era or tier-era state file names remain compatibility inputs only.
stale_retired_dispositions:
- Alias, deprecated command, and cleanup-command drift notes are retained as source-lineage reconciliation warnings.
owner_boundary_notes:
- Referenced owner docs retain their contract authority; MiscPlan records cleanup reconciliation constraints.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span maps many owner boundaries and stale terminology constraints.
```

### M-070 - Worktree Cleanup Dependency Distinction

```yaml
plan_unit_id: M-070
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: MiscPlan cleanup must distinguish inside-workspace git clean from Worktree plan directory removal, while sharing run-config wiring, git binary resolution, worktree lists, and STATE_FILES updates.
gui_related: true
gui_classification_reason: The unit covers user-visible worktree cleanup controls and Doctor/Config interactions.
split_recommended: true
depends_on:
- M-012
- M-019
- M-021
- M-069
unblocks: []
acceptance_criteria:
- Cleanup config uses the same Option B config shape that the Worktree plan uses.
- run_git_clean_with_excludes uses path_utils::resolve_git_executable or the shared git binary resolver once available.
- Clean all worktrees uses reliable worktree list state after or with Worktree Phase 2.
- Worktree remove_worktree and cleanup_subtask_worktree remove directories, while MiscPlan cleanup removes untracked/ignored files inside the selected workspace or worktree.
- STATE_FILES updates stay in their own subsections.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_cleanup_dependency_distinction_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: worktree_cleanup_dependency_distinction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0086
preserved_exact_tokens:
- WorktreeGitImprovement.md
- Option B
- path_utils::resolve_git_executable()
- run_git_clean_with_excludes
- worktree_manager.list_worktrees()
- active_worktrees
- cleanup_subtask_worktree
- remove_worktree
- STATE_FILES.md
negative_constraints:
- Do not use Command::new("git") alone when shared git resolution is available.
- Do not confuse removing a worktree directory with cleaning untracked files inside a worktree.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md owns worktree directory lifecycle and active worktree state.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit crosses config, git resolution, worktree lists, and cleanup semantics.
```

### M-071 - Orchestrator Cleanup Wrapper Boundary

```yaml
plan_unit_id: M-071
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Orchestrator agent runs, including future subagent execution paths, must use the shared prepare-execute-cleanup wrapper while preserving start/end verification ordering, parallel worktree isolation, and commit-order safety.
gui_related: false
gui_classification_reason: The unit covers backend orchestrator execution ordering and runner invocation.
split_recommended: true
depends_on:
- M-015
- M-044
- M-061
- M-070
unblocks: []
acceptance_criteria:
- New orchestrator or subagent execution paths do not call runner.execute directly without prepare/cleanup wrapping.
- verify_tier_start and verify_tier_end compatibility ordering remains outside iteration-level prepare/cleanup.
- Parallel subtasks run cleanup only in their own work_dir.
- cleanup_after_execution remains temp/build-artifact-only because commit_tier_progress happens later.
- Orchestrator plan remains a consumer and not a competing execution owner for cleanup semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_cleanup_wrapper_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: orchestrator_cleanup_wrapper_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0087
preserved_exact_tokens:
- execute_tier_with_subagents
- run_with_cleanup
- runner.execute()
- verify_tier_start
- verify_tier_end
- prepare_working_directory
- cleanup_after_execution
- commit_tier_progress
negative_constraints:
- Do not call runner.execute directly from new orchestrator/subagent code without the cleanup wrapper.
- cleanup_after_execution must not remove untracked files before commit_tier_progress.
compatibility_only_notes:
- verify_tier_start, verify_tier_end, and commit_tier_progress are legacy-named compatibility lineage.
stale_retired_dispositions: []
owner_boundary_notes:
- orchestrator-subagent-integration.md consumes cleanup wrapper semantics and owns orchestrator-specific invocation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Orchestrator cleanup boundary spans verification, parallel execution, and commit ordering.
```

### M-072 - Interview Cleanup Wrapper Boundary

```yaml
plan_unit_id: M-072
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Interview runner and subagent invocation paths must use run_with_cleanup when they execute in a project workspace, and their generated output paths must remain under .puppet-master or allowlisted.
gui_related: false
gui_classification_reason: The unit covers backend interview execution and output path safety rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-015
- M-044
- M-062
unblocks: []
acceptance_criteria:
- research_pre_question_with_subagent and similar interview runner calls use run_with_cleanup.
- SubagentInvoker or equivalent platform invocation helpers centralize on the same wrapper.
- Interview, research, start-chain, wizard, and orchestrator outputs stay under .puppet-master or are explicitly allowlisted.
- Interview and orchestrator plan output paths remain safe from cleanup removal.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_cleanup_wrapper_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: interview_cleanup_wrapper_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0088
preserved_exact_tokens:
- research_pre_question_with_subagent
- runner.execute(&request)
- run_with_cleanup
- SubagentInvoker
- .puppet-master/interview/
- .puppet-master/research/
- .puppet-master/start-chain/
- .puppet-master/plans/
negative_constraints:
- Interview and subagent platform runs must not bypass cleanup wrapping when a project working directory is known.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- interview-subagent-integration.md owns interview-specific subagent invocation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Interview wrapper behavior spans runner calls, subagent invocation, and output allowlist boundaries.
```

### M-073 - Runner Output Process Isolation And Agent Output Policy

```yaml
plan_unit_id: M-073
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Runner and cleanup paths must honor Plans/newfeatures.md §13 bounded subprocess output buffers, separate CLI process execution, and .puppet-master/agent-output/{run-id}/ preservation or clearing only by cleanup policy.
gui_related: false
gui_classification_reason: The unit covers backend runner process isolation, subprocess output buffering, and agent-output cleanup policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-015
- M-016
- M-062
unblocks: []
acceptance_criteria:
- Runner, cleanup, headless, and stream-consumer subprocess output uses bounded buffers with fixed max size and drop-oldest behavior.
- CLI execution remains in a separate process.
- Background agent output at .puppet-master/agent-output/{run-id}/ is allowlisted or cleared only by explicit cleanup policy.
- AGENTS.md documentation remains aligned with the bounded-buffer and process-isolation requirements.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runner_output_cleanup_policy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: runner_output_process_isolation_agent_output_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0089
preserved_exact_tokens:
- Plans/newfeatures.md §13
- Bounded buffers and process isolation
- bounded buffers
- fixed max size
- drop oldest
- separate process
- ".puppet-master/agent-output/{run-id}/"
- Background/async agents
- "agent output"
negative_constraints:
- Subprocess stdout or stderr must not accumulate unbounded buffers.
- Cleanup must not erase background run output except through explicit agent-output cleanup policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/newfeatures.md owns bounded-buffer, background-agent-output, and process-isolation canon; MiscPlan consumes those constraints for cleanup and runner paths.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Runner output policy and agent-output cleanup interaction are narrow enough for one backend unit.
```

### M-074 - Cleanup Crew Coordination Boundary

```yaml
plan_unit_id: M-074
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup crews, when used, are optional overlays made of PM child runs; coordination uses explicit shared state and crew-board messages rather than hidden memory files or active-agent side files.
gui_related: false
gui_classification_reason: The unit covers runtime coordination and child-run state rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-069
- M-071
unblocks: []
acceptance_criteria:
- Cleanup crews are optional overlays and not a separate persistent actor system.
- Cleanup crew members remain PM child runs.
- Cleanup crew coordination uses explicit shared state and crew-board messages when enabled.
- Hidden memory files and active-agent side files are not canonical cleanup coordination state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_crew_coordination_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_crew_coordination_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0091
preserved_exact_tokens:
- Cleanup-operation crews
- cleanup crews are optional overlays
- PM child runs
- crew-board messages
- hidden memory files
- active-agent side files
- canonical cleanup coordination state
negative_constraints:
- Hidden memory files and active-agent side files are not canonical cleanup coordination state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator, storage, assistant-memory, Contracts, Prompt Pipeline, and Worktree owner docs retain authority for their referenced coordination and state contracts.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: Cleanup crew coordination is a coherent runtime boundary.
```

### M-075 - Cleanup Blocked Lifecycle And Continuity Contracts

```yaml
plan_unit_id: M-075
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup lifecycle and quality features use canonical child-run, blocked-state, permission, retry, reroute, cancellation, lineage, and handoff reconstruction contracts.
gui_related: false
gui_classification_reason: The unit covers backend lifecycle, permission, state, and handoff contracts rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-069
- M-074
unblocks: []
acceptance_criteria:
- Blocked cleanup actions use canonical blocked_reason_code and allowed_action_ids[].
- Cleanup retries, reroutes, and cancellation preserve canonical lineage.
- Cleanup continuity comes from canonical state and handoff reconstruction.
- Cleanup continuity does not rely on child-memory files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_lifecycle_continuity_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_blocked_lifecycle_continuity_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0092
preserved_exact_tokens:
- Cleanup lifecycle and quality features
- canonical child-run and blocked-state contracts
- blocked_reason_code
- "allowed_action_ids[]"
- cleanup retries
- reroutes
- cancellation
- canonical lineage
- handoff reconstruction
- child-memory files
negative_constraints:
- Cleanup continuity must not come from child-memory files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts, Permissions, storage, Prompt Pipeline, assistant-memory, and Tools owner docs retain authority for the concrete state shapes and handoff contracts.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Cleanup lifecycle and continuity form one contract-consumer boundary.
```

### M-076 - Safe-Point And Remediation Cleanup Preservation

```yaml
plan_unit_id: M-076
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Runner cleanup must preserve safe-point, remediation, blocked, retry, attempt, lane, worktree, evidence, and recovery lineage until terminal or superseded resolution.
gui_related: false
gui_classification_reason: The unit covers runtime recovery, state retention, and cleanup boundaries rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
- M-017
- M-058
- M-061
- M-069
unblocks: []
acceptance_criteria:
- prepare and cleanup logic does not erase or invalidate the baseline needed for retry_from_safe_point.
- Safe-point and remediation lineage metadata remain until the originating lineage reaches terminal or superseded resolution.
- Cleanup may compact derived summaries but does not destroy canonical history needed for recovery explanation and audit.
- Live cleanup never erases run, lane, or worktree lineage from History, Ledger, graph-linked inspection, or lane/worktree records.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: safe_point_remediation_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: safe_point_remediation_cleanup_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0097
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0098
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0099
preserved_exact_tokens:
- Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)
- retry_from_safe_point
- safe-point metadata
- remediation lineage
- blocked/remediation states
- cleanup_eligible
- History
- Ledger
- graph-linked inspection
- lane/worktree records
- Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)
- canonical history needed for recovery explanation and audit
negative_constraints:
- Prepare or cleanup logic must not erase or invalidate the baseline needed for retry_from_safe_point.
- Temporary cleanup behavior must not collapse blocked or remediation states into generic failure cleanup.
- Cleanup must not destroy the canonical history needed for recovery explanation and audit.
compatibility_only_notes:
- Cleanup artifact boundaries are node-level, not tier-scoped.
- Tier-era state file names such as progress.txt, AGENTS.md, and prd.json are compatibility inputs for cleanup, not canonical scoping anchors.
stale_retired_dispositions:
- tier_id no longer teaches a canonical cleanup scope anchor.
owner_boundary_notes:
- Storage and runtime contracts own persisted recovery, safe-point, remediation, attempt, lane, and evidence schemas.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Safe-point preservation spans runtime, storage, lane, evidence, and cleanup concepts and should remain split_recommended for implementation planning.
```

### M-077 - Cleanup Lane Lifecycle And User Action Separation

```yaml
plan_unit_id: M-077
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UI and action semantics must keep lane lifecycle verbs and cleanup commands distinct so recover, archive, prune, remove, and Clean all worktrees cannot blur together.
gui_related: true
gui_classification_reason: The unit defines user-visible cleanup actions, labels, sorting/grouping, lane lifecycle verbs, and command routing.
split_recommended: true
depends_on:
- M-021
- M-059
- M-069
- M-070
- M-076
unblocks: []
acceptance_criteria:
- retained, cleanup_eligible, archived, removed, and revoked states remain semantically separate.
- Prune and recover actions do not imply remove.
- Clean all worktrees does not blur with recover, archive, prune, or remove lifecycle verbs.
- Cleanup command payloads with generic page filters are constrained by native-surface ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_lifecycle_action_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_lane_lifecycle_user_action_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0097
preserved_exact_tokens:
- retained
- cleanup_eligible
- archived
- removed
- revoked
- recover, archive, prune, remove
- Clean all worktrees
- Seams
- History
- Ledger
- "page: string"
- route/open
- cleanup commands
negative_constraints:
- Cleanup action labels must not imply stronger lifecycle transitions than the selected action.
- Cleanup command payloads with generic page filters must not undermine route/open or cleanup-command ownership.
compatibility_only_notes:
- Tier IDs and tier-era files remain compatibility inputs only.
stale_retired_dispositions:
- tier_id no longer teaches a canonical cleanup scope anchor.
owner_boundary_notes:
- Command catalog, routing, Source Control, Orchestrator, and cleanup owner docs constrain concrete payload shapes and native-surface ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Lane lifecycle, UI action labeling, sorting, and command routing are related but implementation-spanning concerns.
```

### M-078 - Debug Investigation Restore-Point And Scope Tracking

```yaml
plan_unit_id: M-078
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Temporary debug instrumentation requires a restore point, instrumentation_id, declared scope, and explicit cleanup obligation before invasive temporary mutation.
gui_related: false
gui_classification_reason: The unit covers runtime debug mutation safety, restore-point coverage, and cleanup obligation tracking rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-076
unblocks: []
acceptance_criteria:
- Before invasive instrumentation or temporary dependency/tooling changes, PM creates or updates a runtime_artifact.restore_point sufficient to revert the temporary state if cleanup fails.
- Every temporary debug mutation lane carries an instrumentation_id, declared scope, and explicit cleanup obligation.
- Cleanup accounts for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes.
- Invasive instrumentation does not proceed without rollback coverage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_restore_point_scope_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_investigation_restore_point_scope_tracking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0100
preserved_exact_tokens:
- Debug investigation instrumentation cleanup addendum (2026-03-23)
- runtime_artifact.restore_point
- instrumentation_id
- declared scope
- explicit cleanup obligation
- temporary env flags
- dev dependencies
- remote host installs
- browser mocks
- reversible debug-only changes
negative_constraints:
- PM must not apply invasive temporary instrumentation without rollback coverage.
compatibility_only_notes:
- Cursor-like Debug Mode remains an investigation workflow reference, not automatic MVP scope.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime artifact storage owns restore-point persistence; MiscPlan records cleanup and rollback obligations.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Restore-point and scope tracking are a discrete debug cleanup precondition.
```

### M-079 - Temporary Instrumentation Pipeline Lifecycle

```yaml
plan_unit_id: M-079
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Instrumentation-first debug behavior is not grounded MVP behavior until the temporary-instrumentation patch pipeline declares lifecycle, collector state, evidence sink, cleanup, rollback, and failed-cleanup semantics.
gui_related: false
gui_classification_reason: The unit covers backend debug pipeline lifecycle, evidence, cleanup, and rollback contracts rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-078
unblocks: []
acceptance_criteria:
- Temporary-instrumentation patch pipeline declares an instrumentation_id, collector_state, install/collect/remove sequence, debug-specific mutation rules, evidence sink contract, and explicit write cleanup/rollback semantics.
- Resolved, cancelled, and superseded investigations attempt cleanup automatically.
- Failed residue uses lifecycle failed_cleanup with stop_reason_code = investigation.cleanup_failed.
- Instrumentation-first behavior is not treated as grounded MVP behavior until this contract exists.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: temporary_instrumentation_lifecycle_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: temporary_instrumentation_pipeline_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- Investigation instrumentation lifecycle contract
- Instrumentation-first behavior is not grounded MVP behavior
- temporary-instrumentation patch pipeline
- instrumentation_id
- collector_state
- collector-state
- install/collect/remove
- evidence sink contract
- "/cleanup/rollback"
- failed_cleanup
- stop_reason_code = investigation.cleanup_failed
negative_constraints:
- Instrumentation-first behavior must not be treated as grounded MVP behavior until this contract is implemented.
compatibility_only_notes:
- blog-sourced Cursor-like behavior is hypothesis-first reference behavior only.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime, evidence, storage, assistant-chat, and GitHub integration owner docs retain authority for concrete storage, evidence, and export mechanics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Temporary instrumentation lifecycle spans collector state, mutation rules, evidence, cleanup, rollback, and failed residue semantics.
```

### M-080 - Debug Cleanup Residue Visibility And Bundle Records

```yaml
plan_unit_id: M-080
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Debug cleanup is per scope and instrumentation lane; bundle records carry cleanup summary, residual items, stop reason, surviving residue, and user-visible unresolved remnants.
gui_related: true
gui_classification_reason: The unit requires unresolved instrumentation remnants and residue to remain user-visible while preserving backend cleanup bundle state.
split_recommended: false
depends_on:
- M-078
- M-079
unblocks: []
acceptance_criteria:
- Cleanup is per scope and per instrumentation lane, not just per investigation.
- Bundle records carry cleanup_summary, cleanup_summary.residual_items[] or residual_items, stop_reason_code, and surviving residue.
- Cleanup state transitions use superseded when one owner supersedes another.
- PM does not allow two active investigations to add overlapping temporary instrumentation to the same target.
- Unresolved instrumentation remnants remain user-visible until cleaned up or explicitly accepted as follow-up work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_cleanup_residue_visibility_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_cleanup_residue_visibility_bundle_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- unresolved instrumentation remnants
- cleanup_summary
- "cleanup_summary.residual_items[] / residual_items"
- stop_reason_code
- surviving residue
- superseded
- two active investigations
- overlapping temporary instrumentation
- follow-up work
negative_constraints:
- PM must not let two active investigations add overlapping temporary instrumentation to the same target.
- PM must not hide unresolved instrumentation remnants before cleanup or explicit follow-up acceptance.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Bundle export, storage, assistant-chat, and GitHub integration consumers must not redefine debug cleanup state.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Residue visibility and bundle records form a single user-visible cleanup obligation.
```

### M-081 - Debug Env Secret Tooling And Profiler Cleanup Boundary

```yaml
plan_unit_id: M-081
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Debug cleanup must revert exact env and config changes, redact or hash obvious secrets before storage, export, or handoff, defer reusable tool registry ownership to Tools/newtools, and detach profiler sessions without overstating cleanup success.
gui_related: false
gui_classification_reason: The unit covers security, tooling ownership, environment/config rollback, and profiler cleanup rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-078
- M-079
unblocks: []
acceptance_criteria:
- Env/config activation cleanup reverts the exact temporary flag, toggle, or value PM introduced.
- Process-env cleanup occurs by stopping or restarting without the temporary env when the change lived only in process env.
- Config edits use the same rollback rules as temporary source patch instrumentation.
- Obvious secrets are redacted or hashed before storage, export, or bundle handoff.
- Debugger or profiler attach instrumentation detaches temporary attach/profiler sessions, and detach failure without durable mutation stays localized instead of claiming cleanup success.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_secret_tooling_profiler_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_env_secret_tooling_profiler_cleanup_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- "/toggle/value"
- "/config"
- Authorization
- cookies
- session IDs
- API keys
- passwords
- private tokens
- Plans/Tools.md
- Plans/newtools.md
- "/tags"
- "/profiler"
- "/session"
- do not claim cleanup success
negative_constraints:
- Obvious secrets must not be stored, exported, or handed off without redaction or hashing.
- PM must not claim cleanup success when profiler detach fails and cleanup is not complete.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Tools.md and Plans/newtools.md own reusable tool registry details and tags; MiscPlan records debug cleanup roles and boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Env/config rollback, secret handling, tool ownership, and profiler cleanup cross several implementation owners and should remain split_recommended.
```

### M-001 - Misc Plan Retired Source-Preserving Bridge

```yaml
plan_unit_id: M-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: M-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 095 because MiscPlan-S0001 through MiscPlan-S0105 are covered by M-002 through M-081 or explicit structural, retired, and migration-coverage dispositions. M-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained MiscPlan PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- M-073
- M-074
- M-075
- M-076
- M-077
- M-078
- M-079
- M-080
- M-081
unblocks: []
acceptance_criteria:
- M-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 095.
- MiscPlan-S0001 through MiscPlan-S0105 product coverage is owned by M-002 through M-081 or explicit structural, retired, and migration-coverage dispositions.
- M-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0104
preserved_exact_tokens:
- M-001
- Misc Plan Residual Source-Preserving Bridge
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- M-001 must not re-own MiscPlan-S0001 through MiscPlan-S0105 after Phase 2B batch 095.
- M-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- M-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former M-001 residual source-preserving bridge is retired by Phase 2B batch 095.
owner_boundary_notes:
- M-002 through M-081 and explicit coverage dispositions own MiscPlan product coverage after bridge retirement.
- MiscPlan-S0104 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: No split remains for the retired bridge; product coverage has been atomized or structurally dispositioned.
```
