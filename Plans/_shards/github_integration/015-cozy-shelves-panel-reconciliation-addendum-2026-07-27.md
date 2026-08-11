# Shard 015: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/GitHub_Integration.md`

Source lines: L2118-L2516

Source SHA256: `ca98a6f62948a97779ea383dd564964b485e8863072dd42e40730cc7ccccbfa9`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes the GitHub Actions and Source Control spec gaps exposed by the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source lineage only; no concept HTML, CSS, or class names are canon). It adds seven PlanUnits: in-rail run-to-job-to-step drill-down depth with failure-first compact expansion, the typed `workflow_dispatch` form contract, reconciliation of the blocked-reason enum divergence between GI-017 and the FABLE 2026-07-08 Actions Blocked Reason Table, a queued-reason sublabel vocabulary for queued jobs, the narrow-width IA for the three GitHub Actions subviews inside the ratified rail width envelope (240px minimum, 480px maximum, 280px default; 220px is test-only adversarial - user decision 2026-07-27), consumption of the scheduled-workflow observation freshness rule by rail rendering, and resolution of the `cmd.git.worktree.request_prune` / `cmd.git.worktree.prune` duality. The implementation base is the c2 concept files patched in place (user decision 2026-07-27). Row presentation consumes the unified expander row contract by reference from its owning shell spec (collapsed-by-default rows; header as a single accessible button with `aria-expanded`; body slot order kv-facts, status-detail, blocked-reason-detail, actions, overflow; roughly 200px body cap with internal scroll; blocked reasons always visible outside the collapsible body; destructive actions through the shared confirm surface); this doc does not re-own that contract. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited; supersession is expressed only through the new units' explicit amendment notes. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### GI-035 - Rail Run-Job-Step Drill-Down Depth And Failure-First Expansion

```yaml
plan_unit_id: GI-035
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  GitHub Actions run detail renders to run-job-step depth inside the rail using failure-first compact
  expansion: expanding a run row shows successful jobs as single collapsed lines, auto-expands only failed
  jobs listing their failed steps plus the single in-progress step when one exists, and offers a show-all-steps
  toggle for the rest. The failing or in-progress step carries a bounded in-rail log excerpt of at most 5
  lines; full logs never render in the rail and instead reveal the bottom runtime zone owned by
  Plans/FinalGUISpec.md F3-153 via an Open full log handoff. When run_attempt is greater than 1, the expanded
  run gets a collapsed Previous attempts (N) child node that lazy-loads prior attempts only on expand, each
  attempt expandable to its own job list, and the current row is attempt-labeled. The expanded run carries an
  Artifacts strip listing artifact name, size, and expiry; expired artifacts render as inert tombstones
  (non-interactive, expiry date disclosed) rather than failing downloads, and in-progress runs show an
  available-after-completion placeholder instead of an empty strip. This refines the Failure triage view and
  its auto-expand failing-step behavior; log excerpts remain evidence, never canonical product state.
gui_related: true
gui_classification_reason: Defines the user-visible in-rail run detail depth, expansion, log excerpt, attempts, and artifacts presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- Successful jobs render as one collapsed line each; only failed jobs auto-expand, showing failed steps plus at most one in-progress step.
- The in-rail log excerpt is capped at 5 lines and full logs open in the F3-153 bottom runtime zone, never inline in the rail.
- Previous attempts load lazily on expand only and never eagerly fetch attempt histories.
- Expired artifacts are inert tombstones with disclosed expiry; no download affordance is offered for them.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_actions_run_depth
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/FinalGUISpec.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_actions_run_depth
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- failure-first compact expansion
- Previous attempts
- run_attempt
- Artifacts
- Open full log
- F3-153
compatibility_only_notes:
- 'Slint compatibility: expansion states and log excerpts render on opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; glass appears only as pre-blurred wallpaper.'
negative_constraints:
- Full step logs must never render inline in the rail.
- Log-excerpt content must not be treated as canonical run state.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/FinalGUISpec.md
```

### GI-036 - Typed Workflow Dispatch Form Contract

```yaml
plan_unit_id: GI-036
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  The workflow_dispatch form is typed, not a generic prompt sequence. It renders a ref picker defaulting to
  the current branch, boolean inputs as checkboxes, choice inputs as option menus, and string and number
  inputs as fields with declared defaults prefilled and required inputs visibly marked. Dispatch fires only
  from an explicit Run control; no interaction with the form (including opening the ref picker) may
  implicitly submit. Invalid or missing required inputs surface through the existing blocked-with-reason
  presentation (actions_dispatch_input_invalid) and readiness gating (cmd.github.actions.validate_dispatch_readiness)
  is preserved. Post-dispatch correlation is mandatory: on dispatch the branch-runs list inserts an optimistic
  queued row that is polled to resolution against the created run (workflow id, ref, and actor match) with a
  bounded attempt budget, then swaps in the real run row; if correlation exhausts its budget the row degrades
  to an explicit unresolved-dispatch state rather than disappearing. Workflows whose triggers are
  schedule-only expose no dispatch affordance at all - absence of workflow_dispatch renders no disabled
  button and no dispatch form entry point.
gui_related: true
gui_classification_reason: Defines the user-visible typed dispatch form, submit discipline, and post-dispatch correlation behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- Ref picker defaults to the current branch and input widgets match declared input types with required markers.
- Dispatch occurs only via the explicit Run control; no implicit submit path exists.
- Post-dispatch, an optimistic queued row appears and resolves to the real run or an explicit unresolved-dispatch state.
- Schedule-only workflows render no dispatch affordance, disabled or otherwise.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_actions_dispatch_form
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_actions_dispatch_form
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- workflow_dispatch
- actions_dispatch_input_invalid
- cmd.github.actions.validate_dispatch_readiness
- cmd.github.actions.dispatch
compatibility_only_notes:
- 'Slint compatibility: form fields render on opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; glass appears only as pre-blurred wallpaper.'
negative_constraints:
- Secret values are never persisted or echoed by dispatch-form state.
- No implicit or accidental submit path may exist in the dispatch form.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
```

### GI-037 - Actions Blocked-Reason Taxonomy Reconciliation

```yaml
plan_unit_id: GI-037
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  The FABLE 2026-07-08 Actions Blocked Reason Table names are canonical, and GI-017's older names are
  compatibility aliases: actions_auth_required is a compatibility alias of actions_auth_missing, and
  actions_branch_rule_mismatch is a compatibility alias of actions_branch_protected. The table's additional
  codes actions_workflow_disabled, actions_rate_limited, actions_runner_unavailable, and
  actions_observation_stale are absorbed into the canonical enum with their table severity and retryability.
  GI-017 codes with no table counterpart remain canonical unchanged: actions_no_github_remote,
  actions_auth_expired, actions_missing_scope_runtime, actions_missing_scope_admin,
  actions_workflow_not_dispatchable, actions_missing_secret, actions_missing_variable,
  actions_missing_environment, actions_environment_review_required, actions_environment_wait_timer,
  actions_dispatch_input_invalid, and actions_workflow_file_invalid. The canonical enum is this union; alias
  names may appear in stored or inbound payloads and must normalize to canonical names before presentation.
  This amends GI-017 by supersession note only - GI-017's text and preserved tokens are untouched, and the
  hosted Git governance policy-specific reasons remain a distinct family and are not collapsed into
  actions_branch_protected. Blocked payloads continue to carry blocked_reason_code plus ordered
  allowed_action_ids[], and these details still layer onto shared blocked metadata without redefining
  blocked_reason_code.
gui_related: true
gui_classification_reason: Governs the blocked-with-reason chips and recovery actions users see on Actions surfaces.
depends_on: [GI-017]
unblocks: []
acceptance_criteria:
- Exactly one canonical enum exists; actions_auth_required and actions_branch_rule_mismatch resolve as aliases and never appear as canonical presentation codes.
- The four absorbed table codes carry the table's severity and retryability semantics.
- Governance policy-specific reasons remain distinct from actions_branch_protected.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_actions_blocked_reasons
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: cozy_shelves_blocked_reason_reconciliation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- actions_auth_missing
- actions_branch_protected
- actions_workflow_disabled
- actions_rate_limited
- actions_runner_unavailable
- actions_observation_stale
- allowed_action_ids
compatibility_only_notes:
- actions_auth_required is a compatibility alias of actions_auth_missing.
- actions_branch_rule_mismatch is a compatibility alias of actions_branch_protected.
negative_constraints:
- Alias names must not surface as canonical codes in new payloads or UI presentation.
- This unit does not edit GI-017 or its preserved tokens; supersession is by this amendment note only.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-038 - Queued-Reason Sublabel Vocabulary

```yaml
plan_unit_id: GI-038
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  Queued or pending jobs carry an informational queued-reason sublabel drawn from the closed vocabulary
  waiting_on_deps, no_runner_online, no_runner_matches, and runners_busy, rendered as a single muted line
  under the job row. waiting_on_deps carries the ordered list of unmet dependency job names;
  no_runner_matches carries the unmatched runner label set. Queued-reason sublabels are wait-state
  presentation, not blocked states: they are distinct from the canonical actions_* blocked-reason enum, do
  not populate blocked_reason_code, and do not create attention_required or blocked presentation on their
  own. This generalizes the blocked-with-reason idiom from dispatch to the queued phase of the run lifecycle
  without merging the two taxonomies.
gui_related: true
gui_classification_reason: Defines the user-visible queued-job sublabel line in run detail.
depends_on: []
unblocks: []
acceptance_criteria:
- The vocabulary is closed to the four listed values with their declared payloads.
- Queued-reason sublabels never populate blocked_reason_code and never trigger blocked or attention_required presentation alone.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_actions_queued_reasons
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: cozy_shelves_queued_reason_sublabels
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- waiting_on_deps
- no_runner_online
- no_runner_matches
- runners_busy
compatibility_only_notes: []
negative_constraints:
- Queued-reason values must not be added to the blocked-reason enum or reused as blocked_reason_code values.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-039 - GitHub Actions Narrow-Width Rail IA

```yaml
plan_unit_id: GI-039
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  Inside the left rail, the GitHub Actions subviews Current Branch, Workflows, and Settings render as the
  segmented tabs of the rail panel - one active subview at a time, no accordion stacking of subviews and no
  drill-in replacement navigation between them. The rail width envelope is 240px minimum, 480px maximum,
  280px default (user decision 2026-07-27; 220px exists only as a test-only adversarial width), following
  the FinalGUISpec responsive tier ladder (480px and above, 360-479, 280-359, 240 minimum). At narrower
  tiers segmented-tab labels may abbreviate or degrade toward glyphs while preserving full accessible
  labels. Within the active subview, run drill-down depth stays in-rail per the failure-first expansion
  contract with full logs escalating to the bottom runtime zone, and section stacks reuse the Source Control
  two-level scroll model (expanded sections scroll internally under max-height; the outer stack scrolls when
  combined sections exceed the panel). The Current Branch / Workflows / Settings ownership split is
  unchanged; this unit governs only their presentation inside the rail.
gui_related: true
gui_classification_reason: Defines the user-visible subview navigation and width-tier behavior of the GitHub Actions rail panel.
depends_on: [GI-020]
unblocks: []
acceptance_criteria:
- The three subviews present as segmented tabs with exactly one active subview; no accordion or drill-in substitute IA.
- Behavior is specified across the 240-480px envelope with 280px default; nothing depends on widths below 240px outside test-only adversarial checks.
- Abbreviated or glyph tabs retain full accessible labels.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_actions_rail_ia
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: cozy_shelves_actions_rail_ia
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- Current Branch
- Workflows
- Settings
- segmented tabs
compatibility_only_notes:
- 'Slint compatibility: segmented tabs and tier transitions use opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; glass appears only as pre-blurred wallpaper.'
negative_constraints:
- Rail width ownership stays with FinalGUISpec; this unit consumes the ratified envelope and tier ladder without redefining shell-level clamps.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/FinalGUISpec.md
```

### GI-040 - Scheduled-Workflow Observation Rule Consumption In Rail Rendering

```yaml
plan_unit_id: GI-040
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  Rail rendering consumes the existing Actions observation freshness rule: a scheduled workflow with no
  fresh observation renders as stale or unknown, and a stale observation is not failure evidence before the
  governing schedule timestamp has passed. Before that timestamp, absence of a fresh observation must not
  render the workflow row as skipped or failed; after it, failure or skip still requires a concrete run,
  skipped outcome, failed outcome, or missed-run signal reported by GitHub. The stale presentation state
  maps to actions_observation_stale (warning, retryable, refresh CTA), and receipts keep the shared
  wait_state_class?, timeout_class?, and observation timestamps from Plans/Contracts_V0.md. Pinned-workflow
  health badges for scheduled workflows follow the same rule and must not go red on staleness alone.
gui_related: true
gui_classification_reason: Governs how scheduled-workflow rows and health badges render staleness versus failure.
depends_on: []
unblocks: []
acceptance_criteria:
- No scheduled-workflow row or badge renders failed or skipped from observation absence before the governing timestamp.
- Stale presentation uses actions_observation_stale with a refresh CTA and preserves the Contracts_V0 observation fields.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_scheduled_observation
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: cozy_shelves_scheduled_observation_consumption
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- actions_observation_stale
- wait_state_class?
- timeout_class?
compatibility_only_notes: []
negative_constraints:
- Observation absence is never synthesized into a failure or skip outcome by the UI.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/Contracts_V0.md
```

### GI-041 - Worktree Prune Command Duality Resolution

```yaml
plan_unit_id: GI-041
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  cmd.git.worktree.request_prune and cmd.git.worktree.prune are two phases of one flow, not competing
  commands. cmd.git.worktree.request_prune is the request form: it is ownership-gated, subject to worktree
  ownership badges, admin override policy, prune protection defaults, and safe-point awareness, and it
  produces a prune request rather than mutating anything. cmd.git.worktree.prune executes an approved prune
  request: it requires the approved request as its subject, carries the destructive confirmation fields
  target_worktree_id, expected_path, expected_branch, confirmation_text, and permission_snapshot_id, routes
  through the shared confirm surface, and honors the disabled states dirty_worktree, untracked_files,
  protected_branch, missing_remote, permission_denied, and operation_in_progress. Direct prune execution
  without an approved request is invalid. Neither command supersedes the other; this states the relationship
  between the GI-019 request form and the FABLE 2026-07-08 Worktree Topology Commands executor without
  editing either source.
gui_related: true
gui_classification_reason: Governs the user-visible prune request and execution actions on Worktrees rows.
depends_on: [GI-019]
unblocks: []
acceptance_criteria:
- request_prune never mutates worktree state; prune executes only an approved request.
- prune carries the five destructive confirmation fields and honors the six disabled states.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: cozy_shelves_worktree_prune_duality
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: cozy_shelves_worktree_prune_duality
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)'
preserved_exact_tokens:
- cmd.git.worktree.request_prune
- cmd.git.worktree.prune
- permission_snapshot_id
compatibility_only_notes: []
negative_constraints:
- Neither prune command is retired or renamed by this unit; the request-then-execute relationship is the only change.
- Destructive execution must not bypass the shared confirm surface or the approved-request precondition.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/WorktreeGitImprovement.md
```
