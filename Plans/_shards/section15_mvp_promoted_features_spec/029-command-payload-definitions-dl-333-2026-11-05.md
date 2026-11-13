# Shard 029: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L13172-L16668

Source SHA256: `c8c272c2affb4b2766d863f72a2baaee6f6d7e32feee1df180961a0819fc331e`

---

## Command payload definitions (DL-333, 2026-11-05)

### SMPFS-328 - Browser command payload definitions

```yaml
plan_unit_id: SMPFS-328
unit_type: command_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Typed payload definitions for the browser commands that UI_Command_Catalog UCC-061..UCC-065 register
  (DL-333). The definitions block below gives each of the 22 concrete cmd.browser.* rows its args, owner
  request and owner result in pm.command_payload_definitions.v1. The catalog keeps ids, labels, events and
  aliases; the strict schema overlay (UCC-230) keeps the common envelope and the closed code sets. The
  envelope's optional thread_id binding on capture rows stays the overlay's common optional field; only
  cmd.browser.share_with_agent narrows it to required, as its catalog row states it unadorned. Canon does
  not type the open rows' target, the DevTools mode and dock values, or agent_share_scope; each is marked
  provenance gap and left open for the compile review rather than invented.
  Shared conventions of the definitions block: its row cites are the browser command table
  (UI_Command_Catalog.md:825-846), whose Payload column is history under DL-333 resolution 10 and stays the
  command-row authority for names. Every wiring row (Wiring_Matrix.production.json entries catalog.browser_*)
  names BrowserActionRequestV2 and BrowserActionResultV2 (Plans/section15_browser_program_contracts.schema.json).
  The table states no command_kind and no disabled reasons for these rows; only cmd.browser.open_devtools has a
  kind cell, navigation_wrapper, in the row its canonical id takes over (UI_Command_Catalog.md:15658, :19026).
  CV-360's placement fields go only on the routes its open-routes table lists (UI_Command_Catalog.md:18314-18334):
  open_workspace_preview and focus_browser_tab.
  BrowserActionRequestV2 requires a closed browser_action whose action_type enum names no share, revoke-share,
  takeover, agent-control, detach, DevTools, dock, promotion, session-recovery or session-tab reveal action. The
  definitions of share_with_agent, revoke_share_with_agent, take_over, pause_agent, let_agent_continue,
  stop_agent_keep_browser, detach_browser_tab, open_devtools, toggle_devtools_dock, focus_browser_tab,
  promote_to_normal_browsing, reopen, retry and keep_closed keep the wired request, map the command onto no action_type, never turn share or revoke into a
  capture, and record the conflict in their owner_request judgments; a handler refuses them with
  handler_unavailable until the browser owner settles the request (DL-341).
gui_related: true
gui_classification_reason: Defines the arguments of user-visible browser, preview and DevTools commands.
split_recommended: false
depends_on: [UCC-230, UCC-061, UCC-062, UCC-063, UCC-064, UCC-065, UCC-202, CV-333, CV-360, DL-180, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every cmd.browser.* command that UCC-230 assigns to SMPFS-328 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_payload_definitions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens:
  - cmd.browser.open_workspace_preview
  - cmd.browser.open_detached_preview
  - cmd.browser.focus_browser_tab
  - cmd.browser.detach_browser_tab
  - cmd.browser.open_devtools
  - cmd.browser.toggle_devtools_dock
  - cmd.browser.pick_element_for_chat
  - cmd.browser.add_selection_to_chat
  - cmd.browser.add_selection_screenshot_to_chat
  - cmd.browser.add_selection_full_screenshot_to_chat
  - cmd.browser.add_screenshot_to_chat
  - cmd.browser.add_full_screenshot_to_chat
  - cmd.browser.share_with_agent
  - cmd.browser.revoke_share_with_agent
  - cmd.browser.take_over
  - cmd.browser.pause_agent
  - cmd.browser.let_agent_continue
  - cmd.browser.stop_agent_keep_browser
  - cmd.browser.promote_to_normal_browsing
  - cmd.browser.reopen
  - cmd.browser.retry
  - cmd.browser.keep_closed
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not reintroduce target_editor_panel_id or target_editor_group_id as args; placement travels in CV-360's fields (DL-180).
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: SMPFS-328
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.browser.open_workspace_preview
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:825); common optional field narrowed to required per UCC-230 envelope rule"
        target:
          type: url
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names target with no type (UI_Command_Catalog.md:825); the aliases row reads it as
            "browser session target" (:18306), the launcher rows open "an address" through it, and
            Commands_System.md:8925-8926 has Open port reuse it "with a server/environment-authoritative URL".
            JUDGMENT: url covers the address opens; alternatives not settled by canon are a union with the
            overlay's preview_subject_ref or Primitive:RouteTarget.
        workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:825); token also preserved in UCC-063"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23626-23629) names this route: where is auto, tab, panel, right, down or a panel id; default auto; an id that names no panel reads as auto. Open-routes table UI_Command_Catalog.md:18330; DL-180 amendment :850"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; preview only for kinds with a preview tab; no default stated"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user; an agent always opens in the background"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            No catalog row states a command_kind; the aliases table records it a kept id, open route with
            normalization.kind wrapper (UI_Command_Catalog.md:18306), and the open-routes table lists it as
            an open route (:18330). navigation_wrapper is chosen from the closed set (Contracts_V0.md:1902-1905)
            because the row opens a route; Contracts_V0 maps no normalization value to a command_kind.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row (UI_Command_Catalog.md:825) states no disabled reasons; unsupported stands for a host
            without the browser runtime.
        - key: omitted:target_editor_panel_id
          choice: omitted
          gap_note: >-
            The row's Payload column (history, UI_Command_Catalog.md:825) still lists target_editor_panel_id?,
            while the DL-180 amendment (:850) says it no longer selects a home panel and CV-360
            (Contracts_V0.md:23646) says no route carries another placement field; the definition leaves it
            out, and the SMPFS-328 negative constraint keeps it out.
        - key: omitted:target_editor_group_id
          choice: omitted
          gap_note: >-
            Same as target_editor_panel_id: listed in the history Payload column (UI_Command_Catalog.md:825),
            retired as home placement by the DL-180 amendment (:850) and CV-360.
    - command_id: cmd.browser.open_detached_preview
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:826); common optional field narrowed to required per UCC-230 envelope rule"
        target:
          type: url
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same untyped target as cmd.browser.open_workspace_preview (UI_Command_Catalog.md:826); the url
            choice and its alternatives stay open as there.
        source_workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:826); token also preserved in UCC-063"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            No catalog row states a command_kind; the row opens a target in a detached browser
            (UI_Command_Catalog.md:826), an open like open_workspace_preview but outside the home panels.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: omitted:where
          choice: omitted
          gap_note: >-
            CV-360 (Contracts_V0.md:23626-23627) and its open-routes table (UI_Command_Catalog.md:18314-18334)
            do not list this route, the DL-180 amendment (:850) moves only open_workspace_preview onto CV-360,
            and the row opens a detached browser (:826), not a home-panel tab; so no CV-360 placement field is
            carried.
        - key: omitted:mode
          choice: omitted
          gap_note: "Same reason as where: CV-360 does not list this route."
        - key: omitted:by
          choice: omitted
          gap_note: "Same reason as where: CV-360 does not list this route."
        - key: omitted:background
          choice: omitted
          gap_note: "Same reason as where: CV-360 does not list this route."
    - command_id: cmd.browser.focus_browser_tab
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:827); overlay UCC-061..065 identity browser_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18330)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18330"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18330"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18330"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: >-
            No catalog row states a command_kind; the row is "layout/UI state only" (UI_Command_Catalog.md:827)
            and the open-routes table calls it layout-only (:18330).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5145) but requires a closed browser_action whose
            action_type enum (:377) has no action that reveals the tab hosting a browser session (select_tab
            selects a page tab inside the session), and neither the request nor the closed action arguments
            (:423) has a field for where, mode, by or background, a layout/UI state change
            (UI_Command_Catalog.md:827). The definition keeps the wired request and the catalog row's args, maps
            the command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it
            with handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.detach_browser_tab
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:828); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.session.state_changed
            (UI_Command_Catalog.md:828), a session-state mutation like reopen and retry. The DL-180 amendment
            (:850, UCC-203) says it has no producer on a panel tab because no tab pops out; the row stays for
            lineage.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime and
            for a panel tab, which cannot pop out (UCC-203).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no detach action; its tab primitives list_tabs, create_tab, select_tab and
            close_tab do not detach the tab that hosts a session (UI_Command_Catalog.md:828). The definition keeps
            the wired request and the catalog row's args, maps the command onto no action_type, and a handler sends
            no BrowserActionRequestV2 for it and refuses it with handler_unavailable until the browser owner settles
            the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.open_devtools
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:829); overlay UCC-061..065 identity browser_session_id?"
        mode:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names mode? with no values (UI_Command_Catalog.md:829). The named request contract
            BrowserDevToolsOpenRequest (UI_Command_Catalog.md:15658, :19026) is placed at
            Plans/browser_capture_contracts.schema.json by Commands_System.md:6486, and that file does not exist
            in Plans, so the DevTools mode vocabulary is still open. JUDGMENT: string holds the value; an enum
            needs the owner to name the modes.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:BrowserDevToolsOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases:
        - {command_id: cmd.browser.devtools.open, kind: alias, source: "UCC-202 and the duplicate-ids table (UI_Command_Catalog.md:19026); UCC-063 stale_retired_dispositions"}
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The canonical id takes the preconditions browser_runtime_available && !protected_auth_browser &&
            devtools_policy_allows (UI_Command_Catalog.md:15658, :19026) but no disabled reasons; unsupported
            stands for a missing browser runtime or the protected authentication browser, and
            permission_required for the DevTools policy.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            Canon conflict: the wiring rows catalog.browser_open_devtools and
            assistant.redesign.cmd.browser_devtools_open name BrowserActionRequestV2, while the catalog
            (UI_Command_Catalog.md:15658, :19026) and Commands_System.md:6486 name BrowserDevToolsOpenRequest,
            which has no schema in Plans. The definition takes the wiring row, the only one that resolves.
            The wired request also requires a closed browser_action
            (Plans/section15_browser_program_contracts.schema.json:5114, :5216), whose action_type enum (:377) has
            no DevTools action (console and network take query refs and open no DevTools), and its closed action
            arguments (:423) have no field for mode (UI_Command_Catalog.md:829). As recorded on
            cmd.browser.share_with_agent, the definition maps the command onto no action_type, and a handler sends
            no BrowserActionRequestV2 for it and refuses it with handler_unavailable until the browser owner settles
            the request (DL-341 open_owner_questions).
        - key: owner_result
          choice: local:BrowserDevToolsOpenResultV1
          gap_note: >-
            Canon conflict: the catalog (UI_Command_Catalog.md:15658, :19026) and Commands_System.md:6486
            name RouteResult, and both RouteResult schemas in Plans are fixed to other commands
            (Plans/assistant_chat_contracts.schema.json#/$defs/RouteResult to cmd.chat.goal.open_editor,
            Plans/collaborative_workflows_contracts.schema.json#/$defs/RouteResult to cmd.chat.crew_auto.open_config);
            the wiring rows name BrowserActionResultV2; Section15's Browser Action Table gives this action's
            output fields (Section15_MVP_Promoted_Features_Spec.md:9953).
            The definition takes Section15's fields, because the wiring rows' own effect_contract says "Owner
            typed result and projection under Plans/Section15_MVP_Promoted_Features_Spec.md"; the owner should
            pick one contract.
    - command_id: cmd.browser.toggle_devtools_dock
      ucc_units: [UCC-063, UCC-061, UCC-062]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:830); overlay UCC-061..065 identity browser_session_id?"
        dock:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names dock with no type or values (UI_Command_Catalog.md:830). JUDGMENT: string
            holds the value; alternatives are an enum of dock positions or a boolean toggle, and the owner
            must name the dock vocabulary before an enum can be written.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: >-
            No catalog row states a command_kind; the row is "layout/UI state only" (UI_Command_Catalog.md:830).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime or
            DevTools.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no DevTools or dock action, and neither the request nor the closed action
            arguments (:423) has a field for dock, a layout/UI state change (UI_Command_Catalog.md:830). The
            definition keeps the wired request and the catalog row's args, maps the command onto no action_type, and
            a handler sends no BrowserActionRequestV2 for it and refuses it with handler_unavailable until the
            browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.pick_element_for_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:831); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.context_captured
            (UI_Command_Catalog.md:831), a capture the composer receives.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime and
            permission_required for the capture permission.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5160).
            Canon does not say which closed action_type (:377) this capture uses. Choice: snapshot, the enum's
            page capture; the element or selection is not a field of the row (UI_Command_Catalog.md:831). The
            optional thread_id has no field in the request or the closed action arguments
            (Plans/section15_browser_program_contracts.schema.json:423) and stays on the
            UICommand envelope (DL-341 open_owner_questions).
    - command_id: cmd.browser.add_selection_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:832); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.context_captured
            (UI_Command_Catalog.md:832), a capture the composer receives.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; the same choice as pick_element_for_chat (browser runtime,
            capture permission).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5136).
            Canon does not say which closed action_type (:377) this capture uses. Choice: snapshot, the enum's
            page capture; the element or selection is not a field of the row (UI_Command_Catalog.md:832). The
            optional thread_id has no field in the request or the closed action arguments
            (Plans/section15_browser_program_contracts.schema.json:423) and stays on the
            UICommand envelope (DL-341 open_owner_questions).
    - command_id: cmd.browser.add_selection_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:833); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: clip
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'clip' (UI_Command_Catalog.md:833)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.context_captured and
            runtime_artifact.screenshot (UI_Command_Catalog.md:833), a capture.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; the same choice as pick_element_for_chat (browser runtime,
            capture permission). Until native capture exists the handler fails closed with
            handler_unavailable (capture event rules, UI_Command_Catalog.md:853).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5135).
            Canon does not say which closed action_type (:377) this capture uses. Choice: screenshot. Neither the
            request nor the closed action arguments (:423) has a field for the row's scope:'clip'
            (UI_Command_Catalog.md:833) or for its optional thread_id, which stays on the UICommand envelope; the
            definition keeps the row's scope arg, and how it reaches the owner is asked of the browser owner
            (DL-341 open_owner_questions). Until native capture exists the handler fails closed with
            handler_unavailable (UI_Command_Catalog.md:853).
    - command_id: cmd.browser.add_selection_full_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:834); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: full
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'full' (UI_Command_Catalog.md:834)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.context_captured and
            runtime_artifact.screenshot (UI_Command_Catalog.md:834), a capture.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; the same choice as pick_element_for_chat (browser runtime,
            capture permission).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5134).
            Canon does not say which closed action_type (:377) this capture uses. Choice: screenshot. Neither the
            request nor the closed action arguments (:423) has a field for the row's scope:'full'
            (UI_Command_Catalog.md:834) or for its optional thread_id, which stays on the UICommand envelope; the
            definition keeps the row's scope arg, and how it reaches the owner is asked of the browser owner
            (DL-341 open_owner_questions). Until native capture exists the handler fails closed with
            handler_unavailable (UI_Command_Catalog.md:853).
    - command_id: cmd.browser.add_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:835); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: clip
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'clip' (UI_Command_Catalog.md:835)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits runtime_artifact.screenshot
            (UI_Command_Catalog.md:835), a capture.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; the same choice as pick_element_for_chat (browser runtime,
            capture permission).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5133).
            Canon does not say which closed action_type (:377) this capture uses. Choice: screenshot. Neither the
            request nor the closed action arguments (:423) has a field for the row's scope:'clip'
            (UI_Command_Catalog.md:835) or for its optional thread_id, which stays on the UICommand envelope; the
            definition keeps the row's scope arg, and how it reaches the owner is asked of the browser owner
            (DL-341 open_owner_questions). Until native capture exists the handler fails closed with
            handler_unavailable (UI_Command_Catalog.md:853).
    - command_id: cmd.browser.add_full_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:836); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: full
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'full' (UI_Command_Catalog.md:836)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits runtime_artifact.screenshot
            (UI_Command_Catalog.md:836), a capture.
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; the same choice as pick_element_for_chat (browser runtime,
            capture permission).
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            The wired BrowserActionRequestV2 lists this command (Plans/section15_browser_program_contracts.schema.json:5132).
            Canon does not say which closed action_type (:377) this capture uses. Choice: screenshot. Neither the
            request nor the closed action arguments (:423) has a field for the row's scope:'full'
            (UI_Command_Catalog.md:836) or for its optional thread_id, which stays on the UICommand envelope; the
            definition keeps the row's scope arg, and how it reaches the owner is asked of the browser owner
            (DL-341 open_owner_questions). Until native capture exists the handler fails closed with
            handler_unavailable (UI_Command_Catalog.md:853).
    - command_id: cmd.browser.share_with_agent
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:837); overlay UCC-061..065 identity browser_session_id?"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload names thread_id unadorned (UI_Command_Catalog.md:837); common optional field narrowed to required per UCC-230 envelope rule"
        agent_share_scope:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The overlay lists agent_share_scope? as row-group identity for capture/share/takeover commands
            (UI_Command_Catalog.md:8853) but no canon types it or gives values, and no concrete row payload
            carries it. JUDGMENT: string holds the value pending an owner decision on a scope enum; whether
            the share row carries it at all stays open.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:BrowserShareWithAgentResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row updates browser-session share state and emits
            browser.context_shared (UI_Command_Catalog.md:837, :855; SMPFS-089).
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime and
            permission_required for the share permission.
        - key: owner_result
          choice: local:BrowserShareWithAgentResultV1
          gap_note: >-
            The wiring row catalog.browser_share_with_agent names BrowserActionResultV2 as result_schema_ref,
            while Section15's Browser Action Table gives this action its own output fields
            (Section15_MVP_Promoted_Features_Spec.md:9950). The definition takes the owner doc's fields, the
            more specific of the two; the owner should say whether they travel inside BrowserActionResultV2.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            Canon conflict. The wiring row catalog.browser_share_with_agent names BrowserActionRequestV2, whose
            command_id enum lists this command (Plans/section15_browser_program_contracts.schema.json:5130), but the
            request requires action (:5114), the closed browser_action record (:5216, :363), whose required
            action_type enum (:377) holds page and tab primitives such as navigate, click, screenshot, list_tabs and
            bookmark_capture and no share, revoke-share, takeover or agent-control action. Neither the request nor
            the closed action arguments (:423) has a field for the share's required thread_id
            (UI_Command_Catalog.md:837). Sharing updates browser-session share state only and creates no capture
            event (UI_Command_Catalog.md:855; Section15_MVP_Promoted_Features_Spec.md:748), so no capture action
            (screenshot, snapshot or bookmark_capture) may stand in for it. Side taken: the definition keeps the
            wired request as the owner request, since it is the request the dispatch boundary names, and the catalog
            row's args, and maps the command onto no action_type and no action argument. Until the browser owner
            gives the request a share-state action that carries the thread, or names a different owner request, a
            handler sends no BrowserActionRequestV2 for this command and refuses it with handler_unavailable. Not
            settled here; DL-341 open_owner_questions asks the owner.
    - command_id: cmd.browser.revoke_share_with_agent
      ucc_units: [UCC-064, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:838); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row updates browser-session share state and emits
            browser.context_share_revoked (UI_Command_Catalog.md:838, :855; SMPFS-089).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
            Revoking needs no permission beyond the share it removes.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no revoke-share action, and its closed action arguments (:423) have no field
            for the row's thread_id? (UI_Command_Catalog.md:838). Revoking updates browser-session share state only
            and is not a capture (UI_Command_Catalog.md:855; Section15_MVP_Promoted_Features_Spec.md:748), so no
            capture action may stand in for it. The definition keeps the wired request and the catalog row's args,
            maps the command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses
            it with handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.take_over
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:839); overlay UCC-061..065 identity browser_session_id?"
        takeover_choice:
          type: enum
          values: [pause_agent, let_agent_continue, stop_agent_keep_browser]
          required: true
          default: none
          provenance: canon
          source: "catalog row payload takeover_choice:'pause_agent'|'let_agent_continue'|'stop_agent_keep_browser' (UI_Command_Catalog.md:839); tokens preserved in UCC-065"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row changes the takeover state and emits
            browser.session.takeover_state_changed (UI_Command_Catalog.md:839).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no takeover or agent-control action, and neither the request nor the closed
            action arguments (:423) has a field for the required takeover_choice (UI_Command_Catalog.md:839). A page
            primitive would not carry the choice between pause_agent, let_agent_continue and
            stop_agent_keep_browser. The definition keeps the wired request and the catalog row's args, maps the
            command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.pause_agent
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:840); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row changes the takeover state and emits
            browser.session.takeover_state_changed (UI_Command_Catalog.md:840).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.take_over: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no agent-control action; the row changes the takeover state
            (UI_Command_Catalog.md:840). The definition keeps the wired request and the catalog row's args, maps the
            command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.let_agent_continue
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:841); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row changes the takeover state and emits
            browser.session.takeover_state_changed (UI_Command_Catalog.md:841).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.take_over: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no agent-control action; the row changes the takeover state
            (UI_Command_Catalog.md:841). The definition keeps the wired request and the catalog row's args, maps the
            command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.stop_agent_keep_browser
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:842); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row ends the agent run and emits
            browser.session.takeover_state_changed and dev.session.stopped (UI_Command_Catalog.md:842).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.take_over: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no agent-control action; the row ends the agent run and keeps the browser
            (UI_Command_Catalog.md:842). The definition keeps the wired request and the catalog row's args, maps the
            command onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.promote_to_normal_browsing
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:843); overlay UCC-061..065 identity browser_session_id?"
        target_workspace_tab_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload target_workspace_tab_id? (UI_Command_Catalog.md:843)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.session.promoted
            (UI_Command_Catalog.md:843), a session-state change.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no promotion action, and neither the request nor the closed action arguments
            (:423) has a field for target_workspace_tab_id? (UI_Command_Catalog.md:843). The definition keeps the
            wired request and the catalog row's args, maps the command onto no action_type, and a handler sends no
            BrowserActionRequestV2 for it and refuses it with handler_unavailable until the browser owner settles
            the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.reopen
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:844); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.session.state_changed
            (UI_Command_Catalog.md:844), a session-state change.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no session recovery action. Its reload, create_tab and close_tab act on a
            page or tab, while this row answers the recovery banner for the session (UI_Command_Catalog.md:844), so
            none stands for it. The definition keeps the wired request and the catalog row's args, maps the command
            onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.retry
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:845); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row emits browser.session.state_changed
            (UI_Command_Catalog.md:845), a session-state change.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no session recovery action. Its reload acts on a page, and the same
            command_id enum lists cmd.browser.reload as a separate command (:5167), while this row answers the
            recovery banner for the session (UI_Command_Catalog.md:845), so reload does not stand for it. The
            definition keeps the wired request and the catalog row's args, maps the command onto no action_type, and
            a handler sends no BrowserActionRequestV2 for it and refuses it with handler_unavailable until the
            browser owner settles the request (DL-341 open_owner_questions).
    - command_id: cmd.browser.keep_closed
      ucc_units: [UCC-065, UCC-061, UCC-062]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:846); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog row states a command_kind; the row closes the session and emits browser.session.closed
            (UI_Command_Catalog.md:846).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            As recorded on cmd.browser.share_with_agent: the wired BrowserActionRequestV2 lists this command
            (Plans/section15_browser_program_contracts.schema.json:5130) but requires a closed browser_action whose
            action_type enum (:377) has no session recovery action. Its close_tab acts on a tab, while this row
            answers the recovery banner by keeping the session closed (UI_Command_Catalog.md:846), so close_tab does
            not stand for it. The definition keeps the wired request and the catalog row's args, maps the command
            onto no action_type, and a handler sends no BrowserActionRequestV2 for it and refuses it with
            handler_unavailable until the browser owner settles the request (DL-341 open_owner_questions).
  results:
    BrowserDevToolsOpenResultV1:
      fields:
        devtools_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9953 (Browser Action Table output fields); no typed contract exists. The owner_result judgment of cmd.browser.open_devtools records the RouteResult and BrowserActionResultV2 sides of the canon conflict"}
        boundary_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9953; no typed contract exists"}
        opened_at_utc: {type: timestamp, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9953; no typed contract exists"}
    BrowserShareWithAgentResultV1:
      fields:
        share_receipt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950 (Browser Action Table output fields); no typed contract exists"}
        target_agent_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950; no typed contract exists"}
        artifact_refs:
          type: list
          item: {type: ref}
          required: true
          default: none
          provenance: gap
          gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950; item type ref by suffix; no typed contract exists"
```

### SMPFS-329 - Terminal, dev-session and catalog command payload definitions

```yaml
plan_unit_id: SMPFS-329
unit_type: command_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Typed payload definitions for the terminal, dev-session and catalog lifecycle commands that
  UI_Command_Catalog UCC-066..UCC-072 register (DL-333). The definitions block below gives each active
  row its args, owner request and owner result in pm.command_payload_definitions.v1. The catalog keeps
  ids, labels, events and aliases; the strict schema overlay (UCC-230) keeps the common envelope and the
  closed code sets. Canon leaves the rerun replay reference and same-session flag, the restart/replace
  policy and command-replay hint (Restart session's profile is fixed, so it takes no profile hint), the dev
  start mode and target, and the catalog item_type spellings and version format untyped; each is marked provenance gap and left open for the compile review rather than invented.
  Shared conventions of the definitions block: terminal row cites are the terminal command table
  (UI_Command_Catalog.md:880-888, whose payload column is history under DL-333 resolution 10) and the kept
  terminal commands table (UCC-201, UI_Command_Catalog.md:18747-18759), which states each terminal
  command_kind: open navigation_wrapper (:18751), show shell_view (:18752), focus shell_view (:18753), rerun
  domain_action (:18755), restart_replace domain_action (:18756) and clear_scrollback domain_action (:18759).
  Every terminal wiring row names TerminalActionRequestV2 and TerminalActionResultV2
  (Plans/shared_runtime_command_contracts.schema.json); the dev and catalog wiring rows (catalog.dev_*,
  catalog.catalog_*) name no request_schema_ref or result_schema_ref. The dev and catalog tables
  (UI_Command_Catalog.md:930-935, :949-951) state no command_kind and no disabled reasons. CV-360's placement
  fields go only on the routes its open-routes table lists (UI_Command_Catalog.md:18314-18334):
  terminal.open, terminal.show, terminal.focus and the three dev.show_* routes.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible terminal, dev-session and catalog commands.
split_recommended: false
depends_on: [UCC-230, UCC-066, UCC-067, UCC-068, UCC-069, UCC-070, UCC-071, UCC-072, CV-333, CV-360, DL-181, DL-333]
unblocks: []
acceptance_criteria:
  - Every terminal, dev and catalog command that UCC-230 assigns to SMPFS-329 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_payload_definitions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens:
  - cmd.terminal.open
  - cmd.terminal.show
  - cmd.terminal.rerun
  - cmd.terminal.focus
  - cmd.terminal.restart_replace
  - cmd.terminal.clear_scrollback
  - cmd.dev.start_session
  - cmd.dev.stop_session
  - cmd.dev.restart_session
  - cmd.dev.show_output
  - cmd.dev.show_problems
  - cmd.dev.show_ports
  - cmd.catalog.install_item
  - cmd.catalog.update_item
  - cmd.catalog.remove_item
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not reintroduce terminal_pane_id, termination_policy or the retired detach and pane rows as args (DL-181).
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: SMPFS-329
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.terminal.open
      ucc_units: [UCC-067, UCC-061, UCC-066, UCC-068, UCC-069]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:880); kept-commands row 'Reveals the tab of the exact terminal_session_id' (UI_Command_Catalog.md:18751); overlay UCC-066..072 identity terminal_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23626-23629) names this route: where is auto, tab, panel, right, down or a panel id; default auto. The kept-commands row says it carries CV-360's placement fields (UI_Command_Catalog.md:18751); open-routes table :18331"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false; an agent's open lands as a background tab (UCC-066, UI_Command_Catalog.md:5114; :18751)"
        origin_surface:
          type: string
          required: false
          default: none
          provenance: canon
          source: "catalog row payload names optional origin_surface (UI_Command_Catalog.md:880)"
        reveal_origin_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog row names an optional "reveal-origin" ref (UI_Command_Catalog.md:880) without a fixed
            arg spelling; reveal-origin-terminal lineage is Section15_MVP_Promoted_Features_Spec.md:241.
            JUDGMENT: reveal_origin_ref, type ref; the exact field name is not locked by canon.
        linkback_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog row names optional "/linkback refs" (UI_Command_Catalog.md:880) without a fixed arg
            spelling. JUDGMENT: linkback_ref, type ref; the exact field name is not locked by canon.
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:880) nor the kept-commands row (:18751) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
    - command_id: cmd.terminal.show
      ucc_units: [UCC-067, UCC-061, UCC-066, UCC-068, UCC-069]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:881); kept-commands row (UI_Command_Catalog.md:18752); overlay UCC-066..072 identity terminal_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18331)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18331"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18331"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18331"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:881) nor the kept-commands row (:18752) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
    - command_id: cmd.terminal.rerun
      ucc_units: [UCC-067, UCC-069]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: >-
            catalog row payload (UI_Command_Catalog.md:882); UCC-067 acceptance: "Rerun preserves
            terminal_session_id only when same-session execution is explicitly requested and available"
            (UI_Command_Catalog.md:5191); overlay UCC-066..072 identity terminal_session_id?
        command_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon says "command replay payload plus terminal session launch context" (UI_Command_Catalog.md:882)
            without naming the replay field; the overlay's command_ref? is the row-group identity candidate.
            JUDGMENT: command_ref, type ref, optional; whether rerun can instead carry a literal command
            string stays open.
        same_session:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon says "same-session flag or new-session request" (UI_Command_Catalog.md:882) without naming
            or typing the field. JUDGMENT: same_session boolean; the alternative is a mode enum
            [same_session, new_session]. What absence means is a canon conflict, left to the owner: UCC-067's
            acceptance (UI_Command_Catalog.md:5191) preserves terminal_session_id "only when same-session
            execution is explicitly requested", so absent would mean a new session, while row :882 ("new
            terminal launch only for an explicit new-session request"), the kept-commands row (:18755,
            "same-session rerun is a new invocation in the bound session; a new session only on explicit
            request") and Commands_System.md:8928-8929 make a same-session rerun the default.
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:882) nor the kept-commands row (:18755) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
    - command_id: cmd.terminal.focus
      ucc_units: [UCC-067, UCC-068]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload terminal_session_id? (UI_Command_Catalog.md:884); kept-commands row (UI_Command_Catalog.md:18753); overlay UCC-066..072 identity terminal_session_id?"
        dev_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload dev_session_id? (UI_Command_Catalog.md:884, :18753); overlay UCC-066..072 identity dev_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18331)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18331"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18331"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18331"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases:
        - {command_id: cmd.terminal.focus_session, kind: alias, source: "UCC-202 duplicate-ids table (UI_Command_Catalog.md:19028: cmd.terminal.focus is canonical, cmd.terminal.focus_session its alias); :8621; UCC-230 non_definition_tokens (DL-341)"}
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:884) nor the kept-commands row (:18753) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
        - key: omitted:terminal_pane_id
          choice: omitted
          gap_note: >-
            The terminal row's payload column (history, UI_Command_Catalog.md:884) still lists
            terminal_pane_id?, while the kept-commands row says "the terminal_pane_id? argument retires with
            panes" (:18753, DL-181) and the SMPFS-329 negative constraint keeps it out. The row's
            "/last-relevant fallback mode" is the kept row's "else the most recently focused terminal tab", a
            behavior with no arg.
    - command_id: cmd.terminal.restart_replace
      ucc_units: [UCC-067, UCC-068]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:888); kept-commands row (UI_Command_Catalog.md:18756); overlay UCC-066..072 identity terminal_session_id?"
        policy:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names a "/restart/replace policy" (UI_Command_Catalog.md:888) with no values; the
            kept-commands row fixes the behavior (a new session in the same tab, same folder and profile,
            UI_Command_Catalog.md:18756) without a policy vocabulary. JUDGMENT: string holds the value
            pending an owner enum.
        command_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names "command replay or shell profile hints" (UI_Command_Catalog.md:888) without a field
            shape. JUDGMENT: command_ref, type ref, optional, for the replay hint; the overlay's command_ref?
            identity is the candidate name. The hint is never replayed automatically: a restart records the
            newly resolved environment without automatic command replay (SMPFS-164 acceptance criterion,
            Section15_MVP_Promoted_Features_Spec.md:11666-11669).
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:888) nor the kept-commands row (:18756) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
        - key: omitted:profile_ref
          choice: omitted
          gap_note: >-
            The kept-commands row fixes Restart session as a new session in the same tab, same folder and
            profile (UI_Command_Catalog.md:18756), with no branch that changes the profile; the older terminal
            row's "shell profile hints" (:888) sits in a payload column its lineage pointer calls history
            (:890). So the definition takes no profile arg. The owner request,
            Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2, requires
            profile_ref and cwd_root_ref; the handler fills both from the bound session's existing profile and
            folder, never from the caller.
    - command_id: cmd.terminal.clear_scrollback
      ucc_units: [UCC-072]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "kept-commands row (UI_Command_Catalog.md:18759); the terminal and dev rules 'cmd.terminal.clear_scrollback preserves runtime identity' (UI_Command_Catalog.md:960); UCC-072 'Terminal clear, close, and dev reveal commands preserve runtime identity and dev_session_id ownership' (UI_Command_Catalog.md:5486); overlay UCC-066..072 identity terminal_session_id?"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The kept-commands row (UI_Command_Catalog.md:18759) states no disabled reasons; unsupported stands
            for a host without a terminal runtime.
    - command_id: cmd.dev.start_session
      ucc_units: [UCC-070]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:930); common optional field narrowed to required per UCC-230 envelope rule"
        workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:930)"
        mode:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names mode with no type or values (UI_Command_Catalog.md:930); no owner doc
            types the dev start mode. JUDGMENT: string holds the value; an enum needs the owner to name the
            modes (for example a run/debug/watch vocabulary) before it can be written.
        target:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names target? with no type (UI_Command_Catalog.md:930). JUDGMENT: string holds
            the value; alternatives are a url, a path or an enum of dev targets, none chosen by canon.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionStartResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The dev table states no command_kind; the row starts a dev session and emits dev.session.started
            (UI_Command_Catalog.md:930), a runtime mutation.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.dev.stop_session
      ucc_units: [UCC-070]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:931); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The dev table states no command_kind; the row stops a dev session and emits dev.session.stopping
            and dev.session.stopped (UI_Command_Catalog.md:931), a runtime mutation.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.dev.restart_session
      ucc_units: [UCC-070]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:932); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The dev table states no command_kind; the row restarts a dev session and emits
            dev.session.restarting and dev.session.started (UI_Command_Catalog.md:932), a runtime mutation.
            It is distinct from the retired terminal spelling cmd.terminal.restart_session (UCC-202,
            UI_Command_Catalog.md:19027).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.dev.show_output
      ucc_units: [UCC-070, UCC-072]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:933); overlay UCC-066..072 identity dev_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18333), and its wiring entry catalog.dev_show_output resolves it \"into the Output tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_output"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_output"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_output"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevToolTabOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            The dev table states no command_kind; the row is "layout/UI state only" (UI_Command_Catalog.md:933)
            and the open-routes table says it reveals or opens the output tool tab by its kind affinity
            (:18333), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:933) and the wiring row
            catalog.dev_show_output names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18333); the
            definition carries that return as the owner result (local:DevToolTabOpenResultV1) rather than a
            local projection with no result.
        - key: owner_result
          choice: local:DevToolTabOpenResultV1
          gap_note: >-
            No typed contract holds CV-360's open return; the local result restates its five fields, and the
            fields whose presence on a refused open CV-360 does not state are gap.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.dev.show_problems
      ucc_units: [UCC-070, UCC-072]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:934); overlay UCC-066..072 identity dev_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18333), and its wiring entry catalog.dev_show_problems resolves it \"into the Problems tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_problems"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_problems"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_problems"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevToolTabOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            The dev table states no command_kind; the row is "layout/UI state only" (UI_Command_Catalog.md:934)
            and the open-routes table says it reveals or opens the problems tool tab by its kind affinity
            (:18333), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:934) and the wiring row
            catalog.dev_show_problems names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18333); the
            definition carries that return as the owner result (local:DevToolTabOpenResultV1) rather than a
            local projection with no result.
        - key: owner_result
          choice: local:DevToolTabOpenResultV1
          gap_note: >-
            No typed contract holds CV-360's open return; the local result restates its five fields, and the
            fields whose presence on a refused open CV-360 does not state are gap.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.dev.show_ports
      ucc_units: [UCC-070, UCC-072]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:935); overlay UCC-066..072 identity dev_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18333), and its wiring entry catalog.dev_show_ports resolves it \"into the Ports tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_ports"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_ports"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18333; wiring entry catalog.dev_show_ports"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevToolTabOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            The dev table states no command_kind; the row is "layout/UI state only" (UI_Command_Catalog.md:935)
            and the open-routes table says it reveals or opens the ports tool tab by its kind affinity
            (:18333), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:935) and the wiring row
            catalog.dev_show_ports names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18333); the
            definition carries that return as the owner result (local:DevToolTabOpenResultV1) rather than a
            local projection with no result.
        - key: owner_result
          choice: local:DevToolTabOpenResultV1
          gap_note: >-
            No typed contract holds CV-360's open return; the local result restates its five fields, and the
            fields whose presence on a refused open CV-360 does not state are gap.
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a project without a dev-session
            runtime.
    - command_id: cmd.catalog.install_item
      ucc_units: [UCC-071]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names item_type (UI_Command_Catalog.md:949); SMPFS-055 gives the item kinds
            only in prose ("commands, skills, plugins/hooks, themes, and MCP configs",
            Section15_MVP_Promoted_Features_Spec.md:4386) with no token spellings, so no enum values are
            written. JUDGMENT: string holds the value until the owner fixes the spellings.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:949)"
        version:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names version? (UI_Command_Catalog.md:949); no canon fixes the version string
            format. JUDGMENT: unconstrained string pending an owner format (semver or catalog-native).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The catalog table states no command_kind; the row changes catalog state and emits
            catalog.install.started and catalog.install.completed (UI_Command_Catalog.md:949).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for an item kind the host cannot install.
    - command_id: cmd.catalog.update_item
      ucc_units: [UCC-071]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same prose-only item kinds as cmd.catalog.install_item (UI_Command_Catalog.md:950;
            Section15_MVP_Promoted_Features_Spec.md:4386); no enum spellings written.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:950)"
        target_version:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names target_version? (UI_Command_Catalog.md:950); no canon fixes the version
            string format. JUDGMENT: unconstrained string pending an owner format.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The catalog table states no command_kind; the row changes catalog state and emits
            catalog.update.started and catalog.update.completed (UI_Command_Catalog.md:950).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for an item kind the host cannot update.
    - command_id: cmd.catalog.remove_item
      ucc_units: [UCC-071]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same prose-only item kinds as cmd.catalog.install_item (UI_Command_Catalog.md:951;
            Section15_MVP_Promoted_Features_Spec.md:4386); no enum spellings written.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:951)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            The catalog table states no command_kind; the row changes catalog state and emits
            catalog.remove.started and catalog.remove.completed (UI_Command_Catalog.md:951).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for an item kind the host cannot remove.
  results:
    DevSessionStartResultV1:
      fields:
        dev_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the started dev session; UCC-070 preserves the token but no typed contract exists"}
        status: {type: string, required: true, default: none, provenance: gap, gap_note: "lifecycle status of the start; values not fixed by canon (dev.session.started is the event, UI_Command_Catalog.md:930)"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
    DevSessionLifecycleResultV1:
      fields:
        dev_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the stopped or restarted dev session; no typed contract exists"}
        status: {type: string, required: true, default: none, provenance: gap, gap_note: "lifecycle status; values not fixed by canon (dev.session.stopped / dev.session.started are the events, UI_Command_Catalog.md:931-932)"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
    DevToolTabOpenResultV1:
      fields:
        ok: {type: boolean, required: true, default: none, provenance: canon, source: "CV-360 (Contracts_V0.md:23631): an open returns { ok, panel_tab_id, panel_id, created, reason }; acceptance (:23652): a refused open returns ok false"}
        panel_tab_id: {type: id, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23631) names panel_tab_id as the panel tab id; it does not say whether a refused open carries it, so it is optional here"}
        panel_id: {type: id, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23631) names panel_id; it does not say whether a refused open carries it, so it is optional here"}
        created: {type: boolean, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23632): created is false when an open tab was revealed and true when a tab was added; its presence on a refused open is unstated, so it is optional here"}
        reason: {type: string, required: true, nullable: true, default: none, provenance: canon, source: "CV-360 (Contracts_V0.md:23632-23633): reason is null on success, else unknown_kind, not_ready or the route's own refusal (an open set of values, so string)"}
    CatalogItemLifecycleResultV1:
      fields:
        item_type: {type: string, required: true, default: none, provenance: gap, gap_note: "echoes the row's item_type; spellings still prose-only (SMPFS-055)"}
        item_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the catalog item; no typed contract exists"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
```


### SMPFS-310 — browser.context_captured owner contract

```yaml
plan_unit_id: SMPFS-310
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_captured 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/browser_context_captured-search.json. Reused sources: Plans/assistant-chat-design.md:508,894-900, Plans/storage-plan.md:1154-1166, Plans/Section15_MVP_Promoted_Features_Spec.md:757, Plans/UI_Command_Catalog.md:824-846. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Assistant chat capture handoff for cmd.browser.pick_element_for_chat, cmd.browser.add_selection_to_chat and the two selection+screenshot commands (UCC-064). Resolve the explicitly selected thread first, else the owning chat surface (including hidden chat), else require visible explicit new-thread creation. Never automatically create a thread, choose a focused unrelated thread, or send. Only after the resolved composer has committed its typed pending chip may the capture outcome append. A missing writable target stays an explicit unresolved interaction with no chip/event success. Screenshot variants additionally require RAP-054 admission, real Project/run/attempt and original artifact custody; otherwise handler_unavailable without capture/append/checkpoint. Protected auth content refuses before capture.
  Scope: actual ordinary browser namespace = kind(project/app), project_id(real or null only for app), user_id, computer_id, profile_id; all scope fields are required. EventRecord.project_id equals scope.project_id; never fabricate a Project for app chat. scope_key is SHA-256 of canonical MessagePack scope map, sorted by UTF-8 keys. A resolved thread must belong to that actual namespace; optional command thread_id becomes required resolved thread_id in the successful durable capture. AuthBrowserSession is forbidden.
  Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)} from the immutable OriginalBrowserTransitionSource.original_operation_id; Project scope: sha256(canonical MessagePack array ["browser.context_captured", "1.0.0", actual scope map with UTF-8 sorted keys, thread_id, chip_id]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_browser_context_captured.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.browser_context_captured.v1@1.0.0, operating as Assistant chat browser capture history reader, reads only browser.context_captured@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.browser_context_captured:{scope_key}, value Plans/ds15_browser_context_captured_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Chip value binding: Plans/ds15_browser_capture_chip_v2.schema.json governs the typed browser entry inside composer_prep_state.v1:{thread_id}. No browser-owned composer or separate chip storage family. Migration validates actual thread/namespace and preserves sibling entries and draft bytes; unresolved legacy chip stays visibly unavailable, never silently reassigned. Append/passive replay cannot recreate a chip that the user sent or removed. Read/serialization rechecks current permissions, source deletion and chip blocked/expired/scrubbed/revoked state; unavailable chips may remain visible but never serialize as successful attachments.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-327 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Application source binding: resolve the authentic original application Server and immutable capture-operation identity from Plans/application_workflow_sources.schema.json#/$defs/OriginalBrowserTransitionSource, interface owner.browser.transition.application@1.0.0. Its server_id and original_operation_id (the owner_operation_id in CV-366) yield the exact UTF-8 lowercase-hex key application@1:{hex(server_id)}:{hex(owner_operation_id)}. Resolve this source at admission, retain its identity and original outcome with the composer chip under SP-286, and compare immutable original source/thread/actual ordinary user/Computer/profile/BrowserSession joins on retry. A current Server/focus/timestamp cannot remint it. Project scope retains its separately specified canonical MessagePack recipe unchanged. scope_key remains only a checkpoint namespace hash, never the application envelope idempotency key. Reject raw hashes and wrong/missing Server or original-operation identity. Schema-shaped source fixtures establish no native owner authority.
  Round 2 exact-family boundaries for browser.context_captured: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for browser.context_captured: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax. Browser source authentication: independently resolve accepted_source_ref to retained owner bytes (static bank browser_owner_records; native owner still NOT_RUN), validate closed Plans/ds15_browser_owner_record.schema.json, and recompute every CV-366 accepted_source semantic digest. The closed preimage is {schema_id, schema_version, scope, record: complete selected semantic record, identity: {server_id: scope.server_id, original_operation_id: record.original_operation_id or null, workspace_id: record.workspace_id or null}}. Input/output cover the full selected BrowserWorkspaceApplicationV1 including controller evidence; accepted_source covers the separate complete owner record; source_sha256 covers the complete OriginalBrowserTransitionSource with only source_sha256 omitted. These are semantic commitments, not SP-337 addresses or physical record digests. Owner evidence binds the independently resolved accepted record by ref, recomputed hash and exact method/revision/generation. Every stage must be accepted and join its original operation, owner method, request/result and evidence to that record. Original input/output must agree on scope/profile/workspace/session and retained source. The complete capture payload, including provenance_ref, must match the owner record; current composer observations also join provenance_ref. A source copy or well-shaped digest grants no authority.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority. The independently retained Browser owner record additionally binds the complete original_input_body and original_output_body, omitting only their derived controller_evidence. Full input/output semantic digests include that evidence; no other workspace field can be changed behind a recomputed hash.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-310
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-311 — dev.session.started owner contract

```yaml
plan_unit_id: SMPFS-311
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.started 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_started-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service handles cmd.dev.start_session and successful replacement launch under cmd.dev.restart_session. After actual managed workflow launch/attachment succeeds, commit running workflow outcome with the same aggregate dev_session_id and next workflow_revision. previous_state is created or restarting; workflow_state is running. No event on failed launch and no fabricated dap_session_id for a non-debug workflow.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.started", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_started.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_started.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.started@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_started:{project_id}, value Plans/ds15_dev_session_started_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.started: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.started: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-311
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-312 — dev.session.stopping owner contract

```yaml
plan_unit_id: SMPFS-312
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.stopping 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_stopping-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service accepts cmd.dev.stop_session. Commit the accepted stopping intent from running or restarting with workflow_state stopping and next workflow_revision before terminal stop publication. This is managed workflow intent, not proof a PTY or DAP process terminated.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.stopping", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_stopping.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_stopping.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.stopping@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_stopping:{project_id}, value Plans/ds15_dev_session_stopping_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.stopping: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.stopping: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-312
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-313 — dev.session.stopped owner contract

```yaml
plan_unit_id: SMPFS-313
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.stopped 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_stopped-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service records the actual stop/detach outcome after cmd.dev.stop_session or cmd.browser.stop_agent_keep_browser. Managed resources must be settled under their own owners before workflow_state stopped; previous_state may be stopping, running or restarting for the already specified direct browser keep-open path. The BrowserSession may remain open. Never turn a workflow stop into a fabricated terminal exit or DAP termination.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.stopped", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_stopped.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_stopped.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.stopped@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_stopped:{project_id}, value Plans/ds15_dev_session_stopped_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.stopped: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.stopped: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-313
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-314 — dev.session.restarting owner contract

```yaml
plan_unit_id: SMPFS-314
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.restarting 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_restarting-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service accepts cmd.dev.restart_session from running or stopped. Commit workflow_state restarting and next workflow_revision for the accepted operation before replacement launch. Preserve dev_session_id aggregate continuity; a concrete replacement PTY/DAP gets its owner-resolved identity. Restart intent is not successful replacement launch; dev.session.started records that later outcome separately.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.restarting", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_restarting.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_restarting.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.restarting@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_restarting:{project_id}, value Plans/ds15_dev_session_restarting_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.restarting: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.restarting: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-314
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-315 — preview.session.started owner contract

```yaml
plan_unit_id: SMPFS-315
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.started 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_started-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner consumes cmd.orchestrator.preview_open after resolving the document/artifact subject and actually creating/loading the runtime. Commit runtime_state loading with actual preview_session_id and revisions before publication. A reveal or placement change of an existing live session emits no new start. Restore reconstructs a fresh verified runtime, never treats cached running as liveness.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.started", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_started.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_started.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.started@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_started:{project_id}, value Plans/ds15_preview_session_started_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.started: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.started: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-315
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-316 — preview.session.refreshed owner contract

```yaml
plan_unit_id: SMPFS-316
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.refreshed 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_refreshed-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner commits an actual refresh/hot-reload outcome for a refreshable visible subject (FileManager sections 13/14.6). A browser-backed ordinary session uses production cmd.browser.reload (UCC-117), preserving BrowserSession identity/class and recovery identity. Non-browser refresh uses the existing FileManager subject refresh/hot-reload action, producer hook filemanager.preview_refresh; this is an internal producer label, not a new public command. Never dispatch a browser command without a browser subject. Emit only after the owner commits the new preview_revision and ready output, not watcher notification or queue acceptance. Preserve or replace preview_session_id according to the existing continuity tuple; resolve actual runtime after source changes, never guess from the old tab.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.refreshed", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_refreshed.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_refreshed.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.refreshed@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_refreshed:{project_id}, value Plans/ds15_preview_session_refreshed_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.refreshed: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.refreshed: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-316
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-317 — preview.session.stopped owner contract

```yaml
plan_unit_id: SMPFS-317
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.stopped 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_stopped-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner consumes cmd.orchestrator.preview_stop and records actual runtime closure as runtime_state closed after managed resources settle. UI restore intent stays subject-owned; stop does not change build/run state. A closed/historical session cannot stop again on replay; browser overlay closure, where required, remains BrowserRuntimeService-owned.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.stopped", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_stopped.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_stopped.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.stopped@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_stopped:{project_id}, value Plans/ds15_preview_session_stopped_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.stopped: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.stopped: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-317
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-318 — catalog.install.started owner contract

```yaml
plan_unit_id: SMPFS-318
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.install.started 1.0.0 — newly authored owner contract, prepared without admission. Independent search of current top-level Plans Markdown/JSON and scripts Python found required names at UI_Command_Catalog.md:936 and existing install routing at Wiring_Matrix.md:448, but no exact versioned producer/consumer/checkpoint/identity/withdrawal binding; full per-family negative evidence: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix7/catalog_install_started-search.json. Reuse Section15 §3.13, Commands §6.6/CS-066 and Shared Runtime §4.5. DL-045 authorizes only these missing technical bindings.
  Producer: catalog lifecycle controller records the existing subsystem owner beginning actual installation work after current consent/policy/source validation, with the immutable owner start outcome committed; dispatch, admission, queued or accepted-only command state is insufficient. Keep cmd.catalog.install_item as the existing route; item_type is command, skill, plugin, hook, theme or mcp_config. No update/remove admission, active-item/deferred outcome or deletion choice is made. Existing owners resolve item, version, source and actual namespace; an unavailable or ambiguous owner outcome stays unavailable without a fabricated install success.
  Scope: actual Project or application namespace as selected by the existing item owner, including actual user/Computer/profile. Project ids are real; application project_id is null, never synthetic. Project partition is Storage project~base64url. Scope key for checkpoint namespace is SHA-256 of canonical MessagePack scope map in UTF-8 key order. Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.install.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id come from the immutable existing owner operation source, never focus/time. Compare caller-supplied CV-317 semantic body only on retries, excluding Storage-assigned sequence/timestamps; changed semantic bytes conflict with no new effect.
  Payload: exact closed Plans/ds15_catalog_install_started.schema.json; bounded refs only, no executable/config/command bodies, local paths, secrets or installation content. outcome_ref and optional installation_ref resolve the existing owner original transition. Context catalog_owner_payload is the immutable resolved owner outcome, not caller assertion; phase and all fields must match. SP-337 keeps content above 16384 bytes in owner-resolved payload refs, never oversized metadata.
  Ordering: adopt SP-286 / CV-339 full-value original outcome, append and first AppendReceipt. Commit existing owner outcome, freeze original event, single writer append/dedupe, retain original receipt/value, then publish. Missing outcome or coherent backup closure is unavailable; no repeat install on retry or replay. Current writes/retries use dedupe_by_idempotency_key and refuse projector_replay_only as replay_only_not_appendable. Retained supported replay-only history remains readable after authenticating original transition, outcome, source and full-value commitment, independently of current live install state. Current permission, owner authorization, deletion/sharing and withdrawal still fence disclosure.
  Consumer: reader.ds15.catalog_install_started.v1@1.0.0, Catalog installation history reader for only catalog.install.started@1.0.0, adopts SP-278 by name and DL-076 nine-field token. Checkpoint key projector.checkpoint.ds15.catalog_install_started:{scope_key}, value Plans/ds15_catalog_install_started_checkpoint.schema.json. Capture CURRENT-selected complete global range and live redb_snapshot_id; persist only nine-field durable token, never the live snapshot. Scan every global row, resolve each matching event original custody and join id/type/scope/partition/Storage sequence. CAS complete previous checkpoint and new checkpoint in one redb transaction; gaps/omissions, changed token/snapshot/source/access or any contradictory original preserve previous. through_sequence_id is globally scanned frontier; last_event_id is last verified matching event. No checkpoint before first match; zero-match suffix retains prior last event. Rebuild requires complete retained prefix and fresh current access.
  Compatibility and withdrawal: supported exact 1.0.0 event/reader only; unknown version/field refuses before effects/checkpoint. Withdrawal fences new admissions at committed source frontier, drains only original admitted outcomes/receipts, then fences reader CAS/marks checkpoint withdrawn. Reinstall requires authorization and a complete fresh rebuild; no replay dispatch. Original source/log/receipt backup and redaction/deletion owners remain authoritative. Authority inputs use closed exact-family context schema and exact boolean/bounded integer types before interpretation; malformed values refuse with zero effects.
  Retention: event and checkpoint retention_policy_ref=PENDING_RETENTION_DECISION; RT must choose between existing receipt/audit or telemetry classes; no policy, expiry or deletion is selected. Registry membership remains absent.
  Oracles: ATS-329 and own family fixtures in Plans/ds15_event_contract_fixtures.json, numeric fixtures and scripts/pm-ds15-event-contracts.py cover start/terminal source, false-success queue/admission refusals, semantic retry, full-value custody, Storage joins, replay-only history, permission/deletion, complete coverage/CAS, rebuild and writer/reader withdrawal. Native execution NOT_RUN; static preparation is no production admission.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-318
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-319 — catalog.install.completed owner contract

```yaml
plan_unit_id: SMPFS-319
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.install.completed 1.0.0 — newly authored owner contract, prepared without admission. Independent search of current top-level Plans Markdown/JSON and scripts Python found required names at UI_Command_Catalog.md:936 and existing install routing at Wiring_Matrix.md:448, but no exact versioned producer/consumer/checkpoint/identity/withdrawal binding; full per-family negative evidence: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix7/catalog_install_completed-search.json. Reuse Section15 §3.13, Commands §6.6/CS-066 and Shared Runtime §4.5. DL-045 authorizes only these missing technical bindings.
  Producer: catalog lifecycle controller records the existing subsystem owner effective installation commit. For an executable installation this is verified activation/ready under Shared Runtime §4.5; commands, skills, plugins/hooks, themes and MCP configs use their own canonical install commit. Never substitute download, queue acceptance, a UI acknowledgement or a universal executable machine for that owner outcome. Keep cmd.catalog.install_item as the existing route; item_type is command, skill, plugin, hook, theme or mcp_config. No update/remove admission, active-item/deferred outcome or deletion choice is made. Existing owners resolve item, version, source and actual namespace; an unavailable or ambiguous owner outcome stays unavailable without a fabricated install success.
  Scope: actual Project or application namespace as selected by the existing item owner, including actual user/Computer/profile. Project ids are real; application project_id is null, never synthetic. Project partition is Storage project~base64url. Scope key for checkpoint namespace is SHA-256 of canonical MessagePack scope map in UTF-8 key order. Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.install.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id come from the immutable existing owner operation source, never focus/time. Compare caller-supplied CV-317 semantic body only on retries, excluding Storage-assigned sequence/timestamps; changed semantic bytes conflict with no new effect.
  Payload: exact closed Plans/ds15_catalog_install_completed.schema.json; bounded refs only, no executable/config/command bodies, local paths, secrets or installation content. outcome_ref and optional installation_ref resolve the existing owner original transition. Context catalog_owner_payload is the immutable resolved owner outcome, not caller assertion; phase and all fields must match. SP-337 keeps content above 16384 bytes in owner-resolved payload refs, never oversized metadata.
  Ordering: adopt SP-286 / CV-339 full-value original outcome, append and first AppendReceipt. Commit existing owner outcome, freeze original event, single writer append/dedupe, retain original receipt/value, then publish. Missing outcome or coherent backup closure is unavailable; no repeat install on retry or replay. Current writes/retries use dedupe_by_idempotency_key and refuse projector_replay_only as replay_only_not_appendable. Retained supported replay-only history remains readable after authenticating original transition, outcome, source and full-value commitment, independently of current live install state. Current permission, owner authorization, deletion/sharing and withdrawal still fence disclosure.
  Consumer: reader.ds15.catalog_install_completed.v1@1.0.0, Catalog installation history reader for only catalog.install.completed@1.0.0, adopts SP-278 by name and DL-076 nine-field token. Checkpoint key projector.checkpoint.ds15.catalog_install_completed:{scope_key}, value Plans/ds15_catalog_install_completed_checkpoint.schema.json. Capture CURRENT-selected complete global range and live redb_snapshot_id; persist only nine-field durable token, never the live snapshot. Scan every global row, resolve each matching event original custody and join id/type/scope/partition/Storage sequence. CAS complete previous checkpoint and new checkpoint in one redb transaction; gaps/omissions, changed token/snapshot/source/access or any contradictory original preserve previous. through_sequence_id is globally scanned frontier; last_event_id is last verified matching event. No checkpoint before first match; zero-match suffix retains prior last event. Rebuild requires complete retained prefix and fresh current access.
  Compatibility and withdrawal: supported exact 1.0.0 event/reader only; unknown version/field refuses before effects/checkpoint. Withdrawal fences new admissions at committed source frontier, drains only original admitted outcomes/receipts, then fences reader CAS/marks checkpoint withdrawn. Reinstall requires authorization and a complete fresh rebuild; no replay dispatch. Original source/log/receipt backup and redaction/deletion owners remain authoritative. Authority inputs use closed exact-family context schema and exact boolean/bounded integer types before interpretation; malformed values refuse with zero effects.
  Retention: event and checkpoint retention_policy_ref=PENDING_RETENTION_DECISION; RT must choose between existing receipt/audit or telemetry classes; no policy, expiry or deletion is selected. Registry membership remains absent.
  Oracles: ATS-329 and own family fixtures in Plans/ds15_event_contract_fixtures.json, numeric fixtures and scripts/pm-ds15-event-contracts.py cover start/terminal source, false-success queue/admission refusals, semantic retry, full-value custody, Storage joins, replay-only history, permission/deletion, complete coverage/CAS, rebuild and writer/reader withdrawal. Native execution NOT_RUN; static preparation is no production admission.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-319
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-320 — browser.context_shared deck-2 owner contract

```yaml
plan_unit_id: SMPFS-320
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_shared 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-433 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.c, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Keep a separate sharing grant for each recipient chat. Sharing with another chat keeps earlier grants. Stop sharing with a named chat removes only that grant; Stop sharing without a chat removes every grant for the selected browser session. Sharing itself never copies page contents into chat.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:830-831`; `MAIN:Plans/UI_Command_Catalog.md:843-846`; `DS15:reports/event-authority-20261104/DS15.md:91-94`; `evidence:reviews/DS15-sol/REVIEW.md:55-61`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:99-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_shared-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-433 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Browser session sharing controller for cmd.browser.share_with_agent commits one recipient-chat grant. The resolved recipient must have the same actual subject scope. Preserve every prior grant, including grants to other chats. There is one grant per recipient chat; an already-held grant retains its existing grant identity. This records sharing authority only; no page body, screenshot, DOM, selection, capture chip, message send or browser.context_captured effect follows.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["browser.context_shared", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_browser_context_shared.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.browser_context_shared.v1@1.0.0 is the exact operating browser.context_shared history reader and reads only browser.context_shared@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.browser_context_shared:{scope_key}, closed value Plans/ds15_browser_context_shared_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event retention adopts DL-401 G10 / RP-CHAT-THREAD-LIFETIME@1.0.0 from the landed Plans/Decision_Log.md entry on origin/main: the payload thread_id is the governing recipient chat, including No project. At most 250000 per chat then linked successor; no records dropped, holds and chat deletion deadlines apply. The policy object is on Plans/storage_value_registry.json's retention_policies list. Checkpoint retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: What retention and deletion rule governs the scope-wide browser.context_shared reader checkpoint when its source events belong to different recipient chats? Current chat permissions and deletion fences apply even while this assignment is pending. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact browser.context_shared section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_shared. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-433
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_shared
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-433
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_shared-search.json
preserved_exact_tokens:
- SMPFS-320
- browser.context_shared
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-321 — browser.context_share_revoked deck-2 owner contract

```yaml
plan_unit_id: SMPFS-321
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_share_revoked 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-433 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.c, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Keep a separate sharing grant for each recipient chat. Sharing with another chat keeps earlier grants. Stop sharing with a named chat removes only that grant; Stop sharing without a chat removes every grant for the selected browser session. Sharing itself never copies page contents into chat.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:830-831`; `MAIN:Plans/UI_Command_Catalog.md:843-846`; `DS15:reports/event-authority-20261104/DS15.md:91-94`; `evidence:reviews/DS15-sol/REVIEW.md:55-61`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:99-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_share_revoked-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-433 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Browser session sharing controller for cmd.browser.revoke_share_with_agent commits removal. Normalize an omitted recipient to thread_id=null in this event; a named recipient removes only that grant, leaving all other grants intact; null removes every grant for the selected browser_session_id. Other browser sessions remain untouched. This revokes sharing authority only and never creates a capture or page-content record.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["browser.context_share_revoked", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_browser_context_share_revoked.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.browser_context_share_revoked.v1@1.0.0 is the exact operating browser.context_share_revoked history reader and reads only browser.context_share_revoked@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.browser_context_share_revoked:{scope_key}, closed value Plans/ds15_browser_context_share_revoked_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: DL-401 G10 assigns this event family to Chat, but an omitted-chat revoke can affect several recipient chats. Event retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: For one browser.context_share_revoked record that removes every session grant across several chats, which chat or combination of chat deletion/hold lifetimes governs that record? Do not silently select a chat, split one command into new event behavior, or keep it indefinitely. Checkpoint retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: What retention and deletion rule governs the scope-wide browser.context_share_revoked reader checkpoint when its source events belong to different recipient chats? Current chat permissions and deletion fences apply even while this assignment is pending. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact browser.context_share_revoked section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_share_revoked. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-433
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_share_revoked
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-433
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_share_revoked-search.json
preserved_exact_tokens:
- SMPFS-321
- browser.context_share_revoked
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-322 — catalog.update.started deck-2 owner contract

```yaml
plan_unit_id: SMPFS-322
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.update.started 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-434 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.d, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, keep the current verified version and queue the update until the next safe reload or start allowed by the component that uses it. Save completion only when the new version takes effect. You keep using the old version until it is safe to switch.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `DS15:reports/event-authority-20261104/DS15.md:97-100`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_started-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-434 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.update_item, records the existing item owner beginning actual update work at its permitted safe reload/start. Queuing preserves the verified previous_version and is not a started or completed transition. The original source must prove the owner permits this boundary and stage=applying; effective_version remains previous_version until activation.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["open_edit_session", "component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.update.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_update_started.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_update_started.v1@1.0.0 is the exact operating catalog.update.started history reader and reads only catalog.update.started@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_update_started:{scope_key}, closed value Plans/ds15_catalog_update_started_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.update.started section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.started. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-434
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.started
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-434
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_started-search.json
preserved_exact_tokens:
- SMPFS-322
- catalog.update.started
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-323 — catalog.update.completed deck-2 owner contract

```yaml
plan_unit_id: SMPFS-323
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.update.completed 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-434 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.d, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, keep the current verified version and queue the update until the next safe reload or start allowed by the component that uses it. Save completion only when the new version takes effect. You keep using the old version until it is safe to switch.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `DS15:reports/event-authority-20261104/DS15.md:97-100`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_completed-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-434 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.update_item, records the existing item owner's verified effective update commit. Require stage=effective, target_version=effective_version, actual owner safe-reload/start proof and installed availability. Download, validation, queue acceptance, start, UI acknowledgement or merely selecting a target cannot produce completion.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["open_edit_session", "component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.update.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_update_completed.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_update_completed.v1@1.0.0 is the exact operating catalog.update.completed history reader and reads only catalog.update.completed@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_update_completed:{scope_key}, closed value Plans/ds15_catalog_update_completed_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.update.completed section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.completed. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-434
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.completed
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-434
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_completed-search.json
preserved_exact_tokens:
- SMPFS-323
- catalog.update.completed
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-324 — catalog.remove.started deck-2 owner contract

```yaml
plan_unit_id: SMPFS-324
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.remove.started 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-435 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.e, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, refuse removal until the person releases or disables every current use or saved reference. Keep the installed item available. A refused request is not completed and is never silently queued. You decide when to release its uses and try again.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_started-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-435 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.remove_item, records the existing item owner beginning actual removal after every current use and saved reference is released or disabled. Require stage=removing and no uses. A refused request keeps the installed item available, emits neither removal lifecycle event, queues nothing and requires an explicit later retry.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"], "theme": ["current_or_saved_theme"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.remove.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_remove_started.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_remove_started.v1@1.0.0 is the exact operating catalog.remove.started history reader and reads only catalog.remove.started@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_remove_started:{scope_key}, closed value Plans/ds15_catalog_remove_started_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.remove.started section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.started. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-435
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.started
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-435
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_started-search.json
preserved_exact_tokens:
- SMPFS-324
- catalog.remove.started
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-325 — catalog.remove.completed deck-2 owner contract

```yaml
plan_unit_id: SMPFS-325
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.remove.completed 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-435 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.e, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, refuse removal until the person releases or disables every current use or saved reference. Keep the installed item available. A refused request is not completed and is never silently queued. You decide when to release its uses and try again.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_completed-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-435 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.remove_item, records only the existing item owner's completed removal commit, stage=removed and installed_available=false. Every current use and saved reference must already be released or disabled. A refused, queued, merely accepted or in-progress request never publishes completion; no silent later removal.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"], "theme": ["current_or_saved_theme"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.remove.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_remove_completed.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_remove_completed.v1@1.0.0 is the exact operating catalog.remove.completed history reader and reads only catalog.remove.completed@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_remove_completed:{scope_key}, closed value Plans/ds15_catalog_remove_completed_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.remove.completed section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.completed. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-435
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.completed
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-435
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_completed-search.json
preserved_exact_tokens:
- SMPFS-325
- catalog.remove.completed
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-326 — tool.custom_headless.skipped deck-2 owner contract

```yaml
plan_unit_id: SMPFS-326
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  tool.custom_headless.skipped 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-436 landed in Plans/Decision_Log.md on origin/main, authored on origin/plans/ea-cards2-answers-20261105, presented deck item 4.f, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Save the notice the first time Doctor’s readiness check finds the setting for that optional custom browser tool absent for that Project. An earlier run with the setting present leaves the chance unused. Once issued, the notice never resets for configuration edits or removing/re-adding the setting. A clone or import gets a fresh chance only if it creates a separate new Project with its own saved ID. Restoring the same Project preserves whether the notice was already shown. If an older backup cannot prove that, do not guess and show a duplicate. Later checks still save their ordinary check result.
  Card **Sources:** `MAIN:Plans/newtools.md:498-511`; `DT:reports/event-authority-20261104/DT.md:272-273`; `evidence:reviews/DT-sol/REVIEW.md:118-122`; `evidence:reviews/DT-sol/REVIEW-cycle3.md:86-92`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:45-50`; `evidence:reviews/DT-sol/REVIEW-cycle4.md:93-103`; `evidence:reviews/DT-sol/REVIEW-cycle4.md:93-107`; `evidence:reviews/DT-sol/REVIEW-cycle5.md:7-7`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/tool_custom_headless_skipped-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-436 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Doctor readiness handler for tools.custom_headless in the actual Project configuration. Claim the Project's unused notice chance atomically with the original absent-check outcome; the first readiness check finding the setting absent is eligible, even after any earlier configured run. A present key, invalid-but-present setting, issued chance or unknown legacy backup state cannot emit this event. Once issued, edits and removal/re-addition never reset it. Clone/import gets an unused chance only under a separate newly saved Project ID; same-ID restoration preserves issued/unused evidence, and uncertain evidence suppresses a duplicate. Later checks still emit their ordinary doctor.custom_headless.checked result. This new contract supersedes only the withdrawal status in retired N2-218/SP-641/CV-661/ATS-321; those IDs remain retired and are not reused. DS15 owns this contract; DT cites it.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=project_only. Original event_id is allocated once and retained. Idempotency recipe: sha256(canonical MessagePack array ["tool.custom_headless.skipped", "1.0.0", actual project_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_tool_custom_headless_skipped.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100: raw JSON through loads_current_json, current_integer at every schema integer slot with that slot's own bounds, storage_uint64 for Storage sequence, generation and offset metadata, storage_value_bytes(EVENT_VALUE) for inline-size and identity-preimage bytes, full_value_commitment for CV-339 and the qualified JCS of the CV-317 projection, owner integer paths type-sensitive, before a new append. Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101 (sweep 2026-11-11): a retained reader or retry resolver first takes one selection from the one write receipt Storage sealed with that exact original (its Storage instance, original ref and CV-339 commitment), never from the Storage instance or family alone, where no custody or no receipt is the existing unavailable contract and more than one receipt or an uninstalled recipe is unsupported, never a fallback to the current or another recipe, and a new append takes the writer's own recipe without reading a receipt; it then resolves the original once through the shared RetainedDispatcher, whose sealed owner authenticates the fetched bytes by their CV-339 commitment and whose frozen verifier recomputes the original, so a coherently rewritten original refuses. Timestamps follow CV-1101 through the shared predicate: every format: date-time takes the EventRecord profile and the Storage-assigned EventRecord observed and persisted times take CV-253's storage_utc_z, for current inputs and retained originals alike; a skipped past format check authorizes no history. No new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.tool_custom_headless_skipped.v1@1.0.0 is the exact operating tool.custom_headless.skipped history reader and reads only tool.custom_headless.skipped@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.tool_custom_headless_skipped:{project_id}, closed value Plans/ds15_tool_custom_headless_skipped_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and derived checkpoint adopt DL-401 G14 / RP-OPERATIONAL-2555D@1.0.0: 2555 days from the original committed absent-check transition, unchanged 2000000/Project cap, only expired unheld/unreferenced history compacts, overflow fails closed, retries/recovery never reset the clock. The original Project readiness source preserves whether this Project's chance was consumed; it remains an active protected reference while needed to enforce DL-436 and travels in the coherent same-ID backup. Expiry or rebuilding a derived history checkpoint never makes an issued/unknown chance unused. No app-scope bucket or synthetic Project is introduced. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in Plans/storage-plan.md, landed on origin/main; those lines are byte-identical at origin/plans/ea-retention-cards2-20261105 commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact tool.custom_headless.skipped section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family tool.custom_headless.skipped. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
- DL-401
- DL-436
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family tool.custom_headless.skipped
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-436
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/tool_custom_headless_skipped-search.json
preserved_exact_tokens:
- SMPFS-326
- tool.custom_headless.skipped
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-244 - browser.session.created prepared semantic contract

```yaml
plan_unit_id: SMPFS-244
unit_type: interface_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly browser.session.created@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  BrowserRuntimeService commits the new manual session for cmd.browser.open_workspace_preview or cmd.browser.open_detached_preview,
  then records its creation. revision_before=0, revision_after=1; previous class, takeover and lifecycle plus before_record_ref
  are null, lifecycle_state=open and changed_fields=[created]. A later placement/capability change from the same
  command is a separate real change; creation itself is never repeated as state_changed.

  DL-405: each manual session is the manual face of exactly one Browser workspace. browser_session_state.v1 carries
  required workspace_id, joined to the genuine workspace on the exact storage, Home Server, Execution Host/Computer,
  Environment and Project-or-app scope. That workspace link is assigned once and is not a second workspace lifecycle.
  A single owner operation/change may append a manual session event or the corresponding Browser Program workspace/controller
  event, never both for the same change. A separate genuine workspace change remains separately governed by DL-046;
  it cannot be inferred from this session event. The five manual contracts do not add rows to browser_event_admission.json''s
  53-name census. browser.session.navigated and browser.session.resized are retired; Navigate/Reload retain their
  existing no-session-event behavior and the record retains current URL/viewport. Protected AuthBrowserSession never
  enters this persistence or history path.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/browser_session_created, exact Project logical
  schema_id pm.browser.session.created.payload.v1 and distinct application logical schema_id pm.browser.session.created.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalBrowserTransitionSource and BrowserSessionApplicationV1 / BrowserWorkspaceApplicationV1).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  browser.session.created is read by reader.browser.session.created.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- CV-332
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_smpfs-244
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.created
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SMPFS-245 - browser.session.state_changed prepared semantic contract

```yaml
plan_unit_id: SMPFS-245
unit_type: interface_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly browser.session.state_changed@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  BrowserRuntimeService records an actual existing manual-session change by the two preview-open commands, cmd.browser.detach_browser_tab,
  cmd.browser.reopen or cmd.browser.retry. The source owner identifies the changed_fields and immutable before/after
  record refs; navigation/reload alone do not create this event. Retry that merely returns the previous result emits
  nothing; a genuinely accepted recovery transition retains the same session/workspace identity. No event is inferred
  merely from changed URL/viewport observations.

  DL-405: each manual session is the manual face of exactly one Browser workspace. browser_session_state.v1 carries
  required workspace_id, joined to the genuine workspace on the exact storage, Home Server, Execution Host/Computer,
  Environment and Project-or-app scope. That workspace link is assigned once and is not a second workspace lifecycle.
  A single owner operation/change may append a manual session event or the corresponding Browser Program workspace/controller
  event, never both for the same change. A separate genuine workspace change remains separately governed by DL-046;
  it cannot be inferred from this session event. The five manual contracts do not add rows to browser_event_admission.json''s
  53-name census. browser.session.navigated and browser.session.resized are retired; Navigate/Reload retain their
  existing no-session-event behavior and the record retains current URL/viewport. Protected AuthBrowserSession never
  enters this persistence or history path.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/browser_session_state_changed, exact Project
  logical schema_id pm.browser.session.state_changed.payload.v1 and distinct application logical schema_id pm.browser.session.state_changed.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalBrowserTransitionSource and BrowserSessionApplicationV1 / BrowserWorkspaceApplicationV1).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  browser.session.state_changed is read by reader.browser.session.state_changed.history@1.0.0 for the existing manual
  Browser history consumers, without driving a browser, granting a controller lease, or recreating a process. This
  reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- CV-332
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_smpfs-245
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SMPFS-246 - browser.session.closed prepared semantic contract

```yaml
plan_unit_id: SMPFS-246
unit_type: interface_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly browser.session.closed@1.0.0, prepared without
  admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are landed
  Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3, Card 1
  retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  BrowserRuntimeService records cmd.browser.keep_closed only after the existing open session is committed closed.
  previous_lifecycle_state=open, lifecycle_state=closed, and changed_fields contains lifecycle_state. Repeating
  Keep closed on an already closed session is a no-op with no second event.

  DL-405: each manual session is the manual face of exactly one Browser workspace. browser_session_state.v1 carries
  required workspace_id, joined to the genuine workspace on the exact storage, Home Server, Execution Host/Computer,
  Environment and Project-or-app scope. That workspace link is assigned once and is not a second workspace lifecycle.
  A single owner operation/change may append a manual session event or the corresponding Browser Program workspace/controller
  event, never both for the same change. A separate genuine workspace change remains separately governed by DL-046;
  it cannot be inferred from this session event. The five manual contracts do not add rows to browser_event_admission.json''s
  53-name census. browser.session.navigated and browser.session.resized are retired; Navigate/Reload retain their
  existing no-session-event behavior and the record retains current URL/viewport. Protected AuthBrowserSession never
  enters this persistence or history path.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/browser_session_closed, exact Project logical
  schema_id pm.browser.session.closed.payload.v1 and distinct application logical schema_id pm.browser.session.closed.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalBrowserTransitionSource and BrowserSessionApplicationV1 / BrowserWorkspaceApplicationV1).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  browser.session.closed is read by reader.browser.session.closed.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- CV-332
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_smpfs-246
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.closed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SMPFS-247 - browser.session.promoted prepared semantic contract

```yaml
plan_unit_id: SMPFS-247
unit_type: interface_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly browser.session.promoted@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  BrowserRuntimeService records cmd.browser.promote_to_normal_browsing only after the session changes from an existing
  non-normal session_class to normal_browsing, with session_class in changed_fields. Workspace and browser_session_id
  remain stable; an already normal session produces no second event. Promotion is not a controller grant or a Browser
  Program workspace recreation.

  DL-405: each manual session is the manual face of exactly one Browser workspace. browser_session_state.v1 carries
  required workspace_id, joined to the genuine workspace on the exact storage, Home Server, Execution Host/Computer,
  Environment and Project-or-app scope. That workspace link is assigned once and is not a second workspace lifecycle.
  A single owner operation/change may append a manual session event or the corresponding Browser Program workspace/controller
  event, never both for the same change. A separate genuine workspace change remains separately governed by DL-046;
  it cannot be inferred from this session event. The five manual contracts do not add rows to browser_event_admission.json''s
  53-name census. browser.session.navigated and browser.session.resized are retired; Navigate/Reload retain their
  existing no-session-event behavior and the record retains current URL/viewport. Protected AuthBrowserSession never
  enters this persistence or history path.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/browser_session_promoted, exact Project logical
  schema_id pm.browser.session.promoted.payload.v1 and distinct application logical schema_id pm.browser.session.promoted.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalBrowserTransitionSource and BrowserSessionApplicationV1 / BrowserWorkspaceApplicationV1).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  browser.session.promoted is read by reader.browser.session.promoted.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- CV-332
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_smpfs-247
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.promoted
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SMPFS-248 - browser.session.takeover_state_changed prepared semantic contract

```yaml
plan_unit_id: SMPFS-248
unit_type: interface_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly browser.session.takeover_state_changed@1.0.0,
  prepared without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and
  are landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case
  L-3, Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and
  scoped negative evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  BrowserRuntimeService records an actual takeover_state change committed by cmd.browser.take_over, cmd.browser.pause_agent,
  cmd.browser.let_agent_continue or cmd.browser.stop_agent_keep_browser. The authenticated owner outcome, not the
  command label alone, selects the before/after states from none|offered|paused_for_user|promoted|stopped_keep_browser.
  They must differ and changed_fields contains takeover_state. No new takeover policy or state mapping is selected
  here; the existing Browser permission/controller owner authenticates its actual outcome.

  DL-405: each manual session is the manual face of exactly one Browser workspace. browser_session_state.v1 carries
  required workspace_id, joined to the genuine workspace on the exact storage, Home Server, Execution Host/Computer,
  Environment and Project-or-app scope. That workspace link is assigned once and is not a second workspace lifecycle.
  A single owner operation/change may append a manual session event or the corresponding Browser Program workspace/controller
  event, never both for the same change. A separate genuine workspace change remains separately governed by DL-046;
  it cannot be inferred from this session event. The five manual contracts do not add rows to browser_event_admission.json''s
  53-name census. browser.session.navigated and browser.session.resized are retired; Navigate/Reload retain their
  existing no-session-event behavior and the record retains current URL/viewport. Protected AuthBrowserSession never
  enters this persistence or history path.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/browser_session_takeover_state_changed, exact
  Project logical schema_id pm.browser.session.takeover_state_changed.payload.v1 and distinct application logical
  schema_id pm.browser.session.takeover_state_changed.payload.application.v1, both schema_version=1.0.0. The selected
  root is closed; identifiers require exact full-match in addition to length bounds, including trailing-LF rejection.
  It holds metadata, revisions, changed field names and opaque owner-record/evidence references only, never URL,
  screenshot/page content, cookies, memory claims/text or secrets. Complete semantic before/after values remain
  with the existing source owner. revision_after=revision_before+1 over u64. The source must authenticate the exact
  subject, scope, operation, before/after revisions and committed outcome; an all-true fixture is not native producer
  authority. Scope is application_or_project only for these existing owner-supported editions: real Project keys/bytes
  remain unchanged; application has project_id=null, actual Computer/server and original source graph selected by
  CV-366 (OriginalBrowserTransitionSource and BrowserSessionApplicationV1 / BrowserWorkspaceApplicationV1). App
  memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  browser.session.takeover_state_changed is read by reader.browser.session.takeover_state_changed.history@1.0.0
  for the existing manual Browser history consumers, without driving a browser, granting a controller lease, or
  recreating a process. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
  projector.storage.event_record_index@1.0.0 only for complete generic metadata indexing: checkpoints table, key
  event_record_index_checkpoint.v1:{storage_instance_id}, the uniquely current #/generations/{generation_id} value
  in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, and event_record_index.v2@{generation_id}.
  Verify the original generation birth anchor and actual complete coverage, including nonmatching application/Project
  rows, not a matching-row maximum. Resolve exact scope partition, event_type, event_id, sequence_id, publication_locator,
  source frame/CRC and payload commitment in one redb snapshot under the actual CURRENT/manifest maintenance fence.
  The complete SP-278 live read token contains storage_instance_id, checkpoint_key, checkpoint_ref, generation_id,
  generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and live redb_snapshot_id.
  A persisted read token is only its nine-field durable projection under DL-076; no redb_snapshot_id is stored.
  source_selection binds storage_instance_id, CURRENT path/bytes, selected segment generation, manifest path/bytes/generation,
  recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Generation-only
  comparison is insufficient: a same-generation frontier change invalidates publication. Revalidate access, deletion
  and that complete token at disclosure; changed fences discard the answer. The generic owner''s checkpoint CAS/complete-source
  transaction remains SP-278''s, not this reader''s. Family checkpoint disposition is none_required: the family
  creates no projector, durable history view, family checkpoint, cursor or ACK; its sole effect is an ephemeral
  read answer. It never writes or advances the generic checkpoint. Crash/rebuild reacquires the generic index and
  recomputes the answer, never reruns an owner command, emits an event, restores a lease, charges Usage or injects
  a prompt. Historical validation evaluates the genuine original committed transition under its original schema/policy;
  disappearance or changed current state of the live subject does not invalidate a retained event. Withdrawn or
  forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- CV-332
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_smpfs-248
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.takeover_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```
