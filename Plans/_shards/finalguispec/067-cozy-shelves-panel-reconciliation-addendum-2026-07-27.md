# Shard 067: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/FinalGUISpec.md`

Source lines: L32502-L33180

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum reconciles the winning Cozy Shelves left-rail concept family (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html`, both source-lineage-only) against FinalGUISpec canon and closes the spec gaps the panel review exposed. It pins the side-panel width envelope per user decision 2026-07-27, makes this document the canonical owner of the unified shelf-expander contract and its web-to-Slint motion portability map, establishes the per-theme category shelf palette indirection layer, registers the missing panel-state persistence keys and Slint panel host files, adds successor presentation canon for the Agents panel over F3-452, records the left-versus-right rail placement as an explicitly carried deviation, and points the panel-context deep-link envelope extensions at Crosswalk ownership. Concept HTML, CSS, colors, class names, and demo data are never copied into spec or implementation. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-471 - Side Panel Width Envelope Pin

```yaml
plan_unit_id: F3-471
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The side-panel width envelope is pinned per user decision 2026-07-27: 240px minimum,
  480px maximum, 280px default initial width. This unit supersedes the F3-035 sentence
  making the side panel "resizable between a 220px minimum and a 50vw maximum"; the rest
  of F3-035's structural-zone canon is unchanged. F3-034's preserved 240-480px
  shell-diagram tokens, F3-072's 240px clamp token, and F3-196's 240px-minimum responsive
  tiers are declared consistent with this pin and need no amendment. 220px is demoted to a
  test-only adversarial width: fit harnesses may render panels at 220px to prove graceful
  degradation below the floor, but no shipping surface may open, resize to, or persist a
  side panel narrower than 240px. The space-accounting example figure of 380px at
  1920x1080 remains an illustrative example only; 280px is the canonical default width.
gui_related: true
gui_classification_reason: This unit pins the visible side-panel width envelope and default width.
split_recommended: false
depends_on: [F3-035]
unblocks: []
acceptance_criteria:
- "The side panel enforces a 240px minimum, a 480px maximum, and a 280px default initial width."
- "The F3-035 220px-minimum / 50vw-maximum sentence is superseded by this unit; F3-034, F3-072, and F3-196 stand as consistent without amendment."
- "220px appears only in fit-harness adversarial tests; no shipping surface opens, resizes to, or persists a side panel narrower than 240px."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: side_panel_width_envelope_pin
  create_worknodes: false
source_lineage:
- "User decision 2026-07-27 (Cozy Shelves panel review ratification)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "240px"
- "480px"
- "280px"
- "220px"
- "50vw"
negative_constraints:
- "Do not let any shipping surface open, resize to, or persist a side panel narrower than 240px; 220px exists only as a test-only adversarial width."
compatibility_only_notes:
- "Slint portability: width clamping is plain layout constraint math on opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
- "The 380px side-panel figure in the space-accounting example remains illustrative lineage, not a default."
stale_retired_dispositions:
- "The F3-035 220px-minimum / 50vw-maximum sentence (2026-07-16 lineage) is superseded by this unit's 240px / 480px / 280px envelope; it stays findable in F3-035 as superseded lineage."
owner_boundary_notes:
- "F3-035 continues to own the structural-zone model; this unit owns only the width envelope numbers and the 220px test-only demotion."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-472 - Unified Shelf Expander Contract

```yaml
plan_unit_id: F3-472
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  This unit is the canonical owner of the unified shelf-expander pattern used by
  expandable rows across all side-panel occupants; other planning documents reference
  this contract and do not re-own it. Rows are collapsed by default. Each row header is
  one single accessible activation control (a real button in accessibility terms) that
  exposes its expanded or collapsed state (aria-expanded semantics on web-lineage
  surfaces; accessible-expanded in Slint). Keyboard contract: Enter or Space toggles the
  focused header; Escape collapses the expanded row and returns focus to its header. The
  expanded body renders slots in fixed order: kv-facts, then status-detail, then
  blocked-reason-detail, then actions, then overflow. The body is capped at approximately
  200px with internal scroll beyond the cap. Blocked reasons are always visible outside
  the collapsible body: a blocked row's collapsed header carries the blocked summary, so
  collapsing never hides blockage. Panels may opt into single-open exclusivity; a
  user-pinned row stays open and is exempt from exclusivity eviction. Destructive actions
  inside expander bodies route through the shared confirm surface, never inline. Blocked
  payloads render from blocked_reason_code plus the ordered allowed_action_ids[]; panels
  render the delivered action set and never invent actions.
gui_related: true
gui_classification_reason: This unit defines the visible expander row anatomy, slot order, keyboard behavior, and blocked-reason visibility contract.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Expander rows are collapsed by default, headed by one accessible button exposing expanded state, toggled by Enter/Space, and collapsed by Escape with focus returned to the header."
- "Expanded bodies render slots in the fixed order kv-facts, status-detail, blocked-reason-detail, actions, overflow, capped at approximately 200px with internal scroll."
- "Blocked rows keep their blocked summary visible in the collapsed header; exclusivity is opt-in per panel and pinned rows are exempt from eviction."
- "Destructive expander actions route through the shared confirm surface, and blocked payloads render blocked_reason_code plus ordered allowed_action_ids[] without invented actions."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: unified_shelf_expander_contract
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves files concept; source-lineage-only)"
preserved_exact_tokens:
- "aria-expanded"
- "kv-facts"
- "status-detail"
- "blocked-reason-detail"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "200px"
negative_constraints:
- "No panel may hide a blocked reason inside the collapsible body, render destructive actions without the shared confirm surface, or invent actions outside the delivered allowed_action_ids[]."
- "No other document may re-own this expander contract; consumers reference this unit."
compatibility_only_notes:
- "Slint portability: the header is a TouchArea plus FocusScope delegate exposing accessible-expanded; expansion animates the height of a clipped rect to a measured content height; surfaces are opaque and precomputed with no arbitrary-content backdrop blur, no SVG filters, and precomputed color math."
stale_retired_dispositions: []
owner_boundary_notes:
- "Blocked payload semantics (blocked_reason_code, allowed_action_ids[]) are owned by the canonical blocked/recovery contracts; this unit owns only their placement and rendering order inside expander rows."
- "The shared confirm surface is owned by its existing canon; this unit routes destructive expander actions to it."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-473 - Expander Motion Portability Map

```yaml
plan_unit_id: F3-473
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The concept family's web motion idioms map to Slint primitives one-for-one, and
  implementations use only the Slint side of the map: (1) CSS grid-rows expansion spring
  maps to an animated height property on a clipped rect; (2) max-height tween maps to an
  animation toward the measured content height, never an arbitrary cap; (3) box-shadow
  attention pulse maps to an opacity/scale ring overlay element; (4) underline width ink
  maps to a scaleX or x transform animation on an ink rect; (5) corner sprout menu maps
  to a PopupWindow with a corner-origin transform; (6) scroll-reveal maps to a one-shot
  entrance stagger on first model paint, never re-triggered on scroll; (7) reduced-motion
  parity applies to every row of this map: when reduced motion is set, mapped animations
  complete instantly, including zero transition-delay equivalents so no delayed state
  flips remain.
gui_related: true
gui_classification_reason: This unit defines the visible motion vocabulary for panel expanders and its Slint expression.
split_recommended: false
depends_on: [F3-472]
unblocks: []
acceptance_criteria:
- "Each web idiom in the map (grid-rows spring, max-height tween, box-shadow pulse, width ink, sprout menu, scroll-reveal) has exactly the stated Slint primitive and no DOM-shaped emulation."
- "Entrance stagger runs once on first model paint and never re-triggers on scroll."
- "Reduced motion completes all mapped animations instantly with zero transition-delay equivalents."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: expander_motion_portability_map
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves files concept; source-lineage-only)"
preserved_exact_tokens:
- "PopupWindow"
- "scaleX"
negative_constraints:
- "Do not port web motion idioms literally (no max-height caps, no shadow-blur animation, no scroll-linked reveal); only the Slint column of the map ships."
compatibility_only_notes:
- "Slint portability: all mapped motions are property animations on opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-472 owns what the expander shows; this unit owns only how its state changes move."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-474 - Category Shelf Palette Indirection Layer

```yaml
plan_unit_id: F3-474
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Category shelf colors resolve through a per-theme --cat-* indirection token family
  (user decision 2026-07-27). By default every --cat-* token aliases the theme's existing
  accent tokens, so most themes add no new colors. Exactly two themes override:
  retro-dark sets the category green to #4CAF50 and the category blue to #2196F3, and
  basic-light sets the category purple to #9C27B0 and the category amber to #F57C00.
  --accent-primary is reserved for selection state and never doubles as a category color.
  Category tint fills use the fixed tint steps 7%, 11%, 16%, and 20% over the panel base
  color, precomputed per theme at build time; no runtime color mixing occurs.
gui_related: true
gui_classification_reason: This unit defines the visible category color system for panel shelves and its theme overrides.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Category colors resolve only through the --cat-* indirection family; defaults alias theme accent tokens with overrides existing solely in retro-dark (#4CAF50, #2196F3) and basic-light (#9C27B0, #F57C00)."
- "--accent-primary renders selection state only and never serves as a category color."
- "Category tints are the precomputed 7%, 11%, 16%, and 20% steps over the panel base per theme; no runtime color mixing."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: category_shelf_palette_indirection_layer
  create_worknodes: false
source_lineage:
- "User decision 2026-07-27 (Cozy Shelves panel review ratification)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "--cat-*"
- "--accent-primary"
- "#4CAF50"
- "#2196F3"
- "#9C27B0"
- "#F57C00"
- "7%"
- "11%"
- "16%"
- "20%"
negative_constraints:
- "Do not use --accent-primary as a category color, and do not add per-theme category overrides beyond the retro-dark and basic-light pairs without a new user decision."
compatibility_only_notes:
- "Slint portability: the --cat-* family expresses as Theme-global category tokens with all tint steps precomputed at build time as opaque colors; no arbitrary-content backdrop blur, no SVG filters, and no runtime color mixing."
stale_retired_dispositions: []
owner_boundary_notes:
- "Theme Token Tables remain the canonical per-theme value store; this unit adds the category indirection family and its two override sets to that canon."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-475 - Side Panel State Persistence Key Registrations

```yaml
plan_unit_id: F3-475
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The dot-v1 panel-state key family gains four registrations:
  docker_manager_panel_state.v1:{project_id}, testing_panel_state.v1:{project_id},
  agents_panel_state.v1:{project_id}, and source_control_panel_state.v1:{project_id},
  joining the existing search_panel_state.v1, gha_panel_state.v1, and
  artifact_panel_state.v1 registrations (F3-217). Plans/storage-plan.md remains the
  schema owner for every panel-state key; this unit is the GUI-side cross-registration
  that names the keys and their per-project scope, and the storage plan must carry the
  matching schema rows. The F3-162 source_control.project_state.{project_id} mention
  remains a separate data-scope record and is not this panel UX-state key.
gui_related: true
gui_classification_reason: This unit registers the persistence keys behind visible panel UX state restoration.
split_recommended: false
depends_on: [F3-217]
unblocks: []
acceptance_criteria:
- "docker_manager_panel_state.v1:{project_id}, testing_panel_state.v1:{project_id}, agents_panel_state.v1:{project_id}, and source_control_panel_state.v1:{project_id} are registered in the dot-v1 panel-state family."
- "Plans/storage-plan.md remains the schema owner and carries the matching schema rows; this unit adds no schema shapes."
- "source_control.project_state.{project_id} (F3-162) stays a distinct data-scope record, not conflated with the panel UX-state key."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: side_panel_state_persistence_key_registrations
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves files concept; source-lineage-only)"
preserved_exact_tokens:
- "docker_manager_panel_state.v1:{project_id}"
- "testing_panel_state.v1:{project_id}"
- "agents_panel_state.v1:{project_id}"
- "source_control_panel_state.v1:{project_id}"
negative_constraints:
- "Do not define key schemas here; Plans/storage-plan.md owns all panel-state schemas, retention, and migration."
compatibility_only_notes:
- "Slint portability: state restoration renders through opaque precomputed surfaces; restored state is structure only and panels revalidate before claiming live status."
stale_retired_dispositions: []
owner_boundary_notes:
- "Cross-registration: Plans/storage-plan.md owns the schema rows for these four keys; FinalGUISpec owns only the GUI-side registration and per-project scoping statement."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-476 - Slint Panel Host File Inventory Additions

```yaml
plan_unit_id: F3-476
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The panels/ Slint host-file inventory adds panels/search_panel.slint,
  panels/source_control_panel.slint, panels/repository_automation_panel.slint,
  panels/testing_panel.slint, panels/agents_panel.slint, and
  panels/artifacts_panel.slint, so every canonical side-panel occupant has a named host
  file; file_manager_panel.slint and docker_manager_panel.slint are already listed. Where
  the FABLE-addendum Slint Host File Inventory table names the same surface under a
  ui/<domain>/ path, both spellings denote one planned host surface, with the panels/
  spelling as the panel-occupant host. These paths are planned GUI host locations only;
  they create no implementation files and authorize no source tree.
gui_related: true
gui_classification_reason: This unit names the planned Slint host files behind visible side-panel occupants.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The panels/ inventory lists host files for search, source control, Actions & Pipelines, testing, agents, and artifacts panels in addition to the existing file manager and docker manager entries."
- "Duplicate ui/<domain>/ spellings in the FABLE Slint Host File Inventory resolve to the same planned surface, not a second file."
- "No implementation files are created and no source tree is authorized by these registrations."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_panel_host_file_inventory_additions
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "panels/search_panel.slint"
- "panels/source_control_panel.slint"
- "panels/repository_automation_panel.slint"
- "panels/testing_panel.slint"
- "panels/agents_panel.slint"
- "panels/artifacts_panel.slint"
negative_constraints:
- "Do not treat these planned host paths as created files or as authorization for a source tree."
compatibility_only_notes:
- "Slint portability: host files are the planned mount points for opaque precomputed panel surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The prior panels/ inventory state that named only chat and file manager panel host files is superseded by this fuller inventory; the FABLE Slint Host File Inventory table remains findable lineage for its ui/<domain>/ spellings."
owner_boundary_notes:
- "This unit amends the host-file inventory only; panel behavior stays with each panel's owner units and docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-477 - Agents Panel Presentation Canon

```yaml
plan_unit_id: F3-477
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Agents side panel (F3-452) gains successor presentation canon. Lifecycle: the panel
  renders one UI lifecycle vocabulary - queued, running, blocked(awaiting_input |
  awaiting_approval | throttled), attention_required, recovering, completed, failed -
  projected from coordination events; Plans/Contracts_V0.md and the Executor own the
  runtime enums, and this unit states the projection mapping without re-owning any
  runtime state machine (F3-452 <-> OSI-175, OSI-190, OSI-425..OSI-432 linkage). Lane:
  the panel's lane display is the capability_lane identity; tier-era words never render.
  Queue visibility: queued rows show queue position, enqueued-since duration, and the
  blocking reference when admission is deferred. Attention ordering: rows order blocked >
  running > queued > completed. Blocked rows render the literal blocking question and the
  waiting duration in the collapsed header per the F3-472 blocked-outside rule.
  Per-agent economics render tokens, cost, and context-fill; absent values render as n/a
  and never as 0. When the registry feed is stale the panel dims rows and shows a
  mirror-stale strip; staleness never overwrites agent state. OSI TaskStatus emoji glyphs
  map to bundled SVG icon_id entries; no emoji ever renders. The panel has no file-locks
  section: file-lock semantics are retired, and rows may show declared touch sets and
  file-activity claims only.
gui_related: true
gui_classification_reason: This unit defines the visible Agents panel lifecycle chips, queue and attention presentation, economics, staleness treatment, and icon substitution.
split_recommended: false
depends_on: [F3-452, F3-472]
unblocks: []
acceptance_criteria:
- "The panel renders only the projected lifecycle vocabulary queued, running, blocked(awaiting_input | awaiting_approval | throttled), attention_required, recovering, completed, failed, mapped from coordination events without re-owning runtime enums."
- "Lane display is capability_lane identity; queued rows show position, enqueued-since, and the blocking reference; rows order blocked > running > queued > completed."
- "Blocked rows show the literal blocking question and waiting duration in the collapsed header; economics render n/a for absent values and never 0."
- "Registry-feed staleness dims rows and shows a mirror-stale strip without overwriting agent state; OSI TaskStatus emoji glyphs render as bundled SVG icon_ids and no emoji ever renders."
- "The panel renders no file-locks section; only declared touch sets and file-activity claims appear."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agents_panel_presentation_canon
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Plans/orchestrator-subagent-integration.md (OSI-175, OSI-190, OSI-425..OSI-432 registry-mirror and tracking canon)"
preserved_exact_tokens:
- "queued"
- "running"
- "awaiting_input"
- "awaiting_approval"
- "throttled"
- "attention_required"
- "recovering"
- "capability_lane"
- "n/a"
- "icon_id"
negative_constraints:
- "Do not re-own runtime lifecycle enums; Contracts_V0 and the Executor own them, and this panel renders the stated projection only."
- "Do not render emoji glyphs, tier-era vocabulary, a file-locks section, or absent economics values as 0."
- "Do not source panel rows from .puppet-master/state side files; rows render from seglog/redb coordination projections per the OSI registry-mirror canon."
compatibility_only_notes:
- "Slint portability: lifecycle chips, queue rows, stale strip, and economics render as opaque precomputed surfaces with property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "File-lock semantics are retired for the Agents panel; declared touch sets and file-activity claims are the only file-facing rows."
owner_boundary_notes:
- "F3-452 remains the panel's inventory and registry-mirror anchor; Plans/Contracts_V0.md and the Executor own runtime enums; Plans/orchestrator-subagent-integration.md (OSI-175, OSI-190, OSI-425..OSI-432) owns tracking truth; this unit owns presentation and the projection statement only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-478 - Rail Placement Carried Deviation

```yaml
plan_unit_id: F3-478
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Cozy Shelves concept family mounts the panel rail on the left edge; the canonical
  shell slot for side-panel occupants remains the right-hand side panel until a dedicated
  placement decision is taken. This is recorded as an explicitly carried deviation:
  concept artifacts may continue to render a left rail without spec force, wiring-row
  ui_location strings are unaffected until the placement decision lands, and no unit may
  cite the concept family as authority for a left-mounted shell.
gui_related: true
gui_classification_reason: This unit records the visible rail-placement deviation between concept and canonical shell.
split_recommended: false
depends_on: [F3-035]
unblocks: []
acceptance_criteria:
- "The canonical side-panel slot remains right-hand; the concept family's left rail is a carried deviation with no spec force."
- "Wiring-row ui_location strings are unchanged until a dedicated placement decision lands."
- "No unit cites the concept family as authority for a left-mounted shell."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rail_placement_carried_deviation
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves files concept; source-lineage-only)"
preserved_exact_tokens:
- "ui_location"
negative_constraints:
- "Do not change side-panel placement, ui_location strings, or shell-slot canon on the basis of the concept family; only a dedicated placement decision may do so."
compatibility_only_notes:
- "Slint portability: placement is a layout-slot decision over opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-035 owns the structural-zone model including the right-hand side-panel slot; this unit records the deviation and its resolution condition only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-479 - Panel Context Deep-Link Envelope Extension Pointer

```yaml
plan_unit_id: F3-479
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The shared route/deep-link payload (F3-102) is to gain panel-context envelope fields
  for the search, testing, agents, artifacts, and files panels, registered in
  Plans/Crosswalk.md, which owns the envelope schema. Intended fields: search -
  search_query, search_scope, query_session_id, result_ref; testing - test_run_id,
  test_node_ref, failure_ref; agents - agent_id, capability_lane, blocked_sequence_ref;
  artifacts - artifact_id, artifact_kind, receipt_ref; files - file_path,
  selection_range, reveal_in_tree. This unit is a registration pointer only: FinalGUISpec
  consumes the envelope, and Plans/Crosswalk.md owns field names, shapes, and versioning
  and may adjust field naming at registration time without amending this unit.
gui_related: true
gui_classification_reason: This unit points the panel deep-link context fields at the Crosswalk-owned envelope so cross-surface pivots can land inside panels.
split_recommended: false
depends_on: [F3-102]
unblocks: []
acceptance_criteria:
- "Panel-context envelope fields for search, testing, agents, artifacts, and files are registered in Plans/Crosswalk.md with this unit's intended field lists as input."
- "FinalGUISpec consumes the envelope; Crosswalk.md owns field names, shapes, and versioning, and naming adjustments at registration time require no amendment here."
- "No second routing model is created; the fields extend the one shared route/deep-link payload."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_context_deep_link_envelope_extension_pointer
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves winning concept; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves files concept; source-lineage-only)"
preserved_exact_tokens:
- "query_session_id"
- "blocked_sequence_ref"
- "reveal_in_tree"
negative_constraints:
- "Do not define envelope schema here and do not mint a second routing model; Plans/Crosswalk.md owns the envelope and Contracts_V0 owns the route payload."
compatibility_only_notes:
- "Slint portability: deep-link landings render through existing opaque precomputed panel surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/Crosswalk.md owns the panel-context envelope registration; Plans/Contracts_V0.md owns the canonical route payload and object_kind enum; this unit is a consumer-side pointer naming intended fields only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-480 - Rail Panel Presentation Repairs (Cozy Shelves fix wave)

```yaml
plan_unit_id: F3-480
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Four presentation contracts hardened during the 2026-07-27 Cozy Shelves fix wave are
  canon for every rail panel: (1) UNCLIPPED POPUPS - any popup surface opened from rail
  panel content (branch menus, Docker context, sort menus, workflow ref pickers, File
  Manager root and context menus) renders above and unclipped by panel scrollers,
  accordion clip wrappers, and transform/will-change containing blocks; the HTML concept
  realizes this by portaling the open menu to the document body with fixed positioning
  and restoring it to its home node on close, and the Slint realization is PopupWindow,
  which is unclipped by construction. (2) EXPANDER CHEVRON CONTRACT - a collapsed
  expander chevron points right and rotates 90 degrees to point down when open; the
  rotation binds to the direct header chevron of the toggled expander only, never to
  nested chevrons inside an opened ancestor, and icon hydration must not copy host
  transform classes onto the nested vector so rotation is applied exactly once.
  (3) MEASURE-BASED LABEL FITTING - pill, banner-status, and chip labels degrade by
  measurement at the current rail width through a per-control fit ladder (full form,
  abbreviated form, then symbol or icon-only where declared), with banner fitting
  applying a crowding check that reserves the panel title's minimum share before a
  status pill may keep its longer form; width tiers (min/mid/wide) remain layout-chrome
  signals only (padding, owner hide, generic icon-only tab chrome) and never decide
  label truncation; the Slint realization selects among precomputed label variants by
  measured available width. (4) ONE-SHOT PANEL ENTER + ABRUPT-ONLY REMEASURE - the
  panel enter animation applies once on activation and is removed on completion (never
  a persistent animation on the active view, which restarts on style invalidation and
  reads as a black flash), and expanded-accordion height remeasure runs only on abrupt
  width changes (width presets, drag release, window resize) and never per continuous
  drag frame.
gui_related: true
gui_classification_reason: This unit pins visible popup layering, chevron motion, label degradation, and enter-animation behavior for all rail panels.
split_recommended: false
depends_on: [F3-471, F3-472, F3-473]
unblocks: []
acceptance_criteria:
- "No rail-panel popup is ever clipped by a panel scroller, accordion clip wrapper, or transform containing block; the Slint surface for every such popup is PopupWindow."
- "Opening an expander rotates exactly one chevron (its own header chevron); nested collapsed rows inside an open ancestor keep right-pointing chevrons."
- "Label shortening decisions are made by measurement against available width via the declared fit ladder; no label truncation decision keys off the min/mid/wide tier attribute."
- "Panel activation animates once and leaves no persistent animation on the active view; accordion remeasure never runs on continuous drag frames."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rail_panel_presentation_repairs
  create_worknodes: false
source_lineage:
- "Concepts/ChatGuiUpdates2.md section 'Cozy Shelves rail concepts (2026-07-27)' (fix-wave change ledger; source-lineage-only)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)"
preserved_exact_tokens:
- "PopupWindow"
- "data-fit"
negative_constraints:
- "Do not re-clip popups inside panel scrollers; do not decide label truncation from width-tier attributes; do not leave persistent enter animations on active views."
compatibility_only_notes:
- "Slint portability: popup layering via PopupWindow; label variants precomputed and chosen by measured width; enter animation is a one-shot property animation; no arbitrary-content backdrop blur, no SVG filters, precomputed color math."
stale_retired_dispositions:
- "Hardcoded px-breakpoint label swapping in earlier concept revisions is retired lineage; measure-based fitting supersedes it."
owner_boundary_notes:
- "F3-472 owns expander anatomy; F3-473 owns the motion map; this unit owns popup layering, chevron uniqueness, label-fit policy, and enter/remeasure timing."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-481 - Left-Hand Rail Placement Canon

```yaml
plan_unit_id: F3-481
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Ratified decision (2026-07-27): the side-panel occupant stack (activity bar plus the
  single panel slot hosting search, chat, files, source_control, repository_automation,
  docker_manager, testing, agents, artifacts, run_debug) mounts on the LEFT edge of the
  shell. This supersedes the right-hand slot language in the section 3/4 shell prose and
  closes the carried deviation recorded by F3-478: the concept family (PMConcept7 and the
  Cozy Shelves rail concepts) has always rendered the rail on the left, and canon now
  matches. Earlier right-hand phrasing is preserved findable as lineage and must not be
  cited as live placement authority. Surface-location strings in wiring rows and help
  copy authored after this date say left-hand; existing rows are corrected opportunistically
  as they are touched, and GATE-010 evidence must not fail a row solely for a stale
  right-hand location string authored before this date.
gui_related: true
gui_classification_reason: This unit fixes the shell-level side on which every rail panel mounts.
split_recommended: false
depends_on: [F3-478]
unblocks: []
acceptance_criteria:
- "The activity bar and panel slot render on the left shell edge in the Slint build."
- "F3-478's carried-deviation record is closed by this ruling and cited only as lineage."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: left_rail_placement_canon
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (renders the rail left; source-lineage-only)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
preserved_exact_tokens: []
negative_constraints:
- "Do not cite pre-2026-07-27 right-hand slot prose as live placement authority."
stale_retired_dispositions:
- "Right-hand side-panel slot phrasing in sections 3.2/4.1 and older wiring-row ui_location strings become findable lineage superseded by this ruling."
owner_boundary_notes:
- "F3-478 recorded the deviation; this unit resolves it. Wiring-row string hygiene is owned by Plans/Wiring_Matrix.production.json maintenance."
owner_hints:
- "Plans/FinalGUISpec.md"
```
