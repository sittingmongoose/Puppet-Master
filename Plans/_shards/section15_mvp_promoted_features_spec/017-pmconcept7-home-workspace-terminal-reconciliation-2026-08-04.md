# Shard 017: PMConcept7 Home Workspace terminal reconciliation — 2026-08-04

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L9587-L9670

Source SHA256: `cd97c9aeb64d74ac119e48c37dcf891ada8abc697384056ccf0414495b8802bf`

---

## PMConcept7 Home Workspace terminal reconciliation — 2026-08-04

Superseded 2026-10-09 (DL-181): terminal sections, workgroups and the four-section and four-visible-pane limits are retired; the terminal is one tab kind of the universal panels with one session per tab (`#SMPFS-180`), and the default Home layout's bottom row is an ordinary panel row (`Plans/FinalGUISpec.md#F3-630`). This passage, `#SMPFS-138` and its DL-070 empty-section rule are lineage only. Its identity rule survives in SMPFS-180: a layout move never mints a PTY or a session.

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
state and may be closed or reused. The vacated section is not reseeded: the move
creates no replacement workgroup and opens no new terminal session (DL-070);
creating another workgroup or terminal there is a separate action. Moving a workgroup is distinct from moving an
individual terminal pane; `cmd.terminal.move_pane` is not extended.

### Superseded Section15 constraint

The former two-terminal-section limit and editor-area exclusion are superseded by
the four-section Home model above. Bottom-dock default placement, terminal runtime
identity ownership, and the rule that terminal does not become the PM control plane
remain canonical. Amended 2026-10-09 (DL-181): the four-section Home model and bottom-dock default placement are themselves
retired (`#SMPFS-180`); terminal runtime identity ownership and the control-plane rule remain canonical.

### SMPFS-138 - Home Terminal Sections Workgroups And Pane Limits

```yaml
plan_unit_id: SMPFS-138
unit_type: requirement
status: superseded
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
superseded_by: SMPFS-180
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Terminal sections, workgroups and the
  four-section and four-visible-pane limits are retired: the terminal is one tab kind of the universal panels with one
  session per tab, and the bottom row of the default Home layout is an ordinary panel row; this unit's identity rule
  survives in SMPFS-180 (a layout move never mints a PTY or a session). The text below is retained verbatim for
  lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by SMPFS-180
  (DL-181).
  Home supports up to four terminal sections and up to four visible panes total in the active workgroup presentation;
  bottom is the default host, while each section can move to main, any outer dock, or float without changing terminal
  section, workgroup, pane, session, or PTY identity.
gui_related: true
gui_classification_reason: This unit owns the user-visible terminal section, workgroup, pane, disabled-limit, and empty-section behavior.
split_recommended: false
depends_on: [F3-501, UCC-144, SP-245, DL-181]
unblocks: []
acceptance_criteria:
- Four terminal sections can exist; attempting a fifth is disabled before dispatch with Maximum four terminal sections.
- One through four panes can be visible; attempting a fifth is disabled before dispatch with Maximum four visible terminal panes.
- Moving a whole workgroup uses cmd.terminal.move_workgroup, preserves all pane/session bindings, and may create a section only below the cap.
- Moving a section uses shell layout commands and never aliases cmd.terminal.move_pane.
- Moving the last workgroup out leaves an explicit reusable empty section; no PTY or session is silently destroyed.
- Moving the last workgroup out creates no replacement workgroup and opens no new terminal session in the vacated section (DL-070).
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
- Do not reseed a vacated terminal section with a replacement workgroup or new session as part of a move.
compatibility_only_notes:
- SMPFS-079 is retained only as retired source lineage.
stale_retired_dispositions:
- The two-terminal-section limit and editor-area exclusion are retired.
- "Superseded 2026-10-09 (DL-181): sections, workgroups, the four-section and four-pane limits and the bottom default host retire; SMPFS-180 is the terminal's container model."
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```
