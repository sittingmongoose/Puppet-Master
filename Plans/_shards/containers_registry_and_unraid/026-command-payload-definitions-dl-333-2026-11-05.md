# Shard 026: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L6978-L9815

Source SHA256: `176c6416fc876cfb3f9fc41de3dc5e0d82d90b3944450e2d4147452b802b8fd9`

---

## Command payload definitions (DL-333, 2026-11-05)

### CRAU-115 - Docker Registry Kubernetes Command Payload Definitions

```yaml
plan_unit_id: CRAU-115
unit_type: command_contract
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Typed payload definitions (DL-333) for the forty-five Docker Manager, registry and Kubernetes
  commands that UI_Command_Catalog UCC-049 through UCC-053 register and UCC-230 routes to this
  unit, including cmd.orchestrator.push_image, whose Docker publication contract is CRAU's: the
  build flow (select_target, run, the image/compose/bake build modes, bake preview and run),
  container lifecycle and access commands, image actions, compose subset and scenario commands,
  repository creation, promotion, tag push, image push, drift comparison, cleanup, the
  shell/view-state wrappers, and the project-focused Kubernetes family. The definitions block
  below gives each command its args, owner request and owner result in
  pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the
  overlay's closed sets. The catalog keeps ids, labels, availability and aliases. Where a definition
  records no command_kind or disabled_reason_codes judgment, the value is the catalog's: the Docker
  Manager lifecycle, image, and cleanup rows table (UI_Command_Catalog.md) for container.stop, restart,
  delete, inspect and attach_shell, image.tag, inspect and delete, and cleanup.scan and prune, and the
  section 2.5A shell/view-state compatibility wrappers (command_kind shell_view) for cmd.docker.show,
  which takes no command-specific args, and cmd.docker.switch_subview. An owner_request of none means the command's
  Wiring_Matrix.production.json row names no request_schema_ref. response_kind is local_projection only
  for the route/open and view-state commands that have no owner result, since Contracts_V0's
  UICommandResponse determines response_kind by the actual owner contract. Compose scenario args take
  CRAU-096's scenario schema field names.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Docker Manager, registry and Kubernetes commands.
depends_on: [UCC-230, UCC-049, UCC-050, UCC-051, UCC-052, UCC-053, UCC-105, UCC-137, CRAU-007, CRAU-011, CRAU-012, CRAU-013, CRAU-014, CRAU-017, CRAU-031, CRAU-044, CRAU-095, CRAU-096, CRAU-098, CRAU-099, CV-304, CV-333, UCC-217, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to CRAU-115 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Every judgment a definition makes is in its judgments list with a key, a choice and a gap_note; the definitions block holds no YAML comment and names no review or evidence material (DL-341).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.docker.build.image, cmd.docker.build.compose, cmd.docker.build.bake, cmd.docker.build.run, cmd.docker.build.select_target, cmd.docker.bake.preview, cmd.docker.bake.run, cmd.docker.container.stop, cmd.docker.container.restart, cmd.docker.container.delete, cmd.docker.container.inspect, cmd.docker.container.view_logs, cmd.docker.container.attach_shell, cmd.docker.context.select, cmd.docker.image.tag, cmd.docker.image.inspect, cmd.docker.image.delete, cmd.docker.image.push, cmd.docker.open_dockerfile, cmd.docker.compose.up_subset, cmd.docker.compose.down_subset, cmd.docker.compose.scenario.save, cmd.docker.compose.scenario.run, cmd.docker.compose.scenario.edit, cmd.docker.compose.scenario.delete, cmd.docker.show, cmd.docker.switch_subview, cmd.docker.create_repository, cmd.docker.create_repository.confirm, cmd.docker.create_repository.cancel, cmd.docker.registry.promote, cmd.docker.registry.tag_push, cmd.docker.drift.compare, cmd.docker.cleanup.scan, cmd.docker.cleanup.prune, cmd.orchestrator.push_image, cmd.docker.k8s.apply, cmd.docker.k8s.diff, cmd.docker.k8s.logs, cmd.docker.k8s.exec, cmd.docker.k8s.port_forward, cmd.docker.k8s.select_context, cmd.docker.k8s.select_namespace, cmd.docker.k8s.helm_preview, cmd.docker.k8s.helm_install]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not widen the log-mode, subview, build-mode or privacy vocabularies beyond the values fixed here without an owner decision.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Contracts_V0.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: CRAU-115
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.docker.build.select_target
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 row-specific identity: capability_snapshot_ref for mutating or capability-gated actions; UCC-230 row_groups required when domain_action"
        dockerfile_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row says select_target "Selects Dockerfile, context, target stage, platform, and build mode"
            (UI_Command_Catalog.md section 2.5A) and CRAU-011 prose names the same inputs, but no canon field
            name exists. JUDGMENT: optional ref naming the selected Dockerfile record; absent means the inferred
            target stands. Polyglot or monorepo ambiguity must prompt instead of guessing (CRAU-011 negative constraint).
        build_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Same prose as dockerfile_ref ("context"); no canon field name. JUDGMENT: optional ref to the selected
            build context record.
        target_stage:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "target stage" is named in prose only; no field name, bound or default. JUDGMENT: optional string,
            generic text bound.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: >-
            "platform" is named in prose only; item format (os[/arch[/variant]]) is stated nowhere. JUDGMENT:
            unique optional string list, bounds from DockerTagPushV3Request.platforms items.
        build_mode:
          type: enum
          required: false
          default: none
          values: [image, compose, bake]
          provenance: gap
          gap_note: >-
            The three build modes are canon (2.5A amended rows "Build mode `image`/`compose`/`bake`", DL-333
            resolution 3), but no field name carries the mode. JUDGMENT: build_mode with the canon mode tokens;
            absent leaves the preferred build mode as persisted panel state (CRAU-011).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildTargetSelectionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.select_target row gives only label, description and availability, and no Cozy lifecycle table lists it. It persists the selected build target as per-project state that later builds resolve to (CRAU-011), a state change like cmd.docker.context.select, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_available && build_candidate_present gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.build.run
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: compose_invalid, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs the selected build path and records the last successful build target plus validation snapshot, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The run resolves to the persisted selected compose or Bake target (CRAU-011; section 2A project-aware build surfaces) and builds through docker buildx build after a preflight that resolves compose/config validity and buildx availability (CRAU-032). So CRAU-095's buildx_unavailable, and bake_unavailable when the selected target is a Bake target (section 2C: missing Bake capability disables Bake only), show as partial_capability, and compose_invalid, when the selected compose target fails validation (CRAU-093 reason-coded rows), shows as blocked_state_required, through UCC-230 owner_state_code_map, recorded in owner_state_codes. compose_service_missing is not listed: build.run names no services and builds the selected target whole. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
        - {key: omitted:build_target_ref, choice: omitted, gap_note: "build.run takes no subject arg: CRAU-011 requires the run to resolve to the persisted selected compose/bake target rather than rebuilding from a guessed default, so the handler reads the selection from per-project state. Canon names no per-dispatch subject field; if one is wanted it needs an owner decision."}
    - command_id: cmd.docker.build.image
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        dockerfile_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The mode row builds "the selected Dockerfile target (context, target stage, platforms)" resolving to
            the persisted selected target; no field name exists for a per-dispatch override. JUDGMENT: optional
            override ref; absent resolves to the persisted selection.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases:
        - {command_id: cmd.docker.build, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A and Cozy Shelves reconciliation: alias-of cmd.docker.build.image (selected path)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.image row gives only label, description and availability, and no Cozy lifecycle table lists it. It builds an image, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Image builds use docker buildx build after a preflight that resolves buildx availability (CRAU-032; section 2A persists buildx readiness for the build surfaces), so CRAU-095's buildx_unavailable shows as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes. compose_invalid and compose_service_missing are not listed: a Dockerfile build resolves no compose file."}
    - command_id: cmd.docker.build.compose
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 optional identity compose_project_ref?; kept optional because the mode row resolves to the persisted selected target"
        services:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            "builds the services of the selected compose file target" names services in prose only. JUDGMENT:
            optional service-name list restricting the build; absent builds the target's full service set, and
            min_items 1 refuses an empty list, which would restrict the build to nothing.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.compose row gives only label, description and availability, and no Cozy lifecycle table lists it. It builds compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. It builds the services of the selected compose file through docker buildx build after a preflight that resolves compose/config validity and buildx availability (CRAU-032). So CRAU-095's buildx_unavailable shows as partial_capability, and compose_invalid and compose_service_missing (a services entry the file does not define), which CRAU-093 makes the reason-coded rows of compose validation, show as blocked_state_required, through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.build.bake
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "builds the selected Bake target and platforms" resolving to the persisted target; bake inputs
            (bake file, bake target, platforms) are prose words only (CRAU-011). JUDGMENT: optional per-dispatch
            override of the persisted bake target; absent resolves to the selection.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.bake row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a Bake build, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A Bake build needs the runtime's Bake capability, and missing Bake capability disables Bake only, not the whole panel (section 2C); it is an image build, so CRAU-032's docker buildx build path and its buildx availability preflight apply too. So CRAU-095's bake_unavailable and buildx_unavailable show as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.bake.preview
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_file_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The precondition bake_file_resolved makes the Bake file the subject, but no canon field names it.
            JUDGMENT: required ref to the resolved bake file record (HCL, YAML, JSON, Compose or generated
            metadata per CRAU-011).
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "same prose-only basis as cmd.docker.build.bake.bake_target; optional filter of the previewed target"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBakePreviewResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A bake.preview row gives only label, description and availability, and no Cozy lifecycle table lists it. It resolves the Bake graph through the Docker engine and returns a typed preview, not a route, so domain_action; navigation_wrapper would fit only if the preview were a view of already-resolved state."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_file_resolved gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Previewing resolves the Bake graph and needs the runtime's Bake capability, which section 2C says disables Bake only when missing, so CRAU-095's bake_unavailable shows as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes. buildx_unavailable is not listed: a preview builds no image, and CRAU-032's buildx availability preflight runs before a build."}
    - command_id: cmd.docker.bake.run
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "Runs the selected cmd.docker.bake.* target" with precondition bake_target_selected; no field name.
            JUDGMENT: optional override; absent resolves to the persisted selected bake target.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A bake.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs the selected Bake target, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A Bake build needs the runtime's Bake capability, and missing Bake capability disables Bake only, not the whole panel (section 2C); it is an image build, so CRAU-032's docker buildx build path and its buildx availability preflight apply too. So CRAU-095's bake_unavailable and buildx_unavailable show as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.container.stop
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability live_subject (container_running) makes the container the subject (lifecycle rows, UI_Command_Catalog.md)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, stale_projection]
      aliases:
        - {command_id: cmd.docker.stop, kind: compatibility_alias,
           source: "UI_Command_Catalog.md lifecycle-rows adjudication and Cozy Shelves reconciliation; UCC-136: dispatch only as a recorded alias normalizing to cmd.docker.container.stop"}
    - command_id: cmd.docker.container.restart
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected) makes the container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, stale_projection]
      aliases:
        - {command_id: cmd.docker.restart, kind: compatibility_alias,
           source: "UI_Command_Catalog.md lifecycle-rows adjudication and Cozy Shelves reconciliation; UCC-136"}
    - command_id: cmd.docker.container.delete
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected && !container_running) makes the stopped container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.container.delete among destructive commands that dispatch only through the shared confirm surface; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.container.inspect
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected) makes the container the subject (lifecycle rows)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerInspectResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable]
      aliases:
        - {command_id: cmd.docker.inspect, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.inspect"}
      judgments:
        - {key: response_kind, choice: owner_operation, gap_note: "The lifecycle table makes inspect a navigation_wrapper, and the 2.5A row says it shows structured inspect output with secret and redaction policy applied; canon names no result. owner_operation with the local inspect result is a choice, so the redacted output has a typed carrier; local_projection would leave it with none."}
    - command_id: cmd.docker.container.view_logs
      ucc_units: [UCC-049, UCC-105]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; 2.5A row precondition container_selected makes the container the subject"
        log_mode:
          type: enum
          required: false
          default: none
          values: [follow, paused_snapshot, historical_view]
          provenance: canon
          source: "section 2A stream continuity: each stream surface MUST distinguish follow, paused_snapshot, and historical_view (Containers_Registry_and_Unraid.md Runtime stream, port-forward, crash-gap, and network trust continuity)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerLogStreamResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded, stale_projection]
      aliases:
        - {command_id: cmd.docker.logs, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.view_logs"}
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: the 2.5A row says only that it opens container logs with follow, paused snapshot and historical modes. It opens a read surface like container.inspect, which the lifecycle table makes navigation_wrapper, so navigation_wrapper. cmd.docker.k8s.logs, whose row has the same shape, takes the same kind."}
        - {key: response_kind, choice: owner_operation, gap_note: "Canon names no result; the owner opens a stream session (section 2A stream continuity: follow is restored only through a new stream session), so the stream session record is returned as a local owner result."}
        - {key: disabled_reason_codes, choice: [unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_available && container_selected gate; engine reachability and stream health from the shared taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph) plus the 2.0B projection-freshness clause."}
        - {key: field:log_mode, choice: "default none", gap_note: "Canon fixes the three mode tokens (section 2A stream continuity) but no dispatch default. default none means the surface opens in its persisted stream intent, and follow is restored only after source revalidation creates a new stream session (section 2A)."}
        - {key: omitted:capability_snapshot_ref, choice: omitted, gap_note: "Not required here: the row gate docker_available && container_selected matches container.inspect, which the lifecycle table classifies as a selection gate, not a capability gate, and the UCC-230 row group requires capability_snapshot_ref only for domain_action. cmd.docker.k8s.logs keeps the field because its gate k8s_connected is a cluster-connectivity capability."}
    - command_id: cmd.docker.container.attach_shell
      ucc_units: [UCC-049, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability live_subject (container_running && capability_snapshot_current) makes the container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        shell:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            Canon says shell actions honor the saved shell command preference instead of guessing an entry
            command (section 2A container access intelligence) and names no per-dispatch field. JUDGMENT:
            optional explicit override of the saved preference; absent uses the preference, never a guess.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerShellSessionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, unauthorized, unreachable]
      aliases:
        - {command_id: cmd.docker.exec, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.attach_shell"}
    - command_id: cmd.docker.context.select
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        runtime_context_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names the Docker-engine context runtime_context, a durable runtime identity field (section 2A
            runtime identity; CRAU-017), and the Docker/Hosts route payload carries it as runtime_context_ref?
            (CRAU-092); CRAU-099's wrong_context diagnosis offers switch-context, which is this command. No row
            names this arg or types it. The arg takes CRAU-092's exact name and is typed ref by the UCC-230
            _ref rule. Whether the selection persists per project is not stated.
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 (capability-gated action)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContextSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: runtime_context_missing, code: not_configured}
        - {owner_state: runtime_context_unreachable, code: unreachable}
      aliases:
        - {command_id: cmd.docker.set_context, kind: compatibility_alias,
           source: "UI_Command_Catalog.md Docker compose and context adjudication rows; the prototype cmd.docker.set_context is recorded as its alias"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind (UCC-137 says only that it is the canonical Docker-engine context selector). Selecting the engine context changes the Docker target and revalidates capability, like cmd.docker.k8s.select_context, so domain_action; shell_view would fit only if it changed what the panel shows."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "Canon names no subset for this row; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's runtime_context_missing and runtime_context_unreachable (CRAU-099 carries the diagnosis) show as not_configured and unreachable through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.image.tag
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected), Docker Manager lifecycle rows"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053: capability_snapshot_ref for mutating or capability-gated actions"
        new_tag:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No canon field carries the new tag: the lifecycle row and the 2.5A image rows name none. Bounds reuse DockerTagPushV3Request.tags items
            (Plans/projects_refresh_fix_contracts.schema.json). JUDGMENT: also add Docker's tag grammar
            pattern ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$, or keep the reused bounds only.
        target_repository:
          type: object
          required: false
          default: none
          fields:
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: canon, source: "DockerTagPushV3Request.namespace"}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: canon, source: "DockerTagPushV3Request.repository_name"}
          provenance: gap
          gap_note: >-
            JUDGMENT: Docker can tag into another repository (repo:tag). Choices: (a) drop this field, so a tag
            always stays in the source repository; (b) keep it optional as written, absent meaning the source
            image's repository.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageTagResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
    - command_id: cmd.docker.image.inspect
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected), Docker Manager lifecycle rows"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageInspectResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable]
      aliases: []
      judgments:
        - {key: response_kind, choice: owner_operation, gap_note: "The lifecycle table makes image inspect a navigation_wrapper and canon names no result; owner_operation with the local inspect result gives the redacted structured output a typed carrier, as for cmd.docker.container.inspect."}
    - command_id: cmd.docker.image.delete
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected && !image_in_use), Docker Manager lifecycle rows"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.image.delete among destructive commands; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.image.push
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_image_push)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerImagePushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "DockerImagePushV3Request.image_digest"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerImagePushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerImagePushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerImagePushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the amended 2.5A row (DL-333 resolution 2) says it pushes an approved image through registry publish authority with its own DockerImagePushV3Request. A remote publish side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the image_selected && registry_target_allowed && permission_allowed gate; registry account, target and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
        - {key: omitted:image_ref, choice: omitted, gap_note: "The row precondition image_selected makes the image the subject, but the owner request identifies it by image_digest and local_artifact_ref, both args here; an image_ref beside them would be a second identity for the same image, so the overlay's optional image_ref is left out."}
    - command_id: cmd.docker.open_dockerfile
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: gap
          gap_note: >-
            No catalog row beyond the Cozy disposition (canonical existing token; build-pane wiring row required)
            types this command. JUDGMENT: route_target with the OpenFile route to the Dockerfile, following the
            route/open contract pattern; the alternative is a build_target_ref the owner resolves through the
            persisted selected target (same choice as the build flow, CRAU-011). UCC-230 canonical type kept.
        build_target_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            JUDGMENT: optional ref to the persisted build target whose Dockerfile opens; absent opens the inferred
            or explicitly selected Dockerfile of the active project (section 2A build surfaces).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon has no row for this command beyond the Cozy disposition (canonical existing token; build-pane wiring row required). It hands the Dockerfile to the editor like cmd.docker.compose.open_file, which the Cozy compose table makes navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset; resolved-target freshness plus engine gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
    - command_id: cmd.docker.compose.up_subset
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_subset_valid makes the compose project the subject"
        services:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The row says up_subset starts "selected services/profiles/env files/ports from a compose scenario"
            but names no field. The canon candidate is CRAU-096's scenario field service_subset, which names a
            saved scenario's services, not an ad hoc subset. JUDGMENT: required unique service-name list named
            services; the selected subset is the subject of the command, and min_items 1 refuses an empty
            subset, which would start nothing.
        profiles:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "same prose-only basis as services; CRAU-096 uses the same name profiles for a scenario's profiles. JUDGMENT: optional profile activation list"
        env_file_refs:
          type: list
          required: false
          default: none
          item: {type: ref}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "env files are named in prose only for this row; CRAU-096 uses the same name env_file_refs for a scenario's env files. JUDGMENT: optional refs to the selected env-file records"
        scenario_id:
          type: id
          required: false
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: gap
          gap_note: >-
            The row starts the subset "from a compose scenario" without naming the link; scenario_id is
            CRAU-096's scenario identity. JUDGMENT: optional scenario id recording which saved scenario the
            subset came from; scenario.run is the command that canonically records the scenario id on a run.
            Bounds as scenario.run's scenario_id (the docker.compose.scenario event payloads' non_empty_id).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeSubsetResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.up_subset row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_subset_valid gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The compose_subset_valid gate needs a valid compose file that defines every named service; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.down_subset
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_subset_running makes the running compose project the subject"
        services:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The row says down_subset "Stops selected services from a compose scenario" with no field name or
            type. The canon candidate is CRAU-096's scenario field service_subset, as for up_subset. JUDGMENT:
            required unique service-name list named services, mirroring up_subset.services; min_items 1
            refuses an empty subset, which would stop nothing.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeSubsetResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.down_subset row gives only label, description and availability, and no Cozy lifecycle table lists it. It stops compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_subset_running gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Stopping a named subset resolves the compose file and the services it names; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.save
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_file_selected makes the compose project the subject"
        scenario:
          type: object
          required: true
          default: none
          fields:
            name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                   provenance: gap, gap_note: 'CRAU-096 names the scenario field name but gives it no type or bound, and the scenario event payloads do not carry it. JUDGMENT: required string with the generic 1..256 text bound'}
            service_subset: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                             constraints: {max_items: 256, unique_items: true}, provenance: canon,
                             source: 'CRAU-096 scenario schema field service_subset[]; item, max_items and unique_items from service_subset in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json (compose_name items: string 1..128, pattern ^[A-Za-z0-9][A-Za-z0-9_.-]*$; at most 256 unique items; no minItems), which requires the field'}
            profiles: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                       constraints: {max_items: 64, unique_items: true}, provenance: canon,
                       source: 'CRAU-096 scenario schema field profiles[]; item, max_items and unique_items from profiles in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json (compose_name items; at most 64 unique items)'}
            env_file_refs: {type: list, required: false, default: none, item: {type: ref}, constraints: {unique_items: true},
                            provenance: gap, gap_note: 'CRAU-096 names env_file_refs[] (a list) but types neither the items nor the bounds, and the scenario event payloads do not carry it. JUDGMENT: unique refs to env-file records, typed ref by the _ref suffix convention'}
            port_maps: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                        constraints: {unique_items: true}, provenance: gap, gap_note: 'CRAU-096 names port_maps[] (a list) but states no item shape, and the scenario event payloads do not carry it. JUDGMENT: unique string port specs with the generic 1..256 text bound, pending an owner-typed mapping record'}
            detach_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names detach_default but gives it no type; section 2A calls it the detached default of the scenario. JUDGMENT: boolean; absent means the saved scenario records no value for it, and the dispatch implies none'}
            log_follow_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names log_follow_default but gives it no type; section 2A calls it the log-follow default of the scenario. JUDGMENT: boolean; absent means the saved scenario records no value for it, and the dispatch implies none'}
          provenance: gap
          gap_note: >-
            CRAU-096 fixes the scenario schema's field names (scenario_id, name, service_subset[], profiles[],
            env_file_refs[], port_maps[], detach_default, log_follow_default) and says persisted payload
            schemas are owned by storage-plan.md, which types none of them; the scenario event payloads type
            service_subset and profiles. Not canon: the wrapper object named scenario, the types of name,
            detach_default and log_follow_default, and the item shapes of env_file_refs and port_maps.
            scenario_id is not an arg here: the owner assigns it on save and returns it in the result.
            JUDGMENT: one nested object with CRAU-096's names; profiles, env_file_refs and port_maps are
            optional, absent meaning none, and the owner writes an empty profiles list into the saved event,
            which requires the field.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
        - {command_id: compose.save_scenario, kind: compatibility_alias,
           source: "UCC-137 canonical_text: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.save row gives only label, description and availability, and no Cozy lifecycle table lists it. It persists a scenario record, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the compose_file_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.compose.scenario.run
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json and the other docker.compose.scenario event payloads (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A scenario.run row runs a saved scenario and records the scenario id on the preview or development run"
        compose_project_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; scenario lists live in project state (section 2A), so the project is implied and the ref stays optional"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
        - {command_id: compose.run_scenario, kind: compatibility_alias,
           source: "UCC-137 canonical_text: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a saved scenario and records the scenario id on a run, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_scenario_valid gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A stale scenario opens degraded with repair actions (section 2A compose scenario runner). CRAU-096 keeps run disabled with exact reason codes until validation succeeds, and running the scenario's service_subset needs a valid compose file that defines every saved service; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.edit
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A edit row's precondition compose_scenario_selected makes the selected scenario the subject"
        scenario:
          type: object
          required: true
          default: none
          fields:
            name: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                   provenance: gap, gap_note: 'CRAU-096 names name but gives it no type or bound, as in cmd.docker.compose.scenario.save. JUDGMENT: optional rename on edit'}
            service_subset: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                             constraints: {max_items: 256, unique_items: true}, provenance: canon,
                             source: 'CRAU-096 scenario schema field service_subset[]; item, max_items and unique_items from service_subset in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (compose_name items: string 1..128, pattern ^[A-Za-z0-9][A-Za-z0-9_.-]*$; at most 256 unique items; no minItems)'}
            profiles: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                       constraints: {max_items: 64, unique_items: true}, provenance: canon,
                       source: 'CRAU-096 scenario schema field profiles[]; item, max_items and unique_items from profiles in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (compose_name items; at most 64 unique items)'}
            env_file_refs: {type: list, required: false, default: none, item: {type: ref}, constraints: {unique_items: true},
                            provenance: gap, gap_note: 'CRAU-096 names env_file_refs[] but types neither items nor bounds, as in cmd.docker.compose.scenario.save. JUDGMENT: unique refs'}
            port_maps: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                        constraints: {unique_items: true}, provenance: gap, gap_note: 'CRAU-096 names port_maps[] but states no item shape, as in cmd.docker.compose.scenario.save. JUDGMENT: unique string port specs with the generic 1..256 text bound'}
            detach_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names detach_default but gives it no type, as in cmd.docker.compose.scenario.save. JUDGMENT: boolean'}
            log_follow_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names log_follow_default but gives it no type, as in cmd.docker.compose.scenario.save. JUDGMENT: boolean'}
          provenance: gap
          gap_note: >-
            The edited scenario carries CRAU-096's field names, as in cmd.docker.compose.scenario.save; the
            wrapper object, the types of name, detach_default and log_follow_default and the item shapes of
            env_file_refs and port_maps are not canon. JUDGMENT: a partial-update object in which every field
            is optional and an absent field keeps the saved value; canon states no patch semantics, so whether
            an empty list clears a saved list is left to the owner.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.edit row gives only label, description and availability, and no Cozy lifecycle table lists it. It rewrites a scenario record, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the compose_scenario_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Canon conflict: the 2.5A edit row says edit 'Edits a saved scenario or repairs degraded scenario validation', while CRAU-096 and CRAU-011's acceptance criterion say run, edit and delete stay disabled with exact reason codes until validation succeeds, so edit cannot both repair a degraded scenario and stay disabled while it is degraded. This definition takes CRAU-096's side, the owner unit over the summary row, and lists degraded; section 2A's repair actions then have no command here, and the owner doc must settle whether edit is the repair path. CRAU-096 (and CRAU-011's acceptance criterion) keeps run, edit and delete disabled with exact reason codes until validation succeeds, and CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so a stale scenario disables edit with those codes, shown as blocked_state_required through UCC-230 owner_state_code_map and recorded in owner_state_codes; degraded stays for the degraded open of a stale scenario (section 2A). blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.delete
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_deleted.schema.json (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A delete row's precondition compose_scenario_selected makes the selected scenario the subject"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "CS-062 lists cmd.docker.compose.scenario.delete among destructive commands that dispatch only through the shared confirm surface; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.delete row gives only label, description and availability, and no Cozy lifecycle table lists it. It deletes a scenario record (CS-062 lists it among destructive commands), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the compose_scenario_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The destructive confirmation goes through the shared confirm surface (confirmation_ref), not a disabled code. CRAU-096 (and CRAU-011's acceptance criterion) keeps run, edit and delete disabled with exact reason codes until validation succeeds, and CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so a stale scenario disables delete with those codes, shown as blocked_state_required through UCC-230 owner_state_code_map and recorded in owner_state_codes; degraded stays for the degraded open of a stale scenario (section 2A). blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.create_repository
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_create_repository)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryCreateV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.namespace; the row proposes the namespace/repository/privacy tuple (2.5A)"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.repository_name"
        privacy:
          type: enum
          required: true
          default: none
          values: [private, public]
          provenance: canon
          source: "DockerRepositoryCreateV3Request.privacy; CRAU-031: default privacy for newly created repositories is private, and the dialog makes that default explicit while allowing user change"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryCreateV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the registry_target_missing && permission_allowed gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.create_repository.confirm
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        creation_request_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.creation_request_id (string 1..256); CRAU-031: confirm dispatches cmd.docker.create_repository.confirm for the pending request"
        preview_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.preview_ref (string 1..256; typed ref here); the confirmation shows namespace, repository name, privacy and the private-by-default notice (CRAU-031)"
        preview_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.preview_sha256 (pattern ^[0-9a-f]{64}$)"
        person_decision_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.person_decision_evidence (OwnerEvidenceRefV1); the same request pins authority.authority_kind to human (CRAU-031: no automated route fabricates a human confirmation)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryConfirmV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the repository_creation_confirmation_visible gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice. The request also requires registry_id, account_ref, namespace, repository_name and privacy; the handler copies them from the pending creation request that creation_request_id names, the tuple the confirmation shows (CRAU-031), so the user confirms exactly what cmd.docker.create_repository proposed. CRAU-031's acceptance criterion says the confirmation dialog makes the private default explicit 'while allowing user change before creation', and no unit says which command carries that change. This definition takes no privacy arg: preview_sha256 binds the confirm to the preview the user saw, so a privacy change in the dialog re-dispatches cmd.docker.create_repository with the new privacy, which produces a new pending request and preview, and the user confirms that one. The alternative, an optional privacy arg (DockerRepositoryConfirmV3Request.privacy) that overrides the pending value, would confirm a tuple the preview did not show."}
    - command_id: cmd.docker.create_repository.cancel
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        creation_request_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCancelV3Request.creation_request_id (string 1..256); CRAU-031: cancel dispatches cmd.docker.create_repository.cancel"
        expected_request_revision:
          type: integer
          required: true
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "DockerRepositoryCancelV3Request.expected_request_revision (integer, minimum 0)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryCancelV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the repository_creation_confirmation_visible gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.registry.promote
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        operation:
          type: enum
          required: true
          default: none
          values: [promote, copy, retag]
          provenance: gap
          gap_note: >-
            The row says promote "Promotes, copies, or retags a digest-first artifact" (2.5A) with no typed
            request (only the wiring row catalog.docker_registry_promote). JUDGMENT: required enum of the three
            prose verbs in snake_case; no default, because the verbs differ in remote effect.
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: gap
          gap_note: >-
            Digest-first artifact identity is canon (CRAU-012), but no promote field list exists. JUDGMENT:
            bounds and pattern reused from DockerTagPushV3Request.image_digest.
        source:
          type: object
          required: true
          default: none
          fields:
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: gap, gap_note: 'source namespace/repository is canon prose (CRAU-012 receipt capture); type reused from DockerTagPushV3Request.namespace'}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: gap, gap_note: 'source namespace/repository is canon prose (CRAU-012); type reused from DockerTagPushV3Request.repository_name'}
          provenance: gap
          gap_note: "JUDGMENT: nested source object; canon names the source namespace/repository pair only in prose"
        target:
          type: object
          required: true
          default: none
          fields:
            registry_id: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                          provenance: gap, gap_note: 'the selected target registry (2.5A row); type reused from DockerTagPushV3Request.registry_id'}
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: gap, gap_note: 'destination namespace/repo is canon prose (CRAU-012); type reused from DockerTagPushV3Request.namespace'}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: gap, gap_note: 'destination namespace/repo is canon prose (CRAU-012); type reused from DockerTagPushV3Request.repository_name'}
            tags: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                   constraints: {min_items: 1, unique_items: true}, provenance: gap, gap_note: 'the target tag or tags (2.5A row); item bounds and unique_items reused from DockerTagPushV3Request.tags, which has no minItems. JUDGMENT: min_items 1, because a promotion or retag without a target tag has no destination'}
          provenance: gap
          gap_note: "JUDGMENT: nested target object; canon names the target registry/repo/tag only in prose"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerRegistryPromoteResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A registry.promote row gives only label, description and availability, and no Cozy lifecycle table lists it. It promotes, copies or retags an artifact in a registry, a registry-side remote side effect (CRAU-012), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the registry_source_resolved && registry_target_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability). CRAU-012 blocks promotion with a precise remote blocker, carried as display detail."}
    - command_id: cmd.docker.registry.tag_push
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_registry_tag_push)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerTagPushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "DockerTagPushV3Request.image_digest; the row applies the approved /tag/push action to a digest-first artifact (2.5A)"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerTagPushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerTagPushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerTagPushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerTagPushV3Request) that carries authority and expected_target_generation, which marks a guarded remote publish, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the registry_target_allowed && permission_allowed gate (2.5A row); drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.orchestrator.push_image
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.run_id; UCC-230 envelope common optional run_id restated required (the after-build push belongs to a run)"
        build_result_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.build_result_ref (string 1..256; typed ref here); the push resumes from the preserved local build result (CRAU-044)"
        build_result_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.build_result_sha256 (pattern ^[0-9a-f]{64}$)"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.orchestrator_push_image)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "OrchestratorImagePushV3Request.image_digest"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "OrchestratorImagePushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "OrchestratorImagePushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (OrchestratorImagePushV3Request) that carries authority and expected_target_generation, which marks the Orchestrator after-build remote side-effect step (2.5A authority-split paragraph), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset; publish authority gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability). A missing repository stays a separate admitted creation effect (CRAU-031, CRAU-044), not a disabled code here."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.drift.compare
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compare_target:
          type: enum
          required: false
          default: none
          values: [last_build, last_publish, last_deploy]
          provenance: gap
          gap_note: >-
            The baseline (last build | last publish | last deploy) and the compared subjects (Dockerfile,
            compose/bake, manifests) are prose only (2.5A drift.compare row; section 2A drift detection names
            a persisted compare target). JUDGMENT: optional enum of the three baselines in snake_case; absent
            compares against the persisted compare target; no subjects field is minted because the owner
            compares every detected local intent.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerDriftCompareResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A drift.compare row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a comparison against registry and deploy metadata with a typed result and receipt, not a route, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_project_detected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Drift and trust blockers refresh effective capability before mutation (UCC-053)."}
    - command_id: cmd.docker.cleanup.scan
      ucc_units: [UCC-051, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref; row availability capability (docker_available), Docker Manager lifecycle rows"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerCleanupScanResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded]
      aliases: []
    - command_id: cmd.docker.cleanup.prune
      ucc_units: [UCC-051, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref; UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.cleanup.prune among destructive commands; UCC-230 envelope common optional confirmation_ref restated required"
        scan_result_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row executes approved cleanup targets after dry-run review with availability record_only
            (scan_results_present), but names neither the scan result nor the selected target set. JUDGMENT:
            required ref to the reviewed dry-run scan record.
        targets:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The approved cleanup target set has no field name or item shape. JUDGMENT: unique string target
            descriptors drawn from the scan record, and min_items 1 refuses an empty approval, which would
            prune nothing; conservative defaults never delete assets tied to active previews or recent
            receipts (CRAU-013).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerCleanupPruneResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.show
      ucc_units: [UCC-050]
      command_kind: shell_view
      response_kind: local_projection
      args: {}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded], gap_note: "No row states a subset. Docker Manager still renders cached last-known state when the runtime is unreachable (section 2A), so these codes are availability copy from the shared taxonomy, not a block on opening the panel."}
    - command_id: cmd.docker.switch_subview
      ucc_units: [UCC-050]
      command_kind: shell_view
      response_kind: local_projection
      args:
        subview:
          type: enum
          required: true
          default: none
          values: [containers, images, compose, registries, registries_docker_hub, build_bake, publish_unraid, networks, volumes, contexts, kubernetes]
          provenance: gap
          gap_note: >-
            CRAU-007 names the routeable subviews as display names only: Containers, Images, Compose, Registries,
            Registries / Docker Hub, Build / Bake, Publish / Unraid (Publishing / Unraid is a legacy alias),
            advanced Networks, Volumes, Contexts, and project-focused Kubernetes, and its acceptance criterion
            says all stable subviews and advanced foldouts remain named and routeable. CRAU-098's six side-panel
            tabs are a presentation subset of that list, and section 2A calls Networks, Volumes and Contexts
            advanced foldouts, so the eleven routeable values do not conflict with six tabs. Canon fixes no wire
            tokens: JUDGMENT: the snake_case of the eleven names, dropping only the legacy alias.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: disabled_reason_codes, choice: [unsupported, not_configured, unreachable, degraded], gap_note: "No row states a subset; unsupported runtime-specific subviews stay visible with a disabled reason (section 2A), and the rest come from the shared taxonomy."}
    - command_id: cmd.docker.k8s.apply
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; Kubernetes mutations bind approval to the selected context, namespace, workload/resource, and operation (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; mutation approval binds the namespace (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        manifest_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The selected manifest (or Helm-rendered manifest) has no field name (2.5B apply row). JUDGMENT:
            required ref to the selected manifest record inside the selected project scope.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sApplyResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.apply row gives only label, description and availability, and no Cozy lifecycle table lists it. It applies a manifest to the cluster, a mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && manifest_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus approval and preflight blocking plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.diff
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        manifest_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "manifest and optional workload target have no field names (2.5B diff row). JUDGMENT: required ref to the selected manifest record"
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row diffs against the selected context, namespace, or workload where supported (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; diff target part (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        k8s_workload_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "the optional workload diff target has no field name (2.5B diff row). JUDGMENT: ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sDiffResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.diff row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a comparison against the live cluster with a typed result, capability-gated by k8s_connected, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_connected && manifest_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.logs
      ucc_units: [UCC-052]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref for mutating or capability-gated actions; the 2.5B logs row's precondition k8s_connected && workload_selected"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Workload/pod/container target fields are prose only (2.5B logs row; section 2A Kubernetes
            operational sessions: kubectl logs can target pods, resources, and all containers). JUDGMENT:
            required (workload_selected), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name.
        container:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "container targeting is prose only; JUDGMENT: optional container name, absent streams all containers"
        log_mode:
          type: enum
          required: false
          default: none
          values: [follow, paused_snapshot, historical_view]
          provenance: canon
          source: "2.5B logs row names follow, paused snapshot, and historical modes; section 2A stream continuity fixes the tokens follow, paused_snapshot, historical_view"
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the log stream runs in the selected context. Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; namespace/workload focus is persisted K8s focus state (CRAU-014). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sLogStreamResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: the 2.5B row says only that it opens workload or pod logs with follow, paused snapshot and historical modes, the same shape as cmd.docker.container.view_logs. Both open a read surface like container.inspect, which the lifecycle table makes navigation_wrapper, so both take navigation_wrapper; error_codes gain invalid_route by the UCC-230 navigation rule."}
        - {key: response_kind, choice: owner_operation, gap_note: "Canon names no result; the owner opens an ephemeral owner-surface log session (CRAU-014), returned as a local owner result, as for cmd.docker.container.view_logs."}
        - {key: field:capability_snapshot_ref, choice: required, gap_note: "Kept required although the kind is navigation_wrapper: the overlay asks for capability_snapshot_ref on capability-gated actions, and this row's gate k8s_connected is a cluster-connectivity capability. container.view_logs leaves the field out because its gate matches container.inspect's selection gate."}
        - {key: field:log_mode, choice: "default none", gap_note: "Canon fixes the mode tokens (section 2A stream continuity; the 2.5B row names follow, paused snapshot and historical) but no dispatch default; default none opens the surface in its persisted stream intent, as for cmd.docker.container.view_logs."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus stream freshness."}
    - command_id: cmd.docker.k8s.exec
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "pod/container target fields are not defined (2.5B exec row). JUDGMENT: required (workload_running), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
        container:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "the selected pod/container pair has no field names. JUDGMENT: optional container name within the workload"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the session binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the session binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sExecSessionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.exec row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts an audited privileged exec session in the cluster, permission-gated (permission_allowed), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_running && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking plus the 2.0B projection-freshness clause."}
        - {key: omitted:exec_command, choice: omitted, gap_note: "Canon names no exec entry command and no stream input (the 2.5B row says only that it starts an audited privileged exec session in the selected pod/container). The audited session record carries them, and this definition mints no field; the compile review must decide whether the dispatch names an entry command or the session honors a saved shell preference as cmd.docker.container.attach_shell does (section 2A container access)."}
    - command_id: cmd.docker.k8s.port_forward
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "the workload target is prose only (2.5B port_forward row). JUDGMENT: required (workload_selected), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the session binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the session binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        remote_port:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1, maximum: 65535}
          provenance: gap
          gap_note: "the forwarded port is named in prose only. JUDGMENT: required integer in the TCP port range"
        local_bind_address:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "local bind address/port recorded is prose only (2.5B row; port-forward rebinding records local port reuse versus new allocation, section 2A). JUDGMENT: optional bind address, absent lets the owner assign"
        local_port:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1, maximum: 65535}
          provenance: gap
          gap_note: "JUDGMENT: optional explicit local port; absent allocates one, and rebinding records reuse versus new allocation (section 2A)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sPortForwardResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.port_forward row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts an audited port-forward session, permission-gated (permission_allowed), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.select_context
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (capability-gated action)"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row selects the project-focused Kubernetes context and revalidates capability (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sContextSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: k8s_context_missing, code: not_configured}
        - {owner_state: k8s_context_unreachable, code: unreachable}
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated"}
        - {command_id: set_context, kind: compatibility_alias,
           source: "UCC-137 canonical_text: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace recorded aliases; UCC-052 compatibility_only_notes (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.select_context row gives only label, description and availability, and no Cozy lifecycle table lists it. It selects the context and revalidates capability, a state change like cmd.docker.context.select, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the k8s_available gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's k8s_context_missing and k8s_context_unreachable show as not_configured and unreachable through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.k8s.select_namespace
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (capability-gated action)"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row selects the namespace within the selected context (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the row selects the namespace and refreshes workload focus (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sNamespaceSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: k8s_namespace_missing, code: not_configured}
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated"}
        - {command_id: set_namespace, kind: compatibility_alias,
           source: "UCC-137 canonical_text: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace recorded aliases; UCC-052 compatibility_only_notes (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.select_namespace row gives only label, description and availability, and no Cozy lifecycle table lists it. It selects the namespace and refreshes workload focus inside the selected context, a state change, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the k8s_connected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's k8s_namespace_missing shows as not_configured through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.k8s.helm_preview
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        helm_source_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The selected release/chart has no field names (2.5B helm_preview row). JUDGMENT: one required ref
            to the selected Helm source record; splitting release from chart stays open for the compile review.
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; rendering needs no connected cluster (precondition k8s_project_detected). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; optional render target namespace. Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerHelmPreviewResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: aliases, choice: [cmd.k8s.*], gap_note: "UCC-052 records two alias tokens for the Kubernetes family: the grouped token cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace and the cmd.k8s.* compatibility rows. The grouped token names only its own seven commands (UCC-230 non_definition_tokens), and Helm preview is not one of them, so this definition records only cmd.k8s.*. Canon does not say whether cmd.k8s.* covers the Helm rows; UCC-052 calls the existing cmd.k8s.* rows compatibility aliases until migrated without listing them."}
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.helm_preview row gives only label, description and availability, and no Cozy lifecycle table lists it. It renders Helm output through the Helm tool with a typed result, gated by helm_source_selected, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_project_detected && helm_source_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Helm availability is a doctor check (section 2A)."}
    - command_id: cmd.docker.k8s.helm_install
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        helm_source_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "same prose-only basis as cmd.docker.k8s.helm_preview.helm_source_ref (2.5B helm_install row)"
        values_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "the values source is named in prose only. JUDGMENT: optional ref to the selected values record; absent renders chart defaults"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the install binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the install binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerHelmInstallResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: aliases, choice: [cmd.k8s.*], gap_note: "As for cmd.docker.k8s.helm_preview: the grouped token cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace names only its own seven commands (UCC-230 non_definition_tokens), so this definition records only the cmd.k8s.* compatibility family (UCC-052 compatibility_only_notes), which canon does not list command by command."}
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.helm_install row gives only label, description and availability, and no Cozy lifecycle table lists it. It installs or upgrades a release after permission and diff review, a cluster mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && helm_source_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking after diff review plus the 2.0B projection-freshness clause."}
        - {key: omitted:diff_review_ref, choice: omitted, gap_note: "The 2.5B row requires a diff review before install but canon names no field that carries it. This definition mints none; the open question for the compile review is whether the dispatch names the reviewed diff (for example the DockerK8sDiffResultV1 diff_output_ref) or the owner checks a recorded review for the same helm_source_ref, context and namespace. Until then an install without a review is blocked with blocked_state_required."}
  results:
    DockerBuildTargetSelectionResultV1:
      fields:
        build_target_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the persisted selected build target (section 2A build surfaces persist the selection; CRAU-011 resolves later runs to it); the record shape and field name are typed nowhere. JUDGMENT: ref, named as in the cmd.docker.open_dockerfile arg. No validation snapshot here: section 2A persists the validation snapshot beside the last successful build target, and the 2.5A build.run row makes the run the command that records it'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; the wiring row requires a receipt or event effect (catalog.docker_build_select_target), the record shape is typed nowhere"}
    DockerBuildRunResultV1:
      fields:
        build_result_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "structured build results including artifacts, logs, and image identity are canon (Build flow, section 2A); the result record's field names are typed nowhere. JUDGMENT: one ref to the build result"}
        validation_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the run "records last successful build target plus validation snapshot" (UI_Command_Catalog.md section 2.5A build.run row) in prose only; the field name validation_snapshot_ref and its ref type are coined'}
        image_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "image identity is canon for build results (section 2A Build flow); present for image-mode results, absent for compose/bake modes"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_build_run), shape typed nowhere"}
    DockerBakePreviewResultV1:
      fields:
        bake_targets: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, provenance: gap, gap_note: '"Previews resolved Bake targets and platforms" names the content in prose only; JUDGMENT: resolved target names'}
        platforms: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, provenance: gap, gap_note: "resolved platforms per target; the pairing of target to platform is unstated, so a flat unique list is a judgment"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_bake_preview), shape typed nowhere"}
    DockerContainerLifecycleResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container acted on; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring rows require a receipt or event effect (catalog.docker_container_stop/restart/delete), shape typed nowhere'}
    DockerContainerInspectResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the inspected container; name canon (row-group identity), result shape typed nowhere'}
        inspect_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'structured inspect output with secret and redaction policy applied (lifecycle rows); the record shape is typed nowhere'}
    DockerLogStreamResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container whose logs are streamed; name canon (row-group identity), result shape typed nowhere'}
        stream_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'follow intent is restored only after source revalidation and creation of a new stream session (section 2A stream continuity); the session record shape is typed nowhere'}
        log_mode: {type: enum, required: false, default: none, values: [follow, paused_snapshot, historical_view], provenance: gap, gap_note: 'the mode the stream opened in when the request left the mode to the surface default; enum values canon, echo shape typed nowhere'}
    DockerShellSessionResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container the audited exec/attach session opened in; name canon (row-group identity), result shape typed nowhere'}
        shell_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited docker exec/attach shell session (2.5A row); session record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_container_attach_shell), shape typed nowhere'}
    DockerContextSelectResultV1:
      fields:
        runtime_context_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the runtime context now selected; the arg name of cmd.docker.context.select (CRAU-092 runtime_context_ref?), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap,
                                  gap_note: 'capability after revalidation'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'present when the owner records a receipt'}
    DockerImageTagResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the tagged image'}
        applied_tag: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the tag as applied'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring row requires a receipt effect (catalog.docker_image_tag)'}
    DockerImageInspectResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the inspected image; name canon (row-group identity), result shape typed nowhere'}
        inspect_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'structured image inspect output with secret and redaction policy applied (lifecycle rows); record shape typed nowhere'}
    DockerImageMutationResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the image mutated; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring row requires a receipt or event effect (catalog.docker_image_delete), shape typed nowhere'}
    DockerComposeSubsetResultV1:
      fields:
        compose_project_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the compose project acted on; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring rows require a receipt or event effect (catalog.docker_compose_up_subset/down_subset), shape typed nowhere'}
    DockerComposeScenarioResultV1:
      fields:
        scenario_id: {type: id, required: true, default: none, constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}, provenance: gap, gap_note: 'the scenario saved, run, edited or deleted; bounds from the event payloads'' non_empty_id; the name is CRAU-096''s scenario schema field, and the docker.compose.scenario event payloads type it (non_empty_id), but no result shape is typed anywhere'}
        preview_run_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'the preview or development run the scenario id is recorded on (2.5A scenario.run row); record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring rows require a receipt or event effect, shape typed nowhere'}
    DockerRegistryPromoteResultV1:
      fields:
        image_digest: {type: string, required: true, default: none, constraints: {pattern: '^sha256:[0-9a-f]{64}$'}, provenance: gap, gap_note: 'the moved digest; CRAU-012 requires digest-first capture, the record shape is typed nowhere'}
        tags: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, constraints: {min_items: 1, unique_items: true}, provenance: gap, gap_note: 'the moved tag or tags, one per entry of the request''s target.tags, with the same item bounds, min_items 1 and unique_items; CRAU-012 receipt capture, shape typed nowhere'}
        source: {type: object, required: true, default: none, fields: {namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'source namespace of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}, repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'source repository of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}}, provenance: gap, gap_note: 'source namespace/repository of the promotion (CRAU-012); shape typed nowhere'}
        destination: {type: object, required: true, default: none, fields: {namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'destination namespace of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}, repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'destination repository of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}}, provenance: gap, gap_note: 'destination namespace/repository of the promotion (CRAU-012); shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'registry-side promotion receipt with actor, approval source and result id captured before downstream references update (CRAU-012); shape typed nowhere'}
    DockerDriftCompareResultV1:
      fields:
        drift_class: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the resulting drift class; missing prior metadata is unknown rather than clean (CRAU-013), but no class vocabulary is fixed. JUDGMENT: open string pending owner tokens'}
        source_metadata_refs: {type: list, required: true, default: none, item: {type: ref}, constraints: {unique_items: true}, provenance: gap, gap_note: 'receipts record what was compared and the source metadata refs (section 2A drift detection); shape typed nowhere'}
        partial: {type: boolean, required: true, default: none, provenance: gap, gap_note: 'whether the result is partial (section 2A drift detection); typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_drift_compare), shape typed nowhere'}
    DockerCleanupScanResultV1:
      fields:
        scan_result_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the dry-run prune/remove recommendations with protected asset and receipt checks (2.5A row; section 2A cleanup advisor); record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_cleanup_scan), shape typed nowhere'}
    DockerCleanupPruneResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the cleanup execution receipt; wiring row requires a receipt or event effect (catalog.docker_cleanup_prune), shape typed nowhere'}
    DockerK8sApplyResultV1:
      fields:
        manifest_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the manifest applied; echo of the request subject, shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'cross-surface receipt retaining kubernetes_refs lineage (UCC-053); shape typed nowhere'}
    DockerK8sDiffResultV1:
      fields:
        diff_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the manifest diff against the selected target; record shape typed nowhere'}
    DockerK8sLogStreamResultV1:
      fields:
        k8s_workload_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the workload streamed; echo of the request subject k8s_workload_ref (section 2A workload history), shape typed nowhere'}
        stream_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'ephemeral owner-surface log session (CRAU-014); session shape typed nowhere'}
        log_mode: {type: enum, required: false, default: none, values: [follow, paused_snapshot, historical_view], provenance: gap, gap_note: 'the mode the stream opened in when the request left the mode to the surface default; enum values canon, echo shape typed nowhere'}
    DockerK8sExecSessionResultV1:
      fields:
        k8s_workload_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the workload the audited privileged exec session opened in; echo of the request subject k8s_workload_ref (section 2A workload history), shape typed nowhere'}
        exec_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited privileged exec session (2.5B row); session shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt retaining kubernetes_refs lineage; wiring row requires a receipt or event effect (catalog.docker_k8s_exec), shape typed nowhere'}
    DockerK8sPortForwardResultV1:
      fields:
        port_forward_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited port-forward session (2.5B row); rebinding records local port reuse versus new allocation (section 2A); session shape typed nowhere'}
        local_bind_address: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the recorded local bind address (local bind address/port recorded, 2.5B row); typed nowhere'}
        local_port: {type: integer, required: true, default: none, constraints: {minimum: 1, maximum: 65535}, provenance: gap, gap_note: 'the recorded local port (2.5B row); typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt retaining kubernetes_refs lineage; wiring row requires a receipt or event effect (catalog.docker_k8s_port_forward), shape typed nowhere'}
    DockerK8sContextSelectResultV1:
      fields:
        kubernetes_context: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the context now selected; name canon (row-group identity), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'capability after revalidation (2.5B row)'}
    DockerK8sNamespaceSelectResultV1:
      fields:
        kubernetes_context: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the context the namespace was selected in; echo shape typed nowhere'}
        namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the namespace now selected; name canon (row-group identity), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'capability after the workload-focus refresh (2.5B row)'}
    DockerHelmPreviewResultV1:
      fields:
        render_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the rendered Helm output without applying it (2.5B row); record shape typed nowhere'}
    DockerHelmInstallResultV1:
      fields:
        helm_release_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the installed or upgraded release (2.5B row); record shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'cross-surface receipt retaining kubernetes_refs lineage (UCC-053); wiring row requires a receipt or event effect (catalog.docker_k8s_helm_install), shape typed nowhere'}
```

### CRAU-116 - Docker Hosts Run And Container Open Command Payload Definitions

```yaml
plan_unit_id: CRAU-116
unit_type: command_contract
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Typed payload definitions (DL-333) for the thirteen Docker/Hosts and container-run commands that
  UI_Command_Catalog UCC-105 registers and UCC-230 routes to this unit: cmd.docker.run and
  cmd.docker.container.open (existing ids UCC-105 keeps where exact semantics match) and the eleven
  registered Docker/Hosts ids hosts.open, host.refresh, host.preflight, host.profile.save,
  host.session.launch, host.instance.start, host.instance.stop, host.instance.restart,
  host.access.open_app, host.instance.retain and host.receipt.open. CV-304's HostCapabilityCommand
  is the dispatch envelope these commands ride on; it has no typed schema, so every envelope field
  this block names from UCC-105 or CV-304 prose carries provenance gap, and the overlay identity
  fields host_capability_ref and host_profile_id keep their UCC-230 types. The definitions block
  below gives each command its args, owner request and owner result in
  pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the
  overlay's closed sets. An owner_request of none means the command's Wiring_Matrix.production.json
  row names no request_schema_ref. These definitions carry the FileSafe scope on the host profile as
  CV-303's filesafe_scope_ref, a gap choice recorded in cmd.docker.host.profile.save, and the host
  commands read it from the saved profile.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Docker/Hosts page and container run commands.
depends_on: [UCC-230, UCC-105, UCC-217, CRAU-092, CRAU-094, CRAU-095, CV-303, CV-304, CV-333, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to CRAU-116 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Every judgment a definition makes is in its judgments list with a key, a choice and a gap_note; the definitions block holds no YAML comment and names no review or evidence material (DL-341).
  - Access actions consume structured port_access_record data and never guess low-confidence localhost URLs (CRAU-092).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.docker.run, cmd.docker.container.open, cmd.docker.hosts.open, cmd.docker.host.refresh, cmd.docker.host.preflight, cmd.docker.host.profile.save, cmd.docker.host.session.launch, cmd.docker.host.instance.start, cmd.docker.host.instance.stop, cmd.docker.host.instance.restart, cmd.docker.host.access.open_app, cmd.docker.host.instance.retain, cmd.docker.host.receipt.open]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not copy the Coasts HTTP API, terminal or file controls into these payloads (UCC-105, CV-304).
  - Do not type the HostCapabilityCommand envelope beyond what UCC-105 and CV-304 name; envelope fields stay provenance gap until CV-304 gains a typed schema.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: CRAU-116
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.docker.run
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity image_ref?; 2.5A row precondition image_selected makes the image the subject"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; UCC-105 keeps cmd.docker.run on the HostCapabilityCommand envelope where exact semantics match"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; UCC-105 envelope field"
        run_options:
          type: object
          required: false
          default: none
          fields:
            container_name: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                             provenance: gap, gap_note: 'run options (name, ports, env, volumes, network) are not defined anywhere; only image_ref is implied (2.5A row). JUDGMENT: optional container name'}
            ports: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                    constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional published-port specs; item shape unstated, a structured mapping stays open for the compile review'}
            env: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                  constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional environment entries; secrets must travel as refs, not values (CV-303: raw secrets are absent from profiles, receipts and access records)'}
            volumes: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                      constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional volume mounts; item shape unstated'}
            network: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                      provenance: gap, gap_note: 'JUDGMENT: optional network name'}
          provenance: gap
          gap_note: >-
            The row says only "Starts a container from selected image" (2.5A); run options are not defined.
            JUDGMENT: one optional nested object whose field names are judgments listed for the compile
            review; absent starts the container with the image's defaults and no overrides.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A run row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts a container from the selected image (Cozy keeps it live as create-from-image, distinct from cmd.docker.container.start), a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && image_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. blocked_state_required is listed because cmd.docker.run rides on the HostCapabilityCommand envelope (UCC-105) and UCC-105's fixtures for missing authority, FileSafe scope or receipt expectation must fail closed before mutation, as for the other mutating host commands."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_capability_ref and host_profile_id from the args where present; requested_action from the command id (run); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.container.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "2.5A row subject (running container) and CRAU-013 preserved token cmd.docker.container.open; overlay family-specific arg"
        access_target_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The access target field and the confidence input are not defined (2.5A row: opens a resolved URL
            or access target when confidence is sufficient). JUDGMENT: optional ref to the resolved access
            record; absent lets the owner resolve from URL/URLs discovery with the confidence threshold, and
            an uncertain heuristic shows candidate actions or logs/inspect first (section 2A access
            intelligence). The confidence input has no field and none is minted here.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; UCC-105 keeps cmd.docker.container.open on the HostCapabilityCommand envelope where exact semantics match"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; UCC-105 envelope field"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: access_url_unresolved, code: not_configured}
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind for this row: the 2.5A container.open row gives only label, description and availability, and no Cozy lifecycle table lists it. It opens a resolved URL or access target, a route/open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && container_running && access_target_resolved gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Low-confidence access is blocked, not guessed (CRAU-013, UCC-105 low-confidence port access denial). When no override, published port or web-UI label gives an access URL, Docker Manager disables the open action (section 2A Runtime access URL resolution); that is CRAU-095's access_url_unresolved, which shows as not_configured through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.hosts.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 Docker/Hosts route payload {route_target: docker_hosts, ...}; UCC-230 canonical type kept, narrowed to required"
        owner_surface:
          type: const
          value: docker_manager
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 route payload owner_surface: docker_manager, unqualified; acceptance criterion: Docker/Hosts route payloads include owner_surface, source_surface, subview"
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 route payload lists project_id unqualified; UCC-230 envelope common optional project_id restated required"
        repo_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "CRAU-092 route payload repo_id?; UCC-230 envelope common optional repo_id"
        workspace_root_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "CRAU-092 route payload names workspace_root_id?; not a UCC-230 common optional field, so it is a family arg. JUDGMENT: type id by the _id suffix convention"
        subview:
          type: enum
          required: true
          default: none
          values: [overview, profiles, instances, runtime_matrix, host_lab_sessions, access_ports, receipts_artifacts, settings, compose]
          provenance: gap
          gap_note: >-
            Required is canon: CRAU-092's route payload lists subview with no ?, and its acceptance criterion says
            route payloads include owner_surface, source_surface, subview. The value compose is canon: CRAU-094,
            the successor to CRAU-092's subview vocabulary, says the route payload subview vocabulary admits
            compose. The other eight are display names only (CRAU-092 preserved tokens and canonical text;
            FinalGUISpec.md Docker/Hosts page): Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions,
            Access & Ports, Receipts & Artifacts and Settings, with no wire tokens. JUDGMENT: snake_case of those
            eight names; distinct from the Docker Manager subview enum of cmd.docker.switch_subview.
        focus_kind:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "CRAU-092 route payload names focus_kind? without a vocabulary; CRAU-094 says focus_kind admits compose_project and compose_scenario, which this field accepts. Canon fixes no other values although CRAU-092 focuses host, profile, instance, access and receipt detail views, so the vocabulary is open. JUDGMENT: open string pending owner tokens, not an enum of the two named values"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; CRAU-092 route payload host_capability_ref?"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; CRAU-092 route payload host_profile_id?"
        host_instance_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "UCC-105 canonical text and CV-303 preserved tokens name host_instance_id as an optional backend-fact id; typed nowhere. JUDGMENT: type id by the _id suffix convention"
        host_assignment_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "CV-303 preserved token host_assignment_id and CRAU-092 route payload host_assignment_id?; typed nowhere. JUDGMENT: type id by the _id suffix convention"
        runtime_family:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "CRAU-092 route payload names runtime_family? and says runtime families are PM identities, but fixes no family vocabulary. JUDGMENT: open string pending owner tokens"
        runtime_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "CRAU-092 route payload names runtime_context_ref?; typed nowhere. JUDGMENT: type ref by the _ref suffix convention"
        port_access_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "CV-303 preserved token port_access_ref and CRAU-092 route payload port_access_ref?; the structured port access record is typed nowhere. JUDGMENT: type ref by the _ref suffix convention"
        receipt_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "CRAU-092 route payload receipt_ref?; UCC-230 envelope common optional receipt_ref"
        blocked_sequence:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: gap
          gap_note: "CRAU-092 route payload lists blocked_sequence? without a type. JUDGMENT: non-negative integer, matching the runtime recovery blocked-sequence identity it names and the permission snapshot record's blocked_sequence (Plans/shared_runtime_contracts.schema.json, integer or null, minimum 0)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: UCC-105 registers the id and CRAU-092 makes Docker/Hosts a routed destination with a route payload. A route open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded], gap_note: "No row states a subset; the page renders cached last-known state when unreachable (section 2A posture), so these codes are availability copy from the shared taxonomy."}
    - command_id: cmd.docker.host.refresh
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; which host(s) to refresh is otherwise undefined"
        host_instance_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UCC-105 canonical text names host_instance_id as an optional backend-fact id; whether a refresh
            targets one instance or all discovered hosts is unstated. JUDGMENT: optional id; absent refreshes
            the profile or all discovered hosts.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostRefreshResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It refreshes the host projection (event docker.host.refresh_requested), an owner operation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A refresh replaces a stale projection with a fresh one."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. A refresh mutates no host, so of UCC-105's envelope fields only host_capability_ref, host_profile_id and host_instance_id are relevant, and the handler sends the args it has; the authority, policy and receipt-expectation fields UCC-105 requires before mutation are not built for a projection refresh. Canon says nowhere which fields a refresh carries; this is the choice."}
    - command_id: cmd.docker.host.preflight
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the preflight subject is the profile whose action is proposed"
        requested_action:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            UCC-105 canonical text names requested_action as a HostCapabilityCommand envelope field but types
            nothing (CV-304 has no typed schema). JUDGMENT: open string naming the action being preflighted;
            an enum of host actions stays open for the compile review.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; the capability the proposed action would use"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostPreflightResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It runs the preflight before approval (event docker.host.preflight_requested; section 2A preflight ordering), an owner operation, so domain_action."}
        - {key: error_codes, choice: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error], gap_note: "blocked_state_required is left out although the other mutating host commands list it: a preflight that finds unresolved facts reports blocked_preflight as its outcome, and those facts block the later mutation, not this command (section 2A preflight and approval ordering contract). The set is the narrowing rule's set for a domain_action whose disabled reasons do not include blocked_state_required."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability], gap_note: "No row states a subset; preflight resolves reachability, trust and proxy policy and capability (section 2A), from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler sends requested_action, host_profile_id and, when given, host_capability_ref from the args, and fills the profile's FileSafe scope (filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save), so the preflight checks the policies the later mutation will carry. The saved profile holds no host_capability_ref, so without the arg the envelope carries none. approval_scope_key and permission_snapshot_id are not built, because approval follows preflight (section 2A preflight and approval ordering). Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.host.profile.save
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; absent creates a new profile, present saves the identified one"
        profile:
          type: object
          required: true
          default: none
          fields:
            display_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                           provenance: gap, gap_note: 'the host profile definition shape is not defined anywhere (no catalog row). JUDGMENT: required human-readable name'}
            runtime_family: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                             provenance: gap, gap_note: 'runtime families are PM identities (CRAU-092) with no fixed vocabulary. JUDGMENT: optional family name'}
            network_access_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                    provenance: gap, gap_note: 'UCC-105 and CV-304 name network_access_policy in prose only; no typed schema exists. JUDGMENT: open string pending CV-304 typing'}
            secret_access_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                   provenance: gap, gap_note: 'UCC-105 and CV-304 name secret_access_policy in prose only. JUDGMENT: open string; raw secrets never enter profiles (CV-303)'}
            destructive_command_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                         provenance: gap, gap_note: 'UCC-105 and CV-304 name destructive_command_policy in prose only. JUDGMENT: open string pending CV-304 typing'}
            preflight_required: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'UCC-105 names preflight_required in prose only. JUDGMENT: optional boolean, no dispatch default'}
            filesafe_scope_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'UCC-105 and CV-304 call it FileSafe scope in prose; CV-303 names filesafe_scope_ref among the host contract families and in its preserved tokens, but types nothing. JUDGMENT: optional ref by the _ref suffix convention; the host commands read the FileSafe scope from it, and a host command whose profile has none fails closed (UCC-105 missing FileSafe scope fixture)'}
          provenance: gap
          gap_note: >-
            The host profile definition shape is not defined anywhere (no catalog row; CV-304 gives only the
            envelope field names, and CV-303 keeps raw secrets out of host profiles). JUDGMENT: a minimal nested object; every field
            name except the UCC-105/CV-304 envelope names and CV-303's filesafe_scope_ref is a judgment for the compile review.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostProfileSaveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It writes a host profile record (event docker.host.profile_saved), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, permission_required], gap_note: "No row states a subset; a profile write is local configuration, so only a missing configuration or a permission gate disables it."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The profile arg carries the UCC-105 policy fields (network_access_policy, secret_access_policy, destructive_command_policy, preflight_required) and the FileSafe scope as filesafe_scope_ref (CV-303's name; UCC-105 and CV-304 say only FileSafe scope), which later host commands read from the saved profile; approval_scope_key, permission_snapshot_id and allowed_action_ids come from the Permissions admission (UCC-217), not from args. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.host.session.launch
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the launch inputs name the profile (UCC-105 acceptance ties ATS host launches to registered ids)"
        execution_unit_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "UCC-105 canonical text names execution_unit_context_ref, which this field uses; CV-304 spells the same envelope field execution_unit_context. The two live units disagree on the spelling; this definition takes UCC-105's, the catalog unit that registers the command and lists the envelope fields, and the owner doc must settle which spelling stands. Typed nowhere. JUDGMENT: optional ref to the execution unit context record, typed ref by the UCC-230 _ref rule"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostSessionLaunchResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It launches a Host Lab session (event docker.host.session_launch_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; session launch carries authority, FileSafe and preflight expectations (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_profile_id and, when given, host_capability_ref from the args; no host_instance_id, because a launch names no existing instance and its args carry none, so the envelope goes without one and the launched session comes back as HostSessionLaunchResultV1.host_session_ref; requested_action from the command id (session launch); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
        - {key: omitted:ats_target_ref, choice: omitted, gap_note: "UCC-105 names ATS host launches among the surfaces that use registered command ids, but canon names no field for the ATS or session target of a launch. This definition mints none; the compile review must decide whether a launch names its ATS session or the Host Lab session is created untargeted."}
    - command_id: cmd.docker.host.instance.start
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (start; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance start); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.host.instance.stop
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (stop; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance stop); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.host.instance.restart
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (restart; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance restart); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.host.access.open_app
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        port_access_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The access target (app URL/port ref) is not defined (no catalog row). JUDGMENT: required ref to
            the structured port_access_record (CV-303 preserved token port_access_ref, CRAU-092 route payload
            and acceptance criterion), never a guessed localhost URL.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostAccessOpenResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, blocked_state_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. Access actions consume structured port_access_record data under authority gates (CRAU-092), so domain_action; navigation_wrapper would fit only if it routed to an already-resolved URL."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, blocked_state_required], gap_note: "No row states a subset; low-confidence port access is denied with evidence, not guessed (CRAU-092; UCC-105 fixture list), carried as blocked_state_required, with the rest from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_capability_ref and host_profile_id from the args where present and host_instance_id from the port access record that port_access_ref names; requested_action from the command id (open app); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile (cmd.docker.host.profile.save); and no expected receipt ref: UCC-105 asks for expected receipt refs when relevant, and this command's wiring row (catalog.docker_host_access_open_app) requires the event docker.host.access_open_requested, not a receipt. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's missing-authority and missing-FileSafe-scope fixtures then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.host.instance.retain
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the retention command's subject is the instance"
        retention_policy:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            Retention intent and period are not defined anywhere; CV-304 names only a cleanup policy in prose
            and CV-303 the cleanup_retention_receipt. JUDGMENT: optional open string naming the retention
            intent; a structured period field stays open for the compile review.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceRetainResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required, blocked_state_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It records a cleanup retention (event docker.host.instance_retention_recorded), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required, blocked_state_required], gap_note: "No row states a subset; cleanup and retain actions carry receipt requirements (UCC-105 fixture list), so a missing receipt expectation blocks, with the rest from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id and host_capability_ref from the host instance record that host_instance_id names (CV-303 lists host instance among the host contract families but types no field, so that the record carries both is part of this choice); requested_action from the command id (instance retain); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the cleanup policy CV-304 names, the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy and preflight_required from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (cleanup_retention_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation."}
    - command_id: cmd.docker.host.receipt.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "receipt_ref is the UCC-230 common optional field made required by the command subject (one receipt); the Docker/Hosts Receipts & Artifacts subview opens receipts directly (CRAU-092)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It opens a receipt view (event docker.host.receipt_opened), a route open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, stale_projection], gap_note: "No row states a subset; receipts open from local records, so only missing configuration, an unreachable owner or a stale projection disables it."}
  results:
    DockerContainerRunResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container started from the image; name canon for the family, result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_run), shape typed nowhere'}
    HostRefreshResultV1:
      fields:
        host_profile_id: {type: id, required: false, default: none, provenance: gap, gap_note: 'the refreshed profile when one was targeted; result shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'the refreshed capability snapshot; result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_refresh), shape typed nowhere'}
    HostPreflightResultV1:
      fields:
        host_preflight_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token host_preflight_receipt; the record shape is typed nowhere'}
    HostProfileSaveResultV1:
      fields:
        host_profile_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the profile saved or created; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_profile_save), shape typed nowhere'}
    HostSessionLaunchResultV1:
      fields:
        host_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the launched Host Lab session (CRAU-092 subview); session record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_session_launch), shape typed nowhere'}
    HostInstanceLifecycleResultV1:
      fields:
        host_instance_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the instance acted on; name from UCC-105 prose, result shape typed nowhere'}
        host_execution_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token host_execution_receipt; UCC-105 requires receipt expectations before mutation; shape typed nowhere'}
    HostAccessOpenResultV1:
      fields:
        port_access_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the access record opened; echo of the request subject, shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_access_open_app), shape typed nowhere'}
    HostInstanceRetainResultV1:
      fields:
        host_instance_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the instance retained; name from UCC-105 prose, result shape typed nowhere'}
        cleanup_retention_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token cleanup_retention_receipt; UCC-105 requires cleanup/retain receipt expectations; shape typed nowhere'}
```
