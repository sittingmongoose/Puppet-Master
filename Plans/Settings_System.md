# Settings System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes shared envelopes and owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for the Settings surface, settings-level persistence semantics, Settings search and row behavior, Settings transfer, Settings manager grammar, and Settings-to-owner routing. Domain managers retain their runtime, security, storage, provider, Server, Project Sync, Browser, source-control, testing, and recovery truth.

## 0. Scope

Settings is one system with three coordinated parts. Ordinary values use the settings ladder in SSYS-002/059:

1. the K3 Tome Tabs Settings shell;
2. the 1010 ordinary setting rows in `Plans/settings_inventory.json`; and
3. the full manager system for setup, policy, defaults, human-readable status, diagnostics, repair entry points, and owner-routed operational work.

`Plans/settings_system_contracts.schema.json` is the strict Draft 2020-12 shape owner for Settings-owned records. `Plans/settings_system_contract_fixtures.json` freezes the five Settings command contracts, six route-only Onboarding/Guided Tour/Doctor UI actions, the 38-entry manager registry, three named visible-state projections, exact dispositions for all 80 older-packet command tokens, and positive/negative contract fixtures. Those machine files are canonical Plans contracts but remain schema/fixture evidence only; they do not prove a registered handler, production wiring, persistence execution, native rendering, or certification.

This owner supersedes prior Settings presentation and ordinary-persistence clauses in `Plans/FinalGUISpec.md`, including the visible search-first shelves/bloom shell in F3-432 and the universal/global or inheritance implications in F3-438, F3-440, F3-442, F3-510, and F3-511. It retains the canonical 1010-ID inventory, the useful F3-433 fuzzy matching behavior, live owner-derived status, typed row renderers, ten built-in themes, and owner-routed deep links where this document incorporates them.

SSYS-002 owns Default → Everywhere → Computer (Device for screen rows) → optional Project → existing owner/chat/run/tab rungs, with Managed above them. SSYS-059 declares exceptions and combine rules; no-Project offered shared/Computer/Device writes work. Basic Dark is bundled fallback or pre-claim ephemeral only. Existing explicit choices and detached copied own values are never overwritten by a fresh seed. Manager objects and operational records remain with their owners.

The selected K3 concept owns the Settings shell geometry only. Later Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread Performance, Onboarding/Doctor Correction, and Settings Bakeoff decisions supersede K3 content, state, persistence, and operational behavior. `Concepts/PMConcept7.html` is a generated concept fixture, not the production GUI or runtime authority.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Settings_System.md` owns:

- the visible Settings shell, information architecture, responsive geometry, search, facets, All Settings list, variable-height virtualization, row/details grammar, and Settings-local focus behavior;
- the settings ladder, offered levels, exact keys/writers, combine operators and one resolver under SSYS-002/059/060;
- fresh-context fallthrough, exact-context first paint and the pre-claim ephemeral fallback;
- atomic ordinary setting mutation, the atomic theme-family/mode pair, Restore Defaults, and Settings transfer behavior;
- the manager registry, shared manager presentation grammar, and routing from Settings into canonical domain owners;
- the semantic request/result/availability contracts for `cmd.settings.open`, `cmd.settings.transaction.preview`, `cmd.settings.transaction.apply`, `cmd.settings.transaction.rollback`, and `cmd.settings.export`, while central command/catalog/wiring owners retain registration and dispatch custody;
- the Settings snapshot, transaction, export, route/return, UI-action, owner-projection, Doctor-projection, migration-preview, appearance-preview, and concept-boundary record shapes;
- the exact boundary between ordinary settings, manager actions, owner status projections, diagnostics, and operational work; and
- the production acceptance obligations for a future Rust Settings implementation (the Slint desktop and the Leptos web client, DL-139).

### 1.2 Retained owners

| Domain | Canonical owner consumed by Settings | Settings role |
|---|---|---|
| Inventory IDs and row metadata | `Plans/settings_inventory.json` and `Plans/settings_inventory.schema.json` | Render and search all 1010 IDs; do not hardcode a second inventory. |
| Theme palettes and shared GUI tokens | `Plans/FinalGUISpec.md` | Select and preview the ten built-in themes; do not fork palette truth. |
| Physical persistence, recovery, and secret-store split | `Plans/storage-plan.md` | Submit exact level-bound settings transactions and show receipts; do not own storage engines. |
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
  Plans/Settings_System.md is the sole owner for the Settings shell, ordinary setting persistence semantics, search
  and row behavior, transfer, manager grammar, and Settings-to-domain routing. The K3 Tome Tabs concept owns selected
  shell geometry only. Later Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread Performance,
  Onboarding/Doctor Correction, and Settings Bakeoff decisions supersede K3 content and behavior. Prior FinalGUISpec
  Settings PlanUnits remain source lineage or owner inputs only where this document incorporates them; they cannot
  reassert the F3-432 shelves/bloom shell, any settings resolution other than the SSYS-002 ladder over this owner.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [K3 Tome Tabs, Server First Backbone, Egolite, Hermes, Origin, Browser, SCM, Full Thread Performance, Onboarding, Doctor, Bakeoff]
negative_constraints: [Do not make a concept fixture the production owner., Do not duplicate a retained domain owner's contract., Do not treat this Plans edit as implementation or certification.]
owner_hints: [Plans/Settings_System.md, Plans/00-plans-index.md, Plans/Crosswalk.md]
```

### SSYS-002 - The Settings Ladder And No-Project Behaviour

```yaml
plan_unit_id: SSYS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Every ordinary value resolves through one settings ladder: Default, Everywhere, the work Computer (or the viewing
  Device for screen rows), Project when present, then the existing owner, chat, run and terminal rungs, with Managed
  above them. SSYS-059 defines offered levels and combine operators; only the one resolver emits pm.settings_effective_value.v1.
  Absence falls through; an own value is never a copied fallback. Everywhere is written by the settings home Server;
  Computer by its Server or the Server dispatching to an Execution Host; Device by that device; per-project own
  values by the actual Project Home Server. SSYS-060 fixes mirrors, currentness and single-writer boundaries.
  Human row changes target the origin under SSYS-063; agents use SSYS-065.

  With no Project open, omit the Project rung: Everywhere, Computer and Device writes remain admitted for rows
  offering them, including when no Projects exist. Project-only operations without a named real Project return
  no_project_context; Settings can still inspect or edit a separately named authorized Project through its real
  writer. Only the pre-claim case with no claimed settings writer is ephemeral Basic Dark and cannot persist.
  Basic Dark remains the bundled fallback when no applicable value exists; Friendly Dark remains a supported variant,
  not a startup seed over an existing choice. New Projects follow resolved defaults unless explicit setup choices
  or detached copied own values apply. Existing explicit values are never overwritten by a fresh seed. A change
  to one Project's own value never changes another Project's own or effective value. q-035 is resolved in current
  canon by the general Everywhere store; ledger source memory is not rewritten.
gui_related: true
gui_classification_reason: Project identity, theme defaults, disabled controls, and no-Project state are visible Settings behavior.
depends_on: [SSYS-001]
unblocks: [SSYS-007, SSYS-009, SSYS-010]
acceptance_criteria:
- Factory, Everywhere, Computer/Device, Project and applicable owner/chat/run/tab cases resolve through the same
  result, including genuine null Project.
- Zero-Project Everywhere and Device changes commit at their actual writers; unnamed Project-level mutations return
  no_project_context without writes.
- Existing explicit and detached copied values survive startup, reopen and Project switching without factory reseeding.
- Project-own edits cannot change another Project; only a deliberate shared-level transaction affects following
  contexts.
validation_surfaces: [future project settings scope fixtures, future no-project negative fixtures]
risk_class: cross_project_settings_leak
reasoning_tier: high
context_scope: settings_ladder_and_no_project
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, future Settings runtime]
node_compile_hint:
  mode: settings_ladder_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
- Plans/FinalGUISpec.md#F3-510
- 'source_ref:projects-pass2-20261103:S1–S3/S7/N12; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [per-project, Friendly Dark, Basic Dark, ephemeral, no_project_context]
negative_constraints:
- Do not store a value at a level its row layering does not offer.
- Do not resolve a value outside the one Settings resolver.
- Do not let two writers hold one level.
- Do not move a value between levels without a previewed transaction.
- Do not apply fresh-Project defaults over an existing Project.
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
  Plans/settings_inventory.json remains the machine authority for the live ordinary setting IDs across 12 categories.
  Settings binds rows to that registry and never substitutes K3 demo data, an embedded PMConcept snapshot, or
  manager pseudo-rows. Managers, one-shot actions, status projections, diagnostics, setup workflows, and unavailable
  capabilities are typed searchable destinations outside the ordinary-setting denominator and route to their owners.
  The inventory layering field alone determines offered levels under SSYS-059. The legacy scope field remains
  owner-rung metadata; its global/project members are not storage authority. The 1010 rows are the starting census;
  additions require a recomputed exact count across the existing 12 categories. Amended Q22, Jared 2026-10-30
  (DL-257): the current family/variant and inventory census supersede earlier counts. Historical census token
  1011 is retained solely as pre-Q22 lineage. Q22/QA2 registry join (DL-257/DL-258): settings_inventory.retired_input_ids
  names migration-only historical keys outside the active settings array. It contains general.visual.nier-mode,
  is disjoint from active row IDs, adds no ordinary row/control/writer and does not count in the 1010-row census.
  Placement retirement validation may consume this explicit catalog; arbitrary unknown IDs remain errors, and
  current Settings request IDs still reject the retired key.
gui_related: true
gui_classification_reason: The inventory and destination-type split determines visible search results and Settings content.
depends_on: [SSYS-001, F3-441]
unblocks: [SSYS-005, SSYS-006, SSYS-015]
acceptance_criteria:
- A registry census finds the recomputed unique live ID count across 12 categories, including only admitted additions.
- The rendered ordinary-setting denominator matches the registry exactly.
- Manager/action/status/diagnostic/setup/unavailable results carry a non-setting result type and do not inflate
  1010.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [1011, 12 categories, ordinary settings, managers]
negative_constraints:
- Do not use K3 demo rows as runtime authority.
- Do not count managers as ordinary settings.
- Do not derive offered levels from legacy scope metadata.
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
  exposure, control type, reviewed layering metadata, owner-derived status, result type, Changed, Set here, Varies,
  Per computer and Per project without changing the registry-derived ordinary-ID denominator. The ordinary list
  uses variable-height virtualization with stable setting_id keys, cached measured heights, anchor-plus-offset
  preservation, overscan, latest-generation cancellation, and no manager hydration merely because a search row
  is visible. Long or localized content expands rather than clipping. Category group headers are rows of the same
  virtualized model, measured like any row and never a separate non-virtualized wrapper, and the list may scroll
  with the page rather than inside a fixed-height box (USER-SETTINGS-MANAGER-REFRESH-20260908). Amended Q22, Jared
  2026-10-30 (DL-257): the current family/variant and inventory census supersede earlier counts.
gui_related: true
gui_classification_reason: Search, facets, highlighting, keyboard selection, and virtualized rows are user-visible interactions.
depends_on: [SSYS-003, SSYS-004, F3-433]
unblocks: [SSYS-017]
acceptance_criteria:
- Category group headers belong to the virtualized model and the scroll anchor survives group expansion.
- Search results are deterministic for the same registry, status generation, query, and facet set.
- Arrow navigation, Enter focus, Escape clearing, pointer activation, and screen-reader result announcements retain
  one active stable ID.
- Variable-height tests preserve the anchor across expansion, wrapping, status changes, theme changes, and facet/search
  changes.
- Searching the full inventory does not instantiate or probe every manager.
validation_surfaces: [future fuzzy-search fixtures, future variable-height virtualization tests, future accessibility tests]
risk_class: settings_search_or_virtualization_drift
reasoning_tier: high
context_scope: all_settings_search
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings models and list components]
node_compile_hint: {mode: settings_search_virtualization_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Plans/FinalGUISpec.md#F3-433
- Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/reference/PERFORMANCE_SETTINGS_RETURN.md
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  An ordinary row shows human title, concise explanation, current requested/effective value/state, Changed when
  the effective value differs from Default, the origin-word Details action under SSYS-063, default/source, availability,
  restart or reconnect requirement, owner-derived validation/error, and Help/Details. Auto, Default, Recommended,
  Not configured, Managed, Custom, Unavailable, and Effective value differs and Varies are explicit states rather
  than empty values. Managers reuse header, search/filter, primary setup action, health summary, resource list,
  detail/inspector, requested/effective state, loading/empty/failed/unavailable/managed states, and logs/receipts
  routes. Each manager uses a concise task-specific introduction and one primary placement for each action in
  the current view; repeated chapter prose, identical index parent/child destinations, and shortcut panels that
  merely repeat adjacent tabs are not required chrome. Every manager renders through one shared kit: no header-level
  action strip, at most six tabs, exactly one labeled Advanced disclosure per view, one quiet bottom action row,
  exactly one check control per connectable entity, and the shared side-panel anatomy (USER-SETTINGS-MANAGER-REFRESH-20260908).
  Secondary explanations, detailed provenance, and advanced configuration use labeled keyboard-operable disclosures
  or their dedicated detail/tab. Collapsing secondary material never hides a blocking error, unavailable reason,
  consent boundary, requested/effective difference, or live-versus-example distinction. Sound preview and explicit
  notification test-send consume F3-405 rather than sharing a simulated delivery-success presentation. Hidden
  origin/breadcrumb metadata may preserve return context. The Settings shell need not add Back or breadcrumb chrome.
  The Details inspector has a visible labelled Close, retains the host Escape order, and restores focus under
  SSYS-063. The row, Details current/default line, search and result toast use the same owner formatter and effective
  display floor. A fractional Glass transparency of 0.56 reads 56%, and an owner-clamped value has the same displayed
  result in every consumer; formatting alone does not rewrite storage.
gui_related: true
gui_classification_reason: This unit defines visible row, inspector, manager, state, help, and navigation grammar.
depends_on: [SSYS-003, SSYS-004]
unblocks: [SSYS-011, SSYS-012, SSYS-013, SSYS-014, SSYS-015]
acceptance_criteria:
- Every ordinary row exposes its value, Changed and origin-word Details action; its panel exposes source level,
  exact target, availability, validation and effect timing.
- Every manager implements the shared semantic states without pretending status, action, and persisted value are
  equivalent rows.
- Manager curation preserves stable destinations and action availability while removing duplicate in-view navigation
  and actions; secondary controls remain discoverable and keyboard-operable.
- Advanced disclosures do not suppress actionable warnings, permission or consent boundaries, owner-currentness
  reasons, or example-data labels.
- Return context survives with the labelled Details Close and host Escape order; no shell Back/breadcrumb geometry
  is added.
validation_surfaces: [future row renderer matrix, future manager-state matrix, future navigation and focus tests]
risk_class: settings_state_or_manager_grammar_drift
reasoning_tier: high
context_scope: settings_row_and_manager_grammar
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings components]
node_compile_hint: {mode: settings_row_manager_grammar_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/authority/base_packet/02_MANAGER_GRAMMAR_AND_SETTING_MODEL.md
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-contrast-round--NOTES.md, SHA-256
  0b6b3c5aa2833176f83f1601a83fb3d1b3e7b8e3511cbd76bed9e8cb8fd85354 (source lineage; not native certification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [Help, Details, Auto, Not configured, Managed, Unavailable, hidden origin breadcrumb]
negative_constraints:
- Do not render one-shot actions, status, diagnostics, manager routes, and persisted values as the same row type.
- Do not add duplicate shell navigation; retain the visible Details Close.
- Do not show a source word on a row that is the same everywhere unless Show where each setting comes from is
  on.
owner_hints: [Plans/Settings_System.md, Plans/Crosswalk.md]
```

### SSYS-007 - Detached Exact-ID Settings Transfer

```yaml
plan_unit_id: SSYS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: |-
  Copy Settings From Another Project is one detached exact-ID transaction through SSYS-018. The default copy_basis=own_values
  brings the source's portable own values, selected owner things and switches/reach additions through their owners,
  and intended account IDs with destination readiness under MA-074/MACS-006. The detached copy has no inheritance,
  live link or later source propagation from that source. A new Project independently follows Everywhere for unset
  values. Advanced effective_values (Keep them fixed) freezes only the previewed portable values at offered destination
  levels; computer programs, paths, screen values and secrets are never made portable by freezing.

  The eleven stable selector IDs are appearance_workspace, assistant_chat, providers_accounts_models_routing,
  planning_goal, orchestrator_automation, tools_integrations, testing_browser_devices, permissions_security, memory_retention_history,
  notifications_usage_budgets and project_only_rows. They resolve to disjoint immutable sorted setting_id sets.
  The last is off by default. picked_setting_ids must be a subset of the resolved selected sets; owner things
  remain separate contributed subcontracts. Notifications & limits is the visible name of notifications_usage_budgets.
  Preview names source, target level/key, exact revision vector, provenance, exclusions, conflicts, account_resolution,
  owner_thing_previews, rollback plan, hash and expiry. Target is project, projects, everywhere, computer or device
  only where offered. Apply validates every following context, creates per-target restore points, applies/read-backs
  each writer's admitted part and rolls back that part on failure. Cross-Computer batches honestly report done/not_reached/refused,
  with one report and Undo; they promise no cross-Computer atomicity and queue nothing. SSYS-062 owns the complete
  copy contract.

  These plain names are the shared visible vocabulary in Settings Transfer, New Project and onboarding:

  | Selector ID | Visible name |
  |---|---|
  | appearance_workspace | Look and layout |
  | assistant_chat | Assistant and chat |
  | providers_accounts_models_routing | AI accounts and models |
  | planning_goal | Planning and Goals |
  | orchestrator_automation | Automation |
  | tools_integrations | Tools and connections |
  | testing_browser_devices | Testing, browser and devices |
  | permissions_security | Permissions and safety |
  | memory_retention_history | Memory and history |
  | notifications_usage_budgets | Notifications & limits |
  | project_only_rows | About its own files |

  New Project/onboarding offers this step only while creating a new registry Project, including registering previously
  unregistered content; never on Later, connect-only or merely opening a registered Project. A draft preview binds
  destination_draft, not a fake Project ID. After the Project owner reserves real identity, Settings rebinds/revalidates
  then applies/read-backs/rolls back before the Project is listed. Explicit new choices win over copied defaults.
  Other Settings Transfer uses of existing destinations remain available.
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
- own_values stays detached and leaves unset fields following Everywhere; effective_values is a deliberate Advanced
  choice.
- All eleven selector sets are disjoint; picked_setting_ids never escapes the selected eligible sets.
- Source/draft/preview/inventory changes, expiry or stale per-setting revisions reject apply.
- Each owner part has an exact target, existing owner writer, readback and rollback; no incomplete owner part
  paints success.
- Each writer is atomic within its part; a multi-Computer result lists done, not_reached or refused without queuing
  work.
- No credentials, live Goal/Plan/Crew bodies, history or host paths travel as Settings.
- New-registry creation rebinds only after real reservation and settles Settings before listing; Later/connect-only/open-existing
  do not copy.
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
- 'source_ref:projects-pass2-20261103:S9–S11/P12; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Permissions, and Storage. CLI-owned profiles remain non-secret host-local profile_ref values and their OAuth
  material is never copied. Transfer and mutation receipts do not duplicate raw ordinary values; they retain setting
  IDs, revisions, before/after hashes, redacted summaries, and owner evidence refs. No level snapshot, Everywhere
  follower copy, mirror, differences index, export or copy preview may hold credential bytes. MA-074 permits reuse
  only when the destination choice names that account and its own exact Computer/Host/Environment connection resolves
  a current credential_ref or profile_ref there. The chosen account must be checked on that Computer before first
  use; an unchosen ready account confers no access. Cross-Computer copy carries intended account IDs only, with
  sign-in/key setup there; no CLI profiles, SSH keys or pairings transfer.
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
- 'source_ref:projects-pass2-20261103:S10/S11; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Every ordinary change is one level-bound validate-CAS-commit-read-back transaction naming level, tagged level_key,
  exact setting_id or atomic_group, per-setting expected revisions, schema/inventory version, idempotency key,
  actor/mode/authority source and owner validation evidence. Legacy global normalizes to everywhere before policy.
  Preview binds the target and current revision vector; apply never restates or widens it. No UI projection paints
  committed state before admission/readback; Accepted means admitted, not verified success. Independent settings
  do not conflict; the same setting at the same level rejects a stale_setting_revision. Theme family and mode
  always resolve and commit as one theme pair at one level and revision; Auto reconciliation uses that same pair
  writer and cannot create a shadow Project override.

  Everywhere writes validate every following context, including MA-073 switch/warn crossings, managed values,
  mandatory permission rules and theme-pair invariants. A blocker refuses before commit, names the first context/account
  and counts others. Change everywhere except a named blocker is a separately chosen previewed batch, never an
  automatic workaround. Reset explicitly selects Project own values, Computer own values, Everywhere back to Default,
  or all selected levels; removing own values reveals the next rung. A zero-Project reset can target offered shared/device
  levels. Keep one confirmation when Regular requires it, one exact preview, per-writer restore points/readback/rollback
  and exactly one outcome note; accounts, keys and history are kept. YOLO uses PS-144/RM-053 mode authority for a clear
  requested target and ordinary apply, never bypasses validation or protected choices. Multi-Computer batches
  carry one batch_id and report done/not_reached/refused per writer; an unreachable part changes nothing and queues
  nothing. Undo is currentness-bound; changed-since values need an explicit compensating transaction rather than
  overwriting a later change.
gui_related: true
gui_classification_reason: Instant changes, theme selection, Restore Defaults, busy/blocked state, and rollback are visible behavior.
depends_on: [SSYS-002, SSYS-004]
unblocks: [SSYS-007, SSYS-010, SSYS-017]
acceptance_criteria:
- Same-setting stale CAS, invalid values, missing actual target, permission denial and readback mismatch commit
  no partial writer state.
- Independent-setting edits can both commit; theme family/mode cannot resolve or commit from different levels
  or revisions.
- Everywhere checks all following contexts and refuses with named blockers; no automatic except workaround.
- Reset targets exactly the chosen levels and IDs, preserves account/key/history exclusions and reports one outcome
  after verified readback.
- Cross-Computer batches show honest per-writer outcomes and explicit Finish recovery, never queued or fictitiously
  atomic.
validation_surfaces: [future settings CAS/idempotency fixtures, future theme-pair fixtures, future restore-defaults rollback fixtures]
risk_class: settings_atomicity_or_default_recovery_failure
reasoning_tier: high
context_scope: settings_mutation_transactions
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, future Settings mutation service]
node_compile_hint: {mode: settings_atomic_mutation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
- Plans/FinalGUISpec.md#F3-511
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-usage-warn-hold--LANDING.md, SHA-256
  5357dc0dd60b0e08548f4dab5d5359662ee0ea0f159f7201a25577067372c238 (source lineage; not native certification)
- '/mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--onboarding--opus-5.5--src--settings--kit.d--10-values.js,
  SHA-256 435a06801d3f64a8218ed668c8e5235f89162e8f5737663c458ef210d0d7d676 (main at 95a8450f81, line 508: the
  Reset Settings to Defaults confirmation; source lineage; not native certification)'
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-pass--JUDGEMENT.md, SHA-256
  8a3291ea2558da05d40c5a051a958f378802ec9c36454b83dbaf5ffc7efe8cf9 (B9; source lineage)
- 'source_ref:projects-pass2-20261103:S3/S7/S12/S13; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [atomic, theme pair, Restore Defaults, read-back, rollback, idempotency]
negative_constraints:
- Do not persist or resolve theme family and mode independently.
- Do not treat command acceptance as successful read-back.
- Do not perform a partial reset within one writer transaction or claim cross-Computer atomicity.
- Do not turn a skipped YOLO ask into human approval or an Always rule.
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Permissions_System.md]
```

### SSYS-010 - Project Appearance And Chat Layout Settings

```yaml
plan_unit_id: SSYS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Appearance rows resolve and persist only at the levels SSYS-059 offers, through SSYS-002; the look pair uses
  Everywhere, Device and Project. The fields remain theme family, Light/Dark/Auto presentation mode, the shared
  Wallpaper choice, Glass alpha/transparency, tooltip enablement, reduced-motion request and background selection.
  The chat layout is no longer a Settings value (DL-180): the chat stays fixed on the right, its width and pinned
  History live in the Project's Home layout record (Plans/storage-plan.md#SP-330), the v2 record keeps no pop-out
  (a popped-out chat lasts only while the app runs and starts back in its column, D32, SP-330), and general.visual.chat-layout-mode
  is retired (SSYS-050) (amended 2026-10-10, DL-187; it read: its width, pinned History and popped-out state live
  in the Project's Home layout record (Plans/storage-plan.md#SP-330)). Amended 2026-10-10 (DL-187, D32): the popped-out
  state is no longer saved anywhere: a popped-out chat starts back in its column after a restart, and a stored
  Chat Layout value is ignored and cleared on first read, with no pop-out and no notice (SSYS-050). The ten built-in
  variants are Basic Dark, Basic Light, Friendly Dark, Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro
  Light, NieR Dark and NieR Light. Basic Dark is the bundled fallback or the pre-claim ephemeral case only. Fresh
  Projects follow resolved defaults; existing explicit values and detached copied own values win over a fresh
  seed. No project resolves Everywhere and Device, without allocating a Project snapshot. Theme family plus mode
  apply as the SSYS-009 atomic pair. Family-specific controls (Glass transparency, Retro textures and their strengths,
  Basic high contrast) show only while that family is active (decided 2026-09-27;
  they were previously kept visible as `not_applicable`); Glass alpha never drops below 0.35 in Dark or 0.45 in
  Light. Jared retired the visible Preview a theme / Preview Themes Before Applying preference (general.visual.theme-preview)
  on 2026-10-13. It renders nowhere and a stored value is ignored. Theme selection commits through cmd.settings.transaction.preview
  then its bound apply under SSYS-009; preview here means read-only transaction admission, not a visible timed
  trial, hover-applied app theme or expiry that restores the old look. Disabling hover tooltips never removes
  keyboard-focus accessible descriptions or Help/Details. Effective reduced motion is true when the OS preference
  or any applicable Everywhere, Device or Project reduce-animations request is true; it calms nonessential entrance,
  hover, parallax, shimmer, and background motion while retaining focus, progress, error, and state-change feedback.
  Background and transparency use their reviewed offered levels; Project own choices never fan out and no browser/localStorage
  shadow writer exists. The first frame reads the exact opening context through the one resolver over local committed
  level snapshots and bounded caches, NieR family included. It never waits for network or uses an unrelated last-painted
  hint; the reader writes nothing. SSYS-054 replaced the old Glass background row at the 2026-10-15 publication;
  Wallpaper is visible across all looks. Either Glass look always uses F3-652's Liquid Glass material over that
  Wallpaper; there is no material off state or old Glass fallback (Jared, 2026-10-19, option 1). SSYS-053 owns
  Settings first-frame geometry and in-place update/return behavior. Glass transparency has a bounded typed numeric
  input beside its slider; both edit the same existing value through SSYS-009. No second setting or visible theme-preview
  timer is created. Amended 2026-11-04 (SW-04, Jared, DL-301): Theme offers five family names only: Basic, Friendly,
  Retro, Glass and NieR. The single Light or dark control offers Light, Dark and Auto; the title-bar quick switch
  retains the same family and scheme separation. A family pick preserves the selected scheme, including Auto,
  and commits the resolved composite storage value and unchanged mode as one SSYS-009 transaction. Existing
  per-Project selections remain intact without a data migration. The older Basic light/dark row is no longer
  offered, including in advanced Settings; retain its saved value for compatibility, with theme-mode deciding
  the scheme. This supersedes DL-228's visible named-variant
  pick leaving Auto; the ten composite variants remain storage values, not ten visible Theme choices. Both controls
  redraw from the committed pair, and a refused write restores both, the dropdown's optimistic label included. In Plans, Reduced Motion names the effective state
  above (the OS preference OR the applicable Everywhere, Device and Project requests) and Reduce Animations names
  the row that requests it (general.visual.reduce-animations); the two words never name two settings. Amended
  2026-10-29 (S2, RM1, X2, L3; PM7): general.visual.reduce-animations is globally applicable as the inventory
  says; SSYS-002/059 authorize its Everywhere, Device and Project requests; OS safety is combined in every context.
  The universal wait loader retains opacity breath/blink, while other nonessential motion rests. Pip parts follow
  their reviewed appearance levels, no brand/loader override. RM1 (2026-10-29): S14 supersedes RM1's storage-only
  restriction: Reduce motion has Everywhere, Device and Project requests, combined more carefully with OS. Its
  effective safety and single-setting identity remain. Amended Q22, Jared 2026-10-30 (DL-257): the fifth NieR
  family supersedes independent-override wording; SSYS-043 owns migration and retained Adjust controls. DL-259
  QA2 M1, 2026-10-31: choosing Auto commits general.visual.theme-mode=Auto and the selected family’s Theme scheme
  word resolved from the effective OS appearance in the same SSYS-009 transaction. While Auto remains selected,
  an OS appearance change or Project reopen reconciles the theme pair at its existing origin level, retaining
  Auto and the selected family. Reconciliation uses the same level writer and per-setting revision fences outside
  rendering; read-only, unavailable or refused writes remain refused and cannot authorize a shadow store or pretend
  that an uncommitted label was saved.
gui_related: true
gui_classification_reason: Themes, Glass composition and backgrounds are directly visible.
depends_on:
- SSYS-002
- SSYS-009
- F3-425
- DL-180
- DL-187
unblocks:
- SSYS-016
- SSYS-017
acceptance_criteria:
- Switching contexts resolves the opening context's appearance from the same ladder; the chat column comes back
  from that Project's Home layout record, never from a Settings value.
- 'DL-257/Q22: ten built-in variants across five ordered families remain available; pre-claim fallback, normal
  No project and new-Project fallthrough are distinct.'
- Family-specific rows show only for their applicable family; Wallpaper remains visible in every look under SSYS-054.
- The retired theme-preview row and timer render nowhere; internal preview writes nothing, and only its accepted
  bound apply commits a theme change.
- Tooltip-off and reduced-motion tests preserve accessible descriptions, Help/Details, focus, progress, error,
  and state feedback.
- The first frame is the exact context's resolved committed look, from local snapshots/caches; no network wait,
  unrelated paint hint, second reader or writer is used.
- 'DL-259 QA2 M1, 2026-10-31: choosing Auto commits general.visual.theme-mode=Auto and the selected family’s Theme
  scheme word resolved from the effective OS appearance in the same SSYS-009 transaction. While Auto remains selected,
  an OS appearance change or Project reopen reconciles the theme pair at its existing origin level, retaining
  Auto and the selected family. Reconciliation uses the same level writer and per-setting revision fences outside
  rendering; read-only, unavailable or refused writes remain refused and cannot authorize a shadow store or pretend
  that an uncommitted label was saved.'
validation_surfaces:
  - "Plans/settings_system_contract_fixtures.json"
  - "future ten-theme project-switch tests"
  - "future Glass control-state tests"
  - "future tooltip and reduced-motion tests"
  - "future no-global-local-storage tests"
risk_class: theme_or_layout_cross_project_leak
reasoning_tier: high
context_scope: project_appearance_settings
implementation_surfaces:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: project_appearance_settings_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/FinalGUISpec.md#F3-425
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md, SHA-256 df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/SETTINGS-PREVIEW-RETIREMENT.md, SHA-256 327f4021cf41f627abcc2634af4e7ee2473ba75006dbb05d88dd5d8c4578ecb4
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/found/REPORT.md — Auto Theme word follow-up, 2026-10-31.
- 'source_ref:projects-pass2-20261103:S1–S7/S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
- Friendly Dark
- Friendly Light
- Glass Dark
- Glass Light
- Retro Dark
- Retro Light
- Basic Dark
- Basic Light
- 0.35
- 0.45
- tooltips
- reduced motion
- chat layout
negative_constraints:
- Do not persist appearance outside a level offered by layering or mix the two halves of the theme pair.
- Do not store the chat column width, History pin or pop-out as a Settings value.
- Do not change Glass alpha floors or active-family disclosure.
- Do not remove accessible descriptions when hover tooltips are off or suppress progress/error feedback under
  Reduced Motion.
- Do not write a last-painted theme hint or force Basic Dark over resolved saved values.
owner_hints:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
stale_retired_dispositions:
- 'Amended 2026-10-09 (DL-180): the chat layout setting retires; the chat column''s state is the Home layout
  record''s (SP-330), and SSYS-050 records the retired row. The title''s Chat Layout is historical, kept for
  lineage.'
- 'Amended 2026-10-10 (DL-187, D32): the chat''s popped-out state is never saved; a stored Chat Layout value
  is cleared on first read with no pop-out and no notice.'
- 'Amended 2026-10-10 (DL-187, D32, SP-330): the sentence that put the popped-out state in the Home layout
  record now says the v2 record keeps no pop-out; a popped-out chat lasts only while the app runs.'
```

### SSYS-011 - Provider Installation Actions And Continuation

```yaml
plan_unit_id: SSYS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Provider installation cards expose only the registered shared-runtime actions whose owner selectors report available.
  Initial acquisition uses cmd.installation.install only after explicit user Install or Setup, official source
  proof, and exact Execution Host and Execution Environment selection. Repair and Verify remain separate actions
  using cmd.installation.repair and cmd.installation.verify with their exact catalog disabled reasons and typed
  results. Provider setup preserves origin_surface, origin_route, provider/route identity, exact topology, operation
  identity, and a bounded continuation so successful owner work returns to the originating Settings row. Settings
  exposes no Provider Uninstall action, command, menu item, or implied destructive fallback. Installed-tool update
  choices consume Shared Integration Runtime section 4.7: separate check-now and check-and-install-now actions,
  automatic check-only or check-and-install policy, disabled background checks, and an independent routine update-notification
  preference. These are user-facing update choices, not ownership/consent-category choices, and do not alter Puppet
  Master's separate app-update/restart policy. Update channel, automatic update mode and routine update notifications
  resolve Everywhere then Computer, never Project; installation, source, execution Host/Environment and protected
  consent remain owner records, not portable row values.
gui_related: true
gui_classification_reason: Install, Repair, Verify, disabled reasons, exact target, progress, and return context are visible provider-manager behavior.
depends_on: [SSYS-006, SSYS-008, CS-066, UCC-145, SIR-003]
unblocks: [SSYS-015, SSYS-017]
acceptance_criteria:
- Install, Repair, and Verify dispatch only the registered IDs and exact handlers.
- Each action carries exact Host/Environment, applicable scope and conditional Project, expected revision/epoch,
  idempotency, permission, and continuation evidence required by CS-066.
- A missing or invalid owner selector renders the exact disabled reason and dispatches nothing.
- Provider Uninstall is absent from rendered controls, command lookup, natural-language suggestions, and automation
  routes.
- Installed-tool consumers use the SIR-021 update preferences and exact installation/Host/Environment policy;
  manual actions do not edit the saved automatic mode, and disabling background checks does not remove manual
  checks.
- Do not notify suppresses routine update-available notices only; Details/ObservableWork still show update state,
  failures, security warnings, and required approvals. Missing automatic-install authority shows the requested/effective
  difference and the owner's disabled reason.
- Update preferences and manual action intent do not register a command or synthesize a Settings-local updater.
  Deferred check/update-policy candidates remain unavailable until their central contracts close; current manager
  layout and styling are unchanged by this Plan correction.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Execution Hosts and exact Environments; Clients and continuity; Project Hosting, Location, and Files; Project
  Sync, Move, and Copy; SSH remote add, edit, test, disable, and remove; Remote Access; and Full Server Backup.
  Settings shows human identity, requested/effective target, freshness, truthful ObservableWork, receipts, and
  recovery actions. SIR-013 retains claim/bootstrap truth, Project_Sync_and_Backbone retains Project-content movement,
  GitHub_Integration and security owners retain SSH behavior and credential custody, and Backup_Restore_System
  retains Project Backup and Full Server Backup/Restore product semantics while Storage retains physical persistence
  and internal recovery. The backup owner contracts are canonical, but absent central command registration, sole
  handler, production wiring, or runtime evidence keeps the affected action visible and unavailable with the exact
  missing-integration reason; the concept fixture cannot stand in for executable closure. Computer-level and approved
  application routes carry null Project/Vault and the actual Server/Host/Environment/Client; missing Project is
  a refusal only for a Project-targeted operation.
gui_related: true
gui_classification_reason: Server, client, Project, SSH, backup, progress, disabled, and recovery manager states are visible.
depends_on: [SSYS-006, SSYS-008, SIR-013, PSB-001, BRS-001, BRS-008]
unblocks: [SSYS-014, SSYS-015, SSYS-017]
acceptance_criteria:
- Every manager preserves its applicable exact Server, Host, Environment, Client, Source Location, operation and
  generation; Project/Vault are required only by Project-targeted owners and remain null for application/Computer
  routes.
- Settings neither equates reachability with claim nor paths with Vault identity and does not implement Project
  Sync or SSH mutations locally.
- Full Server Backup is distinct from settings transfer, Project backup, and internal recovery snapshots.
- Missing command, handler, wiring, or runtime closure renders unavailable and cannot be converted into fixture
  success.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Browser and SCM are Settings dependency and routing surfaces, not embedded operational workbenches. Concept
  presentation may fold their governance detail into one Advanced disclosure that never hides a blocking error,
  unavailable reason, consent boundary, requested/effective difference, or live-versus-example distinction (USER-SETTINGS-MANAGER-REFRESH-20260908).
  Settings may show ordinary PM-native Browser policy, readiness, capture/retention policy, agent-sharing policy,
  and routes to the Browser owner; protected AuthBrowserSession remains human-only, ephemeral, non-capturable,
  non-automatable, and absent as an ordinary tab. Source Control settings show tool/forge/account/environment/worktree/default/safety/repair
  state and route repository, diff, commit, branch, history, graph, provider-neutral Actions & Pipelines, and
  SSH operations to their owners. Repository hosting and automation bindings remain independent; Forgejo and Gitea
  are distinct provider/instance profiles rather than one API-compatible alias. Container ordinary rows and search
  results redirect to Docker Manager or Docker/Hosts; Settings embeds no Docker, Podman, Kubernetes, registry,
  runtime, log, exec, publish, or workload operational UI. One-time setup is configuration rather than operation
  and may run in Settings as a flow that dispatches the owner's command (decided 2026-09-27): signing in to Docker
  Hub or another registry, creating an image repository, setting up and checking the Unraid template repository,
  and editing the Unraid publisher profile; running containers, logs, exec, publishing and workloads stay with
  Docker Manager. Product copy uses Computer for the Server doing work and its Execution Host where local resources
  matter. Execution Environment remains the finer native/WSL/container/SSH identity, never a Settings level. Programs,
  paths, ports and hardware use the tagged Execution Host Computer key; changing a Settings view never moves a
  Project or changes topology.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Settings ships as a full manager system rather than a 1010-row form or provider-only demo. The manager registry
  is frozen as the exact 38-key machine registry in Plans/settings_system_contract_fixtures.json and includes
  General Desktop and Appearance; Providers, Accounts, Models, and Installations; Web Routes; Media Routes; Back
  Seat Driver; Memory and Context; Goals, Crew, Personas, and Owners; Permissions and FileSafe; Commands and Shortcuts;
  Tools, MCP, Skills, Plugins, LSP, Formatters, and Toolchains; Testing and Debug policy; Files and Editor; Terminal;
  Notifications and Sounds; Source Control and Actions & Pipelines; Browser and SCM dependencies; Storage, Retention,
  Recovery, and Cleanup; Project History, Sessions, Artifacts, and Outputs; Settings Transfer; Servers, Hosts,
  Environments, Clients, Remote Access, Project Hosting/Files/Sync/Move/Copy, SSH, Backup and Restore, Updates,
  Readiness and Setup; Teacher and Help; Project Search Index; and DRY Method visible state. Concept presentation
  may group or split these destinations into workspaces (one System workspace Server & Project Location over the
  seven server/location keys; separate Code & Tools workspaces for Skills, Plugins, MCP Servers, and Commands
  & Shortcuts over tools-integrations and commands-shortcuts) without changing manager_id keys, routes, or details
  paths (USER-SETTINGS-MANAGER-REFRESH-20260908), and may present canonical ordinary settings inline within the
  manager workspace that owns their topic without changing manager_id keys or the inventory (USER-SETTINGS-MANAGER-REFRESH-20260909).
  Each entry has one stable manager_id, owner route, lazy summary projection, supported actions, exact unavailable
  reasons, and a details path; operational behavior remains in the retained owner. Amended Q22, Jared 2026-10-30
  (DL-257): the current family/variant and inventory census supersede earlier counts. The 38 keys stay fixed.
  SSYS-061 classifies each descriptor with scope_model and declared project_switch_ids, retaining owner-specific
  fields and adding level/level_key for ordinary value targets. Project is conditionally required only by the
  targeted Project level or owner operation. Saved setups is the visible name of project-defaults-templates; the
  separate Project-owned Starters route adds no manager key.
gui_related: true
gui_classification_reason: The complete manager destination set and shared visible states define the Settings product surface.
depends_on: [SSYS-004, SSYS-006, SSYS-011, SSYS-012, SSYS-013, SSYS-014]
unblocks: [SSYS-017]
acceptance_criteria:
  - "The exact 38-entry manager registry covers every named family with stable identity and an explicit retained owner or named owner-gap disposition."
  - "Settings Home hydrates compact summaries first and one selected manager lazily; hidden managers release heavy state."
  - "Every manager action resolves to a registered owner command or remains unavailable with the exact reason."
  - "Search can find all managers without counting them among the 1010 ordinary settings."
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [full manager system, lazy hydration, Settings Transfer, Readiness and Setup]
negative_constraints: [Do not call Provider Manager plus a few rows a complete Settings system., Do not hydrate or probe all managers on startup., Do not invent manager-private mutation handlers.]
owner_hints: [Plans/Settings_System.md, Plans/Shared_Integration_Runtime.md]
```

### SSYS-016 - PMConcept7 Reference And Slint Portability Boundary

```yaml
plan_unit_id: SSYS-016
unit_type: constraint
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Production Settings targets Rust stable and Slint 1.17.1 with typed models, host-width layout states, variable-height
  virtualization, explicit properties/focus, precomputed theme tokens and native animation. The Skia renderer
  extensions of F3-582/DL-139 own blur, backdrop blur, masks, blend modes and filter effects; opaque or pre-blurred
  known assets may help performance. Leptos web Settings (F3-583) uses its DOM/CSS renderer over the same interface-model
  crate and design-token source. Prototype selectors, browser storage, script handlers and simulated values are
  not native dependencies or production evidence. Runtime, persistence, wiring, visual, performance and accessibility
  acceptance each need their own real owner proof. Amended Q22, Jared 2026-10-30 (DL-257): the current family/variant
  and inventory census supersede earlier counts. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: DL-259,
  Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same Everywhere general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5.
  Both bars reflect the same effective state. Every opened onboarding question tip and prose help section has
  useful Plain English and technical versions, including FileSafe, service differences, storage, remote access
  and AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints, paths and
  receipt data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without
  rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5
  is a compatibility local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The
  predecessor tour_narration_only tag is retired. DL-259, Jared 2026-10-31, D4/D6: cursor_sdk is the separate
  Cursor SDK direct-provider entry, with API key as its default auth surface. A user key bills that user’s plan
  and a service-account key its owning team; these remain distinct account/billing identities. cursor_cli keeps
  browser login as its default and an advanced optional CLI-key path; it does not rename or absorb the SDK entry.
  alibaba_token_plan is a separate direct-provider entry for Alibaba Token Plan, a monthly-credit subscription
  with its own key and Singapore route identity, distinct from Alibaba Coding Plan and DashScope pay-as-you-go.
  MiniMax M Plan is the current label, with MiniMax Coding Plan retained as a former-name/search alias; OpenCode
  Console replaces the Zen display name and is a pay-as-you-go gateway. A label change never changes a saved provider/account
  ID. DL-259 D2 A, Jared 2026-10-31: Settings retains the explicit always-on Server, manual private HTTPS, self-hosted
  Remote Link gateway, rarer SSH key types, China-region and local-server AI routes, and repository object-format
  controls; onboarding provides context-correct pointers without exposing those advanced choices. Amended DL-260,
  Jared 2026-10-31: only real product behavior remains an implementation requirement.


  DL-272: Your AI services reuses MA-045/046 protected setup/addition and Models MS-121’s exact-route Turn off.
  Existing accounts remain Ready during an addition, credential types are named accurately, and Cancel preserves
  them. This route action is not the whole-provider ai.models.provider-enabled switch and adds no ordinary settings
  row.
gui_related: true
gui_classification_reason: This unit governs the Settings visual reference and future Slint implementation direction.
depends_on: [SSYS-003, SSYS-010]
unblocks: [SSYS-017]
acceptance_criteria:
- PMConcept7 demonstrates Settings geometry, content and interactions and is labeled concept_fixture_only.
- Production implementation does not hand-port the concept's browser persistence, JavaScript handlers or DOM/CSS-only
  mechanisms as runtime architecture; the Leptos web GUI (F3-583) uses its own DOM and CSS presentation over the
  shared interface model.
- Any Slint acceptance claim requires fresh build/runtime/visual/accessibility/performance evidence under SSYS-017.
- 'DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same Everywhere general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5.
  Both bars reflect the same effective state. Every opened onboarding question tip and prose help section has
  useful Plain English and technical versions, including FileSafe, service differences, storage, remote access
  and AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints, paths and
  receipt data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without
  rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5
  is a compatibility local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The
  predecessor tour_narration_only tag is retired.'
- 'DL-259, Jared 2026-10-31, D4/D6: cursor_sdk is the separate Cursor SDK direct-provider entry, with API key
  as its default auth surface. A user key bills that user’s plan and a service-account key its owning team; these
  remain distinct account/billing identities. cursor_cli keeps browser login as its default and an advanced optional
  CLI-key path; it does not rename or absorb the SDK entry. alibaba_token_plan is a separate direct-provider entry
  for Alibaba Token Plan, a monthly-credit subscription with its own key and Singapore route identity, distinct
  from Alibaba Coding Plan and DashScope pay-as-you-go. MiniMax M Plan is the current label, with MiniMax Coding
  Plan retained as a former-name/search alias; OpenCode Console replaces the Zen display name and is a pay-as-you-go
  gateway. A label change never changes a saved provider/account ID.'
- 'DL-259 D2 A, Jared 2026-10-31: Settings retains the explicit always-on Server, manual private HTTPS, self-hosted
  Remote Link gateway, rarer SSH key types, China-region and local-server AI routes, and repository object-format
  controls; onboarding provides context-correct pointers without exposing those advanced choices.'
- 'DL-272: Your AI services reuses MA-045/046 protected setup/addition and Models MS-121’s exact-route Turn off.
  Existing accounts remain Ready during an addition, credential types are named accurately, and Cancel preserves
  them. This route action is not the whole-provider ai.models.provider-enabled switch and adds no ordinary settings
  row.'
validation_surfaces: [future Slint build and runtime evidence]
risk_class: concept_fixture_promoted_as_runtime_proof
reasoning_tier: high
context_scope: settings_pmconcept_slint_boundary
implementation_surfaces: [Plans/Settings_System.md, future Slint Settings components]
node_compile_hint: {mode: settings_concept_portability_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Concepts/pm7-tools/settings_tome_source.py
- Concepts/pm7-tools/build_pm7.py
- Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html
- source_ref:chat:settings-canonical-owner-lane-2026-08-31
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [PMConcept7, Slint 1.17.1, concept_fixture_only, no certification claim]
negative_constraints: [Do not call static or browser concept checks Slint proof., Do not claim portability or certification without fresh production evidence.]
owner_hints: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md]
```

### SSYS-017 - Settings Validation And Acceptance Gate

```yaml
plan_unit_id: SSYS-017
unit_type: validation
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings acceptance requires fresh production evidence for exact K3 host geometry, the exact recomputed unique
  ordinary-ID census, complete manager routing, level isolation, offered zero-Project shared/Device writes, missing
  actual Project target refusal, per-setting CAS, one writer, restrictive combination, honest cross-Computer batch
  outcomes, five families/ten variants, one-level atomic theme pair and Restore Defaults, fuzzy search/facets,
  variable-height virtualization, transfer preview/apply/rollback and secret exclusion, provider action availability/continuation
  and no Uninstall, Server/Project/SSH/backup routes, Browser/SCM/container boundaries, Onboarding/Doctor projection-only
  behavior, keyboard/pointer/focus/accessibility parity, reduced motion, truthful loading, Slint 1.17.1 build/runtime
  behavior on the desktop, and Leptos web-client build/runtime behavior, with the same shared fixtures run through
  both interfaces and screenshots of each checked against that interface's own visual baselines (F3-583, DL-139).
  Schema/text/static checks are findings only and cannot prove runtime, visual, performance, accessibility, or
  implementation readiness. Open owner, command, wiring, inventory-scope, Event Authority, PNC-019, or backup
  command/handler/wiring/runtime gaps remain named blockers or residual risks rather than being erased by a concept
  pass. Amended Q22, Jared 2026-10-30 (DL-257): the fifth NieR family supersedes independent-override wording;
  SSYS-043 owns migration and retained Adjust controls.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  commands: cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback,
  and cmd.settings.export. Preview resolves an immutable exact-ID proposal and writes nothing. Apply accepts only
  the bound preview ID, generation, hash, and bound target level/key and per-setting expected revision vector;
  it creates the restore point, validates, commits/read-backs atomically within each writer and returns one typed
  result with honest batch parts across Computers. Rollback requires the transaction ID, rollback token, and expected
  current revision. Export emits a detached, secret-free, exact-ID manifest and artifact. Plans/settings_system_contracts.schema.json
  owns strict Draft 2020-12 shapes and Plans/settings_system_contract_fixtures.json freezes the command/UI-action/manager
  registries and valid/invalid cases. Commands_System, UI_Command_Catalog, UI_Wiring_Rules, and production Wiring
  Matrix must register the identical IDs, schemas, selector, handler, and reverse wiring before any dispatch or
  implementation-readiness claim. Application routes require actual scope and writer identity, never a sentinel
  Project. Each of the five central handlers remains sole and unchanged; no per-row/per-level command is added.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  cmd.settings.open carries one exact setting_id target, which may also name a provider_id and, inside that provider,
  an account_id, landing on the row inside that provider's section or that account (SSYS-044's hosted controls),
  or one exact manager_id/detail_id target, plus the Project and complete owner-target context: Server, Vault,
  Host, Environment, Client, provider, provider route, thread, operation, topology generation, and expected revision,
  using nullable fields only when that identity is not applicable. The return contract freezes origin route, focus,
  query, scroll anchor, continuation ID/generation, expiry, close policy, and Escape order: close_transient, close_details,
  clear_query, return_to_opener. A stale generation or changed context rejects return and preserves the current
  surface. The route-only UI actions settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.resume,
  settings.guided_tour.replay, settings.doctor.open, and settings.doctor.remediation.open all dispatch cmd.settings.open;
  they authorize navigation only and never execute Onboarding, tour, probe, repair, or remediation work. Settings
  targets add exact level/level_key and a frozen look-as context. Project, Vault and thread may be null when inapplicable;
  Project-level writes still need a real Project. Return preserves the edited level/key and originating context
  rather than current focus. The Details inspector has a visible labelled Close; shell Back/breadcrumb remain
  optional.
gui_related: true
gui_classification_reason: This unit defines visible Settings navigation, deterministic close/Escape behavior, and focus/query/scroll restoration.
depends_on: [SSYS-006, SSYS-014, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
- Setting and manager routes are mutually exclusive and use stable IDs rather than labels or DOM selectors.
- A setting target's optional provider_id and account_id are typed fields of the route request; an account_id
  needs its provider_id, and a setting target without them keeps its meaning.
- Exact return restores focus, query, and scroll only when continuation generation and context still match.
- The six route-only UI actions use the frozen manager/detail targets and authorize no owner operation.
- The Details inspector has a visible labelled Close and exact Escape/focus return; shell Back/breadcrumb remain
  host/K3-controlled.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Plans/settings_system_contract_fixtures.json owns the canonical 38-key manager registry. Every descriptor freezes
  title, purpose, retained owner refs or named owner gap, route, aliases, owner action IDs, exact target fields,
  and the lazy hydration rule cached_bounded_summary_then_selected_details. A Settings owner projection is a bounded,
  freshness-labeled mirror of one retained owner contract and carries requested state, effective state, health,
  exact availability, human disabled reason, active-operation ref, receipts, evidence, and details route. It contains
  no raw logs and makes Settings the runtime owner of nothing. A Settings UI action projection keeps command identity,
  exact target, owner ref, requested/effective state, operation, receipt, and availability as distinct axes. Available
  actions have no disabled reason; disabled or hidden actions require one closed Settings reason code plus human
  text. Owner-specific details remain referenced owner evidence rather than a second Settings enum or reducer.
  Every descriptor also declares scope_model and project_switch_ids; value routes name level/level_key, while
  owner-specific target requirements remain exact. Project is conditional on a Project-level value or actual Project
  operation, never universally mandatory. Manager fields and dynamic owner state do not become ordinary inventory
  rows.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  pm.settings_level_snapshot.v1 represents sparse Everywhere, Computer or Device own values with exact tagged
  level/key, sole writer identity, per-setting revision/source maps with identical setting-ID sets, snapshot/content
  hash, actor/time/provenance and migration refs. A Device writer is identified by client_id, never a fabricated
  writer_server_id. pm.project_settings_snapshot.v2 represents sparse Project own values and sources with layer_model=ladder_v1;
  pm.project_settings_snapshot.v1 stays exact and readable as legacy fold input. No Project-level snapshot exists
  without a real project_id; approved application/Device snapshots require none. Sources are default, explicit,
  copied, restored_default, imported, migrated and promoted. pm.settings_effective_value.v1 is the sole derived
  value/source/changed/varies result; the differences index and mirrors are redacted read-only projections, never
  competing writers.

  pm.settings_export_manifest.v1 remains detached and exact-ID with levels_included, source revision vector, exclusions,
  artifact hash/size/receipt and credential_material_included=false. Legacy global, singleton, browser-concept
  or v1 export input is never authoritative and never auto-applies. Migration lists detected/eligible/excluded/unmapped
  keys, normalized theme pair and explicit target level/key/revisions, then creates the ordinary preview; confirmation_required
  remains true and auto_apply=false. project_snapshots_v1_fold is the SSYS-064 pre-release input, not shipped-product
  migration. Discovery/startup never overwrites current values. Storage owns physical keys, durability, retention,
  backup and migration receipts.
gui_related: true
gui_classification_reason: Export selection/results and explicit migration preview, exclusions, confirmation, and rollback are user-visible flows.
depends_on: [SSYS-002, SSYS-007, SSYS-008, SSYS-009, SSYS-010, SSYS-018]
unblocks: [SSYS-017]
acceptance_criteria:
- Sparse value/source/revision key sets are identical; empty or missing values fall through without copies.
- Project v2 requires real Project identity; Everywhere/Computer/Device snapshots use exact level/key and one
  actual writer with no fake Project or Server for a Device.
- No-Project offered writes work; discovery-only, cancelled, stale, invalid or unconfirmed migration leaves stores
  unchanged.
- Exports/previews/indexes/mirrors contain no credentials or owner live bodies and do not create source links.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [pm.project_settings_snapshot.v1, pm.settings_export_manifest.v1, credential_material_included=false, confirmation_required, auto_apply=false]
negative_constraints:
- Do not allocate a Project snapshot for null Project or manufacture a Server identity for a Device writer.
- Do not auto-import legacy global or browser fixture state.
- Do not make an export a live inheritance link.
- Do not store credentials.
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
  exact 80-token older-packet command denominator; the live disposition partition and replacement targets are
  derived from that authoritative fixture. The former 41 reused, 7 typed-local, 1 bakeoff-only, 31 rejected and
  0 alias totals are historical lineage from before DL-200's 2026-10-14 theme-preview retirement, not current
  acceptance counts. No source token becomes a new or approved alias command. A disposition is semantic
  reconciliation only and always carries native_handler_claim=false.
gui_related: true
gui_classification_reason: The three named manager projections and seven typed local presentation actions are visible Settings behavior; exact rejected/reused command state controls whether actions appear enabled.
depends_on: [SSYS-015, SSYS-018, SSYS-020]
unblocks: [SSYS-017]
acceptance_criteria:
  - The strict manager registry contains exactly 38 keys and the named projection registry contains exactly teacher-help, project-search-index, and dry-method.
  - The packet disposition registry accepts exactly the 80 source tokens and no omissions, additions, duplicate keys, or unclassified token.
  - The current partition is derived from packet_command_dispositions in Plans/settings_system_contract_fixtures.json; its exact 80 source tokens each have one disposition, and the Touch Closure descriptor binds that same edition.
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
  explains the block through the shared accessible hover overlay owned by FinalGUISpec F3-523, dispatches no mutation, changes no package generation or status, emits no
  EventRecord, and fabricates no production receipt. Generic K3 Add/Edit/Test/More handlers cannot mutate plugin state.
  The exact existing routing IDs are cmd.agent_plugin.scan, cmd.agent_plugin.install, cmd.agent_plugin.update,
  cmd.agent_plugin.enable, cmd.agent_plugin.disable, cmd.agent_plugin.reload, cmd.agent_plugin.remove,
  cmd.agent_plugin.validate, cmd.agent_plugin.review_changes, cmd.agent_plugin.rollback,
  cmd.agent_plugin.open_details, cmd.agent_plugin.open_logs. Their receipt policy remains
  receipt_only_no_eventrecord_pending_event_authority; unavailable actions still issue no production receipt.
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
validation_surfaces: [Plans/plugin_contracts.schema.json, Plans/plugin_contract_fixtures.json, Plans/plugin_package_contracts.schema.json, Plans/plugin_package_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: settings_plugin_parallel_owner_or_false_success
reasoning_tier: high
context_scope: settings_k3_plugin_owner_projection
implementation_surfaces: [Plans/Settings_System.md, Plans/Plugins_System.md, Plans/newtools.md, Plans/FinalGUISpec.md, future native Slint Plugins manager projection]
node_compile_hint: {mode: settings_plugins_owner_projection_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-067
  - Plans/Plugins_System.md#PLUG-069
  - Plans/Plugins_System.md#PLUG-070
  - source_ref:chat:plugin-registration-phase-reconciliation-2026-09-01
  - "DL-260 source lineage only (no product API or implementation obligation): PMHoverTag was the concept overlay name; unavailable plugin controls consume the shared F3-523 hover owner."
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

The exact GUI consumers for all three alias rows are Settings > Settings Transfer > Use settings from and Projects duplicate/Saved setups flows.

The packet source base is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; `Plans/settings_system_contracts.schema.json` preserves all three complete `packet_source_ref` strings and exact intended semantics.

```yaml
plan_unit_id: SSYS-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Three Project Settings-copy compatibility spellings normalize before policy and dispatch to the existing exact
  Settings transaction preview, apply, and rollback commands. They reuse settings_command_contract and each target's
  sole handler; no alias receives an independent registration, handler, policy evaluation, wiring row, receipt
  family, or EventRecord. Reverse consumers include New Project, onboarding, Settings Transfer, duplicate_configuration
  and Saved setups; all consume SSYS-062 and the same five Settings contracts with exact level targets. No alias
  adds an owner-copy engine.
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
source_lineage:
- source_ref:server-command-gap-adjudication:rows-119-121
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
negative_constraints:
  - Do not register a source alias as a second canonical Settings command.
  - Do not evaluate policy or dispatch twice.
  - Do not infer central-router or native-handler implementation from static alias metadata.
```








### SSYS-059 - Reviewed Row Levels, Keys And Combine Rules

```yaml
plan_unit_id: SSYS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The inventory layering object, not legacy scope, is the reviewed per-row authority: home, may_differ_by, computer_key,
  combine, conditional careful_order, atomic_group and not_offered. home is everywhere, computer, device, project
  or thing. may_differ_by never contains both computer and device. A Computer key is tagged server or execution_host,
  not an ambiguous raw ID; Device uses client_id and Project uses actual project_id. Execution Environment is
  exact resource context under a Computer, never a level. One PM native Client/local Server display name is linked
  by ClientRecord.local_server_id, not identity collapse. Every live row is classified in order: owner thing fields
  remain owner-held; host programs/folders/ports/hardware/network are Computer-only; paths about a Project's files
  are Project-only; screen/keys/speakers are Everywhere/Device; same-for-you behavior is Everywhere-only; other
  shared behavior/defaults are Everywhere/Computer/Project. No keyword-only census or automatic relocation of
  keys is sufficient.

  Named exceptions: general.visual.theme and general.visual.theme-mode are one atomic theme_pair offered Everywhere/Device/Project,
  always from one level and revision. general.visual.reduce-animations is Everywhere/Device/Project, with true
  more careful than false: OR the applicable own requests (or the factory default when all are absent) with
  the OS preference, including before first paint. Computer does not add a second motion rung. general.interaction.scope-labels
  is Everywhere-only, default false. ai.usage.usage-retention is Everywhere-only, default 90 days with daily totals
  kept. Project-relative compose/Dockerfile/artifact paths and branching.worktrees.worktree-base-dir stay Project-only;
  branch/protected-branch defaults and planning.testing.cap-* policy are shared, while installed capabilities
  are owner status. Program/proxy/port/Projects-folder values are tagged execution_host Computer values, never
  copied Project values. Ordinary most_specific resolves Default → Everywhere → Computer (Device on screen rows)
  → optional Project → existing owner/chat/run/tab rungs with Managed above all; unset is absent and falls through.

  Only a declared safety list uses more_careful: safety.rules.permission-preset, safety.protection.filesafe-integration
  and the three existing scalar answers safety.rules.default-tool-permission, safety.approvals.doom-loop-action,
  safety.protection.external-dir-action, plus safety.rules.computer-use. The proposal’s four
  ask-or-allow wording is not an inventory of four pre-existing scalar IDs: there is no fourth scalar or generic
  internet-use ID at the starting pin. safety.rules.per-tool-permissions and safety.protection.web-tool-permissions remain per_item
  maps with the existing Permissions matching/deny semantics, not ordered scalar values or an invented internet
  toggle. PS-144 defines the per-answer Computer/Project protective combination under Permissions; the ordinary map
  object has no scalar careful_order. careful_order is required only for more_careful and lists actual row values
  from most to least careful: read_only, plan, regular, full for built-in profiles; deny, ask, allow for ternary
  permission answers; on before off for protection; true before false for Reduce motion. Custom profiles are not
  numerically ordered: when Computer and Project own choices both exist and either is custom, use Computer own
  and explain it. Everywhere/factory supplies fallback, never an additional protective comparison: compare
  only simultaneous Computer-own and Project-own safety choices; otherwise use the most specific offered own
  value or factory default. Everywhere is a default that a Project can loosen, subject to PS-144 repository-origin
  acceptance and mandatory/parent/managed ceilings. Resolution alone never accepts repository-origin loosening.
  Permission rule specificity remains Permissions-owned. Numeric capacity
  rows use computer_ceiling: min(requested Project/narrower value, Computer own cap), with no Computer own cap
  meaning no added ceiling; owner fixed limits still hold. per_item invokes the existing domain merge by stable
  name/ID and never invents structured field merges.

  Every unoffered level has exactly one closed not_offered reason: names_a_program, names_a_folder, about_hardware,
  about_the_network, about_this_project, about_the_screen, not_about_the_screen, set_inside_a_thing, same_for_you
  or managed. The panel says why in plain words. Unknown classification, missing careful_order or incomplete reasons
  fail validation rather than offering an unsafe level. The seven canonical additions below replace the earlier proposal spellings. Plans/settings_inventory.json owns their reviewed
  classification and actual census; 1010 is the starting count, and exactly these seven additions give 1017 rows,
  preserving 12 categories and 38 manager keys.

  Canonical new rows are code.execution.projects-folder and code.execution.no-project-chats-folder,
  Computer-only with computer_key=execution_host and execution_host_home_relative defaults Projects and
  Puppet Master Chats; general.interaction.no-project-default-computer, Everywhere/Computer with
  computer_key=server and default local_if_claimed_else_main; safety.rules.cross-project-read-policy,
  Everywhere/Computer with computer_key=server and default ask_once_per_chat;
  safety.rules.allow-project-reading, Project-only default true; safety.rules.incoming-chat-messages,
  Project-only default ask_me; and safety.rules.computer-use, an Everywhere default with Computer and Project
  own values, computer_key=execution_host, combine=more_careful, careful_order deny, ask, allow and default ask.
  This permission answer is independent of desktop capability/readiness and exact per-chat/per-app/disclosure
  admission; an allow value alone never authorizes screen use. Host-relative paths resolve only against that
  actual Host's home; they are never portable copied paths. Earlier assistant.* spellings are source lineage, not extra rows or write aliases. The
  permission answers map once to Permissions-owned runtime keys; registration, defaults and readiness grant
  no read, incoming-message, tool or screen-use authority.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-002
- SSYS-004
- MA-073
unblocks: []
acceptance_criteria:
- Review covers every live inventory row plus admitted additions; all unoffered levels have one closed reason.
- Ordinary Project own wins over Computer, declared safety picks the more careful own choice, custom profile falls
  back to Computer, and capacity clamps visibly.
- Theme halves cannot resolve from different levels; motion combines Everywhere/Device/Project with OS.
- Project-relative paths stay portable with that Project; Computer programs/paths/ports never become Everywhere
  or copied Project values.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_059
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S1–S3/S14
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
- 'source_ref:chat:20261103: Jared: "when I say separate settings for different environments, that is what T3
  calls the different computers, but it is where Puppet Master runs its work."'
preserved_exact_tokens:
- layering
- careful_order
- safety.rules.default-tool-permission
- safety.approvals.doom-loop-action
- safety.protection.external-dir-action
- safety.rules.per-tool-permissions
- safety.protection.web-tool-permissions
- theme_pair
- computer_ceiling
- more_careful
- per_item
- not_offered
- ClientRecord.local_server_id
- code.execution.projects-folder
- code.execution.no-project-chats-folder
- general.interaction.no-project-default-computer
- safety.rules.cross-project-read-policy
- safety.rules.allow-project-reading
- safety.rules.incoming-chat-messages
- safety.rules.computer-use
negative_constraints:
- Do not infer levels from scope, path keywords or display names.
- Do not put Computer and Device together in may_differ_by.
- Do not treat every safety.* row as more_careful or invent a custom-profile rank.
- Do not create an Execution Environment or project-on-computer settings level.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-060 - Single Writers, Following Copies, Join And History

```yaml
plan_unit_id: SSYS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Everywhere uses pm.settings_level_snapshot.v1 at the explicit settings home Server; each Computer level is written
  only by that Server or its dispatching Server for a tagged Execution Host; each Device level only by that client_id;
  Project own values use pm.project_settings_snapshot.v2 at its Home Server/Vault. Computer/Device mirrors at
  the home and following Everywhere copies are read-only. A Device changing its own screen value while away is
  its sole writer, not an offline replica. Pairing and settings.follow admission are SRV-016. Owner devices need
  settings.everywhere.write and a direct current session to the home for Everywhere writes; a follower never relays
  another Client's authority. Limited clients cache only needed current views, with no secrets, not every Computer's
  paths/network.

  CAS is per setting within exact level/key; independent settings can commit, the same-setting stale edit refuses
  stale_setting_revision, and the theme_pair is one group. No clock-order last-wins merge is admitted. Stale preview
  needs a fresh read/preview. History records source, actor, initiating device, actual writer/level/key, UTC time,
  revision/hash, redacted before/after summaries, mode/authority and batch. Undo is available while the recorded
  values/revisions still match; otherwise Set it back is an explicit compensation naming the later edit. Batch
  Undo lists changed-since exclusions and settles each writer honestly.

  The settings.layer.changed family (registered by DL-300) is application_only: changed setting IDs, level/key, redacted summaries,
  revision/hash and receipt refs only, with actual Project level in metadata where relevant. Native emission stays
  disabled until its producer is adopted (requires_owner_adoption). Followers catch up by snapshot/cursor/deltas
  without duplicate apply. pm.settings_differences_index.v1 indexes which authorized Project/Computer/Device has
  an own value, redacted summary, revision and as-of time. It is never a write authority; stale/unreachable entries
  say May differ rather than Same everywhere. Routine Synced is absent; Doctor shows only exceptions.

  Unreachable writers refuse writes, queue nothing and never elect a replacement. An explicitly chosen temporary
  Computer/Device own value is allowed only where offered and never silently promoted on reconnect. Cross-Computer
  copy/promotion/reset returns one batch report with done, not_reached or refused per target, plus explicit fresh
  Finish recovery; no distributed atomicity claim. An Everywhere change checks all following contexts before commit
  and names blockers; an except workaround requires a separate explicit preview.

  S12 joins separately configured same-owner setups only after explicit home and trust choices. Preview every
  differing value, keep the chosen home's value by default, offer keeping the alternative on its Computer/Device
  only where offered or using it Everywhere. Project own values stay untouched, discarded alternatives remain
  in History and join Undo lasts 30 days. No home choice, write queue, credential transfer, automatic failover
  or multi-master merge is inferred from YOLO. Home transfer/recovery is SRV-016 and backup custody remains Storage/Backup-owned.

  SP-348 owns the exact level keys config:everywhere, config:computer:server:{hex(server_id)},
  config:computer:execution_host:{hex(execution_host_id)}, config:device:{hex(client_id)} and
  config:project:{hex(project_id)}. hex encodes the complete lowercase UTF-8 identity. Canonical per-setting
  own rows and level heads are distinct from point-in-time snapshots, follower mirrors and the differences
  index; there is no second mutable whole-document config writer. Device custody never fabricates
  writer_server_id. SRV-016 freezes cmd.server.settings_home.move and cmd.server.settings_peer_trust with
  their sole Server handlers and typed request/result refs; Settings join choices use the five existing
  Settings commands.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-002
- SSYS-009
- SRV-004
- SRV-006
- DL-300
unblocks: []
acceptance_criteria:
- Offline home/Computer/Project writers make no write or queue entry; Device own screen writes still use only
  that Device.
- Independent-setting edits both commit; same-setting stale CAS and theme-group conflicts refuse.
- Stale index results disclose as-of/unreachable sources rather than false equality.
- Join keeps Project own values and every alternative, with 30-day currentness-safe Undo and no secret transfer.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_060
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S7/S12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- pm.settings_level_snapshot.v1
- pm.project_settings_snapshot.v2
- settings.follow
- settings.everywhere.write
- settings.layer.changed
- application_only
- pm.settings_differences_index.v1
- 30 days
- config:everywhere
- config:computer:server:{hex(server_id)}
- config:computer:execution_host:{hex(execution_host_id)}
- config:device:{hex(client_id)}
- config:project:{hex(project_id)}
- cmd.server.settings_peer_trust
negative_constraints:
- Do not introduce writable followers, automatic failover, clock-order resolution or offline write queues.
- Do not expose secrets or all Computer paths in bounded client caches.
- Do not describe a partly finished multi-Computer batch as atomic or successful everywhere.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-061 - Manager Home, Reach, Project Switches And Whole Versions

```yaml
plan_unit_id: SSYS-061
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Manager things have an owner-held home, reach, declared project_switch_ids and an optional whole Project version
  by stable ID. Home is the library at the settings home, one Computer's installation/sign-in/SSH material, or
  one Project's own record. Reach uses Every project or Only these projects and, where programs matter, the eligible
  Computers; Every project includes No project. Reach never proves installation, credential readiness or work
  permission. A whole Project version replaces its library counterpart only under that owner's existing stable-ID
  rules; protected built-ins cannot be shadowed. No per-field merge or new manager settings engine is introduced.

  Ordinary manager rows use SSYS-059. Project switches are declared inventory/owner inputs with home=thing and
  may_differ_by=[project], never arbitrary owner fields promoted to ordinary settings. On/off, selected tools
  and carefulness stay in the existing owner's binding records. Save writes the thing's actual home with narrow
  retarget feedback and Undo through its owner; setting values use Settings transactions. No project resolves
  library reach and applicable Computer readiness while omitting Project switches/versions.

  Exactly 38 descriptor keys remain. scope_model is rows, things, computer_records, status_only or flow, or an
  explicit list; project_switch_ids is declared, possibly empty. required_target_fields retain all domain-specific
  identity fields and add level/level_key conditionally for value routes, with Project required only for actual
  Project targets. Server/SSH/Remote Access/backup destination/install records are owner records; updates expose
  Everywhere/Computer policy. project-defaults-templates is visibly Saved setups, detached configuration; Starters/My
  starters is a separate Project-owned file-set route without a 39th manager. Contributed copy parts name their
  existing owner writer, preview, result, readback and rollback; Settings cannot write another owner's files.
  Plans/projects_refresh_command_bindings.json records the command/schema/wiring join; an operation remains handler_unavailable until its native owner handler and current authority are proven.

  The declared Project switches are personas.library.disabled-bundled for mutable specialties only,
  system.mcp.server-enabled, system.mcp.tool-toggle, extensions.skills.skill-on-off and
  extensions.plugins.plugin-on-off, subject to each owner's stable-ID binding and protected-builtin
  exclusions. These are declared project_switch_ids, not arbitrary fields exposed by a manager.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-015
- SSYS-020
- SSYS-059
unblocks: []
acceptance_criteria:
- All 38 descriptors declare scope_model and project_switch_ids without changing their keys or domain owners.
- Library reach includes app chats only when intended; Project-owned things do not leak into No project.
- Whole versions use existing protected-builtin/ID rules and copy/Undo goes through the owner.
- Install/auth/profile/route/status records remain distinct from ordinary Settings values.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_061
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S8–S11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- project_switch_ids
- scope_model
- home=thing
- may_differ_by=[project]
- Saved setups
- Starters/My starters
- '38'
negative_constraints:
- Do not invent per-field thing merges or a second owner writer.
- Do not auto-install or auto-trust copied executable content.
- Do not turn reach, settings.follow or a shared account label into work authority.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-062 - Detached Layered Copy And Destination Account Readiness

```yaml
plan_unit_id: SSYS-062
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The one Settings copy engine serves New Project, onboarding, Settings Transfer, duplicate_configuration, Saved
  setups, compare/import/promotion/join previews and their admitted owner callers. copy_basis defaults to own_values;
  Advanced effective_values is labelled Keep them fixed, freezes only eligible selected values at offered targets
  and creates no link to the source. picked_setting_ids is a subset of the selected disjoint eleven selector sets
  from SSYS-007. project_only_rows is off by default, as are copied instructions/build files/remotes and Computer-effective
  freeze. Device screen values, host programs/paths, credentials, CLI profile directories, SSH keys, pairings,
  files/history and live Goal/Plan/Crew bodies never travel as Settings. Computer/device copy is limited to explicitly
  compatible offered capacity/look/screen values; local paths are never transplanted to another Computer.

  owner_thing_previews contribute source-owned things, Project versions/switches and explicitly previewed library
  reach additions through their existing owners. The preview records each whole source record's version/hash/revision, destination home, declared stable-ID
  switches/reach deltas, exact owner commands/handler refs or a typed unavailable gap, source/target IDs/revisions, secret exclusions, per-part restore/readback/rollback and reach
  deltas. New owner-bearing copies select owner_thing_copy_contribution_v2: preview_ref/preview_sha256 identify
  the exact owner preview, previewed parts have no after/readback evidence, and done parts require non-null
  before_ref (the per-part restore point), after_ref, readback_ref and rollback_ref. settings_transaction_preview_request_v3,
  settings_transaction_preview_v3 and settings_transaction_result_v2 admit that edition while retaining historical
  empty-owner/flat shapes; older owner-bearing definitions remain read-only compatibility, never new apply authority.
  A rollback removes only unchanged copied records and recorded reach additions, never the Project or
  unrelated work. Owner participation cannot bypass S15 executable/repository trust or change protected built-ins.

  Use the same AI accounts is on by default when the source names accounts, copies provider_id/account_id/order
  choices only and uses the single MA-074 account_resolution list for the destination_server_id and actual Host/Environment.
  Outcomes are ready_here, check_there, sign_in_there, key_needed, not_installed, expired or cannot_move. A same-Computer
  chosen account may reuse its already-held credential_ref/profile_ref through the destination's own scope-bound
  connection after current checking; an unchosen ready account cannot. Missing or device-bound auth retains the
  intended account with a truthful setup step, never another account, auto-install, secret transfer or false Ready.
  A different Computer or account invalidates the readiness preview.

  Copy is offered in setup only when creating a new registry Project, including registration of previously unregistered
  content; never while simply opening a registered Project or on Later/connect-only. Your usual settings is default.
  Draft preview is bound to destination_draft identity/revision/hash and null Project. Only after real Project
  reservation may it rebind to ordinary preview/apply, with explicit setup choices taking precedence, readback/rollback
  before Project listing and exact settled-resume replay. Existing-destination Settings Transfer remains separate
  and valid.

  Preview shows selected/excluded rows, things, account states, affected following contexts and one total. Ordinary
  apply uses the bound current preview, per-writer restore points and readback; multi-Computer results are done/not_reached/refused,
  queue nothing, and offer explicit Finish. One batch report and Undo removes copied values/things/reach additions
  subject to currentness, never remote resources. Regular uses required confirmation; a clear requested YOLO copy
  uses Plans/Permissions_System.md's mode authority without a second yes and still shows preview/report/Undo. Account setup needing a person
  remains protected. P12's selector label is Notifications & limits everywhere this copy flow appears.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-007
- SSYS-008
- SSYS-009
- MA-074
- MACS-006
unblocks: []
acceptance_criteria:
- Default copy includes only portable source own values, owner things and intended account choices; unset destination
  values follow Everywhere.
- Advanced picked subsets are exact/disjoint, forbidden classes remain excluded even under effective_values, and
  owner parts roll back together within each writer.
- Same-Computer chosen-account reuse succeeds only with destination-owned connection/current proof; cross-Computer
  sign-in or missing installation stays truthful.
- Draft changes invalidate the preview; no Settings apply/listing before real reservation and verified readback.
- Batch outcomes are honest, no work queues offline, and Undo preserves unrelated later changes and the destination
  Project.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_062
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S9–S11/P12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- own_values
- effective_values
- Keep them fixed
- picked_setting_ids
- project_only_rows
- owner_thing_previews
- account_resolution
- ready_here
- check_there
- sign_in_there
- key_needed
- not_installed
- expired
- cannot_move
- Notifications & limits
negative_constraints:
- Do not copy sign-in bytes, profiles, device pairings, local paths or live owner bodies.
- Do not auto-select Keep them fixed, project_only_rows, foreign remotes or broader reach.
- Do not use a copy transaction as conversion or publication authority.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-063 - Changed, Origin Details, Targeted Edits And Undo

```yaml
plan_unit_id: SSYS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  A row answers two different questions from pm.settings_effective_value.v1: changed_from_default compares its
  effective value with Puppet Master's default; varies_elsewhere says an own value exists elsewhere or that the
  index is stale. Changed uses the existing mark plus the visible word Changed at least 11.5 px and a 1px outline
  around the control itself, never a side stripe or colour alone. A requested value held by a Computer ceiling
  stays editable as requested, with the effective value and limiting/safety owner reason visible. An own value
  equal to Default can say This project/Computer without a Changed mark. Default rows stay quiet.

  The old question icon becomes a real labelled origin-word Details button. It says Details when nothing differs,
  Varies for a shared value with other own values, This project or the actual Computer/Device name when that origin
  supplies the own value, Each account/provider/persona for thing rows, or Managed. Computer-only/Project-only
  rows always name their subject. The setting title also opens it. general.interaction.scope-labels (Show where
  each setting comes from) starts Off; when On, even quiet shared/default rows name Everywhere or Default. Offline/stale
  source lines say May differ and name/as-of the unreachable source.

  Keep the 350 px inspector and host responsiveness. Its visible Close, crumbs/title and exact context precede
  the now/default/requested/effective block. Where it applies opens Used everywhere, except …, groups only offered
  Everywhere/Computers-or-Devices/Projects, lists up to six differences then and N more, covers followers together,
  and marks In use here with its reason. Unoffered groups have one SSYS-059 reason sentence. Labelled searchable
  Set for a computer/project menus leave unavailable choices focusable with reasons; Computer program rows can
  show Environment sub-lines without another level. Choosing here changes names the exact target before the existing
  choices/help, then Recent changes shows up to three redacted changes and Undo/Set it back, See all changes and
  For experts. One shared anatomy serves manager drawers and hosted controls; it adds no second Advanced disclosure.

  Human direct row edits write the current origin; Default/following Everywhere writes Everywhere, Computer/Device/Project
  own writes that origin, and thing fields use their owner's actual home. The target menu can deliberately choose
  another admitted level/key. Agents instead follow SSYS-065 narrowest-level rules. One outcome note says Saved
  for the named place, who changed it and Undo; a wider write offers Only for this project/computer/screen when
  offered, as one fresh transaction restoring the broader prior value and setting the narrow own value. Safety
  Everywhere edits show affected contexts first. Make this the everywhere value and Use this everywhere are explicit
  previewed batches; the latter removes only previewed own values and cannot operate on a Project-only row. Reset/Differences/Compare
  reuse the same engine and show exact targets/currentness, not another writer.

  No-project Settings opens normally in the resolved look and can edit named authorized Projects; an unnamed Project-only
  row offers choosing a real Project. Change view freezes a look-as context and says what is being edited, independent
  of focus. Limited devices get read-only shared/Computer lines with a reason. Writer loss disables mutation without
  a queue. Keyboard focus, labelled menus, aria-expanded and descriptive names remain; Escape closes in host order
  and returns focus to origin. Outcome notes use a status live region, with keyboard-accessible Undo. On narrow
  hosts the origin word wraps below the control and stays visible. Reduced Motion adds no glow/flash. These rules
  replace the older general optional-Close clause only for Details.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-006
- SSYS-009
- SSYS-033
- SSYS-059
- SSYS-060
unblocks: []
acceptance_criteria:
- Changed and Varies remain independent; own-to-default, shared-changed, managed, stale and restricted-effective
  states render truthfully.
- The 1px control outline has a word/mark, no row stripe, no clipped origin button and visible Close at 350 px
  anatomy.
- Every displayed target and origin agrees across row/panel/search/hosted control/History with the same resolver
  output.
- Only for changes the exact narrow target through one compensating transaction; stale Undo never overwrites later
  work.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_063
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S4–S6
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- pm.settings_effective_value.v1
- changed_from_default
- varies_elsewhere
- Changed
- 1px
- Details
- 350 px
- Where it applies
- Choosing here changes
- Recent changes
negative_constraints:
- Do not use colour alone, side stripes, pills or icon-only Details/Close.
- Do not make a human origin edit the default algorithm for agents.
- Do not compute Changed/Varies/precedence separately in GUI consumers.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-064 - Pre-Release Fold Without Silent Value Changes

```yaml
plan_unit_id: SSYS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  There is no shipped product data to migrate. SSYS-064 is a pre-release canon/fixture/concept-adapter fold contract,
  not permission to import discovered browser storage or local files. Retain exact pm.project_settings_snapshot.v1
  as input; current output is sparse pm.project_settings_snapshot.v2 and actual level snapshots. Run only after
  the intended settings home/writers exist, with currentness, explicit preview/confirmation, restore points, source
  hashes, source=migrated and per-context readback. No app startup or YOLO request automatically applies legacy
  inputs.

  Shared values move to Everywhere only when every Project agrees on the effective non-default value; remove redundant
  own copies in that case. Otherwise keep disagreement as each Project's own values and leave Everywhere at Default,
  offering later explicit promotion. Project-only values remain Project-owned; thing fields go to their existing
  owners. Values marked default/restored_default fall through only with their explicit provenance checked, so
  an explicitly chosen value is never mistaken for a factory seed. List every screen/Computer-only exception before
  changes: host-only disagreements on one Computer choose the most common valid value with alternatives retained,
  and screen values choose the latest proven changed value as Everywhere with Devices initially empty. If provenance/tie/clock
  evidence cannot choose uniquely, keep alternatives and require an explicit owner choice rather than inventing
  an order. Screen/Computer exceptions disclose each affected context and alternative; all other per-context effective
  values must read back unchanged. Theme halves fold together, custom safety fallback and ceilings still apply,
  and source values/alternatives remain recoverable.

  MA-073 historical Project-local global defaults and the old terminal shared app/Project value follow the same
  fold. Every host/program path stays attached to its original tagged Computer identity; it is never transferred
  as a portable Project or Everywhere value. Mixed-version Servers retain their old contract until upgraded and
  disclose compatibility/refusal; no cross-version second writer or auto-failover is created. The concept review
  moment is demonstration evidence only and is not a required shipped-user migration screen.
gui_related: false
gui_classification_reason: Defines data, custody or resolver contracts consumed by existing GUI owners.
depends_on:
- SSYS-002
- SSYS-021
- SSYS-059
- SSYS-060
unblocks: []
acceptance_criteria:
- Agreement promotes only shared eligible non-default values; disagreement stays as own values with alternatives
  retained.
- Readback proves unchanged effective values in every non-exception context and lists each screen/Computer exception.
- Ambiguous provenance/ties require explicit choice, not clock-last-wins or lossy selection.
- Legacy discovery, startup, a partial upgrade and YOLO alone never auto-apply the fold.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_064
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S7/S9/S12;
  SETTINGS §8
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- pm.project_settings_snapshot.v1
- pm.project_settings_snapshot.v2
- source=migrated
- default/restored_default
- Everywhere
negative_constraints:
- Do not claim shipped-install migration or native implementation.
- Do not overwrite explicit settings with fresh defaults or silently discard alternatives.
- Do not import concept data, host paths or secrets as current authority.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

### SSYS-065 - Agent Targets, Limited Devices, Onboarding And Updated Defaults

```yaml
plan_unit_id: SSYS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  An agent uses the narrowest level offered within its own admitted work context: Project own for Project work,
  otherwise actual Computer/Device where offered; thing changes remain with their owner. A read grant or a message
  to another Project gives no setting-write authority. In Regular an agent Everywhere write needs the person's
  current affected-context confirmation through the ordinary Settings preview/apply. In YOLO a clearly requested
  Everywhere write, or an Everywhere-only row, uses Plans/Permissions_System.md's task/mode authority without another ordinary yes; it never
  widens a Project-only task to Everywhere or forges a human confirmation. It still shows preview, actor/place
  report, History and Undo. No agent changes credentials, Managed values, settings home, Server-peer trust or
  another Project's values. Source/repository loosening and Always scope are Plans/Permissions_System.md's S15/S16 protected choices, never
  skipped merely by YOLO.

  Defaults, home, reach and readiness never authorize a tool dispatch, protected auth, grant issuance or cross-Project
  setting edit. The existing safety.protection.external-dir-allowlist and safety.protection.approved-commands
  retain their IDs and sole Permissions/FileSafe authority; a copied rule/profile grants no trust or working-root
  permission. A limited ClientAccessPolicy allows only its own Device screen settings and explicitly admitted
  Project scope; Everywhere/Computer lines stay read-only, with owner devices separately needing settings.everywhere.write.
  Ownership, not shared tailnet, library reach or membership, admits following/join/home transfer. The owner chooses
  the settings home and completes claim/bootstrap/pairing. Routine identifier reconciliation cannot invent a generic
  approval exemption.

  Onboarding writes once through the same Settings transactions at its actual commit boundary. First setup maps
  the chosen look pair, Plain English, FileSafe/profile and ordinary provider defaults to Everywhere only where
  offered; exact program/Projects-folder discovery belongs to that Computer; Project answers belong only to a
  real Project. Already explicit existing shared values are preserved unless an explicitly previewed choice changes
  them; a fresh seed never overwrites them. On a later Computer, offer joining the existing home first, separate
  setup under Advanced, then an explicit S12 join if needed. After a chosen join, first paint resolves local committed
  copies rather than flashing Basic Dark. Approved Set up a project later still performs AI setup on the named
  claimed Computer and enters a genuine No project chat after the real application/Computer setup commit, with
  no Project reservation, Settings copy or Wizard/PRD/Orchestrator activation. Protected sign-in remains human-only
  under MACS-006, installation explicit and readiness per actual Host/Environment.

  A new shipped default affects only rows still following Default. On first open after update, show one list of
  changed defaults and Keep the old ones; that explicit choice writes allowed Everywhere own values with source=migrated,
  or the actual only offered level when Everywhere is unavailable. No update silently creates compensating own
  values. Existing own values and active run snapshots remain unchanged. YOLO alone does not choose home/trust,
  accept a repository loosening, grant durable Always, import legacy data or keep old shipped defaults.

  App Crew Auto initializes once from resolved defaults; a later Settings edit does not rewrite an admitted
  run. Saved scheduled model/account/runtime choices remain frozen by their scheduling owner and revalidate
  on the actual work Computer at dispatch. Neither defaults nor current-view selection substitute for those
  snapshots, the Server-owned pause record, Stop epochs or grant authority. SSYS-059 gives the canonical new
  row IDs; earlier proposal spellings are preserved only as source lineage.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SSYS-002
- SSYS-009
- SSYS-059
- MA-074
- MACS-006
unblocks: []
acceptance_criteria:
- Regular agent Everywhere requires confirmation; requested YOLO Everywhere uses mode authority while a local-only
  request remains narrow.
- Limited/Member devices cannot write shared/Computer state through a follower, read grant or borrowed session.
- Later sets up AI at actual app/Computer scope and enters No project; no fake Project or silent local claim.
- Onboarding/update mapping respects offered levels and never overwrites explicit existing values with seeds.
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- scripts/pm-settings-layering-check.py
- future native owner/command/writer/readback/security evidence; not_run
risk_class: settings_authority_or_scope_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_ssys_065
implementation_surfaces:
- Plans/Settings_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S13/S15/S16/N12/N15
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
- 'source_ref:chat:20261103: Jared: "YOLO mode needs to absolutely be able to git push and publish."'
- 'source_ref:chat:20261103: Jared: "Plan mode and scheduled tasks are also available in no project. It''s only
  planning wizard/prd builder/orchestrator that isn''t."'
- "source_ref:historical-proposal-spellings: assistant.no-project.default-computer; assistant.cross-project.read-policy; assistant.cross-project.allow-reading; assistant.cross-project.incoming-messages; superseded by SSYS-059 canonical IDs, no write aliases"
preserved_exact_tokens:
- Regular
- YOLO
- safety.protection.external-dir-allowlist
- safety.protection.approved-commands
- settings.everywhere.write
- ClientAccessPolicy
- Set up a project later
- No project
- source=migrated
negative_constraints:
- Do not turn another Project read/request into setting write authority.
- Do not let agents self-approve trust, credentials, Managed values, home changes or Always scope.
- Do not add a second onboarding appearance writer or apply Settings copy on Later.
owner_hints:
- Plans/Settings_System.md
- Plans/Server_System.md
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Plan_Document_System.md

## 3. Contracts, Schemas, Events, Or Data Shapes

### 3.1 Logical level and Project-own settings snapshots

`pm.settings_level_snapshot.v1` represents sparse Everywhere/Computer/Device values, source and per-setting revision maps with identical keys, tagged level/key and actual sole writer. `pm.project_settings_snapshot.v2` holds sparse Project-own maps and `layer_model=ladder_v1`; historical `pm.project_settings_snapshot.v1` stays exact/readable as fold input. Sources are `default`, `explicit`, `copied`, `restored_default`, `imported`, `migrated`, `promoted`. No Project snapshot exists without a real Project; shared/device records need none. `pm.settings_effective_value.v1` and `pm.settings_differences_index.v1` are derived read-only outputs, not extra writers. SSYS-021/059/060 are authoritative.

Amended 2026-10-16 (SSYS-010, SSYS-054, SP-333): the appearance projection is derived from exactly `general.visual.theme`, `general.visual.theme-mode`, `general.visual.glass-transparency`, `general.interaction.show-tooltips`, and `general.visual.reduce-animations`. The retired `general.visual.glass-background-mode` is neither a current derivation input nor a required Glass projection field; old Mesh/Depth/Minimal values belong only to SP-333's compatibility migration and have no active writer. Shared Wallpaper is the committed `general.visual.wallpaper` value at the offered origin level under SSYS-054, not a second Glass-only background authority. The projection is read-only convenience data, not a second write authority. `Plans/storage-plan.md` retains physical key, durability, recovery, retention, and receipt persistence.

### 3.2 Atomic mutation envelope

`cmd.settings.transaction.preview` accepts `pm.settings_transaction_preview_request.v1` and returns `pm.settings_transaction_preview.v1`. Preview binds operation kind, source/destination levels, tagged keys and per-setting revisions, selectors, exact sorted setting IDs, proposed values, exclusions, conflicts, before/after hashes, owner validation, restore-point plan, effects, generation, preview hash, expiry, confirmation, and current availability. Preview writes nothing.

`cmd.settings.transaction.apply` accepts `pm.settings_transaction_apply_request.v1`. It requires request/scope/target-level-key/idempotency/actor/mode/permission identity plus the preview ID, generation, hash, and bound per-setting revision vector. `cmd.settings.transaction.rollback` accepts `pm.settings_transaction_rollback_request.v1` with the exact transaction, rollback token, revision, and reason. Both settle through `pm.settings_transaction_result.v1`: `applied`, `no_change`, `blocked`, `failed`, `rolled_back`, or `recovery_required`, with previous/current revisions, exact changed IDs, snapshot/receipt/rollback refs, disabled reasons, and replay status. A result contains no raw credential or duplicate raw value body.

### 3.3 Transfer preview

Transfer, Restore Defaults, import, and migration use the same transaction preview. Transfer selector categories resolve once to the exact sorted IDs and never expand during apply. Export is separate: `cmd.settings.export` accepts `pm.settings_export_request.v1` and returns `pm.settings_export_manifest.v1`, a detached exact-ID artifact manifest with source revision, exclusions, format, artifact ref, hash, size, timestamp, receipt, and `credential_material_included=false`.

`pm.settings_migration_preview.v1` permits `legacy_global_snapshot`, `legacy_singleton_settings`, `settings_export_v1`, or explicit `project_snapshots_v1_fold` sources. It records source hash, destination level/key/revision vector, detected/mappable/excluded IDs, unmapped keys, normalized theme pair, and transaction-preview ref. `confirmation_required=true`, `auto_apply=false`, and `legacy_source_authoritative=false` are invariant. Discovery or app startup cannot overwrite an existing Project.

### 3.4 Manager route and summary

`Plans/settings_system_contract_fixtures.json` freezes exactly 38 manager keys. It splits Browser from Source Control; Server claim from Server/Host topology; Project hosting from Project movement; SSH from Remote Access; and retains Full Server Backup, Project Backup, and Storage/Retention/Recovery as distinct typed owner/detail descriptors and compatibility targets within one visible `Data Backup and Retention` grouping. Settings transfer remains separate from export/migration, Onboarding/Guided Tour remains separate from Doctor, and Teacher/Help, Project Search Index, and DRY Method remain distinct owner projections. The registry is the stable machine navigation/ownership census; adding, removing, or renaming a manager requires this owner and schema/fixture to change together.

Each descriptor freezes title, purpose, owner refs or named owner gap, disposition, route, search aliases, owner action IDs, required exact target fields, and `cached_bounded_summary_then_selected_details`. `pm.settings_owner_projection.v1` carries bounded requested/effective state, health, exact availability and reason, generation/currentness, owner contract, operation, receipts, evidence, summary, and details route. It prohibits raw logs and fixes `settings_is_runtime_owner=false`. `pm.settings_ui_action_projection.v1` keeps action, command, target, owner, availability, requested/effective state, operation, and receipt axes distinct.

`pm.settings_named_visible_state_projection.v1` closes the three historically omitted manager families without creating new runtime owners. Its exact registry keys are `teacher-help`, `project-search-index`, and `dry-method`. Each descriptor freezes the visible field names, retained owner refs, exact Settings route, negative constraints, `settings_is_runtime_owner=false`, `raw_logs_included=false`, and `owner_action_policy=owner_admitted_command_or_typed_route_only`. Cached or stale fields never become owner truth, and the field registry is presentation/data-shape canon rather than a second domain reducer.

### 3.5 Older-packet command disposition

`packet_command_dispositions` is the fail-closed reconciliation registry for all 80 tokens in the older Settings candidate command register. Its property-name enum plus `minProperties=80` and `maxProperties=80` reject every omission or addition. Each token is exactly one of `reuse_canonical_command`, `approved_alias`, `superseded_by_typed_local_ui_action`, `retired_bakeoff_only`, or `rejected_with_reason`; the live partition is derived from that registry. The earlier 41/0/7/1/31 census is historical: SSYS-010 and DL-200 retire the visible theme-preview producer, moving its packet token from reuse to rejection without changing the 80-token lineage set. Reuse records the admitted canonical target or transaction sequence. The seven local actions share `pm.settings_local_ui_action_payload.v1` and authorize no domain mutation, persistence write, or owner operation. Retired and rejected rows carry no target. Every row fixes `native_handler_claim=false`; this registry creates no central command, alias, handler, production wiring, or native execution.

### 3.6 Events and command boundary

Settings semantically registers the five command IDs in SSYS-018 and the six route-only UI action IDs in SSYS-019. Central command/catalog/wiring owners must consume those exact contracts; until they do, the action is disabled with `command_not_registered` or `handler_unavailable` and dispatches nothing. SSYS-060 defines the application-only `settings.layer.changed` family, registered by DL-300; no writer emits it until its producer is adopted (requires_owner_adoption). This prose supplies no native producer or certification. If a retained owner requires persistence through EventRecord, its family must be independently admitted through Event Authority; absence remains `missing_event_registration`, never success.

Under DL-041, for the DRY default-guard naming decision, the approved future event identity is `settings.updated` with exact setting identity `app.agent_rules.dry_method_default_guard` and the existing `transaction_id` from `pm.settings_transaction_result.v1`; its `request_id`, `project_id`, `changed_setting_ids`, revisions and `receipt_ref` remain the current transaction join, not new event fields admitted here. A key spelling still grants no scope or writer authority; genuine application level transactions are admitted only by SSYS-002/059, independently of this unresolved key-to-inventory mapping. It does not match the current ordinary `setting_id` grammar and is not automatically the inventory ID `memory.assembly.dry-method-guard`; do not insert the owner key into `changed_setting_ids`, infer that alias, or claim the writer mapping is closed without explicit owner evidence. Until that key-to-valid-setting-ID and writer mapping is proven, the toggle remains disabled with the existing `owner_contract_missing` reason and dispatches no mutation command and performs no setting write. `cmd.settings.agent_rules.dry_method_default_guard.set` remains retired with no dispatch alias. Historical `settings.agent_rules.dry_method_default_guard.updated` records remain read-only source/history lineage until an explicit payload-compatible migration is separately established. This approved naming choice registers no EventRecord and supplies no missing producer, schema or checkpoint authority.

The closed Settings disabled-reason vocabulary is the schema enum. `available` requires null reason and human text; `disabled` or `hidden` requires both an exact reason code and non-empty human explanation. A retained owner may attach owner evidence and an owner-specific detail ref but Settings does not copy the owner's raw enum into a competing Settings reducer.

ContractRef: ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

## 4. Integration Surfaces

### 4.1 Shell and route integration

Settings opens from Home, Assistant Chat, command palette, natural language, owner remediation, a manager card, or a setting deep link only through `cmd.settings.open` and `pm.settings_route_request.v1`. A target is exactly one `setting_id`, which may also name a `provider_id` and, inside it, an `account_id` (SSYS-019, for SSYS-044's hosted controls), or one stable `manager_id` plus optional `detail_id`; visible labels, search text, and DOM selectors are never authority. The exact context always serializes Project, Server, Vault, Host, Environment, Client, provider, provider route, thread, operation, topology generation, and expected revision, using null only when a field is inapplicable.

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

Theme changes update the shell only after atomic acceptance at the offered level. Project layout changes remain with the Project layout owner. `pm.settings_appearance_preview.v1` may temporarily paint a candidate appearance but writes nothing and reverts on cancel, close, expiry, route change, or Project switch. Title bar, status bar, every panel and tab, Chat, and Settings consume the same Settings-resolved atomic theme family/mode pair from Everywhere, Device or Project, including before any Project opens (SSYS-059, DL-286); no surface keeps a second local theme authority. The terminal's scheme, font and effects follow that snapshot through "Follow look" unless the terminal look rows of SSYS-051 choose otherwise.

Amended 2026-10-16 (SSYS-054, SP-333): the theme family/mode pair yields exactly ten built-in variants. Wallpaper is the shared choice across looks. The former Glass `Mesh`, `Depth`, and `Minimal` modes are retired compatibility inputs with no visible control or writer; SP-333 owns their migration. Glass alpha remains separate and is bounded to 0.35..1.0 for Dark and 0.45..1.0 for Light, and the Glass controls show only while a Glass family is active (decided 2026-09-27; they were previously kept visible but disabled with `not_applicable`), as do the Retro texture rows under a Retro family and High contrast under a Basic family. `general.interaction.show-tooltips=false` suppresses hover hints only; focus descriptions and Help/Details remain. Effective reduced motion is the logical OR of applicable Everywhere, Device and Project own requests (or the factory default when none is set) and the platform preference and calms nonessential movement without suppressing progress, focus, error, or state-change feedback.

Appearance application model (decided 2026-09-27, SSYS-041). Every appearance row changes what the app shows; none is stored without effect. Beyond the theme pair, Glass rows, reduced motion and the NieR family (the three paragraphs after this one), the rows apply through the per-variant token contract of `Plans/FinalGUISpec.md#F3-426` as overrides layered over the active variant's table: `general.visual.ui-scale` scales the whole app; `general.visual.font-size`, `general.visual.line-height` and the animation-speed choice scale the variant's type sizes, line heights and motion durations (scripted motion included) and exist only while one of them differs from its default; `general.visual.interface-density` and `general.visual.padding-scale` set the spacing steps; `general.visual.border-width`, `general.visual.border-radius` and `general.visual.scrollbar-width` set the border-width, radius and scrollbar-size tokens; `general.visual.app-font` swaps the display and body fonts for the system fonts; `general.visual.high-contrast` (Basic families) and `general.visual.focus-indicator` set contrast and the keyboard focus outline; `general.visual.retro-effects`, `general.visual.pixel-grid-opacity` and `general.visual.scanline-opacity` set the Retro textures. An accent choice sets the primary accent, its RGB triple and the accent tokens derived from it from precomputed per-mode values (a brighter shade in Dark, a deeper one in Light), never by runtime colour derivation. Unchanged means the theme's own: a row whose value was never changed writes no override, so each variant keeps its own accent, corners, borders, fonts, spacing and scrollbar; the first accent choice and a "use the theme's" action on the theme-owned fine-tuning rows (border width, corner roundness, scrollbar width) mean exactly that, and those rows present the active variant's value rather than an inventory literal until a value is chosen. Reset removes exactly the override the row wrote and nothing else. Own appearance values follow the same atomic acceptance and preview at each row's offered levels under SSYS-059; the theme pair is offered Everywhere, per Device and per Project. Corner roundness, Border width and Scrollbar width store the default `theme` until a number is set, so the theme's own corners, borders and scrollbar width apply.

NieR theme family — Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic, Friendly, Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A NieR family pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then cmd.settings.transaction.apply; no independent NieR switch or command remains. Adjust NieR opens the one existing editor. general.visual.nier-parts (29 parts) and general.visual.nier-background remain its Adjust rows, shown when general.visual.theme is NieR Light or NieR Dark, with hidden values retained. Basic High contrast remains Basic-only; DL-301 retires the older Basic scheme control everywhere, including advanced Settings, retaining stored values only as compatibility input; Glass and Retro controls remain confined to their own families. The shared appearance owner resolves the NieR presentation from family nier and the current Light/Dark scheme; no independent override or second theme identity is introduced. NieR uses its existing precomputed palette and local fonts; its accent/font ownership while selected is unchanged, and stored general appearance overrides resume where applicable after another family is selected. general.visual.nier-mode is a retired migration-only key, removed from the active inventory. On load, stored true selects the NieR theme in the stored presentation mode (Light, Dark or Auto, resolving Auto through the OS), preserving parts and background; false or absent preserves the existing family/mode. The old boolean is then cleared, and repeating migration has no further effect. No second underlying family is saved to restore later. The title-bar selector, Guided Tour Look menu, onboarding welcome and its Look menu all offer the same five families in order basic, friendly, glass, retro, nier. Live family picks use the Settings transaction pair; inside onboarding, choose_look on ui.onboarding.choose_look previews family/mode or retained NieR Adjust values in the closed look_choice and persists once at the owner's accepted application/Computer or real-Project commit/finish boundary (DL-286). preview_nier and the independent nier_mode field are retired. Hover is silent and changes no theme; click or keyboard activation selects (O6). ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay remain presentation-only; nier.editor.open is the Adjust binding. No manager_id, route, detail id, command, new part or event is added. shell.nier.mode, tour.nier.mode and onboarding.nier.mode are retired non_dispatch census tombstones with no action, setting or production writer.

NieR Mode Parts (`general.visual.nier-parts`, a multiselect) lists 29 parts in five groups, all installed by default. Look: Square hairlines, Menu cursor, YoRHa headers, Parchment ground, Target brackets, Diamond loaders. Motion: Reboot moment, Slice open, Text decode, Page wipe, Drifting particles, Scan sweep, Alert glitch. Sound & voice: Menu sounds, Pod voice, Pod companion. Pointer: Square pointer. World: Boot sequence, Unit readouts, Block progress, Ink charts, Map ticks, Machine glyphs, Intel tooltips, Square icon strokes, Pod 042 in Chat, Quest banners, Ink empty states, Save signal. Each part is switched on or off by itself, and a part that is not installed does nothing. The row supplies the installed parts to the shared appearance owner using the existing part keys, one short key per part in the order listed: `square cursor headers ground brackets diamonds`, `reboot slice decode wipe particles sweep glitch`, `sounds voice pod`, `pointer`, and `boot readouts blocks charts ticks glyphs intel icons pod042 quests empty save`; the parts apply only while the NieR family is selected, so with another family selected every part is silent: it draws, moves and plays nothing. The row shows only while the NieR family is selected, keeps its stored list while hidden and stays findable through search and Details. It is edited in a small NieR Adjust editor, drawn like the Plug-in Chips screen of the game, with the presets Full install (all 29 parts), Quiet, Still and Colors only; a preset sets the whole list at once and each part can then be changed on its own. The same editor, which also chooses the background, opens from this row and from every Adjust NieR button: over the application as a popup dialog with a scrim, focus containment, a close button, Escape and focus returned to the button that opened it, and inside the onboarding window as a panel of that window, never as a dialog over it (`Plans/Planning_Wizard.md`, Product-design law). It opens whether or not NieR Mode is on; while it is off, the editor says so and offers to turn it on, and the parts and background chosen are kept for when it is. That editor is a row editor, not a 39th manager: no `manager_id`, route, detail id or command id is added (section 10). Opening it, closing it (its close button, Escape or the scrim) and its Play reboot moment, which plays the reboot moment around a repaint that changes nothing, are the Settings-owned typed local presentation actions `ui.settings.nier_editor.open`, `ui.settings.nier_editor.close` and `ui.settings.nier_editor.replay`, which write nothing; each live edit in it (a preset, which is one value of `general.visual.nier-parts`, a part, the background, or its Use the NieR theme family pick (Q22)) is the same transaction pair as the family choice (Q22). Inside the onboarding window the panel opens and closes, and its edits preview, through `ui.onboarding.choose_look`, while its Play reboot moment stays `ui.settings.nier_editor.replay` (DL-153). One editor serves every place it is reached from (`Plans/DRY_Rules.md#DR-056`). No part is added either: the NieR puppets, the NieR touches in onboarding and the Guided Tour, and the NieR sound kit follow NieR Mode and the existing parts (`Plans/FinalGUISpec.md#F3-598`, `#F3-599`).

NieR Mode Background (`general.visual.nier-background`, a select) chooses the scene drawn behind the app while the NieR family is selected, from Parchment, City Ruins, The Bunker, Desert, Forest Castle, Amusement Park, Flooded City and Follow the page, with City Ruins the default. A scene is a faint ink landscape in original line art that evokes the game's places; no game asset is used. It is drawn behind the app on the app's ground: panels stay solid and the scene shows around and between them. Parchment draws no scene, and Follow the page gives each page its own scene. A scene is painted once from files inside the app, with no network request, and never redrawn; if it drifts at all it moves by transform only. Light and dark both draw it in the NieR ink color of the active mode. DL-257/Q22 and DL-260: the selected scene follows its retained background choice, including Parchment and Follow the page, and is visible only while the NieR family is selected. Source CSS markers are lineage under SSYS-043, not an independent appearance state. All NieR movement, scripted movement included, obeys Reduce motion (`general.visual.reduce-animations`, together with the platform preference as SSYS-010 defines effective reduced motion) and scales with Animation speed (`general.visual.animation-speed`); under reduced motion the motion parts and any scene drift stop, and progress, focus, error and state-change feedback stay. The sound parts play only while `general.interaction.sound-effects` is on, so the chat header's speaker button and the onboarding and Guided Tour sound controls silence them with the chat's own sounds (SSYS-039). They play through the Notifications & Sounds owner's one player, as every chat, onboarding and Guided Tour cue does, never through a second audio context; inside the onboarding window and the Guided Tour the Menu sounds part adds no blips of its own, since their cues already speak in the NieR kit. While NieR Mode is painted, its onboarding preview included, and Menu sounds is installed, the onboarding and Guided Tour cues come from the NieR kit, original sounds made for Puppet Master in the spirit of the game's menus; no game audio is used, as no game asset is (`Plans/FinalGUISpec.md#F3-599`).

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

ContractRef: ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/Crosswalk.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

## 5. Validation And Acceptance

Minimum production coverage includes:

- Draft 2020-12 meta-schema validation, fixture-pack validation, every positive record, every negative rejection, exact five-command/five-route-action registries, exact 38-manager census, three named visible-state projections, and exact 80-token command-disposition census;
- inventory/schema census: 1010 unique IDs, 12 categories, no demo `value`, `status`, or `src` fields;
- exact wide and responsive host geometry at and around 1180, 960, 720, and 320 pixels;
- level isolation, resolved first paint, saved/copy own-value precedence, pre-claim ephemeral Basic Dark, zero-Project shared/device writes, and exact missing-Project-target rejection;
- fuzzy search, facet combinations, keyboard/pointer parity, match highlighting, and stable variable-height anchors;
- all row renderers, long/localized text, help/details, owner-derived status, unavailable and managed states;
- atomic single changes, theme-pair CAS, Restore Defaults, appearance preview/revert, tooltip-off accessibility, reduced-motion feedback, cancellation, stale revision, read-back failure, and rollback;
- transfer exact-ID selection, redacted preview/diff/provenance, credentials excluded, stale preview refusal, atomic apply, rollback, detached export, and explicit non-auto legacy migration;
- provider Install/Repair/Verify selectors, exact target, continuation, idempotent replay, and proof that Uninstall is absent;
- full 38-manager registry census, lazy hydration, Teacher/Help, Project Search Index, and DRY owner-projection coverage, requested/effective/action/operation separation, and missing-owner disabled states;
- the exact twelve Plugins System command consumers, fail-closed handler_unavailable behavior, complete owner-fact projection, eight plugin Doctor routes, bounded redaction, and proof that no generic K3 plugin mutation path survives;
- protected AuthBrowserSession exclusion, Browser/SCM routes, Docker Manager/Hosts redirects, exact Onboarding/Guided Tour actions, Doctor currentness/dedupe/no-readiness projection, and route-only remediation behavior;
- Server/Client/Project/SSH/full-backup exact-target routes and truthful unavailable-integration handling;
- ten themes, Project switching, reduced motion, accessibility, focus, screen-reader semantics, and no clipped text; and
- fresh Slint 1.17.1 build, runtime, visual, performance, and accessibility evidence before any matching claim.

The standard Plans gates may detect document and governance drift. They do not certify product behavior.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Plan_Document_System.md

## 6. Plan-To-Node Readiness

All SSYS PlanUnits are Plans-only. They expose future implementation surfaces and acceptance requirements but create no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime implementation, product launch, or certification.

Node compilation remains blocked for any affected unit while its retained owner route, command/handler/wiring, schema, currentness, Event Authority, inventory normalization, backup runtime evidence, or PNC-019 lifecycle evidence is incomplete. Concept fixture coverage does not lift those blockers.

## 7. Deferred, Retired, Compatibility, And Non-Goals

Deferred:

- complete the SSYS-059 reviewed `layering` inventory and normalize compatibility `global` before policy; current q-035 and storage authority are resolved by SSYS-002, while implementation remains unproved;
- register the five accepted Settings commands and six route-only UI actions without token drift in Commands, Catalog, UI Wiring, production Wiring Matrix, handlers, selectors, reverse wiring, and fixtures;
- admit required EventRecord families individually, if their owners require persisted events;
- integrate the `Plans/Backup_Restore_System.md` command families through central registration, sole handlers, production wiring, storage/event admission, and runtime backup/restore drills; and
- implement and independently verify the Rust Settings system on the Slint desktop and the Leptos web client (DL-139).

Retired or compatibility-only:

- F3-432 shelves, category-chip bloom, and no-visible-tab shell are superseded as the visible Settings architecture;
- the 19-tab and 24-tab/two-level-sidebar predecessors remain migration/search lineage only;
- the former universal Project-only persistence and no-Project write bans are superseded by approved S1–S14 and SSYS-002/059; detached copies still establish no live source link;
- K3 demo data, localStorage, simulated success, embedded 819-row snapshots, and manager-private handlers are concept lineage only;
- `Provider Uninstall`, PM Playwright Settings/runtime/facade vocabulary, and Settings-embedded operational Docker/Browser/SCM/Doctor surfaces are rejected; and
- shell Back/breadcrumb controls remain optional host presentation; the Details inspector has a visible labelled Close under SSYS-063.

Non-goals:

- no storage engine, package manager, provider resolver, credential store, Server engine, Project Sync engine, SSH engine, backup engine, Browser runtime, SCM runtime, container runtime, Onboarding state machine, Doctor probe engine, or command namespace is implemented here;
- no settings inventory edit, generated shard/evidence update, Spec Lock update, PlanUnit index generation, governance seal, WorkNode, or runtime build is authorized by this owner-doc compile; and
- no concept, static check, schema check, or Plans gate result is implementation readiness or certification.

## 8. Source Lineage And Governance

The approved 2026-11-03 S1–S16/N12/N15 rulings and SSYS-002/059–065 supersede conflicting older persistence clauses. For the retained material, precedence is:

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
owner content, grouping, and routes only. It does not revive a Settings bakeoff, change the 1010-ID ordinary-setting
inventory, create a manager, or promote PMConcept7 fixtures into a native/runtime claim.

### SSYS-026 - Provider, backup, and connector owner projections

```yaml
plan_unit_id: SSYS-026
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings retains exactly 38 manager descriptors while presenting one visible Data Backup and Retention grouping
  over three stable typed child/detail descriptors; extending the existing Source Control manager for separate
  Forgejo, Gitea, repository-hosting, and automation-binding identity; and projecting Remote Access through one
  normal human Tailscale card plus Advanced Connection engine detail. Every action routes to its semantic owner
  with exact scope, target, generation, continuation, availability, disabled reason, and return focus. Settings
  owns no forge adapter, Backup engine, scheduler, key service, connector process, auth broker, Doctor probe,
  handler, or EventRecord family. Amended Q22, Jared 2026-10-30 (DL-257): the current family/variant and inventory
  census supersede earlier counts.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI,
  auth or mirror authority. SSYS-002/059 supply the shared level context; route-only managers retain their actual
  owner records and authority. FO-20 guided setup windows keep their current Glass material, family tokens, protected-auth
  wording and return semantics while showing the exact Computer/Device/Project target.
gui_related: true
gui_classification_reason: This unit defines visible K3 manager grouping, cards, actions, disabled states, exact routing,
  and protected handoff presentation.
depends_on:
- SSYS-012
- SSYS-014
- SSYS-015
- SSYS-017
- SSYS-020
- SSYS-022
- FGI-012
- BRS-012
- BRS-013
- BRS-014
- BRS-015
- BRS-016
- RAS-015
- N2-156
unblocks: []
acceptance_criteria:
- The registry remains exactly 38 keys. `storage-retention-recovery`, `server-backup-restore`, and `project-backup` retain
  stable identity as typed child/detail descriptors and compatibility routes under one visible `Data Backup and Retention`
  grouping; storage/internal recovery and the two Backup products remain owner-distinct.
- The visible Backup scope selector is exactly `server|project:{id}` and every route preserves exact Server, Project,
  destination, repository, immutable snapshot/capture set, RecoverySet public record, policy/preview, generation, continuation,
  and focus when applicable.
- The normal Backup overview shows Automatic Backups, Protected data, destination cards, Encryption enabled, Last complete
  remote backup receipt time, the newest verified backup with its verification level and what a restore from it would
  lose (its time and its last event, projected from the one backup-status record of BRS-031; a newer unverified backup
  is shown beside it), independent verification/drill state, Recovery Kit status, and `[Back Up Now] [Restore…] [Add
  Destination]`; it never exposes engine binaries, object keys, raw OAuth configuration, or secret bytes.
- Destination, History and Browse, Schedule/Retention/Holds, Recovery and Keys, and Advanced/Diagnostics details route
  owner-admitted operations only. Discovery and destination test are bounded/non-destructive; retention preview is read-only;
  prune requires current preview/hash/lease/human confirmation and is never a Doctor action.
- Recovery Key save/export/copy/print/test/acknowledge/rotate/reencrypt and unlock controls are human-only protected
  actions. They stay unavailable to agents, natural-language/API automation, Doctor, capture, ordinary clipboard history,
  and any Client lacking current step-up and no-store delivery proof.
- Archive retrieval separates capability, wait, fee/cost notice, consent, progress, and indeterminate outcome; no current
  price or automatic billable effect is invented.
- Source Control settings preserve one manager and route to `source_control` or canonical `repository_automation` (`Actions
  & Pipelines`). Repository hosting and `automation_binding_id` are independent; Forgejo and Gitea remain distinct provider/instance
  identities with exact custom endpoint/trust/account fields and no ordinary credential value stored in Settings.
- API unavailable does not paint Git transport unavailable. Actions capability separately represents unsupported, disabled,
  no runner, no workflow, insufficient permission, stale, and unknown; provider-specific headings remain GitHub Actions,
  GitLab Pipelines, Forgejo Actions, or Gitea Actions only when the selected binding proves that service.
- Remote Access normal copy is exactly `Tailscale` / `Built into Puppet Master`, with `Not connected` plus `[Set Up]`
  or truthful connected state. Hosted Tailscale and self-hosted Headscale remain distinct; Headscale never shows Funnel
  availability, private access has no normal Serve toggle, and ordinary browser limitations are disclosed.
- Advanced `Connection engine` may project connector/tsnet build and protocol, redacted control kind/origin, node/DNS
  and endpoint IDs, process/IPC/state/listener/binding health, last auth/test, bounded logs, and owner repair/reset routes;
  it never exposes keys, raw connector state, reusable auth URLs, cookies, IPC secrets, or a backend selector.
- Every packet command family consumed here remains event-silent with expected_event_types=[] and handler_unavailable
  until its owner schema, central registration, sole handler, permission, receipt/ObservableWork, persistence, and production/reverse
  wiring are proved.
- All K3 geometry, DL-257/Q22 ten built-in variants across five families, focus, keyboard/touch, virtualization, localization,
  Reduced Motion, exact-return, and truthful unavailable-state acceptance remains required; static text, schemas, fixtures,
  or concept rendering prove none of the native/runtime lanes.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/settings_system_contracts.schema.json
- Plans/settings_system_contract_fixtures.json
- Plans/forge_integration_contracts.schema.json
- Plans/backup_restore_system_contracts.schema.json
- Plans/remote_access_system_contracts.schema.json
- future 38-key/grouping/compatibility-route and exact-scope fixtures
- future protected-key/no-capture and provider-capability transition fixtures
- future K3 ten-theme/width/keyboard/Reduced-Motion/native Slint tests
risk_class: settings_parallel_runtime_or_manager_topology_drift
reasoning_tier: high
context_scope: settings_forge_backup_tsnet_consumers
implementation_surfaces:
- Plans/Settings_System.md
- future typed Settings owner projections
node_compile_hint:
  mode: settings_cross_owner_consumer_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#settings-owner
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#4
- packet:03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md#FORGE-004
- packet:04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md#GUI-005
- packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-001
- packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-002
- packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
- 'source_ref:projects-pass2-20261103:S1–S7; current owner-boundary mirror; Jared: "I approve the outstanding
  questions with their recommended settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
- 38
- K3 Tome Tabs
- Data Backup and Retention
- server
- project:{id}
- Actions & Pipelines
- repository_automation
- Forgejo
- Gitea
- Tailscale
- Built into Puppet Master
- Connection engine
- handler_unavailable
- expected_event_types=[]
negative_constraints:
- Do not add, remove, rename, or collapse a manager key or add an ordinary settings-inventory row for dynamic owner state.
- Do not duplicate forge, automation, Backup, scheduler, encryption/key, connector, authentication, or Doctor logic in
  Settings.
- Do not call Forgejo a Gitea alias, infer automation from a Git remote named Origin, or infer API readiness from Git
  transport.
- Do not expose Recovery Key/Kit bytes, connector secrets, provider credentials, private CA bytes, browser content, or
  unredacted protected-auth state.
- Do not add a Backup, forge-specific, Tailscale, Server, or Sync Activity Bar item.
- Do not revive a bakeoff process or alter selected K3 geometry and PM7 theme authority.
- Do not claim handler, runtime, native Slint, security, provider, visual, performance, accessibility, or readiness completion
  from this Plans-only update.
owner_boundary_notes:
- Settings owns shell/navigation, ordinary level-bound setting semantics under SSYS-002/059, and bounded owner
  projections only.
- Forge_Integrations owns provider/instance and AutomationBinding semantics; Backup_Restore_System owns backup/recovery;
  Remote_Access_System owns connector/routes; newtools owns Doctor routing.
owner_hints:
- Plans/Settings_System.md
- Plans/Forge_Integrations.md
- Plans/Backup_Restore_System.md
- Plans/Remote_Access_System.md
- Plans/newtools.md
- Plans/FinalGUISpec.md
```
## Puppet Master Assistant Redesign Settings Registration - 2026-09-03

The approved Assistant redesign adds fifty settings. This section records their canonical inventory identities, the manager each belongs to, and the packet spelling each reconciles, and it fixes the boundary between what Settings stores and what the domain owners store.

### 1. Two new managers

Settings gains a **Multi-Agent Workflows** manager with `Crew`, `BrainStorm`, `Review`, and `Chat Room` tabs, and a separate **Back Seat Driver** manager. Back Seat Driver is deliberately *not* inside the Multi-Agent Workflows manager: it is a passive read-only advisor, not a collaborative workflow, and presenting it as one would imply it participates in a run. Each Multi-Agent tab edits only that kind's defaults; the run itself and its frozen effective roster belong to `Plans/Collaborative_Workflows.md`.

Scheduling and quota defaults are surfaced under approvals and usage rather than as a third manager, because they are consumed by several owners rather than configuring one subsystem.

### 2. Ownership split

Settings stores ordinary values through SSYS-002/059 and renders managers. Domain owners store operational records. Concretely:

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

The existing `general.interaction.chat-eli5` identity remains the chat override. `general.interaction.eli5-default` resolves Default=false → Everywhere → Computer → optional Project → This chat through SSYS-002/059. All chats is a real Everywhere Settings transaction; Project default names a real Project. Clearing a chat override falls through, and default changes affect future replies only. q-035 is resolved in current canon; ledger source history remains unchanged.

The pre-existing `branching.crew.crew-enabled` toggle is preserved as the master Crew enable. The retired model in which Crew was *only* that switch is superseded by the configuration settings below; a Crew run now requires a committed configuration regardless of the toggle.

DL-138, question 14, sets the factory `branching.crew.crew-auto-enabled` value to `true` for a new project; an existing explicit `false` stays false. The canonical ID retains `assistant.multi_agent.crew.auto_enabled` only as an alias. The per-chat Crew Auto check writes `crew_auto_override` (`true`, `false`, or `null`) in that thread's existing metadata through `cmd.chat.crew_auto.set` with `scope=thread`; absent or null inherits the resolved default, skipping Project for No project. This is a Collaboration-owned thread preference, not a second ordinary Settings value or inventory ID. Commit precedes the visible check change, and a failed commit preserves the prior override. Thread-scoped applicability in the inventory is descriptive `run` metadata, not an independent persistence authority; SSYS-002/059 admit shared levels. The factory Crew Auto configuration is committed as version 1 when the project is created (CWR-021); the first automatic run does not require a confirmation sheet. Later configuration edits still require a successful explicit commit.

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
| `branching.crew.chat-room-pause-between-rounds` | Pause between rounds | `toggle` | `false` | `multi-agent-workflows.chat-room` | `assistant.multi_agent.chat_room.pause_between_rounds` |
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
  Fifty-one new settings are registered in Plans/settings_inventory.json under the existing twelve categories,
  because this inventory derives a setting's category and subgroup from its ID prefix. The packet's assistant.*
  and browser.* spellings are reconciled to those canonical IDs and retained as search aliases on the canonical
  entry; a packet spelling receives no second inventory row, no peer control, and no independent persistence identity.
  The original proposed_census_required packet status is retained as source lineage. A census found one genuine
  reuse: general.interaction.chat-eli5 is the existing chat override; general.interaction.eli5-default resolves
  Default=false, Everywhere, Computer, optional Project and then that chat override. All chats edits Everywhere;
  Project default edits the chosen Project; This chat uses its existing owner command and inherit clears only
  that override. q-035 is resolved in canon by SSYS-002, not by rewriting ledger memory. The same ordinary Settings
  preview/apply and per-setting revisions persist shared values; no-Project chats skip Project and defaults never
  rewrite generated replies/documents. The pre-existing branching.crew.crew-enabled toggle is preserved as the
  master Crew enable, and the retired model in which Crew was only that switch is superseded because a Crew run
  now requires a committed configuration regardless of the toggle. DL-231 adds branching.crew.chat-room-pause-between-rounds,
  a toggle with factory default false and search alias assistant.multi_agent.chat_room.pause_between_rounds in
  multi-agent-workflows.chat-room. The setup check copies this default when the sheet opens and commits pause_between_rounds
  with the definition. Save as default uses the ordinary Settings transaction; a later Settings change never alters
  a committed definition or a running room. DL-138 sets branching.crew.crew-auto-enabled to factory true for a
  new project while preserving an existing explicit false. The per-chat override is crew_auto_override (true,
  false or null) on existing thread metadata, absent or null inheriting the SSYS-002 resolved default, omitting
  Project in app scope. cmd.chat.crew_auto.set with scope=thread commits it before the check changes and preserves
  the prior value on failure. It is a Collaboration-owned preference, not another ordinary Settings value or inventory
  ID; inventory run applicability is descriptive metadata. The factory Crew Auto configuration is committed by
  the Collaboration owner for the actual Project or application chat scope (CWR-021/CWR-045); later edits still
  require an explicit successful commit.
gui_related: true
gui_classification_reason: Each registered setting is a rendered control in a Settings pane with a category, subgroup, and tier.
depends_on: [SSYS-027]
unblocks: []
acceptance_criteria:
- All fifty-one settings exist once each with a valid category, subgroup, type, default, scope, and tier.
- The Chat Room pause toggle defaults false, resolves its assistant.multi_agent.chat_room.pause_between_rounds
  alias once, and changes no already committed room.
- Every packet spelling resolves to exactly one canonical entry through its search aliases.
- No packet spelling receives its own row or persistence identity.
- The existing chat-eli5 override and crew-enabled toggle are preserved rather than duplicated.
- ELI5 resolves Default, Everywhere, Computer, optional Project and This chat without changing generated documents.
- All chats writes Everywhere over the false factory fallback; No project resolves Everywhere → Computer → This
  chat without a Project sentinel.
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
- Plans/Decision_Log.md#DL-231
- pm-assistant-implementation-2026-09-02-recovered:machine/settings.json
- pm-assistant-implementation-2026-09-02-recovered:SET-002
- Plans/Decision_Log.md#DL-138
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "pause_between_rounds"
  - "assistant.multi_agent.chat_room.pause_between_rounds"
  - "branching.crew.chat-room-pause-between-rounds"
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

### QMAX-018 — Seven layered defaults, no new commands

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

Settings owns the shell, the inventory, level-bound values, transactions, defaults, and
manager routing. Domain runtimes own their records and operations, and a manager action routes to
its owner. Participant dispositions, run state, schedule state, and progress are never stored as
settings values.

## Working Notebook Settings Addendum (2026-09-05)

Notebook defaults resolve through SSYS-002/059; app scratch and Project notebook bodies remain Notebook-owned and never enter Settings transfer/export.

```yaml
plan_unit_id: SSYS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Working Notebook preferences resolve through the SSYS-002 ladder as ordinary settings registered in the settings
  inventory (memory.notebook.auto-capture, memory.notebook.resume-capsule, memory.notebook.capsule-budget-tokens,
  memory.notebook.injection-budget-tokens) as static inventory registrations through the generic transaction.
  Budgets are ceilings, not reservations. Disabling auto-capture does not grant sharing, clear notes, or disable
  mandatory ledger/workflow checkpoints. Settings export/transfer never carries note bodies, and notebook bodies
  remain in the Notebook owner, including application scratch; only defaults/budgets use Everywhere/Computer/Project.
gui_related: true
gui_classification_reason: These are user-visible Settings values rendered through existing settings surfaces.
depends_on: [SSYS-028, WN-018]
unblocks: []
acceptance_criteria:
- Setting IDs, types, defaults, and offered levels match the inventory schema.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: ["memory.notebook.auto-capture", "static inventory registrations", "ceilings, not reservations"]
negative_constraints:
- Do not confuse layered notebook defaults with a shared notebook body.
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
- **Supported Selections:** The setting offers exactly `Orbit` and `Step Rail Simple` (the concept's). The legacy value token `Step Rail` maps directly to `Step Rail Simple` as an
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
  contention, or lack of the actual target required by the selected level; absence of a Project alone is not a shared-level failure), Settings retains the user's uncommitted edit in the local
  buffer, clearly displays the typed error message, and provides Retry and Revert actions.

### 21. Shared Settings Projections (APR-047)

- **Coherent Domain Views:** Dedicated named projections surface cohesive slices of the canonical
  inventory to specific consuming domains without creating separate storage stores:
  1. `settings.assistant`: Projects theme, interaction style, question limits, and composer defaults.
  2. `settings.bsd`: Projects BSD mode, model, persona, sensitivity, catch-up, and cooldown settings.
  3. `settings.schedule`: Projects execution windows, wind-down minutes, grace intervals, and DST rules.
- **Single Source of Truth:** All projections read the one effective result and mutate exact target level/key values
  via the standard Settings transaction engine.

### 22. Settings Manager Layout Principles Across All 38 Managers (APR-062, APR-064, APR-065)

- **Reference-Layout Supersession and Universal Principles (APR-062, APR-064, USER-REFERENCE-LAYOUT-ROLLBACK-20260908):**
  The visual prescription derived from the reference video (`ScreenRecording_08-11-2026 19-26-05_1(1).mov`)
  enforcing flat-row, borderless-section, and forced single-column layout is selectively superseded under
  user correction USER-REFERENCE-LAYOUT-ROLLBACK-20260908. Settings surfaces restore prior native card, section
  box, and grid layouts across all thirty-eight registered managers. The September 8 Settings manager refresh
  (USER-SETTINGS-MANAGER-REFRESH-20260908) demonstrated 23 concrete manager workspaces over the unchanged
  38-key registry; this is a historical presentation count. Historical evidence and request records are retained
  intact. Active presentation across every Settings manager enforces:
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
     Settings carries no coloured side or top stripe and no emoji. From 2026-10-10 (Jared: "pills needs to be
     removed from settings and redesigned to not use them"; DL-184, F3-648) switches and bars are no exception:
     a switch is the look's rectangle with a square key, a bar has square ends, every control takes the look's
     control corner and never a radius of half its height, and a status mark sits in a 1em glyph slot.
     Amended 2026-10-17 (DL-228): F3-438 owns that switch grammar on every surface, the onboarding window and
     the Guided Tour included, and Glass's curved lens variant (F3-652) is its one exception.
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
  Amended 2026-10-10 (DL-187; the planning thread's count, pm-mail 1010234358-ab8b): with Chat Layout (`general.visual.chat-layout-mode`) retired, the published concept's census is 891 live concept ids plus 1 retired row (Chat Layout), 892 ids in all, and no setting is lost. This is the census of what the published concept draws. It is not the inventory census of SSYS-050, which counts `Plans/settings_inventory.json` itself: 964 rows, 11 of them retired, 953 live. The two differ because the inventory has grown since the 2026-09-08 concept census by rows the concept does not draw yet (Settings is not ported in the home redesign), and because the concept's five roster/stage rows are not inventory rows.
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
  disclosures; Back Seat Driver is its own kit manager. Every workspace stays bound to its existing manager
  identity and renders through the shared manager kit. Domain
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
  Settings exposes shared domain projections (settings.assistant, settings.bsd, settings.schedule) reading the
  one effective-value result and mutating the exact targeted level/key under SSYS-002/059 through the canonical
  Settings transaction engine, ensuring single-source-of-truth persistence without duplicate stores.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Every Settings manager renders through one shared manager kit under USER-SETTINGS-MANAGER-REFRESH-20260908:
  no header-level action strip, at most six tabs, exactly one labeled Advanced disclosure per view holding technical,
  diagnostic, rare, and dangerous items, one quiet bottom action row, exactly one check control per connectable
  entity, plain-language beginner copy in primary rows, and one side-panel anatomy shared by manager drawers and
  the setting Details inspector, which keeps its 350 px width token. Concept presentation groups registry destinations
  into workspaces without changing manager_id keys, routes, detail ids, command ids, or the settings inventory:
  Skills, Plugins, MCP Servers, and Commands & Shortcuts are separate Code & Tools workspaces over tools-integrations
  and commands-shortcuts; one System workspace, Server & Project Location, presents server-claim-bootstrap, servers-hosts-environments,
  clients-continuity, project-hosting-files, project-sync-move-copy, ssh-remote, and remote-access; Single Owners
  and Browser & SCM governance are Advanced disclosures; Back Seat Driver is its own kit manager. Domain switches
  never blank (first frame at least 85 percent of settled brightness), built-in sounds preview their selected available asset or admitted synthesized recipe through F3-405’s shared player and provenance rules, and All Settings scrolls with the page while staying variable-height virtualized. The 350 px Details
  inspector uses SSYS-063: visible labelled Close, exact context, Used everywhere except sentence, Where it applies,
  Choosing here changes target, existing explanations/choices, Recent changes and For experts. Origin-word actions
  replace the question icon; no side stripes, new manager kit or extra Advanced disclosure is added.
gui_related: true
gui_classification_reason: Governs the shared manager kit, workspace grouping, side-panel anatomy, motion and sound of every Settings manager.
depends_on: [SSYS-032, SSYS-005, SSYS-006, SSYS-015, SSYS-024]
unblocks: []
acceptance_criteria:
- "Every manager workspace mounts through the shared kit with zero header-level action buttons, at most six tabs, and one Advanced disclosure per view."
- "Registry keys, routes, detail ids, command ids, and the settings inventory are unchanged; every workspace stays bound to its existing manager identity through the shared manager kit."
- "A domain switch's first frame is at least 85 percent of settled brightness; sound previews follow F3-405’s provenance and actual-playback rules; All Settings has no nested scroller; no page errors occur."
- "Panel open/close, inspector open/close, domain switch, tab switch, and sound play show no blank frames and settle within the spring's own duration."
- "(USER-SETTINGS-MANAGER-REFRESH-20260909) State renders as dot-plus-text status tokens and no capsule pill remains except keyboard keys; every select is a themed listbox and every menu shares its popout motion; rosters scroll inside their manager block; manager-topic canonical settings render inline inside their manager before its Advanced disclosure and every concept id renders exactly once (SSYS-035)."
- "Sound preview requires an explicit gesture, source/license/version/duration/hash metadata and the shared player. Playing and Stop follow actual playback; replacement has no overlap and navigation/Project/view disposal cleans up. Unavailable or undecodable audio has a non-audio failure state, no unrelated substitute and no false delivery credit; real Pip and Guided Tour cues remain F3-405 consumers."
validation_surfaces:
- "future Settings manager acceptance: canonical rows and routes, shared kit, at least 85 percent first-frame brightness, labelled sounds, page scrolling, and no page errors."
- "future Settings motion evidence: no blank frames during manager, inspector, domain and tab transitions or sound play, with settling within the specified spring duration."
- "future SSYS-035 placement acceptance: each live setting once, exact manager and tab home, Details and search return, and inline refresh."
- "scripts/pm-plans-verify.py"
risk_class: manager_kit_regression_or_registry_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
- USER-SETTINGS-MANAGER-REFRESH-20260908
- USER-REFERENCE-LAYOUT-ROLLBACK-20260908
- SSYS-032
- USER-SETTINGS-MANAGER-REFRESH-20260909
- Concepts/pm7-tools/SETTINGS_REFRESH_README.md
- "DL-260/DL-280 source lineage only (no product DOM obligation): data-manager-key was the concept's manager-wrapper attribute; existing manager identities and the shared manager kit remain the product contract."
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "shared manager kit"
  - "Server & Project Location"
  - "one Advanced disclosure"
negative_constraints:
  - Do not reintroduce a per-manager top action bar.
  - Do not render a canonical setting twice or inside a second Advanced disclosure.
  - Do not reintroduce capsule pills or a native option list in Settings.
  - Do not exceed six tabs in a manager.
  - Do not render a second Advanced disclosure in one manager view.
  - Do not mint, rename, or remove a manager_id key for a presentation grouping.
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
canonical_text: >-
  Terminal Settings projects the versioned requested/effective enhanced keyboard capability, explicit exact-host
  remote compatibility setup status and redacted environment provenance with pending-for-next-launch changes.
  Runtime input protection stays in Terminal and Settings explains only admitted scope, with same-verified-session
  protection retained across reconnect/PM reopen, replacement sessions unlocked, and both user/agent input blocked
  under DL-038. Existing inventory, scope, secret custody, manager and command owners remain authoritative. Persistent
  ordinary defaults resolve through SSYS-002/059 for the actual Computer/Device/Project; live terminal sessions
  and exact Host/Environment input-protection remain Terminal-owned, and Computer-only program/profile paths are
  never copied.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Under USER-SETTINGS-MANAGER-REFRESH-20260909 every manager-topic canonical setting appears once inside the manager
  and tab that own its topic, as an inline canonical section before that manager's one Advanced disclosure,
  with its Details inspector, search landing, All Settings entry, and change-refresh behaviour preserved.
  The concept resolves placement by reference subgroup, keyword override, or hand placement.
  Core settings stay on six plain pages; 10 of the 12 reference pages and the concept-only
  Assistant page retire because every row they held now has a manager home; the planning domain keeps its id
  with the label Planning. 674 inventory rows render inside managers, every one of the 891 live concept ids
  renders exactly once and the retired Chat Layout row, the 892nd id, is never offered as a setting to change
  (amended 2026-10-10, DL-187, SSYS-050; it read: every one of the 892 concept ids renders exactly once), and the five branching plan-limit ids remain visible in their
  manager homes pending subgroup registration. The shared kit provides themed listboxes for every
  select and menu, dot-plus-text status tokens instead of pills, hero side panels (identity header, facts,
  progress rail, card sections revealed in a stagger, sticky footer), rosters that scroll inside their manager,
  meter, order, and accordion primitives.
gui_related: true
gui_classification_reason: Governs where canonical settings render, the listbox and status presentation, side-panel anatomy, and roster scrolling across every Settings manager in the published concept.
depends_on: [SSYS-033, SSYS-005, SSYS-006, SSYS-015, DL-187]
unblocks: []
acceptance_criteria:
  - "A walk over every workspace and every manager tab finds each of the 891 live concept ids rendered exactly once; All Settings lists 891 live rows in 12 categories; the retired Chat Layout row is never offered as a setting to change (amended 2026-10-10, DL-187; it read: A walk over every workspace and every manager tab finds each of the 892 concept ids rendered exactly once; All Settings lists 892 rows in 12 categories.)"
  - Details opens for a setting rendered inside a manager; global search lands on a setting inside a non-active manager tab; changing a setting refreshes its inline row in place.
  - No manager renders a second Advanced disclosure; inline sections precede the manager's Advanced disclosure; advanced placements render first inside it.
  - No native select is visible in Settings; dropdown and menu popouts open with the shared sprout motion inside the viewport; no capsule pills remain except keyboard keys.
  - Rosters scroll independently inside their manager block while the settings document still scrolls.
validation_surfaces:
  - "Settings placement acceptance: each live setting once, manager and tab placement, search landing, Details, and inline refresh."
  - "Settings manager acceptance: shared kit, themed listboxes, viewport-bounded menus, and independent roster scrolling."
  - "Settings motion evidence: no blank frames during manager, inspector, domain and tab transitions, with the specified menu motion."
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: canonical_setting_placement_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - USER-SETTINGS-MANAGER-REFRESH-20260909
  - USER-SETTINGS-MANAGER-REFRESH-20260908
  - SSYS-033
  - Concepts/pm7-tools/SETTINGS_REFRESH_README.md
preserved_exact_tokens:
  - "exactly once"
  - "one Advanced disclosure"
negative_constraints:
  - Do not render a canonical setting twice or inside a second Advanced disclosure.
  - Do not mint, rename, or delete a manager_id key or an inventory id for presentation reasons.
  - Do not reintroduce capsule pills or a native option list in Settings.
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187; the planning thread's count, pm-mail 1010234358-ab8b): the concept census becomes 891 live concept ids plus the retired Chat Layout row, which is never offered as a setting to change."
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-033, ContractName:Plans/FinalGUISpec.md#F3-551

## Onboarding draft transfer extension — 2026-09-10

### SSYS-036 - Settings Transfer To An Uncreated Project Draft

```yaml
plan_unit_id: SSYS-036
unit_type: schema_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The original cmd.settings.transaction.preview request/result refs select either the unchanged existing-Project
  transfer contract or a closed draft-preview variant. Draft preview binds one actual source Project/revision
  to destination_draft with a draft identity/revision/hash and null destination Project, exact owner selector/setting
  IDs, proposed values, exclusions, explicit-choice precedence, expiry and a redacted summary. It creates/applies
  nothing. After the confirmed Project operation reserves an actual destination identity, Settings revalidates
  the source/draft/preview/inventory, emits settings_transfer_draft_rebind and an ordinary Project-bound preview,
  and uses the unchanged apply transaction with restore point, exact-ID readback and rollback. Onboarding renders
  this owner result and never owns a copy engine. A Project creation resume consumes the same exact rebind result
  and ordinary apply transaction outcome; an already settled settings_rebind_apply is skipped, never re-applied,
  and an unknown Settings effect is reconciled through Settings before any retry. SSYS-062 adds own_values default,
  Advanced picked IDs/effective_values, contributed owner things, explicit account choices and MA-074 readiness
  on the draft work Computer. The default choice is Your usual settings. Offer only for a new registry Project,
  including registering unregistered files; opening an existing registered Project, Later and connect-only do
  not copy. A Computer change invalidates readiness and the bound preview. Settle rebind/apply/readback/rollback
  before Project listing.
gui_related: true
gui_classification_reason: >-
  Controls the user-visible Your usual settings/Start like another Project preview, optional
  Advanced: choose what to copy disclosure, meaningful conflicts and copy result.
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
- 'source_ref:projects-pass2-20261103:S9–S11/N15; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
negative_constraints:
- Do not invent a destination Project ID or apply Settings before commit.
- Do not fork the owner category/eligibility inventory or copy credentials.
- Do not treat fixtures as native transaction, rollback, security or readiness evidence.
- Do not invent a Settings recovery command, DTO, or second rebind path for Project resume; consume the exact
  rebind and unchanged apply transaction.
```

## External research limits — 2026-09-17

### SSYS-037 - External Research Limit Values

Settings owns the four layered Settings values under SSYS-002/059 that bound an external research topic: the per-topic cost cap, the per-job limits on model responses and wall seconds, the lifetime cap per research arm, and whether retained unresolved usage blocks further admission or only stays visible. Of the two dispositions, `visible_only` is a design default that no run has exercised yet and is marked as one until a run does; `blocks_admission` is what continuation 4 exercised. Their meaning, their defaults and the rule that every job reports which limit ended it belong to `Plans/External_Research.md` (`ERS-008`, `ERS-009`); this owner holds the values, their inventory rows and their surfaces, and no other owner stores them. The rows themselves are added to `Plans/settings_inventory.json` in the Settings owner's next authorized inventory wave, which owes them and which the External Research landing does not perform; this unit fixes ownership and meaning and claims no existing row. The per-job limits are the live bound in practice, so their controls state plainly that they, not the cost cap, are what ends a job that does not finish.

```yaml
plan_unit_id: SSYS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The four external research limits are Settings values on the SSYS-002 ladder held by this owner and its inventory,
  namely a per-topic cost cap, per-job limits on model responses and wall seconds, a lifetime cap per research
  arm, and an unresolved-usage disposition of blocks_admission or visible_only, of which visible_only is a design
  default that no run has exercised and is presented as one until a run does. Their semantics and defaults are
  owned by Plans/External_Research.md; Settings holds the values, the inventory rows and the surfaces, and no
  other owner stores them. Their controls state that the per-job limits, not the cost cap, are what ends a job
  that does not finish, and retained unresolved usage stays visible whichever disposition is chosen. SSYS-059
  classifies eligible numeric capacity limits with computer_ceiling; owner-fixed semantics, retained unresolved
  usage and explicit defaults stay with External Research.
gui_related: true
gui_classification_reason: The four limits are user-visible Settings controls with explanatory copy.
split_recommended: false
depends_on: [SSYS-005, ERS-009]
unblocks: []
acceptance_criteria:
- The four research limits are specified here as Settings values on the SSYS-002 ladder; their inventory rows
  are owed to the Settings owner's next authorized inventory wave, and until then no row is claimed to exist.
- No other owner document stores or duplicates a research limit value.
- Retained unresolved usage remains visible under either disposition.
- A surface offering the unresolved-usage disposition names `visible_only` a design default until a run establishes
  it, and never presents it as exercised.
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
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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

Both command preference rows use SSYS-002/059 offered levels and SSYS-009 preview/bound apply, exact level/key/revisions/actor/permission/idempotency and readback/rollback. Keyboard layout follows Everywhere/Device; palette visibility follows its reviewed classification. No project does not block an offered write. Sole handlers remain `handlers::settings::transaction_preview` and `handlers::settings::transaction_apply`; no per-setting command exists.

### SSYS-038 - Commands Manager Layout And Palette Preferences

```yaml
plan_unit_id: SSYS-038
unit_type: integration_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The Commands manager binds extensions.commands.keyboard-layout and extensions.commands.command-palette-visibility
  to the same Settings preview/apply handlers. Keyboard layout is an Everywhere/Device screen row and keeps Auto-detect,
  US (QWERTY), UK, German (QWERTZ), French (AZERTY), default Auto-detect. Palette visibility defaults on and follows
  its reviewed SSYS-059 levels; it controls user-command discovery, never UICommand registration or permission.
  Requests name exact setting/value, target level/key, per-setting revisions, actor/permission/currentness, schema
  and idempotency. No project does not prevent an offered Everywhere/Device/Computer write. Readback/rollback,
  context re-resolution and inventory reset use SSYS-009, with no other writer or per-setting command.
gui_related: true
gui_classification_reason: Keyboard layout and user-command palette visibility are existing selected manager controls.
depends_on: [SSYS-002, SSYS-009, CS-081]
unblocks: []
acceptance_criteria:
- Both exact IDs exist once with their original options/defaults and reviewed layering.
- Keyboard layout resolves Everywhere/Device; no Project own write is offered for a screen row.
- No-Project offered writes succeed and exact context changes re-resolve without changing command registration/permission.
validation_surfaces: [Plans/settings_inventory.json, Plans/settings_system_contract_fixtures.json, Plans/commands_shortcuts_contract_fixtures.json]
risk_class: unowned_preference_or_scope_drift
reasoning_tier: medium
context_scope: commands_manager_project_preferences
implementation_surfaces: [Plans/Settings_System.md, Plans/settings_inventory.json]
node_compile_hint: {mode: settings_owner_binding_contract, create_worknodes: false}
source_lineage:
- Concepts/TestOpus5.5PmConcept.html
- Plans/Commands_System.md#CS-081
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [extensions.commands.keyboard-layout, extensions.commands.command-palette-visibility, Auto-detect, "US (QWERTY)", UK, "German (QWERTZ)", "French (AZERTY)", cmd.settings.transaction.preview, cmd.settings.transaction.apply]
negative_constraints:
- Do not create per-setting commands or a second Settings writer.
- Do not grant invocation permission or change UICommand registration through palette visibility.
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
  general.interaction.sound-effects defaults to on and is recommended on (DL-107); its description names the chat
  header's speaker button as a quick mute for the same setting. general.interaction.queue-behavior defaults to
  Queue and is recommended Queue, with Steer still offered (DL-108). No other key, tier or default changes; SSYS-059
  supplies the reviewed levels; the chat header mute is a shared chrome control over general.interaction.sound-effects,
  not a new setting, which keeps sound effects a grouped setting rather than a per-view toggle. Production motion
  honours general.visual.reduce- animations as well as the operating system's reduced-motion preference (ACD-475).
  Amended 2026-10-29 (O4, S3/S4; PM7): Setup voice, app chirps and setup music are options of the one pip-parts
  row under the existing master sound; no chat/onboarding mute, volume or voice key. The single player owns synthesis
  recipes and asset metadata. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q1/Q2: onboarding sound defaults
  on under general.interaction.sound-effects, through the existing one player and trusted-gesture gate. Until
  the Settings owner supplies the applicable sound preference, retain the factory-on or current effective choice
  rather than muting on every refresh. The resolved Everywhere/Device screen preference wins when available; a
  genuinely refused bound write remains refused. An unavailable Settings projection never fabricates a saved value
  or authorizes a write. DL-259, Jared 2026-10-31: Q1 B, Jared 2026-10-31: the shared Pip voice, say and vocals
  everywhere Pip speaks, sends 0.35 after trim and pan into its look’s room; Glass uses 0.30 and NieR 0.16. Each
  look uses its one per-look kit room, registered before the first shared voice in every host, with no stacked
  rooms. These restore the old voice’s own sends. Loudness remains within approximately 0.4 dB. The existing preference,
  gesture and sound owner still gates playback. Sound is an Everywhere/Device screen row and is available with
  no Project; queue behavior follows the work-context ladder. No extra chat or onboarding mute is created.
gui_related: true
gui_classification_reason: "Changes two user-visible setting defaults."
split_recommended: false
depends_on: [DL-107, DL-108]
unblocks: []
acceptance_criteria:
- The inventory defaults general.interaction.sound-effects to true and general.interaction.queue-behavior to Queue.
- No new sound or queue setting key exists.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects,
  through the existing one player and trusted-gesture gate. Until the Settings owner supplies the applicable sound
  preference, retain the factory-on or current effective choice rather than muting on every refresh. The resolved
  Everywhere/Device screen preference wins when available; a genuinely refused bound write remains refused. An
  unavailable Settings projection never fabricates a saved value or authorizes a write.'
- 'DL-259, Jared 2026-10-31: Q1 B, Jared 2026-10-31: the shared Pip voice, say and vocals everywhere Pip speaks,
  sends 0.35 after trim and pan into its look’s room; Glass uses 0.30 and NieR 0.16. Each look uses its one per-look
  kit room, registered before the first shared voice in every host, with no stacked rooms. These restore the old
  voice’s own sends. Loudness remains within approximately 0.4 dB. The existing preference, gesture and sound
  owner still gates playback.'
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
- Plans/Decision_Log.md#DL-107
- Plans/Decision_Log.md#DL-108
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "general.interaction.sound-effects"
  - "general.interaction.queue-behavior"
  - "Queue"
  - "Steer"
negative_constraints:
- Do not add a chat-only sound or queue setting.
- Do not change their IDs, defaults or tiers; offered levels follow SSYS-059.
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
| History | Timeline (What the timeline shows, in the filter bar; More options: Export and import); Sessions; Artifacts; Cleanup (Chats; Run records and logs; Storage health; More options: Index and storage tools) |
| Server & Project Location; Settings Transfer; Readiness & Doctor; Updates | Servers tab: Servers (each server's details, including how it signs in); SSH computers; SSH keys (every key Puppet Master knows, where it is kept and what uses it); Setting up tools on servers. Away From Home: how you reach the server now, and the ways in, in the order they are tried. Move & Copy: moving, copying or importing a workspace, and what was moved. Settings Transfer: Copy, load or save, one guided set-up, and the transfer history (More options: File format and older versions). Readiness & Doctor: Last checkup; Automatic checkups; What you see around the app; Setup and tour (More options: For support). Updates: Puppet Master; Content and catalogs (More options: How often and which releases) |

Amended 2026-10-31 (DL-270): Storage health is an everyday, read-only group on the Advanced > Storage & Retention page that `cmd.settings.open_storage_retention` opens (F3-457). It shows each storage group's usage against its budget, its reclaimable bytes and the last compaction, and its free-up-space action dispatches the existing `cmd.storage.compaction.request` (SP-340) and shows the result per group. The `storage-retention-recovery` descriptor carries the same projection. Budgets, the fragmentation threshold, the redb cache size and the compaction schedule are fixed owner values in the storage registry, shown read only; Settings owns no budget value, no compaction and no new setting row (SSYS-058).

Amended 2026-10-31 (DL-270): in the Usage & budgets page above, `ai.usage.usage-retention` (Keep usage history for: 30d, 90d by default, 180d, 1y, unlimited) stays as it is; Jared answered "Defualt to 90 days, selectable to longer or shorter time periods." It governs the detailed usage records in the event log and the Parquet archive. Daily usage totals are kept whatever it says, and the Usage page and its charts read those totals (UF-108, SP-341).

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

A row whose meaning depends on another switch or choice shows only while that switch or choice makes it apply, and relevance follows chains: Glass transparency only under a Glass theme (Wallpaper applies to every look under SSYS-054; the old Glass background row is retired), Retro textures only under a Retro theme, High contrast only under a Basic theme (SSYS-010; Q22 keeps this Basic-only even though NieR reuses Basic CSS; DL-301 retires the older Basic light/dark control everywhere, including search and advanced Settings, retaining stored values only as compatibility input); proxy address fields only with a manual proxy; the Docker Hub access token only when signing in with a token; the Kubernetes namespace only once a cluster is chosen; Animation speed only while Reduce motion is off; the NieR Mode parts and background only while the NieR family is selected; Retro scanline and pixel-grid strengths only while Retro textures are on; Back Seat Driver rows only while the advisor is on; the capability rows only while testing is not Off; crew and helper detail rows only while crews or helpers are on; Review's reviewer count, blind first pass and corroboration only with multi-pass review; the code health gate's options only once the gate is on; the checkpoint pauses only while the run mode asks at checkpoints; permission scopes only in the Expert Rules view with overrides on; and the MiniMax prompt option only for the MiniMax picture service. A hidden row keeps its stored value, stays findable through search and Details, and hiding never removes a blocking error, consent boundary, unavailable reason, requested/effective difference or live-versus-example distinction (SSYS-006). Theme-family rows follow this same visibility rule (Q22); hidden values remain retained and searchable.

### 6. Owner routes and flows instead of a generic action panel

No Settings action opens the generic "What this does" preview panel whose button only reported that the action was requested. An inventory action row does one of two things. It routes to the owner surface that does the job and lands on the exact control: `ai.accounts.github-connect` to Source Control; `ai.usage.quota-management` to Providers & Accounts › Usage & budgets; `personas.library.persona-manager` to Personas; `general.interaction.settings-search` (Search all settings) to the Settings search box (`settings.search.focus`); `general.interaction.dashboard-widgets` (Choose widgets) to the Home dashboard's own widget picker, since a typed list of widget names could never be valid; `general.startup.reset-home-layout` (Restore home layout) to Home's own Restore home layout (`cmd.workspace_layout.reset`, which keeps every open tab) after one plain question naming what moves back and what is kept; a per-account or per-service row, including every API key row, to its account or service. Or it runs one small flow bound to the owner's command and availability: a form (fields to fill in; non-secret answers are kept, secrets are only marked as saved in the keychain), a check (steps run in order with an outcome and the time of the last run), a confirm (a plain question with the consequence, marked dangerous when it removes something), a list (things to read or act on, each with its own action or Remove) or an order (an ordered list). A flow performs no owner operation itself: it dispatches the owner's registered command or shows the owner's unavailable reason (SSYS-015, SSYS-020), and where SSYS-013 requires a route (container, registry, publish and SCM operations) the row routes to the owner surface instead.

A Settings search result for an action row, such as Restore home layout for `general.startup.reset-home-layout`, lands on that exact row and asks the row's own plain question; search never opens Details for an id that is not on the page it opens, which would draw an empty panel.

Adding an MCP server, a plugin, a skill, a command, a shortcut, a persona, a crew, a Goal template, a language server, a formatter, a test profile, a debug profile, a permission profile, a server, an SSH computer or an SSH key, setting up a way in from away, moving or copying a workspace, copying, loading or saving settings, connecting a code service, setting up Git, creating a repository and contributing to another project are guided set-ups in one window over the dimmed page, in the onboarding wizard's form: the steps as a rail, one plain question per step, Back and Continue, and a click on the dimmed page never closes it. Each commits through its owner's command; the answers a row remembers are its inventory values.

### 7. Structured editors

Lists and key/value settings open an editor that adds, removes and reorders items instead of a raw JSON or text box; items from a known set (services, personas, clusters, models) are picked rather than typed; nested data keeps a structured editor labelled as such; secret rows open a key panel that never shows the key, and notification destination addresses are entered and shown like keys (masked, kept on the server, with Replace). Rows that had a raw box get a small editor of their own: Words to always accept is a word list; reviewers are one persona per review round, picked from the library; Kubernetes logs start is one choice; what agents may do in each cluster is one entry per cluster with its namespaces and four switches; Unraid setup fields are entries with a kind, a name and a default; the publisher picture is an upload or a link; the context-space split adds up to 100 percent; rule documents open in an editor; per-tool and per-web-ability answers are fixed Allow, Ask and Block tables; Back Seat Driver's model and persona and the Commands defaults for new commands offer the signed-in models, real personas and profiles instead of free text. Fields inside a Settings panel carry their own label and help and no generic hover or focus tag over them; the panel's buttons keep theirs.

### 8. Rows that describe one thing

Rows the inventory holds once but which describe one account (nickname, jobs it may do, billing, sign-in method, Google Cloud project, priority, its own switch level, warning level and rest period, retry budget, quota profile, credential storage) or one AI service (on or off, preferred sign-in) are drawn and edited inside that account or service. A thing without its own value shows the inventory default, never another thing's value; Details says the row is set per account or per service and lists what each one has; anywhere the plain row renderer draws such a row (All Settings included) it is a way to the accounts or services, not one global control. The per-thing value is held by the account or service owner record; the inventory row's scope metadata is not widened by this presentation, only by a recorded inventory decision such as the one below.

Auto-switch is set per AI service from 2026-10-09 (`Plans/Decision_Log.md#DL-174`, `Plans/Multi-Account.md#MA-073`). That is a recorded inventory decision (`Plans/FinalGUISpec.md#F3-441`), not presentation: `ai.accounts.multi-account-switching`, `ai.accounts.hard-switch-level`, `ai.accounts.soft-warning-level` and `ai.accounts.cooldown-policy` gain the provider scope beside their existing scopes, `ai.accounts.cooldown-policy` also gains the global and project scopes, and the provider's value is a Settings value committed through the ordinary transaction, whose preview request names the provider scope and the provider id as SSYS-044 sets out, not a field of the service's own record. Each service shows its own four rows in its own rows of this section, as rows that describe one thing; a service with no value of its own shows the shared value it follows (MA-073), marked as the shared value, and changing it there gives the service its own value. These four rows are this section's stated exception to drawing a thing without its own value at the inventory default and to leaving scope metadata unwidened. They are one bound value drawn in four places: the service's This service section, Auto-switch policies, Limits & switching › Moving between accounts and the Usage plate. Clearing a service's own value reads "the shared value", and the row's About hover names where the shared value is set (Limits & switching › Moving between accounts). The shared switch and warning levels are choices, not sliders: switch at 5, 10, 15, 20, 25 or 30% left and warn at 10, 15, 20, 25, 30, 40 or 50% left, each labelled "<n>% left · <100-n>% used", the same lists each service uses; the rest period is a choice too, provider defaults or 5, 15, 30 or 60 minutes, the same list at every scope (amended 2026-10-17, DL-228); a choice that would put a service's switch level at or past its warning level, or its warning level at or below its switch level, is disabled with the reason, the shared choice included. Use the shared settings clears every own value of a service in one transaction whose changes hold each cleared row, and a cancelled transaction leaves all of them unchanged and says why. A provider-scope write made from Usage while Settings is not shown marks the drawn Settings page out of date, and it is redrawn before its next frame is painted once it is shown. Limits & switching › Moving between accounts keeps the global rows of all four, which are the defaults for every service (the rest period's global row is new and starts at its inventory default), and says which services have their own. Details on any of the four rows lists each service's value and the order the values apply in, as `Plans/Multi-Account.md#MA-073` sets it out. An account's own switch level, warning level and rest period are the same rows at scope account (`ai.accounts.hard-switch-level`, `ai.accounts.soft-warning-level` and `ai.accounts.cooldown-policy`); they stay inside each account and win over the service value, because every threshold resolves through one ladder, Everywhere, Computer, optional Project, service, account, the most specific set value winning (MA-073), and a crossing choice at the account scope is disabled with the reason as it is for a service. `ai.accounts.account-threshold-override` is retired by the owner decision of 2026-10-10 (`Plans/Decision_Log.md#DL-174`): a value stored under it is read once and carried to `ai.accounts.hard-switch-level` at scope account, and no Settings page offers a control for the retired row: All Settings lists it only as an older setting that points to the account's own switch level. The Usage page's Accounts room hosts two of the four for each provider, the auto-switch toggle and the switch point, as bound controls under SSYS-044, and each account's own switch point on that account's card and in its Details (owner decision 2026-10-10); they are the same value, not a copy, and the warning level and the rest period are edited here, reached from Usage through Open in Settings.

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
- Q22, Jared 2026-10-30 (DL-257), supersedes the 2026-09-28 three-row override admission: general.visual.nier-mode is retired and migrated on load; family nier and its two variants use general.visual.theme. The retained parts/background Adjust rows show only while a NieR theme is selected and use the existing editor. Current inventory count is 1010. Section 4.4 and SSYS-043 own migration, palette/font ownership and transition direction.

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
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_information_architecture_or_duplicate_control_drift
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
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
  Appearance rows apply through the per-variant token contract as overrides over the active variant: size of everything,
  text size, line spacing, animation speed, spacing and extra padding, border width, corner roundness, scrollbar
  width, app font, high contrast, keyboard focus outline, Retro textures and accent. A row never changed writes
  no override, so each theme keeps its own values (unchanged means the theme's own); reset removes exactly the
  override that row wrote. Accent overrides use precomputed per-mode values, never runtime colour derivation,
  and theme-owned fine-tuning rows present the active variant's value until a value is chosen. Overrides share
  the theme pair's atomic acceptance, non-persistent preview and the exact level offered by SSYS-059; Device screen
  rows and theme-family adjustments keep their reviewed classification.
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
  - python3 scripts/pm-plan-index.py validate
risk_class: appearance_setting_without_effect_or_theme_override_leak
reasoning_tier: standard
context_scope: project_appearance_settings
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: project_appearance_settings_contract
  create_worknodes: false
source_lineage:
- Concepts/onboarding/opus-5.5/src/settings/kit.d/17-look.js
- Plans/FinalGUISpec.md#F3-426
- Plans/Settings_System.md#SSYS-010
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Settings sets defaults and runs guided set-ups; it does no live work. No Settings view shows, starts, pauses
  or stops a live chat or Goal: Goals start in the assistant chat or the Planning Wizard, Goals in Settings holds
  new-Goal defaults, templates, recovery and check rules, and one chat's own actions live in that chat's menu.
  Every set-up listed in the presentation section's owner-routes subsection runs in the onboarding wizard's form
  and ends with its result shown where it was started, changeable and removable. A permission profile carries
  its four answers and its own rules, which form the profile layer above the project's rules and win rule by rule;
  built-in profiles change only through a copy. SSH keys are one shared list that servers, SSH computers and Git's
  sign-in attach from, never showing or moving a private half. Settings Transfer previews every change in plain
  labels and values and never moves passwords, keys, sign-ins or device pairings. DL-271 weak-key eligibility,
  2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot be selected, used
  as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this eligibility
  before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make a weak
  key usable. A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other
  keys keep their existing owner checks, identity binding and custody; the shared list never exposes or moves
  a private half.


  DL-272 RV-5, 2026-11-01: SSH identity confirmation shows the fingerprint for comparison with a source the person
  already trusts, such as the device’s settings or its administrator. If it cannot be confirmed, Stop and ask;
  the picture or a reachable address is not verification. Username means the account allowed to connect by SSH.
  Copying account choices follows SSYS-062/MA-074: reuse only the chosen account's existing destination-local
  reference through its own connection, without rendering or moving any sign-in. Guided setup preserves FO-20
  Glass materials and protected-auth fences while naming its level and actual Computer. No live Goal, Plan, Crew
  or scheduled task becomes a Settings record.
gui_related: true
gui_classification_reason: Governs which Settings views may act on live work and how every guided set-up, permission profile, SSH key and transfer is presented.
split_recommended: false
depends_on: [SSYS-013, SSYS-040]
unblocks: []
acceptance_criteria:
- No Settings view lists, starts, pauses or stops a live chat or Goal, and no Settings row reads "this thread" or "this
  chat".
- Each listed guided set-up reaches its end in the wizard form and leaves its result on the page it started from, with
  a way to change or remove it.
- A permission profile shows its four answers and its own rules; a rule can move between a profile and the project; the
  profile's rule wins where both cover an action; a built-in profile's answers change only through Make a copy.
- Servers, SSH computers and Git's sign-in attach keys from one SSH key list, and no private key half is rendered.
- The transfer preview shows each changing setting by its plain label with plain before and after values, and lists what
  is never copied.
- 'DL-271 weak-key eligibility, 2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot
  be selected, used as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this
  eligibility before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make
  a weak key usable. A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other
  keys keep their existing owner checks, identity binding and custody; the shared list never exposes or moves a private
  half.'
- 'DL-272 RV-5, 2026-11-01: SSH identity confirmation shows the fingerprint for comparison with a source the person already
  trusts, such as the device’s settings or its administrator. If it cannot be confirmed, Stop and ask; the picture or
  a reachable address is not verification. Username means the account allowed to connect by SSH.'
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_live_work_or_guided_setup_drift
reasoning_tier: standard
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/Settings_System.md
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
- Concepts/onboarding/opus-5.5/src/settings/managers/31-goals.js
- Concepts/onboarding/opus-5.5/src/settings/managers/50-servers.js
- Concepts/onboarding/opus-5.5/src/settings/managers/52-permissions.js
- Concepts/onboarding/opus-5.5/src/settings/managers/53-transfer.js
- Plans/Permissions_System.md#PRECEDENCE-LAYERS
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock
  4c6305553d; weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no
  concept host, seeded situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e
  confirms unconditional weak-key refusal.'
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- 'source_ref:projects-pass2-20261103:S8–S11/N15; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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

### SSYS-043 - NieR Theme Family, Adjust Parts, Background And Load Migration

```yaml
plan_unit_id: SSYS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic, Friendly,
  Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A NieR family
  pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then cmd.settings.transaction.apply;
  no independent NieR switch or command remains. Adjust NieR opens the one existing editor. general.visual.nier-parts
  (29 parts) and general.visual.nier-background remain its Adjust rows, shown when general.visual.theme is NieR
  Light or NieR Dark, with hidden values retained. Basic High contrast remains Basic-only; DL-301 retires the older Basic scheme control everywhere, including advanced Settings, retaining stored values only as compatibility input;
  Glass and Retro controls remain confined to their own families. The selected NieR family resolves to nier-light
  or nier-dark and one corresponding precomputed palette; the shared brand kit consumes that resolved family/scheme.
  Implementation paint markers are source lineage, never an independent appearance state (DL-257/Q22; DL-260).
  NieR uses its existing precomputed palette and local fonts; its accent/font ownership while selected is unchanged,
  and stored general appearance overrides resume where applicable after another family is selected. general.visual.nier-mode
  is a retired migration-only key, removed from the active inventory. On load, stored true selects the NieR theme
  in the stored presentation mode (Light, Dark or Auto, resolving Auto through the OS), preserving parts and background;
  false or absent preserves the existing family/mode. The old boolean is then cleared, and repeating migration
  has no further effect. No second underlying family is saved to restore later. The title-bar selector, Guided
  Tour Look menu, onboarding welcome and its Look menu all offer the same five families in order basic, friendly,
  glass, retro, nier. Live family picks use the Settings transaction pair; inside onboarding, choose_look on ui.onboarding.choose_look
  previews family/mode or retained NieR Adjust values in the closed look_choice and persists only at the exact
  owner commit boundary under SSYS-065, Project-bound for a new Project and application/Computer-bound for approved
  Later. preview_nier and the independent nier_mode field are retired. Hover is silent and changes no theme; click
  or keyboard activation selects (O6). ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay
  remain presentation-only; nier.editor.open is the Adjust binding. No manager_id, route, detail id, command,
  new part or event is added. shell.nier.mode, tour.nier.mode and onboarding.nier.mode are retired non_dispatch
  census tombstones with no action, setting or production writer. Entering NieR uses its one Reboot moment only
  when the Reboot moment part is installed; otherwise it uses the standard look cover. Leaving NieR and switching
  Light/Dark within NieR use the standard look cover. Reduced Motion keeps the existing calm/instant settle policy.
  Explicit Play reboot moment remains a local rehearsal that changes no setting. The editor keeps Full install,
  Quiet, Still and Colors only presets, the eight existing backgrounds (City Ruins default), focus containment,
  Escape and exact focus return. It is a popup over the application and an in-window panel during onboarding.
  The explicit onboarding look is excluded from a Settings copy into the new Project (SSYS-036); this now means
  the theme pair and the two retained NieR Adjust rows. All motion obeys Animation speed and effective reduced
  motion; audio is gated by general.interaction.sound-effects and the Notifications & Sounds owner’s one player.
  No game asset, game audio or runtime color derivation is admitted. Legacy labels NieR Mode and Customize NieR
  Mode identify the retired override presentation, not a separate product mode. Q22 visible copy is Adjust NieR,
  or Adjust NieR… in the title-bar menu (foundations source confirmation 1030182542-5544). The earlier label Adjust
  NieR look is retained as historical source text only. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:
  Q22/Q5/Q21 final-source alignment: five family menus and ten variants use the existing theme pair. The header
  look menu is one bounded column; its option question control stays within its row. Adjust NieR is visible for
  NieR only; title-menu Adjust NieR… and Customize Pip… are ordinary aligned rows. NieR Mode is retired user-facing
  wording, retained only as source lineage. Q22/QA2 registry join (DL-257/DL-258): settings_inventory.retired_input_ids
  names migration-only historical keys outside the active settings array. It contains general.visual.nier-mode,
  is disjoint from active row IDs, adds no ordinary row/control/writer and does not count in the 1010-row census.
  Placement retirement validation may consume this explicit catalog; arbitrary unknown IDs remain errors, and
  current Settings request IDs still reject the retired key. Live look selectors use the exact level/key resolver
  and single atomic pair; Q22 still has five families/ten variants and a tombstoned general.visual.nier-mode,
  never a revived boolean writer.
gui_related: true
gui_classification_reason: Governs the fifth NieR theme family, retained Adjust rows/editor, selectors and retired-override migration (Q22).
split_recommended: false
depends_on: [SSYS-009, SSYS-010, SSYS-036, SSYS-039, SSYS-041, F3-426, F3-441]
unblocks: [F3-589, F3-598, F3-599]
acceptance_criteria:
- The family selectors expose Basic, Friendly, Glass, Retro and NieR, with ten variants and the same level-bound
  Settings owner.
- 'The retired general.visual.nier-mode key is migration-only: true selects NieR in the stored mode and is cleared;
  false/absent preserves the selection; migration is idempotent.'
- The retained 29-part and background Adjust rows show only for a NieR theme, preserve values while hidden and
  reuse the one editor and local actions.
- Onboarding uses choose_look, never preview_nier or nier_mode, and writes no Settings before its existing exact
  Project commit boundary.
- The three removed checkbox bindings have non_dispatch tombstones, and no new command, event, key or manager
  is introduced.
- Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the
  standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced
  Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal
  that changes no setting.
- Basic-specific rows stay Basic-only; CSS reuse is not a logical Basic family selection.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q22/Q5/Q21 final-source alignment: five family menus
  and ten variants use the existing theme pair. The header look menu is one bounded column; its option question
  control stays within its row. Adjust NieR is visible for NieR only; title-menu Adjust NieR… and Customize Pip…
  are ordinary aligned rows. NieR Mode is retired user-facing wording, retained only as source lineage.'
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: nier_mode_settings_drift
reasoning_tier: high
context_scope: project_appearance_settings
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: project_appearance_settings_contract
  create_worknodes: false
source_lineage:
- Plans/FinalGUISpec.md#F3-441
- Plans/Decision_Log.md#DL-152
- Concepts/onboarding/opus-5.5/src/settings/kit.d/18-nier.js
- Concepts/onboarding/opus-5.5/src/settings/nier/nier-automata.json
- 'DL-257/Q22 paint implementation lineage only: data-theme=''basic-<scheme>'' plus html[data-o55-nier=''on'']
  derives from family nier; PMLogo.look() returns nier-<scheme>. These CSS/JavaScript names are not product identity,
  storage or native API contracts (DL-260).'
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
- Do not restore an independent NieR override, checkbox, preview_nier intent or nier_mode field.
- Do not add a settings key, part, manager, route, command or event for the fifth family.
- Do not persist onboarding appearance before its exact admitted owner commit boundary, including the explicit
  application Later route.
- Do not derive palette values at runtime or use game assets/audio.
owner_hints:
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-041, ContractName:Plans/Settings_System.md#SSYS-036, ContractName:Plans/FinalGUISpec.md#F3-426, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/DRY_Rules.md#DR-056, ContractName:Plans/UI_Command_Catalog.md#UCC-120

## Settings controls hosted on the Usage page — 2026-10-09

The Usage page's Accounts room acts in place (`Plans/Decision_Log.md#DL-174`): each provider's auto-switch on/off and switch point are drawn on that provider's plate as the same controls Settings draws in the provider's own rows (section 8 above, `Plans/Multi-Account.md#MA-073`). SSYS-043 lets the NieR theme family and its Adjust editor live outside Settings where a look is chosen (Q22); this unit states the general rule for a Settings control hosted on another surface and names the Usage controls under it.

### SSYS-044 - Settings Controls Hosted Outside Settings

```yaml
plan_unit_id: SSYS-044
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  A surface other than Settings may host the control of a Settings row only where an owner unit names that surface
  and those row ids: SSYS-043 names the title-bar theme selector, the onboarding look choice and the Look menus
  for the theme pair and two retained NieR Adjust rows (Q22), and this unit names the Usage page's Accounts room
  for ai.accounts.multi-account-switching and ai.accounts.hard-switch-level at scope provider, one pair per provider
  plate with two or more accounts (Plans/Multi-Account.md#MA-073), and for ai.accounts.hard-switch-level at scope
  account, one control on each account card of such a plate and in that account's Details (owner decision 2026-10-10:
  account cards get switches); the account's control shows the level the account resolves to, says whether that
  level is the account's own or follows its provider (Plans/usage-feature.md#UF-107 says how it shows it), and
  offers following the provider again, which clears the account's own value; the provider's ai.accounts.soft-warning-level
  and ai.accounts.cooldown-policy are shown there as read values and edited only in Settings, reached through
  Open in Settings. A hosted control is a bound control of the same setting, not a copy: it reads the effective
  value, its scope and whether it is inherited from the Settings projection; every change it makes is one SSYS-009
  transaction through SSYS-018's cmd.settings.transaction.preview and then the bound cmd.settings.transaction.apply.
  The preview request carries the exact setting id, the exact offered level/key plus owner scope (provider or
  account), the provider id and, at scope account, the account id as the change's scope id, as typed fields of
  the Settings request contract (Plans/settings_system_contracts.schema.json), beside the expected per-setting
  revision vector at the bound level/key, the actor and an idempotency key; the apply request carries only the
  preview's id, generation and hash and the expected per-setting revision vector at the bound level/key, so the
  scope, the provider and the account are bound by the preview and never restated or changed at apply; a slider
  or stepper commits once when the value settles, not at every step; nothing paints as committed before admission,
  and an optimistic value reconciles to the typed result or rolls back with the owner's reason; and an unavailable
  control shows the owner's disabled reason. Settings and the hosting surface show the same value at once. An
  account's hosted level keeps the provider's hold rules: it stays below the warning level that applies to that
  account, a level at or past that warning level is shown disabled with the reason, and the Settings owner holds
  or refuses a write that would cross them, so a crossed pair is never stored (Plans/Multi-Account.md#MA-073).
  The hosted control offers Open in Settings through cmd.settings.open with target_type setting, its setting target
  naming the provider and, for an account's level, the account (SSYS-019), landing on the row inside that provider's
  section, or inside that account for an account's level. The Settings row stays the row's one home for SSYS-040's
  count; a hosted control is a consumer of it and adds no setting key, scope, manager_id, route, detail id or
  command id. MA-073's 2026-10-15 amendment is the sole validator for every switch/warn write, including hosted
  controls, multi-row writes and Back to the default. Consumers display its admitted value or named refusal, never
  the requested value as if committed; a refused restore is not silently moved to another value. When a warning
  write is blocked, show the owner's named account and the count of additional blockers without truncating away
  the reason. Clearing an account override is validated through the same owner, not a direct inherited-value write.
  Neither Usage nor Settings implements a second hold algorithm. Amended 2026-10-17 (DL-228): the provider's switch-level
  menu leads with "Same as everywhere · N% used" ("Follows Settings > Limits & switching"), which clears the provider's
  own value through the same preview and apply, held by MA-073, and the plate says its own-setting origin or "Same
  as everywhere" ("Same as the provider" for an account rung) by which value applies. The hosting surface for
  the provider pair is the auto-switch widget kind wherever it is placed: the Accounts hero, the Overview headroom
  card, any other Usage room and any dashboard board (WS-030) host the same bound controls, never a read-only
  copy. By this same rule the Costs budget card hosts ai.usage.budget-warning-threshold as its alert level, and
  its budget line reads ai.usage.monthly-spend-limit, "No budget set" at 0; the card stores no copy of either
  (UF-107). Amended 2026-10-29 (S5, D5; PM7): The wand Pip… and title-bar Customize Pip… host the same SSYS-056
  row editor/transaction as Settings; not an onboarding editor. Status bar Numbers/Words uses the admitted SSYS-057
  row through the same transaction. Amended Q22, Jared 2026-10-30 (DL-257): the fifth family uses the existing
  theme owner; no separate override remains. Every named hosted control consumes pm.settings_effective_value.v1
  for the actual context and SSYS-063 indicators/target feedback. Clearing provider/account own values re-resolves
  through Everywhere, Computer and optional Project before provider/account. Its original named consumer/row roster
  stays closed; generic layering alone admits no new hosted surface.
gui_related: true
gui_classification_reason: Governs Settings controls drawn on the Usage page and other named surfaces, their commits, their disabled states and their way back to Settings.
split_recommended: false
depends_on: [SSYS-009, SSYS-018, SSYS-019, SSYS-040, SSYS-043]
unblocks: [MA-073]
acceptance_criteria:
- Only the surfaces and row ids an owner unit names host Settings controls; the Usage Accounts room hosts exactly
  ai.accounts.multi-account-switching and ai.accounts.hard-switch-level at scope provider, one pair per provider
  with two or more accounts, and ai.accounts.hard-switch-level at scope account, one control on each account of
  such a provider (its account card and its Details), and no control for the warning level or the rest period.
- Each change on a hosted control dispatches one cmd.settings.transaction.preview whose request carries the setting
  id, the exact offered level/key plus owner scope (provider or account), the provider id and, at scope account,
  the account id as typed fields with the expected revision, actor and idempotency key, and one bound cmd.settings.transaction.apply
  that carries only the preview reference and expected revision; an apply whose preview named another scope, provider
  or account cannot be formed; a slider or stepper drag commits once on settle; a stale revision, invalid value
  or permission denial leaves the stored value and both surfaces unchanged and shows the reason.
- After an applied change on either surface, Settings and the Usage Accounts room show the same value, inherited,
  the provider's own or the account's own, without a reload.
- An account's hosted switch level shows the level the account resolves to and whether it is the account's own
  or follows its provider, offers following the provider again as one transaction that clears the account's own
  value, and offers no level at or past the warning level that applies to that account; the Settings owner holds
  or refuses a crossing write, so none is stored.
- No hosted control writes through a host-side setter, a local store or any path other than the Settings transaction,
  and none keeps a value of its own.
- Open in Settings dispatches cmd.settings.open with target_type setting, its setting target naming the provider
  and, for an account's level, the account, and lands on the row inside that provider's section, or inside that
  account for an account's level.
- No setting key, scope, manager_id, route, detail id or command id is added for hosting.
- Provider/account, shared warning, batch and restore-default paths all use MA-073; a refusal leaves committed
  values unchanged and names the blocking owner/account.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future hosted Settings control fixtures (one transaction per settled change, same value on both surfaces)
  - Plans/settings_system_contracts.schema.json preview request validation (typed scope and provider id)
risk_class: hosted_settings_control_copy_or_bypass
reasoning_tier: high
context_scope: settings_hosted_controls
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/settings_inventory.json
  - Plans/settings_system_contracts.schema.json
node_compile_hint:
  mode: settings_hosted_control_contract
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-174
- Plans/Settings_System.md#SSYS-043
- Concepts/usage-redesign/src/js/54-w-accounts.js (Usage redesign Accounts room auto-switch controls; source-lineage-only)
- Concepts/usage-redesign/src/js/16-settings.js (Usage redesign Settings bridge; source-lineage-only)
- /mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS-ADDENDUM-3.md (SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9;
  owner decision 2026-10-10 D43, account cards get switches; source-lineage-only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-usage-warn-hold--LANDING.md, SHA-256
  5357dc0dd60b0e08548f4dab5d5359662ee0ea0f159f7201a25577067372c238 (source lineage; not native certification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "cmd.settings.transaction.preview"
  - "cmd.settings.transaction.apply"
  - "cmd.settings.open"
  - "Open in Settings"
negative_constraints:
  - Do not host a Settings control on a surface or for a row id no owner unit names.
  - Do not let a hosted control write a setting through anything but the Settings transaction, or keep its own copy of the value.
  - Do not count a hosted control as a second home of the row, or add a key, scope, manager, route or command for hosting.
owner_hints:
  - Plans/Settings_System.md
  - Plans/Multi-Account.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Decision_Log.md#DL-174


## DL-180 to DL-183 — Panels, Tabs, Editor, Chat Column And Terminal Appearance Settings (2026-10-09)

This addendum compiles the Settings side of four decisions of 2026-10-09: `Plans/Decision_Log.md#DL-180` (Home becomes one universal panel system and the chat stays fixed on the right), `Plans/Decision_Log.md#DL-181` (the terminal is one session per tab and has no AI of its own), `Plans/Decision_Log.md#DL-182` (terminal images) and `Plans/Decision_Log.md#DL-183` (terminal schemes, backgrounds, effects and fonts, all applying live). Settings is not ported into PMConcept7 in this wave; these units fix exactly what Settings binds when it is. SSYS-050 owns the layout, tab, editor and chat column rows and every row this redesign retires; SSYS-051 owns the terminal look rows over the terminal's one appearance model and the terminal rows this redesign amends. They amend SSYS-010 (the chat layout row retires), SSYS-034 (images are DL-182's, with no Settings row), SSYS-040 (retired rows render nowhere, Restore home layout, Terminal look: more options) and section 4.4 (every panel and tab instead of the bottom panel), each with a dated note where it stands. They supersede the restart badges on `code.terminal.theme` and `code.terminal.font-family` and the terminal's own pane layouts in Settings. The semantics stay with their owners: the panels, tabs and named layouts are `Plans/FinalGUISpec.md#F3-630` to `Plans/FinalGUISpec.md#F3-634`, the narrow ladder `Plans/FinalGUISpec.md#F3-636`, the chat column `Plans/FinalGUISpec.md#F3-637`, the dashboard tab `Plans/FinalGUISpec.md#F3-638` with `Plans/Widget_System.md#WS-030`, the editor `Plans/FinalGUISpec.md#F3-639`, the terminal tab `Plans/FinalGUISpec.md#F3-640` and `Plans/FinalGUISpec.md#F3-641`, the appearance model `Plans/FinalGUISpec.md#F3-642` (one model, `Plans/DRY_Rules.md#DR-068`), the effects `Plans/FinalGUISpec.md#F3-643`, the faces `Plans/FinalGUISpec.md#F3-644`, the Home layout record `Plans/storage-plan.md#SP-330` and the terminal appearance storage `Plans/storage-plan.md#SP-331`. The commands are `Plans/UI_Command_Catalog.md#UCC-200` and `Plans/UI_Command_Catalog.md#UCC-201`. The concepts' settings keys (`panels.*`, `editor.*`, `chat.*`, `terminal.*`) are source lineage only and never inventory ids.

Amended 2026-10-10 (DL-186, DL-187; the planning thread's rulings of 2026-10-10): Jared's answers change four things here. Chat Layout (`general.visual.chat-layout-mode`) is retired properly: its row keeps no options, and a stored Overlay or Detached value is ignored and cleared on first read, with no pop-out and no notice (D32: a popped-out chat starts back in its column). Keep the Chat Open in Narrow Windows (`general.interaction.chat-keep-open`) retires: the narrow-window pin is the chat's own preference in its header menu and the title bar's Home options menu (`ui.chat_column.keep_open`, `Plans/UI_Command_Catalog.md#UCC-203`), not a Settings row. Dashboards (DL-186) keep their boards per project with no Settings row of their own, so Dashboard Widgets stays a route to the Home dashboard's Add widget. The terminal answers (D36 to D39) add no row: the secret scrub and the 512 MiB total are fixed (lead ruling F4), a terminal's notification mute is that tab's own state (lead ruling F5), and the "+" menu's installed shells and SSH hosts are what Allowed Shell Profiles already governs. The inventory census becomes 964 rows, 11 retired, 953 live.

### What Settings stores, and what it never writes

Every row below uses SSYS-002/059's declared storage and resolution: Everywhere, offered Computer/Device and optional Project own values. The inventory's layering field is the per-row authority; legacy scope is applicability metadata, not a Project-only storage rule. Settings never writes the Home layout record (SP-330): the split tree, the tabs, a panel's collapsed or locked state, the chat column's width and its pinned History are layout state, committed by the layout commands of UCC-200, and the v2 record keeps no pop-out: a popped-out chat lasts only while the app runs and starts back in its column (D32, SP-330; amended 2026-10-10, DL-187; it read: the chat column's width, its pinned History and its popped-out state are layout state, committed by the layout commands of UCC-200). Amended 2026-10-10 (lead ruling L9, corrected to view state with no event; lead ruling L7): of the chat column's three, only the width is committed by a UCC-200 command (`cmd.workspace_layout.resize_surface`); the History pin is view state written by UCC-203's `ui.chat_column.pin_history`, with no layout event, and the pop-out is no field of the record: `cmd.panel.undock` and `cmd.panel.redock` change it for the current run only (UCC-203; amended 2026-10-10, DL-187, D32; it read: and `popped_out` is current-run state changed by `cmd.panel.undock` and `cmd.panel.redock` (UCC-203)). None of them is a Settings value. The rows here only choose defaults and how things start. Amended 2026-10-10 (DL-187, D32): `popped_out` is not even current-run state that survives a restart: a popped-out chat starts back in its column, and nothing restores the pop-out.

S1–S7 supersede the L16 Project-only All terminals clause: All terminals now targets real Everywhere through SSYS-009/051; This terminal remains a tab override. The note names who follows, retained own values and Undo; no second appearance model is added.

Current rule: q-035 is resolved by SSYS-002. The app default is the real Everywhere level; offered Computer/Device and optional Project own values fall through to it. All chats and All terminals use the same admitted Settings preview/apply route with exact target/currentness; unavailable actual writers remain refused without queue.

Every row added or amended here applies live. A change commits through the Settings transaction over its exact id (SSYS-009), the panels, the editor, the chat column and every open terminal read the committed value at once, and no row carries a restart badge or waits for a reload. A row that says how something starts (Starting layout, Chat history list, Remember window layout, Terminals when reopening a project, Tabs remembered between sessions) is in effect at once for the next start it governs, and a row that caps or opens tabs (Max open editor tabs, Preview tabs) at the next open. No Settings change opens, closes, moves or rearranges a panel or a tab that is already open (SSYS-042); Restore home layout routes to Home's own `cmd.workspace_layout.reset` after one plain question.

### Rows retired

Retired rows follow the inventory's own convention, the one `general.visual.basic-color-scheme` carries: the row stays in `Plans/settings_inventory.json` with its id, label and shape, and its description ends with `(Superseded by …)` naming what replaced it. No id is deleted or reused. One exception, dated 2026-10-10 (DL-187, the planning thread's ruling): `general.visual.chat-layout-mode` keeps its id, label and type but no options, default or recommended value, since it is retired with no options. A row retired here is drawn on no page, in no manager and in no search result, Settings Transfer never proposes it, and nothing reads a value stored for it; no shipped build has stored one, because the Settings runtime is not yet built (section 7).

| Id | Label | Why it retires | What replaces it |
|---|---|---|---|
| `general.interaction.panel-dock` | Panel Position | The chat never docks to another edge or floats inside the window (DL-180); the left rail's side panels are the rail canon's (DL-162, DL-163). | The chat's Pop out (`cmd.panel.undock`, Dock back `cmd.panel.redock`) |
| `general.visual.chat-layout-mode` | Chat Layout | Overlay and Detached-as-a-float leave with the movable chat. Docked is the only state inside the window, and being popped out is a window state the pop-out commands change for the current run only, which the v2 record does not keep (a popped-out chat starts back in its column, D32, SP-330), not a choice made in Settings, so the row retires whole rather than keeping two values (amended 2026-10-10, DL-187; it read: being popped out is a window state the Home layout record keeps and the pop-out commands change). Amended 2026-10-10 (DL-187, D32; the planning thread's ruling): the pop-out is never saved, so the record keeps no popped-out state either; the row keeps no options, and a stored Overlay or Detached value is ignored and cleared on first read, with no pop-out and no notice. | The chat's fixed column and its Pop out in the desktop app (`cmd.panel.undock`), which lasts only while the app runs |
| `general.interaction.chat-keep-open` | Keep the Chat Open in Narrow Windows | Retired 2026-10-10 (DL-187; the planning thread's ruling under D4): the narrow-window pin is the chat's own preference, not a Settings row. It was added on 2026-10-09 and never shipped. | Keep the chat open in narrow windows in the chat header's menu and the title bar's Home options menu (`ui.chat_column.keep_open`, UCC-203) |
| `code.terminal.layout-style` | Preferred Layout | Single, split and Quadrant panes inside a terminal retire (DL-181). | The named layouts, Terminals 2x2 among them, and `general.startup.starting-layout` |
| `code.terminal.auto-second-pane` | Auto-Open a Second Pane | There are no terminal sections or second panes (DL-181). | Split, which opens a new panel with its own terminal |
| `code.editing.editor-strip-collapsed` | Start With Editor Strip Collapsed | There is no separate editor strip (DL-180). | Folding any panel to its tab strip (`cmd.workspace_layout.set_collapsed`), kept in the layout record |
| `code.terminal.explanations` | Explain What Commands Do | No AI inside the terminal (DL-181, D19). | The Teacher persona in the chat (`Plans/Personas.md` section 11.8) |
| `code.terminal.tab-role` | Tab Purpose Hints | The per-tab role setting retires (DL-181). | Shell profiles (`code.terminal.allowed-profiles`) and the tab's own label (`cmd.panel_tab.rename`) |
| `code.terminal.search` | Search in Terminal | Find is always present (DL-181). | The terminal find control (`Plans/FinalGUISpec.md#F3-641`) |
| `code.terminal.flicker-amount` | Flicker Amount | Retired 2026-10-16 (DL-213, Jared's P10): within the 0.03 cap no two amounts look different, so Flicker is on or off at one faint level (F3-643). Unlike the rows above, a stored amount is read once by SSYS-051's rule, then forgotten. | Flicker (`code.terminal.flicker`), on or off |

### Rows amended

SSYS-050's seven:

| Id | Label | What changed |
|---|---|---|
| `general.interaction.dashboard-widgets` | Dashboard Widgets (Choose widgets) | Every dashboard tab keeps its own widgets and layout, each board per project (`widget_layout:v1:<project_id>:<board_id>`, WS-030; amended 2026-10-10, DL-186; it read: `widget_layout:v1:dashboard:<board_id>`, a key that was never written); the row opens the Home dashboard tab's own widget picker where that tab is and stores no widget layout. Amended 2026-10-10 (DL-186): the picker is the Home dashboard's Add widget, and Home starts from its own set of Usage widgets, the old Home widgets gone; range, scope, Start from and presets are the dashboard's own Board menu, never Settings rows. |
| `general.interaction.max-editor-tabs` | Max Open Editor Tabs | Counts editor tabs across every panel of the workspace (25, unchanged); past it the least recently used editor tab closes, never a pinned one or one with unsaved changes. Other kinds are not counted and never close on their own: closing a terminal ends its session (DL-181). |
| `general.startup.max-persisted-tabs` | Tabs Remembered Between Sessions | Applies to tabs of every kind in a workspace's saved layout (50, unchanged), least recently used dropping first; the editor tabs among them stay within Max Open Editor Tabs, the bound section 2 of the presentation rework already names. |
| `general.startup.reset-home-layout` | Restore Home Layout (was Reset Home Layout) | Puts the panels back in the Home layout and keeps every open tab (`cmd.workspace_layout.reset`); the label is the title bar's Home menu row's; its button reads Restore. |
| `general.startup.window-state` | Remember Window Layout | Is the "restore layout at start" choice: on, the window's size and position and each workspace's layout (panels, sizes, tabs, chat column) come back; off, each workspace opens in the Starting Layout. |
| `code.editing.word-wrap` | Wrap Long Lines | Applies at once in every editor tab; the editor's word wrap is this row, not a new one. |
| `code.terminal.layout-restore` | Terminals When Reopening a Project (was When Reopening a Project) | Re-scoped from the terminal's own layout to the terminal tabs of a saved layout: Restore Last Layout brings them back as SMPFS-180 says, Start Fresh leaves them closed. A session verified still running always comes back in its tab, whatever this row or Remember Window Layout says. |

Amended 2026-10-10 (lead ruling L18): `code.terminal.search` is retired (Rows retired above) and renders nowhere; its row below is kept as lineage only, so SSYS-051 amends eleven live rows.

SSYS-051's twelve (eleven live, and `code.terminal.search`, retired since):

| Id | Label | What changed |
|---|---|---|
| `code.terminal.theme` | Terminal Colors | The scheme field: Follow look (default) or one of the 34 schemes of F3-642 or an imported one; the restart badge is removed. The earlier "Match App Theme" stays a search word and reads as Follow look. |
| `code.terminal.font-family` | Terminal Font | The font field: Follow look (default), JetBrains Mono, Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or System monospace (F3-644); the restart badge, Fira Code, SF Mono and Custom are removed, because every terminal face other than System monospace, which uses the computer's own monospace face, is built in under the licence rule. |
| `code.terminal.font-size` | Terminal Text Size | The size field: Font default (each face's own size, F3-644) instead of 12. A terminal's Text size menu is a view zoom of that terminal alone (UCC-201), not this row. |
| `code.terminal.copy-on-select` | Copy When I Highlight | Also the model's copy-on-select field (off), which a terminal’s Customize screen can set for that terminal alone. |
| `code.terminal.sticky-header` | Keep Command Titles Visible | Also the model's sticky-header field (on); describes F3-640's sticky command header. |
| `code.terminal.shell` | Default Shell Profile (was Shell) | The profile a new terminal opens with when none is picked (Ctrl+T in a terminal panel, the "+" menu's Terminal row body). |
| `code.terminal.allowed-profiles` | Allowed Shell Profiles | The profiles the "+" menu's Terminal row and the terminal's New terminal menu list: the shells on this computer, named profiles and, added as a choice, the SSH computers of `code.execution.ssh-remotes`. Amended 2026-10-10 (DL-187, D39): the shells it allows are listed inline, every one, and the SSH computers sit in their own SSH hosts submenu (`Plans/FinalGUISpec.md#F3-632`, `#F3-640`). |
| `code.terminal.right-click-paste` | Right-Click to Paste | Off by default now, because a right click opens the terminal's menu (F3-640); on, a right click pastes and Shift+right click opens the menu. |
| `code.terminal.rendering-mode` | Rendering Mode (was Terminal Look & Feel Preset) | Keeps the render modes of the Section15 terminal (Interactive Rich, Plain, Minimal) and says it never sets colours, fonts, backgrounds or effects: those are the Terminal look rows. |
| `code.terminal.shell-integration` | Shell Integration (was Shell Integration Status) | A switch, as its type always was: on, the shell's prompts and commands are marked (each mark carrying the terminal's secret, SMPFS-183); off, the shell runs as it is, with no command marks, sticky command header or command jumps. |
| `code.terminal.search` | Search in Terminal | Superseded 2026-10-10 by its retirement (lead ruling L18; Rows retired above): the row renders nowhere. Before that: Find is in every terminal (Ctrl+Shift+F, Cmd+F on a Mac, F3-641; the old Ctrl+F is corrected), so the switch no longer turns it off: it shows on and unavailable with that reason, and nothing reads its stored value. |
| `code.terminal.transcript-retention` | Saved Terminal Output (was Keep Terminal History For) | Bound to the terminal's saved scrollback (`Plans/storage-plan.md#SP-332`), which restore brings back: Keep Saved Scrollback (default, was Session Only) keeps it by SP-332's rule, and Session Only saves none, so a restored or reopened terminal starts without its earlier output. The 24 Hours, 7 Days, 30 Days and Forever choices, the 7 Days recommendation and the adjudication badge go, because SP-332's quota and closed-tab limit replace them. Amended 2026-10-10 (DL-187; D36, D37): Keep Saved Scrollback also leaves well-known secrets out of the saved copy, the live screen keeping them, and keeps saved scrollback within a total of 512 MiB across every terminal, the oldest going first, beside each terminal's 64 MiB (SP-332). The scrub and the 512 MiB total are fixed, not choices (lead ruling F4). Storage health lists this family with its fixed 512 MiB total and 64 MiB per-terminal budgets (SSYS-058). |

### Rows added

Amended 2026-10-10 (D30; R35): `code.editing.color-scheme` (Editor Colors) joins the rows below, making twelve, and Editor Line Spacing's default is 1.55 (it read "none yet").

SSYS-050's twelve retain their IDs; each is stored only at the reviewed SSYS-059 levels:

| Id | Label | Type and choices | Default | Group |
|---|---|---|---|---|
| `general.startup.starting-layout` | Starting Layout | select: Home, Build, Terminals 2x2, Focus | Home | App & Input › Window & panels |
| `general.interaction.chat-keep-open` | Keep the Chat Open in Narrow Windows (retired 2026-10-10, DL-187: the chat's own preference, not a Settings row) | toggle | off | App & Input › Window & panels |
| `general.interaction.chat-history-list` | Chat History List | select: Flyout, Pinned | Flyout | App & Input › Window & panels |
| `general.interaction.preview-tabs` | Preview Tabs | toggle | on | Editor & Terminal › Saving & tabs |
| `general.interaction.tab-sizing` | Tab Sizing | select: Shrink to fit, Fixed width | Shrink to fit | Editor & Terminal › Saving & tabs |
| `code.editing.font-family` | Editor Font | select: JetBrains Mono, Atkinson Hyperlegible Mono, System monospace | JetBrains Mono | Editor & Terminal › Editing |
| `code.editing.font-size` | Editor Text Size | number, px | 13 | Editor & Terminal › Editing |
| `code.editing.line-height` | Editor Line Spacing | slider, a multiple of the text size | 1.55 | Editor & Terminal › Editing |
| `code.editing.color-scheme` | Editor Colors | select: Follow look or a catalog scheme (F3-642) | Follow look | Editor & Terminal › Editing |
| `code.editing.minimap` | Minimap Scrollbar | toggle | on | Editor & Terminal › Editing |
| `code.editing.sticky-scroll` | Sticky Scroll | toggle | on | Editor & Terminal › Editing |
| `code.editing.diff-layout` | Diff Layout | select: Automatic, Side by side, Inline | Automatic | Editor & Terminal › Editing |

Starting Layout is the named layout a workspace opens in when it has no saved layout of its own, with the trees of F3-630; Restore home layout still returns to Home. Keep the Chat Open in Narrow Windows is F3-636's switch: below 480 px of centre width the chat folds to its edge strip unless it is on; the title bar's Home menu carries the same switch and writes this row through the Settings transaction. Amended 2026-10-10 (DL-187; the planning thread's ruling under D4): that row is retired (Rows retired above); the switch is the chat's own preference, `ui.chat_column.keep_open`, in the chat header's menu and the Home options menu, and Settings neither shows nor writes it, so eleven of the twelve rows below stay live. Chat History List is how the 5.6 Pro History list starts in a workspace with no choice saved yet; pinning or unpinning it in the chat is that workspace's layout state (SP-330), so the row is a starting value and never a second store. Preview Tabs off makes every open that would make F3-634's preview tab open a kept tab instead; the rest of F3-634 (one id, one tab, reveal where open, placement) is unchanged. Tab Sizing's Shrink to fit is F3-631's cascade (96 to 200 px, inactive tabs to 72 px, then 36 px icons, then "+N"); Fixed width skips the shrinking and moves what does not fit to "+N" at once. In both, pinned tabs stay 36 px and the active tab stays visible and at least 120 px wide. Max Open Editor Tabs and Tabs Remembered Between Sessions stay in Saving & tabs, and Remember Window Layout stays in When Puppet Master opens. The editor rows are the editor kind's own values (F3-639), not SSYS-041 token overrides: the app's text size and line spacing do not change them, UI Scale (`general.visual.ui-scale`) still scales them with the rest of the app, and NieR Mode, which decides the app font, does not override Editor Font, since F3-644 separately owns the editor code face and its shared embedding. Minimap Scrollbar off draws a plain scrollbar where the minimap was. Diff Layout's Automatic decides by the tab body's own width, never the window's (F3-639).

Choices the concepts carried that are not rows, and why:

- The chat's width. The drag commits once as `cmd.workspace_layout.resize_surface` with the chat surface and is kept in the Home layout record (F3-637, SP-330); a Settings row would be a second store for one value.
- Revealing a file where it is already open. One id is one tab (F3-634, DR-071): a file already open anywhere is shown where it is, and a switch that turned this off would open the same file twice.
- What an empty panel does when its last tab closes. F3-630's panel lifecycle is the rule (the panel closes unless it is the only one in the centre or locked); Lock is the per-panel way to keep an empty panel.
- What the "+" does. It always opens its menu and never makes a tab by itself (F3-632).
- Which side a tab's close button sits on. No decision or settled measurement asks for a choice, and the strip's close slot, which also holds the unsaved dot, is one-sided (F3-631).
- Restoring the layout at start. That is `general.startup.window-state`, which section 3 of the presentation rework already made the one control for window and panel restore.
- Degauss. A one-off action in the terminal's Customize screen (F3-650) (F3-643), never stored.
- Keeping the chat open in narrow windows (amended 2026-10-10, DL-187). The chat's own preference in its header menu and the Home options menu (`ui.chat_column.keep_open`); its 2026-10-09 row retires.
- A dashboard's range, scope, starting set and presets (added 2026-10-10, DL-186). Each dashboard's Board menu sets them (`ui.widget_board.set_view`, `cmd.widget.reset_layout` with `set_id`, `ui.widget_preset.*`); they are kept with the board or the person's presets (WS-030), never as Settings values.
- A terminal's notification mute and the notification rate (added 2026-10-10, DL-187, D38). The mute is that terminal tab's own state, saved with the tab (`ui.terminal.mute_notifications`, lead ruling F5), and the limit of one notification every 3 s per terminal is fixed (F3-641).
- The saved-scrollback secret scrub and the 512 MiB total across terminals (added 2026-10-10, DL-187, D36, D37). Both are fixed (lead ruling F4; SP-332); Saved Terminal Output's Session Only remains the way to save no scrollback at all.

### The terminal look rows

Amended 2026-10-16 (DL-206, SSYS-051): the table now contains forty-six terminal look rows, including the ten admitted round-3 background/housing/mask rows. Legacy scope `global` and `project` is applicability metadata; each row's layering declares the offered Everywhere, Computer/Device and Project values. All terminals writes Everywhere through the existing Settings preview/apply writer; This terminal remains the existing tab-owned value (SSYS-002/051/059, DL-283). `settings_inventory.json` owns each row's type/default; `terminal_background_catalog.json` owns the finite design choices. F3-642/F3-643 retain behavior ownership and the explicit round-5 holds.

Amended 2026-10-16 (DL-213, terminal rounds 4 and 5, Jared's P10 and P14): the round-5 holds are closed. Forty-five of the forty-six rows are live: Flicker Amount retires (Rows retired above), Terminal Bell offers Follow look and Off, Picture Desaturation defaults to 0.5, Bezel Reflection is the material's own level (Auto) or one of four levels, and Phosphor Mask draws at every display density. The ten round-3 rows are live Settings rows in the published concept; no publication guard holds them back.

| Id | Label | Type and choices | Default |
|---|---|---|---|
| `code.terminal.scheme-pair` | Switch With Light and Dark | toggle | on |
| `code.terminal.min-contrast` | Minimum Text Contrast | select: Off, 3:1, 4.5:1, 7:1 (program output only) | 4.5:1 |
| `code.terminal.import-scheme` | Import a Color Scheme | action (`cmd.terminal.appearance.import_scheme`, UCC-201) | none |
| `code.terminal.font-weight` | Terminal Text Weight | number | 400 |
| `code.terminal.line-height` | Terminal Line Spacing | slider | Font default |
| `code.terminal.letter-spacing` | Letter Spacing | number, px | 0 |
| `code.terminal.ligatures` | Ligatures | toggle | on |
| `code.terminal.bold-bright` | Bold As Bright | toggle | off |
| `code.terminal.cursor-shape` | Cursor Shape | select: Follow look, Block, Bar, Underline | Follow look |
| `code.terminal.cursor-blink` | Cursor Blink | toggle | on |
| `code.terminal.cursor-trail` | Cursor Trail | select: Follow look, Off, Soft, Glow, Phosphor, Trace | Follow look |
| `code.terminal.background` | Terminal Background | select: Follow look, Theme surface, Solid color, Gradient, Image | Follow look |
| `code.terminal.background-color` | Background Color | text (a colour) | none |
| `code.terminal.background-gradient` | Background Gradient | select: Fade, Corner light, Horizon, Vignette, Split, Deep, Warm paper, Aurora, Nebula, Dawn, Ink bloom, Dusk, Prism edge | Fade |
| `code.terminal.background-image` | Background Image | select: Dot grid, Graph paper, Blueprint, Diagonal hatch, Pixel checker, Topography, Waves, Halftone, Scanline field, Staff lines, Squares, Paper, Puppet cross, Droplet, Prompt, Glyph, Ridgelines, Dunes, Night city, Starfield, Synthwave, Caustics, Bokeh, Clouds, Drifting aurora, Twinkling stars, Rain, Snow, Lava, Clear glass, Frosted glass, Tinted glass, Reeded glass, Frosted panes, Layered sheets, Rain on glass, Lens, Etched glass, Running rain, Green-bar paper, Phosphor glow, Tube glass, Aperture grille, Static, Phosphor grid, Test pattern, ANSI art, Vector terrain, Boot ghost, Oscilloscope, Glyph rain, Custom | Ridgelines |
| `code.terminal.background-image-file` | Custom Background Image | path | none |
| `code.terminal.background-dim` | Background Image Dimming | slider | Auto |
| `code.terminal.background-blur` | Background Image Blur | slider, px, made once on the picture | 0 |
| `code.terminal.opacity` | Terminal Opacity (Glass) | slider | Follow look (70 % light, 74 % dark) |
| `code.terminal.padding` | Terminal Padding | number, px across, 60 % of it above and below | 0 |
| `code.terminal.effects` | Terminal Effects | select: Follow look, Off, Custom | Follow look |
| `code.terminal.scanlines` | Scanlines | select: Follow look, On, Off | Follow look |
| `code.terminal.scan-strength` | Scanline Strength | slider | 0.30 |
| `code.terminal.glow` | Phosphor Glow | select: Follow look, On, Off | Follow look |
| `code.terminal.glow-strength` | Glow Strength | slider | 0.45 |
| `code.terminal.crt` | Full CRT | toggle | off |
| `code.terminal.curvature` | Screen Curvature | slider | 0.04 |
| `code.terminal.burn-in` | Burn-In | toggle, within Full CRT | on |
| `code.terminal.noise` | Screen Noise | slider | 0.035 |
| `code.terminal.flicker` | Flicker | toggle | off |
| `code.terminal.flicker-amount` | Flicker Amount (retired 2026-10-16, DL-213: Flicker is on or off at one faint level) | slider | 0.02 |
| `code.terminal.inactive-dim` | Dim Terminals I'm Not In | select: Follow look, On, Off | Follow look |
| `code.terminal.smooth-scroll` | Smooth Scrolling | select: Follow look, On, Off | Follow look |
| `code.terminal.bell` | Terminal Bell | select: Follow look, Off | Follow look |
| `code.terminal.sixtyfour-scan` | Sixtyfour Scanlines | slider, -53 to 100 | none |
| `code.terminal.sixtyfour-bleed` | Sixtyfour Bleed | slider, 0 to 100 | none |
| `code.terminal.background-strength` | Background Strength | slider | 1 |
| `code.terminal.background-scale` | Pattern Size | select: Fine, Medium, Coarse (Pattern designs other than Paper) | Medium |
| `code.terminal.background-motion` | Background Motion | select: Off, Gentle, Lively | Gentle |
| `code.terminal.background-fit` | Picture Fit | select: Cover, Contain, Tile, Centre | Cover |
| `code.terminal.background-desaturate` | Picture Desaturation | slider: full colour, half or grey | 0.5 |
| `code.terminal.bezel` | Terminal Bezel | select: Off, Slim, Monitor | Off |
| `code.terminal.bezel-width` | Bezel Width | slider | Style default |
| `code.terminal.bezel-material` | Bezel Material | select: Follow look, Graphite, Black gloss, Platinum, Putty, Brushed aluminium, Gunmetal, Glass, Accent | Follow look |
| `code.terminal.bezel-reflection` | Bezel Reflection | slider: Auto (the material's own level) or one of four levels, stored on SSYS-051's scale | Auto |
| `code.terminal.phosphor-mask` | Phosphor Mask | toggle, within Full CRT; drawn at every display density | off |

The existing scheme, font, size, copy-on-select and sticky-header rows retain their owners; the exact appearance writer/reset field set remains SSYS-051's companion inventory. A field that reads Follow look, Font default or none falls through to the look's default (for the scheme, font and effects, the per-look defaults of F3-642 and F3-644); none is a value the sources have not settled yet, listed for the next installment. Scanlines and Phosphor Glow left on Follow look draw what the look draws: on in Retro dark, off elsewhere (F3-643).

Visibility amendment 2026-10-16 (DL-213, closing DL-206's round-5 hold): the ten round-3 rows show where the Customize screen (F3-650) offers their control. Background Strength only while Terminal Background is Gradient or a built-in Image design; Pattern Size only while that design is a Pattern design other than Paper; Background Motion only while it is a moving design (the catalog's `moving`); Picture Fit and Picture Desaturation only while Background Image is Custom, Picture Desaturation also hidden while the picture's dim is 90 % or more (F3-642); Bezel Width, Bezel Material and Bezel Reflection only while Terminal Bezel is Slim or Monitor, Bezel Reflection also hidden on NieR's own ink frame, which has no reflection (F3-643); Phosphor Mask only while Full CRT is on. Flicker Amount is retired and renders nowhere. The previously admitted rows retain the visibility rule of the presentation rework, section 5: Background Color only while Terminal Background is Solid color; Background Gradient only while it is Gradient; Background Image, Background Image Dimming and Background Image Blur only while it is Image; Custom Background Image only while Background Image is Custom; Terminal Opacity (Glass) only under a Glass theme, as SSYS-010's family-specific rows; Scanlines, Phosphor Glow, Full CRT and Flicker only while Terminal Effects is Custom; Scanline Strength while Scanlines is On, Glow Strength while Phosphor Glow is On, Screen Curvature, Burn-In and Screen Noise while Full CRT is on; Sixtyfour Scanlines and Sixtyfour Bleed only while Terminal Font is Sixtyfour. A hidden row keeps its stored value. No row turns an effect on where F3-643 keeps it off: effects run only in the focused terminal and stop when it is idle, every moving part (cursor blink and trail, smooth scrolling, burn-in, noise, flicker, the bell's flash) stops under Reduce Animations and on battery saver, and the no-GPU path draws what F3-643 says it can.

Where the terminal rows sit (SSYS-040's Editor & Terminal groups). Terminal: Default Shell Profile, Starting Folder, Run When a Terminal Opens, Before Closing a Busy Terminal, Terminals When Reopening a Project. Terminal look: Terminal Colors, Switch With Light and Dark, Minimum Text Contrast, Import a Color Scheme, Terminal Font, Terminal Text Size, Terminal Line Spacing, the three cursor rows, the background rows except the blur, Terminal Opacity (Glass), Terminal Effects and the effect rows, Dim Terminals I'm Not In, Smooth Scrolling and Terminal Bell. Terminal look: more options (folded): Terminal Text Weight, Letter Spacing, Ligatures, Bold As Bright, Font Rendering, Terminal Padding, Background Image Blur and the two Sixtyfour rows. Terminal output & history holds Keep Command Titles Visible, Reading Aids, Saved Terminal Output and Scrollback Lines, and Copy & paste keeps Copy When I Highlight, Right-Click to Paste, Copy & Paste Style and Check Before Pasting Several Lines; Search in Terminal is retired and drawn nowhere. Terminal look also holds Rendering Mode and the ten round-3 background and bezel rows, which show under the visibility amendment. Terminal: more options keeps Allowed Shell Profiles, Font Rendering, Shell Integration, Performance Mode, Terminal Shortcuts and Terminal Debug Logging (amended 2026-10-17, DL-228: the list follows the published placement; Font Rendering moved here from Terminal look: more options).

How the older group names of `Plans/FinalGUISpec.md#F3-121` map onto these: Appearance is Terminal look and Terminal look: more options; layout and Workspaces retires with the terminal's own layouts (its two layout rows retire above, Terminals When Reopening a Project sits in Terminal, and panels and named layouts are App & Input › Window & panels); Shell and Startup is Terminal, with Allowed Shell Profiles in Terminal: more options; Interaction is Copy & paste and Terminal output & history, less the retired Explain What Commands Do and Tab Purpose Hints; Diagnostics is Terminal: more options.

### SSYS-050 - Panels, Tabs, Editor And Chat Column Rows, And The Rows The Redesign Retires

```yaml
plan_unit_id: SSYS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Settings binds the universal panels, their tabs, the editor and the chat column through these rows (DL-180,
  DL-181), each an ordinary Settings value at the reviewed levels in SSYS-002/059 that applies live: it commits
  through cmd.settings.transaction.preview then cmd.settings.transaction.apply over its exact id, the surfaces
  that read it take the new value at once, no row carries a restart badge, a row that says how something starts
  governs the next start, and no Settings change opens, closes, moves or rearranges a panel or tab already open
  (SSYS-042). Settings never writes the Home layout record (Plans/storage-plan.md#SP-330): the split tree, the
  tabs, collapse and lock, and the chat column's width and pinned History are layout state; the v2 record keeps
  no pop-out, and a popped-out chat lasts only while the app runs and starts back in its column (D32, SP-330;
  amended 2026-10-10, DL-187; it read: the chat column's width, pinned History and popped-out state are layout
  state). Added: general.startup.starting-layout (Home, Build, Terminals 2x2 or Focus; Home), general.interaction.chat-keep-open
  ("Keep the chat open in narrow windows"; off; retired the same day by the 2026-10-10 amendment below, amended
  2026-10-17, DL-228), general.interaction.chat-history-list (Flyout or Pinned, the start for a workspace with
  no saved choice; Flyout), general.interaction.preview-tabs (on), general.interaction.tab-sizing (Shrink to fit,
  F3-631's cascade, or Fixed width; Shrink to fit), code.editing.font-family (JetBrains Mono, Atkinson Hyperlegible
  Mono or System monospace; JetBrains Mono in every look), code.editing.font-size (13), code.editing.line-height
  (1.55), code.editing.minimap (on), code.editing.sticky-scroll (on) and code.editing.diff-layout (Automatic,
  side by side when the tab is wide and inline when narrow, or a fixed choice; Automatic). Amended: general.interaction.dashboard-widgets
  opens the Home dashboard tab's own widget picker and stores no widget layout, every dashboard tab keeping its
  own (WS-030); general.interaction.max-editor-tabs (25) counts editor tabs across the workspace and closes only
  the least recently used editor tab that is not pinned and has no unsaved changes; general.startup.max-persisted-tabs
  (50) applies to tabs of every kind; general.startup.reset-home-layout reads Restore home layout, the title bar's
  words, and routes to cmd.workspace_layout.reset, which keeps every open tab; general.startup.window-state is
  the restore-layout-at-start choice; code.editing.word-wrap applies in every editor tab; code.terminal.layout-restore
  decides whether a saved layout's terminal tabs come back as SMPFS-180 says, a session verified still running
  always coming back. Retired, by the inventory's own (Superseded by ...) convention, kept as lineage, drawn nowhere
  and read by nothing: general.interaction.panel-dock, general.visual.chat-layout-mode (being popped out is a
  window state of the current run only, which the v2 record does not keep, so the row retires whole; amended 2026-10-10,
  DL-187, D32; it read: being popped out is a window state the layout record keeps), code.terminal.layout-style,
  code.terminal.auto-second-pane, code.editing.editor-strip-collapsed, code.terminal.explanations (D19, the Teacher
  persona explains commands in the chat) and code.terminal.tab-role (shell profiles and the tab label), plus code.terminal.search
  (find is always present, F3-641; DL-181). The chat width, revealing an already open file, an empty panel's fate,
  what "+" does and the close button's side are not rows. With SSYS-051's thirty-six rows, the inventory holds
  964 rows (916 plus 48 added), of which 10 are retired (the eight this unit retires, general.visual.basic-color-scheme
  and, from 2026-10-10 (USG-1, DL-174), ai.accounts.account-threshold-override), leaving 954 live rows. Settings
  > Editor has code.editing.color-scheme (Editor Colors), a scheme row bound to F3-642's shared code colour-scheme
  catalog, defaulting to "Follow look" and applying live through the same Settings transaction as the other editor
  rows. Amended 2026-10-10 (DL-187, D32 and D40; the planning thread's rulings of 2026-10-10): general.visual.chat-layout-mode
  is retired properly: its row keeps no options and no default, and a stored Overlay or Detached value is ignored
  and cleared on first read, with no pop-out and no notice; the chat's pop-out is never saved, so the layout record
  keeps no popped-out state either. general.interaction.chat-keep-open retires too: Keep the chat open in narrow
  windows is the chat's own preference in its header menu and the title bar's Home options menu (ui.chat_column.keep_open,
  UCC-203), never a Settings row. The inventory then holds 964 rows, 11 of them retired (the ten above and general.interaction.chat-keep-open),
  leaving 953 live rows; the published concept's own census is 891 live concept ids plus the retired Chat Layout
  row (SSYS-035), a separate count of what the concept draws. Amended 2026-10-10 (DL-186): general.interaction.dashboard-widgets
  stays a route to the Home dashboard's Add widget; each board is kept by its explicit application or Project
  layout owner (WS-030), and a dashboard's range, scope, starting set and presets are its own Board menu's, never
  Settings rows. The 2026-10-14 editor inventory and grouping are SSYS-052's and Wallpaper is SSYS-054's. Earlier
  inventory counts in this unit are dated census history; the live total is obtained from the registry, not a
  second hard-coded authority. Preview Tabs and Tab Sizing are drawn in Editor & Terminal > Saving & tabs. Amended
  2026-10-17 (DL-228): applying a named layout never writes Starting Layout; the concept's fallback, in which
  the last layout applied becomes what a project without a saved layout opens in, is lineage. general.startup.max-persisted-tabs
  always keeps each panel's shown tab and every pinned tab, so no panel comes back empty, and applies again when
  a saved layout is read, so a lower limit set since holds from the first frame; general.interaction.max-editor-tabs
  closes at the next open, never the tab just opened, and announces "The editor tab used least recently closed:
  at most N stay open". The concept draws no Chat History List row; that is lineage, not a retirement: no Plans
  or Jared ruling retires general.interaction.chat-history-list, which seeds only how History starts in a workspace
  with no saved choice, history_pinned itself staying layout state (F3-637).
gui_related: true
gui_classification_reason: Each row is a visible Settings control for the home panels, tabs, editor or chat column, and the retirements remove visible rows.
split_recommended: false
depends_on: [DL-180, DL-181, DL-183, DL-186, DL-187, SSYS-002, SSYS-004, SSYS-009, SSYS-040, SSYS-042, F3-630, F3-636, F3-637, F3-639]
unblocks: []
acceptance_criteria:
- 'Derive the current census from Plans/settings_inventory.json: each id is unique, every live row has its owner
  admission (including SSYS-052/SSYS-054), and every retired row has a dated Superseded by disposition and renders
  on no page, manager or search result. Historical 964/953 totals are lineage, not the current acceptance target.'
- The twelve added rows exist once each with their listed type, choices and default, scope global, and a valid
  category.subgroup.key id.
- general.visual.chat-layout-mode has no options and no default, and a stored Overlay or Detached value is ignored
  and cleared on first read with no pop-out and no notice; after a restart the chat is in its column.
- Keep the chat open in narrow windows is not shown, searched or written by Settings; the chat's header menu
  and the Home options menu set it through ui.chat_column.keep_open.
- No Settings row exists for a dashboard's range, scope, starting set or presets.
- Changing any added or amended row applies at once with no restart badge, and no Settings change opens, closes,
  moves or rearranges a panel or tab that is already open.
- 'No row writes the Home layout record: dragging the chat''s width, pinning History and popping the chat out
  change only the layout record, and Chat History List decides only how a workspace with no saved choice starts.'
- Restore home layout reads the same in Settings and the title bar's Home menu, asks one plain question, dispatches
  cmd.workspace_layout.reset and keeps every open tab.
- Max Open Editor Tabs counts only editor tabs and never closes a pinned tab, a tab with unsaved changes or
  a tab of another kind; Tabs Remembered Between Sessions counts tabs of every kind.
- A terminal session verified still running comes back in its tab whatever Remember Window Layout and Terminals
  When Reopening a Project say.
- No row exists for the chat width, revealing an open file, closing an empty panel, the + button's behaviour
  or the close button's side.
- Settings > Editor offers a scheme row defaulting to Follow look and bound to the same catalog as Settings
  > Terminal.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- 'hpt-plans-lead pm-mail 1010084328-3f4b (2026-10-10): code.editing.color-scheme, Editor Colors, Follow look;
  existing editing subgroup and neighbouring select-row shape.'
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-181
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D2, D3, D4, D5, D7, D10, D11, D19, D21)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (settings keys and named layouts; concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 12, the settings model; concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8
  (section 6.4)
- Plans/Decision_Log.md#DL-186
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D32, D35, D40)
- 'The planning thread''s rulings of 2026-10-10: Chat Layout retired with no options and the first-read clearing
  rule, the narrow-window pin on the chat''s header menu (pm-mail 1010211322-7b6c); the concept census of 891
  live ids plus 1 retired row (pm-mail 1010234358-ab8b)'
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "953"
  - "891"
  - "ui.chat_column.keep_open"
  - "code.editing.color-scheme"
  - "Editor Colors"
  - "Follow look"
  - "Restore home layout"
  - "Keep the chat open in narrow windows"
  - "(Superseded by ...)"
  - "964"
  - "955"
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
  - "Amended 2026-10-10 (DL-187, D32, SP-330): the sentences that named the popped-out state as layout state the record keeps now say the v2 record keeps no pop-out; a popped-out chat lasts only while the app runs and starts back in its column."
  - "Amended 2026-10-10 (DL-187, D32; the planning thread's rulings): Chat Layout keeps no options and its stored Overlay or Detached value is cleared on first read with no pop-out and no notice; Keep the Chat Open in Narrow Windows retires to the chat's own ui.chat_column.keep_open; the census becomes 11 retired and 953 live rows, and the concept census 891 live ids plus one retired row is distinguished from it."
  - "Amended 2026-10-10 (DL-186): Dashboard Widgets stays a route; boards are per project and a dashboard's range, scope, starting set and presets are not Settings rows."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Distinguishes the inventory-wide retired census from this wave retirement set."
  - "Amended 2026-10-10 (lead ruling L18): Recounts live and retired inventory rows and includes the search retirement."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Sets the already-listed editor line-height default to 1.55."
  - "Amended 2026-10-10 (D30, DL-183): Requires an Editor scheme row using the shared catalog and defaulting to Follow look."
  - "Amended 2026-10-10 (lead ruling L18): Adds code.terminal.search to the retired rows because find is always present (F3-641)."
  - "Amended 2026-10-10 (lead ruling L18): The 2026-10-09 retirement line below keeps its original seven ids; this L18 line records the search retirement."
  - "Amended 2026-10-10 (D30; R35): The prose Rows added table lists twelve rows with Editor Colors and Editor Line Spacing's 1.55 default."
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
  Settings > Terminal binds the terminal's one appearance model (Plans/FinalGUISpec.md#F3-642, Plans/DRY_Rules.md#DR-068;
  DL-183) with one row per field, each applying live with no restart badge: the restart badges on code.terminal.theme
  and code.terminal.font-family are removed. The model resolves field by field from the look defaults (Follow
  look), Everywhere, the offered Computer/Device rung, optional Project, then the tab override. SSYS-059 classifies
  each field; program/path fields stay Computer-only. Each row resolves through SSYS-002. Settings targets the
  selected offered level; F3-650 All terminals explicitly writes Everywhere through cmd.settings.transaction.preview
  and bound apply over the exact ID and revisions. All terminals writes the real Everywhere value, names following
  contexts and Project/tab own choices retained, and uses one outcome and Undo. q-035 is resolved in canon; the
  app-default edit writes Everywhere at its actual writer and follows SSYS-009 offline, permission and currentness
  admission. The tab's override is the tab's serialized state (SP-331), written by the Customize screen’s This
  terminal, never by Settings. Amended rows carry five fields: code.terminal.theme (Follow look or one of the
  shared catalog schemes or an imported one; Follow look), code.terminal.font-family (Follow look, JetBrains Mono,
  Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or System monospace; Follow look),
  code.terminal.font-size (Font default), code.terminal.copy-on-select (off) and code.terminal.sticky-header (on).
  Added rows carry the rest: code.terminal.scheme-pair (on), min-contrast (Off, 3:1, 4.5:1 or 7:1 for program
  output only; default 4.5:1), import-scheme (an action), font-weight (400), line-height (Font default), letter-spacing
  (0), ligatures (on), bold-bright (off), cursor-shape, cursor-blink (on), cursor-trail, background (Follow look,
  theme surface, solid, gradient or image) with background-color, background-gradient, background-image, background-image-file,
  background-dim (Auto) and background-blur (0, made once on the picture), opacity (Glass; Follow look, 70 % light
  and 74 % dark), padding (0, Jared 2026-10-14), effects (Follow look, Off or Custom) with scanlines, scan-strength
  (0.30), glow, glow-strength (0.45), crt (off), curvature (0.04, F3-643), burn-in (on), noise (0.035), flicker
  (off; on or off at one faint level, F3-643), inactive-dim, smooth-scroll, bell (Follow look or Off), sixtyfour-scan
  and sixtyfour-bleed; a field without a settled default falls through to the look. Detail rows show only while
  the row they depend on makes them apply, and no row turns on what F3-643 keeps off: effects run only in the
  focused terminal, and every moving part stops under Reduce Animations and on battery saver. The rows sit in
  SSYS-040's Terminal look group, the finer ones in Terminal look: more options, and F3-121's older group names
  map onto SSYS-040's groups as this addendum records. Also amended: code.terminal.shell (the default shell profile),
  code.terminal.allowed-profiles (shells, named profiles and SSH computers, as the "+" menu and New terminal list
  them), code.terminal.right-click-paste (off; a right click opens the terminal's menu), code.terminal.rendering-mode
  (render modes only, never colours, fonts or effects), code.terminal.shell-integration (a switch), code.terminal.search
  (retired: find is always present, F3-641; DL-181) and code.terminal.transcript-retention (Saved Terminal Output:
  Keep Saved Scrollback, the default, keeps the saved scrollback of Plans/storage-plan.md#SP-332 that restore
  brings back, or Session Only, which saves none). Degauss and a terminal's Text size zoom are not rows. The terminal
  scheme row binds the same code colour-scheme catalog as Settings > Editor (SSYS-050, F3-642). Its scheme choice
  defaults to "Follow look"; this is the per-look scheme previously labelled "Follow theme" (R35 a). Amended 2026-10-10
  (DL-187; D36 to D39; lead rulings F4 and F5): the answers add no terminal row. code.terminal.allowed-profiles
  governs the "+" menu's and New terminal's lists: every shell it allows inline, the SSH computers in their own
  SSH hosts submenu (D39). code.terminal.transcript-retention's Keep Saved Scrollback also leaves well-known secrets
  out of the saved copy and keeps saved scrollback within 512 MiB across every terminal, the oldest first, beside
  each terminal's 64 MiB; the scrub and the 512 MiB total are fixed (D36, D37, SP-332). A terminal's notification
  mute is that tab's own state (ui.terminal.mute_notifications, D38), and the limit of one notification every
  3 s per terminal is fixed (F3-641). No row sets a terminal tab's colour or icon (D34). F3-650 owns the full
  Customize screen and its menu/Settings entry scopes; All terminals and Settings are controls of the same value
  model; the former targets Everywhere and the latter its explicit offered target. Allowed Shell Profiles' untouched
  System Default sentinel offers installed shells and configured SSH computers; an explicit allow-list filters
  both New terminal and the plus menu. An imported scheme survives readback and reload through the existing import
  owner. Obsolete prototype Custom scheme/font controls and their saved-string repair remain compatibility/source
  lineage, not new native Settings choices. The drawn face ranges and text-rendering meanings are F3-644/F3-642's.
  No compatibility local copy becomes a shadow writer; genuine offered No project writes use SSYS-009. F3-654
  owns the interface floor independently of the program-output choice. F3-642/F3-643 own the landed extended fields;
  the inventory admits code.terminal.background-strength, background-scale, background-motion, background-fit,
  background-desaturate, bezel, bezel-width, bezel-material, bezel-reflection and phosphor-mask. Their bounds/defaults
  are those owners' and Plans/terminal_background_catalog.json supplies the gradient/image choices. Each applies
  live through the same targeted Settings transaction and separate tab writer as the existing appearance fields.
  F3-650's personal preset library is not a Settings row or another default layer. Amended 2026-10-16 (DL-213;
  Jared's P10 and P14; terminal rounds 4 and 5): code.terminal.flicker-amount retires by the inventory's Superseded
  by convention and renders nowhere. A stored amount above 0 with no Flicker stored beside it in the same layer
  (the Project's settings, a tab's override or a saved preset) is read once as Flicker on and written back as
  that layer's own Flicker; every stored amount, an Off beside it included, is then forgotten, and writing, clearing
  or resetting Flicker in a scope removes an amount stored there, so no reset or default brings it back. code.terminal.bell
  offers Follow look and Off; a stored Visual reads as Follow look and is stored again as Follow look wherever
  it is read (load, reset, import, a project switch, a write, a tab's override or a saved preset). Both rules
  run on a saved preset entry before it is validated against Plans/terminal_appearance_presets.schema.json, and
  the entry is written back without the retired value, so a preset saved before round 5 migrates rather than being
  quarantined (SP-331). Neither rule adds a notice. background-desaturate defaults to 0.5. bezel-reflection stores
  Auto (the material's own level) or a number from 0 to 1 that reads as the nearest of F3-643's four levels, a
  level being written as 0, 0.25, 0.5 or 1: this is the one stored scale, and the terminal draws the level it
  reads at its own per-screen strength (F3-643). Line height and letter spacing keep the exact stop the Customize
  screen offered, to four decimals, so All terminals reads back what it drew. The ten round-3 rows are live, shown
  under the visibility amendment of this addendum. Amended 2026-10-17 (DL-228): each numeric terminal row keeps
  this range, which Settings offers and a stored value is clamped to: font size 8-32 px, weight 100-800, line
  height 1-2, letter spacing -1 to 3 px, background dim 0-0.9, blur 0-24 px, strength 0-1, desaturation 0-1, opacity
  0.4-1, padding 0-24 px, bezel width 2-48 px, scan strength 0-0.6, glow strength 0-1, curvature 0-0.2, noise
  0-0.12, Sixtyfour scan -53 to 100 and Sixtyfour bleed 0-100; the Customize screen's stops (F3-650) sit inside
  them. code.terminal.font-rendering has only the reviewed offered levels of its appearance row, so This terminal,
  All terminals, presets and reset sets treat it as one field.
gui_related: true
gui_classification_reason: Each row is a visible Settings > Terminal control whose change shows at once in every terminal.
split_recommended: false
depends_on: [DL-181, DL-182, DL-183, DL-187, DR-068, SSYS-002, SSYS-009, SSYS-028, SSYS-040, SSYS-050]
unblocks: [F3-120, F3-121, F3-642, SP-331]
acceptance_criteria:
- Every field of F3-642 has exactly one inventory row, each with the default listed here, the reviewed offered
  levels, and no terminal row carries a restart badge.
- Changing a row changes every open terminal at once unless that terminal's own override sets the field, and a
  field left at Follow look, Font default or no default falls through to the look's default.
- Settings and the enabled Customize screen's All terminals write the explicitly selected level and Everywhere
  respectively through the same Settings transaction over its exact id; only the Customize screen’s This terminal
  writes a tab override, and Settings never does.
- All terminals writes Everywhere, clearly lists contexts that retain own values, and succeeds with no Project
  when the actual shared writer is reachable.
- Terminal Colors offers Follow look and the shared catalog of F3-642 plus imported ones; Terminal Font offers
  Follow look, the six built-in faces and System monospace; Minimum Text Contrast offers Off, 3:1, 4.5:1 and 7:1
  for program output only; interface text consumes F3-654.
- Each detail row shows only while the row it depends on applies, keeps its stored value while hidden, and Terminal
  Opacity (Glass) shows only under a Glass theme.
- With any row set, effects stay in the focused terminal and every moving part stops under Reduce Animations and
  on battery saver.
- 'Settings shows the terminal rows under SSYS-040''s groups and Terminal look: more options, with no row for
  degauss or the Text size zoom.'
- 'code.terminal.search is retired by SSYS-050: find is always present (F3-641), the row renders nowhere and nothing
  reads its stored value.'
- Saved Terminal Output offers Keep Saved Scrollback (the default) and Session Only; with the default a restored
  or reopened terminal shows its saved scrollback by SP-332's rule, and no choice keeps it longer than SP-332
  allows.
- Settings > Terminal and Settings > Editor bind the same catalog, with each scheme choice defaulting to Follow
  look.
- No Settings row exists for the saved-scrollback secret scrub, the 512 MiB total, a terminal's notification mute,
  the notification rate or a terminal tab's colour or icon; Saved Terminal Output's description names the scrub
  and the 512 MiB total, and Allowed Shell Profiles' names the SSH hosts submenu.
- Flicker Amount renders nowhere and no control writes it; a stored amount with no Flicker beside it turns Flicker
  on once and is forgotten, an amount beside a stored Off leaves Flicker off, and after any reset of Flicker no
  stored amount turns it on again.
- Terminal Bell offers exactly Follow look and Off, and a stored Visual shows, saves and reloads as Follow look.
- Picture Desaturation defaults to 0.5; Bezel Reflection reads Auto as the material's own level and any stored
  number as the nearest level; the ten round-3 rows show only under their visibility conditions and keep their
  stored values while hidden.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - jq and schema census over Plans/settings_inventory.json
  - python3 scripts/pm7-canon-check.py
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/storage-plan.md#SP-332 (terminal records consume these rows; cited, not a dependency (lead ruling L22,
  2026-10-10))
- Plans/Decision_Log.md#DL-183
- Plans/Decision_Log.md#DL-181
- Plans/Decision_Log.md#DL-182
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D13, D15, D16, D17)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256 1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299
  (D17a)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 2, 4, 5 and 6 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3
  (Appendix E)
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D34, D36 to D39)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md, SHA-256
  4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round2--CANON-PROPOSALS.md,
  SHA-256 809ba3f1959a9349500fd6f3682650d348d38f0f1776f727f461202c60d36080 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--CANON-PROPOSALS.md,
  SHA-256 4a4b91f257467e76ec6d43e37a04a81cf5f9dee515242177f0d08db04483700d (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--CANON-PROPOSALS.md,
  SHA-256 9d55ddc569405b468fcad2c51aed61540563eea3d89d9402a891e071a0547d93 (P10 and P14 decided by Jared 2026-10-16;
  source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--NOTES.md, SHA-256
  77c878854cf0c02b0612ce422a5f68797b3646f6d2aee2b316059d35be342541 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--onboarding--opus-5.5--src--settings--kit.d--24-terminal-look.js,
  SHA-256 631c558d955673e16b78aeb369f51d735d28514f21ba3a02e4b04dc3f66801e2 (round-5 head f1042f7d3e; the Settings
  read rules for Visual and a stored amount; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--77-customize.js,
  SHA-256 4e19ed616d68af253f105bbdf9a6986a42fa54a7bc08155d20d7efe0434604fc (round-5 head f1042f7d3e; where Customize
  offers each control; source lineage; not native certification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "512 MiB"
  - "Follow look"
  - "All terminals"
  - "This terminal"
  - "4.5:1"
  - "Terminal look: more options"
  - "Sixtyfour Raster"
negative_constraints:
- Do not keep a second terminal theme, font or effect store beside the one appearance model.
- Do not show a restart badge on any terminal row.
- Do not write a terminal tab's override from Settings or keep a second app-global appearance store.
- Do not bypass the Settings transaction for the All terminals Everywhere edit or manufacture a Project context.
- Do not let a row turn on motion that Reduce Animations, battery saver or the no-GPU path keeps off.
- Do not offer a face that is not built in under the licence rule of F3-644, other than System monospace, which
  uses the computer's own monospace face.
owner_hints:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187; D34, D36 to D39; lead rulings F4 and F5): no terminal row is added; Allowed Shell Profiles names the SSH hosts submenu, Saved Terminal Output names the fixed secret scrub and 512 MiB total, and the notification mute is tab state."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look consistently in the appearance-model prose and field tables."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance defaults."
  - "Amended 2026-10-10 (D30, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
  - "Amended 2026-10-10 (lead ruling L18): The search switch is retired; find stays always present and the retired row renders nowhere."
  - "Amended 2026-10-10 (lead ruling L16): All terminals is enabled and writes the project default through the Settings transaction, with the hover tag in this project and no app-wide write."
  - "Amended 2026-10-10 (lead ruling L16): Restores the q-035 rule for the app default layer: until q-035 admits an app-wide store, a field's app default is the bundled inventory default and only the Settings > Terminal app-default edit stays disabled, its editable requirement kept."
  - "Amended 2026-10-10 (R35 a): Terminal Font's default reads Follow look; the scheme note says the per-look scheme was previously labelled Follow theme."
  - "Superseded 2026-10-09 (DL-183): the restart badges on code.terminal.theme and code.terminal.font-family, the six-entry colour list, and Fira Code, SF Mono and Custom as terminal fonts."
  - "Superseded 2026-10-09 (DL-182): code.terminal.transcript-retention's Session Only default and its 24 Hours, 7 Days, 30 Days and Forever choices, which SP-332's saved scrollback rule replaces."
  - "Amended 2026-10-16 (DL-213): Flicker Amount retires (a stored amount reads once as Flicker on where no Flicker is stored beside it), Bell's Visual retires into Follow look, Picture Desaturation defaults to 0.5 (it read 0.3), Bezel Reflection is four levels from the material's own, and the round-5 visibility and publication holds close."
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/DRY_Rules.md#DR-068, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/Settings_System.md#SSYS-028, ContractName:Plans/UI_Command_Catalog.md#UCC-201

### SSYS-052 - Editor Look Rows And Shared Customize Entry

```yaml
plan_unit_id: SSYS-052
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Editor & Terminal has Editor look and Editor look: more options, with Open Customize on the owner line, beside
  the existing Terminal look groups. Everyday rows include scheme, font/size/spacing, ligatures, caret shape,
  line numbers, minimap, sticky scroll, word wrap, indent guides, bracket colors and color by meaning; finer choices
  go in the one More options area. Editing retains Diff Layout, Problem Highlighting, Jump Highlight Duration
  and indentation. Preview Tabs and Tab Sizing belong in Saving & tabs, not App & Input. The inventory admits
  31 code.editing rows: scheme-pair, bracket-pair-colors, min-contrast, italic-comments, bold-keywords, font-weight,
  letter-spacing, ligatures, cursor-shape, cursor-width, cursor-blink, cursor-motion, cursor-trail, relative-line-numbers,
  line-highlight, indent-guides, indent-guides-active, render-whitespace, rulers, wrap-column, sticky-scroll-lines,
  smooth-scroll, reveal-lines, scroll-past-end, dim-unfocused, scanlines, text-glow, tab-size, insert-spaces,
  detect-indentation and token-colors. Plans/settings_inventory.json owns their labels, choices and defaults;
  F3-651 owns their drawing and editing behavior. All editors and Settings write these exact rows at their offered
  levels through SSYS-009, applying live without restart; This editor is a tab override and never writes a Settings
  row. SSYS-002/059 own the real Everywhere store and offered levels. Open Customize is navigation to the existing
  owner screen, not a stored setting. Token Colors is the scheme/kind map with an empty default; Settings uses
  its name/value editor and shows None: every scheme's own or the entry count. Editor Colors binds the shared
  catalog ids with names as labels and reads earlier saved names compatibly. Row bounds include caret width 1–4,
  sticky lines 1–5, face-dependent weights from F3-644, tab size 2/4/8 and min-contrast 4.5:1 or 7:1. SSYS-050's
  tab caps retain editor-only versus every-kind meanings at both open and restore; pinned/unsaved protections
  are unchanged. Retired rows remain absent everywhere. Toolchain configuration uses SSYS-002/059 for ordinary
  defaults and Formatters_System FS-010 for exact Computer installation/Host/Environment and Project file configuration;
  the packet's fixture-only formatter projection repair adds no inventory id, local store or command. The 31 admitted
  editor rows are now integrated into the published Settings/editor consumer at 1baf19c6d7; the former concept
  pending-row exclusion is closed. This changes no row identity or native acceptance obligation; only reviewed
  level applicability changes. Amended 2026-10-17 (DL-228): further row bounds: Editor Text Size 10-24 px in half-pixel
  steps, Editor Line Spacing 1.2-2 in 0.05 steps, Editor Letter Spacing -0.5 to 2 px in 0.25 steps (negative allowed),
  Jump Highlight Duration 500-10,000 ms in 500 ms steps and Hover Tip Delay 0-5,000 ms in 50 ms steps; a stored
  value outside its bounds is drawn at the nearer bound and a non-number falls through to the next layer. F3-644's
  100-800 weight range stands over the concept's narrower weight floor.
gui_related: true
gui_classification_reason: Editor look rows and shared Customize entry.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All 31 new ids have an inventory row, an exact Settings transaction route, search terms and a bound control.
- Menu and Settings entry agree on resolved values and their explicit level/key targets while preserving tab overrides,
  including token-by-token fallthrough.
- Saving & tabs owns both tab rows and no retired editor/terminal row is drawn.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: editor_look_rows_and_shared_customize_entry
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-002
- Plans/Settings_System.md#SSYS-009
- Plans/Settings_System.md#SSYS-050
- Plans/FinalGUISpec.md#F3-650
- Plans/FinalGUISpec.md#F3-651
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-editor-customizer--LANDING.md, SHA-256
  4d2abf07b2ca9d3eae6e1d9b18143c23263dd8e4deef0ab5f940a18382d8f71b (source lineage; not native certification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
- code.editing.token-colors
- Saving & tabs
negative_constraints: []
owner_hints:
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-050, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/FinalGUISpec.md#F3-651

### SSYS-053 - Settings Preserves The Reader And Opens Chapters At The Top

```yaml
plan_unit_id: SSYS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  An update that is not navigation never moves what the reader is looking at or replays an entrance.
  Settings has one placement/active-section authority. Room below the chapter’s real last section
  lets that section scroll to the top and never shrinks under the reader. The reading line is 96 px
  below the scroller top; the anchor is the first setting row or heading whose bottom crosses it, or
  the row of the control just used. Across every painted frame the anchor's top stays within 1 px
  relative to the scroller, including look/font/density changes. At scroll zero stay at zero. When
  rows above the operated control shrink there, temporary blank space above the chapter title holds
  that control in place. The reserve is consumed as rows grow back and disappears once scrolled out
  of view; it is not inserted elsewhere. If the anchor disappears choose the nearest surviving row
  above; if the document becomes too short settle at the new bottom without bounce. Navigation
  already in progress takes priority. Returning to Settings from Home, Usage or another app page
  restores chapter, page, anchor, open settled Details, rail highlight and page-tab selection
  without a Settings entrance. Choosing a chapter, even a repeat visit, opens the top of its first
  page in its first painted frame; no old rows or offset flash. Choosing the current chapter scrolls
  to its top with the existing page-jump motion and no re-entry, doing nothing if already there. A
  new chapter plays its existing arrival once, with below-fold reveals later, while its rail retains
  scroll/focus and its initial tab marker is placed, not slid from the old chapter. In-place updates
  keep existing rows, controls, Details and hover settled; only the changed control's own feedback
  and appearing/disappearing dependent rows animate. Dependent rows use height/opacity disclosure,
  with same-frame compensation above the anchor; no row flash, repeated reveal, manager/tab arrival,
  title decode or Glass re-bake flash occurs on retained content. Details updates its current value
  in place. The settled reading section is saved; at bottom it is the last section. Explicit
  navigation saves the target setting's section with the navigation, and a chapter change saves its
  first section. A retained update never substitutes an unsettled intermediate section. Settings
  occupies its final full width from its first frame, and look-dependent rows including Wallpaper
  reserve their final geometry then; later loading must not push content down. Effective Reduced
  Motion is the app request OR system preference: placement/saving are identical, disclosures,
  reveals, ink and scroll become immediate. This behavior holds across all ten looks, not only on
  one machine. Appearance controls consume SSYS-010 and control focus consumes F3-438. This unit
  changes no owner validation, permissions or draft/commit boundary. SSYS-006 owns the shared value
  formatter used by the settled row and Details; this reader-preservation unit does not define a
  second formatter. A page jump followed immediately by an in-place update retains the settled
  target section and reading line under the same placement authority.
  Amended 2026-10-16 (DL-217, the Settings lane): the chosen chapter is acknowledged at once, before the
  new chapter renders; rapid chapter changes coalesce to the newest choice; and the state change of a
  navigation stays synchronous for its callers, only its visual move being deferred.
gui_related: true
gui_classification_reason: Settings preserves the reader and opens chapters at the top.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- At top, mid-page and bottom, value/host/look updates preserve the anchor within 1 px on every frame,
  focus, Details and saved section.
- General → Code → General opens chapter tops; leaving Settings and returning restores its exact place.
- First visible Settings frame has its final width and row space, with no later wallpaper insertion shift.
- Repeat the placement cases in all ten looks and app/system Reduced Motion, including a disappearing
  anchor and document shrink.
- At the top of General, changing Spacing to Compact holds the operated row with the approved title reserve;
  growing the rows consumes that reserve, and scrolling it out of view removes it without inserting space
  elsewhere.
- Row, Details, default, search and toast consume SSYS-006’s formatter; a jump followed by an update never
  saves an intermediate section.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: settings_preserves_the_reader_and_opens_chapters_at_the_top
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md, SHA-256 df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-009
- Plans/Settings_System.md#SSYS-010
- Plans/FinalGUISpec.md#F3-653
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/M4-TOP-RESERVE-DECISION.md, SHA-256 851b64ffa9c2664540864c28b46b351f7ac75d6d6cea75e9290d21d84a5a77b7
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/ASSIGNMENT-SETTINGS.md, SHA-256 fe8b2ad2d1014520753b65e6ef6e717d140ad7577a0238099714cd3b887e134a
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-contrast-round--NOTES.md,
  SHA-256 0b6b3c5aa2833176f83f1601a83fb3d1b3e7b8e3511cbd76bed9e8cb8fd85354 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-m4-settings-anchor--LANDING.md,
  SHA-256 e428692dadbcf877a352a4f9852cb681c00f7ab8bf19833b1c32f181ddbb747a (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--pm7-motion-settings--NOTES.md,
  SHA-256 969a47e289d72c048f7f44b94488b1953a2edeba0fa28c41b72bdc5d4ca5e094 (Settings lane notes, B1, B3
  and B5; source lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/FinalGUISpec.md#F3-653

### SSYS-054 - Wallpaper Setting And Replacement Of Old Glass Backgrounds

```yaml
plan_unit_id: SSYS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  general.visual.wallpaper is a layered Settings select value under SSYS-059 rendered by F3-653's gallery: look
  is the default, otherwise a stable shared catalog id. It appears after general.visual.theme-mode in Theme &
  colors for every look, an explicit exception to SSYS-010's family-gated rows. Search includes Wallpaper, background
  and backdrop. Its choice applies live and before the exact context's first paint, with no restart or shadow
  store. The gallery uses SSYS-009's preview/apply transaction over this exact id, as do any other owner-approved
  entry points; an unknown requested id is refused without a write, while a stale stored id is drawn using Look's
  own and disclosed. general.visual.glass-background-mode is retired after the coordinated 2026-10-15 publication,
  drawn nowhere; SP-333 preserves actual owner-committed choices and excludes discovered concept preferences from product migration. The old Mesh/Depth/Minimal choices do not become catalog
  aliases. Glass transparency stays a separate family-gated value. The wallpaper catalog is DR-073's one registry;
  its options are not copied into a page-local list. The combined concept publication is recorded in DL-203; native
  acceptance remains separate. Jared’s 2026-10-14 follow-up settles the replacement family’s selection contract:
  the most recent accepted change wins. The wallpaper owner is the sole coordinator of general.visual.wallpaper
  mutations through SSYS-009. A gallery pick supplies that id. A NieR background control supplies only general.visual.nier-background;
  the same admitted level-bound transaction also sets general.visual.wallpaper to look, making the newly chosen
  scene visible. The coordinator builds this exact two-setting patch before preview, so the preview hash binds
  both effects; apply cannot race a later gallery pick or leave half of the update committed. Both controls read
  the shared committed state. This adds no timestamp, second wallpaper value, independent writer or command. Amended
  2026-10-17 (DL-230, Jared): in the gallery the arrows choose as they move; every arrow step is a gallery pick
  that supplies the reached id through the same SSYS-009 transaction, Space or Enter choose too, and only the
  print's preparation waits for the short pause after the last step (F3-653). The six scene ids and names are
  approved in F3-653; their packaged editions are in the catalog. Withdrawn stored print ids use the existing
  disclosed stale-id fallback and are never silently mapped to a different scene. An uncommitted NieR preview
  changes neither committed setting and does not win precedence. The published concept corroborates this direction
  without admitting its local-storage keys as native writers. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:
gui_related: true
gui_classification_reason: Wallpaper setting and replacement of old Glass backgrounds.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The gallery and search resolve the exact inventory id and Settings transaction in every look.
- Invalid requested ids refuse without mutation; stale saved ids have the documented fallback.
- An arrow step in the gallery writes general.visual.wallpaper through the same transaction as a pointer pick,
  and the latest step wins (DL-230).
- Publication retires the old background row and preserves each Project's own committed choice and resolves fallthrough
  for unset values.
- Gallery pick then NieR background change shows the NieR choice; NieR background change then gallery pick shows
  the gallery choice. Project reload preserves the latest accepted result and a refused/stale change commits neither
  half.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: wallpaper_setting_and_replacement_of_old_glass_backgrounds
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-010
- Plans/FinalGUISpec.md#F3-653
- Plans/DRY_Rules.md#DR-073
- Plans/storage-plan.md#SP-333
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-DECISION-20261014.md, SHA-256
  56a7389f1fa9e6f6e0535f09525945f590b6ef44dfd8f72d1f3c844a7e21b816 (decision/source lineage; not native implementation
  evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-CONTRACT-201d602f7d.md, SHA-256
  6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (decision/source lineage; publication remains
  held where specified)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md, SHA-256
  4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (source lineage; not native certification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
- general.visual.wallpaper
negative_constraints: []
owner_hints:
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/storage-plan.md#SP-333


### SSYS-055 - Chat Preferences In The Hosted Surface

```yaml
plan_unit_id: SSYS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  The hosted 5.6 Pro chat uses the existing Settings inventory and transaction (DL-232, SSYS-028, SSYS-040, SSYS-042,
  SSYS-050). general.interaction.working-activity-style offers only Orbit and Step Rail Simple as the product
  preference, default Orbit. general.interaction.sound-effects is the one master switch, on by default (DL-107);
  the chat speaker and Notifications & Sounds write that same value, and setup, Guided Tour and NieR sounds keep
  following it. This port adds no chat-only mute or volume row. general.interaction.eli5-default resolves Default,
  Everywhere, Computer, optional Project, then This chat; general.interaction.chat-eli5 remains a run-scoped chat
  override, and inherit deletes it. ELI5 changes affect only future replies; the current stream and earlier replies
  are unchanged. In the product, All chats and Project default in the chat sheet use Settings transactions targeting
  Everywhere and that exact Project respectively; the chat's own Standard, Simple and Follow controls use cmd.chat.eli5.set
  (UCC-175). New chat defaults uses the same application ELI5 value, not another row. ai.models.thread-title-model
  is the naming policy, with Default, None or an available model id from its live catalog; the sheet and Settings
  use the same value, preserving manual-name locks and first-message-only naming. general.interaction.assistant-mode
  changes only how future chats start, never the mode of an existing chat. The sending rows general.interaction.submit-key,
  queue-behavior, queue-size and composer-persist-unsent remain their existing owners; a bridge binds only behavior
  its renderer supports and never claims an unimplemented preference works. general.interaction.chat-history-list
  remains an admitted row and is shown as History in new workspaces, with Flyout or Pinned and default Flyout.
  It seeds History only when a workspace has no saved choice; editing it never pins or unpins the current History,
  resizes the column or writes the Home layout record. The current History pin uses ui.chat_column.pin_history;
  Keep the chat open in narrow windows uses ui.chat_column.keep_open, and chat width uses cmd.workspace_layout.resize_surface.
  None is a Settings row. Jared G1 B (2026-10-30): Activity Detail starts unpinned; its view-local Pin keeps it
  open across thread switches with the new thread’s data, while unpinned detail closes on a switch (ACD-453/506).
  No Activity pin Settings default is added. The host's look, fonts, Reduced Motion and NieR settings reach the
  chat directly. A last-used chat model, effort or capability selection never becomes a global Settings default
  merely because the standalone concept saved it. Amended 2026-10-23 (DL-233): the scripted stand-in chat is removed;
  it was never a hosted conversation choice or an inventory row. Native Settings scope, validation, preview/apply,
  read-only refusal and storage requirements remain in force; the HTML bridge is a concept projection only. Added
  by the lead's ruling of 2026-10-22 under Jared's port brief (DL-232), ratified by Jared on 2026-10-23 (DL-234):
  general.interaction.thought-stream is global and display-only, Auto (While it thinks) or Expanded (Always open),
  default Auto; Settings, New chat defaults and the composer capability menu's Thought Stream choice edit the
  same row through the Settings transaction. It controls disclosure of reasoning supplied by the model and never
  changes a reply or invents reasoning. Added the same day by Jared's answer (DL-234: "Default 8, adjustable in
  settings."): general.interaction.thought-stream-lines is global and display-only, shown as Lines shown while
  thinking right under Show thinking, with the choices 4, 6, 8, 12 and 16 lines and the default 8. It sets how
  many of the latest lines Auto keeps in view while the model thinks and has no effect under Always open. Settings,
  New chat defaults' second Thought Stream dropdown and the lines list in the composer's Thought Stream menu edit
  the same row through the Settings transaction, and Settings refuses any other value; as with Thought Stream,
  its global scope is the product contract, not proof that the project-only adapter supplies global storage. The
  current-chat ELI5 control is shown only in the chat sheet, not on the Settings page or its search; its general.interaction.chat-eli5
  inventory identity, run scope and override contract remain. The concept's existing project-only Settings adapter
  cannot prove separate application and project persistence: the renderer keeps these layers separate and discloses
  any session-only layer instead of creating a shadow store or claiming native scope support. At integrated concept
  59ca2d4382, Settings persists the host project's ELI5 default, unscoped chats bind to that project, and switching
  threads re-projects the appropriate project without copying an unrelated override. All chats ELI5 is a separate
  session-only value; application-scope persistence remains unimplemented in this concept. The Thought Stream
  row, New chat defaults and composer choice share the stored preference, and replies show the live thinking block
  it drives (ACD-221, DL-234). Its global inventory scope is the product contract admitted by the lead, not proof
  that this project-only adapter supplies global storage. History's initial-layout seed is built and preserves
  a saved false or true. The Settings master sound, working style, naming policy and future-chat mode bindings
  remain as reviewed; no additional layout, Activity pin, stand-in or family-take setting is admitted by final
  reconciliation. Amended 2026-10-29 (S1–S9, G1; PM7): Admit SSYS-056’s pip-parts only for chat/onboarding extras
  with no second sound or brand setting. Jared G1 B (2026-10-30) restores session view-local Pin/unpin without
  a small view or Settings/layout write: pinned detail follows thread switches and unpinned detail closes on a
  switch (ACD-506); History pin remains unchanged. Amended DL-260, Jared 2026-10-31: only real product behavior
  remains an implementation requirement. The described session-only/project-bound HTML adapter and automatic binding
  of unscoped chats are historical concept limitations, superseded for product behavior by SSYS-002/059 and the
  app chat owner. No project stays genuinely null, uses real Everywhere/Computer and This chat values, and never
  adopts a visible Project to satisfy storage.
gui_related: true
gui_classification_reason: Places and binds visible hosted chat preferences while keeping layout and chat-scoped controls separate.
split_recommended: false
depends_on: [DL-232, SSYS-028, SSYS-040, SSYS-042, SSYS-050, DL-234]
unblocks: []
acceptance_criteria:
  - "Working style, sound, naming, Thought Stream and Lines shown while thinking share their value between Settings and chat; ELI5 keeps its application/project/current-chat resolver, with the concept persistence limitation disclosed."
  - "History in new workspaces is visible and seeds only an unsaved workspace, preserving a stored false as well as a stored true."
  - "Width, current History pin, Keep open and Activity pin have no Settings rows."
  - "Every claimed bridge has a verified forward and reverse path or is disclosed as pending implementation."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Settings_System.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-185
- /mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D3, D4, D7, D8, D9, D26, D27, D28)
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b
  (concept integration lineage, not native API authority)
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/lead-checkpoint-20261022-2155.md,
  SHA-256 9063fdc033b2aac0d2558eba612d2f0ab33b032f0a0df72c848c21112ee72e98 (lead checkpoint; concept integration
  and rulings, not native proof)
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md,
  SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated
  against concept source; not native or final visual verification)
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
- 'source_ref:projects-pass2-20261103:S1–S7; hosted app scope wording; Jared: "I approve the outstanding questions
  with their recommended settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
  - "general.interaction.thought-stream"
  - "general.interaction.thought-stream-lines"
  - "general.interaction.working-activity-style"
  - "general.interaction.sound-effects"
  - "general.interaction.eli5-default"
  - "general.interaction.chat-eli5"
  - "general.interaction.chat-history-list"
  - "ai.models.thread-title-model"
negative_constraints:
  - "Do not copy the current chat mode, model, effort or capability values into global defaults."
  - "Do not make a Settings edit pin History in a workspace already open."
compatibility_only_notes:
  - "Hosted concept limitation, 2026-10-22 (lead ruling): its existing Settings adapter persists project values only. All chats ELI5 remains a separate session-only value; the application/project/current-chat product resolution and persistence requirements are unchanged."
  - "Hosted concept limitation, 2026-10-22 (lead ruling), amended 2026-10-23 (DL-234): the Thought Stream row, New chat defaults and composer choice share the stored preference, and the chat's live thinking block follows it in both directions; the Lines shown while thinking row, New chat defaults' lines dropdown and the composer's lines list do the same for the live window's height. The concept streams reasoning recorded with its demo turns; native capture of provider reasoning remains an implementation obligation, not a passed bridge check."
stale_retired_dispositions: []
owner_hints:
  - "Plans/Settings_System.md"
```

ContractRef: ContractName:Plans/settings_inventory.json, ContractName:Plans/assistant-chat-design.md#ACD-504, ContractName:Plans/UI_Command_Catalog.md#UCC-208


### SSYS-056 - Pip Parts And One Editor

```yaml
plan_unit_id: SSYS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  S1–S9, O4/O5, DL-239. Admit general.visual.pip-parts, one simple multiselect in App & Input > Theme & colors
  after NieR. Stored only at reviewed SSYS-059 offered levels like the retained NieR adjustments; the one resolver
  reads actual context and no browser shadow copy exists. The one shared registry defines parts/defaults/presets
  and On N / total meter: Full (all except App voice), Quiet (work placements without reactions), Still (no motion),
  Plain (minimal extras, never legacy puppets). No Classic or Pip master row. Mandatory brand, app icon, tray,
  universal loader and notification faces are outside the part list; every individual agent/helper/Activity row
  remains the single Pip primitive. Parts cover optional chat placements, faces/reactions, motion, look and setup
  life/sound only. Two voice parts are Pip talks in setup (on) and Pip chirps in the app (off); Setup music is
  on. All obey master sound and the chat mute; Reduced Motion preserves stored choices but stills nonessential
  motion and never mutes. Animation speed scales allowed motion. NieR parts win overlapping Diamond loader, Ink
  empty states and Pod companion/voice. Before first claim use factory parts; otherwise first paint and reruns
  read the resolved exact context, including No project. Preview writes nothing and an admitted bound apply can
  persist at an offered level. Settings copy proposes the row like other ordinary values, not NieR’s special transfer
  exclusion. The Settings row, wand Pip… and title-bar Customize Pip… following the NieR Adjust entry open one
  editor (DL-257/Q22), never inside onboarding. ui.settings.pip_editor.open, ui.settings.pip_editor.close and
  ui.settings.pip_editor.replay are typed local actions that write nothing; replay is Play: the team works. Parts
  and preset edits use cmd.settings.transaction.preview then apply with the same value in all hosts, never a duplicate
  preference. Editor focus is contained and returns to opener; preview/exit timers/copies are released on close.
  The admitted stable part IDs/count are enumerated below; Plans/pip_parts.json mirrors this contract and every
  GUI host reads the shared registry. S1–S5 editor presentation: five groups titled Where Pip appears, Faces,
  Motion, Look and Sound. Every part shows the one registry’s label, one-line help, displayed Size and On/Off
  state; On N / total is derived from the admitted 25-part list below, mirrored in Plans/pip_parts.json. A live
  small-team preview shows the exact context’s resolved parts/look; Play: the team works runs that same team from
  queued to working to done, obeying Reduced Motion and sound parts. Preview/replay writes nothing; preset/part
  picks still use the transaction pair. Help/size are presentation metadata from the shared Pip registry, not
  new settings or real resource quotas. S1–S9 admitted registry: Plans/pip_parts.json is the machine mirror of
  this accepted list. Where Pip appears: sheet-hosts, status-faces, working-orbit, plans, wand-menu, empty-lists;
  Faces: state-faces, watches, wonders-while-typing, cheers, oops, gaze; Motion: blinks, sway-and-physics, face-transitions,
  thinking-dots, idle-life; Look: seat-colours, role-props, strings, cheeks-and-shine, setup-world-life; Sound:
  setup-voice, app-voice, setup-music. All parts default on except app-voice; the default meter is On 24 / 25.
  Full = [sheet-hosts, status-faces, working-orbit, plans, wand-menu, empty-lists, state-faces, watches, wonders-while-typing,
  cheers, oops, gaze, blinks, sway-and-physics, face-transitions, thinking-dots, idle-life, seat-colours, role-props,
  strings, cheeks-and-shine, setup-world-life, setup-voice, setup-music]. Quiet = [status-faces, working-orbit,
  plans, empty-lists, state-faces, seat-colours, role-props, strings]. Still = [sheet-hosts, status-faces, working-orbit,
  plans, wand-menu, empty-lists, state-faces, watches, wonders-while-typing, cheers, oops, gaze, seat-colours,
  role-props, strings, cheeks-and-shine, setup-voice, setup-music]. Plain = []. Presets are exact values of the
  one multiselect; the meter always reads On N / 25. No Classic, brand/tray/icon/loader/notification part or second
  primitive exists. S2/S3 (lead ruling 2026-10-30): general.visual.pip-parts stores the shared registry’s part
  LABELS, such as Sheet hosts, in options/default and every new Settings transaction, like general.visual.nier-parts.
  The 25 stable IDs and ID-based presets in Plans/pip_parts.json remain registry/API identity; serialize each
  selected ID through that same one-to-one id/label table before preview/apply. Compatibility reads may accept
  prior ID arrays through the table, but new writes use labels. PipPartsSettingValue in Plans/pm7_build_contracts.schema.json
  pins this label-valued multiselect; no second option table or store is introduced. S2/S5/S9, DL-260: Settings,
  chat, title and wand controls open the same editor through ui.settings.pip_editor.open and share its close/replay
  local actions. The one registry owns defaults and the Full/Quiet/Still/Plain presets, mapped one-to-one to stable
  part IDs in registry order; new Settings writes use the 25 shared labels. No concept notification or alternate
  editor/store is a product contract. S1/S2/S6, PM7 companion review fix1, 2026-10-30 (Astra A5): all four preset
  arrays must equal the single Plans/pip_parts.json registry through its one-to-one preset-name map, in registry
  order (DL-260). Plain is exactly empty. Quiet, Still and Full cannot silently replace one another; negative
  preset-drift fixtures enforce the single-table boundary without changing stored LABELS.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-239
- SSYS-002
- SSYS-009
- DR-043
unblocks: []
acceptance_criteria:
- The accepted list/registry contains exactly 25 part IDs in five named groups; Full is 24 on with app-voice off
  and all four presets match exactly.
- 'S2: Settings options/default and new writes contain the exact registry labels; the one-to-one map preserves
  all 25 IDs/internal presets, and compatibility ID reads never become ID writes.'
- Every part has one registry label/help/displayed Size; meter is On N / 25 and the live small-team replay runs
  queued→working→done.
- Settings/wand/titlebar open one editor; local open/close/replay write nothing and restore focus/teardown.
- All part/preset edits use one targeted-level Settings preview/apply transaction, with no onboarding editor or
  browser/global shadow store.
- Reduced Motion preserves choices but calms motion, master/chat mute gate sound and overlapping NieR parts win;
  mandatory brand/loader/agent consumers remain.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
- 'DL-260 implementation lineage only: PM_PIP_PARTS, PM_PIP_PARTS_STORE, PM_PIP_EDITOR open/popup/close/replay,
  kit.d/29-pip-editor.js, o55-pip-editor, pip-settings-open, data-pip-local, def, default_enabled, PM_PIP_PARTS.PRESETS
  and pm7.pip-parts.changed describe source adapters, not native APIs or a persisted event.'
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens:
- general.visual.pip-parts
- ui.settings.pip_editor.open
- ui.settings.pip_editor.close
- ui.settings.pip_editor.replay
- Full
- Quiet
- Still
- Plain
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-239, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/DRY_Rules.md#DR-043




### SSYS-057 - Status Bar Numbers Or Words

```yaml
plan_unit_id: SSYS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  D5, DL-244. Admit general.interaction.status-bar-words beside general.interaction.activity-bar-labels in Window
  & panels, simple boolean false by default. False shows glyph/number pairs with complete words in the shared
  hover tag and accessibility; true shows agents/questions and processes/needs-input words. Zero remains No agents/No
  processes and stale is explicit. This screen-presentation row uses Everywhere/Device under SSYS-002/059, including
  No project; the saved requested boolean remains distinct from fitted effective display. Every host edits it
  through Settings transaction preview/apply. Visibility, stop/quit rules, CPU/RAM sampling and finished retention
  are rules, not extra preference rows. The shared status-bar presentation owner projects the actual fitted
  display separately from the saved request. When the requested
  Words presentation cannot fit, it renders Numbers while keeping the saved boolean true and complete hover/accessibility
  words. It retries fit on look/width/count/setting changes, not on every tick, so the bar does not flicker or
  overwrite the preference.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-244
- SSYS-009
unblocks: []
acceptance_criteria:
- The inventory row defaults false/Numbers beside activity-bar-labels.
- Numbers and Words expose identical counts/full accessibility labels, including separate questions/input and
  truthful zero/stale states.
- Every host edits the same row at its exact offered level through preview/apply, without adding a visibility/resource/retention
  preference.
validation_surfaces:
  - scripts/pm-shard-plans.py
  - scripts/pm-plan-index.py
  - scripts/pm7-build-check.py
  - scripts/pm-plans-verify.py
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Settings_System.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/background-activity/opus-5.5/IMPACT_TRACKER.md
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
- "DL-260 source lineage only (no product script or DOM obligation): kit.d/47-status-words.js, html[data-pm-status-words] and data-work-words implemented requested/effective display in the concept; the shared status-bar owner retains that distinction."
preserved_exact_tokens:
- general.interaction.status-bar-words
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-244, ContractName:Plans/Settings_System.md#SSYS-009




Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

### SSYS-058 - Storage Health, Free Up Space And Backup Status In Settings

```yaml
plan_unit_id: SSYS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  DL-270, Jared 2026-10-31. Settings adds no ordinary row for the storage profile; it shows what Plans/storage-plan.md
  owns and routes the one action. Storage health: the storage-retention-recovery descriptor's owner projection,
  on the Advanced > Storage & Retention page that cmd.settings.open_storage_retention opens, shows about eight
  storage groups, each with its usage, its one budget, its reclaimable bytes and the last compaction, exactly
  as the storage owner reports them (SP-340). Settings holds no budget, cache size, fragmentation threshold or
  compaction schedule: they are fixed owner values in the storage registry, shown read only. A group whose size
  is already a Settings row shows that row's value as its budget (web.fetch.cache-size); saved terminal output
  shows its fixed 512 MiB total and 64 MiB each (SSYS-051). Free up space dispatches only the existing cmd.storage.compaction.request,
  one action for the whole storage instance, and shows the owner's result per group: the sizes before and after
  and the bytes returned, or the owner's reason. Usage history: ai.usage.usage-retention is unchanged (default
  90 days, selectable longer or shorter); it governs detailed usage records and daily usage totals are kept whatever
  it says (UF-108). Backup status: the Data Backup and Retention overview shows the newest verified backup with
  its level, what a restore from it would lose and any newer unverified backup, all read from the one backup-status
  record (BRS-031); Settings computes none of it. Fixed, not choices: compression levels and tiers, sync mode,
  the 16 KiB inline cap, render-page size, redb cache size, transport compression, screenshot format and where
  stores are placed. ai.usage.usage-retention is Everywhere-only (same_for_you), retains its 90-day default and
  always-kept daily totals, and gains no Computer/Project override. Fixed storage budgets and live backup/health
  facts remain owner status, never new settings.
gui_related: true
gui_classification_reason: Defines the storage health display, the free-up-space result and the backup status that people see in Settings.
split_recommended: false
depends_on: [SSYS-021, SSYS-026, SSYS-051, SP-340, SP-341, SP-345, BRS-031, UF-108]
unblocks: []
acceptance_criteria:
- A census of Plans/settings_inventory.json after DL-270 finds the same number of unique ids as before it, and no id for a disk budget, cache size, fragmentation threshold, compaction schedule, compression level, sync mode, payload cap, page size, transport compression, screenshot format or store location.
- The storage-retention-recovery projection shows each group's usage, budget, reclaimable bytes and last compaction from the owner's record, and Settings stores none of those figures.
- The free-up-space action dispatches only cmd.storage.compaction.request and renders the owner's result per group, including the bytes returned or the owner's reason.
- ai.usage.usage-retention keeps its 90-day default and its longer and shorter choices.
- The Data Backup and Retention overview shows the newest verified backup with its level and what a restore from it would lose, and a newer unverified backup beside it, or says no verified backup exists.
validation_surfaces: [Plans/settings_inventory.json, python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json]
risk_class: storage_truth_duplicated_or_invented_in_settings
reasoning_tier: high
context_scope: dl270_settings_companions
implementation_surfaces: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Backup_Restore_System.md]
node_compile_hint: {mode: owner_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Plans/Decision_Log.md#DL-270
- Plans/storage-plan.md#SP-340
- Plans/usage-feature.md#UF-108
- Plans/Backup_Restore_System.md#BRS-031
- 'source_ref:projects-pass2-20261103:S1–S14; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [cmd.storage.compaction.request, cmd.settings.open_storage_retention, ai.usage.usage-retention, web.fetch.cache-size, 16 KiB]
negative_constraints:
  - "Do not add a setting for a disk budget, cache size, compaction schedule or threshold, compression level, sync mode, page size, transport compression or screenshot format."
  - "Do not retire or re-scope ai.usage.usage-retention."
  - "Do not hold a copy of storage or backup figures in Settings."
owner_hints: [Plans/Settings_System.md, Plans/storage-plan.md, Plans/Backup_Restore_System.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/usage-feature.md#UF-108, ContractName:Plans/Backup_Restore_System.md#BRS-031, ContractName:Plans/Settings_System.md#SSYS-026

## Command payload definitions (DL-333, 2026-11-05)

### SSYS-076 - Settings Route Command Payload Definitions

```yaml
plan_unit_id: SSYS-076
unit_type: command_contract
status: accepted
owner_doc: Plans/Settings_System.md
canonical_text: >-
  Typed payload definition for the Settings route command that UI_Command_Catalog UCC-103 keeps current
  (DL-333): cmd.settings.open, which opens exactly one stable Settings setting or manager/detail target
  and preserves the Settings-owned exact return (SSYS-018, SSYS-019). The definitions block below gives
  the command its args, owner result and narrowed error and disabled-reason codes in
  pm.command_payload_definitions.v1. The catalog keeps ids, labels, availability and aliases; the strict
  schema overlay keeps the common envelope and the closed code sets. The retired non-alias
  cmd.settings.open_notifications spelling stays retired lineage and gets no definition and no alias.
gui_related: true
gui_classification_reason: Defines the arguments of the user-visible Settings open/navigation command.
depends_on: [UCC-230, UCC-103, SSYS-018, SSYS-019, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to SSYS-076 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Settings_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.settings.open]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; cmd.settings.open_notifications is retired non-alias lineage (UCC-103) and receives no alias entry here.
  - Do not encode a bloom, breadcrumb, Back control or other presentation geometry into the definition (UCC-230 routes the current typed route only).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: SSYS-076
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.settings.open
      ucc_units: [UCC-103]
      command_kind: navigation_wrapper
      # canon: UI_Command_Catalog.md:10620 Settings route registration table command_kind column.
      response_kind: owner_operation
      # The command names an owner operation (the wiring request_schema_ref below), so it is not a
      # local-only projection; the effect is a bounded route/open receipt (pm.settings_route_return.v1).
      args:
        # UICommand.args are the settings_route_request_v2 fields (the typed request for
        # handlers::settings::open_route; Wiring_Matrix.production.json entries.catalog.settings_open)
        # minus command_id, which the envelope carries.
        manager_id:
          type: contract
          ref: Plans/settings_system_contracts.schema.json#/$defs/manager_id
          required: true
          default: none
          provenance: canon
          source: "Plans/settings_system_contracts.schema.json $defs/settings_route_request_v2.properties.manager_id (closed manager enum, all-settings through dry-method); typed through its own $defs/manager_id because the pm.command_payload_definitions.v1 enum admits only snake_case values"
        target:
          type: contract
          ref: Plans/settings_system_contracts.schema.json#/$defs/settings_level_target_v1
          required: true
          default: none
          provenance: canon
          source: "settings_route_request_v2 requires target ($defs/settings_level_target_v1); SSYS-019 exact level/level_key owner-target context with nullable fields only when that identity is not applicable"
        thing_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 thing_id is required-but-nullable (string 1..256 or null); modeled optional because the closed vocabulary has no nullable type (absent = not applicable)"
        server_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 server_id is required-but-nullable (string 1..256 or null); modeled optional (absent = not applicable)"
        execution_host_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 execution_host_id is required-but-nullable (string 1..256 or null); modeled optional (absent = not applicable)"
        execution_environment_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 execution_environment_id is required-but-nullable (string 1..256 or null); modeled optional (absent = not applicable)"
        origin_route_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "settings_route_request_v2 requires origin_route_ref (string 1..256); the return contract freezes the origin route (SSYS-019)"
        origin_client_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "settings_route_request_v2 requires origin_client_id (string 1..256)"
        query:
          type: string
          required: true
          default: none
          constraints: {max_length: 16384}
          provenance: canon
          source: "settings_route_request_v2 requires query (string maxLength 16384); the return contract freezes the query (SSYS-019)"
        scroll_anchor_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 scroll_anchor_ref is required-but-nullable (string 1..256 or null); modeled optional (absent = not applicable); the return contract freezes the scroll anchor (SSYS-019)"
        focus_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "settings_route_request_v2 focus_ref is required-but-nullable (string 1..256 or null); modeled optional (absent = not applicable); the return contract freezes focus (SSYS-019)"
        continuation_generation:
          type: integer
          required: true
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "settings_route_request_v2 requires continuation_generation (integer minimum 0); a stale generation rejects return (SSYS-019)"
        expires_at_utc:
          type: timestamp
          required: true
          default: none
          provenance: canon
          source: "settings_route_request_v2 requires expires_at_utc (RFC 3339 date-time); no literal default (DL-333 coordinator resolution 11)"
      owner_request: Plans/settings_system_contracts.schema.json#/$defs/settings_route_request_v2
      # Equals the wiring request_schema_ref (Wiring_Matrix.production.json entries.catalog.settings_open).
      # Plans/Commands_System.md:5063 registers the persisted record shapes settings_route_request
      # (pm.settings_route_request.v1) and settings_route_return (pm.settings_route_return.v1) as the
      # same family's v1 records.
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/settings_system_contracts.schema.json#/$defs/settings_route_return_v2
      # Equals the wiring result_schema_ref; the return freezes origin route, focus, query, scroll
      # anchor, continuation generation and status (returned, caller_unavailable, stale_return_refused).
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, stale_projection]
      # No registration table states disabled reasons for this row; drawn from the closed set over the
      # registration preconditions settings_registry_loaded && route_target_current
      # (UI_Command_Catalog.md:10620): an unloaded settings registry maps to not_configured and a route
      # target that is not current to stale_projection. SSYS-018 keeps handler_unavailable as the
      # evidence boundary until the sole handler is observed, which the always-set already covers;
      # stale_projection in disabled keeps stale_projection in error_codes.
      aliases: []
```
