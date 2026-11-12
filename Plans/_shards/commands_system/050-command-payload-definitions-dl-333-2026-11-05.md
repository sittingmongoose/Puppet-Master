# Shard 050: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Commands_System.md`

Source lines: L10704-L11251

Source SHA256: `863b525b3833fdd01ebeb6925f6baef415ffdf1525912a2c5fbaa5526e439c63`

---

## Command payload definitions (DL-333, 2026-11-05)

### CS-125 - Debug Investigation Command Payload Definitions

```yaml
plan_unit_id: CS-125
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Typed payload definitions for the cmd.debug.* assistant-thread investigation family that
  UI_Command_Catalog UCC-077 routes here (DL-333; CS-042 owns the family). The definitions block
  below gives each active command its args, owner result and narrowed error and disabled-reason
  codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels, availability and
  aliases; the strict schema overlay keeps the common envelope and the closed code sets. The
  CS-009 boundary stands: cmd.debug.* remains the assistant-investigation family and classical DAP
  dispatch uses only cmd.run_debug.*, which is not defined here.
  Amended 2026-11-09 (DL-471): cmd.debug.record_verification and cmd.debug.run_cleanup extend this
  block through the explicit UCC-142 external routes. CS-065 and section 7.4 retain verification/evidence,
  two-step cleanup confirmation and preservation holds; the payload/result encodings and
  the two owner-state-to-closed-code mappings are decided by DL-471 Q-DB1, Q-DB2, Q-DB3 and Q-DB4.
  Plans/Decision_Log.md#DL-471, Q-DB3 decided by the owner: [cmd.debug.record_verification], disabled_reason_codes = ["blocked_state_required", "stale_projection"]. map phase_not_reached to blocked_state_required under DL-333 resolution 6, retaining the exact owner state as detail.
  Plans/Decision_Log.md#DL-471, Q-DB3 decided by the owner: [cmd.debug.run_cleanup], disabled_reason_codes = ["blocked_state_required", "stale_projection"]. both map to blocked_state_required under DL-333 resolution 6 and keep exact owner details.
  Plans/Decision_Log.md#DL-471, Q-DB2 decided by the owner: [cmd.debug.run_cleanup], omitted:preservation_policy = "omitted". the owner reloads current holds and the exact cleanup manifest, never takes a caller override, and revalidates target identity/evidence under assistant-chat-design section 1.0B.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Debug Mode investigation commands (Assistant Chat, editor, evidence panel).
depends_on: [UCC-230, UCC-077, CS-009, CS-042, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to CS-125 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.debug.start, cmd.debug.stop, cmd.debug.pause, cmd.debug.resume, cmd.debug.add_breakpoint, cmd.debug.remove_breakpoint, cmd.debug.clear_breakpoints, cmd.debug.view_evidence, cmd.debug.step, cmd.debug.collect_snapshot, cmd.debug.record_verification, cmd.debug.run_cleanup]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the grouped token cmd.debug.* is a family alias and never dispatches.
  - Do not define the cmd.run_debug.* classical DAP family or the cmd.chat.web.* and cmd.chat.stop rows here; UCC-230 routes them elsewhere (CS-009 boundary).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: CS-125
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.debug.record_verification
      ucc_units: [UCC-142]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id: {type: id, required: true, default: none, provenance: canon, source: "CS-042 assistant-thread investigation family; UCC-230 debug row-group identity thread_id, always"}
        investigation_id: {type: id, required: true, default: none, provenance: canon, source: "Contracts_V0 section 3.5 debug.investigation.verification_recorded names investigation_id; UCC-230 identity_aliases maps debug_session_id to investigation_id"}
        verification_state: {type: enum, values: [resolved, still_failing], required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB1 decided by the owner: required resolved/still_failing.'}
        verification_strength: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB1 decided by the owner: required bounded non-secret owner strength string.'}
        verification_summary: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 1024}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB1 decided by the owner: 1..1024 characters, redacted.'}
        artifact_refs: {type: list, required: true, default: none, item: {type: ref}, constraints: {min_items: 1, max_items: 32, unique_items: true}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB1 decided by the owner: require one to thirty-two unique evidence artifact refs at command admission.'}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugVerificationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: phase_not_reached, code: blocked_state_required}
      aliases: []
    - command_id: cmd.debug.run_cleanup
      ucc_units: [UCC-142]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id: {type: id, required: true, default: none, provenance: canon, source: "CS-042 assistant-thread investigation family; UCC-230 debug row-group identity thread_id, always"}
        investigation_id: {type: id, required: true, default: none, provenance: canon, source: "CS-065 cleanup acts on the current investigation; UCC-230 identity_aliases types investigation_id as the debug-session identity"}
        confirmation_ref: {type: ref, required: true, default: none, provenance: canon, source: "CS-065 and UCC-142 require two_step confirmation for run_cleanup; UCC-230 types common confirmation_ref as ref"}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugCleanupResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: phase_not_reached, code: blocked_state_required}
        - {owner_state: preservation_hold_active, code: blocked_state_required}
      aliases: []
    - command_id: cmd.debug.start
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); 7.1 'Begins a new debug investigation in current thread' (Commands_System.md:694); UCC-230 envelope common optional thread_id restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugInvestigationStartResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Neither the 7.1 table (Commands_System.md:692-703) nor the catalog bridge (UI_Command_Catalog.md:1012,
            which leaves lifecycle semantics to Commands_System) states a command_kind. Beginning an investigation is a
            durable lifecycle mutation (Commands_System.md:694; it emits debug.investigation.started,
            Contracts_V0.md:1532), and the parallel DAP row cmd.run_debug.start is catalog domain_action (Run/Debug
            registration table, UI_Command_Catalog.md:13483).
        - key: omitted:target
          choice: omitted
          gap_note: >-
            The 7.1 row names no target (Commands_System.md:694). The investigation header requires target and
            debug_target_kind (assistant-chat-design.md:1318-1325), the started event carries target_kind and a
            bounded target_locator_summary (Contracts_V0.md:1532), and debug.investigation.target_bound records the
            bindings later (:1534). ACD 11.0A says a new target in a thread with a non-terminal investigation
            continues that investigation, and only an explicit supersede switches it (assistant-chat-design.md:1186).
            Canon does not say whether start carries the target or the owner binds it afterwards, so the field is
            left out: the owner binds the target from the thread's debug context and records it in target_bound. A
            field is added when canon says start carries it.
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers the precondition states
            chat_active false and investigation_active true (Commands_System.md:694); stale_projection is the 2.0B
            projection-freshness clause.
      aliases: []
    - command_id: cmd.debug.stop
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay UCC-077..UCC-083 optional identity debug_session_id; canon name in Contracts_V0.md:1532-1540 (debug.investigation.* events) and assistant-chat-design.md:1189, :1319. The 7.1 precondition investigation_active (Commands_System.md:695) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugInvestigationStopResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Concluding the active investigation is a durable lifecycle
            mutation (Commands_System.md:695), and the parallel DAP row cmd.run_debug.stop is catalog domain_action
            (UI_Command_Catalog.md:13485).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active false
            (Commands_System.md:695); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.pause
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_active (Commands_System.md:696) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugInvestigationPauseResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Pausing evidence collection is a durable investigation-state
            mutation (Commands_System.md:696), and the parallel DAP row cmd.run_debug.pause is catalog domain_action
            (UI_Command_Catalog.md:13489). Canon conflict: ACD 11.0A's closed investigation lifecycle has no paused
            state (assistant-chat-design.md:1174-1182), while 7.1 has pause, resume and the investigation_paused
            precondition (Commands_System.md:696-697). The definition follows 7.1, which CS-042 makes the owner of
            the family's lifecycle semantics; the ACD list has not been reconciled.
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active false
            (Commands_System.md:696); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.resume
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_paused (Commands_System.md:697) makes the thread's paused investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugInvestigationResumeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Resuming a paused investigation is a durable investigation-state
            mutation (Commands_System.md:697), and the parallel DAP row cmd.run_debug.continue is catalog
            domain_action (UI_Command_Catalog.md:13490). The same canon conflict as cmd.debug.pause: ACD 11.0A has no
            paused state (assistant-chat-design.md:1174-1182); the definition follows 7.1.
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_paused false
            (Commands_System.md:697); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.add_breakpoint
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_active (Commands_System.md:698) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
        source_location:
          type: object
          required: true
          default: none
          fields:
            path:
              type: path
              required: true
              default: none
              provenance: gap
              gap_note: "the editor file of the breakpoint; no field name in canon"
            line:
              type: integer
              required: true
              default: none
              constraints: {minimum: 1}
              provenance: gap
              gap_note: "the 1-based editor line of the breakpoint; no field name or bound in canon"
          provenance: gap
          gap_note: >-
            "Adds a breakpoint at current editor position" (Commands_System.md:698) names no source-location field.
            Choice: a path-plus-line pair taken from the current editor position (precondition editor_active).
            Alternatives: (a) the common optional selection_ref, so the editor selection carries the position; (b) a
            FileSafe-normalized location contract; canon names neither. FileSafe owns path normalization at run time
            (DL-333 resolution 11: no literal default for path).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugAddBreakpointResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Adding a breakpoint is a durable investigation mutation
            (Commands_System.md:698), and the parallel DAP breakpoint rows are catalog domain_action
            (UI_Command_Catalog.md:13510-13512).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers editor_active or
            investigation_active false (Commands_System.md:698); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.remove_breakpoint
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 family runs inside the thread's investigation (Commands_System.md:690-703), so it stays optional as the overlay marks it"
        breakpoint_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            "Removes selected breakpoint" with precondition breakpoint_selected (Commands_System.md:699) names no
            breakpoint identity field. Choice: the id of the selected breakpoint; a breakpoint ref shape is the
            alternative, and canon names neither.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugRemoveBreakpointResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Removing a breakpoint is a durable investigation mutation
            (Commands_System.md:699), and the parallel DAP breakpoint rows are catalog domain_action
            (UI_Command_Catalog.md:13510-13514 and :13516; :13515, cmd.run_debug.breakpoint.goto_source, is navigation_wrapper).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers breakpoint_selected false
            (Commands_System.md:699); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.clear_breakpoints
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_active (Commands_System.md:700) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugClearBreakpointsResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Removing all breakpoints is a durable investigation mutation
            (Commands_System.md:700), and the parallel DAP row cmd.run_debug.breakpoint.remove_all is catalog
            domain_action (UI_Command_Catalog.md:13513).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active or
            has_breakpoints false (Commands_System.md:700); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.view_evidence
      ucc_units: [UCC-077]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_active (Commands_System.md:701) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            Canon states no command_kind for this row. "Opens evidence panel for current investigation"
            (Commands_System.md:701) is a route/open like cmd.testing.open_receipt.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            A route/open with no owner result: the wiring row catalog.debug_view_evidence names no request or result
            schema, only a no-persist dispatch receipt or route/open disposition.
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active false
            (Commands_System.md:701); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.step
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 preconditions investigation_active and at_breakpoint (Commands_System.md:702) make the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugStepResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Advancing to the next execution point is a durable investigation
            mutation (Commands_System.md:702), and the parallel DAP step rows are catalog domain_action
            (UI_Command_Catalog.md:13491-13493).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active or
            at_breakpoint false (Commands_System.md:702); stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.debug.collect_snapshot
      ucc_units: [UCC-077]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        investigation_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 identity_aliases (DL-341): investigation_id stands for the overlay optional identity debug_session_id (Contracts_V0.md:1532-1540; assistant-chat-design.md:1189, :1319). The 7.1 precondition investigation_active (Commands_System.md:703) makes the thread's active investigation the subject, so it stays optional as the overlay marks it"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DebugCollectSnapshotResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Capturing current state as evidence is a durable investigation
            mutation (Commands_System.md:703); the snapshot becomes a context item (debug.investigation.context_item_added,
            Contracts_V0.md:1535).
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. blocked_state_required covers investigation_active false
            (Commands_System.md:703); stale_projection is the 2.0B clause.
      aliases: []
  results:
    DebugVerificationResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB4 decided by the owner: required receipt ref to the recorded exact investigation/outcome/evidence, carried only after the owner write succeeds.'}
    DebugCleanupResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-DB4 decided by the owner: required receipt ref to the verified cleanup outcome or preserved residue, never implying resolved from dispatch alone.'}
    DebugInvestigationStartResultV1:
      fields:
        investigation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the started investigation; canon names investigation_id in debug.investigation.started (Contracts_V0.md:1532) and the investigation header (assistant-chat-design.md:1319), typed id by the UCC-230 alias for debug_session_id (DL-341), but no result contract carries it"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt; the wiring row requires a no-persist command receipt (catalog.debug_start, cmd.debug.start.dispatch_receipt) but no result contract names the field"}
    DebugInvestigationStopResultV1:
      fields:
        investigation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the concluded investigation; canon names investigation_id (Contracts_V0.md:1533) but no result contract carries it here"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_stop)"}
    DebugInvestigationPauseResultV1:
      fields:
        investigation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the paused investigation; canon names investigation_id (Contracts_V0.md:1533) but no result contract carries it here"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_pause)"}
    DebugInvestigationResumeResultV1:
      fields:
        investigation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the resumed investigation; canon names investigation_id (Contracts_V0.md:1533) but no result contract carries it here"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_resume)"}
    DebugAddBreakpointResultV1:
      fields:
        breakpoint_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the added breakpoint; no contract names the breakpoint identity"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_add_breakpoint)"}
    DebugRemoveBreakpointResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_remove_breakpoint)"}
    DebugClearBreakpointsResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_clear_breakpoints)"}
    DebugStepResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_step)"}
    DebugCollectSnapshotResultV1:
      fields:
        item_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the context item the captured snapshot becomes; canon names item_id in debug.investigation.context_item_added (Contracts_V0.md:1535), typed id by the UCC-230 *_id typing, but no result contract carries it"}
        artifact_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the snapshot's stored artifact, when the context item has one; canon names the optional artifact_ref? in debug.investigation.context_item_added (Contracts_V0.md:1535), but no result contract carries it"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.debug_collect_snapshot)"}
```
