# Shard 017: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/PRD_Builder.md`

Source lines: L1106-L1523

Source SHA256: `551c5f76659fe33abce724ff6a0c0222bfa8ca9f3c84867ab8aa93e79569f62c`

---

## Command payload definitions (DL-333, 2026-11-05)

### PRDB-024 - PRD Builder Command Payload Definitions

```yaml
plan_unit_id: PRDB-024
unit_type: command_contract
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  Typed payload definitions for the seven cmd.prd_builder.* commands that UI_Command_Catalog UCC-098
  registers and UCC-230 routes to this doc (DL-333). Each command's field list is the runtime contract
  row keyed by its catalog id in Plans/prd_planning_runtime_contracts.json ui_command_contracts
  (DL-333 coordinator resolution 1); that file's former ids are recorded compatibility aliases, and the
  catalog row's payload summary column is history. The definitions block below gives each command its
  args, owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1;
  the runtime contract's owner disabled states map to the overlay's closed codes through UCC-230
  owner_state_code_map. The envelope keeps the common fields: the annotation upsert's actor_ref travels
  in the envelope and is never restated here. The catalog keeps ids, labels, availability and aliases;
  the strict schema overlay keeps the common envelope and the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible PRD Builder import, answer, annotation, conflict, approval and reopen commands.
depends_on: [UCC-230, UCC-097, UCC-098, DL-333, CV-333, PRDB-007, PRDB-011]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to PRDB-024 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/PRD_Builder.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "Plans/prd_planning_runtime_contracts.json ui_command_contracts (field lists under the catalog ids; DL-333 resolution 1)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.prd_builder.source.import, cmd.prd_builder.answer.upsert, cmd.prd_builder.annotation.upsert, cmd.prd_builder.annotation.resolve, cmd.prd_builder.conflict.resolve, cmd.prd_builder.approve_for_planning_wizard, cmd.prd_builder.pack.reopen]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the runtime contract file's former ids are compatibility aliases and never dispatch.
  - Do not restate actor_ref; the envelope carries it (UCC-230).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Planning_Ledger_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: PRDB-024
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.prd_builder.source.import
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.source.import (command_kind domain_action);
      # the catalog row's payload summary column is history (DL-333 lineage pointer).
      response_kind: owner_operation
      args:
        workspace_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import (Plans/prd_planning_runtime_contracts.json ui_command_contracts; DL-333 resolution 1); the history column's project_id wording is superseded by the runtime field list"
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; source_manifest records carry source_id (prd_builder_runtime.records source_manifest)"
        source_security_policy_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; guard source_security_policy_current with owner state stale_source_security_policy (owner_state_code_map -> stale_projection)"
        source_resource_limit_profile_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; guard resource_limit_profile_present with owner state missing_resource_limit_profile (owner_state_code_map -> not_configured)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdSourceImportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, permission_required, degraded, stale_projection]
      # JUDGMENT: the runtime row's disabled_reason_codes (stale_workspace, permission_denied,
      # stale_source_security_policy, missing_resource_limit_profile, parser_sandbox_unavailable,
      # source_quarantined, source_limit_exceeded) map through UCC-230 owner_state_code_map to these
      # closed codes; stale_projection also covers the row's run_source_security_and_resource_preflight_
      # before_projection_dispatch freshness policy (2.0B clause).
      aliases:
        - {command_id: cmd.prd_builder.import_sources, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.answer.upsert
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.answer.upsert (command_kind domain_action).
      response_kind: owner_operation
      args:
        workspace_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.answer.upsert (Plans/prd_planning_runtime_contracts.json ui_command_contracts; DL-333 resolution 1)"
        question_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.answer.upsert; the history column's question/section id wording names the same field"
        answer:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names the field with no type or bounds; the history column says
            "answer version, source refs" which the runtime field list does not carry. JUDGMENT: typed
            string with no length bounds; bounds and the answer-version/source-refs inputs stay open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnswerUpsertResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      # JUDGMENT: the runtime row's ledger_sync_blocked maps to degraded (owner_state_code_map);
      # stale_projection covers the block_until_ledger_current freshness policy (2.0B clause).
      aliases:
        - {command_id: cmd.prd_builder.answer_question, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.annotation.upsert
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.annotation.upsert (command_kind domain_action);
      # PRDB-007's annotation_record lists the same fields. The row's actor_ref travels in the
      # envelope and is not restated (UCC-230 never-restated fields).
      response_kind: owner_operation
      args:
        source_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; annotation_record required field source_id (PRDB-007)"
        document_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires document_version (PRDB-007) but states no type; JUDGMENT:
            typed integer as a monotonic version counter; a string form is not ruled out.
        projection_revision:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires projection_revision (PRDB-007) but states no type; JUDGMENT:
            typed integer as a monotonic revision counter; a string form is not ruled out.
        action_kind:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires action_kind (PRDB-007) and its prose lists the action verbs
            (highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear,
            show source, challenge source) but fixes no snake_case token set. JUDGMENT: typed string
            pending that enum; the verb list is the semantic range.
        action_payload:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires action_payload (PRDB-007, "action-specific payload") with no
            field shape, and the closed vocabulary's object type needs named fields canon does not
            give. JUDGMENT: typed as an opaque payload string pending a typed per-action contract;
            a structured object or contract ref stays open.
        source_span_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; annotation_record ordered source spans (PRDB-007)"
        start_offset:
          type: integer
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; annotation_record start and end offsets (PRDB-007)"
        end_offset:
          type: integer
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; annotation_record start and end offsets (PRDB-007)"
        selected_text_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires selected_text_hash (PRDB-007) without naming the algorithm.
            JUDGMENT: typed sha256 to match the vocabulary's hash type and the repository's SHA-256
            convention; the algorithm choice stays open.
        ordering_key:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            annotation_record requires ordering_key (PRDB-007, "ordered source spans") with no format.
            JUDGMENT: typed string with no bounds; the key format stays open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnnotationUpsertResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, unauthorized]
      # JUDGMENT: the runtime row's stale_anchor_unrelocated and projection_stale map to
      # stale_projection, actor_not_authorized to unauthorized (owner_state_code_map); the row's
      # remap-or-block freshness policy is the stale_projection clause.
      aliases:
        - {command_id: cmd.prd_builder.annotate_source, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.annotation.resolve
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: fields from the catalog row plus the runtime contract row keyed by this catalog id
      # (DL-333 resolution 1: the contract file adds this id from the catalog rows).
      response_kind: owner_operation
      args:
        annotation_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row cmd.prd_builder.annotation.resolve (Concrete PRD Builder command rows, GUI / PMConcept implementation-readiness repair addendum); runtime contract payload_contract"
        document_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row and the runtime contract name document_version with no type; JUDGMENT:
            typed integer as a monotonic version counter, as in cmd.prd_builder.annotation.upsert.
        resolution_kind:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row says "resolution kind" and the runtime contract names resolution_kind, but
            neither fixes the value set. JUDGMENT: typed string pending that enum.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnnotationResolveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      # JUDGMENT: the runtime row's annotation_terminal maps to blocked_state_required and
      # stale_anchor_unrelocated to stale_projection (owner_state_code_map).
      aliases: []
    - command_id: cmd.prd_builder.conflict.resolve
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.conflict.resolve (command_kind domain_action).
      # PRDB-011's older criterion names the alias-era id cmd.prd_builder.resolve_conflict with
      # prd_id, conflict_id, selected_value, rationale and actor_ref; DL-333 resolution 1 makes the
      # runtime field list under the catalog id canonical, so that older shape stays with the alias.
      response_kind: owner_operation
      args:
        conflict_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.conflict.resolve; ConflictRecord identity conflict_id (PRDB-011)"
        selected_claim_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.conflict.resolve; guard claims_present over ConflictRecord source_refs/competing claims (PRDB-011)"
        resolution_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names resolution_reason with no type or bounds; PRDB-011's alias-era
            "optional rationale" is the same input with no bounds either. JUDGMENT: typed string, and
            required because the runtime field list carries it unconditionally; bounds stay open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdConflictResolveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's missing_claims maps to blocked_state_required
      # (owner_state_code_map); stale_projection covers block_on_stale_conflict (2.0B clause).
      aliases:
        - {command_id: cmd.prd_builder.resolve_conflict, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1); PRDB-011 records the alias-era field set"}
    - command_id: cmd.prd_builder.approve_for_planning_wizard
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.approve_for_planning_wizard (command_kind
      # domain_action); PRDB-011 names this the canonical approval command.
      response_kind: owner_operation
      args:
        prd_pack_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.approve_for_planning_wizard; PRDB-011 canonical approval command"
        pack_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names pack_version with no type; JUDGMENT: typed integer as a
            monotonic pack version; a string form is not ruled out.
        quality_report_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.approve_for_planning_wizard; quality_report record (prd_builder_runtime.records) backs guard quality_not_blocked"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdApproveForPlanningWizardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's blocking_findings and source_coverage_missing map to
      # blocked_state_required (owner_state_code_map); stale_projection covers
      # rerun_quality_before_approval (2.0B clause).
      aliases:
        - {command_id: cmd.prd_builder.approve_for_planning, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1); PRDB-011 compatibility alias"}
    - command_id: cmd.prd_builder.pack.reopen
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      # canon: runtime contract row cmd.prd_builder.pack.reopen (command_kind domain_action); the
      # history column's "currentness proof" input has no field in the runtime field list.
      response_kind: owner_operation
      args:
        approved_pack_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.pack.reopen; guard pack_exists"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds. The history column's "currentness proof" names no runtime field, so no field is
            invented for it; load_latest_pack_before_reopen is the owner's freshness policy.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdPackReopenResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      # JUDGMENT: the runtime row's pack_missing maps to blocked_state_required
      # (owner_state_code_map); stale_projection covers load_latest_pack_before_reopen (2.0B clause).
      aliases:
        - {command_id: cmd.prd_builder.reopen_pack, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
  results:
    PrdSourceImportResultV1:
      fields:
        source_manifest_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; source_manifest records exist but no typed result contract does"}
        source_security_preflight_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        source_resource_limit_receipt_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        source_intake_terminal_receipt_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        projection_job_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdAnswerUpsertResultV1:
      fields:
        ledger_turn_commit_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdAnnotationUpsertResultV1:
      fields:
        annotation_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        annotation_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        stale_anchor_relocation_receipt_ref_or_null: {type: ref, required: false, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; null when no relocation was needed (PRDB-007 relocation_ref_or_null)"}
    PrdAnnotationResolveResultV1:
      fields:
        annotation_resolution_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdConflictResolveResultV1:
      fields:
        conflict_resolution_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdApproveForPlanningWizardResultV1:
      fields:
        ApprovedPRDPack: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the approved pack snapshot the history column names; no typed result contract"}
        approval_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; handoff receipt effect; no typed result contract"}
    PrdPackReopenResultV1:
      fields:
        draft_version_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the new draft identity the history column names; no typed result contract"}
```
