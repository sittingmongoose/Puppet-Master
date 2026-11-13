# Shard 034: DL-180 to DL-185 — Opening Files From The File Tree Into Panels (2026-10-09)

Source: `Plans/FileManager.md`

Source lines: L5368-L7584

Source SHA256: `ae91f8f664fe4836837cf8796e57ec967e68ce836f081ac1b68b1e3ca56a2f4f`

---

## DL-180 to DL-185 — Opening Files From The File Tree Into Panels (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180`, decision D7) makes Home's centre one universal panel system and
gives every file reference one set of opening rules. This addendum adds F-090: how the file tree opens files into the
panels. The rules themselves are `Plans/FinalGUISpec.md#F3-634`'s (one opening module, kept single by
`Plans/DRY_Rules.md#DR-071`), and the placement fields are `Plans/Contracts_V0.md#CV-360`'s; F-090 cites them and adds
only what is the file tree's own. It supersedes F-080 (the four stable editor panels and the Open in Panel 1 to 4
submenu) and the Home reconciliation of 2026-08-04 above it, and amends with dated notes F-009 (which panel a click
lands in), F-017 (the File Editor strip and the floating editor panels), F-023 (the focused editor group as the open
target), F-033 (file paths clicked in chat), F-034 and F-036 (the editor-panel target fields), F-040 (terminal tab
identity), F-067 ("Open in Terminal" and placement), F-073 (the minimap scrollbar stays) and the prose of sections 1,
2.1, 2.4, 4.1's route rules, 7 and 9. It creates no WorkNodes, NodeSeeds, executable queues, implementation files or
production build tasks.

### F-090 - Opening Files From The File Tree Into Panels

```yaml
plan_unit_id: F-090
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The file tree opens files into the home panels through the one opening module (DL-180, D7;
  Plans/FinalGUISpec.md#F3-634, Plans/DRY_Rules.md#DR-071) and keeps no placement or dedupe rule of
  its own. A single click on a file row opens the file in the target panel's preview tab, with an
  italic label, which the next single click replaces, and leaves keyboard focus in the tree so the
  arrow keys keep walking it; a double click opens the file kept and moves focus to its tab; an edit
  in the tab, or dragging the tab, keeps a preview tab. With the Preview Tabs setting off
  (`general.interaction.preview-tabs`, Plans/Settings_System.md#SSYS-050), a single click opens the
  file kept. Enter on a focused file row opens it as a double click does. The tree dispatches the
  existing `cmd.file.open` with the placement fields of Plans/Contracts_V0.md#CV-360 beside the file's
  identity: `mode: preview` for a single click, `mode: keep` for a double click or Enter, `where:
  panel` for Alt+click, and `background: true` for Ctrl+click (Cmd+click on macOS), which opens the
  file without taking focus. A file already open anywhere is revealed where it is, as F3-634 says.
  Alt+click opens the file in a new panel by the fit rule (Plans/FinalGUISpec.md#F3-630). The target
  of an ordinary click is the last-focused panel that holds documents, as F3-634 says; this unit does
  not restate that rule. The file row's context menu starts with Open (kept, in that target), Open in
  new panel (`where: panel`) and Open to the side (`where: right`, a new panel to the right of the
  target panel), then a separator and the existing file-tree actions of section 11. The Open in Panel
  submenu with Panel 1 to Panel 4 and its `target_editor_panel_id` routing retire. Open in Terminal on
  a folder reveals the last-focused terminal tab whose folder is that folder, else opens a new
  terminal tab there; on a file it uses the file's folder in the same way; the terminal tab lands
  where F3-634 places a terminal. A folder row's single click still expands or collapses it and opens
  nothing. Opening, revealing and keeping a file change only the Home layout and the file's tab: the
  tree's selection, expansion, filter and multi-select state are its own (F-009, F-011) and never
  written into the Home layout record. This supersedes F-080 and the editor-panel targets of F-017,
  F-034 and F-036, and amends F-009, F-023, F-033, F-040 and F-067. The same opening module and
  preview/keep rules serve explicit app file identities; Open in Terminal uses that file's admitted
  Computer/folder/profile. Conversion maps moved files and preserves outside-file/buffer identities
  without opening a second Assistant or losing unsaved edits.
gui_related: true
gui_classification_reason: Defines what a person sees happen when they click, double-click, Alt+click or right-click a file or folder in the file tree.
split_recommended: false
depends_on: [DL-180, F3-634, CV-360]
unblocks: [ATS-075, GRRC-040]
acceptance_criteria:
  - "A single click on a file row opens that file in the target panel's one italic preview tab, replacing the previous preview there, and focus stays in the tree; with Preview Tabs off it opens the file kept."
  - "A double click, or Enter on a focused file row, opens the file kept and moves focus to its tab; an edit in a preview tab or a drag of it keeps it."
  - "Each open dispatches exactly one `cmd.file.open` with CV-360's placement fields and no `target_editor_panel_id`, `target_editor_group_id` or `target_group`."
  - "Clicking a file that is already open in any panel, including a collapsed panel or one hidden in \"+N\", reveals that tab and opens no second tab."
  - "Alt+click opens the file in a new panel by the fit rule, and Ctrl+click (Cmd+click) opens it without taking focus."
  - "The file row's context menu starts with Open, Open in new panel and Open to the side, and has no Open in Panel submenu."
  - "Open in Terminal on a folder reveals the last-focused terminal tab whose folder is that folder, else opens a new terminal tab there; on a file it uses the file's folder in the same way."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D7, D8)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (sections 6 and 6.2; concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8
  (section 3.4 and gap C5; audit lineage only)
- Concepts/home-redesign/src/panels/js/48-shims.js on concept/home-panels-20261009 (the tree's clicks and its context-menu
  rows; concept lineage only)
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N3/N6/N12/N24/N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
  - "cmd.file.open"
  - "mode: preview"
  - "mode: keep"
  - "where: panel"
  - "where: right"
  - "background: true"
  - "Open in new panel"
  - "Open to the side"
  - "Open in Terminal"
negative_constraints:
  - "Do not give the file tree a placement or dedupe rule of its own."
  - "Do not open a file that is already open a second time, or move its tab."
  - "Do not route a tree open by `target_editor_panel_id`, `target_editor_group_id` or `target_group`, or offer Panel 1 to Panel 4."
  - "Do not write the tree's selection, expansion or filter into the Home layout record."
compatibility_only_notes:
  - "The concept routes the tree through a compatibility shim over its old handlers; the shim and its names are concept lineage, not product names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L11): Open in Terminal reveals the last-focused terminal tab in the target folder, else opens one there."
  - "Superseded 2026-10-09 (DL-180): F-080's Open in Panel submenu with Panel 1 to Panel 4, its four stable editor panel identities and its target_editor_panel_id routing."
owner_boundary_notes:
  - "F3-634 owns the opening rules and where a new tab lands, CV-360 the placement fields, F3-635 the tab kinds, and F3-639 the editor tab; this unit owns only the file tree's gestures and its context-menu open rows."
owner_hints:
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/FileManager.md#F-080

### F-150 - file.copied prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.copied@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.copied.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Clipboard Copy alone produces no event. A completed paste duplicates the source into a distinct result node; source identity and bytes remain unchanged. Conflict cancellation, a failed copy or a partial transfer produces no completed event. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::paste_nodes for cmd.file.paste_nodes, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_copied.schema.json
(pm.file_manager_event.file_copied.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

Actual identity requirement: result_node_ref != source_node_ref; the original resolver must also reject distinct aliases of the same native node. Claimed semantic booleans cannot override this relation.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.copied, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.copied", operation_id, original_subject_ref].
event_id is "evt_file_copied_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.copied:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_copied.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.copied,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.copied:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.copied@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.copied payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-150
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.copied@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::paste_nodes uses cmd.file.paste_nodes, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_copied.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_copied_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_copied.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.copied", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-151 - file.created prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.created@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.created.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Creation requires a single valid parent and validated name; empty names, dot/dot-dot, separators and platform-reserved names are refused before mutation. The result must be a newly committed node in that exact container. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::new_file for cmd.file.new_file, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_created.schema.json
(pm.file_manager_event.file_created.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

Actual identity requirement: result_node_ref != destination_container_ref; the resolved result is a new child of that exact existing container, never an alias of the container. Claimed semantic booleans cannot override this relation.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.created, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.created", operation_id, original_subject_ref].
event_id is "evt_file_created_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.created:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_created.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.created,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.created:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.created@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.created payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-151
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.created@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::new_file uses cmd.file.new_file, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_created.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_created_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_created.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.created", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-152 - file.deleted prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.deleted@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.deleted.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** F2-205 is adopted unchanged: default OS trash, explicitly confirmed permanent deletion for Shift+Delete or trash-unavailable, and separate FileSafe journaled same-directory tombstone custody where applicable. No quarantine label may impersonate OS trash; no silent permanent fallback. Only settled deletion emits; denial or partial deletion does not. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::delete for cmd.file.delete, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_deleted.schema.json
(pm.file_manager_event.file_deleted.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.deleted, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.deleted", operation_id, original_subject_ref].
event_id is "evt_file_deleted_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.deleted:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_deleted.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.deleted,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.deleted:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.deleted@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.deleted payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-152
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.deleted@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::delete uses cmd.file.delete, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_deleted.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_deleted_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_deleted.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.deleted", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-153 - file.exported prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.exported@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.exported.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Save Local Copy requires a verified readable source and an explicitly chosen authorized local destination. A committed copy-out preserves the source Project-relative identity and source bytes. A picker opening, offered OS drag URI, cancelled transfer or partial transfer is not export completion. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::save_local_copy for cmd.file.save_local_copy, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_exported.schema.json
(pm.file_manager_event.file_exported.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.exported, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.exported", operation_id, original_subject_ref].
event_id is "evt_file_exported_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.exported:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_exported.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.exported,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.exported:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.exported@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.exported payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-153
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.exported@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::save_local_copy uses cmd.file.save_local_copy, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_exported.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_exported_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_exported.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.exported", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-154 - file.moved prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.moved@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.moved.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Cut alone produces no event. Completed paste in move mode requires destination commit and successful source removal. Copy success with source removal failure leaves both and reports the existing error, with no completed moved event. Preserve the node identity across the move. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::paste_nodes for cmd.file.paste_nodes, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_moved.schema.json
(pm.file_manager_event.file_moved.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.moved, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.moved", operation_id, original_subject_ref].
event_id is "evt_file_moved_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.moved:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_moved.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.moved,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.moved:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.moved@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.moved payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-154
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.moved@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::paste_nodes uses cmd.file.paste_nodes, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_moved.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_moved_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_moved.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.moved", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-155 - file.renamed prepared Event Authority contract

Newly authored owner contract under DL-045 for **file.renamed@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row file.renamed.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Rename changes the basename of one exact node after name validation and FileSafe commit, preserves its node identity, and binds old and new path snapshots. It is not a copy, export or a different-parent move. Exactly one file root is the subject; no folder event substitutes for it.
The only producer is handlers::file::rename for cmd.file.rename, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/file_renamed.schema.json
(pm.file_manager_event.file_renamed.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For file.renamed, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "file.renamed", operation_id, original_subject_ref].
event_id is "evt_file_renamed_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"file.renamed:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.file_renamed.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw file.renamed,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:file.renamed:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** file.renamed@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed file.renamed payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-155
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  file.renamed@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::rename uses cmd.file.rename, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.file_renamed.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: file_renamed_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/file_renamed.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["file.renamed", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-156 - folder.copied prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.copied@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.copied.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Clipboard Copy alone produces no event. A completed paste duplicates the source into a distinct result node; source identity and bytes remain unchanged. Conflict cancellation, a failed copy or a partial transfer produces no completed event. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::paste_nodes for cmd.file.paste_nodes, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_copied.schema.json
(pm.file_manager_event.folder_copied.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

Actual identity requirement: result_folder_ref != source_folder_ref; the original resolver must also reject distinct aliases of the same native node. Claimed semantic booleans cannot override this relation.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.copied, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.copied", operation_id, original_subject_ref].
event_id is "evt_folder_copied_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.copied:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_copied.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.copied,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.copied:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.copied@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.copied payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-156
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.copied@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::paste_nodes uses cmd.file.paste_nodes, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_copied.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_copied_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_copied.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.copied", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-157 - folder.created prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.created@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.created.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Creation requires a single valid parent and validated name; empty names, dot/dot-dot, separators and platform-reserved names are refused before mutation. The result must be a newly committed node in that exact container. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::new_folder for cmd.file.new_folder, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_created.schema.json
(pm.file_manager_event.folder_created.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

Actual identity requirement: result_folder_ref != destination_container_ref; the resolved result is a new child of that exact existing container, never an alias of the container. Claimed semantic booleans cannot override this relation.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.created, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.created", operation_id, original_subject_ref].
event_id is "evt_folder_created_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.created:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_created.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.created,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.created:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.created@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.created payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-157
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.created@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::new_folder uses cmd.file.new_folder, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_created.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_created_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_created.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.created", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-158 - folder.deleted prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.deleted@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.deleted.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** F2-205 is adopted unchanged: default OS trash, explicitly confirmed permanent deletion for Shift+Delete or trash-unavailable, and separate FileSafe journaled same-directory tombstone custody where applicable. No quarantine label may impersonate OS trash; no silent permanent fallback. Only settled deletion emits; denial or partial deletion does not. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::delete for cmd.file.delete, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_deleted.schema.json
(pm.file_manager_event.folder_deleted.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.deleted, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.deleted", operation_id, original_subject_ref].
event_id is "evt_folder_deleted_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.deleted:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_deleted.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.deleted,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.deleted:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.deleted@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.deleted payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-158
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.deleted@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::delete uses cmd.file.delete, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_deleted.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_deleted_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_deleted.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.deleted", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-159 - folder.exported prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.exported@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.exported.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Save Local Copy requires a verified readable source and an explicitly chosen authorized local destination. A committed copy-out preserves the source Project-relative identity and source bytes. A picker opening, offered OS drag URI, cancelled transfer or partial transfer is not export completion. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::save_local_copy for cmd.file.save_local_copy, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_exported.schema.json
(pm.file_manager_event.folder_exported.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.exported, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.exported", operation_id, original_subject_ref].
event_id is "evt_folder_exported_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.exported:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_exported.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.exported,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.exported:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.exported@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.exported payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-159
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.exported@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::save_local_copy uses cmd.file.save_local_copy, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_exported.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_exported_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_exported.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.exported", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-160 - folder.moved prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.moved@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.moved.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Cut alone produces no event. Completed paste in move mode requires destination commit and successful source removal. Copy success with source removal failure leaves both and reports the existing error, with no completed moved event. Preserve the node identity across the move. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::paste_nodes for cmd.file.paste_nodes, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_moved.schema.json
(pm.file_manager_event.folder_moved.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.moved, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.moved", operation_id, original_subject_ref].
event_id is "evt_folder_moved_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.moved:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_moved.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.moved,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.moved:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.moved@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.moved payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-160
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.moved@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::paste_nodes uses cmd.file.paste_nodes, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_moved.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_moved_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_moved.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.moved", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```

### F-161 - folder.renamed prepared Event Authority contract

Newly authored owner contract under DL-045 for **folder.renamed@1.0.0** only; prepared without admission.
Per-family search and negative evidence: reports/event-authority-20261104/DFM.md, row folder.renamed.
No append is permitted until this exact family/version is admitted and native gates pass.

**Semantics and transitions.** Rename changes the basename of one exact node after name validation and FileSafe commit, preserves its node identity, and binds old and new path snapshots. It is not a copy, export or a different-parent move. Exactly one selected folder root is the subject; descendants belong to that root operation and are not independently reported as completed roots. Descendant counts and any manifest refs must match the original verified transfer/deletion receipt, including zero for an empty folder.
The only producer is handlers::file::rename for cmd.file.rename, through the existing FileManager transfer/mutation owner;
no watcher, clipboard-copy action, renderer or history reader emits it. Capture the actual accepted
OperationId, original command instance/correlation, Project, selected root and receipt before effects.
The payload is the closed schema Plans/event_payloads/file_manager/folder_renamed.schema.json
(pm.file_manager_event.folder_renamed.schema.v1, version 1.0.0), adopted in full. Required fields are not inferred from UI focus.

**Ordering and first custody.** Validate exact scope, permissions, FileSafe decision, source version and
conflict outcome before mutation. The original FileSafe/transfer owner settles the actual filesystem
effect and original receipt before this producer prepares a completed event. Original operation
receipt/evidence refs must authenticate the entire payload, node kind, affected set, command/handler,
timestamp and terminal result, not merely report success. Append follows that settled receipt;
terminal public completion follows the original append acknowledgement. Explicitly adopt
SP-286/CV-339 storage.first_append_receipt.resolve.v2 for semantic acknowledgement replay only,
including the original eleven-field AppendReceipt and four-field original_append_result. Full-value
recovery separately adopts storage.first_append_receipt.resolve_full_value.v1 with the exact closed
Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request containing the complete
ORIGINAL EventRecord, including its three Storage-assigned fields, never an asserted digest. Require
the actual selected canonical custody_v2 row (2.0.0), exact original event ID and recomputed CV-339
full-value commitment. The closed #/$defs/full_value_result returns first_append_receipt,
original_segment_ref and original_event_value_commitment; compare all three to that immutable row.
After every resolver, validator and copy, recheck the complete original request, frozen operation
payload/epoch, candidate, selected row, current SP-278 authority, access and control revision before
terminalization or disclosure. Alternate semantic IDs, v1/no witness, changed typed values, source or
backup skew and late changes fence; no backfill, reconstruction or fallback to semantic proof.
Use the actual current ordinary SeglogFrameV2 append/read and SP-336 group durability; no invented
per-group manifest sync. Uncertain mutation or append is recovery-required. Reconcile the original
operation receipt and first append with their original owners; never perform a second filesystem
effect to repair missing history. A lost previously issued receipt is not permission to mint one.
Failed/cancelled/no-op originals use SP-560 no_event_settled and append no completed event; uncertain
effects stay fenced. Missing or contradictory original custody fences completion. The SP-560 domain intent/receipt is
original operation custody, not a dispatchable pending-event outbox; it never authorizes effect replay.

**Identity and scope.** This schema's scope is project_only: its real project_id equals the EventRecord
Project and original command/operation scope. App operations do not acquire a fabricated Project or
this Project payload; their existing product behavior is unchanged and no app event is admitted here.
operation_id is the genuine immutable accepted OperationId, not a retry counter or newly generated
replacement. A batch has one completed event per selected root, keyed by that root's original opaque
subject ref (result_node_ref/result_folder_ref for creation, source_node_ref/source_folder_ref for
copy/export, prior_node_ref/prior_folder_ref for delete, node_ref/folder_ref for rename/move).
For folder.renamed, let T be RFC 8785 canonical JSON of the string array
[storage_instance_id, recovery_epoch_decimal, project_id, "folder.renamed", operation_id, original_subject_ref].
event_id is "evt_folder_renamed_" plus lowercase SHA-256(UTF8(T)); the scoped idempotency_key is
"folder.renamed:" plus that same digest. Envelope source is the captured command owner and envelope timestamp
equals payload ts; correlation_id equals the original command correlation. No Run or Thread is invented.
Freeze this identity with the original effect receipt; retries preserve the original epoch and tuple.
A verified older restore never renames an old operation as fresh. An actual new accepted operation
uses Storage's current recovery epoch. Duplicate identity with unequal payload/custody is a conflict.

**Replay and consumers.** reader.filemanager.folder_renamed.v1@1.0.0 is the newly authored operating
history-inspection reader of this exact family, not a mutation or tree-state projector. It explicitly
adopts SP-278 reader.storage.event_record_index@1.0.0 and its generic EventRecord-index checkpoint:
authenticate the CURRENT-selected root/generation, source frames, CRC/schema, complete coverage,
frontier, original scope and dedupe before delivery. SP-278 alone owns its durable checkpoint schema,
key, same-redb CAS advance and rebuild; this family owns no stored projection, offset or checkpoint,
and creates no storage-value registry row. Its transient read position may not be persisted.
Each live read joins its actual transaction snapshot to SP-278's nine-field durable token (DL-076);
never persist redb_snapshot_id. Replay returns the original history and receipt, with no filesystem,
clipboard, tree refresh mutation, network transfer, toast or new event. Lost acknowledgement resolves
the same first receipt; re-reading cannot claim that the current disk still matches historical state.
Generic checkpoint failure fences the reader until the actual SP-278 owner rebuilds from retained
canonical seglog. Retention gaps remain disclosed as gaps, never recreated file operations.

**Custody and retention.** Canonical seglog owns the event and coherent canonical backup; SP-286 owns
first-receipt custody. This family separately adopts SP-560 filemanager_operation_custody.v1
and its closed operation_custody, accepted_command, settlement and path_snapshot_entry schemas
in Plans/filemanager_operation_contracts.schema.json. FileManager owns its accepted intent and
settled original receipt; FileSafe/transfer owners keep their distinct original journals. The event
contains no raw paths, file-content copy, transfer manifest or undo authority.
receipt_ref is exactly pmref:filemanager_operation:<H>, where H is SP-560's SHA-256
original-operation token for the original accepted root slot. filemanager.operation_custody.resolve.v1
reads that exact table/key/store, joins Project/OperationId/family/command/correlation and frozen
acceptance recovery_epoch, and returns the immutable settlement; caller copies are not authority.
Opaque pm-path-ref:v1:project:<token> resolves through filemanager.path_snapshot.resolve.v1
only to its unique settled path_snapshot_entry in that receipt and snapshot revision, preserving
Computer/root identity, exact relative components and captured node-or-absence. The resolver
checks current access/deletion/retention before returning any private location; spelling never
proves existence. Never use current focus, current paths or another receipt as a substitute. Other pmref values resolve
only under their actual typed original owner. Reject raw paths, file bodies, credentials, URLs with
secrets and arbitrary evidence text. A retained event or backup does not grant access to a deleted,
expired or unauthorized body; render its reference unavailable. Restore reconciles the original
event/receipt/source backup epoch before reads; skew fences, never reconstructs originals.
retention_policy_ref: PENDING_RETENTION_DECISION.
Candidate existing classes: receipt/audit/source-lineage authority versus ordinary telemetry or
non-authority operational history (Storage Case L-3, SP-026; table at lines 17403-17418 at base
be4766513f). No class is selected. File bytes, OS trash and FileSafe tombstone policies remain their
own owners' policies. The generic checkpoint keeps SP-278's existing policy, with no new assignment.

**Compatibility and withdrawal.** Dispatch only this exact schema ID and 1.0.0; unknown revisions
are unavailable, never coerced or treated as sibling families. Existing unadmitted drafts gain no
historical admission. No alias, sibling outcome or app variant is admitted. To withdraw folder.renamed,
this family independently adopts SP-560 filemanager_family_control.v1 at the literal key
filemanager_family_control.v1:{hex(storage_instance_id)}:folder.renamed:1.0.0 and its closed
family_control schema. storage.filemanager_family_control.cas.v1 owns its revision-checked durable
publication under the same writer/coordinator gate as command acceptance and append issuance.
Active-to-draining CAS fences fresh dispatch and freezes exact in-flight operation keys; only those
originals may reconcile. Unresolved effects or receipts prevent final cutoff. After all issued original
receipts settle, one durable CAS publishes withdrawn with writer_cutoff_sequence equal to the last
admitted sequence and no drain members. No append crosses that final cutoff. The reader joins this
actual control, exact version and SP-278 snapshot and revalidates control revision immediately before
delivery; missing control, post-cutoff sequence or late withdrawal fences. Reader retirement sets
reader_enabled=false by the same CAS before replacement; the replacement
must prove its own version/schema and SP-278 current coverage. No family projector is rebuilt because
none exists. SP-278 rebuild never repeats original effects, rewrites originals or changes the cutoff.
Retention and writer admission remain open; this document grants no runtime authority.

**Bounded storage and current-writer refusal.** folder.renamed@1.0.0 independently adopts
SP-337/SP-340 and SP-560's physical operation_custody_value/family_control_value alternatives.
Both companions use canonical redb, coordination_and_storage, the existing advisory 2147483648-byte
canonical group budget and a 16384-byte canonical MessagePack physical-value limit. Above that limit,
store the complete logical value through the closed SP-337 reference alternative; no truncation,
inline oversized receipt or cap on legitimate drain membership. Event bodies through 16384 bytes
stay inline; larger bodies use empty payload={} and the SP-560 BLAKE3/size/media payload_ref.
Resolve and validate the exact closed folder.renamed payload before semantic checks; compare the ORIGINAL
stored EventRecord representation for full-value proof. Referents are durable before reference
publication, included in coherent backup and rechecked for exact bytes/hash/size, current access and
retention before use. Missing or changed referents fence. This family's current append AND retry
refuse replay_policy=projector_replay_only as replay_only_not_appendable; its writer uses
replay_policy=dedupe_by_idempotency_key. Compatibility replay never grants writer authority.
Retry equality selects exactly CV-339's caller-owned semantic fields, excluding Storage-assigned
sequence_id, observed_at_utc and persisted_at_utc; fetching the original complete value remains a
separate strict proof. This family's transient SP-278 delivery binding joins the exact original
storage_instance_id, recovery_epoch, event_id and encoded Project partition; a foreign checkpoint
identity fences. No family checkpoint or durable snapshot ID is introduced. Its history_settled CAS
requires the exact original settled payload, original complete EventRecord and original first receipt,
together with the strict full-value request/result/v2 witness and final equality/currentness checks.
An unrelated well-formed event or semantic-only proof cannot terminalize this operation.

**Oracles.** Plans/filemanager_event_contract_fixtures.json and
scripts/pm-filemanager-event-contracts.py cover this exact family's positive completed payload,
extra-field/missing-field/kind/scope refusals, original-identity retry and unequal retry conflict,
effect-before-append-before-ack ordering, lost receipt fencing, and side-effect-free replay.
Native original receipt authentication, filesystem races, crash/restore, permissions and actual
SP-278/SP-286 execution are required and NOT_RUN; static models do not prove them.

```yaml
plan_unit_id: F-161
unit_type: contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  folder.renamed@1.0.0 has its own prepared contract in the immediately preceding section.
  Producer handlers::file::rename uses cmd.file.rename, original operation custody, SP-286/CV-339,
  and its exact history reader reader.filemanager.folder_renamed.v1@1.0.0 through SP-278.
  No admission, stored family projection, new filesystem behavior or retention choice is granted.
gui_related: false
gui_classification_reason: Binds internal event persistence for existing file actions.
split_recommended: false
depends_on: [DL-045, SP-278, SP-286, CV-339, SP-560, CV-560, ATS-280]
unblocks: []
acceptance_criteria:
  - Exact family schema, identity, receipt ordering, replay, custody and withdrawal are enforced.
  - PENDING_RETENTION_DECISION and absent admission prohibit runtime append.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
  - python3 scripts/pm-plan-index.py validate
risk_class: file_event_original_custody
reasoning_tier: high
context_scope: folder_renamed_event_authority
implementation_surfaces: [Plans/FileManager.md, Plans/event_payloads/file_manager/folder_renamed.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md#DL-045, reports/event-authority-20261104/DFM.md]
preserved_exact_tokens: ["folder.renamed", "PENDING_RETENTION_DECISION"]
negative_constraints:
  - No event registry append or native readiness claim.
owner_hints: [Plans/FileManager.md]
```
