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

`Plans/Wiring_Matrix.production.json` is the production wiring-matrix JSON artifact for the current GUI/PMConcept repair packet and validates against `Plans/Wiring_Matrix.schema.json`. It contains one map entry per schema-valid production command/control binding, keyed by `ui_element_id`, with `ui_command_id`, `handler_location`, expected event types, acceptance checks, required evidence, typed state selector, disabled-reason projection, effect contract, accessibility contract, and test evidence. `Plans/Wiring_Matrix.production.exclusions.json` records command-family roots, parser false positives, glob tokens, invalid historical aliases, and compatibility-only namespace roots that must not count as production coverage.

The schema command pattern now allows underscores in every command segment so accepted namespaces such as `cmd.source_control.*`, `cmd.prd_builder.*`, `cmd.planning_wizard.*`, and `cmd.plan_compile.*` can be represented without inventing alternate command names.

### PMConcept control reconciliation artifact

`Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and dispositions. The current generated summary is:

| Metric | Count |
|---|---:|
| Control-like nodes inventoried | 1284 |
| Inline-handler controls | 339 |
| Controls containing `cmd.*` tokens | 71 |
| Controls with accessibility gaps | 250 |
| Controls with local/demo markers | 13 |
| Concept fixture-only controls | 64 |
| Production wiring required | 44 |
| Production-intended controls missing a command | 0 |
| Concept-only controls already owner-adjudicated as source-lineage | 1175 |
| Concept-only controls pending owner adjudication before promotion | 0 |
| Production accessibility gaps | 0 |
| Production accessibility contracts added | 17 |
| Retired or re-scoped non-launch controls | 1 |

Controls marked `concept_fixture_only` are source-lineage fixtures only and cannot satisfy acceptance evidence. Controls marked `concept_only_owner_adjudicated` are already adjudicated as concept/source-lineage only; they are not production evidence and are not promoted unless a canonical owner doc accepts the behavior and a production wiring row supplies command, state selector, disabled reason, handler, receipt/event effect, accessibility contract, and test evidence. `concept_only_pending_owner_adjudication` is currently 0. Controls marked `retired_or_rescoped_non_launch_authority` include stale `START`, `BUILD`, and `Approve & Continue` launch semantics.

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

Wiring matrix entries are verified by **GATE-010** (see `Plans/Progression_Gates.md`) through `python3 scripts/pm-plans-verify.py validate-wiring-matrix`, `run-gates`, and `audit-governance`.

### 4.1 Schema validation
All wiring matrix JSON artifacts MUST validate against `Plans/Wiring_Matrix.schema.json`.
GATE-010 runs JSON Schema validation as its first check and fails production rows that lack typed state selector, disabled-reason projection, effect contract, accessibility contract, test evidence, or event-test requirements.

### 4.2 Coverage
Every `cmd.*` ID in `Plans/UI_Command_Catalog.md` MUST have at least one wiring matrix entry unless `Plans/Wiring_Matrix.production.exclusions.json` records the token as a parser false positive, glob token, invalid historical alias, generic family root, or compatibility-only namespace root.
GATE-010 extracts command IDs from the catalog, applies the exclusions, and verifies each remaining command has a corresponding production entry.
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
| Thread context click `Compact Now` | `cmd.chat.compact_context` | chat header Compact Now action | chat runtime controller | Dispatch only after explicit user choice; project the receipt/result as started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, or failed; no `context.compaction.*` EventRecord family is currently registered |
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
- Browser runtime wiring assumes the PM-native, tab-first Browser Program model: `workspace_preview` is the user-facing editor/browser session, `detached_preview` is the same subject in a detached window when supported, and `automation_session` is a visible/watchable ordinary agent-driven web-app/testing session. Protected `AuthBrowserSession` is a separate foreground human-only domain-scoped flow, not an ordinary navigation subject.
- Legacy `auth_session` navigation/copy/share/capture wiring is retired. Protected `AuthBrowserSession` is ephemeral, never restored or auto-completed, and has no generic navigation/reload, selection, programmatic clipboard, share, capture, recording, DOM/PageRepresentation, console, network, storage/profile, artifact, agent, tool, BSD, or awareness-detail wiring.
- Live `automation_session` direct user input routes through user-takeover wiring: prompt actions are `Take over and pause agent`, `Let agent continue`, and `Stop agent and keep browser`; default highlighted action is `Take over and pause agent`; user-takeover leaves no half-owned session, and `/stop/take-over` or `/stop/take` handling must pause, stop, or take over rather than silently auto-resume work.
- Browser capture is explicit, chip-based, share-to-chat, and non-auto-send: ordinary clicks do not inject `/context`; `/highlight/share-to-chat`, `/highlight/share`, `/highlighting`, `/highlight`, `/elements`, `/selection`, `/DOM`/DOM, URL, and source anchors create removable pending composer chips, allow multi-capture, and attach to an active `/thread` or open a new thread when needed.
- Browser capture commands include `Add Selection to Chat`, `Pick Element for Chat`, `Add Selection + Screenshot`, `Add Element + Screenshot`, standalone screenshots, and screenshot-with-selection variants; screenshot-with-selection defaults to clipped context while full viewport remains explicit; `/trace/video`, `/video/screenshot`, and `/download` artifacts route through Runtime Artifacts.
- DevTools is a concrete browser UX/tool contract: `Open DevTools` and `Toggle DevTools Dock` are user-visible wiring rows; `/tool` and advanced testing permissions allow when user explicitly opens DevTools or policy permits attach/open, and named actions remain first-class `/capability` paths instead of forcing arbitrary browser-code.
- Recovery wiring preserves ordinary-session URL, tabs, session class, originating identity, and permitted completed artifacts; `workspace_preview` can restore, eligible `detached_preview` follows its originating restored session, and automation never auto-resumes active work. Protected AuthBrowserSession has no restore/reopen/retry-with-state path; close, crash, expiry, restart, or disconnect destroys transient protected state and exterior recovery records only redacted lifecycle/denial facts.

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
| Remote reconnect compatibility wrapper | `cmd.remote.reconnect` resolves one exact `ExecutionEnvironmentId` into canonical `cmd.environment.reconnect` | `Plans/Commands_System.md` + `Plans/Shared_Integration_Runtime.md` | `Plans/GitHub_Integration.md` and remote UI are consumers; one bounded auto-retry precedes this explicit action and no peer connection lifecycle is created. |

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
canonical_text: 'Minimum required rows cover project switcher, thread details, compaction, restore branch, and related shell/chat/history command wiring without losing canonical project/thread identity, including explicit Compact Now dispatch, result/receipt-backed visible degraded-state wiring with no unregistered context.compaction.* EventRecord, and command-result statuses for already_running, cancelled, no_op, unavailable, retry_scheduled, completed, and failed.'
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
negative_constraints:
- The preserved context.compaction.failed token is historical source lineage and must not be emitted or registered as an EventRecord family.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- The former context.compaction.failed event wording is retired; the production row uses command result/receipt projection and an empty expected_event_types list.
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
canonical_text: 'Browser wiring invariants preserve stale source cleanup and PM-native ordinary Browser Program capture, DevTools, takeover, and recovery behavior while structurally denying protected AuthBrowserSession generic navigation, capture, recording, inspection, persistence, artifact, agent/tool, and restore wiring.'
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
- Ordinary and protected-auth subjects are discriminated before command selection; protected_auth has no generic browser command row.
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
  Notifications and Sounds wiring opens the exact Settings target through `cmd.settings.open`; the predecessor
  `cmd.settings.open_notifications` spelling remains searchable source lineage only and is neither a production wiring
  row nor a compatibility alias. Destination create/update/delete/toggle/test commands map to notification destination
  storage, credential custody, live-send authority, delivery service, and receipt projection; mapping/override commands
  map to global/project override records; and sound preview/upload/pack import/asset delete/asset restore/asset export/
  mapping set commands map to sound asset validation, manifest storage, PM-managed blobs, and local-only preview.
  Destination create/update wiring validates provider-specific Slack, Discord, generic webhook, ntfy, Pushover, and
  Telegram profile payloads against CV-298 before writing non-secret settings and credential refs. This PlanUnit records
  wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible settings command wiring and command-to-surface behavior.
depends_on: [UCC-103, F3-405, CV-298, SP-222, PS-124]
unblocks: [ATS-016]
acceptance_criteria:
  - Settings entry uses `cmd.settings.open`; no production row or compatibility alias exists for `cmd.settings.open_notifications`.
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
  - "cmd.settings.open"
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
stale_retired_dispositions:
  - "cmd.settings.open_notifications is source-lineage-only; it is neither a production row nor a compatibility alias."
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

## Usage GUI Propagation Addendum - 2026-07-09

This addendum constrains generated wiring validation for Usage route/open commands. It creates no generated wiring JSON, WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, final manifests, or PNC-019 receipts.

### WM-043 - Usage Route Wiring Alias And Correlation Gate

```yaml
plan_unit_id: WM-043
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Production wiring for Usage route/open commands consumes UI_Command_Catalog alias metadata. `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` are retired compatibility aliases and must not appear as canonical production UICommand rows. Typed selector proof is caller-aware: the pre-existing `cmd.artifacts.show_in_usage` and `cmd.artifacts.show_in_ledger` rows remain event-primary with usage_event/usage_event_ref and retain their artifact route/open OpenSubject bridge; event-primary `cmd.nav.open_usage_subject` uses the same event selector without OpenSubject; and a PMConcept7 Ledger attempt row uses `cmd.nav.open_usage_subject` with usage_attempt/attempt_id, retains usage_event_ref as correlation, and carries no OpenSubject. Wiring evidence must prove route_open effect_kind, the command-appropriate selector/OpenSubject disposition, and correlation passthrough for UsageRecord/provider/runtime fields. Current PMConcept7 aggregate provider/account/panel cards are local inspectors with no command, receipt, or event.
gui_related: true
gui_classification_reason: Wiring determines whether visible Usage navigation controls dispatch canonical commands.
depends_on: [WM-034, WM-042, UCC-109, CV-316]
unblocks: []
acceptance_criteria:
  - validate-wiring-matrix fails if production wiring registers `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, or `cmd.chat.close_thread_usage` as canonical command rows instead of compatibility aliases or exclusions.
  - Usage route/open wiring entries declare effect_kind route_open or mixed with route_open detail, not generic receipt-only success; event-primary dispatch proves usage_event/usage_event_ref, while a PMConcept7 Ledger attempt dispatch proves usage_attempt/attempt_id plus usage_event_ref correlation. The two cmd.nav.open_usage_subject selector branches carry no OpenSubject; the two pre-existing artifact rows retain their artifact OpenSubject bridge and remain event-primary; all preserve applicable provider/account/runtime refs.
  - Wiring fixtures prove Usage correlation refs survive dispatch and route restoration without being replaced by timestamp/run/thread/tier filters, while current PMConcept7 aggregate provider/account/panel cards remain local inspectors with no command, receipt, event, route object id, or invented route kind.
  - Wiring evidence distinguishes thread Context Detail Pane commands from app-wide Usage route/open commands.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage route wiring fixture suite
risk_class: usage_wiring_alias_false_certification
reasoning_tier: high
context_scope: usage_route_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: usage_route_wiring_alias_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md:2705-2784"
  - "Plans/Wiring_Matrix.md:3325-3390"
  - "Plans/Wiring_Matrix.production.json:2674"
  - "Plans/Wiring_Matrix.production.json:3664"
  - "Plans/Wiring_Matrix.production.json:4819"
  - "Plans/Wiring_Matrix.production.json:16493"
  - "Plans/UI_Command_Catalog.md:798-799"
preserved_exact_tokens:
  - cmd.chat.open_thread_usage
  - cmd.chat.focus_thread_usage
  - cmd.chat.close_thread_usage
  - cmd.nav.open_usage_subject
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.show_in_ledger
  - route_open
  - route_target.object_kind = usage_event
  - correlation_passthrough
negative_constraints:
  - Do not certify retired chat usage IDs as live production UICommands.
  - Do not let generic family-root exclusions hide concrete stale command rows.
  - Do not accept receipt-only wiring for a command whose effect is route/open navigation.
  - Do not route without the stable selector required by the chosen branch, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, remove the pre-existing artifact OpenSubject bridge without a separately owned migration, substitute correlation identity for the selected object_id, or invent an aggregate-card route kind.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
```

## FABLE Production Wiring Repair Addendum - 2026-07-07

This addendum closes the FABLE production wiring portion of the GUI command/wiring repair. It records contract obligations for `Plans/Wiring_Matrix.production.json` and `Plans/Wiring_Matrix.production.exclusions.json`; it does not create WorkNodes, NodeSeeds, executable queues, runtime handlers, Slint/Rust implementation files, generated governance artifacts, or production build tasks.

### WM-042 - FABLE Production Wiring Semantic Repair

```yaml
plan_unit_id: WM-042
unit_type: validation_rule
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The FABLE production wiring repair requires the production wiring matrix to cover cataloged UI commands after
  exact exclusions, use concrete owner-surface locations instead of generic Cataloged GUI surface rows, remove
  bare namespace-root production rows, replace fabricated command_applied placeholder events with canonical
  event types or explicit no-persist dispatch and route/open receipts, and keep the PRD Builder to Planning Wizard
  to runtime approval to Plan Compile open-build chain wired with projected availability and disabled reasons.
gui_related: true
gui_classification_reason: Defines user-visible command wiring, projected availability, disabled reasons, and route/open behavior.
depends_on: [UCC-108]
unblocks: [PG-061]
acceptance_criteria:
  - validate-wiring-matrix passes against the production matrix and exact exclusion list.
  - No production row uses `Cataloged GUI surface` as a concrete location.
  - No production row emits `*.command_applied` placeholder events.
  - Bare command namespace roots are excluded as parser artifacts or compatibility roots, not represented as production UI rows.
  - Commands with no persisted domain event declare explicit no-persist dispatch or route/open receipts and event-test requirements.
  - Launch-chain rows preserve CAS/currentness, projected availability, disabled reasons, and receipt/event effects without claiming runtime buildability.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: production_wiring_semantic_drift
reasoning_tier: high
context_scope: fable_gui_command_wiring_gate_repair
implementation_surfaces:
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/UI_Command_Catalog.md
  - future UI command dispatcher fixtures
node_compile_hint:
  mode: production_wiring_semantic_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-launch-approval-chain-preimplementation-proof
preserved_exact_tokens:
  - Cataloged GUI surface
  - "*.command_applied"
  - cmd.prd_builder.approve_for_planning_wizard
  - cmd.planning_wizard.approve_and_build
  - cmd.runtime.approve
  - cmd.plan_compile.open_build
negative_constraints:
  - Do not treat wiring JSON existence as runtime certification or buildability proof.
  - Do not create runtime handlers, WorkNodes, NodeSeeds, executable queues, or production build tasks.
  - Do not fabricate command_applied events for receipt-only or route/open commands.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum preserves the first-run/provider-command proposal from bootstrap ledger `pldg-20260701-001-feature-intake` as source lineage and reconciles WM-041 to the current Product Onboarding and Guided Tour owner contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, wiring JSON, generated governance artifacts, or a governance seal.

### WM-041 - Product Onboarding And Guided Tour Typed Local Action And Owner-Route Wiring

```yaml
plan_unit_id: WM-041
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Current Product Onboarding wiring binds the exact nine-stage `welcome -> simple_path -> first_project ->
  source_control_setup -> server_storage_client -> remote_access_setup -> review_setup_plan -> automatic_preparation ->
  ready` main path and exact six-stage `welcome -> simple_path -> remote_access_setup -> review_setup_plan ->
  automatic_preparation -> ready` connect-existing shortcut to exactly thirteen typed local actions:
  `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`,
  `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
  `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. These
  actions transition or project local Product Onboarding state; they are not UICommands and receive no command-catalog
  row, semantic command handler, generic Onboarding mutation handler, or EventRecord. They use the closed
  pm.product_onboarding.action_request.v1 -> pm.product_onboarding.action_result.v1 local contract. Every request has
  required closed, normalized, secret-free local_context fields; arbitrary/raw payload fields, additional keys, and
  secret-bearing values are rejected. Exact intent/scope/choice/branch combinations distinguish setup/project disclosure
  from branch-local more_ways updates and whole-session Skip from Project/Remote-Access optional-scope Skip. When a selected branch needs owner
  work, its local draft queues only the typed owner route and intent. No network probe, command, handler, or owner
  mutation is reachable until the person confirms the current `review_setup_plan`. That confirmation binds
  `path_kind`, `queued_setup_plan_ref`, `queued_setup_plan_revision`, `reviewed_setup_plan_revision`,
  `review_confirmation=person_confirmed_reviewed_plan`, `approved_setup_plan_sha256`, revision, and continuation
  generation; only a matching `automatic_preparation_currentness_ref` admits the existing canonical command to that
  owner's sole handler once. Current owner ObservableWork/results/receipts reverse-project through the exact reviewed
  revision and plan hash; terminal success may advance without a second confirmation, while stale, mismatched, blocked,
  failed, cancelled, or recovery-required results dispatch nothing new and cannot replace the last accepted projection.
  Session/continuation wiring preserves independent `scm_backend_selection` for local Git/Jujutsu Safe History and
  `forge_provider_selection` for an optional online copy. Legacy migration supplies exact `mapped_stage_counts` and
  `mapped_path_counts`, maps unresolved work to unconfirmed Review, and never replays owner work.

  Guided Tour wiring is a separate ephemeral three-scene film in exact `usage -> planning_wizard -> chat_teacher` order
  over the real mounted application. Its exact ten typed local actions are `ui.guided_tour.start`,
  `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`,
  `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and
  `ui.guided_tour.replay`; they are not UICommands, owner mutations, EventRecords, or persistence authority. Usage Watch
  observes the same real card hide and return through widget-owner results, and Usage Try advances only from that same
  card's exact mounted Options control. Planning advances only from the exact mounted intent-chip result. Chat is placed
  at the far right through the layout owner, then advances only through the real guide selector, `Teacher` selection,
  real composer send, and deterministic local reply in that conversation. ELI5 stays at the top beside Pause and Skip;
  Reduced Motion is read from and changed through Settings, never a Tour-owned toggle. Skip reverse-routes restoration of
  the captured pre-tour layout, composer placeholder, and focus through their existing owners; Finish retains Chat at the
  far right without a keep-layout action. Generic Next, narration, timers, or look-alike controls cannot fabricate a
  performed checkpoint. Guided Tour state is not persisted, and static/schema/browser evidence proves no native handler.

  The eleven predecessor
  `cmd.onboarding.*` spellings listed below and their provider-first/Free-Models CTA choreography remain searchable source
  lineage only; none is a production wiring row or compatibility alias. The separate packet candidates
  cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish,
  cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are source-lineage candidate tokens only and
  are rejected as commands, aliases, and handlers because typed local ui.onboarding.* actions own those semantics. This
  PlanUnit records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible nine-/six-stage Product Onboarding and three-scene Guided Tour actions, transitions, reverse wiring, and owner-routed GUI behavior.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, F3-520]
unblocks: []
acceptance_criteria:
  - The main path is exactly `welcome`, `simple_path`, `first_project`, `source_control_setup`, `server_storage_client`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready`; the connect-existing shortcut is exactly `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready`, omitting rather than executing the three main-path-only stages.
  - Back consumes the exact durable path history: connect-existing `remote_access_setup` returns to `simple_path`, while main-path `remote_access_setup` returns to `server_storage_client`; no skipped shortcut stage is synthesized into reverse wiring.
  - The exact current action set contains the thirteen named `ui.onboarding.*` IDs; every authored control emits one typed local action and no action is registered as a UICommand, domain event, or production wiring row. `simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior.
  - Requests and results validate against the closed action schema; applied, disabled, and rejected are distinct, and disabled/rejected results dispatch no owner work, write no session/continuation, carry no production receipt, and expose exact reasons.
  - Every request carries the exact required closed local_context fields intent, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition. `review_confirmation` is the sole additionally admitted field and is required only for the schema-gated current Review/Automatic-Preparation owner-flow cases; missing gated proof, any other additional/arbitrary/raw field, or secret-bearing context fails closed.
  - more_ways uses toggle_setup_options plus setup_options/project_options and a matching choice for stage disclosure, or update_branch_state plus non-null canonical branch_kind and choice=null for branch-local updates; the variants cannot normalize into each other.
  - Skip uses skip_product_onboarding/product_onboarding/choice=null with session_skipped and skipped status, or skip_optional_scope with matching Project/Remote-Access choice/scope/branch and optional_scope_skipped while the session remains active.
  - Defer durably writes exact path/stage/setup-mode/local-backend/forge/queued-plan/review/branch/history/revision/continuation/initiating-Client/focus-return state before dismissal; Close is non-completing; Skip records an explicit skipped session; Details is ephemeral, same-stage, non-persistent, and has no owner command.
  - Every inline SVG `?` choice-help control reuses `ui.onboarding.open_details` with `intent=toggle_choice_explanation`, exact current-stage scope, a stable help-topic `selection_ref`, and exact expanded state; it is same-stage, non-persistent, keyboard reachable, accessibility-linked, and owner-route-free.
  - Before person confirmation of the current Review revision, all choices are local draft writes or cached reads and reverse wiring exposes no network probe, owner route, command, handler, mutation, or production receipt.
  - Person confirmation requires matching `path_kind`, `queued_setup_plan_ref`, queued/reviewed revision, exact approved-plan SHA-256, session revision, and continuation generation. Automatic Preparation additionally requires the matching currentness ref; stale, unconfirmed, expanded, revision-mismatched, hash-mismatched, path-mismatched, or currentness-mismatched plans dispatch nothing.
  - Owner work uses the selected owner's existing canonical command and sole handler; each unchanged reviewed operation dispatches at most once, current terminal owner results reverse-project through ObservableWork/receipt refs, and retry/reload/resume observes the existing dedupe identity instead of launching a duplicate.
  - Confirmed intents route only to existing Project, Git/Jujutsu/forge, Server/Storage/Client, Remote Access, backup/restore, provider, authentication, Settings, widget, layout, Planning, or Assistant Chat owners as applicable; Wiring Matrix creates no parallel owner or generic mutation handler.
  - A new local Project routes through `cmd.project.new_local {init_git:true}`; `cmd.source_control.repository.init` has no request, alias, handler, or visible route.
  - Safe History backend selection (`git|jujutsu|null`) is local and independent from optional forge selection (`github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|cursor_origin|none|null`). Git and Jujutsu have no service accounts; account connection/sign-in or verified official signup-page handoff, repository list/create, backend-appropriate clone/publish, and Project registration follow their existing owners and exact terminal results.
  - First Project, Source Control, Server/Storage/Client, and Remote Access remain distinct progressive stages and owner routes; protected AuthBrowserSession content and credentials never enter Onboarding state, transport, or evidence.
  - Legacy provider-first/four-screen, predecessor-five-stage, and superseded seven-stage rows map once to the first unresolved current stage, force `review_confirmation=unconfirmed`, report exact `mapped_stage_counts` and `mapped_path_counts`, quarantine secret-bearing rows, and never replay owner work.
  - Skip and Close preserve truthful incomplete state, and arrival at `ready` never marks skipped Server, provider, Project, restore, Doctor, or other owner work Ready.
  - Guided Tour uses exactly the three scenes `usage`, `planning_wizard`, `chat_teacher` and exactly the ten named `ui.guided_tour.*` actions; those actions are typed local transport only, the session is ephemeral/nonpersisted, and no Tour action is a command, owner handler, or EventRecord.
  - The `ui.guided_tour.focus_route` action changes only the mounted application's visible route and focus; it cannot satisfy an owner-observed performed checkpoint.
  - Tour Next and Back may reverse-route watch-only narration with exact scene-heading focus, but neither can satisfy Usage Options, Planning intent, Teacher selection, composer send, deterministic reply, or any other required performed checkpoint.
  - Usage Watch observes one real card's owner-confirmed hide and return, and Usage Try advances only from that same card's exact mounted Options control; move, resize, configure, and focus are explanation text rather than separate performed checkpoints.
  - Planning advances only from the exact mounted Planning intent-chip handler result. Chat is owner-placed at the far right and advances only through the real guide selector, `Teacher`, a real composer send, and a deterministic local reply in the same conversation.
  - ELI5 is at the top beside Pause and Skip. Effective Reduced Motion is a Settings-owned projection/change route; Guided Tour has no Reduced Motion setting or action.
  - Skip restores the exact captured pre-tour layout, composer placeholder, and focus through existing owners; Finish keeps Chat at the far right. Neither behavior introduces `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, or a generic owner mutation.
  - Retired five-chapter ordering and `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` have no current Tour control, request, alias, handler, or production row; similarly named canonical layout or Settings commands remain available to unrelated non-Tour consumers under their existing owners.
  - Disabled/rejected Tour actions change no scene or owner state. Stale owner observations, missing exact mounted targets, restoration failure, layout failure, or deterministic-reply failure pause or fail closed with a named recovery reason and never synthesize completion.
  - The eleven listed `cmd.onboarding.*` spellings remain source-lineage-only and appear as neither production wiring rows nor compatibility aliases.
  - The eight packet candidate `cmd.onboarding.*` tokens remain source-lineage-only and are rejected as commands, aliases, handlers, and production rows.
  - The provider-first, paid-provider-before-Free-Models, direct limited-Planning-Wizard, and Teacher-copy proposal is predecessor lineage rather than current stage, route, or command authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - Concepts/pm7-tools/onboarding_cinematic_source.py static assertions
  - Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
  - future native Product Onboarding and Guided Tour local-action, owner-route, reverse-wiring, accessibility, and visual fixtures
risk_class: onboarding_fake_command_or_parallel_owner_wiring
reasoning_tier: high
context_scope: product_onboarding_and_guided_tour_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Product Onboarding and Guided Tour local-action and owner-route bindings
node_compile_hint:
  mode: product_onboarding_typed_local_action_wiring
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
  - "welcome"
  - "simple_path"
  - "first_project"
  - "source_control_setup"
  - "server_storage_client"
  - "remote_access_setup"
  - "review_setup_plan"
  - "automatic_preparation"
  - "ready"
  - "path_kind"
  - "queued_setup_plan_ref"
  - "queued_setup_plan_revision"
  - "reviewed_setup_plan_revision"
  - "review_confirmation"
  - "approved_setup_plan_sha256"
  - "automatic_preparation_currentness_ref"
  - "mapped_stage_counts"
  - "mapped_path_counts"
  - "scm_backend_selection"
  - "forge_provider_selection"
  - "ui.onboarding.start"
  - "ui.onboarding.next"
  - "ui.onboarding.back"
  - "ui.onboarding.close"
  - "ui.onboarding.skip"
  - "ui.onboarding.defer"
  - "ui.onboarding.open_details"
  - "ui.onboarding.more_ways"
  - "ui.onboarding.choose_simple_path"
  - "ui.onboarding.open_owner_flow"
  - "ui.onboarding.run_automatic_preparation"
  - "ui.onboarding.choose_first_project"
  - "ui.onboarding.finish"
  - "usage"
  - "planning_wizard"
  - "chat_teacher"
  - "ui.guided_tour.start"
  - "ui.guided_tour.next"
  - "ui.guided_tour.back"
  - "ui.guided_tour.pause"
  - "ui.guided_tour.resume"
  - "ui.guided_tour.skip"
  - "ui.guided_tour.focus_route"
  - "ui.guided_tour.toggle_eli5"
  - "ui.guided_tour.finish"
  - "ui.guided_tour.replay"
  - "local_context"
  - "skip_product_onboarding"
  - "skip_optional_scope"
  - "toggle_setup_options"
  - "update_branch_state"
  - "session_skipped"
  - "optional_scope_skipped"
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
  - "cmd.onboarding.back"
  - "cmd.onboarding.cancel"
  - "cmd.onboarding.continue"
  - "cmd.onboarding.defer"
  - "cmd.onboarding.finish"
  - "cmd.onboarding.open_details"
  - "cmd.onboarding.resume"
  - "cmd.onboarding.skip"
stale_retired_dispositions:
  - "server_setup is superseded seven-stage source lineage only; current wiring uses server_storage_client."
  - "The five-chapter chat_teacher, shell_navigation, panel_layout, widget_workspace, planning_wizard order is retired source lineage and never a current Tour route."
  - "ui.guided_tour.restore_layout is retired as a Tour action; existing layout-owner commands remain available to unrelated consumers."
  - "ui.guided_tour.keep_layout is retired as a Tour action; existing layout-owner commands remain available to unrelated consumers."
  - "ui.guided_tour.toggle_reduced_motion is retired as a Tour action; Settings remains the sole Reduced Motion owner for every consumer."
  - "cmd.onboarding.first_run.open is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.provider_setup.open is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.provider_setup.use_provider is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.skip_to_planning_wizard is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.review is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.defer is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.review_setup is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.open_planning_wizard is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.refresh is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.retry is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.setup is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are packet source-lineage candidates rejected as commands, aliases, and handlers."
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, executable queues, or runtime dispatch during this compile phase.
  - Do not register a `cmd.onboarding.*` semantic command, production row, compatibility alias, generic handler, or EventRecord.
  - Do not give a local `ui.onboarding.*` action a fictitious domain handler or let it replay owner work.
  - Do not accept open-ended local_context, raw/arbitrary payload copies, secret-bearing values, or ambiguous more_ways/skip variants.
  - Do not claim native Slint, dispatcher, handler, persistence, or runtime wiring from schemas, static assertions, PMConcept7, or browser evidence.
  - Do not turn the bounded modal into a route or add browser-style Back/breadcrumb chrome.
  - Do not restore the provider-first flow, add provider/advanced setup/Guided Tour as a canonical stage, or treat `ready` as owner readiness.
  - Do not dispatch any external Onboarding owner work before person-confirmed current Review or accept a stale revision, hash, path, continuation, or currentness ref.
  - Do not restore the retired five-chapter Tour, synthesize separate move/resize/configure/focus checkpoints, or admit retired restore-layout, keep-layout, or Tour-owned Reduced Motion actions.
  - Do not let narration, timers, generic Next, look-alike controls, or browser/static fixtures fabricate a performed Tour checkpoint, owner result, native handler, production receipt, or completion.
  - Do not persist Guided Tour scene, status, Teacher text, focus, motion, demonstrated-action, or completed-action state.
  - Do not redefine installation, claim, pairing, remote access, provider auth, Project, backup/restore, update, Doctor, storage, or Planning Wizard engines in Wiring_Matrix.
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
  projections, binds the SSYS-023 Settings consumer to the same requested/effective owner projection, and records receipt
  provenance for enabled and disabled_by_user states. This wiring does not generate
  wiring JSON and does not disable explicit instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when the default DRY guard is turned off.
gui_related: true
gui_classification_reason: Defines user-visible settings toggle wiring and disclosure refresh behavior.
depends_on: [UCC-104, CV-299, SP-223, ACD-429, SSYS-023]
unblocks: [ATS-018]
acceptance_criteria:
  - The Settings toggle writes only enabled or disabled_by_user to the DRY default-guard setting.
  - Assistant Chat and run-detail disclosures refresh after the setting changes.
  - Disabled DRY state remains receipt-backed and does not bypass non-DRY authority boundaries.
  - Settings renders the same requested/effective DRY owner projection and never becomes a second DRY owner.
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

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum records the production wiring absorption of the Cozy Shelves catalog registrations (UI_Command_Catalog Cozy Shelves Panel Reconciliation Addendum - 2026-07-27, UCC-127..UCC-138); the contract content lives in `Plans/Wiring_Matrix.production.json`, not in this file, and no markdown wiring tables are added here.
Thirty-six planned wiring rows were appended to `Plans/Wiring_Matrix.production.json` (`catalog.github_actions_rerun` through `catalog.docker_compose_open_file`) covering the newly registered canonical commands of the eight rail panels, each carrying handler target, `state.cmd_<snake>.enabled` / `state.cmd_<snake>.disabled_reason` projections, receipt-or-event effect, accessibility contract, and the six test-evidence class placeholders from the PMConcept_Control_Reconciliation template.
Every appended row is future-evidence-only: `handler_status: planned` and `owner_doc_ref` are recorded in each row's `evidence_required` field per the established planned-row convention, because `Plans/Wiring_Matrix.schema.json` forbids additional top-level fields; no row asserts that any handler, runtime, or Slint surface exists.
`Plans/Wiring_Matrix.production.exclusions.json` gains the `cmd.agents` / `cmd.editor` family roots, the retired or alias prototype tokens adjudicated by the catalog addendum, and the concept_fixture_only demo verbs from the concept shell, keeping the catalog-to-production coverage gate closed in both directions.
This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks, and validation runs through `python3 scripts/pm-plans-verify.py run-gates` (validate-wiring-matrix) executed by the orchestrated pipeline after all reconciliation docs land.

## u11 Prism II Usage Wiring Addendum - 2026-08-18

This addendum records the wiring obligation for the one new Usage command registered by UCC-146. One row,
`catalog.usage_forecast_request`, is appended to `Plans/Wiring_Matrix.production.json` with all thirteen
required fields. The addendum generates no wiring JSON of its own and creates no WorkNodes, NodeSeeds,
executable queues, implementation files, runtime artifacts, production build tasks, final manifests, or
PNC-019 receipts.

The row carries `expected_event_types: []`. That is the ruling, not an omission: all four existing
usage-named production rows carry the same empty list, the Event Authority denominator is `UNKNOWN_OPEN`,
and wiring must record the missing-event-registration disposition rather than fabricate an expected event.
Admission of a usage event family is a separate, individually adjudicated change that requires a registry
row with its own payload schema file and retention policy reference, an existing owner anchor, and a fresh
reconciliation of the open Event Authority finding; bulk registration is forbidden. Until all of that
lands, populating this row's event list would be a governance violation rather than an improvement.

### WM-044 - Usage Forecast Wiring Obligation

```yaml
plan_unit_id: WM-044
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Production wiring for cmd.usage.forecast.request is the single row catalog.usage_forecast_request carrying
  all thirteen required fields: ui_element_id matching its key, ui_location naming the Usage page host,
  ui_command_id, the sole handler location, an empty expected_event_types list, acceptance checks, the
  standing evidence-required sentence, a state selector and a disabled-reason projection under the
  state.commands namespace, a receipt effect contract with a dispatch receipt reference, a full
  accessibility contract, the four standard test-evidence items, and an event-test requirement asserting a
  no-persist disposition. The row declares no event family and no route contract, because the command
  requests a labelled projection rather than navigating; it is not a usage route/open row and must not
  borrow the usage route correlation-passthrough contract. The empty event list is the required state while
  the Event Authority denominator remains UNKNOWN_OPEN, and it changes only through individual Event
  Authority admission of a named usage family with its own payload schema, retention policy reference, and
  existing owner anchor. No second primary row is created for this command, and the rejected candidate
  cmd.provider.usage.open_management is recorded as an excluded token rather than wired.
gui_related: true
gui_classification_reason: Wiring determines whether the visible Usage forecast control dispatches a canonical command and how its unavailability is announced.
depends_on: [WM-034, WM-043, UCC-146, CS-067]
unblocks: []
acceptance_criteria:
  - catalog.usage_forecast_request validates against the production wiring schema with all thirteen required fields and a ui_element_id matching its entries key.
  - The row declares expected_event_types as an empty list and carries an event-test requirement asserting a no-persist dispatch disposition.
  - The row declares a receipt effect contract and no route contract, and is not asserted against the usage route/open correlation-passthrough requirement.
  - The row carries the four standard test-evidence kinds and the standing evidence-required sentence.
  - cmd.provider.usage.open_management has no production wiring row and is present in the production exclusions token list.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage forecast wiring fixture suite
risk_class: usage_wiring_false_event_certification
reasoning_tier: high
context_scope: usage_forecast_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: usage_forecast_wiring_obligation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens:
  - catalog.usage_forecast_request
  - cmd.usage.forecast.request
  - missing_event_registration
  - UNKNOWN_OPEN
  - "state.commands.usage_forecast_request.availability"
negative_constraints:
  - Do not populate expected_event_types for this row before individual Event Authority admission of a named usage family.
  - Do not add a usage event family to the event family registry in this change.
  - Do not create a second primary wiring row for the same command.
  - Do not wire the rejected candidate id.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

## PMConcept7 settled interaction production wiring addendum - 2026-08-27

Production wiring for the recovered PMConcept7 surfaces is command-owner-first and settled-state-only.
The machine-readable rows in `Plans/Wiring_Matrix.production.json` carry the same producer, handler,
state selector, effect, cancellation, error, and evidence boundaries summarized here.

| Producer | Command/disposition | Handler/reducer and owner state | Persistence/effect | Consumer | Cancel/error path |
|---|---|---|---|---|---|
| Usage/Dashboard widget add/remove/configure | existing `cmd.widget.*` row | `handlers::widget::*`; Widget System owner | settled `widget_layout:v1:usage` or `widget_layout:v1:dashboard`; dispatch receipt; no persisted domain event | current widget host and saved layout projection | disabled/rejected/stale result leaves owner state unchanged |
| Usage/Dashboard resize or reorder | `cmd.widget.resize` / `cmd.widget.move` on changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation; preview is `view_only` | `handlers::widget::resize` / `handlers::widget::move`; surface-specific local draft: Usage pointer resize and pointer/keyboard reorder visibly repack affected peers, Dashboard resize peers remain frozen | one settled write and receipt; no pointer-preview event | Usage retains the accepted last-painted pointer-preview topology once; Dashboard reflows after commit | Escape, `pointercancel`, invalid/no-change release/drop/activation restores prior geometry/order and dispatches nothing |
| Home move/resize/collapse/reset | existing `cmd.workspace_layout.*` rows | `handlers::workspace_layout::*`; `pm.home_workspace_layout.v1` owner | one revision-checked commit; existing `workspace.layout_changed` effect; no preview effect | Home hosts, saved dock/size/collapse projection | cancel/invalid/stale revision restores prior layout and emits no command/effect; error projects owner reason |
| Home preset size | concept alias normalized to `cmd.workspace_layout.resize_surface` | preset resolver produces committed width/height/flex and optional `preset_id` | same resize commit as direct resize | Home surface layout | no primary `cmd.workspace_layout.size_surface` row or handler exists |
| Usage Refresh | `cmd.usage.refresh` | `handlers::usage::refresh`; existing Usage projection owner | no-persist dispatch receipt; background refresh remains independent | Usage freshness/health projection | unavailable/stale failure remains visible and does not overwrite current projection |
| PMConcept7 Ledger attempt drill-through | `cmd.nav.open_usage_subject`, with stable `attempt_id` and `usage_event_ref` | `handlers::nav::open_usage_subject`; route/open owner resolves `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`; usage_event/provider/account/runtime refs are correlation | route/open receipt, no fabricated domain event, no `OpenSubject` | canonical Usage attempt inspector/route | missing/invalid attempt identity or unavailable target returns typed route/open failure without state mutation |
| Aggregate provider/account/panel details | `view_only` local inspector | current Usage projection; no router or command handler | no command, receipt, domain event, or persistence | local inspector | missing presentation data remains local; no fallback route or invented object kind |
| Usage room/scope/range/disclosure/filter/More-menu | `view_only` | current Usage view projection | no command/receipt/event; settled preference storage remains storage-owned | current Usage render | dismissal/cancel restores or retains prior local selection |
| Context ring popup/hover | `view_only` | shared Assistant local overlay projection | no command/receipt/event | compact context summary | dismissal emits nothing |
| Context ring `Compact Now` | `cmd.chat.compact_context` | `handlers::chat::compact_context`; live Prompt Pipeline/context owner | explicit dispatch receipt and visible result/projection; no fabricated `context.compaction.*` event while unregistered | the same ring and Context Detail Pane | already-running/no-op/degraded/unavailable/retry/failed states remain visible and preserve thread identity |
| Context ring `More Details` and pane focus/close | existing thread Context Detail Pane commands | `handlers::chat::*thread_context_details`; shared Assistant/thread state | no-persist receipt/layout state | one shared Context Detail Pane | unavailable/close returns focus deterministically; no second pane store |
| Chat visibility/seat | `cmd.panel.switch` for visibility; re-seating itself is shell-local identity-preserving projection | shell panel reducer plus one shared Assistant node/store | no clone and no transcript/state fork | Home saved dock or right-side global dock | failed seat restores the prior host; node identity and thread state remain intact |

The production matrix does not register `cmd.workspace_layout.size_surface`, does not register
`cmd.provider.usage.open_management`, and does not add an event for preview frames. A command receipt
proves dispatch/admission only; a committed owner projection or declared event proves the settled effect.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### WM-045 - PMConcept7 Producer Commit Cancel Error And Shared Assistant Wiring

```yaml
plan_unit_id: WM-045
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The PMConcept7 production wiring matrix binds every relevant producer to an existing
  command or view_only disposition, its sole handler/reducer, owner projection/store,
  settled persistence or declared effect, dispatch receipt, consumer, cancel path, and
  error path. Pointer/hover/popup previews never dispatch or persist; Usage pointer resize may locally advance
  its target footprint and visibly repack only obstructed peers while Dashboard resize peers remain frozen; one changed
  pointer release, keyboard reorder drop, or atomic keyboard-resize activation commits through cmd.widget.* or
  cmd.workspace_layout.*; Usage refresh and stable-event
  drill-through reuse their existing rows while current PMConcept7 aggregate provider/account/panel details
  remain local inspectors; Context-ring actions reuse their existing rows; and the same
  Assistant node/store is re-seated across Home and global docks without cloning. The concept-only size_surface
  token is normalized to resize_surface, rejected provider management stays unwired, and
  no pointer-preview event family is added.
gui_related: true
gui_classification_reason: The wiring contract connects the recovered visible controls, their disabled/error states, and the shared Assistant seating behavior.
split_recommended: false
depends_on: [WM-044, CS-068, UCC-147, WS-019, SP-249, SP-250]
unblocks: [UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Prose and production JSON agree on producer, command/disposition, handler, selector/store, persistence/effect, receipt, consumer, cancel, and error behavior for every covered family; event-primary callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row dispatches cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject and retains usage_event_ref plus provider/account/runtime refs as correlation. Current aggregate cards remain local with no command, receipt, or event. The production matrix retains all 726 keys and this recovery enriches exactly 40 existing rows, comprising the 13 named catalog rows for Chat Context, Usage, panel switching, and widget commands plus the 27 existing home.* rows; cmd.artifacts.show_in_usage and cmd.artifacts.show_in_ledger retain their pre-recovery bytes and are not counted in that enrichment set.
  - Preview frames, popup/hover disclosure, and cancellation produce zero commands, receipts, persisted events, and storage writes.
  - Changed widget pointer releases, keyboard reorder drops, atomic keyboard-resize activations, and changed Home releases produce exactly one existing semantic command and settle only after owner acceptance.
  - The Context ring and shared Assistant rows preserve one node/store and use existing compact/details/panel authorities.
  - No production row exists for cmd.workspace_layout.size_surface or cmd.provider.usage.open_management.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_production_wiring_or_cancel_path_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: pm7_production_wiring_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - view_only
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - pm.home_workspace_layout.v1
  - workspace.layout_changed
  - pm:command-dispatch
negative_constraints:
  - Do not treat a receipt as terminal domain success.
  - Do not emit a command, event, or persistence write from pointer-preview or cancel state.
  - Do not clone the Assistant or create a second pane/store while re-seating it.
  - Do not create production rows for compatibility-only or rejected command tokens.
  - Do not route aggregate Usage cards, dispatch cmd.nav.open_usage_subject without the branch's stable selector, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use correlation identity as the PMConcept7 Ledger object_id.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

## Packet-owner command and Touch Closure wiring addendum - 2026-08-31

The Settings/Onboarding/Doctor/Server/WAN/Backup/Browser/Capture/SCM/Forge/plugin/performance wave uses `Plans/touch_closure.json` as its bidirectional coverage register and `Plans/Wiring_Matrix.production.json` as the production-intent row set. Each canonical command has one catalog entry and one sole handler target, while every GUI-required command has every intended visible consumer enumerated in reverse. Typed local UI actions use the same availability, disabled-reason, accessibility, return-route, and evidence discipline but do not receive fictitious domain handlers or EventRecords.

Current Product Onboarding uses exactly thirteen typed local actions: `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. These are not semantic commands or production wiring rows. The main path is exactly `welcome` -> `simple_path` -> `first_project` -> `source_control_setup` -> `server_storage_client` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`; connect existing is exactly `welcome` -> `simple_path` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`. Every pre-Review choice is a local draft transition or cached read. No network probe, owner route, or mutation may begin until the person confirms the current Review Setup Plan revision; Automatic Preparation then dispatches the approved-plan hash once and observes current owner projections.

The actions use `pm.product_onboarding.action_request.v1` -> `pm.product_onboarding.action_result.v1`, including closed applied/disabled/rejected results and zero-dispatch/zero-write disabled or rejected behavior. Each request carries closed normalized secret-free `local_context`; its only fields are `intent`, optional `review_confirmation`, `scope`, `branch_kind`, `branch_step`, `selection_ref`, `target_ref`, `owner_operation_ref`, `owner_branch_ref`, `expanded`, `start_tour`, and `recovery_condition`, so arbitrary/raw payloads and secret-bearing values fail closed. Setup/project disclosure and branch-local `more_ways` updates use different intent/scope/choice/branch combinations. Whole-session Skip yields `session_skipped`/skipped status, while Project/Remote-Access optional-scope Skip yields `optional_scope_skipped` and leaves the session active. Defer durably preserves the exact path, stage, draft, queued/reviewed revisions, Review confirmation, approved-plan hash, Automatic Preparation currentness, independent backend/forge/Server/Storage/Client choices, active branch, bounded history, continuation generation, initiating Client, and return focus; Close is a non-completion dismissal; and Details is an ephemeral same-stage disclosure with no persistence or owner command. A selected owner route uses that owner's existing canonical command and sole handler; no generic Onboarding wrapper handler is created. The predecessor `cmd.onboarding.first_run.open`, `cmd.onboarding.provider_setup.open`, `cmd.onboarding.provider_setup.use_provider`, `cmd.onboarding.skip_to_planning_wizard`, `cmd.onboarding.free_models.review`, `cmd.onboarding.free_models.defer`, `cmd.onboarding.review_setup`, `cmd.onboarding.open_planning_wizard`, `cmd.onboarding.free_models.refresh`, `cmd.onboarding.free_models.retry`, and `cmd.onboarding.free_models.setup` spellings are source-lineage-only: none is a production row or compatibility alias. The separate packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only and are rejected as commands, aliases, and handlers because typed local `ui.onboarding.*` actions own their semantics.

Current Guided Tour uses exactly ten typed local actions: `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`, `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`. Its exact scene order is `usage` -> `planning_wizard` -> `chat_teacher`. The Tour observes existing `cmd.widget.remove`/`cmd.widget.add` results for the Usage Watch moment, advances Try only from the exact mounted Usage-card Options control, advances Planning only from the exact mounted intent-chip result, and uses existing `cmd.panel.switch`/`cmd.panel.redock` behavior to finish with Assistant Chat at the far right. `cmd.panel.undock`, `cmd.widget.configure`, `cmd.widget.move`, `cmd.widget.resize`, `cmd.workspace_layout.move_surface`, and `cmd.workspace_layout.resize_surface` remain separately owned Home/Widget behaviors and are not Tour checkpoints. `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` are retired current actions; Skip performs exact restoration, Finish keeps Chat at the far right, and Reduced Motion remains Settings-owned.

The retired Settings spellings `cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` are likewise source-lineage-only and are neither production rows nor compatibility aliases. Exact Settings navigation uses `cmd.settings.open`; reset and dismissal compose `cmd.settings.transaction.preview` plus `cmd.settings.transaction.apply`.

Rows whose Rust/native dispatcher, owner handler, persistence adapter, or runtime receipt does not exist remain `planned`/`partial` with explicit evidence requirements. PMConcept7 action logs, fixture adapters, schemas, and browser verifiers are concept/static evidence only. Event candidates stay `receipt_only_no_eventrecord_pending_event_authority` unless their individual family is admitted into `Plans/event_family_registry.json` with a closed payload contract.

ContractRef: ContractName:Plans/touch_closure.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/event_family_registry.json

### WM-046 - Bidirectional Touch Closure and production-intent wiring

```yaml
plan_unit_id: WM-046
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every touched canonical command has exactly one catalog identity, one request/result/error/availability/permission
  contract, one sole owner-handler route, one production-intent wiring row, and reverse coverage to every intended GUI
  consumer. Every touched local UI action has a typed action contract, accessibility and disabled behavior, exact return,
  and reverse consumer coverage without a false domain handler. The hash-bound SSYS-023 packet disposition registry is
  transitive input: canonical replacements require rows, typed local actions require rows, and retired or rejected packet
  spellings remain non-actionable. Missing native dispatch, handler, persistence, event admission, or runtime receipt
  remains explicitly planned or partial; schemas, fixtures, PMConcept7 simulations, and browser evidence cannot satisfy
  those dimensions.
gui_related: true
gui_classification_reason: Connects every touched visible control and command to handlers, consumers, responses, and evidence.
split_recommended: false
depends_on: [WM-045, DR-040, UIW-013, SSYS-023]
unblocks: []
acceptance_criteria:
  - Commands, handlers, and GUI consumers are each complete in both directions with no duplicate primary ID or owner.
  - Typed local actions carry availability, disabled reason, accessibility, and exact-return evidence without fictitious runtime command rows.
  - "Product Onboarding exposes exactly the thirteen `ui.onboarding.*` typed local actions and routes owner work through existing owner commands/handlers; no `cmd.onboarding.*` production row, compatibility alias, generic handler, or EventRecord is admitted."
  - "Product Onboarding follows the exact nine-stage main and six-stage connect-existing paths; pre-Review work is local draft/cached read only, current Review confirmation fences every owner dispatch, and Automatic Preparation observes the once-dispatched approved plan with exact revision/hash/currentness fields."
  - "Every Product Onboarding request carries the closed normalized secret-free local_context; more_ways and skip variants are exact and non-ambiguous, and arbitrary/raw/secret-bearing context is rejected."
  - "Guided Tour exposes exactly ten typed local actions and exactly three scenes in Usage/Planning Wizard/Assistant Chat order; its only Tour-observed owner commands are panel switch/redock and widget remove/add, while unrelated Home/Widget commands retain separate consumers."
  - "The packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage only and rejected as commands, aliases, and handlers."
  - "`cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` remain source-lineage-only and appear as neither production rows nor compatibility aliases."
  - "The exact seven local actions `settings.search.focus`, `settings.search.result.activate`, `settings.category.select`, `settings.subcategory.select`, `settings.setting.focus`, `settings.scope.details.open`, and `settings.provider.installation.select` have Touch Closure rows and no domain handlers."
  - "The named projections `settings.manager.teacher-help`, `settings.manager.project-search-index`, and `settings.manager.dry-method` have presentation rows, while their four owner commands retain their existing sole owner routes and reverse consumers."
  - The 80-token Settings registry retains the exact 41/7/1/31 disposition partition, and no replacement spelling, retired bakeoff token, or rejected token becomes a command or alias.
  - Orphan controls, commands without handlers, handlers without commands, missing reverse consumers, duplicate IDs, stale PlanRefs, and incomplete Touch Closure rows fail gates.
  - Event effects remain receipt-only unless individually admitted by Event Authority.
  - Concept, static, browser, native-runtime, visual, motion, accessibility, performance, and readiness evidence classes remain separate.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: one_way_or_false_production_wiring
reasoning_tier: high
context_scope: packet_owner_touch_closure_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: touch_closure_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - scratchpad/approval-gated-touch-closure-packet-custody-20260831-001/central-contract-map/central-contract-map.json
  - scratchpad/pm-integration-20260831/audits/settings-owner-closure/settings-owner-central-delta-proposal.json
preserved_exact_tokens: [planned, partial, receipt_only_no_eventrecord_pending_event_authority, "ui.onboarding.*", cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply]
negative_constraints:
  - Do not claim production wiring from PMConcept7 or browser evidence.
  - Do not assign two handlers or owners to one primary command.
  - Do not admit an EventRecord family through a wiring row.
  - Do not omit reverse GUI coverage for a GUI-required command.
  - "Do not normalize a predecessor `cmd.onboarding.*` or retired Settings spelling into a production row or compatibility alias."
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```

## Guided Tour typed local route wiring disposition - 2026-09-01

`ui.guided_tour.focus_route` is covered by Touch Closure profile
`TCP-GUIDED-NAV`, not by the production command matrix. Its one concept
consumer is the Guided Tour `Open Usage` control; its one specified local
controller consumes `route_target.page_id`, checks the mounted application router,
changes visible route/focus only, and returns the closed
`pm.guided_tour.focus_route_result.v1` no-domain/no-persistence local result.
The native Slint presentation controller remains absent and must not be
inferred from the authored HTML or browser verifier.

`catalog.nav_focus_route` is removed because it falsely implied an adopted
command and `handlers::nav::focus_route`. The retained historical token
`cmd.nav.focus_route` is exclusions-only. This disposition does not affect the
separately adopted `cmd.nav.open_subject` and
`cmd.nav.open_usage_subject` wrapper rows.

ContractRef: ContractName:Plans/Commands_System.md#CS-072, ContractName:Plans/UI_Command_Catalog.md#UCC-150, ContractName:Plans/touch_closure.json#TCP-GUIDED-NAV

### WM-049 - Guided Tour focus route uses Touch Closure, not false production wiring

```yaml
plan_unit_id: WM-049
unit_type: wiring_disposition
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  TCP-GUIDED-NAV binds ui.guided_tour.focus_route to its typed route target,
  mounted-application local controller, exact result, accessible disabled state,
  return route, tests, and sole Guided Tour consumer. cmd.nav.focus_route and
  catalog.nav_focus_route have no production standing and no handler claim.
gui_related: true
gui_classification_reason: Governs exact GUI-to-local-controller and reverse-consumer coverage for the Guided Tour route step.
depends_on: [WM-046, CS-072, UCC-150, PWIZ-023]
unblocks: []
acceptance_criteria:
  - TCP-GUIDED-NAV has one typed UI action, one local concept controller, one GUI trigger, one exact return, and browser/static tests.
  - No production matrix row, dispatcher, handler, domain event, or persistence effect is attributed to cmd.nav.focus_route.
  - Missing-router state remains keyboard-focusable, hover-bound, described, and non-dispatching.
  - Concept, browser, native Slint, and production-runtime evidence remain separate.
validation_surfaces: [Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, python3 scripts/pm-touch-closure-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, Concepts/pm7-tools/verify/guided_tour.mjs]
risk_class: false_production_wiring_or_missing_reverse_local_action_coverage
reasoning_tier: high
context_scope: guided_tour_application_focus_route
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: guided_tour_local_action_wiring_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - Plans/Planning_Wizard.md#PWIZ-023
preserved_exact_tokens: [TCP-GUIDED-NAV, ui.guided_tour.focus_route, route_target.page_id, pm.guided_tour.focus_route_result.v1, cmd.nav.focus_route, catalog.nav_focus_route]
negative_constraints:
  - Do not restore catalog.nav_focus_route or invent handlers::nav::focus_route.
  - Do not treat the PMConcept7 controller as a native Slint or production handler.
  - Do not remove the adopted open-subject wrapper rows.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Planning_Wizard.md]
```

## Agent plugin production-intent and consumer wiring addendum - 2026-09-01

The production-intent matrix carries one row for each CS-071/UCC-149 identity. Each row names the one future
Plugins target and every Plugins/Settings/Doctor/palette consumer, but remains default-disabled with
`handler_unavailable` until a native dispatcher, handler, package operation, persistence path, and fresh
runtime receipt exist. These are planned routing contracts, not fake Rust handlers or production proof.

| Wiring row | Command | Specified target | Primary reverse consumers |
|---|---|---|---|
| `catalog.agent_plugin_scan` | `cmd.agent_plugin.scan` | `handlers::plugins::scan` | Plugins inventory; Settings manager; Doctor recheck; palette |
| `catalog.agent_plugin_install` | `cmd.agent_plugin.install` | `handlers::plugins::install` | Plugins catalog/local import; Settings manager; palette |
| `catalog.agent_plugin_update` | `cmd.agent_plugin.update` | `handlers::plugins::update` | Plugins update review; Settings manager; Doctor remediation |
| `catalog.agent_plugin_enable` | `cmd.agent_plugin.enable` | `handlers::plugins::enable` | Plugins row/details; Settings manager |
| `catalog.agent_plugin_disable` | `cmd.agent_plugin.disable` | `handlers::plugins::disable` | Plugins row/details; Settings manager; Doctor remediation |
| `catalog.agent_plugin_reload` | `cmd.agent_plugin.reload` | `handlers::plugins::reload` | Plugins details/review; Settings manager |
| `catalog.agent_plugin_remove` | `cmd.agent_plugin.remove` | `handlers::plugins::remove` | Plugins details; Settings manager |
| `catalog.agent_plugin_validate` | `cmd.agent_plugin.validate` | `handlers::plugins::validate` | Plugins details; Settings manager; Doctor checks |
| `catalog.agent_plugin_review_changes` | `cmd.agent_plugin.review_changes` | `handlers::plugins::review_changes` | Plugins review; Settings manager; Doctor permission/update review |
| `catalog.agent_plugin_rollback` | `cmd.agent_plugin.rollback` | `handlers::plugins::rollback` | Plugins recovery; Settings manager; Doctor rollback health |
| `catalog.agent_plugin_open_details` | `cmd.agent_plugin.open_details` | `handlers::plugins::open_details` | Plugins/Settings/Doctor bounded Details |
| `catalog.agent_plugin_open_logs` | `cmd.agent_plugin.open_logs` | `handlers::plugins::open_logs` | Plugins/Settings/Doctor bounded Logs |

Every request/result binds the exact package/plugin, Host/Environment, package/permission/topology generations,
manifest lane and separate hashes, admitted package/supply-chain/conformance/permission/update-diff/rollback refs,
idempotency, confirmation where required, bounded projection, and exact caller return. Mutating and long work retains
`ObservableWork`; read-only Details and Logs do not claim mutation. Effects are typed results and immutable receipts
under `receipt_only_no_eventrecord_pending_event_authority`. Caller close never silently cancels owner work; only the
exact owner cancellation semantics may do so. Error or stale state changes no package generation/status.

Settings and Doctor consume the same Plugins owner facts. Settings does not parse packages, run adapters, migrate
manifests, validate signatures, scan containment, or mutate lifecycle state. Doctor reads cached/fresh projections,
routes recheck/remediation, and never privately performs a Plugins action. All browser-concept controls stay disabled
and return the exact reason; their action logs prove neither dispatch nor owner work.

ContractRef: ContractName:Plans/Commands_System.md#CS-071, ContractName:Plans/UI_Command_Catalog.md#UCC-149, ContractName:Plans/Plugins_System.md#PLUG-070, ContractName:Plans/touch_closure.json

### WM-048 - Agent plugin production-intent and reverse-route closure

```yaml
plan_unit_id: WM-048
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Twelve planned production-intent rows bind every exact agent-plugin identity to its Plugins-owned
  request/result contracts, one specified future target, truthful handler_unavailable projection, receipt-only
  effect, exact return, accessibility, tests, and all Plugins/Settings/Doctor/palette reverse consumers. The rows
  do not prove a native handler or runtime effect, and Settings, Doctor, and PMConcept7 never simulate owner success.
gui_related: true
gui_classification_reason: Connects every visible plugin lifecycle, review, recovery, details, and logs control to one owner route and return path.
depends_on: [WM-047, CS-071, UCC-149, PLUG-070]
unblocks: []
acceptance_criteria:
  - Exactly twelve unique production-intent rows cover the twelve CS-071 identities, each with one Plugins target, typed request/result, availability selector, disabled reason, receipt effect, accessibility, tests, and reverse consumers.
  - Every row is disabled with handler_unavailable until executable dispatcher/handler and fresh runtime proof exist; a target string, schema, fixture, concept log, or browser pass is not handler evidence.
  - Mutating work preserves confirmation, currentness, conformance, provenance, containment, permission, update-diff, rollback, ObservableWork, cancellation, recovery, and exact-return requirements.
  - Settings and Doctor consume Plugins owner facts and commands without private parsing, validation, adapter, migration, repair, or lifecycle mutation.
  - All effects remain receipt-only and no plugin.* or agent_plugin.* EventRecord, alias, second handler, or success simulation is admitted.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Plans/plugin_contract_fixtures.json, Concepts/pm7-tools/systems_integration_source.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: plugin_wiring_or_false_runtime_closure
reasoning_tier: high
context_scope: agent_plugin_production_intent
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: agent_plugin_production_intent, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-071
  - Plans/UI_Command_Catalog.md#UCC-149
  - scratchpad/pm-integration-20260831/authority-repairs/plugin-contract-closure/central-settings-doctor-delta-proposal.md
preserved_exact_tokens: [catalog.agent_plugin_scan, catalog.agent_plugin_install, catalog.agent_plugin_update, catalog.agent_plugin_enable, catalog.agent_plugin_disable, catalog.agent_plugin_reload, catalog.agent_plugin_remove, catalog.agent_plugin_validate, catalog.agent_plugin_review_changes, catalog.agent_plugin_rollback, catalog.agent_plugin_open_details, catalog.agent_plugin_open_logs, handler_unavailable, receipt_only_no_eventrecord_pending_event_authority]
negative_constraints:
  - Do not treat planned wiring, a handler-location string, PMConcept7 behavior, or browser evidence as native/runtime proof.
  - Do not let Settings or Doctor become a plugin lifecycle, adapter, migration, validation, or repair owner.
  - Do not enable a control, simulate a successful owner result, expose unbounded/private data, or invent an EventRecord family.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Plugins_System.md]
```

## Cross-owner setup, restore, Server, pairing, and protected-auth wiring addendum - 2026-09-01

The production-intent matrix adds one row for each of the ten commands registered by CS-070/UCC-148 and
strengthens the existing Project and Authentication rows. These rows specify the required future native
route; they do not assert that a dispatcher, handler, persistence path, or native runtime currently exists.
Every new row is default-disabled with `handler_unavailable` until those executable surfaces and fresh
runtime evidence exist.

| Wiring row | Command | Specified target | Reverse GUI consumers | Effect/return |
|---|---|---|---|---|
| `catalog.source_control_repository_clone` | `cmd.source_control.repository.clone` | `handlers::source_control::repository_clone` | Onboarding first project; Settings SCM/Origin | Owner receipt plus exact caller return; no Project row until registration succeeds. |
| `catalog.jujutsu_git_clone` | `cmd.jujutsu.git.clone` | `handlers::jujutsu::git_clone` | Onboarding first project; Settings SCM/Origin | JJ operation receipt plus exact caller return. |
| `catalog.restore_preview` | `cmd.restore.preview` | `handlers::backup_restore::preview_restore` | Onboarding restore; Settings Backup/Restore; Doctor recovery | Read-only validation/preview receipt; no activation. |
| `catalog.server_connect` | `cmd.server.connect` | `handlers::server::connect` | Onboarding discovery; Settings Server; Doctor | Exact connect/reconnect/resume result and focus return. |
| `catalog.server_bootstrap_start` | `cmd.server.bootstrap.start` | `handlers::server::bootstrap_start` | Onboarding post-claim; Settings Server | Observable bootstrap receipt; unavailable without native handler. |
| `catalog.client_pair_start` | `cmd.client.pair.start` | `handlers::client_pairing::start` | Onboarding pairing; Settings paired clients | Pairing-run receipt; no trust grant. |
| `catalog.client_pair_approve` | `cmd.client.pair.approve` | `handlers::client_pairing::approve` | Settings pairing request; Onboarding return | Current-generation approval result. |
| `catalog.client_pair_reject` | `cmd.client.pair.reject` | `handlers::client_pairing::reject` | Settings pairing request; Onboarding return | Terminal refusal result. |
| `catalog.client_pair_cancel` | `cmd.client.pair.cancel` | `handlers::client_pairing::cancel` | Settings pairing progress; Onboarding return | Requester abort and cleanup result. |
| `catalog.client_revoke` | `cmd.client.revoke` | `handlers::client_trust::revoke` | Settings paired-client detail; Doctor remediation | Durable revocation receipt and exact return. |

The `catalog.project_new_local`, `catalog.project_add_existing`, and `catalog.project_open` rows use the
Project owner request/result schemas and preserve exact identity, currentness, receipt, and caller return
context. The `catalog.authentication_start|cancel|resume` rows retain their sole shared-runtime handlers
and additionally prove initiating active Client/session generation, same operation/revision, exact return
target, redacted timeout/cancel/success, and rejection of wrong-Client or stale-operation returns.

PMConcept7 is a concept consumer only. The bounded Product Onboarding modal maps standalone/container
post-claim work to `cmd.server.bootstrap.start`, pairing-method initiation to `cmd.client.pair.start`, known
Server connection to `cmd.server.connect`, ordinary Git and JJ clone to their distinct owners, and
protected-auth cancellation to `cmd.authentication.cancel`. The Settings/Doctor Server manager exposes
the five pairing/trust operations as separate controls. No browser interaction or action log satisfies the
native-handler evidence requirement.

ContractRef: ContractName:Plans/Commands_System.md#CS-070, ContractName:Plans/UI_Command_Catalog.md#UCC-148, ContractName:Plans/touch_closure.json

### WM-047 - Cross-owner production-intent and reverse-route closure

```yaml
plan_unit_id: WM-047
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Ten owner-backed production-intent rows and six strengthened existing rows bind exact commands,
  request/results, specified targets, availability/disabled projections, receipt-only effects,
  accessibility, and every intended PMConcept7/Settings/Onboarding/Doctor reverse consumer. All missing
  native handlers remain truthfully unavailable; static wiring is not production execution evidence.
gui_related: true
gui_classification_reason: Governs visible setup, project, restore, Server, pairing, trust, and authentication control routing and exact focus return.
depends_on: [WM-046, CS-070, UCC-148]
unblocks: []
acceptance_criteria:
  - Exactly ten new production-intent rows exist with unique commands and keys, exact owner schemas, one specified target, selectors, disabled reasons, accessibility, tests, and reverse consumers.
  - The three Project and three Authentication rows are strengthened in place rather than duplicated.
  - Pairing start/approve/reject/cancel and Client trust revocation remain separate operations; reconnect/resume remain modes of cmd.server.connect.
  - Protected-auth return is fenced to the initiating active Client/session and exact operation/revision with no content exposure, capture, recording, persistence, or fallback navigation.
  - Product Onboarding modal close restores focus but does not cancel owner work; explicit cancellation uses the exact owner command.
  - Every row remains partial/default-disabled until its native handler and fresh runtime evidence exist, and no EventRecord is invented.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.schema.json, Plans/touch_closure.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: missing_reverse_wiring_or_false_production_claim
reasoning_tier: high
context_scope: cross_owner_setup_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Concepts/pm7-tools/onboarding_cinematic_source.py, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: cross_owner_production_intent_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/authority-repairs/central-owner-merge/merged-central-owner-delta-manifest.json
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [catalog.source_control_repository_clone, catalog.jujutsu_git_clone, catalog.restore_preview, catalog.server_connect, catalog.server_bootstrap_start, catalog.client_pair_start, catalog.client_pair_approve, catalog.client_pair_reject, catalog.client_pair_cancel, catalog.client_revoke, handler_unavailable]
negative_constraints:
  - Do not claim native implementation from a production-intent row or handler string.
  - Do not add rejected aliases, false owner-local authentication commands, or an EventRecord family.
  - Do not omit exact return, accessibility, disabled reason, or reverse consumers.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```
## Server/Egolite Production-Intent Wiring Addendum - 2026-09-01


The exact machine partition is 171 packet rows: 86 new canonical commands, 43 pre-policy aliases, 39 typed local UI actions, and three rejected spellings. Six retained Egolite commands also lacked central rows. Eleven existing alias targets require the same central repair, with `cmd.source_control.workspace.create` the sole overlap with the retained six. Therefore 103 obligation references collapse to **102 unique primary command/catalog/production-intent rows**; the packet primary denominator remains 92 (`86 + 6`). Denominators must never be silently substituted for one another.

Every primary row below is static central intent. A named `handler_location` is the sole future dispatch target, not evidence that Rust code, registration, provider execution, persistence, native Slint wiring, security behavior, or runtime success exists. Initial availability remains `handler_unavailable`; the exact disabled reason is projected accessibly. All rows use receipt/projection-only effects and `expected_event_types=[]` until Event Authority separately admits an exact family. `ObservableWork` applies only where the owner contract declares asynchronous work. Exact owner permissions, generations, currentness, idempotency, cancellation, reconciliation, and exact-return rules remain intact.


`Plans/Wiring_Matrix.production.json` carries the 102 unique primary rows keyed `catalog.<command_snake>`. Every row names the exact primary command, sole planned target, exact request/result schema pointers, all intended GUI consumers, `state.commands.<command_snake>.availability`, `state.commands.<command_snake>.disabled_reason`, an empty EventRecord list, receipt/projection-only effect, accessibility semantics, and four required future evidence classes: dispatcher fixture, state projection, receipt-or-event assertion, and accessibility regression. `Plans/Wiring_Matrix.production.exclusions.json` covers exactly the 43 aliases, 39 command-shaped typed-local predecessors, and three rejections from this adjudication; it never excludes one of the 102 primaries.

Aliases are represented in `Plans/touch_closure.json#/alias_bindings`, not as production rows. Their exact target supplies availability, permission, handler, result, and effect. Typed local targets appear only as `ui_action` Touch rows and owner-local GUI wiring. Rejected spellings have neither a Touch action row nor a production route.

### WM-050 - Server And Egolite Production-Intent Closure

```yaml
plan_unit_id: WM-050
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Production intent binds 102 unique server/Egolite primary commands to exact owner contracts, one sole planned target, complete GUI consumers, truthful handler-unavailable state, receipt/projection-only effects, and future evidence requirements while aliases, local predecessors, and rejections receive no peer production rows.
gui_related: true
depends_on: [CS-073, UCC-151]
unblocks: [UIW-016]
acceptance_criteria:
  - The production matrix validates and contains all 102 unique rows with exact command, handler, schema, state, disabled-reason, effect, accessibility, and evidence fields.
  - The exclusion list contains the complete 85 source-token partition and excludes none of the 102 primaries.
  - Touch alias bindings have exact targets with no independent handler/wiring and every intended GUI consumer appears in reverse coverage.
  - All rows remain static production intent and handler_unavailable until native dispatcher and runtime evidence exists.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.schema.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, scripts/pm-plans-verify.py, scripts/pm-touch-closure-verify.py]
risk_class: wiring_or_reverse_coverage_false_completion
reasoning_tier: high
context_scope: server_egolite_production_intent
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: production_intent_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints: [No peer alias handler., No domain handler for local presentation., No unadmitted event., No native proof from static wiring.]
```

## Central Touch Production Wiring Closure Addendum - 2026-09-01

`Plans/Wiring_Matrix.production.json` now carries one production-intent row for every actionable Touch primary command. The final Touch denominator is 425 primary command rows: 424 have at least one production entry and exactly one handler identity; `cmd.artifacts.open_panel` remains the single blocked non-admitted false inventory with no handler or production row. The 227 rows in the current closure preserve owner schemas, `handler_unavailable`, `expected_event_types=[]`, owner receipt/projection semantics, exact state/disabled-reason selectors, accessibility, deterministic return, and future-evidence requirements.

Added profile counts: `TCP-AUTH-PROFILE`=7, `TCP-BACKUP`=40, `TCP-BROWSER`=14, `TCP-CAPTURE`=10, `TCP-FORGE`=43, `TCP-INSTALL`=1, `TCP-JJ`=30, `TCP-NAMED`=6, `TCP-REMOTE`=43, `TCP-SCM`=8, `TCP-SERVER`=25.

The machine registries now contain exactly 425 primary command rows (424 actionable plus one blocked false inventory), 55 compatibility aliases, 101 typed local UI actions, seven presentation rows, 588 Touch rows, 87 profiles, and 1065 production-intent entries. The nine Forge and sixteen Backup additions plus the Remote Access three-primary/four-alias replacement remain event-silent and handler-unavailable.

### WM-051 - Remaining Touch Production-Intent Wiring

```yaml
plan_unit_id: WM-051
unit_type: production_wiring
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: All 424 actionable Touch primary commands have production-intent wiring and one sole handler identity; the one blocked false-inventory token has neither. Static rows prove no runtime implementation and admit no new EventRecord type.
gui_related: true
gui_classification_reason: Production rows bind GUI controls to availability, disabled reasons, dispatch targets, results, accessibility, and return routes.
depends_on: [WM-050, CS-074, UCC-152]
unblocks: []
acceptance_criteria:
- Production JSON contains exactly 1065 unique entry keys after this merge and validates against Plans/Wiring_Matrix.schema.json.
- Every non-blocked Touch primary command has production wiring and resolves to exactly one handler identity; aliases have no peer production rows.
- Every new row uses expected_event_types=[] and remains handler_unavailable until native source-hashed evidence exists.
validation_surfaces: [python3 scripts/pm-touch-closure-verify.py --json, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: production_intent_wiring_and_claim_boundary
reasoning_tier: high
context_scope: touch_production_closure
implementation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: touch_production_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Commands_System.md#CS-074, Plans/UI_Command_Catalog.md#UCC-152]
negative_constraints: [Do not claim native runtime implementation from static wiring., Do not register an event without Event Authority.]
compile_disposition: extend_existing_owner
```
