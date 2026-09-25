# Shard 039: PMConcept7 Home Workspace layout — 2026-08-04

Source: `Plans/storage-plan.md`

Source lines: L18107-L18228

Source SHA256: `b3b496e2dbd00b67dae16dd37d01350a3264f598d6022bd279dcbef4b492cd8f`

---

## PMConcept7 Home Workspace layout — 2026-08-04

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
canonical_text: The sole Home layout schema authority is pm.home_workspace_layout.v1 in Plans/home_workspace_layout.schema.json, stored per project/workspace tab under home_workspace_layout.v1; earlier key/schema identifiers are read-only migration inputs and all mutation, migration, and recovery writes are transactional and readback-verified. An owner-coordinated reversible session that must hand back the exact Home layout resolves `layout_owner_snapshot:*` only through an owner-issued binding that enumerates the complete exact set of affected owner-scoped originals, where Home issues the original for the pm.home_workspace_layout.v1 record(s) it actually covers at the affected project/workspace-tab scopes, every entry carries its owner identity, scope, revision/currentness and capture sequence, and the released transaction-slot prior bytes, a content-free operation receipt, a projection and an equal value recreated without the held original and owner readback are none of them that original; one Home row is the complete original only when the Home owner's current coverage proves the affected set is exactly that row.
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
- An owner-coordinated reversible session resolves `layout_owner_snapshot:*` only through an owner-issued binding bound before that session's first Home mutation, where Home's own entry covers exactly the `pm.home_workspace_layout.v1` value(s) and revision(s) at the affected project/workspace-tab scopes with capture sequence, currentness and immutable owner readback, and the binding enumerates every other affected owner-scoped original - for example a separately owned widget/panel layout lane - with that owner's identity, scope and revision/currentness, rather than assuming one Home row is the whole affected set.
- Restoring applies each captured layout content through that owner's ordinary current transactional write/readback path only after that owner revalidates its own current authority, issuing current mutation metadata rather than replaying the captured revision or save time, and never substitutes the current mutated layout, the released transaction-slot prior bytes, a receipt, a projection or an equal value recreated without the held original and owner readback; a partial, stale, denied or unauthenticated restoration is reported as failure rather than applied, with the same original retained for retry.
- The original is held through the session's mutations, close/reload resume and failed-restoration retry, is not applied merely because the session resumed, and is released only after the session's terminal settlement or the recovery resolution that ends it.
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
preserved_exact_tokens: [pm.home_workspace_layout.v1, home_workspace_layout.v1, persisted=true, Wayland]
negative_constraints:
- Do not write compatibility keys.
- Do not emit a success event or advance successful counters before readback verification.
- Do not treat the released pending transaction-slot prior bytes, a content-free operation receipt, a projection or a fixture value as the pre-mutation original.
- Do not report one `pm.home_workspace_layout.v1` row as the complete affected layout original without the Home owner's current coverage proving that exact affected set.
- Do not release the original while a restore attempt, resume or recovery can still require it.
compatibility_only_notes:
- Earlier Home key and schema identifiers are migration inputs only.
stale_retired_dispositions:
- pm.storage_value.home_workspace_layout.v1 is retired as a competing schema identifier.
owner_hints: [Plans/storage-plan.md, Plans/home_workspace_layout.schema.json, Plans/storage_value_registry.json]
```

### Home layout original custody for an owner-coordinated reversible session (operative owner requirement)

`Plans/Planning_Wizard.md#PWIZ-023` requires the exact pre-tour layout back after Skip, a default-restore Finish
and the other already-defined restore paths. Current Home custody retains prior bytes only while one mutation is
unresolved: the operational `home_layout_transaction_slot.v1` releases them atomically at settlement and is
explicitly not a historical layout archive, the `home_layout_operation_receipt.v1` is content-free, and the
filtered reader checkpoint is disposable coverage/currentness rather than layout authority. None of them is a
held pre-mutation original across a multi-step session, a close/reload resume or a failed-restoration retry.

Operative requirement. Home owns only the values it actually covers. Before the session's first Home mutation,
the `layout_owner_snapshot:*` ref resolves only through an owner-issued binding that enumerates the complete
exact set of affected owner-scoped originals, and each enumerated entry is issued by the owner of that value
with its identity, scope, owner revision/currentness at capture, capture sequence proving capture preceded that
owner's first mutation, an immutable owner-issued resolution and readback, a hold that survives the session,
close/reload resume and failed-restoration retry, a restore that writes the exact captured layout content through
that owner's ordinary current transactional write/readback path only after that owner revalidates its own current
authority, issuing current mutation metadata rather than replaying the captured revision or save time, and
release only after terminal settlement or the recovery resolution that ends the session. Home issues the entry
for the `pm.home_workspace_layout.v1` record(s) at the affected project/workspace-tab scopes; it does not cover,
and MUST NOT be reported as covering, widget or panel layout values that other owners hold under their own
namespaces (for example the existing settled widget-layout lanes or the Progress layout namespace) or any other
affected owner record, because this same practice adds, moves, resizes or focuses a real widget. A single Home
row is the complete original only when the Home owner's current coverage proves the affected set is exactly that
row. This requirement fixes no cardinality and introduces no second layout store, key, family, retention policy,
codec, numeric TTL or native writer. A partial, stale, denied or unauthenticated restoration is reported as
failure or recovery-required with the same original retained for retry, never as applied restoration.

Implementation status. The typed custody companion, its owner capture/readback adapter and any physical
admission do not exist yet and are not admitted here. Until they exist, a ref string, a fixture, a materialized
current value or a restoration boolean proves no original, and `SP-251` continues to forbid durable checkpoint
writes, restore and resume claims; this subsection does not convert the pending transaction slot into an
archive.
