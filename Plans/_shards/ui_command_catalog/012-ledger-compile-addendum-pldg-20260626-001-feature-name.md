# Shard 012: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7068-L7507

Source SHA256: `23bf28ecc5cc3aab5bf8b9c4154d63c3762c27d7eeb85f98dd10331298d372a7`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### UCC-100 - History Command Payloads And Action Wrappers

```yaml
plan_unit_id: UCC-100
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: History command wrappers cover focus Orchestrator History, switch Documents/Runs subviews, open
  row, open artifacts/evidence, compare versions, duplicate as draft, reopen wizard, send forward, selected-row
  export, multi-select bundle export, filtered-view export, resume/retry where valid, clone as new run, inspect
  ledger/raw records, include archived, and rebuild projection. Each command carries identity-native payload refs,
  current-project scope, currentness/authority state, stale-projection gating, and non-mutating immutable-history
  semantics.
gui_related: true
gui_classification_reason: Defines user-visible commands/actions for History rows and rebuild controls.
depends_on:
- OP-027
- CV-295
- PS-120
unblocks:
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
risk_class: history_command_drift
reasoning_tier: standard
context_scope: history_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future History command catalog
node_compile_hint:
  mode: history_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0026
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0043
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
source_atom_ids:
- atom-0017
- atom-0018
- atom-0026
- atom-0027
- atom-0034
- atom-0038
- atom-0041
- atom-0043
- atom-0057
- atom-0058
- atom-0059
decision_refs:
- dec-0003
- dec-0004
- dec-0005
- dec-0006
- dec-0007
- dec-0010
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

### UCC-101 - Vision Bridge GUI Commands

```yaml
plan_unit_id: UCC-101
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Vision bridge command wrappers cover explicit image source selection, recent OS screenshot picker
  choice, inspect derived description, rerun with a question, copy description, attach result to current turn/run,
  and manage remembered always-accept permission. Commands must show the selected source, avoid ambiguous screenshot
  auto-selection, preserve FileSafe and permission scope, and avoid presenting bridge-derived answers as if the
  non-vision model directly saw the image.
gui_related: true
gui_classification_reason: Defines inspect/rerun/copy/attach/manage-permission controls for user-visible image bridge
  artifacts.
depends_on:
- T-165
- RAP-035
- PS-121
unblocks:
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
risk_class: vision_command_drift
reasoning_tier: standard
context_scope: vision_bridge_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future Assistant Chat vision bridge controls
node_compile_hint:
  mode: vision_bridge_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0083
- chat:opencode-see-image-request
- chat:vision-bridge-defaults-answer
- Plans/Runtime_Artifacts_Panel.md
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
- Plans/Permissions_System.md
source_atom_ids:
- atom-0078
- atom-0082
- atom-0083
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
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
- project_id
- user/account identity
- source class
- destination provider/account
- provider-family policy
- tool id
- sensitivity/redaction class
- revocable/resettable
negative_constraints:
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not make always-accept global across all projects, providers, users, source types, or sensitivity classes by
  accident.
- Do not create a hidden permission rule that cannot be inspected or revoked.
- Do not keep prompting after an applicable remembered permission exists.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### UCC-102 - Teach Guided GUI Command Taxonomy

```yaml
plan_unit_id: UCC-102
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Teach guided GUI commands include help-icon launch, /teach launch, natural-language summon handoff,
  route open, tab or panel focus, spotlight/highlight, scroll-to-field, safe read-only inspect, explain current
  UI, and optional Do it execution only for explicitly safe actions. Mutations require confirmation, permission
  gates, and activity transparency. Degraded states include missing target, stale navigation, permission denied,
  unavailable command, model/capability fallback, missing help entry, and user stop, each with a visible next action.
gui_related: true
gui_classification_reason: Defines user-visible guided action commands, route/highlight controls, mutation confirmation,
  and degraded action handling.
depends_on:
- PS-122
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
risk_class: teach_guided_command_drift
reasoning_tier: high
context_scope: teach_guided_gui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future command palette and guided overlay commands
node_compile_hint:
  mode: teach_guided_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0097
- pldg-20260626-001-feature-name:atom-0098
- pldg-20260626-001-feature-name:atom-0139
- pldg-20260626-001-feature-name:atom-0140
- pldg-20260626-001-feature-name:atom-0142
- pldg-20260626-001-feature-name:atom-0143
- pldg-20260626-001-feature-name:atom-0144
- chat:teacher-feature-initial-framing
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md#2.6A-Chat-thread-lifecycle-commands
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md#ACD-410---Internal-Target-Payload-Navigation
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#F3-016-help-and-contextual-affordances
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/assistant-chat-design.md#6-teach
- Plans/FinalGUISpec.md#19.6-natural-language-invocation-feedback
- Plans/Permissions_System.md#2.4A-requested-vs-effective-permissioned-capability-state
- Plans/Permissions_System.md#approval-ui
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
source_atom_ids:
- atom-0097
- atom-0098
- atom-0139
- atom-0140
- atom-0142
- atom-0143
- atom-0144
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
preserved_exact_tokens:
- help icon
- clicked
- brings the user to the assistant chat window
- opens a new thread
- Teacher
- teacher can control the Gui to show the user how to do things
- Gui
- show the user how
- OpenSubject
- route_target
- highlight
- spotlight
- Teacher mode
- current surface
- Teacher badge
- context chip
- model chip
- source disclosure
- /teach
- teach me
- show me how
- help me understand this
- what does this mean
- explain this screen
- walk me through
- remember that
- for this repo always
- compact disambiguation
- control the Gui
- open route
- focus panel
- scroll to section
- highlight control/region
- expand non-mutating details
- preview selection
- changing a setting
- saving memory
- approving a permission
- undo/rollback
- spotlight/outline
- anchored caption
- step counter
- Back
- Next
- Stop
- Let me try
- Do it
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
negative_constraints:
- Do not reuse an unrelated active chat thread when the help-icon contract says to open a new teaching conversation.
- Do not launch Teacher without preserving current surface context needed for useful help.
- Do not replace Teacher launch with static help pages only.
- Do not let Teacher perform raw uncontrolled GUI mutation outside stable UI command/route contracts.
- Do not allow mutating/destructive GUI actions without confirmation and capability/permission gates.
- Do not use stale or private panel-local route fields when the route/open contract provides canonical targets.
- Do not silently mutate an existing non-Teacher thread into Teacher mode.
- Do not lose the originating surface/control context during launch.
- Do not require users to know `/teach` before discovering help.
- Do not turn every help request into durable memory capture.
- Do not persist natural-language instructions without explicit confirmation.
- Do not guess between one-off teaching and Teach capture when the user intent is ambiguous.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let Teacher execute mutating actions through `Do it` without confirmation.
- Do not let guided GUI actions bypass Permissions_System requested/effective disclosure.
- Do not obscure the target control with the explanation caption.
- Do not make the overlay inaccessible without keyboard or screen-reader fallback.
- Do not trap the user in the overlay without Stop/return-to-chat.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Commands_System.md
- Plans/Automated_Testing_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Glossary.md
```
