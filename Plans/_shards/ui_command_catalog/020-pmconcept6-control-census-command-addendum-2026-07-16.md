# Shard 020: PMConcept6 Control Census Command Addendum - 2026-07-16

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8317-L8505

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## PMConcept6 Control Census Command Addendum - 2026-07-16

This addendum registers the command rows required by the 300-row PMConcept6 interactive-control census and by owner docs that already name command families absent from this catalog. It compiles owner-doc obligations into UI_Command_Catalog ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal. Every command row below follows the section 2.0 command entry contract (`command_id`, `label`, `description`, `preconditions`, `command_kind`) and receives a production wiring row per Wiring_Matrix.md section 4.2. Concept controls remain source lineage only; `Concepts/pm6-build/**` defines no commands (Plans/usage-feature.md).

### Run Graph canvas interaction commands

Run-graph interaction commands adopt the ids named verbatim in `Plans/Run_Graph_View.md` (RGV-017 and the repair row at :1073) and `Plans/Orchestrator_Page.md` (:2324). Shared disabled reasons for this family are `graph_unloaded`, `modal_capture`, `read_only_layout`, `selection_locked`, and `permission_denied`; controls render disabled states with a reason rather than disappearing. All rows except `cmd.run_graph.drag_node` are view-projection interactions that never mutate run, node, or projection state; graph text search highlights matches in place and does not rewrite focused-run state except through an explicit route.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.run_graph.pan` | Pan Graph Canvas | Pans the Node Graph viewport by pointer drag without mutating run, node, or projection state. | `graph_loaded && !modal_capture` | `shell_view` |
| `cmd.run_graph.zoom` | Zoom Graph Canvas | Zooms in or out or fits the full graph to the viewport, updating the zoom percent chip. | `graph_loaded && !modal_capture` | `shell_view` |
| `cmd.run_graph.drag_node` | Drag Graph Node | Moves a node within the graph layout; requires editable layout mode. | `graph_loaded && editable_layout_mode` | `domain_action` |
| `cmd.run_graph.open_minimap_target` | Navigate Via Minimap | Moves the viewport to the minimap click or drag-scrub target. | `graph_loaded && !modal_capture` | `shell_view` |
| `cmd.run_graph.open_context_menu` | Open Graph Context Menu | Opens the node or canvas context menu listing route-consuming actions; opening mutates nothing. | `graph_loaded` | `shell_view` |
| `cmd.run_graph.keyboard_navigate` | Keyboard Navigate Graph | Moves node focus with Arrow, Home, and End keys with visible focus and pointer parity. | `graph_loaded && !modal_capture` | `shell_view` |
| `cmd.run_graph.set_selection` | Set Graph Selection | Selects or deselects graph nodes by click and multi-select; selection is view state. | `graph_loaded && !selection_locked` | `shell_view` |
| `cmd.run_graph.set_problems_filter` | Set Problems-Only Filter | Sets or clears the Problems only view filter (attention_required, blocked, degraded); off by default, resets on focused-run change, never persisted globally. | `graph_loaded` | `shell_view` |
| `cmd.run_graph.search` | Search Graph | Filters and highlights graph text matches in place, preserving full-graph context. | `graph_loaded` | `shell_view` |

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Contracts_V0.md

### Orchestrator projection-action and safe-point retry commands

`cmd.orchestrator.safe_point_retry` preserves the Orchestrator_Page.md/OP-033 UI identity while adopting the later Case L exact restore contract. It normalizes to `cmd.runtime.restore_safe_point_then_retry`; `cmd.orchestrator.restore_safe_point_then_retry` remains a compatibility alias for that same runtime command. Neither wrapper owns restore, retry, baseline, or attempt semantics. The seam and evidence commands register the Seams/Evidence subview toggles under the same convention as `cmd.orchestrator.switch_tab`: shell/view state reached through a stable command id.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.orchestrator.safe_point_retry` | Retry From Safe Point | Dispatches the modal-confirmed wrapper input `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point", permission_snapshot_id? }`. Admission validates optional permission evidence against current permission state, consumes it, and normalizes exactly to `cmd.runtime.restore_safe_point_then_retry` domain args. The four pre-modal availability reasons remain exactly `safe_point_missing`, `state_changed`, `permission_denied`, and `operation_in_progress`; post-resolution FileSafe/SCM refusal and recovery reasons remain distinct under the Case L command contract. | `allowed_action_id == restore_safe_point_then_retry && safe_point_available && state_current && permission_allowed && !operation_in_progress` | `domain_action` |
| `cmd.orchestrator.restore_safe_point_then_retry` | Restore Safe Point Then Retry | Compatibility alias accepting the same wrapper input as `cmd.orchestrator.safe_point_retry`, applying the identical permission-validation/consumption transform, and normalizing directly to `cmd.runtime.restore_safe_point_then_retry`; it has no independent handler, result, effect, admission, idempotency, or EventRecord producer. | `allowed_action_id == restore_safe_point_then_retry && safe_point_available && state_current && permission_allowed && !operation_in_progress` | `domain_action` |
| `cmd.orchestrator.copy_run_id` | Copy Run Id | Copies the focused run id to the clipboard; no persisted mutation. | `run_focused` | `shell_view` |
| `cmd.orchestrator.export_ledger` | Export Ledger JSON | Exports the visible filtered Ledger projection (active filters and sort) as JSON with `usage_event_ref` provenance per row; projection export only, no raw records, evidence payloads, or secrets. | `ledger_projection_visible` | `domain_action` |
| `cmd.orchestrator.set_seam_expansion` | Set Seam Expansion | Expands or collapses one seam (`scope: "one"`, `seam_id`) or all seams (`scope: "all"`); view-local, mutates no seam records. | `seams_view_visible` | `shell_view` |
| `cmd.orchestrator.set_evidence_filter` | Set Evidence Filter | Sets or clears (`node_id: null`) the Evidence tab node filter as view projection state. | `evidence_view_visible` | `shell_view` |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Contracts_V0.md

### Wizard and Plan Compile replay projection commands

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.planning_wizard.replay` | Replay Planning Flow | Rewinds the wizard view to its intake stage and replays the planning flow presentation view-locally; the live PlanningRun, ledger records, approvals, and any PlanCompileRun are unaffected, and exiting replay restores the live wizard state. | `planning_run_recorded` | `shell_view` |
| `cmd.plan_compile.replay` | Replay Compile Waves | Steps or plays the read-only replay of recorded compile waves; never re-executes compilation, never creates or rebinds a PlanCompileRun, and labels frames as historical replay. | `compile_waves_recorded` | `shell_view` |

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Orchestrator_Page.md

### Permissions settings command family

Adopted verbatim from `Plans/Permissions_System.md` (Permissions UI Commands And Error States; :8723-8724; AC-PM11). Settings route: `settings.permissions`. Directory picker dispatch name: `permissions.external_directory.pick`. Save dirty-state values: `clean`, `dirty`, `saving`, `saved`, `save_failed`, `conflict_refresh_required`. Rule mutations persist through the atomic TOML write contract with `loaded_config_hash` conflict detection.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.permissions.open` | Open Permissions Settings | Opens the `settings.permissions` route. | `settings_available` | `navigation_wrapper` |
| `cmd.permissions.create_global_rule` | Create Global Permission Rule | Persists a durable global approval rule with `{ tool_pattern, action, scope_key?, created_at, created_by_thread_id }`; survives restart and is revocable. | `permission_config_writable` | `domain_action` |
| `cmd.permissions.create_project_rule` | Create Project Permission Rule | Persists a durable project-scope approval rule with the same record fields and revocability. | `project_selected && permission_config_writable` | `domain_action` |
| `cmd.permissions.update_rule` | Update Permission Rule | Mutates an existing rule under the save dirty-state machine and atomic write rules. | `rule_exists && permission_config_writable` | `domain_action` |
| `cmd.permissions.reorder_rule` | Reorder Permission Rule | Moves a rule within its scope; validation errors are `rule_not_found`, `target_index_out_of_range`, and `scope_mismatch`. | `rule_exists && permission_config_writable` | `domain_action` |
| `cmd.permissions.delete_rule` | Delete Permission Rule | Removes a rule with atomic TOML persistence and write-conflict detection. | `rule_exists && permission_config_writable` | `domain_action` |
| `cmd.permissions.validate_rule` | Validate Permission Rule | Validates a rule draft and surfaces validation errors without persisting. | `rule_draft_present` | `domain_action` |
| `cmd.permissions.review_request` | Review Permission Request | Opens the canonical approval/settings path with `approval_scope_key` and `requesting_context`. | `approval_request_present` | `navigation_wrapper` |
| `cmd.permissions.revoke` | Revoke Durable Approval | Revokes a durable rule; requires `rule_id` or `approval_scope_key` plus scope. | `revocable_rule_exists` | `domain_action` |
| `cmd.permissions.pick_external_directory` | Pick External Directory | Opens the native directory picker and adds the chosen path; duplicate path error `external_directory_duplicate_path`, invalid glob error `external_directory_invalid_glob`. | `picker_available` | `domain_action` |

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

### Testing panel command rows

The first six ids are adopted verbatim from `Plans/Automated_Testing_System.md` (GUI Result Surfacing, :1871). Button states derive from `TestRunReceipt.status`: watch and cancel enable for `queued|running`, open receipt enables for any terminal state, export bundle enables when `log_artifact_refs[]` or `visual_artifact_refs[]` is non-empty. `cmd.testing.run` completes the family for the Testing side panel run entry point (F3-451); testing stays runtime-disabled until an adapter is configured, the capability probe returns available, the permission snapshot is current, and required fixtures exist. `cmd.testing.open_panel` is a `navigation_wrapper` that normalizes to the side-panel switch route with panel_id testing per the UCC-014 alias discipline.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.testing.open_panel` | Open Testing Panel | Opens the Testing side panel; normalizes to the panel-switch route with panel_id testing. | `panel_available` | `navigation_wrapper` |
| `cmd.testing.run` | Run Tests | Starts a test run through the canonical adapter execution path, producing a `TestAdapterInvocation` and a `TestRunReceipt`. | `adapter_configured && capability_probe_available && permission_snapshot_current && fixtures_present` | `domain_action` |
| `cmd.testing.watch_run` | Watch Test Run | Watches a queued or running test run; view/subscription only, never starts or completes tests. | `run_status_queued_or_running` | `domain_action` |
| `cmd.testing.cancel_run` | Cancel Test Run | Cancels a queued or running run; the outcome lands as `TestRunReceipt.status` `cancelled` and deletes no receipts. | `run_status_queued_or_running && permission_allowed` | `domain_action` |
| `cmd.testing.open_receipt` | Open Test Run Receipt | Opens the `TestRunReceipt` for a terminal-state run through the route/open contract. | `run_status_terminal` | `navigation_wrapper` |
| `cmd.testing.open_failure` | Open Test Failure | Opens a `failure_refs[]` entry detail through the route/open contract. | `failure_refs_present` | `navigation_wrapper` |
| `cmd.testing.export_bundle` | Export Test Bundle | Exports run logs and visual artifacts as a bundle per the record/bundle/view export taxonomy. | `log_or_visual_artifacts_present` | `domain_action` |

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/FinalGUISpec.md

### Terminal rule-4.2 coverage completion rows

`cmd.terminal.terminate_session`, `cmd.terminal.kill_session`, and `cmd.terminal.reattach_section` are adopted verbatim from the Wiring_Matrix.md terminal command table and WM-021 preserved tokens. `cmd.terminal.reveal` is minted here for the reveal action rule 4.2 requires by name, following the bare-verb precedent of `cmd.terminal.open` and `cmd.terminal.show`. These four rows close the rule-4.2 terminal coverage hole (reveal, terminate, kill, reattach); the remaining rule-4.2 verbs are already covered by cataloged rows (`show`, `rerun`, `split_pane`, `close_pane`, `clear_scrollback`, `restart_replace`, `detach`, `focus_session`).

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.terminal.reveal` | Reveal Terminal Session | Reveals the bottom panel and terminal tab and scrolls the target session into view without spawning a duplicate shell. | `session_exists` | `shell_view` |
| `cmd.terminal.terminate_session` | Terminate Terminal Session | Requests graceful shutdown for the selected live session; distinct from kill. | `session_live` | `domain_action` |
| `cmd.terminal.kill_session` | Kill Terminal Session | Forces termination for the selected live session; must not present the old session as still live. | `session_live` | `domain_action` |
| `cmd.terminal.reattach_section` | Reattach Terminal Section | Returns a detached terminal section to docked layout with preserved tab, pane, and session identity. | `section_detached` | `shell_view` |

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

### Account, provider route, and usage projection commands

`cmd.account.select_profile` is adopted verbatim from `Plans/Multi-Account.md` (:5088): per-action disabled reasons are `auth_missing`, `auth_expired`, `profile_locked`, `provider_unavailable`, and `policy_denied`; empty state copy id is `accounts.empty.no_profiles`; switches land in the append-only `account_switch_event` history (Plans/usage-feature.md:70). `cmd.provider.switch_route` is adopted verbatim from the FinalGUISpec.md CTA Card Contracts `rate_limit` row (`provider_id`, `retry_after_ms`). The usage commands start the `cmd.usage` production family for the surface `Plans/usage-feature.md` owns; exports follow the record/bundle/view taxonomy (:69) - view export output never becomes canonical record truth.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.account.select_profile` | Select Account Profile | Switches the effective account/profile; rows support click and keyboard activation. | `profile_available` | `domain_action` |
| `cmd.provider.switch_route` | Switch Provider Route | Accepts a provider re-route, preferring an alternate provider/plan until the quota window resets; carries `provider_id` and `retry_after_ms` context. | `alternate_route_available` | `domain_action` |
| `cmd.usage.export` | Export Usage Projection | Exports the current usage projection as JSON with `scope` `snapshot` or `ledger`; ledger scope preserves `usage_event_refs` per row. The Usage page head affordance is an icon-only button carrying `title` and `aria-label` accessible names per the GATE-010 icon-only rules; behavior unchanged. | `usage_projection_loaded` | `domain_action` |
| `cmd.usage.refresh` | Refresh Usage Projections | Re-reads usage projections from provider routes on demand; background refresh continues independently and the UI never blocks. The Usage page head affordance is an icon-only button carrying `title` and `aria-label` accessible names per the GATE-010 icon-only rules; behavior unchanged. | `provider_routes_configured` | `domain_action` |

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

### Browser pane navigation commands

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.browser.navigate` | Navigate Browser Pane | Navigates the embedded browser pane to a URL within the session-class policy; preserves session class and recovery identity. | `browser_session_active && navigation_allowed` | `domain_action` |
| `cmd.browser.reload` | Reload Browser Pane | Reloads the embedded browser pane. `cmd.gui_dev_preview.reload` is dev/test-build only and must not be reused for this production command. | `browser_session_active` | `domain_action` |

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FinalGUISpec.md

### Projects list lifecycle commands

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.project.archive` | Archive Project | Archives a project from the projects list; reversible, never a disk delete. | `project_listed` | `domain_action` |
| `cmd.project.remove` | Remove Project From List | Removes a project from the list without touching the working tree. | `project_listed` | `domain_action` |
| `cmd.project.refresh` | Refresh Projects List | Rescans and refreshes the projects list projection. | `projects_view_visible` | `domain_action` |
| `cmd.project.open_settings` | Open Project Settings | Opens the Project Settings Modal (F3-442) for a project through the route/open contract. | `project_listed` | `navigation_wrapper` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

### Chat composer selector, queue, thread, and web-operation commands

`cmd.chat.platform` registers the requested-platform selection owned by the assistant chat surface per ACD-437: applies-next-turn semantics over the account-bound Provider -> models registry; no status-bar chip exists for platform selection and the chat header re-introduces no standalone platform dropdown. `cmd.chat.plan_thoroughness` registers the Plan Thoroughness selector per ACD-035/ACD-438: enum Light, Balanced, Comprehensive, default Balanced, distinct from effort High/Medium/Low, recorded as `requested_plan_thoroughness` / `effective_plan_thoroughness`. The web-operation rows extend the `cmd.chat.web` family; approve/decline stay on `cmd.runtime.approve` / `cmd.runtime.decline` per the UCC-082 do-not-overfit boundary.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.chat.web.cancel` | Cancel Web Operation | Cancels an in-flight web operation (research/crawl/fetch card) by `web_operation_id`, preserving provenance. | `web_operation_in_flight` | `domain_action` |
| `cmd.chat.web.request_again` | Request Web Operation Again | Re-requests a declined or cancelled web operation with the same payload; re-entry passes through the approval gate and never bypasses it. | `web_operation_terminal` | `domain_action` |
| `cmd.chat.switch_thread` | Switch Chat Thread | Focuses an existing chat thread from the thread list by `thread_id`; no thread mutation. | `thread_exists` | `navigation_wrapper` |
| `cmd.chat.queue.remove` | Remove Queued Message | Removes a queued, not-yet-dispatched composer message from the send queue; dispatched messages are unaffected. | `queued_message_exists` | `domain_action` |
| `cmd.chat.platform` | Set Requested Platform | Sets the requested platform for the thread from the assistant chat surface; applies next turn. No status-bar chip and no standalone chat-header platform dropdown. | `platform_registry_loaded` | `domain_action` |
| `cmd.chat.plan_thoroughness` | Set Plan Thoroughness | Sets Plan Thoroughness (Light, Balanced, Comprehensive) for Plan and Deep Plan; applies next turn. | `plan_mode_selected` | `domain_action` |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Settings route and transaction commands

`Plans/Settings_System.md` SSYS-018 owns exactly five Settings semantic commands. Presentation actions and
bulk/reset/dismiss affordances must compose these typed route and transaction commands; they never mint a
second Settings mutation family.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.settings.open` | Open Settings Target | Opens the exact Settings setting or manager/detail target carried by `pm.settings_route_request.v1`, preserving the typed return contract and current context. The K3 host chooses the presentation; the command does not encode a bloom or other obsolete layout. | `settings_registry_loaded && route_target_current` | `navigation_wrapper` |
| `cmd.settings.transaction.preview` | Preview Settings Transaction | Validates and expands stable target IDs, requested values, owner routes, permissions, currentness, migration impact, and rollback eligibility without committing. | `settings_snapshot_current && target_set_nonempty` | `domain_action` |
| `cmd.settings.transaction.apply` | Apply Settings Transaction | Applies exactly one current preview under revision/CAS and idempotency guards, performs owner readback, and returns a typed committed/refused/failed/rollback-required result. | `preview_current && permission_allowed && owner_routes_available` | `domain_action` |
| `cmd.settings.transaction.rollback` | Roll Back Settings Transaction | Restores an eligible committed transaction from its exact rollback snapshot and verifies owner readback; it never invents rollback where none was created. | `rollback_snapshot_current && rollback_allowed` | `domain_action` |
| `cmd.settings.export` | Export Settings | Exports the selected non-secret Settings snapshot and explicit exclusions through `pm.settings_export_request.v1`; credentials and protected session material never enter the manifest. | `settings_snapshot_current && export_destination_allowed` | `domain_action` |

Historical `cmd.settings.open_notifications`, `cmd.settings.category.reset`, and
`cmd.settings.suggestion.dismiss` spellings are retired, non-alias local-affordance lineage. Opening the
Notifications destination emits `cmd.settings.open` with the Settings-owned typed target. Category reset
and suggestion dismissal each compose `cmd.settings.transaction.preview` followed by
`cmd.settings.transaction.apply`; neither bypasses the preview/currentness/confirmation/readback contract.
The three historical spellings receive no primary handler, production-wiring row, or alias.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, SchemaID:pm.settings_system.contracts.v1, ContractName:Plans/FinalGUISpec.md

### Docker container start and Unraid template commands

`cmd.docker.container.start` completes the reserved `cmd.docker.container.*` lifecycle subfamily beside `stop` and `restart`. The template rows register the Unraid template flows the 2.5A operational coverage text names (`/auth/template`, `/publish/template`); template publish is gated by the `domain.image_publish` permission class, which is never implied by local build approval.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.docker.container.start` | Start Container | Starts a stopped container by `container_ref`; distinct from `cmd.docker.run`, which creates a container from an image. | `container_stopped && capability_snapshot_current` | `domain_action` |
| `cmd.docker.template.commit` | Commit Unraid Template | Commits Unraid template changes to the template repository with template identity and receipt evidence. | `template_dirty && capability_snapshot_current` | `domain_action` |
| `cmd.docker.template.push` | Push Unraid Template | Publishes the Unraid template; requires the `domain.image_publish` permission class. | `template_committed && permission_allowed` | `domain_action` |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md

### Forge review commands and Source Control compatibility inputs

Panel review actions consume the common Forge owner with exact SCM/forge context (provider, repository, workspace/revision, compare target, baseline, run/attempt lineage). The historical Source Control PR spellings normalize before availability, permission, telemetry, receipt, and dispatch; they never own a second review handler. Thread-bound `cmd.chat.worktree.pr` / `cmd.chat.worktree.merge` remain separate assistant-thread wrappers.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.forge.review.create` | Create Review | Creates a provider-discriminated review through the Forge owner with repository, source workspace/revision, target revision, compare payload, and exact return route. | `forge_capability_current && auth_valid && repository_current` | `domain_action` |
| `cmd.forge.review.merge` | Merge Review | Merges the selected provider review through the Forge owner; protected-branch mutation routes the applicable destructive-remote permission class. | `review_open && merge_allowed && auth_valid` | `domain_action` |

Compatibility inputs: `cmd.source_control.pr.create` normalizes to `cmd.forge.review.create {provider: github}` and `cmd.source_control.pr.merge` normalizes to `cmd.forge.review.merge {provider: github}`. Neither compatibility spelling receives a primary catalog or production-wiring row.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md
