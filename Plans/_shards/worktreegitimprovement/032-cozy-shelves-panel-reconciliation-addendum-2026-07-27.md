# Shard 032: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5241-L5488

Source SHA256: `a91952094251ba92ee185e07d897f219d7f8a47942834c70e88d45e77fe6a5fb`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

The winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, illustrative source lineage only; no HTML, CSS, or class names from those files are canon) exposed spec gaps this doc must close as the Git/worktree policy owner: the mandated "persisted worktree panel filters" (section 4.0) never enumerated filterable dimensions; the concept fixture term `blocked_by_gate` has no home in the reserved lifecycle vocabulary; the `locked` flag (section 4.0) has no lock/unlock command surface or provenance rule; `cmd.git.worktree.remove` has no graduated confirmation ladder; and the worktree row has no ruling on what the unified expander row contract shows collapsed versus expanded. The five PlanUnits below close those gaps. The implementation base is the c2 concept files patched in place (user decision 2026-07-27). The unified expander row contract (collapsed-by-default rows, single accessible header button with aria-expanded, fixed body slot order, body height cap, blocked reasons outside the collapsible body, shared confirm surface for destructive actions) is owned outside this doc and is consumed by reference here, never redefined. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited; supersession is expressed only through the new units' explicit amendment notes. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### W-075 - Worktree Panel Filter Taxonomy And Chip Presentation

```yaml
plan_unit_id: W-075
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  The persisted worktree panel filters mandated by section 4.0 filter on exactly four dimensions: lifecycle state
  (reserved, active, blocked_preserved, released, orphaned), owner class (thread, orchestrator-lane, manual, agent-role),
  row flags (locked, prunable, dirty, repairable), and blocked-reason family (approval-gated, policy-blocked,
  preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked). Owner class is a display/filter
  classification projected from the canonical package/lane ownership and effective-scope precedence truth; it never
  replaces those vocabularies as ownership canon. Filters present as toggleable chips above the worktree list;
  multi-select within a dimension is OR, across dimensions is AND; active chip selection persists per project with the
  panel state alongside the existing sort mode, hide-stale toggle, and ownership display mode, and rehydrates on
  startup. A zero-result filter state shows an explicit filtered-empty explainer with a clear-filters action, distinct
  from the true zero-worktrees empty state.
gui_related: true
gui_classification_reason: This defines the visible filter chip row and persisted filter behavior of the Worktrees topology panel.
depends_on: [W-032, W-070]
unblocks: []
acceptance_criteria:
  - Filter chips cover exactly the four dimensions with the enumerated values and no invented lifecycle states.
  - Chip selection persists per project and rehydrates with the worktree panel state.
  - Filtered-empty and zero-worktrees states render distinct explainers.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future worktree panel filter persistence and filtered-empty tests.
risk_class: worktree_panel_filter_drift
reasoning_tier: standard
context_scope: worktree_panel_filters
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control Worktrees panel]
node_compile_hint: {mode: worktree_panel_filter_taxonomy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
  - Plans/WorktreeGitImprovement.md:437-439
  - Plans/WorktreeGitImprovement.md:297
  - user decision 2026-07-27
source_atom_ids: []
preserved_exact_tokens: ["persisted worktree panel filters", "hide-stale", "blocked_preserved", "owner class", "filtered-empty"]
negative_constraints:
  - Do not add filter dimensions beyond lifecycle state, owner class, row flags, and blocked-reason family without a new PlanUnit.
  - Do not let owner class supersede package/lane ownership or effective-scope precedence as ownership canon.
compatibility_only_notes:
  - "Slint compatibility: filter chips render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; any glass treatment uses a pre-blurred wallpaper asset only."
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
```

### W-076 - Concept Vocabulary Reconciliation Blocked By Gate

```yaml
plan_unit_id: W-076
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  blocked_by_gate is a concept fixture term from the Cozy Shelves prototype, never a lifecycle state. Any worktree the
  concept labeled blocked_by_gate maps to lifecycle state blocked_preserved carrying a canonical blocked_reason_code
  from the reason-family layer (approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked,
  stale-data-blocked) or the payload codes dirty_worktree / worktree_conflict, plus ordered allowed_action_ids[].
  The reserved lifecycle vocabulary stays exactly reserved, active, blocked_preserved, released, orphaned; locked
  remains a row flag, not a lifecycle state. No UI surface, storage key, event payload, or projection may introduce
  blocked_by_gate as a state value.
gui_related: true
gui_classification_reason: This governs which state values the worktree state chip and blocked explainers may display.
depends_on: [W-017, W-033]
unblocks: []
acceptance_criteria:
  - blocked_by_gate appears nowhere as a lifecycle state in UI, storage, events, or projections.
  - Every concept blocked_by_gate fixture maps to blocked_preserved plus a canonical blocked_reason_code and ordered allowed_action_ids[].
  - locked renders as a flag badge, never as the lifecycle state chip value.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future lifecycle-state vocabulary lint over UI fixtures and payload schemas.
risk_class: worktree_lifecycle_vocabulary_drift
reasoning_tier: standard
context_scope: worktree_lifecycle_vocabulary
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control Worktrees panel]
node_compile_hint: {mode: worktree_vocabulary_reconciliation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Plans/WorktreeGitImprovement.md:297
  - Plans/WorktreeGitImprovement.md:301
  - user decision 2026-07-27
source_atom_ids: []
preserved_exact_tokens: ["blocked_by_gate", "blocked_preserved", "blocked_reason_code", "allowed_action_ids[]"]
negative_constraints:
  - Do not register blocked_by_gate as a lifecycle state, storage value, or event payload state.
  - Do not promote row flags into lifecycle states.
compatibility_only_notes: []
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### W-077 - Worktree Lock And Unlock Surface With Provenance

```yaml
plan_unit_id: W-077
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  The locked row flag gains a command surface: cmd.git.worktree.lock and cmd.git.worktree.unlock (minted in the
  UI_Command_Catalog Cozy Shelves reconciliation). Lock requires a reason string, stored and displayed with the lock.
  Every lock records provenance as user or run-owned. While a run, lane, or package owns a worktree, the system
  auto-locks it with run-owned provenance referencing the owner; the cleanup reaper may release run-owned locks whose
  owning run has terminally ended, and must never release user locks. Unlocking a user lock is an explicit user action
  through cmd.git.worktree.unlock; unlock of a run-owned lock while the owner is live is refused with a blocked
  explanation naming the owner. Locked worktrees refuse prune/remove/reuse with the lock reason and provenance in the
  disabled explanation, consistent with the existing rule that unsafe actions are disabled with explanation rather
  than hidden.
gui_related: true
gui_classification_reason: Lock badges, lock reason display, and disabled explanations are user-visible worktree row surfaces.
depends_on: [W-032, W-033]
unblocks: []
acceptance_criteria:
  - cmd.git.worktree.lock requires and persists a reason string; the lock records user or run-owned provenance.
  - Run ownership auto-locks the worktree with run-owned provenance referencing the owner.
  - The reaper releases only run-owned locks of terminally ended owners and never user locks.
  - Locked worktrees surface lock reason and provenance in prune/remove/reuse disabled explanations.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future lock provenance and reaper-scope tests.
risk_class: worktree_lock_provenance_drift
reasoning_tier: high
context_scope: worktree_lock_lifecycle
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md, future worktree lock manager]
node_compile_hint: {mode: worktree_lock_surface, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Plans/WorktreeGitImprovement.md:439
  - Plans/UI_Command_Catalog.md Cozy Shelves Panel Reconciliation Addendum - 2026-07-27
  - user decision 2026-07-27
source_atom_ids: []
preserved_exact_tokens: ["cmd.git.worktree.lock", "cmd.git.worktree.unlock", "run-owned", "user lock", "reaper"]
negative_constraints:
  - Never allow any automated process to release a user lock.
  - Do not hide lock-blocked actions; disable them with the lock reason and provenance.
compatibility_only_notes: []
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md, Plans/Executor_Protocol.md, Plans/storage-plan.md]
```

### W-078 - Worktree Remove Escalation Ladder Canon

```yaml
plan_unit_id: W-078
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  cmd.git.worktree.remove follows a graduated escalation ladder. A clean, unowned worktree removes after a single
  confirmation. A dirty worktree requires a confirmation that previews the dirty paths before removal. A run-owned or
  blocked_preserved worktree is not removable through the normal flow: the row presents the blocked_preserved posture
  with an explicit owner reference, and removal requires the recorded override policy with a double confirmation that
  names the owner and the consequence. The main worktree is never removable at any ladder step. All confirmations
  route through the shared confirm surface referenced by the unified expander row contract; this unit amends no prior
  unit and layers the ladder on top of the existing lineage-safety rules (W-033) and the active/blocked_preserved
  prune/remove prohibition with recorded override.
gui_related: true
gui_classification_reason: Confirmation dialogs, dirty-path previews, and blocked override flows are user-visible removal surfaces.
depends_on: [W-033]
unblocks: []
acceptance_criteria:
  - Clean unowned removal takes exactly one confirmation; dirty removal previews dirty paths in the confirmation.
  - Run-owned removal presents blocked_preserved with owner reference and requires the recorded override double confirmation.
  - The main worktree exposes no remove action at any ladder step.
  - All ladder confirmations use the shared confirm surface.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future remove-ladder confirmation and main-worktree guard tests.
risk_class: destructive_worktree_removal_drift
reasoning_tier: high
context_scope: worktree_remove_escalation
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control worktree actions]
node_compile_hint: {mode: worktree_remove_ladder, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Plans/WorktreeGitImprovement.md:224
  - Plans/WorktreeGitImprovement.md:439
  - user decision 2026-07-27
source_atom_ids: []
preserved_exact_tokens: ["cmd.git.worktree.remove", "dirty-path preview", "blocked_preserved", "recorded override", "main worktree"]
negative_constraints:
  - Never remove the main worktree.
  - Never bypass the override policy recording for run-owned or blocked_preserved removal.
  - Do not route ladder confirmations through any surface other than the shared confirm surface.
compatibility_only_notes: []
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md, Plans/Executor_Protocol.md]
```

### W-079 - Worktree Row Expander Consumption

```yaml
plan_unit_id: W-079
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Worktree rows consume the unified expander row contract owned outside this doc; this unit maps worktree content into
  that contract without redefining it. The collapsed header shows worktree name, branch, lifecycle state chip, owner
  dot, and relative last-activity time. The expanded body populates the contract's slots with ahead/behind counts,
  last commit summary, dirty file summary, disk size (computed asynchronously with a pending placeholder, never
  blocking expansion), absolute path, and the action strip. Blocked reasons stay visible outside the collapsible body
  per the contract, sourced from blocked_reason_code plus ordered allowed_action_ids[]. Orphaned worktrees render as a
  collapsed ORPHANED group beneath live rows, with Repair and Prune actions; Prune always presents a dry-run preview
  of what would be pruned before any confirmation, and destructive actions route through the shared confirm surface.
gui_related: true
gui_classification_reason: This is the visible collapsed/expanded content mapping of worktree rows and the orphaned group.
depends_on: [W-032, W-033]
unblocks: []
acceptance_criteria:
  - Collapsed header shows exactly name, branch, state chip, owner dot, and relative activity.
  - Expanded body shows ahead/behind, last commit, dirty summary, async disk size, absolute path, and action strip in the contract's slot order.
  - Blocked reasons render outside the collapsible body from blocked_reason_code plus ordered allowed_action_ids[].
  - Orphaned worktrees group collapsed with Repair and Prune, and Prune always shows a dry-run preview first.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future worktree row expander mapping and orphaned-group prune-preview tests.
risk_class: worktree_row_presentation_drift
reasoning_tier: standard
context_scope: worktree_row_expander
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control Worktrees panel]
node_compile_hint: {mode: worktree_row_expander_consumption, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
  - Plans/WorktreeGitImprovement.md:437-441
  - user decision 2026-07-27
source_atom_ids: []
preserved_exact_tokens: ["state chip", "owner dot", "ahead/behind", "ORPHANED", "dry-run preview", "allowed_action_ids[]"]
negative_constraints:
  - Do not redefine or fork the unified expander row contract; consume it by reference.
  - Never execute Prune without the dry-run preview step.
  - Do not block row expansion on disk size computation.
compatibility_only_notes:
  - "Slint compatibility: expander rows and the orphaned group render as opaque precomputed surfaces with transform-driven expansion; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; any glass treatment uses a pre-blurred wallpaper asset only."
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```
