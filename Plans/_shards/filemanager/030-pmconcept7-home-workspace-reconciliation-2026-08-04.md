# Shard 030: PMConcept7 Home Workspace reconciliation — 2026-08-04

Source: `Plans/FileManager.md`

Source lines: L4888-L4972

Source SHA256: `97e57f4d228363a02b686b62bbf28caa177fb5bde9f17e0898a4fabec6fb96d6`

---

## PMConcept7 Home Workspace reconciliation — 2026-08-04

Amended 2026-08-12 — `Open in Panel` must open the file, in every panel. A leaf routes
through the canonical open path so the buffer is added to the panel's open-tab model, the
tab strip re-renders, and the file body renders into that panel's own editor surface.
Panels that are opened on demand carry the same internal editor structure as the default
panels; writing a placeholder string into a panel's code surface, or activating a tab that
was never added to the open-tab model, does not satisfy this contract. Evidence must assert
the rendered buffer, not only a global "last opened file" marker.

The File Manager/editor owner adopts the Home workspace's four stable editor panel
identities: `editor_panel_1`, `editor_panel_2`, `editor_panel_3`, and
`editor_panel_4`. Panel 1 and Panel 2 are open by default; Panel 3 and Panel 4
start closed, remain addressable, and reopen with the same identity. Closing a
panel is presentation state and is non-destructive to its shared buffers, tabs,
dirty state, undo history, save authority, or browser/editor session references.

File Manager exposes one compact body-portaled `Open in Panel` submenu directly
above the context-menu resizer/divider; its four leaf rows are `Panel 1` through
`Panel 4` and remain above every panel/resizer stacking context. A leaf targets the
selected stable editor identity, reopens it if closed, resolves that panel's active
editor group unless an explicit group was supplied, and dispatches exactly one
`cmd.file.open`. The `OpenFile` payload carries
`target_editor_panel_id` and optional `target_editor_group_id`. The historical
`target_group` field is retained only as an explicitly documented compatibility
alias during migration; `cmd.file.open_with` is not extended and does not become a
layout command. Existing open-file, browser, and editor commands are reused where
their owner contracts already cover the action.

The panel options menu exposes close, reopen/focus, split or dock movement, and
Browser access without replacing the shared buffer model. Moving or docking an
editor panel changes only its Home presentation record; it never duplicates a
buffer, browser session, tab identity, or save target. File Manager and editor
surfaces may be docked in `home_main` or any Home edge dock, or shown as independent
floating editor panels subject to the shared layout validator and safe off-screen
fallback.

### Superseded File Manager constraint

The former one-floating-editor limit in this document is superseded by the four
stable panel identities and independent floating editor presentation above. The
former single detached editor assumption remains compatibility/source lineage only;
it is not a limit on the Home workspace implementation.

### F-080 - Home Four-Panel File And Browser Routing

```yaml
plan_unit_id: F-080
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: File Manager and editor routing use four stable editor panel identities; a compact body-portaled Open in Panel submenu dispatches cmd.file.open to the requested panel and its active or explicit editor group, while Browser routing reuses one Browser session in any panel without an agent.
gui_related: true
gui_classification_reason: This unit owns the user-visible file/editor target routing and non-destructive close/reopen behavior.
split_recommended: false
depends_on: [F-079, F3-501, UCC-144, CV-323]
unblocks: []
acceptance_criteria:
- The File Manager context menu contains one Open in Panel submenu with exactly Panel 1 through Panel 4 leaf actions.
- A closed target panel is restored before the file is focused; an open target is focused without a duplicate panel, group, worktree, or buffer.
- OpenFile carries target_editor_panel_id and target_editor_group_id; target_group is a compatibility alias only.
- cmd.file.open_with retains its native target enum unchanged and never carries Panel 1 through Panel 4 routing.
- Browser can be opened or focused visibly in each panel through cmd.browser.open_workspace_preview while retaining one browser_session_id.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: file_panel_routing_drift
reasoning_tier: standard
context_scope: home_editor_file_routing
implementation_surfaces: [Plans/FileManager.md, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_file_panel_routing
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/01_REQUIREMENTS.jsonl
preserved_exact_tokens: [Open in Panel, target_editor_panel_id, target_editor_group_id, target_group, cmd.file.open_with]
negative_constraints:
- Do not extend cmd.file.open_with with panel targets.
- Do not duplicate editor or Browser identity during routing.
compatibility_only_notes:
- target_group remains a migration alias of target_editor_group_id.
stale_retired_dispositions:
- The one-floating-editor limit is retired.
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```
