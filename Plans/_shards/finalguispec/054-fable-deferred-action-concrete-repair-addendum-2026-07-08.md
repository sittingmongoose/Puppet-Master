# Shard 054: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FinalGUISpec.md`

Source lines: L27181-L27255

Source SHA256: `2ffdc9eb454f3c3bdda9d76c2c1e073e4bbb4e1cc401fd9eb91106f07301aeb5`

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

The five Activity Bar groups are:

1. `work`: Orchestrator, Run Graph, Planning Wizard.
2. `project`: File Manager, Search, Source Control.
3. `automation`: GitHub Actions, Docker Manager, Testing.
4. `communication`: Chat, Agents, Notifications.
5. `system`: Settings, Usage, Runtime Artifacts.

`Ctrl+1..8` binds to the first eight visible side-panel items in group order after policy and feature availability filtering. Hidden or unsupported items remain command-palette addressable but do not consume a shortcut slot.

### Settings Registry And Numbering Supersession

Repairs rows `sfk-66fc2872ed5f759cc6aaa0f5`, `sfk-832d3cce203e9e0009e0b90b`, and `sfk-affcf9f0d9b8260854b1bfc4`.

- The canonical Settings registry remains 19 tabs. Catalog, Sync, SSH, and Debug are not new tabs; they are subsections under Settings > Advanced or owner panels when surfaced.
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

Startup restore reads `hotreload_state.v1:{project_id}` and `onboarding_state.v1:{project_id}` as defined by `Plans/storage-plan.md`. The GUI treats missing keys as first-run defaults, corrupt keys as recoverable reset with a warning card, and compatibility aliases as migration inputs only.

### Terminal-Core Section Anchor

Repairs row `sfk-832d3cce203e9e0009e0b90b`.

The terminal-core architecture reference means the screen/buffer/diff-painting model: high-frequency render loop, dirty-region diffing, off-UI-thread PTY ingestion, bounded UI event delivery, and explicit session/pane identity. If a future section number changes, citations must use `terminal-core screen/buffer architecture` rather than a bare Section 15 number.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
