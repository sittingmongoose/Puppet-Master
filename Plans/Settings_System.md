# Settings System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes shared envelopes and owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for the Settings surface, project-setting persistence semantics, Settings search and row behavior, Settings transfer, Settings manager grammar, and Settings-to-owner routing. Domain managers retain their runtime, security, storage, provider, Server, Project Sync, Browser, source-control, testing, and recovery truth.

## 0. Scope

Settings is a project-bound system with three coordinated layers:

1. the K3 Tome Tabs Settings shell;
2. the 828 ordinary setting rows in `Plans/settings_inventory.json`; and
3. the full manager system for setup, policy, defaults, human-readable status, diagnostics, repair entry points, and owner-routed operational work.

`Plans/settings_system_contracts.schema.json` is the strict Draft 2020-12 shape owner for Settings-owned records. `Plans/settings_system_contract_fixtures.json` freezes the five Settings command contracts, five route-only Onboarding/Guided Tour/Doctor UI actions, the 38-entry manager registry, three named visible-state projections, exact dispositions for all 80 older-packet command tokens, and positive/negative contract fixtures. Those machine files are canonical Plans contracts but remain schema/fixture evidence only; they do not prove a registered handler, production wiring, persistence execution, native rendering, or certification.

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
- the production acceptance obligations for a future Rust + Slint Settings implementation.

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
| Docker/Podman/Kubernetes/registries | `Plans/Containers_Registry_and_Unraid.md` | Ordinary rows redirect to Docker Manager or Docker/Hosts; Settings does not embed container operations. |
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
  hydration merely because a search row is visible. Long or localized content expands rather than clipping.
gui_related: true
gui_classification_reason: Search, facets, highlighting, keyboard selection, and virtualized rows are user-visible interactions.
depends_on: [SSYS-003, SSYS-004, F3-433]
unblocks: [SSYS-017]
acceptance_criteria:
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
  Hidden origin/breadcrumb metadata may preserve return context. A visible Back, Close, or breadcrumb is not required;
  Settings must remain keyboard-escapable through the host's standard navigation contract without adding geometry.
gui_related: true
gui_classification_reason: This unit defines visible row, inspector, manager, state, help, and navigation grammar.
depends_on: [SSYS-003, SSYS-004]
unblocks: [SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015]
acceptance_criteria:
  - Every ordinary row exposes value, source, Project scope, availability, validation, Help/Details, and effect timing.
  - Every manager implements the shared semantic states without pretending status, action, and persisted value are equivalent rows.
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
canonical_text: >-
  Copy Settings From Another Project is a one-time detached exact-ID transaction. The user selects broad categories,
  preview resolves each category to an immutable sorted setting_id set and source/destination revisions, and the UI
  shows a redacted diff, source Project, provenance, exclusions, conflicts, validation, and rollback plan before apply.
  The ten stable selector IDs are appearance_workspace, assistant_chat, providers_accounts_models_routing,
  planning_goal, orchestrator_automation, tools_integrations, testing_browser_devices, permissions_security,
  memory_retention_history, and notifications_usage_budgets. Apply creates a destination restore point, validates and
  atomically writes only the previewed IDs, reads back, emits a durable result, and rolls back on failure. The destination
  is independent immediately: no inheritance, live link, or later source propagation exists.
gui_related: true
gui_classification_reason: Category selection, preview, diff, provenance, confirmation, result, and rollback are visible flows.
depends_on: [SSYS-002, SSYS-004, SSYS-008, SSYS-009]
unblocks: [SSYS-017]
acceptance_criteria:
  - Preview and apply bind the exact source/destination Project IDs, revisions, category IDs, and sorted setting IDs.
  - Credential-bearing IDs and owner-excluded IDs are listed as excluded and never copied.
  - Stale preview, validation failure, commit/read-back failure, or cancellation produces no partial destination mutation.
  - Later source changes cannot affect the destination.
validation_surfaces: [future settings transfer positive and negative fixtures, future rollback fixtures]
risk_class: settings_transfer_leak_or_partial_apply
reasoning_tier: high
context_scope: project_settings_transfer
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, future Settings transfer service]
node_compile_hint: {mode: detached_settings_transfer_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/SERVER_BACKBONE_SETTINGS_RETURN.md
  - source_ref:chat:settings-canonical-owner-lane-2026-08-31
preserved_exact_tokens: [Copy Settings From Another Project, exact-ID, preview, diff, provenance, rollback, no inheritance]
negative_constraints: [Do not copy raw credentials or credential-store contents., Do not copy unpreviewed IDs., Do not create continuous inheritance., Do not expose hundreds of per-ID merge choices as the primary flow.]
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Permissions_System.md]
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
  alpha/transparency, tooltip enablement, reduced-motion request, background selection, and chat layout. The eight built-in variants are Friendly Dark, Friendly
  Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, and Basic Light. Final GUI owns the untouched
  first-open/fresh-Project Basic Dark factory selection; Settings consumes that seed only when no committed Project theme
  exists. Existing explicit selections and copied detached snapshots win. No-Project rendering is ephemeral Basic Dark.
  Theme family plus mode apply as the SSYS-009 atomic pair. Glass
  controls remain visible with `not_applicable` under non-Glass families; Glass alpha never drops below 0.35 in Dark or
  0.45 in Light. Appearance preview is non-persistent and reverts on cancel, close, expiry, route change, or Project switch;
  apply uses the same preview hash and atomic transaction as every other Settings change. Disabling hover tooltips never
  removes keyboard-focus accessible descriptions or Help/Details. Effective reduced motion is true when either the Project
  request or platform preference is true; it calms nonessential entrance, hover, parallax, shimmer, and background motion
  while retaining focus, progress, error, and state-change feedback. Background, transparency, and chat layout apply to the
  current Project only and never leak through app-global local storage.
gui_related: true
gui_classification_reason: Themes, Glass composition, backgrounds, and chat layout are directly visible.
depends_on: [SSYS-002, SSYS-009, F3-425]
unblocks: [SSYS-016, SSYS-017]
acceptance_criteria:
  - Switching Projects restores each Project's independent appearance and chat-layout snapshot.
  - Eight built-in variants remain available and fresh/no-Project defaults are distinct.
  - Non-Glass contexts disclose why Glass-only controls are unavailable instead of hiding them.
  - Preview writes no durable value and every non-apply exit restores the committed Project appearance.
  - Tooltip-off and reduced-motion tests preserve accessible descriptions, Help/Details, focus, progress, error, and state feedback.
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
negative_constraints: [Do not persist appearance or chat layout outside the Project settings namespace., Do not hide unavailable Glass controls., Do not make no-Project Basic Dark durable., Do not remove accessible descriptions when hover tooltips are off., Do not suppress progress or error feedback under reduced motion.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
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
gui_related: true
gui_classification_reason: Install, Repair, Verify, disabled reasons, exact target, progress, and return context are visible provider-manager behavior.
depends_on: [SSYS-006, SSYS-008, CS-066, UCC-145, SIR-003]
unblocks: [SSYS-015, SSYS-017]
acceptance_criteria:
  - Install, Repair, and Verify dispatch only the registered IDs and exact handlers.
  - Each action carries exact Host/Environment, Project, expected revision/epoch, idempotency, permission, and continuation evidence required by CS-066.
  - A missing or invalid owner selector renders the exact disabled reason and dispatches nothing.
  - Provider Uninstall is absent from rendered controls, command lookup, natural-language suggestions, and automation routes.
validation_surfaces: [existing CS-066 and UCC-145 fixtures, future Settings provider-card availability and continuation fixtures]
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
  Browser and SCM are Settings dependency and routing surfaces, not embedded operational workbenches. Settings may show
  ordinary PM-native Browser policy, readiness, capture/retention policy, agent-sharing policy, and routes to the
  Browser owner; protected AuthBrowserSession remains human-only, ephemeral, non-capturable, non-automatable, and absent
  as an ordinary tab. Source Control settings show tool/forge/account/environment/worktree/default/safety/repair state
  and route repository, diff, commit, branch, history, graph, provider-neutral Actions & Pipelines, and SSH operations
  to their owners. Repository hosting and automation bindings remain independent; Forgejo and Gitea are distinct
  provider/instance profiles rather than one API-compatible alias. Container
  ordinary rows and search results redirect to Docker Manager or Docker/Hosts; Settings embeds no Docker, Podman,
  Kubernetes, registry, runtime, log, exec, publish, or workload operational UI.
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
  merge or own their state machines. `settings.onboarding.open`, `settings.onboarding.run_again`, and
  `settings.guided_tour.replay` are route-only UI actions over `cmd.settings.open`; they target the
  `onboarding-guided-tour` manager with exact detail IDs `overview`, `run-onboarding-again`, and `replay-guided-tour`.
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
  - The five route-only UI action IDs validate against the machine fixture and preserve exact return context.
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
preserved_exact_tokens: [Product Onboarding, Installation and Deployment, Server Claim and Bootstrap, operational Doctor workspace, Guided Tour, Check now, Details, Logs, Receipt, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.remediation.open, continuation, domain_owner_only, no private mutation]
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
  Readiness and Setup; Teacher and Help; Project Search Index; and DRY Method visible state. Each entry has one stable manager_id, owner route, lazy summary projection, supported actions,
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
  Concepts/pm7-tools/settings_tome_source.py, composed by Concepts/pm7-tools/build_pm7.py, and emitted as
  Concepts/PMConcept7.html; the generated HTML is never the authored production owner. T44 may demonstrate the K3
  geometry, 828-row projection, later-packet manager additions, project/no-Project defaults, and command previews, but
  fixture state, local browser storage, simulated receipts, and JavaScript handlers are not runtime proof. Production
  targets Rust stable and Slint 1.17.1 using typed models, host-width layout states, variable-height virtualization,
  explicit properties and focus state, precomputed theme tokens, native animations, and opaque or pre-blurred known
  assets. DOM selectors, :has, viewport-width CSS, localStorage, color-mix, arbitrary backdrop blur, and CSS/JS motion
  are translation inputs, not production dependencies. This direction makes no portability, build, runtime, visual,
  performance, accessibility, or certification claim.
gui_related: true
gui_classification_reason: This unit governs the visual concept lineage and future Slint implementation direction.
depends_on: [SSYS-003, SSYS-010]
unblocks: [SSYS-017]
acceptance_criteria:
  - PMConcept7 is reproducibly generated from authored transforms and is labeled concept_fixture_only.
  - Production implementation does not hand-port browser persistence or DOM/CSS-only mechanisms as runtime architecture.
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
  loading, and Slint 1.17.1 build/runtime behavior. Schema/text/static checks are findings only and cannot prove runtime,
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
  settings.guided_tour.replay, settings.doctor.open, and settings.doctor.remediation.open all dispatch cmd.settings.open;
  they authorize navigation only and never execute Onboarding, tour, probe, repair, or remediation work.
gui_related: true
gui_classification_reason: This unit defines visible Settings navigation, deterministic close/Escape behavior, and focus/query/scroll restoration.
depends_on: [SSYS-006, SSYS-014, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
  - Setting and manager routes are mutually exclusive and use stable IDs rather than labels or DOM selectors.
  - Exact return restores focus, query, and scroll only when continuation generation and context still match.
  - The five route-only UI actions use the frozen manager/detail targets and authorize no owner operation.
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
preserved_exact_tokens: [settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.open, settings.doctor.remediation.open, close_transient, close_details, clear_query, return_to_opener]
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
  The K3 Toolchain and Extensions workspace retains one Plugins tab inside the existing split-manager geometry and
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

Settings semantically registers the five command IDs in SSYS-018 and the five route-only UI action IDs in SSYS-019. Central command/catalog/wiring owners must consume those exact contracts; until they do, the action is disabled with `command_not_registered` or `handler_unavailable` and dispatches nothing. Settings registers no EventRecord family. If a retained owner requires persistence through EventRecord, its family must be independently admitted through Event Authority; absence remains `missing_event_registration`, never success.

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

Project theme and layout changes update the active Project shell only after atomic acceptance. `pm.settings_appearance_preview.v1` may temporarily paint a candidate Project appearance but writes nothing and reverts on cancel, close, expiry, route change, or Project switch. Title bar, status bar, bottom panel, Chat, and Settings consume the same committed effective Project theme snapshot; no surface keeps a second local theme authority.

The theme family/mode pair yields exactly eight built-in variants. Glass background mode is `Mesh`, `Depth`, or `Minimal`; Glass alpha is bounded to 0.35..1.0 for Dark and 0.45..1.0 for Light, and non-Glass families keep the controls visible but disabled with `not_applicable`. `general.interaction.show-tooltips=false` suppresses hover hints only; focus descriptions and Help/Details remain. Effective reduced motion is the logical OR of Project request and platform preference and calms nonessential movement without suppressing progress, focus, error, or state-change feedback.

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
- register the five accepted Settings commands and five route-only UI actions without token drift in Commands, Catalog, UI Wiring, production Wiring Matrix, handlers, selectors, reverse wiring, and fixtures;
- admit required EventRecord families individually, if their owners require persisted events;
- integrate the `Plans/Backup_Restore_System.md` command families through central registration, sole handlers, production wiring, storage/event admission, and runtime backup/restore drills; and
- implement and independently verify the Rust + Slint Settings system.

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

One reuse was found and is recorded rather than duplicated: `general.interaction.chat-eli5` already exists as the per-conversation ELI5 override. It is preserved unchanged, and the packet's `assistant.chat.eli5_default` is registered as the distinct application default `general.interaction.eli5-default`. The per-chat toggle continues to win for a chat the user has changed.

The pre-existing `branching.crew.crew-enabled` toggle is preserved as the master Crew enable. The retired model in which Crew was *only* that switch is superseded by the configuration settings below; a Crew run now requires a committed configuration regardless of the toggle.

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
| `branching.crew.crew-auto-enabled` | Crew Auto | `toggle` | `false` | `multi-agent-workflows.crew` | `assistant.multi_agent.crew.auto_enabled` |
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
  Fifty new settings are registered in Plans/settings_inventory.json under the existing twelve categories, because this inventory derives a setting's category and subgroup from its ID prefix. The packet's assistant.* and browser.* spellings are reconciled to those canonical IDs and retained as search aliases on the canonical entry; a packet spelling receives no second inventory row, no peer control, and no independent persistence identity. A census found one genuine reuse: general.interaction.chat-eli5 already exists as the per-conversation ELI5 override and is preserved unchanged, while the packet's application default is registered separately as general.interaction.eli5-default with the per-chat toggle still winning for a chat the user has changed. The pre-existing branching.crew.crew-enabled toggle is preserved as the master Crew enable, and the retired model in which Crew was only that switch is superseded because a Crew run now requires a committed configuration regardless of the toggle.
gui_related: true
gui_classification_reason: Each registered setting is a rendered control in a Settings pane with a category, subgroup, and tier.
depends_on: [SSYS-027]
unblocks: []
acceptance_criteria:
  - All fifty settings exist once each with a valid category, subgroup, type, default, scope, and tier.
  - Every packet spelling resolves to exactly one canonical entry through its search aliases.
  - No packet spelling receives its own row or persistence identity.
  - The existing chat-eli5 override and crew-enabled toggle are preserved rather than duplicated.
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
preserved_exact_tokens:
  - "general.interaction.chat-eli5"
  - "branching.crew.crew-enabled"
  - "proposed_census_required"
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
stored value commits only after configuration confirmation and a successful transaction; a
cancelled or failed commit preserves the prior stored state, and the menu check renders that
stored state rather than an optimistic one.

### CDRY-013 — The Settings boundary

Settings owns the shell, the inventory, project-scoped values, transactions, defaults, and
manager routing. Domain runtimes own their records and operations, and a manager action routes to
its owner. Participant dispositions, run state, schedule state, and progress are never stored as
settings values.
