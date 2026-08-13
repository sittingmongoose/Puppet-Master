# Shard 063: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/FinalGUISpec.md`

Source lines: L30556-L31038

Source SHA256: `cb8e793fd3b46d17be00745b05ace785aadc8d791bd0d3261415c532351d2b22`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 shell behaviors (tabstrip recipe, hover micro-interactions, toast stack, status bar chips, terminal customization and split guard, and the testing, agents, and notifications side panels) into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts. The PMConcept7 Concept Promotion Addendum (2026-07-23) supersedes the toast-stack, status-bar chip, hover-jiggle, and notifications-bell/side-panel portions of this addendum; F3-446, F3-447, F3-448, and F3-453 below are amended in place and F3-460, F3-461, and F3-465 carry the successor canon.

### F3-445 - Unified Non-Editor Tabstrip Recipe

```yaml
plan_unit_id: F3-445
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Non-editor tab systems, including page tabs, side-panel occupant tabs, and bottom-panel
  tabs, share one tabstrip recipe: tabs lay out on a single non-wrapping row, the strip
  scrolls horizontally when tabs overflow its width, and tab labels truncate with an
  ellipsis. Tabs shrink flexibly between a 56px minimum and a 180px maximum width. Editor
  tabs are explicitly excluded from this recipe and keep the width-aware "+N more" overflow
  chip specified by F3-421.
gui_related: true
gui_classification_reason: This unit defines visible tabstrip layout, scrolling, and label truncation for non-editor tab systems.
split_recommended: false
depends_on: [F3-421]
unblocks: []
acceptance_criteria:
- "Page tabs, side-panel occupant tabs, and bottom-panel tabs render on one non-wrapping row that scrolls horizontally on overflow with ellipsized labels."
- "Tabs in these systems shrink no narrower than 56px and grow no wider than 180px."
- "Editor tabs keep the F3-421 +N more overflow chip and do not adopt the scroll-and-ellipsis recipe."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: unified_non_editor_tabstrip_recipe
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:27497"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "56px"
- "180px"
- "+N more"
negative_constraints:
- "Editor tabs keep the +N more overflow chip; the scroll-and-ellipsis recipe must not replace editor tab overflow behavior."
compatibility_only_notes:
- "Slint portability: the tabstrip renders as an opaque horizontally scrollable row of precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-446 - Shell Hover Micro-Interactions

```yaml
plan_unit_id: F3-446
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Shell elements carrying the sheen treatment, approximately 40 shell elements, receive a
  hover-lift with a sheen highlight, driven by event delegation from a shared pointer
  handler and executed as time-bounded animation primitives rather than per-frame style
  writes. Pointer parallax on background layers runs only while the glass theme family's
  depth background mode is active, and all document-level pointer-move work, including
  parallax sampling and the F3-465 magnet spotlight driver, is merged into a single shared
  document pointer-move handler. Both effects are fully disabled under reduced motion.
gui_related: true
gui_classification_reason: This unit defines visible sheen hover-lift and parallax motion on shell controls.
split_recommended: false
depends_on: [F3-428]
unblocks: []
acceptance_criteria:
- "Sheen-treated shell elements receive the hover-lift and sheen highlight on hover."
- "Pointer parallax runs only in the glass depth background mode, and exactly one merged document pointer-move handler services parallax, delegated hover effects, and the F3-465 magnet spotlight driver."
- "With reduced motion active, sheen hover-lift and parallax are both disabled."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shell_hover_micro_interactions
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5482"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "sheen"
- "parallax"
- "depth"
negative_constraints:
- "Do not attach per-control pointer-move listeners or multiple document pointer-move handlers for these effects."
- "Do not run pointer parallax outside the glass depth background mode."
compatibility_only_notes:
- "Slint portability: the hover-lift maps to animated hover states on opaque precomputed surfaces with no per-frame style writes; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The one-shot hover jiggle wobble on designated shell controls is retired per PMConcept7 rev 7, superseded by the F3-465 magnet spotlight hover system on the same selector set; the sheen hover-lift and glass depth parallax remain live and stay reduced-motion-disabled."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-447 - Toast Stack Contract

```yaml
plan_unit_id: F3-447
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Ephemeral toast notifications stage beneath the title-bar notification stack with the
  newest toast on top and show at most 5 concurrent staged toasts; when a new toast would
  exceed the cap, the oldest toast is dismissed to make room. Each staged toast
  auto-dismisses after a 3.4s time to live, and dismissal plays a fade exit animation
  before removal. Ephemeral toasts are never archived to the shared alert store and leave
  no store entry. Under reduced motion, staged toasts dismiss instantly with no exit
  animation.
gui_related: true
gui_classification_reason: This unit defines visible ephemeral toast staging, lifetime, and dismissal behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "At most 5 staged toasts render concurrently beneath the title-bar notification stack; a new toast beyond the cap evicts the oldest."
- "Each staged toast auto-dismisses after its 3.4s time to live and plays a fade exit animation on dismissal."
- "The newest toast stages on top of the staged set."
- "Ephemeral toasts never archive to the shared alert store and leave no store entry."
- "Under reduced motion, dismissal is instant with no exit animation."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: toast_stack_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1484"
- "Plans/FinalGUISpec.md:1918"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "5"
- "3.4s"
negative_constraints:
- "Do not render more than 5 concurrent staged toasts or let a toast outlive its time to live without an eviction or dismissal path."
- "Do not archive an ephemeral toast to the shared alert store or leave any store entry for it."
compatibility_only_notes:
- "Slint portability: staged toasts render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The bottom-right standing toast stack surface is retired per PMConcept7 title-bar notifications; ephemeral toasts now stage beneath the title-bar notification stack owned by F3-460, with the sprout inbox panel owned by F3-461."
owner_boundary_notes:
- "F3-460 owns the title-bar notification stack and count badge that hosts this staging area; this unit owns the ephemeral staging cap, ordering, time to live, and exit behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-448 - Status Bar Chip Inventory And Click Behaviors

```yaml
plan_unit_id: F3-448
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The status bar carries a canonical chip inventory: a workspace status menu; an
  orchestrator status chip; a semantic index ticker; a ports chip; a branch chip; and a
  sync chip. No platform picker, model picker, chat mode chip, context meter, or
  notifications bell renders in the status bar; the assistant chat surface owns requested
  platform, model, and mode with their applies-next-turn registration, the chat context
  ring owns context usage display, and the title-bar notification stack and count badge
  own the notification affordance.
gui_related: true
gui_classification_reason: This unit defines visible status bar chips and their click behaviors.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The status bar renders exactly the workspace status menu, orchestrator status chip, semantic index ticker, ports, branch, and sync chips."
- "No platform picker, model picker, chat mode chip, context meter, or notifications bell renders in the status bar."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: status_bar_chip_inventory_and_click_behaviors
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:545"
- "Plans/FinalGUISpec.md:553"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "workspace status menu"
- "semantic index ticker"
negative_constraints:
- "Do not reintroduce platform, model, mode, context, or notification chips into the status bar; those affordances are owned by the assistant chat surface, the chat context ring, and the title-bar notification stack."
compatibility_only_notes:
- "Slint portability: chips render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The status-bar platform picker chip and model picker chip are retired per PMConcept7 status-bar trim; the assistant chat surface owns requested platform and model, and the applies-next-turn semantics move with that chat-side platform/model registration (ACD-437 lineage)."
- "The status-bar chat mode chip is retired; the assistant chat surface owns requested chat mode with the same applies-next-turn registration."
- "The status-bar context bar chip, including its context-window fill meter and 75% warning presentation, is retired; the chat context ring owns context usage display."
- "The status-bar notifications bell and its popover are retired per PMConcept7 title-bar notifications; the unread affordance is the title-bar notification stack count badge (F3-460) and the inbox surface is the sprout inbox panel (F3-461)."
owner_boundary_notes:
- "Plans/assistant-chat-design.md owns requested platform, model, and mode registration and their applies-next-turn semantics; the title-bar notification stack and inbox are owned by F3-460 and F3-461; this unit records the trimmed status-bar chip inventory."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-449 - Terminal Tab Customization

```yaml
plan_unit_id: F3-449
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal workgroups and individual terminals support user customization from terminal tab
  context and customize menus: per-workgroup rename, per-terminal rename, an accent color
  chosen from an 8-color swatch, and an icon chosen from a 20-icon catalog. Chosen names,
  colors, and icons render on the corresponding workgroup and terminal tabs.
gui_related: true
gui_classification_reason: This unit defines visible terminal tab rename, color, and icon customization controls.
split_recommended: false
depends_on: [F3-062, F3-063]
unblocks: []
acceptance_criteria:
- "Workgroups and terminals can each be renamed from their tab context or customize menus."
- "The accent swatch offers exactly 8 colors and the icon catalog offers exactly 20 icons."
- "Chosen names, colors, and icons render on the corresponding workgroup and terminal tabs."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_tab_customization
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:6892"
- "Plans/FinalGUISpec.md:6945"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "8"
- "20"
negative_constraints:
- "Do not expose customization through hidden gestures only; the tab context or customize menu is the canonical entry point."
compatibility_only_notes:
- "Slint portability: context and customize menus render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-450 - Terminal Pane Split Guard

```yaml
plan_unit_id: F3-450
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A terminal workgroup section holds at most 4 leaf panes, arranged in a 2x2 grid at
  capacity. When a section is at the 4-pane cap, split affordances render disabled with a
  visible reason instead of disappearing or failing silently.
gui_related: true
gui_classification_reason: This unit constrains visible terminal split layout and split affordance states.
split_recommended: false
depends_on: [F3-063]
unblocks: []
acceptance_criteria:
- "No split action can create a fifth pane in a terminal workgroup section."
- "Four panes in a section lay out as a 2x2 grid."
- "At the cap, split affordances are disabled with a visible reason rather than hidden or silently inert."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_pane_split_guard
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:6945"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "4"
- "2x2"
negative_constraints:
- "Split affordances must not silently no-op or disappear at the pane cap; they disable with a reason."
compatibility_only_notes:
- "Slint portability: disabled split affordances and their reason presentation render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-451 - Testing Side Panel

```yaml
plan_unit_id: F3-451
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Testing side panel joins the canonical side-panel inventory. The occupant displays
  the project's test policy, the last test run status and results, and a run-tests control
  wired to the test runner subsystem so runs started from the panel execute through the
  canonical test execution path.
gui_related: true
gui_classification_reason: This unit defines a visible side panel and its displayed testing surface.
split_recommended: false
depends_on: [F3-042, F3-035]
unblocks: []
acceptance_criteria:
- "Testing appears in the canonical side-panel inventory and opens as a side-panel occupant."
- "The occupant displays the test policy and the last run status and results."
- "The run-tests control invokes the test runner subsystem's canonical execution path."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: testing_side_panel
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5854"
- "Plans/FinalGUISpec.md:5482"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Testing"
- "test policy"
negative_constraints:
- "The panel must not define or duplicate test execution semantics; it displays and wires to the test runner subsystem."
compatibility_only_notes:
- "Slint portability: the panel occupant renders as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/Automated_Testing_System.md owns test execution behavior, policy semantics, runner selection, and result production; this unit records only the Testing panel's presence in the side-panel inventory and its display and wiring surface."
- "The F3-042 inventory edit (8 panels to 11) lands in the same seal; this unit references plain F3-042."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-452 - Agents Side Panel

```yaml
plan_unit_id: F3-452
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Agents side panel joins the canonical side-panel inventory. The occupant mirrors the
  subagent registry, listing active and available subagents, and provides lineage
  entrypoints that navigate to the corresponding agent lineage views.
gui_related: true
gui_classification_reason: This unit defines a visible side panel and its displayed subagent surface.
split_recommended: false
depends_on: [F3-042]
unblocks: []
acceptance_criteria:
- "Agents appears in the canonical side-panel inventory and opens as a side-panel occupant."
- "The occupant lists active and available subagents mirrored from the subagent registry."
- "Lineage entrypoints navigate to the corresponding agent lineage views."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agents_side_panel
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5854"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Agents"
- "subagent registry"
negative_constraints:
- "The panel must not maintain its own subagent state; it mirrors the subagent registry."
compatibility_only_notes:
- "Slint portability: the panel occupant renders as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "The subagent registry and lineage semantics are owned by their existing planning documents; this unit records the panel's presence in the inventory and its mirror and entrypoint surface."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-453 - Notifications Side Panel And Alert Lifecycle

```yaml
plan_unit_id: F3-453
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  This unit owns the shared alert store. Alerts carry an acknowledge (ack) and snooze
  lifecycle: acknowledging clears an alert's unread state, snoozing hides the alert until
  its snooze window elapses, and unresolved alerts persist in the store and render in the
  title-bar sprout inbox list. Unread alerts drive the count badge on the title-bar
  notification stack (F3-460). The title-bar collapsed stack and the sprout inbox panel
  render from this one alert store; no surface keeps a private copy of alert state.
gui_related: true
gui_classification_reason: This unit defines the shared alert store, alert lifecycle controls, and the unread indicator contract.
split_recommended: false
depends_on: [F3-042]
unblocks: []
acceptance_criteria:
- "Alerts support acknowledge and snooze; ack clears unread state and snooze hides the alert until its snooze window elapses; unresolved alerts persist in the shared alert store."
- "Unread alerts drive the count badge on the title-bar notification stack (F3-460)."
- "The title-bar collapsed stack and the sprout inbox panel render from one shared alert store; no surface keeps a private alert copy."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: notifications_side_panel_and_alert_lifecycle
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:72"
- "Plans/FinalGUISpec.md:5854"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "ack"
- "snooze"
- "count badge"
negative_constraints:
- "No surface may maintain a private alert copy; the title-bar collapsed stack and the sprout inbox panel consume the one shared alert store."
- "Alert severity, source, and owner-route data follow the shared notification model; the inbox panel must not invent local alert state."
compatibility_only_notes:
- "Slint portability: the inbox list, count badge, and lifecycle controls render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The dedicated Notifications side panel affordance is retired per PMConcept7 title-bar notifications; the alert store and ack/snooze lifecycle survive in this unit, and the rendering surfaces are the title-bar notification stack (F3-460) and the sprout inbox panel (F3-461)."
- "The activity-bar Notifications item and its rail unread dot are retired; the unread affordance is the title-bar notification stack count badge (F3-460)."
- "The status-bar notifications bell and its popover are retired; the amended F3-448 status-bar inventory no longer includes a bell."
owner_boundary_notes:
- "The design table listed F3-448 and F3-453 as mutually dependent; the cycle was resolved one-way and stays one-way after the PMConcept7 retarget: F3-453 owns the shared alert store and depends only on F3-042, while the title-bar stack and inbox presentation units (F3-460, F3-461) depend on F3-453."
- "The F3-042 inventory edit (8 panels to 11) landed in the 2026-07-16 seal; the 2026-07-23 PMConcept7 promotion retires the notifications panel from that inventory. This unit references plain F3-042."
owner_hints:
- "Plans/FinalGUISpec.md"
```
