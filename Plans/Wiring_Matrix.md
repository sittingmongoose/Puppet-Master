# Wiring Matrix (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Route/open compatibility-only fallback marking
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

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Gate:GATE-010

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
Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibility shortcuts.
Terminal command-catalog coverage is not satisfied by `cmd.dev.start_session` and `cmd.dev.stop_session` alone; terminal action coverage includes reveal, show, rerun, split, close, clear, restart, terminate, kill, detach, reattach, and focus-session wiring rows with matching acceptance checks.
When route/subject-aware matrix cells are backfilled, the old work-item ledger `w-20260316-160450` lines 748-941 may be used only as source-lineage evidence for per-cell justification; it does not replace generated JSON entries, and each incorporated detail must land in explicit `ui_element_id`, `ui_command_id`, handler, event, acceptance-check, and evidence fields.

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

### 4.5 Gate/schema limits and owner references

Wiring_Matrix and UI_Wiring_Rules / `UI_Wiring_Rules.md` share the `/docs` and `/consumer` boundary for recovery wiring, but the matrix must still expose exact structural limits: `cmd.runtime` / `cmd.runtime.*` CTAs need dispatcher-level producer/consumer rows, stale-projection revalidation, `correlation_id` trace-through, `allowed_action_ids`, and `allowed_action_ids[]`. `Wiring_Matrix.schema.json`, `schema.json`, `/matrix/gate`, command-family coverage, and deprecated-vs-canonical command-family status are gate inputs until generated matrix rows can represent them directly.

Extraction hazards are explicit gate failures, not real command IDs: regex-style scans must distinguish catalog IDs from filename-shaped `cmd.*.json`, generic `cmd.*` prose, command-family references, and `schema.json` evidence names. GUI side-panel targets such as Unraid and shell commands such as `cmd.panel.switch` require route/panel owner proof before `/evidence` can count them as wired.

Route-aware gate evidence is shared with `Plans/Wiring_Matrix.md` / `/Wiring_Matrix.md`, `Plans/Progression_Gates.md` / `/Progression_Gates.md`, and `evidence.schema.json`; `/gate/evidence` records must show `GATE`, `GATE-010`, `/route`, route-aware checks, first-class `OpenSubject`, `cmd.nav` / `cmd.nav.*` alias handling, wrapper-to-canonical consistency, blocked-action admissibility, and projection-trust preconditions when those concepts are claimed.

Runtime owner references remain split by contract: Contracts_V0 / `Contracts_V0.md` names `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point`, and `safe_point.*`; Prompt_Pipeline / `Prompt_Pipeline.md` owns immutable attempt-start handoff context; storage-plan / `storage-plan.md` owns `attempt_record` and `blocked_projection`.

Command/wiring ownership must keep `cmd.chat.run_user_command`, `/compact`, `/mode`, runtime-mode, slash-command, `IDs`, `GUI`, `{ mode }`, `/wiring`, command-owner, command-system, and reverse-coverage visible until the catalog, command-system, and matrix agree on canonical dispatch boundaries.

`Wiring_Matrix` / `Wiring_Matrix.md` remains a wiring-row owner, not a general runtime schema: `/recovery` producer/consumer prose may require widened evidence, but `Wiring_Matrix.schema.json` and `schema.json` still validate matrix shape until a separate producer/consumer matrix is adopted.

Route/open compatibility evidence references `Plans/Contracts_V0.md` / `/Contracts_V0.md` for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes. Runtime-artifact, chat, catalog, and file-open consumer references remain `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_Panel.md`, `Plans/assistant-chat-design.md` / `/assistant-chat-design.md`, `Plans/UI_Command_Catalog.md` / `/UI_Command_Catalog.md`, and `Plans/FileManager.md` / `/FileManager.md`.

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
## Runtime recovery wiring requirements (2026-03-09)

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery wiring minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
## Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)

The wiring matrix MUST use the canonical runtime names and identities from `Plans/Contracts_V0.md`.

### Canonical runtime event minimum rows
- producer: scheduler/executor
  - canonical event: `scheduler.pass`
  - identity: `scheduler_pass_id`
  - consumers: storage pass projection, Run Graph, Orchestrator Page, analytics/debug surfaces
- producer: executor attempt dispatcher / retry controller
  - canonical events: `attempt.started`, `attempt.completed`
  - persisted record: `attempt_record`
  - consumers: storage attempt projection, Run Graph attempt detail, history/evidence tabs, scheduler retry logic, safe-point and remediation recovery flows
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
## Canonical Runtime Producer Consumer and Action Wiring Canonical Alignment (2026-03-09)

### Context Lens minimum rows

| Producer | Consumer | Payload / Contract | Notes |
| --- | --- | --- | --- |
| `cmd.chat.context_lens.toggle` | Assistant chat header controller | toggle request for the top-right Context Lens icon/dropdown | Opens or closes the Context Lens control to the right of the search bar. |
| `cmd.chat.context_lens.set_mode` | Assistant chat thread projection and selection overlay | mode = `mute` \| `focus` \| `subcompact` | Establishes one active Context Lens mode at a time. |
| `cmd.chat.context_lens.turn_off` | Assistant chat thread projection and selection overlay | clear active mode and clear transient selection state | Mirrors the `Turn Off` dropdown action in the PM concept. |
| `cmd.chat.context_lens.toggle_message_selection` | Thread-local context overlay store | message ids[] selection mutation under the current mode | Multi-select is supported in all Context Lens modes. |
| `cmd.chat.context_lens.clear_selection` | Thread-local context overlay store | clear current selection set for the current mode | Clears pending selection without changing persistent canonical history. |
| `cmd.chat.context_lens.apply_subcompact` | Subcompact summarizer and effective-context assembler | selected message ids[] -> local summary replacement in effective context | `Subcompact` is explicit-apply and remains distinct from automatic dynamic context shrinking. |
| `cmd.chat.context_lens.revert_subcompact` | Thread-local context overlay store and effective-context assembler | restore original selected message block into effective assembly | Rehydration uses canonical source messages rather than already-compressed derivatives. |

ContractRef: Context Lens wiring MUST remain thread-local, must support multi-select in all modes, and must keep `Subcompact` as an explicit apply/revert path distinct from automatic dynamic context shrinking. [Source: assistant-chat-design.md#176-context-lens-mute--focus--subcompact; Prompt_Pipeline.md#dynamic-context-shrinking]

The wiring above is part of the canonical chat control surface and must remain aligned with the command catalog, final GUI placement, and effective-context assembly rules.
ContractRef: Wiring rows for Context Lens MUST remain aligned with command IDs, chat placement, and overlay persistence semantics; a packet may not leave those elements split between unrelated addenda. [Source: UI_Command_Catalog.md#context-lens-command-set; FinalGUISpec.md#context-lens-placement-and-behavior]

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
The following rows are required for the promoted Section 15 feature set and the reconciled terminal/editor integration model.

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
| Chat command card `Open in Terminal` | `cmd.terminal.open` | assistant chat command card | terminal workspace controller | Reveal the exact existing session, workgroup, leaf pane, or historical receipt bound to the referenced terminal runtime |
| Chat command card `Show Terminal` | `cmd.terminal.show` | assistant chat command card / derived runtime surfaces | terminal workspace controller | Focus the same live or historical terminal session already bound to the card context |
| Chat command card `Rerun in Terminal` | `cmd.terminal.rerun` | assistant chat command card | terminal workspace controller / process-host controller | Replay the command through the terminal launch context without collapsing it into show/focus |
| Terminal command card `Detach/Pop-Out` | `cmd.terminal.detach` | assistant chat command card / terminal surfaces | terminal workspace controller | Detach the referenced terminal session or pane while preserving terminal identity |
| Command palette `New Terminal` | `cmd.terminal.new_tab` | command palette / terminal header | terminal workspace controller / process-host controller | Create a new workgroup or new root terminal tab in the chosen section |
| Terminal workgroup pill | `cmd.terminal.activate_workgroup` | bottom workgroup strip | terminal workspace controller | Activate the target terminal workgroup and reveal its subtabs |
| Terminal subtab chip | `cmd.terminal.activate_subtab` | subtab row | terminal workspace controller | Focus the target leaf pane within the active workgroup |
| Terminal workgroup drag-reorder | `cmd.terminal.reorder_workgroup` | workgroup strip | terminal workspace controller | Reorder workgroups without changing leaf pane identity |
| Terminal subtab drag-reorder | `cmd.terminal.reorder_subtab` | subtab row | terminal workspace controller | Swap or reorder leaf panes inside the same workgroup tree |
| Terminal pane chrome `Split` | `cmd.terminal.split_pane` | terminal pane chrome | terminal workspace controller / process-host controller | Create a new leaf pane and bound terminal session with deterministic split direction |
| Terminal strip `Add Pane` | `cmd.terminal.add_leaf` | bottom strip action cluster | terminal workspace controller / process-host controller | Add a new leaf pane to the active workgroup |
| Terminal editor drop target | `cmd.terminal.embed_in_editor` | editor drop host | terminal workspace controller | Add the dropped pane reference to the editor terminal panel stack |
| Editor terminal panel close | `cmd.terminal.remove_from_editor` | editor terminal panel chrome | terminal workspace controller | Remove the pane reference from the editor stack without destroying the underlying terminal session |
| Editor terminal stack `Undock All` | `cmd.terminal.undock_all_from_editor` | editor terminal stack chrome | terminal workspace controller | Clear all editor panel references for the current stack |
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

Terminal wiring owner split: `Plans/Section15_MVP_Promoted_Features_Spec.md §3.14` owns terminal section/tab/pane/session identity, `/reveal` and focus behavior, interaction modes, shell-integration disclosure, lifecycle states, capability `/degradation`, and non-ship terminal-core rules; `storage-plan.md` owns `/runtime-queryable` persistence for `terminal_workspace_state`, `terminal_session_record`, `terminal_command_block`, `dev_session_record`, renderer state, shell-integration tier, capability degradations, restore outcome, and transcript-retention tier. `UI_Command_Catalog.md` and this Wiring Matrix expose the controller split between terminal workspace controller, terminal session controller, process-host controller, dev-session controller, and runtime-surfaces controller; restart or `/replacement` mints a new runtime identity only when the command says so.

Terminal workspace-structure commands must distinguish content-only actions from destructive workspace mutations: `replace-with-new-terminal` keeps the pane slot and attaches a new live-session `terminal_session_id`, `/close` removes pane/tab/section workspace structure only after user-visible `/escalation` and `/cleanup` rules, `/disconnected/review-only` and other non-live panes can be replaced without pretending the old session remains live, and clear or `/reset` affects terminal content without implying restart.

Terminal/editor wiring treats `Concepts/PMConcept.html` (`/PMConcept.html`) as GUI concept lineage only while preserving the command coverage implied by that concept. Wiring rows cover `/workgroup` activation, active-group `/subtab` focus, split-pane tree operations, editor-integrated multi-panel terminal stacks, pane/subtab/workgroup `/drop` payloads, `/center/right` strip regions, `/right` action clusters for split `/add/collapse`, visible gutters and `/resizers`, accent-led subtab focus, command-log removal, and the rule that split-parent opacity effects must not dim terminal grids during reorder or drag operations.

### Browser session, capture, and recovery wiring invariants

- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/capability-degradation` model.
- Browser runtime wiring assumes the CEF-class, tab-first, in-app `/browser` model: `workspace_preview` is the user-facing editor/browser session, `detached_preview` is the same subject in a detached-window when supported, `automation_session` is a visible `/watchable`, agent-driven, evidence-producing web-app/testing session, and `auth_session` is a separate visible `/device/browser` flow for site-specific auth with an isolated `/cookie` and storage boundary.
- `auth_session` is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success, and normal selection, `/copy/paste`, `/share`, and capture interactions remain available unless the normal permission-layer blocks them.
- Live `automation_session` direct user input routes through user-takeover wiring: prompt actions are `Take over and pause agent`, `Let agent continue`, and `Stop agent and keep browser`; default highlighted action is `Take over and pause agent`; user-takeover leaves no half-owned session, and `/stop/take-over` or `/stop/take` handling must pause, stop, or take over rather than silently auto-resume work.
- Browser capture is explicit, chip-based, share-to-chat, and non-auto-send: ordinary clicks do not inject `/context`; `/highlight/share-to-chat`, `/highlight/share`, `/highlighting`, `/highlight`, `/elements`, `/selection`, `/DOM`/DOM, URL, and source anchors create removable pending composer chips, allow multi-capture, and attach to an active `/thread` or open a new thread when needed.
- Browser capture commands include `Add Selection to Chat`, `Pick Element for Chat`, `Add Selection + Screenshot`, `Add Element + Screenshot`, standalone screenshots, and screenshot-with-selection variants; screenshot-with-selection defaults to clipped context while full viewport remains explicit; `/trace/video`, `/video/screenshot`, and `/download` artifacts route through Runtime Artifacts.
- DevTools is a concrete browser UX/tool contract: `Open DevTools` and `Toggle DevTools Dock` are user-visible wiring rows; `/tool` and advanced testing permissions allow when user explicitly opens DevTools or policy permits attach/open, and named actions remain first-class `/capability` paths instead of forcing arbitrary browser-code.
- Recovery wiring preserves URL, tabs, session class, `/originating` session identity, and completed trace/video/screenshot artifacts; `workspace_preview` can restore, eligible `detached_preview` follows its originating restored session, automation/auth never auto-resume active work, auth never auto-complete, attention-required recovery offers `Reopen`, `Retry`, or `Keep Closed`, and cross-platform CEF runtime `/install/update` failures surface `runtime_unavailable`/`/capability-degradation` rather than hidden fallback.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md

This section is normative and not an example/template section.
### Debug investigation minimum rows

The following rows are additionally required for Debug Mode and Investigation Context wiring.

| UI element / surface | UICommand ID | Producer | Consumer / handler | Required effect |
|---|---|---|---|---|
| Assistant mode strip `Debug` | `cmd.chat.mode` | chat header mode strip | session mode controller | switch the thread into Debug overlay and focus the active investigation or target picker |
| Slash command `/mode debug` | `cmd.chat.mode` | slash-command dispatcher | session mode controller | same canonical mode-switch behavior as the visible mode strip |
| Debug target picker button | `cmd.chat.open_debug_target_picker` | thread header / command palette | debug investigation controller | reveal canonical target discovery / rebinding flow |
| Investigation header `Export Bundle` | `cmd.chat.export_investigation_bundle` | Investigation Context card / Context Detail Pane | debug investigation controller / runtime-artifact controller | write bundle manifest and emit export event |
| Investigation item `Revoke` | `cmd.chat.revoke_investigation_item` | Investigation Context card / Context Detail Pane | debug investigation controller | mark the item revoked and exclude it from future prompt injection |
| Debug Automation banner `Approve` | `cmd.runtime.approve` | investigation banner / attention surface | runtime controller / permission controller | activate the requested run-scoped Debug Automation Profile |
| Debug Automation banner `Resume automation` | `cmd.runtime.resume_after_prerequisite` | investigation banner / attention surface | runtime controller / debug investigation controller | resume the current investigation automation from its paused step pointer after the prerequisite or handoff completes |
| Debug Automation banner `Retry this step` | `cmd.runtime.retry_now` | investigation banner / attention surface | runtime controller / debug investigation controller | retry the current paused investigation step or repro step without changing target, browser session, or investigation lineage |
| Debug Automation banner `Stop agent and keep browser` | `cmd.browser.stop_agent_keep_browser` | investigation banner / automation banner | runtime controller / browser-session controller | stop the agent automation while preserving the visible browser session for the current investigation |
| Debug Automation banner `Promote to normal browsing` | `cmd.browser.promote_to_normal_browsing` | investigation banner / automation banner | browser-session controller / storage controller / permission controller | promote eligible session state into normal browsing only after `explicit-confirmation`; do not silently promote the automation/auth session |
| Debug Automation banner `Cancel investigation` | `cmd.runtime.abort_run` | investigation banner / attention surface | runtime controller / debug investigation controller | cancel the current investigation run and record the investigation as `cancelled` with `stop_reason_code = investigation.cancelled_by_user` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

## Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)

### Assistant Worktree Wiring Addendum

Cross-component wiring for the assistant thread-to-worktree binding feature.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md

**Chat ↔ WorktreeManager wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Chat header button `Create Worktree` | WorktreeManager `create_worktree` | User clicks header button or `cmd.chat.worktree.create` | thread_id, branch_name, base_ref → worktree_id, path |
| Chat dropdown `Remove Worktree` | WorktreeManager `remove_worktree` | User confirms removal | worktree_id → success/error |
| Chat dropdown `Bind Existing` | WorktreeManager `list_worktrees` | User opens bind dialog | → unbound worktree list |
| Chat merge dialog | WorktreeManager `merge_worktree` | User confirms merge | worktree_id, target_branch, strategy → result |
| Chat merge dialog | WorktreeManager `create_pr` | User clicks Create PR | worktree_id, branch, target → pr_url |
| Auto-create (thread creation) | WorktreeManager `create_worktree` | `branching.assistant_auto_worktree` is true | thread_id, auto-generated branch name |

**Chat ↔ Source Control wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| SC Worktrees accordion `Open Thread` | Chat panel navigation | User clicks Open Thread in worktree row | thread_id → scroll to thread |
| SC Worktrees accordion expanded-row `Merge` / `PR` | Chat merge dialog / PR panel | User clicks Merge or PR in a thread-owned expanded-row | worktree_id, thread_id → merge dialog or PR panel |
| SC filter control | redb filter key | User changes filter | filter enum → persisted key |
| Chat worktree bound/unbound events | SC worktree list refresh | Seglog event processed | worktree_id → refresh row |

**Chat ↔ File Manager wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread switch (with worktree) | File manager root | Thread selected, `worktree_follow_thread` true | worktree_path → set FM root |
| Breadcrumb worktree toggle | File manager root | User clicks worktree crumb | toggle between worktree_path and project_root |
| Worktree unbound/removed | File manager root reset | Binding removed | → reset FM root to project_root |
| Chat `Open Worktree Files` | File manager panel | User clicks from header dropdown | worktree_path → open FM panel at path |

**Chat ↔ LSP wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread switch (with worktree) | LSP root_identity | Thread selected | worktree_path → LSP session key (host_id, server_id, root_identity) |
| Worktree created | LSP warm-start | New worktree available | worktree_path → background indexing |

**Chat ↔ Executor wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread with worktree enters Agent/Plan/Debug mode | Executor working_directory | Execution unit created | worktree_path → execution context |
| Pre-merge test | Executor | Merge dialog test phase | command, worktree_path → terminal execution |

Execution context population is deterministic: when a thread has a binding, `execution_unit_context.worktree_id = binding.worktree_id` and `execution_unit_context.working_directory = binding.worktree_path`; when unbound, `worktree_id = null` and `working_directory = project_root`.

Terminology for thread worktree binding, accordion layout, `working_directory`, merge lock, and pre-merge test gate stays in `Plans/Glossary.md` (`/Glossary.md` compatibility references); Wiring Matrix records producer/consumer edges only.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Run_Modes.md


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
| Source Control review, diff, and conflict actions | `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, `cmd.source_control.toggle_generated_filter`, `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, `cmd.source_control.mark_conflict_resolved`; `cmd.git.diff_set_compare_target { target_kind: "head"\|"index"\|"merge_base"\|"branch"\|"commit"\|"parent", ref? }`, `cmd.git.diff_search { query, direction?: "next"\|"prev" }`, `cmd.git.stage_hunks { path, hunk_ids: string[] }`, `cmd.git.unstage_hunks { path, hunk_ids: string[] }`, `cmd.git.discard_hunks { path, hunk_ids: string[] }`, and `cmd.git.conflict_apply_resolution { path, conflict_id, resolution: "ours"\|"theirs"\|"both" }` remain lower-level diff operations | `Plans/UI_Command_Catalog.md` + `Plans/WorktreeGitImprovement.md` | Review mode and Conflict assistant stay Source Control owned; `cmd.git.*` rows are lower-level diff/git operations, not substitutes for `cmd.source_control.*` GUI entrypoints. Diff-local `local-search` belongs to the git diff/review surface and must not route through project-wide `cmd.search.find_in_files`; `/hunk/conflict/search-in-diff` affordances route through Source Control review and the git diff command family. |
| Host-aware LSP session projection | `(host_id, server_id, root_identity)` session key | `Plans/LSPSupport.md` | Consumed by editor, Problems, status, and persistence |
| Remote reconnect | `cmd.remote.reconnect` | `Plans/GitHub_Integration.md` | One bounded auto-retry precedes this explicit action |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md


### Search Index Acceleration Wiring Addendum

Cross-component wiring for the sparse n-gram regex index that transparently accelerates grep and Search-panel regex.

Lifecycle, file-format, and remote-correctness canon remain owned by `Plans/storage-plan.md`, `Plans/GitHub_Integration.md`, and `Plans/Tools.md`. This addendum records cross-component edges only.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

**Grep tool <-> Index Engine wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Agent/subagent `grep` call | IndexEngine `query` | Tool invocation | pattern, path/glob filters -> candidate file IDs |
| Search-panel regex query | IndexEngine `query` | User executes find-in-files with regex ON | pattern, scope -> candidate file IDs |
| IndexEngine candidates | ripgrep verification | Query returns candidate set | file IDs -> paths -> verification on authoritative content -> final matches |
| PM-mediated file write | DirtyLayer `insert` | Tool write returns | path -> generation-aware dirty entry before write success is surfaced |
| File watcher event | DirtyLayer `insert` | External file change detected | path -> dirty entry (backup/dedup for PM writes) |
| Remote Git re-anchor | IndexBuilder `build_incremental` | staged dirty content + fetched diff ready | staged paths + `old_anchor..new_HEAD` diff -> changed-file set |

Freshness and dirty-layer wiring rules:
- PM-mediated writes insert into the dirty layer SYNCHRONOUSLY before returning success. This is the agent-write-then-grep CRITICAL FIX: agent tool writes, editor saves, and remote write relays add the written path before the caller can immediately grep, while file watchers remain backup/dedup for external changes.
- DirtyLayer storage is a `HashMap` with generation stamps, not a plain `HashSet`, so re-anchor clearing can distinguish entries created before and during a rebuild.
- On project open, background index build waits for the project-ready signal after file watcher, LSP, and Tantivy startup, then anchors to current Git `HEAD` / `SHA` or to a filesystem snapshot timestamp for non-Git projects.
- Crash recovery treats the dirty layer as in-memory cache state: if PM restarts and the anchor `SHA` / `HEAD` mismatch indicates movement, PM triggers automatic incremental rebuild. First grep after restart may use ripgrep fallback until rebuild completes, and there is no data loss because the index is only a cache.
- In MVP, remote cache refresh starts on project open, on a timer every 5 minutes after the previous fetch+build cycle completes, and on explicit pull or `/sync/refresh`; webhook or push notification remains aspirational. When fetch advances `HEAD`, PM immediately runs `git diff --name-only old_anchor..new_HEAD` (`name-only`) and inserts changed paths into the dirty layer BEFORE incremental rebuild. This closes the false-negative window between fetch and rebuild completion; generation-stamped entries are cleared only when the rebuild re-anchors safely.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

**Index build <-> Storage wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Project open | IndexBuilder `build_full` or `validate` | Project-ready signal | project_id + current anchor -> validation or full build |
| Git fetch (remote) | IndexBuilder `build_incremental` | New commits detected | `old_anchor..new_HEAD` diff -> dirty paths -> incremental rebuild |
| `cmd.search.rebuild_regex_index` | IndexBuilder `build_full` | User action or command | project_id -> full rebuild |
| Startup recovery | IndexSnapshot `load` | project open / app restart | highest valid generation -> checksum validation -> mmap / rebuild |
| IndexBuilder completion | ArcSwap publish | New generation ready | new `IndexSnapshot` -> atomic pointer swap through the `arc-swap` crate's production-proven, wait-free read-mostly `ArcSwap<T>` pattern used by tokio, hyper, and other production Rust projects |
| Status bar | IndexBuilder state | Build or refresh lasts >2s | build_state + progress -> `Indexing` / `Refreshing index` indicator |
| `cmd.search.evict_remote_cache` | RemoteCacheManager `evict_project` | User confirms per-project eviction | remove `r/{hash8}` cache root |
| `cmd.search.clear_all_remote_caches` | RemoteCacheManager `evict_all` | User confirms global clear | remove all remote cache roots |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
## Route-aware wiring reconciliation

### Route-aware navigation and open-contract rows

#### Acceptance carry-through
- Carry selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, and resume_url demotion into live route/open docs
- Carry Primitive:RouteTarget/OpenSubject and wrapper/canonical normalization into crosswalk and wiring docs

### Verification evidence hooks

#### Acceptance carry-through
- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough
- Add structured gate-specific evidence details for route-aware verification

### Compatibility-only fallback marking

#### Acceptance carry-through
- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Keep ref-family split explicit when route/open normalization is transferred

### Catalog-owned normalization metadata

`Plans/UI_Command_Catalog.md` and `/UI_Command_Catalog.md` own command identity and alias metadata; Wiring Matrix rows consume that catalog ownership rather than duplicating route semantics. The matrix command-binding contract still exposes `ui_element_id`, `ui_command_id`, `handler_location`, and `expected_event_types`, but route-aware completeness requires each wrapper command to declare when it normalizes over canonical route/open semantics. This keeps `/open` meaning in the route contract while letting wiring/gates verify that the command row points at the catalog-owned normalization metadata.

`GATE-010` completeness includes `GATE` coverage for route/subject-aware navigation, stale-projection revalidation, wrapper-to-canonical normalization, admissibility, and correlation passthrough. The clean rule for `/gates` is catalog-owned normalization metadata consumed by wiring/gates, not a second routing schema inside the matrix.

Owner-level runtime records remain a demotion hazard for wiring. `tier_runtime_record`, tier-keyed `usage_record`, and tier-keyed `evidence_record` need owner-level demotion or replacement before generated wiring rows treat them as canonical producers or consumers.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Wiring_Matrix.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### WM-001 - Wiring Matrix (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: WM-001
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Plans/Wiring_Matrix.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Wiring Matrix (Canonical)
- Canonical owner-section requirements
- Route/open compatibility-only fallback marking
- 0. Scope
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, Gate:GATE-010'
- 1. Template
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Gate:GATE-010'
- 2. Example Entries
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, SchemaID:Wiring_Matrix.schema.json'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect, UICommand:cmd.lsp.goto_definition, UICommand:cmd.lsp.find_references, UICommand:cmd.widget.add, UICommand:cmd.widget.remove, UICommand:cmd.graph.select_node, UICommand:cmd.graph.retry_node, UICommand:cmd.orchestrator.switch_'
- 3. JSON Example
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord'
- 4. Verification
- 4.1 Schema validation
- 4.2 Coverage
- 4.2.1 One element, one command enforcement
- 4.3 Handler resolution
- 4.4 Event tests
- 'ContractRef: Gate:GATE-010, Invariant:INV-011, Invariant:INV-012, SchemaID:Wiring_Matrix.schema.json'
- 4.5 Gate/schema limits and owner references
- References
- Scheduler/Remediation/Event Wiring Addendum (2026-03-08)
- 1. Scheduler analysis
- 2. Blocked/unblocked
negative_constraints:
- Terminal/editor wiring treats `Concepts/PMConcept.html` (`/PMConcept.html`) as GUI concept lineage only while preserving the command coverage implied by that concept. Wiring rows cover `/workgroup` activation, active-group `/subtab` focus, split-pane tree operations, editor-integrated multi-panel te
- '- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/'
- '- `auth_session` is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success, and normal selection, `/copy/paste`, `/share`, and capture interactions remain available unless the normal permission-layer blocks them.'
- '| Source Control review, diff, and conflict actions | `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, `cmd.source_control.toggle_generated_filter`, `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, `cmd.'
compatibility_only_notes:
- '### Route/open compatibility-only fallback marking'
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- Route/open compatibility evidence references `Plans/Contracts_V0.md` / `/Contracts_V0.md` for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes. Runtime-artifact, chat, catalog, and file-open consumer references remain `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_P
- '- canonical event: `scheduler.pass` (legacy alias: `run.scheduler_analysis`)'
- '- canonical events: `node.blocked`, `node.unblocked`, `wizard.blocked`, `wizard.unblocked` (legacy aliases: `run.node_blocked`, `run.node_unblocked`)'
- '- canonical events: `remediation.spawned`, `remediation.resolved` (legacy aliases: `run.remediation_started`, `run.remediation_completed`)'
- Terminology for thread worktree binding, accordion layout, `working_directory`, merge lock, and pre-merge test gate stays in `Plans/Glossary.md` (`/Glossary.md` compatibility references); Wiring Matrix records producer/consumer edges only.
- '### Compatibility-only fallback marking'
- '- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts'
stale_retired_dispositions:
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- 'Wiring_Matrix and UI_Wiring_Rules / `UI_Wiring_Rules.md` share the `/docs` and `/consumer` boundary for recovery wiring, but the matrix must still expose exact structural limits: `cmd.runtime` / `cmd.runtime.*` CTAs need dispatcher-level producer/consumer rows, stale-projection revalidation, `correl'
- '- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/'
- '- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough'
- '`GATE-010` completeness includes `GATE` coverage for route/subject-aware navigation, stale-projection revalidation, wrapper-to-canonical normalization, admissibility, and correlation passthrough. The clean rule for `/gates` is catalog-owned normalization metadata consumed by wiring/gates, not a seco'
owner_boundary_notes:
- '# Wiring Matrix (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- UI WIRING MATRIX SSOT
- '| `handler_location` | Canonical Rust module/function path (e.g., `handlers::github_auth::connect` or `crate::core::handlers::auth::connect`). |'
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- The canonical format is `(crate::)?module(::submodule)+::function`, with the final segment naming the callable handler symbol. When resolution fails, GATE-010 evidence MUST record the owning `ui_element_id`, `ui_command_id`, unresolved `handler_location`, and the candidate files/modules inspected so
- '### 4.5 Gate/schema limits and owner references'
- 'Wiring_Matrix and UI_Wiring_Rules / `UI_Wiring_Rules.md` share the `/docs` and `/consumer` boundary for recovery wiring, but the matrix must still expose exact structural limits: `cmd.runtime` / `cmd.runtime.*` CTAs need dispatcher-level producer/consumer rows, stale-projection revalidation, `correl'
- 'Extraction hazards are explicit gate failures, not real command IDs: regex-style scans must distinguish catalog IDs from filename-shaped `cmd.*.json`, generic `cmd.*` prose, command-family references, and `schema.json` evidence names. GUI side-panel targets such as Unraid and shell commands such as '
- Route-aware gate evidence is shared with `Plans/Wiring_Matrix.md` / `/Wiring_Matrix.md`, `Plans/Progression_Gates.md` / `/Progression_Gates.md`, and `evidence.schema.json`; `/gate/evidence` records must show `GATE`, `GATE-010`, `/route`, route-aware checks, first-class `OpenSubject`, `cmd.nav` / `cm
- 'Runtime owner references remain split by contract: Contracts_V0 / `Contracts_V0.md` names `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point`, and `safe_point.*`; Prompt_Pipeline / `Prompt_Pipeline.md` owns immutable attempt-start handoff context; storage-plan / `s'
- Command/wiring ownership must keep `cmd.chat.run_user_command`, `/compact`, `/mode`, runtime-mode, slash-command, `IDs`, `GUI`, `{ mode }`, `/wiring`, command-owner, command-system, and reverse-coverage visible until the catalog, command-system, and matrix agree on canonical dispatch boundaries.
- '`Wiring_Matrix` / `Wiring_Matrix.md` remains a wiring-row owner, not a general runtime schema: `/recovery` producer/consumer prose may require widened evidence, but `Wiring_Matrix.schema.json` and `schema.json` still validate matrix shape until a separate producer/consumer matrix is adopted.'
- Route/open compatibility evidence references `Plans/Contracts_V0.md` / `/Contracts_V0.md` for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes. Runtime-artifact, chat, catalog, and file-open consumer references remain `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_P
- '- `Plans/UI_Wiring_Rules.md` — UI wiring rules and dispatcher boundary'
- '- `Plans/UI_Command_Catalog.md` — Canonical command ID definitions'
- Add the following producer -> consumer paths to the wiring matrix.
- '- canonical event: `scheduler.pass` (legacy alias: `run.scheduler_analysis`)'
- '- canonical events: `node.blocked`, `node.unblocked`, `wizard.blocked`, `wizard.unblocked` (legacy aliases: `run.node_blocked`, `run.node_unblocked`)'
- '- canonical events: `safe_point.created`, `safe_point.restored`'
- '- canonical events: `remediation.spawned`, `remediation.resolved` (legacy aliases: `run.remediation_started`, `run.remediation_completed`)'
- '- canonical event: `plan.decomposition_degraded`'
owner_hints:
- Plans/Wiring_Matrix.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `b1b5c11a92299e43899c9697d2a6a58b37cdb1b3ba7360c956f7cddfee7cf4b6`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Wiring_Matrix-S0001` through `Wiring_Matrix-S0043` are preserved in place and mapped in `coverage_map.jsonl` to `WM-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

