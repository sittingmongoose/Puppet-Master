# Shard 080: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/assistant-chat-design.md`

Source lines: L29062-L30931

Source SHA256: `02cf2464803e732637f5e32653d7a8fee7105442e2fbb670a52d399734c76474`

---

## Command payload definitions (DL-333, 2026-11-05)

Typed payload definitions for the assistant chat command families that `Plans/UI_Command_Catalog.md#UCC-230` routes to this document (DL-333). Each unit below is a `command_contract` PlanUnit; the fenced `command_payload_definitions` block after it gives each active command its args, owner result and narrowed error and disabled-reason codes in `pm.command_payload_definitions.v1`. The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the common envelope and the closed code sets.

### ACD-637 - Chat Thread Lifecycle, Context Lens, Thread Worktree And Context Detail Command Payload Definitions

```yaml
plan_unit_id: ACD-637
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the chat thread lifecycle and discovery, Context Lens, assistant
  thread worktree, and thread context-detail commands that UI_Command_Catalog UCC-056..UCC-060
  register (DL-333). The definitions block below gives each active command its args, owner result
  and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1. The catalog
  keeps ids, labels, availability and aliases; the strict schema overlay keeps the common envelope
  and the closed code sets. Every command wired through ChatOwnerCommandRequestV2 carries its typed
  args in that request's owner_input; cmd.chat.new carries the ChatNewRequestScopeV2 draft identity
  (UCC-230 identity exemption, DL-333 resolution 8). cmd.chat.worktree.bind_existing is a retired
  non-alias (DL-335) and gets no definition or alias here.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat thread, Context Lens, thread worktree and context-detail commands.
depends_on: [UCC-230, UCC-056, UCC-057, UCC-058, UCC-059, UCC-060, ACD-191, ACD-192, ACD-193, ACD-194, ACD-460, ACD-461, DL-333, DL-335]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-637 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.new, cmd.chat.archive, cmd.chat.delete, cmd.chat.rename, cmd.chat.pin, cmd.chat.export, cmd.chat.search, cmd.chat.context_lens.toggle, cmd.chat.context_lens.set_mode, cmd.chat.context_lens.turn_off, cmd.chat.context_lens.toggle_message_selection, cmd.chat.context_lens.clear_selection, cmd.chat.context_lens.apply_subcompact, cmd.chat.context_lens.revert_subcompact, cmd.chat.worktree.create, cmd.chat.worktree.unbind, cmd.chat.worktree.remove, cmd.chat.worktree.merge, cmd.chat.worktree.pr, cmd.chat.worktree.info, cmd.chat.compact_context, cmd.chat.open_thread_context_details, cmd.chat.focus_thread_context_details, cmd.chat.close_thread_context_details]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token (the grouped cmd.chat.{new,archive,delete,rename,pin,export,search} token, the cmd.chat.worktree.* family token, retired cmd.chat.worktree.bind_existing per DL-335).
  - Do not define the project-scope cmd.git.worktree.* family here; UCC-230 routes it to W-095.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Prompt_Pipeline.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-637
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.new
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for this row. Creating or focusing the thread shell
      # mints draft identity and later the durable thread (UI_Command_Catalog.md:734), a state change,
      # not a view toggle.
      response_kind: owner_operation
      args:
        draft_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 required draft_id; the draft identity UCC-230's identity exemption names (DL-333 resolution 8)"
        place_kind:
          type: enum
          values: [no_project, project]
          required: true
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 place_kind enum"
        project_id:
          type: id
          required: false
          default: none
          required_when: {field: place_kind, in: [project]}
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 project_id (nullable; null when place_kind is no_project); UCC-230 envelope common optional project_id narrowed"
        initial_message_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 initial_message_ref (nullable); the first user message whose commit mints thread_id (UI_Command_Catalog.md:734)"
      identity_exemptions:
        - {field: thread_id, decision: DL-333, reason: "UCC-230 identity_exemptions: cmd.chat.new runs before a thread exists; thread_id is minted when the first user message commits (DL-333 resolution 8)"}
      owner_request: Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewResultScopeV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      # JUDGMENT: chat_available false (UI_Command_Catalog.md:734) reads as not_configured; canon names
      # no row-specific disabled set.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.archive
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Archiving is the active/suspended -> archived lifecycle
      # transition (assistant-chat-design.md Thread Lifecycle State Machine), a durable state change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured]
      # JUDGMENT: thread_selected false and active_run_in_thread true (UI_Command_Catalog.md:735) are
      # blocked states; chat_available false is not_configured.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.delete
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Deleting is the terminal lifecycle transition that
      # persists the content-free tombstone and requests purge (UI_Command_Catalog.md:736).
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "row precondition delete_confirmed (UI_Command_Catalog.md:736) per UCC-230 identity rule; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: thread_selected/delete_confirmed false and active_run_in_thread true are blocked
      # states, chat_available false is not_configured, deletion_family_available false (UI_Command_Catalog.md:736)
      # is unsupported.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.rename
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Renaming persists the thread title without changing
      # identity (UI_Command_Catalog.md:737), a durable metadata change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        title:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "assistant-chat-design.md:1161 (Thread Identity Model: title is user-editable without changing identity); row renames the selected thread title (UI_Command_Catalog.md:737)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured]
      # JUDGMENT: thread_selected false (UI_Command_Catalog.md:737) is a blocked state; chat_available
      # false is not_configured. The max_length 256 bound is a JUDGMENT: canon states no title length bound.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.pin
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Pin/unpin persists thread-list pin state without
      # changing lifecycle state (UI_Command_Catalog.md:738), a durable state change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        pinned:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row says "Pins or unpins the selected thread" (UI_Command_Catalog.md:738); canon does
            not state whether the command is a no-argument toggle or carries an explicit pinned
            boolean, and names no field. JUDGMENT: optional pinned boolean, absent = toggle the
            current pin state. Alternative: no argument at all, pure toggle.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured]
      # JUDGMENT: thread_selected false (UI_Command_Catalog.md:738) is a blocked state; chat_available
      # false is not_configured.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.export
      ucc_units: [UCC-056]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Exporting produces a local export artifact from the
      # transcript and permitted metadata (UI_Command_Catalog.md:739), an owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        format:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row exports "to the supported local export format" (UI_Command_Catalog.md:739) but
            never names the format or formats and states no default. JUDGMENT: optional opaque format
            token, absent = the surface's default export format. Alternative: a closed enum once an
            owner names the supported formats.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadExportResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured]
      # JUDGMENT: thread_selected false (UI_Command_Catalog.md:739) is a blocked state; chat_available
      # false is not_configured.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.search
      ucc_units: [UCC-056]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. In-thread search reads the Tantivy chat index and
      # restores focus to matches (UI_Command_Catalog.md:740; assistant-chat-design.md section 10);
      # it mutates no durable thread state.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        query:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            The row searches within the selected thread (UI_Command_Catalog.md:740) but names no query
            field. JUDGMENT: query, the field name the locked /web search schema uses
            (assistant-chat-design.md section 5.2); max_length 256 is likewise a JUDGMENT, no canon
            bound exists.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadSearchResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured]
      # JUDGMENT: thread_selected false (UI_Command_Catalog.md:740) is a blocked state; chat_available
      # false is not_configured.
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
    - command_id: cmd.chat.context_lens.toggle
      ucc_units: [UCC-057]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Toggling only opens or closes the dropdown
      # (UI_Command_Catalog.md:750); layout/UI state only.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: none  # layout/UI state only; the wiring row envelope carries no owner input for a view-state command
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the Lens is thread-local (assistant-chat-design.md section 17.6), so no selected
      # thread is a blocked state; canon names no row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.context_lens.set_mode
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Setting the mode establishes the one active shaping
      # mode and Mute/Focus apply immediately as selection toggles happen
      # (UI_Command_Catalog.md:751; assistant-chat-design.md section 17.6), a durable shaping change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_lens_mode:
          type: enum
          values: [mute, focus, subcompact]
          required: true
          default: none
          provenance: canon
          source: "row 'Set active mode to mute, focus, or subcompact' (UI_Command_Catalog.md:751); overlay UCC-056..UCC-060 optional identity context_lens_mode"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensModeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: thread-local control; no selected thread is a blocked state (section 17.6).
      aliases: []
    - command_id: cmd.chat.context_lens.turn_off
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Turn Off exits the mode, clears selection and
      # releases applied shaping with an attributable receipt (UI_Command_Catalog.md:752; ACD-460),
      # an owner state change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensTurnOffResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: thread-local control; no selected thread is a blocked state (section 17.6).
      aliases: []
    - command_id: cmd.chat.context_lens.toggle_message_selection
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Toggling mutates the thread-local selection set the
      # overlay store holds (UI_Command_Catalog.md:753; Wiring_Matrix.md Context Lens minimum rows),
      # and Mute/Focus apply it immediately.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        message_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row toggles "one message" (UI_Command_Catalog.md:753) and the wiring row says
            "message ids[] selection mutation" (Plans/Wiring_Matrix.md Context Lens minimum rows):
            single message_id versus a list is not settled. JUDGMENT: one message_id per dispatch
            (the row's own words); a batch list variant stays open.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSelectionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: applies immediately in mute and focus (UI_Command_Catalog.md:753); no selected
      # thread is a blocked state.
      aliases: []
    - command_id: cmd.chat.context_lens.clear_selection
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Clearing mutates the thread-local selection set
      # without touching canonical history (UI_Command_Catalog.md:754).
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSelectionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: thread-local control; no selected thread is a blocked state (section 17.6).
      aliases: []
    - command_id: cmd.chat.context_lens.apply_subcompact
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Applying creates the local summary artifact and
      # changes effective context assembly (UI_Command_Catalog.md:755; ACD-460), an owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_projection_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row applies "from the current source-bound preview" (UI_Command_Catalog.md:755) and
            ACD-460 binds previews to exact scope, source revisions, shaping revision and summary
            identity, but canon names no preview identity field. JUDGMENT: the overlay's
            context_projection_ref carries the source-bound preview; alternative: a dedicated
            subcompact_preview_ref, which no canon names.
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "row 'Requires explicit confirmation' (UI_Command_Catalog.md:755) per UCC-230 identity rule; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSubcompactResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      # JUDGMENT: source or scope drift refuses Apply without mutating history (ACD-460), so a stale
      # preview disables it; canon names no row-specific disabled set beyond that.
      aliases: []
    - command_id: cmd.chat.context_lens.revert_subcompact
      ucc_units: [UCC-057]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Reverting restores a subcompacted region to full
      # effective-context state through rehydration (UI_Command_Catalog.md:756), an owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_projection_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names no field for the subcompacted region being restored. The row restores "a
            previously subcompacted region" using canonical source refs (UI_Command_Catalog.md:756)
            and the wiring row restores "original selected message block" (Plans/Wiring_Matrix.md
            Context Lens minimum rows). JUDGMENT: the overlay's context_projection_ref identifies the
            applied shaping projection whose region is restored; alternatives: a region/message-range
            ref, which no canon names.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSubcompactResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      # JUDGMENT: rehydration uses canonical source refs (UI_Command_Catalog.md:756), so a stale
      # projection disables it; no selected thread is a blocked state.
      aliases: []
    - command_id: cmd.chat.worktree.create
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Creating binds a new worktree to the thread and
      # opens the create/bind dialog (UI_Command_Catalog.md:766; W.11), a durable binding change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required; W.11 parameters (assistant-chat-design.md:3383)"
        branch_name:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "W.11 parameters { thread_id, branch_name?, base_ref? } (assistant-chat-design.md:3383); bound is a JUDGMENT, canon states none"
        base_ref:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "W.11 parameters { thread_id, branch_name?, base_ref? } (assistant-chat-design.md:3383); bound is a JUDGMENT, canon states none"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeCreateResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: base when-clauses (UI_Command_Catalog.md:762): projectIsGitRepo false is
      # not_configured, projectIsRemoteNonSSH is unsupported (worktrees unsupported), and
      # !activeThreadHasWorktree visibility is a blocked state.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.worktree.unbind
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Unbinding detaches the thread from its worktree
      # while keeping the worktree on disk (UI_Command_Catalog.md:767), a durable binding change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3384); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: activeThreadHasWorktree visibility and !activeThreadHasActiveRun enablement
      # (UI_Command_Catalog.md:767) are blocked states; the base git/remote clauses are
      # not_configured / unsupported.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.worktree.remove
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Removing detaches and prunes the thread worktree
      # with confirmation if dirty (UI_Command_Catalog.md:768), a destructive owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3385); overlay UCC-056..UCC-060 required identity thread_id (always)"
        confirmation_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "row 'with confirmation if dirty' (UI_Command_Catalog.md:768); UCC-230 envelope common optional confirmation_ref narrowed, required only for the dirty case"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: activeThreadHasWorktree visibility and !activeThreadHasActiveRun enablement
      # (UI_Command_Catalog.md:768) are blocked states; the base git/remote clauses are
      # not_configured / unsupported.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.worktree.merge
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Merge opens the merge-back dialog and executes the
      # merge-back flow (UI_Command_Catalog.md:769; W.8), an owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id, strategy?, target_branch?, message? } (assistant-chat-design.md:3386); overlay UCC-056..UCC-060 required identity thread_id (always)"
        strategy:
          type: enum
          values: [squash, rebase]
          required: false
          default: none
          provenance: gap
          gap_note: >-
            strategy? comes from W.11 (assistant-chat-design.md:3386) but its values exist only as the
            slash flags --squash|--rebase (UI_Command_Catalog.md:769; '/worktree merge [--squash|--rebase]
            is one command'); whether a plain merge value exists and what the default is are unstated.
            JUDGMENT: enum of the two flagged values only, absent = plain merge; alternative: a
            'merge' value made explicit.
        target_branch:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "W.11 parameters { thread_id, strategy?, target_branch?, message? } (assistant-chat-design.md:3386); bound is a JUDGMENT, canon states none"
        message:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: canon
          source: "W.11 parameters { thread_id, strategy?, target_branch?, message? } (assistant-chat-design.md:3386); bound is a JUDGMENT, canon states none"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeMergeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: the enablement clause !activeThreadHasActiveRun && !worktreeDirty &&
      # !worktreeHasConflicts && !worktreeDetachedHead && !mergeLockHeld (UI_Command_Catalog.md:769)
      # is all blocked states; the base git/remote clauses are not_configured / unsupported.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.worktree.pr
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. PR opens the PR creation panel for the bound branch
      # (UI_Command_Catalog.md:770; W.8.6), an owner interaction with the forge.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id, title?, body?, target_branch? } (assistant-chat-design.md:3387); overlay UCC-056..UCC-060 required identity thread_id (always)"
        title:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "W.11 parameters { thread_id, title?, body?, target_branch? } (assistant-chat-design.md:3387); bound is a JUDGMENT, canon states none"
        body:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 65536}
          provenance: canon
          source: "W.11 parameters { thread_id, title?, body?, target_branch? } (assistant-chat-design.md:3387); bound is a JUDGMENT, canon states none"
        target_branch:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "W.11 parameters { thread_id, title?, body?, target_branch? } (assistant-chat-design.md:3387); bound is a JUDGMENT, canon states none"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreePrResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: projectHasGitHubRemote visibility false is not_configured; activeThreadHasActiveRun
      # and worktreeDetachedHead enablement (UI_Command_Catalog.md:770) are blocked states; the base
      # remote-non-SSH clause is unsupported.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.worktree.info
      ucc_units: [UCC-058, UCC-059]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Info shows the binding and status without mutation
      # (UI_Command_Catalog.md:771), a read-only view; it still queries the owner binding store, so
      # it keeps an owner result rather than a local projection.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3388); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeInfoResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      # JUDGMENT: activeThreadHasWorktree visibility (UI_Command_Catalog.md:771) is a blocked state;
      # the base git/remote clauses are not_configured / unsupported.
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
    - command_id: cmd.chat.compact_context
      ucc_units: [UCC-060]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Compaction runs the bounded compaction transaction
      # whose commit emits context.compaction.completed (UI_Command_Catalog.md:790; ACD-461), an
      # owner write.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:790); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatCompactContextResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, degraded]
      # JUDGMENT: the result vocabulary includes degraded and unavailable (UI_Command_Catalog.md:790);
      # mapped here to the closed disabled set as degraded for a degraded compaction family and
      # not_configured when no compaction family is available.
      aliases: []
    - command_id: cmd.chat.open_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. The row is layout/UI state only (UI_Command_Catalog.md:791):
      # open adds or reveals the thread's context tab (UCC-200, DL-180).
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:791); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: none  # layout/UI state only; the wiring row envelope carries no owner input for a view-state command
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the pane is thread-bound; no selected thread is a blocked state. Canon names no
      # row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.focus_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. The row is layout/UI state only (UI_Command_Catalog.md:792):
      # focus reveals the existing context tab (UCC-200, DL-180).
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:792); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: none  # layout/UI state only; the wiring row envelope carries no owner input for a view-state command
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: same as open; focus additionally needs the tab present, still a blocked state.
      aliases: []
    - command_id: cmd.chat.close_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. The row is layout/UI state only (UI_Command_Catalog.md:793):
      # close closes the context tab (UCC-200, DL-180).
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:793); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: none  # layout/UI state only; the wiring row envelope carries no owner input for a view-state command
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: same as open; closing needs the tab present, still a blocked state.
      aliases: []
  results:
    ChatThreadLifecycleResultV1:
      fields:
        thread_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the thread acted on"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch or owner receipt"}
    ChatThreadExportResultV1:
      fields:
        export_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the produced local export artifact; no canon names the export artifact field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_export)"}
    ChatThreadSearchResultV1:
      fields:
        query_session_id: {type: id, required: false, default: none, provenance: gap, gap_note: "session id if in-thread search keeps a query session; canon does not say"}
        message_ids: {type: list, item: {type: id}, required: false, default: none, provenance: gap, gap_note: "matched message ids the surface focuses; canon names no result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_search)"}
    ContextLensModeResultV1:
      fields:
        context_lens_mode: {type: enum, values: [mute, focus, subcompact], required: true, default: none, provenance: gap, gap_note: "the mode now active; result shape is not canon"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_context_lens_set_mode)"}
    ContextLensTurnOffResultV1:
      fields:
        released_counts: {type: integer, required: false, default: none, provenance: gap, gap_note: "the disclosed released counts (UI_Command_Catalog.md:752 'disclose released counts'); no canon names the field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the attributable receipt ACD-460 requires for releasing applied shaping"}
    ContextLensSelectionResultV1:
      fields:
        selection_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the selection set state after the toggle/clear; canon names no field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt"}
    ContextLensSubcompactResultV1:
      fields:
        context_projection_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the applied or reverted shaping projection; canon names no field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt"}
    ChatWorktreeCreateResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the created worktree binding"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_create)"}
    ChatWorktreeLifecycleResultV1:
      fields:
        worktree_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the unbound/removed worktree when one was bound"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_unbind / _remove)"}
    ChatWorktreeMergeResultV1:
      fields:
        merge_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the merge-back outcome record; W.8 names the flow, not a result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_merge)"}
    ChatWorktreePrResultV1:
      fields:
        pr_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the created PR when creation completed; W.8.6 names the flow, not a result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_pr)"}
    ChatWorktreeInfoResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the bound worktree; W.2 owns the binding record, no result field is canon"}
        branch: {type: string, required: false, default: none, provenance: gap, gap_note: "the bound branch, when the binding records one (W.2)"}
        status: {type: string, required: false, default: none, provenance: gap, gap_note: "the binding status the row shows; opaque projection token"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_info)"}
    ChatCompactContextResultV1:
      fields:
        outcome:
          type: enum
          values: [started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, failed]
          required: true
          default: none
          provenance: canon
          source: "result/receipt projection vocabulary (UI_Command_Catalog.md:790)"
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the result/receipt projection the row requires"}
```

### ACD-638 - Chat Message, Code-Block, Rewind Revert And Message Details Command Payload Definitions

```yaml
plan_unit_id: ACD-638
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the chat message action, code-block, rewind/revert and
  message-details commands that UI_Command_Catalog UCC-073..UCC-076 register (DL-333). The
  definitions block below gives each active command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability and aliases; the strict schema overlay keeps the common envelope and the closed code
  sets. cmd.chat.revert keeps the FileSafe whole-turn manifest semantics of UCC-075 and ACD-217 and
  cmd.chat.rewind stays conversation-only; the two are never conflated. cmd.chat.add_file_reference
  is a file-only compatibility alias of cmd.chat.attachment.add (UCC-156, outside this range) and
  gets no definition here.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat message, code-block, rewind/revert and details commands.
depends_on: [UCC-230, UCC-073, UCC-074, UCC-075, UCC-076, ACD-217, ACD-012, ACD-013, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-638 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - cmd.chat.revert's result keeps the exact FileSafe outcome vocabulary; restored_with_conflicts and partial multi-file success stay invalid.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.copy_message, cmd.chat.retry_message, cmd.chat.rewind, cmd.chat.revert, cmd.chat.edit_last_user_message, cmd.chat.resend_last_user_message, cmd.chat.copy_code_block, cmd.chat.insert_code_block, cmd.chat.apply_code_block, cmd.chat.toggle_message_details]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias or source-lineage token (cmd.chat.add_file_reference is a file-only compatibility alias of cmd.chat.attachment.add, UCC-156).
  - cmd.chat.rewind must not be used as a file-restore alias and cmd.chat.revert must not rewind conversation state (UCC-075, ACD-217).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/FileSafe.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-638
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.copy_message
      ucc_units: [UCC-073]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Copy puts the rendered message content on the
      # clipboard (UI_Command_Catalog.md:972), a view-level action with no owner result.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:972); overlay UCC-073..UCC-076 required identity thread_id (always)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:972); overlay UCC-073..UCC-076 optional identity message_id made required by the row precondition message_selected (UI_Command_Catalog.md:990)"
      owner_request: none  # clipboard copy; the wiring row envelope carries no owner input
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: chat_active && message_selected preconditions (UI_Command_Catalog.md:990) are
      # blocked states; canon names no row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.retry_message
      ucc_units: [UCC-073]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Retry re-runs the selected failed/cancelled
      # assistant turn (UI_Command_Catalog.md:973), an owner run action.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:973); overlay UCC-073..UCC-076 required identity thread_id (always)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:973); overlay UCC-073..UCC-076 optional identity message_id made required by the row's selected-turn subject"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRetryMessageResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: no selected failed/cancelled assistant turn is a blocked state; canon names no
      # row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.rewind
      ucc_units: [UCC-073, UCC-075, UCC-076]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Rewind performs the conversation-only soft history
      # mutation (later messages marked superseded_by_message_id, assistant-chat-design.md section 4)
      # and never restores files (UI_Command_Catalog.md:974).
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, target_message_id } (UI_Command_Catalog.md:974); overlay UCC-073..UCC-076 required identity thread_id (always)"
        target_message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, target_message_id } (UI_Command_Catalog.md:974)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRewindResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: no eligible conversation restore point is a blocked state; canon names no
      # row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.revert
      ucc_units: [UCC-073, UCC-075, UCC-076]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Revert exact-replaces the whole-turn mutation
      # manifest through FileSafe (UI_Command_Catalog.md:975; ACD-217), an owner write.
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional project_id restated required"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); overlay UCC-073..UCC-076 required identity thread_id (always)"
        target_message_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog parameters target_message_id? (UI_Command_Catalog.md:975); omitted resolves to the latest eligible mutating assistant turn"
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional repo_id restated required (the resolved turn record must match repo_id before mutation, UI_Command_Catalog.md:999)"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional worktree_id restated required (the resolved turn record must match worktree_id before mutation, UI_Command_Catalog.md:999)"
        expected_turn_manifest_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); the resolved turn record must match it before mutation (UI_Command_Catalog.md:999)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional idempotency_key restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRevertResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      # JUDGMENT: no_eligible_mutating_turn refuses without a FileSafe transaction
      # (UI_Command_Catalog.md:999) as a blocked state; a stale manifest or identity mismatch is
      # stale_projection.
      aliases: []
    - command_id: cmd.chat.edit_last_user_message
      ucc_units: [UCC-074, UCC-076]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Edit restores the last user message into the
      # composer and performs the soft history mutation that discards later history/work
      # (assistant-chat-design.md section 4; UI_Command_Catalog.md:988), an owner state change.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && has_user_messages (UI_Command_Catalog.md:988); the last user message is resolved, not passed"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatSoftHistoryMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: has_user_messages false (UI_Command_Catalog.md:988) is a blocked state; canon
      # names no row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.resend_last_user_message
      ucc_units: [UCC-074, UCC-076]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Resend replays the latest user-authored input and
      # discards later generated history (assistant-chat-design.md section 4;
      # UI_Command_Catalog.md:989, :1003), an owner run action distinct from retry_message.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && has_user_messages (UI_Command_Catalog.md:989); the last user message is resolved, not passed"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatSoftHistoryMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: has_user_messages false (UI_Command_Catalog.md:989) is a blocked state; canon
      # names no row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.copy_code_block
      ucc_units: [UCC-074]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Copy puts the resolved code-block content on the
      # clipboard (UI_Command_Catalog.md:991), a view-level action with no owner result.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected (UI_Command_Catalog.md:991)"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:991) per UCC-230 identity rule; the three code-block rows operate on a resolved code-block sub-selection (UI_Command_Catalog.md:1004)"
      owner_request: none  # clipboard copy; the wiring row envelope carries no owner input
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: code_block_selected false (UI_Command_Catalog.md:991) is a blocked state.
      aliases: []
    - command_id: cmd.chat.insert_code_block
      ucc_units: [UCC-074]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Insert places the code-block content at the active
      # editor cursor (UI_Command_Catalog.md:992), a local editor action with no owner result.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected && editor_active (UI_Command_Catalog.md:992)"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:992) per UCC-230 identity rule"
      owner_request: none  # editor insertion at the active cursor; no owner input field
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: code_block_selected or editor_active false (UI_Command_Catalog.md:992) is a
      # blocked state; canon names no target-editor argument (the cursor is the target).
      aliases: []
    - command_id: cmd.chat.apply_code_block
      ucc_units: [UCC-074]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Apply edits the relevant file with the code-block
      # content (UI_Command_Catalog.md:993), an owner write through the file pipeline.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected (UI_Command_Catalog.md:993)"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:993) per UCC-230 identity rule"
        target_file:
          type: path
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row applies the block "as an edit to the relevant file" (UI_Command_Catalog.md:993)
            but names neither the target-file field nor the rule that resolves it (code-block
            filename binding, /open-in-editor's resolved path, or an explicit choice).
            JUDGMENT: optional FileSafe-normalized target_file, absent = the resolved binding;
            alternatives: make it required, or name the resolution rule owner.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatApplyCodeBlockResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: code_block_selected false (UI_Command_Catalog.md:993) is a blocked state.
      aliases: []
    - command_id: cmd.chat.toggle_message_details
      ucc_units: [UCC-074]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. Toggle only shows or hides message metadata
      # (UI_Command_Catalog.md:994), view state with no owner result.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && message_selected (UI_Command_Catalog.md:994)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity message_id made required by the row precondition message_selected (UI_Command_Catalog.md:994) per UCC-230 identity rule"
      owner_request: none  # view-state toggle; the wiring row envelope carries no owner input
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: message_selected false (UI_Command_Catalog.md:994) is a blocked state.
      aliases: []
  results:
    ChatRetryMessageResultV1:
      fields:
        assistant_turn_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the new assistant turn the retry starts; no canon names the result field"}
        run_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the run the re-run belongs to, when one is started"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_retry_message)"}
    ChatRewindResultV1:
      fields:
        target_message_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the conversation restore point rewound to"}
        superseded_by_message_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the soft-mutation marking assistant-chat-design.md section 4 names; presence here is a JUDGMENT"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_rewind)"}
    ChatRevertResultV1:
      fields:
        outcome:
          type: enum
          values: [restored_clean, restore_skipped, restore_refused, restore_failed, restore_recovery_required, no_eligible_mutating_turn]
          required: true
          default: none
          provenance: canon
          source: "FileSafe restore outcomes the command consumes, plus no_eligible_mutating_turn (UI_Command_Catalog.md:1000-1001; ACD-217)"
        manifest_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the restored whole-turn mutation manifest; no canon names the result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_revert)"}
    ChatSoftHistoryMutationResultV1:
      fields:
        superseded_by_message_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the soft-mutation marking of later messages (assistant-chat-design.md section 4); result shape is not canon"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_edit_last_user_message / _resend_last_user_message)"}
    ChatApplyCodeBlockResultV1:
      fields:
        target_file: {type: path, required: false, default: none, provenance: gap, gap_note: "the file actually edited; mirrors the target_file gap"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_apply_code_block)"}
```

### ACD-639 - Chat Web Family And Stop Command Payload Definitions

```yaml
plan_unit_id: ACD-639
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the cmd.chat.web.* web command family and cmd.chat.stop that
  UI_Command_Catalog UCC-077..UCC-083 register (DL-333). The definitions block below gives each
  active command its args, owner result and narrowed error and disabled-reason codes in
  pm.command_payload_definitions.v1. The catalog keeps ids, labels, availability and aliases; the
  strict schema overlay keeps the common envelope and the closed code sets. The /web UI-command
  schemas mirror the normalized web inputs (assistant-chat-design.md section 5.2); UCC-081 provider
  options are Settings/help visibility, and whether they are per-call args stays open as a recorded
  gap. Legacy cmd.web.* spellings are compatibility-only retirement evidence and get no definition;
  retired slash labels (/webfetch, /webresearch, /cancel toward /stop) normalize before dispatch.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat web-operation and stop commands.
depends_on: [UCC-230, UCC-078, UCC-079, UCC-080, UCC-081, UCC-082, UCC-083, ACD-014, ACD-015, ACD-019, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-639 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets; the legacy web error names invalid_url, fetch_failed, provider_unavailable and credit_cap_exceeded are not used.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.web.search, cmd.chat.web.fetch, cmd.chat.web.extract, cmd.chat.web.research, cmd.chat.web.crawl, cmd.chat.web.map, cmd.chat.web.help, cmd.chat.stop]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for a legacy or retired token (cmd.web.* spellings are compatibility-only retirement evidence; bare /web is help-only and dispatches cmd.chat.web.help; /cancel resolves internally to cmd.chat.stop before dispatch).
  - Do not flatten /web into separate top-level command families; the six operations stay one family.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Tools.md, Plans/Commands_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-639
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.web.search
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Search runs the websearch operation
      # through the shared dispatcher (UI_Command_Catalog.md:1028), an owner operation with an
      # activity/provenance result, not a view toggle.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        query:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: search uses { query }); /web search <query> consumes the remaining text verbatim (assistant-chat-design.md:342); max_length is a JUDGMENT, canon states no bound"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: no configured web provider is not_configured (capability-unavailable terminal
      # branch, assistant-chat-design.md section 13.2), missing credentials unauthorized, network
      # unreachable, and ask-gated web permission posture permission_required; canon names no
      # row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.web.fetch
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Fetch reads the URL through webfetch /
      # the PM-native Site Reader path (UI_Command_Catalog.md:1028), an owner operation.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: fetch uses { url }); <url> normalizes to an absolute URL before dispatch (assistant-chat-design.md:342, UCC-082)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: as cmd.chat.web.search; reading intents are host-scoped permission asks
      # (UI_Command_Catalog.md:1038).
      aliases: []
    - command_id: cmd.chat.web.extract
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Extract runs the provider-level
      # structured page pull (UI_Command_Catalog.md:1028), an owner operation.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: extract uses { url }); <url> normalizes to an absolute URL before dispatch (assistant-chat-design.md:342, UCC-082)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: as cmd.chat.web.search; extract is a host-scoped permission ask
      # (UI_Command_Catalog.md:1038).
      aliases: []
    - command_id: cmd.chat.web.research
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Research runs the webresearch operation
      # with research_mode (UI_Command_Catalog.md:1028), an owner operation.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        task:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: research uses { task }); <task> consumes the remaining text verbatim (assistant-chat-design.md:342); max_length is a JUDGMENT, canon states no bound"
        research_mode:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The intent taxonomy routes compare, investigate, research and deep-research requests to
            cmd.chat.web.research "with research_mode" (UI_Command_Catalog.md:1028), but canon never
            types the field or lists its values. JUDGMENT: opaque string token; alternative: a
            closed enum of the four request kinds once an owner fixes their spellings.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: as cmd.chat.web.search; research uses the * wildcard approval scope because the
      # host is not known upfront (UI_Command_Catalog.md:1038).
      aliases: []
    - command_id: cmd.chat.web.crawl
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Crawl runs the site traversal
      # operation (UI_Command_Catalog.md:1028), an owner operation.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        root_url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: crawl/map use { root_url, max_pages?, max_depth?, same_origin_only? }); surfaced as a command-help field; URL normalization applies (UCC-082)"
        max_pages:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); detailed crawl limits stay owned by Plans/Tools.md (UI_Command_Catalog.md:1039); minimum 1 is a JUDGMENT, canon states no bound"
        max_depth:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); detailed crawl limits stay owned by Plans/Tools.md (UI_Command_Catalog.md:1039); minimum 0 is a JUDGMENT, canon states no bound"
        same_origin_only:
          type: boolean
          required: false
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); surfaced as a command-help field; no stated default"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: as cmd.chat.web.search; crawl is host-scoped (UI_Command_Catalog.md:1038).
      aliases: []
    - command_id: cmd.chat.web.map
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Map runs the site topology operation
      # (UI_Command_Catalog.md:1028), an owner operation.
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        root_url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: crawl/map use { root_url, max_pages?, max_depth?, same_origin_only? }); URL normalization applies (UCC-082)"
        max_pages:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); detailed limits stay owned by Plans/Tools.md (UI_Command_Catalog.md:1039); minimum 1 is a JUDGMENT, canon states no bound"
        max_depth:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); detailed limits stay owned by Plans/Tools.md (UI_Command_Catalog.md:1039); minimum 0 is a JUDGMENT, canon states no bound"
        same_origin_only:
          type: boolean
          required: false
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); no stated default"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      # JUDGMENT: as cmd.chat.web.search; map is host-scoped (UI_Command_Catalog.md:1038).
      aliases: []
    - command_id: cmd.chat.web.help
      ucc_units: [UCC-078, UCC-081, UCC-082]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind for the row. Bare /web is help/autocomplete only and
      # a non-executing help entry (UI_Command_Catalog.md:1026, assistant-chat-design.md section 5.2),
      # view state with no owner result.
      response_kind: local_projection
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: none  # non-executing help entry; the wiring row envelope carries no owner input
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the help entry is chat-surface bound; no selected thread is a blocked state. Canon
      # names no row-specific disabled set.
      aliases: []
    - command_id: cmd.chat.stop
      ucc_units: [UCC-083, UCC-076, UCC-080]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind for the row. Stop records chat_run.cancel_requested,
      # sends cancel to the active model/tool/subagent leases and waits the cancel grace before
      # chat_run.cancelled or cancel_timeout (assistant-chat-design.md section 4), an owner run
      # action; /cancel resolves internally to it before dispatch (UI_Command_Catalog.md:1105).
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "FABLE row payload (UI_Command_Catalog.md:8664); overlay UCC-077..UCC-083 required identity thread_id (always)"
        run_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "FABLE row payload run_id? (UI_Command_Catalog.md:8664); UCC-230 envelope common optional run_id restated optional"
        assistant_turn_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "FABLE row payload assistant_turn_id? (UI_Command_Catalog.md:8664)"
        stop_reason_code:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 64}
          provenance: gap
          gap_note: >-
            The FABLE row requires stop_reason_code (UI_Command_Catalog.md:8664) but no canon defines
            its values. JUDGMENT: opaque string token, bounds are a JUDGMENT; alternative: a closed
            enum once an owner fixes the stop-reason vocabulary.
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "FABLE row payload idempotency_key (UI_Command_Catalog.md:8664); UCC-230 envelope common optional idempotency_key restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatStopResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, degraded]
      # JUDGMENT: Stop becomes disabled when a run completes and no next message is queued
      # (assistant-chat-design.md section 4), a blocked state; degraded covers the
      # cancel_timeout/cancel_grace degradation path. The FABLE row's own error codes are a subset
      # of this narrowed set.
      aliases: []
  results:
    ChatWebOperationResultV1:
      fields:
        web_operation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the operation id the activity/provenance cards key on (UCC-079 operation cards); canon names no result field"}
        sources_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "large sources material dereferenced on demand (UCC-079)"}
        content_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "large content material dereferenced on demand (UCC-079)"}
        map_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "map material for crawl/map results (UCC-079)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_web_* rows)"}
    ChatStopResultV1:
      fields:
        thread_id: {type: id, required: true, default: none, provenance: canon, source: "FABLE row result fields (UI_Command_Catalog.md:8664)"}
        stopped_ref: {type: ref, required: false, default: none, provenance: canon, source: "FABLE row result stopped_ref? (UI_Command_Catalog.md:8664)"}
        resumable: {type: boolean, required: true, default: none, provenance: canon, source: "FABLE row result resumable (UI_Command_Catalog.md:8664)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the chat.response_stop_requested receipt the FABLE row binds (UI_Command_Catalog.md:8664)"}
```

### ACD-640 - Chat Vision Bridge Command Payload Definitions

```yaml
plan_unit_id: ACD-640
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the cmd.chat.vision_bridge.* commands that UI_Command_Catalog
  UCC-101 registers (DL-333 resolution 9b; ACD-425 is the control-surface requirement). The
  definitions block below gives each active command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability, command_kind and aliases; the strict schema overlay keeps the common envelope and
  the closed code sets. The seven rows state no payload fields anywhere: every argument or result
  field below except the overlay's image_ref identity is provenance gap, and the source-class
  vocabulary stays the row's five prose classes until an owner fixes canonical tokens.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible vision bridge controls in Assistant Chat.
depends_on: [UCC-230, UCC-101, ACD-425, T-165, RAP-035, PS-121, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-640 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - command_kind equals the catalog's UCC-101 table where it states one; error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5 (resolution 9b minted the family)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md sections 2.3, 5 and 7"
preserved_exact_tokens: [cmd.chat.vision_bridge.select_source, cmd.chat.vision_bridge.pick_recent_screenshot, cmd.chat.vision_bridge.inspect, cmd.chat.vision_bridge.rerun, cmd.chat.vision_bridge.copy_description, cmd.chat.vision_bridge.attach_result, cmd.chat.vision_bridge.manage_permission]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default and never choose an ambiguous recent screenshot silently (UCC-101).
  - Do not present the non-vision model's answer as if it directly saw the image when it consumed a bridge-derived description (UCC-101, ACD-425).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md, Plans/Permissions_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-640
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.vision_bridge.select_source
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21291
      response_kind: owner_operation
      args:
        source_class:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 64}
          provenance: gap
          gap_note: >-
            The row allows five source classes - current-turn attachment, selected artifact,
            project file allowed by FileSafe, clipboard image, recent OS screenshot
            (UI_Command_Catalog.md:21291) - but no canon names the field or fixes canonical tokens
            for the classes. JUDGMENT: source_class as an opaque token, one of those five classes;
            alternative: a closed enum once an owner fixes the spellings. A project-file source
            still carries FileSafe and artifact permissions (UCC-101 negative constraints).
      owner_request: none                              # no typed owner request or wiring schema exists yet
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      # JUDGMENT: vision_bridge_available false (UI_Command_Catalog.md:21291) is not_configured;
      # canon names no other disabled state for this row.
      aliases: []
    - command_id: cmd.chat.vision_bridge.pick_recent_screenshot
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21292
      response_kind: owner_operation
      args: {}                                          # the picker chooses; an ambiguous recent screenshot is never chosen silently (UI_Command_Catalog.md:21292), so no input names one
      owner_request: none                              # no typed owner request or wiring schema exists yet
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeSelectResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]
      # JUDGMENT: vision_bridge_available false is not_configured and
      # recent_screenshot_access_allowed false (UI_Command_Catalog.md:21292) is permission_required.
      aliases: []
    - command_id: cmd.chat.vision_bridge.inspect
      ucc_units: [UCC-101]
      command_kind: navigation_wrapper                  # canon: UI_Command_Catalog.md:21293
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The overlay lists image_ref? for UCC-101..UCC-105 and the row opens the description for
            the bridge result with its source image or artifact link (UI_Command_Catalog.md:21293);
            precondition vision_bridge_result_present makes the source subject mandatory per UCC-230
            identity rule, but no canon names the bridge-result identity field. JUDGMENT: image_ref
            binds the inspected result to its source image or artifact.
      owner_request: none                              # opens the inspect view; no typed owner request exists
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required]
      # JUDGMENT: vision_bridge_result_present false (UI_Command_Catalog.md:21293) is a blocked
      # state; vision_bridge_available false is not_configured.
      aliases: []
    - command_id: cmd.chat.vision_bridge.rerun
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21294
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row reruns "on the same source" (UI_Command_Catalog.md:21294); precondition
            vision_bridge_result_present makes the source subject mandatory per UCC-230 identity
            rule, but no canon names the field. JUDGMENT: image_ref carries the same source.
        question:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: gap
          gap_note: >-
            The row reruns "with the user's question" (UI_Command_Catalog.md:21294) but names no
            field. JUDGMENT: question, matching the row's label 'Rerun With A Question'; the
            max_length bound is likewise a JUDGMENT.
      owner_request: none                              # no typed owner request or wiring schema exists yet
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeRerunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, permission_required]
      # JUDGMENT: vision_bridge_result_present false is a blocked state, permission_allowed false
      # (UI_Command_Catalog.md:21294) is permission_required, vision_bridge_available false is
      # not_configured.
      aliases: []
    - command_id: cmd.chat.vision_bridge.copy_description
      ucc_units: [UCC-101]
      command_kind: shell_view                          # canon: UI_Command_Catalog.md:21295
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row copies the derived description of the present bridge result
            (UI_Command_Catalog.md:21295); precondition vision_bridge_result_present makes the
            source subject mandatory per UCC-230 identity rule, but no canon names the field.
            JUDGMENT: image_ref binds the copied description to its source image or artifact.
      owner_request: none                              # clipboard copy; no typed owner request exists
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required]
      # JUDGMENT: vision_bridge_result_present false (UI_Command_Catalog.md:21295) is a blocked
      # state; vision_bridge_available false is not_configured.
      aliases: []
    - command_id: cmd.chat.vision_bridge.attach_result
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21296
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row attaches the bridge result of the present source (UI_Command_Catalog.md:21296);
            precondition vision_bridge_result_present makes the source subject mandatory per UCC-230
            identity rule, but no canon names the field. JUDGMENT: image_ref binds the attached
            result to its source image or artifact.
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-230 envelope common optional thread_id, carried when the attach target is the current turn of a thread; the row's target is 'the current turn or run' (UI_Command_Catalog.md:21296) with no target field named"
      owner_request: none                              # no typed owner request or wiring schema exists yet
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeAttachResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required]
      # JUDGMENT: attach_target_available false (UI_Command_Catalog.md:21296) is a blocked state;
      # vision_bridge_available false is not_configured. The attachment stays labelled
      # bridge-derived (ACD-425).
      aliases: []
    - command_id: cmd.chat.vision_bridge.manage_permission
      ucc_units: [UCC-101]
      command_kind: navigation_wrapper                  # canon: UI_Command_Catalog.md:21297
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row opens the remembered always-accept image permission in its Permissions owner
            (PS-121, UI_Command_Catalog.md:21297) scoped by project, user/account identity, source
            class, destination provider/account, provider-family policy, tool id and
            sensitivity/redaction class (UCC-101 preserved tokens), but no canon names a payload
            field; the permission record is inspectable and revocable without passing an image.
            JUDGMENT: optional image_ref narrows the view to one source's rule.
      owner_request: none                              # opens the Permissions owner view; no typed owner request exists
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: remembered_vision_permission_present false (UI_Command_Catalog.md:21297) is a
      # blocked state; canon names no other disabled state for this row.
      aliases: []
  results:
    VisionBridgeSelectResultV1:
      fields:
        source_class: {type: string, required: true, default: none, provenance: gap, gap_note: "the class of the source now selected and shown; mirrors the source_class gap"}
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the selected source image or artifact"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_select_source / _pick_recent_screenshot)"}
    VisionBridgeRerunResultV1:
      fields:
        description_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the new bridge-derived description artifact; ACD-425 requires the artifact, provider/model used and freshness state to show"}
        provider_model: {type: string, required: false, default: none, provenance: gap, gap_note: "the provider/model used, disclosed per ACD-425; no canon names the field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_rerun)"}
    VisionBridgeAttachResultV1:
      fields:
        attachment_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the bridge-derived attachment created in the current turn or run"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_attach_result)"}
```
