# Shard 023: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2979-L3519

Source SHA256: `f2e90b9692f2ed62fd9987f90202926be34a52835686dc08b76734f8a82016ca`

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
  succeeds (OP-027), authority-gated actions add permission_required, and the remaining view actions use degraded
  for the History surface's degraded presentation (OP-026 degraded states; run-start history consumer binding).
  Immutable-history semantics stand: no definition mutates a historical record in place, and resume/retry of a
  historical run stay with the runtime recovery commands through allowed_action_ids (UCC-100 amendment). Under the
  Commands_System command-summary vocabulary this family is historical-safe for view, filter and inspect actions
  and record-only/export-only for the export commands.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Orchestrator History commands.
depends_on: [UCC-230, UCC-100, OP-026, OP-027, CV-333, DL-333]
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
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21270
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; row precondition project_selected (UI_Command_Catalog.md:21270); UCC-230 envelope common optional project_id (type id)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.switch_subview
      ucc_units: [UCC-100]
      command_kind: shell_view                         # canon: UI_Command_Catalog.md:21271
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
          values: [documents, runs]
          provenance: canon
          source: "OP-026 preserved_exact_tokens Documents, Runs; row \"Switches History between its Documents and Runs subviews as view state\" (UI_Command_Catalog.md:21271)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.set_include_archived
      ucc_units: [UCC-100]
      command_kind: shell_view                         # canon: UI_Command_Catalog.md:21272
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
            The row states the toggle semantics (\"Shows or hides archived rows inside All history\", UI_Command_Catalog.md:21272)
            but names no arg. JUDGMENT: boolean required carrying the target state, named from the label \"Include archived\".
            Alternative: enum on|off so a UI toggle can send its own event.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.open_row
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21273
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Opens the selected historical document or run by its stable identity\" (UI_Command_Catalog.md:21273)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.open_artifacts
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21274
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected && row_artifacts_linked, \"Opens the artifacts linked to the selected row\" (UI_Command_Catalog.md:21274)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.open_evidence
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21275
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected && row_evidence_linked, \"Opens the evidence linked to the selected row\" (UI_Command_Catalog.md:21275)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.compare_versions
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21276
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
            UI_Command_Catalog.md:21276) and OP-027 forbids comparing \"by path or title alone when canonical
            document/package IDs exist\", but no field name or count is stated. JUDGMENT: list of exactly two refs
            naming the selected versions by canonical id. Alternatives: a base_ref/head_ref pair, or
            target_identity_ref plus a versions list.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
    - command_id: cmd.history.duplicate_as_draft
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21277
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Creates a new draft from the selected historical document\" (UI_Command_Catalog.md:21277)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryDuplicateAsDraftResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
    - command_id: cmd.history.reopen_in_wizard
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21278
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Reopens the selected historical document in the Planning Wizard\" (UI_Command_Catalog.md:21278)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryReopenInWizardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.history.send_forward
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21279
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_document_selected, \"Sends the selected historical document forward when currentness allows\" (UI_Command_Catalog.md:21279)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistorySendForwardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
    - command_id: cmd.history.export_selected
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21280
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Exports the selected row\" (UI_Command_Catalog.md:21280)"
        export_format:
          type: enum
          required: true
          default: none
          values: [zip_manifest, json, rendered_markdown, rendered_html, rendered_pdf]
          provenance: gap
          gap_note: >-
            The format set is canon (\"zip with manifest, JSON, or rendered Markdown, HTML or PDF\", UI_Command_Catalog.md:21280;
            OP-027 preserved tokens zip+manifest, JSON, rendered Markdown/HTML/PDF) but names no arg and no enum spellings.
            JUDGMENT: arg named export_format with the canon formats normalized to snake_case (zip+manifest -> zip_manifest;
            JSON -> json). Alternative: keep the canon spellings verbatim as enum values and widen the checker's enum rule.
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row requires \"an explicit evidence/redaction profile\" (UI_Command_Catalog.md:21280) and OP-027 preserves
            \"explicit evidence/redaction profile\" and \"permissions/redaction profile details\", but names no field or shape.
            JUDGMENT: required ref to a named evidence/redaction profile record the Permissions owner holds. Alternatives:
            inline object with per-section redactions, or an enum of named profiles.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.history.export_bundle
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21281
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
            The row's subject is plural (precondition history_rows_multi_selected, \"Exports the multi-selected rows as one
            bundle\", UI_Command_Catalog.md:21281) but UCC-230's row group lists only the singular target_identity_ref.
            JUDGMENT: plural list<ref> mirroring the envelope's receipt_refs plural. Alternative: the common optional
            selection_ref naming a stored selection.
        export_format:
          type: enum
          required: true
          default: none
          values: [zip_manifest, json, rendered_markdown, rendered_html, rendered_pdf]
          provenance: gap
          gap_note: >-
            OP-027 canonical_text gives the export family its formats (\"zip/archive, JSON, rendered Markdown, rendered HTML,
            rendered PDF\") but names no arg and no enum spellings. JUDGMENT: same export_format enum as export_selected,
            canon formats normalized to snake_case. Alternative: bundle export fixes zip_manifest because the row says
            \"as one bundle with its manifest\".
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            OP-027 requires \"explicit evidence/redaction profiles\" for the export actions but names no field or shape.
            JUDGMENT: same required profile ref as export_selected.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.history.export_filtered_view
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21282
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity history_query_ref (identity_typing _ref => ref), made mandatory by the row: \"Exports the whole filtered view with its active filter context and manifest\" (UI_Command_Catalog.md:21282) and OP-027 negative constraint \"Do not make whole filtered-view export omit the active filter context\""
        export_format:
          type: enum
          required: true
          default: none
          values: [zip_manifest, json, rendered_markdown, rendered_html, rendered_pdf]
          provenance: gap
          gap_note: >-
            OP-027 canonical_text gives the export family its formats but names no arg and no enum spellings.
            JUDGMENT: same export_format enum as export_selected, canon formats normalized to snake_case.
        evidence_redaction_profile:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            OP-027 requires \"explicit evidence/redaction profiles\" for the export actions but names no field or shape.
            JUDGMENT: same required profile ref as export_selected.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.history.clone_as_new_run
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21283
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_run_selected, \"Starts a new run cloned from the selected historical run under a new identity\" (UI_Command_Catalog.md:21283)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryCloneAsNewRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.history.inspect_records
      ucc_units: [UCC-100]
      command_kind: navigation_wrapper                 # canon: UI_Command_Catalog.md:21284
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
          source: "UCC-230 row-group UCC-096..UCC-100 optional identity target_identity_ref (identity_typing _ref => ref), made mandatory by the row subject: precondition history_row_selected, \"Opens the ledger and raw records behind the selected row\" (UI_Command_Catalog.md:21284)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
    - command_id: cmd.history.rebuild_projection
      ucc_units: [UCC-100]
      command_kind: domain_action                      # canon: UI_Command_Catalog.md:21285
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-100 canonical_text \"current-project scope\"; OP-026 \"It should be locked to the current project.\"; row precondition history_visible (UI_Command_Catalog.md:21285); UCC-230 envelope common optional project_id (type id)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HistoryRebuildProjectionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
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
