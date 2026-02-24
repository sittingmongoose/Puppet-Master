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
| `cmd.graph.approve_hitl` | `{ node_id, rationale }` | run-state events emitted by orchestrator | Orchestrator > Node Graph Display |
| `cmd.graph.deny_hitl` | `{ node_id, rationale }` | run-state events emitted by orchestrator | Orchestrator > Node Graph Display |

ContractRef: ContractName:Plans/Run_Graph_View.md#16, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.5 Orchestrator page commands
These IDs are required by `Plans/Orchestrator_Page.md`.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.orchestrator.switch_tab` | `{ tab_id }` | no persisted domain event (active tab state update) | Orchestrator page |
| `cmd.orchestrator.open_evidence` | `{ tier_id }` | no persisted domain event (navigation/filter update) | Orchestrator > Evidence tab |
| `cmd.orchestrator.open_history_run` | `{ run_id }` | no persisted domain event (navigation/update) | Orchestrator > History + Node Graph tabs |
| `cmd.orchestrator.retry_node` | `{ tier_id }` | `tool.invoked` or `tool.denied`; run-state events emitted by orchestrator | Orchestrator page |
| `cmd.orchestrator.replan_node` | `{ tier_id }` | `tool.invoked` or `tool.denied`; run-state events emitted by orchestrator | Orchestrator page |
| `cmd.orchestrator.reopen_node` | `{ tier_id }` | run-state events emitted by orchestrator | Orchestrator page |

ContractRef: ContractName:Plans/Orchestrator_Page.md#14, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.6 Chat context usage commands
These IDs are required by `Plans/assistant-chat-design.md` section 25.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Assistant chat context ring + usage pop-out |
| `cmd.chat.open_usage_popout` | `{ thread_id }` | no persisted domain event (window open/focus state update) | Assistant chat context ring + usage pop-out |
| `cmd.chat.close_usage_popout` | `{ thread_id }` | no persisted domain event (window close state update) | Assistant chat context ring + usage pop-out |

ContractRef: ContractName:Plans/assistant-chat-design.md#25-context-enhancements, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.7 Chat slash commands (reserved)
These IDs are required by `Plans/assistant-chat-design.md` section 5.

| Command ID | Slash command | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|---|
| `cmd.chat.new` | `/new` | `{}` | `chat.thread.created` | Assistant chat |
| `cmd.chat.model` | `/model` | `{ model_id }` | no persisted domain event (session model state update) | Assistant chat |
| `cmd.chat.effort` | `/effort` | `{ level }` | no persisted domain event (session effort state update) | Assistant chat |
| `cmd.chat.mode` | `/mode` | `{ mode }` | no persisted domain event (session mode state update) | Assistant chat |
| `cmd.chat.export` | `/export` | `{ format? }` | `chat.thread.exported` | Assistant chat |
| `cmd.chat.clear` | `/clear` | `{ thread_id }` | `chat.thread.cleared` | Assistant chat |
| `cmd.chat.help` | `/help` | `{}` | no persisted domain event (UI display update) | Assistant chat |
| `cmd.chat.settings` | `/settings` | `{}` | no persisted domain event (navigation update) | Settings panel |
| `cmd.chat.doctor` | `/doctor` | `{}` | `doctor.run.started` | Doctor page |
| `cmd.chat.cancel` | `/cancel` | `{ thread_id? }` | `run.cancelled` | Assistant chat |
| `cmd.chat.stop` | `/stop` | `{ thread_id? }` | no persisted domain event (stream stop) | Assistant chat |

User-defined custom commands MUST NOT use any reserved command name listed above. Custom commands are prefixed with `/x-` by convention.

ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/Contracts_V0.md#UICommand

---

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
