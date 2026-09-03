# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L9393-L10418

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical promoted-feature/browser-terminal spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Browser Action Table And Timeouts

Repairs rows `sfk-756cb4154b9e486d8a6d74db`, `sfk-0a996093252d3d35aa59e6f2`, `sfk-ed92df2325332306b2463b50`, and `sfk-47f354a1222d2abb62b4a9a9`.

| action_id | bucket | default_timeout_ms | output fields |
| --- | --- | ---: | --- |
| `cmd.browser.share_with_agent` | user-mediated-share | 30000 | `share_receipt_id`, `target_agent_id`, `artifact_refs[]` |
| `cmd.browser.run_code` | page-evaluation | 5000 | `evaluation_id`, `stdout?`, `result_ref?`, `error_code?` |
| `cmd.browser.evaluate` | page-evaluation | 5000 | `evaluation_id`, `json_result_ref?`, `dom_scope_ref?`, `error_code?` |
| `cmd.browser.open_devtools` | diagnostic | 30000 | `devtools_session_id`, `boundary_ref`, `opened_at_utc` |
| `cmd.browser.capture_artifact` | artifact | 30000 | `artifact_manifest_id`, `artifact_refs[]`, `retention_until_utc` |

The former `browser_run_code` and `browser_evaluate` tokens are compatibility aliases for `cmd.browser.run_code` and `cmd.browser.evaluate`. Timeout constants are disambiguated as follows: `5000ms` applies to page-evaluation commands; `30000ms` applies to user-mediated share, diagnostic, artifact, and open/wait actions; `30s` is display copy for `30000ms`.

`BrowserArtifactManifest` fields are `artifact_manifest_id`, `browser_session_id`, `action_id`, `artifact_refs[]`, `retention_class`, `created_at_utc`, `redaction_profile_id`, and `schema_version`.

### Tab-Cap Policy And Restore Identity

Repairs rows `sfk-2fe1c569e11d92dd4dbc7c76` and `sfk-7a6ddaeaa377096558537bb1`.

- Default tab cap per project is `32` attached browser tabs. Warning threshold is `24`.
- Outcomes: `prompt` at threshold crossing, `block` when creating tab 33 without override, `close_oldest_detached` when the user chooses cleanup, and `detach_without_agent_access` when a tab is kept only for human inspection.
- Dialog copy at cap: `This project already has 32 browser tabs. Close an older detached tab, detach this tab without agent access, or cancel.`
- Restore identity ordering is `browser_session_id`, then `project_id + origin + normalized_url_hash`, then `last_visible_title_hash`.
- If two tabs claim the same `project_id` and normalized URL hash, PM keeps the tab with the newest `last_user_interaction_at_utc` as attached and marks the other `restore_conflict_detached`.

### Pane Layout Family Transform

Repairs row `sfk-821a87baaf08f064a2b71c15`.

`nearest_valid_family` is deterministic:

1. Preserve the active pane if its current size is at least 160px by 120px.
2. Prefer same orientation (`row` or `column`) when the target family supports it.
3. Collapse the smallest non-active pane first.
4. If two panes have equal area, collapse the one with older `last_focus_at_utc`.
5. If still tied, collapse lexical `pane_id`.

The transform result records `from_family`, `to_family`, `collapsed_pane_ids[]`, `active_pane_id`, and `reason_code`.

### Streaming Usage Payload

Repairs row `sfk-d8a758adf1c768de6e1410a9`.

Legacy compatibility event name: `browser.streaming_usage_reported`.

This browser payload is a pre-UF-085 compatibility/import shape only. It may be accepted at the browser boundary for migration or adapter interop, but it MUST map into a canonical UsageRecord before persistence, GUI display, Ledger/Usage drill-through, rollups, accounting checks, or runtime-artifact export.

Compatibility fields are `event_id`, `browser_session_id`, `project_id`, `provider_id?`, `model_id?`, `input_tokens?`, `output_tokens?`, `cache_read_tokens?`, `cache_write_tokens?`, `estimated_cost_microdollars?`, `usage_source`, `created_at_utc`, and `schema_version`. The mapper emits or joins `usage_record_id`, `usage_event_ref`, provider/runtime refs, `source_class`, `source_confidence`, `source_authority`, `settlement_status`, `cost_status`, canonical UF-085 buckets, `counting_semantics`, and cost/quota packets. `input_tokens` maps to `input_total`, `output_tokens` maps to `output_total`, `cache_read_tokens` maps to `cache_read`, `cache_write_tokens` maps to `cache_write` plus `cache_write_1h` or provider TTL-specific `cache_write_ttl` only when exposed, and `estimated_cost_microdollars` maps to canonical cost fields with `cost_status = estimated` unless settlement evidence supersedes it.

Legacy `usage_source` values `provider_reported`, `estimated`, `corrected`, and `unavailable` are source labels only. They normalize to UF-085 `source_class`, `source_confidence`, `source_authority`, and settlement/cost status before any UsageRecord/accounting/display authority is created.

### Terminal Fixture Matrix And Record Minima

Repairs rows `sfk-c5ad7b33fa51846ef1c86c49` and `sfk-e9cc3bc253470d324d189932`.

Terminal VT/xterm/OSC fixtures are grouped by `fixture_id`, `protocol_family`, `input_bytes_ref`, `expected_screen_hash`, `expected_event_refs[]`, and `negative_case`.

Required record minima:

- `TerminalIngestionReceipt`: `receipt_id`, `terminal_session_id`, `byte_count`, `protocol_family`, `accepted`, `rejected_reason_code?`, `created_at_utc`.
- `TerminalBackpressureState`: `terminal_session_id`, `queue_depth`, `dropped_frame_count`, `throttle_state`, `last_transition_at_utc`.
- `TerminalRenderFrame`: `frame_id`, `terminal_session_id`, `dirty_region_refs[]`, `screen_hash`, `rendered_at_utc`.
- `TerminalInputEvent`: `event_id`, `terminal_session_id`, `input_kind`, `payload_ref`, `permission_snapshot_id?`, `created_at_utc`.
- `TerminalPasteReceipt`: `receipt_id`, `terminal_session_id`, `paste_kind`, `byte_count`, `sanitized`, `created_at_utc`.
- `TerminalOscEvent`: `event_id`, `terminal_session_id`, `osc_code`, `payload_ref`, `allowed`, `blocked_reason_code?`.
- `TerminalScrollbackAnchor`: `anchor_id`, `terminal_session_id`, `line_offset`, `screen_hash`, `created_at_utc`.
- `TerminalProfileResolution`: `resolution_id`, `profile_id`, `shell_path`, `cwd`, `env_summary_ref`, `created_at_utc`.
- `TerminalSessionRestoreDecision`: `decision_id`, `terminal_session_id`, `restore_state`, `reason_code`, `created_at_utc`.
- `TerminalAccessibilitySnapshot`: `snapshot_id`, `terminal_session_id`, `screen_reader_text_ref`, `focus_cell`, `created_at_utc`.
- `TerminalDiagnosticsEnvelope`: `diagnostic_id`, `terminal_session_id`, `category`, `severity`, `message_ref`, `created_at_utc`.

### Browser Runtime Packaging Boundary

Repairs row `sfk-72b2ee82fedf09de17854db0`.

CEF via `wef/cargo-wef` is a candidate packaging strategy, not a locked runtime dependency. The canonical packaging decision fields are `browser_runtime_id`, `crate_or_bundle_ref`, `supported_platforms[]`, `install_source`, `license_ref`, `sandbox_profile_ref`, `update_policy`, and `fallback_runtime_id?`. A release may enable browser runtime only after these fields are filled for the target platform.

### SMPFS-125 - P0-TERMINAL-OUTPUT-BACKPRESSURE

```yaml
plan_unit_id: SMPFS-125
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P0-TERMINAL-OUTPUT-BACKPRESSURE (P0) is compiled as canonical Puppet Master intent for No silent terminal output loss: Add TerminalIngestionReceipt and TerminalBackpressureState. Differentiate accepted-by-PTY, parsed-to-grid, appended-to-transcript, flushed-to-storage, painted, pruned, redacted, and diagnostic-exported. The preserved PM gap/delta is: PM needs explicit loss accounting: when bytes are accepted by PTY reader, parsed, painted, persisted, pruned, redacted, or dropped/deferred, there must be receipts and user-visible status. The observed external-repo signal remains source-lineage evidence: tmux history includes backpressure/control-mode buffering design; older issue families report output lines missing when terminal/client can't keep up; Warp/Ghostty issue streams include huge output, rendering, and persisted block edge cases.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A fast-output fixture records byte counts and no silent loss.
- If retention cap prunes, transcript chunk references prove what remains and what was pruned.
- UI thread never blocks on raw PTY ingestion.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A fast-output fixture records byte counts and no silent loss.
- If retention cap prunes, transcript chunk references prove what remains and what was pruned.
- UI thread never blocks on raw PTY ingestion.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p0_terminal_output_backpressure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0006
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0006
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0002/P0-TERMINAL-OUTPUT-BACKPRESSURE@line=2
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0002/P0-TERMINAL-OUTPUT-BACKPRESSURE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:2
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0006
external_atom_id: extrepo-20260703-0002
source_row_id: P0-TERMINAL-OUTPUT-BACKPRESSURE
priority: P0
finding_family: No silent terminal output loss
source_repos:
- tmux/tmux
- ghostty-org/ghostty
- warpdotdev/warp
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0002
- P0-TERMINAL-OUTPUT-BACKPRESSURE
- P0
- No silent terminal output loss
- tmux/tmux
- ghostty-org/ghostty
- warpdotdev/warp
negative_constraints: []
observed_signal: tmux history includes backpressure/control-mode buffering design; older issue families report output lines missing when terminal/client can't keep up; Warp/Ghostty issue streams include huge output, rendering, and persisted block edge cases.
pm_current_coverage: PM says retention/pruning are honest and high-output sessions must not stall UI; parser-engine gates include huge output fixtures.
pm_gap_or_delta: 'PM needs explicit loss accounting: when bytes are accepted by PTY reader, parsed, painted, persisted, pruned, redacted, or dropped/deferred, there must be receipts and user-visible status.'
proposal_or_recommendation: Add TerminalIngestionReceipt and TerminalBackpressureState. Differentiate accepted-by-PTY, parsed-to-grid, appended-to-transcript, flushed-to-storage, painted, pruned, redacted, and diagnostic-exported.
compile_disposition: create_new_planunit
```

### SMPFS-126 - P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR

```yaml
plan_unit_id: SMPFS-126
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR (P0) is compiled as canonical Puppet Master intent for Accessible terminal text model separate from renderer: Add TerminalAccessibleBuffer projection from canonical grid/transcript state, with cursor navigation, line/selection reading, output announcement modes, and long-output silence/throttle controls. The preserved PM gap/delta is: PM still needs an explicit terminal accessibility text mirror and speech/event throttling model; labels alone are insufficient for a terminal grid. The observed external-repo signal remains source-lineage evidence: Ghostty screen-reader discussion notes GPU rendering prevents screen readers from extracting terminal state and calls for direct screen-reader output, terminal-state exposure, cursor navigation support, and spam silencing.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels.
- Long-running spam commands throttle announcements without hiding state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels.
- Long-running spam commands throttle announcements without hiding state.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_terminal_accessibility_text_mirror
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0007
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0007
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0003/P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR@line=3
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0003/P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:3
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0007
external_atom_id: extrepo-20260703-0003
source_row_id: P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR
priority: P0
finding_family: Accessible terminal text model separate from renderer
source_repos:
- ghostty-org/ghostty
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0003
- P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR
- P0
- Accessible terminal text model separate from renderer
- ghostty-org/ghostty
negative_constraints: []
observed_signal: Ghostty screen-reader discussion notes GPU rendering prevents screen readers from extracting terminal state and calls for direct screen-reader output, terminal-state exposure, cursor navigation support, and spam silencing.
pm_current_coverage: PM has accessibility requirements and screen-reader-readable labels, plus requested-vs-effective disclosure for accessibility support.
pm_gap_or_delta: PM still needs an explicit terminal accessibility text mirror and speech/event throttling model; labels alone are insufficient for a terminal grid.
proposal_or_recommendation: Add TerminalAccessibleBuffer projection from canonical grid/transcript state, with cursor navigation, line/selection reading, output announcement modes, and long-output silence/throttle controls.
compile_disposition: create_new_planunit
```

### SMPFS-127 - P1-TERMINAL-CLIPBOARD-PASTE-SAFETY

```yaml
plan_unit_id: SMPFS-127
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-CLIPBOARD-PASTE-SAFETY (P1) is compiled as canonical Puppet Master intent for Clipboard, pasteboard, bracketed paste, OSC 52: Add TerminalClipboardPolicy: plain text preference, URI/file types explicit, control-character confirmation, bracketed paste support state, OSC 52 allow/ask/deny, local/remote/container clipboard scope. The preserved PM gap/delta is: Need explicit paste-source priority and pasted-control-character handling, bracketed-paste negotiation, OSC 52 policy, and cross-context clipboard isolation. The observed external-repo signal remains source-lineage evidence: Ghostty issue list includes paste preferring NSURL over plain text; Ghostty 1.3.0 fixed a paste/drag command-execution CVE; tmux CHANGES include OSC 52 clipboard support; Warp issues include copy/paste isolation.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Pasting mixed URL/plain text chooses plain text unless user selects URI action.
- Pasted Ctrl+C/control chars cannot execute without warning/normalization.
- OSC 52 read/write respects policy and remote trust.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Pasting mixed URL/plain text chooses plain text unless user selects URI action.
- Pasted Ctrl+C/control chars cannot execute without warning/normalization.
- OSC 52 read/write respects policy and remote trust.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
node_compile_hint:
  mode: p1_terminal_clipboard_paste_safety
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0013
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0013
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0009/P1-TERMINAL-CLIPBOARD-PASTE-SAFETY@line=9
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0009/P1-TERMINAL-CLIPBOARD-PASTE-SAFETY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:9
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0013
external_atom_id: extrepo-20260703-0009
source_row_id: P1-TERMINAL-CLIPBOARD-PASTE-SAFETY
priority: P1
finding_family: Clipboard, pasteboard, bracketed paste, OSC 52
source_repos:
- ghostty-org/ghostty
- warpdotdev/warp
- tmux/tmux
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
preserved_exact_tokens:
- extrepo-20260703-0009
- P1-TERMINAL-CLIPBOARD-PASTE-SAFETY
- P1
- Clipboard, pasteboard, bracketed paste, OSC 52
- ghostty-org/ghostty
- warpdotdev/warp
- tmux/tmux
negative_constraints: []
observed_signal: Ghostty issue list includes paste preferring NSURL over plain text; Ghostty 1.3.0 fixed a paste/drag command-execution CVE; tmux CHANGES include OSC 52 clipboard support; Warp issues include copy/paste isolation.
pm_current_coverage: PM has copy/paste/selection semantics and default copy-on-select disabled.
pm_gap_or_delta: Need explicit paste-source priority and pasted-control-character handling, bracketed-paste negotiation, OSC 52 policy, and cross-context clipboard isolation.
proposal_or_recommendation: 'Add TerminalClipboardPolicy: plain text preference, URI/file types explicit, control-character confirmation, bracketed paste support state, OSC 52 allow/ask/deny, local/remote/container clipboard scope.'
compile_disposition: create_new_planunit
```

### SMPFS-128 - P1-TERMINAL-SESSION-PRESERVE-UPDATE

```yaml
plan_unit_id: SMPFS-128
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-SESSION-PRESERVE-UPDATE (P1) is compiled as canonical Puppet Master intent for Terminal session continuity across relaunch/update: Add TerminalSessionRestorePolicy by platform/runtime: local PTY, WSL, SSH, container, devcontainer. Define reconnect tokens, when impossible, and exact banners/actions. The preserved PM gap/delta is: Need a concrete platform matrix for live session survival/reconnect and a UX flow for when only historical review can be restored. The observed external-repo signal remains source-lineage evidence: Warp issue requests terminal/agent sessions alive across relaunch/app updates; Warp changelog includes reopen closed sessions and restored WSL PWD; tmux's mature value is session/window/pane durability.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Relaunch fixtures prove PWD/profile/layout/transcript restoration.
- If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Relaunch fixtures prove PWD/profile/layout/transcript restoration.
- If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_terminal_session_preserve_update
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0015
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0015
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0011/P1-TERMINAL-SESSION-PRESERVE-UPDATE@line=11
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0011/P1-TERMINAL-SESSION-PRESERVE-UPDATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:11
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0015
external_atom_id: extrepo-20260703-0011
source_row_id: P1-TERMINAL-SESSION-PRESERVE-UPDATE
priority: P1
finding_family: Terminal session continuity across relaunch/update
source_repos:
- warpdotdev/warp
- tmux/tmux
- ghostty-org/ghostty
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0011
- P1-TERMINAL-SESSION-PRESERVE-UPDATE
- P1
- Terminal session continuity across relaunch/update
- warpdotdev/warp
- tmux/tmux
- ghostty-org/ghostty
negative_constraints: []
observed_signal: Warp issue requests terminal/agent sessions alive across relaunch/app updates; Warp changelog includes reopen closed sessions and restored WSL PWD; tmux's mature value is session/window/pane durability.
pm_current_coverage: PM says live continuity after app restart is best-effort and explicit when unavailable; historical state is not fake live shell.
pm_gap_or_delta: Need a concrete platform matrix for live session survival/reconnect and a UX flow for when only historical review can be restored.
proposal_or_recommendation: 'Add TerminalSessionRestorePolicy by platform/runtime: local PTY, WSL, SSH, container, devcontainer. Define reconnect tokens, when impossible, and exact banners/actions.'
compile_disposition: create_new_planunit
```

### SMPFS-129 - P1-TERMINAL-SEMANTIC-MARKER-PARSER

```yaml
plan_unit_id: SMPFS-129
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-SEMANTIC-MARKER-PARSER (P1) is compiled as canonical Puppet Master intent for OSC133/633 semantic prompt parser confidence tiers: Imported external-repo finding extrepo-20260703-0029 / P1-TERMINAL-SEMANTIC-MARKER-PARSER (P1). The preserved PM gap/delta is: Add region/pane-aware TerminalSemanticMarkerParser with malformed-param tolerance and confidence tiers: native, shell-integrated, tmux-forwarded, passthrough-unverified, heuristic-only. The observed external-repo signal remains source-lineage evidence: tmux OSC133 forwarding issue needs pane/visibility scoping; Ghostty parser failed on bare key; row-based markers and over-clearing flags are fragile.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- OSC133 markers spanning multi-row prompt produce one region
- Bare key param does not crash parser
- tmux passthrough marks command-block confidence degraded when unverified
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- OSC133 markers spanning multi-row prompt produce one region
- Bare key param does not crash parser
- tmux passthrough marks command-block confidence degraded when unverified
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p1_terminal_semantic_marker_parser
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0033
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0033
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0029/P1-TERMINAL-SEMANTIC-MARKER-PARSER@line=29
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0029/P1-TERMINAL-SEMANTIC-MARKER-PARSER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0033
external_atom_id: extrepo-20260703-0029
source_row_id: P1-TERMINAL-SEMANTIC-MARKER-PARSER
priority: P1
finding_family: OSC133/633 semantic prompt parser confidence tiers
source_repos:
- ghostty-org/ghostty
- tmux/tmux
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0029
- P1-TERMINAL-SEMANTIC-MARKER-PARSER
- P1
- OSC133/633 semantic prompt parser confidence tiers
- ghostty-org/ghostty
- tmux/tmux
negative_constraints: []
observed_signal: tmux OSC133 forwarding issue needs pane/visibility scoping; Ghostty parser failed on bare key; row-based markers and over-clearing flags are fragile.
pm_current_coverage: PM terminal identity/session model and native core are strong; previous backlog included broad protocol matrix.
pm_gap_or_delta: 'Add region/pane-aware TerminalSemanticMarkerParser with malformed-param tolerance and confidence tiers: native, shell-integrated, tmux-forwarded, passthrough-unverified, heuristic-only.'
compile_disposition: create_new_planunit
```

### SMPFS-130 - P1-TERMINAL-CHUNK-SPANNING-PARSER

```yaml
plan_unit_id: SMPFS-130
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-CHUNK-SPANNING-PARSER (P1) is compiled as canonical Puppet Master intent for Terminal parser state spans arbitrary PTY reads: Imported external-repo finding extrepo-20260703-0030 / P1-TERMINAL-CHUNK-SPANNING-PARSER (P1). The preserved PM gap/delta is: Add parser invariant and byte-boundary fuzz fixtures for OSC/DCS/CSI/bracketed paste/sync updates/hyperlinks/shell markers split at every byte boundary. The observed external-repo signal remains source-lineage evidence: tmux DEC 2026 synchronized update bug leaked structural commands when begin/end pair spanned pane reads.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No control sequence bytes leak to visible grid when split across reads
- Synchronized update state closes correctly after arbitrary chunking
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No control sequence bytes leak to visible grid when split across reads
- Synchronized update state closes correctly after arbitrary chunking
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: p1_terminal_chunk_spanning_parser
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0034
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0034
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0030/P1-TERMINAL-CHUNK-SPANNING-PARSER@line=30
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0030/P1-TERMINAL-CHUNK-SPANNING-PARSER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:10
source_atom_ids:
- atom-0034
external_atom_id: extrepo-20260703-0030
source_row_id: P1-TERMINAL-CHUNK-SPANNING-PARSER
priority: P1
finding_family: Terminal parser state spans arbitrary PTY reads
source_repos:
- tmux/tmux
target_docs:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Executor_Protocol.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Executor_Protocol.md
preserved_exact_tokens:
- extrepo-20260703-0030
- P1-TERMINAL-CHUNK-SPANNING-PARSER
- P1
- Terminal parser state spans arbitrary PTY reads
- tmux/tmux
negative_constraints: []
observed_signal: tmux DEC 2026 synchronized update bug leaked structural commands when begin/end pair spanned pane reads.
pm_current_coverage: PM has off-UI-thread PTY ingestion and ring-buffer projections.
pm_gap_or_delta: Add parser invariant and byte-boundary fuzz fixtures for OSC/DCS/CSI/bracketed paste/sync updates/hyperlinks/shell markers split at every byte boundary.
compile_disposition: create_new_planunit
```

### SMPFS-131 - P1-TERMINAL-A11Y-RANGE-MIRROR

```yaml
plan_unit_id: SMPFS-131
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-A11Y-RANGE-MIRROR (P1) is compiled as canonical Puppet Master intent for Terminal accessibility range mirror: Imported external-repo finding extrepo-20260703-0031 / P1-TERMINAL-A11Y-RANGE-MIRROR (P1). The preserved PM gap/delta is: Refine to visible-range, range-for-position, bounds-for-range, latest command region, redaction-aware projection; no full scrollback blob per query. The observed external-repo signal remains source-lineage evidence: Ghostty AXVisibleCharacterRange returned whole scrollback, making accessibility query take seconds; range-for-position/bounds APIs missing.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Accessibility visible range returns viewport, not full scrollback
- Position/bounds queries are O(viewport) and redaction-aware
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Accessibility visible range returns viewport, not full scrollback
- Position/bounds queries are O(viewport) and redaction-aware
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p1_terminal_a11y_range_mirror
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0035
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0035
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0031/P1-TERMINAL-A11Y-RANGE-MIRROR@line=31
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0031/P1-TERMINAL-A11Y-RANGE-MIRROR
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0035
external_atom_id: extrepo-20260703-0031
source_row_id: P1-TERMINAL-A11Y-RANGE-MIRROR
priority: P1
finding_family: Terminal accessibility range mirror
source_repos:
- ghostty-org/ghostty
target_docs:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0031
- P1-TERMINAL-A11Y-RANGE-MIRROR
- P1
- Terminal accessibility range mirror
- ghostty-org/ghostty
negative_constraints: []
observed_signal: Ghostty AXVisibleCharacterRange returned whole scrollback, making accessibility query take seconds; range-for-position/bounds APIs missing.
pm_current_coverage: Previous backlog recommended an accessibility mirror; PM has labels and GUI a11y principles.
pm_gap_or_delta: Refine to visible-range, range-for-position, bounds-for-range, latest command region, redaction-aware projection; no full scrollback blob per query.
compile_disposition: create_new_planunit
```

### SMPFS-132 - P1-TERMINAL-HOST-PROVENANCE-DOCTOR

```yaml
plan_unit_id: SMPFS-132
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-HOST-PROVENANCE-DOCTOR (P1) is compiled as canonical Puppet Master intent for Terminal host/mediator provenance and diagnostics: Imported external-repo finding extrepo-20260703-0032 / P1-TERMINAL-HOST-PROVENANCE-DOCTOR (P1). The preserved PM gap/delta is: Add TerminalHostProvenance: shell, PTY backend, ConPTY/OpenConsole/conhost version, tmux/mosh/ssh nesting, TERM/features, OSC52 clipboard path, degraded reason. The observed external-repo signal remains source-lineage evidence: Warp clipboard/OSC52 failures across SSH/tmux, ConPTY version breaking PowerShell, and Codex Windows sandbox helper issues show host layer diagnostics matter.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Doctor detects incompatible ConPTY pair
- OSC52 failure identifies local/remote/tmux/policy path
- Prompt markers degrade when tmux passthrough is unverified
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Doctor detects incompatible ConPTY pair
- OSC52 failure identifies local/remote/tmux/policy path
- Prompt markers degrade when tmux passthrough is unverified
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p1_terminal_host_provenance_doctor
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0036
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0036
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0032/P1-TERMINAL-HOST-PROVENANCE-DOCTOR@line=32
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0032/P1-TERMINAL-HOST-PROVENANCE-DOCTOR
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0036
external_atom_id: extrepo-20260703-0032
source_row_id: P1-TERMINAL-HOST-PROVENANCE-DOCTOR
priority: P1
finding_family: Terminal host/mediator provenance and diagnostics
source_repos:
- warpdotdev/warp
- tmux/tmux
- openai/codex
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0032
- P1-TERMINAL-HOST-PROVENANCE-DOCTOR
- P1
- Terminal host/mediator provenance and diagnostics
- warpdotdev/warp
- tmux/tmux
- openai/codex
negative_constraints: []
observed_signal: Warp clipboard/OSC52 failures across SSH/tmux, ConPTY version breaking PowerShell, and Codex Windows sandbox helper issues show host layer diagnostics matter.
pm_current_coverage: PM has terminal IDs/actions/restore outcomes.
pm_gap_or_delta: 'Add TerminalHostProvenance: shell, PTY backend, ConPTY/OpenConsole/conhost version, tmux/mosh/ssh nesting, TERM/features, OSC52 clipboard path, degraded reason.'
compile_disposition: create_new_planunit
```

### SMPFS-133 - P1-TERMINAL-PTY-STREAM-CONTRACT

```yaml
plan_unit_id: SMPFS-133
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-PTY-STREAM-CONTRACT (P1) is compiled as canonical Puppet Master intent for Separate PTY bytes, terminal parser state, scrollback, and model-visible excerpts: Terminal byte stream preserves parser state across chunks; scrollback is not model context; WebSocket, if used, is UI transport not terminal engine.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Terminal byte stream preserves parser state across chunks
- scrollback is not model context
- WebSocket, if used, is UI transport not terminal engine.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Terminal byte stream preserves parser state across chunks
- scrollback is not model context
- WebSocket, if used, is UI transport not terminal engine.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p1_terminal_pty_stream_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0054
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0054
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0050/P1-TERMINAL-PTY-STREAM-CONTRACT@line=50
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0050/P1-TERMINAL-PTY-STREAM-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0054
external_atom_id: extrepo-20260703-0050
source_row_id: P1-TERMINAL-PTY-STREAM-CONTRACT
priority: P1
finding_family: Separate PTY bytes, terminal parser state, scrollback, and model-visible excerpts
target_docs:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0050
- P1-TERMINAL-PTY-STREAM-CONTRACT
- P1
- Separate PTY bytes, terminal parser state, scrollback, and model-visible excerpts
negative_constraints: []
proposal_or_recommendation: Terminal byte stream preserves parser state across chunks; scrollback is not model context; WebSocket, if used, is UI transport not terminal engine.
compile_disposition: create_new_planunit
```

### SMPFS-134 - P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS

```yaml
plan_unit_id: SMPFS-134
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS (P1) is compiled as canonical Puppet Master intent for Terminal-bound agent output storms and UI safety: Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression. The preserved PM gap/delta is: PM should add agent-specific terminal storm controls: when the terminal runs Claude Code/Codex/OpenCode/etc., PM should know it is agentic output with special backpressure and semantic-marker needs. The observed external-repo signal remains source-lineage evidence: Warp reports TUI agent output/CPU/log floods; Ghostty reports memory leaks in long coding-agent terminal sessions; tmux prompt-marker handling shows semantic terminal metadata can be corrupted by middle layers.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Running a high-output TUI agent does not freeze GUI or explode logs.
- OSC 133/633 marker loss/degradation is visible.
- PM never interprets terminal agent text as PM-native tool receipt without adapter proof.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Running a high-output TUI agent does not freeze GUI or explode logs.
- OSC 133/633 marker loss/degradation is visible.
- PM never interprets terminal agent text as PM-native tool receipt without adapter proof.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: p1_terminal_agent_output_storm_controls
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0073
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0073
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0069/P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS@line=69
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0069/P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:15
source_atom_ids:
- atom-0073
external_atom_id: extrepo-20260703-0069
source_row_id: P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS
priority: P1
finding_family: Terminal-bound agent output storms and UI safety
source_repos:
- Warp
- Ghostty
- tmux
- Codex
target_docs:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
preserved_exact_tokens:
- extrepo-20260703-0069
- P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS
- P1
- Terminal-bound agent output storms and UI safety
- Warp
- Ghostty
- tmux
- Codex
negative_constraints: []
observed_signal: Warp reports TUI agent output/CPU/log floods; Ghostty reports memory leaks in long coding-agent terminal sessions; tmux prompt-marker handling shows semantic terminal metadata can be corrupted by middle layers.
pm_current_coverage: PM has terminal protocol, persistence, projection throttling, ring buffers, and output retention honesty.
pm_gap_or_delta: 'PM should add agent-specific terminal storm controls: when the terminal runs Claude Code/Codex/OpenCode/etc., PM should know it is agentic output with special backpressure and semantic-marker needs.'
proposal_or_recommendation: Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression.
compile_disposition: create_new_planunit
```

### SMPFS-135 - P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD

```yaml
plan_unit_id: SMPFS-135
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD (P1) is compiled as canonical Puppet Master intent for Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill: Imported external-repo finding extrepo-20260703-0081 / P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD (P1). The preserved PM gap/delta is: Paste safety and OSC52 were covered; OS autofill/OTP/pasteboard/file URL side channels were not called out enough. The observed external-repo signal remains source-lineage evidence: Ghostty 1.3.0 fixed control-character paste/drag command execution; 1.3.1 notes one-time-code inputs no longer appearing in terminal and mac pasteboard/file-url handling issues. | Warp continues to fix profile switcher input clearing, file links, and command confirmation/rejection crashes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Terminal paste/drop/autofill inputs pass through TerminalInputSanitizer with control-code stripping/escaping policy and user-visible preview for dangerous content.
- OTP/autofill/system pasteboard data is blocked from terminal echo/model context unless explicitly approved.
- File URL paste/drag opens are FileSafe checked and do not implicitly execute or read files.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Terminal paste/drop/autofill inputs pass through TerminalInputSanitizer with control-code stripping/escaping policy and user-visible preview for dangerous content.
- OTP/autofill/system pasteboard data is blocked from terminal echo/model context unless explicitly approved.
- File URL paste/drag opens are FileSafe checked and do not implicitly execute or read files.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_terminal_sensitive_os_channel_guard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0085
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0085
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0081/P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD@line=81
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0081/P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0085
external_atom_id: extrepo-20260703-0081
source_row_id: P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD
priority: P1
finding_family: 'Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill'
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- FinalGUISpec.md
- Permissions_System.md
- FileSafe.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- FinalGUISpec.md
- Permissions_System.md
- FileSafe.md
preserved_exact_tokens:
- extrepo-20260703-0081
- P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD
- P1
- 'Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill'
negative_constraints: []
observed_signal: Ghostty 1.3.0 fixed control-character paste/drag command execution; 1.3.1 notes one-time-code inputs no longer appearing in terminal and mac pasteboard/file-url handling issues. | Warp continues to fix profile switcher input clearing, file links, and command confirmation/rejection crashes.
pm_gap_or_delta: Paste safety and OSC52 were covered; OS autofill/OTP/pasteboard/file URL side channels were not called out enough.
relationship_to_prior_reports: Extends terminal paste/protocol safety.
compile_disposition: create_new_planunit
```

### SMPFS-136 - P1-TERMINAL-INPUT-PASTEBOARD-MATRIX

```yaml
plan_unit_id: SMPFS-136
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P1-TERMINAL-INPUT-PASTEBOARD-MATRIX (P1) is compiled as canonical Puppet Master intent for Terminal input, IME, Unicode, pasteboard matrix: Imported external-repo finding extrepo-20260703-0096 / P1-TERMINAL-INPUT-PASTEBOARD-MATRIX (P1). The preserved PM gap/delta is: Terminal tests need input-method and pasteboard channel policies in addition to ANSI/OSC parsing. The observed external-repo signal remains source-lineage evidence: IME candidate window positioning, key repeat/global keybind, macOS pasteboard URL priority, prompt viewport regressions.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- IME candidate follows cursor cell
- Plain text paste is preferred over URL/file flavors unless explicit
- clear/cls preserves visible prompt/viewport invariants
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- IME candidate follows cursor cell
- Plain text paste is preferred over URL/file flavors unless explicit
- clear/cls preserves visible prompt/viewport invariants
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_terminal_input_pasteboard_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0100
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0100
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0096/P1-TERMINAL-INPUT-PASTEBOARD-MATRIX@line=96
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0096/P1-TERMINAL-INPUT-PASTEBOARD-MATRIX
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0100
external_atom_id: extrepo-20260703-0096
source_row_id: P1-TERMINAL-INPUT-PASTEBOARD-MATRIX
priority: P1
finding_family: Terminal input, IME, Unicode, pasteboard matrix
source_repos:
- Pi
- Ghostty
- Warp
preserved_exact_tokens:
- extrepo-20260703-0096
- P1-TERMINAL-INPUT-PASTEBOARD-MATRIX
- P1
- Terminal input, IME, Unicode, pasteboard matrix
- Pi
- Ghostty
- Warp
negative_constraints: []
observed_signal: IME candidate window positioning, key repeat/global keybind, macOS pasteboard URL priority, prompt viewport regressions.
pm_gap_or_delta: Terminal tests need input-method and pasteboard channel policies in addition to ANSI/OSC parsing.
compile_disposition: create_new_planunit
```

### SMPFS-137 - SMPFS-137

```yaml
plan_unit_id: SMPFS-137
unit_type: constraint
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Terminal lessons from Ghostty, Warp, tmux, and CLI tools apply only to Puppet Master built-in GUI terminal/runtime contracts. They must not create a PM CLI product, make terminal the PM control plane, or mint pseudo-terminals outside terminal_session_id ownership.
gui_related: true
gui_classification_reason: Guardrail affects GUI/user-visible terminal/control surfaces.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0118 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: external_repo_guardrail
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: atom_0118
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0118
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0118
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/00_CODEX_LEDGER_IMPORT_PROMPT.md
source_atom_ids:
- atom-0118
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- Do not create a PM CLI product
- Do not make terminal the PM control plane
- terminal_session_id
- Terminal lessons are GUI-terminal only
negative_constraints:
- Do not create a PM CLI product.
- Do not make terminal the PM control plane.
- Do not mint pseudo-terminals outside terminal_session_id ownership.
compile_disposition: create_new_planunit
```
