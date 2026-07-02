# Orchestrator Page -- Single-Page Seven-Tab Specification


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Owner-first canonicalization order
### Shared governance/runtime record envelope


### Concern record family definition
### Concern lifecycle and resolution kinds
### Concern routing and object-first search behavior


### Concern action policy and authority model
### Concern linkage to adjacent families


### Promotion classes and gate evidence
### Focused run and historical routing contract


### Source Control and worktree handshake


### Projection trust and action gating
### Progress-only widget hostability
### Shared escalation ladder
### Action-surface policy
### Glossary and help governance
### Notification routing policy
### Project summary projection
### Project attention projection


### Account switch and pressure history


### Coverage blocker concern lifecycle owner section
### Concern owner vs creator vs resolver separation
### Concern source-event vs record vs projection split


### Dismissed vs resolved rationale enforcement
### Concern update heuristics
### Help entry template and related-concept clusters
### Blocked-owner eight-kind taxonomy and escalation ladder surfaces
### Artifact envelope routing preference
### Recommended minimum concern record shape
### Concern ownership / authority direction


## 1. Scope and canonical model

Orchestrator is the core scheduling, concern tracking, blocked-state handling, and runtime-identity management system. It is not the UI, CLI, or external provider.

The /page-shell is a seven-tab single-page surface with canonical tabs `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`. Node Graph Display remains a native Orchestrator view over `Plans/Orchestrator_Page.md`, `Plans/orchestrator-subagent-integration.md`, `/Orchestrator_Page.md`, and `/orchestrator-subagent-integration.md`; `Plan Compile` is a dedicated compile projection tab, and `Tiers` plus tier-era tab labels survive only as compatibility/search aliases while the canonical runtime model is node/package/seam/lane aware.

### GUI / PMConcept Plan Compile launch repair (2026-07-02)

Orchestrator Plan Compile consumes the Planning Wizard `Approve And Build` approval transaction; it does not create a second ordinary build launch. When `cmd.planning_wizard.approve_and_build` succeeds locally, Orchestrator opens `Plan Compile` with either the returned durable `plan_compile_run_id` or a pending-launch projection tied to the approval command and idempotency key. If `PlanApproved` publication or projection reconciliation lags, the tab displays pending-launch status and then binds to the durable `PlanCompileRun` without creating a duplicate.

The Orchestrator GUI must not expose `START`, `BUILD`, or `Approve & Continue` as ordinary launch controls for the same approval inputs. Retained controls use scoped commands: `Open Plan Compile` focuses the Plan Compile tab, `Open Build` is disabled until `BuildStarted` or a resulting build identity exists, and HITL continuation uses `cmd.runtime.approve` or another blocked-action command with approval scope, disabled reason, and receipt evidence. Stale `tiers` tab ids are compatibility/search aliases only; active route payloads use `tab_id = plan_compile`.

Blocked and HITL routing records preserve `/blocking/HITL`, `/model/effort/persona/account`, `/target`, `/display`, `/snapshot`, field-shape, resolution_thread, `/severity/blocking`, `/review/corroboration`, `/chat`, `/result`, `/package`, `/fallback`, safe-point, lane, review, attempt, and promotion fields so blocked decisions remain reconstructable from the displayed page state.

Runtime artifact schema references preserve schema-family, `Plans/Runtime_Artifacts_Panel.md`, `/Runtime_Artifacts_Panel.md`, and `/project` when Orchestrator points into artifact panels or project-scoped artifact records.

Stale widget compatibility is explicit: stale-spec, widget-card, widget.tier_tree, Orchestrator single-page with 6 tabs, tier/session, `Plans/feature-list.md`, `/feature-list.md`, tier_id, `/session`, `/orchestrator`, `/task/subtask`, widget.current_task, widget.progress_bars, and Tiers are legacy compatibility inputs rather than the current ownership model.

Attention routing classifies concern records with attention-card-worthy, seam.*, node.*, package.*, account.*, recovery.*, promotion.*, history-only, badge-worthy, graph_patch.*, corroboration.*, action-required, chat-thread-worthy, `/UI`, graph_patch, and user-facing flags.

Concern actions expose audit_fields and action metadata: resulting_status_or_lineage, confirmation_level, rationale_required, allowed_actor_kinds, and reversibility are mandatory fields for action audit and display.

Projection freshness can be actor-driven or user-driven. projection-freshness, `/account`, trust_tier, switch-history, and concrete-account details must remain visible when account state or projection trust affects Orchestrator behavior.

Worktree and branch context preserves base-branch, `Plans/WorktreeGitImprovement.md`, and `/WorktreeGitImprovement.md` whenever Orchestrator displays or routes worktree state.

Concern state rows preserve `/user`, `/governance`, active, resolved, dismissed, and acknowledged as canonical state and ownership context.

ownership-signaling supports noise-control and supersede behavior without collapsing resolution_kind values: merge, split, dismiss, resolve, and acknowledge remain separate action families.

Recovery patch decisions preserve `/recovery/patch`, compensating_action_only, strong, supersede, accepted_risk, none, light, merge, split, active, reopen, resolve, dismiss, reopened, and acknowledge outcomes.

Operational summaries use operational-summary, project_state:v1:{project_id}, project_id, project_state, project_summary, and projects:v1 records for project-level Orchestrator projection state.

Promotion-gate visibility is canonical Orchestrator data: lane_to_package, package_to_seam_available, seam_complete, package-level, package-overseer, `/review`, `/runtime`, `/remediation`, `/critical`, seam-consumable, and GUI readiness must be visible as separate gate facts rather than collapsed into a generic promotion state.

Live page field naming may expose live-status labels, but live-status remains bound to canonical `/storage` and runtime contracts instead of page-local authority.

Runtime and `/overseer` actors may propose actor-driven concern-state transitions, but accepted_risk, dismissed, and acknowledged outcomes retain explicit authority checks and audit lineage.

Prompt and defaulting references preserve `Plans/Prompt_Pipeline.md`, Prompt_Pipeline, tier_id, plan_or_tier_default, and `/package/node/lane` compatibility while the active Orchestrator authority model remains package, node, and lane scoped.

Orchestrator ownership is limited to page layout and controls, view-model/projections, and run control intents; canonical runtime enums, event semantics, and scheduler truth remain owned by runtime, storage, and scheduler contracts instead of page-local prose.

Worktree projection rows preserve `Plans/WorktreeGitImprovement.md`, `/WorktreeGitImprovement.md`, and `/lane-aware` vocabulary whenever Orchestrator displays worktree state or routes worktree decisions.

Approval identity and blocked-state keying preserve `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, request_id, blocked_sequence, and `/keying` so restart and concurrency behavior cannot conflate a request identity with a sequence identity.

Dense blocked-owner views preserve `Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `/aging`, blocked-owner, `/switch`, dense-tab, saved-view, sort-default, and historical-mode behavior as explicit display and filtering rules.

Blocking review policy is automation-first by default, with `/HITL/critical-decision`, `/seam/other`, multi-surface notification, HITL boundaries, chat-thread-based resolution, and `/review` evidence required when package, seam, or governance policy asks for human resolution.

Primary schemas may model node-level facts, but Orchestrator must disclose where GUI, package, feature seam, lane, promotion class, contamination state, resolution thread, or effective account identity are outside node-level schema coverage.

Promotion records preserve lane_to_package, package_to_seam, seam_completion, `/reopen`, `/corroboration`, blocking refs, concern refs, review refs, decision outcome, and revocation/reopen lineage as first-class decision fields.

Bulk concern actions include `/concerns`, `/remove`, History, Evidence, and Ledger targets; selected items must keep routeable object identity when acknowledging, archiving, removing, or opening retained views.

Noise and degraded-state handling preserves `/disclosure`, `/noise`, `/degraded`, attention_required, and blocked so Orchestrator can suppress low-value alerts without hiding degraded or blocking state.

Account switch display splits account_switch_reason into current-state and historical-state facts: pressure cause, switch outcome, and historical lineage are separate fields rather than one overloaded reason string.

Worktree/source-control authority is rewrite-native: `/source-control`, `/worktree`, under-owned emitters, blocked worktree reasons, lane/worktree binding, Source Control state, and Orchestrator receipt lineage must identify one canonical owner for current state while preserving historical lineage.

Executor compatibility references preserve `Plans/Executor_Protocol.md`, Executor_Protocol, `/seam`, `/lane`, top-level, and first-class package/seam governance vocabulary so legacy scheduler addenda do not keep singular-overseer semantics alive.

Storage projection audits track downstream-assumed families from `storage-plan.md`: project summary, attention items, concern records/projections, account pressure, switch history, projection freshness, `/health`, `/projections`, and storage-plan ownership.

Alert levels separate Info, Warning, Attention, and Action Required; Dashboard summarizes `/urgency`, Orchestrator provides operational alert context, and a chat thread is reserved for situations that need user `/decision` rather than general warnings.

Acknowledgement policy preserves acknowledged as distinct from resolved and dismissed; it is for advisory `/minor/non-blocking` concerns the user has explicitly seen or `/accepted`, and blockers that require action cannot be acknowledged in place of resolution.

Projection fallback prefers projection-backed current surfaces; when trust drops, the surface stays open with last-updated, degraded reason, refresh/recover action, and a fallback to `/record`, record-backed History, Ledger, and direct evidence inspectors.

Search results carry canonical route targets rather than highlight-only matches: focused_run_id, destination tab, selected object id, optional filter payload, optional inspector `/detail`, and detail target must be reconstructable from the result.

Search and command-palette routing remains `/object-first`: results preserve exact run identity, avoid collapsing similarly named seams, `/packages/nodes`, or work packages across unrelated runs, and use the shared record-envelope route payload rather than highlight-only matches.

Concern is a high-level first-class Orchestrator object. The lifecycle includes active, acknowledged, resolved, and dismissed; runtime, package overseer, seam overseer, corroboration outcome, and graph patch logic may create canonical concerns, while workers nominate concerns rather than minting canonical concern records directly.

Runtime account examples preserve their literal display shape: `Account policy: Auto switch (Project policy)`, `Effective account: gemini-oauth-2`, `Switch reason: rate_limit_pressure`, gemini-oauth-2, and rate_limit_pressure.

Interaction policy binds concern state to escalation, blocked-owner to message routing, and stale or `/degraded` trust to notification suppression or qualification so stale/degraded trust never emits unqualified action messages.

Blocked-owner summaries identify the primary blocked owner or attention owner instead of only saying blocked; canonical examples include Run, Concern, Source Control, GitHub, Auth, Usage pressure, Wizard, and Recovery.

Trust-qualified routing distinguishes strong canonical inputs from projection-derived warnings: canonical blocked episodes, approval waits, persisted thread states, and `/wizard` states may drive strong routing, while projection-derived rows must carry trust qualification.

Worktree legacy compatibility is explicit: `WorktreeGitImprovement.md`, `/tier`, `/node`, tier_id, `/storage`, `/package`, `/worktree`, get_tier_worktree, get_tier_worktree(tier_id), owner run/tier, tier-keyed, tier-based branch/worktree naming, and older `Progress, Tiers, History, and Node Graph` labels are retained as compatibility fields, not execution-canonical authority over lane/package/node attempts. The active shell remains `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`.

Runtime cross-cutting authority records preserve command namespace promotion, capability-state ownership, cleanup/remediation lineage, packaging lineage, container publish authority, actor-scope, `/rules`, and `/remediation` ownership rather than leaving these concerns under generic runtime policy.

The concern action-model keeps user-facing GUI actions narrow: open, focus, open evidence, open history, open ledger, acknowledge, dismiss where allowed, open resolution thread, and approve/reject only for true `/HITL` boundaries; runtime `/overseer` actions remain non-generic and cover request corroboration, route to remediation, request graph patch, severity `/owner` mutation, merge `/split`, and true resolution.

Stale projection fallback degrades from summary `/projection` surfaces to direct record-backed inspection; Ledger and direct record views are the trust anchor under degraded projection health, and only current `/generation-matched` direct records may support action.

Promotion state transitions are explicit runtime state, not implicit side effects: automation-first remains the default, optional HITL may pause an otherwise-valid promotion, and `/HITL/critical` promotion states must surface on Dashboard, Orchestrator, and a spawned chat thread.

Tier authority is compatibility state only: tiers may remain first-class in widgets, breadcrumbs, HITL boundaries, and state displays, but `/package/seam`, node, package, seam, and lane authority determine canonical execution input.

Every mutating action is classified by confirmation level and reversibility so the UI can separate low-risk navigation from irreversible or high-confirmation mutations.

Notification mapping sends everything chronologically to History; Progress and Dashboard show active warnings, attention, blocked states, `/severity` markers, and badges; `/thread`, chat, or `/input` surfaces are reserved for user decisions, while system notifications stay high-value and sparse.

Escalation examples preserve owner-specific routing: User may receive `/chat`, `/Progress` CtA, Dashboard CtA, or system notification; Package Overseer, Seam Overseer, and Corroboration use operational surfaces first; Runtime, Recovery, and Graph Patch often route to `/History/Node` and Progress/History/Node Graph; External Resource usually starts as `/banner` before system notification.

Concern notification alignment preserves acknowledged as reminder-noise reduction, active plus execution impact as escalation input, and dismissed as presentation suppression without clearing canonical blocked episodes that remain active.

Reconciliation risk is modeled as authority semantics as much as storage or `/schema` drift, so Orchestrator must preserve owner authority alongside schema-facing projection records.

Native surface ownership preserves `Widget_System.md`, Widget_System, `Orchestrator_Page.md`, Orchestrator_Page, widget-composed, widget-heavy, and Progress compatibility: only Progress remains widget-heavy, while Plan Compile, Node Graph, Seams, Evidence, History, and Ledger are native Orchestrator surfaces.

The canonical concern action matrix spans confirmation level, rationale requirements, who may perform the action, reversibility model, and lineage side effects for every action family.

Lane and worktree help is intentionally asymmetric across surfaces: Orchestrator explains lane as the operational object, while Source Control explains worktree as the concrete Git object.

Concern and trust ownership distinguishes remediation-linked finding_refs[] and finding_refs from non-remediation concern posture, projection freshness, and degraded-action gating; these must have a canonical owner rather than only node rendering.

Cross-doc account ownership remains open for `Multi-Account.md` references: design-open questions are not closed while requested concrete account, switch history, conversational actor fields, and trust behavior still cross-doc ownership boundaries.

Project summaries preserve project_summary, project_id, activity_state, attention_state, health_state, primary_owner_kind, primary_reason_code, primary_attention_item_id, primary_object_ref, active_run_count, background_run_count, blocked_run_count, attention_item_count, historical_run_count, projection_trust_state, summary_generated_at_utc, and last_activity_at_utc.

Usage and multi-account surface split is explicit: Projects shows coarse `/usage` and `/account` pressure, Dashboard shows cross-project pressure, Orchestrator shows execution-specific provider/account pressure, and the Usage page owns account-level breakdown, role usage view, switch history, and `/multi-account` redesign scope.

Concern lifecycle remains active, acknowledged, resolved, and dismissed; duplicate lifecycle references must preserve the same four states rather than introduce alternate terminal vocabulary.

Review records preserve review_id, review kind, package review, seam review, verifier/reviewer review, target scope refs, requested `/effective` `/reviewer` identity, review criteria `/profile`, findings summary, finding refs, concern refs, verdict, decision, linked artifacts `/evidence`, and timestamps.

Historical state rules distinguish blocked episodes, concern resolution, and annotation workflow: a blocked episode can become historical after resolution, concern can resolve through accepted_risk or superseded as well as fixed, and annotation resolved is workflow completion rather than proof that the runtime problem disappeared.

Repeated lifecycle evidence keeps active, acknowledged, resolved, and dismissed as the canonical concern lifecycle for both earlier and later references.

Provider pressure and account switches support both provider-wide and account-specific views so account pressure episodes and switch events can aggregate by provider while preserving concrete account lineage.

Governance/runtime records use a shared record-envelope plus a family payload block. Concern payloads carry severity, category, owner, lifecycle, and resolution_kind; promotion payloads carry promotion_class, source_scope, target_scope, canonical verdict, and revoked `/reopened` lineage; recovery payloads carry blocked episode refs, action ids, preconditions, results, and safe-point refs; review payloads carry review scope, findings counts, unresolved findings, verdict, and canonical findings summary refs. Family payloads remain structured records distinct from artifacts or rendered summaries.

Open owner-decision guardrails remain explicit rather than hidden: requested concrete account, operational identity / actor role, switch-history and pressure timeline, projection-freshness naming/ownership, and concern-transition authority splits retain design-open status until their owning docs close them. Usage and account projections stay project-scoped by default; multi-project aggregation is a separate later concern, and per-project Orchestrator storage `/projection` remains the active direction.

Authority presentation must not collapse back to one monolithic Puppet Master center. Seam/package overseer scopes, `/package` authority, blocked-owner attribution, and `/system/user` separation stay visible, and GitHub auth `/scope/rate-limit` failures raise concern-aware hooks without turning blocked-owner semantics into generic error banners.

Reconciliation readiness is classified instead of treated as one undifferentiated blocker: still-structural gaps, spec-integrity failures, and plain reconciliation cleanup are separate `/owner` buckets for retargeting owner docs, stale consumers, and mirror/checklist followers.

### Search, routing, and action policy

#### Concern routing and object-first search behavior
- Concern search results route as run-aware, object-first results with focused-run and target-tab context.
- Concern drill-down preserves the selected `concern_id` and related object context.

#### Concern action policy and authority model
- Concern actions define actor authority, confirmation, rationale, reversibility, and audit fields.
- `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions.

#### Projection trust and action gating
- Orchestrator surfaces use the projection states `current`, `refreshing`, `stale`, `degraded`, and `unavailable`.
- Sensitive actions require `current` data or direct canonical revalidation; degraded mode falls back to record-backed views.
- `/weak-integration/freshness` is a concern-backed projection guard: `category = weak_integration` applies when an owner record, consumer projection, or corroborating source for a seam is missing, stale, degraded, or mutually inconsistent.
- Freshness is buildable state: mutation-capable projections carry `projection_state`, `last_observed_at`, `source_event_ref`, and `revalidation_route`; `stale`, `degraded`, and `unavailable` disable mutation unless the owner surface performs current direct revalidation first.

#### Temporal wait and stale-observation presentation
- Orchestrator renders wait and timeout semantics from canonical runtime/storage projections rather than guessing from elapsed wall-clock time.
- A scheduled workflow with no fresh observation displays a stale-observation or refresh-needed state, not `skipped/failed`, until the owner source reports a missed run or a configured overdue threshold is reached.
- Known future-timestamp waits, environment wait timers, approval waits, queue waits, and other long-governance-wait states do not produce stall banners and do not invoke auto-pause behavior meant for `deadlock/stall`.
- When a timer actually expires, the visible card shows the retained `timeout_class` (`hard execution timeout`, `inactivity timeout`, `polling timeout`, `reconnect timeout`, or `user-visible wait timer expiry`) and routes recovery through the stored blocked episode or receipt.
- Surfaces may show waiting-until or next-observation-due copy, but that copy remains presentation; it does not create a new blocked reason, failure class, or receipt identity.

#### Progress-only widget hostability
- Widget-composed Orchestrator content is restricted to `Progress`.
- `orchestrator:progress` persists separately from Dashboard and Usage layouts.

#### Action-surface policy
- Every affordance is classified by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility.
- Bulk actions default to navigation and triage rather than live execution mutation.

#### Progress widget catalog and drill mappings
- Orchestrator consumes the same 13-widget Progress catalog from FinalGUISpec Appendix C:
  1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
  2. `progress.current-task` → Node inspector for the active execution unit
  3. `progress.lane-health` → Lane row filtered to the selected lane/worktree
  4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
  5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
  6. `progress.approval-queue` → Concern inspector showing pending approvals
  7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
  8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
  9. `progress.worktree-state` → Source Control worktree row with lane/package/run refs
  10. `progress.account-pressure` → Historical `account_pressure_episode` list
  11. `progress.account-switches` → Historical `account_switch_event` list
  12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
  13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list
- Progress labels/taxonomy transfer with the catalog: state labels `queued|running|attention_required|blocked|recovering|degraded|complete`; action labels `Inspect|Focus run|Open evidence|Request approval|Acknowledge|Dismiss|Resolve|Retry recovery`; alert taxonomy `advisory|attention_required|blocked|escalated|degraded_projection`; event taxonomy `run_started|node_started|node_completed|concern_opened|approval_requested|approval_decided|recovery_started|recovery_completed|artifact_published|account_switched`; condition-aging keeps advisory warnings quietable, resurfaces `attention_required`, and never auto-quiets `blocked` or `escalated`.
- Tiers-first compatibility must not govern Progress widgets: phase-grouped run-graph presets, single-current-task widgets, tier-shaped correlation, and active-tier terminal selection are compatibility views only. The base-struct and prose-table layers must catch up to node/package/seam/lane runtime identity, `/package/seam` authority, and record-backed summaries.

#### Artifact envelope routing preference
- Cost-bearing artifact routing prefers `usage_event_ref` instead of timestamp heuristics when linking to Usage and Ledger.
- Runtime artifacts that summarize external operations must carry receipt linkage.

#### External runtime receipt and blocked-state pivots
- Orchestrator remains the page-level recovery owner for blocked flows, while Source Control, GitHub Actions, Docker Manager, and Docker Manager Kubernetes views mirror the same blocked episode, same `blocked_reason_code`, same ordered `allowed_action_ids[]`, same requested/effective state, and same explanation text.
- Run history and blocked cards expose publish-capable chains directly: build result, Docker publish result, `publish_result_id`, template repo status/id, follow-on event refs, deployment refs, and workload refs. Missing downstream links are shown as `missing-link` explanations with `not-attempted`, blocked, failed, stale, or unknown state rather than being omitted.
- `Open running container` resolves into Docker Manager `Containers` only when a real container exists. If container URL, port, health, logs, shell, or stats discovery is uncertain, the Orchestrator card opens the Docker Manager asset row with the same uncertainty and recommended validation action.
- External side-effect receipts distinguish local-vs-remote and vs-remote outcomes. `indeterminate_remote_outcome` records `requested`, `transport_lost`, and later `reconciled` state plus a `Refresh remote state` CTA. Capability-level degradation and the local-vs-remote degraded-mode split keep local work available where safe: local Git can continue during hosted-degraded GitHub state, Docker local runtime can continue during registry outage, and manifest editing can continue while cluster access is offline.
- Mutable targets owned by an active run carry `owned_by_run`; manual mutation of owned worktrees, preview containers, or rollout-associated workloads blocks, requires explicit override, or forks control explicitly. Receipts record the override source and resulting ownership.
- Terminal-state precedence rules for cancel/complete races are explicit; examples: cancel requested after a remote run already completed, container stop requested after the container already exited or restarted, and rollout cancel requested after a new revision already became ready. The receipt reconciles to an informational terminal state such as `completed_before_cancel`, `already_stopped`, or `already_replaced` instead of overwriting the completed outcome as failed.
- The seven-tab Orchestrator page remains central but is not the owner for every remediation surface. SCM/Actions/Docker/Kubernetes lineage receipts, blocked-state recovery pivots, and exact deep-link contracts route to Source Control, GitHub Actions, Docker Manager, and Kubernetes owner surfaces rather than duplicating panel-local remediation.
- Feature-complete blocked-state wiring uses domain payload schemas. SCM blocked payloads include `dirty_worktree` and `worktree_conflict`; Actions payloads include auth expired, missing scope, no GitHub remote, rate-limited, and environment waiting for review; Docker/Kubernetes payloads include runtime unavailable, repo missing, Buildx/Bake unavailable, compose invalid, cluster unreachable, and namespace/workload missing. Actions health/failures/readiness blockers have a Dashboard/Orchestrator widget contract that carries workflow/job/step correlation, code pivots, `/job/step`, `/failures/readiness`, and `Replay from last known good` context into GitHub Actions rather than leaving Orchestrator with panel-local summaries. Orchestrator must not dispatch an Actions-dependent step from a stale readiness snapshot; it revalidates or routes to GitHub Actions before the mutation.

#### Owner-surface command routing

Orchestrator UICommand exposure for recovery and navigation is delegated to `Plans/UI_Command_Catalog.md`. Orchestrator may surface `cmd.orchestrator.open_in_source_control`, `cmd.orchestrator.open_in_github_actions`, `cmd.orchestrator.open_in_docker_manager`, `cmd.orchestrator.open_kubernetes`, and `cmd.orchestrator.open_receipt` only as route-open pivots into owner surfaces with the same `run_id`, `node_id?`, `blocked_sequence?`, `receipt_ref?`, and target owner context carried by the blocked episode or artifact receipt. Runtime mutation recovery still maps through ordered `allowed_action_ids[]` to `cmd.runtime.*`; Orchestrator MUST NOT mint panel-local mutation semantics for Source Control, GitHub Actions, Docker Manager, Kubernetes, evidence, or artifact actions.

### Current vs historical run behavior

#### Focused run and historical routing contract
- Orchestrator uses `active_run_id` / `focused_run_id` together with `focus_mode = live | historical`.
- Cross-tab deep links and search pivots stay coherent on the focused run rather than jumping back to the active run implicitly.

#### Debug resume target revalidation
- Before Orchestrator resumes a Debug investigation, it revalidates the linked `dev_session_id`, `browser_session_id`, DAP session identity, and remote authority against the stored route and runtime identity. If any linked identity is stale but recoverable, the run stays in `attention_required` with `attention_required_reason_code = session_reconnect_required`; if the linked identity no longer exists and no deterministic rebinding target exists, it stays in `attention_required` with `attention_required_reason_code = target_selection_required`. Orchestrator must not silently mint or infer a different target identity to continue execution.

#### Account switch and pressure history
- Orchestrator stores append-only `account_pressure_episode` and `account_switch_event` families.
- Usage, History, Ledger, and Orchestrator all consume the same durable event family.

### Concern and notification model

#### Concern linkage to adjacent families
- Concerns expose `review_refs`, `corroboration_refs`, `graph_patch_refs`, `recovery_refs`, `blocked_episode_refs`, and `promotion_refs`.
- Blocked episodes may reference concerns without replacing concern identity.

#### Notification routing policy
- Notifications route by severity, execution impact, blocked owner, persistence, and projection trust.
- Quiet windows are allowed for advisory warnings, but never for canonical blocked episodes.

#### Dismissed vs resolved rationale enforcement
- Dismissal requires dismissal rationale and resolution requires resolution rationale.
- `accepted_risk` is a resolution path rather than a dismissal.

#### Concern update heuristics
- Repeated sightings use source/scope/category/lineage-aware heuristics to decide whether to update an existing concern or mint a new concern record.

### Project summary, attention, and escalation

#### Shared escalation ladder
- One escalation ladder is shared across Orchestrator, Dashboard, thread badges, and notifications.
- `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence.

#### Orchestrator-wide scale contract
- Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across dense tabs.
- Scale is a cross-tab contract rather than a graph-tab-only concern.

#### Project summary projection
- `project_summary` contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure.
- Canonical blocked episodes override weaker derived warnings in summary rollups.

#### Project attention projection
- `project_attention_item` carries a primary route payload and projection-trust disclosure.
- The same attention row is consumable across Orchestrator, Dashboard, and notifications.

#### Help architecture and project status taxonomy
- Help uses a dedicated help-entry architecture with related-concept linking.
- Project taxonomy defines `activity_state`, `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules.

#### Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Blocked-owner kinds are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- Escalation levels are `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with surface mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Source Control boundary

Orchestrator remains the lane-pool operational truth, while Source Control is the concrete repo/worktree operator.

Source Control's unified worktree inventory includes assistant-owned worktrees alongside orch-owned worktrees. Rows preserve the owning thread, package, lane, run, and worktree refs available for each owner class, so this boundary is a shared ownership statement rather than exclusive orch ownership.

Rules:
- Worktree rows display owning package, lane, and run refs together with lifecycle state and blocked/recovery state.
- run detail can open review mode scoped to that run's commit range or worktree, preserving run, lane, package, and worktree identity in the route payload.
- blocked worktree cards should include affected file list and an `Open Conflict Assistant` action that routes to the `Source Control > Changes` conflict group through `cmd.source_control.open_conflict`.
- SCM lineage acceptance is explicit for Orchestrator surfaces: every mutation-capable attempt resolves to `repo/worktree/branch/head`; every `dirty_worktree` or `worktree_conflict` blocked episode shows the exact worktree, affected files summary, safe-point relation, and recovery target; and every run with SCM side effects shows at least partial receipts instead of opaque generic history rows.
- Cross-surface deep links from Orchestrator to Source Control, GitHub Actions, Docker Manager, or Kubernetes owner panels must reopen with stable context after restart. When lineage is incomplete, Orchestrator labels the view as partial lineage; it must never silently omit missing hops or invent repo, worktree, branch, head, receipt, or recovery targets.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md


#### Promotion classes and gate evidence
- Promotion classes are `lane_to_package`, `package_to_seam_available`, and `seam_complete`.
- Each promotion class carries exact gate and evidence expectations: promotion gate verdict, lineage refs, required verification evidence, and promotion receipt refs.

#### Source Control and worktree handshake
- Orchestrator remains the lane-pool operational truth, while Source Control is the concrete repo/worktree operator.
- Worktree rows display owning package, lane, and run refs together with lifecycle state and blocked/recovery state.

### glossary/help references

#### Glossary and help governance
- Orchestrator depends on Glossary coverage for rewrite-critical objects, states, and trust terms.
- Help is layered as inline help, context help, and canonical help-entry pages while canonical term names stay stable.

#### Help entry template and related-concept clusters
- Every help entry follows one template: canonical term, trigger conditions, operator meaning, primary routes, related concepts, and recovery guidance.
- Related-concept clusters provide the dedicated linking structure for concept-to-concept navigation.

### Owner-first canonicalization order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.

### Shared governance/runtime record envelope
- One shared record envelope carries canonical lineage refs plus artifact and evidence refs.
- Record objects stay distinct from artifacts, receipts, and rendered summaries.

### Concern record family definition
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- The owner contract defines `concern_id`, `project_id`, run refs, scope refs, evidence/source refs, lineage refs, severity, category, status, and governance metadata.
- `weak_integration` is the concern category for owner/consumer seams whose live owner record, consumer projection, or corroborating evidence is absent, stale, degraded, or inconsistent; it does not create a separate warning family outside the concern lifecycle.

### Concern lifecycle and resolution kinds
- Lifecycle states are exactly `active`, `acknowledged`, `resolved`, and `dismissed`.
- `resolution_kind` values are exactly `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`.

### Concern lifecycle owner section
- This owner section defines explicit semantics for `active`, `acknowledged`, `resolved`, and `dismissed`.
- It carries `resolution_kind`, including `accepted_risk`, together with a concern-action confirmation matrix for acknowledge, dismiss, resolve, and lineage-edit operations.
- The concern lifecycle transition matrix is owner prose here: `active -> acknowledged` records operator awareness without changing truth, `active | acknowledged -> resolved` requires evidence that the underlying issue changed, `active | acknowledged -> dismissed` requires a rationale that the concern presentation is intentionally hidden or rejected as actionable framing, and `resolved | dismissed -> active` is the reopen path when new evidence invalidates the prior resolution or dismissal. Resolved and dismissed guard rules require current projection data or direct record revalidation before mutation, and every transition persists through `concern_record` plus `concern_projection` linkage rather than a page-local status flag.
- Weak-integration concern taxonomy uses the canonical enum `wiring | workflow | state | gui | design`. `wiring` covers missing command, route, event, or handler joins; `workflow` covers broken or under-specified multi-step execution paths; `state` covers stale, degraded, or contradictory owner/projection state; `gui` covers consumer-surface behavior that fails to expose the owner truth; and `design` covers unresolved owner/consumer responsibility gaps.
- Inspector and full-record behavior stay split. Summary/action inspectors show compact currentness, allowed actions, rationale, and links; dense full-record views open through canonical route/open contracts to the underlying concern, source event, projection, or governance record instead of expanding giant inline records inside the inspector.
- Legacy import and search aliases `/concern`, `/dismissed`, `/guard/persistence`, and `trust-state` resolve to this concern record/projection lifecycle owner; they are compatibility aliases only and do not create separate route, status, or storage families.
- Legacy import and search labels `Concern model — formal lifecycle section`, `Seam weak-integration concern taxonomy`, `Inspector / full-record behavior split`, and `Trust/concern projection handoffs` map to the lifecycle, taxonomy, inspector, and projection rules above; they are compatibility labels only and do not create separate owner sections.

### Concern owner vs creator vs resolver separation
- `owner_kind` / `owner_ref` are separate from `created_by_kind` / `created_by_ref`.
- Resolver authority is modeled separately from both owner and creator.
- Ownership may change without changing concern identity.

### Concern source-event vs record vs projection split
- `concern_source_event_ref`, `concern_record`, and `concern_projection` are separate structural layers.
- Source events describe raw sightings, records describe durable state, and projections describe rendered consumer views.

### Recommended minimum concern record shape
- Required fields: `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`, `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`, `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`.
- `blocking_effect` stays explicitly separate from `severity`.

### Concern ownership / authority direction
- Concern owner surfaces are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- `concern resolver` is distinct from owner and source roles.
- Concern ownership can be reassigned without changing concern identity.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Orchestrator_Page.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### OP-002 - Orchestrator Scope Page Shell And Owner Boundary

```yaml
plan_unit_id: OP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator owns scheduling, concern tracking, blocked-state handling, runtime identity presentation, page layout and controls, view-model projections, and run-control intents for the Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger tab set, while runtime, storage, and scheduler contracts own canonical truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 mixes page shell, runtime ownership, compatibility, routing, and governance material; this unit covers the scope and owner-boundary subset.
depends_on: []
unblocks: []
acceptance_criteria:
  - Orchestrator remains distinct from the UI, CLI, and external providers.
  - The page shell is a seven-tab single-page surface over node/package/seam/lane-aware runtime state.
  - The live tab set is Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Tier, widget, and legacy tab labels remain compatibility inputs rather than execution authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_scope_owner_boundary
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
  - "Orchestrator Page -- Single-Page 6-Tab Specification"
  - "/page-shell"
  - "six-tab single-page surface"
  - "seven-tab single-page surface"
  - "Tiers"
  - "Progress/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress/Plan Compile/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress"
  - "Plan Compile"
  - "Seams"
  - "Node Graph"
  - "History"
  - "Evidence"
  - "Ledger"
  - "package/lane aware"
negative_constraints:
  - "Orchestrator must not define page-local runtime authority for enums, event semantics, or scheduler truth."
  - "Tiers must not remain a primary tab/page authority."
owner_hints:
  - Plans/Orchestrator_Page.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles Orchestrator containerized-host projection obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### OP-028 - Orchestrator Containerized Host Projection And Routes

```yaml
plan_unit_id: OP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator surfaces containerized-host readiness, assignment, blocker, access, and receipt projections for runs and
  attempts that use host capability, while Docker Manager, Docker/Hosts, Executor, Run Modes, ATS, Permissions, FileSafe,
  Tools, and Runtime Artifacts retain their owner roles. Orchestrator may show host readiness chips, blocked-action
  payloads, active assignments, access URL pivots, receipt/evidence links, and Docker/Hosts routes from run details, but
  it does not own local Docker, Kubernetes, SSH, shell, file, or cleanup mutation semantics and does not create a new
  top-level Orchestrator tab for Hosts. Stale projections cannot authorize sensitive actions; all mutation or launch
  requests resolve through HostCapabilityCommand and owner receipts.
gui_related: true
gui_classification_reason: This PlanUnit defines visible Orchestrator projections, chips, pivots, and routes.
depends_on: [F3-410, UCC-105, GRS-032, EP-109, RAP-042]
unblocks: [RGV-015]
acceptance_criteria:
  - Orchestrator run details can display host readiness, active assignments, blocked_reason_code, access pivots, and receipt links.
  - Orchestrator routes to Docker/Hosts and Runtime Artifacts without owning Docker/Kubernetes mutation or cleanup policy.
  - No new top-level Orchestrator Hosts tab is created by this compile.
  - Stale or missing host projections degrade or block the visible affordance rather than authorizing sensitive actions.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator host-projection fixture
risk_class: orchestrator_host_projection_authority_drift
reasoning_tier: standard
context_scope: orchestrator_containerized_host_projection
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - future Orchestrator run details and routes
node_compile_hint:
  mode: orchestrator_host_projection_routes
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0011
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#docker_hosts_gui_ia
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
source_atom_ids: [atom-0011, atom-0040, atom-0041, atom-0073, atom-0075, atom-0079, atom-0080, atom-0081]
preserved_exact_tokens:
  - "no new top-level Orchestrator tab"
  - "orchestrator/executor(or anything adjacent)"
  - "Orchestrator/Executor run details"
  - "Docker/Hosts"
  - "HostCapabilityCommand"
negative_constraints:
  - Do not make Orchestrator the owner of local Docker, Kubernetes, SSH, shell, file, or cleanup mutation semantics.
  - Do not create a new top-level Orchestrator Hosts tab.
  - Do not let stale projections authorize sensitive actions.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

### OP-003 - Governance Runtime Record Envelope

```yaml
plan_unit_id: OP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Governance and runtime records use a shared record envelope with family-specific payload blocks so records remain distinct from artifacts, receipts, and rendered summaries.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains record-envelope examples interleaved with GUI and ownership material.
depends_on: []
unblocks: []
acceptance_criteria:
  - Shared lineage, artifact, and evidence refs stay in the record envelope.
  - Concern, promotion, recovery, and review payloads remain structured family payloads.
  - Rendered summaries do not replace durable records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: record_envelope_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0067
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "/blocking/HITL"
  - "resolution_thread"
  - "safe-point"
  - "promotion_class"
  - "revoked"
  - "/reopened"
  - "rendered summaries"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-004 - Concern Record Lifecycle And Authority Contract

```yaml
plan_unit_id: OP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Concern is a first-class durable record with exact lifecycle states, resolution_kind values, owner/creator/resolver separation, source-event/record/projection layers, required minimum fields, and explicit authority direction.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0070 includes both lifecycle/backend rules and inspector/UI behavior; this unit covers the lifecycle and authority side.
depends_on: []
unblocks: []
acceptance_criteria:
  - Concern lifecycle states remain exactly active, acknowledged, resolved, and dismissed.
  - resolution_kind values remain explicit and do not collapse distinct outcomes.
  - Concern identity survives owner reassignment and projection changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_lifecycle_identity_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0005
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0030
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0031
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0049
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0052
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0068
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0069
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0071
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0073
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0074
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "active"
  - "acknowledged"
  - "resolved"
  - "dismissed"
  - "resolution_kind"
  - "weak_integration"
  - "wiring | workflow | state | gui | design"
  - "concern_source_event_ref"
  - "concern_record"
  - "concern_projection"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-005 - Concern Actions Inspectors And Mutation Affordances

```yaml
plan_unit_id: OP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Concern actions expose authority, confirmation level, rationale requirements, reversibility, audit fields, compact inspectors, route-open full records, and narrow user-facing affordances.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0070 mixes lifecycle rules with inspector/full-record presentation; this unit covers the GUI/action side.
depends_on: []
unblocks: []
acceptance_criteria:
  - Acknowledge, dismiss, resolve, and structural lineage edits remain distinct actions.
  - Full record inspection routes to canonical records instead of expanding giant inline records.
  - User-facing actions remain narrow and true HITL approvals stay separate from generic runtime actions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_action_authority_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0035
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0039
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0051
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "audit_fields"
  - "confirmation_level"
  - "allowed_actor_kinds"
  - "open evidence"
  - "open history"
  - "open ledger"
  - "open resolution thread"
  - "approve/reject"
  - "true `/HITL` boundaries"
negative_constraints:
  - "Inspectors must not expand giant inline full records inside compact UI."
  - "Runtime `/overseer` actions must not become generic user-facing actions."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-006 - Projection Trust Freshness And Wait Semantics

```yaml
plan_unit_id: OP-006
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Projection state, freshness, direct revalidation, degraded fallback, stale-observation waits, and timeout display are governed by canonical runtime and storage projections rather than elapsed-time guesses.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains trust/fallback rules mixed with page and concern material.
depends_on: []
unblocks: []
acceptance_criteria:
  - Mutation-capable projections carry projection_state, last_observed_at, source_event_ref, and revalidation_route.
  - Stale, degraded, and unavailable projections disable mutation unless the owner surface performs direct revalidation.
  - Wait and timeout cards show canonical retained timeout_class and route recovery through stored blocked episodes or receipts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_trust_staleness_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0037
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "current"
  - "refreshing"
  - "stale"
  - "degraded"
  - "unavailable"
  - "/weak-integration/freshness"
  - "projection_state"
  - "timeout_class"
  - "hard execution timeout"
  - "stale-observation"
negative_constraints:
  - "Do not infer skipped/failed from stale observation alone."
  - "Do not create new blocked reason, failure class, or receipt identity from wait-copy presentation."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-007 - Object First Routing And Focused Run Context

```yaml
plan_unit_id: OP-007
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Search, command-palette, drill-down, and cross-tab deep links route by stable object identity, focused run context, destination tab, selected object id, optional filters, and inspector detail targets.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes route identity examples alongside broader scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Concern search results are run-aware and object-first.
  - Deep links stay coherent on focused_run_id and focus_mode rather than jumping to active_run_id implicitly.
  - Search results preserve route targets rather than highlight-only matches.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_identity_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0044
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "active_run_id"
  - "focused_run_id"
  - "focus_mode = live | historical"
  - "/object-first"
  - "destination tab"
  - "selected object id"
  - "concern_id"
negative_constraints:
  - "Do not collapse similarly named seams, packages, nodes, or work packages across unrelated runs."
  - "Do not route with highlight-only matches."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-008 - Notification Escalation And Blocked Owner Routing

```yaml
plan_unit_id: OP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Notifications, attention rows, blocked-owner summaries, escalation levels, quieting behavior, and surface routing are determined by severity, execution impact, blocked owner, persistence, and projection trust.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 and S0058 combine escalation, help, and project taxonomy material.
depends_on: []
unblocks: []
acceptance_criteria:
  - History receives chronological notifications while Progress and Dashboard show active warnings, attention, blocked states, severity markers, and badges.
  - Thread, chat, or input surfaces are reserved for user decisions.
  - Blocked-owner summaries identify a primary blocked owner or attention owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: notification_escalation_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0054
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0057
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "Info"
  - "Warning"
  - "Attention"
  - "Action Required"
  - "Runtime"
  - "Package Overseer"
  - "Seam Overseer"
  - "External Resource"
  - "info"
  - "watch"
  - "attention_required"
  - "blocked"
  - "escalated"
negative_constraints:
  - "Quiet windows must never suppress canonical blocked episodes."
  - "Dismissed presentation must not clear canonical blocked episodes that remain active."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-009 - Project Summary Attention Account Pressure And Switch History

```yaml
plan_unit_id: OP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Project summary, project attention item, account pressure episode, and account switch event records remain durable, project-scoped, and split between current-state and historical-state facts.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes project, attention, and account examples mixed with broader scope material.
depends_on: []
unblocks: []
acceptance_criteria:
  - project_summary carries activity_state, attention_state, health_state, owner, and projection-trust disclosure.
  - project_attention_item carries a primary route payload and projection-trust disclosure consumable across surfaces.
  - account_switch_reason is split into pressure cause, switch outcome, and historical lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: project_projection_account_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0056
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0057
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "project_state:v1:{project_id}"
  - "project_summary"
  - "project_attention_item"
  - "account_pressure_episode"
  - "account_switch_event"
  - "account_switch_reason"
  - "projection_trust_state"
negative_constraints:
  - "Do not overload account_switch_reason with current and historical facts in one field."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-010 - Promotion Review And Gate Evidence

```yaml
plan_unit_id: OP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Promotion classes, review records, gate facts, evidence expectations, decision outcomes, and revocation or reopen lineage remain explicit package, seam, lane, and governance data.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains promotion gate and review references inside broad scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Promotion classes are lane_to_package, package_to_seam_available, and seam_complete.
  - Promotion gate facts remain separate from generic promotion state.
  - Review records preserve scope refs, effective reviewer identity, findings, verdict, decision, evidence links, and timestamps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: promotion_gate_evidence_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "lane_to_package"
  - "package_to_seam_available"
  - "seam_complete"
  - "GUI readiness"
  - "accepted_risk"
  - "superseded"
  - "review_id"
  - "verdict"
  - "decision"
negative_constraints:
  - "Do not collapse gate facts into a generic promotion state."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-011 - Progress Widget Hostability And Catalog

```yaml
plan_unit_id: OP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Widget-composed Orchestrator content is restricted to Progress, and the 13-widget Progress catalog, drill mappings, labels, action labels, alert taxonomy, event taxonomy, and condition-aging behavior are preserved.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes stale widget compatibility while S0040 carries the catalog.
depends_on: []
unblocks: []
acceptance_criteria:
  - Only Progress remains widget-composed inside Orchestrator.
  - The progress catalog preserves all 13 widget IDs and drill destinations.
  - Progress state/action/alert/event taxonomies transfer with the catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: progress_widget_catalog_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0040
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "orchestrator:progress"
  - "progress.run-overview"
  - "progress.current-task"
  - "progress.blocked-concerns"
  - "progress.account-switches"
  - "queued|running|attention_required|blocked|recovering|degraded|complete"
  - "FinalGUISpec Appendix C"
negative_constraints:
  - "Tiers-first compatibility must not govern Progress widgets."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-012 - Artifact Receipts And External Blocked State Pivots

```yaml
plan_unit_id: OP-012
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Artifact routing, external receipts, blocked cards, mutable target ownership, terminal-state precedence, and domain blocked payloads route to owner surfaces with retained lineage and explicit missing-link states.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 has artifact and authority fragments while S0041-S0042 carry detailed receipt rules.
depends_on: []
unblocks: []
acceptance_criteria:
  - Cost-bearing artifact routing uses usage_event_ref rather than timestamp heuristics.
  - Blocked cards expose publish-capable chains, missing-link explanations, and owner-surface pivots.
  - SCM, Actions, Docker, and Kubernetes blocked payloads carry domain-specific blocker fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_receipt_lineage_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0029
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0041
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0042
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "usage_event_ref"
  - "publish_result_id"
  - "missing-link"
  - "indeterminate_remote_outcome"
  - "owned_by_run"
  - "dirty_worktree"
  - "worktree_conflict"
  - "Replay from last known good"
negative_constraints:
  - "Do not omit missing downstream links or invent lineage."
  - "Do not dispatch Actions-dependent steps from stale readiness snapshots."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-013 - Owner Surface Command Routing

```yaml
plan_unit_id: OP-013
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator command exposure for recovery and navigation is route-open only into owner surfaces, while runtime mutation recovery maps through ordered allowed_action_ids to cmd.runtime commands.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Orchestrator may surface route-open commands into Source Control, GitHub Actions, Docker Manager, Kubernetes, and receipt views.
  - Route payloads carry run_id, node_id, blocked_sequence, receipt_ref, and target owner context where available.
  - Mutation recovery remains owned by runtime commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_surface_command_overreach
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0043
preserved_exact_tokens:
  - "cmd.orchestrator.open_in_source_control"
  - "cmd.orchestrator.open_in_github_actions"
  - "cmd.orchestrator.open_in_docker_manager"
  - "cmd.orchestrator.open_kubernetes"
  - "cmd.orchestrator.open_receipt"
  - "allowed_action_ids[]"
  - "cmd.runtime.*"
negative_constraints:
  - "Orchestrator MUST NOT mint panel-local mutation semantics for Source Control, GitHub Actions, Docker Manager, Kubernetes, evidence, or artifact actions."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-014 - Debug Resume Target Revalidation

```yaml
plan_unit_id: OP-014
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Before resuming a Debug investigation, Orchestrator revalidates stored session identity and remote authority, then keeps the run attention_required when reconnection or target selection is required.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - dev_session_id, browser_session_id, DAP session identity, and remote authority are checked against stored route and runtime identity.
  - Recoverable stale identity yields session_reconnect_required.
  - Missing deterministic rebinding target yields target_selection_required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_resume_identity_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0046
preserved_exact_tokens:
  - "dev_session_id"
  - "browser_session_id"
  - "DAP session identity"
  - "attention_required_reason_code = session_reconnect_required"
  - "attention_required_reason_code = target_selection_required"
negative_constraints:
  - "Orchestrator must not silently mint or infer a different target identity to continue execution."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-015 - Source Control And Worktree Boundary

```yaml
plan_unit_id: OP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator remains lane-pool operational truth while Source Control remains the concrete repo and worktree operator; rows, review routes, conflict actions, receipts, and cross-surface links preserve run, package, lane, worktree, repo, branch, head, receipt, and recovery lineage.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 carries worktree display compatibility while S0060-S0062 carry the owner boundary and handshake.
depends_on: []
unblocks: []
acceptance_criteria:
  - Worktree rows display owning package, lane, run refs, lifecycle state, and blocked/recovery state.
  - Conflict cards route to Source Control Changes through cmd.source_control.open_conflict.
  - Cross-surface links reopen with stable context after restart or label partial lineage when incomplete.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_boundary_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0062
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "repo/worktree/branch/head"
  - "Open Conflict Assistant"
  - "cmd.source_control.open_conflict"
  - "partial lineage"
  - "lane-pool operational truth"
  - "concrete repo/worktree operator"
negative_constraints:
  - "Never silently omit missing hops or invent repo, worktree, branch, head, receipt, or recovery targets."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-016 - Owner First Canonicalization And Reconciliation Readiness

```yaml
plan_unit_id: OP-016
unit_type: validation_rule
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Owner-doc corrections precede consumer and mirror cleanup, open owner-decision guardrails remain explicit, and reconciliation readiness is classified into still-structural gaps, spec-integrity failures, and plain cleanup buckets.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes design-open and authority presentation guardrails in broad scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Owner corrections happen before consumer and mirror cleanup.
  - Fidelity audit reruns after owner and consumer corrections are in place.
  - Open owner decisions remain visible until their owning docs close them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonicalization_false_closure
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0066
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "owner-doc corrections"
  - "fidelity audit"
  - "design-open"
  - "/owner"
  - "still-structural gaps"
  - "spec-integrity failures"
negative_constraints:
  - "Do not hide owner decisions or collapse authority presentation to one monolithic Puppet Master center."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-017 - Glossary And Help Governance

```yaml
plan_unit_id: OP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Glossary and help coverage use stable canonical terms, layered help, a single help-entry template, related-concept clusters, and asymmetric lane/worktree explanations across Orchestrator and Source Control.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes lane/worktree help asymmetry while S0063-S0065 carry the help structure.
depends_on: []
unblocks: []
acceptance_criteria:
  - Glossary covers rewrite-critical objects, states, and trust terms.
  - Help is layered as inline help, context help, and canonical help-entry pages.
  - Help entries preserve canonical term, trigger conditions, operator meaning, routes, related concepts, and recovery guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: help_glossary_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0063
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0064
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0065
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "inline help"
  - "context help"
  - "canonical term"
  - "trigger conditions"
  - "operator meaning"
  - "related concepts"
  - "lane"
  - "worktree"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-018 - Orchestrator Wide Scale Contract

```yaml
plan_unit_id: OP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Dense Orchestrator tabs require slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors across tabs.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Slice-based loading is mandatory across dense tabs.
  - Virtualization and lazy expansion are cross-tab requirements.
  - Scale is not limited to the graph tab.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dense_tab_scale_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0055
preserved_exact_tokens:
  - "slice-based loading"
  - "virtualization"
  - "lazy expansion"
  - "demand-loaded inspectors"
  - "cross-tab contract"
negative_constraints:
  - "Scale must not be treated as a graph-tab-only concern."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-019 - Owner Consumer Map And Migration Boundary

```yaml
plan_unit_id: OP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  This standardized Orchestrator Page document keeps stated owner and consumer boundaries, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Owner / Consumer Map remains reporting structure for owner and consumer boundaries.
  - Cross-doc ownership follows ContractRefs and boundary notes already present in source text.
  - Plan Document System and Bootstrap Planning Migration references are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_consumer_map_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0075
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "source-preserving standardization"
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
owner_hints:
  - Plans/Orchestrator_Page.md
```
### OP-001 - Orchestrator Page Retired Source-Preserving Bridge

```yaml
plan_unit_id: OP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  OP-001 is a retired source-preserving bridge for generated PDS PlanUnit and Migration Coverage audit material. Product prose from Orchestrator_Page-S0001 through Orchestrator_Page-S0076 is covered by fine-grained OP-002 through OP-019; Orchestrator_Page-S0077 is retired bridge lineage and Orchestrator_Page-S0078 is Migration Coverage metadata. No residual source_preserving_planunit product coverage remains for Plans/Orchestrator_Page.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - OP-002
  - OP-003
  - OP-004
  - OP-005
  - OP-006
  - OP-007
  - OP-008
  - OP-009
  - OP-010
  - OP-011
  - OP-012
  - OP-013
  - OP-014
  - OP-015
  - OP-016
  - OP-017
  - OP-018
  - OP-019
unblocks: []
acceptance_criteria:
  - OP-001 does not override OP-002 through OP-019 for Orchestrator_Page-S0001 through S0076.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Orchestrator_Page.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: orchestrator_page_residual_bridge
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0077
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0078
preserved_exact_tokens:
  - "OP-001"
  - "Orchestrator Page -- Single-Page 6-Tab Specification Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "PlanUnits"
  - "Migration Coverage"
negative_constraints:
  - "OP-001 must not be used as implementation-ready product coverage for spans now mapped to OP-002 through OP-019."
owner_hints:
  - Plans/Orchestrator_Page.md
```

## Migration Coverage

Original hash: `a19c226e4d254af53de956bd11bffd37105c2305ccafa3144ebf2f1de92f4c6b`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Orchestrator_Page-S0001` through `Orchestrator_Page-S0076` are preserved in place and covered by fine-grained PlanUnits `OP-002` through `OP-019` or explicit structural dispositions. `Orchestrator_Page-S0077` is retired bridge lineage for the former broad `OP-001` source-preserving bridge, and `Orchestrator_Page-S0078` is Migration Coverage metadata. No residual `source_preserving_planunit` product coverage remains for `Plans/Orchestrator_Page.md`. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### OP-020 - Owner Section Hydration And Contracts Boundary Compile Addendum

```yaml
plan_unit_id: OP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator_Page owns page layout, controls, view-model projections, routing presentation, focused run and historical routing,
  seven-tab behavior, notification display, concern inspectors, and user-visible action affordances. It consumes Contracts_V0 for durable
  concern ids, route/open primitives, blocked episode identity, approval scope, and approver identity. Its top owner-section headings must
  be hydrated from OP PlanUnits and local sections instead of remaining hollow headers.
gui_related: true
gui_classification_reason: Orchestrator_Page governs user-visible pages, tabs, controls, projections, and routing presentation.
depends_on: [OP-002, OP-003, OP-004, OP-005, OP-006, OP-007, OP-008, CV-279]
unblocks: []
acceptance_criteria:
  - The seven canonical tabs remain Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Tiers remains compatibility/search vocabulary only, not the live Orchestrator tab model.
  - Contract primitives are consumed from Contracts_V0 instead of redefined locally.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Orchestrator owner-section review
risk_class: orchestrator_owner_hollowing
reasoning_tier: standard
context_scope: orchestrator_page_owner_sections
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: orchestrator_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0018
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0055
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0056
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0057
  - source_ref:Plans/Orchestrator_Page.md:4
  - source_ref:Plans/Orchestrator_Page.md:55
preserved_exact_tokens: ["Progress", "Plan Compile", "Seams", "Node Graph", "Evidence", "History", "Ledger", "Tiers", "six-tab behavior", "Progress-only widget hostability", "focused_run_id", "focus_mode = live | historical"]
negative_constraints:
  - Do not let Orchestrator_Page redefine durable contract primitives owned by Contracts_V0.
  - Do not make the dense Scope section the only readable owner body.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```

### OP-021 - Priority Cleanup Scope Guard

```yaml
plan_unit_id: OP-021
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Priority-1 cleanup references involving Contracts_V0, Orchestrator_Page, Executor_Protocol, human-in-the-loop, WorktreeGitImprovement,
  FinalGUISpec, UI_Command_Catalog, FileManager, Runtime_Artifacts_Panel, and storage-plan are routing evidence, not automatic scope expansion.
  Orchestrator compile work may add owner-section anchors and consumer pointers, but must return to the ledger if it discovers a true product
  decision outside the accepted Fable recovery atoms.
gui_related: true
gui_classification_reason: This guard governs user-visible Orchestrator cleanup scope and adjacent GUI consumers.
depends_on: [OP-020]
unblocks: []
acceptance_criteria:
  - Adjacent docs are not edited solely because they appear in a priority cleanup list.
  - Source-first owner routing remains explicit for every adjacent cleanup reference.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-001-part-2-cleanup-fable-audit
  - python3 scripts/pm-plan-index.py validate
risk_class: cleanup_scope_creep
reasoning_tier: standard
context_scope: cross_doc_cleanup_boundary
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: scope_guard, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0058
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0075
  - source_ref:chat:contracts-orchestrator-cluster
preserved_exact_tokens: ["Priority-1 cleanup", "cannot safely coexist with the new model", "consumer_reference_only", "source-first", "stop and return to the ledger"]
negative_constraints:
  - Do not broaden this compile into unrelated Priority-1 cleanup work.
  - Do not create WorkNodes, NodeSeeds, executable queues, or production tasks from this cleanup list.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md]
```

## Ledger Compile Addendum - pldg-20260616-002

### OP-022 - GoalRun WorkGraph And Verification Projection

```yaml
plan_unit_id: OP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator page projects each GoalRun through the existing seven-tab shell with GoalRun and WorkGraph overlays; the Plan Compile tab is used for plan-to-code compile projection and remains separate from Executor execution progress. The Goal header shows goal_id, objective, phase, scope, authority/write surface, budget/cost, and certification status. Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger each show only their scoped projections: Plan Compile shows compile projection and handoff readiness, while the execution tabs show WorkGraph dependencies, WorkNode state, SubagentWaves, concerns/blockers, VerificationCycles, DefectBundles, RepairWorkNodes, receipts, replans, source-lineage refs, and certification events without becoming scheduler truth. The projected flow mirrors GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification as a projection over owner records, not scheduler truth. VerificationCycle projection rows expose attempt, status failed | passed | blocked, findings, and defect_signatures when contract/storage records provide them. Projected GoalRun and WorkNode statuses include ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, with contract, storage, permission, worktree, and model-owner records remaining authoritative for the underlying fields. Old fixed-hierarchy, six-tab, and tier-era Orchestrator labels may survive only as compatibility/search aliases for search or import; active projection prose uses GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, and Receipt, and stale tier labels are not active canonical runtime semantics.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page header, tabs, projections, side-drawer content, and status surfaces.
depends_on: [OP-020, GRS-026, GRS-027, EP-098, OSI-428]
unblocks: [RGV-012, F3-394, RAP-027]
acceptance_criteria:
  - The seven canonical tabs remain Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Plan Compile is a canonical Orchestrator tab for plan-to-code compile projection, not an Executor execution dashboard.
  - GoalRun, WorkGraph, WorkNode, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt are visible as projections where relevant.
  - Subagents projections expose active waves, bounded task, model/capability lane, input boundaries, output status, and failure/retry state.
  - Orchestrator projection preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification without becoming scheduler truth.
  - VerificationCycle projection rows can show attempt, status failed | passed | blocked, findings, and defect_signatures from contract/storage records.
  - GoalRun and WorkNode status projections distinguish ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped.
  - Old fixed-hierarchy and tier-era Orchestrator labels remain compatibility/search aliases only; they do not replace GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, or Receipt terminology in active projection prose.
  - Sensitive Orchestrator mutations require current or directly validated projections; stale projections cannot authorize sensitive actions.
  - True blockers distinguish owner, legal next actions, escalation target, projection freshness, reversibility, and audit trail.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator page surface review
risk_class: orchestrator_projection_drift
reasoning_tier: high
context_scope: orchestrator_page_goalrun_projection
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/FinalGUISpec.md, Plans/Run_Graph_View.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Models_System.md]
node_compile_hint: {mode: orchestrator_goalrun_projection, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0012
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0023
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0024
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0026
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0057
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0059
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0060
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0061
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0062
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0068
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0074
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0077
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0026
preserved_exact_tokens:
  - "Goal header"
  - "goal_id"
  - "objective"
  - "phase"
  - "authority/write surface"
  - "Progress"
  - "Seams"
  - "Node Graph"
  - "Evidence"
  - "History"
  - "Ledger"
  - "ready"
  - "running"
  - "provisional_success"
  - "verifying"
  - "failed_verification"
  - "repairing"
  - "certified"
  - "failed"
  - "blocked"
  - "cancelled"
  - "stopped"
  - "GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification"
  - "active waves"
  - "bounded task"
  - "model/capability lane"
  - "input boundaries"
  - "output status"
  - "failure/retry state"
  - "attempt"
  - "failed | passed | blocked"
  - "defect_signatures"
  - "compatibility/search aliases"
  - "capability_lane"
  - "agent_role"
  - "Receipt"
negative_constraints:
  - Do not treat the WorkGraph projection as the canonical dispatcher.
  - Do not allow stale projections to authorize sensitive mutations.
  - Do not keep stale tier labels as active canonical runtime semantics.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Models_System.md]
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### OP-023 - Plan Compile Tab Projection

```yaml
plan_unit_id: OP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator has a dedicated Plan Compile tab for the long design-only and later-enabled process of converting approved Plans into non-executable NodeSeed candidate drafts, WorkGraph drafts, and WorkNode request drafts. The tab projects compile_id, current_stage, stage_timeline, current activity, PlanUnits processed, candidate drafts, WorkNode request drafts, dependency/seam graph, test capability requirements, model lane routing, GUI/high-effort counts, Auditor loop status, throughput, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness. It consumes Plan_To_Node_Compilation, Models_System, Automated_Testing_System, Executor_Protocol, and Goal_Runtime_System records without becoming compiler or scheduler authority.
  The tab groups stage progress, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness as progress/speed/ETA/status panels.
  The tab can label the compile as Plans to WorkNodes, but Plan Compile tab scope excludes Executor execution progress except summarized handoff readiness or final handoff status.
gui_related: true
gui_classification_reason: This unit defines a user-visible Orchestrator tab, status panels, progress projection, and activity details.
depends_on: [OP-022, PNC-010, PNC-014, MS-110, ATS-001, GRS-028]
unblocks: [F3-397, RGV-013, RAP-029]
acceptance_criteria:
  - Plan Compile tab shows progress/speed/ETA/status panels for progress, speed, stage status, counts, blockers, warnings, ETA confidence, model lane status, test capability status, and handoff readiness.
  - The tab is scoped to Plans-to-node draft projection and does not display Executor code-generation progress except final handoff status.
  - Orchestrator consumes owner records and does not become PlanCompile or Executor authority.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator Plan Compile tab review
risk_class: gui_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_plan_compile_tab
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/FinalGUISpec.md, Plans/Run_Graph_View.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: orchestrator_plan_compile_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0007
  - pldg-20260617-001-plans-to-code-handoff:atom-0050
  - pldg-20260617-001-plans-to-code-handoff:atom-0052
  - pldg-20260617-001-plans-to-code-handoff:dec-0022
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "Plan Compile tab"
  - "stage timeline"
  - "throughput"
  - "speed"
  - "ETA confidence"
  - "progress/speed/ETA/status panels"
  - "NodeSeeds drafted"
  - "WorkNode requests drafted"
  - "Plan Compile tab scope"
  - "Executor execution progress"
negative_constraints:
  - Do not overload Plan Compile tab with WorkNode execution/code-generation details beyond handoff status.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### OP-024 - Plans-To-Code Execution Observability Separation

```yaml
plan_unit_id: OP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Existing Orchestrator execution views remain responsible for queued WorkNodes, active WorkNodes, blocked WorkNodes, completed WorkNodes, model lanes, worktrees, safe points, test runs, browser/device sessions, repair loops, Auditor status, GitHub PR/Actions when configured, and final certification progress. Progress, Node Graph, Evidence, History, Ledger, Runtime Artifacts, Source Control, and Worktrees consume execution receipts and runtime projections after Executor intake; they do not belong inside the Plan Compile tab except as summarized handoff readiness or final handoff status.
  Existing execution views, not Plan Compile, own Executor execution progress after handoff.
gui_related: true
gui_classification_reason: This unit maps visible execution progress to existing Orchestrator tabs and panels.
depends_on: [OP-023, EP-103, GRS-030, RAP-029, W-072]
unblocks: [RGV-013, F3-397]
acceptance_criteria:
  - Execution progress remains on existing execution views.
  - Source-control, testing, repair, GitHub, and completion receipts are visible through execution and evidence surfaces.
    - Plan Compile tab remains focused on node/request draft projection and handoff readiness.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator execution observability review
risk_class: plan_compile_execution_scope_blur
reasoning_tier: high
context_scope: orchestrator_execution_observability
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: orchestrator_execution_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0053
  - pldg-20260617-001-plans-to-code-handoff:dec-0022
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "queued WorkNodes"
  - "active WorkNodes"
  - "worktrees"
  - "safe points"
  - "test runs"
  - "repair loops"
  - "final certification"
negative_constraints:
  - Do not make the Plan Compile tab the code-generation dashboard.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Runtime_Artifacts_Panel.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### OP-025 - Plan Compile Launch, Pending Shell, And Execution Separation

```yaml
plan_unit_id: OP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: 'The default testing visibility policy is show_when_possible: when a meaningful headed or visual surface exists, expose the active test session rather than hiding all verification in background logs. For web work, open the built-in browser or headed browser view and visibly show navigation, clicks, form input, assertions, screenshots, console and network evidence, and pass/fail progression when supported. For Swift and other native work, show the appropriate live preview, hot-reload surface, simulator, emulator, device stream, application window, interaction trace, screenshots, and relevant logs when available and permitted. Users may collapse, detach, background, or leave a visible test session while automation continues; the system preserves session state and does not require the user to watch every action. When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video
  or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. If PlanApproved publication or PlanCompileRun identity has not yet reconciled, the Plan Compile tab shows a pending launch shell tied to the approval command and then binds to the durable compile identity without creating a duplicate. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph
  and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. Long-running topic conversion, audit, repair, final integration, and final audit display active stage, progress counts, assignment counts, findings fixed, current pass, and user-relevant status so the interface never appears stalled. Orchestrator Plan Compile tab shows immutable source pack, current stage, stage timeline, subagent assignments, PlanUnit coverage, NodeSeed candidates, WorkGraph status, WorkNodeRequest count, testing/model/source-control readiness, audit/repair cycles, blockers, receipts, and handoff status. Plan Compile tab owns compilation and handoff progress; after BuildStarted, Orchestrator execution views own WorkNode dispatch, code changes, live testing, repairs, safe points, and completion while Plan Compile remains a historical launch view with an Open Build action. Commands
  for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.'
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
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0092
- pldg-20260618-001-prd-planning-wizard:atom-0093
- pldg-20260618-001-prd-planning-wizard:atom-0094
- pldg-20260618-001-prd-planning-wizard:atom-0095
- pldg-20260618-001-prd-planning-wizard:atom-0096
- pldg-20260618-001-prd-planning-wizard:atom-0107
- pldg-20260618-001-prd-planning-wizard:atom-0108
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0150
- pldg-20260618-001-prd-planning-wizard:atom-0152
- pldg-20260618-001-prd-planning-wizard:atom-0153
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0155
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0107
- atom-0108
- atom-0126
- atom-0145
- atom-0150
- atom-0152
- atom-0153
- atom-0154
- atom-0155
decision_refs:
- dec-0019
- dec-0020
- dec-0028
correction_refs:
- corr-0014
- corr-0012
preserved_exact_tokens:
- show_when_possible
- built-in browser
- clicks
- form input
- assertions
- Swift
- live preview
- simulator
- emulator
- device stream
- collapse
- detach
- automation continues
- Open
- Watch
- interaction timeline
- Orchestrator
- Plan Compile tab
- pending launch
- compile identity
- activation commit
- running
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- progress counts
- audit pass
- stage timeline
- subagent assignments
- WorkNodeRequest count
- Open Build
- BuildStarted
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
negative_constraints:
- Do not mix ongoing WorkNode execution into Plan Compile stage progress.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### OP-026 - Current Project History Documents Runs Surface

```yaml
plan_unit_id: OP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: Orchestrator History is the current-project GUI home for historical wizard-created PRD/Plan documents
  and historical Orchestrator runs. It provides Documents and Runs subviews, dense table rows, structured filter
  chips plus text search, Approved only versus All history controls, an Include archived step inside All history,
  visible archived labels, empty and degraded states, and a read-only stale/out-of-sync projection mode with a visible
  warning. The default Documents view shows final/approved outputs; the user can expand to retained drafts, intermediate
  outputs, superseded rows, exports, and other retained wizard artifacts.
gui_related: true
gui_classification_reason: Defines the user-visible Orchestrator History tab, tables, filters, states, and rows.
depends_on:
- 0PI-062
unblocks:
- UCC-100
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
risk_class: history_surface_drift
reasoning_tier: standard
context_scope: orchestrator_history_surface
implementation_surfaces:
- Plans/Orchestrator_Page.md
- future Orchestrator History tab
node_compile_hint:
  mode: orchestrator_history_gui
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0010
- pldg-20260626-001-feature-name:atom-0011
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0019
- pldg-20260626-001-feature-name:atom-0023
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0032
- pldg-20260626-001-feature-name:atom-0033
- pldg-20260626-001-feature-name:atom-0044
- pldg-20260626-001-feature-name:atom-0045
- pldg-20260626-001-feature-name:atom-0053
- pldg-20260626-001-feature-name:atom-0056
- pldg-20260626-001-feature-name:atom-0061
- pldg-20260626-001-feature-name:atom-0063
- pldg-20260626-001-feature-name:atom-0064
- pldg-20260626-001-feature-name:atom-0152
- pldg-20260626-001-feature-name:atom-0154
- chat:misc-history-scope
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-compare-archive-answers
- chat:history-projection-lifecycle-answer
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#orch-tab-history
- Concepts/PMConcept.html#orch-panel-history
- Concepts/PMConcept.html
source_atom_ids:
- atom-0010
- atom-0011
- atom-0015
- atom-0016
- atom-0019
- atom-0023
- atom-0024
- atom-0025
- atom-0032
- atom-0033
- atom-0044
- atom-0045
- atom-0053
- atom-0056
- atom-0061
- atom-0063
- atom-0064
- atom-0152
- atom-0154
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0007
- dec-0009
- dec-0010
- dec-0011
- dec-0012
- dec-0024
preserved_exact_tokens:
- You will need to figure out the GUI for it too
- see historical documents
- historical orchestrator runs
- It should probably be a tab in the Orchestrator page
- The /page-shell is a seven-tab single-page surface with canonical tabs `Progress`, `Plan Compile`, `Seams`, `Node
  Graph`, `Evidence`, `History`, and `Ledger`
- History
- that is fine
- By default it should show only final/approved outputs
- final/approved outputs
- it can be exapnded by the user to show everything
- show everything
- Orchestrator History
- Documents
- Runs
- It should be locked to the current project.
- retained forever by default
- 'yes'
- retention/archive rules
- dense table columns
- Name
- Type
- Status
- Version
- Created/Approved
- Source
- Last action
- Artifacts
- Approved only
- All history
- per-project toggle/chip
- only after include archived extra
- Include archived
- archived
- stale/out-of-sync state detected and surfaced
- sounds good
- read-only viewing with a warning
- stale/out-of-sync
- exact row schema fields
- search/filter syntax
- view/search/filter
- empty states
- Rebuild
- Orchestrator page
- tab
- Progress
- Plan Compile
- Node Graph
- Evidence
- Ledger
- PMConcept.html
- dense workbench
- activity rail
- page tabs
- resizable chat panel
- floating chat
- compact chips
- role badges
- runtime popovers
- activity cards
negative_constraints:
- Do not leave this as storage-only history with no first-class PM surface.
- Do not make users hunt through raw ledger files or generated artifact paths for normal history access.
- Do not add a new top-level Orchestrator tab without reconciling the existing canonical seven-tab shell.
- Do not bury historical documents under Ledger if the user needs normal browsing and preview rather than raw record
  inspection.
- Do not show every draft/intermediate artifact in the default Documents view.
- Do not hide final/approved artifacts inside raw ledger or export-only views.
- Do not make expanded history indistinguishable from approved/final history.
- Do not omit authority labels such as draft, approved, final, superseded, exported, or generated when showing everything.
- Do not create a separate top-level Orchestrator tab unless a later decision explicitly supersedes this placement.
- Do not merge Documents and Runs into one ambiguous list without clear type separation.
- Do not show global cross-project History by default.
- Do not mix unrelated project histories in the current project History surface.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not default to card-only or sparse rows for this operational history surface.
- Do not omit enough identity/status metadata that similarly named documents or runs become ambiguous.
- Do not make All history a hidden advanced-only affordance.
- Do not persist the control globally across unrelated projects.
- Do not show archived records inline by default in All history.
- Do not make archived records appear without an explicit additional control.
- Do not make archived records appear identical to normal retained all-history records.
- Do not let stale projection state silently drive History, export, or compare behavior without detection.
- Do not hide projection corruption/out-of-sync status in logs only.
- Do not hide stale/out-of-sync status while still showing rows.
- Do not allow normal-looking mutable history actions when the projection is stale.
- Do not allow rows without canonical source refs or project scope.
- Do not make similarly named documents/runs ambiguous.
- Do not omit projection/currentness/authority state when it affects actions.
- Do not require users to learn an advanced query language for MVP.
- Do not hide projection state or actionability filters when they affect what actions are possible.
- Do not make Include archived implicit.
- Do not show a blank table when the user needs to know why no rows are visible.
- Do not make archived/permission/rebuild states indistinguishable from genuinely empty history.
- Do not hide rebuild failure from the user.
- Do not use PMConcept History table columns as the final complete schema when accepted ledger History atoms specify
  deeper document/run/package comparison.
- Do not let concept-only tab naming override future canonical owner placement.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/assistant-chat-design.md
```

### OP-027 - History Actions Deep Compare Export Rebuild

```yaml
plan_unit_id: OP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: History rows expose authority-gated actions without mutating immutable history in place. Document
  rows support Open, Compare versions, Duplicate as draft, Reopen in Wizard, Export, and Send forward when currentness
  allows; run rows support viewing, filtering, artifact/evidence opening, resume/retry where valid, clone-as-new-run,
  export, and raw/ledger inspection. Compare versions is deep in MVP with rendered output, package/source-lineage
  metadata, source ledger atom lineage where applicable, and manifest identity. Export actions support selected
  rows, multi-select bundles, filtered views, zip/archive, JSON, rendered Markdown, rendered HTML, rendered PDF,
  and explicit evidence/redaction profiles. When projection state is stale, compare/export/reopen/send-forward remain
  blocked until Rebuild succeeds.
gui_related: true
gui_classification_reason: Defines user-visible row actions, compare/export controls, rebuild affordance, and blocked
  states.
depends_on:
- OP-026
- SP-219
- CV-295
unblocks:
- UCC-100
- POA-051
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
risk_class: history_action_authority_drift
reasoning_tier: high
context_scope: orchestrator_history_actions
implementation_surfaces:
- Plans/Orchestrator_Page.md
- future History row action menus
node_compile_hint:
  mode: history_action_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0026
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0035
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0043
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- pldg-20260626-001-feature-name:atom-0062
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0017
- atom-0018
- atom-0026
- atom-0027
- atom-0034
- atom-0035
- atom-0038
- atom-0041
- atom-0043
- atom-0057
- atom-0058
- atom-0059
- atom-0062
decision_refs:
- dec-0003
- dec-0004
- dec-0005
- dec-0006
- dec-0007
- dec-0010
- dec-0011
- dec-0012
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
- immutable historical records
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
- permissions/redaction profile details
- raw records/evidence
- explicit evidence/redaction profile
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
- Do not compare by path or title alone when canonical document/package IDs exist.
- Do not let comparison mutate or merge historical records.
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
- Do not silently include raw records or evidence in ordinary exports.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
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
