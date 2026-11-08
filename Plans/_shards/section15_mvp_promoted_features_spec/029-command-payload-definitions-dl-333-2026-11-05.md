# Shard 029: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L13363-L15417

Source SHA256: `5c32169a2eb7c61de76e565bbf154408276b8f2e563dd58b7cb8a139ff1f5019`

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
  kind cell, navigation_wrapper, in the row its canonical id takes over (UI_Command_Catalog.md:15642, :19010).
  CV-360's placement fields go only on the routes its open-routes table lists (UI_Command_Catalog.md:18298-18318):
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
            "browser session target" (:18290), the launcher rows open "an address" through it, and
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
          source: "CV-360 (Contracts_V0.md:23626-23629) names this route: where is auto, tab, panel, right, down or a panel id; default auto; an id that names no panel reads as auto. Open-routes table UI_Command_Catalog.md:18314; DL-180 amendment :850"
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
            normalization.kind wrapper (UI_Command_Catalog.md:18290), and the open-routes table lists it as
            an open route (:18314). navigation_wrapper is chosen from the closed set (Contracts_V0.md:1902-1905)
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
            CV-360 (Contracts_V0.md:23626-23627) and its open-routes table (UI_Command_Catalog.md:18298-18318)
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
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18314)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18314"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18314"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18314"
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
            and the open-routes table calls it layout-only (:18314).
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            The row states no disabled reasons; unsupported stands for a host without the browser runtime.
        - key: field:where
          choice: carry CV-360's where, mode, by and background
          gap_note: >-
            Canon conflict: CV-360's acceptance (Contracts_V0.md:23646) says every open route UCC-200 lists
            carries the four placement fields, and the open-routes table lists this route
            (UI_Command_Catalog.md:18314), but the row and its wiring entry catalog.browser_focus_browser_tab
            make it a reveal of the tab that hosts the session wherever it is, and CV-360 says a reveal never
            moves a tab, so placement changes nothing here. The definition follows CV-360's acceptance and the
            table, which name no exemption for reveal-only routes; the owner should say whether they are exempt.
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
            BrowserDevToolsOpenRequest (UI_Command_Catalog.md:15642, :19010) is placed at
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
        - {command_id: cmd.browser.devtools.open, kind: alias, source: "UCC-202 and the duplicate-ids table (UI_Command_Catalog.md:19010); UCC-063 stale_retired_dispositions"}
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, permission_required]
          gap_note: >-
            The canonical id takes the preconditions browser_runtime_available && !protected_auth_browser &&
            devtools_policy_allows (UI_Command_Catalog.md:15642, :19010) but no disabled reasons; unsupported
            stands for a missing browser runtime or the protected authentication browser, and
            permission_required for the DevTools policy.
        - key: owner_request
          choice: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
          gap_note: >-
            Canon conflict: the wiring rows catalog.browser_open_devtools and
            assistant.redesign.cmd.browser_devtools_open name BrowserActionRequestV2, while the catalog
            (UI_Command_Catalog.md:15642, :19010) and Commands_System.md:6486 name BrowserDevToolsOpenRequest,
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
            Canon conflict: the catalog (UI_Command_Catalog.md:15642, :19010) and Commands_System.md:6486
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
            optional thread_id has no field in the request or the closed action arguments (:423) and stays on the
            UICommand envelope (DL-341 open_owner_questions). Until native capture exists the handler fails
            closed with handler_unavailable (UI_Command_Catalog.md:853).
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
            optional thread_id has no field in the request or the closed action arguments (:423) and stays on the
            UICommand envelope (DL-341 open_owner_questions). Until native capture exists the handler fails
            closed with handler_unavailable (UI_Command_Catalog.md:853).
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
  policy and hints, the dev start mode and target, and the catalog item_type spellings and version format
  untyped; each is marked provenance gap and left open for the compile review rather than invented.
  Shared conventions of the definitions block: terminal row cites are the terminal command table
  (UI_Command_Catalog.md:880-888, whose payload column is history under DL-333 resolution 10) and the kept
  terminal commands table (UCC-201, UI_Command_Catalog.md:18731-18743), which states each terminal
  command_kind: open navigation_wrapper (:18735), show shell_view (:18736), focus shell_view (:18737), rerun
  domain_action (:18739), restart_replace domain_action (:18740) and clear_scrollback domain_action (:18743).
  Every terminal wiring row names TerminalActionRequestV2 and TerminalActionResultV2
  (Plans/shared_runtime_command_contracts.schema.json); the dev and catalog wiring rows (catalog.dev_*,
  catalog.catalog_*) name no request_schema_ref or result_schema_ref. The dev and catalog tables
  (UI_Command_Catalog.md:930-935, :949-951) state no command_kind and no disabled reasons. CV-360's placement
  fields go only on the routes its open-routes table lists (UI_Command_Catalog.md:18298-18318):
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
          source: "catalog row payload (UI_Command_Catalog.md:880); kept-commands row 'Reveals the tab of the exact terminal_session_id' (UI_Command_Catalog.md:18735); overlay UCC-066..072 identity terminal_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23626-23629) names this route: where is auto, tab, panel, right, down or a panel id; default auto. The kept-commands row says it carries CV-360's placement fields (UI_Command_Catalog.md:18735); open-routes table :18315"
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
          source: "CV-360 (Contracts_V0.md:23631): background default false; an agent's open lands as a background tab (UCC-066, UI_Command_Catalog.md:5114; :18735)"
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
            Neither the terminal row (UI_Command_Catalog.md:880) nor the kept-commands row (:18735) states
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
          source: "catalog row payload (UI_Command_Catalog.md:881); kept-commands row (UI_Command_Catalog.md:18736); overlay UCC-066..072 identity terminal_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18315)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18315"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18315"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18315"
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
            Neither the terminal row (UI_Command_Catalog.md:881) nor the kept-commands row (:18736) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
        - key: field:where
          choice: carry CV-360's where, mode, by and background
          gap_note: >-
            Canon conflict: CV-360's acceptance (Contracts_V0.md:23646) says every open route UCC-200 lists
            carries the four placement fields, and the open-routes table lists this route
            (UI_Command_Catalog.md:18315), but the kept-commands row makes it a focus of the same live
            session's tab that never collapses into open (:18736), and its wiring entry catalog.terminal_show
            reveals the tab wherever it is; CV-360 says a reveal never moves a tab, so placement changes
            nothing here. The definition follows CV-360's acceptance and the table, which name no exemption
            for reveal-only routes; the owner should say whether they are exempt.
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
            terminal launch only for an explicit new-session request"), the kept-commands row (:18739,
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
            Neither the terminal row (UI_Command_Catalog.md:882) nor the kept-commands row (:18739) states
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
          source: "catalog row payload terminal_session_id? (UI_Command_Catalog.md:884); kept-commands row (UI_Command_Catalog.md:18737); overlay UCC-066..072 identity terminal_session_id?"
        dev_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload dev_session_id? (UI_Command_Catalog.md:884, :18737); overlay UCC-066..072 identity dev_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646, every open route UCC-200 lists carries the fields): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18315)"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18315"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18315"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18315"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases:
        - {command_id: cmd.terminal.focus_session, kind: alias, source: "UCC-202 duplicate-ids table (UI_Command_Catalog.md:19012: cmd.terminal.focus is canonical, cmd.terminal.focus_session its alias); :8621; UCC-230 non_definition_tokens (DL-341)"}
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: >-
            Neither the terminal row (UI_Command_Catalog.md:884) nor the kept-commands row (:18737) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
        - key: field:where
          choice: carry CV-360's where, mode, by and background
          gap_note: >-
            Canon conflict: CV-360's acceptance (Contracts_V0.md:23646) says every open route UCC-200 lists
            carries the four placement fields, and the open-routes table lists this route
            (UI_Command_Catalog.md:18315), but the kept-commands row (:18737) and its wiring entry
            catalog.terminal_focus make it a reveal of the session's tab, else the most recently focused
            terminal tab, wherever it is; CV-360 says a reveal never moves a tab, so placement changes nothing
            here. The definition follows CV-360's acceptance and the table, which name no exemption for
            reveal-only routes; the owner should say whether they are exempt.
        - key: omitted:terminal_pane_id
          choice: omitted
          gap_note: >-
            The terminal row's payload column (history, UI_Command_Catalog.md:884) still lists
            terminal_pane_id?, while the kept-commands row says "the terminal_pane_id? argument retires with
            panes" (:18737, DL-181) and the SMPFS-329 negative constraint keeps it out. The row's
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
          source: "catalog row payload (UI_Command_Catalog.md:888); kept-commands row (UI_Command_Catalog.md:18740); overlay UCC-066..072 identity terminal_session_id?"
        policy:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names a "/restart/replace policy" (UI_Command_Catalog.md:888) with no values; the
            kept-commands row fixes the behavior (a new session in the same tab, same folder and profile,
            UI_Command_Catalog.md:18740) without a policy vocabulary. JUDGMENT: string holds the value
            pending an owner enum.
        command_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names "command replay or shell profile hints" (UI_Command_Catalog.md:888) without a field
            shape. JUDGMENT: command_ref, type ref, optional, for the replay hint; the overlay's command_ref?
            identity is the candidate name.
        profile_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names "command replay or shell profile hints" (UI_Command_Catalog.md:888) without a field
            shape; the default is the same folder and profile (UI_Command_Catalog.md:18740). The owner
            request this definition names,
            Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2, requires
            profile_ref (a ref string, 1-256 characters) and cwd_root_ref, which carry the profile and the
            folder. JUDGMENT: the UI arg takes that spelling and type, profile_ref (ref), optional, as the
            row's profile hint; absent keeps the same profile (UI_Command_Catalog.md:18740), and a value overrides it.
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
            Neither the terminal row (UI_Command_Catalog.md:888) nor the kept-commands row (:18740) states
            disabled reasons; unsupported stands for a host without a terminal runtime.
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
          source: "kept-commands row (UI_Command_Catalog.md:18743); the terminal and dev rules 'cmd.terminal.clear_scrollback preserves runtime identity' (UI_Command_Catalog.md:960); UCC-072 'Terminal clear, close, and dev reveal commands preserve runtime identity and dev_session_id ownership' (UI_Command_Catalog.md:5486); overlay UCC-066..072 identity terminal_session_id?"
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
            The kept-commands row (UI_Command_Catalog.md:18743) states no disabled reasons; unsupported stands
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
            UI_Command_Catalog.md:19011).
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
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18317), and its wiring entry catalog.dev_show_output resolves it \"into the Output tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_output"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_output"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_output"
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
            (:18317), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:933) and the wiring row
            catalog.dev_show_output names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18317); the
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
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18317), and its wiring entry catalog.dev_show_problems resolves it \"into the Problems tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_problems"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_problems"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_problems"
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
            (:18317), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:934) and the wiring row
            catalog.dev_show_problems names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18317); the
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
          source: "CV-360 (Contracts_V0.md:23628-23629; acceptance :23646): where is auto, tab, panel, right, down or a panel id; default auto. The open-routes table lists this route (UI_Command_Catalog.md:18317), and its wiring entry catalog.dev_show_ports resolves it \"into the Ports tool tab with CV-360's placement fields\""
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep; no default stated. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_ports"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_ports"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18317; wiring entry catalog.dev_show_ports"
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
            (:18317), an open route.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The row is "layout/UI state only" (UI_Command_Catalog.md:935) and the wiring row
            catalog.dev_show_ports names no result_schema_ref, but CV-360 (Contracts_V0.md:23631) says what
            every open returns and the open-routes table lists this route (UI_Command_Catalog.md:18317); the
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
