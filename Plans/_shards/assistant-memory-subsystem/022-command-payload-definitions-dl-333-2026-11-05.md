# Shard 022: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L3152-L3546

Source SHA256: `a2900b860b436c37e72ccd919a1095060119e31931fdf586a0a9833a72906b3e`

---

## Command payload definitions (DL-333, 2026-11-05)

### AMS-141 - Assistant Memory Command Payload Definitions

```yaml
plan_unit_id: AMS-141
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Typed payload definitions (DL-333) for the twelve cmd.chat.memory.* commands that UI_Command_Catalog
  UCC-084 and UCC-085 register and UCC-230 routes to this doc: the Gist Review actions verify, edit, pin,
  discard, toggle_auto_save_unverified and preview_capsule, and the maintenance commands rebuild_lexical_index,
  rebuild_semantic_index, verification_sweep, dedup_sweep, summarize_monthly and prune_archive. The definitions
  block below gives each command its args, owner request and owner result in pm.command_payload_definitions.v1,
  with error and disabled-reason codes narrowed from the overlay's closed sets. DL-402 binds monthly summary and
  prune archive to archive-only: a memory is deleted only when the user deletes it, originals keep their evidence
  references, and neither job archives or merges a pinned memory. DL-403 holds both commands unavailable,
  automatically and from the Memory panel, until approved cutoffs exist; DL-446 and DL-447 record the returned
  cutoffs and keep runs waiting for their application and the remaining definition, review and recording approvals.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Gist Review panel ("Notes it took") commands.
depends_on: [UCC-230, UCC-084, UCC-085, CV-333, DL-333, DL-402, DL-403, DL-444, DL-445, DL-446, DL-447]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to AMS-141 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - summarize_monthly and prune_archive archive only and never delete, and neither archives or merges a pinned memory (DL-402).
  - summarize_monthly and prune_archive stay unavailable with their reason until approved cutoffs exist and are applied (DL-403, DL-446, DL-447).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.memory.verify, cmd.chat.memory.edit, cmd.chat.memory.pin, cmd.chat.memory.discard, cmd.chat.memory.toggle_auto_save_unverified, cmd.chat.memory.preview_capsule, cmd.chat.memory.rebuild_lexical_index, cmd.chat.memory.rebuild_semantic_index, cmd.chat.memory.verification_sweep, cmd.chat.memory.dedup_sweep, cmd.chat.memory.summarize_monthly, cmd.chat.memory.prune_archive]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not let summarize_monthly or prune_archive delete a memory; deletion stays the user's action (DL-402, DL-445).
  - Do not make summarize_monthly or prune_archive available before approved cutoffs exist and are applied (DL-403, DL-446, DL-447).
  - cmd.chat.memory.export keeps its own catalog rows (UCC-171, DL-130); this unit defines no payload for it.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: AMS-141
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  # Shared conventions for this block:
  # - gist_id is the concrete arg name for the UCC-084..088 row-group identity `memory_item_id?`
  #   (overlay table, UI_Command_Catalog.md:8858); the catalog's 2.8 rows and this doc use gist_id.
  # - owner_request and owner_result are the chat-owner V2 contracts that every wiring row of these
  #   commands names (Wiring_Matrix.production.json request_schema_ref / result_schema_ref); the
  #   domain payload carried through ChatOwnerCommandResultV2.owner_result_ref is typed nowhere yet.
  # - No catalog row states disabled_reason_codes for these commands; the subsets below are judgment
  #   drawn from the overlay's closed set.
  definitions:
    - command_id: cmd.chat.memory.verify
      ucc_units: [UCC-084]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1133 row args { project_id, gist_id }; UCC-230 common optional project_id made required by the row. The record scope envelope allows project_id=null with Computer/thread identity for app memory (assistant-memory-subsystem.md §3.1, AMS-054); the row marks the arg itself required."
        gist_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1133 { project_id, gist_id }; MemoryGist id (assistant-memory-subsystem.md §3.1); AutoMilestone dedup pair (gist_id, evidence_ref) §5.2.2"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.edit
      ucc_units: [UCC-084]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1134 row args { project_id, gist_id, patch }; UCC-230 common optional project_id made required by the row"
        gist_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1134; MemoryGist id (assistant-memory-subsystem.md §3.1)"
        patch:
          type: object
          required: true
          default: none
          fields:
            claims:
              type: list
              required: false
              default: none
              item:
                type: object
                fields:
                  claim_id:
                    type: id
                    required: false
                    default: none
                    provenance: gap
                    gap_note: "claim_id is canon (§3.2, stable within gist); whether a patch item must carry it is not stated. JUDGMENT: optional so a new claim may omit it."
                  text:
                    type: string
                    required: true
                    default: none
                    provenance: gap
                    gap_note: "text is canon (§3.2, single sentence); no length bound is stated, so none is set. Required in each patch item is judgment."
              provenance: gap
              gap_note: "claims[] is the canon gist field (§3.1) and §3.2 fixes the claim shape, but whether Edit replaces the list or edits per claim is not stated. JUDGMENT: shape only; replacement semantics assumed."
            tags:
              type: list
              required: false
              default: none
              item: {type: string}
              provenance: gap
              gap_note: "tags[] is the canon gist field (§3.1); its carriage in an edit patch is not stated anywhere."
            half_life_days:
              type: integer
              required: false
              default: none
              constraints: {minimum: 1}
              provenance: gap
              gap_note: "the per-gist half-life override stays a gist field (AMS-048, assistant-memory-subsystem.md:2787); minimum 1 day is judgment (§9.2 gives per-kind defaults, no per-gist bound)."
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:1134 gives the key only ({ project_id, gist_id, patch }); no patch shape is
            stated. AMS-048 (assistant-memory-subsystem.md:2787) makes Edit a versioned claim edit that writes a
            new gist version, keeps the prior version and its evidence history, and resets the gist to Unverified.
            JUDGMENT: the fields below are the canon-named user-editable gist surfaces of §3.1 (claims[], tags[],
            half_life_days); whether Edit may set all of them is not stated.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.pin
      ucc_units: [UCC-084]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1135 row args { project_id, gist_id, pinned }; UCC-230 common optional project_id made required by the row"
        gist_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1135; MemoryGist id (assistant-memory-subsystem.md §3.1)"
        pinned:
          type: boolean
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1135 { project_id, gist_id, pinned }; MemoryGist field pinned (bool), assistant-memory-subsystem.md §3.1"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.discard
      ucc_units: [UCC-084]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1136 row args { project_id, gist_id }; UCC-230 common optional project_id made required by the row"
        gist_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1136; MemoryGist id (assistant-memory-subsystem.md §3.1). Discard sets verification_state = Discarded and excludes the gist from automatic injection and default search results (§5.3)."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.toggle_auto_save_unverified
      ucc_units: [UCC-084]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1137 row args { project_id, enabled }; UCC-230 common optional project_id made required by the row"
        enabled:
          type: boolean
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1137 { project_id, enabled }; sets ConfigKey assistant.memory.auto_save_unverified (default true, §9.4); AutoRunBoundary drops newly-proposed Unverified gists when disabled (§5.2.1); emits settings.updated"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.preview_capsule
      ucc_units: [UCC-084]
      command_kind: shell_view                    # catalog row: "no persisted domain event (preview computation only)" (UI_Command_Catalog.md:1138); no domain effect to take
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1138 row args { project_id, thread_id? }; UCC-230 common optional project_id made required by the row"
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1138 { project_id, thread_id? }; restated at its UCC-230 canonical type id, optional as the row marks it; MemoryGist provenance thread_id is optional for traceability (§3.1)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.rebuild_lexical_index
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1139 row args { project_id }; UCC-230 common optional project_id made required by the row. Rebuilds the Tantivy index from assistant_memory.redb (§7.2 item 1); runs in-process (§7.2 rule)."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.rebuild_semantic_index
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1140 row args { project_id }; UCC-230 common optional project_id made required by the row. Rebuilds the USearch index from assistant_memory.redb, re-embed and rebuild (§7.2 item 2); runs in-process (§7.2 rule)."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.verification_sweep
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1141 row args { project_id }; UCC-230 common optional project_id made required by the row. Re-evaluates verification_state for all gists (§7.2 item 3); pins do not stop verification (DL-402)."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4); no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.dedup_sweep
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1142 row args { project_id }; UCC-230 common optional project_id made required by the row. Merges identical embed_text_hash gists preserving evidence refs (§7.2 item 4); survivor and disposition per DL-444/DL-445, merged originals archived and never automatically deleted."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: assistant.memory.enabled=false or no memory store for the scope (§9.4), and DL-444/DL-445 keep jobs and panel buttons unavailable until the answer is applied and remaining approvals pass; no catalog row states disabled reasons
      aliases: []
    - command_id: cmd.chat.memory.summarize_monthly
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1143 row args { project_id, month? }; UCC-230 common optional project_id made required by the row. Consolidates older low-activation Note gists into a monthly Note gist (§7.2 item 5); DL-402: archive-only, originals archived with all evidence references, never a pinned memory, never a deletion."
        month:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:1143 gives the key only ({ project_id, month? }); no format or default is
            stated. DL-446 keeps "the existing monthly grouping" and fixes the selection cutoffs (Note memories
            idle at least 90 days AND usefulness score below 0.10, per Project), not a month format. JUDGMENT:
            left an unconstrained optional string pending an owner format; candidate YYYY-MM.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # DL-403: neither job runs until cutoffs exist and the buttons show unavailable with the reason; DL-446 returns the cutoffs and keeps panel runs waiting for application and remaining definition, review and recording approvals
      aliases: []
    - command_id: cmd.chat.memory.prune_archive
      ucc_units: [UCC-085]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1144 row args { project_id, policy? }; UCC-230 common optional project_id made required by the row. DL-402 supersedes §7.2 item 6's archive-or-delete wording: archive only, deletion stays the user's action, never a pinned memory, originals keep evidence references and versions."
        policy:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:1144 gives the key only ({ project_id, policy? }); §7.2 item 6 says
            "policy-driven" without a policy shape. DL-402 and DL-447 fix the archive-only rule and the cutoffs
            (eligible memories of any kind idle at least 180 days AND usefulness score below 0.05, per Project);
            a caller-supplied policy override is defined nowhere. JUDGMENT: kept as an unconstrained optional
            string rather than dropped or shaped.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # DL-403: neither job runs until cutoffs exist and the buttons show unavailable with the reason; DL-447 returns the cutoffs and keeps panel runs waiting for application and remaining definition, review and recording approvals
      aliases: []
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-230, ContractName:Plans/UI_Command_Catalog.md#UCC-084, ContractName:Plans/UI_Command_Catalog.md#UCC-085, ContractName:Plans/Decision_Log.md#DL-333, ContractName:Plans/Decision_Log.md#DL-402, ContractName:Plans/Decision_Log.md#DL-403, ContractName:Plans/Decision_Log.md#DL-444, ContractName:Plans/Decision_Log.md#DL-445, ContractName:Plans/Decision_Log.md#DL-446, ContractName:Plans/Decision_Log.md#DL-447, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/application_workflow_contracts.schema.json, ContractName:Plans/Contracts_V0.md#7-uicommand
