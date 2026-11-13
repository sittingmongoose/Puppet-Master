# Shard 033: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Planning_Wizard.md`

Source lines: L4152-L4966

Source SHA256: `7ff2491d71ee78eec6776858e7635032b19386458d363c95a132b0e9d74895e5`

---

## Command payload definitions (DL-333, 2026-11-05)

### PWIZ-109 - Planning Wizard Command Payload Definitions

```yaml
plan_unit_id: PWIZ-109
unit_type: command_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Typed payload definitions for the twelve cmd.planning_wizard.* commands that UI_Command_Catalog
  UCC-098 registers and UCC-230 routes to this doc (DL-333). Each command's field list is the runtime
  contract row keyed by its catalog id in Plans/prd_planning_runtime_contracts.json
  ui_command_contracts (DL-333 coordinator resolution 1); that file's former ids are recorded
  compatibility aliases, and the catalog row's payload summary column is history. Planning Wizard
  owns wizard_status and its attention_required and blocked states (DL-330); the runtime contract's
  owner disabled states map to the overlay's closed codes through UCC-230 owner_state_code_map, and
  the owner words stay display detail. The definitions block below gives each command its args,
  owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1.
  The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the
  common envelope and the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Planning Wizard start, topic, amendment and Approve And Build commands.
depends_on: [UCC-230, UCC-097, UCC-098, DL-333, DL-330, DL-341, CV-333, PWIZ-001, PWIZ-003, PWIZ-014]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to PWIZ-109 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "Plans/prd_planning_runtime_contracts.json ui_command_contracts and planning_wizard_runtime (field lists under the catalog ids; DL-333 resolution 1)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.planning_wizard.start, cmd.planning_wizard.topic.open, cmd.planning_wizard.topic.add, cmd.planning_wizard.topic.split, cmd.planning_wizard.topic.merge, cmd.planning_wizard.topic.rename, cmd.planning_wizard.topic.reorder, cmd.planning_wizard.topic.mark_impacted, cmd.planning_wizard.topic.defer, cmd.planning_wizard.topic.reopen, cmd.planning_wizard.amendment.accept, cmd.planning_wizard.approve_and_build]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the runtime contract file's former ids are compatibility aliases and never dispatch.
  - Do not change the Approve And Build CAS field set (PWIZ-014) or the three input seed families (PWIZ-001) through these definitions.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Decision_Policy.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: PWIZ-109
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.planning_wizard.start
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        approved_prd_pack_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The runtime payload_contract lists approved_prd_pack_ref, but PWIZ-001 accepts exactly
            three input seed families (ApprovedPRDPack, normalized_requirements_pack,
            assistant_chat_handoff_seed) and the runtime field list names a field for only the first.
            JUDGMENT: optional ref for the ApprovedPRDPack seed; the other two seed identities have no
            field in the runtime list and none is invented here. The history column's "normalized
            requirements input" and "testing policy snapshot" name inputs the runtime list does not
            carry and stay open.
        project_context_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.start; guard project_context_current with owner state missing_project_context (owner_state_code_map -> not_configured); planning_wizard_runtime input_seed_contracts: project_context_snapshot_ref is a required field of each of the three seed contracts (ApprovedPRDPack, normalized_requirements_pack, assistant_chat_handoff_seed)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardStartResultV1
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, not_configured]
      owner_state_codes:
        - {owner_state: stale_pack, code: stale_projection}
        - {owner_state: missing_project_context, code: not_configured}
      judgments:
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The runtime row makes start a navigation_wrapper, and CV-333 gives no response_kind for it. It is
            owner_operation because the row's result_contract is a PlanningRun and its receipt effect is
            planning_run_created (Plans/prd_planning_runtime_contracts.json ui_command_contracts): the owner creates
            or opens a durable run, which a local projection cannot carry.
      aliases:
        - {command_id: cmd.planning_wizard.start_from_prd, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.open
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        planning_run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row cmd.planning_wizard.topic.open (Concrete PRD Builder, Planning Wizard, and Plan Compile command rows); runtime contract payload_contract; topic_map required field planning_run_id (planning_wizard_runtime.records)"
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row cmd.planning_wizard.topic.open; runtime contract payload_contract; guard topic_exists"
        expected_topic_map_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row and runtime contract name expected_topic_map_version; the topic_map record
            carries version (planning_wizard_runtime.records) but no type is stated. JUDGMENT: typed
            integer as a monotonic map version; a string form is not ruled out.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOpenResultV1
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      owner_state_codes:
        - {owner_state: stale_topic_map_version, code: stale_projection}
      judgments:
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The runtime row makes topic.open a navigation_wrapper, and CV-333 gives no response_kind for it. It is
            owner_operation because the row returns selected_topic_projection_ref with the receipt effect
            topic_projection_selected (Plans/prd_planning_runtime_contracts.json ui_command_contracts), an owner
            result.
      aliases: []
    - command_id: cmd.planning_wizard.topic.add
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        planning_run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.add; topic_map required field planning_run_id (planning_wizard_runtime.records)"
        topic_seed:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names topic_seed and PWIZ-003 derives topics from the input pack,
            context, work intent, risk and known defaults, but no field shape is stated and the
            vocabulary's object type needs named fields canon does not give. JUDGMENT: typed as an
            opaque seed string pending a typed seed contract; a structured object stays open.
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 1}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.add; list of refs per the UCC-230 *_ref typing; min_items 1 from the topic_operation_event invariant 'operation source_refs are non-empty' (Plans/prd_planning_runtime_contracts.json planning_wizard_runtime.records); PWIZ-003 records source refs with every topic operation"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      owner_state_codes:
        - {owner_state: ledger_sync_blocked, code: degraded}
      aliases:
        - {command_id: cmd.planning_wizard.add_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.split
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.split; guard topic_ready_for_operation"
        split_plan:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names split_plan and the history column says "split descriptors", but
            no field shape is stated and the vocabulary's object type needs named fields canon does
            not give. JUDGMENT: typed as an opaque plan string pending a typed split contract; a
            structured object stays open.
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 1}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.split; list of refs per the UCC-230 *_ref typing; min_items 1 from the topic_operation_event invariant 'operation source_refs are non-empty' (Plans/prd_planning_runtime_contracts.json planning_wizard_runtime.records); PWIZ-003 records source refs with every topic operation"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: topic_busy, code: blocked_state_required}
      aliases:
        - {command_id: cmd.planning_wizard.split_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.merge
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_ids:
          type: list
          required: true
          default: none
          item: {type: id}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.merge; list of ids per the UCC-230 *_id typing; guard topics_compatible; PWIZ-003 lists merge among the topic operations and states no item bound, so none is written"
        merge_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names merge_reason with no type or bounds; the history column's
            "target label" input has no field in the runtime list. JUDGMENT: typed string with no
            bounds; bounds stay open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: dependency_conflict, code: blocked_state_required}
      judgments:
        - key: omitted:source_refs
          choice: omitted
          gap_note: >-
            Canon conflict inside the runtime file: topic_operation_event requires source_refs for every topic
            operation and its invariant says "operation source_refs are non-empty"
            (planning_wizard_runtime.records), and PWIZ-003 records source refs with every operation, but the merge
            row's payload_contract (topic_ids, merge_reason) has no source_refs. DL-333 resolution 1 makes the row's
            field list canonical, so the field is not added; the runtime file needs the fix.
      aliases:
        - {command_id: cmd.planning_wizard.merge_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.rename
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.rename; guard topic_exists"
        new_title:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names new_title (the history column says "new label") with no type or
            bounds. JUDGMENT: typed string with no bounds; bounds stay open.
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
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: duplicate_title, code: blocked_state_required}
      judgments:
        - key: omitted:source_refs
          choice: omitted
          gap_note: >-
            Canon conflict inside the runtime file: topic_operation_event requires non-empty source_refs and names
            rename as an explicit operation (planning_wizard_runtime.records), and PWIZ-003 records source refs with
            every operation, but the rename row's payload_contract (topic_id, new_title, reason) has none. DL-333
            resolution 1 makes the row's field list canonical, so the field is not added; the runtime file needs
            the fix.
      aliases:
        - {command_id: cmd.planning_wizard.rename_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.reorder
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.reorder; the history column's before/after target names the neighbours, not separate fields"
        target_order:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names target_order with no type; JUDGMENT: typed integer as a
            position in the topic order; whether it is an absolute index or relative to the
            before/after target is not stated and stays open.
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
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: dependency_order_conflict, code: blocked_state_required}
      judgments:
        - key: omitted:source_refs
          choice: omitted
          gap_note: >-
            Canon conflict inside the runtime file: topic_operation_event requires non-empty source_refs and names
            reorder as an explicit operation (planning_wizard_runtime.records), and PWIZ-003 records source refs
            with every operation, but the reorder row's payload_contract (topic_id, target_order, reason) has none.
            DL-333 resolution 1 makes the row's field list canonical, so the field is not added; the runtime file
            needs the fix.
      aliases:
        - {command_id: cmd.planning_wizard.reorder_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.mark_impacted
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_ids:
          type: list
          required: true
          default: none
          item: {type: id}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.mark_impacted; PWIZ-005 propagates impact through typed topic dependencies"
        impact_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names impact_reason with no type or bounds; the history column's
            "dependency refs" input has no field in the runtime list. JUDGMENT: typed string with no
            bounds.
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 1}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.mark_impacted; list of refs per the UCC-230 *_ref typing; min_items 1 from the topic_operation_event invariant 'operation source_refs are non-empty' (Plans/prd_planning_runtime_contracts.json planning_wizard_runtime.records); PWIZ-003 records source refs with every topic operation"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardMarkImpactedResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: missing_impact_evidence, code: blocked_state_required}
      aliases:
        - {command_id: cmd.planning_wizard.mark_impacted, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.defer
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.defer; guard defer_allowed"
        defer_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names defer_reason with no type or bounds; the history column's
            "dependency/currentness refs" input has no field in the runtime list. JUDGMENT: typed
            string with no bounds.
        reopen_condition:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reopen_condition with no type or shape; JUDGMENT: typed string
            with no bounds; whether it is a free-form condition or a typed predicate stays open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: required_topic, code: blocked_state_required}
      judgments:
        - key: omitted:source_refs
          choice: omitted
          gap_note: >-
            Canon conflict inside the runtime file: topic_operation_event requires non-empty source_refs for every
            topic operation (planning_wizard_runtime.records), and PWIZ-003 records source refs with every
            operation, but the defer row's payload_contract (topic_id, defer_reason, reopen_condition) has none.
            DL-333 resolution 1 makes the row's field list canonical, so the field is not added; the runtime file
            needs the fix.
      aliases:
        - {command_id: cmd.planning_wizard.defer_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.topic.reopen
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        topic_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.topic.reopen; guard topic_reopenable"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; the history column's
            "currentness refs" input has no field in the runtime list. JUDGMENT: typed string with no
            bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardTopicOperationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: topic_not_deferred_or_ready, code: blocked_state_required}
      judgments:
        - key: omitted:source_refs
          choice: omitted
          gap_note: >-
            Canon conflict inside the runtime file: topic_operation_event requires non-empty source_refs for every
            topic operation (planning_wizard_runtime.records), and PWIZ-003 records source refs with every
            operation, but the reopen row's payload_contract (topic_id, reason) has none. DL-333 resolution 1 makes
            the row's field list canonical, so the field is not added; the runtime file needs the fix.
      aliases:
        - {command_id: cmd.planning_wizard.reopen_topic, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.amendment.accept
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        amendment_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.amendment.accept; planning_amendment required field amendment_id"
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          constraints: {min_items: 1}
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.amendment.accept; planning_amendment required field source_refs; list of refs per the UCC-230 *_ref typing; min_items 1 from the guard source_refs_present, its owner state missing_source_lineage and the planning_amendment invariant 'accepted amendments require source evidence and approver' (planning_wizard_runtime.records)"
        approver_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.amendment.accept; planning_amendment required field approver_ref; guard approver_present with owner state missing_approver (owner_state_code_map -> permission_required)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardAmendmentAcceptResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, permission_required]
      owner_state_codes:
        - {owner_state: missing_source_lineage, code: blocked_state_required}
        - {owner_state: missing_approver, code: permission_required}
      aliases:
        - {command_id: cmd.planning_wizard.accept_amendment, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.planning_wizard.approve_and_build
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 envelope common optional project_id restated required; the approval payload carries project_id (Planning_Wizard.md:103; catalog row UI_Command_Catalog.md:8585), and it is the first of the runtime row's idempotency_key_fields (Plans/prd_planning_runtime_contracts.json ui_command_contracts)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "UCC-230 envelope common optional idempotency_key (string, max_length 256) restated required; the approval payload carries the deterministic idempotency key (Planning_Wizard.md:103; UI_Command_Catalog.md:8585), derived from the runtime row's idempotency_key_fields; PWIZ-014 duplicate-delivery rule (Planning_Wizard.md:819, :830)"
        planning_run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.approve_and_build; approve_and_build_cas_fields (planning_wizard_runtime)"
        planning_run_revision:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names planning_run_revision (PWIZ-014 "exact PlanningRun
            revision") with no type; JUDGMENT: typed integer as a monotonic revision counter; a string
            form is not ruled out.
        named_plan_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.approve_and_build; approve_and_build_cas_fields; the NamedPlan owner-join contract (PWIZ-001)"
        topic_map_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names topic_map_version with no type; JUDGMENT: typed integer
            as a monotonic map version, as in cmd.planning_wizard.topic.open.
        approved_plan_pack_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.approve_and_build; approve_and_build_cas_fields; the ApprovedPlanPack identity (PWIZ-010, Planning_Wizard.md:718; PWIZ-014, :819)"
        pack_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names pack_version with no type; JUDGMENT: typed integer as a
            monotonic pack version.
        pack_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            PWIZ-014 requires the pack hash without naming the algorithm. JUDGMENT: typed sha256 to
            match the vocabulary's hash type and the repository's SHA-256 convention; the algorithm
            choice stays open.
        project_context_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.planning_wizard.approve_and_build; planning_wizard_runtime input_seed_contracts: project_context_snapshot_ref is a required field of each of the three seed contracts (ApprovedPRDPack, normalized_requirements_pack, assistant_chat_handoff_seed)"
        project_context_snapshot_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names the project-context snapshot hash without an algorithm;
            JUDGMENT: typed sha256 as with pack_hash.
        planunit_index_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names the PlanUnit index hash without an algorithm; JUDGMENT:
            typed sha256 as with pack_hash.
        acceptance_unit_index_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names the acceptance-unit index hash without an algorithm;
            JUDGMENT: typed sha256 as with pack_hash.
        testing_policy_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names the testing policy hash without an algorithm; JUDGMENT:
            typed sha256 as with pack_hash.
        final_audit_closure_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            approve_and_build_cas_fields names the final audit/closure hash without an algorithm;
            JUDGMENT: typed sha256 as with pack_hash.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanningWizardApproveAndBuildResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: topics_not_ready, code: blocked_state_required}
        - {owner_state: zero_incomplete_failed, code: blocked_state_required}
        - {owner_state: stale_project_context, code: stale_projection}
        - {owner_state: stale_planning_run_revision, code: stale_projection}
        - {owner_state: stale_named_plan, code: stale_projection}
        - {owner_state: stale_topic_map_version, code: stale_projection}
        - {owner_state: stale_approved_plan_pack, code: stale_projection}
        - {owner_state: stale_planunit_index, code: stale_projection}
        - {owner_state: stale_acceptance_index, code: stale_projection}
        - {owner_state: stale_testing_policy, code: stale_projection}
        - {owner_state: stale_final_audit_closure, code: stale_projection}
      judgments:
        - key: field:project_id
          choice: restated required from the envelope's common optional project_id
          gap_note: >-
            Canon conflict. The owner prose (Planning_Wizard.md:103) and the catalog row (UI_Command_Catalog.md:8585)
            put project_id in the approval payload, and the runtime row's idempotency_key_fields start with it, but
            the runtime payload_contract leaves it out (Plans/prd_planning_runtime_contracts.json
            ui_command_contracts). The definition keeps the runtime field list as DL-333 resolution 1 requires and
            makes the envelope's project_id required, which the narrowing rule allows, so the deterministic key PWIZ-014
            relies on can be derived from the payload.
        - key: field:idempotency_key
          choice: restated required from the envelope's common optional idempotency_key
          gap_note: >-
            The runtime payload_contract does not list it, but Planning_Wizard.md:103 and the catalog row
            (UI_Command_Catalog.md:8585) put the "deterministic idempotency key" in the payload, and PWIZ-014 says
            duplicate delivery with the same CAS inputs and idempotency key returns the same PlanCompileRun
            (Planning_Wizard.md:819, :830). A dispatch without it could not meet that rule, so the envelope field is
            made required (narrowing only; its type stays the envelope's).
      aliases: []
  results:
    PlanningWizardStartResultV1:
      fields:
        PlanningRun: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the created or opened PlanningRun record (Planning_Wizard.md:1649 fields); no typed result contract"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "planning_run_created effect of the runtime row; no typed result contract"}
    PlanningWizardTopicOpenResultV1:
      fields:
        selected_topic_projection_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; topic_projection_selected effect; no typed result contract"}
    PlanningWizardTopicOperationResultV1:
      fields:
        topic_operation_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token shared by the add/split/merge/rename/reorder/defer/reopen rows; topic_operation_event record exists but no typed result contract does"}
    PlanningWizardMarkImpactedResultV1:
      fields:
        invalidation_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; topics_invalidated effect; no typed result contract"}
    PlanningWizardAmendmentAcceptResultV1:
      fields:
        amendment_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; amendment_accepted effect; no typed result contract"}
    PlanningWizardApproveAndBuildResultV1:
      fields:
        plan_compile_run_id: {type: id, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; PWIZ-014 returns the PlanCompileRun identity synchronously; no typed result contract"}
        launch_state: {type: string, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no value set stated, typed string pending that enum"}
        approval_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; approval receipt effect; no typed result contract"}
        approval_cas_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; approval_cas_receipt effect (PWIZ-014 atomic write); no typed result contract"}
```

### PWIZ-097 - Deferred Intake wizard.opened Observation

```yaml
plan_unit_id: PWIZ-097
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: wizard.opened is a newly authored technical event binding under DL-045 for the already specified
  UCC-032 deferred Planning Wizard intake; it does not revive Chain Wizard or alias another event name. UCC-002/current
  section 2.1A normalizes cmd.project.chain_wizard_open_deferred as a compatibility command spelling before admission,
  and PWIZ-001 admits exactly ApprovedPRDPack, normalized_requirements_pack and assistant_chat_handoff_seed. PWIZ-002/SP-216
  own the real PlanningRun, Named Plan, thread_group_id and actual planning_wizard/intake child identity. Observe
  the existing successful open result for the real Project and actual current PlanningRun intake child, after owner
  route/currentness and permission validation. Opening is not proof of seed acceptance; a route click, attempt or
  failed open emits nothing. predecessor_event_id is null. This event never creates or selects a child on replay.
  The exact producer is emitter.wizard_opened@1.0.0, the current Planning Wizard deferred-intake owner continuation,
  never a GUI callback or generic projector. An admitted current command result supplies actual immutable request_id,
  child, source seed version/hash, parent joins and project-context refs; focus, fabricated Project, raw transcript
  and old Chain Wizard lifecycle are refused. Source refs preserve warnings, amendments/lineage and all compatible
  work-intent axes from the current seed; neither this fact nor its reader edits those owners. CV-594 owns the independent
  closed payload and identity recipe; Plans/storage-plan.md#wizard-opened-original-custody owns its independent
  original source, SP-286 receipt, SP-278 history and withdrawal contract. Current writes remain disabled pending
  this exact family's later admission and retention disposition. This observation changes no existing product action
  or user-visible result boundary. Original custody and restore remain independently required; a successful static
  fixture never supplies native source authority.
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-001
- PWIZ-002
- UCC-032
- SP-216
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.opened
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```


### PWIZ-098 - Deferred Intake wizard.deferred_payload.loaded Observation

```yaml
plan_unit_id: PWIZ-098
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: wizard.deferred_payload.loaded is a newly authored technical event binding under DL-045 for the
  already specified UCC-032 deferred Planning Wizard intake; it does not revive Chain Wizard or alias another event
  name. UCC-002/current section 2.1A normalizes cmd.project.chain_wizard_open_deferred as a compatibility command
  spelling before admission, and PWIZ-001 admits exactly ApprovedPRDPack, normalized_requirements_pack and assistant_chat_handoff_seed.
  PWIZ-002/SP-216 own the real PlanningRun, Named Plan, thread_group_id and actual planning_wizard/intake child
  identity. Observe the existing successful acceptance/loading result of one PWIZ-001 canonical seed into the actual
  current PlanningRun intake child. The original successful open event and its exact first receipt must already
  resolve; predecessor_event_id is that wizard.opened event for the same original request, child, Project, Named
  Plan, seed and context. Loading is distinct from opening; route-open, a stale seed, unsupported raw legacy payload
  or failed load emits nothing. Receipt-backed acceptance is not a compile/approval/execution grant. The exact producer
  is emitter.wizard_deferred_payload_loaded@1.0.0, the current Planning Wizard deferred-intake owner continuation,
  never a GUI callback or generic projector. An admitted current command result supplies actual immutable request_id,
  child, source seed version/hash, parent joins and project-context refs; focus, fabricated Project, raw transcript
  and old Chain Wizard lifecycle are refused. Source refs preserve warnings, amendments/lineage and all compatible
  work-intent axes from the current seed; neither this fact nor its reader edits those owners. CV-595 owns the independent
  closed payload and identity recipe; Plans/storage-plan.md#wizard-deferred-payload-loaded-original-custody owns
  its independent original source, SP-286 receipt, SP-278 history and withdrawal contract. Current writes remain
  disabled pending this exact family's later admission and retention disposition. This observation changes no existing
  product action or user-visible result boundary. Original custody and restore remain independently required; a
  successful static fixture never supplies native source authority.
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-001
- PWIZ-002
- UCC-032
- SP-216
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.deferred_payload.loaded
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```
