# Shard 053: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/FinalGUISpec.md`

Source lines: L26721-L27179

Source SHA256: `0c52e700714839fefab1f760a7aca55bbb0e19ab2792961fca22bdb4996286ed`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### F3-412 - P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION

```yaml
plan_unit_id: F3-412
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION (P1) is compiled as canonical Puppet Master intent for Global keyboard hook isolation: Add GlobalShortcutSafety PlanUnit for all app-level hotkeys, not only terminal. Include watchdog, timeout auto-disable, kill switch, and diagnostic banner. The preserved PM gap/delta is: No explicit global-event-tap isolation requirements: hooks must not run on UI/compositor main thread, must auto-disable on stall, and must be observable. The observed external-repo signal remains source-lineage evidence: Ghostty discussion reports system-wide keyboard freezes tied to global quick-terminal keybinding/event tap; Warp changelog includes global hotkey memory leak fixes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Global hotkey handler stall cannot freeze system input.
- User can disable terminal/global hotkey path from safe mode.
- Diagnostic bundle records hook health.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Global hotkey handler stall cannot freeze system input.
- User can disable terminal/global hotkey path from safe mode.
- Diagnostic bundle records hook health.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: p1_terminal_global_hotkey_isolation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0014
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0010/P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION@line=10
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0010/P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:10
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0014
external_atom_id: extrepo-20260703-0010
source_row_id: P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION
priority: P1
finding_family: Global keyboard hook isolation
source_repos:
- ghostty-org/ghostty
- warpdotdev/warp
target_docs:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
preserved_exact_tokens:
- extrepo-20260703-0010
- P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION
- P1
- Global keyboard hook isolation
- ghostty-org/ghostty
- warpdotdev/warp
negative_constraints: []
observed_signal: Ghostty discussion reports system-wide keyboard freezes tied to global quick-terminal keybinding/event tap; Warp changelog includes global hotkey memory leak fixes.
pm_current_coverage: PM has shortcut conflict disclosure and terminal input ownership states.
pm_gap_or_delta: 'No explicit global-event-tap isolation requirements: hooks must not run on UI/compositor main thread, must auto-disable on stall, and must be observable.'
proposal_or_recommendation: Add GlobalShortcutSafety PlanUnit for all app-level hotkeys, not only terminal. Include watchdog, timeout auto-disable, kill switch, and diagnostic banner.
compile_disposition: create_new_planunit
```

### F3-413 - P2-GUI-NOT-CLI-CONTROL-PLANE

```yaml
plan_unit_id: F3-413
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  P2-GUI-NOT-CLI-CONTROL-PLANE (P2) is compiled as canonical Puppet Master intent for Translate CLI lessons into GUI adapter contracts: Add GUI-first terminal policy note: built-in terminal is a user shell and agent surface; PM command/control remains GUI/Goal/PlanUnit driven. The preserved PM gap/delta is: Need explicit non-goal: do not let a PM CLI become the main product. CLI/terminal lessons feed internal tool/adapter APIs, GUI command catalog, and embedded terminal behavior. The observed external-repo signal remains source-lineage evidence: Warp became an agentic development environment born out of terminal; Codex offers CLI/app/IDE; Cline offers IDE/terminal/CLI/SDK/Kanban; tmux is terminal-native and scriptable.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every terminal action has GUI-visible state and command palette command; no core workflow requires opaque CLI-only state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every terminal action has GUI-visible state and command palette command; no core workflow requires opaque CLI-only state.
risk_class: p2_ui_projection_and_hard_gates_coverage
reasoning_tier: standard
context_scope: ui_projection_and_hard_gates
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: p2_gui_not_cli_control_plane
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0024
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0024
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0020/P2-GUI-NOT-CLI-CONTROL-PLANE@line=20
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0020/P2-GUI-NOT-CLI-CONTROL-PLANE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:20
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0024
external_atom_id: extrepo-20260703-0020
source_row_id: P2-GUI-NOT-CLI-CONTROL-PLANE
priority: P2
finding_family: Translate CLI lessons into GUI adapter contracts
source_repos:
- warpdotdev/warp
- openai/codex
- cline/cline
- tmux/tmux
target_docs:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
preserved_exact_tokens:
- extrepo-20260703-0020
- P2-GUI-NOT-CLI-CONTROL-PLANE
- P2
- Translate CLI lessons into GUI adapter contracts
- warpdotdev/warp
- openai/codex
- cline/cline
- tmux/tmux
negative_constraints: []
observed_signal: Warp became an agentic development environment born out of terminal; Codex offers CLI/app/IDE; Cline offers IDE/terminal/CLI/SDK/Kanban; tmux is terminal-native and scriptable.
pm_current_coverage: PM is GUI-first and Section15 says terminal is canonical interactive shell surface, not app CLI.
pm_gap_or_delta: 'Need explicit non-goal: do not let a PM CLI become the main product. CLI/terminal lessons feed internal tool/adapter APIs, GUI command catalog, and embedded terminal behavior.'
proposal_or_recommendation: 'Add GUI-first terminal policy note: built-in terminal is a user shell and agent surface; PM command/control remains GUI/Goal/PlanUnit driven.'
compile_disposition: create_new_planunit
```

### F3-414 - P2-RICH-TEXT-RENDERING-FIDELITY

```yaml
plan_unit_id: F3-414
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  P2-RICH-TEXT-RENDERING-FIDELITY (P2) is compiled as canonical Puppet Master intent for Rendered GUI text fidelity separate from terminal fidelity: Imported external-repo finding extrepo-20260703-0035 / P2-RICH-TEXT-RENDERING-FIDELITY (P2). The preserved PM gap/delta is: Add rich-text fixtures for ASCII ligatures, bullets, arrows, emoji, combining marks, CJK width, raw vs rendered view, and copy/source-byte fidelity. The observed external-repo signal remains source-lineage evidence: Warp rendered Markdown/rich UI misrendered glyphs while source bytes remained correct.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Rendered Markdown preserves displayed glyphs for fi/bullet fixtures
- Copy from rendered view preserves source bytes where expected
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Rendered Markdown preserves displayed glyphs for fi/bullet fixtures
- Copy from rendered view preserves source bytes where expected
risk_class: p2_terminal_runtime_coverage
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Plan_Document_System.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p2_rich_text_rendering_fidelity
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0039
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0039
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0035/P2-RICH-TEXT-RENDERING-FIDELITY@line=35
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0035/P2-RICH-TEXT-RENDERING-FIDELITY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:15
source_atom_ids:
- atom-0039
external_atom_id: extrepo-20260703-0035
source_row_id: P2-RICH-TEXT-RENDERING-FIDELITY
priority: P2
finding_family: Rendered GUI text fidelity separate from terminal fidelity
source_repos:
- warpdotdev/warp
target_docs:
- Plans/FinalGUISpec.md
- Plans/Plan_Document_System.md
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Plan_Document_System.md
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0035
- P2-RICH-TEXT-RENDERING-FIDELITY
- P2
- Rendered GUI text fidelity separate from terminal fidelity
- warpdotdev/warp
negative_constraints: []
observed_signal: Warp rendered Markdown/rich UI misrendered glyphs while source bytes remained correct.
pm_current_coverage: PM has FinalGUI and terminal rendering plans, but terminal protocol tests do not cover rendered Markdown/source parity.
pm_gap_or_delta: Add rich-text fixtures for ASCII ligatures, bullets, arrows, emoji, combining marks, CJK width, raw vs rendered view, and copy/source-byte fidelity.
compile_disposition: create_new_planunit
```

### F3-415 - P1-UI-HARD-GATE-ENFORCER

```yaml
plan_unit_id: F3-415
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  P1-UI-HARD-GATE-ENFORCER (P1) is compiled as canonical Puppet Master intent for User-defined hard gates for visual QA, artifact delivery, and output modality: Imported external-repo finding extrepo-20260703-0086 / P1-UI-HARD-GATE-ENFORCER (P1). The preserved PM gap/delta is: Permissions/gates are strong, but visual QA/artifact delivery/output modality should be hard runtime predicates, not conversational instructions. The observed external-repo signal remains source-lineage evidence: Codex recent issue list includes an agent bypassing user-defined hard gates for local artifact delivery and visual QA, and another issue about output-modality constraints. | Warp and Cline show GUI/agent surfaces where commands, artifacts, and agent outputs cross UI boundaries.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- User-defined gates for visual QA, local artifact delivery, screenshot/video proof, and output modality compile into RuntimeHardGate predicates.
- An artifact cannot be delivered/marked complete until required visual/evidence gates settle.
- Bypass attempts become typed gate violations with blocked state and repair route.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- User-defined gates for visual QA, local artifact delivery, screenshot/video proof, and output modality compile into RuntimeHardGate predicates.
- An artifact cannot be delivered/marked complete until required visual/evidence gates settle.
- Bypass attempts become typed gate violations with blocked state and repair route.
risk_class: p1_ui_projection_and_hard_gates_hardening
reasoning_tier: standard
context_scope: ui_projection_and_hard_gates
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_ui_hard_gate_enforcer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0090
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0090
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0086/P1-UI-HARD-GATE-ENFORCER@line=86
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0086/P1-UI-HARD-GATE-ENFORCER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:13
source_atom_ids:
- atom-0090
external_atom_id: extrepo-20260703-0086
source_row_id: P1-UI-HARD-GATE-ENFORCER
priority: P1
finding_family: User-defined hard gates for visual QA, artifact delivery, and output modality
target_docs:
- FinalGUISpec.md
- Runtime_Artifacts_Panel.md
- Media_Generation_and_Capabilities.md
- Automated_Testing_System.md
- Permissions_System.md
owner_hints:
- FinalGUISpec.md
- Runtime_Artifacts_Panel.md
- Media_Generation_and_Capabilities.md
- Automated_Testing_System.md
- Permissions_System.md
preserved_exact_tokens:
- extrepo-20260703-0086
- P1-UI-HARD-GATE-ENFORCER
- P1
- User-defined hard gates for visual QA, artifact delivery, and output modality
negative_constraints: []
observed_signal: Codex recent issue list includes an agent bypassing user-defined hard gates for local artifact delivery and visual QA, and another issue about output-modality constraints. | Warp and Cline show GUI/agent surfaces where commands, artifacts, and agent outputs cross UI boundaries.
pm_gap_or_delta: Permissions/gates are strong, but visual QA/artifact delivery/output modality should be hard runtime predicates, not conversational instructions.
relationship_to_prior_reports: Refines permission/approval model for GUI artifact workflows.
compile_disposition: create_new_planunit
```

### F3-416 - P1-UI-PROJECTION-STORE-BUDGET

```yaml
plan_unit_id: F3-416
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  P1-UI-PROJECTION-STORE-BUDGET (P1) is compiled as canonical Puppet Master intent for Bounded UI projection stores: Imported external-repo finding extrepo-20260703-0097 / P1-UI-PROJECTION-STORE-BUDGET (P1). The preserved PM gap/delta is: GUI thread projection, model replay history, terminal scrollback, media thumbnails, and debug logs need separate caps and eviction receipts. The observed external-repo signal remains source-lineage evidence: Huge history/state freezes and compaction/resource issues show projections and durable history must be separate.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 5MB+ projection cannot freeze main UI
- Evicted projection data records receipt
- Durable semantic history is not lost when UI projection prunes
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 5MB+ projection cannot freeze main UI
- Evicted projection data records receipt
- Durable semantic history is not lost when UI projection prunes
risk_class: p1_ui_projection_and_hard_gates_hardening
reasoning_tier: standard
context_scope: ui_projection_and_hard_gates
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_ui_projection_store_budget
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0101
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0101
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0097/P1-UI-PROJECTION-STORE-BUDGET@line=97
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0097/P1-UI-PROJECTION-STORE-BUDGET
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:10
source_atom_ids:
- atom-0101
external_atom_id: extrepo-20260703-0097
source_row_id: P1-UI-PROJECTION-STORE-BUDGET
priority: P1
finding_family: Bounded UI projection stores
source_repos:
- Cline
- Warp
- OpenAI Codex
preserved_exact_tokens:
- extrepo-20260703-0097
- P1-UI-PROJECTION-STORE-BUDGET
- P1
- Bounded UI projection stores
- Cline
- Warp
- OpenAI Codex
negative_constraints: []
observed_signal: Huge history/state freezes and compaction/resource issues show projections and durable history must be separate.
pm_gap_or_delta: GUI thread projection, model replay history, terminal scrollback, media thumbnails, and debug logs need separate caps and eviction receipts.
compile_disposition: create_new_planunit
```

### F3-417 - GUI Platform Currentness Renderer Web And Icon Contract

```yaml
plan_unit_id: F3-417
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Puppet Master targets Slint 1.17.1 for the active GUI platform. Native desktop uses Slint Winit with Skia compiled
  in and selected by default on Windows, Linux, and macOS; fallback order is explicit SLINT_BACKEND override, persisted
  preference, Winit + Skia, Winit + FemtoVG-wgpu, then Winit software emergency mode. The first GUI build includes
  native desktop plus a Rust Slint/WASM canvas web GUI compiled as cdylib through wasm-bindgen, wasm-pack, or an
  approved equivalent and loaded through minimal HTML/canvas bootstrap rather than React, Tauri, or DOM product UI.
  Browser-only WASM cannot claim PTY, filesystem, process/container, CEF, tray, native-window, or raw OS drag/drop
  authority; those OS-owned capabilities route through the trusted local daemon with authenticated local origin or
  pairing, origin/CSRF protection, capability probe, permission request, receipt/audit event, redaction, degraded
  reason, and deterministic agent-test hooks. Web capability state values are native_full, web_supported_direct,
  web_supported_via_trusted_local_daemon, web_simulated_or_degraded, and web_disabled. Production GUI source uses
  bundled SVGs through stable icon_id entries and must not use emoji, emoji-like pictographs, Unicode pseudo-icons,
  network/CDN icons, or icon-only controls without accessible labels and non-icon state text.
gui_related: true
gui_classification_reason: This unit locks GUI platform, renderer, web GUI, visible capability, and icon policy decisions.
split_recommended: false
depends_on:
- F3-026
- F3-029
- F3-030
- F3-033
- ATS-023
unblocks: []
acceptance_criteria:
- Active Slint toolkit references in live owner docs and Spec_Lock use Slint 1.17.1, while old versions remain only in audit/source-lineage history.
- Native renderer fallback order is explicit and preserves SLINT_BACKEND override authority before persisted preference and compiled defaults.
- Web GUI capability claims use the approved capability states and route OS-owned capabilities through the trusted local daemon.
- Production icons use bundled SVG icon_id manifest entries, accessible labels, fallback text, and non-icon state text; emoji/pictographic pseudo-icons and remote icon sources are forbidden.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this decision.
validation_surfaces:
- python3 scripts/pm-gui-asset-policy.py
- python3 scripts/pm-plans-verify.py validate-gui-asset-policy
- python3 scripts/pm-plans-verify.py verify-spec-lock
- python3 scripts/pm-plan-index.py validate
risk_class: gui_platform_currentness_drift
reasoning_tier: high
context_scope: fable_20260706_gui_platform_currentness_repair
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/BinaryLocator_Spec.md
- Plans/MiscPlan.md
- Plans/LSPSupport.md
- Plans/PMConcept_Control_Reconciliation.json
- Plans/Spec_Lock.json
- scripts/pm-gui-asset-policy.py
node_compile_hint:
  mode: gui_platform_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- fablereport.md:103-112
- Plans/.audits/fable-20260706/currentness_check_report.json
- Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:8
source_atom_ids: []
preserved_exact_tokens:
- "Slint 1.17.1"
- "Winit + Skia"
- "Winit + FemtoVG-wgpu"
- "Winit software renderer"
- "SLINT_BACKEND"
- "Slint/WASM canvas"
- "trusted local daemon"
- "native_full"
- "web_supported_direct"
- "web_supported_via_trusted_local_daemon"
- "web_simulated_or_degraded"
- "web_disabled"
- "icon_id"
- "no emoji"
negative_constraints:
- "Do not create WorkNodes, NodeSeeds, queues, implementation files, runtime launches, or production build artifacts."
- "Do not allow browser-only WASM to pretend it directly owns OS capabilities."
- "Do not use React, Tauri, or DOM-rendered product UI for the Slint web GUI."
- "Do not use emoji, emoji-like pictographs, Unicode pseudo-icons, network/CDN icons, or icon-only state carriers in production GUI source."
compatibility_only_notes:
- "Slint 1.17.0, Slint 1.15.1, PMConcept terminal transcripts, and FABLE pre-repair wording are source-lineage/history only after this repair."
owner_boundary_notes:
- "FinalGUISpec owns GUI platform and visible capability policy; Automated_Testing_System owns web GUI dev/test workflow; UI_Command_Catalog owns only development-preview command IDs."
```
