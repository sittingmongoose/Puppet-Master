# Shard 007: PlanUnits

Source: `Plans/GitHub_Integration.md`

Source lines: L235-L1793

Source SHA256: `6859cad9e197dd144a2ce1ef3d0be988354d8527b30ccaf5bf7abc22f0cefcf8`

---

## PlanUnits

### GI-002 - Locked Decisions, SSOT, And Anti-Drift Boundary

```yaml
plan_unit_id: GI-002
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration preserves canonical owner-section requirements, stable account identity, SSOT references, anti-drift compliance, github_api realm separation, no-secret storage, local git and SSH subprocess decisions, and UICommand dispatch boundaries while refusing to redefine contracts owned by GitHub API auth, Contracts, storage, or UI command catalogs.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: locked_decisions_ssot_antidrift_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0006
preserved_exact_tokens:
- github_api
- copilot_github
- seglog/redb/Tantivy
- local `git` binary
- SSH subprocess
- UICommand
- AuthState
- GitHub_API_Auth_and_Flows.md
- ContractRef
negative_constraints:
- This document MUST NOT redefine schemas or contracts owned by SSOT sources.
- github_api and copilot_github tokens and /state are never cross-consumed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub_API_Auth_and_Flows owns auth contracts; Contracts_V0 owns EventRecord/UICommand/AuthState; storage-plan owns storage rules; UI_Command_Catalog owns stable UI command IDs.
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
```

### GI-003 - Source Control And GitHub Actions Surface Boundary

```yaml
plan_unit_id: GI-003
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: 'GitHub Integration separates Source Control, GitHub Actions, GitHub Copilot, and GitHub API: Source Control owns Git-first repo/worktree GUI behavior, GitHub Actions owns hosted workflow/admin/runtime GUI behavior, GitHub API remains internal plumbing, and legacy Git (GitHub) labels cannot collapse hosted behavior into Source Control.'
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_github_actions_surface_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Source Control
- GitHub Actions
- Git (GitHub)
- GitHub Copilot
- GitHub API
- VS Code Source Control
- VS Code extension
negative_constraints:
- Hosted Actions behavior must not collapse back into Source Control.
- GitHub API is internal integration plumbing, not a visible GUI panel.
- Functional parity baselines must not copy visual design.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
split_recommendation_reason: GitHub_Integration-S0008 contains many surface, readiness, workflow, and worktree atoms split across GI-003 through GI-021.
```

### GI-004 - Source Control SCM Views, Accessibility, And Compare Defaults

```yaml
plan_unit_id: GI-004
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Source Control exposes Changes, History, Graph, Worktrees, Branches/Stash, diff preview, staging, commit, sync, stash, branch, incoming/outgoing, conflict, and multi-SCM provider behavior; accordion headers are accessible buttons and compare defaults are deterministic by origin.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_scm_views_accessibility_compare_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Changes
- History
- Graph
- Worktrees
- Branches / Stash
- 'accessible-role: button'
- accessible-label
- index <-> working tree
- HEAD <-> index
- empty <-> working tree
- selected commit <-> first parent
- three-way conflict review
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control is the canonical SCM panel contract; git-native flows must not scatter across chat, FileManager, or Progression Gates.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-005 - Compare-origin Routing And Multi-context Binding

```yaml
plan_unit_id: GI-005
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub compare/open pivots carry closed compare_origin identity, project/repo/worktree/run refs, account scoping, multi-lane context, and active repo/worktree/run binding instead of reconstructing targets from local UI state or flattening multiple contexts into a single branch.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: compare_origin_routing_multi_context_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- compare_origin
- changes.unstaged
- changes.staged
- history.commit_parent
- conflict.review
- worktree.branch_compare
- actions.run_commit_range
- blocked.dirty_worktree
- recovery.safe_point_retry
- project_id
- repo_id
- worktree_id
- selected_repo_id
negative_constraints:
- If an origin cannot be revalidated, the UI opens degraded historical mode or blocks mutation rather than silently substituting the current branch.
- The multi-context Source Control model never assumes a single repo context.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-006 - Requested Effective Identity Display And Audit Snapshot

```yaml
plan_unit_id: GI-006
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub auth, admin, readiness, history, Source Control, Actions subviews, run history, compare/review, and recovery surfaces disclose requested and effective execution identity by consuming runtime identity fields and storing only resource, capability, readiness, and route/open refs needed for the same audit snapshot.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: requested_effective_identity_display_audit_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Requested account
- Requested binding
- Effective account
- Switch reason
- execution role
- effective/provider/account
- record
- stable account identity
- degraded capability state
negative_constraints:
- GitHub Integration does not redefine runtime identity fields locally.
- Non-runtime /integration and /page/artifact surfaces must not invent local display-only account fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumes GitHub_API_Auth_and_Flows identity/degraded-capability contracts and Contracts_V0 runtime identity fields.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-007 - Focus Preservation And Safe-point Retry Confirmation

```yaml
plan_unit_id: GI-007
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Search routing preserves focused_run_id, safe-point retry opens an explicit restore/retry confirmation with repo, worktree, branch, baseline/head, safe_point_id, affected files, owner run/node/attempt, and follow-up action, and run-aware compare-origin forwarding preserves identity and refs into review/conflict/safe-point contexts.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: focus_preservation_safe_point_retry_confirmation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- focused_run_id
- recovery.safe_point_retry
- safe_point_id
- restore_safe_point_then_retry
- safe_point.created
- safe_point.restored
- compare_origin
- Dedicated review mode
- guided conflict assistant
negative_constraints:
- Search result routing must never switch focused run context silently.
- Declining safe-point retry leaves the blocked episode unchanged.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe remains the mutation guard owner; Contracts_V0 owns safe_point.created, safe_point.restored, and restore outcome events.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-008 - GitHub Actions IA And Settings ConfigKey Boundary

```yaml
plan_unit_id: GI-008
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Actions has Current Branch, Workflows, and Settings as stable subviews, routes compatibility entrypoints to the correct owner surface, and owns only GitHub-specific Settings, readiness, workflow, admin, and source-control ConfigKey schema details while importing shared storage rules.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_ia_settings_configkey_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Current Branch
- Workflows
- Settings
- /Workflows/Settings
- /local-repo
- Git (GitHub)
- ConfigKey
- secrets
- variables
- /environments
- runner labels
negative_constraints:
- ConfigKey entries here must not duplicate Contracts event names, Permissions policy schema, usage rollup logic, or FileSafe safe-point behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub Actions > Current Branch owns branch-context readiness and run controls; Workflows owns inventory/run detail; Settings owns hosted admin state.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-009 - Pinned Critical Workflows And Health Badge Provenance

```yaml
plan_unit_id: GI-009
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Pinned critical workflows are owned by GitHub Actions > Workflows, use canonical pin/unpin commands and compatibility aliases, store workflow/repo/branch/worktree/badge/preference/provenance records, and expose stale or renamed workflow state without hiding historical receipts.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: pinned_critical_workflows_health_badge_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Pinned critical workflows
- Critical workflow pinning / health badges
- cmd.github.actions.pin
- cmd.github.actions.unpin
- cmd.actions.pin
- /event/storage
- /build/deploy
- /deploy
- /renamed
- notify-on-failure
negative_constraints:
- Pinned workflow health badges must expose stale or /renamed workflow state and let the user unpin without hiding historical receipts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-010 - Replay Last Known Good And Compare Last Success

```yaml
plan_unit_id: GI-010
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Replay from last known good belongs to GitHub Actions failure triage/history, compares failed runs against same-workflow same-branch successes, records baseline and comparison metadata, exposes compare options, and never implies rerun tests latest branch head unless a new dispatch occurs.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: replay_last_known_good_compare_last_success
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Replay from last known good
- known-good run id
- cached comparison target id
- comparison window length
- run-history
- cmd.github.actions.compare_last_success
- same-branch history
- manual compare selection
negative_constraints:
- GitHub reruns use original commit/ref semantics; replay UI must not imply a rerun tests latest branch head unless a new dispatch occurs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-011 - Current Branch Readiness And Live-admin Precedence

```yaml
plan_unit_id: GI-011
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Current Branch shows active branch/worktree binding, background run status, Actions readiness, admin/runtime scopes, rate-limit/repo linkage, capability, environment-gated wait/blocked states, and recovery CTAs while live GitHub Actions Settings remains source of truth for hosted admin state.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: current_branch_readiness_live_admin_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Current Branch
- /branches/background
- /rate-limit/repo
- live-admin
- Settings > Advanced > CI / GitHub Actions
- environment-gated readiness
- wait/blocked states
- durable audit receipts
negative_constraints:
- Workflow generation/template defaults do not override live-admin state.
- Actions-specific recovery CTAs route to the owning subview rather than duplicating admin controls elsewhere.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-012 - Actions Readiness Refresh And Dispatch Capability Disclosure

```yaml
plan_unit_id: GI-012
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions readiness is event-driven plus bounded refresh on project, branch/worktree, workflow-file, panel, dispatch-form, and admin CRUD events; stale readiness cannot authorize mutation, dispatchability is validated without persisting secrets, and capability disclosure shows scope/value limits honestly.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_readiness_refresh_dispatch_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- workflow-file save
- dispatch-form
- event-driven plus bounded refresh
- cmd.github.actions.validate_dispatch_readiness
- hidden-value
- read-only inventory
- browser handoff
- /scope-based
- Local-to-remote workflow loop
- /dispatch
negative_constraints:
- Readiness is not timer-only and not manual-only.
- Stale readiness snapshots cannot authorize rerun, dispatch, or dependent Orchestrator steps.
- Secret values are not stored or value-inspected after creation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-013 - Actions To Code Correlation Bridge

```yaml
plan_unit_id: GI-013
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions-to-code correlation links runs, jobs, steps, failed checks, command pivots, commit ranges, changed files, branch/worktree refs, and related diffs/worktrees as a remediation bridge while labeling heuristic uncertainty and preserving candidate choices.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_to_code_correlation_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- to-code
- cmd.github.actions.open_run
- cmd.github.actions.open_job
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_related_diff
- cmd.github.actions.open_related_worktree
- /open_related_worktree
- /failing
- heuristic matches
negative_constraints:
- Actions-to-code correlation is a remediation bridge, not canonical proof by log parsing.
- If exact file correlation is unavailable, show uncertainty; if multiple candidates exist, show candidates rather than auto-opening one.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-014 - Run Impact Mapping Evidence Boundary

```yaml
plan_unit_id: GI-014
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Run impact mapping belongs to GitHub Actions run detail and Orchestrator receipts, shows branch/commit/PR, worktree, deploy chain, publish, and readiness implications, and marks incomplete evidence as partial rather than complete truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: run_impact_mapping_evidence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Run impact mapping
- /branch/commit/PR
- deploy chain
- Secrets / variables / environments readiness
- partial impact map
- derived-artifacts toggle
- /download
- retention boundary
negative_constraints:
- Related objects may auto-pin only as view state, never as an auto-write to repository or workflow state.
- Heuristic linkage must not be presented as complete truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-015 - Failure Triage Log Access And Repro Budget

```yaml
plan_unit_id: GI-015
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Failure triage view compresses failed runs into failing job/step, logs, changed files, likely next action, metadata, log access/fallback state, tiered fetching, and stored refs while GitHub Actions repro loops follow Debug investigation budget reset rules.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: failure_triage_log_access_repro_budget
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Failure triage view
- step-log
- fail-step
- log-download
- /collapsed
- auto-expand
- /open-in-browser
- /tiers
- repro_attempts_per_strategy_tier
- wall-clock
- no-new-evidence
negative_constraints:
- Log excerpts are not canonical product state.
- A strategy-tier change resets repro_attempts_per_strategy_tier only and does not reset wall-clock or no-new-evidence budgets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-016 - Workflow Authoring Assistance Metadata Boundary

```yaml
plan_unit_id: GI-016
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Workflow authoring assistance is a GitHub Actions Settings/workflow-editor capability with language-service validation, completion, docs, remote-repo disclosure, proxy mediation, generation links, and preview/apply behavior that stores metadata only before accepted edits.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: workflow_authoring_assistance_metadata_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Workflow authoring assistance
- language-service
- remote-repo
- /proxy
- /generation
- preview /apply
- validation/completion metadata
negative_constraints:
- Workflow authoring assistance is not a generic YAML textarea.
- Event storage must store validation/completion metadata only, not canonical workflow contents before the user accepts an edit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-017 - Actions Blocked-state Taxonomy And Attention Semantics

```yaml
plan_unit_id: GI-017
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions readiness blocked-state taxonomy uses canonical actions_* reason details layered onto shared blocked metadata, maps auth expiration to shared failure class, exposes ordered allowed actions and active repo/branch context, and keeps attention_required distinct from blocked.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_blocked_state_taxonomy_attention_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- actions_no_github_remote
- actions_auth_required
- actions_auth_expired
- actions_missing_scope_runtime
- actions_missing_scope_admin
- actions_workflow_not_dispatchable
- actions_missing_secret
- actions_missing_variable
- actions_missing_environment
- actions_environment_review_required
- actions_environment_wait_timer
- actions_branch_rule_mismatch
- actions_dispatch_input_invalid
- actions_workflow_file_invalid
- allowed_action_ids[]
- attention_required
- blocked
negative_constraints:
- Hosted readiness details do not redefine blocked_reason_code.
- The view must not silently aggregate multiple worktrees into one branch stream.
- Resurfacing responds to meaningful state change, not every scheduler tick.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-018 - Hosted Git Governance Blockers And Policy Receipts

```yaml
plan_unit_id: GI-018
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted Git governance blockers use policy-specific reasons and receipts for protected branch, force-push, required PR/merge queue/status/signed commit/tag, actor bypass, lifecycle, fallback, and mutation outcome instead of generic branch-rule mismatch.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_git_governance_blockers_policy_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- branch-rule
- force-push
- merge queue
- required status checks
- signed commits
- /tags
- actor bypass
- policy_snapshot_ref
- create-branch fallback
- PR/hosted-flow handoff
negative_constraints:
- Hosted Git governance blockers use policy-specific reasons rather than a generic branch-rule mismatch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-019 - Source Control Worktree Topology Ownership And Safety

```yaml
plan_unit_id: GI-019
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Source Control remains worktree-native with compare/lineage/recovery pivots, topology ownership over branch lineage, ownership badges, worktree safety warnings, run lifecycle claims/releases, restart recovery unknown ownership, and strong-action confirmations.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_worktree_topology_ownership_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- /compare/lineage/recovery
- Worktree topology view
- ownership badges
- admin override policy
- prune protection defaults
- safe-point awareness
- cmd.git.worktree.request_prune
- cmd.git.worktree.release
- cmd.git.worktree.recover
- unknown ownership
- strong
negative_constraints:
- Rerun, cancel, pin, and workflow-admin controls stay in GitHub Actions unless Source Control is mirroring a deep link.
- Strong Source Control actions show scope, consequence, and confirmation boundaries before execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-020 - Worktrees Responsive Row Layout And Project Filter

```yaml
plan_unit_id: GI-020
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Worktrees rows are first-class Source Control objects with narrow-pane single-column expandable rows, row labels, actions, per-project All/Threads/Orchestrator/Manual filter persistence, and two-level accordion scroll behavior.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: worktrees_responsive_row_layout_project_filter
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- single-column expandable rows
- theme worktree glyph
- 'Thread: <thread_title>'
- 'Orch: <tier_label>'
- Manual
- All | Threads | Orchestrator | Manual
- worktree_filter
- two-level scroll model
- icon-only controls
negative_constraints:
- Worktrees rows are first-class Source Control objects, not settings-only utilities.
- worktree_filter persists per project and does not share across projects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-021 - Hosted Repo Workflow Lifecycle States And Capability Limits

```yaml
plan_unit_id: GI-021
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted-repo, remote, and workflow lifecycle states are first-class, archived/deleted/historical-only states disable mutation deterministically, receipts retain immutable identifiers and refs, deep links reopen only through safe validated refs, and capability disclosure separates hosted-only mutation boundaries from local editing.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_repo_workflow_lifecycle_states_capability_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- active
- renamed_redirected
- transferred
- deleted
- archived
- remote_mismatch
- historical_only
- /non-resumable
- /recreate
- can view runs but cannot dispatch
- can dispatch but cannot manage secrets
negative_constraints:
- Deleted workflow definitions never silently bind to a different current workflow with the same filename.
- Capability limitations are shown as effective capability state, not hidden controls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-022 - Runtime Outcome Taxonomy And Bridge Status Cross-refs

```yaml
plan_unit_id: GI-022
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes runtime status, bridge classification, tool dispatch, FileSafe, and storage startup contracts via explicit cross-ref anchors, displays canonical runtime outcomes, and treats legacy stop.* wording only as stale or compatibility input when it conflicts with kill.* and done.* families.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: runtime_outcome_taxonomy_bridge_status_crossrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0009
preserved_exact_tokens:
- HTTP/status to failure-class mapping
- Universal kill conditions
- HTE-specific kill conditions
- Startup and shutdown
- Potential problems and solutions
- Integration Checklist
- kill.*
- done.*
- stop.*
negative_constraints:
- Actions, Source Control, and hosted-repo controls must not invent local status taxonomies.
- GitHub UI labels must not collapse kill/done classes into generic failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
```

### GI-023 - Hosted Mutation Gates And Usage Cost Display Deferral

```yaml
plan_unit_id: GI-023
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted mutation dispatch, rerun, cancel, admin mutation, and Source Control hosted actions respect Tools listener, OAuth/listener failure semantics, FileSafe path checks, storage logical roots/startup locks/read-only degradation, and usage/cost display rules owned by FinalGUISpec.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_mutation_gates_usage_cost_display_deferral
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0009
preserved_exact_tokens:
- Tools /listener
- OAuth/listener failure semantics
- FileSafe path checks
- storage logical-root selection
- startup lock-path
- read-only degraded state
- adaptive sub-dollar precision
- /truncation
negative_constraints:
- Hosted mutation must respect tool, file-safety, storage, and degraded-state gates before execution.
- GitHub Integration must not invent alternate usage rounding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
```

### GI-024 - GitHub Route Open Resource Propagation And Object Jump Identity

```yaml
plan_unit_id: GI-024
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes route_target and OpenSubject semantics, resolves github:// resources and concerns into active routes and orchestrator concern records, preserves stable object identity for /jump/search-result routes, and treats Orchestrator references as supersession pointers rather than override evidence.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_route_open_resource_propagation_object_jump_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- route_target
- OpenSubject
- github://owner/repo/file.md
- github://owner/repo/issues/123
- /jump
- stable object identity
- Orchestrator_Page.md
- same-file supersession pointers
negative_constraints:
- GitHub /jump and search-result routes must not degrade into text-search, path-only, or page-local jump state.
- Outdated page specs cannot override live route, concern, or Source Control consumer contracts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-025 - Graph Patch Review Records And Apply Exposure

```yaml
plan_unit_id: GI-025
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Graph patch flows use explicit graph_patch_request and graph_patch_result records carrying patch point, concern refs, structural change summary, affected generation, and requester identity before GitHub Integration exposes review or apply actions.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: graph_patch_review_records_apply_exposure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- graph_patch_request
- graph_patch_result
- patch point
- triggering /concern refs
- requested structural change summary
- affected generation
- requester identity
- review or apply actions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-026 - Approval HITL Compatibility And Actions Observation Freshness

```yaml
plan_unit_id: GI-026
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub workflow approval and observation consumers preserve approval_scope, approval_id, PR review ID, execution_unit_id, compatibility HITL/tier-boundary inputs, blocked runtime overlays, and wait/timeout timestamps while scheduled workflows remain stale or unknown until concrete hosted observation exists.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: approval_hitl_compatibility_actions_observation_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- approval_scope
- require_approval
- approval_id
- GitHub PR review ID
- execution_unit_id
- HITL
- tier-boundary
- blocked /runtime overlay
- wait_state_class?
- timeout_class?
- stale or unknown
negative_constraints:
- Absence of a fresh Actions observation MUST NOT by itself mark the workflow skipped/failed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-027 - Security Carry-through Path Guard SSH Reconnect And Remote Search Authority

```yaml
plan_unit_id: GI-027
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub remote, SSH, Actions, and repository operations carry FileSafe, permission, credential, redaction, projection-trust, hard_gate, remote path guard, SSH keepalive/reconnect, and storage-owned remote-search authority instead of bypassing gates or defining alternate remote search behavior locally.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: security_carrythrough_path_guard_ssh_reconnect_remote_search_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- FID-04
- hard_gate
- starts_with(project_root)
- starts_with(cache_root)
- cache_root
- project_root
- file-change
- dirty-staging
- 30s keepalive
- one-auto-retry
- Reconnect
- remote-search
- staging, verification, and re-anchor
negative_constraints:
- No GitHub consumer flow may bypass FileSafe, permission, credential, redaction, or projection-trust gates merely because the action is initiated from a GitHub surface.
- Remote-search is transport-only in GitHub Integration and must not define alternate remote-search layout, dirty-layer clearing, or search-snapshot authority locally.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-028 - Remote Project Search Acceleration Disclosure

```yaml
plan_unit_id: GI-028
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Remote Git/non-Git search acceleration is remote-admin/user-visible transport; GitHub Integration owns remote cache/admin disclosure, consumes storage-owned staging/verification/re-anchor/remote-admin contracts, and keeps no-silent-local-fallback mandatory.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: remote_project_search_acceleration_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0011
preserved_exact_tokens:
- /staging/verification/re-anchor/remote-admin
- remote cache/admin disclosure
- no-silent-local-fallback
- remote Git/non-Git search acceleration
negative_constraints:
- Remote search acceleration is not a fallback path.
- no-silent-local-fallback remains mandatory.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-029 - Remote Tool Execution Context And Verification Anchors

```yaml
plan_unit_id: GI-029
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Remote tool/provider execution uses GitHub remote context, remote SSH/reconnect budget, path guard, and storage verification anchors before mutating or reporting search/cache state.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: remote_tool_execution_context_verification_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0012
preserved_exact_tokens:
- remote tool/provider execution
- remote SSH/reconnect budget
- path guard
- storage verification anchors
- search/cache state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### GI-030 - Effective GitHub Account Capability Check And Provider Selection

```yaml
plan_unit_id: GI-030
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes GitHub_AuthContext, includes effective_account_id in API calls, uses runtime identity resolution for cross-account capability checks, and follows scoped provider/model settings tied to Persona and execution_unit_type rather than repository or organization.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: effective_github_account_capability_provider_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0012
preserved_exact_tokens:
- GitHub_AuthContext
- effective_account_id
- capability check
- runtime identity resolution flow
- GitHub Copilot
- GPT-4
- Plans/Models_System.md
- Persona
- execution_unit_type
negative_constraints:
- Cross-org access must trigger runtime identity capability checks, not silent re-auth.
- Model selection is tied to active Persona and execution_unit_type, not repository or organization.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### GI-001 - GitHub Integration Source-Preserving Bridge Retired

```yaml
plan_unit_id: GI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: The former GitHub_Integration doc-level source-preserving bridge is retired after Phase 2B atomized GitHub_Integration-S0002, S0004, S0006, and S0008 through S0012 into GI-002 through GI-030 and structurally dispositioned S0001, S0003, S0005, S0007, S0013, S0014, and S0016. GI-001 remains only as migration lineage for GitHub_Integration-S0015 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained GitHub Integration PlanUnits GI-002 through GI-030.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GI-001 no longer uses source_preserving_planunit compile mode.
- GI-002 through GI-030 own product coverage for atomized GitHub Integration spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by GI-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0015
preserved_exact_tokens:
- GI-001
- source_preserving_planunit
- source_preserving_bridge_retired
- GitHub_Integration-S0001
- GitHub_Integration-S0016
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- GI-001 must not re-own atomized GitHub_Integration product coverage.
- GI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- GI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The broad GitHub Integration source-preserving bridge was retired in Phase 2B batch 077.
owner_boundary_notes:
- GI-002 through GI-030 own atomized GitHub Integration product coverage.
- GitHub_Integration-S0015 maps only to retired bridge lineage.
owner_hints:
- Plans/GitHub_Integration.md
```
