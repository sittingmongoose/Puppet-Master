# Shard 047: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/FinalGUISpec.md`

Source lines: L25520-L25928

Source SHA256: `376250c8c45bb2787282bbfe13cda6ceeca875096ca2c65d2c3863133e843e38`

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

### F3-403 - Teach Help Icon Teacher Thread And Guided Overlay GUI

```yaml
plan_unit_id: F3-403
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Teach/Teacher uses the Assistant Chat window/thread model rather than a detached teaching app. Help
  icons on major surfaces launch a new Teacher thread with current-surface context. Teacher thread presentation
  includes persona badge, low-end/fast model source, context/model chips, source/context disclosure, activity cards,
  footer status where relevant, and thread states such as working, unread, blocked, degraded, draft, archived, or
  handoff. Guided GUI overlay uses highlight/spotlight, anchored captions, Back, Next, Stop, Let me try, and Do
  it controls, confirmation for mutations, degraded state recovery, keyboard and screen-reader accessibility, responsive
  behavior, and no stale target stepping.
gui_related: true
gui_classification_reason: Defines visible help icons, Teacher thread chrome, source panels, overlay captions, controls,
  degraded states, and responsive/accessibility behavior.
depends_on:
- ACD-426
- UCC-102
- G-026
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_gui_underspecification
reasoning_tier: high
context_scope: teach_teacher_gui
implementation_surfaces:
- Plans/FinalGUISpec.md
- future Assistant Chat Teacher thread
- future guided overlay
node_compile_hint:
  mode: teach_guided_gui_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0103
- pldg-20260626-001-feature-name:atom-0104
- pldg-20260626-001-feature-name:atom-0106
- pldg-20260626-001-feature-name:atom-0130
- pldg-20260626-001-feature-name:atom-0139
- pldg-20260626-001-feature-name:atom-0141
- pldg-20260626-001-feature-name:atom-0143
- pldg-20260626-001-feature-name:atom-0144
- pldg-20260626-001-feature-name:atom-0150
- pldg-20260626-001-feature-name:atom-0151
- pldg-20260626-001-feature-name:atom-0154
- chat:teach-visual-specificity-challenge
- chat:teacher-feature-initial-framing
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#F3-016-help-and-contextual-affordances
- Plans/FinalGUISpec.md#19.5-runtime-display-requirements
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
- Concepts/PMConcept.html
- chat:assistant-chat-threads-modeled-in-concept
- Concepts/PMConcept.html#chat-panel
- Concepts/PMConcept.html#chat-thread-sidebar
- Concepts/PMConcept.html#switchToChatThread
- chat:pmconcept-gui-reference
source_atom_ids:
- atom-0103
- atom-0104
- atom-0106
- atom-0130
- atom-0139
- atom-0141
- atom-0143
- atom-0144
- atom-0150
- atom-0151
- atom-0154
decision_refs:
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- help icon
- how it will look
- major page/panel headers
- tooltip
- new Teacher thread
- current surface
- assistant chat window
- opens a new thread
- Teacher
- persona badge
- context chip
- low-end/fast model
- How it will show the user
- control the Gui
- highlight
- spotlight
- Back
- Next
- Stop
- Let me try
- Do it
- Assistant Chat thread header
- Teacher activity cards
- Sources used
- PM context panel
- guided overlay captions
- Teach memory capture prompts
- Settings > model row
- command palette `/teach` result
- Help/Glossary pages
- current-context example
- clicked
- brings the user to the assistant chat window
- Teacher mode
- Teacher badge
- model chip
- source disclosure
- Teacher mode header
- requested/effective Persona
- current surface/context chip
- Teach capture availability
- Start guided walkthrough
- Show sources
- Save as taught memory
- Hand off
- spotlight/outline
- anchored caption
- step counter
- return-to-chat
- small screens
- safe spacing
- target surface unavailable
- route/control no longer exists
- context stale
- selection lost
- permission blocked
- capability unavailable
- help entry missing
- model fallback/clamp
- user stops
- For the Gui
- PMConcept.html
- That isnt the final form
- just a concept
- will give you an idea
- figure the gui out for these features
- The assistant chat window and threads are modeled in the concept too.
- Assistant Chat
- thread
- persona
- new thread
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
- Do not bury Teach behind only slash commands.
- Do not add a loud or decorative help affordance that competes with primary workflow controls.
- Do not launch Teacher without current-surface context.
- Do not create a detached Teacher-only shell that hides standard Assistant Chat controls.
- Do not omit requested/effective persona or model disclosure from the Teacher thread.
- Do not make Teacher launch a modal that blocks normal navigation as the only path.
- Do not use raw cursor/click automation as the teaching UI.
- Do not obscure the target control with the explanatory caption.
- Do not allow Teacher to click destructive/mutating controls without confirmation and permission gates.
- Do not fork labels between surfaces.
- Do not make context help available only from the full Help page.
- Do not include generic examples when current surface context is available.
- Do not silently mutate an existing non-Teacher thread into Teacher mode.
- Do not lose the originating surface/control context during launch.
- Do not require users to know `/teach` before discovering help.
- Do not invent a separate chat product surface for Teacher.
- Do not hide requested/effective Persona/model state.
- Do not show Save as taught memory unless the content is eligible and user confirmation is still required.
- Do not obscure the target control with the explanation caption.
- Do not make the overlay inaccessible without keyboard or screen-reader fallback.
- Do not trap the user in the overlay without Stop/return-to-chat.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
- Do not treat PMConcept.html as final or canonical UI truth.
- Do not copy the concept HTML/CSS directly into canonical Plans or implementation.
- Do not let the concept override accepted ledger decisions or canonical Plans owner docs during a future compile.
- Do not invent a separate Teach-only chat surface when the Assistant Chat thread model can carry Teacher.
- Do not lose Teacher persona/model/source/context disclosure when launching from a help icon or summon phrase.
- Do not hide thread state such as working, unread, blocked, degraded, draft, archived, or handoff state when relevant.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Models_System.md
- Plans/Personas.md
- Plans/Permissions_System.md
- Plans/Glossary.md
- Plans/Commands_System.md
- Plans/Automated_Testing_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Orchestrator_Page.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
