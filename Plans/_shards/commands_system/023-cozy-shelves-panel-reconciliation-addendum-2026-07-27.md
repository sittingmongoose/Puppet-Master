# Shard 023: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/Commands_System.md`

Source lines: L4294-L4473

Source SHA256: `f083fc0c7e53c324e4b735dc7df7db49667b8f504ac8c22329fa3aa4f6274487`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum propagates the ratified Cozy Shelves panel-review decisions (user decision 2026-07-27) into Commands-owned prefix reservation, panel-switch destination consumption, and availability/confirmation class consumption. Source lineage is the winning left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source-lineage-only: no concept HTML/CSS/class names are copied into spec). Command registration rows remain owned by `Plans/UI_Command_Catalog.md`; this addendum mirrors that catalog addendum without minting rows here. It does not edit existing PlanUnits, retired bridges, `preserved_exact_tokens`, or canonical_text, and it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Renumber note (CS-050 structural repair): the duplicate second `## 7` heading (`UICommand catalog entry`) is retitled `## 8. UICommand catalog entry`, and the follow-on headings are renumbered in cascade: `## 9. OpenCode baseline and Puppet Master deltas` (subsections `### 9.1 Baseline`, `### 9.2 Puppet Master deltas`) and `## 10. Acceptance criteria`. Heading text is otherwise preserved verbatim; no command identifiers, command-owner refs, or acceptance IDs are renamed. `## 7. Reserved built-in slash commands` is now the single canonical Section 7 anchor, satisfying CS-050 acceptance. Per the FABLE 2026-07-08 addendum rule, citations must use heading names, not bare section numbers; a repo-wide check found no cross-doc bare-number citations of the renumbered sections.

### CS-060 - Panel Domain Reserved Prefix Registry Extension

```yaml
plan_unit_id: CS-060
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The reserved command-prefix registry extends to cmd.docker., cmd.search., cmd.artifacts.,
  cmd.agents., cmd.editor., cmd.panel., and cmd.terminal., joining the existing reserved
  families cmd.git., cmd.github., cmd.source_control., cmd.file., cmd.permissions.,
  cmd.runtime., cmd.testing., cmd.browser., and cmd.persona. Minting authority for every
  reserved prefix is Plans/UI_Command_Catalog.md; non-owner docs and User Commands may
  consume but not mint commands under them. cmd.actions. is explicitly NOT reserved and has
  no minting authority: GitHub Actions commands live under cmd.github., and the concept-only
  ID cmd.actions.rerun must reconcile to cmd.github.actions.rerun before any catalog row or
  wiring coverage can treat it as real.
gui_related: false
gui_classification_reason: Prefix reservation is command-registry governance, not a visible GUI surface.
split_recommended: false
depends_on: [CS-013, CS-039, CS-050]
unblocks: []
acceptance_criteria:
  - The reserved-prefix registry enumerates all sixteen reserved families with Plans/UI_Command_Catalog.md as the sole minting authority.
  - User Command creation whose name collides into any reserved prefix is rejected, consistent with the AC-CMD02/AC-CMD10 reserved-name boundaries.
  - cmd.actions. is absent from the reserved registry; no cmd.actions.* command can be minted, and GitHub Actions IDs reconcile under cmd.github.
  - No prototype command ID under a newly reserved prefix is treated as real until it has a UI_Command_Catalog row plus Wiring_Matrix reverse coverage, with fail-closed dispatch on mismatch.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future catalog/wiring reverse-coverage checks for cmd.* references
risk_class: command_prefix_minting_ambiguity
reasoning_tier: medium
context_scope: cozy_shelves_panel_command_prefix_reservation
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: reserved_prefix_registry_extension
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - fable-2026-07-08:sfk-03404db2c315565320a4b3e9
preserved_exact_tokens:
  - cmd.docker.
  - cmd.search.
  - cmd.artifacts.
  - cmd.agents.
  - cmd.editor.
  - cmd.panel.
  - cmd.terminal.
  - cmd.github.actions.rerun
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not mint, rename, or retire catalog rows from this constraint; Plans/UI_Command_Catalog.md remains the sole registration owner.
  - Do not reserve cmd.actions. or let a cmd.actions.* ID survive reconciliation as canonical.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### CS-061 - Panel Switch Destination Vocabulary And Undock Adjudication

```yaml
plan_unit_id: CS-061
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.panel.switch remains a pure view-state command whose controlled destination vocabulary
  is the canonical panel-id inventory owned by Plans/FinalGUISpec.md Section 4.1: search,
  chat, files, source_control, github_actions, docker_manager, testing, agents, artifacts,
  and run_debug. Commands consume that inventory by reference and must not define, extend,
  reorder, or fork it locally; an unknown destination refuses before dispatch. Panel
  detachment is adjudicated as cmd.panel.undock with cmd.panel.redock as its inverse;
  detach (cmd.panel.detach) is a recorded compatibility alias of cmd.panel.undock, never a
  second handler or peer command.
gui_related: true
gui_classification_reason: The destination vocabulary determines visible panel navigation targets and the undock/redock affordance.
split_recommended: false
depends_on: [CS-006, CS-011, CS-060]
unblocks: []
acceptance_criteria:
  - cmd.panel.switch accepts only the ten canonical panel ids from the Plans/FinalGUISpec.md Section 4.1 inventory; any other destination refuses before dispatch.
  - cmd.panel.switch stays view-state only; it may consume normalized routing context but never replaces the canonical route_target model.
  - Undock and redock resolve to single handlers; cmd.panel.detach exists only as recorded alias metadata of cmd.panel.undock with no separate handler, row semantics, or event meaning.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future panel-switch destination-vocabulary and alias-dispatch fixtures
risk_class: panel_destination_vocabulary_drift
reasoning_tier: medium
context_scope: cozy_shelves_panel_switch_destination_vocabulary
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
node_compile_hint:
  mode: panel_switch_vocabulary_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
preserved_exact_tokens:
  - cmd.panel.switch
  - cmd.panel.undock
  - cmd.panel.redock
  - docker_manager
  - github_actions
  - source_control
  - run_debug
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not enumerate a second panel-id vocabulary in this document; Plans/FinalGUISpec.md Section 4.1 owns the inventory.
  - Do not promote cmd.panel.detach to a canonical command or let cmd.panel.switch become an object-first navigation command.
owner_hints: [Plans/Commands_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```

### CS-062 - Panel Command Availability And Confirmation Class Assignments

```yaml
plan_unit_id: CS-062
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Newly registered panel-domain commands declare availability and confirmation classes
  before palette, shortcut, or route dispatch, mirroring the UI_Command_Catalog addendum
  rows: cmd.testing.watch_run, cmd.artifacts.watch_recording, cmd.docker.container.stop,
  and cmd.docker.container.restart are live-run only; cmd.artifacts.play_recording and
  cmd.testing.export_bundle are record-only/export-only. cmd.file.delete,
  cmd.git.discard_hunks, cmd.source_control.stash.drop, cmd.git.worktree.remove,
  cmd.docker.container.delete, cmd.docker.image.delete, cmd.docker.compose.scenario.delete,
  cmd.docker.cleanup.prune, cmd.search.replace_all, and cmd.testing.quarantine carry
  owner-assigned destructive confirmation classes (strong, hard_gate, non_reversible, or
  compensating_action_only as assigned by the catalog) and dispatch only through the shared
  confirm surface referenced by the unified expander contract. Commands never infers
  historical safety from a label; a panel command without a declared availability class
  refuses palette, shortcut, and route dispatch. Blocked panel commands surface the owner
  blocked_reason_code with ordered allowed_action_ids[], consumed by reference from the
  unified expander contract owner.
gui_related: true
gui_classification_reason: Availability classes, confirmation gates, disabled reasons, and blocked-action payloads are visible command states in the panel expanders.
split_recommended: false
depends_on: [CS-008, CS-060, CS-061]
unblocks: []
acceptance_criteria:
  - Every newly registered panel-domain command row declares exactly one availability class (live-run only, historical-safe, or record-only/export-only) before palette, shortcut, or route dispatch; class-less dispatch refuses.
  - cmd.testing.watch_run, cmd.artifacts.watch_recording, cmd.docker.container.stop, and cmd.docker.container.restart refuse in historical or record-only contexts; cmd.artifacts.play_recording and cmd.testing.export_bundle perform no live mutation.
  - Each listed destructive command carries its catalog-assigned confirmation class and preserves owner-defined confirmation, gating, preview, and blocked-action checks before dispatch; discoverability never weakens confirmation.
  - Destructive panel actions dispatch only through the shared confirm surface; no expander-local confirmation variant is introduced.
  - Blocked panel commands present blocked_reason_code plus ordered allowed_action_ids[] consumed from the owner payload, and admissibility is evaluated against allowed_action_ids[] before mutation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future availability-class and destructive-confirmation dispatch fixtures
risk_class: panel_command_class_omission
reasoning_tier: medium
context_scope: cozy_shelves_panel_command_availability_confirmation
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: panel_command_class_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
preserved_exact_tokens:
  - live-run only
  - record-only/export-only
  - hard_gate
  - compensating_action_only
  - blocked_reason_code
  - allowed_action_ids[]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not assign or override concrete per-row classes here; Plans/UI_Command_Catalog.md owns the row-level assignments this unit mirrors.
  - Do not re-own the unified expander contract, its slot order, or its confirm surface; consume blocked_reason_code and allowed_action_ids[] by reference only.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```
