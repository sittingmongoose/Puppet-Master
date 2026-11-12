# Shard 053: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/assistant-chat-design.md`

Source lines: L23802-L24141

Source SHA256: `b4d0a4d8ff0879dc647c9d6989ddfc930317d1880d11b8e99d9862e330f0de7a`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### ACD-425 - Assistant Chat Vision Bridge Controls

```yaml
plan_unit_id: ACD-425
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: 'Assistant Chat surfaces vision bridge use with first-party controls and labels: selected image/source
  chip, bridge-derived description artifact, provider/model used, requested/effective model disclosure, freshness/cache
  state, permission/degraded state, inspect, rerun with question, copy description, attach result, and manage remembered
  permission. Screenshot to Chat, composer chips, activity cards, runtime artifact/detail panels, and requested/effective
  model chips are directional PMConcept lineage only, not copied HTML/CSS.'
gui_related: true
gui_classification_reason: Defines Assistant Chat composer chips, artifact chips, controls, and model/source disclosure
  for vision bridge.
depends_on:
- T-165
- RAP-035
- UCC-101
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
risk_class: vision_bridge_chat_opacity
reasoning_tier: standard
context_scope: assistant_chat_vision_bridge
implementation_surfaces:
- Plans/assistant-chat-design.md
- future Assistant Chat composer and artifact controls
node_compile_hint:
  mode: assistant_chat_vision_bridge_controls
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0075
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0153
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:opencode-see-image-request
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0075
- atom-0078
- atom-0082
- atom-0153
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
- dec-0024
preserved_exact_tokens:
- chat attachments
- runtime artifacts
- screenshots
- project files
- clipboard
- recent OS screenshots
- FileSafe
- 3. not deferred
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
- Screenshot to Chat
- composer-chip
- activity-card
- Requested Model
- Effective Model
- inspect/rerun
- provider/model disclosure
negative_constraints:
- Do not defer clipboard or recent OS screenshot support out of MVP.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default without PM-owned permission
  and ingestion rules.
- Do not bypass FileSafe or artifact access policy when resolving project images.
- Do not inline raw screenshots into prompts when artifact refs plus bounded summaries are required.
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not make vision bridge artifacts feel like detached plugin output.
- Do not hide requested/effective model or fallback state when the bridge uses a separate vision-capable route.
- Do not replace accepted PM-owned permission/disclosure behavior with PMConcept demo-only controls.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
```

### ACD-426 - Teach Teacher Threaded Guidance Workflow

```yaml
plan_unit_id: ACD-426
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Teach is deliberate standing-instruction capture; Teacher is a Persona in an ordinary
  Assistant chat. Help and natural-language Teacher summons retain the shared chat runtime. /teach opens
  cmd.chat.teach.capture, the same Teach sheet used by Save as a rule; explicit scoped confirm/cancel,
  screening, lock, narrowing and revocation remain. Reusable learned notes use the separate Memory page
  Add/Edit/Delete, without the duplicate verification document or capture ceremony for a user preference.
gui_related: true
gui_classification_reason: Defines Teacher-in-chat threads, help launches, activity cards, capture UI, and thread
  states.
depends_on:
- P-055
- MS-117
- PP-056
unblocks:
- G-026
- ATS-014
acceptance_criteria:
- Teach is deliberate standing-instruction capture; Teacher is a Persona in an ordinary Assistant chat.
  Help and natural-language Teacher summons retain the shared chat runtime. /teach opens cmd.chat.teach.capture,
  the same Teach sheet used by Save as a rule; explicit scoped confirm/cancel, screening, lock, narrowing
  and revocation remain. Reusable learned notes use the separate Memory page Add/Edit/Delete, without
  the duplicate verification document or capture ceremony for a user preference.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_threaded_guidance_gap
reasoning_tier: high
context_scope: assistant_chat_teach_teacher
implementation_surfaces:
- Plans/assistant-chat-design.md
- future Assistant Chat Teacher threads
node_compile_hint:
  mode: teach_teacher_threaded_guidance
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0090
- pldg-20260626-001-feature-name:atom-0093
- pldg-20260626-001-feature-name:atom-0094
- pldg-20260626-001-feature-name:atom-0097
- pldg-20260626-001-feature-name:atom-0099
- pldg-20260626-001-feature-name:atom-0103
- pldg-20260626-001-feature-name:atom-0104
- pldg-20260626-001-feature-name:atom-0107
- pldg-20260626-001-feature-name:atom-0139
- pldg-20260626-001-feature-name:atom-0141
- pldg-20260626-001-feature-name:atom-0145
- pldg-20260626-001-feature-name:atom-0146
- pldg-20260626-001-feature-name:atom-0151
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/Personas.md#RESERVED-PERSONAS
- Plans/Personas.md#CORE-PERSONA-CATALOG
- Plans/assistant-chat-design.md#6-Teach
- Plans/Personas.md#11.8-teacher
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md#2.6A-Chat-thread-lifecycle-commands
- memory:MEMORY.md:365
- Plans/assistant-chat-design.md
- chat:teach-visual-specificity-challenge
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#F3-016-help-and-contextual-affordances
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/FinalGUISpec.md#19.5-runtime-display-requirements
- Plans/Runtime_Artifacts_Panel.md#artifact-audit-visibility
- Plans/assistant-chat-design.md#6-teach
- chat:assistant-chat-threads-modeled-in-concept
- Concepts/PMConcept.html#chat-panel
- Concepts/PMConcept.html#chat-thread-sidebar
- Concepts/PMConcept.html#switchToChatThread
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
source_atom_ids:
- atom-0090
- atom-0093
- atom-0094
- atom-0097
- atom-0099
- atom-0103
- atom-0104
- atom-0107
- atom-0139
- atom-0141
- atom-0145
- atom-0146
- atom-0151
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- Teach feature
- Teacher persona
- Teacher is also a persona(used for the teacher feature)
- requested_persona
- effective_persona
- implimentation ready
- know everything in PM
- how it works
- all the capabilities of PM
- how the user interacts with it
- teacher can control the Gui
- help icon
- new thread
- Teach
- Teacher
- remember that...
- for this repo always...
- please prefer...
- ordinary one-off chat instructions do not become taught knowledge unless the user explicitly confirms persistence
- clicked
- brings the user to the assistant chat window
- opens a new thread
- assistant chat threads
- show what its doing
- blocked
- skipped
- requires confirmation
- handoff
- how it will look
- major page/panel headers
- tooltip
- new Teacher thread
- current surface
- assistant chat window
- persona badge
- context chip
- low-end/fast model
- How it will show the user
- Opening Settings > Models
- Highlighting
- Waiting for confirmation
- Blocked
- Handing off
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
- Teacher activity
- source lookups
- permission waits
- model fallback
- missing coverage
- memory save prompts
- handoffs
- collapsible detail
- normalized fact
- scope selector
- thread
- project
- user
- source message/thread
- secret-safety warning
- conflict/supersession preview
- Save/Cancel
- inspect
- narrow
- supersede
- revoke
- unlock
- The assistant chat window and threads are modeled in the concept too.
- Assistant Chat
- persona
negative_constraints:
- Do not expose retired memory-use, verification or rule-check receipt UI.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/Prompt_Pipeline.md
- Plans/Contracts_V0.md
- Plans/Models_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Automated_Testing_System.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Glossary.md
```

Amended 2026-09-27: the explicit capture card through which an answer is saved as taught memory is the Teach sheet, prefilled from the answer (DL-127, ACD-477); there is no inline capture card in the chat. The later unlock and revoke actions are `cmd.chat.teach.set_lock` and `cmd.chat.teach.revoke` (DL-130, ACD-481).
