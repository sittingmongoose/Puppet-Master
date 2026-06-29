# Shard 018: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/00-plans-index.md`

Source lines: L4531-L4738

Source SHA256: `bc4bbc03e1f95de07300cf271a85c04dbe7ebe06675160cd902125401da2e824`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### 0PI-062 - Miscellaneous History Vision Bridge Teach Owner Map

```yaml
plan_unit_id: 0PI-062
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The miscellaneous feature ledger pldg-20260626-001-feature-name compiles into existing owner docs
  rather than a new feature owner doc. Historical wizard-created PRD/Plan documents and historical Orchestrator
  runs route through Orchestrator History, history projection/storage, output/export, runtime artifact, permission,
  command, and testing owners. The PM-native vision_bridge / see_image capability routes through Tools, Prompt Pipeline,
  Models, Media Capabilities, Permissions, FileSafe, Runtime Artifacts, Assistant Chat, usage, OpenCode-provider
  lineage, and tests. Teach is the feature and Teacher is the Persona used by it; its threaded guidance, model setting,
  PM knowledge substrate, help/glossary content, guided GUI, command invocation, memory capture, handoff, and tests
  route to the existing chat/persona/model/prompt/GUI/command/storage/glossary/testing owners. PMConcept.html is
  source-lineage only and must not become final UI canon.
gui_related: false
gui_classification_reason: Owner routing and compile registration are index/governance metadata, not GUI implementation.
depends_on:
- PDS-005
- PLS-011
unblocks:
- OP-026
- T-165
- ACD-426
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: owner_routing_drift
reasoning_tier: high
context_scope: misc_history_vision_teach_owner_map
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0007
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0090
- pldg-20260626-001-feature-name:atom-0150
- pldg-20260626-001-feature-name:atom-0151
- pldg-20260626-001-feature-name:atom-0152
- pldg-20260626-001-feature-name:atom-0153
- pldg-20260626-001-feature-name:atom-0154
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Orchestrator_Page.md
- chat:opencode-see-image-request
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/Personas.md#RESERVED-PERSONAS
- Plans/Personas.md#CORE-PERSONA-CATALOG
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-bundle-accepted-pmconcept-reference
- Concepts/PMConcept.html
- chat:assistant-chat-threads-modeled-in-concept
- Concepts/PMConcept.html#chat-panel
- Concepts/PMConcept.html#chat-thread-sidebar
- Concepts/PMConcept.html#switchToChatThread
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#orch-tab-history
- Concepts/PMConcept.html#orch-panel-history
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0007
- atom-0008
- atom-0009
- atom-0069
- atom-0090
- atom-0150
- atom-0151
- atom-0152
- atom-0153
- atom-0154
decision_refs:
- dec-0002
- dec-0014
- dec-0018
- dec-0020
- dec-0024
correction_refs:
- corr-0001
preserved_exact_tokens:
- a bunch of miscellaneous things
- The fist one
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- historical orchestrator runs in PM
- historical orchestrator runs
- opencode-see-image
- see_image
- models models without vision
- adopt it to PM
- image
- screenshot
- Teach feature
- Teacher persona
- Teacher is also a persona(used for the teacher feature)
- requested_persona
- effective_persona
- For the Gui
- PMConcept.html
- That isnt the final form
- just a concept
- will give you an idea
- figure the gui out for these features
- The assistant chat window and threads are modeled in the concept too.
- Assistant Chat
- Teacher
- thread
- persona
- help icon
- new thread
- Orchestrator page
- History
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
- Do not treat later miscellaneous items as already specified by this first item.
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not introduce `requested_persona_id` or `effective_persona_id` as canonical fields; those are stale aliases
  in Personas.md.
- Do not make Teacher a hidden subagent for this feature; existing Plans say `teacher` is user-facing and not subagent-only.
- Do not treat PMConcept.html as final or canonical UI truth.
- Do not copy the concept HTML/CSS directly into canonical Plans or implementation.
- Do not let the concept override accepted ledger decisions or canonical Plans owner docs during a future compile.
- Do not invent a separate Teach-only chat surface when the Assistant Chat thread model can carry Teacher.
- Do not lose Teacher persona/model/source/context disclosure when launching from a help icon or summon phrase.
- Do not hide thread state such as working, unread, blocked, degraded, draft, archived, or handoff state when relevant.
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
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
