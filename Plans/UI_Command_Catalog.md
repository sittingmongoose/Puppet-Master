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

The command catalog normalizes Search, file-tree actions, Source Control diff/review, and chat restore handoff into stable command families.

Required families:
- `cmd.search.*`
- `cmd.file.*`
- `cmd.source_control.*`
- `cmd.git.*` diff/review commands listed below
- `cmd.chat.add_file_reference`
- `cmd.chat.revert`
- `cmd.chat.rewind`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md

Family rules:
- Search commands own persistent Search-panel behavior only; they do not replace command-palette navigation or semantic LSP navigation.
- `cmd.file.*` covers file-tree actions only; it does not absorb terminal or chat-owned commands.
- `cmd.chat.revert` and `cmd.chat.rewind` remain distinct commands with non-overlapping semantics.
- Git diff/review commands mutate repository state and MUST NOT be described as editor undo.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/LSPSupport.md

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

Canonical Run Graph and runtime recovery commands are:
- `cmd.runtime.approve`
- `cmd.runtime.decline`
- `cmd.runtime.retry_from_safe_point`
- `cmd.runtime.retry_fresh`
- `cmd.runtime.open_attempt_details`
- `cmd.runtime.open_queue_analysis`
- `cmd.runtime.open_safe_point`
- `cmd.runtime.open_remediation`
- `cmd.runtime.open_blocked_episode`

Rules:
- graph approval and recovery commands target blocked/runtime identity, not `request_id`
- `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` do not remain canonical command IDs
- any graph-facing wrapper command normalizes to the runtime command family and canonical `route_target` semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Run_Graph_View.md
### 2.5 Orchestrator page commands

Canonical Orchestrator commands are:
- `cmd.orchestrator.focus_object`
- `cmd.orchestrator.focus_run`
- `cmd.orchestrator.open_graph_generation`
- `cmd.orchestrator.open_graph_patch`
- `cmd.orchestrator.open_concern`
- `cmd.orchestrator.open_promotion`
- `cmd.orchestrator.open_review`
- `cmd.orchestrator.open_corroboration`
- `cmd.orchestrator.open_in_source_control`

Rules:
- Orchestrator object opens are route-consuming navigation wrappers, not layout-only commands
- cross-tab deep links preserve `project_id`, `focused_run_id`, object identity, and inspector focus
- commands that pivot into Source Control or Usage remain public wrapper commands and normalize internally to canonical route/open contracts

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md
### 2.6 Chat context usage commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Chat context circle click affordance, command palette |
| `cmd.chat.open_thread_context_details` | `{ thread_id }` | layout/UI state only | Chat context hover module, artifact deep-links |
| `cmd.chat.focus_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |
| `cmd.chat.close_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |

Rules:
- hover-summary disclosure is passive UI and does not require its own stable command ID
- choosing `More Details` dispatches `cmd.chat.open_thread_context_details`
- clicking the circle may reveal `Compact Now` locally, but `cmd.chat.compact_context` is dispatched only when the user actually chooses that action
- `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` are superseded and MUST NOT remain canonical IDs

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md
### 2.6A Render / browser preview commands
Browser, terminal, and dev-session commands share one shell/runtime interaction family. Browser commands own browser-session behavior, terminal commands own section or tab or pane or session behavior, and dev commands own dev-workflow behavior.

#### Browser preview and browsing commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.browser.open_workspace_preview` | `{ project_id, target, workspace_tab_id }` | `browser.session.created`, `browser.session.state_changed` | File preview, command palette, editor/browser tab |
| `cmd.browser.open_detached_preview` | `{ project_id, target, source_workspace_tab_id }` | `browser.session.created`, `browser.session.state_changed` | File preview, command palette, detached browser |
| `cmd.browser.focus_browser_tab` | `{ browser_session_id }` | layout/UI state only | editor/browser tab surface |
| `cmd.browser.detach_browser_tab` | `{ browser_session_id }` | `browser.session.state_changed` | editor/browser tab surface |
| `cmd.browser.open_devtools` | `{ browser_session_id, mode? }` | layout/UI state only | browser chrome, command palette |
| `cmd.browser.toggle_devtools_dock` | `{ browser_session_id, dock }` | layout/UI state only | browser chrome, DevTools surface |
| `cmd.browser.pick_element_for_chat` | `{ browser_session_id, thread_id? }` | `browser.context_captured` | browser chrome, assistant chat |
| `cmd.browser.add_selection_to_chat` | `{ browser_session_id, thread_id? }` | `browser.context_captured` | browser chrome, assistant chat |
| `cmd.browser.add_selection_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'clip' }` | `browser.context_captured`, `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_selection_full_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'full' }` | `browser.context_captured`, `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'clip' }` | `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_full_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'full' }` | `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.share_with_agent` | `{ browser_session_id, thread_id }` | `browser.context_shared` | browser chrome, assistant chat |
| `cmd.browser.revoke_share_with_agent` | `{ browser_session_id, thread_id? }` | `browser.context_share_revoked` | browser chrome, attention surfaces |
| `cmd.browser.take_over` | `{ browser_session_id, takeover_choice:'pause_agent'|'let_agent_continue'|'stop_agent_keep_browser' }` | `browser.session.takeover_state_changed` | browser takeover prompt, automation banner |
| `cmd.browser.pause_agent` | `{ browser_session_id }` | `browser.session.takeover_state_changed` | browser chrome, automation banner |
| `cmd.browser.let_agent_continue` | `{ browser_session_id }` | `browser.session.takeover_state_changed` | browser takeover prompt |
| `cmd.browser.stop_agent_keep_browser` | `{ browser_session_id }` | `browser.session.takeover_state_changed`, `dev.session.stopped` | browser takeover prompt, browser chrome |
| `cmd.browser.promote_to_normal_browsing` | `{ browser_session_id, target_workspace_tab_id? }` | `browser.session.promoted` | browser chrome, command palette |
| `cmd.browser.reopen` | `{ browser_session_id }` | `browser.session.state_changed` | recovery banner, attention center |
| `cmd.browser.retry` | `{ browser_session_id }` | `browser.session.state_changed` | recovery banner, attention center |
| `cmd.browser.keep_closed` | `{ browser_session_id }` | `browser.session.closed` | recovery banner, attention center |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Terminal session and layout commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.terminal.show` | `{ project_id, workspace_tab_id?, terminal_session_id?, terminal_tab_id?, terminal_pane_id?, section_id? }` | layout/UI state only | chat command cards, command palette, output/problems/ports linkbacks |
| `cmd.terminal.new_tab` | `{ project_id, workspace_tab_id, section_id?, cwd?, shell_profile?, title? }` | `terminal.session.created`, `terminal.layout.changed` | terminal header, command palette, toolbar |
| `cmd.terminal.split_pane` | `{ terminal_tab_id, source_pane_id, split:'horizontal'|'vertical', cwd?, shell_profile?, title? }` | `terminal.session.created`, `terminal.layout.changed` | terminal tab chrome |
| `cmd.terminal.focus_session` | `{ terminal_session_id }` | layout/UI state only | command cards, output/problems/ports linkbacks |
| `cmd.terminal.move_tab_to_section` | `{ terminal_tab_id, target_section_id }` | `terminal.layout.changed` | terminal tab context menu |
| `cmd.terminal.rename_tab` | `{ terminal_tab_id, title }` | `terminal.layout.changed` | terminal tab chrome |
| `cmd.terminal.pin_tab` | `{ terminal_tab_id, pinned }` | `terminal.layout.changed` | terminal tab chrome |
| `cmd.terminal.close_pane` | `{ terminal_pane_id, termination_policy? }` | `terminal.layout.changed`, `terminal.session.state_changed` | terminal pane chrome |
| `cmd.terminal.close_tab` | `{ terminal_tab_id, termination_policy? }` | `terminal.layout.changed`, `terminal.session.state_changed` | terminal tab chrome |
| `cmd.terminal.clear_scrollback` | `{ terminal_session_id }` | `terminal.session.state_changed` | terminal chrome, command palette |
| `cmd.terminal.restart_session` | `{ terminal_session_id }` | `terminal.session.restarting`, `terminal.session.created` | terminal chrome, recovery banner |
| `cmd.terminal.terminate_session` | `{ terminal_session_id }` | `terminal.session.terminating`, `terminal.session.exited` | terminal chrome |
| `cmd.terminal.kill_session` | `{ terminal_session_id }` | `terminal.session.killed` | terminal chrome, recovery banner |
| `cmd.terminal.detach_section` | `{ terminal_section_id }` | `terminal.layout.changed` | terminal section chrome, command palette |
| `cmd.terminal.reattach_section` | `{ terminal_section_id, dock_target? }` | `terminal.layout.changed` | detached terminal window, command palette |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Dev-session commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.dev.start_session` | `{ project_id, workspace_tab_id, mode, target? }` | `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.stop_session` | `{ dev_session_id }` | `dev.session.stopping`, `dev.session.stopped` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.restart_session` | `{ dev_session_id }` | `dev.session.restarting`, `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.show_output` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Output |
| `cmd.dev.show_problems` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Problems |
| `cmd.dev.show_ports` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Ports |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Catalog lifecycle commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.catalog.install_item` | `{ item_type, item_id, version? }` | `catalog.install.started`, `catalog.install.completed` | Catalog |
| `cmd.catalog.update_item` | `{ item_type, item_id, target_version? }` | `catalog.update.started`, `catalog.update.completed` | Catalog |
| `cmd.catalog.remove_item` | `{ item_type, item_id }` | `catalog.remove.started`, `catalog.remove.completed` | Catalog |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

Rules:
- `Open in Terminal` and `Show Terminal` normalize to `cmd.terminal.show`; they do not imply `cmd.terminal.new_tab`
- `cmd.terminal.restart_session` replaces runtime identity and rebinds the chosen pane or tab to a new `terminal_session_id`
- `cmd.terminal.clear_scrollback` preserves runtime identity
- close commands are layout actions unless `termination_policy` requests runtime shutdown
- `cmd.dev.show_output`, `cmd.dev.show_problems`, and `cmd.dev.show_ports` reveal surfaces linked to the owning `dev_session_id`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

#### Chat message action commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.chat.copy_message` | `{ thread_id, message_id }` | Copy the rendered message content. |
| `cmd.chat.delete_message` | `{ thread_id, message_id }` | Delete a user-authored message where allowed by policy. |
| `cmd.chat.retry_message` | `{ thread_id, message_id }` | Re-run the selected failed/cancelled assistant turn. |
| `cmd.chat.rewind` | `{ thread_id, target_message_id }` | Rewind conversation history only; does not restore files. |
| `cmd.chat.revert` | `{ thread_id, target_message_id? }` | Restore persisted file mutations from one assistant turn; omitted `target_message_id` resolves to the latest assistant turn in the thread with persisted file mutations. |
| `cmd.chat.add_file_reference` | `{ project_id, thread_id?, path, line_range? }` | Insert a visible file reference chip into the composer. File-only in MVP; folder references are out of scope. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md

Revert rules:
- when the resolved assistant turn touched multiple files, `cmd.chat.revert` reverts the whole turn across all affected files
- after a successful revert, affected editors refresh from the canonical mutation pipeline
- `cmd.chat.rewind` MUST NOT be used as a file-restore alias

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

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
| `cmd.chat.rewind` | `/rewind` | `{ thread_id, target_message_id }` | thread rewind UI / runtime action | Assistant chat |
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

#### Search commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.search.show` | `{ project_id, focus?: "query" | "replace" | "results" }` | Reveal/focus the Search side panel. |
| `cmd.search.find_in_files` | `{ project_id, query?, scope? }` | Run or re-run find-in-files in the Search panel. |
| `cmd.search.replace_in_files` | `{ project_id, query?, replacement?, scope? }` | Run replace preview/apply flow in the Search panel. |
| `cmd.search.open_result` | `{ project_id, result_id, disposition?: "current_tab" | "new_tab" | "split" }` | Open a Search result through the canonical file-open path. |
| `cmd.search.next_result` | `{ project_id }` | Move to the next result row. |
| `cmd.search.previous_result` | `{ project_id }` | Move to the previous result row. |
| `cmd.search.set_scope` | `{ project_id, scope }` | Change include/exclude or logical scope selection. |
| `cmd.search.toggle_flag` | `{ project_id, flag: "regex" | "case_sensitive" | "whole_word" }` | Toggle a search option. |
| `cmd.search.replace_selected` | `{ project_id, result_id }` | Apply the replacement to one selected match/result. |
| `cmd.search.replace_all` | `{ project_id, query_session_id }` | Apply all currently approved replacements for the active query session. |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Search rules:
- Search commands are side-panel scoped and MUST preserve query-session state instead of acting like transient palette commands.
- remote queries and replaces use the effective remote host context; they MUST surface stale/degraded/unavailable state explicitly instead of silently falling back to local execution.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/LSPSupport.md

#### File-tree action commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.file.new_file` | `{ project_id, parent_path }` | Create a new file under the selected directory. |
| `cmd.file.new_folder` | `{ project_id, parent_path }` | Create a new folder under the selected directory. |
| `cmd.file.rename` | `{ project_id, path, new_name }` | Rename a file or folder. |
| `cmd.file.delete` | `{ project_id, paths[] }` | Delete one or more selected nodes after confirmation. |
| `cmd.file.copy_full_path` | `{ project_id, path }` | Copy the absolute path to the text clipboard. |
| `cmd.file.copy_relative_path` | `{ project_id, path }` | Copy the project-relative path to the text clipboard. |
| `cmd.file.copy_nodes` | `{ project_id, paths[] }` | Copy one or more nodes into the workspace-node clipboard. |
| `cmd.file.cut_nodes` | `{ project_id, paths[] }` | Arm one or more nodes for move into the workspace-node clipboard. |
| `cmd.file.paste_nodes` | `{ project_id, destination_path }` | Paste nodes using the shared validation/conflict engine. |
| `cmd.file.open_with` | `{ project_id, path, target: "source_editor" | "image_viewer" | "workspace_preview" | "detached_preview" | "diff_review" }` | Open the file using an explicit target. |
| `cmd.file.save_local_copy` | `{ project_id, path }` | Export a file or folder to a user-chosen local destination. |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileSafe.md

File-tree rules:
- the workspace-node clipboard is distinct from the system text clipboard
- cross-authority paste is blocked rather than silently converted into export/import
- `cmd.terminal.show` remains the canonical `Open in Terminal` target and is not redefined under `cmd.file.*`
- `cmd.file.open_with` MUST NOT expose `system_default` in MVP

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

#### Source Control diff/review commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.source_control.show` | `{ project_id, subview?: "changes" | "history" | "graph" | "worktrees" | "branches_stash" }` | Reveal Source Control and optionally select a subview. |
| `cmd.source_control.switch_subview` | `{ project_id, subview }` | Switch Source Control subview without leaving the side panel. |
| `cmd.git.open_diff` | `{ project_id, repo_id, path, compare_origin? }` | Open diff/review for a file. |
| `cmd.git.diff_set_compare_target` | `{ project_id, diff_session_id, compare_target }` | Change compare baseline/target. |
| `cmd.git.diff_search` | `{ project_id, diff_session_id, query }` | Search within the active diff/review surface. |
| `cmd.git.stage_hunks` | `{ project_id, diff_session_id, hunks[] }` | Stage selected hunks. |
| `cmd.git.unstage_hunks` | `{ project_id, diff_session_id, hunks[] }` | Unstage selected hunks. |
| `cmd.git.discard_hunks` | `{ project_id, diff_session_id, hunks[] }` | Discard selected hunks after confirmation. |
| `cmd.git.conflict_apply_resolution` | `{ project_id, diff_session_id, strategy }` | Apply structured conflict resolution to the result buffer. |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/Wiring_Matrix.md

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
