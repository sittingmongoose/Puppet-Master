# Shard 022: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/00-plans-index.md`

Source lines: L5158-L5946

Source SHA256: `b7fcda0d1247d61af89e91994892aa52cd1dc94137e68c5a389f2acd1f6314cf`

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

### 0PI-067 - Shared Integration Runtime Owner Routing

```yaml
plan_unit_id: 0PI-067
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: Shared Integration Runtime is the sole owner for the 21 approved adopt-here shared-service rows; the remaining 142 rows retain their existing owners, domain semantics are not transferred, and the disposition register is routing evidence rather than product canon or implementation proof.
gui_related: false
gui_classification_reason: Index owner-routing metadata is not direct GUI behavior.
depends_on: [PDS-003, PNC-001, SIR-001]
unblocks: []
acceptance_criteria:
  - All 21 adopt-here rows route to Plans/Shared_Integration_Runtime.md as primary owner.
  - Former primary owners remain supporting domain owners or consumers.
  - The 142 non-adopted rows retain their approved owners and dispositions.
  - BSD, provider-first-acquisition, server-topology, and RuntimeResourceGovernor boundaries remain explicit.
  - This routing creates no WorkNodes, NodeSeeds, queues, runtime/code/build artifacts, or governance seal.
validation_surfaces: [runtime integration disposition validation, plan owner-routing audit]
risk_class: owner_map_drift
reasoning_tier: high
context_scope: remaining_runtime_integration_owner_map
implementation_surfaces: [Plans/00-plans-index.md, Plans/Shared_Integration_Runtime.md, Plans/runtime_integration_disposition.json]
node_compile_hint: {mode: shared_integration_runtime_owner_map, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/runtime_integration_disposition.json, PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13]
```

### 203-command Touch Closure owner map — 2026-09-01

The retained Settings, Onboarding/Doctor, Full Thread Performance,
Server-First/WAN/Backup, and Egolite/Browser/SCM packet wave now routes its final
203 previously unbound primary commands through eleven existing domain owners and
four central consumer/dispatch owners. Together with the earlier reconciled set,
the machine Touch Closure inventory contains 401 primary command rows: 400 are
actionable with static production-intent wiring and exactly one sole future-handler
identity; `cmd.artifacts.open_panel` remains the one explicitly blocked false
inventory token and has no production row. The same registry contains 51
normalization-only aliases, 101 typed local UI actions, and 7 presentation rows,
for 560 rows across 87 profiles and 1041 production-intent wiring entries.

Domain-owner routes are `Plans/Backup_Restore_System.md`,
`Plans/Forge_Integrations.md`, `Plans/Jujutsu_Integration.md`,
`Plans/Multi-Account_Connection_Spec.md`, `Plans/Named_Plan_System.md`,
`Plans/Remote_Access_System.md`,
`Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Server_System.md`,
`Plans/Shared_Integration_Runtime.md`, `Plans/Source_Control_System.md`, and
`Plans/Test_Capture_and_Motion_Evidence.md`. Central identity, reverse-consumer,
production-intent, and dispatch invariants remain in `Plans/Commands_System.md`,
`Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.md`, and
`Plans/UI_Wiring_Rules.md`. These are static canonical targets, not claims of
native handlers, runtime success, readiness, or Slint certification.

### 0PI-068 - 203-Command Touch Closure Owner And Machine-Registry Map

```yaml
plan_unit_id: 0PI-068
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The final 203-command packet closure routes through eleven named domain owners
  and four central consumer/dispatch owners while touch_closure.json remains a
  machine crosswalk rather than a new owner. The resolved inventory freezes 401
  primary commands, of which 400 are actionable with production-intent wiring and
  exactly one sole future handler and one is explicitly blocked without wiring;
  51 aliases, 101 typed local UI actions, and 7 presentation rows complete the
  560-row, 87-profile registry over 1041 production-intent entries. Dedicated
  server-gap and Touch Closure validators fail closed on drift. Every row remains
  static planning/contract evidence until independently implemented and verified.
gui_related: true
gui_classification_reason: The map routes every intended Settings, Onboarding, Doctor, PMConcept7, owner-workspace, palette, API, and headless consumer without taking presentation ownership.
split_recommended: false
depends_on: [0PI-067, C-051, DR-041, CV-326, ATS-042, CS-074, UCC-152, WM-051, UIW-017, SIR-031, RAS-013]
unblocks: []
acceptance_criteria:
  - "All eleven domain-owner documents and all four central owner documents are explicitly indexed and dependency-closed."
  - "Plans/Multi-Account_Connection_Spec.md is an explicit indexed owner path rather than an implicit command-row reference."
  - "The exact 401/400/1 primary-command denominator, 51 aliases, 101 local actions, 7 presentation rows, 560 rows, 87 profiles, and 1041 production entries is preserved."
  - "Every actionable primary command has exactly one production-intent route and one sole future-handler identity; the blocked token has neither."
  - "Both dedicated validators are standalone and named in run-gates and audit-governance."
  - "No static target, schema, fixture, registry, concept simulation, or browser result is represented as native runtime or Slint certification."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: packet_owner_map_or_denominator_drift
reasoning_tier: high
context_scope: final_packet_command_touch_closure_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Backup_Restore_System.md
  - Plans/Forge_Integrations.md
  - Plans/Jujutsu_Integration.md
  - Plans/Multi-Account_Connection_Spec.md
  - Plans/Named_Plan_System.md
  - Plans/Remote_Access_System.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/Server_System.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Source_Control_System.md
  - Plans/Test_Capture_and_Motion_Evidence.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Wiring_Rules.md
  - Plans/touch_closure.json
  - Plans/Wiring_Matrix.production.json
node_compile_hint: {mode: static_owner_and_machine_registry_map, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Crosswalk.md#c-051---touch-closure-authority-and-consumer-routing
  - Plans/Contracts_V0.md#cv-326---touch-closure-registry-and-static-production-intent-boundary
  - Plans/Automated_Testing_System.md#ats-042---touch-and-server-command-gap-aggregate-gates
  - Plans/server_command_gap_adjudication.json
  - Plans/touch_closure.json
preserved_exact_tokens: [Plans/Multi-Account_Connection_Spec.md, cmd.artifacts.open_panel, 401, 400, 1, 51, 101, 7, 560, 87, 1041]
negative_constraints:
  - "Do not create a new aggregate runtime owner from this cross-document map."
  - "Do not wire the blocked false-inventory token or normalization-only aliases as peers."
  - "Do not infer native implementation, runtime success, readiness, or Slint certification from static closure."
owner_hints: [Plans/00-plans-index.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/UI_Wiring_Rules.md]
```

### PMConcept7 tweak wave 8 — 2026-08-15 (kebab ink canon, chat dock back, drag snap, scroll kill)

Four re-diagnosed behaviors sealed with dated wave-8 dispositions; the user
rejected all four wave-7 items and each re-diagnosis found wave 7 had missed
the real mechanism, so several wave-7 claims are superseded:

- `Plans/FinalGUISpec.md` — F3-HOME-003: kebab geometry canon — the seat is
  derived from the glyph's INK, which sits at button-local top + 10 px (about
  5 px of glyph-free padding above and below the dots), so wave-7's
  `editor_panel` top 10 px actually seated the ink at surface-y 20, three
  below the 35 px strip's tab-label line at 17. Superseded to `editor_panel`
  `top: 6px` (ink 16) and dashboard `top: 2px; right: 13px` (ink 12, three
  above the 31 px header's title line at 15); `right: 13px` and the 34 px
  dashboard-actions margin are unchanged, and the grip hit-triangle
  concession is confined to glyph-free padding (about 50 px² editor, about
  4 px² dashboard). Also F3-HOME-003: floating Chat regains a `Dock back`
  row, reversing wave 7's retirement while keeping wave 7's single-menu
  exception — the T20 kebab stays skipped for chat and the row is injected
  into the BASE `.pm6-chat-more-menu`
  (`button.pm6-chat-more-item`, `data-pm-home-chat-row="redock"`, inline
  currentColor SVG, before `.closeChatBtn`), shown only while the host is
  `floating` with the base `.popOutBtn` hidden; the capture listener handles
  it ahead of `[data-pm-home-action]`, calls
  `moveSurface("chat", last_docked_host || "home_main")` and deliberately
  does not stop propagation so the base handler still closes the menu. No new
  command id — the move emits the existing `cmd.panel.redock`. F3-421 and
  F3-505: the snap-while-dragging EDSHAPE contract — wave 7's drag-cover fix
  (opacity 1, silhouette at z 39) stands but was incomplete; the residue was
  the GRAB-SPRING, since grabbing a non-active tab flips the active key and
  sprang the plate ~12 frames while the carried tab paints nothing, with
  sub-0.5 px moves parking in the spring-preservation early return. Any sync
  while the strip holds `.tab.dragging` now snaps in-frame (worst lag 0.00 px
  over 2,615 slow-drag samples; selection springs still travel 18 monotonic
  intermediates), plus a glass drag-scoped plate frost at opacity .92 that is
  deliberately not a backdrop blur (T16 count pin stays 134). F3-503: Home
  scroll kill, corrected mechanism — wave 7's `overflow-x: clip` claim is
  false because clip beside `overflow-y: auto` COMPUTES to hidden (CSS
  Overflow 3 §3.1), so hosts stayed scroll containers (programmatic
  scrollLeft moved 12 px) and Safari ≤ 15 drops clip outright. The overflow
  is removed at its three measured sources instead — empty-dock `padding: 0`
  (8 px), a zero-extent PM_EDGE band guard (22 px) and home_main's pairless
  last divider (12 px) — with a both-axes clip belt on the workspace, the
  host grid and `#panel-dashboard.pm-home-owned`, ID-anchored zero-width host
  scrollbars replacing wave 7's `scrollbar-color` rule, and a documented
  sub-1320 px `overflow-x: auto` reachability exception. Wave 7's blame on
  the tab silhouette is retired: its flare box overhangs the START edge,
  which does not count toward scrollWidth in LTR.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — kebab rule
  amended (ink canon, corrected chat clause), scroll rule rewritten with the
  wave-8 supersession, one new rule added for the floating-chat Dock back row
  (18 → 19), `[data-pm-home-chat-row]` added to the semantic selector
  families, and the artifact plus T20 source hashes recomputed.

Artifact sha256 213a3ee9 (3,619,880 bytes) on repinned base 3d82a850
(== PMConcept6.html); receipt 8da26442 (base_pin_ok, 20/20 transforms,
gates_all_pass, zero page errors on load). Live matrix 32/32 checks, 72/72
captures, 0 runtime-error cases, PASS. Governance: seal row
`dec-2026-08-15-pm7-tweak-wave-8`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-8-2026-08-15/`. No new command IDs, no wiring
row changes, no storage shape changes; census unchanged at 56 home rows (the
Dock back row dispatches the existing `cmd.panel.redock` from an existing
surface). No WorkNodes, NodeSeeds, executable queues, final node manifests,
or production build tasks were created.

### PMConcept7 tweak wave 7 — 2026-08-14 (kebab seats, chat menu, drag occlusion, scroll lock)

Four verified behaviors sealed with dated wave-7 dispositions:

- `Plans/FinalGUISpec.md` — F3-HOME-003: per-kind kebab seats (editor_panel top
  10 px against the 35 px strip; dashboard top 5 px / right 13 px against the
  31 px header, the right shift clearing the grip's clip-path hit triangle;
  34 px dashboard-actions margin; kind attribute value `editor_panel`), and
  Chat becomes the uniform-kebab exception — attachSurfaceControls skips and
  removes the T20 kebab for chat, the base chat header menu
  (Duplicate/Archive/Pop out/Close) is Chat's single more-options, the
  chat-only Dock Back row is retired (grip-drag re-dock covers it), and Pop
  Out still routes through the T20 float guard (host becomes floating,
  #floatingChat never displays, exactly one chat). F3-421: the dragged tab
  covers tabs it passes — opacity re-tuned .92 to 1 and the silhouette lifts
  to z 39 during a live drag (above neighbour labels z 1, below the carried
  label z 40), watched at 3x zoom. F3-503: Home screen scroll lock —
  overflow-x clip / overflow-y auto / overscroll-behavior none on the
  attribute-doubled .pm-home-host[data-pm-home-host] selector (required
  because scroll-frost enrolment stamps the base pm6-bottom-scroll overflow
  rule onto hosts at runtime); zero horizontal scrollLeft, no gutters,
  vertical intact.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — kebab rule
  amended (chat exception, per-kind seats), scroll-lock rule added, artifact
  and source hashes recomputed.

Artifact sha256 8ab40669 (3,612,010 bytes) on repinned base 33d5ed89
(== PMConcept6.html); receipt 92f0ef8c (base_pin_ok, 20/20 transforms,
gates_all_pass, zero page errors on load). Governance: seal row
`dec-2026-08-14-pm7-tweak-wave-7`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-7-2026-08-14/`. No new command IDs, no wiring
row changes, no storage shape changes; census unchanged at 56 home rows.

### PMConcept7 tweak wave 6 — 2026-08-14 (silhouette path canon)

Silhouette reconstruction wave, sealed with dated wave-6 dispositions in
F3-505:

- Construction canon: ONE JS-composed clip-path path() per frame —
  superellipse-approximating crown cubics (handle factor 0.5523 + 0.35 x
  progress) and per-side ogee descents (concave flare shoulder-max x p into
  convex neck canvas-max x p, tangent on the canvas line). Retires the
  border-radius crown, the engine-split corner-shape/superellipse @supports
  blocks (Chromium-only — the recorded motivation), the masked shoulder
  pseudos, and the glass three-edge inset bevel (now a 1 px --glass-edge crown
  strip clipped by the same path). Identical Safari/Chromium rendering.
- Morph gap canon (measured against the reference explainer's debug HUD):
  linear progress = clamp(gap/20 px, 0, 1); canvas-neck to shoulder-flare
  ratio 10:8; per-side gap to the NEAREST CONTACT (static strip content-box
  edge or adjacent tab's transform-free layout edge); strip-end caps key off
  the strip box only. The first/last-laid-tab gap track is retired (froze the
  morph on end-tab drags; wobbled under FLIP).
- Glass-dark --ed-rail-solid deepened via a 55 percent black canvas-bg mix
  (measured: ~1 sRGB channel level before, 16 levels after).
- Retro tab-motion bake-off: three EXPERIMENTAL pane-gated prototypes
  (phosphor/crt/dos via data-retro-motion on panes 1/2/3, pane 3 lazily
  stamped on first retro activation). RESOLVED same day (third follow-up,
  user decision): all three are canon as a rotating shuffle-bag trio (fair
  rotation, no immediate repeats) on every selection click and reorder
  gesture; pane gates removed everywhere; effects cover all editor strips
  plus the dashboard strip under retro; steady state is the standard retro
  active ring (phosphor 650 ms solid-hold fade, CRT 500 ms scanline-hold
  fade); phosphor/dos reorder glides quantize to 8 px cells, crt glides
  smooth; reduced motion suppresses all of it. The same follow-up corrected
  the silhouette canon: the tab side is a single concave quarter-arc
  (standard kappa, radius = shoulder token x per-side progress) with the
  convex canvas radius exclusive to the strip-end caps; both ogee
  constructions are retired as a misreading of the reference.

`Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` re-pinned to
artifact 22fb085d (3,610,186 bytes) on repinned base f638a30b; T20 source
unchanged this wave (4fa0a286). Governance: seal row
`dec-2026-08-14-pm7-tweak-wave-6`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-6-2026-08-14/`. No new command IDs, no wiring
row changes, no storage shape changes; this wave creates no WorkNodes,
NodeSeeds, executable queues, implementation files, runtime artifacts, or
production build tasks.

### PMConcept7 tweak wave 4 — 2026-08-13 (fourth same-day wave)

Three user-reported defects fixed, live-reproduced before and re-verified after;
sealed with dated wave-4 dispositions. Owner-doc changes:

- `Plans/FinalGUISpec.md` — F3-HOME-001: browser-in-panel deactivation is
  model-first (`deactivateBrowserProjection` clears the persisted
  browser-active domain ref; root cause recorded: restoreOwnerRefs resurrected
  the stale flag on every commit, making cmd.terminal.split_pane appear to have
  editor side-effects; mountActiveBrowser enforces a single active tab and
  un-hides a chip-collapsed browser tab). F3-503: host targeting is latch-based
  and purely geometric (buildDockLatch entry/exit bands frozen at pickup, 44 px
  exit slack; elementsFromPoint retired from drop-target resolution with the
  measured starvation loop recorded — ~9 Hz dock flapping reduced to one host
  transition and one track opening per approach; the wave-3 two-frame
  hysteresis stays for slot flapping). F3-421: HTML5 DnD tab reorder retired
  (with the wave-3 attached-ghost Safari shim) for a pointer-capture gesture —
  gesture-scoped window listeners, 4 px threshold, 1:1 translateX glide,
  220 ms neighbour FLIP, 200 ms low-bounce settle, model re-render at
  settle-end; Safari root causes and the lostpointercapture-on-reparent trap
  recorded; .tab.dragging at .92 opacity / z 40; T07 pointermove pin untouched.
- `Plans/UI_Wiring_Rules.md` — §0.1 concept-input note extended.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — interaction
  rules re-amended; artifact and source hashes recomputed (census unchanged at
  56 home rows).
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — reorder/targeting/browser
  rows updated.

Governance: seal row `dec-2026-08-13-pm7-tweak-wave-4`, evidence bundle
`Plans/.evidence/pm7-tweak-wave-4-2026-08-13/`. No new command IDs, no wiring
row changes, no storage shape changes; this wave creates no WorkNodes,
NodeSeeds, executable queues, implementation files, runtime artifacts, or
production build tasks.

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
  is the single close affordance). Historical §3.1/§3.2 status-bar removal is
  superseded on 2026-08-27: the full-width F3-448 no-bell status bar remains;
  the 4 px shell-spacing decision remains applicable.
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
