# Shard 022: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L3421-L4936

Source SHA256: `83fe9d2ea751a44e58850e17ea49d08f998e8f44ce46e2cbfac9ffae6e201d6b`

---

## Command payload definitions (DL-333, 2026-11-05)

### AMS-141 - Assistant Memory Command Payload Definitions

```yaml
plan_unit_id: AMS-141
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Typed payload definitions (DL-333) for the twelve cmd.chat.memory.* commands that
  UI_Command_Catalog UCC-084 and UCC-085 register and UCC-230 routes to this doc: the Gist Review
  actions verify, edit, pin, discard, toggle_auto_save_unverified and preview_capsule, and the
  maintenance commands rebuild_lexical_index, rebuild_semantic_index, verification_sweep,
  dedup_sweep, summarize_monthly and prune_archive. The definitions block below gives each command
  its args, owner request and owner result in pm.command_payload_definitions.v1, with error and
  disabled-reason codes narrowed from the overlay's closed sets. DL-402 binds monthly summary and
  prune archive to archive-only: a memory is deleted only when the user deletes it, originals keep
  their evidence references, and neither job archives or merges a pinned memory. DL-403 holds both
  commands unavailable to internal/support execution until approved cutoffs exist; no Memory-panel
  control is exposed; DL-446 and DL-447 record the returned cutoffs and keep runs waiting for their
  application and the remaining definition, review and recording approvals; the definitions record
  that hold as owner state maintenance_cutoffs_pending, which UCC-230 maps to not_configured
  (DL-341). DL-444 and DL-445 keep dedup_sweep unavailable the same way until their answer is
  applied and the remaining approvals pass, recorded as owner state dedup_hold_pending, also mapped
  to not_configured; each of the three definitions ties its owner state to that code in
  owner_state_codes. The wired owner request ChatOwnerCommandRequestV2 requires a thread_id that the
  Project-scoped catalog rows do not carry, and the rows require a project_id that AMS-054 app
  memory leaves null; each definition records both disagreements in its judgments for the chat and
  memory owners, and chooses no thread_id value. prune_archive's policy can never change DL-447's
  cutoffs, pin exclusion or DL-402's archive-only rule. gist_id is the canon name UCC-230's
  identity_aliases records for the overlay identity memory_item_id, and every judgment is in its
  definition's judgments list (DL-341). DL-475 adds cmd.chat.memory.add and cmd.chat.memory.delete
  and replaces Edit args with explicit memory_scope, plain text, optional title, gist_id and
  expected_revision. The new
  MemoryNoteAddRequestV1/MemoryNoteEditRequestV1/MemoryNoteDeleteRequestV1 and
  MemoryNoteMutationResultV1 in assistant_memory_contracts.schema.json are the concrete owner
  contracts. The owner authenticates the memory scope and source constraints, checks current
  revision before Edit/Delete, infers kind, commits canonical records/tombstones before indexes, and
  returns a durable receipt before acknowledgment. Delete is not Discard; suppression prevents old
  transcripts/replay/rebuild/restore/import from silently resaving the deleted content. Bulk
  deletion freezes the confirmed scope and exact note IDs and uses this same owner for each,
  reporting any incomplete result honestly. Old Verify/Pin/Discard/toggle/preview definitions remain
  support/compatibility contracts with no ordinary UI producer; user dispatch cannot restore them or
  bypass support gates. Maintenance definitions retain their holds and source/admission gaps; this
  change does not enable them. These definitions add no EventRecord writer or native handler proof.
  Edit may supply destination_scope to explicitly request a supported availability change.
  memory_scope always identifies the current source; destination_scope never merely relabels it.
  Recheck both scopes, provenance and privacy, preserve versions and legacy protection, and commit
  destination plus source disposition through the same owner before claiming a move. A failure
  leaves the original available under its original scope; unavailable native cross-scope ownership
  stays handler_unavailable. Private app-thread content never broadens automatically.
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
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
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
        #DL-445 (approved scope) keep internal automatic/support jobs unavailable until the answer is applied and
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
        (DL-403; DL-341 resolution 3): neither job runs, through automatic or internal support execution, until approved
        cutoffs exist, and the internal request stays unavailable with that reason. DL-446 returned the cutoffs and keeps
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
        (DL-403; DL-341 resolution 3): neither job runs, through automatic or internal support execution, until approved
        cutoffs exist, and the internal request stays unavailable with that reason. DL-447 returned the cutoffs and keeps
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


### AMS-100 - memory.dedup_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-100
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.completed@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.completed.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.completed records the already durably settled success or failure, never a fabricated success.
  No event is an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result
  refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload
  joins are governed by CV-650; persistence and read-only history by SP-630. Existing pinned protection, claim verification,
  NullMemoryProvider and locked-rule rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-101 - memory.dedup_sweep.started semantic contract

```yaml
plan_unit_id: AMS-101
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.started@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.started.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.started records acceptance before any maintenance effect. No event is an instruction to merge,
  verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text, prompts,
  embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by CV-651; persistence
  and read-only history by SP-631. Existing pinned protection, claim verification, NullMemoryProvider and locked-rule
  rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery
  are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-102 - memory.index.lexical.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-102
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.lexical.rebuild.completed records the already durably settled success or failure, never
  a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-652; persistence and read-only history by SP-632. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-103 - memory.index.lexical.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-103
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.lexical.rebuild.started records acceptance before any maintenance effect. No event is an
  instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-653; persistence and read-only history by SP-633. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-104 - memory.index.semantic.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-104
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.semantic.rebuild.completed records the already durably settled success or failure,
  never a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details
  are opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies.
  Event fields and all payload joins are governed by CV-654; persistence and read-only history by SP-634. Existing
  pinned protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion
  remains unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-105 - memory.index.semantic.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-105
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.semantic.rebuild.started records acceptance before any maintenance effect. No event is
  an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-655; persistence and read-only history by SP-635. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-106 - memory.verification_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-106
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.completed.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.verification_sweep.completed records the already durably settled success or failure, never a
  fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-656; persistence and read-only history by SP-636. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-107 - memory.verification_sweep.started semantic contract

```yaml
plan_unit_id: AMS-107
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.started.v1@1.0.0. GUI command and internal job use the
  same authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.verification_sweep.started records acceptance before any maintenance effect. No event is an instruction
  to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text,
  prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by
  CV-657; persistence and read-only history by SP-637. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-130 - memory.gist_state_changed prepared semantic contract

```yaml
plan_unit_id: AMS-130
unit_type: interface_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.gist_state_changed@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  RealMemoryProvider records one real successful MemoryGist change for each successful verify, edit, pin, unpin,
  discard or automatic mutation, including save/import, claim/evidence currentness, decay/half-life, access count/time
  and derived-field invalidation/re-derivation when they actually change canonical gist state. Exact producer entry
  points are cmd.chat.memory.verify, cmd.chat.memory.edit, cmd.chat.memory.pin, cmd.chat.memory.discard, RealMemoryProvider.upsert_gist,
  RealMemoryProvider.set_verification_state, RealMemoryProvider.record_access, RealMemoryProvider.delete_gist. All
  require the already specified Assistant-only scope and existing permission/verification rules. changed_fields
  names every changed canonical field but contains no field value. A successful verification adopts AMS-044/045
  claim-level support, resolvable scoped current evidence and the existing explicit allow_manual_verify_without_evidence
  exception; it does not invent a second verification rule. Requested verification and failed verification keep
  only their command result and append zero history events; successful verification with no real change also appends
  none. A separate authoritative automatic invalidation that actually changes a gist is one automatic mutation,
  not an event for a failed command. Pin requires false to true, unpin true to false, discard sets verification_state=Discarded;
  edit and automatic require an actual delta. One committed mutation increments the revision once; deferred or unavailable
  maintenance performs no mutation and emits nothing. The seven retired command spellings are not aliases that may
  append. This contract does not change section 7.2 archive/delete policy or decide the duplicate-sweep survivor.

  DL-407 retires memory.gist.verification_requested, memory.gist.verified, memory.gist.verification_failed, memory.gist.updated,
  memory.gist.pinned, memory.gist.unpinned and memory.gist.discarded only under this complete surviving contract.
  A request/failure never creates its own history; do not append either vocabulary twice. Existing memory-body/version
  audit custody is unchanged.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/memory_gist_state_changed, exact Project logical
  schema_id pm.memory.gist_state_changed.payload.v1 and distinct application logical schema_id pm.memory.gist_state_changed.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. Evidence has no 16-reference or other new count cap:
  section 3.1 and section 3.3 retain the complete ordered evidence list. The payload evidence_refs is that complete
  list of opaque owner pointers while the encoded full metadata body fits within the SP-337 16 KiB inline ceiling.
  If it would exceed that ceiling, evidence_refs instead holds the closed SP-337 collection descriptor defined
  by the payload schema: id (lowercase BLAKE3), size_bytes (exact integer byte count), and media_type exactly
  application/vnd.puppetmaster.memory-evidence-refs+msgpack. Its pack bytes are the complete canonical MessagePack
  evidence pointer array using the existing minimal-width/string/array encoding of pm_event_index_binding.binding_bytes,
  not gist text, claim bodies, evidence content or a second memory store. Resolve it in the original authenticated
  Storage/server/scope/thread payload store; recompute BLAKE3, byte count and canonical bytes and require durable
  bytes/index before event acknowledgment under SP-337. Compare the entire resolved array to the immutable source,
  never truncate it or compare only the descriptor. Freeze the selected inline/reference representation with the
  original operation; the unchanged CV-785 semantic digest covers it and retries reuse it. References inherit SP-765
  custody/access/deletion/backup and SP-337 hold/pack rules on append, retry and history. The reference route is
  selected only when the full list would exceed 16 KiB; the resulting full inline metadata body must still fit.
  revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalMemoryMutationSource and MemoryViewApplicationV1 under AMS-054).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  memory.gist_state_changed is read by reader.memory.gist_state_changed.history@1.0.0 for the existing memory GUI
  and audit consumers; prompt assembly reads the current authorized MemoryGist under AMS-054, never an event body
  as injection authority. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
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


  DL-407 coverage requires complete immutable MemoryGist before/after facts. Before computing any delta,
  validate every resolved record against all required MemoryGist fields in section 3.1, including kind, claims,
  summary and access_count; identity and exact scope live in the independently joined record metadata.
  Two matching projections with the same required field omitted are incomplete sources and refuse on append,
  retry and history. Optional absence remains distinct from explicit null; never supply defaults to repair a source.
  Validate exact field types before values, including booleans versus numbers and complete claim objects.
  Each before and after claim includes claim_id, text, created_at and all three AMS-044 support facts:
  evidence_support is a list of distinct opaque references forming a subset of that same gist version evidence_refs;
  support_scope is a nonempty textual account of what those references cover; currentness is exactly current,
  needs_revalidation or source_unavailable. Claim identities are distinct within a gist. Missing or wrongly typed
  nested facts refuse even when both snapshots omit the same fact. Optional gist-level claim_support/currentness
  summaries never replace the claims; when present their references and currentness use the same valid domain.
  Section 5.3 and AMS-044/045 require every after-claim to have nonempty support and currentness=current for a
  successful verify or new automatic Verified transition, in addition to the genuine owner evaluation of support,
  scope, resolvability and validity context. Only manual verify with the existing explicit configured override
  may bypass that verification gate; it never permits malformed facts, foreign support or an automatic override.
  Noncurrent retained before facts remain valid history, not current verification authority. These are structural
  checks of the existing owner rules, never deterministic natural-language entailment.
  changed_fields is exactly
  the set of canonical semantic fields whose values differ, including presence versus absence; it is never a
  manually selected subset. Revision is checked separately and is not a semantic field. Payload previous_pinned,
  pinned, previous_verification_state, verification_state, source and evidence_refs equal their resolved facts.
  For a new automatic gist, the absent before record makes every present semantic field part of changed_fields;
  previous_verification_state is null and previous_pinned is the false absence sentinel. Edits, pin/unpin, discard,
  successful verify and automatic changes all use the same exact-delta rule, including combined changes and changes
  to claims, provenance, access, evidence/currentness and derived fields. Requested, failed and unchanged verification
  have identical canonical before/after facts, zero history events and a retained command result. The seven
  retirements above depend on these complete coverage and no-event obligations; they grant no maintenance policy.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- AMS-054
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an
  after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct
  real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_ams-130
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
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
- memory.gist_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```
