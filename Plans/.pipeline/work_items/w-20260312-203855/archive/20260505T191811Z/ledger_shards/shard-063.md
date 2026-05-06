- `Plans/Contracts_V0.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`

### Key findings
- The current docs only define a concrete deep-link format for wizard clarification resume:
  - `puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify`
- That is useful, but it should be treated as one serialized transport form of the broader routing model, not as the hidden canonical navigation contract.
- The internal `route_target` model can and should be richer than the serialized URL form.
- A deep-link transport should preserve:
  - stable sharable identity
  - enough focus to restore the intended task
  - deterministic decoding back into internal routing
- It should generally NOT try to preserve:
  - ephemeral UI layout state
  - transient panel widths/split ratios
  - non-stable local widget state
  - every possible inspector subsection detail

### Recommended serialization rule
- Internal:
  - canonical `route_target`
- External / persisted transport:
  - narrowed serializable form that decodes into `route_target`
  - `resume_url` is one concrete transport instance of that form

### Good candidates for serialized deep-link data
- stable primary target:
  - `object_kind`
  - `object_id`
  - or `subject_id`
- stable scope/context when needed:
  - `project_id?`
  - `thread_id?`
  - `focused_run_id?`
- narrowly-scoped anchor when operationally necessary:
  - wizard step
  - message focus
  - selected usage record

### Bad candidates for serialized deep-link data
- panel dock state
- split ratio
- scroll offsets except when the target contract explicitly depends on them
- broad ephemeral inspector/UI expansion state
- provider/account disclosure details that are attributes of the target, not the target itself

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/FinalGUISpec.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- `resume_url` is currently concrete while the broader route-target contract is still implicit.
- Without an explicit narrowed-transport rule, future docs may try to serialize the entire internal target model or, conversely, keep inventing new one-off URL shapes.
- The current wizard URL shape is useful, but it should stop standing alone as the only precise deep-link contract in the app.

### Candidate fixes to carry forward
- Define `resume_url` as a serialized route-target transport in the contract layer once `route_target` exists.
- Keep serialized forms intentionally narrower than the full internal object.
- Let object families define only the extra anchor material truly needed for recovery or exact resume.
- Decode all supported deep-link forms into the same internal routing path rather than handling URL activation as a separate system.

### Do-not-forget details
- Serialization should preserve stable work intent, not every UI detail.
- This is another place where restraint matters; over-serializing makes links brittle.
- The existing wizard deep-link is a good precedent, but it should become one member of a normalized transport family.

## Research Progress - 2026-03-16 - Shell/workspace state should remain adjacent to routing, not inside it

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- `Plans/feature-list.md`

### Key findings
- The shell already has a substantial persisted state model:
  - panel dock/floating state
  - which side panel was last visible
  - activity bar ordering
  - workspace-tab identity
  - per-project `project_state`
  - per-surface project state like `source_control.project_state.{project_id}`
  - browser/document pane/chat/editor shell state
- That state is real and important, but it is not the same thing as canonical route identity.
- The cleaner rule is:
  - routing chooses the target object and any necessary destination surface/context
  - shell state decides how that surface is realized inside the current window/workspace layout
- So route activation may legitimately include:
  - which major surface/tab/panel should become visible
  - which project/workspace context should be activated
- But it should not try to encode:
  - panel widths
  - floating window coordinates
  - icon order
  - full project-state snapshots
  - incidental shell preferences

### Recommended boundary
- Canonical routing may carry enough view intent to answer:
  - what object
  - in which broad destination surface
  - in which project/run/thread context
- Persisted shell state remains responsible for:
  - how the side panel is docked/floated
  - which workspace tab/window currently hosts the content
  - restoring per-project layout and remembered local UI state
- If a route needs a panel or tab visible, that should be expressed as destination intent, not as raw shell-state restoration payload.

### Impacted docs
- Primary owners:
  - `Plans/FinalGUISpec.md`
  - `Plans/storage-plan.md`
  - `Plans/Crosswalk.md`
  - `Plans/Contracts_V0.md`
- Cross-owner docs implicated by this seam:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/feature-list.md`
  - `Plans/FileManager.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- Some current command payloads and surface docs still blur destination intent with shell-state realization.
- `cmd.panel.switch` and similar shell commands are useful, but they should not become the de facto universal navigation primitive.
- `project_state:v1:{project_id}` and surface-local project-state records are adjacent restore context, not the canonical route payload.

### Candidate fixes to carry forward
- Keep shell/workspace persistence in the shell/storage docs, not in the base route contract.
- Allow the route model to name major destination surfaces/tabs/panels where operationally necessary.
- Explicitly state that workspace-tab selection, panel docking, and per-project layout restore are shell-state concerns layered underneath canonical routing.
- Treat commands like `cmd.panel.switch` as shell/view commands that can consume normalized routing context, not replace it.

### Do-not-forget details
- This seam prevents the route model from swallowing the whole shell.
- The right question for routing is “where should the user land,” not “how should every panel be laid out when they get there.”
- Shell persistence and route identity should cooperate, but they should not collapse into one contract.

## Research Progress - 2026-03-16 - Destination-surface vocabulary should stay controlled and coarse

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/feature-list.md`

### Key findings
- The app already has a fairly stable coarse surface vocabulary:
  - primary-content pages/views
  - side-panel destinations
  - bottom-panel surfaces
  - Orchestrator tabs
- That is enough for routing intent. The route model does not need to encode every lower-level shell detail.
- A useful split is:
  - destination surface vocabulary stays controlled and coarse
  - object identity and scope stay separate from destination
  - remembered local shell state refines the final presentation after landing

### Recommended coarse destination classes
- `primary_view`
  - examples: Dashboard, Projects, Wizard, Interview, Settings, Usage, FileEditor, Orchestrator
- `side_panel`
  - examples: chat, files, source_control, github_actions, docker_manager, artifacts, run_debug
- `bottom_panel`
  - examples: terminal, problems, output, ports, browser, debug
- `embedded_surface`
  - examples: document_pane, agent_activity
- `page_tab`
  - examples: Orchestrator tabs like Progress, Seams/Tiers, Node Graph, Evidence, History, Ledger

### What should stay out of coarse destination vocabulary
- specific dock/floating realization
- side-panel width
- exact subview state like selected repo or compare target
- widget layout slot positions
- remembered collapse/expand preferences

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/FinalGUISpec.md`
- Cross-owner docs implicated by this seam:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/storage-plan.md`
  - `Plans/feature-list.md`

### Contradictions / gaps surfaced
- Some current commands still mix coarse destination choice with detailed shell/subview state in one payload.
- Side-panel and page-tab distinctions are already stable enough to use canonically, but the docs do not yet connect them cleanly to the routing work.
- If destination vocabulary is too fine-grained, routing will start carrying shell implementation detail again.

### Candidate fixes to carry forward
- Define a controlled coarse destination enum/family in the route contract layer.
