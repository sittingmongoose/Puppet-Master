# Shard 013: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Orchestrator_Page.md`

Source lines: L1919-L2324

Source SHA256: `cd66bb447f461b390142bf4edc41ced7d57085e271e0085e54aab67885c58689`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### OP-026 - Current Project History Documents Runs Surface

```yaml
plan_unit_id: OP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: Orchestrator History is the current-project GUI home for historical wizard-created PRD/Plan documents
  and historical Orchestrator runs. It provides Documents and Runs subviews, dense table rows, structured filter
  chips plus text search, Approved only versus All history controls, an Include archived step inside All history,
  visible archived labels, empty and degraded states, and a read-only stale/out-of-sync projection mode with a visible
  warning. The default Documents view shows final/approved outputs; the user can expand to retained drafts, intermediate
  outputs, superseded rows, exports, and other retained wizard artifacts.
gui_related: true
gui_classification_reason: Defines the user-visible Orchestrator History tab, tables, filters, states, and rows.
depends_on:
- 0PI-062
unblocks:
- UCC-100
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_surface_drift
reasoning_tier: standard
context_scope: orchestrator_history_surface
implementation_surfaces:
- Plans/Orchestrator_Page.md
- future Orchestrator History tab
node_compile_hint:
  mode: orchestrator_history_gui
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0010
- pldg-20260626-001-feature-name:atom-0011
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0019
- pldg-20260626-001-feature-name:atom-0023
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0032
- pldg-20260626-001-feature-name:atom-0033
- pldg-20260626-001-feature-name:atom-0044
- pldg-20260626-001-feature-name:atom-0045
- pldg-20260626-001-feature-name:atom-0053
- pldg-20260626-001-feature-name:atom-0056
- pldg-20260626-001-feature-name:atom-0061
- pldg-20260626-001-feature-name:atom-0063
- pldg-20260626-001-feature-name:atom-0064
- pldg-20260626-001-feature-name:atom-0152
- pldg-20260626-001-feature-name:atom-0154
- chat:misc-history-scope
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-compare-archive-answers
- chat:history-projection-lifecycle-answer
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#orch-tab-history
- Concepts/PMConcept.html#orch-panel-history
- Concepts/PMConcept.html
source_atom_ids:
- atom-0010
- atom-0011
- atom-0015
- atom-0016
- atom-0019
- atom-0023
- atom-0024
- atom-0025
- atom-0032
- atom-0033
- atom-0044
- atom-0045
- atom-0053
- atom-0056
- atom-0061
- atom-0063
- atom-0064
- atom-0152
- atom-0154
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0007
- dec-0009
- dec-0010
- dec-0011
- dec-0012
- dec-0024
preserved_exact_tokens:
- You will need to figure out the GUI for it too
- see historical documents
- historical orchestrator runs
- It should probably be a tab in the Orchestrator page
- The /page-shell is a seven-tab single-page surface with canonical tabs `Progress`, `Plan Compile`, `Seams`, `Node
  Graph`, `Evidence`, `History`, and `Ledger`
- History
- that is fine
- By default it should show only final/approved outputs
- final/approved outputs
- it can be exapnded by the user to show everything
- show everything
- Orchestrator History
- Documents
- Runs
- It should be locked to the current project.
- retained forever by default
- 'yes'
- retention/archive rules
- dense table columns
- Name
- Type
- Status
- Version
- Created/Approved
- Source
- Last action
- Artifacts
- Approved only
- All history
- per-project toggle/chip
- only after include archived extra
- Include archived
- archived
- stale/out-of-sync state detected and surfaced
- sounds good
- read-only viewing with a warning
- stale/out-of-sync
- exact row schema fields
- search/filter syntax
- view/search/filter
- empty states
- Rebuild
- Orchestrator page
- tab
- Progress
- Plan Compile
- Node Graph
- Evidence
- Ledger
- PMConcept.html
- dense workbench
- activity rail
- page tabs
- resizable chat panel
- floating chat
- compact chips
- role badges
- runtime popovers
- activity cards
negative_constraints:
- Do not leave this as storage-only history with no first-class PM surface.
- Do not make users hunt through raw ledger files or generated artifact paths for normal history access.
- Do not add a new top-level Orchestrator tab without reconciling the existing canonical seven-tab shell.
- Do not bury historical documents under Ledger if the user needs normal browsing and preview rather than raw record
  inspection.
- Do not show every draft/intermediate artifact in the default Documents view.
- Do not hide final/approved artifacts inside raw ledger or export-only views.
- Do not make expanded history indistinguishable from approved/final history.
- Do not omit authority labels such as draft, approved, final, superseded, exported, or generated when showing everything.
- Do not create a separate top-level Orchestrator tab unless a later decision explicitly supersedes this placement.
- Do not merge Documents and Runs into one ambiguous list without clear type separation.
- Do not show global cross-project History by default.
- Do not mix unrelated project histories in the current project History surface.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not default to card-only or sparse rows for this operational history surface.
- Do not omit enough identity/status metadata that similarly named documents or runs become ambiguous.
- Do not make All history a hidden advanced-only affordance.
- Do not persist the control globally across unrelated projects.
- Do not show archived records inline by default in All history.
- Do not make archived records appear without an explicit additional control.
- Do not make archived records appear identical to normal retained all-history records.
- Do not let stale projection state silently drive History, export, or compare behavior without detection.
- Do not hide projection corruption/out-of-sync status in logs only.
- Do not hide stale/out-of-sync status while still showing rows.
- Do not allow normal-looking mutable history actions when the projection is stale.
- Do not allow rows without canonical source refs or project scope.
- Do not make similarly named documents/runs ambiguous.
- Do not omit projection/currentness/authority state when it affects actions.
- Do not require users to learn an advanced query language for MVP.
- Do not hide projection state or actionability filters when they affect what actions are possible.
- Do not make Include archived implicit.
- Do not show a blank table when the user needs to know why no rows are visible.
- Do not make archived/permission/rebuild states indistinguishable from genuinely empty history.
- Do not hide rebuild failure from the user.
- Do not use PMConcept History table columns as the final complete schema when accepted ledger History atoms specify
  deeper document/run/package comparison.
- Do not let concept-only tab naming override future canonical owner placement.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/assistant-chat-design.md
```

### OP-027 - History Actions Deep Compare Export Rebuild

```yaml
plan_unit_id: OP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: History rows expose authority-gated actions without mutating immutable history in place. Document
  rows support Open, Compare versions, Duplicate as draft, Reopen in Wizard, Export, and Send forward when currentness
  allows; run rows support viewing, filtering, artifact/evidence opening, resume/retry where valid, clone-as-new-run,
  export, and raw/ledger inspection. Compare versions is deep in MVP with rendered output, package/source-lineage
  metadata, source ledger atom lineage where applicable, and manifest identity. Export actions support selected
  rows, multi-select bundles, filtered views, zip/archive, JSON, rendered Markdown, rendered HTML, rendered PDF,
  and explicit evidence/redaction profiles. When projection state is stale, compare/export/reopen/send-forward remain
  blocked until Rebuild succeeds.
gui_related: true
gui_classification_reason: Defines user-visible row actions, compare/export controls, rebuild affordance, and blocked
  states.
depends_on:
- OP-026
- SP-219
- CV-295
unblocks:
- UCC-100
- POA-051
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_action_authority_drift
reasoning_tier: high
context_scope: orchestrator_history_actions
implementation_surfaces:
- Plans/Orchestrator_Page.md
- future History row action menus
node_compile_hint:
  mode: history_action_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0026
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0035
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0043
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- pldg-20260626-001-feature-name:atom-0062
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0017
- atom-0018
- atom-0026
- atom-0027
- atom-0034
- atom-0035
- atom-0038
- atom-0041
- atom-0043
- atom-0057
- atom-0058
- atom-0059
- atom-0062
decision_refs:
- dec-0003
- dec-0004
- dec-0005
- dec-0006
- dec-0007
- dec-0010
- dec-0011
- dec-0012
preserved_exact_tokens:
- All of that.
- status/date/project search
- opening artifacts/evidence
- resuming/retrying
- cloning as a new run
- exporting
- viewing what happened
- historical orchestrator runs
- document-specific actions
- Duplicate as draft
- Reopen in Wizard
- Compare versions
- Export
- Send forward when currentness allows
- 'Yes'
- currentness allows
- deeper is mvp
- rendered document diff
- package/source-lineage metadata
- ledger-atom diff
- immutable historical records
- all of thodse
- selected-row export
- multi-select bundle export
- whole filtered-view export
- manifest
- yes, and yes.
- zip+manifest
- JSON
- rendered Markdown/HTML/PDF
- 'yes'
- side-by-side rendered diff
- metadata/source-lineage pane
- atom/manifest change table
- sounds good
- Rebuild
- immutable source records
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
- permissions/redaction profile details
- raw records/evidence
- explicit evidence/redaction profile
negative_constraints:
- Do not reduce historical runs to read-only summaries when the user needs action routes.
- Do not omit evidence/artifact/Ledger pivots from historical run rows.
- Do not mutate immutable historical run/document identity in place.
- Do not resume or retry a stale historical run without currentness and authority checks.
- Do not treat clone-as-new-run as the same identity as the original historical run.
- Do not expose run-only actions such as retry or clone-as-new-run directly on document rows unless they route through
  a document-appropriate currentness/authority action.
- Do not send a historical document forward without currentness checks.
- Do not launch Plan Compile, Orchestrator execution, or mutable wizard state directly from stale historical documents
  without currentness checks.
- Do not mutate immutable approved packs or historical document records in place.
- Do not ship compare versions as rendered-text-only in MVP.
- Do not hide source-lineage or package identity changes when comparing historical wizard documents.
- Do not compare by path or title alone when canonical document/package IDs exist.
- Do not let comparison mutate or merge historical records.
- Do not limit MVP export to selected-row-only.
- Do not make whole filtered-view export omit the active filter context.
- Do not collapse export into only one opaque archive format.
- Do not omit the manifest from archive/zip exports.
- Do not make deep comparison a single raw JSON or text-only diff.
- Do not hide metadata/source-lineage or atom/manifest changes behind unrelated developer-only tooling.
- Do not make rebuild available only as hidden developer tooling.
- Do not rebuild by mutating immutable source records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
- Do not silently include raw records or evidence in ordinary exports.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/Project_Output_Artifacts.md
```
