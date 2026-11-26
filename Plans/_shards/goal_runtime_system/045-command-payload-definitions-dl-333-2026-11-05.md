# Shard 045: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8810-L9803

Source SHA256: `828fae2e8d97ac26de741feb064e70475c62350b769071666b9e5a52fbc7a128`

---

## Command payload definitions (DL-333, 2026-11-05)

### GRS-218 - Goal Mode Command Payload Definitions

```yaml
plan_unit_id: GRS-218
unit_type: command_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Typed payload definitions for the Assistant Chat Goal Mode commands that UI_Command_Catalog UCC-096
  registers (DL-333): cmd.chat.goal.start and cmd.chat.goal.update, the Goal Runtime exact commands whose
  request and result contracts Goal_Runtime_System owns (Goal V2 exact commands table; CV-342 adds
  GoalUpdateRequestV2 and GoalUpdateResultV2). The definitions block below gives each active command its
  args, owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1.
  Each definition takes the owner-input edition of the thread's actual scope: the Project editions
  GoalStartRequestV2 and GoalUpdateRequestV2 for a Project thread, and the application editions that GRS-086
  admits and CV-366 selects for an app thread with project_id=null, for which no Project identity is built.
  The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the common
  envelope and the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Goal Mode activation and update commands.
depends_on: [UCC-230, UCC-096, GRS-066, GRS-068, GRS-086, CV-342, CV-366, SP-299, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to GRS-218 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.goal.start, cmd.chat.goal.update]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not restate the envelope fields dispatch_id, command_id, source_surface or actor_ref as args; the owner request carries them at its own layer.
  - Do not build a Project identity for an app-thread Goal, send an application edition for a Project thread, or rebind a null Project to a Project (GRS-086).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: GRS-218
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.goal.start
      ucc_units: [UCC-096]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1121 2.7.1 Goal Mode slash command row payload { thread_id, goal_prompt?, source }; UCC-230 envelope common optional thread_id restated required (the Goal is created for the active thread, Goal_Runtime_System.md:254)"
        goal_prompt:
          type: string
          required: false
          default: none
          constraints: {max_length: 4000, pattern: '^[^\ud800-\udfff]*$'}
          provenance: gap
          gap_note: >-
            The 2.7.1 row names goal_prompt? but no canon states a type or bounds for the UI argument.
            Chosen: a string reusing the objective_text bounds of Plans/goal_runtime_contracts.schema.json
            $defs/GoalStartRequestV2 (maxLength 4000, no surrogate code points). Whether goal_prompt maps
            one-to-one onto that owner-request objective_text is not stated.
        source:
          type: enum
          values: [slash, button, chip, icon, natural_language]
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1121 2.7.1 row payload source: slash|button|chip|icon|natural_language (the activation surface). This is the UI activation enum; the owner request's source_surface in GoalStartRequestV2 is the separate goal-surface namespace (agent_runtime, approved_agent_proposal, goal_activity, goal_activity_editor, goal_control, goal_hover, natural_language, slash, wand)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartRequestScopeV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required]
      aliases: []
      judgments:
        - key: owner_request
          choice: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartRequestScopeV2
          gap_note: "Canon gives the start one edition per scope and wires only one. The production wiring row (Wiring_Matrix.production.json entries.catalog.chat_goal_start request_schema_ref) and the Simplified Goal Runtime registration row (UI_Command_Catalog.md:15482, command_kind domain_action) name application_workflow_contracts GoalStartRequestScopeV2, which resolves to GoalCommandRequestApplicationV1, whose cmd.chat.goal.start branch is the retained GoalCommandRequestApplicationLegacyV1 (schema_id pm.goal.command_request.application.v1). That root is the application edition: GRS-086 lets an app thread with project_id=null start a Goal (Goal_Runtime_System.md:8213), CV-366 makes GRS-086 its owner (Plans/Contracts_V0.md:24202) and selects it for the app.goal_start.v1 graph, scope_kind application, through owner.goal.start.application@1.0.0 (Plans/Contracts_V0.md:24280; Plans/application_workflow_source_graph.json:1061-1062), and the application Goal record's project_id is const null (Plans/application_workflow_contracts.schema.json:2960-2961). This document's Goal V2 exact-commands passage (Goal_Runtime_System.md:262), the Original Goal creation command settlement passage before GRS-066 (Goal_Runtime_System.md:6337), Plans/Commands_System.md:6402 and Plans/Contracts_V0.md:22495 name goal_runtime_contracts GoalStartRequestV2 (CV-341), the Project edition, which stays unchanged (Goal_Runtime_System.md:264) and which CV-366's application siblings never relax in place (Plans/Contracts_V0.md:24114). The definition follows the wiring row for an app thread and, for a Project thread, has the handler build GoalStartRequestV2 with the thread's own Project, which no wiring or registration row names. The wiring and registration rows do not carry the Project edition; not settled here."
        - key: owner_result
          choice: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2
          gap_note: "Same split as the request: the wiring row's result_schema_ref is GoalStartResultScopeV2 (GoalCommandResultApplicationV1), the application edition's result (Plans/Contracts_V0.md:24280), while Goal_Runtime_System.md:262, the Original Goal creation command settlement passage before GRS-066 (Goal_Runtime_System.md:6337) and Plans/Commands_System.md:6402 name GoalStartResultV2, the Project edition's. Canon's result boundary (goal_id, revision 1, currentness_hash and a creation receipt, Goal_Runtime_System.md:254) is stated for the command, not for either schema; the definition follows the wiring row, and a Project thread's start returns GoalStartResultV2, which no wiring row names."
        - key: disabled_reason_codes
          choice: [not_configured, unreachable, degraded, blocked_state_required]
          gap_note: "No registration table states disabled reasons for this row; chosen from the closed set over the catalog preconditions assistant_chat_available && goal_runtime_available && no_active_goal_on_thread (UI_Command_Catalog.md:15482): runtime unavailable maps to not_configured, unreachable or degraded, and an active goal already on the thread to blocked_state_required. handler_unavailable stays the evidence boundary (Plans/Commands_System.md:6402) and is an error code, not a disabled code."
        - key: omitted:schema_id
          choice: "left out of args; the handler sets the selected edition's const: pm.goal.command_request.application.v1 for an app thread, pm.goal.start.request.v2 for a Project thread"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires schema_id (const pm.goal.command_request.application.v1, Plans/application_workflow_contracts.schema.json:16764) and GoalStartRequestV2 requires schema_id (const pm.goal.start.request.v2, Plans/goal_runtime_contracts.schema.json:7); canon does not say whether the UI or the handler supplies the request marker."
        - key: omitted:schema_version
          choice: "left out of args; the handler sets the selected edition's const: 1.0.0 for an app thread, 2.0.0 for a Project thread"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires schema_version (const 1.0.0, Plans/application_workflow_contracts.schema.json) and GoalStartRequestV2 requires schema_version (const 2.0.0, Plans/goal_runtime_contracts.schema.json); canon does not say whether the UI or the handler supplies it."
        - key: omitted:context
          choice: "left out of args; for an app thread the handler builds the WorkflowCommandContextV1 from the envelope and the active thread, with an application scope and null Project; the Project edition has no context"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires context, a WorkflowCommandContextV1 (Plans/shared_integration_runtime.schema.json: scope, storage_instance_id, thread_id, execution_host_id, execution_environment_id, roots, command_instance_id, idempotency_key, actor_ref, permission_evidence, writer_evidence, scope_stop_epoch, task_stop_epoch, expected_generation, return_context_ref), whose application scope fixes project_id as null (Plans/shared_integration_runtime.schema.json:2905). GoalStartRequestV2 has no context and carries project_id, thread_id, command_instance_id, permission_snapshot_ref, idempotency_key and return_route_ref itself. The 2.7.1 row gives the UI only thread_id, goal_prompt and source (UI_Command_Catalog.md:1121); canon does not say how the handler fills the rest. actor_ref and the envelope identity are UCC-230 required_not_restated."
        - key: omitted:project_id
          choice: "left out of args; on the Project edition the handler copies the Project thread's own project_id, and on the application edition the scope's project_id stays null; no Project is fabricated"
          gap_note: "GoalStartRequestV2 requires project_id (string 1..256, Plans/goal_runtime_contracts.schema.json:7), and every Goal request carries explicit app/Project scope with project_id null for app (Goal_Runtime_System.md:264). The 2.7.1 row gives the UI no project_id (UI_Command_Catalog.md:1121), and canon does not say that the handler reads it from the thread."
        - key: omitted:command_instance_id
          choice: "left out of args; the handler supplies it, at the top level of the Project edition and in context on the application edition"
          gap_note: "GoalStartRequestV2 requires command_instance_id (string 1..256) and WorkflowCommandContextV1 requires its own; the 2.7.1 row gives the UI none (UI_Command_Catalog.md:1121), and canon does not say who mints it."
        - key: omitted:permission_snapshot_ref
          choice: "left out of args; on the Project edition the handler supplies the permission snapshot"
          gap_note: "GoalStartRequestV2 requires permission_snapshot_ref (string 1..256); the application edition carries context.permission_evidence instead. The 2.7.1 row gives the UI no permission reference (UI_Command_Catalog.md:1121), and canon does not say who supplies it."
        - key: omitted:idempotency_key
          choice: "left out of args; the handler supplies it, at the top level of the Project edition and in context on the application edition"
          gap_note: "GoalStartRequestV2 requires idempotency_key (string 1..256) and WorkflowCommandContextV1 requires its own; the 2.7.1 row lists none (UI_Command_Catalog.md:1121), and canon does not say whether the UCC-230 envelope's common optional idempotency_key or the handler supplies it."
        - key: omitted:source_surface
          choice: "left out of args; on the Project edition the handler writes GoalStartRequestV2's goal-surface source_surface"
          gap_note: "GoalStartRequestV2 requires source_surface from the separate goal-surface namespace (agent_runtime, approved_agent_proposal, goal_activity, goal_activity_editor, goal_control, goal_hover, natural_language, slash, wand; its $comment: not the generic UI source_surface, Plans/goal_runtime_contracts.schema.json:7). UCC-230 forbids restating the envelope name as an arg; the activation enum shares slash and natural_language with that namespace but has button, chip and icon outside it, and canon does not say how the handler derives the Goal value. The application edition has no source_surface."
        - key: omitted:return_route_ref
          choice: "left out of args; on the Project edition the handler supplies the return route"
          gap_note: "GoalStartRequestV2 requires return_route_ref (string 1..256); the application edition carries context.return_context_ref instead. Canon does not say who supplies either."
        - key: omitted:goal_id
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires goal_id, string or null (Plans/application_workflow_contracts.schema.json). A start creates the Goal (Goal_Runtime_System.md:254) and GoalStartRequestV2 types goal_id as null (Plans/goal_runtime_contracts.schema.json); canon does not say who writes the null on the legacy request."
        - key: omitted:expected_revision
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires expected_revision, integer minimum 0 or null; GoalStartRequestV2 types it as null because no Goal exists yet. Canon does not say who writes it on the legacy request."
        - key: omitted:expected_currentness_hash
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires expected_currentness_hash, sha256 hex or null; GoalStartRequestV2 types it as null because no Goal exists yet. Canon does not say who writes it on the legacy request."
        - key: omitted:objective_text
          choice: "left out of args; the handler fills objective_text from goal_prompt"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires objective_text (string maxLength 4000 without surrogate code points, or null) and GoalStartRequestV2 requires it as a string with the same bounds; the 2.7.1 row's UI argument is goal_prompt? (UI_Command_Catalog.md:1121). Canon does not state that goal_prompt maps onto objective_text, nor what an absent goal_prompt becomes (Plans/Contracts_V0.md:22495 says empty objective text is valid)."
        - key: omitted:source_message_id
          choice: "left out of args; on the application edition the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires source_message_id, string or null (Plans/application_workflow_contracts.schema.json); GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: omitted:approval_id
          choice: "left out of args; on the application edition the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires approval_id, string or null; GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: omitted:original_operation_ref
          choice: "left out of args; on the application edition the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires original_operation_ref, string or null; GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: field:source
          choice: "kept in args as the UI activation enum; not forwarded into GoalCommandRequestApplicationLegacyV1, and not GoalStartRequestV2's source_surface"
          gap_note: "The 2.7.1 row requires source: slash|button|chip|icon|natural_language (UI_Command_Catalog.md:1121), but GoalCommandRequestApplicationLegacyV1 is additionalProperties false with no source field (Plans/application_workflow_contracts.schema.json), and its context, a WorkflowCommandContextV1, is additionalProperties false with none either (Plans/shared_integration_runtime.schema.json). GoalStartRequestV2 has no source field either; its source_surface is the goal-surface namespace, not this activation enum. Canon does not say whether the handler records the activation surface elsewhere."
    - command_id: cmd.chat.goal.update
      ucc_units: [UCC-096]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: false
          default: none
          required_when: {field: schema_id, in: [pm.goal.update.request.v2]}
          forbidden_when: {field: schema_id, in: [pm.goal.command_request.application.v2]}
          provenance: canon
          source: "Plans/goal_runtime_contracts.schema.json $defs/GoalUpdateRequestV2 requires project_id (string 1..256) on the Project edition. Every Goal request carries explicit app/Project scope with project_id null for app (Goal_Runtime_System.md:264); the application edition GoalCommandRequestApplicationV2 has no project_id field and carries its null Project as context.scope.project_id (Plans/application_workflow_contracts.schema.json:16884; Plans/shared_integration_runtime.schema.json:2905). UCC-230 envelope common optional project_id keeps its canonical type and is not nullable, so an application dispatch leaves it out"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires thread_id (string 1..256); the application edition carries it as context.thread_id (WorkflowCommandContextV1, string 1..256), the app thread an application Goal is born in (Goal_Runtime_System.md:8213); UCC-230 envelope common optional thread_id restated required"
        goal_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires goal_id (string minLength 1) and GoalCommandRequestApplicationV2 requires goal_id (string 1..256); overlay row group UCC-096..UCC-100 optional identity goal_id; canon makes the goal mandatory for an update (Goal_Runtime_System.md:255)"
        expected_revision:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "GoalUpdateRequestV2 expected_revision integer minimum 1; GoalCommandRequestApplicationV2 requires expected_revision (integer, minimum 0); Goal_Runtime_System.md:255 requires the expected revision"
        expected_currentness_hash:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 and GoalCommandRequestApplicationV2 both require expected_currentness_hash, pattern ^[0-9a-f]{64}$; Goal_Runtime_System.md:255 requires the currentness hash"
        permission_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires permission_snapshot_ref (string 1..256); every Goal request carries a permission snapshot (Goal_Runtime_System.md:264), which the application edition carries as context.permission_evidence (WorkflowCommandContextV1)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "GoalUpdateRequestV2 requires idempotency_key (string 1..256) and the application edition requires context.idempotency_key (WorkflowCommandContextV1, string 1..256); UCC-230 envelope common optional idempotency_key (string max_length 256) restated required"
        return_route_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires return_route_ref (string 1..256); every Goal request carries a return route (Goal_Runtime_System.md:264), which the application edition carries as context.return_context_ref (WorkflowCommandContextV1)"
        objective_text:
          type: string
          required: true
          default: none
          constraints: {max_length: 4000, pattern: '^[^\ud800-\udfff]*$'}
          provenance: canon
          source: "GoalUpdateRequestV2 and GoalCommandRequestApplicationV2 both require objective_text (string maxLength 4000, pattern excludes surrogate code points)"
        change_source:
          type: enum
          values: [user_direct, agent_proposed_user_approved]
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 and GoalCommandRequestApplicationV2 share the change_source enum; a user-authored edit or a resolved approval (Goal_Runtime_System.md:255)"
        source_message_id:
          type: id
          required: true
          default: none
          nullable: true
          provenance: canon
          source: "GoalUpdateRequestV2 requires source_message_id, anyOf string minLength 1 or null, and GoalCommandRequestApplicationV2 the same with maxLength 256; on both editions allOf if/then makes it null when change_source is user_direct and a non-empty string when it is agent_proposed_user_approved (Plans/goal_runtime_contracts.schema.json; Plans/application_workflow_contracts.schema.json:16884)"
        approval_id:
          type: id
          required: true
          default: none
          nullable: true
          provenance: canon
          source: "GoalUpdateRequestV2 requires approval_id, anyOf string minLength 1 or null, and GoalCommandRequestApplicationV2 the same with maxLength 256; on both editions allOf if/then makes it null when change_source is user_direct and a non-empty resolved approval when it is agent_proposed_user_approved (Plans/goal_runtime_contracts.schema.json; Plans/application_workflow_contracts.schema.json:16884); precondition goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted) (UI_Command_Catalog.md:15483)"
        schema_id:
          type: enum
          values: [pm.goal.update.request.v2, pm.goal.command_request.application.v2]
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires schema_id const pm.goal.update.request.v2 (Plans/goal_runtime_contracts.schema.json), the Project edition the 2.7.1 row gives as this command's payload (UI_Command_Catalog.md:1122); GoalCommandRequestApplicationV2, the cmd.chat.goal.update branch of the application input root GoalCommandRequestApplicationV1 (Plans/application_workflow_contracts.schema.json:9012), requires schema_id const pm.goal.command_request.application.v2 (Plans/application_workflow_contracts.schema.json:16884); app siblings have distinct schema IDs (Goal_Runtime_System.md:8222-8223)"
        schema_version:
          type: const
          value: "2.0.0"
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 and GoalCommandRequestApplicationV2 both require schema_version const 2.0.0 (Plans/goal_runtime_contracts.schema.json; Plans/application_workflow_contracts.schema.json:16884); payload per UI_Command_Catalog.md:1122"
        command_instance_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires command_instance_id (string 1..256, Plans/goal_runtime_contracts.schema.json) and the application edition requires context.command_instance_id (WorkflowCommandContextV1, string 1..256); payload per UI_Command_Catalog.md:1122. command_id and actor_ref of either edition come from the UICommand envelope (UCC-230 envelope required_not_restated)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: owner_request
          choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
          gap_note: "Canon layers two requests, and the owner input has one edition per scope. The production wiring row (Wiring_Matrix.production.json entries.catalog.chat_goal_update request_schema_ref) names application_workflow_contracts ChatOwnerCommandRequestV2, whose scope is a WorkflowScopeV2 of either scope kind. For a Project thread the owner input is goal_runtime_contracts GoalUpdateRequestV2 -> GoalUpdateResultV2, which the Simplified Goal Runtime registration row (UI_Command_Catalog.md:15483, command_kind domain_action), the 2.7.1 row (UI_Command_Catalog.md:1122), Goal_Runtime_System.md:262 and Plans/Commands_System.md:6403 name. For an app thread with project_id=null it is the application edition GRS-086 admits (Goal_Runtime_System.md:8213; its acceptance requires app direct Save and approved proposal with null Project, :8247-8248): CV-366 selects the app.goal_update.v1 graph, scope_kind application, with input root GoalCommandRequestApplicationV1 -> GoalCommandResultApplicationV1 through owner.goal.body.mutation.application@1.0.0 (Goal_Runtime_System.md:8230-8233; Plans/Contracts_V0.md:24281; Plans/application_workflow_source_graph.json:1197), and that root's cmd.chat.goal.update branch is GoalCommandRequestApplicationV2 (Plans/application_workflow_contracts.schema.json:16884). The registration row, the 2.7.1 row, Goal_Runtime_System.md:262 and Plans/Commands_System.md:6403 name only the Project edition, and no catalog or wiring row names the application one, so the catalog and wiring rows do not carry GRS-086 and CV-366's application update. The definition follows the wiring row for both scopes and takes each owner input from its owner; it does not settle the catalog rows. ChatOwnerCommandRequestV2's owner_input_schema_ref, owner_input_ref and owner_input_sha256 can name that body, though canon does not say so in words."
        - key: owner_result
          choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
          gap_note: "The wiring row's result_schema_ref is ChatOwnerCommandResultV2. For the Project edition the registration row and Plans/Commands_System.md:6403 name GoalUpdateResultV2, the body transaction that returns revision n+1 atomically under GRS-068 and SP-299 (Goal_Runtime_System.md:255); for the application edition CV-366's app.goal_update.v1 graph returns GoalCommandResultApplicationV1 (Plans/Contracts_V0.md:24281), which no catalog row names. The definition follows the wiring row; canon does not state that its owner_result_ref names the selected edition's body result."
        - key: disabled_reason_codes
          choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
          gap_note: "No registration table states disabled reasons for this row; chosen from the closed set over the catalog preconditions goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted) (UI_Command_Catalog.md:15483): no goal or no approved change maps to blocked_state_required, a stale expected revision or currentness hash to stale_projection, and runtime availability to not_configured, unreachable or degraded."
        - key: field:schema_id
          choice: "both edition markers; the handler accepts only the one that matches the thread's and Goal's actual scope, so project_id is required with pm.goal.update.request.v2 and forbidden with pm.goal.command_request.application.v2"
          gap_note: "Canon gives the update one edition per scope: the Project edition GoalUpdateRequestV2 and its codecs and hashes stay exact, and GRS-086 adds the application edition for an app thread with project_id=null, with a distinct schema ID and hash domain, never null coerced into a Project string (Goal_Runtime_System.md:264, :8213, :8222-8223). Canon does not say how a UICommand dispatch names its edition; the definition uses each edition's own schema_id. A Project-edition dispatch for an app thread or Goal would rebind a null Project to a Project, which GRS-086 refuses (Goal_Runtime_System.md:8249-8250), and an application-edition dispatch for a Project thread would carry a Project Goal in the application graph, whose scope_kind is application (Plans/application_workflow_source_graph.json:1198) and whose Goal record's project_id is const null (Plans/application_workflow_contracts.schema.json:2960-2961). Canon names no closed code for either refusal; the definition uses invalid_args, and the handler builds no Project identity for an app Goal. The application edition stays unavailable until its durable materialization and native source/read/backup proof exist (Goal_Runtime_System.md:8236-8237); until then the handler refuses it with handler_unavailable."
        - key: field:expected_revision
          choice: "minimum 1 on both editions"
          gap_note: "GoalUpdateRequestV2 types expected_revision with minimum 1 and GoalCommandRequestApplicationV2 with minimum 0 (Plans/application_workflow_contracts.schema.json:16884). A start returns revision 1 (Goal_Runtime_System.md:254) and an application Goal record's revision has minimum 1 (Plans/application_workflow_contracts.schema.json:2971-2973), so the definition keeps minimum 1; canon does not say that an application update can never expect revision 0."
        - key: omitted:source_surface
          choice: "left out of args; on the Project edition the handler writes the owner request's source_surface"
          gap_note: "GoalUpdateRequestV2 requires its own source_surface (string minLength 1; its $comment calls it routing lineage only, Plans/goal_runtime_contracts.schema.json). It is the owner request's Goal field, not the UICommand envelope source_surface: on GoalStartRequestV2 the same field is the separate goal-surface namespace (agent_runtime, approved_agent_proposal, goal_activity, goal_activity_editor, goal_control, goal_hover, natural_language, slash, wand; its $comment: not the generic UI source_surface). UCC-230 forbids restating the envelope name as an arg, and canon does not say how the handler derives the Goal value from the dispatch. GoalCommandRequestApplicationV2 has no source_surface."
        - key: omitted:context
          choice: "left out of args; for the application edition the handler builds the WorkflowCommandContextV1 with an application scope and null Project, thread_id, command_instance_id and idempotency_key from the args, permission_evidence resolved from permission_snapshot_ref and return_context_ref derived from return_route_ref; the Project edition has no context"
          gap_note: "GoalCommandRequestApplicationV2 requires context, a WorkflowCommandContextV1 (Plans/shared_integration_runtime.schema.json: scope, storage_instance_id, thread_id, execution_host_id, execution_environment_id, roots, command_instance_id, idempotency_key, actor_ref, permission_evidence, writer_evidence, scope_stop_epoch, task_stop_epoch, expected_generation, return_context_ref), and GRS-086 keeps scope and Server metadata in the wrapper, not in Goal body fields (Goal_Runtime_System.md:8216). Canon does not say how the handler fills storage_instance_id, the execution host and environment, roots, writer_evidence, the stop epochs or expected_generation, nor that the arg values map onto the context fields. actor_ref is UCC-230 required_not_restated."
        - key: omitted:original_operation_ref
          choice: "left out of args; on the application edition the handler supplies it"
          gap_note: "GoalCommandRequestApplicationV2 requires original_operation_ref, string 1..256 or null (Plans/application_workflow_contracts.schema.json:16884); GoalUpdateRequestV2 has no such field, and canon does not say what an update writes there."
        - key: omitted:scope
          choice: "left out of args; the handler builds the WorkflowScopeV2 of the thread's actual scope, never a Project for an app thread"
          gap_note: "ChatOwnerCommandRequestV2 requires scope (WorkflowScopeV2, Plans/application_workflow_contracts.schema.json). WorkflowScopeV2 fixes an application scope's project_id, project_home_server_id and named_plan_id as null and its scope_partition as app, and gives a Project scope a project_id, a project_home_server_id and a project~ scope_partition (Plans/shared_integration_runtime.schema.json:2905). Canon does not say how the handler fills server_id, or for a Project thread project_home_server_id and scope_partition, from the dispatch."
        - key: omitted:initiating_client_id
          choice: "left out of args; the handler supplies the initiating client"
          gap_note: "ChatOwnerCommandRequestV2 requires initiating_client_id (string 1..256); canon does not say whether the UI or the handler supplies it."
        - key: omitted:owner_input_schema_ref
          choice: "left out of args; the handler names the selected edition: GoalUpdateRequestV2 for pm.goal.update.request.v2, GoalCommandRequestApplicationV1 for pm.goal.command_request.application.v2"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_schema_ref (string 1..256); canon does not state its value, though the registration row names GoalUpdateRequestV2 (UI_Command_Catalog.md:15483) and the app.goal_update.v1 graph's input root is GoalCommandRequestApplicationV1 (Plans/Contracts_V0.md:24281)."
        - key: omitted:owner_input_ref
          choice: "left out of args; the handler stores the selected edition's owner input built from these args and refers to it"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_ref (string 1..256); canon does not say who stores the owner input or mints the ref."
        - key: omitted:owner_input_sha256
          choice: "left out of args; the handler hashes the stored owner input in its own edition's hash domain"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_sha256 (sha256 hex); canon does not say who computes it. The Project codecs and hashes stay exact and the application sibling keeps its own hash domain (Goal_Runtime_System.md:8222-8223)."
        - key: omitted:expected_owner_revision
          choice: "left out of args; the handler copies expected_revision"
          gap_note: "ChatOwnerCommandRequestV2 requires expected_owner_revision (integer minimum 0); canon does not state that it equals the Goal expected_revision arg."
        - key: omitted:permission_evidence
          choice: "left out of args; the handler resolves it from permission_snapshot_ref"
          gap_note: "ChatOwnerCommandRequestV2 requires permission_evidence (OwnerEvidenceRefV1, Plans/shared_integration_runtime.schema.json); canon does not say how it is derived from the permission_snapshot_ref arg."
        - key: omitted:scope_stop_epoch
          choice: "left out of args; the handler reads the current scope stop epoch"
          gap_note: "ChatOwnerCommandRequestV2 requires scope_stop_epoch (integer minimum 0); canon does not say who supplies it."
        - key: omitted:return_context_ref
          choice: "left out of args; the handler derives it from return_route_ref"
          gap_note: "ChatOwnerCommandRequestV2 requires return_context_ref (string 1..256); canon does not state its relation to the GoalUpdateRequestV2 return_route_ref arg."
```

### GRS-203 - Current Project goal.blocked successor

```yaml
plan_unit_id: GRS-203
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored Project goal.blocked v3 contract preserves GRS-048/050 and GREPLAY-004..010, uses
  only the shared body metadata CAS, and refuses unbound host-source and lifecycle edges. GRS-1120/CV-1120/SP-1120
  supply the newly authored original host source and result bank; installation and exact v3 registry selection remain
  separately required, with native execution NOT_RUN.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-050
- GRS-064
- DL-045
unblocks: []
acceptance_criteria:
- Exact original host, body/currentness/epoch and caller evidence precede the lifecycle metadata commit.
- Retained whole-v2 interpretation is unchanged; native activation waits for actual whole-bank source installation and exact v3 selector adoption.
- No event, model claim or helper witness can bypass Stop, cancellation or the complete shared body fence.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_blocked.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm_goal_own_b_oracles.py
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-203_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Newly authored owner contract under DL-045; prepared Project successor, no admission (2026-11-04).** This unit applies only to `goal.blocked` and `pm.goal_runtime_event.goal_blocked.schema.v3`. The existing whole `goal_blocked.schema.json` v2 resource, original envelope/identity, D-R01 predicates and legacy v1 reader retain their historical meaning. There is no v2-to-v3 cast and no app adoption; the unused app sibling remains governed by CV-366 until its separate owner adoption. Current Project selection (2026-11-19): Plans/event_family_registry.json selects pm.goal_runtime_event.goal_blocked.schema.v3 under Plans/Decision_Log.md#DL-2435. The former v2 selector is retained history, alongside the existing v1 reader; neither historical meaning is cast to v3. This Project revision does not adopt the dormant application sibling or certify native installation.

**Per-family current-source search.** At base `0c40a7809826bcf509bbb16483bbdd8f4c48760b`, searched every live top-level `Plans/*.md`, `Plans/*.json`, event payloads, Goal body/source schemas, all Goal named bindings and the admission-record directory for `goal.blocked`. Found the required Goal V2 name, its old D-R row and schema, GRS-048/050, GREPLAY-004..010, GRS-064/SP-287 sole body custody and dormant CV-366 app selector. Found no current V2-compatible family producer, original host-source edition, family observation binding or v3 identity. The old generic v2 recipe cannot supply current source authority. These technical bindings are authored here for this exact family; no sibling binding is inferred.

**Envelope and lifecycle custody.** Adopt `Plans/Contracts_V0.md#EventRecord` pm.event.v0@2.0.0 and CV-422, not a local envelope. Explicit Project/thread/Goal/Storage identity must match the actual canonical body and original host caller. Outer event_type is `goal.blocked`, payload_schema_id is `pm.goal_runtime_event.goal_blocked.schema.v3`, Project and thread equal payload values, run_id equals the owning continuation run, and actor/correlation/causation/account facts come from that original caller. No focus/main/null-Project fallback. The immutable event has no objective text, retired Goal topology or provider/tool output. Raw secrets reject before reservation/append. The body remains exactly GRS-048's four states active|paused|blocked|completed, with cancellation outside the enum.

**Sole writer, ordering and fences.** The host-only semantic producer `owner.goal.lifecycle.blocked.v1` uses only `owner.goal.body.mutation@1.0.0` under GRS-064/SP-287. It admits a metadata_update, never an objective write: increment the one ordinary revision by exactly one, preserve objective/accepted-head/history/origin bytes, identity, created_at and active_run_ref unless its separate association owner supplies an admitted mutation. Authenticate exact prior body/control/currentness/accepted head, native host owner and permissions, cancellation/Stop/continuation epochs, caller/run identity and current Storage writer/maintenance/deletion/hold state. Capture every original input independently before helpers. Reserve the complete original metadata intent and genuine external authority under the shared body/control CAS; before terminal commit compare the whole actual reserved preimage and all original/current owner predicates after the final helper, with no helper between the pure predicate and commit.

The family protocol orders original host decision and original caller evidence, original producer custody/reservation, narrow atomic body/control/receipt commit, frozen EventRecord input, SP-286 first AppendReceipt, then terminal producer publication. Before body commit, a proven no-effect outcome produces no event or success; after a body commit, event failure cannot undo or repeat it and must preserve the original pending producer operation until exact append/receipt resolution. Unknown is fenced, never converted to no-effect by timeout or absence. The standalone shared body receipt proves only its body effect. A terminal producer publication requires the exact retained body receipt and original event's first SP-286 receipt/full-value commitment; an event observation does not alone publish success or allow another continuation. **Prepared original source:** GRS-1120/CV-1120/SP-1120 now define this family's original source, methods, backup and result resolver. Native reserve/append stays refused until the whole bank is actually installed and this exact v3 selector separately admitted.

Continuation operation identity preserves GRS-050's tuple `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`; completion has no new next dispatch. Capture its original nullable next_attempt_ref exactly. Rechecking an already accepted tuple resolves the immutable original effect/result, rather than creating a new lifecycle revision. Stop/Pause/Cancel, objective/bound-Plan revision and run replacement fence the appropriate epochs under GREPLAY-009..010; a stale epoch is never refreshed into success. An owner outage, missing source, unresolved receipt, required-work barrier or unknown recovery fact is unavailable/fenced, never completion or permission to resume.
**Exact blocked predicates and bounded edges.** GRS-048 defines blocked as an owner-supplied condition preventing safe progress and requires blocked_reason_ref. GRS-050's host continuation result must be blocked, its nonnull reason must resolve to that exact original caller's condition/currentness, and the same reason is committed into GoalRecordV2 and the payload. The ordinary active -> blocked edge is bound here. blocked -> blocked may commit only a new ordinary revision with changed original blocker evidence/reason; an equal continuation identity returns its original result, with no new revision. This event does not clear Stop or dispatch any allowed action. A completed source refuses. **Unbound individual edge:** paused -> blocked while a manual Stop latch is held lacks an owner contract reconciling that authoritative pause with a new continuation evaluation; it remains refused. Clearing a blocked condition, resume and any required named event retain their own independent admission; this event grants none. Old D-R01 action sets/recovery choices do not become new Goal fields. Their actual permission/recovery owners remain authoritative; unknown recovery truth never becomes completed.

### GRS-204 - Current Project goal.completed successor

```yaml
plan_unit_id: GRS-204
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored Project goal.completed v3 contract preserves GRS-048/050 and GREPLAY-004..010, uses
  only the shared body metadata CAS, and refuses unbound host-source and lifecycle edges. GRS-1121/CV-1121/SP-1121
  supply the ordinary source bank; GRS-1122/CV-1122/SP-1122 independently supply DL-081 exception completion. Native
  installation and exact v3 registry selection remain separately required.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-050
- GRS-064
- DL-045
unblocks: []
acceptance_criteria:
- Exact original host, body/currentness/epoch and caller evidence precede the lifecycle metadata commit.
- Retained whole-v2 interpretation is unchanged; native activation waits for actual whole-bank source installation and exact v3 selector adoption.
- No event, model claim or helper witness can bypass Stop, cancellation or the complete shared body fence.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_completed.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm_goal_own_b_oracles.py
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-204_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Newly authored owner contract under DL-045; prepared Project successor, no admission (2026-11-04).** This unit applies only to `goal.completed` and `pm.goal_runtime_event.goal_completed.schema.v3`. The existing whole `goal_completed.schema.json` v2 resource, original envelope/identity, D-R04 predicates and legacy v1 reader retain their historical meaning. There is no v2-to-v3 cast and no app adoption; the unused app sibling remains governed by CV-366 until its separate owner adoption. Current Project selection (2026-11-19): Plans/event_family_registry.json selects pm.goal_runtime_event.goal_completed.schema.v3 under Plans/Decision_Log.md#DL-2436. The former v2 selector is retained history, alongside the existing v1 reader; neither historical meaning is cast to v3. This Project revision does not adopt the dormant application sibling or certify native installation.

**Per-family current-source search.** At base `0c40a7809826bcf509bbb16483bbdd8f4c48760b`, searched every live top-level `Plans/*.md`, `Plans/*.json`, event payloads, Goal body/source schemas, all Goal named bindings and the admission-record directory for `goal.completed`. Found the required Goal V2 name, its old D-R row and schema, GRS-048/050, GREPLAY-004..010, GRS-064/SP-287 sole body custody and dormant CV-366 app selector. Found no current V2-compatible family producer, original host-source edition, family observation binding or v3 identity. The old generic v2 recipe cannot supply current source authority. These technical bindings are authored here for this exact family; no sibling binding is inferred.

**Envelope and lifecycle custody.** Adopt `Plans/Contracts_V0.md#EventRecord` pm.event.v0@2.0.0 and CV-423, not a local envelope. Explicit Project/thread/Goal/Storage identity must match the actual canonical body and original host caller. Outer event_type is `goal.completed`, payload_schema_id is `pm.goal_runtime_event.goal_completed.schema.v3`, Project and thread equal payload values, run_id equals the owning continuation run, and actor/correlation/causation/account facts come from that original caller. No focus/main/null-Project fallback. The immutable event has no objective text, retired Goal topology or provider/tool output. Raw secrets reject before reservation/append. The body remains exactly GRS-048's four states active|paused|blocked|completed, with cancellation outside the enum.

**Sole writer, ordering and fences.** The host-only semantic producer `owner.goal.lifecycle.completed.v1` uses only `owner.goal.body.mutation@1.0.0` under GRS-064/SP-287. It admits a metadata_update, never an objective write: increment the one ordinary revision by exactly one, preserve objective/accepted-head/history/origin bytes, identity, created_at and active_run_ref unless its separate association owner supplies an admitted mutation. Authenticate exact prior body/control/currentness/accepted head, native host owner and permissions, cancellation/Stop/continuation epochs, caller/run identity and current Storage writer/maintenance/deletion/hold state. Capture every original input independently before helpers. Reserve the complete original metadata intent and genuine external authority under the shared body/control CAS; before terminal commit compare the whole actual reserved preimage and all original/current owner predicates after the final helper, with no helper between the pure predicate and commit.

The family protocol orders original host decision and original caller evidence, original producer custody/reservation, narrow atomic body/control/receipt commit, frozen EventRecord input, SP-286 first AppendReceipt, then terminal producer publication. Before body commit, a proven no-effect outcome produces no event or success; after a body commit, event failure cannot undo or repeat it and must preserve the original pending producer operation until exact append/receipt resolution. Unknown is fenced, never converted to no-effect by timeout or absence. The standalone shared body receipt proves only its body effect. A terminal producer publication requires the exact retained body receipt and original event's first SP-286 receipt/full-value commitment; an event observation does not alone publish success or allow another continuation. **Prepared original source:** GRS-1121/CV-1121/SP-1121 now define this family's ordinary source, methods, backup and result resolver. Native reserve/append stays refused until the whole bank is actually installed and this exact v3 selector separately admitted.

Continuation operation identity preserves GRS-050's tuple `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`; completion has no new next dispatch. Capture its original nullable next_attempt_ref exactly. Rechecking an already accepted tuple resolves the immutable original effect/result, rather than creating a new lifecycle revision. Stop/Pause/Cancel, objective/bound-Plan revision and run replacement fence the appropriate epochs under GREPLAY-009..010; a stale epoch is never refreshed into success. An owner outage, missing source, unresolved receipt, required-work barrier or unknown recovery fact is unavailable/fenced, never completion or permission to resume.
**Exact ordinary completion predicates and bounded edges.** The host alone decides complete from an original GRS-050 continuation evaluation with nonempty owning-caller completion_evidence_refs, not a model final message, provider final, body receipt, event or generic accepted marker. At the final body boundary, reload exact canonical Goal/currentness/Stop epoch and adopt GREPLAY-004..008 by name: (1) every required current To-Do in the exact current list identity/revision is resolved, with a skipped item requiring an explicit accepted skip disposition; a removed historical item cannot satisfy it; (2) no admitted tool/background subagent/work, bound PlanRun or recovery-required/unresolved work remains; (3) an internal workflow predicate is met by reference to that actual owner and current source identity, without copying phases or criteria into Goal state. The ordinary bound edge is active -> completed after all these predicates. The committed body clears blocked_reason_ref. Repeated original continuation identity returns the original effect/result. A completed source accepts no new transition. **Unbound individual edges:** completion directly from paused under a manual Stop, or from blocked without a separately admitted resolution/current continuation evaluation, is refused until its owner binding is explicit. Neither current evidence alone nor a late callback bypasses Stop, body CAS or those barriers.

**Separate DL-081 route.** GRS-1122/EP-1120/HITL-1120/PS-1120/SIR-1120/CV-1122/SP-1122 define the approved-exception route and original result mapping. Ordinary completion still cannot consume certified_with_approved_exception, completed_with_approved_verification_exception or an incomplete-item disposition as clean proof. Exception use requires its actual distinct source installation and separate event selector adoption; no new product decision or Standard-writer expansion follows.

### GRS-205 - Historical-only goal.evidence_captured in both scopes

```yaml
plan_unit_id: GRS-205
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.evidence_captured writer in both scopes before dedupe;
  retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_evidence_captured_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-205_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.evidence_captured` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R07/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.evidence_captured` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

Goal evidence collection moved to the actual Workflow/run evidence owner; GoalRecordV2 carries no evidence ledger. Preserve original evidence_kind/source_spans/content_hash/currentness/redaction and optional snapshot/retention refs. Non-validator spans, artifact snapshots, outer/inner redaction equality, provenance/hash/span bounds, original source/permission and nonterminal-state preservation are required. Unknown currentness cannot satisfy verification or completion.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_evidence_captured.schema.v2` at `Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-431 owns the sole exact historical reader `storage.goal_evidence_captured_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-424 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.evidence_captured`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.

### GRS-206 - Historical-only goal.receipt_recorded in both scopes

```yaml
plan_unit_id: GRS-206
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.receipt_recorded writer in both scopes before dedupe;
  retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_receipt_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-206_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.receipt_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R09/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.receipt_recorded` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

The actual Workflow/run owns certification and receipts; Goal V2 has no certification tier, child receipt graph or receipt-driven state. Preserve original receipt/kind/tier/output/dependency refs and original certifier decision. Require pre-existing valid original receipt, exact dependency completeness, original exception approval/residual-risk evidence and rejection/block reason evidence. The original running|verifying|repairing|degraded|blocked state is preserved; terminal/created/scheduled/paused/stopped originals reject. Recording receipt history never completes a current Goal.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` at `Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-432 owns the sole exact historical reader `storage.goal_receipt_recorded_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-425 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.receipt_recorded`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.

### GRS-207 - Historical-only goal.tool_check_recorded in both scopes

```yaml
plan_unit_id: GRS-207
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.tool_check_recorded writer in both scopes before
  dedupe; retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_tool_check_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-207_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.tool_check_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R13/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.tool_check_recorded` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

The executing Workflow/run owns tool checks and evidence; Permissions owns policy/approval resolution. Goal V2 has no tool-check loop or Goal-owned worker authority. Preserve tool_call_id/name/check_kind/result/policy_decision and original output/log refs. Passed+allow/not_applicable needs an original output/log; failed/blocked/unknown needs an original log; approval_required needs original common approval/block proof and cannot pass; deny cannot pass. All output stays by reference with original secret handling. Preserve scheduled|running|verifying|repairing|degraded|blocked; any state change was a separately named event.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` at `Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-433 owns the sole exact historical reader `storage.goal_tool_check_recorded_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-426 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.tool_check_recorded`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.

### GRS-1110 - Fresh-birth stop/block mapping and passive history

```yaml
plan_unit_id: GRS-1110
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored DL-045 owner contract. GRS-200 independently adopts EP-1111/SP-1110 for goal_run.stopped;
  GRS-201 independently adopts EP-1112/SP-1111 for goal_run.blocked. GRS-202 adopts EP-1110 qualifying fresh
  birth and the concrete SP-1112/SB5 consumer/checkpoint profile. For GRS-085 fresh-birth mapping only, the
  full original started/positive-D06-cancelled/clean-certified branch arguments and all original source predicates
  are explicitly rebound to the fresh source edition through resource-map.json, its seven consumer realms in
  consumer-resource-bank.json and the typed methods.json consumer methods (amended 2026-11-14, PNC-019 lane s3d,
  DG-OWN-A review F9); historical v7/native generations
  retain GRS-085 unchanged. Stop and block events preserve Goal objective/revision/four-state lifecycle and
  never grant a resume, Replan, action or certification. Every source transition uses actual D01/native revision,
  exact cause/settlement and first receipt; readers independently resolve original source and current disclosure
  fences before and after helpers. A row's expected revision follows GRS-202's revision relation over the
  D01-authenticated native chronology. The distinct application edition of goal_run.stopped that DL-448 approves
  is prepared and admitted at its own registry checkpoint; this unit authors none of it. Application goal_run.blocked
  remains dormant.
gui_related: false
gui_classification_reason: Defines original event/source/custody and passive projection contracts without a
  visual surface.
split_recommended: false
depends_on:
- GRS-085
- GRS-200
- GRS-201
- GRS-202
- EP-1110
- EP-1111
- EP-1112
- SP-1112
unblocks: []
acceptance_criteria:
- Fresh mapping never enrolls an old birth or upgrades an old generation.
- Each stop/block original source joins unchanged Goal context and advancing native revision field by field.
- Historical lawful originals survive current live-state/writer changes; current views require exact complete
  frontier and native/Goal graph.
validation_surfaces:
- Plans/goal_run_stop_block_contracts/protocol.md
- Plans/goal_run_stop_block_contracts/contracts.schema.json
- python3 scripts/pm_goal_own_a_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: original_stop_block_source_custody_and_publication
reasoning_tier: high
context_scope: event_authority_dg_own_a_20261105
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_run_stop_block_contracts/
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-080
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No application stopped edition, old-birth enrollment, registry/admission/Decision Log change or retention
  policy.
- No native installation/execution, runtime/readiness, WorkNode, NodeSeed or governance qualification.
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/Goal_Runtime_System.md#GRS-200, ContractName:Plans/Goal_Runtime_System.md#GRS-201, ContractName:Plans/Goal_Runtime_System.md#GRS-202, ContractName:Plans/Executor_Protocol.md#EP-1110, ContractName:Plans/Executor_Protocol.md#EP-1111, ContractName:Plans/Executor_Protocol.md#EP-1112, ContractName:Plans/storage-plan.md#SP-1112

### GRS-1120 - Original blocked host decision and pending result

```yaml
plan_unit_id: GRS-1120
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly goal.blocked, Project scope, prepared without
  admission. GRS-203 adopts owner.goal.lifecycle.blocked.v1@1.0.0, source edition pm.goal.host.blocked_source.v1
  and method bank Plans/goal_lifecycle_host_contracts/methods.json#/goal.blocked. Its capture, reserve, commit_body,
  freeze_event, append, resolve, publish and inspect methods are individually closed; no method dispatches a continuation.
  This source is not a Workflow all-writers edition and installs nothing on an old birth.


  Search at cfb7e550746c08a989bb41583286d72acc47e68d covered all live top-level Plans Markdown/JSON, Goal payload/source/custody/resource
  banks and admission records for goal.blocked, host.goal.continuation and original lifecycle pending/result. GRS-048/050/064/203,
  GREPLAY-004..010, SP-287/429 and CV-422 define body and order, but no complete original host decision plus body-to-event
  result bank. Reuse the sole body writer and SP-286 rather than infer the completed sibling. The lane report records
  exact search captures and current-main premise comparisons.


  The native host authenticates the actual original owning caller, Project/thread/Goal/Storage, continuation_id,
  owning_run_id, next_attempt_ref, caller source ref/revision and origin, actor/account/correlation/causation, accepted
  head/history, whole body/control preimage and Stop/owner/continuation epochs. Independently resolve the caller''s
  blocked result and reason/evidence against that source and revision. Reason and evidence must refer to this exact
  caller''s condition. Bind permission, cancellation_pending/receipt, manual Stop, writer lease, maintenance/root
  generation, deletion/hold/secret fences. Store original source identities, versions, hashes and resolved decision;
  caller booleans are not authentication. Source and method resource selection is installed out of band, never chosen
  by a request''s admitted flag.


  Only active -> blocked or blocked -> blocked with changed original blocker evidence/reason is admitted. Equal
  continuation tuple returns the immutable original operation even after the live Goal advances. paused under Stop,
  completed, unknown recovery or an unresolved new evaluation refuses; it never clears Stop or authorizes resume.
  Capture a source decision and reservation, then use only owner.goal.body.mutation@1.0.0 metadata_update. The exact
  whole control CAS includes cancellation_pending and accepted head, increments the single ordinary revision by
  one, preserves objective bytes, origin, history, created_at and active_run_ref, and sets blocked_reason_ref. Original
  body intent hash uses the shared recipe, not an event-derived body. Revalidate all captured actual owners after
  the last helper immediately before the narrow body/control/receipt transaction, with no subsequent helper.


  Commit the lifecycle pending phase atomically with that body/control/receipt transaction in the same admitted
  Storage store; a lost acknowledgment is resolved by the retained operation receipt, never by another CAS. Freeze
  EventRecord pm.event.v0@2.0.0 and exactly CV-422''s v3 payload after that genuine body receipt. SP-429 supplies
  the unchanged identity. Resolve receipt bytes independently through the SP-287 operation key, compare all fields
  and their digest, then append through the actual exact selector. SP-286 first eleven-field receipt and full-value
  v2 commitment must independently resolve and match the entire frozen producer input before terminal publication.
  A plausible supplied hash, event or body receipt alone is insufficient.


  Phases are reserved, body_committed, event_pending, event_committed, published; terminal no_effect is allowed
  only with positive no-body-effect proof; terminal unknown is immutable and confers no completion. A transient
  unavailable resolve remains pending. Post-body/pre-event failure preserves revision and original intent, never
  rolls back, repeats body mutation or invents a no-effect result. Recovery reuses the exact frozen event; missing
  original receipt, incompatible source edition or unknown custody fences the operation. Later Stop or withdrawal
  prevents new work, while exact audit/reconciliation preserves already committed effects without granting any new
  dispatch. Final publication compares original decision, source edition, body receipt, first receipt/full event
  and terminal result after the final resolver helper. SP-1120 owns physical/read/restore custody; ATS-1113 owns
  separate entry/helper/final oracles. Native execution remains NOT_RUN.


  The native commit_body method holds the actual source owners'' read/currentness permits and the shared body/control
  writer fence through one serializable commit of body, control, receipt and the selected lifecycle pending phase.
  Validate the exact captured read set inside that admitted boundary, including caller, permission/Stop, ToDoController
  and its complete required-item selection, admitted work, bound Plan, recovery and internal owner where this route
  requires them. Every actual participant writer must obey that same owner fence/epoch protocol before this source
  edition is installed. An unlocked check followed by a write is forbidden; missing participant support is unavailable,
  not an all-true admission descriptor. The permits are native owner capabilities resolved by this method from the
  original source_ref, never caller-supplied permission booleans. This binding changes no To-Do writer, record or
  five-status enum.'
gui_related: false
gui_classification_reason: Original lifecycle source, receipt custody and protocol predicates.
depends_on:
- GRS-203
- GRS-064
- SP-287
- DL-045
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```

### GRS-1121 - Original ordinary completion host decision and pending result

```yaml
plan_unit_id: GRS-1121
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly ordinary goal.completed, Project scope,
  prepared without admission. GRS-204 adopts owner.goal.lifecycle.completed.v1@1.0.0, pm.goal.host.completed_source.v1
  and Plans/goal_lifecycle_host_contracts/methods.json#/goal.completed. This family independently adopts the full
  SP-287 body transaction and SP-286 first receipt/full-value v2 resolution. It is not authorized by the blocked
  source or a Standard certification event.


  Search at cfb7e550746c08a989bb41583286d72acc47e68d across live Plans top-level prose/JSON, Goal schemas, source/method
  banks and admissions found GRS-048/050/064/204, GREPLAY-004..010, SP-287/430 and CV-423, but no complete original
  host source/pending/result resolver. Existing body, continuation and receipt owners are reused. Search evidence
  and current-main premise comparison are in DG-OWN-B''s report; these bindings are newly authored rather than discovered
  installations.


  Authenticate the actual host continuation and owning caller at its exact Project/thread/Goal/run/Storage/source
  revision, original nonempty completion_evidence_refs, complete body/control/currentness/accepted head/history
  and Stop/owner/continuation epochs. Evidence resolves under that caller, original revision and target. Capture
  actual independently enumerated current To-Do list identity/revision and every item, complete admitted tool/background/subagent
  work set, bound PlanRun and recovery owner, plus an internal Workflow''s own current completion predicate when
  applicable. A caller-supplied smaller set or an empty response from an unavailable owner never establishes completeness.
  ToDo_Runtime.md TDR-004/005 owns the exact pending|in_progress|completed|blocked|skipped statuses and ToDoController
  remains the sole status writer. The completion observation preserves todo_id and actual item/list revisions; required
  is an exact boolean derived from the actual owning caller''s independently enumerated complete required_todo_ids,
  never a new TodoItemV2 field or a caller-supplied exemption. Original source custody stores the exact list/required-set/admitted-work/bound-Plan/recovery/internal-owner
  observations as well as their original source refs so restart cannot refresh the same decision into success. A
  required item is completed, or skipped with a nonempty string accepted_skip_ref resolving to an authentic accepted
  disposition for that exact item/list/revision and actor. Wrong-type, denied, stale, foreign or unresolved disposition
  refuses. Optional items do not bypass the complete admitted-work, bound-Plan or recovery barriers.


  The ordinary host result complete admits only active -> completed, clears blocked_reason_ref, increments ordinary
  revision once through shared metadata_update and preserves objective/history/origin/identity/active_run_ref. All
  admitted work is settled; bound Plan is absent with actual absence proof or settled; recovery is clear; internal
  owner predicate is met at its exact current source. paused-under-Stop and unresolved blocked do not become new
  edges. Stop, cancellation_pending/receipt, permission, source currentness and actual Storage root/lease/maintenance/deletion/hold/secret
  guards run at capture, before every independently callable helper and after the final helper before body commit.
  A model final message, generic accepted marker or certification label supplies none of this authority.


  The original decision/reservation precedes the single atomic body/control/receipt plus lifecycle-pending commit.
  Independently resolve the full original body receipt by operation key; its exact source/owner/intent/predecessor/successor/currentness/accepted-head
  fields and digest must match. Freeze the full EventRecord caller input and CV-423 payload with SP-430''s identity,
  then append and independently resolve SP-286''s first receipt and v2 full-value commitment. Exact typed source/method/result
  schemas are CV-1121. New normal/equal-retry append refuses projector_replay_only before dedupe. Equal original
  tuple is reconciliation of the immutable operation, not a fresh body effect; changed semantic input conflicts,
  while Storage-assigned metadata is excluded from semantic retry comparison.


  Use reserved -> body_committed -> event_pending -> event_committed -> published, independently for this family.
  Pre-body proven no-effect produces no event. Post-body/pre-event unavailable stays pending/unknown and cannot
  repeat or undo the body effect. A terminal unknown remains unknown; replay never upgrades it. Lost event acknowledgment
  resolves the exact original first receipt, frozen event and full-value commitment. Final original publication
  runs its own post-last-helper joint guard, returns exactly the original ordinary result, and confers no next-turn
  dispatch. Retained inspection authenticates original custody and issue-time edition while applying current disclosure
  fences; a later live-state change is not an original-source defect. SP-1121 owns the physical/read/backup contract;
  ATS-1114 names the full boundary suite. GRS-1122 is a different approved-exception route; its result never passes
  as ordinary completion. Native execution remains NOT_RUN.


  The native commit_body method holds the actual source owners'' read/currentness permits and the shared body/control
  writer fence through one serializable commit of body, control, receipt and the selected lifecycle pending phase.
  Validate the exact captured read set inside that admitted boundary, including caller, permission/Stop, ToDoController
  and its complete required-item selection, admitted work, bound Plan, recovery and internal owner where this route
  requires them. Every actual participant writer must obey that same owner fence/epoch protocol before this source
  edition is installed. An unlocked check followed by a write is forbidden; missing participant support is unavailable,
  not an all-true admission descriptor. The permits are native owner capabilities resolved by this method from the
  original source_ref, never caller-supplied permission booleans. This binding changes no To-Do writer, record or
  five-status enum.'
gui_related: false
gui_classification_reason: Original lifecycle source, receipt custody and protocol predicates.
depends_on:
- GRS-204
- GRS-064
- GRS-050
- DL-045
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```

### GRS-1122 - Approved verification exception original completion route

```yaml
plan_unit_id: GRS-1122
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Newly authored DL-045 technical materialization of DL-081''s already approved Project verification-exception
  completion route, prepared without admission. GRS-065 and GRS-204 adopt owner.goal.lifecycle.approved_exception.v1@1.0.0,
  pm.goal.host.exception_source.v1, CV-1122, EP-1120, HITL-1120, PS-1120, SIR-1120 and SP-1122 explicitly. This
  does not expand the Standard certified source, its enum, native-v7 all-writers profile or goal_run.certified writer.


  The per-family goal.completed search at cfb7e550746c08a989bb41583286d72acc47e68d found DL-081, preserved D-R18/CV-340
  exception meanings and GRS-065/204''s specific unbound-route disclaimer, but no complete original exception request/approval/Workflow-result/Goal
  mapping. DL-081''s premise remains current: the Project-owning user approves each specific residual risk through
  existing HITL; the truthful label is completed_with_approved_verification_exception and original final decision
  certified_with_approved_exception. The newer application Goal edition does not adopt Project Workflow certification
  or override that approver.


  The actual Workflow controller independently enumerates the original graph/revision/hash, all WorkNodes, validators,
  criteria, unresolved verification findings and residual risks. Unknown/missing dependencies refuse. Current child-Goal
  requirements remain authentically empty under GRS-052/075. The request identifies exact Project/Goal/run, source/graph/accepted
  Goal currentness, every verification finding with original evidence/result and corresponding proposed waiver,
  residual risk and any incomplete-item disposition. Permissions and safety authority are not verification waivers:
  Stop, cancellation, missing mutation/source/SCM/safe-point/rollback custody, secrets, unknown effects or unauthorized
  target cannot be waived. Required execution dependencies must have actual terminal results. Every non-passing
  verification item needs the exact still-valid human-approved disposition; passing/waived does not relabel a failed
  test as passed.


  HITL resolves the existing exact request and immutable resolution, authenticates the Project-owning user and one-time
  exact-risk scope, and rejects denial/expiry/revocation/wrong person/wrong target/stale graph/new risk or unused
  blanket approval. No synthetic blocked_sequence is minted for a host-only request; an actual blocked Workflow
  episode retains its own existing anchor. PS-1120 independently confirms the approver still owns this Project and
  has current authority. Automation mode, worker, model, delegated reviewer and generic tool Always grants cannot
  approve this route. Re-read original approval and owner facts after each helper and at the final exception decision
  and Goal body boundary. Added risk requires a new exact approval; this contract asks no new policy question.


  EP-1120''s original exception decision retains the complete source projection, original failed/blocked/skipped
  results, exact approval/disposition/risk set, certifier and issue time. It issues a distinct exception receipt/result
  in SP-1122 before the Goal host consumes it. No standard certification source or existing goal_run.certified append
  is invoked. The Workflow''s final original outcome mapping records certified_with_approved_exception and truthful
  completed_with_approved_verification_exception; this is result evidence, not a new Workflow enum or rewritten
  clean receipt. It grants no run transition/event beyond the actual installed exception result mapping. If a native
  Workflow cannot install that distinct mapping, the route is unavailable rather than casting it to clean certification.


  The host then independently satisfies GRS-1121''s current To-Do/admitted-work/bound-Plan/recovery/Stop/body guards
  using original exception receipt as caller evidence and completion_route approved_verification_exception. A required
  skipped To-Do has its own accepted disposition, not a generic risk approval. Only active -> completed is bound.
  GoalRecordV2 keeps its four states and no new outcome field; the separate original lifecycle result carries the
  truthful exception label, approver and residual-risk refs. Exactly CV-423''s unchanged completed-v3 payload references
  that original evidence. It cannot pass the ordinary method or be presented as a clean pass. One shared body metadata
  effect precedes frozen event, SP-286 first receipt/full-value resolution and immutable original exception publication.
  All post-body unknown/recovery rules apply; final receipt/source/approval comparison follows the last helper.
  ATS-1115 tests this separate route. Content/approval/evidence retain their existing owner clocks, content-free
  effect/receipt authority is retained under the existing policy and refs create no hold. Native execution remains
  NOT_RUN.


  The native commit_body method holds the actual source owners'' read/currentness permits and the shared body/control
  writer fence through one serializable commit of body, control, receipt and the selected lifecycle pending phase.
  Validate the exact captured read set inside that admitted boundary, including caller, permission/Stop, ToDoController
  and its complete required-item selection, admitted work, bound Plan, recovery and internal owner where this route
  requires them. Every actual participant writer must obey that same owner fence/epoch protocol before this source
  edition is installed. An unlocked check followed by a write is forbidden; missing participant support is unavailable,
  not an all-true admission descriptor. The permits are native owner capabilities resolved by this method from the
  original source_ref, never caller-supplied permission booleans. This binding changes no To-Do writer, record or
  five-status enum.'
gui_related: true
gui_classification_reason: Preserves the approved truthful verification-exception label and human approval identity.
depends_on:
- GRS-065
- GRS-1121
- DL-081
- DL-045
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```
