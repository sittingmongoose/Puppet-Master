# Shard 022: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L3392-L4322

Source SHA256: `97faab694153c72d63820ff8cda4b76c90bc8ae49ecc97b54f36ef6d20797ff7`

---

## Command payload definitions (DL-333, 2026-11-05)

### AMS-141 - Assistant Memory Command Payload Definitions

```yaml
plan_unit_id: AMS-141
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Typed payload definitions (DL-333) for the twelve cmd.chat.memory.* commands that UI_Command_Catalog
  UCC-084 and UCC-085 register and UCC-230 routes to this doc: the Gist Review actions verify, edit, pin,
  discard, toggle_auto_save_unverified and preview_capsule, and the maintenance commands rebuild_lexical_index,
  rebuild_semantic_index, verification_sweep, dedup_sweep, summarize_monthly and prune_archive. The definitions
  block below gives each command its args, owner request and owner result in pm.command_payload_definitions.v1,
  with error and disabled-reason codes narrowed from the overlay''s closed sets. DL-402 binds monthly
  summary and prune archive to archive-only: a memory is deleted only when the user deletes it, originals
  keep their evidence references, and neither job archives or merges a pinned memory. DL-403 holds both
  commands unavailable, automatically and from the Memory panel, until approved cutoffs exist; DL-446
  and DL-447 record the returned cutoffs and keep runs waiting for their application and the remaining
  definition, review and recording approvals; the definitions record that hold as owner state maintenance_cutoffs_pending,
  which UCC-230 maps to not_configured (DL-341). DL-444 and DL-445 keep dedup_sweep unavailable the same
  way until their answer is applied and the remaining approvals pass, recorded as owner state dedup_hold_pending,
  also mapped to not_configured; each of the three definitions ties its owner state to that code in owner_state_codes.
  The wired owner request ChatOwnerCommandRequestV2 requires a thread_id that the Project-scoped catalog
  rows do not carry, and the rows require a project_id that AMS-054 app memory leaves null; each definition
  records both disagreements in its judgments for the chat and memory owners, and chooses no thread_id
  value. prune_archive''s policy can never change DL-447''s cutoffs, pin exclusion or DL-402''s archive-only
  rule. gist_id is the canon name UCC-230''s identity_aliases records for the overlay identity memory_item_id,
  and every judgment is in its definition''s judgments list (DL-341). DL-475 adds cmd.chat.memory.add
  and cmd.chat.memory.delete and replaces Edit args with explicit memory_scope, plain text, optional title,
  gist_id and expected_revision. The new MemoryNoteAddRequestV1/MemoryNoteEditRequestV1/MemoryNoteDeleteRequestV1
  and MemoryNoteMutationResultV1 in assistant_memory_contracts.schema.json are the concrete owner contracts.
  The owner authenticates the memory scope and source constraints, checks current revision before Edit/Delete,
  infers kind, commits canonical records/tombstones before indexes, and returns a durable receipt before
  acknowledgment. Delete is not Discard; suppression prevents old transcripts/replay/rebuild/restore/import
  from silently resaving the deleted content. Bulk deletion freezes the confirmed scope and exact note
  IDs and uses this same owner for each, reporting any incomplete result honestly. Old Verify/Pin/Discard/toggle/preview
  definitions remain support/compatibility contracts with no ordinary UI producer; user dispatch cannot
  restore them or bypass support gates. Maintenance definitions retain their holds and source/admission
  gaps; this change does not enable them. These definitions add no EventRecord writer or native handler
  proof. Edit may supply destination_scope to explicitly request a supported availability change. memory_scope
  always identifies the current source; destination_scope never merely relabels it. Recheck both scopes,
  provenance and privacy, preserve versions and legacy protection, and commit destination plus source
  disposition through the same owner before claiming a move. A failure leaves the original available under
  its original scope; unavailable native cross-scope ownership stays handler_unavailable. Private app-thread
  content never broadens automatically.'
gui_related: true
gui_classification_reason: Defines the Memory page, actions or reply presentation.
depends_on: [UCC-230, UCC-084, UCC-085, CV-333, DL-333, DL-402, DL-403, DL-444, DL-445, DL-446, DL-447, DL-341]
unblocks: []
acceptance_criteria:
- The new Add/Edit/Delete requests and result have exactly one owner definition and concrete strict schema.
- No successful-save acknowledgment precedes the durable canonical write receipt.
- Scope/actor/source/read-only helper/stale-revision checks precede mutations; deletion suppression survives
  replay/rebuild/old chats.
- Legacy support commands have no ordinary UI producer; all maintenance holds remain.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- 'T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared''s answer "approve all"
  to Q5'
- /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
- cmd.chat.memory.verify
- cmd.chat.memory.edit
- cmd.chat.memory.pin
- cmd.chat.memory.discard
- cmd.chat.memory.toggle_auto_save_unverified
- cmd.chat.memory.preview_capsule
- cmd.chat.memory.rebuild_lexical_index
- cmd.chat.memory.rebuild_semantic_index
- cmd.chat.memory.verification_sweep
- cmd.chat.memory.dedup_sweep
- cmd.chat.memory.summarize_monthly
- cmd.chat.memory.prune_archive
- cmd.chat.memory.add
- cmd.chat.memory.delete
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not let summarize_monthly or prune_archive delete a memory; deletion stays the user's action (DL-402, DL-445).
  - Do not make summarize_monthly or prune_archive available before approved cutoffs exist and are applied (DL-403, DL-446, DL-447).
  - Do not make dedup_sweep available before the DL-444 and DL-445 answer is applied and the remaining approvals pass (DL-444, DL-445).
  - Do not let a prune_archive policy value select memories outside DL-447's cutoffs, include a pinned memory, or delete anything (DL-402, DL-447).
  - Do not record a judgment in a YAML comment; record it in the definition's judgments list (DL-341).
  - cmd.chat.memory.export keeps its own catalog rows (UCC-171, DL-130); this unit defines no payload for it.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: AMS-141
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
  - command_id: cmd.chat.memory.verify
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1133 row args { project_id, gist_id }; UCC-230 common optional project_id
          made required by the row.
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1133 { project_id, gist_id }; UCC-230 identity_aliases: gist_id stands for
          the UCC-084..UCC-088 overlay identity memory_item_id? (UI_Command_Catalog.md:8857; DL-341 resolution 4);
          MemoryGist id (assistant-memory-subsystem.md §3.1)'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'The production wiring row names ChatOwnerCommandRequestV2, which requires thread_id (string 1..256,
        not null; Plans/application_workflow_contracts.schema.json). The 2.8 rows (UI_Command_Catalog.md:1133-1144)
        are Project-scoped and carry no thread_id, except cmd.chat.memory.preview_capsule''s optional thread_id?,
        and the UCC-084..UCC-088 overlay requires none. Canon does not say who supplies the owner request''s thread_id
        for a Project memory command: not the Memory panel''s active thread, not the dispatch envelope, and for
        a Project-wide maintenance job canon names no thread at all. No value is chosen here: the wired request
        and the catalog rows disagree, and the chat and memory owners settle whether these commands need a thread
        or a different owner request.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'The 2.8 rows (UI_Command_Catalog.md:1133-1144) mark project_id required, while the MemoryGist scope
        envelope allows project_id=null with actual Computer/thread identity for AMS-054 app memory (assistant-memory-subsystem.md
        §3.1; AMS-054). Choice: the row''s side, so these commands act on Project memory only and app memory has
        no Gist Review or maintenance command until the memory owner decides. The other side, required: true with
        nullable: true, is not open to this definition: UCC-230 refuses nullable on a restated common optional field,
        and project_id is one. Canon disagrees here and the memory owner settles it.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1133) states no command_kind. Verify emits memory.gist.verification_requested
        and memory.gist.verified or verification_failed, a durable change to the gist.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (assistant-memory-subsystem.md §9.4) is read as not_configured.
  - command_id: cmd.chat.memory.pin
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1135 row args { project_id, gist_id, pinned }; UCC-230 common optional project_id
          made required by the row
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1135; UCC-230 identity_aliases: gist_id stands for memory_item_id (DL-341
          resolution 4); MemoryGist id (assistant-memory-subsystem.md §3.1)'
      pinned:
        type: boolean
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1135 { project_id, gist_id, pinned }; MemoryGist field pinned (bool), assistant-memory-subsystem.md
          §3.1
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1135) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1135)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1135) states no command_kind. Pin emits memory.gist.pinned or
        memory.gist.unpinned, a durable change to the gist.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.discard
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1136 row args { project_id, gist_id }; UCC-230 common optional project_id
          made required by the row
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1136; UCC-230 identity_aliases: gist_id stands for memory_item_id (DL-341
          resolution 4); MemoryGist id (assistant-memory-subsystem.md §3.1). Discard sets verification_state = Discarded
          and excludes the gist from automatic injection and default search results (§5.3).'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1136) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1136)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1136) states no command_kind. Discard emits memory.gist.discarded
        and sets verification_state = Discarded (§5.3).
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.toggle_auto_save_unverified
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1137 row args { project_id, enabled }; UCC-230 common optional project_id
          made required by the row
      enabled:
        type: boolean
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1137 { project_id, enabled }; sets ConfigKey assistant.memory.auto_save_unverified
          (default true, §9.4); AutoRunBoundary drops newly-proposed Unverified gists when disabled (§5.2.1); emits
          settings.updated
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1137) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1137)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1137) states no command_kind. The toggle sets a ConfigKey and
        emits settings.updated, a durable settings change.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no result payload for the toggle, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.preview_capsule
    ucc_units:
    - UCC-084
    command_kind: shell_view
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1138 row args { project_id, thread_id? }; UCC-230 common optional project_id
          made required by the row
      thread_id:
        type: id
        required: false
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1138 { project_id, thread_id? }; restated at its UCC-230 canonical type id,
          optional as the row marks it
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryCapsulePreviewResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1138) makes thread_id optional. When the caller supplies
        thread_id it can fill the owner request''s; canon does not say what fills it when the caller leaves it out.
        No value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1138)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: shell_view
      gap_note: The 2.8 row (UI_Command_Catalog.md:1138) states no command_kind; it says 'no persisted domain event
        (preview computation only)', so there is no domain effect to take.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.rebuild_lexical_index
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1139 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Rebuilds the Tantivy index from assistant_memory.redb (§7.2 item 1); runs in-process (§7.2
          rule).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1139) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1139)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1139) states no command_kind. The rebuild emits memory.index.lexical.rebuild.started
        and .completed and rewrites the derived index.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.rebuild_semantic_index
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1140 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Rebuilds the USearch index from assistant_memory.redb, re-embed and rebuild (§7.2 item 2);
          runs in-process (§7.2 rule).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1140) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1140)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1140) states no command_kind. The rebuild emits memory.index.semantic.rebuild.started
        and .completed and rewrites the derived index.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.verification_sweep
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1141 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Re-evaluates verification_state for all gists (§7.2 item 3); pins do not stop verification
          (DL-402).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1141) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1141)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1141) states no command_kind. The sweep emits memory.verification_sweep.started
        and .completed and re-evaluates every gist's verification_state.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.dedup_sweep
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1142 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Merges identical embed_text_hash gists (§7.2 item 4); survivor and disposition per Plans/Decision_Log.md#DL-444
          and #DL-445: the oldest eligible memory keeps its identity, merged originals are archived with their evidence
          references, never automatically deleted, and a pin-protected merge is skipped.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: dedup_hold_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1142) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1142)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1142) states no command_kind. The sweep emits memory.dedup_sweep.started
        and .completed and merges gists.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'No catalog row states disabled reasons for the memory commands. Plans/Decision_Log.md#DL-444 and
        #DL-445 (approved scope) keep automatic jobs and panel buttons unavailable until the answer is applied and
        all remaining definition, review and recording approvals pass. The definition shows that hold as owner state
        dedup_hold_pending, which UCC-230''s owner_state_code_map maps to not_configured (DL-444, DL-445; DL-341).
        assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.summarize_monthly
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1143 row args { project_id, month? }; UCC-230 common optional project_id
          made required by the row. Consolidates older low-activation Note gists into a monthly Note gist (§7.2
          item 5). Archive-only per Plans/Decision_Log.md#DL-402: originals stay archived with all their evidence
          references, a pinned memory is never archived or merged, and a memory is deleted only when the user deletes
          it.'
      month:
        type: string
        required: false
        default: none
        provenance: gap
        gap_note: 'UI_Command_Catalog.md:1143 gives the key only ({ project_id, month? }); no format or default
          is stated. DL-446 keeps "the existing monthly grouping" and fixes the selection cutoffs (Note memories
          idle at least 90 days AND usefulness score below 0.10, per Project), not a month format. Choice: an unconstrained
          optional string pending an owner format, candidate YYYY-MM. month only names which monthly group to consolidate;
          it can never change DL-446''s cutoffs, pin exclusion or archive-only rule.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: maintenance_cutoffs_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1143) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1143)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1143) states no command_kind. The job emits memory.monthly_summary.started
        and .completed and archives originals.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'Owner state maintenance_cutoffs_pending, which UCC-230''s owner_state_code_map maps to not_configured
        (DL-403; DL-341 resolution 3): neither job runs, automatically or from the Memory panel, until approved
        cutoffs exist, and the button shows unavailable with that reason. DL-446 returned the cutoffs and keeps
        runs waiting for their application and the remaining definition, review and recording approvals, so the
        state holds until then. assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.prune_archive
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1144 row args { project_id, policy? }; UCC-230 common optional project_id
          made required by the row. Archive-only per Plans/Decision_Log.md#DL-402: deletion stays the user''s action,
          a pinned memory is never archived, and archived originals keep their evidence references and versions
          (DL-447).'
      policy:
        type: string
        required: false
        default: none
        provenance: gap
        gap_note: 'UI_Command_Catalog.md:1144 gives the key only ({ project_id, policy? }) and no canon defines
          a policy shape or what a caller-supplied policy may change. DL-402 fixes archive-only and DL-447 fixes
          the selection (memories of any kind idle at least 180 days AND usefulness score below 0.05, inside each
          Project, pins excluded before scoring). Choice: the field stays an optional string with no accepted value
          until the memory owner defines it; until then the handler refuses any supplied policy with invalid_args,
          and no policy value can ever widen, narrow or replace DL-447''s eligibility test, its pin exclusion or
          DL-402''s archive-only rule.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: maintenance_cutoffs_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1144) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1144)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1144) states no command_kind. The job emits memory.prune_archive.started
        and .completed and archives memories.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'Owner state maintenance_cutoffs_pending, which UCC-230''s owner_state_code_map maps to not_configured
        (DL-403; DL-341 resolution 3): neither job runs, automatically or from the Memory panel, until approved
        cutoffs exist, and the button shows unavailable with that reason. DL-447 returned the cutoffs and keeps
        runs waiting for their application and the remaining definition, review and recording approvals, so the
        state holds until then. assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.add
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      text:
        type: string
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          min_length: 1
      title:
        type: string
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteAddRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  - command_id: cmd.chat.memory.edit
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      expected_revision:
        type: integer
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          minimum: 1
      text:
        type: string
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          min_length: 1
      title:
        type: string
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      destination_scope:
        type: contract
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; explicit availability change under DL-475
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteEditRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  - command_id: cmd.chat.memory.delete
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      expected_revision:
        type: integer
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          minimum: 1
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteDeleteRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  results:
    MemoryCapsulePreviewResultV1:
      fields:
        estimated_tokens:
          type: integer
          required: true
          default: none
          constraints:
            minimum: 0
          provenance: gap
          gap_note: the estimated token count the capsule preview MUST report (assistant-memory-subsystem.md:389),
            counting memory notes only against assistant.memory.capsule_budget_tokens (:392); canon names no field,
            and minimum 0 is chosen here
        truncated:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: whether truncation occurred because of the configured cap, which the preview MUST indicate (assistant-memory-subsystem.md:389);
            canon names no field
        capsule_budget_tokens:
          type: integer
          required: false
          default: none
          constraints:
            minimum: 0
          provenance: gap
          gap_note: the assistant.memory.capsule_budget_tokens value the count is measured against (assistant-memory-subsystem.md:392);
            canon does not say the result carries it
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: dispatch receipt (catalog.chat_memory_preview_capsule); the row persists no domain event
    MemoryMaintenanceResultV1:
      fields:
        status:
          type: enum
          values:
          - succeeded
          - failed
          required: true
          default: none
          provenance: gap
          gap_note: maintenance operations report explicit success/failure status (assistant-memory-subsystem.md:412);
            canon names neither the field nor its values
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: dispatch receipt for the job's started/completed events (UI_Command_Catalog.md:1139-1144)
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-230, ContractName:Plans/UI_Command_Catalog.md#UCC-084, ContractName:Plans/UI_Command_Catalog.md#UCC-085, ContractName:Plans/Decision_Log.md#DL-333, ContractName:Plans/Decision_Log.md#DL-402, ContractName:Plans/Decision_Log.md#DL-403, ContractName:Plans/Decision_Log.md#DL-444, ContractName:Plans/Decision_Log.md#DL-445, ContractName:Plans/Decision_Log.md#DL-446, ContractName:Plans/Decision_Log.md#DL-447, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/application_workflow_contracts.schema.json, ContractName:Plans/Contracts_V0.md#7-uicommand
