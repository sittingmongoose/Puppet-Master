# Wiring Matrix (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- UI WIRING MATRIX SSOT

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

<a id="section-0"></a>
## 0. Scope
This file is the wiring matrix template and example entries.
Real project wiring matrices are generated/maintained as JSON validated against `Plans/Wiring_Matrix.schema.json`.

ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, Gate:GATE-010

---

<a id="section-1"></a>
## 1. Template

Column definitions for wiring matrix entries:

| Column | Description |
|---|---|
| `ui_element_id` | Stable DOM/widget ID of the triggering UI element (e.g., `btn.github.connect`). |
| `ui_location` | Human-readable surface path where the element appears (e.g., "Settings > GitHub/Auth"). |
| `ui_command_id` | The `cmd.*` ID from `UI_Command_Catalog.md` that this element dispatches. |
| `handler_location` | Canonical Rust module/function path (e.g., `handlers::github_auth::connect` or `crate::core::handlers::auth::connect`). |
| `expected_event_types` | Event types emitted on successful dispatch, or "(none — UI-only)" for view-state-only commands. |
| `acceptance_checks` | 2–3 checks that GATE-010 verification validates for this entry. |
| `evidence_required` | Evidence artifact or bundle required to satisfy the gate. |

Machine-readable format note:
- `entries` in JSON is a map keyed by `ui_element_id` (not an array). This keying makes interactive-element IDs unique by construction.

**Markdown table header:**

| ui_element_id | ui_location | ui_command_id | handler_location | expected_event_types | acceptance_checks | evidence_required |
|---|---|---|---|---|---|---|

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#UICommand, Gate:GATE-010

---

<a id="section-2"></a>
## 2. Example Entries

The following 10 rows are drawn from `Plans/UI_Command_Catalog.md`.
Each row is marked `(EXAMPLE)` — real entries live in JSON validated against `Plans/Wiring_Matrix.schema.json`.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, SchemaID:Wiring_Matrix.schema.json

| ui_element_id | ui_location | ui_command_id | handler_location | expected_event_types | acceptance_checks | evidence_required |
|---|---|---|---|---|---|---|
| btn.github.connect | Settings > GitHub/Auth | cmd.github.connect | handlers::github_auth::connect | auth.github.device_code.issued, auth.github.token.polling, auth.github.authenticated, auth.github.failed | Handler registered in dispatcher; Dispatch emits expected events in order; UI element rendered in Settings > GitHub/Auth surface | (EXAMPLE) |
| btn.github.disconnect | Settings > GitHub/Auth | cmd.github.disconnect | handlers::github_auth::disconnect | auth.github.disconnected | Handler registered in dispatcher; Dispatch emits auth.github.disconnected; Token removed from credential store | (EXAMPLE) |
| menu.lsp.goto_def | File Editor context menu | cmd.lsp.goto_definition | handlers::lsp::goto_definition | tool.invoked | Handler registered in dispatcher; Dispatch emits tool.invoked with tool_name=lsp; Editor navigates to definition location | (EXAMPLE) |
| menu.lsp.find_refs | File Editor context menu | cmd.lsp.find_references | handlers::lsp::find_references | tool.invoked | Handler registered in dispatcher; Dispatch emits tool.invoked with tool_name=lsp; References panel populated | (EXAMPLE) |
| btn.widget.add | Dashboard widget picker | cmd.widget.add | handlers::widget_layout::add | (none — UI-only) | Handler registered in dispatcher; Widget instance added to layout state; Widget rendered in target page grid | (EXAMPLE) |
| btn.widget.remove | Dashboard widget header | cmd.widget.remove | handlers::widget_layout::remove | (none — UI-only) | Handler registered in dispatcher; Widget instance removed from layout state; Widget no longer rendered in grid | (EXAMPLE) |
| node.graph.select | Orchestrator > Node Graph Display | cmd.graph.select_node | handlers::run_graph::select_node | (none — UI-only) | Handler registered in dispatcher; Selection state updated to target node_id; Detail panel reflects selected node | (EXAMPLE) |
| btn.graph.retry | Orchestrator > Node Graph Display detail panel | cmd.graph.retry_node | handlers::run_graph::retry_node | tool.invoked, tool.denied | Handler registered in dispatcher; Dispatch emits tool.invoked or tool.denied; Node state transitions to retrying when invocation succeeds | (EXAMPLE) |
| tab.orchestrator.switch | Orchestrator page tab bar | cmd.orchestrator.switch_tab | handlers::orchestrator::switch_tab | (none — UI-only) | Handler registered in dispatcher; Active tab state updated to target tab_id; Tab content panel switches | (EXAMPLE) |
| btn.chat.new | Assistant chat input | cmd.chat.new | handlers::chat::new_thread | chat.thread.created | Handler registered in dispatcher; Dispatch emits chat.thread.created; New empty thread displayed in chat panel | (EXAMPLE) |

ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect, UICommand:cmd.lsp.goto_definition, UICommand:cmd.lsp.find_references, UICommand:cmd.widget.add, UICommand:cmd.widget.remove, UICommand:cmd.graph.select_node, UICommand:cmd.graph.retry_node, UICommand:cmd.orchestrator.switch_tab, UICommand:cmd.chat.new

---

<a id="section-3"></a>
## 3. JSON Example

A machine-readable wiring matrix conforms to `Plans/Wiring_Matrix.schema.json`.
Below are 3 representative entries illustrating the JSON format:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "schema_id": "pm.wiring_matrix.v0",
  "generated_at": "2026-02-24T00:00:00Z",
  "entries": {
    "btn.github.connect": {
      "ui_element_id": "btn.github.connect",
      "ui_location": "Settings > GitHub/Auth",
      "ui_command_id": "cmd.github.connect",
      "handler_location": "handlers::github_auth::connect",
      "expected_event_types": [
        "auth.github.device_code.issued",
        "auth.github.token.polling",
        "auth.github.authenticated",
        "auth.github.failed"
      ],
      "acceptance_checks": [
        "Handler registered in dispatcher",
        "Dispatch emits expected events in order",
        "UI element rendered in Settings > GitHub/Auth surface"
      ],
      "evidence_required": "evidence/wiring/cmd.github.connect.json"
    },
    "menu.lsp.goto_def": {
      "ui_element_id": "menu.lsp.goto_def",
      "ui_location": "File Editor context menu",
      "ui_command_id": "cmd.lsp.goto_definition",
      "handler_location": "handlers::lsp::goto_definition",
      "expected_event_types": [
        "tool.invoked"
      ],
      "acceptance_checks": [
        "Handler registered in dispatcher",
        "Dispatch emits tool.invoked with tool_name=lsp",
        "Editor navigates to definition location"
      ],
      "evidence_required": "evidence/wiring/cmd.lsp.goto_definition.json"
    },
    "btn.widget.add": {
      "ui_element_id": "btn.widget.add",
      "ui_location": "Dashboard widget picker",
      "ui_command_id": "cmd.widget.add",
      "handler_location": "handlers::widget_layout::add",
      "expected_event_types": [],
      "acceptance_checks": [
        "Handler registered in dispatcher",
        "Widget instance added to layout state",
        "Widget rendered in target page grid"
      ],
      "evidence_required": "evidence/wiring/cmd.widget.add.json"
    }
  }
}
```

ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord

---

<a id="section-4"></a>
## 4. Verification

Wiring matrix entries are verified by **GATE-010** (see `Plans/Progression_Gates.md`).

### 4.1 Schema validation
All wiring matrix JSON artifacts MUST validate against `Plans/Wiring_Matrix.schema.json`.
GATE-010 runs JSON Schema validation as its first check.

### 4.2 Coverage
Every `cmd.*` ID in `Plans/UI_Command_Catalog.md` MUST have at least one wiring matrix entry.
GATE-010 extracts all command IDs from the catalog and verifies each has a corresponding entry.

### 4.2.1 One element, one command enforcement
Every `entries` key is a unique `ui_element_id`, so duplicates are invalid by structure.
GATE-010 also checks each row's `ui_element_id` value matches its key to prevent accidental drift.

### 4.3 Handler resolution
Every `handler_location` in the wiring matrix MUST resolve to an existing module and function in the codebase.
GATE-010 parses module paths (e.g., `handlers::github_auth::connect`) and verifies the target exists in `puppet-master-rs/src/`.
The canonical format is `(crate::)?module(::submodule)+::function`, with the final segment naming the callable handler symbol. When resolution fails, GATE-010 evidence MUST record the owning `ui_element_id`, `ui_command_id`, unresolved `handler_location`, and the candidate files/modules inspected so the failure is actionable.

### 4.4 Event tests
Every wiring matrix entry with non-empty `expected_event_types` MUST have a corresponding dispatch test that:
1. Invokes the command through the dispatcher.
2. Asserts that all declared event types are emitted in the expected order.
3. Asserts that no undeclared event types are emitted.

GATE-010 checks that matching test functions exist and pass.

ContractRef: Gate:GATE-010, Invariant:INV-011, Invariant:INV-012, SchemaID:Wiring_Matrix.schema.json

---

## References
- `Plans/UI_Wiring_Rules.md` — UI wiring rules and dispatcher boundary
- `Plans/Wiring_Matrix.schema.json` — JSON Schema for machine-readable wiring entries
- `Plans/UI_Command_Catalog.md` — Canonical command ID definitions
- `Plans/Contracts_V0.md` — Core contracts (UICommand, EventRecord)
- `Plans/Progression_Gates.md` — Gate definitions including GATE-010

## Scheduler/Remediation/Event Wiring Addendum (2026-03-08)

Add the following producer -> consumer paths to the wiring matrix.

### 1. Scheduler analysis

- canonical event: `scheduler.pass` (legacy alias: `run.scheduler_analysis`)
- producer: executor/orchestrator scheduler pass
- consumers: Run Graph View queue-analysis panel, storage `scheduler_pass_record` projection, usage/analytics dashboard
- storage projection: `scheduler_pass.{run_id}.{scheduler_pass_id}`

### 2. Blocked/unblocked

- canonical events: `node.blocked`, `node.unblocked`, `wizard.blocked`, `wizard.unblocked` (legacy aliases: `run.node_blocked`, `run.node_unblocked`)
- producer: executor/orchestrator blocked-state manager
- consumers: Run Graph View node badge/detail, assistant-chat blocked_notice, dashboard blocked-count badge, storage `blocked_projection`
- storage projection: `blocked_projection.{run_id}.{node_id}.{blocked_sequence}`

### 3. Safe points
- producer: mutation-capable attempt dispatcher / retry controller
- canonical events: `safe_point.created`, `safe_point.restored`
- consumers: runtime recovery logic, Run Graph detail panel, audit/debug surfaces

### 4. Remediation lineage

- canonical events: `remediation.spawned`, `remediation.resolved` (legacy aliases: `run.remediation_started`, `run.remediation_completed`)
- producer: executor/orchestrator remediation manager
- consumers: Run Graph View remediation lineage tree, storage `remediation_lineage_record`, dashboard remediation badge
- storage projection: `remediation.{run_id}.{remediation_root_id}`

### 5. Degradation evidence
- producer: draft decomposition/planning pipeline
- canonical event: `plan.decomposition_degraded`
- consumers: wizard/interview planning UI, storage projections, audit/debug surfaces
## Runtime Recovery Wiring Addendum (2026-03-09)

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery packet minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
## Canonical Runtime Event Wiring Reconciliation Addendum (2026-03-09)

The wiring matrix MUST use the canonical runtime names and identities from `Plans/Contracts_V0.md`.

### Canonical runtime event minimum rows
- producer: scheduler/executor
  - canonical event: `scheduler.pass`
  - identity: `scheduler_pass_id`
  - consumers: storage pass projection, Run Graph, Orchestrator Page, analytics/debug surfaces
- producer: executor/orchestrator/auth/permissions/HITL/FileSafe/worktree/plugins
  - canonical events: `node.blocked`, `node.unblocked`, `node.prerequisite_resolved`
  - consumers: blocked projections, Run Graph, Orchestrator Page, assistant thread/banner surfaces
- producer: remediation controller
  - canonical events: `remediation.spawned`, `remediation.resolved`
  - consumers: remediation lineage storage, Run Graph, Orchestrator Page, artifacts/evidence views
- producer: graph builder / replan reconciler
  - canonical events: `run.graph_canonical_locked`, `run.graph_integrity_failed`
  - consumers: executor admission logic, progression gates, blocked/replan surfaces

### UI command handler rule
Recovery UI handlers MUST be keyed by canonical `allowed_action_id` families and then bind any domain-specific command ids using the blocked payload metadata.
## Canonical Runtime Producer Consumer and Action Wiring Reconciliation Addendum (2026-03-09)

Add canonical rows for:
- `node.ready`
- `scheduler.pass`
- `node.blocked`
- `node.unblocked`
- `safe_point.created`
- `safe_point.restored`
- `remediation.spawned`
- `remediation.resolved`

Each row MUST identify:
- producer
- persisted record
- UI consumers
- policy consumers
- replay/recovery expectations
- command surfaces that act on the resulting state
## Runtime Recovery Producer / Consumer Wiring
### Minimum required rows

The following rows are required for the promoted Section 15 feature set in addition to the runtime recovery rows already required elsewhere.

| UI element / surface | UICommand ID | Producer | Consumer / handler | Required effect |
|---|---|---|---|---|
| Project switcher result row | `cmd.project.switch_active_tab` | Projects view / command palette | shell state controller | Switch active workspace tab to target project and recalc effective state |
| Project switcher alternate action | `cmd.project.open_in_new_workspace_tab` | Projects view / command palette | shell state controller | Open target project in a new workspace tab |
| Thread context hover `More Details` | `cmd.chat.open_thread_context_details` | chat header hover module | chat layout / editor-tab controller | Open or focus the canonical thread Context Detail Pane |
| Thread context click `Compact Now` | `cmd.chat.compact_context` | chat header click affordance | chat runtime controller | Trigger canonical thread compaction |
| Restore-and-branch CTA | `cmd.chat.branch_from_restore` | History / restore UI | thread/session controller | Create new thread/session branch from restore point |
| Browser toolbar `Open in Browser` | `cmd.browser.open_workspace_preview` | file preview / command palette / open action | browser-session controller | Create or focus the canonical `workspace_preview` browser session |
| Browser toolbar `Open in Detached Browser` | `cmd.browser.open_detached_preview` | file preview / command palette / open action | browser-session controller | Create or focus the canonical `detached_preview` browser session |
| Browser toolbar `Focus Browser` | `cmd.browser.focus_browser_tab` | browser chrome / command palette | browser-session controller | Focus the owning canonical browser session |
| Browser toolbar `Detach Browser` | `cmd.browser.detach_browser_tab` | browser chrome | browser-session controller | Convert the owning normal browsing session into detached presentation without inventing a new logical browser subject |
| Browser toolbar `Open DevTools` | `cmd.browser.open_devtools` | browser chrome / command palette | browser-session controller / DevTools host | Open DevTools for the focused browser session |
| Browser toolbar `Toggle DevTools Dock` | `cmd.browser.toggle_devtools_dock` | browser chrome / DevTools chrome | DevTools host | Switch the focused browser DevTools between docked layouts |
| Browser toolbar share button | `cmd.browser.share_with_agent` | browser chrome | browser context controller | Mark current browser subject shared with active thread |
| Browser toolbar revoke button | `cmd.browser.revoke_share_with_agent` | browser chrome / attention center | browser context controller | Clear shared-with-agent state |
| Browser toolbar `Pick Element for Chat` | `cmd.browser.pick_element_for_chat` | browser chrome | browser context controller | Capture explicit `browser_element_context` into composer-prep state |
| Browser toolbar `Add Selection to Chat` | `cmd.browser.add_selection_to_chat` | browser chrome | browser context controller | Capture explicit `browser_selection_context` into composer-prep state |
| Browser toolbar `Add Selection + Screenshot` | `cmd.browser.add_selection_screenshot_to_chat` | browser chrome | browser context controller / runtime-artifact controller | Capture browser context and screenshot evidence for chat |
| Browser toolbar `Add Selection + Full Screenshot` | `cmd.browser.add_selection_full_screenshot_to_chat` | browser chrome | browser context controller / runtime-artifact controller | Capture browser context and full screenshot evidence for chat |
| Browser toolbar `Add Screenshot to Chat` | `cmd.browser.add_screenshot_to_chat` | browser chrome | runtime-artifact controller / chat prep controller | Capture screenshot artifact and stage it for chat |
| Browser toolbar `Add Full Screenshot to Chat` | `cmd.browser.add_full_screenshot_to_chat` | browser chrome | runtime-artifact controller / chat prep controller | Capture full screenshot artifact and stage it for chat |
| Browser takeover prompt default action | `cmd.browser.take_over` | live browser takeover prompt | browser-session controller / runtime controller | Pause the live automation browser and keep the visible session in focus |
| Browser action `Pause Agent` | `cmd.browser.pause_agent` | browser chrome / automation banner | runtime controller | Pause the live automation run without reclassifying the browser session |
| Browser action `Let agent continue` | `cmd.browser.let_agent_continue` | live browser takeover prompt | runtime controller | Dismiss takeover without interrupting live automation |
| Browser action `Stop agent and keep browser` | `cmd.browser.stop_agent_keep_browser` | live browser takeover prompt | runtime controller / browser-session controller | Stop automation work while preserving the visible browser session |
| Browser action `Promote to Normal Browsing` | `cmd.browser.promote_to_normal_browsing` | browser chrome / automation banner | browser-session controller / storage controller | Promote eligible state into a normal browsing session and update restore behavior |
| Browser recovery banner `Reopen` | `cmd.browser.reopen` | browser recovery banner / attention center | browser-session controller | Recreate a recoverable browser session after failure |
| Browser recovery banner `Retry` | `cmd.browser.retry` | browser recovery banner / attention center | browser-session controller / runtime controller | Retry the failed browser launch or action path |
| Browser recovery banner `Keep Closed` | `cmd.browser.keep_closed` | browser recovery banner / attention center | browser-session controller | Keep the failed browser session closed while preserving auditability |
| Chat command card `Open in Terminal` | `cmd.terminal.show` | assistant chat command card | terminal workspace controller | Reveal the exact existing section or tab or pane or historical receipt bound to the referenced terminal session |
| Command palette `New Terminal` | `cmd.terminal.new_tab` | command palette / terminal header | terminal workspace controller / process-host controller | Create a new terminal tab and session in the chosen section |
| Terminal pane chrome `Split` | `cmd.terminal.split_pane` | terminal pane chrome | terminal workspace controller / process-host controller | Create a new pane and bound terminal session with deterministic split direction |
| Output or Problems or Ports `Show Terminal` link | `cmd.terminal.focus_session` | derived runtime surfaces | terminal workspace controller | Focus the owning terminal session without spawning a duplicate shell |
| Terminal tab context `Move to Other Section` | `cmd.terminal.move_tab_to_section` | terminal tab context menu | terminal workspace controller | Move the tab between sections while preserving tab and session identity |
| Terminal tab inline rename | `cmd.terminal.rename_tab` | terminal tab chrome | terminal workspace controller | Update visible tab label without changing session identity |
| Terminal tab pin toggle | `cmd.terminal.pin_tab` | terminal tab chrome | terminal workspace controller | Toggle pin state and update bulk-close behavior |
| Terminal pane close affordance | `cmd.terminal.close_pane` | terminal pane chrome | terminal workspace controller | Close the pane and apply explicit termination policy if a live session is attached |
| Terminal tab close affordance | `cmd.terminal.close_tab` | terminal tab chrome | terminal workspace controller | Close the tab and its pane tree with explicit termination behavior when needed |
| Terminal toolbar `Clear` | `cmd.terminal.clear_scrollback` | terminal toolbar / command palette | terminal session controller | Clear retained scrollback without minting a new runtime identity |
| Terminal toolbar `Restart` | `cmd.terminal.restart_session` | terminal toolbar / recovery banner | terminal session controller / process-host controller | Replace the runtime with a new terminal session bound to the chosen pane or tab |
| Terminal toolbar `Terminate` | `cmd.terminal.terminate_session` | terminal toolbar | terminal session controller / process-host controller | Request graceful shutdown for the selected live session |
| Terminal recovery action `Kill` | `cmd.terminal.kill_session` | terminal toolbar / recovery banner | terminal session controller / process-host controller | Force termination for the selected live session |
| Terminal section header `Detach` | `cmd.terminal.detach_section` | terminal section header / command palette | shell layout controller | Present the chosen terminal section in a detached window without changing section identity |
| Detached terminal window `Reattach` | `cmd.terminal.reattach_section` | detached terminal window chrome | shell layout controller | Return the section to docked layout with preserved tab and pane state |
| Chat live-tool action | `cmd.dev.start_session` | chat action / toolbar | dev-session controller | Start dev session and route output to linked shell panes |
| Dev stop button | `cmd.dev.stop_session` | toolbar / ports / terminal | dev-session controller | Stop active dev session deterministically |
| Dev restart button | `cmd.dev.restart_session` | toolbar / ports / terminal | dev-session controller | Restart the dev session and refresh linked shell surfaces |
| Dev status row `Show Output` | `cmd.dev.show_output` | chat status row / toolbar | runtime-surfaces controller | Reveal Output linked to the owning dev session |
| Dev status row `Show Problems` | `cmd.dev.show_problems` | chat status row / toolbar | runtime-surfaces controller | Reveal Problems linked to the owning dev session |
| Dev status row `Show Ports` | `cmd.dev.show_ports` | chat status row / toolbar | runtime-surfaces controller | Reveal Ports linked to the owning dev session |
| Catalog install button | `cmd.catalog.install_item` | catalog UI | catalog lifecycle controller | Install target item and propagate subsystem effects |
| Catalog remove button | `cmd.catalog.remove_item` | catalog UI | catalog lifecycle controller | Remove item using subsystem-specific active-item rules |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md

This section is normative and not an example/template section.
## Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)

This wiring addendum also covers Search, File Manager action handoff, chat restore/file-reference actions, and host-aware LSP/remote projections because those seams now share one shell slot and one cross-surface identity model.

| Surface / flow | Canonical command / route | Owner doc | Downstream consumers / notes |
|---|---|---|---|
| Show Search panel | `cmd.search.show` | `Plans/FinalGUISpec.md` + `Plans/UI_Command_Catalog.md` | Right-hand side panel owner for find/replace-in-files |
| Run find/replace in files | `cmd.search.find_in_files`, `cmd.search.replace_in_files` | `Plans/UI_Command_Catalog.md` | Query-session state persists in `Plans/storage-plan.md`; remote execution rules live in `Plans/GitHub_Integration.md` |
| Open Search result | `cmd.search.open_result` | `Plans/UI_Command_Catalog.md` | Uses shared open-file contract from `Plans/FileManager.md` |
| File-tree actions | `cmd.file.*` | `Plans/FileManager.md` + `Plans/UI_Command_Catalog.md` | Reuse FileSafe-backed transfer/mutation path |
| Add file to chat | `cmd.chat.add_file_reference` | `Plans/assistant-chat-design.md` | Visible composer chips; file-only in MVP |
| Revert last agent edit | `cmd.chat.revert` | `Plans/assistant-chat-design.md` | Refreshes editors via canonical mutation pipeline |
| Rewind chat only | `cmd.chat.rewind` | `Plans/assistant-chat-design.md` | Must not restore files |
| Source Control subview switch | `cmd.source_control.switch_subview` | `Plans/GitHub_Integration.md` | Keeps Source Control in the right-hand side-panel slot |
| Diff compare target / search / hunks | `cmd.git.diff_set_compare_target`, `cmd.git.diff_search`, `cmd.git.stage_hunks`, `cmd.git.unstage_hunks`, `cmd.git.discard_hunks`, `cmd.git.conflict_apply_resolution` | `Plans/GitHub_Integration.md` | Diff-local search stays Source Control owned |
| Host-aware LSP session projection | `(host_id, server_id, root_identity)` session key | `Plans/LSPSupport.md` | Consumed by editor, Problems, status, and persistence |
| Remote reconnect | `cmd.remote.reconnect` | `Plans/GitHub_Integration.md` | One bounded auto-retry precedes this explicit action |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md
