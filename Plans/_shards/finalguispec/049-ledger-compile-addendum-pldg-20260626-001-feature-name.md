# Shard 049: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/FinalGUISpec.md`

Source lines: L25720-L25906

Source SHA256: `0c52e700714839fefab1f760a7aca55bbb0e19ab2792961fca22bdb4996286ed`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### F3-402 - History And Vision GUI Concept Alignment

```yaml
plan_unit_id: F3-402
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: History and vision bridge GUI planning may use Concepts/PMConcept.html as directional source-lineage
  for a dense PM workbench with page tabs, table/detail panels, compact chips, activity cards, status strips, runtime
  popovers, and Assistant Chat artifact patterns. PMConcept is not final UI canon and its HTML/CSS, colors, demo
  data, and class names must not be copied into product spec or implementation. History remains an Orchestrator
  History workbench surface; vision bridge artifacts and controls should feel first-party in Assistant Chat and
  runtime artifact panels.
gui_related: true
gui_classification_reason: Defines visual workbench alignment, tabs, chips, panels, and presentation for History
  and vision bridge.
depends_on:
- OP-026
- ACD-425
unblocks:
- ATS-012
- ATS-013
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: gui_concept_overfit
reasoning_tier: standard
context_scope: history_vision_gui_alignment
implementation_surfaces:
- Plans/FinalGUISpec.md
- future Orchestrator History and Assistant Chat visual surfaces
node_compile_hint:
  mode: gui_alignment_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0010
- pldg-20260626-001-feature-name:atom-0011
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0150
- pldg-20260626-001-feature-name:atom-0152
- pldg-20260626-001-feature-name:atom-0153
- pldg-20260626-001-feature-name:atom-0154
- chat:misc-history-scope
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:opencode-see-image-request
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
- chat:teach-bundle-accepted-pmconcept-reference
- Concepts/PMConcept.html
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#orch-tab-history
- Concepts/PMConcept.html#orch-panel-history
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0010
- atom-0011
- atom-0078
- atom-0082
- atom-0150
- atom-0152
- atom-0153
- atom-0154
decision_refs:
- dec-0002
- dec-0003
- dec-0014
- dec-0015
- dec-0016
- dec-0017
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
- GUI
- provider/model used
- derived description
- source image/artifact link
- freshness/cache state
- inspect
- rerun with a question
- copy description
- attach result
- always accept
- stops asking
- current-turn attachment
- selected artifact
- project file allowed by FileSafe
- clipboard image
- recent OS screenshot picker
- ambiguous
- hidden Desktop/Downloads scraping
- 'yes'
- For the Gui
- PMConcept.html
- That isnt the final form
- just a concept
- will give you an idea
- figure the gui out for these features
- Orchestrator page
- tab
- Progress
- Plan Compile
- Node Graph
- Evidence
- Ledger
- Screenshot to Chat
- composer-chip
- activity-card
- Requested Model
- Effective Model
- inspect/rerun
- provider/model disclosure
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
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not treat PMConcept.html as final or canonical UI truth.
- Do not copy the concept HTML/CSS directly into canonical Plans or implementation.
- Do not let the concept override accepted ledger decisions or canonical Plans owner docs during a future compile.
- Do not use PMConcept History table columns as the final complete schema when accepted ledger History atoms specify
  deeper document/run/package comparison.
- Do not let concept-only tab naming override future canonical owner placement.
- Do not make vision bridge artifacts feel like detached plugin output.
- Do not hide requested/effective model or fallback state when the bridge uses a separate vision-capable route.
- Do not replace accepted PM-owned permission/disclosure behavior with PMConcept demo-only controls.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/assistant-chat-design.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
