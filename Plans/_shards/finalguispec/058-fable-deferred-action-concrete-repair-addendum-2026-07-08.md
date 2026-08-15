# Shard 058: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FinalGUISpec.md`

Source lines: L28895-L28970

Source SHA256: `ac1b5d4e14ca7f69b72f955f18e9dd90a8c469aa93212dffc5a524dfaade9523`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical GUI spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### CTA Card Contracts

Repairs row `sfk-cae1da5c6109a0d306d04dd9`.

All CTA cards share fields `card_id`, `card_kind`, `severity`, `title`, `body`, `primary_action_id`, `secondary_action_ids[]`, `dismissible`, `owner_route`, `blocked_reason_code?`, and `created_at_utc`.

| card_kind | Required primary action | Secondary actions | Required fields |
| --- | --- | --- | --- |
| `hitl_approval` | `cmd.runtime.approve` | `cmd.runtime.decline`, `cmd.runtime.view_details` | `approval_scope_key`, `permission_snapshot_id` |
| `run_interrupted` | `cmd.run.resume` | `cmd.run.view_log`, `cmd.run.stop` | `run_id`, `interruption_reason_code` |
| `rate_limit` | `cmd.provider.retry_after` | `cmd.provider.switch_route`, `cmd.usage.view_budget` | `provider_id`, `retry_after_ms` |
| `warning` | `cmd.warning.acknowledge` | `cmd.warning.open_owner` | `warning_code`, `owner_doc_ref` |
| `wizard_attention_required` | `cmd.planning_wizard.open_topic` | `cmd.planning_wizard.defer` | `planning_run_id`, `topic_card_id` |

CTA cards must never rely on generic "function identically" prose without the row-specific fields above.

### Activity Bar Groups And Shortcut Binding

Repairs row `sfk-94c4451c654561bebe80cef7`.

The four Activity Bar groups are:

1. `project`: File Manager, Search, Source Control.
2. `automation`: GitHub Actions, Docker Manager, Testing.
3. `communication`: Chat, Agents.
4. `system`: Runtime Artifacts.

PMConcept7 trim (2026-07-23): the former `work` group (Orchestrator, Run Graph, Planning Wizard) is removed in full, Notifications is removed from `communication`, and Settings and Usage are removed from `system`. The removed pages stay reachable through the title-bar page tabs, and the alerts affordance is the title-bar notification stack and count badge (F3-460, F3-461), not an activity-bar shortcut.

`Ctrl+1..8` binds to the first eight visible side-panel items in group order after policy and feature availability filtering. Hidden or unsupported items remain command-palette addressable but do not consume a shortcut slot. The binding mechanics are unchanged by the PMConcept7 trim; the shortcuts simply resolve over the remaining visible items (F3-419 mechanics unchanged).

### Settings Registry And Numbering Supersession

Repairs rows `sfk-66fc2872ed5f759cc6aaa0f5`, `sfk-832d3cce203e9e0009e0b90b`, and `sfk-affcf9f0d9b8260854b1bfc4`.

- The former 19-entry Settings table remains owner-routing and migration lineage only. F3-432 owns the search-first visible surface; Catalog, Sync, SSH, and Debug route to their named subsections or owner panels rather than becoming new tabs.
- `Settings > Terminal` is owned by the terminal settings subsection; `Agent Config Skills` is owned by Agent Config and Skills owner docs.
- The duplicate promoted-widget `## 15` heading is superseded by the named promoted-widget addendum anchor. Any "Section 15 terminal-core architecture" reference resolves to the terminal-core screen/buffer section, not the promoted-widget catalog.
- New citations must use explicit heading names instead of bare `§7.4` or `§15` when more than one migration-era alias exists.

### Slint Host File Inventory

Repairs row `sfk-4c6ed162c01a11a1649fac43`.

Required Slint host files:

| Surface | Host file |
| --- | --- |
| Orchestrator seven-tab page | `ui/orchestrator/orchestrator_page.slint` |
| Docker/Hosts | `ui/docker/docker_hosts_view.slint` |
| Source Control | `ui/source_control/source_control_panel.slint` |
| GitHub Actions | `ui/github_actions/github_actions_panel.slint` |
| Docker Manager | `ui/docker/docker_manager_panel.slint` |
| Artifacts | `ui/artifacts/artifacts_panel.slint` |
| Search | `ui/search/search_panel.slint` |
| Run & Debug | `ui/run_debug/run_debug_panel.slint` |

These paths are planned GUI host locations only. They do not create implementation files or authorize a source tree.

### Startup Restore GUI State

Repairs row `sfk-047b362fce3b487a9bce5d6b`.

Startup restore reads `hotreload_state.v1:{project_id}` and `onboarding_state.v1:{project_id}` as defined by `Plans/storage-plan.md`. These two registered `resettable_ui_state` families may use defaults when missing; corrupt/incompatible bytes are secured in quarantine before reset and the warning card names the affected family. `editor_workspace_state.v1:{project_id}` and per-file `editor_state.v1:{project_id}:{file_path_hash}` are instead canonical non-rebuildable families: missing/corrupt/incompatible state attempts mandatory-backup recovery and discloses credible loss rather than showing a false first-run, empty project, or silent default. `editor_state:v1:{project_id}`, `hotreload_state:v1:{project_id}`, and `onboarding:v1` are read-only `StorageMigrationCoordinator` inputs only, and the global onboarding alias may copy forward only to an unambiguous project.

### Terminal-Core Section Anchor

Repairs row `sfk-832d3cce203e9e0009e0b90b`.

The terminal-core architecture reference means the screen/buffer/diff-painting model: high-frequency render loop, dirty-region diffing, off-UI-thread PTY ingestion, bounded UI event delivery, and explicit session/pane identity. If a future section number changes, citations must use `terminal-core screen/buffer architecture` rather than a bare Section 15 number.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
