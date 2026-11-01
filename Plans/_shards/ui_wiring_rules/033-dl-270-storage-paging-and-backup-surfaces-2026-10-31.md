# Shard 033: DL-270 storage, paging and backup surfaces (2026-10-31)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L3081-L3144

Source SHA256: `bf85fac4055a8edc70399ddc80f3d071d210eba1c16e1e89e966e5c3a787cd09`

---

## DL-270 storage, paging and backup surfaces (2026-10-31)

### UIW-046 - Storage Health And Backup Status Are Projections; Paging And The Inspector Read Through Commands

```yaml
plan_unit_id: UIW-046
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  DL-270. A display of owner state is a projection, not a wiring row: Storage health (each storage group's usage against
  its disk budget, reclaimable bytes, last compaction; SP-340), the Last verified backup line and the line saying
  what a restore from it would lose (BRS-031) dispatch nothing and receive no production row, because a row asserts
  a real cmd.* identity (UIW-018). Their actions are the existing commands: cmd.settings.open_storage_retention opens
  Storage health, cmd.storage.compaction.request is the only manual space action (Reclaim space), and
  cmd.backup.verify, cmd.backup.open_details and cmd.backup.open_history are the backup consumers. Reverse coverage
  is required: a completed reclaim updates the last-compaction line from the storage_maintenance_operation result,
  and a completed verification updates the Last verified backup line from the latest verification receipt joined
  with its capture point (time and last event), with an explicit no verified backup state. The record inspector
  opens a record only through cmd.storage.open_value; every control that does so is its own element row on that
  command, and filtering, paging, selection and expansion inside the inspector are view-local and ephemeral and
  dispatch nothing (the viewer rule of FinalGUISpec). Older chat history loads through cmd.chat.load_older only: the
  Load 50 older button and the history list's near-top threshold are two producers of one request that returns one
  sealed 50-item page, never a replay of events; the control is required, not optional (ACD-242). Opening a thread
  and expanding an item add no paging command: open reads the first page, expand reads one body. pm db dump,
  pm inspect, pm tail and pm export are command-line tools, not UICommands, and take no row. This unit owns only the
  wiring rule; storage content, budgets and page format stay with SP-338 to SP-340 and BRS-031.
gui_related: true
gui_classification_reason: Governs how Storage health, backup status, the record inspector entry and chat paging controls bind to commands.
split_recommended: false
depends_on: [UIW-018, UIW-044, WM-098, DL-270, SP-339, SP-340, ACD-242, BRS-031]
unblocks: []
acceptance_criteria:
  - "Storage health and the Last verified backup line have no production row and no command, and each names its reverse source."
  - "The Reclaim space, record-open and Load 50 older controls each resolve one command and one sole handler."
  - "In-inspector filter, paging, selection and follow dispatch nothing, and opening a record writes no file."
  - "A thread opens without replay and loads older pages only through cmd.chat.load_older."
validation_surfaces:
  - "python3 scripts/pm-plans-verify.py validate-wiring-matrix"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_projection_row_or_replay_on_open
reasoning_tier: high
context_scope: dl270_storage_wiring
implementation_surfaces:
  - "Plans/UI_Wiring_Rules.md"
  - "Plans/Wiring_Matrix.production.json"
node_compile_hint:
  mode: static_wiring_rule_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
preserved_exact_tokens:
  - "cmd.storage.open_value"
  - "cmd.chat.load_older"
  - "Load 50 older"
negative_constraints:
  - "Do not give a projection a production row."
  - "Do not make Load 50 older optional or replay events to open a thread."
owner_hints:
  - "Plans/UI_Wiring_Rules.md"
```

ContractRef: ContractName:Plans/Wiring_Matrix.md#WM-098, ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/UI_Command_Catalog.md#UCC-212
