### Candidate fixes to carry forward
- Define `route_target` in `Contracts_V0.md` with the bounded field set above.
- State the selector rule directly:
  - `subject_id`
  - or `object_kind` + `object_id`
  - never both as independent primary selectors for the same target
- Normalize legacy/special-case IDs into `subject_id` or `object_kind/object_id`.
- Keep all transport/open realization detail outside `route_target`.
- Keep all shell/view persistence detail outside `route_target`.

### Do-not-forget details
- `route_target` is now bounded.
- It carries navigation identity, scope restoration, and narrow focus refinement.
- It does not carry event-specific payload noise.
- It does not carry transport detail.
- It does not carry per-surface state.

## Research Progress - 2026-03-17 - Exact `target_kind` vocabulary

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`

### Key findings
- `target_kind` must stay coarse and controlled.
- The canonical vocabulary is:
  - `primary_view`
  - `side_panel`
  - `bottom_panel`
  - `embedded_surface`
  - `page_tab`
- These values are enough to express destination class without leaking shell implementation detail.
- `target_kind` is not object identity and it is not shell persistence state.
- `target_kind` tells the router what class of surface must host the target after scope restoration and target selection are applied.

### Meaning of each value
- `primary_view`
  - full primary-content destinations
  - examples: Dashboard, Projects, Wizard, Interview, Settings, Usage, Orchestrator
- `side_panel`
  - activity-bar panel destinations
  - examples: chat, files, source_control, github_actions, docker_manager, artifacts, run_debug
- `bottom_panel`
  - bottom shell destinations
  - examples: terminal, problems, output, ports, browser, debug
- `embedded_surface`
  - embedded sub-surfaces inside larger views
  - examples: document_pane, agent_activity
- `page_tab`
  - tab within a routed page that still needs explicit tab selection
  - strongest current example: Orchestrator tabs

### What is not `target_kind`
- docked vs floating
- panel width
- widget slot
- subview id
- repo/worktree selection
- browser tab id
- workspace tab id

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Crosswalk.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- Several command payloads and shell docs still mix destination class with lower-level shell realization details.
- `workspace_tab_id` and `browser_tab_id` exist in storage and command docs, but they are not `target_kind` values.
- `page_tab` is currently most needed for Orchestrator, but it should remain general and not be renamed around one page.

### Candidate fixes to carry forward
- Define the canonical `target_kind` enum in `Contracts_V0.md`.
- Keep destination-local refinements outside the enum and outside the base route contract.
- Use `page_tab` when the routed destination must land inside a known page and force a specific tab.

### Do-not-forget details
- `target_kind` is destination class only.
- It is not shell state.
- It is not object taxonomy.

## Research Progress - 2026-03-17 - Selector precedence inside `route_target`

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`

### Key findings
- `route_target` needs an explicit selector precedence rule.
- The canonical selector rule is:
  - exactly one primary selector is present:
    - `subject_id`
    - or `object_kind` + `object_id`
- `subject_id` wins for openable/renderable content subjects.
- `object_kind` + `object_id` wins for domain/runtime/governance objects.
- `tab_id`, `focused_run_id`, `thread_id`, and `inspector_target` never replace primary selector identity.
- `project_id` is required scope, not selector identity.

### Resolution order
1. restore `project_id`
2. restore route scope:
   - `focused_run_id` when present
   - `thread_id` when present
3. restore destination class from `target_kind`
4. resolve the primary selector:
   - `subject_id`
   - or `object_kind` + `object_id`
5. apply narrow focus refinement:
   - `tab_id`
   - `inspector_target`

### Normalization rules
- `artifact_id` and `document_id` normalize to `subject_id`
- `wizard_id`, `message_id`, `usage_event` identity, `scheduler_pass_id`, `safe_point_id`, `remediation_root_id`, and similar canonical objects normalize to `object_kind` + `object_id`
- `wizard_step` is not a primary selector
- `usage_event_ref` is not a primary selector field

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/usage-feature.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- Several existing payloads still imply multiple competing selectors in the same navigation action.
- `resume_url` flows still encode wizard-step detail more concretely than the general route contract.
- Usage/artifact flows still read as if `usage_event_ref` can stay a first-class top-level route selector instead of normalizing into object identity.

### Candidate fixes to carry forward
- State the precedence rule directly in `Contracts_V0.md`.
- Reject multi-selector route payloads as non-canonical.
- Normalize all special-case ids into `subject_id` or `object_kind` + `object_id` before they enter the canonical route layer.

### Do-not-forget details
- One route, one primary selector.
- Scope and focus fields are not selector identity.
- If the route layer allows multiple competing selectors, drift returns immediately.

## Research Progress - 2026-03-17 - `resume_url` serialization boundaries

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/assistant-chat-design.md`
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`

### Key findings
- `resume_url` is a serialized transport of `route_target`.
- `resume_url` must stay narrower than the internal route contract.
- The serialized form carries:
  - stable primary selector identity
  - required scope when needed
  - narrow anchor detail when the flow requires it
- The serialized form does not carry:
  - shell layout state
  - panel widths
  - widget state
  - broad filter state
  - provider/account disclosure data

### Serialization rule
- internal canonical contract:
  - `route_target`
- serialized transport:
  - `resume_url`
- `resume_url` decodes into `route_target`
- `resume_url` does not define a second routing ontology

### Good serialized fields
- `project_id`
- `subject_id`
- or `object_kind` + `object_id`
- `thread_id` when thread scope is required
- `focused_run_id` when run scope is required
- narrow anchor detail such as wizard-step focus when the workflow requires exact resumption

### Bad serialized fields
- `active_subview`
- compare target
- widget configuration
- panel docking state
- split ratios
- generic filter bags
- wide inspector expansion state

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
