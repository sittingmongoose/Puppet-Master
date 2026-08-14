# Shard 022: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/00-plans-index.md`

Source lines: L5040-L5526

Source SHA256: `d1d659cd51ca674c1e34c953ae8080b399b7d61ffed7f802998596f738d85c78`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. The ordinary compile did not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal; the later explicit seal phase refreshed generated governance/provenance artifacts without creating runtime or build artifacts.

### 0PI-066 - 0PI-066

```yaml
plan_unit_id: 0PI-066
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The external repo system-wide improvement import from pldg-20260703-001-feature-intake is routed to existing Puppet Master subsystem owners plus the new Release_Supply_Chain owner for release/install/provenance gaps. The compile preserves GUI-first/no-PM-CLI constraints, treats terminal/CLI lessons as GUI-native runtime/provider/tool/context/agent-control contracts, keeps imported rows source-lineage-backed rather than ledger-canonical, and creates no WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks during ordinary compile; the later explicit governance seal refreshes only generated governance/provenance artifacts.
gui_related: false
gui_classification_reason: Index owner-routing metadata, not direct GUI implementation.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- All 113 imported external repo rows and 5 import guardrails have a compiled PlanUnit or existing PlanUnit disposition.
- The 12 rows that arrived with empty target_docs are owner-adjudicated without asking row-by-row.
- Terminal lessons remain GUI-terminal/runtime contracts, not a Puppet Master CLI product surface.
- Only live Plans docs and allowed Plans/.plan_index outputs are changed during ordinary compile; the later explicit governance seal refreshes generated governance/provenance artifacts only.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- git diff --check
risk_class: owner_map_drift
reasoning_tier: high
context_scope: external_repo_system_wide_compile_owner_map
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
node_compile_hint:
  mode: external_repo_system_wide_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/current.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/handoff.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/import_completion_recheck_20260703.json
source_atom_ids:
- atom-0001
- atom-0002
- atom-0003
- atom-0004
- atom-0005
- atom-0006
- atom-0007
- atom-0008
- atom-0009
- atom-0010
- atom-0011
- atom-0012
- atom-0013
- atom-0014
- atom-0015
- atom-0016
- atom-0017
- atom-0018
- atom-0019
- atom-0020
- atom-0021
- atom-0022
- atom-0023
- atom-0024
- atom-0025
- atom-0026
- atom-0027
- atom-0028
- atom-0029
- atom-0030
- atom-0031
- atom-0032
- atom-0033
- atom-0034
- atom-0035
- atom-0036
- atom-0037
- atom-0038
- atom-0039
- atom-0040
- atom-0041
- atom-0042
- atom-0043
- atom-0044
- atom-0045
- atom-0046
- atom-0047
- atom-0048
- atom-0049
- atom-0050
- atom-0051
- atom-0052
- atom-0053
- atom-0054
- atom-0055
- atom-0056
- atom-0057
- atom-0058
- atom-0059
- atom-0060
- atom-0061
- atom-0062
- atom-0063
- atom-0064
- atom-0065
- atom-0066
- atom-0067
- atom-0068
- atom-0069
- atom-0070
- atom-0071
- atom-0072
- atom-0073
- atom-0074
- atom-0075
- atom-0076
- atom-0077
- atom-0078
- atom-0079
- atom-0080
- atom-0081
- atom-0082
- atom-0083
- atom-0084
- atom-0085
- atom-0086
- atom-0087
- atom-0088
- atom-0089
- atom-0090
- atom-0091
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0097
- atom-0098
- atom-0099
- atom-0100
- atom-0101
- atom-0102
- atom-0103
- atom-0104
- atom-0105
- atom-0106
- atom-0107
- atom-0108
- atom-0109
- atom-0110
- atom-0111
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
- atom-0119
- atom-0120
- atom-0121
- atom-0122
decision_refs:
- dec-0002
- dec-0003
- dec-0004
preserved_exact_tokens:
- OpenCode v1/dev/beta
- OpenCode v2 specs
- Cline
- Agent Zero
- Pi
- OpenAI Codex
- Ghostty
- Warp
- tmux
- GUI-first
- not building a CLI
- ContextEpoch
- ProviderCapabilityEpoch
- ToolTurnSettlement
- AgentControlEnvelope
- TerminalBackpressureState
- Command approval is a GUI-visible lease
negative_constraints:
- Do not translate terminal/CLI lessons into a Puppet Master CLI product shape.
- Do not collapse the 113 imported rows into a vague summary.
- Do not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs during ordinary compile; refresh governance outputs only in an explicit seal phase.
owner_hints:
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
```

### PMConcept7 tweak wave 3 — 2026-08-13 (third same-day wave)

Third same-day wave over the tweak-wave-2 canon, with dated wave-3
dispositions. Owner-doc changes:

- `Plans/FinalGUISpec.md` — F3-421: the overflow chip always sits immediately
  left of the actions cluster, fitting is live on tab add/remove, a newly
  opened overflowing tab stays visible (displacing the chip-adjacent
  non-active tab into the picker), and tab drag-reorder is animated
  (suppressed native ghost, transform-only pointer tracking, ~140 ms neighbour
  FLIP, reduced-motion instant, silhouette glued to the insertion slot).
  F3-505: theme skin tokens (--ed-shape-outline, --ed-shape-crown/-h,
  --ed-tab-inactive-ring/+radius; retro hard outline with square inactive
  rings, basic 2 px accent-blue crown at 9 px radius, glass three-edge bevel
  with rail alpha re-tuned 88 → 84), and the editor minimap becomes the only
  code-pane scrollbar (native bars suppressed, margin-aligned band; the wave-2
  scrollbar-track-margin exclusion is retired). F3-HOME-002 + F3-503: two-frame
  drop-target hysteresis, mid-FLIP hit-test exclusion (data-pm-home-flip),
  movement-gated auto-scroll, proportional-projected-width placeholder
  (mirroring normalizeMainRowBases), and PM_EDGE deferral widened to all Home
  gestures. F3-HOME-003: the kebab is a vertical-dots 16 by 20 control at the
  surface's right edge below the grip (out of the head rows; stray terminal
  control strip removed); spacing re-tuned to 2 px vertical via
  --pm-home-pad-y/--pm-home-gap-y with 4 px sides; terminal empty-section
  guidance truth-gated by data-pm-term-empty and restoreOwnerRefs never drops
  section records.
- `Plans/Wiring_Matrix.production.json` — the 14 kebab-anchored option rows
  carry the new kebab location/geometry; census unchanged at 56 home rows.
- `Plans/UI_Wiring_Rules.md` — §0.1 concept-input note extended.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — interaction
  rules re-amended; artifact and source hashes recomputed.
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — chip/reorder/minimap/kebab/
  spacing/terminal rows updated.

Governance: seal row `dec-2026-08-13-pm7-tweak-wave-3`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-3-2026-08-13/`. No new command IDs, no storage
shape changes; this wave creates no WorkNodes, NodeSeeds, executable queues,
implementation files, runtime artifacts, or production build tasks.

### PMConcept7 tweak wave 2 — 2026-08-13 (same-day follow-up)

Same-day follow-up to the workspace repair below; several of that wave's canon
decisions are REVERSED with explicit dated tweak-wave dispositions. Owner-doc
changes:

- `Plans/FinalGUISpec.md` — F3-HOME-003 + F3-502: the grab handle becomes a
  small lines-only glyph (two diagonal strokes, 18 px hit triangle) at the
  surface's TOP-RIGHT corner, retiring the same-day 28 px top-left corner
  triangle; the kebab Placement section/hint is retired; the top-bar Collapse
  row becomes a TOGGLE with a runtime Expand Bottom Terminal relabel, retiring
  the one-way contract. F3-HOME-001: dock_right spans the full workspace height
  ("top top right" / "left main right" / "bottom bottom right"). F3-HOME-002 +
  F3-503: the drop preview projects TARGET geometry (retiring the same-day
  pickup-footprint preview) with pickup-band and preview-capture guards, and
  row-axis docks gain a full-width track handle writing the new persisted
  size.cross_basis_px field (host-max semantics, host-band clamped, migrated
  from basis_px) alongside within-row pair transfer. F3-505: progress-driven
  silhouette redesign (JS writes --ed-lp/--ed-rp, CSS derives radii; 13 px
  theme-tunable crown, 12 px shoulder/canvas radii retiring the 10/8 maxima;
  40/36 px strips; flush-left tabs; corner caps; per-theme skins) and the
  dashboard tab strip enrolls in the same connected-surface system (F3-464
  page-tab boundary unchanged; editor scrollbar excluded from the frosted
  band). F3-421: the dedicated pane-close glyph is retired (kebab Close Panel
  is the single close affordance). §3.1/§3.2: the app status bar is removed
  from the PM7 shell (F3-448 remains the chip-inventory owner); 4 px spacing.
  F3-HOME-003 also records the move-workgroup source reseed and reset
  reconstitution semantics.
- `Plans/UI_Command_Catalog.md` — UCC-144: top-bar collapse row toggles on
  cmd.workspace_layout.set_collapsed; track handle reuses
  cmd.workspace_layout.resize_surface; no new command IDs.
- `Plans/UI_Wiring_Rules.md` — §0.1 re-pointed; UIW-010 census scope re-worded
  (top-right lines grip, target-geometry preview, home.resizer.dock_track).
- `Plans/Wiring_Matrix.production.json` — 55 → 56 home rows: new
  home.resizer.dock_track; grab rows re-worded to the lines-only grip;
  drop-target rows carry the target-geometry preview acceptance; the collapse
  row records the toggle. No dedicated pane-close rows existed to retire (the
  retired glyph was view chrome; home.editor_panel_N.close remains the kebab
  Close Panel row).
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — census 56,
  interaction rules re-amended, artifact and source hashes recomputed.
- `Plans/Widget_System.md` — grab-handle note re-amended (widgets keep their
  top-left handle; the Home grip is top-right lines-only, owned by F3-HOME-003).
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — grip, preview, dock-track,
  pane-close, collapse-toggle, panels-3/4-real-buffers, and reseed rows updated.

Governance: seal row `dec-2026-08-13-pm7-tweak-wave-2`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-2-2026-08-13/` (records the two
post-inspection integration fixes: dock-track host-max semantics and the
pickup-band/preview-capture drag guards). This wave creates no WorkNodes,
NodeSeeds, executable queues, implementation files, runtime artifacts, or
production build tasks.

### PMConcept7 workspace repair and tab-morph wave — 2026-08-13

Rebuilds the PM7 Home movement, resize, grip, pop-out, reset, and editor-tab
systems (assemble-then-repin base refresh plus the T20 overhaul) and reverts the
notification placement. Owner-doc changes:

- `Plans/FinalGUISpec.md` — F3-HOME-001 amended (floating is never a boot state;
  `storage.boot_demote_floating`). F3-HOME-002 amended (window exit is
  `invalid_target` and floating is explicit-only, dated retirement of the
  2026-08-12 window-exit-floats sentence; footprint-true change-gated drop
  preview; host caps with home_main spill; adjacent-pair pixel resize with
  fair-share minimums, unified host bands, floating corner handle, no settle
  flash, and the no-dead-space invariant). F3-HOME-003 amended (four-row top-bar
  menu including the dual-surface Reset Layout row, dated retirement of the reset
  prohibition; the grab handle is a 28x28 top-left corner triangle). F3-502,
  F3-503, F3-504 (chat overlay retired in PM7; single in-canvas float system) and
  F3-505 (frosted translucent rail, masked shoulder cutouts, ensure-after-measure
  lifecycle, last-child mount) amended. F3-421 amended (tab drag-reorder persists
  on all four panes; portal-family overflow chip). F3-460 re-amended — the
  notification stack returns between the page tabs and the search, exactly
  centred by two auto margins; the 2026-08-12 after-search placement is retired
  with a dated disposition. §3.1/§3.2/§3.4 refreshed to match.
- `Plans/Wiring_Matrix.production.json` — 51 → 55 `home.` rows: new
  `home.more_options.reset_layout` (dual-surface reset), `home.chat.pop_out`,
  `home.dashboard.pop_out`, and `home.resizer.floating_corner`; the grab rows
  describe the corner triangle grip, the drop-target rows carry the hover-preview
  acceptance, and the floating drop target is explicit-action-only.
- `Plans/UI_Command_Catalog.md` — UCC-144 amended (dual-surface reset on
  `cmd.workspace_layout.reset`; Pop Out generalized to Chat and Dashboard on
  `cmd.panel.undock`; window exit dispatches nothing); no new command IDs.
- `Plans/UI_Wiring_Rules.md` — §0.1 concept-input note re-pointed; UIW-010
  census scope amended; the compact-popup prose is four rows.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — census 51 → 55,
  interaction rules refreshed, source and artifact hashes recomputed.
- `Plans/Widget_System.md` — grab-handle wording (position, not glyph).
- `Plans/Automated_Testing_System.md` — ATS-029 amended (new fixtures
  `topbar_reset_layout_row`, `chat_popout_stays_in_canvas`,
  `grip_corner_hit_target_and_zorder`, `boot_never_floating`,
  `dead_space_self_heal`; window-exit-floats fixture branch retired; 72-case
  visual matrix structurally unchanged).
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — Home checklist rows updated to
  the explicit-float, dual-surface-reset, corner-grip, adjacent-pair-resize, and
  frosted-rail canon.
- `Plans/settings_inventory.json` — the Reset Home Layout row records the
  dual-surface route.
- `Plans/assistant-chat-design.md` — PM7 floating-mount clarification (ACD-440/
  ACD-441 mounts re-pointed to the in-canvas float surface; overlay retired).

`Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md` are
unchanged. `Concepts/PMConcept7.html` remains a generated artifact and
illustrative source lineage only; this wave creates no WorkNodes, NodeSeeds,
executable queues, implementation files, runtime artifacts, or production build
tasks. The governance seal for this wave is
`dec-2026-08-13-pm7-workspace-repair-tab-morph` with evidence bundle
`Plans/.evidence/pm7-workspace-repair-2026-08-13/`.

### PMConcept7 Home Workspace direct-manipulation repair wave — 2026-08-12

Repairs a set of Home regressions and replaces the surface movement affordance.
Ten reported defects were traced to the Home layer projecting over the PM6 shell
rather than to missing features: the layer reparented shell surfaces and then
overrode their layout wholesale, mounted its own controls where the host chrome
already lived, and intercepted two shell controls in the capture phase. Owner-doc
changes:

- `Plans/FinalGUISpec.md` — F3-HOME-002 amended (direct manipulation with live
  neighbour reflow and an in-flow placeholder; drop-target priority; capture loss
  is not a cancellation vector; per-frame resize scope; keyboard movement on the
  grab handle). F3-HOME-003 amended (one top-left grab handle per eligible
  surface; the per-surface Move or dock rows retired; the terminal collapse
  chevron is a toggle and the collapsed strip is the expand affordance). F3-460
  amended (notification stack moves after the title-bar search, centred before the
  theme/settings cluster). F3-464 scope clarified to title-bar page tabs. New
  F3-505 — contact-aware editor tab silhouette.
- `Plans/Wiring_Matrix.production.json` — the 42 `home.*.move.*` and 35
  `home.*.redock.*` rows are retired (128 → 51 `home.` rows); the grab, drop
  target, resizer and terminal-toggle rows carry the new locations and checks.
  `cmd.workspace_layout.move_surface` keeps full catalog↔wiring closure through
  the grab and drop-target rows.
- `Plans/UI_Command_Catalog.md` — UCC-144 amended; no new command IDs.
- `Plans/Widget_System.md` — dashboard widgets adopt the shared
  direct-manipulation vocabulary while `widget_layout:v1:dashboard` keeps
  ownership of widget layout.
- `Plans/FileManager.md` — Open in Panel must render a real buffer in all four
  panels.
- `Plans/Automated_Testing_System.md` and
  `Plans/GUI_Rebuild_Requirements_Checklist.md` — fixtures must assert observable
  geometry and rendered content, not dispatch counts.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — census 128 → 51
  with refreshed source hashes.
- `Plans/UI_Wiring_Rules.md` §0.1 — concept-input note re-pointed.

`Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md` are
unchanged: the record shape, storage key and revision/readback rules are
unaffected. `Concepts/PMConcept7.html` remains a generated artifact and
illustrative source lineage only; this compile creates no WorkNodes, NodeSeeds,
executable queues, implementation files, runtime artifacts, production build
tasks, or governance-seal artifacts by itself.

### PMConcept7 Home Workspace implementation wave — 2026-08-04

The model-driven Home workspace is routed through these canonical owners and
consumers:

- `Plans/FinalGUISpec.md` — Home shell composition, four stable editor surfaces,
  five hosts, drag/drop previews, resize reliability, themes, scroll treatment,
  and web/native capability matrix.
- `Plans/FileManager.md` — editor panel identity and File Manager open-target
  routing.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — terminal section/workgroup
  identity and four-section/four-pane limits.
- `Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md` — typed
  layout record, persistence scope, migration, validation, and recovery.
- `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`,
  `Plans/event_family_registry.json`, `Plans/UI_Wiring_Rules.md`, and
  `Plans/Wiring_Matrix.production.json` — command/event/wiring boundaries.
- `Plans/Widget_System.md` and `Plans/DRY_Rules.md` — widget non-hostability and
  owner/consumer separation.
- `Plans/Automated_Testing_System.md` and
  `Plans/GUI_Rebuild_Requirements_Checklist.md` — live and visual evidence gates.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — implementation
  control evidence; it does not replace older PMConcept census artifacts.

The former one-floating-editor File Manager limit and two-terminal/editor-area
Section15 limit are superseded by the explicit addenda in their owner documents.
Governance artifacts and Spec Lock are refreshed only after these ordinary docs,
source transforms, generated PM7 output, and evidence stop changing.

#### Post-audit repair registration — 2026-08-05

The implementation-facing Home authority is now formalized by accepted PlanUnits
`F3-501` through `F3-504`, `F-080`, `SMPFS-138`, `SP-245`, `UCC-144`,
`CV-323`, `UIW-010`, and `ATS-029`. `SMPFS-079` is retired compatibility
lineage and no longer supplies a current two-terminal ceiling. The sole layout
schema ID is `pm.home_workspace_layout.v1`; earlier Home schema/key identifiers
are read-only migration inputs.

The title-bar Home popup is the compact exact three-row menu owned by `F3-502`,
not the earlier control-center presentation. Production leaf routing, transactional
receipt/event truth, source-hashed census, executable interaction coverage, exact
72-case visual matrix, Slint 1.17.1 Rust/multi-window ownership, Wayland best-effort
restore, and direct-user-activation popup degradation are routed to the PlanUnits
above. This registration does not broaden Widget System hostability, introduce any
Home `cmd.widget.*` command, or change the native `cmd.file.open_with` enum.
