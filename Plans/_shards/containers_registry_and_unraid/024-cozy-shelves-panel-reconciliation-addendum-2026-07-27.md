# Shard 024: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L5994-L6411

Source SHA256: `0be86b25e53eb4e94f36845b4bb84451ea5a6689a18d56bd0f5eff0af17a13e2`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

The Cozy Shelves left-rail concept review (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html`, both SOURCE-LINEAGE-ONLY design references whose HTML/CSS/class names must never be copied into spec or product) exposed spec gaps in this owner doc: compose-file editing had no editor-handoff canon, the Docker/Hosts routed page had no Compose subview, the local-runtime reason-code enum existed in two divergent "canonical" lists, compose scenarios lacked a typed object schema and event family, the template-repo status model carried two unreconciled state vocabularies, per-row expander presentation had no binding to the shared expander contract, and daemon-unreachable conditions collapsed into one undiagnosed error. This addendum closes those gaps as PlanUnits CRAU-093 through CRAU-099, citing user decisions ratified 2026-07-27 (six Docker Manager subview tabs with distinct glyphs and abbreviated mid-width labels; rail width envelope 240px min / 480px max / 280px default owned by FinalGUISpec; implementation base is the c2 concept files patched in place). Supersession is expressed only through new successor units; no existing PlanUnit block, preserved token, or retired bridge is edited. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### CRAU-093 - Compose File Editing Handoff Canon

```yaml
plan_unit_id: CRAU-093
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The Docker Manager `Compose` subview is a compose identity and selection surface, never a YAML
  editing surface. The subview discloses the compose project name, the inferred or explicitly
  selected compose file path, the active env-file selection, and the active profiles using the
  requested-vs-effective disclosure grammar. Editing the compose file or an env file hands off to
  the main editor through `cmd.docker.compose.open_file`, which resolves the selected compose file
  (or an explicit env-file argument) through the shared open-file/route-target contract to the
  owning editor surface; Docker Manager does not re-own file, editor, or LSP behavior. In-panel
  YAML editing is out of scope permanently, and Puppet Master never regenerates, rewrites, or
  round-trips user compose YAML from a parsed object model. Compose validation failures
  (`compose_invalid`, `compose_service_missing`) render as reason-coded rows whose repair path is
  the editor handoff, not in-panel mutation.
gui_related: true
gui_classification_reason: Compose identity disclosure and the edit-in-editor handoff are user-visible Docker Manager subview behavior.
depends_on: [CRAU-016]
unblocks: [CRAU-094, CRAU-096]
acceptance_criteria:
  - The Compose subview shows compose project name, inferred or selected compose file path, env-file selection, and active profiles.
  - cmd.docker.compose.open_file routes the compose or env file to the owning editor surface through the shared open-file/route-target contract.
  - No in-panel YAML editing surface exists in the Docker Manager side panel or any Compose subview, and none is planned as a later phase.
  - User compose YAML is never regenerated or rewritten from a parsed model; PM writes no compose YAML it did not author.
  - compose_invalid and compose_service_missing rows link repair to the editor handoff with file/line context where knowable.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future compose subview identity-disclosure and editor-handoff fixtures
risk_class: compose_editing_ownership_drift
reasoning_tier: high
context_scope: docker_compose_editing_handoff
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
node_compile_hint:
  mode: compose_editing_handoff_canon
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only, never copy HTML/CSS/class names)
  - Plans/Containers_Registry_and_Unraid.md:146-148
  - Plans/Containers_Registry_and_Unraid.md:216
  - user decision 2026-07-27 (Cozy Shelves panel review; implementation base is the c2 concept files patched in place)
preserved_exact_tokens: ["cmd.docker.compose.open_file", "compose_invalid", "compose_service_missing"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not embed a YAML editor in the Docker Manager side panel or any Compose subview.
  - Do not regenerate, rewrite, or round-trip user compose YAML from a parsed model.
  - Do not bypass the owning editor surface for compose or env-file editing.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
```

### CRAU-094 - Docker/Hosts Compose Subview Successor

```yaml
plan_unit_id: CRAU-094
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Successor amendment to CRAU-092, scoped to the Docker/Hosts subview enumeration and route
  payload vocabulary only. The Docker/Hosts routed primary-content page adds `Compose` as a
  first-class subview alongside Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions,
  Access & Ports, Receipts & Artifacts, and Settings. The route payload `subview` vocabulary
  admits `compose`, and `focus_kind` admits `compose_project` and `compose_scenario`, so scenario
  detail, staleness/repair state, and per-service views too large for the small Docker side panel
  open on the routed page instead of being trapped in the panel. All other CRAU-092 boundaries -
  Docker Manager as operational owner and Activity Bar side-panel owner, no new Activity Bar slot,
  no separate Unraid panel, PM identities over raw backend ids, no PMConcept/Coasts transplant -
  remain unchanged and are not re-owned or re-decided here.
gui_related: true
gui_classification_reason: The Compose subview and its route payload vocabulary are user-visible Docker/Hosts page structure and navigation.
depends_on: [CRAU-092, CRAU-093]
unblocks: []
acceptance_criteria:
  - This unit supersedes only the CRAU-092 subview enumeration and route payload subview/focus_kind vocabulary; the CRAU-092 unit body is not edited.
  - Docker/Hosts exposes a Compose subview reachable through the existing routed-page entry points.
  - Route payloads admit subview "compose" and focus_kind values "compose_project" and "compose_scenario".
  - Compose scenario detail and repair surfaces too large for the side panel open on the routed page.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker/Hosts compose subview routing fixtures
risk_class: docker_hosts_owner_routing_drift
reasoning_tier: high
context_scope: docker_hosts_compose_subview
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - future Docker/Hosts native Slint page
node_compile_hint:
  mode: docker_hosts_compose_subview_successor
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)
  - Plans/Containers_Registry_and_Unraid.md CRAU-092
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["Docker/Hosts", "Compose", "compose_project", "compose_scenario", "focus_kind"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit the CRAU-092 unit body; supersession is carried by this successor unit only.
  - Do not create a new Activity Bar slot, a separate Unraid panel, or a Coasts/PMConcept transplant through this subview.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-095 - Local-Runtime Reason-Code Enum Reconciliation

```yaml
plan_unit_id: CRAU-095
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The section 2B prose list is the single canonical local-runtime reason-code base enum:
  runtime_context_missing, runtime_context_unreachable, compose_invalid, compose_service_missing,
  buildx_unavailable, bake_unavailable, image_missing, container_unhealthy, access_url_unresolved,
  k8s_context_missing, k8s_context_unreachable, k8s_namespace_missing, and k8s_rollout_blocked.
  The variant codes carried by CRAU-017 acceptance criteria (container_unreachable, port_unbound,
  auth_expired, registry_unreachable, project_not_containerized) and by the 2026-07-08 FABLE alias
  repair (compose_file_missing, permission_denied, unknown) are compatibility vocabulary: they
  remain valid as registered typed extensions and normalization inputs under the existing
  typed-extension rule, but they do not constitute a second canonical base enum. New shared
  contracts and GUI consumers bind to the canonical base plus registered typed extensions, never
  to panel-local prose codes.
gui_related: false
gui_classification_reason: Reason-code enum adjudication is contract vocabulary; visible rendering rules are owned by the existing blocked/disabled-state units.
depends_on: [CRAU-017]
unblocks: [CRAU-099]
acceptance_criteria:
  - The section 2B thirteen-code list is declared the canonical local-runtime reason-code base enum.
  - CRAU-017 variant codes and the 2026-07-08 FABLE alias set are classified as compatibility vocabulary admitted only through the typed-extension rule.
  - No consumer treats the compatibility vocabulary as a second canonical base enum.
  - Unknown or provider-new codes continue to extend the typed namespace without becoming free-form UI copy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future local-runtime reason-code normalization fixtures
risk_class: reason_code_enum_drift
reasoning_tier: high
context_scope: local_runtime_reason_code_reconciliation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: local_runtime_reason_code_reconciliation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:196
  - Plans/Containers_Registry_and_Unraid.md CRAU-017 acceptance criteria
  - Plans/Containers_Registry_and_Unraid.md FABLE Deferred Action Concrete Repair Addendum - 2026-07-08
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["runtime_context_missing", "runtime_context_unreachable", "compose_invalid", "compose_service_missing", "buildx_unavailable", "bake_unavailable", "image_missing", "container_unhealthy", "access_url_unresolved", "k8s_context_missing", "k8s_context_unreachable", "k8s_namespace_missing", "k8s_rollout_blocked"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit CRAU-017 or the FABLE repair addendum; their variant codes are reclassified by this successor unit only.
  - Do not admit compatibility codes into new shared contracts as base enum members.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-096 - Compose Scenario Object Schema And Event Family

```yaml
plan_unit_id: CRAU-096
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Compose scenarios are typed objects persisted in `container_manager.project_state.{project_id}`.
  The scenario schema is scenario_id, name, service_subset[], profiles[], env_file_refs[],
  port_maps[], detach_default, log_follow_default, and a staleness fingerprint computed as a
  compose config-hash over the resolved compose configuration for the selected compose file,
  profiles, and env files. A fingerprint mismatch marks the scenario stale and opens it degraded
  with validation errors plus repair actions per the existing scenario-runner contract; run, edit,
  and delete stay disabled with exact reason codes until validation succeeds. Scenario CRUD and
  run activity emit the event family docker.compose.scenario.saved, docker.compose.scenario.run,
  docker.compose.scenario.edited, and docker.compose.scenario.deleted, registered through
  Contracts_V0.md; persisted payload schemas remain owned by storage-plan.md.
gui_related: false
gui_classification_reason: The scenario object schema and event family are contract/storage semantics; scenario presentation is consumed by CRAU-098 and the routed page.
depends_on: [CRAU-042, CRAU-093]
unblocks: []
acceptance_criteria:
  - The scenario schema carries scenario_id, name, service_subset[], profiles[], env_file_refs[], port_maps[], detach_default, and log_follow_default.
  - Staleness is a compose config-hash fingerprint over the resolved compose configuration; mismatch marks the scenario stale and degraded, never silently broken.
  - docker.compose.scenario.saved/run/edited/deleted are registered through Contracts_V0.md before GUI or runtime consumers depend on them.
  - Scenario lists persist in container_manager.project_state.{project_id}; persisted payload schemas are owned by storage-plan.md.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future compose scenario schema and staleness-fingerprint fixtures
risk_class: scenario_schema_drift
reasoning_tier: high
context_scope: compose_scenario_object_schema
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: compose_scenario_schema_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:148
  - Plans/Containers_Registry_and_Unraid.md:204
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["scenario_id", "service_subset", "env_file_refs", "port_maps", "compose config-hash", "docker.compose.scenario.saved", "docker.compose.scenario.run", "docker.compose.scenario.edited", "docker.compose.scenario.deleted", "container_manager.project_state.{project_id}"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not emit scenario events that are not registered through Contracts_V0.md.
  - Do not store transient runtime observations inside the scenario object as canonical state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CRAU-097 - Template-Repo Status Model Adjudication

```yaml
plan_unit_id: CRAU-097
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The 2026-07-08 FABLE chain - unknown -> clean -> dirty -> committed -> ready_to_push -> pushed,
  with failure states conflict, auth_required, and remote_rejected - is canonical for UI labels on
  template-repo status rows; CRAU-070 labels stay on this chain. The CRAU-063 nine-state enum
  remains the persisted backend state vocabulary and maps deterministically onto the UI chain:
  unconfigured renders as unknown with the setup CTA; config_invalid renders as unknown with
  remediation and blocked chain progress; clean renders as clean; dirty_uncommitted renders as
  dirty; needs_review renders as dirty with a review-blocked badge and auto-push blocked;
  committed_local_only renders as committed, advancing to the ready_to_push label when push
  preconditions validate (auth valid, remote not diverged); push_in_progress renders as
  ready_to_push with an in-flight marker and duplicate push disabled; a successful push renders
  the transient pushed label before revalidation settles on clean; push_failed renders the
  auth_required or remote_rejected failure label per error class with the local commit preserved;
  diverged_remote renders the conflict failure label requiring review/reconcile. Transitions into
  and out of unconfigured and config_invalid are defined: enabling managed publishing with no repo
  enters unconfigured; completing setup validation exits to clean, or dirty_uncommitted if a
  managed diff already exists; a settings edit or failed revalidation from any state enters
  config_invalid; config_invalid exits only through successful revalidation to the state implied
  by the working tree.
gui_related: true
gui_classification_reason: UI label adjudication and the backend-to-label mapping are user-visible template-repo status row behavior.
depends_on: [CRAU-063, CRAU-070]
unblocks: []
acceptance_criteria:
  - Template-repo status rows label states from the FABLE six-state chain plus its failure states, never raw nine-state enum names.
  - Every CRAU-063 state has exactly one mapping into the UI chain as stated in canonical_text.
  - unconfigured and config_invalid have defined entry and exit transitions covering setup, revalidation, and settings edits.
  - The nine-state enum remains the persisted backend vocabulary; neither enum is deleted or edited in place.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future template-repo status mapping fixtures
risk_class: template_status_drift
reasoning_tier: high
context_scope: template_repo_status_adjudication
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: template_repo_status_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:772-834
  - Plans/Containers_Registry_and_Unraid.md CRAU-063, CRAU-070
  - Plans/Containers_Registry_and_Unraid.md FABLE Deferred Action Concrete Repair Addendum - 2026-07-08
  - Plans/Containers_Registry_and_Unraid.md:5990 (registry_line 240 deferred row; closed by this unit)
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["unconfigured", "config_invalid", "clean", "dirty_uncommitted", "committed_local_only", "push_in_progress", "push_failed", "diverged_remote", "needs_review", "ready_to_push", "auth_required", "remote_rejected"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit CRAU-063, CRAU-070, or the FABLE repair addendum; adjudication is carried by this successor unit only.
  - Do not surface raw nine-state enum names as UI labels.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-098 - Docker Manager Six-Tab And Expander Presentation Consumption

```yaml
plan_unit_id: CRAU-098
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Per user decision 2026-07-27, the Docker Manager side panel presents six stable subview tabs -
  Containers, Images, Compose, Registries, Build / Bake, and Publish / Unraid - each with a
  distinct glyph (including a Compose glyph distinct from Containers), icon-only presentation at
  narrow widths, abbreviated mid-width labels (for example Build, Publish), and full labels when
  width allows, fitting the rail width envelope owned by FinalGUISpec (240px min / 480px max /
  280px default; 220px is test-only adversarial). The conditional Kubernetes subview keeps its
  section 2C detection and visibility canon and does not become a seventh permanent tab. Container
  rows, per-service compose rows, image rows, registry rows, and scenario rows consume the shared
  unified expander contract owned by the Plans/FinalGUISpec.md Cozy Shelves Panel Reconciliation
  Addendum (2026-07-27): rows collapsed by default; the row header is a single accessible button
  carrying aria-expanded; the expanded body renders slots in the order kv-facts, status-detail,
  blocked-reason-detail, actions, overflow; the body caps near 200px with internal scroll; blocked
  reasons stay visible outside the collapsible body; destructive actions route through the shared
  confirm surface; blocked payloads carry blocked_reason_code plus ordered allowed_action_ids[].
  This unit is a consumption note and does not re-own the expander contract or the width envelope.
gui_related: true
gui_classification_reason: Tab structure, glyphs, label abbreviation, and expander row consumption are user-visible Docker Manager panel presentation.
depends_on: [CRAU-092, CRAU-093]
unblocks: []
acceptance_criteria:
  - Docker Manager shows exactly six stable subview tabs with distinct glyphs and width-adaptive labels per the 2026-07-27 user decision.
  - The Kubernetes subview remains conditional per section 2C and is not a seventh permanent tab.
  - Docker Manager rows bind to the shared unified expander contract, including slot order, body cap, always-visible blocked reasons, shared confirm surface, and blocked_reason_code plus ordered allowed_action_ids[] payloads.
  - The expander contract and rail width envelope are consumed, not re-owned, by this doc.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker Manager tab-fit and expander consumption fixtures
risk_class: panel_presentation_drift
reasoning_tier: standard
context_scope: docker_manager_panel_presentation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: docker_manager_presentation_consumption
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only, never copy HTML/CSS/class names)
  - Plans/Containers_Registry_and_Unraid.md:128-136
  - user decision 2026-07-27 (six subview tabs, distinct glyphs, abbreviated mid-width labels; rail width envelope 240/480/280)
preserved_exact_tokens: ["Containers", "Images", "Compose", "Registries", "Build / Bake", "Publish / Unraid", "aria-expanded", "blocked_reason_code", "allowed_action_ids"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not re-own the unified expander contract or the rail width envelope in this doc.
  - Do not copy c2-cozy-shelves HTML/CSS/class names into spec or product surfaces.
  - Do not promote the conditional Kubernetes subview to a permanent seventh tab through presentation work.
compatibility_only_notes:
  - "Slint compatibility: tabs and expander rows render as opaque precomputed surfaces with transform-driven expand/collapse; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; any glass treatment uses a single pre-blurred wallpaper asset."
owner_boundary_notes:
  - "The unified expander contract is owned by the Plans/FinalGUISpec.md Cozy Shelves Panel Reconciliation Addendum (2026-07-27); this unit only binds Docker Manager rows to it."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-099 - Daemon Unreachable Diagnosis States Per Context

```yaml
plan_unit_id: CRAU-099
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager classifies daemon-unreachable conditions per runtime context with a typed
  diagnosis sub-classification carried inside the canonical reason-code payload for
  runtime_context_missing and runtime_context_unreachable: not_installed, not_running,
  socket_permission, ssh_auth_failed, and wrong_context. Each diagnosis state carries exactly one
  primary recovery action: not_installed opens setup guidance; not_running offers start-and-retry;
  socket_permission opens socket-permission remediation guidance; ssh_auth_failed re-runs SSH
  auth validation with the exact failing ssh-agent/key step disclosed; wrong_context offers
  switch-context. Remote SSH contexts, including the Unraid host path, preflight the
  ssh-agent/key check before daemon probes so failures name the SSH step instead of a generic
  connect error. Diagnosis states are payload fields, not new base enum members and not
  panel-local prose; while a context is unreachable the panel keeps rendering cached last-known
  state with the stale marker and read-only posture from section 2A.
gui_related: true
gui_classification_reason: Per-context unreachable diagnosis, single recovery actions, and stale read-only rendering are user-visible panel behavior.
depends_on: [CRAU-091, CRAU-095]
unblocks: []
acceptance_criteria:
  - Daemon-unreachable states classify as not_installed, not_running, socket_permission, ssh_auth_failed, or wrong_context per runtime context.
  - Each diagnosis state exposes exactly one primary recovery action as stated in canonical_text.
  - Remote SSH contexts preflight ssh-agent/key checks and disclose the exact failing step.
  - Diagnosis states travel as typed payload fields under the canonical reason codes, never as new base enum members or free-form prose.
  - Unreachable contexts render cached last-known state with stale marker and read-only posture.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future per-context daemon-unreachable diagnosis fixtures
risk_class: daemon_diagnosis_gap
reasoning_tier: standard
context_scope: docker_daemon_unreachable_diagnosis
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: daemon_unreachable_diagnosis_states
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Cozy Shelves panel review research digest - 2026-07-27 (vscode-docker/vscode-containers unreachable-daemon issue corpus)
  - Plans/Containers_Registry_and_Unraid.md:144
  - Plans/Containers_Registry_and_Unraid.md:196
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["not_installed", "not_running", "socket_permission", "ssh_auth_failed", "wrong_context", "runtime_context_unreachable"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not add diagnosis states to the canonical reason-code base enum; they are payload sub-classification only.
  - Do not render a generic connect error where a per-context diagnosis is resolvable.
  - Do not blank the panel while unreachable; cached last-known state renders with stale marker and read-only posture.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```
