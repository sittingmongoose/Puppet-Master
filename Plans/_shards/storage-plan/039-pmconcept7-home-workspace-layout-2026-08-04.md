# Shard 039: PMConcept7 Home Workspace layout — 2026-08-04

Source: `Plans/storage-plan.md`

Source lines: L18092-L18179

Source SHA256: `71029e417fd0d5082ac84d84db1fdf9925bc6435f7a8a6ce843cc8f350052af2`

---

## PMConcept7 Home Workspace layout — 2026-08-04

Amended 2026-10-09 (DL-180): this passage describes the v1 record. Since DL-180 the selected Home layout is `pm.home_workspace_layout.v2` at `home_workspace_layout.v2:{project_id}:{workspace_tab_id}` (SP-330). The v1 key, its compatibility keys and the record below are read-only migration inputs: converted on first read, kept unchanged and never reset. Its four-editor, four-terminal-section and four-visible-pane checks apply only to reading v1 records. The transaction, readback, quarantine and off-screen rules below carry over to the v2 record; floating bounds do not, because v2 has no floating surfaces.

Storage owns the project/workspace-tab-scoped Home presentation record under the
canonical key `home_workspace_layout.v1:{project_id}:{workspace_tab_id}` and the
registered family `home_workspace_layout`. The prototype's localStorage mirror is
`pm.homeWorkspaceLayout:v1:{project_id}:{workspace_tab_id}` and must carry the same
semantic record. The typed field authority is
`Plans/home_workspace_layout.schema.json`; this document owns scope, restore,
migration, and failure behavior rather than duplicating that schema.

The record stores stable surface references, host/slot placement, size, visibility,
collapse state, floating bounds, last dock location, focus order, layout revision,
validation, migration metadata, and save time only. It must not copy editor buffers
or tabs, dirty/undo/save authority, terminal pane trees/transcripts/PTYs, browser
history/session state, Chat threads/messages, or Dashboard widget positions/config.
Each semantic mutation is revision-checked and persisted once. Pointer-move and
resize-preview frames are local and never become storage writes, commands, or
EventRecords.

Restore reads the canonical key, then the compatibility colon key through the
StorageMigrationCoordinator. A record is accepted only after schema, stable-identity,
four-editor, four-terminal-section, four-visible-pane, bounds, and project/workspace
scope validation. Corrupt, stale, ambiguous, or off-screen records are quarantined
or rejected atomically, replaced with safe defaults, written to the canonical key,
and disclosed through the validation/recovery projection. Duplicate identities and
future versions are invalid and follow the same quarantine path. Floating bounds
outside the usable work area clamp to a visible safe rectangle; if clamping cannot
prove visibility, the surface falls back to `home_main` and retains its last dock
location. Exact native window position restoration on Wayland is best effort and
uses that same valid-dock fallback. Copy-forward is forward-only and canonical
writes never target a compatibility key.

Persistence is transactional: validate the candidate, write the canonical record,
read it back, and only then advance the committed model/revision or emit a success
event with `persisted=true`. Write or readback failure restores the exact previous
model, records a typed failure receipt, emits no success EventRecord, and does not
increment successful-persistence counters. Recovery and migration are considered
durable only after the normalized canonical record reads back successfully; the
next reload must validate as clean.

### SP-245 - Home Workspace Layout Transaction And Recovery

```yaml
plan_unit_id: SP-245
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The sole Home layout schema authority is pm.home_workspace_layout.v1 in Plans/home_workspace_layout.schema.json, stored per project/workspace tab under home_workspace_layout.v1; earlier key/schema identifiers are read-only migration inputs and all mutation, migration, and recovery writes are transactional and readback-verified. Amended 2026-10-09 (DL-180): the v1 schema and key are now read-only migration inputs, converted on first read into pm.home_workspace_layout.v2 (SP-330) and never written or reset again; the transaction, readback, quarantine and compatibility-key rules here apply unchanged to the v2 record.
gui_related: true
gui_classification_reason: The persisted layout determines visible Home placement, recovery disclosure, sizes, collapse state, and restored focus.
split_recommended: false
depends_on: [SP-244, F3-501]
unblocks: []
acceptance_criteria:
- The registry and standalone schema both use schema_id pm.home_workspace_layout.v1 and the registry points to the standalone schema owner.
- Candidate mutation validates, writes, reads back, and only then advances revision/counters or emits persisted=true.
- Write/readback failure rolls back exactly and emits a failure receipt without a success event.
- Corrupt, duplicate, future-version, malformed, and off-screen records are quarantined and replaced by a safe canonical record; a second reload is clean.
- Compatibility keys and earlier schema identifiers are read-only copy-forward sources and are never written.
- The record carries domain references only and never duplicates editor, terminal, Browser, Chat, or Dashboard internal authority.
validation_surfaces:
- python3 scripts/pm-implementation-readiness.py validate
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_layout_persistence_drift
reasoning_tier: standard
context_scope: home_layout_storage
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/home_workspace_layout.schema.json]
node_compile_hint:
  mode: home_layout_persistence
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
- Plans/Decision_Log.md#DL-180 (amendment of 2026-10-09; cited here rather than in depends_on, because DL-180 already depends on this unit through DL-147)
preserved_exact_tokens: [pm.home_workspace_layout.v1, home_workspace_layout.v1, persisted=true, Wayland]
negative_constraints:
- Do not write compatibility keys.
- Do not emit a success event or advance successful counters before readback verification.
compatibility_only_notes:
- Earlier Home key and schema identifiers are migration inputs only.
stale_retired_dispositions:
- pm.storage_value.home_workspace_layout.v1 is retired as a competing schema identifier.
- "Amended 2026-10-09 (DL-180): the v1 key is the migration input of SP-330; home_workspace_layout.v2 is the selected Home layout."
owner_hints: [Plans/storage-plan.md, Plans/home_workspace_layout.schema.json, Plans/storage_value_registry.json]
```
