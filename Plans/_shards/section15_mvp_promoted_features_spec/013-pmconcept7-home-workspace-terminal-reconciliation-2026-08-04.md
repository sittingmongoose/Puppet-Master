# Shard 013: PMConcept7 Home Workspace terminal reconciliation — 2026-08-04

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8458-L8523

Source SHA256: `dc0625ec8d68b6f9d9f74f7b9268e96f5e178277dfb8ee427f13efdd0fd512d2`

---

## PMConcept7 Home Workspace terminal reconciliation — 2026-08-04

The promoted terminal surface participates in the model-driven Home workspace. The
bottom dock remains the default terminal placement, while a terminal section may be
previewed and committed in `home_main`, any in-app edge dock, or the web in-canvas
floating host. The desktop floating host is a native Slint window. A Home movement
changes presentation state only and preserves `terminal_section_id`,
`terminal_workgroup_id`, contained pane identities, transcript, terminal tabs,
`terminal_session_id`, and PTY/session ownership. A move never mints a PTY.

The workspace permits at most four terminal sections and at most four visible panes
per active section presentation. A workgroup can move to an existing section or to
a newly created section only while the section limit permits it. At the limit, the
move is rejected with a visible disabled reason and the source remains unchanged.
When the last workgroup leaves a section, that section renders an explicit empty
state and may be closed or reused. Moving a workgroup is distinct from moving an
individual terminal pane; `cmd.terminal.move_pane` is not extended.

### Superseded Section15 constraint

The former two-terminal-section limit and editor-area exclusion are superseded by
the four-section Home model above. Bottom-dock default placement, terminal runtime
identity ownership, and the rule that terminal does not become the PM control plane
remain canonical.

### SMPFS-138 - Home Terminal Sections Workgroups And Pane Limits

```yaml
plan_unit_id: SMPFS-138
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Home supports up to four terminal sections and up to four visible panes total in the active workgroup presentation; bottom is the default host, while each section can move to main, any outer dock, or float without changing terminal section, workgroup, pane, session, or PTY identity.
gui_related: true
gui_classification_reason: This unit owns the user-visible terminal section, workgroup, pane, disabled-limit, and empty-section behavior.
split_recommended: false
depends_on: [F3-501, UCC-144, SP-245]
unblocks: []
acceptance_criteria:
- Four terminal sections can exist; attempting a fifth is disabled before dispatch with Maximum four terminal sections.
- One through four panes can be visible; attempting a fifth is disabled before dispatch with Maximum four visible terminal panes.
- Moving a whole workgroup uses cmd.terminal.move_workgroup, preserves all pane/session bindings, and may create a section only below the cap.
- Moving a section uses shell layout commands and never aliases cmd.terminal.move_pane.
- Moving the last workgroup out leaves an explicit reusable empty section; no PTY or session is silently destroyed.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_home_identity_and_limit_drift
reasoning_tier: standard
context_scope: home_terminal_sections
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_terminal_sections
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/01_REQUIREMENTS.jsonl
preserved_exact_tokens: [up to four terminal sections, one-to-four pane tabs, terminal_section_id, terminal_workgroup_id, terminal_pane_id, terminal_session_id]
negative_constraints:
- Do not mint a PTY or terminal session during layout movement.
- Do not destroy an empty terminal section implicitly.
compatibility_only_notes:
- SMPFS-079 is retained only as retired source lineage.
stale_retired_dispositions:
- The two-terminal-section limit and editor-area exclusion are retired.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```
