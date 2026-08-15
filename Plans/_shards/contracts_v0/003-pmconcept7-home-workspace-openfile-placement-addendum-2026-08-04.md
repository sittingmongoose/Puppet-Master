# Shard 003: PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Source: `Plans/Contracts_V0.md`

Source lines: L305-L314

Source SHA256: `09408a3e335023db2cf93ebf921993c37ed9166827985d47eeef27ba02b99dbd`

---

## PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Home Workspace consumers use the canonical workspace-file shape
`OpenFile { path, line?, range?, target_editor_panel_id?, target_editor_group_id?, target_group? }`.
`target_editor_panel_id` selects `editor_panel_1` through `editor_panel_4`;
`target_editor_group_id` selects an explicit group within that panel; and
`target_group` remains a compatibility alias that normalizes to
`target_editor_group_id`. These fields are placement selectors only and never
replace route identity, OpenSubject, buffer ownership, or dirty-state authority.
`cmd.file.open_with` and `cmd.panel.switch` do not gain Panel 1..4 values.
