# Shard 019: PlanUnits

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L994-L5654

Source SHA256: `0be86b25e53eb4e94f36845b4bb84451ea5a6689a18d56bd0f5eff0af17a13e2`

---

## PlanUnits

### CRAU-002 - Document Scope And Owner Boundaries

```yaml
plan_unit_id: CRAU-002
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containers, Registry, and Unraid Integration is the SSOT for DockerHub
  authentication UX and state, requested-vs-effective Docker auth capability,
  namespace/repository discovery and creation, protected repository creation,
  first-class Docker Manager GUI behavior, Unraid template workflows, and
  ca_profile.xml; it supplies detailed contracts to newtools, FinalGUISpec, and
  Orchestrator_Page without replacing those owner docs.
gui_related: true
gui_classification_reason: The scope names DockerHub authentication UX, first-class Docker management GUI behavior, settings, controls, dialogs, and orchestrator surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0002-S0003 mix canonical scope with owner/consumer routing across runtime, settings, and orchestrator docs.
depends_on: []
unblocks: [CRAU-003, CRAU-004, CRAU-007, CRAU-024]
acceptance_criteria:
  - DockerHub auth UX/state, requested-vs-effective Docker auth, repository management, protected creation, Docker Manager GUI behavior, Unraid workflow, and ca_profile.xml remain individually traceable to this owner doc.
  - Plans/newtools.md, Plans/FinalGUISpec.md, and Plans/Orchestrator_Page.md reference this plan for detailed DockerHub, Docker Manager, and Unraid behavior without re-owning those contracts.
  - Plans/feature-list.md and Plans/GUI_Rebuild_Requirements_Checklist.md register the first-class GUI/runtime scope introduced here.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: containers_registry_unraid_owner_boundaries
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: owner_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0003
preserved_exact_tokens:
  - "DockerHub authentication UX and state modeling"
  - "Requested vs effective Docker auth capability"
  - "Protected repository-creation rules"
  - "First-class Docker management GUI behavior"
  - "`ca_profile.xml`"
  - "Docker Manage surface requirements"
negative_constraints:
  - "This plan does not replace the existing preview/build/runtime sections in `Plans/newtools.md`, the settings UI in `Plans/FinalGUISpec.md`, or the orchestrator control surface in `Plans/Orchestrator_Page.md`."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
```

### CRAU-003 - First-Class Container Workflow Goals

```yaml
plan_unit_id: CRAU-003
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master treats Docker as a first-class workflow: users can authenticate
  through browser login or PAT, build and run containers, inspect running
  containers in-app, publish to DockerHub, safely create missing repositories,
  generate or update Unraid XML after successful publish by default, manage a
  dedicated Unraid template repository by default, keep secrets out of redb,
  project files, and evidence logs, and keep Docker GUI controls contextual.
gui_related: true
gui_classification_reason: The goals include user authentication paths, in-app inspection, publishing workflow, and contextual GUI visibility.
split_recommended: false
depends_on: [CRAU-002]
unblocks: [CRAU-004, CRAU-007, CRAU-025, CRAU-026]
acceptance_criteria:
  - Docker remains a first-class workflow rather than a small extension of generic Preview/Build.
  - Browser login and PAT authentication remain available, with PAT preserved as an explicit durable path.
  - Build, run, publish, missing-repository creation, Unraid XML generation, and managed template-repository handling remain goals of the same feature area.
  - Secrets are not written to redb, project files, or evidence logs.
  - Docker-heavy controls remain contextual instead of permanently cluttering non-container projects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_regression
reasoning_tier: standard
context_scope: first_class_container_workflow_goals
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: product_goal_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0004
preserved_exact_tokens:
  - "browser-based login"
  - "PAT"
  - "build and run containers"
  - "publish to DockerHub"
  - "automatically generate/update Unraid XML"
  - "managed template-repo handling"
  - "redb"
  - "evidence logs"
negative_constraints:
  - "Docker support must not collapse back into generic Preview/Build-only behavior."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-004 - Containers And Registry Runtime Settings

```yaml
plan_unit_id: CRAU-004
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Settings > Advanced > Containers & Registry exposes Docker runtime controls:
  the runtime selector with docker default, Docker binary path override, compose
  file/path defaults, compose project-name strategy values auto, fixed, and
  hash-based, build context path, Dockerfile path, optional target stage, target
  platforms, and Buildx readiness status.
gui_related: true
gui_classification_reason: This unit defines visible settings controls and status display.
split_recommended: true
split_recommendation_reason: Source span S0006 also contains DockerHub auth, repository, Unraid, visibility, and ca_profile.xml settings split into adjacent units.
depends_on: [CRAU-002, CRAU-003]
unblocks: [CRAU-005, CRAU-006, CRAU-011]
acceptance_criteria:
  - The runtime selector defaults to docker.
  - Docker binary path override, compose defaults, build context path, Dockerfile path, optional target stage, target platforms, and Buildx readiness remain individually addressable.
  - Compose project-name strategy preserves the exact values auto, fixed, and hash-based.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_surface_drift
reasoning_tier: standard
context_scope: containers_registry_runtime_settings
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/newtools.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
preserved_exact_tokens:
  - "Settings > Advanced > Containers & Registry"
  - "`docker` default"
  - "`auto`"
  - "`fixed`"
  - "`hash-based`"
  - "Buildx readiness status"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-005 - DockerHub Auth And Repository Settings

```yaml
plan_unit_id: CRAU-005
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containers & Registry settings expose DockerHub browser-login, PAT entry with
  PAT-recommended helper/link text, stored-auth status, account/namespace
  summary, validation and clear/remove credential actions, validate and /clear
  auth actions, requested auth mode versus effective capability display,
  namespace/repository discovery, refresh, create repository action, a
  settings-level create-repository toggle distinct from mandatory remote
  confirmation, repository privacy, tag template defaults, and push policy.
gui_related: true
gui_classification_reason: DockerHub auth and repository controls are visible settings and action surfaces.
split_recommended: true
split_recommendation_reason: Source span S0006 combines auth controls, repository controls, runtime controls, and Unraid/template profile settings.
depends_on: [CRAU-004]
unblocks: [CRAU-026, CRAU-029, CRAU-030, CRAU-031]
acceptance_criteria:
  - Browser-login and PAT entry controls both remain present.
  - Helper text explicitly says PAT is recommended and links or explains how to obtain a PAT.
  - Requested auth mode and effective capability are displayed distinctly.
  - The settings-level create-repository toggle remains distinct from mandatory confirmation when repository creation becomes a remote side effect.
  - Tag template defaults preserve {commit}, {version}, {timestamp}, and future canonical tag variables.
  - Push policy preserves manual default and optional after_build.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_capability_misrepresentation
reasoning_tier: high
context_scope: dockerhub_auth_repository_settings
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
preserved_exact_tokens:
  - "browser-login button"
  - "PAT entry field"
  - "PAT is recommended"
  - "`/clear` auth actions"
  - "requested auth mode vs effective capability display"
  - "create-repository toggle"
  - "`{commit}`"
  - "`{version}`"
  - "`{timestamp}`"
  - "`manual` default"
  - "`after_build`"
negative_constraints:
  - "The settings-level create-repository toggle must not replace protected confirmation for remote repository creation."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
```

### CRAU-006 - Unraid Visibility And Maintainer Profile Settings

```yaml
plan_unit_id: CRAU-006
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containers & Registry settings expose Unraid publishing controls, managed
  template repository controls, Docker Manager visibility controls, and
  maintainer profile ca_profile.xml controls: Generate/Update Unraid XML after
  successful publish is enabled by default, Manage Unraid template repository is
  enabled by default, auto-push is disabled by default, a one-click push action
  remains available, Hide Docker Manager when not used in Project. is the
  canonical visibility setting, the legacy Hide Docker Manage label migrates to
  it, and ca_profile.xml supports shared default scope, per-project overrides,
  full editability, profile image handling, and generated-needs-review notice.
gui_related: true
gui_classification_reason: This unit defines visible settings controls, status rows, labels, toggles, and maintainer profile editing.
split_recommended: true
split_recommendation_reason: Source span S0006 combines multiple settings groups; this unit isolates Unraid, visibility, and ca_profile.xml controls.
depends_on: [CRAU-004, CRAU-005]
unblocks: [CRAU-022, CRAU-031]
acceptance_criteria:
  - Generate/Update Unraid XML after successful publish defaults enabled.
  - Manage Unraid template repository defaults enabled.
  - Auto-push defaults disabled while a one-click push action is surfaced nearby.
  - Template repo status row preserves configured, missing, dirty, committed, and ready-to-push states.
  - The exact setting name Hide Docker Manager when not used in Project. is canonical.
  - The legacy setting alias Hide Docker Manage when not used in Project. migrates to the canonical Docker Manager label and is not a separate surface.
  - ca_profile.xml supports shared cross-project default, per-project override, all fields, upload/select or URL image handling, and generated-needs-review notice.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: alias_or_default_drift
reasoning_tier: high
context_scope: unraid_visibility_maintainer_profile_settings
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
preserved_exact_tokens:
  - "`Generate/Update Unraid XML after successful publish`"
  - "`Manage Unraid template repository`"
  - "auto-push toggle (default: disabled)"
  - "`Hide Docker Manager when not used in Project.`"
  - "`Hide Docker Manage when not used in Project.`"
  - "`ca_profile.xml`"
compatibility_only_notes:
  - "The legacy Hide Docker Manage setting alias migrates to the canonical Docker Manager label and is not a separate surface."
negative_constraints:
  - "The legacy setting alias must not create a second Docker Manage settings surface."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-007 - Docker Manager Surface Identity And Subviews

```yaml
plan_unit_id: CRAU-007
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The canonical user-facing surface is Docker Manager. It replaces Docker Manage
  as the canonical surface name, subsumes Publish / Unraid behavior, and keeps
  stable subviews for Containers, Images, Compose, Registries, Registries /
  Docker Hub, Build / Bake, Publish / Unraid, Publishing / Unraid as a
  legacy/source-lineage alias, advanced Networks, Volumes, Contexts, and
  project-focused Kubernetes.
gui_related: true
gui_classification_reason: Docker Manager and its subviews are user-facing GUI surfaces and navigation contracts.
split_recommended: true
split_recommendation_reason: Source span S0007 also defines surface rules, minima, and design-reference baseline split into CRAU-008.
depends_on: [CRAU-002, CRAU-003]
unblocks: [CRAU-008, CRAU-009, CRAU-022]
acceptance_criteria:
  - Docker Manager remains the canonical surface name.
  - Docker Manage remains only the replaced legacy/source-lineage name.
  - Publish / Unraid is subsumed inside Docker Manager.
  - All stable subviews and advanced foldouts remain named and routeable.
  - Publishing / Unraid remains a legacy/source-lineage alias normalized to Publish / Unraid.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: surface_fragmentation
reasoning_tier: high
context_scope: docker_manager_surface_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: gui_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0007
preserved_exact_tokens:
  - "Docker Manager"
  - "`Docker Manage`"
  - "`Containers`"
  - "`Images`"
  - "`Compose`"
  - "`Registries`"
  - "`Registries / Docker Hub`"
  - "`Build / Bake`"
  - "`Publish / Unraid`"
  - "`Publishing / Unraid`"
  - "`Networks`"
  - "`Volumes`"
  - "`Contexts`"
  - "`Kubernetes`"
compatibility_only_notes:
  - "`Publishing / Unraid` is a legacy/source-lineage alias normalized to `Publish / Unraid`."
negative_constraints:
  - "Docker Manage must not remain a separate canonical surface."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-008 - Docker Manager Surface Rules And Management Baseline

```yaml
plan_unit_id: CRAU-008
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager keeps Docker as the default visible runtime mode for
  Docker-related projects, treats Podman as an alternate runtime in the same
  surface, exposes Kubernetes as a conditional subview, keeps Unraid under
  Publish / Unraid, treats Docker Hub as one registry/provider capability, and
  must not split build, bake, compose, run, inspect, logs, publish, pull,
  Registries / Docker Hub, or Publishing / Unraid into unrelated mini-surfaces;
  its management baseline follows microsoft/vscode-containers, while
  docker/vscode-extension remains a Docker DX/build-debugging reference.
gui_related: true
gui_classification_reason: Surface rules, subview minima, and management baseline govern visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0007 is split between surface identity and detailed surface rule/baseline behavior.
depends_on: [CRAU-007]
unblocks: [CRAU-009, CRAU-011, CRAU-012, CRAU-013, CRAU-014]
acceptance_criteria:
  - Docker is default visible runtime mode when the project is Docker-related.
  - Podman remains inside the same Docker Manager surface.
  - Kubernetes is a subview when manifests, Helm artifacts, kube-linked state, or explicit enablement are present.
  - Unraid remains under Publish / Unraid and does not require a separate top-level panel.
  - Docker Hub is one registry/provider capability inside Docker Manager.
  - Build, bake, compose, run, inspect, logs, publish, pull, Registries / Docker Hub, and Publishing / Unraid do not split into unrelated mini-surfaces.
  - microsoft/vscode-containers is the richer day-to-day management baseline and docker/vscode-extension is the Docker DX/build-debugging reference.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mini_surface_drift
reasoning_tier: high
context_scope: docker_manager_surface_rules
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: gui_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0007
preserved_exact_tokens:
  - "Podman"
  - "Docker Hub"
  - "mini-surfaces"
  - "`docker/vscode-extension`"
  - "`/vscode-extension`"
  - "`microsoft/vscode-containers`"
  - "`/vscode-containers`"
negative_constraints:
  - "Docker Manager must not split build, bake, compose, run, inspect, logs, publish, pull, `Registries / Docker Hub`, or `Publishing / Unraid` into unrelated mini-surfaces."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-009 - Unified Asset Explorer And Panel State

```yaml
plan_unit_id: CRAU-009
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager owns the unified asset explorer: it keeps stable subviews for
  images, compose, registries, and build-bake, advanced foldouts for contexts,
  networks, volumes, and project-focused Kubernetes, project-aware ordering,
  cached /last-known read-only rendering with stale markers, disabled reasons,
  and per-project persisted selected runtime, context, subview, grouping, /sort,
  foldout policy, hidden foldouts, and exact asset row/subview state.
gui_related: true
gui_classification_reason: The unified asset explorer, subviews, cached stale rendering, disabled reasons, and row reopen behavior are visible GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 combines explorer GUI state, storage/event boundaries, build/compose, registry, publish, Kubernetes, receipts, routes, and blocked-state behavior.
depends_on: [CRAU-007, CRAU-008]
unblocks: [CRAU-010, CRAU-011, CRAU-013, CRAU-014, CRAU-019]
acceptance_criteria:
  - Preview, build, publish, deploy, and blocked-card flows reopen the exact relevant row/subview instead of a generic push-only pane.
  - Runtime-unavailable state renders cached /last-known state with a stale marker and read-only posture.
  - Unsupported runtime-specific subviews hide only when truly unavailable; otherwise they remain visible with disabled reason.
  - Strong default filtering and project awareness keep the broad surface usable while project-aware ordering pushes likely-relevant assets to the top without hiding the rest.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reopen_state_loss
reasoning_tier: high
context_scope: docker_manager_asset_explorer_state
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_state_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "unified asset explorer"
  - "`/images/compose/registries/build-bake`"
  - "`/sort`"
  - "`/last-known`"
  - "`likely-relevant`"
negative_constraints:
  - "Blocked-card flows must not land in a generic push-only pane when a precise asset row/subview is known."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-010 - Explorer Event And Runtime Observation Boundary

```yaml
plan_unit_id: CRAU-010
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager explorer events use /events/storage and /event/storage to
  record only panel state, selected asset identity, and freshness; transient
  runtime observations stay in the runtime projection store and do not become
  canonical persisted product truth.
gui_related: false
gui_classification_reason: This unit defines storage/event ownership and runtime projection boundaries rather than visible layout.
split_recommended: true
split_recommendation_reason: Source span S0008 interleaves GUI state with storage/event semantics.
depends_on: [CRAU-009]
unblocks: [CRAU-019]
acceptance_criteria:
  - Explorer storage records panel state, selected asset identity, and freshness only.
  - Transient runtime observations are not persisted as canonical state.
  - Runtime projection store remains the owner for transient runtime observations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_truth_drift
reasoning_tier: high
context_scope: docker_manager_event_storage_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: storage_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`/events/storage`"
  - "`/event/storage`"
  - "runtime projection store"
negative_constraints:
  - "Transient runtime observations must not become canonical stored product truth through explorer event storage."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-011 - Build Bake And Compose Scenario Contracts

```yaml
plan_unit_id: CRAU-011
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager build and compose surfaces infer reviewable Dockerfile, build
  context, compose file, Bake target, platform, and runtime context for the
  active project, expose cmd.docker.build.*, cmd.docker.bake, cmd.docker.bake.*,
  and preview commands, persist build target and readiness settings, prompt
  instead of guessing in ambiguous monorepos, and let Compose scenarios save and
  rerun named service subsets, profiles, env files, port mappings, validation
  state, stale repair actions, and cmd.docker.compose.scenario.save/run/edit/delete.
gui_related: true
gui_classification_reason: Build/Bake controls, smart CTA cards, Compose scenario UI, validation errors, and repair actions are visible workflow surfaces.
split_recommended: true
split_recommendation_reason: Source span S0008 combines build/bake and compose behavior with other Docker Manager contracts.
depends_on: [CRAU-009, CRAU-010]
unblocks: [CRAU-012, CRAU-013]
acceptance_criteria:
  - Build/Bake defaults remain reviewable and overrideable.
  - build_run and /push_image resolve to the selected compose or bake target instead of rebuilding from a guessed default.
  - Ambiguous polyglot or monorepo inference prompts explicit selection.
  - Compose scenarios persist named service subsets, profiles, env files, port mappings, detached/log-follow defaults, ports, and validation state.
  - Stale Compose scenarios open degraded with validation errors and repair actions.
  - Run/edit/delete affordances remain disabled with exact reason codes until validation succeeds.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: heuristic_misfire
reasoning_tier: high
context_scope: build_bake_compose_scenario_contracts
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: build_compose_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`Build / Bake`"
  - "`cmd.docker.build.*`"
  - "`cmd.docker.bake`"
  - "`cmd.docker.bake.*`"
  - "`build_run`"
  - "`/push_image`"
  - "`cmd.docker.compose.scenario.save/run/edit/delete`"
  - "`cmd.docker.compose.scenario.save`"
  - "`/run/edit/delete`"
negative_constraints:
  - "Docker Manager must prompt for explicit selection instead of guessing when inference is ambiguous in a polyglot or monorepo project."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-012 - Registry Promotion And Publish Chain Lineage

```yaml
plan_unit_id: CRAU-012
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion treats /tag/push and /push/promote as explicit release
  actions with digest-first receipts, source artifact identity, promotion
  target, destination registry allowlist, default namespace/repository/tag
  template, policy, privacy, immutability expectations, Docker-Hub-first MVP
  behavior, and later registry API abstraction; Publish chain view shows local
  build result, pushed tag and /digest, Docker Hub repo state, Unraid/template
  follow-ons, /publish/events, and downstream deployment or workload refs.
gui_related: true
gui_classification_reason: Promotion controls, publish chain view, chain nodes, blocked cards, and receipt links are visible Docker Manager surfaces.
split_recommended: true
split_recommendation_reason: Source span S0008 interleaves promotion, publish chain, and other operational cockpit contracts.
depends_on: [CRAU-009, CRAU-011]
unblocks: [CRAU-015, CRAU-021, CRAU-031]
acceptance_criteria:
  - Tag/push and push/promote are explicit release actions rather than ad hoc retagging.
  - Promotion receipts capture moved digest, tag, source namespace/repository, destination namespace/repository, actor, approval source, and result id before downstream deployment references update.
  - Local image actions remain usable when destination registry or repository is unavailable, while promotion is blocked with a precise remote blocker.
  - Publish chain nodes record build_result_id, publish_result_id, template repository status, deployment/workload refs, result state, expanded nodes, historical toggle, follow-latest default, and not-attempted/blocked/failed/complete state.
  - Digest-first identity prevents retags from corrupting lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: side_effect_lineage_loss
reasoning_tier: high
context_scope: registry_promotion_publish_chain_lineage
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: remote_side_effect_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`/tag/push`"
  - "`/push/promote`"
  - "`/target`"
  - "`/immutability`"
  - "`MVP`"
  - "`APIs`"
  - "`/digest`"
  - "`/publish/events`"
  - "`missing-link`"
negative_constraints:
  - "Downstream deployment references must not update before digest-first promotion lineage is captured."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-013 - Container Access Drift And Cleanup Safeguards

```yaml
plan_unit_id: CRAU-013
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager container rows and detail drawers expose
  cmd.docker.container.open, logs, shell attach, stats, inspect, URL candidates,
  manual override, and confidence state; drift detection compares Dockerfile,
  compose/bake intent, Kubernetes manifests, build metadata, last-published
  metadata, and last deployed state with unknown/partial evidence; cleanup
  advisor starts with dry-run estimates and never suggests deleting assets tied
  to active previews or recent receipts when the reference graph is partial.
gui_related: true
gui_classification_reason: Container row actions, URL candidates, warnings, compare actions, and cleanup advisor are user-visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 combines container access, drift, cleanup, and other cockpit contracts.
depends_on: [CRAU-009, CRAU-011]
unblocks: [CRAU-021]
acceptance_criteria:
  - Open running container and /open-container resolve only when a real container or preview session exists.
  - port-open, auto-follow, and auto-open are suggestions rather than silent actions.
  - Uncertain access heuristics show candidate actions or logs/inspect first.
  - Prior artifact metadata missing produces unknown rather than clean drift.
  - Weak drift warnings show the weak evidence behind the warning.
  - Cleanup recommendations default conservative when the reference graph is partial.
  - Destructive cleanup remains guarded by shared blocked-state rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: destructive_or_misleading_runtime_action
reasoning_tier: high
context_scope: container_access_drift_cleanup_safeguards
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: runtime_gui_guardrail
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`cmd.docker.container.open`"
  - "`Open running container`"
  - "`/open-container`"
  - "`port-open`"
  - "`auto-follow`"
  - "`auto-open`"
  - "`/compose/bake`"
  - "`last-published`"
  - "`/ignore-files`"
  - "`ignore-labels`"
  - "`/prune`"
negative_constraints:
  - "Docker Manager must not silently open guessed URLs or recommend deleting assets still tied to active previews or recent receipts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-014 - Project-Focused Kubernetes Operations

```yaml
plan_unit_id: CRAU-014
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager keeps Kubernetes project-focused rather than acting as a
  general cluster admin console: it preserves kubeconfig/context,
  namespace/workload focus, log viewer defaults, watch toggles, Helm visibility,
  Helm release focus, persisted K8s focus state, cluster-wide default off, and
  command coverage under cmd.docker.k8s.* with older cmd.k8s.* compatibility
  aliases normalized to the Docker Manager namespace.
gui_related: true
gui_classification_reason: Kubernetes subview focus, setup guidance, toggles, command coverage, and troubleshooting surfaces are GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 includes Kubernetes operations with other Docker Manager cockpit contracts.
depends_on: [CRAU-007, CRAU-009]
unblocks: [CRAU-015, CRAU-022]
acceptance_criteria:
  - Docker Manager's Kubernetes view defaults to the project-focused subset.
  - Full cluster inventory requires the explicit cluster-wide toggle and remains visually distinct from project scope.
  - Missing kubectl, kubeconfig, or cluster access leaves the subview visible with setup guidance and explicit connection state.
  - Deploy, rollout/apply, apply/rollout, log, exec, port_forward, Helm, and troubleshoot failures open directly to project-relevant workload status, logs, or diff.
  - Logs, rollout status, port-forward, and rollout monitors are ephemeral owner-surface sessions, not durable always-on connections.
  - Browser handoff is reserved for external registry, admin, or admin/help edge cases, not default local-runtime or Kubernetes operations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cluster_scope_creep
reasoning_tier: high
context_scope: project_focused_kubernetes_operations
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: k8s_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace`"
  - "`cmd.docker.k8s.apply|diff|logs|exec|port_forward|set_context|set_namespace|helm_preview|helm_install`"
  - "`cmd.docker.k8s.apply`"
  - "`cmd.k8s.*`"
  - "`cluster-wide`"
  - "`/attempt/action`"
negative_constraints:
  - "Docker Manager must not become a general cluster admin console or make full cluster inventory default."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-015 - Receipts Routes Blocked State And Governance

```yaml
plan_unit_id: CRAU-015
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager receipts, route/open handling, blocked-state integration,
  confirmation taxonomy, policy-blocked outcomes, registry/tag governance, and
  protected environment flows use shared contracts: receipts are compact UI
  objects derived from canonical run, publish, and event records; object-bearing
  navigation uses shared route targets instead of hidden panel-switch payloads;
  hard-gated remote-side-effect actions enter canonical approval or blocked
  flows; disabled controls expose reason, CTA, and Explain this state; and
  policy revalidation preserves exact remediation semantics.
gui_related: true
gui_classification_reason: Receipts, routes, disabled controls, blocked banners, CTAs, and Explain this state are user-visible interaction contracts.
split_recommended: true
split_recommendation_reason: Source span S0008 mixes GUI presentation with backend approval, policy, route, and receipt semantics; further splitting could duplicate tightly-coupled blocked-state invariants.
depends_on: [CRAU-009, CRAU-012, CRAU-014]
unblocks: [CRAU-021, CRAU-031]
acceptance_criteria:
  - Receipts record requested action, effective action, actor, targets, result ids, allowed action ids, approval source, executing subsystem, and source event ids.
  - Route/open adoption uses the shared target contract rather than treating object-bearing shell commands as local layout state.
  - cmd.panel.switch and panel-switch style commands select Docker Manager only as shell-state.
  - Hard-gated Docker, Unraid, and Kubernetes remote side effects enter canonical approval or blocked flow rather than generic UI confirmation.
  - Disabled controls remain explainable with exact blocking condition, missing capability, degraded reason, reason code, last validation time, and primary recovery CTA when one exists.
  - Policy, immutable-tag, protected-environment, and destination-policy violations preserve namespace/repository/tag or environment context and remediation pivots.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: policy_bypass_or_route_drift
reasoning_tier: high
context_scope: receipts_routes_blocked_state_governance
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/GitHub_Integration.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: blocked_state_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`allowed_action_ids[]`"
  - "`hard_gate`"
  - "`/blocked`"
  - "`Explain this state`"
  - "`target_kind`"
  - "`cmd.panel.switch`"
  - "`route-activation`"
  - "`reason_code`"
  - "`/receipts`"
negative_constraints:
  - "Docker Manager panels must not add one-off local recovery actions that drift from the shared blocked contract."
  - "Object-bearing targeting must route through the shared route/open target contract instead of extending panel-switch args."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
```

### CRAU-016 - Repo Root And Deep-Link Identity

```yaml
plan_unit_id: CRAU-016
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker and Kubernetes detection, panel state, restore behavior, repo
  selection, GitHub binding, manifest-source versus image-source references, and
  deep links are repo/root aware: panel state is keyed to repo/root identity,
  restores validate that the repo still exists, chooser state replaces silent
  rebinding, selection precedence is deterministic, hosted bindings use explicit
  remotes, and deep links resolve to normalized route targets rather than raw
  local IDs or one-off URL shapes.
gui_related: false
gui_classification_reason: This unit governs identity, routing, and storage semantics behind visible surfaces.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes backend identity routing with GUI-facing disclosure and row-action behavior split into adjacent units.
depends_on: [CRAU-015]
unblocks: [CRAU-017, CRAU-018, CRAU-019, CRAU-021]
acceptance_criteria:
  - Direct receipt or deep-link target wins repo-selection precedence before explicit panel selection, active run/tier repo, active editor repo, or chooser fallback.
  - Panels disclose whether a repo is pinned or inferred.
  - Hosted GitHub features bind through explicit remotes rather than nearest active repo fallback.
  - Docker/Kubernetes receipts distinguish manifest-source repo from image-source repo.
  - Docker Manager deep-link forms decode into the same internal routing path and must not expose raw local IDs as the routing contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_identity_drift
reasoning_tier: high
context_scope: repo_root_deep_link_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: identity_routing_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`repo_id`"
  - "`project_root_id`"
  - "`worktree_id`"
  - "`publish_result_id`"
  - "`k8s_ref`"
  - "`target_object`"
  - "`cmd.docker.open_target`"
negative_constraints:
  - "Docker Manager deep-link handling must not expose raw local IDs as the routing contract."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-017 - Runtime And Workload Identity State

```yaml
plan_unit_id: CRAU-017
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager runtime identity is durable and requested-vs-effective:
  k8s_workload_ref, container_id, compose_project, runtime_context, and
  workload_ref survive beyond preview_session_id, use delete/recreate history
  classification, local-runtime blocked/degraded reason codes, receipt
  joinability, and typed extension rules for reason codes.
gui_related: false
gui_classification_reason: Durable runtime and workload identity state is backend routing, history, and storage semantics.
split_recommended: true
split_recommendation_reason: Source span S0009 also contains visible identity disclosure, compatibility, and row-action rules.
depends_on: [CRAU-016]
unblocks: [CRAU-019, CRAU-021]
acceptance_criteria:
  - Kubernetes workload identity is subject-aware and survives delete/recreate by marking stale or historical instead of silently rebinding same-name replacements.
  - Local-runtime reason codes include runtime_context_missing, runtime_context_unreachable, compose_invalid, compose_service_missing, buildx_unavailable, bake_unavailable, image_missing, container_unreachable, port_unbound, auth_expired, registry_unreachable, and project_not_containerized.
  - Unknown/new provider codes extend the typed namespace without becoming free-form UI copy.
  - Runtime identity includes runtime_asset_ref, compose_project_ref, publish_result_id, template_repo_id, and k8s_workload_ref where applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_runtime_rebind
reasoning_tier: high
context_scope: runtime_workload_identity_state
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`k8s_workload_ref`"
  - "`container_id`"
  - "`compose_project`"
  - "`runtime_context`"
  - "`workload_ref`"
  - "`preview_session_id`"
  - "`runtime_asset_ref`"
  - "`compose_project_ref`"
  - "`template_repo_id`"
negative_constraints:
  - "A new Kubernetes object with the same name must not silently become the same workload in history."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-018 - Lane Package Effective Identity Disclosure

```yaml
plan_unit_id: CRAU-018
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager mirrors lane/package requested-versus-effective identity for
  account, provider, model, persona, runtime, and worker policy, records override
  source, selection_reason, switch and clamped history, and exposes user-facing
  grammar for Requested account, Requested binding, Effective account, and Switch
  reason so runtime identity divergence is visible.
gui_related: true
gui_classification_reason: The unit defines user-visible identity grammar, disclosures, and switch reason presentation.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes backend identity fields with GUI disclosure rules.
depends_on: [CRAU-016, CRAU-017]
unblocks: [CRAU-020, CRAU-021]
acceptance_criteria:
  - UI disclosure does not stop at persona, platform, or model when runtime identity diverges.
  - requested_account_binding, effective_account_binding, provider_instance_id, model_id, persona_id, runtime_target_id, worker_pool_policy, override source, selection_reason, and switch/clamped history remain available to Docker Manager projections.
  - Docker Manager uses the exact grammar Requested account, Requested binding, Effective account, and Switch reason.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_visibility_gap
reasoning_tier: high
context_scope: lane_package_effective_identity_disclosure
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Multi-Account.md
  - Plans/Personas.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: identity_disclosure_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`requested_account_binding`"
  - "`effective_account_binding`"
  - "`provider_instance_id`"
  - "`model_id`"
  - "`persona_id`"
  - "`runtime_target_id`"
  - "`worker_pool_policy`"
  - "`selection_reason`"
  - "`Requested account`"
  - "`Requested binding`"
  - "`Effective account`"
  - "`Switch reason`"
negative_constraints:
  - "Docker Manager UI must not hide runtime identity divergence behind persona/platform/model-only labels."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-019 - Project State And Projection Truth Boundary

```yaml
plan_unit_id: CRAU-019
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager project state preserves runtime asset, publish result, template
  repository, Kubernetes operation refs, compose scenarios, drift baselines,
  cleanup preferences, requested/effective runtime/build/compose/registry/K8s
  capability fields, and receipt joins under
  container_manager.project_state.{project_id}; dashboard, orchestrator, Docker
  Manager page and widget presentation, and source-control summaries are
  projections over canonical runtime facts, not separate truths.
gui_related: false
gui_classification_reason: This unit governs project-state storage, canonical fact ownership, and projection boundaries.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes storage projection semantics with GUI identity disclosure and row actions.
depends_on: [CRAU-010, CRAU-016, CRAU-017]
unblocks: [CRAU-020, CRAU-022, CRAU-025]
acceptance_criteria:
  - container_manager.project_state.{project_id} remains the canonical project key for Docker Manager project state.
  - Project state stores durable reopen targets and comparison baselines, not transient runtime observations.
  - Persisted projection objects include project, run, feature_seam, work_package, node, attempt, lane, snapshot, promotion, review, resolution_thread, and event.
  - Dashboard, orchestrator, Docker Manager /page, widget presentation, and source-control summaries project from canonical runtime facts instead of becoming separate truth sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_truth_drift
reasoning_tier: high
context_scope: docker_manager_project_state_projection_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: storage_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`container_manager.project_state.{project_id}`"
  - "`requested_runtime`"
  - "`effective_runtime`"
  - "`requested_registry_capability`"
  - "`effective_registry_capability`"
  - "`runtime_fact_ref`"
  - "`projection freshness`"
negative_constraints:
  - "Projected dashboard, orchestrator, Docker Manager, widget, and source-control summaries must not become separate truths."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-020 - Compatibility Labels And Remote-First Boundaries

```yaml
plan_unit_id: CRAU-020
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager consumes package/lane state without reviving tier-era ownership:
  labels such as Tiers, Phase/Task/Subtask, singular Overseer, /Task/Subtask,
  requested_persona_id, and effective_persona_id are compatibility/source
  lineage only; remote-capable Docker, Kubernetes, registry, and template-repo
  surfaces preserve read-only/offline, degraded/offline, fallback/index,
  reveal, one-bounded-auto-retry, and owner-surface handoff boundaries without
  re-owning file, editor, browser, LSP, search, or language-detection behavior.
gui_related: true
gui_classification_reason: Compatibility labels, read-only/degraded disclosures, fallback/reveal links, and browser-hosting boundaries are user-visible cross-surface behavior.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes compatibility boundary rules with project state and row-action semantics.
depends_on: [CRAU-018, CRAU-019]
unblocks: [CRAU-021, CRAU-022]
acceptance_criteria:
  - Tiers, Phase/Task/Subtask, singular Overseer, Task/Subtask, requested_persona_id, and effective_persona_id remain migration/source-lineage labels only.
  - Docker Manager consumes package/lane state rather than reviving tier-era ownership.
  - Remote-capable surfaces preserve /read-only/offline, /degraded/offline, /fallback/index, /reveal, and one-bounded-auto-retry behavior.
  - Docker Manager does not become the remote owner for file, editor, browser, LSP, search, or language-detection behavior.
  - Bottom-panel-primary browser hosting is not reintroduced where editor-tab-first browser model is the owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_architecture_revival
reasoning_tier: high
context_scope: compatibility_labels_remote_first_boundaries
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: compatibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`Tiers`"
  - "`Phase/Task/Subtask`"
  - "`Overseer`"
  - "`/Task/Subtask`"
  - "`requested_persona_id`"
  - "`effective_persona_id`"
  - "`/read-only/offline`"
  - "`/degraded/offline`"
  - "`/fallback/index`"
  - "`/reveal`"
compatibility_only_notes:
  - "Tier-era labels and requested/effective persona fields are compatibility/source-lineage labels, not new Docker Manager ownership keys."
negative_constraints:
  - "Docker Manager must not re-own file, editor, /browser/LSP/search, or language-detection behavior."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-021 - Identity Drift Indeterminate Outcomes And Row Actions

```yaml
plan_unit_id: CRAU-021
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager handles runtime and remote identity drift, indeterminate remote
  outcomes, capability-level degradation, active-run ownership, and row actions
  explicitly: stale or unowned state revalidates before publish or promotion,
  remote mutations can report indeterminate_remote_outcome with refresh/reconcile
  CTA, local capabilities remain usable during remote outages, active owned
  targets block or require explicit override/forked control, and row actions
  distinguish local versus remote host, writable versus read-only/degraded,
  single versus multi-select, and exact disabled reasons while excluding
  system_default from the canonical MVP target enum.
gui_related: true
gui_classification_reason: Drift warnings, refresh CTAs, degradation states, active-run blockers, and row disabled reasons are user-visible controls.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes GUI row behavior with backend identity and remote side-effect semantics.
depends_on: [CRAU-016, CRAU-017, CRAU-018, CRAU-020]
unblocks: [CRAU-022, CRAU-031]
acceptance_criteria:
  - Active Docker identity changes mark stale_unowned or equivalent state and revalidate before publish or promotion.
  - indeterminate_remote_outcome receipts record requested, transport_lost, later reconciled, and a Refresh remote state CTA.
  - Degradation is capability-level rather than blanket disabled state.
  - Manual mutation of owned worktrees, preview containers, or rollout-associated workloads blocks, requires explicit override, or forks control explicitly, with receipts.
  - Row actions preserve exact disabled-state reasons and keep Download / Save Local Copy available when source access is readable even if remote/project FS writes are blocked.
  - system_default is not part of the canonical MVP target enum for this surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_remote_mutation
reasoning_tier: high
context_scope: identity_drift_indeterminate_outcomes_row_actions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: remote_safety_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`stale_unowned`"
  - "`hard-refresh`"
  - "`indeterminate_remote_outcome`"
  - "`transport_lost`"
  - "`Refresh remote state`"
  - "`owned_by_run`"
  - "`Download / Save Local Copy`"
  - "`Open in Terminal`"
  - "`system_default`"
negative_constraints:
  - "Manual mutation of active-run-owned targets must not proceed silently."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-022 - Lifecycle Detection And Legacy Navigation

```yaml
plan_unit_id: CRAU-022
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager visibility uses broad container-related detection, not
  Dockerfile/Compose only: Dockerfile, Compose file, container build/publish
  settings, managed Unraid template repo, Kubernetes manifests, Helm chart
  files, persisted Kubernetes context/namespace/workload state, and prior
  deploy/apply/port-forward receipts count; detection states are detected,
  manually_enabled, and not_detected; Helm-only and manifest-only projects still
  surface Docker Manager; Unraid is not a separate shell panel; Docker Manage,
  docker_manage_surface_state, legacy panel IDs, and separate UNRAID panel/icon
  concepts migrate to Docker Manager > Publish / Unraid.
gui_related: true
gui_classification_reason: Visibility, shell occupancy, panel naming migration, and first-open navigation are visible GUI contracts.
split_recommended: true
split_recommendation_reason: Source span S0010 also includes registry lifecycle, command families, first-open cards, and help terminology split into CRAU-023.
depends_on: [CRAU-007, CRAU-019, CRAU-020, CRAU-021]
unblocks: [CRAU-023, CRAU-025]
acceptance_criteria:
  - Hide Docker Manager when not used in Project. evaluates broad container-related detection.
  - Compose, Kubernetes, and Helm/persisted aliases map to the same detection inputs.
  - Kubernetes subview is auto-visible when manifests, Helm artifacts, persisted cluster state, or Kubernetes receipts exist, and manually unhideable otherwise.
  - There is one shell occupant for container, runtime/deploy, local-runtime, and Kubernetes management.
  - Unraid remains Publish / Unraid inside Docker Manager; separate Unraid shell occupancy is retired.
  - Docker Manage copy, docker_manage_surface_state, and legacy panel IDs migrate to Docker Manager without creating another owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: detection_or_legacy_nav_drift
reasoning_tier: high
context_scope: lifecycle_detection_legacy_navigation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: lifecycle_navigation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0010
preserved_exact_tokens:
  - "`container-related`"
  - "`Compose file`"
  - "`/Compose`"
  - "`/Kubernetes`"
  - "`/Helm/persisted`"
  - "`detected`"
  - "`manually_enabled`"
  - "`not_detected`"
  - "`Docker Manage`"
  - "`docker_manage_surface_state`"
  - "`UNRAID`"
compatibility_only_notes:
  - "Docker Manage copy and legacy panel IDs migrate to Docker Manager; separate UNRAID panel/icon is retired."
negative_constraints:
  - "`Unraid` is not a separate first-class shell panel in the rewrite."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-023 - Registry Lifecycle Command Families And Help Terms

```yaml
plan_unit_id: CRAU-023
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry object lifecycle is digest-first and not name-based; registry refs
  support active, renamed, deleted, private_inaccessible, and historical_only,
  old receipts never silently rewrite to the currently selected repository,
  Docker internals split CLI runtime control, provider-specific registry APIs,
  and Puppet Master additions, Docker Manager command families cover runtime,
  container, image, compose, context, registry, build, bake, publish, unraid, and
  kubernetes, and first-open disclosure cards plus GUI help, tooltip, and
  Expert/ELI5 derivations use canonical terminology routed through Glossary,
  Crosswalk, Decision Policy, 00-plans-index, and plans-index ownership.
gui_related: true
gui_classification_reason: Registry history, disabled/degraded controls, first-open cards, help, tooltips, and ELI5/Expert derivations are visible behavior.
split_recommended: true
split_recommendation_reason: Source span S0010 mixes registry lifecycle and help terminology with lifecycle/legacy navigation split into CRAU-022.
depends_on: [CRAU-022]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - Historical publish/image receipts prefer immutable digest over mutable tag when digest exists.
  - Retargeted or deleted tags show historical digest and mark tag stale/missing.
  - Existing Docker Hub / Unraid commands remain specialized members of broader Docker Manager families.
  - Disabled/degraded Docker and Kubernetes controls bind to canonical reason code, requested capability, effective capability/state, and recommended next action.
  - First-open disclosure cards explain Containers, Publish / Unraid, and Kubernetes boundaries before mutation.
  - Help text does not flatten canonical terms into one-line substitutions that erase distinctions or reasons.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_or_term_drift
reasoning_tier: high
context_scope: registry_lifecycle_command_help_terms
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: command_help_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0010
preserved_exact_tokens:
  - "`active`"
  - "`renamed`"
  - "`deleted`"
  - "`private_inaccessible`"
  - "`historical_only`"
  - "`/Compose/Buildx`"
  - "`/privacy`"
  - "`/promote/pull/retag`"
  - "`/tooltip`"
  - "`/Expert/ELI5`"
  - "`safe-point`"
  - "`restore-point`"
negative_constraints:
  - "Old receipts must never silently rewrite to the currently selected repository."
  - "Help text must not flatten canonical state vocabulary into one-line substitutions that erase object/state/action distinctions."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
```

### CRAU-024 - Orchestrator Dashboard Integration Owner Split

```yaml
plan_unit_id: CRAU-024
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker-related actions remain available from orchestrator and dashboard
  build/preview surfaces when a Docker-related run is active; Docker Manager
  complements rather than replaces orchestrator controls, owns DockerHub
  repository, auth, push-policy, and /auth/push blocked-state evidence, Source
  Control owns AI commit-message generation, GitHub /Actions owns workflow runs
  and Manage Secrets, and PuppetMasterDashComp.html remains source lineage only
  rather than a new canonical owner.
gui_related: false
gui_classification_reason: This unit defines cross-surface ownership and evidence routing rather than a new visual layout.
split_recommended: false
depends_on: [CRAU-002, CRAU-012, CRAU-015]
unblocks: []
acceptance_criteria:
  - Orchestrator/dashboard build and preview surfaces keep Docker-related actions for active Docker-related runs.
  - Docker Manager is a richer management layer and not a replacement for orchestrator controls.
  - Docker Manager owns DockerHub repository/auth/push policy settings and auth/push blocked-state evidence.
  - Source Control owns AI commit-message generation.
  - GitHub /Actions owns workflow runs and Manage Secrets action.
  - PuppetMasterDashComp.html remains source-lineage evidence and does not create a combined canonical owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_owner_drift
reasoning_tier: high
context_scope: orchestrator_dashboard_docker_owner_split
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_split_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0011
preserved_exact_tokens:
  - "`/auth/push`"
  - "`Manage Secrets`"
  - "`PuppetMasterDashComp.html`"
negative_constraints:
  - "Source-lineage references such as PuppetMasterDashComp.html do not create a new canonical owner."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
```

### CRAU-025 - Docker Project Detection Rules

```yaml
plan_unit_id: CRAU-025
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  A project is Docker-related when Puppet Master detects Dockerfile, compose
  configuration, container-based preview/build target, configured container
  publish settings, or an associated managed Unraid template repository; positive
  detection shows Docker Manager, enables DockerHub repository, preview, publish,
  and Unraid actions, and retains last-used Docker surface state, while negative
  detection with Hide Docker Manager when not used in Project. enabled hides the
  surface from normal navigation but retains settings and state.
gui_related: false
gui_classification_reason: The span is classified as detection/routing state even though it has visible consumers.
split_recommended: false
depends_on: [CRAU-022]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - Dockerfile, compose configuration, container preview/build targets, configured publish settings, and managed Unraid template repository association count as Docker-related detection inputs.
  - Positive detection shows Docker Manager, enables DockerHub repository, preview, publish, and Unraid template actions, and retains last-used Docker surface state.
  - Negative detection with Hide Docker Manager when not used in Project. enabled hides Docker Manager from normal project navigation.
  - Negative detection retains settings and state and does not foreground Docker workflows.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: detection_false_negative
reasoning_tier: standard
context_scope: docker_project_detection_rules
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: detection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0012
preserved_exact_tokens:
  - "`Dockerfile`"
  - "compose configuration"
  - "`Hide Docker Manager when not used in Project.`"
negative_constraints:
  - "Hidden navigation must not delete Docker settings or state."
consumer_hints:
  - Docker Manager GUI visibility consumes this backend detection state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-026 - DockerHub Authentication Inputs UX

```yaml
plan_unit_id: CRAU-026
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub authentication supports both browser/device login and Personal
  Access Token input: browser/device login launches from the GUI for guided
  interactive sign-in, PAT entry is explicit, helper text says PAT is
  recommended, helper text explains where and how to obtain a PAT, and PAT
  support remains mandatory even though browser login is supported.
gui_related: true
gui_classification_reason: Browser login, PAT entry, and helper text are visible authentication UX.
split_recommended: false
depends_on: [CRAU-005]
unblocks: [CRAU-027, CRAU-028, CRAU-029]
acceptance_criteria:
  - Browser/device login remains supported.
  - PAT entry remains supported and mandatory.
  - PAT helper text explicitly says PAT is recommended.
  - PAT helper text explains where and how the user can obtain a PAT.
  - Browser login support does not remove the explicit durable advanced-user PAT path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_path_regression
reasoning_tier: standard
context_scope: dockerhub_authentication_inputs_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auth_gui_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0014
preserved_exact_tokens:
  - "Browser/device login"
  - "Personal Access Token (PAT)"
  - "PAT is recommended"
negative_constraints:
  - "PAT support remains mandatory even though browser login is supported."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-027 - Browser Login Events And Auth Expiry

```yaml
plan_unit_id: CRAU-027
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  cmd.docker.browser_login launches DockerHub browser/device login and emits the
  browser-login event sequence; device-code initialization emits verification_uri,
  user_code, and expires_in_seconds; polling emits every 5 seconds until a
  closed terminal outcome; cmd.docker.save_pat writes PAT; and auth expiry during
  push emits docker.publish.failed with reason_code auth_expired, preserves the
  local build result, and surfaces re-auth plus retry CTA without forcing a rebuild.
gui_related: true
gui_classification_reason: Browser login, polling, terminal outcomes, and re-auth/retry CTA are visible authentication workflow behavior.
split_recommended: true
split_recommendation_reason: This unit joins S0015 and S0017 because browser-login events and auth-expiry recovery are one auth workflow contract.
depends_on: [CRAU-026]
unblocks: [CRAU-029, CRAU-031]
acceptance_criteria:
  - cmd.docker.browser_login launches DockerHub browser/device login and immediately emits docker.auth.browser_login.started.
  - Device/browser initialization emits docker.auth.browser_login.device_code_issued with verification_uri, user_code, and expires_in_seconds.
  - While awaiting completion, polling emits every 5 seconds.
  - Terminal outcomes are exactly docker.auth.capability_validated, docker.auth.browser_login.cancelled, docker.auth.browser_login.timed_out, and docker.auth.failed.
  - PAT entry is written through cmd.docker.save_pat, with optional local PAT format failure before network validation.
  - Auth expiry during push emits docker.publish.failed with reason_code auth_expired, preserves the local build result, and exposes re-auth plus retry without forcing rebuild.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_contract_drift
reasoning_tier: high
context_scope: browser_login_events_auth_expiry
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/newtools.md
node_compile_hint:
  mode: event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0017
preserved_exact_tokens:
  - "`cmd.docker.browser_login`"
  - "`docker.auth.browser_login.started`"
  - "`docker.auth.browser_login.device_code_issued`"
  - "`verification_uri`"
  - "`user_code`"
  - "`expires_in_seconds`"
  - "`docker.auth.capability_validated`"
  - "`docker.auth.browser_login.cancelled`"
  - "`docker.auth.browser_login.timed_out`"
  - "`docker.auth.failed`"
  - "`cmd.docker.save_pat`"
  - "`docker.publish.failed`"
  - "`reason_code: auth_expired`"
negative_constraints:
  - "Auth expiry during image push must not discard the completed local build result or force a rebuild."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-028 - Credential Storage Scope And Secret Boundary

```yaml
plan_unit_id: CRAU-028
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub credential handling keeps browser-login credentials in Docker's
  credential-helper or ~/.docker/config.json chain, PAT credentials in the OS
  credential store only, DockerHub credentials global per OS user, requested
  auth mode, selected namespace/repository, and last validation snapshot
  project-scoped UI state, clear credential actions explicit about browser,
  PAT, or both, and token material out of redb, YAML, project files, and
  evidence logs with credential, auth header, and token-bearing environment
  variable redaction.
gui_related: true
gui_classification_reason: Credential scope, clear action wording, project-scoped UI state, and validation snapshots affect visible auth state while preserving secret storage boundaries.
split_recommended: true
split_recommendation_reason: This unit joins S0016 and S0021 because they define the same credential custody and secret-persistence boundary.
depends_on: [CRAU-026]
unblocks: [CRAU-029]
acceptance_criteria:
  - Browser-login credentials are read from Docker credential-helper or ~/.docker/config.json chain.
  - PAT credentials are read from OS credential store only.
  - DockerHub credentials are global per OS user account.
  - requested_auth_mode, selected namespace/repository, and last validation snapshot remain project-scoped UI state.
  - Clearing credentials declares whether browser-login credentials, PAT credentials, or both are cleared.
  - Tokens and credentials are never persisted to redb, YAML, project files, or evidence logs.
  - Evidence and log capture redact credentials, auth headers, and token-bearing environment variables.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_leakage
reasoning_tier: high
context_scope: credential_storage_secret_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: secret_storage_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0021
preserved_exact_tokens:
  - "`~/.docker/config.json`"
  - "`requested_auth_mode`"
  - "OS credential store"
  - "redb"
  - "YAML"
  - "evidence logs"
negative_constraints:
  - "Docker Hub auth secret material remains out of redb; only validated identity/capability snapshots persist."
  - "Evidence/log capture must redact credentials, auth headers, and token-bearing environment variables."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-029 - Effective DockerHub Capability Model

```yaml
plan_unit_id: CRAU-029
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master models requested DockerHub auth separately from effective
  provider state and capability: effective_capabilities[] is a closed first
  implementation enum of namespaces:list, repositories:list,
  repositories:create, images:push, and repositories:read_private; surfaces gate
  namespace discovery, repository discovery, repository creation, image push, and
  private repository validation on that set, remain visible but disabled with
  missing capability and degraded_reason when needed, show effective account
  identity and validation metadata, and never imply browser login or PAT grants
  full repository-management capability unless validation proves equivalent
  effective capability.
gui_related: true
gui_classification_reason: Capability display, gated controls, disabled explanations, effective account identity, and validation metadata are user-visible auth state.
split_recommended: true
split_recommendation_reason: Source spans S0018-S0020 form one capability model but include a structural parent heading and browser-login capability note.
depends_on: [CRAU-026, CRAU-027, CRAU-028]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - effective_capabilities[] is closed for the first implementation.
  - Namespace discovery requires namespaces:list.
  - Repository discovery and refresh require repositories:list.
  - Create Repository requires repositories:create.
  - Push Image requires images:push.
  - Validation of a private target repository requires repositories:read_private or successful push-capable validation path.
  - Controls requiring missing capabilities remain visible but disabled with inline explanation naming missing capability and degraded_reason when present.
  - Requested auth mode remains separate from effective provider state and capability.
  - UI never implies browser login or PAT automatically grants full repository-management capability.
  - Browser login may support management actions when it yields equivalent effective capability; PAT remains recommended explicit fallback.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: capability_overclaim
reasoning_tier: high
context_scope: dockerhub_effective_capability_model
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: capability_gating_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0020
preserved_exact_tokens:
  - "`effective_capabilities[]`"
  - "`namespaces:list`"
  - "`repositories:list`"
  - "`repositories:create`"
  - "`images:push`"
  - "`repositories:read_private`"
  - "`requested_auth_mode`"
  - "`effective_auth_provider_state`"
  - "`effective_account_identity`"
  - "`last_validation_timestamp`"
  - "`last_validation_host`"
  - "`degraded_reason`"
negative_constraints:
  - "The UI must never imply that browser login or PAT automatically grants full repository-management capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-030 - DockerHub Repository Selection And API Boundary

```yaml
plan_unit_id: CRAU-030
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub repository management lets users view discovered namespaces, select
  the target namespace, view repositories within it, refresh lists on demand,
  choose an existing repository for push, and create a missing repository if
  needed for first publish; Docker CLI and Buildx own local build, run, login,
  and push behavior, Docker Hub API owns app-managed namespace/repository
  discovery and creation, and image registry push is not conflated with template
  distribution.
gui_related: true
gui_classification_reason: Repository discovery, selectors, refresh, existing-repository choice, and create action are visible repository-management controls.
split_recommended: false
depends_on: [CRAU-029]
unblocks: [CRAU-031]
acceptance_criteria:
  - Users can view namespaces, select namespace, view repositories, refresh repository lists, choose existing repository, and create a missing repository for first publish.
  - Docker CLI and Buildx handle local build, run, login, and push behavior.
  - Docker Hub API handles namespace/repository discovery and repository creation when app-managed listing/creation is needed.
  - Image registry push is not conflated with template distribution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: api_boundary_drift
reasoning_tier: standard
context_scope: dockerhub_repository_selection_api_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
node_compile_hint:
  mode: repository_management_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0023
preserved_exact_tokens:
  - "DockerHub API behavior"
  - "Docker CLI / Buildx"
  - "Docker Hub API"
negative_constraints:
  - "Image registry push must not be conflated with template distribution."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-031 - Protected Missing Repository Creation

```yaml
plan_unit_id: CRAU-031
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Missing DockerHub repository creation is an explicit protected remote
  side-effect flow: Puppet Master may offer creation as part of first-push
  preparation, but the creation step must be explicit and visible, confirmation
  must show namespace, repository name, and privacy, YOLO modes, agent autonomy,
  and fast-path settings cannot bypass confirmation, cmd.docker.create_repository
  validates and emits docker.repository.create.confirmation_requested, confirm
  dispatches cmd.docker.create_repository.confirm, cancel dispatches
  cmd.docker.create_repository.cancel, approval of image push never implies
  repository creation approval, default privacy is private, and the dialog makes
  that default explicit while allowing the user to change privacy before creation.
gui_related: true
gui_classification_reason: Repository creation offer, confirmation modal, default privacy notice, confirm/cancel actions, and blocked fast paths are visible remote side-effect UX.
split_recommended: true
split_recommendation_reason: This unit covers missing-repository behavior, confirmation flow, and default privacy because they form one protected remote side-effect contract.
depends_on: [CRAU-030, CRAU-015]
unblocks: []
acceptance_criteria:
  - Missing repository creation is explicit and visible during first-push preparation.
  - Confirmation shows namespace, repository name, and privacy.
  - Confirmation cannot be bypassed by YOLO modes, agent autonomy, or any fast-path setting.
  - cmd.docker.create_repository validates namespace/repository/privacy and emits docker.repository.create.confirmation_requested.
  - Confirm dispatches cmd.docker.create_repository.confirm.
  - Cancel dispatches cmd.docker.create_repository.cancel.
  - Approving image push does not implicitly approve creation of a missing DockerHub repository.
  - Newly created repositories default private, and the confirmation dialog makes that default explicit while allowing user change before creation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_side_effect_bypass
reasoning_tier: high
context_scope: protected_missing_repository_creation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: hard_gate_confirmation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0026
preserved_exact_tokens:
  - "YOLO modes"
  - "agent autonomy"
  - "`cmd.docker.create_repository`"
  - "`docker.repository.create.confirmation_requested`"
  - "`cmd.docker.create_repository.confirm`"
  - "`cmd.docker.create_repository.cancel`"
  - "default privacy for newly created repositories: private"
negative_constraints:
  - "Approving an image push MUST NOT implicitly approve creation of a missing DockerHub repository."
  - "The confirmation step is mandatory and cannot be bypassed by YOLO modes, agent autonomy, or any other fast-path setting."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
```

### CRAU-032 - Buildx Build Preflight Contract

```yaml
plan_unit_id: CRAU-032
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker image builds use docker buildx build as the deterministic image-build
  path and run preflight before build for engine reachability, compose/config
  validity, buildx availability, required ports, and target repository/auth when
  push is requested.
gui_related: false
gui_classification_reason: Build path and preflight facts are runtime execution prerequisites rather than visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0028 also contains build result surfacing split into CRAU-033.
depends_on: [CRAU-011, CRAU-029, CRAU-030]
unblocks: [CRAU-033, CRAU-043]
acceptance_criteria:
  - docker buildx build remains the deterministic image-build path.
  - Preflight resolves engine reachability, compose/config validity, buildx availability, required ports, and target repo/auth when push is requested.
  - Push authentication checks do not fold remote publish execution into local build execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: build_preflight_gap
reasoning_tier: standard
context_scope: buildx_build_preflight
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
node_compile_hint:
  mode: build_preflight_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0028
preserved_exact_tokens:
  - "`docker buildx build`"
  - "engine reachability"
  - "compose/config validity"
  - "buildx availability"
negative_constraints:
  - "Push auth preflight must not make local build execution create or push remote repository artifacts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-033 - Build Result Surfacing Contract

```yaml
plan_unit_id: CRAU-033
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Structured build results preserve artifacts, logs, and image identity and are
  surfaced in chat, orchestrator, and Docker Manager UI so each consumer can
  trace the same build result.
gui_related: true
gui_classification_reason: Build result cards and result visibility in chat, orchestrator, and Docker Manager are visible UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0028 mixes backend build preflight with visible result surfacing.
depends_on: [CRAU-032, CRAU-024, CRAU-007]
unblocks: [CRAU-046, CRAU-057]
acceptance_criteria:
  - Structured build results include artifacts, logs, and image identity.
  - Chat, orchestrator, and Docker Manager UI can surface and trace the same build result.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: result_visibility_loss
reasoning_tier: standard
context_scope: build_result_surfacing
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: result_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0028
preserved_exact_tokens:
  - "structured build results"
  - "artifacts"
  - "logs"
  - "image identity"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-034 - Run Preview Control Actions

```yaml
plan_unit_id: CRAU-034
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master can deploy and run project containers for testing workflows and
  exposes user-visible controls to start and stop preview/run, open an exposed
  web UI or endpoint when available, open logs, inspect health status, and show
  the resolved access URL or port.
gui_related: true
gui_classification_reason: Preview controls, logs, health, endpoint open action, and URL/port display are visible Docker Manager behavior.
split_recommended: false
depends_on: [CRAU-011, CRAU-013]
unblocks: [CRAU-035, CRAU-036]
acceptance_criteria:
  - Start and stop preview/run actions exist for project containers.
  - Open endpoint, open logs, inspect health, and show resolved URL/port actions are available when their prerequisites exist.
  - Actions disable or degrade rather than guessing when runtime facts are unavailable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_action_drift
reasoning_tier: standard
context_scope: run_preview_control_actions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_preview_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0029
preserved_exact_tokens:
  - "start preview/run"
  - "stop preview/run"
  - "open exposed web UI or endpoint"
  - "show resolved access URL/port"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-035 - Runtime Access URL Resolution

```yaml
plan_unit_id: CRAU-035
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Runtime access URL resolution checks explicit project override first, then the
  first published host-port mapping from compose or container inspect preferring
  ports 443, 80, 3000, and 8080, then known web-UI metadata or label, then no
  access URL; when none exists Docker Manager shows No direct access URL detected
  and disables open instead of guessing.
gui_related: true
gui_classification_reason: URL resolution order, disabled open action, and the no-URL copy are visible runtime access behavior.
split_recommended: false
depends_on: [CRAU-034]
unblocks: [CRAU-057]
acceptance_criteria:
  - Access URL resolution preserves the exact source order.
  - Port preference order is 443, 80, 3000, 8080, then the next published port.
  - No access URL shows No direct access URL detected and disables open rather than guessing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_url_guess
reasoning_tier: high
context_scope: runtime_access_url_resolution
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: url_resolution_guardrail
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0030
preserved_exact_tokens:
  - "`443`"
  - "`80`"
  - "`3000`"
  - "`8080`"
  - "`No direct access URL detected`"
negative_constraints:
  - "Docker Manager must disable open rather than guessing when no access URL is available."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-036 - Runtime Stream Port Forward And Crash Gap Continuity

```yaml
plan_unit_id: CRAU-036
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Persisted stream intent applies to Actions logs, container logs, Kubernetes
  logs, and Orchestrator activity using follow, paused_snapshot, and
  historical_view states; restart restores follow only after source revalidation,
  port-forward target drift creates a new session id, old sessions remain
  historical, browser tabs are never silently rebound across target changes, and
  crash evidence distinguishes flushed-and-persisted, buffered unflushed, and
  unknown gap interval.
gui_related: true
gui_classification_reason: Stream modes, degraded browser tabs, historical sessions, and crash-gap rendering are user-visible runtime evidence behavior.
split_recommended: true
split_recommendation_reason: Source span S0031 also includes alert ownership and trust-policy continuity split into CRAU-037.
depends_on: [CRAU-013, CRAU-014]
unblocks: [CRAU-037]
acceptance_criteria:
  - Stream surfaces distinguish follow, paused_snapshot, and historical_view.
  - Follow intent after restart requires source revalidation and a new stream session.
  - Port-forward target drift, changed target, or unavailable local port keeps the old session historical and issues a new session id.
  - Previously opened browser tabs never silently rebind across target changes.
  - UI renders unknown gap interval explicitly rather than implying complete evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_session_misleading_state
reasoning_tier: high
context_scope: runtime_stream_port_forward_crash_gap
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_session_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0031
preserved_exact_tokens:
  - "`follow`"
  - "`paused_snapshot`"
  - "`historical_view`"
  - "`flushed-and-persisted`"
  - "`unknown gap interval`"
negative_constraints:
  - "Previously opened browser tabs are never silently rebound across target changes."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-037 - Runtime Alert Ownership And Trust Continuity

```yaml
plan_unit_id: CRAU-037
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager is the primary owner for runtime and Kubernetes alert
  actionability while Dashboard and Orchestrator mirror attention state, and
  runtime plus GitHub-hosted links consume shared github_host_policy and
  /network/trust policy for enterprise host allowance, proxy mode, proxy
  credential source, per-domain/per-surface opt-out, OS trust store, custom CA
  bundle, per-host CA override, and validation/expiry reporting.
gui_related: true
gui_classification_reason: Alert ownership, mirrored attention, disabled-state UX, and trust reporting are user-visible cross-surface behavior.
split_recommended: true
split_recommendation_reason: Source span S0031 mixes stream/session continuity with alert ownership and trust-policy continuity.
depends_on: [CRAU-015, CRAU-036]
unblocks: [CRAU-038]
acceptance_criteria:
  - Docker Manager keeps unhealthy containers, restart loops, failed readiness, failed rollouts, and port-forward failures actionable.
  - Dashboard and Orchestrator mirror attention state without taking Docker Manager ownership.
  - github_host_policy distinguishes github.com_only and enterprise_allowed; GHES receives deterministic disabled-state UX when MVP is github.com_only.
  - Shared /network/trust policy preserves proxy modes, OS credential-store proxy credentials, per-domain/per-surface opt-outs, and CA validation/expiry reporting.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_mirror_or_trust_drift
reasoning_tier: high
context_scope: runtime_alert_ownership_trust_continuity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: owner_mirror_trust_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0031
preserved_exact_tokens:
  - "`github_host_policy`"
  - "`github.com_only`"
  - "`enterprise_allowed`"
  - "`GHES`"
  - "`/network/trust`"
  - "`system`"
  - "`manual`"
  - "`off`"
negative_constraints:
  - "Trust policy is separate from Unraid metadata."
consumer_hints:
  - Dashboard and Orchestrator mirror attention state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-038 - Enterprise Registry And Kubernetes Host Policy

```yaml
plan_unit_id: CRAU-038
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Enterprise registry and Kubernetes policy use registry_hosts[] and
  k8s_host_policy: registry hosts record host policy, trust/proxy inheritance,
  capability snapshot, and default push target, Kubernetes host policy records
  allowed contexts, clusters, namespaces, and verbs, and hosted/runtime surfaces
  distinguish offline_cached, network_blocked_by_policy, host_unreachable, and
  host_untrusted while surfacing cached read-only state or canonical
  blocked/preflight state.
gui_related: true
gui_classification_reason: Host-policy state drives visible Docker Manager command availability, cached-state rendering, and blocked/preflight UX.
split_recommended: true
split_recommendation_reason: Source span S0032 mixes policy model with visible cached/blocked rendering.
depends_on: [CRAU-014, CRAU-037]
unblocks: [CRAU-039, CRAU-040]
acceptance_criteria:
  - registry_hosts[] entries include registry host, host policy, trust/proxy inheritance, capability snapshot, and default push target.
  - k8s_host_policy includes allowed contexts/clusters/namespaces and verbs apply, exec, port_forward, and logs.
  - UI command availability and Docker Manager subviews consume policy rather than redefining it.
  - offline_cached, network_blocked_by_policy, host_unreachable, and host_untrusted states remain distinct.
  - Policy-denied but otherwise valid actions surface canonical blocked/preflight state, not generic network failure.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: host_policy_drift
reasoning_tier: high
context_scope: enterprise_registry_k8s_host_policy
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: host_policy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0032
preserved_exact_tokens:
  - "`registry_hosts[]`"
  - "`k8s_host_policy`"
  - "`apply`"
  - "`exec`"
  - "`port_forward`"
  - "`logs`"
  - "`offline_cached`"
  - "`network_blocked_by_policy`"
  - "`host_unreachable`"
  - "`host_untrusted`"
negative_constraints:
  - "Host policy must not be conflated with transient reachability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
```

### CRAU-039 - Mutation Preflight Before Approval

```yaml
plan_unit_id: CRAU-039
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker, registry, Unraid, and Kubernetes mutations run preflight before
  approval prompts; preflight resolves target identity, runtime/tool
  availability, host/trust/proxy policy, repository or cluster capability, and
  current drift/freshness, unresolved facts emit blocked_preflight without
  asking approval, approval binds to the preflight snapshot and exact action
  scope, retry/resume re-runs preflight when relevant facts may have changed, and
  policy-denied outcomes emit blocked/governance payloads rather than *.failed.
gui_related: false
gui_classification_reason: This unit defines mutation ordering, preflight snapshots, and approval semantics rather than visual layout.
split_recommended: false
depends_on: [CRAU-031, CRAU-038]
unblocks: [CRAU-043, CRAU-045]
acceptance_criteria:
  - Mutations run preflight before approval prompts.
  - Unresolved facts emit blocked_preflight and do not ask the user to approve an unknowable operation.
  - Approval binds to the preflight snapshot and exact action scope.
  - Retry/resume re-runs preflight when target, permission snapshot, host policy, or governance state may have changed.
  - Policy-denied outcomes after preflight or approval emit blocked/governance payloads with policy source and reason-code family rather than *.failed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_bypass
reasoning_tier: high
context_scope: mutation_preflight_before_approval
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: preflight_approval_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0033
preserved_exact_tokens:
  - "`blocked_preflight`"
  - "`*.failed`"
negative_constraints:
  - "Puppet Master must not ask the user to approve an unknowable operation."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-040 - Kubernetes Enablement And Doctor Checks

```yaml
plan_unit_id: CRAU-040
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Kubernetes is enabled as a project-focused Docker Manager subview only when
  manifests, Helm artifacts, kube-linked receipts, active workload refs, or
  explicit project settings indicate relevance; Kubernetes doctor checks verify
  kubectl reachability, kubeconfig/context availability, namespace access,
  project-focused workload scope, Helm availability when selected, and allowed
  verbs for apply, diff, logs, exec, and port_forward while keeping manifest
  editing and cached inspection available when possible.
gui_related: true
gui_classification_reason: Kubernetes subview enablement, doctor checks, editing/cached inspection availability, and explicit blocked outcomes are visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0034 mixes enablement signals with doctor-check preflight behavior.
depends_on: [CRAU-014, CRAU-038]
unblocks: [CRAU-041]
acceptance_criteria:
  - Kubernetes subview enablement requires project relevance signals or explicit project settings.
  - Doctor checks verify kubectl, kubeconfig/context, namespace access, project-focused workload scope, Helm when selected, and allowed verbs.
  - Failed checks keep manifest editing and cached inspection available when possible.
  - Failed checks block mutation, exec, logs, or port-forward actions with explicit preflight/permission outcomes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: k8s_scope_creep
reasoning_tier: high
context_scope: kubernetes_enablement_doctor_checks
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: k8s_doctor_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0034
preserved_exact_tokens:
  - "`kubectl`"
  - "`apply`"
  - "`diff`"
  - "`logs`"
  - "`exec`"
  - "`port_forward`"
negative_constraints:
  - "Failed doctor checks must not silently hide the Kubernetes subview when cached inspection or manifest editing can remain available."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-041 - Active Docker Manager Operation Anchors

```yaml
plan_unit_id: CRAU-041
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion, drift detection, access intelligence, and project-focused
  K8s deep linkage are active Docker Manager contract areas. They require typed
  operation identity, status/result payloads, preflight and permission outcomes,
  review/failure fields where applicable, and GUI action derivation from structured
  payloads. They must not disappear from the Docker Manager contract, be replaced
  by generic runtime wording, or render as vague planned placeholders.
gui_related: false
gui_classification_reason: This unit defines Docker Manager runtime operation contracts rather than visual presentation.
split_recommended: false
depends_on: [CRAU-012, CRAU-013, CRAU-040]
unblocks: []
acceptance_criteria:
  - Registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage remain named Docker Manager contract areas.
  - Each area has typed operation identity, status/result payloads, preflight and permission outcomes, and review/failure fields where applicable.
  - These areas are not replaced by generic runtime wording or vague planned placeholders.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_contract_placeholder_drift
reasoning_tier: standard
context_scope: active_docker_manager_operation_anchors
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_operation_anchor_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0035
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
  - pldg-20260614-002-part-3-fable-cleanup:atom-0028
  - pldg-20260614-002-part-3-fable-cleanup:atom-0046
  - pldg-20260614-002-part-3-fable-cleanup:atom-0064
  - pldg-20260614-002-part-3-fable-cleanup:atom-0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0070
  - pldg-20260614-002-part-3-fable-cleanup:atom-0073
  - pldg-20260614-002-part-3-fable-cleanup:atom-0076
  - pldg-20260614-002-part-3-fable-cleanup:atom-0079
preserved_exact_tokens:
  - "Docker Manager future-scope placeholders"
  - "Registry promotion"
  - "drift detection"
  - "access intelligence"
  - "project-focused K8s deep linkage"
  - "needs_review vs failure-payload disagreement"
  - "design it"
negative_constraints:
  - "Do not leave Docker Manager registry promotion, drift detection, access intelligence, or project-focused K8s deep linkage as future-scope placeholders."
  - "Do not render these areas as vague planned placeholders without typed operation payloads."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-042 - Event Registration Boundary

```yaml
plan_unit_id: CRAU-042
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  This plan defines Docker, registry, Kubernetes, and Unraid event producers and
  payload expectations for its owner surface while Contracts_V0 remains the
  registration authority for stable cross-product event names and storage-plan
  owns concrete persisted payload schemas; new event families register there
  before consumers treat them as durable canonical events.
gui_related: false
gui_classification_reason: Event producer, registration, and persisted payload ownership are backend contract boundaries.
split_recommended: false
depends_on: [CRAU-010, CRAU-015]
unblocks: [CRAU-057]
acceptance_criteria:
  - Containers_Registry_and_Unraid defines Docker, registry, Kubernetes, and Unraid event producers and payload expectations for its owner surface.
  - Plans/Contracts_V0.md remains registration authority for stable cross-product event names.
  - Plans/storage-plan.md owns concrete persisted payload schemas.
  - New event families register with those owners before consumers treat them as durable canonical events.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_drift
reasoning_tier: high
context_scope: event_registration_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: event_registration_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0036
preserved_exact_tokens:
  - "Docker, registry, Kubernetes, and Unraid event producers"
  - "Contracts_V0.md"
  - "storage-plan.md"
negative_constraints:
  - "Consumers must not treat new Docker/Unraid/Kubernetes event families as durable canonical events before registration."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CRAU-043 - Publish Execution Approval And Blocked Outcome Contract

```yaml
plan_unit_id: CRAU-043
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Publishing is a two-step model: cmd.orchestrator.build_run performs local
  build and preview preparation only, cmd.orchestrator.push_image performs
  remote DockerHub publication only, direct Build approval approves build only,
  direct Push image approval approves image push only, missing repository
  creation and managed Unraid template-repo remote push remain separate side
  effects, and docker.publish.failed remains distinct from docker.publish.blocked.
gui_related: true
gui_classification_reason: Build and Push image approvals, blocked outcomes, and user-facing side-effect separation are visible publish workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0038 mixes approval UI with runtime side-effect outcome semantics.
depends_on: [CRAU-032, CRAU-039]
unblocks: [CRAU-044, CRAU-045]
acceptance_criteria:
  - cmd.orchestrator.build_run performs local build/preview preparation only.
  - cmd.orchestrator.push_image performs remote DockerHub publication only.
  - push_policy after_build dispatches push_image after a successful local build result and does not fold remote publish into build_run.
  - Direct Build approves only build, and direct Push image approves only image push.
  - docker.publish.failed means an attempted publish failed at runtime.
  - docker.publish.blocked means a remote side effect intentionally did not execute because confirmation or permission approval was missing, rejected, or cancelled.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_side_effect_conflation
reasoning_tier: high
context_scope: publish_execution_approval_blocked_outcome
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: publish_approval_blocked_outcome
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0038
preserved_exact_tokens:
  - "`cmd.orchestrator.build_run`"
  - "`cmd.orchestrator.push_image`"
  - "`push_policy = after_build`"
  - "`docker.publish.failed`"
  - "`docker.publish.blocked`"
negative_constraints:
  - "`cmd.orchestrator.build_run` MUST NOT create DockerHub repositories, push images, create remote template repos, or push remote template repos."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-044 - Missing Repository Push Resume

```yaml
plan_unit_id: CRAU-044
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When cmd.orchestrator.push_image resolves a missing target repository, Puppet
  Master preserves the local build result, enters
  awaiting_repo_creation_confirmation, emits
  docker.repository.create.confirmation_requested, resumes the pending push after
  successful repository creation without forcing rebuild, or emits
  docker.publish.blocked with reason_code repo_creation_not_confirmed,
  blocked_step create_repository, and allowed_action_ids[] while preserving the
  local image/result.
gui_related: true
gui_classification_reason: Missing-repository confirmation, pending state, blocked payload, and retry affordance are visible publish workflow behavior.
split_recommended: false
depends_on: [CRAU-031, CRAU-043]
unblocks: [CRAU-045]
acceptance_criteria:
  - Missing repository during push preserves the local build result.
  - The flow enters awaiting_repo_creation_confirmation and emits docker.repository.create.confirmation_requested.
  - Successful repository creation resumes the pending push attempt without forcing rebuild.
  - Cancelled, rejected, or policy-blocked creation emits docker.publish.blocked with reason_code repo_creation_not_confirmed, blocked_step create_repository, and allowed_action_ids[].
  - docker.publish.blocked preserves the already-built local image/result for retry.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: resume_state_loss
reasoning_tier: high
context_scope: missing_repository_push_resume
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: missing_repo_resume_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0039
preserved_exact_tokens:
  - "`awaiting_repo_creation_confirmation`"
  - "`docker.repository.create.confirmation_requested`"
  - "`reason_code: repo_creation_not_confirmed`"
  - "`blocked_step: create_repository`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Repository creation resume must not force a rebuild when the local build result is preserved."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-045 - Auto Push Approval Gate

```yaml
plan_unit_id: CRAU-045
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  push_policy = after_build does not grant standing approval for remote side
  effects; at the auto-dispatch point Puppet Master evaluates
  external_publish_side_effect for cmd.orchestrator.push_image, emits
  docker.publish.blocked with blocked_step push_image when approval is absent,
  preserves the local build result, surfaces Push image as recovery CTA, and
  keeps DockerHub repository creation plus managed-template remote repo
  create/push as separately approved side effects.
gui_related: true
gui_classification_reason: Auto-push blocked state, Push image recovery CTA, and separated approvals are visible publish workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0041 also includes canonical publish reference selection and tag template resolution.
depends_on: [CRAU-043]
unblocks: [CRAU-046, CRAU-047, CRAU-048]
acceptance_criteria:
  - push_policy after_build does not grant standing approval for remote side effects.
  - Build click approves only local build execution.
  - Auto-dispatch evaluates external_publish_side_effect for cmd.orchestrator.push_image.
  - Missing approval emits docker.publish.blocked with blocked_step push_image, preserves local build result, and surfaces Push image as recovery CTA.
  - Repository creation and managed-template remote repo create/push remain separately approved side effects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auto_push_bypass
reasoning_tier: high
context_scope: auto_push_approval_gate
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auto_push_approval_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
preserved_exact_tokens:
  - "`push_policy = after_build`"
  - "`external_publish_side_effect`"
  - "`cmd.orchestrator.push_image`"
  - "`blocked_step: push_image`"
  - "Push image"
negative_constraints:
  - "Auto-push must not grant standing approval for remote side effects."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-046 - Canonical Publish Reference Selection

```yaml
plan_unit_id: CRAU-046
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Canonical template source image selection uses primary_publish_tag first, then
  the first tag emitted by the resolved tag-template list, then the
  lexicographically smallest tag only for legacy results lacking ordering
  metadata; docker_publish_result.digests[] manifest-list digest wins for
  image_digest otherwise the single pushed digest is used, and the generated
  application template Repository is namespace/repository:primary_publish_tag.
gui_related: false
gui_classification_reason: Publish reference selection is backend artifact identity and generation semantics.
split_recommended: true
split_recommendation_reason: Source span S0041 also includes visible auto-push approval and tag-template sanitization rules.
depends_on: [CRAU-045]
unblocks: [CRAU-047, CRAU-048, CRAU-050, CRAU-053]
acceptance_criteria:
  - primary_publish_tag wins when set.
  - Otherwise the first emitted tag from the resolved tag-template list wins.
  - Lexicographically smallest tag is a fallback only for legacy results without ordering metadata.
  - docker_publish_result.digests[] manifest-list digest becomes canonical image_digest when present.
  - Generated Repository value uses namespace/repository:primary_publish_tag.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: publish_reference_ambiguity
reasoning_tier: high
context_scope: canonical_publish_reference_selection
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: publish_reference_selection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
preserved_exact_tokens:
  - "`primary_publish_tag`"
  - "`docker_publish_result.digests[]`"
  - "`image_digest`"
  - "`<Repository>`"
  - "`<namespace>/<repository>:<primary_publish_tag>`"
compatibility_only_notes:
  - "Lexicographically smallest tag fallback is only for legacy results that lack ordering metadata."
negative_constraints:
  - "Legacy tag fallback must not override primary_publish_tag or resolved tag-template order."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-047 - Tag Template Resolution And Sanitization

```yaml
plan_unit_id: CRAU-047
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Tag templates resolve {commit}, {version}, and {timestamp} from exact sources
  with documented formats and failure behavior, may combine literals and
  variables, lowercase after substitution, replace characters outside
  [a-z0-9_.-] with hyphen, collapse consecutive hyphens, and block publish with
  explicit remediation text when post-sanitization tag is empty.
gui_related: false
gui_classification_reason: Tag resolution and sanitization are deterministic backend publish semantics.
split_recommended: true
split_recommendation_reason: Source span S0041 combines tag rules with auto-push approval and publish reference selection.
depends_on: [CRAU-046]
unblocks: [CRAU-048]
acceptance_criteria:
  - "{commit} resolves to first 12 lowercase HEAD commit hex chars and blocks if required but missing."
  - "{version} resolves from Cargo.toml, package.json, then explicit user override and blocks if unresolved without user override."
  - "{timestamp} resolves to UTC publish-start time in YYYYMMDD-HHMMSSZ format and never fails."
  - Tags lowercase, replace outside [a-z0-9_.-] with hyphen, collapse consecutive hyphens, and block when empty after sanitization.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: invalid_tag_generation
reasoning_tier: standard
context_scope: tag_template_resolution_sanitization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: tag_template_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
preserved_exact_tokens:
  - "`{commit}`"
  - "`{version}`"
  - "`{timestamp}`"
  - "`YYYYMMDD-HHMMSSZ`"
  - "`[a-z0-9_.-]`"
negative_constraints:
  - "An empty post-sanitization tag is invalid and must block publish with explicit remediation text."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-048 - Post Publish Unraid Follow On Sequence

```yaml
plan_unit_id: CRAU-048
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  After successful image publishing, Puppet Master generates or updates Unraid
  XML when enabled, updates the target template repo when managed workflow is
  enabled, auto-commits template-repo changes by default, does not auto-push by
  default, and presents a one-click push action from the UI.
gui_related: true
gui_classification_reason: The follow-on sequence includes visible one-click push and enabled/disabled Unraid generation behavior.
split_recommended: false
depends_on: [CRAU-045, CRAU-046, CRAU-047]
unblocks: [CRAU-049, CRAU-057, CRAU-059]
acceptance_criteria:
  - Unraid XML generation/update runs after successful image publishing when enabled.
  - Managed template-repo workflow updates the target template repo when enabled.
  - Auto-commit is default for template-repo change.
  - Auto-push is not default.
  - One-click push action is presented from the UI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: follow_on_side_effect_drift
reasoning_tier: standard
context_scope: post_publish_unraid_follow_on_sequence
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: post_publish_follow_on_sequence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0042
preserved_exact_tokens:
  - "`Generate/Update Unraid XML after successful publish`"
  - "auto-commit"
  - "do not auto-push"
  - "one-click push"
negative_constraints:
  - "Template-repo remote push must not become automatic by default."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-049 - Managed Unraid Artifact Classes

```yaml
plan_unit_id: CRAU-049
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The managed Unraid flow produces exactly three artifact classes: Application
  template XML at maintainer_slug/project_slug.xml, Maintainer profile XML at
  ca_profile.xml, and repo-managed image assets under assets/maintainer/ when
  users upload images instead of referencing external URLs.
gui_related: true
gui_classification_reason: Generated artifacts are user-visible outputs and appear in managed Unraid publishing surfaces.
split_recommended: false
depends_on: [CRAU-048]
unblocks: [CRAU-050, CRAU-051, CRAU-052, CRAU-057]
acceptance_criteria:
  - Application template XML is written at <maintainer_slug>/<project_slug>.xml.
  - Maintainer profile XML is written at ca_profile.xml.
  - Uploaded image assets are repo-managed under assets/maintainer/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_shape_loss
reasoning_tier: standard
context_scope: managed_unraid_artifact_classes
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unraid_artifact_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0044
preserved_exact_tokens:
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`ca_profile.xml`"
  - "`assets/maintainer/`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-050 - Artifact Input Provenance Matrix

```yaml
plan_unit_id: CRAU-050
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The Unraid artifact input provenance matrix preserves each canonical PM field
  with primary source, fallback or user override, auto-commit requirement, and
  auto-push requirement, including project_slug, display_name, image_ref,
  image_digest, registry_host, web_ui_url, support_url, overview_markdown,
  icon_source, category_labels[], config_items[], maintainer_slug, and
  maintainer_profile.
gui_related: false
gui_classification_reason: Artifact provenance is model and generation metadata, not primarily visual presentation.
split_recommended: false
depends_on: [CRAU-049]
unblocks: [CRAU-051, CRAU-053]
acceptance_criteria:
  - The provenance matrix preserves primary source, fallback/user override, auto-commit, and auto-push columns.
  - All canonical PM fields named in the source span remain represented.
  - docker_publish_result, preview/runtime URL, shared/per-project ca_profile state, and user overrides remain distinct provenance sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provenance_mapping_loss
reasoning_tier: standard
context_scope: artifact_input_provenance_matrix
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: artifact_provenance_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0045
preserved_exact_tokens:
  - "`project_slug`"
  - "`image_ref`"
  - "`docker_publish_result`"
  - "`docker_publish_result.digest[]`"
  - "`registry_host`"
  - "`web_ui_url`"
  - "`overview_markdown`"
  - "`category_labels[]`"
  - "`config_items[]`"
  - "`maintainer_profile`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-051 - Application Template Round Trip Contract

```yaml
plan_unit_id: CRAU-051
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The first implementation supports deterministic generation and round-trip
  update of the application template conceptual fields, may use an internal
  normalized model rather than hard-coding UI logic to raw XML tags, must map the
  normalized model 1:1 to emitted XML and document it, and must preserve unknown
  fields from an existing template unless the user explicitly removes them.
gui_related: true
gui_classification_reason: Template fields and update behavior are surfaced through user-visible editing/generation flows.
split_recommended: true
split_recommendation_reason: Source span S0046 mixes minimum field support with normalized model and passthrough preservation rules.
depends_on: [CRAU-050]
unblocks: [CRAU-052, CRAU-053, CRAU-054]
acceptance_criteria:
  - First implementation supports the listed conceptual fields including display name, image reference, registry host, overview, support URL, web UI URL, icon/image source, category labels, config entries, maintainer slug, and owning template path.
  - Internal normalized model maps 1:1 to emitted XML and is documented.
  - Unknown fields present in existing templates are preserved unless explicitly removed by the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_roundtrip_data_loss
reasoning_tier: high
context_scope: application_template_round_trip
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: application_template_round_trip
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0046
preserved_exact_tokens:
  - "deterministic generation"
  - "round-trip update"
  - "normalized model"
  - "1:1"
negative_constraints:
  - "Unknown fields present in an existing template must be preserved on update unless the user explicitly removes them."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-052 - ca_profile Editability And Round Trip Contract

```yaml
plan_unit_id: CRAU-052
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The statement that all ca_profile.xml fields are editable requires both a
  structured editor for canonical known fields and an advanced raw XML editor for
  any unmodeled field, element, attribute, or passthrough content; both save
  paths preserve passthrough content, existing ca_profile.xml parses into a
  normalized editor model, minimum editable controls cover maintainer display
  name, slug, overview/about, support URL, and icon/image source, uploaded images
  copy into the managed template repo by default, and external URL mode preserves
  the exact URL entered.
gui_related: true
gui_classification_reason: Structured and raw XML editors, editable controls, uploaded image handling, and URL mode are visible maintainer profile UI behavior.
split_recommended: true
split_recommendation_reason: Source spans S0047-S0048 combine an empty heading and detailed editability/round-trip requirements.
depends_on: [CRAU-049, CRAU-051]
unblocks: [CRAU-053, CRAU-056]
acceptance_criteria:
  - All-fields-editable claim requires both structured editor and advanced raw XML editor.
  - Structured editor round-trips through the normalized model used by generation/update.
  - Unknown or unmodeled content remains editable through raw XML and saves preserve unmodified passthrough content verbatim.
  - Existing ca_profile.xml preserves all fields including fields not exposed individually by the current UI.
  - Uploaded images copy into the managed template repo by default; external URL mode preserves the exact entered URL.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_editability_overclaim
reasoning_tier: high
context_scope: ca_profile_editability_round_trip
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_round_trip_editability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0048
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "Structured editor"
  - "Advanced raw XML editor"
  - "round-trip"
negative_constraints:
  - "Puppet Master MUST NOT claim \"all fields editable\" unless both layers exist."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-053 - Template Review Gate And needs_review State

```yaml
plan_unit_id: CRAU-053
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Generated template output treats image_ref as final only after successful
  Docker publish, marks the result needs_review when support_url,
  overview_markdown, or icon_source is missing or when existing XML cannot map
  safely, allows local save and local auto-commit during needs_review, blocks
  auto-push, surfaces a visible Docker Manager warning, and preserves existing
  fields rather than dropping data silently.
gui_related: true
gui_classification_reason: needs_review warning, local inspection/editing, and auto-push blocking are visible Docker Manager behavior.
split_recommended: false
depends_on: [CRAU-046, CRAU-051, CRAU-052]
unblocks: [CRAU-055, CRAU-057, CRAU-063]
acceptance_criteria:
  - Successful Docker publish is required before image_ref is final.
  - Missing support_url, overview_markdown, or icon_source marks needs_review.
  - needs_review does not block local save or local auto-commit.
  - needs_review blocks auto-push and surfaces visible warning in Docker Manager.
  - Existing fields that cannot be mapped safely are preserved and marked needs_review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_gate_bypass
reasoning_tier: high
context_scope: template_review_gate_needs_review
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_review_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0049
preserved_exact_tokens:
  - "`image_ref`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`needs_review`"
negative_constraints:
  - "`needs_review` MUST NOT block local save or local auto-commit, but it MUST block auto-push."
  - "Puppet Master must not drop unmapped existing XML data silently."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-054 - Application Template XML Root And Passthrough Emission

```yaml
plan_unit_id: CRAU-054
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Application template XML emission uses exact root Container version 2, emits
  known child elements in canonical order Name, Repository, Registry, Network,
  MyIP, WebUI, Support, Overview, Category, Icon, and repeated Config, emits
  Overview as CDATA, escapes other known text nodes, omits optional known
  elements when empty, and preserves unknown elements, attributes, comments, and
  root attributes verbatim on round-trip unless the user explicitly removes them.
gui_related: true
gui_classification_reason: Generated XML output is inspected and edited through user-visible Unraid template flows.
split_recommended: true
split_recommendation_reason: Source span S0051 also includes Config mapping rules split into CRAU-055.
depends_on: [CRAU-051]
unblocks: [CRAU-055, CRAU-056]
acceptance_criteria:
  - Root element is exactly <Container version=\"2\">.
  - Known child order remains Name, Repository, Registry, Network, MyIP, WebUI, Support, Overview, Category, Icon, repeated Config.
  - Overview emits as CDATA; other known text nodes emit escaped text.
  - Unknown elements, attributes, XML comments, and root attributes preserve verbatim on round-trip unless explicitly removed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: xml_shape_drift
reasoning_tier: high
context_scope: application_template_xml_root_passthrough
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: xml_emission_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0051
preserved_exact_tokens:
  - "`<Container version=\"2\">`"
  - "`Name`"
  - "`Repository`"
  - "`Registry`"
  - "`Network`"
  - "`MyIP`"
  - "`WebUI`"
  - "`Support`"
  - "`Overview`"
  - "`Category`"
  - "`Icon`"
  - "`Config`"
negative_constraints:
  - "Unknown XML content must not be dropped during round-trip unless explicitly removed by the user."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-055 - Config XML Mapping And Review Fallback

```yaml
plan_unit_id: CRAU-055
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  First implementation Config mapping supports Port, Path, Variable, and Device
  shapes with required Name, Target, Default, Display, Required, Mask, and Mode
  rules; Display defaults to always unless explicitly hidden, Required is true
  only when mandatory for a successful run, Mask is true only for secret
  environment variables, Mode is required only for Type Port and is exactly tcp
  or udp, and unmappable source items preserve prior XML unchanged and mark
  needs_review.
gui_related: true
gui_classification_reason: Config mappings determine visible generated template fields and review fallback behavior.
split_recommended: true
split_recommendation_reason: Source span S0051 combines root XML emission with Config mapping rules.
depends_on: [CRAU-053, CRAU-054]
unblocks: [CRAU-056]
acceptance_criteria:
  - Port, Path, Variable, and Device Config shapes preserve required attributes.
  - Display defaults always unless hidden by explicit user choice.
  - Mask is true only for secret environment variables.
  - Mode is required only for Type Port and is exactly tcp or udp.
  - Unmappable source items preserve prior XML unchanged and mark needs_review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: config_mapping_invention
reasoning_tier: high
context_scope: config_xml_mapping_review_fallback
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: config_xml_mapping_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0051
preserved_exact_tokens:
  - "`<Config Type=\"Port\" ... />`"
  - "`<Config Type=\"Path\" ... />`"
  - "`<Config Type=\"Variable\" ... />`"
  - "`<Config Type=\"Device\" ... />`"
  - "`Display`"
  - "`Mask`"
  - "`Mode`"
  - "`tcp`"
  - "`udp`"
negative_constraints:
  - "Puppet Master must not invent values when it cannot map a source item into the required attribute set."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-056 - Known XML Field Registry

```yaml
plan_unit_id: CRAU-056
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The first implementation keeps a known XML field registry: application
  template fields map display_name, image_ref, registry_host, web_ui_url,
  support_url, overview_markdown, icon_source, category_labels[], and
  config_items[] to their XML shapes with local-save and auto-push requirements,
  while ca_profile.xml recognized fields map display_name, overview_markdown,
  support_url, and icon_source to XML elements required for auto-push.
gui_related: true
gui_classification_reason: Known field mapping drives visible template/profile editors and generated XML review.
split_recommended: true
split_recommendation_reason: This unit folds structural S0050 plus field tables S0052-S0053 into one registry contract.
depends_on: [CRAU-054, CRAU-055]
unblocks: [CRAU-063]
acceptance_criteria:
  - Application template normalized fields map to the documented XML elements/shapes.
  - Required-for-local-save and required-for-auto-push columns remain preserved.
  - ca_profile.xml recognized fields display_name, overview_markdown, support_url, and icon_source are required for auto-push.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: field_registry_drift
reasoning_tier: standard
context_scope: known_xml_field_registry
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: known_xml_field_registry
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0052
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0053
preserved_exact_tokens:
  - "`display_name`"
  - "`image_ref`"
  - "`registry_host`"
  - "`web_ui_url`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`category_labels[]`"
  - "`config_items[]`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-057 - Unmanaged Local Generation Output

```yaml
plan_unit_id: CRAU-057
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When Unraid generation is enabled but managed template-repo handling is
  disabled, unconfigured, or invalid, Puppet Master still generates a local
  artifact set under .puppet-master/generated/unraid/project_id/publish_result_id
  with template XML, ca_profile.xml when projected, and repo-managed uploaded
  assets, emits unraid.template.generation.completed, and records template_repo_id
  null plus commit_status and push_status not_attempted.
gui_related: false
gui_classification_reason: Local artifact generation target and status fields are backend output semantics; visible copy is split into CRAU-058.
split_recommended: true
split_recommendation_reason: Source span S0055 also includes visible copy and distribution target rationale split into CRAU-058.
depends_on: [CRAU-049, CRAU-053]
unblocks: [CRAU-058, CRAU-059]
acceptance_criteria:
  - Local artifacts are generated even when managed template-repo handling is disabled, unconfigured, or invalid.
  - Output path is .puppet-master/generated/unraid/<project_id>/<publish_result_id>/.
  - Required output includes template/<maintainer_slug>/<project_slug>.xml, template/ca_profile.xml when active profile is projected, and template/assets/maintainer/** for repo-managed uploaded assets.
  - unraid.template.generation.completed still fires.
  - template_repo_id is null and commit_status/push_status are not_attempted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: local_artifact_loss
reasoning_tier: standard
context_scope: unmanaged_local_generation_output
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unmanaged_local_generation_output
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0055
preserved_exact_tokens:
  - "`.puppet-master/generated/unraid/<project_id>/<publish_result_id>/`"
  - "`unraid.template.generation.completed`"
  - "`template_repo_id`"
  - "`commit_status`"
  - "`push_status`"
  - "`not_attempted`"
negative_constraints:
  - "Managed repo invalidity must not suppress local Unraid artifact generation when generation is enabled."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-058 - Distribution Target Rationale And Local Result UX

```yaml
plan_unit_id: CRAU-058
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Unmanaged local generation describes the result as generated locally / not
  attached to a managed repo, and the default distribution target for generated
  Unraid XML is a separate Unraid template repository or Community
  Applications-friendly template location rather than DockerHub or the main
  application repository by default, preserving the rationale that DockerHub
  stores images, public Unraid template distribution commonly uses GitHub
  template repositories, and installed copies live under
  /boot/config/plugins/dockerMan/templates-user.
gui_related: true
gui_classification_reason: Local-result wording and default distribution target are visible user-facing publishing semantics.
split_recommended: true
split_recommendation_reason: This unit folds structural distribution heading S0054 with visible rationale and copy from S0055.
depends_on: [CRAU-057]
unblocks: [CRAU-060]
acceptance_criteria:
  - UI copy describes unmanaged output as generated locally / not attached to a managed repo.
  - Separate Unraid template repository or Community Applications-friendly template location is the primary default distribution target.
  - Main application repository is optional export target only, not primary default.
  - Rationale preserves DockerHub images, GitHub template repository workflows, and Unraid installed-copy path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: distribution_target_confusion
reasoning_tier: standard
context_scope: distribution_target_rationale_local_result_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: distribution_target_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0054
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0055
preserved_exact_tokens:
  - "generated locally / not attached to a managed repo"
  - "Community Applications"
  - "DockerHub stores images, not Unraid XML"
  - "`/boot/config/plugins/dockerMan/templates-user`"
negative_constraints:
  - "DockerHub must not be treated as the Unraid XML distribution target."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-059 - Default Unraid Generation Toggle

```yaml
plan_unit_id: CRAU-059
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Unraid XML generation automatically runs after successful image publish by
  default, a nearby GUI toggle can disable this behavior, and generation is part
  of the first-class Docker publish flow rather than a hidden manual afterthought.
gui_related: true
gui_classification_reason: The default generation behavior and nearby GUI toggle are visible settings/workflow behavior.
split_recommended: false
depends_on: [CRAU-048, CRAU-057]
unblocks: [CRAU-060]
acceptance_criteria:
  - Generate/update Unraid XML after successful image publish defaults enabled.
  - Nearby GUI toggle disables generation.
  - Generation remains part of first-class Docker publish flow, not hidden manual follow-up.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_generation_default
reasoning_tier: standard
context_scope: default_unraid_generation_toggle
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unraid_generation_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0056
preserved_exact_tokens:
  - "automatically generate/update Unraid XML"
  - "nearby GUI toggle"
negative_constraints:
  - "Unraid XML generation must not become a hidden manual afterthought."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-060 - Managed Template Repo Workflow Default

```yaml
plan_unit_id: CRAU-060
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master manages the Unraid template repository workflow itself by
  default, while the user can disable managed template-repo handling in settings.
gui_related: false
gui_classification_reason: The default workflow ownership is product behavior; settings UI consumes it through FinalGUISpec.
split_recommended: false
depends_on: [CRAU-059]
unblocks: [CRAU-061]
acceptance_criteria:
  - Managed template-repo workflow is enabled by default.
  - User can disable managed template-repo handling in settings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: managed_repo_default_drift
reasoning_tier: standard
context_scope: managed_template_repo_workflow_default
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: managed_template_repo_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0057
preserved_exact_tokens:
  - "manage the Unraid template repository workflow itself by default"
  - "disable managed template-repo handling"
negative_constraints: []
consumer_hints:
  - Plans/FinalGUISpec.md consumes the settings UI for disabling managed template-repo handling.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-061 - Template Repo Default Identity

```yaml
plan_unit_id: CRAU-061
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Managed template-repo setup defaults create-new repository identity to repo
  name project_slug-unraid-template, branch main, local managed working copy
  .puppet-master/unraid-template-repos/project_id, template path
  maintainer_slug/project_slug.xml, and maintainer profile path ca_profile.xml,
  while repo name, branch, local path, and maintainer slug are overrideable
  during setup.
gui_related: false
gui_classification_reason: Default repository identity, branch, paths, and overrideable setup fields are storage/project configuration semantics.
split_recommended: true
split_recommendation_reason: This unit folds structural parent headings S0058-S0059 plus default identity rules S0060.
depends_on: [CRAU-060]
unblocks: [CRAU-062, CRAU-063]
acceptance_criteria:
  - Create-new template repo defaults repo name to <project_slug>-unraid-template.
  - Default branch is main.
  - Local managed working copy is .puppet-master/unraid-template-repos/<project_id>/.
  - Template path is <maintainer_slug>/<project_slug>.xml and profile path is ca_profile.xml.
  - User may override repo name, branch, local path, and maintainer slug during setup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: repo_identity_drift
reasoning_tier: standard
context_scope: template_repo_default_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0060
preserved_exact_tokens:
  - "`<project_slug>-unraid-template`"
  - "`main`"
  - "`.puppet-master/unraid-template-repos/<project_id>/`"
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`ca_profile.xml`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-062 - Existing Template Repo Validation

```yaml
plan_unit_id: CRAU-062
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Selecting an existing template repository validates that the path or repo is
  reachable, repo root is writable locally, selected branch exists or can be
  created explicitly, required layout already matches or can migrate with
  explicit user confirmation, and unrelated uncommitted changes are absent unless
  the user explicitly adopts the repo in its current state; validation failure
  disables managed publishing for the project and shows the exact failing condition.
gui_related: true
gui_classification_reason: Existing-repo selection, validation failure, exact failing condition, and disabled managed publishing state are visible setup behavior.
split_recommended: false
depends_on: [CRAU-061]
unblocks: [CRAU-063]
acceptance_criteria:
  - Existing repo selection validates reachability, local writability, branch existence/explicit creation, layout/migration confirmation, and unrelated changes/adoption.
  - Validation failure keeps managed publishing disabled for the project.
  - Validation failure shows the exact failing condition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: repo_validation_bypass
reasoning_tier: high
context_scope: existing_template_repo_validation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: existing_template_repo_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0061
preserved_exact_tokens:
  - "select existing template repo"
  - "explicit user confirmation"
negative_constraints:
  - "Managed publishing must remain disabled for that project when existing repo validation fails."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-063 - Template Repo Status State Model

```yaml
plan_unit_id: CRAU-063
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The template-repo status row uses one canonical state model preserving
  unconfigured, config_invalid, clean, dirty_uncommitted, committed_local_only,
  push_in_progress, push_failed, diverged_remote, and needs_review with their
  meanings and user-visible consequences; transition rules continue in the next
  bounded source window.
gui_related: true
gui_classification_reason: The template-repo status row and user-visible consequences are visible settings/publishing UI state.
split_recommended: false
depends_on: [CRAU-053, CRAU-062]
unblocks: []
acceptance_criteria:
  - Template-repo status row uses exactly one canonical state model.
  - unconfigured shows setup CTA.
  - config_invalid blocks publish follow-on push and shows remediation.
  - committed_local_only shows one-click push CTA.
  - push_in_progress disables duplicate push actions.
  - push_failed preserves local commit and shows retry CTA/error.
  - diverged_remote blocks auto-push and requires review/reconcile.
  - needs_review allows local inspection/editing and blocks auto-push.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_status_drift
reasoning_tier: high
context_scope: template_repo_status_state_model
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_status_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0062
preserved_exact_tokens:
  - "`unconfigured`"
  - "`config_invalid`"
  - "`clean`"
  - "`dirty_uncommitted`"
  - "`committed_local_only`"
  - "`push_in_progress`"
  - "`push_failed`"
  - "`diverged_remote`"
  - "`needs_review`"
negative_constraints:
  - "Detailed transition behavior from S0063 is covered by CRAU-064 through CRAU-066 rather than retained as residual source."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-064 - Template Repo Review Transition Rules

```yaml
plan_unit_id: CRAU-064
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  After successful image publish, Puppet Master generates or updates managed XML
  artifacts; needs_review enters when support_url, overview_markdown, icon_source,
  or safe XML mapping is missing, and clears only after regeneration or explicit
  save produces all review-required fields with no unmapped-field warning.
gui_related: true
gui_classification_reason: Template review, dirty/clean status, and user save/regeneration transitions are visible Docker Manager publishing state.
split_recommended: true
split_recommendation_reason: Source span S0063 also contains auto-commit containment and commit/push status transitions split into adjacent units.
depends_on: [CRAU-048, CRAU-053, CRAU-063]
unblocks: [CRAU-065, CRAU-066]
acceptance_criteria:
  - needs_review enters for missing support_url, overview_markdown, icon_source, or unsafe XML mapping.
  - needs_review clears only after regeneration or explicit user save produces all review-required fields and no unmapped-field warning.
  - Clearing needs_review transitions to dirty_uncommitted when managed files changed locally, otherwise clean.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_state_transition_drift
reasoning_tier: high
context_scope: template_repo_review_transitions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_transition_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`needs_review`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`dirty_uncommitted`"
  - "`clean`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-065 - Auto Commit Containment And Repo Review Gate

```yaml
plan_unit_id: CRAU-065
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Auto-commit is allowed only when the working-tree diff is fully contained
  within PM-owned paths for the current generation pass; unrelated tracked or
  untracked changes, config_invalid, diverged_remote, needs_review, or
  nondeterministic required path updates stop auto-commit and surface review.
gui_related: true
gui_classification_reason: Review blocking and Review repo state recovery CTA are visible repository workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0063 also contains review transition and push status behavior.
depends_on: [CRAU-062, CRAU-063, CRAU-064]
unblocks: [CRAU-066, CRAU-067]
acceptance_criteria:
  - PM-owned paths are exactly ca_profile.xml, <maintainer_slug>/<project_slug>.xml, and assets/maintainer/** written in the current generation pass.
  - Auto-commit is allowed only when the diff is fully contained within the PM-owned path set.
  - Unrelated tracked or untracked changes block auto-commit and surface Review repo state.
  - Auto-commit stops and surfaces review for config_invalid, diverged_remote, needs_review, unrelated files, or nondeterministic required path updates.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_auto_commit
reasoning_tier: high
context_scope: auto_commit_containment_review_gate
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auto_commit_safety_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`assets/maintainer/**`"
  - "`config_invalid`"
  - "`diverged_remote`"
  - "`Review repo state`"
negative_constraints:
  - "Auto-commit must not include unrelated tracked or untracked file changes."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-066 - Commit Push Status And Retry Transitions

```yaml
plan_unit_id: CRAU-066
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Successful local auto-commit transitions to committed_local_only; one-click
  push transitions committed_local_only to push_in_progress to clean on success;
  failed push transitions push_in_progress to push_failed and preserves the local
  commit for retry, while diverged_remote exits only after resolution and
  revalidation.
gui_related: true
gui_classification_reason: Commit/push states and retry CTAs are visible template-repository status behavior.
split_recommended: true
split_recommendation_reason: Source span S0063 includes multiple status enums and transitions.
depends_on: [CRAU-063, CRAU-065]
unblocks: [CRAU-070]
acceptance_criteria:
  - commit_status preserves not_attempted, committed, skipped_review_required, skipped_unrelated_changes, and failed.
  - push_status preserves not_attempted, skipped_auto_push_disabled, push_in_progress, completed, and failed.
  - Failed push preserves the local commit for retry.
  - diverged_remote exits only after branch divergence is resolved externally or by a future reconcile flow and Puppet Master revalidates repo state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: push_retry_state_loss
reasoning_tier: high
context_scope: commit_push_status_retry_transitions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: commit_push_status_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`committed_local_only`"
  - "`push_in_progress`"
  - "`push_failed`"
  - "`skipped_review_required`"
  - "`skipped_unrelated_changes`"
  - "`skipped_auto_push_disabled`"
  - "`completed`"
negative_constraints:
  - "A failed push must preserve the local commit for retry."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-067 - Dirty Repo Adoption Safety

```yaml
plan_unit_id: CRAU-067
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When the selected repo contains unrelated local modifications, Puppet Master
  must not silently fold managed template changes into that worktree state; it
  requires the user to clean the repo, explicitly adopt the dirty repo state, or
  switch to a different managed repo path.
gui_related: false
gui_classification_reason: Dirty-repo adoption is repository mutation safety rather than visual presentation.
split_recommended: false
depends_on: [CRAU-062, CRAU-065]
unblocks: []
acceptance_criteria:
  - Unrelated local modifications block silent managed template mutation.
  - Allowed resolutions are user cleans the repo first, user explicitly adopts the dirty repo state, or user switches to another managed repo path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dirty_repo_mutation
reasoning_tier: high
context_scope: dirty_repo_adoption_safety
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: dirty_repo_adoption_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0064
preserved_exact_tokens:
  - "user cleans the repo first"
  - "user explicitly adopts the dirty repo state"
  - "user switches to a different managed repo path"
negative_constraints:
  - "Puppet Master MUST NOT silently fold managed template changes into unrelated worktree modifications."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-068 - Template Repo Setup Choices And Repo Shape

```yaml
plan_unit_id: CRAU-068
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When managed Unraid template-repo publishing is enabled and no template repo is
  configured, Puppet Master offers both create-new and select-existing setup
  paths, and the default repository shape is one template repo per project.
gui_related: true
gui_classification_reason: Setup choices are visible onboarding controls for managed template repository publishing.
split_recommended: true
split_recommendation_reason: This unit folds setup flow and default repo shape headings into one setup-readiness contract.
depends_on: [CRAU-060, CRAU-061]
unblocks: [CRAU-069]
acceptance_criteria:
  - Create-new template repo setup is offered.
  - Select-existing template repo setup is offered.
  - Default repo shape remains one template repo per project.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_flow_default_drift
reasoning_tier: standard
context_scope: template_repo_setup_choices_shape
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_setup_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0065
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0066
preserved_exact_tokens:
  - "creating a new template repo automatically"
  - "selecting an existing template repo"
  - "one template repo per project"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-069 - Template Repo Layout And Maintainer Slug Defaults

```yaml
plan_unit_id: CRAU-069
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Managed per-project template repositories use a root-level ca_profile.xml,
  maintainer folder, and project-name.xml inside that maintainer folder; the
  maintainer folder defaults to the project's DockerHub namespace and may be
  overridden with a custom maintainer slug.
gui_related: true
gui_classification_reason: Default layout and maintainer slug override are visible setup/review configuration.
split_recommended: true
split_recommendation_reason: This unit folds default layout and maintainer folder source spans into one repository layout identity contract.
depends_on: [CRAU-061]
unblocks: [CRAU-070]
acceptance_criteria:
  - Managed repos use root-level ca_profile.xml.
  - Managed repos include a maintainer folder containing project-name.xml.
  - Maintainer folder defaults to DockerHub namespace.
  - User can override with a custom maintainer slug.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_repo_layout_drift
reasoning_tier: standard
context_scope: template_repo_layout_maintainer_slug
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_layout_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0067
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0068
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "`project-name.xml`"
  - "DockerHub namespace"
  - "custom maintainer slug"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-070 - Template Repo Commit Push Defaults And Status UX

```yaml
plan_unit_id: CRAU-070
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Template-repo changes auto-commit by default, auto-push remains configurable
  but disabled by default, one-click push is exposed after commit, and Docker
  Manager presents dirty, committed, and ready-to-push template-repo status.
gui_related: true
gui_classification_reason: One-click push and dirty/committed/ready-to-push status are visible Docker Manager UI behavior.
split_recommended: false
depends_on: [CRAU-048, CRAU-063, CRAU-066]
unblocks: [CRAU-083]
acceptance_criteria:
  - Template-repo changes auto-commit by default.
  - Auto-push is configurable but disabled by default.
  - One-click push action is exposed after commit.
  - Docker Manager shows template-repo dirty, committed, and ready-to-push status.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commit_push_default_drift
reasoning_tier: standard
context_scope: template_repo_commit_push_defaults_status_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: commit_push_status_ux
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0069
preserved_exact_tokens:
  - "auto-commit"
  - "auto-push"
  - "one-click push"
  - "dirty / committed / ready-to-push"
negative_constraints:
  - "Auto-push remains default disabled."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-071 - ca_profile Generation Scope And Editability

```yaml
plan_unit_id: CRAU-071
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  If ca_profile.xml does not exist, Puppet Master generates it and tells the user
  it still needs configuration or review; the default scope is shared
  cross-project maintainer profile, per-project maintainer profile override is
  optional, and all ca_profile.xml fields must remain editable by the user.
gui_related: true
gui_classification_reason: Generated-profile review messaging, scope controls, and editability are visible profile editor behavior.
split_recommended: true
split_recommendation_reason: This unit folds ca_profile behavior parent, generation, scope, and editability rule spans.
depends_on: [CRAU-052, CRAU-060]
unblocks: [CRAU-072, CRAU-073, CRAU-083]
acceptance_criteria:
  - Missing ca_profile.xml is generated.
  - User is told generated profile still needs configuration or review.
  - Shared cross-project maintainer profile is default scope.
  - Per-project maintainer profile override is available.
  - All ca_profile.xml fields remain editable by the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_scope_editability_drift
reasoning_tier: high
context_scope: ca_profile_generation_scope_editability
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_generation_scope_editability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0071
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0073
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "shared cross-project maintainer profile"
  - "per-project maintainer profile"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-072 - ca_profile Image Handling And Public Metadata Reminder

```yaml
plan_unit_id: CRAU-072
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The ca_profile.xml editor supports both uploaded or selected images copied
  into the managed template repository and external hosted image URLs; uploaded
  images default to repo-managed assets, and auto-generated profiles show a clear
  reminder that public-facing maintainer metadata should be configured before the
  repo is treated as final.
gui_related: true
gui_classification_reason: Image-mode selection and public metadata reminder are visible profile editor behavior.
split_recommended: true
split_recommendation_reason: This unit folds image handling and user-visible messaging spans.
depends_on: [CRAU-052, CRAU-071]
unblocks: [CRAU-083]
acceptance_criteria:
  - Profile editor supports upload/select image copied into managed template repository.
  - Profile editor supports external hosted image URL.
  - Uploaded images default to repo-managed assets.
  - Auto-generated profile shows public-facing maintainer metadata review reminder.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_asset_and_metadata_review_gap
reasoning_tier: standard
context_scope: ca_profile_image_handling_public_metadata_reminder
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_asset_message_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0074
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0075
preserved_exact_tokens:
  - "external hosted image URL"
  - "repo-managed asset"
  - "public-facing maintainer metadata"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-073 - Docker Manager Scope Split And Migration Alias State

```yaml
plan_unit_id: CRAU-073
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager scope rules are normative: Hide Docker Manager when not used in
  Project. is global, Hide Docker Manage when not used in Project. is a
  migration alias only, Docker Manager navigation/dock/panel state and
  template-repo configuration/status are project-scoped, widget layouts are
  project-scoped with limited global fallback, shared ca_profile state is global
  unless per-project override is enabled, and effective-auth snapshots are
  advisory cached state until revalidation.
gui_related: true
gui_classification_reason: Scope, migration aliasing, navigation state, widget layout scope, and advisory auth snapshots affect visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source spans S0076-S0077 mix scope rules with implementation state inventory and blocked-outcome state.
depends_on: [CRAU-004, CRAU-006, CRAU-007, CRAU-019, CRAU-063]
unblocks: [CRAU-074, CRAU-075]
acceptance_criteria:
  - Hide Docker Manager when not used in Project. is global.
  - Hide Docker Manage when not used in Project. is migration alias only and migrates on read.
  - Docker Manager navigation/dock/panel state and template-repo state are project-scoped.
  - Shared ca_profile state is global unless per-project override is enabled.
  - Effective-auth snapshots remain advisory until revalidation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_storage_drift
reasoning_tier: high
context_scope: docker_manager_scope_split_migration_alias
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: state_scope_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0076
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0077
preserved_exact_tokens:
  - "`Hide Docker Manager when not used in Project.`"
  - "`Hide Docker Manage when not used in Project.`"
  - "TemplateRepoStatus"
  - "effective-auth snapshots"
compatibility_only_notes:
  - "The older Hide Docker Manage setting key is a migration alias only."
negative_constraints:
  - "The legacy Hide Docker Manage key must not become a separate active setting."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-074 - Implementation State Inventory And Blocked Outcome State

```yaml
plan_unit_id: CRAU-074
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Implementation-facing docs preserve Docker Manager state concepts for detection,
  hide setting aliasing, requested/effective auth, DockerHub identity, namespace,
  repository, privacy, push policy, tag defaults, Unraid toggles, template-repo
  location/remote/branch/status, auto-push, ca_profile scope, image mode, and
  blocked remote side effects, which remain first-class state transitions
  distinct from runtime failures in UI, event, and persisted result state.
gui_related: true
gui_classification_reason: The state inventory drives visible settings, status, blocked views, and persisted UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0077 mixes scope, state inventory, and blocked outcome requirements.
depends_on: [CRAU-019, CRAU-029, CRAU-043, CRAU-063, CRAU-073]
unblocks: [CRAU-084]
acceptance_criteria:
  - Implementation docs preserve every listed Docker Manager state concept.
  - Blocked remote side effects remain distinguishable from runtime failures in UI state, event state, and persisted results.
  - Effective-auth snapshots are advisory cached state until revalidation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state_or_projection_drift
reasoning_tier: high
context_scope: implementation_state_inventory_blocked_outcome
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: implementation_state_inventory
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0077
preserved_exact_tokens:
  - "requested auth mode"
  - "effective auth capability set"
  - "selected namespace and repository"
  - "selected repository privacy"
  - "auto-generate Unraid XML toggle"
  - "managed template-repo enabled toggle"
  - "uploaded image asset mode vs external URL mode"
negative_constraints:
  - "Blocked remote side effects must not collapse into runtime failures."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-075 - Orchestrator Vocabulary Consumer Boundary

```yaml
plan_unit_id: CRAU-075
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager consumes shared orchestrator/runtime vocabulary rather than
  owning terms such as Feature Seam, Work Package, package/seam overseers,
  promotion class, lane pool, contamination, safe point, restore point, rollback,
  and effective execution identity; Docker Manager copy preserves the boundary
  between execution truth, projections, and page or widget/page UI-only overlays.
gui_related: true
gui_classification_reason: Vocabulary ownership affects user-facing Docker Manager copy, badges, receipts, disabled controls, and help text.
split_recommended: true
split_recommendation_reason: Source span S0078 is ownership-sensitive and split into vocabulary, approval, identity, routing, and help units.
depends_on: [CRAU-015, CRAU-023, CRAU-073]
unblocks: [CRAU-076, CRAU-077, CRAU-078, CRAU-079, CRAU-080]
acceptance_criteria:
  - Docker Manager does not re-own canonical definitions from Glossary, Crosswalk, Decision Policy, 00-plans-index, or plans-index.
  - Docker Manager copy preserves execution truth versus projection versus UI-only overlay boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: orchestrator_vocabulary_consumer_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: vocabulary_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "Feature Seam"
  - "Work Package"
  - "Promotion"
  - "safe point"
  - "restore point"
  - "effective execution identity"
negative_constraints:
  - "Docker Manager must not re-own shared orchestrator/runtime vocabulary."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
```

### CRAU-076 - Hard Gate And Action-Specific Confirmation Boundary

```yaml
plan_unit_id: CRAU-076
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  hard_gate, HITL /blocked, and remote-side-effect actions use the canonical
  approval/blocked flow and cannot be downgraded into generic UI confirmation;
  action-specific confirmation rules remain distinct for create repository,
  push, rollback, cleanup, delete, and cluster mutation flows with their own
  reversibility and confirmation evidence.
gui_related: true
gui_classification_reason: Approval/blocker rendering and confirmation copy are visible Docker Manager interaction behavior.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes approval taxonomy with identity, routing, and help semantics.
depends_on: [CRAU-015, CRAU-031, CRAU-043, CRAU-075]
unblocks: [CRAU-081, CRAU-084]
acceptance_criteria:
  - hard_gate and HITL /blocked remote-side-effect actions use canonical approval/blocked flow.
  - Docker Manager may render blockers but must not downgrade them into generic local confirmation copy.
  - Action-specific confirmation remains distinct from HITL approval.
  - Non-bypassable hard_gate actions use allowed action IDs rather than generic modals.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_bypass
reasoning_tier: high
context_scope: hard_gate_action_specific_confirmation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: confirmation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`hard_gate`"
  - "`/blocked`"
  - "`remote-side-effect`"
  - "`allowed_action_ids`"
negative_constraints:
  - "Docker Manager must not downgrade canonical blockers into generic UI confirmation."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-077 - Requested Effective Execution Identity Disclosure

```yaml
plan_unit_id: CRAU-077
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Requested versus effective execution identity remains runtime-facing and
  auditable across requested/effective platform, model, variant, auth, account,
  Persona, provider/auth/account selection flow, selection/switch reason, and
  skipped, honored, or clamped controls; requested_account_policy is not a
  substitute for a user-selected requested_account_id.
gui_related: true
gui_classification_reason: Requested/effective identity, switch reasons, and skipped/clamped controls are visible state disclosure.
split_recommended: true
split_recommendation_reason: Source span S0078 combines identity disclosure with routing and help semantics.
depends_on: [CRAU-018, CRAU-029, CRAU-075]
unblocks: [CRAU-079]
acceptance_criteria:
  - Requested/effective execution identity remains runtime-facing and auditable.
  - requested_account_policy does not replace requested_account_id.
  - Concrete account selection and fallback remain visible to provider, chat-thread, /chat/SCM, and SCM consumers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_visibility_gap
reasoning_tier: high
context_scope: requested_effective_execution_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: requested_effective_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`requested`"
  - "`effective`"
  - "`selection_reason`"
  - "`/clamped`"
  - "`/switch`"
  - "`requested_account_policy`"
  - "`requested_account_id`"
negative_constraints:
  - "`requested_account_policy` is not a substitute for a user-selected `requested_account_id`."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-078 - Runtime Projection Scope And Stale Key Disposition

```yaml
plan_unit_id: CRAU-078
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Runtime/projection events classify as runtime-internal, operator-visible, or
  chat-thread resolution events; multi-project, multi-account, and multi-worktree
  orchestration scopes identity and references by project, package, seam, node,
  account, and worktree, while stale tier_id usage is migration-only
  compatibility state and not a Docker Manager coordination key.
gui_related: true
gui_classification_reason: Projection scopes and stale-key disclosures affect visible navigation and audit joins.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes projection scope with approval, identity, route, and help semantics.
depends_on: [CRAU-019, CRAU-020, CRAU-075]
unblocks: [CRAU-079]
acceptance_criteria:
  - Runtime/projection events keep runtime-internal, operator-visible, and chat-thread resolution classifications.
  - Identity/projection/storage references are scoped by project, package, seam, node, account, and worktree.
  - tier_id remains migration-only compatibility state and not a new navigation or audit join key.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_scope_or_stale_key_revival
reasoning_tier: high
context_scope: runtime_projection_scope_stale_key_disposition
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_projection_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`tier_id`"
  - "package"
  - "seam"
  - "lane"
  - "node"
  - "attempt"
  - "receipt"
  - "worktree"
  - "runtime asset"
compatibility_only_notes:
  - "Stale tier_id usage is migration-only compatibility state, not a Docker Manager coordination-state key."
negative_constraints:
  - "New navigation and audit joins must not use tier_id."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-079 - Route Activation Cross-Surface SCM And Display Labels

```yaml
plan_unit_id: CRAU-079
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  cmd.panel.switch is shell-state only; object-bearing Docker Manager targeting
  routes through shared route/open target contracts, PM-owned SCM state registers
  with Orchestrator, Source Control, /Source, and Docker Manager, recovery
  consumers see allowed_action_ids and allowed_action_ids[], and requested/effective
  display groups use exact labels Requested, Effective, Reason, Support,
  Inherited from, and Overridden by.
gui_related: true
gui_classification_reason: Routing, destination panels, recovery state, and display labels are user-visible UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes route activation with SCM state and label grammar.
depends_on: [CRAU-015, CRAU-024, CRAU-063, CRAU-075, CRAU-077, CRAU-078]
unblocks: [CRAU-080]
acceptance_criteria:
  - cmd.panel.switch remains shell-state only.
  - Object-bearing targeting routes through shared route/open target contracts.
  - Route activation does not reuse destination-local state when doing so would obscure requested target in /GUI.
  - PM-owned SCM state registers with all named owner/consumer surfaces.
  - Requested/effective display groups preserve exact labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_target_or_cross_surface_state_drift
reasoning_tier: high
context_scope: route_activation_cross_surface_scm_display_labels
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: route_and_cross_surface_scm_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`cmd.panel.switch`"
  - "`route-activation`"
  - "`/GUI`"
  - "`allowed_action_ids`"
  - "`allowed_action_ids[]`"
  - "`Requested`"
  - "`Effective`"
  - "`Reason`"
  - "`Support`"
  - "`Inherited from`"
  - "`Overridden by`"
negative_constraints:
  - "Object-bearing targeting must not be smuggled through panel-switch shell state."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-080 - Canonical Help Semantics And Runtime Recovery Vocabulary

```yaml
plan_unit_id: CRAU-080
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager help must not flatten canonical terms into one-line tooltips;
  Simple, Expert, ELI5, Expert/ELI5, and tooltip variants keep stable
  terminology, object/state/action distinctions, canonical reason codes and
  evidence, dedicated help entries, and separate safe-point, restore-point,
  rollback, and contamination recovery vocabulary.
gui_related: true
gui_classification_reason: Help text, tooltips, ELI5/Expert variants, and runtime recovery copy are visible user-facing copy.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes help semantics with approval, identity, and routing contracts.
depends_on: [CRAU-023, CRAU-075, CRAU-079]
unblocks: []
acceptance_criteria:
  - Help text does not flatten canonical terms into one-line substitutions.
  - Simple/Expert/ELI5 and tooltip variants distinguish object, state, action, reason code, and evidence.
  - Dedicated help-entry candidates remain preserved.
  - safe-point, restore-point, rollback, and contamination remain distinct across storage/UI.
  - Contextual help stays limited to local affordances, counts, badges, one-surface controls, and provider caveats.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminology_flattening
reasoning_tier: high
context_scope: canonical_help_runtime_recovery_vocabulary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
node_compile_hint:
  mode: canonical_help_recovery_vocabulary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`/Expert/ELI5`"
  - "`/tooltip`"
  - "`safe-point`"
  - "`restore-point`"
  - "History vs Ledger"
  - "historical vs superseded vs revoked vs reopened"
negative_constraints:
  - "Help text must not flatten canonical state vocabulary into one-line tooltips."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
```

### CRAU-081 - Docker Unraid Safety Constraints

```yaml
plan_unit_id: CRAU-081
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker/Unraid safety constraints keep repository creation confirmation
  mandatory and non-bypassable, keep secrets out of redb, project files, YAML,
  and evidence, redact secrets in publish/template-repo logs and evidence,
  distinguish DockerHub image distribution from Unraid template distribution,
  preserve browser login and PAT as different inputs that may yield different
  effective capability, and prevent UI overclaim when validation shows partial
  repository-management capability.
gui_related: true
gui_classification_reason: Confirmation, capability display, redaction, and distribution distinction are user-visible safety behavior.
split_recommended: false
depends_on: [CRAU-026, CRAU-028, CRAU-031, CRAU-045, CRAU-076]
unblocks: [CRAU-082, CRAU-083]
acceptance_criteria:
  - Repository creation confirmation is mandatory and non-bypassable.
  - Secrets are not written to redb, project files, YAML, or evidence.
  - Publish/template-repo logs and evidence redact secrets.
  - Docs distinguish DockerHub image distribution from Unraid template distribution.
  - Browser login and PAT remain distinct inputs that may produce different effective capability.
  - UI does not claim full repository-management support when validation shows partial capability.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_or_capability_overclaim
reasoning_tier: high
context_scope: docker_unraid_safety_constraints
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_unraid_safety_constraints
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0079
preserved_exact_tokens:
  - "redb"
  - "YAML"
  - "DockerHub image distribution"
  - "Unraid template distribution"
  - "browser login"
  - "PAT"
negative_constraints:
  - "Secrets must not be written to redb, project files, YAML, or evidence."
  - "The UI must not claim full repository-management support when validation shows only partial capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-082 - Initial Non Goals And Review Bounds

```yaml
plan_unit_id: CRAU-082
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Initial first-class Docker/Unraid scope does not require Community Applications
  submission-form submission, forum support-thread creation, fully automatic
  remote template-repo push by default, or bypassing manual review for public
  maintainer metadata correctness.
gui_related: true
gui_classification_reason: Initial non-goals bound visible automation and review expectations.
split_recommended: false
depends_on: [CRAU-048, CRAU-053, CRAU-060, CRAU-081]
unblocks: [CRAU-083]
acceptance_criteria:
  - Community Applications submission-form submission remains out of initial scope.
  - Forum support-thread creation remains out of initial scope.
  - Fully automatic remote template-repo push by default remains out of initial scope.
  - Manual review for public maintainer metadata correctness is not bypassed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_creep
reasoning_tier: standard
context_scope: initial_non_goals_review_bounds
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: non_goal_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0080
preserved_exact_tokens:
  - "Community Applications"
  - "forum support-thread"
  - "fully automatic remote template-repo push by default"
negative_constraints:
  - "Initial scope must not bypass manual review for public maintainer metadata correctness."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-083 - End To End Acceptance Criteria Overlay

```yaml
plan_unit_id: CRAU-083
unit_type: acceptance_overlay
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The end-to-end acceptance overlay preserves checklist assertions for DockerHub
  auth, requested/effective capability display, namespace/repository discovery,
  non-bypassable missing-repo creation, private default, build/run access,
  publish result digest/tag/registry info, Unraid generation defaults, managed
  template-repo defaults, ca_profile.xml generation/editability/scope, profile
  image modes, and template-repo commit/push UX without creating separate
  implementation scope.
gui_related: true
gui_classification_reason: Acceptance criteria cover visible GUI auth, repository, Docker Manager, Unraid, and template-repo workflows.
split_recommended: false
depends_on: [CRAU-026, CRAU-029, CRAU-031, CRAU-035, CRAU-048, CRAU-070, CRAU-071, CRAU-072, CRAU-081, CRAU-082]
unblocks: []
acceptance_criteria:
  - The S0081 acceptance checklist remains preserved as validation overlay.
  - Acceptance bullets map to owner units rather than creating duplicate WorkNode or implementation scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance_coverage_drift
reasoning_tier: standard
context_scope: containers_registry_unraid_acceptance_overlay
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: acceptance_overlay
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0081
preserved_exact_tokens:
  - "PAT-recommended helper text"
  - "New repository creation defaults to private"
  - "digest/tag/registry info"
  - "root `ca_profile.xml` plus maintainer folder plus `project-name.xml`"
negative_constraints:
  - "Acceptance overlay must not become a standalone WorkNode seed."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-084 - Remote Side Effect Blocked Payload Normalization

```yaml
plan_unit_id: CRAU-084
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker/Unraid remote-side-effect contracts are the reference pattern for
  blocked remote mutation: remote side effects blocked by confirmation or policy
  remain blocked rather than failed, completed local work is preserved, auth
  recovery does not auto-resubmit or auto-publish, UI explains when local
  artifacts exist but remote publish remains blocked, runtime-facing blocked
  payloads use blocked_reason_code plus ordered allowed_action_ids[],
  preserved_local_work, and optional detail_ref, and legacy reason_code and
  recovery_options[] are compatibility inputs only.
gui_related: true
gui_classification_reason: Blocked remote mutation, recovery CTAs, and user explanations are visible runtime/publish behavior.
split_recommended: true
split_recommendation_reason: This unit carries S0082 and the blocked-payload compatibility sentence from S0078.
depends_on: [CRAU-015, CRAU-043, CRAU-044, CRAU-045, CRAU-074, CRAU-076]
unblocks: []
acceptance_criteria:
  - Blocked remote side effects remain blocked, not failed.
  - Completed local work is preserved when remote publish or creation is blocked.
  - Auth recovery alone does not auto-resubmit or auto-publish blocked remote side effects.
  - UI explains when a local artifact exists but remote publish remains blocked.
  - Runtime-facing payload shape includes blocked_reason_code, ordered allowed_action_ids[], preserved_local_work, and optional detail_ref.
  - Legacy reason_code and recovery_options[] are non-canonical compatibility inputs and are not copied into new shared runtime contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_payload_contract_drift
reasoning_tier: high
context_scope: remote_side_effect_blocked_payload_normalization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_payload_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0082
preserved_exact_tokens:
  - "`blocked_reason_code`"
  - "`allowed_action_ids[]`"
  - "`preserved_local_work`"
  - "`detail_ref?`"
  - "`reason_code`"
  - "`recovery_options[]`"
compatibility_only_notes:
  - "Legacy reason_code and recovery_options[] are compatibility inputs only."
negative_constraints:
  - "Legacy fields such as `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared runtime contracts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-085 - Docker Operation Result Envelope And Status Lifecycle

```yaml
plan_unit_id: CRAU-085
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager operations use a shared operation result envelope with operation_id, operation_kind,
  target identity, actor/runtime_identity, project/package/seam/lane/worktree/account scope, preflight
  snapshot, approval_scope_key, status, started/updated/completed timestamps, review_payload,
  failure_payload, allowed_action_ids, evidence refs, and emitted receipt refs. `review_payload` carries
  reviewer/actor identity, review reason, proposed action, required evidence, available actions,
  selected_action, decision_note, and resulting_transition_target. `failure_payload` carries failure
  code/category, failing phase/status, human-readable message, evidence/log refs, retryability,
  remediation hint, affected target identity, and originating operation/transition context. The operation
  status enum is exactly `pending`, `running`, `needs_review`, `succeeded`, `failed`, and `cancelled`.
  `needs_review` is non-terminal and exits only through explicit review actions to `running`,
  `failed`, or `cancelled`; `failed` is terminal and carries failure_payload.
gui_related: false
gui_classification_reason: The status lifecycle and payload envelope are runtime operation contracts, not visual presentation.
depends_on: [CRAU-041, CV-281, PS-113]
unblocks: []
acceptance_criteria:
  - Docker operation result payloads carry operation identity, target identity, runtime identity, preflight, approval, status, evidence, and receipt refs.
  - "`review_payload` carries reviewer/actor identity, review reason, proposed action, required evidence, available actions, selected_action, decision_note, and resulting_transition_target."
  - "`failure_payload` carries failure code/category, failing phase/status, human-readable message, evidence/log refs, retryability, remediation hint, affected target identity, and originating operation/transition context."
  - "Status values are limited to `pending`, `running`, `needs_review`, `succeeded`, `failed`, and `cancelled`."
  - "`needs_review` is non-terminal and cannot be treated as `failed`; terminal statuses do not transition back to active operation states."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_operation_result_drift
reasoning_tier: high
context_scope: docker_operation_result_lifecycle
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: docker_operation_result_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0046
  - pldg-20260614-002-part-3-fable-cleanup:atom-0055
  - pldg-20260614-002-part-3-fable-cleanup:atom-0056
  - pldg-20260614-002-part-3-fable-cleanup:atom-0058
  - pldg-20260614-002-part-3-fable-cleanup:atom-0059
  - pldg-20260614-002-part-3-fable-cleanup:atom-0061
  - pldg-20260614-002-part-3-fable-cleanup:atom-0062
  - pldg-20260614-002-part-3-fable-cleanup:atom-0064
  - pldg-20260614-002-part-3-fable-cleanup:atom-0065
  - pldg-20260614-002-part-3-fable-cleanup:atom-0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0068
preserved_exact_tokens: ["needs_review vs failure-payload", "needs_review", "failed", "review_payload", "reviewer/actor identity", "review reason", "proposed action", "required evidence", "available actions", "selected_action", "decision_note", "resulting_transition_target", "failure_payload", "failure code/category", "failing phase/status", "human-readable message", "evidence/log refs", "retryability", "remediation hint", "affected target identity", "originating operation/transition context", "pending", "running", "succeeded", "cancelled"]
negative_constraints:
  - Do not conflate `needs_review` with terminal `failed`.
  - Do not add Docker operation statuses beyond the accepted enum without a new PlanUnit.
  - Do not allow terminal Docker statuses to transition back into active operation states.
  - Do not transition out of `needs_review` without persisting selected_action, reviewer identity, decision_note, and resulting_transition_target.
  - Do not infer retry or remediation actions from free-form failure text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-086 - Registry Promotion Operation Contract

```yaml
plan_unit_id: CRAU-086
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion is an active Docker Manager operation kind. Promotion payloads carry source
  image/ref, destination registry/repository/tag, digest, promotion policy, trust/proxy context,
  target account/server profile, preflight result, approval_scope_key, status lifecycle from
  CRAU-085, evidence refs, and rollback or remediation actions. The GUI derives promote, retry,
  rollback, inspect, and blocked actions from structured promotion payload fields.
gui_related: true
gui_classification_reason: Registry promotion actions and blocked/remediation controls are user-visible Docker Manager behavior.
depends_on: [CRAU-085]
unblocks: []
acceptance_criteria:
  - Registry promotion has source/destination/digest/policy/trust/account identity before mutation.
  - Promotion actions derive from status and payload fields, not free-form message text.
  - Promotion receipts and evidence refs are available for artifact/usage inspection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: registry_promotion_contract_gap
reasoning_tier: high
context_scope: docker_registry_promotion
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: registry_promotion_operation_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0070
  - pldg-20260614-002-part-3-fable-cleanup:atom-0071
preserved_exact_tokens: ["registry promotion", "promotion UI derives actions from structured payload"]
negative_constraints:
  - Do not render registry promotion as a disabled placeholder.
  - Do not infer promotion actions from unstructured logs or status text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-087 - Drift Detection Operation Contract

```yaml
plan_unit_id: CRAU-087
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker drift detection is an active operation kind that compares declared project container,
  registry, compose, Kubernetes, and Unraid intent with observed host or cached state. Drift payloads
  carry observed refs, expected refs, observed image/runtime identity, desired or pinned identity,
  detection source/timestamp, freshness, trust/degraded state, comparison scope, drift_kind, diff
  category/severity, policy impact, affected resources, safe remediation actions, remediation options,
  evidence refs, acknowledgement/suppression scope, promotion/rollback linkage, and operation status
  from CRAU-085. The UI derives inspect, refresh, reconcile, ignore, acknowledgement/suppression,
  promotion/rollback, and blocked actions from structured drift payloads.
gui_related: true
gui_classification_reason: Drift inspection and remediation actions are user-visible Docker Manager controls.
depends_on: [CRAU-085]
unblocks: []
acceptance_criteria:
  - Drift records distinguish expected state, observed state, freshness, trust, and degraded inputs.
  - Drift payloads include detection source/timestamp, policy impact, acknowledgement/suppression scope, and promotion/rollback linkage.
  - Drift remediation actions are typed and permission/preflight-aware.
  - Cached/offline observations disclose freshness before driving reconciliation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_drift_detection_gap
reasoning_tier: high
context_scope: docker_drift_detection
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: docker_drift_detection_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0073
  - pldg-20260614-002-part-3-fable-cleanup:atom-0074
preserved_exact_tokens: ["drift detection", "first-class Docker operation", "shared Docker operation result envelope", "drift payload", "observed image/runtime identity", "desired or pinned identity", "diff category/severity", "detection source/timestamp", "policy impact", "remediation options", "evidence refs", "acknowledgement/suppression scope", "promotion/rollback linkage", "Docker drift UI derives actions from structured payload"]
negative_constraints:
  - Do not treat stale cached observations as fresh host truth.
  - Do not allow drift reconciliation without typed preflight and permission outcomes.
  - Do not expose acknowledgement/suppression or promotion/rollback actions without structured drift identity, scope, evidence, and policy impact.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-088 - Access Intelligence Operation Contract

```yaml
plan_unit_id: CRAU-088
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker access intelligence is an active contract for explaining which registry, Unraid, Docker
  host, or Kubernetes actions are currently available. Payloads carry evaluated identity, host or
  cluster target, account/server profile, trust/proxy policy, permission snapshot, capability result,
  degraded/offline state, required scopes, blocked reason, allowed actions, actor/runtime identity,
  account/project/worktree target identity, registry/resource identity, effective permission set,
  policy source, credential/secret boundary, risk classification, recommended action, evidence refs,
  audit provenance, revocation/approval path, and remediation hints. The UI derives disclosure, retry,
  sign-in, doctor, request-access, revocation/approval, and blocked controls from structured
  access-intelligence payloads.
gui_related: true
gui_classification_reason: Access disclosure, sign-in, doctor, request-access, and blocked controls are user-visible Docker Manager behavior.
depends_on: [CRAU-085, PS-113, MGAC-092]
unblocks: []
acceptance_criteria:
  - Access intelligence explains evaluated identity, trust/proxy policy, permission, capability, and degraded/offline inputs.
  - Access payloads preserve credential/secret boundary, risk classification, recommended action, audit provenance, and revocation/approval path.
  - Required scopes and blocked reasons are structured enough for gate and UI consumers.
  - Remediation actions come from allowed_action_ids and policy outcomes, not local button guesses.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_access_intelligence_gap
reasoning_tier: high
context_scope: docker_access_intelligence
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Permissions_System.md]
node_compile_hint: {mode: docker_access_intelligence_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0076
  - pldg-20260614-002-part-3-fable-cleanup:atom-0077
preserved_exact_tokens: ["access intelligence", "first-class Docker operation/intelligence surface", "shared Docker operation result envelope", "access payload", "actor/runtime identity", "account/project/worktree target identity", "registry/resource identity", "effective permission set", "policy source", "credential/secret boundary", "risk classification", "recommended action", "evidence refs", "audit provenance", "revocation/approval path", "Docker access intelligence UI derives actions from structured payload"]
negative_constraints:
  - Do not infer access from provider/host reachability alone.
  - Do not render access remediation without scoped identity, permission, capability, and policy inputs.
  - Do not expose access intelligence actions from free-form risk text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Permissions_System.md]
```

### CRAU-089 - Project-Focused Kubernetes Deep Linkage Contract

```yaml
plan_unit_id: CRAU-089
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Project-focused Kubernetes deep linkage is an active Docker Manager contract. Linkage payloads carry
  project_id, project/worktree identity, package/seam/lane/worktree scope, cluster/context/namespace
  identity, workload identity, manifest or Helm refs, image/deployment identity, image/digest refs,
  registry/promotion/drift refs, actor/runtime identity, permission boundary, rollout/rollback path,
  health/status refs, receipt refs, allowed verbs, trust/proxy/degraded state, preflight result, status
  lifecycle from CRAU-085, evidence refs, cross-link navigation state, and route objects for logs,
  exec, port-forward, diff, apply, manifest edit, and artifact evidence. The UI derives Kubernetes
  deep-link actions from structured linkage payloads.
gui_related: true
gui_classification_reason: Kubernetes deep links to logs, exec, port-forward, diff, apply, manifest editing, and evidence are user-visible controls.
depends_on: [CRAU-085, CV-283]
unblocks: []
acceptance_criteria:
  - Kubernetes linkage is scoped to project/package/seam/lane/worktree and cluster/context/namespace.
  - Linkage payloads carry registry/promotion/drift refs, actor/runtime identity, permission boundary, rollout/rollback path, health/status refs, evidence refs, and cross-link navigation state.
  - Deep-link actions carry allowed verbs, preflight, trust/degraded state, and route-object identity.
  - Kubernetes evidence remains linked to receipts/artifacts rather than generic cluster text.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: k8s_deep_linkage_gap
reasoning_tier: high
context_scope: docker_project_focused_k8s_linkage
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: docker_k8s_deep_linkage_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0079
  - pldg-20260614-002-part-3-fable-cleanup:atom-0080
preserved_exact_tokens: ["project-focused K8s deep linkage", "first-class Docker/K8s integration operation", "shared Docker operation result envelope", "linkage payload", "project/worktree identity", "cluster/context/namespace identity", "workload identity", "image/deployment identity", "registry/promotion/drift refs", "actor/runtime identity", "permission boundary", "rollout/rollback path", "health/status refs", "evidence refs", "cross-link navigation state", "Docker/K8s linkage UI derives actions from structured payload", "logs", "exec", "port_forward", "apply"]
negative_constraints:
  - Do not render Kubernetes linkage as a generic planned placeholder.
  - Do not deep-link into Kubernetes actions without project scope, allowed verbs, preflight, and route identity.
  - Do not expose K8s deep links as URL-only or dashboard-only affordances.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```
