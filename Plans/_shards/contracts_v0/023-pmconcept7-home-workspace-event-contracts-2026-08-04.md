# Shard 023: PMConcept7 Home Workspace event contracts — 2026-08-04

Source: `Plans/Contracts_V0.md`

Source lines: L3391-L3466

Source SHA256: `09408a3e335023db2cf93ebf921993c37ed9166827985d47eeef27ba02b99dbd`

---

## PMConcept7 Home Workspace event contracts — 2026-08-04

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
canonical_text: Home leaf actions bind the canonical UICommand envelope to precise applied, no_change, cancelled, disabled-before-dispatch, and failed-rollback outcomes; workspace.layout_changed and terminal.workgroup_moved carry exact identity, revision, host, insertion, correlation, and persistence truth without fabricated command-applied events.
gui_related: true
gui_classification_reason: The contract drives visible Home success, disabled, cancellation, failure, and recovery projections.
split_recommended: false
depends_on: [CV-322, F3-501, SP-245, UCC-144]
unblocks: []
acceptance_criteria:
- workspace.layout_changed includes exact changed surface IDs, prior/new revision, source/target host, target slot, target/insertion fields, command/correlation identity, and persisted=true only after readback.
- terminal.workgroup_moved includes workgroup, source/target section, contained pane/session IDs, section-created state, command/correlation identity, and preserve_session_identity=true.
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
preserved_exact_tokens: [workspace.layout_changed, terminal.workgroup_moved, persisted=true, no_change, rolled_back=true]
negative_constraints:
- Do not emit generated or fabricated command-applied events.
- Do not emit a success event for failed persistence or unchanged/cancelled gestures.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints: [Plans/Contracts_V0.md, Plans/UI_Command_Catalog.md, Plans/storage-plan.md]
```
