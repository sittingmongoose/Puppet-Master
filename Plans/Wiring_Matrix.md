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
The current production GUI/PMConcept repair artifact is `Plans/Wiring_Matrix.production.json`; `Plans/Wiring_Matrix.production.exclusions.json` records generic, parser, glob, or compatibility-only command-family tokens that are not valid production wiring rows.

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

## GUI / PMConcept production wiring repair addendum (2026-07-02)

This addendum closes the GUI wiring defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation code, runtime dispatch, generated governance artifacts, or a governance seal.

### Production JSON artifact

`Plans/Wiring_Matrix.production.json` is the production wiring-matrix JSON artifact for the current GUI/PMConcept repair packet and validates against `Plans/Wiring_Matrix.schema.json`. It contains one map entry per schema-valid production command/control binding, keyed by `ui_element_id`, with `ui_command_id`, `handler_location`, expected event types, acceptance checks, and required evidence. `Plans/Wiring_Matrix.production.exclusions.json` records command-family roots, parser false positives, glob tokens, invalid historical aliases, and compatibility-only namespace roots that must not count as production coverage.

The schema command pattern now allows underscores in every command segment so accepted namespaces such as `cmd.source_control.*`, `cmd.prd_builder.*`, `cmd.planning_wizard.*`, and `cmd.plan_compile.*` can be represented without inventing alternate command names.

### PMConcept control reconciliation artifact

`Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and dispositions. The current generated summary is:

| Metric | Count |
|---|---:|
| Control-like nodes inventoried | 1284 |
| Inline-handler controls | 339 |
| Controls containing `cmd.*` tokens | 71 |
| Controls with accessibility gaps | 267 |
| Controls with local/demo/mock markers | 64 |
| Production wiring required | 44 |
| Production-intended controls missing a command | 0 |
| Concept-only controls pending owner adjudication before promotion | 1175 |
| Retired or re-scoped non-launch controls | 1 |

Controls marked `concept_fixture_only` are source-lineage fixtures only and cannot satisfy acceptance evidence. Controls marked `concept_only_needs_owner_adjudication` remain source-lineage concept controls until an owner doc promotes them and adds command, state selector, disabled reason, handler, receipt/event effect, and test evidence. Controls marked `retired_or_rescoped_non_launch_authority` include stale `START`, `BUILD`, and `Approve & Continue` launch semantics.

### Approve And Build wiring rule

The production `Approve And Build` control maps to `cmd.planning_wizard.approve_and_build` and the high-risk row `planning.wizard.final_review.approve_and_build` in `Plans/Wiring_Matrix.production.json`. Acceptance evidence must prove:

- final-review CAS fields match the displayed ApprovedPlanPack, PlanningRun revision, topic map version, project-context hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash;
- stale CAS inputs fail closed with bounded revalidation or final-review refresh;
- success atomically writes `approval_cas_receipt`, `PlanApproved`, and `PlanCompileRun_created_or_bound`;
- duplicate idempotency key plus identical CAS inputs returns the same `PlanCompileRun`;
- Orchestrator Plan Compile opens as pending-launch or durable-run projection, not as a tab-switch-only success;
- no ordinary `START`, `BUILD`, or `Approve & Continue` control can create a second build launch from the same approval inputs.

### Visible testing wiring rule

The production matrix rows for `cmd.testing.capability_policy.set`, `cmd.testing.visibility_policy.set`, `cmd.testing.session.open`, `cmd.testing.session.watch`, `cmd.testing.session.background`, and `cmd.testing.session.redaction.inspect` are required for visible testing readiness. Evidence must cover global and per-project `Auto` / `On` / `Off`, inheritance/effective-policy projection, `show_when_possible`, `Open` / `Watch`, browser navigation/click/form/assertion/screenshot/console/network streams, native preview/simulator/emulator/device streams, redaction-before-display/persist, disabled reasons, and background continuation.

### Accessibility evidence rule

Every retained production control in PMConcept or Final GUI wiring evidence must prove:

`ui_element_id -> accessible_name -> role -> keyboard_contract -> state_attributes -> disabled_reason_projection -> ui_command_id -> handler_location -> expected_event_types -> evidence_required`

The acceptance bar is zero unnamed actionable controls, zero retained custom clickable elements without keyboard parity, correct tab/menu/disclosure state semantics, visible focus handling, and disabled reason projection for every disabled production action.

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

Compatibility/source-lineage disposition: this historical wiring addendum preserves exact producer, consumer, event, and projection tokens. It is a compatibility/source-lineage section; named wiring PlanUnits and Contracts_V0 event identities govern overlapping runtime wiring precedence.

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

Compatibility/source-lineage disposition: this historical recovery-wiring section preserves minimum-row and UI-handler tokens. It remains source-lineage for WM-036 and must not be read as a separate peer wiring precedence layer.

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery wiring minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
## Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical event-wiring alignment preserves canonical event row tokens and handler-rule wording. Follow the named Wiring_Matrix PlanUnits and Contracts_V0 event identities rather than adjacent addendum order.

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

Compatibility/source-lineage disposition: this historical producer/consumer/action section preserves command and action-binding tokens. It remains source-lineage for runtime wiring consolidation and does not create a new executable queue, WorkNode, or NodeSeed surface.

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
| Thread context click `Compact Now` | `cmd.chat.compact_context` | chat header Compact Now action | chat runtime controller | Dispatch only after explicit user choice; emit started/completed/failed events and return started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, or failed status |
| Goal button/chip/icon or slash `/goal` | `cmd.chat.goal.start` | Assistant Chat composer / Goal chip / slash-command dispatcher | Goal Runtime controller | Start visible Goal Mode from the current thread using the Goal Runtime event envelope; concrete Goal event names and payload schemas remain owner-registered in Goal_Runtime_System, Contracts_V0, and storage-plan |
| Goal status update icon, `/goal again`, or natural-language update request | `cmd.chat.goal.update` | Assistant Chat status/menu / composer / slash-command dispatcher | Goal Runtime controller | Submit an active-goal update through the Goal Runtime event envelope without inventing concrete payload schemas in Wiring_Matrix |
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

<a id="wm-route-open-acceptance"></a>
#### Acceptance carry-through
- Carry selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, and resume_url demotion into live route/open docs
- Carry Primitive:RouteTarget/OpenSubject and wrapper/canonical normalization into crosswalk and wiring docs

### Verification evidence hooks

<a id="wm-verification-evidence-acceptance"></a>
#### Acceptance carry-through
- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough
- Add structured gate-specific evidence details for route-aware verification

### Compatibility-only fallback marking

<a id="wm-compat-fallback-acceptance"></a>
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

### WM-002 - Document Authority And Compatibility Naming Guard

```yaml
plan_unit_id: WM-002
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Plans/Wiring_Matrix.md is the canonical wiring matrix owner document and preserves `PUPPET MASTER -- UI WIRING MATRIX SSOT`, the platform name `Puppet Master`, and older naming only as compatibility-only legacy naming.'
gui_related: true
gui_classification_reason: 'The span includes UI wiring matrix authority and naming rules for user-visible UI wiring docs.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- WM-002 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: wiring_doc_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0003
preserved_exact_tokens:
- 'Wiring Matrix (Canonical)'
- 'Canonical owner-section requirements'
- 'Route/open compatibility-only fallback marking'
- 'PUPPET MASTER -- UI WIRING MATRIX SSOT'
- 'Puppet Master'
- 'legacy naming'
- 'do not quote it'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Older naming exists only as legacy naming and must not be quoted as live platform naming.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
```

### WM-003 - Wiring Matrix Scope And Schema Ownership

```yaml
plan_unit_id: WM-003
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'This document provides the wiring matrix template and examples, while real project wiring matrices are generated or maintained as JSON validated against `Plans/Wiring_Matrix.schema.json` and gated by `GATE-010`.'
gui_related: false
gui_classification_reason: 'The unit defines schema/gate ownership rather than visual presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-002
unblocks: []
acceptance_criteria:
- WM-003 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: wiring_matrix_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0004
preserved_exact_tokens:
- '0. Scope'
- 'wiring matrix template and example entries'
- 'generated/maintained as JSON'
- 'Plans/Wiring_Matrix.schema.json'
- 'GATE-010'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, Gate:GATE-010'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Wiring_Rules.md'
```

### WM-004 - Entry Template Contract

```yaml
plan_unit_id: WM-004
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Wiring matrix entries expose `ui_element_id`, `ui_location`, `ui_command_id`, `handler_location`, `expected_event_types`, `acceptance_checks`, and `evidence_required`, with JSON `entries` keyed by `ui_element_id` for unique interactive element IDs.'
gui_related: true
gui_classification_reason: 'The unit defines UI element and command wiring table fields for visible interactive elements.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-003
unblocks: []
acceptance_criteria:
- WM-004 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: entry_template
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0005
preserved_exact_tokens:
- 'ui_element_id'
- 'ui_location'
- 'ui_command_id'
- 'handler_location'
- 'expected_event_types'
- 'acceptance_checks'
- 'evidence_required'
- 'entries'
- 'map keyed by `ui_element_id`'
- 'btn.github.connect'
- 'Settings > GitHub/Auth'
- 'handlers::github_auth::connect'
- 'crate::core::handlers::auth::connect'
- '(none — UI-only)'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Gate:GATE-010'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-005 - Catalog Example Rows

```yaml
plan_unit_id: WM-005
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The Markdown example rows remain `(EXAMPLE)` rows drawn from `Plans/UI_Command_Catalog.md`, preserving the listed command IDs for GitHub auth, LSP, widgets, graph selection/retry, orchestrator tab switching, and chat thread creation.'
gui_related: true
gui_classification_reason: 'The unit preserves user-visible UI element example wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-005 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: example_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0006
preserved_exact_tokens:
- 'Example Entries'
- '(EXAMPLE)'
- 'btn.github.connect'
- 'btn.github.disconnect'
- 'menu.lsp.goto_def'
- 'menu.lsp.find_refs'
- 'btn.widget.add'
- 'btn.widget.remove'
- 'node.graph.select'
- 'btn.graph.retry'
- 'tab.orchestrator.switch'
- 'btn.chat.new'
- 'cmd.github.connect'
- 'cmd.github.disconnect'
- 'cmd.lsp.goto_definition'
- 'cmd.lsp.find_references'
- 'cmd.widget.add'
- 'cmd.widget.remove'
- 'cmd.graph.select_node'
- 'cmd.graph.retry_node'
- 'cmd.orchestrator.switch_tab'
- 'cmd.chat.new'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, SchemaID:Wiring_Matrix.schema.json'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect, UICommand:cmd.lsp.goto_definition, UICommand:cmd.lsp.find_references, UICommand:cmd.widget.add, UICommand:cmd.widget.remove, UICommand:cmd.graph.select_node, UICommand:cmd.graph.retry_node, UICommand:cmd.orchestrator.switch_tab, UICommand:cmd.chat.new'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-006 - Json Example Shape

```yaml
plan_unit_id: WM-006
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The JSON example preserves `pm.wiring_matrix.v0`, representative keyed entries, schema linkage, expected events, acceptance checks, evidence paths, and EventRecord linkage.'
gui_related: true
gui_classification_reason: 'The JSON examples describe UI element records and their event wiring.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-006 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: json_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0007
preserved_exact_tokens:
- 'JSON Example'
- 'pm.wiring_matrix.v0'
- 'generated_at'
- 'btn.github.connect'
- 'menu.lsp.goto_def'
- 'btn.widget.add'
- 'auth.github.device_code.issued'
- 'auth.github.token.polling'
- 'auth.github.authenticated'
- 'auth.github.failed'
- 'tool.invoked'
- 'evidence/wiring/cmd.github.connect.json'
- 'evidence/wiring/cmd.lsp.goto_definition.json'
- 'evidence/wiring/cmd.widget.add.json'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
```

### WM-007 - Gate 010 Schema Verification

```yaml
plan_unit_id: WM-007
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 verifies wiring matrix entries by running JSON Schema validation against `Plans/Wiring_Matrix.schema.json` before further wiring checks.'
gui_related: false
gui_classification_reason: 'The unit defines validation gate behavior rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-003
unblocks: []
acceptance_criteria:
- WM-007 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate010_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0009
preserved_exact_tokens:
- '4. Verification'
- 'GATE-010'
- 'Plans/Progression_Gates.md'
- '4.1 Schema validation'
- 'MUST validate'
- 'Plans/Wiring_Matrix.schema.json'
- 'first check'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
```

### WM-008 - Gate 010 Coverage And Uniqueness

```yaml
plan_unit_id: WM-008
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 requires every catalog `cmd.*` ID to have at least one wiring entry, treats stale research-session, web-tool, or terminal aliases as failures, and enforces one unique `ui_element_id` key/value per entry.'
gui_related: false
gui_classification_reason: 'The unit defines gate coverage and uniqueness validation rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-008 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate010_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0011
preserved_exact_tokens:
- '4.2 Coverage'
- 'Every `cmd.*` ID'
- 'at least one wiring matrix entry'
- 'Research-session'
- 'web-tool'
- 'terminal command identity'
- 'stale local command aliases'
- 'verification failures'
- 'cmd.dev.start_session'
- 'cmd.dev.stop_session'
- 'reveal'
- 'show'
- 'rerun'
- 'split'
- 'close'
- 'clear'
- 'restart'
- 'terminate'
- 'kill'
- 'detach'
- 'reattach'
- 'focus-session'
- 'w-20260316-160450'
- '4.2.1 One element, one command enforcement'
- 'ui_element_id'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Old work-item ledger `w-20260316-160450` lines 748-941 may be source-lineage evidence only and does not replace generated JSON entries.'
stale_retired_dispositions:
- 'Stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibility shortcuts.'
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Tools.md'
```

### WM-009 - Handler And Event Validation

```yaml
plan_unit_id: WM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 requires each `handler_location` to resolve to an existing handler path and requires dispatch tests for non-empty `expected_event_types` that assert declared events in order and no undeclared events.'
gui_related: false
gui_classification_reason: 'The unit defines handler and event validation mechanics rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-009 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: handler_event_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0013
preserved_exact_tokens:
- '4.3 Handler resolution'
- 'handler_location'
- 'MUST resolve'
- 'puppet-master-rs/src/'
- '(crate::)?module(::submodule)+::function'
- 'ui_element_id'
- 'ui_command_id'
- 'unresolved `handler_location`'
- 'candidate files/modules inspected'
- '4.4 Event tests'
- 'expected_event_types'
- 'declared event types'
- 'expected order'
- 'no undeclared event types'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Gate:GATE-010, Invariant:INV-011, Invariant:INV-012, SchemaID:Wiring_Matrix.schema.json'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
- 'Plans/Contracts_V0.md'
```

### WM-010 - Gate Schema Owner Boundary

```yaml
plan_unit_id: WM-010
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The wiring matrix preserves gate/schema and owner limits for `cmd.runtime.*`, `correlation_id`, `allowed_action_ids[]`, route-aware evidence, extraction hazards, runtime owner references, command/wiring ownership, and route/open compatibility references without becoming a general runtime schema.'
gui_related: true
gui_classification_reason: 'The unit includes GUI command IDs, route/open evidence, and UI/runtime wiring ownership boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-010 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0014
preserved_exact_tokens:
- '4.5 Gate/schema limits and owner references'
- 'cmd.runtime'
- 'cmd.runtime.*'
- 'stale-projection revalidation'
- 'correlation_id'
- 'allowed_action_ids'
- 'allowed_action_ids[]'
- 'Wiring_Matrix.schema.json'
- 'schema.json'
- '/matrix/gate'
- 'deprecated-vs-canonical command-family status'
- 'regex-style scans'
- 'cmd.*.json'
- 'cmd.panel.switch'
- '/gate/evidence'
- 'GATE'
- 'GATE-010'
- '/route'
- 'OpenSubject'
- 'cmd.nav'
- 'cmd.nav.*'
- 'scheduler.pass'
- 'attempt.started'
- 'attempt.completed'
- 'node.blocked'
- 'safe_point'
- 'safe_point.*'
- 'attempt_record'
- 'blocked_projection'
- 'cmd.chat.run_user_command'
- '/compact'
- '/mode'
- 'runtime-mode'
- 'slash-command'
- 'IDs'
- 'GUI'
- '{ mode }'
- '/wiring'
- '/recovery'
- '/open'
- 'tab_id'
- 'resume_url'
- '/prohibited'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Route/open compatibility evidence references Contracts_V0 for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes.'
stale_retired_dispositions:
- 'Extraction hazards and stale projection revalidation are gate failures rather than compatibility shortcuts.'
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Wiring_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Progression_Gates.md'
- 'Plans/storage-plan.md'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FileManager.md'
```

### WM-011 - Scheduler Analysis Wiring Row

```yaml
plan_unit_id: WM-011
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The scheduler analysis producer/consumer path wires canonical event `scheduler.pass` with legacy alias `run.scheduler_analysis` from executor/orchestrator scheduler pass to Run Graph queue-analysis, storage `scheduler_pass_record`, usage/analytics dashboard, and `scheduler_pass.{run_id}.{scheduler_pass_id}` projection.'
gui_related: true
gui_classification_reason: 'The unit links runtime scheduler events to user-visible Run Graph and dashboard consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-011 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0017
preserved_exact_tokens:
- 'Scheduler/Remediation/Event Wiring Addendum'
- 'producer -> consumer paths'
- 'scheduler.pass'
- 'run.scheduler_analysis'
- 'executor/orchestrator scheduler pass'
- 'Run Graph View queue-analysis panel'
- 'scheduler_pass_record'
- 'usage/analytics dashboard'
- 'scheduler_pass.{run_id}.{scheduler_pass_id}'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/storage-plan.md'
- 'Plans/usage-feature.md'
```

### WM-012 - Blocked Unblocked Wiring Rows

```yaml
plan_unit_id: WM-012
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Blocked/unblocked wiring rows cover `node.blocked`, `node.unblocked`, `wizard.blocked`, and `wizard.unblocked` with legacy aliases `run.node_blocked` and `run.node_unblocked`, producing blocked projections for Run Graph, assistant chat, dashboard counts, and storage.'
gui_related: true
gui_classification_reason: 'The unit routes blocked/unblocked events to visible Run Graph, chat, and dashboard consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-012 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0018
preserved_exact_tokens:
- 'Blocked/unblocked'
- 'node.blocked'
- 'node.unblocked'
- 'wizard.blocked'
- 'wizard.unblocked'
- 'run.node_blocked'
- 'run.node_unblocked'
- 'executor/orchestrator blocked-state manager'
- 'Run Graph View node badge/detail'
- 'assistant-chat blocked_notice'
- 'dashboard blocked-count badge'
- 'blocked_projection'
- 'blocked_projection.{run_id}.{node_id}.{blocked_sequence}'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy aliases `run.node_blocked` and `run.node_unblocked` are lineage only beside canonical blocked events.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/storage-plan.md'
```

### WM-013 - Safe Point Wiring Rows

```yaml
plan_unit_id: WM-013
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Safe-point wiring rows cover mutation-capable attempt dispatcher or retry controller production of `safe_point.created` and `safe_point.restored` to runtime recovery logic, Run Graph detail, and audit/debug surfaces.'
gui_related: true
gui_classification_reason: 'The unit routes safe-point runtime events to user-visible Run Graph and audit/debug consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-013 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0019
preserved_exact_tokens:
- 'Safe points'
- 'mutation-capable attempt dispatcher'
- 'retry controller'
- 'safe_point.created'
- 'safe_point.restored'
- 'runtime recovery logic'
- 'Run Graph detail panel'
- 'audit/debug surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Executor_Protocol.md'
```

### WM-014 - Remediation And Degradation Wiring Rows

```yaml
plan_unit_id: WM-014
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Remediation and degradation wiring rows cover `remediation.spawned`, `remediation.resolved`, and `plan.decomposition_degraded`, preserving remediation lineage storage, Run Graph, dashboard, wizard/interview planning UI, storage projections, and audit/debug consumers.'
gui_related: true
gui_classification_reason: 'The unit routes remediation/degradation events to visible Run Graph, dashboard, wizard/interview, and audit/debug consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-014 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0021
preserved_exact_tokens:
- 'Remediation lineage'
- 'remediation.spawned'
- 'remediation.resolved'
- 'run.remediation_started'
- 'run.remediation_completed'
- 'remediation manager'
- 'remediation_lineage_record'
- 'dashboard remediation badge'
- 'remediation.{run_id}.{remediation_root_id}'
- 'Degradation evidence'
- 'plan.decomposition_degraded'
- 'draft decomposition/planning pipeline'
- 'wizard/interview planning UI'
- 'storage projections'
- 'audit/debug surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy aliases `run.remediation_started` and `run.remediation_completed` are lineage only beside canonical remediation events.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/storage-plan.md'
- 'Plans/Orchestrator_Page.md'
```

### WM-015 - Runtime Recovery Packet Wiring

```yaml
plan_unit_id: WM-015
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Runtime recovery wiring requires explicit producers, handlers, projection consumers, UI command handlers, and packet-field traceability from runtime event producers through run graph, orchestrator summaries, chat banners, and history/evidence tabs.'
gui_related: true
gui_classification_reason: 'The unit wires runtime recovery data to multiple user-visible UI consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-011
- WM-012
- WM-013
- WM-014
unblocks: []
acceptance_criteria:
- WM-015 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_recovery_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0023
preserved_exact_tokens:
- 'Runtime recovery wiring requirements'
- 'runtime packet'
- 'Runtime recovery wiring minimum rows'
- 'scheduler.pass'
- 'attempt.started'
- 'attempt.completed'
- 'node.blocked'
- 'safe_point.created'
- 'safe_point.restored'
- 'remediation.spawned'
- 'remediation.resolved'
- 'projection consumers'
- 'run graph'
- 'orchestrator summaries'
- 'chat banners'
- 'history/evidence tabs'
- 'queue-analysis open'
- 'attempt details open'
- 'blocked resume'
- 'retry'
- 'safe-point restore-and-retry'
- 'remediation lineage open'
- 'trace every new packet field'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/assistant-chat-design.md'
```

### WM-016 - Canonical Runtime Event Rows

```yaml
plan_unit_id: WM-016
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Canonical runtime event rows use `Plans/Contracts_V0.md` identities for scheduler, attempts, blocked/prerequisite, remediation, and graph lock/integrity events, including persisted `attempt_record` and consumers across storage, Run Graph, Orchestrator Page, history/evidence, scheduler, recovery, executor admission, progression gates, and blocked/replan surfaces.'
gui_related: true
gui_classification_reason: 'The unit routes canonical runtime event rows to user-visible and runtime consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-015
unblocks: []
acceptance_criteria:
- WM-016 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_runtime_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0025
preserved_exact_tokens:
- 'Canonical Runtime Event Wiring Canonical Alignment'
- 'Plans/Contracts_V0.md'
- 'scheduler/executor'
- 'scheduler.pass'
- 'scheduler_pass_id'
- 'attempt.started'
- 'attempt.completed'
- 'attempt_record'
- 'node.blocked'
- 'node.unblocked'
- 'node.prerequisite_resolved'
- 'remediation.spawned'
- 'remediation.resolved'
- 'run.graph_canonical_locked'
- 'run.graph_integrity_failed'
- 'executor admission logic'
- 'progression gates'
- 'blocked/replan surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
- 'Plans/storage-plan.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Progression_Gates.md'
```

### WM-017 - Recovery Ui Action Binding

```yaml
plan_unit_id: WM-017
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Recovery UI handlers are keyed by canonical `allowed_action_id` families before binding domain-specific command IDs through blocked payload metadata.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible recovery UI handler command binding.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-015
- WM-016
unblocks: []
acceptance_criteria:
- WM-017 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: ui_action_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0026
preserved_exact_tokens:
- 'UI command handler rule'
- 'Recovery UI handlers'
- 'canonical `allowed_action_id` families'
- 'domain-specific command ids'
- 'blocked payload metadata'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Contracts_V0.md'
```

### WM-018 - Context Lens Wiring Rows

```yaml
plan_unit_id: WM-018
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Context Lens wiring rows preserve thread-local multi-select in all modes and explicit `Subcompact` apply/revert semantics, including mode toggle, target selection, export/revoke, Debug Automation banner, browser takeover, and investigation cancellation commands.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Context Lens and Debug investigation command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-018 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: context_lens_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0028
preserved_exact_tokens:
- 'Context Lens minimum rows'
- 'cmd.chat.context_lens.toggle'
- 'cmd.chat.context_lens.set_mode'
- 'cmd.chat.context_lens.turn_off'
- 'cmd.chat.context_lens.toggle_message_selection'
- 'cmd.chat.context_lens.clear_selection'
- 'cmd.chat.context_lens.apply_subcompact'
- 'cmd.chat.context_lens.revert_subcompact'
- 'mute'
- 'focus'
- 'subcompact'
- 'Subcompact'
- 'explicit-apply'
- 'automatic dynamic context shrinking'
- 'cmd.chat.mode'
- 'cmd.chat.open_debug_target_picker'
- 'cmd.chat.export_investigation_bundle'
- 'cmd.chat.revoke_investigation_item'
- 'cmd.runtime.approve'
- 'cmd.runtime.resume_after_prerequisite'
- 'cmd.runtime.retry_now'
- 'cmd.browser.stop_agent_keep_browser'
- 'cmd.browser.promote_to_normal_browsing'
- 'cmd.runtime.abort_run'
negative_constraints:
- 'Context Lens wiring must remain thread-local, support multi-select in all modes, and keep `Subcompact` as explicit apply/revert distinct from automatic dynamic context shrinking.'
preserved_contractrefs:
- 'ContractRef: Context Lens wiring MUST remain thread-local, must support multi-select in all modes, and must keep `Subcompact` as an explicit apply/revert path distinct from automatic dynamic context shrinking. [Source: assistant-chat-design.md#176-context-lens-mute--focus--subcompact; Prompt_Pipeline.md#dynamic-context-shrinking]'
- 'ContractRef: Wiring rows for Context Lens MUST remain aligned with command IDs, chat placement, and overlay persistence semantics; a packet may not leave those elements split between unrelated addenda. [Source: UI_Command_Catalog.md#context-lens-command-set; FinalGUISpec.md#context-lens-placement-and-behavior]'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/storage-plan.md'
```

### WM-019 - Project Thread Minimum Rows

```yaml
plan_unit_id: WM-019
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Minimum required rows cover project switcher, thread details, compaction, restore branch, and related shell/chat/history command wiring without losing canonical project/thread identity, including explicit Compact Now dispatch, context.compaction.failed or equivalent visible degraded-state wiring, and command-result statuses for already_running, cancelled, no_op, unavailable, retry_scheduled, completed, and failed.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible project/thread command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-019 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: promoted_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
preserved_exact_tokens:
- 'Minimum required rows'
- 'project switcher'
- 'thread details'
- 'compaction'
- 'Compact Now'
- 'context.compaction.failed'
- 'already_running'
- 'cancelled'
- 'no_op'
- 'retry_scheduled'
- 'restore branch'
- 'cmd.chat'
- 'cmd.project'
- 'cmd.history'
- 'thread'
- 'project'
- 'shell'
- 'history'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/FinalGUISpec.md'
```

### WM-020 - Browser Command Rows

```yaml
plan_unit_id: WM-020
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Browser command rows cover browser open/focus/detach, DevTools, share/capture, takeover, pause/continue/stop/promote, screenshot capture, and recovery commands while preserving browser-session identity.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible browser command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-020 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'cmd.browser.focus_browser_tab'
- 'Focus Browser'
- 'cmd.browser.detach_browser_tab'
- 'Detach Browser'
- 'cmd.browser.open_devtools'
- 'Open DevTools'
- 'cmd.browser.toggle_devtools_dock'
- 'Toggle DevTools Dock'
- 'cmd.browser.share_with_agent'
- 'cmd.browser.revoke_share_with_agent'
- 'cmd.browser.pick_element_for_chat'
- 'cmd.browser.add_selection_to_chat'
- 'cmd.browser.add_selection_screenshot_to_chat'
- 'cmd.browser.add_selection_full_screenshot_to_chat'
- 'cmd.browser.add_screenshot_to_chat'
- 'cmd.browser.add_full_screenshot_to_chat'
- 'cmd.browser.take_over'
- 'Pause Agent'
- 'Let agent continue'
- 'Stop agent and keep browser'
- 'cmd.browser.promote_to_normal_browsing'
- 'cmd.browser.reopen'
- 'cmd.browser.retry'
- 'cmd.browser.keep_closed'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/FinalGUISpec.md'
```

### WM-021 - Terminal Dev And Catalog Rows

```yaml
plan_unit_id: WM-021
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Terminal, dev, and catalog wiring rows cover terminal reveal/show/rerun/detach/new/split/add/embed/focus/move/rename/pin/close/clear/restart/terminate/kill/reattach commands, dev session start/stop/restart/status commands, and catalog install/remove lifecycle commands.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible terminal, dev, and catalog command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-021 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: terminal_dev_catalog_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'cmd.terminal.open'
- 'cmd.terminal.show'
- 'cmd.terminal.rerun'
- 'cmd.terminal.detach'
- 'cmd.terminal.new_tab'
- 'cmd.terminal.activate_workgroup'
- 'cmd.terminal.activate_subtab'
- 'cmd.terminal.reorder_workgroup'
- 'cmd.terminal.reorder_subtab'
- 'cmd.terminal.split_pane'
- 'cmd.terminal.add_leaf'
- 'cmd.terminal.embed_in_editor'
- 'cmd.terminal.remove_from_editor'
- 'cmd.terminal.undock_all_from_editor'
- 'cmd.terminal.focus_session'
- 'cmd.terminal.move_tab_to_section'
- 'cmd.terminal.rename_tab'
- 'cmd.terminal.pin_tab'
- 'cmd.terminal.close_pane'
- 'cmd.terminal.close_tab'
- 'cmd.terminal.clear_scrollback'
- 'cmd.terminal.restart_session'
- 'cmd.terminal.terminate_session'
- 'cmd.terminal.kill_session'
- 'cmd.terminal.detach_section'
- 'cmd.terminal.reattach_section'
- 'cmd.dev.start_session'
- 'cmd.dev.stop_session'
- 'cmd.dev.restart_session'
- 'cmd.dev.show_output'
- 'cmd.dev.show_problems'
- 'cmd.dev.show_ports'
- 'cmd.catalog.install_item'
- 'cmd.catalog.remove_item'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/storage-plan.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-022 - Terminal Identity Constraints

```yaml
plan_unit_id: WM-022
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Terminal wiring preserves terminal workspace/session identity, distinguishing content-only actions from destructive workspace mutations, preserving `/replacement`, `/close`, `/disconnected/review-only`, `Concepts/PMConcept.html` GUI lineage, drag/drop layout concepts, and the rule that split-parent opacity effects must not dim terminal grids.'
gui_related: true
gui_classification_reason: 'The unit preserves user-visible terminal identity, layout, and GUI concept lineage constraints.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-021
unblocks: []
acceptance_criteria:
- WM-022 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: terminal_identity_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'Terminal wiring owner split'
- 'Section15_MVP_Promoted_Features_Spec.md §3.14'
- 'terminal_workspace_state'
- 'terminal_session_record'
- 'terminal_command_block'
- 'dev_session_record'
- 'restart'
- '/replacement'
- 'replace-with-new-terminal'
- '/close'
- '/disconnected/review-only'
- 'clear'
- '/reset'
- 'Concepts/PMConcept.html'
- '/workgroup'
- '/subtab'
- 'split-pane tree operations'
- 'multi-panel terminal stacks'
- '/drop'
- '/center/right'
- '/right'
- '/resizers'
- 'accent-led subtab focus'
- 'command-log removal'
- 'must not dim terminal grids'
negative_constraints:
- 'Split-parent opacity effects must not dim terminal grids during reorder or drag operations.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Concepts/PMConcept.html is GUI concept lineage only while preserving implied command coverage.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/storage-plan.md'
```

### WM-023 - Browser Session Capture And Recovery Invariants

```yaml
plan_unit_id: WM-023
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Browser wiring invariants preserve stale `newfeatures.md §15.18` cleanup, the CEF-class tab-first in-app `/browser` model, `auth_session` limits, explicit chip-based capture, DevTools contract, takeover behavior, and recovery behavior for workspace, detached, automation, and auth sessions.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible browser session, capture, takeover, DevTools, and recovery invariants.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-020
unblocks: []
acceptance_criteria:
- WM-023 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_invariants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0031
preserved_exact_tokens:
- 'Browser session, capture, and recovery wiring invariants'
- 'newfeatures.md §15.18'
- 'trust-tier'
- '/trust-tier'
- 'permission-layer `/capability-degradation`'
- 'CEF-class, tab-first, in-app `/browser` model'
- 'workspace_preview'
- 'detached_preview'
- 'automation_session'
- 'auth_session'
- '/cookie'
- 'Take over and pause agent'
- 'Let agent continue'
- 'Stop agent and keep browser'
- '/stop/take-over'
- '/stop/take'
- 'chip-based'
- 'share-to-chat'
- 'non-auto-send'
- '/highlight/share-to-chat'
- '/elements'
- '/selection'
- '/DOM'
- 'Add Selection to Chat'
- 'Pick Element for Chat'
- 'Add Selection + Screenshot'
- 'Add Element + Screenshot'
- '/trace/video'
- 'Open DevTools'
- 'Toggle DevTools Dock'
- 'runtime_unavailable'
negative_constraints:
- 'auth_session is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success.'
- 'Ordinary clicks do not inject `/context`.'
- 'Automation/auth sessions never auto-resume active work, auth never auto-completes.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes:
- 'Stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/storage-plan.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Permissions_System.md'
- 'Plans/UI_Command_Catalog.md'
```
### WM-024 - Debug Investigation Minimum Rows

```yaml
plan_unit_id: WM-024
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Debug Mode and Investigation Context wiring requires the listed cmd.chat.mode, cmd.chat.open_debug_target_picker, investigation export/revoke, cmd.runtime.* approval/resume/retry/abort rows, and browser stop/promote rows, including explicit-confirmation and stop_reason_code = investigation.cancelled_by_user.
gui_related: true
gui_classification_reason: The unit defines user-visible Debug Mode and Investigation Context command rows and attention-surface actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-018
- WM-020
- WM-023
unblocks: []
acceptance_criteria:
- WM-024 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: debug_investigation_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0032
preserved_exact_tokens:
- Debug investigation minimum rows
- cmd.chat.mode
- /mode debug
- cmd.chat.open_debug_target_picker
- cmd.chat.export_investigation_bundle
- cmd.chat.revoke_investigation_item
- cmd.runtime.approve
- cmd.runtime.resume_after_prerequisite
- cmd.runtime.retry_now
- cmd.browser.stop_agent_keep_browser
- cmd.browser.promote_to_normal_browsing
- explicit-confirmation
- cmd.runtime.abort_run
- stop_reason_code = investigation.cancelled_by_user
negative_constraints:
- Do not silently promote the automation/auth session.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
```

### WM-025 - Assistant Worktree Lifecycle Wiring

```yaml
plan_unit_id: WM-025
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Chat-to-WorktreeManager wiring covers create/remove/bind/list/merge/create-pr flows, auto-create via branching.assistant_auto_worktree, and preservation of thread_id, branch/base refs, worktree_id, and path data flow.
gui_related: true
gui_classification_reason: The unit covers user-visible chat header, dropdown, merge dialog, PR, and Source Control worktree actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-019
unblocks: []
acceptance_criteria:
- WM-025 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: assistant_worktree_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)
- Assistant Worktree Wiring Addendum
- Chat ↔ WorktreeManager wiring
- Create Worktree
- cmd.chat.worktree.create
- remove_worktree
- list_worktrees
- merge_worktree
- create_pr
- branching.assistant_auto_worktree
- thread_id
- branch_name
- base_ref
- worktree_id
- path
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
- Plans/GitHub_Integration.md
- Plans/Contracts_V0.md
```

### WM-026 - Worktree Cross-Surface Identity And Execution Context

```yaml
plan_unit_id: WM-026
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Worktree binding wires Source Control, File Manager roots, LSP root_identity, and executor execution_unit_context.worktree_id / working_directory deterministically; Glossary keeps thread-worktree terminology as compatibility reference only while Wiring Matrix records producer/consumer edges.
gui_related: true
gui_classification_reason: The unit covers visible Source Control, File Manager, chat, LSP, and execution context switching behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-019
- WM-025
unblocks: []
acceptance_criteria:
- WM-026 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_cross_surface_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- Chat ↔ Source Control wiring
- Chat ↔ File Manager wiring
- Chat ↔ LSP wiring
- Chat ↔ Executor wiring
- worktree_follow_thread
- worktree_path
- project_root
- root_identity
- (host_id, server_id, root_identity)
- execution_unit_context.worktree_id
- execution_unit_context.working_directory
- working_directory
- Plans/Glossary.md
- /Glossary.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes:
- Terminology for thread worktree binding, accordion layout, working_directory, merge lock, and pre-merge test gate stays in Plans/Glossary.md; Wiring Matrix records producer/consumer edges only.
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FileManager.md
- Plans/LSPSupport.md
- Plans/Executor_Protocol.md
- Plans/Run_Modes.md
- Plans/Glossary.md
```

### WM-027 - Search File And Source Control Command Handoff Rows

```yaml
plan_unit_id: WM-027
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Search, file, chat restore/reference, Source Control review/conflict, host-aware LSP projection, and cmd.remote.reconnect handoffs share one shell slot and identity model; cmd.git.* rows stay lower-level, diff-local local-search must not route through project-wide search, and cmd.chat.rewind must not restore files.
gui_related: true
gui_classification_reason: The unit defines user-visible Search panel, File Manager, chat, Source Control review/conflict, and remote reconnect command routing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-025
- WM-026
unblocks: []
acceptance_criteria:
- WM-027 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: side_panel_command_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- cmd.search.show
- cmd.search.find_in_files
- cmd.search.replace_in_files
- cmd.search.open_result
- cmd.file.*
- cmd.chat.add_file_reference
- cmd.chat.revert
- cmd.chat.rewind
- cmd.source_control.switch_subview
- cmd.source_control.open_review
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
- cmd.git.diff_set_compare_target
- cmd.git.diff_search
- cmd.git.stage_hunks
- cmd.git.unstage_hunks
- cmd.git.discard_hunks
- cmd.git.conflict_apply_resolution
- local-search
- /hunk/conflict/search-in-diff
- cmd.remote.reconnect
negative_constraints:
- cmd.git.* rows are lower-level diff/git operations, not substitutes for cmd.source_control.* GUI entrypoints.
- Diff-local local-search belongs to the git diff/review surface and must not route through project-wide cmd.search.find_in_files.
- cmd.chat.rewind must not restore files.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
- Plans/LSPSupport.md
```

### WM-028 - Regex Index Query And Dirty Layer Wiring

```yaml
plan_unit_id: WM-028
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Grep/index wiring routes agent grep calls and Search-panel regex queries through IndexEngine candidates and ripgrep verification, while PM-mediated writes, file watchers, and remote re-anchor insert generation-stamped DirtyLayer entries before callers can observe false-negative search results.
gui_related: false
gui_classification_reason: The unit defines backend index, verification, dirty-layer, and remote re-anchor wiring rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-009
unblocks: []
acceptance_criteria:
- WM-028 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: regex_index_dirty_layer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Search Index Acceleration Wiring Addendum
- sparse n-gram regex index
- Agent/subagent `grep` call
- IndexEngine `query`
- ripgrep verification
- DirtyLayer `insert`
- PM-mediated writes
- SYNCHRONOUSLY
- agent-write-then-grep CRITICAL FIX
- HashMap
- generation stamps
- old_anchor..new_HEAD
negative_constraints:
- DirtyLayer storage is a HashMap with generation stamps, not a plain HashSet.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
```

### WM-029 - Search Panel Index UX And Cache Commands

```yaml
plan_unit_id: WM-029
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Search-panel regex, status-bar Indexing / Refreshing index, cmd.search.rebuild_regex_index, cmd.search.evict_remote_cache, and cmd.search.clear_all_remote_caches expose index state and cache control without re-owning storage or remote correctness.
gui_related: true
gui_classification_reason: The unit covers user-visible Search panel regex behavior, status-bar indicators, and cache control commands.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-027
- WM-028
unblocks: []
acceptance_criteria:
- WM-029 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: search_index_user_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Search-panel regex query
- regex ON
- cmd.search.rebuild_regex_index
- Indexing
- Refreshing index
- cmd.search.evict_remote_cache
- cmd.search.clear_all_remote_caches
- RemoteCacheManager `evict_project`
- RemoteCacheManager `evict_all`
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
```

### WM-030 - Index Build Storage Publication And Recovery

```yaml
plan_unit_id: WM-030
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Index build/storage wiring covers project-ready full or validation builds, Git incremental rebuilds, IndexSnapshot load, ArcSwap publication, crash recovery, remote fetch cadence, git diff --name-only old_anchor..new_HEAD, and cache-only no-data-loss behavior.
gui_related: false
gui_classification_reason: The unit defines backend index build, storage publication, recovery, and remote refresh wiring rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-028
unblocks: []
acceptance_criteria:
- WM-030 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: index_storage_publication
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Index build <-> Storage wiring
- Project open
- IndexBuilder `build_full`
- IndexBuilder `build_incremental`
- IndexSnapshot `load`
- ArcSwap
- arc-swap
- Project-ready signal
- Git fetch (remote)
- git diff --name-only old_anchor..new_HEAD
- mmap
- rebuild
- timer every 5 minutes
- cache
- no data loss
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
- Plans/Tools.md
```

### WM-031 - Route Open Contract Carry Through

```yaml
plan_unit_id: WM-031
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Route/open reconciliation carries selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, resume_url demotion, Primitive:RouteTarget, OpenSubject, and wrapper/canonical normalization into owner docs and wiring consumers.
gui_related: false
gui_classification_reason: The unit carries route/open contract semantics and wiring-consumer metadata rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-010
unblocks: []
acceptance_criteria:
- WM-031 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_open_contract_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0036
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0038
preserved_exact_tokens:
- Route-aware wiring reconciliation
- Route-aware navigation and open-contract rows
- selector precedence
- reject rules
- closed tab_id vocabulary
- scoped resolver rules
- route examples
- ref-family split
- resume_url demotion
- Primitive:RouteTarget/OpenSubject
- wrapper/canonical normalization
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Crosswalk.md
- Plans/UI_Command_Catalog.md
```

### WM-032 - Route Aware Gate Evidence Hooks

```yaml
plan_unit_id: WM-032
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: GATE-010 must verify route args, wrapper normalization, stale revalidation, admissibility, correlation passthrough, and structured gate-specific evidence for route-aware verification. The Expand Wiring Matrix source wording is preserved as stale/carry-through lineage, not as a new owner schema.
gui_related: false
gui_classification_reason: The unit defines verification and evidence requirements rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-007
- WM-008
- WM-009
- WM-010
- WM-031
unblocks: []
acceptance_criteria:
- WM-032 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_coverage_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_aware_gate_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0040
preserved_exact_tokens:
- Verification evidence hooks
- GATE-010
- route args
- wrapper normalization
- stale revalidation
- admissibility
- correlation passthrough
- structured gate-specific evidence details
- Expand Wiring Matrix and GATE-010
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough is preserved as carry-through lineage rather than a second routing owner schema.
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Progression_Gates.md
- Plans/UI_Wiring_Rules.md
- Plans/Contracts_V0.md
```

### WM-033 - Route Open Compatibility Only Fallback Marking

```yaml
plan_unit_id: WM-033
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Timestamp/run/thread fallback logic is compatibility-only inside route/open contracts, and the ref-family split remains explicit when route/open normalization is transferred.
gui_related: false
gui_classification_reason: The unit defines compatibility-only route/open contract handling rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-031
unblocks: []
acceptance_criteria:
- WM-033 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_open_compatibility_marking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0042
preserved_exact_tokens:
- Compatibility-only fallback marking
- timestamp/run/thread fallback logic
- compatibility-only
- route/open contracts
- ref-family split
- route/open normalization
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Timestamp/run/thread fallback logic is compatibility-only inside route/open contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Crosswalk.md
- Plans/UI_Command_Catalog.md
```

### WM-034 - Catalog Owned Wrapper Normalization Boundary

```yaml
plan_unit_id: WM-034
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Plans/UI_Command_Catalog.md owns command identity and alias metadata; Wiring Matrix consumes that metadata, still exposes ui_element_id, ui_command_id, handler_location, and expected_event_types, and must not create a second routing schema inside the matrix.
gui_related: false
gui_classification_reason: The unit defines catalog/wiring ownership and gate-consumer boundaries rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-010
- WM-031
- WM-032
- WM-033
unblocks: []
acceptance_criteria:
- WM-034 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: catalog_owned_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Catalog-owned normalization metadata
- Plans/UI_Command_Catalog.md
- /UI_Command_Catalog.md
- command identity
- alias metadata
- ui_element_id
- ui_command_id
- handler_location
- expected_event_types
- wrapper command
- canonical route/open semantics
- /open
- /gates
- not a second routing schema inside the matrix
negative_constraints:
- Wiring Matrix must not duplicate route semantics or create a second routing schema inside the matrix.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- GATE-010 completeness includes stale-projection revalidation as gate coverage consumed by wiring/gates, not a second routing schema.
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Progression_Gates.md
- Plans/Contracts_V0.md
```

### WM-035 - Runtime Record Demotion Hazard For Wiring

```yaml
plan_unit_id: WM-035
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: tier_runtime_record, tier-keyed usage_record, and tier-keyed evidence_record remain demotion hazards; generated wiring rows must not treat them as canonical producers or consumers until owner-level demotion or replacement is complete.
gui_related: false
gui_classification_reason: The unit records runtime/storage owner demotion risk rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-016
- WM-034
unblocks: []
acceptance_criteria:
- WM-035 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_demotion_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_record_demotion_hazard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Owner-level runtime records remain a demotion hazard for wiring
- tier_runtime_record
- tier-keyed usage_record
- tier-keyed evidence_record
- owner-level demotion
- generated wiring rows
- canonical producers or consumers
negative_constraints:
- Generated wiring rows must not treat tier_runtime_record, tier-keyed usage_record, or tier-keyed evidence_record as canonical producers or consumers until owner-level demotion or replacement is complete.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/usage-feature.md
```

### WM-001 - Wiring Matrix Source-Preserving Bridge Retired

```yaml
plan_unit_id: WM-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'WM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 201 because Wiring_Matrix-S0044 through S0047 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated WM-001 bridge, and Migration Coverage. Wiring_Matrix-S0001 through S0043 are covered by WM-002 through WM-035 or explicit structural/reference dispositions. WM-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.'
gui_related: false
gui_classification_reason: The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related Wiring Matrix product tokens.
split_recommended: false
depends_on:
- WM-002
- WM-003
- WM-004
- WM-005
- WM-006
- WM-007
- WM-008
- WM-009
- WM-010
- WM-011
- WM-012
- WM-013
- WM-014
- WM-015
- WM-016
- WM-017
- WM-018
- WM-019
- WM-020
- WM-021
- WM-022
- WM-023
- WM-024
- WM-025
- WM-026
- WM-027
- WM-028
- WM-029
- WM-030
- WM-031
- WM-032
- WM-033
- WM-034
- WM-035
unblocks: []
acceptance_criteria:
- Wiring_Matrix-S0001 through S0043 remain mapped to fine-grained Wiring Matrix PlanUnits or structural dispositions rather than WM-001.
- Wiring_Matrix-S0044 through S0047 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- WM-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: wiring_matrix_generated_tail_batch_201
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0047
preserved_exact_tokens:
- source_preserving_planunit
- Wiring Matrix (Canonical)
- Wiring_Matrix-S0044
- Wiring_Matrix-S0047
- Migration Coverage
- PlanUnits
- Owner / Consumer Map
negative_constraints:
- WM-001 must not provide product implementation coverage for Wiring_Matrix-S0001 through S0047 after Phase 2B batch 201.
- WM-001 must not override WM-002 through WM-035 or later fine-grained Wiring Matrix PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for Wiring_Matrix.md.
preserved_contractrefs:
- ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated WM-001 bridge are lineage only and are not promoted as active ContractRefs.
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former WM-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/Wiring_Matrix.md
```

## Migration Coverage

Original hash: `b1b5c11a92299e43899c9697d2a6a58b37cdb1b3ba7360c956f7cddfee7cf4b6`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 199 atomized `Wiring_Matrix-S0001` through `Wiring_Matrix-S0031` into fine-grained PlanUnits `WM-002` through `WM-023`, while structurally dispositioning references and container headings in `Wiring_Matrix-S0015`, `Wiring_Matrix-S0027`, and `Wiring_Matrix-S0029`. `WM-001` is narrowed to residual source-preserving coverage for `Wiring_Matrix-S0032` through `Wiring_Matrix-S0047` only and must not override the fine-grained units. Batch 199 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

Phase 2B batch 200 atomized `Wiring_Matrix-S0032` through `Wiring_Matrix-S0043` into fine-grained PlanUnits `WM-024` through `WM-035`, while structurally dispositioning container headings in `Wiring_Matrix-S0033`, `Wiring_Matrix-S0036`, `Wiring_Matrix-S0037`, `Wiring_Matrix-S0039`, and `Wiring_Matrix-S0041`. `WM-001` is narrowed to residual source-preserving generated-tail coverage for `Wiring_Matrix-S0044` through `Wiring_Matrix-S0047` only and must not override `WM-002` through `WM-035`. Batch 200 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

Phase 2B batch 201 structurally dispositioned generated tail spans `Wiring_Matrix-S0044` through `Wiring_Matrix-S0047`: Owner / Consumer Map, PlanUnits heading, the former generated `WM-001` bridge, and Migration Coverage. `WM-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode: source_preserving_bridge_retired`; `Plans/Wiring_Matrix.md` no longer has active `source_preserving_planunit` coverage. Batch 201 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260615-001

### WM-036 - Runtime Wiring Addenda Consolidation Boundary

```yaml
plan_unit_id: WM-036
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Wiring_Matrix runtime recovery, blocked/unblocked, safe-point, remediation,
  canonical event row, and recovery action-binding addenda are consolidated into
  explicit producer/consumer/action wiring PlanUnits. Historical `Scheduler/Remediation/Event
  Wiring Addendum (2026-03-08)`, `Canonical Runtime Event Wiring Canonical Alignment
  (2026-03-09)`, and `Canonical Runtime Producer Consumer and Action Wiring Canonical
  Alignment (2026-03-09)` headings remain source-lineage and compatibility search
  targets; wiring implementers must follow the named PlanUnits and referenced
  Contracts_V0 event identities instead of inferring precedence from adjacent
  addendum order.
gui_related: false
gui_classification_reason: This unit defines runtime producer/consumer/action wiring and precedence; GUI consumers are referenced, but the unit does not define visual presentation.
depends_on:
  - WM-012
  - WM-013
  - WM-014
  - WM-015
  - WM-016
  - WM-017
unblocks: []
acceptance_criteria:
  - Runtime wiring precedence is explicit through PlanUnits for blocked/unblocked, safe-point, remediation, packet wiring, canonical event rows, and recovery action binding.
  - Legacy aliases and addendum headings/dates remain auditable without becoming competing wiring canon.
  - Wiring_Matrix remains a wiring-row owner and does not replace Contracts_V0 event identity or Executor scheduler ownership.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: wiring_addenda_precedence_drift
reasoning_tier: high
context_scope: wiring_matrix_runtime_addenda_consolidation
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: runtime_wiring_addenda_consolidation
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0013
  - pldg-20260615-001-part-4-fable-cleanup:atom-0014
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/Wiring_Matrix.md:207
  - local:Plans/Wiring_Matrix.md:243
  - local:Plans/Wiring_Matrix.md:255
  - local:Plans/Wiring_Matrix.md:282
preserved_exact_tokens:
  - "Scheduler/Remediation/Event Wiring Addendum (2026-03-08)"
  - "Runtime recovery wiring requirements (2026-03-09)"
  - "Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)"
  - "Canonical Runtime Producer Consumer and Action Wiring Canonical Alignment (2026-03-09)"
  - "node.blocked"
  - "node.unblocked"
  - "wizard.blocked"
  - "wizard.unblocked"
  - "attempt.started"
  - "attempt.completed"
  - "node.prerequisite_resolved"
  - "run.graph_canonical_locked"
  - "run.graph_integrity_failed"
  - "safe_point.created"
  - "safe_point.restored"
  - "remediation.spawned"
  - "remediation.resolved"
  - "allowed_action_id"
negative_constraints:
  - Do not rely on adjacent addendum order as wiring precedence.
  - Do not make Wiring_Matrix a general runtime schema owner.
compatibility_only_notes:
  - Plans/chain-wizard-flexibility.md remains the wizard_status / wizard blocked lifecycle consumer/existing-coverage surface for wizard.blocked / wizard.unblocked; WM-036 only wires canonical event/action identities.
  - Cited wiring addenda sections are compatibility/source-lineage sections; named wiring PlanUnits and Contracts_V0 event identities carry precedence.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
```

### WM-037 - Assistant Chat Goal Command Wiring

```yaml
plan_unit_id: WM-037
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Wiring_Matrix binds Assistant Chat Goal Mode command producers to stable command IDs and the Goal Runtime controller. Goal button/chip/icon activation and slash `/goal` dispatch `cmd.chat.goal.start`; Goal status update icon, `/goal again`, and natural-language update requests dispatch `cmd.chat.goal.update`. Wiring uses the Goal Runtime event envelope and does not define concrete Goal event payload schemas.
gui_related: true
gui_classification_reason: This unit wires user-visible Assistant Chat Goal button, chip, icon, slash command, and status update surfaces to command IDs.
depends_on:
  - UCC-096
  - CS-051
  - ACD-416
unblocks: []
acceptance_criteria:
  - Goal activation producers route to `cmd.chat.goal.start`.
  - Goal update producers route to `cmd.chat.goal.update`.
  - Goal command wiring targets the Goal Runtime controller without re-owning Goal Runtime lifecycle semantics.
  - Wiring rows avoid inventing concrete Goal event names or payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future wiring coverage validation
risk_class: goal_command_wiring_gap
reasoning_tier: standard
context_scope: assistant_chat_goal_commands
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: assistant_chat_goal_command_wiring
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
  - source_ref:audit-20260616-006-goal-runtime-system:SR-018
preserved_exact_tokens:
  - "/goal"
  - "/goal again"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "Goal button/chip/icon"
  - "Goal status update icon"
negative_constraints:
  - Do not make Wiring_Matrix the owner of concrete Goal Runtime event payload schemas.
  - Do not route Goal command wiring through unregistered local command IDs.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### WM-038 - Planning Product Command And Event Wiring

```yaml
plan_unit_id: WM-038
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Approve And Build atomically writes the immutable pack, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, and pack hash; duplicate delivery returns the existing PlanCompileRun rather than creating another run. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting
  build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Orchestrator_Page.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0104
- atom-0105
- atom-0125
- atom-0154
- atom-0160
decision_refs:
- dec-0021
- dec-0025
- dec-0029
correction_refs: []
preserved_exact_tokens:
- PlanApproved
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- GoalRunStarted
- BuildStarted
- activation transaction
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
- doc-impact pass
negative_constraints: []
owner_hints:
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Orchestrator_Page.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Wiring Matrix owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### WM-039 - Notifications And Sounds Settings Wiring

```yaml
plan_unit_id: WM-039
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Notifications and Sounds wiring maps `cmd.settings.open_notifications` to Settings > General > Notifications & Sounds;
  destination create/update/delete/toggle/test commands to notification destination storage, credential custody, live-send
  authority, delivery service, and receipt projection; mapping/override commands to global/project override records; and
  sound preview/upload/pack import/asset delete/asset restore/asset export/mapping set commands to sound asset validation,
  manifest storage, PM-managed blobs, and local-only preview. Destination create/update wiring validates provider-specific
  Slack, Discord, generic webhook, ntfy, Pushover, and Telegram profile payloads against CV-298 before writing non-secret
  settings and credential refs. This PlanUnit records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible settings command wiring and command-to-surface behavior.
depends_on: [UCC-103, F3-405, CV-298, SP-222, PS-124]
unblocks: [ATS-016]
acceptance_criteria:
  - Destination test-send wiring requires explicit user action, enabled destination, masking, rate limit, and receipt recording.
  - Provider-specific destination payloads are validated before storage or live-send test wiring can proceed.
  - Sound preview wiring stays local-only and cannot send remote notifications.
  - Global/project override wiring follows built-in < global < project < runtime safety constraints.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notifications and Sounds wiring fixtures
risk_class: notification_wiring_gap
reasoning_tier: high
context_scope: notifications_sounds_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Settings command wiring
node_compile_hint:
  mode: notifications_sounds_settings_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-settings-gui-command-wiring
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-global-project-overrides
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
source_atom_ids: [atom-0064, atom-0065, atom-0068]
preserved_exact_tokens:
  - "cmd.settings.open_notifications"
  - "cmd.notifications.destination.create"
  - "cmd.notifications.destination.update"
  - "cmd.notifications.destination.delete"
  - "cmd.notifications.destination.toggle"
  - "cmd.notifications.destination.test"
  - "cmd.notifications.mapping.update"
  - "cmd.notifications.override.set"
  - "cmd.sound.preview"
  - "cmd.sound.upload"
  - "cmd.sound.pack.import"
  - "cmd.sound.asset.delete"
  - "cmd.sound.asset.restore"
  - "cmd.sound.asset.export"
  - "cmd.sound.mapping.set"
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, or executable queues during this compile phase.
  - Do not wire local preview through remote delivery.
  - Do not let quiet/mute override blocked or security-sensitive notifications.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding route wiring obligations from bootstrap ledger `pldg-20260701-001-feature-intake` into Wiring_Matrix ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, wiring JSON, generated governance artifacts, or a governance seal.

### WM-041 - First-Run Onboarding CTA And Route Wiring

```yaml
plan_unit_id: WM-041
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  First-run onboarding wiring maps the visible wizard CTAs to the UI_Command_Catalog onboarding command family and
  owner-doc consumers. `Set up a paid provider`, `Use this provider`, `Sign in`, `Set up provider`, and `Reconnect`
  open or resume provider/account setup with return context. `Skip for now` writes or references limited
  `onboarding_setup_state` and opens Planning Wizard in limited setup state without marking Doctor/Health Ready.
  `Review Free Models`, `Maybe later`, and `Continue to Planning Wizard` preserve the paid-provider-before-Free-Models
  sequence and saved top-10 order. `Open Planning Wizard` routes to Planning Wizard as the first full app page after
  setup or skip. The onboarding Teacher copy routes through Assistant Chat/Teacher contracts rather than a separate
  Teacher surface. Health/Doctor `Set up provider` reuses the same provider setup route and return context. This PlanUnit
  records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible CTA routing, first-run step transitions, and cross-surface GUI route behavior.
depends_on: [F3-411, UCC-106, CV-305, MA-066, MS-122, ACD-431, PWIZ-017]
unblocks: [ATS-020]
acceptance_criteria:
  - Every accepted first-run CTA maps to a cataloged UI command or existing Teacher/Planning Wizard route.
  - Skip routing preserves limited setup state and cannot produce a false-ready Health state.
  - Provider setup return context routes back to onboarding, Planning Wizard limited state, Health, or the originating Free Models row/list as appropriate.
  - Free Models review/defer wiring occurs only after the paid-provider prompt.
  - Wiring consumes owner docs rather than redefining provider auth, model readiness, Teacher behavior, or Planning Wizard state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding command wiring fixture
  - future Health provider-setup return-route fixture
risk_class: onboarding_wiring_gap
reasoning_tier: high
context_scope: first_run_onboarding_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future first-run onboarding route wiring
node_compile_hint:
  mode: first_run_onboarding_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0032
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
source_atom_ids: [atom-0016, atom-0032, atom-0033, atom-0035, atom-0036, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "Set up a paid provider"
  - "Use this provider"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Skip for now"
  - "Review Free Models"
  - "Maybe later"
  - "Continue to Planning Wizard"
  - "Open Planning Wizard"
  - "onboarding_setup_state"
  - "Provider setup is not finished"
  - "Teacher"
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, executable queues, or runtime dispatch during this compile phase.
  - Do not route skip to the dense Home shell by default.
  - Do not mark Doctor/Health as Ready when provider setup was skipped.
  - Do not define UICommand payload/result schemas outside UI_Command_Catalog.
  - Do not redefine provider/account readiness or Teacher behavior in Wiring_Matrix.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```

### WM-040 - DRY Method Settings Wiring

```yaml
plan_unit_id: WM-040
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  DRY Method settings wiring maps `cmd.settings.agent_rules.dry_method_default_guard.set` from Settings > General >
  Agent Rules to `app.agent_rules.dry_method_default_guard` storage, emits
  `settings.agent_rules.dry_method_default_guard.updated`, refreshes Assistant Chat and run-detail DRY disclosure
  projections, and records receipt provenance for enabled and disabled_by_user states. This wiring does not generate
  wiring JSON and does not disable explicit instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when the default DRY guard is turned off.
gui_related: true
gui_classification_reason: Defines user-visible settings toggle wiring and disclosure refresh behavior.
depends_on: [UCC-104, CV-299, SP-223, ACD-429]
unblocks: [ATS-018]
acceptance_criteria:
  - The Settings toggle writes only enabled or disabled_by_user to the DRY default-guard setting.
  - Assistant Chat and run-detail disclosures refresh after the setting changes.
  - Disabled DRY state remains receipt-backed and does not bypass non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method settings wiring fixture
risk_class: dry_method_settings_wiring_gap
reasoning_tier: high
context_scope: dry_method_settings_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Settings command wiring
node_compile_hint:
  mode: dry_method_settings_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0073, atom-0074, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "settings.agent_rules.dry_method_default_guard.updated"
  - "DRY applied"
  - "DRY degraded"
  - "DRY disabled"
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, or executable queues during this compile phase.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not hide trust-affecting DRY state in backend logs only.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```
