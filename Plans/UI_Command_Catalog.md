# UI Command Catalog (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- UI COMMAND SSOT

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This file is the SSOT list of stable UI command IDs.
Command IDs are referenced by plans and tests; implementations MUST treat these IDs as stable.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

## 1. Naming rules
- IDs MUST be lowercase and dot-separated.
- Prefix MUST be `cmd.`.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

## 2. Canonical command IDs
### 2.0A Promoted Section 15 command families

The command catalog MUST include stable IDs for the following families:
ContractRef: UICommand:cmd.project.switch_active_tab, UICommand:cmd.project.open_in_new_workspace_tab, UICommand:cmd.workspace_tab.create, UICommand:cmd.workspace_tab.close, UICommand:cmd.chat.open_thread_usage, UICommand:cmd.browser.share_with_agent, UICommand:cmd.browser.revoke_share_with_agent, UICommand:cmd.dev.start_session, UICommand:cmd.dev.stop_session, UICommand:cmd.catalog.install_item, UICommand:cmd.catalog.update_item, UICommand:cmd.catalog.remove_item, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md
- project switching and project open-in-new-workspace-tab
- workspace tab create/close/reopen/move/focus
- detached window open/reattach/close for supported surfaces
- branch-from-restore and branch-open
- thread Usage activation
- browser open/focus/detach/share-with-agent/revoke-share
- dev session start/stop/restart/show-output/show-ports
- catalog install/update/remove/enable/disable/apply-later

These IDs are canonical runtime commands, not informal action labels.

### 2.0 Command entry contract (doc-level)
Every command listed below MUST define:
- **Args schema (keys only)** — the `args` keys expected by the command handler
- **Expected events** — stable event types emitted as a result of the command
- **Affected surfaces** — which screens/panels are impacted (layout can change; command IDs do not)
- **UI-only clarification** — commands that only mutate local UI view state may declare `no persisted domain event`

ContractRef: ContractName:Contracts_V0.md#UICommand, ContractName:Contracts_V0.md#EventRecord

### 2.0.1 Acceptance hooks contract (wiring verification)
Every command listed in this catalog MUST be verifiable through the wiring matrix (`Plans/Wiring_Matrix.md`, schema: `Plans/Wiring_Matrix.schema.json`). Specifically:

1. **Handler registration**: The command MUST have a registered handler in the UI Command Dispatcher. The handler's module/function location MUST be recorded in the wiring matrix.
2. **Event emission verification**: If the command declares expected events (non-empty `expected_event_types`), a test MUST exist that dispatches the command and asserts the expected events are emitted.
3. **UI element binding**: At least one UI element MUST be bound to the command in the wiring matrix, with its `ui_location` matching an actual GUI surface.
4. **Acceptance checks**: Each wiring matrix entry MUST include at least one testable `acceptance_checks` assertion.

Commands that declare `no persisted domain event` are still subject to handler registration and UI element binding checks; they are exempt only from event emission tests.

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010, Invariant:INV-011, Invariant:INV-012

### 2.1 GitHub auth (GitHub HTTPS API only)

#### `cmd.github.connect`
Start GitHub OAuth device-code flow.

- **Args schema:** `{}` (no args; host/scope are locked by Spec Lock).  
  ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, SchemaID:Spec_Lock.json#locked_decisions.auth_model
- **Expected events:** `auth.github.device_code.issued`, `auth.github.token.polling`, terminal: `auth.github.authenticated` or `auth.github.failed`.  
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md
- **Affected surfaces:** Settings > GitHub/Auth, Setup flow, Dashboard auth status.

ContractRef: UICommand:cmd.github.connect

#### `cmd.github.disconnect`
Disconnect and delete token (credential store).

- **Args schema:** `{}`  
  ContractRef: ContractName:Contracts_V0.md#AuthState
- **Expected events:** `auth.github.disconnected`.  
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md
- **Affected surfaces:** Settings > GitHub/Auth, Dashboard auth status.

ContractRef: UICommand:cmd.github.disconnect

ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect

---

### 2.1A Project management / deferred wizard commands
These IDs are required by `Plans/GitHub_Integration.md` section D and `Plans/chain-wizard-flexibility.md` section 13.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.project.add_existing` | `{ path?, ssh_remote_id?, ssh_path? }` | `project.added` | File menu, Dashboard, Add Existing Project flow |
| `cmd.project.new_local` | `{ name, parent_path, init_git?, preset? }` | `project.created` | File menu, Dashboard, New Local Project flow |
| `cmd.project.new_github_repo` | `{ name, description?, private, visibility?, gitignore_template?, license?, local_clone_path }` | `project.created`, `git.clone.completed` | File menu, Dashboard, New GitHub Repo flow |
| `cmd.project.open` | `{ project_id }` | no persisted domain event (navigation) | File Manager, Dashboard, project finish screens |
| `cmd.project.chain_wizard_open_deferred` | `{ project_id, wizard_id, default_intent, project_path, remote_repo_ref?, deferred_wizard_payload_ref? }` | `wizard.opened`, `wizard.deferred_payload.loaded` | Project finish screens, Dashboard, Chain Wizard |

ContractRef: ContractName:Plans/GitHub_Integration.md#d-project-management-flows-no-chain-wizard-required, ContractName:Plans/chain-wizard-flexibility.md

---

### 2.2 LSP (minimum required)
These IDs are required by `Plans/LSPSupport.md`.

**Common args schema (keys only):**
- `path` (string)
- `position` (object): `{ line: number, character: number }` (0-based)

ContractRef: ContractName:Plans/Tools.md

**Expected events (minimum):**
- `tool.invoked` (tool_name = `lsp`) or `tool.denied` (if policy blocks).  
  ContractRef: ContractName:Contracts_V0.md

**Affected surfaces (minimum):** File editor, Problems panel, Chat (when LSP-in-chat is enabled).

#### Command IDs
- `cmd.lsp.goto_definition` — args: `{ path, position }`
- `cmd.lsp.find_references` — args: `{ path, position }`
- `cmd.lsp.rename_symbol` — args: `{ path, position, new_name }`
- `cmd.lsp.format_document` — args: `{ path }`
- `cmd.lsp.format_selection` — args: `{ path, range }`
- `cmd.lsp.code_action` — args: `{ path, range }`
- `cmd.lsp.goto_symbol` — args: `{ query }`
- `cmd.lsp.open_problems` — args: `{}`
- `cmd.lsp.restart_server` — args: `{ server_id? }`

ContractRef: Plans/LSPSupport.md#13

---

### 2.3 Widget layout commands
These IDs are required by `Plans/Widget_System.md`.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.widget.add` | `{ page, widget_id }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.remove` | `{ page, instance_id }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.resize` | `{ page, instance_id, col_span, row_span }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.configure` | `{ page, instance_id, config }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.move` | `{ page, instance_id, col, row }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.reset_layout` | `{ page }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |

ContractRef: ContractName:Plans/Widget_System.md#11, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.4 Run Graph commands
These IDs are required by `Plans/Run_Graph_View.md`.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.graph.select_node` | `{ node_id }` | no persisted domain event (selection state update) | Orchestrator > Node Graph Display |
| `cmd.graph.deselect` | `{}` | no persisted domain event (selection state update) | Orchestrator > Node Graph Display |
| `cmd.graph.zoom` | `{ level }` | no persisted domain event (viewport state update) | Orchestrator > Node Graph Display |
| `cmd.graph.fit_to_screen` | `{}` | no persisted domain event (viewport state update) | Orchestrator > Node Graph Display |
| `cmd.graph.layout_preset` | `{ preset }` | no persisted domain event (layout state update) | Orchestrator > Node Graph Display |
| `cmd.graph.focus_node` | `{ node_id }` | no persisted domain event (viewport state update) | Orchestrator > Node Graph Display |
| `cmd.graph.filter` | `{ states, search }` | no persisted domain event (filter state update) | Orchestrator > Node Graph Display |
| `cmd.graph.retry_node` | `{ node_id }` | `tool.invoked` or `tool.denied`; run-state events emitted by orchestrator | Orchestrator > Node Graph Display |
| `cmd.graph.replan_node` | `{ node_id }` | `tool.invoked` or `tool.denied`; run-state events emitted by orchestrator | Orchestrator > Node Graph Display |
| `cmd.graph.reopen_node` | `{ node_id }` | run-state events emitted by orchestrator | Orchestrator > Node Graph Display |
| `cmd.graph.approve_hitl` | `{ request_id, node_id, rationale }` | `hitl.approved` | Orchestrator > Node Graph Display |
| `cmd.graph.deny_hitl` | `{ request_id, node_id, rationale, resolution? }` | `hitl.rejected` | Orchestrator > Node Graph Display |

ContractRef: ContractName:Plans/Run_Graph_View.md#17, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.5 Orchestrator page commands
#### 2.5A Source Control commands

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.source_control.switch_subview` | `{ subview }` | layout/UI state only | Source Control |
| `cmd.source_control.select_repo` | `{ repo_id }` | layout/UI state only | Source Control |
| `cmd.source_control.select_worktree` | `{ worktree_id }` | layout/UI state only | Source Control, Orchestrator |
| `cmd.source_control.open_history_commit` | `{ repo_id, commit }` | layout/UI state only | Source Control |
| `cmd.source_control.open_graph_commit` | `{ repo_id, commit }` | layout/UI state only | Source Control |
| `cmd.source_control.compare_refs` | `{ repo_id, left_ref, right_ref, worktree_id? }` | layout/UI state only | Source Control |
| `cmd.source_control.resolve_conflict` | `{ repo_id, path, worktree_id? }` | no persisted domain event (navigation/open action) | Source Control, File Editor |
| `cmd.git.worktree.open` | `{ worktree_id }` | no persisted domain event (navigation/open action) | Source Control |
| `cmd.git.worktree.compare` | `{ worktree_id, compare_target? }` | layout/UI state only | Source Control |
| `cmd.git.worktree.recover` | `{ worktree_id }` | `tool.invoked` or `tool.denied`; runtime events emitted by orchestrator/worktree manager | Source Control, Orchestrator |
| `cmd.git.worktree.prune` | `{ worktree_id }` | `tool.invoked` or `tool.denied`; runtime events emitted by orchestrator/worktree manager | Source Control |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

#### 2.5B GitHub Actions commands

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.github.actions.switch_subview` | `{ subview }` | layout/UI state only | GitHub Actions |
| `cmd.github.actions.focus_current_branch` | `{ repo_id, branch, worktree_id? }` | layout/UI state only | GitHub Actions |
| `cmd.github.actions.refresh` | `{ repo_id, scope? }` | no persisted domain event (API fetch + cache) | GitHub Actions |
| `cmd.github.actions.rerun` | `{ workflow_run_id }` | `github.actions.rerun.started`, terminal: `github.actions.rerun.completed` or `github.actions.rerun.failed` or `github.actions.rerun.blocked` | GitHub Actions |
| `cmd.github.actions.cancel` | `{ workflow_run_id }` | `github.actions.cancel.started`, terminal: `github.actions.cancel.completed` or `github.actions.cancel.failed` or `github.actions.cancel.blocked` | GitHub Actions |
| `cmd.github.actions.pin_workflow` | `{ workflow_id, pinned }` | layout/UI state only | GitHub Actions |
| `cmd.github.actions.dispatch` | `{ workflow_id, ref, inputs? }` | `github.actions.dispatch.started`, terminal: `github.actions.dispatch.completed` or `github.actions.dispatch.failed` or `github.actions.dispatch.blocked` | GitHub Actions |
| `cmd.github.actions.upsert_secret` | `{ scope, name, value, environment? }` | `github.actions.secret.updated` or `github.actions.secret.update_failed` or `github.actions.secret.update.blocked` | GitHub Actions |
| `cmd.github.actions.delete_secret` | `{ scope, name, environment? }` | `github.actions.secret.deleted` or `github.actions.secret.delete_failed` | GitHub Actions |
| `cmd.github.actions.upsert_variable` | `{ scope, name, value, environment? }` | `github.actions.variable.updated` or `github.actions.variable.update_failed` or `github.actions.variable.update.blocked` | GitHub Actions |
| `cmd.github.actions.delete_variable` | `{ scope, name, environment? }` | `github.actions.variable.deleted` or `github.actions.variable.delete_failed` | GitHub Actions |
| `cmd.github.actions.upsert_environment` | `{ name, protection_rules?, reviewers? }` | `github.actions.environment.updated` or `github.actions.environment.update_failed` or `github.actions.environment.update.blocked` | GitHub Actions |
| `cmd.github.actions.delete_environment` | `{ name }` | `github.actions.environment.deleted` or `github.actions.environment.delete_failed` | GitHub Actions |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

#### 2.5C Docker Manager commands

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.docker_manager.switch_subview` | `{ subview }` | layout/UI state only | Docker Manager |
| `cmd.docker.container.open` | `{ container_id }` | layout/UI state only | Docker Manager |
| `cmd.docker.container.start` | `{ container_id }` | `docker.container.started` or `docker.container.start_failed` | Docker Manager |
| `cmd.docker.container.stop` | `{ container_id }` | `docker.container.stopped` or `docker.container.stop_failed` | Docker Manager |
| `cmd.docker.container.restart` | `{ container_id }` | `docker.container.restarted` or `docker.container.restart_failed` | Docker Manager |
| `cmd.docker.container.remove` | `{ container_id, force? }` | `docker.container.removed` or `docker.container.remove_failed` or `docker.container.remove.blocked` | Docker Manager |
| `cmd.docker.container.logs` | `{ container_id, follow? }` | no persisted domain event (log open/follow) | Docker Manager, Orchestrator |
| `cmd.docker.container.inspect` | `{ container_id }` | layout/UI state only | Docker Manager |
| `cmd.docker.image.pull` | `{ registry?, namespace?, repository, tag? }` | `docker.image.pull.started`, terminal: `docker.image.pull.completed` or `docker.image.pull.failed` | Docker Manager |
| `cmd.docker.image.push` | `{ image_ref }` | `docker.publish.started`, terminal: `docker.publish.completed` or `docker.publish.failed` or `docker.publish.blocked` | Docker Manager |
| `cmd.docker.image.tag` | `{ source_ref, target_ref }` | `docker.image.tagged` or `docker.image.tag_failed` | Docker Manager |
| `cmd.docker.image.remove` | `{ image_ref, force? }` | `docker.image.removed` or `docker.image.remove_failed` or `docker.image.remove.blocked` | Docker Manager |
| `cmd.docker.compose.up` | `{ project_id, profile?, services? }` | `docker.compose.started` or `docker.compose.failed` | Docker Manager |
| `cmd.docker.compose.down` | `{ project_id, remove_orphans? }` | `docker.compose.stopped` or `docker.compose.stop_failed` | Docker Manager |
| `cmd.docker.compose.logs` | `{ project_id, services?, follow? }` | no persisted domain event (log open/follow) | Docker Manager |
| `cmd.docker.bake.run` | `{ target?, file? }` | `docker.bake.started`, terminal: `docker.bake.completed` or `docker.bake.failed` | Docker Manager |
| `cmd.docker.k8s.apply` | `{ context, namespace, manifest_ref }` | `docker.k8s.apply.started`, terminal: `docker.k8s.apply.completed` or `docker.k8s.apply.failed` or `docker.k8s.apply.blocked` | Docker Manager |
| `cmd.docker.k8s.rollout_status` | `{ context, namespace, workload_ref }` | no persisted domain event (status fetch) | Docker Manager |
| `cmd.docker.k8s.logs` | `{ context, namespace, workload_ref, follow? }` | no persisted domain event (log open/follow) | Docker Manager |
| `cmd.docker.k8s.exec` | `{ context, namespace, workload_ref, container?, command? }` | `docker.k8s.exec.started`, terminal: `docker.k8s.exec.completed` or `docker.k8s.exec.failed` or `docker.k8s.exec.blocked` | Docker Manager |
| `cmd.docker.k8s.port_forward` | `{ context, namespace, workload_ref, local_port, remote_port }` | `docker.k8s.port_forward.started`, terminal: `docker.k8s.port_forward.stopped` or `docker.k8s.port_forward.failed` | Docker Manager |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md, ContractName:Plans/Permissions_System.md

### 2.6 Chat context usage commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Chat header context indicator + thread Usage surface |
| `cmd.chat.open_thread_usage` | `{ thread_id }` | layout/UI state only | Chat header context indicator + thread Usage surface |
| `cmd.chat.focus_thread_usage` | `{ thread_id }` | layout/UI state only | Chat side panel / thread Usage surface |
| `cmd.chat.close_thread_usage` | `{ thread_id }` | layout/UI state only | Chat side panel / thread Usage surface |

`cmd.chat.open_usage_popout` and `cmd.chat.close_usage_popout` are superseded and MUST NOT remain canonical IDs.
ContractRef: UICommand:cmd.chat.open_thread_usage, UICommand:cmd.chat.focus_thread_usage, UICommand:cmd.chat.close_thread_usage, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md
### 2.6A Render / browser preview commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.browser.open_workspace_preview` | `{ project_id, target, workspace_tab_id }` | layout/UI state only | File preview, Browser tab, Ports |
| `cmd.browser.open_detached_preview` | `{ project_id, target, source_workspace_tab_id }` | layout/UI state only | File preview, Browser tab |
| `cmd.browser.focus_browser_tab` | `{ browser_tab_id }` | layout/UI state only | Browser surface |
| `cmd.browser.detach_browser_tab` | `{ browser_tab_id }` | layout/UI state only | Browser surface |
| `cmd.browser.share_with_agent` | `{ browser_tab_id, thread_id }` | `browser.context_shared` | Browser chrome, Assistant chat |
| `cmd.browser.revoke_share_with_agent` | `{ browser_tab_id, thread_id? }` | `browser.context_share_revoked` | Browser chrome, attention surfaces |
| `cmd.dev.start_session` | `{ project_id, workspace_tab_id, mode, target? }` | `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.stop_session` | `{ dev_session_id }` | `dev.session.stopping`, `dev.session.stopped` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.restart_session` | `{ dev_session_id }` | `dev.session.restarting`, `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.catalog.install_item` | `{ item_type, item_id, version? }` | `catalog.install.started`, `catalog.install.completed` | Catalog |
| `cmd.catalog.update_item` | `{ item_type, item_id, target_version? }` | `catalog.update.started`, `catalog.update.completed` | Catalog |
| `cmd.catalog.remove_item` | `{ item_type, item_id }` | `catalog.remove.started`, `catalog.remove.completed` | Catalog |
### 2.7 Chat slash commands (reserved)

Reserved Assistant Chat slash commands use stable canonical UI command IDs.

| Canonical UI command ID | Slash syntax | Payload | Primary outcome | Surface |
|---|---|---|---|---|
| `cmd.chat.new` | `/new` | `{}` | `chat.thread.created` | Assistant chat |
| `cmd.chat.model` | `/model` | `{ model_id }` | session model state update | Assistant chat |
| `cmd.chat.effort` | `/effort` | `{ level }` | session effort state update | Assistant chat |
| `cmd.chat.mode` | `/mode` | `{ mode }` | session mode state update | Assistant chat |
| `cmd.chat.export` | `/export` | `{ format? }` | `chat.thread.exported` | Assistant chat |
| `cmd.chat.compact_context` | `/compact` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Assistant chat |
| `cmd.chat.stop` | `/stop` | `{ thread_id? }` | stream stop / run stop behavior | Assistant chat |
| `cmd.chat.resume` | `/resume` | `{ thread_id? }` | runtime recovery or resume action | Assistant chat |
| `cmd.chat.rewind` | `/rewind` | `{ thread_id, target_message_id? }` | thread rewind UI / runtime action | Assistant chat |
| `cmd.chat.revert` | `/revert` | `{ thread_id, target_message_id? }` | restore/revert workflow | Assistant chat |
| `cmd.chat.share` | `/share` | `{ thread_id, format? }` | share/export flow | Assistant chat |
| `cmd.chat.settings` | `/settings` | `{}` | navigation only | Settings panel |
| `cmd.chat.doctor` | `/doctor` | `{}` | `doctor.run.started` | Doctor page |
| `cmd.chat.help` | `/help` | `{}` | UI help display | Assistant chat |
| `cmd.chat.web.search` | `/web search` | `{ query }` | web search activity | Assistant chat |
| `cmd.chat.web.extract` | `/web extract` | `{ url }` | site extraction activity | Assistant chat |
| `cmd.chat.web.research` | `/web research` | `{ task }` | research activity | Assistant chat |
| `cmd.chat.web.crawl` | `/web crawl` | `{ url }` | crawl activity | Assistant chat |
| `cmd.chat.web.map` | `/web map` | `{ url }` | map activity | Assistant chat |
| `cmd.chat.skill.invoke` | `/skill` | `{ skill_ref, arguments? }` | skill invocation/load | Assistant chat |

Rules:
- `/cancel` is an alias path to `cmd.chat.stop`; it does not own a separate canonical command ID.
- `/clear` is not part of the canonical reserved Assistant Chat command set.
- Reserved slash commands MUST remain aligned with `Plans/assistant-chat-design.md` and MUST NOT be treated as user-overridable commands.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md

### 2.8 Assistant memory (Gist Review) commands
These IDs are required by `Plans/assistant-memory-subsystem.md` sections 5 and 7.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.memory.verify` | `{ project_id, gist_id }` | `memory.gist.verification_requested`, `memory.gist.verified` or `memory.gist.verification_failed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.edit` | `{ project_id, gist_id, patch }` | `memory.gist.updated` | Assistant chat Gist Review panel |
| `cmd.chat.memory.pin` | `{ project_id, gist_id, pinned }` | `memory.gist.pinned` or `memory.gist.unpinned` | Assistant chat Gist Review panel |
| `cmd.chat.memory.discard` | `{ project_id, gist_id }` | `memory.gist.discarded` | Assistant chat Gist Review panel |
| `cmd.chat.memory.toggle_auto_save_unverified` | `{ project_id, enabled }` | `settings.updated` | Assistant chat Gist Review panel |
| `cmd.chat.memory.preview_capsule` | `{ project_id, thread_id? }` | no persisted domain event (preview computation only) | Assistant chat Gist Review panel |
| `cmd.chat.memory.rebuild_lexical_index` | `{ project_id }` | `memory.index.lexical.rebuild.started`, `memory.index.lexical.rebuild.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.rebuild_semantic_index` | `{ project_id }` | `memory.index.semantic.rebuild.started`, `memory.index.semantic.rebuild.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.verification_sweep` | `{ project_id }` | `memory.verification_sweep.started`, `memory.verification_sweep.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.dedup_sweep` | `{ project_id }` | `memory.dedup_sweep.started`, `memory.dedup_sweep.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.summarize_monthly` | `{ project_id, month? }` | `memory.monthly_summary.started`, `memory.monthly_summary.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.prune_archive` | `{ project_id, policy? }` | `memory.prune_archive.started`, `memory.prune_archive.completed` | Assistant chat Gist Review panel |

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#UICommand

---
### 2.8A Side-panel and artifacts navigation commands

| Command | Payload | Event / persistence | Notes |
|---|---|---|---|
| `cmd.panel.switch` | `{ "panel_id": "source_control" | "github_actions" | "docker_manager" | "artifacts" | "chat" | "files" | "run_debug", "project_id": "<optional>", "context?": { "repo_id?": "<optional>", "worktree_id?": "<optional>", "workflow_run_id?": "<optional>", "publish_result_id?": "<optional>", "k8s_ref?": "<optional>" } }` | Layout/UI state only; no domain event required. | Single side-panel slot; last-click wins. |
| `cmd.artifacts.open_panel` | `{ "project_id": "<optional>", "filter": { "artifact_type": "<optional>", "task_id": "<optional>" } }` | Layout/UI state only; no domain event required. | Opens or focuses the Artifacts panel. |
| `cmd.artifacts.show_in_ledger` | `{ "artifact_id": "<required>", "usage_event_ref": "<optional>", "run_id": "<optional>", "thread_id": "<optional>" }` | Layout/UI state only; no domain event required. | Opens canonical Ledger / Usage-linked state. |
| `cmd.artifacts.show_in_usage` | `{ "artifact_id": "<required>", "usage_event_ref": "<optional>", "run_id": "<optional>", "thread_id": "<optional>" }` | Layout/UI state only; no domain event required. | Opens canonical Usage state. |
| `cmd.orchestrator.open_in_source_control` | `{ run_id, attempt_id?, repo_id?, worktree_id?, commit_range? }` | Layout/UI state only; no domain event required. | Cross-surface Orchestrator pivot. |
| `cmd.orchestrator.open_in_github_actions` | `{ run_id, workflow_run_id?, job_id?, step_id? }` | Layout/UI state only; no domain event required. | Cross-surface Orchestrator pivot. |
| `cmd.orchestrator.open_in_docker_manager` | `{ run_id, publish_result_id?, runtime_ref?, k8s_ref? }` | Layout/UI state only; no domain event required. | Cross-surface Orchestrator pivot. |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md

## References
- `Plans/Contracts_V0.md#UICommand`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/LSPSupport.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/assistant-chat-design.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Wiring_Matrix.md`

## Canonical Runtime Recovery Command Consolidation (2026-03-09)
Canonical recovery commands use one shared namespace: `cmd.runtime.*`. Legacy recovery command namespaces are deprecated aliases only.

| `allowed_action_id` | canonical command id | minimum args |
|---|---|---|
| `approve` | `cmd.runtime.approve` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `decline` | `cmd.runtime.decline` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `retry_now` | `cmd.runtime.retry_now` | `{ run_id, node_id, attempt_id }` |
| `resume_after_prerequisite` | `cmd.runtime.resume_after_prerequisite` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `restore_safe_point_then_retry` | `cmd.runtime.restore_safe_point_then_retry` | `{ run_id, node_id, attempt_id, safe_point_id }` |
| `start_fresh_attempt` | `cmd.runtime.start_fresh_attempt` | `{ run_id, node_id, attempt_id? }` |
| `replan` | `cmd.runtime.replan` | `{ run_id, node_id, attempt_id? }` |
| `skip_node` | `cmd.runtime.skip_node` | `{ run_id, node_id, attempt_id? }` |
| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |
| `open_details` | `cmd.runtime.open_attempt_details` | `{ run_id, node_id, attempt_id? }` |

### Navigation commands
- `cmd.runtime.open_queue_analysis` -> `{ run_id, scheduler_pass_id }`
- `cmd.runtime.open_remediation_lineage` -> `{ run_id, remediation_root_id }`
- `cmd.runtime.open_safe_point_history` -> `{ run_id, safe_point_id? }`

### Pre-attempt blocked rule
When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### Recovery command definitions
All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to one of the canonical runtime commands above.

No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/human-in-the-loop.md
