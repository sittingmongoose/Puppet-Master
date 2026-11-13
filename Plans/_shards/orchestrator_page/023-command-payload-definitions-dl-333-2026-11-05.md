# Shard 023: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2983-L3600

Source SHA256: `22d3ca043e564c223a75a877b4e46a65ea1103b94698fc53a14a35006afafa04`

---

## Command payload definitions (DL-333, 2026-11-05)

### OP-049 - History Command Payload Definitions

```yaml
plan_unit_id: OP-049
unit_type: command_contract
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Typed payload definitions for the sixteen Orchestrator History commands that UI_Command_Catalog UCC-100 mints
  and UCC-230 routes from the UCC-096..UCC-100 row group to this doc (DL-333 coordinator resolution 9b). The
  definitions block below gives each command its args, owner result and narrowed error and disabled-reason codes
  in pm.command_payload_definitions.v1. Every command carries current-project scope (project_id required, UCC-100
  canonical_text "current-project scope"; OP-026 "It should be locked to the current project."); row-scoped
  commands carry the row's stable identity as target_identity_ref, made mandatory by their row precondition
  (history_row_selected and its variants), and filtered-view export carries its active filter context as
  history_query_ref. The catalog keeps ids, labels, preconditions, availability and aliases; the strict schema
  overlay keeps the common envelope and the closed code sets. Error codes follow the UCC-230 error-narrowing rule:
  every command carries the four always codes, navigation wrappers add invalid_route, and domain actions add
  stale_projection per the catalog 2.0B projection-freshness gating clause. Disabled codes are drawn from the
  overlay's closed set: compare, export, reopen and send-forward stay stale_projection-blocked until Rebuild
  succeeds (OP-027), authority-gated actions add permission_required, and mutating actions add degraded, since
  stale, degraded and unavailable projection state disables mutation. Amended 2026-11-07 (DL-341): view, navigation
  and Rebuild actions never use degraded, because canon keeps them open as the record-backed fallback and the
  recover action when trust drops; each disabled-code choice is recorded in its definition's judgments list.
  Commands offered without their row subject or off the History surface add unsupported, since the closed set has no
  code for an unmet selection or surface precondition. UCC-100's "currentness/authority state"
  (Plans/UI_Command_Catalog.md:7340-7342) is an owner-side precondition, not an arg: reopen in wizard, send forward
  and clone as new run gate on currentness_allows, the handler checks currentness and authority against the owner
  record before it acts, the projection shows stale_projection or permission_required while a check fails, and canon
  names no currentness or authority field. Immutable-history semantics stand: no definition mutates a historical
  record in place, and resume/retry of a historical run stay with the runtime recovery commands through
  allowed_action_ids (UCC-100 amendment). Commands_System requires each action to declare live-run only,
  historical-safe or record-only/export-only and forbids inferring historical safety from a label
  (Plans/Commands_System.md:86); neither the History rows nor OP-026/OP-027 assign a class, so the per-command
  assignment is this unit's own choice. Record-only/export-only: export_selected, export_bundle and
  export_filtered_view. Historical-safe: focus, switch_subview, set_include_archived, open_row, open_artifacts,
  open_evidence, compare_versions, inspect_records, rebuild_projection, duplicate_as_draft, reopen_in_wizard,
  send_forward and clone_as_new_run, since each reads historical records or derives new state from them without
  changing them. None is live-run only.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Orchestrator History commands.
depends_on: [UCC-230, UCC-100, OP-026, OP-027, CV-333, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 assigns to OP-049 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "pm-mail 1105034552-f6f4 (pm7-build, 2026-11-05): DL-333 coordinator resolution 9b mints the History command ids"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
  - "Plans/Orchestrator_Page.md OP-026, OP-027 (History surface and actions canon)"
preserved_exact_tokens: [cmd.history.focus, cmd.history.switch_subview, cmd.history.set_include_archived, cmd.history.open_row, cmd.history.open_artifacts, cmd.history.open_evidence, cmd.history.compare_versions, cmd.history.duplicate_as_draft, cmd.history.reopen_in_wizard, cmd.history.send_forward, cmd.history.export_selected, cmd.history.export_bundle, cmd.history.export_filtered_view, cmd.history.clone_as_new_run, cmd.history.inspect_records, cmd.history.rebuild_projection]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not make any History definition mutate an immutable historical record in place.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md, Plans/Planning_Wizard.md, Plans/Permissions_System.md, Plans/storage-plan.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: OP-049
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.history.focus
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; row precondition project_selected (UI_Command_Catalog.md:21736); UCC-230 envelope common optional project_id (type id)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: "The catalog states the precondition project_selected (UI_Command_Catalog.md:21736) but no disabled code; not_configured is chosen for no current project. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.switch_subview
      ucc_units: [UCC-100]
      command_kind: shell_view
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        subview:
          type: enum
          required: true
          default: none
          values: [Documents, Runs]
          provenance: gap
          gap_note: >-
            The values keep canon's spelling: OP-026 "It provides Documents and Runs subviews" and its
            preserved_exact_tokens Documents, Runs (Plans/Orchestrator_Page.md:1937-1938, :2056-2057); the row
            "Switches History between its Documents and Runs subviews as view state" (UI_Command_Catalog.md:21737).
            Canon names no arg; subview is named from the row text.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_visible (UI_Command_Catalog.md:21737) but no disabled code; unsupported is chosen for the control offered off the History surface. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.set_include_archived
      ucc_units: [UCC-100]
      command_kind: shell_view
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        include_archived:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row states the toggle semantics ("Shows or hides archived rows inside All history", UI_Command_Catalog.md:21738)
            but names no arg. Chosen: a required boolean carrying the target state, named from the label "Include archived"
            (OP-026 preserved token Include archived).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_visible && all_history_selected (UI_Command_Catalog.md:21738) but no disabled code; unsupported is chosen for the control offered outside All history. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.open_row
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Opens the selected historical document or run by its stable identity\" (UI_Command_Catalog.md:21739)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_row_selected (UI_Command_Catalog.md:21739) but no disabled code; the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.open_artifacts
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected && row_artifacts_linked, \"Opens the artifacts linked to the selected row\" (UI_Command_Catalog.md:21740)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_row_selected && row_artifacts_linked (UI_Command_Catalog.md:21740) but no disabled code; the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.open_evidence
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected && row_evidence_linked, \"Opens the evidence linked to the selected row\" (UI_Command_Catalog.md:21741)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_row_selected && row_evidence_linked (UI_Command_Catalog.md:21741) but no disabled code; the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.compare_versions
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        version_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 2, max_items: 2}
          provenance: gap
          gap_note: >-
            The row requires selected document versions (precondition history_document_versions_selected,
            UI_Command_Catalog.md:21742) and OP-027 forbids comparing "by path or title alone when canonical
            document/package IDs exist", but no field name or count is stated. Chosen: a list of exactly two refs
            naming the selected versions by canonical id.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection]
          gap_note: "The catalog states the precondition history_projection_current and \"blocked while the projection is stale\" (UI_Command_Catalog.md:21742) but no code list; stale_projection is that state. Compare is a view, not a mutation, so degraded is not added (Plans/Orchestrator_Page.md:196 disables mutation). The row's selection precondition history_document_versions_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject."
    - command_id: cmd.history.duplicate_as_draft
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Creates a new draft from the selected historical document\" (UI_Command_Catalog.md:21743)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryDuplicateAsDraftResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, degraded]
          gap_note: "The catalog states the precondition history_document_selected (UI_Command_Catalog.md:21743) but no disabled code. Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_document_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject."
    - command_id: cmd.history.reopen_in_wizard
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Reopens the selected historical document in the Planning Wizard\" (UI_Command_Catalog.md:21744)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryReopenInWizardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, permission_required, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, permission_required, degraded]
          gap_note: "The catalog states history_projection_current && currentness_allows and \"after currentness and authority checks\" (UI_Command_Catalog.md:21744) but no disabled code; permission_required is the authority check. Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_document_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. UCC-100's \"currentness/authority state\" (UI_Command_Catalog.md:7340-7342) is carried by these owner-side preconditions, not by args: the handler checks currentness and authority against the owner record before it acts, the projection shows stale_projection or permission_required while a check fails, and canon names no currentness or authority field, so no expected-currentness token is added."
    - command_id: cmd.history.send_forward
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Sends the selected historical document forward when currentness allows\" (UI_Command_Catalog.md:21745)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistorySendForwardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, degraded]
          gap_note: "The catalog states history_projection_current && currentness_allows (UI_Command_Catalog.md:21745) but no disabled code. Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_document_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. UCC-100's \"currentness/authority state\" (UI_Command_Catalog.md:7340-7342) is carried by the owner-side precondition currentness_allows, not by an arg: the handler checks currentness against the owner record before it acts, the projection shows stale_projection while the check fails, the row names no authority check for send forward, and canon names no currentness or authority field, so no expected-currentness token is added."
    - command_id: cmd.history.export_selected
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Exports the selected row\" (UI_Command_Catalog.md:21746)"
        export_format:
          type: enum
          required: true
          default: none
          values: [zip+manifest, JSON, rendered Markdown, rendered HTML, rendered PDF]
          provenance: gap
          gap_note: >-
            The format set is canon ("zip with manifest, JSON, or rendered Markdown, HTML or PDF", UI_Command_Catalog.md:21746)
            but canon names no arg. The values keep canon's spelling (DL-341): zip+manifest and JSON are OP-027
            preserved_exact_tokens, and rendered Markdown, rendered HTML and rendered PDF are OP-027 canonical_text
            ("zip/archive, JSON, rendered Markdown, rendered HTML, rendered PDF"). The arg is named export_format.
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row requires "an explicit evidence/redaction profile" (UI_Command_Catalog.md:21746) and OP-027 preserves
            "explicit evidence/redaction profile" and "permissions/redaction profile details", but names no field or shape.
            Chosen: a required ref to a named evidence/redaction profile record the Permissions owner holds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, permission_required, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, permission_required, degraded]
          gap_note: "The catalog states history_row_selected && history_projection_current and an explicit evidence/redaction profile (UI_Command_Catalog.md:21746) but no disabled code; permission_required covers the authority-gated profile (OP-027 \"authority-gated actions\"). Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_row_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject."
    - command_id: cmd.history.export_bundle
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 2, unique_items: true}
          provenance: gap
          gap_note: >-
            The row's subject is plural (precondition history_rows_multi_selected, "Exports the multi-selected rows as one
            bundle", UI_Command_Catalog.md:21747) but UCC-230's row group lists only the singular target_identity_ref.
            Chosen: a plural list<ref>, mirroring the envelope's receipt_refs plural.
        export_format:
          type: enum
          required: true
          default: none
          values: [zip+manifest, JSON, rendered Markdown, rendered HTML, rendered PDF]
          provenance: gap
          gap_note: >-
            OP-027 canonical_text gives the export family its formats ("zip/archive, JSON, rendered Markdown, rendered HTML,
            rendered PDF") but names no arg. Same export_format enum as export_selected, in canon's spelling. The row's
            "as one bundle with its manifest" (UI_Command_Catalog.md:21747) does not say the bundle format is fixed.
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            OP-027 requires "explicit evidence/redaction profiles" for the export actions but names no field or shape.
            Same required profile ref as export_selected.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, permission_required, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, permission_required, degraded]
          gap_note: "The catalog states history_rows_multi_selected && history_projection_current (UI_Command_Catalog.md:21747) but no disabled code; permission_required covers the authority-gated profile (OP-027). Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_rows_multi_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject."
    - command_id: cmd.history.export_filtered_view
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        history_query_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity history_query_ref (identity_typing _ref => ref), made mandatory by the row: \"Exports the whole filtered view with its active filter context and manifest\" (UI_Command_Catalog.md:21748) and OP-027 negative constraint \"Do not make whole filtered-view export omit the active filter context\""
        export_format:
          type: enum
          required: true
          default: none
          values: [zip+manifest, JSON, rendered Markdown, rendered HTML, rendered PDF]
          provenance: gap
          gap_note: >-
            OP-027 canonical_text gives the export family its formats but names no arg. Same export_format enum as
            export_selected, in canon's spelling.
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            OP-027 requires "explicit evidence/redaction profiles" for the export actions but names no field or shape.
            Same required profile ref as export_selected.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, permission_required, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, permission_required, degraded]
          gap_note: "The catalog states history_visible && history_projection_current (UI_Command_Catalog.md:21748) but no disabled code; permission_required covers the authority-gated profile (OP-027). Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's surface precondition history_visible has no closed code either: as for switch_subview and rebuild_projection, unsupported is chosen for the control offered off the History surface."
    - command_id: cmd.history.clone_as_new_run
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_run_selected, \"Starts a new run cloned from the selected historical run under a new identity\" (UI_Command_Catalog.md:21749)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryCloneAsNewRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, stale_projection, permission_required, degraded]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported, stale_projection, permission_required, degraded]
          gap_note: "The catalog states history_run_selected && currentness_allows and \"after currentness and authority checks\" (UI_Command_Catalog.md:21749) but no disabled code; permission_required is the authority check. Canon disables mutation under stale, degraded and unavailable projection state unless the owner surface revalidates directly first (Plans/Orchestrator_Page.md:196), and compare/export/reopen/send-forward stay blocked while the projection is stale until Rebuild succeeds (OP-027). The row's selection precondition history_run_selected has no closed code either: as for open_row, the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. UCC-100's \"currentness/authority state\" (UI_Command_Catalog.md:7340-7342) is carried by these owner-side preconditions, not by args: the handler checks currentness and authority against the owner record before it acts, the projection shows stale_projection or permission_required while a check fails, and canon names no currentness or authority field, so no expected-currentness token is added."
    - command_id: cmd.history.inspect_records
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; UCC-230 envelope common optional project_id (type id)"
        target_identity_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Opens the ledger and raw records behind the selected row\" (UI_Command_Catalog.md:21750)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_row_selected (UI_Command_Catalog.md:21750) but no disabled code; the closed set has no code for an unmet selection precondition, so unsupported is chosen for the control offered without its subject. Canon keeps History open and usable under degraded projection health: the surface stays open with a fallback to record-backed History, Ledger and direct evidence inspectors (Plans/Orchestrator_Page.md:112), Ledger and direct record views are the trust anchor under degraded projection health (:134), and degraded mode falls back to record-backed views (:194); so degraded does not disable it."
    - command_id: cmd.history.rebuild_projection
      ucc_units: [UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; row precondition history_visible (UI_Command_Catalog.md:21751); UCC-230 envelope common optional project_id (type id)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryRebuildProjectionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [unsupported]
          gap_note: "The catalog states the precondition history_visible (UI_Command_Catalog.md:21751) but no disabled code; unsupported is chosen for the control offered off the History surface. Rebuild is the refresh/recover action canon keeps available when trust drops (Plans/Orchestrator_Page.md:112), so neither degraded nor stale_projection disables it."
  results:
    HistoryDuplicateAsDraftResultV1:
      fields:
        draft_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the new draft's identity; the row names no result fields"}
        source_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the immutable historical record the draft came from; \"the historical record is not changed\""}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt; the wiring row requires a receipt effect (catalog.history_duplicate_as_draft)"}
    HistoryReopenInWizardResultV1:
      fields:
        planning_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the new mutable wizard state; name taken from UCC-230 row-group identity planning_session_id, no contract names it"}
        source_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the immutable record; \"the record stays immutable\""}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.history_reopen_in_wizard)"}
    HistorySendForwardResultV1:
      fields:
        forward_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "receipt of the forward hand-off; canon states no result fields for send forward"}
        source_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the historical document sent forward"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.history_send_forward)"}
    HistoryExportResultV1:
      fields:
        export_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the produced export artifact; canon names no result field"}
        manifest_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the export manifest; OP-027 \"Do not omit the manifest from archive/zip exports\" and \"Do not omit a manifest of redactions/omissions when evidence export is requested\""}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.history_export_selected / export_bundle / export_filtered_view)"}
    HistoryCloneAsNewRunResultV1:
      fields:
        run_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the new run's own identity; \"under a new identity\", run_id is the envelope's canonical run identity"}
        source_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the original historical run; never the same identity"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.history_clone_as_new_run)"}
    HistoryRebuildProjectionResultV1:
      fields:
        projection_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the rebuilt projection; compare, export, reopen and send forward stay blocked until it succeeds"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.history_rebuild_projection)"}
```
