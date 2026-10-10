# Shard 023: PMConcept7 Home Workspace event contracts — 2026-08-04

Source: `Plans/Contracts_V0.md`

Source lines: L3597-L3680

Source SHA256: `5282f46ee31d3568ee0b595606144e3c11e0381b256e5082cc48205e637c704e`

---

## PMConcept7 Home Workspace event contracts — 2026-08-04

Amended 2026-10-09 (DL-180, DL-181): `workspace.layout_changed` now uses the 2.0.0 payload of CV-361, whose `change` names each committed structural change of the v2 Home layout (SP-330); the 1.1.0 payload described below stays readable through its compatibility reader. `terminal.workgroup_moved` is withdrawn under SMPFS-170's rule: no producer writes it, and moving a terminal tab is a `tab_moved` that keeps its session. `panel.undocked` and `panel.redocked` stay for the chat's pop-out only. Home commands carry panel, tab and split ids where they used surface and workgroup ids. The receipt outcomes below (`applied`, `no_change`, `cancelled`, `failed` with `rolled_back=true`) stand unchanged.

The existing `UICommand` and `EventRecord` envelopes remain canonical. Home
commands carry `project_id`, `workspace_tab_id` where applicable, a stable
surface/workgroup identity, expected revision, idempotency key, origin, and
correlation ID. Pointer-move and resize-preview frames are UI-local and emit no
persisted event.

Where no equivalent exists, the event registry adds these typed EventRecord
families:

- `workspace.layout_changed` uses
  `Plans/event_payloads/workspace_layout_changed.schema.json` and records the
  prior/new layout revision, mutation kind, affected surface identities,
  source/target host, target slot, target surface/insertion edge when applicable,
  command/correlation identity, and `persisted=true` only after verified durable
  commit.
- `terminal.workgroup_moved` uses
  `Plans/event_payloads/terminal_workgroup_moved.schema.json` and records the
  workgroup, source/target sections, contained pane/session references, section
  creation, and the invariant `preserve_session_identity=true`.

Existing `panel.undocked`, `panel.redocked`, Browser session, file-open, and
terminal session events remain authoritative for their domains. Home movement
does not create a parallel panel, browser, chat, terminal-session, PTY, or widget
identity contract.

Every selected Home leaf action produces a typed dispatch receipt. Successful
layout mutation has `outcome=applied` and links the committed EventRecord;
idempotent focus/already-open actions use `outcome=no_change` with a reason and
never fabricate a changed event; disabled actions do not dispatch; cancellation
uses `outcome=cancelled` only when a domain command was already admitted and
otherwise remains view-local; persistence failure uses `outcome=failed` with
`rolled_back=true`, prior revision, and failure reason, and has no success
EventRecord. Disclosure-only menu/flyout opening has no receipt because it is not
a UICommand.

### CV-323 - Home Command Event And Receipt Contract

```yaml
plan_unit_id: CV-323
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Home leaf actions bind the canonical UICommand envelope to precise applied, no_change, cancelled, disabled-before-dispatch, and failed-rollback outcomes; workspace.layout_changed and terminal.workgroup_moved carry exact identity, revision, host, insertion, correlation, and persistence truth without fabricated command-applied events.
  Amended 2026-10-09 (DL-180, DL-181): new workspace.layout_changed events use CV-361's 2.0.0 payload, whose change names the structural change and whose id lists name the panels, tabs and splits it touched, in place of the host, slot and insertion fields; terminal.workgroup_moved is withdrawn under SMPFS-170's rule and has no producer; the receipt outcomes stand unchanged.
gui_related: true
gui_classification_reason: The contract drives visible Home success, disabled, cancellation, failure, and recovery projections.
split_recommended: false
depends_on: [CV-322, F3-501, SP-245, UCC-144]
unblocks: []
acceptance_criteria:
- workspace.layout_changed includes exact changed surface IDs, prior/new revision, source/target host, target slot, target/insertion fields, command/correlation identity, and persisted=true only after readback.
- terminal.workgroup_moved includes workgroup, source/target section, contained pane/session IDs, section-created state, command/correlation identity, and preserve_session_identity=true.
- Since 2026-10-09 (DL-180, DL-181) the two criteria above describe 1.1.0 and 1.0.0 events already written; new workspace.layout_changed events follow CV-361 and no producer writes terminal.workgroup_moved.
- Persistence failure emits a failed rolled-back receipt and no success event; no-change and cancellation never fabricate changed events.
- Disclosure-only popup/flyout actions remain view-local and do not dispatch.
validation_surfaces:
- python3 scripts/pm-implementation-readiness.py validate
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_receipt_truth_drift
reasoning_tier: standard
context_scope: home_command_event_receipts
implementation_surfaces: [Plans/Contracts_V0.md, Plans/event_payloads/workspace_layout_changed.schema.json, Plans/event_payloads/terminal_workgroup_moved.schema.json]
node_compile_hint:
  mode: home_command_event_contract
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
- Plans/Decision_Log.md#DL-180 and #DL-181 (amendment of 2026-10-09; cited here rather than in depends_on, because DL-180 already depends on this unit through DL-147)
preserved_exact_tokens: [workspace.layout_changed, terminal.workgroup_moved, persisted=true, no_change, rolled_back=true]
negative_constraints:
- Do not emit generated or fabricated command-applied events.
- Do not emit a success event for failed persistence or unchanged/cancelled gestures.
compatibility_only_notes:
- The 1.1.0 workspace.layout_changed payload and terminal.workgroup_moved 1.0.0 stay readable for events already written.
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-180, DL-181): the payload moves to CV-361's 2.0.0 and terminal.workgroup_moved is withdrawn."
owner_hints: [Plans/Contracts_V0.md, Plans/UI_Command_Catalog.md, Plans/storage-plan.md]
```
