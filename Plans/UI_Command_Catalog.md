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
- Object-targeting payload semantics move out of `cmd.panel.switch`: it remains a side-panel shell/view command, and any context that becomes object-targeting must become a route-consuming wrapper command or normalized `route_target` argument. Do not promote a broad public `cmd.nav` / `cmd.nav.*` family merely to avoid owner-specific or domain-specific wrappers, and do not let domain wrappers invent private route args; `cmd.project.open`, `cmd.artifacts.show_in_*`, `cmd.artifacts.show_in_` compatibility aliases, chat Usage wrappers, and cross-surface Orchestrator pivots are `navigation_wrapper` commands over canonical route targeting rather than generic layout toggles.
- Routing split cleanup treats `resume_url`, command IDs plus ad hoc args, artifact / `/usage/search` deep links, and the `FinalGUISpec.md` file-open contract as consumers of the same route/open model rather than four competing mechanisms.
- Compact navigation aliases, if adopted, are limited to `cmd.nav.open_subject`, `cmd.nav.open_usage_subject`, and `cmd.nav.focus_route` or an equivalent compact family that normalizes to `route_target` and `OpenSubject`; they must not expand into a second catalog language.
- `cmd.nav.open_subject` or an equivalent compact wrapper resolves file, document, artifact, generated, and report subjects by carrying normalized `route_target` plus `OpenSubject`; `/document/artifact/generated/report` is shorthand for those subject families, not a fourth command-payload language.
- Public `cmd.nav` / `cmd.nav.*` IDs are optional migration aliases, not a replacement target language; wrapper-style `/focus` and open commands may remain user-facing when they normalize to `route_target` and `OpenSubject`.
- Navigation compatibility is not a winner/loser or `/loser` alias table: legacy names can point to wrapper commands, but wrapper classification, route payload, and owner command IDs stay visible instead of hiding route ownership behind a preferred alias.

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

Uncataloged owner signals from `newtools.md`, assistant memory, and project-switch handoffs stay concrete registration obligations until resolved: `cmd.orchestrator.preview_`, `cmd.orchestrator.preview_*`, `cmd.orchestrator.push_image`, `/build/open-artifact`, `CustomHeadlessTool`, `ToolID`, `GATE`, `/tool/permission`, `/permission/config`, `config-file`, `redb-side`, `memory.gist`, `memory.gist.*`, `live.*`, `auto-trigger`, `doctor-check`, `multi-way`, `net-new`, `HITL`, `/project-switch`, `/handoff`, `non-durable`, `final-pass-worthy`, and CtAs must either become stable command/event/storage rows or be explicitly retired by their owner docs.

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

The path-based `open_file` target uses `OpenFile { path, line?, range?, target_group? }`; `target_group` selects editor placement only and does not replace route_target, OpenSubject, or object identity.

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
- The `cmd.orchestrator.open_*` pivots above are compatibility aliases for owner-surface route opens; runtime mutation recovery still maps through `allowed_action_ids[]` to `cmd.runtime.*`, including `restore_safe_point_then_retry`.
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
| `cmd.actions.view_logs` | View Logs | Opens full log output for selected job/step | none | `actions_panel_visible && selected_job` |
| `cmd.actions.open_in_browser` | Open in Browser | Opens the workflow run on GitHub.com | none | `actions_panel_visible && selected_run` |

Rules:
- Actions-to-code commands bridge GitHub Actions to Source Control without moving ownership of hosted runs into Source Control.
- `open_related_diff` and `open_related_worktree` use receipt-backed run id, commit range, changed files, branch, and worktree refs when available.
- If exact correlation is unavailable, commands show candidate commit ranges, workflow file diffs, or related worktrees with an uncertainty label instead of auto-opening a guessed target.
- Legacy underscore commands `cmd.github_actions.show`, `cmd.github_actions.switch_subview`, `cmd.github_actions.rerun_workflow`, `cmd.github_actions.cancel_workflow`, `cmd.github_actions.pin_workflow`, `cmd.github_actions.open_run_log`, and `cmd.github_actions.open_run_diff` are compatibility-only names for the current GitHub Actions command family. They normalize respectively to GitHub Actions route/show state, GitHub Actions `/switch_subview` view-state, `cmd.actions.rerun`, `cmd.actions.cancel`, `cmd.github.actions.pin`, `cmd.github.actions.open_step_logs` or `cmd.actions.view_logs`, and `cmd.github.actions.open_related_diff`; `cmd.github_actions.*` must not become a second primary namespace.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md


| Command ID | Label | Description | Keybind | Preconditions |
|---|---|---|---|---|
| `cmd.actions.rerun` | Rerun Workflow | Re-triggers the selected workflow run | — | `actions_panel_visible && selected_run` |
| `cmd.actions.rerun_failed` | Rerun Failed Jobs | Re-triggers only failed jobs in selected run | — | `actions_panel_visible && selected_run && has_failed_jobs` |
| `cmd.actions.cancel` | Cancel Run | Cancels the in-progress workflow run | — | `actions_panel_visible && selected_run && run_in_progress` |
| `cmd.github.actions.pin` | Pin Workflow | Pins a workflow to the GitHub Actions Workflows surface for quick access and health-badge tracking; `cmd.actions.pin` is a compatibility alias | — | `actions_panel_visible && selected_workflow` |
| `cmd.github.actions.unpin` | Unpin Workflow | Removes a pinned workflow from the GitHub Actions Workflows surface; `cmd.actions.unpin` is a compatibility alias | — | `actions_panel_visible && pinned_workflow_selected` |
| `cmd.github.actions.open_run` | Open Run | Opens a GitHub Actions run detail in the GitHub Actions surface | — | `actions_panel_visible && selected_run` |
| `cmd.github.actions.open_job` | Open Job | Opens the selected job within a run detail | — | `actions_panel_visible && selected_run && selected_job` |
| `cmd.github.actions.open_step_logs` | Open Step Logs | Opens logs for the selected job/step, preserving `/job/step` context | — | `actions_panel_visible && selected_job && selected_step` |
| `cmd.github.actions.open_related_diff` | Open Related Diff | Opens Source Control review/diff context correlated from an Actions run, job, or failing step | — | `selected_run && related_diff_available` |
| `cmd.github.actions.open_related_worktree` | Open Related Worktree | Opens the worktree correlated from an Actions run, job, or failing step | — | `selected_run && related_worktree_available` |
| `cmd.actions.view_logs` | View Logs | Opens full log output for selected job/step | — | `actions_panel_visible && selected_job` |
| `cmd.actions.open_in_browser` | Open in Browser | Opens the workflow run on GitHub.com | — | `actions_panel_visible && selected_run` |

Rules:
- Actions-to-code commands bridge GitHub Actions to Source Control without moving ownership of hosted runs into Source Control.
- `open_related_diff` and `open_related_worktree` use receipt-backed run id, commit range, changed files, branch, and worktree refs when available.
- If exact correlation is unavailable, commands show candidate commit ranges, workflow file diffs, or related worktrees with an uncertainty label instead of auto-opening a guessed target.

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
| `cmd.chat.delete` | Delete Thread | Deletes the selected thread from ordinary navigation after retention/worktree cleanup confirmation | `thread_selected && delete_confirmed && !active_run_in_thread` |
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
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Chat context circle click affordance, command palette |
| `cmd.chat.open_thread_context_details` | `{ thread_id }` | layout/UI state only | Chat context hover module, artifact deep-links |
| `cmd.chat.focus_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |
| `cmd.chat.close_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |

Rules:
- hover-summary disclosure is passive UI and does not require its own stable command ID
- choosing `More Details` dispatches `cmd.chat.open_thread_context_details`
- clicking the circle may reveal `Compact Now` locally, but `cmd.chat.compact_context` is dispatched only when the user actually chooses that action
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
| `cmd.chat.revert` | `{ thread_id, target_message_id? }` | Restore persisted file mutations from one assistant turn; omitted `target_message_id` resolves to the latest assistant turn in the thread with persisted file mutations. |
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
- after a successful revert, affected editors refresh from the canonical mutation pipeline
- `cmd.chat.rewind` MUST NOT be used as a file-restore alias
- `cmd.chat.resend_last_user_message` is distinct from `cmd.chat.retry_message`; resend replays the latest user-authored input, while retry re-runs a failed or cancelled assistant turn
- `cmd.chat.copy_code_block`, `cmd.chat.insert_code_block`, and `cmd.chat.apply_code_block` operate on a resolved code-block sub-selection rather than the entire message body
- Stop/edit/delete message availability is exposed through existing stop, edit/resend, rewind/revert, and retention-policy surfaces; `/edit/delete` is an availability shorthand and not a new delete-message command ID.
- GUI question surfaces support multiple-choice and multi-choice interactions with a freeform `Other` path, while logging and activity metadata remain sliceable across `/agent/tool/model/persona/subagent/token` dimensions.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 2.6.5 Debug Mode UICommand bridge

Debug Mode uses the canonical `cmd.debug.*` UICommand family owned by `Plans/Commands_System.md`; these are internal wiring IDs, not User Commands. The catalog bridge preserves the concrete IDs `cmd.debug.start`, `cmd.debug.stop`, `cmd.debug.pause`, `cmd.debug.resume`, `cmd.debug.add_breakpoint`, `cmd.debug.remove_breakpoint`, `cmd.debug.clear_breakpoints`, `cmd.debug.view_evidence`, `cmd.debug.step`, and `cmd.debug.collect_snapshot`, while leaving investigation lifecycle semantics, preconditions, and evidence behavior in `Commands_System.md`.

ContractRef: ContractName:Plans/Commands_System.md#5.2.8-debug-mode-uicommand-family

### 2.7 Chat slash commands (reserved)

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.
- Exact named obligations that must survive in this reserved family are the six-tool web family, reserved slash-command set, Agent Config and Skills ownership, and the question, TODO, and visualizer terms.
- `/skill use`, `/skill list`, and `/skill show` are not MVP subcommands. Bare `/skill` lists available skills, while `/skill <skill_name> [args]`, the Skills panel, and natural language all invoke the same `invoke_skill` contract.
- Web command GUI help/autocomplete exposes `/web` sub-operations as one reserved built-in family: `/web search <query>`, `/web extract <url>`, `/web research <task-or-question>`, `/web crawl <url>`, and `/web map <url>`. Bare `/web` dispatches `cmd.chat.web.help` as a non-executing help entry; it does not default to top-level `/search` or `/crawl`.
- Legacy top-level tool-name spellings such as `/webfetch` and `/webresearch` are compatibility/tool-key lineage, not active slash-command prototypes; user-facing slash input stays under `/web fetch <url>` and `/web research <task>`.
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
| `cmd.artifacts.show_in_usage` | `{ project_id, route_target, open_subject, artifact_id?, usage_event_ref?, run_id?, thread_id? }` | Opens or focuses Usage on the referenced artifact/usage subject using artifact drill-through and shared route/open identity. |
| `cmd.artifacts.show_in_ledger` | `{ project_id, route_target, open_subject, artifact_id?, ledger_ref?, run_id?, thread_id? }` | Opens or focuses Ledger on the referenced artifact, receipt, or run context using shared route/open identity. |


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
| `retry_now` | `cmd.runtime.retry_now` | `{ run_id, node_id, attempt_id, repo_id?, worktree_id?, baseline_target? }` |
| `resume_after_prerequisite` | `cmd.runtime.resume_after_prerequisite` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `restore_safe_point_then_retry` | `cmd.runtime.restore_safe_point_then_retry` | `{ run_id, node_id, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target }` |
| `start_fresh_attempt` | `cmd.runtime.start_fresh_attempt` | `{ run_id, node_id, attempt_id?, repo_id?, worktree_id?, baseline_target? }` |
| `replan` | `cmd.runtime.replan` | `{ run_id, node_id, attempt_id? }` |
| `skip_node` | `cmd.runtime.skip_node` | `{ run_id, node_id, attempt_id? }` |
| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |
| `open_details` | `cmd.runtime.open_attempt_details` | `{ run_id, node_id, attempt_id? }` |

SCM-targeted retry and `/fresh-attempt` commands support the same worktree reuse policy as restore. `baseline_target` is the closed candidate enum `safe_point | historical_commit | worktree_head`. When a recovery command carries `repo_id`, `worktree_id`, or `baseline_target`, runtime dispatch must validate the targeted worktree and baseline exactly and must reject the command rather than silently substitute another worktree or baseline.

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
- cmd.artifacts.show_in_*
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
- cmd.orchestrator.preview_
- cmd.orchestrator.preview_*
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
canonical_text: Object routes use canonical domain IDs, compatibility widgets remain display-only, History deletion needs durable audit and disposition semantics, OpenFile preserves placement as target_group only, subject-open wrappers cover route/focus pivots, and resume_url is route transport.
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
- OpenFile { path, line?, range?, target_group? }
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
- cmd.orchestrator.open_* pivots are compatibility aliases for owner-surface route opens.
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
canonical_text: GitHub Actions command rows cover show/switch/rerun/cancel, workflow pin/unpin/settings, open current branch, open related diff, logs, workflow/job detail, retry, copy URL, copy logs, open in GitHub, branch-to-diff, and run-to-browser pivots.
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
canonical_text: Chat thread lifecycle and discovery commands create, archive, delete, rename, pin, export, and search threads while preserving transcript, lineage, citations, attachments, audit metadata, stable thread_id, and message focus behavior.
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
negative_constraints:
- Grouped chat lifecycle token does not denote message-level delete or file-restore behavior.
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
canonical_text: Chat context commands compact, open/focus/close thread context details, preserve hover summary as passive UI, dispatch Compact Now only after explicit choice, and supersede thread Usage command IDs through route/open Usage normalization.
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
preserved_exact_tokens:
- cmd.chat.compact_context
- cmd.chat.open_thread_context_details
- cmd.chat.focus_thread_context_details
- cmd.chat.close_thread_context_details
- context.compaction.started
- context.compaction.completed
- More Details
- Compact Now
- cmd.chat.open_thread_usage
- cmd.chat.focus_thread_usage
- cmd.chat.close_thread_usage
- route/open Usage context
negative_constraints:
- Hover-summary disclosure is passive UI and does not require its own stable command ID.
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
canonical_text: cmd.chat.rewind remains conversation-only, while cmd.chat.revert restores persisted file mutations through the canonical FileSafe pipeline using recorded absolute paths and refreshes affected editors through the mutation pipeline.
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
- UCC-075 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
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
negative_constraints:
- cmd.chat.rewind MUST NOT be used as a file-restore alias.
- cmd.chat.revert must not reinterpret relative paths through the current working_directory.
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
- 'ContractRef: ContractName:Plans/Commands_System.md#5.2.8-debug-mode-uicommand-family'
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
canonical_text: Reserved slash commands keep /web as one stable subcommand-required family, route natural-language web intents through the same dispatcher, map reading to webfetch, and lock /skill GUI, slash, and natural-language invocation paths to the same invoke_skill contract.
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
canonical_text: SCM-targeted retry and fresh-attempt recovery commands support the same worktree reuse policy as restore; baseline_target is the closed safe_point/historical_commit/worktree_head enum and runtime dispatch must validate repo, worktree, and baseline exactly.
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
- ACD-426
- CS-053
- PS-122
- F3-403
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
