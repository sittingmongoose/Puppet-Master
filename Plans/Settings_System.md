# Settings System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes shared envelopes and owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for the Settings surface, project-setting persistence semantics, Settings search and row behavior, Settings transfer, Settings manager grammar, and Settings-to-owner routing. Domain managers retain their runtime, security, storage, provider, Server, Project Sync, Browser, source-control, testing, and recovery truth.

## 0. Scope

Settings is a project-bound system with three coordinated layers:

1. the K3 Tome Tabs Settings shell;
2. the 828 ordinary setting rows in `Plans/settings_inventory.json`; and
3. the full manager system for setup, policy, defaults, human-readable status, diagnostics, repair entry points, and owner-routed operational work.

`Plans/settings_system_contracts.schema.json` is the strict Draft 2020-12 shape owner for Settings-owned records. `Plans/settings_system_contract_fixtures.json` freezes the five Settings command contracts, six route-only Onboarding/Guided Tour/Doctor UI actions, the 38-entry manager registry, three named visible-state projections, exact dispositions for all 80 older-packet command tokens, and positive/negative contract fixtures. Those machine files are canonical Plans contracts but remain schema/fixture evidence only; they do not prove a registered handler, production wiring, persistence execution, native rendering, or certification.

This owner supersedes prior Settings presentation and ordinary-persistence clauses in `Plans/FinalGUISpec.md`, including the visible search-first shelves/bloom shell in F3-432 and the universal/global or inheritance implications in F3-438, F3-440, F3-442, F3-510, and F3-511. It retains the canonical 828-ID inventory, the useful F3-433 fuzzy matching behavior, live owner-derived status, typed row renderers, eight built-in themes, and owner-routed deep links where this document incorporates them.

Every persisted ordinary setting value is Project-scoped. An untouched first open or genuinely fresh Project receives the Final GUI-owned `Basic Dark` factory seed. An existing explicit saved selection and a copied Project's detached destination snapshot always win over that seed. With no Project open, Puppet Master renders an ephemeral `Basic Dark` Settings context, creates no Settings storage, and rejects every setting mutation with a typed no-Project reason. Manager objects and operational records are not setting values; their owning docs continue to define their exact topology, identity, persistence, authority, and lifecycle.

The selected K3 concept owns the Settings shell geometry only. Later Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread Performance, Onboarding/Doctor Correction, and Settings Bakeoff decisions supersede K3 content, state, persistence, and operational behavior. `Concepts/PMConcept7.html` is a generated concept fixture, not the production GUI or runtime authority.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Settings_System.md` owns:

- the visible Settings shell, information architecture, responsive geometry, search, facets, All Settings list, variable-height virtualization, row/details grammar, and Settings-local focus behavior;
- the rule that every persisted setting value is keyed to one exact Project and no setting write exists without a Project;
- fresh-Project and no-Project appearance defaults;
- atomic ordinary setting mutation, the atomic theme-family/mode pair, Restore Defaults, and Settings transfer behavior;
- the manager registry, shared manager presentation grammar, and routing from Settings into canonical domain owners;
- the semantic request/result/availability contracts for `cmd.settings.open`, `cmd.settings.transaction.preview`, `cmd.settings.transaction.apply`, `cmd.settings.transaction.rollback`, and `cmd.settings.export`, while central command/catalog/wiring owners retain registration and dispatch custody;
- the Settings snapshot, transaction, export, route/return, UI-action, owner-projection, Doctor-projection, migration-preview, appearance-preview, and concept-boundary record shapes;
- the exact boundary between ordinary settings, manager actions, owner status projections, diagnostics, and operational work; and
- the production acceptance obligations for a future Rust Settings implementation (the Slint desktop and the Leptos web client, DL-139).

### 1.2 Retained owners

| Domain | Canonical owner consumed by Settings | Settings role |
|---|---|---|
| Inventory IDs and row metadata | `Plans/settings_inventory.json` and `Plans/settings_inventory.schema.json` | Render and search all 828 IDs; do not hardcode a second inventory. |
| Theme palettes and shared GUI tokens | `Plans/FinalGUISpec.md` | Select and preview the eight built-in themes; do not fork palette truth. |
| Physical persistence, recovery, and secret-store split | `Plans/storage-plan.md` | Submit project-bound atomic settings transactions and show receipts; do not own storage engines. |
| Permissions, FileSafe, and secret custody policy | `Plans/Permissions_System.md`, `Plans/FileSafe.md`, `Plans/Multi-Account.md` | Show policy/effective state and non-secret references; never hold raw credentials. |
| Shared installation lifecycle and truthful work | `Plans/Shared_Integration_Runtime.md` | Dispatch the registered commands and render `ObservableWork`; do not execute installers. |
| Provider/account/model/auth/readiness | `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/CLI_Bridged_Providers.md`, provider-specific docs | Provide provider manager entry, status, and exact action availability. |
| Installation source/provenance | `Plans/Release_Supply_Chain.md`, `Plans/BinaryLocator_Spec.md` | Show official source, provenance, exact target, and evidence without re-resolving them. |
| Commands and production wiring | `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.production.json` | Reuse registered IDs; no Settings-local peer command family. |
| Server claim/bootstrap and shared topology | `Plans/Shared_Integration_Runtime.md` SIR-013 | Provide manager projection and owner route only. |
| Project hosting, files, sync, move, copy, and source relocation | `Plans/Project_Sync_and_Backbone.md` | Present exact owner state, preview, progress, recovery, and routes. |
| Project Backup and Full Server Backup/Restore | `Plans/Backup_Restore_System.md` | Render compact policy/readiness projections and route admitted owner commands; do not own backup/restore execution, manifests, receipts, key custody, or readiness. |
| Browser and protected authentication | `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, protected-browser contracts | Show ordinary Browser policy/status and protected-auth boundaries; do not host an operational browser. |
| Source control, worktrees, forges, automation, and SSH | `Plans/Source_Control_System.md`, `Plans/Forge_Integrations.md`, `Plans/WorktreeGitImprovement.md`, `Plans/GitHub_Integration.md`, `Plans/GitHub_API_Auth_and_Flows.md` | Configure defaults/connections and route operational work to Source Control or the provider-neutral Actions & Pipelines shell; keep GitHub-specific settings under the GitHub owner. |
| Docker/Podman/Kubernetes/registries | `Plans/Containers_Registry_and_Unraid.md` | Ordinary rows redirect to Docker Manager or Docker/Hosts; Settings does not embed container operations; one-time registry and Unraid setup flows may run in Settings (SSYS-013, 2026-09-27). |
| Product Onboarding | `Plans/Planning_Wizard.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-146, and Final GUI | Show dependencies, resumable routes, and owner projections only. |
| Doctor | `Plans/newtools.md` N2-151 plus each probe's domain owner | Render normalized findings and owner remediation routes; do not run or own probes. |
| Automated acceptance | `Plans/Automated_Testing_System.md` | Consume test/evidence policy; do not claim certification from concept checks. |

### 1.3 Consumers

`Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.production.json`, `Plans/storage-plan.md`, Product Onboarding, Doctor, Home, Assistant Chat, the command palette, and natural-language automation consume this Settings owner. They may open a Settings setting or manager by stable identity but must not restate its persistence, transfer, shell, or mutation contract.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json

## 2. Canonical PlanUnits

### SSYS-001 - Settings System Authority And Supersession

```yaml
plan_unit_id: SSYS-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Plans/Settings_System.md is the sole owner for the Settings shell, ordinary setting persistence semantics,
  search and row behavior, transfer, manager grammar, and Settings-to-domain routing. The K3 Tome Tabs concept
  owns selected shell geometry only. Later Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread
  Performance, Onboarding/Doctor Correction, and Settings Bakeoff decisions supersede K3 content and behavior.
  Prior FinalGUISpec Settings PlanUnits remain source lineage or owner inputs only where this document incorporates
  them; they cannot reassert the F3-432 shelves/bloom shell, continuous Project inheritance, or global persisted
  ordinary setting values over this owner.
gui_related: true
gui_classification_reason: This unit adjudicates the user-visible Settings shell and its owner boundaries.
depends_on: [PDS-003, PDS-005]
unblocks: [SSYS-002, SSYS-003, SSYS-004, SSYS-005, SSYS-006, SSYS-007, SSYS-008, SSYS-009, SSYS-010, SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015, SSYS-016, SSYS-017, SSYS-018, SSYS-019, SSYS-020, SSYS-021, SSYS-022, SSYS-023]
acceptance_criteria:
  - The plans index and Crosswalk route Settings surface and ordinary-persistence disputes here.
  - K3 geometry and later-packet content authority remain explicitly separate.
  - No domain runtime, command, storage engine, credential store, Browser, SCM, Server, Project Sync, Onboarding, or Doctor contract is duplicated here.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, python3 scripts/pm-plans-verify.py run-gates]
risk_class: settings_parallel_owner_drift
reasoning_tier: high
context_scope: settings_owner_routing
implementation_surfaces: [Plans/Settings_System.md, Plans/00-plans-index.md, Plans/Crosswalk.md]
node_compile_hint: {mode: settings_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
  - Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/SOURCE_AND_PRECEDENCE_MAP.md
preserved_exact_tokens: [K3 Tome Tabs, Server First Backbone, Egolite, Hermes, Origin, Browser, SCM, Full Thread Performance, Onboarding, Doctor, Bakeoff]
negative_constraints: [Do not make a concept fixture the production owner., Do not duplicate a retained domain owner's contract., Do not treat this Plans edit as implementation or certification.]
owner_hints: [Plans/Settings_System.md, Plans/00-plans-index.md, Plans/Crosswalk.md]
```

### SSYS-002 - Project-Bound Persistence And No-Project Fail Closure

```yaml
plan_unit_id: SSYS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Every persisted ordinary setting value is bound to exactly one project_id. An untouched first open or genuinely fresh
  Project receives the Final GUI-owned Basic Dark factory seed. An existing explicit saved selection and a copied
  Project's detached destination snapshot take precedence over that seed. When no Project is open, Settings renders an ephemeral Basic Dark
  context, allocates no settings store, writes no recents or UI preference state, and rejects every setting mutation,
  copy, import, restore, or reset with no_project_context. Existing Projects retain their stored values until the user
  changes or restores them; opening the app never overwrites them with fresh-Project defaults.
gui_related: true
gui_classification_reason: Project identity, theme defaults, disabled controls, and no-Project state are visible Settings behavior.
depends_on: [SSYS-001]
unblocks: [SSYS-007, SSYS-009, SSYS-010]
acceptance_criteria:
  - Every durable ordinary setting key and mutation carries one exact project_id.
  - Fresh Project and no-Project tests distinguish the durable Project-bound Basic Dark factory seed from ephemeral no-Project Basic Dark.
  - Existing explicit selections and copied detached destination snapshots survive startup, reopen, and Project switching without factory reseeding.
  - No-Project writes return no_project_context and leave storage byte-for-byte unchanged.
validation_surfaces: [future project settings scope fixtures, future no-project negative fixtures]
risk_class: cross_project_settings_leak
reasoning_tier: high
context_scope: project_settings_persistence
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, future Settings runtime]
node_compile_hint: {mode: project_bound_settings_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
  - Plans/FinalGUISpec.md#F3-510
preserved_exact_tokens: [per-project, Friendly Dark, Basic Dark, ephemeral, no_project_context]
negative_constraints: [Do not persist an app-global ordinary setting value., Do not allocate Settings storage without a Project., Do not apply fresh-Project defaults over an existing Project.]
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md]
```

### SSYS-003 - K3 Tome Tabs Geometry And Host-Width Responsiveness

```yaml
plan_unit_id: SSYS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The production Settings shell preserves the selected K3 Tome Tabs geometry: 250 px domain rail, 62 px top bar,
  workspace tabs, a continuous category document with a 168 px page index, a 350 px details inspector, and a 1040 px
  maximum ordinary document body. Responsive states are evaluated against the Settings host width, not a browser
  viewport: at 1180 px the rail compacts to 215 px and dense grids reduce; at 960 px the rail becomes a 76 px icon rail
  and details become an overlay no wider than min(370 px, 82 percent); at 720 px the 55 px top bar remains, the rail
  becomes an off-canvas sheet no wider than min(280 px, 84 percent), the page index becomes horizontal, and manager,
  form, and setting-row layouts collapse without clipping. The minimum supported host width is 320 px.
gui_related: true
gui_classification_reason: This unit defines exact visible layout geometry and responsive behavior.
depends_on: [SSYS-001]
unblocks: [SSYS-005, SSYS-006, SSYS-016, SSYS-017]
acceptance_criteria:
  - Geometry snapshots prove the 250/62/168/350/1040 wide-state values.
  - Responsive tests use the allocated Settings host width and cover 1180, 960, 720, and 320 boundaries.
  - No label, value, action, tab, page index, manager row, or details content clips or becomes unreachable.
validation_surfaces: [future Slint geometry snapshots, future host-width responsive tests]
risk_class: settings_geometry_or_host_width_drift
reasoning_tier: high
context_scope: settings_shell_geometry
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings components]
node_compile_hint: {mode: settings_shell_geometry_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-kimi/kimi.css
  - Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html
preserved_exact_tokens: [250px, 62px, 168px, 350px, 1040px, 1180px, 960px, 720px, 320px]
negative_constraints: [Do not replace host-width decisions with browser viewport queries., Do not squeeze labels or controls until they clip., Do not change the selected geometry for aesthetic cleanup.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md]
```

### SSYS-004 - Canonical Inventory And Manager Separation

```yaml
plan_unit_id: SSYS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Plans/settings_inventory.json remains the machine authority for exactly 828 ordinary setting IDs across 12
  categories. Settings binds rows to that registry and never substitutes K3 demo data, an embedded PMConcept snapshot,
  or manager pseudo-rows. Managers, one-shot actions, status projections, diagnostics, setup workflows, and unavailable
  capabilities are typed searchable destinations outside the ordinary-setting denominator and route to their owners.
  The inventory scope field remains useful owner/applicability metadata but does not authorize non-Project persistence.
gui_related: true
gui_classification_reason: The inventory and destination-type split determines visible search results and Settings content.
depends_on: [SSYS-001, F3-441]
unblocks: [SSYS-005, SSYS-006, SSYS-015]
acceptance_criteria:
  - A registry census finds 828 unique IDs and 12 categories.
  - The rendered ordinary-setting denominator matches the registry exactly.
  - Manager/action/status/diagnostic/setup/unavailable results carry a non-setting result type and do not inflate 828.
validation_surfaces: [jq and schema census over Plans/settings_inventory.json, future result-type fixtures]
risk_class: settings_inventory_or_denominator_drift
reasoning_tier: high
context_scope: settings_inventory_binding
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_inventory.json, Plans/settings_inventory.schema.json]
node_compile_hint: {mode: settings_inventory_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/settings_inventory.json
  - Plans/settings_inventory.schema.json
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [828, 12 categories, ordinary settings, managers]
negative_constraints: [Do not use K3 demo rows as runtime authority., Do not count managers as ordinary settings., Do not interpret inventory scope metadata as permission for app-global persistence.]
owner_hints: [Plans/Settings_System.md, Plans/settings_inventory.json, Plans/settings_inventory.schema.json]
```

### SSYS-005 - All Settings Fuzzy Search, Facets, And Variable-Height Virtualization

```yaml
plan_unit_id: SSYS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  All Settings provides cross-category fuzzy search over id, label, description, search aliases, and destination
  metadata; it preserves F3-433 multi-token case-insensitive AND subsequence matching, +40 curated, +22 simple-tier,
  and +10 non-ok owner-status boosts, an 80 ms debounce, and the best 60 search results. Facets cover category,
  exposure, control type, applicability/scope metadata, owner-derived status, and result type without changing the
  underlying 828-ID denominator. The ordinary list uses variable-height virtualization with stable setting_id keys,
  cached measured heights, anchor-plus-offset preservation, overscan, latest-generation cancellation, and no manager
  hydration merely because a search row is visible. Long or localized content expands rather than clipping. Category
  group headers are rows of the same virtualized model, measured like any row and never a separate non-virtualized
  wrapper, and the list may scroll with the page rather than inside a fixed-height box (USER-SETTINGS-MANAGER-REFRESH-20260908).
gui_related: true
gui_classification_reason: Search, facets, highlighting, keyboard selection, and virtualized rows are user-visible interactions.
depends_on: [SSYS-003, SSYS-004, F3-433]
unblocks: [SSYS-017]
acceptance_criteria:
  - Category group headers belong to the virtualized model and the scroll anchor survives group expansion.
  - Search results are deterministic for the same registry, status generation, query, and facet set.
  - Arrow navigation, Enter focus, Escape clearing, pointer activation, and screen-reader result announcements retain one active stable ID.
  - Variable-height tests preserve the anchor across expansion, wrapping, status changes, theme changes, and facet/search changes.
  - Searching 828 settings does not instantiate or probe every manager.
validation_surfaces: [future fuzzy-search fixtures, future variable-height virtualization tests, future accessibility tests]
risk_class: settings_search_or_virtualization_drift
reasoning_tier: high
context_scope: all_settings_search
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings models and list components]
node_compile_hint: {mode: settings_search_virtualization_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#F3-433
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/PERFORMANCE_SETTINGS_RETURN.md
preserved_exact_tokens: ["+40", "+22", "+10", "80 ms", "60", variable-height virtualization, setting_id]
negative_constraints: [Do not eagerly hydrate managers or run broad probes for search., Do not use fixed-height clipping for long rows., Do not let facets create a second inventory.]
owner_hints: [Plans/Settings_System.md, Plans/settings_inventory.json]
```

### SSYS-006 - Row, Details, Manager, And Origin Grammar

```yaml
plan_unit_id: SSYS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  An ordinary row shows human title, concise explanation, current value/state, Project scope, default/source,
  availability, restart or reconnect requirement, owner-derived validation/error, and Help/Details. Auto, Default,
  Recommended, Not configured, Managed, Custom, Unavailable, and Effective value differs are explicit states rather
  than empty values. Managers reuse header, search/filter, primary setup action, health summary, resource list,
  detail/inspector, requested/effective state, loading/empty/failed/unavailable/managed states, and logs/receipts routes.
  Each manager uses a concise task-specific introduction and one primary placement for each action in the current
  view; repeated chapter prose, identical index parent/child destinations, and shortcut panels that merely repeat
  adjacent tabs are not required chrome. Every manager renders through one shared kit: no header-level action strip, at most
  six tabs, exactly one labeled Advanced disclosure per view, one quiet bottom action row, exactly one check control per
  connectable entity, and the shared side-panel anatomy (USER-SETTINGS-MANAGER-REFRESH-20260908). Secondary explanations, detailed provenance, and advanced configuration
  use labeled keyboard-operable disclosures or their dedicated detail/tab. Collapsing secondary material never
  hides a blocking error, unavailable reason, consent boundary, requested/effective difference, or live-versus-example
  distinction. Sound preview and explicit notification test-send consume F3-405 rather than sharing a simulated
  delivery-success presentation.
  Hidden origin/breadcrumb metadata may preserve return context. A visible Back, Close, or breadcrumb is not required;
  Settings must remain keyboard-escapable through the host's standard navigation contract without adding geometry.
gui_related: true
gui_classification_reason: This unit defines visible row, inspector, manager, state, help, and navigation grammar.
depends_on: [SSYS-003, SSYS-004]
unblocks: [SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015]
acceptance_criteria:
  - Every ordinary row exposes value, source, Project scope, availability, validation, Help/Details, and effect timing.
  - Every manager implements the shared semantic states without pretending status, action, and persisted value are equivalent rows.
  - Manager curation preserves stable destinations and action availability while removing duplicate in-view navigation and actions; secondary controls remain discoverable and keyboard-operable.
  - Advanced disclosures do not suppress actionable warnings, permission or consent boundaries, owner-currentness reasons, or example-data labels.
  - Return context survives without requiring visible Back, Close, or breadcrumb chrome.
validation_surfaces: [future row renderer matrix, future manager-state matrix, future navigation and focus tests]
risk_class: settings_state_or_manager_grammar_drift
reasoning_tier: high
context_scope: settings_row_and_manager_grammar
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings components]
node_compile_hint: {mode: settings_row_manager_grammar_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/02_MANAGER_GRAMMAR_AND_SETTING_MODEL.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [Help, Details, Auto, Not configured, Managed, Unavailable, hidden origin breadcrumb]
negative_constraints: [Do not render one-shot actions, status, diagnostics, manager routes, and persisted values as the same row type., Do not require a visible Back or Close control.]
owner_hints: [Plans/Settings_System.md, Plans/Crosswalk.md]
```

### SSYS-007 - Detached Exact-ID Settings Transfer

```yaml
plan_unit_id: SSYS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: 'Copy Settings From Another Project is a one-time detached exact-ID transaction. The user selects
  broad categories, preview resolves each category to an immutable sorted setting_id set and source/destination
  revisions, and the UI shows a redacted diff, source Project, provenance, exclusions, conflicts, validation, and
  rollback plan before apply. The ten stable selector IDs are appearance_workspace, assistant_chat, providers_accounts_models_routing,
  planning_goal, orchestrator_automation, tools_integrations, testing_browser_devices, permissions_security, memory_retention_history,
  and notifications_usage_budgets. Apply creates a destination restore point, validates and atomically writes only
  the previewed IDs, reads back, emits a durable result, and rolls back on failure. The destination is independent
  immediately: no inheritance, live link, or later source propagation exists. For an uncreated Onboarding destination,
  the same preview command uses the Settings-owned draft variant with source Project/revision and destination draft/ref/revision/hash,
  never a fake destination Project ID. No value applies before the reviewed Project commit. After real identity
  reservation, rebind/revalidate to an ordinary Project preview and apply with exact-ID readback/rollback; explicit
  new choices override copied defaults.'
gui_related: true
gui_classification_reason: Category selection, preview, diff, provenance, confirmation, result, and rollback are
  visible flows.
depends_on:
- SSYS-002
- SSYS-004
- SSYS-008
- SSYS-009
unblocks:
- SSYS-017
acceptance_criteria:
- Existing-Project preview/apply binds exact source/destination Project IDs and revisions; Onboarding draft preview
  binds the exact source Project and uncreated destination draft, selectors, sorted eligible IDs and hash, then
  rebinds only after actual Project identity reservation.
- Credential-bearing IDs and owner-excluded IDs are listed as excluded and never copied.
- Stale preview, validation failure, commit/read-back failure, or cancellation produces no partial destination mutation.
- Later source changes cannot affect the destination.
- Explicit choices made for the new Project win over copied defaults; excluded credential-bearing and owner-excluded
  IDs are never applied.
- A draft preview or rebind cannot itself satisfy the ordinary apply request; source/draft/preview/inventory changes
  or expiry invalidate the proposed copy.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- tests/test_pm_settings_draft_transfer.py
- future native Settings restore/readback/rollback receipts; not_run
risk_class: settings_transfer_leak_or_partial_apply
reasoning_tier: high
context_scope: project_settings_transfer
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future Settings transfer service
node_compile_hint:
  mode: detached_settings_transfer_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/SERVER_BACKBONE_SETTINGS_RETURN.md
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens:
- Copy Settings From Another Project
- exact-ID
- preview
- diff
- provenance
- rollback
- no inheritance
negative_constraints:
- Do not copy raw credentials or credential-store contents.
- Do not copy unpreviewed IDs.
- Do not create continuous inheritance.
- Do not expose hundreds of per-ID merge choices as the primary flow.
owner_hints:
- Plans/Settings_System.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SSYS-008 - Credential Exclusion And Secure Reference Custody

```yaml
plan_unit_id: SSYS-008
unit_type: security_constraint
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Credentials are excluded from ordinary setting persistence, transfer, export, backup, preview, diff, receipts,
  diagnostics, and search indexes. PM-owned secrets remain only in the operating-system credential store and Settings
  may persist or display only the non-secret credential_ref and redacted owner status allowed by Multi-Account,
  Permissions, and Storage. CLI-owned profiles remain non-secret host-local profile_ref values and their OAuth material
  is never copied. Transfer and mutation receipts do not duplicate raw ordinary values; they retain setting IDs,
  revisions, before/after hashes, redacted summaries, and owner evidence refs.
gui_related: true
gui_classification_reason: Credential selectors, masked status, exclusions, and redacted previews are visible Settings behavior.
depends_on: [SSYS-001, MA-070]
unblocks: [SSYS-007, SSYS-011, SSYS-012]
acceptance_criteria:
  - Raw tokens, passwords, keys, OAuth values, cookies, credential files, and credential-store contents appear in no Settings record or artifact.
  - Credential rows use non-secret references and owner-provided redacted status only.
  - Transfer and export fixtures prove credential exclusion and absence of raw value duplication in receipts.
validation_surfaces: [future secret-negative fixtures, future transfer/export redaction fixtures]
risk_class: settings_secret_exposure
reasoning_tier: high
context_scope: settings_credential_custody
implementation_surfaces: [Plans/Settings_System.md, Plans/Multi-Account.md, Plans/Permissions_System.md, Plans/storage-plan.md]
node_compile_hint: {mode: settings_secret_reference_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Multi-Account.md#MA-070
  - Plans/Shared_Integration_Runtime.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [credential_ref, profile_ref, operating-system credential store, raw values never persisted]
negative_constraints: [Do not store raw credentials in project settings., Do not treat a CLI profile ref as a PM secret-store handle., Do not duplicate raw values in transfer or mutation receipts.]
owner_hints: [Plans/Settings_System.md, Plans/Multi-Account.md, Plans/Permissions_System.md, Plans/storage-plan.md]
```

### SSYS-009 - Atomic Mutation, Theme Pair, And Restore Defaults

```yaml
plan_unit_id: SSYS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Every ordinary setting change is one project-bound validate-CAS-commit-read-back transaction with project_id,
  setting_id or atomic group ID, expected Project settings revision, schema version, idempotency key, actor ref, and
  owner validation evidence. No UI projection changes until admission; optimistic paint must reconcile to the typed
  result. Theme family and presentation mode form one atomic pair and the effective built-in variant is derived rather
  than persisted independently. Restore Defaults resolves the current registry defaults for the requested Project and
  exact ID set, previews affected IDs, creates a restore point, commits one revision, reads back, and rolls back on any
  failure. Accepted means admitted, not verified success.
gui_related: true
gui_classification_reason: Instant changes, theme selection, Restore Defaults, busy/blocked state, and rollback are visible behavior.
depends_on: [SSYS-002, SSYS-004]
unblocks: [SSYS-007, SSYS-010, SSYS-017]
acceptance_criteria:
  - Stale revision, invalid value, missing Project, permission denial, and read-back mismatch produce no partial committed state.
  - Theme family and mode cannot commit at different revisions or yield an impossible derived variant.
  - Restore Defaults previews and atomically commits the exact ID set and can restore the prior valid revision.
validation_surfaces: [future settings CAS/idempotency fixtures, future theme-pair fixtures, future restore-defaults rollback fixtures]
risk_class: settings_atomicity_or_default_recovery_failure
reasoning_tier: high
context_scope: settings_mutation_transactions
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, future Settings mutation service]
node_compile_hint: {mode: settings_atomic_mutation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
  - Plans/FinalGUISpec.md#F3-511
preserved_exact_tokens: [atomic, theme pair, Restore Defaults, read-back, rollback, idempotency]
negative_constraints: [Do not persist theme family and mode independently., Do not treat command acceptance as successful read-back., Do not perform partial bulk reset.]
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Permissions_System.md]
```

### SSYS-010 - Project Appearance And Chat Layout Settings

```yaml
plan_unit_id: SSYS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Each Project independently persists theme family, Light/Dark/Auto presentation mode, Glass background mode, Glass
  alpha/transparency, tooltip enablement, reduced-motion request and background selection. The chat layout is no longer
  a Settings value (DL-180): the chat stays fixed on the right, its width, pinned History and popped-out state live in
  the Project's Home layout record (Plans/storage-plan.md#SP-330), and general.visual.chat-layout-mode is retired
  (SSYS-050). The eight built-in variants are Friendly Dark, Friendly
  Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, and Basic Light. Final GUI owns the untouched
  first-open/fresh-Project Basic Dark factory selection; Settings consumes that seed only when no committed Project theme
  exists. Existing explicit selections and copied detached snapshots win. No-Project rendering is ephemeral Basic Dark.
  Theme family plus mode apply as the SSYS-009 atomic pair. Family-specific
  controls (Glass background and transparency, Retro textures and their strengths, Basic high contrast and the older
  Basic light/dark choice) show only while that family is active (decided 2026-09-27; they were previously kept visible
  as `not_applicable`); Glass alpha never drops below 0.35 in Dark or
  0.45 in Light. Appearance preview is non-persistent and reverts on cancel, close, expiry, route change, or Project switch;
  apply uses the same preview hash and atomic transaction as every other Settings change. Disabling hover tooltips never
  removes keyboard-focus accessible descriptions or Help/Details. Effective reduced motion is true when either the Project
  request or platform preference is true; it calms nonessential entrance, hover, parallax, shimmer, and background motion
  while retaining focus, progress, error, and state-change feedback. Background and transparency apply to the
  current Project only and never leak through app-global local storage. The application's first frame shows the
  committed appearance of the Project it opens on, NieR Mode included, read by the pre-paint layer from that Project's
  Settings (F3-468, DL-153); the pre-paint keeps no copy, and no app-global or cross-Project theme key or paint hint
  exists.
gui_related: true
gui_classification_reason: Themes, Glass composition and backgrounds are directly visible.
depends_on: [SSYS-002, SSYS-009, F3-425, DL-180]
unblocks: [SSYS-016, SSYS-017]
acceptance_criteria:
  - Switching Projects restores each Project's independent appearance snapshot; the chat column comes back from that Project's Home layout record, never from a Settings value.
  - Eight built-in variants remain available and fresh/no-Project defaults are distinct.
  - Non-Glass contexts disclose why Glass-only controls are unavailable instead of hiding them.
  - Preview writes no durable value and every non-apply exit restores the committed Project appearance.
  - Tooltip-off and reduced-motion tests preserve accessible descriptions, Help/Details, focus, progress, error, and state feedback.
  - The first frame of an ordinary open is the opened Project's committed appearance, NieR Mode included, read from its Settings, and no app-global theme key, cross-Project copy or paint hint is written (F3-468, DL-153).
validation_surfaces: [Plans/settings_system_contract_fixtures.json, future eight-theme project-switch tests, future Glass control-state tests, future tooltip and reduced-motion tests, future no-global-local-storage tests]
risk_class: theme_or_layout_cross_project_leak
reasoning_tier: high
context_scope: project_appearance_settings
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
node_compile_hint: {mode: project_appearance_settings_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#F3-425
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [Friendly Dark, Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, Basic Light, 0.35, 0.45, tooltips, reduced motion, chat layout]
negative_constraints: [Do not persist appearance outside the Project settings namespace., Do not store the chat column's width, History or pop-out as a Settings value., Do not hide unavailable Glass controls., Do not make no-Project Basic Dark durable., Do not remove accessible descriptions when hover tooltips are off., Do not suppress progress or error feedback under reduced motion.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
stale_retired_dispositions: ["Amended 2026-10-09 (DL-180): the chat layout setting retires; the chat column's state is the Home layout record's (SP-330), and SSYS-050 records the retired row. The title's Chat Layout is historical, kept for lineage."]
```

### SSYS-011 - Provider Installation Actions And Continuation

```yaml
plan_unit_id: SSYS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Provider installation cards expose only the registered shared-runtime actions whose owner selectors report
  available. Initial acquisition uses cmd.installation.install only after explicit user Install or Setup, official
  source proof, and exact Execution Host and Execution Environment selection. Repair and Verify remain separate
  actions using cmd.installation.repair and cmd.installation.verify with their exact catalog disabled reasons and
  typed results. Provider setup preserves origin_surface, origin_route, provider/route identity, exact topology,
  operation identity, and a bounded continuation so successful owner work returns to the originating Settings row.
  Settings exposes no Provider Uninstall action, command, menu item, or implied destructive fallback.
  Installed-tool update choices consume Shared Integration Runtime section 4.7: separate check-now and
  check-and-install-now actions, automatic check-only or check-and-install policy, disabled background checks,
  and an independent routine update-notification preference. These are user-facing update choices, not
  ownership/consent-category choices, and do not alter Puppet Master's separate app-update/restart policy.
gui_related: true
gui_classification_reason: Install, Repair, Verify, disabled reasons, exact target, progress, and return context are visible provider-manager behavior.
depends_on: [SSYS-006, SSYS-008, CS-066, UCC-145, SIR-003]
unblocks: [SSYS-015, SSYS-017]
acceptance_criteria:
  - Install, Repair, and Verify dispatch only the registered IDs and exact handlers.
  - Each action carries exact Host/Environment, Project, expected revision/epoch, idempotency, permission, and continuation evidence required by CS-066.
  - A missing or invalid owner selector renders the exact disabled reason and dispatches nothing.
  - Provider Uninstall is absent from rendered controls, command lookup, natural-language suggestions, and automation routes.
  - Installed-tool consumers use the SIR-021 update preferences and exact installation/Host/Environment policy; manual actions do not edit the saved automatic mode, and disabling background checks does not remove manual checks.
  - Do not notify suppresses routine update-available notices only; Details/ObservableWork still show update state, failures, security warnings, and required approvals. Missing automatic-install authority shows the requested/effective difference and the owner's disabled reason.
  - Update preferences and manual action intent do not register a command or synthesize a Settings-local updater. Deferred check/update-policy candidates remain unavailable until their central contracts close; current manager layout and styling are unchanged by this Plan correction.
validation_surfaces: [existing CS-066 and UCC-145 fixtures, Plans/egolite_retained_requirement_contracts.schema.json#/$defs/installation_update_preferences, tests/test_pm_installation_update_preferences.py, future Settings provider-card availability and continuation fixtures]
risk_class: provider_setup_authority_or_target_drift
reasoning_tier: high
context_scope: settings_provider_installation
implementation_surfaces: [Plans/Settings_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: settings_provider_action_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-066
  - Plans/UI_Command_Catalog.md#UCC-145
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
  - source_ref:chat:user-update-options-correction-2026-09-09
preserved_exact_tokens: [cmd.installation.install, cmd.installation.repair, cmd.installation.verify, Host, Environment, continuation, no Uninstall]
negative_constraints: [Do not silently acquire a provider CLI., Do not synthesize Settings-local install commands., Do not show Provider Uninstall., Do not treat installer exit zero as provider readiness.]
owner_hints: [Plans/Settings_System.md, Plans/Shared_Integration_Runtime.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### SSYS-012 - Server, Client, Project Location, SSH, And Full Backup Manager Routes

```yaml
plan_unit_id: SSYS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The full Settings manager system includes owner-routed destinations for Server Claim and Bootstrap; Servers;
  Execution Hosts and exact Environments; Clients and continuity; Project Hosting, Location, and Files; Project Sync,
  Move, and Copy; SSH remote add, edit, test, disable, and remove; Remote Access; and Full Server Backup. Settings shows
  human identity, requested/effective target, freshness, truthful ObservableWork, receipts, and recovery actions. SIR-013
  retains claim/bootstrap truth, Project_Sync_and_Backbone retains Project-content movement, GitHub_Integration and
  security owners retain SSH behavior and credential custody, and Backup_Restore_System retains Project Backup and Full
  Server Backup/Restore product semantics while Storage retains physical persistence and internal recovery. The backup
  owner contracts are canonical, but absent central command registration, sole handler, production wiring, or runtime
  evidence keeps the affected action visible and unavailable with the exact missing-integration reason; the concept
  fixture cannot stand in for executable closure.
gui_related: true
gui_classification_reason: Server, client, Project, SSH, backup, progress, disabled, and recovery manager states are visible.
depends_on: [SSYS-006, SSYS-008, SIR-013, PSB-001, BRS-001, BRS-008]
unblocks: [SSYS-014, SSYS-015, SSYS-017]
acceptance_criteria:
  - Every manager preserves exact Project, Server, Vault, Host, Environment, Source Location, client, SSH remote, operation, and topology generation identity supplied by its owner.
  - Settings neither equates reachability with claim nor paths with Vault identity and does not implement Project Sync or SSH mutations locally.
  - Full Server Backup is distinct from settings transfer, Project backup, and internal recovery snapshots.
  - Missing command, handler, wiring, or runtime closure renders unavailable and cannot be converted into fixture success.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, future exact-topology routing fixtures, future SSH CRUD route fixtures, future backup unavailable-integration negative fixtures]
risk_class: settings_server_project_or_backup_parallel_owner
reasoning_tier: high
context_scope: settings_server_project_routes
implementation_surfaces: [Plans/Settings_System.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/GitHub_Integration.md, Plans/Backup_Restore_System.md, Plans/storage-plan.md]
node_compile_hint: {mode: settings_server_project_route_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-013
  - Plans/Project_Sync_and_Backbone.md
  - Plans/Backup_Restore_System.md#BRS-001
  - Plans/Backup_Restore_System.md#BRS-008
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/SERVER_BACKBONE_SETTINGS_RETURN.md
preserved_exact_tokens: [Claim and Bootstrap, Clients, continuity, Project Hosting, Project Location, Project Files, Sync, Move, Copy, SSH CRUD, Full Server Backup]
negative_constraints: [Do not create a Project replica or peer-sync manager., Do not treat transport reachability as Server claim., Do not copy SSH credentials., Do not call a fixture receipt a real backup.]
owner_hints: [Plans/Settings_System.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/GitHub_Integration.md, Plans/Backup_Restore_System.md, Plans/storage-plan.md]
```

### SSYS-013 - Browser, SCM, And Container Owner Boundaries

```yaml
plan_unit_id: SSYS-013
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Browser and SCM are Settings dependency and routing surfaces, not embedded operational workbenches. Concept presentation
  may fold their governance detail into one Advanced disclosure that never hides a blocking error, unavailable reason, consent
  boundary, requested/effective difference, or live-versus-example distinction (USER-SETTINGS-MANAGER-REFRESH-20260908). Settings may show
  ordinary PM-native Browser policy, readiness, capture/retention policy, agent-sharing policy, and routes to the
  Browser owner; protected AuthBrowserSession remains human-only, ephemeral, non-capturable, non-automatable, and absent
  as an ordinary tab. Source Control settings show tool/forge/account/environment/worktree/default/safety/repair state
  and route repository, diff, commit, branch, history, graph, provider-neutral Actions & Pipelines, and SSH operations
  to their owners. Repository hosting and automation bindings remain independent; Forgejo and Gitea are distinct
  provider/instance profiles rather than one API-compatible alias. Container
  ordinary rows and search results redirect to Docker Manager or Docker/Hosts; Settings embeds no Docker, Podman,
  Kubernetes, registry, runtime, log, exec, publish, or workload operational UI. One-time setup is configuration rather
  than operation and may run in Settings as a flow that dispatches the owner's command (decided 2026-09-27): signing in
  to Docker Hub or another registry, creating an image repository, setting up and checking the Unraid template
  repository, and editing the Unraid publisher profile; running containers, logs, exec, publishing and workloads stay
  with Docker Manager.
gui_related: true
gui_classification_reason: Browser, SCM, protected-auth disclosure, and container redirects are user-visible Settings routes.
depends_on: [SSYS-006, SMPFS-143]
unblocks: [SSYS-014, SSYS-015, SSYS-017]
acceptance_criteria:
  - Settings uses only PM-native Browser Program terminology and exposes no Playwright Settings capability.
  - Protected authentication content is inaccessible to Settings search, preview, capture, diagnostics, agents, and transfer.
  - SCM operational actions land in the Source Control/GitHub owners with original Project and route context.
  - Container rows dispatch navigation only and cannot perform container operations inside Settings.
validation_surfaces: [future Browser/SCM route fixtures, protected-auth negative fixtures, Docker Manager redirect fixtures]
risk_class: settings_browser_scm_or_container_owner_escape
reasoning_tier: high
context_scope: settings_browser_scm_container_routes
implementation_surfaces: [Plans/Settings_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/WorktreeGitImprovement.md, Plans/GitHub_Integration.md, Plans/Containers_Registry_and_Unraid.md]
node_compile_hint: {mode: settings_dependency_route_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/EGOLITE_SETTINGS_RETURN.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [Browser, SCM, AuthBrowserSession, Source Control Manager, Docker Manager, Docker/Hosts]
negative_constraints: [Do not add a PM Playwright setting or runtime., Do not expose protected-auth content., Do not duplicate Source Control or Docker Manager operations in Settings.]
owner_hints: [Plans/Settings_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/WorktreeGitImprovement.md, Plans/GitHub_Integration.md, Plans/Containers_Registry_and_Unraid.md]
```

### SSYS-014 - Onboarding Routing And Operational Doctor Projection Boundary

```yaml
plan_unit_id: SSYS-014
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings exposes Readiness and Setup as a dependency projection and resumable route surface only. Product Onboarding,
  Installation and Deployment, and Server Claim and Bootstrap remain three coordinated owner flows under SMPFS-146;
  Settings may launch or resume them with exact Project, origin, target, operation, and continuation context but cannot
  merge or own their state machines. `settings.onboarding.open`, `settings.onboarding.run_again`,
  `settings.guided_tour.resume`, and `settings.guided_tour.replay` are route-only UI actions over `cmd.settings.open`;
  they target the `onboarding-guided-tour` manager with exact detail IDs `overview`, `run-onboarding-again`,
  `resume-guided-tour`, and `replay-guided-tour`. Resume Guided Tour is available only while the Guided Tour owner
  reports a checkpoint that can resume, and is otherwise disabled with that reason.
  The authorized operational Doctor workspace is a full K3 Settings presentation over the N2-151/N2-152/N2-153
  registry, router, and normalized cached projections. It may render the cached-first overview, stable groups and filters,
  scoped `Check now` requests, progressive `Details` / `Logs` / `Receipt`, and one owner-routed remediation per finding.
  The `ui.doctor.*` actions remain Doctor-owned typed local UI actions; domain owners still execute every probe and
  mutation. `settings.doctor.open` and `settings.doctor.remediation.open` are route-only UI actions over
  `cmd.settings.open`; remediation targets `check:{check_id}` and never executes the repair. Settings may host the full
  operational presentation but does not run probes, own check truth, perform a private mutation, claim readiness,
  simulate a completed repair, or merge/own the Product Onboarding or Guided Tour state machines.
gui_related: true
gui_classification_reason: Dependency cards, full operational Doctor projections, evidence disclosures, disabled reasons, and owner routes are user-visible.
depends_on: [SSYS-012, SSYS-013, SMPFS-146, N2-151, N2-152, N2-153]
unblocks: [SSYS-015, SSYS-017]
acceptance_criteria:
  - Each dependency identifies its retained owner, currentness, evidence, route, and continuation.
  - The six route-only UI action IDs validate against the machine fixture and preserve exact return context.
  - The operational Doctor workspace renders cached-first normalized findings, scoped-check pending state, lazy bounded redacted Details/Logs/Receipt, and one canonical owner remediation without giving Settings probe or mutation authority.
  - Closing, filtering, refreshing, or returning from remediation preserves the stable finding identity and exact focus/currentness context; route success alone cannot mark remediation complete.
  - UI completion, reachability, fixture data, or a spinner cannot produce readiness or Doctor success.
  - Settings contains no domain probe, repair implementation, or parallel onboarding state machine.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, future onboarding owner-route fixtures, future operational Doctor cached-first/lazy-evidence/exact-return/no-private-mutation fixtures]
risk_class: settings_onboarding_doctor_false_readiness
reasoning_tier: high
context_scope: settings_onboarding_doctor_projection
implementation_surfaces: [Plans/Settings_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/newtools.md]
node_compile_hint: {mode: settings_onboarding_doctor_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-146
  - Plans/newtools.md#N2-151
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [Product Onboarding, Installation and Deployment, Server Claim and Bootstrap, operational Doctor workspace, Guided Tour, Check now, Details, Logs, Receipt, settings.onboarding.run_again, settings.guided_tour.resume, settings.guided_tour.replay, settings.doctor.remediation.open, continuation, domain_owner_only, no private mutation]
negative_constraints: [Do not merge the three onboarding flows., Do not run Doctor probes or mutations from Settings., Do not claim readiness from UI completion or route success., Do not treat the authorized full Doctor presentation as Settings-owned check truth or repair authority., Do not build a parallel Product Onboarding or Guided Tour state machine in Settings.]
owner_hints: [Plans/Settings_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/newtools.md]
```

### SSYS-015 - Full Settings Manager System

```yaml
plan_unit_id: SSYS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings ships as a full manager system rather than an 828-row form or provider-only demo. The manager registry
  is frozen as the exact 38-key machine registry in Plans/settings_system_contract_fixtures.json and includes General Desktop and Appearance; Providers, Accounts, Models, and Installations; Web Routes; Media Routes;
  Back Seat Driver; Memory and Context; Goals, Crew, Personas, and Owners; Permissions and FileSafe; Commands and
  Shortcuts; Tools, MCP, Skills, Plugins, LSP, Formatters, and Toolchains; Testing and Debug policy; Files and Editor;
  Terminal; Notifications and Sounds; Source Control and Actions & Pipelines; Browser and SCM dependencies; Storage,
  Retention, Recovery, and Cleanup; Project History, Sessions, Artifacts, and Outputs; Settings Transfer; Servers,
  Hosts, Environments, Clients, Remote Access, Project Hosting/Files/Sync/Move/Copy, SSH, Backup and Restore, Updates,
  Readiness and Setup; Teacher and Help; Project Search Index; and DRY Method visible state. Concept presentation may group or split these destinations into workspaces (one System workspace
  Server & Project Location over the seven server/location keys; separate Code & Tools workspaces for Skills, Plugins, MCP
  Servers, and Commands & Shortcuts over tools-integrations and commands-shortcuts) without changing manager_id keys, routes,
  or details paths (USER-SETTINGS-MANAGER-REFRESH-20260908), and may present canonical ordinary settings inline within the manager workspace
  that owns their topic without changing manager_id keys or the inventory (USER-SETTINGS-MANAGER-REFRESH-20260909). Each entry has one stable manager_id, owner route, lazy summary projection, supported actions,
  exact unavailable reasons, and a details path; operational behavior remains in the retained owner.
gui_related: true
gui_classification_reason: The complete manager destination set and shared visible states define the Settings product surface.
depends_on: [SSYS-004, SSYS-006, SSYS-011, SSYS-012, SSYS-013, SSYS-014]
unblocks: [SSYS-017]
acceptance_criteria:
  - The exact 38-entry manager registry covers every named family with stable identity and an explicit retained owner or named owner-gap disposition.
  - Settings Home hydrates compact summaries first and one selected manager lazily; hidden managers release heavy state.
  - Every manager action resolves to a registered owner command or remains unavailable with the exact reason.
  - Search can find all managers without counting them among the 828 ordinary settings.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future lazy-hydration tests, future owner-route coverage matrix]
risk_class: incomplete_or_parallel_settings_manager_system
reasoning_tier: high
context_scope: full_settings_manager_registry
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future Slint Settings manager models]
node_compile_hint: {mode: settings_manager_registry_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/05_DESKTOP_DEVELOPER_AND_SYSTEM_MANAGERS.md
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/PERFORMANCE_SETTINGS_RETURN.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [full manager system, lazy hydration, Settings Transfer, Readiness and Setup]
negative_constraints: [Do not call Provider Manager plus a few rows a complete Settings system., Do not hydrate or probe all managers on startup., Do not invent manager-private mutation handlers.]
owner_hints: [Plans/Settings_System.md, Plans/Shared_Integration_Runtime.md]
```

### SSYS-016 - PMConcept7 T44 And Slint Portability Boundary

```yaml
plan_unit_id: SSYS-016
unit_type: constraint
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The generated PMConcept7 Settings fixture is source-owned by the T44 transform in
  Concepts/pm7-tools/settings_tome_source.py and the T50 Settings-refresh transform in
  Concepts/pm7-tools/settings_refresh_source.py (USER-SETTINGS-MANAGER-REFRESH-20260908), composed by
  Concepts/pm7-tools/build_pm7.py, and emitted as Concepts/PMConcept7.html, with Concepts/TestPMConcept.html a second
  generated concept artifact under the same concept_fixture_only boundary, published through
  Concepts/pm7-tools/build_testpm_settings_refresh.py; the generated HTML is never the authored production owner. T44 may demonstrate the K3
  geometry, 828-row projection, later-packet manager additions, project/no-Project defaults, and command previews, but
  fixture state, local browser storage, simulated receipts, and JavaScript handlers are not runtime proof. Production
  targets Rust stable and Slint 1.17.1 using typed models, host-width layout states, variable-height virtualization,
  explicit properties and focus state, precomputed theme tokens, native animations, and opaque or pre-blurred known
  assets where they help performance; blur, backdrop blur, masks, blend modes and filter effects drawn by Puppet
  Master's Skia renderer extensions (FinalGUISpec F3-582, DL-139) are no longer excluded for portability. DOM
  selectors, :has, viewport-width CSS, localStorage, color-mix, arbitrary backdrop blur, and CSS/JS motion in the
  concept are translation inputs, not production dependencies of the Slint desktop; the Leptos web GUI (F3-583,
  DL-139) draws Settings with its own DOM and CSS from the shared interface-model crate and design-token source, and
  the concept HTML is a design reference there, not script to run under Leptos. This direction makes no portability, build, runtime, visual,
  performance, accessibility, or certification claim.
gui_related: true
gui_classification_reason: This unit governs the visual concept lineage and future Slint implementation direction.
depends_on: [SSYS-003, SSYS-010]
unblocks: [SSYS-017]
acceptance_criteria:
  - PMConcept7 is reproducibly generated from authored transforms and is labeled concept_fixture_only.
  - Production implementation does not hand-port the concept's browser persistence, JavaScript handlers or DOM/CSS-only mechanisms as runtime architecture; the Leptos web GUI (F3-583) uses its own DOM and CSS presentation over the shared interface model.
  - Any Slint acceptance claim requires fresh build/runtime/visual/accessibility/performance evidence under SSYS-017.
validation_surfaces: [future PM7 source/generated reproducibility check, future Slint build and runtime evidence]
risk_class: concept_fixture_promoted_as_runtime_proof
reasoning_tier: high
context_scope: settings_pmconcept_slint_boundary
implementation_surfaces: [Plans/Settings_System.md, Concepts/pm7-tools/settings_tome_source.py, Concepts/pm7-tools/build_pm7.py, Concepts/PMConcept7.html, future Slint Settings components]
node_compile_hint: {mode: settings_concept_portability_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/pm7-tools/settings_tome_source.py
  - Concepts/pm7-tools/build_pm7.py
  - Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [T44, PMConcept7, Slint 1.17.1, concept_fixture_only, no certification claim]
negative_constraints: [Do not hand-edit generated PMConcept7.html., Do not call static or browser concept checks Slint proof., Do not claim portability or certification without fresh production evidence.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md]
```

### SSYS-017 - Settings Validation And Acceptance Gate

```yaml
plan_unit_id: SSYS-017
unit_type: validation
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings acceptance requires fresh production evidence for exact K3 host geometry, 828 unique ordinary IDs, complete
  manager routing, project isolation, no-Project write rejection, eight themes, atomic theme pair and Restore Defaults,
  fuzzy search/facets, variable-height virtualization, transfer preview/apply/rollback and secret exclusion, provider
  action availability/continuation and no Uninstall, Server/Project/SSH/backup routes, Browser/SCM/container boundaries,
  Onboarding/Doctor projection-only behavior, keyboard/pointer/focus/accessibility parity, reduced motion, truthful
  loading, Slint 1.17.1 build/runtime behavior on the desktop, and Leptos web-client build/runtime behavior, with the
  same shared fixtures run through both interfaces and screenshots of each checked against that interface's own visual
  baselines (F3-583, DL-139). Schema/text/static checks are findings only and cannot prove runtime,
  visual, performance, accessibility, or implementation readiness. Open owner, command, wiring, inventory-scope, Event
  Authority, PNC-019, or backup command/handler/wiring/runtime gaps remain named blockers or residual risks rather than
  being erased by a concept pass.
gui_related: true
gui_classification_reason: The acceptance matrix covers the full visible Settings surface and interactions.
depends_on: [SSYS-003, SSYS-005, SSYS-007, SSYS-009, SSYS-010, SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015, SSYS-016, SSYS-018, SSYS-019, SSYS-020, SSYS-021, SSYS-022, SSYS-023, SSYS-024]
unblocks: []
acceptance_criteria:
  - Evidence is fresh, source-hashed, target-specific, raw-receipt-backed, and distinguishes static, concept, build, runtime, visual, performance, and accessibility stages.
  - Failed or missing rows remain failed or missing and block the corresponding claim.
  - No Settings acceptance result widens authority or closes PNC-019, Event Authority, command, handler, wiring, or backup-runtime gaps by implication.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, python3 scripts/pm-plans-verify.py run-gates, future Settings production acceptance harness]
risk_class: settings_false_acceptance_or_certification
reasoning_tier: high
context_scope: settings_acceptance
implementation_surfaces: [Plans/Settings_System.md, Plans/Automated_Testing_System.md, future Settings production tests and evidence]
node_compile_hint: {mode: settings_acceptance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/09_GUI_MOTION_THEME_SLINT_AND_TESTS.md
preserved_exact_tokens: [failures stay failures, findings, named residual risk, Slint 1.17.1, no Uninstall, PNC-019]
negative_constraints: [Do not promote static validation to runtime proof., Do not hide failed or missing evidence., Do not infer readiness or certification from PMConcept7.]
owner_hints: [Plans/Settings_System.md, Plans/Automated_Testing_System.md]
```

### SSYS-018 - Settings Commands And Strict Machine Contracts

```yaml
plan_unit_id: SSYS-018
unit_type: contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings owns the semantic payload, result, availability, and disabled-reason contracts for exactly five Settings
  commands: cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply,
  cmd.settings.transaction.rollback, and cmd.settings.export. Preview resolves an immutable exact-ID proposal and writes
  nothing. Apply accepts only the bound preview ID, generation, hash, and expected Project revision; it creates the restore
  point, validates, commits atomically, reads back, and returns one typed result. Rollback requires the transaction ID,
  rollback token, and expected current revision. Export emits a detached, secret-free, exact-ID manifest and artifact.
  Plans/settings_system_contracts.schema.json owns strict Draft 2020-12 shapes and
  Plans/settings_system_contract_fixtures.json freezes the command/UI-action/manager registries and valid/invalid cases.
  Commands_System, UI_Command_Catalog, UI_Wiring_Rules, and production Wiring Matrix must register the identical IDs,
  schemas, selector, handler, and reverse wiring before any dispatch or implementation-readiness claim.
gui_related: true
gui_classification_reason: The commands drive Settings navigation, preview, confirmation, result, rollback, and export UI states.
depends_on: [SSYS-007, SSYS-008, SSYS-009, SSYS-010]
unblocks: [SSYS-017]
acceptance_criteria:
  - Draft 2020-12 validation accepts the fixture pack and every positive case and rejects every negative case.
  - The machine command registry contains exactly the five canonical Settings command IDs and no Bloom alias.
  - Preview is non-mutating; apply and rollback are revision/hash/idempotency bound; export is detached and secret-free.
  - Missing central registration or handler remains command_not_registered or handler_unavailable and dispatches nothing.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future central command/catalog/wiring parity validator]
risk_class: settings_command_schema_or_handler_drift
reasoning_tier: high
context_scope: settings_commands_and_machine_contracts
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-command-contract-lane-2026-08-31
  - Plans/Settings_System.md#SSYS-007
  - Plans/Settings_System.md#SSYS-009
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, command_not_registered, handler_unavailable]
negative_constraints: [Do not treat semantic registration in Settings as a production handler., Do not apply an unpreviewed or stale ID set., Do not include credentials in export., Do not resurrect cmd.settings.bloom.open.]
owner_hints: [Plans/Settings_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
```

### SSYS-019 - Exact Settings Route, Return, And Route-Only UI Actions

```yaml
plan_unit_id: SSYS-019
unit_type: contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  cmd.settings.open carries one exact setting_id or manager_id/detail_id target plus the Project and complete owner-target
  context: Server, Vault, Host, Environment, Client, provider, provider route, thread, operation, topology generation, and
  expected revision, using nullable fields only when that identity is not applicable. The return contract freezes origin
  route, focus, query, scroll anchor, continuation ID/generation, expiry, close policy, and Escape order:
  close_transient, close_details, clear_query, return_to_opener. A stale generation or changed context rejects return and
  preserves the current surface. The route-only UI actions settings.onboarding.open, settings.onboarding.run_again,
  settings.guided_tour.resume, settings.guided_tour.replay, settings.doctor.open, and settings.doctor.remediation.open
  all dispatch cmd.settings.open;
  they authorize navigation only and never execute Onboarding, tour, probe, repair, or remediation work.
gui_related: true
gui_classification_reason: This unit defines visible Settings navigation, deterministic close/Escape behavior, and focus/query/scroll restoration.
depends_on: [SSYS-006, SSYS-014, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
  - Setting and manager routes are mutually exclusive and use stable IDs rather than labels or DOM selectors.
  - Exact return restores focus, query, and scroll only when continuation generation and context still match.
  - The six route-only UI actions use the frozen manager/detail targets and authorize no owner operation.
  - Visible Back/Close presentation remains host/K3-controlled while the semantic Back/Close/Escape contract is mandatory.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future navigation and stale-return fixtures]
risk_class: settings_route_or_return_context_drift
reasoning_tier: high
context_scope: settings_route_return_contract
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future Settings router]
node_compile_hint: {mode: settings_route_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-route-contract-lane-2026-08-31
  - Plans/Settings_System.md#SSYS-006
  - Plans/Settings_System.md#SSYS-014
preserved_exact_tokens: [settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.resume, settings.guided_tour.replay, settings.doctor.open, settings.doctor.remediation.open, close_transient, close_details, clear_query, return_to_opener]
negative_constraints: [Do not route by visible label., Do not restore into a changed Project or topology., Do not treat a route-only action as owner work.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```

### SSYS-020 - Canonical Manager Registry And DRY Owner Projections

```yaml
plan_unit_id: SSYS-020
unit_type: contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Plans/settings_system_contract_fixtures.json owns the canonical 38-key manager registry. Every descriptor freezes title,
  purpose, retained owner refs or named owner gap, route, aliases, owner action IDs, exact target fields, and the lazy
  hydration rule cached_bounded_summary_then_selected_details. A Settings owner projection is a bounded, freshness-labeled
  mirror of one retained owner contract and carries requested state, effective state, health, exact availability, human
  disabled reason, active-operation ref, receipts, evidence, and details route. It contains no raw logs and makes Settings
  the runtime owner of nothing. A Settings UI action projection keeps command identity, exact target, owner ref,
  requested/effective state, operation, receipt, and availability as distinct axes. Available actions have no disabled
  reason; disabled or hidden actions require one closed Settings reason code plus human text. Owner-specific details remain
  referenced owner evidence rather than a second Settings enum or reducer.
gui_related: true
gui_classification_reason: The manager registry, requested/effective state, action availability, disabled reasons, and summary/detail states are visible Settings behavior.
depends_on: [SSYS-004, SSYS-006, SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
  - The strict registry validates exactly 38 stable manager keys and rejects additions or omissions until this owner is amended.
  - The stable `storage-retention-recovery`, `server-backup-restore`, and `project-backup` descriptors remain distinct typed owner/detail compatibility targets under one visible Data Backup and Retention grouping; they do not collapse into Settings transfer or one another's owner semantics.
  - Owner projection, UI action, command result, and ObservableWork/active-operation identity remain separate typed axes.
  - One visible row or cached summary never starts owner work, a Doctor probe, or broad manager hydration.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future manager registry and owner-projection parity tests]
risk_class: settings_manager_registry_or_dry_projection_drift
reasoning_tier: high
context_scope: settings_manager_registry_and_owner_projection
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future Settings manager models]
node_compile_hint: {mode: settings_manager_registry_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-manager-contract-lane-2026-08-31
  - Plans/Settings_System.md#SSYS-015
preserved_exact_tokens: [38, cached_bounded_summary_then_selected_details, requested state, effective state, availability, disabled reason, active operation, receipts, evidence]
negative_constraints: [Do not duplicate a domain reducer or owner enum in Settings., Do not call an owner projection runtime truth after expiry., Do not merge distinct backup products.]
owner_hints: [Plans/Settings_System.md, Plans/settings_system_contract_fixtures.json]
```

### SSYS-021 - Snapshot Persistence, Export, And Migration

```yaml
plan_unit_id: SSYS-021
unit_type: contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  pm.project_settings_snapshot.v1 is the logical Settings projection for exactly one project_id and revision. Its value
  and source maps have identical setting-ID keys; appearance_projection is derived from the six canonical inventory IDs
  and is not a second write authority. Storage owns physical keys, durability, recovery, retention, and migration receipt
  persistence. No snapshot exists for no-Project context. pm.settings_export_manifest.v1 is a detached exact-ID artifact
  with source revision, exclusions, hash, byte length, receipt, and credential_material_included=false. Legacy global,
  singleton, browser-concept, or v1 export input is never authoritative and never auto-applies. Migration detects known IDs,
  lists excluded and unmapped keys, normalizes the theme pair, targets one Project/revision, creates a normal transaction
  preview, requires confirmation, and then uses the ordinary apply/read-back/rollback path. Existing Project values are
  never overwritten by startup or migration discovery alone.
gui_related: true
gui_classification_reason: Export selection/results and explicit migration preview, exclusions, confirmation, and rollback are user-visible flows.
depends_on: [SSYS-002, SSYS-007, SSYS-008, SSYS-009, SSYS-010, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
  - Snapshot value/source key sets match and every durable record carries one Project ID and revision.
  - No-Project, discovery-only, cancelled, stale, invalid, or unconfirmed migrations leave storage unchanged.
  - Export and migration exclude raw credentials and preserve destination Project identity.
  - Storage owns physical persistence while Settings owns logical values, transaction, export, and migration semantics.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future persistence/export/migration integration fixtures]
risk_class: settings_persistence_export_or_migration_leak
reasoning_tier: high
context_scope: settings_snapshot_export_migration
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/storage-plan.md, Plans/Permissions_System.md]
node_compile_hint: {mode: settings_persistence_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:settings-persistence-contract-lane-2026-08-31
  - Plans/Settings_System.md#SSYS-002
  - Plans/Settings_System.md#SSYS-007
  - Plans/Settings_System.md#SSYS-009
preserved_exact_tokens: [pm.project_settings_snapshot.v1, pm.settings_export_manifest.v1, credential_material_included=false, confirmation_required, auto_apply=false]
negative_constraints: [Do not allocate a no-Project snapshot., Do not auto-import legacy global or browser fixture state., Do not make an export a live inheritance link., Do not store credentials.]
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Permissions_System.md]
```

### SSYS-022 - Doctor Projection And Remediation Boundary

```yaml
plan_unit_id: SSYS-022
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  pm.settings_doctor_projection.v1 is a cached, generation-fenced Settings projection of one N2-151/domain-owner check.
  It carries check identity, domain owner, captured/expires times, severity, raw status enum, evidence refs, dedupe key, and
  owner remediation route/availability. probe_execution_owner is always domain_owner_only, settings_authority is always
  cached_projection_and_owner_route_only, and readiness_claim is always false. Expired data renders stale and cannot enable
  remediation. settings.doctor.remediation.open navigates to check:{check_id}; it does not run a probe or repair. A domain
  owner command may be displayed only when its owner provides a registered command and current availability selector.
gui_related: true
gui_classification_reason: Doctor findings, freshness, severity, evidence, disabled reasons, and remediation routes are visible Settings content.
depends_on: [SSYS-014, SSYS-018, SSYS-019, SSYS-020]
unblocks: [SSYS-017]
acceptance_criteria:
  - The strict Doctor fixture rejects readiness claims, Settings-owned probe execution, and Settings-owned repair.
  - Expiry or generation mismatch produces doctor_projection_stale and disables owner remediation.
  - Findings, failures, unavailable, stale, and not-run states remain distinct and are never promoted to readiness.
  - Remediation preserves the exact owner, Project/topology, check identity, continuation, and return context.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, future Doctor freshness/dedupe/no-probe fixtures]
risk_class: settings_doctor_false_readiness_or_owner_escape
reasoning_tier: high
context_scope: settings_doctor_projection_boundary
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/newtools.md]
node_compile_hint: {mode: settings_doctor_projection_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/newtools.md#N2-151
  - source_ref:chat:settings-doctor-contract-lane-2026-08-31
preserved_exact_tokens: [pm.settings_doctor_projection.v1, domain_owner_only, cached_projection_and_owner_route_only, readiness_claim=false, check:{check_id}, doctor_projection_stale]
negative_constraints: [Do not run Doctor probes from Settings., Do not execute remediation through a route-only action., Do not claim readiness from a cached projection.]
owner_hints: [Plans/Settings_System.md, Plans/newtools.md]
```

### SSYS-023 - Older-Settings Visible-State And Command-Disposition Closure

```yaml
plan_unit_id: SSYS-023
unit_type: contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The Settings owner preserves Teacher/Help, Project Search Index, and DRY Method as three explicit manager destinations
  and freshness-aware visible-state projections. Teacher/Help projects entry availability, current-surface context,
  Teacher mode, requested/effective Persona and model, source disclosure, continuation, and disabled reason while
  Assistant Chat remains the sole interaction owner. Project Search Index projects requested/effective enablement,
  freshness, generation, coverage, disk use, policy, remote-cache state, active work, and Search-owner availability while
  Settings never builds, cancels, evicts, or repairs an index. DRY Method projects requested/effective default guard,
  origin, scope, exceptions, owner evidence, consequence disclosure, and availability without weakening any instruction,
  safety, secret, source-authority, governance, permission, or source-control rule. The same machine fixture closes the
  exact 80-token older-packet command denominator: 41 reuse canonical commands, 7 are superseded by named typed local UI
  actions, 1 bloom token is retired bakeoff-only, 31 are rejected with exact reasons, and 0 become new or approved alias
  commands. A disposition is semantic reconciliation only and always carries native_handler_claim=false.
gui_related: true
gui_classification_reason: The three named manager projections and seven typed local presentation actions are visible Settings behavior; exact rejected/reused command state controls whether actions appear enabled.
depends_on: [SSYS-015, SSYS-018, SSYS-020]
unblocks: [SSYS-017]
acceptance_criteria:
  - The strict manager registry contains exactly 38 keys and the named projection registry contains exactly teacher-help, project-search-index, and dry-method.
  - The packet disposition registry accepts exactly the 80 source tokens and no omissions, additions, duplicate keys, or unclassified token.
  - Disposition counts remain 41 reuse_canonical_command, 7 superseded_by_typed_local_ui_action, 1 retired_bakeoff_only, 31 rejected_with_reason, and 0 approved_alias.
  - Every reused target names an already admitted canonical command; rejected tokens remain unavailable and are not converted into handlers by Settings.
  - Every typed local UI action validates a payload with domain_mutation_authorized=false, persistence_write_authorized=false, and owner_operation_authorized=false.
  - Missing denominator entries, a Settings runtime-owner claim, a local mutation claim, or native_handler_claim=true fails schema/fixture validation.
validation_surfaces: [Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, exact packet-token denominator and replacement-target validator, named visible-state projection positive/negative fixtures]
risk_class: settings_packet_command_or_visible_state_silent_drop
reasoning_tier: high
context_scope: older_settings_postimplementation_closure
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json]
node_compile_hint: {mode: settings_visible_state_and_command_disposition_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/CANDIDATE_COMMAND_ID_REGISTER.json
  - Concepts/settings-redesign-concepts/PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/MANAGER_COVERAGE_MATRIX.json
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/machine_readable/manager_coverage_required.json
  - source_ref:chat:older-settings-postimplementation-audit-2026-09-01
preserved_exact_tokens: [Teacher / Help, Project Search Index, DRY Method visible state, 80, 41, 7, 1, 31, 0, reuse_canonical_command, approved_alias, superseded_by_typed_local_ui_action, retired_bakeoff_only, rejected_with_reason, native_handler_claim=false]
negative_constraints: [Do not mint packet candidate commands mechanically., Do not create a second Teacher/Chat, Search index, or DRY runtime owner., Do not turn a typed local UI action into domain mutation or persistence., Do not claim a native handler, native Slint execution, production wiring, or runtime closure from a disposition fixture.]
owner_hints: [Plans/Settings_System.md]
```

### SSYS-024 - Plugins Manager Owner Projection And Fail-Closed Actions

```yaml
plan_unit_id: SSYS-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The K3 Toolchain and Extensions workspace presents Plugins as its own Code & Tools workspace over the unchanged tools-integrations key (USER-SETTINGS-MANAGER-REFRESH-20260908),
  keeps the split-manager roster/detail geometry, and
  consumes Plugins System package, manifest, component, permission, topology, conformance, supply-chain, runtime-bound,
  rollback, and bounded-evidence projections. It exposes only the exact twelve centrally registered
  cmd.agent_plugin.* owner commands from PLUG-067/CS-071/UCC-149/WM-048. Each action carries current availability,
  disabled reason, exact target and return context, typed PluginCommandResult identity, and receipt policy. Until its
  native handler and owner projection exist, every action is handler_unavailable, remains keyboard/focus reachable,
  explains the block through PMHoverTag, dispatches no mutation, changes no package generation or status, emits no
  EventRecord, and fabricates no production receipt. Generic K3 Add/Edit/Test/More handlers cannot mutate plugin state.
gui_related: true
gui_classification_reason: This unit controls the visible K3 Plugins roster/detail tabs, command controls, unavailable states, owner facts, and Doctor return route.
depends_on: [SSYS-015, SSYS-020, SSYS-022, N2-154, PLUG-067, PLUG-070, CS-071, UCC-149, WM-048]
unblocks: [SSYS-017, F3-525]
acceptance_criteria:
  - The existing code/toolchain route and K3 roster/detail geometry remain authoritative; no second plugin manager or runtime owner is created.
  - The visible command census is exactly scan, install, update, enable, disable, reload, remove, validate, review_changes, rollback, open_details, and open_logs.
  - plugin.json, pm-plugin.json, explicit migration/precedence, legacy and normalized package-tree refs, OpenAI/Codex and Claude adapters, portable/target/agent conformance, generations, required/optional components, and freshness remain separate owner facts.
  - Complete update diff, authority/reapproval, containment/isolation, signature/trust/publisher/license/SBOM/provenance/known-bad/compatibility/rollback, crash budget, bounded redacted logs, and stale promoted-routine disposition are progressively disclosed without a wall of text.
  - handler_unavailable actions preserve package generation/status and exact return context, emit no EventRecord, issue no production receipt, and cannot fall through to legacy concept mutation handlers.
  - Eight plugin Doctor checks route back to the exact Plugins tab/detail without Doctor or Settings performing scan, install, update, repair, permission, runtime, rollback, or package mutation.
validation_surfaces: [Plans/plugin_contracts.schema.json, Plans/plugin_contract_fixtures.json, Plans/plugin_package_contracts.schema.json, Plans/plugin_package_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/verify/plugin_projection_matrix.mjs]
risk_class: settings_plugin_parallel_owner_or_false_success
reasoning_tier: high
context_scope: settings_k3_plugin_owner_projection
implementation_surfaces: [Plans/Settings_System.md, Plans/Plugins_System.md, Plans/newtools.md, Plans/FinalGUISpec.md, Concepts/pm7-tools/systems_integration_source.py, future native Slint Plugins manager projection]
node_compile_hint: {mode: settings_plugins_owner_projection_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-067
  - Plans/Plugins_System.md#PLUG-069
  - Plans/Plugins_System.md#PLUG-070
  - source_ref:chat:plugin-registration-phase-reconciliation-2026-09-01
preserved_exact_tokens: [plugin.json, pm-plugin.json, cmd.agent_plugin.scan, cmd.agent_plugin.install, cmd.agent_plugin.update, cmd.agent_plugin.enable, cmd.agent_plugin.disable, cmd.agent_plugin.reload, cmd.agent_plugin.remove, cmd.agent_plugin.validate, cmd.agent_plugin.review_changes, cmd.agent_plugin.rollback, cmd.agent_plugin.open_details, cmd.agent_plugin.open_logs, handler_unavailable, PluginCommandResult, receipt_only_no_eventrecord_pending_event_authority]
negative_constraints: [Do not create a Settings-owned plugin package or runtime reducer., Do not reuse generic concept mutation handlers for plugin actions., Do not claim a native handler, EventRecord, production receipt, runtime execution, trust verification, or Slint certification from the browser projection.]
owner_boundary_notes: [Plugins System owns package/runtime truth and every mutation; Settings owns only K3 presentation, typed routing, unavailable disclosure, and exact return behavior; Doctor owns normalized cached findings and owner routes.]
owner_hints: [Plans/Settings_System.md, Plans/Plugins_System.md, Plans/newtools.md, Plans/FinalGUISpec.md]
```

### SSYS-025 - Project Settings Copy Alias Normalization

The Server command-gap packet contributes three compatibility spellings and no new Settings command family:

| Row / packet line | Source alias -> exact target / sole target handler | Exact semantic |
|---|---|---|
| 119 / `machine/command_census.json:1320` | `cmd.project.settings_copy.apply` -> `cmd.settings.transaction.apply` / `handlers::settings::transaction_apply` | Apply the current preview atomically after creating the required restore point and return verification evidence. |
| 120 / `machine/command_census.json:1326` | `cmd.project.settings_copy.preview` -> `cmd.settings.transaction.preview` / `handlers::settings::transaction_preview` | Preview the exact cross-Project Settings transaction, selected categories, exclusions, validation, and rollback plan. |
| 121 / `machine/command_census.json:1332` | `cmd.project.settings_copy.rollback` -> `cmd.settings.transaction.rollback` / `handlers::settings::transaction_rollback` | Roll back the exact copy transaction using its verified rollback token and owner readback. |

Each spelling normalizes before policy and dispatch to the existing exact target and `settings_command_contract`. The invoked source token may survive only in compatibility/source receipt identity. `independent_handler_allowed=false` and `independent_wiring_allowed=false`; policy, permission, availability, idempotency, currentness, handler dispatch, receipt, result, and any separately admitted event are evaluated exactly once against the target. These aliases do not create source-token catalog rows, Settings-private handlers, peer transactions, or second EventRecords.

The exact GUI consumers for all three alias rows are Settings > Projects > Copy Settings From and Projects duplicate/template flows.

The packet source base is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; `Plans/settings_system_contracts.schema.json` preserves all three complete `packet_source_ref` strings and exact intended semantics.

```yaml
plan_unit_id: SSYS-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Three Project Settings-copy compatibility spellings normalize before policy and dispatch to the existing exact
  Settings transaction preview, apply, and rollback commands. They reuse settings_command_contract and each target's
  sole handler; no alias receives an independent registration, handler, policy evaluation, wiring row, receipt family,
  or EventRecord.
gui_related: false
gui_classification_reason: This unit defines command-router normalization and single-dispatch authority, not visual implementation.
depends_on: [SSYS-007, SSYS-018]
unblocks: []
acceptance_criteria:
  - Exactly three aliases map to the adjudicated preview/apply/rollback targets.
  - Normalization happens before policy and dispatch and preserves the source token only as compatibility/source receipt identity.
  - The target command's typed contract, sole handler, availability, permission, idempotency, result, and receipt semantics are reused once.
  - No independent alias handler, wiring row, receipt family, EventRecord, or peer Settings transaction is admitted.
validation_surfaces: [Plans/settings_system_contracts.schema.json, focused Server owner-bundle-B validator]
risk_class: settings_alias_double_dispatch_or_policy_bypass
reasoning_tier: high
context_scope: server_command_gap_settings_aliases
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, future central pre-policy command normalizer]
node_compile_hint: {mode: settings_alias_normalization_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-119-121]
negative_constraints:
  - Do not register a source alias as a second canonical Settings command.
  - Do not evaluate policy or dispatch twice.
  - Do not infer central-router or native-handler implementation from static alias metadata.
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### 3.1 Logical project settings snapshot

`pm.project_settings_snapshot.v1` is strict and Project-bound. It includes snapshot and Project identity, schema/inventory versions, revision, value and source maps with identical exact setting-ID keys, the derived appearance projection, owner validation refs, projection generation, commit time, content hash, and optional migration receipt ref. Source is one of `default`, `explicit`, `copied`, `restored_default`, `imported`, or `migrated`. No ordinary durable snapshot exists without `project_id`; no-Project Basic Dark state has no snapshot.

The appearance projection is derived from exactly `general.visual.theme`, `general.visual.theme-mode`, `general.visual.glass-background-mode`, `general.visual.glass-transparency`, `general.interaction.show-tooltips`, and `general.visual.reduce-animations`. It is read-only convenience data, not a second write authority. `Plans/storage-plan.md` retains physical key, durability, recovery, retention, and receipt persistence.

### 3.2 Atomic mutation envelope

`cmd.settings.transaction.preview` accepts `pm.settings_transaction_preview_request.v1` and returns `pm.settings_transaction_preview.v1`. Preview binds operation kind, source/destination Project and revisions, selectors, exact sorted setting IDs, proposed values, exclusions, conflicts, before/after hashes, owner validation, restore-point plan, effects, generation, preview hash, expiry, confirmation, and current availability. Preview writes nothing.

`cmd.settings.transaction.apply` accepts `pm.settings_transaction_apply_request.v1`. It requires request/Project/idempotency/actor/permission identity plus the preview ID, generation, hash, and expected Project revision. `cmd.settings.transaction.rollback` accepts `pm.settings_transaction_rollback_request.v1` with the exact transaction, rollback token, revision, and reason. Both settle through `pm.settings_transaction_result.v1`: `applied`, `no_change`, `blocked`, `failed`, `rolled_back`, or `recovery_required`, with previous/current revisions, exact changed IDs, snapshot/receipt/rollback refs, disabled reasons, and replay status. A result contains no raw credential or duplicate raw value body.

### 3.3 Transfer preview

Transfer, Restore Defaults, import, and migration use the same transaction preview. Transfer selector categories resolve once to the exact sorted IDs and never expand during apply. Export is separate: `cmd.settings.export` accepts `pm.settings_export_request.v1` and returns `pm.settings_export_manifest.v1`, a detached exact-ID artifact manifest with source revision, exclusions, format, artifact ref, hash, size, timestamp, receipt, and `credential_material_included=false`.

`pm.settings_migration_preview.v1` permits only `legacy_global_snapshot`, `legacy_singleton_settings`, `legacy_browser_concept_fixture`, or `settings_export_v1` sources. It records source hash, destination Project/revision, detected/mappable/excluded IDs, unmapped keys, normalized theme pair, and transaction-preview ref. `confirmation_required=true`, `auto_apply=false`, and `legacy_source_authoritative=false` are invariant. Discovery, app startup, or concept state cannot overwrite an existing Project.

### 3.4 Manager route and summary

`Plans/settings_system_contract_fixtures.json` freezes exactly 38 manager keys. It splits Browser from Source Control; Server claim from Server/Host topology; Project hosting from Project movement; SSH from Remote Access; and retains Full Server Backup, Project Backup, and Storage/Retention/Recovery as distinct typed owner/detail descriptors and compatibility targets within one visible `Data Backup and Retention` grouping. Settings transfer remains separate from export/migration, Onboarding/Guided Tour remains separate from Doctor, and Teacher/Help, Project Search Index, and DRY Method remain distinct owner projections. The registry is the stable machine navigation/ownership census; adding, removing, or renaming a manager requires this owner and schema/fixture to change together.

Each descriptor freezes title, purpose, owner refs or named owner gap, disposition, route, search aliases, owner action IDs, required exact target fields, and `cached_bounded_summary_then_selected_details`. `pm.settings_owner_projection.v1` carries bounded requested/effective state, health, exact availability and reason, generation/currentness, owner contract, operation, receipts, evidence, summary, and details route. It prohibits raw logs and fixes `settings_is_runtime_owner=false`. `pm.settings_ui_action_projection.v1` keeps action, command, target, owner, availability, requested/effective state, operation, and receipt axes distinct.

`pm.settings_named_visible_state_projection.v1` closes the three historically omitted manager families without creating new runtime owners. Its exact registry keys are `teacher-help`, `project-search-index`, and `dry-method`. Each descriptor freezes the visible field names, retained owner refs, exact Settings route, negative constraints, `settings_is_runtime_owner=false`, `raw_logs_included=false`, and `owner_action_policy=owner_admitted_command_or_typed_route_only`. Cached or stale fields never become owner truth, and the field registry is presentation/data-shape canon rather than a second domain reducer.

### 3.5 Older-packet command disposition

`packet_command_dispositions` is the fail-closed reconciliation registry for all 80 tokens in the older Settings candidate command register. Its property-name enum plus `minProperties=80` and `maxProperties=80` reject every omission or addition. Each token is exactly one of `reuse_canonical_command`, `approved_alias`, `superseded_by_typed_local_ui_action`, `retired_bakeoff_only`, or `rejected_with_reason`; the current exact census is 41/0/7/1/31. Reuse records the admitted canonical target or transaction sequence. The seven local actions share `pm.settings_local_ui_action_payload.v1` and authorize no domain mutation, persistence write, or owner operation. Retired and rejected rows carry no target. Every row fixes `native_handler_claim=false`; this registry creates no central command, alias, handler, production wiring, or native execution.

### 3.6 Events and command boundary

Settings semantically registers the five command IDs in SSYS-018 and the six route-only UI action IDs in SSYS-019. Central command/catalog/wiring owners must consume those exact contracts; until they do, the action is disabled with `command_not_registered` or `handler_unavailable` and dispatches nothing. Settings registers no EventRecord family. If a retained owner requires persistence through EventRecord, its family must be independently admitted through Event Authority; absence remains `missing_event_registration`, never success.

Under DL-041, for the DRY default-guard naming decision, the approved future event identity is `settings.updated` with exact setting identity `app.agent_rules.dry_method_default_guard` and the existing `transaction_id` from `pm.settings_transaction_result.v1`; its `request_id`, `project_id`, `changed_setting_ids`, revisions and `receipt_ref` remain the current transaction join, not new event fields admitted here. The setting key does not override Settings/Storage scope or permit a fabricated application-scoped transaction. It does not match the current ordinary `setting_id` grammar and is not automatically the inventory ID `memory.assembly.dry-method-guard`; do not insert the owner key into `changed_setting_ids`, infer that alias, or claim the writer mapping is closed without explicit owner evidence. Until that key-to-valid-setting-ID and writer mapping is proven, the toggle remains disabled with the existing `owner_contract_missing` reason and dispatches no mutation command and performs no setting write. `cmd.settings.agent_rules.dry_method_default_guard.set` remains retired with no dispatch alias. Historical `settings.agent_rules.dry_method_default_guard.updated` records remain read-only source/history lineage until an explicit payload-compatible migration is separately established. This approved naming choice registers no EventRecord and supplies no missing producer, schema or checkpoint authority.

The closed Settings disabled-reason vocabulary is the schema enum. `available` requires null reason and human text; `disabled` or `hidden` requires both an exact reason code and non-empty human explanation. A retained owner may attach owner evidence and an owner-specific detail ref but Settings does not copy the owner's raw enum into a competing Settings reducer.

ContractRef: ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

## 4. Integration Surfaces

### 4.1 Shell and route integration

Settings opens from Home, Assistant Chat, command palette, natural language, owner remediation, a manager card, or a setting deep link only through `cmd.settings.open` and `pm.settings_route_request.v1`. A target is exactly one `setting_id` or one stable `manager_id` plus optional `detail_id`; visible labels, search text, and DOM selectors are never authority. The exact context always serializes Project, Server, Vault, Host, Environment, Client, provider, provider route, thread, operation, topology generation, and expected revision, using null only when a field is inapplicable.

`pm.settings_route_return.v1` binds route and continuation IDs/generations and restores focus, query, and scroll only when the origin and exact context still match. Escape runs `close_transient`, `close_details`, `clear_query`, then `return_to_opener`. Visible Back/Close/breadcrumb geometry remains host/K3-controlled; deterministic close, Escape, return, and stale-generation rejection are mandatory semantics.

### 4.2 Owner-routed manager coverage

Managers render Settings-local policy/default controls and compact owner projections. Operational lists and actions remain in their owner surfaces:

- repository changes/history/graph remain Source Control, while provider-neutral automation renders in Actions & Pipelines and GitHub-specific workflow semantics remain GitHub-owned;
- container resources/logs/exec/publish remain Docker Manager or Docker/Hosts;
- Browser tabs/capture/DevTools remain the ordinary Browser owner and protected sign-in remains isolated;
- Onboarding and Doctor full workspaces remain their owners;
- plugin package, manifest, permission, update, runtime, evidence, and rollback truth remains Plugins System-owned; the K3 Plugins tab is a bounded owner projection and exact command route only;
- active Plan, Goal, test, Debug, runtime artifact, terminal, and file operations remain their owner surfaces; and
- Server claim, Project movement, SSH mutation, and backup work dispatch only admitted owner commands.

### 4.3 Performance integration

Settings Home uses cached bounded manager summaries, then hydrates only the selected manager. Discovery/probes are bounded, coalesced, generation-fenced, cancellable, cache-aware, and governed by `RuntimeResourceGovernor`. `ObservableWork` displays real wait reasons and phases. One visible row never triggers an all-provider, all-host, all-tool, or all-manager scan.

### 4.4 Theme and shell integration

Amended 2026-10-09 (DL-180, DL-183): Home has no bottom panel any more, so the consumers of the committed theme snapshot are named as every panel and tab; the chat layout is no longer a Settings row (SSYS-010, SSYS-050); and the terminal's own look is the one appearance model whose Settings rows are SSYS-051, layered over the look's defaults rather than a second theme authority.

Project theme and layout changes update the active Project shell only after atomic acceptance. `pm.settings_appearance_preview.v1` may temporarily paint a candidate Project appearance but writes nothing and reverts on cancel, close, expiry, route change, or Project switch. Title bar, status bar, every panel and tab, Chat, and Settings consume the same committed effective Project theme snapshot; no surface keeps a second local theme authority. The terminal's scheme, font and effects follow that snapshot through "Follow theme" unless the terminal look rows of SSYS-051 choose otherwise.

The theme family/mode pair yields exactly eight built-in variants. Glass background mode is `Mesh`, `Depth`, or `Minimal`; Glass alpha is bounded to 0.35..1.0 for Dark and 0.45..1.0 for Light, and the Glass controls show only while a Glass family is active (decided 2026-09-27; they were previously kept visible but disabled with `not_applicable`), as do the Retro texture rows under a Retro family and High contrast under a Basic family. `general.interaction.show-tooltips=false` suppresses hover hints only; focus descriptions and Help/Details remain. Effective reduced motion is the logical OR of Project request and platform preference and calms nonessential movement without suppressing progress, focus, error, or state-change feedback.

Appearance application model (decided 2026-09-27, SSYS-041). Every appearance row changes what the app shows; none is stored without effect. Beyond the theme pair, Glass rows, reduced motion and NieR Mode (the three paragraphs after this one), the rows apply through the per-variant token contract of `Plans/FinalGUISpec.md#F3-426` as overrides layered over the active variant's table: `general.visual.ui-scale` scales the whole app; `general.visual.font-size`, `general.visual.line-height` and the animation-speed choice scale the variant's type sizes, line heights and motion durations (scripted motion included) and exist only while one of them differs from its default; `general.visual.interface-density` and `general.visual.padding-scale` set the spacing steps; `general.visual.border-width`, `general.visual.border-radius` and `general.visual.scrollbar-width` set the border-width, radius and scrollbar-size tokens; `general.visual.app-font` swaps the display and body fonts for the system fonts; `general.visual.high-contrast` (Basic families) and `general.visual.focus-indicator` set contrast and the keyboard focus outline; `general.visual.retro-effects`, `general.visual.pixel-grid-opacity` and `general.visual.scanline-opacity` set the Retro textures. An accent choice sets the primary accent, its RGB triple and the accent tokens derived from it from precomputed per-mode values (a brighter shade in Dark, a deeper one in Light), never by runtime colour derivation. Unchanged means the theme's own: a row whose value was never changed writes no override, so each variant keeps its own accent, corners, borders, fonts, spacing and scrollbar; the first accent choice and a "use the theme's" action on the theme-owned fine-tuning rows (border width, corner roundness, scrollbar width) mean exactly that, and those rows present the active variant's value rather than an inventory literal until a value is chosen. Reset removes exactly the override the row wrote and nothing else. Overrides follow the same atomic acceptance, preview and Project scope as the theme pair. Corner roundness, Border width and Scrollbar width store the default `theme` until a number is set, so the theme's own corners, borders and scrollbar width apply.

NieR Mode (decided 2026-09-28, user-approved inventory wave, SSYS-043; `general.visual.nier-mode`, `general.visual.nier-parts` and `general.visual.nier-background`, on App & Input under Theme & colors). NieR Mode is a switch, off by default and applying instantly, that paints the whole app in the ink-and-parchment look of NieR: Automata. It is a hidden theme painted over the Basic family, not a ninth selectable theme: the theme family/mode pair still yields exactly the eight built-in variants of SSYS-010 and `Plans/FinalGUISpec.md#F3-425`, the theme selector and the onboarding look choice list no NieR theme or family entry, and the pair's atomic acceptance, the Glass alpha floors and the family-specific controls are unchanged. Besides its row here, the switch is reached wherever a look is chosen (decided 2026-10-07, DL-152): the title-bar theme selector, the onboarding look choice and the Look menu of onboarding and of the Guided Tour each carry, below their family and Light/Dark choices, one NieR Mode checkbox with an Adjust NieR look button beside it that opens the NieR Mode editor described in the next paragraph (`Plans/FinalGUISpec.md#F3-082`, `#F3-598`). Outside the onboarding window each of these controls is an ordinary Settings change (lead ruling of 2026-10-09 recorded in DL-153): a local affordance that composes `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over the exact IDs, as category reset does, with those commands' availability and disabled reasons; the switch alone is one row, and several NieR rows changed together are one atomic group (SSYS-009). Inside the onboarding window the same checkbox is a `ui.onboarding.choose_look` preview (`Plans/Planning_Wizard.md` PWIZ-021). While the switch is on, the app renders the Basic variant that the Light, Dark or Auto choice resolves to (Auto follows the operating system, as it does for every family) with NieR's own token table for that mode painted over Basic's table. The two tables, one light and one dark, are the palette of the T3 Code theme "NieR: Automata" by SunkenInTime (`Concepts/onboarding/opus-5.5/src/settings/nier/nier-automata.json`, verbatim); they are literal precomputed constants under `Plans/FinalGUISpec.md#F3-426`, and nothing in them is derived at runtime through color-mix(). The person's chosen theme family and mode are not read, written or replaced by the switch: `theme:v1` keeps the family, presentation mode and resolved variant they chose, and turning the switch off shows exactly that variant again. The switch writes `html[data-o55-nier]`, present only while NieR Mode is on. While it is on, NieR decides the accent color and the app font: the Accent color and App font rows say so and keep their stored values, which apply again when the switch is off. The type is the game's: M PLUS 1, embedded as the free stand-in for the game's commercial Rodin face, and JetBrains Mono, both under the SIL Open Font License 1.1 and loaded from the app's own files, never from the network. High contrast still applies over NieR's tables, and the family-specific rows follow the family being painted, which is Basic while NieR Mode is on: High contrast shows, and the Glass rows and Retro texture rows do not, each keeping its stored value. Every other appearance row keeps applying as an override under SSYS-041, so NieR takes over only the two rows named. The three NieR rows take the same atomic acceptance, non-persistent preview and scope as the theme pair. Inside the onboarding window the NieR checkbox and the editor's parts and background change a preview only: it paints exactly as stored values would, writes nothing, and is written with the theme pair, through the same Settings binding, when the look is committed to the Project (`Plans/FinalGUISpec.md#F3-520`). Closing or skipping setup before then writes nothing: the NieR preview ends together with the onboarding look preview it belongs to (in the concept both stay painted until the next Settings write or Project load), and resuming setup paints it again from the onboarding session, never from the setup draft, whose closed schema has no NieR field. The onboarding look, NieR Mode included, is an explicit new choice (SSYS-036): a settings copy into the new Project never proposes the three NieR rows, as it never proposes the theme pair.

NieR Mode Parts (`general.visual.nier-parts`, a multiselect) lists 29 parts in five groups, all installed by default. Look: Square hairlines, Menu cursor, YoRHa headers, Parchment ground, Target brackets, Diamond loaders. Motion: Reboot moment, Slice open, Text decode, Page wipe, Drifting particles, Scan sweep, Alert glitch. Sound & voice: Menu sounds, Pod voice, Pod companion. Pointer: Square pointer. World: Boot sequence, Unit readouts, Block progress, Ink charts, Map ticks, Machine glyphs, Intel tooltips, Square icon strokes, Pod 042 in Chat, Quest banners, Ink empty states, Save signal. Each part is switched on or off by itself, and a part that is not installed does nothing. The row writes `html[data-o55-nier-parts]`, the installed parts as space-separated part keys, one short key per part in the order listed: `square cursor headers ground brackets diamonds`, `reboot slice decode wipe particles sweep glitch`, `sounds voice pod`, `pointer`, and `boot readouts blocks charts ticks glyphs intel icons pod042 quests empty save`; the attribute has no effect unless `html[data-o55-nier]` is present, so with NieR Mode off every part is silent: it draws, moves and plays nothing. The row shows only while NieR Mode is on, keeps its stored list while hidden and stays findable through search and Details. It is edited in a small editor titled NieR Mode, drawn like the Plug-in Chips screen of the game, with the presets Full install (all 29 parts), Quiet, Still and Colors only; a preset sets the whole list at once and each part can then be changed on its own. The same editor, which also chooses the background, opens from this row and from every Adjust NieR look button: over the application as a popup dialog with a scrim, focus containment, a close button, Escape and focus returned to the button that opened it, and inside the onboarding window as a panel of that window, never as a dialog over it (`Plans/Planning_Wizard.md`, Product-design law). It opens whether or not NieR Mode is on; while it is off, the editor says so and offers to turn it on, and the parts and background chosen are kept for when it is. That editor is a row editor, not a 39th manager: no `manager_id`, route, detail id or command id is added (section 10). Opening it, closing it (its close button, Escape or the scrim) and its Play reboot moment, which plays the reboot moment around a repaint that changes nothing, are the Settings-owned typed local presentation actions `ui.settings.nier_editor.open`, `ui.settings.nier_editor.close` and `ui.settings.nier_editor.replay`, which write nothing; each live edit in it (a preset, which is one value of `general.visual.nier-parts`, a part, the background, or its Turn on) is the same transaction pair as the checkbox. Inside the onboarding window the panel opens and closes, and its edits preview, through `ui.onboarding.choose_look`, while its Play reboot moment stays `ui.settings.nier_editor.replay` (DL-153). One editor serves every place it is reached from (`Plans/DRY_Rules.md#DR-056`). No part is added either: the NieR puppets, the NieR touches in onboarding and the Guided Tour, and the NieR sound kit follow NieR Mode and the existing parts (`Plans/FinalGUISpec.md#F3-598`, `#F3-599`).

NieR Mode Background (`general.visual.nier-background`, a select) chooses the scene drawn behind the app while NieR Mode is on, from Parchment, City Ruins, The Bunker, Desert, Forest Castle, Amusement Park, Flooded City and Follow the page, with City Ruins the default. A scene is a faint ink landscape in original line art that evokes the game's places; no game asset is used. It is drawn behind the app on the app's ground: panels stay solid and the scene shows around and between them. Parchment draws no scene, and Follow the page gives each page its own scene. A scene is painted once from files inside the app, with no network request, and never redrawn; if it drifts at all it moves by transform only. Light and dark both draw it in the NieR ink color of the active mode. The row writes `html[data-o55-nier-scene="<key>"]` with the scene's short key (`city`, `bunker`, `desert`, `forest`, `park`, `flooded`; Parchment writes no attribute, and Follow the page writes the key of the current page's scene), which has no effect unless `html[data-o55-nier]` is present, and it shows only while NieR Mode is on. All NieR movement, scripted movement included, obeys Reduce motion (`general.visual.reduce-animations`, together with the platform preference as SSYS-010 defines effective reduced motion) and scales with Animation speed (`general.visual.animation-speed`); under reduced motion the motion parts and any scene drift stop, and progress, focus, error and state-change feedback stay. The sound parts play only while `general.interaction.sound-effects` is on, so the chat header's speaker button and the onboarding and Guided Tour sound controls silence them with the chat's own sounds (SSYS-039). They play through the Notifications & Sounds owner's one player, as every chat, onboarding and Guided Tour cue does, never through a second audio context; inside the onboarding window and the Guided Tour the Menu sounds part adds no blips of its own, since their cues already speak in the NieR kit. While NieR Mode is painted, its onboarding preview included, and Menu sounds is installed, the onboarding and Guided Tour cues come from the NieR kit, original sounds made for Puppet Master in the spirit of the game's menus; no game audio is used, as no game asset is (`Plans/FinalGUISpec.md#F3-599`).

### 4.5 Exact provider action availability projection

Settings consumes the following CS-066/UCC-145 owner selectors and disabled-reason codes without becoming their owner. Central catalog parity must be revalidated; the Settings schema does not turn an unregistered peer command or stale catalog row into a handler:

| Command | Available only when | Exact disabled reasons rendered by Settings |
|---|---|---|
| `cmd.installation.install` | no ready installation and acquisition allowed | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied` |
| `cmd.installation.repair` | known installation with repair evidence | install reasons plus `target_missing`, `resource_blocked` |
| `cmd.installation.verify` | installation resolvable | `target_missing`, `host_environment_mismatch`, `operation_in_progress`, `policy_denied` |

Every request carries the shared exact Project/Home Server/Execution Host/Execution Environment/topology generation envelope plus expected revision or epoch, idempotency, actor and permission refs. Settings also carries `origin_surface`, `origin_route`, `provider_id`, `provider_route_id`, `origin_action`, and a bounded continuation/operation identity so return cannot silently rotate Project, provider, account, route, Host, or Environment. There is no `cmd.installation.uninstall` or Provider Uninstall Settings action.

For every Settings or retained-owner action, `pm.settings_ui_action_projection.v1` is the UI contract. `state=available` requires no reason; `state=disabled|hidden` requires one exact Settings/owner-admitted reason plus human text, selector ref, evaluation time, and generation. Requested state, effective state, command result, active operation/ObservableWork, and receipt/evidence remain distinct. A visible action never infers success from dispatch acceptance, fixture state, a spinner, or owner reachability.

### 4.6 Doctor and concept projection boundaries

`pm.settings_doctor_projection.v1` carries only a cached, currentness-aware N2-151/domain-owner finding: check ID, domain owner, generation, capture/expiry, severity, raw status, evidence refs, dedupe key, and current owner remediation route/availability. Its invariants are `probe_execution_owner=domain_owner_only`, `settings_authority=cached_projection_and_owner_route_only`, and `readiness_claim=false`. Expired or generation-mismatched findings render `doctor_projection_stale`; they cannot enable remediation. `settings.doctor.remediation.open` navigates to `check:{check_id}` and never runs the probe or repair.

`pm.settings_concept_boundary.v1` fixes PMConcept7 at `concept_fixture_only`: authored source is `settings_tome_source.py`, the builder is `build_pm7.py`, generated HTML direct edits are forbidden, handlers are simulated, persistence is fixture-local/non-authoritative, and `native_runtime_executed=false`. It permits geometry/content/interaction demonstration only and explicitly prohibits production runtime, persistence, handler-wiring, visual, performance, accessibility, or certification claims.

ContractRef: ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/Crosswalk.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

## 5. Validation And Acceptance

Minimum production coverage includes:

- Draft 2020-12 meta-schema validation, fixture-pack validation, every positive record, every negative rejection, exact five-command/five-route-action registries, exact 38-manager census, three named visible-state projections, and exact 80-token command-disposition census;
- inventory/schema census: 828 unique IDs, 12 categories, no demo `value`, `status`, or `src` fields;
- exact wide and responsive host geometry at and around 1180, 960, 720, and 320 pixels;
- project isolation, untouched first-open/fresh-Project Basic Dark factory seeding, saved/copy snapshot precedence, no-Project ephemeral Basic Dark, and write rejection with unchanged storage;
- fuzzy search, facet combinations, keyboard/pointer parity, match highlighting, and stable variable-height anchors;
- all row renderers, long/localized text, help/details, owner-derived status, unavailable and managed states;
- atomic single changes, theme-pair CAS, Restore Defaults, appearance preview/revert, tooltip-off accessibility, reduced-motion feedback, cancellation, stale revision, read-back failure, and rollback;
- transfer exact-ID selection, redacted preview/diff/provenance, credentials excluded, stale preview refusal, atomic apply, rollback, detached export, and explicit non-auto legacy migration;
- provider Install/Repair/Verify selectors, exact target, continuation, idempotent replay, and proof that Uninstall is absent;
- full 38-manager registry census, lazy hydration, Teacher/Help, Project Search Index, and DRY owner-projection coverage, requested/effective/action/operation separation, and missing-owner disabled states;
- the exact twelve Plugins System command consumers, fail-closed handler_unavailable behavior, complete owner-fact projection, eight plugin Doctor routes, bounded redaction, and proof that no generic K3 plugin mutation path survives;
- protected AuthBrowserSession exclusion, Browser/SCM routes, Docker Manager/Hosts redirects, exact Onboarding/Guided Tour actions, Doctor currentness/dedupe/no-readiness projection, and route-only remediation behavior;
- Server/Client/Project/SSH/full-backup exact-target routes and truthful unavailable-integration handling;
- eight themes, Project switching, reduced motion, accessibility, focus, screen-reader semantics, and no clipped text; and
- fresh Slint 1.17.1 build, runtime, visual, performance, and accessibility evidence before any matching claim.

The standard Plans gates may detect document and governance drift. They do not certify product behavior.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Plan_Document_System.md

## 6. Plan-To-Node Readiness

All SSYS PlanUnits are Plans-only. They expose future implementation surfaces and acceptance requirements but create no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime implementation, product launch, or certification.

Node compilation remains blocked for any affected unit while its retained owner route, command/handler/wiring, schema, currentness, Event Authority, inventory normalization, backup runtime evidence, or PNC-019 lifecycle evidence is incomplete. Concept fixture coverage does not lift those blockers.

## 7. Deferred, Retired, Compatibility, And Non-Goals

Deferred:

- normalize `Plans/settings_inventory.json` and its schema so historical global/account/provider/run scope vocabulary cannot be misread as non-Project persistence authority;
- register the five accepted Settings commands and six route-only UI actions without token drift in Commands, Catalog, UI Wiring, production Wiring Matrix, handlers, selectors, reverse wiring, and fixtures;
- admit required EventRecord families individually, if their owners require persisted events;
- integrate the `Plans/Backup_Restore_System.md` command families through central registration, sole handlers, production wiring, storage/event admission, and runtime backup/restore drills; and
- implement and independently verify the Rust Settings system on the Slint desktop and the Leptos web client (DL-139).

Retired or compatibility-only:

- F3-432 shelves, category-chip bloom, and no-visible-tab shell are superseded as the visible Settings architecture;
- the 19-tab and 24-tab/two-level-sidebar predecessors remain migration/search lineage only;
- app-global persisted ordinary settings and continuous Project inheritance are retired;
- K3 demo data, localStorage, simulated success, embedded 819-row snapshots, and manager-private handlers are concept lineage only;
- `Provider Uninstall`, PM Playwright Settings/runtime/facade vocabulary, and Settings-embedded operational Docker/Browser/SCM/Doctor surfaces are rejected; and
- visible Back/Close/breadcrumb controls are optional host presentation, not required Settings geometry.

Non-goals:

- no storage engine, package manager, provider resolver, credential store, Server engine, Project Sync engine, SSH engine, backup engine, Browser runtime, SCM runtime, container runtime, Onboarding state machine, Doctor probe engine, or command namespace is implemented here;
- no settings inventory edit, generated shard/evidence update, Spec Lock update, PlanUnit index generation, governance seal, WorkNode, or runtime build is authorized by this owner-doc compile; and
- no concept, static check, schema check, or Plans gate result is implementation readiness or certification.

## 8. Source Lineage And Governance

Precedence for this owner is:

1. the explicit 2026-08-31 Settings owner decisions compiled into SSYS-001 through SSYS-022 and the strict Settings machine contracts;
2. current canonical owner docs for domain runtime and security behavior;
3. later Settings handoffs: Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread Performance, Onboarding/Doctor Correction, and the cumulative Settings Bakeoff packet;
4. K3 Tome Tabs for exact selected shell geometry only; and
5. older FinalGUISpec Settings units and PMConcept sources as incorporated source lineage.

Primary source paths:

- `Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html`
- `Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-kimi/kimi.css`
- `Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/**`
- `Concepts/pm7-tools/settings_tome_source.py`
- `Concepts/pm7-tools/build_pm7.py`
- `Concepts/PMConcept7.html`
- `Plans/settings_system_contracts.schema.json`
- `Plans/settings_system_contract_fixtures.json`
- the retained canonical owner docs listed in section 1.2.

This compile intentionally does not refresh `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/.plan_index/**`, `Plans/plan_graph.json`, or `Plans/auto_decisions.jsonl`. Those are separate explicit governance phases after canonical docs and allowed indexes stabilize.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## Forge/Backup/tsnet Settings consumer addendum - 2026-09-01

The K3 Tome Tabs shell geometry and the exact 38-manager registry remain authoritative. This addendum changes dynamic
owner content, grouping, and routes only. It does not revive a Settings bakeoff, change the 828-ID ordinary-setting
inventory, create a manager, or promote PMConcept7 fixtures into a native/runtime claim.

### SSYS-026 - Provider, backup, and connector owner projections

```yaml
plan_unit_id: SSYS-026
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings retains exactly 38 manager descriptors while presenting one visible Data Backup and Retention grouping over
  three stable typed child/detail descriptors; extending the existing Source Control manager for separate Forgejo,
  Gitea, repository-hosting, and automation-binding identity; and projecting Remote Access through one normal human
  Tailscale card plus Advanced Connection engine detail. Every action routes to its semantic owner with exact scope,
  target, generation, continuation, availability, disabled reason, and return focus. Settings owns no forge adapter,
  Backup engine, scheduler, key service, connector process, auth broker, Doctor probe, handler, or EventRecord family.
gui_related: true
gui_classification_reason: This unit defines visible K3 manager grouping, cards, actions, disabled states, exact routing, and protected handoff presentation.
depends_on: [SSYS-012, SSYS-014, SSYS-015, SSYS-017, SSYS-020, SSYS-022, FGI-012, BRS-012, BRS-013, BRS-014, BRS-015, BRS-016, RAS-015, N2-156]
unblocks: []
acceptance_criteria:
  - The registry remains exactly 38 keys. `storage-retention-recovery`, `server-backup-restore`, and `project-backup` retain stable identity as typed child/detail descriptors and compatibility routes under one visible `Data Backup and Retention` grouping; storage/internal recovery and the two Backup products remain owner-distinct.
  - The visible Backup scope selector is exactly `server|project:{id}` and every route preserves exact Server, Project, destination, repository, immutable snapshot/capture set, RecoverySet public record, policy/preview, generation, continuation, and focus when applicable.
  - The normal Backup overview shows Automatic Backups, Protected data, destination cards, Encryption enabled, Last complete remote backup receipt time, independent verification/drill state, Recovery Kit status, and `[Back Up Now] [Restore…] [Add Destination]`; it never exposes engine binaries, object keys, raw OAuth configuration, or secret bytes.
  - Destination, History and Browse, Schedule/Retention/Holds, Recovery and Keys, and Advanced/Diagnostics details route owner-admitted operations only. Discovery and destination test are bounded/non-destructive; retention preview is read-only; prune requires current preview/hash/lease/human confirmation and is never a Doctor action.
  - Recovery Key save/export/copy/print/test/acknowledge/rotate/reencrypt and unlock controls are human-only protected actions. They stay unavailable to agents, natural-language/API automation, Doctor, capture, ordinary clipboard history, and any Client lacking current step-up and no-store delivery proof.
  - Archive retrieval separates capability, wait, fee/cost notice, consent, progress, and indeterminate outcome; no current price or automatic billable effect is invented.
  - Source Control settings preserve one manager and route to `source_control` or canonical `repository_automation` (`Actions & Pipelines`). Repository hosting and `automation_binding_id` are independent; Forgejo and Gitea remain distinct provider/instance identities with exact custom endpoint/trust/account fields and no ordinary credential value stored in Settings.
  - API unavailable does not paint Git transport unavailable. Actions capability separately represents unsupported, disabled, no runner, no workflow, insufficient permission, stale, and unknown; provider-specific headings remain GitHub Actions, GitLab Pipelines, Forgejo Actions, or Gitea Actions only when the selected binding proves that service.
  - Remote Access normal copy is exactly `Tailscale` / `Built into Puppet Master`, with `Not connected` plus `[Set Up]` or truthful connected state. Hosted Tailscale and self-hosted Headscale remain distinct; Headscale never shows Funnel availability, private access has no normal Serve toggle, and ordinary browser limitations are disclosed.
  - Advanced `Connection engine` may project connector/tsnet build and protocol, redacted control kind/origin, node/DNS and endpoint IDs, process/IPC/state/listener/binding health, last auth/test, bounded logs, and owner repair/reset routes; it never exposes keys, raw connector state, reusable auth URLs, cookies, IPC secrets, or a backend selector.
  - Every packet command family consumed here remains event-silent with expected_event_types=[] and handler_unavailable until its owner schema, central registration, sole handler, permission, receipt/ObservableWork, persistence, and production/reverse wiring are proved.
  - All K3 geometry, eight PM7 themes, focus, keyboard/touch, virtualization, localization, Reduced Motion, exact-return, and truthful unavailable-state acceptance remains required; static text, schemas, fixtures, or concept rendering prove none of the native/runtime lanes.
validation_surfaces:
  - Plans/settings_system_contracts.schema.json
  - Plans/settings_system_contract_fixtures.json
  - Plans/forge_integration_contracts.schema.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/remote_access_system_contracts.schema.json
  - future 38-key/grouping/compatibility-route and exact-scope fixtures
  - future protected-key/no-capture and provider-capability transition fixtures
  - future K3 eight-theme/width/keyboard/Reduced-Motion/native Slint tests
risk_class: settings_parallel_runtime_or_manager_topology_drift
reasoning_tier: high
context_scope: settings_forge_backup_tsnet_consumers
implementation_surfaces: [Plans/Settings_System.md, future typed Settings owner projections]
node_compile_hint: {mode: settings_cross_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#settings-owner
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#4
  - packet:03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md#FORGE-004
  - packet:04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md#GUI-005
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-001
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-002
  - packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
preserved_exact_tokens: [38, K3 Tome Tabs, Data Backup and Retention, server, "project:{id}", Actions & Pipelines, repository_automation, Forgejo, Gitea, Tailscale, Built into Puppet Master, Connection engine, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not add, remove, rename, or collapse a manager key or add an ordinary settings-inventory row for dynamic owner state.
  - Do not duplicate forge, automation, Backup, scheduler, encryption/key, connector, authentication, or Doctor logic in Settings.
  - Do not call Forgejo a Gitea alias, infer automation from a Git remote named Origin, or infer API readiness from Git transport.
  - Do not expose Recovery Key/Kit bytes, connector secrets, provider credentials, private CA bytes, browser content, or unredacted protected-auth state.
  - Do not add a Backup, forge-specific, Tailscale, Server, or Sync Activity Bar item.
  - Do not revive a bakeoff process or alter selected K3 geometry and PM7 theme authority.
  - Do not claim handler, runtime, native Slint, security, provider, visual, performance, accessibility, or readiness completion from this Plans-only update.
owner_boundary_notes:
  - Settings owns shell/navigation, ordinary Project-bound setting semantics, and bounded owner projections only.
  - Forge_Integrations owns provider/instance and AutomationBinding semantics; Backup_Restore_System owns backup/recovery; Remote_Access_System owns connector/routes; newtools owns Doctor routing.
owner_hints: [Plans/Settings_System.md, Plans/Forge_Integrations.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/newtools.md, Plans/FinalGUISpec.md]
```

## Puppet Master Assistant Redesign Settings Registration - 2026-09-03

The approved Assistant redesign adds fifty settings. This section records their canonical inventory identities, the manager each belongs to, and the packet spelling each reconciles, and it fixes the boundary between what Settings stores and what the domain owners store.

### 1. Two new managers

Settings gains a **Multi-Agent Workflows** manager with `Crew`, `BrainStorm`, `Review`, and `Chat Room` tabs, and a separate **Back Seat Driver** manager. Back Seat Driver is deliberately *not* inside the Multi-Agent Workflows manager: it is a passive read-only advisor, not a collaborative workflow, and presenting it as one would imply it participates in a run. Each Multi-Agent tab edits only that kind's defaults; the run itself and its frozen effective roster belong to `Plans/Collaborative_Workflows.md`.

Scheduling and quota defaults are surfaced under approvals and usage rather than as a third manager, because they are consumed by several owners rather than configuring one subsystem.

### 2. Ownership split

Settings stores ordinary project-bound preferences and renders managers. Domain owners store operational records. Concretely:

| Settings stores | Domain owner stores |
|---|---|
| default BrainStorm participant roles, core count, and Grill extension | the actual BrainStorm run and its frozen effective roster (`Plans/Collaborative_Workflows.md`) |
| default reviewer count, blind-pass, and corroboration flags | the actual Review run, target pack, and findings (`Plans/Collaborative_Workflows.md`) |
| Crew defaults, Auto criteria, and Auto ceilings | the committed Crew configuration and the run (`Plans/Collaborative_Workflows.md`) |
| BSD mode, model, Persona, sensitivity, cooldown, and thresholds | BSD workflow bindings, assignments, review cycles, and findings (`Plans/Back_Seat_Driver.md`) |
| wind-down, missed policy, grace, DST policy, auto-resume default | the actual schedules, windows, consents, and dispatch records (`Plans/Scheduling_and_Quota_Resume.md`) |
| thread-title policy | title generation attempts and results (`Plans/Models_System.md`, `Plans/assistant-chat-design.md`) |
| Plan and Deep Plan default depth and export format | the Plan documents, revisions, and PlanRuns (`Plans/Assistant_Plan_Runtime.md`) |
| browser capture defaults | capture records and component contexts (`Plans/Section15_MVP_Promoted_Features_Spec.md`) |

A default is read at the moment a modal opens or a record is created and is copied into that record. Changing a default afterwards never retroactively alters a committed configuration, a running workflow, an existing schedule, or an existing consent.

### 3. Registered settings and packet reconciliation

The packet proposed fifty setting IDs in an `assistant.*` / `browser.*` namespace with status `proposed_census_required`. A census over `Plans/settings_inventory.json` found no collision for any of them and confirmed that this inventory derives a setting's category and subgroup from its ID prefix. The packet spellings are therefore reconciled to canonical inventory IDs under the existing twelve categories, and each packet spelling is retained as a search alias on its canonical entry so an operator or a document that cites the packet ID still resolves. The packet spelling receives no second inventory row, no peer control, and no independent persistence identity.

One reuse was found and is recorded rather than duplicated: `general.interaction.chat-eli5` is the existing per-conversation ELI5 override. The packet's `assistant.chat.eli5_default` maps to the existing `general.interaction.eli5-default`, now applicable at both app-default and project-default levels (DL-138, question 25). The effective choice is the explicit chat override, otherwise the project's explicit default, otherwise the app default. Choosing inherit removes that chat's override; changing a default never changes an explicit chat choice or generated documents. Project defaults use the ordinary Settings transaction and project snapshot. The app default falls back to the bundled `default: false` on `general.interaction.eli5-default` in `Plans/settings_inventory.json`. F3-581 retains an editable All chats requirement, but its app-wide commit and persistence route conflicts with the Project-only ordinary Settings boundary in SSYS-002. That owner decision remains open as `pldg-20260927-001-wand-collab-workflows` q-035. No app-wide writer or global ordinary Settings value is admitted by the inventory scope; the All chats edit stays disabled with the Settings owner's reason until the conflict is resolved. This preserves the requirement as pending rather than deciding it is permanently read-only.

The pre-existing `branching.crew.crew-enabled` toggle is preserved as the master Crew enable. The retired model in which Crew was *only* that switch is superseded by the configuration settings below; a Crew run now requires a committed configuration regardless of the toggle.

DL-138, question 14, sets the factory `branching.crew.crew-auto-enabled` value to `true` for a new project; an existing explicit `false` stays false. The canonical ID retains `assistant.multi_agent.crew.auto_enabled` only as an alias. The per-chat Crew Auto check writes `crew_auto_override` (`true`, `false`, or `null`) in that thread's existing metadata through `cmd.chat.crew_auto.set` with `scope=thread`; absent or null inherits the project value. This is a Collaboration-owned thread preference, not a second ordinary Settings value or inventory ID. Commit precedes the visible check change, and a failed commit preserves the prior override. Thread-scoped applicability in the inventory is descriptive `run` metadata, not permission to persist ordinary Settings outside the project. The factory Crew Auto configuration is committed as version 1 when the project is created (CWR-021); the first automatic run does not require a confirmation sheet. Later configuration edits still require a successful explicit commit.

| Canonical setting ID | Label | Type | Default | Manager | Packet spelling reconciled |
|---|---|---|---|---|---|
| `general.interaction.working-activity-style` | Working Animation | `select` | `Orbit` | `assistant-chat` | `assistant.chat.working_activity_style` |
| `ai.models.thread-title-model` | Chat Title Model | `select` | `Default` | `assistant-chat` | `assistant.chat.thread_title_model` |
| `general.interaction.eli5-default` | Explain Terms Everywhere | `toggle` | `false` | `assistant-chat` | `assistant.chat.eli5_default` |
| `planning.interview.plan-default-depth` | Plan Depth | `select` | `Standard` | `assistant-chat` | `assistant.chat.plan.default_strategy` |
| `planning.interview.deep-plan-default-depth` | Deep Plan Depth | `select` | `Thorough` | `assistant-chat` | `assistant.chat.deep_plan.default_strategy` |
| `planning.interview.deep-plan-grill-me` | Grill Me By Default | `toggle` | `false` | `assistant-chat` | `assistant.chat.deep_plan.grill_me_default` |
| `planning.interview.plan-default-export` | Plan Export Format | `select` | `Markdown` | `assistant-chat` | `assistant.chat.plan.default_export` |
| `general.interaction.composer-persist-unsent` | Keep Unsent Messages | `toggle` | `true` | `assistant-chat` | `assistant.chat.composer.persist_unsent` |
| `branching.crew.crew-participant-count` | Crew Size | `number` | `3` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.participant_count` |
| `branching.crew.crew-coordinator` | Crew Coordinator | `select` | `Parent assistant` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.coordinator` |
| `branching.crew.crew-assignment-strategy` | Crew Assignment | `select` | `Manager directed` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.assignment_strategy` |
| `branching.crew.crew-parallelism` | Crew Parallelism | `number` | `3` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.parallelism` |
| `branching.crew.crew-auto-enabled` | Crew Auto | `toggle` | `true` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.auto_enabled` |
| `branching.crew.crew-auto-complexity` | Crew Auto Threshold | `select` | `High` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.auto_complexity` |
| `branching.crew.crew-auto-max-members` | Crew Auto Size Limit | `number` | `4` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.auto_max_members` |
| `branching.crew.brainstorm-core-participants` | BrainStorm Participants | `number` | `4` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.core_participants` |
| `branching.crew.brainstorm-question-limit` | BrainStorm Question Limit | `number` | `20` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.question_limit` |
| `branching.crew.grill-me-question-extension` | Grill Me Extra Questions | `number` | `25` | `multi-agent-workflows` | `assistant.multi_agent.grill_me.question_extension` |
| `branching.plan.quick-question-limit` | Quick Plan Question Limit | `number` | `3` | `assistant-redesign` | `assistant.chat.plan.quick.question_limit` |
| `branching.plan.standard-question-limit` | Standard Plan Question Limit | `number` | `6` | `assistant-redesign` | `assistant.chat.plan.standard.question_limit` |
| `branching.plan.thorough-question-limit` | Thorough Plan Question Limit | `number` | `8` | `assistant-redesign` | `assistant.chat.plan.thorough.question_limit` |
| `branching.deep-plan.thorough-question-limit` | Deep Plan Thorough Question Limit | `number` | `10` | `assistant-redesign` | `assistant.chat.deep_plan.thorough.question_limit` |
| `branching.deep-plan.exhaustive-question-limit` | Deep Plan Exhaustive Question Limit | `number` | `15` | `assistant-redesign` | `assistant.chat.deep_plan.exhaustive.question_limit` |
| `branching.crew.brainstorm-external-research` | BrainStorm Research Depth | `select` | `Maximum` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.external_research` |
| `branching.crew.brainstorm-independent-proposals` | Independent Proposals First | `toggle` | `true` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.independent_proposals` |
| `branching.crew.brainstorm-debate-rounds` | BrainStorm Debate Rounds | `number` | `2` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.debate_rounds` |
| `branching.crew.brainstorm-voting` | BrainStorm Voting | `select` | `Evidence weighted` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.voting` |
| `branching.crew.brainstorm-preserve-dissent` | Keep Dissent | `toggle` | `true` | `multi-agent-workflows.brainstorm` | `assistant.multi_agent.brainstorm.preserve_dissent` |
| `planning.verification.review-strategy` | Review Strategy | `select` | `Multi-pass` | `multi-agent-workflows.review` | `assistant.multi_agent.review.strategy` |
| `planning.verification.review-reviewer-count` | Reviewers | `number` | `3` | `multi-agent-workflows.review` | `assistant.multi_agent.review.reviewer_count` |
| `planning.verification.review-blind-initial-pass` | Blind First Pass | `toggle` | `true` | `multi-agent-workflows.review` | `assistant.multi_agent.review.blind_initial_pass` |
| `planning.verification.review-peer-corroboration` | Compare Findings | `toggle` | `true` | `multi-agent-workflows.review` | `assistant.multi_agent.review.peer_corroboration` |
| `planning.verification.review-preserve-dissent` | Keep Review Dissent | `toggle` | `true` | `multi-agent-workflows.review` | `assistant.multi_agent.review.preserve_dissent` |
| `planning.verification.review-auto-repair` | Review Fixes Things | `toggle` | `false` | `multi-agent-workflows.review` | `assistant.multi_agent.review.auto_repair` |
| `branching.crew.chat-room-participant-count` | Chat Room Size | `number` | `4` | `multi-agent-workflows.chat-room` | `assistant.multi_agent.chat_room.participant_count` |
| `branching.crew.chat-room-turn-policy` | Chat Room Turns | `select` | `Moderated` | `multi-agent-workflows.chat-room` | `assistant.multi_agent.chat_room.turn_policy` |
| `branching.crew.chat-room-max-rounds` | Chat Room Rounds | `number` | `5` | `multi-agent-workflows.chat-room` | `assistant.multi_agent.chat_room.max_rounds` |
| `safety.approvals.bsd-mode` | Back Seat Driver | `select` | `Auto` | `back-seat-driver` | `assistant.bsd.mode` |
| `safety.approvals.bsd-model` | Adviser Model | `select` | `Default` | `back-seat-driver` | `assistant.bsd.model` |
| `safety.approvals.bsd-persona` | Adviser Persona | `select` | `Critical Advisor` | `back-seat-driver` | `assistant.bsd.persona` |
| `safety.approvals.bsd-trigger-sensitivity` | Adviser Sensitivity | `select` | `Balanced` | `back-seat-driver` | `assistant.bsd.trigger_sensitivity` |
| `safety.approvals.bsd-catch-up-seconds` | Adviser Catch-Up | `select` | `30 seconds` | `back-seat-driver` | `assistant.bsd.catch_up_seconds` |
| `safety.approvals.bsd-cooldown-turns` | Adviser Cooldown | `number` | `3` | `back-seat-driver` | `assistant.bsd.cooldown_turns` |
| `safety.approvals.bsd-retain-transcript` | Keep Adviser Transcript | `toggle` | `true` | `back-seat-driver` | `assistant.bsd.retain_transcript` |
| `safety.approvals.bsd-self-compact-threshold` | Adviser Compaction Point | `number` | `0.8` | `back-seat-driver` | `assistant.bsd.self_compact_threshold` |
| `safety.approvals.schedule-wind-down-minutes` | Wind-Down Time | `number` | `10` | `scheduling-and-usage-resume` | `assistant.scheduling.wind_down_minutes` |
| `safety.approvals.schedule-missed-policy` | If A Schedule Is Missed | `select` | `Hold` | `scheduling-and-usage-resume` | `assistant.scheduling.missed_dispatch_policy` |
| `safety.approvals.schedule-grace-minutes` | Schedule Grace Period | `number` | `30` | `scheduling-and-usage-resume` | `assistant.scheduling.default_grace_minutes` |
| `safety.approvals.schedule-resume-next-window` | Resume Next Window | `toggle` | `true` | `scheduling-and-usage-resume` | `assistant.scheduling.resume_next_window` |
| `ai.usage.auto-resume-default` | Resume When Usage Resets | `toggle` | `false` | `scheduling-and-usage-resume` | `assistant.usage.auto_resume_default` |
| `safety.approvals.schedule-dst-policy` | Daylight Saving Behavior | `select` | `Preserve local wall clock` | `scheduling-and-usage-resume` | `assistant.scheduling.dst_policy` |
| `planning.testing.browser-capture-full-default` | Screenshot Scope | `select` | `Visible viewport` | `browser` | `browser.chat_capture.full_default` |
| `planning.testing.browser-component-action` | After Picking A Component | `select` | `Last used, starting with Send now` | `browser` | `browser.chat_capture.component_action` |
| `planning.testing.browser-component-crop` | Include Component Image | `toggle` | `true` | `browser` | `browser.chat_capture.include_component_crop` |
| `planning.testing.browser-devtools-policy` | Agent DevTools Access | `select` | `On with permission` | `browser` | `browser.agent.devtools_policy` |

All fifty entries are static inventory registrations. They do not assert that a Settings pane renders them, that a native writer persists them, or that any consuming owner reads them yet.

### SSYS-027 - Assistant Redesign Settings Managers And Ownership Split

```yaml
plan_unit_id: SSYS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings gains a Multi-Agent Workflows manager with Crew, BrainStorm, Review, and Chat Room tabs and a separate Back Seat Driver manager; Back Seat Driver is deliberately not inside the Multi-Agent manager because it is a passive read-only advisor rather than a collaborative workflow. Settings stores ordinary project-bound preferences and renders managers while domain owners store operational records: Settings holds default participant roles, counts, Grill extension, reviewer count and flags, Crew defaults and Auto ceilings, BSD policy defaults, scheduling wind-down/missed/grace/DST/auto-resume defaults, title policy, Plan depth and export defaults, and browser capture defaults, while Collaborative Workflows, Back Seat Driver, Scheduling and Quota Resume, Models System, Assistant Plan Runtime, and the browser owner hold the runs, rosters, bindings, findings, schedules, consents, generation results, documents, and capture records. A default is read when a modal opens or a record is created and copied into that record; a later default change never retroactively alters a committed configuration, a running workflow, an existing schedule, or an existing consent.
gui_related: true
gui_classification_reason: This unit defines two new Settings managers and their tab structure.
depends_on: [SSYS-026]
unblocks: [SSYS-028]
acceptance_criteria:
  - The Multi-Agent Workflows manager exposes exactly Crew, BrainStorm, Review, and Chat Room tabs.
  - Back Seat Driver has its own manager outside the Multi-Agent Workflows manager.
  - No manager stores an operational record that a domain owner owns.
  - Changing a default does not alter a committed configuration or a running workflow.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: shadow_settings_ownership_or_retroactive_default
reasoning_tier: high
context_scope: assistant_redesign_settings_managers
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: settings_manager_registration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SET-001
  - pm-assistant-implementation-2026-09-02-recovered:07_DRY_OWNERSHIP_MAP.md#8
  - pm-assistant-implementation-2026-09-02-recovered:08_SETTINGS_AND_DEFAULTS.md
preserved_exact_tokens:
  - "Multi-Agent Workflows"
  - "Back Seat Driver"
negative_constraints:
  - Do not place Back Seat Driver inside the Multi-Agent Workflows manager.
  - Do not store an operational record in Settings.
  - Do not let a default change mutate an existing record.
owner_hints:
  - Plans/Settings_System.md
```

### SSYS-028 - Assistant Redesign Setting Registration And Packet Spelling Reconciliation

```yaml
plan_unit_id: SSYS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Fifty new settings are registered in Plans/settings_inventory.json under the existing twelve categories, because this inventory derives a setting's category and subgroup from its ID prefix. The packet's assistant.* and browser.* spellings are reconciled to those canonical IDs and retained as search aliases on the canonical entry; a packet spelling receives no second inventory row, no peer control, and no independent persistence identity. The original proposed_census_required packet status is retained as source lineage. A census found one genuine reuse: general.interaction.chat-eli5 is the per-conversation ELI5 override; general.interaction.eli5-default provides the app-default and project-default levels under DL-138. Resolve an explicit chat override first, then the project's explicit default, then the app default; inherit clears only the chat override and defaults never change generated documents. Project defaults use the ordinary Settings transaction and snapshot, and the app fallback is the bundled default false in Plans/settings_inventory.json. F3-581's editable All chats requirement remains pending: its app-wide commit and persistence route conflicts with SSYS-002 and is tracked as pldg-20260927-001-wand-collab-workflows q-035. Inventory scope admits no app-wide writer or global ordinary Settings value. Until the owner resolves that question, the All chats edit is disabled with the Settings owner's reason; its editable requirement is retained, not replaced by a permanent read-only decision. The pre-existing branching.crew.crew-enabled toggle is preserved as the master Crew enable, and the retired model in which Crew was only that switch is superseded because a Crew run now requires a committed configuration regardless of the toggle.
  DL-138 sets branching.crew.crew-auto-enabled to factory true for a new project while preserving an existing explicit false. The per-chat override is crew_auto_override (true, false or null) on existing thread metadata, absent or null inheriting the project value. cmd.chat.crew_auto.set with scope=thread commits it before the check changes and preserves the prior value on failure. It is a Collaboration-owned preference, not another ordinary Settings value or inventory ID; inventory run applicability is descriptive metadata. The factory Crew Auto configuration is committed as version 1 when the project is created (CWR-021); later user edits require an explicit successful commit.
gui_related: true
gui_classification_reason: Each registered setting is a rendered control in a Settings pane with a category, subgroup, and tier.
depends_on: [SSYS-027]
unblocks: []
acceptance_criteria:
  - All fifty settings exist once each with a valid category, subgroup, type, default, scope, and tier.
  - Every packet spelling resolves to exactly one canonical entry through its search aliases.
  - No packet spelling receives its own row or persistence identity.
  - The existing chat-eli5 override and crew-enabled toggle are preserved rather than duplicated.
  - ELI5 resolves explicit chat, project, then app default without changing generated documents.
  - The ELI5 app fallback uses the bundled inventory default false; the All chats edit stays disabled while ledger001 q-035 is open, and no app-wide write is admitted from scope metadata alone.
  - New projects start with Crew Auto on; an existing explicit off choice survives.
  - Crew Auto thread overrides survive reload in thread metadata and never mutate the project value or another chat.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: duplicate_setting_identity_or_namespace_drift
reasoning_tier: high
context_scope: assistant_redesign_settings_inventory
implementation_surfaces:
  - Plans/settings_inventory.json
  - Plans/Settings_System.md
node_compile_hint:
  mode: settings_inventory_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:machine/settings.json
  - pm-assistant-implementation-2026-09-02-recovered:SET-002
  - Plans/Decision_Log.md#DL-138
preserved_exact_tokens:
  - "general.interaction.chat-eli5"
  - "branching.crew.crew-enabled"
  - "proposed_census_required"
  - "general.interaction.eli5-default"
  - "branching.crew.crew-auto-enabled"
  - "crew_auto_override"
  - "cmd.chat.crew_auto.set"
  - "scope=thread"
  - "DL-138"
negative_constraints:
  - Do not create a second inventory row for a packet spelling.
  - Do not duplicate an existing setting that a census identified as reusable.
  - Do not claim a Settings pane renders or a native writer persists these entries.
owner_hints:
  - Plans/Settings_System.md
```

## Additive Correction v4 — Corrected Question Values And The Transaction Boundary (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`QMAX-018..019`, `MODAL-006`,
`MODAL-008`, `CDRY-003`, `CDRY-013`) to this owner.

### QMAX-018 — Seven project-scoped values, no new commands

Seven exact values are registered in `Plans/settings_inventory.json` and in the Multi-Agent
Workflows and Assistant rows above, all written through the existing generic Settings
transaction. No command is minted per number.

| Setting ID | Factory |
|---|---|
| `assistant.chat.plan.quick.question_limit` | 3 |
| `assistant.chat.plan.standard.question_limit` | 6 |
| `assistant.chat.plan.thorough.question_limit` | 8 |
| `assistant.chat.deep_plan.thorough.question_limit` | 10 |
| `assistant.chat.deep_plan.exhaustive.question_limit` | 15 |
| `assistant.multi_agent.brainstorm.question_limit` | 20 |
| `assistant.multi_agent.grill_me.question_extension` | 25 |

All seven are searchable and resettable like any other setting. The six effective totals — 28,
31, 33, 35, 40, 45 — are derived at read time and are never stored as a second value.

### QMAX-019 — Migration preserves an explicit override

Migration changes an **untouched factory** BrainStorm limit from 15 to 20 and an untouched Grill
extension from 10 to 25. A value whose source-of-value says the user set it is preserved exactly
as the user set it, including a user who deliberately chose 15 or 10. Source-of-value is what
distinguishes the two cases; a value's mere equality with the old factory number is not evidence
that it was untouched.

### MODAL-006, MODAL-008 — Defaults commit explicitly

A workflow modal never writes a default as a side effect of starting a run. Defaults change only
through an explicit `Save as Default` action routed through this owner's transaction. Crew Auto's
user-edited configuration commits only after configuration confirmation and a successful transaction; a
cancelled or failed commit preserves the prior stored state, and the menu check renders that
stored state rather than an optimistic one. The factory version-1 configuration created with a new project
is already committed and needs no first-run confirmation (DL-138, CWR-021). A thread's Crew Auto check
commits only its thread-metadata override, as SSYS-028 and CWR-038 specify.

### CDRY-013 — The Settings boundary

Settings owns the shell, the inventory, project-scoped values, transactions, defaults, and
manager routing. Domain runtimes own their records and operations, and a manager action routes to
its owner. Participant dispositions, run state, schedule state, and progress are never stored as
settings values.

## Working Notebook Settings Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Four Project-scoped notebook values are registered as static inventory registrations under the existing `memory` category, written through the generic Settings transaction (QMAX-018 pattern; no per-setting commands): `memory.notebook.auto-capture` (toggle, default true — optional automatic capture of material events), `memory.notebook.resume-capsule` (toggle, default true — include the resume capsule in reconstructed context), `memory.notebook.capsule-budget-tokens` (number, default 512 — capsule ceiling, advanced tier), and `memory.notebook.injection-budget-tokens` (number, default 1024 — capsule+entries injection ceiling, advanced tier). Budgets are ceilings further reduced by the Prompt_Pipeline allocation, never reservations. Semantics: disabling auto-capture does not grant sharing, does not clear existing notes, does not disable explicit authorized operations, and does not disable any mandatory ledger/workflow checkpoint owned elsewhere. All values are Project-scoped persisted ordinary settings: no global values, no silent inheritance, no note bodies in any settings export or transfer, and requested/effective overrides reconcile through the existing snapshot model.

```yaml
plan_unit_id: SSYS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: Working Notebook preferences are Project-scoped ordinary settings registered in the settings inventory (memory.notebook.auto-capture, memory.notebook.resume-capsule, memory.notebook.capsule-budget-tokens, memory.notebook.injection-budget-tokens) as static inventory registrations through the generic transaction. Budgets are ceilings, not reservations. Disabling auto-capture does not grant sharing, clear notes, or disable mandatory ledger/workflow checkpoints. Settings export/transfer never carries note bodies, and no global notebook settings values exist.
gui_related: true
gui_classification_reason: These are user-visible Settings values rendered through existing settings surfaces.
depends_on: [SSYS-028, WN-018]
unblocks: []
acceptance_criteria:
  - Setting IDs, types, defaults, and Project scope match the inventory schema.
  - A disable-auto-capture control never widens sharing or disables owned checkpoints.
  - Settings transfer contains no note bodies.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py json-syntax
risk_class: settings_scope_creep
reasoning_tier: standard
context_scope: settings_system
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_inventory.json, Plans/Working_Notebook.md]
node_compile_hint: {mode: settings_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A13
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A14
preserved_exact_tokens: ["memory.notebook.auto-capture", "static inventory registrations", "ceilings, not reservations"]
negative_constraints:
  - Do not add global ordinary notebook settings.
  - Do not bundle note bodies into settings export.
owner_hints: [Plans/Settings_System.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Backup_Restore_System.md

## Cumulative v3 Settings Inventory, Projections, and Manager Layout Specification (2026-09-07)

This section incorporates the cumulative Settings system inventory alignments, truthful persistence
semantics, shared projections, candidate roster/stage reconciliation, and universal manager layout
principles in accordance with APR-044, APR-046, APR-047, APR-048, APR-062, APR-064, and APR-065,
as amended by the selective reference-layout supersession under USER-REFERENCE-LAYOUT-ROLLBACK-20260908 and by the
Settings manager refresh under USER-SETTINGS-MANAGER-REFRESH-20260908 (§22, SSYS-033).

### 19. Working Activity Style and Inventory Reconciliation (APR-046, APR-048)

- **Canonical Key Identity:** The working activity presentation preference is canonically registered
  under `general.interaction.working-activity-style`. The short key `working-activity-style` is retained
  exclusively as a query and migration alias; the curated duplicate short-key row is retired.
- **Supported Selections:** The setting offers exactly `Orbit` and `Step Rail Simple` (the concept's
  Demo Studio family/variant indices are lab-only, ACD-474). The legacy value token `Step Rail` maps directly to `Step Rail Simple` as an
  input alias.
- **Concept-Candidate Roster and Stage Rows (APR-048):** The five concept-candidate inventory keys:
  1. `branching.crew.crew-auto-roster`
  2. `branching.crew.chat-room-roster`
  3. `branching.crew.brainstorm-roster`
  4. `planning.verification.review-roster`
  5. `safety.approvals.bsd-stage-bindings`
  are recognized as concept-stage proposals that project specialized roster templates and stage toggles.
  They are not canonically admitted into `Plans/settings_inventory.json` until their underlying domain
  runtimes establish persistence schemas. Existing Crew defaults continue to use
  `branching.crew.crew-members`.

### 20. Truthful Persistence State (APR-044)

- **Write Outcome Integrity:** Setting transactions must never report an optimistic "Saved" status or
  display a success timestamp when the backing storage write fails or is rejected.
- **Failure Disclosure:** If a persistence write fails (e.g., due to file system errors, lock
  contention, or lack of an open project), Settings retains the user's uncommitted edit in the local
  buffer, clearly displays the typed error message, and provides Retry and Revert actions.

### 21. Shared Settings Projections (APR-047)

- **Coherent Domain Views:** Dedicated named projections surface cohesive slices of the canonical
  inventory to specific consuming domains without creating separate storage stores:
  1. `settings.assistant`: Projects theme, interaction style, question limits, and composer defaults.
  2. `settings.bsd`: Projects BSD mode, model, persona, sensitivity, catch-up, and cooldown settings.
  3. `settings.schedule`: Projects execution windows, wind-down minutes, grace intervals, and DST rules.
- **Single Source of Truth:** All projections read and mutate the exact Project-scoped settings keys
  via the standard Settings transaction engine.

### 22. Settings Manager Layout Principles Across All 38 Managers (APR-062, APR-064, APR-065)

- **Reference-Layout Supersession and Universal Principles (APR-062, APR-064, USER-REFERENCE-LAYOUT-ROLLBACK-20260908):**
  The visual prescription derived from the reference video (`ScreenRecording_08-11-2026 19-26-05_1(1).mov`)
  enforcing flat-row, borderless-section, and forced single-column layout is selectively superseded under
  user correction USER-REFERENCE-LAYOUT-ROLLBACK-20260908. Settings surfaces restore prior native card, section
  box, and grid layouts across all thirty-eight registered managers and the 23 concrete manager workspaces measured
  at the pinned base `66cd9ca232ef6017c45ce93e0ab2dcd65a44923f95ea24b580b94f53187ddf30` after the Settings manager refresh (USER-SETTINGS-MANAGER-REFRESH-20260908; a presentation count over the unchanged
  38-key registry). Historical evidence and request records are retained intact. Active presentation across every
  Settings manager enforces:
  1. *Stable Alignment:* Left-aligned section headers and property labels, fixed-width input controls,
     and uniform vertical baselines.
  2. *Legible Short Labels:* Human-friendly descriptive names omitting internal dotted path prefixes.
  3. *Trailing Controls:* Checkboxes, toggles, dropdowns, and numeric inputs align cleanly to the right edge.
  4. *Deliberate Whitespace:* Standardized padding and section spacing between distinct setting groups.
  5. *Limited Simultaneous Detail:* Complex schemas, advanced tuning parameters, and raw JSON configurations
     reside behind progressive disclosure toggles.
  6. *One Quiet Action Row:* Per-section reset buttons and documentation links reside in an unobtrusive
     bottom action bar.
  7. *No Top Action Bar:* A manager exposes no header-level action strip; every action lives in its row,
     in a section title row, or in the single quiet bottom row.
  8. *Bounded Tabs:* A manager exposes at most six tabs.
  9. *Exactly One Advanced Disclosure:* Advanced, dangerous, rarely used, and diagnostic items collapse into
     one labeled keyboard-operable disclosure per manager view, never scattered per-section toggles. From
     2026-09-27 that disclosure reads **More options** in every manager view and on every plain page, sits
     after the view's everyday groups, and opens itself when search, the page index or a Details link lands on
     a row inside it (SSYS-040).
  10. *Side Panel Anatomy:* Manager drawers and the setting Details inspector share one anatomy (identity
     header, sectioned body, quiet footer), the same spring motion, and no decorative accent bars; the
     inspector keeps its width tokens.
  11. *Status Tokens, Not Pills:* State reads as a small coloured dot with text; category labels are quiet
     text; only keyboard keys keep a capsule. From 2026-09-27 the same holds for Details' Default and
     Recommended marks, engine badges and drawer status (words, with a dot only where they carry a tone);
     pick-several choices are squared tiles with a checkbox; related settings in Details are text links; and
     Settings carries no coloured side or top stripe and no emoji.
  12. *Themed Listboxes:* Every select is a listbox drawn by the concept over a hidden native select, sharing
     the chat assistant's popout motion; no native option list is ever visible, and menus use the same popout.
  13. *Manager-Topic Settings Live Inside Their Manager:* Canonical ordinary settings that belong to a manager
     topic render as inline canonical sections inside that manager, before its Advanced disclosure; core
     settings stay on plain pages; every inventory id renders exactly once. From 2026-09-27 a manager may draw
     an inventory row as its own control (a list's search, Show or Sort menu, a per-item switch, a field inside
     one account or server) bound to the same setting id; that bound control is the row's one home, and no
     manager keeps its own copy of a choice an inventory row already makes (SSYS-040).
- **Universal Application Across 38 Managers:** These principles govern all thirty-eight registered
  managers:
  `all-settings`, `general-appearance-input`, `providers-accounts-models`, `web-routes`, `media-routes`,
  `back-seat-driver`, `memory-context-instructions`, `goals-crew-personas`, `permissions-filesafe`,
  `commands-shortcuts`, `tools-integrations`, `testing-debug-capture`, `files-editor-terminal`,
  `notifications-sounds`, `source-control`, `browser-policy`, `containers-registries`,
  `storage-retention-recovery`, `project-history-artifacts`, `settings-transfer`,
  `settings-export-migration`, `server-claim-bootstrap`, `servers-hosts-environments`, `clients-continuity`,
  `project-hosting-files`, `project-sync-move-copy`, `ssh-remote`, `remote-access`, `server-backup-restore`,
  `project-backup`, `updates`, `project-defaults-templates`, `onboarding-guided-tour`, `doctor`,
  `usage-budgets`, `teacher-help`, `project-search-index`, and `dry-method`.
  And across the three named visible-state projections: `teacher-help`, `project-search-index`, and `dry-method`.
  All 892 settings in the inventory remain preserved. Census (USER-SETTINGS-MANAGER-REFRESH-20260908): `Plans/settings_inventory.json` holds 887 ordinary setting ids and the concept's `PM12_REFERENCE` holds 892 (887 plus the five concept-proposed roster/stage rows); the 828 figure in SSYS-004/SSYS-005 is a preserved historical denominator token.
- **Source-Only Checkpoint Generation (APR-063, amended by USER-SETTINGS-MANAGER-REFRESH-20260908):** Hand-editing of
  TestPMConcept.html is strictly forbidden. The published file is generated by
  `Concepts/pm7-tools/build_testpm_settings_refresh.py` from the pinned published checkpoint
  (`Concepts/pm7-tools/settings_refresh_checkpoint.json`) through the authored T50 transform
  `Concepts/pm7-tools/settings_refresh_source.py` (with `settings_refresh/kit.js`, `managers/*.js`, `styles.css`,
  `data.json`), which is also registered as T50 in `Concepts/pm7-tools/build_pm7.py`; `--check` reproduces the
  published bytes, every non-Settings script element is asserted byte-identical to the pinned base, and
  `--parity` asserts identical Settings blocks between the checkpoint lane and the full pipeline. The earlier
  `build_testpm_layout_b06.py` lane (`pm50-manager-layout` replacement with 29 byte-identical scripts) is
  predecessor lineage contained in the new pinned base.
- **Context-Sensitive Manager Navigation (APR-065):** Selecting a manager from a contextual link or
  dropdown retains and highlights that manager's identity during navigation, avoiding disorientation.
- **Manager Kit and Workspace Presentation (USER-SETTINGS-MANAGER-REFRESH-20260908):** Every Settings manager of the
  published concept renders through one shared manager kit (plain-language primary copy, one check control per
  connectable entity, the principles above). Presentation groups registry destinations into concept workspaces
  without changing any of the 38 `manager_id` keys, routes, detail ids, or command ids: Skills, Plugins, MCP
  Servers, and Commands & Shortcuts are separate Code & Tools workspaces over `tools-integrations` and
  `commands-shortcuts`; one System workspace, Server & Project Location, presents `server-claim-bootstrap`,
  `servers-hosts-environments`, `clients-continuity`, `project-hosting-files`, `project-sync-move-copy`,
  `ssh-remote`, and `remote-access`; Single Owners and Browser & SCM governance detail are Advanced
  disclosures; Back Seat Driver is its own kit manager. Every workspace carries `data-manager-key`. Domain
  switches never blank (first frame at least 85 percent of settled brightness, per F3-513), built-in sounds play
  as labelled demonstration tones (F3-405), and All Settings scrolls with the page while staying
  variable-height virtualized (SSYS-005).

```yaml
plan_unit_id: SSYS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Working activity style is registered under general.interaction.working-activity-style offering Orbit
  and Step Rail Simple, retaining short-key working-activity-style and Step Rail as compatibility aliases.
  Settings writes must never report successful persistence when storage fails, disclosing typed errors
  with retry/revert. The five concept-candidate roster/stage keys are tracked as proposed additions
  without displacing canonical crew-members or canonical inventory schema.
gui_related: true
gui_classification_reason: Governs working activity setting identity, truthful persistence UI feedback, and candidate settings reconciliation.
depends_on: [SSYS-029]
unblocks: [SSYS-031]
acceptance_criteria:
  - general.interaction.working-activity-style offers Orbit and Step Rail Simple.
  - Failed persistence writes disclose errors and never set optimistic last-saved success.
  - Candidate roster/stage rows are tracked as proposals without breaking canonical schemas.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: settings_identity_drift_or_optimistic_persistence
reasoning_tier: standard
context_scope: settings_inventory_and_persistence
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: settings_inventory_specification
  create_worknodes: false
source_lineage:
  - APR-044
  - APR-046
  - APR-048
preserved_exact_tokens:
  - "general.interaction.working-activity-style"
  - "Step Rail Simple"
  - "truthful persistence"
negative_constraints:
  - Do not create duplicate primary settings keys for working activity style.
  - Do not show success status on failed persistence writes.
owner_hints:
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Settings_System.md

```yaml
plan_unit_id: SSYS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings exposes shared domain projections (settings.assistant, settings.bsd, settings.schedule)
  reading and mutating exact Project-scoped settings keys through the canonical Settings transaction
  engine, ensuring single-source-of-truth persistence without duplicate stores.
gui_related: true
gui_classification_reason: Governs shared domain settings projections for Assistant, BSD, and scheduling.
depends_on: [SSYS-030]
unblocks: [SSYS-032]
acceptance_criteria:
  - Named projections settings.assistant, settings.bsd, and settings.schedule map to canonical keys.
  - Mutations route through the standard Settings transaction engine.
  - No duplicate or out-of-band stores are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: projection_store_divergence
reasoning_tier: standard
context_scope: settings_projections
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/Back_Seat_Driver.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: settings_projections_specification
  create_worknodes: false
source_lineage:
  - APR-047
preserved_exact_tokens:
  - "settings.assistant"
  - "settings.bsd"
  - "settings.schedule"
negative_constraints:
  - Do not create independent storage stores for named projections.
owner_hints:
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Scheduling_and_Quota_Resume.md

```yaml
plan_unit_id: SSYS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  All thirty-eight registered Settings managers and three named visible-state projections enforce native
  card and grid presentation per USER-REFERENCE-LAYOUT-ROLLBACK-20260908, superseding the reference-video
  flat-row and forced single-column layout while preserving stable alignment, legible short labels, trailing
  controls, deliberate whitespace, limited simultaneous detail via progressive disclosure, and one quiet
  action row. Manager section navigation preserves opened manager identity during routing.
gui_related: true
gui_classification_reason: Governs layout principles, visual structure, and navigation across all thirty-eight Settings managers.
depends_on: [SSYS-031]
unblocks: [SSYS-033]
acceptance_criteria:
  - All 38 managers and 3 projections follow native card and grid layout with concise presentation, superseding reference-video flat-row styling.
  - Labels are concise, controls trail right, and advanced detail is behind disclosure.
  - Contextual manager picker preserves opened manager identity.
  - No manager renders a header-level action strip, more than six tabs, or more than one Advanced disclosure per view (USER-SETTINGS-MANAGER-REFRESH-20260908).
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: manager_layout_inconsistency_or_context_loss
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - APR-062
  - APR-064
  - APR-065
  - USER-SETTINGS-MANAGER-REFRESH-20260908
preserved_exact_tokens:
  - "38 managers"
  - "trailing controls"
  - "progressive disclosure"
negative_constraints:
  - Do not exempt any of the 38 registered managers from native card/grid presentation and concise hierarchy.
  - Do not drop manager identity during section navigation.
  - Do not reintroduce reference-video flat-row or forced-single-column CSS into Settings managers.
  - Do not reintroduce a per-manager top action bar, exceed six tabs, or add a second Advanced disclosure to a manager view.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: SSYS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Every Settings manager renders through one shared manager kit under USER-SETTINGS-MANAGER-REFRESH-20260908: no
  header-level action strip, at most six tabs, exactly one labeled Advanced disclosure per view holding technical,
  diagnostic, rare, and dangerous items, one quiet bottom action row, exactly one check control per connectable
  entity, plain-language beginner copy in primary rows, and one side-panel anatomy shared by manager drawers and
  the setting Details inspector, which keeps its 350 px width token. Concept presentation groups registry
  destinations into workspaces without changing manager_id keys, routes, detail ids, command ids, or the
  settings inventory: Skills, Plugins, MCP Servers, and Commands & Shortcuts are separate Code & Tools
  workspaces over tools-integrations and commands-shortcuts; one System workspace, Server & Project Location,
  presents server-claim-bootstrap, servers-hosts-environments, clients-continuity, project-hosting-files,
  project-sync-move-copy, ssh-remote, and remote-access; Single Owners and Browser & SCM governance are Advanced
  disclosures; Back Seat Driver is its own kit manager. The published TestPMConcept.html is generated by
  Concepts/pm7-tools/build_testpm_settings_refresh.py from the pinned checkpoint through the authored T50
  transform Concepts/pm7-tools/settings_refresh_source.py, also registered in build_pm7.py. Domain switches
  never blank (first frame at least 85 percent of settled brightness), built-in sounds play as labelled
  demonstration tones, and All Settings scrolls with the page while staying variable-height virtualized.
gui_related: true
gui_classification_reason: Governs the shared manager kit, workspace grouping, side-panel anatomy, motion, sound, and build lane of every Settings manager in the published concept.
depends_on: [SSYS-032, SSYS-005, SSYS-006, SSYS-015, SSYS-024]
unblocks: []
acceptance_criteria:
  - Every manager workspace mounts through the shared kit with zero header-level action buttons, at most six tabs, and one Advanced disclosure per view.
  - Registry keys, routes, detail ids, command ids, and the settings inventory are unchanged; every workspace carries data-manager-key.
  - build_testpm_settings_refresh.py --check reproduces the published file and every non-Settings script is byte-identical to the pinned base.
  - The browser checkpoint reports first-frame brightness at least 85 percent of settled on a domain switch, a playable labelled demonstration tone for every built-in sound row, no nested scroller in All Settings, and no page errors.
  - The 60 fps slow-motion films of panel open/close, inspector open/close, domain switch, tab switch, and sound play show no blank frames and settle within the spring's own duration.
  - (USER-SETTINGS-MANAGER-REFRESH-20260909) State renders as dot-plus-text status tokens and no capsule pill remains except keyboard keys; every select is a concept-drawn listbox over a hidden native select and every menu shares its popout motion; rosters scroll inside their manager block; manager-topic canonical settings render inline inside their manager before its Advanced disclosure and every concept id renders exactly once (SSYS-035).
validation_surfaces:
  - python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --check
  - node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_refresh_film.mjs
  - node Concepts/pm7-tools/verify/settings_placement_checkpoint.mjs
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: manager_kit_regression_or_registry_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/settings_refresh_source.py
  - Concepts/pm7-tools/build_testpm_settings_refresh.py
  - Concepts/pm7-tools/settings_refresh/kit.js
  - Concepts/pm7-tools/settings_refresh/placement.json
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - USER-SETTINGS-MANAGER-REFRESH-20260908
  - USER-REFERENCE-LAYOUT-ROLLBACK-20260908
  - SSYS-032
  - USER-SETTINGS-MANAGER-REFRESH-20260909
  - Concepts/pm7-tools/SETTINGS_REFRESH_README.md
preserved_exact_tokens:
  - "shared manager kit"
  - "Server & Project Location"
  - "one Advanced disclosure"
  - "T50"
negative_constraints:
  - Do not reintroduce a per-manager top action bar.
  - Do not render a canonical setting twice or inside a second Advanced disclosure.
  - Do not reintroduce capsule pills or a native option list in Settings.
  - Do not exceed six tabs in a manager.
  - Do not render a second Advanced disclosure in one manager view.
  - Do not mint, rename, or remove a manager_id key for a presentation grouping.
  - Do not hand-edit Concepts/TestPMConcept.html; rebuild through the lane.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/FinalGUISpec.md



## DL-035 terminal settings owner projections - 2026-09-09

Terminal durable preferences remain under the existing Terminal settings coverage; live-session actions stay in the Terminal runtime surface. DL-035 P3/P6/P9/P10 add owner-derived capability, remote-setup and environment explanations plus input-protection scope disclosure. They use the existing row/Details grammar, exact Host/Environment identity, shared manager kit and registered command routes rather than a parallel terminal manager. Same-verified-session input protection survives reconnect/PM reopen and replacement starts unlocked; this is session state, not a pane preference. This planning unit does not create settings inventory keys or infer unresolved defaults; any later durable setting must use central inventory and scope admission before exposure.

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/FinalGUISpec.md#F3-120, ContractName:Plans/FinalGUISpec.md#F3-121, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md#UCC-160, ContractName:Plans/Automated_Testing_System.md#ATS-047

### SSYS-034 - Terminal Capability Remote Setup And Launch Provenance Projection

```yaml
plan_unit_id: SSYS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: Terminal Settings projects the versioned requested/effective enhanced keyboard capability, explicit
  exact-host remote compatibility setup status and redacted environment provenance with pending-for-next-launch
  changes. Runtime input protection stays in Terminal and Settings explains only admitted scope, with same-verified-session
  protection retained across reconnect/PM reopen, replacement sessions unlocked, and both user/agent input blocked under DL-038. Existing
  inventory, scope, secret custody, manager and command owners remain authoritative.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SSYS-006
- SSYS-008
- SSYS-012
- SSYS-033
- F3-120
- SMPFS-158
- SMPFS-161
- SMPFS-164
- SMPFS-165
- UCC-160
- DL-182
unblocks: []
acceptance_criteria:
- P3 exposes supported versioned profile options only from the terminal owner, separates requested from effective
  capability and identifies unsupported pinned toolkit/platform/transport paths. No untested enhancement or new
  default is silently enabled. Terminal images are decided by DL-182 (kitty graphics, sixel and iTerm2 images in the
  first release, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181); no Settings row turns them on or off.
- P6 routes cmd.terminal.remote_compatibility_setup with the exact authenticated Host/Environment and current authorization.
  An action is not a generic boolean permission to write to all hosts; denied/read-only/no-tic/failed-transfer states
  stay explicit and ordinary SSH is preserved when declined.
- P9 routes cmd.terminal.environment_provenance to owner-provided redacted summaries. Unknown source remains unknown;
  default diagnostics exclude secrets. Current launch snapshot and pending-for-next-launch changes are distinct,
  with effect timing visible in row/Details.
- P9 replacement uses cmd.terminal.restart_replace explicitly; saving settings neither mutates a live environment
  nor restarts a session. No additional environment collection or automatic relaunch authority is created.
- P10 live enable/disable actions remain in Terminal. Protection persists for the exact verified live session across
  reconnect/PM reopen; a replacement starts unlocked. This is session state, not a pane preference; historical records
  cannot establish liveness. Explain that protected sessions block both user and agent terminal input with explicit blocked results for agents; output and separate interrupt/terminate controls retain existing behavior.
- Rows and Details preserve existing project/workspace/tab scope rules, shared manager presentation and keyboard
  accessibility. Missing command/handler/wiring/runtime evidence keeps an affected action visibly unavailable with
  its actual reason; static examples do not claim integration.
- No new settings_inventory entry or manager is registered by this unit. Any later durable toggle requires its own
  admitted exact key, scope, default and persistence policy; this boundary does not defer approved runtime actions
  or diagnostic projections.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
negative_constraints:
- Do not treat P3 optional protocol support as an image-protocol decision or bypass effective-capability checks; the
  image-protocol decision is DL-182's.
- Do not move live-pane actions into persistent Settings or silently choose held policies.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-182): image support leaves the list of things never silently enabled, because DL-182 puts the complete image protocols in the first terminal release with no Settings row."
```

```yaml
plan_unit_id: SSYS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Under USER-SETTINGS-MANAGER-REFRESH-20260909 the published concept places every manager-topic canonical setting inside the manager
  that owns its topic: an authored placement map (Concepts/pm7-tools/settings_refresh/placement.json) resolves
  each inventory id by reference subgroup, keyword override, or hand placement to one manager (and tab), renders
  it as an inline canonical section through the engine row renderer before that manager's single Advanced
  disclosure, and keeps its Details inspector, search landing, All Settings row, and change-refresh behaviour.
  Core settings stay on six plain pages; 10 of the 12 machine-generated reference pages and the concept-only
  Assistant page retire because every row they held now has a manager home; the planning domain keeps its id
  with the label Planning. 674 inventory rows render inside managers, every one of the 892 concept ids
  renders exactly once, and the five branching plan-limit ids that the reference builder dropped are hosted by
  the placement map pending subgroup registration. The same pass gives the kit themed listboxes for every
  select and menu, dot-plus-text status tokens instead of pills, hero side panels (identity header, facts,
  progress rail, card sections revealed in a stagger, sticky footer), rosters that scroll inside their manager,
  meter, order, and accordion primitives, and per-manager fixture files merged over the shared fixture.
gui_related: true
gui_classification_reason: Governs where canonical settings render, the listbox and status presentation, side-panel anatomy, and roster scrolling across every Settings manager in the published concept.
depends_on: [SSYS-033, SSYS-005, SSYS-006, SSYS-015]
unblocks: []
acceptance_criteria:
  - A walk over every workspace and every manager tab finds each of the 892 concept ids rendered exactly once; All Settings lists 892 rows in 12 categories.
  - Details opens for a setting rendered inside a manager; global search lands on a setting inside a non-active manager tab; refreshSettingRow swaps an inline row in place.
  - No manager renders a second Advanced disclosure; inline sections precede the manager's Advanced disclosure; advanced placements render first inside it.
  - No native select is visible in Settings; dropdown and menu popouts open with the shared sprout motion inside the viewport; no capsule pills remain except keyboard keys.
  - Rosters scroll independently inside their manager block while the settings document still scrolls.
validation_surfaces:
  - node Concepts/pm7-tools/verify/settings_placement_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_refresh_film.mjs
  - python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --check
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: canonical_setting_placement_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/settings_refresh/placement.json
  - Concepts/pm7-tools/settings_refresh/kit.js
  - Concepts/pm7-tools/settings_refresh/styles.css
  - Concepts/pm7-tools/settings_refresh_source.py
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - USER-SETTINGS-MANAGER-REFRESH-20260909
  - USER-SETTINGS-MANAGER-REFRESH-20260908
  - SSYS-033
  - Concepts/pm7-tools/SETTINGS_REFRESH_README.md
preserved_exact_tokens:
  - "placement.json"
  - "exactly once"
  - "one Advanced disclosure"
negative_constraints:
  - Do not render a canonical setting twice or inside a second Advanced disclosure.
  - Do not mint, rename, or delete a manager_id key or an inventory id for presentation reasons.
  - Do not reintroduce capsule pills or a native option list in Settings.
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-033, ContractName:Plans/FinalGUISpec.md#F3-551

## Onboarding draft transfer extension — 2026-09-10

### SSYS-036 - Settings Transfer To An Uncreated Project Draft

```yaml
plan_unit_id: SSYS-036
unit_type: schema_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: The original cmd.settings.transaction.preview request/result refs select either the unchanged existing-Project
  transfer contract or a closed draft-preview variant. Draft preview binds one actual source Project/revision to
  destination_draft with a draft identity/revision/hash and null destination Project, exact owner selector/setting
  IDs, proposed values, exclusions, explicit-choice precedence, expiry and a redacted summary. It creates/applies
  nothing. After the confirmed Project operation reserves an actual destination identity, Settings revalidates the
  source/draft/preview/inventory, emits settings_transfer_draft_rebind and an ordinary Project-bound preview, and
  uses the unchanged apply transaction with restore point, exact-ID readback and rollback. Onboarding renders this
  owner result and never owns a copy engine. A Project creation resume consumes the same exact rebind result
  and ordinary apply transaction outcome; an already settled settings_rebind_apply is skipped, never re-applied,
  and an unknown Settings effect is reconciled through Settings before any retry.
gui_related: true
gui_classification_reason: Controls the user-visible Start fresh/Start like another Project preview, optional Choose
  settings, meaningful conflicts and copy result.
depends_on:
- SSYS-007
- SSYS-008
- SSYS-009
unblocks: []
acceptance_criteria:
- The same canonical preview command and Wiring Matrix refs accept both typed variants; no draft-copy command is
  added.
- The uncreated destination carries no Project identity; real source identity, revision, draft/hash, selectors and
  expiry are mandatory.
- Onboarding offers this variant only for a new Project with eligible existing sources, never when simply opening
  an already registered Project, connecting to an existing Puppet Master or choosing Project Later.
- Only owner-eligible exact IDs are proposed, excluding explicit new choices and all protected/owner-excluded settings;
  proposed value keys equal those IDs.
- Rebind consumes the exact confirmed draft preview and newly reserved real Project, then creates an ordinary bound
  preview; neither draft preview nor rebind is accepted directly by apply.
- A changed or expired source/draft/preview, wrong destination, unresolved conflict, permission or readback failure
  cannot leave partial applied Settings or a half-ready listed Project.
- The copy is detached; no source link, future propagation, credential duplication, account replacement or copied
  Goals/Plans/files/history is implied.
- A Project resume consumes the settled rebind/apply result without re-applying it; an unknown Settings effect
  resolves through Settings reconciliation first.
validation_surfaces:
- Plans/settings_system_contract_fixtures.json
- tests/test_pm_settings_draft_transfer.py
- tests/test_pm_onboarding_phases.py
- future native restore/readback/rollback and restart tests; not_run
risk_class: precommit_mutation_or_settings_copy_authority_drift
reasoning_tier: high
context_scope: onboarding_settings_draft_preview_rebind
implementation_surfaces:
- Plans/Settings_System.md
- Plans/settings_system_contracts.schema.json
node_compile_hint:
  mode: settings_draft_transfer_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/02_PROJECT_DRAFT_COPY_AND_COMMIT.md
negative_constraints:
- Do not invent a destination Project ID or apply Settings before commit.
- Do not fork the owner category/eligibility inventory or copy credentials.
- Do not treat fixtures as native transaction, rollback, security or readiness evidence.
- Do not invent a Settings recovery command, DTO, or second rebind path for Project resume; consume the exact
  rebind and unchanged apply transaction.
```

## External research limits — 2026-09-17

### SSYS-037 - External Research Limit Values

Settings owns the four Project-scoped values that bound an external research topic: the per-topic cost cap, the per-job limits on model responses and wall seconds, the lifetime cap per research arm, and whether retained unresolved usage blocks further admission or only stays visible. Of the two dispositions, `visible_only` is a design default that no run has exercised yet and is marked as one until a run does; `blocks_admission` is what continuation 4 exercised. Their meaning, their defaults and the rule that every job reports which limit ended it belong to `Plans/External_Research.md` (`ERS-008`, `ERS-009`); this owner holds the values, their inventory rows and their surfaces, and no other owner stores them. The rows themselves are added to `Plans/settings_inventory.json` in the Settings owner's next authorized inventory wave, which owes them and which the External Research landing does not perform; this unit fixes ownership and meaning and claims no existing row. The per-job limits are the live bound in practice, so their controls state plainly that they, not the cost cap, are what ends a job that does not finish.

```yaml
plan_unit_id: SSYS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The four external research limits are Project-scoped Settings values held by this owner and its
  inventory, namely a per-topic cost cap, per-job limits on model responses and wall seconds, a
  lifetime cap per research arm, and an unresolved-usage disposition of blocks_admission or
  visible_only, of which visible_only is a design default that no run has exercised and is presented as
  one until a run does. Their semantics and defaults are owned by Plans/External_Research.md; Settings
  holds the values, the inventory rows and the surfaces, and no other owner stores them. Their
  controls state that the per-job limits, not the cost cap, are what ends a job that does not finish, and
  retained unresolved usage stays visible whichever disposition is chosen.
gui_related: true
gui_classification_reason: The four limits are user-visible Settings controls with explanatory copy.
split_recommended: false
depends_on: [SSYS-005, ERS-009]
unblocks: []
acceptance_criteria:
  - The four research limits are specified here as Project-scoped Settings values; their inventory rows are owed to the Settings owner's next authorized inventory wave, and until then no row is claimed to exist.
  - No other owner document stores or duplicates a research limit value.
  - Retained unresolved usage remains visible under either disposition.
  - A surface offering the unresolved-usage disposition names `visible_only` a design default until a run establishes it, and never presents it as exercised.
  - The per-job limit controls state that they, not the cost cap, are what ends a job that does not finish.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: settings_ownership_drift
reasoning_tier: medium
context_scope: external_research_limits
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_inventory.json, Plans/External_Research.md]
node_compile_hint: {mode: consumer_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/External_Research.md:ERS-009
  - reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json
preserved_exact_tokens: ["per-topic cost cap", "per-job", "lifetime cap", "unresolved usage"]
negative_constraints:
  - Do not store a research limit value outside this owner and its inventory.
  - Do not hide retained unresolved usage under either disposition.
  - Do not present the per-topic cost cap as the limit that ends a job.
  - Do not register the inventory rows as a runtime, readiness or governance claim.
owner_hints: [Plans/Settings_System.md, Plans/External_Research.md]
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/External_Research.md

## Commands manager Project preferences — 2026-09-26

The selected Commands & Shortcuts manager reads and writes two ordinary Project Settings values: `extensions.commands.keyboard-layout` is a select with `Auto-detect`, `US (QWERTY)`, `UK`, `German (QWERTZ)`, and `French (AZERTY)`, default `Auto-detect`; `extensions.commands.command-palette-visibility` is a toggle, default `on`. The concept boolean maps true to `on` and false to `off`. Auto-detect is the saved choice whose effective layout follows the system. Palette visibility affects user-command discovery only and never changes canonical UICommand registration, invocation permission or command-file contents.

Both rows use SSYS-002 Project-only persistence and SSYS-009's `cmd.settings.transaction.preview` then bound `cmd.settings.transaction.apply`, with exact setting ID/value, Project identity/revision, actor/permission, schema version, idempotency and owner validation. Only `handlers::settings::transaction_preview` and `handlers::settings::transaction_apply` own this route; no new writer or per-setting command exists. No-Project writes fail closed, switching Projects rebinds the values, and Restore Defaults or CS-081's explicit composite reset uses the inventory defaults. Readback/rollback and admission-before-paint remain Settings-owned.

### SSYS-038 - Commands Manager Layout And Palette Preferences

```yaml
plan_unit_id: SSYS-038
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The Commands manager binds extensions.commands.keyboard-layout and
  extensions.commands.command-palette-visibility to ordinary Project-only Settings transactions.
  Keyboard layout preserves Auto-detect, US (QWERTY), UK, German (QWERTZ), and French (AZERTY),
  default Auto-detect; the palette toggle defaults on and controls user-command discovery, never
  UICommand registration or permission. Both consume cmd.settings.transaction.preview then
  cmd.settings.transaction.apply with exact Project/revision/value/actor/permission/currentness,
  validated readback/rollback, Project rebind and inventory-default reset; no-Project writes reject.
gui_related: true
gui_classification_reason: Keyboard layout and user-command palette visibility are existing selected manager controls.
depends_on: [SSYS-002, SSYS-009, CS-081]
unblocks: []
acceptance_criteria:
  - Both exact IDs exist once in settings_inventory.json with Project scope, selected options and defaults.
  - S6/S7 and selected source metadata bind these IDs through the existing Settings transaction route with no pending owner row.
  - Project switches rebind, no-Project writes reject, and reset consumes inventory defaults without changing command registration or permission.
validation_surfaces: [Plans/settings_inventory.json, Plans/settings_system_contract_fixtures.json, Plans/commands_shortcuts_contract_fixtures.json]
risk_class: unowned_preference_or_scope_drift
reasoning_tier: medium
context_scope: commands_manager_project_preferences
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_inventory.json, Concepts/pm7-tools/settings_refresh/managers/24-commands.js]
node_compile_hint: {mode: settings_owner_binding_contract, create_worknodes: false}
source_lineage: [Concepts/TestOpus5.5PmConcept.html, Plans/Commands_System.md#CS-081]
preserved_exact_tokens: [extensions.commands.keyboard-layout, extensions.commands.command-palette-visibility, Auto-detect, "US (QWERTY)", UK, "German (QWERTZ)", "French (AZERTY)", cmd.settings.transaction.preview, cmd.settings.transaction.apply]
negative_constraints:
  - Do not create per-setting commands, a global durable preference, or another Settings writer.
  - Do not grant command invocation permission or change UICommand registration through palette visibility.
  - Do not claim native runtime or readiness from inventory registration.
owner_hints: [Plans/Settings_System.md, Plans/Commands_System.md]
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Commands_System.md#CS-081

## Chat sound and busy-send defaults — 2026-09-27

Jared's decisions DL-107 and DL-108 change two defaults in `Plans/settings_inventory.json`. This owner records them; the Settings GUI concept adopts them in its own later pass.

### SSYS-039 - Chat Sound On By Default And Queue As The Busy Send Default

```yaml
plan_unit_id: SSYS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  general.interaction.sound-effects defaults to on and is recommended on (DL-107); its description
  names the chat header's speaker button as a quick mute for the same setting.
  general.interaction.queue-behavior defaults to Queue and is recommended Queue, with Steer still
  offered (DL-108). No other key, scope or tier changes; the chat header mute is a shared chrome
  control over general.interaction.sound-effects, not a new setting, which keeps sound effects a
  grouped setting rather than a per-view toggle. Production motion honours general.visual.reduce-
  animations as well as the operating system's reduced-motion preference (ACD-475).
gui_related: true
gui_classification_reason: "Changes two user-visible setting defaults."
split_recommended: false
depends_on: [DL-107, DL-108]
unblocks: []
acceptance_criteria:
  - "The inventory defaults general.interaction.sound-effects to true and general.interaction.queue-behavior to Queue."
  - "No new sound or queue setting key exists."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_default_drift
reasoning_tier: standard
context_scope: settings_defaults
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: settings_default_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-107"
  - "Plans/Decision_Log.md#DL-108"
preserved_exact_tokens:
  - "general.interaction.sound-effects"
  - "general.interaction.queue-behavior"
  - "Queue"
  - "Steer"
negative_constraints:
  - "Do not add a chat-only sound or queue setting."
  - "Do not change scopes or tiers of these keys."
owner_hints:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-107, ContractName:Plans/Decision_Log.md#DL-108, ContractName:Plans/settings_inventory.json

## Settings information architecture and plain-language rework — 2026-09-27

Every decision in this section is dated 2026-09-27. It records the product decisions demonstrated by the Settings rework in `Concepts/onboarding/opus-5.5/src/settings` (placement in `o55/placement.d/*.json`, row wording, conditions, units, routes, flows and editors in `o55/rows.d/*.json`, behaviour in `kit.d/*.js` and `managers/*.js`). The concept remains `concept_fixture_only` (§4.6): its fixture values, simulated flows, counts and screenshots are not runtime, persistence, handler or readiness evidence. The 38-key manager registry, every `manager_id`, route, detail id and command id, and every inventory id are unchanged; page names, groups and moves are presentation over the same registry (SSYS-015, SSYS-035). Where an existing unit already governs a topic (SSYS-010 Glass control disclosure, SSYS-013 container and SCM operation boundaries, `Plans/Commands_System.md#CS-081` Commands & Shortcuts controls, `Plans/Personas.md` §4 persona editing), that unit still governs and this section does not change it.

Amended 2026-10-09 (DL-180 to DL-183): the layout, tab, editor and chat column rows of SSYS-050 and the terminal look rows of SSYS-051 join the groups below as those units place them; Window & panels names its layout action Restore home layout, the same words as the title bar's Home menu; the Terminal look group grows into the terminal's appearance model and its finer rows fold into a new Terminal look: more options; and the seven rows SSYS-050 retires are drawn on no page.

### 1. Page and group structure

Every Settings view, manager tab or plain page, draws its short everyday groups first (a list the manager draws itself counts as one group; on plain pages they replace single groups of up to 26 rows) and folds rarely changed groups into the view's one disclosure at the end, labelled More options (§22 principle 9). A group lists its rows in reading order, master switch first and the choices it unlocks after it, instead of inventory order. A group whose every row waits on a switch that is off steps aside with its rows. Each group reads the same way: a title, one line of help, the rows, and at most one owner line (for example the single Open Docker Manager line at the top of Docker on this computer instead of one on every group holding a container id); the numbered section kicker and per-section guide button are retired because every row has its own About.

| Plain page | Everyday groups, in order | More options |
|---|---|---|
| App & Input | Theme & colors; Size & readability; Sending messages; How the assistant works; What the chat shows; Help & explanations; Window & panels (including Choose widgets and Restore home layout); When Puppet Master opens; Spelling | Custom themes; Fine-tuning the look; More about help |
| Editor & Terminal (was Editor & Runtime; its containers moved to Containers) | Saving & tabs; File tree; Editing; Terminal; Terminal look; Terminal output & history; Copy & paste; Project search index | Big files & folders; Terminal look: more options; Terminal: more options; Search index: more options |
| Containers (was Containers & Execution) | Docker on this computer; Docker Hub and other registries; Building & publishing images; Running containers; Changed containers; Disk cleanup; Kubernetes; Unraid templates; Your app's store listing; Your publisher profile | Docker panel views & records; Template repository details |
| Planning & Interviews | Plan and Deep Plan; Planning Wizard; Interview topics; Helpers | Question limits; This wizard session only; Files & formats |
| Advanced Settings | Sharing with the makers; Troubleshooting; Startup and drawing; Start over | none |

The former 20-row Plan depth & questions group and 26-row Terminal & shell group are retired in favour of the groups above.

| Manager | Tabs and groups in order (More options last) |
|---|---|
| Providers & Accounts | Services (every service, account and key, drawn by the service list); Models (Everyday model; A model for each job; Goals, helpers and small jobs; Presets and nicknames; More options: How models answer, Service features and caching, Work lanes and what ran); Limits & switching (Moving between accounts; Moving between services; More options: One run, and the switch log); Usage & budgets (Spending limits; Warnings; The Usage page; More options: Records and prices) |
| Web & Research | Abilities (each ability's web services apart from the AI model that decides what to look for, and its limits inside it); Search services; Limits & saving (Spending; Saved results); Network (offline mode, proxy with its fields shown only for a manual proxy, and the certificate bundle; More options: Your own servers) |
| Media & Output | Abilities (the project switches above the list; each ability's switch, service and defaults inside it); Pictures & files (Pictures you share; Where results go; More options: Expert options) |
| Toolchain | Language Servers (the server list; Language help; Code health gate; More options: Timing and limits); Formatters (the formatter list; Tidy code; More options: Formatter catalog); Agent Tools (no container rows) |
| Skills; Plugins; MCP Servers | The list first, owning its search, Show, Sort, add, remove and per-item switches; then Skills: How skills are used, New skills, Share with other AI tools (More options: Size and display); Plugins: New plugins and updates, Limits and safety; MCP Servers: Servers from other apps, Connection defaults (More options: Refresh and secrets, What each server ended up with) |
| Commands & Shortcuts | Shortcuts (one shortcut list in three groups, everywhere, in the message box and in the terminal, with clashes checked across all three; shortcut hints, with clash display on CS-081's warn policy; More options: Reset and back up); Commands (Safety; Your commands; More options: Defaults for new commands, Built-in names) |
| Testing & Debug | Profiles (Running sessions); When to test (the one switch for all automated testing; Before merging); What it can test, was Browser & Native (Browser testing; Desktop and mobile apps; Behind the scenes; More options: Test tools and windows); Debug (Debug profiles; What debugging may do on its own; More options: Debug loop limits); History (Keeping proof) |
| Context & Memory | Memories (the on/off switch heading the list); Context space (In chats; When space runs low; Working notebook; More options: Fine-tune context space, and In one chat, which only says that Squeeze now is in each chat's own menu); Instructions (Standing instructions; What you can see; Rule packs; More options: Prompt safety checks); Finding memories (When memories are used; How memories are matched); Keeping & privacy (How long memories last; Unconfirmed notes; Who else can read memories; More options: Tidy up); Sources |
| Goals | Defaults, shown first (New Goals start with; Keeping an eye on progress; Scheduled runs; Progress view); Templates (kind of job set per template); Recovery (If something interrupts; Changing the plan; When a check fails); Checks (Before a Goal is called done; Goal evidence, with the receipt a finished Goal earns shown as a read-only line; More options: Stricter proof); no Active Goals tab |
| Personas | Personas (Your personas; inside the selected persona: About this persona, How it answers, Model and cost, Tools and instructions; More options: Skipped settings); Crews (Crews; New crews start with; Crew Auto); Group work (BrainStorm: who takes part; BrainStorm: debate and vote; Review; Chat Room); Helpers (Helper agents; Which helpers; Keeping helpers safe; More options: Limits for all agents, Helper contracts); Defaults (Choosing a persona; In a chat) |
| Back Seat Driver | Overview (one Advisor group; More options: Expert options); Stages (Where the advisor watches); Findings |
| Source Control | Code Services (each service connected through a guided set-up; GitHub sign-in inside GitHub; push access by SSH key or HTTPS token); Local Tools; Repositories (Create a new repository; Contribute to another project; Workspaces for chats; Before and after each run; More options: Workspace storage); Defaults & Safety (Git on this server: the name and email on changes, how Git signs in and signing changes, set up by Set up Git; Files that need care: big files and files never saved in history; How runs use version history; Safety, with protected branches as an editable list; Recovery; More options: Source Control panel); Actions & Pipelines (Pinned workflows; Keeping checks current) |
| Built-in browser | Built-in browser; Signing in to websites; Screenshots and developer tools |
| Notifications & Sounds | The master switch at the top of every tab; Destinations; Events (with Which alerts reach you under the event list); Sounds (play sounds, volume and also-while-using-the-app first); Quiet hours; History |
| Permissions | Profiles (Profiles, and inside the selected profile What it may do without asking, as one answer each for changing files, running commands, using the internet and publishing, then Rules in that profile; New runs and chats; More options: Who runs the tools); Rules (View and scope; Rules for this project, in order, with the rules the profile in use brings shown beside them; Answers for each tool; More options: Rule details); Protected Files (File protection; Dangerous commands; Folders outside the project; Hide secrets; More options: Exceptions during checks); Approvals (When a run stops to ask; Always ask first; When you're asked; More options: Strictness and records); Limits (Stop runaway work; Limits for one run; More options: Finer limits) |
| History | Timeline (What the timeline shows, in the filter bar; More options: Export and import); Sessions; Artifacts; Cleanup (Chats; Run records and logs; More options: Index and storage tools) |
| Server & Project Location; Settings Transfer; Readiness & Doctor; Updates | Servers tab: Servers (each server's details, including how it signs in); SSH computers; SSH keys (every key Puppet Master knows, where it is kept and what uses it); Setting up tools on servers. Away From Home: how you reach the server now, and the ways in, in the order they are tried. Move & Copy: moving, copying or importing a workspace, and what was moved. Settings Transfer: Copy, load or save, one guided set-up, and the transfer history (More options: File format and older versions). Readiness & Doctor: Last checkup; Automatic checkups; What you see around the app; Setup and tour (More options: For support). Updates: Puppet Master; Content and catalogs (More options: How often and which releases) |

### 2. Canonical-id moves between pages

These ids change the view that draws them. Nothing else about them changes.

| Canonical ids | From | To |
|---|---|---|
| `code.execution.docker-manager-visibility`, `container-runtime`, `docker-binary-path`, `docker-display-context` | Toolchain › Agent Tools | Containers › Docker on this computer |
| `code.execution.dockerhub-auth-method`, `dockerhub-token`, `dockerhub-signin`, `dockerhub-namespace`, `dockerhub-repository`, `create-repository`, `repo-privacy`, `default-registry`, `registry-credentials`, `enterprise-registries` | Toolchain › Agent Tools | Containers › Docker Hub and other registries |
| `planning.verification.review-strategy`, `review-reviewer-count`, `review-blind-initial-pass`, `review-peer-corroboration`, `review-preserve-dissent`, `review-auto-repair`, `review-roster` | Goals | Personas › Group work › Review |
| `planning.verification.evidence-span`, `source-evidence-layers`, `receipt-evidence-policy`, `evidence-detail` | Testing & Debug | Goals › Checks › Goal evidence |
| `planning.testing.browser-capture-full-default`, `browser-component-action`, `browser-component-crop`, `browser-devtools-policy` | Testing & Debug | Built-in browser › Screenshots and developer tools |
| `code.execution.execution-strategy`, `strategy-override` | Server & Project Location | Permissions › Profiles › Who runs the tools |
| `code.execution.mode-overlay` | Containers | Permissions › Profiles › New runs and chats, next to the run mode it narrows |
| `memory.limits.run-token-budget`, `goal-token-budget` | Context & Memory | Permissions › Limits › Limits for one run |
| `general.startup.onboarding`; `planning.interview.wizard-first-run`, `provider-setup-skip` | App & Input; Planning & Interviews | Readiness & Doctor › Setup and tour |
| `system.advanced.config-format`, `legacy-config-names` | Advanced Settings | Settings Transfer › File format and older versions |
| `general.startup.max-persisted-tabs` | App & Input | Editor & Terminal › Saving & tabs, bounded by `general.interaction.max-editor-tabs` |
| `general.startup.refresh-investigation` | App & Input | Testing & Debug › Debug › What debugging may do on its own |
| `planning.interview.todo-auto-use` | Planning & Interviews | App & Input › How the assistant works |
| `planning.verification.back-seat-driver-mode` | Goals | Back Seat Driver › Overview; this planning copy follows the advisor's mode and search lands on the mode row |
| `system.health.capability-provisioning` | Readiness & Doctor | Server & Project Location › Servers › Setting up tools on servers |

### 3. Retired duplicates

Hand-written rows that repeat an inventory row, often with other options or defaults, are not drawn; the inventory row is the one control: on App & Input, `font-size` (Text size, `general.visual.font-size`), `motion` (Reduce motion, `general.visual.reduce-animations`), `contrast` (Keyboard focus outline, `general.visual.focus-indicator`), `restore-window` and `panel-restore` (Remember window size and layout, `general.startup.window-state`), `help-level` (How the app talks to me, `general.interaction.mode`) and the short-key `working-activity-style` row (`general.interaction.working-activity-style`, §19); the hand Interface density row draws `general.visual.interface-density` with its inventory choices Auto, Comfortable and Compact (Relaxed was never a stored value). On Editor & Terminal, `format-save` (`code.editing.formatters-enabled`, on Toolchain), `large-file` (the inventory size limits), `terminal-profile` (`code.terminal.shell`), `terminal-restore` (`code.terminal.layout-restore`) and `index-exclusions` (`web.index.exclusion-patterns`). On Advanced Settings, the hand Diagnostic telemetry row, whose crash reports defaulted on (`system.health.telemetry`, Share anonymous usage and crash reports, off by default), and the hand reset row (`system.advanced.reset-defaults`, which runs the real Restore Defaults preview of SSYS-009). The old Editor page's container section, Preferred container engine and Registry accounts, gives way to `code.execution.container-runtime` and `code.execution.registry-credentials`. A hand section left with no rows is removed.

A manager keeps no second copy of a choice an inventory row makes; the inventory row is drawn once in the manager or bound into its own control:

| Manager | Retired own copy | The one control |
|---|---|---|
| Skills | the second list of every skill; share failure states offered as choices | the skills list with its switches and run rules; Share or Don't share |
| Plugins | the table repeating every plugin; the page's own 10-second hook limit | the plugin list, whose switch writes `extensions.plugins.plugin-on-off`; `extensions.plugins.hook-timeout` |
| MCP Servers | a second Ask me first import switch; the page's own 30-second limit | `system.mcp.import-external`; `system.mcp.timeout`; every per-server setting inside the server's panel |
| Providers & Accounts | the flat Accounts & sign-in and API keys lists | each account's and service's own rows and key dialog (§8) |
| Web & Research | the manager's own source and crawl-page counts, fetch timeout and cache, browser profile and certificates | the inventory limits inside each ability and on Network |
| Media & Output | the manager's own quality, voice, format, retention and folder copies | the inventory rows inside each ability; `media.image.provider`; `media.io.vision-fallback-model` |
| Permissions | the manager's own expiry, remember-my-choice, then, parallel-task, disk, network and threshold copies; free-typed tool names | the inventory rows in their tabs; a profile sets the inventory safety level (Read only, Plan only, Regular, Full; your own profiles read Custom); the ordered rule list is the inventory rule list, last match wins; fixed Allow, Ask, Block tables per tool and per web ability |
| Server & Project Location | a second SSH folders list | `code.execution.ssh-remotes` |
| Settings Transfer | encrypted-archive and notes choices; Save and Load drawn twice | the inventory Save and Load actions; Merge or Replace; twin categories picked together |
| Readiness & Doctor; Updates | Doctor's separate check buttons; Updates' own automatic-check switch, frequency and channel copies | one Check everything with a dated last-checkup line; `system.advanced.auto-update` with install-when-idle beneath it, catalogs following their switch, and the inventory frequency and channel rows |
| Back Seat Driver | free-text model and persona boxes; the duplicate stage key/value list | pickers (Automatic plus signed-in models; the advisor persona plus your personas); each of the ten stages stored as inherit, off, auto or on (`Plans/Back_Seat_Driver.md` §23) in the concept-proposed `safety.approvals.bsd-stage-bindings` row, which stays a proposal under §19 |
| Notifications & Sounds | the stats strip; a per-destination urgent switch, a global switch and an exceptions list | the Destinations, event and sound lists as the homes of `general.interaction.notification-destinations`, `general.interaction.notification-mapping` and `general.interaction.sound-mapping`; one getting-through-quiet-hours choice per destination |
| Commands & Shortcuts | second copies of the shortcut search, hints, reset and save/load | the inventory rows and actions beside the one shortcut list, which writes the inventory map of changed keys |
| Testing & Debug | the manager's own built-in-browser, visual-inspection and native-checks switches | the capability rows, read as Automatic, Always or Never |
| Context & Memory | per-store lifetimes, the hard-coded decay table, the chat-history on/off switch and the preview's own result cap | the fade times; how much history is kept; the real retrieval limits |
| Goals | the manager's own saving-progress, resume, retry, then, require-evidence, helper, Goal-model and ask-before-risky-steps copies | the Recovery and Checks rows, with helpers, the Goal model and risky-step approval shown as one line each with a way to where they live |
| Personas | persona-scoped rows drawn once for every persona; the Defaults inheritance switches and Goals row | the persona-scoped rows inside the persona they belong to |
| Source Control | the manager's own branch name and worktree folder; the per-service default switch | `branching.worktrees.default-branch` and the workspace folder row for new repositories, clones, worktrees and runs; Make default; the Pinned workflows row; the safety level decides its three switches unless it is Custom |
| Built-in browser | its own screenshot switch and Testing's copy; retention and redaction copies | one capture choice shown on both pages; Testing's run-evidence retention and `safety.protection.screenshot-redaction`, shown with a way to change them |
| History | the manager's own keep-for copies, except temporary files | the chat, run-record, log and safe-point keep-for rows with their minimums; Testing's evidence retention |

### 4. Plain-language labels and values

One row grammar everywhere: a label, one plain sentence, the control, and an About button that opens Details; a changed value carries a quiet dot. A row's label and help are decided per row; a row with no decided wording falls back to its inventory label in sentence case ("Keep Running In System Tray" reads "Keep running in system tray"), keeping product and tool names, words with an inner capital (GitHub, BrainStorm), all-capital words (MB, AI) and fixed phrases (Deep Plan, Grill Me, Docker Hub). Search results show the row's own label and help, and the inventory title stays searchable, so either wording finds the row.

Stored values never change for presentation; what a person reads does. Each option reads as words from one shared vocabulary, overridden per setting where a word means something specific there, with an optional one-line hint; identifier-looking tokens become words while text already written for people is left alone; a select whose current value is not one of its options shows that value as a visible choice instead of implying the first option is chosen. Numbers show their unit or nothing, never the word "number"; a number that follows a default until someone sets it reads Automatic with Set a number; a unit people do not think in is shown in one they do (milliseconds as seconds, bytes as MB); a typed number is checked on leaving the field and brought back inside its bounds with a message; and a bound may follow another setting (tabs reopened next time stay within tabs allowed open; fewest questions per topic stays below most). A toggle whose inventory default is a word reads on for on, show, enabled, enforced, override and yes, and off for off, hide, disabled, inherit and no; an unchanged saved value is corrected to match and a saved choice is never overwritten. A default that is really words (such as "(default project location)") reads as the field's placeholder; a path kept inside the project reads `project/…`; an empty keep-for row reads Until I delete them; a policy that is not a choice reads as one fixed sentence; and a Custom choice gets its own field directly under it.

Details answers in order: where the row lives (chapter and page), what it is set to and whether that is the default, what it does, the choices in plain words (clickable, the current one ticked, default and recommended marked), where it applies, and which settings sit next to it; the technical id comes last and folded. Inventory machine fields (tier, curation flags, a raw default shown as an example) are never shown as prose.

### 5. Visibility

A row whose meaning depends on another switch or choice shows only while that switch or choice makes it apply, and relevance follows chains: Glass background and transparency only under a Glass theme, Retro textures only under a Retro theme, High contrast and the older Basic light/dark choice only under a Basic theme (SSYS-010; High contrast also while NieR Mode is on, which paints over Basic); proxy address fields only with a manual proxy; the Docker Hub access token only when signing in with a token; the Kubernetes namespace only once a cluster is chosen; Animation speed only while Reduce motion is off; the NieR Mode parts and background only while NieR Mode is on; Retro scanline and pixel-grid strengths only while Retro textures are on; Back Seat Driver rows only while the advisor is on; the capability rows only while testing is not Off; crew and helper detail rows only while crews or helpers are on; Review's reviewer count, blind first pass and corroboration only with multi-pass review; the code health gate's options only once the gate is on; the checkpoint pauses only while the run mode asks at checkpoints; permission scopes only in the Expert Rules view with overrides on; and the MiniMax prompt option only for the MiniMax picture service. A hidden row keeps its stored value, stays findable through search and Details, and hiding never removes a blocking error, consent boundary, unavailable reason, requested/effective difference or live-versus-example distinction (SSYS-006). Theme-family rows are outside this rule: Glass controls keep SSYS-010's visible `not_applicable` disclosure.

### 6. Owner routes and flows instead of a generic action panel

No Settings action opens the generic "What this does" preview panel whose button only reported that the action was requested. An inventory action row does one of two things. It routes to the owner surface that does the job and lands on the exact control: `ai.accounts.github-connect` to Source Control; `ai.usage.quota-management` to Providers & Accounts › Usage & budgets; `personas.library.persona-manager` to Personas; `general.interaction.settings-search` (Search all settings) to the Settings search box (`settings.search.focus`); `general.interaction.dashboard-widgets` (Choose widgets) to the Home dashboard's own widget picker, since a typed list of widget names could never be valid; `general.startup.reset-home-layout` (Restore home layout) to Home's own Restore home layout (`cmd.workspace_layout.reset`, which keeps every open tab) after one plain question naming what moves back and what is kept; a per-account or per-service row, including every API key row, to its account or service. Or it runs one small flow bound to the owner's command and availability: a form (fields to fill in; non-secret answers are kept, secrets are only marked as saved in the keychain), a check (steps run in order with an outcome and the time of the last run), a confirm (a plain question with the consequence, marked dangerous when it removes something), a list (things to read or act on, each with its own action or Remove) or an order (an ordered list). A flow performs no owner operation itself: it dispatches the owner's registered command or shows the owner's unavailable reason (SSYS-015, SSYS-020), and where SSYS-013 requires a route (container, registry, publish and SCM operations) the row routes to the owner surface instead.

A Settings search result for an action row, such as Restore home layout for `general.startup.reset-home-layout`, lands on that exact row and asks the row's own plain question; search never opens Details for an id that is not on the page it opens, which would draw an empty panel.

Adding an MCP server, a plugin, a skill, a command, a shortcut, a persona, a crew, a Goal template, a language server, a formatter, a test profile, a debug profile, a permission profile, a server, an SSH computer or an SSH key, setting up a way in from away, moving or copying a workspace, copying, loading or saving settings, connecting a code service, setting up Git, creating a repository and contributing to another project are guided set-ups in one window over the dimmed page, in the onboarding wizard's form: the steps as a rail, one plain question per step, Back and Continue, and a click on the dimmed page never closes it. Each commits through its owner's command; the answers a row remembers are its inventory values.

### 7. Structured editors

Lists and key/value settings open an editor that adds, removes and reorders items instead of a raw JSON or text box; items from a known set (services, personas, clusters, models) are picked rather than typed; nested data keeps a structured editor labelled as such; secret rows open a key panel that never shows the key, and notification destination addresses are entered and shown like keys (masked, kept on the server, with Replace). Rows that had a raw box get a small editor of their own: Words to always accept is a word list; reviewers are one persona per review round, picked from the library; Kubernetes logs start is one choice; what agents may do in each cluster is one entry per cluster with its namespaces and four switches; Unraid setup fields are entries with a kind, a name and a default; the publisher picture is an upload or a link; the context-space split adds up to 100 percent; rule documents open in an editor; per-tool and per-web-ability answers are fixed Allow, Ask and Block tables; Back Seat Driver's model and persona and the Commands defaults for new commands offer the signed-in models, real personas and profiles instead of free text. Fields inside a Settings panel carry their own label and help and no generic hover or focus tag over them; the panel's buttons keep theirs.

### 8. Rows that describe one thing

Rows the inventory holds once but which describe one account (nickname, jobs it may do, billing, sign-in method, Google Cloud project, priority, switch and cooldown overrides, retry budget, quota profile, credential storage) or one AI service (on or off, preferred sign-in) are drawn and edited inside that account or service. A thing without its own value shows the inventory default, never another thing's value; Details says the row is set per account or per service and lists what each one has; anywhere the plain row renderer draws such a row (All Settings included) it is a way to the accounts or services, not one global control. The per-thing value is held by the account or service owner record; the inventory row's scope metadata is not widened by this presentation.

### 9. Inventory admission (2026-09-27)

The rows the Settings surface drew by hand without inventory ids are admitted to `Plans/settings_inventory.json`
(user-approved inventory wave, recorded at `Plans/FinalGUISpec.md#F3-441`): Accent color
`general.visual.accent-color` (Theme keeps the active theme's own accent), Animation speed
`general.visual.animation-speed`, Show names next to those icons `general.interaction.activity-bar-labels` (mirrors the
icon rail's own expand and collapse state in both directions), First screen when Puppet Master opens
`general.startup.first-screen`, Check spelling `general.interaction.spellcheck`, Languages to check
`general.interaction.spellcheck-languages`, Words to always accept `general.interaction.spellcheck-words`, and on Editor &
Terminal Save files automatically `code.editing.autosave`, Text encoding for new files `code.editing.default-encoding`,
Check before pasting several lines `code.terminal.paste-protection` and How much to index `web.index.mode`. The same wave
sets the defaults of Corner roundness, Border width and Scrollbar width to `theme` (the active theme's own value) in
place of the Retro theme's literal values, as the appearance model in section 4.4 already reads them.

### 10. Guided set-ups, profiles, keys and transfer (2026-09-28)

Every guided set-up listed in section 6 walks a newcomer from nothing to a working result in the onboarding wizard's
form, and ends by showing the result on the page it was started from, where it can be changed or removed again; a step
that would reach an outside computer or service says so and, in the concept, is marked Example only.

- A permission profile is what the assistant may do without asking, as one answer each (without asking, ask me first,
  never) for changing files in the project, running commands, using the internet and saving, pushing and publishing,
  plus the rules that come with it. Its rules live in its own profile file (`Plans/Permissions_System.md` section 9)
  and form the profile layer of `Plans/Permissions_System.md#PRECEDENCE-LAYERS` (section 2.4), above the project's rules:
  the Rules tab's rules belong to the project and apply under every profile, and where both cover the same action the
  profile's rule wins, rule by rule. A rule can be added to a profile, attached from the project, or moved to the
  project. The built-in profiles keep their answers; changing one starts from Make a copy. New permission profile
  starts from Careful, Balanced, Hands-off, a copy of a profile or nothing, then asks for the four answers, protection,
  rules and a name.
- SSH keys are one list on Server & Project Location, each with where its private half is kept, its type and what uses
  it; an older key type says a newer one is safer. A server, an SSH computer and Git's own sign-in each attach a key
  from that list, a new one, a key file or a pasted key; the private half is never shown or moved, and putting the
  public half on the other computer is either done once with a password that is not kept, or shown as the exact line
  to copy.
- Add a server asks, in order, what kind of computer it is, how to reach it, how to sign in (a setup code or an SSH
  key), puts the key on it, checks the connection and names it. Away from home sets up one way in (Tailscale or a
  self-hosted Headscale, an existing VPN, your own web address with its port-forwarding step, or Remote Link); the ways
  in are tried in the listed order, the local network first. Move & Copy moves, copies or imports a workspace after
  choosing what goes, where to and how much history, and checks the result.
- Settings Transfer is one guided set-up for copying from another project, loading a file or saving one: what kinds of
  settings, a preview of every change in plain labels and values, which side wins where a setting differs, and a
  recap; it keeps the exact-id prepare and apply, the restore point and the rule that passwords, keys, sign-ins and
  device pairings never move. Transfer history entries show their details and can be removed.
- Source Control connects each code service through a guided set-up, sets up push access with a shared SSH key or an
  HTTPS token, and sets up Git on this server (the name and email on changes, signing, big files and files never
  saved in history); protected branches are an editable list.
- Settings sets defaults and does no live work: no view shows, starts, pauses or stops a live chat or Goal. Goals are
  started in the assistant chat or by the Planning Wizard, so Goals in Settings holds the defaults every new Goal
  starts with, templates (which can be created, edited, duplicated, exported and deleted) and the recovery and check
  rules; memories kept for one chat read One chat and a new memory is kept for the project or for you; one chat's own
  actions, such as Squeeze now, live in that chat's menu.
- A persona's tuning rows (Creativity, Word choice range, Spending cap) read Same as the project until the persona
  sets its own value, which is then set with a slider or amount that can go back to the project's; a persona-only row
  drawn outside its persona is a way to the personas (section 8), reading Set in each persona.
- The Git and SSH rows these set-ups write are admitted to `Plans/settings_inventory.json` (user-approved inventory
  wave 2026-09-28, 913 rows): `branching.worktrees.git-author-name`, `git-author-email`, `git-push-method` and
  `git-push-key` (set per code service), `commit-signing`, `commit-signing-key`, `large-file-storage`,
  `large-file-threshold`, `large-file-types`, `default-ignore-patterns` and `protected-branches`, and
  `code.execution.ssh-keys` and `code.execution.server-sign-in`. The managers draw them in their own controls; the
  stored value is the inventory row's, so search, Details, All Settings and Settings Transfer reach them. A key row
  names a key in the SSH key list and never holds a private half.
- The three NieR Mode rows are admitted to `Plans/settings_inventory.json` (user-approved inventory wave 2026-09-28,
  916 rows): `general.visual.nier-mode`, `general.visual.nier-parts` and `general.visual.nier-background`, placed on
  App & Input in Theme & colors after Preview Themes Before Applying. The parts and background rows show
  only while NieR Mode is on; the parts open in a small editor titled NieR Mode, which is a row editor and not a new
  manager. The NieR Mode checkbox and its Adjust NieR look button in the title-bar theme selector, the onboarding look
  choice and the onboarding and Guided Tour Look menus (DL-152) write these same three rows and open that same
  editor; no row is added. NieR Mode is a hidden theme painted over Basic, not a ninth theme: the eight built-in
  variants of SSYS-010
  are unchanged, and its full rules (paint over Basic, precedence over Accent color and App font, the kept theme
  family, Reduce motion, Animation speed and sound) are in section 4.4, with their acceptance criteria in SSYS-043.

```yaml
plan_unit_id: SSYS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Every Settings view draws short everyday groups first, each in reading order with its master
  switch first, and folds rarely changed groups into the view's one disclosure, labelled More options, at the
  end. The plain pages are App & Input, Editor & Terminal (was Editor & Runtime), Containers (was Containers &
  Execution), Planning & Interviews and Advanced Settings, and the page groups, manager tab groups and
  canonical-id moves are those recorded in this section; they are presentation over unchanged manager keys,
  routes, detail ids, command ids and inventory ids. Hand-written rows that repeat an inventory row and every
  manager-owned copy of a choice an inventory row makes are retired: the inventory row, drawn once or bound into
  its manager's own control, is the one control. Rows read in plain words: a decided label and sentence, else
  the inventory label in sentence case with names kept; options read as words while the stored value is
  unchanged; numbers show units and stay within bounds, including bounds that follow another setting; search
  shows the row's own label. A row that depends on a switch or choice shows only while it applies. No action
  opens a generic preview panel: each action row routes to its owner surface or runs a form, check, confirm,
  list or order flow bound to the owner's command and availability. Lists, maps and structured values open
  structured editors; rows that describe one account or service are edited inside it.
gui_related: true
gui_classification_reason: Governs the visible grouping, order, disclosure, labels, visibility, action routes and editors of every Settings page and manager.
split_recommended: false
depends_on: [SSYS-006, SSYS-013, SSYS-015, SSYS-020, SSYS-033, SSYS-035, DL-180]
unblocks: []
acceptance_criteria:
  - Every manager view and plain page renders its everyday groups first and at most one More options disclosure, last; a landing from search, the page index or Details on a folded row opens it first.
  - Plain-page and manager group orders and the canonical-id moves match this section; manager_id keys, routes, detail ids, command ids and inventory ids are unchanged.
  - No retired hand-written row or manager-owned copy renders, and each inventory id still renders exactly once, a manager's bound control counting as its home; an inventory row retired by SSYS-050 renders nowhere.
  - Every label, option, unit and search result reads in plain words while stored values and inventory titles stay unchanged and searchable; word defaults of toggles resolve by the on/off table without overwriting a saved choice.
  - A dependent row hides only while its condition fails, keeps its stored value, stays findable, and never hides a blocking error, consent boundary, unavailable reason or requested/effective difference; Glass controls keep SSYS-010 disclosure.
  - No Settings action opens a generic preview panel; each action row reaches its owner route or a flow that dispatches its owner command, or shows the owner's unavailable reason, and SSYS-013 operations route to their owner surface.
  - List, key/value and structured rows open structured editors; no secret is rendered; per-account and per-service rows are edited inside their account or service.
validation_surfaces:
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_information_architecture_or_duplicate_control_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Concepts/onboarding/opus-5.5/src/settings/o55/placement.d
  - Concepts/onboarding/opus-5.5/src/settings/o55/rows.d
  - Concepts/onboarding/opus-5.5/src/settings/kit.d
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - Concepts/onboarding/opus-5.5/src/settings/o55/placement.d
  - Concepts/onboarding/opus-5.5/src/settings/o55/rows.d
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/16-pages.js
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/65-flows.js
  - SSYS-035
preserved_exact_tokens:
  - "More options"
  - "App & Input"
  - "Editor & Terminal"
  - "Planning & Interviews"
negative_constraints:
  - Do not draw a hand-written row or a manager-owned copy beside the inventory row it repeats.
  - Do not open a generic action preview panel for an inventory action, and do not let a flow perform an owner operation without the owner's command.
  - Do not show raw JSON, identifier tokens or the word "number" where a person reads a value.
  - Do not mint, rename or delete a manager_id, route, command id or inventory id for these presentation changes.
  - Do not treat concept flows, fixture values or placement counts as runtime, persistence or readiness evidence.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the rows SSYS-050 retires render nowhere, Reset the layout reads Restore home layout, and Terminal look: more options joins Editor & Terminal's folded groups."
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-035, ContractName:Plans/Settings_System.md#SSYS-013, ContractName:Plans/Settings_System.md#SSYS-020, ContractName:Plans/FinalGUISpec.md#F3-551

```yaml
plan_unit_id: SSYS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Appearance rows apply through the per-variant token contract as overrides over the active variant: size of
  everything, text size, line spacing, animation speed, spacing and extra padding, border width, corner
  roundness, scrollbar width, app font, high contrast, keyboard focus outline, Retro textures and accent. A row
  never changed writes no override, so each theme keeps its own values (unchanged means the theme's own); reset
  removes exactly the override that row wrote. Accent overrides use precomputed per-mode values, never runtime
  colour derivation, and theme-owned fine-tuning rows present the active variant's value until a value is chosen.
  Overrides share the theme pair's atomic acceptance, non-persistent preview and Project scope.
gui_related: true
gui_classification_reason: Every appearance row visibly changes the app and must leave each built-in variant intact until changed.
split_recommended: false
depends_on: [SSYS-009, SSYS-010, F3-426]
unblocks: []
acceptance_criteria:
  - Each appearance row named in section 4.4 visibly changes the app in every family where it applies, and no appearance value is stored without effect.
  - With no appearance row changed, every built-in variant renders exactly its own token table.
  - Resetting one row restores the variant's own value for what that row wrote and leaves every other override in place.
  - Accent choices carry precomputed per-mode values for the primary accent, its RGB triple and the accent tokens derived from it.
  - Border width, corner roundness and scrollbar width show the active variant's value until chosen, and returning them to the theme removes the override.
validation_surfaces:
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
  - python3 scripts/pm-plan-index.py validate
risk_class: appearance_setting_without_effect_or_theme_override_leak
reasoning_tier: standard
context_scope: project_appearance_settings
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/17-look.js
  - Concepts/onboarding/opus-5.5/src/settings/styles.d/12-look.css
node_compile_hint:
  mode: project_appearance_settings_contract
  create_worknodes: false
source_lineage:
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/17-look.js
  - Plans/FinalGUISpec.md#F3-426
  - Plans/Settings_System.md#SSYS-010
preserved_exact_tokens:
  - "token contract"
  - "the theme's own"
  - "reset"
negative_constraints:
  - Do not store an appearance value that changes nothing.
  - Do not present an inventory literal, such as a Retro radius, as the value in use on another family.
  - Do not derive accent colours at runtime.
  - Do not change the theme pair atomicity, the Glass alpha floors or Glass control disclosure of SSYS-010.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/FinalGUISpec.md#F3-426

```yaml
plan_unit_id: SSYS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings sets defaults and runs guided set-ups; it does no live work. No Settings view shows, starts, pauses or
  stops a live chat or Goal: Goals start in the assistant chat or the Planning Wizard, Goals in Settings holds new-Goal
  defaults, templates, recovery and check rules, and one chat's own actions live in that chat's menu. Every set-up
  listed in the presentation section's owner-routes subsection runs in the onboarding wizard's form and ends with its
  result shown where it was started, changeable and removable. A permission profile carries its four answers and its
  own rules, which form the profile layer above the project's rules and win rule by rule; built-in profiles change
  only through a copy. SSH keys are one shared list that servers, SSH computers and Git's sign-in attach from, never
  showing or moving a private half. Settings Transfer previews every change in plain labels and values and never
  moves passwords, keys, sign-ins or device pairings.
gui_related: true
gui_classification_reason: Governs which Settings views may act on live work and how every guided set-up, permission profile, SSH key and transfer is presented.
split_recommended: false
depends_on: [SSYS-013, SSYS-040]
unblocks: []
acceptance_criteria:
  - No Settings view lists, starts, pauses or stops a live chat or Goal, and no Settings row reads "this thread" or "this chat".
  - Each listed guided set-up reaches its end in the wizard form and leaves its result on the page it started from, with a way to change or remove it.
  - A permission profile shows its four answers and its own rules; a rule can move between a profile and the project; the profile's rule wins where both cover an action; a built-in profile's answers change only through Make a copy.
  - Servers, SSH computers and Git's sign-in attach keys from one SSH key list, and no private key half is rendered.
  - The transfer preview shows each changing setting by its plain label with plain before and after values, and lists what is never copied.
validation_surfaces:
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_live_work_or_guided_setup_drift
reasoning_tier: standard
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Concepts/onboarding/opus-5.5/src/settings/managers
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/60-wizard.js
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - Concepts/onboarding/opus-5.5/src/settings/managers/31-goals.js
  - Concepts/onboarding/opus-5.5/src/settings/managers/50-servers.js
  - Concepts/onboarding/opus-5.5/src/settings/managers/52-permissions.js
  - Concepts/onboarding/opus-5.5/src/settings/managers/53-transfer.js
  - Plans/Permissions_System.md#PRECEDENCE-LAYERS
preserved_exact_tokens:
  - "Make a copy"
  - "Same as the project"
  - "One chat"
negative_constraints:
  - Do not start, pause, stop or list live Goals or chats from Settings.
  - Do not let a built-in permission profile's answers be edited in place.
  - Do not render or transfer a private key half, password, sign-in or device pairing.
  - Do not treat concept fixtures, Example only steps or wizard results as runtime evidence.
owner_hints:
  - Plans/Settings_System.md
  - Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-040, ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS

## NieR Mode — decided 2026-09-28, reached where a look is chosen 2026-10-07

NieR Mode's canon is the NieR Mode, NieR Mode Parts and NieR Mode Background paragraphs of section 4.4 and the NieR admission bullet of the presentation section's subsection 10; this unit carries their acceptance criteria. It was added with DL-152, when NieR Mode gained a checkbox wherever a look is chosen; before that, `Plans/Decision_Log.md#DL-144` and `Plans/FinalGUISpec.md#F3-589` cited SSYS-042, the guided set-ups unit, for NieR Mode, and both now cite this unit.

### SSYS-043 - NieR Mode Switch, Parts, Background And Where It Is Turned On

```yaml
plan_unit_id: SSYS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  NieR Mode (general.visual.nier-mode, off by default) paints the whole app in NieR's ink and parchment over the
  Basic variant that the Light, Dark or Auto choice resolves to, using NieR's own precomputed light and dark token
  tables (F3-426). It is a hidden theme, not a ninth variant or a family: it never reads, writes or replaces the
  chosen theme family and mode, which show again when it is turned off. While it is on it decides the accent color
  and the app font, the family-specific rows follow Basic, and every other appearance row still applies (SSYS-041).
  Its 29 parts (general.visual.nier-parts, in five groups, all installed by default) each switch one touch and do
  nothing while NieR Mode is off; its background (general.visual.nier-background, City Ruins by default) is a faint
  original ink scene painted once from the app's own files. The parts and background rows show only while NieR
  Mode is on and are edited in one row editor titled NieR Mode, with the presets Full install, Quiet, Still and
  Colors only; it is not a manager and adds no manager_id, route, detail id or command id. Besides its Settings
  row, NieR Mode is turned on wherever a look is chosen (DL-152): the title-bar theme selector, the onboarding
  look choice and the onboarding and Guided Tour Look menus carry, below their family and Light/Dark choices, one
  NieR Mode checkbox with an Adjust NieR look button that opens that same editor, as a popup over the application
  or as a panel inside the onboarding window; they write these three rows and no other. No command id, route,
  settings key or ui.guided_tour.* action is added for them (DL-153): live, the checkbox and every edit in the
  editor compose cmd.settings.transaction.preview then cmd.settings.transaction.apply over the exact IDs, several
  NieR rows changed together being one atomic group; the editor's open, close and Play reboot moment are the typed
  local presentation actions ui.settings.nier_editor.open, ui.settings.nier_editor.close and
  ui.settings.nier_editor.replay, which write nothing; inside the onboarding window the checkbox and the editor's
  edits are ui.onboarding.choose_look previews, which also opens and closes the panel. Inside the onboarding
  window NieR choices are a non-persistent preview written with the theme pair when the look is committed to the
  Project, and the onboarding look, NieR Mode included, is an explicit new choice that a settings copy never
  proposes (SSYS-036). The three rows share the theme pair's atomic acceptance, preview and Project scope. All NieR
  motion obeys reduced motion and Animation speed; its sounds play only while general.interaction.sound-effects is
  on, through the Notifications & Sounds owner's one player (F3-599). No game asset or game audio is used.
gui_related: true
gui_classification_reason: Governs the NieR Mode switch, its parts and background rows, its editor and the places it is turned on.
split_recommended: false
depends_on: [SSYS-009, SSYS-010, SSYS-036, SSYS-039, SSYS-041, F3-426, F3-441]
unblocks: [F3-589, F3-598, F3-599]
acceptance_criteria:
  - "With NieR Mode on the app paints Basic under NieR's light or dark table, the selector still exposes exactly eight built-in variants, and turning it off shows the chosen family and mode unchanged."
  - "Each of the 29 parts is installed or removed on its own, a preset sets the whole list, and with NieR Mode off no part draws, moves or plays."
  - "The parts and background rows show only while NieR Mode is on, keep their stored values while hidden and stay findable through search and Details."
  - "The Settings row, the title-bar theme selector, the onboarding look choice and both Look menus reach one editor and write only general.visual.nier-mode, general.visual.nier-parts and general.visual.nier-background."
  - "Inside the onboarding window no NieR choice writes a setting before the look is committed, and a settings copy into the new Project never proposes the three NieR rows."
  - "Outside the onboarding window the checkbox and every editor edit dispatch cmd.settings.transaction.preview then cmd.settings.transaction.apply over the exact NieR rows; the editor's open, close and replay are ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay and write nothing; inside the window every NieR control is ui.onboarding.choose_look (DL-153)."
  - "No manager_id, route, detail id, command id, settings key, NieR part or theme variant is added."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
risk_class: nier_mode_settings_drift
reasoning_tier: high
context_scope: project_appearance_settings
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/18-nier.js
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/22-nier-chips.js
node_compile_hint:
  mode: project_appearance_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/FinalGUISpec.md#F3-441
  - Plans/Decision_Log.md#DL-152
  - Concepts/onboarding/opus-5.5/src/settings/kit.d/18-nier.js
  - Concepts/onboarding/opus-5.5/src/settings/nier/nier-automata.json
preserved_exact_tokens:
  - "general.visual.nier-mode"
  - "general.visual.nier-parts"
  - "general.visual.nier-background"
  - "NieR Mode"
  - "Adjust NieR look"
  - "Full install"
  - "Colors only"
  - "ui.settings.nier_editor.open"
  - "ui.settings.nier_editor.close"
  - "ui.settings.nier_editor.replay"
  - "ui.onboarding.choose_look"
negative_constraints:
  - Do not make NieR Mode a ninth theme variant, a family or a family choice.
  - Do not add a settings key, a NieR part, a manager, a route or a command for NieR Mode or its editor.
  - Do not write a NieR choice durably from inside the onboarding window before the look is committed.
  - Do not derive NieR token values at runtime, or use a game asset or game audio.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-041, ContractName:Plans/Settings_System.md#SSYS-036, ContractName:Plans/FinalGUISpec.md#F3-426, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/DRY_Rules.md#DR-056, ContractName:Plans/UI_Command_Catalog.md#UCC-120

## DL-180 to DL-183 — Panels, Tabs, Editor, Chat Column And Terminal Appearance Settings (2026-10-09)

This addendum compiles the Settings side of four decisions of 2026-10-09: `Plans/Decision_Log.md#DL-180` (Home becomes one universal panel system and the chat stays fixed on the right), `#DL-181` (the terminal is one session per tab and has no AI of its own), `#DL-182` (terminal images) and `#DL-183` (terminal schemes, backgrounds, effects and fonts, all applying live). Settings is not ported into PMConcept7 in this wave; these units fix exactly what Settings binds when it is. SSYS-050 owns the layout, tab, editor and chat column rows and every row this redesign retires; SSYS-051 owns the terminal look rows over the terminal's one appearance model and the terminal rows this redesign amends. They amend SSYS-010 (the chat layout row retires), SSYS-034 (images are DL-182's, with no Settings row), SSYS-040 (retired rows render nowhere, Restore home layout, Terminal look: more options) and section 4.4 (every panel and tab instead of the bottom panel), each with a dated note where it stands. They supersede the restart badges on `code.terminal.theme` and `code.terminal.font-family` and the terminal's own pane layouts in Settings. The semantics stay with their owners: the panels, tabs and named layouts are `Plans/FinalGUISpec.md#F3-630` to `#F3-634`, the narrow ladder `#F3-636`, the chat column `#F3-637`, the dashboard tab `#F3-638` with `Plans/Widget_System.md#WS-030`, the editor `#F3-639`, the terminal tab `#F3-640` and `#F3-641`, the appearance model `#F3-642` (one model, `Plans/DRY_Rules.md#DR-068`), the effects `#F3-643`, the faces `#F3-644`, the Home layout record `Plans/storage-plan.md#SP-330` and the terminal appearance storage `#SP-331`. The commands are `Plans/UI_Command_Catalog.md#UCC-200` and `#UCC-201`. The concepts' settings keys (`panels.*`, `editor.*`, `chat.*`, `terminal.*`) are source lineage only and never inventory ids.

### What Settings stores, and what it never writes

Every row below is an ordinary Settings value bound to exactly one Project (SSYS-002); the inventory's scope field is applicability metadata and admits no app-global store (SSYS-004). Settings never writes the Home layout record (SP-330): the split tree, the tabs, a panel's collapsed or locked state, the chat column's width, its pinned History and its popped-out state are layout state, committed by the layout commands of UCC-200. The rows here only choose defaults and how things start.

The terminal's appearance is one model with four layers resolved field by field: the look's defaults ("Follow theme"), the app default, the project default, then the tab's own override (F3-642). Settings > Terminal writes the app default and is the only writer of the project default, and the Appearance popover's All terminals writes the app default (F3-642). Each SSYS-051 row is one field's project default: an ordinary Settings value in the open Project's settings snapshot (SSYS-002), written only by Settings through `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over the exact id. The app default follows SSYS-028's rule for the ELI5 All chats edit exactly. SSYS-002 and SSYS-004 admit no app-wide store, so until one is admitted (the open question SSYS-028 records as `pldg-20260927-001-wand-collab-workflows` q-035) a field's app default is the row's bundled inventory default, and both app-default edits, the one in Settings > Terminal and the popover's All terminals, are disabled with the Settings owner's reason. Their editable requirement is kept, not replaced by a permanent read-only decision, and no app-wide write is admitted from scope metadata alone. The tab's override is the terminal tab's own serialized state (SP-331), written by the popover's This terminal through `cmd.terminal.appearance.set` (UCC-201); Settings never writes it.

Every row added or amended here applies live. A change commits through the Settings transaction over its exact id (SSYS-009), the panels, the editor, the chat column and every open terminal read the committed value at once, and no row carries a restart badge or waits for a reload. A row that says how something starts (Starting layout, Chat history list, Remember window layout, Terminals when reopening a project, Tabs remembered between sessions) is in effect at once for the next start it governs, and a row that caps or opens tabs (Max open editor tabs, Preview tabs) at the next open. No Settings change opens, closes, moves or rearranges a panel or a tab that is already open (SSYS-042); Restore home layout routes to Home's own `cmd.workspace_layout.reset` after one plain question.

### Rows retired

Retired rows follow the inventory's own convention, the one `general.visual.basic-color-scheme` carries: the row stays in `Plans/settings_inventory.json` with its id, label and shape, and its description ends with `(Superseded by …)` naming what replaced it. No id is deleted or reused. A row retired here is drawn on no page, in no manager and in no search result, Settings Transfer never proposes it, and nothing reads a value stored for it; no shipped build has stored one, because the Settings runtime is not yet built (section 7).

| Id | Label | Why it retires | What replaces it |
|---|---|---|---|
| `general.interaction.panel-dock` | Panel Position | The chat never docks to another edge or floats inside the window (DL-180); the left rail's side panels are the rail canon's (DL-162, DL-163). | The chat's Pop out (`cmd.panel.undock`, Dock back `cmd.panel.redock`) |
| `general.visual.chat-layout-mode` | Chat Layout | Overlay and Detached-as-a-float leave with the movable chat. Docked is the only state inside the window, and being popped out is a window state the Home layout record keeps and the pop-out commands change, not a choice made in Settings, so the row retires whole rather than keeping two values. | The chat column of the Home layout record (SP-330) and Pop out |
| `code.terminal.layout-style` | Preferred Layout | Single, split and Quadrant panes inside a terminal retire (DL-181). | The named layouts, Terminals 2x2 among them, and `general.startup.starting-layout` |
| `code.terminal.auto-second-pane` | Auto-Open a Second Pane | There are no terminal sections or second panes (DL-181). | Split, which opens a new panel with its own terminal |
| `code.editing.editor-strip-collapsed` | Start With Editor Strip Collapsed | There is no separate editor strip (DL-180). | Folding any panel to its tab strip (`cmd.workspace_layout.set_collapsed`), kept in the layout record |
| `code.terminal.explanations` | Explain What Commands Do | No AI inside the terminal (DL-181, D19). | The Teacher persona in the chat (`Plans/Personas.md` section 11.8) |
| `code.terminal.tab-role` | Tab Purpose Hints | The per-tab role setting retires (DL-181). | Shell profiles (`code.terminal.allowed-profiles`) and the tab's own label (`cmd.panel_tab.rename`) |

### Rows amended

SSYS-050's seven:

| Id | Label | What changed |
|---|---|---|
| `general.interaction.dashboard-widgets` | Dashboard Widgets (Choose widgets) | Every dashboard tab keeps its own widgets and layout (`widget_layout:v1:dashboard:<board_id>`, WS-030); the row opens the Home dashboard tab's own widget picker where that tab is and stores no widget layout. |
| `general.interaction.max-editor-tabs` | Max Open Editor Tabs | Counts editor tabs across every panel of the workspace (25, unchanged); past it the least recently used editor tab closes, never a pinned one or one with unsaved changes. Other kinds are not counted and never close on their own: closing a terminal ends its session (DL-181). |
| `general.startup.max-persisted-tabs` | Tabs Remembered Between Sessions | Applies to tabs of every kind in a workspace's saved layout (50, unchanged), least recently used dropping first; the editor tabs among them stay within Max Open Editor Tabs, the bound section 2 of the presentation rework already names. |
| `general.startup.reset-home-layout` | Restore Home Layout (was Reset Home Layout) | Puts the panels back in the Home layout and keeps every open tab (`cmd.workspace_layout.reset`); the label is the title bar's Home menu row's; its button reads Restore. |
| `general.startup.window-state` | Remember Window Layout | Is the "restore layout at start" choice: on, the window's size and position and each workspace's layout (panels, sizes, tabs, chat column) come back; off, each workspace opens in the Starting Layout. |
| `code.editing.word-wrap` | Wrap Long Lines | Applies at once in every editor tab; the editor's word wrap is this row, not a new one. |
| `code.terminal.layout-restore` | Terminals When Reopening a Project (was When Reopening a Project) | Re-scoped from the terminal's own layout to the terminal tabs of a saved layout: Restore Last Layout brings them back as SMPFS-180 says, Start Fresh leaves them closed. A session verified still running always comes back in its tab, whatever this row or Remember Window Layout says. |

SSYS-051's twelve:

| Id | Label | What changed |
|---|---|---|
| `code.terminal.theme` | Terminal Colors | The scheme field: Follow theme (default) or one of the 34 schemes of F3-642 or an imported one; the restart badge is removed. The earlier "Match App Theme" stays a search word and reads as Follow theme. |
| `code.terminal.font-family` | Terminal Font | The font field: Follow theme (default), JetBrains Mono, Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or System monospace (F3-644); the restart badge, Fira Code, SF Mono and Custom are removed, because every terminal face other than System monospace, which uses the computer's own monospace face, is built in under the licence rule. |
| `code.terminal.font-size` | Terminal Text Size | The size field: Font default (each face's own size, F3-644) instead of 12. A terminal's Text size menu is a view zoom of that terminal alone (UCC-201), not this row. |
| `code.terminal.copy-on-select` | Copy When I Highlight | Also the model's copy-on-select field (off), which a terminal's popover can set for that terminal alone. |
| `code.terminal.sticky-header` | Keep Command Titles Visible | Also the model's sticky-header field (on); describes F3-640's sticky command header. |
| `code.terminal.shell` | Default Shell Profile (was Shell) | The profile a new terminal opens with when none is picked (Ctrl+T in a terminal panel, the "+" menu's Terminal row body). |
| `code.terminal.allowed-profiles` | Allowed Shell Profiles | The profiles the "+" menu's Terminal row and the terminal's New terminal menu list: the shells on this computer, named profiles and, added as a choice, the SSH computers of `code.execution.ssh-remotes`. |
| `code.terminal.right-click-paste` | Right-Click to Paste | Off by default now, because a right click opens the terminal's menu (F3-640); on, a right click pastes and Shift+right click opens the menu. |
| `code.terminal.rendering-mode` | Rendering Mode (was Terminal Look & Feel Preset) | Keeps the render modes of the Section15 terminal (Interactive Rich, Plain, Minimal) and says it never sets colours, fonts, backgrounds or effects: those are the Terminal look rows. |
| `code.terminal.shell-integration` | Shell Integration (was Shell Integration Status) | A switch, as its type always was: on, the shell's prompts and commands are marked (each mark carrying the terminal's secret, SMPFS-183); off, the shell runs as it is, with no command marks, sticky command header or command jumps. |
| `code.terminal.search` | Search in Terminal | Find is in every terminal (Ctrl+Shift+F, Cmd+F on a Mac, F3-641; the old Ctrl+F is corrected), so the switch no longer turns it off: it shows on and unavailable with that reason, and nothing reads its stored value. |
| `code.terminal.transcript-retention` | Saved Terminal Output (was Keep Terminal History For) | Bound to the terminal's saved scrollback (`Plans/storage-plan.md#SP-332`), which restore brings back: Keep Saved Scrollback (default, was Session Only) keeps it by SP-332's rule, and Session Only saves none, so a restored or reopened terminal starts without its earlier output. The 24 Hours, 7 Days, 30 Days and Forever choices, the 7 Days recommendation and the adjudication badge go, because SP-332's quota and closed-tab limit replace them. |

### Rows added

SSYS-050's eleven, all scope `global`, stored per Project:

| Id | Label | Type and choices | Default | Group |
|---|---|---|---|---|
| `general.startup.starting-layout` | Starting Layout | select: Home, Build, Terminals 2x2, Focus | Home | App & Input › Window & panels |
| `general.interaction.chat-keep-open` | Keep the Chat Open in Narrow Windows | toggle | off | App & Input › Window & panels |
| `general.interaction.chat-history-list` | Chat History List | select: Flyout, Pinned | Flyout | App & Input › Window & panels |
| `general.interaction.preview-tabs` | Preview Tabs | toggle | on | Editor & Terminal › Saving & tabs |
| `general.interaction.tab-sizing` | Tab Sizing | select: Shrink to fit, Fixed width | Shrink to fit | Editor & Terminal › Saving & tabs |
| `code.editing.font-family` | Editor Font | select: JetBrains Mono, Atkinson Hyperlegible Mono, System monospace | JetBrains Mono | Editor & Terminal › Editing |
| `code.editing.font-size` | Editor Text Size | number, px | 13 | Editor & Terminal › Editing |
| `code.editing.line-height` | Editor Line Spacing | slider, a multiple of the text size | none yet | Editor & Terminal › Editing |
| `code.editing.minimap` | Minimap Scrollbar | toggle | on | Editor & Terminal › Editing |
| `code.editing.sticky-scroll` | Sticky Scroll | toggle | on | Editor & Terminal › Editing |
| `code.editing.diff-layout` | Diff Layout | select: Automatic, Side by side, Inline | Automatic | Editor & Terminal › Editing |

Starting Layout is the named layout a workspace opens in when it has no saved layout of its own, with the trees of F3-630; Restore home layout still returns to Home. Keep the Chat Open in Narrow Windows is F3-636's switch: below 480 px of centre width the chat folds to its edge strip unless it is on; the title bar's Home menu carries the same switch and writes this row through the Settings transaction. Chat History List is how the 5.6 Pro History list starts in a workspace with no choice saved yet; pinning or unpinning it in the chat is that workspace's layout state (SP-330), so the row is a starting value and never a second store. Preview Tabs off makes every open that would make F3-634's preview tab open a kept tab instead; the rest of F3-634 (one id, one tab, reveal where open, placement) is unchanged. Tab Sizing's Shrink to fit is F3-631's cascade (96 to 200 px, inactive tabs to 72 px, then 36 px icons, then "+N"); Fixed width skips the shrinking and moves what does not fit to "+N" at once. In both, pinned tabs stay 36 px and the active tab stays visible and at least 120 px wide. Max Open Editor Tabs and Tabs Remembered Between Sessions stay in Saving & tabs, and Remember Window Layout stays in When Puppet Master opens. The editor rows are the editor kind's own values (F3-639), not SSYS-041 token overrides: the app's text size and line spacing do not change them, UI Scale (`general.visual.ui-scale`) still scales them with the rest of the app, and NieR Mode, which decides the app font, does not override Editor Font, since JetBrains Mono's bytes are NieR's own PM NieR Mono files (F3-644). Minimap Scrollbar off draws a plain scrollbar where the minimap was. Diff Layout's Automatic decides by the tab body's own width, never the window's (F3-639).

Choices the concepts carried that are not rows, and why:

- The chat's width. The drag commits once as `cmd.workspace_layout.resize_surface` with the chat surface and is kept in the Home layout record (F3-637, SP-330); a Settings row would be a second store for one value.
- Revealing a file where it is already open. One id is one tab (F3-634, DR-071): a file already open anywhere is shown where it is, and a switch that turned this off would open the same file twice.
- What an empty panel does when its last tab closes. F3-630's panel lifecycle is the rule (the panel closes unless it is the only one in the centre or locked); Lock is the per-panel way to keep an empty panel.
- What the "+" does. It always opens its menu and never makes a tab by itself (F3-632).
- Which side a tab's close button sits on. No decision or settled measurement asks for a choice, and the strip's close slot, which also holds the unsaved dot, is one-sided (F3-631).
- Restoring the layout at start. That is `general.startup.window-state`, which section 3 of the presentation rework already made the one control for window and panel restore.
- Degauss. A one-off action in the terminal's Appearance popover (F3-643), never stored.

### The terminal look rows

SSYS-051's thirty-six, all scope `global` and `project` (applicability metadata; each row stores the project default, as above), stored per Project, one row per field of F3-642 with the defaults of the terminal concept's settled section 6:

| Id | Label | Type and choices | Default |
|---|---|---|---|
| `code.terminal.scheme-pair` | Switch With Light and Dark | toggle | on |
| `code.terminal.min-contrast` | Minimum Text Contrast | select: Off, 3:1, 4.5:1, 7:1 | 4.5:1 |
| `code.terminal.import-scheme` | Import a Color Scheme | action (`cmd.terminal.appearance.import_scheme`, UCC-201) | none |
| `code.terminal.font-weight` | Terminal Text Weight | number | 400 |
| `code.terminal.line-height` | Terminal Line Spacing | slider | Font default |
| `code.terminal.letter-spacing` | Letter Spacing | number, px | 0 |
| `code.terminal.ligatures` | Ligatures | toggle | on |
| `code.terminal.bold-bright` | Bold As Bright | toggle | off |
| `code.terminal.cursor-shape` | Cursor Shape | select: Follow theme, Block, Bar, Underline | Follow theme |
| `code.terminal.cursor-blink` | Cursor Blink | toggle | on |
| `code.terminal.cursor-trail` | Cursor Trail | select: Follow theme, Off, Soft, Glow, Phosphor, Trace | Follow theme |
| `code.terminal.background` | Terminal Background | select: Follow theme, Theme surface, Solid color, Gradient, Image | Follow theme |
| `code.terminal.background-color` | Background Color | text (a colour) | none |
| `code.terminal.background-gradient` | Background Gradient | select: Dusk, Dawn, Deep, Paper | none |
| `code.terminal.background-image` | Background Image | select: Hills, Grid, Paper, Custom | none |
| `code.terminal.background-image-file` | Custom Background Image | path | none |
| `code.terminal.background-dim` | Background Image Dimming | slider | 0.45 |
| `code.terminal.background-blur` | Background Image Blur | slider, px, made once on the picture | 0 |
| `code.terminal.opacity` | Terminal Opacity (Glass) | slider | Follow theme (70 % light, 74 % dark) |
| `code.terminal.padding` | Terminal Padding | number, px across, 60 % of it above and below | 8 |
| `code.terminal.effects` | Terminal Effects | select: Follow theme, Off, Custom | Follow theme |
| `code.terminal.scanlines` | Scanlines | select: Follow theme, On, Off | Follow theme |
| `code.terminal.scan-strength` | Scanline Strength | slider | 0.30 |
| `code.terminal.glow` | Phosphor Glow | select: Follow theme, On, Off | Follow theme |
| `code.terminal.glow-strength` | Glow Strength | slider | 0.45 |
| `code.terminal.crt` | Full CRT | toggle | off |
| `code.terminal.curvature` | Screen Curvature | slider | 0.08 |
| `code.terminal.burn-in` | Burn-In | toggle, within Full CRT | on |
| `code.terminal.noise` | Screen Noise | slider | 0.035 |
| `code.terminal.flicker` | Flicker | toggle | off |
| `code.terminal.flicker-amount` | Flicker Amount | slider, never above 0.03 | 0.02 |
| `code.terminal.inactive-dim` | Dim Terminals I'm Not In | select: Follow theme, On, Off | Follow theme |
| `code.terminal.smooth-scroll` | Smooth Scrolling | select: Follow theme, On, Off | Follow theme |
| `code.terminal.bell` | Terminal Bell | select: Follow theme, Visual, Off | Follow theme |
| `code.terminal.sixtyfour-scan` | Sixtyfour Scanlines | slider, -53 to 100 | none |
| `code.terminal.sixtyfour-bleed` | Sixtyfour Bleed | slider, 0 to 100 | none |

With the five amended rows that carry the scheme, font, size, copy-on-select and sticky-header fields, every field of F3-642 has exactly one row. A field that reads Follow theme, Font default or none falls through to the look's default (for the scheme, font and effects, the per-look defaults of F3-642 and F3-644); none is a value the sources have not settled yet, listed for the next installment. Scanlines and Phosphor Glow left on Follow theme draw what the look draws: on in Retro dark, off elsewhere (F3-643).

What shows when (the visibility rule of the presentation rework, section 5): Background Color only while Terminal Background is Solid color; Background Gradient only while it is Gradient; Background Image, Background Image Dimming and Background Image Blur only while it is Image; Custom Background Image only while Background Image is Custom; Terminal Opacity (Glass) only under a Glass theme, as SSYS-010's family-specific rows; Scanlines, Phosphor Glow, Full CRT and Flicker only while Terminal Effects is Custom; Scanline Strength while Scanlines is On, Glow Strength while Phosphor Glow is On, Screen Curvature, Burn-In and Screen Noise while Full CRT is on, and Flicker Amount while Flicker is on; Sixtyfour Scanlines and Sixtyfour Bleed only while Terminal Font is Sixtyfour. A hidden row keeps its stored value. No row turns an effect on where F3-643 keeps it off: effects run only in the focused terminal and stop when it is idle, every moving part (cursor blink and trail, smooth scrolling, burn-in, noise, flicker, the bell's flash) stops under Reduce Animations and on battery saver, and the no-GPU path draws what F3-643 says it can.

Where the terminal rows sit (SSYS-040's Editor & Terminal groups). Terminal: Default Shell Profile, Starting Folder, Run When a Terminal Opens, Before Closing a Busy Terminal, Terminals When Reopening a Project. Terminal look: Terminal Colors, Switch With Light and Dark, Minimum Text Contrast, Import a Color Scheme, Terminal Font, Terminal Text Size, Terminal Line Spacing, the three cursor rows, the background rows except the blur, Terminal Opacity (Glass), Terminal Effects and the effect rows, Dim Terminals I'm Not In, Smooth Scrolling and Terminal Bell. Terminal look: more options (folded): Terminal Text Weight, Letter Spacing, Ligatures, Bold As Bright, Font Rendering, Terminal Padding, Background Image Blur and the two Sixtyfour rows. Terminal output & history holds Keep Command Titles Visible, Search in Terminal and Saved Terminal Output, and Copy & paste keeps Copy When I Highlight and Right-Click to Paste. Terminal: more options keeps Allowed Shell Profiles, Rendering Mode, Shell Integration, Performance Mode and Terminal Debug Logging.

How the older group names of `Plans/FinalGUISpec.md#F3-121` map onto these: Appearance is Terminal look and Terminal look: more options; layout and Workspaces retires with the terminal's own layouts (its two layout rows retire above, Terminals When Reopening a Project sits in Terminal, and panels and named layouts are App & Input › Window & panels); Shell and Startup is Terminal, with Allowed Shell Profiles in Terminal: more options; Interaction is Copy & paste and Terminal output & history, less the retired Explain What Commands Do and Tab Purpose Hints; Diagnostics is Terminal: more options.

### SSYS-050 - Panels, Tabs, Editor And Chat Column Rows, And The Rows The Redesign Retires

```yaml
plan_unit_id: SSYS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings binds the universal panels, their tabs, the editor and the chat column through these rows (DL-180,
  DL-181), each an ordinary Settings value bound to one Project (SSYS-002, SSYS-004) that applies live: it commits
  through cmd.settings.transaction.preview then cmd.settings.transaction.apply over its exact id, the surfaces
  that read it take the new value at once, no row carries a restart badge, a row that says how something starts
  governs the next start, and no Settings change opens, closes, moves or rearranges a panel or tab already open
  (SSYS-042). Settings never writes the Home layout record (Plans/storage-plan.md#SP-330): the split tree, the
  tabs, collapse and lock, and the chat column's width, pinned History and popped-out state are layout state.
  Added: general.startup.starting-layout (Home, Build, Terminals 2x2 or Focus; Home), general.interaction.chat-keep-open
  ("Keep the chat open in narrow windows"; off), general.interaction.chat-history-list (Flyout or Pinned, the
  start for a workspace with no saved choice; Flyout), general.interaction.preview-tabs (on),
  general.interaction.tab-sizing (Shrink to fit, F3-631's cascade, or Fixed width; Shrink to fit),
  code.editing.font-family (JetBrains Mono, Atkinson Hyperlegible Mono or System monospace; JetBrains Mono in every
  look), code.editing.font-size (13), code.editing.line-height (no settled default yet), code.editing.minimap (on),
  code.editing.sticky-scroll (on) and code.editing.diff-layout (Automatic, side by side when the tab is wide and
  inline when narrow, or a fixed choice; Automatic). Amended: general.interaction.dashboard-widgets opens the Home
  dashboard tab's own widget picker and stores no widget layout, every dashboard tab keeping its own (WS-030);
  general.interaction.max-editor-tabs (25) counts editor tabs across the workspace and closes only the least
  recently used editor tab that is not pinned and has no unsaved changes; general.startup.max-persisted-tabs (50)
  applies to tabs of every kind; general.startup.reset-home-layout reads Restore home layout, the title bar's
  words, and routes to cmd.workspace_layout.reset, which keeps every open tab; general.startup.window-state is
  the restore-layout-at-start choice; code.editing.word-wrap applies in every editor tab; code.terminal.layout-restore
  decides whether a saved layout's terminal tabs come back as SMPFS-180 says, a session verified still running
  always coming back. Retired, by the inventory's own (Superseded by ...) convention, kept as lineage, drawn
  nowhere and read by nothing: general.interaction.panel-dock, general.visual.chat-layout-mode (being popped out
  is a window state the layout record keeps, so the row retires whole), code.terminal.layout-style,
  code.terminal.auto-second-pane, code.editing.editor-strip-collapsed, code.terminal.explanations (D19, the
  Teacher persona explains commands in the chat) and code.terminal.tab-role (shell profiles and the tab label). The chat width, revealing an already open file, an empty panel's
  fate, what "+" does and the close button's side are not rows. With SSYS-051's thirty-six rows, the inventory
  holds 963 rows (916 plus 47 added), of which 7 are retired, leaving 956 live rows.
gui_related: true
gui_classification_reason: Each row is a visible Settings control for the home panels, tabs, editor or chat column, and the retirements remove visible rows.
split_recommended: false
depends_on: [DL-180, DL-181, DL-183, SSYS-002, SSYS-004, SSYS-009, SSYS-040, SSYS-042, F3-630, F3-636, F3-637, F3-639]
unblocks: []
acceptance_criteria:
  - "A census of Plans/settings_inventory.json finds 963 unique ids in 12 categories; the 7 rows retired here end their descriptions with (Superseded by ...) and render on no page, in no manager and in no search result, leaving 956 live rows."
  - "The eleven added rows exist once each with their listed type, choices and default, scope global, and a valid category.subgroup.key id."
  - "Changing any added or amended row applies at once with no restart badge, and no Settings change opens, closes, moves or rearranges a panel or tab that is already open."
  - "No row writes the Home layout record: dragging the chat's width, pinning History and popping the chat out change only the layout record, and Chat History List decides only how a workspace with no saved choice starts."
  - "Restore home layout reads the same in Settings and the title bar's Home menu, asks one plain question, dispatches cmd.workspace_layout.reset and keeps every open tab."
  - "Max Open Editor Tabs counts only editor tabs and never closes a pinned tab, a tab with unsaved changes or a tab of another kind; Tabs Remembered Between Sessions counts tabs of every kind."
  - "A terminal session verified still running comes back in its tab whatever Remember Window Layout and Terminals When Reopening a Project say."
  - "No row exists for the chat width, revealing an open file, closing an empty panel, the + button's behaviour or the close button's side."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - jq and schema census over Plans/settings_inventory.json
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: settings_inventory_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D2, D3, D4, D5, D7, D10, D11, D19, D21)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (settings keys and named layouts; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 12, the settings model; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 6.4)"
preserved_exact_tokens:
  - "Restore home layout"
  - "Keep the chat open in narrow windows"
  - "(Superseded by ...)"
  - "963"
  - "956"
  - "cmd.workspace_layout.reset"
negative_constraints:
  - Do not write the Home layout record from Settings, or keep the chat's width, History pin or pop-out as a Settings value.
  - Do not delete or reuse a retired inventory id, and do not draw, search or transfer a retired row.
  - Do not open, close, move or rearrange an open panel or tab from Settings, except by routing to cmd.workspace_layout.reset.
  - Do not close a terminal, browser, dashboard or other non-editor tab to honour a tab cap.
  - Do not copy the concepts' settings keys into the inventory as ids.
owner_hints:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
stale_retired_dispositions:
  - "Retired 2026-10-09 (DL-180, DL-181): general.interaction.panel-dock, general.visual.chat-layout-mode, code.terminal.layout-style, code.terminal.auto-second-pane, code.editing.editor-strip-collapsed, code.terminal.explanations and code.terminal.tab-role."
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Settings_System.md#SSYS-040, ContractName:Plans/Settings_System.md#SSYS-042, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/UI_Command_Catalog.md#UCC-200

### SSYS-051 - Terminal Look Rows On The One Appearance Model

```yaml
plan_unit_id: SSYS-051
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings > Terminal binds the terminal's one appearance model (Plans/FinalGUISpec.md#F3-642,
  Plans/DRY_Rules.md#DR-068; DL-183) with one row per field, each applying live with no restart badge: the restart
  badges on code.terminal.theme and code.terminal.font-family are removed. The model resolves field by field: the
  look's defaults ("Follow theme"), the app default, the project default, then the tab's override. Each row is a
  field's project default, held, like every Settings value, in the open Project's settings snapshot (SSYS-002), and
  only Settings writes it, through cmd.settings.transaction.preview then cmd.settings.transaction.apply over its
  exact id. The app default, which Settings > Terminal and the Appearance popover's All terminals write (F3-642),
  follows SSYS-028's rule for ELI5's All chats: until an app-wide store is admitted (the open question SSYS-028
  records as q-035), a field's app default is the row's bundled inventory default and both app-default edits are
  disabled with the Settings owner's reason, their editable requirement kept and no app-wide write admitted from
  scope metadata alone. The tab's override is the tab's serialized state (SP-331), written by the popover's This
  terminal, never by Settings. Amended rows carry five fields: code.terminal.theme (Follow theme or
  one of the 34 schemes or an imported one; Follow theme), code.terminal.font-family (Follow theme, JetBrains Mono,
  Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or System monospace; Follow
  theme), code.terminal.font-size (Font default), code.terminal.copy-on-select (off) and code.terminal.sticky-header
  (on). Added rows carry the rest: code.terminal.scheme-pair (on), min-contrast (Off, 3:1, 4.5:1 or 7:1; 4.5:1),
  import-scheme (an action), font-weight (400), line-height (Font default), letter-spacing (0), ligatures (on),
  bold-bright (off), cursor-shape, cursor-blink (on), cursor-trail, background (Follow theme, theme surface,
  solid, gradient or image) with background-color, background-gradient, background-image, background-image-file,
  background-dim (0.45) and background-blur (0, made once on the picture), opacity (Glass; Follow theme, 70 % light
  and 74 % dark), padding (8), effects (Follow theme, Off or Custom) with scanlines, scan-strength (0.30), glow,
  glow-strength (0.45), crt (off), curvature (0.08), burn-in (on), noise (0.035), flicker (off) and flicker-amount
  (0.02, never above 0.03), inactive-dim, smooth-scroll, bell (Follow theme, Visual or Off), sixtyfour-scan and
  sixtyfour-bleed; a field without a settled default falls through to the look. Detail rows show only while the
  row they depend on makes them apply, and no row turns on what F3-643 keeps off: effects run only in the focused
  terminal, and every moving part stops under Reduce Animations and on battery saver. The rows sit in SSYS-040's
  Terminal look group, the finer ones in Terminal look: more options, and F3-121's older group names map onto
  SSYS-040's groups as this addendum records. Also amended: code.terminal.shell (the default shell profile),
  code.terminal.allowed-profiles (shells, named profiles and SSH computers, as the "+" menu and New terminal list
  them), code.terminal.right-click-paste (off; a right click opens the terminal's menu), code.terminal.rendering-mode
  (render modes only, never colours, fonts or effects), code.terminal.shell-integration (a switch),
  code.terminal.search (find is in every terminal, Ctrl+Shift+F, so the switch shows on and unavailable and nothing
  reads it) and code.terminal.transcript-retention (Saved Terminal Output: Keep Saved Scrollback, the default, keeps
  the saved scrollback of Plans/storage-plan.md#SP-332 that restore brings back, or Session Only, which saves none). Degauss and
  a terminal's Text size zoom are not rows.
gui_related: true
gui_classification_reason: Each row is a visible Settings > Terminal control whose change shows at once in every terminal.
split_recommended: false
depends_on: [DL-181, DL-182, DL-183, DR-068, SSYS-002, SSYS-009, SSYS-028, SSYS-040, SSYS-050, SP-332]
unblocks: [F3-120, F3-121, F3-642, SP-331]
acceptance_criteria:
  - "Every field of F3-642 has exactly one inventory row, each with the default listed here, scope global and project, and no terminal row carries a restart badge."
  - "Changing a row changes every open terminal at once unless that terminal's own override sets the field, and a field left at Follow theme, Font default or no default falls through to the look's default."
  - "Only Settings writes a row (the project default), through the Settings transaction over its exact id; only the popover's This terminal writes a tab override, and Settings never does."
  - "While q-035 is open, a field's app default is the row's bundled inventory default, the app-default edit in Settings > Terminal and the popover's All terminals are disabled with the Settings owner's reason, and no surface writes an app-wide value."
  - "Terminal Colors offers Follow theme and the 34 schemes of F3-642 plus imported ones; Terminal Font offers Follow theme, the six built-in faces and System monospace; Minimum Text Contrast offers Off, 3:1, 4.5:1 and 7:1."
  - "Each detail row shows only while the row it depends on applies, keeps its stored value while hidden, and Terminal Opacity (Glass) shows only under a Glass theme."
  - "With any row set, effects stay in the focused terminal and every moving part stops under Reduce Animations and on battery saver."
  - "Settings shows the terminal rows under SSYS-040's groups and Terminal look: more options, with no row for degauss or the Text size zoom."
  - "Search in Terminal shows on and unavailable because Find is in every terminal, and nothing reads its stored value."
  - "Saved Terminal Output offers Keep Saved Scrollback (the default) and Session Only; with the default a restored or reopened terminal shows its saved scrollback by SP-332's rule, and no choice keeps it longer than SP-332 allows."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - jq and schema census over Plans/settings_inventory.json
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: settings_inventory_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-183"
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-182"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D13, D15, D16, D17)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256 1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299 (D17a)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 2, 4, 5 and 6 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (Appendix E)"
preserved_exact_tokens:
  - "Follow theme"
  - "All terminals"
  - "This terminal"
  - "4.5:1"
  - "Terminal look: more options"
  - "Sixtyfour Raster"
negative_constraints:
  - Do not keep a second terminal theme, font or effect store beside the one appearance model.
  - Do not show a restart badge on any terminal row.
  - Do not write a terminal tab's override from Settings, or an app-global value from any surface.
  - Do not write a row, the project default, from the Appearance popover; its All terminals edit stays disabled while q-035 is open.
  - Do not let a row turn on motion that Reduce Animations, battery saver or the no-GPU path keeps off.
  - Do not offer a face that is not built in under the licence rule of F3-644, other than System monospace, which uses the computer's own monospace face.
owner_hints:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
stale_retired_dispositions:
  - "Superseded 2026-10-09 (DL-183): the restart badges on code.terminal.theme and code.terminal.font-family, the six-entry colour list, and Fira Code, SF Mono and Custom as terminal fonts."
  - "Superseded 2026-10-09 (DL-182): code.terminal.transcript-retention's Session Only default and its 24 Hours, 7 Days, 30 Days and Forever choices, which SP-332's saved scrollback rule replaces."
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/DRY_Rules.md#DR-068, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/Settings_System.md#SSYS-028, ContractName:Plans/UI_Command_Catalog.md#UCC-201
