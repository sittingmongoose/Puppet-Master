# Shard 062: Settings System Addendum - 2026-07-16

Source: `Plans/FinalGUISpec.md`

Source lines: L29719-L30554

Source SHA256: `cb8e793fd3b46d17be00745b05ace785aadc8d791bd0d3261415c532351d2b22`

---

## Settings System Addendum - 2026-07-16

This addendum promotes the user-approved PMConcept6 search-first Settings surface, its shelves and curation service, the setting-row contracts, the canonical settings inventory registry binding, and the theme/settings persistence key additions into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-432 - Search-First Settings Surface Supersession

```yaml
plan_unit_id: F3-432
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Settings home surface is the s4 search-first one-box model: a single settings search
  box at the top of the surface, a row of category chips with attention dots, a per-category
  bloom modal opened from a chip, and a shelves home beneath the search box composed of the
  Fix These, Recents, and Suggested shelves. This model supersedes the 19-tab two-level-sidebar
  Settings registry as the visible Settings surface; the registry table in the Settings
  (Unified) panel specification is preserved as owner-routing and search/migration lineage
  only, so its owner-doc mappings continue to route settings detail ownership while no visible
  tab bar or two-level sidebar renders. Every setting remains searchable and
  command-addressable: hidden or unsupported settings surface unavailable or unsupported state
  instead of disappearing silently, and command-palette deep links resolve into the
  search-first surface.
gui_related: true
gui_classification_reason: This unit defines the visible Settings home surface model of search box, category chips, bloom modals, and shelves.
split_recommended: false
depends_on: [F3-109, F3-441]
unblocks: []
acceptance_criteria:
- "The Settings home renders one search box, category chips with attention dots, per-category bloom modals, and the Fix These, Recents, and Suggested shelves; no tab bar or two-level sidebar renders."
- "The former 19-tab registry table is preserved as owner-routing and search/migration lineage and every owner mapping in it remains resolvable."
- "Every setting, including hidden or unsupported items, remains searchable and command-addressable and shows unavailable or unsupported state instead of disappearing silently."
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
  mode: search_first_settings_surface_supersession
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:9363"
- "Plans/FinalGUISpec.md:16858"
- "Plans/FinalGUISpec.md:17716"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Fix These"
- "Recents"
- "Suggested"
- "bloom"
negative_constraints:
- "The Settings surface must not render the 19-tab two-level sidebar as the visible navigation model; the preserved registry table is routing lineage, not UI."
compatibility_only_notes:
- "Slint portability: the search box, category chips, shelves, and modal chrome render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The 19-tab two-level-sidebar Settings registry is superseded as the visible Settings surface per the 2026-07-16 theme and settings canon promotion; its table in the Settings (Unified) panel specification is preserved as owner-routing and search/migration lineage only."
owner_boundary_notes:
- "Owner-doc mappings in the preserved registry table continue to route settings detail ownership; this unit changes surface presentation, not owner boundaries."
- "The tooltip, scope, origin-badge, and override-display grammar prose of the Settings (Unified) panel specification carries over unchanged to the search-first surface."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-433 - Settings Fuzzy Search And Relevance Contract

```yaml
plan_unit_id: F3-433
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings search is a fuzzy multi-token AND contract: the query splits into
  whitespace-separated tokens, every token must match, and each token matches by
  case-insensitive subsequence scoring over the id, label, desc, and search[] index fields
  that the settings inventory registry provides per setting. Relevance adds three boosts to
  the summed subsequence scores: +40 when the setting is curated, +22 when the setting is
  simple-tier, and +10 when the setting's derived status is non-ok, consuming the same
  derived-status feed specified by F3-435. Results are capped at the best 60 matches and
  render grouped by category with match highlighting on the matched label and description
  characters. Search input is debounced at 80ms. Keyboard navigation over results: ArrowUp
  and ArrowDown move the active result, Enter opens the active result through the category
  deep-link contract, and Escape clears the query and returns to the shelves home.
gui_related: true
gui_classification_reason: This unit defines visible settings search behavior including matching, ranking, result caps, highlighting, and keyboard navigation.
split_recommended: false
depends_on: [F3-432, F3-441, F3-435]
unblocks: []
acceptance_criteria:
- "Search tokenizes on whitespace, requires every token to match, and scores each token by case-insensitive subsequence over the registry id, label, desc, and search[] fields."
- "Relevance boosts are +40 curated, +22 simple-tier, and +10 non-ok derived status, consuming registry fields and the F3-435 derived-status feed."
- "Results cap at the best 60 matches, group by category, and highlight matched characters in label and description text."
- "Input is debounced at 80ms; ArrowUp and ArrowDown move the active result, Enter opens it through the deep-link contract, and Escape clears the query and returns to the shelves home."
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
  mode: settings_fuzzy_search_and_relevance_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:16858"
- "Plans/FinalGUISpec.md:17716"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "+40"
- "+22"
- "+10"
- "60"
- "80ms"
negative_constraints:
- "Relevance boost inputs must come from registry fields and the derived-status feed; boosts must not be driven by hardcoded per-setting id lists in UI code."
compatibility_only_notes:
- "Slint portability: match highlighting maps to styled text runs over opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "The id, label, desc, search[], tier, and curated fields are owned by the settings inventory registry binding (F3-441); the derived-status feed is owned by F3-435; this unit owns the scoring and interaction contract that consumes them."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-434 - Category Chips, Attention Dots, And Bloom Modal

```yaml
plan_unit_id: F3-434
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Settings home renders 12 category chips, one per category in the settings inventory
  registry. Each chip shows an attention dot when its category contains any setting with
  non-ok derived status, driven by the same derived-status feed that populates the Fix These
  shelf (F3-435). Activating a chip opens that category's bloom modal, which morphs open from
  the activating chip; under reduced motion the bloom opens without the morph animation. The
  bloom modal lists the category's simple-tier setting rows first, followed by a
  "Show N advanced" expander where N is the count of the category's advanced-tier rows, which
  reveals those rows in place. Each bloom modal carries a per-category two-step Reset control:
  the first activation arms a confirmation state, a second activation within the confirmation
  timeout performs the category reset, and the timeout expiring disarms the control back to
  idle without resetting. The bloom modal supports the deep-link contract
  open(category, focusSettingId): opening with a focus target scrolls the target row into view
  and flash-highlights it.
gui_related: true
gui_classification_reason: This unit defines visible category chip, attention dot, bloom modal, expander, reset, and deep-link focus behavior.
split_recommended: false
depends_on: [F3-432, F3-435, F3-441]
unblocks: []
acceptance_criteria:
- "12 category chips render, one per registry category, and a chip shows an attention dot exactly when its category contains a setting with non-ok derived status."
- "Activating a chip opens the category bloom modal with a morph from the chip; reduced motion opens the modal without the morph."
- "The bloom lists simple-tier rows first with a Show N advanced expander that reveals the category's advanced-tier rows in place."
- "Per-category Reset is two-step: first activation arms confirmation, a second activation within the confirmation timeout performs the reset, and timeout expiry disarms without resetting."
- "open(category, focusSettingId) opens the category bloom, scrolls the focused row into view, and flash-highlights it."
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
  mode: category_chips_attention_dots_and_bloom_modal
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:9363"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Show N advanced"
- "12"
negative_constraints:
- "No per-setting favorites or copy-id surfaces render on chips, shelves, bloom rows, or search results."
compatibility_only_notes:
- "Slint portability: chips, dots, and the bloom modal render as opaque precomputed surfaces, and the chip-to-modal morph maps to a geometry animation between two opaque surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed; the settings-modal backdrop-filter budget is enumerated by F3-431."
stale_retired_dispositions: []
owner_boundary_notes:
- "Command-palette invocation of the deep link reuses the existing Open setting: {name} palette pattern; this unit mints no new command IDs, and command registration is a separate UI_Command_Catalog and Wiring_Matrix round."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-435 - Fix These Shelf And Status Derivation Contract

```yaml
plan_unit_id: F3-435
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every setting carries a derived status of ok, needs-setup, or attention, with an optional
  short status note, and status is always derived from live subsystem state rather than
  authored as data. Subsystem status publishers own the derivation: provider and auth
  subsystems publish needs-setup for provider-scoped settings whose provider or account is
  not authenticated, and path and probe validation publishes attention for settings whose
  current value fails validation, such as missing or invalid paths and failing probes.
  Publishers re-emit their status on subsystem state change and whenever a settings surface
  opens. The Fix These shelf lists the settings with non-ok derived status, capped at 12,
  ordered attention before needs-setup and then by category order. The same derived-status
  feed drives the category-chip attention dots (F3-434) and the +10 non-ok search relevance
  boost (F3-433); no surface derives status independently.
gui_related: true
gui_classification_reason: This unit defines the visible Fix These shelf and the derived-status feed behind attention dots, status pills, and search boosts.
split_recommended: false
depends_on: [F3-432, F3-441]
unblocks: []
acceptance_criteria:
- "Per-setting status (ok, needs-setup, attention, with optional note) is derived from live subsystem state; the settings inventory registry carries no status values."
- "Provider and auth subsystems publish needs-setup for unauthenticated provider-scoped settings, and path and probe validation publishes attention for failing values."
- "Status publishers re-emit on subsystem state change and on settings surface open."
- "The Fix These shelf lists non-ok settings, capped at 12, ordered attention before needs-setup and then by category order."
- "Category-chip attention dots and the +10 non-ok search boost consume this same derived-status feed."
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
  mode: fix_these_shelf_and_status_derivation_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:9363"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "needs-setup"
- "attention"
- "12"
negative_constraints:
- "Status must not be authored as static inventory data."
compatibility_only_notes:
- "Slint portability: attention dots and status presentation render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The concept sidecar's static per-setting status values are demo residue; the canonical settings inventory registry excludes status fields and status is derived at runtime."
owner_boundary_notes:
- "Provider, auth, path, and probe subsystem behavior remains owned by the respective subsystem docs; this unit owns the GUI-facing status vocabulary, the publisher obligations and re-emit triggers, and the Fix These shelf presentation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-436 - Recents Shelf And Persistence

```yaml
plan_unit_id: F3-436
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  User edits mark settings into the Recents shelf as a most-recent-first, deduplicated list
  capped at 8 entries and persisted at `settings_recents:v1`. Editing a setting that is
  already on the list moves it to the front rather than duplicating it. The list records real
  user edits only: the concept's seeded recents rows (theme and ui-scale) are demo
  scaffolding, not canonical defaults, and a fresh profile starts with an empty Recents
  shelf. Shelf-level dedupe precedence across Fix These, Recents, and Suggested is owned by
  the curation service contract (F3-437).
gui_related: true
gui_classification_reason: This unit defines the visible Recents shelf and its persistence behavior.
split_recommended: false
depends_on: [F3-432, F3-444]
unblocks: []
acceptance_criteria:
- "User edits append settings to a most-recent-first deduplicated Recents list capped at 8, persisted at settings_recents:v1; re-editing a listed setting moves it to the front."
- "A fresh profile starts with an empty Recents shelf; the concept's seeded theme and ui-scale recents rows are not promoted as defaults."
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
  mode: recents_shelf_and_persistence
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:2301"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "8"
- "settings_recents:v1"
negative_constraints:
- "Do not promote the concept's seeded theme and ui-scale recents rows as default Recents content; the shelf reflects real user edits only."
compatibility_only_notes:
- "Slint portability: the Recents shelf renders as an ordered list bound to typed persisted state; no arbitrary-content backdrop blur, no SVG filters, and color styling is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Storage-key registration for settings_recents:v1 is owned by F3-444; cross-shelf dedupe precedence is owned by F3-437."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-437 - Suggested Shelf Curation Service Contract

```yaml
plan_unit_id: F3-437
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Suggested shelf is produced by a deterministic, fully local settings curation service
  that merges three candidate layers. Layer one, curated baseline: settings whose `curated`
  flag is set in the settings inventory registry (24 curated at promotion), ranked by
  inventory order as the curation rank; curators update `Plans/settings_inventory.json`, not
  UI code. Layer two, context signals (project-aware): settings whose owning subsystem
  reports an available-but-default capability in the current project, a state distinct from
  the needs-setup and attention statuses that route to Fix These; examples are container
  configuration present suggesting docker settings, a GitHub remote suggesting github and
  actions settings, a detected test framework with testing policy unset suggesting testing
  settings, and configured MCP servers suggesting MCP settings. Context signals come from the
  same subsystem status publishers as F3-435 plus existing project capability detection.
  Layer three, usage signals (behavior-aware): settings related to recently used features via
  local per-project rolling 30-day feature-usage counters, with the relation expressed by the
  sparse authored `related_features` field on inventory registry rows (empty allowed;
  populated per category at authoring time for the ai, safety, code, memory, planning, branching, media, web, personas, and extensions categories). Candidates are
  ranked deterministically: score equals the layer weight (context 300, usage 200, curated
  100) plus a usage-recency bonus of 0-50 scaled by days since last use, with curation rank
  as the tiebreak; the sort is stable and the shelf caps at 12 entries. Dedupe precedence
  across shelves is Fix These over Recents over Suggested, so a setting appears on exactly
  one shelf. Each suggestion card exposes a dismiss control; dismissals persist at
  `settings_suggestions_dismissed:v1`, scoped to the project when the driving signal was
  project-scoped and global otherwise, and dismissed entries expire after 90 days. The
  service refreshes, debounced, on settings surface open, on subsystem status-change events,
  and on project switch. When the context and usage layers are empty the shelf falls back to
  the curated baseline only; when all layers are empty the shelf is hidden. The service is
  fully local: it collects no telemetry and makes no network calls.
gui_related: true
gui_classification_reason: This unit defines the visible Suggested shelf and the curation service contract that populates it.
split_recommended: false
depends_on: [F3-432, F3-435, F3-436, F3-441]
unblocks: []
acceptance_criteria:
- "Suggested candidates merge exactly three layers: registry curated flags (24 curated at promotion, ranked by inventory order), available-but-default context signals from the F3-435 status publishers plus project capability detection, and related_features usage signals from local per-project rolling 30-day feature-usage counters."
- "Ranking is deterministic: layer weights context 300, usage 200, curated 100, plus a usage-recency bonus of 0-50 scaled by days since last use and a curation-rank tiebreak, stable-sorted and capped at 12."
- "Dedupe precedence Fix These over Recents over Suggested leaves each setting on exactly one shelf, and per-card dismissals persist at settings_suggestions_dismissed:v1 with 90-day expiry, project-scoped when the driving signal was project-scoped and global otherwise."
- "The service refreshes debounced on settings surface open, subsystem status change, and project switch; empty context and usage layers fall back to the curated baseline only, all-empty layers hide the shelf, and the service collects no telemetry and makes no network calls."
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
  mode: suggested_shelf_curation_service_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
- "PMConcept6 demonstrates only the curated baseline layer; the context-signal, usage-signal, ranking, dismissal, and refresh clauses are Plans-canonical extensions decided at the 2026-07-16 promotion."
preserved_exact_tokens:
- "curated"
- "24"
- "available-but-default"
- "related_features"
- "300"
- "200"
- "100"
- "0-50"
- "12"
- "settings_suggestions_dismissed:v1"
- "90"
negative_constraints:
- "The curation service must not transmit usage or context signals off the local machine; no telemetry collection and no network calls are part of this contract."
- "Curated membership is registry data: curators update Plans/settings_inventory.json, and the Suggested shelf must not hardcode a curated list in UI code."
- "Available-but-default context signals must not be conflated with needs-setup or attention statuses, which route to Fix These."
compatibility_only_notes:
- "Slint portability: the curation service is pure local computation over typed state feeding a list model; suggestion cards render as opaque precomputed surfaces with no arbitrary-content backdrop blur, no SVG filters, and color math precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Subsystem status publishers are owned by F3-435; the curated and related_features registry fields are owned by F3-441; settings_suggestions_dismissed:v1 key registration is owned by F3-444; command-catalog registration for the dismiss control is handled by the command and wiring registration seal, and this unit mints no cmd IDs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-438 - Setting Row Renderer, Badge, And Scope Contract

```yaml
plan_unit_id: F3-438
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Setting rows render their control by mapping the inventory type field to a renderer. The
  renderer set is: toggle, select, radio, slider with a value bubble showing the current
  value, number, text, path with a Browse control, color, action with working-then-done verb
  states on invocation, multiselect, list, and keyvalue, where multiselect, list, and
  keyvalue render as expandable editors that open in place beneath the row. The 824-setting
  inventory's rows resolve across eleven of these renderer types at promotion; the color
  renderer is part of the contract and serves color-typed rows. Rows show badges from the
  vocabulary restart, adjudication, and new; status pills for ok, needs-setup, and attention
  from the derived-status feed; and scope tags from the six scopes global, project, run,
  persona, account, and provider. A row whose scope includes both project and global renders
  an inherit-origin line disclosing that the effective value inherits from the global scope
  and can be overridden at project scope.
gui_related: true
gui_classification_reason: This unit defines visible setting row control renderers, badge and status pill vocabulary, scope tags, and the inherit-origin line.
split_recommended: false
depends_on: [F3-432, F3-441]
unblocks: []
acceptance_criteria:
- "Renderer selection maps the inventory type field to the renderer set toggle, select, radio, slider, number, text, path, color, action, multiselect, list, and keyvalue; multiselect, list, and keyvalue render as expandable editors."
- "The slider renderer shows a value bubble, the path renderer includes a Browse control, and the action renderer shows working-then-done verb states on invocation."
- "Rows render badges only from the vocabulary restart, adjudication, and new, and status pills only from ok, needs-setup, and attention."
- "Scope tags render from the six scopes global, project, run, persona, account, and provider, and rows scoped both project and global render an inherit-origin line."
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
  mode: setting_row_renderer_badge_and_scope_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "toggle"
- "select"
- "radio"
- "slider"
- "number"
- "text"
- "path"
- "color"
- "action"
- "multiselect"
- "list"
- "keyvalue"
- "Browse"
- "restart"
- "adjudication"
- "new"
- "global"
- "project"
- "run"
- "persona"
- "account"
- "provider"
negative_constraints:
- "Renderer selection must consume the inventory type field only; renderers must not be inferred from labels, descriptions, or id patterns."
compatibility_only_notes:
- "Slint portability: control renderers map to native widget composition and expandable editors to conditional in-place composition over opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Scope semantics, origin badges, and the override-display grammar remain carried by the Settings (Unified) panel specification prose; badge semantics route to their owner contracts (restart rules and adjudication ownership); this unit owns the visible row presentation vocabulary."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-439 - Instant Apply Model And Save Exceptions

```yaml
plan_unit_id: F3-439
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings apply instantly on change. The settings experience exposes no global Save control,
  no undo history, no import/export surface, no per-setting copy-id affordance, and no
  favorites surface. The per-category two-step Reset is the only bulk action. Exactly two
  exceptions to instant apply exist: the Permissions surface keeps its existing dirty/save
  review model, and the Project Settings Modal keeps an explicit Save with Cancel (F3-442),
  which is the only Save in the settings experience.
gui_related: true
gui_classification_reason: This unit defines the user-facing apply model for settings changes.
split_recommended: false
depends_on: [F3-432]
unblocks: []
acceptance_criteria:
- "Setting changes take effect immediately on change with no global Save step, no undo history, no import/export, no copy-id, and no favorites surfaces."
- "The per-category two-step Reset is the only bulk action available in settings."
- "The only exceptions to instant apply are the Permissions dirty/save review model and the Project Settings Modal explicit Save."
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
  mode: instant_apply_model_and_save_exceptions
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Reset"
- "dirty/save"
negative_constraints:
- "No global Save, undo history, import/export, copy-id, or favorites surfaces are added to settings."
compatibility_only_notes:
- "Slint portability: instant apply maps to typed state setters invoked on control change; no arbitrary-content backdrop blur, no SVG filters, and color styling is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "The Permissions dirty/save review model remains owned by its existing Permissions surface contract; this unit records only its exemption from instant apply. The per-category Reset interaction is owned by F3-434."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-440 - Settings Live-Apply Wiring Map

```yaml
plan_unit_id: F3-440
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The instant-apply model binds specific settings to live shell surfaces: the theme setting
  drives the theme engine and persists at `theme:v1`; the glass background mode setting
  drives the glass composition layer and persists at `glass_background_mode:v1`; the glass
  alpha setting drives `--glass-alpha` within the per-theme clamps of F3-429 and persists at
  `glass_alpha:v1`; the reduce-animations setting drives the application reduced-motion
  state; and the chat layout mode setting drives the chat mount layout. Each binding applies
  on change with no reload. The concept's interface-density live-apply hook had no consumer
  and is demo residue excluded from this canonical wiring map.
gui_related: true
gui_classification_reason: This unit defines visible live-apply bindings between settings and shell surfaces.
split_recommended: false
depends_on: [F3-425, F3-428, F3-429, F3-432, F3-444]
unblocks: []
acceptance_criteria:
- "Changing theme, glass background mode, glass alpha, reduce-animations, or chat layout mode applies live to the theme engine, glass composition, --glass-alpha within clamps, reduced-motion state, and chat mount layout respectively, with no reload."
- "The theme, glass background mode, and glass alpha bindings persist through theme:v1, glass_background_mode:v1, and glass_alpha:v1 respectively."
- "The interface-density hook is excluded from the wiring map as demo residue and gains no canonical binding."
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
  mode: settings_live_apply_wiring_map
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:2291"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "theme:v1"
- "glass_background_mode:v1"
- "glass_alpha:v1"
- "--glass-alpha"
negative_constraints:
- "Do not promote the concept's interface-density hook into the live-apply wiring map; it had no consumer and is demo residue."
compatibility_only_notes:
- "Slint portability: live-apply bindings map to typed state setters; theme switches swap precomputed per-variant token tables and glass alpha updates a single scalar, with no arbitrary-content backdrop blur, no SVG filters, and no runtime color math."
stale_retired_dispositions:
- "The concept's interface-density live-apply hook is demo residue with no consumer; it is excluded from the canonical wiring map and retired without replacement."
owner_boundary_notes:
- "Theme engine and token tables are owned by F3-425 and F3-426; glass composition and background modes by F3-427 and F3-428; glass alpha clamps by F3-429; storage-key registration by F3-444."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-441 - Settings Inventory Registry Binding

```yaml
plan_unit_id: F3-441
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  `Plans/settings_inventory.json` is the canonical inventory registry of all 824 settings
  across 12 categories. Its shape is owned by `Plans/settings_inventory.schema.json` with
  schema_id `pm.settings_inventory.v1`. Registry rows carry id, label, desc, type, options,
  default, scope, tier, recommended, curated, search, badges, and related_features, where
  related_features is the sparse mapping vocabulary consumed by the curation service
  usage-signal layer (F3-437). The demo runtime fields value, status, and src are dropped and
  excluded by the schema: setting values live in real settings storage, status is derived
  live per F3-435, and src was concept scaffolding. Registry provenance pins the concept
  sidecar extraction `Concepts/pm6-build/sidecar/pm_settings_data.json` at sha256
  9b24e5bcf7f3dae8f0251215eb113c357d1a0ee22f185ac035e8969fd76b5c8d as source-lineage-only.
  Settings surfaces, including search, category chips, bloom modals, shelves, row renderers,
  and the Project Settings Modal, bind to this registry rather than hardcoding inventory
  rows.
gui_related: true
gui_classification_reason: This unit binds the visible settings surfaces to their canonical inventory registry.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Plans/settings_inventory.json parses as JSON and conforms to Plans/settings_inventory.schema.json (schema_id pm.settings_inventory.v1); schema conformance is enforced by this unit's acceptance criteria, not a machine gate."
- "The registry contains 824 settings across 12 categories, including the exact seven Case L Storage & Retention rows; rows carry id, label, desc, type, options, default, scope, tier, recommended, curated, search, badges, and related_features, and provenance pins the concept sidecar at sha256 9b24e5bcf7f3dae8f0251215eb113c357d1a0ee22f185ac035e8969fd76b5c8d."
- "The demo runtime fields value, status, and src appear in no registry row and are excluded by the schema."
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
  mode: settings_inventory_registry_binding
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:1359"
- "Concepts/pm6-build/sidecar/pm_settings_data.json (sha256 9b24e5bcf7f3dae8f0251215eb113c357d1a0ee22f185ac035e8969fd76b5c8d)"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Plans/settings_inventory.json"
- "Plans/settings_inventory.schema.json"
- "pm.settings_inventory.v1"
- "824"
- "system.advanced.chat-history-retention"
- "system.advanced.runtime-history-days"
- "system.advanced.diagnostic-history-days"
- "system.advanced.released-safe-point-days"
- "system.advanced.preserved-terminal-runs"
- "system.advanced.request-storage-compaction"
- "system.advanced.inspect-holds-quarantine"
- "12"
- "related_features"
- "9b24e5bcf7f3dae8f0251215eb113c357d1a0ee22f185ac035e8969fd76b5c8d"
negative_constraints:
- "The demo runtime fields value, status, and src must not be reintroduced into the registry or its schema."
- "Settings surfaces must not hardcode inventory rows independently of the registry."
compatibility_only_notes:
- "Slint portability: the registry is build-time data compiled into typed setting models; no arbitrary-content backdrop blur, no SVG filters, and no runtime color math are implicated by this binding."
stale_retired_dispositions: []
owner_boundary_notes:
- "Governance registration of the registry pair (Spec_Lock hashes, sharding sources, 00-plans-index rows) is performed by the seal's register-canonical-docs step, not by this unit's text; per-setting runtime policy remains with the owner docs named in the Settings tab registry."
owner_hints:
- "Plans/FinalGUISpec.md"
- "Plans/settings_inventory.json"
- "Plans/settings_inventory.schema.json"
```

### F3-442 - Project Settings Modal Reconciliation

```yaml
plan_unit_id: F3-442
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Project Settings Modal shows project-scope settings derived from the settings inventory
  registry: every registry row whose scope includes project is eligible, and the modal's rows
  are generated from the registry rather than authored separately. Rows group into three
  tabs: General, Environment, and Agent behavior. Each row offers an inherit-vs-override
  flip: an inheriting row shows the effective global value with its origin, and an overriding
  row stores a project-scoped value. The modal provides its own scoped substring search over
  its rows. Changes commit through an explicit Save with a Cancel that discards pending
  changes; per F3-439 this is the only Save in the settings experience. The concept's 12
  hardcoded modal rows are a demo shim, not the canonical row set.
gui_related: true
gui_classification_reason: This unit defines the visible Project Settings Modal rows, tabs, search, and save model.
split_recommended: false
depends_on: [F3-439, F3-441]
unblocks: []
acceptance_criteria:
- "Project Settings Modal rows are derived from inventory registry rows whose scope includes project; the concept's 12 hardcoded rows are not promoted."
- "Rows group into the General, Environment, and Agent behavior tabs, each row supports the inherit-vs-override flip with inherited-origin display, and the modal offers scoped substring search."
- "The modal commits through an explicit Save with Cancel discarding pending changes, and this remains the only Save in the settings experience."
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
  mode: project_settings_modal_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Plans/FinalGUISpec.md:1363"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "General"
- "Environment"
- "Agent behavior"
- "Save"
- "Cancel"
negative_constraints:
- "PSM rows must not be hardcoded independently of the inventory registry."
compatibility_only_notes:
- "Slint portability: the modal renders as an opaque precomputed surface with typed row models; no arbitrary-content backdrop blur, no SVG filters, and color styling is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Scope vocabulary and row renderer mechanics are owned by F3-438; the instant-apply exception this Save represents is recorded in F3-439; effective-scope display rules follow the existing settings-scope clause in section 7.4.4."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-443 - Glass-Only Setting Lock Rows

```yaml
plan_unit_id: F3-443
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Glass-only settings, specifically the glass background mode setting and the glass alpha
  slider, render as locked rows with an unsupported-reason chip when a non-glass theme is
  active. Locked rows remain visible, searchable, and command-addressable rather than
  disappearing. Lock state derives from the active theme family: the rows unlock when a glass
  family variant is active and lock under the friendly, retro, and basic families, and the
  chip names the unsupported reason.
gui_related: true
gui_classification_reason: This unit defines visible locked-row presentation for glass-only settings.
split_recommended: false
depends_on: [F3-429, F3-438]
unblocks: []
acceptance_criteria:
- "Glass background mode and glass alpha rows render locked with an unsupported-reason chip whenever a non-glass theme is active, and unlock when a glass family variant is active."
- "Locked rows stay visible, searchable, and command-addressable; lock state derives from the active theme family, not from per-row static data."
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
  mode: glass_only_setting_lock_rows
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1329"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "unsupported-reason chip"
- "theme family"
negative_constraints:
- "Glass-only settings must not disappear from the settings surface under non-glass themes; they render locked with a stated reason."
compatibility_only_notes:
- "Slint portability: locked rows are a disabled visual state with a chip label driven by typed theme-family state; no arbitrary-content backdrop blur, no SVG filters, and color styling is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Glass alpha clamps and slider behavior are owned by F3-429; row renderer and badge mechanics are owned by F3-438; this unit owns only the lock presentation and its theme-family derivation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-444 - Theme And Settings Persistence Key Additions

```yaml
plan_unit_id: F3-444
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The section 15.1 persistence key tables register four settings-driven keys. The shell and
  layout key table gains `glass_background_mode:v1` (active glass background mode; write
  frequency on change) and `glass_alpha:v1` (user glass alpha value within the per-theme
  clamps; write frequency on change, debounced 300ms). The chat, settings, and review state
  key table gains `settings_recents:v1` (most-recent-first deduplicated settings recents
  list, cap 8; write frequency on change, debounced 300ms) and
  `settings_suggestions_dismissed:v1` (dismissed Suggested-shelf entries with dismissal
  timestamps and signal scope, entries expiring after 90 days; write frequency on change).
  The concept localStorage names pm.theme, pm.glassBg, pm.glassAlpha, and
  pm.activity_bar_order:v2 are demo shims, not canonical keys: the canonical keys remain
  `theme:v1` and `activity_bar_order:v1`, and this addendum registers no other new storage
  keys.
gui_related: true
gui_classification_reason: This unit registers GUI persistence keys and write frequencies for theme and settings state.
split_recommended: false
depends_on: [F3-217]
unblocks: []
acceptance_criteria:
- "The shell and layout key table registers glass_background_mode:v1 and glass_alpha:v1 with write frequencies, and the chat, settings, and review state table registers settings_recents:v1 and settings_suggestions_dismissed:v1 with write frequencies."
- "The concept names pm.theme, pm.glassBg, pm.glassAlpha, and pm.activity_bar_order:v2 are recorded as demo shims only; canonical keys remain theme:v1 and activity_bar_order:v1."
- "No storage keys other than glass_background_mode:v1, glass_alpha:v1, settings_recents:v1, and settings_suggestions_dismissed:v1 are registered by this addendum."
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
  mode: theme_and_settings_persistence_key_additions
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:2286"
- "Plans/FinalGUISpec.md:2301"
- "Plans/FinalGUISpec.md:15136"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "glass_background_mode:v1"
- "glass_alpha:v1"
- "settings_recents:v1"
- "settings_suggestions_dismissed:v1"
- "theme:v1"
- "activity_bar_order:v1"
- "pm.theme"
- "pm.glassBg"
- "pm.glassAlpha"
- "pm.activity_bar_order:v2"
negative_constraints:
- "Do not register any new storage keys in this addendum other than glass_background_mode:v1, glass_alpha:v1, settings_recents:v1, and settings_suggestions_dismissed:v1; canonical keys remain theme:v1 and activity_bar_order:v1."
- "Do not promote the concept localStorage names pm.theme, pm.glassBg, pm.glassAlpha, or pm.activity_bar_order:v2 as canonical keys; they are demo shims preserved as lineage only."
compatibility_only_notes:
- "Slint portability: persistence keys are backend state contracts read and written through typed state; no arbitrary-content backdrop blur, no SVG filters, and no runtime color math are implicated by key registration."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit mirrors the F3-217 registration shape; F3-217 remains the owner of the pre-existing shell and layout key list, and Plans/storage-plan.md remains the consumer doc for storage record truth."
owner_hints:
- "Plans/FinalGUISpec.md"
```
