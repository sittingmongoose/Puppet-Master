# Shard 014: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L1752-L2108

Source SHA256: `30794912c967f901eaa5ef1eebdc75dc71d0f6d9566083446a7566bcba9382a8`

---

## Command payload definitions (DL-333, 2026-11-05)

### PNC-037 - Plan Compile Command Payload Definitions

```yaml
plan_unit_id: PNC-037
unit_type: command_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Typed payload definitions for the nine cmd.plan_compile.* commands that UI_Command_Catalog UCC-098
  registers and UCC-230 routes to this doc (DL-333). Each command's field list is the runtime
  contract row keyed by its catalog id in Plans/prd_planning_runtime_contracts.json
  ui_command_contracts (DL-333 coordinator resolution 1); that file's former ids are recorded
  compatibility aliases, and the catalog row's payload summary column is history. The run identity is
  the PlanCompileRun compile_id the state record names (PNC-006 state machine), and
  cmd.plan_compile.open_build takes the PlanCompileRun identity the catalog names
  (plan_compile_run_id), not a goal run id (DL-333 resolution 1). The runtime contract's owner
  disabled states map to the overlay's closed codes through UCC-230 owner_state_code_map. The
  definitions block below gives each command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability and aliases; the strict schema overlay keeps the common envelope and the closed code
  sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Plan Compile pause, resume, cancel, retry, inspection, recompile and Open Build commands.
depends_on: [UCC-230, UCC-097, UCC-098, DL-333, CV-333, PNC-014]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to PNC-037 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "Plans/prd_planning_runtime_contracts.json ui_command_contracts and plan_compile_runtime (field lists under the catalog ids; DL-333 resolution 1)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.plan_compile.pause, cmd.plan_compile.resume, cmd.plan_compile.cancel, cmd.plan_compile.retry, cmd.plan_compile.inspect_blocker, cmd.plan_compile.inspect_evidence, cmd.plan_compile.inspect_assignment, cmd.plan_compile.request_bounded_recompile, cmd.plan_compile.open_build]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the runtime contract file's former ids are compatibility aliases and never dispatch.
  - Do not enable runtime launch through these definitions; bootstrap/v1 PlanCompile stays design_only_disabled (PNC-015 boundary).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/plans_to_code_handoff.schema.json]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: PNC-037
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.plan_compile.pause
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.plan_compile.pause (command_kind domain_action); the
      # history column's extra "current stage token" input has no field in the runtime field list.
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.pause; PlanCompileRun state record identity compile_id (PNC-006 state machine, Plan_To_Node_Compilation.md:644)"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompilePauseResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's compile_terminal maps to blocked_state_required
      # (owner_state_code_map); refresh_compile_state_before_pause is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.resume
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.plan_compile.resume (command_kind domain_action); the
      # history column's extra "recovery route" input has no field in the runtime field list.
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.resume; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        resume_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.resume; compile wave contracts and resume routes carry resume_ref (Plan_To_Node_Compilation.md:644, PNC-014 resume rule); guard resume_ref_valid"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileResumeResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's missing_resume_ref maps to blocked_state_required
      # (owner_state_code_map); load_compile_cursor_before_resume is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.cancel
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.plan_compile.cancel (command_kind domain_action); the
      # history column's extra "confirmation token" input has no field in the runtime field list.
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.cancel; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        cancel_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names cancel_reason with no type or bounds; JUDGMENT: typed string
            with no bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileCancelResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's mutation_already_active maps to blocked_state_required
      # (owner_state_code_map); refresh_activation_state_before_cancel is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.retry
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.plan_compile.retry (command_kind domain_action).
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        stage_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; stage_card required field stage_id, a canonical registry stage_name (PNC stage-card contract, Plan_To_Node_Compilation.md:717)"
        repair_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; guard stage_retry_allowed over the recorded repair; the history column's currentness-token input has no runtime field"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileRetryResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's stage_not_retryable maps to blocked_state_required
      # (owner_state_code_map); reload_stage_card_and_worklist_before_retry is the freshness clause.
      aliases:
        - {command_id: cmd.plan_compile.retry_stage, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.plan_compile.inspect_blocker
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      # canon: runtime contract row cmd.plan_compile.inspect_blocker (command_kind
      # navigation_wrapper); the result is a route, so the response carries no owner result.
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_blocker; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        blocker_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_blocker; PlanCompileRun state record carries blockers; guard blocker_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's blocker_missing maps to blocked_state_required
      # (owner_state_code_map); refresh_blocker_projection_before_open is the freshness clause; the
      # result_contract route_target rides the CV-333 response.
      aliases: []
    - command_id: cmd.plan_compile.inspect_evidence
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      # canon: runtime contract row cmd.plan_compile.inspect_evidence (command_kind
      # navigation_wrapper); the history column's extra "redaction profile" input has no field in
      # the runtime field list.
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_evidence; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        evidence_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_evidence; compile waves carry durable_evidence_refs (Plan_To_Node_Compilation.md:644); guard evidence_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's evidence_missing maps to blocked_state_required
      # (owner_state_code_map); refresh_evidence_projection_before_open is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.inspect_assignment
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      # canon: runtime contract row cmd.plan_compile.inspect_assignment (command_kind
      # navigation_wrapper).
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_assignment; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        assignment_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_assignment; compile wave contracts carry assignment_id (Plan_To_Node_Compilation.md:644); guard assignment_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's assignment_missing maps to blocked_state_required
      # (owner_state_code_map); refresh_assignment_projection_before_open is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.request_bounded_recompile
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.plan_compile.request_bounded_recompile (command_kind
      # domain_action).
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.request_bounded_recompile; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        invalidated_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.request_bounded_recompile; the history column names affected PlanUnit refs; guard invalidated_refs_present"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileBoundedRecompileResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's no_invalidated_refs maps to blocked_state_required
      # (owner_state_code_map); refresh_impact_report_before_recompile is the freshness clause.
      aliases: []
    - command_id: cmd.plan_compile.open_build
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      # canon: runtime contract row cmd.plan_compile.open_build (command_kind navigation_wrapper);
      # it takes the PlanCompileRun identity the catalog names, not a goal run id (DL-333
      # resolution 1). PNC-014 makes it a route/open with projected availability, disabled reason
      # and an explicit receipt, so it carries an owner result unlike the inspect commands.
      response_kind: owner_operation
      args:
        plan_compile_run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.open_build; overlay UCC-096..UCC-100 optional identity plan_compile_run_id; DL-333 resolution 1 (PlanCompileRun identity the catalog names)"
        build_started_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.open_build; guard build_started_exists over the durable BuildStarted projection; the history column's target-artifact-or-route input rides the result route"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileOpenBuildResultV1
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's activation_not_active maps to blocked_state_required
      # (owner_state_code_map); its stale_projection_policy opens only after the durable
      # BuildStarted projection (the freshness clause). No fabricated success event and no runtime
      # activation claim while the branch is design_only (PNC-014).
      aliases: []
  results:
    PlanCompilePauseResultV1:
      fields:
        compile_pause_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileResumeResultV1:
      fields:
        compile_resume_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileCancelResultV1:
      fields:
        compile_cancel_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileRetryResultV1:
      fields:
        stage_retry_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileBoundedRecompileResultV1:
      fields:
        bounded_recompile_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileOpenBuildResultV1:
      fields:
        route_target: {type: contract, ref: Primitive:RouteTarget, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the resulting build or build-artifact route the history column names"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "build_opened effect of the runtime row; PNC-014 requires an explicit receipt; no typed result contract"}
```
