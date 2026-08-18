# UI Command Catalog (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Retire tier-era canon and shadow fields
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Canonical route payload


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
GUI labels for command IDs may clean casing or spacing, but this is cosmetic only: internal IDs remain stable and collision-safe, and label normalization must not destructively strip hyphens or other canonical command-id tokens.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand

---

## 1. Naming rules


- IDs MUST be lowercase and dot-separated.
- Prefix MUST be `cmd.`.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand

---

## 2. Canonical command IDs


### 2.0A Promoted Section 15 command families


Command families stay normalized around shared navigation, search routing, and runtime recovery ownership.

### 2.0 Command entry contract (doc-level)

Live command rows must carry enough metadata for command-palette, shortcut, wiring, and permission gates to classify the action without reading the handler. The required metadata columns are `command_id`, `label`, `description`, `preconditions`, and `command_kind`; `command_kind` is one of `shell_view`, `navigation_wrapper`, or `domain_action`.

Wiring/gate consumers read `command_kind`, normalization kind, and canonical target contract from catalog metadata; `/gate` checks must not infer those fields from handler names or row-local prose.

Command-definition metadata belongs in the command catalog / command contract layer, the route schema remains owner of actual route-target structure, and wiring rows reference command IDs and handlers instead of restating the normalization model in full.

Command metadata must not inline route payload shape, object kinds, or argument mapping rules; doing so duplicates the route contract and turns the catalog into a second routing schema.


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
- Mutating `domain_action` commands MUST apply the catalog-wide projection-freshness gating clause before dispatch: the source projection freshness/health must be current for the selected project, repo, worktree, run, workflow, container, or Kubernetes scope. Stale, missing, or degraded projection health makes the mutation unavailable or forces a refresh/revalidation step before the command can execute.
- Catalog verification lenses include UX / flow / action-surface behavior, state / storage / command / audit-trail behavior, tools / permissions / provider / identity integration, and cross-doc consistency / precedence / terminology / routing ownership; a handler row is not complete if it satisfies only flat command-to-handler wiring while route or audit semantics remain unowned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

### 2.0C Development-preview GUI controls

The following command IDs are development-preview and automated-test controls only. They are not production runtime commands, do not grant OS-owned capability by themselves, and must be compiled out or disabled in production builds unless an explicit production configuration enables the corresponding dev/test surface with permission and audit receipts.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.gui_dev_preview.reload` | Reload GUI preview | Reloads the local static web route or native preview surface after a configured dev/test rebuild. | `dev_preview_enabled && explicit_dev_or_test_build` | `domain_action` |
| `cmd.gui_dev_preview.fixture_mode.set` | Set GUI fixture mode | Selects an approved deterministic fixture state for GUI smoke tests, screenshots, state hooks, or replay. | `dev_preview_enabled && fixture_mode_available && explicit_dev_or_test_build` | `domain_action` |
| `cmd.gui_dev_preview.capture_state` | Capture GUI state | Captures screenshot, visible state, and deterministic state-hook output for browser/native GUI smoke evidence. | `dev_preview_enabled && state_capture_available && explicit_dev_or_test_build` | `domain_action` |
| `cmd.gui_dev_preview.daemon_capabilities.inspect` | Inspect daemon capabilities | Shows trusted local daemon capability probe results, degraded reasons, and test-hook availability without enabling a capability. | `dev_preview_enabled && trusted_local_daemon_probe_available && explicit_dev_or_test_build` | `shell_view` |

These commands normalize through the dev-preview test harness and capability-probe receipts. They must not be reused as production `cmd.runtime.*`, terminal, filesystem, browser automation, CEF, tray, native-window, or process/container operation commands.

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
- field-placement for UI command records is frozen at the command wrapper: command routing fields stay here, while provider/runtime identity and `/runtime` resolution fields stay in the runtime/provider owner contracts instead of being reintroduced by stale planning docs.
- The common panel-context payload contract lets wrapper commands carry shared `panel-context` vocabulary for deep-link and cross-surface focus: `project_id`, `repo_id?`, `worktree_id?`, `branch_ref?`, `workflow_ref?`, `job_ref?`, `container_ref?`, `image_ref?`, `kubernetes_context?`, `run_id?`, `attempt_id?`, and `subview?`. This is shared wrapper vocabulary only; it is not a new `cmd.nav.*` family and does not replace `route_target` or `OpenSubject`.
- Route `tab_id` is stable page-tab focus only; the Orchestrator tab family is the first canonical enum set for tab-focused command payloads: `progress`, `plan_compile`, `seams`, `node_graph`, `evidence`, `history`, and `ledger`. Retired `tiers` labels are import/search compatibility aliases only, not valid active `tab_id` values.
- Route-shaped payloads carry `route_target`, `OpenSubject`, and `panel-context` identity for cross-surface focus. Pure shell/view-state commands may carry `/view-state`, `/switch_subview`, or selected-subview hints, but those hints are not primary navigation identity and must not be used as `/runtime-local` mutation payloads.
- Object-targeting payload semantics move out of `cmd.panel.switch`: it remains a side-panel shell/view command, and any context that becomes object-targeting must become a route-consuming wrapper command or normalized `route_target` argument. Do not promote a broad public `cmd.nav` / `cmd.nav.*` family merely to avoid owner-specific or domain-specific wrappers, and do not let domain wrappers invent private route args; `cmd.project.open`, `cmd.artifacts.show_in_usage`, `cmd.artifacts.show_in_ledger`, chat Usage wrappers, and cross-surface Orchestrator pivots are `navigation_wrapper` commands over canonical route targeting rather than generic layout toggles.
- Routing split cleanup treats `resume_url`, command IDs plus ad hoc args, artifact / `/usage/search` deep links, and the `FinalGUISpec.md` file-open contract as consumers of the same route/open model rather than four competing mechanisms.
- Compact navigation aliases, if adopted, are limited to `cmd.nav.open_subject`, `cmd.nav.open_usage_subject`, and `cmd.nav.focus_route` or an equivalent compact family that normalizes to `route_target` and `OpenSubject`; they must not expand into a second catalog language.
- `cmd.nav.open_subject` or an equivalent compact wrapper resolves file, document, artifact, generated, and report subjects by carrying normalized `route_target` plus `OpenSubject`; `/document/artifact/generated/report` is shorthand for those subject families, not a fourth command-payload language.
- Public `cmd.nav` / `cmd.nav.*` IDs are optional migration aliases, not a replacement target language; wrapper-style `/focus` and open commands may remain user-facing when they normalize to `route_target` and `OpenSubject`.
- Navigation compatibility is not a winner/loser or `/loser` alias table: legacy names can point to wrapper commands, but wrapper classification, route payload, and owner command IDs stay visible instead of hiding route ownership behind a preferred alias.

### Command normalization model


All UI commands (button clicks, keyboard shortcuts, context menu items) normalize to a standard record:
```

## Known-37 recovery-unavailable catalog rows - 2026-07-18

| Ordered owner action | Canonical command | Sole handler | Label | Payload/result authority |
|---|---|---|---|---|
| `locate_and_verify_recovery` | `cmd.runtime.locate_and_verify_recovery` | `handlers::runtime::locate_and_verify_recovery` | Locate and verify recovery | `LocateAndVerifyRecoveryRequest` / `LocateAndVerifyRecoveryResult` |
| `abandon_recovery` | `cmd.runtime.abandon_recovery` | `handlers::runtime::abandon_recovery` | Abandon recovery | `AbandonRecoveryRequest` / `AbandonRecoveryResult` |

These are the only new catalog IDs. They have no chat-, graph-, orchestrator-, FileSafe-, or provider-local peer command and no generic repair alias. The catalog projects the owner-provided `allowed_action_ids[]` in exact order: `open_details`, `locate_and_verify_recovery`, `replan`, optional owner-admitted `start_fresh_attempt`, then `abandon_recovery`. It neither sorts nor reconstructs membership. Ordinary restore and retry remain disabled while the anchor is `recovery_unavailable`.

Every dispatch carries the exact current blocked episode, anchor, snapshot set, five-value reason, and attempt branch. Pre-attempt payloads omit `attempt_id`; post-attempt payloads require the current exact value. Locate collects one non-secret FileSafe-normalized recovery source and discloses verification requirements. Abandon requires explicit `abandon_recovery_and_preserve_local_work` confirmation, durable confirmation authority, and preserved-work acknowledgement. Disabled projections retain the exact owner reason, including stale projection, permission/storage failure, operation in progress, source verification failure, or missing explicit confirmation; they never map an unknown state to an enabled action.

The strict `UICommandResponse` contains a reference to the matching typed domain result. `ack_status`, `result_status`, button dismissal, or accepted dispatch is not success. A successful locate displays owner-verified material, receipt-backed `resolved`, and preserved work. A successful abandonment displays receipt-backed `abandoned_by_user`, preserved work, and `cleanup_performed = false`. Refused, recoverable failure, missing receipt, or `not_committed` preserves the anchor and displays no release, recovery, cleanup, retry, or successor claim. Replay displays the original result and receipt identity without implying a second side effect.

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

- Retire TierContext/tier_id/TierType/Tiers/Phase-Task-Subtask runtime canon.
- Retire allowed_actions[] / reason_code / recovery_options[] survivors from live blocked/HITL contracts.
- Retirement targets are exactly: `TierContext`, `tier_id`, `TierType`, `Tiers`, `allowed_actions[]`, `reason_code`, `recovery_options[]`, `approve_continue`.
- This subsection stays limited to tier-era retirement under 2.0B and does not redefine route payload or command-normalization ownership.
- Legacy event examples that use `run.started` or `usage.event` with `tier_id`, `run.tier_started`, `run.tier_completed`, `run.verification_result` keyed by `tier`, `hitl.approval_requested` with `request_id`, `tier_id`, `tier_type`, or `allowed_actions`, and tier-start validation `/persona/QA` examples are tier-era compatibility only; current runtime events and approvals resolve through package/seam/lane execution identity and the blocked-state contract.

### Stale command-family retirement guard

Highest-risk stale-canon exact-token families must be handled explicitly rather than left as broad themes. `cmd.chat.delete_message` is not an active catalog command. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit destination for bare `/web`. Legacy grouped `cmd.web.*` names such as `cmd.web.search`, `cmd.web.fetch`, `cmd.web.extract`, and `cmd.web.research` are compatibility-only retirement evidence; active slash dispatch uses `cmd.chat.web.search`, `cmd.chat.web.extract`, `cmd.chat.web.research`, `cmd.chat.web.fetch`, `cmd.chat.web.crawl`, or `cmd.chat.web.map`. External environment/config names such as `OPENCODE_DISABLE_LSP_DOWNLOAD` and `OPENCODE_LSP_TIMEOUT` are source-lineage examples only and must not become PM-visible command IDs, command labels, or catalog payload fields. `Open in Terminal` and `Show Terminal` may share a reveal/focus implementation for the same live `terminal_session_id`, but they must not both normalize to `cmd.terminal.show`; the catalog keeps distinct user-facing terminal action rows and does not collapse terminal actions into one normalized target. `QuestionInput` and `QuestionAnswer` are retired question-contract names; the live question tool contract owns the replacement shape. `requested_persona_id` and `effective_persona_id` are retired persona/runtime identity aliases and must not reappear as canonical command payload fields. `unblock_action_ids` and `unblock_action_ids[]` are stale blocked-recovery field names and normalize to the shared blocked-action contract. Legacy web error names `invalid_url`, `fetch_failed`, `provider_unavailable`, and `credit_cap_exceeded` must map to the canonical web error taxonomy instead of becoming UI command error canon. The stale web-action enum string `wait | screenshot | select | hover | evaluate | press | focus` is not the canonical WebAction enum; `wait`, `select`, `hover`, `evaluate`, `press`, and `focus` only survive as retired exact tokens unless a separate owner contract maps them to canonical actions.

### Command-entry gap and owner-coverage guard

`Search-command routing`, `### 2.0 Command entry contract (doc-level)`, and `### 2.0A Promoted Section 15 command families` are catalog discoverability anchors for `gap-003`; artifact drill-through commands must route through Usage and the shared route/open contract instead of storing `{ tool_name, invocation_summary, options }` as a live UI command payload. The tuple `{ tool_name, invocation_summary, options }`, standalone `invocation_summary`, and the conclusion `No remaining gaps` are source-lineage only for old tool summaries, not active command-catalog payload canon.

Later-model command coverage must preserve `/projection-trust`, `/gating`, `MVP`, `GUI`, `IDs`, `later-model`, `promoted-feature`, `multi-project-tab`, `attention-center`, and runtime `cmd.runtime.*` ownership when a consumer doc claims command readiness. Runtime projections, promoted-feature command families, LSP mutators, and checklist surfaces must gate dispatch through stable command IDs and wiring rows before claiming user-visible completion.

Cross-doc command ownership gaps remain concrete until resolved: `FinalGUISpec.md` `§4.1` versus `§5.1` navigation contradictions, the already-known `Orchestrator_Page.md` `TOC` promises for `UICommand IDs`, `Wiring_Matrix.md` references to `cmd.orchestrator.switch_tab`, `Commands_System.md` / `assistant-chat-design.md` override tension around `cmd.chat.run_user_command`, and account, concern, promotion, tab, window, catalog, dev, `/promoted-family`, and `/window/catalog/dev` command families must resolve to catalog rows or owner-documented retirement before `GUI` command readiness can pass; these are machine-breaking gaps, not editorial cleanup.

Audit-survivor command gaps stay owner-scoped instead of becoming local proof of readiness: duplicate numbering and `ContractRef` failures remain owner-doc issues, unresolved command `IDs` and `promoted-shell` persistence contradictions remain catalog/wiring obligations, and mixed `execution-era` canon in storage or runtime docs must be retired by those owner contracts before command readiness can pass.

Command/wiring/template drift is gate-breaking, not editorial: `/wiring/template`, internal AC contradiction, uncataloged command `IDs`, stable action IDs, and `Plans/Commands_System.md` / `/Commands_System.md` references must resolve through catalog IDs, wiring rows, and owner-documented retirement before wiring verification can pass.

Canon-breaking owner defects stay visible until repaired: missing anchors, stale section references, unresolved command IDs, `/packaging` authority splits, and `naming-rule` claims without backing canon are command-readiness blockers, not summary cleanup.

Uncataloged owner signals from `newtools.md`, assistant memory, and project-switch handoffs stay concrete registration obligations until resolved: preview command prefixes now normalize to `cmd.orchestrator.preview_open`, `cmd.orchestrator.preview_stop`, or `cmd.orchestrator.open_preview_artifact`; `cmd.orchestrator.push_image`, `/build/open-artifact`, `CustomHeadlessTool`, `ToolID`, `GATE`, `/tool/permission`, `/permission/config`, `config-file`, `redb-side`, `memory.gist`, `memory.gist.*`, `live.*`, `auto-trigger`, `doctor-check`, `multi-way`, `net-new`, `HITL`, `/project-switch`, `/handoff`, `non-durable`, `final-pass-worthy`, and CtAs must either become stable command/event/storage rows or be explicitly retired by their owner docs.

Wiring and index backfill must keep extraction hazards visible: `/deprecated-ID`, `owner-doc-to-catalog`, `Wiring_Matrix.schema.json`, `cmd.*.json`, `non-catalog`, `filename-shaped`, `schema.json`, `under-describes`, `plans-index`, `00-plans-index.md`, `rewrite-critical`, and `workspace-tab` are not valid command IDs merely because they appear in prose, filenames, examples, or index summaries. Owner-doc-to-catalog coverage requires a deterministic alias/deprecated-ID rule and stale revalidation handshake before a `GUI` checklist or promoted-feature owner can treat those IDs as verified.

`Wiring_Matrix.schema.json` stays intentionally lean: row-local metadata may point to catalog and route/open contracts for normalization expectations, but it must not repeat route payload or command-normalization rules in every wiring row.

Usage and artifact summary drift is handled as a consumer/owner gap, not as a command payload shape. `gap-008`, `result_id`, `account-history`, `over-summarized`, `projection-health`, `missing_data_shape`, `restore points`, `TierContext`, `tier_id`, `detached_window`, `artifact_kind`, `task_id`, `tool_name`, and `invocation_summary` remain discoverable only as stale or consumer-side lineage unless their owner contracts bind a current route/open, artifact drill-through, or account-history projection.

Legacy HITL and runtime-governance carry-through stays explicit. `HITLRequest`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are compatibility-only approval vocabulary once `cmd.runtime.*` and `blocked_sequence` own runtime recovery. Runtime governance must not leave `blocked_owner`, `GPT`, `DAE`, branch-ownership, isolated-execution-substrate, `/resume/restart`, `external_publish_side_effect`, `pre-dispatch`, `counter-family`, `non-bypassable`, or `yolo` as unowned command behavior; those terms resolve through permission, route/open, DAE, and blocked-runtime owners before dispatch.

`high-consequence` runtime actions bind to canonical blocked-state and `/HITL` command contracts rather than ad hoc UI confirms.

`Run_Graph_View.md` / `Run_Graph_View` consumes `UI_Command_Catalog.md` / `UI_Command_Catalog` HITL args and recovery command namespaces from this catalog; graph-local specs must not mint conflicting HITL payloads or recovery IDs.

`UI_Command_Catalog.md` / `UI_Command_Catalog` is the sole stable action owner for command `/template/example` references: every referenced command must exist as a catalog row, compatibility alias, or explicit retirement note before wiring gates trust it.

`execution_unit_context` is a runtime contract with a strict executor core, a conditional `/remediation/recovery` family for blocked recovery, and a disclosure-only `/audit` family for UI and evidence convenience.

`Crosswalk.md` owns `Primitive:RouteTarget` and `Primitive:OpenSubject`; `RouteTarget` and `OpenSubject` references in this catalog are consumer links to that route/open primitive boundary.

Thread search hits use `object_kind = message`, `object_id = <message_id>`, and `thread_id`; `object_kind`, `object_id`, and `message_id` must not be replaced by page-local search result identifiers.

Command rows carry wrapper-vs-alias classification in metadata rather than only in prose or `/tables`, so wrappers, deprecated aliases, and canonical command IDs remain machine-verifiable.

`tier`, `tier_id`, raw widget ids, panel ids, and serialization tokens do not belong in `object_kind`; older route `/pivot` docs must move away from `tier_id` and one-off special-case ids toward canonical object, subject, and route identities.

Tiers-tab widgets are compatibility-only: `widget.tier_tree` renders a Phase/Task/Subtask tree and `widget.progress_bars` renders phase-scoped bars, but neither becomes the package `/Task/Subtask` or `/seam/lane` command model.

`History` commands that expose `Delete Run` require durable historical `/audit` semantics, confirmation strength, and retention/disposition behavior before deletion can be treated as a safe catalog action.

The path-based `open_file` target uses `OpenFile { path, line?, range?, target_editor_panel_id?, target_editor_group_id?, target_group? }`; the panel and group fields select editor placement only and do not replace route_target, OpenSubject, or object identity. `target_group` remains an explicit compatibility alias for `target_editor_group_id`.

Subject-open and generalized route focus are first-class route/open behavior: `subject-open` wrappers cover `/route`, `/navigation`, `/focus/show`, and `routed-open` pivots so `cross-surface` commands do not keep accreting as `one-off` cases.

Route identity can carry `message_id`, `workflow_run_id`, `scheduler_pass_id`, `safe_point_id`, and `remediation_root_id`; callers may resolve runtime-lineage `IDs` through indexes and `/projections` instead of knowing file paths.

Route validation normalizes legacy `/special-case` IDs before dispatch; `family-specific` IDs that are unique only within run scope must not become ad hoc `top-level` route fields.

`resume_url` is serialized route transport, not a member of the broader `*_ref` family or an independent route primitive.

Command layers stay `wrapper-based` and `domain-facing`; `/wiring` keeps stable `user-facing` command `IDs` while wrapper metadata points to shared route/open contracts.

Older tier `/HITL` `request-era` tables require an explicit `compatibility-label` and cannot stand as live canon beside runtime `cmd.runtime.*` sections.

The catalog must not teach consumers how to persist approval state. Approval persistence belongs to blocked-state and storage owners, while old request-era sections are compatibility lineage only so they do not recreate storage and command drift.

Route/open wrappers use one route-payload discipline. `/wrappers`, subject-open, `/open-subject`, `cmd.nav.open_subject`, route-payload, route-payload-driven, `/focus/show`, `/open/focus`, route-target, `OpenSubject`, `OrchestratorPage`, mutation-risk, and operational-identity are command-catalog classification and normalization concerns, not excuses to mint bespoke open/show/focus argument shapes.

Ledger export and related show-in commands preserve canonical IDs and structured fields: `CSV` is a convenience projection, while JSON `/JSONL` stays close to canonical record structure.

Operational-identity displays for GitHub, `/registry/Kubernetes`, and similar external contexts must not overload `/account` provider fields or become one-off surface widgets; they route through normalized `operational_identity` evidence.

Runtime-artifact schema gaps, durable worktree `/record` and `/projections` families, and account `/concern/promotion` command families stay routed to their owner contracts; the catalog records command IDs and wrapper normalization without pretending to own those schemas.

`UI_Command_Catalog.md` stays action-oriented for stable command `IDs`, while target-model-oriented `/routing`, subject-open, and route payload contracts live in route/open owners. A routing contract, not more command IDs, absorbs `resume_url` transport so navigation semantics are not redefined separately in the catalog, `GUI` docs, and storage docs.

Route payloads avoid route-local surrogate IDs when a canonical domain ID exists: primary identity stays in `object_kind`/`object_id` or `subject_id`, while sub-selection uses `inspector_target` or a specialized verb instead of minting new command IDs.

Crosswalk ownership stays explicit: the command catalog and command contract own normalization metadata, the route contract owns `route-target` structure, and wiring rows bind UI elements to command IDs plus `/handler` references only.

`inspector_target` does not replace `tab_id`; `wizard_step`, `message_id`, `line`, `range`, and compare-target state are destination-local or OpenFile/detail anchors, not inspector target enum values.

Object-first blocked and runtime routes use `run_id + node_id + attempt_id? + blocked_sequence?` as the identity tuple where needed; `tier_id` is compatibility/display grouping and not canonical route identity.

Surface-specific `/wrapper` and wrapper-command entries keep stable public command IDs, but `/open-by-identity`, subject-open, and route-payload behavior sits under `UICommand.args` as a shared target object; wrapper metadata records `normalizes_to_contract` or `alias_of_command_id` instead of per-command payload tables.

Route scope restores focused-run/thread/project context explicitly: `/thread/project`, `focused_run_id`, `thread_id`, and `project_id` travel with wrapper-command routing instead of being recovered from UI-local state.

Object routes use canonical domain IDs directly. `object_id` covers `thread_id`, `message_id`, `wizard_id`, `run_id`, `attempt_id`, `scheduler_pass_id`, `safe_point_id`, `remediation_root_id`, `lane_id`, `worktree_id`, concern IDs, and `/promotion/graph-patch` IDs when the owner contract defines them.

The `UICommand` envelope carries command-normalization metadata; `Contracts_V0.md` owns the small envelope and route/open target object, while the catalog records command IDs and normalization intent.

Crosswalk primitive consumers such as `UICommand`, `DocumentPane`, and `DocumentCheckpoint` consume route-target and subject-open primitives; they do not own a competing route/open payload model.

Orchestrator shell-view commands for top-level, full-page, run-scoped surfaces such as `/history/evidence`, Ledger, and graph views bind to upstream data-source owners and must not mint local compatibility fields.

Source-lineage packet names and process inventory files remain noncanonical, not live command payloads. `exact_items`, `meta.json`, `pm.work_item_meta.v2`, `current_state`, `current_state.md`, `canon_inventory`, `canon_inventory.json`, `open_gaps`, `open_gaps.json`, `next_required_stage`, and `Audit Mode` may appear in evidence notes, but the catalog only carries them as stale/source-lineage markers unless another owner binds a user-facing command.

Run Graph and page-ownership conflicts are resolved toward runtime and route primitives. `/action-gating`, `command-arg`, graph-local, page-ownership, template-level, runtime-minimum, `/events/tool`, `/token`, runtime-native, waiting_approval, `cmd.graph`, and `cmd.graph.*` consumers must not create competing UI command IDs when `cmd.runtime.*`, route/open identity, and the cataloged Orchestrator shell-view commands already define the dispatch surface.

Command-system backfill must resolve ghost IDs and stale command-state claims without creating a second command system. `/wiring`, `/superseded`, command-state, command-system, `/fix`, `/mode`, `/HITL`, `/compact`, override_builtin, `cmd.chat.run_user_command`, and `cmd.chat.branch_from_restore` must either resolve to stable catalog IDs, explicit compatibility aliases, or owner-documented retirement before downstream wiring claims pass.

Widget and shell-navigation consumers remain route-aware. `widget.tier_tree`, `widget.progress_bars`, load-bearing widget catalog entries, `/Task/Subtask`, `/seam/lane-aware`, `cmd.panel.switch`, and `panel_id` are compatibility or shell-view selectors unless they resolve through a concrete route/open payload; `cmd.panel.switch` must not become a hidden object-targeting command when a stable surface-specific route command exists.

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

GitHub recovery binding note: `cmd.github.connect` remains arg-less only for a fresh device-code start locked by Spec Lock. Deferred reconnect and recovery wrappers must not stay `arg-less`, `under-keyed`, or `split-brain`; a blocked `/node/thread/wizard` recovery context binds `project_id`, `auth_realm`, actor context, effective-account snapshot/ref, and source `/ref` before resuming across `GitHub_Integration.md` and `UI_Command_Catalog.md`.


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
These IDs are required by `Plans/GitHub_Integration.md` section D and the legacy compatibility flow in `Plans/chain-wizard-flexibility.md` section 13. New current-product surfaces route the deferred handoff to Planning Wizard; the old `chain_wizard` command spelling is retained here only as a compatibility alias until a dedicated command-ID migration is accepted.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.project.add_existing` | `{ path?, ssh_remote_id?, ssh_path? }` | `project.added` | File menu, Dashboard, Add Existing Project flow |
| `cmd.project.new_local` | `{ name, parent_path, init_git?, preset? }` | `project.created` | File menu, Dashboard, New Local Project flow |
| `cmd.project.new_github_repo` | `{ name, description?, private, visibility?, gitignore_template?, license?, local_clone_path }` | `project.created`, `git.clone.completed` | File menu, Dashboard, New GitHub Repo flow |
| `cmd.project.open` | `{ project_id }` | no persisted domain event (navigation) | File Manager, Dashboard, project finish screens |
| `cmd.project.chain_wizard_open_deferred` | `{ project_id, wizard_id, default_intent, project_path, remote_repo_ref?, deferred_wizard_payload_ref? }` | `wizard.opened`, `wizard.deferred_payload.loaded` | Project finish screens, Dashboard, Planning Wizard deferred intake (legacy command alias) |

ContractRef: ContractName:Plans/GitHub_Integration.md#d-project-management-flows-no-chain-wizard-required, ContractName:Plans/chain-wizard-flexibility.md

---

### 2.1B File Manager commands

These IDs are required by `Plans/FileManager.md`.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.file.new_file` | `{ project_id, parent_path, name }` | `file.created` | File Manager |
| `cmd.file.new_folder` | `{ project_id, parent_path, name }` | `folder.created` | File Manager |
| `cmd.file.rename` | `{ project_id, path, new_name }` | `file.renamed` or `folder.renamed` | File Manager, File Editor |
| `cmd.file.delete` | `{ project_id, paths[] }` | `file.deleted` or `folder.deleted` | File Manager |
| `cmd.file.copy_path` | `{ project_id, paths[], format?: "absolute"|"relative" }` | no persisted domain event (clipboard) | File Manager |
| `cmd.file.copy_nodes` | `{ project_id, paths[] }` | no persisted domain event (clipboard intent) | File Manager |
| `cmd.file.cut_nodes` | `{ project_id, paths[] }` | no persisted domain event (clipboard intent) | File Manager |
| `cmd.file.paste_nodes` | `{ project_id, destination_path, mode?: "copy"|"move" }` | `file.copied` / `file.moved` / `folder.copied` / `folder.moved` | File Manager |
| `cmd.file.open_with` | `{ project_id, path, target }` | no persisted domain event (navigation/open) | File Manager, File Editor, Preview surfaces |
| `cmd.file.save_local_copy` | `{ project_id, paths[], destination_hint? }` | `file.exported` or `folder.exported` | File Manager |

Rules:
- The File Manager command family uses stable snake-case operation names (`new_file`, `new_folder`, `copy_nodes`, `cut_nodes`, `paste_nodes`, `save_local_copy`) so menu labels can vary without changing dispatch identity.
- `cmd.file.new_file` and `cmd.file.new_folder` are valid only for the project root or a folder target; `cmd.file.rename`, `cmd.file.delete`, and path-copy actions are valid for files or folders, with multi-select allowed only where the owner contract permits it.
- `cmd.file.open_with` is PM-native for MVP editor and preview targets owned by FileManager §11.4.
- The `cmd.file.open_with` MVP-native target enum is exactly `source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, and `diff_review`.
- `system_default` is not part of this command's canonical MVP target enum. Future OS handoff must use a separate explicit command such as `cmd.file.open_in_system_default`.
- `cmd.file.save_local_copy` is the explicit remote-to-local export command for file or folder nodes and remains separate from tree-node Copy / Cut / Paste.

ContractRef: ContractName:Plans/FileManager.md#114-open-with-and-save-local-copy, ContractName:Plans/FinalGUISpec.md

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

Widget-hostability scope narrowing: widget-command affected-surface scope is limited to widget-hosted surfaces: Dashboard, Usage page, and Orchestrator widget-tab surfaces that are actually widget-hosted. `cmd.widget.*` rows do not imply that every Orchestrator tab is widget-composed.

ContractRef: ContractName:Plans/Widget_System.md#11, ContractName:Plans/Contracts_V0.md#7-uicommand

---

### 2.4 Run Graph commands

Run Graph runtime recovery commands are defined canonically in `## Canonical Runtime Recovery Command Consolidation (2026-03-09)`.

Rules:
- graph-specific approval and recovery commands target blocked/runtime identity, not `request_id`
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
- `cmd.orchestrator.open_receipt`
- `cmd.orchestrator.compare_run_output`
- `cmd.orchestrator.open_source_control`
- `cmd.orchestrator.open_github_actions`
- `cmd.orchestrator.open_docker_manager`
- `cmd.orchestrator.open_kubernetes`
- `cmd.orchestrator.open_conflict_assistant`
- `cmd.orchestrator.restore_safe_point_then_retry`
- `cmd.orchestrator.open_in_source_control`

Concrete preview/build Orchestrator rows:

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.orchestrator.switch_tab` | Switch Orchestrator Tab | Selects an Orchestrator tab as shell/view state and does not replace runtime or route identity | `orchestrator_visible && tab_available` |
| `cmd.orchestrator.preview_open` | Open Preview | Launches or reveals a preview session for the resolved visual target and records preview session evidence | `preview_target_resolvable` |
| `cmd.orchestrator.preview_stop` | Stop Preview | Stops the selected preview session without changing build or run state | `preview_session_active` |
| `cmd.orchestrator.open_preview_artifact` | Open Preview Artifact | Opens preview media or fallback artifact paths through the route/open contract | `preview_artifact_available` |
| `cmd.orchestrator.build_run` | Build Run | Starts the selected build profile and records normalized build-result artifact metadata | `build_profile_resolvable && permission_allowed` |
| `cmd.orchestrator.open_build_artifact` | Open Build Artifact | Opens a build output path, installer artifact, log, or normalized build result through the route/open contract | `build_artifact_available` |
| `cmd.orchestrator.push_image` | Push Image | Dispatches the approved remote image push after a successful local build result exists | `build_result_successful && push_policy_after_build && permission_allowed` |

Rules:
- Orchestrator object opens are route-consuming navigation wrappers, not layout-only commands
- cross-tab deep links preserve `project_id`, `focused_run_id`, object identity, and inspector focus
- commands that pivot into Source Control or Usage remain public wrapper commands and normalize internally to canonical route/open contracts
- The listed Orchestrator open pivots above are compatibility aliases for owner-surface route opens; runtime mutation recovery still maps through `allowed_action_ids[]` to `cmd.runtime.*`, including `restore_safe_point_then_retry`.
- Legacy cross-surface pivot names `cmd.orchestrator.open_in_github_actions` and `cmd.orchestrator.open_in_docker_manager` are compatibility aliases for `cmd.orchestrator.open_github_actions` and `cmd.orchestrator.open_docker_manager`. They remain `navigation_wrapper` commands and normalize through `route_target` rather than carrying owner-doc state themselves.
- `cmd.artifacts.show_in_usage`, `cmd.artifacts.show_in_ledger`, `cmd.source_control.select_worktree`, and `cmd.orchestrator.open_in_source_control` are object-targeting route actions, not `layout/UI state only` toggles. They carry `project_id`, route/OpenSubject identity, object kind, and scope evidence when they open Usage, Ledger, Source Control, worktree, artifact, receipt, or run context.
- HITL and runtime route `/addressing` use `blocked_sequence`, `cmd.runtime.*`, and shared route identity. Page specs that still describe `node-only`, tier-era, or `/receipt/worktree/workflow` addressing are consumers that must migrate to the catalog route contract rather than invent local action payloads.

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

#### Operational command namespace rules

- `cmd.source_control.*` covers tab selection, repo/worktree focus, history open, graph filter/focus, branch/stash UX, and other Source Control command-family pivots.
- `cmd.git.worktree.*` covers open, compare, recover, prune, lineage, and conflict-resolution entrypoints for project-scope worktrees.
- GitHub Actions uses the `cmd.github.actions` namespace family. `cmd.github.actions.*` includes rerun, cancel, pin, unpin, settings CRUD, current-branch pivots, and log drilldown; existing `cmd.actions.*` rows are compatibility aliases until migrated.
- Docker Manager reserves `cmd.docker.container.*`, `cmd.docker.image`, `cmd.docker.image.*`, `cmd.docker.compose`, `cmd.docker.compose.*`, `cmd.docker.context`, `cmd.docker.context.*`, `cmd.docker.network`, `cmd.docker.network.*`, `cmd.docker.volume`, `cmd.docker.volume.*`, `cmd.docker.bake`, `cmd.docker.bake.*`, `cmd.docker.k8s`, and `cmd.docker.k8s.*`.
- `cmd.docker.k8s` owns Kubernetes commands exposed inside Docker Manager. Existing `cmd.k8s.*` rows are compatibility aliases unless the catalog updates them to the `cmd.docker.k8s.*` namespace.
- Core command-prefix reservation protects core-surface families from user command, `/custom/plugin`, and plugin override. Reserved prefixes include source_control, github_actions, docker, k8s, kubernetes, registry, and other first-party navigation families; custom/plugin commands may compose with these families only by using explicit extension verbs that do not replace canonical meaning.

GitHub Actions command coverage must include authoring assistance, the explicit `current-branch` versus `workflow-library` split, deterministic `disabled-state` behavior for missing scopes, expired auth, or no GitHub remote, plus log drilldown and `branch-to-diff` pivots. Docker command terminology stays separated: `Docker Manager` is the command-surface umbrella, `Docker Hub` is a registry/provider capability inside that surface, `Podman` is an alternate runtime mode, and `Kubernetes` is a project-focused subview/family rather than a separate command owner.

The accepted MVP surface breadth means the command catalog must not remain publish-centric or underdefined. Source Control command coverage includes navigation/history/graph/worktrees, `/history/graph/worktrees`, conflict graph pivots, `/conflict/graph`, and Git operations `/unstage/discard/diff/commit/push/pull/sync/fetch/branch/stash`. GitHub Actions coverage includes rerun, `/cancel/pin/admin/current-branch`, settings CRUD, current-branch focus, list/detail/logs, `/detail/logs`, and compatibility for `/detail/job-expand/view-logs/download-log`. Docker Manager coverage includes `/images/compose/build-bake/contexts/networks/volumes/runtime`, `/image/compose/context/network/volume/bake/Kubernetes`, Podman integration hooks, Kubernetes families, `/auth/Unraid`, `/auth/template`, `/publish/template`, and `/Actions/Docker/Kubernetes` remediation pivots through the owner surfaces. Existing Git basics, Actions list/detail/logs, and Docker publish/auth/template flows are well-covered but no longer sufficient; any `/underdefined` command family must resolve to a first-class owner command or a documented compatibility alias. Help/explainer commands are reserved for advanced surfaces so tooltips, banners, receipts, blocked states, and `/admin/help` links can reopen authored help rather than panel-local ad hoc copy.

Implementation-ready operational wiring requires first-class route commands rather than panel-local labels. `Open in Source Control` carries exact `SCM` context payload for repo, worktree, compare target, baseline, and run/attempt lineage; compare-two-worktrees is a Source Control review route, not an Orchestrator-local diff. Runtime recovery remains restart-safe because `restore-before-rerun`, `baseline_target`, `worktree_id`, and `/attempt` identity are part of the canonical runtime command payload. Source Control persists `source_control.project_state.{project_id}` while GitHub Actions persists `github_actions.project_state.{project_id}`; Docker Manager persistence must cover `/context/compose-scenario/build-target/Kubernetes-focus` alongside runtime, context, compose scenario, build target, and Kubernetes focus. Feature-complete command families include Source Control, GitHub Actions `/cancel/pin/triage/readiness/admin`, Docker Manager operational subviews, and Kubernetes, with all mutating `CRUD` actions resolved through wiring and permission checks.

Historical GUI concept labels are migration evidence, not owner names. `GITHUB ACTIONS`, `DOCKER MANAGE`, and `SOURCE CONTROL` map to canonical GitHub Actions, Docker Manager, and Source Control; `DOCKER` / `MANAGE` copy retires in favor of Docker Manager. The MVP shell still preserves visible workflows: GitHub Actions current runs, workflows, secrets, and manage-secrets; Docker Manager containers, images, volumes, `/networks`, registry push, and auth badge; Source Control branch selector, change list, AI commit generation, commit, and sync.

Boundary language is explicit: `GitHub API` is backend plumbing and `/integration`, not a `GUI` or user-facing panel. GitHub Actions owns workflow-management, Source Control owns repo-control, and both consume shared command routing rather than inheriting a combined Git/GitHub surface.

Broad-pass command and wiring reconciliation spans the command catalog plus its consumers and owner contracts: `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.md`, `Plans/Architecture_Invariants.md`, `Plans/Contracts_V0.md`, `Plans/Permissions_System.md`, `Plans/Commands_System.md`, `Plans/Multi-Account.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/newtools.md`, `Plans/newfeatures.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Widget_System.md`, `Plans/Run_Graph_View.md`, `Plans/FileManager.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/assistant-chat-design.md`, `Plans/usage-feature.md`, and `Plans/Glossary.md`.

#### Source Control review and conflict commands

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.source_control.open_review` | Open Review Mode | Opens the Source Control review lens for a selected worktree, base branch, PR target, or commit range | `git_available && compare_target_resolvable` |
| `cmd.source_control.review.open` | Open Review Mode | Compatibility alias for `cmd.source_control.open_review` | `git_available && compare_target_resolvable` |
| `cmd.source_control.review.swap` | Swap Review Sides | Swaps left/right compare targets in Review mode | `review_mode_open && compare_target_resolvable` |
| `cmd.source_control.review.filter` | Filter Review Files | Applies file filters, ignore-whitespace, or collapse-unchanged state in Review mode | `review_mode_open` |
| `cmd.source_control.set_compare_target` | Set Compare Target | Changes the left/right review baseline or target for Review mode | `review_mode_open && compare_target_resolvable` |
| `cmd.source_control.toggle_generated_filter` | Toggle Generated Filter | Shows or hides generated files in Review mode and related Source Control diffs | `source_control_visible` |
| `cmd.source_control.open_conflict` | Open Conflict Assistant | Opens the Conflict assistant for the selected conflict group or file | `git_available && conflict_present` |
| `cmd.source_control.open_merge_editor` | Open Merge Editor | Opens the structured merge editor for a selected conflicted file | `conflict_file_selected && merge_editor_available` |
| `cmd.source_control.resolve_conflict_side` | Resolve Conflict Side | Applies the chosen ours/theirs/base/manual side for a selected conflict hunk or file after user confirmation | `conflict_file_selected && resolution_side_selected` |
| `cmd.source_control.mark_conflict_resolved` | Mark Conflict Resolved | Marks a conflicted file as resolved after validation confirms no conflict markers remain | `conflict_file_selected && no_conflict_markers` |
| `cmd.git.diff_open` | Open Git Diff | Payload `cmd.git.diff_open { project_id, repo_id, repo_relative_path?, compare_target? }`; opens a path-level or repo-level diff through Source Control review, not a chat-local diff | `git_available && compare_target_resolvable` |
| `cmd.git.diff_toggle_mode` | Toggle Diff Mode | Payload `cmd.git.diff_toggle_mode { mode: "side_by_side"|"unified" }`; switches the in-buffer or review diff presentation without changing the compare identity | `diff_view_open` |
| `cmd.git.diff_set_compare_target` | Set Git Compare Target | Payload `cmd.git.diff_set_compare_target { target_kind: "head"|"index"|"merge_base"|"branch"|"commit"|"parent", ref? }`; changes the low-level diff baseline without replacing Source Control Review mode | `git_available && compare_target_resolvable` |
| `cmd.git.diff_search` | Search Current Diff | Payload `cmd.git.diff_search { query, direction?: "next"|"prev" }`; runs diff-local search inside the current git diff/review surface, not project-wide Search | `diff_view_open && query_present` |
| `cmd.git.stage_hunks` | Stage Hunks | Payload `cmd.git.stage_hunks { path, hunk_ids: string[] }`; stages selected hunks after FileSafe and Source Control validation | `git_available && hunk_ids_selected` |
| `cmd.git.unstage_hunks` | Unstage Hunks | Payload `cmd.git.unstage_hunks { path, hunk_ids: string[] }`; unstages selected hunks after validation | `git_available && hunk_ids_selected` |
| `cmd.git.discard_hunks` | Discard Hunks | Payload `cmd.git.discard_hunks { path, hunk_ids: string[] }`; discards selected hunks only through explicit destructive confirmation | `git_available && hunk_ids_selected && discard_confirmed` |
| `cmd.git.conflict_apply_resolution` | Apply Conflict Resolution | Payload `cmd.git.conflict_apply_resolution { path, conflict_id, resolution: "ours"|"theirs"|"both" }`; applies one conflict resolution choice while preserving conflict_id evidence | `conflict_file_selected && conflict_id_resolvable` |
| `cmd.source_control.graph.focus` | Focus Graph Object | Focuses a branch, commit, worktree, or run-linked graph node in Source Control Graph | `git_available && graph_object_resolvable` |
| `cmd.source_control.graph.filter` | Filter Graph | Applies branch, worktree, ownership, or status filters to Source Control Graph | `source_control_graph_visible` |
| `cmd.source_control.graph.layout` | Set Graph Layout | Changes compact/expanded graph density or layout mode | `source_control_graph_visible` |
| `cmd.source_control.graph.focus/filter/layout` | Graph Focus/Filter/Layout | Compatibility alias family for graph focus, filter, and layout commands | `source_control_graph_visible` |
| `cmd.source_control.graph_focus` | Focus Graph Object | Compatibility alias for `cmd.source_control.graph.focus` | `git_available && graph_object_resolvable` |
| `cmd.source_control.graph_filter` | Filter Graph | Compatibility alias for `cmd.source_control.graph.filter` | `source_control_graph_visible` |
| `cmd.source_control.history_open_commit` | Open Commit In History | Opens a selected commit in Source Control History | `git_available && commit_resolvable` |
| `cmd.source_control.select_tab` | Select Source Control Tab | Selects `Changes`, `History`, `Graph`, `Worktrees`, or `Branches / Stash` without changing repository state | `source_control_visible` |

| `cmd.source_control.stash` | Open Stash Controls | Opens Source Control `Branches / Stash` controls for the current repo/worktree | `git_available` |
| `cmd.source_control.stash.*` | Stash Command Family | Compatibility family for stash list/create/apply/drop flows | `git_available` |
| `cmd.source_control.suggest_commit_batches` | Suggest Commit Batches | Generates advisory commit groupings and draft messages from staged/unstaged diff clusters | `git_available && changes_present` |
| `cmd.source_control.suggest_commit_groups` | Suggest Commit Groups | Compatibility alias for advisory AI commit batching over staged and unstaged diff clusters | `git_available && changes_present` |
| `cmd.source_control.accept_commit_group` | Accept Commit Group | Accepts one suggested commit group for reviewable staging/message preparation without making it canonical history until the user commits | `git_available && suggested_commit_group_selected` |
| `cmd.source_control.generate_commit_message` | Generate Commit Message | Generates a draft commit message for the selected commit group or current staged diff | `git_available && diff_context_available` |

Compare-open command identity is repository-scoped rather than UI-local. The compatibility token `compare_open` maps to `cmd.source_control.open_review` or `cmd.git.diff_open` with `project_id`, `repo_id`, optional `repo_relative_path`, left/right selectors that can bind to `worktree_id`, branch, commit, or revision, and presentation hints such as `side_by_side` versus `unified`. Path-level stage/unstage/discard commands remain separate from hunk-level aliases (`stage_hunk`, `unstage_hunk`, `discard_hunk`) and their plural command rows above. Conflict-review and `/open-resolution` actions must flow through Source Control conflict commands or `cmd.git.conflict_apply_resolution`; no consumer surface may create ad hoc compare, /diff, /compare, or /compare/stage state from path strings alone.

Rules:
- Review mode state is a Source Control view state with per-project persistence for compare target and filters; it is not canonical repository history.
- Conflict assistant commands record resolution events and blocked-state handoff outcomes through `/event/storage`; they do not persist conflicted file content.
- `cmd.source_control.open_conflict` is the command-backed action behind the `Open Conflict Assistant` GUI entrypoint from `Source Control > Changes` and Orchestrator blocked worktree cards.
- `/disabled` states must explain missing git, missing compare target, `stale-target`, absent conflict files, unavailable merge editor, or policy-restricted mutation rather than silently hiding the command.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### GitHub Actions command family

| Command ID | Label | Description | Keybind | Preconditions |
|---|---|---|---|---|
| `cmd.actions.rerun` | Rerun Workflow | Re-triggers the selected workflow run | none | `actions_panel_visible && selected_run` |
| `cmd.actions.rerun_failed` | Rerun Failed Jobs | Re-triggers only failed jobs in selected run | none | `actions_panel_visible && selected_run && has_failed_jobs` |
| `cmd.actions.cancel` | Cancel Run | Cancels the in-progress workflow run | none | `actions_panel_visible && selected_run && run_in_progress` |
| `cmd.github.actions.pin` | Pin Workflow | Pins a workflow to the GitHub Actions Workflows surface for quick access and health-badge tracking; `cmd.actions.pin` is a compatibility alias | none | `actions_panel_visible && selected_workflow` |
| `cmd.github.actions.unpin` | Unpin Workflow | Removes a pinned workflow from the GitHub Actions Workflows surface; `cmd.actions.unpin` is a compatibility alias | none | `actions_panel_visible && pinned_workflow_selected` |
| `cmd.github.actions.open_run` | Open Run | Opens a GitHub Actions run detail in the GitHub Actions surface | none | `actions_panel_visible && selected_run` |
| `cmd.github.actions.open_job` | Open Job | Opens the selected job within a run detail | none | `actions_panel_visible && selected_run && selected_job` |
| `cmd.github.actions.open_step_logs` | Open Step Logs | Opens logs for the selected job/step, preserving `/job/step` context | none | `actions_panel_visible && selected_job && selected_step` |
| `cmd.github.actions.open_related_diff` | Open Related Diff | Opens Source Control review/diff context correlated from an Actions run, job, or failing step | none | `selected_run && related_diff_available` |
| `cmd.github.actions.open_related_worktree` | Open Related Worktree | Opens the worktree correlated from an Actions run, job, or failing step | none | `selected_run && related_worktree_available` |
| `cmd.github.actions.compare_last_success` | Compare Last Success | Compares the selected run against the last successful run for the same workflow and branch | none | `actions_panel_visible && selected_run` |
| `cmd.github.actions.validate_dispatch_readiness` | Validate Dispatch Readiness | Revalidates workflow dispatch readiness before rerun, dispatch, or hosted-admin mutation | none | `actions_panel_visible && selected_workflow` |
| `cmd.actions.view_logs` | View Logs | Opens full log output for selected job/step | none | `actions_panel_visible && selected_job` |
| `cmd.actions.open_in_browser` | Open in Browser | Opens the workflow run on GitHub.com | none | `actions_panel_visible && selected_run` |

Rules:
- Actions-to-code commands bridge GitHub Actions to Source Control without moving ownership of hosted runs into Source Control.
- `open_related_diff` and `open_related_worktree` use receipt-backed run id, commit range, changed files, branch, and worktree refs when available.
- If exact correlation is unavailable, commands show candidate commit ranges, workflow file diffs, or related worktrees with an uncertainty label instead of auto-opening a guessed target.
- Legacy underscore commands `cmd.github_actions.show`, `cmd.github_actions.switch_subview`, `cmd.github_actions.rerun_workflow`, `cmd.github_actions.cancel_workflow`, `cmd.github_actions.pin_workflow`, `cmd.github_actions.open_run_log`, and `cmd.github_actions.open_run_diff` are compatibility-only names for the current GitHub Actions command family. They normalize respectively to GitHub Actions route/show state, GitHub Actions `/switch_subview` view-state, `cmd.actions.rerun`, `cmd.actions.cancel`, `cmd.github.actions.pin`, `cmd.github.actions.open_step_logs` or `cmd.actions.view_logs`, and `cmd.github.actions.open_related_diff`; `cmd.github_actions.*` must not become a second primary namespace.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

### 2.5A Docker Manager command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.docker.build` | Build Image | Compatibility alias for the selected `cmd.docker.build.*` path | `docker_available && build_target_selected` |
| `cmd.docker.build.select_target` | Select Build Target | Selects Dockerfile, context, target stage, platform, and build mode before build or bake | `docker_available && build_candidate_present` |
| `cmd.docker.build.run` | Run Build | Runs the selected Docker build path and records last successful build target plus validation snapshot | `docker_available && build_target_selected` |
| `cmd.docker.bake.preview` | Preview Bake | Previews resolved Bake targets and platforms without publishing | `docker_available && bake_file_resolved` |
| `cmd.docker.bake.run` | Run Bake | Runs the selected `cmd.docker.bake.*` target | `docker_available && bake_target_selected` |
| `cmd.docker.run` | Run Container | Starts a container from selected image | `docker_available && image_selected` |
| `cmd.docker.stop` | Stop Container | Stops a running container | `docker_available && container_running` |
| `cmd.docker.restart` | Restart Container | Restarts a container | `docker_available && container_selected` |
| `cmd.docker.remove` | Remove Container | Removes a stopped container | `docker_available && container_stopped` |
| `cmd.docker.container.open` | Open Container Access | Opens a resolved URL or access target for a running container when confidence is sufficient | `docker_available && container_running && access_target_resolved` |
| `cmd.docker.container.view_logs` | View Container Logs | Opens container logs with follow, paused snapshot, and historical modes | `docker_available && container_selected` |
| `cmd.docker.container.attach_shell` | Attach Shell | Starts an audited `docker exec/attach` shell session in a running container | `docker_available && container_running && permission_allowed` |
| `cmd.docker.container.stats` | View Stats | Shows live or cached container stats with freshness markers | `docker_available && container_selected` |
| `cmd.docker.container.inspect` | Inspect Container | Shows structured inspect output with secret and redaction policy applied | `docker_available && container_selected` |
| `cmd.docker.logs` | View Logs | Compatibility alias for `cmd.docker.container.view_logs` | `docker_available && container_selected` |
| `cmd.docker.exec` | Exec Shell | Compatibility alias for `cmd.docker.container.attach_shell` | `docker_available && container_running` |
| `cmd.docker.inspect` | Inspect | Compatibility alias for `cmd.docker.container.inspect` | `docker_available && resource_selected` |
| `cmd.docker.compose_up` | Compose Up | Compatibility alias for a full-compose scenario run | `docker_available && compose_file_selected` |
| `cmd.docker.compose_down` | Compose Down | Compatibility alias for full-compose down | `docker_available && compose_running` |
| `cmd.docker.compose.up_subset` | Compose Up Subset | Starts selected services/profiles/env files/ports from a compose scenario | `docker_available && compose_subset_valid` |
| `cmd.docker.compose.down_subset` | Compose Down Subset | Stops selected services from a compose scenario | `docker_available && compose_subset_running` |
| `cmd.docker.compose.scenario.save` | Save Compose Scenario | Saves selected services, `/profiles/env` files, port mappings, detached mode, and log-follow defaults | `compose_file_selected` |
| `cmd.docker.compose.scenario.run` | Run Compose Scenario | Runs a saved scenario and records the scenario id on the preview or development run | `docker_available && compose_scenario_valid` |
| `cmd.docker.compose.scenario.edit` | Edit Compose Scenario | Edits a saved scenario or repairs degraded scenario validation | `compose_scenario_selected` |
| `cmd.docker.compose.scenario.delete` | Delete Compose Scenario | Deletes a saved scenario without deleting compose files | `compose_scenario_selected` |
| `cmd.docker.create_repository` | Create Repository | Starts the protected DockerHub repository creation confirmation flow for the proposed namespace/repository/privacy tuple | `registry_target_missing && permission_allowed` |
| `cmd.docker.create_repository.confirm` | Confirm Repository Creation | Confirms the protected repository creation request after showing namespace, repository name, privacy, and private-by-default notice | `repository_creation_confirmation_visible` |
| `cmd.docker.create_repository.cancel` | Cancel Repository Creation | Cancels the protected repository creation request without approving image push or registry promotion | `repository_creation_confirmation_visible` |
| `cmd.docker.registry.promote` | Promote Registry Artifact | Promotes, copies, or retags a digest-first artifact to a selected target registry/repo/tag | `registry_source_resolved && registry_target_allowed` |
| `cmd.docker.registry.tag_push` | Tag And Push | Applies the approved `/tag/push` action to a digest-first artifact | `registry_target_allowed && permission_allowed` |
| `cmd.docker.image.push` | Push Image | Compatibility alias for an approved image push through Docker Manager registry publish authority | `image_selected && registry_target_allowed && permission_allowed` |
| `cmd.docker.drift.compare` | Compare Docker Drift | Compares local Dockerfile, `/compose/bake`, and manifests with last build, publish, or deploy metadata | `docker_project_detected` |
| `cmd.docker.cleanup.scan` | Scan Cleanup | Dry-runs prune/remove recommendations with protected asset and receipt checks | `docker_available` |
| `cmd.docker.cleanup.prune` | Prune Selected Assets | Executes approved cleanup targets after dry-run review | `cleanup_targets_selected && permission_allowed` |

The grouped command token `cmd.docker.compose.scenario.save/run/edit/delete` denotes the scenario command family; payloads use the concrete ids above. Legacy Docker rows normalize into canonical `cmd.docker.container.*`, `cmd.docker.compose.*`, `cmd.docker.bake.*`, or registry command families and MUST NOT introduce new payload shapes.
`cmd.docker.show` and `cmd.docker.switch_subview` are shell/view-state compatibility wrappers for opening Docker Manager and selecting a Docker Manager subview. They do not replace concrete Docker Manager domain-action rows such as build, compose, registry, cleanup, or Kubernetes commands.
Docker `/publish/repo-management` and `/lineage` routes preserve the authority split: `cmd.orchestrator.push_image` is the Orchestrator after-build remote side-effect step, while `cmd.docker.image.push` and `cmd.docker.registry.tag_push` are Docker Manager registry publish commands that must share the same permission, account, receipt, and lineage checks rather than claiming a separate event family.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### 2.5B Docker Manager Kubernetes command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.docker.k8s.apply` | Apply Manifest | Applies a selected manifest or Helm-rendered manifest inside the selected project scope | `k8s_connected && manifest_selected && permission_allowed` |
| `cmd.docker.k8s.diff` | Diff Manifest | Diffs selected manifests against the selected context, namespace, or workload where supported | `k8s_connected && manifest_selected` |
| `cmd.docker.k8s.logs` | View Workload Logs | Opens workload or pod logs with follow, paused snapshot, and historical modes | `k8s_connected && workload_selected` |
| `cmd.docker.k8s.exec` | Exec In Workload | Starts an audited privileged exec session in the selected pod/container | `k8s_connected && workload_running && permission_allowed` |
| `cmd.docker.k8s.port_forward` | Port Forward | Starts an audited port-forward with local bind address/port recorded | `k8s_connected && workload_selected && permission_allowed` |
| `cmd.docker.k8s.select_context` | Select Context | Selects the project-focused Kubernetes context and revalidates capability | `k8s_available` |
| `cmd.docker.k8s.select_namespace` | Select Namespace | Selects the namespace within the selected context and refreshes workload focus | `k8s_connected` |
| `cmd.docker.k8s.helm_preview` | Preview Helm | Renders Helm output for the selected release/chart without applying it | `k8s_project_detected && helm_source_selected` |
| `cmd.docker.k8s.helm_install` | Install Helm | Installs or upgrades the selected Helm release after permission and diff review | `k8s_connected && helm_source_selected && permission_allowed` |

The grouped command token `cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace` denotes the canonical Docker Manager Kubernetes family. Existing `cmd.k8s.*`, `set_context`, and `set_namespace` rows are compatibility aliases until migrated; canonical payloads use `cmd.docker.k8s.*`.

Docker Manager and `/Kubernetes` command availability copy uses the shared disabled-state taxonomy from the containers and worktree owner docs: `Unsupported`, `Not configured`, `Unauthorized`, `Unreachable`, `Degraded`, and `Partial capability`. UI command rows surface those canonical `/UX-state` reason families from runtime projection state instead of inventing panel-local Docker/Kubernetes disabled wording; legacy `cmd.container.*` references are retired to the active `cmd.docker.*` and `cmd.docker.k8s.*` namespaces.

Docker and Kubernetes side-effect commands use domain-bound approval scoping: registry promotion binds approval to the exact registry/namespace/repository, digest/tag target, and publish action; Kubernetes mutations bind approval to the selected context, namespace, workload/resource, and operation. Cross-surface receipts retain `docker_refs` and `kubernetes_refs` lineage, and runtime drift-detection or `/trust/proxy` blockers must refresh effective capability before mutation.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md

### 2.5C Project-scope git worktree commands

These commands manage repository-level worktree inventory, ownership, safe actions, and lifecycle. They complement, but do not replace, the assistant thread-scoped `cmd.chat.worktree.*` family defined in section 2.6.1. The grouped tokens `cmd.git.worktree.list/select/open/compare/prune/recover`, `cmd.git.worktree.open|compare|recover|prune|focus_lineage`, and `cmd.git.worktree.recover/prune/remove/reuse` denote the canonical project-scope safe-worktree command set; payloads use the concrete IDs below.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.git.worktree.list` | List Worktrees | Shows all worktrees for current repo, including stale/blocked ownership projection state | `git_available` |
| `cmd.git.worktree.select` | Select Worktree | Selects a worktree row and persists selected worktree/filter state per project | `git_available && worktree_row_available` |
| `cmd.git.worktree.open` | Open Worktree | Opens or focuses the selected worktree root | `git_available && worktree_selected && worktree_path_resolvable` |
| `cmd.git.worktree.open_files` | Open Worktree Files | Compatibility alias for opening the selected worktree root/files through `cmd.git.worktree.open` plus File Manager focus; does not create a separate assistant-thread worktree command | `git_available && worktree_selected && worktree_path_resolvable` |
| `cmd.git.worktree.compare` | Compare Worktree | Opens Review mode for the selected worktree against a base branch, another worktree, PR target, or commit range | `git_available && worktree_selected && compare_target_resolvable` |
| `cmd.git.worktree.create` | Create Worktree | Creates a new git worktree at specified path | `git_available && !worktree_limit_reached` |
| `cmd.git.worktree.remove` | Remove Worktree | Removes an existing live worktree after confirmation, lineage, safe-point, blocked-state, and cleanup gates pass | `git_available && worktree_selected && worktree_clean && prune_policy_allows && lineage_gate_passed` |
| `cmd.git.worktree.prune` | Prune Worktree | Prunes eligible stale worktree metadata after active-run, blocked, safe-point, and lineage gates pass | `git_available && worktree_selected && prune_policy_allows && lineage_gate_passed` |
| `cmd.git.worktree.request_prune` | Request Worktree Prune | Compatibility alias for approval-gated prune/remove request flows | `git_available && worktree_selected` |
| `cmd.git.worktree.reuse` | Reuse Worktree | Rebinds a clean, lineage-compatible worktree to a new run/lane/package owner after reuse gates pass | `git_available && worktree_selected && ownership_resolvable && worktree_clean && lineage_gate_passed` |
| `cmd.git.worktree.recover` | Recover Worktree | Reopens or rebinds a worktree from stored lineage; if ownership cannot be resolved after restart, marks `unknown ownership` rather than unlocking silently | `git_available && worktree_selected` |
| `cmd.git.worktree.focus_lineage` | Focus Worktree Lineage | Focuses the selected worktree's owner run, branch lineage, receipt, or `/orphaned` tombstone context without mutating it | `git_available && worktree_selected` |
| `cmd.git.worktree.release` | Release Worktree Ownership | Releases runtime ownership after lineage-safe completion, archival, or an explicit recorded override | `git_available && worktree_selected && ownership_resolvable` |
| `cmd.git.worktree.lock` | Lock Worktree | Prevents accidental removal of worktree | `git_available && worktree_selected` |
| `cmd.git.worktree.unlock` | Unlock Worktree | Removes lock from worktree | `git_available && worktree_locked` |
| `cmd.git.worktree.switch` | Switch to Worktree | Compatibility alias for select plus open until callers migrate | `git_available && worktree_selected` |

Rules:
- `cmd.git.worktree.*` owns project-scope worktree inventory, lock state, navigation, ownership release, recovery, prune/remove, and reuse entrypoints.
- `cmd.chat.worktree.*` remains the thread-scoped wrapper family and MAY normalize internally to project-scope worktree operations.
- Manual prune/remove/reuse is forbidden while the worktree is `active` or `blocked_preserved` unless explicit override policy allows it and records the override.
- Safe worktree action commands carry enough `repo_id`, `worktree_id`, optional `safe_point_id`, lane/run/package refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session safety.
- `show-unsafe-actions` expert mode may reveal disabled choices but must not make them executable while active run, blocked, safe-point, or lineage gates fail.
- Optional confirmation strictness applies before destructive or ownership-changing actions, including remove, prune, and reuse.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### 2.6 Chat context usage commands

#### 2.6A Chat thread lifecycle commands

The grouped token `cmd.chat.{new,archive,delete,rename,pin,export,search}` denotes chat thread lifecycle and discovery commands, not message-level delete or file-restore behavior.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.chat.new` | New Thread | Creates or focuses a fresh assistant thread shell; `thread_id` is minted when the first user message commits | `chat_available` |
| `cmd.chat.archive` | Archive Thread | Archives the selected thread while preserving transcript, lineage, citations, attachments, and audit metadata | `thread_selected && !active_run_in_thread` |
| `cmd.chat.delete` | Delete Thread | After explicit thread-delete confirmation, persists the content-free deletion/tombstone authority, removes the thread immediately from ordinary navigation/search/context/export, and requests physical content purge within 24 hours unless a legal hold delays purge; it does not delete a message or silently release worktree/recovery holds. | `thread_selected && delete_confirmed && !active_run_in_thread && deletion_family_available` |
| `cmd.chat.rename` | Rename Thread | Renames the selected thread title without changing thread_id, message ids, or worktree lineage | `thread_selected` |
| `cmd.chat.pin` | Pin Thread | Pins or unpins the selected thread in the thread list without changing lifecycle state | `thread_selected` |
| `cmd.chat.export` | Export Thread | Exports the selected thread transcript and permitted metadata to the supported local export format | `thread_selected` |
| `cmd.chat.search` | Search Thread | Searches within the selected thread and restores focus to exact message matches | `thread_selected` |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### Context Lens commands

Context Lens command IDs stay in lockstep with `Plans/assistant-chat-design.md`, `Plans/Wiring_Matrix.md`, and `Plans/FinalGUISpec.md` for placement, mode activation, message-selection toggles, multi-select behavior, Subcompact apply/revert, clear/reset behavior, and the dropdown `Turn Off` label.

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

Six commands for assistant thread-level worktree operations. All share the base when-clause `activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`; each row adds its own visibility and enablement when-clause.

| Command ID | Slash command | Label | Description | Extra when-clause |
|---|---|---|---|---|
| `cmd.chat.worktree.create` | `/worktree create` | Create Worktree | Creates a worktree for the active thread and opens the create/bind dialog | visible when `!activeThreadHasWorktree`; enabled when visible |
| `cmd.chat.worktree.unbind` | `/worktree unbind` | Unbind Worktree | Detaches the active thread from its worktree while keeping the worktree on disk | visible when `activeThreadHasWorktree`; enabled when `!activeThreadHasActiveRun` |
| `cmd.chat.worktree.remove` | `/worktree remove` | Remove Worktree | Detaches and prunes the active thread's worktree, with confirmation if dirty | visible when `activeThreadHasWorktree`; enabled when `!activeThreadHasActiveRun` |
| `cmd.chat.worktree.merge` | `/worktree merge [--squash|--rebase]` | Merge Worktree | Opens the merge-back dialog for the active thread's worktree | visible when `activeThreadHasWorktree`; enabled when `!activeThreadHasActiveRun && !worktreeDirty && !worktreeHasConflicts && !worktreeDetachedHead && !mergeLockHeld` |
| `cmd.chat.worktree.pr` | `/worktree pr` | Create PR | Opens the PR creation panel for the active thread's worktree branch | visible when `activeThreadHasWorktree && projectHasGitHubRemote`; enabled when `!activeThreadHasActiveRun && !worktreeDetachedHead` |
| `cmd.chat.worktree.info` | `/worktree` | Worktree Info | Shows the active thread's current worktree binding and status without mutation | visible when `activeThreadHasWorktree`; enabled when visible |

`Open Files` routes through the project-scope `cmd.git.worktree.open` command. Arbitrary Bind Existing remains outside the Assistant thread-worktree MVP and must not be exposed as `cmd.chat.worktree.bind_existing`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md

**Context variable definitions:**
- `activeThreadExists`: a chat thread is selected in the assistant panel
- `activeThreadHasWorktree`: active thread has a non-null worktree binding in redb
- `activeThreadHasActiveRun`: active thread has a run in progress against the bound worktree
- `projectIsGitRepo`: active project has a `.git` directory
- `projectIsRemoteNonSSH`: project is remote-mode but not SSH-tunneled (worktrees unsupported)
- `projectHasGitHubRemote`: project git config contains a `github.com` remote URL
- `worktreeDirty`, `worktreeHasConflicts`, `worktreeDetachedHead`, and `mergeLockHeld`: projection-backed guards from the bound worktree and merge lock state

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md

| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed`, `context.compaction.failed`; result status `started | already_running | cancelled | no_op | degraded | unavailable | retry_scheduled | completed | failed` | Chat context circle Compact Now action, command palette |
| `cmd.chat.open_thread_context_details` | `{ thread_id }` | layout/UI state only | Chat context hover module, artifact deep-links |
| `cmd.chat.focus_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |
| `cmd.chat.close_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |

Rules:
- hover-summary disclosure is passive UI and does not require its own stable command ID
- choosing `More Details` dispatches `cmd.chat.open_thread_context_details`
- clicking the circle may reveal `Compact Now` locally, but `cmd.chat.compact_context` is dispatched only when the user actually chooses that action
- the command result must surface already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, or failed outcomes through visible status or receipt-backed detail
- `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` are superseded and MUST NOT remain canonical IDs
- Legacy callers that still cite `cmd.chat.open_thread_usage` or `cmd.chat.focus_thread_usage` normalize to route/open Usage context and are not pure shell or layout toggles.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md
### 2.6A Render / browser preview commands
Browser, terminal, and dev-session commands share one shell/runtime interaction family. Browser commands own browser-session behavior, terminal commands own section or tab or pane or session behavior, and dev commands own dev-workflow behavior.

#### Browser preview and browsing commands

Rules:
- Browser export can retrieve more than the viewport, but normal browsing stays slice-based.
- Browser automation commands for Debug investigations carry the chosen URL plus normalized `/domain/session` identity so command routing can bind the browser session, permission scope, and evidence bundle without relying on a freeform label.
- Browser command inventory is expanded beyond the older `/focus/detach/share/revoke` shorthand. That shorthand maps only to the concrete focus, detach, share, and revoke rows below; `/screenshot/devtools/automation` maps to screenshot capture, DevTools, automation takeover, promotion, and recovery command rows in this table.
- This `Plans/UI_Command_Catalog.md` browser section is canonical and packetizable only when consumers reference concrete `cmd.browser.*` command IDs, payloads, and emitted events from this catalog plus the behavior owner in `Plans/Section15_MVP_Promoted_Features_Spec.md`, rather than stale aggregate browser labels.
- `Research_session` permission is gated by the parent web tool permission; e.g., `webfetch` permission covers browser actions performed within the owning `webfetch` call.

| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.browser.open_workspace_preview` | `{ project_id, target, workspace_tab_id, target_editor_panel_id?, target_editor_group_id? }` | `workspace.layout_changed` when targeted placement changes, `browser.session.created`, `browser.session.state_changed` | File preview, command palette, editor/browser tab |
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

Capture event rules:
- `browser.context_captured` MUST carry `attachment_type: "browser_element_context" | "browser_selection_context"`, `chip_id`, `browser_session_id`, `thread_id?`, capture status, and source/provenance fields so element-pick and text-selection captures remain distinct through composer prep and prompt serialization.
- `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent` update browser-session share state only; they do not create `browser.context_captured` events and do not serialize page, selection, or element context without a separate explicit capture command.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Terminal session and layout commands

This section defines the canonical contract for this surface.

Core rules:
- Terminal promotion and handoff are LOCKED so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal-handoff routing is the canonical bridge from chat/tool cards into live terminal sessions; it preserves session identity and must not re-own the terminal session under an individual tool.
- The `/terminal` surface consumes the command identities in this section; callers use these stable command IDs rather than inventing terminal-local aliases.
- Terminal action canon must preserve the distinct terminal actions in owned command-table rows. Distinct terminal actions must keep owned command-table rows and do not collapse terminal actions into one normalized target.
- chat-callable one-shot tools such as bash, grep, codesearch, chatsearch, logsearch, and logread stay in-chat by default with concise expandable audit/result blocks; interactive, long-running, or stdin-requiring shell/PTY work promotes to Terminal, Output, or Ports surfaces with chat retaining pointers and bounded `/previews`.
- One-shot bash/command cards retain the exact command text in the chat message, expose bounded expandable `/output`, and keep full large output behind refs/blobs owned by the runtime surface.
- Command cards label completed shell work as `Ran: <command>` and active shell work as `Running: <command>`; web/search operation cards label discovery summaries as `<operation>: <query/url> — N sources`.
- PM built-in agents performing shell-like automation default to PTY-backed terminal execution when work is user-inspectable, multi-step, long-running, or likely to need intervention; non-PTY hidden execution is reserved for infrastructure-like helper work where shell semantics are irrelevant. Agent-originated Output and agent-originated inline `/summaries` must not impersonate a pseudo-console; when a canonical terminal session exists they expose a compact-audit pointer plus `live-terminal` reveal/focus controls.
- Terminal-originated work and terminal-originated secondary artifacts can emit `/Problems/Ports`, `/Ports/Output`, and `/port/output` items without surrendering terminal ownership of the live session. Those items carry `/linkback`, reveal-origin, and same-session routing to the originating terminal when one exists; preview surfaces may link to the preview-driving dev session or terminal, but reveal is navigation rather than surface replacement.
- Historical command and audit details show the frozen permission/runtime snapshot that actually governed execution, including policy/mode/project changes; current Settings state must not replace historical `/policy/mode/project` evidence.
- Dedicated log and audit surfaces provide richer search plus `/filter/drill-down`, `/changes`, `/summaries`, `/transparency`, and `/logging/subagents` over event-log summaries and blobs, while in-thread transparency remains concise and user-facing.

| Command ID | Payload | Domain event(s) | UI surface(s) |
| --- | --- | --- | --- |
| `cmd.terminal.open` | label `Open in Terminal`; `terminal_session_id`; reveal existing session context; optional `origin_surface`, `reveal-origin`, and `/linkback` refs | terminal session reveal/focus | command cards, terminal surfaces, Problems, Ports, Output, previews |
| `cmd.terminal.show` | label `Show Terminal`; `terminal_session_id`; focus the same live session already associated with the card or route context | terminal session reveal/focus | command cards, terminal surfaces |
| `cmd.terminal.rerun` | label `Rerun in Terminal`; command replay payload plus terminal session launch context; same-session flag or new-session request | new terminal launch; command replay | command cards, terminal surfaces |
| `cmd.terminal.detach` | label `Detach/Pop-Out`; `terminal_session_id`; detach target | terminal detach/pop-out | command cards, terminal surfaces |
| `cmd.terminal.focus` | `terminal_session_id?`, `terminal_pane_id?`, `dev_session_id?`, `/last-relevant` fallback mode | terminal reveal/focus | command cards, command palette, terminal surfaces |
| `cmd.terminal.split_pane` | `terminal_session_id?`, `terminal_tab_id`, direction, profile/cwd hints | terminal layout changed | terminal surfaces |
| `cmd.terminal.move_pane` | moved-pane identity, source and target `/tab/pane/session`, `/pane/session`, section/window target | terminal layout changed | terminal surfaces |
| `cmd.terminal.close_pane` | `terminal_pane_id`, `terminal_session_id?`, `termination_policy?` | terminal layout changed or session stopping | terminal surfaces |
| `cmd.terminal.restart_replace` | `terminal_session_id`, `/restart/replace` policy, command replay or shell profile hints | terminal session replaced | command cards, terminal surfaces |

Fields:
- stable command IDs
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
- Terminal shortcut metadata records interaction-mode eligibility, focus context, suppressed binding disclosure, and whether the action preempts shell/TUI input; unsafe `terminal-search` entries must be unavailable instead of stealing TUI keystrokes.
- Every promoted command card binds to stable terminal session identity
- Command-card terminal affordances include command-output and copy-output actions, reliable `/copy/paste` in output and input areas, mouse-driven selection/copy/paste support, keyboard-selection, wrapped-line input navigation, TUI capture guidance, remote-context and shell/profile diagnostics, and automation `/focus/reuse` hooks for opening, focusing, reusing, interrupting, resizing, and capturing structured terminal state.
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- Reuse precedence is exact `terminal_session_id`, then explicit `/pane/session`, then workflow-bound `/thread/tool` or dev-session binding, then workspace-bound most-recent terminal context only for `Show Terminal`; commands that imply same-session continuity must not fall back to a fresh shell silently.
- `/moving/detaching/reattaching` terminal UI is layout presentation over the same underlying session; focusing or moving a terminal must preserve `/tab/pane/session` identity unless the command explicitly asks for a new terminal.
- Agent follow-up actions for shell-like work continue targeting the same bound session; if no appropriate binding exists, PM creates a clearly scoped new session, records the binding, and later follow-up actions use it. An exited-session or `/exited` session may be revealed for review, copy-output, or `/restart/replace` rather than being treated as a live shell.
- Chat-owned terminal command cards distinguish compact-audit ownership from live-terminal ownership: `/assistant-chat-design.md` consumers may render bounded audit previews, but any live PTY intervention, takeover, or same-session reveal routes through `Open in Terminal` or `Show Terminal`.
- Inline terminal cards keep `/collapse` and expand controls local to the chat preview; `/background` moves long-running work into terminal-owned session state without changing the owning `terminal_session_id`.
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

Rules:
- Missing referenced commands must become concrete catalog rows or explicit compatibility/retirement notes.
- Wrapper-style open/focus commands may remain user-facing wrappers when they normalize to shared route/open contracts; avoid too many public `cmd.nav.*` commands when existing wrappers preserve clearer UX.

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
- Debug recovery or rerun commands for a linked `dev_session_id` degrade to `attention_required` when no canonical rerun command exists, the failure depends on local hardware `/device/manual` interaction, or the environment is too flaky to classify automatically.
- Command catalog updates alone are not complete until corresponding `Plans/Wiring_Matrix.md` and `/Wiring_Matrix.md` rows bind stable command IDs to handlers, UI surfaces, and acceptance checks; otherwise terminal reveal and handoff coverage is a false positive.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

#### 2.6B Chat message action commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.chat.copy_message` | `{ thread_id, message_id }` | Copy the rendered message content. |
| `cmd.chat.retry_message` | `{ thread_id, message_id }` | Re-run the selected failed/cancelled assistant turn. |
| `cmd.chat.rewind` | `{ thread_id, target_message_id }` | Rewind conversation history only (`conversation-only`); does not restore files. |
| `cmd.chat.revert` | `{ project_id, thread_id, target_message_id?, repo_id, worktree_id, expected_turn_manifest_sha256, idempotency_key }` | Restore the complete immutable whole-turn mutation manifest through the FileSafe exact-replace journal; omitted `target_message_id` resolves to the latest eligible mutating assistant turn. The command never rewinds conversation state or branches from a conversation restore point. |
| `cmd.chat.add_file_reference` | `{ project_id, thread_id?, path, line_range? }` | Insert a visible file reference chip into the composer. File-only in MVP; folder references are out of scope. |

Canonical signature lock: `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }`.

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
- `cmd.chat.revert` routes through the canonical FileSafe file-restore pipeline and uses the absolute file paths recorded in the assistant turn's file mutation log; it must not reinterpret relative paths through the current `working_directory`
- the resolved turn record must match `expected_turn_manifest_sha256`, `repo_id`, and `worktree_id` before mutation; `no_eligible_mutating_turn`, a stale manifest, or an identity mismatch refuses without creating a FileSafe transaction
- after resolution, the command consumes the same `restored_clean | restore_skipped | restore_refused | restore_failed | restore_recovery_required` truth, manifest/rollback equality, restart reconciliation, custody, and recovery holds as safe-point restore; `restored_with_conflicts` and partial multi-file success are invalid
- after a successful revert, affected editors refresh from the canonical mutation pipeline
- `cmd.chat.rewind` MUST NOT be used as a file-restore alias
- `cmd.chat.resend_last_user_message` is distinct from `cmd.chat.retry_message`; resend replays the latest user-authored input, while retry re-runs a failed or cancelled assistant turn
- `cmd.chat.copy_code_block`, `cmd.chat.insert_code_block`, and `cmd.chat.apply_code_block` operate on a resolved code-block sub-selection rather than the entire message body
- Stop/edit/delete message availability is exposed through existing stop, edit/resend, rewind/revert, and retention-policy surfaces; `/edit/delete` is an availability shorthand and not a new delete-message command ID.
- GUI question surfaces support multiple-choice and multi-choice interactions with a freeform `Other` path, while logging and activity metadata remain sliceable across `/agent/tool/model/persona/subagent/token` dimensions.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 2.6.5 Debug Mode UICommand bridge

Debug Mode uses the canonical `cmd.debug.*` UICommand family owned by `Plans/Commands_System.md`; these are internal wiring IDs, not User Commands. The catalog bridge preserves the concrete IDs `cmd.debug.start`, `cmd.debug.stop`, `cmd.debug.pause`, `cmd.debug.resume`, `cmd.debug.add_breakpoint`, `cmd.debug.remove_breakpoint`, `cmd.debug.clear_breakpoints`, `cmd.debug.view_evidence`, `cmd.debug.step`, and `cmd.debug.collect_snapshot`, while leaving investigation lifecycle semantics, preconditions, and evidence behavior in `Commands_System.md`.

ContractRef: ContractName:Plans/Commands_System.md#7.1-debug-mode-dispatch-family

### 2.7 Chat slash commands (reserved)

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.
- Exact named obligations that must survive in this reserved family are the six-tool web family, reserved slash-command set, Agent Config and Skills ownership, and the question, TODO, and visualizer terms.
- `/skill use`, `/skill list`, and `/skill show` are not MVP subcommands. Bare `/skill` lists available skills, while `/skill <skill_name> [args]`, the Skills panel, and natural language all invoke the same `invoke_skill` contract.
- Web command GUI help/autocomplete exposes `/web` sub-operations as one reserved built-in family: `/web search <query>`, `/web fetch <url>`, `/web extract <url>`, `/web research <task-or-question>`, `/web crawl <url>`, and `/web map <url>`. Bare `/web` dispatches `cmd.chat.web.help` as a non-executing help entry; it does not default to top-level `/search` or `/crawl`.
- Legacy top-level tool-name spellings such as `/webfetch` and `/webresearch` are compatibility/tool-key lineage, not active slash-command prototypes; user-facing slash input stays under `/web fetch <url>` and `/web research <task>`.
- Web intent taxonomy is shared by slash, palette, natural language, and agent/subagent initiation: current/latest/docs/issues/PR questions route to `cmd.chat.web.search` followed by read-backed `webfetch` when claims require evidence; "read this URL" and pasted URLs route to `cmd.chat.web.fetch` / `webfetch`; structured page pulls route to `cmd.chat.web.extract`; site traversal routes to `cmd.chat.web.crawl`; site topology routes to `cmd.chat.web.map`; compare, investigate, research, and deep-research requests route to `cmd.chat.web.research` with `research_mode`; visual, dynamic-page, iframe, console, network, screenshot, or PDF evidence needs route through BrowserAction / Site Reader under the same dispatcher. All routes persist `invocation_source` and optional `agent_reason`.
- The `/web` family is a surface-bound reserved-command family; `/provisional` or catch-all entries remain help/autocomplete affordances until promoted into concrete subcommand IDs.
- Web `/activity` and history rows use assistant-chat-design-style operation cards: top-level requested/effective runtime snapshot fields plus web-operation child payloads, with large `sources_ref`, `content_ref`, and `map_ref` material dereferenced on demand from refs/blobs or `/blob` storage rather than loaded eagerly.
- Web-source transparency is first-class for cited-web-search and agent-web-research: cards and history expose `/sources`, source counts, `Web search: {query}`, and the six distinct labels (LOCKED) `Searching Web: <query>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, `Mapping Site: <root_url>`, and `Reading Site: <url>`, with `Reading Site: <url>` reserved for the PM-native Site Reader path.
- Final answers prefer `/extract-backed` or read-backed provenance over bare snippets.
- Reserved built-in slash commands are non-overridable in the override-policy; user commands remain under `/x-...` or another custom namespace, and `/web <subop>` IDs stay stable for multi-operation/provider behavior.
- Legacy `/reconciliation` references are process-only and must not become user-facing command IDs.
- Provider option visibility in `/web` help and settings includes support-tier, provider health, fallback disclosure, `/credit` usage, pay-as-you-go warnings, and advanced controls such as `search_depth`, `max_results`, `include_domains`, `exclude_domains`, `time_range`, `start_date`, `end_date`, `include_images`, conservative `include_raw_content`, `/summarization`, `chunks_per_source`, `ultra-fast`, `fast`, `basic`, and `advanced`; best-practices text favors concise queries, sub-queries for complex asks, and a two-step Searching Web then Reading Site flow.
- Provider category help may expose `categories?: string[]` with options `"github"`, `"research"`, and `"pdf"` when the effective web provider supports category filters.
- Do-not-overfit rules apply to command-catalog imports and reference `/baselines`: `/catalog/import`, preview-safe visual-module contracts, and in-chat rendering stay PM-native and must not inherit plugin-specific, `/MCP/container-specific`, xeditor-specific, or external baseline implementation nouns as user-visible command language.
- Web approval cards use operation-specific scope wording: `search` and `research` use the `*` wildcard because the host is not known upfront, while `extract`, `crawl`, `map`, and `read` are `host-scoped` to `https://host.example/*`; scheme-relative input such as `//host.example/` is normalized to an explicit scheme before permission-scope evaluation.
- Web command help and operation-card previews may show lightweight result-shape hints: `query_preview` for search, `url` and `content_format` for fetch/extract, and `task_preview` for research. For crawl help, `/web crawl <url>` parses `url: string` and previews `crawl results + traversed refs`; detailed crawl limits, dedup, and filtering stay owned by `Plans/Tools.md`.
- Extract-format help may describe `links` as `Array<{ url, text?, rel? }>` and `images` as `Array<{ url, alt?, dimensions? }>` when those extraction formats are requested; the command catalog owns the visible help/prototype text while the tool contract owns payload validation.

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
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- /goal
- /goal again
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
- /goal dispatches `cmd.chat.goal.start` for Goal button/chip/icon, slash command, and natural-language Goal Mode activation.
- /goal again dispatches `cmd.chat.goal.update` for active-goal updates, natural-language update requests, and the small update icon beside Goal status.
- /rewind dispatches `cmd.chat.rewind` and remains conversation-only
- /revert dispatches `cmd.chat.revert` and remains file-mutation restore, not conversation rewind
- /share, /settings, /doctor, and /help are reserved built-in slash entries that route to their owning thread, settings, health, and help surfaces rather than user-defined commands
- /clear stays removed and must not return as a `thread-clear` command
- Source cleanup shorthand `/de-duplication`, `/research-focused`, `/risky`, and `thread-clear` normalizes to reserved-command alias policy plus ask-gated web permission posture; it does not create extra slash commands.
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog

#### 2.7.1 Goal Mode slash command rows

| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.chat.goal.start` | `{ thread_id, goal_prompt?, source: slash|button|chip|icon|natural_language }` | Goal Runtime event envelope; concrete Goal event names and payload schemas remain owned by Goal_Runtime_System, Contracts_V0, and storage-plan registration. | Assistant Chat composer, Goal chip, command palette |
| `cmd.chat.goal.update` | `{ thread_id, update_text?, source: slash|natural_language|status_icon }` | Goal Runtime event envelope; concrete Goal event names and payload schemas remain owned by Goal_Runtime_System, Contracts_V0, and storage-plan registration. | Assistant Chat composer, Goal status/menu |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.md

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

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand

---
### 2.8A Side-panel and artifacts navigation commands

| Command ID | Payload | Behavior |
|---|---|---|
| `cmd.artifacts.show_in_usage` | `{ project_id, route_target, open_subject, artifact_id?, usage_event_ref?, usage_record_id?, provider_attempt_ref?, attempt_id?, node_id?, tool_call_id?, trace_ref?, receipt_refs[]?, raw_payload_ref?, run_id?, thread_id? }` | Opens or focuses Usage on the referenced artifact/usage subject using object-first route/open identity; `route_target.object_kind = usage_event` is required when `usage_event_ref` is available. |
| `cmd.artifacts.show_in_ledger` | `{ project_id, route_target, open_subject, artifact_id?, usage_event_ref?, usage_record_id?, ledger_ref?, provider_attempt_ref?, attempt_id?, node_id?, tool_call_id?, trace_ref?, receipt_refs[]?, raw_payload_ref?, run_id?, thread_id? }` | Opens or focuses Ledger on the referenced artifact, receipt, usage event, or run context using shared route/open identity. |


### Search Command Catalog

#### Search commands

| Command ID | Parameters | Behavior |
| --- | --- | --- |
| `cmd.search.show` | `{ project_id, focus? }` | Reveal or focus the Search side panel. |
| `cmd.search.find_in_files` | `{ project_id, query?, scope? }` | Run or rerun find-in-files in the Search panel. |
| `cmd.search.replace_in_files` | `{ project_id, query?, replacement?, scope? }` | Run replace preview or apply flow in the Search panel. |
| `cmd.search.open_result` | `{ project_id, query_session_id, subject_id, disposition? }` | Open a Search result through `route_target` and the canonical file-open path. |
| `cmd.search.replace_selected` | `{ project_id, query_session_id, subject_id }` | Apply replacement to one selected result identified by canonical subject identity. |
| `cmd.search.replace_all` | `{ project_id, query_session_id, replacement }` | Apply the replacement across the entire preserved query session after the Search owner validates the current result snapshot and mutation path. |
| `cmd.search.rebuild_index` | `{ project_id }` | Triggers Search-owned index rebuild while preserving `/replacement` routing for replace-in-files state. |
| `cmd.search.evict_remote_cache` | `{ project_id, remote_cache_id? }` | Opens confirmed remote cache eviction for `/eviction/search` without bypassing FinalGUISpec indexing settings copy. |

Rules:
- Search command routing resolves through `route_target`.
- Search commands remain side-panel scoped and preserve run-aware search scope, query-session state, and open-disposition / reuse policy through `disposition?` and route/open owner resolution.
- The source command shape `cmd.search.replace_all { query_session_id, replacement }` is the required query-session payload core; `project_id` scopes dispatch in the canonical table row.
- Search routing policy is owned by `Plans/Orchestrator_Page.md#search-routing-and-action-policy`.
## References
- `Plans/Contracts_V0.md#7-uicommand`
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
| `retry_now` | `cmd.runtime.retry_now` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id, repo_id?, worktree_id?, baseline_target?, safe_point_id?, historical_commit_oid?, expected_head_oid?, expected_state_sha256?, dirty_state_confirmed?, idempotency_key }` |
| `resume_after_prerequisite` | `cmd.runtime.resume_after_prerequisite` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `restore_safe_point_then_retry` | `cmd.runtime.restore_safe_point_then_retry` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point", idempotency_key }` |
| `start_fresh_attempt` | `cmd.runtime.start_fresh_attempt` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id?, repo_id?, worktree_id?, baseline_target?, safe_point_id?, historical_commit_oid?, expected_head_oid?, expected_state_sha256?, dirty_state_confirmed?, idempotency_key }` |
| `replan` | `cmd.runtime.replan` | `{ run_id, node_id, attempt_id? }` |
| `skip_node` | `cmd.runtime.skip_node` | `{ run_id, node_id, attempt_id? }` |
| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |
| `open_details` | `cmd.runtime.open_attempt_details` | `{ run_id, node_id, attempt_id? }` |

SCM-targeted retry and `/fresh-attempt` commands support the same worktree reuse policy as restore. `baseline_target` is closed to `safe_point | historical_commit | worktree_head`; the former stale candidate wording is superseded. Conditional payload and effect are exact:

| `baseline_target` | Conditionally required immutable inputs | Effect and successful postcondition |
|---|---|---|
| `safe_point` | `safe_point_id`, `repo_id`, `worktree_id` | FileSafe exact-replaces the complete named-worktree manifest. Only `restored_clean` or zero-mutation `restore_skipped` with target equality may produce the durable baseline receipt used for successor-attempt admission. |
| `historical_commit` | full immutable `historical_commit_oid`, `repo_id`, source `worktree_id` | Preserve the source byte-for-byte and create a distinct isolated clean worktree at that exact commit OID; the durable result carries the new `worktree_id`. No abbreviated, branch, tag, remote, reflog, symbolic, or moving ref is accepted. |
| `worktree_head` | `repo_id`, `worktree_id`, full `expected_head_oid`, `expected_state_sha256`, and `dirty_state_confirmed = true` when dirty | Perform no checkout, reset, stash, clean, branch move, index rewrite, or file mutation. Bind only when the recomputed OID and FileSafe state digest still match exactly. |

`cmd.runtime.restore_safe_point_then_retry` admits only `baseline_target = safe_point`. When `requires_safe_point_restore = true`, it is the only legal rerun command. `cmd.runtime.retry_now` and `cmd.runtime.start_fresh_attempt` accept a target only when the blocked/retry owner admits that verb and every field in the matching row is present. Unknown values, missing conditional fields, stale `blocked_sequence`, repo/worktree mismatch, moving or abbreviated refs, missing/non-commit OIDs, and digest drift refuse without target substitution, successor attempt, cleanup, or automatic replay.

ContractRef: ContractName:Plans/Executor_Protocol.md#approved-baseline-target-retry-and-restore-lifecycle, ContractName:Plans/WorktreeGitImprovement.md#approved-exact-baseline-target-SCM-contract, ContractName:Plans/FileSafe.md#11.1.2b, ContractName:Plans/Contracts_V0.md#safe_point.restored

### Navigation commands
- `cmd.runtime.open_queue_analysis` -> `{ run_id, scheduler_pass_id }`
- `cmd.runtime.open_remediation_lineage` -> `{ run_id, remediation_root_id }`
- `cmd.runtime.open_safe_point_history` -> `{ run_id, safe_point_id? }`
- These runtime navigation commands are route identity examples owned by the catalog and the shared route contract; `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` must not be treated as local graph shortcuts whose route identities are implied but unregistered.

### Pre-attempt blocked rule
When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)

### Recovery command definitions

Recovery verb semantics are canonical command copy:
- `Retry` repeats the already resolved operation target and parameters under the current validation rules.
- `Resume` continues an existing blocked, paused, or waiting episode after its prerequisite, approval, or recovery condition is satisfied.
- `Recover` invokes a canonical remediation flow advertised by `allowed_action_ids[]`; it does not imply a full rerun.
- `Restore` applies an explicit restore point or preserved state and must disclose the target state before mutation.

Surfaces may add context qualifiers, but they must not use these verbs interchangeably across worktrees, GitHub Actions, Docker publish, Kubernetes, `/Unraid`, or Orchestrator recovery flows.


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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/UI_Command_Catalog.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### UCC-002 - Command Catalog Owner Identity

```yaml
plan_unit_id: UCC-002
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI_Command_Catalog.md is the canonical owner document for stable UI command catalog requirements and preserves product, runtime, storage, UI, and governance details in owner-section form.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-002 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: ui_command_catalog_owner_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0002
preserved_exact_tokens:
- UI Command Catalog (Canonical)
- Canonical owner-section requirements
- stable UI command catalog
- owner-section requirements
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- cmd.project.chain_wizard_open_deferred remains a legacy command alias for deferred Planning Wizard intake; active product copy and affected surfaces use Planning Wizard terminology until a dedicated command-ID migration is accepted.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-003 - Compatibility Vocabulary Noncanon

```yaml
plan_unit_id: UCC-003
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Compatibility-only source vocabulary is noncanonical; live UI command wording uses the owner terminology preserved in this document.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-003 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: compatibility_vocabulary_noncanon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0003
preserved_exact_tokens:
- Retire tier-era canon and shadow fields
- Compatibility-only source vocabulary
- noncanonical
- live wording
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Compatibility-only source vocabulary remains source lineage rather than live command canon.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-004 - Compliance Naming And SSOT Header

```yaml
plan_unit_id: UCC-004
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The catalog follows DRY and contract SSOT references, uses Puppet Master as the only platform name, treats older names only as legacy naming, and preserves the UI command SSOT header.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-004 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_catalog_compliance_and_naming
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0004
preserved_exact_tokens:
- Canonical route payload
- Puppet Master
- legacy naming
- PUPPET MASTER -- UI COMMAND SSOT
- ABSOLUTE NAMING RULE
negative_constraints:
- Older naming must be referred to only as legacy naming and must not be quoted as active canon.
preserved_contractrefs:
- 'ContractRef: Plans/DRY_Rules.md'
- 'ContractRef: Plans/Contracts_V0.md'
compatibility_only_notes:
- Older naming is compatibility-only source vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-005 - Stable Command Id Scope

```yaml
plan_unit_id: UCC-005
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI command IDs are stable SSOT identifiers referenced by plans and tests; GUI labels may clean casing or spacing, but internal IDs remain stable, collision-safe, and preserve canonical command-id tokens.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-005 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: stable_command_id_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0005
preserved_exact_tokens:
- 0. Scope
- stable UI command IDs
- GUI labels
- internal IDs
- collision-safe
- hyphens
- canonical command-id tokens
negative_constraints:
- GUI label normalization must not destructively strip hyphens or other canonical command-id tokens.
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-006 - Command Id Naming Rules

```yaml
plan_unit_id: UCC-006
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI command IDs must be lowercase, dot-separated, and prefixed with cmd.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-006 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_id_naming_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0006
preserved_exact_tokens:
- 1. Naming rules
- lowercase
- dot-separated
- cmd.
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-007 - Canonical Command Family Container

```yaml
plan_unit_id: UCC-007
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The Canonical command IDs section contains normalized command families, including promoted Section 15 families organized around shared navigation, search routing, and runtime recovery ownership.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-007 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: canonical_command_family_container
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0008
preserved_exact_tokens:
- 2. Canonical command IDs
- 2.0A Promoted Section 15 command families
- shared navigation
- search routing
- runtime recovery ownership
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-008 - Command Entry Metadata Contract

```yaml
plan_unit_id: UCC-008
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Live command rows carry command_id, label, description, preconditions, command_kind, normalization.kind, normalizes_to_contract, and alias_of_command_id so consumers can classify actions without reading handlers.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-008 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_entry_metadata_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0009
preserved_exact_tokens:
- 2.0 Command entry contract (doc-level)
- command_id
- label
- description
- preconditions
- command_kind
- shell_view
- navigation_wrapper
- domain_action
- normalization.kind
- normalizes_to_contract
- alias_of_command_id
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-009 - Catalog Route Wiring Boundary

```yaml
plan_unit_id: UCC-009
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The command catalog owns command metadata and normalization intent, the route schema owns route-target structure, and wiring rows reference command IDs and handlers without restating full routing semantics.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-009 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: catalog_route_wiring_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0009
preserved_exact_tokens:
- command catalog / command contract layer
- route schema
- route-target structure
- wiring rows
- route_target
negative_constraints:
- Wiring and gate checks must not infer command metadata from handler names or row-local prose.
- Command metadata must not inline route payload shape, object kinds, or argument mapping rules.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-010 - Action Availability Gate Inputs

```yaml
plan_unit_id: UCC-010
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI action availability is scoped by user role, execution_role, active run mode, concern state, blocked_sequence, approval_scope_key, approval_id, and DAE jail posture, and side-effecting commands route through permissions and route/open contracts.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-010 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: action_availability_gate_inputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0010
preserved_exact_tokens:
- 2.0B Action-surface policy
- User role
- execution_role
- active run mode
- blocked_sequence
- approval_scope_key
- approval_id
- DAE jail posture
- external side-effects
negative_constraints:
- The UI surfaces run mode changes, approval decisions, and blocked recovery but does not make those decisions locally.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-011 - Projection Freshness And Verification Lenses

```yaml
plan_unit_id: UCC-011
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Mutating domain_action commands must apply catalog-wide projection-freshness gating before dispatch, and catalog verification must cover UX flow, storage/audit, tools/permissions/provider/identity, and cross-doc routing semantics.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-011 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: projection_freshness_dispatch_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0010
preserved_exact_tokens:
- domain_action
- projection-freshness
- source projection freshness/health
- unavailable
- refresh/revalidation
- UX / flow / action-surface behavior
- state / storage / command / audit-trail behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale, missing, or degraded projection health prevents mutation or forces revalidation before dispatch.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-012 - Route Open Required Fields And Audit Trail

```yaml
plan_unit_id: UCC-012
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Route/open UI commands preserve route_target, OpenSubject, execution_unit_context, approval_scope_key, and operational_identity, with file/provider mutations guarded and route completion refs immutable for audit.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-012 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_required_fields_and_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- route_target
- OpenSubject
- execution_unit_context
- approval_scope_key
- operational_identity
- route completion refs
- audit trail
negative_constraints:
- If route_target becomes unreachable between command build and execution, the UI displays an error and does not attempt fallback mutation.
preserved_contractrefs:
- 'ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, Primitive:ExecutionContext, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-013 - Panel Context And Tab Route Identity

```yaml
plan_unit_id: UCC-013
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Wrapper commands may carry shared panel-context vocabulary for deep-link and cross-surface focus; tab_id is stable page-tab focus, and route-shaped payloads keep route_target, OpenSubject, and panel-context identity distinct from shell/view-state hints.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-013 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: panel_context_and_tab_route_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- panel-context
- project_id
- repo_id?
- worktree_id?
- workflow_ref?
- run_id?
- attempt_id?
- subview?
- tab_id
- /view-state
- /switch_subview
negative_constraints:
- Panel-context is shared wrapper vocabulary only and is not a new cmd.nav family or replacement for route_target or OpenSubject.
- View-state and selected-subview hints must not be used as runtime-local mutation payloads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-014 - Navigation Wrapper Alias Discipline

```yaml
plan_unit_id: UCC-014
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Object-targeting behavior must use route-consuming wrapper commands or normalized route_target arguments; compact cmd.nav aliases remain optional migration aliases that normalize to route_target and OpenSubject without replacing owner command IDs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-014 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: navigation_wrapper_alias_discipline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- cmd.panel.switch
- navigation_wrapper
- cmd.project.open
- cmd.artifacts.show_in_usage
- cmd.artifacts.show_in_ledger
- cmd.nav.open_subject
- cmd.nav.open_usage_subject
- cmd.nav.focus_route
- route_target
- OpenSubject
- legacy names
negative_constraints:
- Do not promote a broad public cmd.nav or cmd.nav.* family merely to avoid owner-specific wrappers.
- Domain wrappers must not invent private route args.
preserved_contractrefs: []
compatibility_only_notes:
- Public cmd.nav / cmd.nav.* IDs are optional migration aliases, not a replacement target language.
- Navigation compatibility is not a winner/loser or /loser alias table.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-015 - Normalized Command Record Envelope

```yaml
plan_unit_id: UCC-015
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Button, keyboard, menu, context, CLI, and API commands normalize to a standard record preserving command_id, command_type, source_surface, target scope/identity, parameters, route/open fields, approval scope, operational identity, and created time.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-015 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: normalized_command_record_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0012
preserved_exact_tokens:
- command_id
- command_type
- source_surface
- target_scope
- target_id
- action_intent
- parameters
- route_target?
- open_subject?
- approval_scope_key
- operational_identity
- created_utc
negative_constraints:
- Command normalization preserves user intent without rewriting route_target or OpenSubject.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-016 - Tier Era Compatibility Retirement

```yaml
plan_unit_id: UCC-016
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: TierContext, tier_id, TierType, Tiers, allowed_actions[], reason_code, recovery_options[], approve_continue, and tier-era event examples are compatibility-only and current runtime approvals resolve through package/seam/lane identity and blocked-state contracts.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-016 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: tier_era_compatibility_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0013
preserved_exact_tokens:
- TierContext
- tier_id
- TierType
- Tiers
- allowed_actions[]
- reason_code
- recovery_options[]
- approve_continue
- run.started
- usage.event
- hitl.approval_requested
- package/seam/lane
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy tier-era event and approval examples are compatibility-only.
stale_retired_dispositions:
- Tier-era runtime canon is retired from live command catalog semantics.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-017 - Stale Command Family Retirement Guard

```yaml
plan_unit_id: UCC-017
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Highest-risk stale command, environment/config, question, persona/runtime, blocked recovery, web error, and web action enum tokens remain explicit retirement evidence rather than active command IDs or payload fields.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-017 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: stale_command_family_retirement_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0014
preserved_exact_tokens:
- cmd.chat.delete_message
- Bare /web
- cmd.web.search
- cmd.web.fetch
- cmd.web.extract
- cmd.web.research
- cmd.chat.web.search
- OPENCODE_DISABLE_LSP_DOWNLOAD
- OPENCODE_LSP_TIMEOUT
- QuestionInput
- QuestionAnswer
- requested_persona_id
- effective_persona_id
- unblock_action_ids
- invalid_url
- fetch_failed
- provider_unavailable
- credit_cap_exceeded
- wait | screenshot | select | hover | evaluate | press | focus
negative_constraints:
- cmd.chat.delete_message is not an active catalog command.
- cmd.web.search is not the implicit destination for bare /web.
- Open in Terminal and Show Terminal must not both normalize to cmd.terminal.show.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy grouped cmd.web.* names are compatibility-only retirement evidence.
stale_retired_dispositions:
- The stale web-action enum string is not the canonical WebAction enum.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-018 - Artifact Drill Through Gap Guard

```yaml
plan_unit_id: UCC-018
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: gap-003 artifact drill-through commands route through Usage and the shared route/open contract; old tool-summary payloads such as tool_name, invocation_summary, options, and No remaining gaps remain source-lineage only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-018 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_drill_through_gap_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- gap-003
- artifact drill-through
- '{ tool_name, invocation_summary, options }'
- tool_name
- invocation_summary
- No remaining gaps
negative_constraints:
- Old tool-summary tuples are not active command-catalog payload canon.
preserved_contractrefs: []
compatibility_only_notes:
- Tool summary payload tokens remain source-lineage only unless owner contracts bind current route/open behavior.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-019 - Gui Readiness Command Coverage Gaps

```yaml
plan_unit_id: UCC-019
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Later-model GUI readiness requires projection-trust, gating, MVP, GUI, IDs, promoted-feature, multi-project-tab, attention-center, runtime cmd.runtime.* ownership, and cross-doc command-family gaps to resolve to catalog rows or owner retirements.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-019 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_readiness_command_coverage_gaps
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- /projection-trust
- /gating
- MVP
- GUI
- IDs
- later-model
- promoted-feature
- multi-project-tab
- attention-center
- cmd.runtime.*
- FinalGUISpec.md
- Orchestrator_Page.md
- cmd.orchestrator.switch_tab
- cmd.chat.run_user_command
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Cross-doc command ownership gaps are machine-breaking gaps, not editorial cleanup.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-020 - Readiness Blocker Owner Defects

```yaml
plan_unit_id: UCC-020
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Audit survivors, wiring/template drift, uncataloged IDs, stable action IDs, stale references, packaging authority splits, and naming-rule claims remain command-readiness blockers until resolved through catalog IDs, wiring rows, and owner-documented retirement.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-020 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: readiness_blocker_owner_defects
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Audit-survivor command gaps
- /wiring/template
- uncataloged command IDs
- stable action IDs
- Plans/Commands_System.md
- missing anchors
- stale section references
- /packaging
- naming-rule
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Command readiness blockers are gate-breaking owner defects, not summary cleanup.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-021 - Uncataloged Signal And Extraction Hazard Guard

```yaml
plan_unit_id: UCC-021
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Uncataloged owner signals and extraction hazards remain registration or retirement obligations; prose, filenames, examples, indexes, deprecated-ID markers, and cmd.*.json/schema.json names do not become command IDs merely by appearing in source text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-021 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: uncataloged_signal_extraction_hazard_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- cmd.orchestrator.preview_open
- cmd.orchestrator.preview_stop
- cmd.orchestrator.open_preview_artifact
- cmd.orchestrator.push_image
- /build/open-artifact
- CustomHeadlessTool
- ToolID
- /tool/permission
- memory.gist
- live.*
- auto-trigger
- /project-switch
- /handoff
- /deprecated-ID
- owner-doc-to-catalog
- Wiring_Matrix.schema.json
- cmd.*.json
- schema.json
- workspace-tab
negative_constraints:
- Extraction hazards are not valid command IDs merely because they appear in prose, filenames, examples, or index summaries.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-022 - Lean Wiring Schema And Usage Drift Boundary

```yaml
plan_unit_id: UCC-022
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Wiring_Matrix.schema.json stays lean by pointing to catalog and route/open contracts, while usage and artifact summary drift remains a consumer/owner gap rather than a command payload shape.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-022 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lean_wiring_usage_drift_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Wiring_Matrix.schema.json
- row-local metadata
- route/open contracts
- gap-008
- result_id
- account-history
- projection-health
- missing_data_shape
- restore points
- artifact_kind
- task_id
negative_constraints:
- Wiring rows must not repeat route payload or command-normalization rules in every row.
preserved_contractrefs: []
compatibility_only_notes:
- Usage/artifact drift tokens remain stale or consumer-side lineage unless owner contracts bind current projections.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-023 - Hitl Runtime Governance Binding

```yaml
plan_unit_id: UCC-023
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Legacy HITL and runtime-governance terms resolve through permission, route/open, DAE, and blocked-runtime owners; high-consequence runtime actions bind to canonical blocked-state and HITL command contracts rather than ad hoc UI confirmations.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-023 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: hitl_runtime_governance_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- HITLRequest
- allowed_actions
- allowed_actions[]
- approve_continue
- blocked_owner
- GPT
- DAE
- branch-ownership
- /resume/restart
- external_publish_side_effect
- pre-dispatch
- non-bypassable
- yolo
- high-consequence
negative_constraints:
- Runtime governance must not leave blocked_owner, GPT, DAE, branch ownership, isolated substrate, resume/restart, external publish side effects, pre-dispatch, counter-family, non-bypassable, or yolo as unowned command behavior.
preserved_contractrefs: []
compatibility_only_notes:
- HITLRequest and allowed_actions vocabulary is compatibility-only once cmd.runtime.* and blocked_sequence own recovery.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-024 - Run Graph Template And Crosswalk Boundaries

```yaml
plan_unit_id: UCC-024
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Run Graph consumers, command template examples, execution_unit_context, Crosswalk route primitives, thread-search identities, and wrapper metadata must consume cataloged command IDs and route/open boundaries without minting conflicting payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-024 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: run_graph_template_crosswalk_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Run_Graph_View.md
- UI_Command_Catalog
- /template/example
- execution_unit_context
- Crosswalk.md
- Primitive:RouteTarget
- Primitive:OpenSubject
- object_kind = message
- object_id = <message_id>
- thread_id
- wrapper-vs-alias
negative_constraints:
- Graph-local specs must not mint conflicting HITL payloads or recovery IDs.
- Thread search object_kind/object_id/message_id must not be replaced by page-local search result identifiers.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-025 - Object Route Subject Open And Resume Url Discipline

```yaml
plan_unit_id: UCC-025
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Object routes use canonical domain IDs, compatibility widgets remain display-only, History deletion needs durable audit and disposition semantics, OpenFile preserves placement through target_editor_panel_id/target_editor_group_id with target_group as a compatibility alias, subject-open wrappers cover route/focus pivots, and resume_url is route transport.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-025 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: object_route_subject_open_resume_url_discipline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- object_kind
- object_id
- tier_id
- widget.tier_tree
- widget.progress_bars
- Delete Run
- OpenFile { path, line?, range?, target_editor_panel_id?, target_editor_group_id?, target_group? }
- subject-open
- /route
- /navigation
- /focus/show
- message_id
- workflow_run_id
- scheduler_pass_id
- safe_point_id
- remediation_root_id
- resume_url
negative_constraints:
- tier, tier_id, raw widget ids, panel ids, and serialization tokens do not belong in object_kind.
- resume_url is serialized route transport, not an independent route primitive.
preserved_contractrefs: []
compatibility_only_notes:
- Tiers-tab widgets are compatibility-only display widgets.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-026 - Operational Identity Schema Owner And Envelope Boundary

```yaml
plan_unit_id: UCC-026
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Ledger export, show-in commands, operational identity displays, runtime-artifact/worktree/account owner schemas, route ID discipline, blocked runtime identity tuples, UICommand args, and Crosswalk primitives preserve owner boundaries rather than local schema ownership.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-026 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_identity_schema_owner_envelope_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- CSV
- JSON
- JSONL
- operational_identity
- GitHub
- /registry/Kubernetes
- runtime-artifact
- /record
- /projections
- object_kind/object_id
- subject_id
- inspector_target
- run_id + node_id + attempt_id? + blocked_sequence?
- UICommand.args
- UICommand envelope
- DocumentPane
- DocumentCheckpoint
negative_constraints:
- Operational identity displays must not overload account provider fields or become one-off surface widgets.
- inspector_target does not replace tab_id.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-027 - Shell View Source Lineage And Command Backfill Guard

```yaml
plan_unit_id: UCC-027
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Orchestrator shell-view commands bind to upstream data-source owners, source-lineage packet names stay noncanonical, Run Graph and page conflicts resolve toward runtime and route primitives, command-system ghost IDs resolve through catalog aliases/retirements, and widget shell navigation stays route-aware.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-027 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: shell_view_source_lineage_backfill_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- /history/evidence
- Ledger
- exact_items
- meta.json
- pm.work_item_meta.v2
- current_state
- canon_inventory
- open_gaps
- Audit Mode
- /action-gating
- cmd.graph
- cmd.graph.*
- /wiring
- /superseded
- override_builtin
- cmd.chat.branch_from_restore
- cmd.panel.switch
- panel_id
negative_constraints:
- Source-lineage packet names and process inventory files remain noncanonical.
- Command-system backfill must not create a second command system.
- cmd.panel.switch must not become a hidden object-targeting command when a stable route command exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-028 - Wiring Acceptance Hooks Contract

```yaml
plan_unit_id: UCC-028
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Every catalog command must be verifiable through the Wiring Matrix with handler registration, event-emission tests when events are declared, UI element binding, and testable acceptance_checks; commands with no persisted domain event remain subject to handler and UI binding checks.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-028 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: wiring_acceptance_hooks_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0016
preserved_exact_tokens:
- 2.0.1 Acceptance hooks contract (wiring verification)
- Handler registration
- Event emission verification
- UI element binding
- Acceptance checks
- no persisted domain event
- expected_event_types
- acceptance_checks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010, Invariant:INV-011, Invariant:INV-012'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-029 - Github Auth Command Family Anchor

```yaml
plan_unit_id: UCC-029
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The GitHub auth command family is the GitHub HTTPS API-only catalog section for GitHub connection and disconnection command rows.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-029 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_auth_command_family_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0017
preserved_exact_tokens:
- 2.1 GitHub auth (GitHub HTTPS API only)
- GitHub HTTPS API only
- cmd.github.connect
- cmd.github.disconnect
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-030 - Github Connect Command Contract

```yaml
plan_unit_id: UCC-030
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.github.connect starts a fresh GitHub OAuth device-code flow with empty args locked by Spec Lock, emits device-code/polling/authenticated-or-failed events, affects GitHub/Auth setup surfaces, and uses recovery wrappers with keyed context for deferred reconnect.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-030 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_connect_command_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0018
preserved_exact_tokens:
- cmd.github.connect
- arg-less
- device-code
- project_id
- auth_realm
- effective-account snapshot/ref
- source /ref
- auth.github.device_code.issued
- auth.github.token.polling
- auth.github.authenticated
- auth.github.failed
negative_constraints:
- Deferred reconnect and recovery wrappers must not stay arg-less, under-keyed, or split-brain.
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, SchemaID:Spec_Lock.json#locked_decisions.auth_model'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md'
- 'ContractRef: UICommand:cmd.github.connect'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-031 - Github Disconnect Command Contract

```yaml
plan_unit_id: UCC-031
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.github.disconnect uses empty args, deletes the GitHub token from credential storage, emits auth.github.disconnected, and affects Settings > GitHub/Auth and Dashboard auth status.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-031 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_disconnect_command_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0019
preserved_exact_tokens:
- cmd.github.disconnect
- delete token
- credential store
- auth.github.disconnected
- Settings > GitHub/Auth
- Dashboard auth status
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Contracts_V0.md#AuthState'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md'
- 'ContractRef: UICommand:cmd.github.disconnect'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-032 - Project Management Deferred Wizard Commands

```yaml
plan_unit_id: UCC-032
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Project management and deferred wizard command IDs cover adding/opening projects, creating local or GitHub-backed projects, and opening deferred chain wizard payloads with the required args, events, and affected surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-032 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: project_management_deferred_wizard_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0020
preserved_exact_tokens:
- cmd.project.add_existing
- cmd.project.new_local
- cmd.project.new_github_repo
- cmd.project.open
- cmd.project.chain_wizard_open_deferred
- project.added
- project.created
- git.clone.completed
- wizard.opened
- wizard.deferred_payload.loaded
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md#d-project-management-flows-no-chain-wizard-required, ContractName:Plans/chain-wizard-flexibility.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-033 - File Manager Command Rows And Target Enum

```yaml
plan_unit_id: UCC-033
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: File Manager command rows define stable file/folder operations, clipboard intent, paste/copy/move/export behavior, PM-native open_with targets, valid target scope, and exclude system_default from the MVP canonical target enum.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-033 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: file_manager_command_rows_target_enum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0021
preserved_exact_tokens:
- cmd.file.new_file
- cmd.file.new_folder
- cmd.file.rename
- cmd.file.delete
- cmd.file.copy_path
- cmd.file.copy_nodes
- cmd.file.cut_nodes
- cmd.file.paste_nodes
- cmd.file.open_with
- cmd.file.save_local_copy
- source_editor
- image_viewer
- workspace_preview
- detached_preview
- diff_review
- system_default
negative_constraints:
- system_default is not part of cmd.file.open_with canonical MVP target enum.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md#114-open-with-and-save-local-copy, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-034 - Lsp Common Args Events And Surfaces

```yaml
plan_unit_id: UCC-034
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: LSP minimum commands share path/position args where applicable, emit tool.invoked or tool.denied events, and affect File editor, Problems panel, and Chat when LSP-in-chat is enabled.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-034 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lsp_common_args_events_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0022
preserved_exact_tokens:
- 2.2 LSP (minimum required)
- path
- position
- line
- character
- tool.invoked
- tool.denied
- File editor
- Problems panel
- Chat
- LSP-in-chat
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-035 - Lsp Command Id List

```yaml
plan_unit_id: UCC-035
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The minimum LSP command ID list includes goto definition, find references, rename symbol, format document/selection, code action, goto symbol, open problems, and restart server commands with their args.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-035 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lsp_command_id_list
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0023
preserved_exact_tokens:
- cmd.lsp.goto_definition
- cmd.lsp.find_references
- cmd.lsp.rename_symbol
- cmd.lsp.format_document
- cmd.lsp.format_selection
- cmd.lsp.code_action
- cmd.lsp.goto_symbol
- cmd.lsp.open_problems
- cmd.lsp.restart_server
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/LSPSupport.md#13'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-036 - Widget Layout Command Rows

```yaml
plan_unit_id: UCC-036
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Widget layout command rows define add, remove, resize, configure, move, and reset_layout commands with widget-hostability limited to Dashboard, Usage page, and actual Orchestrator widget-tab surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-036 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: widget_layout_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0024
preserved_exact_tokens:
- cmd.widget.add
- cmd.widget.remove
- cmd.widget.resize
- cmd.widget.configure
- cmd.widget.move
- cmd.widget.reset_layout
- Dashboard
- Usage page
- Orchestrator widget tabs
- widget-hosted
negative_constraints:
- cmd.widget.* rows do not imply that every Orchestrator tab is widget-composed.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#11, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-037 - Run Graph Runtime Recovery Wrapper Normalization

```yaml
plan_unit_id: UCC-037
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Run Graph approval and recovery commands target blocked/runtime identity, graph-facing wrappers normalize to runtime command families and route_target semantics, and cmd.graph.approve_hitl/cmd.graph.deny_hitl are not canonical command IDs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-037 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: run_graph_runtime_recovery_wrapper_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
- 2.4 Run Graph commands
- Canonical Runtime Recovery Command Consolidation (2026-03-09)
- blocked/runtime identity
- request_id
- cmd.graph.approve_hitl
- cmd.graph.deny_hitl
- cmd.runtime.*
- route_target
negative_constraints:
- cmd.graph.approve_hitl and cmd.graph.deny_hitl do not remain canonical command IDs.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Run_Graph_View.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-038 - Orchestrator Route Wrapper And Preview Build Rows

```yaml
plan_unit_id: UCC-038
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Canonical Orchestrator object, review, receipt, source-control, GitHub Actions, Docker/Kubernetes, conflict, preview, build, artifact, and image-push command rows are route-consuming wrappers or approved side-effect commands with preserved route/open semantics.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-038 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_route_wrapper_preview_build_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
- cmd.orchestrator.focus_object
- cmd.orchestrator.open_graph_generation
- cmd.orchestrator.open_source_control
- cmd.orchestrator.open_github_actions
- cmd.orchestrator.open_docker_manager
- cmd.orchestrator.open_kubernetes
- cmd.orchestrator.preview_open
- cmd.orchestrator.build_run
- cmd.orchestrator.push_image
- preview_target_resolvable
- build_profile_resolvable
- permission_allowed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- Listed Orchestrator open pivots are compatibility aliases for owner-surface route opens.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-039 - Orchestrator Metadata And Permission Carry Through

```yaml
plan_unit_id: UCC-039
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Orchestrator command metadata preserves action_type, target scope/kind, palette and shortcut eligibility, confirmation strength, reversibility, route identity, labels, and mutation confirmation/safety-class carry-through.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-039 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_metadata_permission_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
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
- navigation vs mutation
- confirmation
- route_target
- Open
- Review
- Resolve
- Export
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Orchestrator_Page.md#10. Search, routing, and action policy, Plans/Contracts_V0.md#7.3 `route_target`'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-040 - Operational External System Family Boundary

```yaml
plan_unit_id: UCC-040
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control, GitHub Actions, and Docker Manager command families manage live external system boundaries and keep stable canonical IDs even when hosting panels or toolbars evolve.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-040 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_external_system_family_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0026
preserved_exact_tokens:
- 2.5A Operational external-system command families
- cmd.source_control.*
- cmd.actions.*
- cmd.docker.*
- repository state
- remote CI workflows
- local container runtime
- purely local layout toggle
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-041 - Operational Namespace Reservations And Alias Rules

```yaml
plan_unit_id: UCC-041
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational namespaces reserve Source Control, git worktree, GitHub Actions, Docker, Docker Kubernetes, Kubernetes compatibility aliases, and core first-party prefixes against plugin/custom override while preserving explicit extension verbs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-041 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_namespace_reservation_alias_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- cmd.source_control.*
- cmd.git.worktree.*
- cmd.github.actions
- cmd.github.actions.*
- cmd.actions.*
- cmd.docker.container.*
- cmd.docker.image
- cmd.docker.compose.*
- cmd.docker.k8s
- cmd.k8s.*
- source_control
- github_actions
- docker
- k8s
- kubernetes
- registry
negative_constraints:
- Custom/plugin commands may compose with reserved first-party families only by using explicit extension verbs that do not replace canonical meaning.
preserved_contractrefs: []
compatibility_only_notes:
- Existing cmd.actions.* rows are compatibility aliases until migrated.
- Existing cmd.k8s.* rows are compatibility aliases unless updated to cmd.docker.k8s.*.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-042 - Operational Coverage Breadth And Disabled State Requirements

```yaml
plan_unit_id: UCC-042
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational command coverage must include Source Control navigation/history/graph/worktrees/git operations, GitHub Actions rerun/cancel/pin/admin/current-branch/log pivots, Docker Manager images/compose/bake/context/network/volume/Kubernetes/auth/publish/remediation families, and deterministic disabled-state/help behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-042 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_coverage_breadth_disabled_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- /history/graph/worktrees
- /conflict/graph
- /unstage/discard/diff/commit/push/pull/sync/fetch/branch/stash
- /cancel/pin/admin/current-branch
- /detail/logs
- /detail/job-expand/view-logs/download-log
- /images/compose/build-bake/contexts/networks/volumes/runtime
- /auth/Unraid
- /publish/template
- /underdefined
- /admin/help
negative_constraints:
- The command catalog must not remain publish-centric or underdefined.
- Any underdefined command family must resolve to a first-class owner command or documented compatibility alias.
preserved_contractrefs: []
compatibility_only_notes:
- Existing Git basics, Actions list/detail/logs, and Docker publish/auth/template flows are well-covered but no longer sufficient.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-043 - Operational Route Wiring Persistence And Owner Boundaries

```yaml
plan_unit_id: UCC-043
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational wiring uses first-class route commands and per-project persistence for Source Control, GitHub Actions, and Docker Manager, while GitHub API remains backend plumbing and owner boundaries stay explicit across catalog consumers.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-043 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_route_wiring_persistence_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- Open in Source Control
- SCM
- repo
- worktree
- compare target
- baseline
- run/attempt lineage
- restore-before-rerun
- baseline_target
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- Docker Manager
- GitHub API
- backend plumbing
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-044 - Source Control Review Diff Conflict Command Rows

```yaml
plan_unit_id: UCC-044
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control review, conflict, merge editor, git diff, hunk staging, discard, and conflict resolution command rows define stable command IDs, payloads, confirmations, and preconditions for review and conflict workflows.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-044 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_review_diff_conflict_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- cmd.source_control.open_review
- cmd.source_control.review.open
- cmd.source_control.review.swap
- cmd.source_control.set_compare_target
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.git.diff_open
- cmd.git.diff_toggle_mode
- cmd.git.diff_set_compare_target
- cmd.git.stage_hunks
- cmd.git.unstage_hunks
- cmd.git.discard_hunks
- cmd.git.conflict_apply_resolution
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.source_control.review.open is a compatibility alias for cmd.source_control.open_review.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-045 - Source Control Graph History Stash And Commit Assistance Rows

```yaml
plan_unit_id: UCC-045
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control graph focus/filter/layout, history open, tab selection, stash controls, AI commit batching, accepted commit groups, and generated commit-message rows preserve graph/history/stash and advisory commit-assistance behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-045 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_graph_history_stash_commit_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- cmd.source_control.graph.focus
- cmd.source_control.graph.filter
- cmd.source_control.graph.layout
- cmd.source_control.graph.focus/filter/layout
- cmd.source_control.graph_focus
- cmd.source_control.graph_filter
- cmd.source_control.history_open_commit
- cmd.source_control.select_tab
- cmd.source_control.stash
- cmd.source_control.stash.*
- cmd.source_control.suggest_commit_batches
- cmd.source_control.suggest_commit_groups
- cmd.source_control.accept_commit_group
- cmd.source_control.generate_commit_message
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Graph focus/filter/layout grouped names and suggest_commit_groups are compatibility alias families.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-046 - Source Control Compare Persistence And Disabled Boundary

```yaml
plan_unit_id: UCC-046
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Compare-open identity is repository-scoped, review state persists per project, conflict assistant records events and blocked handoffs without persisting conflicted file content, disabled states explain concrete blockers, and route/view ownership remains Source Control-owned.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-046 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_compare_persistence_disabled_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- compare_open
- project_id
- repo_id
- repo_relative_path
- worktree_id
- side_by_side
- unified
- stage_hunk
- unstage_hunk
- discard_hunk
- /open-resolution
- Review mode state
- per-project persistence
- /event/storage
- /disabled
- stale-target
- Source Control > Changes
negative_constraints:
- No consumer surface may create ad hoc compare, /diff, /compare, or /compare/stage state from path strings alone.
- Conflict assistant commands do not persist conflicted file content.
preserved_contractrefs: []
compatibility_only_notes:
- compare_open maps to cmd.source_control.open_review or cmd.git.diff_open.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-047 - Github Actions Run Job Log Browser Rows

```yaml
plan_unit_id: UCC-047
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: GitHub Actions command rows cover show/switch/rerun/cancel, workflow pin/unpin/settings, dispatch-readiness validation, compare-last-success, open current branch, open related diff, logs, workflow/job detail, retry, copy URL, copy logs, open in GitHub, branch-to-diff, and run-to-browser pivots.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-047 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_actions_run_job_log_browser_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0029
preserved_exact_tokens:
- cmd.actions.show
- cmd.actions.switch_subview
- cmd.actions.rerun
- cmd.actions.cancel
- cmd.github.actions.pin
- cmd.github.actions.unpin
- cmd.github.actions.settings.open
- cmd.github.actions.open_current_branch
- cmd.github.actions.validate_dispatch_readiness
- cmd.github.actions.compare_last_success
- cmd.github.actions.open_related_diff
- cmd.actions.view_logs
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_in_github
- cmd.github.actions.open_run_diff
- cmd.github.actions.open_run_in_browser
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-048 - Github Actions Correlation And Legacy Alias Rules

```yaml
plan_unit_id: UCC-048
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: GitHub Actions commands carry workflow/run/job/step/check/log identity for route-open pivots, preserve source-control correlation, and treat legacy cmd.github_actions.* and cmd.actions pin/unpin names as compatibility aliases rather than a second namespace.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-048 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_actions_correlation_legacy_alias_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0029
preserved_exact_tokens:
- workflow_id
- run_id
- job_id
- step_id
- check_suite_id
- log_cursor
- source_control_ref
- route_open
- cmd.github_actions.show
- cmd.github_actions.switch_subview
- cmd.github_actions.rerun_workflow
- cmd.github_actions.cancel_workflow
- cmd.github_actions.pin_workflow
- cmd.github_actions.open_run_log
- cmd.github_actions.open_run_diff
- none
- —
negative_constraints:
- cmd.github_actions.* must not become a second primary namespace.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy underscore commands normalize to current GitHub Actions route/show, switch_subview, rerun, cancel, pin, logs, and diff commands.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-049 - Docker Build Bake Container Rows

```yaml
plan_unit_id: UCC-049
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker Manager command rows define build, bake, container inspect/logs/shell/restart/stop/delete, image inspect/delete/tag/open Dockerfile, context select, and compatibility aliases for build/logs/exec/inspect.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-049 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_build_bake_container_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.build.image
- cmd.docker.build.compose
- cmd.docker.build.bake
- cmd.docker.build
- cmd.docker.container.inspect
- cmd.docker.container.view_logs
- cmd.docker.container.attach_shell
- cmd.docker.container.restart
- cmd.docker.container.stop
- cmd.docker.container.delete
- cmd.docker.image.inspect
- cmd.docker.image.delete
- cmd.docker.image.tag
- cmd.docker.open_dockerfile
- cmd.docker.context.select
- cmd.docker.logs
- cmd.docker.exec
- cmd.docker.inspect
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.docker.build/logs/exec/inspect are compatibility aliases for selected canonical Docker paths.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-050 - Docker Compose Scenario Rows And Alias Boundary

```yaml
plan_unit_id: UCC-050
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker compose command rows define compose up/down subset, scenario save/run/edit/delete, and shell/view-state wrappers while grouped scenario tokens and legacy Docker rows normalize to concrete canonical Docker Manager rows without new payload shapes.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-050 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_compose_scenario_alias_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.compose_up
- cmd.docker.compose_down
- cmd.docker.compose.up_subset
- cmd.docker.compose.down_subset
- cmd.docker.compose.scenario.save
- cmd.docker.compose.scenario.run
- cmd.docker.compose.scenario.edit
- cmd.docker.compose.scenario.delete
- cmd.docker.compose.scenario.save/run/edit/delete
- cmd.docker.show
- cmd.docker.switch_subview
negative_constraints:
- Legacy Docker rows MUST NOT introduce new payload shapes.
- cmd.docker.show and cmd.docker.switch_subview do not replace concrete Docker Manager domain-action rows.
preserved_contractrefs: []
compatibility_only_notes:
- Grouped scenario command token denotes the scenario command family; payloads use concrete IDs.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-051 - Docker Registry Publish Drift Cleanup Authority Split

```yaml
plan_unit_id: UCC-051
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker registry publish, repository creation confirmation, artifact promotion, tag push, image push, drift comparison, cleanup scan, and prune commands preserve the Orchestrator after-build versus Docker Manager registry authority split and shared permission/account/receipt/lineage checks.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-051 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_registry_publish_drift_cleanup_authority_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.create_repository
- cmd.docker.create_repository.confirm
- cmd.docker.create_repository.cancel
- cmd.docker.registry.promote
- cmd.docker.registry.tag_push
- cmd.docker.image.push
- cmd.docker.drift.compare
- cmd.docker.cleanup.scan
- cmd.docker.cleanup.prune
- cmd.orchestrator.push_image
- permission
- account
- receipt
- lineage
negative_constraints:
- Docker Manager registry publish commands must share permission, account, receipt, and lineage checks rather than claiming a separate event family.
preserved_contractrefs: []
compatibility_only_notes:
- cmd.docker.image.push is a compatibility alias for approved image push through Docker Manager registry authority.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-052 - Docker Kubernetes Rows And Namespace Alias Boundary

```yaml
plan_unit_id: UCC-052
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker Manager Kubernetes command rows define apply, diff, logs, exec, port-forward, context/namespace selection, Helm preview/install, and canonical grouped cmd.docker.k8s.* namespace behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-052 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_kubernetes_rows_namespace_alias_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0031
preserved_exact_tokens:
- cmd.docker.k8s.apply
- cmd.docker.k8s.diff
- cmd.docker.k8s.logs
- cmd.docker.k8s.exec
- cmd.docker.k8s.port_forward
- cmd.docker.k8s.select_context
- cmd.docker.k8s.select_namespace
- cmd.docker.k8s.helm_preview
- cmd.docker.k8s.helm_install
- cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
- cmd.k8s.*
- set_context
- set_namespace
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md'
compatibility_only_notes:
- Existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-053 - Docker Kubernetes Disabled State Approval Receipt Lineage

```yaml
plan_unit_id: UCC-053
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker/Kubernetes availability copy uses shared disabled-state taxonomy from runtime projection state, side effects use domain-bound approval scoping, receipts retain docker_refs and kubernetes_refs lineage, and drift/trust blockers refresh effective capability before mutation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-053 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_kubernetes_disabled_approval_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0031
preserved_exact_tokens:
- Unsupported
- Not configured
- Unauthorized
- Unreachable
- Degraded
- Partial capability
- /UX-state
- cmd.container.*
- registry/namespace/repository
- digest/tag target
- selected context
- namespace
- workload/resource
- docker_refs
- kubernetes_refs
- /trust/proxy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy cmd.container.* references are retired to active cmd.docker.* and cmd.docker.k8s.* namespaces.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-054 - Project Scope Worktree Command Set And Thread Boundary

```yaml
plan_unit_id: UCC-054
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Project-scope git worktree commands own repository-level inventory, selection, open/focus, compare, create/remove/prune/reuse/recover, lineage focus, release, lock/unlock, and switch aliases while complementing but not replacing assistant thread-scoped worktree wrappers.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-054 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: project_scope_worktree_command_set_thread_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0032
preserved_exact_tokens:
- cmd.git.worktree.list
- cmd.git.worktree.select
- cmd.git.worktree.open
- cmd.git.worktree.open_files
- cmd.git.worktree.compare
- cmd.git.worktree.create
- cmd.git.worktree.remove
- cmd.git.worktree.prune
- cmd.git.worktree.request_prune
- cmd.git.worktree.reuse
- cmd.git.worktree.recover
- cmd.git.worktree.focus_lineage
- cmd.git.worktree.release
- cmd.git.worktree.lock
- cmd.git.worktree.unlock
- cmd.git.worktree.switch
- cmd.chat.worktree.*
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes:
- cmd.git.worktree.open_files, request_prune, and switch are compatibility aliases.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-055 - Safe Worktree Lifecycle Gates And Expert Visibility Constraints

```yaml
plan_unit_id: UCC-055
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Safe worktree lifecycle commands preserve lineage, safe-point, blocked-state, cleanup, reuse, recovery, repo/worktree IDs, lane/run/package refs, blocked reasons, show-unsafe-actions visibility, and destructive confirmation constraints.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-055 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: safe_worktree_lifecycle_gates_expert_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0032
preserved_exact_tokens:
- active
- blocked_preserved
- override policy
- repo_id
- worktree_id
- safe_point_id
- lane/run/package refs
- blocked/recovery lineage
- show-unsafe-actions
- active run
- safe-point
- lineage gates
- remove
- prune
- reuse
negative_constraints:
- Manual prune/remove/reuse is forbidden while the worktree is active or blocked_preserved unless explicit override policy allows it and records the override.
- show-unsafe-actions expert mode must not make unsafe actions executable while active run, blocked, safe-point, or lineage gates fail.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-056 - Chat Thread Lifecycle And Discovery Commands

```yaml
plan_unit_id: UCC-056
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat thread lifecycle and discovery commands create, archive, delete, rename, pin, export, and search threads while preserving lineage and stable identity; cmd.chat.delete is a separately confirmed whole-thread action that immediately removes ordinary projections, requests physical content purge within 24 hours unless held, and preserves a content-free tombstone plus non-content authority receipts.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-056 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- cmd.chat.delete remains distinct from unsupported message-level delete and discloses legal-hold-delayed physical purge without promising ordinary unarchive.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_thread_lifecycle_discovery_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0034
preserved_exact_tokens:
- cmd.chat.{new,archive,delete,rename,pin,export,search}
- cmd.chat.new
- cmd.chat.archive
- cmd.chat.delete
- cmd.chat.rename
- cmd.chat.pin
- cmd.chat.export
- cmd.chat.search
- thread_id
- transcript
- lineage
- citations
- attachments
- audit metadata
- storage_deletion_record
- storage.deletion_lifecycle_changed
negative_constraints:
- Grouped chat lifecycle token does not denote message-level delete or file-restore behavior.
- Thread deletion must not clear legal, recovery, worktree, backup, or audit authority merely to satisfy the purge target.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-057 - Context Lens Placement And Mode Controls

```yaml
plan_unit_id: UCC-057
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Context Lens command IDs control dropdown placement, active modes, turn-off behavior, message selection, clear selection, Subcompact apply/revert, confirmation, and canonical source-ref rehydration in lockstep with chat, wiring, prompt, and GUI owner docs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-057 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: context_lens_placement_mode_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0035
preserved_exact_tokens:
- cmd.chat.context_lens.toggle
- cmd.chat.context_lens.set_mode
- mute
- focus
- subcompact
- cmd.chat.context_lens.turn_off
- Turn Off
- cmd.chat.context_lens.toggle_message_selection
- cmd.chat.context_lens.clear_selection
- cmd.chat.context_lens.apply_subcompact
- cmd.chat.context_lens.revert_subcompact
- Subcompact
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-058 - Assistant Thread Worktree Rows And Mvp Negative Constraints

```yaml
plan_unit_id: UCC-058
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant thread-level worktree commands create, unbind, remove, merge, create PR, and show info for active-thread worktree bindings with slash commands, visibility/enabled clauses, merge guards, and MVP exclusions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-058 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: assistant_thread_worktree_rows_mvp_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
preserved_exact_tokens:
- cmd.chat.worktree.create
- /worktree create
- cmd.chat.worktree.unbind
- /worktree unbind
- cmd.chat.worktree.remove
- /worktree remove
- cmd.chat.worktree.merge
- /worktree merge [--squash|--rebase]
- cmd.chat.worktree.pr
- /worktree pr
- cmd.chat.worktree.info
- /worktree
- Open Files
- cmd.git.worktree.open
- cmd.chat.worktree.bind_existing
negative_constraints:
- Arbitrary Bind Existing remains outside the Assistant thread-worktree MVP and must not be exposed as cmd.chat.worktree.bind_existing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-059 - Assistant Worktree Context Guard Variables

```yaml
plan_unit_id: UCC-059
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant worktree commands use projection-backed guard variables for active thread, worktree binding, active run, git repo, remote non-SSH mode, GitHub remote, dirty/conflict/detached-head status, and merge lock state.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-059 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: assistant_worktree_context_guard_variables
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
preserved_exact_tokens:
- activeThreadExists
- activeThreadHasWorktree
- activeThreadHasActiveRun
- projectIsGitRepo
- projectIsRemoteNonSSH
- projectHasGitHubRemote
- worktreeDirty
- worktreeHasConflicts
- worktreeDetachedHead
- mergeLockHeld
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-060 - Chat Context Detail Routing And Superseded Usage Ids

```yaml
plan_unit_id: UCC-060
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat context commands compact, open/focus/close thread context details, preserve hover summary as passive UI, dispatch Compact Now only after explicit choice, emit context.compaction.started, context.compaction.completed, and context.compaction.failed or an equivalent visible failure/degraded state, return started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, or failed command results, and supersede thread Usage command IDs through route/open Usage normalization.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-060 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_context_detail_routing_superseded_usage_ids
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
preserved_exact_tokens:
- cmd.chat.compact_context
- cmd.chat.open_thread_context_details
- cmd.chat.focus_thread_context_details
- cmd.chat.close_thread_context_details
- context.compaction.started
- context.compaction.completed
- context.compaction.failed
- already_running
- cancelled
- no_op
- retry_scheduled
- More Details
- Compact Now
- cmd.chat.open_thread_usage
- cmd.chat.focus_thread_usage
- cmd.chat.close_thread_usage
- route/open Usage context
negative_constraints:
- Hover-summary disclosure is passive UI and does not require its own stable command ID.
- Compact Now must not dispatch from hover alone; it requires explicit click or command choice.
- cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded and must not remain canonical IDs.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
compatibility_only_notes:
- Legacy callers that cite open/focus thread usage normalize to route/open Usage context and are not pure shell/layout toggles.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-061 - Render Browser Terminal Dev Owner Boundaries

```yaml
plan_unit_id: UCC-061
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser, terminal, and dev-session commands share a shell/runtime interaction family while browser commands own browser-session behavior, terminal commands own section/tab/pane/session behavior, and dev commands own dev-workflow behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-061 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: render_browser_terminal_dev_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0037
preserved_exact_tokens:
- 2.6A Render / browser preview commands
- Browser
- terminal
- dev-session commands
- shell/runtime interaction family
- browser-session behavior
- terminal commands
- dev-workflow behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-062 - Browser Packetization Permission And Stale Label Guard

```yaml
plan_unit_id: UCC-062
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser command catalog coverage is packetizable only through concrete cmd.browser.* IDs, payloads, emitted events, behavior owner links, normalized domain/session identity, parent web-tool permission gating, and stale aggregate-label retirement.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-062 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_packetization_permission_stale_label_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- Browser preview and browsing commands
- slice-based
- Debug investigations
- chosen URL
- /domain/session
- cmd.browser.*
- Research_session
- webfetch
- stale aggregate browser labels
- /focus/detach/share/revoke
- /screenshot/devtools/automation
negative_constraints:
- Consumers must reference concrete cmd.browser.* command IDs, payloads, and emitted events rather than stale aggregate browser labels.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Older /focus/detach/share/revoke shorthand maps only to concrete rows.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-063 - Browser Open Focus Detach Devtools Rows

```yaml
plan_unit_id: UCC-063
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser open, focus, detach, DevTools, and DevTools dock command rows preserve workspace/detached preview session creation, browser session focus, detach, and layout/UI state behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-063 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_open_focus_detach_devtools_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.open_workspace_preview
- cmd.browser.open_detached_preview
- cmd.browser.focus_browser_tab
- cmd.browser.detach_browser_tab
- cmd.browser.open_devtools
- cmd.browser.toggle_devtools_dock
- browser.session.created
- browser.session.state_changed
- browser_session_id
- workspace_tab_id
- source_workspace_tab_id
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-064 - Browser Capture Share Revoke Event Rules

```yaml
plan_unit_id: UCC-064
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser element, selection, screenshot, share, and revoke commands preserve browser.context_captured, runtime artifact creation, browser share state, and distinct attachment/provenance fields without serializing context unless an explicit capture command runs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-064 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_capture_share_revoke_event_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.pick_element_for_chat
- cmd.browser.add_selection_to_chat
- cmd.browser.add_selection_screenshot_to_chat
- cmd.browser.add_selection_full_screenshot_to_chat
- cmd.browser.add_screenshot_to_chat
- cmd.browser.add_full_screenshot_to_chat
- cmd.browser.share_with_agent
- cmd.browser.revoke_share_with_agent
- browser.context_captured
- runtime_artifact.created
- browser.context_shared
- browser.context_share_revoked
- attachment_type
- browser_element_context
- browser_selection_context
- chip_id
- capture status
negative_constraints:
- share_with_agent and revoke_share_with_agent do not create browser.context_captured events and do not serialize page, selection, or element context without a separate explicit capture command.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-065 - Browser Takeover Promote Recovery Rows

```yaml
plan_unit_id: UCC-065
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser takeover, pause, continue, stop-keep-browser, promote, reopen, retry, and keep-closed rows preserve takeover choices, automation banner behavior, promotion, recovery, and browser session state events.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-065 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_takeover_promote_recovery_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.take_over
- takeover_choice
- pause_agent
- let_agent_continue
- stop_agent_keep_browser
- cmd.browser.pause_agent
- cmd.browser.let_agent_continue
- cmd.browser.stop_agent_keep_browser
- cmd.browser.promote_to_normal_browsing
- cmd.browser.reopen
- cmd.browser.retry
- cmd.browser.keep_closed
- browser.session.takeover_state_changed
- browser.session.promoted
- browser.session.closed
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-066 - Terminal Promotion Handoff And Pty Boundary

```yaml
plan_unit_id: UCC-066
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal promotion and handoff bind interactive or long-running work to stable terminal sessions while chat retains bounded preview and audit ownership; shell-like automation defaults to PTY terminal execution when user-inspectable or intervention-prone.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-066 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_promotion_handoff_pty_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- Terminal session and layout commands
- Terminal promotion and handoff
- stable terminal session
- chat retains only bounded preview and audit ownership
- Terminal-handoff routing
- chat/tool cards
- chat-callable one-shot tools
- bash
- grep
- codesearch
- chatsearch
- logsearch
- logread
- PTY-backed terminal execution
- live-terminal
negative_constraints:
- Terminal handoff must not re-own the terminal session under an individual tool.
- Agent-originated Output and inline summaries must not impersonate a pseudo-console.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-067 - Terminal Command Rows And Labels

```yaml
plan_unit_id: UCC-067
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal command rows preserve open, show, rerun, detach, focus, split/move/close pane, restart/replace, stable terminal session/pane/tab identities, labels, payloads, events, and UI surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-067 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_command_rows_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- cmd.terminal.open
- Open in Terminal
- cmd.terminal.show
- Show Terminal
- cmd.terminal.rerun
- Rerun in Terminal
- cmd.terminal.detach
- Detach/Pop-Out
- cmd.terminal.focus
- cmd.terminal.split_pane
- cmd.terminal.move_pane
- cmd.terminal.close_pane
- cmd.terminal.restart_replace
- terminal_session_id
- terminal_pane_id
- terminal_tab_id
- Domain event(s)
- UI surface(s)
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-068 - Terminal Focus Reuse Layout Identity

```yaml
plan_unit_id: UCC-068
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal focus, reuse, moving, detaching, reattaching, follow-up actions, exited-session reveal, and same-session continuity preserve exact terminal_session_id or pane/session precedence and must not silently fall back to a fresh shell.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-068 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_focus_reuse_layout_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- terminal_session_id
- /pane/session
- /thread/tool
- dev-session binding
- workspace-bound most-recent terminal context
- Show Terminal
- /moving/detaching/reattaching
- /tab/pane/session
- same bound session
- /exited
- /restart/replace
negative_constraints:
- Commands that imply same-session continuity must not fall back to a fresh shell silently.
- Moving/detaching/reattaching terminal UI must preserve tab/pane/session identity unless explicitly asking for a new terminal.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-069 - Terminal Cards Output Audit Persistence Rules

```yaml
plan_unit_id: UCC-069
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal command cards preserve output/copy affordances, large output refs/blobs, one-shot inline defaults, historical permission/runtime snapshots, concise transparency, persistent inline cards, promotion behavior, and distinct terminal actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-069 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_cards_output_audit_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- 'Ran: <command>'
- 'Running: <command>'
- '<operation>: <query/url> — N sources'
- /output
- refs/blobs
- /Problems/Ports
- /Ports/Output
- /port/output
- /linkback
- /filter/drill-down
- /changes
- /summaries
- /transparency
- /logging/subagents
- /copy/paste
- TUI capture guidance
- /collapse
- /background
negative_constraints:
- Current Settings state must not replace historical policy/mode/project evidence.
- Open in Terminal and Show Terminal must focus the same live session.
- Distinct terminal actions must keep owned command-table rows and must not collapse into one normalized target.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-070 - Dev Session Lifecycle Reveal Commands

```yaml
plan_unit_id: UCC-070
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Dev-session commands start, stop, restart, and reveal output, problems, and ports for a dev_session_id across Toolbar, Chat, Ports, Terminal, Problems, and Output surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-070 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: dev_session_lifecycle_reveal_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0040
preserved_exact_tokens:
- cmd.dev.start_session
- cmd.dev.stop_session
- cmd.dev.restart_session
- cmd.dev.show_output
- cmd.dev.show_problems
- cmd.dev.show_ports
- dev.session.started
- dev.session.stopping
- dev.session.stopped
- dev.session.restarting
- dev_session_id
- Toolbar
- Chat
- Ports
- Terminal
- Output
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-071 - Catalog Lifecycle Rows And Missing Command Rule

```yaml
plan_unit_id: UCC-071
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Catalog lifecycle commands install, update, and remove catalog items with item type, id, and version payloads, while missing referenced commands must become concrete catalog rows or explicit compatibility/retirement notes.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-071 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: catalog_lifecycle_rows_missing_command_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0041
preserved_exact_tokens:
- Catalog lifecycle commands
- cmd.catalog.install_item
- cmd.catalog.update_item
- cmd.catalog.remove_item
- item_type
- item_id
- version?
- catalog.install.started
- catalog.install.completed
- catalog.update.started
- catalog.update.completed
- catalog.remove.started
- catalog.remove.completed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- Missing referenced commands must become concrete catalog rows or explicit compatibility/retirement notes.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-072 - Terminal Dev Recovery And Wiring Completeness Gate

```yaml
plan_unit_id: UCC-072
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal clear, close, and dev reveal commands preserve runtime identity and dev_session_id ownership; debug recovery/rerun degrades to attention_required when no canonical rerun exists or local/device/manual/flaky conditions prevent classification, and catalog updates require Wiring Matrix rows.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-072 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_dev_recovery_wiring_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0041
preserved_exact_tokens:
- cmd.terminal.clear_scrollback
- termination_policy
- cmd.dev.show_output
- cmd.dev.show_problems
- cmd.dev.show_ports
- dev_session_id
- attention_required
- /device/manual
- Plans/Wiring_Matrix.md
- handlers
- UI surfaces
- acceptance checks
negative_constraints:
- Command catalog updates alone are not complete until corresponding Wiring Matrix rows bind stable command IDs to handlers, UI surfaces, and acceptance checks.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-073 - Chat Message Rows And File Reference Signature

```yaml
plan_unit_id: UCC-073
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat message action rows preserve copy, retry, rewind, revert, add_file_reference behavior and the canonical cmd.chat.add_file_reference signature lock for visible file reference chips.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-073 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_message_rows_file_reference_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.copy_message
- cmd.chat.retry_message
- cmd.chat.rewind
- cmd.chat.revert
- cmd.chat.add_file_reference
- thread_id
- message_id
- target_message_id
- project_id
- path
- line_range?
- visible file reference chip
- Canonical signature lock
negative_constraints:
- File references are file-only in MVP; folder references are out of scope.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-074 - Message Availability And Code Block Rows

```yaml
plan_unit_id: UCC-074
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Message-level availability and code-block rows preserve edit/resend/copy, code-block copy/insert/apply, details toggling, selected message/code-block/editor preconditions, and distinct resend versus retry behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-074 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: message_availability_code_block_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.edit_last_user_message
- cmd.chat.resend_last_user_message
- cmd.chat.copy_code_block
- cmd.chat.insert_code_block
- cmd.chat.apply_code_block
- cmd.chat.toggle_message_details
- chat_active
- has_user_messages
- message_selected
- code_block_selected
- editor_active
negative_constraints:
- cmd.chat.resend_last_user_message is distinct from cmd.chat.retry_message.
- Code-block commands operate on a resolved code-block sub-selection rather than the entire message body.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-075 - Rewind Revert FileSafe Semantics

```yaml
plan_unit_id: UCC-075
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.chat.rewind remains conversation-only, while cmd.chat.revert resolves one immutable eligible assistant-turn whole-mutation manifest and exact-replaces its complete recorded scope through the canonical FileSafe manifest, verified rollback, journal, equality, restart, remote-custody, and recovery-hold rules using recorded absolute identities; it never partially restores a multi-file turn or changes conversation state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- F2-204
unblocks: []
acceptance_criteria:
- UCC-075 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- cmd.chat.revert returns the exact FileSafe restore outcomes, never restored_with_conflicts or partial success, and no_eligible_mutating_turn creates no FileSafe transaction.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: rewind_revert_filesafe_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.rewind
- conversation-only
- cmd.chat.revert
- persisted file mutations
- canonical FileSafe file-restore pipeline
- absolute file paths
- assistant turn file mutation log
- working_directory
- affected editors
- canonical mutation pipeline
- whole-turn mutation manifest
- no_eligible_mutating_turn
- restore_recovery_required
negative_constraints:
- cmd.chat.rewind MUST NOT be used as a file-restore alias.
- cmd.chat.revert must not reinterpret relative paths through the current working_directory.
- cmd.chat.revert must not rewind conversation state, merge target content, or report partial multi-file success.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-076 - Edit Delete Shorthand Questions Activity Dimensions

```yaml
plan_unit_id: UCC-076
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Stop/edit/delete availability is represented through existing stop, edit/resend, rewind/revert, and retention surfaces; GUI question surfaces support multiple-choice, multi-choice, and freeform Other paths, while logging/activity metadata remains sliceable by agent/tool/model/persona/subagent/token.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-076 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: edit_delete_shorthand_questions_activity_dimensions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- /edit/delete
- delete-message command ID
- multiple-choice
- multi-choice
- Other
- /agent/tool/model/persona/subagent/token
negative_constraints:
- /edit/delete is an availability shorthand and not a new delete-message command ID.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-077 - Debug Mode Internal Uicommand Bridge

```yaml
plan_unit_id: UCC-077
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Debug Mode uses the internal cmd.debug.* UICommand family owned by Commands_System.md, preserves concrete debug IDs, and leaves investigation lifecycle semantics, preconditions, and evidence behavior in Commands_System.md.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-077 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: debug_mode_internal_uicommand_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0043
preserved_exact_tokens:
- cmd.debug.*
- User Commands
- cmd.debug.start
- cmd.debug.stop
- cmd.debug.pause
- cmd.debug.resume
- cmd.debug.add_breakpoint
- cmd.debug.remove_breakpoint
- cmd.debug.clear_breakpoints
- cmd.debug.view_evidence
- cmd.debug.step
- cmd.debug.collect_snapshot
- Commands_System.md
negative_constraints:
- Debug Mode UICommand IDs are internal wiring IDs, not User Commands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Commands_System.md#7.1-debug-mode-dispatch-family'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-078 - Reserved Slash Web Skill Dispatcher Invariants

```yaml
plan_unit_id: UCC-078
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved slash commands keep /web as one stable subcommand-required family, expose /web fetch with the other five web operations, route slash, palette, natural-language, and agent-initiated web intents through the same dispatcher, map reading to webfetch, and lock /skill GUI, slash, and natural-language invocation paths to the same invoke_skill contract.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-078 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- Slash, palette, natural-language, and autonomous agent routing fixtures cover `/web fetch`, URL-read intent parity, research/deep-research intent parity, and BrowserAction/Site Reader visual evidence intent parity through the same command/tool IDs.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_slash_web_skill_dispatcher_invariants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /web
- /web search <query>
- /web fetch <url>
- /web extract <url>
- /web research <task-or-question>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.help
- /skill
- /skill <skill_name> [args]
- invoke_skill
- Skills panel
- Natural language
- webfetch
- websearch
- webextract
- webresearch
negative_constraints:
- Do not flatten /web into separate slash families.
- Reading intents MUST resolve to webfetch, not websearch.
- /skill use, /skill list, and /skill show are not MVP subcommands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Commands_System.md#7. Reserved built-in slash commands, ContractName:Plans/assistant-chat-design.md#5.2 `/web` and `/skill`, ContractName:Plans/Tools.md#12. Web tool routing algorithm'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-079 - Web Activity Provenance And Locked Labels

```yaml
plan_unit_id: UCC-079
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web operation cards/history preserve requested/effective runtime snapshot fields, child payload refs/blobs, sources/source counts, read/extract-backed provenance preference, and six locked operation labels including Reading Site for PM-native Site Reader.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-079 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_activity_provenance_locked_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /activity
- requested/effective runtime snapshot
- sources_ref
- content_ref
- map_ref
- /blob
- /sources
- 'Web search: {query}'
- 'Searching Web: <query>'
- 'Extracting Site: <url>'
- 'Researching Web: <task>'
- 'Crawling Site: <url>'
- 'Mapping Site: <root_url>'
- 'Reading Site: <url>'
- /extract-backed
- read-backed provenance
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-080 - Reserved Override Alias Retirement Policy

```yaml
plan_unit_id: UCC-080
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved built-in slash commands are non-overridable, user commands use custom namespaces, legacy reconciliation and tool-name aliases stay compatibility/process lineage, deprecated aliases are shown distinctly, reserved commands are non-editable, and /clear/thread-clear must not return as a live command.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-080 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_override_alias_retirement_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /x-...
- reserved built-ins
- /webfetch
- /webresearch
- compatibility/tool-key lineage
- /reconciliation
- /cancel
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /clear
- thread-clear
- /de-duplication
- /research-focused
- /risky
- deprecated aliases
- non-editable
negative_constraints:
- Legacy /reconciliation references are process-only and must not become user-facing command IDs.
- /clear stays removed and must not return as a thread-clear command.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy top-level tool-name spellings are compatibility/tool-key lineage, not active slash-command prototypes.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-081 - Web Provider Help Options And Category Filters

```yaml
plan_unit_id: UCC-081
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web command help and settings expose provider support tier, health, fallback, credit/pay-as-you-go warnings, advanced search/raw/summarization/chunk controls, concise query guidance, two-step search/read flow, and optional provider categories.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-081 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_provider_help_options_categories
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- support-tier
- provider health
- fallback disclosure
- /credit
- pay-as-you-go
- search_depth
- max_results
- include_domains
- exclude_domains
- time_range
- start_date
- end_date
- include_images
- include_raw_content
- /summarization
- chunks_per_source
- ultra-fast
- fast
- basic
- advanced
- 'categories?: string[]'
- github
- research
- pdf
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-082 - Web Do Not Overfit Approval And Help Boundaries

```yaml
plan_unit_id: UCC-082
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web help avoids plugin/MCP/container/xeditor baseline nouns, uses operation-specific approval scope wording and URL normalization, and may show result-shape hints while leaving crawl limits, dedup/filtering, and extraction payload validation to tool contracts.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-082 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_do_not_overfit_approval_help_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /catalog/import
- preview-safe visual-module contracts
- /MCP/container-specific
- xeditor-specific
- search
- research
- '* wildcard'
- host-scoped
- https://host.example/*
- //host.example/
- query_preview
- content_format
- task_preview
- crawl results + traversed refs
- links
- Array<{ url, text?, rel? }>
- images
- Array<{ url, alt?, dimensions? }>
negative_constraints:
- Command help must not inherit plugin-specific, MCP/container-specific, xeditor-specific, or external baseline implementation nouns as user-visible command language.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-083 - Slash Labels Dispatcher Parity And Route Mapping

```yaml
plan_unit_id: UCC-083
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved slash labels, web command IDs, natural-language intent examples, dispatcher parity, URL normalization, parse failure, /cancel stop mapping, /rewind conversation-only behavior, /revert file-restore behavior, and catalog discoverability remain aligned with routing docs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-083 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: slash_labels_dispatcher_parity_route_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- search the web for X
- extract this page
- read this URL
- research topic
- cmd.chat.stop
negative_constraints:
- Site/page reading is not search.
- /rewind remains conversation-only.
- /revert remains file-mutation restore, not conversation rewind.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-084 - Gist Review Verification Edit Pin Commands

```yaml
plan_unit_id: UCC-084
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant memory Gist Review commands verify, edit, pin/unpin, discard, toggle auto-save unverified, and preview capsules with required project/gist/thread payloads, events, and Assistant chat Gist Review panel surface.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-084 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gist_review_verification_edit_pin_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0045
preserved_exact_tokens:
- cmd.chat.memory.verify
- cmd.chat.memory.edit
- cmd.chat.memory.pin
- cmd.chat.memory.discard
- cmd.chat.memory.toggle_auto_save_unverified
- cmd.chat.memory.preview_capsule
- memory.gist.verification_requested
- memory.gist.verified
- memory.gist.verification_failed
- memory.gist.updated
- memory.gist.pinned
- memory.gist.unpinned
- memory.gist.discarded
- settings.updated
- Assistant chat Gist Review panel
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-085 - Memory Maintenance Command Rows

```yaml
plan_unit_id: UCC-085
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant memory maintenance commands rebuild lexical and semantic indexes, run verification and dedup sweeps, summarize monthly memory, and prune archives with project/month/policy payloads and lifecycle events.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-085 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: memory_maintenance_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0045
preserved_exact_tokens:
- cmd.chat.memory.rebuild_lexical_index
- cmd.chat.memory.rebuild_semantic_index
- cmd.chat.memory.verification_sweep
- cmd.chat.memory.dedup_sweep
- cmd.chat.memory.summarize_monthly
- cmd.chat.memory.prune_archive
- memory.index.lexical.rebuild.started
- memory.index.lexical.rebuild.completed
- memory.index.semantic.rebuild.started
- memory.index.semantic.rebuild.completed
- memory.verification_sweep.started
- memory.verification_sweep.completed
- memory.dedup_sweep.started
- memory.dedup_sweep.completed
- memory.monthly_summary.started
- memory.prune_archive.completed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-086 - Artifact Side Panel Navigation Commands

```yaml
plan_unit_id: UCC-086
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Artifact side-panel navigation commands show artifacts in Usage or Ledger with project, route_target, open_subject, artifact/usage/ledger/run/thread refs, and shared route/open identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-086 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_side_panel_navigation_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0046
preserved_exact_tokens:
- 2.8A Side-panel and artifacts navigation commands
- cmd.artifacts.show_in_usage
- cmd.artifacts.show_in_ledger
- project_id
- route_target
- open_subject
- artifact_id?
- usage_event_ref?
- ledger_ref?
- run_id?
- thread_id?
- artifact drill-through
- shared route/open identity
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-087 - Search Panel Command Rows

```yaml
plan_unit_id: UCC-087
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Search panel commands reveal/focus Search, find/replace in files, open results through route_target, replace selected/all, rebuild indexes, and evict remote cache with project/query/session/subject/disposition payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-087 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: search_panel_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0048
preserved_exact_tokens:
- cmd.search.show
- cmd.search.find_in_files
- cmd.search.replace_in_files
- cmd.search.open_result
- cmd.search.replace_selected
- cmd.search.replace_all
- cmd.search.rebuild_index
- cmd.search.evict_remote_cache
- query_session_id
- subject_id
- disposition?
- route_target
- remote_cache_id?
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-088 - Search Routing Query Session Owner Policy

```yaml
plan_unit_id: UCC-088
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Search commands remain side-panel scoped, preserve run-aware search scope, query-session state, open disposition, replacement payload core, Search-owner snapshot validation, and Orchestrator search routing/action policy ownership.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-088 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: search_routing_query_session_owner_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0048
preserved_exact_tokens:
- Search command routing
- route_target
- side-panel scoped
- run-aware search scope
- query-session state
- open-disposition / reuse policy
- cmd.search.replace_all { query_session_id, replacement }
- project_id
- Plans/Orchestrator_Page.md#search-routing-and-action-policy
negative_constraints:
- Search replacement applies only after the Search owner validates the current result snapshot and mutation path.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-089 - Runtime Recovery Namespace And Allowed Action Mapping

```yaml
plan_unit_id: UCC-089
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Runtime recovery uses the shared cmd.runtime.* namespace, treats legacy recovery namespaces as deprecated aliases, and maps allowed_action_id values to canonical runtime command IDs with minimum args including run, node, attempt, and blocked_sequence identity.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-089 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_recovery_namespace_allowed_action_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0049
preserved_exact_tokens:
- References
- cmd.runtime.*
- Legacy recovery command namespaces
- deprecated aliases
- allowed_action_id
- approve
- decline
- retry_now
- resume_after_prerequisite
- restore_safe_point_then_retry
- start_fresh_attempt
- replan
- skip_node
- abort_run
- open_details
- cmd.runtime.approve
- cmd.runtime.decline
- cmd.runtime.retry_now
- cmd.runtime.open_attempt_details
- blocked_sequence
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy recovery command namespaces are deprecated aliases only.
stale_retired_dispositions:
- 'Canonical recovery commands use one shared namespace: cmd.runtime.*.'
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-090 - Runtime Recovery Worktree Baseline Validation

```yaml
plan_unit_id: UCC-090
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  SCM-targeted retry and fresh-attempt recovery commands use the closed
  safe_point/historical_commit/worktree_head baseline_target enum with per-value exact fields and
  effects: safe_point exact-replaces the named worktree, historical_commit creates an isolated
  clean worktree at a full immutable commit OID while preserving the source, and worktree_head
  binds the exact live OID/state digest without mutation; runtime rejects missing, stale, moving,
  mismatched, or substitute identity.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-090 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- Each baseline target requires its exact immutable fields and produces only its owner-defined effect/postcondition before durable successor admission.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_recovery_worktree_baseline_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0049
preserved_exact_tokens:
- SCM-targeted retry
- /fresh-attempt
- worktree reuse policy
- restore
- baseline_target
- safe_point | historical_commit | worktree_head
- repo_id
- worktree_id
- worktree
- baseline
negative_constraints:
- Runtime dispatch must reject recovery commands rather than silently substitute another worktree or baseline.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-091 - Runtime Navigation Route Identity Commands

```yaml
plan_unit_id: UCC-091
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The runtime navigation commands `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` are registered route identity examples owned by the catalog and shared route contract, with payloads `{ run_id, scheduler_pass_id }`, `{ run_id, remediation_root_id }`, and `{ run_id, safe_point_id? }`; they must not be treated as local graph shortcuts with implied unregistered route identities.
gui_related: false
gui_classification_reason: Span preserves route identity registration and command payload ownership, not GUI layout or visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-091 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_navigation_route_identity_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0050
preserved_exact_tokens:
- Navigation commands
- cmd.runtime.open_queue_analysis
- cmd.runtime.open_remediation_lineage
- cmd.runtime.open_safe_point_history
- '{ run_id, scheduler_pass_id }'
- '{ run_id, remediation_root_id }'
- '{ run_id, safe_point_id? }'
- local graph shortcuts
- route identities are implied but unregistered
negative_constraints:
- Runtime navigation commands must not be treated as local graph shortcuts whose route identities are implied but unregistered.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-092 - Pre Attempt Blocked Sequence Identity

```yaml
plan_unit_id: UCC-092
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and recovery handling MUST NOT fabricate an `attempt_id`.
gui_related: false
gui_classification_reason: Span preserves runtime blocked-episode identity and scheduler contract behavior, not GUI layout or visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-092 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: pre_attempt_blocked_sequence_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0051
preserved_exact_tokens:
- Pre-attempt blocked rule
- blocked_sequence
- MUST NOT fabricate an `attempt_id`
- attempt_id
negative_constraints:
- When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-093 - Recovery Verb Copy Semantics

```yaml
plan_unit_id: UCC-093
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: '`Retry`, `Resume`, `Recover`, and `Restore` have canonical recovery command copy: Retry repeats the resolved target and parameters under current validation rules, Resume continues an existing blocked/paused/waiting episode after the prerequisite or condition, Recover invokes a canonical remediation flow advertised by `allowed_action_ids[]` without implying a full rerun, and Restore applies an explicit restore point or preserved state while disclosing target state before mutation.'
gui_related: true
gui_classification_reason: The unit owns user-visible recovery command labels and button/menu copy semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-089
unblocks: []
acceptance_criteria:
- UCC-093 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: recovery_verb_copy_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- Recovery command definitions
- Recovery verb semantics are canonical command copy
- Retry
- Resume
- Recover
- Restore
- allowed_action_ids[]
- full rerun
- target state before mutation
- Approve
- Decline
- Resume after prerequisite
- Blocked
- Review
- Resolve
negative_constraints:
- Surfaces may add context qualifiers, but they must not use these verbs interchangeably across worktrees, GitHub Actions, Docker publish, Kubernetes, `/Unraid`, or Orchestrator recovery flows.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-094 - Allowed Action Runtime Recovery Mapping

```yaml
plan_unit_id: UCC-094
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to the canonical `cmd.runtime.*` recovery commands, and no surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.
gui_related: true
gui_classification_reason: The unit constrains user-facing recovery buttons and menu entries across GUI/chat/graph/orchestrator surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-089
- UCC-093
unblocks: []
acceptance_criteria:
- UCC-094 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: allowed_action_runtime_recovery_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- blocked-state recovery buttons and menu entries
- GUI, chat, graph, and orchestrator surfaces
- allowed_action_ids[]
- canonical runtime commands
- cmd.runtime.*
- thread-local
- graph-local
- provider-local recovery command family
negative_constraints:
- No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-095 - Recovery Metadata Resolver And Permission Carry Through

```yaml
plan_unit_id: UCC-095
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Recovery commands carry required metadata fields `command_kind`, `normalization.kind`, `normalizes_to_contract`, `alias_of_command_id`, `approval_scope_key`, `allowed_action_ids[]`, `route_target`, `open_subject?`, and `ref_family?`; command behavior preserves blocked-episode identity, wrapper/deprecated-alias normalization metadata, selector precedence, scoped resolver route payload rules, compatibility-only timestamp/run/thread fallback, and ordered `allowed_action_ids[]` permission carry-through.
gui_related: false
gui_classification_reason: The unit preserves command metadata, resolver behavior, compatibility fallback, and permission carry-through rather than GUI visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-091
- UCC-092
- UCC-094
unblocks: []
acceptance_criteria:
- UCC-095 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: recovery_metadata_resolver_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- Required command metadata
- command_kind
- normalization.kind
- normalizes_to_contract
- alias_of_command_id
- approval_scope_key
- allowed_action_ids[]
- route_target
- open_subject?
- ref_family?
- Canonical terms and values
- selector precedence
- scoped resolver
- timestamp/run/thread fallback
- Permission carry-through
- ordered `allowed_action_ids[]`
negative_constraints:
- Recovery commands must bind to blocked-episode identity rather than request-level surrogates.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes:
- timestamp/run/thread fallback is compatibility-only when stronger route identity is unavailable.
stale_retired_dispositions:
- normalization metadata must survive for wrappers and deprecated aliases.
owner_hints:
- Plans/UI_Command_Catalog.md
split_recommendation_reason: UI_Command_Catalog-S0052 safely splits visible recovery copy and button/menu mapping from backend metadata, resolver, and permission carry-through behavior.
```

### UCC-096 - Assistant Chat Goal Slash Commands

```yaml
plan_unit_id: UCC-096
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UI_Command_Catalog registers the Assistant Chat Goal Mode command family. `/goal`, Goal button/chip/icon activation, and natural-language Goal Mode activation dispatch `cmd.chat.goal.start`; `/goal again`, natural-language update requests, and the small update icon beside Goal status dispatch `cmd.chat.goal.update`. These command IDs route to Goal Runtime without defining concrete Goal event payload schemas.
gui_related: true
gui_classification_reason: This unit defines user-visible Assistant Chat slash commands, Goal chip/icon activation, and status-update command surfaces.
depends_on:
  - ACD-416
  - GRS-002
unblocks: []
acceptance_criteria:
  - "`/goal` is registered as a reserved Assistant Chat Goal activation slash command."
  - "`/goal again` is registered as the active-goal update slash command."
  - "Button/chip/icon and natural-language activation normalize to `cmd.chat.goal.start`."
  - "Natural-language updates and the Goal status update icon normalize to `cmd.chat.goal.update`."
  - Command registration does not invent concrete Goal event payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future command catalog/wiring review
risk_class: goal_command_owner_gap
reasoning_tier: standard
context_scope: assistant_chat_goal_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_chat_goal_command_registration
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
  - "button/chip/icon"
  - "natural-language activation"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "clicking a little icon next to the goal status"
negative_constraints:
  - Do not let `/goal` or `/goal again` remain unregistered local Assistant Chat prose.
  - Do not invent concrete Goal event payload schemas in the command catalog.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
```

### UCC-001 - UI Command Catalog Generated Artifact Residual

```yaml
plan_unit_id: UCC-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UCC-001 is retired after Phase 2B batch 191 as active source-preserving product coverage. UI_Command_Catalog-S0001 through S0052 are covered by fine-grained UCC-002 through UCC-095 or explicit structural/reference dispositions, and later command repairs such as UCC-096 carry post-migration command canon; UI_Command_Catalog-S0053 through S0056 are generated owner/consumer map, PlanUnits heading, retired bridge, and Migration Coverage tail material. UCC-001 remains migration lineage only and must not override implementation-facing UI Command Catalog PlanUnits.
gui_related: true
gui_classification_reason: The retired bridge preserves GUI-bearing UI Command Catalog source history, but no longer provides product implementation coverage.
split_recommended: false
depends_on:
- UCC-002
- UCC-003
- UCC-004
- UCC-005
- UCC-006
- UCC-007
- UCC-008
- UCC-009
- UCC-010
- UCC-011
- UCC-012
- UCC-013
- UCC-014
- UCC-015
- UCC-016
- UCC-017
- UCC-018
- UCC-019
- UCC-020
- UCC-021
- UCC-022
- UCC-023
- UCC-024
- UCC-025
- UCC-026
- UCC-027
- UCC-028
- UCC-029
- UCC-030
- UCC-031
- UCC-032
- UCC-033
- UCC-034
- UCC-035
- UCC-036
- UCC-037
- UCC-038
- UCC-039
- UCC-040
- UCC-041
- UCC-042
- UCC-043
- UCC-044
- UCC-045
- UCC-046
- UCC-047
- UCC-048
- UCC-049
- UCC-050
- UCC-051
- UCC-052
- UCC-053
- UCC-054
- UCC-055
- UCC-056
- UCC-057
- UCC-058
- UCC-059
- UCC-060
- UCC-061
- UCC-062
- UCC-063
- UCC-064
- UCC-065
- UCC-066
- UCC-067
- UCC-068
- UCC-069
- UCC-070
- UCC-071
- UCC-072
- UCC-073
- UCC-074
- UCC-075
- UCC-076
- UCC-077
- UCC-078
- UCC-079
- UCC-080
- UCC-081
- UCC-082
- UCC-083
- UCC-084
- UCC-085
- UCC-086
- UCC-087
- UCC-088
- UCC-089
- UCC-090
- UCC-091
- UCC-092
- UCC-093
- UCC-094
- UCC-095
unblocks: []
acceptance_criteria:
- Plans/UI_Command_Catalog.md has no active node_compile_hint.mode=source_preserving_planunit coverage after Phase 2B batch 191.
- UI_Command_Catalog-S0053, S0054, and S0056 are structural generated-tail dispositions, while UI_Command_Catalog-S0055 is retired bridge lineage through UCC-001.
- UCC-001 remains migration lineage only and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: ui_command_catalog_generated_tail_after_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0056
preserved_exact_tokens:
- source_preserving_planunit
- generated_artifact_residual
- Migration Coverage
- PlanUnits
- UI_Command_Catalog-S0053
- UI_Command_Catalog-S0056
- UCC-001 - UI Command Catalog (Canonical) Source-Preserving PlanUnit
- Owner / Consumer Map
negative_constraints:
- UCC-001 must not provide product implementation coverage for UI_Command_Catalog-S0001 through S0052 after Phase 2B batch 191.
- UCC-001 must not override UCC-002 through UCC-095 or later fine-grained UI Command Catalog PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for UI_Command_Catalog.md.
preserved_contractrefs:
- Residual generated-tail ContractRefs, anchors, aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and exact tokens remain preserved by span_map and coverage_map.
compatibility_only_notes:
- The exact token source_preserving_planunit is retained only as historical migration vocabulary; UCC-001 is no longer active product coverage.
stale_retired_dispositions:
- UCC-001 - UI Command Catalog (Canonical) Source-Preserving PlanUnit is retired as a bridge and remains migration lineage only.
owner_hints:
- Plans/UI_Command_Catalog.md
```

## Migration Coverage

Original hash: `de7fa9f47cbbaac910b668db4778c3faea7d2a32334ade64545dec448b22ac79`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 188 atomized `UI_Command_Catalog-S0001` through `UI_Command_Catalog-S0024` into fine-grained PlanUnits `UCC-002` through `UCC-036`. Phase 2B batch 189 atomized `UI_Command_Catalog-S0025` through `UI_Command_Catalog-S0032`, `UI_Command_Catalog-S0034` through `UI_Command_Catalog-S0036` into fine-grained PlanUnits `UCC-037` through `UCC-060` and structurally dispositioned `UI_Command_Catalog-S0033`. Phase 2B batch 190 atomized `UI_Command_Catalog-S0037` through `UI_Command_Catalog-S0046`, `UI_Command_Catalog-S0048`, and runtime recovery material in `UI_Command_Catalog-S0049` into fine-grained PlanUnits `UCC-061` through `UCC-090`, while structurally dispositioning `UI_Command_Catalog-S0047` and the references portion of `UI_Command_Catalog-S0049`. Phase 2B batch 191 atomized `UI_Command_Catalog-S0050` through `UI_Command_Catalog-S0052` into fine-grained PlanUnits `UCC-091` through `UCC-095`, structurally dispositioned generated tail spans `UI_Command_Catalog-S0053`, `UI_Command_Catalog-S0054`, and `UI_Command_Catalog-S0056`, and retired `UI_Command_Catalog-S0055` / `UCC-001` as generated artifact residual lineage. `Plans/UI_Command_Catalog.md` now has no active `source_preserving_planunit`; `UCC-001` remains migration lineage only and must not override the fine-grained units. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### UCC-097 - Planning Wizard And Plan Compile Command Family

```yaml
plan_unit_id: UCC-097
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired. The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state. The Planning Wizard final approval button and command label is exactly Approve And Build. Approve And Build carries the final-review compare-and-swap currentness inputs and fails closed when the PlanningRun revision, topic map version, ApprovedPlanPack hash, project-context snapshot hash, PlanUnit or acceptance-unit index hash, testing policy hash, or final audit/closure hash has drifted. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting
  build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.'
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
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
- Plans/Commands_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0012
- pldg-20260618-001-prd-planning-wizard:atom-0028
- pldg-20260618-001-prd-planning-wizard:atom-0101
- pldg-20260618-001-prd-planning-wizard:atom-0107
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0155
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0012
- atom-0028
- atom-0101
- atom-0107
- atom-0154
- atom-0155
decision_refs:
- dec-0004
- dec-0008
- dec-0020
correction_refs:
- corr-0011
- corr-0012
preserved_exact_tokens:
- ledger_sync_blocked
- Approve PRD for Planning Wizard
- Approve And Build
- Orchestrator
- Plan Compile tab
- pause
- cancel
- resume
- inspect evidence
- Open Build
negative_constraints: []
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
- Plans/Commands_System.md
```

### UCC-098 - PRD And Planning Runtime Command Contracts

```yaml
plan_unit_id: UCC-098
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'UI_Command_Catalog owns the typed PRD Builder, Planning Wizard, and Plan Compile UICommand family contract. Each `cmd.prd_builder.*`, `cmd.planning_wizard.*`, and `cmd.plan_compile.*` command must define a non-generic payload contract, result contract, enablement guards, disabled reason codes, receipt effects, stale-projection policy, idempotency-key fields, and recovery routes in the runtime contract packet. Required commands include PRD source import, PRD answers, source annotations, conflict resolution, Approve PRD for Planning Wizard, pack reopen, Planning Wizard start, add/split/merge/rename/reorder/mark_impacted/defer/reopen topic, accepted amendment, Approve And Build, Plan Compile pause/resume/cancel/retry, inspect blocker/evidence/assignment, request bounded recompile, and Open Build. Approve And Build uses a deterministic idempotency key derived from project_id, approved_plan_pack_id, pack_version, pack_hash, PlanningRun revision, topic map version, and final audit/closure hash; its approval transaction compares all final-review CAS inputs, writes approval_cas_receipt, creates or binds the PlanCompileRun synchronously, and may only leave projection identity reconciliation pending, not the run identity itself. Commands_System may display or invoke these UICommands from user-authored command surfaces, but it does not own their payload, result, permission, receipt, or recovery semantics.'
gui_related: true
gui_classification_reason: Defines visible command behavior and dispatch contracts.
depends_on: [UCC-097, PNC-018]
unblocks: [CS-052, F3-398, OP-025]
acceptance_criteria:
- Runtime command contracts reject generic `object`, `{}`, `any`, or `Record<string, any>` payload/result definitions.
- Topic rename, reorder, mark_impacted, Approve And Build, and Open Build commands are present and typed.
- Approve And Build always returns or binds a PlanCompileRun identity in the approval transaction.
- Approve And Build payload and disabled-state contracts carry final-review CAS/currentness fields rather than relying on generic project context freshness.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py run-gates
risk_class: gui_command_contract_drift
reasoning_tier: high
context_scope: prd_planning_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- scripts/pm-prd-planning-runtime-validate.py
node_compile_hint:
  mode: ui_command_contracts
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/UI_Command_Catalog.md#UCC-097
- Plans/Commands_System.md#CS-052
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-014
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-015
preserved_exact_tokens:
- Approve And Build
- plan_compile_run_id
- approval_cas_receipt
- pending_identity_reconciliation
- rename
- reorder
- mark_impacted
- disabled reason
- idempotency
- stale-projection
negative_constraints:
- Do not let Commands_System re-own UICommand payload/result semantics.
- Do not allow Approve And Build to return a success state with no PlanCompileRun identity.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### UCC-099 - Discovery-Routed Search And Picker Command Compatibility

```yaml
plan_unit_id: UCC-099
unit_type: constraint
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UI command catalog compatibility preserves existing GUI command names and shortcuts while path/context discovery routes through DiscoveryService. Quick Open, command palette fuzzy file search, Search path narrowing, Assistant Chat file mentions, File Manager type-ahead, Planning Wizard source picker, and PRD Builder source picker do not require a parallel cmd.discovery.* GUI command family. cmd.search.* remains Search/content command canon, and DiscoveryService is the path/context routing substrate for compatible surfaces. Discovery/frecency reset controls require storage/search settings owner reconciliation before adding new command IDs.
gui_related: true
gui_classification_reason: This is user-visible command naming, shortcut, and command routing compatibility.
depends_on: [F3-399, SP-217, T-160]
unblocks: [ATS-011]
acceptance_criteria:
  - Existing GUI command names and shortcuts remain stable.
  - No parallel cmd.discovery.* command family is introduced without a separate owner decision.
  - Search/content commands remain owned by the Search/content lane, not DiscoveryService.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future UI command catalog compatibility review.
  - Future GUI route migration tests.
risk_class: ui_command_compatibility_drift
reasoning_tier: standard
context_scope: gui_command_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, future command registry]
node_compile_hint: {mode: ui_command_compatibility, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0056
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0066
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0080
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0090
source_atom_ids: [atom-0056, atom-0063, atom-0066, atom-0078, atom-0080, atom-0081, atom-0087, atom-0090]
preserved_exact_tokens: ["Quick Open", "command palette fuzzy file search", "Search path narrowing", "Assistant Chat file mentions", "File Manager type-ahead", "cmd.search.*", "cmd.discovery.*", "DiscoveryService", "frecency reset"]
negative_constraints:
  - Do not rename existing GUI commands or add a parallel cmd.discovery.* GUI family in this compile.
  - Do not let command aliases create a second discovery canon.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### UCC-100 - History Command Payloads And Action Wrappers

```yaml
plan_unit_id: UCC-100
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: History command wrappers cover focus Orchestrator History, switch Documents/Runs subviews, open
  row, open artifacts/evidence, compare versions, duplicate as draft, reopen wizard, send forward, selected-row
  export, multi-select bundle export, filtered-view export, resume/retry where valid, clone as new run, inspect
  ledger/raw records, include archived, and rebuild projection. Each command carries identity-native payload refs,
  current-project scope, currentness/authority state, stale-projection gating, and non-mutating immutable-history
  semantics.
gui_related: true
gui_classification_reason: Defines user-visible commands/actions for History rows and rebuild controls.
depends_on:
- OP-027
- CV-295
- PS-120
unblocks:
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_command_drift
reasoning_tier: standard
context_scope: history_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future History command catalog
node_compile_hint:
  mode: history_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0026
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0043
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
source_atom_ids:
- atom-0017
- atom-0018
- atom-0026
- atom-0027
- atom-0034
- atom-0038
- atom-0041
- atom-0043
- atom-0057
- atom-0058
- atom-0059
decision_refs:
- dec-0003
- dec-0004
- dec-0005
- dec-0006
- dec-0007
- dec-0010
preserved_exact_tokens:
- All of that.
- status/date/project search
- opening artifacts/evidence
- resuming/retrying
- cloning as a new run
- exporting
- viewing what happened
- historical orchestrator runs
- document-specific actions
- Duplicate as draft
- Reopen in Wizard
- Compare versions
- Export
- Send forward when currentness allows
- 'Yes'
- currentness allows
- deeper is mvp
- rendered document diff
- package/source-lineage metadata
- ledger-atom diff
- all of thodse
- selected-row export
- multi-select bundle export
- whole filtered-view export
- manifest
- yes, and yes.
- zip+manifest
- JSON
- rendered Markdown/HTML/PDF
- 'yes'
- side-by-side rendered diff
- metadata/source-lineage pane
- atom/manifest change table
- sounds good
- Rebuild
- immutable source records
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
negative_constraints:
- Do not reduce historical runs to read-only summaries when the user needs action routes.
- Do not omit evidence/artifact/Ledger pivots from historical run rows.
- Do not mutate immutable historical run/document identity in place.
- Do not resume or retry a stale historical run without currentness and authority checks.
- Do not treat clone-as-new-run as the same identity as the original historical run.
- Do not expose run-only actions such as retry or clone-as-new-run directly on document rows unless they route through
  a document-appropriate currentness/authority action.
- Do not send a historical document forward without currentness checks.
- Do not launch Plan Compile, Orchestrator execution, or mutable wizard state directly from stale historical documents
  without currentness checks.
- Do not mutate immutable approved packs or historical document records in place.
- Do not ship compare versions as rendered-text-only in MVP.
- Do not hide source-lineage or package identity changes when comparing historical wizard documents.
- Do not limit MVP export to selected-row-only.
- Do not make whole filtered-view export omit the active filter context.
- Do not collapse export into only one opaque archive format.
- Do not omit the manifest from archive/zip exports.
- Do not make deep comparison a single raw JSON or text-only diff.
- Do not hide metadata/source-lineage or atom/manifest changes behind unrelated developer-only tooling.
- Do not make rebuild available only as hidden developer tooling.
- Do not rebuild by mutating immutable source records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/Project_Output_Artifacts.md
```

### UCC-101 - Vision Bridge GUI Commands

```yaml
plan_unit_id: UCC-101
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Vision bridge command wrappers cover explicit image source selection, recent OS screenshot picker
  choice, inspect derived description, rerun with a question, copy description, attach result to current turn/run,
  and manage remembered always-accept permission. Commands must show the selected source, avoid ambiguous screenshot
  auto-selection, preserve FileSafe and permission scope, and avoid presenting bridge-derived answers as if the
  non-vision model directly saw the image.
gui_related: true
gui_classification_reason: Defines inspect/rerun/copy/attach/manage-permission controls for user-visible image bridge
  artifacts.
depends_on:
- T-165
- RAP-035
- PS-121
unblocks:
- ATS-013
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_command_drift
reasoning_tier: standard
context_scope: vision_bridge_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future Assistant Chat vision bridge controls
node_compile_hint:
  mode: vision_bridge_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0083
- chat:opencode-see-image-request
- chat:vision-bridge-defaults-answer
- Plans/Runtime_Artifacts_Panel.md
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
- Plans/Permissions_System.md
source_atom_ids:
- atom-0078
- atom-0082
- atom-0083
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- GUI
- provider/model used
- derived description
- source image/artifact link
- freshness/cache state
- inspect
- rerun with a question
- copy description
- attach result
- always accept
- stops asking
- current-turn attachment
- selected artifact
- project file allowed by FileSafe
- clipboard image
- recent OS screenshot picker
- ambiguous
- hidden Desktop/Downloads scraping
- 'yes'
- project_id
- user/account identity
- source class
- destination provider/account
- provider-family policy
- tool id
- sensitivity/redaction class
- revocable/resettable
negative_constraints:
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not make always-accept global across all projects, providers, users, source types, or sensitivity classes by
  accident.
- Do not create a hidden permission rule that cannot be inspected or revoked.
- Do not keep prompting after an applicable remembered permission exists.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### UCC-102 - Teach Guided GUI Command Taxonomy

```yaml
plan_unit_id: UCC-102
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Teach guided GUI commands include help-icon launch, /teach launch, natural-language summon handoff,
  route open, tab or panel focus, spotlight/highlight, scroll-to-field, safe read-only inspect, explain current
  UI, and optional Do it execution only for explicitly safe actions. Mutations require confirmation, permission
  gates, and activity transparency. Degraded states include missing target, stale navigation, permission denied,
  unavailable command, model/capability fallback, missing help entry, and user stop, each with a visible next action.
gui_related: true
gui_classification_reason: Defines user-visible guided action commands, route/highlight controls, mutation confirmation,
  and degraded action handling.
depends_on:
- PS-122
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_guided_command_drift
reasoning_tier: high
context_scope: teach_guided_gui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- future command palette and guided overlay commands
node_compile_hint:
  mode: teach_guided_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0097
- pldg-20260626-001-feature-name:atom-0098
- pldg-20260626-001-feature-name:atom-0139
- pldg-20260626-001-feature-name:atom-0140
- pldg-20260626-001-feature-name:atom-0142
- pldg-20260626-001-feature-name:atom-0143
- pldg-20260626-001-feature-name:atom-0144
- chat:teacher-feature-initial-framing
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md#2.6A-Chat-thread-lifecycle-commands
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md#ACD-410---Internal-Target-Payload-Navigation
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#F3-016-help-and-contextual-affordances
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/assistant-chat-design.md#6-teach
- Plans/FinalGUISpec.md#19.6-natural-language-invocation-feedback
- Plans/Permissions_System.md#2.4A-requested-vs-effective-permissioned-capability-state
- Plans/Permissions_System.md#approval-ui
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
source_atom_ids:
- atom-0097
- atom-0098
- atom-0139
- atom-0140
- atom-0142
- atom-0143
- atom-0144
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
preserved_exact_tokens:
- help icon
- clicked
- brings the user to the assistant chat window
- opens a new thread
- Teacher
- teacher can control the Gui to show the user how to do things
- Gui
- show the user how
- OpenSubject
- route_target
- highlight
- spotlight
- Teacher mode
- current surface
- Teacher badge
- context chip
- model chip
- source disclosure
- /teach
- teach me
- show me how
- help me understand this
- what does this mean
- explain this screen
- walk me through
- remember that
- for this repo always
- compact disambiguation
- control the Gui
- open route
- focus panel
- scroll to section
- highlight control/region
- expand non-mutating details
- preview selection
- changing a setting
- saving memory
- approving a permission
- undo/rollback
- spotlight/outline
- anchored caption
- step counter
- Back
- Next
- Stop
- Let me try
- Do it
- return-to-chat
- small screens
- safe spacing
- target surface unavailable
- route/control no longer exists
- context stale
- selection lost
- permission blocked
- capability unavailable
- help entry missing
- model fallback/clamp
- user stops
negative_constraints:
- Do not reuse an unrelated active chat thread when the help-icon contract says to open a new teaching conversation.
- Do not launch Teacher without preserving current surface context needed for useful help.
- Do not replace Teacher launch with static help pages only.
- Do not let Teacher perform raw uncontrolled GUI mutation outside stable UI command/route contracts.
- Do not allow mutating/destructive GUI actions without confirmation and capability/permission gates.
- Do not use stale or private panel-local route fields when the route/open contract provides canonical targets.
- Do not silently mutate an existing non-Teacher thread into Teacher mode.
- Do not lose the originating surface/control context during launch.
- Do not require users to know `/teach` before discovering help.
- Do not turn every help request into durable memory capture.
- Do not persist natural-language instructions without explicit confirmation.
- Do not guess between one-off teaching and Teach capture when the user intent is ambiguous.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let Teacher execute mutating actions through `Do it` without confirmation.
- Do not let guided GUI actions bypass Permissions_System requested/effective disclosure.
- Do not obscure the target control with the explanation caption.
- Do not make the overlay inaccessible without keyboard or screen-reader fallback.
- Do not trap the user in the overlay without Stop/return-to-chat.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Commands_System.md
- Plans/Automated_Testing_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Glossary.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into UI Command Catalog owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### UCC-103 - Notifications And Sounds Command Catalog

```yaml
plan_unit_id: UCC-103
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Notifications and Sounds commands include `cmd.settings.open_notifications`, destination create/update/delete/toggle/test,
  notification mapping update, runtime override set, and sound preview/upload/pack import/asset delete/asset restore/asset
  export/mapping set. Destination test commands require explicit user action, enabled destination authority, rate limiting,
  masking, and receipt recording. Destination create/update payloads carry provider-specific profile fields from CV-298
  for Slack, Discord, generic webhook, ntfy, Pushover, and Telegram while storing only credential refs for secrets. Sound
  preview is local only and must not send external notifications.
gui_related: true
gui_classification_reason: Defines user-visible settings, destination, mapping, preview, upload, import/export, and test-send commands.
depends_on: [CV-298, PS-124]
unblocks: [WM-039, ATS-016]
acceptance_criteria:
  - Every Notifications & Sounds GUI control routes through a stable command ID.
  - Destination create/update commands accept provider-specific profile payloads without exposing raw URLs or tokens.
  - Test-send commands are separate from local preview and cannot mutate alert state.
  - Sound asset commands distinguish user-uploaded assets, imported packs, built-ins, hide/disable, restore, and export behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notifications and Sounds command catalog fixtures
risk_class: notification_command_catalog_gap
reasoning_tier: high
context_scope: notifications_sounds_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future Settings > General > Notifications & Sounds commands
node_compile_hint:
  mode: notifications_sounds_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-settings-gui-command-wiring
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
source_atom_ids: [atom-0064, atom-0068, atom-0069]
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
  - Do not route local sound preview through external notification delivery.
  - Do not make test-send implicit from saving settings.
  - Do not create visualizer bridge aliases as UI command IDs unless they dispatch outside the iframe host bridge.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

### UCC-104 - DRY Method Settings Command

```yaml
plan_unit_id: UCC-104
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The DRY Method Settings command catalog defines `cmd.settings.agent_rules.dry_method_default_guard.set` with payload
  `{ scope: "application", value: "enabled" | "disabled_by_user" }`, emitted event
  `settings.agent_rules.dry_method_default_guard.updated`, visible surfaces Settings > General > Agent Rules and
  Assistant Chat DRY disclosure, and help copy explaining what the toggle changes. The command turns off only PM's
  default reuse-first DRY guard; it does not disable explicit project/user instructions, safety, secrets, source
  authority, governance, permissions, source-control hygiene, or receipt provenance.
gui_related: true
gui_classification_reason: Defines a user-visible Settings command, toggle payload, event, and help copy.
depends_on: [CV-299, SP-223]
unblocks: [WM-040, ATS-018]
acceptance_criteria:
  - The DRY Method toggle has one stable command id and payload enum.
  - The visible command copy explains that disabling DRY only disables the default reuse-first guard.
  - Command handling preserves DRY receipt provenance and does not weaken non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method settings command fixture
risk_class: dry_method_settings_command_gap
reasoning_tier: high
context_scope: dry_method_settings_command
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future Settings > General > Agent Rules commands
node_compile_hint:
  mode: dry_method_settings_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0073, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "Settings > General > Agent Rules"
  - "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not delete DRY receipt provenance when the user disables the default guard.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding command obligations from bootstrap ledger `pldg-20260701-001-feature-intake` into UI_Command_Catalog ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### UCC-106 - First-Run Onboarding Command Family

```yaml
plan_unit_id: UCC-106
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  First-run onboarding GUI actions use a registered onboarding command family rather than page-local button payloads.
  Required commands include `cmd.onboarding.first_run.open`, `cmd.onboarding.provider_setup.open`,
  `cmd.onboarding.provider_setup.use_provider`, `cmd.onboarding.skip_to_planning_wizard`,
  `cmd.onboarding.free_models.review`, `cmd.onboarding.free_models.defer`, `cmd.onboarding.review_setup`,
  `cmd.onboarding.open_planning_wizard`, and `cmd.health.provider_setup.open`. Payloads carry source surface, current
  onboarding step, selected provider/account/profile refs when applicable, return route, idempotency key, and
  `onboarding_setup_state` refs where relevant. Results include step transition, setup flow launched, setup skipped,
  Free Models review opened or deferred, Planning Wizard opened, and Health provider-setup route opened. Teacher links
  from onboarding normalize to the existing Teacher/Teach command routes from UCC-102 and CS-053 rather than creating a
  second Teacher command language.
gui_related: true
gui_classification_reason: Defines user-visible button/route command IDs and command results for first-run onboarding and Health setup actions.
depends_on: [F3-411, MA-066, CV-305, ACD-431, UCC-102, CS-053]
unblocks: [WM-041, PWIZ-017, ATS-020]
acceptance_criteria:
  - Every accepted first-run onboarding action has a stable UI command route.
  - Skip routing writes or references limited `onboarding_setup_state` and opens Planning Wizard without marking Health Ready.
  - Provider setup commands preserve return context and cannot bypass Multi-Account/provider readiness semantics.
  - Free Models review/defer commands are reachable only after the paid-provider prompt has occurred.
  - Teacher actions reuse existing Teacher/Teach command contracts and preserve current-surface context.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding UICommand fixture
  - future skip-to-Planning-Wizard command idempotency fixture
risk_class: onboarding_command_gap
reasoning_tier: high
context_scope: first_run_onboarding_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future command registry and first-run onboarding controls
node_compile_hint:
  mode: first_run_onboarding_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
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
source_atom_ids: [atom-0032, atom-0033, atom-0035, atom-0036, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "Set up a paid provider"
  - "Skip for now"
  - "Use this provider"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Review Free Models"
  - "Maybe later"
  - "Continue to Planning Wizard"
  - "Open Planning Wizard"
  - "Review setup"
  - "onboarding_setup_state"
  - "Teacher"
  - "/teach"
negative_constraints:
  - Do not route onboarding actions through uncataloged local command IDs.
  - Do not let skip-to-Planning-Wizard mark Doctor/Health as Ready.
  - Do not open Free Models before the paid-provider prompt has occurred.
  - Do not make Teacher discovery depend on slash-command knowledge.
  - Do not create a second Teacher command payload language separate from UCC-102 and CS-053.
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, or executable queues during this compile phase.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host command and route obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### UCC-105 - Containerized Host Commands And HostCapabilityCommand Envelope

```yaml
plan_unit_id: UCC-105
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Containerized-host GUI actions, Assistant Chat pivots, Orchestrator links, Run Graph access pivots, ATS host launches,
  tool actions, and shell-like actions use registered PM command ids and the HostCapabilityCommand envelope rather than
  copying a Coasts local API, terminal session model, file/service controls, or direct runtime endpoint. Command payloads
  carry command_id, command_kind, source_surface, requested_action, host_capability_ref, host_profile_id, host_instance_id,
  execution_unit_context_ref, approval_scope_key, permission_snapshot_id, FileSafe scope, network_access_policy,
  secret_access_policy, destructive_command_policy, preflight_required, allowed_action_ids, and expected receipt refs when
  relevant. HostOperationRequest remains a dispatch/request payload shape below the command envelope when needed. Docker
  and Kubernetes command families continue to live under cmd.docker.* and cmd.docker.k8s.* ownership, with Docker/Hosts
  as a routed destination rather than a new Activity Bar owner. Registered Docker/Hosts command ids include
  `cmd.docker.hosts.open`, `cmd.docker.host.refresh`, `cmd.docker.host.preflight`,
  `cmd.docker.host.profile.save`, `cmd.docker.host.session.launch`, `cmd.docker.host.instance.start`,
  `cmd.docker.host.instance.stop`, `cmd.docker.host.instance.restart`, `cmd.docker.host.access.open_app`,
  `cmd.docker.host.instance.retain`, and `cmd.docker.host.receipt.open`, in addition to existing
  `cmd.docker.run`, `cmd.docker.stop`, `cmd.docker.restart`, `cmd.docker.container.open`,
  `cmd.docker.container.view_logs`, `cmd.docker.container.attach_shell`, `cmd.docker.cleanup.scan`, and
  `cmd.docker.cleanup.prune` where exact semantics match.
gui_related: true
gui_classification_reason: This PlanUnit defines user-visible command routes and affordances for GUI, chat, orchestrator, and run-graph surfaces.
depends_on: [CV-304]
unblocks: [F3-410, ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Docker/Hosts commands and access pivots are registered through UI_Command_Catalog rather than ad hoc page-local payloads.
  - HostCapabilityCommand is the PM-owned command envelope; HostOperationRequest is only a lower-level request payload shape when needed.
  - cmd.docker.* and cmd.docker.k8s.* command families preserve Docker Manager command namespace ownership.
  - Command dispatch carries authority, FileSafe, network, secret, destructive-command, preflight, and receipt expectations before mutation.
  - Direct Coasts HTTP API, permissive CORS, SSE/WebSocket terminal, and file/service controls are not copied as PM command authority.
  - Every Docker/Hosts toolbar, card, detail-row, access, lifecycle, receipt, and cleanup action maps to one registered command id and a HostCapabilityCommand payload, or remains disabled with blocked/degraded display evidence.
  - Command fixtures cover missing authority, missing FileSafe scope, missing receipt expectation, stale projection mutation denial, low-confidence port access denial, and cleanup/retain receipt requirements.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future UI command catalog host-command fixture
risk_class: host_command_bypass
reasoning_tier: high
context_scope: containerized_host_command_catalog
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future command registry and routed Docker/Hosts actions
node_compile_hint:
  mode: host_capability_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0024
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-005-host-capability-command
source_atom_ids: [atom-0023, atom-0024, atom-0041, atom-0051, atom-0056, atom-0064, atom-0073, atom-0074, atom-0075, atom-0080, atom-0081]
preserved_exact_tokens:
  - "HostCapabilityCommand"
  - "HostOperationRequest"
  - "cmd.docker.*"
  - "cmd.docker.k8s.*"
  - "command_id"
  - "command_kind"
  - "host_capability_ref"
  - "host_profile_id"
  - "execution_unit_context"
  - "approval_scope_key"
  - "permission_snapshot_id"
  - "FileSafe scope"
  - "network_access_policy"
  - "secret_access_policy"
  - "destructive_command_policy"
  - "required receipt refs"
negative_constraints:
  - Do not copy Coasts HTTP `/api/v1`, permissive CORS, SSE/WebSocket terminal sessions, or file/service controls.
  - Do not let container exec bypass Executor, Permissions, FileSafe, Tools, UI_Command_Catalog, or receipts.
  - Do not make Docker/Hosts a new Activity Bar owner or command namespace.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### UCC-107 - GUI Dev Preview Command Controls

```yaml
plan_unit_id: UCC-107
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  GUI development-preview command controls are limited to cmd.gui_dev_preview.reload,
  cmd.gui_dev_preview.fixture_mode.set, cmd.gui_dev_preview.capture_state, and
  cmd.gui_dev_preview.daemon_capabilities.inspect. They are development-preview and automated-test controls only,
  are compiled out or disabled in production unless explicitly configured, and must not be reused as production
  runtime, terminal, filesystem, browser automation, CEF, tray, native-window, or process/container commands.
gui_related: true
gui_classification_reason: This unit defines user-visible development-preview GUI controls and command IDs.
depends_on:
- ATS-023
- F3-417
unblocks: []
acceptance_criteria:
- Dev-preview controls remain scoped to reload, fixture mode, screenshot/state capture, and daemon capability inspection.
- Production builds disable or omit these controls unless explicit configuration enables the matching dev/test surface.
- The commands do not grant OS-owned capabilities and do not replace production runtime command families.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plan-index.py validate
risk_class: dev_preview_command_authority_leak
reasoning_tier: high
context_scope: gui_platform_currentness_repair
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: gui_dev_preview_commands_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/.audits/fable-20260706/currentness_check_report.json
preserved_exact_tokens:
- cmd.gui_dev_preview.reload
- cmd.gui_dev_preview.fixture_mode.set
- cmd.gui_dev_preview.capture_state
- cmd.gui_dev_preview.daemon_capabilities.inspect
negative_constraints:
- "Do not invent production runtime commands for dev-preview workflow."
- "Do not let dev-preview commands grant PTY, filesystem, process/container, CEF, tray, native-window, or browser automation authority."
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
```

## GUI / PMConcept implementation-readiness repair addendum (2026-07-02)

This addendum closes the GUI command-catalog defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### Concrete PRD Builder, Planning Wizard, and Plan Compile command rows

The command family required by UCC-098 is concrete. Production GUI controls may not use the old fixed wizard rail, `Approve & Continue`, `START`, `BUILD`, or tab-switch handlers as substitutes for these command IDs.

| Command ID | Label / action | Required payload and guard summary | Receipt / event effect |
|---|---|---|---|
| `cmd.prd_builder.source.import` | Import PRD source | `project_id`, `source_ref`, import mode, authority snapshot, idempotency key; disabled when source is denied, too large, stale, or unsupported | PRD source import receipt and PRD projection refresh |
| `cmd.prd_builder.answer.upsert` | Save PRD answer | `prd_run_id`, question/section id, answer version, source refs, idempotency key; disabled when ledger sync is blocked | PRD answer receipt and projection update |
| `cmd.prd_builder.annotation.upsert` | Add/update annotation | document version, text anchor, action kind, selected text hash, source refs; disabled when anchor is stale and cannot remap | Annotation upsert receipt |
| `cmd.prd_builder.annotation.resolve` | Resolve annotation | annotation id, document version, resolution kind; disabled when annotation is already terminal or stale without remap | Annotation resolution receipt |
| `cmd.prd_builder.conflict.resolve` | Resolve PRD conflict | conflict id, chosen resolution, rationale, source refs; disabled when selected sources are stale or unavailable | Conflict-resolution receipt |
| `cmd.prd_builder.approve_for_planning_wizard` | Approve PRD for Planning Wizard | PRD Pack id/version/hash, source manifest hash, unresolved-warning acknowledgement, idempotency key; disabled when blocking conflicts or ledger sync failure exist | Approved PRD Pack snapshot and handoff receipt |
| `cmd.prd_builder.pack.reopen` | Reopen PRD Pack | approved pack id/version, reason, currentness proof; disabled when reopening would bypass immutable history | Reopen receipt and new draft identity |
| `cmd.planning_wizard.start` | Start Planning Wizard | approved PRD Pack ref or normalized requirements input, project context snapshot, testing policy snapshot | PlanningRun created/opened |
| `cmd.planning_wizard.topic.open` | Open topic | PlanningRun id, topic id, expected topic map version | Topic projection selected |
| `cmd.planning_wizard.topic.add` | Add topic | PlanningRun id, parent/dependency refs, label, source reason, topic map version | Topic added and topic map version advanced |
| `cmd.planning_wizard.topic.split` | Split topic | source topic id, split descriptors, affected refs, topic map version | Topic split receipt and impact propagation |
| `cmd.planning_wizard.topic.merge` | Merge topics | topic ids, target label, source reason, topic map version | Topic merge receipt and impact propagation |
| `cmd.planning_wizard.topic.rename` | Rename topic | topic id, new label, topic map version | Topic rename receipt |
| `cmd.planning_wizard.topic.reorder` | Reorder topic | topic id, before/after target, topic map version | Topic order receipt |
| `cmd.planning_wizard.topic.mark_impacted` | Mark topic impacted | topic id, impact reason, source refs, dependency refs | Topic impact receipt and stale projection |
| `cmd.planning_wizard.topic.defer` | Defer topic | topic id, deferral reason, dependency/currentness refs | Topic deferred receipt |
| `cmd.planning_wizard.topic.reopen` | Reopen topic | topic id, reason, currentness refs | Topic reopened receipt |
| `cmd.planning_wizard.amendment.accept` | Accept amendment | amendment id, source refs, affected topic refs, expected topic map version | Amendment accepted and impacted topics marked |
| `cmd.planning_wizard.approve_and_build` | Approve And Build | final-review CAS inputs for `project_id`, `planning_run_id`, PlanningRun revision, topic map version, `approved_plan_pack_id`, pack version/hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, final audit/closure hash, approval actor, and deterministic idempotency key | Atomically writes `approval_cas_receipt`, `PlanApproved`, and `PlanCompileRun_created_or_bound`; returns durable `plan_compile_run_id` synchronously |
| `cmd.plan_compile.pause` | Pause Plan Compile | PlanCompileRun id, current stage token, reason | Plan Compile pause receipt |
| `cmd.plan_compile.resume` | Resume Plan Compile | PlanCompileRun id, currentness token, recovery route | Plan Compile resume receipt |
| `cmd.plan_compile.cancel` | Cancel Plan Compile | PlanCompileRun id, cancellation reason, confirmation token | Plan Compile cancellation receipt |
| `cmd.plan_compile.retry` | Retry Plan Compile stage | PlanCompileRun id, failed stage id, currentness token | Stage retry receipt |
| `cmd.plan_compile.inspect_blocker` | Inspect blocker | PlanCompileRun id, blocker id, route target | Opens blocker inspector |
| `cmd.plan_compile.inspect_evidence` | Inspect evidence | PlanCompileRun id, evidence ref, redaction profile | Opens redacted evidence inspector |
| `cmd.plan_compile.inspect_assignment` | Inspect assignment | PlanCompileRun id, assignment id | Opens assignment inspector |
| `cmd.plan_compile.request_bounded_recompile` | Request bounded recompile | PlanCompileRun id, affected PlanUnit refs, reason, currentness token | Bounded recompile request receipt |
| `cmd.plan_compile.open_build` | Open Build | PlanCompileRun id, build/run identity, target artifact or route; disabled until `BuildStarted` or resulting build identity exists | Opens resulting build or build artifact route |

### Testing capability and visible-session command rows

Testing policy UI is a first-class command surface, not settings prose alone.

| Command ID | Label / action | Required payload and guard summary | Receipt / event effect |
|---|---|---|---|
| `cmd.testing.capability_policy.set` | Set testing capability policy | scope `global` or `project`, capability family, value `Auto` / `On` / `Off`, inheritance marker, authority snapshot; disabled when policy owner is unavailable or authority is missing | Effective testing policy receipt |
| `cmd.testing.visibility_policy.set` | Set testing visibility policy | scope, value including `show_when_possible`, redaction profile ref, background allowance | Visibility policy receipt |
| `cmd.testing.session.open` | Open visible test session | test session id, target surface, route, redaction profile | Visible session opened receipt |
| `cmd.testing.session.watch` | Watch visible test session | test session id, stream/session identity, fallback route | Watch receipt and live projection binding |
| `cmd.testing.session.background` | Continue testing in background | test session id, background reason, continuation policy | Background continuation receipt |
| `cmd.testing.session.redaction.inspect` | Inspect redaction/evidence | test session id, artifact/evidence refs, redaction profile | Redaction inspection route opened |

### PMConcept command aliases and retirements

| PMConcept token | Disposition |
|---|---|
| `cmd.chat.effort`, `cmd.chat.settings`, `cmd.chat.model`, `cmd.chat.mode`, `cmd.chat.open_debug_target_picker`, `cmd.chat.export_investigation_bundle`, `cmd.chat.revoke_investigation_item` | Cataloged command IDs for chat setting/debug routes; payloads carry thread/project/context scope and cannot mutate model/provider state without the owning settings contract. |
| `cmd.file.copy_full_path`, `cmd.file.copy_relative_path` | Cataloged compatibility wrappers over `cmd.file.copy_path` with `format = "absolute"` or `format = "relative"`; production UI may use either explicit wrapper if the wiring row declares the normalized copy-path payload. |
| `cmd.git.open_diff` | Compatibility alias for `cmd.git.diff_open`; production wiring records the alias and the canonical target. |
| `cmd.git.show_commit` | Compatibility alias for `cmd.source_control.history_open_commit`; production wiring records the alias and the canonical target. |
| `cmd.remote.reconnect`, `cmd.search.set_scope`, `cmd.search.previous_result`, `cmd.search.next_result`, `cmd.terminal.focus_session` | Cataloged command IDs required by existing PMConcept/wiring surfaces; terminal focus may normalize internally to any future shorter terminal-focus target only through explicit alias metadata. |
| `cmd.indexOf` | Parser false-positive from JavaScript and not a UICommand. |

`START`, `BUILD`, and `Approve & Continue` are retired as ordinary planning/build launch labels. `Approve And Build` is the only ordinary final planning approval-to-PlanCompileRun launch command. Post-approval runtime controls must use scoped commands such as `cmd.plan_compile.open_build`, `cmd.plan_compile.resume`, `cmd.runtime.approve`, or route/open commands with disabled reasons and receipt effects.

## FABLE GUI command contract closure addendum (2026-07-07)

This addendum closes the command-catalog portion of the FABLE GUI command and wiring repair. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, FileSafe behavior, storage behavior, platform specifications, or production build tasks. Existing FileManager CRUD, runtime allowed-action, PRD Builder, Planning Wizard, and Plan Compile command rows remain canonical; this addendum adds missing command families and supplies field-level payload, result, error, and receipt/event contracts for the launch-critical and GUI-command families named by the FABLE repair.

### Command response and receipt baseline

Every command in this addendum returns the `UICommandResponse` envelope from `Plans/Contracts_V0.md`. The field-level response minimum is `schema_version`, `dispatch_id`, `command_id`, `ack_status`, `result_status?`, `error?`, `event_refs[]?`, `receipt_ref?`, and `ts`. Error codes are closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`. Commands that intentionally emit no persisted domain event still record a dispatch receipt or route/open disposition and must not fabricate `*.command_applied` events.

### Added GUI command families

| Command ID | Payload fields | Result fields | Error/disabled fields | Receipt or event effect |
|---|---|---|---|---|
| `cmd.theme.set_mode` | `project_id?`, `scope`, `mode` (`light`, `dark`, or `auto`), `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_mode`, `effective_variant` (resolved theme; in `auto` it tracks OS `prefers-color-scheme` live), `contrast_profile` | `stale_projection`, `permission_denied`, `invalid_args` | `settings.theme.updated` |
| `cmd.theme.set_accent` | `project_id?`, `scope`, `accent_token`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_accent_token` | `invalid_args`, `stale_projection` | `settings.theme.updated` |
| `cmd.theme.set_density` | `project_id?`, `scope`, `density`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_density` | `invalid_args`, `stale_projection` | `settings.theme.updated` |
| `cmd.theme.preview` | `scope`, `theme_patch`, `preview_surface`, `ttl_ms` | `preview_id`, `expires_at_utc` | `invalid_args`, `handler_unavailable` | explicit dispatch receipt |
| `cmd.theme.reset` | `project_id?`, `scope`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `reset_scope` | `stale_projection`, `permission_denied` | `settings.theme.updated` |
| `cmd.persona.create` | `project_id`, `persona_spec`, `source_refs[]`, `idempotency_key` | `persona_id`, `persona_revision` | `invalid_args`, `permission_denied`, `stale_projection` | `persona.created` |
| `cmd.persona.update` | `project_id`, `persona_id`, `persona_patch`, `expected_persona_revision`, `idempotency_key` | `persona_id`, `persona_revision` | `stale_projection`, `invalid_args`, `permission_denied` | `persona.updated` |
| `cmd.persona.delete` | `project_id`, `persona_id`, `expected_persona_revision`, `confirmation_token`, `idempotency_key` | `persona_id`, `terminal_state` | `blocked_state_required`, `permission_denied`, `stale_projection` | `persona.deleted` |
| `cmd.persona.select` | `project_id`, `surface`, `persona_id`, `expected_persona_revision?` | `effective_persona_id`, `selection_scope` | `invalid_args`, `stale_projection` | `persona.selected` |
| `cmd.persona.duplicate` | `project_id`, `source_persona_id`, `new_name`, `idempotency_key` | `persona_id`, `persona_revision` | `invalid_args`, `permission_denied` | `persona.created` |
| `cmd.persona.import` | `project_id`, `source_ref`, `import_mode`, `authority_snapshot`, `idempotency_key` | `persona_id`, `persona_revision`, `import_receipt_ref` | `invalid_args`, `permission_denied`, `handler_unavailable` | `persona.imported` |
| `cmd.persona.export` | `project_id`, `persona_id`, `format`, `redaction_profile` | `export_ref`, `persona_revision` | `invalid_args`, `permission_denied` | `persona.exported` |
| `cmd.alert.acknowledge` | `project_id`, `alert_id`, `alert_revision`, `actor_ref`, `idempotency_key` | `alert_id`, `status` | `stale_projection`, `permission_denied` | `alert.acknowledged` |
| `cmd.alert.snooze` | `project_id`, `alert_id`, `alert_revision`, `snooze_until_utc`, `reason`, `idempotency_key` | `alert_id`, `snooze_until_utc` | `invalid_args`, `stale_projection` | `alert.snoozed` |
| `cmd.alert.dismiss` | `project_id`, `alert_id`, `alert_revision`, `dismissal_reason`, `idempotency_key` | `alert_id`, `status` | `stale_projection`, `permission_denied` | `alert.dismissed` |
| `cmd.alert.open_source` | `project_id`, `alert_id`, `route_target`, `OpenSubject` | `route_ref`, `opened_subject_ref` | `invalid_route`, `stale_projection` | explicit route/open receipt |
| `cmd.alert.mute_rule` | `project_id`, `alert_rule_id`, `mute_scope`, `expires_at_utc?`, `reason`, `idempotency_key` | `alert_rule_id`, `mute_state` | `permission_denied`, `invalid_args` | `alert.rule_muted` |
| `cmd.concern.create` | `project_id`, `title`, `severity`, `category`, `source_refs[]`, `idempotency_key` | `concern_id`, `concern_revision` | `invalid_args`, `permission_denied` | `concern.created` |
| `cmd.concern.update` | `project_id`, `concern_id`, `concern_patch`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `concern_revision` | `stale_projection`, `invalid_args` | `concern.updated` |
| `cmd.concern.assign` | `project_id`, `concern_id`, `assignee_ref`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `concern_revision`, `assignee_ref` | `permission_denied`, `stale_projection` | `concern.assigned` |
| `cmd.concern.resolve` | `project_id`, `concern_id`, `resolution_kind`, `evidence_refs[]`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `terminal_state` | `blocked_state_required`, `stale_projection` | `concern.resolved` |
| `cmd.concern.reopen` | `project_id`, `concern_id`, `reopen_reason`, `source_refs[]`, `idempotency_key` | `concern_id`, `concern_revision` | `permission_denied`, `stale_projection` | `concern.reopened` |
| `cmd.concern.link_evidence` | `project_id`, `concern_id`, `evidence_refs[]`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `linked_evidence_refs[]` | `invalid_args`, `stale_projection` | `concern.evidence_linked` |
| `cmd.concern.promote` | `project_id`, `concern_id`, `promotion_target`, `expected_concern_revision`, `idempotency_key` | `promotion_id`, `concern_id` | `permission_denied`, `blocked_state_required`, `stale_projection` | `concern.promoted` |
| `cmd.model.refresh` | `project_id?`, `provider_id?`, `account_id?`, `refresh_reason`, `idempotency_key` | `model_catalog_revision`, `provider_status_refs[]` | `permission_denied`, `handler_unavailable`, `stale_projection` | `model.catalog_refreshed` |
| `cmd.model.list` | `project_id?`, `provider_filter?`, `capability_filter?`, `cache_policy` | `model_catalog_revision`, `model_ids[]`, `degraded_reason?` | `handler_unavailable`, `invalid_args` | explicit dispatch receipt |
| `cmd.chat.send` | `thread_id`, `project_id?`, `message_id`, `content_ref`, `attachment_refs[]`, `model_request_ref?`, `idempotency_key` | `assistant_turn_id?`, `message_id`, `run_or_goal_ref?` | `permission_denied`, `stale_projection`, `handler_unavailable` | `chat.message.submitted` |
| `cmd.chat.stop` | `thread_id`, `run_id?`, `assistant_turn_id?`, `stop_reason_code`, `idempotency_key` | `thread_id`, `stopped_ref?`, `resumable` | `blocked_state_required`, `stale_projection`, `handler_unavailable` | `chat.response_stop_requested` |
| `cmd.panel.undock` | `project_id?`, `panel_id`, `current_host`, `target_window?`, `expected_layout_revision`, `idempotency_key` | `panel_id`, `layout_revision`, `window_id?` | `invalid_args`, `stale_projection` | `panel.undocked` |
| `cmd.panel.redock` | `project_id?`, `panel_id`, `window_id?`, `target_host`, `expected_layout_revision`, `idempotency_key` | `panel_id`, `layout_revision` | `invalid_args`, `stale_projection` | `panel.redocked` |
| `cmd.orchestrator.pause` | `run_id`, `pause_scope`, `pause_reason`, `safe_point_required`, `idempotency_key` | `run_id`, `pause_receipt_ref`, `resumable` | `permission_denied`, `blocked_state_required`, `stale_projection` | `goal_run.stopped` |
| `cmd.orchestrator.resume` | `run_id`, `resume_scope`, `expected_goal_revision`, `wake_reason`, `idempotency_key` | `run_id`, `scheduler_pass_ref?`, `resumed` | `blocked_state_required`, `stale_projection`, `permission_denied` | `scheduler.pass` |
| `cmd.dashboard.add_widget` | `project_id`, `dashboard_id`, `widget_id`, `layout_slot`, `expected_layout_revision`, `idempotency_key` | `widget_instance_id`, `layout_revision` | `invalid_args`, `stale_projection` | `dashboard.widget_added` |
| `cmd.dashboard.catalog` | `project_id?`, `surface`, `filter?`, `cache_policy` | `catalog_revision`, `widget_ids[]` | `handler_unavailable`, `invalid_args` | explicit dispatch receipt |
| `cmd.onboarding.free_models.refresh` | `project_id?`, `provider_filter?`, `account_id?`, `idempotency_key` | `free_model_catalog_revision`, `model_ids[]` | `handler_unavailable`, `permission_denied` | `onboarding.free_models_refreshed` |
| `cmd.onboarding.free_models.retry` | `project_id?`, `failed_refresh_id`, `retry_reason`, `idempotency_key` | `free_model_catalog_revision?`, `retry_receipt_ref` | `blocked_state_required`, `handler_unavailable` | `onboarding.free_models_refresh_retried` |
| `cmd.onboarding.free_models.setup` | `project_id?`, `provider_id`, `return_route`, `setup_intent`, `idempotency_key` | `setup_route_ref`, `return_route` | `invalid_route`, `permission_denied` | `onboarding.provider_setup_opened` |

### Existing launch, recovery, and FileManager command contracts

| Command family | Field-level closure |
|---|---|
| PRD/Planning launch | `cmd.prd_builder.approve_for_planning_wizard`, `cmd.planning_wizard.approve_and_build`, and `cmd.plan_compile.open_build` keep their existing command rows. Their payloads must include CAS/currentness inputs, approval actor, idempotency key, route/build identity where relevant, result identity, `UICommandResponse`, and receipt/event refs. `cmd.plan_compile.open_build` remains route/open or post-build reveal only while runtime activation is disabled; it must not emit `plan_compile.command_applied` as a fabricated success event. |
| Runtime allowed actions | `resume_after_prerequisite`, `restore_safe_point_then_retry`, `start_fresh_attempt`, `replan`, `skip_node`, and `abort_run` map only to the existing `cmd.runtime.*` commands. Payloads carry `run_id`, `node_id?`, `blocked_sequence?`, `attempt_id?`, safe-point/worktree/baseline fields where applicable, result status, and closed error codes. Dispatch emits `node.unblocked`, `safe_point.restored`, `scheduler.pass`, `goal.replanned`, `goal_run.stopped`, or an explicit dispatch receipt; it must not emit `runtime.command_applied`. |
| FileManager CRUD | Existing `cmd.file.new_file`, `cmd.file.new_folder`, `cmd.file.rename`, `cmd.file.delete`, `cmd.file.copy_path`, `cmd.file.copy_nodes`, `cmd.file.cut_nodes`, `cmd.file.paste_nodes`, `cmd.file.open_with`, and `cmd.file.save_local_copy` rows remain canonical. Mutation commands emit their existing file/folder events; clipboard and open commands record explicit no-persist dispatch or route/open receipts. |

### UCC-108 - FABLE GUI Command Families And Response Contracts

```yaml
plan_unit_id: UCC-108
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The FABLE GUI command repair registers missing theme, persona, alert, concern, model,
  chat send/stop, panel undock/redock, Orchestrator pause/resume, Dashboard widget,
  Free Models onboarding, launch-chain, runtime recovery, and FileManager command
  contracts with field-level payload, result, error, and receipt/event requirements.
  Existing FileManager CRUD, launch-chain, and runtime allowed-action rows remain
  canonical and are strengthened by the shared UICommandResponse and no fabricated
  command_applied event rule.
gui_related: true
gui_classification_reason: Defines user-visible GUI command families, command payloads, responses, disabled states, and receipts.
depends_on: [UCC-089, UCC-097]
unblocks: [WM-042, PG-061]
acceptance_criteria:
  - All command families named by the FABLE GUI repair have stable `cmd.*` IDs or explicit compatibility dispositions.
  - Every listed command declares payload fields, result fields, closed error handling through UICommandResponse, and receipt or event effects.
  - Runtime allowed_action_ids map only to canonical `cmd.runtime.*` commands.
  - FileManager CRUD commands are not duplicated; existing rows remain canonical and gain the shared response/receipt acceptance bar.
  - No command in this addendum uses or authorizes fabricated `*.command_applied` events.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_command_contract_gap
reasoning_tier: high
context_scope: fable_gui_command_wiring_gate_repair
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - future UI command dispatcher fixtures
node_compile_hint:
  mode: gui_command_contract_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-ui-command-catalog-missing-families
preserved_exact_tokens:
  - cmd.theme.*
  - cmd.persona.*
  - cmd.alert.*
  - cmd.concern.*
  - cmd.model.refresh
  - cmd.model.list
  - cmd.chat.send
  - cmd.chat.stop
  - cmd.panel.undock
  - cmd.panel.redock
  - cmd.orchestrator.pause
  - cmd.orchestrator.resume
  - cmd.dashboard.add_widget
  - cmd.dashboard.catalog
  - resume_after_prerequisite
  - restore_safe_point_then_retry
  - start_fresh_attempt
  - replan
  - skip_node
  - abort_run
negative_constraints:
  - Do not duplicate existing FileManager CRUD command rows.
  - Do not treat command-catalog or wiring rows as runtime certification evidence.
  - Do not emit fabricated `*.command_applied` events.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: UCC-049 through UCC-106 now inherit the strict schema overlay below. Each row exposes `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref` either through a concrete `cmd.*` token in its preserved tokens or through the owner-referenced family schema named in the overlay. Rows with prose-only or slash-token source lineage are implementation-ready only through that owner reference, not as free-form handler text.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs keep `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent`; `cmd.browser.run_code`, `cmd.browser.evaluate`, legacy `browser_run_code`, and legacy `browser_evaluate` are compatibility-only diagnostic/page-evaluation lineage, not default production browser commands.

### UCC-049 through UCC-106 strict schema overlay

This overlay is the owner reference for every command row from UCC-049 through UCC-106. It keeps the catalog as the command-ID SSOT while avoiding 58 duplicated payload tables. Implementers MUST resolve each row through the row range below, then through the row's concrete `cmd.*` tokens or compatibility alias notes.

Common fields for every covered row:

- `command_id`: every concrete `cmd.*` token in the row's `preserved_exact_tokens`; grouped or wildcard tokens are family aliases and must normalize to a concrete `cmd.*` row before dispatch.
- `payload_required`: `dispatch_id`, `command_id`, `source_surface`, `actor_ref`, and the row-specific identity listed below.
- `payload_optional`: `route_target?`, `OpenSubject?`, `project_id?`, `repo_id?`, `worktree_id?`, `run_id?`, `attempt_id?`, `node_id?`, `thread_id?`, `usage_event_ref?`, `usage_record_id?`, `provider_attempt_ref?`, `tool_call_id?`, `trace_ref?`, `receipt_ref?`, `receipt_refs[]?`, `raw_payload_ref?`, `query_session_id?`, `selection_ref?`, `confirmation_ref?`, `idempotency_key?`, and family-specific refs allowed by the owner row.
- `result_fields`: the shared `UICommandResponse` envelope fields `schema_version`, `dispatch_id`, `command_id`, `ack_status`, `result_status?`, `error?`, `event_refs[]?`, `receipt_ref?`, and `ts`.
- `error_codes`: closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`; family owners may narrow but not expand this set without a new owner-doc row.
- `disabled_reason_codes`: closed to `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, and `permission_required`.
- `owner_doc_ref`: this document plus the family owner named below; no handler may invent unowned payload keys or fabricate `*.command_applied` events.

| Rows | Family owner reference | Row-specific required identity |
|---|---|---|
| `UCC-049` through `UCC-053` | Docker and Kubernetes command families in this catalog; storage and capability details remain with `Plans/FinalGUISpec.md`, `Plans/Wiring_Matrix.md`, `Plans/storage-plan.md`, and `Plans/Tools.md` ContractRefs already carried by the rows. | `container_ref?`, `image_ref?`, `compose_project_ref?`, `kubernetes_context?`, `namespace?`, and `capability_snapshot_ref` for mutating or capability-gated actions. |
| `UCC-054` through `UCC-055` | Project-scope worktree command family in this catalog. | `repo_id`, `worktree_id?`, `branch_ref?`, `safe_point_id?`, and `worktree_lifecycle_state` when mutating worktree state. |
| `UCC-056` through `UCC-060` | Assistant chat, context lens, thread worktree, and context-detail command families in this catalog. | `thread_id` plus `message_id?`, `context_lens_mode?`, `worktree_id?`, `usage_detail_ref?`, or `context_projection_ref?` according to the concrete command. |
| `UCC-061` through `UCC-065` | Browser and preview command family in this catalog. | `browser_session_id?`, `preview_subject_ref?`, `selection_ref?`, `screenshot_ref?`, and `agent_share_scope?` for capture/share/takeover commands. |
| `UCC-066` through `UCC-072` | Terminal and dev-session command families in this catalog. | `terminal_session_id?`, `pane_id?`, `dev_session_id?`, `command_ref?`, and `layout_target?` for focus, rerun, split, reveal, and recovery commands. |
| `UCC-073` through `UCC-076` | Chat message, code-block, rewind/revert, and activity-dimension command families in this catalog. | `thread_id`, `message_id?`, `code_block_id?`, `checkpoint_ref?`, and `activity_dimension?` for the concrete action. |
| `UCC-077` through `UCC-083` | Debug, web/slash dispatcher, web activity, reserved slash alias, and route-mapping command families in this catalog. | `thread_id`, `debug_session_id?`, `web_operation_id?`, `slash_command_id?`, `route_target?`, and `provider_route_ref?`; retired slash labels must normalize before dispatch. |
| `UCC-084` through `UCC-088` | Memory, artifact side-panel, and search command families in this catalog. | `memory_item_id?`, `artifact_id?`, `ledger_ref?`, `query_session_id?`, `replacement?`, and `index_scope?` as required by the concrete command. |
| `UCC-089` through `UCC-095` | Runtime recovery command family in this catalog. | `run_id`, `blocked_sequence`, `allowed_action_id`, `node_id?`, `attempt_id?`, `safe_point_id?`, `baseline_ref?`, and `permission_carry_ref?`; pre-attempt blocked rows MUST NOT fabricate an `attempt_id`. |
| `UCC-096` through `UCC-100` | Goal, Planning Wizard, Plan Compile, discovery-routed search, and history wrapper command families in this catalog. | `goal_id?`, `thread_id?`, `planning_session_id?`, `plan_pack_ref?`, `plan_compile_run_id?`, `history_query_ref?`, and `target_identity_ref?` for the concrete command. |
| `UCC-101` through `UCC-106` | Vision bridge, Teach, notification/sound, DRY settings, containerized host, and onboarding command families in this catalog. | `image_ref?`, `teach_session_id?`, `notification_destination_id?`, `sound_asset_id?`, `settings_key?`, `host_capability_ref?`, `host_profile_id?`, and `onboarding_step_id?` for the concrete command. |

Compatibility-only source tokens in these rows remain searchable lineage. They do not become command IDs until the row's `command_id` rule maps them to a concrete `cmd.*` value or to an explicit `alias_of_command_id`.

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Usage route/open commands to object-first UsageRecord identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### UCC-109 - Usage Route Payload And Legacy Chat Usage Alias Contract

```yaml
plan_unit_id: UCC-109
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Usage navigation commands normalize to object-first route/open identity. `cmd.nav.open_usage_subject`, `cmd.artifacts.show_in_usage`, and `cmd.artifacts.show_in_ledger` carry route_target and OpenSubject plus usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health where available. When usage_event_ref is present, route_target.object_kind is `usage_event` and route_target.object_id is the canonical usage event id. The retired `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` tokens are compatibility aliases only; production wiring must not register them as canonical UICommand rows, and legacy callers normalize to `cmd.nav.open_usage_subject` or the thread Context Detail Pane command family before dispatch.
gui_related: true
gui_classification_reason: Usage route/open commands determine user-visible navigation from chat, artifacts, ledger, and command palette surfaces.
depends_on: [UCC-060, UCC-086, ACD-434, F3-418, UF-087, RAP-043, CV-316]
unblocks: [WM-043]
acceptance_criteria:
  - "`cmd.nav.open_usage_subject` and artifact Usage/Ledger commands preserve usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health when present."
  - Payload validation fails when a Usage route with usage_event_ref does not normalize to route_target.object_kind = usage_event and a stable object_id.
  - Legacy callers citing `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, or `cmd.chat.close_thread_usage` normalize before dispatch and never emit those IDs as canonical production command_id values.
  - "`cmd.chat.open_thread_context_details`, `cmd.chat.focus_thread_context_details`, and `cmd.chat.close_thread_context_details` remain the thread Context Detail Pane commands; they are not aliases for app-wide Usage."
  - Timestamp, run-only, thread-only, or tier-only payloads may narrow filters but cannot satisfy the primary Usage route identity when usage_event_ref is available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future UI command payload fixture suite
risk_class: usage_command_route_identity_drift
reasoning_tier: high
context_scope: usage_route_command_contract
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: usage_route_payload_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md:786-801"
  - "Plans/UI_Command_Catalog.md:1119-1123"
  - "Plans/UI_Command_Catalog.md:8088-8116"
  - "Plans/Runtime_Artifacts_Panel.md:281-316"
  - "Plans/runtime_artifact_cost_usage.schema.json:510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "Plans/Wiring_Matrix.production.json:2674"
  - "Plans/Wiring_Matrix.production.json:3664"
  - "Plans/Wiring_Matrix.production.json:4819"
preserved_exact_tokens:
  - cmd.nav.open_usage_subject
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.show_in_ledger
  - cmd.chat.open_thread_usage
  - cmd.chat.focus_thread_usage
  - cmd.chat.close_thread_usage
  - route_target.object_kind
  - usage_event
  - OpenSubject
  - raw_payload_ref
negative_constraints:
  - Do not register retired chat usage IDs as canonical production UICommands.
  - Do not route Usage by timestamp, run-only, thread-only, or tier-only filters when usage_event_ref is available.
  - Do not drop provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, or raw_payload_ref during artifact/usage drill-through.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```

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

### Settings home bloom and suggestion commands

These rows do not alter the registry-owned non-command convention for setting mutations (F3-438/F3-439/F3-441): `bloom.open` is an open/deep-link surface command in the mold of `cmd.settings.open_notifications`, `category.reset` is a command-shaped bulk action behind the F3-434 two-step confirmation, and `suggestion.dismiss` is the F3-437 per-card dismiss control.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.settings.bloom.open` | Open Category Bloom | Opens a category bloom modal, optionally deep-linked via `open(category, focusSettingId)`; a focus target scrolls into view and flash-highlights; reduced motion opens without the morph. | `settings_registry_loaded` | `shell_view` |
| `cmd.settings.category.reset` | Reset Settings Category | Resets every setting in a category to registry defaults; two-step: first activation arms confirmation, second activation within the timeout resets, timeout expiry disarms without resetting. | `category_bloom_open` | `domain_action` |
| `cmd.settings.suggestion.dismiss` | Dismiss Suggested Setting | Dismisses a Suggested-shelf entry; persists at `settings_suggestions_dismissed:v1`, project-scoped when the driving signal was project-scoped, 90-day expiry, fully local. | `suggestion_visible` | `domain_action` |

ContractRef: ContractName:Plans/FinalGUISpec.md

### Docker container start and Unraid template commands

`cmd.docker.container.start` completes the reserved `cmd.docker.container.*` lifecycle subfamily beside `stop` and `restart`. The template rows register the Unraid template flows the 2.5A operational coverage text names (`/auth/template`, `/publish/template`); template publish is gated by the `domain.image_publish` permission class, which is never implied by local build approval.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.docker.container.start` | Start Container | Starts a stopped container by `container_ref`; distinct from `cmd.docker.run`, which creates a container from an image. | `container_stopped && capability_snapshot_current` | `domain_action` |
| `cmd.docker.template.commit` | Commit Unraid Template | Commits Unraid template changes to the template repository with template identity and receipt evidence. | `template_dirty && capability_snapshot_current` | `domain_action` |
| `cmd.docker.template.push` | Push Unraid Template | Publishes the Unraid template; requires the `domain.image_publish` permission class. | `template_committed && permission_allowed` | `domain_action` |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md

### Source Control pull request commands

Panel-scoped PR actions are first-class Source Control route commands with exact SCM context payload (repo, worktree, compare target, baseline, run/attempt lineage) per the 2.5A operational wiring requirements. They are distinct from the thread-bound `cmd.chat.worktree.pr` / `cmd.chat.worktree.merge` rows (UCC-058), which stay assistant-thread-scoped.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.source_control.pr.create` | Create Pull Request | Creates a pull request from the Source Control panel with repo, source worktree/branch, target branch, and compare payload; deterministic disabled state for missing scopes, expired auth, or no GitHub remote. | `github_auth_valid && github_remote_present` | `domain_action` |
| `cmd.source_control.pr.merge` | Merge Pull Request | Merges the selected pull request; protected-branch mutation routes the `domain.git_destructive_remote` permission class. | `pr_open && merge_allowed && github_auth_valid` | `domain_action` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

## Case L command registration and storage-gate propagation - 2026-07-17

This section is the exclusive catalog-owner registration for the approved Case L durable-state controls. The registration is mechanically required by `UIW-002` and `UIW-003`: each approved interactive control emits exactly one typed UICommand and no UI surface calls a storage, FileSafe, Worktree, Executor, or Chat owner directly. It consumes the approved owner contracts and creates no second storage algorithm, restore engine, retention policy, EventRecord envelope, or product choice.

The global storage gate applies before command-local permission or business validation on every dispatch path, including direct handlers. An unknown/missing access result fails closed. A mutation-capable command requires `storage_access_mode = writer` unless its row below is an explicitly admitted recovery-shell control. In `viewer`, only frozen/manual-refresh inspection, read-only search/copy/export/navigation, and visibly ephemeral view-local state are allowed; durable/runtime/external mutation returns `storage_read_only`. A returned writer posture never automatically replays a blocked command. An unsupported/newer store is metadata-diagnostics-only and exposes only the owner intents `check_for_update | choose_compatible_backup | open_diagnostics | quit`, not a live viewer or mutation command.

Case L domain actions carry an idempotency identity in the UICommand envelope even when the row's domain arguments do not repeat it. For the app-root lifetime, a replay with the same `(scope_partition, event_type, idempotency_key)` and semantic digest returns the original owner result; a conflicting digest fails closed and appends nothing. Every persisted event uses Contracts-owned EventRecord `schema_version = 2.0.0`, `scope_kind`, and conditional `project_id`; the catalog never builds a local event envelope.

### Storage access, root recovery, navigation, retention, and project deletion rows

These are the seventeen stable Case L IDs forced by approved controls. `storage.legal_hold.manage` remains the protected owner permission/action token; the UICommand is separately named `cmd.storage.legal_hold.manage`.

| Command ID | Args schema and normalization | Owner precondition / permission | Owner result and EventRecord v2 binding | command_kind |
|---|---|---|---|---|
| `cmd.storage.viewer.refresh` | `{ storage_instance_id, root_generation, captured_manifest_generation }`; direct storage viewer action | `storage_access_mode == viewer && compatible_snapshot_available` | Replaces only the captured frozen read snapshot/high-water mark; no durable mutation and no domain event. | `shell_view` |
| `cmd.storage.try_write_mode` | `{ storage_instance_id, logical_root_fingerprint, root_generation, captured_manifest_generation }`; storage admission action | `storage_access_mode == viewer && storage_mode_reason == lock_held`; ordinary permission checks still apply | Closes readers and reruns continuity, safety, version, integrity, generation, OS-lock, recovery, and migration admission. Returns the owner `storage_access_mode`/`storage_mode_reason`; emits only a Contracts-registered application-scoped recovery event such as `storage.boot_recovery` when that owner operation actually occurs. It never auto-resumes work. | `domain_action` |
| `cmd.storage.retry` | `{ storage_instance_id, logical_root_fingerprint, root_generation, storage_io_class }`; storage admission action | `storage_mode_reason == storage_io_exhausted`; only the explicit user probe is admitted | Revalidates writeability, root identity, versions, integrity, lock, and checkpoints and returns the owner access status. It repairs no bytes and never auto-replays a blocked command; owner recovery evidence, if produced, is application-scoped EventRecord 2.0. | `domain_action` |
| `cmd.storage.root.use_previous` | `{ expected_bootstrap_binding_sha256, previous_storage_instance_id, previous_root_ref }`; root-recovery action | `storage_mode_reason == root_mismatch && previous_root_reachable && permission_allowed` | Revalidates and reuses the previously bound root without deleting/overwriting another root; consumes owner receipt/status. No unregistered event type is invented. | `domain_action` |
| `cmd.storage.root.choose` | `{ expected_bootstrap_binding_sha256, candidate_root_ref }`; root picker plus owner preflight | `storage_mode_reason == root_mismatch && permission_allowed` | Selects one candidate for owner continuity/version/integrity validation; selection alone is not writer authority and never initializes an empty root. | `domain_action` |
| `cmd.storage.root.copy_and_switch` | `{ expected_bootstrap_binding_sha256, source_storage_instance_id, source_root_generation, source_root_ref, destination_root_ref }`; relocation action | `storage_mode_reason == root_mismatch && source_verified && destination_preflight_passed && permission_allowed` | Runs copy-validate-switch with binding update last and retains the verified source as recovery copy. Returns the owner relocation receipt/status; no peer event is minted. | `domain_action` |
| `cmd.storage.root.start_new_instance` | `{ expected_bootstrap_binding_sha256, expected_prior_storage_instance_id?, confirmation_strength: "strong" }`; new-instance recovery action | `storage_mode_reason == root_mismatch && strong_confirmation_complete && permission_allowed` | Mints a new `storage_instance_id`, preserves prior binding history, and never overwrites/deletes the prior root. A stale binding refuses before creation. | `domain_action` |
| `cmd.storage.fallback.return_fast_forward` | `{ storage_instance_id, fallback_branch_id, fallback_base_sha256, logical_root_fingerprint, expected_logical_base_sha256 }`; fallback reconciliation action | `fallback_active && logical_root_matches_fallback_base && permission_allowed` | Runs only the owner fast-forward copy-validate-switch. `fallback_diverged` refuses this command; no automatic merge/overwrite exists and both stores remain recoverable. | `domain_action` |
| `cmd.storage.fallback.keep_logical_root` | Closed `StorageFallbackDispositionRequest` keep variant: common fields only, with `command_id = "cmd.storage.fallback.keep_logical_root"` and `confirmation = "retain_fallback_and_select_logical"`; direct recovery-shell action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "retain_fallback_and_select_logical" && !operation_in_progress` | Dispatches only `handlers::storage::fallback_keep_logical_root`; consumes `StorageFallbackDispositionResult`, retains both roots, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.fallback.fork_new_instance` | Closed `StorageFallbackDispositionRequest` fork variant: common fields only, with `command_id = "cmd.storage.fallback.fork_new_instance"` and `confirmation = "create_inactive_candidate_without_switch"`; direct recovery-shell action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "create_inactive_candidate_without_switch" && !operation_in_progress` | Dispatches only `handlers::storage::fallback_fork_new_instance`; consumes `StorageFallbackDispositionResult`, returns only the inactive candidate binding without changing active bootstrap selection, retains both roots, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.fallback.export_both` | Closed `StorageFallbackDispositionRequest` export variant: common fields plus only `destination_ref` and `encryption_key_ref`, with `command_id = "cmd.storage.fallback.export_both"` and `confirmation = "encrypt_exact_bytes_and_retain_sources"`; direct recovery-shell export action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "encrypt_exact_bytes_and_retain_sources" && destination_available && encryption_key_available && !operation_in_progress` | Dispatches only `handlers::storage::fallback_export_both`; consumes `StorageFallbackDispositionResult`, returns output `export_custody` for the encrypted exact-byte package, retains both roots until separate cleanup, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.open_value` | `{ storage_instance_id, root_generation, store_family_id, value_key_ref, route_target, open_subject }`; normalizes to `route_target`/`OpenSubject` | compatible captured value is readable under ordinary read/export permission | Opens exact redacted owner-resolved identity at the captured high-water mark; raw path is never authority and no state changes. | `navigation_wrapper` |
| `cmd.storage.open_root` | `{ storage_instance_id, root_generation, root_kind, root_ref, route_target, open_subject }`, where `root_kind = logical_root | active_root | relocation_source | fallback_recovery_copy`; normalizes to `route_target`/`OpenSubject` | exact retained root identity is safely revealable under ordinary read/export permission | Reveals/navigates to the exact target only; it cannot select authority, promote writer mode, initialize, relocate, clear a hold, or fall back to an empty surface. | `navigation_wrapper` |
| `cmd.storage.legal_hold.manage` | `{ scope_kind, project_id?, hold_id, action, semantic_scope_ref, reason, expected_hold_sha256? }`, `action = set | clear` | `storage_access_mode == writer && permission(storage.legal_hold.manage) && reason_present && retention_hold_record_available` | Produces the durable `retention_hold_record` receipt plus `storage.retention_hold_changed` EventRecord 2.0 with `scope_kind = application | project` and matching conditional `project_id`. Holds compose by union and never clear automatically. | `domain_action` |
| `cmd.storage.compaction.request` | `{ storage_instance_id, retention_policy_ref, reason? }`; owner-admitted maintenance request only | `storage_access_mode == writer && permission_allowed && storage_maintenance_operation_available && maintenance_lease_available` | Requests owner evaluation; it never directly compacts or bypasses holds/anchors/refs. Accepted lifecycle uses application-scoped `storage.compaction_lifecycle_changed` EventRecord 2.0 and the `storage_maintenance_operation` row. | `domain_action` |
| `cmd.settings.open_storage_retention` | `{ project_id?, route_target, open_subject }`; navigation to `Advanced > Storage & Retention` | settings inventory and route target are available | Opens the owner-backed Settings surface. Individual settings remain registry-owned/non-command values; this command changes no retention value and emits no domain event. | `navigation_wrapper` |
| `cmd.project.delete_data` | `{ project_id, expected_project_data_sha256, confirmation_strength: "strong", reason? }`; destructive project-data intent, distinct from `cmd.project.remove` | `storage_access_mode == writer && project_data_enumerated && strong_confirmation_complete && permission_allowed && storage_deletion_record_available` | Persists the project-scoped `storage_deletion_record` and `storage.deletion_lifecycle_changed` EventRecord 2.0, removes project content only through owner compaction, and blocks on ambiguous/cross-project reachability or holds. It never means Remove project from list. | `domain_action` |

`cmd.chat.delete` remains the sole catalog thread-delete ID; the planning alternate spelling is not a second registration. It requires explicit confirmation of immediate logical removal, purge within 24 hours unless held, indefinite content-free tombstone, and backup-byte retention up to 30 days unless held. It binds to project-scoped `storage_deletion_record` and `storage.deletion_lifecycle_changed`; message-level delete remains unsupported. `cmd.project.remove` remains list-only, while `cmd.project.delete_data` is the separately confirmed data-purge intent.

Both deletion commands consume the Storage-owned lifecycle without directly purging or clearing holds. Owner progress is `requested -> logically_hidden`, then `logically_hidden -> held|purge_pending`, `held -> purge_pending` only after every owner-cleared hold and complete eligibility revalidation, and `purge_pending -> purged` only after verified committed successor-generation authority; `purged` is terminal. `compaction_generation` is absent outside `purge_pending|purged`, optional non-negative integer for `purge_pending`, and required non-negative integer for `purged`. `failed` is admitted only from `requested|logically_hidden|purge_pending`, requires non-empty reason, remains fenced, and retries with the same deletion/idempotency identity only after holds, tombstone, scope, storage-writer posture, and purge/compaction authority are revalidated. Refusal, ambiguity, replay, hold, and unavailable authority append no duplicate success event and perform no purge.

The three divergence dispositions consume the Contracts-owned closed `StorageFallbackDispositionRequest` exactly. Common required fields are `command_id`, `idempotency_key`, `actor_ref`, `confirmation`, `expected_storage_instance_id`, `expected_logical_root_fingerprint`, `expected_root_generation`, `expected_fallback_branch_id`, `expected_fallback_base_ref`, `expected_logical_head_sha256`, `expected_fallback_head_sha256`, and `expected_bootstrap_binding_sha256`. Keep and fork allow only those common fields. Export adds only `destination_ref` and `encryption_key_ref`; additional or wrong-variant fields are invalid. The required `confirmation` constants are respectively `retain_fallback_and_select_logical`, `create_inactive_candidate_without_switch`, and `encrypt_exact_bytes_and_retain_sources`. `expected_root_generation` is a nonnegative integer; instance and branch IDs use their owner UUID identities; `expected_fallback_base_ref` is the immutable owner ref and never a raw path. `expected_logical_root_fingerprint` and every `*_sha256` value are lowercase 64-hex SHA-256. The sole storage handler revalidates every CAS component immediately before any effect; a missing, malformed, or changed component returns `state_changed` and performs no authority change, fork, export, cleanup, or receipt of success.

Every command consumes the same closed `StorageFallbackDispositionResult`. Its required fields are `command_id`, `idempotency_key`, `outcome`, `reason_code`, `storage_access_mode`, `storage_mode_reason`, `active_bootstrap_binding_sha256`, `logical_head_sha256`, `fallback_head_sha256`, `retained_logical_root_ref`, `retained_fallback_root_ref`, `binding_changed`, `cleanup_performed`, `owner_receipt_ref`, `candidate_binding`, and `export_custody`; both variant fields are required-present and nullable. `outcome` is exactly `applied | replayed | refused | failed_recoverable`. Applied/replayed returns use `reason_code = null` and a non-null owner receipt. Refusal reasons are limited to `invalid_request | permission_denied | confirmation_required | state_changed | idempotency_conflict | operation_in_progress | invalid_destination`; recoverable-failure reasons are limited to `integrity_failure | storage_io_exhausted | encryption_unavailable | custody_verification_failed`. Keep success has `binding_changed = true` and both variants null. Fork success has `binding_changed = false`, `export_custody = null`, and only the closed inactive `candidate_binding`; the active bootstrap binding is unchanged. Export success has `binding_changed = false`, `candidate_binding = null`, and only the closed output `export_custody`; its `manifest_ref` is custody evidence produced by the owner, never request input, and the active binding and both source heads remain unchanged. Refused/failed_recoverable results set both variants null, claim no binding change or cleanup, and use only owner reason codes. `cleanup_performed` is always false, and both root refs remain retained.

Each disposition is independently permissioned and requires its command-specific typed `confirmation` value. The UI names the exact two retained roots, the selected disposition, and for export the destination/key refs before dispatch; it presents output manifest custody only after a successful owner result. Disabled reasons are closed to `fallback_not_diverged | state_changed | integrity_failure | permission_denied | confirmation_required | operation_in_progress | required_family_unavailable`, with `destination_unavailable | encryption_key_unavailable` additionally admitted only for export. The command-envelope `(command_id, idempotency_key, semantic_digest)` is the owner receipt identity: replay returns the same `StorageFallbackDispositionResult` and `StorageFallbackResolutionReceipt`, while an identity reused with different CAS or export content refuses. `StorageFallbackResolutionReceipt` is the sole durable audit artifact. All three rows MUST NOT emit or imply `storage.fallback_reconciled`, a generic command-applied event, or any other EventRecord family. `cmd.storage.fallback.return_fast_forward` remains a separate unchanged-base action and is never an alias for a divergence disposition.

The catalog consumes the owner enums without aliases: `storage_access_mode = writer | viewer | blocked`; `storage_mode_reason = normal | lock_held | lock_indeterminate | unsupported_store_version | unsafe_filesystem_no_fallback | storage_io_exhausted | root_mismatch | root_unavailable | fallback_diverged`; and `storage_io_class = interrupted | transient_busy | capacity_exhausted | quota_exhausted | read_only_media | permission_denied | device_unavailable | lock_conflict | integrity_failure | invalid_path`. Only `interrupted` (at most three immediate adapter attempts) and `transient_busy` (exactly once after 250 ms) receive owner automatic retry; command dispatch adds no retry budget and unknown storage I/O maps owner-side to `device_unavailable`.

Closed Case L storage dispatch reasons consumed by these rows are the owner tokens `storage_read_only | storage_io_exhausted | unsupported_store_version | root_mismatch | root_unavailable | fallback_diverged | permission_denied | operation_in_progress | state_changed | integrity_failure | invalid_path`. A missing/deferred/ambiguous/unsupported required machine family returns `required_family_unavailable`. Root-binding/hash or captured-generation change returns `state_changed`. Unknown/malformed command or owner state blocks without mutation. Recovery-shell exceptions admit only the exact state named in their row; they do not weaken the global write gate.

No catalog ID exists for generic verify, repair, salvage, Doctor mutation, force-open, `try_anyway`, force-cancel, rollback-now, skip-step, arbitrary retry, automatic merge/overwrite, in-place downgrade, or live newer-store viewing. `cmd.storage.compaction.request` is not direct compaction, and no retention command infers destructive eligibility from prefix, key, path, filename, mtime, ordering, or focus.

ContractRef: ContractName:Plans/storage-plan.md#Case-L-3, ContractName:Plans/storage-plan.md#Case-L-4, ContractName:Plans/Commands_System.md#0.3, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage_value_registry.json, ContractName:Plans/UI_Wiring_Rules.md#UIW-002, ContractName:Plans/UI_Wiring_Rules.md#UIW-003

### Exact recovery, Chat revert, and conversation restore-point command contracts

| Command ID | Normalization / exact domain arguments | Required registry families and scope | Result, EventRecord, and idempotency |
|---|---|---|---|
| `cmd.runtime.restore_safe_point_then_retry` | Canonical runtime action; `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point" }` | `safe_point_record`, `safe_point_restore_transaction`, `recovery_anchor_record`; project scope | FileSafe outcome is exactly `restored_clean | restore_skipped | restore_refused | restore_failed | restore_recovery_required`; only the first two with equality and durable baseline receipt can admit a successor attempt. Producer emits project-scoped `safe_point.restored` EventRecord 2.0 once by command-envelope idempotency identity. |
| `cmd.runtime.retry_now` | Canonical runtime action; common blocked identity plus the conditionally exact `baseline_target` row above | matching target families/receipts; project scope | Same target-specific owner result and durable baseline admission; no target is inferred and no automatic retry occurs. |
| `cmd.runtime.start_fresh_attempt` | Canonical runtime action; common blocked identity plus the conditionally exact `baseline_target` row above | matching target families/receipts; project scope | Same target-specific owner result; a new attempt is minted only after durable postcondition/receipt and never reuses the prior `attempt_id`. |
| `cmd.orchestrator.safe_point_retry` | `normalization.kind = wrapper`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`, `alias_of_command_id = null`; accepts the canonical domain fields plus optional `permission_snapshot_id` | same safe-point families and project scope | Admission validates the optional permission snapshot against current permission state, consumes it, and dispatches the exact canonical payload to `handlers::runtime::restore_safe_point_then_retry`. Result, effects, `safe_point.restored` producer, idempotency, and admission are identical to the runtime action. |
| `cmd.orchestrator.restore_safe_point_then_retry` | `normalization.kind = compatibility_alias`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`, `alias_of_command_id = cmd.orchestrator.safe_point_retry`; accepts the same wrapper input and applies the identical deterministic transform | same safe-point families and project scope | Dispatches the exact canonical payload to `handlers::runtime::restore_safe_point_then_retry` and returns the identical runtime result; no second handler, event, effect, admission, or idempotency domain. |
| `cmd.chat.revert` | Canonical Chat action; `{ project_id, thread_id, target_message_id?, repo_id, worktree_id, expected_turn_manifest_sha256 }`; Chat resolves one immutable whole-turn mutation record | FileSafe snapshot/transaction custody plus matching recovery holds; project scope | Same FileSafe outcome/equality/restart truth as safe-point restore. FileSafe maps its snapshot wrapper to the Contracts-owned project-scoped safe-point restore family; no `restore_point.*` event and no transcript rewind. `no_eligible_mutating_turn` creates no transaction. |
| `cmd.chat.create_restore_point` | Canonical Chat lifecycle action; `{ project_id, thread_id, source_message_id, idempotency_key }` | `restore_point_record` at `rp:{project_id}:{restore_point_id}`; project scope | Freezes one inclusive source message boundary and produces `restore_point.created` EventRecord 2.0 with immutable status `available`. Equal identity plus equal semantic content returns the original record; conflicting content is refused without overwrite. It stores conversation/provenance/attachment/citation refs and hashes, never workspace file bodies, secrets, ephemeral stream state, or queued messages. |
| `cmd.chat.branch_from_restore` | Canonical Chat lifecycle action; `{ project_id, restore_point_id, source_thread_id, expected_restore_point_sha256, new_thread_title? }` | `restore_point_record`; project scope | Before creation discloses the exact source thread/branch/message boundary, running/dirty source state, and new target. Result is exactly `branched | refused | failed`; only `branched` creates new `thread_id`/conversation `branch_id` and emits exactly one `restore_point.applied` EventRecord 2.0. Replay returns the recorded result and same target IDs without a duplicate event. `refused`/`failed` return no target IDs and emit no event. Every first execution and replay leaves source thread/branch/worktree/files/Git/index/queue/safe points unchanged. |
| `cmd.chat.delete_restore_point` | Canonical Chat lifecycle action; `{ project_id, restore_point_id, expected_restore_point_sha256 }` | `restore_point_record` plus descendant-branch, application, preserve, legal-hold, in-flight, and source-lineage refs; project scope | May transition only exact-hash `available` to `deleted` and emit `restore_point.deleted` EventRecord 2.0 after permission/writer/hold preflight. A protected record stays available and delete is refused; replay returns the recorded result. It never clears a hold, consumes an application, or deletes source thread/worktree/files. |

Restore-point status is closed to immutable `available -> expired | deleted | corrupt`; successful application is not a lifecycle transition and does not consume the record. Current policy is `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0`: expiry eligibility is inclusive at owner-proven `reference_release + 7,776,000 seconds`, and count pressure at `2,048/project` selects only the oldest eligible record. Descendant branch/application refs, preserve/legal holds, in-flight application, source-lineage, live, recovery, backup, rollback, and maintenance refs override age and count eligibility until their owner-defined release evidence is durable. The catalog exposes no timer, undo, release inference, or hold-clear shortcut. A deleted source stays hidden: branch is permitted only while the exact frozen boundary and every required retained ref still verify, and otherwise returns `refused` with `source_deleted_content_unavailable`, creates no identity, reconstructs nothing from tombstone/backup projection, and leaves record status unchanged. Expired, deleted, corrupt, expected-hash-mismatch, source-content-unavailable, permission, `storage_read_only`, `storage_io_exhausted`, hold, `operation_in_progress`, and missing-family states remain inspectable with the exact unavailable reason but fail without a new thread or invalid mutation. The application result remains `branched | refused | failed`, not a FileSafe restore outcome. Create/branch/delete registrations remove the former `cmd.chat.branch_from_restore` ghost-ID blocker and remain separate from `cmd.chat.revert`.

The safe-point/Chat-revert closed conflict reasons are exactly `worktree_path_mismatch | branch_mismatch | head_mismatch | baseline_stale | snapshot_missing | snapshot_corrupt | snapshot_scope_unsupported | target_path_conflict | restore_conflict | concurrent_edit_conflict | historical_commit_missing | restore_recovery_required | canonicalization_failed | permission_denied`. Orchestrator availability may additionally expose `safe_point_missing | state_changed | operation_in_progress`; Chat may return `no_eligible_mutating_turn` before transaction creation. Unknown outcome/reason fails closed, retains fences/holds, emits no success, and routes to diagnostics.

ContractRef: ContractName:Plans/Commands_System.md#0.3, ContractName:Plans/Executor_Protocol.md#approved-baseline-target-retry-and-restore-lifecycle, ContractName:Plans/WorktreeGitImprovement.md#approved-exact-baseline-target-SCM-contract, ContractName:Plans/FileSafe.md#11.1.2b, ContractName:Plans/Contracts_V0.md#safe_point.restored, ContractName:Plans/storage_value_registry.json, DecisionID:PD-RSP-01, DecisionID:PD-RSP-04, DecisionID:PD-RSP-07, DecisionID:PD-RSP-08, DecisionID:PD-RSP-09

### UCC-110 - Run Graph Canvas Interaction Command Family

```yaml
plan_unit_id: UCC-110
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Run Graph canvas interaction commands are `cmd.run_graph.pan`, `cmd.run_graph.zoom`, `cmd.run_graph.drag_node`,
  `cmd.run_graph.open_minimap_target`, `cmd.run_graph.open_context_menu`, `cmd.run_graph.keyboard_navigate`,
  `cmd.run_graph.set_selection`, `cmd.run_graph.set_problems_filter`, and `cmd.run_graph.search`, adopting the ids
  named in Run_Graph_View.md RGV-017 and its repair addendum verbatim. Shared disabled reasons are graph_unloaded,
  modal_capture, read_only_layout, selection_locked, and permission_denied. All rows except drag_node are
  view-projection interactions that never mutate run, node, or projection state; drag_node requires editable layout
  mode. The problems filter is off by default, filters to attention_required, blocked, and degraded elements, resets
  on focused-run change, and is never persisted globally. Graph search highlights matches in place and does not
  rewrite focused-run state except through an explicit route.
gui_related: true
gui_classification_reason: Registers user-visible graph canvas pointer, keyboard, minimap, filter, and search commands.
depends_on: [RGV-017, OP-030, UCC-024]
unblocks: []
acceptance_criteria:
  - Every graph canvas interaction control dispatches one of the nine stable command IDs above.
  - Disabled states render with one of the five shared disabled reasons instead of hiding the control.
  - set_problems_filter is off by default, resets across focused-run changes, and never persists globally.
  - Non-drag rows mutate no run, node, or projection state; drag_node is unavailable outside editable layout mode.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: run_graph_command_catalog_gap
reasoning_tier: high
context_scope: run_graph_canvas_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: run_graph_canvas_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Run_Graph_View.md:1073"
  - "Plans/Run_Graph_View.md:1147-1210"
  - "Plans/Orchestrator_Page.md:2324"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.run_graph.pan"
  - "cmd.run_graph.zoom"
  - "cmd.run_graph.drag_node"
  - "cmd.run_graph.open_minimap_target"
  - "cmd.run_graph.open_context_menu"
  - "cmd.run_graph.keyboard_navigate"
  - "cmd.run_graph.set_selection"
  - "cmd.run_graph.set_problems_filter"
  - "cmd.run_graph.search"
  - "graph_unloaded"
  - "modal_capture"
  - "read_only_layout"
  - "selection_locked"
  - "permission_denied"
negative_constraints:
  - Do not mutate run, node, or projection state from view-projection interaction commands.
  - Do not persist the problems filter globally or across unrelated projects.
  - Do not mint differently spelled duplicates of the RGV-017 interaction ids.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Wiring_Matrix.md
```

### UCC-111 - Orchestrator Projection Actions And Safe Point Retry

```yaml
plan_unit_id: UCC-111
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Orchestrator projection-action commands are `cmd.orchestrator.safe_point_retry` (the OP-033 UI identity reconciled
  to the later Case L exact-restore contract), `cmd.orchestrator.copy_run_id`, `cmd.orchestrator.export_ledger`
  (OP-031), `cmd.orchestrator.set_seam_expansion`, and `cmd.orchestrator.set_evidence_filter`. Safe-point retry
  carries project/run/node/blocked/attempt, exact safe-point/repo/worktree, baseline_target safe_point,
  optional permission snapshot, and the command-envelope idempotency identity; requires the named confirmation modal before dispatch;
  preserves the four pre-modal disabled reasons safe_point_missing, state_changed, permission_denied, and
  operation_in_progress; and normalizes to cmd.runtime.restore_safe_point_then_retry. The compatibility alias
  cmd.orchestrator.restore_safe_point_then_retry has no second handler or authority. Ledger export serializes only the visible filtered
  projection with usage_event_ref provenance. Seam expansion and evidence filter are shell/view commands following
  the cmd.orchestrator.switch_tab subview convention and mutate no records.
gui_related: true
gui_classification_reason: Registers user-visible Orchestrator retry, export, clipboard, and subview commands.
depends_on: [OP-031, OP-033, UCC-023, UCC-089]
unblocks: []
acceptance_criteria:
  - No cmd.orchestrator.safe_point_retry dispatch occurs without the named confirmation modal.
  - Safe-point retry disabled reasons are exactly safe_point_missing, state_changed, permission_denied, and operation_in_progress.
  - The four availability reasons do not collapse later snapshot_corrupt, snapshot_scope_unsupported, concurrent_edit_conflict, baseline_stale, or restore_recovery_required outcomes.
  - Both Orchestrator spellings normalize to cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and exact repository/worktree/blocked identity.
  - Both spellings accept the same wrapper input; optional permission_snapshot_id is validated against current permission state and consumed before the exact canonical payload reaches handlers::runtime::restore_safe_point_then_retry.
  - Both spellings share the runtime result, safe_point.restored producer, effects, idempotency identity, and admission decision; no peer handler or receipt-only/no-event execution path exists.
  - Ledger export preserves usage_event_ref and usage_record_id provenance and exports no raw records, evidence payloads, or secrets.
  - Seam expansion and evidence filter commands are view-local and mutate no seam or evidence records.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: orchestrator_command_catalog_gap
reasoning_tier: high
context_scope: orchestrator_projection_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: orchestrator_projection_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Orchestrator_Page.md:2322"
  - "Plans/Orchestrator_Page.md:2453-2607"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.orchestrator.safe_point_retry"
  - "cmd.orchestrator.copy_run_id"
  - "cmd.orchestrator.export_ledger"
  - "cmd.orchestrator.set_seam_expansion"
  - "cmd.orchestrator.set_evidence_filter"
  - "safe_point_missing"
  - "state_changed"
  - "permission_denied"
  - "operation_in_progress"
negative_constraints:
  - Do not dispatch cmd.orchestrator.safe_point_retry without the named confirmation.
  - Do not create retry authority outside the runtime recovery family normalization.
  - Do not include raw records, evidence payloads, or secrets in ledger exports.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
```

### UCC-112 - Wizard And Plan Compile Replay Commands

```yaml
plan_unit_id: UCC-112
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Replay projection commands are `cmd.planning_wizard.replay` (PWIZ-020 Replay planning flow) and
  `cmd.plan_compile.replay` (OP-032 Plan Compile replay). Both are view-local shell_view commands: wizard replay
  rewinds the wizard presentation to intake over already-recorded planning state and leaves the live PlanningRun,
  ledger records, approvals, and any PlanCompileRun unchanged; compile replay steps or plays recorded compile waves
  read-only, never re-executes compilation, never creates or rebinds a PlanCompileRun, and labels frames as
  historical replay.
gui_related: true
gui_classification_reason: Registers user-visible wizard and compile replay controls as stable commands.
depends_on: [PWIZ-020, OP-032, UCC-097]
unblocks: []
acceptance_criteria:
  - Wizard replay performs no ledger mutations, requires no re-approval, and creates no new compile.
  - Compile replay mutates no compile records and presents frames labeled as historical replay.
  - Replay position and playback state are view-local and discarded with the view.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: replay_command_catalog_gap
reasoning_tier: standard
context_scope: replay_projection_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Planning_Wizard.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: replay_projection_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Planning_Wizard.md:1615-1670"
  - "Plans/Orchestrator_Page.md:2504-2556"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.planning_wizard.replay"
  - "cmd.plan_compile.replay"
  - "Replay planning flow"
  - "historical replay"
negative_constraints:
  - Do not re-execute compilation, create, rebind, or duplicate PlanCompileRuns from replay controls.
  - Do not mutate ledger state, approvals, or PlanningRun currentness from wizard replay.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Planning_Wizard.md
  - Plans/Orchestrator_Page.md
```

### UCC-113 - Permissions Settings Command Family

```yaml
plan_unit_id: UCC-113
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The Permissions settings command family adopts the ten ids named in Permissions_System.md verbatim:
  `cmd.permissions.open`, `cmd.permissions.create_project_rule`, `cmd.permissions.create_global_rule`,
  `cmd.permissions.update_rule`, `cmd.permissions.reorder_rule`, `cmd.permissions.delete_rule`,
  `cmd.permissions.revoke`, `cmd.permissions.pick_external_directory`, `cmd.permissions.validate_rule`, and
  `cmd.permissions.review_request`. Settings route is settings.permissions. Durable rule creation persists
  approval records that survive restart and remain revocable. The directory picker dispatch name is
  permissions.external_directory.pick with error codes external_directory_duplicate_path and
  external_directory_invalid_glob; reorder validation errors are rule_not_found, target_index_out_of_range, and
  scope_mismatch; save dirty state values are clean, dirty, saving, saved, save_failed, and
  conflict_refresh_required. review_request opens the canonical approval path with approval_scope_key and
  requesting_context; approve/decline decisions stay on the runtime HITL commands and are not permissions-family
  commands.
gui_related: true
gui_classification_reason: Registers user-visible permissions settings, rule CRUD, picker, review, and revocation commands.
depends_on: [UCC-010, UCC-023]
unblocks: []
acceptance_criteria:
  - Every Permissions settings GUI control routes through one of the ten stable command IDs.
  - Rule mutations persist through the atomic TOML write contract with loaded_config_hash conflict detection.
  - review_request opens the approval path without deciding it; approval decisions remain runtime HITL commands.
  - pick_external_directory surfaces duplicate-path and invalid-glob errors by their canonical codes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: permissions_command_catalog_gap
reasoning_tier: high
context_scope: permissions_settings_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: permissions_settings_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Permissions_System.md:8977-8990"
  - "Plans/Permissions_System.md:8723-8724"
  - "Plans/Permissions_System.md:1032"
preserved_exact_tokens:
  - "cmd.permissions.open"
  - "cmd.permissions.create_project_rule"
  - "cmd.permissions.create_global_rule"
  - "cmd.permissions.update_rule"
  - "cmd.permissions.reorder_rule"
  - "cmd.permissions.delete_rule"
  - "cmd.permissions.revoke"
  - "cmd.permissions.pick_external_directory"
  - "cmd.permissions.validate_rule"
  - "cmd.permissions.review_request"
  - "settings.permissions"
  - "permissions.external_directory.pick"
negative_constraints:
  - Do not mint permissions-family approve/decline commands; HITL decisions stay on cmd.runtime.approve and cmd.runtime.decline.
  - Do not bypass the atomic TOML persistence and conflict-detection rules from rule mutation commands.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Wiring_Matrix.md
```

### UCC-114 - Testing Panel Command Rows

```yaml
plan_unit_id: UCC-114
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Testing panel commands adopt the six ids named in Automated_Testing_System.md verbatim -
  `cmd.testing.open_panel`, `cmd.testing.watch_run`, `cmd.testing.cancel_run`, `cmd.testing.open_receipt`,
  `cmd.testing.open_failure`, and `cmd.testing.export_bundle` - and add `cmd.testing.run` for the Testing side
  panel run entry point (F3-451). Button states derive from TestRunReceipt.status: watch and cancel enable for
  queued or running, open receipt enables for any terminal state, and export bundle enables when
  log_artifact_refs[] or visual_artifact_refs[] is non-empty. cmd.testing.run dispatches through the canonical
  adapter execution path producing a TestAdapterInvocation and TestRunReceipt and stays unavailable until an
  adapter is configured, the capability probe returns available, the permission snapshot is current, and required
  fixtures exist. cmd.testing.open_panel is a navigation_wrapper normalizing to the side-panel switch route with
  panel_id testing.
gui_related: true
gui_classification_reason: Registers user-visible testing panel open, run, watch, cancel, receipt, failure, and export commands.
depends_on: [F3-451, UCC-014]
unblocks: []
acceptance_criteria:
  - Every Testing panel control routes through one of the seven stable command IDs.
  - Watch/cancel/open-receipt/export enablement derives from TestRunReceipt.status and artifact refs as specified.
  - cmd.testing.run produces TestAdapterInvocation and TestRunReceipt evidence and never claims PNC-019 lifecycle certification.
  - cmd.testing.open_panel normalizes to the panel-switch route instead of carrying panel state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_catalog_gap
reasoning_tier: high
context_scope: testing_panel_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: testing_panel_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md:1871-1875"
  - "Plans/Automated_Testing_System.md:1877-1881"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.testing.open_panel"
  - "cmd.testing.run"
  - "cmd.testing.watch_run"
  - "cmd.testing.cancel_run"
  - "cmd.testing.open_receipt"
  - "cmd.testing.open_failure"
  - "cmd.testing.export_bundle"
  - "TestRunReceipt"
negative_constraints:
  - Do not enable run/watch/cancel/export outside their TestRunReceipt.status and artifact-ref conditions.
  - Do not treat cmd.testing.run receipts as PNC-019 lifecycle certification evidence.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
```

### UCC-115 - Terminal Rule Coverage Completion Rows

```yaml
plan_unit_id: UCC-115
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Terminal coverage completion registers `cmd.terminal.reveal`, `cmd.terminal.terminate_session`,
  `cmd.terminal.kill_session`, and `cmd.terminal.reattach_section`, closing the Wiring_Matrix.md section 4.2
  reveal/terminate/kill/reattach coverage hole. terminate_session requests graceful shutdown, kill_session forces
  termination, and reattach_section returns a detached section to docked layout with preserved tab, pane, and
  session identity - all three adopted verbatim from the Wiring_Matrix.md terminal command table and WM-021.
  cmd.terminal.reveal reveals the bottom panel and terminal tab and scrolls the target session into view without
  spawning a duplicate shell. cmd.terminal.restart_replace remains the canonical restart row; the WM-021 token
  cmd.terminal.restart_session is owner-doc lineage for the same replace-with-new-runtime action and is not a
  second command.
gui_related: true
gui_classification_reason: Registers user-visible terminal reveal, terminate, kill, and reattach commands.
depends_on: [UCC-067, UCC-068]
unblocks: []
acceptance_criteria:
  - Rule 4.2 terminal coverage (reveal, show, rerun, split, close, clear, restart, terminate, kill, detach, reattach, focus-session) resolves to cataloged commands with production wiring rows.
  - terminate and kill remain distinct commands with distinct escalation semantics.
  - reattach_section preserves tab, pane, and session identity across the layout change.
  - reveal focuses the existing bound session and never spawns a duplicate shell.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: terminal_command_catalog_gap
reasoning_tier: high
context_scope: terminal_coverage_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_coverage_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md:216"
  - "Plans/Wiring_Matrix.md:433-436"
  - "Plans/Wiring_Matrix.md:1889-1943"
preserved_exact_tokens:
  - "cmd.terminal.reveal"
  - "cmd.terminal.terminate_session"
  - "cmd.terminal.kill_session"
  - "cmd.terminal.reattach_section"
negative_constraints:
  - Do not mint cmd.terminal.reattach or other differently spelled duplicates of the WM-021 ids.
  - Do not collapse terminate and kill into one command or imply a killed session remains live.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

### UCC-116 - Account Provider Route And Usage Projection Commands

```yaml
plan_unit_id: UCC-116
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Account, provider-route, and usage commands are `cmd.account.select_profile` (adopted verbatim from
  Multi-Account.md; disabled reasons auth_missing, auth_expired, profile_locked, provider_unavailable, and
  policy_denied; empty state copy id accounts.empty.no_profiles; switches land in append-only account_switch_event
  history), `cmd.provider.switch_route` (adopted verbatim from the FinalGUISpec.md CTA rate_limit row with
  provider_id and retry_after_ms), `cmd.usage.export` (scope snapshot or ledger; ledger rows preserve
  usage_event_refs; view export output never becomes canonical record truth), and `cmd.usage.refresh` (on-demand
  provider-route projection re-read; background refresh continues independently).
gui_related: true
gui_classification_reason: Registers user-visible account switching, provider re-route, and usage export/refresh commands.
depends_on: [MA-069, UCC-109]
unblocks: []
acceptance_criteria:
  - Account/profile rows activate cmd.account.select_profile by click and keyboard and surface the five per-action disabled reasons.
  - Provider re-route acceptance carries provider_id and retry_after_ms and changes no account auth silently.
  - Usage export output follows the record/bundle/view taxonomy and preserves usage_event_refs in ledger scope.
  - Usage refresh never blocks the UI and does not replace background refresh.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: usage_account_command_catalog_gap
reasoning_tier: high
context_scope: account_provider_usage_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: account_provider_usage_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Multi-Account.md:5088"
  - "Plans/FinalGUISpec.md:27233"
  - "Plans/usage-feature.md:69-70"
  - "Plans/usage-feature.md:137"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.account.select_profile"
  - "cmd.provider.switch_route"
  - "cmd.usage.export"
  - "cmd.usage.refresh"
  - "account_switch_event"
  - "accounts.empty.no_profiles"
negative_constraints:
  - Do not treat usage exports as canonical record truth or include unauthorized provider/account details.
  - Do not switch accounts or routes without recording the append-only switch history.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
```

### UCC-117 - Browser Pane Navigation Commands

```yaml
plan_unit_id: UCC-117
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Browser pane navigation commands are `cmd.browser.navigate` and `cmd.browser.reload`. Both operate on the
  embedded browser pane within the session-class policy from the Wiring_Matrix.md browser invariants
  (workspace_preview, detached_preview, automation_session), require `session_security_class=ordinary`, preserve
  session class and recovery identity (URL, tabs, originating session), and never reclassify a session. Protected
  AuthBrowserSession is not a generic navigation subject. `cmd.gui_dev_preview.reload` remains
  dev/test-build only and is not reused for production reload.
gui_related: true
gui_classification_reason: Registers user-visible browser pane URL navigation and reload commands.
depends_on: [UCC-061, UCC-063]
unblocks: []
acceptance_criteria:
  - Navigate and reload preserve ordinary session class and recovery identity and never auto-resume automation work.
  - Protected AuthBrowserSession returns `protected_session_forbidden` before handler dispatch and exposes no URL or content.
  - Navigation outside the session policy is unavailable with a projected disabled reason.
  - Production reload does not dispatch cmd.gui_dev_preview.reload.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: browser_command_catalog_gap
reasoning_tier: standard
context_scope: browser_pane_navigation_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_pane_navigation_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md (Browser session, capture, and recovery wiring invariants)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.browser.navigate"
  - "cmd.browser.reload"
negative_constraints:
  - Do not reuse cmd.gui_dev_preview.reload as the production browser reload.
  - Do not reclassify or auto-resume automation sessions from navigation commands.
  - Do not route protected AuthBrowserSession through generic navigate or reload commands.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
```

### UCC-118 - Projects List Lifecycle Commands

```yaml
plan_unit_id: UCC-118
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Projects list lifecycle commands are `cmd.project.archive` (reversible, never a disk delete),
  `cmd.project.remove` (removes the list entry without touching the working tree), `cmd.project.refresh`
  (rescans the projects list projection), and `cmd.project.open_settings` (opens the F3-442 Project Settings
  Modal through the route/open contract). Archive and remove carry confirmation_strength in their command
  contracts; their confirmation surfaces remain view state.
gui_related: true
gui_classification_reason: Registers user-visible projects list archive, remove, refresh, and settings commands.
depends_on: [F3-442, UCC-032]
unblocks: []
acceptance_criteria:
  - Archive is reversible and performs no disk deletion; remove never touches the working tree.
  - Refresh re-reads the list projection without mutating project records.
  - open_settings routes through route/open identity to the Project Settings Modal.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: project_command_catalog_gap
reasoning_tier: standard
context_scope: projects_list_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: projects_list_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/FinalGUISpec.md (F3-442)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.project.archive"
  - "cmd.project.remove"
  - "cmd.project.refresh"
  - "cmd.project.open_settings"
negative_constraints:
  - Do not delete project data from archive or remove; both are list-scope operations.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

### UCC-119 - Chat Composer Selector Queue And Web Operation Commands

```yaml
plan_unit_id: UCC-119
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Chat additions are `cmd.chat.web.cancel` and `cmd.chat.web.request_again` (web-operation card lifecycle in the
  cmd.chat.web family; approval decisions stay on cmd.runtime.approve and cmd.runtime.decline),
  `cmd.chat.switch_thread` (thread-list focus by thread_id completing the UCC-056 thread lifecycle family),
  `cmd.chat.queue.remove` (removes a queued, not-yet-dispatched composer message), `cmd.chat.platform` (requested
  platform owned by the assistant chat surface, no status-bar chip; applies next turn over the account-bound
  Provider -> models registry per ACD-437), and
  `cmd.chat.plan_thoroughness` (Light, Balanced, Comprehensive; default Balanced; distinct from effort High,
  Medium, Low per ACD-438; recorded as requested_plan_thoroughness and effective_plan_thoroughness).
gui_related: true
gui_classification_reason: Registers user-visible chat web-op, thread switch, queue, platform, and thoroughness commands.
depends_on: [ACD-035, ACD-437, ACD-438, UCC-056, UCC-082]
unblocks: []
acceptance_criteria:
  - Web-op cancel and request-again preserve web_operation_id provenance and never bypass the approval gate.
  - switch_thread focuses an existing thread without mutating it.
  - queue.remove affects only queued, not-yet-dispatched messages.
  - Platform and Plan Thoroughness selections apply next turn and stay distinct controls with distinct labels.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: chat_command_catalog_gap
reasoning_tier: high
context_scope: chat_composer_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: chat_composer_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/assistant-chat-design.md:23758-23870"
  - "Plans/assistant-chat-design.md:2604-2605"
  - "Plans/assistant-chat-design.md:5108-5147"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.chat.web.cancel"
  - "cmd.chat.web.request_again"
  - "cmd.chat.switch_thread"
  - "cmd.chat.queue.remove"
  - "cmd.chat.platform"
  - "cmd.chat.plan_thoroughness"
  - "requested_plan_thoroughness"
  - "effective_plan_thoroughness"
negative_constraints:
  - Do not mint web-specific approve/decline commands; decisions stay on cmd.runtime.approve and cmd.runtime.decline.
  - Do not merge Plan Thoroughness with effort or re-introduce a chat-header platform dropdown.
stale_retired_dispositions:
  - "Status-bar platform chip anchoring for cmd.chat.platform retired per PMConcept7 status-bar trim; the assistant chat surface owns requested-platform selection with applies-next-turn semantics (command ID, payload, and events unchanged)."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
```

### UCC-120 - Settings Home Bloom And Suggestion Commands

```yaml
plan_unit_id: UCC-120
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Settings home commands are `cmd.settings.bloom.open` (opens a category bloom modal with the F3-434 deep-link
  contract open(category, focusSettingId); focus targets scroll into view and flash-highlight; reduced motion
  skips the morph), `cmd.settings.category.reset` (two-step per-category reset: first activation arms
  confirmation, second activation within the timeout resets to registry defaults, timeout expiry disarms), and
  `cmd.settings.suggestion.dismiss` (per-card Suggested-shelf dismiss persisting at
  settings_suggestions_dismissed:v1 with project-or-global scoping and 90-day expiry, fully local). These rows do
  not change the F3-438/F3-439/F3-441 convention that individual setting mutations are registry-owned and
  command-less.
gui_related: true
gui_classification_reason: Registers user-visible settings bloom open, category reset, and suggestion dismiss commands.
depends_on: [F3-434, F3-436, F3-437, F3-441]
unblocks: []
acceptance_criteria:
  - bloom.open honors the deep-link contract and reduced-motion behavior.
  - category.reset never resets without the two-step confirmation completing inside the timeout.
  - suggestion.dismiss persists at settings_suggestions_dismissed:v1 with the F3-437 scoping and expiry and makes no network calls.
  - Individual setting mutations remain registry-owned and command-less.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: settings_command_catalog_gap
reasoning_tier: standard
context_scope: settings_home_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: settings_home_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/FinalGUISpec.md:28854-28900 (F3-434)"
  - "Plans/FinalGUISpec.md:29031-29080 (F3-437)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.settings.bloom.open"
  - "cmd.settings.category.reset"
  - "cmd.settings.suggestion.dismiss"
  - "settings_suggestions_dismissed:v1"
negative_constraints:
  - Do not convert registry-owned setting mutations into commands via these rows.
  - Do not perform a category reset without the completed two-step confirmation.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

### UCC-121 - Docker Container Start And Unraid Template Commands

```yaml
plan_unit_id: UCC-121
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Docker Manager additions are `cmd.docker.container.start` (starts a stopped container by container_ref,
  completing the reserved cmd.docker.container lifecycle subfamily beside stop and restart; distinct from
  cmd.docker.run which creates a container from an image), `cmd.docker.template.commit`, and
  `cmd.docker.template.push` (Unraid template commit and publish flows named by the operational coverage text).
  Template publish requires the domain.image_publish permission class, which is never implied by local build
  approval; mutating rows carry capability_snapshot_ref per the UCC-049 row identity.
gui_related: true
gui_classification_reason: Registers user-visible container start and Unraid template commit/push commands.
depends_on: [UCC-040, UCC-049, UCC-051]
unblocks: []
acceptance_criteria:
  - container.start targets container_ref identity and is unavailable for running containers.
  - Template commit and push are separate commands with separate receipts.
  - Template push is blocked without a domain.image_publish approval.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: standard
context_scope: docker_template_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: docker_template_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md (2.5A operational coverage: /auth/template, /publish/template)"
  - "Plans/Permissions_System.md (Domain-Sensitive Permission Classes)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.docker.container.start"
  - "cmd.docker.template.commit"
  - "cmd.docker.template.push"
  - "domain.image_publish"
negative_constraints:
  - Do not reuse cmd.docker.run for starting stopped containers.
  - Do not imply template publish permission from local build approval.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
```

### UCC-122 - Source Control Pull Request Commands

```yaml
plan_unit_id: UCC-122
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Source Control pull request commands are `cmd.source_control.pr.create` and `cmd.source_control.pr.merge`.
  Both are panel-scoped first-class route commands carrying exact SCM context payload (repo, worktree, compare
  target, baseline, run/attempt lineage) per the 2.5A operational wiring requirements, with deterministic
  disabled-state behavior for missing scopes, expired auth, or no GitHub remote. They are distinct from the
  thread-bound cmd.chat.worktree.pr and cmd.chat.worktree.merge rows, which remain assistant-thread-scoped.
  PR merge of protected branches routes the domain.git_destructive_remote permission class.
gui_related: true
gui_classification_reason: Registers user-visible Source Control panel PR create and merge commands.
depends_on: [UCC-044, UCC-058]
unblocks: []
acceptance_criteria:
  - PR create and merge carry the exact SCM context payload and GitHub auth disabled-state behavior.
  - Panel PR commands never impersonate or replace the thread-bound worktree PR commands.
  - Protected-branch merges are blocked without a domain.git_destructive_remote approval.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: source_control_command_catalog_gap
reasoning_tier: high
context_scope: source_control_pr_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_control_pr_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md (2.5A operational wiring requirements)"
  - "Plans/Permissions_System.md (Domain-Sensitive Permission Classes)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.source_control.pr.create"
  - "cmd.source_control.pr.merge"
  - "domain.git_destructive_remote"
negative_constraints:
  - Do not reuse thread-bound cmd.chat.worktree.pr or cmd.chat.worktree.merge for panel-scoped PR actions.
  - Do not merge protected branches without the domain-sensitive approval.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Permissions_System.md
```

### UCC-123 - Case L Storage Access Root And Navigation Commands

```yaml
plan_unit_id: UCC-123
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Case L registers the storage controls cmd.storage.viewer.refresh, cmd.storage.try_write_mode,
  cmd.storage.retry, cmd.storage.root.use_previous, cmd.storage.root.choose,
  cmd.storage.root.copy_and_switch, cmd.storage.root.start_new_instance,
  cmd.storage.fallback.return_fast_forward, cmd.storage.fallback.keep_logical_root,
  cmd.storage.fallback.fork_new_instance, cmd.storage.fallback.export_both,
  cmd.storage.open_value, and cmd.storage.open_root.
  Every direct handler consumes the owner writer/viewer/blocked gate; recovery controls rerun the
  exact owner preflight without automatic blocked-command replay; navigation carries stable
  storage/root/value refs plus route_target/OpenSubject and never selects authority; and fallback
  return is available only when the logical root still equals the immutable fallback base.
gui_related: true
gui_classification_reason: Registers visible viewer, recovery, root continuity, fallback, and storage navigation controls.
depends_on: [UIW-002, UIW-003, SP-238, SP-239, SP-240]
unblocks: []
acceptance_criteria:
  - Every durable, runtime, or external mutation path, including direct handlers, fails with storage_read_only outside writer mode unless it is the exact owner-admitted recovery control.
  - Viewer refresh changes only the frozen captured read snapshot; Try write mode and Retry storage rerun every owner gate and never replay blocked work.
  - Root mismatch exposes only use-previous, choose, copy-and-switch, and strongly confirmed new-instance actions; no empty-root initialization or prior-root overwrite occurs.
  - Fallback return is fast-forward-only with exact base equality; divergence cannot merge, overwrite, or continue writing.
  - Divergence exposes exactly keep_logical_root, fork_new_instance, and export_both with full component CAS revalidation, lowercase 64-hex hashes, distinct permission/confirmation, typed results, owner receipts, and both roots retained.
  - Fork returns only a candidate binding and never changes active bootstrap selection; export is encrypted exact-byte custody bound to explicit destination, non-secret manifest, and key refs.
  - open_value and open_root use stable identity and route/open contracts and cannot establish writer authority.
validation_surfaces:
  - future Case L viewer and direct-handler inventory
  - future root mismatch, relocation crash-cut, and fallback divergence fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_storage_command_gate_or_root_recovery_drift
reasoning_tier: high
context_scope: case_l_storage_access_root_navigation_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_storage_access_root_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L012-C1..L012-C4
  - Case-L:L014-C1..L014-C4
  - Case-L:L018-C1..L018-C3
  - Case-L:L011-C1..L011-C3
  - Plans/UI_Wiring_Rules.md:UIW-002..UIW-003
preserved_exact_tokens:
  - storage_read_only
  - Retry storage
  - Try write mode
  - fallback_diverged
  - storage_access_mode
  - cmd.storage.viewer.refresh
  - cmd.storage.try_write_mode
  - cmd.storage.retry
  - cmd.storage.root.use_previous
  - cmd.storage.root.choose
  - cmd.storage.root.copy_and_switch
  - cmd.storage.root.start_new_instance
  - cmd.storage.fallback.return_fast_forward
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
  - cmd.storage.open_value
  - cmd.storage.open_root
negative_constraints:
  - Do not add generic verify, repair, salvage, force-open, try_anyway, force-cancel, automatic merge, or automatic overwrite commands.
  - Do not infer root, lock, or value authority from a raw path, UI focus, stale projection, or visible enabled control.
  - Do not emit a new EventRecord family for a fallback-divergence disposition; audit is the storage-owner receipt only.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-124 - Case L Retention Hold Compaction And Deletion Commands

```yaml
plan_unit_id: UCC-124
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Case L registers cmd.storage.legal_hold.manage with the distinct protected authorization
  token storage.legal_hold.manage, cmd.storage.compaction.request as an owner-admitted request,
  cmd.settings.open_storage_retention as navigation, and cmd.project.delete_data as the strongly
  confirmed project-content purge intent distinct from cmd.project.remove. Existing cmd.chat.delete
  immediately performs logical deletion and requests physical content purge within 24 hours unless
  held while preserving a content-free tombstone and owner-governed receipts.
gui_related: true
gui_classification_reason: Registers visible retention, legal-hold, compaction-request, settings, and destructive deletion controls and confirmations.
depends_on: [UIW-002, UIW-003, SP-237, CV-319, UCC-056, UCC-118]
unblocks: []
acceptance_criteria:
  - Hold set and clear require storage.legal_hold.manage, actor identity, reason, expected state when supplied, and a durable retention_hold_record plus EventRecord v2 receipt.
  - Compaction request never directly compacts or bypasses holds, recovery/recent-run/live/backup/rollback/maintenance refs, registry policy, or the maintenance lease.
  - Storage and Retention settings navigation creates no peer setting command; registry-owned values enforce owner minima.
  - cmd.chat.delete discloses immediate logical removal, the 24-hour purge target, legal-hold delay, and content-free tombstone retention.
  - cmd.project.remove remains list-only and cmd.project.delete_data remains a separate strongly confirmed, project-scoped data-purge intent.
validation_surfaces:
  - future RET, CMP, DEL, and legal-hold command fixtures
  - future thread/project deletion confirmation and hold-blocked snapshots
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_retention_or_deletion_command_bypass
reasoning_tier: high
context_scope: case_l_retention_hold_compaction_deletion_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: case_l_retention_deletion_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-010
  - Case-L:L-015
  - Case-L:PD-L005-01..PD-L005-07
  - Case-L:PD-L015-01..PD-L015-05
preserved_exact_tokens:
  - storage.legal_hold.manage
  - cmd.storage.legal_hold.manage
  - cmd.storage.compaction.request
  - cmd.settings.open_storage_retention
  - cmd.chat.delete
  - cmd.project.remove
  - cmd.project.delete_data
  - storage.retention_hold_changed
  - storage.compaction_lifecycle_changed
  - storage.deletion_lifecycle_changed
negative_constraints:
  - Do not make legal hold an ordinary setting toggle or clear it automatically.
  - Do not make request mean direct compaction or infer destructive eligibility from names, paths, times, ordering, or focus.
  - Do not collapse Remove project from list into Delete Puppet Master project data or add message-level delete.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-125 - Case L Exact Baseline And Restore Command Contract

```yaml
plan_unit_id: UCC-125
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Runtime retry commands use the closed baseline_target values safe_point, historical_commit,
  and worktree_head with conditionally exact immutable inputs and owner effects. Safe-point restore
  exact-replaces the named worktree through FileSafe; historical commit preserves the source and
  creates a clean isolated worktree at the full commit OID; worktree head binds without mutation to
  the exact OID and state digest. cmd.orchestrator.safe_point_retry and its compatibility alias both
  normalize to cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and no
  independent handler, result, event, or idempotency authority.
gui_related: true
gui_classification_reason: Defines user-dispatched recovery payloads, confirmation, disabled states, and truthful outcomes.
depends_on: [UCC-089, UCC-090, UCC-095, UCC-111, F2-200, F2-201, F2-202, F2-203, CV-320]
unblocks: []
acceptance_criteria:
  - Every baseline value requires exactly its owner-defined immutable fields and rejects unknown/missing/stale/moving identities without substitution.
  - restore_safe_point_then_retry accepts only safe_point and is the only rerun verb when requires_safe_point_restore is true.
  - A successor attempt is admitted only after target postcondition, owner equality where applicable, and durable baseline/restore receipt.
  - restore_refused, restore_failed, and restore_recovery_required mint no successor; restored_with_conflicts is invalid for exact safe-point or Chat-revert operations.
  - Orchestrator wrappers preserve OP-033 confirmation/availability semantics but cannot collapse later corruption, scope, concurrency, baseline, or recovery-required reasons.
  - Wrapper and compatibility alias inputs differ from canonical args only by optional permission_snapshot_id; admission validates and consumes it, and both transforms produce exact canonical args for the sole runtime handler.
  - Runtime, wrapper, and alias share one result, safe_point.restored producer, effect set, idempotency identity, and admission decision; no peer handler or no-event execution path exists.
validation_surfaces:
  - RSP-BASELINE-001
  - RSP-BASELINE-002
  - RSP-BASELINE-003
  - RSP-BASELINE-004
  - RSP-ATOMIC-001
  - RSP-ATOMIC-003
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_baseline_or_restore_command_drift
reasoning_tier: high
context_scope: case_l_baseline_restore_command_contract
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_baseline_restore_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-020
  - Case-L:L-021
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-07
preserved_exact_tokens:
  - safe_point
  - historical_commit
  - worktree_head
  - historical_commit_oid
  - expected_head_oid
  - expected_state_sha256
  - restored_clean
  - restore_skipped
  - restore_refused
  - restore_failed
  - restore_recovery_required
  - cmd.orchestrator.safe_point_retry
  - cmd.orchestrator.restore_safe_point_then_retry
  - cmd.runtime.restore_safe_point_then_retry
negative_constraints:
  - Do not accept current or restore_point as baseline_target values.
  - Do not resolve abbreviated, branch, tag, remote, reflog, symbolic, moving, focused, latest, or substitute refs.
  - Do not expose a worktree as runnable before the durable baseline receipt exists.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-126 - Case L Chat Revert And Conversation Restore Point Commands

```yaml
plan_unit_id: UCC-126
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.revert resolves one immutable whole-turn mutation manifest and then uses FileSafe exact-
  replace, verified rollback, equality, restart, custody, and hold truth without transcript rewind or
  partial success. Conversation lifecycle separately registers cmd.chat.create_restore_point,
  cmd.chat.branch_from_restore, and cmd.chat.delete_restore_point against restore_point_record;
  branching creates new conversation thread/branch identity from one verified inclusive boundary,
  preserves source thread/branch/worktree/files/Git/index/queue/safe points, and treats optional
  safe_point_id as lineage only without file restore. Current policy is
  RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0: expiry eligibility is inclusive at owner-proven
  reference_release + 7,776,000 seconds; the maximum is 2,048 restore points per project; count
  pressure deletes only the oldest eligible restore point; and descendant branch/application refs,
  preserve/legal holds, in-flight application, source-lineage, live, recovery, backup, rollback, and
  maintenance refs override age and count eligibility and block deletion until their owner-defined
  release evidence is durable.
gui_related: true
gui_classification_reason: Registers user-facing Chat revert and restore-point create, branch, and delete controls with disclosures and outcomes.
depends_on: [UCC-075, F2-200, F2-201, F2-202, F2-204, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - Chat revert restores the complete multi-file turn or proves rollback/recovery-required as one transaction; no eligible turn creates no transaction.
  - Restore-point create persists an immutable available record and project-scoped restore_point.created EventRecord 2.0 with stable idempotency.
  - Create freezes one inclusive message boundary; equal identity/content returns the original and conflicting content is refused without overwrite.
  - Branch consumes the expected record hash and discloses source boundary/state/new target; only branched creates identity and emits exactly one restore_point.applied, while replay returns the same recorded target without a duplicate event.
  - Refused and failed return no target IDs and no restore_point.applied event; first execution and replay preserve source thread/branch/worktree/files/Git/index/queue/safe points.
  - Delete transitions only unprotected exact-hash available state, follows every hold/ref, never clears a hold, and never deletes the source thread, worktree, safe point, or descendant branch.
  - Restore-point status remains available, expired, deleted, or corrupt; successful application does not consume it, and RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0 expires only at the inclusive owner-proven release boundary or oldest-eligible count pressure after every overriding ref is released.
  - A deleted source remains hidden; missing retained boundary content returns source_deleted_content_unavailable without new identity or reconstruction.
validation_surfaces:
  - RSP-CHAT-001
  - RSP-RP-001
  - RSP-RP-002
  - RSP-RP-003
  - RSP-RP-004
  - RSP-CMD-001
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_chat_restore_identity_or_atomicity_drift
reasoning_tier: high
context_scope: case_l_chat_revert_restore_point_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: case_l_chat_restore_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-022
  - Case-L:PD-RSP-08
  - Case-L:PD-RSP-09
preserved_exact_tokens:
  - cmd.chat.revert
  - cmd.chat.create_restore_point
  - cmd.chat.branch_from_restore
  - cmd.chat.delete_restore_point
  - restore_point.created
  - restore_point.applied
  - available
  - expired
  - deleted
  - corrupt
  - branched
  - refused
  - failed
  - no_eligible_mutating_turn
  - source_deleted_content_unavailable
  - RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0
negative_constraints:
  - Do not combine conversation branch with FileSafe restore or treat a restore point as a baseline target.
  - Do not rewind transcript state, restore only part of a turn, consume a successful restore-point application, resurrect a deleted source, invent expiry, or mutate source conversation/worktree/file/SCM/queue/runtime-safe-point state.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum absorbs the command-ID census of the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source lineage only; concept HTML defines no commands) into catalog canon, following the PMConcept aliases-and-retirements precedent (2026-07-02) and the PMConcept6 census addendum mechanism (2026-07-16). Every prototype token is adjudicated in the reconciliation table below as canonical, alias-of a recorded target, newly registered, or retired; new canonical rows carry the full section 2.0 metadata contract (`command_kind`, availability class, confirmation class for destructive rows, `disabled_reason` codes from the closed set at the UCC-049..106 schema overlay, and owning panel/domain). In-catalog contradictions (Docker container lifecycle naming, compose alias targets, K8s context verbs, GitHub Actions open-in-browser triplication, panel detach naming, terminal focus) are adjudicated by the new PlanUnits below; no existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited, and supersession is expressed only through the new units' explicit amendment notes. The implementation base is the c2 concept files patched in place (user decision 2026-07-27). Destructive confirmations route through the shared confirm surface referenced by the unified expander row contract, which is owned outside this catalog; blocked states carry `blocked_reason_code` plus ordered `allowed_action_ids[]` mapping to `cmd.runtime.*` per UCC-093/UCC-094. Every row registered here remains incomplete until a production Wiring_Matrix.md section 4.2 row binds command id to handler, UI surface, and acceptance checks. This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Structural repair recorded here: the GitHub Actions command family table in section 2.4 was duplicated verbatim (a second copy differing only in em-dash keybind cells and lacking the legacy-alias rule). The duplicate copy without the legacy-alias rule has been deleted; the surviving table is the one carrying the `cmd.github_actions.*` legacy-alias rule. No row content changed.

Metadata legend for the registration tables: availability classes are `always` (enabled whenever the owning panel is visible), `selection` (requires a selected subject), `live_subject` (requires a queued/running/live subject), `record_only` (requires a terminal/recorded subject), and `capability` (gated on probe/config/auth capability state). Confirmation classes are `none`, `two_step` (arm/confirm per the settings category-reset precedent), and `strong` (strong confirmation for destructive deletion, through the shared confirm surface). `disabled_reasons` values come only from the closed set `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, `permission_required`.

### Cozy Shelves command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.search.find_in_files` | canonical (existing) | Section 2.9 row; `scope` argument retained |
| `cmd.search.open_result` | canonical (existing) | `route_target` subject-open row |
| `cmd.search.next_result` | canonical (registered below) | id sanctioned by the 2026-07-02 aliases table; concrete row supplied here |
| `cmd.search.previous_result` | canonical (registered below) | same |
| `cmd.search.set_scope` | canonical (registered below) | standalone scope command; `find_in_files` scope arg unchanged |
| `cmd.search.rebuild_index` | canonical (existing) | Section 2.9 row |
| `cmd.search.replace_all` | canonical (existing) | destructive; preserved query-session payload; preview flow unchanged |
| `cmd.search.replace_selected` | canonical (existing) | |
| `cmd.search.toggle_regex` | newly registered | |
| `cmd.search.toggle_case` | newly registered | |
| `cmd.search.toggle_word` | newly registered | |
| `cmd.git.open_diff` | alias-of `cmd.git.diff_open` | recorded in the 2026-07-02 table |
| `cmd.git.show_commit` | alias-of `cmd.source_control.history_open_commit` | recorded in the 2026-07-02 table |
| `cmd.git.stage_hunks` / `cmd.git.unstage_hunks` / `cmd.git.discard_hunks` | canonical (existing) | discard keeps its destructive tiered confirmation |
| `cmd.git.diff_set_compare_target` | canonical (existing) | |
| `cmd.git.stash_pop` | retired -> `cmd.source_control.stash.pop` | markup migrates; row registered below |
| `cmd.git.stash_drop` | retired -> `cmd.source_control.stash.drop` | destructive; row registered below |
| `cmd.git.switch_branch` | retired -> `cmd.source_control.branch.switch` | row registered below (+ `branch.create`) |
| `cmd.source_control.generate_commit_message` | canonical (registered below) | |
| `panels.git_commit` | retired -> `cmd.git.commit` | row registered below |
| `git.create_pr` | retired -> `cmd.github.pr.create` | row registered below |
| `cmd.git.worktree.open` | canonical (existing) | UCC-054 family |
| `cmd.git.worktree.open_files` | alias-of `cmd.git.worktree.open` | open plus File Manager focus argument |
| `cmd.git.worktree.open_other` | retired -> `cmd.git.worktree.open` with target argument | select-then-open covers it; no new row |
| `cmd.git.worktree.compare` | canonical (existing) | |
| `cmd.git.worktree.merge` | canonical (registered below) | project scope; never reuses `cmd.chat.worktree.merge` |
| `cmd.git.worktree.remove` | canonical (existing) | destructive escalation ladder unchanged |
| `cmd.git.worktree.lock` / `cmd.git.worktree.unlock` | newly registered | |
| `cmd.git.pull` / `cmd.git.push` / `cmd.git.fetch` | newly registered | core remote verbs promised by the Source Control coverage prose; no prior concrete rows existed anywhere in the catalog; push inherits the force-push-with-lease ladder from WorktreeGitImprovement.md |
| `cmd.docker.browser_login` | cross-registered | behavior owned by Containers_Registry_and_Unraid.md (DockerHub browser/device login + `docker.auth.browser_login.*` events); this row supplies catalog registration only |
| `cmd.docker.save_pat` | cross-registered | behavior owned by Containers_Registry_and_Unraid.md; catalog registration only |
| `cmd.github.connect` | canonical (existing) | Section 2.1 |
| `cmd.github.actions.open_run` | canonical (existing) | Section 2.4 family row; metadata completed below |
| `cmd.github.actions.open_in_github` | canonical (registered below) | aliases recorded: `cmd.actions.open_in_browser`, `cmd.github.actions.open_run_in_browser` |
| `cmd.github.actions.compare_last_success` | canonical (existing) | Section 2.4 family row; metadata completed below |
| `cmd.actions.rerun` | alias-of `cmd.github.actions.rerun` | `cmd.actions.*` has no minting authority; canonical row registered below |
| `cmd.actions.rerun_failed` | alias-of `cmd.github.actions.rerun_failed` | canonical row registered below |
| `cmd.actions.cancel` | alias-of `cmd.github.actions.cancel` | canonical row registered below |
| `cmd.github.actions.dispatch` | newly registered | carries typed workflow_dispatch inputs payload |
| `cmd.github.actions.pin` / `cmd.github.actions.unpin` | canonical (existing) | |
| `cmd.docker.set_context` | alias-of `cmd.docker.context.select` | UCC-049 preserved token; the bare K8s-era `set_context` form still normalizes to `cmd.docker.k8s.select_context` per section 2.5B |
| `cmd.docker.run` (prototype start-stopped usage) | retired -> `cmd.docker.container.start` | `cmd.docker.run` itself stays live as create-from-image |
| `cmd.docker.container.stop` | canonical (registered below) | `cmd.docker.stop` becomes a recorded compatibility alias |
| `cmd.docker.container.restart` | canonical (registered below) | `cmd.docker.restart` becomes a recorded compatibility alias |
| `cmd.docker.container.start` | canonical (existing) | 2026-07-16 census row |
| `cmd.docker.container.view_logs` | canonical (existing) | UCC-105 |
| `cmd.docker.container.attach_shell` | canonical (registered below) | token existed in UCC-105 canonical text; concrete row supplied |
| `cmd.docker.container.inspect` | newly registered | |
| `cmd.docker.container.delete` | canonical (registered below) | UCC-049 preserved token; destructive |
| `cmd.docker.build` | alias-of `cmd.docker.build.image` (selected path) | existing section 2.5A alias |
| `cmd.docker.image.push` | alias (existing) | `domain.image_publish` class unchanged |
| `cmd.docker.image.tag` / `cmd.docker.image.inspect` / `cmd.docker.image.delete` | newly registered | delete is destructive |
| `cmd.docker.compose_up` | alias-of `cmd.docker.compose.up` | alias target adjudicated by UCC-137 below |
| `cmd.docker.compose.up` / `cmd.docker.compose.down` / `cmd.docker.compose.restart` | newly registered | whole-file group verbs beside the existing subset rows |
| `cmd.docker.compose.up_subset` / `cmd.docker.compose.down_subset` | canonical (existing) | |
| `cmd.docker.compose.scenario.save` / `.run` / `.edit` / `.delete` | canonical (existing) | flat `compose.save_scenario` / `compose.run_scenario` forms are recorded compatibility aliases |
| `cmd.docker.compose.open_file` | newly registered | compose YAML to editor handoff |
| `cmd.docker.cleanup.scan` | canonical (registered below) | token existed in UCC-105 canonical text |
| `cmd.docker.cleanup.prune` | canonical (registered below) | destructive |
| `cmd.docker.template.commit` / `cmd.docker.template.push` | canonical (existing) | 2026-07-16 census rows; `domain.image_publish` on push |
| `cmd.docker.open_dockerfile` | canonical (existing token) | UCC-049; build-pane wiring row required |
| `cmd.docker.k8s.select_context` / `cmd.docker.k8s.select_namespace` | canonical (existing) | `set_context` / `set_namespace` remain recorded compatibility aliases per section 2.5B |
| `cmd.testing.run` | canonical (existing) | run-scoped family |
| `cmd.testing.watch_run` | canonical (existing) | distinct from session-scoped `cmd.testing.session.watch` |
| `cmd.testing.open_receipt` | canonical (existing) | record-only availability |
| `cmd.testing.export_bundle` | canonical (existing) | |
| `cmd.testing.quarantine` | newly registered | plus `cmd.testing.quarantine.release` |
| `cmd.testing.session.redaction.inspect` | canonical (existing) | session-scoped family |
| `panels.show` (Open in Artifacts) | retired -> `cmd.panel.switch` with `panel_id: artifacts` | |
| `cmd.artifacts.sort` | newly registered | `shell_view` |
| `cmd.artifacts.play_recording` | newly registered | record-only availability |
| `cmd.artifacts.watch_recording` | newly registered | live-subject availability |
| `web.sources` | retired -> `cmd.artifacts.show_sources` | newly registered `navigation_wrapper` |
| `panels.open_chat` | retired -> `cmd.panel.switch` with `panel_id: chat` | |
| Show in Ledger / Show in Usage labels | canonical (existing) | `cmd.artifacts.show_in_ledger` / `cmd.artifacts.show_in_usage` |
| `cmd.file.open` | newly registered | subject-open over the `OpenFile{path,line?,range?,target_editor_panel_id?,target_editor_group_id?,target_group?}` route |
| `cmd.file.open_with` | canonical (existing) | |
| `cmd.file.open_in_system_default` | reserved (proposed) | stays disabled in MVP |
| `cmd.file.new_file` / `new_folder` / `rename` / `delete` / `copy_path` / `copy_nodes` / `cut_nodes` / `paste_nodes` / `save_local_copy` | canonical (existing) | CRUD closure; delete keeps its destructive class |
| `cmd.file.copy_full_path` / `cmd.file.copy_relative_path` | alias wrappers (existing) | `format = absolute` / `relative` over `cmd.file.copy_path` |
| `cmd.file.refresh` | newly registered | |
| `cmd.file.reveal` | newly registered | FileManager `/reveal` |
| `cmd.file.expand_capped` | newly registered | `shell_view` row-cap Show more |
| `cmd.editor.close_tab` | newly registered | `cmd.editor.*` prefix reserved here |
| `cmd.chat.add_file_reference` | canonical (existing) | signature lock unchanged |
| `cmd.panel.switch` | canonical (existing) | destination vocabulary proof row below |
| `cmd.panel.detach` | alias-of `cmd.panel.undock` | recorded compatibility alias |
| `cmd.terminal.open` (rail bare-focus usage) | markup migrates -> `cmd.terminal.show` | `cmd.terminal.open` row remains live and distinct; the two rows never collapse (see UCC-138) |
| `cmd.chat.open_at` | retired -> `cmd.chat.open_thread` | newly registered `navigation_wrapper` |
| `page.go` / `demo.toast` / `demo.reason` | demo fixtures (retired) | concept-shell fixtures; never registered |
| `cmd.agents.show` / `cmd.agents.open_thread` / `cmd.agents.open_node` | newly registered | `cmd.agents.*` prefix reserved here; mirror stays read-only |

### GitHub Actions registration and adjudication rows

`cmd.github.actions.*` is the sole minting namespace for hosted-run actions; `cmd.actions.*` retains no minting authority and its rerun/rerun_failed/cancel/open_in_browser rows become recorded compatibility aliases of the canonical ids below, following the pin/unpin alias precedent already in the section 2.4 table. `cmd.github.actions.open_in_github` is the single canonical open-on-GitHub command; `cmd.actions.open_in_browser` and `cmd.github.actions.open_run_in_browser` are recorded compatibility aliases and neither may become a second primary name. The `open_run` and `compare_last_success` rows below complete the metadata contract for the existing section 2.4 rows without changing their labels, descriptions, or preconditions.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.github.actions.open_run` | Open Run | `navigation_wrapper` | selection (`actions_panel_visible && selected_run`) | none | `unauthorized`, `unreachable` | github_actions |
| `cmd.github.actions.open_in_github` | Open in GitHub | `navigation_wrapper` | selection (`selected_run`) | none | `unauthorized`, `unreachable`, `not_configured` | github_actions |
| `cmd.github.actions.compare_last_success` | Compare Last Success | `navigation_wrapper` | selection (`selected_run && last_success_resolvable`) | none | `unreachable`, `degraded` | github_actions |
| `cmd.github.actions.rerun` | Rerun Workflow | `domain_action` | selection (`selected_run && rerun_allowed`) | none | `unauthorized`, `unreachable`, `stale_projection`, `permission_required` | github_actions |
| `cmd.github.actions.rerun_failed` | Rerun Failed Jobs | `domain_action` | selection (`selected_run && has_failed_jobs`) | none | `unauthorized`, `unreachable`, `stale_projection`, `permission_required` | github_actions |
| `cmd.github.actions.cancel` | Cancel Run | `domain_action` | live_subject (`run_in_progress`) | two_step | `unauthorized`, `unreachable`, `stale_projection` | github_actions |
| `cmd.github.actions.dispatch` | Dispatch Workflow | `domain_action` | capability (`workflow_dispatchable && dispatch_readiness_valid`) | two_step | `not_configured`, `unauthorized`, `unreachable`, `degraded` | github_actions |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

### Agents panel navigation rows

The `cmd.agents.*` prefix is reserved as a first-party family for the Agents rail panel. All three rows are read-only navigation over the agents/subagents mirror; the mirror mutates nothing, and agent lifecycle actions (pause, cancel, retry, reroute) remain owned by their runtime/orchestrator command owners rather than this family.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.agents.show` | Show Agents Panel | `navigation_wrapper` | always | none | `unsupported` | agents |
| `cmd.agents.open_thread` | Open Agent Thread | `navigation_wrapper` | selection (`agent_thread_ref_resolvable`) | none | `stale_projection` | agents |
| `cmd.agents.open_node` | Open Agent Node | `navigation_wrapper` | selection (`node_ref_resolvable`) | none | `stale_projection` | agents |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Wiring_Matrix.md

### Runtime Artifacts panel rows

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.artifacts.sort` | Sort Artifacts | `shell_view` | always | none | `unsupported` | artifacts |
| `cmd.artifacts.play_recording` | Play Recording | `domain_action` | record_only (`recording_artifact_terminal`) | none | `degraded`, `stale_projection` | artifacts |
| `cmd.artifacts.watch_recording` | Watch Live Recording | `domain_action` | live_subject (`recording_in_progress`) | none | `degraded`, `unreachable` | artifacts |
| `cmd.artifacts.show_sources` | Show Sources | `navigation_wrapper` | selection (`artifact_source_refs_present`) | none | `stale_projection` | artifacts |

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

### Source Control depth rows

These rows resolve the underdefined `cmd.source_control.stash.*` compatibility-family declaration into first-class commands (list/create/apply/pop/drop; pop is added because the declared family lacked it) and supply the branch selector commands the section 2.5 coverage prose promises. `cmd.git.commit` registers the commit action the prototype's `panels.git_commit` token retires into. Stash drop and pop route the shared confirm surface; all mutating rows inherit projection-freshness gating.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.git.commit` | Commit | `domain_action` | selection (`git_available && staged_changes_present`) | none | `blocked_state_required`, `stale_projection`, `permission_required` | source_control |
| `cmd.source_control.generate_commit_message` | Generate Commit Message | `domain_action` | selection (`changes_present && assistant_available`) | none | `not_configured`, `degraded`, `permission_required` | source_control |
| `cmd.source_control.branch.switch` | Switch Branch | `domain_action` | capability (`git_available && branch_exists && working_tree_safe`) | none | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.branch.create` | Create Branch | `domain_action` | capability (`git_available`) | none | `stale_projection`, `permission_required` | source_control |
| `cmd.source_control.stash.list` | List Stashes | `shell_view` | capability (`git_available`) | none | `unreachable` | source_control |
| `cmd.source_control.stash.create` | Create Stash | `domain_action` | selection (`dirty_working_tree`) | none | `stale_projection` | source_control |
| `cmd.source_control.stash.apply` | Apply Stash | `domain_action` | selection (`stash_selected`) | none | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.stash.pop` | Pop Stash | `domain_action` | selection (`stash_selected`) | two_step | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.stash.drop` | Drop Stash | `domain_action` | selection (`stash_selected`) | two_step | `stale_projection`, `permission_required` | source_control |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md

### Worktree and GitHub PR rows

`cmd.git.worktree.merge` mints the project-scope worktree merge the UCC-054 family lacked; per UCC-122's negative constraint it never reuses the thread-bound `cmd.chat.worktree.merge`. Lock and unlock register the worktree lock flags from the worktree research and W-doc lineage. `cmd.github.pr.create` is the GitHub-domain, API-only PR creation command (per GitHub_API_Auth_and_Flows) that the prototype token `git.create_pr` retires into; it is distinct from, and does not alias or replace, the panel-scoped `cmd.source_control.pr.create` route command (UCC-122) or the thread-bound `cmd.chat.worktree.pr`. All three PR-creation scopes stay live with wiring recording which surface dispatches which.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.git.worktree.merge` | Merge Worktree | `domain_action` | selection (`worktree_selected && merge_target_resolvable && !merge_locked`) | two_step | `blocked_state_required`, `stale_projection`, `permission_required` | source_control |
| `cmd.git.worktree.lock` | Lock Worktree | `domain_action` | selection (`worktree_selected && !worktree_locked`) | none | `stale_projection` | source_control |
| `cmd.git.worktree.unlock` | Unlock Worktree | `domain_action` | selection (`worktree_locked`) | none | `stale_projection`, `permission_required` | source_control |
| `cmd.github.pr.create` | Create PR on GitHub | `domain_action` | capability (`github_auth_valid && github_remote_present`) | none | `unauthorized`, `unreachable`, `not_configured` | github domain |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md

### Search panel completion rows

Result navigation, standalone scope, and the three query-flag toggles get concrete rows; `find_in_files`, `open_result`, `replace_all`, `replace_selected`, and `rebuild_index` keep their existing section 2.9 rows and payloads unchanged (replace flows keep the preserved-query-session payload and preview-before-apply behavior; no re-registration here).

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.search.next_result` | Next Search Result | `shell_view` | selection (`query_session_active && results_present`) | none | `stale_projection` | search |
| `cmd.search.previous_result` | Previous Search Result | `shell_view` | selection (`query_session_active && results_present`) | none | `stale_projection` | search |
| `cmd.search.set_scope` | Set Search Scope | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_regex` | Toggle Regex | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_case` | Toggle Match Case | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_word` | Toggle Whole Word | `shell_view` | always | none | `unsupported` | search |

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

### Testing quarantine rows and run/session scope split

The run-scoped family `cmd.testing.run` / `watch_run` / `cancel_run` / `open_receipt` / `open_failure` / `export_bundle` / `open_panel` is the canon for test runs; the session-scoped family `cmd.testing.session.open` / `watch` / `background` / `redaction.inspect` is a distinct canon for visible test sessions. Both families stay live, neither aliases the other, and `watch_run` versus `session.watch` is a scope split, not a duplication. Quarantine is a state mutation over test identity, not a run action, and releases only through its paired command.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.testing.quarantine` | Quarantine Test | `domain_action` | record_only (`failing_test_identified`) | two_step | `stale_projection`, `permission_required` | testing |
| `cmd.testing.quarantine.release` | Release From Quarantine | `domain_action` | selection (`quarantined_test_selected`) | two_step | `stale_projection`, `permission_required` | testing |

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Wiring_Matrix.md

### File Manager, editor, and chat navigation rows

`cmd.file.open` is the bare subject-open command over the canonical `OpenFile{path,line?,range?,target_editor_panel_id?,target_editor_group_id?,target_group?}` route; it does not duplicate `cmd.file.open_with` (explicit target picker) and does not touch the ten-row CRUD closure, which stays intact per UCC-108. `target_group` is compatibility-only and normalizes to `target_editor_group_id`; Panel 1..4 values belong to `target_editor_panel_id`, never to `cmd.file.open_with`. `cmd.editor.close_tab` reserves the `cmd.editor.*` prefix for editor tab lifecycle. `cmd.chat.open_thread` is the cross-surface thread entry wrapper the prototype token `cmd.chat.open_at` retires into; it carries route/OpenSubject identity, opens the chat panel when closed, and does not duplicate the chat-panel-local `cmd.chat.switch_thread` row, with wiring recording the seam. `cmd.chat.add_file_reference` keeps its existing row and canonical signature lock unchanged.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.file.open` | Open File | `navigation_wrapper` | selection (`file_node_selected`) | none | `blocked_state_required` | files |
| `cmd.file.refresh` | Refresh File Tree | `domain_action` | always | none | `unreachable`, `degraded` | files |
| `cmd.file.reveal` | Reveal in File Tree | `navigation_wrapper` | selection (`subject_resolvable`) | none | `stale_projection` | files |
| `cmd.file.expand_capped` | Show More Rows | `shell_view` | selection (`capped_rows_present`) | none | `unsupported` | files |
| `cmd.editor.close_tab` | Close Editor Tab | `shell_view` | selection (`tab_open`) | two_step when dirty, else none | `blocked_state_required` | files |
| `cmd.chat.open_thread` | Open Chat Thread | `navigation_wrapper` | selection (`thread_exists`) | none | `stale_projection` | chat |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### Docker Manager lifecycle, image, and cleanup rows

Container lifecycle naming is adjudicated in favor of the reserved `cmd.docker.container.*` subfamily per the UCC-121 direction: `cmd.docker.container.stop` and `cmd.docker.container.restart` are canonical beside the already-registered `cmd.docker.container.start`, and the section 2.5A `cmd.docker.stop` / `cmd.docker.restart` rows become recorded compatibility aliases of them; the UCC-105 preserved tokens survive as alias evidence, and no existing row or unit is edited. `attach_shell`, `cleanup.scan`, and `cleanup.prune` were already named as existing tokens in UCC-105 canonical text; the rows below supply their concrete metadata. Docker Manager keeps its six subview tabs with distinct glyphs and abbreviated mid-width labels (user decision 2026-07-27); no new tab-switch commands are minted and subview switching stays on the existing switch_subview view-state.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.docker.container.stop` | Stop Container | `domain_action` | live_subject (`container_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.container.restart` | Restart Container | `domain_action` | selection (`container_selected`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.container.attach_shell` | Attach Shell | `domain_action` | live_subject (`container_running && capability_snapshot_current`) | none | `unsupported`, `unauthorized`, `unreachable` | docker_manager |
| `cmd.docker.container.inspect` | Inspect Container | `navigation_wrapper` | selection (`container_selected`) | none | `unreachable` | docker_manager |
| `cmd.docker.container.delete` | Delete Container | `domain_action` | selection (`container_selected && !container_running`) | strong | `blocked_state_required`, `stale_projection`, `permission_required` | docker_manager |
| `cmd.docker.image.tag` | Tag Image | `domain_action` | selection (`image_selected`) | none | `stale_projection` | docker_manager |
| `cmd.docker.image.inspect` | Inspect Image | `navigation_wrapper` | selection (`image_selected`) | none | `unreachable` | docker_manager |
| `cmd.docker.image.delete` | Delete Image | `domain_action` | selection (`image_selected && !image_in_use`) | strong | `blocked_state_required`, `stale_projection`, `permission_required` | docker_manager |
| `cmd.docker.cleanup.scan` | Scan for Reclaimable Space | `domain_action` | capability (`docker_available`) | none | `unreachable`, `degraded` | docker_manager |
| `cmd.docker.cleanup.prune` | Prune Reclaimable Space | `domain_action` | record_only (`scan_results_present`) | strong | `stale_projection`, `permission_required` | docker_manager |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Wiring_Matrix.md

### Docker compose and context adjudication rows

Whole-file compose group verbs join the existing subset and scenario rows. The prior note that `cmd.docker.compose_up` aliases a full-compose scenario run is superseded by UCC-137: `compose_up` (and any `compose_down` usage) are recorded compatibility aliases of `cmd.docker.compose.up` / `cmd.docker.compose.down`. The dotted `cmd.docker.compose.scenario.save/run/edit/delete` rows remain canonical and the flat `compose.save_scenario` / `compose.run_scenario` spellings are recorded compatibility aliases. `cmd.docker.k8s.select_context` / `select_namespace` remain canonical with `set_context` / `set_namespace` as recorded aliases (existing section 2.5B statement, restated as adjudicated canon); the Docker-engine context selector is `cmd.docker.context.select` with the prototype's `cmd.docker.set_context` recorded as its alias.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.docker.compose.up` | Compose Up | `domain_action` | selection (`compose_file_selected`) | none | `not_configured`, `unreachable` | docker_manager |
| `cmd.docker.compose.down` | Compose Down | `domain_action` | live_subject (`compose_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.compose.restart` | Compose Restart | `domain_action` | live_subject (`compose_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.compose.open_file` | Open Compose File | `navigation_wrapper` | selection (`compose_file_selected`) | none | `blocked_state_required` | docker_manager |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FileManager.md, ContractName:Plans/Wiring_Matrix.md

### cmd.panel.switch destination vocabulary (route-owner proof)

`cmd.panel.switch` remains a `shell_view` side-panel command with a controlled destination vocabulary. The closed canonical `panel_id` set is exactly: `search`, `chat`, `files`, `source_control`, `github_actions`, `docker_manager`, `testing`, `agents`, `artifacts`, `run_debug`. Any other destination value is a dispatch error; object-targeting contexts continue to use route-consuming wrapper commands per the existing `cmd.panel.switch` boundary rule, and prototype tokens `panels.show` and `panels.open_chat` retire into `cmd.panel.switch` with `panel_id: artifacts` and `panel_id: chat` respectively. `cmd.panel.undock` / `cmd.panel.redock` remain the canonical float/dock pair with `cmd.panel.detach` recorded as a compatibility alias of `cmd.panel.undock`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

### Cozy Shelves Reconciliation PlanUnits

### UCC-127 - Cozy Shelves Reconciliation Adoption And Namespace Reservations

```yaml
plan_unit_id: UCC-127
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The Cozy Shelves command reconciliation table (2026-07-27) is catalog canon: every prototype token from
  Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html and c2-cozy-shelves-files.html is adjudicated as canonical,
  alias-of a recorded target, newly registered, or retired, and concept markup migrates to the adjudicated ids
  when the c2 files are patched in place as the implementation base (user decision 2026-07-27). The cmd.agents.*
  and cmd.editor.* prefixes are reserved first-party command families. page.go, demo.toast, and demo.reason are
  retired concept-shell demo fixtures and never become catalog rows. The verbatim-duplicated GitHub Actions
  command family table copy lacking the legacy-alias rule is deleted; the surviving section 2.4 table carrying
  the legacy-alias rule is the single canonical family table.
gui_related: true
gui_classification_reason: Governs which user-visible command ids the Cozy Shelves rail panels may dispatch.
depends_on: [UCC-002]
unblocks: []
acceptance_criteria:
  - Every prototype command token has exactly one recorded disposition in the reconciliation table.
  - cmd.agents.* and cmd.editor.* resolve as reserved first-party prefixes.
  - Only one GitHub Actions family table exists in section 2.4 and it carries the legacy-alias rule.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: cozy_shelves_command_reconciliation
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_command_reconciliation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves concept; source-lineage-only)"
  - "user decision 2026-07-27 (implementation base = c2 concept files patched in place)"
preserved_exact_tokens:
  - "cmd.agents.*"
  - "cmd.editor.*"
negative_constraints:
  - Do not copy Cozy Shelves HTML, CSS, or class names into spec canon; concept files are source lineage only.
  - Do not register page.go, demo.toast, or demo.reason as catalog rows.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-128 - GitHub Actions Namespace Promotion And Open-In-GitHub Adjudication

```yaml
plan_unit_id: UCC-128
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.github.actions.rerun, cmd.github.actions.rerun_failed, cmd.github.actions.cancel, and
  cmd.github.actions.dispatch are canonical hosted-run mutation commands; cmd.actions.rerun,
  cmd.actions.rerun_failed, and cmd.actions.cancel are recorded compatibility aliases with no minting
  authority, following the pin/unpin alias precedent. cmd.github.actions.open_in_github is the single
  canonical open-on-GitHub command with cmd.actions.open_in_browser and
  cmd.github.actions.open_run_in_browser as recorded compatibility aliases. dispatch carries a typed
  workflow_dispatch inputs payload and requires dispatch readiness validation. open_run and
  compare_last_success keep their existing section 2.4 rows with metadata completed by this addendum.
gui_related: true
gui_classification_reason: Registers user-visible GitHub Actions panel rerun, cancel, dispatch, and open-in-GitHub controls.
depends_on: [UCC-047, UCC-048]
unblocks: []
acceptance_criteria:
  - cmd.actions.rerun, rerun_failed, and cancel normalize to their cmd.github.actions.* canonical targets through recorded alias metadata.
  - Exactly one canonical open-on-GitHub command exists and both legacy spellings are recorded aliases.
  - dispatch is blocked until dispatch readiness validation passes and carries typed inputs.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: github_actions_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_github_actions_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_github_actions_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.4 GitHub Actions command family)"
preserved_exact_tokens:
  - "cmd.github.actions.rerun"
  - "cmd.github.actions.rerun_failed"
  - "cmd.github.actions.cancel"
  - "cmd.github.actions.dispatch"
  - "cmd.github.actions.open_in_github"
negative_constraints:
  - Do not mint new commands under cmd.actions.*.
  - Do not let cmd.actions.open_in_browser or cmd.github.actions.open_run_in_browser become primary names.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
```

### UCC-129 - Agents Panel Navigation Command Family

```yaml
plan_unit_id: UCC-129
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.agents.show, cmd.agents.open_thread, and cmd.agents.open_node are the Agents rail panel navigation
  commands. cmd.agents.show normalizes to the side-panel switch route with panel_id agents per the UCC-014
  alias discipline; open_thread and open_node are route-consuming navigation wrappers over stable
  thread/node refs. The agents mirror is read-only: this family mutates no agent, run, node, or thread
  state, and agent lifecycle actions remain owned by their runtime and orchestrator command owners.
gui_related: true
gui_classification_reason: Registers user-visible Agents panel show and open navigation controls.
depends_on: [UCC-014]
unblocks: []
acceptance_criteria:
  - cmd.agents.show normalizes to the panel-switch route with panel_id agents.
  - open_thread and open_node consume route/OpenSubject identity and mutate nothing.
  - No agent lifecycle mutation command exists under cmd.agents.*.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: agents_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_agents_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_agents_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "cmd.agents.show"
  - "cmd.agents.open_thread"
  - "cmd.agents.open_node"
negative_constraints:
  - Do not add mutation commands to the read-only agents mirror family.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### UCC-130 - Runtime Artifacts Panel Command Rows

```yaml
plan_unit_id: UCC-130
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.artifacts.sort is a shell_view list-order command registered for palette parity; cmd.artifacts.play_recording
  plays a terminal recorded artifact (record-only availability); cmd.artifacts.watch_recording binds a live
  in-progress recording (live-subject availability); cmd.artifacts.show_sources is the navigation wrapper the
  prototype token web.sources retires into, opening source refs through route/OpenSubject identity. Artifact
  record schemas remain owned by Runtime_Artifacts_Panel.md and its contracts; these rows are projections over
  that owner truth.
gui_related: true
gui_classification_reason: Registers user-visible Runtime Artifacts sort, playback, watch, and sources controls.
depends_on: [UCC-109]
unblocks: []
acceptance_criteria:
  - play_recording enables only for terminal recorded artifacts; watch_recording only for live recordings.
  - show_sources consumes route/OpenSubject identity; web.sources appears nowhere in production markup.
  - sort mutates view projection state only.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: artifacts_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_artifacts_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_artifacts_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "cmd.artifacts.sort"
  - "cmd.artifacts.play_recording"
  - "cmd.artifacts.watch_recording"
  - "cmd.artifacts.show_sources"
negative_constraints:
  - Do not let artifact command rows own artifact record schemas; Runtime_Artifacts_Panel.md owner contracts remain truth.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

### UCC-131 - Source Control Branch Stash And Commit Rows

```yaml
plan_unit_id: UCC-131
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.source_control.branch.switch and cmd.source_control.branch.create register the branch selector the
  section 2.5 coverage prose promises. cmd.source_control.stash.list, stash.create, stash.apply, stash.pop,
  and stash.drop resolve the underdefined stash.* compatibility-family declaration into first-class rows,
  adding pop which the declared family lacked; the prototype tokens cmd.git.stash_pop and cmd.git.stash_drop
  retire into stash.pop and stash.drop. cmd.git.commit registers the commit action the prototype token
  panels.git_commit retires into. cmd.source_control.generate_commit_message registers the AI commit-message
  action. Stash pop and drop use two-step confirmation through the shared confirm surface; mutating rows
  inherit projection-freshness gating.
gui_related: true
gui_classification_reason: Registers user-visible Source Control branch, stash, commit, and commit-message controls.
depends_on: [UCC-044]
unblocks: []
acceptance_criteria:
  - Each stash flow (list, create, apply, pop, drop) resolves to exactly one first-class command row.
  - branch.switch is blocked with a reason on unsafe working trees instead of disappearing.
  - panels.git_commit, cmd.git.stash_pop, cmd.git.stash_drop, and cmd.git.switch_branch appear nowhere in production markup.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: source_control_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_source_control_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_source_control_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.5 stash compatibility-family declaration)"
preserved_exact_tokens:
  - "cmd.git.commit"
  - "cmd.source_control.generate_commit_message"
  - "cmd.source_control.branch.switch"
  - "cmd.source_control.branch.create"
  - "cmd.source_control.stash.list"
  - "cmd.source_control.stash.create"
  - "cmd.source_control.stash.apply"
  - "cmd.source_control.stash.pop"
  - "cmd.source_control.stash.drop"
negative_constraints:
  - Do not leave any stash flow resolving to the underdefined compatibility family instead of a first-class row.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
```

### UCC-132 - Project-Scope Worktree Merge Lock Unlock And GitHub PR Create

```yaml
plan_unit_id: UCC-132
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.git.worktree.merge mints the project-scope worktree merge the UCC-054 family lacked; per the UCC-122
  negative constraint it never reuses the thread-bound cmd.chat.worktree.merge. cmd.git.worktree.lock and
  cmd.git.worktree.unlock register worktree lock flags. cmd.github.pr.create is the GitHub-domain API-only
  PR creation command that the prototype token git.create_pr retires into, gated on github_auth_valid and
  github_remote_present; it is distinct from, and neither aliases nor replaces, the panel-scoped
  cmd.source_control.pr.create route command and the thread-bound cmd.chat.worktree.pr. All three PR-creation
  scopes stay live and wiring records which surface dispatches which.
gui_related: true
gui_classification_reason: Registers user-visible worktree merge, lock, unlock, and GitHub PR creation controls.
depends_on: [UCC-054, UCC-055, UCC-058, UCC-122]
unblocks: []
acceptance_criteria:
  - Worktree merge is project-scoped, two-step confirmed, and blocked with a reason on dirty, conflicted, or merge-locked worktrees.
  - Lock and unlock mutate only worktree lock state.
  - cmd.github.pr.create, cmd.source_control.pr.create, and cmd.chat.worktree.pr remain three distinct live commands with recorded scope boundaries.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: source_control_command_catalog_gap
reasoning_tier: high
context_scope: cozy_shelves_worktree_pr_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_worktree_pr_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-054/UCC-055 project-scope worktree family, UCC-122 PR rows)"
preserved_exact_tokens:
  - "cmd.git.worktree.merge"
  - "cmd.git.worktree.lock"
  - "cmd.git.worktree.unlock"
  - "cmd.github.pr.create"
negative_constraints:
  - Do not reuse thread-bound cmd.chat.worktree.merge or cmd.chat.worktree.pr for panel-scoped actions.
  - Do not alias cmd.github.pr.create to cmd.source_control.pr.create or collapse the two rows.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
```

### UCC-133 - Search Result Navigation Scope And Flag Toggle Rows

```yaml
plan_unit_id: UCC-133
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.search.next_result and cmd.search.previous_result register result navigation over the preserved query
  session; cmd.search.set_scope registers the standalone scope command (the scope argument on find_in_files
  and replace_in_files is unchanged); cmd.search.toggle_regex, cmd.search.toggle_case, and
  cmd.search.toggle_word register the query flag toggles. All six are shell_view rows that mutate search view
  state only. The existing find_in_files, open_result, replace_all, replace_selected, and rebuild_index rows
  and payloads are unchanged, including the destructive replace preview-before-apply behavior.
gui_related: true
gui_classification_reason: Registers user-visible Search panel navigation, scope, and flag toggle controls.
depends_on: [UCC-002]
unblocks: []
acceptance_criteria:
  - Result navigation operates only within an active preserved query session.
  - Flag toggles and scope changes never mutate file or index state.
  - Existing search rows keep their payload shapes unchanged.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: search_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_search_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/LSPSupport.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_search_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (2026-07-02 aliases table sanctioning set_scope/next_result/previous_result)"
preserved_exact_tokens:
  - "cmd.search.next_result"
  - "cmd.search.previous_result"
  - "cmd.search.set_scope"
  - "cmd.search.toggle_regex"
  - "cmd.search.toggle_case"
  - "cmd.search.toggle_word"
negative_constraints:
  - Do not let shell_view search rows mutate files, indexes, or replace state.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/LSPSupport.md
```

### UCC-134 - Testing Quarantine Rows And Run Session Scope Split

```yaml
plan_unit_id: UCC-134
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.testing.quarantine and cmd.testing.quarantine.release register the quarantine state mutation over test
  identity with two-step confirmation. The run-scoped family cmd.testing.run, watch_run, cancel_run,
  open_receipt, open_failure, export_bundle, and open_panel is the canon for test runs; the session-scoped
  family cmd.testing.session.open, watch, background, and redaction.inspect is a distinct canon for visible
  test sessions. Both families stay live, neither aliases the other, and watch_run versus session.watch is a
  scope split rather than a duplication.
gui_related: true
gui_classification_reason: Registers user-visible Testing quarantine controls and fixes the run/session family split.
depends_on: [UCC-108]
unblocks: []
acceptance_criteria:
  - Quarantine and release are separate commands with separate receipts and two-step confirmation.
  - No alias metadata links the run-scoped and session-scoped testing families.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_testing_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/Automated_Testing_System.md (GUI Result Surfacing)"
preserved_exact_tokens:
  - "cmd.testing.quarantine"
  - "cmd.testing.quarantine.release"
negative_constraints:
  - Do not alias run-scoped testing commands to session-scoped ones or collapse the two families.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
```

### UCC-135 - File Manager Editor And Chat Navigation Rows

```yaml
plan_unit_id: UCC-135
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.file.open is the bare subject-open command over the canonical OpenFile route contract, distinct from
  cmd.file.open_with and additive beside the intact ten-row CRUD closure. cmd.file.refresh rescans the file
  tree projection; cmd.file.reveal is the /reveal navigation wrapper; cmd.file.expand_capped is the shell_view
  row-cap expansion. cmd.editor.close_tab registers editor tab lifecycle under the reserved cmd.editor.*
  prefix with a dirty-state confirm. cmd.chat.open_thread is the cross-surface chat thread entry wrapper that
  cmd.chat.open_at retires into; it opens the chat panel when closed and does not duplicate the panel-local
  cmd.chat.switch_thread row. cmd.chat.add_file_reference keeps its existing row and signature lock unchanged.
gui_related: true
gui_classification_reason: Registers user-visible file open, refresh, reveal, row-cap, editor tab, and chat thread controls.
depends_on: [UCC-108, UCC-014]
unblocks: []
acceptance_criteria:
  - cmd.file.open resolves through the OpenFile route contract and does not duplicate any CRUD closure row.
  - expand_capped mutates only view projection state.
  - close_tab requires confirmation only for dirty tabs.
  - cmd.chat.open_at appears nowhere in production markup.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: file_manager_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_file_editor_chat_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_file_editor_chat_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/FileManager.md (/reveal, OpenFile route, CRUD closure)"
preserved_exact_tokens:
  - "cmd.file.open"
  - "cmd.file.refresh"
  - "cmd.file.reveal"
  - "cmd.file.expand_capped"
  - "cmd.editor.close_tab"
  - "cmd.chat.open_thread"
negative_constraints:
  - Do not duplicate the ten CRUD closure rows or the cmd.file.open_with row.
  - Do not collapse cmd.chat.open_thread and cmd.chat.switch_thread into one row.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
```

### UCC-136 - Docker Container Lifecycle Adjudication Image And Cleanup Rows

```yaml
plan_unit_id: UCC-136
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Container lifecycle naming is adjudicated per the UCC-121 direction: cmd.docker.container.stop and
  cmd.docker.container.restart are canonical beside cmd.docker.container.start, and the section 2.5A
  cmd.docker.stop and cmd.docker.restart rows become recorded compatibility aliases of them. This amendment
  supersedes the bare-verb presentation without editing the UCC-105 preserved tokens, which survive as alias
  evidence. cmd.docker.container.attach_shell, cmd.docker.cleanup.scan, and cmd.docker.cleanup.prune receive
  concrete metadata rows for tokens already named existing in UCC-105 canonical text.
  cmd.docker.container.inspect, cmd.docker.container.delete, cmd.docker.image.tag, cmd.docker.image.inspect,
  and cmd.docker.image.delete register the expander actions; container and image delete are destructive with
  strong confirmation, and prune is destructive over scan results. Docker Manager keeps six subview tabs with
  distinct glyphs and abbreviated mid-width labels (user decision 2026-07-27); no tab-switch commands are
  minted.
gui_related: true
gui_classification_reason: Registers and adjudicates user-visible Docker container, image, and cleanup controls.
depends_on: [UCC-049, UCC-105, UCC-121]
unblocks: []
acceptance_criteria:
  - cmd.docker.stop and cmd.docker.restart dispatch only as recorded aliases normalizing to cmd.docker.container.stop and cmd.docker.container.restart.
  - Container and image delete require strong confirmation through the shared confirm surface.
  - Prune enables only after a scan and never deletes beyond the scan result set.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: high
context_scope: cozy_shelves_docker_lifecycle_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_docker_lifecycle_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-105 existing-token list; UCC-121 container subfamily direction)"
  - "user decision 2026-07-27 (Docker Manager keeps 6 subview tabs)"
preserved_exact_tokens:
  - "cmd.docker.container.stop"
  - "cmd.docker.container.restart"
  - "cmd.docker.container.attach_shell"
  - "cmd.docker.container.inspect"
  - "cmd.docker.container.delete"
  - "cmd.docker.image.tag"
  - "cmd.docker.image.inspect"
  - "cmd.docker.image.delete"
  - "cmd.docker.cleanup.scan"
  - "cmd.docker.cleanup.prune"
negative_constraints:
  - Do not mint further bare-verb cmd.docker.* container lifecycle commands.
  - Do not reuse cmd.docker.run for starting stopped containers.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
```

### UCC-137 - Docker Compose Group Verbs Scenario Aliases And Context Adjudication

```yaml
plan_unit_id: UCC-137
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.docker.compose.up, cmd.docker.compose.down, and cmd.docker.compose.restart register whole-file compose
  group verbs beside the existing subset and scenario rows; cmd.docker.compose_up (and any compose_down
  usage) are recorded compatibility aliases of them, superseding the earlier note aliasing compose_up to a
  full-compose scenario run. cmd.docker.compose.scenario.save, run, edit, and delete remain canonical with
  the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases.
  cmd.docker.compose.open_file registers the compose YAML to editor handoff over the OpenFile route.
  cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and
  set_namespace recorded aliases; cmd.docker.context.select is the canonical Docker-engine context selector
  with the prototype token cmd.docker.set_context recorded as its alias.
gui_related: true
gui_classification_reason: Registers and adjudicates user-visible Docker compose, scenario, and context controls.
depends_on: [UCC-049, UCC-121]
unblocks: []
acceptance_criteria:
  - compose_up dispatches only as a recorded alias normalizing to cmd.docker.compose.up.
  - Flat scenario spellings normalize to the dotted scenario family through recorded alias metadata.
  - open_file resolves through the OpenFile route and never edits compose state itself.
  - Exactly one canonical selector exists for Docker-engine context and one each for K8s context and namespace.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_docker_compose_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FileManager.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_docker_compose_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.5A compose rows and 2.5B context statement; UCC-049 preserved tokens)"
preserved_exact_tokens:
  - "cmd.docker.compose.up"
  - "cmd.docker.compose.down"
  - "cmd.docker.compose.restart"
  - "cmd.docker.compose.open_file"
negative_constraints:
  - Do not let flat scenario spellings or compose_up become primary names.
  - Do not mint a second Docker-engine or Kubernetes context selector.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
```

### UCC-138 - Panel Switch Destination Vocabulary Undock Alias And Terminal Focus Adjudication

```yaml
plan_unit_id: UCC-138
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.panel.switch carries a controlled destination vocabulary: the closed canonical panel_id set is exactly
  search, chat, files, source_control, github_actions, docker_manager, testing, agents, artifacts, and
  run_debug; other values are dispatch errors and object targeting stays in route-consuming wrappers.
  Prototype tokens panels.show and panels.open_chat retire into cmd.panel.switch with panel_id artifacts and
  chat. cmd.panel.undock and cmd.panel.redock remain the canonical float/dock pair with cmd.panel.detach a
  recorded compatibility alias of cmd.panel.undock. For the Cozy Shelves rail terminal-focus control,
  cmd.terminal.show is the canonical dispatch target and the prototype's cmd.terminal.open usage in that
  bare-focus context is recorded as an alias mapping for markup migration only; the cmd.terminal.open catalog
  row itself stays a live, distinct row and the two rows never collapse into one normalized target, per the
  existing non-collapse rule.
gui_related: true
gui_classification_reason: Fixes user-visible panel switching, undock naming, and terminal focus dispatch for the rail shell.
depends_on: [UCC-014, UCC-108]
unblocks: []
acceptance_criteria:
  - cmd.panel.switch rejects panel_id values outside the closed ten-id set.
  - cmd.panel.detach dispatches only as a recorded alias normalizing to cmd.panel.undock.
  - The rail terminal-focus control dispatches cmd.terminal.show; cmd.terminal.open remains a live distinct row and does not normalize to cmd.terminal.show.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: high
context_scope: cozy_shelves_shell_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_shell_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-014 alias discipline; panel undock/redock rows; terminal non-collapse rule)"
preserved_exact_tokens:
  - "cmd.panel.switch"
  - "panel_id"
  - "run_debug"
negative_constraints:
  - Do not extend the panel_id vocabulary without a new catalog adjudication row.
  - Do not collapse cmd.terminal.open and cmd.terminal.show into one normalized target.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

## Run & Debug Revival Addendum - 2026-07-27

This addendum registers, at row level, the `cmd.run_debug.*` classical DAP debugger dispatch family minted by `Plans/Commands_System.md` Run & Debug Revival Addendum §7.2 (39 ids, semantics, availability and confirmation classes, and the closed disabled-reason set owned there and consumed here by reference only), registers the `cmd.run.*` orchestrator run-control trio per §7.3, records the `cmd.debug.*` production wiring-location re-home into the assistant Debug Mode investigation surface, and fixes two stale ContractRef anchors in this document (the retired 5.2.8-era debug-family anchor now targets the §7.1 Debug Mode dispatch family anchor). Every token below is adjudicated in the reconciliation table; the new rows carry the catalog row-level metadata contract (`command_kind`, availability class, confirmation class, `disabled_reasons` subsets drawn only from the closed sets at §7.2/§7.3, and owner) while family semantics, preconditions, and the debug session state machine remain owned by `Plans/Commands_System.md` §7.2/§7.3 and `Plans/FinalGUISpec.md` Run & Debug Revival Addendum F3-482..F3-496 (referenced by unit id only, never restated). The CS-009 boundary stands: `cmd.debug.*` remains the assistant-investigation family (§7.1 owns its semantics, unchanged), and classical debugger dispatch uses only `cmd.run_debug.*`. No existing PlanUnit block, preserved exact token, canonical text, retired bridge, or wiring-matrix row is edited by this addendum. This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime artifacts, or production build tasks; `Concepts/**` materials remain source-lineage-only.

Metadata legend for the registration tables: availability classes are written cozy-style as `session_state (<precondition>)` (availability follows the debug session state machine per §7.2), `selection (<precondition>)` (requires a selected subject), and `always` (enabled whenever the owning surface is visible). Confirmation classes are `none`, `two_step`, and `strong` (destructive, dispatching only through the shared confirm surface per §7.2). `disabled_reasons` values come only from the closed sets at `Plans/Commands_System.md` §7.2 (`unsupported`, `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `capability_absent`, `stale_projection`, `permission_required`) and §7.3 (`stale_projection`, `permission_required`, `unreachable`).

### Run & Debug command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| **Session lifecycle and stepping** | | |
| `cmd.run_debug.start` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.start_no_debug` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.stop` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.disconnect` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.restart` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.attach` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.pause` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.continue` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_over` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_into` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_out` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.session.select` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Launch configuration** | | |
| `cmd.run_debug.config.select` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.add` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.delete` | newly registered | destructive, `strong`; registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.open_file` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Breakpoints** | | |
| `cmd.run_debug.breakpoint.toggle` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.add_function` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.remove_all` | newly registered | destructive, `strong`; registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.toggle_activation` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.goto_source` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.set_exception_filters` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Watch and variables** | | |
| `cmd.run_debug.watch.add` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.remove` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.remove_all` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.set_value` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.copy_value` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.copy_expression` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.add_to_watch` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Call stack, console, and process pane** | | |
| `cmd.run_debug.callstack.select_frame` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.callstack.restart_frame` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.callstack.show_execution_point` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.evaluate` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.clear` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.reveal` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.terminal.reveal` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Orchestrator run-control trio** | | |
| `cmd.run.resume` | newly registered | registered below; Plans/Commands_System.md §7.3 owns semantics |
| `cmd.run.view_log` | newly registered | registered below; Plans/Commands_System.md §7.3 owns semantics |
| `cmd.run.stop` | newly registered | `two_step`; registered below; Plans/Commands_System.md §7.3 owns semantics |
| **Debug investigation verification and cleanup** | | |
| `cmd.debug.record_verification` | newly registered | registered below; Plans/Commands_System.md §7.4 owns semantics; closes the §1.0B verification hole |
| `cmd.debug.run_cleanup` | newly registered | `two_step`; registered below; Plans/Commands_System.md §7.4 owns semantics; closes the §1.0B cleanup hole |

### Run & Debug registration rows

The tables below supply catalog row-level registration only. Labels and preconditions mirror `Plans/Commands_System.md` §7.2/§7.3 verbatim by reference; availability classes, confirmation classes, and disabled-reason subsets map the §7.2/§7.3 class lists without restating family semantics.

Session lifecycle, stepping, and session selection:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.start` | Start Debugging | `domain_action` | session_state (`config_selected && !session_initializing`) | none | `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `stale_projection`, `permission_required` | run_debug |
| `cmd.run_debug.start_no_debug` | Run Without Debugging | `domain_action` | session_state (`config_selected`) | none | `not_configured`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.stop` | Stop Session | `domain_action` | session_state (`session_active`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.disconnect` | Disconnect | `domain_action` | session_state (`session_active && session_is_attach`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.restart` | Restart Session | `domain_action` | session_state (`session_active or session_terminated`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.attach` | Attach to Process | `domain_action` | session_state (`adapter_available`) | none | `adapter_unavailable`, `session_state_mismatch`, `permission_required` | run_debug |
| `cmd.run_debug.pause` | Pause | `domain_action` | session_state (`session_running`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.continue` | Continue | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_over` | Step Over | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_into` | Step Into | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_out` | Step Out | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.session.select` | Select Session | `domain_action` | selection (`session_count > 0`) | none | `stale_projection` | run_debug |

Launch configuration:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.config.select` | Select Configuration | `domain_action` | selection (`config_count > 0`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.add` | Add Configuration | `domain_action` | selection (`panel_visible`) | none | `not_configured` | run_debug |
| `cmd.run_debug.config.edit` | Edit Configuration | `domain_action` | selection (`config_selected`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.delete` | Delete Configuration | `domain_action` | selection (`config_selected && !config_in_use_by_active_session`) | strong | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.open_file` | Open Configurations File | `navigation_wrapper` | always | none | `unsupported` | run_debug |

Breakpoints:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.breakpoint.toggle` | Toggle Breakpoint | `domain_action` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.edit` | Edit Breakpoint | `domain_action` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.add_function` | Add Function Breakpoint | `domain_action` | always | none | `capability_absent` | run_debug |
| `cmd.run_debug.breakpoint.remove_all` | Remove All Breakpoints | `domain_action` | selection (`has_breakpoints`) | strong | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.toggle_activation` | Toggle All Activations | `domain_action` | selection (`has_breakpoints`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.goto_source` | Go to Breakpoint Source | `navigation_wrapper` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.set_exception_filters` | Set Exception Filters | `domain_action` | selection (`adapter_supports_exception_filters`) | none | `capability_absent` | run_debug |

Watch and variables:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.watch.add` | Add Watch | `domain_action` | selection (`session_exists_or_panel_visible`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.watch.edit` | Edit Watch | `domain_action` | selection (`watch_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.watch.remove` | Remove Watch | `domain_action` | selection (`watch_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.watch.remove_all` | Remove All Watches | `domain_action` | selection (`has_watches`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.variables.set_value` | Set Variable Value | `domain_action` | session_state (`session_paused && variable_writable`) | none | `capability_absent`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.variables.copy_value` | Copy Value | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.variables.copy_expression` | Copy as Expression | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.variables.add_to_watch` | Add to Watch | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |

Call stack, console, and process pane:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.callstack.select_frame` | Select Frame | `domain_action` | session_state (`session_paused && frame_present`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.callstack.restart_frame` | Restart Frame | `domain_action` | session_state (`session_paused && adapter_supports_restart_frame`) | none | `capability_absent`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.callstack.show_execution_point` | Show Execution Point | `navigation_wrapper` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.console.evaluate` | Evaluate Expression | `domain_action` | session_state (`session_active`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.console.clear` | Clear Console | `domain_action` | always | none | `unsupported` | run_debug |
| `cmd.run_debug.console.reveal` | Reveal Debug Tab | `navigation_wrapper` | always | none | `unsupported` | run_debug |
| `cmd.run_debug.terminal.reveal` | Reveal Process Pane | `navigation_wrapper` | session_state (`session_active && console_routing == integrated_terminal`) | none | `unsupported`, `session_state_mismatch`, `stale_projection` | run_debug |

Orchestrator run-control trio:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run.resume` | Resume Run | `domain_action` | selection (`run_interrupted`) | none | `stale_projection`, `permission_required`, `unreachable` | orchestrator_runs |
| `cmd.run.view_log` | View Run Log | `navigation_wrapper` | selection (`run_selected`) | none | `stale_projection` | orchestrator_runs |
| `cmd.run.stop` | Stop Run | `domain_action` | selection (`run_active`) | two_step | `stale_projection`, `permission_required`, `unreachable` | orchestrator_runs |

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Wiring_Matrix.md

### Debug investigation verification and cleanup rows

These two rows extend the §7.1 `cmd.debug.*` investigation family per `Plans/Commands_System.md` §7.4, closing the verification-recording and cleanup-dispatch holes in the `Plans/assistant-chat-design.md` §1.0B closed phase model. Neither row re-scopes the family: `cmd.debug.*` remains assistant-investigation only (CS-009), and classical DAP dispatch uses `cmd.run_debug.*`.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.debug.record_verification` | Record Verification Result | `domain_action` | selection (`investigation_active && at_verification_phase`) | none | `stale_projection`, `phase_not_reached` | assistant_debug |
| `cmd.debug.run_cleanup` | Run Investigation Cleanup | `domain_action` | selection (`investigation_active && verification_recorded`) | two_step | `stale_projection`, `phase_not_reached`, `preservation_hold_active` | assistant_debug |

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### Debug family re-home and terminology note

The ten `cmd.debug.*` production wiring rows (`catalog.debug_start` through `catalog.debug_view_evidence`) are re-homed in `Plans/Wiring_Matrix.production.json` from the `Run & Debug > Debug controls` location to the assistant Debug Mode investigation surface, in the same wave as this addendum. `cmd.debug.*` semantics are unchanged and remain owned by `Plans/Commands_System.md` §7.1; classical debugger dispatch uses only `cmd.run_debug.*` per the CS-009 boundary. Terminology follows `Plans/FinalGUISpec.md` F3-495 (referenced).

### UCC-139 - Run & Debug Family Catalog Registration

```yaml
plan_unit_id: UCC-139
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  All 39 cmd.run_debug.* ids minted by Plans/Commands_System.md Run & Debug Revival
  Addendum §7.2 are registered in this catalog with per-row availability class,
  confirmation class, disabled-reason subset, command_kind, and owner metadata per
  the registration tables above. Plans/Commands_System.md §7.2 owns family
  semantics, preconditions, and the closed disabled-reason set (referenced, never
  restated); the catalog remains the row-level metadata owner per the existing
  catalog/Commands boundary.
gui_related: true
gui_classification_reason: Registers row-level metadata for the visible classical debugger controls, their enabled/disabled states, and destructive confirmation surfaces.
depends_on: [UCC-138]
unblocks: [UCC-140, UCC-141]
acceptance_criteria:
  - Every cmd.run_debug.* id from Plans/Commands_System.md §7.2 appears exactly once in the adjudication table and exactly once in the registration tables above.
  - Each registration row declares exactly one availability class, one confirmation class, a disabled-reason subset drawn only from the §7.2 closed set, a command_kind, and owner run_debug.
  - cmd.run_debug.config.delete and cmd.run_debug.breakpoint.remove_all carry confirmation class strong; all other cmd.run_debug.* rows carry none.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: high
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: run_debug_family_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (Run & Debug Revival Addendum §7.2, CS-063; referenced)"
  - "Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-482..F3-496; referenced)"
preserved_exact_tokens:
  - cmd.run_debug.*
  - cmd.run_debug.start
  - cmd.run_debug.breakpoint.edit
  - cmd.run_debug.console.reveal
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate Commands_System §7.2 semantics in this unit or its tables beyond row-level metadata fields.
  - Do not restate the Debug tab or rail panel layout or the debug session state machine here; Plans/FinalGUISpec.md F3-482..F3-496 owns that canon and is referenced by unit id only.
  - Do not re-scope or restate cmd.debug.* semantics; the assistant-investigation boundary per CS-009 and §7.1 stands unchanged.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

### UCC-140 - Orchestrator Run-Control Trio Catalog Registration

```yaml
plan_unit_id: UCC-140
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.run.resume, cmd.run.view_log, and cmd.run.stop are registered in this
  catalog per Plans/Commands_System.md §7.3 with availability class selection,
  confirmation two_step on cmd.run.stop and none on the other two rows, and
  disabled-reason subsets drawn only from the §7.3 closed set. The registration
  resolves the dangling cmd.run.* references from Plans/FinalGUISpec.md's
  run_interrupted CTA card. Run lifecycle semantics remain owned by
  Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md (referenced, never
  restated).
gui_related: true
gui_classification_reason: The trio backs the visible run_interrupted CTA card primary and secondary actions and the run log reveal.
depends_on: [UCC-139]
unblocks: []
acceptance_criteria:
  - cmd.run.resume, cmd.run.view_log, and cmd.run.stop each appear exactly once in the adjudication table and exactly once in the registration tables above, with owner orchestrator_runs.
  - All three rows declare availability class selection; cmd.run.stop carries confirmation class two_step and the other two carry none.
  - Disabled reasons on the three rows come only from the closed set stale_projection, permission_required, unreachable.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: orchestrator_run_control_trio_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (Run & Debug Revival Addendum §7.3, CS-064; referenced)"
  - "Plans/FinalGUISpec.md (run_interrupted CTA card contract row; referenced)"
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate run lifecycle semantics here; Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md own run lifecycle canon.
  - Do not mint additional cmd.run.* ids in this unit or its tables.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### UCC-141 - Debug Family Wiring Re-Home Record

```yaml
plan_unit_id: UCC-141
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The ten cmd.debug.* production wiring rows (catalog.debug_start,
  catalog.debug_stop, catalog.debug_pause, catalog.debug_resume,
  catalog.debug_add_breakpoint, catalog.debug_remove_breakpoint,
  catalog.debug_clear_breakpoints, catalog.debug_view_evidence, catalog.debug_step,
  catalog.debug_collect_snapshot) are re-homed in Plans/Wiring_Matrix.production.json
  from the Run & Debug > Debug controls location to the assistant Debug Mode
  investigation surface, with the matrix edited in the same wave as this addendum.
  cmd.debug.* semantics are unchanged and remain owned by Plans/Commands_System.md
  §7.1; the CS-009 boundary is satisfied because classical debugger dispatch uses
  only cmd.run_debug.*. Terminology follows Plans/FinalGUISpec.md F3-495
  (referenced).
gui_related: true
gui_classification_reason: Records which user-visible surface the assistant Debug Mode investigation controls are wired to.
depends_on: [UCC-139, UCC-077]
unblocks: []
acceptance_criteria:
  - All ten catalog.debug_* wiring rows are recorded as re-homed to the assistant Debug Mode investigation surface; no row changes its ui_command_id or handler contract.
  - cmd.debug.* remains scoped to assistant-thread investigation control per CS-009 and Commands_System §7.1; no cmd.debug.* id is re-registered as a classical debugger dispatch id.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: debug_family_wiring_rehome_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (§7.1 debug dispatch family, CS-009 boundary; referenced)"
  - "Plans/FinalGUISpec.md (F3-495 terminology; referenced)"
preserved_exact_tokens:
  - cmd.debug.*
  - catalog.debug_start
  - catalog.debug_view_evidence
  - cmd.run_debug.*
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate or re-scope cmd.debug.* semantics; Plans/Commands_System.md §7.1 owns them unchanged.
  - Do not edit Wiring_Matrix.production.json or Wiring_Matrix.md from this unit; the matrix re-home is recorded here and owned by the wiring matrix editors.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### UCC-142 - Debug Investigation Verification and Cleanup Catalog Registration

```yaml
plan_unit_id: UCC-142
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.debug.record_verification and cmd.debug.run_cleanup are registered with the
  per-row availability, confirmation, and disabled-reason metadata in the table above,
  extending the cmd.debug.* investigation family per Plans/Commands_System.md §7.4 and
  closing the §1.0B verification-recording and cleanup-dispatch holes found in the
  2026-07-27 assistant Debug Mode gap audit. Plans/Commands_System.md §7.4 owns family
  semantics (referenced); the catalog remains the row-level metadata owner per the
  existing catalog/Commands boundary.
gui_related: true
gui_classification_reason: Verification recording and cleanup dispatch surface as investigation banner/header controls in Assistant Chat's Debug Mode overlay.
split_recommended: false
depends_on: [UCC-141, UCC-077]
unblocks: []
acceptance_criteria:
  - Both rows resolve in this catalog with command_kind, availability, confirmation, disabled_reasons, and owner metadata matching Plans/Commands_System.md §7.4.
  - cmd.debug.run_cleanup carries confirmation class two_step and dispatches only through the shared confirm surface.
  - Disabled reasons for both rows come only from the closed set: stale_projection, phase_not_reached, preservation_hold_active.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: debug_investigation_verification_cleanup_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/assistant-chat-design.md (§1.0B closed debug phase model; verification/cleanup phases)"
preserved_exact_tokens:
  - cmd.debug.record_verification
  - cmd.debug.run_cleanup
  - verification_recorded
  - preservation_hold_active
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate Plans/Commands_System.md §7.4 semantics beyond row-level metadata fields.
  - Do not re-scope these ids to classical DAP debugging; cmd.run_debug.* remains the sole classical namespace (CS-009).
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/Commands_System.md §7.1/§7.4 own cmd.debug.* family semantics; this unit owns only catalog row metadata for the verification/cleanup pair."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

This addendum adjudicates the one command-id hole found by the PMConcept7 integration closure re-check (`cmd.chat.open`) and records the resulting alias. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### PM7 integration command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.chat.open` | alias-of `cmd.chat.open_thread` | found by the 2026-07-28 PM7 integration closure re-check (present in the concept census without an adjudication row); chat-open affordances route the canonical thread-open command; exclusions-registered, never a second primary wiring row |

### UCC-143 - Chat Open Alias Adjudication

```yaml
plan_unit_id: UCC-143
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.open is adjudicated as a compatibility alias of cmd.chat.open_thread:
  every chat-open affordance in the integrated panels routes the canonical
  thread-open command, the alias is exclusions-registered so it never becomes a
  second primary wiring row. The historical PMConcept7 integrated-panels census
  recorded all 135 unique command tokens as canonical or recorded alias at
  census time. That census is not currentness evidence after the PM6/PM7
  rebaseline; a fresh census is required before any current 100%
  integrated-panel claim.
gui_related: true
gui_classification_reason: Chat-open controls are user-visible affordances in the rail panels.
split_recommended: false
depends_on: [UCC-142]
unblocks: []
acceptance_criteria:
- "cmd.chat.open resolves as a recorded alias of cmd.chat.open_thread in this catalog and the exclusions registry."
- "No production wiring row registers cmd.chat.open as a primary command."
- "The preserved PM7 census is explicitly historical/deferred; a fresh census must report zero unresolved tokens before it can serve as currentness evidence."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-index.py validate"
- "python3 scripts/pm-plans-verify.py validate-wiring-matrix"
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Plans/UI_Command_Catalog.md"
- "Plans/Wiring_Matrix.production.exclusions.json"
node_compile_hint:
  mode: chat_open_alias_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
- "Plans/CozyShelves_PM7_Control_Reconciliation.json (historical PM7 census; currentness deferred pending true re-census)"
preserved_exact_tokens:
- "cmd.chat.open"
- "cmd.chat.open_thread"
negative_constraints:
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
- "Do not register cmd.chat.open as a canonical production command; it is alias-only."
stale_retired_dispositions: []
owner_boundary_notes:
- "cmd.chat.open_thread's canonical row semantics are owned by the existing chat command sections; this unit owns only the alias adjudication."
owner_hints:
- Plans/UI_Command_Catalog.md
```

## PMConcept7 Deferred Token Hygiene Addendum - 2026-07-29

This addendum adjudicates the 6 tokens recorded in the scope note of `Plans/CozyShelves_PM7_Control_Reconciliation.json` (the historical 2026-07-28 PM7 census). Each token is classified as newly registered, parser-false-positive, or generic family root, following the PMConcept6 census addendum mechanism (2026-07-16) and the Cozy Shelves command reconciliation table pattern (2026-07-27). These token dispositions do not make the historical PM7 census current against the rebaselined sources. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, final manifests, or production build tasks.

### Deferred token reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.chat.debug_investigation.promote` | newly registered | Promote-investigation button on the assistant chat debug card (`Concepts/pm6-build/parts/29x-pm6-js-chat-data.part.html`); semantics per `Plans/assistant-chat-design.md` (promote a debug investigation to user-visible attention); registration row supplied below |
| `cmd.chat.debug_investigation.dismiss` | newly registered | Dismiss-investigation button on the same card; evidence bundle kept on dismiss per `Plans/assistant-chat-design.md`; registration row supplied below |
| `cmd.notifications.mapping` | parser-false-positive (generic family root) | Bare reference in PM_SETTINGS_DATA (`Concepts/pm6-build/parts/28-js-settings-data.part.html`); canonical verb `cmd.notifications.mapping.update` unchanged; recorded in `Plans/Wiring_Matrix.production.exclusions.json` as a generic family root |
| `cmd.sound.mapping` | parser-false-positive (generic family root) | Bare reference in PM_SETTINGS_DATA; canonical verb `cmd.sound.mapping.set` unchanged; recorded in `Plans/Wiring_Matrix.production.exclusions.json` as a generic family root |
| `cmd.plan_compile.open_build.` | parser-false-positive (prose punctuation) | Trailing-dot capture from the sentence-final period after `cmd.plan_compile.open_build` in PRD mock prose (`Concepts/pm6-build/parts/26-js-prd-annotations.part.html`); the canonical no-dot id is registered (PRD/Planning launch table) and unchanged |
| `cmd.chat.web.` | parser-false-positive (prefix string) | Trailing-dot capture from the comment prefix reference "Commands live under cmd.chat.web.*." in `Concepts/pm6-build/parts/29x-pm6-js-demo-engine-a.part.html`; the `cmd.chat.web` family and its exclusions-registered root are unchanged |

### Debug investigation registration rows

The `cmd.chat.debug_investigation.*` pair registers as assistant-chat-scoped domain actions over the Debug Mode investigation card. `Plans/assistant-chat-design.md` owns the surface semantics; the `Plans/Commands_System.md` section 7 boundary keeps `cmd.run_debug.*` as the sole classical DAP namespace (CS-009), and these ids never re-scope to classical debugging.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.chat.debug_investigation.promote` | Promote Debug Investigation | `domain_action` | selection (`debug_investigation_card_visible`) | none | `stale_projection` | assistant_chat |
| `cmd.chat.debug_investigation.dismiss` | Dismiss Debug Investigation Card | `domain_action` | selection (`debug_investigation_card_visible`) | none | `stale_projection` | assistant_chat |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

## PMConcept7 Home Workspace command reconciliation — 2026-08-04

The Home workspace reuses `cmd.panel.undock`, `cmd.panel.redock`,
`cmd.browser.open_workspace_preview`, `cmd.browser.open_detached_preview`,
`cmd.browser.detach_browser_tab`, `cmd.file.open`, `cmd.terminal.reattach_section`,
and `cmd.theme.set_mode` where their existing
owner contracts already cover the action. `cmd.panel.switch` retains its closed
side-panel vocabulary and is not extended with editor panels, Dashboard, or
terminal sections. `cmd.file.open_with`, `cmd.widget.*`, and
`cmd.terminal.move_pane` retain their existing owner semantics and are not
overloaded with Home surface or workgroup placement semantics.

### New command IDs

| Command ID | Typed arguments and effect | Owner |
|---|---|---|
| `cmd.editor.open_panel` | `project_id`, `workspace_tab_id`, `editor_panel_id`, `target_host?`, `target_slot_index?`, `expected_layout_revision`, `idempotency_key`; opens one stable editor panel without creating buffers | FileManager/FinalGUISpec |
| `cmd.editor.close_panel` | `project_id`, `workspace_tab_id`, `editor_panel_id`, `close_reason`, `expected_layout_revision`, `idempotency_key`; hides the panel without closing tabs or dirty buffers | FileManager/FinalGUISpec |
| `cmd.workspace_layout.move_surface` | `project_id`, `workspace_tab_id`, `surface_instance_id`, `source_host`, `target_host`, `target_slot_index?`, `target_surface_instance_id?`, `insertion_edge?`, `expected_layout_revision`, `idempotency_key`; one semantic move commit | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.resize_surface` | `project_id`, `workspace_tab_id`, `surface_instance_id`, committed width/height/flex values, `expected_layout_revision`, `idempotency_key`; one resize-end commit | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.set_collapsed` | `project_id`, `workspace_tab_id`, `surface_instance_id`, `collapsed`, `expected_layout_revision`, `idempotency_key`; changes presentation collapse only | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.reset` | `project_id`, `workspace_tab_id`, `expected_layout_revision`, `idempotency_key`; resets Home placement only | FinalGUISpec/storage-plan |
| `cmd.terminal.move_workgroup` | `project_id`, `terminal_workgroup_id`, `source_terminal_section_id`, `target_terminal_section_id?`, `create_target_section`, `target_workspace_host?`, `target_slot_index?`, `preserve_session_identity=true`, expected terminal/layout revisions, `idempotency_key`; moves the whole workgroup without minting a PTY | Section15/storage-plan |

### Open-file and Browser target extension

`OpenFile` carries `path`, `line?`, `range?`,
`target_editor_panel_id?`, and `target_editor_group_id?`. `target_group?`
is retained only as an explicit compatibility alias for
`target_editor_group_id?`; it is not a second semantic target.
`cmd.browser.open_workspace_preview` accepts the same optional editor panel/group
target fields and retains focused-panel behavior when omitted. No near-duplicate
open or layout command is introduced.

When either optional editor target causes a persisted panel-visibility or Browser
placement change, the command also emits `workspace.layout_changed` with the exact
changed surface IDs, hosts, slot, revision, and persistence result. A no-change
focus emits no fabricated layout event; the existing Browser session events remain
canonical for Browser creation and state.

Every Home command uses the standard typed UICommand envelope, expected layout
revision, idempotency key, projected availability, and disabled reason. Preview
frames do not dispatch commands, persist records, or emit domain events.

Opening the compact Home menu, either side flyout, a surface options popup, or the
File Manager target flyout is disclosure-only and remains view-local. Selecting
one leaf dispatches exactly one semantic command. An already-open panel or already
active Browser target uses the same command ID with a typed `no_change` receipt;
it never mints a second identity. Disabled terminal limits and an ineligible
Collapse action do not dispatch. Persistence failure returns the command's typed
failed/rolled-back receipt and emits no success event.

### UCC-144 - Home Workspace Command Routing And Leaf Semantics

```yaml
plan_unit_id: UCC-144
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Home disclosure controls are view-local and every selected leaf maps one-to-one to the
  existing typed panel, Browser, file, terminal, theme, or bounded Home command family with
  projected disabled/no-change/failure semantics and no command overload. Amended
  2026-08-12 - the per-surface Move or dock menu leaves are retired as affordances;
  cmd.workspace_layout.move_surface is unchanged and is dispatched from the surface grab
  handle (pointer drag or keyboard pick-up/move/drop) and from the live drop regions, still
  exactly one command and one persist per semantic commit.
  cmd.workspace_layout.set_collapsed is dispatched with the negated current value by the
  terminal collapse chevron, which is a toggle, while the top-bar Collapse Bottom Terminal
  row remains one-way. No new command IDs are minted. Amended 2026-08-13 - Reset Layout is
  dual-surface: the top-bar Home menu Reset Layout row and the Settings Startup & Recovery
  row both dispatch the same cmd.workspace_layout.reset; the concept demo's page reload
  after the top-bar reset is demo-flow behavior only and is not part of the typed command
  contract. Pop Out generalizes: the editor panel, Chat, and Dashboard Pop Out rows all
  dispatch cmd.panel.undock into the single in-canvas float system, and cmd.panel.undock
  and cmd.panel.redock are unchanged. Dragging a surface past the window edge is
  invalid_target and dispatches nothing. Still no new command IDs. Amended 2026-08-13
  (tweak wave) - the top-bar Collapse Bottom Terminal row is now also a toggle: it
  dispatches cmd.workspace_layout.set_collapsed with the negated current value and
  relabels to Expand Bottom Terminal at runtime while collapsed, retiring the earlier
  clause that the top-bar row remains one-way. The row-dock track handle and the within-row
  dividers both dispatch the existing cmd.workspace_layout.resize_surface (the track writes
  the persisted cross_basis_px field); the retired per-pane close glyph dispatched nothing
  itself - cmd.editor.close_panel remains reachable from the kebab Close Panel row. No new
  command IDs are minted by the tweak wave.
gui_related: true
gui_classification_reason: This unit owns command IDs, typed arguments, availability, disabled reasons, and results for visible Home controls.
split_recommended: false
depends_on: [UCC-143, F3-501]
unblocks: [CV-323, F-080, SMPFS-138, UIW-010]
acceptance_criteria:
- cmd.file.open_with retains exactly source_editor, image_viewer, workspace_preview, detached_preview, and diff_review; Panel 1 through Panel 4 routing is only on cmd.file.open/OpenFile fields.
- No Home surface uses cmd.widget.* and cmd.panel.switch keeps its existing side-panel vocabulary.
- cmd.workspace_layout.move_surface is reachable by pointer drag and by keyboard from the grab handle, and carries target_slot_index, target_surface_instance_id and insertion_edge unchanged.
- cmd.workspace_layout.set_collapsed round-trips collapse and expand from the terminal chevron AND from the top-bar Collapse/Expand Bottom Terminal toggle row with one command per activation (tweak wave 2026-08-13).
- Open/focus Browser in Panels 1 through 4 uses cmd.browser.open_workspace_preview with target_editor_panel_id and target_editor_group_id.
- One changed drop/resize dispatches and persists exactly once; pointermove, disclosure, cancellation, unchanged drop, window-exit during a drag, and disabled actions do not dispatch a changed command.
- cmd.workspace_layout.reset is dispatched identically from the top-bar Reset Layout row and from the Settings Startup & Recovery row; neither surface mints a new command ID and the concept demo's post-reset reload is not observable on the command bus.
- cmd.panel.undock is dispatched from the Pop Out row on editor panels, Chat, and Dashboard, each routing into the in-canvas float layer.
- Every applied/no_change/failed result follows CV-323 and the exact canonical event family.
validation_surfaces:
- python3 scripts/pm-validate-wiring-matrix.py
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_command_overload_or_orphan
reasoning_tier: standard
context_scope: home_command_routing
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_command_catalog
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
preserved_exact_tokens: [cmd.file.open_with, cmd.file.open, cmd.browser.open_workspace_preview, cmd.widget.*, no_change]
negative_constraints:
- Do not add Panel 1 through Panel 4 to cmd.file.open_with.
- Do not dispatch on pointermove or popup disclosure.
- Do not mint near-duplicate Home commands.
compatibility_only_notes:
- target_group is only an alias of target_editor_group_id.
stale_retired_dispositions: []
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md, Plans/UI_Wiring_Rules.md]
```

## Shared Runtime Command Catalog Addendum - 2026-08-13

`Plans/Commands_System.md` CS-066 owns the family semantics, complete request/result fields, recovery, accessibility, and regression contract. This catalog registers only the 26 new canonical rows and their row-level dispatch metadata. All are `domain_action` except the read-only `cmd.resource.inspect`, which is `shell_view`. They use no navigation normalization unless a caller subsequently opens a returned subject through the existing route/open wrappers.

### Candidate compatibility and rejection table

| Candidate token | Catalog disposition |
|---|---|
| `cmd.lsp.server.restart` | alias intent -> `cmd.lsp.restart_server`; no new row |
| `cmd.lsp.server.diagnose` | alias intent -> `cmd.lsp.open_problems`; existing diagnostics/status projections supply detail; no new row |
| `cmd.debug.session.start` / `cmd.debug.session.stop` | alias intents -> `cmd.run_debug.start` / `cmd.run_debug.stop`; no new rows |
| `cmd.debug.session.action` | rejected; caller must choose an exact `cmd.run_debug.*` verb |
| `cmd.worktree.provision` / `cmd.worktree.release` | alias intents -> `cmd.git.worktree.create` / `cmd.git.worktree.release`; no new rows |
| `cmd.context.receipt.open` | alias intent -> `cmd.nav.open_subject` or Usage-specific `cmd.nav.open_usage_subject`; no new row |
| `cmd.remote.reconnect` | retained remote wrapper; resolves an exact environment then dispatches `cmd.environment.reconnect` |

### Canonical registration rows

The existing `cmd.remote.reconnect` row is retained and clarified, not newly registered: `RemoteReconnectWrapperRequest` -> `EnvironmentConnectionCommandResult`; selector `online|degraded|offline|auth_blocked`; disabled reasons `target_missing`, `stale_projection`, `topology_unavailable`, `auth_state_mismatch`, `breaker_open`, `permission_required`, `policy_denied`; sole wrapper handler `handlers::remote::reconnect`; `command_kind=domain_action`; `normalization.kind=wrapper`; `normalizes_to_contract=EnvironmentConnectionCommandRequest`; `alias_of_command_id=null`. The wrapper must resolve an exact `ExecutionEnvironmentId` and dispatch `cmd.environment.reconnect`; it owns no second connection state machine.

The `Payload -> result` types, typed fields, result outcomes, receipt-only pending-Event-Authority effect, and exact disabled-reason meanings are owned by CS-066 and consumed here by reference.

| Command ID | Label | Description | Payload -> result | Preconditions / state selector | Disabled reasons | Sole handler | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id |
|---|---|---|---|---|---|---|---|---|---|---|
| `cmd.environment.connect` | Connect Environment | Connects the exact execution environment through its sole supervisor generation. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | `offline`, `closed` | `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::environment::connect` | `domain_action` | `none` | `EnvironmentConnectionSupervisor` | null |
| `cmd.environment.reconnect` | Reconnect Environment | Replaces or rejoins transport for the exact environment without conflating domain sync. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | `online`, `degraded`, `offline`, `auth_blocked` | `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied`, `auth_state_mismatch`, `breaker_open` | `handlers::environment::reconnect` | `domain_action` | `none` | `EnvironmentConnectionCommandRequest` | null |
| `cmd.environment.disconnect` | Disconnect Environment | Requests bounded drain and disconnect for the exact environment. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | state is not `closed` | `stale_projection`, `already_in_state`, `operation_in_progress`, `permission_required` | `handlers::environment::disconnect` | `domain_action` | `none` | `EnvironmentConnectionSupervisor` | null |
| `cmd.thread.outbox.retry` | Retry Queued Thread Command | Retries the same unacknowledged logical command under its existing idempotency identity. | `ThreadOutboxRetryRequest` -> `ThreadOutboxCommandResult` | retryable unacknowledged entry | `outbox_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required` | `handlers::thread_outbox::retry` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.outbox.cancel` | Cancel Queued Thread Command | Records cancellation for a cancellable uncommitted outbox entry. | `ThreadOutboxCancelRequest` -> `ThreadOutboxCommandResult` | cancellable uncommitted entry | `outbox_state_mismatch`, `stale_projection`, `already_in_state`, `permission_required` | `handlers::thread_outbox::cancel` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.request` | Request Thread | Durably requests a thread and reconciles its stable identity after acknowledgement. | `ThreadRequestCommandRequest` -> `ThreadRequestCommandResult` | target current and request admissible | `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::thread::request` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.spawn` | Spawn Child Thread | Durably requests a bounded child thread under exact parent and role lineage. | `ThreadSpawnCommandRequest` -> `ThreadSpawnCommandResult` | parent current and spawn allowed | `stale_projection`, `policy_denied`, `resource_blocked`, `lease_conflict`, `permission_required` | `handlers::thread::spawn` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.await` | Await Thread Condition | Starts an observable asynchronous await without blocking the UI thread. | `ThreadAwaitCommandRequest` -> `ThreadAwaitCommandResult` | current nonterminal target | `stale_projection`, `already_in_state`, `deadline_expired`, `target_missing`, `policy_denied` | `handlers::thread::await_condition` | `domain_action` | `none` | `ObservableWork` | null |
| `cmd.capability.ensure` | Ensure Capability | Resolves or provisions one exact-target capability under Off, Auto, or On policy. | `CapabilityEnsureRequest` -> `CapabilityEnsureResult` | exact target and current policy | `capability_unavailable`, `setup_required`, `approval_required`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::capability::ensure` | `domain_action` | `none` | `CapabilityProvisioner` | null |
| `cmd.tool.discover` | Discover Tools | Advances bounded progressive capability discovery for the current need. | `ToolDiscoverRequest` -> `ToolDiscoverResult` | registry query allowed | `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked` | `handlers::tool::discover` | `domain_action` | `none` | `ProgressiveCapabilityRegistry` | null |
| `cmd.tool.select` | Select Tools | Commits a stable ordered current-generation tool selection without invoking it. | `ToolSelectRequest` -> `ToolSelectResult` | selected refs current and admissible | `stale_projection`, `capability_unavailable`, `policy_denied`, `permission_required` | `handlers::tool::select` | `domain_action` | `none` | `ProgressiveCapabilityRegistry` | null |
| `cmd.installation.install` | Install Capability | Starts explicit proof-based installation for the exact host and environment. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | no ready installation and acquisition allowed | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied` | `handlers::installation::install` | `domain_action` | `none` | `InstallationLifecycleManager` | null |
| `cmd.installation.update` | Update Installation | Replaces a consented installation while retaining the last verified activation until commit. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | verified consented installation | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied`, `target_missing`, `resource_blocked` | `handlers::installation::update` | `domain_action` | `none` | `InstallationLifecycleCommandRequest` | null |
| `cmd.installation.repair` | Repair Installation | Executes a bounded evidence-backed repair plan for a known installation. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | known installation with repair evidence | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied`, `target_missing`, `resource_blocked` | `handlers::installation::repair` | `domain_action` | `none` | `InstallationLifecycleCommandRequest` | null |
| `cmd.installation.rollback` | Roll Back Installation | Activates a verified rollback target without discarding the current verified copy early. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | verified rollback target | `target_missing`, `official_source_unverified`, `host_environment_mismatch`, `operation_in_progress`, `permission_required`, `policy_denied` | `handlers::installation::rollback` | `domain_action` | `none` | `InstallationLifecycleManager` | null |
| `cmd.installation.verify` | Verify Installation | Produces layered proof for installation health and readiness. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | installation resolvable | `target_missing`, `host_environment_mismatch`, `operation_in_progress`, `policy_denied` | `handlers::installation::verify` | `domain_action` | `none` | `InstallationResolver` | null |
| `cmd.authentication.start` | Start Authentication | Starts the selected non-secret auth path after separate installation verification. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | auth path supported | `setup_required`, `auth_state_mismatch`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::start` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.authentication.cancel` | Cancel Authentication | Cancels the current auth operation without silently deleting provider credentials. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | current cancellable auth operation | `auth_state_mismatch`, `already_in_state`, `stale_projection`, `permission_required` | `handlers::authentication::cancel` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.authentication.resume` | Resume Authentication | Resumes the same operation and exact account, route, host, and environment binding. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | same nonterminal authority binding | `auth_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::resume` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.eval.session.start` | Start Eval Session | Starts a supported sandboxed persistent EvalSession under a resource lease. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | supported adapter and no conflicting lease | `unsupported`, `capability_unavailable`, `resource_blocked`, `lease_conflict`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::eval_session::start` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.eval.session.execute` | Execute In Eval Session | Executes artifact-backed code in the current session with bounded output. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | live current session | `session_state_mismatch`, `stale_projection`, `deadline_expired`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::eval_session::execute` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.eval.session.stop` | Stop Eval Session | Stops and cleans the current session with an explicit variable and artifact disposition. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | live or recoverable session | `session_state_mismatch`, `stale_projection`, `operation_in_progress`, `permission_required` | `handlers::eval_session::stop` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.mcp.server.connect` | Connect MCP Server | Connects one enabled valid MCP server under its component-state lifecycle. | `McpServerLifecycleCommandRequest` -> `McpServerLifecycleCommandResult` | enabled valid server | `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::mcp::connect_server` | `domain_action` | `none` | `McpLifecycleManager` | null |
| `cmd.mcp.server.reconnect` | Reconnect MCP Server | Joins or requests the one breaker-governed reconnect for the server generation. | `McpServerLifecycleCommandRequest` -> `McpServerLifecycleCommandResult` | configured server and breaker admits/join | `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied`, `breaker_open`, `auth_state_mismatch` | `handlers::mcp::reconnect_server` | `domain_action` | `none` | `McpServerLifecycleCommandRequest` | null |
| `cmd.resource.inspect` | Inspect Runtime Resource | Opens the read-only current governor, admission, lease, and awareness evidence for an exact resource scope. | `RuntimeResourceInspectRequest` -> `RuntimeResourceInspectResult` | readable exact host/environment | `stale_projection`, `topology_unavailable`, `target_missing`, `permission_required` | `handlers::runtime_resource::inspect` | `shell_view` | `none` | `RuntimeResourceGovernor` | null |
| `cmd.bsd.set` | Set Back Seat Driver Mode | Sets Off, Auto, or On for the selected canonical scope; effective default and recommended value are Auto. | `BackSeatDriverModeSetRequest` -> `BackSeatDriverModeSetResult` | scope writable and projection current | `stale_projection`, `already_in_state`, `policy_denied`, `permission_required` | `handlers::back_seat_driver::set_mode` | `domain_action` | `none` | `BackSeatDriverService` | null |

All 26 rows use the CS-066 shared command envelope, typed response, CAS/idempotency/restart recovery, assistive-technology announcement, and keyboard/pointer parity requirements. Their effects are receipt/projection only while Event Authority remains `UNKNOWN_OPEN`; wiring must record `missing_event_registration` rather than fabricate an expected event. `cmd.capability.ensure` cannot authorize first provider-CLI acquisition, `cmd.tool.select` cannot invoke or widen tools, `cmd.resource.inspect` cannot mutate admission, and `cmd.bsd.set` cannot grant tools, mutation, protected Browser access, or authority.

ContractRef: ContractName:Plans/Commands_System.md#CS-066, ContractName:Plans/Shared_Integration_Runtime.md, SchemaID:pm.shared_runtime.contracts.v1

### UCC-145 - Shared Runtime Command Catalog Registration

```yaml
plan_unit_id: UCC-145
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The catalog registers exactly 26 new canonical generalized shared-runtime
  command rows from CS-066, records seven candidate compatibility intents over
  existing IDs, rejects cmd.debug.session.action, and retains cmd.remote.reconnect
  as a remote wrapper that resolves and dispatches cmd.environment.reconnect.
gui_related: true
gui_classification_reason: Catalog metadata governs visible labels, enabled and disabled state, handler dispatch, progress, recovery, and accessible activation.
split_recommended: false
depends_on: [CS-066, SIR-004, SIR-005, SIR-008, SIR-010]
unblocks: []
acceptance_criteria:
  - Exactly 26 new canonical IDs have typed payload/result references, state selectors, disabled reasons, sole handlers, command_kind, and normalization metadata.
  - Candidate aliases do not receive primary catalog rows and the generic debug action is rejected.
  - cmd.remote.reconnect remains a wrapper and generalized reconnect is cmd.environment.reconnect.
  - Effects are receipt/projection only and explicitly carry missing_event_registration until individual Event Authority admission.
  - Keyboard and pointer activation, accessible disabled/busy/outcome announcements, idempotent replay, restart, CAS, and race fixtures consume CS-066.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command catalog 26-row census and exact-handler uniqueness fixture
  - alias, accessibility, replay, restart, race, and missing-event-registration fixtures
risk_class: catalog_command_or_event_authority_drift
reasoning_tier: high
context_scope: shared_runtime_command_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
node_compile_hint: {mode: shared_runtime_command_catalog, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.1
preserved_exact_tokens: [cmd.environment.reconnect, cmd.remote.reconnect, cmd.run_debug.*, cmd.lsp.restart_server, cmd.git.worktree.create, cmd.nav.open_subject, missing_event_registration]
negative_constraints:
  - Do not register candidate aliases as primary rows or mint Chat, Settings, Onboarding, Doctor, provider, or panel-local clones.
  - Do not name or emit a new EventRecord family while Event Authority remains UNKNOWN_OPEN.
  - Do not treat accepted dispatch or UI acknowledgement as terminal domain success.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
```

## u11 Prism II Usage Command Registration Addendum - 2026-08-18

This addendum registers the one new canonical command the u11 Prism II Usage concept establishes, records
the candidate it rejects, and binds the concept's Settings destinations to the canonical Settings deep-link
identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts,
production build tasks, final manifests, or PNC-019 receipts.

The concept reuses existing catalog rows wherever an owner contract already covers the action:
`cmd.usage.refresh` and `cmd.usage.export` (UCC-116), `cmd.nav.open_usage_subject` (UCC-109),
`cmd.nav.open_subject`, `cmd.provider.switch_route` and `cmd.account.select_profile` (UCC-116), the thread
context detail family, and the `cmd.widget.*` layout family. Only the row below is new.

### New command ID

| Command ID | Typed arguments and effect | Owner |
|---|---|---|
| `cmd.usage.forecast.request` | Usage forecast request envelope in, labelled forecast projection out; receipt/projection effect with no declared event family; state selector `state.commands.usage_forecast_request.availability` and disabled reasons `stale_projection`, `capability_unavailable`, `target_missing`, `permission_required`, `policy_denied`; handler `handlers::usage::request_forecast` | `Plans/Commands_System.md` CS-067 |

The id is legal as written. `Plans/UI_Command_Catalog.md` UCC-006 sets the canonical shape as lowercase,
dot-separated, `cmd.`-prefixed with no segment cap, and `Plans/Wiring_Matrix.schema.json` enforces an
unbounded dotted pattern; the shared-runtime command-name normalization boundary in `Plans/DRY_Rules.md` is
a dedup and owner-routing disposition table, not a segment-count rule, and it normalizes *toward* longer ids
in two of its own rows. Hundreds of certified catalog rows already carry three or more segments.

### Rejected candidate

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.provider.usage.open_management` | rejected candidate; not registered | `cmd.nav.open_usage_subject` already owns usage-subject opens per the `Plans/DRY_Rules.md` normalization boundary, so a second opener duplicates an existing canonical command. The token is recorded in `Plans/Wiring_Matrix.production.exclusions.json` alongside the other adjudicated non-commands and must not receive a primary production wiring row. |

### Settings destination identity

Usage never owns a Settings value. A Usage affordance that would change one deep-links to the owning
Settings surface through the existing `cmd.settings.bloom.open` row, whose canonical envelope is F3-434's
`open(category, focusSettingId)` and whose certified production row is `catalog.settings_bloom_open`. The
category is one of the twelve in `Plans/settings_inventory.json` and the focus target is a real setting id
from the same inventory. The concept's earlier destination envelope, and its manager, section, and
focus-reason vocabulary, were unregistered inventions and carry no catalog standing.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md

### UCC-146 - Usage Forecast Command Registration And Settings Destination Identity

```yaml
plan_unit_id: UCC-146
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The catalog registers exactly one new canonical Usage command, cmd.usage.forecast.request, with typed
  request and result references, a state selector, a closed disabled-reason set, one sole handler, and a
  receipt or projection effect that carries the missing-event-registration disposition while the Event
  Authority denominator remains UNKNOWN_OPEN. Its dotted shape is legal under UCC-006, which sets no segment
  cap and is machine-enforced by an unbounded dotted pattern. cmd.provider.usage.open_management is
  adjudicated as a rejected candidate rather than an alias because cmd.nav.open_usage_subject already owns
  usage-subject opens; it receives no primary row and is recorded as an excluded token. Usage-initiated
  Settings navigation registers no new command: it reuses cmd.settings.bloom.open with a real Settings
  category and a real setting id from the canonical Settings inventory, and the concept's earlier manager,
  section, and focus-reason destination vocabulary is retired as unregistered.
gui_related: true
gui_classification_reason: Catalog metadata governs the visible label, availability, disabled announcement, handler dispatch, and accessible activation of the Usage forecast affordance and the Usage-to-Settings deep link.
depends_on: [UCC-006, UCC-109, UCC-116, CS-067, UF-092]
unblocks: []
acceptance_criteria:
  - cmd.usage.forecast.request has typed request and result references, a state selector, a closed disabled-reason set, a sole handler, and normalization metadata, and is the only new canonical id in this addendum.
  - Its effect is receipt or projection only and carries the missing-event-registration disposition; no event family is named while the Event Authority denominator remains UNKNOWN_OPEN.
  - cmd.provider.usage.open_management receives no primary catalog row and is recorded as an excluded token whose canonical target is cmd.nav.open_usage_subject.
  - Every Usage-initiated Settings destination resolves to cmd.settings.bloom.open with a category and setting id that exist in the canonical Settings inventory.
  - The retired destination vocabulary is recorded as unregistered and never appears as catalog metadata.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage forecast dispatcher, disabled-reason, and deep-link fixtures
risk_class: catalog_command_or_deep_link_identity_drift
reasoning_tier: high
context_scope: usage_command_catalog_registration
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/settings_inventory.json
node_compile_hint:
  mode: usage_command_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - cmd.usage.forecast.request
  - cmd.provider.usage.open_management
  - cmd.nav.open_usage_subject
  - cmd.settings.bloom.open
  - catalog.settings_bloom_open
  - missing_event_registration
  - UNKNOWN_OPEN
negative_constraints:
  - Do not give the rejected candidate a primary catalog or production wiring row.
  - Do not name or emit an event family for the new command while the Event Authority denominator remains UNKNOWN_OPEN.
  - Do not mint a Usage-specific Settings navigation command; reuse the canonical Settings deep-link identity.
  - Do not restore the retired manager, section, or focus-reason destination vocabulary as catalog metadata.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
```
