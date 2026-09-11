# Shard 032: Additive Correction v4 — Folder Attachments Through The Shared Command (2026-09-03)

Source: `Plans/FileManager.md`

Source lines: L5020-L5113

Source SHA256: `475b7caf333953b55140093950edc73b8eae379e5cbcb912d0c515565216b9a4`

---

## Additive Correction v4 — Folder Attachments Through The Shared Command (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`FOLDER-001..008`) to this owner.

### FOLDER-001..003 — One attachment command, one owner

Files and folders both normalize through `cmd.chat.attachment.add` with
`semantic_kind: file | folder`, using the shared attachment request and result owner. The
attachment picker, drag-and-drop, and a File Manager reference path all converge on it. No
parallel folder attachment service exists.

`cmd.chat.add_file_reference` survives only as a **file-specific compatibility alias** to the
shared command. It rejects `semantic_kind: folder`. Its former statement that all folder
references are out of scope is retired.

No `cmd.chat.add_folder_reference` and no folder-specific handler, event, or storage family is
created. A command census must find no independent folder effect; attachment ownership is not
duplicated.

### FOLDER-004 — A folder is a bounded manifest, not a dump

A folder attachment carries a bounded manifest and reference:

```text
folder_root_identity      exact root path identity plus its stable reference
entries / hash policy     which entries are enumerated and how they are hashed
exclusions                ignore rules actually applied
permissions               the read scope that was granted
materialization_status    what has been materialized versus referenced
```

The context compiler selects bounded content from that manifest. A folder is never recursively
dumped into every prompt.

### FOLDER-005..006 — Scheduling and later change

A scheduled folder reference freezes the exact retained manifest and hash and holds or fails when
that version is unavailable at dispatch. Current folder contents are never substituted and the
manifest is not rebuilt at dispatch without an explicit user policy. This is the folder side of
`SMSG-008`.

A folder that changed after a message was sent is disclosed through changed or stale state while
preserving what the agent actually saw. Details show captured versus current identity; historical
message context is never rewritten.

### FOLDER-007..008 — Shared capabilities and separate identities

Folder open, reveal, export, and download reuse File Manager and artifact capabilities with exact
permission and currentness checks. An unsupported download or export is disabled with a stated
reason rather than reimplemented as chat-local file transfer code.

The folder manifest and any selected extracted contents keep separate identities, so context
selection never mutates the attachment itself. A materialization receipt records what was
included and what was omitted, and one extraction is never treated as the folder's canonical
bytes.

### F-082 - Attachment Command Owner And Unmaterialized Contract Boundary

```yaml
plan_unit_id: F-082
unit_type: integration_contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The eight existing cmd.chat.attachment commands add, remove, retry, open, download, details,
  freeze_reference and save_to_project remain File Manager-owned. Their exact request/result
  names and sole handlers are the existing UCC-156 declarations with UCC-158 corrections, not new chat-local file services.
  Attachment identity, captured version, permissions, bounded folder materialization and originating
  thread/composer identity survive every route. FileSafe alone owns project writes. Owner placement,
  named contracts and production-intent rows are not proof that machine schemas or native effects exist.
gui_related: true
gui_classification_reason: Attachment tray, details, viewers, downloads and save controls are visible file-owner consumers.
depends_on: [F-048, UCC-156, UCC-158, DR-040, DR-041]
unblocks: []
acceptance_criteria:
  - Reuse the eight exact catalog command IDs, named request/result contracts and sole future handlers; add no folder command or independent transfer service.
  - Picker, drag-and-drop and file-reference paths converge on attachment.add; the existing add_file_reference alias remains file-only and cannot create a peer handler.
  - Remove changes only the selected unsent tray member; retry resumes its recorded failed operation and neither action clears unrelated composer state.
  - Open, download and details resolve the recorded attachment/version and disclose unavailable, stale, unsupported, retained or redacted states rather than substituting current bytes.
  - Freeze_reference captures the exact send-time project reference; save_to_project delegates to FileSafe with exact path, permission and lineage binding.
  - Folder manifest and selected extraction identities remain separate; scheduled and historical content never silently follows current folder bytes.
  - Touch Closure carries one partial row per command. Markdown contract refs denote owner declarations only; absent executable request/result/error schemas, native dispatch, storage, receipt and GUI proof remain explicit gaps.
  - Required unadmitted event families block their effect; an empty production event list or a receipt cannot authorize an otherwise inadmissible mutation.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, scripts/pm-assistant-contract-check.py, future native attachment identity permission folder FileSafe and reverse-route fixtures]
risk_class: attachment_owner_split_or_false_contract_closure
reasoning_tier: high
context_scope: attachment_owner_reference_repair
implementation_surfaces: [Plans/FileManager.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: owner_and_touch_accounting_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/UI_Command_Catalog.md#UCC-158, PM_Assistant_v2_Additive_Correction_v4:FOLDER-001..008]
negative_constraints: [No invented machine schema or native proof., No peer file or folder transfer owner., No loss of captured version or source identity., No event or readiness admission.]
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-158, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/DRY_Rules.md#DR-040
