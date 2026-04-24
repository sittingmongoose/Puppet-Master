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
Command families stay normalized around shared navigation, search routing, and runtime recovery ownership.

### 2.0 Command entry contract (doc-level)
Required command metadata:
- `command_kind`
- `normalization.kind`
- `normalizes_to_contract`
- `alias_of_command_id`

Rules:
- `route_target` owns canonical open and focus identity.
- command normalization remains discoverable at the doc-level contract.

### 2.0B Action-surface policy

Actions available on the UI are scoped by:
- User role and execution_role (from Permissions_System.md)
- Active run mode (automate, interactive, diagnostic)
- Concern state and blocked_sequence
- approval_scope_key and approval_id context
- DAE jail posture

Rules:
- User cannot take an action unless the approval_scope_key allows it AND the operation is not contradicted by blocked_sequence or DAE jail posture.
- Run mode changes, approval decisions, and blocked recovery are Orchestrator-owned; UI surfaces them but does not make the decision locally.
- Actions that trigger external side-effects (file mutations, provider calls, route/open ops) MUST route through Permissions and route/open contracts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

### Canonical route payload and route/open tail rules

UI commands that route or open MUST preserve:
- `route_target`: destination for output or side-effect (file path, GitHub issue URL, workspace concern, etc.)
- `OpenSubject`: resource being opened (file, concern, help entry, project state)
- `execution_unit_context`: which run, seam, package, or node is executing the command
- `approval_scope_key`: reusable approval join key
- `operational_identity`: attribution
ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, Primitive:ExecutionContext, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

Route side-effect rules:
- File mutations go through FileSafe and route/open guards before execution.
- Provider mutations (PRs, issue comments) go through Permissions and provider-identity checks.
- Route completion refs are immutable once recorded; they form an audit trail of what was actually modified.
- If route_target becomes unreachable between command build and execution, the UI displays an error and does not attempt fallback mutation.

### Command normalization model

All UI commands (button clicks, keyboard shortcuts, context menu items) normalize to a standard record:
```
{
  command_id: string,
  command_type: 'action' | 'navigation' | 'state_change' | 'modal',
  source_surface: 'graph' | 'inspector' | 'approval_modal' | 'logs' | 'menu' | 'shortcut',
  target_scope: 'run' | 'node' | 'concern' | 'evidence' | 'artifact',
  target_id: string,
  action_intent: string,
  parameters: Record<string, any>,
  route_target?: string,
  open_subject?: OpenSubject,
  execution_unit_context?: ExecutionUnitContext,
  approval_scope_key: string,
  operational_identity: string,
  created_utc: string
}
```

Rules:
- Commands from keyboard, menu, and context are all normalized to this record.
- CLI commands and programmatic API calls use the same record format for Orchestrator ingestion.
- Command normalization preserves user intent without rewriting route_target or OpenSubject.

ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md

### Tier-era compatibility retirement

Legacy compatibility layer MUST be removed:
- `TierContext` is not used in UI commands; all context is in `execution_unit_context`.
- `tier_id` field is not present in any command or payload.
- `Tiers` enum is not referenced in commands or models.
- `Phase-Task-Subtask` runtime canon is retired; execution units are `run`, `seam`, `package`, `node`, `overseer`, or `delegated_subagent`.
- `allowed_actions[]` array with tier-specific rules is replaced with `approval_scope_key` and permission lookups.
- `reason_code` and `recovery_options[]` are retired; blocked recovery reasons and options are stored in the canonical `blocked_episode` record.
- `approve_continue` action is replaced with explicit approval decision through `Permissions_System.md§PERM-ACTIONS`.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

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

Run Graph runtime recovery commands are defined canonically in `## Canonical Runtime Recovery Command Consolidation (2026-03-09)`.

Rules:
- graph approval and recovery commands target blocked/runtime identity, not `request_id`
- `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` do not remain canonical command IDs
- any graph-facing wrapper command normalizes to the runtime command family and canonical `route_target` semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Run_Graph_View.md

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

ContractRef: Plans/Orchestrator_Page.md#10. Search, routing, and action policy, Plans/Contracts_V0.md#7.3 `route_target`

Required fields:
- action_type
- target_scope
- palette_visible
- shortcut_eligible
- confirmation_strength
- reversibility
- target_kind
- subject_id
- object_kind
- object_id
- tab_id
- inspector_target

Canonical terms and values:
- navigation vs mutation
- single-target vs multi-target
- shortcut eligibility
- palette visibility
- confirmation
- reversibility
- route_target

Labels:
- Open
- Review
- Resolve
- Export

Behavioral rules:
- Orchestrator commands must encode the action-surface policy and route through the shared route payload when navigating.

Permission carry-through:
- mutation commands must retain confirmation and safety class
### 2.5A Operational external-system command families

Source Control (`cmd.source_control.*`), GitHub Actions (`cmd.actions.*`), and Docker Manager (`cmd.docker.*`) form a triple-family block of operational command groups. They share one characteristic: each family manages a live external system boundary (repository state, remote CI workflows, or local container runtime) rather than a purely local layout toggle, so canonical IDs remain stable even when the hosting panel or toolbar evolves.

- Source Control commands manage repository views and git-backed operational workflows.
- GitHub Actions commands manage workflow runs, jobs, logs, and pinned workflows.
- Docker Manager commands manage images, containers, compose stacks, and runtime inspection.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

#### GitHub Actions command family

| Command ID | Label | Description | Keybind | Preconditions |
|---|---|---|---|---|
| `cmd.actions.rerun` | Rerun Workflow | Re-triggers the selected workflow run | — | `actions_panel_visible && selected_run` |
| `cmd.actions.rerun_failed` | Rerun Failed Jobs | Re-triggers only failed jobs in selected run | — | `actions_panel_visible && selected_run && has_failed_jobs` |
| `cmd.actions.cancel` | Cancel Run | Cancels the in-progress workflow run | — | `actions_panel_visible && selected_run && run_in_progress` |
| `cmd.actions.pin` | Pin Workflow | Pins a workflow to the actions panel header for quick access | — | `actions_panel_visible && selected_workflow` |
| `cmd.actions.unpin` | Unpin Workflow | Removes a pinned workflow from header | — | `actions_panel_visible && pinned_workflow_selected` |
| `cmd.actions.view_logs` | View Logs | Opens full log output for selected job/step | — | `actions_panel_visible && selected_job` |
| `cmd.actions.open_in_browser` | Open in Browser | Opens the workflow run on GitHub.com | — | `actions_panel_visible && selected_run` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

#### Docker Manager command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.docker.build` | Build Image | Builds a Docker image from selected Dockerfile | `docker_available && dockerfile_selected` |
| `cmd.docker.run` | Run Container | Starts a container from selected image | `docker_available && image_selected` |
| `cmd.docker.stop` | Stop Container | Stops a running container | `docker_available && container_running` |
| `cmd.docker.restart` | Restart Container | Restarts a container | `docker_available && container_selected` |
| `cmd.docker.remove` | Remove Container | Removes a stopped container | `docker_available && container_stopped` |
| `cmd.docker.logs` | View Logs | Shows container log output | `docker_available && container_selected` |
| `cmd.docker.exec` | Exec Shell | Opens interactive shell in container | `docker_available && container_running` |
| `cmd.docker.compose_up` | Compose Up | Runs docker-compose up for selected compose file | `docker_available && compose_file_selected` |
| `cmd.docker.compose_down` | Compose Down | Runs docker-compose down | `docker_available && compose_running` |
| `cmd.docker.inspect` | Inspect | Shows detailed container/image info | `docker_available && resource_selected` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### 2.5B Kubernetes command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.k8s.get_pods` | Get Pods | Lists pods in selected namespace | `k8s_connected` |
| `cmd.k8s.describe` | Describe Resource | Shows detailed resource description | `k8s_connected && resource_selected` |
| `cmd.k8s.logs` | View Pod Logs | Shows log output for selected pod | `k8s_connected && pod_selected` |
| `cmd.k8s.exec` | Exec Shell | Opens shell in selected pod/container | `k8s_connected && pod_running` |
| `cmd.k8s.apply` | Apply Manifest | Applies a Kubernetes manifest file | `k8s_connected && manifest_selected` |
| `cmd.k8s.delete` | Delete Resource | Deletes selected Kubernetes resource | `k8s_connected && resource_selected` |
| `cmd.k8s.scale` | Scale Deployment | Adjusts replica count for deployment | `k8s_connected && deployment_selected` |
| `cmd.k8s.port_forward` | Port Forward | Sets up port forwarding to selected pod | `k8s_connected && pod_selected` |
| `cmd.k8s.switch_context` | Switch Context | Changes active Kubernetes context | `k8s_available` |
| `cmd.k8s.switch_namespace` | Switch Namespace | Changes active namespace | `k8s_connected` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md

### 2.5C Project-scope git worktree commands

These commands manage repository-level worktree inventory and lifecycle. They complement, but do not replace, the assistant thread-scoped `cmd.chat.worktree.*` family defined in §2.6.1.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.git.worktree.create` | Create Worktree | Creates a new git worktree at specified path | `git_available && !worktree_limit_reached` |
| `cmd.git.worktree.remove` | Remove Worktree | Removes an existing worktree | `git_available && worktree_selected && worktree_clean` |
| `cmd.git.worktree.list` | List Worktrees | Shows all worktrees for current repo | `git_available` |
| `cmd.git.worktree.switch` | Switch to Worktree | Opens/focuses the selected worktree | `git_available && worktree_selected` |
| `cmd.git.worktree.lock` | Lock Worktree | Prevents accidental removal of worktree | `git_available && worktree_selected` |
| `cmd.git.worktree.unlock` | Unlock Worktree | Removes lock from worktree | `git_available && worktree_locked` |

Rules:
- `cmd.git.worktree.*` owns project-scope worktree inventory, lock state, and navigation.
- `cmd.chat.worktree.*` remains the thread-scoped wrapper family and MAY normalize internally to project-scope worktree operations.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md
### 2.6 Chat context usage commands

#### Context Lens commands

| Command ID | Purpose | Notes |
|---|---|---|
| `cmd.chat.context_lens.toggle` | Open or close the Context Lens dropdown | Owner control lives in the top-right of the chat window, immediately to the right of the search bar. |
| `cmd.chat.context_lens.set_mode` | Set active mode to `mute`, `focus`, or `subcompact` | Multi-select is supported in all modes. |
| `cmd.chat.context_lens.turn_off` | Exit Context Lens mode and clear active selection state | Dropdown entry label is `Turn Off`. |
| `cmd.chat.context_lens.toggle_message_selection` | Toggle one message into or out of the active selection set | Applies immediately in `mute` and `focus`. |
| `cmd.chat.context_lens.clear_selection` | Clear the current active selection set | Does not mutate canonical history. |
| `cmd.chat.context_lens.apply_subcompact` | Apply Subcompact to the current selected region | Requires explicit user confirmation because it creates a local summary artifact. |
| `cmd.chat.context_lens.revert_subcompact` | Restore a previously subcompacted region to full effective-context state | Uses canonical source refs for rehydration. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### 2.6.1 Assistant worktree commands

Six commands for assistant thread-level worktree operations. All share `when:activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`.

| Command ID | Label | Description | Extra when clause |
|---|---|---|---|
| `cmd.chat.worktree.create` | Create Worktree | Creates worktree for active thread, opens bind dialog | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.remove` | Remove Worktree | Removes active thread's worktree (confirmation dialog if dirty) | `activeThreadHasWorktree` |
| `cmd.chat.worktree.bind_existing` | Bind Existing Worktree | Opens picker of unowned worktrees to bind to active thread | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.open_files` | Open Worktree Files | Opens worktree root in file manager | `activeThreadHasWorktree` |
| `cmd.chat.worktree.merge` | Merge Worktree | Opens merge-back dialog for active thread's worktree | `activeThreadHasWorktree` |
| `cmd.chat.worktree.create_pr` | Create PR | Opens PR creation panel for active thread's worktree branch | `activeThreadHasWorktree && projectHasGitHubRemote` |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md

**Context variable definitions:**
- `activeThreadExists`: a chat thread is selected in the assistant panel
- `activeThreadHasWorktree`: active thread has a non-null worktree binding in redb
- `projectIsGitRepo`: active project has a `.git` directory
- `projectIsRemoteNonSSH`: project is remote-mode but not SSH-tunneled (worktrees unsupported)
- `projectHasGitHubRemote`: project git config contains a `github.com` remote URL

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md

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

This section defines the canonical contract for this surface.

Core rules:
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions in owned command-table rows. Distinct terminal actions must keep owned command-table rows and do not collapse terminal actions into one normalized target.

| Command ID | Payload | Domain event(s) | UI surface(s) |
| --- | --- | --- | --- |
| Open in Terminal | `terminal_session_id`; reveal existing session context | terminal session reveal/focus | command cards, terminal surfaces |
| Show Terminal | `terminal_session_id`; focus the same live session already associated with the card | terminal session reveal/focus | command cards, terminal surfaces |
| Rerun in Terminal | command replay payload plus terminal session launch context | new terminal launch; command replay | command cards, terminal surfaces |
| Detach/Pop-Out | `terminal_session_id`; detach target | terminal detach/pop-out | command cards, terminal surfaces |

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out
- Command ID
- Payload
- Domain event(s)
- UI surface(s)

Rules:
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
- distinct terminal actions must keep owned command-table rows
- do not collapse terminal actions into one normalized target
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
- `cmd.terminal.clear_scrollback` preserves runtime identity
- close commands are layout actions unless `termination_policy` requests runtime shutdown
- `cmd.dev.show_output`, `cmd.dev.show_problems`, and `cmd.dev.show_ports` reveal surfaces linked to the owning `dev_session_id`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

#### Chat message action commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.chat.copy_message` | `{ thread_id, message_id }` | Copy the rendered message content. |
| `cmd.chat.retry_message` | `{ thread_id, message_id }` | Re-run the selected failed/cancelled assistant turn. |
| `cmd.chat.rewind` | `{ thread_id, target_message_id }` | Rewind conversation history only; does not restore files. |
| `cmd.chat.revert` | `{ thread_id, target_message_id? }` | Restore persisted file mutations from one assistant turn; omitted `target_message_id` resolves to the latest assistant turn in the thread with persisted file mutations. |
| `cmd.chat.add_file_reference` | `{ project_id, thread_id?, path, line_range? }` | Insert a visible file reference chip into the composer. File-only in MVP; folder references are out of scope. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md

Message-level availability and code-block actions:

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.chat.edit_last_user_message` | Edit Last Message | Opens the last user message for editing | `chat_active && has_user_messages` |
| `cmd.chat.resend_last_user_message` | Resend Last Message | Resends the last user message (triggers new response) | `chat_active && has_user_messages` |
| `cmd.chat.copy_message` | Copy Message | Copies selected message content to clipboard | `chat_active && message_selected` |
| `cmd.chat.copy_code_block` | Copy Code Block | Copies a specific code block from a message | `chat_active && code_block_selected` |
| `cmd.chat.insert_code_block` | Insert at Cursor | Inserts code block content at editor cursor position | `chat_active && code_block_selected && editor_active` |
| `cmd.chat.apply_code_block` | Apply to File | Applies code block as an edit to the relevant file | `chat_active && code_block_selected` |
| `cmd.chat.toggle_message_details` | Toggle Details | Shows/hides message metadata (model, tokens, timing) | `chat_active && message_selected` |

Revert rules:
- when the resolved assistant turn touched multiple files, `cmd.chat.revert` reverts the whole turn across all affected files
- after a successful revert, affected editors refresh from the canonical mutation pipeline
- `cmd.chat.rewind` MUST NOT be used as a file-restore alias
- `cmd.chat.resend_last_user_message` is distinct from `cmd.chat.retry_message`; resend replays the latest user-authored input, while retry re-runs a failed or cancelled assistant turn
- `cmd.chat.copy_code_block`, `cmd.chat.insert_code_block`, and `cmd.chat.apply_code_block` operate on a resolved code-block sub-selection rather than the entire message body

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 2.7 Chat slash commands (reserved)

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing
- intent phrase
- resolved tool key
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- No subcommand family for MVP
- Skills panel
- Natural language

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- NL intents and slash commands hit the same dispatcher
- "search the web for X" → `websearch`
- "extract this page" → `webextract`
- "read this URL" → `webfetch`
- "research topic" → `webresearch`
- Reading intents MUST resolve to `webfetch`, not `websearch`
ContractRef: ContractName:Plans/Commands_System.md#7. Reserved built-in slash commands, ContractName:Plans/assistant-chat-design.md#5.2 `/web` and `/skill`, ContractName:Plans/Tools.md#12. Web tool routing algorithm
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- command tables and routing docs must mirror the same mappings
- /cancel resolves internally to cmd.chat.stop
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
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

| Command ID | Parameters | Behavior |
| --- | --- | --- |
| `cmd.search.show` | `{ project_id, focus? }` | Reveal or focus the Search side panel. |
| `cmd.search.find_in_files` | `{ project_id, query?, scope? }` | Run or rerun find-in-files in the Search panel. |
| `cmd.search.replace_in_files` | `{ project_id, query?, replacement?, scope? }` | Run replace preview or apply flow in the Search panel. |
| `cmd.search.open_result` | `{ project_id, query_session_id, subject_id, disposition? }` | Open a Search result through `route_target` and the canonical file-open path. |
| `cmd.search.replace_selected` | `{ project_id, query_session_id, subject_id }` | Apply replacement to one selected result identified by canonical subject identity. |

Rules:
- Search command routing resolves through `route_target`.
- Search commands remain side-panel scoped and preserve query-session state.
- Search routing policy is owned by `Plans/Orchestrator_Page.md#search-routing-and-action-policy`.
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

Canonical recovery commands use one shared namespace: `cmd.runtime.*`. Legacy recovery command namespaces are deprecated aliases only.

| `allowed_action_id` | canonical command id | minimum args |
| --- | --- | --- |
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

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)

### Recovery command definitions
All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to one of the canonical runtime commands above.

No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule

Required command metadata:
- `command_kind`
- `normalization.kind`
- `normalizes_to_contract`
- `alias_of_command_id`
- `approval_scope_key`
- `allowed_action_ids[]`
- `route_target`
- `open_subject?`
- `ref_family?`

Canonical terms and values:
- command_kind
- normalization
- approval_scope_key
- route_target
- ref_family

Labels:
- Approve
- Decline
- Resume after prerequisite
- Blocked
- Retry
- Review
- Resolve

Behavioral rules:
- blocked-state recovery buttons and menu entries map from `allowed_action_ids[]` to canonical `cmd.runtime.*` commands
- no surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics
- recovery commands must bind to blocked-episode identity rather than request-level surrogates
- normalization metadata must survive for wrappers and deprecated aliases
- selector precedence and scoped resolver behavior follow the canonical route payload rules above
- timestamp/run/thread fallback is compatibility-only when stronger route identity is unavailable

Permission carry-through:
- ordered `allowed_action_ids[]`
